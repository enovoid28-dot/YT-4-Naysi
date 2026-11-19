// The cyanotype plate kit (episode 28).
//
// The look of a natural-history plate printed the old way: Prussian-blue
// cyanotype paper (brushed sensitiser, exposure mottling, paper fibre, dust)
// with white engraved line work, typewriter specimen labels and a Fraunces
// serif for headings. Everything is drawn by code: textures are baked once
// per process from seeded noise, specimens are vector paths rendered with
// hatching into sprites, and the camera moves over the plate like a rostrum.
//
//   paper      the plate itself (three exposures: plate, deep, chart)
//   spline     smooth closed/open Path2D through points (sharp points allowed)
//   specimen   bake a union-outlined, hatched sprite from vector shapes
//   swim       draw a sprite in vertical strips with a travelling wave
//   heading    plate heading: kicker, serif title with line-mask reveal
//   label      typewriter label with a wipe; leader lines with a dot
//   card       a warm paper insert with fibre texture and a soft shadow
//   snow       marine snow drifting through the water layers
import { createCanvas, Path2D } from '@napi-rs/canvas';
import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, rng, TAU, EASE } from '../engine/anim.mjs';

export { Path2D };

export const CY = {
  deep: '#0A2149',
  ink: '#133A6E',
  mid: '#1E4C88',
  wash: '#2F65A3',
  light: '#7FA6CF',
  paper: '#EDF2EF',
  white: '#F7F9F6',
  cream: '#F2EAD8',
  creamDk: '#DCCFB4',
  sepia: '#3B2E22',
  amber: '#FFBC42',
  amberDk: '#E59A1C',
  red: '#F0563E',
  cr: '#D81E05',
  en: '#FC7F3F',
  vu: '#F9E814',
};

// International Chronostratigraphic Chart colours and bases (Ma)
export const ICS = {
  hadean: ['Hadean', '#AE027E', 4540, 4000],
  archean: ['Arkean', '#F0047F', 4000, 2500],
  proterozoic: ['Proterozoikum', '#F73563', 2500, 538.8],
  phanerozoic: ['Fanerozoikum', '#9AD9DD', 538.8, 0],
};
export const PERIODS = [
  ['Kambrium', 'Ꞓ', '#7FA056', 538.8, 486.85],
  ['Ordovisium', 'O', '#009270', 486.85, 443.1],
  ['Silur', 'S', '#B3E1B6', 443.1, 419.62],
  ['Devon', 'D', '#CB8C37', 419.62, 358.86],
  ['Karbon', 'C', '#67A599', 358.86, 298.9],
  ['Perm', 'P', '#F04028', 298.9, 251.9],
  ['Trias', 'T', '#812B92', 251.9, 201.4],
  ['Jura', 'J', '#34B2C9', 201.4, 143.1],
  ['Kapur', 'K', '#7FC64E', 143.1, 66],
  ['Paleogen', 'Pg', '#FD9A52', 66, 23.04],
  ['Neogen', 'N', '#FFE619', 23.04, 2.58],
  ['Kuarter', 'Q', '#F9F97F', 2.58, 0],
];

/* ------------------------------- timing --------------------------------- */

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9-]/g, '');

/** start of the nth spoken occurrence of `word` in the scene (scene-local s) */
export function cue(scene, word, nth = 0, off = 0) {
  const want = norm(word);
  let k = 0;
  for (const c of scene.captions || []) {
    for (const w of c.words) {
      if (norm(w.text) === want) {
        if (k === nth) return w.start + off;
        k++;
      }
    }
  }
  return 0 + off;
}

/** end of the nth occurrence */
export function cueEnd(scene, word, nth = 0, off = 0) {
  const want = norm(word);
  let k = 0;
  for (const c of scene.captions || []) {
    for (const w of c.words) {
      if (norm(w.text) === want) {
        if (k === nth) return w.end + off;
        k++;
      }
    }
  }
  return 0 + off;
}

export const P = (t, at, d, e = EASE.outCubic) => e(clamp((t - at) / Math.max(0.001, d)));
export const eo = (p) => EASE.outExpo(clamp(p));
export const e3 = (p) => EASE.outCubic(clamp(p));
export const io = (p) => EASE.inOutQuint(clamp(p));
export const ioq = (p) => EASE.inOutQuad(clamp(p));
export const sm = (p) => EASE.smooth(clamp(p));
export const rgba = (hex, a = 1) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** keyed rostrum move: [[t, x, y, z], ...] -> {x, y, z} with eased segments */
export function keys(t, list, e = io) {
  if (t <= list[0][0]) return { x: list[0][1], y: list[0][2], z: list[0][3] };
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];
    if (t <= b[0]) {
      const p = e((t - a[0]) / Math.max(0.001, b[0] - a[0]));
      return { x: lerp(a[1], b[1], p), y: lerp(a[2], b[2], p), z: lerp(a[3], b[3], p) };
    }
  }
  const l = list[list.length - 1];
  return { x: l[1], y: l[2], z: l[3] };
}

