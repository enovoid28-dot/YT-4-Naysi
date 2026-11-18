/**
 * Episode 25 kit — blood, from the inside.
 *
 * A red cell is the Evans–Fung biconcave disc, ray-cast per pixel into a
 * cached sprite: wrap-lit, rim-lit, a wet specular, membrane mottling, and the
 * thin centre glowing through (the central pallor you see under a scope). The
 * vessel is three depth layers of those sprites under a real depth-of-field
 * blur. Antigens are drawn on the membrane, one glyph per blood group. The
 * lab pieces (agglutination wells, ISBT system tiles, the scope strip) are
 * plain canvas. All of it is 2D.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, txt, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { noise3, fbm3 } from './_earth.mjs';
import { HUD, rrPath } from './_bulan.mjs';

const CACHE = path.join(process.cwd(), 'out', 'cache');
const req = createRequire(import.meta.url);
const sm = (p) => EASE.smooth(clamp(p));
const eo = (p) => EASE.outCubic(clamp(p));

/* ================================ the cell ================================ */

// Evans & Fung (1972): half thickness over the normalised radius (R = 3.91 µm)
const C0 = 0.81 / 3.91;
const C2 = 7.83 / 3.91;
const C4 = -4.39 / 3.91;
const HMAX = 0.33;
const half = (r2) => (r2 >= 1 ? 0 : 0.5 * Math.sqrt(1 - r2) * (C0 + C2 * r2 + C4 * r2 * r2));
const dHalf = (r) => {
  const r2 = r * r;
  const s = Math.sqrt(Math.max(1e-6, 1 - r2));
  const P = C0 + C2 * r2 + C4 * r2 * r2;
  return 0.5 * ((-r / s) * P + s * (2 * C2 * r + 4 * C4 * r2 * r));
};

export const PAL = {
  red: { deep: [62, 2, 10], mid: [160, 12, 26], hi: [236, 54, 46], rim: [255, 110, 86], spec: [255, 224, 212], glow: '255,72,60' },
  gold: { deep: [80, 44, 4], mid: [188, 122, 22], hi: [255, 206, 90], rim: [255, 236, 168], spec: [255, 252, 238], glow: '255,198,84' },
};

/** ray-cast one cell into an RGBA buffer (S x S, cell radius 0.47 S) */
function renderCell(S, tiltDeg, pal, ss, steps) {
  const th = (tiltDeg * Math.PI) / 180;
  const ct = Math.cos(th);
  const st = Math.sin(th);
  const Rs = S * 0.47;
  const out = new Uint8ClampedArray(S * S * 4);
  let lx = -0.5;
  let ly = -0.7;
  let lz = 0.5;
  const ll = Math.hypot(lx, ly, lz);
  lx /= ll; ly /= ll; lz /= ll;
  let hx = lx;
  let hy = ly;
  let hz = lz + 1;
  const hl = Math.hypot(hx, hy, hz);
  hx /= hl; hy /= hl; hz /= hl;
  const P = PAL[pal];
  const vMax = ct + st * HMAX + 0.01;
  const inv = 1 / (ss * ss);
  for (let py = 0; py < S; py++) {
    for (let px = 0; px < S; px++) {
      let R = 0;
      let G = 0;
      let B = 0;
      let A = 0;
      for (let sy = 0; sy < ss; sy++) {
        const v = (py + (sy + 0.5) / ss - S / 2) / Rs;
        if (v > vMax || v < -vMax) continue;
        for (let sx = 0; sx < ss; sx++) {
          const u = (px + (sx + 0.5) / ss - S / 2) / Rs;
          if (u >= 1 || u <= -1) continue;
          let w0 = -3;
          let w1 = 3;
          if (ct > 1e-3) {
            const a1 = (v * st - HMAX) / ct;
            const b1 = (v * st + HMAX) / ct;
            w0 = Math.max(w0, Math.min(a1, b1));
            w1 = Math.min(w1, Math.max(a1, b1));
          }
          if (st > 1e-3) {
            const a1 = (-1 - v * ct) / st;
            const b1 = (1 - v * ct) / st;
            w0 = Math.max(w0, Math.min(a1, b1));
            w1 = Math.min(w1, Math.max(a1, b1));
          } else if (v >= 1 || v <= -1) continue;
          if (w1 <= w0) continue;
          const u2 = u * u;
          const dw = (w1 - w0) / steps;
          let hit = NaN;
          let prev = w1;
          for (let k = 0; k <= steps; k++) {
            const w = w1 - k * dw;
            const y = v * ct + w * st;
            const r2 = u2 + y * y;
            if (r2 < 1 && Math.abs(w * ct - v * st) <= half(r2)) { hit = w; break; }
            prev = w;
          }
          if (Number.isNaN(hit)) continue;
          let lo = hit;
          let hi = prev;
          for (let k = 0; k < 10; k++) {
            const m = (lo + hi) * 0.5;
            const y = v * ct + m * st;
            const r2 = u2 + y * y;
            if (r2 < 1 && Math.abs(m * ct - v * st) <= half(r2)) lo = m;
            else hi = m;
          }
          const w = lo;
          const y = v * ct + w * st;
          const z = w * ct - v * st;
          const r = Math.min(0.9995, Math.sqrt(u2 + y * y));
          const dh = dHalf(r);
          const ir = r > 1e-5 ? 1 / r : 0;
          // outward normal of |z| - h(r), in cell space
          let nx = -dh * u * ir;
          let ny = -dh * y * ir;
          const nz = z >= 0 ? 1 : -1;
          // membrane: soft bumps, a finer grain, and a micro grain for close-ups
          const bx = noise3(u * 6.5 + 3.1, y * 6.5, z * 6.5, 11) - 0.5;
          const by = noise3(u * 6.5, y * 6.5 + 7.7, z * 6.5, 12) - 0.5;
          const fx = noise3(u * 22, y * 22, z * 22 + 1.3, 13) - 0.5;
          const mx = noise3(u * 70, y * 70 + 2.1, z * 70, 14) - 0.5;
          nx += bx * 0.09 + fx * 0.035 + mx * 0.02;
          ny += by * 0.09 - fx * 0.03 - mx * 0.015;
          // into screen space
          let Nx = nx;
          let Ny = ct * ny - st * nz;
          let Nz = st * ny + ct * nz;
          const nl = Math.hypot(Nx, Ny, Nz) || 1;
          Nx /= nl; Ny /= nl; Nz /= nl;
          const d = clamp((Nx * lx + Ny * ly + Nz * lz + 0.42) / 1.42);
          const nv = Math.max(0, Nz);
          const fres = Math.pow(1 - nv, 4);
          const ndh = Math.max(0, Nx * hx + Ny * hy + Nz * hz);
          const sp = Math.pow(ndh, 90) * 0.85 + Math.pow(ndh, 9) * 0.16;
          const thick = half(r * r) / HMAX;
          let cr;
          let cg;
          let cb;
          if (d < 0.5) {
            const f = d / 0.5;
            cr = lerp(P.deep[0], P.mid[0], f); cg = lerp(P.deep[1], P.mid[1], f); cb = lerp(P.deep[2], P.mid[2], f);
          } else {
            const f = (d - 0.5) / 0.5;
            cr = lerp(P.mid[0], P.hi[0], f); cg = lerp(P.mid[1], P.hi[1], f); cb = lerp(P.mid[2], P.hi[2], f);
          }
          // central pallor: the thin middle lets the light through
          const tr = clamp(1 - thick) * 0.5;
          cr += P.hi[0] * tr * 0.32; cg += P.hi[1] * tr * 0.26; cb += P.hi[2] * tr * 0.26;
          // a little occlusion down in the dimple
          const ao = 1 - 0.42 * sm(1 - r / 0.62) * (z >= 0 ? 1 : 0);
          cr *= ao; cg *= ao; cb *= ao;
          cr += P.rim[0] * fres * 0.48; cg += P.rim[1] * fres * 0.48; cb += P.rim[2] * fres * 0.48;
          cr += P.spec[0] * sp * 0.55; cg += P.spec[1] * sp * 0.55; cb += P.spec[2] * sp * 0.55;
          R += cr; G += cg; B += cb; A += 1;
        }
      }
      if (A > 0) {
        const o = (py * S + px) * 4;
        out[o] = R / A;
        out[o + 1] = G / A;
        out[o + 2] = B / A;
        out[o + 3] = 255 * A * inv;
      }
    }
  }
  return out;
}

