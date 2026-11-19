/**
 * Episode 29 soundtrack — "Indonesia lebih lebar dari Amerika Serikat."
 *
 * A curious travelling bed in A minor at 84 BPM for a chart table: warm
 * pads, a music-box figure, a soft two-beat pulse and a shaker on the
 * eighths like distance being covered. The sound design follows the
 * sheets: each new atlas sheet dealt onto the stack, the cut-out lifted and
 * set down, felt-tip loops, pins dropped, the carrack's sea, the year typed
 * digit by digit, globe gores unfolding and the map stretching, the ground
 * square sliding north, fourteen Greenlands laid down, Europe deflating,
 * the rulers counting, the assembly filling, one red seat and the stamp.
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

const BPM = 84;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const totalBars = Math.ceil(tl.total / BAR) + 1;

// A minor: i - VI - III - VII, warm and open
const CHORDS = [
  [110.0, 130.81, 164.81, 220.0], // Am
  [87.31, 130.81, 174.61, 220.0], // F
  [65.41, 130.81, 164.81, 196.0], // C
  [98.0, 123.47, 146.83, 196.0], // G
];

const pad = (f, att, rel, cut = 600) => {
  const flt = lp(cut);
  return (t) => {
    const a = clamp(t / att);
    const r = clamp((rel - t) / (rel * 0.45));
    const drift = 1 + Math.sin(TAU * 0.05 * t) * 0.0016;
    const v = Math.sin(TAU * f * drift * t) * 0.5
      + Math.sin(TAU * f * 1.004 * t) * 0.28
      + Math.sin(TAU * f * 0.5 * t) * 0.18
      + Math.sin(TAU * f * 2 * t) * 0.04;
    return flt(v) * a * r;
  };
};

/** a music-box tine: bright fundamental, a quick inharmonic shimmer */
const tine = (f, decay = 3.6) => {
  const flt = lp(6500);
  return (t) => {
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 900));
    const v = Math.sin(TAU * f * t) * 0.6
      + Math.sin(TAU * f * 3.01 * t) * 0.12 * Math.exp(-t * 9)
      + Math.sin(TAU * f * 5.87 * t) * 0.05 * Math.exp(-t * 26);
    return flt(v) * env;
  };
};

function renderMusic() {
  const air = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    addTone(music, t0, BAR * 2.0, pad(chord[0], 1.6, BAR * 2.0, 260), { gain: bar < 1 ? 0.11 : 0.14 });
    chord.slice(1).forEach((f, i) => {
      addTone(music, t0 + i * 0.08, BAR * 2.2, pad(f, 2.2, BAR * 2.2, 560 + i * 120), {
        gain: 0.04 - i * 0.006,
        pan: (i - 1) * 0.4,
      });
    });
    // the music-box figure: up and back, answered every other bar
    const fig = bar % 2 === 0 ? [[0, 1], [2, 2], [4, 3], [6, 2], [10, 1]] : [[0, 3], [3, 2], [6, 1], [8, 2], [12, 3], [14, 2]];
    fig.forEach(([six, k], j) => {
      addTone(music, t0 + six * BEAT * 0.25, 1.6, tine(chord[k] * 4, 3.2), {
        gain: (j % 2 ? 0.011 : 0.015) * (bar < 2 ? 0.75 : 1),
        pan: j % 2 ? 0.45 : -0.45,
      });
    });
    // the pulse: two soft low beats
    for (const [dt, g] of [[0, 0.07], [BEAT * 2, 0.045]]) {
      addTone(music, t0 + dt, 0.8, (x) => Math.sin(TAU * chord[0] * 0.5 * x * (1 + 0.12 * Math.exp(-x * 30))) * Math.exp(-x * 4.6) * (1 - Math.exp(-x * 160)), { gain: g });
    }
    const n = noiseGen();
    const fl = lp(1400);
    addTone(air, t0, BAR * 1.02, (t) => fl(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.01, pan: bar % 2 === 0 ? -0.45 : 0.45,
    });
  }
  // a shaker on the eighths, accent on the off-beat
  for (let k = 4; k * BEAT * 0.5 < tl.total; k++) {
    const n = noiseGen();
    const h = hp(5200);
    const acc = k % 2 ? 1 : 0.55;
    addTone(music, k * BEAT * 0.5, 0.07, (x) => h(n()) * Math.exp(-x * 70) * (1 - Math.exp(-x * 2000)), { gain: 0.007 * acc, pan: k % 2 ? 0.3 : -0.3 });
  }
  const hf = lp(5000);
  for (let i = 0; i < N; i++) {
    const v = hf(rand() * 2 - 1) * 0.0035;
    air[0][i] += v;
    air[1][i] += v;
  }
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) music[ch][i] += air[ch][i];
  const fin = 0.3 * SR;
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


