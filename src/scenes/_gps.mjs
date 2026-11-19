import { createCanvas, Path2D } from '@napi-rs/canvas';
import { W, H, txt, measure, seg7 } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng, EASE } from '../engine/anim.mjs';
import { fbm3 } from './_earth.mjs';
import { rrPath } from './_bulan.mjs';
import { grain } from './_lab.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Ep26 kit — "jam di orbit".
//
// Relativity in a pocket device. One look across the episode: a dark
// navigation map drawn as vectors (crisp at every zoom), a phone, a GPS
// satellite drawn panel by panel (gold foil, cell grids, helix array), clocks
// that disagree, football pitches for scale, a 1977 chart recorder, a
// frequency counter. Blue is the phone, ice is "slower" (speed), amber is
// "faster" (weak gravity), red is the error.
// ─────────────────────────────────────────────────────────────────────────────

export const G = {
  blue: '#3E8BFF', blueRgb: '62,139,255', blueHi: '#9CC8FF',
  slow: '#7CC6FF', slowRgb: '124,198,255', slowHi: '#C2E6FF',
  fast: '#FFB03A', fastRgb: '255,176,58', fastHi: '#FFD27A',
  red: '#FF5A4A', redRgb: '255,90,74',
  mint: '#5FE3C0', mintRgb: '95,227,192',
  bone: '#F3EFE4', text: '#D6E6F8', sub: 'rgba(214,230,248,0.62)', dim: 'rgba(214,230,248,0.3)',
};

export const P = (t, at, d) => clamp((t - at) / Math.max(1e-3, d));
export const eo = (p) => EASE.outCubic(clamp(p));
export const io = (p) => EASE.inOutQuad(clamp(p));
export const sm = (p) => EASE.smooth(clamp(p));
export const back = (p) => {
  const c = 1.7;
  const x = clamp(p) - 1;
  return 1 + x * x * ((c + 1) * x + c);
};

const BAKED = new Map();
function bake(key, w, h, fn) {
  let c = BAKED.get(key);
  if (c) return c;
  c = createCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  fn(c.getContext('2d'), c.width, c.height);
  BAKED.set(key, c);
  return c;
}

/**
 * Draw `fn` into an offscreen frame and lay it over the scene at `alpha`:
 * cross-fades stay clean even when the drawing sets its own globalAlpha.
 */
const LAYERS = [];
let depth = 0;
export function layer(ctx, alpha, fn) {
  if (alpha <= 0.001) return;
  if (alpha >= 0.999) { fn(ctx); return; }
  if (!LAYERS[depth]) LAYERS[depth] = createCanvas(W, H);
  const cv = LAYERS[depth];
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
  c.clearRect(0, 0, W, H);
  depth++;
  try { fn(c); } finally { depth--; }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(cv, 0, 0);
  ctx.restore();
}

/* ================================ the map ================================== */

// A city that does not exist, generated once: a warped street grid, arterials
// every fifth street, two highways, a ring road, a river, a railway, parks.
// Plate units are pixels at PX_KM pixels per kilometre.
const MS = 2400;
export const PX_KM = 62;
const ROT = 0.2;
const SU = 44;
const SV = 52;
const EXT = 1750;

function rot2(u, v) {
  const c = Math.cos(ROT);
  const s = Math.sin(ROT);
  return [MS / 2 + u * c - v * s, MS / 2 + u * s + v * c];
}
function warp(x, y) {
  const f = 1 / 820;
  return [
    x + (fbm3(x * f, y * f, 0.3, 3, 41) - 0.5) * 260,
    y + (fbm3(x * f + 7.1, y * f - 3.3, 1.7, 3, 43) - 0.5) * 260,
  ];
}
/** a point of the street grid (u along the streets, v across) in plate units */
export function gridPt(u, v) {
  const [x, y] = rot2(u, v);
  return warp(x, y);
}
function polyU(v, u0, u1, step = 22) {
  const pts = [];
  const n = Math.max(1, Math.ceil(Math.abs(u1 - u0) / step));
  for (let i = 0; i <= n; i++) pts.push(gridPt(lerp(u0, u1, i / n), v));
  return pts;
}
function polyV(u, v0, v1, step = 22) {
  const pts = [];
  const n = Math.max(1, Math.ceil(Math.abs(v1 - v0) / step));
  for (let i = 0; i <= n; i++) pts.push(gridPt(u, lerp(v0, v1, i / n)));
  return pts;
}
function addPoly(path, pts) {
  pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
}

let MAPD = null;
export function mapData() {
  if (MAPD) return MAPD;
  const R = rng(2601);
  const minor = new Path2D();
  const major = new Path2D();
  const nI = Math.floor(EXT / SU);
  const nJ = Math.floor(EXT / SV);
  for (let j = -nJ; j <= nJ; j++) {
    const v = j * SV;
    if (j % 5 === 0) { addPoly(major, polyU(v, -EXT, EXT)); continue; }
    for (let i = -nI; i < nI; i++) {
      if (R() < 0.14) continue;
      addPoly(minor, polyU(v, i * SU, (i + 1) * SU, 22));
    }
  }
  for (let i = -nI; i <= nI; i++) {
    const u = i * SU;
    if (i % 5 === 0) { addPoly(major, polyV(u, -EXT, EXT)); continue; }
    for (let j = -nJ; j < nJ; j++) {
      if (R() < 0.14) continue;
      addPoly(minor, polyV(u, j * SV, (j + 1) * SV, 26));
    }
  }
  const hwy = new Path2D();
  const h1 = [];
  const h2 = [];
  for (let i = 0; i <= 140; i++) {
    const s = i / 140;
    h1.push([lerp(-90, MS + 90, s), 420 + s * 1450 + Math.sin(s * 3.2) * 170]);
    h2.push([1560 + Math.sin(s * 2.6 + 0.5) * 230 - s * 320, lerp(-90, MS + 90, s)]);
  }
  addPoly(hwy, h1);
  addPoly(hwy, h2);
  const ring = new Path2D();
  const rp = [];
  for (let i = 0; i <= 200; i++) {
    const a = (i / 200) * TAU;
    const r = 660 + (fbm3(Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0.5, 3, 61) - 0.5) * 170;
    rp.push([MS / 2 + 70 + Math.cos(a) * r, MS / 2 - 30 + Math.sin(a) * r * 0.92]);
  }
  addPoly(ring, rp);
  const river = new Path2D();
  const rv = [];
  {
    const dx = MS + 240;
    const dy = 1840;
    const L = Math.hypot(dx, dy);
    for (let i = 0; i <= 180; i++) {
      const s = i / 180;
      const off = Math.sin(s * TAU * 2.2 + 0.7) * 125 + (fbm3(s * 6, 0.5, 0.2, 3, 71) - 0.5) * 170;
      rv.push([lerp(-120, MS + 120, s) + (-dy / L) * off, lerp(250, 2090, s) + (dx / L) * off]);
    }
  }
  addPoly(river, rv);
  const rail = new Path2D();
  const rl = [];
  for (let i = 0; i <= 120; i++) {
    const s = i / 120;
    rl.push([lerp(690, 280, s) + Math.sin(s * 3) * 95, lerp(-80, MS + 80, s)]);
  }
  addPoly(rail, rl);
  const lake = new Path2D();
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * TAU;
    const r = 1 + 0.18 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 5);
    const x = 1790 + Math.cos(a) * 150 * r;
    const y = 690 + Math.sin(a) * 95 * r;
    if (i === 0) lake.moveTo(x, y);
    else lake.lineTo(x, y);
  }
  lake.closePath();

  // land and parks: rasters, soft-edged like a real basemap
  const land = bake('gps:land', 400, 400, (x, w, h) => {
    const img = x.createImageData(w, h);
    const d = img.data;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const px = xx / w;
        const py = yy / h;
        const n = fbm3(px * 11, py * 11, 0.4, 4, 13);
        const core = Math.exp(-((px - 0.53) ** 2 + (py - 0.48) ** 2) / 0.07);
        const i = (yy * w + xx) * 4;
        d[i] = 15 + 7 * core + 7 * (n - 0.5);
        d[i + 1] = 21 + 9 * core + 7 * (n - 0.5);
        d[i + 2] = 30 + 12 * core + 9 * (n - 0.5);
        d[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
  });
  const parks = bake('gps:parks', 600, 600, (x, w, h) => {
    const img = x.createImageData(w, h);
    const d = img.data;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const px = xx / w;
        const py = yy / h;
        const m = sm((fbm3(px * 5.4, py * 5.4, 2.2, 4, 29) - 0.655) / 0.03);
        const tex = fbm3(px * 60, py * 60, 0.1, 2, 31);
        const i = (yy * w + xx) * 4;
        d[i] = 14 + 6 * tex;
        d[i + 1] = 38 + 10 * tex;
        d[i + 2] = 29 + 6 * tex;
        d[i + 3] = 235 * m;
      }
    }
    x.putImageData(img, 0, 0);
  });

  // the route: west along an arterial, then north up another one
  const route = [];
  const seg = (u0, v0, u1, v1) => {
    const n = Math.ceil(Math.hypot(u1 - u0, v1 - v0) / 8);
    for (let i = route.length ? 1 : 0; i <= n; i++) route.push(gridPt(lerp(u0, u1, i / n), lerp(v0, v1, i / n)));
  };
  seg(-430, 520, 220, 520);
  seg(220, 520, 220, -260);
  const cum = [0];
  for (let i = 1; i < route.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
  }
  MAPD = { minor, major, hwy, ring, river, rail, lake, land, parks, route, cum, len: cum[cum.length - 1] };
  return MAPD;
}

