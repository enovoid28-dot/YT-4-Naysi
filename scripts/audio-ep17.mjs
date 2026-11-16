/**
 * Episode 17 soundtrack — "Paylater tidak berbunga. Ia cuma pakai kata lain."
 *
 * Episode 16 was a machine; this one is a desk. 96 BPM, marimba and pizzicato
 * over a soft shaker, a little close and dry like a workshop radio, and the
 * sound design is paper: a sheet dragged across a table, a rubber stamp, a
 * pencil, a stack of slips landing one after another.
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

let seed = 20261115;
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

const BPM = 96;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

// C major, voiced wide and friendly, with one borrowed chord to keep it honest
const CHORDS = [
  [261.63, 329.63, 392.0, 587.33], // Cmaj9
  [220.0, 261.63, 329.63, 493.88], // Am7
  [174.61, 261.63, 349.23, 523.25], // Fmaj9
  [196.0, 293.66, 392.0, 587.33], // G6
];

const totalBars = Math.ceil(tl.total / BAR);

/** marimba: a wooden bar, so the fundamental dies before the fourth harmonic */
const marimba = (f) => (t) => {
  const env = Math.exp(-t * 7.5) * (1 - Math.exp(-t * 400));
  const v = Math.sin(TAU * f * t) * 0.62
    + Math.sin(TAU * f * 4 * t) * 0.16 * Math.exp(-t * 22)
    + Math.sin(TAU * f * 9.2 * t) * 0.05 * Math.exp(-t * 40);
  return v * env;
};

function renderMusic() {
  const shaker = [new Float32Array(N), new Float32Array(N)];

  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];

    // pizzicato bass on 1 and 3
    [0, 2].forEach((b) => {
      const f = chord[0] / 2;
      addTone(music, t0 + b * BEAT, 0.5, (t) => {
        const env = Math.exp(-t * 8) * (1 - Math.exp(-t * 600));
        return (Math.sin(TAU * f * t) * 0.8 + Math.sin(TAU * f * 2 * t) * 0.15) * env;
      }, { gain: 0.24 });
    });

    // the marimba figure: a rising three-note cell, then a rest
    const pat = [[0, 1], [2, 2], [3, 1], [1, 2]];
    for (let s = 0; s < 8; s++) {
      if (s % 2 === 1) continue;
      const [deg, rep] = pat[(s / 2) % pat.length];
      const f = chord[deg] * (1 + (bar % 2 ? 0.0 : 0.0));
      const ts = t0 + s * (BEAT / 2) + 0.02;
      if (ts > tl.total) break;
      for (let r = 0; r < rep; r++) {
        addTone(music, ts + r * 0.085, 0.42, marimba(f * (r === 0 ? 1 : 1)), {
          gain: 0.085 - r * 0.018,
          pan: r ? 0.3 : -0.26,
        });
      }
    }

    // shaker: sixteenths, very quiet, that is the whole groove
    for (let s = 0; s < 16; s++) {
      const ts = t0 + s * (BEAT / 4);
      if (ts > tl.total) break;
      let n = noiseGen();
      const hp = (x) => x;
      addTone(shaker, ts, 0.06, (t) => n() * Math.exp(-t * 70) * (s % 4 === 2 ? 1 : 0.55), {
        gain: 0.032, pan: s % 2 ? 0.4 : -0.4,
      });
    }
  }

  // the pad: barely there, just enough to keep the desk from sounding empty
  for (let bar = 0; bar < totalBars; bar += 2) {
    const chord = CHORDS[bar % CHORDS.length];
    addTone(music, bar * BAR, BAR * 2.02, (t) => {
      const att = clamp(t / 1.4);
      const rel = clamp((BAR * 2.02 - t) / 1.6);
      let v = 0;
      chord.forEach((f, i) => {
        v += Math.sin(TAU * f * t) * (i < 2 ? 0.12 : 0.07);
      });
      return (v / 2.2) * att * rel;
    }, { gain: 0.125 });
  }

  const f = lp(3400);
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < N; i++) music[ch][i] = f(music[ch][i]) + shaker[ch][i];
  }

  const fin = 1.2 * SR;
  const fout = 2.2 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fin), clamp((N - i) / fout));
    music[0][i] *= g;
    music[1][i] *= g;
  }
}

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

/* -------------------------------- cues ----------------------------------- */

const C = (i, k = 0) => {
  const sc = tl.scenes[i];
  return sc.start + (sc.cards && sc.cards[k] ? sc.cards[k].start : [0.1, 2.5, 5.2, 8.3, 11.2][k] || 0.2);
};

const SFX2 = {
  /** a sheet of paper dragged across the desk */
  paper(t, g = 0.10, dur = 0.7) {
    let n = noiseGen();
    const f = lp(2600);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return f(n()) * Math.sin(Math.PI * p) * 1.4;
    }, { gain: g, pan: -0.2 });
  },
  /** pencil on paper: dry, short, no pitch */
  pencil(t, g = 0.05, dur = 0.22) {
    let n = noiseGen();
    const f = lp(5200);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return f(n()) * Math.sin(Math.PI * p) * 1.2;
    }, { gain: g, pan: 0.18 });
  },
  /** one slip of paper landing on the stack */
  slip(t, g = 0.12, f0 = 320) {
    let n = noiseGen();
    addTone(sfx, t, 0.09, (x) => n() * Math.exp(-x * 55), { gain: g * 0.7, pan: 0.1 });
    addTone(sfx, t, 0.16, (x) => Math.sin(TAU * f0 * x) * Math.exp(-x * 24), { gain: g });
  },
  /** a counter clicking through a number */
  click(t, g = 0.055, f = 1500) {
    addTone(sfx, t, 0.04, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 130), { gain: g, pan: -0.12 });
    let n = noiseGen();
    addTone(sfx, t, 0.025, (x) => n() * Math.exp(-x * 220), { gain: g * 0.5, pan: 0.14 });
  },
  /** the little glass chime when a number lands */
  ding(t, g = 0.045, f = 1046) {
    addTone(sfx, t, 1.1, (x) => {
      return (Math.sin(TAU * f * x) * 0.6 + Math.sin(TAU * f * 2.76 * x) * 0.2) * Math.exp(-x * 3.4);
    }, { gain: g, pan: 0.24 });
  },
};

