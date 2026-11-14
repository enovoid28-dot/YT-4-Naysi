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
import { readWav, voPath, capCards } from '../src/timeline.mjs';

const FRAME = 0.01;
const THRESH = 0.02;
const MERGE = 0.12;
const MIN_GAP = 0.12;

const cleanWord = (w) => w.replace(/\*/g, '');
const isAccent = (w) => w.startsWith('*') || w.endsWith('*');

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
/** Timestamp at which the take has *spoken* `frac` of its voiced time. */
function voicedTimeToClock(env, th, a, b, frac) {
  const i0 = Math.max(0, Math.floor(a / FRAME));
  const i1 = Math.min(env.length, Math.ceil(b / FRAME));
  let total = 0;
  for (let i = i0; i < i1; i++) if (env[i] > th) total += FRAME;
  let acc = 0;
  for (let i = i0; i < i1; i++) {
    if (env[i] > th) {
      acc += FRAME;
      if (acc >= frac * total) return i * FRAME;
    }
  }
  return b;
}

/**
 * Card boundaries, anchored on the sentence breaks of the take.
 *
 * The script's sentences are the only pauses long enough to trust, so the S-1
 * longest silences become the sentence anchors. Inside each sentence the cards
 * are placed by syllable weight over voiced time, snapped to a pause when one
 * is close. That keeps a card change on a clause break instead of drifting.
 */
function chooseBoundaries(gaps, cards, vo, speechStart, speechEnd, env, th) {
  const cardWords = cards.map((c) => c.split(/\s+/).length);
  const totalWords = cardWords.reduce((a, b) => a + b, 0);
  const sentWords = String(vo)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.split(/\s+/).filter(Boolean).length)
    .filter(Boolean);
  const sentSum = sentWords.reduce((a, b) => a + b, 0);
  const S = sentSum === totalWords && sentWords.length > 1 ? sentWords.length : 1;

  // ---- sentence anchors: predicted from syllable weight, snapped to a pause
  const anchors = [];
  if (S > 1) {
    const sentTexts = String(vo).split(/(?<=[.!?])\s+/).filter(Boolean);
    const sentWts = sentTexts.map((t) => t.split(/\s+/).reduce((a, w) => a + syllables(w), 0));
    const totW = sentWts.reduce((a, b) => a + b, 0) || 1;
    const usedA = new Set();
    let acc = 0;
    let prev = speechStart;
    for (let i = 0; i < S - 1; i++) {
      acc += sentWts[i] || 0;
      const target = voicedTimeToClock(env, th, speechStart, speechEnd, acc / totW);
      let best = null;
      let bestD = Infinity;
      gaps.forEach((g, gi) => {
        if (usedA.has(gi)) return;
        if (g.mid <= prev + 0.60 || g.mid >= speechEnd - 0.60) return;
        const d = Math.abs(g.mid - target);
        if (d < bestD) { bestD = d; best = { gi, mid: g.mid }; }
      });
      let cut = target;
      if (best && bestD <= 0.80) {
        usedA.add(best.gi);
        cut = best.mid;
      }
      cut = Math.max(prev + 0.60, Math.min(speechEnd - 0.40, cut));
      anchors.push(cut);
      prev = cut;
    }
  }

  // ---- segments: [start, end) plus the word range they cover
  const segs = [];
  let wFrom = 0;
  let tFrom = speechStart;
  for (let i = 0; i < S; i++) {
    const tTo = i < anchors.length ? anchors[i] : speechEnd;
    const wTo = wFrom + (S > 1 ? sentWords[i] : totalWords);
    segs.push({ tFrom, tTo, wFrom, wTo });
    wFrom = wTo;
    tFrom = tTo;
  }
  // any leftover words (rounding) belong to the last segment
  segs[segs.length - 1].wTo = totalWords;

  // ---- inside each segment, place the card cuts
  const used = new Set();
  const bounds = [];
  let wi = 0;
  segs.forEach((seg, si) => {
    const cardsHere = [];
    let w = seg.wFrom;
    while (w < seg.wTo) {
      const n = cardWords[wi + cardsHere.length];
      cardsHere.push(n);
      w += n;
    }
    const segWords = cardsHere.reduce((a, b) => a + b, 0);
    // syllable weight per card in this segment
    const wts = [];
    let k = seg.wFrom;
    cardsHere.forEach((n) => {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        const flat = cards[wi + wts.length]?.split(/\s+/)[j];
        sum += syllables(flat || 'a');
      }
      wts.push(sum);
      k += n;
    });
    const tot = wts.reduce((a, b) => a + b, 0) || 1;
    let acc = 0;
    let prev = seg.tFrom;
    for (let c = 0; c < cardsHere.length - 1; c++) {
      acc += wts[c];
      const target = voicedTimeToClock(env, th, seg.tFrom, seg.tTo, acc / tot);
      let best = null;
      let bestD = Infinity;
      gaps.forEach((g, gi) => {
        if (used.has(gi)) return;
        if (g.mid <= prev + 0.40 || g.mid >= seg.tTo - 0.15) return;
        const d = Math.abs(g.mid - target);
        if (d < bestD) { bestD = d; best = { gi, mid: g.mid }; }
      });
      let cut = target;
      if (best && bestD <= 0.55) {
        used.add(best.gi);
        cut = best.mid;
      }
      cut = Math.max(prev + 0.40, Math.min(seg.tTo - 0.20, cut));
      bounds.push(cut);
      prev = cut;
    }
    wi += cardsHere.length;
    // the sentence anchor itself is a boundary
    if (si < segs.length - 1) {
      bounds.push(seg.tTo);
      prev = seg.tTo;
    }
  });
  return bounds.sort((a, b) => a - b);
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
  const sentences = capCards(sc.cap);
  const speechStart = runs[0].a;
  const speechEnd = Math.min(wav.duration, runs[runs.length - 1].b);
  const gaps = silences(runs, wav.duration);
  const bounds = chooseBoundaries(gaps, sentences, sc.vo, speechStart, speechEnd, env, th);

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
  cards.forEach((c, i) => {
    const head = c.slice(0, 3).map((w) => w.text).join(' ');
    const tail = c.slice(-2).map((w) => w.text).join(' ');
    console.log(
      `    ${String(i + 1).padStart(2)}. ${c[0].start.toFixed(2)}–${c[c.length - 1].end.toFixed(2)}  ` +
      `${c.length}w  ${(c.length / Math.max(0.2, c[c.length - 1].end - c[0].start)).toFixed(2)} w/s  ` +
      `${head} … ${tail}`,
    );
  });
}

fs.mkdirSync(path.join(process.cwd(), 'assets', 'audio'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'assets', 'audio', 'align.json'), JSON.stringify(out, null, 1));
console.log('\nwrote assets/audio/align.json');
