/**
 * Builds the full soundtrack: procedural score, sound design and VO,
 * mixed sample-accurately in Node, written to assets/audio/mix.wav
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildTimeline, readWav } from '../src/timeline.mjs';

const SR = 48000;
const tl = buildTimeline();
const N = Math.ceil((tl.total + 0.5) * SR);

const music = [new Float32Array(N), new Float32Array(N)];
const sfx = [new Float32Array(N), new Float32Array(N)];
const vo = [new Float32Array(N), new Float32Array(N)];

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ------------------------------- synthesis ------------------------------- */

let seed = 12345;
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

const sine = (f, ph = 0) => (t) => Math.sin(TAU * f * t + ph);
const tri = (f) => (t) => {
  const p = (t * f) % 1;
  return 4 * Math.abs(p - 0.5) - 1;
};
const saw = (f) => (t) => 2 * ((t * f) % 1) - 1;

/** one-pole filters applied offline to a mono generator */
const lp = (cut) => {
  let y = 0;
  return (x) => {
    const a = clamp(TAU * cut / SR, 0, 1);
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

const BPM = 92;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CHORDS = [
  [110.0, 130.81, 164.81, 220.0], // Am
  [87.31, 110.0, 130.81, 174.61], // F
  [130.81, 164.81, 196.0, 261.63], // C
  [98.0, 123.47, 146.83, 196.0], // G
];

const totalBars = Math.ceil(tl.total / BAR);
const padBuf = [new Float32Array(N), new Float32Array(N)];
const musicTarget = [new Float32Array(N), new Float32Array(N)];

function renderMusic() {
  for (let bar = 0; bar < totalBars; bar++) {
    const t0 = bar * BAR;
    if (t0 > tl.total + 1) break;
    const chord = CHORDS[bar % CHORDS.length];
    const full = bar >= 3;
    // pad
    addTone(padBuf, t0, BAR * 1.08, (t) => {
      const att = clamp(t / 0.9);
      const rel = clamp((BAR * 1.08 - t) / 1.1);
      let v = 0;
      chord.forEach((f, i) => {
        const amp = i === 0 ? 0.5 : 0.28;
        v += amp * Math.sin(TAU * f * t + Math.sin(t * 0.7 + i) * 0.4);
        v += amp * 0.35 * Math.sin(TAU * f * 2.002 * t);
      });
      return (v / 4) * att * rel * 0.5;
    }, { gain: 0.34 });

    // sub pulses on 8ths
    for (let b = 0; b < 8; b++) {
      const bt = t0 + b * (BEAT / 2);
      if (bt > tl.total) break;
      const f = chord[0] / 2;
      addTone(musicTarget, bt, 0.5, (t) => {
        const e = Math.exp(-t * 7) * clamp(t / 0.01);
        return Math.sin(TAU * f * t) * e * 0.5;
      }, { gain: 0.2 });
    }

    if (full) {
      // kick on 1 and 3
      [0, 2].forEach((b) => {
        addTone(musicTarget, t0 + b * BEAT, 0.34, (t) => {
          const f = 110 * Math.exp(-t * 26) + 42;
          return Math.sin(TAU * f * t) * Math.exp(-t * 11) * 0.9;
        }, { gain: 0.3 });
      });
      // hats on the off-beats
      [1, 3, 5, 7].forEach((b) => {
        let n = noiseGen();
        addTone(musicTarget, t0 + b * (BEAT / 2), 0.12, (t) => {
          const v = n() * Math.exp(-t * 55);
          return v * 0.5;
        }, { gain: 0.12, pan: b % 4 === 0 ? -0.2 : 0.2 });
      });
      // arp pluck
      for (let b = 0; b < 8; b++) {
        const f = chord[b % chord.length] * 2;
        addTone(musicTarget, t0 + b * (BEAT / 2), 0.6, (t) => {
          const e = Math.exp(-t * 9);
          return (tri(f)(t) * 0.5 + Math.sin(TAU * f * t) * 0.5) * e;
        }, { gain: 0.055, pan: b % 2 ? 0.28 : -0.28 });
      }
    }
  }

  // gentle filtering + stereo width on pad
  for (let ch = 0; ch < 2; ch++) {
    let f = lp(2600);
    for (let i = 0; i < N; i++) {
      const v = padBuf[ch][i];
      music[ch][i] += f(v) + musicTarget[ch][i] * 0.9;
    }
  }
  // fade in / out
  const fadeIn = 2.2 * SR;
  const fadeOut = 3.2 * SR;
  for (let i = 0; i < N; i++) {
    const g = Math.min(clamp(i / fadeIn), clamp((N - i) / fadeOut));
    music[0][i] *= g;
    music[1][i] *= g;
  }
}

/* --------------------------------- sfx ---------------------------------- */

const SFX = {
  impact(t, g = 0.7) {
    let n = noiseGen();
    addTone(sfx, t, 2.2, (x) => {
      const f = 160 * Math.exp(-x * 8) + 32;
      return Math.sin(TAU * f * x) * Math.exp(-x * 2.4) * 0.9 + n() * Math.exp(-x * 16) * 0.35;
    }, { gain: g });
  },
  riser(t, g = 0.4, dur = 1.2) {
    let n = noiseGen();
    addTone(sfx, t, dur, (x) => {
      const p = x / dur;
      const v = n() * p * p;
      const f = 300 + 1400 * p * p;
      return v * 0.6 + Math.sin(TAU * f * x) * 0.25 * p;
    }, { gain: g, pan: 0 });
  },
  swish(t, g = 0.35, dur = 0.45) {
    let n = noiseGen();
    addTone(sfx, t, dur, (x) => {
      const p = x / dur;
      return n() * Math.sin(Math.PI * p) * 0.8;
    }, { gain: g, pan: 0.3 });
  },
  blip(t, g = 0.3, f = 880) {
    addTone(sfx, t, 0.22, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 22), { gain: g, pan: -0.1 });
    addTone(sfx, t, 0.22, (x) => Math.sin(TAU * f * 2 * x) * Math.exp(-x * 30) * 0.4, { gain: g, pan: 0.1 });
  },
  stamp(t, g = 0.65) {
    let n = noiseGen();
    addTone(sfx, t, 0.9, (x) => {
      const f = 120 * Math.exp(-x * 22) + 48;
      return Math.sin(TAU * f * x) * Math.exp(-x * 8) * 0.7 + n() * Math.exp(-x * 30) * 0.5;
    }, { gain: g });
  },
  explosion(t, g = 0.9) {
    let n = noiseGen();
    addTone(sfx, t, 4.0, (x) => {
      const f = 90 * Math.exp(-x * 4) + 28;
      const sub = Math.sin(TAU * f * x) * Math.exp(-x * 1.6);
      const crack = n() * Math.exp(-x * 2.2) * 0.9;
      const tail = n() * Math.exp(-x * 0.8) * 0.22;
      return sub * 0.8 + crack + tail;
    }, { gain: g });
    let n2 = noiseGen();
    addTone(sfx, t, 0.4, (x) => n2() * Math.exp(-x * 18) * 0.9, { gain: g * 0.6, pan: 0.4 });
  },
  paper(t, g = 0.3) {
    let n = noiseGen();
    addTone(sfx, t, 0.5, (x) => n() * Math.exp(-x * 12) * Math.sin(Math.PI * clamp(x / 0.5)), { gain: g, pan: -0.2 });
  },
  chime(t, g = 0.28) {
    [1318.5, 1975.5, 2637].forEach((f, i) =>
      addTone(sfx, t + i * 0.02, 1.4, (x) => Math.sin(TAU * f * x) * Math.exp(-x * (3 + i)), { gain: g * (1 - i * 0.25), pan: 0.2 - i * 0.2 }),
    );
  },
  thud(t, g = 0.4) {
    addTone(sfx, t, 0.6, (x) => {
      const f = 90 * Math.exp(-x * 14) + 40;
      return Math.sin(TAU * f * x) * Math.exp(-x * 9);
    }, { gain: g });
    let n = noiseGen();
    addTone(sfx, t, 0.18, (x) => n() * Math.exp(-x * 40) * 0.4, { gain: g });
  },
  flyby(t, g = 0.35) {
    let n = noiseGen();
    addTone(sfx, t, 3.4, (x) => {
      const p = x / 3.4;
      const amt = Math.sin(Math.PI * p);
      const f = 220 + 380 * Math.sin(Math.PI * p);
      return (n() * 0.5 + Math.sin(TAU * f * x) * 0.3) * amt * amt;
    }, { gain: g, pan: -0.5 });
  },
  swell(t, g = 0.3, dur = 2.6) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.sin(Math.PI * p);
      let v = 0;
      [110, 164.81, 220, 329.63].forEach((f, i) => {
        v += Math.sin(TAU * f * x + i) * (i === 0 ? 1 : 0.6);
      });
      return (v / 4) * env;
    }, { gain: g });
  },
  counter(t, g = 0.16) {
    for (let i = 0; i < 7; i++) {
      addTone(sfx, t + i * 0.09, 0.06, (x) => Math.sin(TAU * 1400 * x) * Math.exp(-x * 60), { gain: g, pan: 0.2 });
    }
  },
};

