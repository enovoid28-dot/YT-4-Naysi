/**
 * Episode 24 soundtrack — "Suara terkeras dalam sejarah ada di Indonesia."
 *
 * A documentary bed in D minor at 64 BPM: a low drone, a slow pulse, a felt
 * motif that falls. The sound design carries the story: a blast on
 * "meledak", far-off gunfire for Rodrigues, a needle that whines up to the
 * crack of glass, a muffled world after the eardrum goes, seven pen strokes
 * on the barogram, a wave that lands and leaves a silence for the count, a
 * fire bell in New York, typing under the last question.
 */
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

let seed = 20261883;
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
  const a = clamp((TAU * cut) / SR, 0, 1);
  return (x) => {
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

const BPM = 64;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const totalBars = Math.ceil(tl.total / BAR) + 1;

// D minor, then the flat six and three: dark, wide, never quite home
const CHORDS = [
  [73.42, 110.0, 146.83, 174.61], // Dm
  [58.27, 87.31, 116.54, 146.83], // Bb
  [87.31, 130.81, 174.61, 220.0], // F
  [65.41, 98.0, 130.81, 164.81], // C
];

const pad = (f, att, rel, cut = 700) => {
  const flt = lp(cut);
  return (t) => {
    const a = clamp(t / att);
    const r = clamp((rel - t) / (rel * 0.45));
    const drift = 1 + Math.sin(TAU * 0.05 * t) * 0.0016;
    const v = Math.sin(TAU * f * drift * t) * 0.5
      + Math.sin(TAU * f * 1.004 * t) * 0.26
      + Math.sin(TAU * f * 0.5 * t) * 0.22
      + Math.sin(TAU * f * 2 * t) * 0.03;
    return flt(v) * a * r;
  };
};

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
    const opening = bar < 2;
    addTone(music, t0, BAR * 2.0, pad(chord[0] / 2, 2.4, BAR * 2.0, 200), { gain: opening ? 0.14 : 0.18 });
    chord.forEach((f, i) => {
      addTone(music, t0 + i * 0.1, BAR * 2.2, pad(f, 3.0, BAR * 2.2, 560 + i * 80), {
        gain: 0.046 - i * 0.005,
        pan: (i - 1.5) * 0.32,
      });
    });
    // the pulse: a low drum on one and three
    for (const k of [0, 2]) {
      const f = chord[0] / 2;
      addTone(music, t0 + k * BEAT, 1.0, (t) => Math.sin(TAU * f * (1 + 0.6 * Math.exp(-t * 30)) * t) * Math.exp(-t * 4.6) * (1 - Math.exp(-t * 90)), {
        gain: k === 0 ? 0.13 : 0.08,
      });
    }
    if (bar % 2 === 1) {
      [1, 0.84, 0.75].forEach((k, i) => {
        addTone(music, t0 + i * BEAT * 1.1, 2.6, felt(chord[3] * k, 1.8 + i * 0.4), {
          gain: 0.04 - i * 0.008,
          pan: i % 2 ? -0.3 : 0.3,
        });
      });
    }
    const n = noiseGen();
    const fl = lp(2200);
    addTone(air, t0, BAR * 1.02, (t) => fl(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.016, pan: bar % 2 === 0 ? -0.45 : 0.45,
    });
  }
  const hf = lp(6000);
  for (let i = 0; i < N; i++) {
    const v = hf(rand() * 2 - 1) * 0.005;
    air[0][i] += v;
    air[1][i] += v;
  }
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) music[ch][i] += air[ch][i];
  const fin = 1.2 * SR;
  const fout = 3.0 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fin), clamp((N - i) / fout));
    music[0][i] *= g;
    music[1][i] *= g;
  }
}

/** pull the music under water for a moment (the ear after it tears) */
function muffle(t0, dur) {
  const s = Math.floor(t0 * SR);
  const e = Math.min(N, Math.floor((t0 + dur) * SR));
  for (let ch = 0; ch < 2; ch++) {
    let y = 0;
    for (let i = Math.max(0, s - SR); i < e; i++) {
      const tt = (i - s) / SR;
      const k = i < s ? 0 : Math.sin(Math.PI * clamp(tt / dur)) ** 0.5;
      const fc = 18000 * (1 - k) + 260 * k;
      const a = 1 - Math.exp((-TAU * fc) / SR);
      y += a * (music[ch][i] - y);
      music[ch][i] = music[ch][i] * (1 - k) + y * k * 0.8;
    }
  }
}

