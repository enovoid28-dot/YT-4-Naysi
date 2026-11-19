/**
 * Episode 23 v3 art kit — the Moon, measured.
 *
 * Still 100 % code, still flat 2D canvas: no image files, no 3D engine.
 *
 *  · moonMaps()  a selenographic albedo map painted from numbers: the real
 *                maria at their real coordinates (Imbrium, Serenitatis,
 *                Tranquillitatis, Crisium …), a far side that is almost all
 *                highland, ~2 400 craters with bowls, rims, central peaks and
 *                ejecta, ray systems for the young ones (Tycho, Copernicus,
 *                Kepler, Aristarchus, Giordano Bruno), relief baked from a
 *                height field. Mip-mapped so small moons do not shimmer.
 *  · moonBall()  an orthographic raster of that map, one pixel at a time:
 *                exact projection, libration in longitude and latitude, a
 *                Lommel–Seeliger terminator for any sun direction (crescent,
 *                half, gibbous, full), earthshine on the night side.
 *  · deepSky()   nebula wash + starfield + drifting dust, cached tiles.
 *  · HUD kit     reticles, brackets, callouts, glass panels, rolling digits,
 *                donut, curved arrows, lens flare, padlock, Luna 3, photo print.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, txt, hexA, radGrad, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng, EASE } from '../engine/anim.mjs';
import { fbm3 } from './_earth.mjs';
import { starfield } from './_space.mjs';

const D = Math.PI / 180;
const sm = (v) => { const x = clamp(v); return x * x * (3 - 2 * x); };

/* ================================ MOON MAP ================================= */

const MW = 2048;
const MH = 1024;
const MAP_VERSION = 'moon-v3h';

// [lat, lon, radius°, tone]   tone > 0 warmer/browner, < 0 bluer (Ti-rich)
const MARIA = [
  // Oceanus Procellarum
  [18, -57, 14, 0.2], [5, -58, 11, 0.1], [30, -52, 10, 0.2], [-6, -47, 8.5, 0], [12, -43, 8.5, 0.1],
  [26, -65, 9, 0.1], [40, -57, 6.5, 0.2], [-12, -55, 6.5, 0], [0, -69, 5.5, 0], [-2, -38, 6, 0.1],
  // Imbrium
  [33, -16, 15.5, 0.5], [38, -27, 7.5, 0.5], [27, -9, 7.5, 0.4], [40, -6, 6, 0.4],
  // Serenitatis
  [28, 17, 9.8, 0.6],
  // Tranquillitatis
  [8, 31, 9.5, -0.8], [14, 24, 5.5, -0.7], [3, 38, 6.5, -0.8], [0, 24, 4.5, -0.7],
  // Crisium
  [17, 59, 7.6, -0.2],
  // Fecunditatis
  [-8, 51, 7.5, -0.3], [-3, 47, 4.8, -0.3], [-14, 54, 4.8, -0.3],
  // Nectaris
  [-15, 35, 5, -0.2],
  // Nubium, Cognitum, Insularum
  [-21, -17, 8.5, 0], [-12, -23, 4.6, 0], [7, -31, 6.4, 0.1],
  // Humorum
  [-24, -39, 5.6, 0],
  // Frigoris
  [57, -30, 4.2, 0.3], [56, -15, 4.6, 0.3], [56, 0, 4.6, 0.3], [57, 14, 4.2, 0.3], [58, 28, 3.6, 0.3], [60, 40, 2.8, 0.3],
  // Vaporum, Sinus Medii, limb maria, Orientale core
  [13, 4, 3.8, 0.3], [2, 1, 2.6, 0.2], [1, 87, 4.6, 0], [13, 86, 3.6, 0], [-39, 93, 5, 0], [-19, -93, 3.2, 0],
  // far side: Moscoviense, Tsiolkovskiy, Ingenii, Apollo patches
  [27, 148, 4.2, -0.2], [-20, 129, 2.0, 0], [-34, 163, 2.6, 0], [-36, -151, 3.4, 0],
];

// [lat, lon, radius°, young, darkFloor, rayLen°]
const NAMED = [
  [-43.3, -11.2, 1.45, 1, 0, 36], // Tycho
  [9.6, -20.1, 1.55, 1, 0, 19], // Copernicus
  [8.1, -38.0, 0.55, 1, 0, 12], // Kepler
  [23.7, -47.4, 0.62, 1, 0, 9], // Aristarchus
  [51.6, -9.4, 1.65, 0, 1, 0], // Plato
  [-5.2, -68.6, 2.8, 0, 1, 0], // Grimaldi
  [-58.4, -14.4, 3.7, 0, 0, 0], // Clavius
  [-9.3, -1.9, 2.5, 0, 0, 0], // Ptolemaeus
  [-13.4, -3.2, 1.9, 0, 0, 0], // Alphonsus
  [-18.2, -1.9, 1.6, 0, 0, 0], // Arzachel
  [-11.4, 26.4, 1.65, 0, 0, 0], // Theophilus
  [-13.2, 24.0, 1.6, 0, 0, 0], // Cyrillus
  [-8.9, 61.0, 2.2, 0, 0, 0], // Langrenus
  [-25.3, 60.4, 2.9, 0, 0, 0], // Petavius
  [29.7, -4.0, 1.4, 0, 1, 0], // Archimedes
  [14.5, -11.3, 0.97, 0, 0, 0], // Eratosthenes
  [2.6, -128.7, 9.5, 0, 0, 0], // Hertzsprung
  [-4.0, -157.0, 7.2, 0, 0, 0], // Korolev
  [-36.0, -151.0, 8.0, 0, 0, 0], // Apollo
  [5.7, 141.0, 5.1, 0, 0, 0], // Mendeleev
  [-5.9, 179.4, 1.6, 0, 0, 0], // Daedalus
  [36.0, 102.9, 0.4, 1, 0, 13], // Giordano Bruno
  [-20.4, 129.1, 3.0, 0, 1, 0], // Tsiolkovskiy
  [22.4, -163.1, 1.2, 1, 0, 14], // Jackson
  [18.4, -113.5, 1.0, 1, 0, 9], // Ohm
];

// fixed rotation for the noise domain (Euler 0.7, 1.1, 0.4)
const RM = (() => {
  const [a, b, c] = [0.7, 1.1, 0.4];
  const ca = Math.cos(a); const sa = Math.sin(a);
  const cb = Math.cos(b); const sb = Math.sin(b);
  const cc = Math.cos(c); const sc = Math.sin(c);
  return [
    cb * cc, -cb * sc, sb,
    sa * sb * cc + ca * sc, -sa * sb * sc + ca * cc, -sa * cb,
    -ca * sb * cc + sa * sc, ca * sb * sc + sa * cc, ca * cb,
  ];
})();

let MOON = null;

function cachePath() {
  return path.join(process.cwd(), 'out', 'cache', `${MAP_VERSION}-${MW}.bin`);
}