/* ------------------------------- timeline -------------------------------- */

const w = (scene, i, re) => {
  const group = scene.captions[i];
  if (!group) return null;
  if (!re) return group.words[0].start;
  return group.words.find((x) => re.test(x.text))?.start ?? null;
};

function renderSFX() {
  const S = (i) => tl.scenes[i];
  // transitions between scenes
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.riser(sc.start - 0.95, 0.26, 0.95);
    SFX.impact(sc.start, 0.5);
    SFX.swish(sc.start - 0.1, 0.22);
  });

  // s1
  const s1 = S(0);
  [0, 1, 2].forEach((i) => SFX.swish(s1.start + w(s1, i) - 0.34, 0.3));
  const s1stamp = s1.start + w(s1, 3) + 0.42;
  SFX.stamp(s1stamp, 0.55);
  SFX.impact(s1stamp, 0.3);

  // s2
  const s2 = S(1);
  SFX.riser(s2.start + w(s2, 1) - 0.5, 0.24, 0.6);
  SFX.impact(s2.start + w(s2, 1), 0.45);
  SFX.chime(s2.start + w(s2, 2), 0.16);
  SFX.swish(s2.start + w(s2, 3), 0.2);

  // s3
  const s3 = S(2);
  const conflict = w(s3, 2, /Konflik/i) ?? w(s3, 2);
  const seratus = w(s3, 2, /seratus/i) ?? 5;
  const explosion = s3.start + conflict + 0.5;
  SFX.riser(explosion - 0.9, 0.3, 0.9);
  SFX.explosion(explosion, 0.85);
  SFX.counter(s3.start + (w(s3, 2, /seratus/i) ?? 5) - 0.35, 0.12);
  const pumpG = w(s3, 3);
  if (pumpG != null) {
    SFX.blip(s3.start + pumpG + 0.8, 0.22, 740);
  }

  // s4
  const s4 = S(3);
  SFX.flyby(s4.start + 0.2, 0.3);
  SFX.paper(s4.start + w(s4, 1) + 0.05, 0.34);
  const twoWords = w(s4, 1, /dua/i);
  if (twoWords != null) {
    SFX.stamp(s4.start + twoWords + 0.3, 0.5);
    SFX.blip(s4.start + twoWords + 0.3, 0.16, 1040);
  }

  // s5
  const s5 = S(4);
  SFX.paper(s5.start + 0.2, 0.26);
  SFX.swish(s5.start + w(s5, 1) + 0.1, 0.28);
  SFX.paper(s5.start + w(s5, 1) + 0.45, 0.34);
  SFX.chime(s5.start + w(s5, 1) + 0.9, 0.14);
  SFX.blip(s5.start + w(s5, 2) + 0.3, 0.16, 620);
  SFX.thud(s5.start + w(s5, 3) + 0.15, 0.24);

  // s6
  const s6 = S(5);
  SFX.thud(s6.start + w(s6, 0) + 0.35, 0.3);
  SFX.thud(s6.start + w(s6, 0) + 0.75, 0.26);
  const empat = w(s6, 0, /empat/i);
  if (empat != null) SFX.blip(s6.start + empat + 0.3, 0.2, 520);

  // s7
  const s7 = S(6);
  SFX.swell(s7.start + 0.1, 0.22, 3.2);
  SFX.swish(s7.start + w(s7, 1), 0.34, 0.6);
  SFX.thud(s7.start + w(s7, 1) + 0.1, 0.26);
  SFX.chime(s7.start + w(s7, 2), 0.12);
  SFX.swell(s7.start + w(s7, 3) - 0.2, 0.26, 3.4);
  SFX.blip(s7.start + w(s7, 3) + 0.6, 0.12, 990);
}

