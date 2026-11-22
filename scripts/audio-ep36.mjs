// Episode 36 score: restrained, curious analog synth bed with tactile lab cues.
// VO is the selected Indonesian male narration, processed by the shared chain.
import path from 'node:path';
import { buildTimeline } from '../src/timeline.mjs';
import { decodeVo, writeFlac } from '../src/audio.mjs';

const SR = 48000;
const tl = buildTimeline();
const N = Math.ceil((tl.total + 0.4) * SR);
const music = [new Float32Array(N), new Float32Array(N)];
const sfx = [new Float32Array(N), new Float32Array(N)];
const vo = [new Float32Array(N), new Float32Array(N)];
const TAU = 2 * Math.PI;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const panGains = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];

function add(buf, t0, dur, fn, gain = 1, pan = 0) {
  const start = Math.max(0, Math.floor(t0 * SR));
  const end = Math.min(N, Math.floor((t0 + dur) * SR));
  const [gl, gr] = panGains(clamp(pan, -1, 1));
  for (let i = start; i < end; i++) {
    const x = (i - start) / SR;
    const e = Math.min(1, x / 0.018) * Math.min(1, (end - i) / (SR * 0.06));
    const v = fn(x) * e * gain;
    buf[0][i] += v * gl; buf[1][i] += v * gr;
  }
}

const BPM = 84;
const beat = 60 / BPM;
const bar = beat * 4;
const chords = [
  [73.42, 110, 146.83, 174.61],
  [58.27, 87.31, 116.54, 146.83],
  [65.41, 98, 130.81, 164.81],
  [55, 82.41, 110, 164.81],
];
// Soft, slow-moving harmonic bed with a clocklike pluck: enough movement to
// support visual cuts, but deliberately carved away from the narration.
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const chord = chords[Math.floor(t / bar) % chords.length];
  const slow = 0.76 + 0.24 * Math.sin(TAU * 0.055 * t);
  let v = 0;
  chord.forEach((f, k) => { v += Math.sin(TAU * f * t + k * 0.31) * [0.48, 0.23, 0.16, 0.1][k]; });
  const beatPhase = t % beat;
  const pluck = Math.sin(TAU * 392 * beatPhase) * Math.exp(-beatPhase * 7.5) * 0.11;
  const low = Math.sin(TAU * 55 * t) * (0.55 + 0.45 * Math.sin(TAU * t / bar));
  music[0][i] = (v * 0.026 + pluck * 0.018 + low * 0.012) * slow;
  music[1][i] = (v * 0.026 + pluck * 0.015 + low * 0.012) * slow;
}

let seed = 36112026;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
function cue(t, kind = 'soft') {
  const dur = kind === 'wash' ? 0.8 : 0.28;
  add(sfx, t, dur, (x) => {
    const env = Math.pow(1 - x / dur, kind === 'wash' ? 1.4 : 3);
    const hiss = rand() * (kind === 'wash' ? 0.45 : 0.12);
    const tone = Math.sin(TAU * (kind === 'wash' ? 180 - 110 * x : 640 + 520 * x) * x);
    return (hiss + tone * (kind === 'wash' ? 0.25 : 0.6)) * env;
  }, kind === 'wash' ? 0.09 : 0.05, (Math.sin(t * 1.7) * 0.5));
}

// A low, soft transition whoosh for each new visual; specific tiny taps land on
// predicted vs delayed moments, then a dry robotic servo texture in the test.
for (const sc of tl.scenes) {
  cue(sc.start + 0.08, 'wash');
  cue(sc.start + 0.23, 'soft');
  if ([3, 4, 5, 6, 7].includes(Number(sc.index))) {
    add(sfx, sc.start + 1.05, 0.34, (x) => Math.sin(TAU * (420 + 900 * x) * x) * Math.exp(-x * 10), 0.045, 0.3);
  }
  if (Number(sc.index) === 5) {
    [0, 1, 2, 3].forEach((k) => add(sfx, sc.start + 2.2 + k * 0.36, 0.13,
      (x) => (Math.sin(TAU * 150 * x) + rand() * 0.25) * Math.exp(-x * 24), 0.085, k % 2 ? -0.25 : 0.25));
  }
}

// Assemble the VO in exact scene order using the same offsets as the image and
// caption timeline. The decode helper applies the repository's voice master.
for (const sc of tl.scenes) {
  const take = decodeVo(sc.id);
  const offset = Math.floor(sc.audioStart * SR);
  for (let i = 0; i < take.frames && offset + i < N; i++) {
    vo[0][offset + i] = take.l(i);
    vo[1][offset + i] = take.r(i);
  }
  console.log(`${sc.id}: ${take.duration.toFixed(2)} s VO`);
}

// Voice-driven ducking keeps the SFX present but lets consonants stay crisp.
const block = Math.floor(SR * 0.01);
const env = new Float32Array(Math.ceil(N / block));
for (let b = 0; b < env.length; b++) {
  let pk = 0;
  for (let i = b * block; i < Math.min(N, (b + 1) * block); i++) pk = Math.max(pk, Math.abs(vo[0][i]), Math.abs(vo[1][i]));
  env[b] = pk;
}
let smooth = 0;
const out = [new Float32Array(N), new Float32Array(N)];
for (let i = 0; i < N; i++) {
  const target = clamp(env[Math.floor(i / block)] * 5.8);
  smooth += (target - smooth) * (target > smooth ? 0.22 : 0.035);
  const bed = 1 - smooth * 0.62;
  const fx = 1 - smooth * 0.24;
  for (let ch = 0; ch < 2; ch++) out[ch][i] = vo[ch][i] + music[ch][i] * bed + sfx[ch][i] * fx;
}
// Smooth peak ceiling and a modest final gain; leave the voice dynamics intact.
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[0][i]), Math.abs(out[1][i]));
const gain = Math.min(1.18, 0.86 / Math.max(peak, 1e-8));
const interleaved = new Float32Array(N * 2);
for (let i = 0; i < N; i++) { interleaved[2 * i] = out[0][i] * gain; interleaved[2 * i + 1] = out[1][i] * gain; }
const file = path.join(process.cwd(), 'assets/audio/mix-ep36.flac');
writeFlac(interleaved, N, file);
console.log(`mix-ep36.flac ${(N / SR).toFixed(2)} s, ${(20 * Math.log10(peak * gain)).toFixed(2)} dBFS peak`);
