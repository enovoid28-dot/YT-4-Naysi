/**
 * Episode 21 soundtrack — "Tidur enam jam itu utang."
 *
 * The opposite of a score that pushes: 52 BPM, a room-tone drone, a felt tone
 * that falls rather than climbs, and a clock. The night is the instrument — a
 * soft tick that never rushes, a sub pulse on the heartbeat (the one thing still
 * working at 2 a.m.), water for the memory beat, a fridge hum, and one warm
 * chord at the end so the last line lands instead of fading.
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

let seed = 20261127;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const addTone = (buf, t0, dur, make, o = {}) => {
  const { gain = 1, pan = 0, arch = 0 } = o;
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

// 52 BPM: slower than a resting heart, so nothing on screen feels hurried.
const BPM = 52;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const totalBars = Math.ceil(tl.total / BAR);

// A minor with a major sixth: warm, domestic, unresolved at the top.
const CHORDS = [
  [110.0, 164.81, 220.0, 261.63], // Am
  [87.31, 130.81, 174.61, 220.0], // F
  [98.0, 146.83, 196.0, 246.94],  // G
  [130.81, 196.0, 261.63, 329.63], // C
];

const pad = (f, att, rel, cut = 700) => {
  const flt = lp(cut);
  return (t) => {
    const a = clamp(t / att);
    const r = clamp((rel - t) / (rel * 0.45));
    const drift = 1 + Math.sin(TAU * 0.05 * t) * 0.0014;
    const v = Math.sin(TAU * f * drift * t) * 0.5
      + Math.sin(TAU * f * 1.003 * t) * 0.26
      + Math.sin(TAU * f * 0.5 * t) * 0.20
      + Math.sin(TAU * f * 2 * t) * 0.04;
    return flt(v) * a * r;
  };
};

// felt tone: a soft struck string with no brightness at all
const felt = (f, decay = 2.2) => (t) => {
  const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 260));
  return (Math.sin(TAU * f * t) * 0.7 + Math.sin(TAU * f * 2 * t) * 0.06
    + Math.sin(TAU * f * 1.001 * t) * 0.3) * env;
};

function renderMusic() {
  const air = [new Float32Array(N), new Float32Array(N)];

  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    const opening = bar < 3;

    // the room: an octave under the chord, held
    addTone(music, t0, BAR * 2.0, pad(chord[0] / 2, 2.6, BAR * 2.0, 220), {
      gain: opening ? 0.12 : 0.16,
    });
    chord.forEach((f, i) => {
      addTone(music, t0 + i * 0.12, BAR * 2.2, pad(f, 3.2, BAR * 2.2, 620 + i * 90), {
        gain: 0.048 - i * 0.005,
        pan: (i - 1.5) * 0.30,
      });
    });

    // heartbeat: two soft thumps every other bar, the body still keeping time
    if (bar % 2 === 0) {
      const f = chord[0] / 4;
      addTone(music, t0, 0.9, (t) => Math.sin(TAU * f * t) * Math.exp(-t * 5.0) * (1 - Math.exp(-t * 70)), { gain: 0.11 });
      addTone(music, t0 + 0.30, 0.9, (t) => Math.sin(TAU * f * 1.01 * t) * Math.exp(-t * 6.0) * (1 - Math.exp(-t * 70)), { gain: 0.07 });
    }

    // the motif: a felt tone falling two notes, never resolving upward
    if (bar % 2 === 1) {
      [1, 0.75].forEach((k, i) => {
        addTone(music, t0 + i * BEAT * 1.6, 2.6, felt(chord[3] * 0.5 * k, 1.9 + i * 0.4), {
          gain: 0.045 - i * 0.008,
          pan: i ? -0.28 : 0.28,
        });
      });
    }

    // air: filtered noise breathing across the bar
    let n = noiseGen();
    const f = lp(2600);
    addTone(air, t0, BAR * 1.02, (t) => f(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.018, pan: bar % 2 === 0 ? -0.45 : 0.45,
    });
  }

  // tape hiss: the room is never digitally silent
  const hf = lp(6200);
  for (let i = 0; i < N; i++) {
    const v = hf(rand() * 2 - 1) * 0.005;
    air[0][i] += v;
    air[1][i] += v;
  }

  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) music[ch][i] += air[ch][i];

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
  air(t, g = 0.045, dur = 0.8, cut = 2400) {
    let n = noiseGen();
    const f = lp(cut);
    addTone(sfx, t, dur, (x) => f(n()) * Math.sin(Math.PI * clamp(x / dur)) * 0.9, { gain: g, pan: 0.16 });
  },
  boom(t, g = 0.10, f = 50) {
    addTone(sfx, t, 1.2, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 4.0), { gain: g });
    let n = noiseGen();
    const fl = lp(300);
    addTone(sfx, t, 0.5, (x) => fl(n()) * Math.exp(-x * 14) * 0.8, { gain: g * 0.45 });
  },
  ding(t, g = 0.035, f = 880, dur = 1.8) {
    addTone(sfx, t, dur, (x) => (Math.sin(TAU * f * x) * 0.55 + Math.sin(TAU * f * 2.01 * x) * 0.10) * Math.exp(-x * 2.2), {
      gain: g, pan: 0.20,
    });
  },
  tick(t, g = 0.030, f = 1200) {
    addTone(sfx, t, 0.06, (x) => (Math.sin(TAU * f * x) * 0.6 + Math.sin(TAU * f * 2.4 * x) * 0.2) * Math.exp(-x * 90), {
      gain: g, pan: -0.12,
    });
  },
  /** a clock escapement: two ticks, hard and small */
  tock(t, g = 0.032) {
    this.tick(t, g, 1500);
    this.tick(t + 0.5, g * 0.8, 1180);
  },
  rise(t, g = 0.06, dur = 2.4, f0 = 120, f1 = 620) {
    let n = noiseGen();
    const fl = lp(1400);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const sw = Math.sin(TAU * (f0 + (f1 - f0) * p * p) * x) * 0.20;
      return (fl(n()) * 0.6 + sw) * Math.sin(Math.PI * p);
    }, { gain: g, pan: -0.08 });
  },
  fall(t, g = 0.06, dur = 2.6, f0 = 380, f1 = 80) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return Math.sin(TAU * (f0 * Math.pow(f1 / f0, p)) * x) * Math.exp(-x * 0.5) * Math.sin(Math.PI * p) * 0.5;
    }, { gain: g });
  },
  /** one drop into still water */
  drop(t, g = 0.05, f = 640) {
    addTone(sfx, t, 1.4, (x) => {
      const ff = f * (1 + x * 2.4);
      return Math.sin(TAU * ff * x) * Math.exp(-x * 7);
    }, { gain: g, pan: 0.2 });
  },
  /** fridge hum, switched on */
  hum(t, g = 0.05, dur = 6) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const v = Math.sin(TAU * 58 * x) * 0.5 + Math.sin(TAU * 116 * x) * 0.2;
      return v * Math.sin(Math.PI * p);
    }, { gain: g });
  },
  stamp(t, g = 0.13) {
    let n = noiseGen();
    addTone(sfx, t, 0.14, (x) => n() * Math.exp(-x * 44), { gain: g * 0.5, pan: 0.1 });
    addTone(sfx, t, 0.7, (x) => {
      const f = 110 * Math.exp(-x * 4.5) + 42;
      return Math.sin(TAU * f * x) * Math.exp(-x * 8);
    }, { gain: g });
  },
};

