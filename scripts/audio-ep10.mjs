/**
 * Episode 10 soundtrack — "Semesta · Lubang Hitam": a drone that never resolves, a star
 * going out, a clock counting eight minutes, a frozen sea, and a horizon at the end.
 *
 * Rebuilt for clarity: the voice sits on top and nothing else lives in its
 * band. No sub-rumble under the narration (that is what made the last mix read
 * as a snore), no bus soft-clip, and the bed is written around the measured
 * card boundaries so the music breathes with the sentences.
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

let seed = 20251109;
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
  const out = buf;
  for (let i = 0; i < len; i++) {
    const idx = start + i;
    if (idx < 0 || idx >= N) continue;
    const t = i / SR;
    const v = make(t, i);
    out[bufIdx][idx] += v * gl;
    if (buf.length > 1) out[1 - bufIdx][idx] += v * gr;
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

// Slow, wide, unresolved: the music has to sound like a place with nothing in
// it. Chords change every two bars, the pad enters over four seconds, and the
// only rhythmic element is a pulse so low it reads as breathing.
const BPM = 56;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CHORDS = [
  [55.0, 82.41, 130.81, 164.81], // Am(add9), low
  [43.65, 65.41, 110.0, 174.61], // F
  [49.0, 73.42, 123.47, 196.0], // G
  [41.2, 61.74, 98.0, 146.83], // Em
  [36.71, 55.0, 87.31, 130.81], // Dm
];

const totalBars = Math.ceil(tl.total / BAR);

function renderMusic() {
  const pad = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR * 0.5; // chords hold for two bars
    if (t0 > tl.total + 2) break;
    if (bar % 2) continue;
    const chord = CHORDS[(bar / 2) % CHORDS.length];
    addTone(pad, t0, BAR * 2.1, (t) => {
      const att = clamp(t / 3.4);
      const rel = clamp((BAR * 2.1 - t) / 4.0);
      let v = 0;
      chord.forEach((f, i) => {
        // two detuned sines per note: a slow beating that never settles
        v += Math.sin(TAU * f * t) * (i === 0 ? 0.5 : 0.24)
          + Math.sin(TAU * f * 1.0035 * t) * 0.14;
      });
      return (v / 4) * att * rel;
    }, { gain: 0.26 });

    // a pulse at the very bottom: felt more than heard
    if (bar >= 2) {
      addTone(music, t0 + BEAT, 1.4, (t) => {
        const f = 44 + 18 * Math.exp(-t * 6);
        return Math.sin(TAU * f * t) * Math.exp(-t * 2.2);
      }, { gain: 0.10 });
    }

    // high shimmer, far away, only in the second half of each chord
    if (bar >= 4) {
      [1, 2.5].forEach((k, i) => {
        const f = chord[3] * 4 * (i ? 1.5 : 1);
        addTone(music, t0 + BAR * k, 1.8, (t) => Math.sin(TAU * f * t) * Math.exp(-t * 2.4) * 0.5, {
          gain: 0.035, pan: i ? 0.3 : -0.3,
        });
      });
    }
  }
  for (let ch = 0; ch < 2; ch++) {
    const f = lp(1800);
    for (let i = 0; i < N; i++) music[ch][i] += f(pad[ch][i]);
  }
  const fadeIn = 3.0 * SR;
  const fadeOut = 3.0 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fadeIn), clamp((N - i) / fadeOut));
    music[0][i] *= g;
    music[1][i] *= g;
  }
}

/* ---------------------------------- sfx ---------------------------------- */

