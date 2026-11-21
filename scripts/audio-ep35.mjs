/**
 * Episode 33 soundtrack — "Indonesia lebih lebar dari Amerika Serikat."
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

// Episode 33: a tomb-warm bed in D minor at 60 BPM — low drifting pads like
// air inside a sealed room, a frame-drum heartbeat, sparse santur tines and
// a dust-soft shaker; the SFX layer is the honey world: shaft shimmer, stone
// grind, jar thuds, seal pop, osmosis hiss, bee buzz, bubbles, crystals.
const BPM = 60;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const totalBars = Math.ceil(tl.total / BAR) + 1;

const CHORDS = [
  [73.42, 110.0, 146.83, 174.61], // Dm
  [58.27, 87.31, 174.61, 233.08], // Bb
  [65.41, 98.0, 130.81, 196.0],   // C
  [55.0, 110.0, 164.81, 220.0],   // Am
];

const pad = (f, att, rel, cut = 380) => {
  const flt = lp(cut);
  return (t) => {
    const a = clamp(t / att);
    const r = clamp((rel - t) / (rel * 0.45));
    const drift = 1 + Math.sin(TAU * 0.04 * t) * 0.002;
    const v = Math.sin(TAU * f * drift * t) * 0.5
      + Math.sin(TAU * f * 1.006 * t) * 0.24
      + Math.sin(TAU * f * 0.5 * t) * 0.22
      + Math.sin(TAU * f * 1.5 * t) * 0.05
      + Math.sin(TAU * f * 2 * t) * 0.03;
    return flt(v) * a * r;
  };
};

const tine = (f, decay = 3.6) => {
  const flt = lp(5600);
  return (t) => {
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 900));
    const v = Math.sin(TAU * f * t) * 0.6
      + Math.sin(TAU * f * 3.01 * t) * 0.12 * Math.exp(-t * 9)
      + Math.sin(TAU * f * 5.87 * t) * 0.05 * Math.exp(-t * 26);
    return flt(v) * env;
  };
};

const drum = (f = 62, g = 1) => (t) =>
  (Math.sin(TAU * f * t) * Math.exp(-t * 7.5) + Math.sin(TAU * f * 2.02 * t) * 0.18 * Math.exp(-t * 22))
  * (1 - Math.exp(-t * 260)) * g;

const shaker = () => {
  const n = noiseGen();
  const h = hp(5200);
  return (t) => h(n()) * Math.exp(-t * 34) * 0.5;
};

const MEL = [293.66, 349.23, 440.0, 523.25, 587.33, 440.0, 349.23];

function renderMusic() {
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    addTone(music, t0, BAR * 2.0, pad(chord[0], 2.2, BAR * 2.0, 260), { gain: 0.125 });
    addTone(music, t0, BAR * 2.0, pad(chord[2], 2.6, BAR * 2.0, 460), { gain: 0.05, pan: 0.32 });
    addTone(music, t0, BAR * 2.0, pad(chord[3], 2.8, BAR * 2.0, 640), { gain: 0.036, pan: -0.32 });
    // frame-drum heartbeat
    addTone(music, t0, 0.9, drum(62), { gain: 0.085 });
    addTone(music, t0 + BEAT * 2, 0.8, drum(58, 0.6), { gain: 0.055 });
    if (bar % 2 === 1) {
      for (let e = 0; e < 8; e++) {
        addTone(music, t0 + (e * BEAT) / 2, 0.14, shaker(), { gain: e % 2 ? 0.008 : 0.013, pan: (e % 4 - 1.5) * 0.2 });
      }
    }
    // santur figure every two bars
    if (bar % 2 === 0) {
      const f = MEL[(bar / 2) % MEL.length];
      addTone(music, t0 + BEAT * 3, 3.0, tine(f), { gain: 0.03, pan: (bar % 4 === 0 ? 0.35 : -0.35) });
      if (bar % 8 === 4) addTone(music, t0 + BEAT * 3.5, 2.6, tine(f * 1.5), { gain: 0.018, pan: -0.2 });
    }
    // tomb drone under the defense acts (s4..s9)
    const sc = tl.scenes.find((s) => t0 >= s.start && t0 < s.start + s.dur);
    if (sc && sc.index >= '04' && sc.index <= '09') {
      addTone(music, t0, BAR, pad(chord[0] * 0.5, 1.4, BAR, 170), { gain: 0.07 });
    }
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
  const h1k = (n) => { const q = Math.sin(n * 127.1) * 43758.5453; return q - Math.floor(q); };
  const buzz = (t, dur, g = 0.05, pan = 0) => {
    const fl = lp(1400);
    addTone(sfx, t, dur, (x) => {
      const f = 168 + Math.sin(TAU * 2.7 * x) * 14;
      const saw = 2 * ((x * f) % 1) - 1;
      return fl(saw * 0.5 * (0.55 + 0.45 * Math.sin(TAU * 5.5 * x))) * Math.sin(Math.PI * clamp(x / dur));
    }, { gain: g, pan });
  };
  const pop = (t, g = 0.06) => {
    addTone(sfx, t, 0.22, (x) => Math.sin(TAU * (300 - 160 * x) * x) * Math.exp(-x * 24), { gain: g });
    SFX.tick(t + 0.01, g * 0.5, 1500);
  };
  const bubbles = (t, n = 5, g = 0.02) => {
    for (let k = 0; k < n; k++) SFX.blip(t + k * (0.22 + (k % 3) * 0.09), g * (1 - k * 0.1), 760 + k * 130, (k % 2) * 0.4 - 0.2);
  };

  // s1 — vacuum whoosh, sub boom, three telemetry pings on the hook
  SFX.whoosh(0.25, 3.4, 0.06, 260, -0.15);
  SFX.boom(0.7, 0.08, 36);
  SFX.ding(C(0, 'cahaya', 0, 0.0), 0.034, 1245, 3.0, 0);
  SFX.ding(C(0, 'voyager', 0, 0.0), 0.03, 1568, 2.6, 0.15);
  SFX.ding(C(0, 'bumi', 0, 0.02), 0.028, 2093, 2.4, -0.15);

  // s2 — the distance stack: ruler blips, deep thunk, signal ping
  for (let k = 0; k < 3; k++) SFX.blip(0.8 + k * 0.45, 0.02, 1180 + k * 150, (k % 2) * 0.4 - 0.2);
  SFX.boom(C(1, 'miliar', 0, -0.05), 0.06, 50);
  SFX.ding(C(1, 'sinyal', 0, 0.0), 0.03, 1318, 2.8, 0);
  SFX.tick(C(1, 'tiba', 0, 0.0), 0.02, 980);

  // s3 — year rail: ticks then two planet chimes
  for (let k = 0; k < 10; k++) SFX.tick(0.9 + k * 0.42, 0.014, 880 + k * 46, (k % 2) * 0.4 - 0.2);
  SFX.chord(C(2, 'jupiter', 0, -0.1), 0.03, 349.23);
  SFX.chord(C(2, 'saturnus', 0, -0.1), 0.03, 293.66);

  // s4 — launch: roar whoosh, clamp booms, ascent shimmer
  SFX.whoosh(C(3, 'roket', 0, -0.3), 3.4, 0.075, 180, 0);
  for (let k = 0; k < 3; k++) SFX.boom(C(3, 'roket', 0, -0.1) + k * 0.5, 0.07, 44 + k * 6);
  SFX.ding(C(3, 'titan', 0, 0.0), 0.03, 1568, 2.6, 0.1);
  SFX.whoosh(C(3, 'perpisahan', 0, -0.2), 2.6, 0.045, 900, 0.2);

  // s5 — pale blue dot: camera whir, shutter tick, lonely high ding
  SFX.whoosh(C(4, 'memotret', 0, -0.25), 1.6, 0.04, 1400, -0.1);
  SFX.tick(C(4, 'memotret', 0, 0.0), 0.022, 2100);
  SFX.ding(C(4, 'biru', 0, 0.0), 0.032, 1760, 3.0, 0);
  SFX.ding(C(4, 'piksel', 0, 0.02), 0.026, 2350, 2.4, -0.2);

  // s6 — heliopause: long plasma tear, boundary boom, interstellar hiss
  SFX.tear(C(5, 'heliopause', 0, -0.4), 3.2, 0.055);
  SFX.boom(C(5, 'heliopause', 0, 0.0), 0.08, 40);
  SFX.whoosh(C(5, 'antarbintang', 0, -0.2), 3.0, 0.05, 2400, 0.15);
  SFX.ding(C(5, 'astronomi', 0, 0.0), 0.028, 1318, 2.4, -0.1);

  // s7 — speed: doppler-ish whoosh, odometer blips, daily tick
  SFX.whoosh(0.7, 2.8, 0.06, 620, -0.25);
  for (let k = 0; k < 4; k++) SFX.blip(C(6, 'detik', 0, 0.1) + k * 0.36, 0.018, 900 + k * 210, (k % 2) * 0.5 - 0.25);
  SFX.ding(C(6, 'jam', 0, 0.0), 0.03, 1568, 2.6, 0.1);
  SFX.tick(C(6, 'hari', 0, 0.0), 0.02, 1200);

  // s8 — power decay: gauge servo, falling triad, slow creak
  SFX.tick(C(7, 'plutonium', 0, -0.1), 0.02, 700);
  for (let k = 0; k < 3; k++) SFX.ding(C(7, 'watt', 0, 0.0) + k * 0.5, 0.03, 1046 - k * 150, 2.2, (k - 1) * 0.2);
  SFX.tear(C(7, 'menyusut', 0, -0.2), 2.4, 0.04);

  // s9 — instrument rack: eleven ticks down to two, plasma hiss ring
  for (let k = 0; k < 9; k++) SFX.tick(0.8 + k * 0.34, 0.016, 1500 - k * 110, (k % 2) * 0.4 - 0.2);
  SFX.ding(C(8, 'mendengar', 0, 0.0), 0.03, 1568, 2.8, 0);
  SFX.whoosh(C(8, 'plasma', 0, -0.2), 2.6, 0.045, 2600, 0.15);

  // s10 — power swap: binary blips, three relay clacks, relief chord
  for (let k = 0; k < 6; k++) SFX.blip(0.7 + k * 0.3, 0.016, 980 + (k % 3) * 240, (k % 2) * 0.4 - 0.2);
  for (let k = 0; k < 3; k++) SFX.tick(C(9, 'daya', 0, 0.0) + k * 0.7, 0.024, 620 + k * 90, (k % 2) * 0.5 - 0.25);
  SFX.chord(C(9, 'instrumen', 0, -0.1), 0.028, 392.0);

  // s11 — the silence: carrier drop, rose static, then the answer ping
  SFX.tear(C(10, 'hilang', 0, -0.3), 2.8, 0.05);
  SFX.whoosh(C(10, 'hilang', 0, 0.0), 2.2, 0.04, 3000, 0);
  SFX.ding(C(10, 'napas', 0, 0.0), 0.024, 880, 2.0, -0.15);
  SFX.ding(C(10, 'menjawab', 0, 0.02), 0.034, 1760, 3.0, 0.15);

  // s12 — the record: needle drop, groove crackle, spin-up whir
  SFX.tick(C(11, 'piringan', 0, -0.1), 0.026, 1500);
  for (let k = 0; k < 8; k++) SFX.tick(C(11, 'emas', 0, 0.0) + k * 0.28, 0.012, 2400 + h1k(k) * 600, (k % 2) * 0.3 - 0.15);
  SFX.whoosh(C(11, 'menit', 0, -0.3), 2.4, 0.04, 800, 0.2);
  SFX.ding(C(11, 'emas', 0, 0.0), 0.03, 1318, 2.6, 0);

  // s13 — greetings: five soft voice-like dings, whale glide, music chord
  for (let k = 0; k < 5; k++) SFX.ding(C(12, 'bahasa', 0, 0.0) + k * 0.42, 0.024, 1174 + k * 130, 2.2, (k - 2) * 0.18);
  SFX.tear(C(12, 'paus', 0, -0.2), 2.2, 0.045);
  SFX.chord(C(12, 'musik', 0, -0.1), 0.032, 440.0);

  // s14 — scale: metre ticks, vast whoosh, star ping far away
  for (let k = 0; k < 6; k++) SFX.tick(0.8 + k * 0.4, 0.016, 800 + k * 60, (k % 2) * 0.4 - 0.2);
  SFX.whoosh(C(13, 'meter', 0, -0.2), 3.0, 0.05, 200, -0.1);
  SFX.ding(C(13, 'bintang', 0, 0.0), 0.03, 2093, 3.2, 0.15);
  SFX.boom(C(13, 'tahun', 0, -0.05), 0.06, 52);

  // s15 — close: warm chord, transmitter fade, comment dings
  SFX.chord(0.4, 0.034, 220.0);
  SFX.whoosh(C(14, 'padam', 0, -0.2), 2.6, 0.05, 500, -0.1);
  SFX.ding(C(14, 'selamanya', 0, 0.0), 0.032, 1568, 3.0, 0);
  SFX.ding(C(14, 'komentar', 0, 0.02), 0.035, 2093, 2.6, -0.15);
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
      out[ch][i] = vo[ch][i] * 1.0 + (m - 0.55 * d * mid) * 1.0 * duckM + sfx[ch][i] * 0.55 * duckS;
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
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep35.flac');
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
  console.log(`mix-ep35.flac  ${(N / SR).toFixed(2)}s  ${got.toFixed(2)} LUFS  peak ${(20 * Math.log10(pk)).toFixed(2)} dBFS  limiter ${lim.toFixed(1)} dB  de-ess ${ess.toFixed(1)} dB  voice/bed ${vbr.toFixed(1)} dB  gain ${(20 * Math.log10(gain)).toFixed(1)} dB`);
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