function paintMoon() {
  const N = MW * MH;
  const hgt = new Float32Array(N);
  const mare = new Float32Array(N);
  const R = new Float32Array(N);
  const G = new Float32Array(N);
  const B = new Float32Array(N);
  const add = new Float32Array(N);
  const mul = new Float32Array(N).fill(1);

  const mv = MARIA.map(([la, lo, rd, tone]) => {
    const a = la * D;
    const b = lo * D;
    const rr = rd * 1.2 * D;
    return { x: Math.cos(a) * Math.cos(b), y: Math.sin(a), z: Math.cos(a) * Math.sin(b), rd: rr, cr: Math.cos(Math.min(Math.PI, rr * 1.9)), tone };
  });
  const spa = { x: Math.cos(-53 * D) * Math.cos(191 * D), y: Math.sin(-53 * D), z: Math.cos(-53 * D) * Math.sin(191 * D) };

  for (let y = 0; y < MH; y++) {
    const lat = (0.5 - (y + 0.5) / MH) * Math.PI;
    const cl = Math.cos(lat);
    const sl = Math.sin(lat);
    for (let x = 0; x < MW; x++) {
      const lon = ((x + 0.5) / MW) * TAU;
      const px = cl * Math.cos(lon);
      const py = sl;
      const pz = cl * Math.sin(lon);
      const i = y * MW + x;
      // noise lives in a rotated frame so the value-noise lattice never lines
      // up with latitude/longitude (that is what makes coastlines look boxy)
      const rx = RM[0] * px + RM[1] * py + RM[2] * pz;
      const ry = RM[3] * px + RM[4] * py + RM[5] * pz;
      const rz = RM[6] * px + RM[7] * py + RM[8] * pz;
      // domain warp: coastlines of lava are never circles
      let qx = px + (fbm3(rx * 2.7 + 5.2, ry * 2.7, rz * 2.7, 5, 101) - 0.5) * 0.22;
      let qy = py + (fbm3(rx * 2.7, ry * 2.7 + 7.1, rz * 2.7, 5, 113) - 0.5) * 0.22;
      let qz = pz + (fbm3(rx * 2.7, ry * 2.7, rz * 2.7 + 9.3, 5, 127) - 0.5) * 0.22;
      const ql = Math.hypot(qx, qy, qz) || 1;
      qx /= ql; qy /= ql; qz /= ql;
      const en = fbm3(rz * 14 + 3.1, rx * 14, ry * 14, 4, 41);
      let f = 0;
      let tone = 0;
      for (let k = 0; k < mv.length; k++) {
        const c = mv[k];
        const dt = qx * c.x + qy * c.y + qz * c.z;
        if (dt < c.cr) continue;
        const z = Math.acos(dt > 1 ? 1 : dt) / c.rd;
        const g = Math.exp(-z * z * 1.7);
        f += g;
        tone += c.tone * g;
      }
      const m = sm((f + (en - 0.5) * 0.5 - 0.34) / 0.34);
      const tn = f > 0.001 ? tone / f : 0;
      const n0 = fbm3(rx * 2.4 - 4.1, ry * 2.4, rz * 2.4, 3, 3);
      const n1 = fbm3(ry * 7 + 1.7, rz * 7, rx * 7, 4, 7);
      const n2 = fbm3(rx * 30, ry * 30 + 4.4, rz * 30, 3, 13);
      const n3 = fbm3(rz * 13 - 2.2, rx * 13, ry * 13, 4, 29);
      // South Pole–Aitken: the biggest, oldest, darkest basin, on the far side
      const ds = Math.acos(clamp(px * spa.x + py * spa.y + pz * spa.z, -1, 1)) / D;
      const spaK = 1 - 0.1 * sm(1 - ds / 42);
      const hl = (0.8 + (n0 - 0.5) * 0.12 + (n1 - 0.5) * 0.15 + (n2 - 0.5) * 0.05) * spaK;
      const ml = 0.4 + (n3 - 0.5) * 0.16 + (n0 - 0.5) * 0.1 + (n1 - 0.5) * 0.06 + (n2 - 0.5) * 0.03;
      const v = hl * (1 - m) + ml * m;
      R[i] = v * (1.0 + 0.05 * tn * m);
      G[i] = v * (0.985 + 0.004 * tn * m);
      B[i] = v * (0.955 - 0.08 * tn * m);
      mare[i] = m;
      // highland roughness, maria nearly flat (with a few wrinkle ridges)
      const ridge = Math.abs(n3 - 0.5) < 0.02 ? 0.025 * (1 - Math.abs(n3 - 0.5) / 0.02) : 0;
      hgt[i] = ((n1 - 0.5) * 0.8 + (n3 - 0.5) * 0.45 + (n2 - 0.5) * 0.1) * (1 - 0.85 * m) + ridge * m;
    }
  }

  // ------------------------------ craters ---------------------------------
  const r = rng(1959);
  const list = NAMED.map(([la, lo, rd, young, dark, ray]) => ({ la, lo, rd, young, dark, ray, k: 1 }));
  for (let n = 0; n < 5600; n++) {
    const la = Math.asin(2 * r() - 1) / D;
    const lo = r() * 360 - 180;
    const rd = 0.16 * Math.pow(22, Math.pow(r(), 3.0));
    const xi = Math.floor((((lo / 360) % 1) + 1) % 1 * MW);
    const yi = clamp(Math.floor((0.5 - la / 180) * MH), 0, MH - 1);
    const mm = mare[yi * MW + xi];
    if (r() < mm * 0.82) continue; // maria are young: few craters
    list.push({ la, lo, rd, young: r() < 0.04 ? 1 : 0, dark: 0, ray: 0, k: 0.3 + r() * 0.7 });
  }
  // degraded old basins on the highlands
  for (let n = 0; n < 26; n++) {
    const la = Math.asin(2 * r() - 1) / D;
    const lo = r() * 360 - 180;
    list.push({ la, lo, rd: 4 + r() * 6, young: 0, dark: 0, ray: 0, k: 0.28 });
  }

  const dpp = 360 / MW;
  for (const c of list) {
    const ext = c.rd * 2.5;
    const coslc = Math.max(0.06, Math.cos(c.la * D));
    const y0 = clamp(Math.floor((0.5 - (c.la + ext) / 180) * MH), 0, MH - 1);
    const y1 = clamp(Math.ceil((0.5 - (c.la - ext) / 180) * MH), 0, MH - 1);
    const lonExt = Math.min(180, ext / coslc);
    const x0 = Math.floor(((c.lo - lonExt) / 360) * MW);
    const x1 = Math.ceil(((c.lo + lonExt) / 360) * MW);
    const depth = c.rd * 0.3 * c.k;
    const rimH = c.rd * 0.06 * c.k;
    const big = c.rd > 1.2;
    for (let y = y0; y <= y1; y++) {
      const lat = (0.5 - (y + 0.5) / MH) * 180;
      const dla = lat - c.la;
      const cosl = Math.cos(lat * D);
      for (let xx = x0; xx <= x1; xx++) {
        const lon = ((xx + 0.5) / MW) * 360;
        const dx = (lon - c.lo) * cosl;
        const q = Math.sqrt(dx * dx + dla * dla) / c.rd;
        if (q > 2.5) continue;
        const i = y * MW + (((xx % MW) + MW) % MW);
        let h = 0;
        if (q < 1) {
          h = depth * (q * q - 1);
          if (big) {
            const fl = depth * (0.12 - 1);
            if (h < fl) h = fl + (h - fl) * 0.12;
            h += depth * 0.42 * Math.exp(-(q / 0.12) * (q / 0.12));
          }
        }
        const qr = (q - 1) / 0.2;
        h += rimH * Math.exp(-qr * qr);
        if (q > 1) h += rimH * 0.55 * Math.exp(-(q - 1) * 2.4);
        hgt[i] += h;
        if (c.young) add[i] += q < 1 ? 0.07 : 0.15 * Math.exp(-(q - 1) * 1.5);
        if (c.dark && q < 0.95) mul[i] = Math.min(mul[i], 0.56 + 0.44 * sm((q - 0.72) / 0.23));
      }
    }
  }

  // ray systems: thin bright streaks, many, uneven, fading with distance
  for (const c of list) {
    if (!c.ray) continue;
    const L = c.ray;
    const bins = new Float32Array(720);
    const rr = rng(Math.round(c.la * 100 + c.lo * 7) + 99);
    const nRays = Math.round((c.rd > 1 ? 26 : 16) + rr() * 10);
    for (let k = 0; k < nRays; k++) {
      const th = rr() * 720;
      const wdt = 2.5 + rr() * 7;
      const st = 0.25 + rr() * 0.5;
      for (let b = 0; b < 720; b++) {
        let dd = Math.abs(b - th);
        if (dd > 360) dd = 720 - dd;
        bins[b] += st * Math.exp(-(dd / wdt) * (dd / wdt));
      }
    }
    const lenMul = new Float32Array(720);
    for (let b = 0; b < 720; b++) lenMul[b] = 0.45 + 0.55 * rr();
    const coslc = Math.max(0.06, Math.cos(c.la * D));
    const y0 = clamp(Math.floor((0.5 - (c.la + L) / 180) * MH), 0, MH - 1);
    const y1 = clamp(Math.ceil((0.5 - (c.la - L) / 180) * MH), 0, MH - 1);
    const lonExt = Math.min(180, L / coslc);
    const x0 = Math.floor(((c.lo - lonExt) / 360) * MW);
    const x1 = Math.ceil(((c.lo + lonExt) / 360) * MW);
    for (let y = y0; y <= y1; y++) {
      const lat = (0.5 - (y + 0.5) / MH) * 180;
      const dla = lat - c.la;
      const cosl = Math.cos(lat * D);
      for (let xx = x0; xx <= x1; xx++) {
        const lon = ((xx + 0.5) / MW) * 360;
        const dx = (lon - c.lo) * cosl;
        const d = Math.sqrt(dx * dx + dla * dla);
        if (d > L || d < c.rd * 1.1) continue;
        const b = Math.floor(((Math.atan2(dla, dx) / TAU + 1) % 1) * 720) % 720;
        const lm = lenMul[b] * L;
        if (d > lm) continue;
        const seg = 0.5 + 0.5 * Math.sin(d * 0.9 + b * 1.7) * Math.sin(d * 0.37 + b * 0.31);
        const f = Math.pow(1 - d / lm, 1.2) * sm(d / Math.max(c.rd * 3.2, 3.5)) * (0.55 + 0.45 * seg);
        const v = Math.min(1, bins[b]) * f;
        if (v <= 0.01) continue;
        const i = y * MW + (((xx % MW) + MW) % MW);
        add[i] += 0.3 * v * (c.rd > 1 ? 1 : 0.8);
      }
    }
  }

  // relief from the height field (sun from the west, a little north) + compose
  const rgb = new Uint8Array(N * 3);
  const shade = new Uint8Array(N);
  const K = 0.72;
  for (let y = 0; y < MH; y++) {
    const lat = (0.5 - (y + 0.5) / MH) * Math.PI;
    const cosl = Math.max(0.08, Math.cos(lat));
    const yu = y > 0 ? y - 1 : y;
    const yd = y < MH - 1 ? y + 1 : y;
    for (let x = 0; x < MW; x++) {
      const i = y * MW + x;
      const xl = x > 0 ? x - 1 : MW - 1;
      const xr = x < MW - 1 ? x + 1 : 0;
      const hx = (hgt[y * MW + xr] - hgt[y * MW + xl]) / (2 * dpp * cosl);
      const hy = (hgt[yu * MW + x] - hgt[yd * MW + x]) / (2 * dpp);
      const s = clamp(1 + K * (0.92 * hx - 0.34 * hy), 0.3, 1.7);
      shade[i] = Math.round(s * 150);
      const am = mul[i];
      const ad = add[i];
      rgb[i * 3] = clamp(Math.round((R[i] + ad) * am * 255), 0, 255);
      rgb[i * 3 + 1] = clamp(Math.round((G[i] + ad) * am * 255), 0, 255);
      rgb[i * 3 + 2] = clamp(Math.round((B[i] + ad * 0.98) * am * 255), 0, 255);
    }
  }
  return { rgb, shade };
}

function downsample(src, w, h) {
  const w2 = w >> 1;
  const h2 = h >> 1;
  const rgb = new Uint8Array(w2 * h2 * 3);
  const shade = new Uint8Array(w2 * h2);
  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      const a = (2 * y) * w + 2 * x;
      const b = a + 1;
      const c = a + w;
      const d = c + 1;
      const o = y * w2 + x;
      for (let k = 0; k < 3; k++) {
        rgb[o * 3 + k] = (src.rgb[a * 3 + k] + src.rgb[b * 3 + k] + src.rgb[c * 3 + k] + src.rgb[d * 3 + k] + 2) >> 2;
      }
      shade[o] = (src.shade[a] + src.shade[b] + src.shade[c] + src.shade[d] + 2) >> 2;
    }
  }
  return { rgb, shade, w: w2, h: h2 };
}

export function moonMaps() {
  if (MOON) return MOON;
  let base = null;
  const file = cachePath();
  try {
    if (fs.existsSync(file)) {
      const buf = fs.readFileSync(file);
      if (buf.length === MW * MH * 4) {
        base = { rgb: new Uint8Array(buf.buffer, buf.byteOffset, MW * MH * 3), shade: new Uint8Array(buf.buffer, buf.byteOffset + MW * MH * 3, MW * MH) };
      }
    }
  } catch { base = null; }
  if (!base) {
    base = paintMoon();
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.concat([Buffer.from(base.rgb.buffer, base.rgb.byteOffset, base.rgb.length), Buffer.from(base.shade.buffer, base.shade.byteOffset, base.shade.length)]));
    } catch { /* cache is optional */ }
  }
  const levels = [{ rgb: base.rgb, shade: base.shade, w: MW, h: MH }];
  for (let k = 1; k < 5; k++) {
    const p = levels[k - 1];
    levels.push(downsample(p, p.w, p.h));
  }
  MOON = { levels };
  return MOON;
}

/* =============================== MOON BALL ================================= */

const LUTS = new Map();
function lutFor(Ri, tiltDeg) {
  const tq = Math.round(tiltDeg * 10) / 10;
  const key = `${Ri}:${tq}`;
  let L = LUTS.get(key);
  if (L) return L;
  const size = 2 * Ri + 4;
  const c = Ri + 2;
  const cap = Math.ceil(Math.PI * (Ri + 2) * (Ri + 2)) + 16;
  const pix = new Int32Array(cap);
  const u = new Float32Array(cap);
  const v = new Float32Array(cap);
  const nx = new Float32Array(cap);
  const ny = new Float32Array(cap);
  const nz = new Float32Array(cap);
  const cov = new Float32Array(cap);
  const lb = new Float32Array(cap);
  const ct = Math.cos(tq * D);
  const st = Math.sin(tq * D);
  let n = 0;
  for (let py = 0; py < size; py++) {
    const dy = py + 0.5 - c;
    for (let px = 0; px < size; px++) {
      const dx = px + 0.5 - c;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > Ri + 0.75) continue;
      let ax = dx / Ri;
      let ay = -dy / Ri;
      const l2 = ax * ax + ay * ay;
      if (l2 > 1) { const l = Math.sqrt(l2); ax /= l; ay /= l; }
      const az = Math.sqrt(Math.max(0, 1 - ax * ax - ay * ay));
      const by = ay * ct + az * st;
      const bz = -ay * st + az * ct;
      const lat = Math.asin(clamp(by, -1, 1));
      const lon = Math.atan2(ax, bz);
      pix[n] = py * size + px;
      u[n] = lon / TAU;
      v[n] = 0.5 - lat / Math.PI;
      nx[n] = ax;
      ny[n] = ay;
      nz[n] = az;
      cov[n] = clamp(Ri + 0.5 - d);
      lb[n] = Math.pow(1 - az, 2.4);
      n++;
    }
  }
  L = { n, pix, u, v, nx, ny, nz, cov, lb, size, c };
  if (LUTS.size > 10) LUTS.delete(LUTS.keys().next().value);
  LUTS.set(key, L);
  return L;
}

const BUFS = new Map();
function bufFor(size) {
  let b = BUFS.get(size);
  if (!b) {
    const canvas = createCanvas(size, size);
    const bctx = canvas.getContext('2d');
    b = { canvas, ctx: bctx, img: bctx.createImageData(size, size) };
    if (BUFS.size > 10) BUFS.delete(BUFS.keys().next().value);
    BUFS.set(size, b);
  }
  return b;
}

/**
 * The Moon at (cx, cy), radius r.
 *  rot   longitude facing the camera, in turns (0 = near side, 0.5 = far side)
 *  tilt  latitude libration in degrees (+ shows more of the north)
 *  sun   direction to the Sun in view space: x right, y up, z toward viewer
 *  relief 0..1 baked crater relief, shine = earthshine on the night side
 */
