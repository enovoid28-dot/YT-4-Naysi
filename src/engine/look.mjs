// The finishing pass: what turns a clean vector frame into a graded shot.
//
//   bloom       soft-knee highlights at quarter resolution, two blur radii,
//               screened back over the frame (halation on every hot spot)
//   cutFx       the transition kit at every cut: radial zoom blur, lens-style
//               RGB split and a light leak that sweeps across, plus a short
//               white kiss on the cut itself
//   impact      the same chromatic hit, small, for accent words (scenes call
//               hit() and the pass applies the strongest one of the frame)
//   foreground  out-of-focus bokeh, dust motes and embers in front of the
//               scene, chosen by the backdrop the scene reported
//   grade       a gentle split tone: warm highlights, deep cool-teal shadows
//
// Everything is 2D canvas compositing; nothing is loaded from outside.
import { W, H } from './draw.mjs';
import { clamp, rng, TAU } from './anim.mjs';

const S = { ready: false };

/** per-frame state the scenes write into (reset by beginLook) */
export const LOOK = { slate: 0, micro: 0, garden: 0, impact: 0, bloom: 1 };

export function beginLook() {
  LOOK.slate = 0;
  LOOK.micro = 0;
  LOOK.garden = 0;
  LOOK.impact = 0;
  LOOK.bloom = 1;
}

/** a backdrop says it is on screen, with its opacity */
export function reportBg(kind, a = 1) {
  if (a > LOOK[kind]) LOOK[kind] = a;
}

/** an accent hit: decays over `dur` seconds from `at`; returns the strength */
export function hit(t, at, k = 1, dur = 0.32) {
  const d = t - at;
  if (d < -0.02 || d > dur) return 0;
  const e = d < 0 ? 1 : Math.pow(1 - d / dur, 2.2);
  const v = k * e;
  if (v > LOOK.impact) LOOK.impact = v;
  return v;
}

function sprite(createCanvas, size, draw) {
  const cv = createCanvas(size, size);
  draw(cv.getContext('2d'), size / 2);
  return cv;
}

export function initLook({ createCanvas }) {
  S.small = createCanvas(360, 640);
  S.blur = createCanvas(360, 640);
  S.wide = createCanvas(180, 320);
  S.buf = createCanvas(W, H);
  S.tmp = createCanvas(W, H);
  // a lens bokeh disc: flat body, a brighter rim, soft edge
  S.bokeh = sprite(createCanvas, 256, (c, r) => {
    const g = c.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.72, 'rgba(255,255,255,0.62)');
    g.addColorStop(0.86, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.93, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(r, r, r, 0, TAU);
    c.fill();
  });
  // a soft glow dot
  S.dot = sprite(createCanvas, 64, (c, r) => {
    const g = c.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.75)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 2 * r, 2 * r);
  });
  // tinted copies (canvas cannot tint a drawImage, so bake the palette)
  S.tint = {};
  for (const [name, rgb] of Object.entries(PAL)) {
    S.tint[name] = {
      bokeh: tinted(createCanvas, S.bokeh, rgb),
      dot: tinted(createCanvas, S.dot, rgb),
    };
  }
  const r = rng(4242);
  S.motes = Array.from({ length: 70 }, () => ({
    x: r(), y: r(), z: 0.3 + r() * 0.7, ph: r() * TAU, sp: 0.4 + r() * 0.8, s: r(),
  }));
  S.ready = true;
}

const PAL = {
  amber: '255,178,92',
  ember: '255,120,48',
  rose: '255,110,96',
  teal: '96,214,200',
  ice: '150,205,255',
  leaf: '168,226,120',
  sun: '255,214,140',
  white: '255,246,232',
};

function tinted(createCanvas, src, rgb) {
  const cv = createCanvas(src.width, src.height);
  const c = cv.getContext('2d');
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = `rgb(${rgb})`;
  c.fillRect(0, 0, cv.width, cv.height);
  return cv;
}

/* --------------------------------- bloom --------------------------------- */

/**
 * Halation: the frame at quarter size, a soft-knee key on brightness (mostly
 * luminance, a little max channel so saturated embers glow too), a tight and a
 * wide blur, screened back over the frame.
 */
