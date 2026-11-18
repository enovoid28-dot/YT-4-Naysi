/**
 * Episode 18 soundtrack — "Kamu pernah jadi bayi. Kamu tidak ingat satu hari pun."
 *
 * Episode 17 was a workshop radio; this one is a room at night. 78 BPM, a felt
 * electric piano playing one chord per bar, an upright bass with the fingers on
 * the string, brushed texture, and vinyl hiss underneath. The sound design is
 * the archive itself: pages turned, pins pushed in, thread pulled taut, liquid
 * poured into glass, a cassette clicking into place.
 *
 * VO sits on top; the score ducks under every sentence.
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildTimeline, readWav } from '../src/timeline.mjs';

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

const BPM = 78;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

// D minor, wide and unhurried: the room the memories were supposed to live in
const CHORDS = [
  [146.83, 174.61, 220.0, 261.63], // Dm9  (D3 F3 A3 C4)
  [116.54, 146.83, 174.61, 220.0], // Bbmaj7
  [98.0, 146.83, 174.61, 233.08], // Gm7
  [110.0, 164.81, 220.0, 246.94], // A7sus
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

  // 01 — the empty album
  const s1 = scanStart(0);
  SFX.paper(s1 + 0.10, 0.09, 1.0);
  SFX.card(s1 + 0.42, 0.09, 260);
  SFX.stamp(s1 + 3.10, 0.17); // KOSONG
  [0.2, 0.44, 0.68].forEach((d, i) => SFX.click(s1 + 6.2 + i * d, 0.04, 1100 + i * 90));
  SFX.thump(s1 + 11.4, 0.08, 74); // the tally

  // 02 — the tape measure
  const s2 = scanStart(1);
  SFX.whoosh(s2 + 0.05, 0.06, 0.9, 1800);
  for (let i = 0; i < 14; i++) SFX.click(s2 + 0.55 + i * 0.075, 0.030, 1500 + i * 30);
  SFX.paper(s2 + 2.30, 0.05, 0.6);
  SFX.ding(s2 + 3.55, 0.045, 880);
  SFX.thump(s2 + 9.6, 0.07, 70);

  // 03 — the brain and the million junctions
  const s3 = scanStart(2);
  SFX.paper(s3 + 0.10, 0.07, 0.8);
  for (let i = 0; i < 26; i++) SFX.click(s3 + 4.3 + i * 0.055, 0.022, 1700 + (i % 7) * 90);
  SFX.ding(s3 + 6.10, 0.04, 1318);
  SFX.thump(s3 + 11.2, 0.12, 62); // the shear

  // 04 — the hippocampus, and a blank date
  const s4 = scanStart(3);
  SFX.thump(s4 + 0.3, 0.09, 60);
  SFX.paper(s4 + 2.2, 0.06, 0.7);
  SFX.ding(s4 + 4.9, 0.05, 932);
  SFX.card(s4 + 8.4, 0.09, 320);
  SFX.stamp(s4 + 10.6, 0.18); // TANPA TANGGAL

  // 05 — the cot, the mobile, the sheet
  const s5 = scanStart(4);
  SFX.card(s5 + 0.25, 0.10, 300);
  [0, 1, 2].forEach((i) => SFX.ding(s5 + 1.1 + i * 0.42, 0.028, 1568 + i * 220)); // mobile
  SFX.paper(s5 + 6.3, 0.07, 0.9);
  SFX.whoosh(s5 + 9.6, 0.05, 0.6, 1500); // the sheet changes
  SFX.stamp(s5 + 12.4, 0.15); // GANTI SEPRAI

  // 06 — the cards and the thread
  const s6 = scanStart(5);
  [0, 1, 2, 3].forEach((i) => SFX.card(s6 + 2.9 + i * 0.42, 0.09, 420 - i * 30));
  SFX.pluck(s6 + 6.2, 0.055, 260);
  SFX.pluck(s6 + 7.4, 0.045, 340);
  SFX.whoosh(s6 + 8.9, 0.05, 0.7, 1700);

  // 07 — two tubes
  const s7 = scanStart(6);
  SFX.pour(s7 + 3.2, 0.075, 1.5, 380, 780);
  SFX.ding(s7 + 4.9, 0.04, 1046);
  SFX.pour(s7 + 6.6, 0.070, 1.2, 300, 620);
  SFX.ding(s7 + 7.9, 0.045, 784);
  SFX.thump(s7 + 8.2, 0.08, 66);

  // 08 — the tape, the splice, the mall
  const s8 = scanStart(7);
  SFX.cassette(s8 + 0.30, 0.11, 1.6);
  SFX.splice(s8 + 3.10, 0.09);
  SFX.card(s8 + 7.10, 0.09, 300);
  SFX.stamp(s8 + 9.4, 0.10);
  SFX.click(s8 + 12.2, 0.05, 900);

  // 09 — the frames and the line
  const s9 = scanStart(8);
  [0, 1, 2].forEach((i) => SFX.click(s9 + 0.4 + i * 0.42, 0.045, 1200 + i * 120));
  SFX.ding(s9 + 2.1, 0.05, 880);
  SFX.paper(s9 + 6.4, 0.06, 0.9);
  for (let i = 0; i < 6; i++) SFX.click(s9 + 9.6 + i * 0.13, 0.030, 1600);
  SFX.ding(s9 + 12.6, 0.05, 1174);
}

/* ---------------------------------- vo ----------------------------------- */

function loadVO() {
  tl.scenes.forEach((sc) => {
    const wav = readWav(path.join(process.cwd(), 'assets', 'audio', 'vo', `${sc.id}.wav`));
    const start = Math.floor(sc.audioStart * SR);
    const n = wav.data.length / 4;
    for (let i = 0; i < n; i++) {
      const idx = start + i;
      if (idx < 0 || idx >= N) continue;
      vo[0][idx] = wav.data.readInt16LE(i * 4) / 32768;
      vo[1][idx] = wav.data.readInt16LE(i * 4 + 2) / 32768;
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

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep18.wav');
  write(out, file);
  console.log(`mix-ep18.wav  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
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