/** where the route is at fraction f, and which way it points */
export function routeAt(f) {
  const D = mapData();
  const s = clamp(f) * D.len;
  let i = 1;
  while (i < D.cum.length - 1 && D.cum[i] < s) i++;
  const a = D.route[i - 1];
  const b = D.route[i];
  const k = (s - D.cum[i - 1]) / Math.max(1e-6, D.cum[i] - D.cum[i - 1]);
  return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}

/** a map camera: plate point (mx, my) lands on screen point (cx, cy) at scale k */
export const mapView = (mx, my, k, cx = W / 2, cy = 1000, rot = 0) => ({ mx, my, k, cx, cy, rot });
export function m2s(v, x, y) {
  const dx = (x - v.mx) * v.k;
  const dy = (y - v.my) * v.k;
  const c = Math.cos(v.rot);
  const s = Math.sin(v.rot);
  return [v.cx + dx * c - dy * s, v.cy + dx * s + dy * c];
}
function applyView(ctx, v) {
  ctx.translate(v.cx, v.cy);
  if (v.rot) ctx.rotate(v.rot);
  ctx.scale(v.k, v.k);
  ctx.translate(-v.mx, -v.my);
}

/** the basemap; roads keep a screen width that grows gently with zoom */
export function drawMap(ctx, v, { a = 1, route = null, routeColor = '#3E8BFF', routeA = 1 } = {}) {
  if (a <= 0.004) return;
  const D = mapData();
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = '#0D121A';
  ctx.fillRect(-W, -H, W * 3, H * 3);
  applyView(ctx, v);
  const k = v.k;
  const px = 1 / k;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(D.land, 0, 0, MS, MS);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // streets
  ctx.strokeStyle = '#1E2836';
  ctx.lineWidth = (1.4 + 1.3 * k) * px;
  ctx.stroke(D.minor);
  ctx.drawImage(D.parks, 0, 0, MS, MS);
  // water cuts the streets, the arterials cross it on bridges
  ctx.strokeStyle = '#0B2235';
  ctx.lineWidth = 30;
  ctx.stroke(D.river);
  ctx.fillStyle = '#0B2235';
  ctx.fill(D.lake);
  ctx.strokeStyle = 'rgba(70,130,180,0.25)';
  ctx.lineWidth = 1.6 * px;
  ctx.stroke(D.lake);
  // arterials
  ctx.strokeStyle = '#0A0E14';
  ctx.lineWidth = (4.5 + 2.6 * k) * px;
  ctx.stroke(D.major);
  ctx.strokeStyle = '#2E3B4E';
  ctx.lineWidth = (3 + 2 * k) * px;
  ctx.stroke(D.major);
  // ring + highways
  ctx.strokeStyle = '#0A0E14';
  ctx.lineWidth = (7 + 3.6 * k) * px;
  ctx.stroke(D.ring);
  ctx.stroke(D.hwy);
  ctx.strokeStyle = '#3B4A60';
  ctx.lineWidth = (5 + 2.8 * k) * px;
  ctx.stroke(D.ring);
  ctx.strokeStyle = '#7A6340';
  ctx.lineWidth = (5.5 + 3 * k) * px;
  ctx.stroke(D.hwy);
  // railway: a grey line with sleepers
  ctx.strokeStyle = '#3A4352';
  ctx.lineWidth = (2.2 + 0.8 * k) * px;
  ctx.stroke(D.rail);
  ctx.setLineDash([3 * px, 9 * px]);
  ctx.strokeStyle = '#7E8899';
  ctx.lineWidth = (5 + 1.5 * k) * px;
  ctx.stroke(D.rail);
  ctx.setLineDash([]);
  if (route) {
    const [f0, f1] = route;
    const pts = [];
    const n = 160;
    for (let i = 0; i <= n; i++) {
      const p = routeAt(lerp(f0, f1, i / n));
      pts.push([p.x, p.y]);
    }
    ctx.globalAlpha = a * routeA;
    ctx.strokeStyle = 'rgba(20,50,110,0.9)';
    ctx.lineWidth = (10 + 3 * k) * px;
    ctx.beginPath();
    addPoly(ctx, pts);
    ctx.stroke();
    ctx.strokeStyle = routeColor;
    ctx.lineWidth = (7 + 2.4 * k) * px;
    ctx.beginPath();
    addPoly(ctx, pts);
    ctx.stroke();
  }
  ctx.restore();
}

/** the map turned so the drive points up the screen (frozen, so drift reads) */
let NAVROT = null;
export function navRot() {
  if (NAVROT == null) NAVROT = -routeAt(0.5).ang - Math.PI / 2;
  return NAVROT;
}

/**
 * The navigation screen of the phone, in the phone's frame. `me` is where the
 * true position sits on screen; `drift` 0..1 sends the GPS fix `km` away along
 * `dir`; `recalc` reddens the banner. Returns the true and the shown position.
 */
