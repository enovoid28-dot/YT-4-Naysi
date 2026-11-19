/**
 * Episode 30 soundtrack — "Jejak bom nuklir di dalam gigimu."
 *
 * A forensic-lab bed in D minor at 72 BPM: cold sustained pads, a Geiger
 * counter ticking under the science, a sparse music-box figure and a slow
 * two-beat pulse. The sound design follows the dossiers: each sheet lands on
 * the cutting mat with a paper thump, the Geiger chatter swells over the bomb
 * tests, a deep blast under the 1963 peak, stamp thumps on every vermillion
 * verdict, a lock click on the enamel, sonar pings and a water swell for the
 * tsunami, and the dial winding down as the Suess effect switches the clock
 * off.
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

// D minor: i - VI - III - VII, cold and clinical
const CHORDS = [
  [73.42, 110.0, 146.83, 174.61], // Dm
  [58.27, 110.0, 146.83, 174.61], // Bb
  [65.41, 98.0, 130.81, 164.81],  // C
  [55.0, 110.0, 138.59, 164.81],  // A
];

const pad = (f, att, rel, cut = 420) => {
  const flt = lp(cut);
  return (t) => {
    const a = clamp(t / att);
    const r = clamp((rel - t) / (rel * 0.45));
    const drift = 1 + Math.sin(TAU * 0.045 * t) * 0.0018;
    const v = Math.sin(TAU * f * drift * t) * 0.5
      + Math.sin(TAU * f * 1.005 * t) * 0.26
      + Math.sin(TAU * f * 0.5 * t) * 0.2
      + Math.sin(TAU * f * 2 * t) * 0.035;
    return flt(v) * a * r;
  };
};

/** a cold music-box tine, a little darker than episode 29's */
const tine = (f, decay = 4.2) => {
  const flt = lp(5200);
  return (t) => {
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 800));
    const v = Math.sin(TAU * f * t) * 0.6
      + Math.sin(TAU * f * 3.01 * t) * 0.1 * Math.exp(-t * 8)
      + Math.sin(TAU * f * 5.87 * t) * 0.04 * Math.exp(-t * 24);
    return flt(v) * env;
  };
};

/** geiger click: a tiny sharp impulse, randomised spacing */
const geiger = (t, g = 0.012, pan = 0) => {
  const n = noiseGen();
  const h = hp(3000);
  addTone(sfx, t, 0.03, (x) => h(n()) * Math.exp(-x * 260), { gain: g, pan });
};

