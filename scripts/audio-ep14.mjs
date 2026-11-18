/**
 * Episode 14 soundtrack — "Emas bukan mesin uang. Ia cermin."
 *
 * The score is a price board, not a landscape: a soft 92 BPM ticker that never
 * stops, warm seventh chords underneath (it is a comfortable sound, which is
 * the point), and sound design made of the objects in frame — split-flap
 * letters, a stamp, a gate closing, a dash line flowing.
 *
 * The voice sits on top and nothing else lives in its band.
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

let seed = 20261114;
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

const tri = (f) => (t) => {
  const p = (t * f) % 1;
  return 4 * Math.abs(p - 0.5) - 1;
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
    const hp = w - last * 0.92;
    last = w;
    return hp;
  };
};

/* --------------------------------- score --------------------------------- */

const BPM = 76;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const SIXT = BEAT / 4;

const CHORDS = [
  [82.41, 246.94, 329.63, 415.30], // Em9, cold
  [65.41, 196.0, 246.94, 311.13], // Cmaj7 low
  [110.0, 261.63, 329.63, 440.0], // Am
  [61.74, 185.0, 233.08, 293.66], // B7, unresolved
];

// the ticker: a pentatonic ladder the plucks walk up and down
const DEG = [1, 1.5, 1.78, 2.0, 2.4, 3.0];
const PATTERN = [0, 2, 1, 3, 2, 0, 4, 1];

const totalBars = Math.ceil(tl.total / BAR);

function renderMusic() {
  const pad = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];
    // warm pad, two bars long, entering late and leaving early
    if (bar % 2 === 0) {
      addTone(pad, t0, BAR * 2.05, (t) => {
        const att = clamp(t / 1.8);
        const rel = clamp((BAR * 2.05 - t) / 2.2);
        let v = 0;
        chord.forEach((f, i) => {
          v += Math.sin(TAU * f * t) * (i === 0 ? 0.46 : 0.2) + Math.sin(TAU * f * 1.0028 * t) * 0.1;
        });
        return (v / 3.2) * att * rel;
      }, { gain: 0.2 });
    }

    // a pulse at the bottom of the bar: the clock under the auction
    addTone(music, t0, 0.9, (t) => {
      const f = 52 + 22 * Math.exp(-t * 9);
      return Math.sin(TAU * f * t) * Math.exp(-t * 4.2);
    }, { gain: 0.085 });

    // the ticker: sixteenth plucks, sparse on purpose
    for (let s = 0; s < 16; s++) {
      if (s % 2 === 1) continue;
      const step = PATTERN[(s / 2) % PATTERN.length];
      const f = chord[2] * DEG[step] * (bar % 4 === 3 ? 1.0 : 1);
      const ts = t0 + s * SIXT;
      if (ts > tl.total) break;
      addTone(music, ts, 0.32, (t) => {
        const env = Math.exp(-t * 16) * (1 - Math.exp(-t * 900));
        return (tri(f)(t) * 0.7 + Math.sin(TAU * f * 2 * t) * 0.18) * env;
      }, { gain: 0.035, pan: s % 4 === 0 ? -0.28 : 0.28 });
    }
  }
  for (let ch = 0; ch < 2; ch++) {
    const f = lp(2200);
    for (let i = 0; i < N; i++) music[ch][i] += f(pad[ch][i]);
  }
  const fin = 1.4 * SR;
  const fout = 2.4 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fin), clamp((N - i) / fout));
    music[0][i] *= g;
    music[1][i] *= g;
  }
}

/* ---------------------------------- sfx ---------------------------------- */

const SFX = {
  /** split-flap: a wooden click and a tiny pitch settle */
  flap(t, g = 0.13, f = 720) {
    let n = noiseGen();
    addTone(sfx, t, 0.05, (x) => n() * Math.exp(-x * 90), { gain: g * 0.8, pan: 0.05 });
    addTone(sfx, t, 0.09, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 46), { gain: g * 0.55 });
  },
  /** a data tick: dry, short, almost a typewriter key */
  tick(t, g = 0.06, f = 1600) {
    addTone(sfx, t, 0.035, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 110), { gain: g, pan: -0.1 });
    let n = noiseGen();
    addTone(sfx, t, 0.02, (x) => n() * Math.exp(-x * 200), { gain: g * 0.5, pan: 0.1 });
  },
  /** rubber stamp hitting paper */
  stamp(t, g = 0.22) {
    let n = noiseGen();
    addTone(sfx, t, 0.16, (x) => n() * Math.exp(-x * 40), { gain: g * 0.5, pan: 0.15 });
    addTone(sfx, t, 0.5, (x) => {
      const f = 150 * Math.exp(-x * 5) + 62;
      return Math.sin(TAU * f * x) * Math.exp(-x * 9);
    }, { gain: g });
  },
  /** air moving past the frame — used for cuts and wipes */
  whoosh(t, g = 0.09, dur = 0.8, cut = 3200) {
    let n = noiseGen();
    const f = lp(cut);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return f(n()) * Math.sin(Math.PI * p) * 0.8;
    }, { gain: g, pan: 0.22 });
  },
  /** the price moving up: a riser that never gets loud */
  riser(t, g = 0.07, dur = 1.2, f0 = 220, f1 = 660) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const f = f0 * Math.pow(f1 / f0, p);
      return Math.sin(TAU * f * x) * Math.sin(Math.PI * p) * 0.8;
    }, { gain: g, pan: -0.18 });
  },
  /** a card arriving */
  pop(t, g = 0.08, f = 420) {
    addTone(sfx, t, 0.12, (x) => Math.sin(TAU * f * x * (1 + x * 0.6)) * Math.exp(-x * 34), { gain: g });
  },
  /** low thump under a heavy beat */
  thump(t, g = 0.14, f = 74) {
    addTone(sfx, t, 0.7, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 6.5), { gain: g });
  },
  /** a struck-through line: short metallic scrape */
  strike(t, g = 0.12) {
    let n = noiseGen();
    addTone(sfx, t, 0.22, (x) => {
      const f = lp(5200);
      return n() * Math.exp(-x * 18) * 0.8 + Math.sin(TAU * 2400 * x) * Math.exp(-x * 40) * 0.3;
    }, { gain: g, pan: 0.16 });
  },
  /** the settling chime at the end of a thought */
  chime(t, g = 0.05, f = 880) {
    addTone(sfx, t, 1.6, (x) => {
      return (Math.sin(TAU * f * x) * 0.6 + Math.sin(TAU * f * 2.02 * x) * 0.22) * Math.exp(-x * 2.4);
    }, { gain: g, pan: 0.2 });
  },
};