Object.assign(SFX, {
  /** a toggle switch thrown: two dry clicks and a thump */
  clack(t, g = 0.06, pan = -0.2) {
    for (const [dt, k] of [[0, 1], [0.018, 0.6]]) {
      const n = noiseGen();
      const h = hp(2200);
      addTone(sfx, t + dt, 0.03, (x) => h(n()) * Math.exp(-x * 220), { gain: g * k, pan });
    }
    addTone(sfx, t, 0.16, (x) => Math.sin(TAU * (150 - 60 * x) * x) * Math.exp(-x * 34), { gain: g * 0.8, pan });
  },
  /** a powering-down sweep */
  down(t, g = 0.03, dur = 0.6) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return Math.sin(TAU * (900 - 700 * p) * x) * (1 - p) * 0.6;
    }, { gain: g, pan: -0.2 });
  },
  /** the nav app recalculating: two short descending tones */
  alert(t, g = 0.03) {
    [[0, 988], [0.16, 740]].forEach(([dt, f]) => addTone(sfx, t + dt, 0.13, (x) => (Math.sin(TAU * f * x) * 0.7 + Math.sin(TAU * f * 2 * x) * 0.1) * Math.min(1, x * 200) * Math.exp(-x * 9), { gain: g, pan: 0.15 }));
  },
  /** a satellite ping with a short echo */
  ping(t, g = 0.024, f = 1568, pan = 0) {
    for (const [dt, k] of [[0, 1], [0.13, 0.35], [0.26, 0.14]]) {
      addTone(sfx, t + dt, 1.0, (x) => Math.sin(TAU * f * (1 - 0.02 * Math.exp(-x * 30)) * x) * Math.exp(-x * 5.5) * (1 - Math.exp(-x * 400)), { gain: g * k, pan: pan * (dt ? -1 : 1) });
    }
  },
  /** light crossing: a fast bright glide */
  zap(t, g = 0.03, dur = 0.35, f0 = 600, f1 = 4200) {
    let ph = 0;
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      ph += (TAU * (f0 + (f1 - f0) * p * p)) / SR;
      return Math.sin(ph) * Math.sin(Math.PI * p) * 0.6;
    }, { gain: g, pan: -0.3 });
    SFX.air(t, g * 0.8, dur * 1.2, 7000, 0.3);
  },
  /** an error slide: a tone falling a fifth */
  slide(t, g = 0.026, dur = 0.5, f0 = 660, f1 = 440) {
    let ph = 0;
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      ph += (TAU * (f0 + (f1 - f0) * p)) / SR;
      return Math.sin(ph) * Math.min(1, x * 80) * (1 - p) * 0.7;
    }, { gain: g, pan: 0.2 });
  },
  /** a jet wash: filtered noise that opens up and stays */
  wash(t, dur, g = 0.03) {
    const n = noiseGen();
    let y = 0;
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const cut = 300 + 2600 * Math.min(1, p * 2.5);
      const a = clamp((TAU * cut) / SR);
      y += a * (n() - y);
      return y * Math.min(1, x * 3) * Math.min(1, (dur - x) * 2) * 0.9;
    }, { gain: g, pan: 0 });
  },
  /** a rocket: deep rumble that swells */
  rumble(t, dur = 2.2, g = 0.08) {
    const n = noiseGen();
    const l1 = lp(160);
    const l2 = lp(700);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return (l1(n()) * 2.2 + l2(n()) * 0.5 * p) * Math.min(1, x * 4) * (1 - p * p);
    }, { gain: g, pan: -0.3 });
  },
  /** a pen tracing on paper */
  scratch(t, dur, g = 0.02) {
    const n = noiseGen();
    const h = hp(1800);
    const l = lp(5000);
    addTone(sfx, t, dur, (x) => l(h(n())) * (0.55 + 0.45 * Math.sin(TAU * 7 * x) ** 2) * Math.min(1, x * 10) * Math.min(1, (dur - x) * 10), { gain: g, pan: 0.1 });
  },
  /** a glassy cold chime (for −7) */
  ice(t, g = 0.028) {
    [2637, 1976, 1568].forEach((f, i) => SFX.ding(t + i * 0.07, g * (1 - i * 0.2), f, 1.6, (i - 1) * 0.35));
  },
  /** a warm rising chord (for +45) */
  warm(t, g = 0.026) {
    [392, 493.88, 587.33, 783.99].forEach((f, i) => SFX.ding(t + i * 0.06, g * (1 - i * 0.12), f, 2.4, (i - 1.5) * 0.3));
  },
  sizzle(t, dur, g = 0.02, pan = 0) {
    // frying: bright hiss with random fat crackles
    const n = noiseGen();
    const h = hp(2500);
    const f = lp(9000);
    addTone(sfx, t, dur, (x) => f(h(n())) * (0.6 + 0.4 * Math.sin(TAU * 3 * x)) * Math.min(1, x * 6) * Math.min(1, (dur - x) * 4), { gain: g * 0.5, pan });
    const k = Math.floor(dur * 30);
    for (let i = 0; i < k; i++) {
      const at = t + rand() * dur;
      const nn = noiseGen();
      addTone(sfx, at, 0.012, (x) => nn() * Math.exp(-x * 500), { gain: g * (0.4 + rand() * 0.8), pan: pan + (rand() - 0.5) * 0.8 });
    }
  },
  flame(t, dur = 1.4, g = 0.05, pan = 0) {
    // a fire catching: low roar with flicker
    const n = noiseGen();
    const f1 = lp(900);
    const f2 = lp(300);
    addTone(sfx, t, dur, (x) => {
      const fl = 0.7 + 0.3 * Math.sin(TAU * 7.3 * x) * Math.sin(TAU * 3.1 * x + 1);
      return (f1(n()) * 0.7 + f2(n()) * 1.4) * fl * Math.min(1, x * 5) * Math.exp(-Math.max(0, x - dur * 0.4) * 2.4);
    }, { gain: g, pan });
  },
  spike(t, g = 0.012, pan = 0) {
    // a nerve action potential: a tiny bright click with a thump
    const n = noiseGen();
    const h = hp(3000);
    addTone(sfx, t, 0.012, (x) => h(n()) * Math.exp(-x * 600), { gain: g, pan });
    addTone(sfx, t, 0.03, (x) => Math.sin(TAU * 2400 * x) * Math.exp(-x * 180), { gain: g * 0.35, pan });
  },
  chirp(t, g = 0.02, pan = 0.3) {
    // a bulbul's quick two-note chirp
    for (let k = 0; k < 2; k++) {
      const at = t + k * 0.11;
      const f0 = 2600 + k * 500 + rand() * 200;
      addTone(sfx, at, 0.09, (x) => Math.sin(TAU * (f0 * x + 9000 * x * x)) * Math.sin(Math.PI * clamp(x / 0.09)), { gain: g, pan });
    }
  },
  gulp(t, g = 0.05) {
    // a soft swallow: a pitch drop with a little body
    let ph = 0;
    addTone(sfx, t, 0.22, (x) => {
      const f = 420 - 1200 * x;
      ph += (TAU * Math.max(90, f)) / SR;
      return Math.sin(ph) * Math.sin(Math.PI * clamp(x / 0.22)) * 0.9;
    }, { gain: g });
  },
  crunch(t, g = 0.04, pan = -0.3) {
    // a bite: dry noise bursts
    for (let k = 0; k < 3; k++) {
      const n = noiseGen();
      const b = lp(3500);
      const at = t + k * 0.025 + rand() * 0.01;
      addTone(sfx, at, 0.05, (x) => b(n()) * Math.exp(-x * 90), { gain: g * (1 - k * 0.2), pan });
    }
  },
  pour(t, dur = 1.2, g = 0.03, pan = -0.2) {
    // water pouring: band noise plus bubbles
    const n = noiseGen();
    const l1 = lp(1800);
    const h1 = hp(300);
    addTone(sfx, t, dur, (x) => h1(l1(n())) * Math.min(1, x * 8) * Math.min(1, (dur - x) * 5), { gain: g, pan });
    const k = Math.floor(dur * 14);
    for (let i = 0; i < k; i++) {
      const at = t + 0.1 + rand() * (dur - 0.2);
      const f = 400 + rand() * 700;
      addTone(sfx, at, 0.06, (x) => Math.sin(TAU * (f * x + 3000 * x * x)) * Math.exp(-x * 60), { gain: g * 0.4, pan: pan + (rand() - 0.5) * 0.5 });
    }
  },
  bubble(t, g = 0.016, pan = 0) {
    const f = 500 + rand() * 500;
    addTone(sfx, t, 0.08, (x) => Math.sin(TAU * (f * x + 4000 * x * x)) * Math.exp(-x * 45), { gain: g, pan });
  },
  siren(t, dur, g = 0.022) {
    // the brain's alarm: a two-tone pulse
    let ph = 0;
    addTone(sfx, t, dur, (x) => {
      const f = Math.floor(x * 5) % 2 ? 784 : 988;
      ph += (TAU * f) / SR;
      const v = Math.sin(ph) * 0.6 + Math.sin(ph * 2) * 0.15;
      return v * Math.min(1, x * 10) * Math.min(1, (dur - x) * 6);
    }, { gain: g, pan: 0.15 });
  },
  flap(t, g = 0.02, pan = 0.3) {
    const n = noiseGen();
    const f = lp(700);
    addTone(sfx, t, 0.07, (x) => f(n()) * Math.sin(Math.PI * clamp(x / 0.07)), { gain: g, pan });
  },
});