export function navScreen(c, x, y, w, h, {
  t = 0, f = 0.5, k = 2.2, me = [0, 260], drift = 0, km = 10, dir = [0.45, -0.89], recalc = 0,
  pinP = 0, ui = 1, hiBars = 0, acc = 46, time = '09:41', banner = 1, eta = 1,
} = {}) {
  const r = routeAt(f);
  const v = mapView(r.x, r.y, k, me[0], me[1], navRot());
  drawMap(c, v, { route: [f, 1] });
  const L = km * PX_KM * k * drift;
  const fx = me[0] + dir[0] * L;
  const fy = me[1] + dir[1] * L;
  if (pinP > 0) pin(c, me[0], me[1], { p: pinP, s: 0.95 });
  puck(c, fx, fy, { heading: -Math.PI / 2, acc: acc * (1 + 1.6 * drift), t });
  if (ui > 0) {
    c.save();
    c.globalAlpha *= ui;
    const top = c.createLinearGradient(0, y, 0, y + 140);
    top.addColorStop(0, 'rgba(0,0,0,0.55)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = top;
    c.fillRect(x, y, w, 140);
    statusBar(c, x, y, w, { time, hi: hiBars, size: w * 0.047 });
    if (banner > 0) navBanner(c, x + w * 0.035, y + w * 0.17, w * 0.93, { recalc, t, size: w * 0.058, a: banner });
    if (eta > 0) etaCard(c, x + w * 0.025, y + h - w * 0.215, w * 0.95, { size: w * 0.064, warn: recalc, a: eta, eta: recalc > 0.5 ? '-- mnt' : '12 mnt' });
    c.restore();
  }
  return { mx: me[0], my: me[1], fx, fy, v };
}

/* ================================ the phone ================================ */

/**
 * A current phone: titanium frame, black bezel, dynamic island, one sheen.
 * `content(ctx, x, y, w, h)` draws the screen in the phone's own frame
 * (origin at the centre of the phone), already clipped to the glass.
 */
export function phone(ctx, cx, cy, w, h, { a = 1, rot = 0, content = null, glare = 1, shadow = 1, screenBg = '#05070B', island = 1 } = {}) {
  if (a <= 0.004) return;
  const r = w * 0.13;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx, cy);
  if (rot) ctx.rotate(rot);
  const x0 = -w / 2;
  const y0 = -h / 2;
  ctx.fillStyle = '#454B55';
  rrPath(ctx, x0 - 7, y0 + h * 0.16, 10, h * 0.045, 3);
  ctx.fill();
  rrPath(ctx, x0 - 7, y0 + h * 0.235, 10, h * 0.08, 3);
  ctx.fill();
  rrPath(ctx, x0 - 7, y0 + h * 0.33, 10, h * 0.08, 3);
  ctx.fill();
  rrPath(ctx, x0 + w - 3, y0 + h * 0.26, 10, h * 0.12, 3);
  ctx.fill();
  if (shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 80;
    ctx.shadowOffsetY = 40;
    rrPath(ctx, x0, y0, w, h, r);
    ctx.fillStyle = '#16191E';
    ctx.fill();
    ctx.restore();
  }
  const fg = ctx.createLinearGradient(x0, y0, x0 + w, y0 + h);
  fg.addColorStop(0, '#6A707B');
  fg.addColorStop(0.3, '#2C3038');
  fg.addColorStop(0.62, '#434852');
  fg.addColorStop(1, '#1B1E24');
  rrPath(ctx, x0, y0, w, h, r);
  ctx.fillStyle = fg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(226,232,242,0.5)';
  ctx.lineWidth = 2;
  rrPath(ctx, x0 + 1.5, y0 + 1.5, w - 3, h - 3, r - 1.5);
  ctx.stroke();
  const b = w * 0.022;
  rrPath(ctx, x0 + b, y0 + b, w - 2 * b, h - 2 * b, r - b);
  ctx.fillStyle = '#010203';
  ctx.fill();
  const s = w * 0.038;
  const sx = x0 + s;
  const sy = y0 + s;
  const sw = w - 2 * s;
  const sh = h - 2 * s;
  ctx.save();
  rrPath(ctx, sx, sy, sw, sh, r - s);
  ctx.clip();
  ctx.fillStyle = screenBg;
  ctx.fillRect(sx, sy, sw, sh);
  if (content) content(ctx, sx, sy, sw, sh);
  if (island) {
    ctx.fillStyle = '#000';
    rrPath(ctx, -w * 0.15, sy + sh * 0.014, w * 0.3, w * 0.088, w * 0.044);
    ctx.fill();
  }
  if (glare > 0) {
    const gx = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh * 0.55);
    gx.addColorStop(0, `rgba(255,255,255,${0.11 * glare})`);
    gx.addColorStop(0.42, `rgba(255,255,255,${0.025 * glare})`);
    gx.addColorStop(0.43, 'rgba(255,255,255,0)');
    gx.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gx;
    ctx.fillRect(sx, sy, sw, sh);
  }
  ctx.restore();
  ctx.restore();
}

/** status bar: time, location arrow, signal bars, battery (screen top-left x, y) */
export function statusBar(ctx, x, y, w, { time = '09:41', a = 1, bars = 4, gps = 1, size = 30, hi = 0 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const ty = y + size * 1.7;
  const tx = x + w * 0.15;
  txt(ctx, time, tx, ty, { size, font: F.semi, color: '#F5F7FA', align: 'center' });
  if (gps) {
    const ax = tx + measure(ctx, time, size, F.semi) / 2 + size * 0.62;
    const ay = ty - size * 0.36;
    ctx.fillStyle = '#F5F7FA';
    ctx.beginPath();
    ctx.moveTo(ax + size * 0.34, ay - size * 0.32);
    ctx.lineTo(ax - size * 0.3, ay - size * 0.04);
    ctx.lineTo(ax + size * 0.02, ay + size * 0.0);
    ctx.lineTo(ax + size * 0.06, ay + size * 0.32);
    ctx.closePath();
    ctx.fill();
  }
  const bx = x + w * 0.68;
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = a * (i < bars ? 1 : 0.3);
    ctx.fillStyle = hi > 0 ? `rgba(${lerp(245, 95, hi)},${lerp(247, 227, hi)},${lerp(250, 192, hi)},1)` : '#F5F7FA';
    const bh = size * (0.3 + i * 0.17);
    rrPath(ctx, bx + i * size * 0.31, ty - bh, size * 0.21, bh, 2);
    ctx.fill();
  }
  ctx.globalAlpha = a;
  const btx = bx + size * 1.55;
  ctx.strokeStyle = 'rgba(245,247,250,0.55)';
  ctx.lineWidth = 2;
  rrPath(ctx, btx, ty - size * 0.68, size * 1.2, size * 0.66, size * 0.18);
  ctx.stroke();
  ctx.fillStyle = '#F5F7FA';
  rrPath(ctx, btx + 3.5, ty - size * 0.68 + 3.5, size * 0.85, size * 0.66 - 7, size * 0.12);
  ctx.fill();
  ctx.restore();
}

