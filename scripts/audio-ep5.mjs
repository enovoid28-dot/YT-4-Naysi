/**
 * Episode 5 soundtrack. Same engine as episode 4 (procedural score, sound
 * design, VO mixed sample-accurately in Node) but a slower, warmer bed and
 * cues written against the fridge / lab-slip / receipt beats.
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

const BPM = 84;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CHORDS = [
  [146.83, 174.61, 220.0, 293.66], // Dm
  [116.54, 146.83, 174.61, 233.08], // Bb
  [174.61, 220.0, 261.63, 349.23], // F
  [98.0, 116.54, 146.83, 196.0], // Gm
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
  /** fridge compressor + door seal: a low hum that breathes. */
  hum(t, g = 0.3, dur = 4.0) {
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.min(1, x / 0.5) * Math.min(1, (dur - x) / 0.8);
      const wob = 1 + Math.sin(TAU * 0.23 * x) * 0.006;
      const v = Math.sin(TAU * 55 * x * wob) * 0.6
        + Math.sin(TAU * 110 * x * wob) * 0.25
        + Math.sin(TAU * 165.5 * x) * 0.08;
      return v * env * (0.9 + 0.1 * Math.sin(TAU * 3.1 * x)) * (0.6 + 0.4 * p);
    }, { gain: g, pan: 0 });
  },
  /** thermal printer chatter for the receipt beat. */
  printer(t, n = 18, g = 0.12) {
    for (let i = 0; i < n; i++) {
      const at = t + i * 0.058 + (i % 3) * 0.006;
      addTone(sfx, at, 0.05, (x) => Math.sin(TAU * (2100 + (i % 5) * 260) * x) * Math.exp(-x * 90), {
        gain: g * (0.7 + ((i * 7) % 5) * 0.06), pan: (i % 2 ? 0.18 : -0.18),
      });
    }
  },
  /** single dry tick (a printed line landing). */
  tick(t, g = 0.1, f = 1600) {
    addTone(sfx, t, 0.05, (x) => Math.sin(TAU * f * x) * Math.exp(-x * 80), { gain: g, pan: 0.1 });
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
  alarm(t, g = 0.5) {
    [0, 0.17, 0.34].forEach((d, i) => {
      addTone(sfx, t + d, 0.14, (x) => {
        const e = Math.min(1, x / 0.004) * Math.exp(-x * 24);
        return (Math.sin(TAU * 1180 * x) * 0.6 + Math.sin(TAU * 1770 * x) * 0.38) * e;
      }, { gain: g * (i === 0 ? 1 : 0.78) });
    });
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

  // transitions: soft riser into each cut, then a felt impact
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.riser(sc.start - 0.9, 0.2, 0.9);
    SFX.impact(sc.start, 0.36);
    SFX.swish(sc.start - 0.08, 0.16);
  });

  // 01 KULKAS — hum, door, cold air, the word "lapar"
  const s1 = S(0);
  SFX.hum(s1.start + 0.35, 0.26, 6.4);
  SFX.swish(s1.start + 0.9, 0.24, 0.5);
  SFX.blip(s1.start + 1.35, 0.09, 300);
  SFX.hum(s1.start + 7.2, 0.16, 4.2);
  SFX.thud(s1.start + 8.6, 0.2);
  SFX.swell(s1.start + 10.6, 0.1, 2.6);

  // 02 SALAH TUDUH — the strike, then the replacement word
  const s2 = S(1);
  SFX.swish(s2.start + 3.05, 0.22, 0.35);
  SFX.thud(s2.start + 3.5, 0.24);
  SFX.blip(s2.start + 5.0, 0.12, 620);
  SFX.chime(s2.start + 7.4, 0.09);

  // 03 HORMON — paper, the lab stamp, three values landing
  const s3 = S(2);
  SFX.paper(s3.start + 0.3, 0.22);
  SFX.stamp(s3.start + 1.0, 0.3);
  SFX.blip(s3.start + 3.05, 0.12, 560);
  SFX.tick(s3.start + 3.6, 0.08, 1400);
  SFX.blip(s3.start + 8.25, 0.11, 440);
  SFX.tick(s3.start + 8.8, 0.08, 900);
  SFX.blip(s3.start + 13.05, 0.12, 700);
  SFX.counter(s3.start + 14.4, 0.06);

  // 04 ANGKA — receipt prints, total stamps, the strike
  const s4 = S(3);
  SFX.printer(s4.start + 2.0, 26, 0.09);
  SFX.tick(s4.start + 4.95, 0.1, 1750);
  SFX.tick(s4.start + 6.3, 0.1, 1750);
  SFX.stamp(s4.start + 7.7, 0.32);
  SFX.thud(s4.start + 10.95, 0.26);
  SFX.paper(s4.start + 13.4, 0.16);

  // 05 OTAK — a rising signal, a peak, two bars
  const s5 = S(4);
  SFX.riser(s5.start + 1.3, 0.14, 2.2);
  SFX.swell(s5.start + 2.3, 0.1, 2.8);
  SFX.blip(s5.start + 5.0, 0.13, 780);
  SFX.blip(s5.start + 5.12, 0.09, 1170);
  SFX.thud(s5.start + 8.45, 0.18);
  SFX.chime(s5.start + 11.6, 0.1);
  SFX.thud(s5.start + 12.45, 0.16);
  SFX.thud(s5.start + 13.0, 0.2);

  // 06 BALIK — sleep goes up, food goes down
  const s6 = S(5);
  SFX.paper(s6.start + 0.3, 0.22);
  SFX.chime(s6.start + 1.45, 0.12);
  SFX.swish(s6.start + 3.25, 0.14, 0.5);
  SFX.blip(s6.start + 4.65, 0.11, 520);
  SFX.counter(s6.start + 5.0, 0.055);
  SFX.stamp(s6.start + 8.6, 0.26);
  SFX.paper(s6.start + 11.2, 0.16);

  // 07 MITOS — the ledger
  const s7 = S(6);
  SFX.thud(s7.start + 3.6, 0.26);
  SFX.thud(s7.start + 6.45, 0.18);
  SFX.riser(s7.start + 9.2, 0.12, 0.8);
  SFX.stamp(s7.start + 9.65, 0.34);
  SFX.stamp(s7.start + 12.4, 0.3);

  // 08 JAMNYA — the answer, then the question
  const s8 = S(7);
  SFX.chime(s8.start + 0.4, 0.11);
  SFX.swell(s8.start + 1.4, 0.1, 2.2);
  SFX.blip(s8.start + 3.4, 0.1, 660);
  SFX.stamp(s8.start + 6.0, 0.26);
  SFX.riser(s8.start + 10.2, 0.1, 0.7);
  SFX.chime(s8.start + 10.6, 0.12);
  SFX.swell(s8.start + 12.4, 0.12, 3.2);
  SFX.chime(s8.start + 15.2, 0.08);
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
