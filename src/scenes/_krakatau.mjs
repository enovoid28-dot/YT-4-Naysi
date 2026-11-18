// Episode 24 kit — Krakatau 1883.
//
// Everything here is painted from code: real coastlines (world-atlas 10m) laid
// out as a bathymetric chart of the Sunda Strait, hand-plotted islands for the
// Krakatau group before and after 1883, globe overlays that sit exactly on the
// earthBall projection, and the instruments of the story — a decibel gauge, an
// ear in section, an 1883 barogram, a tsunami in profile and a red New York
// sunset. No image files, no 3D engine: 2D canvas only.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createCanvas, Path2D } from '@napi-rs/canvas';
import { W, H, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng, EASE } from '../engine/anim.mjs';
import { fbm3 } from './_earth.mjs';
import { HUD } from './_bulan.mjs';

const D = Math.PI / 180;
const req = createRequire(import.meta.url);
const sm = (v) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const CACHE = path.join(process.cwd(), 'out', 'cache');

export const KR = {
  amber: '#FFB03A',
  amberHi: '#FFD27A',
  ember: '#FF6B1A',
  lava: '#FF4A1C',
  hot: '#FFE6B8',
  blood: '#E5483A',
  ice: '#9FD8FF',
  bone: '#F3EFE4',
  ink: 'rgba(214,230,248,0.6)',
  violet: '#4B2F86',
};

/* ================================ GEOGRAPHY ================================ */

export const KRAK = [-6.102, 105.423];
export const PL = {
  rodrigues: [-19.72, 63.42],
  perth: [-31.95, 115.86],
  batavia: [-6.13, 106.82],
  sabang: [5.89, 95.32],
  merauke: [-8.47, 140.4],
  antipode: [6.102, -74.577],
  london: [51.48, 0.0],
  newyork: [40.71, -74.0],
  anyer: [-6.06, 105.88],
  merak: [-5.93, 106.0],
  telukbetung: [-5.45, 105.27],
  kalianda: [-5.73, 105.59],
  caringin: [-6.35, 105.84],
};

export function gcKm(a, b) {
  const dla = (b[0] - a[0]) * D;
  const dlo = (b[1] - a[1]) * D;
  const h = Math.sin(dla / 2) ** 2 + Math.cos(a[0] * D) * Math.cos(b[0] * D) * Math.sin(dlo / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/* ================================== CHART ================================== */

// region the chart is cut from: wide enough for the zoom-out at the start of
// the whip from the globe, tight enough that every path stays small
const BB = { lo0: 102.2, lo1: 108.9, la0: -10.6, la1: -1.4 };

// islands that 10m data leaves out, plotted by hand as [lat, lon]
const OLD = [
  [-6.071, 105.404], [-6.068, 105.417], [-6.077, 105.431], [-6.091, 105.441],
  [-6.106, 105.449], [-6.121, 105.461], [-6.137, 105.473], [-6.153, 105.474],
  [-6.166, 105.461], [-6.162, 105.443], [-6.148, 105.431], [-6.130, 105.421],
  [-6.111, 105.410], [-6.090, 105.400],
];
const RAKATA = [
  [-6.119, 105.427], [-6.113, 105.439], [-6.106, 105.452], [-6.118, 105.463],
  [-6.135, 105.474], [-6.152, 105.474], [-6.165, 105.461], [-6.160, 105.445],
  [-6.146, 105.433], [-6.131, 105.426],
];
const SERTUNG = [
  [-6.049, 105.371], [-6.057, 105.385], [-6.071, 105.392], [-6.089, 105.395],
  [-6.106, 105.393], [-6.113, 105.386], [-6.104, 105.381], [-6.090, 105.384],
  [-6.074, 105.381], [-6.061, 105.374],
];
const PANJANG = [
  [-6.059, 105.447], [-6.065, 105.458], [-6.078, 105.465], [-6.092, 105.463],
  [-6.099, 105.456], [-6.090, 105.453], [-6.078, 105.452], [-6.067, 105.446],
];
const SEBESI = [
  [-5.933, 105.478], [-5.937, 105.495], [-5.951, 105.505], [-5.967, 105.501],
  [-5.976, 105.487], [-5.971, 105.470], [-5.956, 105.462], [-5.941, 105.466],
];
const SEBUKU = [
  [-5.858, 105.512], [-5.864, 105.530], [-5.878, 105.541], [-5.891, 105.536],
  [-5.893, 105.520], [-5.882, 105.509], [-5.868, 105.505],
];
// the three cones of the old island: [lat, lon, name, height]
export const CONES = [
  [-6.084, 105.413, 'PERBOEWATAN', '120 M'],
  [-6.114, 105.432, 'DANAN', '450 M'],
  [-6.143, 105.455, 'RAKATA', '813 M'],
];
const PEAKS = [
  // [lat, lon, radius°, height] — hillshade bumps for the big cones nearby
  [-6.27, 106.04, 0.13, 0.55], [-6.34, 105.98, 0.08, 0.35], [-5.78, 105.62, 0.1, 0.5],
  [-5.43, 104.7, 0.15, 0.6], [-6.72, 106.73, 0.13, 0.6], [-6.78, 106.98, 0.14, 0.7],
  [-5.37, 105.18, 0.1, 0.35],
];

function clipRing(ring, b) {
  let out = ring;
  const ins = [
    (p) => p[0] >= b.lo0, (p) => p[0] <= b.lo1, (p) => p[1] >= b.la0, (p) => p[1] <= b.la1,
  ];
  const cut = [
    (p, q) => [b.lo0, p[1] + ((b.lo0 - p[0]) / (q[0] - p[0])) * (q[1] - p[1])],
    (p, q) => [b.lo1, p[1] + ((b.lo1 - p[0]) / (q[0] - p[0])) * (q[1] - p[1])],
    (p, q) => [p[0] + ((b.la0 - p[1]) / (q[1] - p[1])) * (q[0] - p[0]), b.la0],
    (p, q) => [p[0] + ((b.la1 - p[1]) / (q[1] - p[1])) * (q[0] - p[0]), b.la1],
  ];
  for (let e = 0; e < 4; e++) {
    const inp = out;
    out = [];
    if (!inp.length) break;
    for (let i = 0; i < inp.length; i++) {
      const cur = inp[i];
      const prev = inp[(i + inp.length - 1) % inp.length];
      const ci = ins[e](cur);
      const pi = ins[e](prev);
      if (ci) {
        if (!pi) out.push(cut[e](prev, cur));
        out.push(cur);
      } else if (pi) out.push(cut[e](prev, cur));
    }
  }
  return out;
}

/** subdivide a hand-plotted ring and push it in and out with noise: a coast */
function roughen(ll, seed, amp, steps = 7) {
  const pts = ll.map(([la, lo]) => [lo, la]);
  // Catmull-Rom first, so the hand points read as a smooth shore
  const sm2 = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let s = 0; s < steps; s++) {
      const u = s / steps;
      const u2 = u * u;
      const u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      sm2.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  const m = sm2.length;
  return sm2.map((p, i) => {
    const a = sm2[(i + m - 1) % m];
    const b = sm2[(i + 1) % m];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1e-9;
    const nz = (fbm3(p[0] * 700, p[1] * 700, seed, 3, 7) - 0.5) * 2;
    return [p[0] + (-dy / l) * nz * amp, p[1] + (dx / l) * nz * amp];
  });
}

function circleLL(c, r, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    out.push([c[0] + Math.sin(a) * r, c[1] + Math.cos(a) * r]);
  }
  return out;
}

const RELIEF_V = 'strait-relief-v1';
function reliefRaster() {
  const PPD = 90;
  const w = Math.round((BB.lo1 - BB.lo0) * PPD);
  const h = Math.round((BB.la1 - BB.la0) * PPD);
  const file = path.join(CACHE, `${RELIEF_V}-${w}x${h}.bin`);
  let rgba = null;
  if (fs.existsSync(file)) {
    const b = fs.readFileSync(file);
    if (b.length === w * h * 4) rgba = new Uint8ClampedArray(b.buffer, b.byteOffset, b.length);
  }
  if (!rgba) {
    const hg = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      const la = BB.la1 - (y + 0.5) / PPD;
      for (let x = 0; x < w; x++) {
        const lo = BB.lo0 + (x + 0.5) / PPD;
        let v = fbm3(lo * 3.3, la * 3.3, 0.5, 5, 41);
        const r = 1 - Math.abs(fbm3(lo * 8.1, la * 8.1, 2.5, 3, 43) * 2 - 1);
        v = v * 0.72 + r * r * 0.28;
        for (const [pla, plo, pr, ph] of PEAKS) {
          const d = Math.hypot(lo - plo, la - pla) / pr;
          if (d < 1) v += ph * Math.pow(1 - d, 1.7);
        }
        hg[y * w + x] = v;
      }
    }
    rgba = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const xl = x > 0 ? i - 1 : i;
        const xr = x < w - 1 ? i + 1 : i;
        const yu = y > 0 ? i - w : i;
        const yd = y < h - 1 ? i + w : i;
        const gx = hg[xr] - hg[xl];
        const gy = hg[yd] - hg[yu];
        // light from the north-west
        const sh = clamp(0.56 - (gx + gy) * 7.5);
        const e = clamp(hg[i] * 1.1 - 0.2);
        const o = i * 4;
        rgba[o] = 20 + sh * 44 + e * 18;
        rgba[o + 1] = 25 + sh * 44 + e * 12;
        rgba[o + 2] = 20 + sh * 34 + e * 6;
        rgba[o + 3] = 255;
      }
    }
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, Buffer.from(rgba.buffer, rgba.byteOffset, rgba.length));
  }
  const cv = createCanvas(w, h);
  const c = cv.getContext('2d');
  const img = c.createImageData(w, h);
  img.data.set(rgba);
  c.putImageData(img, 0, 0);
  return cv;
}

let CHART = null;
function chartData() {
  if (CHART) return CHART;
  const topo = req('world-atlas/land-10m.json');
  const { feature } = req('topojson-client');
  const land = feature(topo, topo.objects.land);
  const rings = [];
  for (const f of land.features) {
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of polys) {
      for (const ring of poly) {
        let hit = false;
        for (let i = 0; i < ring.length; i++) {
          const p = ring[i];
          if (p[0] > BB.lo0 - 3 && p[0] < BB.lo1 + 3 && p[1] > BB.la0 - 3 && p[1] < BB.la1 + 3) {
            hit = true;
            break;
          }
        }
        if (!hit) continue;
        const c = clipRing(ring, BB);
        if (c.length >= 3) rings.push(c);
      }
    }
  }
  const isl = {
    old: roughen(OLD, 3, 0.0011),
    rakata: roughen(RAKATA, 5, 0.0008),
    sertung: roughen(SERTUNG, 7, 0.0006),
    panjang: roughen(PANJANG, 9, 0.0005),
    sebesi: roughen(SEBESI, 13, 0.001),
    sebuku: roughen(SEBUKU, 15, 0.0009),
    anak: roughen(circleLL(KRAK, 0.0088, 9), 11, 0.0007, 6),
  };
  const mk = (list) => {
    const p = new Path2D();
    for (const r of list) {
      p.moveTo(r[0][0], -r[0][1]);
      for (let i = 1; i < r.length; i++) p.lineTo(r[i][0], -r[i][1]);
      p.closePath();
    }
    return p;
  };
  const common = [isl.sertung, isl.panjang, isl.sebesi, isl.sebuku];
  CHART = {
    rings,
    isl,
    mk,
    pre: mk([...rings, isl.old, ...common]),
    post: mk([...rings, isl.rakata, ...common]),
    paths: {
      old: mk([isl.old]),
      rakata: mk([isl.rakata]),
      sertung: mk([isl.sertung]),
      panjang: mk([isl.panjang]),
    },
    relief: reliefRaster(),
  };
  return CHART;
}

/** the anak path at a growth factor (1 = today's size), cached by step */
const ANAK = new Map();
function anakPath(g) {
  const q = Math.round(clamp(g) * 40) / 40;
  let p = ANAK.get(q);
  if (p) return p;
  const C = chartData();
  p = new Path2D();
  const r = C.isl.anak;
  const s = Math.max(0.02, q);
  r.forEach(([lo, la], i) => {
    const x = KRAK[1] + (lo - KRAK[1]) * s;
    const y = -(KRAK[0] + (la - KRAK[0]) * s);
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  });
  p.closePath();
  ANAK.set(q, p);
  return p;
}