const SFX = {
  impact(t, g = 0.5) {
    let n = noiseGen();
    addTone(sfx, t, 1.6, (x) => {
      const f = 120 * Math.exp(-x * 9) + 48;
      return Math.sin(TAU * f * x) * Math.exp(-x * 3.2) * 0.8 + n() * Math.exp(-x * 20) * 0.25;
    }, { gain: g });
  },
  riser(t, g = 0.3, dur = 1.1) {
    let n = noiseGen();
    addTone(sfx, t, dur, (x) => {
      const p = x / dur;
      return (n() * 0.5 + Math.sin(TAU * (420 + 1600 * p * p) * x) * 0.2) * p * p;
    }, { gain: g });
  },
  tick(t, g = 0.08, f = 1700) {
    addTone(sfx, t, 0.05, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 80), { gain: g, pan: 0.12 });
  },
  blip(t, g = 0.12, f = 760) {
    addTone(sfx, t, 0.2, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 24), { gain: g, pan: -0.1 });
  },
  chime(t, g = 0.16) {
    [1318.5, 1975.5, 2637].forEach((f, i) =>
      addTone(sfx, t + i * 0.02, 1.2, (x) => Math.sin(TAU * f * x) * Math.exp(-x * (3 + i)), {
        gain: g * (1 - i * 0.25), pan: 0.2 - i * 0.2,
      }));
  },
  swell(t, g = 0.12, dur = 2.8) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.sin(Math.PI * p);
      let v = 0;
      [110, 164.81, 220, 329.63].forEach((f, i) => {
        v += Math.sin(TAU * f * x + i) * (i === 0 ? 1 : 0.55);
      });
      return (v / 4) * env;
    }, { gain: g });
  },
  /** the star going out: everything falls in pitch and the air empties */
  collapse(t, g = 0.30, dur = 2.0) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const f = 320 * Math.exp(-p * 3.4) + 44;
      const env = Math.min(1, x / 0.06) * Math.exp(-p * 1.6);
      return Math.sin(TAU * f * x) * env;
    }, { gain: g });
    let n = noiseGen();
    const f = lp(2400);
    addTone(sfx, t, dur * 1.4, (x) => {
      const p = clamp(x / (dur * 1.4));
      return f(n()) * Math.exp(-p * 3.0) * 0.5;
    }, { gain: g * 0.5, pan: 0.2 });
  },
  /** a clock that has to cross a scene at a constant rate */
  clock(t, g = 0.07, step = 0.42, n = 12, f = 1500) {
    for (let i = 0; i < n; i++) SFX.tick(t + i * step, g * (1 - i / (n * 1.6)), f);
  },
  /** deep space: a drone that is not part of the score */
  hum(t, g = 0.10, dur = 6.0, f0 = 58) {
    addTone(sfx, t, dur, (x) => {
      const env = Math.min(1, x / 1.6) * Math.min(1, (dur - x) / 1.8);
      return (Math.sin(TAU * f0 * x) * 0.6 + Math.sin(TAU * f0 * 2.01 * x) * 0.22) * env;
    }, { gain: g });
  },
  /** falling temperature: a slow descending sine under the chart */
  fall(t, g = 0.14, dur = 4.0, f0 = 420) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const f = f0 * Math.exp(p * -1.15);
      const env = Math.min(1, x / 0.5) * Math.min(1, (dur - x) / 0.8);
      return Math.sin(TAU * f * x) * env;
    }, { gain: g, pan: -0.15 });
  },
  /** ice: a crack that snaps once and rings for a moment */
  crack(t, g = 0.18, dur = 0.9) {
    let n = noiseGen();
    addTone(sfx, t, 0.25, (x) => n() * Math.exp(-x * 42), { gain: g, pan: 0.1 });
    addTone(sfx, t, dur, (x) => {
      const f = 240 * Math.exp(-x * 2.2) + 90;
      return Math.sin(TAU * f * x) * Math.exp(-x * 3.4) * 0.6;
    }, { gain: g * 0.7, pan: -0.2 });
  },
  /** frozen air moving where water used to */
  wind(t, g = 0.12, dur = 4.0) {
    let n = noiseGen();
    const f = lp(1300);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.min(1, x / 0.9) * Math.min(1, (dur - x) / 1.2);
      const gust = 0.55 + 0.45 * Math.sin(TAU * 0.22 * x + 0.7);
      return f(n()) * env * gust * 1.4;
    }, { gain: g, pan: -0.1 });
  },
  /** the scale bar drawing itself */
  whoosh(t, g = 0.10, dur = 0.9) {
    let n = noiseGen();
    const f = lp(3800);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      return f(n()) * Math.sin(Math.PI * p) * 0.7;
    }, { gain: g, pan: 0.24 });
  },
  /** the violent swap: a hit whose tail falls apart */
  rupture(t, g = 0.30) {
    let n = noiseGen();
    addTone(sfx, t, 2.2, (x) => {
      const f = 180 * Math.exp(-x * 2.4) + 40;
      return Math.sin(TAU * f * x) * Math.exp(-x * 1.6) * 0.9 + n() * Math.exp(-x * 8) * 0.3;
    }, { gain: g });
    addTone(sfx, t + 0.02, 1.4, (x) => Math.sin(TAU * 82.4 * x) * Math.exp(-x * 2.0) * 0.6, { gain: g * 0.6 });
  },
};