/** keep a rostrum view inside the baked sheet so its edge never shows */
export function holdView({ x, y, z }, fx = W / 2, fy = 1030, m = 60) {
  const x0 = -BG_X + m + fx / z;
  const x1 = BG_W - BG_X - m - (W - fx) / z;
  const y0 = -BG_Y + m + fy / z;
  const y1 = BG_H - BG_Y - m - (H - fy) / z;
  return { x: x0 <= x1 ? clamp(x, x0, x1) : (x0 + x1) / 2, y: y0 <= y1 ? clamp(y, y0, y1) : (y0 + y1) / 2, z };
}

/** look at plate point (x, y) at zoom z: the point lands at the frame's
 *  (fx, fy). Returns the view actually used (held inside the sheet). */
export function frameOn(ctx, cam, fx = W / 2, fy = 1030) {
  const v = holdView(cam, fx, fy);
  ctx.translate(fx, fy);
  ctx.scale(v.z, v.z);
  ctx.translate(-v.x, -v.y);
  return v;
}

/** plate point -> frame point under a view from frameOn */
export const toFrame = (v, px, py, fx = W / 2, fy = 1030) => [fx + (px - v.x) * v.z, fy + (py - v.y) * v.z];

/* -------------------------------- noise --------------------------------- */

function hash2(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export function vnoise(x, y, s = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s);
  const b = hash2(xi + 1, yi, s);
  const c = hash2(xi, yi + 1, s);
  const d = hash2(xi + 1, yi + 1, s);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
export function fbm(x, y, s = 0, oct = 4) {
  let f = 0;
  let amp = 0.5;
  let fr = 1;
  let tot = 0;
  for (let i = 0; i < oct; i++) {
    f += amp * vnoise(x * fr, y * fr, s + i * 17);
    tot += amp;
    amp *= 0.5;
    fr *= 2.03;
  }
  return f / tot;
}

/* ------------------------------- splines -------------------------------- */

/**
 * Catmull-Rom through points, as cubic Bézier segments. A point [x, y, 1] is a
 * corner (no tangent through it), so fins keep their tips.
 */
export function spline(pts, { closed = true, k = 1, path = null, sx = 1, sy = 1, ox = 0, oy = 0 } = {}) {
  const p = path || new Path2D();
  const n = pts.length;
  const X = (i) => pts[(i + n) % n][0] * sx + ox;
  const Y = (i) => pts[(i + n) % n][1] * sy + oy;
  const sharp = (i) => !!pts[(i + n) % n][2];
  p.moveTo(X(0), Y(0));
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const i0 = closed ? i - 1 : Math.max(0, i - 1);
    const i3 = closed ? i + 2 : Math.min(n - 1, i + 2);
    const t1x = sharp(i) ? 0 : ((X(i + 1) - X(i0)) / 6) * k;
    const t1y = sharp(i) ? 0 : ((Y(i + 1) - Y(i0)) / 6) * k;
    const t2x = sharp(i + 1) ? 0 : ((X(i3) - X(i)) / 6) * k;
    const t2y = sharp(i + 1) ? 0 : ((Y(i3) - Y(i)) / 6) * k;
    p.bezierCurveTo(X(i) + t1x, Y(i) + t1y, X(i + 1) - t2x, Y(i + 1) - t2y, X(i + 1), Y(i + 1));
  }
  if (closed) p.closePath();
  return p;
}

/** sample a Catmull-Rom curve to a dense polyline */
export function sampleSpline(pts, { closed = false, k = 1, step = 6 } = {}) {
  const n = pts.length;
  const at = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  const out = [];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const t1x = p1[2] ? 0 : ((p2[0] - p0[0]) / 6) * k;
    const t1y = p1[2] ? 0 : ((p2[1] - p0[1]) / 6) * k;
    const t2x = p2[2] ? 0 : ((p3[0] - p1[0]) / 6) * k;
    const t2y = p2[2] ? 0 : ((p3[1] - p1[1]) / 6) * k;
    const c1 = [p1[0] + t1x, p1[1] + t1y];
    const c2 = [p2[0] - t2x, p2[1] - t2y];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const m = Math.max(2, Math.ceil(len / step));
    for (let j = 0; j < m; j++) {
      const u = j / m;
      const a = (1 - u) ** 3;
      const b = 3 * (1 - u) ** 2 * u;
      const c = 3 * (1 - u) * u * u;
      const d = u ** 3;
      out.push([a * p1[0] + b * c1[0] + c * c2[0] + d * p2[0], a * p1[1] + b * c1[1] + c * c2[1] + d * p2[1]]);
    }
  }
  const e = closed ? at(0) : at(n - 1);
  out.push([e[0], e[1]]);
  return out;
}

export function polyPath(pts, closed = false) {
  const p = new Path2D();
  pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  if (closed) p.closePath();
  return p;
}