export function bloom(ctx, { th = 0.6, k = 0.5 } = {}) {
  if (!S.ready || k <= 0.01) return;
  const a = S.small.getContext('2d');
  a.globalCompositeOperation = 'copy';
  a.imageSmoothingEnabled = true;
  a.drawImage(ctx.canvas, 0, 0, 360, 640);
  const img = a.getImageData(0, 0, 360, 640);
  const d = img.data;
  const inv = 1 / (1 - th);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const mx = r > g ? (r > b ? r : b) : g > b ? g : b;
    const v = (0.62 * (0.2126 * r + 0.7152 * g + 0.0722 * b) + 0.38 * mx) / 255;
    let w = (v - th) * inv;
    if (w <= 0) {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      continue;
    }
    if (w > 1) w = 1;
    w = w * w * (3 - 2 * w);
    d[i] = r * w;
    d[i + 1] = g * w;
    d[i + 2] = b * w;
  }
  a.putImageData(img, 0, 0);
  const b = S.blur.getContext('2d');
  b.globalCompositeOperation = 'copy';
  b.filter = 'blur(4px)';
  b.drawImage(S.small, 0, 0);
  b.filter = 'none';
  const w = S.wide.getContext('2d');
  w.globalCompositeOperation = 'copy';
  w.filter = 'blur(9px)';
  w.drawImage(S.small, 0, 0, 180, 320);
  w.filter = 'none';
  b.globalCompositeOperation = 'lighter';
  b.globalAlpha = 0.85;
  b.drawImage(S.wide, 0, 0, 360, 640);
  b.globalAlpha = 1;
  b.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = Math.min(1, k);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(S.blur, 0, 0, W, H);
  ctx.restore();
}

/* ------------------------------ cut kit ---------------------------------- */

function snapshot(ctx) {
  const b = S.buf.getContext('2d');
  b.globalCompositeOperation = 'copy';
  b.drawImage(ctx.canvas, 0, 0);
  b.globalCompositeOperation = 'source-over';
}

/** radial zoom blur around (cx, cy): a few scaled copies over the frame */
function zoomBlur(ctx, amt, { cx = W / 2, cy = H * 0.42, n = 3 } = {}) {
  if (amt < 0.003) return;
  snapshot(ctx);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingQuality = 'low';
  for (let i = 1; i <= n; i++) {
    const s = 1 + amt * (i / n);
    ctx.globalAlpha = 0.42 / (i + 0.3);
    ctx.drawImage(S.buf, cx - cx * s, cy - cy * s, W * s, H * s);
  }
  ctx.restore();
}

/**
 * Lens-style chromatic split: red pushed out and right, blue a little out and
 * left, green stays. Channels are separated with multiply masks and summed
 * back with `lighter`, so the frame never loses its alpha.
 */
export function rgbSplit(ctx, px, { scale = 0.012, cy = H * 0.42 } = {}) {
  if (!S.ready || px < 0.6) return;
  snapshot(ctx);
  const tc = S.tmp.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingQuality = 'low';
  const k = px / 16;
  const chans = [
    ['#FF0000', '#00FFFF', px, 1 + scale * k * 1.6],
    ['#0000FF', '#FFFF00', -px * 0.6, 1 + scale * k * 0.8],
  ];
  for (const [mask, keep, dx, s] of chans) {
    tc.globalCompositeOperation = 'copy';
    tc.drawImage(S.buf, 0, 0);
    tc.globalCompositeOperation = 'multiply';
    tc.fillStyle = mask;
    tc.fillRect(0, 0, W, H);
    tc.globalCompositeOperation = 'source-over';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = keep;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const ox = W / 2 - (W / 2) * s + dx;
    const oy = cy - cy * s;
    ctx.drawImage(S.tmp, ox, oy, W * s, H * s);
  }
  ctx.restore();
}

function leak(ctx, k, d, rgb, side) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'screen';
  const u = clamp((d + 0.14) / 0.42);
  const x = side > 0 ? W * (-0.1 + 1.2 * u) : W * (1.1 - 1.2 * u);
  const y = H * (0.3 + 0.12 * u);
  const g = ctx.createRadialGradient(x, y, 0, x, y, 1400);
  g.addColorStop(0, `rgba(${rgb},${0.62 * k})`);
  g.addColorStop(0.35, `rgba(${rgb},${0.22 * k})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // a streak across the frame, like a flare on a lens
  const sg = ctx.createLinearGradient(0, y - 90, 0, y + 90);
  sg.addColorStop(0, `rgba(${rgb},0)`);
  sg.addColorStop(0.5, `rgba(255,240,220,${0.26 * k})`);
  sg.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = sg;
  ctx.fillRect(0, y - 90, W, 180);
  const f = Math.max(0, 1 - Math.abs(d) / 0.06);
  if (f > 0) {
    ctx.fillStyle = `rgba(255,244,228,${0.2 * f * f})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/**
 * Transition at a cut. `d` is the time from the cut in seconds (negative
 * before it). Window: 0.12 s before to 0.26 s after.
 */
export function cutFx(ctx, d, { rgb = '255,170,110', side = 1 } = {}) {
  if (!S.ready) return 0;
  const pre = 0.12;
  const post = 0.26;
  if (d < -pre || d > post) return 0;
  const e = d < 0 ? 1 + d / pre : 1 - d / post;
  const k = e * e * (3 - 2 * e);
  zoomBlur(ctx, 0.085 * k);
  rgbSplit(ctx, 12 * k);
  leak(ctx, k, d, rgb, side);
  return k;
}

/** camera kick on a hit: the frame jolts and punches in a touch, then settles */
export function shake(ctx, t) {
  const k = clamp(LOOK.impact);
  if (!S.ready || k < 0.05) return;
  snapshot(ctx);
  const amp = 12 * k;
  const dx = Math.sin(t * 97.3) * amp;
  const dy = Math.cos(t * 83.1) * amp * 0.8;
  const s = 1 + 0.02 * k;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'copy';
  ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(S.buf, W / 2 - (W * s) / 2 + dx, H / 2 - (H * s) / 2 + dy, W * s, H * s);
  ctx.restore();
}

/** accent hit: whatever the scenes registered with hit() this frame */
export function impactFx(ctx) {
  const k = clamp(LOOK.impact);
  if (k < 0.04) return;
  rgbSplit(ctx, 5 * k, { scale: 0.006 });
}

/* ------------------------------ foreground ------------------------------- */

function bokehField(ctx, t, cam, n, seed, pals, { a = 1, yMax = 1750, size = [70, 210], alpha = [0.035, 0.1], drift = 14 } = {}) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const z = 0.4 + R() * 0.6;
    const pal = S.tint[pals[Math.floor(R() * pals.length)]].bokeh;
    const rad = size[0] + R() * (size[1] - size[0]);
    const x0 = R() * W;
    const y0 = 160 + R() * (yMax - 160);
    const ph = R() * TAU;
    const x = x0 + Math.sin(t * 0.21 * (0.6 + z) + ph) * drift + (cam.dx || 0) * (1.2 + z * 1.4);
    const y = y0 + Math.cos(t * 0.17 * (0.6 + z) + ph * 1.3) * drift * 0.8 + (cam.dy || 0) * (1.2 + z * 1.4);
    const al = a * (alpha[0] + R() * (alpha[1] - alpha[0])) * (0.75 + 0.25 * Math.sin(t * 0.8 + ph));
    if (al < 0.004) continue;
    ctx.globalAlpha = al;
    ctx.drawImage(pal, x - rad, y - rad, rad * 2, rad * 2);
  }
}

