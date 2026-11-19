/**
 * Episode 31 soundtrack — "Peta lidah yang kamu hafal di sekolah itu salah."
 *
 * A classroom bed in A minor at 84 BPM that keeps leaning towards C: warm
 * sustained pads, a plucked nylon figure, a walking bass and pencil ticks as
 * percussion. The sound design follows the textbook: a school bell rings the
 * myth in, chalk strikes mark the three tastes and every year, a red pen
 * squeaks and a dry buzz answers each correction, pages land on the desk at
 * every cut, four books are copied in sequence, eight test loci tick through
 * the 1974 re-test, a stamp thump closes the case, a cat meows and a fat drop
 * plinks for oleogustus, and a small string section swells under the
 * "orchestra" line before the bell rings the outro out.
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

let seed = 20261119;
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

// A minor that keeps turning towards C: curious, a little wry, never cold
const CHORDS = [
  [55.0, 110.0, 130.81, 164.81],  // Am
  [43.65, 87.31, 110.0, 130.81],  // F
  [65.41, 98.0, 130.81, 164.81],  // C
  [49.0, 98.0, 123.47, 146.83],   // G
];

const pad = (f, att, rel, cut = 620) => {
  const flt = lp(cut);
  return (t) => {
    const a = clamp(t / att);
    const r = clamp((rel - t) / (rel * 0.45));
    const drift = 1 + Math.sin(TAU * 0.05 * t) * 0.0016;
    const v = Math.sin(TAU * f * drift * t) * 0.5
      + Math.sin(TAU * f * 1.004 * t) * 0.28
      + Math.sin(TAU * f * 0.5 * t) * 0.22
      + Math.sin(TAU * f * 1.5 * t) * 0.05;
    return flt(v) * a * r;
  };
};

/** a plucked nylon string: warm, short, the classroom's guitar */
const pluck = (f, decay = 3.0) => {
  const flt = lp(2600);
  return (t) => {
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 900));
    const v = Math.sin(TAU * f * t) * 0.52
      + Math.sin(TAU * f * 2 * t) * 0.2 * Math.exp(-t * 5)
      + Math.sin(TAU * f * 3.01 * t) * 0.1 * Math.exp(-t * 9)
      + Math.sin(TAU * f * 4.98 * t) * 0.04 * Math.exp(-t * 18);
    return flt(v) * env;
  };
};

/** a struck music-box tine for the little answering figure */
const tine = (f, decay = 4.0) => {
  const flt = lp(5400);
  return (t) => {
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 800));
    const v = Math.sin(TAU * f * t) * 0.6
      + Math.sin(TAU * f * 3.01 * t) * 0.1 * Math.exp(-t * 8)
      + Math.sin(TAU * f * 5.87 * t) * 0.04 * Math.exp(-t * 24);
    return flt(v) * env;
  };
};

/** pencil ticking on the desk: the bed's percussion */
const pencil = (t, g = 0.011, pan = 0) => {
  const n = noiseGen();
  const h = hp(2600);
  addTone(sfx, t, 0.035, (x) => h(n()) * Math.exp(-x * 200), { gain: g, pan });
};

