/**
 * Episode 36 soundtrack — "Kamera di ponselmu lahir dari kamar gelap tahun 1011."
 *
 * A curious bed in A minor at 72 BPM for a dark room with one beam in it:
 * a low drone like air in a sealed chamber, glass tines for the light that
 * travels in straight lines, a soft heartbeat for the ten years, brushed
 * shaker for the dust. The sound design follows the picture: a shutter in the
 * first shot, a river under the blueprint, an iron door and its keyhole, three
 * candles, the eclipse drone, the eye's two theories (a dead buzz for the old
 * one, a gold chime for the right one), three measured ticks for the method,
 * and paper for the seven volumes.
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

let seed = 20261118;
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

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const totalBars = Math.ceil(tl.total / BAR) + 1;

const CHORDS = [
  [110.0, 164.81, 220.0, 261.63], // Am
  [87.31, 130.81, 174.61, 220.0], // F
  [98.0, 146.83, 196.0, 246.94],  // G
  [82.41, 123.47, 164.81, 207.65], // E
];

const pad = (f, att, rel, cut = 380) => {
  const flt = lp(cut);
  return (t) => {
    const a = clamp(t / att);
    const r = clamp((rel - t) / (rel * 0.45));
    const drift = 1 + Math.sin(TAU * 0.03 * t) * 0.0022;
    const v = Math.sin(TAU * f * drift * t) * 0.5
      + Math.sin(TAU * f * 1.004 * t) * 0.26
      + Math.sin(TAU * f * 0.5 * t) * 0.2
      + Math.sin(TAU * f * 1.5 * t) * 0.045;
    return flt(v) * a * r;
  };
};

const tine = (f, decay = 3.2) => {
  const flt = lp(6200);
  return (t) => {
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 900));
    const v = Math.sin(TAU * f * t) * 0.6
      + Math.sin(TAU * f * 3.01 * t) * 0.11 * Math.exp(-t * 10)
      + Math.sin(TAU * f * 5.87 * t) * 0.04 * Math.exp(-t * 26);
    return flt(v) * env;
  };
};

/** a glint of light: high, short, inharmonic */
const glint = (f) => (t) => {
  const env = Math.exp(-t * 9) * (1 - Math.exp(-t * 1400));
  return (Math.sin(TAU * f * t) * 0.5 + Math.sin(TAU * f * 2.41 * t) * 0.16
    + Math.sin(TAU * f * 3.77 * t) * 0.07) * env;
};

const drum = (f = 58, g = 1) => (t) =>
  (Math.sin(TAU * f * t) * Math.exp(-t * 6.5) + Math.sin(TAU * f * 2.02 * t) * 0.16 * Math.exp(-t * 20))
  * (1 - Math.exp(-t * 240)) * g;

const shaker = () => {
  const n = noiseGen();
  const h = hp(5600);
  return (t) => h(n()) * Math.exp(-t * 32) * 0.5;
};

const MEL = [440.0, 523.25, 659.25, 587.33, 523.25, 659.25, 880.0, 659.25];

function renderMusic() {
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    // the room air: a low drone that never quite stops
    addTone(music, t0, BAR * 2.2, pad(chord[0], 2.6, BAR * 2.2, 250), { gain: 0.115 });
    addTone(music, t0, BAR * 2.2, pad(chord[2], 2.9, BAR * 2.2, 520), { gain: 0.042, pan: 0.3 });
    addTone(music, t0, BAR * 2.2, pad(chord[3], 3.1, BAR * 2.2, 760), { gain: 0.03, pan: -0.3 });
    // heartbeat
    addTone(music, t0, 0.9, drum(56), { gain: 0.075 });
    addTone(music, t0 + BEAT * 2, 0.8, drum(52, 0.55), { gain: 0.045 });
    // brushed dust on the offbeats
    if (bar % 2 === 1) {
      for (let e = 0; e < 8; e++) {
        addTone(music, t0 + (e * BEAT) / 2, 0.13, shaker(), { gain: e % 2 ? 0.007 : 0.011, pan: (e % 4 - 1.5) * 0.22 });
      }
    }
    // glass figure, one note every two bars
    if (bar % 2 === 0) {
      const f = MEL[(bar / 2) % MEL.length];
      addTone(music, t0 + BEAT * 1.5, 3.2, tine(f), { gain: 0.026, pan: bar % 4 === 0 ? 0.32 : -0.32 });
      if (bar % 8 === 4) addTone(music, t0 + BEAT * 2.5, 2.4, tine(f * 1.5), { gain: 0.015, pan: -0.2 });
    }
    // the beam: a bright glint whenever a shot opens
    const sc = tl.scenes.find((x) => t0 >= x.start && t0 < x.start + BAR);
    if (sc) {
      addTone(music, sc.start + 0.12, 2.6, glint(1760), { gain: 0.014, pan: 0.25 });
      addTone(music, sc.start + 0.12, 3.4, glint(2637), { gain: 0.008, pan: -0.25 });
    }
    // the dark room has a floor: sub every four bars
    if (bar % 4 === 0) addTone(music, t0, BAR * 1.4, pad(chord[0] * 0.5, 1.6, BAR * 1.4, 150), { gain: 0.06 });
  }
}

