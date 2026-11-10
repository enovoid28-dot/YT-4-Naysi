/**
 * Episode 7 soundtrack — "Jakarta Tidak Tenggelam, Tapi Ambles".
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

const BPM = 70;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CHORDS = [
  [110.0, 138.59, 164.81, 220.0], // Am
  [87.31, 130.81, 174.61, 220.0], // F
  [98.0, 123.47, 146.83, 196.0], // G
  [73.42, 110.0, 146.83, 220.0], // Dm
];

const totalBars = Math.ceil(tl.total / BAR);

function renderMusic() {
  const pad = [new Float32Array(N), new Float32Array(N)];
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    if (t0 > tl.total + 1) break;
    const chord = CHORDS[bar % CHORDS.length];
    const full = bar >= 2;
    addTone(pad, t0, BAR * 1.06, (t) => {
      const att = clamp(t / 1.1);
      const rel = clamp((BAR * 1.06 - t) / 1.3);
      let v = 0;
      chord.forEach((f, i) => {
        v += (i === 0 ? 0.5 : 0.26) * Math.sin(TAU * f * t + Math.sin(t * 0.5 + i) * 0.3);
      });
      return (v / 4) * att * rel * 0.55;
    }, { gain: 0.30 });

    // a heartbeat under the argument, not a rumble
    [0, 2].forEach((b) => {
      addTone(music, t0 + b * BEAT, 0.42, (t) => {
        const f = 96 * Math.exp(-t * 18) + 62;
        return Math.sin(TAU * f * t) * Math.exp(-t * 9);
      }, { gain: full ? 0.16 : 0.09 });
    });

    if (full) {
      // soft pluck on the off-beats, high enough to stay clear of the voice
      for (let b = 0; b < 8; b += 2) {
        const f = chord[(b / 2) % chord.length] * 4;
        addTone(music, t0 + b * (BEAT / 2), 0.5, (t) => {
          const e = Math.exp(-t * 10);
          return (tri(f)(t) * 0.4 + Math.sin(TAU * f * t) * 0.6) * e;
        }, { gain: 0.05, pan: b % 4 ? 0.25 : -0.25 });
      }
      // brushed noise, very quiet
      for (let b = 1; b < 8; b += 2) {
        let n = noiseGen();
        addTone(music, t0 + b * (BEAT / 2), 0.09, (t) => n() * Math.exp(-t * 60) * 0.4, {
          gain: 0.05, pan: b % 4 === 1 ? -0.2 : 0.2,
        });
      }
    }
  }
  for (let ch = 0; ch < 2; ch++) {
    const f = lp(2400);
    for (let i = 0; i < N; i++) music[ch][i] += f(pad[ch][i]);
  }
  const fadeIn = 2.0 * SR;
  const fadeOut = 2.6 * SR;
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
  /** one drop landing in water */
  drip(t, g = 0.16, f = 1150) {
    addTone(sfx, t, 0.26, (x) => {
      const ff = f * (1 + 0.8 * Math.exp(-x * 80));
      return Math.sin(TAU * ff * x) * Math.exp(-x * 30);
    }, { gain: g, pan: -0.15 });
  },
  /** water arriving over sand — kept above 300 Hz so it never muddies the VO */
  tide(t, g = 0.2, dur = 3.2) {
    let n = noiseGen();
    const f = lp(2400);
    const hp = (x) => x;
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.sin(Math.PI * p);
      const wash = 0.55 + 0.45 * Math.sin(TAU * 0.5 * x + 1.1);
      return hp(f(n())) * env * wash * 1.7;
    }, { gain: g, pan: -0.28 });
  },
  /** the borehole pump, heard through a wall: a mid whirr, no low hum */
  pump(t, g = 0.16, dur = 5.0) {
    addTone(sfx, t, dur, (x) => {
      const env = Math.min(1, x / 0.7) * Math.min(1, (dur - x) / 0.9);
      const wob = 1 + Math.sin(TAU * 0.6 * x) * 0.008;
      const v = Math.sin(TAU * 148 * x * wob) * 0.5 + Math.sin(TAU * 296 * x) * 0.22
        + Math.sin(TAU * 444 * x) * 0.10;
      const chug = 0.8 + 0.2 * Math.sin(TAU * 5.2 * x);
      return v * env * chug;
    }, { gain: g, pan: 0.15 });
    let n = noiseGen();
    addTone(sfx, t, dur, (x) => {
      const env = Math.min(1, x / 0.8) * Math.min(1, (dur - x) / 1.0);
      return n() * 0.10 * env;
    }, { gain: g, pan: 0.15 });
  },
  /** ground giving way: filtered noise 90 Hz+, no sub */
  rumble(t, g = 0.22, dur = 2.6) {
    let n = noiseGen();
    const f = lp(180);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.min(1, x / 0.5) * Math.min(1, (dur - x) / 0.9);
      return f(n()) * env * 2.4;
    }, { gain: g });
  },
  slab(t, g = 0.34) {
    addTone(sfx, t, 1.0, (x) => {
      const f = 96 * Math.exp(-x * 12) + 52;
      return Math.sin(TAU * f * x) * Math.exp(-x * 6);
    }, { gain: g });
    let n = noiseGen();
    addTone(sfx, t, 0.6, (x) => n() * Math.exp(-x * 16) * 0.4, { gain: g, pan: -0.2 });
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
  pour(t, g = 0.16, dur = 2.2) {
    let n = noiseGen();
    const f = lp(4200);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.min(1, x / 0.2) * Math.min(1, (dur - x) / 0.3);
      const bub = 1 + 0.4 * Math.sin(TAU * (8 + 3 * Math.sin(x * 3)) * x);
      return f(n()) * env * bub * (0.6 + 0.4 * p);
    }, { gain: g, pan: -0.2 });
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
};