function renderSFX() {
  const S = (i) => tl.scenes[i];
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.whoosh(sc.start - 0.34, 0.075, 0.85);
    SFX.thump(sc.start, 0.08, 58);
  });
  // every scene also gets the "cut" of a metal door: a short, cold tick
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.tick(sc.start + 0.02, 0.05, 620);
  });

  // 01 the board: two prices, one crossing out
  const s1 = S(0);
  SFX.pop(s1.start + 0.35, 0.06, 300);
  SFX.strike(s1.start + 1.55, 0.10);
  SFX.thump(s1.start + 2.5, 0.10, 66);
  SFX.chime(s1.start + 2.6, 0.05, 520);
  SFX.whoosh(s1.start + 9.5, 0.05, 0.6, 1600);
  SFX.thump(s1.start + 9.7, 0.12, 52);

  // 02 two plates, then a measured gap
  const s2 = S(1);
  SFX.pop(s2.start + 0.2, 0.06, 380);
  SFX.pop(s2.start + 1.55, 0.06, 300);
  SFX.tick(s2.start + 3.0, 0.04, 1200);
  SFX.thump(s2.start + 6.3, 0.08, 60);
  SFX.strike(s2.start + 12.9, 0.09);

  // 03 three slips, a zero gauge, a melting ring
  const s3 = S(2);
  [0.25, 1.45, 2.65].forEach((tt, i) => { SFX.pop(s3.start + tt, 0.06, 340 + i * 70); SFX.stamp(s3.start + tt + 0.35, 0.10); });
  SFX.chime(s3.start + 8.9, 0.05, 660);
  SFX.whoosh(s3.start + 13.5, 0.05, 0.8, 2200);

  // 04 the vault door, the stack, the fear gauge
  const s4 = S(3);
  SFX.thump(s4.start + 0.2, 0.14, 44);
  SFX.whoosh(s4.start + 0.3, 0.06, 1.4, 900);
  for (let i = 0; i < 12; i++) SFX.tick(s4.start + 5.7 + i * 0.09, 0.022, 900 + i * 40);
  SFX.riser(s4.start + 10.8, 0.05, 1.6, 180, 420);

  // 05 the fall, annotated
  const s5 = S(4);
  SFX.riser(s5.start + 0.25, 0.04, 2.4, 220, 300);
  [2.8, 3.4, 4.0].forEach((tt, i) => SFX.pop(s5.start + tt, 0.05, 460 + i * 90));
  SFX.whoosh(s5.start + 9.6, 0.05, 0.7, 1800);
  SFX.thump(s5.start + 16.5, 0.12, 50);

  // 06 two currencies
  const s6 = S(5);
  SFX.pop(s6.start + 0.2, 0.06, 400);
  SFX.pop(s6.start + 0.8, 0.06, 320);
  SFX.tick(s6.start + 3.2, 0.04, 1400);
  SFX.whoosh(s6.start + 7.2, 0.05, 0.8, 2000);
  SFX.chime(s6.start + 13.4, 0.05, 560);

  // 07 when it works, and when it just sits there
  const s7 = S(6);
  SFX.thump(s7.start + 0.15, 0.12, 46);
  [6.3, 7.4, 8.5].forEach((tt, i) => SFX.pop(s7.start + tt, 0.055, 380 + i * 80));
  SFX.tick(s7.start + 13.4, 0.05, 1000);
  SFX.chime(s7.start + 14.5, 0.04, 440);

  // 08 three rules, the mirror, the card
  const s8 = S(7);
  [0.25, 1.5, 2.7].forEach((tt, i) => SFX.pop(s8.start + tt, 0.06, 420 + i * 90));
  SFX.whoosh(s8.start + 9.4, 0.05, 1.0, 2400);
  SFX.chime(s8.start + 12.7, 0.055, 700);
  SFX.thump(s8.start + 15.6, 0.09, 56);
  SFX.chime(s8.start + 17.2, 0.06, 880);
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
    const duck = 1 - 0.66 * smooth[Math.floor(i / block)];
    for (let ch = 0; ch < 2; ch++) {
      out[ch][i] = vo[ch][i] * 1.0 + music[ch][i] * 0.44 * duck + sfx[ch][i] * 0.95;
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
    const f = hp(28);
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

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep14.wav');
  write(out, file);
  console.log(`mix-ep14.wav  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
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
