/**
 * Episode 27 soundtrack — "Pedas itu sebenarnya bukan rasa."
 *
 * A warm, curious bed in G minor at 96 BPM: soft pads, a wooden marimba
 * figure that keeps the explainer moving, a sub on the downbeat and a dry
 * shaker under everything. The sound design follows the picture: the chili
 * sizzling under the lamp, the strike on "rasa", nerve spikes crackling, five
 * taste pops climbing a scale, the molecule locking into its sensor, the
 * thermometer ticking up to forty-three, the brain's siren and the fire, sweat
 * and a tear dripping, water pouring and spreading, milk binding and rinsing,
 * the dilution glasses, the year rolling to 1912, the chart racing to 2.7
 * million, bird chirps and a gulp, the rat crunching seeds, a sprout, the
 * level meter filling to ten and the comment box at the end.
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

const BPM = 96;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const totalBars = Math.ceil(tl.total / BAR) + 1;

// G minor, then the six, the three and the seven: warm, curious, unresolved
const CHORDS = [
  [98.0, 146.83, 196.0, 233.08], // Gm
  [77.78, 116.54, 155.56, 196.0], // Eb
  [58.27, 87.31, 116.54, 146.83], // Bb
  [87.31, 130.81, 174.61, 220.0], // F
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

/** a wooden marimba note: round fundamental, a quick knock on the fourth harmonic */
const marimba = (f, decay = 7) => {
  const flt = lp(3200);
  return (t) => {
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 900));
    const v = Math.sin(TAU * f * t) * 0.7
      + Math.sin(TAU * f * 4 * t) * 0.18 * Math.exp(-t * 40)
      + Math.sin(TAU * f * 10 * t) * 0.05 * Math.exp(-t * 90);
    return flt(v) * env;
  };
};

/** a dry shaker grain */
function shaker(t, g) {
  const n = noiseGen();
  const h = hp(6500);
  addTone(music, t, 0.06, (x) => h(n()) * Math.exp(-x * 70) * (1 - Math.exp(-x * 900)), { gain: g, pan: 0.3 });
}

