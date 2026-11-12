// Original procedural score + sound design. No sampled music, no licensing deps.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = process.cwd();
const tl = JSON.parse(fs.readFileSync(path.join(root, 'public/timing.json'), 'utf8'));
const SR = 48000;
const N = Math.ceil(tl.duration * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
let seed = 20261112;
const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

function add(t0, dur, fn, gain = 1, pan = 0) {
  const s = Math.floor(t0 * SR);
  const n = Math.floor(dur * SR);
  const gl = Math.cos((clamp(pan, -1, 1) + 1) * Math.PI / 4) * gain;
  const gr = Math.sin((clamp(pan, -1, 1) + 1) * Math.PI / 4) * gain;
  for (let i = 0; i < n; i++) {
    const k = s + i;
    if (k < 0 || k >= N) continue;
    const v = fn(i / SR, i);
    L[k] += v * gl;
    R[k] += v * gr;
  }
}

const note = (f) => 440 * Math.pow(2, (f - 69) / 12);
// D minor pentatonic, warm and curious rather than ominous.
const chords = [[50, 57, 60, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 61]];
const BPM = 104;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

function pluck(t, f, g = 0.1, pan = 0) {
  add(t, 0.7, (x) => {
    const env = Math.exp(-x * 7.5) * (1 - Math.exp(-x * 180));
    return (Math.sin(TAU * f * x) * 0.7 + Math.sin(TAU * f * 2 * x) * 0.2 + Math.sin(TAU * f * 3.01 * x) * 0.08) * env;
  }, g, pan);
}

function kick(t, g = 0.16) {
  add(t, 0.32, (x) => Math.sin(TAU * (48 * x + 26 * (1 - Math.exp(-x * 28)) / 28)) * Math.exp(-x * 16), g);
}

function hat(t, g = 0.025) {
  let last = 0;
  add(t, 0.07, (x) => { const w = rand() * 2 - 1; const hp = w - last; last = w; return hp * Math.exp(-x * 70); }, g, 0.25);
}

function bass(t, f, dur, g = 0.09) {
  add(t, dur, (x) => {
    const env = Math.min(1, x / 0.04) * Math.min(1, (dur - x) / 0.12);
    return (Math.sin(TAU * f * x) + 0.22 * Math.sin(TAU * f * 2 * x)) * env;
  }, g);
}

function pad(t, freqs, dur, g = 0.05) {
  add(t, dur, (x) => {
    const env = Math.min(1, x / 1.2) * Math.min(1, (dur - x) / 1.4);
    let v = 0;
    for (const f of freqs) v += Math.sin(TAU * f * x) * 0.5 + Math.sin(TAU * f * 1.004 * x) * 0.25;
    return (v / freqs.length) * env;
  }, g, -0.1);
}

function impact(t, g = 0.2) {
  let n = 0;
  add(t, 0.8, (x) => {
    n = n * 0.7 + (rand() * 2 - 1) * 0.3;
    return (Math.sin(TAU * (62 * x + 40 * (1 - Math.exp(-x * 18)) / 18)) * 0.7 + n * 0.3) * Math.exp(-x * 7);
  }, g);
}

function whoosh(t, g = 0.07, dur = 0.45) {
  let lp = 0;
  add(t, dur, (x) => {
    const p = x / dur;
    const w = rand() * 2 - 1;
    lp += (0.08 + 0.5 * p) * (w - lp);
    return lp * Math.sin(Math.PI * p) ** 1.4;
  }, g, 0.15);
}

function tick(t, g = 0.05, f = 1500) {
  add(t, 0.06, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 65), g, -0.2);
}

const bars = Math.ceil(tl.duration / BAR);
for (let b = 0; b < bars; b++) {
  const t0 = b * BAR;
  const chord = chords[b % chords.length];
  pad(t0, chord.map((m) => note(m + 12)), BAR * 1.05, 0.045);
  bass(t0, note(chord[0] - 12), BAR * 0.92, 0.085);
  for (let beat = 0; beat < 4; beat++) {
    const t = t0 + beat * BEAT;
    if (t >= tl.duration) break;
    if (beat === 0 || beat === 2) kick(t, 0.14);
    hat(t + BEAT / 2, 0.02);
    const arp = chord[(b + beat) % chord.length] + 12;
    pluck(t + BEAT * 0.5, note(arp), 0.075, beat % 2 ? 0.3 : -0.3);
    if (beat === 3) pluck(t + BEAT * 0.75, note(arp + 7), 0.045, 0.15);
  }
}

// Scene punctuation and caption ticks sit exactly on the measured timeline.
for (const s of tl.scenes) {
  impact(s.start, 0.16);
  whoosh(Math.max(0, s.start - 0.18), 0.06);
  for (const c of s.captions) for (const w of c.words) if (w.accent) tick(w.start, 0.035, 1200 + rand() * 600);
}
// Final button-click / loop hook.
impact(tl.duration - 0.55, 0.12);
tick(tl.duration - 0.4, 0.06, 1800);

// Duck under measured speech; leave gaps breathing.
const duck = new Float32Array(N).fill(0.9);
for (const s of tl.scenes) {
  for (const [a, b] of s.active) {
    const from = Math.max(0, Math.floor((s.audioStart + a - 0.08) * SR));
    const to = Math.min(N, Math.ceil((s.audioStart + b + 0.12) * SR));
    for (let i = from; i < to; i++) duck[i] = Math.min(duck[i], 0.34);
  }
}
// Smooth duck envelope to avoid zipper noise.
let smooth = 0.9;
for (let i = 0; i < N; i++) { smooth += (duck[i] - smooth) * 0.002; duck[i] = smooth; }
const fadeIn = Math.floor(0.6 * SR);
const fadeOut = Math.floor(1.2 * SR);
let peak = 0;
for (let i = 0; i < N; i++) {
  const g = duck[i] * Math.min(1, i / fadeIn) * Math.min(1, (N - i) / fadeOut);
  L[i] *= g; R[i] *= g;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = peak > 0 ? 0.12 / peak : 1;
const wav = Buffer.alloc(44 + N * 4);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + N * 4, 4); wav.write('WAVE', 8);
wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  wav.writeInt16LE(Math.round(clamp(L[i] * norm, -1, 1) * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(clamp(R[i] * norm, -1, 1) * 32767), 46 + i * 4);
}
fs.mkdirSync(path.join(root, '.cache'), {recursive: true});
fs.mkdirSync(path.join(root, 'public/audio'), {recursive: true});
const tmp = path.join(root, '.cache/bed.wav');
fs.writeFileSync(tmp, wav);
const ffmpeg = path.join(root, 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg');
execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '192k', path.join(root, 'public/audio/bed.mp3')]);
console.log(`bed: ${tl.duration.toFixed(2)}s, peak ${peak.toFixed(3)} -> public/audio/bed.mp3`);