/** dip the music for a span (the count of the dead) */
function dip(t0, dur, depth = 0.6) {
  const s = Math.floor(t0 * SR);
  const e = Math.min(N, Math.floor((t0 + dur) * SR));
  for (let i = Math.max(0, s); i < e; i++) {
    const tt = (i - s) / SR;
    const k = Math.sin(Math.PI * clamp(tt / dur)) ** 0.6 * depth;
    music[0][i] *= 1 - k;
    music[1][i] *= 1 - k;
  }
}

/* ---------------------------------- sfx ---------------------------------- */

const SFX = {
  air(t, g = 0.045, dur = 0.8, cut = 2400, pan = 0.16) {
    const n = noiseGen();
    const f = lp(cut);
    addTone(sfx, t, dur, (x) => f(n()) * Math.sin(Math.PI * clamp(x / dur)) * 0.9, { gain: g, pan });
  },
  boom(t, g = 0.1, f = 50) {
    addTone(sfx, t, 1.2, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 4.0), { gain: g });
    const n = noiseGen();
    const fl = lp(300);
    addTone(sfx, t, 0.5, (x) => fl(n()) * Math.exp(-x * 14) * 0.8, { gain: g * 0.45 });
  },
  /** the eruption: sub drop, a body of low noise, a short crack, a long rumble */
  blast(t, g = 0.2) {
    addTone(sfx, t, 3.4, (x) => {
      const f = 28 + 34 * Math.exp(-x * 2.2);
      return Math.sin(TAU * f * x) * Math.exp(-x * 1.1) * (1 - Math.exp(-x * 200));
    }, { gain: g });
    let n = noiseGen();
    let fl = lp(260);
    let fl2 = lp(260);
    addTone(sfx, t, 3.0, (x) => fl2(fl(n())) * 2.6 * Math.exp(-x * 1.3) * (1 - Math.exp(-x * 120)), { gain: g * 0.9, pan: -0.1 });
    n = noiseGen();
    const h = hp(900);
    addTone(sfx, t, 0.12, (x) => h(n()) * Math.exp(-x * 40), { gain: g * 0.18, pan: 0.1 });
    n = noiseGen();
    fl = lp(110);
    addTone(sfx, t + 0.4, 4.5, (x) => fl(n()) * 3 * (0.6 + 0.4 * Math.sin(x * 3.1)) * Math.exp(-x * 0.7) * clamp(x / 0.6), { gain: g * 0.55, pan: 0.15 });
  },
  /** gunfire heard from very far away: all body, no edge */
  cannon(t, g = 0.06, pan = -0.3) {
    addTone(sfx, t, 1.4, (x) => Math.sin(TAU * (46 + 20 * Math.exp(-x * 8)) * x) * Math.exp(-x * 3.2) * (1 - Math.exp(-x * 160)), { gain: g, pan });
    const n = noiseGen();
    const fl = lp(180);
    addTone(sfx, t, 0.9, (x) => fl(n()) * 2 * Math.exp(-x * 5), { gain: g * 0.6, pan });
  },
  ding(t, g = 0.035, f = 880, dur = 1.8, pan = 0.2) {
    addTone(sfx, t, dur, (x) => (Math.sin(TAU * f * x) * 0.55 + Math.sin(TAU * f * 2.01 * x) * 0.1) * Math.exp(-x * 2.2), { gain: g, pan });
  },
  tick(t, g = 0.03, f = 1200, pan = -0.12) {
    addTone(sfx, t, 0.06, (x) => (Math.sin(TAU * f * x) * 0.6 + Math.sin(TAU * f * 2.4 * x) * 0.2) * Math.exp(-x * 90), { gain: g, pan });
  },
  rise(t, g = 0.06, dur = 2.4, f0 = 120, f1 = 620) {
    const n = noiseGen();
    const fl = lp(1400);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const sw = Math.sin(TAU * (f0 + (f1 - f0) * p * p) * x) * 0.2;
      return (fl(n()) * 0.6 + sw) * Math.sin(Math.PI * p);
    }, { gain: g, pan: -0.08 });
  },
  /** the needle: a thin whine that climbs with it */
  whine(t, dur, g = 0.02, f0 = 180, f1 = 1500) {
    let ph = 0;
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      ph += (TAU * (f0 + (f1 - f0) * p * p)) / SR;
      return Math.sin(ph) * p * (1 - clamp((x - dur + 0.05) / 0.05));
    }, { gain: g, pan: 0.1 });
  },
  /** glass giving way */
  crack(t, g = 0.06) {
    for (let k = 0; k < 9; k++) {
      const n = noiseGen();
      const h = hp(2400 + k * 300);
      const tk = t + k * 0.018 + rand() * 0.02;
      addTone(sfx, tk, 0.07, (x) => h(n()) * Math.exp(-x * 70), { gain: g * (1 - k * 0.07), pan: (rand() - 0.5) * 0.6 });
    }
  },
  /** what is left after the eardrum: a high ring */
  ring(t, g = 0.012, dur = 2.2, f = 3900) {
    addTone(sfx, t, dur, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 1.4) * clamp(x / 0.05), { gain: g, pan: 0 });
  },
  /** a pen scratch on the drum of a barograph */
  scratch(t, g = 0.03) {
    const n = noiseGen();
    const h = hp(1800);
    addTone(sfx, t, 0.09, (x) => h(n()) * Math.sin(Math.PI * clamp(x / 0.09)), { gain: g, pan: 0.25 });
  },
  /** water: a long rush that thickens and then lands */
  rush(t, dur, g = 0.06) {
    const n = noiseGen();
    const fl = lp(900);
    const fl2 = lp(900);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return fl2(fl(n())) * 2.2 * p * p;
    }, { gain: g, pan: -0.15 });
  },
  crash(t, g = 0.12) {
    let n = noiseGen();
    const fl = lp(600);
    addTone(sfx, t, 2.6, (x) => fl(n()) * 2.4 * Math.exp(-x * 1.6) * (1 - Math.exp(-x * 60)), { gain: g, pan: 0.1 });
    addTone(sfx, t, 1.6, (x) => Math.sin(TAU * (40 + 16 * Math.exp(-x * 5)) * x) * Math.exp(-x * 2.2), { gain: g * 0.8 });
    n = noiseGen();
    const h = hp(2500);
    addTone(sfx, t + 0.05, 1.8, (x) => h(n()) * Math.exp(-x * 2.4) * 0.5, { gain: g * 0.3, pan: -0.2 });
  },
  /** a brass fire bell, struck again and again */
  bell(t, g = 0.03, hits = 8, gap = 0.3) {
    const parts = [[520, 1, 2.2], [1092, 0.5, 2.8], [1418, 0.32, 3.6], [2210, 0.18, 5], [3040, 0.1, 7]];
    for (let k = 0; k < hits; k++) {
      const tk = t + k * gap;
      const kk = 1 - k / (hits + 2);
      addTone(sfx, tk, 1.6, (x) => parts.reduce((s, [f, a, d]) => s + Math.sin(TAU * f * x) * a * Math.exp(-x * d), 0) * (1 - Math.exp(-x * 400)), {
        gain: g * kk, pan: 0.35,
      });
    }
  },
  stamp(t, g = 0.12) {
    const n = noiseGen();
    addTone(sfx, t, 0.14, (x) => n() * Math.exp(-x * 44), { gain: g * 0.5, pan: 0.1 });
    addTone(sfx, t, 0.7, (x) => {
      const f = 110 * Math.exp(-x * 4.5) + 42;
      return Math.sin(TAU * f * x) * Math.exp(-x * 8);
    }, { gain: g });
  },
  /** a mountain clearing its throat */
  rumble(t, dur, g = 0.05) {
    const n = noiseGen();
    const fl = lp(90);
    addTone(sfx, t, dur, (x) => fl(n()) * 3.2 * Math.sin(Math.PI * clamp(x / dur)) * (0.7 + 0.3 * Math.sin(x * 5.3)), { gain: g, pan: -0.1 });
  },
  key(t, g = 0.016) {
    const n = noiseGen();
    const h = hp(1500);
    addTone(sfx, t, 0.03, (x) => h(n()) * Math.exp(-x * 160), { gain: g, pan: -0.2 + rand() * 0.4 });
    addTone(sfx, t, 0.04, (x) => Math.sin(TAU * 240 * x) * Math.exp(-x * 120), { gain: g * 0.5 });
  },
};