export function moonBall(ctx, cx, cy, r, o = {}) {
  const {
    a = 1, rot = 0, tilt = 0, sun = { x: -0.8, y: 0.3, z: 0.5 }, relief = 1,
    shine = 0.06, glow = 0.3, exposure = 1, rim = 0.25, warm = 0, sepia = 0,
    ghost = null, extra = 0,
  } = o;
  if (a <= 0.01 || r < 2) return;
  const M = moonMaps();
  const Ri = Math.max(2, Math.round(r));
  const L = lutFor(Ri, tilt);
  const buf = bufFor(L.size);
  const texPerPx = (MW * 0.5) / (2 * Ri);
  const lvl = clamp(Math.floor(Math.log2(Math.max(1, texPerPx * 0.85))), 0, M.levels.length - 1);
  const T = M.levels[lvl];
  const tw = T.w;
  const th = T.h;
  const trgb = T.rgb;
  const tsh = T.shade;
  const sl = Math.hypot(sun.x, sun.y, sun.z) || 1;
  const sx = sun.x / sl;
  const sy = sun.y / sl;
  const sz = sun.z / sl;
  const data = buf.img.data;
  data.fill(0);
  const rotF = rot - Math.floor(rot);
  const es = shine;
  const rel = relief;
  const ex = exposure * 1.18;
  const wr = 1 + warm * 0.08;
  const wb = 1 - warm * 0.1;
  for (let k = 0; k < L.n; k++) {
    let uu = L.u[k] + rotF;
    uu -= Math.floor(uu);
    const fx = uu * tw - 0.5;
    const fy = clamp(L.v[k] * th - 0.5, 0, th - 1.001);
    let x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const ax = fx - x0;
    const ay = fy - y0;
    if (x0 < 0) x0 += tw;
    const x1 = x0 + 1 >= tw ? 0 : x0 + 1;
    const y1 = y0 + 1 >= th ? th - 1 : y0 + 1;
    const i00 = y0 * tw + x0;
    const i10 = y0 * tw + x1;
    const i01 = y1 * tw + x0;
    const i11 = y1 * tw + x1;
    const w00 = (1 - ax) * (1 - ay);
    const w10 = ax * (1 - ay);
    const w01 = (1 - ax) * ay;
    const w11 = ax * ay;
    let cr = trgb[i00 * 3] * w00 + trgb[i10 * 3] * w10 + trgb[i01 * 3] * w01 + trgb[i11 * 3] * w11;
    let cg = trgb[i00 * 3 + 1] * w00 + trgb[i10 * 3 + 1] * w10 + trgb[i01 * 3 + 1] * w01 + trgb[i11 * 3 + 1] * w11;
    let cb = trgb[i00 * 3 + 2] * w00 + trgb[i10 * 3 + 2] * w10 + trgb[i01 * 3 + 2] * w01 + trgb[i11 * 3 + 2] * w11;
    const sh = (tsh[i00] * w00 + tsh[i10] * w10 + tsh[i01] * w01 + tsh[i11] * w11) / 150;
    const nxk = L.nx[k];
    const nyk = L.ny[k];
    const nzk = L.nz[k];
    const mu0 = nxk * sx + nyk * sy + nzk * sz;
    const s = 1 + (sh - 1) * rel * (0.28 + 0.72 * (1 - (mu0 > 0 ? mu0 : 0)));
    let lum = 0;
    if (mu0 > -0.04) {
      const m0 = mu0 > 0 ? mu0 : 0;
      const ls = (2 * m0) / (m0 + nzk + 0.08);
      const day = sm((mu0 + 0.035) / 0.11);
      lum = (0.62 * Math.min(1.25, ls) + 0.38 * Math.min(1, m0 * 1.35)) * day * s;
    }
    const night = sm((0.05 - mu0) / 0.2);
    const e = es * night * (0.55 + 0.45 * nzk);
    let rr = cr * (lum * ex * wr + e * 0.82);
    let gg = cg * (lum * ex + e * 0.92);
    let bb = cb * (lum * ex * wb + e * 1.16);
    if (extra > 0) {
      // terrain that sits beyond the mean limb: only visible thanks to libration
      const lonT = (uu > 0.5 ? uu - 1 : uu) * TAU;
      const latT = (0.5 - L.v[k]) * Math.PI;
      const dd = Math.cos(latT) * Math.cos(lonT);
      if (dd < 0.02) {
        const f = extra * sm((0.02 - dd) / 0.05);
        rr = rr * (1 - 0.45 * f) + 255 * 0.62 * f * (0.35 + 0.65 * Math.min(1, lum + 0.2));
        gg = gg * (1 - 0.45 * f) + 176 * 0.62 * f * (0.35 + 0.65 * Math.min(1, lum + 0.2));
        bb = bb * (1 - 0.45 * f) + 58 * 0.62 * f * (0.35 + 0.65 * Math.min(1, lum + 0.2));
      }
    }
    if (sepia > 0) {
      const yv = rr * 0.3 + gg * 0.59 + bb * 0.11;
      rr = lerp(rr, yv * 1.12, sepia);
      gg = lerp(gg, yv * 0.98, sepia);
      bb = lerp(bb, yv * 0.78, sepia);
    }
    const p = L.pix[k] * 4;
    data[p] = rr > 255 ? 255 : rr;
    data[p + 1] = gg > 255 ? 255 : gg;
    data[p + 2] = bb > 255 ? 255 : bb;
    data[p + 3] = L.cov[k] * 255;
  }
  buf.ctx.putImageData(buf.img, 0, 0);
  const sc = r / Ri;
  const half = L.c * sc;
  const dw = L.size * sc;
  ctx.save();
  ctx.globalAlpha *= a;
  if (glow > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.55);
    g.addColorStop(0, `rgba(226,232,246,${0.22 * glow})`);
    g.addColorStop(0.35, `rgba(170,190,230,${0.08 * glow})`);
    g.addColorStop(1, 'rgba(120,140,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r * 1.6, cy - r * 1.6, r * 3.2, r * 3.2);
    ctx.restore();
  }
  if (ghost && ghost.n) {
    for (let gI = ghost.n; gI >= 1; gI--) {
      const f = gI / ghost.n;
      ctx.save();
      ctx.globalAlpha *= (ghost.alpha ?? 0.14) * (1 - f * 0.55);
      ctx.drawImage(buf.canvas, cx - half + ghost.dx * f, cy - half + ghost.dy * f, dw, dw);
      ctx.restore();
    }
  }
  ctx.drawImage(buf.canvas, cx - half, cy - half, dw, dw);
  if (rim > 0.01) {
    // the sunlit limb catches a thin bright edge
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const ang = Math.atan2(-sy, sx);
    const lit = clamp(Math.hypot(sx, sy));
    ctx.strokeStyle = `rgba(255,250,236,${0.35 * rim * lit})`;
    ctx.lineWidth = Math.max(1.2, r * 0.012);
    ctx.beginPath();
    ctx.arc(cx, cy, r - ctx.lineWidth * 0.5, ang - 1.15, ang + 1.15);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** thin lat/long graticule over a moon, for showing wobble */
export function graticule(ctx, cx, cy, r, { rot = 0, tilt = 0, a = 0.2, color = '180,210,255', lw = 1.4 } = {}) {
  if (a <= 0.01) return;
  const ct = Math.cos(tilt * D);
  const st = Math.sin(tilt * D);
  const proj = (lat, lon) => {
    const x = Math.cos(lat) * Math.sin(lon - rot * TAU);
    const y = Math.sin(lat);
    const z = Math.cos(lat) * Math.cos(lon - rot * TAU);
    // inverse of the tilt used in lutFor
    const vy = y * ct - z * st;
    const vz = y * st + z * ct;
    return { x: cx + x * r, y: cy - vy * r, z: vz };
  };
  ctx.save();
  ctx.lineWidth = lw;
  const seg = (pts) => {
    let on = false;
    ctx.beginPath();
    for (const p of pts) {
      if (p.z > 0.02) {
        if (!on) { ctx.moveTo(p.x, p.y); on = true; } else ctx.lineTo(p.x, p.y);
      } else on = false;
    }
    ctx.stroke();
  };
  for (let lo = -150; lo <= 180; lo += 30) {
    const pts = [];
    for (let la = -88; la <= 88; la += 4) pts.push(proj(la * D, lo * D));
    ctx.strokeStyle = `rgba(${color},${lo === 0 ? a * 2.2 : a})`;
    seg(pts);
  }
  for (let la = -60; la <= 60; la += 30) {
    const pts = [];
    for (let lo = -180; lo <= 180; lo += 4) pts.push(proj(la * D, lo * D));
    ctx.strokeStyle = `rgba(${color},${la === 0 ? a * 1.8 : a})`;
    seg(pts);
  }
  ctx.restore();
}

/* ================================= EARTH =================================== */
//
// The real coastlines (Natural Earth 1:50m via world-atlas, vector data), painted
// into an equirectangular map by code: ocean depth and shelves, biome belts,
// the big deserts, ice, a swirled cloud deck and the night-side city lights
// (Java among the brightest). Rendered by the same per-pixel orthographic
// raster as the Moon, with a sun glint on water and a Rayleigh limb.

const EW = 2048;
const EH = 1024;
const EARTH_VERSION = 'earth-v3e';

// [lat, lon, rLat°, rLon°, strength]
const DESERTS = [
  [22, 8, 9, 26, 1], [24, 45, 8, 12, 1], [29, 62, 5, 9, 0.8], [42, 95, 7, 17, 0.62], [-25, 132, 9, 15, 0.95],
  [-23, 19, 6, 7, 0.8], [31, -111, 5, 8, 0.7], [-45, -68, 6, 4, 0.6], [-22, -69, 7, 2.5, 0.8], [9, 46, 4, 5, 0.7],
  [44, 60, 5, 12, 0.6],
];
const CITIES = [
  [50, 8, 7, 14, 1], [52, 0, 3, 4, 1], [45, 10, 3, 5, 0.9], [55.7, 37.6, 3, 5, 0.8], [23, 79, 8, 8, 1], [31, 116, 8, 8, 1],
  [23, 113, 2, 3, 1], [36, 138, 3, 4, 1], [37.5, 127.5, 2, 2, 1], [39, -80, 6, 10, 1], [42, -74, 2, 3, 1], [34, -118, 2, 3, 0.9],
  [37.5, -122, 1.5, 1.5, 0.8], [-7.2, 110, 1.3, 5.5, 1.15], [-6.2, 106.8, 0.8, 1.2, 1.2], [3.5, 98.7, 1, 1.5, 0.6],
  [-5.1, 119.4, 0.8, 0.8, 0.6], [14.6, 121, 1.5, 1.5, 0.8], [30, 31.2, 3, 1.2, 0.9], [19.4, -99.1, 2.5, 3, 0.9],
  [-23, -46.6, 2.5, 4, 0.9], [6.5, 3.4, 2, 3, 0.7], [25.5, 51, 2, 3, 0.7], [13.7, 100.5, 2, 2, 0.8], [1.3, 103.8, 0.6, 0.6, 0.9],
  [-34.6, -58.4, 1.5, 1.5, 0.7], [-33.9, 151, 1.5, 1.5, 0.7], [-37.8, 145, 1.2, 1.2, 0.6], [41, 29, 1.5, 2, 0.8],
  [35.7, 51.4, 1.5, 1.5, 0.7], [24.9, 67, 1.5, 1.5, 0.7], [28.6, 77.2, 2, 2, 1],
];

let EARTH = null;

const ell = (lat, lon, list) => {
  let v = 0;
  for (const [la, lo, rl, ro, k] of list) {
    let dl = lon - lo;
    if (dl > 180) dl -= 360;
    if (dl < -180) dl += 360;
    const z = ((lat - la) / rl) ** 2 + (dl / ro) ** 2;
    if (z < 4) v += k * Math.exp(-z * 1.3);
  }
  return v;
};

function blurPlane(src, w, h, scale, px) {
  const a = createCanvas(w, h);
  const ac = a.getContext('2d');
  const img = ac.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = src[i];
    img.data[i * 4 + 3] = 255;
  }
  ac.putImageData(img, 0, 0);
  const sw = Math.round(w / scale);
  const sh = Math.round(h / scale);
  const b = createCanvas(sw, sh);
  const bc = b.getContext('2d');
  bc.filter = `blur(${px}px)`;
  bc.drawImage(a, 0, 0, sw, sh);
  bc.filter = 'none';
  const up = createCanvas(w, h);
  const uc = up.getContext('2d');
  uc.imageSmoothingEnabled = true;
  uc.drawImage(b, 0, 0, w, h);
  const d = uc.getImageData(0, 0, w, h).data;
  const out = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = d[i * 4] / 255;
  return out;
}

function paintEarth() {
  const require = createRequire(import.meta.url);
  const topo = require('world-atlas/land-50m.json');
  const { feature } = require('topojson-client');
  const land = feature(topo, topo.objects.land);
  const cv = createCanvas(EW, EH);
  const c = cv.getContext('2d');
  c.fillStyle = '#000';
  c.fillRect(0, 0, EW, EH);
  const X = (lo) => ((lo + 180) / 360) * EW;
  const Y = (la) => ((90 - la) / 180) * EH;
  c.fillStyle = '#fff';
  c.beginPath();
  for (const f of land.features) {
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of polys) {
      for (const ring of poly) {
        // unwrap across the antimeridian, then draw the ring at -360/0/+360 so
        // Chukotka and friends close on themselves instead of across the map
        const un = [];
        let off = 0;
        let prev = null;
        for (const [lo, la] of ring) {
          if (prev !== null) {
            const d = lo + off - prev;
            if (d > 180) off -= 360;
            else if (d < -180) off += 360;
          }
          un.push([lo + off, la]);
          prev = lo + off;
        }
        for (const shift of [-360, 0, 360]) {
          un.forEach(([lo, la], i) => (i ? c.lineTo(X(lo + shift), Y(la)) : c.moveTo(X(lo + shift), Y(la))));
          c.closePath();
        }
      }
    }
  }
  c.fill('evenodd');
  c.fillRect(0, Y(-84.2), EW, EH - Y(-84.2));
  const md = c.getImageData(0, 0, EW, EH).data;
  const N = EW * EH;
  const mask8 = new Uint8Array(N);
  for (let i = 0; i < N; i++) mask8[i] = md[i * 4];
  const near = blurPlane(mask8, EW, EH, 4, 3);
  const inland = blurPlane(mask8, EW, EH, 8, 10);

  const col = new Uint8Array(N * 3);
  const cloud = new Uint8Array(N);
  const lights = new Uint8Array(N);
  const ocean = new Uint8Array(N);
  const r = rng(2026);
  const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const belt = (al) => {
    // biome by |latitude|: rainforest → savanna → temperate → boreal → tundra
    const st = [[0, [26, 60, 28]], [12, [30, 66, 30]], [20, [92, 96, 52]], [34, [70, 86, 46]], [50, [52, 76, 40]], [60, [36, 54, 34]], [70, [104, 104, 94]], [90, [150, 150, 146]]];
    for (let k = 1; k < st.length; k++) {
      if (al <= st[k][0]) return lerp3(st[k - 1][1], st[k][1], (al - st[k - 1][0]) / (st[k][0] - st[k - 1][0]));
    }
    return st[st.length - 1][1];
  };
  for (let y = 0; y < EH; y++) {
    const lat = 90 - ((y + 0.5) / EH) * 180;
    const la = lat * D;
    const cl = Math.cos(la);
    const sl = Math.sin(la);
    const al = Math.abs(lat);
    // cloud thresholds by latitude: storm tracks and ITCZ cloudy, subtropics clear
    const th = 0.53 - 0.08 * Math.exp(-(((al - 52) / 12) ** 2)) - 0.09 * Math.exp(-(((lat - 6) / 7) ** 2)) + 0.07 * Math.exp(-(((al - 24) / 8) ** 2));
    for (let x = 0; x < EW; x++) {
      const lon = ((x + 0.5) / EW) * 360 - 180;
      const lo = lon * D;
      const px = cl * Math.cos(lo);
      const py = sl;
      const pz = cl * Math.sin(lo);
      const rx = RM[0] * px + RM[1] * py + RM[2] * pz;
      const ry = RM[3] * px + RM[4] * py + RM[5] * pz;
      const rz = RM[6] * px + RM[7] * py + RM[8] * pz;
      const i = y * EW + x;
      const m = mask8[i] / 255;
      const nr = near[i];
      const inl = inland[i];
      const tex = fbm3(rx * 9, ry * 9, rz * 9, 4, 211);
      // ocean: depth variation, continental shelves, polar sea ice
      const dn = fbm3(ry * 3, rz * 3, rx * 3, 3, 223);
      let oc = lerp3([4, 17, 42], [10, 36, 76], dn * 0.85);
      const shelf = sm((nr - 0.06) / 0.5) * (1 - m);
      oc = lerp3(oc, [26, 84, 112], shelf * 0.7);
      const seaIce = sm((al - (lat > 0 ? 73 : 62) - (tex - 0.5) * 8) / 7) * (0.7 + 0.3 * tex);
      oc = lerp3(oc, [222, 232, 240], seaIce);
      // land: belts, deserts, relief texture, ice sheets and snow
      let dry = ell(lat, lon, DESERTS) * (0.7 + 0.6 * inl);
      dry = clamp(dry + (fbm3(rx * 6 + 3, ry * 6, rz * 6, 4, 227) - 0.5) * 0.7);
      const g = belt(al);
      const dcol = lerp3([200, 166, 108], [150, 108, 64], fbm3(rz * 12, rx * 12, ry * 12, 3, 229));
      let lc = lerp3(g, dcol, sm(dry));
      const relief = 0.8 + 0.4 * tex;
      lc = [lc[0] * relief, lc[1] * relief, lc[2] * relief];
      let ice = 0;
      if (lat < -60) ice = 1;
      const gl = ell(lat, lon, [[73, -41, 11, 17, 1.6]]);
      if (gl > 0) ice = Math.max(ice, sm((gl - 0.25) / 0.35));
      ice = Math.max(ice, 0.75 * sm((al - 72 - (tex - 0.5) * 6) / 7));
      const hima = ell(lat, lon, [[31, 84, 4, 12, 1], [46, 9, 1.5, 4, 0.8], [-30, -70, 12, 1.5, 0.8], [52, -122, 8, 4, 0.6]]);
      if (hima > 0) ice = Math.max(ice, sm((hima * tex - 0.35) / 0.25) * 0.9);
      lc = lerp3(lc, [236, 240, 244], ice);
      const cc = lerp3(oc, lc, m);
      col[i * 3] = clamp(Math.round(cc[0]), 0, 255);
      col[i * 3 + 1] = clamp(Math.round(cc[1]), 0, 255);
      col[i * 3 + 2] = clamp(Math.round(cc[2]), 0, 255);
      ocean[i] = Math.round((1 - m) * (1 - seaIce) * 255);
      // clouds: domain-warped fbm, so fronts swirl instead of blob
      const wx = fbm3(px * 1.8 + 11, py * 3.2, pz * 1.8, 4, 241) - 0.5;
      const wy = fbm3(px * 1.8, py * 3.2 + 13, pz * 1.8, 4, 251) - 0.5;
      const cn = fbm3(px * 4 + wx * 2.6, py * 7.5 + wy * 2.6, pz * 4 + wx * 1.3, 6, 257);
      let cd = Math.pow(sm((cn - th) / 0.24), 0.85);
      cd *= 0.55 + 0.45 * fbm3(px * 20, py * 34, pz * 20, 3, 263);
      if (dry > 0.6 && m > 0.5) cd *= 0.45;
      cloud[i] = Math.round(clamp(cd) * 255);
      // city lights: dense regions + scattered towns
      let li = 0;
      if (m > 0.5 && !(lat < -60)) {
        const dens = ell(lat, lon, CITIES);
        const sp = r();
        if (dens > 0.02) li = clamp(dens * 0.16 * tex + (sp > 0.8 ? dens * 1.5 * (0.5 + tex) : 0));
        if (sp > 0.9975 && al < 62 && dry < 0.7) li = Math.max(li, 0.6 + 0.4 * r());
      }
      lights[i] = Math.round(li * 255);
    }
  }
  return { col, cloud, lights, ocean };
}

