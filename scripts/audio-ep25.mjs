/**
 * Episode 25 soundtrack — "Golongan darah yang cuma dimiliki satu orang."
 *
 * A clinical, intimate bed in E minor: wide pads, a felt motif, no drums. The
 * pulse is a heartbeat locked to the ECG trace on screen (72 BPM, restarting
 * with each scene like the trace does). The sound design follows the picture:
 * a lock-on for the one cell, four slashes for A, B, AB and O, markers
 * popping up on the membrane, a rattle of 48 tiles, drops in the typing
 * wells, a gold shimmer, markers dissolving, clumping in five wells and one
 * clean match, a comment bubble and typing under the last question.
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

let seed = 20251948;
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

// E minor, then the six, the three and the seven: open, a little uneasy
const CHORDS = [
  [82.41, 123.47, 164.81, 196.0], // Em
  [65.41, 98.0, 130.81, 164.81], // C
  [98.0, 146.83, 196.0, 246.94], // G
  [73.42, 110.0, 146.83, 185.0], // D
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

/** one heartbeat: lub (the QRS on screen), dub a T-wave later */
function heartbeat(t, g = 0.1) {
  addTone(music, t, 0.32, (x) => Math.sin(TAU * (52 + 30 * Math.exp(-x * 40)) * x) * Math.exp(-x * 13) * (1 - Math.exp(-x * 300)), { gain: g });
  addTone(music, t + 0.217, 0.28, (x) => Math.sin(TAU * (64 + 26 * Math.exp(-x * 44)) * x) * Math.exp(-x * 16) * (1 - Math.exp(-x * 300)), { gain: g * 0.62 });
}