/** stroke the first `p` (0..1) of a polyline by arc length */
export function drawOn(ctx, pts, p, { lw = 3, color = CY.paper, a = 1, cap = 'round', dash = null, head = 0 } = {}) {
  if (p <= 0.001 || pts.length < 2) return null;
  let total = 0;
  const seg = [];
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(l);
    total += l;
  }
  const want = total * clamp(p);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = cap;
  ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let acc = 0;
  let end = pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (acc + seg[i - 1] >= want) {
      const u = (want - acc) / Math.max(0.0001, seg[i - 1]);
      end = [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)];
      ctx.lineTo(end[0], end[1]);
      break;
    }
    acc += seg[i - 1];
    ctx.lineTo(pts[i][0], pts[i][1]);
    end = pts[i];
  }
  ctx.stroke();
  if (head > 0 && p < 1) {
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(end[0], end[1], head, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  return end;
}

/* ------------------------------- baking --------------------------------- */

const BAKED = new Map();
export function bake(key, w, h, fn) {
  let cv = BAKED.get(key);
  if (!cv) {
    cv = createCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));
    fn(cv.getContext('2d'), cv);
    BAKED.set(key, cv);
  }
  return cv;
}
export const makeCanvas = (w, h) => createCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));

/* -------------------------------- paper --------------------------------- */

const BG_W = 1640;
const BG_H = 2900;
const BG_X = (BG_W - W) / 2;
const BG_Y = (BG_H - H) / 2;

const EXPOSURE = {
  plate: { base: '#14396C', deep: '#0A2249', wash: '#2D63A0', seed: 11, light: 0.62 },
  deep: { base: '#0E2D59', deep: '#06173A', wash: '#22528C', seed: 23, light: 0.5 },
  chart: { base: '#163D72', deep: '#0C2650', wash: '#2B5E99', seed: 37, light: 0.55 },
};

function hexRGB(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function bakePaper(kind) {
  const ex = EXPOSURE[kind];
  return bake(`paper:${kind}`, BG_W, BG_H, (c, cv) => {
    const R = rng(ex.seed * 7919);
    c.fillStyle = ex.base;
    c.fillRect(0, 0, BG_W, BG_H);
    // exposure mottling: low-frequency fbm between the deep and wash blues
    const sw = 120;
    const sh = 212;
    const small = createCanvas(sw, sh);
    const sc = small.getContext('2d');
    const img = sc.createImageData(sw, sh);
    const dA = hexRGB(ex.deep);
    const wA = hexRGB(ex.wash);
    const bA = hexRGB(ex.base);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const n = fbm(x / 26, y / 26, ex.seed, 5);
        const m = fbm(x / 9 + 40, y / 9, ex.seed + 3, 3);
        let v = (n - 0.5) * 2.1 + (m - 0.5) * 0.5;
        // edges a touch deeper, like a print exposed under glass
        const ex2 = Math.min(x, sw - 1 - x) / sw;
        const ey2 = Math.min(y, sh - 1 - y) / sh;
        v -= 0.35 * (1 - clamp(Math.min(ex2, ey2) * 7));
        const col = v < 0 ? bA.map((b, i) => lerp(b, dA[i], clamp(-v))) : bA.map((b, i) => lerp(b, wA[i], clamp(v * ex.light)));
        const o = (y * sw + x) * 4;
        img.data[o] = col[0];
        img.data[o + 1] = col[1];
        img.data[o + 2] = col[2];
        img.data[o + 3] = 255;
      }
    }
    sc.putImageData(img, 0, 0);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(small, 0, 0, BG_W, BG_H);

    // brushed sensitiser: long, nearly level strokes made of bristles
    c.lineCap = 'round';
    for (let s = 0; s < 70; s++) {
      const y0 = R() * BG_H;
      const x0 = -200 + R() * 400;
      const len = 900 + R() * 1200;
      const wdt = 50 + R() * 150;
      const ang = (R() - 0.5) * 0.08;
      const light = R() < 0.5;
      const bristles = Math.round(wdt / 4);
      for (let b = 0; b < bristles; b++) {
        const oy = (b / bristles - 0.5) * wdt + (R() - 0.5) * 3;
        const a = (0.012 + R() * 0.03) * (light ? 1 : 1.2);
        c.strokeStyle = light ? `rgba(120,170,225,${a})` : `rgba(4,14,40,${a})`;
        c.lineWidth = 1 + R() * 2.4;
        const xs = x0 + R() * 120;
        const xe = xs + len * (0.6 + R() * 0.4);
        const bend = (R() - 0.5) * 18;
        c.beginPath();
        c.moveTo(xs, y0 + oy + xs * ang);
        c.quadraticCurveTo((xs + xe) / 2, y0 + oy + bend + ((xs + xe) / 2) * ang, xe, y0 + oy + xe * ang);
        c.stroke();
      }
    }

    // paper fibre: short curved hairs, mostly pale, some dark
    for (let i = 0; i < 11000; i++) {
      const x = R() * BG_W;
      const y = R() * BG_H;
      const l = 6 + R() * R() * 46;
      const a0 = R() * TAU;
      const bend = (R() - 0.5) * 0.9;
      const pale = R() < 0.68;
      c.strokeStyle = pale ? `rgba(200,222,245,${0.035 + R() * 0.075})` : `rgba(3,12,34,${0.05 + R() * 0.08})`;
      c.lineWidth = 0.7 + R() * 0.9;
      const x1 = x + Math.cos(a0) * l;
      const y1 = y + Math.sin(a0) * l;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo((x + x1) / 2 + Math.cos(a0 + 1.57) * l * bend * 0.3, (y + y1) / 2 + Math.sin(a0 + 1.57) * l * bend * 0.3, x1, y1);
      c.stroke();
    }

    // fine tooth of the paper: per-pixel grain, slightly vertical
    const id = c.getImageData(0, 0, BG_W, BG_H);
    const d = id.data;
    let seed = ex.seed * 92821;
    for (let i = 0; i < d.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const g = ((seed >>> 24) - 128) / 128;
      const k = g * 7;
      d[i] = clamp(d[i] + k * 0.7, 0, 255);
      d[i + 1] = clamp(d[i + 1] + k * 0.85, 0, 255);
      d[i + 2] = clamp(d[i + 2] + k, 0, 255);
    }
    c.putImageData(id, 0, 0);

    // specks: unexposed dust (white) and chemical spots (deep)
    for (let i = 0; i < 160; i++) {
      const x = R() * BG_W;
      const y = R() * BG_H;
      const r = 0.6 + R() * R() * 2.6;
      c.fillStyle = R() < 0.62 ? `rgba(225,236,248,${0.25 + R() * 0.45})` : `rgba(3,10,30,${0.3 + R() * 0.4})`;
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fill();
    }
    void cv;
  });
}