function renderMusic() {
  const air = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    const last = bar === totalBars - 1;
    addTone(music, t0, BAR * 2.0, pad(chord[0], 1.6, BAR * 2.0, 300), { gain: bar < 1 ? 0.1 : 0.125 });
    chord.slice(1).forEach((f, i) => {
      addTone(music, t0 + i * 0.09, BAR * 2.2, pad(f, 2.2, BAR * 2.2, 620 + i * 130), {
        gain: 0.04 - i * 0.007,
        pan: (i - 1) * 0.4,
      });
    });
    // the walking bass: root, fifth, root, third — a slow, unhurried pulse
    [[0, 0], [BEAT * 2, 1], [BEAT * 3, 0]].forEach(([dt, k], j) => {
      const f = chord[k] * (k === 1 ? 1.5 : 1);
      addTone(music, t0 + dt, 1.1, (x) => Math.sin(TAU * f * x) * 0.7 * Math.exp(-x * 3.1) * (1 - Math.exp(-x * 140))
        + Math.sin(TAU * f * 2 * x) * 0.1 * Math.exp(-x * 8), { gain: 0.06 - j * 0.012 });
    });
    // plucked figure: three notes, answered by a tine every other bar
    const fig = bar % 2 === 0 ? [[0, 3], [2, 2], [5, 1]] : [[1, 2], [4, 3], [6, 1], [10, 2]];
    fig.forEach(([six, k], j) => {
      addTone(music, t0 + six * BEAT * 0.5, 1.6, pluck(chord[k] * 2, 3.2), {
        gain: (j % 2 ? 0.016 : 0.022) * (bar < 2 ? 0.7 : 1),
        pan: j % 2 ? 0.4 : -0.4,
      });
    });
    if (bar % 4 === 3) {
      addTone(music, t0 + BEAT * 3.5, 2.0, tine(chord[2] * 4, 3.4), { gain: 0.014, pan: 0.3 });
    }
    // pencil ticks: a light 8th-note grid, thinner on the outro bars
    for (let b8 = 0; b8 < 8; b8++) {
      if (last && b8 > 3) break;
      if (b8 % 2 === 1 && rand() > 0.45) continue;
      pencil(t0 + b8 * BEAT * 0.5, b8 % 4 === 0 ? 0.012 : 0.007, (rand() - 0.5) * 0.5);
    }
    const n = noiseGen();
    const fl = lp(1400);
    addTone(air, t0, BAR * 1.02, (t) => fl(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.01, pan: bar % 2 === 0 ? -0.4 : 0.4,
    });
  }
  // the room tone of a library: a fine hiss, no geiger, no alarm
  const hf = lp(4200);
  for (let i = 0; i < N; i++) {
    const v = hf(rand() * 2 - 1) * 0.0034;
    air[0][i] += v;
    air[1][i] += v;
  }
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) music[ch][i] += air[ch][i];
  const fin = 0.25 * SR;
  const fout = 3.0 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fin), clamp((N - i) / fout));
    music[0][i] *= g;
    music[1][i] *= g;
  }
}

/* ---------------------------------- sfx ---------------------------------- */