function renderSFX() {
  const S = (i) => tl.scenes[i];
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.riser(sc.start - 0.75, 0.12, 0.75);
    SFX.impact(sc.start, 0.22);
  });

  // 01 the bay, then the claim
  const s1 = S(0);
  SFX.tide(s1.start + 0.1, 0.16, 4.0);
  [1.0, 2.4, 3.8].forEach((d, i) => SFX.drip(s1.start + d, 0.07, 950 + i * 90));
  SFX.swell(s1.start + 1.4, 0.09, 2.8);
  SFX.slab(s1.start + 5.0, 0.20);

  // 02 the tape, the ticks, the slice
  const s2 = S(1);
  for (let k = 0; k < 5; k++) SFX.tick(s2.start + 1.2 + k * 0.4, 0.06, 1500 - k * 40);
  SFX.slab(s2.start + 3.1, 0.22);
  SFX.blip(s2.start + 4.6, 0.09, 430);
  SFX.chime(s2.start + 6.4, 0.07);

  // 03 the pump starts and does not stop
  const s3 = S(2);
  SFX.rumble(s3.start + 0.3, 0.12, 1.8);
  SFX.pump(s3.start + 5.4, 0.15, 6.6);
  [6.2, 7.4, 8.6, 9.8, 10.8].forEach((d, i) => SFX.drip(s3.start + d, 0.05, 800 + (i % 3) * 110));
  SFX.blip(s3.start + 8.8, 0.09, 520);

  // 04 the sea is a hairline, the ground is a cliff
  const s4 = S(3);
  SFX.blip(s4.start + 1.4, 0.08, 1320);
  SFX.rumble(s4.start + 2.8, 0.16, 2.2);
  SFX.slab(s4.start + 4.0, 0.18);
  SFX.riser(s4.start + 5.0, 0.12, 0.7);
  SFX.slab(s4.start + 5.6, 0.24);

  // 05 the bowl fills
  const s5 = S(4);
  SFX.tide(s5.start + 0.4, 0.17, 3.4);
  SFX.blip(s5.start + 1.1, 0.09, 380);
  SFX.rumble(s5.start + 2.2, 0.12, 1.8);
  [3.4, 4.2, 5.0].forEach((d, i) => SFX.drip(s5.start + d, 0.05, 700 + i * 120));

  // 06 the wall, the sea against it, the ground going down
  const s6 = S(5);
  SFX.slab(s6.start + 0.3, 0.3);
  SFX.tide(s6.start + 0.9, 0.15, 4.0);
  [3.5, 4.0, 4.5].forEach((d, i) => SFX.tick(s6.start + d, 0.07, 1500 + i * 130));
  SFX.rumble(s6.start + 6.2, 0.18, 2.2);

  // 07 the water arrives
  const s7 = S(6);
  SFX.tide(s7.start + 0.6, 0.18, 4.2);
  SFX.rumble(s7.start + 0.2, 0.12, 2.0);
  SFX.riser(s7.start + 3.6, 0.10, 0.8);
  SFX.slab(s7.start + 4.2, 0.22);
  SFX.swell(s7.start + 7.2, 0.09, 2.2);

  // 08 the tap, the valve, the line
  const s8 = S(7);
  SFX.pour(s8.start + 0.4, 0.13, 2.6);
  [1.4, 2.4, 3.4, 4.4].forEach((d, i) => SFX.drip(s8.start + d, 0.06, 1100 + i * 70));
  SFX.slab(s8.start + 2.0, 0.16);
  SFX.riser(s8.start + 6.8, 0.10, 0.8);
  SFX.swell(s8.start + 7.6, 0.13, 3.2);
  SFX.chime(s8.start + 9.2, 0.07);
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

  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep7.wav');
  write(out, file);
  console.log(`mix-ep7.wav  ${(N / SR).toFixed(2)}s  peak ${(pk * norm).toFixed(3)}`);
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