const SPR = new Map();
const VER = 'cell-v2';
export const TILTS = [0, 20, 38, 54, 68, 80, 88];
const SMALL = 300;
const HERO = 820;
const HERO_TILTS = [0, 28, 52];

/** a cached cell sprite: palette, tilt (degrees), size */
export function cellSprite(pal = 'red', tilt = 0, S = SMALL) {
  const key = `${VER}-${pal}-${tilt}-${S}`;
  let cv = SPR.get(key);
  if (cv) return cv;
  const file = path.join(CACHE, `${key}.bin`);
  let rgba = null;
  if (fs.existsSync(file)) {
    const b = fs.readFileSync(file);
    if (b.length === S * S * 4) rgba = new Uint8ClampedArray(b.buffer, b.byteOffset, b.length);
  }
  if (!rgba) {
    rgba = renderCell(S, tilt, pal, 2, S > 500 ? 34 : 28);
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, Buffer.from(rgba.buffer, rgba.byteOffset, rgba.length));
  }
  cv = createCanvas(S, S);
  const c = cv.getContext('2d');
  const img = c.createImageData(S, S);
  img.data.set(rgba);
  c.putImageData(img, 0, 0);
  SPR.set(key, cv);
  return cv;
}

// depth of field: blurred copies of the small sprites, made once per process
const BLUR_PX = [0, 5, 12, 24, 44];
const BPAD = 80;
function blurSprite(pal, tilt, level) {
  const key = `blur-${pal}-${tilt}-${level}`;
  let cv = SPR.get(key);
  if (cv) return cv;
  const base = cellSprite(pal, tilt, SMALL);
  cv = createCanvas(SMALL + BPAD * 2, SMALL + BPAD * 2);
  const c = cv.getContext('2d');
  c.filter = `blur(${BLUR_PX[level]}px)`;
  c.drawImage(base, BPAD, BPAD);
  c.filter = 'none';
  SPR.set(key, cv);
  return cv;
}

function blit(ctx, img, d, S, pad) {
  const k = d / (0.94 * S);
  const s = (S + pad * 2) * k;
  ctx.drawImage(img, -s / 2, -s / 2, s, s);
}

// vertical half-extent of the tilted disc's silhouette (radius units)
const EXT = new Map();
function extent(tilt) {
  const key = Math.round(tilt * 2) / 2;
  let e = EXT.get(key);
  if (e !== undefined) return e;
  const th = (key * Math.PI) / 180;
  e = 0;
  for (let i = 0; i <= 200; i++) {
    const r = i / 200;
    e = Math.max(e, r * Math.cos(th) + half(r * r) * Math.sin(th));
  }
  EXT.set(key, e);
  return e;
}

/**
 * One red cell, centred on (x, y), `d` = its diameter on screen.
 * `tilt` 0 = face on, 90 = edge on. Between two sprite tilts both sprites are
 * squashed to the silhouette of the exact tilt and blended, so a tumbling
 * cell turns smoothly with no double edge. `hero` uses the large sprites.
 */
export function drawCell(ctx, x, y, d, { pal = 'red', tilt = 0, rot = 0, a = 1, blur = 0, hero = false, mix = null } = {}) {
  if (a <= 0.004 || d < 2) return;
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  const base = ctx.globalAlpha * a;
  const table = hero ? HERO_TILTS : TILTS;
  const tc = clamp(tilt, table[0], table[table.length - 1]);
  let i = 0;
  while (i < table.length - 2 && table[i + 1] <= tc) i++;
  const f = clamp((tc - table[i]) / (table[i + 1] - table[i]));
  const S = hero ? HERO : SMALL;
  const pick = (tt, pl) => (hero ? cellSprite(pl, tt, HERO) : blur ? blurSprite(pl, tt, blur) : cellSprite(pl, tt, SMALL));
  const pad = !hero && blur ? BPAD : 0;
  const eT = extent(tc);
  const one = (tt, pl, k) => {
    if (k <= 0.004) return;
    ctx.save();
    ctx.globalAlpha = base * k;
    ctx.scale(1, eT / extent(tt));
    blit(ctx, pick(tt, pl), d, S, pad);
    ctx.restore();
  };
  const layer = (pl, k) => {
    if (f < 0.98) one(table[i], pl, k);
    if (f > 0.02) one(table[i + 1], pl, k * (f < 0.98 ? f : 1));
  };
  // `mix` crossfades into a second palette (red -> gold)
  layer(pal, 1);
  if (mix) layer(mix.pal, clamp(mix.k));
  ctx.restore();
}