/* ---------------------------------- sfx ---------------------------------- */


const SFX = {
  rumble(t, dur = 6, g = 0.12, pan = 0) {
    const n = noiseGen();
    const f1 = lp(95);
    const f2 = lp(48);
    addTone(sfx, t, dur, (x) => (f1(n()) * 0.6 + f2(n()) * 0.8) * Math.sin(Math.PI * clamp(x / dur)), { gain: g, pan });
  },
  crack(t, g = 0.11) {
    const n = noiseGen();
    const h = hp(900);
    addTone(sfx, t, 0.34, (x) => h(n()) * Math.exp(-x * 26), { gain: g });
    SFX.boom(t + 0.02, g * 0.8, 58);
  },
  boom(t, g = 0.1, f = 50) {
    addTone(sfx, t, 1.3, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 4.2), { gain: g });
    const n = noiseGen();
    const fl = lp(280);
    addTone(sfx, t, 0.5, (x) => fl(n()) * Math.exp(-x * 14) * 0.8, { gain: g * 0.45 });
  },
  tear(t, dur = 6, g = 0.05) {
    const n = noiseGen();
    const h = hp(160);
    const f = lp(850);
    addTone(sfx, t, dur, (x) => f(h(n())) * (0.35 + 0.65 * Math.sin(Math.PI * clamp(x / dur))), { gain: g });
  },
  bell(t, g = 0.05, f = 98) {
    [1, 2.756, 5.404, 8.933].forEach((k, i) => {
      addTone(sfx, t, 7.5, (x) => Math.sin(TAU * f * k * x) * Math.exp(-x * (0.5 + i * 0.5)), { gain: g / (1 + i * 1.7), pan: (i - 1.5) * 0.2 });
    });
  },
  whoosh(t, dur = 1.2, g = 0.07, cut = 700, pan = 0) {
    const n = noiseGen();
    const f = lp(cut);
    addTone(sfx, t, dur, (x) => f(n()) * Math.sin(Math.PI * clamp(x / dur)), { gain: g, pan });
  },
  tick(t, g = 0.02, f = 1100, pan = 0) {
    addTone(sfx, t, 0.09, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 46), { gain: g, pan });
  },
  blip(t, g = 0.03, f = 1320, pan = 0.2) {
    addTone(sfx, t, 0.16, (x) => (Math.sin(TAU * f * x) * 0.7 + Math.sin(TAU * f * 2 * x) * 0.2) * Math.exp(-x * 18), { gain: g, pan });
  },
  ding(t, g = 0.035, f = 880, dur = 2.2, pan = 0.2) {
    addTone(sfx, t, dur, (x) => (Math.sin(TAU * f * x) * 0.55 + Math.sin(TAU * f * 2.01 * x) * 0.1) * Math.exp(-x * 2.1), { gain: g, pan });
  },
  chord(t, g = 0.03, root = 293.66) {
    [1, 1.5, 1.875, 2].forEach((k, i) => SFX.ding(t + i * 0.05, g * (1 - i * 0.14), root * k, 3.0, (i - 1.5) * 0.25));
  },
};