/* -------------------------------- cues ----------------------------------- */

function renderSFX() {
  const S = (i) => tl.scenes[i].start;
  const cap = (i, j) => {
    const sc = tl.scenes[i];
    return sc.start + (sc.captions[j] ? sc.captions[j].from : 0);
  };
  const W = (i, j, k) => {
    const sc = tl.scenes[i];
    const c = sc.captions[j];
    if (!c || !c.words[k]) return cap(i, j);
    return sc.start + c.words[k].start;
  };
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.air(sc.start - 0.3, 0.036, 0.8, 2000);
    SFX.boom(sc.start - 0.05, 0.04, 54);
  });

  // s1 — KRAKATAU: a pulse, the whip, the year, the blast
  SFX.air(0.0, 0.05, 1.2, 1600);
  SFX.boom(W(0, 0, 1) - 0.04, 0.085, 44);
  SFX.ding(W(0, 0, 6) + 0.05, 0.03, 587, 2.2);
  SFX.air(W(0, 1, 0) - 0.3, 0.07, 0.7, 3200, -0.2);
  for (let k = 0; k < 9; k++) SFX.tick(W(0, 1, 1) + k * 0.44, 0.012, 1100 + k * 30);
  SFX.rise(W(0, 1, 7) - 0.6, 0.05, 1.5, 100, 520);
  SFX.blast(W(0, 1, 8) - 0.06, 0.24);

  // s2 — 4.800 KM: the front spreads, gunfire far away
  SFX.air(W(1, 0, 0), 0.05, 3.4, 900, 0.3);
  SFX.cannon(W(1, 0, 7) + 0.35, 0.05, -0.4);
  SFX.cannon(W(1, 0, 7) + 0.95, 0.04, -0.4);
  SFX.cannon(W(1, 0, 7) + 1.45, 0.032, -0.4);
  SFX.ding(W(1, 1, 4) + 0.3, 0.032, 659, 2.2);

  // s3 — 170 dB: the needle climbs, glass breaks; the eardrum goes
  SFX.whine(W(2, 0, 3) - 0.35, W(2, 0, 6) - W(2, 0, 3) + 0.55, 0.016);
  SFX.crack(W(2, 0, 6) + 0.2, 0.06);
  SFX.boom(W(2, 0, 6) + 0.18, 0.06, 48);
  for (let k = 0; k < 6; k++) SFX.boom(W(2, 1, 3) + k * 0.36, 0.022 + k * 0.004, 60);
  const tPecah = W(2, 1, 8) - 0.05;
  SFX.boom(tPecah, 0.08, 40);
  SFX.ring(tPecah + 0.05, 0.011, 2.2);
  muffle(tPecah, 1.7);

  // s4 — 3,5 KALI: seven passes, then seven pen strokes
  const sc4 = tl.scenes[3];
  const tA0 = S(3) + 0.5;
  const tA1 = S(3) + sc4.captions[0].words[6].start + 0.3;
  const tB0 = S(3) + sc4.captions[1].words[0].start - 0.1 + 0.12;
  const PASS = [104.35, 255.65, 464.35, 615.65, 824.35, 975.65, 1184.35];
  PASS.forEach((th, k) => {
    SFX.air(tA0 + (th / 1260) * (tA1 - tA0) - 0.12, 0.022, 0.32, 3000, k % 2 ? -0.4 : 0.4);
    SFX.scratch(tB0 + (th / 1260) * 2.95, 0.03);
    SFX.tick(tB0 + (th / 1260) * 2.95, 0.014, 900 + k * 60, 0.25);
  });
  SFX.ding(tB0 + (PASS[6] / 1260) * 2.95 + 0.1, 0.032, 784, 2.2);

  // s5 — TSUNAMI: the rush, the landing, a silence for the count
  SFX.rush(cap(4, 0), 2.6, 0.035);
  const tEnd = W(4, 1, 4) + 0.1;
  SFX.rush(W(4, 1, 0), tEnd - W(4, 1, 0), 0.07);
  SFX.crash(tEnd, 0.11);
  dip(tEnd + 0.4, 3.6, 0.55);
  SFX.ding(W(4, 1, 10) + 0.35, 0.022, 440, 2.6);

  // s6 — LANGIT MERAH: wind over the planet, a chime, the fire bell, a stamp
  SFX.air(S(5) + 0.2, 0.04, 2.4, 700, -0.3);
  SFX.ding(W(5, 1, 1), 0.026, 523, 2.4);
  SFX.bell(W(5, 1, 4) - 0.2, 0.026, 9, 0.3);
  SFX.stamp(W(5, 1, 10) + 0.35, 0.09);

  // s7 — ANAK KRAKATAU: the mountain breathes; the question
  SFX.rumble(W(6, 0, 3) - 0.2, 3.4, 0.05);
  SFX.boom(W(6, 0, 4), 0.05, 46);
  SFX.rise(cap(6, 1) - 0.4, 0.04, 1.8, 140, 560);
  const tKom = W(6, 1, 2);
  for (let k = 0; k < 24; k++) SFX.key(tKom + k * 0.07 + rand() * 0.02, 0.014);
  SFX.ding(W(6, 1, 5), 0.03, 659, 2.6);
  SFX.ding(W(6, 1, 8) + 0.4, 0.03, 523, 3.0);
}