function downPlanes(src) {
  const w = src.w;
  const h = src.h;
  const w2 = w >> 1;
  const h2 = h >> 1;
  const out = { w: w2, h: h2 };
  for (const [key, ch] of [['col', 3], ['cloud', 1], ['lights', 1], ['ocean', 1]]) {
    const a = src[key];
    const b = new Uint8Array(w2 * h2 * ch);
    for (let y = 0; y < h2; y++) {
      for (let x = 0; x < w2; x++) {
        const i0 = (2 * y) * w + 2 * x;
        const o = y * w2 + x;
        for (let k = 0; k < ch; k++) {
          b[o * ch + k] = (a[i0 * ch + k] + a[(i0 + 1) * ch + k] + a[(i0 + w) * ch + k] + a[(i0 + w + 1) * ch + k] + 2) >> 2;
        }
      }
    }
    out[key] = b;
  }
  return out;
}

export function earthMaps3() {
  if (EARTH) return EARTH;
  const N = EW * EH;
  const file = path.join(process.cwd(), 'out', 'cache', `${EARTH_VERSION}-${EW}.bin`);
  let base = null;
  try {
    if (fs.existsSync(file)) {
      const buf = fs.readFileSync(file);
      if (buf.length === N * 6) {
        const u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
        base = { col: u8.subarray(0, N * 3), cloud: u8.subarray(N * 3, N * 4), lights: u8.subarray(N * 4, N * 5), ocean: u8.subarray(N * 5, N * 6) };
      }
    }
  } catch { base = null; }
  if (!base) {
    base = paintEarth();
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.concat([base.col, base.cloud, base.lights, base.ocean].map((a) => Buffer.from(a.buffer, a.byteOffset, a.length))));
    } catch { /* optional */ }
  }
  const levels = [{ ...base, w: EW, h: EH }];
  for (let k = 1; k < 5; k++) levels.push(downPlanes(levels[k - 1]));
  EARTH = { levels };
  return EARTH;
}

/**
 * Earth at (cx, cy), radius r. `lon` is the longitude facing the camera in
 * degrees (110 = Indonesia), `tilt` shows more of the north, `cloudLon` drifts
 * the weather, `sun` is the view-space direction to the Sun.
 */
