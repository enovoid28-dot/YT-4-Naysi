/**
 * Episode 20 soundtrack — "Langit malam seharusnya terang."
 *
 * Episode 19 was a loop that would not stop. This one is the opposite: nothing
 * repeats, nothing resolves. 60 BPM, a low drone that widens as the universe
 * grows, a glass bell that climbs three notes and never lands, and air — lots of
 * air — so the silence under the VO reads as distance rather than as a gap.
 *
 * Sound design follows the argument: a rising shimmer for the light sphere, a
 * downward sweep for stretched space, crackle for the microwave wall, one heavy
 * thud for the date stamp.
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildTimeline } from '../src/timeline.mjs';
import { decodeVo, writeFlac } from '../src/audio.mjs';

const SR = 48000;
const tl = buildTimeline();
const N = Math.ceil((tl.total + 0.5) * SR);

const music = [new Float32Array(N), new Float32Array(N)];
const sfx = [new Float32Array(N), new Float32Array(N)];
const vo = [new Float32Array(N), new Float32Array(N)];

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

let seed = 20261126;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const addTone = (buf, t0, dur, make, o = {}) => {
  const { gain = 1, pan = 0, bufIdx = 0, arch = 0 } = o;
  const start = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  const gl = Math.cos((clamp(pan, -1, 1) + 1) * Math.PI * 0.25) * gain;
  const gr = Math.sin((clamp(pan, -1, 1) + 1) * Math.PI * 0.25) * gain;
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx < 0 || idx >= N) continue;
    const x = i / SR;
    let v = make(x, i);
    if (arch > 0) v *= Math.sin(Math.PI * clamp(x / arch));
    buf[0][idx] += v * gl;
    buf[1][idx] += v * gr;
  }
};

const lp = (cut) => {
  let y = 0;
  return (x) => {
    const a = clamp((TAU * cut) / SR, 0, 1);
    y += a * (x - y);
    return y;
  };
};
const hp = (cut) => {
  let px = 0;
  let py = 0;
  const rc = 1 / (TAU * cut);
  const a = rc / (rc + 1 / SR);
  return (x) => {
    const y = a * (py + x - px);
    px = x;
    py = y;
    return y;
  };
};
const noiseGen = () => () => rand() * 2 - 1;

/* --------------------------------- score --------------------------------- */

// 60 BPM: one bar every four seconds, so the music changes at the speed of a
// spoken paragraph instead of at the speed of a beat.
const BPM = 60;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const totalBars = Math.ceil(tl.total / BAR);

// E minor with a raised sixth — wide, open, a little unresolved.
const CHORDS = [
  [82.41, 123.47, 164.81, 246.94], // Em9
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
  [98.0, 146.83, 196.0, 246.94],   // G/B
  [110.0, 164.81, 220.0, 293.66],  // A sus
];

const pad = (f, att, rel, cut = 900) => {
  const flt = lp(cut);
  return (t) => {
    const a = clamp(t / att);
    const r = clamp((rel - t) / (rel * 0.45));
    const drift = 1 + Math.sin(TAU * 0.07 * t) * 0.0016;
    const v = Math.sin(TAU * f * drift * t) * 0.5
      + Math.sin(TAU * f * 1.004 * t) * 0.28
      + Math.sin(TAU * f * 0.5 * t) * 0.22
      + Math.sin(TAU * f * 2 * t) * 0.06;
    return flt(v) * a * r;
  };
};

// glass bell: FM, long tail, a breath of inharmonic partials
const bell = (f, decay = 3.4) => (t) => {
  const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 420));
  const mod = Math.sin(TAU * f * 3.01 * t) * Math.exp(-t * 6) * 1.4;
  return (Math.sin(TAU * f * t + mod) * 0.7 + Math.sin(TAU * f * 2.005 * t) * 0.14) * env;
};

