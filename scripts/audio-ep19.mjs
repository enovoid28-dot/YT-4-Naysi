/**
 * Episode 19 soundtrack — "Lagu itu nyangkut di kepalamu."
 *
 * Episode 18 was a room at night. This one is a loop: 84 BPM, the same four
 * notes walked over and over on a bright mallet, a sub under it, and vinyl
 * crackle that never quite resolves. The sound design is the earworm itself —
 * clicks, ticks, a record dropping, a phrase cut in half, gum.
 *
 * VO sits on top; the score ducks under every sentence.
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildTimeline } from '../src/timeline.mjs';
import { decodeVo, writeFlac } from '../src/audio.mjs';

const SR = 48000;
const tl = buildTimeline();
const N = Math.ceil((tl.total + 0.4) * SR);

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
  const { gain = 1, pan = 0, bufIdx = 0 } = o;
  const start = Math.floor(t0 * SR);
  const len = Math.floor(dur * SR);
  const gl = Math.cos((clamp(pan, -1, 1) + 1) * Math.PI * 0.25) * gain;
  const gr = Math.sin((clamp(pan, -1, 1) + 1) * Math.PI * 0.25) * gain;
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx < 0 || idx >= N) continue;
    const v = make(i / SR, i);
    buf[bufIdx][idx] += v * gl;
    buf[1 - bufIdx][idx] += v * gr;
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

const noiseGen = () => {
  let last = 0;
  return () => {
    const w = rand() * 2 - 1;
    const hp = w - last * 0.9;
    last = w;
    return hp;
  };
};

/* --------------------------------- score --------------------------------- */

const BPM = 84;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

// D minor, wide and unhurried: the room the memories were supposed to live in
const CHORDS = [
  [110.0, 130.81, 164.81, 196.0], // Am7
  [87.31, 130.81, 174.61, 220.0], // Fmaj7
  [130.81, 164.81, 196.0, 261.63], // Cmaj
  [98.0, 123.47, 146.83, 196.0], // G6
];

const totalBars = Math.ceil(tl.total / BAR);

/** felt electric piano: fundamental plus a soft tine, tremolo, long tail */
const rhodes = (f, trem = 0.10) => (t) => {
  const env = Math.exp(-t * 2.3) * (1 - Math.exp(-t * 220));
  const tine = Math.exp(-t * 9) * 0.22;
  const v = Math.sin(TAU * f * t) * 0.72
    + Math.sin(TAU * f * 2.01 * t) * 0.10 * (1 + tine * 3)
    + Math.sin(TAU * f * 3.02 * t) * 0.05 * (1 + tine * 2);
  return v * env * (1 + Math.sin(TAU * 4.6 * t) * trem);
};

