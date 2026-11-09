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

const splitSentences = (cap) =>
  cap
    .split(/(?<=[.!?:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const cleanWord = (w) => w.replace(/\*/g, '');
const isAccent = (w) => w.startsWith('*') || w.endsWith('*');

export function buildTimeline() {
  const scenes = [];
  let cursor = 0;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    const file = voPath(sc.id);
    if (!fs.existsSync(file)) throw new Error(`missing VO: ${path.relative(process.cwd(), file)}`);
    const audioDur = readWav(file).duration;
    const voOffset = i === 0 ? 0.95 : 0.22;
    const dur = voOffset + audioDur + sc.pad;

    const sentences = splitSentences(sc.cap);
    const gap = 0.26;
    const tail = 0.12;
    const speak = audioDur - gap * (sentences.length - 1) - tail;
    const sentWeights = sentences.map((s) =>
      s.split(/\s+/).reduce((a, w) => a + cleanWord(w).length + 1.7, 0),
    );
    const totalW = sentWeights.reduce((a, b) => a + b, 0);
    const captions = [];
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