function renderMusic() {
  const air = [new Float32Array(N), new Float32Array(N)];

  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    const opening = bar < 4;

    // the drone: an octave under the chord, held for two bars
    addTone(music, t0, BAR * 1.9, pad(chord[0] / 2, 2.2, BAR * 1.9, 240), {
      gain: opening ? 0.13 : 0.17,
    });
    // the chord itself, drifting slightly off-centre
    chord.forEach((f, i) => {
      addTone(music, t0 + i * 0.09, BAR * 2.05, pad(f, 2.8, BAR * 2.05, 760 + i * 120), {
        gain: 0.055 - i * 0.006,
        pan: (i - 1.5) * 0.34,
      });
    });

    // a sub pulse on the downbeat, every other bar: a heartbeat with no hurry
    if (bar % 2 === 0) {
      addTone(music, t0, 1.6, (t) => {
        const f = chord[0] / 4;
        return Math.sin(TAU * f * t) * Math.exp(-t * 2.4) * (1 - Math.exp(-t * 90));
      }, { gain: 0.10 });
    }

    // the motif: three notes climbing, never landing. It arrives every four
    // bars and is always interrupted by the next bar.
    if (bar % 4 === 0) {
      const top = chord[3] * 2;
      [1, 1.5, 1.25].forEach((k, i) => {
        addTone(music, t0 + i * BEAT * 1.25, 3.0, bell(top * k, 2.6 + i * 0.5), {
          gain: 0.030 - i * 0.004,
          pan: i % 2 === 0 ? 0.32 : -0.32,
        });
      });
    }

    // air: filtered noise that swells across the bar, panned wide
    let n = noiseGen();
    const f = lp(3200);
    addTone(air, t0, BAR * 1.02, (t) => f(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.022, pan: bar % 2 === 0 ? -0.5 : 0.5,
    });
  }

  // a very high shimmer, opening over the first 40 seconds: the sky becoming visible
  {
    let n = noiseGen();
    const f = hp(5200);
    addTone(air, 0, 40, (t) => {
      const g = clamp(t / 26) * clamp((40 - t) / 12);
      return f(n()) * g * 0.8;
    }, { gain: 0.018, pan: 0 });
  }

  // vinyl-free floor: a soft tape hiss so nothing is digitally silent
  const hf = lp(6800);
  for (let i = 0; i < N; i++) {
    const v = hf(rand() * 2 - 1) * 0.004;
    air[0][i] += v;
    air[1][i] += v;
  }

  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < N; i++) music[ch][i] += air[ch][i];
  }

  const fin = 2.0 * SR;
  const fout = 3.0 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fin), clamp((N - i) / fout));
    music[0][i] *= g;
    music[1][i] *= g;
  }
}

/* ---------------------------------- sfx ---------------------------------- */

const SFX = {
  /** air moving past the lens, used on every cut */
  air(t, g = 0.05, dur = 0.9, cut = 2600) {
    let n = noiseGen();
    const f = lp(cut);
    addTone(sfx, t, dur, (x) => f(n()) * Math.sin(Math.PI * clamp(x / dur)) * 0.9, { gain: g, pan: 0.18 });
  },
  /** a distant, low impact under a hard cut */
  boom(t, g = 0.12, f = 52) {
    addTone(sfx, t, 1.1, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 4.4), { gain: g });
    let n = noiseGen();
    const fl = lp(320);
    addTone(sfx, t, 0.5, (x) => fl(n()) * Math.exp(-x * 14) * 0.8, { gain: g * 0.5 });
  },
  /** a number landing in glass */
  ding(t, g = 0.04, f = 1046, dur = 1.6) {
    addTone(sfx, t, dur, (x) => (Math.sin(TAU * f * x) * 0.6 + Math.sin(TAU * f * 2.76 * x) * 0.18) * Math.exp(-x * 2.6), {
      gain: g, pan: 0.22,
    });
  },
  /** a dark tick, for a line of text or a count */
  tick(t, g = 0.035, f = 1400) {
    addTone(sfx, t, 0.05, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 120), { gain: g, pan: -0.15 });
  },
  /** a light sphere opening outward: rising band of air plus a sine sweep */
  rise(t, g = 0.09, dur = 2.6, f0 = 140, f1 = 900) {
    let n = noiseGen();
    const fl = lp(1800);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const sw = Math.sin(TAU * (f0 + (f1 - f0) * p * p) * x) * 0.22;
      return (fl(n()) * 0.7 + sw) * Math.sin(Math.PI * p);
    }, { gain: g, pan: -0.1 });
  },
  /** space stretching: a slow fall */
  fall(t, g = 0.07, dur = 3.0, f0 = 420, f1 = 70) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return Math.sin(TAU * (f0 * Math.pow(f1 / f0, p)) * x) * Math.exp(-x * 0.6) * Math.sin(Math.PI * p) * 0.5;
    }, { gain: g });
  },
  /** the microwave wall: crackle that never settles */
  crackle(t, g = 0.05, dur = 2.4, cut = 4200) {
    let n = noiseGen();
    const fl = lp(cut);
    let last = 0;
    addTone(sfx, t, dur, (x) => {
      const burst = rand() < 0.0016 ? 1 : 0;
      last = Math.max(last * 0.94, burst);
      return fl(n()) * (0.22 + last * 0.8) * Math.sin(Math.PI * clamp(x / dur));
    }, { gain: g, pan: 0.2 });
  },
  /** a stamp coming down on the frame */
  stamp(t, g = 0.16) {
    let n = noiseGen();
    addTone(sfx, t, 0.14, (x) => n() * Math.exp(-x * 44), { gain: g * 0.5, pan: 0.1 });
    addTone(sfx, t, 0.7, (x) => {
      const f = 120 * Math.exp(-x * 4.5) + 44;
      return Math.sin(TAU * f * x) * Math.exp(-x * 8);
    }, { gain: g });
  },
  /** a star going out: a short downward blip with no tail */
  extinct(t, g = 0.05, f = 880) {
    addTone(sfx, t, 0.5, (x) => {
      const ff = f * Math.exp(-x * 6);
      return Math.sin(TAU * ff * x) * Math.exp(-x * 9);
    }, { gain: g, pan: 0.3 });
  },
};