function renderMusic() {
  const air = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    const opening = bar < 2;
    addTone(music, t0, BAR * 2.0, pad(chord[0] / 2, 2.4, BAR * 2.0, 200), { gain: opening ? 0.13 : 0.17 });
    chord.forEach((f, i) => {
      addTone(music, t0 + i * 0.1, BAR * 2.2, pad(f, 3.0, BAR * 2.2, 600 + i * 90), {
        gain: 0.046 - i * 0.005,
        pan: (i - 1.5) * 0.32,
      });
    });
    // the motif: three felt notes climbing, every other bar
    if (bar % 2 === 1) {
      [1, 1.122, 1.335].forEach((k, i) => {
        addTone(music, t0 + i * BEAT * 1.25, 2.6, felt(chord[2] * k, 1.9 + i * 0.3), {
          gain: 0.036 - i * 0.006,
          pan: i % 2 ? -0.3 : 0.3,
        });
      });
    }
    const n = noiseGen();
    const fl = lp(2000);
    addTone(air, t0, BAR * 1.02, (t) => fl(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.014, pan: bar % 2 === 0 ? -0.45 : 0.45,
    });
  }
  const hf = lp(6000);
  for (let i = 0; i < N; i++) {
    const v = hf(rand() * 2 - 1) * 0.004;
    air[0][i] += v;
    air[1][i] += v;
  }
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) music[ch][i] += air[ch][i];
  // the heartbeat, on the trace's beats: local 0.25 s + k * 60/72 in every scene
  let last = -9;
  tl.scenes.forEach((sc) => {
    for (let lt = 0.25; lt < sc.dur - 0.05; lt += 60 / 72) {
      const at = sc.start + lt;
      if (at - last < 0.6) continue;
      heartbeat(at, 0.085);
      last = at;
    }
  });
  const fin = 0.6 * SR;
  const fout = 3.0 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fin), clamp((N - i) / fout));
    music[0][i] *= g;
    music[1][i] *= g;
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
  ding(t, g = 0.035, f = 880, dur = 1.8, pan = 0.2) {
    addTone(sfx, t, dur, (x) => (Math.sin(TAU * f * x) * 0.55 + Math.sin(TAU * f * 2.01 * x) * 0.1) * Math.exp(-x * 2.2), { gain: g, pan });
  },
  /** a soft major chord, for the one match */
  chord(t, g = 0.03, root = 523.25) {
    [1, 1.26, 1.5, 2].forEach((k, i) => SFX.ding(t + i * 0.035, g * (1 - i * 0.15), root * k, 2.6, (i - 1.5) * 0.25));
  },
  tick(t, g = 0.03, f = 1200, pan = -0.12) {
    addTone(sfx, t, 0.06, (x) => (Math.sin(TAU * f * x) * 0.6 + Math.sin(TAU * f * 2.4 * x) * 0.2) * Math.exp(-x * 90), { gain: g, pan });
  },
  /** a scope locking on: three blips climbing */
  lock(t, g = 0.02) {
    [0, 0.12, 0.24].forEach((dt, k) => SFX.tick(t + dt, g, 1400 + k * 260, 0.1));
    SFX.ding(t + 0.36, g * 1.2, 1975, 0.9, 0.1);
  },
  /** a slash through a badge */
  slash(t, g = 0.05, pan = 0) {
    const n = noiseGen();
    const h = hp(1800);
    const l = lp(7000);
    addTone(sfx, t, 0.16, (x) => l(h(n())) * Math.sin(Math.PI * clamp(x / 0.16)) ** 2, { gain: g, pan });
    addTone(sfx, t + 0.1, 0.18, (x) => Math.sin(TAU * (180 - 70 * x) * x) * Math.exp(-x * 30), { gain: g * 0.7, pan });
  },
  /** a small wet pop (a marker standing up on the membrane) */
  pop(t, g = 0.025, f = 700, pan = 0) {
    addTone(sfx, t, 0.09, (x) => Math.sin(TAU * f * (1 + 1.4 * Math.exp(-x * 60)) * x) * Math.exp(-x * 45) * (1 - Math.exp(-x * 900)), { gain: g, pan });
  },
  /** a drop falling into a well */
  drop(t, g = 0.035, f = 900, pan = 0) {
    addTone(sfx, t, 0.22, (x) => Math.sin(TAU * f * (1 + 0.9 * Math.exp(-x * 22)) * x) * Math.exp(-x * 18) * (1 - Math.exp(-x * 600)), { gain: g, pan });
    SFX.pop(t + 0.05, g * 0.4, f * 1.6, pan);
  },
  /** clumping: a short dry crackle */
  crackle(t, g = 0.03, pan = 0) {
    for (let k = 0; k < 7; k++) {
      const n = noiseGen();
      const h = hp(1400 + rand() * 1600);
      addTone(sfx, t + k * 0.03 + rand() * 0.02, 0.035, (x) => h(n()) * Math.exp(-x * 110), { gain: g * (0.6 + rand() * 0.4), pan });
    }
  },
  /** shimmer: a rising wash of high partials (markers pouring out, gold) */
  shimmer(t, dur, g = 0.03, f0 = 1800, gold = false) {
    const n = noiseGen();
    const h = hp(3000);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return h(n()) * 0.35 * Math.sin(Math.PI * p) * p;
    }, { gain: g, pan: 0.15 });
    const parts = gold ? [1, 1.5, 2, 2.5, 3] : [1, 1.33, 1.78, 2.37];
    parts.forEach((k, i) => {
      const at = t + (i / parts.length) * dur * 0.7;
      SFX.ding(at, g * 0.55, f0 * k, 1.6, (i % 2 ? -1 : 1) * 0.35);
    });
  },
  /** markers letting go: a falling cluster of glassy pings */
  dissolve(t, dur = 1.2, g = 0.024) {
    for (let k = 0; k < 10; k++) {
      const f = 2400 * Math.pow(0.86, k);
      SFX.pop(t + (k / 10) * dur + rand() * 0.04, g * (1 - k * 0.05), f, (rand() - 0.5) * 0.8);
    }
    const n = noiseGen();
    const fl = lp(1600);
    addTone(sfx, t, dur, (x) => fl(n()) * Math.sin(Math.PI * clamp(x / dur)) * 0.8, { gain: g * 0.8, pan: -0.1 });
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
  stamp(t, g = 0.12) {
    const n = noiseGen();
    addTone(sfx, t, 0.14, (x) => n() * Math.exp(-x * 44), { gain: g * 0.5, pan: 0.1 });
    addTone(sfx, t, 0.7, (x) => {
      const f = 110 * Math.exp(-x * 4.5) + 42;
      return Math.sin(TAU * f * x) * Math.exp(-x * 8);
    }, { gain: g });
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
    SFX.air(sc.start - 0.3, 0.034, 0.8, 2000);
    SFX.boom(sc.start - 0.05, 0.036, 54);
  });

  // s1 — SATU ORANG: the reticle locks, a punch-in, four bags rise and are struck
  SFX.air(0.0, 0.045, 1.2, 1500);
  SFX.lock(0.12, 0.02);
  SFX.boom(W(0, 0, 6) - 0.04, 0.075, 46);
  SFX.ding(W(0, 0, 6) + 0.02, 0.028, 659, 2.2);
  SFX.air(W(0, 1, 2) - 0.35, 0.04, 0.7, 2600, 0.1);
  for (let i = 0; i < 4; i++) SFX.drop(W(0, 1, 2) - 0.3 + i * 0.09 + 0.3, 0.02, 520 + i * 60, (i - 1.5) * 0.3);
  [3, 4, 5, 7].forEach((k, i) => SFX.slash(W(0, 1, k) - 0.02, 0.05, (i - 1.5) * 0.3));
  SFX.ding(W(0, 1, 7) + 0.3, 0.022, 494, 2.4);

  // s2 — PENANDA: markers pop up, the magnifier glides in, a banner, the size;
  // then the desk: three glass slides, the card, the year, a stamp
  for (let k = 0; k < 14; k++) SFX.pop(W(1, 0, 4) - 0.1 + k * 0.1 + rand() * 0.04, 0.02, 600 + rand() * 700, (rand() - 0.5) * 0.8);
  SFX.air(W(1, 0, 4) - 0.15, 0.045, 0.7, 3200, 0.5);
  SFX.tick(W(1, 0, 4) + 0.5, 0.02, 1500, 0.3);
  SFX.air(W(1, 0, 5) - 0.05, 0.03, 0.4, 5200, 0.3);
  SFX.tick(W(1, 0, 8) - 0.05, 0.016, 1300, -0.2);
  SFX.air(cap(1, 1) - 0.42, 0.06, 0.8, 2800, -0.2);
  [1, 2, 3].forEach((k, i) => {
    SFX.ding(W(1, 1, k) + 0.08, 0.016, 2200 + i * 180, 0.5, (i - 1) * 0.3);
    SFX.tick(W(1, 1, k) + 0.06, 0.02, 900 + i * 80, (i - 1) * 0.3);
  });
  SFX.air(W(1, 1, 4) - 0.12, 0.04, 0.7, 2400, 0.1);
  for (let k = 0; k < 11; k++) SFX.tick(W(1, 1, 6) - 0.1 + k * ((W(1, 1, 9) + 0.45 - W(1, 1, 6)) / 11), 0.012, 1100 + k * 30);
  SFX.ding(W(1, 1, 9) + 0.38, 0.03, 587, 2.2);
  SFX.stamp(W(1, 1, 9) + 0.6, 0.07);

  // s3 — 49 SISTEM: the big tile, the drop, a rattle of tiles, the light wave,
  // the badges, the markers pour
  SFX.boom(W(2, 0, 1) - 0.12, 0.06, 50);
  SFX.tick(W(2, 0, 5) + 0.5, 0.03, 900, 0);
  SFX.boom(W(2, 0, 5) + 0.52, 0.04, 62);
  const r0 = W(2, 0, 7) - 0.2;
  const r1 = W(2, 0, 10) + 0.2;
  for (let k = 0; k < 47; k++) SFX.tick(r0 + (k / 47) * (r1 - r0) + rand() * 0.01, 0.009, 1300 + rand() * 500, (rand() - 0.5) * 0.9);
  SFX.air(W(2, 0, 10) + 0.2, 0.026, 0.9, 6000, -0.3);
  SFX.ding(W(2, 0, 10) + 0.62, 0.022, 740, 1.8, -0.3);
  SFX.ding(W(2, 0, 10) + 0.87, 0.022, 988, 1.8, 0.35);
  SFX.shimmer(cap(2, 1) + 0.05, W(2, 1, 7) + 0.3 - cap(2, 1), 0.03, 1500);
  for (let k = 0; k < 26; k++) SFX.pop(cap(2, 1) + 0.1 + (k / 26) * (W(2, 1, 7) - cap(2, 1)), 0.01, 900 + rand() * 1400, (rand() - 0.5) * 0.9);
  SFX.ding(W(2, 1, 7) + 0.32, 0.03, 659, 2.2);

  // s4 — RHESUS: the pipette drops into three wells, anti-D lights, the two
  // answers (one clumps), then five of a thousand
  const dk = W(3, 0, 3);
  [dk - 0.42, dk - 0.05, dk + 0.32].forEach((t0, i) => SFX.drop(t0 + 0.22, 0.032, 820 + i * 90, (i - 1) * 0.35));
  SFX.air(dk - 1.0, 0.03, 0.6, 3000, 0.5);
  SFX.boom(W(3, 0, 7) - 0.05, 0.04, 58);
  SFX.ding(W(3, 0, 7) - 0.02, 0.026, 784, 2.0, 0.3);
  SFX.ding(W(3, 0, 8) - 0.06, 0.026, 1046, 1.6, -0.3);
  SFX.crackle(W(3, 0, 8) + 0.1, 0.022, -0.3);
  SFX.ding(W(3, 0, 10) - 0.06, 0.026, 466, 1.8, 0.3);
  SFX.air(cap(3, 1) - 0.32, 0.05, 0.8, 2600, 0.2);
  for (let k = 0; k < 20; k++) SFX.tick(cap(3, 1) + 0.12 + k * 0.06, 0.006, 1600 + rand() * 400, (rand() - 0.5) * 0.8);
  for (let k = 0; k < 5; k++) SFX.pop(W(3, 1, 3) - 0.08 + k * 0.09, 0.024, 1300 + k * 140, (k - 2) * 0.3);
  SFX.boom(W(3, 1, 4) - 0.12, 0.06, 48);
  SFX.tick(W(3, 1, 7) + 0.32, 0.018, 1200, -0.2);

  // s5 — DARAH EMAS: a punch-in, gold and glitter, the markers let go; the world
  SFX.boom(W(4, 0, 3) - 0.1, 0.05, 50);
  SFX.shimmer(W(4, 0, 3) - 0.12, 1.4, 0.034, 1318, true);
  SFX.boom(W(4, 0, 5) - 0.03, 0.045, 52);
  SFX.dissolve(W(4, 0, 5) - 0.02, 1.3, 0.022);
  SFX.tick(W(4, 0, 5) + 0.08, 0.016, 1400, 0.4);
  SFX.tick(W(4, 0, 6) + 0.22, 0.016, 1250, 0.4);
  SFX.air(cap(4, 1) - 0.4, 0.05, 0.9, 2200, -0.2);
  for (let k = 0; k < 14; k++) SFX.pop(W(4, 1, 1) + (k / 14) * (W(4, 1, 3) + 0.6 - W(4, 1, 1)), 0.016, 1500 + rand() * 600, (rand() - 0.5) * 0.9);
  for (let k = 0; k < 9; k++) SFX.tick(W(4, 1, 1) + k * ((W(4, 1, 3) + 0.45 - W(4, 1, 1)) / 9), 0.009, 1150 + k * 30);
  SFX.boom(W(4, 1, 3) + 0.47, 0.04, 56);
  SFX.air(W(4, 1, 7) - 0.3, 0.035, 1.2, 3600, -0.6);
  SFX.air(W(4, 1, 7) + 0.2, 0.03, 0.9, 3600, 0.6);
  SFX.ding(W(4, 1, 8) + 0.32, 0.026, 659, 2.4);

  // s6 — GWADA: the year, the press release typing itself, a banner, a stamp;
  // one woman, then five clumps and one clean match
  for (let k = 0; k < 12; k++) SFX.tick(W(5, 0, 0) + k * ((W(5, 0, 5) + 0.3 - W(5, 0, 0)) / 12), 0.011, 1100 + k * 35);
  SFX.air(0.3 + S(5), 0.035, 0.7, 2600, 0.2);
  const typeRun = (t0, dur, n) => { for (let k = 0; k < n; k++) SFX.key(t0 + (k / n) * dur + rand() * 0.015, 0.011); };
  typeRun(W(5, 0, 6) - 0.1, 0.5, 8);
  typeRun(W(5, 0, 8) - 0.1, 0.6, 10);
  typeRun(W(5, 0, 10) - 0.05, 0.45, 8);
  typeRun(W(5, 0, 11) - 0.1, 0.4, 7);
  SFX.ding(W(5, 0, 10) - 0.06, 0.026, 880, 2.0, -0.4);
  SFX.tick(W(5, 0, 10), 0.02, 1500, -0.4);
  SFX.stamp(W(5, 0, 12) + 0.08, 0.085);
  SFX.boom(W(5, 0, 12) + 0.08, 0.035, 60);
  typeRun(W(5, 0, 12) + 0.3, 0.7, 12);
  SFX.air(cap(5, 1) - 0.4, 0.05, 0.8, 2400, -0.25);
  SFX.ding(W(5, 1, 2) - 0.04, 0.024, 698, 2.0, 0);
  for (let i = 0; i < 6; i++) SFX.drop(cap(5, 1) + 0.7 + i * 0.1 + 0.15, 0.02, 760 + i * 60, (i - 2.5) * 0.25);
  for (let i = 0; i < 5; i++) {
    const at = W(5, 1, 7) - 0.1 + i * 0.12;
    SFX.crackle(at + 0.05, 0.026, (i - 2.5) * 0.25);
    SFX.tick(at + 0.42, 0.014, 700, (i - 2.5) * 0.25);
  }
  SFX.chord(W(5, 1, 10) - 0.04, 0.026, 523.25);

  // s7 — GOLONGANMU: the stickers slap on, the full coat of markers, the
  // stickers drop away, the comment box, typing, the answers
  for (let i = 0; i < 4; i++) SFX.tick(W(6, 0, 5) - 0.3 + i * 0.08 + 0.1, 0.018, 1000 + i * 90, (i - 1.5) * 0.3);
  SFX.tick(W(6, 0, 7) - 0.0, 0.02, 1700, 0.3);
  SFX.tick(W(6, 0, 8) - 0.0, 0.02, 1300, 0.4);
  SFX.shimmer(W(6, 0, 8) + 0.15, 1.3, 0.026, 1318);
  SFX.boom(W(6, 0, 8) + 0.12, 0.045, 54);
  SFX.air(cap(6, 1) - 0.25, 0.04, 0.7, 2200, 0);
  SFX.pop(W(6, 1, 2) - 0.3, 0.04, 520, 0.4);
  SFX.ding(W(6, 1, 2) - 0.25, 0.02, 1046, 1.4, 0.4);
  const tKom = W(6, 1, 2) + 0.1;
  for (let k = 0; k < 18; k++) SFX.key(tKom + k * (1.2 / 18) + rand() * 0.015, 0.013);
  for (let i = 0; i < 4; i++) SFX.tick(W(6, 1, 3) + i * 0.1 + 0.08, 0.016, 1200 + i * 80, (i - 1.5) * 0.3);
  SFX.ding(W(6, 1, 5), 0.028, 659, 2.6);
  SFX.ding(W(6, 1, 5) + 0.45, 0.026, 494, 3.0);
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
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep25.flac');
  const inter = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    inter[i * 2] = out[0][i];
    inter[i * 2 + 1] = out[1][i];
  }
  writeFlac(inter, N, file);
  console.log(`mix-ep25.flac  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}  pre ${pre.toFixed(3)}`);
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