function renderSFX() {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const C = (i, word, nth = 0, off = 0) => {
    const sc = tl.scenes[i];
    let k = 0;
    for (const c of sc.captions) {
      for (const w of c.words) {
        if (norm(w.text) === norm(word)) {
          if (k === nth) return sc.start + w.start + off;
          k++;
        }
      }
    }
    throw new Error(`no word "${word}" #${nth} in scene ${i}`);
  };
  const S = (i) => tl.scenes[i].start;

  // --- local colours -------------------------------------------------------
  const shutter = (t, g = 0.05) => {
    SFX.tick(t, g, 2400);
    SFX.whoosh(t - 0.04, 0.16, g * 0.6, 4200, 0);
    SFX.tick(t + 0.075, g * 0.7, 1500);
  };
  const water = (t, dur, g = 0.035) => {
    const n = noiseGen();
    const f = lp(1700);
    const h = hp(220);
    addTone(sfx, t, dur, (x) => {
      const mod = 0.55 + 0.45 * Math.sin(TAU * 0.55 * x + Math.sin(x * 2.2));
      return h(f(n())) * mod * Math.sin(Math.PI * clamp(x / dur));
    }, { gain: g, pan: -0.1 });
  };
  const paper = (t, g = 0.05, dur = 0.32) => {
    const n = noiseGen();
    const h = hp(1200);
    const f = lp(5200);
    addTone(sfx, t, dur, (x) => f(h(n())) * (0.35 + 0.65 * Math.exp(-x * 12)), { gain: g, pan: 0.12 });
  };
  const scratch = (t, g = 0.016) => {
    const n = noiseGen();
    const h = hp(2600);
    addTone(sfx, t, 0.14, (x) => h(n()) * Math.exp(-x * 30), { gain: g, pan: -0.1 });
  };
  const buzz = (t, dur, g = 0.03, pan = 0) => {
    addTone(sfx, t, dur, (x) => {
      const saw = 2 * ((x * 96) % 1) - 1;
      return saw * 0.5 * (0.5 + 0.5 * Math.sin(TAU * 21 * x)) * Math.sin(Math.PI * clamp(x / dur));
    }, { gain: g, pan });
  };
  const puff = (t, g = 0.035) => {
    const n = noiseGen();
    const f = lp(900);
    addTone(sfx, t, 0.5, (x) => f(n()) * Math.exp(-x * 9) * (1 - Math.exp(-x * 200)), { gain: g, pan: -0.15 });
  };
  const thunk = (t, g = 0.07, f = 70) => {
    SFX.boom(t, g, f);
    const n = noiseGen();
    const hp1 = hp(700);
    addTone(sfx, t, 0.24, (x) => hp1(n()) * Math.exp(-x * 22), { gain: g * 0.5 });
  };

  // s1 — a shutter, a dark room, a name: the hook
  shutter(S(0) + 0.42, 0.055);
  SFX.whoosh(S(0) + 0.5, 2.2, 0.035, 700, -0.1);
  SFX.boom(S(0) + 0.2, 0.05, 44);
  SFX.ding(C(0, 'ibn', 0, -0.02), 0.03, 1568, 3.0, 0);
  SFX.ding(C(0, 'al-haytham', 0, 0.0), 0.024, 2093, 2.8, 0.15);

  // s2 — Basra: a town at dusk, the date lands
  water(S(1) + 0.3, 4.2, 0.02);
  SFX.chord(S(1) + 0.8, 0.022, 220.0);
  SFX.tick(C(1, 'sembilan', 0, 0.0), 0.02, 880);
  SFX.ding(C(1, 'kairo', 0, 0.0), 0.028, 1318, 3.0, -0.1);

  // s3 — the Nile: a river that will not be ruled, then the verdict
  water(S(2) + 0.5, 6.5, 0.03);
  SFX.tear(C(2, 'mustahil', 0, -0.25), 1.8, 0.03);
  thunk(C(2, 'mustahil', 0, 0.0), 0.09, 58);
  SFX.ding(C(2, 'mati', 0, 0.0), 0.022, 587.33, 2.2, 0.1);

  // s4 — ten years: an iron door, a keyhole, ten scratches
  thunk(S(3) + 0.55, 0.085, 52);
  SFX.bell(S(3) + 0.6, 0.026, 82);
  SFX.ding(C(3, 'gelap', 0, -0.1), 0.02, 1046, 3.2, 0.1);
  for (let k = 0; k < 10; k++) scratch(S(3) + 1.35 + k * 0.17, 0.014);
  SFX.boom(C(3, 'sepuluh', 0, 0.0), 0.06, 46);

  // s5 — the dark room: the beam lands, the world arrives upside down
  SFX.whoosh(S(4) + 0.3, 2.6, 0.04, 500, 0);
  SFX.ding(C(4, 'terbalik', 0, 0.0), 0.032, 1760, 3.4, 0.1);
  SFX.ding(C(4, 'al-muzlim', 0, 0.0), 0.024, 2637, 2.8, -0.1);
  addTone(sfx, C(4, 'terbalik', 0, -0.6), 1.6, (x) => Math.sin(TAU * 220 * x) * Math.sin(Math.PI * clamp(x / 1.6)) * 0.5, { gain: 0.02 });

  // s6 — three candles: three puffs, three pings, one verdict
  for (let k = 0; k < 3; k++) puff(S(5) + 0.55 + k * 0.24, 0.03);
  SFX.ding(C(5, 'lilin', 0, 0.0), 0.024, 1046, 2.4, -0.2);
  SFX.ding(C(5, 'mengganggu', 0, 0.0), 0.02, 1568, 2.2, 0.2);
  SFX.boom(C(5, 'lurus', 0, 0.0), 0.055, 62);
  SFX.ding(C(5, 'lurus', 0, 0.02), 0.03, 2093, 3.0, 0);

  // s7 — the eclipse: a drone, the crescent, a bright arrival
  addTone(sfx, S(6) + 0.4, 3.4, (x) => (Math.sin(TAU * 146.83 * x) * 0.4 + Math.sin(TAU * 220 * x) * 0.25) * Math.sin(Math.PI * clamp(x / 3.4)), { gain: 0.022 });
  SFX.ding(C(6, 'sabit', 0, 0.0), 0.03, 1318, 3.0, 0.1);
  SFX.whoosh(C(6, 'bulat', 0, -0.2), 1.6, 0.03, 1200, -0.15);

  // s8 — the eye: the dead theory buzzes, the right one chimes
  buzz(C(7, 'memancarkan', 0, 0.0), 0.9, 0.028, 0.15);
  SFX.tick(C(7, 'mata', 1, 0.0), 0.02, 700);
  SFX.ding(C(7, 'sebaliknya', 0, 0.0), 0.028, 1174, 3.0, -0.1);
  SFX.chord(C(7, 'jendela', 0, -0.15), 0.028, 440.0);
  SFX.boom(C(7, 'jendela', 0, 0.0), 0.045, 72);

  // s9 — the method: three measured ticks and a rising triad
  for (let k = 0; k < 3; k++) {
    SFX.tick(C(8, 'menguji,', 0, 0.0) + k * 0.55, 0.02, 900 + k * 180, (k - 1) * 0.25);
  }
  SFX.chord(C(8, 'ilmiah', 0, -0.2), 0.03, 293.66);
  SFX.ding(C(8, 'ilmiah', 0, 0.1), 0.026, 1760, 3.0, 0.1);

  // s10 — seven volumes: paper, seven soft ticks, a warm close
  paper(S(9) + 0.25, 0.05);
  for (let k = 0; k < 7; k++) SFX.tick(S(9) + 1.05 + k * 0.13, 0.014, 520 + k * 40, (k - 3) * 0.12);
  SFX.chord(C(9, 'al-manazir,', 0, -0.1), 0.03, 220.0);
  paper(S(9) + tl.scenes[9].dur - 3.0, 0.03, 0.5);
  SFX.bell(S(9) + tl.scenes[9].dur - 2.4, 0.03, 73.42);
}

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
  // gentle tanh soft-clip: shave plosive peaks so the brickwall stays musical
  const k = 1.35, nk = Math.tanh(k);
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < N; i++) vo[ch][i] = Math.tanh(k * vo[ch][i]) / nk;
  }
}

