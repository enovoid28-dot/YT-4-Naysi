/**
 * Card-level caption timing, measured from the VO.
 *
 * Every scene now speaks exactly two sentences, and each sentence is one
 * caption card. The split between them is found as the longest silence inside
 * the take, so a card changes while nobody is talking — never mid-word.
 * Words inside a card only drive the entrance stagger, so a small error there
 * cannot be seen.
 *
 * Output: assets/audio/align.json
 *   { [sceneId]: { onset, gap, split, end, cards: [[{text,accent,start,end}], ...] } }
 */
import fs from 'node:fs';
import path from 'node:path';
import { SCENES } from '../src/script.mjs';
import { readWav, voPath } from '../src/timeline.mjs';

const FRAME = 0.01;
const THRESH = 0.02;
const MERGE = 0.14;

const cleanWord = (w) => w.replace(/\*/g, '');
const isAccent = (w) => w.startsWith('*') || w.endsWith('*');
const splitSentences = (cap) => cap.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
const syllables = (w) => {
  const s = cleanWord(w).toLowerCase().replace(/[^a-z]/g, '');
  let n = (s.match(/[aiueo]+/g) || []).length;
  if (n === 0) n = 1;
  // diphthong "ai"/"au" counts once
  n -= (s.match(/[aiueo][aiueo]/g) || []).length * 0.5;
  return Math.max(1, n) + s.length * 0.08;
};

function envelope(wav) {
  const n = wav.data.length / 4;
  const step = Math.max(1, Math.round(wav.sampleRate * FRAME));
  const out = [];
  for (let i = 0; i < n; i += step) {
    let peak = 0;
    const end = Math.min(n, i + step);
    for (let j = i; j < end; j++) {
      const v = Math.abs(wav.data.readInt16LE(j * 4)) / 32768;
      if (v > peak) peak = v;
    }
    out.push(peak);
  }
  return out;
}

function voiced(env) {
  // adaptive floor: quiet takes still need a threshold that means "talking"
  const sorted = [...env].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.35)] || 0;
  const th = Math.max(THRESH, floor * 2.2);
  const runs = [];
  let cur = null;
  env.forEach((v, i) => {
    const t = i * FRAME;
    if (v > th) {
      if (!cur) cur = { a: t, b: t + FRAME };
      else cur.b = t + FRAME;
    } else if (cur && t - cur.b > MERGE) {
      runs.push(cur);
      cur = null;
    }
  });
  if (cur) runs.push(cur);
  return runs.filter((r) => r.b - r.a > 0.05);
}

/** longest silence whose midpoint sits in the middle 60% of the take */
function findSplit(runs, total) {
  let best = null;
  for (let i = 0; i < runs.length - 1; i++) {
    const gapStart = runs[i].b;
    const gapEnd = runs[i + 1].a;
    const g = gapEnd - gapStart;
    const mid = (gapStart + gapEnd) / 2;
    const rel = mid / total;
    if (rel < 0.2 || rel > 0.8) continue;
    // prefer a long pause that is also close to the middle
    const score = g - Math.abs(rel - 0.5) * 0.5;
    if (!best || score > best.score) best = { gapStart, gapEnd, g, mid, score, rel };
  }
  return best;
}

function placeWords(runs, words, a, b) {
  const inSpan = runs.filter((r) => r.b > a && r.a < b).map((r) => ({ a: Math.max(r.a, a), b: Math.min(r.b, b) }));
  if (!inSpan.length) return words.map((w, i) => ({ w, start: a, end: a + 0.2 }));
  const speech = inSpan.reduce((s, r) => s + (r.b - r.a), 0);
  const wts = words.map((w) => syllables(w));
  const sum = wts.reduce((x, y) => x + y, 0);
  const durs = wts.map((x) => (x / sum) * speech);
  const out = [];
  let ri = 0;
  let cursor = inSpan[0].a;
  words.forEach((w, i) => {
    let d = durs[i];
    while (ri < inSpan.length - 1 && cursor + d > inSpan[ri].b) {
      const room = inSpan[ri].b - cursor;
      if (room < 0.05) {
        ri++;
        cursor = inSpan[ri].a;
        continue;
      }
      if (d - room > 0.12) {
        ri++;
        cursor = inSpan[ri].a;
      } else break;
    }
    if (cursor + d > inSpan[ri].b) d = Math.max(0.05, inSpan[ri].b - cursor);
    out.push({ text: cleanWord(w), accent: isAccent(w), start: +cursor.toFixed(3), end: +(cursor + d).toFixed(3) });
    cursor += d;
  });
  return out;
}

const result = {};
const rows = [];
for (const sc of SCENES) {
  const wav = readWav(voPath(sc.id));
  const env = envelope(wav);
  const runs = voiced(env);
  const onset = runs.length ? runs[0].a : 0;
  const end = runs.length ? runs[runs.length - 1].b : wav.duration;
  const sentences = splitSentences(sc.cap);
  if (sentences.length !== 2) throw new Error(`${sc.id}: expected 2 sentences, got ${sentences.length}`);

  const split = findSplit(runs, end);
  if (!split) throw new Error(`${sc.id}: no pause found between sentences`);
  if (split.g < 0.06) {
    console.warn(`  ! ${sc.id}: only ${split.g.toFixed(3)}s of silence at the sentence break`);
  }

  const w1 = sentences[0].split(/\s+/);
  const w2 = sentences[1].split(/\s+/);
  const cards = [
    placeWords(runs, w1, onset, split.gapStart),
    placeWords(runs, w2, split.gapEnd, end),
  ];
  result[sc.id] = {
    onset: +onset.toFixed(3),
    gap: +split.g.toFixed(3),
    split: +((split.gapStart + split.gapEnd) / 2).toFixed(3),
    end: +end.toFixed(3),
    dur: +wav.duration.toFixed(3),
    cards,
  };
  rows.push({
    id: sc.id,
    dur: wav.duration,
    onset,
    gap: split.g,
    card1: `${cards[0][0].start.toFixed(2)}–${cards[0][cards[0].length - 1].end.toFixed(2)}`,
    card2: `${cards[1][0].start.toFixed(2)}–${cards[1][cards[1].length - 1].end.toFixed(2)}`,
  });
}

const out = path.join(process.cwd(), 'assets', 'audio', 'align.json');
fs.writeFileSync(out, JSON.stringify(result, null, 1));
console.log('scene   dur   onset   gap   card 1        card 2');
for (const r of rows) {
  console.log(
    `${r.id}   ${r.dur.toFixed(2).padStart(5)}  ${r.onset.toFixed(2).padStart(5)}  ${r.gap.toFixed(2).padStart(4)}   ${r.card1.padEnd(12)}  ${r.card2}`,
  );
}
console.log(`\nwrote ${path.relative(process.cwd(), out)}`);
