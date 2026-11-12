/**
 * Card-level caption timing, measured from the VO.
 *
 * Every scene now speaks exactly as many sentences as it shows caption cards.
 * Each card is placed on a real pause in the take, so a card can never change
 * in the middle of a sentence: the boundaries are chosen from the measured
 * silences, snapped to the position the syllable count predicts.
 *
 * Output: assets/audio/align.json
 *   { [sceneId]: { onset, end, gaps: [...], cards: [[{text,accent,start,end}], ...] } }
 */
import fs from 'node:fs';
import path from 'node:path';
import { SCENES } from '../src/script.mjs';
import { readWav, voPath } from '../src/timeline.mjs';

const FRAME = 0.01;
const THRESH = 0.02;
const MERGE = 0.12;
const MIN_GAP = 0.12;

const cleanWord = (w) => w.replace(/\*/g, '');
const isAccent = (w) => w.startsWith('*') || w.endsWith('*');
const splitSentences = (cap) => cap.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
const syllables = (w) => {
  const s = cleanWord(w).toLowerCase().replace(/[^a-z]/g, '');
  let n = (s.match(/[aiueo]+/g) || []).length;
  if (n === 0) n = 1;
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

function level(env) {
  const sorted = [...env].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.35)] || 0;
  return Math.max(THRESH, floor * 2.2);
}

function voiced(env, th) {
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

/** every silence between two voiced runs, with its length and midpoint */
function silences(runs, total) {
  const out = [];
  for (let i = 0; i < runs.length - 1; i++) {
    const a = runs[i].b;
    const b = runs[i + 1].a;
    const len = b - a;
    if (len < MIN_GAP) continue;
    out.push({ a, b, len, mid: (a + b) / 2, rel: (a + b) / 2 / total });
  }
  return out;
}

/**
 * Choose k-1 boundaries. In a read take the longest silences are the sentence
 * breaks, so we take the k-1 longest pauses and put them in order. A pause is
 * only accepted if both cards it creates stay on screen long enough to read.
 */
function chooseBoundaries(gaps, sentences, speechStart, speechEnd) {
  const need = sentences.length - 1;
  if (need <= 0) return [];
  const ranked = [...gaps].sort((a, b) => b.len - a.len);
  const pick = [];
  for (const g of ranked) {
    if (pick.length >= need) break;
    const bounds = [...pick, g.mid].sort((a, b) => a - b);
    const edges = [speechStart, ...bounds, speechEnd];
    let ok = true;
    for (let i = 0; i < edges.length - 1; i++) if (edges[i + 1] - edges[i] < 1.0) ok = false;
    if (!ok) continue;
    pick.push(g.mid);
  }
  // not enough clean pauses: fall back to proportional cuts
  if (pick.length < need) {
    const span = speechEnd - speechStart;
    const weights = sentences.map((s) => s.split(/\s+/).reduce((a, w) => a + syllables(w), 0));
    const totalW = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    pick.length = 0;
    for (let i = 0; i < need; i++) {
      acc += weights[i];
      pick.push(speechStart + (acc / totalW) * span);
    }
  }
  return pick.sort((a, b) => a - b);
}

/**
 * Place the words of one card. Speaking rate is roughly constant in *voiced*
 * time, so the cumulative syllable weight is mapped onto the cumulative voice
 * activity between the card's edges. A pause inside a sentence therefore delays
 * the highlight instead of running ahead of the take.
 */
function placeWords(words, a, b, env, th) {
  const ws = words.map((w) => syllables(w));
  const total = ws.reduce((x, y) => x + y, 0) || 1;
  const i0 = Math.max(0, Math.floor(a / FRAME));
  const i1 = Math.min(env.length, Math.ceil(b / FRAME));
  let voicedTotal = 0;
  for (let i = i0; i < i1; i++) if (env[i] > th) voicedTotal += FRAME;
  const span = Math.max(0.2, b - a);

  // word starts as a fraction of the card, by voiced time
  const starts = [];
  let acc = 0;
  let vi = i0;
  let vAcc = 0;
  for (let w = 0; w < words.length; w++) {
    if (w === 0) {
      starts.push(a);
    } else if (voicedTotal > 0.15) {
      const target = (acc / total) * voicedTotal;
      while (vi < i1 && vAcc < target) {
        if (env[vi] > th) vAcc += FRAME;
        vi++;
      }
      starts.push(Math.min(b - 0.05, (vi - 1) * FRAME + FRAME / 2));
    } else {
      starts.push(a + (acc / total) * span);
    }
    acc += ws[w];
  }
  return words.map((w, i) => {
    const start = starts[i];
    const end = i + 1 < starts.length ? Math.min(starts[i + 1] - 0.015, b) : Math.min(b, start + 6);
    return {
      text: cleanWord(w),
      accent: isAccent(w),
      start: +Math.max(a, start).toFixed(3),
      end: +Math.max(start + 0.05, end).toFixed(3),
    };
  });
}

const out = {};
for (const sc of SCENES) {
  const wav = readWav(voPath(sc.id));
  const env = envelope(wav);
  const th = level(env);
  const runs = voiced(env, th);
  if (!runs.length) throw new Error(`${sc.id}: no speech found`);
  const sentences = splitSentences(sc.cap);
  const speechStart = runs[0].a;
  const speechEnd = Math.min(wav.duration, runs[runs.length - 1].b);
  const gaps = silences(runs, wav.duration);
  const bounds = chooseBoundaries(gaps, sentences, speechStart, speechEnd);

  const cards = [];
  let from = speechStart;
  sentences.forEach((sentence, i) => {
    const to = i < bounds.length ? bounds[i] : speechEnd;
    cards.push(placeWords(sentence.split(/\s+/), from, to, env, th));
    from = to;
  });

  out[sc.id] = {
    onset: +speechStart.toFixed(3),
    end: +speechEnd.toFixed(3),
    gaps: gaps.map((g) => ({ t: +g.mid.toFixed(2), len: +g.len.toFixed(2) })),
    cards,
  };

  const edges = [speechStart, ...bounds, speechEnd];
  const lens = edges.slice(0, -1).map((e, i) => (edges[i + 1] - e).toFixed(2)).join(' · ');
  console.log(
    `${sc.id}  speech ${speechStart.toFixed(2)}–${speechEnd.toFixed(2)}  ${cards.length} cards  ${lens} s`,
  );
}

fs.mkdirSync(path.join(process.cwd(), 'assets', 'audio'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'assets', 'audio', 'align.json'), JSON.stringify(out, null, 1));
console.log('\nwrote assets/audio/align.json');