/** the plate: baked cyanotype paper, a touch of parallax against the camera */
export function paper(ctx, cam = {}, { kind = 'plate', a = 1, dx = 0, dy = 0 } = {}) {
  const cv = bakePaper(kind);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(cv, -BG_X - (cam.dx || 0) * 0.3 + dx, -BG_Y - (cam.dy || 0) * 0.3 + dy);
  ctx.restore();
}

/** a sheet of paper texture at any size (for big rostrum moves over a plate) */
export function paperTile(kind = 'plate') {
  return bakePaper(kind);
}

/* -------------------------- warm paper inserts -------------------------- */

function bakeCream() {
  return bake('cream', 1024, 1024, (c) => {
    const R = rng(515);
    c.fillStyle = CY.cream;
    c.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 2600; i++) {
      const x = R() * 1024;
      const y = R() * 1024;
      const l = 5 + R() * R() * 30;
      const a0 = R() * TAU;
      c.strokeStyle = R() < 0.7 ? `rgba(120,96,60,${0.04 + R() * 0.06})` : `rgba(255,255,255,${0.12 + R() * 0.1})`;
      c.lineWidth = 0.6 + R() * 0.8;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(a0) * l, y + Math.sin(a0) * l);
      c.stroke();
    }
    const id = c.getImageData(0, 0, 1024, 1024);
    let s = 71;
    for (let i = 0; i < id.data.length; i += 4) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const g = ((s >>> 24) - 128) / 128;
      const n = fbm((i / 4) % 1024 / 140, Math.floor(i / 4 / 1024) / 140, 9, 3);
      const k = g * 6 + (n - 0.5) * 22;
      id.data[i] = clamp(id.data[i] + k, 0, 255);
      id.data[i + 1] = clamp(id.data[i + 1] + k * 0.95, 0, 255);
      id.data[i + 2] = clamp(id.data[i + 2] + k * 0.85, 0, 255);
    }
    c.putImageData(id, 0, 0);
  });
}

/** a warm paper card with a soft contact shadow; fn draws on it in card space */
export function card(ctx, x, y, w, h, { a = 1, rot = 0, shadow = 1, edge = true, fn = null } = {}) {
  if (a <= 0.001) return;
  const tex = bakeCream();
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = `rgba(2,8,24,${0.55 * shadow})`;
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = CY.cream;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  ctx.drawImage(tex, (x * 0.37) % 300, (y * 0.29) % 300, Math.min(1024, w), Math.min(1024, h), 0, 0, w, h);
  if (edge) {
    ctx.strokeStyle = 'rgba(80,60,36,0.28)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, 0.75, w - 1.5, h - 1.5);
  }
  if (fn) fn(ctx);
  ctx.restore();
}

/* ------------------------------ type & rules ----------------------------- */

