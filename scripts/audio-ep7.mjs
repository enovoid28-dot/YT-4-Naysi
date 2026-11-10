/**
 * Episode 7 soundtrack — "Jakarta Tidak Tenggelam, Tapi Ambles".
 * Same procedural engine, rebuilt around water and concrete: a slow minor bed,
 * drips, a pump that will not stop, waves against a wall, and a low rumble for
 * the ground going down. Writes assets/audio/mix-ep7.wav.
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

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const CHORDS = [
  [110.0, 130.81, 164.81, 220.0], // Am
  [87.31, 110.0, 130.81, 174.61], // F
  [98.0, 123.47, 146.83, 196.0], // G
  [73.42, 110.0, 146.83, 220.0], // Dm/A
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
  /** liquid pouring into glass. */
  pour(t, g = 0.2, dur = 1.6) {
    let n = noiseGen();
    const f = lp(4200);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.min(1, x / 0.18) * Math.min(1, (dur - x) / 0.3);
      const bub = 1 + 0.5 * Math.sin(TAU * (7 + 4 * Math.sin(x * 3.1)) * x);
      return f(n()) * env * bub * (0.6 + 0.4 * p);
    }, { gain: g, pan: -0.15 });
  },
  /** liquid draining out of the same glass. */
  drain(t, g = 0.2, dur = 1.4) {
    let n = noiseGen();
    const f = lp(2600);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.min(1, x / 0.12) * Math.min(1, (dur - x) / 0.35);
      return f(n()) * env * (1 - 0.7 * p) * (0.7 + 0.3 * Math.sin(TAU * 9 * x));
    }, { gain: g, pan: 0.2 });
  },
  /** hands sweeping backwards across a dial. */
  sweep(t, g = 0.24, dur = 0.8) {
    let n = noiseGen();
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const f = 900 - 620 * p;
      const env = Math.sin(Math.PI * p);
      return (n() * 0.35 + Math.sin(TAU * f * x) * 0.3) * env;
    }, { gain: g, pan: 0.25 });
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
  /** one drop into standing water. */
  drip(t, g = 0.2, f = 1180) {
    addTone(sfx, t, 0.3, (x) => {
      const ff = f * (1 + 0.9 * Math.exp(-x * 90));
      return Math.sin(TAU * ff * x) * Math.exp(-x * 26);
    }, { gain: g, pan: -0.12 });
  },
  /** deep borehole pump: a motor you can feel through the floor. */
  pump(t, g = 0.22, dur = 5.0) {
    addTone(sfx, t, dur, (x) => {
      const env = Math.min(1, x / 0.7) * Math.min(1, (dur - x) / 1.0);
      const wob = 1 + Math.sin(TAU * 0.7 * x) * 0.01;
      const v = Math.sin(TAU * 48 * x * wob) * 0.55
        + Math.sin(TAU * 96 * x * wob) * 0.3
        + Math.sin(TAU * 193 * x) * 0.10;
      const chug = 0.75 + 0.25 * Math.sin(TAU * 4.5 * x);
      return v * env * chug;
    }, { gain: g, pan: 0.1 });
    let n = noiseGen();
    addTone(sfx, t, dur, (x) => {
      const env = Math.min(1, x / 0.9) * Math.min(1, (dur - x) / 1.2);
      return n() * 0.22 * env;
    }, { gain: g, pan: 0.1 });
  },
  /** water arriving and leaving, over sand. */
  tide(t, g = 0.24, dur = 3.4) {
    let n = noiseGen();
    const f = lp(1500);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.sin(Math.PI * p);
      const wash = 0.55 + 0.45 * Math.sin(TAU * 0.55 * x + 1.2);
      return f(n()) * env * wash * 1.6;
    }, { gain: g, pan: -0.25 });
  },
  /** the ground itself, giving way. */
  rumble(t, g = 0.35, dur = 3.0) {
    let n = noiseGen();
    const f = lp(120);
    addTone(sfx, t, dur, (x) => {
      const p = clamp(x / dur);
      const env = Math.min(1, x / 0.5) * Math.min(1, (dur - x) / 1.0);
      return f(n()) * env * 3.2 + Math.sin(TAU * 31 * x) * env * 0.18;
    }, { gain: g, pan: 0.0 });
  },
  /** concrete: a heavy slab landing. */
  slab(t, g = 0.4) {
    addTone(sfx, t, 1.2, (x) => {
      const f = 74 * Math.exp(-x * 10) + 40;
      return Math.sin(TAU * f * x) * Math.exp(-x * 5);
    }, { gain: g });
    let n = noiseGen();
    addTone(sfx, t, 0.7, (x) => n() * Math.exp(-x * 12) * 0.5, { gain: g, pan: -0.2 });
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

  // cuts: a wash into each scene, a felt thud on the landing
  tl.scenes.forEach((sc, i) => {
    if (i === 0) return;
    SFX.riser(sc.start - 0.8, 0.15, 0.8);
    SFX.impact(sc.start, 0.26);
    SFX.tide(sc.start - 0.2, 0.10, 1.2);
  });

  // 01 JAKARTA UTARA — the bay at dusk, then the stamp that says it out loud
  const s1 = S(0);
  SFX.tide(s1.start + 0.1, 0.18, 4.2);
  const d1 = [0.9, 2.3, 3.9, 5.4];
  d1.forEach((d, i) => SFX.drip(s1.start + d, 0.10, 980 + i * 90));
  SFX.swell(s1.start + 2.0, 0.09, 3.0);
  SFX.stamp(s1.start + 6.2, 0.34);

  // 02 DUA PULUH LIMA — the tape runs out, then the slice comes off the bottom
  const s2 = S(1);
  SFX.sweep(s2.start + 0.5, 0.18, 0.9);
  for (let k = 0; k < 5; k++) SFX.tick(s2.start + 1.3 + k * 0.42, 0.07, 1500 - k * 50);
  SFX.paper(s2.start + 0.2, 0.16);
  SFX.slab(s2.start + 3.1, 0.26);
  SFX.blip(s2.start + 8.4, 0.10, 420);

  // 03 SUMBERNYA — a pump starts up behind the house and does not stop
  const s3 = S(2);
  SFX.rumble(s3.start + 0.2, 0.16, 2.0);
  SFX.pump(s3.start + 2.8, 0.20, 7.6);
  const d3 = [3.6, 5.1, 6.4, 7.8, 9.2, 10.4];
  d3.forEach((d, i) => SFX.drip(s3.start + d, 0.07, 760 + (i % 3) * 120));
  SFX.blip(s3.start + 4.4, 0.11, 520);

  // 04 BANDINGKAN — one small tick, one long fall, then the ratio
  const s4 = S(3);
  SFX.blip(s4.start + 1.4, 0.10, 1320);
  SFX.rumble(s4.start + 3.4, 0.24, 2.6);
  SFX.thud(s4.start + 4.4, 0.20);
  SFX.riser(s4.start + 5.2, 0.16, 0.8);
  SFX.stamp(s4.start + 6.0, 0.30);
  SFX.tide(s4.start + 8.6, 0.10, 2.4);

  // 05 MANGKUK — water finds the middle
  const s5 = S(4);
  SFX.tide(s5.start + 0.4, 0.20, 3.6);
  SFX.blip(s5.start + 3.3, 0.12, 380);
  SFX.rumble(s5.start + 2.6, 0.18, 2.4);
  const d5 = [6.4, 7.2, 8.1, 9.0];
  d5.forEach((d, i) => SFX.drip(s5.start + d, 0.07, 700 + i * 110));

  // 06 TEMBOK — a slab of concrete, the sea against it, and the wall going up
  const s6 = S(5);
  SFX.slab(s6.start + 0.3, 0.36);
  SFX.tide(s6.start + 0.8, 0.18, 4.4);
  for (let k = 0; k < 3; k++) SFX.tick(s6.start + 3.7 + k * 0.5, 0.08, 1600 + k * 120);
  SFX.blip(s6.start + 6.4, 0.11, 300);
  SFX.rumble(s6.start + 8.4, 0.26, 2.6);

  // 07 2050 — the water arrives over the rooftops
  const s7 = S(6);
  SFX.tide(s7.start + 0.9, 0.22, 4.0);
  SFX.rumble(s7.start + 0.2, 0.20, 2.2);
  SFX.riser(s7.start + 2.8, 0.16, 0.9);
  SFX.stamp(s7.start + 3.6, 0.28);
  SFX.paper(s7.start + 6.4, 0.14);
  SFX.swell(s7.start + 7.4, 0.10, 2.4);

  // 08 KELUAR — the tap, the valve closing, then the line
  const s8 = S(7);
  SFX.pour(s8.start + 0.4, 0.15, 2.4);
  [1.4, 2.6, 3.8, 5.0].forEach((d, i) => SFX.drip(s8.start + d, 0.08, 1100 + i * 70));
  SFX.thud(s8.start + 1.6, 0.18);
  SFX.slab(s8.start + 2.2, 0.20);
  SFX.riser(s8.start + 6.6, 0.12, 0.8);
  SFX.swell(s8.start + 7.4, 0.14, 3.4);
  SFX.chime(s8.start + 9.0, 0.08);
  SFX.tide(s8.start + 10.0, 0.08, 3.0);
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
  const file = path.join(process.cwd(), 'assets', 'audio', 'mix-ep7.wav');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  console.log(`mix-ep7.wav  ${(N / SR).toFixed(2)}s  peak ${(peak * norm).toFixed(3)}`);
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