const SFX = {
  air(t, g = 0.04, dur = 0.7, cut = 2200, pan = 0.14) {
    const n = noiseGen();
    const f = lp(cut);
    addTone(sfx, t, dur, (x) => f(n()) * Math.sin(Math.PI * clamp(x / dur)) * 0.9, { gain: g, pan });
  },
  /** a textbook page landing flat on the desk */
  page(t, g = 0.07) {
    const n = noiseGen();
    const f = lp(1200);
    addTone(sfx, t, 0.3, (x) => f(n()) * Math.exp(-x * 18) * (1 - Math.exp(-x * 260)), { gain: g });
    addTone(sfx, t + 0.02, 0.42, (x) => Math.sin(TAU * 74 * x) * Math.exp(-x * 10), { gain: g * 0.46 });
  },
  /** turning a page: paper sweeping past */
  turn(t, g = 0.05, dur = 0.5) {
    const n = noiseGen();
    const f = lp(2600);
    addTone(sfx, t, dur, (x) => f(n()) * Math.sin(Math.PI * clamp(x / dur)) * (0.6 + 0.4 * Math.sin(TAU * 5 * x)), { gain: g, pan: -0.15 });
  },
  /** a red pen squeaking across the page */
  pen(t, g = 0.03, dur = 0.55) {
    const n = noiseGen();
    const b = hp(2200);
    addTone(sfx, t, dur, (x) => b(n()) * (0.4 + 0.6 * Math.abs(Math.sin(TAU * 8 * x))) * Math.sin(Math.PI * clamp(x / dur)), { gain: g, pan: -0.2 });
  },
  /** pencil shading, drier and lower than the pen */
  pencilShade(t, g = 0.026, dur = 0.8) {
    const n = noiseGen();
    const b = hp(1100);
    addTone(sfx, t, dur, (x) => b(n()) * (0.3 + 0.7 * Math.abs(Math.sin(TAU * 4.5 * x))) * Math.sin(Math.PI * clamp(x / dur)) * 0.7, { gain: g, pan: 0.2 });
  },
  /** chalk on a blackboard: one bright, short strike */
  chalk(t, g = 0.03, f = 1180, pan = 0.1) {
    const n = noiseGen();
    const h = hp(3000);
    addTone(sfx, t, 0.14, (x) => h(n()) * Math.exp(-x * 40), { gain: g * 0.7, pan });
    addTone(sfx, t, 0.2, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 22), { gain: g * 0.5, pan });
  },
  /** a school bell: two struck partials with a long ring */
  bell(t, g = 0.06, f = 659.25) {
    addTone(sfx, t, 2.6, (x) => (Math.sin(TAU * f * x) * 0.5 + Math.sin(TAU * f * 2.76 * x) * 0.16
      + Math.sin(TAU * f * 5.4 * x) * 0.05) * Math.exp(-x * 1.5) * (1 - Math.exp(-x * 500)), { gain: g, pan: 0.1 });
    addTone(sfx, t + 0.004, 2.2, (x) => Math.sin(TAU * f * 1.005 * x) * 0.3 * Math.exp(-x * 1.8), { gain: g * 0.7, pan: -0.14 });
  },
  /** a rubber stamp: felt thump plus a desk knock */
  stampThump(t, g = 0.09) {
    const n = noiseGen();
    const f = lp(500);
    addTone(sfx, t, 0.16, (x) => f(n()) * Math.exp(-x * 34), { gain: g });
    addTone(sfx, t + 0.01, 0.4, (x) => Math.sin(TAU * 92 * x) * Math.exp(-x * 12), { gain: g * 0.62 });
    addTone(sfx, t + 0.05, 0.1, (x) => Math.sin(TAU * 132 * x) * Math.exp(-x * 40), { gain: g * 0.3 });
  },
  tick(t, g = 0.028, f = 1200, pan = -0.12) {
    addTone(sfx, t, 0.06, (x) => (Math.sin(TAU * f * x) * 0.6 + Math.sin(TAU * f * 2.4 * x) * 0.2) * Math.exp(-x * 90), { gain: g, pan });
  },
  ding(t, g = 0.032, f = 880, dur = 1.8, pan = 0.2) {
    addTone(sfx, t, dur, (x) => (Math.sin(TAU * f * x) * 0.55 + Math.sin(TAU * f * 2.01 * x) * 0.1) * Math.exp(-x * 2.2), { gain: g, pan });
  },
  /** a single drop: fat, then the plink of it landing */
  drop(t, g = 0.04, f = 420) {
    addTone(sfx, t, 0.34, (x) => Math.sin(TAU * (f + 900 * Math.exp(-x * 26)) * x) * Math.exp(-x * 9) * (1 - Math.exp(-x * 700)), { gain: g, pan: 0.1 });
    const n = noiseGen();
    const h = hp(2400);
    addTone(sfx, t, 0.06, (x) => h(n()) * Math.exp(-x * 120), { gain: g * 0.4 });
  },
  /** a cat's short, flat meow: two formants gliding down */
  meow(t, g = 0.035, dur = 0.5) {
    addTone(sfx, t, dur, (x) => {
      const u = x / dur;
      const f0 = 620 - 200 * u;
      const a = Math.sin(Math.PI * clamp(u)) * (1 - Math.exp(-x * 60));
      const v = Math.sin(TAU * f0 * x) * 0.6
        + Math.sin(TAU * f0 * 2.4 * x) * 0.22 * Math.exp(-x * 3)
        + Math.sin(TAU * f0 * 3.6 * x) * 0.1 * Math.exp(-x * 5);
      return v * a;
    }, { gain: g, pan: -0.18 });
    const n = noiseGen();
    const b = hp(3000);
    addTone(sfx, t, dur * 0.7, (x) => b(n()) * Math.sin(Math.PI * clamp(x / dur)) * 0.05, { gain: g, pan: -0.18 });
  },
  /** a small string section swelling under the "orchestra" line */
  strings(t, g = 0.05, dur = 3.2, fs = [220, 261.63, 329.63, 392]) {
    fs.forEach((f, i) => {
      const flt = lp(1800);
      addTone(sfx, t + i * 0.05, dur, (x) => {
        const a = Math.sin(Math.PI * clamp(x / dur)) ** 0.7;
        const vib = 1 + Math.sin(TAU * 5.2 * x + i) * 0.004;
        return flt(Math.sin(TAU * f * vib * x) * 0.5 + Math.sin(TAU * f * 2 * x) * 0.16) * a;
      }, { gain: g * (1 - i * 0.13), pan: (i - 1.5) * 0.3 });
    });
  },
  /** a wrong-answer buzz, dry and short */
  buzz(t, g = 0.04, dur = 0.4) {
    addTone(sfx, t, dur, (x) => {
      const f = 148;
      return (Math.sin(TAU * f * x) * 0.5 + Math.sin(TAU * f * 1.5 * x) * 0.2 + Math.sin(TAU * f * 2.02 * x) * 0.14)
        * Math.sin(Math.PI * clamp(x / dur)) * (0.7 + 0.3 * Math.sin(TAU * 22 * x));
    }, { gain: g, pan: 0 });
  },
};