export function earthBall(ctx, cx, cy, r, o = {}) {
  const {
    a = 1, lon = 110, tilt = 14, cloudLon = 0, sun = { x: -0.8, y: 0.25, z: 0.5 },
    lights = 1, clouds = 1, atmos = 1, spec = 1, exposure = 1, halo = 1,
  } = o;
  if (a <= 0.01 || r < 2) return;
  const E = earthMaps3();
  const Ri = Math.max(2, Math.round(r));
  const L = lutFor(Ri, tilt);
  const buf = bufFor(L.size);
  const texPerPx = (EW * 0.5) / (2 * Ri);
  const lvl = clamp(Math.floor(Math.log2(Math.max(1, texPerPx * 0.85))), 0, E.levels.length - 1);
  const T = E.levels[lvl];
  const tw = T.w;
  const th = T.h;
  const sl = Math.hypot(sun.x, sun.y, sun.z) || 1;
  const sx = sun.x / sl;
  const sy = sun.y / sl;
  const sz = sun.z / sl;
  let hx = sx;
  let hy = sy;
  let hz = sz + 1;
  const hl = Math.hypot(hx, hy, hz) || 1;
  hx /= hl; hy /= hl; hz /= hl;
  const rot = (((lon + 180) / 360) % 1 + 1) % 1;
  const crot = (((lon + cloudLon + 180) / 360) % 1 + 1) % 1;
  const data = buf.img.data;
  data.fill(0);
  const ex = exposure;
  const col = T.col;
  const cld = T.cloud;
  const lgt = T.lights;
  const ocn = T.ocean;
  const LU = L.u;
  const LV = L.v;
  const LX = L.nx;
  const LY = L.ny;
  const LZ = L.nz;
  const LB = L.lb;
  const LP = L.pix;
  const LC = L.cov;
  const thm = th - 1.001;
  for (let k = 0; k < L.n; k++) {
    let uu = LU[k] + rot;
    uu -= Math.floor(uu);
    const vv = LV[k];
    const fy = Math.min(thm, Math.max(0, vv * th - 0.5));
    const y0 = fy | 0;
    const ay = fy - y0;
    const r0 = y0 * tw;
    const r1 = r0 + tw;
    let fx = uu * tw - 0.5;
    let x0 = Math.floor(fx);
    const ax = fx - x0;
    if (x0 < 0) x0 += tw;
    const x1 = x0 + 1 >= tw ? 0 : x0 + 1;
    const w00 = (1 - ax) * (1 - ay);
    const w10 = ax * (1 - ay);
    const w01 = (1 - ax) * ay;
    const w11 = ax * ay;
    const a00 = r0 + x0;
    const a10 = r0 + x1;
    const a01 = r1 + x0;
    const a11 = r1 + x1;
    const nxk = LX[k];
    const nyk = LY[k];
    const nzk = LZ[k];
    const mu0 = nxk * sx + nyk * sy + nzk * sz;
    const dayL = mu0 > 0 ? mu0 : 0;
    const sq = Math.sqrt(dayL);
    const term = sm((mu0 + 0.08) / 0.26);
    const cr = col[a00 * 3] * w00 + col[a10 * 3] * w10 + col[a01 * 3] * w01 + col[a11 * 3] * w11;
    const cg = col[a00 * 3 + 1] * w00 + col[a10 * 3 + 1] * w10 + col[a01 * 3 + 1] * w01 + col[a11 * 3 + 1] * w11;
    const cb = col[a00 * 3 + 2] * w00 + col[a10 * 3 + 2] * w10 + col[a01 * 3 + 2] * w01 + col[a11 * 3 + 2] * w11;
    let cl = 0;
    if (clouds > 0) {
      let cu = LU[k] + crot;
      cu -= Math.floor(cu);
      let cfx = cu * tw - 0.5;
      let c0 = Math.floor(cfx);
      const cax = cfx - c0;
      if (c0 < 0) c0 += tw;
      const c1 = c0 + 1 >= tw ? 0 : c0 + 1;
      cl = (((cld[r0 + c0] * (1 - cax) + cld[r0 + c1] * cax) * (1 - ay) + (cld[r1 + c0] * (1 - cax) + cld[r1 + c1] * cax) * ay) / 255) * clouds;
    }
    const lit = (0.02 + 1.12 * (0.55 * dayL + 0.45 * sq)) * ex;
    const dusk = clamp(1 - Math.abs(mu0 - 0.04) / 0.16);
    let rr = cr * lit;
    let gg = cg * lit;
    let bb = cb * lit;
    if (spec > 0 && mu0 > 0) {
      const nh = nxk * hx + nyk * hy + nzk * hz;
      if (nh > 0.8) {
        const oc = (ocn[a00] * w00 + ocn[a10] * w10 + ocn[a01] * w01 + ocn[a11] * w11) / 255;
        let p2 = nh * nh; p2 *= p2; p2 *= p2; p2 *= p2; p2 *= p2; // nh^32
        const s2 = p2 * nh * nh * nh * nh * oc * spec * 0.5 * (1 - cl);
        rr += 255 * s2;
        gg += 226 * s2;
        bb += 180 * s2;
      }
    }
    if (cl > 0.003) {
      const cL = (0.03 + 1.12 * (0.4 * dayL + 0.6 * sq)) * ex * (0.78 + 0.22 * cl);
      const crr = 248 * cL * (1 + dusk * 0.1);
      const cgg = 250 * cL * (1 - dusk * 0.18);
      const cbb = 255 * cL * (1 - dusk * 0.4);
      rr += (crr - rr) * cl;
      gg += (cgg - gg) * cl;
      bb += (cbb - bb) * cl;
    }
    if (atmos > 0) {
      const limb = LB[k];
      const scat = (mu0 + 0.3 > 1 ? 1 : mu0 + 0.3 < 0 ? 0 : mu0 + 0.3) * atmos;
      rr += 34 * limb * scat + 6 * scat * term;
      gg += 88 * limb * scat + 14 * scat * term;
      bb += 200 * limb * scat + 28 * scat * term;
    }
    if (lights > 0 && mu0 < 0.06) {
      const lv = (lgt[a00] * w00 + lgt[a10] * w10 + lgt[a01] * w01 + lgt[a11] * w11) / 255;
      const ni = lv * lights * sm((0.04 - mu0) / 0.16) * (1 - 0.8 * cl);
      if (ni > 0.002) {
        rr += 255 * ni * 1.15;
        gg += 196 * ni * 1.15;
        bb += 112 * ni * 1.15;
      }
    }
    const p = LP[k] * 4;
    data[p] = rr > 255 ? 255 : rr;
    data[p + 1] = gg > 255 ? 255 : gg;
    data[p + 2] = bb > 255 ? 255 : bb;
    data[p + 3] = LC[k] * 255;
  }
  buf.ctx.putImageData(buf.img, 0, 0);
  const scl = r / Ri;
  const half = L.c * scl;
  const dw = L.size * scl;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.drawImage(buf.canvas, cx - half, cy - half, dw, dw);
  if (halo > 0.01) {
    // the thin blue shell, brightest toward the Sun
    ctx.globalCompositeOperation = 'screen';
    const ang = Math.atan2(-sy, sx);
    const lg = ctx.createLinearGradient(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, cx - Math.cos(ang) * r, cy - Math.sin(ang) * r);
    lg.addColorStop(0, `rgba(120,180,255,${0.75 * halo})`);
    lg.addColorStop(0.55, `rgba(90,150,255,${0.22 * halo})`);
    lg.addColorStop(1, `rgba(60,110,220,${0.04 * halo})`);
    const n = 7;
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1);
      ctx.globalAlpha = a * (1 - f) * 0.55;
      ctx.strokeStyle = lg;
      ctx.lineWidth = Math.max(1.5, r * 0.012);
      ctx.beginPath();
      ctx.arc(cx, cy, r * (1.002 + f * 0.05), 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ================================ DEEP SKY ================================= */

let NEB = null;
function nebulaTile() {
  if (NEB) return NEB;
  const w = 240;
  const h = 428;
  const cv = createCanvas(w, h);
  const c = cv.getContext('2d');
  const img = c.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const ny = y / h;
      const a = fbm3(nx * 3.2, ny * 5.6, 0.5, 5, 71);
      const b = fbm3(nx * 6.0 + 9, ny * 10.5, 1.5, 4, 83);
      const cc = fbm3(nx * 2.0 - 3, ny * 3.5, 2.5, 4, 97);
      const dust = sm((a - 0.42) / 0.3) * (0.6 + 0.4 * b);
      const vio = sm((cc - 0.5) / 0.25);
      const i = (y * w + x) * 4;
      d[i] = 40 + 70 * vio;
      d[i + 1] = 80 + 40 * (1 - vio);
      d[i + 2] = 150 + 60 * dust;
      d[i + 3] = clamp(dust * 0.55 + vio * dust * 0.25) * 255;
    }
  }
  c.putImageData(img, 0, 0);
  NEB = cv;
  return NEB;
}

/**
 * The space every scene sits in: graded void, nebula, Milky Way, star planes,
 * dust. Everything static is painted once into a padded plate per look (the
 * 30 soft Milky Way glows were ~100 ms of raster per frame); per frame we blit
 * the plate with parallax and draw only what moves: twinkling bright stars,
 * the near star plane and drifting dust.
 */
const PLATES = new Map();
const PADX = 140;
const PADY = 320;
function skyPlate(seed, band, bandY, neb, warm, n) {
  const key = `${seed}|${band}|${bandY}|${neb}|${warm}|${n}`;
  let pl = PLATES.get(key);
  if (pl) return pl;
  const pw = W + PADX * 2;
  const ph = H + PADY * 2;
  const cv = createCanvas(pw, ph);
  const c = cv.getContext('2d');
  c.translate(PADX, PADY);
  const g = c.createLinearGradient(0, -PADY, 0, H + PADY);
  g.addColorStop(0, '#04070E');
  g.addColorStop(0.45, '#060A14');
  g.addColorStop(1, '#030509');
  c.fillStyle = g;
  c.fillRect(-PADX, -PADY, pw, ph);
  if (warm > 0) {
    const wg = c.createRadialGradient(-80, 700, 0, -80, 700, 1500);
    wg.addColorStop(0, `rgba(255,170,80,${0.16 * warm})`);
    wg.addColorStop(0.4, `rgba(255,120,50,${0.05 * warm})`);
    wg.addColorStop(1, 'rgba(255,120,50,0)');
    c.fillStyle = wg;
    c.fillRect(-PADX, -PADY, pw, ph);
  }
  if (neb > 0) {
    c.save();
    c.globalCompositeOperation = 'screen';
    c.globalAlpha = 0.55 * neb;
    c.imageSmoothingEnabled = true;
    c.drawImage(nebulaTile(), -PADX, -PADY, pw, ph);
    c.restore();
  }
  starfield(c, { t: 0, n, seed, band, bandY, bandH: 760, top: -PADY + 20, bottom: H + PADY - 20 });
  pl = cv;
  if (PLATES.size >= 3) PLATES.delete(PLATES.keys().next().value);
  PLATES.set(key, pl);
  return pl;
}

export function deepSky(ctx, t, cam = {}, { seed = 11, band = 0.7, bandY = 900, neb = 1, warm = 0, n = 320, shiftY = 0 } = {}) {
  const px = (k) => ({ x: (cam.dx || 0) * k, y: (cam.dy || 0) * k });
  const plate = skyPlate(seed, band, bandY, neb, warm, n);
  let o = px(0.25);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(plate, Math.round(-PADX + o.x + Math.sin(t * 0.03) * 6), Math.round(-PADY + o.y + shiftY));
  ctx.restore();
  // bright stars: halo, diffraction cross, twinkle
  const rb = rng(seed * 7 + 999);
  ctx.save();
  for (let i = 0; i < 16; i++) {
    const x = rb() * W + o.x;
    const y = rb() * H + o.y + shiftY;
    const size = 1.6 + rb() * 1.8;
    const tw = 0.65 + 0.35 * Math.sin(t * (0.6 + rb() * 1.6) + i * 2.1);
    const warmC = rb() > 0.75 ? '255,226,190' : '214,228,255';
    ctx.globalAlpha = 0.5 * tw;
    const gl = ctx.createRadialGradient(x, y, 0, x, y, size * 7);
    gl.addColorStop(0, `rgba(${warmC},0.55)`);
    gl.addColorStop(1, `rgba(${warmC},0)`);
    ctx.fillStyle = gl;
    ctx.fillRect(x - size * 7, y - size * 7, size * 14, size * 14);
    ctx.globalAlpha = 0.9 * tw;
    ctx.fillStyle = `rgb(${warmC})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.3 * tw;
    ctx.strokeStyle = `rgb(${warmC})`;
    ctx.lineWidth = 1;
    const L = size * (6 + 6 * tw);
    ctx.beginPath();
    ctx.moveTo(x - L, y);
    ctx.lineTo(x + L, y);
    ctx.moveTo(x, y - L);
    ctx.lineTo(x, y + L);
    ctx.stroke();
  }
  ctx.restore();
  o = px(0.6);
  ctx.save();
  ctx.translate(o.x, o.y + shiftY * 1.4);
  starfield(ctx, { t: t * 1.3, n: 46, seed: seed + 50, a: 0.9 });
  ctx.restore();
  // drifting dust: tiny, near the lens, out of focus
  o = px(1.2);
  const r = rng(seed * 3 + 1);
  ctx.save();
  ctx.fillStyle = '#CFE0FF';
  for (let i = 0; i < 34; i++) {
    const bx = r() * W;
    const by = r() * H;
    const sp = 4 + r() * 10;
    const x = ((bx + t * sp + o.x) % (W + 40) + W + 40) % (W + 40) - 20;
    const y = by + Math.sin(t * 0.3 + i) * 12 + o.y + shiftY * 2;
    const rad = 1 + r() * 2.6;
    ctx.globalAlpha = 0.05 + 0.1 * r();
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/* ================================== HUD ==================================== */

export const HUD = {
  line: 'rgba(168,206,248,0.62)',
  dim: 'rgba(168,206,248,0.24)',
  text: '#D6E6F8',
  sub: 'rgba(214,230,248,0.6)',
  amber: '#FFB03A',
  amberHi: '#FFD27A',
  ice: '#9FD8FF',
  mint: '#5FE3C0',
  red: '#FF5A4A',
  bone: '#F3EFE4',
};

const fmtThousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export { fmtThousands };

/** corner brackets that open from the centre of their box */
export function brackets(ctx, x, y, w, h, p, { color = HUD.line, len = 36, lw = 2.4, a = 1 } = {}) {
  const q = EASE.outCubic(clamp(p));
  if (q <= 0.001) return;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const hw = (w / 2) * (0.6 + 0.4 * q);
  const hh = (h / 2) * (0.6 + 0.4 * q);
  ctx.save();
  ctx.globalAlpha *= a * q;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'square';
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const px = cx + sx * hw;
    const py = cy + sy * hh;
    ctx.beginPath();
    ctx.moveTo(px, py - sy * len);
    ctx.lineTo(px, py);
    ctx.lineTo(px - sx * len, py);
    ctx.stroke();
  }
  ctx.restore();
}

/** targeting reticle: rotating arc segments, a tick ring and cardinal marks */
export function reticle(ctx, cx, cy, r, t, p, { color = '168,206,248', a = 1, spin = 0.12, ticks = 120, label = null } = {}) {
  const q = EASE.outCubic(clamp(p));
  if (q <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineCap = 'butt';
  // tick ring sweeps in
  const nT = Math.floor(ticks * q);
  for (let i = 0; i < nT; i++) {
    const ang = -Math.PI / 2 + (i / ticks) * TAU;
    const major = i % 10 === 0;
    const r0 = r * 1.035;
    const r1 = r0 + (major ? r * 0.05 : r * 0.022);
    ctx.strokeStyle = `rgba(${color},${major ? 0.62 : 0.3})`;
    ctx.lineWidth = major ? 2.2 : 1.3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
    ctx.stroke();
  }
  // rotating arc segments
  const rot = t * spin * TAU;
  ctx.strokeStyle = `rgba(${color},0.7)`;
  ctx.lineWidth = 2.6;
  for (let k = 0; k < 4; k++) {
    const a0 = rot + k * (Math.PI / 2) + 0.22;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.14, a0, a0 + (Math.PI / 2 - 0.44) * q);
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(${color},0.35)`;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([3, 9]);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.22, -rot * 0.6, -rot * 0.6 + TAU * q);
  ctx.stroke();
  ctx.setLineDash([]);
  // cardinal marks
  ctx.strokeStyle = `rgba(${color},0.85)`;
  ctx.lineWidth = 2.4;
  for (let k = 0; k < 4; k++) {
    const ang = k * (Math.PI / 2);
    const r0 = r * 1.26;
    const r1 = r * (1.26 + 0.07 * q);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
    ctx.stroke();
  }
  if (label) {
    txt(ctx, label, cx + r * 1.3 * Math.cos(-0.78), cy + r * 1.3 * Math.sin(-0.78) - 8, {
      size: 22, font: F.mono6, color: `rgba(${color},0.9)`, track: 3, alpha: q,
    });
  }
  ctx.restore();
}

