/**
 * Card-level caption timing, measured from the VO.
 *
 * A read take pauses at the punctuation of the script (long at a full stop,
 * shorter at a comma) and speaks at a fairly even rate in between. So the
 * measured pauses of the take are matched, in order, to the punctuation of the
 * line by dynamic programming: every phrase between two matched pauses has to
 * be spoken at a plausible rate, a full stop has to land on a real pause, and a
 * long pause should not be left without punctuation. A sentence break is
 * therefore pinned to the pause the voice really made, not to where a syllable
 * count predicts it. Words are spread over the voiced time of their own phrase
 * and every card edge is the middle of a real pause.
 *
 * Word timing: when the caption is word-for-word the VO, every word is placed
 * by phonetic forced alignment (scripts/align-words.py, PocketSphinx; set
 * ALIGN_PY to a python with `pip install pocketsphinx`). The pause matching
 * below stays as the fallback and as the report.
 *
 * Output: assets/audio/align.json
 *   { [sceneId]: { onset, end, gaps: [...], cards: [[{text,accent,start,end}], ...] } }
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SCENES } from '../src/script.mjs';
import { capCards } from '../src/timeline.mjs';
import { decodeVo, VO_EP } from '../src/audio.mjs';

/** phonetic word timings for every scene, or null when the aligner is not installed */
function forcedWords() {
  const py = process.env.ALIGN_PY || path.join(os.homedir(), '.venv-align', 'bin', 'python');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'align-'));
  const vo = path.join(tmp, 'vo.json');
  const res = path.join(tmp, 'words.json');
  fs.writeFileSync(vo, JSON.stringify(Object.fromEntries(SCENES.map((s) => [s.id, s.vo]))));
  try {
    execFileSync(fs.existsSync(py) ? py : 'python3', [path.join('scripts', 'align-words.py'), path.join('voice', VO_EP), vo, res], { stdio: ['ignore', 'inherit', 'inherit'] });
    return JSON.parse(fs.readFileSync(res, 'utf8'));
  } catch (err) {
    console.warn(`forced alignment unavailable (${err.message.split('\n')[0]}); pause matching only`);
    return null;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
const FORCED = forcedWords();

const FRAME = 0.01;
const THRESH = 0.02;
const MERGE = 0.12;
const MIN_GAP = 0.09;
const MIN_CARD = 1.2; // a card that flips faster than this cannot be read

const cleanWord = (w) => w.replace(/\*/g, '');
const isAccent = (w) => w.startsWith('*') || w.endsWith('*');

const syllables = (w) => {
  const raw = cleanWord(w).replace(/[^A-Za-z]/g, '');
  // letters read out one by one (A, B, AB, DNA): one syllable per letter
  if (/^[A-Z]{1,4}$/.test(raw)) return raw.length;
  const s = raw.toLowerCase();
  // Indonesian: every vowel is a syllable (du-ni-a, pe-rem-pu-an), except the
  // word-final diphthongs (a-tau, pan-tai, am-boi)
  let n = (s.match(/[aiueo]/g) || []).length;
  if (/(ai|au|oi|ei)$/.test(s)) n -= 1;
  return Math.max(1, n) + s.length * 0.08;
};

function envelope(wav) {
  const n = wav.frames;
  const step = Math.max(1, Math.round(wav.sampleRate * FRAME));
  const out = [];
  for (let i = 0; i < n; i += step) {
    let peak = 0;
    const end = Math.min(n, i + step);
    for (let j = i; j < end; j++) {
      const v = Math.max(Math.abs(wav.l(j)), Math.abs(wav.r(j)));
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

/** voiced time between two clock times */
function voicedBetween(env, th, a, b) {
  const i0 = Math.max(0, Math.floor(a / FRAME));
  const i1 = Math.min(env.length, Math.ceil(b / FRAME));
  let v = 0;
  for (let i = i0; i < i1; i++) if (env[i] > th) v += FRAME;
  return v;
}

const punctOf = (w) => (/[.!?]["')\]]*$/.test(w) ? 'stop' : /[,;:]["')\]]*$/.test(w) ? 'comma' : null);

/**
 * Match the punctuation of the line to the pauses of the take.
 *
 * Nodes are (mark, pause) pairs in reading order. Moving from one node to the
 * next costs: the phrase between them spoken off the take's average rate
 * (syllables x squared log ratio), every mark skipped on the way (a full stop
 * almost never goes unpaused, a comma often does), every pause skipped on the
 * way (by its length: a long pause without punctuation is unlikely), and a
 * full stop matched to a very short pause.
 *
 * Returns, for every mark, the pause it sits in (or null).
 */
function matchPauses(words, gaps, t0, t1, env, th) {
  const N = words.length;
  const cum = [0];
  words.forEach((w) => cum.push(cum[cum.length - 1] + w.syl));
  const marks = [];
  for (let i = 0; i < N - 1; i++) if (words[i].punct) marks.push({ w: i, kind: words[i].punct });
  const M = marks.length;
  const G = gaps.length;
  const R = cum[N] / Math.max(0.2, voicedBetween(env, th, t0, t1));

  const phrase = (wa, ta, wb, tb) => {
    const S = cum[wb] - cum[wa];
    if (S <= 0) return 0;
    const V = Math.max(0.04, voicedBetween(env, th, ta, tb));
    const r = Math.log((V * R) / S);
    return S * r * r;
  };
  const markMiss = (k) => (marks[k].kind === 'stop' ? 40 : 1.0);
  const gapMiss = (g) => 3.0 * g.len;
  const markHit = (k, g) => (marks[k].kind === 'stop' ? 6 * Math.max(0, 0.22 - g.len) : 0);

  // index 0 = start, 1..M / 1..G = marks / pauses, M+1 / G+1 = end
  const wordAt = (kk) => (kk === 0 ? 0 : kk === M + 1 ? N : marks[kk - 1].w + 1);
  const tIn = (kk, jj) => (kk === 0 ? t0 : kk === M + 1 ? t1 : gaps[jj - 1].a);
  const tOut = (kk, jj) => (kk === 0 ? t0 : kk === M + 1 ? t1 : gaps[jj - 1].b);
  const cost = Array.from({ length: M + 2 }, () => new Array(G + 2).fill(Infinity));
  const back = Array.from({ length: M + 2 }, () => new Array(G + 2).fill(null));
  cost[0][0] = 0;
  for (let kk = 1; kk <= M + 1; kk++) {
    for (let jj = 1; jj <= G + 1; jj++) {
      if ((kk === M + 1) !== (jj === G + 1)) continue;
      for (let pk = 0; pk < kk; pk++) {
        for (let pj = 0; pj < jj; pj++) {
          if ((pk === 0) !== (pj === 0)) continue;
          const base = cost[pk][pj];
          if (!Number.isFinite(base)) continue;
          let c = base + phrase(wordAt(pk), tOut(pk, pj), wordAt(kk), tIn(kk, jj));
          for (let q = pk + 1; q < kk; q++) c += markMiss(q - 1);
          for (let g = pj + 1; g < jj; g++) c += gapMiss(gaps[g - 1]);
          if (kk <= M) c += markHit(kk - 1, gaps[jj - 1]);
          if (c < cost[kk][jj]) {
            cost[kk][jj] = c;
            back[kk][jj] = [pk, pj];
          }
        }
      }
    }
  }
  const hit = new Array(M).fill(null);
  let node = back[M + 1][G + 1];
  while (node && node[0] > 0) {
    hit[node[0] - 1] = node[1] - 1;
    node = back[node[0]][node[1]];
  }
  return { marks, hit, rate: R, cost: cost[M + 1][G + 1] };
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
  const wav = decodeVo(sc.id);
  const env = envelope(wav);
  const th = level(env);
  const runs = voiced(env, th);
  if (!runs.length) throw new Error(`${sc.id}: no speech found`);
  const cardTexts = capCards(sc.cap);
  const speechStart = runs[0].a;
  const speechEnd = Math.min(wav.duration, runs[runs.length - 1].b);
  const gaps = silences(runs, wav.duration);

  // the spoken words, with their punctuation, card by card
  const capWords = cardTexts.map((c) => c.split(/\s+/).filter(Boolean));
  const flat = capWords.flat();
  const voWords = String(sc.vo).split(/\s+/).filter(Boolean);
  const spoken = voWords.length === flat.length ? voWords : flat.map(cleanWord);
  if (spoken !== voWords) console.warn(`${sc.id}: ${flat.length} caption words vs ${voWords.length} VO words, timing from the captions`);
  const words = spoken.map((w, i) => ({ text: flat[i], syl: syllables(w), punct: punctOf(w) }));
  const { marks, hit, rate } = matchPauses(words, gaps, speechStart, speechEnd, env, th);

  // phrase anchors: every matched mark splits the take inside its pause
  const anchors = [{ w: 0, tIn: speechStart, tOut: speechStart }];
  marks.forEach((m, k) => {
    if (hit[k] === null) return;
    const g = gaps[hit[k]];
    anchors.push({ w: m.w + 1, tIn: g.a, tOut: g.b, mid: g.mid, len: g.len, kind: m.kind });
  });
  anchors.push({ w: words.length, tIn: speechEnd, tOut: speechEnd });

  // words spread over the voiced time of their own phrase
  const timed = [];
  for (let p = 0; p < anchors.length - 1; p++) {
    const A = anchors[p];
    const B = anchors[p + 1];
    timed.push(...placeWords(words.slice(A.w, B.w).map((w) => w.text), A.tOut, B.tIn, env, th));
  }

  // phonetic alignment wins whenever the caption is the VO word for word
  const fw = FORCED?.[sc.id];
  const exact = spoken === voWords && fw && fw.length === words.length;
  if (exact) {
    fw.forEach((w, i) => {
      timed[i] = { text: cleanWord(flat[i]), accent: isAccent(flat[i]), start: +w.start.toFixed(3), end: +w.end.toFixed(3) };
    });
  }

  // card edges: the middle of the pause that ends the card's last word
  const usedGap = new Set(hit.filter((h) => h !== null));
  const cards = [];
  let w0 = 0;
  capWords.forEach((cw, ci) => {
    const card = timed.slice(w0, w0 + cw.length).map((w) => ({ ...w }));
    w0 += cw.length;
    cards.push(card);
    if (ci === capWords.length - 1 || exact) return;
    const lastW = w0 - 1;
    const k = marks.findIndex((m) => m.w === lastW);
    let edge;
    if (k >= 0 && hit[k] !== null) {
      edge = gaps[hit[k]].mid;
    } else {
      // no pause matched here: the nearest free pause before the next word
      const nextStart = timed[w0].start;
      let best = null;
      gaps.forEach((g, gi) => {
        if (usedGap.has(gi) || Math.abs(g.mid - nextStart) > 0.45) return;
        if (!best || Math.abs(g.mid - nextStart) < Math.abs(best.g.mid - nextStart)) best = { g, gi };
      });
      if (best) usedGap.add(best.gi);
      edge = best ? best.g.mid : nextStart - 0.08;
    }
    card[card.length - 1].end = +edge.toFixed(3);
    timed[w0].start = +edge.toFixed(3);
  });
  // the next card's first word was copied before its edge was set
  {
    let i = 0;
    cards.forEach((card) => {
      card[0].start = timed[i].start;
      i += card.length;
    });
  }

  out[sc.id] = {
    onset: +speechStart.toFixed(3),
    end: +speechEnd.toFixed(3),
    gaps: gaps.map((g) => ({ t: +g.mid.toFixed(2), len: +g.len.toFixed(2) })),
    cards,
  };

  // report: card spans, then every phrase with its pause and speaking rate
  const edges = [speechStart, ...cards.slice(1).map((c) => c[0].start), speechEnd];
  const lens = edges.slice(0, -1).map((e, i) => (edges[i + 1] - e).toFixed(2));
  const short = lens.some((l) => +l < MIN_CARD) ? '  ! card under 1.2 s' : '';
  console.log(`${sc.id}  speech ${speechStart.toFixed(2)}–${speechEnd.toFixed(2)}  ${cards.length} cards  ${lens.join(' · ')} s${short}  ${exact ? 'words: phonetic' : 'words: pause-matched'}`);
  cards.forEach((c, i) => {
    const head = c.slice(0, 3).map((w) => w.text).join(' ');
    const tail = c.slice(-2).map((w) => w.text).join(' ');
    console.log(`    ${String(i + 1).padStart(2)}. ${c[0].start.toFixed(2)}–${c[c.length - 1].end.toFixed(2)}  ${c.length}w  ${head} … ${tail}`);
  });
  const phr = [];
  for (let p = 0; p < anchors.length - 1; p++) {
    const A = anchors[p];
    const B = anchors[p + 1];
    const S = words.slice(A.w, B.w).reduce((x, w) => x + w.syl, 0);
    const V = voicedBetween(env, th, A.tOut, B.tIn);
    const tag = B.mid !== undefined ? `| ${B.kind === 'stop' ? '.' : ','} ${B.mid.toFixed(2)} (${B.len.toFixed(2)})` : '';
    phr.push(`${words[B.w - 1].text.replace(/\*/g, '')} ${(S / Math.max(0.05, V) / rate).toFixed(2)}x ${tag}`);
  }
  console.log(`       ${phr.join('  ')}`);
  const missed = marks.filter((m, k) => hit[k] === null).map((m) => words[m.w].text.replace(/\*/g, ''));
  const free = gaps.filter((g, gi) => !usedGap.has(gi) && g.len >= 0.2).map((g) => `${g.mid.toFixed(2)}(${g.len.toFixed(2)})`);
  if (missed.length || free.length) console.log(`       no pause at: ${missed.join(' ') || '-'}   pause without mark: ${free.join(' ') || '-'}`);
}

fs.mkdirSync(path.join(process.cwd(), 'assets', 'audio'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'assets', 'audio', 'align.json'), JSON.stringify(out, null, 1));
console.log('\nwrote assets/audio/align.json');