/* ---------------------------------- vo ----------------------------------- */

function loadVO() {
  tl.scenes.forEach((sc) => {
    const wav = decodeVo(sc.id);
    const start = Math.floor(sc.audioStart * SR);
    for (let i = 0; i < wav.frames; i++) {
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
    for (let i = b * block; i < Math.min(N, (b + 1) * block); i++) peak = Math.max(peak, Math.abs(vo[0][i]), Math.abs(vo[1][i]));
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
    const d = smooth[Math.floor(i / block)];
    const duckM = 1 - 0.6 * d;
    const duckS = 1 - 0.25 * d;
    for (let ch = 0; ch < 2; ch++) out[ch][i] = vo[ch][i] + music[ch][i] * 1.2 * duckM + sfx[ch][i] * 0.95 * duckS;
  }
  for (let ch = 0; ch < 2; ch++) {
    const f = hp(24);
    for (let i = 0; i < N; i++) out[ch][i] = f(out[ch][i]);
  }
  let peak = 0;
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[ch][i]));
  // anchor the level on the voice, not on the blast: the limiter takes the rest
  let vpk = 0;
  for (let i = 0; i < N; i++) vpk = Math.max(vpk, Math.abs(vo[0][i]));
  void peak;
  const pre = 0.7 / Math.max(vpk, 1e-6);
  const knee = 0.62;
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < N; i++) {
      let x = out[ch][i] * pre;
      const a = Math.abs(x);
      if (a > knee) {
        const over = a - knee;
        x = Math.sign(x) * (knee + over / (1 + over / (0.9 - knee)));
      }
      out[ch][i] = x;
    }
  }
  let pk = 0;
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(out[ch][i]));
  const norm = pk > 0 ? 0.89 / pk : 1;
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) out[ch][i] *= norm;
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep24.flac');
  const inter = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    inter[i * 2] = out[0][i];
    inter[i * 2 + 1] = out[1][i];
  }
  writeFlac(inter, N, file);
  console.log(`mix-ep24.flac  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}  pre ${pre.toFixed(3)}`);
}

loadVO();
renderMusic();
renderSFX();
const rms = (arr) => Math.sqrt(arr.reduce((a, x) => a + x * x, 0) / arr.length);
const db = (x) => (20 * Math.log10(Math.max(x, 1e-9))).toFixed(1);
console.log('vo   rms', db(rms(vo[0])), 'dB');
console.log('mus  rms', db(rms(music[0])), 'dB');
console.log('sfx  rms', db(rms(sfx[0])), 'dB');
mix();
