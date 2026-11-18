/**
 * Real caption timing from the rendered VO.
 *
 * The old timeline guessed word times by character count across a whole
 * scene, which drifts by up to a second. This script measures the actual
 * speech in assets/audio/vo/<scene>.wav, finds the pauses, matches them to
 * the sentences of the script with a DP alignment, then places individual
 * words so that no word is ever "spoken" during silence.
 *
 * Output: assets/audio/align.json  { [sceneId]: [[{text, accent, start, end}], ...] }
 * times are seconds relative to the start of that scene's VO file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SCENES } from '../src/script.mjs';
import { readWav, voPath } from '../src/timeline.mjs';

const FRAME = 0.01; // 10 ms envelope
const THRESH = 0.018; // absolute peak, VO is normalised to about -16 LUFS
const MERGE_GAP = 0.15; // shorter silences are just breath inside a word
const MIN_RUN = 0.09;
const PAD = 0.03; // nudge so a word lights up just as the sound starts

const cleanWord = (w) => w.replace(/\*/g, '');
const isAccent = (w) => w.startsWith('*') || w.endsWith('*');
const splitSentences = (cap) =>
  cap.split(/(?<=[.!?:])\s+/).map((s) => s.trim()).filter(Boolean);
const wordWeight = (w) => cleanWord(w).length + 1.7;

function envelope(wav) {
  const n = wav.data.length / 4;
  const sr = wav.sampleRate;
  const step = Math.max(1, Math.round(sr * FRAME));
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

function speechRuns(env) {
  const runs = [];
  let cur = null;
  env.forEach((v, i) => {
    const t = i * FRAME;
    if (v > THRESH) {
      if (!cur) cur = { a: t, b: t + FRAME };
      else cur.b = t + FRAME;
    } else if (cur && t - cur.b > MERGE_GAP) {
      runs.push(cur);
      cur = null;
    }
  });
  if (cur) runs.push(cur);
  return runs.filter((r) => r.b - r.a >= MIN_RUN);
}

/** DP: split runs into exactly K contiguous groups matching expected weights. */
function splitSentencesIntoRuns(runs, weights) {
  const K = weights.length;
  const N = runs.length;
  if (K === 1) return [runs];
  if (N < K) return null;
  const span = (a, b) => runs[b].b - runs[a].a; // speech + internal pauses
  const total = span(0, N - 1);
  const wsum = weights.reduce((x, y) => x + y, 0);
  const expect = weights.map((w) => (w / wsum) * total);
  const cost = (a, b, k) => {
    const d = span(a, b);
    const r = (d - expect[k]) / Math.max(0.45, expect[k]);
    return r * r;
  };
  const INF = Infinity;
  const dp = Array.from({ length: K + 1 }, () => new Array(N + 1).fill(INF));
  const back = Array.from({ length: K + 1 }, () => new Array(N + 1).fill(-1));
  dp[0][0] = 0;
  for (let k = 1; k <= K; k++) {
    for (let n = k; n <= N; n++) {
      for (let p = k - 1; p < n; p++) {
        if (dp[k - 1][p] === INF) continue;
        const c = dp[k - 1][p] + cost(p, n - 1, k - 1);
        if (c < dp[k][n]) {
          dp[k][n] = c;
          back[k][n] = p;
        }
      }
    }
  }
  if (dp[K][N] === INF) return null;
  const groups = [];
  let n = N;
  for (let k = K; k >= 1; k--) {
    const p = back[k][n];
    groups.unshift(runs.slice(p, n));
    n = p;
  }
  return groups;
}

/**
 * Place words inside the given runs: each word gets a share of the spoken
 * time only, and the cursor jumps over pauses instead of talking through them.
 */
function placeWords(runs, words) {
  const speech = runs.reduce((a, r) => a + (r.b - r.a), 0);
  const weights = words.map(wordWeight);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const durs = weights.map((w) => (w / wsum) * speech);

  const placed = [];
  let ri = 0;
  let cursor = runs[0].a;
  words.forEach((w, i) => {
    let d = durs[i];
    // if the current run cannot hold this word, finish it and jump the pause
    while (ri < runs.length - 1 && cursor + d > runs[ri].b) {
      const need = d;
      const room = runs[ri].b - cursor;
      if (room <= 0.02) {
        ri++;
        cursor = runs[ri].a;
        continue;
      }
      if (need - room > 0.14) {
        ri++;
        cursor = runs[ri].a;
      } else break;
    }
    if (cursor + d > runs[ri].b) d = Math.max(0.06, runs[ri].b - cursor);
    const start = Math.max(0, cursor - PAD);
    placed.push({
      text: cleanWord(w),
      accent: isAccent(w),
      start: +start.toFixed(3),
      end: +(cursor + d).toFixed(3),
    });
    cursor += d;
  });

  // keep it strictly monotonic
  for (let i = 1; i < placed.length; i++) {
    if (placed[i].start < placed[i - 1].start + 0.05) {
      placed[i].start = +(placed[i - 1].start + 0.05).toFixed(3);
    }
    if (placed[i].end < placed[i].start + 0.08) {
      placed[i].end = +(placed[i].start + 0.08).toFixed(3);
    }
  }
  return placed;
}

const result = {};
for (const sc of SCENES) {
  const file = voPath(sc.id);
  const wav = readWav(file);
  const runs = speechRuns(envelope(wav));
  const sentences = splitSentences(sc.cap);
  const weights = sentences.map((s) =>
    s.split(/\s+/).reduce((a, w) => a + wordWeight(w), 0),
  );

  let groups = splitSentencesIntoRuns(runs, weights);
  let mode = 'dp';
  if (!groups || groups.length !== sentences.length) {
    // fallback: proportional split of the whole take
    mode = 'fallback';
    groups = [[{ a: runs[0].a, b: runs[runs.length - 1].b }]];
  }

  const captions = [];
  let si = 0;
  for (const sentence of sentences) {
    const rawWords = sentence.split(/\s+/);
    const group = groups[si] ?? groups[groups.length - 1];
    si++;
    captions.push(placeWords(group, rawWords));
  }

  result[sc.id] = captions;
  const first = captions.map((c) => c[0].start.toFixed(2)).join(' ');
  console.log(`${sc.id}  runs=${runs.length} sent=${sentences.length} (${mode})  starts: ${first}`);
}

const out = path.join(process.cwd(), 'assets', 'audio', 'align.json');
fs.writeFileSync(out, JSON.stringify(result, null, 0));
console.log(`\nwrote ${path.relative(process.cwd(), out)}`);