function renderMusic() {
  const brush = [new Float32Array(N), new Float32Array(N)];
  const hiss = [new Float32Array(N), new Float32Array(N)];

  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];

    // bass on 1, held like a finger on a string
    addTone(music, t0, BEAT * 2.4, (t) => {
      const f = chord[0] / 2;
      const env = Math.exp(-t * 1.6) * (1 - Math.exp(-t * 120));
      return (Math.sin(TAU * f * t) * 0.85 + Math.sin(TAU * f * 2 * t) * 0.10) * env;
    }, { gain: 0.20 });

    // the chord, once, on beat 1 — and a shadow of it an octave up on beat 3
    chord.forEach((f, i) => {
      addTone(music, t0 + i * 0.015, BEAT * 3.2, rhodes(f), {
        gain: 0.075 - i * 0.006, pan: (i - 1.5) * 0.22,
      });
    });
    chord.forEach((f, i) => {
      if (bar % 4 === 3) return;
      addTone(music, t0 + BEAT * 2, BEAT * 1.8, rhodes(f * 2, 0.16), {
        gain: 0.020, pan: -(i - 1.5) * 0.3,
      });
    });

    // brushed snare on 2 and 4
    [1, 3].forEach((b) => {
      let n = noiseGen();
      const f = lp(2400);
      addTone(brush, t0 + b * BEAT, 0.22, (t) => f(n()) * Math.exp(-t * 16) * 0.9, {
        gain: 0.020, pan: 0.12,
      });
    });
  }

  // the loop itself: one bar of four notes, walked again and again on a bright
  // mallet. It is the motif of the episode, so it never develops — it repeats.
  const mallet = (f) => (t) => {
    const env = Math.exp(-t * 5.5) * (1 - Math.exp(-t * 300));
    return (Math.sin(TAU * f * t) * 0.8 + Math.sin(TAU * f * 2.004 * t) * 0.22
      + Math.sin(TAU * f * 3.01 * t) * 0.08) * env;
  };
  const PATTERN = [0, 2, 1, 3, 2, 1, 3, 2];
  for (let step = 0; step * (BEAT / 2) < tl.total; step++) {
    const t0 = step * (BEAT / 2);
    const chord = CHORDS[Math.floor(t0 / BAR) % CHORDS.length];
    const f = chord[PATTERN[step % PATTERN.length]] * 2;
    addTone(music, t0, 0.5, mallet(f), {
      gain: 0.019,
      pan: ((step % 4) - 1.5) * 0.16,
    });
  }

  // vinyl: sparse crackle and a floor of hiss
  for (let i = 0; i < N; i += 1) {
    if (rand() < 0.00035) {
      const idx = i;
      const amp = 0.02 + rand() * 0.05;
      for (let k = 0; k < 90 && idx + k < N; k++) {
        const v = (rand() * 2 - 1) * amp * Math.exp(-k * 0.12);
        hiss[0][idx + k] += v;
        hiss[1][idx + k] += v * 0.9;
      }
    }
  }
  const hf = lp(7200);
  for (let i = 0; i < N; i++) {
    const v = hf((rand() * 2 - 1)) * 0.006;
    hiss[0][i] += v;
    hiss[1][i] += v;
  }

  // room pad: two octaves down, barely audible, keeps the desk from sounding empty
  for (let bar = 0; bar < totalBars; bar += 2) {
    const chord = CHORDS[bar % CHORDS.length];
    addTone(music, bar * BAR, BAR * 2.04, (t) => {
      const att = clamp(t / 2.0);
      const rel = clamp((BAR * 2.04 - t) / 2.4);
      let v = 0;
      chord.forEach((f) => {
        v += Math.sin(TAU * (f / 2) * t) * 0.08;
      });
      return v * att * rel;
    }, { gain: 0.10 });
  }

  const f = lp(3000);
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < N; i++) music[ch][i] = f(music[ch][i]) + brush[ch][i] + hiss[ch][i];
  }

  const fin = 1.6 * SR;
  const fout = 2.6 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fin), clamp((N - i) / fout));
    music[0][i] *= g;
    music[1][i] *= g;
  }
}

/* ---------------------------------- sfx ---------------------------------- */

