/**
 * Episode 16 soundtrack — "Token seratus ribu bukan seratus ribu."
 *
 * The score is a machine, not a landscape: 84 BPM, a sub pulse on every beat
 * like a meter disc turning, mains hum under it (50 Hz and its octave, so quiet
 * you feel it more than hear it), and a dry electric arpeggio in the LCD band.
 * Everything else is the objects: a breaker clacking, a coin dropping, a stamp.
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

const BPM = 84;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const SIXT = BEAT / 4;

// D minor, voiced wide and cold: the sound of a hallway with a meter in it
const CHORDS = [
  [146.83, 220.0, 349.23, 440.0], // Dm
  [116.54, 174.61, 293.66, 349.23], // Bbmaj7
  [98.0, 146.83, 233.08, 293.66], // Gm7
  [110.0, 164.81, 246.94, 329.63], // A7sus
];

const DEG = [1, 1.2, 1.5, 1.78, 2.0, 2.38];
const PATTERN = [0, 3, 1, 4, 2, 5];

const totalBars = Math.ceil(tl.total / BAR);

function renderMusic() {
  const hum = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    const chord = CHORDS[bar % CHORDS.length];

    // the pad: two bars, no attack to speak of, it is just the room
    if (bar % 2 === 0) {
      addTone(music, t0, BAR * 2.02, (t) => {
        const att = clamp(t / 1.6);
        const rel = clamp((BAR * 2.02 - t) / 2.0);
        let v = 0;
        chord.forEach((f, i) => {
          v += Math.sin(TAU * f * t * 0.5) * (i === 0 ? 0.5 : 0.18);
          v += Math.sin(TAU * f * t * 0.5 * 1.004) * 0.08;
        });
        return (v / 3.4) * att * rel;
      }, { gain: 0.27 });
    }

    // the disc: one pulse per beat, the thing you can actually hear through a wall
    for (let b = 0; b < 4; b++) {
      const tb = t0 + b * BEAT;
      addTone(music, tb, 0.5, (t) => {
        const f = 58 + 18 * Math.exp(-t * 22);
        return Math.sin(TAU * f * t) * Math.exp(-t * 7.5);
      }, { gain: b === 0 ? 0.19 : 0.135 });
    }

    // arpeggio: eighths, dry, panned, deliberately mechanical
    for (let s = 0; s < 8; s++) {
      const step = PATTERN[(s + bar) % PATTERN.length];
      const f = chord[2] * DEG[step];
      const ts = t0 + s * (BEAT / 2) + BEAT / 4;
      if (ts > tl.total) break;
      addTone(music, ts, 0.26, (t) => {
        const env = Math.exp(-t * 18) * (1 - Math.exp(-t * 1200));
        return (Math.sin(TAU * f * t) * 0.55 + Math.sin(TAU * f * 2.01 * t) * 0.2 + Math.sin(TAU * f * 3 * t) * 0.07) * env;
      }, { gain: 0.046, pan: s % 2 ? 0.34 : -0.34 });
    }

    // meter counter: a hard click at the turn of every fourth bar
    if (bar % 4 === 3) {
      const tc = t0 + BAR;
      let n = noiseGen();
      addTone(music, tc, 0.05, (t) => n() * Math.exp(-t * 140), { gain: 0.05, pan: -0.2 });
      addTone(music, tc, 0.07, (t) => Math.sin(TAU * 2100 * t) * Math.exp(-t * 90), { gain: 0.02 });
    }
  }

  // mains hum: 50 Hz and 100 Hz, breathing
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const breath = 0.6 + 0.4 * Math.sin(TAU * 0.11 * t);
    const v = Math.sin(TAU * 50 * t) * 0.55 + Math.sin(TAU * 100 * t) * 0.3 + Math.sin(TAU * 150 * t) * 0.12;
    hum[0][i] = v * 0.012 * breath;
    hum[1][i] = v * 0.012 * breath;
  }
  const f = lp(2400);
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < N; i++) music[ch][i] = f(music[ch][i]) + hum[ch][i];
  }

  const fin = 1.6 * SR;
  const fout = 2.6 * SR;
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
  return sc.start + (sc.cards && sc.cards[k] ? sc.cards[k].start : [0.1, 2.5, 5.2, 8.3, 11.2, 14.5][k] || 0.2);
};

const SFX2 = {
  /** a breaker thrown: hard clack, then the body of the switch */
  breaker(t, g = 0.17) {
    let n = noiseGen();
    addTone(sfx, t, 0.05, (x) => n() * Math.exp(-x * 120), { gain: g * 0.9, pan: -0.12 });
    addTone(sfx, t, 0.22, (x) => {
      const fr = 240 * Math.exp(-x * 26) + 70;
      return Math.sin(TAU * fr * x) * Math.exp(-x * 16);
    }, { gain: g, pan: 0.05 });
    addTone(sfx, t + 0.02, 0.5, (x) => Math.sin(TAU * 118 * x) * Math.exp(-x * 7) * 0.4, { gain: g * 0.5 });
  },
  /** a coin landing in a tin */
  coin(t, g = 0.09, f = 2100) {
    addTone(sfx, t, 0.28, (x) => {
      const v = Math.sin(TAU * f * x) * 0.5 + Math.sin(TAU * f * 1.48 * x) * 0.3 + Math.sin(TAU * f * 2.11 * x) * 0.16;
      return v * Math.exp(-x * 13);
    }, { gain: g, pan: 0.12 });
  },
  /** appliance waking up: an inrush then a steady tone */
  appOn(t, g = 0.1, f = 120, dur = 1.1) {
    let n = noiseGen();
    const lp1 = lp(900);
    addTone(sfx, t, dur, (x) => {
      const inrush = Math.exp(-x * 4) * lp1(n());
      const tone = Math.sin(TAU * f * x) * 0.25 * Math.min(1, x * 3);
      return (inrush * 0.5 + tone) * (1 - clamp((x - dur + 0.2) / 0.2));
    }, { gain: g });
  },
  /** a key being tapped on a counter */
  key(t, g = 0.07, f = 1750) {
    addTone(sfx, t, 0.045, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 90), { gain: g });
    let n = noiseGen();
    addTone(sfx, t, 0.03, (x) => n() * Math.exp(-x * 160), { gain: g * 0.6, pan: 0.2 });
  },
};