/* ------------------------------- VO load --------------------------------- */

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

function mix() {
  // ducking envelope from VO
  const block = Math.floor(SR * 0.01);
  const env = new Float32Array(Math.ceil(N / block) + 2);
  for (let b = 0; b < env.length; b++) {
    let peak = 0;
    for (let i = b * block; i < Math.min(N, (b + 1) * block); i++) {
      peak = Math.max(peak, Math.abs(vo[0][i]), Math.abs(vo[1][i]));
    }
    env[b] = peak;
  }
  // attack / release smoothing
  const smooth = new Float32Array(env.length);
  let v = 0;
  for (let b = 0; b < env.length; b++) {
    const target = clamp(env[b] * 4);
    v += (target - v) * (target > v ? 0.5 : 0.06);
    smooth[b] = v;
  }

  const outL = new Float32Array(N);
  const outR = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const duck = 1 - 0.62 * smooth[Math.floor(i / block)];
    outL[i] = vo[0][i] * 1.0 + music[0][i] * 0.5 * duck + sfx[0][i] * 0.85;
    outR[i] = vo[1][i] * 1.0 + music[1][i] * 0.5 * duck + sfx[1][i] * 0.85;
  }

  // gentle bus compression + soft clip + normalise
  let peak = 0;
  for (let i = 0; i < N; i++) {
    outL[i] = Math.tanh(outL[i] * 1.15);
    outR[i] = Math.tanh(outR[i] * 1.15);
    peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
  }
  const norm = peak > 0 ? 0.89 / peak : 1;

  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + N * 4, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(clamp(outL[i] * norm, -1, 1) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(clamp(outR[i] * norm, -1, 1) * 32767), 46 + i * 4);
  }
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix.wav');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  console.log(`mix.wav  ${(N / SR).toFixed(2)}s  peak ${(peak * norm).toFixed(3)}`);
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