/* --------------------------------- mix ----------------------------------- */

// RBJ biquads: the de-esser side chain and the music carve
function biquad(b0, b1, b2, a1, a2) {
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  return (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}
function rbj(type, f0, q) {
  const w = TAU * f0 / SR;
  const cs = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  const a0 = 1 + al;
  if (type === 'hp') return biquad((1 + cs) / 2 / a0, -(1 + cs) / a0, (1 + cs) / 2 / a0, -2 * cs / a0, (1 - al) / a0);
  return biquad(al / a0, 0, -al / a0, -2 * cs / a0, (1 - al) / a0); // band-pass, 0 dB peak
}

/** ITU-R BS.1770 integrated loudness: K-weighting, 400 ms blocks, both gates */
function lufs(L, R) {
  const kw = () => {
    const s1 = biquad(1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585);
    const s2 = biquad(1, -2, 1, -1.99004745483398, 0.99007225036621);
    return (x) => s2(s1(x));
  };
  const kl = kw();
  const kr = kw();
  const n = L.length;
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) {
    const a = kl(L[i]);
    const b = kr(R[i]);
    pre[i + 1] = pre[i] + a * a + b * b;
  }
  const blk = Math.round(0.4 * SR);
  const hop = Math.round(0.1 * SR);
  const z = [];
  for (let s = 0; s + blk <= n; s += hop) z.push((pre[s + blk] - pre[s]) / blk);
  const ld = (v) => -0.691 + 10 * Math.log10(v + 1e-20);
  const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const abs = z.filter((v) => ld(v) > -70);
  const rel = abs.filter((v) => ld(v) > ld(mean(abs)) - 10);
  return ld(mean(rel));
}