/** turn-by-turn banner; `recalc` 0..1 turns it into "recalculating" */
export function navBanner(ctx, x, y, w, { a = 1, recalc = 0, dist = '200 m', street = 'Jl. Merdeka', t = 0, size = 40 } = {}) {
  if (a <= 0.004) return;
  const h = size * 3.2;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  rrPath(ctx, x, y, w, h, size * 0.55);
  const c0 = [16, 84, 58];
  const c1 = [128, 30, 26];
  const m = (i) => Math.round(lerp(c0[i], c1[i], recalc));
  ctx.fillStyle = `rgb(${m(0)},${m(1)},${m(2)})`;
  ctx.fill();
  ctx.restore();
  const ix = x + size * 1.35;
  const iy = y + h / 2;
  if (recalc < 0.5) {
    ctx.globalAlpha = a * (1 - recalc * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = size * 0.17;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ix - size * 0.3, iy + size * 0.7);
    ctx.lineTo(ix - size * 0.3, iy - size * 0.05);
    ctx.quadraticCurveTo(ix - size * 0.3, iy - size * 0.35, ix, iy - size * 0.35);
    ctx.lineTo(ix + size * 0.35, iy - size * 0.35);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(ix + size * 0.62, iy - size * 0.35);
    ctx.lineTo(ix + size * 0.28, iy - size * 0.65);
    ctx.lineTo(ix + size * 0.28, iy - size * 0.05);
    ctx.closePath();
    ctx.fill();
    txt(ctx, dist, x + size * 2.6, y + size * 1.45, { size: size * 1.0, font: F.head, color: '#FFFFFF' });
    txt(ctx, street, x + size * 2.6, y + size * 2.45, { size: size * 0.62, font: F.semi, color: 'rgba(255,255,255,0.82)' });
  } else {
    const q = (recalc - 0.5) * 2;
    ctx.globalAlpha = a * q;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = size * 0.13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(ix, iy, size * 0.48, t * 7, t * 7 + 4.4);
    ctx.stroke();
    txt(ctx, 'Rute dihitung ulang…', x + size * 2.6, y + size * 1.5, { size: size * 0.8, font: F.head, color: '#FFFFFF', maxWidth: w - size * 3 });
    txt(ctx, 'Kamu keluar dari rute', x + size * 2.6, y + size * 2.45, { size: size * 0.6, font: F.semi, color: 'rgba(255,255,255,0.82)' });
  }
  ctx.restore();
}

/** bottom card: minutes to go, distance, arrival time */
export function etaCard(ctx, x, y, w, { a = 1, eta = '12 mnt', sub = '4,1 km · 09:53', size = 44, warn = 0 } = {}) {
  if (a <= 0.004) return;
  const h = size * 2.7;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 30;
  rrPath(ctx, x, y, w, h, size * 0.6);
  ctx.fillStyle = '#141A23';
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  rrPath(ctx, x + w / 2 - size * 0.9, y + size * 0.22, size * 1.8, size * 0.14, size * 0.07);
  ctx.fill();
  const col = warn > 0.5 ? '#FF6B5E' : '#4BD18B';
  txt(ctx, eta, x + size * 0.8, y + size * 1.55, { size: size * 1.05, font: F.head, color: col });
  txt(ctx, sub, x + size * 0.8, y + size * 2.3, { size: size * 0.55, font: F.semi, color: 'rgba(230,236,245,0.7)' });
  ctx.fillStyle = '#C8352B';
  rrPath(ctx, x + w - size * 3.6, y + size * 0.85, size * 2.8, size * 1.15, size * 0.58);
  ctx.fill();
  txt(ctx, 'Keluar', x + w - size * 2.2, y + size * 1.62, { size: size * 0.55, font: F.head, color: '#FFFFFF', align: 'center' });
  ctx.restore();
}