/** typewriter label with a left-to-right wipe */
export function label(ctx, s, x, y, { size = 30, font = F.mono6, color = CY.paper, align = 'left', track = 3, a = 1, p = 1 } = {}) {
  if (p <= 0.001 || a <= 0.001) return 0;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(s).width;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.globalAlpha *= a;
  if (p < 1) {
    ctx.beginPath();
    ctx.rect(x0 - 4, y - size * 1.1, (w + 8) * EASE.outCubic(clamp(p)), size * 1.5);
    ctx.clip();
  }
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x0, y);
  ctx.restore();
  return w;
}

export function textW(ctx, s, size, font, track = 0) {
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(s).width;
  ctx.restore();
  return w;
}

/** leader line from the specimen (x0,y0) to the label (x1,y1), drawn on */
export function leader(ctx, x0, y0, x1, y1, p, { color = CY.paper, a = 0.85, lw = 2, dot = 6, elbow = null } = {}) {
  if (p <= 0.001) return;
  const pts = elbow ? [[x0, y0], elbow, [x1, y1]] : [[x0, y0], [x1, y1]];
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x0, y0, dot * EASE.outBack(clamp(p * 3)), 0, TAU);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw * 0.9;
  ctx.beginPath();
  ctx.arc(x0, y0, dot * 2.1 * EASE.outCubic(clamp(p * 2)), 0, TAU);
  ctx.globalAlpha *= 0.5;
  ctx.stroke();
  ctx.restore();
  drawOn(ctx, pts, P(p, 0.15, 0.85, EASE.outCubic), { lw, color, a });
}

/** a fine rule with end ticks, drawn on from the left */
export function rule(ctx, x0, x1, y, p = 1, { color = CY.paper, a = 0.55, lw = 1.6, ticks = true } = {}) {
  if (p <= 0.001) return;
  const xe = lerp(x0, x1, EASE.outCubic(clamp(p)));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(xe, y);
  if (ticks) {
    ctx.moveTo(x0, y - 9);
    ctx.lineTo(x0, y + 9);
    if (p >= 0.999) {
      ctx.moveTo(x1, y - 9);
      ctx.lineTo(x1, y + 9);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/** registration crosses and a hairline border: the plate's frame */
export function plateFrame(ctx, { a = 1, inset = 46, top = 196, bottom = 1806 } = {}) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a * 0.5;
  ctx.strokeStyle = CY.paper;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(inset, top, W - inset * 2, bottom - top);
  ctx.globalAlpha *= 0.55;
  ctx.strokeRect(inset + 9, top + 9, W - inset * 2 - 18, bottom - top - 18);
  ctx.globalAlpha /= 0.55;
  const cross = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(x - 18, y);
    ctx.lineTo(x + 18, y);
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y + 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, TAU);
    ctx.stroke();
  };
  cross(inset, top);
  cross(W - inset, top);
  cross(inset, bottom);
  cross(W - inset, bottom);
  ctx.restore();
}

/**
 * Plate heading: a kicker in typewriter caps and a serif title whose lines
 * rise out of a mask one after another. `lines` use *word* for the accent.
 * Returns the y under the block.
 */
export function heading(ctx, t, { kicker = '', lines = [], x = 104, y = 330, size = 132, lead = 1.02, t0 = -1, stagger = 0.09, dur = 0.55, color = CY.white, accent = CY.amber, align = 'left', a = 1, font = F.serif } = {}) {
  if (a <= 0.001) return y;
  ctx.save();
  ctx.globalAlpha *= a;
  if (kicker) {
    const pk = P(t, t0, 0.5);
    label(ctx, kicker, align === 'center' ? x : x, y - size * 0.92, { size: 28, color: CY.amber, track: 5, p: pk, align });
  }
  let yy = y;
  lines.forEach((line, li) => {
    const p = P(t, t0 + 0.06 + li * stagger, dur, EASE.outExpo);
    const parts = line.split(/(\*[^*]+\*)/).filter(Boolean).map((s) => (s.startsWith('*') ? { s: s.slice(1, -1), c: accent } : { s, c: color }));
    ctx.font = `${size}px ${font}`;
    ctx.letterSpacing = '-2px';
    const widths = parts.map((q) => ctx.measureText(q.s).width);
    const total = widths.reduce((u, v) => u + v, 0);
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - 20, yy - size * 1.02, total + 60, size * 1.3);
    ctx.clip();
    const dy = (1 - p) * size * 1.05;
    ctx.textBaseline = 'alphabetic';
    parts.forEach((q, i) => {
      ctx.fillStyle = q.c;
      ctx.fillText(q.s, cx, yy + dy);
      cx += widths[i];
    });
    ctx.restore();
    yy += size * lead;
  });
  ctx.restore();
  return yy;
}