Object.assign(SFX, {
  /** a sheet of paper sliding over another and settling */
  paper(t, g = 0.05, pan = 0.25) {
    const n = noiseGen();
    let y = 0;
    let z = 0;
    const dur = 0.42;
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const cut = 900 + 4200 * Math.sin(Math.PI * Math.min(1, p * 1.2));
      const a = clamp((TAU * cut) / SR);
      y += a * (n() - y);
      z += 0.02 * (y - z);
      const grain = 0.75 + 0.25 * Math.sin(TAU * 31 * x) * Math.sin(TAU * 13 * x);
      return (y - z) * grain * Math.sin(Math.PI * p) ** 0.8 * 1.4;
    }, { gain: g, pan });
    addTone(sfx, t + 0.21, 0.18, (x) => Math.sin(TAU * (120 - 50 * x) * x) * Math.exp(-x * 26), { gain: g * 0.55, pan: pan * 0.4 });
  },
  /** a broad brush stroke */
  brush(t, g = 0.03, dur = 0.32, pan = 0) {
    const n = noiseGen();
    const h = hp(900);
    const l = lp(6000);
    addTone(sfx, t, dur, (x) => l(h(n())) * Math.sin(Math.PI * clamp(x / dur)) * (0.7 + 0.3 * Math.sin(TAU * 23 * x)), { gain: g, pan });
  },
  /** water in a shallow sea: low hush and slow bubbles */
  sea(t, dur, g = 0.03) {
    const n = noiseGen();
    const l = lp(420);
    addTone(sfx, t, dur, (x) => l(n()) * (0.7 + 0.3 * Math.sin(TAU * 0.3 * x)) * Math.min(1, x * 2) * Math.min(1, (dur - x) * 1.5) * 1.6, { gain: g, pan: -0.15 });
    for (let k = 0; k < dur * 2.2; k++) SFX.bubble(t + 0.3 + rand() * (dur - 0.6), g * 0.35, (rand() - 0.5) * 0.8);
  },
  /** the Arctic deep: a darker hush that swells */
  deep(t, dur, g = 0.04) {
    const n = noiseGen();
    const l = lp(220);
    addTone(sfx, t, dur, (x) => l(n()) * (0.6 + 0.4 * Math.sin(TAU * 0.16 * x + 1)) * Math.min(1, x * 1.5) * Math.min(1, (dur - x) * 1.5) * 2.2, { gain: g, pan: 0.1 });
  },
  /** a ship's bell: two strikes */
  shipBell(t, g = 0.024) {
    for (const dt of [0, 0.42]) {
      addTone(sfx, t + dt, 2.4, (x) => (Math.sin(TAU * 1046 * x) * 0.5 + Math.sin(TAU * 2511 * x) * 0.18 * Math.exp(-x * 4) + Math.sin(TAU * 3870 * x) * 0.07 * Math.exp(-x * 9)) * Math.exp(-x * 1.6) * (1 - Math.exp(-x * 900)), { gain: g, pan: -0.25 });
    }
  },
});