/** partial polyline by fraction of its length */
function partial(ctx, pts, p) {
  let total = 0;
  const seg = [];
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(l);
    total += l;
  }
  let left = total * clamp(p);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const l = seg[i - 1];
    const f = Math.min(1, left / l);
    ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f));
    left -= l;
  }
  ctx.stroke();
}
export { partial };

/**
 * A callout: anchor dot → elbow → shelf, label above the shelf, value below.
 * `side` is where the shelf runs from the elbow ('left' | 'right').
 */
export function callout(ctx, ax, ay, ex, ey, len, p, {
  label = '', value = '', side = 'right', color = HUD.line, text = HUD.text, accent = HUD.amber,
  a = 1, vsize = 40, lsize = 21, vfont = F.num, pulse = 0,
} = {}) {
  const q = clamp(p);
  if (q <= 0.001) return;
  const dir = side === 'right' ? 1 : -1;
  // the shelf always fits its text, so nothing gets cut by the reveal clip
  len = Math.max(len, measure(ctx, label, lsize, F.mono6, 3) + 20, measure(ctx, value, vsize, vfont, -0.5) + 20);
  const sx = ex + dir * len;
  ctx.save();
  ctx.globalAlpha *= a;
  // anchor
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(ax, ay, 6, 0, TAU);
  ctx.fill();
  if (pulse) {
    const k = (pulse % 1);
    ctx.strokeStyle = hexA(accent, 0.6 * (1 - k));
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ax, ay, 6 + k * 22, 0, TAU);
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  partial(ctx, [[ax, ay], [ex, ey], [sx, ey]], EASE.outCubic(clamp(q / 0.6)));
  const tq = EASE.outCubic(clamp((q - 0.35) / 0.65));
  if (tq > 0.001) {
    const tx = side === 'right' ? ex + 8 : sx + 8;
    ctx.save();
    ctx.beginPath();
    ctx.rect(Math.min(ex, sx) - 4, ey - vsize * 2.2, len + 8, vsize * 4);
    ctx.clip();
    txt(ctx, label, tx, ey - 14 + (1 - tq) * 20, { size: lsize, font: F.mono6, color: hexA(HUD.bone, 0.62), track: 3, alpha: tq });
    txt(ctx, value, tx, ey + vsize + 6 - (1 - tq) * 26, { size: vsize, font: vfont, color: text, track: -0.5, alpha: tq });
    ctx.restore();
  }
  ctx.restore();
}

let GRAIN = null;
function grainPattern(ctx) {
  if (!GRAIN) {
    const cv = createCanvas(160, 160);
    const c = cv.getContext('2d');
    const img = c.createImageData(160, 160);
    const r = rng(404);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (r() - 0.5) * 120;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    GRAIN = cv;
  }
  return ctx.createPattern(GRAIN, 'repeat');
}

function rrPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
export { rrPath };

