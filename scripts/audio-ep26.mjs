/**
 * Episode 26 soundtrack — "Tanpa Einstein, GPS di HP-mu nyasar sepuluh kilometer sehari."
 *
 * A precise, curious bed in D minor at 92 BPM: wide pads, a soft plucked
 * arpeggio that runs like a mechanism, a sub on the downbeat and a watch tick
 * buried under everything — time is the subject. The sound design follows the
 * picture: a toggle clacking off, the nav app's recalculation alert, satellite
 * pings, light zapping across the pitches, a jet wash for 14,000 km/h, clocks
 * racing through a day, a cold chime for −7 and a warm one for +45, a typed
 * archive with a stamp, a pen tracing the logbook, the switch clacking on, a
 * rocket, and the comment box at the end.
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

const BPM = 92;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const totalBars = Math.ceil(tl.total / BAR) + 1;

// D minor, then the six, the three and the seven: curious, steady, unresolved
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

/** a soft plucked note: a little brightness that dies fast, like a mechanism */
const pluck = (f, decay = 6) => {
  const flt = lp(2400);
  return (t) => {
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 500));
    const v = Math.sin(TAU * f * t) * 0.6 + Math.sin(TAU * f * 2 * t) * 0.22 * Math.exp(-t * 9)
      + Math.sin(TAU * f * 3 * t) * 0.08 * Math.exp(-t * 14);
    return flt(v) * env;
  };
};

/** a watch tick: tiny, bright, dry */
function watchTick(t, g) {
  const n = noiseGen();
  const h = hp(3500);
  addTone(music, t, 0.02, (x) => h(n()) * Math.exp(-x * 320), { gain: g, pan: 0.25 });
  addTone(music, t, 0.03, (x) => Math.sin(TAU * 3100 * x) * Math.exp(-x * 220), { gain: g * 0.5, pan: 0.25 });
}