function renderSFX() {
  const S = (i) => tl.scenes[i];
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.whoosh(sc.start - 0.3, 0.055, 0.7, 2400);
    SFX2.paper(sc.start - 0.06, 0.06, 0.5);
  });

  // 01 two columns, and the fine print
  const s1 = S(0);
  SFX2.paper(s1.start + 0.1, 0.09, 0.8);
  SFX2.slip(s1.start + 0.35, 0.10, 260);
  SFX2.slip(s1.start + 2.6, 0.10, 220);
  SFX2.pencil(s1.start + 3.6, 0.05, 0.3);
  SFX2.paper(s1.start + 6.7, 0.07, 1.1);
  SFX2.ding(s1.start + 9.4, 0.04, 880);

  // 02 the ledger
  const s2 = S(1);
  for (let i = 0; i < 3; i++) SFX2.click(s2.start + 0.35 + i * 0.16, 0.05, 1200 + i * 120);
  [0.5, 3.4, 6.4].forEach((tt, i) => SFX2.slip(s2.start + tt, 0.09, 300 - i * 30));
  for (let i = 0; i < 6; i++) SFX2.click(s2.start + 8.0 + i * 0.14, 0.035, 1400);
  SFX.stamp(s2.start + 10.6, 0.12);

  // 03 the bar splitting
  const s3 = S(2);
  SFX2.paper(s3.start + 0.2, 0.07, 0.9);
  SFX.riser(s3.start + 0.5, 0.03, 1.2, 400, 900);
  SFX2.slip(s3.start + 1.6, 0.08, 280);
  SFX2.click(s3.start + 3.4, 0.05, 900);
  SFX2.click(s3.start + 5.2, 0.05, 1000);
  SFX.stamp(s3.start + 8.6, 0.10);

  // 04 the receipt printing, then the total
  const s4 = S(3);
  SFX2.paper(s4.start + 0.15, 0.08, 1.4);
  for (let i = 0; i < 22; i++) SFX2.click(s4.start + 2.2 + i * 0.075, 0.026, 1700 + (i % 5) * 60);
  SFX2.slip(s4.start + 4.2, 0.09, 240);
  SFX.stamp(s4.start + 8.2, 0.13);
  SFX2.ding(s4.start + 8.4, 0.04, 784);

  // 05 twelve cells
  const s5 = S(4);
  SFX2.pencil(s5.start + 0.3, 0.05, 0.4);
  SFX2.slip(s5.start + 2.3, 0.09, 300);
  for (let i = 0; i < 12; i++) SFX2.click(s5.start + 6.1 + i * 0.105, 0.045, 1000 + i * 45);
  SFX2.ding(s5.start + 9.9, 0.05, 880);
  SFX.stamp(s5.start + 13.2, 0.11);

  // 06 zero and nine
  const s6 = S(5);
  SFX2.slip(s6.start + 0.2, 0.10, 280);
  SFX2.paper(s6.start + 3.4, 0.07, 0.9);
  SFX2.slip(s6.start + 5.0, 0.11, 200);
  SFX.stamp(s6.start + 9.2, 0.10);
  SFX2.ding(s6.start + 15.6, 0.05, 700);

  // 07 four slips, one after another
  const s7 = S(6);
  for (let i = 0; i < 4; i++) {
    SFX2.slip(s7.start + 1.2 + i * 0.5, 0.11, 300 - i * 40);
    SFX2.pencil(s7.start + 1.35 + i * 0.5, 0.035, 0.18);
  }
  SFX.stamp(s7.start + 5.6, 0.13);
  SFX2.ding(s7.start + 5.8, 0.04, 620);
  SFX2.click(s7.start + 10.4, 0.05, 900);

  // 08 the ruler and the marker
  const s8 = S(7);
  for (let i = 0; i < 8; i++) SFX2.click(s8.start + 0.3 + i * 0.12, 0.03, 1300 + i * 40);
  SFX2.paper(s8.start + 2.6, 0.06, 0.7);
  SFX.riser(s8.start + 6.4, 0.035, 1.2, 300, 700);
  SFX2.ding(s8.start + 7.6, 0.05, 932);
  SFX.stamp(s8.start + 10.9, 0.12);

  // 09 the form
  const s9 = S(8);
  SFX2.paper(s9.start + 0.2, 0.07, 0.9);
  for (let i = 0; i < 5; i++) SFX2.pencil(s9.start + 4.6 + i * 0.3, 0.04, 0.16);
  SFX2.slip(s9.start + 6.2, 0.09, 260);
  SFX2.ding(s9.start + 8.4, 0.05, 1046);
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
      out[ch][i] = vo[ch][i] * 1.0 + music[ch][i] * 0.55 * duck + sfx[ch][i] * 0.95;
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

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep17.wav');
  write(out, file);
  console.log(`mix-ep17.wav  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
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