/** frosted glass panel with grain, top light, edge light and an optional glow */
export function glass(ctx, x, y, w, h, p, { r = 28, tint = '120,170,235', edge = '190,222,255', glowC = null, a = 1, fill = 0.1 } = {}) {
  const q = EASE.outCubic(clamp(p));
  if (q <= 0.001) return;
  const hh = h * (0.9 + 0.1 * q);
  const yy = y + (h - hh) / 2;
  ctx.save();
  ctx.globalAlpha *= a * q;
  if (glowC) {
    ctx.save();
    ctx.shadowColor = glowC;
    ctx.shadowBlur = 50;
    rrPath(ctx, x, yy, w, hh, r);
    ctx.fillStyle = 'rgba(6,10,18,0.55)';
    ctx.fill();
    ctx.restore();
  }
  rrPath(ctx, x, yy, w, hh, r);
  ctx.fillStyle = 'rgba(6,10,18,0.55)';
  ctx.fill();
  ctx.save();
  rrPath(ctx, x, yy, w, hh, r);
  ctx.clip();
  const g = ctx.createLinearGradient(0, yy, 0, yy + hh);
  g.addColorStop(0, `rgba(${tint},${fill * 1.6})`);
  g.addColorStop(0.5, `rgba(${tint},${fill * 0.7})`);
  g.addColorStop(1, `rgba(${tint},${fill * 0.35})`);
  ctx.fillStyle = g;
  ctx.fillRect(x, yy, w, hh);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha *= 0.22;
  ctx.fillStyle = grainPattern(ctx);
  ctx.fillRect(x, yy, w, hh);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a * q;
  const tl = ctx.createLinearGradient(x, yy, x + w, yy);
  tl.addColorStop(0, `rgba(${edge},0)`);
  tl.addColorStop(0.3, `rgba(${edge},0.55)`);
  tl.addColorStop(0.7, `rgba(${edge},0.25)`);
  tl.addColorStop(1, `rgba(${edge},0)`);
  ctx.fillStyle = tl;
  ctx.fillRect(x, yy, w, 2);
  ctx.restore();
  rrPath(ctx, x + 0.5, yy + 0.5, w - 1, hh - 1, r);
  const eg = ctx.createLinearGradient(x, yy, x + w, yy + hh);
  eg.addColorStop(0, `rgba(${edge},0.42)`);
  eg.addColorStop(0.5, `rgba(${edge},0.10)`);
  eg.addColorStop(1, `rgba(${edge},0.30)`);
  ctx.strokeStyle = eg;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

/**
 * Rolling digits (odometer). `value` is continuous; the last digit rolls
 * freely, higher digits roll only while they carry. Decimal comma.
 */
const FIG = new Map();
/** max ascent/descent of the figures 0–9 in a font, as a fraction of the size */
function figureBox(ctx, font) {
  let m = FIG.get(font);
  if (m) return m;
  ctx.save();
  ctx.font = `1000px ${font}`;
  let asc = 0;
  let desc = 0;
  for (const ch of '0123456789') {
    const mm = ctx.measureText(ch);
    asc = Math.max(asc, mm.actualBoundingBoxAscent);
    desc = Math.max(desc, mm.actualBoundingBoxDescent);
  }
  ctx.restore();
  m = { asc: asc / 1000, desc: desc / 1000 };
  FIG.set(font, m);
  return m;
}

export function roll(ctx, value, x, y, {
  size = 120, font = F.num, color = HUD.bone, decimals = 0, align = 'left', a = 1,
  suffix = '', suffixColor = null, suffixSize = null, track = -2, thousands = false, glowC = null,
  prev = null,
} = {}) {
  if (a <= 0.001) return 0;
  // how fast the counter moves (value units per second), from last frame's value
  const rate = prev == null ? 0 : Math.abs(value - prev) * 90;
  const neg = value < 0;
  const v = Math.abs(value);
  const scale = Math.pow(10, decimals);
  const iv = v * scale;
  const intDigits = Math.max(1, String(Math.floor(v + 1e-9)).length);
  const nd = intDigits + decimals;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  const dW = Math.max(...'0123456789'.split('').map((c) => ctx.measureText(c).width)) + track;
  const commaW = ctx.measureText(',').width + track;
  const dotW = ctx.measureText('.').width + track;
  const ss = suffixSize || size;
  ctx.font = `${ss}px ${font}`;
  const sufW = suffix ? ctx.measureText(suffix).width + 8 : 0;
  ctx.font = `${size}px ${font}`;
  const groups = thousands ? Math.floor((intDigits - 1) / 3) : 0;
  const total = nd * dW + (decimals ? commaW : 0) + groups * dotW + sufW;
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.globalAlpha *= a;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  if (glowC) { ctx.shadowColor = glowC; ctx.shadowBlur = size * 0.25; }
  ctx.fillStyle = color;
  for (let k = nd - 1; k >= 0; k--) {
    const pk = Math.pow(10, k);
    const pos = iv / pk;
    const d = Math.floor(pos + 1e-9) % 10;
    // a real odometer: the last wheel turns continuously; a higher wheel only
    // turns while every wheel below it reads 9 and is rolling over
    let off;
    if (k === 0) off = iv - Math.floor(iv);
    else {
      const rem = iv - Math.floor(iv / pk) * pk;
      off = rem > pk - 1 ? rem - (pk - 1) : 0;
    }
    // a wheel spinning faster than the eye can follow just ticks (like a
    // real counter); slower wheels roll, with a smooth hand-over in between
    const speed = (rate * scale) / pk;
    const e = EASE.inOutQuad(off) * clamp((16 - speed) / 8);
    const leading = k >= decimals && k > decimals && Math.floor(pos) === 0 && k !== decimals;
    // the window hugs the real figure height of this font, and one wheel
    // step equals that window: at rest a neighbour is fully outside it
    const gm = figureBox(ctx, font);
    const top = size * (gm.asc + 0.03);
    const bot = size * (gm.desc + 0.03);
    const step = top + bot;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - 2, y - top, dW + 4, step);
    ctx.clip();
    if (!leading || e > 0) {
      const base = ctx.globalAlpha * (leading ? e : 1);
      ctx.globalAlpha = base * (1 - 0.7 * e);
      ctx.fillText(String(d), cx + dW / 2, y - e * step);
      if (e > 0.001) {
        ctx.globalAlpha = base * (0.3 + 0.7 * e);
        ctx.fillText(String((d + 1) % 10), cx + dW / 2, y + (1 - e) * step);
      }
    }
    ctx.restore();
    cx += dW;
    if (thousands && k >= decimals + 3 && (k - decimals) % 3 === 0) {
      ctx.fillText('.', cx + dotW / 2, y);
      cx += dotW;
    }
    if (decimals && k === decimals) {
      ctx.fillText(',', cx + commaW / 2, y);
      cx += commaW;
    }
  }
  if (suffix) {
    ctx.font = `${ss}px ${font}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = suffixColor || color;
    ctx.fillText(suffix, cx + 8, y);
  }
  ctx.restore();
  return total;
}

/** donut chart drawn as it sweeps in. segs: [{ v, color, hatch }] */
export function donut(ctx, cx, cy, r, w, segs, p, { gap = 0.012, start = -Math.PI / 2, a = 1, t = 0 } = {}) {
  const q = clamp(p);
  if (q <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineWidth = w;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(160,190,230,0.10)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  let acc = 0;
  const lim = q;
  for (const s of segs) {
    const a0 = acc;
    const a1 = Math.min(acc + s.v, lim);
    acc += s.v;
    if (a1 <= a0) continue;
    const g0 = start + a0 * TAU + gap;
    const g1 = start + a1 * TAU - gap;
    if (g1 <= g0) continue;
    ctx.strokeStyle = s.color;
    if (s.glow) { ctx.shadowColor = s.color; ctx.shadowBlur = 24; } else ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, g0, g1);
    ctx.stroke();
    if (s.hatch) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r + w / 2, g0, g1);
      ctx.arc(cx, cy, r - w / 2, g1, g0, true);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = 'rgba(200,220,255,0.18)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      for (let k = -r * 2; k < r * 2; k += 14) {
        ctx.beginPath();
        ctx.moveTo(cx + k + (t * 20) % 14, cy - r - w);
        ctx.lineTo(cx + k + r * 2 + (t * 20) % 14, cy + r + w);
        ctx.stroke();
      }
      ctx.restore();
      ctx.lineWidth = w;
    }
  }
  ctx.restore();
}

/** curved arrow along a circle, from angle a0 to a1 (radians) */
export function arcArrow(ctx, cx, cy, r, a0, a1, { color = HUD.amber, lw = 5, head = 20, a = 1, glowC = null } = {}) {
  if (a <= 0.001 || Math.abs(a1 - a0) < 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  if (glowC) { ctx.shadowColor = glowC; ctx.shadowBlur = 18; }
  const ccw = a1 < a0;
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a1, ccw);
  ctx.stroke();
  const ex = cx + Math.cos(a1) * r;
  const ey = cy + Math.sin(a1) * r;
  const tang = a1 + (ccw ? -Math.PI / 2 : Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(ex + Math.cos(tang) * head, ey + Math.sin(tang) * head);
  ctx.lineTo(ex + Math.cos(tang + 2.5) * head * 0.62, ey + Math.sin(tang + 2.5) * head * 0.62);
  ctx.lineTo(ex + Math.cos(tang - 2.5) * head * 0.62, ey + Math.sin(tang - 2.5) * head * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** straight arrow with a sharp head */
export function arrow(ctx, x0, y0, x1, y1, { color = HUD.amber, lw = 5, head = 22, a = 1, glowC = null, p = 1 } = {}) {
  const q = clamp(p);
  if (a <= 0.001 || q <= 0.001) return;
  const ex = lerp(x0, x1, q);
  const ey = lerp(y0, y1, q);
  const ang = Math.atan2(ey - y0, ex - x0);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  if (glowC) { ctx.shadowColor = glowC; ctx.shadowBlur = 18; }
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(ex - Math.cos(ang) * head * 0.6, ey - Math.sin(ang) * head * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - Math.cos(ang - 0.42) * head, ey - Math.sin(ang - 0.42) * head);
  ctx.lineTo(ex - Math.cos(ang + 0.42) * head, ey - Math.sin(ang + 0.42) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** anamorphic lens flare: streak, glints, and ghosts toward the frame centre */
export function flare(ctx, x, y, s, { a = 1, t = 0, color = '255,214,150', ghosts = true } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha *= a;
  const sw = s * 7;
  const g = ctx.createLinearGradient(x - sw, y, x + sw, y);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(0.5, `rgba(${color},0.5)`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - sw, y - s * 0.035, sw * 2, s * 0.07);
  ctx.globalAlpha = a * 0.5;
  ctx.fillRect(x - sw * 0.7, y - s * 0.12, sw * 1.4, s * 0.24);
  const core = ctx.createRadialGradient(x, y, 0, x, y, s);
  core.addColorStop(0, `rgba(255,248,230,0.9)`);
  core.addColorStop(0.2, `rgba(${color},0.35)`);
  core.addColorStop(1, `rgba(${color},0)`);
  ctx.globalAlpha = a;
  ctx.fillStyle = core;
  ctx.fillRect(x - s, y - s, s * 2, s * 2);
  if (ghosts) {
    const vx = W / 2 - x;
    const vy = H * 0.42 - y;
    const list = [[0.45, 0.12, '140,200,255'], [0.75, 0.06, '255,180,120'], [1.2, 0.18, '120,255,200'], [1.55, 0.09, '200,160,255']];
    for (const [k, rr, c] of list) {
      const gx = x + vx * k;
      const gy = y + vy * k;
      const gr = s * rr * 2.2;
      const gg = ctx.createRadialGradient(gx, gy, gr * 0.6, gx, gy, gr);
      gg.addColorStop(0, `rgba(${c},0.05)`);
      gg.addColorStop(0.85, `rgba(${c},0.12)`);
      gg.addColorStop(1, `rgba(${c},0)`);
      ctx.globalAlpha = a * (0.7 + 0.3 * Math.sin(t * 0.8 + k * 3));
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** padlock icon; closed 0 = shackle up, 1 = locked */
export function padlock(ctx, x, y, s, closed, { color = HUD.amber, a = 1, glowC = null, body = 'rgba(10,14,22,0.85)' } = {}) {
  if (a <= 0.001) return;
  const c = EASE.outBack ? EASE.outBack(clamp(closed)) : clamp(closed);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  if (glowC) { ctx.shadowColor = glowC; ctx.shadowBlur = s * 0.4; }
  const bw = s;
  const bh = s * 0.78;
  const lift = (1 - c) * s * 0.34;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -bh * 0.5 - lift, s * 0.3, Math.PI, 0);
  ctx.lineTo(s * 0.3, -bh * 0.5 + s * 0.06 - lift * (c < 1 ? 0 : 0));
  ctx.moveTo(-s * 0.3, -bh * 0.5 - lift);
  ctx.lineTo(-s * 0.3, -bh * 0.5 + s * 0.06 - lift);
  ctx.stroke();
  rrPath(ctx, -bw / 2, -bh / 2, bw, bh, s * 0.14);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = s * 0.07;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -s * 0.04, s * 0.09, 0, TAU);
  ctx.fill();
  ctx.fillRect(-s * 0.035, -s * 0.02, s * 0.07, s * 0.2);
  ctx.restore();
}

/** Luna 3, line-drawn: pressurised cylinder, domes, solar cells, antennas */
export function luna3(ctx, x, y, s, { a = 1, rot = 0, t = 0 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  const bw = s * 0.42;
  const bh = s * 0.9;
  const metal = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
  metal.addColorStop(0, '#3A4252');
  metal.addColorStop(0.35, '#C9D2DE');
  metal.addColorStop(0.55, '#8E99A8');
  metal.addColorStop(1, '#2A303C');
  // antennas
  ctx.strokeStyle = 'rgba(214,224,236,0.85)';
  ctx.lineWidth = Math.max(1.5, s * 0.012);
  for (const [ax, ay, bx, by] of [[-bw * 0.4, -bh * 0.3, -s * 0.55, -bh * 0.75], [bw * 0.4, -bh * 0.3, s * 0.55, -bh * 0.75], [-bw * 0.4, bh * 0.25, -s * 0.6, bh * 0.55], [bw * 0.4, bh * 0.25, s * 0.6, bh * 0.55], [0, -bh * 0.6, 0, -bh * 0.95]]) {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }
  // body
  ctx.fillStyle = metal;
  rrPath(ctx, -bw / 2, -bh * 0.42, bw, bh * 0.84, bw * 0.12);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -bh * 0.42, bw / 2, bw * 0.32, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, bh * 0.42, bw / 2, bw * 0.26, 0, 0, Math.PI);
  ctx.fill();
  // solar cell bands
  ctx.fillStyle = '#1E3A6A';
  for (const yy of [-bh * 0.18, bh * 0.12]) {
    ctx.fillRect(-bw / 2, yy, bw, bh * 0.09);
    ctx.strokeStyle = 'rgba(140,190,255,0.5)';
    ctx.lineWidth = 1;
    for (let k = 1; k < 6; k++) {
      ctx.beginPath();
      ctx.moveTo(-bw / 2 + (k * bw) / 6, yy);
      ctx.lineTo(-bw / 2 + (k * bw) / 6, yy + bh * 0.09);
      ctx.stroke();
    }
  }
  // camera window
  ctx.fillStyle = '#0B0F18';
  ctx.beginPath();
  ctx.arc(0, -bh * 0.5, bw * 0.13, 0, TAU);
  ctx.fill();
  const blink = 0.5 + 0.5 * Math.sin(t * 9);
  ctx.fillStyle = `rgba(255,90,74,${0.4 + 0.6 * blink})`;
  ctx.beginPath();
  ctx.arc(bw * 0.28, bh * 0.32, Math.max(2, s * 0.018), 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** a faint sightline from a viewer to a target with a moving dash */
export function sightline(ctx, x0, y0, x1, y1, t, { color = '255,176,58', a = 1, lw = 2 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = `rgba(${color},0.7)`;
  ctx.lineWidth = lw;
  ctx.setLineDash([10, 12]);
  ctx.lineDashOffset = -t * 40;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

/** small monospace label with tracking, the HUD's voice */
export function mono(ctx, s, x, y, { size = 22, color = HUD.sub, align = 'left', a = 1, track = 3, font = F.mono6 } = {}) {
  if (a <= 0.01) return;
  txt(ctx, s, x, y, { size, font, color, align, track, alpha: a });
}

/** scene headline number + subline, landing with overshoot (CPI grammar) */
export function hero(ctx, s, sub, x, y, p, { size = 250, color = HUD.bone, subColor = HUD.amber, a = 1, align = 'left', font = F.display } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.001) return;
  const e = 1 - Math.pow(1 - q, 3);
  const over = Math.sin(q * Math.PI) * Math.exp(-q * 4) * 0.12;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 2.2);
  ctx.beginPath();
  ctx.rect(align === 'left' ? x - 20 : 0, y - size * 1.05, W, size * 1.2);
  ctx.clip();
  txt(ctx, s, x, y + (1 - e - over) * size * 0.9, { size, font, color, track: -size * 0.03, align });
  ctx.restore();
  if (sub) {
    txt(ctx, sub, x + (align === 'left' ? 6 : 0), y + 52, {
      size: 25, font: F.mono6, color: subColor, track: 6, align, alpha: a * EASE.outCubic(clamp((q - 0.25) / 0.6)),
    });
  }
}

/** hairline dimension line with end caps and a centred label */
export function dimension(ctx, x0, y0, x1, y1, p, { label = '', color = HUD.line, a = 1, size = 24 } = {}) {
  const q = EASE.outCubic(clamp(p));
  if (q <= 0.001) return;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const hx = ((x1 - x0) / 2) * q;
  const hy = ((y1 - y0) / 2) * q;
  const ang = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mx - hx, my - hy);
  ctx.lineTo(mx + hx, my + hy);
  for (const s of [-1, 1]) {
    const ex = mx + s * hx;
    const ey = my + s * hy;
    ctx.moveTo(ex + Math.cos(ang) * 14, ey + Math.sin(ang) * 14);
    ctx.lineTo(ex - Math.cos(ang) * 14, ey - Math.sin(ang) * 14);
  }
  ctx.stroke();
  if (label) {
    const tw = measure(ctx, label, size, F.mono6, 3) + 28;
    ctx.fillStyle = 'rgba(5,8,14,0.92)';
    ctx.fillRect(mx - tw / 2, my - size * 0.8, tw, size * 1.6);
    txt(ctx, label, mx, my + size * 0.36, { size, font: F.mono6, color: HUD.text, track: 3, align: 'center', alpha: clamp((q - 0.5) / 0.5) });
  }
  ctx.restore();
}

/** a scan beam crossing a disc: bright line + fading trail */
export function scanBeam(ctx, cx, cy, r, p, { color = '160,220,255', a = 1 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || q >= 0.999 || a <= 0.01) return;
  const y = cy - r + q * 2 * r;
  ctx.save();
  ctx.globalAlpha *= a * Math.sin(q * Math.PI);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.01, 0, TAU);
  ctx.clip();
  const g = ctx.createLinearGradient(0, y - r * 0.5, 0, y);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(1, `rgba(${color},0.22)`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, y - r * 0.5, r * 2, r * 0.5);
  ctx.fillStyle = `rgba(${color},0.9)`;
  ctx.fillRect(cx - r, y - 1.5, r * 2, 3);
  ctx.restore();
}

/** HUD frame: side rulers that drift with the camera, timecode, corner ticks */
export function hudFrame(ctx, t, tg, { a = 1, cam = {} } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const off = ((cam.dy || 0) * 2 + t * 18) % 40;
  ctx.strokeStyle = 'rgba(168,206,248,0.16)';
  ctx.lineWidth = 1.4;
  for (const x of [52, W - 52]) {
    const dir = x < W / 2 ? 1 : -1;
    for (let y = 330 - off; y < 1640; y += 40) {
      const major = Math.round((y + off) / 40) % 5 === 0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dir * (major ? 20 : 10), y);
      ctx.stroke();
    }
  }
  const s = Math.max(0, tg);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  const ff = String(Math.floor((s % 1) * 90)).padStart(2, '0');
  txt(ctx, `T+${mm}:${ss}:${ff}`, W - 104, 156, { size: 20, font: F.mono, color: 'rgba(214,230,248,0.38)', track: 2, align: 'right' });
  ctx.restore();
}

/** cached warm photographic grain + scratches for the archival print */
let PRINT = null;
function printTexture() {
  if (PRINT) return PRINT;
  const cv = createCanvas(512, 512);
  const c = cv.getContext('2d');
  const img = c.createImageData(512, 512);
  const r = rng(1959);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 150;
    img.data[i] = v;
    img.data[i + 1] = v * 0.97;
    img.data[i + 2] = v * 0.9;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  c.strokeStyle = 'rgba(255,255,255,0.35)';
  c.lineWidth = 1;
  for (let k = 0; k < 18; k++) {
    const x = r() * 512;
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x + (r() - 0.5) * 40, 512);
    c.stroke();
  }
  PRINT = cv;
  return PRINT;
}

/** an archival photo print: paper border, image area drawn by `fn`, caption */
export function photoPrint(ctx, x, y, w, h, p, fn, { rot = -0.03, caption = '', sub = '', a = 1 } = {}) {
  const q = clamp(p);
  if (q <= 0.001) return;
  const e = EASE.outCubic(q);
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  ctx.translate(x + w / 2, y + h / 2 + (1 - e) * 160);
  ctx.rotate(rot * e + (1 - e) * 0.12);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = '#EDE6D6';
  ctx.fillRect(0, 0, w, h);
  ctx.shadowColor = 'transparent';
  const pad = w * 0.06;
  const ih = h - pad * 2 - 110;
  ctx.fillStyle = '#0B0B0B';
  ctx.fillRect(pad, pad, w - pad * 2, ih);
  ctx.save();
  ctx.beginPath();
  ctx.rect(pad, pad, w - pad * 2, ih);
  ctx.clip();
  fn(pad, pad, w - pad * 2, ih);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.35;
  ctx.drawImage(printTexture(), pad, pad, w - pad * 2, ih);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  // scan banding like the 1959 transmission
  ctx.fillStyle = 'rgba(255,240,210,0.05)';
  for (let yy = pad; yy < pad + ih; yy += 6) ctx.fillRect(pad, yy, w - pad * 2, 2);
  const vg = ctx.createRadialGradient(w / 2, pad + ih / 2, ih * 0.2, w / 2, pad + ih / 2, ih * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(pad, pad, w - pad * 2, ih);
  ctx.restore();
  // paper grain
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.12;
  ctx.drawImage(printTexture(), 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  txt(ctx, caption, pad, h - pad - 40, { size: 30, font: F.mono6, color: '#2A241C', track: 3 });
  txt(ctx, sub, pad, h - pad, { size: 22, font: F.mono, color: 'rgba(42,36,28,0.7)', track: 2 });
  ctx.restore();
}

/* ============================= SCENE HELPERS =============================== */

/** start time (scene-local s) of word i of caption card ci, from the take */
export const wordT = (scene, ci, i, off = 0) => {
  const c = scene && scene.captions && scene.captions[ci];
  const w = c && c.words && c.words[Math.min(i, c.words.length - 1)];
  return (w ? w.start : c ? c.from : 0) + off;
};

/** pill label */
export function chip(ctx, s, x, y, p, { color = HUD.amber, bg = 'rgba(8,12,20,0.78)', size = 24, align = 'center', a = 1, icon = null } = {}) {
  const q = EASE.outCubic(clamp(p));
  if (q <= 0.001 || a <= 0.001) return;
  const tw = measure(ctx, s, size, F.mono6, 3);
  const pad = size * 0.8;
  const iw = icon ? size * 1.1 : 0;
  const w = tw + pad * 2 + iw;
  const h = size * 1.9;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.globalAlpha *= a * q;
  ctx.translate(0, (1 - q) * 14);
  rrPath(ctx, x0, y - h / 2, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = hexA(color, 0.7);
  ctx.lineWidth = 2;
  ctx.stroke();
  if (icon === 'pin') {
    const px = x0 + pad + size * 0.35;
    const py = y - size * 0.12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py - size * 0.1, size * 0.3, Math.PI, 0);
    ctx.lineTo(px, py + size * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(px, py - size * 0.1, size * 0.12, 0, TAU);
    ctx.fill();
  }
  txt(ctx, s, x0 + pad + iw, y + size * 0.36, { size, font: F.mono6, color, track: 3 });
  ctx.restore();
}

/** expanding ring + flash: the "click" of something landing */
export function ringBurst(ctx, x, y, p, { color = '255,176,58', r = 120, a = 1, lw = 4 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || q >= 1 || a <= 0.001) return;
  const e = EASE.outCubic(q);
  ctx.save();
  ctx.globalAlpha *= a * (1 - q);
  ctx.strokeStyle = `rgba(${color},0.9)`;
  ctx.lineWidth = lw * (1 - q * 0.6);
  ctx.beginPath();
  ctx.arc(x, y, r * (0.35 + e * 0.9), 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.1);
  g.addColorStop(0, `rgba(${color},${0.5 * (1 - q)})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
  ctx.restore();
}

/** ink stamp without punching holes in the frame */
export function stamp(ctx, s, x, y, p, { color = '#C8322A', size = 44, rot = -0.12, a = 1, paper = '#EDE6D6' } = {}) {
  const q = clamp(p);
  if (q <= 0.001) return;
  const sc = 1 + (1 - EASE.outCubic(q)) * 0.6;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 3);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  const w = measure(ctx, s, size, F.mono6, 4) + 44;
  const h = size * 1.9;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  txt(ctx, s, 0, size * 0.34, { size, font: F.mono6, color, track: 4, align: 'center' });
  const r = rng(77);
  ctx.fillStyle = paper;
  const baseA = ctx.globalAlpha / Math.max(1e-3, clamp(q * 3));
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = baseA * 0.5;
    ctx.fillRect(-w / 2 + r() * w, -h / 2 + r() * h, 1.5 + r() * 3, 1.5 + r() * 2.5);
  }
  ctx.restore();
}