function renderMusic() {
  const air = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    const opening = bar < 2;
    addTone(music, t0, BAR * 2.0, pad(chord[0] / 2, 2.0, BAR * 2.0, 200), { gain: opening ? 0.12 : 0.16 });
    chord.forEach((f, i) => {
      addTone(music, t0 + i * 0.08, BAR * 2.2, pad(f, 2.6, BAR * 2.2, 620 + i * 90), {
        gain: 0.042 - i * 0.005,
        pan: (i - 1.5) * 0.32,
      });
    });
    // the mechanism: eighth-note plucks walking the chord, from bar 1
    if (bar >= 1) {
      const order = [0, 2, 1, 3, 2, 1, 3, 2];
      order.forEach((k, j) => {
        const f = chord[k] * 2;
        addTone(music, t0 + j * BEAT * 0.5, 0.9, pluck(f, 6.5), {
          gain: (j % 2 ? 0.016 : 0.022) * (bar < 3 ? 0.7 : 1),
          pan: j % 2 ? 0.35 : -0.35,
        });
      });
    }
    // a sub on the downbeat
    addTone(music, t0, 0.9, (x) => Math.sin(TAU * chord[0] * 0.5 * x) * Math.exp(-x * 3.2) * (1 - Math.exp(-x * 200)), { gain: 0.07 });
    const n = noiseGen();
    const fl = lp(2000);
    addTone(air, t0, BAR * 1.02, (t) => fl(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.012, pan: bar % 2 === 0 ? -0.45 : 0.45,
    });
  }
  for (let t = BEAT; t < tl.total; t += BEAT) watchTick(t, 0.012);
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

  // s1 — NYASAR: the nav ping, Einstein switched off, the fix drifts, the app
  // recalculates, the map pulls out, ten km a day; then signal ok, time not
  SFX.air(0.0, 0.04, 1.0, 1600);
  SFX.ping(0.12, 0.018, 1318, 0.2);
  SFX.clack(W(0, 0, 2) - 0.05, 0.07, -0.35);
  SFX.down(W(0, 0, 2) + 0.02, 0.026, 0.7);
  SFX.boom(W(0, 0, 2) - 0.03, 0.05, 48);
  SFX.rise(W(0, 0, 3) + 0.3, 0.035, W(0, 0, 11) - W(0, 0, 3), 160, 520);
  SFX.alert(W(0, 0, 7) - 0.12, 0.03);
  SFX.air(W(0, 0, 7) + 0.1, 0.04, 1.1, 2600, 0.1);
  SFX.pop(W(0, 0, 8) - 0.1, 0.03, 620, 0);
  SFX.boom(W(0, 0, 9) - 0.05, 0.05, 50);
  SFX.ding(W(0, 0, 11) + 0.1, 0.022, 587, 2.0);
  SFX.air(cap(0, 1) - 0.4, 0.04, 0.8, 2200, -0.1);
  for (let i = 0; i < 4; i++) SFX.tick(W(0, 1, 2) - 0.12 + i * 0.07, 0.016, 1300 + i * 200, -0.3);
  SFX.ding(W(0, 1, 2) + 0.12, 0.018, 1175, 1.2, -0.3);
  SFX.boom(W(0, 1, 4) - 0.06, 0.06, 46);
  SFX.shimmer(W(0, 1, 4) - 0.2, 1.0, 0.026, 1568);
  tickRun(W(0, 1, 4) + 0.1, W(0, 1, 4) + 1.3, 10, 0.012, 1500, 1500);

  // s2 — JAM ATOM: the clock locks, its time pulses out; the planet, four
  // signals racing down, the trip times, the rings closing on the phone
  SFX.lock(W(1, 0, 3) - 0.1, 0.02);
  SFX.ding(W(1, 0, 3) + 0.25, 0.02, 1760, 1.2, 0.3);
  for (let k = 0; k < 4; k++) SFX.ping(W(1, 0, 7) - 0.25 + k * 0.37, 0.016, 1568, (k % 2 ? -0.3 : 0.3));
  SFX.air(cap(1, 1) - 0.5, 0.05, 0.9, 2400, 0.2);
  SFX.boom(cap(1, 1) - 0.1, 0.03, 60);
  for (let i = 0; i < 4; i++) SFX.zap(W(1, 1, 1) - 0.2 + i * 0.22, 0.012, 0.4, 2400, 700);
  for (let i = 0; i < 4; i++) SFX.tick(W(1, 1, 2) - 0.1 + i * 0.12, 0.016, 1100 + i * 90, (i - 1.5) * 0.3);
  for (let i = 0; i < 4; i++) SFX.pop(W(1, 1, 4) - 0.1 + i * 0.16, 0.02, 900 + i * 120, (i - 1.5) * 0.3);
  SFX.ding(W(1, 1, 6) + 0.22, 0.026, 880, 2.0);
  SFX.boom(W(1, 1, 6) + 0.2, 0.035, 56);

  // s3 — 300 METER: light laps the planet and the counter flies up; the ruler
  // zooms a million times, light crosses the pitches, the fix slides away
  SFX.shimmer(S(2) + 0.85, W(2, 0, 4) + 0.55 - (S(2) + 0.85), 0.024, 1760);
  tickRun(S(2) + 0.85, W(2, 0, 4) + 0.55, 22, 0.008, 1200, 2200);
  SFX.boom(W(2, 0, 4) - 0.04, 0.05, 50);
  SFX.ding(W(2, 0, 4) + 0.5, 0.022, 659, 2.0);
  SFX.rise(W(2, 1, 1) - 0.1, 0.03, W(2, 1, 3) + 0.4 - W(2, 1, 1), 200, 900);
  tickRun(W(2, 1, 1), W(2, 1, 3) + 0.35, 16, 0.01, 900, 2000);
  SFX.zap(W(2, 1, 3) - 0.05, 0.03, 0.9, 500, 3600);
  SFX.slide(W(2, 1, 6) - 0.1, 0.026, 0.55);
  SFX.pop(W(2, 1, 7) - 0.05, 0.03, 560, 0);
  SFX.boom(W(2, 1, 7) - 0.03, 0.055, 48);
  SFX.ding(W(2, 1, 9) + 0.05, 0.024, 523.25, 2.0);

  // s4 — KECEPATAN: the jet wash, the gauge sweeping, the ring; then the two
  // clocks racing through a day and the cold chime for minus seven
  SFX.air(W(3, 0, 1) - 0.2, 0.06, 1.0, 3600, -0.4);
  SFX.boom(W(3, 0, 1) - 0.08, 0.045, 52);
  SFX.wash(W(3, 0, 1) - 0.15, cap(3, 1) - W(3, 0, 1) - 0.2, 0.026);
  SFX.rise(W(3, 0, 3) - 0.35, 0.03, W(3, 0, 6) - W(3, 0, 3) + 0.6, 180, 760);
  tickRun(W(3, 0, 3) - 0.35, W(3, 0, 6) + 0.25, 14, 0.01, 1000, 1700);
  SFX.boom(W(3, 0, 5) - 0.03, 0.04, 56);
  SFX.pop(W(3, 0, 6) + 0.15, 0.028, 640, 0);
  SFX.ding(W(3, 0, 6) + 0.2, 0.022, 784, 1.8);
  SFX.air(cap(3, 1) - 0.45, 0.04, 0.8, 2000, 0.2);
  SFX.tick(W(3, 1, 1) - 0.25, 0.02, 1200, -0.4);
  SFX.tick(W(3, 1, 1) - 0.13, 0.02, 1250, 0.4);
  tickRun(W(3, 1, 3) - 0.1, W(3, 1, 6) + 0.25, 28, 0.009, 1400, 1400);
  SFX.ice(W(3, 1, 5) - 0.04, 0.03);
  SFX.boom(W(3, 1, 5) - 0.04, 0.045, 50);

  // s5 — GRAVITASI: the orbit traced, the gap measured, the pull arrows, the
  // six percent; then the satellite clock racing ahead, warm, plus forty-five
  SFX.shimmer(S(4) + 0.05, 0.9, 0.018, 1175);
  SFX.tick(W(4, 0, 3) - 0.25, 0.02, 1300, 0.2);
  SFX.slide(W(4, 0, 3) - 0.2, 0.014, 0.7, 440, 880);
  SFX.ding(W(4, 0, 6) - 0.03, 0.02, 988, 1.4, 0.2);
  addTone(sfx, W(4, 0, 7) - 0.15, 1.6, (x) => Math.sin(TAU * (70 - 30 * clamp(x / 1.6)) * x) * Math.exp(-x * 1.8) * Math.min(1, x * 20), { gain: 0.07 });
  for (let k = 0; k < 4; k++) SFX.pop(W(4, 0, 7) - 0.05 + k * 0.15, 0.016, 500 + k * 160, (k - 1.5) * 0.3);
  SFX.pop(W(4, 0, 9) - 0.1, 0.028, 600, 0);
  SFX.ding(W(4, 0, 9) + 0.05, 0.02, 698, 1.8);
  SFX.air(cap(4, 1) - 0.45, 0.045, 0.8, 2200, -0.2);
  SFX.tick(W(4, 1, 1) - 0.25, 0.02, 1200, -0.4);
  SFX.tick(W(4, 1, 1) - 0.1, 0.02, 1250, 0.4);
  tickRun(W(4, 1, 3) - 0.1, W(4, 1, 13) + 0.3, 34, 0.009, 1400, 1400);
  SFX.warm(W(4, 1, 9) - 0.08, 0.022);
  SFX.boom(W(4, 1, 10) - 0.05, 0.05, 50);
  SFX.ding(W(4, 1, 10) + 0.02, 0.024, 880, 2.0);

  // s6 — 38 MIKRODETIK: minus seven drops in, the total climbs and lands; the
  // equation types, the map pulls back, the error ring opens
  SFX.drop(W(5, 0, 0) - 0.05, 0.03, 1400, 0.2);
  SFX.rise(W(5, 0, 3) - 0.1, 0.03, W(5, 0, 7) - W(5, 0, 3) + 0.1, 200, 700);
  tickRun(W(5, 0, 3) - 0.1, W(5, 0, 7), 18, 0.01, 1100, 1800);
  SFX.boom(W(5, 0, 4) - 0.04, 0.045, 52);
  SFX.chord(W(5, 0, 7) - 0.05, 0.024, 587.33);
  SFX.boom(W(5, 0, 7) - 0.05, 0.04, 48);
  SFX.air(cap(5, 1) - 0.45, 0.045, 0.8, 2400, 0.1);
  [W(5, 1, 0) - 0.15, W(5, 1, 0) + 0.15, W(5, 1, 1) - 0.1, W(5, 1, 3) - 0.1].forEach((at, i) => { SFX.pop(at, 0.022, 700 + i * 120, (i - 1.5) * 0.3); typeRun(at, 0.25, 4, 0.008); });
  SFX.air(W(5, 1, 3) - 0.3, 0.04, 1.6, 1800, -0.2);
  tickRun(W(5, 1, 3) - 0.1, W(5, 1, 7) + 0.3, 16, 0.009, 1000, 1600);
  SFX.alert(W(5, 1, 6) - 0.2, 0.026);
  SFX.stamp(W(5, 1, 7) + 0.02, 0.07);
  SFX.boom(W(5, 1, 7), 0.04, 50);

  // s7 — UJI 1977: the desk, the file typing, the year in four thuds, the
  // photo, the stamp; the logbook, the pen tracing, the switch going on
  SFX.air(S(6) + 0.0, 0.04, 0.7, 1800, -0.2);
  typeRun(S(6) + 0.15, 0.5, 9);
  [1, 2, 4, 6].forEach((k, i) => SFX.stamp(W(6, 0, k) - 0.06, 0.035 + i * 0.006));
  SFX.air(S(6) + 0.35, 0.03, 0.6, 2600, 0.4);
  typeRun(W(6, 0, 2), 0.7, 12);
  typeRun(W(6, 0, 4), 0.7, 12);
  typeRun(W(6, 0, 6), 0.6, 10);
  typeRun(W(6, 0, 7) - 0.1, 0.45, 6);
  typeRun(W(6, 0, 7) + 0.4, 0.7, 12);
  SFX.stamp(W(6, 0, 10) + 0.1, 0.09);
  SFX.boom(W(6, 0, 10) + 0.1, 0.03, 58);
  SFX.air(cap(6, 1) - 0.5, 0.05, 0.8, 2200, 0.2);
  for (let k = 0; k < 8; k++) SFX.tick(W(6, 1, 2) - 0.2 + k * 0.12, 0.007, 900, 0.2);
  SFX.scratch(W(6, 1, 3) - 0.1, W(6, 1, 5) + 0.4 - W(6, 1, 3), 0.022);
  SFX.clack(W(6, 1, 4) - 0.05, 0.02, 0.3);
  SFX.pop(W(6, 1, 5) - 0.15, 0.024, 700, 0);
  SFX.chord(W(6, 1, 6) - 0.1, 0.026, 523.25);
  SFX.clack(W(6, 1, 8) - 0.05, 0.07, -0.3);
  SFX.shimmer(W(6, 1, 8) - 0.05, 1.0, 0.024, 1568);

  // s8 — DISETEL: the counter blips and rolls down, the satellite loads, the
  // rocket goes, the orbit reads true; the phone, typing, send
  for (let k = 0; k < 3; k++) SFX.tick(S(7) + 0.05 + k * 0.07, 0.016, 1600 + k * 200, 0.3);
  tickRun(W(7, 0, 4) - 0.1, W(7, 0, 6) + 0.35, 20, 0.011, 2000, 900);
  SFX.boom(W(7, 0, 6) - 0.05, 0.035, 54);
  SFX.air(W(7, 0, 7) - 0.95, 0.04, 0.7, 3000, -0.4);
  SFX.rumble(W(7, 0, 7) - 0.32, 2.2, 0.09);
  SFX.boom(W(7, 0, 7) - 0.3, 0.05, 44);
  SFX.ding(W(7, 0, 8) - 0.1, 0.024, 1318, 1.8, 0.2);
  SFX.ping(W(7, 0, 8) + 0.2, 0.016, 1760, 0.2);
  SFX.air(cap(7, 1) - 0.35, 0.04, 0.8, 2200, 0);
  for (let k = 0; k < 3; k++) SFX.ping(cap(7, 1) + 0.3 + k * 0.48, 0.008, 1568, (k - 1) * 0.4);
  SFX.pop(W(7, 1, 3) - 0.3, 0.035, 520, 0.3);
  typeRun(W(7, 1, 4), 1.4, 24, 0.012);
  SFX.pop(W(7, 1, 6) + 0.9, 0.035, 760, 0.2);
  SFX.ding(W(7, 1, 6) + 0.92, 0.026, 1046, 1.6, 0.2);
  SFX.chord(W(7, 1, 6) + 1.25, 0.022, 587.33);
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
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep26.flac');
  const inter = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    inter[i * 2] = out[0][i];
    inter[i * 2 + 1] = out[1][i];
  }
  writeFlac(inter, N, file);
  console.log(`mix-ep26.flac  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}  pre ${pre.toFixed(3)}`);
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
