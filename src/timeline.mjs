import fs from 'node:fs';
import path from 'node:path';
import { SCENES } from './script.mjs';
import { clamp } from './engine/anim.mjs';

export function readWav(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString('ascii', 0, 4) !== 'RIFF') throw new Error(`not a wav: ${file}`);
  let off = 12;
  let fmt = null;
  let data = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') {
      fmt = {
        audioFormat: buf.readUInt16LE(off + 8),
        channels: buf.readUInt16LE(off + 10),
        sampleRate: buf.readUInt32LE(off + 12),
        byteRate: buf.readUInt32LE(off + 16),
        bits: buf.readUInt16LE(off + 22),
      };
    } else if (id === 'data') {
      data = buf.subarray(off + 8, off + 8 + size);
      break;
    }
    off += 8 + size + (size % 2);
  }
  if (!fmt || !data) throw new Error(`bad wav: ${file}`);
  const duration = data.length / (fmt.sampleRate * fmt.channels * (fmt.bits / 8));
  return { ...fmt, data, duration };
}

export const voPath = (id) => path.join(process.cwd(), 'assets', 'audio', 'vo', `${id}.wav`);

/** Real word timings measured from the VO file (scripts/align-vo.mjs). */
function readAlign() {
  const file = path.join(process.cwd(), 'assets', 'audio', 'align.json');
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

const splitSentences = (cap) =>
  cap
    .split(/(?<=[.!?:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const cleanWord = (w) => w.replace(/\*/g, '');
const isAccent = (w) => w.startsWith('*') || w.endsWith('*');


/** Long sentences are split at a comma so no caption needs more than three lines. */
function chunkWords(words, limit = 11) {
  if (words.length <= limit) return [words];
  const isBreak = (w) => /[,;:]$/.test(w.text);
  const bestCut = () => {
    let cut = Math.ceil(words.length / 2);
    let bestIdx = -1;
    let bestDist = Infinity;
    words.forEach((w, i) => {
      if (i === 0 || i > words.length - 3) return;
      if (!isBreak(w)) return;
      const d = Math.abs(i + 1 - words.length / 2);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i + 1;
      }
    });
    return bestIdx > 0 ? bestIdx : cut;
  };
  const cut = bestCut();
  return [...chunkWords(words.slice(0, cut), limit), ...chunkWords(words.slice(cut), limit)];
}

export function buildTimeline() {
  const scenes = [];
  const align = readAlign();
  let cursor = 0;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    const file = voPath(sc.id);
    if (!fs.existsSync(file)) throw new Error(`missing VO: ${path.relative(process.cwd(), file)}`);
    const audioDur = readWav(file).duration;
    const voOffset = i === 0 ? 0.95 : 0.22;
    const dur = voOffset + audioDur + sc.pad;

    const sentences = splitSentences(sc.cap);
    const aligned = align?.[sc.id];
    const gap = 0.26;
    const tail = 0.12;
    const speak = audioDur - gap * (sentences.length - 1) - tail;
    const sentWeights = sentences.map((s) =>
      s.split(/\s+/).reduce((a, w) => a + cleanWord(w).length + 1.7, 0),
    );
    const totalW = sentWeights.reduce((a, b) => a + b, 0);
    const captions = [];
    if (Array.isArray(aligned) && aligned.length === sentences.length) {
      // word times come with a small lead-in, so two cards can overlap by a few
      // hundredths. Clamp every card inside its own VO and never let a card
      // start before the previous one has finished: overlapping cards are what
      // makes the outgoing line fade while the incoming one is still moving.
      // word times are relative to the audio file, the offset is added below
      const num = (v) => Math.max(0, Math.min(audioDur - 0.03, v));
      aligned.forEach((words) => {
        chunkWords(words).forEach((chunk) => {
          const ws = chunk.map((w) => ({
            text: w.text,
            accent: w.accent,
            start: voOffset + num(w.start),
            end: voOffset + num(w.end),
          }));
          const prev = captions[captions.length - 1];
          if (prev) {
            const prevEnd = prev.words[prev.words.length - 1].end;
            if (ws[0].start < prevEnd + 0.01) ws[0].start = +(prevEnd + 0.01).toFixed(3);
            if (ws[0].end <= ws[0].start) ws[0].end = +(ws[0].start + 0.08).toFixed(3);
          }
          captions.push({ words: ws });
        });
      });
      scenes.push({
        ...sc,
        start: cursor,
        dur,
        audioDur,
        voOffset,
        audioStart: cursor + voOffset,
        captions,
        timed: 'aligned',
      });
      cursor += dur;
      continue;
    }
    let st = 0;
    sentences.forEach((sentence, si) => {
      const sdur = (sentWeights[si] / totalW) * speak;
      const rawWords = sentence.split(/\s+/);
      const wws = rawWords.map((w) => cleanWord(w).length + 1.7);
      const sum = wws.reduce((a, b) => a + b, 0);
      let wt = st;
      const words = rawWords.map((w, wi) => {
        const d = (wws[wi] / sum) * sdur;
        const start = wt;
        wt += d;
        return {
          text: cleanWord(w),
          accent: isAccent(w),
          start: voOffset + Math.max(0, start),
          end: voOffset + Math.max(0.06, wt - 0.04),
        };
      });
      captions.push({ words });
      st += sdur + gap;
    });

    scenes.push({
      ...sc,
      start: cursor,
      dur,
      audioDur,
      voOffset,
      audioStart: cursor + voOffset,
      captions,
    });
    cursor += dur;
  }
  return { fps: 90, scenes, total: cursor };
}

export function sceneAt(timeline, t) {
  let idx = timeline.scenes.findIndex((s, i) => {
    const next = timeline.scenes[i + 1];
    return t >= s.start && (!next || t < next.start);
  });
  if (idx < 0) idx = timeline.scenes.length - 1;
  const s = timeline.scenes[idx];
  return { scene: s, index: idx, local: clamp(t - s.start, 0, s.dur) };
}