/**
 * Lookahead brickwall. The gain each sample needs is min-filtered over a
 * centred window of 2*la and box-averaged over la, so the gain is already down
 * when a peak arrives and never above what that peak needs; it recovers on a
 * one-pole release. Returns the deepest reduction (dB).
 */
function limiter(L, R, ceil, la = Math.round(0.0025 * SR), rel = 0.07) {
  const n = L.length;
  // true-peak-ish detection: the samples and three Catmull-Rom points
  // between each pair, so inter-sample overs are caught before the encoder
  const need = new Float32Array(n);
  const tp = (X, i) => {
    const x0 = X[Math.max(0, i - 1)];
    const x1 = X[i];
    const x2 = X[Math.min(n - 1, i + 1)];
    const x3 = X[Math.min(n - 1, i + 2)];
    let p = Math.abs(x1);
    for (const u of [0.25, 0.5, 0.75]) {
      const y = 0.5 * (2 * x1 + (-x0 + x2) * u + (2 * x0 - 5 * x1 + 4 * x2 - x3) * u * u + (-x0 + 3 * x1 - 3 * x2 + x3) * u * u * u);
      p = Math.max(p, Math.abs(y));
    }
    return p;
  };
  for (let i = 0; i < n; i++) {
    const p = Math.max(tp(L, i), tp(R, i));
    need[i] = p > ceil ? ceil / p : 1;
  }
  const gmin = new Float32Array(n);
  const dq = new Int32Array(n);
  let h = 0;
  let t = 0;
  for (let j = 0; j < n + la; j++) {
    if (j < n) {
      while (t > h && need[dq[t - 1]] >= need[j]) t--;
      dq[t++] = j;
    }
    const i = j - la;
    if (i >= 0) {
      while (dq[h] < i - la) h++;
      gmin[i] = need[dq[h]];
    }
  }
  const half = Math.max(1, la >> 1);
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + gmin[i];
  const rc = 1 - Math.exp(-1 / (rel * SR));
  let g = 1;
  let low = 1;
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - half);
    const b = Math.min(n, i + half + 1);
    g = Math.min((pre[b] - pre[a]) / (b - a), g + (1 - g) * rc);
    L[i] *= g;
    R[i] *= g;
    if (g < low) low = g;
  }
  return 20 * Math.log10(low);
}

/** split-band de-esser: only the top band of a sibilant is turned down, gently */
function deEss() {
  const hl = rbj('hp', 5200, 0.7);
  const hr = rbj('hp', 5200, 0.7);
  const atk = 1 - Math.exp(-1 / (0.0015 * SR));
  const rls = 1 - Math.exp(-1 / (0.05 * SR));
  let eS = 0;
  let eF = 0;
  let low = 1;
  for (let i = 0; i < N; i++) {
    const l = vo[0][i];
    const r = vo[1][i];
    const sl = hl(l);
    const sr = hr(r);
    const s = Math.max(Math.abs(sl), Math.abs(sr));
    const f = Math.max(Math.abs(l), Math.abs(r));
    eS += (s - eS) * (s > eS ? atk : rls);
    eF += (f - eF) * (f > eF ? atk : rls);
    const ratio = eS / Math.max(eF, 1e-6);
    const g = ratio > 0.6 ? Math.pow(0.6 / ratio, 0.7) : 1;
    vo[0][i] = l - sl + sl * g;
    vo[1][i] = r - sr + sr * g;
    if (g < low) low = g;
  }
  return 20 * Math.log10(low);
}