function renderMusic() {
  const air = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    addTone(music, t0, BAR * 2.0, pad(chord[0], 1.8, BAR * 2.0, 220), { gain: bar < 1 ? 0.1 : 0.13 });
    chord.slice(1).forEach((f, i) => {
      addTone(music, t0 + i * 0.1, BAR * 2.2, pad(f, 2.4, BAR * 2.2, 420 + i * 110), {
        gain: 0.036 - i * 0.006,
        pan: (i - 1) * 0.42,
      });
    });
    // the figure: four cold notes, answered every other bar
    const fig = bar % 2 === 0 ? [[0, 3], [3, 2], [6, 1], [9, 2]] : [[0, 2], [4, 1], [8, 3], [12, 2], [14, 1]];
    fig.forEach(([six, k], j) => {
      addTone(music, t0 + six * BEAT * 0.25, 1.5, tine(chord[k] * 4, 3.6), {
        gain: (j % 2 ? 0.01 : 0.014) * (bar < 2 ? 0.7 : 1),
        pan: j % 2 ? 0.42 : -0.42,
      });
    });
    // slow pulse: heartbeat of the lab
    for (const [dt, g] of [[0, 0.065], [BEAT * 2, 0.04]]) {
      addTone(music, t0 + dt, 0.9, (x) => Math.sin(TAU * chord[0] * 0.5 * x * (1 + 0.1 * Math.exp(-x * 30))) * Math.exp(-x * 4.2) * (1 - Math.exp(-x * 160)), { gain: g });
    }
    const n = noiseGen();
    const fl = lp(1100);
    addTone(air, t0, BAR * 1.02, (t) => fl(n()) * 0.5 * (0.4 + 0.6 * Math.sin(Math.PI * clamp(t / BAR))), {
      gain: 0.009, pan: bar % 2 === 0 ? -0.4 : 0.4,
    });
  }
  // geiger chatter: sparse at rest, denser over the bomb-test scenes
  const busy = [];
  tl.scenes.forEach((sc, i) => { if (i >= 3 && i <= 5) busy.push([sc.start, sc.start + sc.dur]); });
  for (let t = 0.6; t < tl.total - 2; t += 0.11 + rand() * 0.5) {
    const inBusy = busy.some(([a, b]) => t > a && t < b);
    if (inBusy || rand() > 0.72) geiger(t + rand() * 0.08, inBusy ? 0.011 : 0.006, (rand() - 0.5) * 0.7);
  }
  const hf = lp(4600);
  for (let i = 0; i < N; i++) {
    const v = hf(rand() * 2 - 1) * 0.0032;
    air[0][i] += v;
    air[1][i] += v;
  }
  for (let ch = 0; ch < 2; ch++) for (let i = 0; i < N; i++) music[ch][i] += air[ch][i];
  const fin = 0.3 * SR;
  const fout = 3.2 * SR;
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
  /** a dossier sheet landing on the cutting mat */
  sheet(t, g = 0.075) {
    const n = noiseGen();
    const f = lp(900);
    addTone(sfx, t, 0.34, (x) => f(n()) * Math.exp(-x * 16) * (1 - Math.exp(-x * 300)), { gain: g });
    addTone(sfx, t + 0.02, 0.5, (x) => Math.sin(TAU * 68 * x) * Math.exp(-x * 9), { gain: g * 0.5 });
  },
  boom(t, g = 0.11, f = 46) {
    addTone(sfx, t, 1.4, (x) => Math.sin(TAU * f * x * (1 + 0.1 * Math.exp(-x * 8))) * Math.exp(-x * 3.4), { gain: g });
    const n = noiseGen();
    const fl = lp(280);
    addTone(sfx, t, 0.6, (x) => fl(n()) * Math.exp(-x * 12) * 0.8, { gain: g * 0.5 });
  },
  ding(t, g = 0.032, f = 880, dur = 1.8, pan = 0.2) {
    addTone(sfx, t, dur, (x) => (Math.sin(TAU * f * x) * 0.55 + Math.sin(TAU * f * 2.01 * x) * 0.1) * Math.exp(-x * 2.2), { gain: g, pan });
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
  /** the enamel locking: two clicks and a latch */
  lock(t, g = 0.05) {
    SFX.tick(t, g, 1500, 0.1);
    SFX.tick(t + 0.09, g * 0.9, 1900, 0.1);
    addTone(sfx, t + 0.18, 0.3, (x) => Math.sin(TAU * 220 * x) * Math.exp(-x * 18), { gain: g * 0.5 });
  },
  /** sonar ping for the birth-year read */
  ping(t, g = 0.035, f = 1320) {
    addTone(sfx, t, 1.1, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 3.4) * (1 - Math.exp(-x * 400)), { gain: g, pan: 0.18 });
    addTone(sfx, t + 0.22, 0.9, (x) => Math.sin(TAU * f * 0.75 * x) * Math.exp(-x * 3.8), { gain: g * 0.5, pan: -0.2 });
  },
  /** a water swell */
  swell(t, g = 0.05, dur = 2.6) {
    const n = noiseGen();
    const f = lp(600);
    addTone(sfx, t, dur, (x) => f(n()) * Math.pow(Math.sin(Math.PI * clamp(x / dur)), 1.5) * (0.7 + 0.3 * Math.sin(TAU * 0.8 * x)), { gain: g });
  },
  /** redaction: a dry brush slash */
  slash(t, g = 0.05, pan = 0) {
    const n = noiseGen();
    const h = hp(1600);
    addTone(sfx, t, 0.3, (x) => h(n()) * Math.sin(Math.PI * clamp(x / 0.3)) * (0.6 + 0.4 * Math.sin(TAU * 9 * x)), { gain: g, pan });
  },
  /** the dial winding down: a falling glissando */
  windDown(t, g = 0.045, dur = 2.4) {
    addTone(sfx, t, dur, (x) => {
      const f = 620 * Math.exp(-x * 0.75) + 70;
      return Math.sin(TAU * f * x) * Math.exp(-x * 1.1) * 0.8;
    }, { gain: g });
  },
  /** pen scratch on paper */
  pen(t, g = 0.028, dur = 0.5) {
    const n = noiseGen();
    const b = hp(2400);
    addTone(sfx, t, dur, (x) => b(n()) * (0.4 + 0.6 * Math.abs(Math.sin(TAU * 7 * x))) * Math.sin(Math.PI * clamp(x / dur)), { gain: g, pan: -0.2 });
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
  // every sheet lands on the mat at its cut
  tl.scenes.forEach((sc, i) => { if (i > 0) SFX.sheet(S_(i) + 0.3, 0.07); });
  // s1: the hook — geiger burst and the first stamp
  for (let k = 0; k < 9; k++) geiger(cw(0, 'nuklir') + k * 0.07, 0.012 - k * 0.0008, (rand() - 0.5) * 0.6);
  SFX.stampThump(cw(0, 'miliaran') + 0.32, 0.085);
  // s2: cosmic shimmer
  SFX.air(cw(1, 'kosmik'), 0.05, 1.6, 5200, -0.3);
  SFX.ding(cw(1, 'karbon'), 0.03, 987.77, 1.6, 0.2);
  // s3: half-life ticks, blind modern
  [0, 1, 2].forEach((k) => SFX.tick(cw(2, 'paruh') + k * 0.5, 0.026, 900 + k * 180));
  SFX.slash(cw(2, 'buta') + 0.05, 0.05);
  // s4: the tests — four distant blasts under the tick reveal
  [0.2, 1.4, 2.7, 4.0].forEach((dt, k) => SFX.boom(cw(3, 'selama') + dt, 0.085 - k * 0.012, 42 + k * 4));
  for (let k = 0; k < 16; k++) geiger(cw(3, 'selama') + 0.3 + k * 0.26, 0.01, (rand() - 0.5) * 0.8);
  // s5: riser into the peak, fall after the treaty
  addTone(sfx, cw(4, 'puncaknya') - 0.6, 2.2, (x) => {
    const v = Math.sin(TAU * (180 + 240 * clamp(x / 2.2)) * x);
    return v * clamp(x / 1.6) * 0.5;
  }, { gain: 0.02 });
  SFX.boom(cw(4, 'enam'), 0.1, 40);
  SFX.ding(cw(4, 'enam') + 0.12, 0.035, 1318.5, 2.0, 0.15);
  SFX.windDown(cw(4, 'turun'), 0.03, 1.8);
  // s6: the forgery — slide, redaction, stamp
  SFX.air(cw(5, 'kanvas') - 0.2, 0.04, 0.8, 1500, 0.25);
  SFX.slash(cw(5, 'kanvasnya'), 0.055, 0.1);
  SFX.stampThump(cw(5, 'kanvasnya') + 0.36, 0.09);
  SFX.pen(cw(5, 'kapasnya') + 0.2, 0.026, 0.7);
  // s7: ivory — the marker slides past the ban
  SFX.tick(cw(6, 'mati') + 0.2, 0.03, 1100);
  SFX.tick(cw(6, 'mati') + 0.8, 0.03, 1500);
  SFX.stampThump(cw(6, 'ilegal'), 0.09);
  // s8: the lock
  SFX.lock(cw(7, 'terkunci'), 0.055);
  // s9: birth year and the tsunami
  SFX.ping(cw(8, 'lahirmu'), 0.034);
  SFX.ping(cw(8, 'lima') + 0.1, 0.03, 1560);
  SFX.swell(cw(8, 'tsunami') - 0.3, 0.055, 3.0);
  SFX.pen(cw(8, 'nama') + 0.3, 0.026, 0.6);
  // s10: three cell ages
  SFX.ding(cw(9, 'usus'), 0.03, 784, 1.4, -0.2);
  SFX.ding(cw(9, 'lemak'), 0.03, 880, 1.4, 0);
  SFX.ding(cw(9, 'jantung'), 0.032, 587.33, 2.2, 0.2);
  // s11: the clock switching off
  SFX.air(cw(10, 'batu'), 0.045, 2.2, 700, -0.2);
  SFX.windDown(cw(10, 'mengencerkan') + 0.4, 0.05, 3.0);
  // s12: synthesis — page flutter and the last stamp
  SFX.air(cw(11, 'kalender'), 0.04, 0.6, 3200, 0.2);
  SFX.air(cw(11, 'kalender') + 0.18, 0.035, 0.5, 2600, -0.2);
  SFX.stampThump(cw(11, 'aman') + 0.22, 0.09);
  // s13: outro — pen and a warm resolve
  SFX.pen(cw(12, 'tulis'), 0.03, 0.8);
  SFX.ding(cw(12, 'naysi'), 0.03, 587.33, 2.6, -0.15);
  SFX.ding(cw(12, 'naysi') + 0.06, 0.026, 880, 2.6, 0.15);
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
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep30.flac');
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
  console.log(`mix-ep30.flac  ${(N / SR).toFixed(2)}s  ${got.toFixed(2)} LUFS  peak ${(20 * Math.log10(pk)).toFixed(2)} dBFS  limiter ${lim.toFixed(1)} dB  de-ess ${ess.toFixed(1)} dB  voice/bed ${vbr.toFixed(1)} dB  gain ${(20 * Math.log10(gain)).toFixed(1)} dB`);
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