/* -------------------------------- cues ----------------------------------- */

const S_ = (i) => tl.scenes[i].start;

const cw = (i, word, nth = 0, off = 0) => {
  const want = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
  let k = 0;
  for (const c of tl.scenes[i].captions || []) {
    for (const w of c.words) {
      if (w.text.toLowerCase().replace(/[^a-z0-9-]/g, '') === want) {
        if (k === nth) return tl.scenes[i].start + w.start + off;
        k++;
      }
    }
  }
  return tl.scenes[i].start + off;
};

function renderSFX() {
  // every page lands on the desk at its cut
  tl.scenes.forEach((sc, i) => { if (i > 0) SFX.page(S_(i) + 0.3, 0.065); });
  // s1: the school bell rings the myth in, the pen crosses it out
  SFX.bell(0.12, 0.055);
  SFX.chalk(cw(0, 'manis'), 0.026, 1046.5, 0.2);
  SFX.chalk(cw(0, 'asin'), 0.026, 784, -0.2);
  SFX.chalk(cw(0, 'pahit'), 0.026, 587.33, 0.1);
  SFX.pen(cw(0, 'salah') - 0.1, 0.036, 0.7);
  SFX.buzz(cw(0, 'salah') + 0.1, 0.05);
  SFX.stampThump(cw(0, 'total') + 0.1, 0.09);
  SFX.turn(cw(0, 'seabad'), 0.04, 0.7);
  // s2: 1901 — pencil shading the measured points, a chalk year
  SFX.chalk(cw(1, 'seribu'), 0.03, 880);
  SFX.pencilShade(cw(1, 'mengukur'), 0.024, 1.4);
  SFX.tick(cw(1, 'titik-titik'), 0.024, 1100);
  SFX.tick(cw(1, 'titik-titik') + 0.22, 0.022, 1320);
  SFX.air(cw(1, 'tipis'), 0.03, 0.9, 1800, -0.25);
  // s3: 1942 — the redraw, then the copying chain of books
  SFX.chalk(cw(2, 'empat'), 0.03, 987.77);
  SFX.pen(cw(2, 'digambar'), 0.03, 0.8);
  SFX.buzz(cw(2, 'zona-zona') + 0.1, 0.036, 0.5);
  [0, 1, 2, 3].forEach((k) => SFX.page(cw(2, 'menyalinnya') + 0.15 + k * 0.2, 0.035 - k * 0.005));
  SFX.turn(cw(2, 'mitosnya'), 0.04, 0.6);
  // s4: 1974 — the case closes: eight test loci, then the stamp
  SFX.chalk(cw(3, 'tujuh'), 0.03, 1174.66);
  [0, 1, 2, 3, 4, 5, 6, 7].forEach((k) => SFX.tick(cw(3, 'regio') + 0.1 + k * 0.19, 0.022, 900 + k * 90, (k % 2 ? 0.2 : -0.2)));
  SFX.pen(cw(3, 'mendeteksi') + 0.1, 0.026, 0.9);
  SFX.stampThump(cw(3, 'nyata') + 0.12, 0.095);
  // s5: the real anatomy — counted up, cells renewed
  SFX.ding(cw(4, 'sepuluh'), 0.03, 659.25, 1.6, -0.2);
  SFX.ding(cw(4, 'lima'), 0.028, 784, 1.4, 0.2);
  SFX.tick(cw(4, 'dua'), 0.024, 1400);
  SFX.air(cw(4, 'diganti'), 0.03, 1.0, 2400, 0.2);
  SFX.ding(cw(4, 'membaca'), 0.03, 880, 2.0, 0);
  // s6: umami — broth shimmer and two era chimes
  SFX.air(cw(5, 'kaldu') - 0.2, 0.04, 1.6, 900, -0.2);
  SFX.chalk(cw(5, 'delapan'), 0.028, 1046.5);
  SFX.ding(cw(5, 'dikonfirmasi'), 0.03, 1318.5, 2.0, 0.15);
  SFX.stampThump(cw(5, 'umami') + 0.15, 0.05);
  // s7: the cat and the sixth taste
  SFX.meow(cw(6, 'kucing') + 0.05, 0.034, 0.5);
  SFX.buzz(cw(6, 'manis') + 0.05, 0.04, 0.45);
  SFX.drop(cw(6, 'lemak'), 0.042, 380);
  SFX.drop(cw(6, 'lemak') + 0.4, 0.03, 300);
  SFX.chalk(cw(6, 'lima'), 0.026, 1567.98);
  SFX.air(cw(6, 'keenam') - 0.1, 0.032, 1.2, 3000, 0.25);
  // s8: the orchestra — a real swell under the line
  SFX.strings(cw(7, 'orkestra') - 0.35, 0.045, 3.4);
  [0, 1, 2].forEach((k) => SFX.ding(cw(7, 'titik') + k * 0.7, 0.026, 587.33 * (k + 1) / 1, 1.6, k % 2 ? 0.2 : -0.2));
  // s9: outro — the pencil stops, a warm resolve
  SFX.pencilShade(cw(8, 'tulis'), 0.024, 0.7);
  SFX.turn(cw(8, 'komentar') + 0.1, 0.036, 0.6);
  SFX.ding(cw(8, 'naysi'), 0.03, 523.25, 2.8, -0.15);
  SFX.ding(cw(8, 'naysi') + 0.06, 0.026, 784, 2.8, 0.15);
  SFX.bell(cw(8, 'fakta'), 0.03, 523.25);
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
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep31.flac');
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
  console.log(`mix-ep31.flac  ${(N / SR).toFixed(2)}s  ${got.toFixed(2)} LUFS  peak ${(20 * Math.log10(pk)).toFixed(2)} dBFS  limiter ${lim.toFixed(1)} dB  de-ess ${ess.toFixed(1)} dB  voice/bed ${vbr.toFixed(1)} dB  gain ${(20 * Math.log10(gain)).toFixed(1)} dB`);
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