function motes(ctx, t, cam, pal, { a = 1, rise = 0, n = 60, yMax = 1760, glint = 0.6 } = {}) {
  const dot = S.tint[pal].dot;
  for (let i = 0; i < Math.min(n, S.motes.length); i++) {
    const m = S.motes[i];
    const life = 9 + m.sp * 6;
    const y = (((m.y * yMax - t * (12 + rise * 60) * m.sp) % yMax) + yMax) % yMax;
    const x = m.x * W + Math.sin(t * 0.5 * m.sp + m.ph) * 26 + (cam.dx || 0) * (0.6 + m.z);
    const tw = 0.5 + 0.5 * Math.sin(t * (1.3 + m.sp * 2) + m.ph * 3);
    const s = 3 + m.z * 7 + (m.s > 0.9 ? 6 : 0);
    const al = a * (0.12 + 0.5 * tw * glint) * m.z * clamp((yMax - y) / 240) * clamp(y / 200);
    if (al < 0.01) continue;
    ctx.globalAlpha = Math.min(1, al);
    ctx.drawImage(dot, x - s, y + (cam.dy || 0) * m.z - s, s * 2, s * 2);
    void life;
  }
}

/** foreground depth by backdrop: called after the scene, before bloom */
export function foreground(ctx, t, cam = {}) {
  if (!S.ready) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'screen';
  if (LOOK.slate > 0.01) {
    const a = LOOK.slate;
    bokehField(ctx, t, cam, 9, 515, ['amber', 'ember', 'rose'], { a, alpha: [0.03, 0.085] });
    motes(ctx, t, cam, 'amber', { a: a * 0.9, rise: 0.25, n: 46 });
    motes(ctx, t + 40, cam, 'ember', { a: a * 0.75, rise: 1.2, n: 18, glint: 1 });
  }
  if (LOOK.micro > 0.01) {
    const a = LOOK.micro;
    bokehField(ctx, t, cam, 10, 733, ['teal', 'ice', 'teal', 'amber'], { a, alpha: [0.03, 0.08], size: [60, 190] });
    motes(ctx, t, cam, 'teal', { a: a * 0.8, rise: 0.08, n: 54, glint: 0.4 });
  }
  if (LOOK.garden > 0.01) {
    const a = LOOK.garden;
    bokehField(ctx, t, cam, 11, 919, ['sun', 'leaf', 'sun', 'amber'], { a, alpha: [0.035, 0.1], size: [60, 200] });
    motes(ctx, t, cam, 'sun', { a: a * 0.9, rise: 0.15, n: 50, glint: 0.9 });
  }
  ctx.restore();
}

/* --------------------------------- grade --------------------------------- */

/** split tone: lift the highlights warm and push the shadows cool, gently */
export function grade(ctx, { warm = 0.1, cool = 0.12 } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (cool > 0) {
    // cool shadows: multiply a pale teal (white = no change), weighted low
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(214,236,240,${cool})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (warm > 0) {
    ctx.globalCompositeOperation = 'soft-light';
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, `rgba(255,190,120,${warm})`);
    g.addColorStop(0.6, `rgba(255,150,90,${warm * 0.6})`);
    g.addColorStop(1, `rgba(40,80,110,${warm * 0.8})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