function renderSFX() {
  const S = (i) => tl.scenes[i];
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.whoosh(sc.start - 0.34, 0.06, 0.8);
    SFX.thump(sc.start, 0.075, 64);
  });

  // 01 the meter, the receipt, the four cuts
  const s1 = C(0, 0) - 0.03;
  SFX.thump(s1 + 0.10, 0.12, 54);
  SFX.whoosh(s1 + 0.25, 0.05, 0.9, 1500);
  for (let i = 0; i < 18; i++) SFX2.key(s1 + 0.5 + i * 0.085, 0.018, 1650 + (i % 4) * 90);
  [1.78, 4.79, 6.67].forEach((tt, i) => { SFX.pop(s1 + tt, 0.055, 400 + i * 90); SFX.stamp(s1 + tt + 0.06, 0.07); });
  for (let i = 0; i < 6; i++) SFX2.coin(s1 + 2.0 + i * 0.12, 0.035, 1900 + i * 60);

  // 02 the three lines, then the four pieces
  const s2 = C(1, 0) - 0.06;
  [0.06, 2.45, 4.66].forEach((tt, i) => SFX2.key(s2 + tt, 0.05, 1200 + i * 140));
  for (let i = 0; i < 9; i++) SFX.tick(s2 + 6.3 + i * 0.13, 0.022, 900 + i * 40);
  SFX.pop(s2 + 8.24, 0.06, 360);
  SFX.thump(s2 + 9.2, 0.09, 60);
  SFX.stamp(s2 + 13.36, 0.12);

  // 03 two regions, two rings, one difference
  const s3 = C(2, 0) - 0.05;
  SFX2.key(s3 + 0.05, 0.05, 900);
  SFX2.key(s3 + 1.32, 0.05, 1100);
  SFX.chime(s3 + 1.45, 0.035, 620);
  SFX2.key(s3 + 3.69, 0.05, 1300);
  SFX.riser(s3 + 5.83, 0.03, 1.4, 300, 700);
  SFX.thump(s3 + 6.0, 0.10, 58);

  // 04 the two meters, the bars, the hole in the middle
  const s4 = C(3, 0) - 0.09;
  SFX.thump(s4 + 0.12, 0.11, 56);
  SFX2.key(s4 + 2.72, 0.05, 1000);
  SFX.riser(s4 + 2.9, 0.03, 2.4, 220, 460);
  SFX.pop(s4 + 5.75, 0.05, 520);
  SFX2.coin(s4 + 8.57, 0.07, 1400);
  SFX.chime(s4 + 10.51, 0.045, 540);
  SFX.thump(s4 + 10.6, 0.09, 52);

  // 05 three breakers on one board
  const s5 = C(4, 0) - 0.06;
  SFX2.breaker(s5 + 2.17, 0.16);
  SFX2.breaker(s5 + 7.92, 0.16);
  SFX2.breaker(s5 + 10.75, 0.17);
  SFX.thump(s5 + 14.86, 0.13, 48);
  SFX.stamp(s5 + 14.95, 0.13);
  SFX.chime(s5 + 15.4, 0.03, 480);

  // 06 the tariff plate struck through, the real price landing
  const s6 = C(5, 0) - 0.08;
  SFX.strike(s6 + 0.9, 0.11);
  SFX2.key(s6 + 4.42, 0.05, 1250);
  SFX.chime(s6 + 7.85, 0.055, 700);
  SFX.thump(s6 + 7.9, 0.11, 56);
  SFX.pop(s6 + 11.12, 0.06, 840);

  // 07 the appliances, one after another
  const s7 = C(6, 0) - 0.05;
  SFX2.appOn(s7 + 2.45, 0.085, 132, 1.3);
  SFX2.appOn(s7 + 6.04, 0.075, 96, 1.1);
  SFX2.appOn(s7 + 10.40, 0.075, 78, 1.4);
  SFX.chime(s7 + 10.6, 0.03, 500);

  // 08 the room at one in the morning
  const s8 = C(7, 0) - 0.09;
  SFX.whoosh(s8 + 0.2, 0.04, 2.2, 900);
  for (let i = 0; i < 4; i++) SFX2.key(s8 + 2.13 + i * 0.24, 0.03, 700 + i * 120);
  SFX.chime(s8 + 5.10, 0.04, 420);
  SFX2.key(s8 + 8.36, 0.035, 1500);
  SFX.thump(s8 + 10.36, 0.09, 46);
  SFX.chime(s8 + 10.5, 0.035, 380);

  // 09 everything back on one meter
  const s9 = C(8, 0) - 0.04;
  SFX.thump(s9 + 0.1, 0.10, 50);
  for (let i = 0; i < 4; i++) SFX2.key(s9 + 4.92 + i * 0.11, 0.035, 1150 + i * 90);
  SFX.chime(s9 + 7.23, 0.045, 560);
  for (let i = 0; i < 5; i++) SFX2.key(s9 + 10.94 + i * 0.34, 0.03, 1600);
  SFX.chime(s9 + 13.6, 0.05, 880);
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

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep16.wav');
  write(out, file);
  console.log(`mix-ep16.wav  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
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