function renderSFX() {
  const S = (i) => tl.scenes[i];
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.riser(sc.start - 0.8, 0.08, 0.8);
    SFX.impact(sc.start, 0.14);
  });

  // 01 the star, measured, then gone
  const s1 = S(0);
  SFX.hum(s1.start + 0.2, 0.07, 3.4, 58);
  SFX.collapse(s1.start + 3.5, 0.26, 2.0);
  SFX.chime(s1.start + 6.0, 0.05);

  // 02 eight minutes of light still in the air
  const s2 = S(1);
  SFX.clock(s2.start + 0.6, 0.06, 0.415, 20, 1500);
  SFX.swell(s2.start + 4.2, 0.05, 3.0);
  SFX.blip(s2.start + 8.0, 0.07, 520);

  // 03 the equation on paper
  const s3 = S(2);
  SFX.impact(s3.start + 0.95, 0.10);
  SFX.tick(s3.start + 1.3, 0.05, 1180);
  SFX.tick(s3.start + 2.5, 0.05, 1560);
  SFX.chime(s3.start + 3.4, 0.06);
  SFX.hum(s3.start + 0.4, 0.05, 5.0, 65.4);

  // 04 the orbit, and a scale bar that says "one pixel"
  const s4 = S(3);
  SFX.whoosh(s4.start + 1.2, 0.09, 0.8);
  SFX.tick(s4.start + 1.25, 0.06, 980);
  SFX.tick(s4.start + 1.9, 0.05, 1320);
  SFX.hum(s4.start + 0.3, 0.05, 5.0, 55);

  // 05 the curve going down
  const s5 = S(4);
  SFX.fall(s5.start + 0.4, 0.12, 4.4, 380);
  SFX.blip(s5.start + 1.6, 0.08, 300);
  SFX.tick(s5.start + 2.4, 0.05, 700);
  SFX.hum(s5.start + 3.0, 0.05, 3.0, 46);

  // 06 the sea stopping
  const s6 = S(5);
  SFX.wind(s6.start + 0.3, 0.11, 5.0);
  SFX.crack(s6.start + 1.4, 0.14);
  SFX.crack(s6.start + 3.0, 0.10, 1.2);
  SFX.crack(s6.start + 5.2, 0.08, 1.0);
  SFX.hum(s6.start + 0.2, 0.05, 6.0, 49);

  // 07 myth against fact
  const s7 = S(6);
  SFX.hum(s7.start + 0.4, 0.06, 1.6, 52);
  SFX.impact(s7.start + 1.5, 0.10);
  SFX.chime(s7.start + 2.1, 0.07);
  SFX.tick(s7.start + 3.3, 0.05, 1240);

  // 08 the size swap
  const s8 = S(7);
  SFX.riser(s8.start + 0.5, 0.14, 1.3);
  SFX.rupture(s8.start + 1.1, 0.24);
  SFX.clock(s8.start + 1.6, 0.05, 0.30, 10, 1900);
  SFX.hum(s8.start + 0.3, 0.06, 7.0, 44);

  // 09 the horizon
  const s9 = S(8);
  SFX.swell(s9.start + 0.6, 0.10, 4.4);
  SFX.chime(s9.start + 2.2, 0.06);
  SFX.hum(s9.start + 0.4, 0.06, 8.0, 52);
  SFX.wind(s9.start + 5.0, 0.05, 4.0);
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
  // duck the bed under the voice, with a slow release so it never pumps
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
      out[ch][i] = vo[ch][i] * 1.0 + music[ch][i] * 0.42 * duck + sfx[ch][i] * 0.62;
    }
  }

  // 28 Hz highpass: removes DC and sub-rumble without touching the voice
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

  // peak normalise, then a gentle soft-knee limiter on the last 3 dB
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

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep10.wav');
  write(out, file);
  console.log(`mix-ep10.wav  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
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