/* -------------------------------- cues ----------------------------------- */

const scanStart = (i) => tl.scenes[i].start;

function renderSFX() {
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.air(sc.start - 0.30, 0.045, 0.8, 2400);
    SFX.boom(sc.start - 0.06, 0.055, 56);
  });

  const cap = (i, j) => {
    const sc = tl.scenes[i];
    return sc.start + (sc.captions[j] ? sc.captions[j].from : 0);
  };
  const word = (i, j, k) => {
    const sc = tl.scenes[i];
    const card = sc.captions[j];
    if (!card || !card.words[k]) return cap(i, j);
    return sc.start + card.words[k].start;
  };

  // s1 — the sky floods, then folds to black
  const s1 = scanStart(0);
  SFX.rise(s1 + cap(0, 1) + 0.10, 0.075, 3.2, 120, 1200);
  SFX.boom(s1 + cap(0, 3) + 0.05, 0.10, 46);
  SFX.fall(s1 + cap(0, 3) + 0.10, 0.05, 2.4, 300, 60);
  SFX.tick(s1 + cap(0, 4) + 0.25, 0.045, 720);

  // s2 — the dome fills with sight-lines
  const s2 = scanStart(1);
  for (let i = 0; i < 13; i++) SFX.tick(s2 + cap(1, 2) + 0.12 + i * 0.085, 0.020, 1200 + i * 60);
  SFX.rise(s2 + cap(1, 3) + 0.10, 0.070, 2.4, 160, 1400);
  SFX.ding(s2 + cap(1, 5) + 0.20, 0.045, 659);
  SFX.boom(s2 + cap(1, 5) + 0.05, 0.070, 58);

  // s3 — the swarm, the zeros, the ruler
  const s3 = scanStart(2);
  for (let i = 0; i < 23; i++) SFX.tick(s3 + cap(2, 1) + 0.10 + i * 0.035, 0.012, 900 + i * 22);
  SFX.ding(s3 + word(2, 0, 3) + 0.06, 0.040, 1318);
  SFX.ding(s3 + word(2, 2, 3) + 0.05, 0.038, 988);
  SFX.ding(s3 + word(2, 3, 3) + 0.05, 0.045, 784);

  // s4 — the light sphere opens, and stops
  const s4 = scanStart(3);
  SFX.rise(s4 + cap(3, 1) + 0.20, 0.095, 4.2, 90, 780);
  SFX.ding(s4 + word(3, 1, 0) + 0.10, 0.040, 587);
  SFX.air(s4 + cap(3, 3) + 0.10, 0.040, 1.2, 1500);
  SFX.ding(s4 + cap(3, 4) + 0.20, 0.040, 440, 2.4);

  // s5 — the bubble, and the dark outside it
  const s5 = scanStart(4);
  SFX.rise(s5 + cap(4, 1) + 0.10, 0.075, 1.8, 130, 520);
  SFX.ding(s5 + word(4, 1, 0) + 0.08, 0.045, 1046);
  for (let i = 0; i < 9; i++) SFX.tick(s5 + cap(4, 2) + 0.15 + i * 0.10, 0.018, 1600);
  SFX.boom(s5 + cap(4, 3) + 0.05, 0.060, 62);
  SFX.ding(s5 + cap(4, 4) + 0.15, 0.038, 392, 2.0);

  // s6 — the wave stretching red
  const s6 = scanStart(5);
  SFX.fall(s6 + cap(5, 1) + 0.10, 0.075, 3.4, 520, 90);
  for (let i = 0; i < 7; i++) SFX.tick(s6 + cap(5, 1) + 0.30 + i * 0.42, 0.016, 1800 - i * 120);
  SFX.ding(s6 + word(5, 2, 3) + 0.10, 0.045, 330, 2.4);
  SFX.boom(s6 + cap(5, 3) + 0.10, 0.075, 48);
  SFX.stamp(s6 + cap(5, 4) + 0.15, 0.085);

  // s7 — the microwave wall
  const s7 = scanStart(6);
  SFX.crackle(s7 + cap(6, 1) + 0.10, 0.055, 4.0, 5200);
  SFX.ding(s7 + word(6, 2, 0) + 0.10, 0.045, 1046);
  SFX.crackle(s7 + cap(6, 3) + 0.10, 0.040, 3.0, 3400);

  // s8 — the alternative sky, then the date
  const s8 = scanStart(7);
  SFX.rise(s8 + cap(7, 1) + 0.10, 0.070, 2.2, 200, 1500);
  SFX.boom(s8 + cap(7, 2) + 0.05, 0.075, 58);
  SFX.rise(s8 + cap(7, 2) + 0.10, 0.060, 2.6, 220, 1700);
  SFX.stamp(s8 + cap(7, 3) + 0.30, 0.15);
  SFX.ding(s8 + cap(7, 3) + 0.55, 0.040, 293, 3.0);

  // s9 — back to the viewer
  const s9 = scanStart(8);
  SFX.ding(s9 + cap(8, 1) + 0.30, 0.045, 880, 2.4);
  SFX.extinct(s9 + cap(8, 2) + 0.25, 0.045, 1046);
  SFX.extinct(s9 + cap(8, 2) + 1.20, 0.040, 784);
  SFX.rise(s9 + cap(8, 3) + 0.10, 0.055, 1.8, 160, 700);
  SFX.ding(s9 + cap(8, 3) + 0.90, 0.045, 659, 2.6);
  SFX.ding(s9 + tl.scenes[8].dur - 1.6, 0.040, 440, 2.6);
}