/* =============================== the vessel =============================== */

let BG = null;
const BGM = 90;
function backdrop() {
  if (BG) return BG;
  const w = W + BGM * 2;
  const h = H + BGM * 2;
  BG = createCanvas(w, h);
  const c = BG.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1B060B');
  g.addColorStop(0.45, '#12040A');
  g.addColorStop(1, '#070206');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  // plasma haze: soft fbm clouds, painted small and scaled up
  const sw = 240;
  const sh = 424;
  const hz = createCanvas(sw, sh);
  const hc = hz.getContext('2d');
  const img = hc.createImageData(sw, sh);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const v = fbm3(x / 40, y / 40, 0.5, 5, 71);
      const s = fbm3(x / 12 + 9, y / 12, 2.5, 3, 73);
      const k = clamp((v - 0.36) * 2.1) * (0.7 + 0.6 * s);
      const o = (y * sw + x) * 4;
      img.data[o] = 150;
      img.data[o + 1] = 16;
      img.data[o + 2] = 30;
      img.data[o + 3] = 255 * k * 0.5;
    }
  }
  hc.putImageData(img, 0, 0);
  c.globalCompositeOperation = 'screen';
  c.drawImage(hz, 0, 0, w, h);
  // a warm bloom behind the art area
  const rg = c.createRadialGradient(w * 0.55, h * 0.4, 0, w * 0.55, h * 0.4, h * 0.45);
  rg.addColorStop(0, 'rgba(150,18,30,0.32)');
  rg.addColorStop(1, 'rgba(150,18,30,0)');
  c.fillStyle = rg;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'source-over';
  return BG;
}

let VIG = null;
function vignette() {
  if (VIG) return VIG;
  VIG = createCanvas(W, H);
  const c = VIG.getContext('2d');
  const g = c.createRadialGradient(W / 2, H * 0.42, H * 0.16, W / 2, H * 0.46, H * 0.74);
  g.addColorStop(0, 'rgba(2,0,1,0)');
  g.addColorStop(0.6, 'rgba(2,0,1,0.35)');
  g.addColorStop(1, 'rgba(2,0,1,0.86)');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  return VIG;
}

const LAYERS = [
  { n: 30, d0: 60, d1: 112, blur: 3, a: 0.34, speed: 0.32, seed: 101 },
  { n: 15, d0: 136, d1: 232, blur: 2, a: 0.58, speed: 0.6, seed: 202 },
  { n: 8, d0: 236, d1: 340, blur: 1, a: 0.86, speed: 0.95, seed: 303 },
];
const FRONT = { n: 3, d0: 560, d1: 800, blur: 4, a: 0.5, speed: 2.0, seed: 404 };

function drawLayer(ctx, L, t, flow, o) {
  const r = rng(L.seed + (o.seed || 0) * 7919);
  const spanX = W + 700;
  const spanY = H + 700;
  for (let i = 0; i < L.n; i++) {
    const x0 = r() * spanX;
    const y0 = r() * spanY;
    const d = lerp(L.d0, L.d1, r());
    const ph = r() * TAU;
    const om = 0.22 + r() * 0.4;
    const rot0 = r() * TAU;
    const spin = (r() - 0.5) * 0.5;
    const sp = L.speed * (0.8 + r() * 0.4);
    const gold = r() < (o.gold || 0);
    let x = (x0 + flow[0] * sp * t * 100) % spanX;
    if (x < 0) x += spanX;
    let y = (y0 + flow[1] * sp * t * 100) % spanY;
    if (y < 0) y += spanY;
    x -= 350;
    y -= 350;
    if (x < -d || x > W + d || y < -d || y > H + d) continue;
    const tilt = (0.5 + 0.5 * Math.sin(t * om + ph)) * 86;
    drawCell(ctx, x, y, d, { pal: gold ? 'gold' : 'red', tilt, rot: rot0 + t * spin, a: L.a * (gold ? 1.15 : 1), blur: L.blur });
  }
}

/**
 * Inside a vessel: plasma, three depth layers of tumbling cells drifting with
 * the flow, platelets, a vignette. `gold` turns that fraction of cells gold;
 * `dark` sinks the whole plate so the art on top reads.
 */
