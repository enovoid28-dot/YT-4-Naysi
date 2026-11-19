/**
 * Tighten fresh voice takes the way an editor cuts a VO track.
 *
 * A TTS read leaves long, even pauses after every comma and full stop and a
 * quarter second of air at both ends. Each take is cut down in its silences:
 * pauses inside a line longer than CAP keep CAP (half on each side, joined with
 * a short crossfade inside the silence, so no word is touched), the head keeps
 * HEAD and the tail keeps TAIL. Output is flac at the take's own sample rate.
 *
 * usage: node scripts/vo-prep.mjs [in-dir] [out-dir]   (default voice/$VO_EP)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ffmpegPath } from '../src/engine/ffmpeg.mjs';

const EP = process.env.VO_EP || 'ep27';
const inDir = process.argv[2] || path.join('voice', EP);
const outDir = process.argv[3] || inDir;
const CAP = 0.34;
const HEAD = 0.08;
const TAIL = 0.15;
const FLOOR = 10 ** (-40 / 20); // a 10 ms frame quieter than -40 dBFS is silence
const MIN_RUN = 0.1;
const XF = 0.01;

const probeRate = (file) => {
  try {
    execFileSync(ffmpegPath(), ['-hide_banner', '-i', file], { stdio: 'pipe' });
  } catch (e) {
    const m = String(e.stderr).match(/(\d+) Hz/);
    if (m) return Number(m[1]);
  }
  throw new Error(`no sample rate: ${file}`);
};

function tighten(x, sr) {
  const fl = Math.round(sr * 0.01);
  const nf = Math.floor(x.length / fl);
  const silent = new Uint8Array(nf);
  for (let f = 0; f < nf; f++) {
    let pk = 0;
    for (let i = f * fl; i < (f + 1) * fl; i++) pk = Math.max(pk, Math.abs(x[i]));
    silent[f] = pk < FLOOR ? 1 : 0;
  }
  const runs = [];
  for (let f = 0; f < nf;) {
    if (!silent[f]) { f++; continue; }
    let g = f;
    while (g < nf && silent[g]) g++;
    if ((g - f) * 0.01 >= MIN_RUN || f === 0 || g === nf) runs.push([f * fl, g === nf ? x.length : g * fl]);
    f = g;
  }
  // spans of the take to keep
  const cuts = [];
  for (const [a, b] of runs) {
    const len = (b - a) / sr;
    if (a === 0) {
      if (len > HEAD) cuts.push([0, b - Math.round(HEAD * sr)]);
    } else if (b === x.length) {
      if (len > TAIL) cuts.push([a + Math.round(TAIL * sr), x.length]);
    } else if (len > CAP) {
      const keep = Math.round((CAP / 2) * sr);
      cuts.push([a + keep, b - keep]);
    }
  }
  const keepSpans = [];
  let pos = 0;
  for (const [a, b] of cuts) {
    if (a > pos) keepSpans.push([pos, a]);
    pos = Math.max(pos, b);
  }
  if (pos < x.length) keepSpans.push([pos, x.length]);
  const xf = Math.round(XF * sr);
  const out = [];
  keepSpans.forEach(([a, b], k) => {
    const seg = x.subarray(a, b);
    if (k === 0 || out.length < xf) {
      for (const v of seg) out.push(v);
      return;
    }
    // equal-power crossfade over the join (both sides are silence)
    const base = out.length - xf;
    for (let i = 0; i < xf && i < seg.length; i++) {
      const p = i / xf;
      out[base + i] = out[base + i] * Math.cos(p * Math.PI / 2) + seg[i] * Math.sin(p * Math.PI / 2);
    }
    for (let i = xf; i < seg.length; i++) out.push(seg[i]);
  });
  const y = Float32Array.from(out);
  const fi = Math.round(0.005 * sr);
  const fo = Math.round(0.012 * sr);
  for (let i = 0; i < fi && i < y.length; i++) y[i] *= i / fi;
  for (let i = 0; i < fo && i < y.length; i++) y[y.length - 1 - i] *= i / fo;
  return { y, cuts: cuts.map(([a, b]) => [a / sr, (b - a) / sr]) };
}

fs.mkdirSync(outDir, { recursive: true });
const takes = fs.readdirSync(inDir).filter((f) => /^s\d+\.(flac|mp3)$/.test(f)).sort();
for (const f of takes) {
  const file = path.join(inDir, f);
  const sr = probeRate(file);
  const raw = execFileSync(ffmpegPath(), ['-v', 'error', '-i', file, '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice();
  const { y, cuts } = tighten(x, sr);
  const dst = path.join(outDir, f.replace(/\.mp3$/, '.flac'));
  const pcm = Buffer.from(y.buffer, y.byteOffset, y.byteLength);
  execFileSync(ffmpegPath(), ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(sr), '-ac', '1', '-i', '-', '-c:a', 'flac', '-sample_fmt', 's16', dst], { input: pcm });
  const cut = cuts.reduce((a, [, l]) => a + l, 0);
  console.log(`${f.padEnd(8)} ${(x.length / sr).toFixed(2)}s -> ${(y.length / sr).toFixed(2)}s  (-${cut.toFixed(2)}s in ${cuts.length} cuts)`);
}