/** a number set in fixed-width digit cells so counters never jitter */
export function numCells(ctx, s, x, y, { size = 200, font = F.serif, color = CY.white, align = 'left', a = 1, cell = 0.62, sepW = 0.28, track = 0 } = {}) {
  if (a <= 0.001) return 0;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  const ws = [...s].map((ch) => (/[0-9]/.test(ch) ? size * cell : /[.,]/.test(ch) ? size * sepW : ctx.measureText(ch).width + track));
  const total = ws.reduce((u, v) => u + v, 0);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  [...s].forEach((ch, i) => {
    ctx.fillText(ch, cx + ws[i] / 2, y);
    cx += ws[i];
  });
  ctx.restore();
  return total;
}

export const idNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ------------------------------ specimens -------------------------------- */

/**
 * Bake a specimen sprite. `shapes` are closed point lists in unit space, all
 * filled as one silhouette; the outline is the union's (strokes minus fills).
 * `paint(c, mask)` draws the interior detail (hatching, eyes, gills) in unit
 * space before the outline goes on. Returns { cv, s, ox, oy, w, h } where a
 * unit point (u, v) sits at sprite pixel (ox + u*s, oy + v*s).
 */
export function specimen(key, { shapes, box, s = 2, lw = 3, fill = 'rgba(237,242,239,0.10)', outline = CY.paper, paint = null, pad = 24 }) {
  const [bx0, by0, bx1, by1] = box;
  const w = (bx1 - bx0) * s + pad * 2;
  const h = (by1 - by0) * s + pad * 2;
  const ox = pad - bx0 * s;
  const oy = pad - by0 * s;
  const cv = bake(`spec:${key}`, w, h, (c) => {
    const paths = shapes.map((sh) => (sh instanceof Path2D ? sh : spline(sh, { sx: s, sy: s, ox, oy })));
    // silhouette mask
    const mask = createCanvas(Math.ceil(w), Math.ceil(h));
    const m = mask.getContext('2d');
    m.fillStyle = '#fff';
    paths.forEach((p) => m.fill(p));
    // body veil
    c.save();
    c.drawImage(mask, 0, 0);
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = fill;
    c.fillRect(0, 0, w, h);
    c.restore();
    // interior detail, clipped to the silhouette
    if (paint) {
      const det = createCanvas(Math.ceil(w), Math.ceil(h));
      const d = det.getContext('2d');
      d.save();
      d.translate(ox, oy);
      d.scale(s, s);
      paint(d, { s, w, h, ox, oy, unit: 1 / s });
      d.restore();
      d.globalCompositeOperation = 'destination-in';
      d.drawImage(mask, 0, 0);
      c.drawImage(det, 0, 0);
    }
    // union outline
    const ol = createCanvas(Math.ceil(w), Math.ceil(h));
    const o = ol.getContext('2d');
    o.strokeStyle = outline;
    o.lineWidth = lw * 2;
    o.lineJoin = 'round';
    paths.forEach((p) => o.stroke(p));
    o.globalCompositeOperation = 'destination-out';
    o.drawImage(mask, 0, 0);
    c.drawImage(ol, 0, 0);
  });
  return { cv, s, ox, oy, w, h };
}

/** draw a baked specimen so that unit point (ux, uy) lands at (x, y), `scale` px per unit */
export function place(ctx, sp, x, y, scale, { ux = 0, uy = 0, a = 1, flip = false, rot = 0 } = {}) {
  if (a <= 0.001) return;
  const k = scale / sp.s;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(flip ? -k : k, k);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sp.cv, -(sp.ox + ux * sp.s), -(sp.oy + uy * sp.s));
  ctx.restore();
}

/**
 * Swimming: the sprite in vertical strips, each lifted by a travelling wave
 * that grows toward the tail (unit x below `tail`), with the tail strips
 * squeezed a little as they turn away. Unit (ux, uy) lands at (x, y).
 */
export function swim(ctx, sp, x, y, scale, t, { ux = 0, uy = 0, a = 1, flip = false, amp = 0.022, hz = 0.9, strips = 44, len = 1000, tailAt = 0, headAt = 1000, rot = 0 } = {}) {
  if (a <= 0.001) return;
  const k = scale / sp.s;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(flip ? -k : k, k);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  const W0 = sp.cv.width;
  const Hh = sp.cv.height;
  const sw = W0 / strips;
  for (let i = 0; i < strips; i++) {
    const sx = i * sw;
    const u = (sx + sw / 2 - sp.ox) / sp.s; // unit x of the strip centre
    const f = clamp((headAt - u) / Math.max(1, headAt - tailAt));
    const w8 = f * f * (0.4 + 0.6 * f);
    const ph = t * hz * TAU - (u / len) * 4.2;
    const dy = Math.sin(ph) * amp * len * sp.s * w8;
    const sq = 1 - 0.07 * w8 * (0.5 + 0.5 * Math.cos(ph));
    const dx = -(sp.ox + ux * sp.s) + sx;
    ctx.drawImage(sp.cv, sx, 0, sw + 1, Hh, dx + (sw * (1 - sq)) / 2, -(sp.oy + uy * sp.s) + dy, (sw + 1) * sq, Hh);
  }
  ctx.restore();
}