function renderMusic() {
  const air = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    const opening = bar < 2;
    addTone(music, t0, BAR * 2.0, pad(chord[0] / 2, 2.0, BAR * 2.0, 200), { gain: opening ? 0.11 : 0.15 });
    chord.forEach((f, i) => {
      addTone(music, t0 + i * 0.08, BAR * 2.2, pad(f, 2.6, BAR * 2.2, 640 + i * 90), {
        gain: 0.04 - i * 0.005,
        pan: (i - 1.5) * 0.32,
      });
    });
    // the marimba figure: syncopated sixteenths walking the chord, from bar 1
    if (bar >= 1) {
      const fig = [[0, 0], [3, 2], [4, 1], [6, 3], [8, 2], [10, 1], [11, 3], [14, 2]];
      fig.forEach(([six, k], j) => {
        const f = chord[k] * 2;
        addTone(music, t0 + six * BEAT * 0.25, 0.8, marimba(f, 7.5), {
          gain: (j % 2 ? 0.017 : 0.023) * (bar < 3 ? 0.7 : 1),
          pan: j % 2 ? 0.38 : -0.38,
        });
      });
    }
    // a sub on the downbeat, a softer one on beat three
    addTone(music, t0, 0.9, (x) => Math.sin(TAU * chord[0] * 0.5 * x) * Math.exp(-x * 3.2) * (1 - Math.exp(-x * 200)), { gain: 0.07 });
    if (bar >= 2) addTone(music, t0 + BEAT * 2, 0.6, (x) => Math.sin(TAU * chord[0] * 0.5 * x) * Math.exp(-x * 4.5) * (1 - Math.exp(-x * 200)), { gain: 0.035 });
    const n = noiseGen();
    const fl = lp(2000);
    addTone(air, t0, BAR * 1.02, (t) => fl(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.012, pan: bar % 2 === 0 ? -0.45 : 0.45,
    });
  }
  // shaker on the sixteenths, accented on the off-beats
  for (let k = 8; k * BEAT * 0.25 < tl.total; k++) {
    const acc = k % 4 === 2 ? 1 : k % 2 ? 0.45 : 0.3;
    shaker(k * BEAT * 0.25, 0.007 * acc);
  }
  const hf = lp(6000);
  for (let i = 0; i < N; i++) {
    const v = hf(rand() * 2 - 1) * 0.004;
    air[0][i] += v;
    air[1][i] += v;
  }
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) music[ch][i] += air[ch][i];
  const fin = 0.5 * SR;
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
  const typeRun = (t0, dur, n, g = 0.011) => { for (let k = 0; k < n; k++) SFX.key(t0 + (k / n) * dur + rand() * 0.015, g); };
  const tickRun = (t0, t1, n, g, f0, f1) => { for (let k = 0; k < n; k++) { const p = k / n; SFX.tick(t0 + (t1 - t0) * (1 - (1 - p) * (1 - p)), g, f0 + (f1 - f0) * p, (rand() - 0.5) * 0.6); } };
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.air(sc.start - 0.3, 0.034, 0.8, 2000);
    SFX.boom(sc.start - 0.05, 0.034, 54);
  });

  const spikeRun = (t0, t1, rate, g = 0.01, pan = 0) => {
    let at = t0;
    while (at < t1) {
      SFX.spike(at, g * (0.6 + rand() * 0.6), pan + (rand() - 0.5) * 0.5);
      at += (0.4 + rand() * 1.2) / rate;
    }
  };
  // the level meter: pips land where 10 * inOutQuad(p) crosses each half step
  const ioq = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const crossings = (t0, d, n) => {
    const out = [];
    for (let k = 1; k <= n; k++) {
      let lo = 0;
      let hi = 1;
      for (let it = 0; it < 30; it++) {
        const mid = (lo + hi) / 2;
        if (ioq(mid) * n < k - 0.5) lo = mid; else hi = mid;
      }
      out.push(t0 + lo * d);
    }
    return out;
  };

  // s1 — BUKAN RASA: the chili sizzling under the lamp, the title, the
  // badge and its ring; the tongue's nerves crackling, the equals, the fire
  SFX.air(0.0, 0.04, 1.0, 1600);
  SFX.sizzle(0.0, W(0, 1, 0) - 0.4, 0.014, 0.2);
  SFX.boom(W(0, 0, 0) - 0.05, 0.05, 50);
  SFX.shimmer(W(0, 0, 0) - 0.1, 1.1, 0.02, 1568);
  SFX.pop(W(0, 0, 3) - 0.1, 0.03, 560, 0);
  SFX.boom(W(0, 0, 4), 0.045, 46);
  SFX.ding(W(0, 0, 4) + 0.02, 0.02, 587.33, 1.8);
  SFX.air(cap(0, 1) - 0.4, 0.04, 0.8, 2200, -0.1);
  SFX.zap(W(0, 1, 2) - 0.1, 0.022, 0.5, 900, 3200);
  spikeRun(W(0, 1, 2), S(1) - 0.3, 9, 0.011, 0.25);
  SFX.pop(W(0, 1, 3) - 0.2, 0.022, 760, 0.3);
  SFX.ding(W(0, 1, 5) - 0.02, 0.022, 1175, 1.2, 0.2);
  SFX.pop(W(0, 1, 6) - 0.15, 0.022, 820, 0.3);
  SFX.flame(W(0, 1, 8) - 0.1, 1.3, 0.06, 0.2);
  SFX.boom(W(0, 1, 8) - 0.05, 0.05, 48);

  // s2 — LIMA RASA: the title, five tastes popping up a pentatonic scale;
  // PEDAS lands and is struck off, the x-ray, the pain nerves light up
  SFX.boom(W(1, 0, 3) - 0.1, 0.03, 56);
  SFX.shimmer(W(1, 0, 3) - 0.15, 0.8, 0.016, 1318);
  [5, 6, 7, 8, 10].forEach((k, i) => {
    const f = [523.25, 587.33, 659.25, 783.99, 880.0][i];
    SFX.pop(W(1, 0, k) - 0.1, 0.026, f, (i - 2) * 0.3);
    SFX.ding(W(1, 0, k) - 0.06, 0.012, f * 2, 0.9, (i - 2) * 0.3);
  });
  SFX.air(cap(1, 1) - 0.5, 0.045, 0.8, 2400, 0.1);
  SFX.slide(cap(1, 1) - 0.45, 0.018, 0.5, 520, 780);
  SFX.pop(W(1, 1, 0) - 0.08, 0.03, 600, 0);
  SFX.slash(W(1, 1, 2) - 0.05, 0.05, 0);
  SFX.down(W(1, 1, 2), 0.026, 0.6);
  SFX.rise(W(1, 1, 5) - 0.3, 0.026, W(1, 1, 7) - W(1, 1, 5) + 0.3, 160, 560);
  SFX.zap(W(1, 1, 7) - 0.1, 0.03, 0.6, 700, 3600);
  spikeRun(W(1, 1, 7), S(2) - 0.3, 10, 0.012, 0);
  SFX.boom(W(1, 1, 8) - 0.04, 0.05, 48);
  SFX.ding(W(1, 1, 8) + 0.02, 0.022, 659.25, 1.8);

  // s3 — SENSOR PANAS: the formula draws, molecules drift down, one locks
  // into the sensor, the sensor glows; the thermometer climbs and crosses 43
  SFX.shimmer(W(2, 0, 1) - 0.1, 0.9, 0.02, 1760);
  SFX.pop(W(2, 0, 1) - 0.05, 0.022, 900, 0.3);
  SFX.dissolve(W(2, 0, 3) - 0.1, 1.4, 0.02);
  for (let k = 0; k < 6; k++) SFX.bubble(W(2, 0, 3) + k * 0.22, 0.01, (rand() - 0.5) * 0.8);
  SFX.lock(W(2, 0, 4) + 0.15, 0.026);
  SFX.boom(W(2, 0, 4) + 0.15, 0.03, 60);
  SFX.slide(W(2, 0, 6) - 0.1, 0.02, 0.5, 520, 880);
  SFX.warm(W(2, 0, 7) - 0.06, 0.024);
  SFX.boom(W(2, 0, 7) - 0.05, 0.045, 50);
  spikeRun(W(2, 0, 7), cap(2, 1) - 0.5, 7, 0.009, 0);
  SFX.air(cap(2, 1) - 0.45, 0.04, 0.8, 2200, -0.2);
  SFX.rise(cap(2, 1) + 0.1, 0.026, W(2, 1, 11) - cap(2, 1) - 0.1, 180, 820);
  tickRun(cap(2, 1) + 0.1, W(2, 1, 11), 26, 0.009, 900, 2000);
  SFX.boom(W(2, 1, 11) - 0.04, 0.055, 46);
  SFX.zap(W(2, 1, 11) - 0.02, 0.03, 0.7, 600, 4000);
  SFX.warm(W(2, 1, 11), 0.026);
  spikeRun(W(2, 1, 11) + 0.1, S(3) - 0.3, 11, 0.012, 0.2);
  SFX.ding(W(2, 1, 12) + 0.05, 0.02, 523.25, 1.8);

  // s4 — TERTIPU: the signal climbs to the brain, the panel types its
  // conclusion, the siren, the fire rising, a calm chime for the real 36.8;
  // the thermal camera, the flush, sweat dripping, a tear
  spikeRun(S(3), W(3, 0, 4), 10, 0.012, 0);
  SFX.boom(W(3, 0, 1) - 0.05, 0.03, 56);
  SFX.pop(W(3, 0, 2) - 0.15, 0.024, 680, 0);
  typeRun(W(3, 0, 3) - 0.1, 0.9, 15, 0.011);
  SFX.siren(W(3, 0, 4) - 0.1, cap(3, 1) - W(3, 0, 4) - 0.3, 0.02);
  SFX.flame(W(3, 0, 5) - 0.15, 1.6, 0.08, 0);
  SFX.boom(W(3, 0, 5) - 0.05, 0.06, 44);
  SFX.ding(W(3, 0, 5) + 0.25, 0.018, 1318.5, 1.4, -0.3);
  SFX.air(cap(3, 1) - 0.45, 0.045, 0.8, 2000, 0.2);
  SFX.ping(cap(3, 1) - 0.1, 0.014, 1760, 0.4);
  SFX.ping(cap(3, 1) + 0.05, 0.012, 1760, 0.4);
  SFX.warm(W(3, 1, 2) - 0.2, 0.024);
  SFX.pop(W(3, 1, 2) - 0.12, 0.022, 700, 0.3);
  for (let k = 0; k < 3; k++) SFX.drop(W(3, 1, 3) - 0.1 + k * 0.17, 0.022, 1200 + k * 150, 0.2);
  SFX.pop(W(3, 1, 3) - 0.12, 0.022, 760, 0.3);
  SFX.drop(W(3, 1, 7) - 0.05, 0.026, 1000, 0.1);
  SFX.pop(W(3, 1, 7) - 0.12, 0.022, 820, 0.3);
  SFX.chord(W(3, 1, 7) + 0.25, 0.018, 523.25);

  // s5 — SUSU: water pours into the scope and the molecules scatter, AIR is
  // struck off, the beaker, the molecules rise into the fat; the milk, the
  // casein drifting in, binding clicks, the rinse
  SFX.pour(W(4, 0, 0) - 0.05, 1.5, 0.03, -0.3);
  SFX.dissolve(W(4, 0, 3) - 0.25, 1.3, 0.024);
  SFX.air(W(4, 0, 3) - 0.1, 0.04, 1.0, 2600, 0.2);
  SFX.slash(W(4, 0, 4) - 0.08, 0.04, -0.3);
  SFX.pop(W(4, 0, 5) - 0.1, 0.024, 620, 0.3);
  for (let k = 0; k < 8; k++) SFX.bubble(W(4, 0, 8) - 0.1 + k * 0.11, 0.014, 0.3 + (rand() - 0.5) * 0.4);
  SFX.boom(W(4, 0, 10) - 0.05, 0.04, 52);
  SFX.ding(W(4, 0, 10) - 0.02, 0.02, 783.99, 1.6);
  SFX.air(cap(4, 1) - 0.45, 0.045, 0.8, 2200, -0.2);
  SFX.pop(W(4, 1, 0) - 0.1, 0.028, 560, -0.3);
  SFX.chord(W(4, 1, 2) - 0.05, 0.02, 587.33);
  SFX.slide(W(4, 1, 3) - 0.2, 0.018, 0.8, 440, 660);
  for (let k = 0; k < 4; k++) SFX.lock(W(4, 1, 5) - 0.05 + k * 0.12, 0.014);
  SFX.wash(W(4, 1, 8) - 0.1, 1.2, 0.03);
  SFX.shimmer(W(4, 1, 8) + 0.1, 1.0, 0.02, 1568);
  SFX.chord(W(4, 1, 8) + 0.5, 0.022, 659.25);

  // s6 — SKALA SCOVILLE: the dilution glasses step down, the last one goes
  // quiet; the year rolls and stamps 1912; the chart, the zoom out, Pepper X
  // racing to 2.7 million
  SFX.boom(S(5) + 0.02, 0.03, 56);
  for (let i = 0; i < 5; i++) {
    const at = W(5, 0, 2) - 0.2 + i * 0.28;
    SFX.pop(at + 0.1, 0.022, 880 - i * 90, (i - 2) * 0.3);
    if (i < 4) SFX.drop(at + 0.18, 0.012, 1400 - i * 160, (i - 2) * 0.3);
  }
  SFX.ding(W(5, 0, 2) + 1.32, 0.016, 1568, 1.0, 0.5);
  SFX.boom(W(5, 0, 4) + 0.3, 0.03, 50);
  SFX.pop(W(5, 0, 6) - 0.1, 0.026, 640, 0);
  tickRun(W(5, 0, 8) - 0.1, W(5, 0, 12) + 0.25, 12, 0.012, 1200, 1700);
  SFX.stamp(W(5, 0, 12) + 0.05, 0.08);
  SFX.boom(W(5, 0, 12) + 0.05, 0.045, 50);
  SFX.air(cap(5, 1) - 0.45, 0.045, 0.8, 2200, 0.2);
  SFX.pop(W(5, 1, 1) - 0.15, 0.026, 660, -0.2);
  SFX.pop(W(5, 1, 2) - 0.05, 0.022, 560, -0.4);
  SFX.tick(W(5, 1, 3) - 0.05, 0.02, 1300, 0);
  SFX.down(W(5, 1, 9) - 0.25, 0.03, 0.9);
  SFX.air(W(5, 1, 9) - 0.25, 0.04, 1.1, 1800, 0);
  SFX.pop(W(5, 1, 9) + 0.2, 0.022, 720, 0.2);
  SFX.pop(W(5, 1, 9) + 0.45, 0.022, 800, 0.3);
  SFX.rise(W(5, 1, 11) - 0.25, 0.04, W(5, 1, 15) - W(5, 1, 11) + 0.5, 140, 900);
  tickRun(W(5, 1, 11) - 0.25, W(5, 1, 15) + 0.25, 26, 0.011, 1000, 2400);
  SFX.boom(W(5, 1, 15) + 0.2, 0.06, 44);
  SFX.flame(W(5, 1, 15) + 0.1, 1.4, 0.05, 0.3);
  SFX.chord(W(5, 1, 15) + 0.22, 0.024, 783.99);

  // s7 — BURUNG: the garden, chirps, the peck, the gulp, the surprise; the
  // meter stays at zero; the two sensors — one locks and fires, one bounces
  SFX.chirp(S(6) + 0.08, 0.018, 0.4);
  SFX.chirp(S(6) + 0.9, 0.012, -0.5);
  const tPeck = S(6) + Math.max(0.15, W(6, 0, 0) - S(6) - 0.25);
  SFX.tick(tPeck + 0.22, 0.03, 900, 0.3);
  SFX.tick(tPeck + 0.3, 0.024, 820, 0.3);
  SFX.pop(W(6, 0, 0) - 0.05, 0.022, 980, 0.5);
  SFX.gulp(W(6, 0, 1) - 0.02, 0.05);
  SFX.chirp(W(6, 0, 2) + 0.2, 0.016, 0.4);
  SFX.pop(W(6, 0, 4) - 0.12, 0.022, 560, 0);
  SFX.ding(W(6, 0, 6) - 0.05, 0.02, 392.0, 2.0);
  SFX.chirp(W(6, 0, 6) + 0.5, 0.012, 0.5);
  SFX.air(cap(6, 1) - 0.45, 0.045, 0.8, 2200, -0.2);
  SFX.lock(W(6, 1, 0) + 0.65, 0.024);
  spikeRun(W(6, 1, 0) + 0.7, S(7) - 0.3, 10, 0.011, -0.4);
  SFX.pop(W(6, 1, 0) + 0.72, 0.026, 1200, 0.4);
  SFX.slide(W(6, 1, 0) + 0.74, 0.016, 0.4, 900, 1400);
  SFX.down(W(6, 1, 4) - 0.1, 0.02, 0.5);
  SFX.chord(W(6, 1, 6) - 0.15, 0.022, 587.33);

  // s8 — STRATEGI CABAI: the title, the rat crunching, the cross; the bird
  // gulps, the x-ray, wings, the seed lands and sprouts; the level meter fills
  // to ten, the fire, typing, send
  SFX.boom(W(7, 0, 1) - 0.05, 0.04, 52);
  SFX.shimmer(W(7, 0, 1) - 0.1, 0.9, 0.018, 1318);
  for (let k = 0; k < 6; k++) SFX.crunch(W(7, 0, 4) + k * 0.15, 0.035, -0.4);
  SFX.slash(W(7, 0, 5) - 0.05, 0.045, -0.4);
  SFX.boom(W(7, 0, 5) - 0.03, 0.035, 50);
  SFX.air(cap(7, 1) - 0.4, 0.04, 0.8, 2200, 0.3);
  SFX.chirp(W(7, 1, 0) - 0.1, 0.018, 0.5);
  SFX.gulp(W(7, 1, 1) - 0.08, 0.05);
  SFX.ping(W(7, 1, 2) - 0.12, 0.016, 1568, 0.4);
  for (let k = 0; k < 6; k++) SFX.flap(W(7, 1, 3) - 0.1 + k * 0.09, 0.02, 0.5);
  SFX.drop(W(7, 1, 3) + 0.5, 0.024, 700, 0.3);
  SFX.rise(W(7, 1, 4) - 0.1, 0.022, 0.8, 300, 900);
  SFX.chord(W(7, 1, 4) + 0.2, 0.024, 523.25);
  SFX.air(cap(7, 2) - 0.4, 0.04, 0.8, 2200, 0);
  const tLevel = W(7, 2, 0);
  const tBerapa = W(7, 2, 2);
  crossings(tLevel, tBerapa - tLevel + 0.9, 10).forEach((at, k) => SFX.pop(at, 0.018 + k * 0.001, 520 * Math.pow(2, k / 10), (k - 4.5) * 0.08));
  SFX.boom(tBerapa + 0.6, 0.05, 46);
  SFX.flame(tBerapa + 0.55, 1.2, 0.045, 0);
  SFX.pop(W(7, 2, 3) - 0.35, 0.03, 520, 0.3);
  typeRun(W(7, 2, 3), 1.4, 24, 0.012);
  SFX.pop(W(7, 2, 5) + 0.9, 0.035, 760, 0.2);
  SFX.ding(W(7, 2, 5) + 0.92, 0.026, 1046.5, 1.6, 0.2);
  SFX.chord(W(7, 2, 5) + 1.25, 0.022, 587.33);
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
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep27.flac');
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
  console.log(`mix-ep27.flac  ${(N / SR).toFixed(2)}s  ${got.toFixed(2)} LUFS  peak ${(20 * Math.log10(pk)).toFixed(2)} dBFS  limiter ${lim.toFixed(1)} dB  de-ess ${ess.toFixed(1)} dB  voice/bed ${vbr.toFixed(1)} dB  gain ${(20 * Math.log10(gain)).toFixed(1)} dB`);
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