export function vessel(ctx, t, cam = {}, o = {}) {
  const { flow = [0.2, -0.45], a = 1, gold = 0, seed = 0, dark = 0, layers = 3 } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const bg = backdrop();
  ctx.drawImage(bg, -BGM + (cam.dx || 0) * 0.25, -BGM + (cam.dy || 0) * 0.25);
  for (let li = 0; li < Math.min(layers, LAYERS.length); li++) {
    const par = 0.25 + li * 0.4;
    ctx.save();
    ctx.translate((cam.dx || 0) * par, (cam.dy || 0) * par);
    drawLayer(ctx, LAYERS[li], t, flow, { gold, seed });
    ctx.restore();
    if (li === 0) {
      ctx.fillStyle = 'rgba(16,3,8,0.34)';
      ctx.fillRect(0, 0, W, H);
    }
  }
  // platelets: small, pale, quick
  const r = rng(505 + seed * 31);
  for (let i = 0; i < 26; i++) {
    const x0 = r() * (W + 200);
    const y0 = r() * (H + 200);
    const s = 5 + r() * 9;
    const sp = 1.3 + r() * 0.8;
    let x = (x0 + flow[0] * sp * t * 100) % (W + 200);
    if (x < 0) x += W + 200;
    let y = (y0 + flow[1] * sp * t * 100) % (H + 200);
    if (y < 0) y += H + 200;
    ctx.fillStyle = `rgba(255,${170 + r() * 40},${150 + r() * 30},${0.16 + r() * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(x - 100, y - 100, s, s * 0.6, r() * TAU, 0, TAU);
    ctx.fill();
  }
  ctx.drawImage(vignette(), 0, 0);
  if (dark > 0) {
    ctx.fillStyle = `rgba(7,1,4,${clamp(dark)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/** huge out-of-focus cells sliding past the lens, drawn over everything */
export function vesselFront(ctx, t, cam = {}, { flow = [0.2, -0.45], a = 1, seed = 0 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate((cam.dx || 0) * 1.8, (cam.dy || 0) * 1.8);
  drawLayer(ctx, FRONT, t, flow, { seed });
  ctx.restore();
}

/* ================================ antigens ================================ */

// one glyph per blood group, the way a textbook draws them
export const MK = {
  A: '95,227,255', // A: N-acetylgalactosamine fork
  B: '255,176,58', // B: galactose beads
  H: '214,230,248', // O: the bare H stem
  D: '95,227,192', // RhD: a protein loop
  G: '200,160,255', // GWADA (PIGZ)
  X: '159,216,255', // any other system
};

const GLOWS = new Map();
function glowDot(rgb) {
  let cv = GLOWS.get(rgb);
  if (cv) return cv;
  cv = createCanvas(64, 64);
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${rgb},0.95)`);
  g.addColorStop(0.22, `rgba(${rgb},0.38)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
  GLOWS.set(rgb, cv);
  return cv;
}
export function glow(ctx, x, y, s, rgb, a = 1) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha *= a;
  ctx.drawImage(glowDot(rgb), x - s / 2, y - s / 2, s, s);
  ctx.restore();
}

/** the head of one marker; +x points away from the membrane */
function head(ctx, kind, s, rgb) {
  ctx.fillStyle = `rgb(${rgb})`;
  ctx.strokeStyle = `rgb(${rgb})`;
  switch (kind) {
    case 'A':
      ctx.lineWidth = s * 0.34;
      for (const an of [-0.62, 0, 0.62]) {
        const ex = Math.cos(an) * s * 1.1;
        const ey = Math.sin(an) * s * 1.1;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath(); ctx.arc(ex, ey, s * 0.32, 0, TAU); ctx.fill();
      }
      break;
    case 'B':
      ctx.beginPath(); ctx.arc(s * 0.5, 0, s * 0.55, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(s * 1.25, s * 0.35, s * 0.4, 0, TAU); ctx.fill();
      break;
    case 'H':
      ctx.beginPath(); ctx.arc(s * 0.15, 0, s * 0.28, 0, TAU); ctx.fill();
      break;
    case 'D':
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(s * 0.8, -s * 0.62); ctx.lineTo(s * 1.6, 0); ctx.lineTo(s * 0.8, s * 0.62);
      ctx.closePath(); ctx.fill();
      break;
    case 'G':
      ctx.lineWidth = s * 0.3;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const an = (k / 6) * TAU;
        const px = s * 0.95 + Math.cos(an) * s * 0.78;
        const py = Math.sin(an) * s * 0.78;
        if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(s * 0.95, 0, s * 0.24, 0, TAU); ctx.fill();
      break;
    default:
      ctx.beginPath(); ctx.arc(s * 0.3, 0, s * 0.36, 0, TAU); ctx.fill();
  }
}

/**
 * Antigens on a cell of diameter `d` at (x, y): stalks around the rim pointing
 * out, and the ones facing us as bright dots on the face. `kinds` is drawn
 * from at random (seeded, so the layout never jumps). `peel` lifts them off
 * the membrane and lets them drift away; `only` keeps one kind and fades the
 * rest (0..1).
 */
export function markers(ctx, x, y, d, o = {}) {
  const {
    kinds = ['A'], n = 20, p = 1, t = 0, a = 1, tilt = 0, rot = 0, seed = 1, len = 0.075,
    face = 0.6, peel = 0, peelKind = null, size = 1, glowK = 1, dimKind = null, dim = 0,
  } = o;
  if (a <= 0.01 || p <= 0.001) return;
  const r = rng(seed * 131 + 7);
  const th = (tilt * Math.PI) / 180;
  const rx = d * 0.5;
  const ry = d * 0.5 * (Math.cos(th) + 0.3 * Math.sin(th));
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  const s = d * 0.022 * size;
  ctx.save();
  ctx.lineCap = 'round';
  const base = ctx.globalAlpha * a;
  for (let i = 0; i < n; i++) {
    const phi = (i / n) * TAU + (r() - 0.5) * (TAU / n) * 0.8;
    const kind = kinds[Math.floor(r() * kinds.length)];
    const L0 = d * len * (0.75 + r() * 0.5);
    const delay = r();
    const wob = r() * TAU;
    const pkK = 0.6 + r() * 0.8;
    const drift = r() - 0.5;
    const q = eo(p * 1.5 - delay * 0.5);
    if (q <= 0.01) continue;
    const pk = peelKind && kind !== peelKind ? 0 : clamp(peel * pkK);
    const ex = Math.cos(phi) * rx;
    const ey = Math.sin(phi) * ry;
    let nx = Math.cos(phi) / rx;
    let ny = Math.sin(phi) / ry;
    const nl = Math.hypot(nx, ny);
    nx /= nl; ny /= nl;
    const bx = x + ex * cr - ey * sr;
    const by = y + ex * sr + ey * cr;
    let ux = nx * cr - ny * sr;
    let uy = nx * sr + ny * cr;
    const wig = Math.sin(t * 2.1 + wob) * 0.14 + pk * drift * 2;
    const ca = Math.cos(wig);
    const sa = Math.sin(wig);
    const vx = ux * ca - uy * sa;
    const vy = ux * sa + uy * ca;
    ux = vx; uy = vy;
    const off = pk * d * (0.2 + 0.35 * pkK);
    const ax = bx + ux * off + drift * pk * d * 0.15;
    const ay = by + uy * off - pk * d * 0.12;
    const L = L0 * q;
    const tx = ax + ux * L;
    const ty = ay + uy * L;
    const rgb = MK[kind] || MK.X;
    const kd = dimKind && kind === dimKind ? 1 - dim : 1;
    const al = (1 - pk) * clamp(q * 2) * kd;
    if (al <= 0.01) continue;
    ctx.globalAlpha = base * al;
    ctx.strokeStyle = `rgba(${rgb},0.85)`;
    ctx.lineWidth = Math.max(1.2, s * 0.32);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx, ty); ctx.stroke();
    if (glowK > 0) {
      const gs = s * 7;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = base * al * 0.5 * glowK;
      ctx.drawImage(glowDot(rgb), tx - gs / 2, ty - gs / 2, gs, gs);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = base * al;
    }
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(Math.atan2(uy, ux));
    ctx.scale(q, q);
    head(ctx, kind, s, rgb);
    ctx.restore();
  }
  const nf = Math.round(n * face);
  for (let i = 0; i < nf; i++) {
    const rr = Math.sqrt(0.14 + r() * 0.72) * 0.86;
    const an = r() * TAU;
    const kind = kinds[Math.floor(r() * kinds.length)];
    const delay = r();
    const pkK = 0.6 + r() * 0.8;
    const drift = r() - 0.5;
    const q = eo(p * 1.5 - delay * 0.5);
    const pk = peelKind && kind !== peelKind ? 0 : clamp(peel * pkK);
    const kd = dimKind && kind === dimKind ? 1 - dim : 1;
    if (q <= 0.01 || pk >= 0.99 || kd <= 0.01) continue;
    const ex = Math.cos(an) * rx * rr;
    const ey = Math.sin(an) * ry * rr;
    const fx = x + ex * cr - ey * sr + drift * pk * d * 0.4;
    const fy = y + ex * sr + ey * cr - pk * d * 0.35;
    const rgb = MK[kind] || MK.X;
    ctx.globalAlpha = base * q * (1 - pk) * kd;
    const gs = s * 5;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(glowDot(rgb), fx - gs / 2, fy - gs / 2, gs, gs);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.beginPath(); ctx.arc(fx, fy, s * 0.42 * q, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/** one free antigen glyph (for clouds of markers) */
export function glyph(ctx, kind, x, y, s, rot = 0, a = 1, glowK = 0.6) {
  if (a <= 0.01) return;
  const rgb = MK[kind] || MK.X;
  ctx.save();
  ctx.globalAlpha *= a;
  if (glowK > 0) glow(ctx, x, y, s * 6, rgb, glowK);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.translate(-s * 0.6, 0);
  head(ctx, kind, s, rgb);
  ctx.restore();
}

/** a little legend swatch: the glyph of one antigen and its name */
export function legend(ctx, kind, label, x, y, p, { a = 1, size = 22 } = {}) {
  const q = eo(p);
  if (q <= 0.01 || a <= 0.01) return;
  const rgb = MK[kind] || MK.X;
  ctx.save();
  ctx.globalAlpha *= a * q;
  ctx.translate(x + (1 - q) * -16, y);
  glow(ctx, 14, -8, 46, rgb, 0.5);
  ctx.save();
  ctx.translate(0, -8);
  head(ctx, kind, 13, rgb);
  ctx.restore();
  txt(ctx, label, 44, 0, { size, font: F.mono6, color: HUD.text, track: 3 });
  ctx.restore();
}

/* ================================ the lab ================================= */

/**
 * A well on a typing tile with a drop of blood in it. `agg` 0..1 turns the
 * smooth drop into clumps on clearing serum: the reaction you read by eye.
 */
export function well(ctx, x, y, r, o = {}) {
  const { agg = 0, p = 1, a = 1, seed = 1, label = '', sub = '', labelColor = HUD.text, t = 0 } = o;
  const q = eo(p);
  if (q <= 0.01 || a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
  g.addColorStop(0, '#EEE9E2');
  g.addColorStop(0.7, '#C3BCB3');
  g.addColorStop(1, '#6F6963');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 1.1, 0, TAU); ctx.fill();
  const ig = ctx.createRadialGradient(x, y + r * 0.1, r * 0.55, x, y, r);
  ig.addColorStop(0, 'rgba(0,0,0,0)');
  ig.addColorStop(1, 'rgba(48,36,30,0.5)');
  ctx.fillStyle = ig;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  const dr = r * 0.8 * (0.6 + 0.4 * q);
  const k = clamp(agg);
  const P = PAL.red;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, dr, 0, TAU); ctx.clip();
  const lg = ctx.createRadialGradient(x - dr * 0.3, y - dr * 0.35, dr * 0.1, x, y, dr);
  const mixc = (c, to, f) => Math.round(lerp(c, to, f));
  lg.addColorStop(0, `rgb(${mixc(P.hi[0], 246, k * 0.75)},${mixc(P.hi[1], 206, k * 0.75)},${mixc(P.hi[2], 188, k * 0.75)})`);
  lg.addColorStop(1, `rgb(${mixc(P.mid[0], 228, k * 0.75)},${mixc(P.mid[1], 160, k * 0.75)},${mixc(P.mid[2], 146, k * 0.75)})`);
  ctx.fillStyle = lg;
  ctx.fillRect(x - dr, y - dr, dr * 2, dr * 2);
  if (k > 0.01) {
    const rr = rng(seed * 97 + 3);
    for (let i = 0; i < 34; i++) {
      const an = rr() * TAU;
      const dd = Math.sqrt(rr()) * dr * 0.88;
      const cx = x + Math.cos(an) * dd;
      const cy = y + Math.sin(an) * dd + Math.sin(t * 1.3 + i) * 0.6;
      const crr = dr * (0.05 + rr() * 0.11) * (0.35 + 0.65 * k);
      const jag = rr() * 100;
      ctx.beginPath();
      for (let j = 0; j <= 12; j++) {
        const aa = (j / 12) * TAU;
        const rad = crr * (0.66 + 0.7 * noise3(Math.cos(aa) * 1.4 + jag, Math.sin(aa) * 1.4, 0.5, 5));
        const px = cx + Math.cos(aa) * rad;
        const py = cy + Math.sin(aa) * rad;
        if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(104,6,18,${0.96 * k})`;
      ctx.fill();
      ctx.fillStyle = `rgba(226,70,58,${0.6 * k})`;
      ctx.beginPath(); ctx.arc(cx - crr * 0.3, cy - crr * 0.32, crr * 0.3, 0, TAU); ctx.fill();
    }
  }
  // the wet meniscus
  const hg = ctx.createLinearGradient(x, y - dr, x, y - dr * 0.2);
  hg.addColorStop(0, 'rgba(255,255,255,0.42)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.ellipse(x - dr * 0.12, y - dr * 0.55, dr * 0.62, dr * 0.3, -0.25, 0, TAU); ctx.fill();
  ctx.restore();
  if (label) txt(ctx, label, x, y + r * 1.1 + 40, { size: 24, font: F.mono6, color: labelColor, align: 'center', track: 3 });
  if (sub) txt(ctx, sub, x, y + r * 1.1 + 72, { size: 19, font: F.mono, color: HUD.sub, align: 'center', track: 2 });
  ctx.restore();
}

/** a check mark drawn on (p 0..1) */
export function tick(ctx, x, y, s, p, { color = HUD.mint, lw = 9, a = 1 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.01) return;
  const P1 = [x - s * 0.5, y];
  const P2 = [x - s * 0.12, y + s * 0.38];
  const P3 = [x + s * 0.56, y - s * 0.44];
  const l1 = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]);
  const l2 = Math.hypot(P3[0] - P2[0], P3[1] - P2[1]);
  const L = (l1 + l2) * eo(q);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(P1[0], P1[1]);
  if (L <= l1) ctx.lineTo(P1[0] + ((P2[0] - P1[0]) * L) / l1, P1[1] + ((P2[1] - P1[1]) * L) / l1);
  else {
    ctx.lineTo(P2[0], P2[1]);
    const f = (L - l1) / l2;
    ctx.lineTo(P2[0] + (P3[0] - P2[0]) * f, P2[1] + (P3[1] - P2[1]) * f);
  }
  ctx.stroke();
  ctx.restore();
}

/** a cross drawn on (p 0..1) */
export function cross(ctx, x, y, s, p, { color = HUD.red, lw = 9, a = 1 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.01) return;
  const k1 = eo(q * 2);
  const k2 = eo(q * 2 - 1);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  const h = s / 2;
  ctx.beginPath();
  ctx.moveTo(x - h, y - h);
  ctx.lineTo(x - h + s * k1, y - h + s * k1);
  if (k2 > 0) {
    ctx.moveTo(x + h, y - h);
    ctx.lineTo(x + h - s * k2, y - h + s * k2);
  }
  ctx.stroke();
  ctx.restore();
}

/** a big glass tile with a blood type on it; `strike` slashes it out */
export function typeBadge(ctx, s, x, y, size, p, { color = HUD.bone, strike = 0, a = 1, sub = '', glowRgb = null, lit = 0 } = {}) {
  const q = eo(p);
  if (q <= 0.01 || a <= 0.01) return;
  const w = Math.max(size * 1.45, measure(ctx, s, size, F.display, -size * 0.02) + size * 0.6);
  const h = size * 1.45;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.5);
  ctx.translate(x, y + (1 - q) * 40);
  const sc = 0.86 + 0.14 * q;
  ctx.scale(sc, sc);
  if (glowRgb && lit > 0) glow(ctx, 0, 0, w * 2.2, glowRgb, 0.55 * lit);
  rrPath(ctx, -w / 2, -h / 2, w, h, size * 0.24);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, 'rgba(40,12,18,0.86)');
  g.addColorStop(1, 'rgba(16,4,8,0.9)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = lit > 0 && glowRgb ? `rgba(${glowRgb},${0.4 + 0.5 * lit})` : 'rgba(255,196,186,0.32)';
  ctx.stroke();
  const st = eo(strike);
  txt(ctx, s, 0, size * 0.35, { size, font: F.display, color, align: 'center', track: -size * 0.02, alpha: 1 - 0.55 * st });
  if (sub) txt(ctx, sub, 0, h / 2 - size * 0.16, { size: Math.round(size * 0.17), font: F.mono6, color: HUD.sub, align: 'center', track: 3 });
  if (st > 0) {
    ctx.strokeStyle = 'rgba(255,74,62,0.96)';
    ctx.lineWidth = size * 0.085;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w * 0.4, h * 0.36);
    ctx.lineTo(-w * 0.4 + w * 0.8 * st, h * 0.36 - h * 0.72 * st);
    ctx.stroke();
  }
  ctx.restore();
}

/** a grid of dots, revealed in reading order; `lit` indices glow */
export function dotGrid(ctx, x, y, cols, rows, step, r, p, { lit = [], litRgb = MK.D, litP = 1, base = 'rgba(214,230,248,0.3)', a = 1, t = 0 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const N = cols * rows;
  const shown = Math.floor(N * eo(q));
  ctx.fillStyle = base;
  for (let i = 0; i < shown; i++) {
    const cx = x + (i % cols) * step;
    const cy = y + Math.floor(i / cols) * step;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  const lq = eo(litP);
  for (const i of lit) {
    if (lq <= 0.01) break;
    const cx = x + (i % cols) * step;
    const cy = y + Math.floor(i / cols) * step;
    const pulse = 1 + 0.12 * Math.sin(t * 4 + i);
    glow(ctx, cx, cy, step * 5 * lq * pulse, litRgb, 0.8);
    ctx.fillStyle = `rgb(${litRgb})`;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.7 * lq, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ISBT blood group systems, 001 to 049, in their official order (JAMA: June 2026)
export const SYSTEMS = [
  'ABO', 'MNS', 'P1PK', 'RH', 'LU', 'KEL', 'LE', 'FY', 'JK', 'DI', 'YT', 'XG', 'SC', 'DO', 'CO', 'LW',
  'CH/RG', 'H', 'XK', 'GE', 'CROM', 'KN', 'IN', 'OK', 'RAPH', 'JMH', 'I', 'GLOB', 'GIL', 'RHAG', 'FORS', 'JR',
  'LAN', 'VEL', 'CD59', 'AUG', 'KANNO', 'SID', 'CTL2', 'PEL', 'MAM', 'EMM', 'ABCC1', 'ER', 'CD36', 'ATP11C', 'MAL', 'PIGZ',
  'JAMA',
];

/**
 * The ISBT systems as a periodic-table wall. Tiles land in a diagonal wave as p
 * runs 0..1; `hi` maps an index to [rgb, strength] to light a tile.
 */
export function systemTiles(ctx, x, y, cols, tw, th, gap, p, { a = 1, hi = {}, dim = 0, count = SYSTEMS.length, skip = -1, badge = {} } = {}) {
  if (a <= 0.01 || p <= 0.001) return;
  const rows = Math.ceil(count / cols);
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < count; i++) {
    if (i === skip) continue;
    const c = i % cols;
    const r = Math.floor(i / cols);
    const delay = (c * 0.6 + r) / (cols * 0.6 + rows);
    const q = eo((p - delay * 0.7) / 0.3);
    if (q <= 0.01) continue;
    const tx = x + c * (tw + gap);
    const ty = y + r * (th + gap) + (1 - q) * 30;
    const h = hi[i];
    const k = h ? h[1] : 0;
    ctx.save();
    ctx.globalAlpha *= clamp(q * 1.4) * (1 - dim * (1 - k));
    if (k > 0) glow(ctx, tx + tw / 2, ty + th / 2, tw * 2.2, h[0], 0.45 * k);
    rrPath(ctx, tx, ty, tw, th, 14);
    ctx.fillStyle = k > 0 ? `rgba(${h[0]},${0.1 + 0.16 * k})` : 'rgba(22,8,13,0.8)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = k > 0 ? `rgba(${h[0]},${0.45 + 0.5 * k})` : 'rgba(255,196,186,0.22)';
    ctx.stroke();
    txt(ctx, String(i + 1).padStart(3, '0'), tx + 14, ty + 28, { size: 17, font: F.mono, color: k > 0 ? `rgba(${h[0]},0.95)` : 'rgba(214,230,248,0.45)', track: 1 });
    const name = SYSTEMS[i];
    const fs2 = Math.min(40, (tw - 24) / Math.max(2.2, name.length * 0.62));
    txt(ctx, name, tx + tw / 2, ty + th * 0.7, { size: fs2, font: F.display, color: k > 0 ? HUD.bone : 'rgba(243,239,228,0.82)', align: 'center', track: 0 });
    const b = badge[i];
    if (b && b[2] > 0.01) {
      // [label, rgb, p]: a pill that pops onto the top-right corner
      const bp = b[2];
      const bw = 84;
      const bh = 34;
      const bx = tx + tw - bw + 12;
      const by = ty - bh / 2 - 2 - (1 - eo(bp)) * 14;
      ctx.save();
      ctx.globalAlpha *= clamp(bp * 1.6);
      rrPath(ctx, bx, by, bw, bh, bh / 2);
      ctx.fillStyle = `rgba(${b[1]},0.95)`;
      ctx.fill();
      txt(ctx, b[0], bx + bw / 2, by + 24, { size: 19, font: F.mono6, color: '#0B0508', align: 'center', track: 2 });
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}

/* =============================== the people =============================== */

/** a clean pictogram person (feet at y): head, shoulders, arms, legs; `fem` adds hair and a dress */
export function personIcon(ctx, x, y, h, { color = 'rgba(214,230,248,0.5)', a = 1, fem = false } = {}) {
  if (a <= 0.01) return;
  const s = h / 100;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.scale(s, s);
  const rr = (x0, y0, w, hh, r) => { rrPath(ctx, x0, y0, w, hh, r); ctx.fill(); };
  // head
  ctx.beginPath(); ctx.arc(0, -86, 12, 0, TAU); ctx.fill();
  if (fem) {
    // hair: a bob framing the head
    ctx.beginPath();
    ctx.moveTo(-14, -78); ctx.quadraticCurveTo(-18, -102, 0, -101); ctx.quadraticCurveTo(18, -102, 14, -78);
    ctx.quadraticCurveTo(15, -70, 10, -68); ctx.lineTo(-10, -68); ctx.quadraticCurveTo(-15, -70, -14, -78);
    ctx.fill();
    // dress: shoulders, waist, flare
    ctx.beginPath();
    ctx.moveTo(-17, -68); ctx.quadraticCurveTo(0, -72, 17, -68);
    ctx.lineTo(13, -48); ctx.lineTo(26, -20); ctx.lineTo(-26, -20); ctx.lineTo(-13, -48); ctx.closePath();
    ctx.fill();
    rr(-24, -67, 7, 34, 3.5);
    rr(17, -67, 7, 34, 3.5);
    rr(-11, -21, 8, 21, 4);
    rr(3, -21, 8, 21, 4);
  } else {
    rr(-19, -70, 38, 44, 12);
    rr(-29, -68, 8, 38, 4);
    rr(21, -68, 8, 38, 4);
    rr(-17, -30, 15, 30, 5);
    rr(2, -30, 15, 30, 5);
  }
  ctx.restore();
}

/* ================================ the world =============================== */

let WDOTS = null;
/** land as a dot matrix (land-110m, 84N..58S), unit coordinates, made once */
function worldDotList() {
  if (WDOTS) return WDOTS;
  const topo = req('world-atlas/land-110m.json');
  const { feature } = req('topojson-client');
  const land = feature(topo, topo.objects.land);
  const MW = 1440;
  const MH = 571;
  const la0 = 84;
  const la1 = -58;
  const cv = createCanvas(MW, MH);
  const c = cv.getContext('2d');
  c.fillStyle = '#fff';
  const pr = (lo, la) => [((lo + 180) / 360) * MW, ((la0 - la) / (la0 - la1)) * MH];
  for (const f of land.features) {
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of polys) {
      if (Math.max(...poly[0].map((q) => q[1])) < la1) continue;
      // unwrap every ring across the antimeridian, then paint the polygon at
      // -360, 0 and +360 so whichever side the ring started on lands on canvas
      const rings = poly.map((ring) => {
        let prevLo = null;
        return ring.map(([lo, la]) => {
          let L = lo;
          if (prevLo !== null) while (Math.abs(L - prevLo) > 180) L += L < prevLo ? 360 : -360;
          prevLo = L;
          return [L, la];
        });
      });
      for (const off of [-360, 0, 360]) {
        c.beginPath();
        for (const ring of rings) {
          ring.forEach(([lo, la], k) => {
            const [px, py] = pr(lo + off, la);
            if (k) c.lineTo(px, py); else c.moveTo(px, py);
          });
          c.closePath();
        }
        c.fill('evenodd');
      }
    }
  }
  const data = c.getImageData(0, 0, MW, MH).data;
  WDOTS = [];
  const step = 12;
  for (let y = step / 2; y < MH; y += step) {
    for (let x = step / 2; x < MW; x += step) {
      if (data[(Math.floor(y) * MW + Math.floor(x)) * 4 + 3] > 100) WDOTS.push([x / MW, y / MH]);
    }
  }
  return WDOTS;
}

/** the world as glowing dots in a w x h box; `sweep` lights a band left to right */
export function worldDots(ctx, x, y, w, h, p, { a = 1, rgb = '214,230,248', base = 0.34, sweep = -1, sweepRgb = '255,198,84', r = 3.2 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.01) return;
  const pts = worldDotList();
  ctx.save();
  ctx.globalAlpha *= a;
  for (const [u, v] of pts) {
    const reveal = clamp((q * 1.4 - u) / 0.4);
    if (reveal <= 0.01) continue;
    const px = x + u * w;
    const py = y + v * h;
    let k = base * reveal;
    let col = rgb;
    if (sweep >= 0) {
      const dd = Math.abs(u - sweep);
      const s2 = clamp(1 - dd / 0.08);
      if (s2 > 0) { k = Math.max(k, 0.95 * s2 * reveal); col = sweepRgb; }
    }
    ctx.fillStyle = `rgba(${col},${k})`;
    ctx.fillRect(px - r, py - r, r * 2, r * 2);
  }
  ctx.restore();
}

/** a comment bubble with a question mark */
export function bubble(ctx, x, y, s, p, { a = 1, color = HUD.amber, t = 0 } = {}) {
  const q = eo(p);
  if (q <= 0.01 || a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.5);
  ctx.translate(x, y);
  const k = (0.7 + 0.3 * EASE.outBack(clamp(p))) * (1 + 0.03 * Math.sin(t * 5));
  ctx.scale(k, k);
  glow(ctx, 0, 0, s * 3, '255,176,58', 0.35);
  const w = s * 1.5;
  const h = s * 1.05;
  rrPath(ctx, -w / 2, -h / 2, w, h, s * 0.3);
  ctx.fillStyle = 'rgba(24,10,10,0.9)';
  ctx.fill();
  ctx.lineWidth = s * 0.07;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, h / 2 - 2);
  ctx.lineTo(-w * 0.32, h / 2 + s * 0.32);
  ctx.lineTo(w * 0.02, h / 2 - 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  txt(ctx, '?', 0, s * 0.27, { size: s * 0.8, font: F.display, color: HUD.bone, align: 'center' });
  ctx.restore();
}

/* ================================ the scope =============================== */

const ecg = (ph) => {
  const g = (c, w, hgt) => hgt * Math.exp(-((ph - c) ** 2) / (2 * w * w));
  return g(0.12, 0.025, 0.12) - g(0.27, 0.008, 0.16) + g(0.3, 0.011, 1.0) - g(0.335, 0.01, 0.32) + g(0.56, 0.05, 0.26);
};

/**
 * The lab strip under the art: specimen, magnification, a live scale bar and
 * a heartbeat trace running on the right.
 */
export function labStrip(ctx, t, { a = 1, y = 1488, left = 'SPESIMEN · DARAH UTUH', mag = '× 4.000', um = 10, pxum = 22, bpm = 72, beat = 0 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const x0 = 104;
  const x1 = W - 104;
  ctx.strokeStyle = 'rgba(255,196,186,0.22)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  for (let xx = x0; xx <= x1; xx += 24) {
    const major = Math.round((xx - x0) / 24) % 5 === 0;
    ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y + (major ? 12 : 6)); ctx.stroke();
  }
  txt(ctx, left, x0, y + 46, { size: 20, font: F.mono6, color: HUD.sub, track: 3 });
  // scale bar
  const bl = um * pxum;
  const by = y + 84;
  ctx.fillStyle = 'rgba(243,239,228,0.85)';
  ctx.fillRect(x0, by - 3, bl, 6);
  ctx.fillRect(x0, by - 10, 3, 20);
  ctx.fillRect(x0 + bl - 3, by - 10, 3, 20);
  txt(ctx, `${um} µm`, x0 + bl + 18, by + 8, { size: 22, font: F.mono6, color: HUD.text, track: 2 });
  txt(ctx, mag, x0 + bl + 150, by + 8, { size: 22, font: F.mono6, color: HUD.amber, track: 2 });
  // heartbeat
  const ex0 = 860;
  const ex1 = x1;
  const ey = y + 66;
  const span = 2.6;
  ctx.save();
  ctx.beginPath(); ctx.rect(ex0, y + 14, ex1 - ex0, 90); ctx.clip();
  ctx.strokeStyle = 'rgba(95,227,192,0.9)';
  ctx.lineWidth = 2.6;
  ctx.shadowColor = 'rgba(95,227,192,0.7)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  const N = 180;
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const tt = t - span * (1 - f);
    const ph = ((tt * bpm) / 60) % 1;
    const yy = ey - ecg(ph < 0 ? ph + 1 : ph) * (40 + beat * 20);
    const xx = ex0 + f * (ex1 - ex0);
    if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
  }
  ctx.stroke();
  ctx.restore();
  txt(ctx, `${bpm} BPM`, ex1, y + 46, { size: 20, font: F.mono6, color: 'rgba(95,227,192,0.9)', align: 'right', track: 3 });
  ctx.restore();
}

/** a soft colour sweep across a region, for "this one changes" moments */
export function sweep(ctx, x, y, w, h, p, rgb = '255,236,170', a = 1, clip = null) {
  const q = clamp(p);
  if (q <= 0.001 || q >= 0.999 || a <= 0.01) return;
  const cx = x - w * 0.3 + (w * 1.6) * q;
  ctx.save();
  if (clip) {
    ctx.beginPath();
    if (clip.length === 3) ctx.arc(clip[0], clip[1], clip[2], 0, TAU);
    else ctx.ellipse(clip[0], clip[1], clip[2], clip[3], clip[4] || 0, 0, TAU);
    ctx.clip();
  }
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(cx - w * 0.25, y, cx + w * 0.25, y + h * 0.2);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(0.5, `rgba(${rgb},${0.45 * a * Math.sin(q * Math.PI)})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

export { sm, eo };