const SFX = {
  /** paper dragged across a table */
  paper(t, g = 0.09, dur = 0.8) {
    let n = noiseGen();
    const f = lp(2600);
    addTone(sfx, t, dur, (x) => f(n()) * Math.sin(Math.PI * clamp(x / dur)) * 1.3, { gain: g, pan: -0.2 });
  },
  /** a dry click: pin, stamp corner, counter */
  click(t, g = 0.05, f = 1500) {
    addTone(sfx, t, 0.04, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 130), { gain: g, pan: -0.12 });
    let n = noiseGen();
    addTone(sfx, t, 0.025, (x) => n() * Math.exp(-x * 220), { gain: g * 0.5, pan: 0.14 });
  },
  /** brass pin pushed into board */
  pin(t, g = 0.11) {
    let n = noiseGen();
    addTone(sfx, t, 0.05, (x) => n() * Math.exp(-x * 90), { gain: g * 0.55, pan: 0.2 });
    addTone(sfx, t, 0.24, (x) => Math.sin(TAU * (1800 * Math.exp(-x * 8) + 900) * x) * Math.exp(-x * 26), { gain: g * 0.4 });
  },
  /** rubber stamp */
  stamp(t, g = 0.2) {
    let n = noiseGen();
    addTone(sfx, t, 0.16, (x) => n() * Math.exp(-x * 40), { gain: g * 0.5, pan: 0.15 });
    addTone(sfx, t, 0.55, (x) => {
      const f = 140 * Math.exp(-x * 5) + 58;
      return Math.sin(TAU * f * x) * Math.exp(-x * 9);
    }, { gain: g });
  },
  /** a card landing on the desk */
  card(t, g = 0.1, f = 380) {
    let n = noiseGen();
    addTone(sfx, t, 0.07, (x) => n() * Math.exp(-x * 60), { gain: g * 0.6, pan: 0.1 });
    addTone(sfx, t, 0.16, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 26), { gain: g });
  },
  /** a low thump under a cut */
  thump(t, g = 0.13, f = 68) {
    addTone(sfx, t, 0.8, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 6.2), { gain: g });
  },
  /** air past the frame */
  whoosh(t, g = 0.07, dur = 0.75, cut = 2400) {
    let n = noiseGen();
    const f = lp(cut);
    addTone(sfx, t, dur, (x) => f(n()) * Math.sin(Math.PI * clamp(x / dur)) * 0.85, { gain: g, pan: 0.2 });
  },
  /** a number landing */
  ding(t, g = 0.045, f = 1046) {
    addTone(sfx, t, 1.2, (x) => (Math.sin(TAU * f * x) * 0.6 + Math.sin(TAU * f * 2.76 * x) * 0.2) * Math.exp(-x * 3.2), {
      gain: g, pan: 0.24,
    });
  },
  /** glass: a tube filling */
  pour(t, g = 0.07, dur = 1.1, f0 = 420, f1 = 900) {
    let n = noiseGen();
    const f = lp(2200);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const ring = Math.sin(TAU * (f0 + (f1 - f0) * p) * x) * 0.18;
      return (f(n()) * 0.9 + ring) * Math.sin(Math.PI * p);
    }, { gain: g, pan: -0.15 });
  },
  /** thread pulled taut: a short plucked string */
  pluck(t, g = 0.06, f = 320) {
    addTone(sfx, t, 0.5, (x) => {
      const env = Math.exp(-x * 9) * (1 - Math.exp(-x * 400));
      return (Math.sin(TAU * f * x) * 0.8 + Math.sin(TAU * f * 2 * x) * 0.2) * env;
    }, { gain: g, pan: 0.15 });
  },
  /** cassette mechanics: a clunk and a short whirr */
  cassette(t, g = 0.1, dur = 1.4) {
    addTone(sfx, t, 0.18, (x) => Math.sin(TAU * 90 * x) * Math.exp(-x * 20), { gain: g * 0.9 });
    let n = noiseGen();
    const f = lp(1400);
    addTone(sfx, t + 0.05, dur, (x) => {
      const p = clamp(x / dur);
      return f(n()) * 0.5 * Math.sin(Math.PI * p) * (1 + Math.sin(TAU * 7 * x) * 0.3);
    }, { gain: g * 0.5, pan: 0.18 });
  },
  /** magnetic tape being spliced: a sticky rip */
  splice(t, g = 0.09) {
    let n = noiseGen();
    const f = lp(5200);
    addTone(sfx, t, 0.35, (x) => f(n()) * Math.exp(-x * 11) * 1.2, { gain: g, pan: -0.2 });
  },
};

/* -------------------------------- cues ----------------------------------- */

const scanStart = (i) => tl.scenes[i].start;