Object.assign(SFX, {
  /** a paper cut-out set down on the sheet: a soft tap and a crinkle */
  tap(t, g = 0.04, pan = 0) {
    addTone(sfx, t, 0.16, (x) => Math.sin(TAU * (160 - 70 * x) * x) * Math.exp(-x * 30), { gain: g, pan });
    const n = noiseGen();
    const h = hp(2500);
    addTone(sfx, t, 0.06, (x) => h(n()) * Math.exp(-x * 90), { gain: g * 0.5, pan });
  },
  /** a felt-tip loop on paper: a squeaky, wobbling friction */
  marker(t, dur = 0.5, g = 0.018, pan = 0.1) {
    const n = noiseGen();
    let y = 0;
    let z = 0;
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const cut = 2600 + 900 * Math.sin(TAU * 7 * x);
      const a = clamp((TAU * cut) / SR);
      y += a * (n() - y);
      z += 0.05 * (y - z);
      return (y - z) * Math.sin(Math.PI * p) ** 0.7 * 1.6;
    }, { gain: g, pan });
  },
  /** a map pin pushed in: a bright tick and a small thud */
  pin(t, g = 0.03, pan = 0) {
    addTone(sfx, t, 0.05, (x) => (Math.sin(TAU * 3100 * x) * 0.5 + Math.sin(TAU * 4700 * x) * 0.25) * Math.exp(-x * 120), { gain: g * 0.7, pan });
    addTone(sfx, t + 0.012, 0.12, (x) => Math.sin(TAU * (210 - 90 * x) * x) * Math.exp(-x * 38), { gain: g, pan });
  },
  /** a type bar striking hard (a digit set in the cartouche) */
  slam(t, g = 0.05, pan = 0) {
    const n = noiseGen();
    const h = hp(1200);
    addTone(sfx, t, 0.05, (x) => h(n()) * Math.exp(-x * 120), { gain: g * 0.8, pan });
    addTone(sfx, t, 0.2, (x) => Math.sin(TAU * (130 - 50 * x) * x) * Math.exp(-x * 22), { gain: g, pan });
  },
});

