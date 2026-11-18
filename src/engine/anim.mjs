export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, v) => clamp((v - a) / (b - a));
export const mix = (a, b, t) => a + (b - a) * t;
export const TAU = Math.PI * 2;

export const EASE = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: (t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  inOutQuint: (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2),
  smooth: (t) => t * t * (3 - 2 * t),
  outBack: (t, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  outBackSoft: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2),
  inBack: (t, s = 1.7) => (s + 1) * t * t * t - s * t * t,
};

/** Progress 0..1 of a track starting at `start`, lasting `dur`. */
export const track = (t, start, dur, ease = EASE.outCubic) => {
  if (dur <= 0) return t >= start ? 1 : 0;
  return ease(clamp((t - start) / dur));
};

/** Values >= start ? 1 : 0 with easing, integer-friendly. */
export const step = (t, start) => (t >= start ? 1 : 0);

/** Analytic step response of a damped spring (0 -> 1). */
export const spring = (t, freq = 13, damp = 0.55) => {
  if (t <= 0) return 0;
  const w = freq;
  const wd = w * Math.sqrt(Math.max(0.0001, 1 - damp * damp));
  const e = Math.exp(-damp * w * t);
  return 1 - e * (Math.cos(wd * t) + ((damp * w) / wd) * Math.sin(wd * t));
};

/** Springy overshoot used for pops, scaled to `amount`. */
export const pop = (t, start, dur = 0.6, amount = 1.12) => {
  const p = clamp((t - start) / dur);
  return lerp(1, 1 - amount * 0.4, 0) * (1 + (spring(p * 1.4, 11, 0.42) - 1) * (amount - 1) * 6);
};

/** Seeded PRNG (mulberry32). */
export const rng = (seed = 1) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Smooth pseudo-noise in 1D, period `p`. */
export const noise1 = (x, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const h = (n) => {
    const s = Math.sin((n + seed * 13.37) * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
};

/** Looping drift helper: sin wave with phase offset in turns. */
export const wave = (t, hz = 1, phase = 0) => Math.sin((t * hz + phase) * TAU);

/** Decaying flicker for neon / LED looks. */
export const flicker = (t, seed = 0) => {
  const n = noise1(t * 24, seed);
  return 0.82 + 0.18 * n;
};

export const pad2 = (n) => String(Math.floor(n)).padStart(2, '0');