/* ---------------------------------- vo ----------------------------------- */

function loadVO() {
  tl.scenes.forEach((sc) => {
    const wav = decodeVo(sc.id);
    const start = Math.floor(sc.audioStart * SR);
    const n = wav.frames;
    for (let i = 0; i < n; i++) {
      const idx = start + i;
      if (idx < 0 || idx >= N) continue;
      vo[0][idx] = wav.l(i);
      vo[1][idx] = wav.r(i);
    }
  });
}

/* --------------------------------- mix ----------------------------------- */

function mix() {
  const block = Math.floor(SR * 0.01);
  const env = new Float32Array(Math.ceil(N / block) + 2);
  for (let b = 0; b < env.length; b++) {
    let peak = 0;
    for (let i = b * block; i < Math.min(N, (b + 1) * block); i++) {
      peak = Math.max(peak, Math.abs(vo[0][i]), Math.abs(vo[1][i]));
    }
    env[b] = peak;
  }
  const smooth = new Float32Array(env.length);
  let v = 0;
  for (let b = 0; b < env.length; b++) {
    const target = clamp(env[b] * 5);
    v += (target - v) * (target > v ? 0.35 : 0.045);
    smooth[b] = v;
  }

  const out = [new Float32Array(N), new Float32Array(N)];
  for (let i = 0; i < N; i++) {
    const duck = 1 - 0.58 * smooth[Math.floor(i / block)];
    for (let ch = 0; ch < 2; ch++) {
      out[ch][i] = vo[ch][i] * 1.0 + music[ch][i] * 1.22 * duck + sfx[ch][i] * 0.92;
    }
  }

  for (let ch = 0; ch < 2; ch++) {
    const f = hp(24);
    for (let i = 0; i < N; i++) out[ch][i] = f(out[ch][i]);
  }

  let peak = 0;
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[ch][i]));
  const pre = peak > 0 ? 0.76 / peak : 1;
  const knee = 0.62;
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < N; i++) {
      let x = out[ch][i] * pre;
      const a = Math.abs(x);
      if (a > knee) {
        const over = a - knee;
        const lim = knee + over / (1 + over / (0.90 - knee));
        x = Math.sign(x) * lim;
      }
      out[ch][i] = x;
    }
  }
  let pk = 0;
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(out[ch][i]));
  const norm = pk > 0 ? 0.89 / pk : 1;
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) out[ch][i] *= norm;

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep20.flac');
  const inter = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    inter[i * 2] = out[0][i];
    inter[i * 2 + 1] = out[1][i];
  }
  writeFlac(inter, N, file);
  console.log(`mix-ep20.flac  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
}

loadVO();
renderMusic();
renderSFX();

const rms = (arr) => Math.sqrt(arr.reduce((a, v) => a + v * v, 0) / arr.length);
const db = (x) => (20 * Math.log10(Math.max(x, 1e-9))).toFixed(1);
console.log('vo   rms', db(rms(vo[0])), 'dB');
console.log('mus  rms', db(rms(music[0])), 'dB');
console.log('sfx  rms', db(rms(sfx[0])), 'dB');

mix();