const TARGET = -10.6; // integrated LUFS of the master: loud, voice first
const CEIL = 10 ** (-2.0 / 20);

function mix() {
  const ess = deEss();
  // voice envelope (10 ms blocks) drives the ducking and the carve
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
    const target = clamp(env[b] * 6);
    v += (target - v) * (target > v ? 0.4 : 0.04);
    smooth[b] = v;
  }
  // the bed steps aside for the voice: level down ~10 dB and a hole carved
  // around 1.3-4.5 kHz where the consonants live
  const carve = [rbj('bp', 2400, 0.75), rbj('bp', 2400, 0.75)];
  const out = [new Float32Array(N), new Float32Array(N)];
  for (let i = 0; i < N; i++) {
    const d = smooth[Math.floor(i / block)];
    const duckM = 1 - 0.68 * d;
    const duckS = 1 - 0.3 * d;
    for (let ch = 0; ch < 2; ch++) {
      const m = music[ch][i];
      const mid = carve[ch](m);
      out[ch][i] = vo[ch][i] * 1.0 + (m - 0.55 * d * mid) * 1.18 * duckM + sfx[ch][i] * 1.05 * duckS;
    }
  }
  for (let ch = 0; ch < 2; ch++) {
    const f = hp(28);
    for (let i = 0; i < N; i++) out[ch][i] = f(out[ch][i]);
  }
  // glue compressor: tame the crest so the brickwall can reach the target
  {
    let p0 = 0;
    for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) p0 = Math.max(p0, Math.abs(out[ch][i]));
    const n0 = 0.9 / Math.max(p0, 1e-6);
    for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) out[ch][i] *= n0;
    const thr = 0.30, ratio = 2.0, atk = 1 - Math.exp(-1 / (0.005 * SR)), rls = 1 - Math.exp(-1 / (0.15 * SR));
    for (let ch = 0; ch < 2; ch++) {
      let e = 0;
      for (let i = 0; i < N; i++) {
        const a = Math.abs(out[ch][i]);
        e += (a - e) * (a > e ? atk : rls);
        if (e > thr) {
          const g = (thr + (e - thr) / ratio) / e;
          out[ch][i] *= g;
        }
      }
    }
  }
  // master: gain into the brickwall until the integrated loudness lands
  let gain = 1;
  let lim = 0;
  let got = 0;
  let L = null;
  let R = null;
  for (let it = 0; it < 5; it++) {
    L = Float32Array.from(out[0], (x) => x * gain);
    R = Float32Array.from(out[1], (x) => x * gain);
    lim = limiter(L, R, CEIL);
    got = lufs(L, R);
    if (Math.abs(got - TARGET) < 0.05) break;
    gain *= 10 ** ((TARGET - got) / 20);
  }
  let pk = 0;
  for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep36.flac');
  const inter = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    inter[i * 2] = L[i];
    inter[i * 2 + 1] = R[i];
  }
  writeFlac(inter, N, file);
  // voice-to-bed ratio while the voice speaks (the "is it clear" number)
  let sv = 0;
  let sb = 0;
  let nv = 0;
  for (let i = 0; i < N; i += 4) {
    if (smooth[Math.floor(i / block)] < 0.9) continue;
    sv += vo[0][i] * vo[0][i];
    const b = out[0][i] - vo[0][i];
    sb += b * b;
    nv++;
  }
  const vbr = 10 * Math.log10((sv / Math.max(1, nv)) / Math.max(1e-12, sb / Math.max(1, nv)));
  console.log(`mix-ep36.flac  ${(N / SR).toFixed(2)}s  ${got.toFixed(2)} LUFS  peak ${(20 * Math.log10(pk)).toFixed(2)} dBFS  limiter ${lim.toFixed(1)} dB  de-ess ${ess.toFixed(1)} dB  voice/bed ${vbr.toFixed(1)} dB  gain ${(20 * Math.log10(gain)).toFixed(1)} dB`);
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