export function chartView(lon0, lat0, k, cx = W / 2, cy = 1000) {
  return { lon0, lat0, k, kx: k * Math.cos(lat0 * D), cx, cy };
}
/** interpolate two views; the zoom goes in log space so it feels constant */
export function mixView(a, b, f) {
  const k = Math.exp(lerp(Math.log(a.k), Math.log(b.k), f));
  // keep the motion of the map centre proportional to the zoom
  const w = (k - a.k) / (b.k - a.k || 1);
  const ff = Number.isFinite(w) && Math.abs(b.k - a.k) > 1 ? clamp(w) : f;
  return chartView(lerp(a.lon0, b.lon0, ff), lerp(a.lat0, b.lat0, ff), k, lerp(a.cx, b.cx, f), lerp(a.cy, b.cy, f));
}
export const cxy = (v, lat, lon) => [v.cx + (lon - v.lon0) * v.kx, v.cy - (lat - v.lat0) * v.k];
export const kmPx = (v, km) => (km / 111.2) * v.k;

/**
 * Sunda Strait chart in view v.
 *  era  'pre' (the island before 27 Aug 1883) or 'post'
 *  anak growth of Anak Krakatau (0..1), only for 'post'
 */
export function drawChart(ctx, v, o = {}) {
  const { a = 1, era = 'post', anak = 0, grid = 1, labels = 1, t = 0, vent = 0, heat = 0, wet = 0, only = null } = o;
  if (a <= 0.01) return;
  const C = chartData();
  const landOnly = only === 'land';
  ctx.save();
  ctx.globalAlpha *= a;
  if (!landOnly) {
    // open sea: deep, cold, a little lighter where the strait is shallow
    const g = ctx.createRadialGradient(v.cx, v.cy, 60, v.cx, v.cy, 1700);
    g.addColorStop(0, '#0B2533');
    g.addColorStop(0.5, '#071926');
    g.addColorStop(1, '#030B12');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  const land = era === 'pre' ? C.pre : C.post;
  const px = 1 / v.k;
  ctx.save();
  ctx.translate(v.cx - v.lon0 * v.kx, v.cy + v.lat0 * v.k);
  ctx.scale(v.kx, v.k);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // depth bands: the coast stroked wide, deep to shallow, each with a contour
  const bands = [
    [30, '#09202D'], [18, '#0B2633'], [10, '#0E2D3A'], [5.5, '#113442'], [2.6, '#153C4A'], [1.0, '#1A4553'],
  ];
  // shelves narrow as we zoom in, so small islands never wear giant halos
  const zf = Math.min(1, Math.pow(760 / v.k, 0.95));
  const minKm = (1.6 / v.k) * 111.2;
  for (const [km0, col] of landOnly ? [] : bands) {
    const km = km0 * zf;
    if (km < minKm) continue;
    const wd = (2 * km) / 111.2;
    ctx.strokeStyle = 'rgba(120,196,220,0.20)';
    ctx.lineWidth = wd + 2.4 * px;
    ctx.stroke(land);
    ctx.strokeStyle = col;
    ctx.lineWidth = wd;
    ctx.stroke(land);
    if (era === 'post' && anak > 0.02) {
      ctx.lineWidth = wd * 0.6 * anak + 2.4 * px;
      ctx.strokeStyle = 'rgba(120,196,220,0.20)';
      ctx.stroke(anakPath(anak));
      ctx.lineWidth = wd * 0.6 * anak;
      ctx.strokeStyle = col;
      ctx.stroke(anakPath(anak));
    }
  }
  // land: base, relief, a cool rim of light on the shore
  ctx.fillStyle = '#1A201B';
  ctx.fill(land);
  ctx.save();
  ctx.clip(land);
  ctx.globalAlpha *= 0.95;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(C.relief, BB.lo0, -BB.la1, BB.lo1 - BB.lo0, BB.la1 - BB.la0);
  ctx.globalAlpha = a * 0.5;
  ctx.strokeStyle = 'rgba(190,220,214,0.22)';
  ctx.lineWidth = 10 * px;
  ctx.stroke(land);
  if (wet > 0.01) {
    // where the wave went over the shore
    ctx.globalAlpha = a * wet;
    ctx.strokeStyle = 'rgba(255,90,70,0.55)';
    ctx.lineWidth = 26 * px;
    ctx.stroke(land);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(222,236,240,0.62)';
  ctx.lineWidth = 1.7 * px;
  ctx.stroke(land);

  // island detail once the islands are big enough to read
  if (v.k > 1300) {
    const det = clamp((v.k - 1300) / 900);
    const cones = era === 'pre'
      ? [[C.paths.old, CONES.map((c) => [c[0], c[1]])]]
      : [[C.paths.rakata, [[-6.143, 105.455]]], [C.paths.sertung, [[-6.082, 105.388]]], [C.paths.panjang, [[-6.079, 105.459]]]];
    for (const [pth, peaks] of cones) {
      ctx.save();
      ctx.clip(pth);
      for (const [pla, plo] of peaks) {
        const rg = ctx.createRadialGradient(plo - 0.004, -pla - 0.004, 0, plo, -pla, 0.03);
        rg.addColorStop(0, `rgba(150,146,128,${0.55 * det})`);
        rg.addColorStop(1, 'rgba(60,64,52,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(plo - 0.04, -pla - 0.04, 0.08, 0.08);
        ctx.strokeStyle = `rgba(214,206,180,${0.18 * det})`;
        ctx.lineWidth = 1.2 * px;
        for (let i = 1; i <= 6; i++) {
          ctx.beginPath();
          ctx.ellipse(plo + Math.sin(i) * 0.0004, -pla, i * 0.0036, i * 0.0031, 0.4, 0, TAU);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
  // Anak Krakatau: grows from the floor of the caldera
  if (era === 'post' && anak > 0.02) {
    const ap = anakPath(anak);
    ctx.fillStyle = '#2A2622';
    ctx.fill(ap);
    ctx.save();
    ctx.clip(ap);
    const rr = 0.0088 * anak;
    const rg = ctx.createRadialGradient(KRAK[1] - rr * 0.3, -KRAK[0] - rr * 0.3, 0, KRAK[1], -KRAK[0], rr * 1.2);
    rg.addColorStop(0, 'rgba(120,110,98,0.9)');
    rg.addColorStop(1, 'rgba(30,28,26,0.9)');
    ctx.fillStyle = rg;
    ctx.fillRect(KRAK[1] - rr * 1.3, -KRAK[0] - rr * 1.3, rr * 2.6, rr * 2.6);
    ctx.strokeStyle = 'rgba(214,206,180,0.2)';
    ctx.lineWidth = 1.1 * px;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(KRAK[1], -KRAK[0], rr * (i / 4.4), 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(222,236,240,0.62)';
    ctx.lineWidth = 1.6 * px;
    ctx.stroke(ap);
    // lava tongues down the flanks
    ctx.save();
    ctx.clip(ap);
    ctx.strokeStyle = 'rgba(20,16,14,0.55)';
    for (let i = 0; i < 9; i++) {
      const an = (i / 9) * TAU + 0.3;
      ctx.lineWidth = rr * (0.08 + (i % 3) * 0.03);
      ctx.beginPath();
      ctx.moveTo(KRAK[1] + Math.cos(an) * rr * 0.2, -KRAK[0] + Math.sin(an) * rr * 0.2);
      ctx.quadraticCurveTo(KRAK[1] + Math.cos(an + 0.3) * rr * 0.6, -KRAK[0] + Math.sin(an + 0.3) * rr * 0.6, KRAK[1] + Math.cos(an + 0.15) * rr * 1.1, -KRAK[0] + Math.sin(an + 0.15) * rr * 1.1);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(10,8,8,0.85)';
    ctx.beginPath();
    ctx.ellipse(KRAK[1] + rr * 0.05, -KRAK[0] - rr * 0.04, rr * 0.3, rr * 0.26, 0.3, 0, TAU);
    ctx.fill();
    ctx.restore();
    if (vent > 0.01) {
      // a crater that glows
      const vr = rr * 0.16;
      const fl = 0.75 + 0.25 * Math.sin(t * 9) * Math.sin(t * 3.7);
      const vg = ctx.createRadialGradient(KRAK[1], -KRAK[0], 0, KRAK[1], -KRAK[0], vr * 3);
      vg.addColorStop(0, `rgba(255,220,150,${vent * fl})`);
      vg.addColorStop(0.3, `rgba(255,96,32,${0.8 * vent * fl})`);
      vg.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = vg;
      ctx.fillRect(KRAK[1] - vr * 3, -KRAK[0] - vr * 3, vr * 6, vr * 6);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  if (heat > 0.01 && era === 'pre') {
    // the island before it went: vents glowing under the ash
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const [la, lo] of CONES) {
      const fl = 0.7 + 0.3 * Math.sin(t * 11 + lo * 300);
      const hg = ctx.createRadialGradient(lo, -la, 0, lo, -la, 0.012);
      hg.addColorStop(0, `rgba(255,200,120,${0.8 * heat * fl})`);
      hg.addColorStop(0.4, `rgba(255,80,30,${0.45 * heat * fl})`);
      hg.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(lo - 0.012, -la - 0.012, 0.024, 0.024);
    }
    ctx.restore();
  }
  ctx.restore();

  // graticule and a scale bar, in screen space so they stay hairline
  if (grid > 0.01 && !landOnly) {
    const step = v.k > 3000 ? 0.05 : v.k > 1200 ? 0.1 : v.k > 500 ? 0.5 : 1;
    const lo0 = v.lon0 - (v.cx / v.kx);
    const lo1 = v.lon0 + ((W - v.cx) / v.kx);
    const la1 = v.lat0 + (v.cy / v.k);
    const la0 = v.lat0 - ((H - v.cy) / v.k);
    ctx.save();
    ctx.globalAlpha *= grid;
    ctx.strokeStyle = 'rgba(150,200,240,0.11)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 9]);
    for (let lo = Math.ceil(lo0 / step) * step; lo <= lo1; lo += step) {
      const [x] = cxy(v, 0, lo);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      const d = Math.floor(lo + 1e-9);
      const m = Math.round((lo - d) * 60);
      txt(ctx, `${d}°${String(m).padStart(2, '0')}′ BT`, x + 8, 1560, { size: 17, font: F.mono, color: 'rgba(170,210,240,0.42)', track: 1 });
    }
    for (let la = Math.ceil(la0 / step) * step; la <= la1; la += step) {
      const [, y] = cxy(v, la, 0);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      const al = Math.abs(la);
      const d = Math.floor(al + 1e-9);
      const m = Math.round((al - d) * 60);
      if (y > 260 && y < 1600) txt(ctx, `${d}°${String(m).padStart(2, '0')}′ LS`, 74, y - 8, { size: 17, font: F.mono, color: 'rgba(170,210,240,0.42)', track: 1 });
    }
    ctx.setLineDash([]);
    ctx.restore();
  }
  if (labels > 0.01 && !landOnly) {
    ctx.save();
    ctx.globalAlpha *= labels;
    const big = (s, la, lo, size = 54) => {
      const [x, y] = cxy(v, la, lo);
      if (x < -400 || x > W + 400 || y < -100 || y > H + 100) return;
      txt(ctx, s, x, y, { size, font: F.display, color: 'rgba(230,236,232,0.20)', track: size * 0.42, align: 'center' });
    };
    if (v.k < 1600) {
      big('JAWA', -6.62, 106.2);
      big('SUMATRA', -5.12, 104.92);
      const [sx, sy] = cxy(v, -5.86, 105.86);
      txt(ctx, 'SELAT SUNDA', sx, sy, { size: 22, font: F.mono6, color: 'rgba(160,214,236,0.5)', track: 9, align: 'center' });
    }
    ctx.restore();
  }
  ctx.restore();
}

/** a dot + mono label on the chart */
export function chartPin(ctx, v, la, lo, s, { a = 1, color = HUD.text, dot = KR.amber, side = 'right', size = 21, r = 7 } = {}) {
  if (a <= 0.01) return;
  const [x, y] = cxy(v, la, lo);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = hexA(dot, 0.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r + 7, 0, TAU);
  ctx.stroke();
  if (s) {
    txt(ctx, s, x + (side === 'right' ? 22 : -22), y + 8, {
      size, font: F.mono6, color, track: 3, align: side === 'right' ? 'left' : 'right',
    });
  }
  ctx.restore();
}

export function scaleBar(ctx, v, x, y, km, { a = 1 } = {}) {
  if (a <= 0.01) return;
  const len = kmPx(v, km);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(214,230,248,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 8);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.lineTo(x + len, y - 8);
  ctx.stroke();
  ctx.fillStyle = 'rgba(214,230,248,0.7)';
  ctx.fillRect(x, y - 4, len / 2, 4);
  txt(ctx, `0`, x, y + 26, { size: 18, font: F.mono, color: 'rgba(214,230,248,0.6)', align: 'center' });
  txt(ctx, `${km} KM`, x + len, y + 26, { size: 18, font: F.mono, color: 'rgba(214,230,248,0.6)', align: 'center' });
  ctx.restore();
}

/* ============================== GLOBE OVERLAY ============================== */

/** same projection as earthBall: lon/tilt = the point at the centre of the disc */
export const gview = (cx, cy, r, lon, tilt) => ({ cx, cy, r, lon, tilt });
export function gproj(v, lat, lon) {
  const t = v.tilt * D;
  const lam = (lon - v.lon) * D;
  const phi = lat * D;
  const bx = Math.cos(phi) * Math.sin(lam);
  const by = Math.sin(phi);
  const bz = Math.cos(phi) * Math.cos(lam);
  const ay = by * Math.cos(t) - bz * Math.sin(t);
  const az = by * Math.sin(t) + bz * Math.cos(t);
  return { x: v.cx + bx * v.r, y: v.cy - ay * v.r, z: az };
}
function dest(c, brg, ang) {
  const la1 = c[0] * D;
  const lo1 = c[1] * D;
  const b = brg * D;
  const d = ang * D;
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(b));
  const lo2 = lo1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
  return [la2 / D, lo2 / D];
}
const toV = ([la, lo]) => [Math.cos(la * D) * Math.cos(lo * D), Math.cos(la * D) * Math.sin(lo * D), Math.sin(la * D)];
const toLL = ([x, y, z]) => [Math.asin(clamp(z, -1, 1)) / D, Math.atan2(y, x) / D];
function slerp(a, b, f) {
  const A = toV(a);
  const B = toV(b);
  const dot = clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1);
  const om = Math.acos(dot);
  if (om < 1e-6) return a;
  const s0 = Math.sin((1 - f) * om) / Math.sin(om);
  const s1 = Math.sin(f * om) / Math.sin(om);
  return toLL([A[0] * s0 + B[0] * s1, A[1] * s0 + B[1] * s1, A[2] * s0 + B[2] * s1]);
}

/** draw a projected polyline, front side only, fading at the limb */
function strokeFront(ctx, v, pts, { color, lw, a, glow = 1, dash = null }) {
  const P = pts.map(([la, lo]) => gproj(v, la, lo));
  const passes = glow > 0 ? [[lw * 5, 0.07], [lw * 2.4, 0.18], [lw, 1]] : [[lw, 1]];
  ctx.save();
  ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  for (const [w, k] of passes) {
    ctx.lineWidth = w;
    for (let i = 1; i < P.length; i++) {
      const p0 = P[i - 1];
      const p1 = P[i];
      const z = Math.min(p0.z, p1.z);
      if (z <= 0) continue;
      ctx.globalAlpha = a * k * sm(z / 0.16);
      ctx.strokeStyle = `rgba(${color},1)`;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** small circle of angular radius ang (degrees) around c: a wavefront */
export function gRing(ctx, v, c, ang, { color = '255,226,180', a = 1, lw = 4, glow = 1, n = 160, dash = null } = {}) {
  if (a <= 0.01 || ang <= 0.05 || ang >= 179.95) return;
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(dest(c, (i / n) * 360, ang));
  strokeFront(ctx, v, pts, { color, lw, a, glow, dash });
}

/** great-circle arc a → b, drawn up to p */
export function gArc(ctx, v, a, b, p, { color = '255,176,58', lw = 4, alpha = 1, glow = 1, n = 120, dash = null, lift = 0 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || alpha <= 0.01) return null;
  const pts = [];
  const m = Math.max(2, Math.ceil(n * q));
  for (let i = 0; i <= m; i++) pts.push(slerp(a, b, (i / m) * q));
  if (lift > 0) {
    // lift the arc off the surface a little so it reads as a flight path
    const P = pts.map((ll, i) => {
      const f = (i / m) * q;
      const e = Math.sin(Math.PI * f) * lift;
      const pr = gproj(v, ll[0], ll[1]);
      const dx = pr.x - v.cx;
      const dy = pr.y - v.cy;
      return { x: v.cx + dx * (1 + e), y: v.cy + dy * (1 + e), z: pr.z };
    });
    ctx.save();
    ctx.lineCap = 'round';
    for (const [w, k] of [[lw * 4, 0.1], [lw, 1]]) {
      ctx.lineWidth = w;
      for (let i = 1; i < P.length; i++) {
        const z = Math.min(P[i - 1].z, P[i].z);
        if (z <= -0.05) continue;
        ctx.globalAlpha = alpha * k * sm((z + 0.05) / 0.2);
        ctx.strokeStyle = `rgba(${color},1)`;
        ctx.beginPath();
        ctx.moveTo(P[i - 1].x, P[i - 1].y);
        ctx.lineTo(P[i].x, P[i].y);
        ctx.stroke();
      }
    }
    ctx.restore();
    return P[P.length - 1];
  }
  strokeFront(ctx, v, pts, { color, lw, a: alpha, glow, dash });
  const e = pts[pts.length - 1];
  return gproj(v, e[0], e[1]);
}

/** a pin standing on the globe; returns its screen point or null if hidden */
export function gPin(ctx, v, la, lo, { a = 1, color = KR.amber, r = 9, pulse = 0 } = {}) {
  const p = gproj(v, la, lo);
  if (p.z <= 0.02 || a <= 0.01) return null;
  const k = sm(p.z / 0.2);
  ctx.save();
  ctx.globalAlpha *= a * k;
  if (pulse) {
    const q = pulse % 1;
    ctx.strokeStyle = hexA(color, 0.7 * (1 - q));
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + q * 34, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.shadowColor = hexA(color, 0.9);
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0A0E16';
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 0.38, 0, TAU);
  ctx.fill();
  ctx.restore();
  return { x: p.x, y: p.y, z: p.z, k };
}

let INDO = null;
/** Indonesia's coastline (countries-50m, ISO 360) as [lat, lon] rings */
function indoRings() {
  if (INDO) return INDO;
  const topo = req('world-atlas/countries-50m.json');
  const { feature } = req('topojson-client');
  const fc = feature(topo, topo.objects.countries);
  const f = fc.features.find((x) => String(x.id) === '360');
  INDO = [];
  if (f) {
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of polys) {
      const ring = poly[0];
      if (ring.length < 6) continue;
      INDO.push(ring.map(([lo, la]) => [la, lo]));
    }
  }
  return INDO;
}

export function gIndonesia(ctx, v, p, { a = 1, color = '255,176,58', fill = 0.18 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.01) return;
  const rings = indoRings();
  ctx.save();
  // fill the islands softly, then a glowing coast
  if (fill > 0) {
    ctx.globalAlpha = a * q * fill;
    ctx.fillStyle = `rgba(${color},1)`;
    for (const r of rings) {
      let ok = true;
      ctx.beginPath();
      r.forEach(([la, lo], i) => {
        const pp = gproj(v, la, lo);
        if (pp.z <= 0.02) ok = false;
        if (i === 0) ctx.moveTo(pp.x, pp.y);
        else ctx.lineTo(pp.x, pp.y);
      });
      ctx.closePath();
      if (ok) ctx.fill();
    }
  }
  ctx.restore();
  for (const r of rings) strokeFront(ctx, v, r, { color, lw: 2.2, a: a * q, glow: 1 });
}

/* ============================ BLAST AND ASH ================================ */

/** a pressure front on the flat: crisp edge, warm glow behind, cold fringe */
export function shockRing(ctx, x, y, r, { a = 1, w = 30, color = '255,226,180' } = {}) {
  if (a <= 0.01 || r <= 1) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const r0 = Math.max(0, r - w * 2.4);
  const g = ctx.createRadialGradient(x, y, r0, x, y, r + w * 0.5);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(0.7, `rgba(${color},${0.08 * a})`);
  g.addColorStop(0.93, `rgba(${color},${0.42 * a})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r + w * 0.5, 0, TAU);
  ctx.arc(x, y, r0, 0, TAU, true);
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = `rgba(255,250,240,${0.9 * a})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(255,96,64,${0.35 * a})`;
  ctx.beginPath();
  ctx.arc(x, y, r + 5, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(110,180,255,${0.3 * a})`;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, r - 6), 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** white-out with a hot core and an anamorphic streak */
export function blastFlash(ctx, x, y, q, { a = 1 } = {}) {
  if (q <= 0 || q >= 1 || a <= 0.01) return;
  const k = Math.pow(1 - q, 2.2) * a;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, 0, x, y, 1500);
  g.addColorStop(0, `rgba(255,250,236,${k})`);
  g.addColorStop(0.18, `rgba(255,214,150,${0.75 * k})`);
  g.addColorStop(0.5, `rgba(255,120,50,${0.3 * k})`);
  g.addColorStop(1, 'rgba(255,90,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const sg = ctx.createLinearGradient(0, y, W, y);
  sg.addColorStop(0, 'rgba(255,200,140,0)');
  sg.addColorStop(0.5, `rgba(255,236,200,${0.8 * k})`);
  sg.addColorStop(1, 'rgba(255,200,140,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, y - 6, W, 12);
  ctx.globalAlpha = 0.4 * k;
  ctx.fillRect(0, y - 26, W, 52);
  ctx.restore();
}

let PUFFS = null;
const PUFF_V = 'ash-puffs-v2';
function puffs() {
  if (PUFFS) return PUFFS;
  const S = 192;
  PUFFS = [];
  const file = path.join(CACHE, `${PUFF_V}.bin`);
  let all = null;
  if (fs.existsSync(file)) {
    const b = fs.readFileSync(file);
    if (b.length === S * S * 4 * 4) all = new Uint8ClampedArray(b.buffer, b.byteOffset, b.length);
  }
  if (!all) {
    all = new Uint8ClampedArray(S * S * 4 * 4);
    for (let k = 0; k < 4; k++) {
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const u = ((x + 0.5) / S) * 2 - 1;
          const v = ((y + 0.5) / S) * 2 - 1;
          const r = Math.hypot(u, v);
          const n = fbm3(u * 2.3 + k * 7.1, v * 2.3 - k * 3.3, k * 1.7, 5, 31);
          const n2 = fbm3(u * 6.1 + k, v * 6.1, 9.3 + k, 3, 37);
          const edge = 1 - sm((r - 0.28 - n * 0.5) / 0.3);
          const lit = clamp(0.5 + (-u * 0.42 - v * 0.5) * 0.55 + (n - 0.5) * 0.7 + (n2 - 0.5) * 0.35);
          const o = (k * S * S + y * S + x) * 4;
          const val = 34 + lit * 128;
          all[o] = val * 1.0;
          all[o + 1] = val * 0.93;
          all[o + 2] = val * 0.86;
          all[o + 3] = clamp(edge) * 255;
        }
      }
    }
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, Buffer.from(all.buffer, all.byteOffset, all.length));
  }
  for (let k = 0; k < 4; k++) {
    const cv = createCanvas(S, S);
    const c = cv.getContext('2d');
    const img = c.createImageData(S, S);
    img.data.set(all.subarray(k * S * S * 4, (k + 1) * S * S * 4));
    c.putImageData(img, 0, 0);
    PUFFS.push(cv);
  }
  return PUFFS;
}

/** a boiling ash cloud seen from above, radius R */
export function ashTop(ctx, x, y, R, t, { a = 1, seed = 3, hot = 0, n = 36, spin = 0.05, dark = 0 } = {}) {
  if (a <= 0.01 || R < 3) return;
  const Pf = puffs();
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  const sh = ctx.createRadialGradient(x + R * 0.1, y + R * 0.12, R * 0.3, x + R * 0.1, y + R * 0.12, R * 1.25);
  sh.addColorStop(0, 'rgba(0,0,0,0.5)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(x - R * 1.4, y - R * 1.4, R * 2.8, R * 2.8);
  for (let i = 0; i < n; i++) {
    const dir = r() > 0.5 ? 1 : -1;
    const ang = r() * TAU + t * spin * dir;
    const rho = Math.pow(r(), 0.7) * R * 0.74;
    const s = R * (0.3 + r() * 0.34) * (1 - (rho / R) * 0.3);
    const rot = r() * TAU + t * 0.06 * dir;
    const al = 0.7 + r() * 0.3;
    ctx.save();
    ctx.translate(x + Math.cos(ang) * rho, y + Math.sin(ang) * rho);
    ctx.rotate(rot);
    ctx.globalAlpha = a * al;
    ctx.drawImage(Pf[i % Pf.length], -s, -s, s * 2, s * 2);
    ctx.restore();
  }
  if (dark > 0.01) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(90,82,76,${dark})`;
    ctx.beginPath();
    ctx.arc(x, y, R * 1.05, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (hot > 0.01) {
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(x, y, 0, x, y, R * 0.75);
    g.addColorStop(0, `rgba(255,226,170,${0.95 * hot})`);
    g.addColorStop(0.28, `rgba(255,120,44,${0.6 * hot})`);
    g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - R, y - R, R * 2, R * 2);
  }
  ctx.restore();
}

/** a plume drifting downwind from a vent, seen from above */
export function plumeTop(ctx, x, y, len, ang, t, { a = 1, w = 60, seed = 9 } = {}) {
  if (a <= 0.01) return;
  const Pf = puffs();
  const r = rng(seed);
  const n = 14;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const ph = (((t * 0.16 + i / n) % 1) + 1) % 1;
    const d = ph * len;
    const s = w * (0.45 + ph * 1.5) * (0.85 + r() * 0.3);
    const off = (r() - 0.5) * w * 0.6 * ph;
    const px = x + Math.cos(ang) * d - Math.sin(ang) * off;
    const py = y + Math.sin(ang) * d + Math.cos(ang) * off;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(r() * TAU + t * 0.1);
    ctx.globalAlpha = a * sm(ph / 0.12) * (1 - sm((ph - 0.55) / 0.45)) * 0.85;
    ctx.drawImage(Pf[i % Pf.length], -s, -s, s * 2, s * 2);
    ctx.restore();
  }
  ctx.restore();
}

/* ============================= INSTRUMENTS ================================= */

/** analogue sound-level gauge, 0..180 dB */
export function dbGauge(ctx, cx, cy, R, val, t, { a = 1, p = 1, crack = 0, refs = 1 } = {}) {
  if (a <= 0.01) return;
  const mini = clamp((260 - R) / 60);
  const q = EASE.outCubic(clamp(p));
  const A0 = Math.PI * 0.8;
  const A1 = Math.PI * 2.2;
  const ang = (v) => A0 + clamp(v / 180) * (A1 - A0);
  ctx.save();
  ctx.globalAlpha *= a;
  // body
  const bz = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.45, R * 0.1, cx, cy, R * 1.1);
  bz.addColorStop(0, 'rgba(34,44,60,0.97)');
  bz.addColorStop(0.8, 'rgba(10,14,22,0.97)');
  bz.addColorStop(1, 'rgba(6,8,12,0.97)');
  ctx.fillStyle = bz;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.08, 0, TAU);
  ctx.fill();
  const rim = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  rim.addColorStop(0, 'rgba(220,232,246,0.65)');
  rim.addColorStop(0.5, 'rgba(90,104,124,0.35)');
  rim.addColorStop(1, 'rgba(200,214,232,0.5)');
  ctx.strokeStyle = rim;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.08, 0, TAU);
  ctx.stroke();
  // coloured band
  const seg = (v0, v1, col) => {
    const e = Math.min(v1, 180 * q);
    if (e <= v0) return;
    ctx.strokeStyle = col;
    ctx.lineWidth = R * 0.075;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.86, ang(v0), ang(e));
    ctx.stroke();
  };
  ctx.lineCap = 'butt';
  seg(0, 85, 'rgba(95,227,192,0.55)');
  seg(85, 120, 'rgba(255,176,58,0.7)');
  seg(120, 180, 'rgba(255,74,58,0.85)');
  // ticks and numbers
  for (let v = 0; v <= 180; v += 5) {
    if (v > 180 * q + 0.01) break;
    const an = ang(v);
    const major = v % 20 === 0;
    const r0 = R * (major ? 0.71 : 0.75);
    const r1 = R * 0.8;
    ctx.strokeStyle = major ? 'rgba(236,242,250,0.9)' : 'rgba(236,242,250,0.42)';
    ctx.lineWidth = major ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0);
    ctx.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1);
    ctx.stroke();
    if (major && mini < 0.99) {
      txt(ctx, String(v), cx + Math.cos(an) * R * 0.6, cy + Math.sin(an) * R * 0.6 + 11, {
        size: 32, font: F.num6, color: v >= 120 ? '#FF8A7A' : 'rgba(236,242,250,0.85)', align: 'center', alpha: 1 - mini,
      });
    }
  }
  // reference points outside the dial
  if (refs > 0.01) {
    const list = [[30, 'BISIKAN'], [60, 'OBROLAN'], [110, 'KONSER'], [140, 'MESIN JET'], [172, 'KRAKATAU']];
    list.forEach(([v, s], i) => {
      const k = sm((refs * 6 - i) / 1);
      if (k <= 0.01) return;
      const an = ang(v);
      const kr = v === 172;
      const x0 = cx + Math.cos(an) * R * 1.1;
      const y0 = cy + Math.sin(an) * R * 1.1;
      const x1 = cx + Math.cos(an) * R * 1.24;
      const y1 = cy + Math.sin(an) * R * 1.24;
      ctx.save();
      ctx.globalAlpha *= k;
      ctx.strokeStyle = kr ? '#FF5A4A' : 'rgba(214,230,248,0.55)';
      ctx.lineWidth = kr ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      const right = Math.cos(an) > 0.05;
      const left = Math.cos(an) < -0.05;
      const al = right ? 'left' : left ? 'right' : 'center';
      const lx = x1 + (right ? 12 : left ? -12 : 0);
      const ly = y1 + (Math.sin(an) < -0.6 ? -14 : 8);
      txt(ctx, s, lx, ly, { size: kr ? 28 : 22, font: F.mono6, color: kr ? '#FF6E5E' : 'rgba(214,230,248,0.72)', track: 3, align: al });
      txt(ctx, `${v} dB`, lx, ly + (kr ? 34 : 28), { size: kr ? 26 : 20, font: F.mono, color: kr ? '#FFB0A6' : 'rgba(214,230,248,0.45)', track: 1, align: al });
      ctx.restore();
    });
  }
  // needle (with a short trail when it moves fast)
  const v = clamp(val, 0, 186);
  const jit = v > 168 ? Math.sin(t * 61) * 0.012 + Math.sin(t * 37) * 0.008 : 0;
  const an = ang(v) + jit;
  const hot = clamp((v - 120) / 50);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(an);
  ctx.shadowColor = hot > 0 ? `rgba(255,80,60,${0.9 * hot})` : 'rgba(255,176,58,0.6)';
  ctx.shadowBlur = 24;
  const ng = ctx.createLinearGradient(-R * 0.18, 0, R * 0.92, 0);
  ng.addColorStop(0, '#9AA6B6');
  ng.addColorStop(0.6, hot > 0.5 ? '#FF5A4A' : '#FFB03A');
  ng.addColorStop(1, '#FFF2D8');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.moveTo(-R * 0.18, -10);
  ctx.lineTo(R * 0.9, -2.2);
  ctx.lineTo(R * 0.93, 0);
  ctx.lineTo(R * 0.9, 2.2);
  ctx.lineTo(-R * 0.18, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  const hub = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, 34);
  hub.addColorStop(0, '#E8EEF6');
  hub.addColorStop(0.5, '#6C7888');
  hub.addColorStop(1, '#1C232E');
  ctx.fillStyle = hub;
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, TAU);
  ctx.fill();
  txt(ctx, 'dB SPL', cx, cy + R * 0.42, { size: 26, font: F.mono6, color: 'rgba(214,230,248,0.6)', track: 6, align: 'center', alpha: 1 - mini });
  // glass
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.04, 0, TAU);
  ctx.clip();
  const gl = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.2, cy + R * 0.3);
  gl.addColorStop(0, 'rgba(255,255,255,0.13)');
  gl.addColorStop(0.45, 'rgba(255,255,255,0.03)');
  gl.addColorStop(0.46, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(cx - R * 1.1, cy - R * 1.1, R * 2.2, R * 2.2);
  if (crack > 0.01) crackGlass(ctx, cx + R * 0.5, cy - R * 0.56, R * 1.5, crack, 23);
  ctx.restore();
  ctx.restore();
}

/** branching cracks growing out of an impact point */
export function crackGlass(ctx, x, y, L, p, seed = 5) {
  const r = rng(seed);
  const q = clamp(p);
  ctx.save();
  ctx.lineCap = 'round';
  const branch = (x0, y0, ang, len, depth, w) => {
    const steps = 6;
    let px = x0;
    let py = y0;
    let a = ang;
    const shown = len * q;
    let done = 0;
    const pts = [[px, py]];
    for (let i = 0; i < steps && done < shown; i++) {
      const sl = Math.min(len / steps, shown - done);
      a += (r() - 0.5) * 0.7;
      px += Math.cos(a) * sl;
      py += Math.sin(a) * sl;
      done += sl;
      pts.push([px, py]);
      if (depth < 2 && r() < 0.35) branch(px, py, a + (r() > 0.5 ? 0.8 : -0.8), len * 0.45, depth + 1, w * 0.6);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = w + 2;
    ctx.beginPath();
    pts.forEach(([a1, b1], i) => (i ? ctx.lineTo(a1 + 1, b1 + 1) : ctx.moveTo(a1 + 1, b1 + 1)));
    ctx.stroke();
    ctx.strokeStyle = 'rgba(236,246,255,0.75)';
    ctx.lineWidth = w;
    ctx.beginPath();
    pts.forEach(([a1, b1], i) => (i ? ctx.lineTo(a1, b1) : ctx.moveTo(a1, b1)));
    ctx.stroke();
  };
  const n = 9;
  for (let i = 0; i < n; i++) branch(x, y, (i / n) * TAU + r() * 0.5, L * (0.3 + r() * 0.45), 0, 2.2);
  // the impact star
  ctx.fillStyle = `rgba(255,255,255,${0.5 * q})`;
  ctx.beginPath();
  ctx.arc(x, y, 10 * q, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/**
 * The ear in section, drawn as a medical plate. Returns screen anchors for
 * callouts: { drum, bones, cochlea, canal }.
 *  vib  0..1 how hard the eardrum is moving    rupture 0..1 the tear
 *  wave 0..1 incoming pressure rings
 */
export function earSection(ctx, x, y, s, t, { a = 1, vib = 0, rupture = 0, wave = 0 } = {}) {
  const S = (px, py) => [x + px * s, y + py * s];
  const anchors = { drum: S(-62, 0), bones: S(20, -100), cochlea: S(250, 40), canal: S(-250, 0) };
  if (a <= 0.01) return anchors;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // the temporal bone: a dark warm mass everything is carved out of
  const tg = ctx.createRadialGradient(80, -60, 40, 80, 0, 640);
  tg.addColorStop(0, '#4A2C2C');
  tg.addColorStop(0.6, '#2A1719');
  tg.addColorStop(1, 'rgba(20,10,12,0)');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.ellipse(90, 0, 600, 360, 0, 0, TAU);
  ctx.fill();
  // fine bone texture
  const r = rng(77);
  ctx.fillStyle = 'rgba(255,220,200,0.035)';
  for (let i = 0; i < 260; i++) {
    const px = -380 + r() * 940;
    const py = -300 + r() * 600;
    ctx.beginPath();
    ctx.arc(px, py, 1 + r() * 3, 0, TAU);
    ctx.fill();
  }
  // outer ear
  const pin = new Path2D();
  pin.moveTo(-430, -262);
  pin.bezierCurveTo(-560, -300, -660, -130, -615, 60);
  pin.bezierCurveTo(-588, 196, -526, 292, -444, 304);
  pin.bezierCurveTo(-398, 306, -376, 262, -404, 222);
  pin.bezierCurveTo(-466, 160, -500, 64, -476, -14);
  pin.bezierCurveTo(-458, -70, -428, -62, -404, -30);
  pin.lineTo(-404, 36);
  pin.bezierCurveTo(-430, -120, -478, -196, -430, -262);
  pin.closePath();
  const pg = ctx.createLinearGradient(-640, -260, -380, 300);
  pg.addColorStop(0, '#A07E70');
  pg.addColorStop(0.55, '#6E5048');
  pg.addColorStop(1, '#3E2A28');
  ctx.fillStyle = pg;
  ctx.fill(pin);
  ctx.strokeStyle = 'rgba(255,214,190,0.45)';
  ctx.lineWidth = 3;
  ctx.stroke(pin);
  ctx.save();
  ctx.clip(pin);
  ctx.strokeStyle = 'rgba(40,22,20,0.55)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-452, -232);
  ctx.bezierCurveTo(-560, -250, -626, -110, -590, 50);
  ctx.bezierCurveTo(-566, 170, -514, 252, -452, 270);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,200,0.28)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-462, -214);
  ctx.bezierCurveTo(-556, -226, -606, -104, -574, 46);
  ctx.bezierCurveTo(-552, 158, -506, 236, -456, 252);
  ctx.stroke();
  const cg0 = ctx.createRadialGradient(-430, 10, 4, -440, 10, 90);
  cg0.addColorStop(0, 'rgba(20,8,8,0.85)');
  cg0.addColorStop(1, 'rgba(20,8,8,0)');
  ctx.fillStyle = cg0;
  ctx.fillRect(-540, -90, 200, 200);
  ctx.restore();
  // ear canal
  const canal = new Path2D();
  canal.moveTo(-412, -40);
  canal.bezierCurveTo(-300, -52, -180, -22, -70, -36);
  canal.lineTo(-58, 40);
  canal.bezierCurveTo(-180, 26, -300, 52, -412, 42);
  canal.closePath();
  const cg = ctx.createLinearGradient(0, -50, 0, 50);
  cg.addColorStop(0, '#0C0607');
  cg.addColorStop(0.5, '#1C1012');
  cg.addColorStop(1, '#0A0506');
  ctx.fillStyle = cg;
  ctx.fill(canal);
  ctx.strokeStyle = 'rgba(214,150,140,0.5)';
  ctx.lineWidth = 3;
  ctx.stroke(canal);
  // middle-ear cavity
  const cav = new Path2D();
  cav.moveTo(-56, -150);
  cav.bezierCurveTo(30, -190, 140, -150, 150, -60);
  cav.bezierCurveTo(160, 30, 120, 120, 30, 126);
  cav.bezierCurveTo(-30, 130, -60, 90, -58, 40);
  cav.closePath();
  ctx.fillStyle = 'rgba(8,4,6,0.85)';
  ctx.fill(cav);
  ctx.strokeStyle = 'rgba(214,150,140,0.3)';
  ctx.lineWidth = 2;
  ctx.stroke(cav);

  // incoming pressure rings, converging on the canal
  if (wave > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 6; i++) {
      const ph = (((t * 1.6 + i / 6) % 1) + 1) % 1;
      const rr = 260 + ph * 520;
      const al = wave * Math.sin(Math.PI * ph) * 0.85;
      ctx.strokeStyle = `rgba(255,${150 - i * 10},${90 - i * 8},${al})`;
      ctx.lineWidth = 6 + 6 * (1 - ph);
      ctx.beginPath();
      ctx.arc(-1000 + rr, 0, rr * 0.55, -0.42, 0.42);
      ctx.stroke();
    }
    ctx.restore();
  }

  // eardrum
  const dx = -64;
  const off = vib * (Math.sin(t * 52) * 0.6 + Math.sin(t * 31) * 0.4) * 16 * (1 - rupture);
  const torn = clamp(rupture);
  ctx.save();
  if (torn < 0.02) {
    const mg = ctx.createLinearGradient(dx - 20, -60, dx + 20, 60);
    mg.addColorStop(0, 'rgba(255,210,196,0.85)');
    mg.addColorStop(1, 'rgba(214,120,110,0.75)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.moveTo(dx - 6, -62);
    ctx.quadraticCurveTo(dx + off + 14, 0, dx + 6, 62);
    ctx.quadraticCurveTo(dx + off + 2, 0, dx - 6, -62);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,236,226,0.95)';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    // the membrane splits and the flaps fold inward
    const fold = EASE.outCubic(torn);
    const flap = (sgn) => {
      ctx.beginPath();
      ctx.moveTo(dx - 6, sgn * 62);
      ctx.quadraticCurveTo(dx + 16 + fold * 30, sgn * 34, dx + 10 + fold * 46, sgn * (6 + fold * 18));
      for (let k = 0; k < 5; k++) ctx.lineTo(dx + 8 + fold * 40 - k * 3, sgn * (6 + fold * 18) + sgn * (k % 2 ? 7 : -3));
      ctx.quadraticCurveTo(dx + 2, sgn * 30, dx - 6, sgn * 62);
      ctx.fillStyle = 'rgba(214,110,100,0.8)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,220,210,0.9)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    };
    flap(-1);
    flap(1);
    // flash and shards
    ctx.globalCompositeOperation = 'screen';
    const fl = ctx.createRadialGradient(dx, 0, 0, dx, 0, 220);
    fl.addColorStop(0, `rgba(255,90,70,${0.85 * (1 - torn * 0.6)})`);
    fl.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.fillStyle = fl;
    ctx.fillRect(dx - 240, -240, 480, 480);
    ctx.globalCompositeOperation = 'source-over';
    const rs = rng(19);
    for (let i = 0; i < 16; i++) {
      const an = (rs() - 0.5) * 2.2;
      const sp = 60 + rs() * 220;
      const dd = fold * sp;
      const px = dx + Math.cos(an) * dd;
      const py = Math.sin(an) * dd + fold * fold * 60;
      ctx.fillStyle = `rgba(255,200,190,${0.9 * (1 - fold)})`;
      ctx.beginPath();
      ctx.moveTo(px, py - 5);
      ctx.lineTo(px + 6, py + 3);
      ctx.lineTo(px - 5, py + 4);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();

  // ossicles: hammer, anvil, stirrup
  const bone = (pts, w) => {
    ctx.strokeStyle = '#2A1E16';
    ctx.lineWidth = w + 5;
    ctx.beginPath();
    pts.forEach(([a1, b1], i) => (i ? ctx.lineTo(a1, b1) : ctx.moveTo(a1, b1)));
    ctx.stroke();
    const bg2 = ctx.createLinearGradient(-60, -140, 140, 0);
    bg2.addColorStop(0, '#F4ECD8');
    bg2.addColorStop(1, '#BBA885');
    ctx.strokeStyle = bg2;
    ctx.lineWidth = w;
    ctx.beginPath();
    pts.forEach(([a1, b1], i) => (i ? ctx.lineTo(a1, b1) : ctx.moveTo(a1, b1)));
    ctx.stroke();
  };
  const jig = off * 0.5;
  bone([[dx + 4 + jig, 6], [-36 + jig * 0.8, -60], [-20 + jig * 0.6, -100]], 14);
  bone([[-20 + jig * 0.6, -104], [30 + jig * 0.4, -110], [56 + jig * 0.3, -50]], 16);
  bone([[56 + jig * 0.3, -46], [86, -40], [118, -34]], 9);
  ctx.fillStyle = '#E6DCC4';
  for (const [bx, by, br] of [[-18 + jig * 0.6, -108, 22], [34 + jig * 0.4, -106, 20]]) {
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#E6DCC4';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(84, -52);
  ctx.quadraticCurveTo(104, -66, 120, -50);
  ctx.moveTo(84, -28);
  ctx.quadraticCurveTo(104, -12, 120, -20);
  ctx.stroke();

  // inner ear: vestibule, canals, cochlea
  const tube = (draw, w) => {
    ctx.strokeStyle = '#2A1E16';
    ctx.lineWidth = w + 6;
    draw();
    ctx.stroke();
    ctx.strokeStyle = '#E2D6BA';
    ctx.lineWidth = w;
    draw();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120,90,70,0.6)';
    ctx.lineWidth = w * 0.3;
    draw();
    ctx.stroke();
  };
  tube(() => { ctx.beginPath(); ctx.ellipse(185, -120, 52, 66, 0.3, 0, TAU); }, 13);
  tube(() => { ctx.beginPath(); ctx.ellipse(232, -150, 58, 38, -0.2, 0, TAU); }, 12);
  tube(() => { ctx.beginPath(); ctx.ellipse(150, -158, 38, 54, -0.8, 0, TAU); }, 11);
  ctx.fillStyle = '#E2D6BA';
  ctx.beginPath();
  ctx.ellipse(160, -40, 40, 30, 0, 0, TAU);
  ctx.fill();
  // cochlea spiral
  const cx2 = 250;
  const cy2 = 40;
  const turns = 2.7;
  const seg = 110;
  let prev = null;
  for (let i = 0; i <= seg; i++) {
    const th = (i / seg) * turns * TAU;
    const rr2 = 96 * Math.exp(-0.17 * th);
    const px = cx2 + Math.cos(th + Math.PI) * rr2;
    const py = cy2 + Math.sin(th + Math.PI) * rr2 * 0.92;
    if (prev) {
      const w2 = 34 * (1 - i / seg) + 9;
      ctx.strokeStyle = '#2A1E16';
      ctx.lineWidth = w2 + 6;
      ctx.beginPath();
      ctx.moveTo(prev[0], prev[1]);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    prev = [px, py];
  }
  prev = null;
  for (let i = 0; i <= seg; i++) {
    const th = (i / seg) * turns * TAU;
    const rr2 = 96 * Math.exp(-0.17 * th);
    const px = cx2 + Math.cos(th + Math.PI) * rr2;
    const py = cy2 + Math.sin(th + Math.PI) * rr2 * 0.92;
    if (prev) {
      const w2 = 34 * (1 - i / seg) + 9;
      const lg = 0.75 + 0.25 * Math.sin(th);
      ctx.strokeStyle = `rgb(${Math.round(226 * lg)},${Math.round(214 * lg)},${Math.round(186 * lg)})`;
      ctx.lineWidth = w2;
      ctx.beginPath();
      ctx.moveTo(prev[0], prev[1]);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    prev = [px, py];
  }
  // nerve
  ctx.strokeStyle = 'rgba(232,199,122,0.75)';
  for (let i = 0; i < 5; i++) {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx2 + 6, cy2 + (i - 2) * 6);
    ctx.bezierCurveTo(cx2 + 120, cy2 + (i - 2) * 10 - 20, cx2 + 220, cy2 + 40 + (i - 2) * 14, cx2 + 330, cy2 + 30 + (i - 2) * 16);
    ctx.stroke();
  }
  ctx.restore();
  return anchors;
}

/** paper with a little tooth to it */
let PAPER = null;
function paperTex() {
  if (PAPER) return PAPER;
  const S = 512;
  const cv = createCanvas(S, S);
  const c = cv.getContext('2d');
  const img = c.createImageData(S, S);
  const d = img.data;
  const r = rng(808);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const n = (r() - 0.5) * 16;
      const fib = Math.sin(x * 0.9 + Math.sin(y * 0.07) * 6) * 2;
      d[i] = 236 + n + fib;
      d[i + 1] = 226 + n + fib;
      d[i + 2] = 204 + n;
      d[i + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  // foxing: faint brown spots
  for (let i = 0; i < 40; i++) {
    const x = r() * S;
    const y = r() * S;
    const rr = 2 + r() * 10;
    const g = c.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, 'rgba(150,110,60,0.10)');
    g.addColorStop(1, 'rgba(150,110,60,0)');
    c.fillStyle = g;
    c.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  PAPER = cv;
  return PAPER;
}

export function paperRect(ctx, x, y, w, h, { a = 1, rot = 0, shadow = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;
  }
  ctx.fillStyle = '#E9DFC6';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowColor = 'transparent';
  const pat = ctx.createPattern(paperTex(), 'repeat');
  ctx.fillStyle = pat;
  ctx.globalAlpha *= 0.9;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

/**
 * The barograph trace of a distant station, 27 Aug – 1 Sep 1883.
 * d: the station's angular distance from Krakatau, in degrees.
 * Returns the hour of each of the seven passes.
 */
export function passHours(d, laps = 3.5) {
  const out = [];
  for (let k = 0; k < 8; k++) {
    const base = Math.floor(k / 2) * 360;
    const th = k % 2 === 0 ? base + d : base + 360 - d;
    if (th <= laps * 360) out.push((th / 360) * 36);
  }
  return out.sort((a1, b1) => a1 - b1).slice(0, 7);
}
export function barogram(ctx, x, y, w, h, p, t, { a = 1, d = 106, rot = -0.012, count = 1 } = {}) {
  if (a <= 0.01) return 0;
  const hours = passHours(d);
  const T = 120;
  ctx.save();
  ctx.globalAlpha *= a;
  paperRect(ctx, x, y, w, h, { rot });
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  const gx = 70;
  const gy = 86;
  const gw = w - 110;
  const gh = h - 150;
  // printed grid in a violet-grey ink
  ctx.strokeStyle = 'rgba(80,70,120,0.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 60; i++) {
    const xx = gx + (i / 60) * gw;
    ctx.beginPath();
    ctx.moveTo(xx, gy);
    ctx.lineTo(xx, gy + gh);
    ctx.stroke();
  }
  for (let j = 0; j <= 10; j++) {
    const yy = gy + (j / 10) * gh;
    ctx.lineWidth = j % 5 === 0 ? 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(gx, yy);
    ctx.lineTo(gx + gw, yy);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(80,70,120,0.5)';
  ctx.lineWidth = 2;
  const days = ['27', '28', '29', '30', '31'];
  for (let dd = 0; dd < 5; dd++) {
    const h0 = 14 + dd * 24;
    const xx = gx + (h0 / T) * gw;
    if (h0 < T) {
      ctx.beginPath();
      ctx.moveTo(xx, gy - 8);
      ctx.lineTo(xx, gy + gh + 8);
      ctx.stroke();
    }
    const mid = gx + ((Math.max(0, h0 - 24) + Math.min(T, h0)) / 2 / T) * gw;
    txt(ctx, days[dd], dd === 0 ? gx + (7 / T) * gw : mid, gy + gh + 40, { size: 26, font: F.num6, color: 'rgba(60,48,96,0.85)', align: 'center' });
  }
  txt(ctx, 'AGUSTUS 1883', gx + gw, gy + gh + 40, { size: 20, font: F.mono6, color: 'rgba(60,48,96,0.7)', align: 'right', track: 3 });
  txt(ctx, 'BAROGRAF · TEKANAN UDARA', gx, 50, { size: 22, font: F.mono6, color: 'rgba(60,48,96,0.85)', track: 4 });
  txt(ctx, 'LONDON', gx + gw, 50, { size: 22, font: F.mono6, color: 'rgba(150,40,40,0.85)', track: 4, align: 'right' });
  // the ink trace
  const tc = clamp(p) * T;
  const amp = [1, 0.62, 0.47, 0.36, 0.28, 0.22, 0.17];
  const pres = (hh) => {
    let v = Math.sin((hh / 12) * TAU + 0.6) * 0.06 + Math.sin(hh * 0.13) * 0.05;
    hours.forEach((hk, k) => {
      const u = hh - hk;
      v += amp[k] * (Math.exp(-((u / 0.45) ** 2)) - 0.55 * Math.exp(-(((u - 0.9) / 0.7) ** 2)));
    });
    return v;
  };
  const yv = (v) => gy + gh * 0.62 - v * gh * 0.42;
  ctx.strokeStyle = '#4B2F86';
  ctx.lineWidth = 3.2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const step = 0.08;
  let last = [gx, yv(pres(0))];
  for (let hh = 0; hh <= tc; hh += step) {
    const xx = gx + (hh / T) * gw;
    const yy = yv(pres(hh));
    if (hh === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
    last = [xx, yy];
  }
  ctx.stroke();
  // pen arm and nib
  if (p > 0 && p < 1.001) {
    ctx.strokeStyle = 'rgba(40,36,44,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(last[0] + 150, last[1] - 70);
    ctx.stroke();
    ctx.fillStyle = '#4B2F86';
    ctx.beginPath();
    ctx.arc(last[0], last[1], 6, 0, TAU);
    ctx.fill();
  }
  // numbered passes
  let shown = 0;
  if (count > 0.01) {
    hours.forEach((hk, k) => {
      if (tc < hk) return;
      shown = k + 1;
      const q = sm((tc - hk) / 3);
      const xx = gx + (hk / T) * gw;
      const yy = yv(pres(hk)) - 34;
      ctx.save();
      ctx.globalAlpha *= q * count;
      ctx.strokeStyle = 'rgba(176,40,40,0.9)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(xx, yy - 8, 18, 0, TAU);
      ctx.stroke();
      txt(ctx, String(k + 1), xx, yy + 1, { size: 24, font: F.num, color: 'rgba(176,40,40,0.95)', align: 'center' });
      ctx.restore();
    });
  }
  ctx.restore();
  return shown;
}

/* =============================== TSUNAMI =================================== */

/**
 * A tsunami in profile. H = crest height in metres, xc = crest x, sea = the
 * still-water line, pxm = pixels per metre. The shore is on the right.
 */
export function waveSide(ctx, t, { a = 1, Hm = 0, xc = 600, sea = 1250, pxm = 20, run = 0 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const hgt = Hm * pxm;
  const ground = (x) => {
    if (x < 960) return sea + 120;
    if (x < 1110) return sea + 120 - ((x - 960) / 150) * 150;
    return sea - 30 - Math.sin(x * 0.02) * 3;
  };
  const prof = (x) => {
    const u = x - xc;
    const L = 320;
    const s = u > 0 ? u / (L * 0.26) : u / (L * 1.15);
    const sc = 1 / Math.cosh(s);
    const u2 = (x - (xc - 620)) / (L * 0.9);
    const s2 = 1 / Math.cosh(u2);
    const chop = Math.sin(x * 0.045 + t * 3.2) * 4 + Math.sin(x * 0.11 - t * 4.1) * 2;
    return sea - hgt * sc * sc - hgt * 0.32 * s2 * s2 + chop;
  };
  // land
  ctx.fillStyle = '#0B0D0E';
  ctx.beginPath();
  ctx.moveTo(900, H);
  for (let x = 900; x <= W + 10; x += 10) ctx.lineTo(x, ground(x));
  ctx.lineTo(W + 10, H);
  ctx.closePath();
  ctx.fill();
  // water body
  const top = (x) => {
    const yw = prof(x);
    const gr = ground(x);
    if (x > 960 && run <= 0) return Math.min(yw, gr) === yw && yw < gr ? yw : gr;
    return yw;
  };
  const wg = ctx.createLinearGradient(0, sea - hgt, 0, H);
  wg.addColorStop(0, '#3E8A9C');
  wg.addColorStop(0.18, '#1A5466');
  wg.addColorStop(0.45, '#0C3040');
  wg.addColorStop(1, '#020A10');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.moveTo(-10, H);
  for (let x = -10; x <= W + 10; x += 8) {
    const yw = top(x);
    if (x > 960 && yw >= ground(x) - 1) ctx.lineTo(x, ground(x));
    else ctx.lineTo(x, yw);
  }
  ctx.lineTo(W + 10, H);
  ctx.closePath();
  ctx.fill();
  // face shading: brighter where the water stands up
  if (hgt > 4) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const fg = ctx.createLinearGradient(xc - 120, 0, xc + 140, 0);
    fg.addColorStop(0, 'rgba(90,170,190,0)');
    fg.addColorStop(0.55, `rgba(110,200,220,${0.22 * clamp(hgt / 300)})`);
    fg.addColorStop(1, 'rgba(90,170,190,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(xc - 400, sea + 10);
    for (let x = xc - 400; x <= xc + 400; x += 8) ctx.lineTo(x, prof(x));
    ctx.lineTo(xc + 400, sea + 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // streaks inside the face
    ctx.strokeStyle = 'rgba(160,220,232,0.10)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const xx = xc - 160 + i * 22;
      const y0 = prof(xx) + 20;
      ctx.beginPath();
      ctx.moveTo(xx, y0);
      ctx.lineTo(xx - 30, Math.min(sea + 40, y0 + 160));
      ctx.stroke();
    }
    // the lip curling forward and its foam
    const crest = prof(xc);
    const lip = clamp(hgt / 260);
    ctx.fillStyle = 'rgba(214,240,244,0.85)';
    ctx.beginPath();
    ctx.moveTo(xc - 40, crest + 6);
    ctx.bezierCurveTo(xc + 30, crest - 26 * lip, xc + 120 * lip, crest - 6, xc + 130 * lip, crest + 46 * lip);
    ctx.bezierCurveTo(xc + 96 * lip, crest + 18, xc + 50, crest + 10, xc - 10, crest + 22);
    ctx.closePath();
    ctx.fill();
    const r = rng(41);
    for (let i = 0; i < 140; i++) {
      const xx = xc - 180 + r() * 320;
      const yy = prof(xx) + (r() - 0.3) * 18;
      ctx.fillStyle = `rgba(236,248,250,${0.25 + r() * 0.6})`;
      ctx.beginPath();
      ctx.arc(xx, yy, 1 + r() * 3.4, 0, TAU);
      ctx.fill();
    }
    // spray thrown back off the crest
    for (let i = 0; i < 70; i++) {
      const ph = ((t * 0.9 + r()) % 1);
      const xx = xc - 20 - ph * 260 + r() * 60;
      const yy = crest - 10 - Math.sin(ph * Math.PI) * 90 * lip - r() * 30;
      ctx.fillStyle = `rgba(220,240,246,${0.35 * (1 - ph)})`;
      ctx.beginPath();
      ctx.arc(xx, yy, 1.2 + r() * 2.4, 0, TAU);
      ctx.fill();
    }
  }
  // depth: the water darkens fast below the surface, with drifting silt
  const dg = ctx.createLinearGradient(0, sea, 0, sea + 420);
  dg.addColorStop(0, 'rgba(2,8,12,0)');
  dg.addColorStop(1, 'rgba(2,8,12,0.75)');
  ctx.fillStyle = dg;
  ctx.fillRect(0, sea, 1000, H - sea);
  const rs2 = rng(73);
  for (let i = 0; i < 90; i++) {
    const px = rs2() * 980;
    const py = sea + 20 + rs2() * 380 + Math.sin(t * 0.7 + i) * 6;
    ctx.fillStyle = `rgba(170,214,226,${0.05 + rs2() * 0.12})`;
    ctx.fillRect(px + ((t * 14 * (0.5 + rs2())) % 40), py, 2, 2);
  }
  // the sea floor rising to the beach: this is a cross-section
  const fg2 = ctx.createLinearGradient(0, sea + 160, 0, sea + 420);
  fg2.addColorStop(0, 'rgba(26,30,30,0.9)');
  fg2.addColorStop(1, 'rgba(6,8,9,1)');
  ctx.fillStyle = fg2;
  ctx.beginPath();
  ctx.moveTo(-10, H);
  ctx.lineTo(-10, sea + 360);
  ctx.bezierCurveTo(400, sea + 350, 760, sea + 300, 980, sea + 120);
  ctx.lineTo(1000, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,176,140,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, sea + 360);
  ctx.bezierCurveTo(400, sea + 350, 760, sea + 300, 980, sea + 120);
  ctx.stroke();
  // still-water line
  ctx.setLineDash([10, 12]);
  ctx.strokeStyle = 'rgba(214,230,248,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, sea);
  ctx.lineTo(W, sea);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  return { crest: prof(xc), ground };
}

/** coconut palm silhouette, s = height in px */
export function palm(ctx, x, y, s, lean, t, { color = '#06080A', a = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.035;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * s * 0.3, y - s * 0.6, x + lean * s * 0.45, y - s);
  ctx.stroke();
  const tx = x + lean * s * 0.45;
  const ty = y - s;
  ctx.fillStyle = color;
  for (let k = 0; k < 8; k++) {
    const an = -Math.PI / 2 + (k - 3.5) * 0.44 + Math.sin(t * 0.9 + k) * 0.04;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(an) * s * 0.26, ty + Math.sin(an) * s * 0.26 - s * 0.05, tx + Math.cos(an) * s * 0.4, ty + Math.sin(an) * s * 0.4 + s * 0.11);
    ctx.quadraticCurveTo(tx + Math.cos(an) * s * 0.22, ty + Math.sin(an) * s * 0.2 + s * 0.02, tx, ty);
    ctx.fill();
  }
  ctx.restore();
}

/* ============================== RED SUNSET ================================= */

let CLOUD = null;
function cloudStrip() {
  if (CLOUD) return CLOUD;
  const w = 720;
  const h = 300;
  const cv = createCanvas(w, h);
  const c = cv.getContext('2d');
  const img = c.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const n = fbm3(u * 7, v * 22, 3.3, 5, 61);
      const band = Math.sin(v * Math.PI);
      const al = clamp((n - 0.48) * 4) * band;
      const i = (y * w + x) * 4;
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
      d[i + 3] = al * 255;
    }
  }
  c.putImageData(img, 0, 0);
  CLOUD = cv;
  return CLOUD;
}

/** a post-Krakatau sunset: the sky too red, a Bishop's ring round the Sun */
export function redSky(ctx, t, { a = 1, red = 1, hz = 1180, sunX = 1040, sunY = 1150 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(0, 0, 0, hz);
  const mix = (c1, c2) => c1.map((v, i) => Math.round(lerp(v, c2[i], red)));
  const stop = (o, c1, c2) => {
    const [r, gg, b] = mix(c1, c2);
    g.addColorStop(o, `rgb(${r},${gg},${b})`);
  };
  stop(0, [10, 14, 26], [22, 8, 26]);
  stop(0.35, [26, 34, 58], [84, 18, 44]);
  stop(0.62, [70, 70, 96], [176, 34, 38]);
  stop(0.82, [190, 120, 90], [246, 92, 40]);
  stop(1, [250, 200, 140], [255, 196, 110]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, hz);
  // Bishop's ring: a pale disc and a brownish-red ring around the Sun
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const bg = ctx.createRadialGradient(sunX, sunY, 60, sunX, sunY, 420);
  bg.addColorStop(0, `rgba(255,236,210,${0.35 * red})`);
  bg.addColorStop(0.55, `rgba(220,200,200,${0.08 * red})`);
  bg.addColorStop(0.72, `rgba(200,110,80,${0.16 * red})`);
  bg.addColorStop(0.85, `rgba(160,70,60,${0.08 * red})`);
  bg.addColorStop(1, 'rgba(160,70,60,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(sunX - 440, sunY - 440, 880, 880);
  for (const [rr, al, lw] of [[300, 0.16, 36], [300, 0.22, 10]]) {
    ctx.strokeStyle = `rgba(214,120,96,${al * red})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(sunX, sunY, rr, Math.PI, TAU);
    ctx.stroke();
  }
  ctx.restore();
  // clouds lit from below, drifting
  const cl = cloudStrip();
  ctx.save();
  const bands = [[700, 0.55, 1.0], [860, 0.75, 0.7], [980, 0.6, 1.3]];
  bands.forEach(([yy, al, sp], i) => {
    const off = ((t * 8 * sp + i * 300) % W);
    for (let k = -1; k <= 1; k++) {
      ctx.globalAlpha = a * al;
      ctx.drawImage(cl, k * W * 1.2 - off, yy - 120, W * 1.2, 260);
    }
  });
  ctx.globalCompositeOperation = 'source-atop';
  const lg = ctx.createLinearGradient(0, 560, 0, hz);
  lg.addColorStop(0, `rgba(${Math.round(lerp(60, 120, red))},30,60,1)`);
  lg.addColorStop(0.6, `rgba(255,${Math.round(lerp(140, 96, red))},60,1)`);
  lg.addColorStop(1, 'rgba(255,190,120,1)');
  ctx.globalAlpha = 1;
  ctx.restore();
  // tint the clouds: a second pass of the same strip, coloured
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = a * 0.6;
  const tg = ctx.createLinearGradient(0, 560, 0, hz);
  tg.addColorStop(0, `rgb(${Math.round(lerp(90, 150, red))},40,80)`);
  tg.addColorStop(1, `rgb(255,${Math.round(lerp(150, 110, red))},70)`);
  ctx.fillStyle = tg;
  ctx.fillRect(0, 560, W, hz - 560);
  ctx.restore();
  // the Sun, flattened by the horizon
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 260);
  sg.addColorStop(0, 'rgba(255,240,210,1)');
  sg.addColorStop(0.18, 'rgba(255,190,110,0.9)');
  sg.addColorStop(0.5, `rgba(255,110,50,${0.35 + 0.2 * red})`);
  sg.addColorStop(1, 'rgba(255,80,40,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(sunX - 260, sunY - 260, 520, 520);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,236,196,0.95)';
  ctx.beginPath();
  ctx.ellipse(sunX, sunY, 58, 50, 0, 0, TAU);
  ctx.fill();
  // water
  const wg = ctx.createLinearGradient(0, hz, 0, H);
  wg.addColorStop(0, `rgb(${Math.round(lerp(120, 170, red))},${Math.round(lerp(80, 50, red))},60)`);
  wg.addColorStop(0.25, `rgb(${Math.round(lerp(40, 70, red))},20,30)`);
  wg.addColorStop(1, '#06040A');
  ctx.fillStyle = wg;
  ctx.fillRect(0, hz, W, H - hz);
  // sun glitter
  const r = rng(17);
  for (let i = 0; i < 150; i++) {
    const yy = hz + 6 + Math.pow(r(), 1.6) * 420;
    const spread = 30 + (yy - hz) * 0.45;
    const xx = sunX + (r() - 0.5) * spread * 2;
    const tw = 0.5 + 0.5 * Math.sin(t * (2 + r() * 4) + i);
    ctx.fillStyle = `rgba(255,${Math.round(190 + r() * 50)},140,${0.55 * tw * (1 - (yy - hz) / 500)})`;
    ctx.fillRect(xx, yy, 8 + r() * 30, 2);
  }
  ctx.restore();
}

/** Manhattan's waterline in 1883: low blocks, chimneys, church spires, masts */
export function skyline1883(ctx, hz, t, { a = 1, x0 = -20, x1 = 900, color = '#120609' } = {}) {
  if (a <= 0.01) return;
  const r = rng(1883);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  let x = x0;
  while (x < x1) {
    const w = 26 + r() * 54;
    const h = 22 + Math.pow(r(), 1.5) * 90;
    ctx.fillRect(x, hz - h, w + 1, h + 2);
    if (r() < 0.4) ctx.fillRect(x + w * 0.2, hz - h - 14, 6, 14);
    if (r() < 0.25) {
      ctx.beginPath();
      ctx.moveTo(x, hz - h);
      ctx.lineTo(x + w / 2, hz - h - 18);
      ctx.lineTo(x + w, hz - h);
      ctx.fill();
    }
    x += w;
  }
  // church spires; the tallest one stood over Wall Street
  for (const [sx, sh, sw] of [[380, 250, 34], [610, 150, 24], [140, 120, 20]]) {
    ctx.fillRect(sx - sw / 2, hz - sh * 0.45, sw, sh * 0.45);
    ctx.beginPath();
    ctx.moveTo(sx - sw / 2, hz - sh * 0.45);
    ctx.lineTo(sx, hz - sh);
    ctx.lineTo(sx + sw / 2, hz - sh * 0.45);
    ctx.fill();
  }
  // a few lit windows
  for (let i = 0; i < 40; i++) {
    const wx = x0 + r() * (x1 - x0);
    const wy = hz - 10 - r() * 60;
    ctx.fillStyle = `rgba(255,190,110,${0.25 + 0.3 * Math.sin(t * 2 + i)})`;
    ctx.fillRect(wx, wy, 3, 4);
  }
  ctx.restore();
}

/** three-masted ships at anchor */
export function ships(ctx, hz, t, { a = 1, list = [[150, 1.0], [430, 0.75], [760, 0.6]], color = '#0E0507' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  for (const [sx, s] of list) {
    const bob = Math.sin(t * 1.3 + sx) * 3 * s;
    const y = hz + 40 * s + bob;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx - 120 * s, y - 20 * s);
    ctx.lineTo(sx + 130 * s, y - 20 * s);
    ctx.lineTo(sx + 104 * s, y + 8 * s);
    ctx.lineTo(sx - 100 * s, y + 8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5 * s;
    const masts = [-60, 10, 76];
    masts.forEach((mx, i) => {
      const mh = (i === 1 ? 250 : 210) * s;
      ctx.beginPath();
      ctx.moveTo(sx + mx * s, y - 20 * s);
      ctx.lineTo(sx + mx * s, y - 20 * s - mh);
      ctx.stroke();
      ctx.lineWidth = 3 * s;
      for (let k = 1; k <= 3; k++) {
        const yy = y - 20 * s - mh * (0.3 + k * 0.2);
        const hw = (34 - k * 6) * s;
        ctx.beginPath();
        ctx.moveTo(sx + mx * s - hw, yy);
        ctx.lineTo(sx + mx * s + hw, yy);
        ctx.stroke();
      }
      ctx.lineWidth = 5 * s;
    });
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(sx - 120 * s, y - 20 * s);
    ctx.lineTo(sx - 60 * s, y - 20 * s - 210 * s);
    ctx.lineTo(sx + 10 * s, y - 20 * s - 250 * s);
    ctx.lineTo(sx + 76 * s, y - 20 * s - 210 * s);
    ctx.lineTo(sx + 130 * s, y - 20 * s);
    ctx.stroke();
  }
  ctx.restore();
}

/** the Brooklyn Bridge, opened May 1883: one tower and its web of cables */
export function brooklyn(ctx, x, hz, s, { a = 1, color = '#100507', rim = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const th = 340 * s;
  const tw = 86 * s;
  const deck = hz - 118 * s;
  const top = hz - th;
  // cables first (behind the tower)
  ctx.strokeStyle = color;
  ctx.lineWidth = 4 * s;
  const cab = (x0, y0, x1, y1, sag) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1);
    ctx.stroke();
  };
  const L = x - 1100 * s;
  cab(x, top + 20 * s, L, deck - 6 * s, 160 * s);
  cab(x, top + 20 * s, x + 520 * s, deck - 60 * s, 30 * s);
  // suspenders and diagonal stays
  ctx.lineWidth = 1.3 * s;
  for (let k = 1; k < 44; k++) {
    const f = k / 44;
    const xx = lerp(x, L, f);
    const yy = (1 - f) * (1 - f) * (top + 20 * s) + 2 * f * (1 - f) * (Math.max(top, deck) + 160 * s) + f * f * (deck - 6 * s);
    ctx.beginPath();
    ctx.moveTo(xx, yy);
    ctx.lineTo(xx, deck);
    ctx.stroke();
  }
  for (let k = 1; k <= 9; k++) {
    ctx.beginPath();
    ctx.moveTo(x - tw * 0.3, top + 30 * s);
    ctx.lineTo(x - k * 46 * s, deck);
    ctx.moveTo(x + tw * 0.3, top + 30 * s);
    ctx.lineTo(x + k * 40 * s, deck);
    ctx.stroke();
  }
  // deck
  ctx.fillStyle = color;
  ctx.fillRect(L - 200 * s, deck - 4 * s, (x + 700 * s) - (L - 200 * s), 12 * s);
  // tower with its two pointed arches
  ctx.beginPath();
  ctx.rect(x - tw / 2, top, tw, th + 10);
  ctx.rect(x - tw / 2 - 8 * s, top - 10 * s, tw + 16 * s, 16 * s);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  for (const ox of [-tw * 0.22, tw * 0.22]) {
    const aw = tw * 0.26;
    const ab = deck + 6 * s;
    const at = top + th * 0.22;
    ctx.beginPath();
    ctx.moveTo(x + ox - aw / 2, ab);
    ctx.lineTo(x + ox - aw / 2, at + aw * 0.6);
    ctx.quadraticCurveTo(x + ox - aw / 2, at, x + ox, at - aw * 0.2);
    ctx.quadraticCurveTo(x + ox + aw / 2, at, x + ox + aw / 2, at + aw * 0.6);
    ctx.lineTo(x + ox + aw / 2, ab);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  if (rim > 0.01) {
    ctx.strokeStyle = `rgba(255,150,80,${0.45 * rim})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + tw / 2 + 8 * s, top - 10 * s);
    ctx.lineTo(x + tw / 2, top + th);
    ctx.stroke();
  }
  ctx.restore();
}

/** a brass fire bell on its yoke, swinging */
export function fireBell(ctx, x, y, s, t, { a = 1, ring = 1 } = {}) {
  if (a <= 0.01) return;
  const sw = Math.sin(t * 9) * 0.32 * ring;
  ctx.save();
  ctx.globalAlpha *= a;
  // ringing arcs
  if (ring > 0.01) {
    for (let i = 0; i < 3; i++) {
      const ph = (t * 2.2 + i / 3) % 1;
      ctx.strokeStyle = `rgba(255,120,80,${0.6 * (1 - ph) * ring})`;
      ctx.lineWidth = 5 * s;
      for (const sg of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(x, y + 60 * s, (110 + ph * 120) * s, sg > 0 ? -0.5 : Math.PI - 0.5 + 1, sg > 0 ? 0.5 : Math.PI + 0.5);
        ctx.stroke();
      }
    }
  }
  ctx.translate(x, y);
  // yoke
  ctx.fillStyle = '#2A1A10';
  ctx.fillRect(-110 * s, -14 * s, 220 * s, 22 * s);
  ctx.rotate(sw);
  const bg = ctx.createLinearGradient(-90 * s, 0, 90 * s, 0);
  bg.addColorStop(0, '#6E4A1C');
  bg.addColorStop(0.35, '#F2C46A');
  bg.addColorStop(0.55, '#FFE4A0');
  bg.addColorStop(1, '#7A5220');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(-26 * s, 0);
  ctx.bezierCurveTo(-40 * s, 0, -54 * s, 30 * s, -58 * s, 80 * s);
  ctx.bezierCurveTo(-62 * s, 118 * s, -84 * s, 128 * s, -96 * s, 142 * s);
  ctx.lineTo(96 * s, 142 * s);
  ctx.bezierCurveTo(84 * s, 128 * s, 62 * s, 118 * s, 58 * s, 80 * s);
  ctx.bezierCurveTo(54 * s, 30 * s, 40 * s, 0, 26 * s, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,24,8,0.8)';
  ctx.lineWidth = 3 * s;
  ctx.stroke();
  ctx.fillStyle = '#B8862E';
  ctx.fillRect(-100 * s, 134 * s, 200 * s, 14 * s);
  // clapper lags behind the swing
  ctx.rotate(-sw * 1.6);
  ctx.strokeStyle = '#3A2410';
  ctx.lineWidth = 6 * s;
  ctx.beginPath();
  ctx.moveTo(0, 10 * s);
  ctx.lineTo(0, 150 * s);
  ctx.stroke();
  ctx.fillStyle = '#3A2410';
  ctx.beginPath();
  ctx.arc(0, 158 * s, 14 * s, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ================================ HUD BITS ================================= */

/** oscilloscope strip: a pressure signal that clips when it is too loud */
export function scope(ctx, x, y, w, h, t, level, { a = 1, spike = 0, color = '255,176,58' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(168,206,248,0.16)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const xx = x + (i / 10) * w;
    ctx.beginPath();
    ctx.moveTo(xx, y - h / 2);
    ctx.lineTo(xx, y + h / 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  const n = 260;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const xx = x + u * w;
    const env = level * (0.35 + 0.65 * Math.exp(-(((u - 0.62) / 0.12) ** 2)) * spike + 0.25 * (1 - spike));
    let v = Math.sin(u * 90 + t * 24) * 0.5 + Math.sin(u * 211 - t * 31) * 0.3 + Math.sin(u * 37 + t * 9) * 0.2;
    v *= env;
    const cl = Math.max(-1, Math.min(1, v));
    pts.push([xx, y - cl * h * 0.5, Math.abs(v) > 1]);
  }
  for (const [lw, al] of [[8, 0.12], [2.4, 1]]) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = `rgba(${color},${al})`;
    ctx.beginPath();
    pts.forEach(([xx, yy], i) => (i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy)));
    ctx.stroke();
  }
  const clipped = pts.some((p2) => p2[2]);
  if (clipped) {
    ctx.fillStyle = 'rgba(255,74,58,0.95)';
    ctx.fillRect(x + w - 92, y - h / 2 - 34, 92, 26);
    txt(ctx, 'CLIP', x + w - 46, y - h / 2 - 14, { size: 18, font: F.mono6, color: '#1A0806', align: 'center', track: 4 });
  }
  ctx.restore();
}

/** vertical LED meter */
export function ledMeter(ctx, x, y, w, h, level, t, { a = 1, n = 24 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const gap = 4;
  const sh = (h - gap * (n - 1)) / n;
  const lit = Math.round(clamp(level) * n);
  for (let i = 0; i < n; i++) {
    const yy = y + h - (i + 1) * sh - i * gap;
    const f = i / (n - 1);
    const col = f > 0.82 ? '255,74,58' : f > 0.62 ? '255,176,58' : '95,227,192';
    const on = i < lit;
    ctx.fillStyle = on ? `rgba(${col},0.95)` : `rgba(${col},0.10)`;
    if (on && f > 0.82) {
      ctx.shadowColor = `rgba(${col},0.9)`;
      ctx.shadowBlur = 16;
    } else ctx.shadowBlur = 0;
    ctx.fillRect(x, yy, w, sh);
  }
  ctx.restore();
}

/* ============================ MORE ELEMENTS ================================ */

/** the pre-1883 island outline, dashed, drawn up to p */
export function oldOutline(ctx, v, p, { a = 1, color = '255,176,58' } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.01) return;
  const ring = chartData().isl.old;
  const n = Math.max(2, Math.floor(ring.length * q));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.setLineDash([14, 10]);
  ctx.lineDashOffset = -q * 60;
  ctx.strokeStyle = `rgba(${color},0.9)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const [lo, la] = ring[i % ring.length];
    const [x, y] = cxy(v, la, lo);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/** a ring of water spreading on the chart (drawn under the land pass) */
export function waterRing(ctx, x, y, r, { a = 1 } = {}) {
  if (a <= 0.01 || r <= 1) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, Math.max(0, r - 60), x, y, r + 8);
  g.addColorStop(0, 'rgba(120,220,240,0)');
  g.addColorStop(0.8, `rgba(120,220,240,${0.16 * a})`);
  g.addColorStop(1, 'rgba(160,236,250,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r + 8, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(200,244,252,${0.8 * a})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** aerosol veil on the globe: a hazy band spreading west from Krakatau */
export function gVeil(ctx, v, lon0, extent, { a = 1, latS = -22, latN = 14, color = '226,138,72' } = {}) {
  if (a <= 0.01 || extent <= 0.5) return;
  const dLo = 3;
  const dLa = 3;
  ctx.save();
  for (let e = 0; e < extent; e += dLo) {
    const loA = lon0 - e;
    const loB = lon0 - Math.min(extent, e + dLo);
    const lead = sm((extent - e) / 30);
    for (let la = latS; la < latN; la += dLa) {
      const c = (la + dLa / 2 - (latS + latN) / 2) / ((latN - latS) / 2);
      const k = Math.exp(-c * c * 2.2) * lead;
      if (k < 0.03) continue;
      const p1 = gproj(v, la, loA);
      const p2 = gproj(v, la, loB);
      const p3 = gproj(v, la + dLa, loB);
      const p4 = gproj(v, la + dLa, loA);
      const z = Math.min(p1.z, p2.z, p3.z, p4.z);
      if (z <= 0) continue;
      ctx.globalAlpha = a * 0.7 * k * sm(z / 0.25);
      ctx.fillStyle = `rgb(${color})`;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

/** a steamship of the 1880s: hull, one funnel, two masts */
export function steamer(ctx, x, y, s, t, { a = 1, color = '#C9D6E2' } = {}) {
  if (a <= 0.01) return;
  const bob = Math.sin(t * 1.6) * 3 * s;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y + bob);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-120 * s, -18 * s);
  ctx.lineTo(126 * s, -18 * s);
  ctx.lineTo(104 * s, 14 * s);
  ctx.lineTo(-104 * s, 14 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-40 * s, -38 * s, 90 * s, 20 * s);
  ctx.fillRect(-6 * s, -78 * s, 22 * s, 42 * s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5 * s;
  for (const mx of [-78, 78]) {
    ctx.beginPath();
    ctx.moveTo(mx * s, -18 * s);
    ctx.lineTo(mx * s, -118 * s);
    ctx.moveTo(mx * s - 24 * s, -92 * s);
    ctx.lineTo(mx * s + 24 * s, -92 * s);
    ctx.stroke();
  }
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(-120 * s, -18 * s);
  ctx.lineTo(-78 * s, -118 * s);
  ctx.lineTo(78 * s, -118 * s);
  ctx.lineTo(126 * s, -18 * s);
  ctx.stroke();
  // smoke
  for (let i = 0; i < 6; i++) {
    const ph = (t * 0.5 + i / 6) % 1;
    ctx.fillStyle = `rgba(200,210,220,${0.22 * (1 - ph)})`;
    ctx.beginPath();
    ctx.arc(5 * s - ph * 90 * s, -84 * s - ph * 50 * s, (8 + ph * 22) * s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** a little volcano glyph with a plume, for diagrams */
export function volcanoIcon(ctx, x, y, s, t, { a = 1, hot = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = '#2A2420';
  ctx.beginPath();
  ctx.moveTo(x - 90 * s, y);
  ctx.lineTo(x - 18 * s, y - 70 * s);
  ctx.lineTo(x + 18 * s, y - 70 * s);
  ctx.lineTo(x + 90 * s, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,150,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (hot > 0.01) {
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(x, y - 72 * s, 0, x, y - 72 * s, 50 * s);
    g.addColorStop(0, `rgba(255,170,90,${0.9 * hot})`);
    g.addColorStop(1, 'rgba(255,80,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 50 * s, y - 122 * s, 100 * s, 100 * s);
    ctx.globalCompositeOperation = 'source-over';
  }
  for (let i = 0; i < 7; i++) {
    const ph = (t * 0.35 + i / 7) % 1;
    ctx.fillStyle = `rgba(120,112,104,${0.6 * (1 - ph)})`;
    ctx.beginPath();
    ctx.arc(x + ph * 40 * s, y - 80 * s - ph * 150 * s, (10 + ph * 30) * s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// famous active volcanoes along the arc, [lat, lon, name]
export const VOLCANOES = [
  [3.17, 98.39, 'SINABUNG'], [-0.38, 100.47, 'MARAPI'], [-1.7, 101.26, 'KERINCI'],
  [-6.1, 105.42, 'KRAKATAU'], [-6.72, 106.73, 'SALAK'], [-6.77, 107.6, 'TANGKUBAN PERAHU'],
  [-7.24, 109.21, 'SLAMET'], [-7.54, 110.45, 'MERAPI'], [-7.93, 112.31, 'KELUD'],
  [-7.94, 112.95, 'BROMO'], [-8.11, 112.92, 'SEMERU'], [-8.06, 114.24, 'IJEN'],
  [-8.34, 115.51, 'AGUNG'], [-8.41, 116.46, 'RINJANI'], [-8.25, 118.0, 'TAMBORA'],
  [-8.54, 122.78, 'LEWOTOBI'], [1.36, 124.79, 'LOKON'], [2.78, 125.4, 'KARANGETANG'],
  [0.8, 127.33, 'GAMALAMA'], [1.49, 127.63, 'IBU'], [-4.52, 129.88, 'BANDA API'],
];

/** Indonesia, flat, in a box: returns the projector */
export function indoMap(ctx, x, y, w, h, p, { a = 1, lo0 = 94.5, lo1 = 141.5, la0 = -11.2, la1 = 6.4 } = {}) {
  const pr = (la, lo) => [x + ((lo - lo0) / (lo1 - lo0)) * w, y + ((la1 - la) / (la1 - la0)) * h];
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.01) return pr;
  const rings = indoRings();
  ctx.save();
  ctx.globalAlpha *= a * q;
  ctx.beginPath();
  for (const r of rings) {
    r.forEach(([la, lo], i) => {
      const [px, py] = pr(la, lo);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
  }
  const lg = ctx.createLinearGradient(x, y, x, y + h);
  lg.addColorStop(0, 'rgba(46,56,50,0.95)');
  lg.addColorStop(1, 'rgba(26,32,30,0.95)');
  ctx.fillStyle = lg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(214,236,240,0.55)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
  return pr;
}

/** volcanic lightning flickering inside an ash cloud */
export function lightning(ctx, x, y, R, t, { a = 1, seed = 5, rate = 3.2 } = {}) {
  if (a <= 0.01) return;
  for (let lane = 0; lane < 2; lane++) {
    const ph = t * rate + lane * 0.5;
    const slot = Math.floor(ph);
    const r = rng(seed * 977 + slot * 31 + lane * 7);
    if (r() > 0.6) continue;
    const life = ph - slot;
    if (life > 0.3) continue;
    const k = (1 - life / 0.3) * a * (0.6 + 0.4 * Math.sin(life * 90));
    const ang = r() * TAU;
    const d = r() * R * 0.45;
    let px = x + Math.cos(ang) * d;
    let py = y + Math.sin(ang) * d;
    const dir = r() * TAU;
    const len = R * (0.3 + r() * 0.35);
    const pts = [[px, py]];
    for (let i = 0; i < 9; i++) {
      px += (Math.cos(dir + (r() - 0.5) * 1.5) * len) / 9;
      py += (Math.sin(dir + (r() - 0.5) * 1.5) * len) / 9;
      pts.push([px, py]);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const m = pts[4];
    const g = ctx.createRadialGradient(m[0], m[1], 0, m[0], m[1], R * 0.5);
    g.addColorStop(0, `rgba(180,196,255,${0.4 * k})`);
    g.addColorStop(1, 'rgba(180,196,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(m[0] - R * 0.5, m[1] - R * 0.5, R, R);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [w, al] of [[12, 0.12], [5, 0.35], [1.8, 1]]) {
      ctx.lineWidth = w;
      ctx.strokeStyle = `rgba(232,238,255,${al * k})`;
      ctx.beginPath();
      pts.forEach(([a1, b1], i) => (i ? ctx.lineTo(a1, b1) : ctx.moveTo(a1, b1)));
      ctx.stroke();
    }
    ctx.restore();
  }
}