/** 24-hour dial: ticks, labels, a glowing arc from 0 to `hours` */
export function dial24(ctx, cx, cy, r, hours, t, { a = 1, p = 1, over = 0 } = {}) {
  const q = EASE.outCubic(clamp(p));
  if (q <= 0.001 || a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const base = -Math.PI / 2;
  for (let i = 0; i < 96; i++) {
    if (i / 96 > q) break;
    const ang = base + (i / 96) * TAU;
    const major = i % 24 === 0;
    const mid = i % 4 === 0;
    const r0 = r + 14;
    const r1 = r0 + (major ? 26 : mid ? 16 : 7);
    ctx.strokeStyle = major ? 'rgba(214,230,248,0.85)' : mid ? 'rgba(214,230,248,0.5)' : 'rgba(214,230,248,0.22)';
    ctx.lineWidth = major ? 3 : mid ? 2 : 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
    ctx.stroke();
  }
  for (const [hh, lab] of [[0, '0'], [6, '6'], [12, '12'], [18, '18']]) {
    const ang = base + (hh / 24) * TAU;
    txt(ctx, lab, cx + Math.cos(ang) * (r + 66), cy + Math.sin(ang) * (r + 66) + 9, {
      size: 26, font: F.mono6, color: 'rgba(214,230,248,0.7)', align: 'center', alpha: q,
    });
  }
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(160,190,230,0.12)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  const hv = Math.max(0, hours);
  if (hv > 0.01) {
    const a1 = base + (hv / 24) * TAU;
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, HUD.ember || '#FF6B1A');
    g.addColorStop(0.5, HUD.amber);
    g.addColorStop(1, HUD.amberHi);
    ctx.strokeStyle = g;
    ctx.shadowColor = 'rgba(255,176,58,0.8)';
    ctx.shadowBlur = 26;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(cx, cy, r, base, a1);
    ctx.stroke();
    ctx.shadowBlur = 0;
    const hx = cx + Math.cos(a1) * r;
    const hy = cy + Math.sin(a1) * r;
    ctx.fillStyle = '#FFF4DC';
    ctx.beginPath();
    ctx.arc(hx, hy, 11 + Math.sin(t * 6) * 1.5 * over, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** night horizon: volcano, ridges, palms, village lights — all silhouettes */
export function horizon(ctx, y, t, { a = 1, glow = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const sky = ctx.createLinearGradient(0, y - 900, 0, y + 40);
  sky.addColorStop(0, 'rgba(10,20,40,0)');
  sky.addColorStop(0.7, `rgba(30,50,80,${0.35 * glow})`);
  sky.addColorStop(1, `rgba(70,80,96,${0.45 * glow})`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, y - 900, W, 940);
  // far volcano (a Slamet-like cone) and ridges
  ctx.fillStyle = '#0B1220';
  ctx.beginPath();
  ctx.moveTo(-20, y + 10);
  ctx.lineTo(140, y - 40);
  ctx.quadraticCurveTo(420, y - 120, 600, y - 300);
  ctx.lineTo(660, y - 330);
  ctx.lineTo(700, y - 322);
  ctx.quadraticCurveTo(860, y - 170, 1100, y - 80);
  ctx.quadraticCurveTo(1300, y - 40, W + 20, y - 60);
  ctx.lineTo(W + 20, y + 400);
  ctx.lineTo(-20, y + 400);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#070C16';
  ctx.beginPath();
  ctx.moveTo(-20, y + 40);
  for (let x = -20; x <= W + 40; x += 60) {
    ctx.lineTo(x, y + 20 - Math.sin(x * 0.006) * 40 - Math.sin(x * 0.017 + 1) * 16);
  }
  ctx.lineTo(W + 40, y + 400);
  ctx.lineTo(-20, y + 400);
  ctx.closePath();
  ctx.fill();
  // palms
  const palm = (px, py, s, lean) => {
    ctx.strokeStyle = '#04070D';
    ctx.lineWidth = s * 0.06;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + lean * s * 0.3, py - s * 0.6, px + lean * s * 0.45, py - s);
    ctx.stroke();
    const tx = px + lean * s * 0.45;
    const ty = py - s;
    ctx.fillStyle = '#04070D';
    for (let k = 0; k < 7; k++) {
      const ang = -Math.PI / 2 + (k - 3) * 0.48 + Math.sin(t * 0.8 + k) * 0.03;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + Math.cos(ang) * s * 0.4, ty + Math.sin(ang) * s * 0.4 - s * 0.06, tx + Math.cos(ang) * s * 0.62, ty + Math.sin(ang) * s * 0.62 + s * 0.16);
      ctx.quadraticCurveTo(tx + Math.cos(ang) * s * 0.36, ty + Math.sin(ang) * s * 0.3 + s * 0.02, tx, ty);
      ctx.fill();
    }
  };
  palm(150, y + 60, 300, 0.4);
  palm(260, y + 70, 220, -0.3);
  palm(1270, y + 64, 280, -0.45);
  // village lights
  const r = rng(51);
  for (let i = 0; i < 46; i++) {
    const lx = r() * W;
    const ly = y + 30 + r() * 60;
    const tw = 0.6 + 0.4 * Math.sin(t * (1 + r() * 2) + i);
    ctx.fillStyle = `rgba(255,${190 + Math.floor(r() * 40)},120,${0.55 * tw})`;
    ctx.beginPath();
    ctx.arc(lx, ly, 1.6 + r() * 1.8, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