/* -------------------------------- cues ----------------------------------- */

function renderSFX() {
  const S = (i) => tl.scenes[i].start;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9-]/g, '');
  /** global time of the nth spoken `word` in scene i (+ off) */
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
  const typeRun = (t0, dur, n, g = 0.011) => { for (let k = 0; k < n; k++) SFX.key(t0 + (k / n) * dur + rand() * 0.015, g); };
  const tickRun = (t0, t1, n, g, f0, f1) => { for (let k = 0; k < n; k++) { const p = k / n; SFX.tick(t0 + (t1 - t0) * (1 - (1 - p) * (1 - p)), g, f0 + (f1 - f0) * p, (rand() - 0.5) * 0.6); } };
  const popRun = (t0, dur, n, g, f0, f1) => { for (let k = 0; k < n; k++) SFX.pop(t0 + (k / n) * dur + rand() * 0.02, g, f0 * Math.pow(f1 / f0, k / Math.max(1, n - 1)), (rand() - 0.5) * 0.7); };

  // every new sheet is dealt onto the stack (whoosh, then the knock)
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.paper(sc.start + 0.08, 0.065, i % 2 ? 0.3 : -0.3);
  });

  // s1 — the cut-out lands across the United States; the pull-back
  SFX.tap(0.42, 0.045, 0.05);
  SFX.marker(C(0, 'lebih', 0, 0.1), 0.35, 0.02, -0.35);
  SFX.marker(C(0, 'lebih', 0, 0.35), 0.35, 0.02, 0.35);
  SFX.pop(C(0, 'amerika', 0, -0.1), 0.022, 900, 0.2);
  {
    const t0 = C(0, 'tapi', 0, 0.05);
    SFX.air(t0, 0.05, 1.7, 1800, -0.1);
    SFX.rise(t0 + 0.1, 0.022, 1.5, 300, 160);
    SFX.tap(t0 + 1.65, 0.05, 0.1);
  }
  SFX.paper(C(0, 'sd', 0, -0.3), 0.035, -0.25);
  SFX.marker(C(0, 'indonesia', 1, -0.05), 0.6, 0.024, 0.2);
  SFX.pop(C(0, 'kecil', 0, -0.05), 0.024, 760, 0.2);

  // s2 — the chart and the carrack, the year, globe, gores, the stretch
  SFX.sea(C(1, 'peta', 0, -0.8), 4.6, 0.022);
  SFX.pin(C(1, 'peta', 0, -0.5), 0.024, 0.3);
  SFX.paper(C(1, 'tahun', 0, -0.4), 0.03, 0.3);
  ['seribu', 'lima', 'enam', 'sembilan'].forEach((w, i) => SFX.slam(C(1, w, 0, -0.04), 0.045 + (i === 3 ? 0.012 : 0), 0.25));
  SFX.ding(C(1, 'sembilan', 0, 0.05), 0.016, 880, 1.2, 0.25);
  typeRun(C(1, 'untuk', 0, -0.1), 0.6, 19, 0.01);
  SFX.air(C(1, 'bumi', 0, -0.3), 0.035, 0.8, 2600, 0);
  SFX.ding(C(1, 'bulat', 0, -0.1), 0.012, 523.25, 1.6, -0.1);
  for (let g = 0; g < 6; g++) SFX.flap(C(1, 'dibentangkan', 0, g * 0.07), 0.016, (g - 2.5) * 0.25);
  SFX.paper(C(1, 'jadi', 0, -0.05), 0.04, 0);
  SFX.tick(C(1, 'jadi', 0, 0.8), 0.02, 1500, 0);
  SFX.rise(C(1, 'makin', 0, 0.15), 0.035, 2.6, 110, 420);
  SFX.pop(C(1, 'khatulistiwa', 0, -0.1), 0.02, 820, -0.3);
  SFX.pop(C(1, 'digelembungkan', 0, -0.1), 0.022, 700, 0.3);

  // s3 — the square slides north; Greenland and Africa; fourteen copies
  SFX.brush(C(2, 'garis', 0, -0.1), 0.026, 0.9, -0.2);
  SFX.pop(C(2, 'enam', 0, -0.05), 0.02, 820, -0.3);
  {
    const t0 = C(2, 'luasnya', 0, -0.1);
    const t1 = C(2, 'empat', 0, -0.04);
    SFX.air(t0, 0.03, t1 - t0 + 0.1, 2000, 0.1);
    tickRun(t0, t1, 8, 0.011, 900, 1600);
    SFX.boom(t1, 0.06, 48);
    SFX.ding(t1 + 0.02, 0.018, 659.25, 1.4, 0.2);
  }
  SFX.air(C(2, 'greenland', 0, -0.35), 0.035, 1.0, 1800, -0.1);
  SFX.pop(C(2, 'greenland', 0, -0.05), 0.022, 760, -0.3);
  SFX.pop(C(2, 'afrika', 0, -0.1), 0.022, 680, 0.2);
  SFX.paper(C(2, 'afrika', 0, 0.12), 0.026, -0.3);
  {
    const f0 = C(2, 'padahal', 0, -0.05);
    const land = C(2, 'empat', 1, -0.12);
    SFX.air(f0, 0.04, land - f0 + 0.1, 2200, -0.2);
    SFX.tap(land, 0.04, 0.05);
    for (let k = 0; k < 13; k++) SFX.tap(C(2, 'empat', 1, k * 0.045 + 0.05), 0.022 + rand() * 0.008, (rand() - 0.5) * 0.7);
    SFX.boom(C(2, 'belas', 0, 0.05), 0.055, 46);
    SFX.chord(C(2, 'belas', 0, 0.08), 0.017, 440);
  }

  // s4 — the equator, the gauge, Europe deflating
  SFX.brush(S(3) + 0.12, 0.024, 1.0, 0.2);
  SFX.pop(C(3, 'khatulistiwa', 0, -0.1), 0.02, 820, 0.3);
  SFX.brush(C(3, 'ukurannya', 0, -0.4), 0.02, 1.1, -0.35);
  SFX.ding(C(3, 'hampir', 0, -0.12), 0.016, 783.99, 1.2, 0.2);
  SFX.brush(C(3, 'eropa', 0, -0.15), 0.026, 0.45, -0.2);
  SFX.down(C(3, 'lebih', 0, -0.05), 0.03, 1.0);
  SFX.air(C(3, 'lebih', 0, -0.05), 0.026, 1.0, 1600, -0.1);
  SFX.pop(C(3, 'lebih', 0, 0.6), 0.018, 700, 0.2);
  SFX.pop(C(3, 'lebih', 0, 0.8), 0.018, 820, -0.3);
  SFX.boom(C(3, 'dua', 0, -0.05), 0.05, 50);

  // s5 — Indonesia carried to Europe, swelling as it goes; the two pins
  {
    const f0 = C(4, 'pindahkan', 0, 0.05);
    const f1 = C(4, 'aslinya', 0, 0.1);
    SFX.air(f0, 0.045, f1 - f0 + 0.15, 1900, 0.15);
    SFX.rise(f0 + 0.1, 0.03, f1 - f0, 140, 520);
    SFX.tap(f1, 0.05, -0.1);
    SFX.boom(f1 + 0.02, 0.04, 52);
  }
  SFX.pin(C(4, 'sabang', 0, -0.12), 0.032, -0.4);
  SFX.pin(C(4, 'merauke', 0, -0.12), 0.032, 0.4);
  {
    const t0 = C(4, 'membentang', 0, -0.05);
    const t1 = C(4, 'kaspia', 0, 0.15);
    SFX.scratch(t0, t1 - t0, 0.008);
  }
  SFX.pop(C(4, 'irlandia', 0, -0.05), 0.02, 760, -0.35);
  SFX.marker(C(4, 'melewati', 0, -0.05), 0.6, 0.02, 0.3);
  SFX.pop(C(4, 'kaspia', 0, -0.1), 0.02, 680, 0.3);

  // s6 — the rulers count as the numbers are said
  tickRun(S(5) + 0.05, S(5) + 0.6, 12, 0.008, 1300, 1900);
  SFX.pop(S(5) + 0.25, 0.018, 760, -0.35);
  SFX.air(C(5, 'lima', 0, -0.02), 0.026, 0.4, 2800, -0.1);
  tickRun(C(5, 'lima', 0, -0.02), C(5, 'lima', 0, 0.3), 10, 0.012, 900, 1500);
  SFX.tick(C(5, 'seratus', 0, 0.02), 0.02, 1700, 0);
  SFX.ding(C(5, 'kilometer', 0, -0.03), 0.017, 880, 1.0, -0.1);
  SFX.pop(C(5, 'amerika', 0, -0.1), 0.02, 760, 0.1);
  SFX.pop(C(5, 'pantai', 0, -0.1), 0.02, 700, -0.4);
  SFX.pop(C(5, 'pantai', 1, -0.1), 0.02, 840, 0.4);
  SFX.air(C(5, 'empat', 0, -0.02), 0.026, 0.4, 2800, 0.1);
  tickRun(C(5, 'empat', 0, -0.02), C(5, 'empat', 0, 0.3), 9, 0.012, 800, 1300);
  SFX.tick(C(5, 'lima', 1, 0.02), 0.02, 1400, 0);
  SFX.ding(C(5, 'ratus', 0, 0.25), 0.015, 659.25, 1.0, 0.1);

  // s7 — the docket, the map turning fair, the assembly, one red seat
  typeRun(S(6) + 0.35, 1.0, 30, 0.01);
  SFX.pop(C(6, 'pbb', 0, 0), 0.018, 760, 0.3);
  SFX.wash(C(6, 'peta', 0, -0.15), 1.8, 0.022);
  SFX.shimmer(C(6, 'peta', 0, 0.2), 1.4, 0.014, 1500);
  SFX.pop(C(6, 'luas', 0, -0.1), 0.02, 820, -0.3);
  popRun(C(6, 'seratus', 0, -0.02), 0.55, 22, 0.012, 500, 900);
  popRun(C(6, 'enam', 0, -0.02), 0.4, 12, 0.012, 900, 1150);
  popRun(C(6, 'empat', 1, -0.02), 0.18, 4, 0.013, 1150, 1250);
  SFX.chord(C(6, 'setuju', 0, -0.05), 0.016, 523.25);
  popRun(C(6, 'menolak', 0, -0.1), 0.3, 6, 0.01, 420, 380);
  SFX.slide(C(6, 'satu', 0, -0.08), 0.022, 0.55, 520, 330);
  SFX.boom(C(6, 'satu', 0, -0.06), 0.045, 46);
  SFX.pop(C(6, 'amerika', 0, -0.05), 0.02, 700, 0.35);
  SFX.stamp(C(6, 'serikat', 0, 0.25), 0.11);

  // s8 — the outline laid over the islands, pins, the question
  SFX.brush(C(7, 'sekecil', 0, -0.25), 0.026, 0.6, 0.1);
  SFX.ding(C(7, 'kira', 0, 0.0), 0.014, 587.33, 1.2, -0.1);
  for (let k = 0; k < 7; k++) SFX.pin(C(7, 'kamu', 1, -0.1 + k * 0.09 + 0.3), 0.022, (k / 6 - 0.5) * 0.8);
  SFX.paper(C(7, 'kamu', 1, -0.35), 0.03, -0.2);
  typeRun(C(7, 'kamu', 1, 0), 1.04, 27, 0.011);
  SFX.pop(C(7, 'tulis', 0, -0.1), 0.026, 880, 0.3);
  SFX.chord(C(7, 'komentar', 0, 0.6), 0.018, 440);
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

const TARGET = -10.5; // integrated LUFS of the master: loud, voice first
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
      out[ch][i] = vo[ch][i] * 1.0 + (m - 0.55 * d * mid) * 1.0 * duckM + sfx[ch][i] * 0.95 * duckS;
    }
  }
  for (let ch = 0; ch < 2; ch++) {
    const f = hp(28);
    for (let i = 0; i < N; i++) out[ch][i] = f(out[ch][i]);
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
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep29.flac');
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
  console.log(`mix-ep29.flac  ${(N / SR).toFixed(2)}s  ${got.toFixed(2)} LUFS  peak ${(20 * Math.log10(pk)).toFixed(2)} dBFS  limiter ${lim.toFixed(1)} dB  de-ess ${ess.toFixed(1)} dB  voice/bed ${vbr.toFixed(1)} dB  gain ${(20 * Math.log10(gain)).toFixed(1)} dB`);
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