/* -------------------------------- cues ----------------------------------- */

const scanStart = (i) => tl.scenes[i].start;

function renderSFX() {
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.air(sc.start - 0.30, 0.040, 0.8, 2000);
    SFX.boom(sc.start - 0.06, 0.048, 54);
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

  // s1 — the clock, and the debt coming up through the floor
  const s1 = scanStart(0);
  SFX.tock(s1 + 0.30, 0.030);
  SFX.tock(s1 + cap(0, 1) + 0.15, 0.028);
  for (let i = 0; i < 8; i++) SFX.tick(s1 + cap(0, 3) + 0.10 + i * 0.11, 0.013, 1000 + i * 30);
  SFX.boom(s1 + cap(0, 4) + 0.05, 0.085, 44);
  SFX.rise(s1 + cap(0, 4) + 0.10, 0.050, 3.0, 90, 320);
  SFX.ding(s1 + cap(0, 5) + 0.20, 0.032, 392, 2.6);

  // s2 — the bars, the pockets, the ten hours
  const s2 = scanStart(1);
  for (let i = 0; i < 5; i++) SFX.tick(s2 + cap(1, 2) + 0.20 + i * 0.13, 0.020, 900 + i * 40);
  SFX.ding(s2 + word(1, 2, 2) + 0.10, 0.045, 523, 2.4);
  SFX.boom(s2 + word(1, 2, 2) + 0.05, 0.070, 58);
  SFX.fall(s2 + cap(1, 3) + 0.10, 0.045, 2.2, 300, 90);

  // s3 — the road, the smear, the three seconds
  const s3 = scanStart(2);
  SFX.air(s3 + cap(2, 0) + 0.10, 0.045, 1.6, 1600);
  SFX.ding(s3 + word(2, 1, 0) + 0.10, 0.040, 660, 2.2);
  SFX.fall(s3 + cap(2, 2) + 0.10, 0.060, 3.0, 520, 110);
  SFX.boom(s3 + cap(2, 3) + 0.05, 0.090, 48);
  SFX.tick(s3 + word(2, 4, 0) + 0.10, 0.030, 900);

  // s4 — memory moving, then the water
  const s4 = scanStart(3);
  for (let i = 0; i < 10; i++) SFX.tick(s4 + cap(3, 1) + 0.20 + i * 0.10, 0.012, 1300 + i * 40);
  SFX.drop(s4 + cap(3, 2) + 0.20, 0.045, 560);
  SFX.drop(s4 + cap(3, 2) + 0.90, 0.038, 720);
  SFX.drop(s4 + word(3, 3, 0) + 0.30, 0.050, 420);

  // s5 — the blood, the curve, the crest
  const s5 = scanStart(4);
  SFX.rise(s5 + cap(4, 1) + 0.10, 0.050, 2.0, 120, 380);
  SFX.rise(s5 + cap(4, 2) + 0.10, 0.045, 2.4, 150, 520);
  SFX.boom(s5 + word(4, 3, 0) + 0.10, 0.070, 52);
  SFX.ding(s5 + word(4, 3, 0) + 0.20, 0.040, 330, 2.6);

  // s6 — the fridge
  const s6 = scanStart(5);
  SFX.hum(s6 + 0.20, 0.045, 9.0);
  SFX.rise(s6 + cap(5, 1) + 0.15, 0.045, 2.0, 140, 460);
  SFX.ding(s6 + cap(5, 3) + 0.20, 0.035, 587, 2.0);
  SFX.boom(s6 + word(5, 4, 0) + 0.10, 0.060, 50);

  // s7 — the cup and the clock
  const s7 = scanStart(6);
  SFX.air(s7 + cap(6, 0) + 0.10, 0.035, 1.4, 1200);
  SFX.tock(s7 + cap(6, 1) + 0.10, 0.026);
  SFX.tick(s7 + cap(6, 2) + 0.20, 0.022, 1400);
  SFX.ding(s7 + word(6, 3, 3) + 0.10, 0.038, 494, 2.4);
  SFX.ding(s7 + word(6, 3, 3) + 0.30, 0.030, 659, 2.2);

  // s8 — the month, the sixth hour, the price
  const s8 = scanStart(7);
  for (let i = 0; i < 14; i++) SFX.tick(s8 + 0.25 + i * 0.09, 0.010, 820 + i * 18);
  SFX.boom(s8 + word(7, 1, 2) + 0.10, 0.075, 46);
  SFX.ding(s8 + word(7, 1, 2) + 0.20, 0.036, 392, 2.8);
  SFX.stamp(s8 + word(7, 4, 0) + 0.20, 0.070);

  // s9 — the room again, then the question
  const s9 = scanStart(8);
  SFX.tock(s9 + 0.30, 0.026);
  SFX.tock(s9 + cap(8, 1) + 0.20, 0.024);
  SFX.rise(s9 + cap(8, 2) + 0.10, 0.045, 2.0, 160, 620);
  SFX.ding(s9 + cap(8, 3) + 0.20, 0.040, 523, 2.6);
  SFX.boom(s9 + cap(8, 4) + 0.15, 0.060, 52);
  SFX.ding(s9 + cap(8, 4) + 0.90, 0.038, 392, 3.0);
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
    const duck = 1 - 0.60 * smooth[Math.floor(i / block)];
    for (let ch = 0; ch < 2; ch++) {
      out[ch][i] = vo[ch][i] * 1.0 + music[ch][i] * 1.20 * duck + sfx[ch][i] * 0.92;
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

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep21.flac');
  const inter = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    inter[i * 2] = out[0][i];
    inter[i * 2 + 1] = out[1][i];
  }
  writeFlac(inter, N, file);
  console.log(`mix-ep21.flac  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
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