function renderSFX() {
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.whoosh(sc.start - 0.32, 0.05, 0.7, 2200);
    SFX.paper(sc.start - 0.08, 0.05, 0.45);
  });

  const cap = (i, j) => tl.scenes[i].start + (tl.scenes[i].captions[j] ? tl.scenes[i].captions[j].from : 0);
  const s1 = scanStart(0);
  SFX.cassette(s1 + 0.20, 0.10, 1.2); // the disc lands and starts
  SFX.click(s1 + 0.55, 0.05, 820);
  SFX.ding(s1 + 2.9, 0.035, 1174);
  [0, 1, 2, 3].forEach((i) => SFX.card(s1 + cap(0, 2) + 0.15 + i * 0.16, 0.055, 520 - i * 30));
  SFX.click(s1 + cap(0, 4) + 0.30, 0.055, 620); // STOP, pressed, nothing happens
  SFX.thump(s1 + cap(0, 4) + 0.42, 0.075, 62);

  const s2 = scanStart(1);
  SFX.ding(s2 + cap(1, 0) + 0.10, 0.045, 1046);
  for (let i = 0; i < 9; i++) SFX.ding(s2 + cap(1, 1) + 0.18 + i * 0.085, 0.020, 1568 + i * 90);
  SFX.ding(s2 + cap(1, 2) + 0.20, 0.040, 1318);
  SFX.ding(s2 + cap(1, 3) + 0.20, 0.035, 880);
  SFX.whoosh(s2 + cap(1, 4) + 0.10, 0.045, 0.7, 2100);

  const s3 = scanStart(2);
  SFX.whoosh(s3 + cap(2, 0) + 0.05, 0.040, 1.1, 900);
  SFX.ding(s3 + cap(2, 1) + 0.30, 0.032, 1760); // the cortex lights
  SFX.pluck(s3 + cap(2, 2) + 0.25, 0.045, 220);
  SFX.pluck(s3 + cap(2, 2) + 0.85, 0.038, 260);
  SFX.ding(s3 + cap(2, 3) + 0.10, 0.030, 988);

  const s4 = scanStart(3);
  SFX.card(s4 + cap(3, 1) + 0.05, 0.075, 300);
  [0, 1, 2, 3].forEach((i) => SFX.pluck(s4 + cap(3, 1) + 0.5 + i * 0.24, 0.035, 300 + i * 60));
  SFX.ding(s4 + cap(3, 2) + 0.15, 0.038, 1318);
  SFX.ding(s4 + cap(3, 2) + 0.55, 0.032, 1568);
  SFX.whoosh(s4 + cap(3, 4) + 0.05, 0.045, 0.6, 1500);

  const s5 = scanStart(4);
  SFX.splice(s5 + cap(4, 1) + 0.55, 0.10); // the cut
  SFX.thump(s5 + cap(4, 1) + 0.62, 0.070, 58);
  SFX.click(s5 + cap(4, 2) + 0.25, 0.035, 1400);
  SFX.ding(s5 + cap(4, 3) + 0.20, 0.040, 784);

  const s6 = scanStart(5);
  for (let i = 0; i < 6; i++) SFX.click(s6 + cap(5, 1) + 0.15 + i * 0.30, 0.022, 1200);
  SFX.ding(s6 + cap(5, 1) + 2.2, 0.030, 1046);
  SFX.pluck(s6 + cap(5, 2) + 0.40, 0.035, 340);
  SFX.whoosh(s6 + cap(5, 3) + 0.10, 0.035, 0.5, 1200);

  const s7 = scanStart(6);
  SFX.card(s7 + cap(6, 1) + 0.10, 0.075, 320);
  for (let i = 0; i < 9; i++) SFX.click(s7 + cap(6, 1) + 0.35 + i * 0.85, 0.035, 1500); // intrusions
  SFX.ding(s7 + cap(6, 2) + 0.10, 0.045, 660);
  SFX.thump(s7 + cap(6, 3) + 0.05, 0.085, 74); // the gum
  SFX.click(s7 + cap(6, 3) + 0.30, 0.05, 900);
  SFX.whoosh(s7 + cap(6, 4) + 0.15, 0.040, 0.6, 1000);

  const s8 = scanStart(7);
  SFX.whoosh(s8 + cap(7, 1) + 0.10, 0.045, 0.7, 1600);
  SFX.click(s8 + cap(7, 1) + 0.55, 0.04, 1100);
  SFX.stamp(s8 + cap(7, 2) + 0.15, 0.10);
  SFX.ding(s8 + cap(7, 2) + 0.45, 0.040, 1174);
  SFX.card(s8 + cap(7, 3) + 0.10, 0.075, 300);

  const s9 = scanStart(8);
  SFX.ding(s9 + cap(8, 1) + 0.60, 0.045, 880);
  SFX.whoosh(s9 + cap(8, 2) + 0.10, 0.035, 0.8, 1400);
  SFX.ding(s9 + cap(8, 3) + 0.15, 0.050, 1046);
  SFX.ding(s9 + cap(8, 3) + 0.75, 0.038, 1318);
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

function write(buf, file) {
  const b = Buffer.alloc(44 + N * 4);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + N * 4, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 4, 28);
  b.writeUInt16LE(4, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    b.writeInt16LE(Math.round(clamp(buf[0][i], -1, 1) * 32767), 44 + i * 4);
    b.writeInt16LE(Math.round(clamp(buf[1][i], -1, 1) * 32767), 46 + i * 4);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, b);
}

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
    v += (target - v) * (target > v ? 0.35 : 0.04);
    smooth[b] = v;
  }

  const out = [new Float32Array(N), new Float32Array(N)];
  for (let i = 0; i < N; i++) {
    const duck = 1 - 0.60 * smooth[Math.floor(i / block)];
    for (let ch = 0; ch < 2; ch++) {
      out[ch][i] = vo[ch][i] * 1.0 + music[ch][i] * 1.25 * duck + sfx[ch][i] * 0.95;
    }
  }

  const hp = (cut) => {
    const rc = 1 / (TAU * cut);
    const dt = 1 / SR;
    const a = rc / (rc + dt);
    let px = 0;
    let py = 0;
    return (x) => {
      const y = a * (py + x - px);
      px = x;
      py = y;
      return y;
    };
  };
  for (let ch = 0; ch < 2; ch++) {
    const f = hp(26);
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

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep19.flac');
  const inter = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    inter[i * 2] = out[0][i];
    inter[i * 2 + 1] = out[1][i];
  }
  writeFlac(inter, N, file);
  console.log(`mix-ep19.flac  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
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