/* ------------------------------- hatching -------------------------------- */

/** parallel hatch in the current transform; `shade(x, y)` 0..1 sets alpha */
export function hatch(ctx, x0, y0, x1, y1, { angle = -0.6, step = 8, lw = 1.4, color = CY.paper, a = 0.5, shade = null, seg = 18, jitter = 0.6, seed = 3 } = {}) {
  const R = rng(seed);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rad = Math.hypot(x1 - x0, y1 - y0) / 2 + step;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  for (let d = -rad; d <= rad; d += step) {
    const off = d + (R() - 0.5) * jitter * step * 0.3;
    const px = cx - sa * off;
    const py = cy + ca * off;
    if (!shade) {
      ctx.globalAlpha = a * (0.8 + R() * 0.2);
      ctx.beginPath();
      ctx.moveTo(px - ca * rad, py - sa * rad);
      ctx.lineTo(px + ca * rad, py + sa * rad);
      ctx.stroke();
      continue;
    }
    for (let s0 = -rad; s0 < rad; s0 += seg) {
      const mx = px + ca * (s0 + seg / 2);
      const my = py + sa * (s0 + seg / 2);
      if (mx < x0 - seg || mx > x1 + seg || my < y0 - seg || my > y1 + seg) continue;
      const v = shade(mx, my);
      if (v <= 0.02) continue;
      ctx.globalAlpha = a * clamp(v);
      ctx.beginPath();
      ctx.moveTo(px + ca * s0, py + sa * s0);
      ctx.lineTo(px + ca * (s0 + seg + 0.5), py + sa * (s0 + seg + 0.5));
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** stipple dots inside a box, density by `shade` */
export function stipple(ctx, x0, y0, x1, y1, { n = 400, r = 1.4, color = CY.paper, a = 0.6, shade = null, seed = 5 } = {}) {
  const R = rng(seed);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, R());
    const y = lerp(y0, y1, R());
    const v = shade ? shade(x, y) : 1;
    if (R() > v) continue;
    ctx.globalAlpha = a * (0.5 + R() * 0.5);
    ctx.beginPath();
    ctx.arc(x, y, r * (0.6 + R() * 0.7), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** contour hatching: copies of a curve stepped by (dx, dy) */
export function contourHatch(ctx, pts, n, { dx = 0, dy = 6, lw = 1.3, color = CY.paper, a = 0.55, fade = 1, dash = null } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = a * (1 - (i / n) * fade);
    ctx.beginPath();
    pts.forEach(([x, y], j) => (j ? ctx.lineTo(x + dx * i, y + dy * i) : ctx.moveTo(x + dx * i, y + dy * i)));
    ctx.stroke();
  }
  ctx.restore();
}

/* ----------------------------- water & snow ------------------------------ */

const SNOW = (() => {
  const R = rng(808);
  return Array.from({ length: 140 }, () => ({ x: R(), y: R(), z: 0.25 + R() * 0.75, ph: R() * TAU, r: R() }));
})();

/** marine snow: slow sinking flecks, nearer ones larger and faster */
export function snow(ctx, t, { x0 = 0, x1 = W, y0 = 0, y1 = H, n = 90, a = 0.5, drift = 1, color = '226,236,246' } = {}) {
  ctx.save();
  for (let i = 0; i < Math.min(n, SNOW.length); i++) {
    const m = SNOW[i];
    const hgt = y1 - y0;
    const y = y0 + ((((m.y * hgt + t * (10 + 26 * m.z) * drift) % hgt) + hgt) % hgt);
    const x = x0 + m.x * (x1 - x0) + Math.sin(t * 0.4 + m.ph) * 14 * m.z;
    const r = 0.8 + m.z * 2.6 + (m.r > 0.93 ? 1.8 : 0);
    const edge = clamp((y - y0) / 80) * clamp((y1 - y) / 80);
    ctx.globalAlpha = a * (0.25 + 0.75 * m.z) * edge * (0.6 + 0.4 * Math.sin(t * 1.3 + m.ph * 3));
    ctx.fillStyle = `rgb(${color})`;
    ctx.beginPath();
    if (m.r > 0.8) ctx.ellipse(x, y, r * 1.8, r * 0.7, m.ph, 0, TAU);
    else ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** engraved water surface: wavy lines thinning with depth */
export function waterLines(ctx, x0, x1, y, t, { n = 14, gap = 9, a = 0.5, lw = 1.6, color = CY.paper, seed = 2, amp = 4 } = {}) {
  const R = rng(seed);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const yy = y + i * gap * (1 + i * 0.08);
    const k = 1 - i / n;
    ctx.globalAlpha = a * k;
    ctx.lineWidth = lw * (0.5 + 0.5 * k);
    // broken strokes, like a burin lifting off
    let x = x0 + R() * 30;
    while (x < x1) {
      const l = 40 + R() * 160 * (0.5 + k);
      const xe = Math.min(x1, x + l);
      ctx.beginPath();
      for (let xx = x; xx <= xe; xx += 12) {
        const yv = yy + Math.sin(xx * 0.018 + t * 0.9 + i * 0.7) * amp * k + Math.sin(xx * 0.051 - t * 0.6) * amp * 0.4;
        if (xx === x) ctx.moveTo(xx, yv);
        else ctx.lineTo(xx, yv);
      }
      ctx.stroke();
      x = xe + 10 + R() * 40;
    }
  }
  ctx.restore();
}

/** soft light shafts from the surface (very low alpha, no glow) */
export function shafts(ctx, t, { x = W / 2, y = 0, len = 1600, n = 6, spread = 900, a = 0.06 } = {}) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1) - 0.5;
    const sway = Math.sin(t * 0.3 + i * 1.7) * 30;
    const x0 = x + u * spread * 0.4 + sway;
    const x1 = x + u * spread + sway * 2;
    const g = ctx.createLinearGradient(0, y, 0, y + len);
    const k = a * (0.6 + 0.4 * Math.sin(t * 0.5 + i));
    g.addColorStop(0, `rgba(190,215,240,${k})`);
    g.addColorStop(1, 'rgba(190,215,240,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0 - 26, y);
    ctx.lineTo(x0 + 26, y);
    ctx.lineTo(x1 + 70, y + len);
    ctx.lineTo(x1 - 70, y + len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------- callouts -------------------------------- */

/**
 * A detail circle (an inset magnification, as in a printed figure): thin
 * double ring, a connector to its source, and `fn` drawn clipped inside.
 */
export function inset(ctx, cx, cy, r, p, fn, { from = null, a = 1, ring = CY.paper, bg = 'rgba(8,26,58,0.92)' } = {}) {
  const q = EASE.outExpo(clamp(p));
  if (q <= 0.001 || a <= 0.001) return;
  const rr = r * q;
  ctx.save();
  ctx.globalAlpha *= a;
  if (from) {
    // tangent connector lines from the source circle to the inset
    const [fx, fy, fr] = from;
    const ang = Math.atan2(cy - fy, cx - fx);
    ctx.strokeStyle = ring;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha *= 0.6;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(fx + Math.cos(ang + s * 1.5708) * fr, fy + Math.sin(ang + s * 1.5708) * fr);
      ctx.lineTo(cx + Math.cos(ang + s * 1.5708) * rr, cy + Math.sin(ang + s * 1.5708) * rr);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha /= 0.6;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rr, 0, TAU);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.clip();
  fn(ctx, q);
  ctx.restore();
  ctx.strokeStyle = ring;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, rr, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.globalAlpha *= 0.6;
  ctx.beginPath();
  ctx.arc(cx, cy, rr + 10, 0, TAU);
  ctx.stroke();
  // ring ticks
  for (let i = 0; i < 48; i++) {
    const an = (i / 48) * TAU;
    const l = i % 4 === 0 ? 12 : 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * (rr + 10), cy + Math.sin(an) * (rr + 10));
    ctx.lineTo(cx + Math.cos(an) * (rr + 10 + l), cy + Math.sin(an) * (rr + 10 + l));
    ctx.stroke();
  }
  ctx.restore();
}

/** a scale bar: | 0 ——— label | */
export function scaleBar(ctx, x, y, w, labelText, { a = 0.85, p = 1, color = CY.paper } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const q = EASE.outCubic(clamp(p));
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y - 7, w * q, 14);
  for (let i = 0; i < 4; i++) {
    if ((i + 1) / 4 > q) break;
    if (i % 2 === 0) ctx.fillRect(x + (w * i) / 4, y - 7, w / 4, 14);
  }
  ctx.restore();
  label(ctx, labelText, x + w / 2, y - 22, { size: 26, align: 'center', p, a, color });
}

/** arrow head at (x, y) pointing along angle */
export function arrowHead(ctx, x, y, ang, { s = 16, color = CY.paper, a = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-s, -s * 0.5);
  ctx.lineTo(-s * 0.72, 0);
  ctx.lineTo(-s, s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** a short accent mark under a word or number, drawn like a brush swipe */
export function swipe(ctx, x, y, w, p, { color = CY.amber, h = 12, a = 0.95, seed = 4 } = {}) {
  if (p <= 0.001) return;
  const R = rng(seed);
  const q = EASE.outExpo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.beginPath();
  const n = 16;
  const xe = x + w * q;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    ctx[i ? 'lineTo' : 'moveTo'](lerp(x, xe, u), y - h / 2 + (R() - 0.5) * 2.5 + Math.sin(u * 3) * 1.5);
  }
  for (let i = n; i >= 0; i--) {
    const u = i / n;
    ctx.lineTo(lerp(x, xe, u), y + h / 2 + (R() - 0.5) * 2.5 - u * 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export { F, W, H, clamp, lerp, rng, TAU, EASE };