/** the blue location puck: accuracy halo, heading cone, pulse */
export function puck(ctx, x, y, { a = 1, r = 17, heading = null, acc = 0, t = 0, color = G.blue, rgb = G.blueRgb, pulse = 1 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (acc > 0) {
    ctx.fillStyle = `rgba(${rgb},0.13)`;
    ctx.beginPath();
    ctx.arc(x, y, acc, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(${rgb},0.38)`;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  if (heading != null) {
    const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 4.4);
    g.addColorStop(0, `rgba(${rgb},0.6)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r * 4.4, heading - 0.44, heading + 0.44);
    ctx.closePath();
    ctx.fill();
  }
  if (pulse) {
    const q = (t * 0.8) % 1;
    ctx.strokeStyle = `rgba(${rgb},${0.55 * (1 - q)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r + q * r * 2.4, 0, TAU);
    ctx.stroke();
  }
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** a teardrop map pin dropping onto (x, y) */
export function pin(ctx, x, y, { a = 1, s = 1, color = G.red, p = 1, hole = '#FFFFFF' } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.004) return;
  const drop = (1 - back(q)) * 70 * s;
  const R = 26 * s;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 2.5);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(x, y, R * 0.75, R * 0.26, 0, 0, TAU);
  ctx.fill();
  ctx.translate(x, y - drop);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-R * 0.3, -R * 0.75, -R, -R * 1.25, -R, -R * 2.05);
  ctx.arc(0, -R * 2.05, R, Math.PI, 0);
  ctx.bezierCurveTo(R, -R * 1.25, R * 0.3, -R * 0.75, 0, 0);
  ctx.closePath();
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  const hg = ctx.createLinearGradient(-R, -R * 3, R * 0.6, -R);
  hg.addColorStop(0, 'rgba(255,255,255,0.35)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.fillStyle = hole;
  ctx.beginPath();
  ctx.arc(0, -R * 2.05, R * 0.38, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ============================== the satellite ============================== */

function foilTile() {
  return bake('gps:foil', 192, 192, (x, w, h) => {
    const img = x.createImageData(w, h);
    const d = img.data;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const n1 = fbm3(xx * 0.05, yy * 0.05, 0.2, 4, 101);
        const n2 = fbm3(xx * 0.16, yy * 0.12, 1.3, 3, 107);
        const crease = Math.abs(Math.sin(n1 * 21 + n2 * 4));
        const v = clamp(0.3 + 0.75 * (n1 - 0.5) + 0.45 * crease * n2);
        const i = (yy * w + xx) * 4;
        d[i] = 110 + 145 * v;
        d[i + 1] = 70 + 128 * v;
        d[i + 2] = 18 + 58 * v;
        d[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
  });
}

function solarPanel(ctx, x, y, w, h, t, sheen, seed) {
  ctx.fillStyle = '#AEB8C6';
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  const g = ctx.createLinearGradient(x, y, x + w * 0.3, y + h);
  g.addColorStop(0, '#26407A');
  g.addColorStop(0.5, '#172B58');
  g.addColorStop(1, '#0C1736');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  const nx = Math.max(1, Math.round(w / 21));
  const ny = 6;
  ctx.strokeStyle = 'rgba(150,185,240,0.3)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let i = 1; i < nx; i++) {
    const xx = x + (w * i) / nx;
    ctx.moveTo(xx, y);
    ctx.lineTo(xx, y + h);
  }
  for (let j = 1; j < ny; j++) {
    const yy = y + (h * j) / ny;
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(210,225,250,0.12)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let j = 0; j < ny; j++) {
    const yy = y + (h * (j + 0.5)) / ny;
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
  }
  ctx.stroke();
  if (sheen > 0) {
    const ph = ((t * 0.16 + seed * 0.23) % 1.7) - 0.35;
    const sx = x + ph * w * 1.5;
    const sg = ctx.createLinearGradient(sx - 70, y, sx + 70, y + h);
    sg.addColorStop(0, 'rgba(190,215,255,0)');
    sg.addColorStop(0.5, `rgba(190,215,255,${0.3 * sheen})`);
    sg.addColorStop(1, 'rgba(190,215,255,0)');
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = sg;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

function helix(ctx, x, y, w, h) {
  ctx.fillStyle = '#EEF2F7';
  ctx.fillRect(x - w / 2, y, w, h);
  ctx.strokeStyle = 'rgba(70,82,104,0.75)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let k = 2; k < h; k += 5) {
    ctx.moveTo(x - w / 2, y + k);
    ctx.lineTo(x + w / 2, y + k + 3);
  }
  ctx.stroke();
  ctx.fillStyle = '#C3CCD8';
  ctx.beginPath();
  ctx.arc(x, y + h, w / 2, 0, Math.PI);
  ctx.fill();
}

/**
 * GPS satellite (Block III style), side view, nadir array pointing down at
 * rot = 0. About 840 px wide at s = 1. `wings` 0..1 deploys the arrays.
 */
export function satellite(ctx, x, y, s, { rot = 0, a = 1, t = 0, wings = 1, sheen = 1, rim = 1, tint = null } = {}) {
  if (a <= 0.004 || s <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  const BW = 124;
  const BH = 156;
  for (const side of [-1, 1]) {
    const yx = side > 0 ? BW / 2 + 6 : -BW / 2 - 6 - 50;
    ctx.fillStyle = '#8F99AA';
    ctx.fillRect(yx, -5, 50, 10);
    ctx.fillStyle = '#6B7486';
    ctx.fillRect(yx, 3, 50, 2);
    for (let k = 0; k < 2; k++) {
      const pw = 172 * wings;
      if (pw < 2) continue;
      const off = BW / 2 + 56 + k * (172 + 10) * wings;
      const px0 = side > 0 ? off : -off - pw;
      solarPanel(ctx, px0, -64, pw, 128, t, sheen, k + (side > 0 ? 2 : 0));
    }
  }
  ctx.fillStyle = '#D9DFE7';
  ctx.fillRect(-BW / 2 - 9, -BH / 2 + 12, 9, BH - 24);
  ctx.fillRect(BW / 2, -BH / 2 + 12, 9, BH - 24);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-BW / 2, -BH / 2, BW, BH);
  ctx.clip();
  ctx.fillStyle = ctx.createPattern(foilTile(), 'repeat');
  ctx.fillRect(-BW / 2, -BH / 2, BW, BH);
  const sh = ctx.createLinearGradient(-BW / 2, -BH / 2, BW / 2, BH / 2);
  sh.addColorStop(0, 'rgba(255,240,200,0.3)');
  sh.addColorStop(0.5, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = sh;
  ctx.fillRect(-BW / 2, -BH / 2, BW, BH);
  ctx.strokeStyle = 'rgba(70,40,5,0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-BW / 2, -BH / 5);
  ctx.lineTo(BW / 2, -BH / 5 + 9);
  ctx.moveTo(-BW / 6, -BH / 2);
  ctx.lineTo(-BW / 6 - 7, BH / 2);
  ctx.moveTo(-BW / 2, BH / 3);
  ctx.lineTo(BW / 2, BH / 3 - 6);
  ctx.stroke();
  if (tint) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = tint;
    ctx.fillRect(-BW / 2, -BH / 2, BW, BH);
  }
  ctx.restore();
  // top deck: crosslink dish and thrusters
  ctx.fillStyle = '#C9D0DA';
  ctx.fillRect(-BW / 2 + 6, -BH / 2 - 8, BW - 12, 8);
  ctx.fillStyle = '#E6EAF0';
  ctx.beginPath();
  ctx.ellipse(18, -BH / 2 - 30, 30, 12, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9AA4B4';
  ctx.fillRect(15, -BH / 2 - 30, 6, 22);
  ctx.fillStyle = '#7A8494';
  for (const sx of [-BW / 2 + 10, BW / 2 - 22]) {
    ctx.beginPath();
    ctx.moveTo(sx, -BH / 2 - 8);
    ctx.lineTo(sx + 12, -BH / 2 - 8);
    ctx.lineTo(sx + 9, -BH / 2 - 20);
    ctx.lineTo(sx + 3, -BH / 2 - 20);
    ctx.closePath();
    ctx.fill();
  }
  // nadir face: the L-band helix array that talks to your phone
  ctx.fillStyle = '#E9EDF3';
  ctx.fillRect(-BW / 2 - 8, BH / 2, BW + 16, 12);
  for (let i = 0; i < 6; i++) helix(ctx, -BW / 2 + 12 + i * ((BW - 24) / 5), BH / 2 + 12, 10, 36);
  if (rim > 0) {
    ctx.strokeStyle = `rgba(255,228,170,${0.4 * rim})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(-BW / 2, -BH / 2, BW, BH);
  }
  ctx.restore();
}

/* ================================ signals ================================== */

/** wavefronts leaving (x0, y0) toward (x1, y1), one every period/n seconds */
export function pulses(ctx, x0, y0, x1, y1, t, { a = 1, rgb = G.blueRgb, period = 1.2, n = 4, spread = 0.34, lw = 4, r0 = 40, born = 0, reach = 1 } = {}) {
  if (a <= 0.004) return;
  const L = Math.hypot(x1 - x0, y1 - y0) * reach;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const el = t - born;
  if (el <= 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const age = el - (i * period) / n;
    if (age < 0) continue;
    const f = (age % period) / period;
    const r = r0 + f * (L - r0);
    const al = a * Math.min(1, f * 6) * (1 - f);
    if (al <= 0.01) continue;
    const sp = spread * (1 - 0.35 * f);
    ctx.strokeStyle = `rgba(${rgb},${al})`;
    ctx.lineWidth = lw * (1 - 0.4 * f);
    ctx.beginPath();
    ctx.arc(x0, y0, r, ang - sp, ang + sp);
    ctx.stroke();
  }
  ctx.restore();
}

/** a bright packet running from (x0, y0) to (x1, y1) with a trail; q = 0..1 */
export function packet(ctx, x0, y0, x1, y1, q, { a = 1, rgb = G.blueRgb, size = 10, trail = 0.22 } = {}) {
  if (q <= 0 || q > 1.0 || a <= 0.004) return null;
  const x = lerp(x0, x1, q);
  const y = lerp(y0, y1, q);
  const q0 = clamp(q - trail);
  const tx = lerp(x0, x1, q0);
  const ty = lerp(y0, y1, q0);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(tx, ty, x, y);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(1, `rgba(${rgb},${0.85 * a})`);
  ctx.strokeStyle = g;
  ctx.lineWidth = size * 0.9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(x, y);
  ctx.stroke();
  const rg = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
  rg.addColorStop(0, `rgba(255,255,255,${a})`);
  rg.addColorStop(0.25, `rgba(${rgb},${0.85 * a})`);
  rg.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = rg;
  ctx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
  ctx.restore();
  return [x, y];
}

/* ================================= clocks ================================== */

/** text whose digits all take the same width, so counters never jitter */
export function digits(ctx, s, x, y, { size = 100, font = F.num, color = G.bone, align = 'left', a = 1, glowC = null, track = 0 } = {}) {
  if (a <= 0.004) return 0;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  let dw = 0;
  for (const c of '0123456789') dw = Math.max(dw, ctx.measureText(c).width);
  const adv = (ch) => (ch >= '0' && ch <= '9' ? dw : ctx.measureText(ch).width) + track;
  let tw = -track;
  for (const ch of s) tw += adv(ch);
  let cx = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  if (glowC) {
    ctx.shadowColor = glowC;
    ctx.shadowBlur = size * 0.28;
  }
  for (const ch of s) {
    const w = adv(ch);
    ctx.fillText(ch, cx + (w - track) / 2, y);
    cx += w;
  }
  ctx.restore();
  return tw;
}

const pad = (n, k) => String(Math.floor(n)).padStart(k, '0');
/** "09:41:27" and ",381 042": the time as an atomic clock shows it */
export function clockStrings(sec) {
  const s = ((sec % 86400) + 86400) % 86400;
  const hh = pad(s / 3600, 2);
  const mm = pad((s % 3600) / 60, 2);
  const ss = pad(s % 60, 2);
  const us = Math.floor((s % 1) * 1e6);
  return { hms: `${hh}:${mm}:${ss}`, us: `${pad(us / 1000, 3)} ${pad(us % 1000, 3)}` };
}

/** the same readout from a whole number of microseconds (no float rounding) */
export function clockStringsUs(totalUs) {
  const day = 86400 * 1e6;
  const u = ((Math.round(totalUs) % day) + day) % day;
  const sec = Math.floor(u / 1e6);
  const us = u - sec * 1e6;
  return { hms: `${pad(sec / 3600, 2)}:${pad((sec % 3600) / 60, 2)}:${pad(sec % 60, 2)}`, us: `${pad(us / 1000, 3)} ${pad(us % 1000, 3)}` };
}

/** analog clock face with smooth hands; `ghost` draws a second hand for comparison */
export function clockFace(ctx, cx, cy, r, sec, { a = 1, rgb = '214,230,248', accent = G.fast, accentRgb = G.fastRgb, p = 1, ghost = null, ghostRgb = '214,230,248', glowK = 0 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  const R = r * (0.86 + 0.14 * back(clamp(p)));
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  if (glowK > 0) {
    const gg = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.7);
    gg.addColorStop(0, `rgba(${accentRgb},${0.3 * glowK})`);
    gg.addColorStop(1, `rgba(${accentRgb},0)`);
    ctx.fillStyle = gg;
    ctx.fillRect(cx - R * 1.8, cy - R * 1.8, R * 3.6, R * 3.6);
  }
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 18;
  const bz = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  bz.addColorStop(0, '#727986');
  bz.addColorStop(0.45, '#262A32');
  bz.addColorStop(1, '#4E5460');
  ctx.fillStyle = bz;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fill();
  ctx.restore();
  const face = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R * 0.95);
  face.addColorStop(0, '#1C2433');
  face.addColorStop(1, '#070A10');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.92, 0, TAU);
  ctx.fill();
  ctx.lineCap = 'butt';
  for (let i = 0; i < 60; i++) {
    const an = (i / 60) * TAU - Math.PI / 2;
    const big = i % 5 === 0;
    const r1 = R * 0.86;
    const r0 = R * (big ? 0.73 : 0.8);
    ctx.strokeStyle = `rgba(${rgb},${big ? 0.92 : 0.38})`;
    ctx.lineWidth = big ? R * 0.026 : R * 0.01;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0);
    ctx.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1);
    ctx.stroke();
  }
  for (const [n, k] of [['12', 0], ['3', 3], ['6', 6], ['9', 9]]) {
    const an = (k / 12) * TAU - Math.PI / 2;
    txt(ctx, n, cx + Math.cos(an) * R * 0.58, cy + Math.sin(an) * R * 0.58 + R * 0.075, {
      size: R * 0.2, font: F.num6, color: `rgba(${rgb},0.85)`, align: 'center',
    });
  }
  const hand = (ang, len, w, color, tail = 0) => {
    const an = ang - Math.PI / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(an) * tail, cy - Math.sin(an) * tail);
    ctx.lineTo(cx + Math.cos(an) * len, cy + Math.sin(an) * len);
    ctx.stroke();
  };
  const s = ((sec % 43200) + 43200) % 43200;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  hand(((s / 3600) / 12) * TAU, R * 0.44, R * 0.055, `rgba(${rgb},0.96)`);
  hand(((s / 60) % 60 / 60) * TAU, R * 0.66, R * 0.036, `rgba(${rgb},0.96)`);
  if (ghost != null) hand((((ghost % 60) + 60) % 60 / 60) * TAU, R * 0.8, R * 0.014, `rgba(${ghostRgb},0.5)`, R * 0.12);
  hand((s % 60 / 60) * TAU, R * 0.8, R * 0.016, accent, R * 0.18);
  ctx.restore();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.045, 0, TAU);
  ctx.fill();
  const gl = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.2, cy + R * 0.2);
  gl.addColorStop(0, 'rgba(255,255,255,0.12)');
  gl.addColorStop(0.5, 'rgba(255,255,255,0.02)');
  gl.addColorStop(0.51, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.92, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** speedometer in thousands of km/h, 240 degree sweep */
export function speedo(ctx, cx, cy, R, val, { a = 1, p = 1, max = 16, rgb = G.slowRgb, t = 0 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  const A0 = Math.PI * 0.75;
  const A1 = Math.PI * 2.25;
  const ang = (v) => A0 + (A1 - A0) * clamp(v / max);
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.5);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;
  const bz = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  bz.addColorStop(0, '#5E6572');
  bz.addColorStop(0.5, '#1E2229');
  bz.addColorStop(1, '#3E444F');
  ctx.fillStyle = bz;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fill();
  ctx.restore();
  const fc = ctx.createRadialGradient(cx, cy - R * 0.3, R * 0.1, cx, cy, R * 0.95);
  fc.addColorStop(0, '#162030');
  fc.addColorStop(1, '#05080D');
  ctx.fillStyle = fc;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.93, 0, TAU);
  ctx.fill();
  const sweep = ang(val * q);
  ctx.lineCap = 'butt';
  for (const [w, al] of [[R * 0.16, 0.12], [R * 0.07, 0.35], [R * 0.035, 1]]) {
    ctx.strokeStyle = `rgba(${rgb},${al})`;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.8, A0, sweep);
    ctx.stroke();
  }
  for (let i = 0; i <= max * 4; i++) {
    const v = i / 4;
    const an = ang(v);
    const big = i % 4 === 0;
    const r1 = R * 0.74;
    const r0 = R * (big ? 0.62 : 0.68);
    ctx.strokeStyle = big ? 'rgba(230,238,248,0.9)' : 'rgba(230,238,248,0.35)';
    ctx.lineWidth = big ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0);
    ctx.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1);
    ctx.stroke();
    if (big && v % 2 === 0) {
      txt(ctx, String(v), cx + Math.cos(an) * R * 0.5, cy + Math.sin(an) * R * 0.5 + R * 0.04, {
        size: R * 0.095, font: F.num6, color: 'rgba(230,238,248,0.75)', align: 'center',
      });
    }
  }
  const na = sweep + Math.sin(t * 31) * 0.004;
  ctx.save();
  ctx.shadowColor = `rgba(${rgb},0.8)`;
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = R * 0.022;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - Math.cos(na) * R * 0.1, cy - Math.sin(na) * R * 0.1);
  ctx.lineTo(cx + Math.cos(na) * R * 0.76, cy + Math.sin(na) * R * 0.76);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#2A303A';
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.07, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(${rgb},0.9)`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

/* ================================ for scale ================================ */

/** a football pitch from above, 105 × 68 m, x/y top-left */
export function pitch(ctx, x, y, w, h, { a = 1, p = 1, stripes = 12 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.004) return;
  const sx = w / 105;
  const sy = h / 68;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 2);
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 ? '#1B5130' : '#215E37';
    ctx.fillRect(x + (w * i) / stripes, y, w / stripes + 0.6, h);
  }
  const vg = ctx.createRadialGradient(x + w / 2, y + h / 2, h * 0.2, x + w / 2, y + h / 2, w * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vg;
  ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  grain(ctx, 0.25);
  ctx.restore();
  ctx.strokeStyle = 'rgba(240,246,240,0.85)';
  ctx.lineWidth = Math.max(2, w * 0.0055);
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, 9.15 * sx, 0, TAU);
  ctx.stroke();
  const pw = 40.32 * sy;
  const pd = 16.5 * sx;
  const gw = 18.32 * sy;
  const gd = 5.5 * sx;
  ctx.strokeRect(x, y + h / 2 - pw / 2, pd, pw);
  ctx.strokeRect(x + w - pd, y + h / 2 - pw / 2, pd, pw);
  ctx.strokeRect(x, y + h / 2 - gw / 2, gd, gw);
  ctx.strokeRect(x + w - gd, y + h / 2 - gw / 2, gd, gw);
  const arcA = Math.acos(5.5 / 9.15);
  ctx.beginPath();
  ctx.arc(x + 11 * sx, y + h / 2, 9.15 * sx, -arcA, arcA);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w - 11 * sx, y + h / 2, 9.15 * sx, Math.PI - arcA, Math.PI + arcA);
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,246,240,0.9)';
  for (const px of [x + 11 * sx, x + w - 11 * sx, x + w / 2]) {
    ctx.beginPath();
    ctx.arc(px, y + h / 2, Math.max(2, w * 0.006), 0, TAU);
    ctx.fill();
  }
  ctx.strokeRect(x - 2 * sx, y + h / 2 - 3.66 * sy, 2 * sx, 7.32 * sy);
  ctx.strokeRect(x + w, y + h / 2 - 3.66 * sy, 2 * sx, 7.32 * sy);
  ctx.restore();
}

/* ============================== archive props ============================== */

/**
 * NTS-2 clock offset on chart paper. The measured trace rises 38.2 µs a day
 * (+442.5 parts per trillion) until `days`; after `onDay` the synthesizer is
 * on and the trace stays flat. The dashed line is the prediction (+446.5).
 */
export function driftChart(ctx, x, y, w, h, p, { a = 1, rot = -0.012, days = 0, onDay = 20, pred = 0, t = 0, labels = 1 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return null;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  ctx.translate(x + w / 2, y + h / 2 + (1 - q) * 90);
  ctx.rotate(rot);
  const x0 = -w / 2;
  const y0 = -h / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#ECE4CF';
  ctx.fillRect(x0, y0, w, h);
  ctx.restore();
  ctx.beginPath();
  ctx.rect(x0, y0, w, h);
  grain(ctx, 0.3, 'multiply');
  const gx0 = x0 + 120;
  const gy0 = y0 + 90;
  const gw = w - 170;
  const gh = h - 200;
  const D = 25;
  const U = 1000;
  const X = (d) => gx0 + (d / D) * gw;
  const Y = (u) => gy0 + gh - (u / U) * gh;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 50; i++) {
    ctx.strokeStyle = i % 10 === 0 ? 'rgba(30,120,90,0.42)' : 'rgba(30,120,90,0.16)';
    const xx = gx0 + (gw * i) / 50;
    ctx.beginPath();
    ctx.moveTo(xx, gy0);
    ctx.lineTo(xx, gy0 + gh);
    ctx.stroke();
  }
  for (let j = 0; j <= 40; j++) {
    ctx.strokeStyle = j % 8 === 0 ? 'rgba(30,120,90,0.42)' : 'rgba(30,120,90,0.16)';
    const yy = gy0 + (gh * j) / 40;
    ctx.beginPath();
    ctx.moveTo(gx0, yy);
    ctx.lineTo(gx0 + gw, yy);
    ctx.stroke();
  }
  const ink = 'rgba(32,26,20,0.88)';
  for (let d = 0; d <= D; d += 5) txt(ctx, String(d), X(d), gy0 + gh + 36, { size: 24, font: F.mono6, color: ink, align: 'center' });
  for (let u = 0; u <= U; u += 200) txt(ctx, String(u), gx0 - 16, Y(u) + 8, { size: 22, font: F.mono6, color: ink, align: 'right' });
  txt(ctx, 'HARI PENGUKURAN', gx0 + gw / 2, gy0 + gh + 76, { size: 22, font: F.mono6, color: ink, align: 'center', track: 3 });
  txt(ctx, 'SELISIH JAM (µs)', gx0, gy0 - 30, { size: 22, font: F.mono6, color: ink, track: 3 });
  txt(ctx, 'NTS-2 · 1977', x0 + w - 40, y0 + 52, { size: 24, font: F.mono6, color: 'rgba(160,40,30,0.85)', align: 'right', track: 3 });
  if (pred > 0.001) {
    ctx.save();
    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = 'rgba(190,40,30,0.85)';
    ctx.lineWidth = 3;
    const dEnd = Math.min(onDay, D) * clamp(pred);
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(dEnd), Y(38.58 * dEnd));
    ctx.stroke();
    ctx.restore();
  }
  let pen = null;
  if (days > 0.001) {
    // pen jitter is tied to fixed day samples, so the drawn line never shimmers
    const jit = (i) => {
      const hh = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return (hh - Math.floor(hh) - 0.5) * 3;
    };
    const at = (d) => Y(d <= onDay ? 38.23 * d : 38.23 * onDay);
    ctx.strokeStyle = 'rgba(20,30,70,0.92)';
    ctx.lineWidth = 3.4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const steps = Math.floor(days * 8);
    ctx.moveTo(X(0), at(0) + jit(0));
    for (let i = 1; i <= steps; i++) ctx.lineTo(X(i / 8), at(i / 8) + jit(i));
    const fr = days * 8 - steps;
    const ey = at(days) + lerp(jit(steps), jit(steps + 1), fr);
    ctx.lineTo(X(days), ey);
    const last = [X(days), ey];
    ctx.stroke();
    pen = last;
    ctx.fillStyle = 'rgba(20,30,70,1)';
    ctx.beginPath();
    ctx.arc(last[0], last[1], 6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  return { X, Y, pen };
}

/** a 1970s toggle switch on a brushed plate; `on` 0..1 throws the lever */
export function toggle(ctx, x, y, on, { a = 1, s = 1, label = 'KOREKSI RELATIVITAS', p = 1 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  ctx.translate(x, y + (1 - q) * 60);
  ctx.scale(s, s);
  const w = 420;
  const h = 230;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 14;
  rrPath(ctx, -w / 2, -h / 2, w, h, 18);
  const pg = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  pg.addColorStop(0, '#4A4F57');
  pg.addColorStop(1, '#2A2E34');
  ctx.fillStyle = pg;
  ctx.fill();
  ctx.restore();
  ctx.save();
  rrPath(ctx, -w / 2, -h / 2, w, h, 18);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let yy = -h / 2; yy < h / 2; yy += 3) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, yy);
    ctx.lineTo(w / 2, yy);
    ctx.stroke();
  }
  ctx.restore();
  for (const [sx, sy] of [[-w / 2 + 22, -h / 2 + 22], [w / 2 - 22, -h / 2 + 22], [-w / 2 + 22, h / 2 - 22], [w / 2 - 22, h / 2 - 22]]) {
    ctx.fillStyle = '#7C828C';
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#3A3F46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 5, sy - 2);
    ctx.lineTo(sx + 5, sy + 2);
    ctx.stroke();
  }
  txt(ctx, label, 0, -h / 2 + 46, { size: 21, font: F.mono6, color: 'rgba(235,230,215,0.85)', align: 'center', track: 3 });
  txt(ctx, 'OFF', -110, 62, { size: 26, font: F.mono6, color: on < 0.5 ? '#FF6B5E' : 'rgba(235,230,215,0.4)', align: 'center', track: 2 });
  txt(ctx, 'ON', 110, 62, { size: 26, font: F.mono6, color: on >= 0.5 ? '#5FE3C0' : 'rgba(235,230,215,0.4)', align: 'center', track: 2 });
  const lamp = on >= 0.5 ? '95,227,192' : '255,90,74';
  const lg = ctx.createRadialGradient(0, 64, 0, 0, 64, 40);
  lg.addColorStop(0, `rgba(${lamp},0.9)`);
  lg.addColorStop(1, `rgba(${lamp},0)`);
  ctx.fillStyle = lg;
  ctx.fillRect(-40, 24, 80, 80);
  ctx.fillStyle = `rgb(${lamp})`;
  ctx.beginPath();
  ctx.arc(0, 64, 11, 0, TAU);
  ctx.fill();
  const bg = ctx.createRadialGradient(-6, 6, 4, 0, 10, 46);
  bg.addColorStop(0, '#C9CED6');
  bg.addColorStop(1, '#5E646E');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(0, 10, 40, 0, TAU);
  ctx.fill();
  const la = lerp(-0.72, 0.72, EASE.inOutQuad(clamp(on)));
  ctx.save();
  ctx.translate(0, 10);
  ctx.rotate(la);
  const lv = ctx.createLinearGradient(-10, 0, 10, 0);
  lv.addColorStop(0, '#8A9099');
  lv.addColorStop(0.5, '#F2F4F7');
  lv.addColorStop(1, '#7A808A');
  ctx.fillStyle = lv;
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(-7, -92);
  ctx.lineTo(7, -92);
  ctx.lineTo(9, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -94, 13, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** rack frequency counter: seven-segment digits, digits from `hiFrom` lit amber */
export function freqPanel(ctx, cx, cy, value, { a = 1, p = 1, hiFrom = 99, label = 'FREKUENSI JAM ATOM', unit = 'MHz', h = 88, hiColor = G.fast, color = '#E8F0F8' } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  const dw = h * 0.55 + h * 0.16;
  let tw = 0;
  for (const ch of value) tw += ch === ',' || ch === '.' ? h * 0.34 : dw;
  const uw = measure(ctx, unit, h * 0.42, F.mono6, 2) + 30;
  const w = tw + uw + 120;
  const ph = h + 190;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  ctx.translate(cx, cy + (1 - q) * 50);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;
  rrPath(ctx, -w / 2, -ph / 2, w, ph, 22);
  const bz = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
  bz.addColorStop(0, '#3A3F48');
  bz.addColorStop(1, '#1C1F25');
  ctx.fillStyle = bz;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(230,236,245,0.25)';
  ctx.lineWidth = 2;
  rrPath(ctx, -w / 2 + 1, -ph / 2 + 1, w - 2, ph - 2, 21);
  ctx.stroke();
  const wx = -w / 2 + 34;
  const wy = -h / 2 - 6;
  rrPath(ctx, wx, wy - 22, w - 68, h + 56, 10);
  ctx.fillStyle = '#05070A';
  ctx.fill();
  txt(ctx, label, -w / 2 + 40, -ph / 2 + 44, { size: 22, font: F.mono6, color: 'rgba(214,230,248,0.7)', track: 4 });
  let x = wx + 26;
  let i = 0;
  for (const ch of value) {
    const col = i >= hiFrom ? hiColor : color;
    if (ch === ',' || ch === '.') {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x + h * 0.1, wy + h * 0.92, h * 0.07, 0, TAU);
      ctx.fill();
      x += h * 0.34;
    } else {
      seg7(ctx, ch, x, wy, h, col, { glowBlur: 16 });
      x += dw;
    }
    i++;
  }
  txt(ctx, unit, x + 16, wy + h * 0.95, { size: h * 0.42, font: F.mono6, color: 'rgba(214,230,248,0.75)', track: 2 });
  ctx.restore();
}

/* ================================== orbits ================================= */

export function orbitPt(cx, cy, rx, ry, rot, th) {
  const x = Math.cos(th) * rx;
  const y = Math.sin(th) * ry;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return { x: cx + x * c - y * s, y: cy + x * s + y * c, back: Math.sin(th) < 0 };
}

/** an orbit ellipse; half 'back' (behind the planet), 'front' or 'all' */
export function orbitRing(ctx, cx, cy, rx, ry, rot, { a = 1, half = 'all', rgb = '168,206,248', lw = 2, dash = null, glow = 0 } = {}) {
  if (a <= 0.004) return;
  const [t0, t1] = half === 'back' ? [Math.PI, TAU] : half === 'front' ? [0, Math.PI] : [0, TAU];
  ctx.save();
  if (dash) ctx.setLineDash(dash);
  const passes = glow > 0 ? [[lw * 5, 0.08 * glow], [lw * 2.2, 0.2 * glow], [lw, 1]] : [[lw, 1]];
  for (const [w, k] of passes) {
    ctx.strokeStyle = `rgba(${rgb},${a * k})`;
    ctx.lineWidth = w;
    ctx.beginPath();
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const p = orbitPt(cx, cy, rx, ry, rot, lerp(t0, t1, i / n));
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/* ================================ backdrops ================================ */

/** dark engineering board: navy falloff, fine grid, a few construction marks */
export function blueprint(ctx, t, cam = {}, { a = 1, cx = 720, cy = 1000 } = {}) {
  if (a <= 0.004) return;
  const plate = bake('gps:blueprint', W + 160, H + 160, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h * 0.4, 60, w / 2, h * 0.42, h * 0.75);
    g.addColorStop(0, '#13203A');
    g.addColorStop(0.5, '#0A1222');
    g.addColorStop(1, '#04070D');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.lineWidth = 1;
    for (let gx = 0; gx <= w; gx += 40) {
      x.strokeStyle = gx % 200 === 0 ? 'rgba(130,175,240,0.11)' : 'rgba(130,175,240,0.045)';
      x.beginPath();
      x.moveTo(gx + 0.5, 0);
      x.lineTo(gx + 0.5, h);
      x.stroke();
    }
    for (let gy = 0; gy <= h; gy += 40) {
      x.strokeStyle = gy % 200 === 0 ? 'rgba(130,175,240,0.11)' : 'rgba(130,175,240,0.045)';
      x.beginPath();
      x.moveTo(0, gy + 0.5);
      x.lineTo(w, gy + 0.5);
      x.stroke();
    }
    const img = x.getImageData(0, 0, w, h);
    const d = img.data;
    const r = rng(26);
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * 9;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
    x.putImageData(img, 0, 0);
  });
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.drawImage(plate, -80 + (cam.dx || 0) * 0.35, -80 + (cam.dy || 0) * 0.35);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 900);
  g.addColorStop(0, 'rgba(90,140,230,0.10)');
  g.addColorStop(1, 'rgba(90,140,230,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** rocket exhaust: a white-hot core in an orange plume, flickering */
export function flame(ctx, x, y, len, w, t, { a = 1 } = {}) {
  if (a <= 0.004 || len <= 1) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fl = 1 + 0.08 * Math.sin(t * 61) + 0.05 * Math.sin(t * 97);
  const L = len * fl;
  for (const [k, col, al] of [[1.0, '255,120,40', 0.5], [0.7, '255,190,90', 0.7], [0.4, '255,245,220', 0.95]]) {
    const g = ctx.createLinearGradient(x, y, x, y + L * k);
    g.addColorStop(0, `rgba(${col},${al * a})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.5 * k, y);
    ctx.quadraticCurveTo(x - w * 0.7 * k, y + L * k * 0.4, x, y + L * k);
    ctx.quadraticCurveTo(x + w * 0.7 * k, y + L * k * 0.4, x + w * 0.5 * k, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
