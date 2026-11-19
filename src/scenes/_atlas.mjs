// The atlas kit (episode 29).
//
// Printed atlas sheets dealt onto a dark chart table: warm ivory map paper
// (fibre, foxing, fold creases), engraved cartography from the real Natural
// Earth coastline (world-atlas), sea-green water with waterlining, sepia
// ink, a vermilion accent for Indonesia, letterspaced serif and typewriter
// labels. Nothing is an image.
//
//   world        Natural Earth 1:50m countries, coast and border meshes
//   PROJ         Mercator, Equal Earth, plate carree; view/px/viewKeys
//   printMap     a map region engraved once (waterlines, hatch, borders,
//                lettering) and moved under the camera like a printed sheet;
//                drawPrints crossfades levels of detail during zooms
//   mover        true-size rotation on the sphere that carries a shape to a
//                new place; movedPath draws it through any view
//   live         1:110m land for maps whose projection changes every frame
//                (globe, gores, Mercator stretch, Equal Earth morph)
//   cutout       a moved country as a paper cut-out with a lifted shadow
//   card         the sheet: placement in the stack, deal, paper, folds
//   heading, label, tag, pin, marker, dimLine, stamp, hemicycle, rose ...
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { createCanvas, Path2D } from '@napi-rs/canvas';
import { feature, mesh } from 'topojson-client';
import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, rng, TAU, EASE } from '../engine/anim.mjs';
import { cue, cueEnd, P, eo, e3, io, ioq, sm, keys, bake, fbm, drawOn, textW, numCells, idNum, rgba } from './_cyano.mjs';

export { cue, cueEnd, P, eo, e3, io, ioq, sm, keys, bake, drawOn, textW, numCells, idNum, rgba, F, W, H, clamp, lerp, rng, TAU, EASE, Path2D };

const require = createRequire(import.meta.url);
export const D = Math.PI / 180;
export const R_KM = 6371.0088;

export const AT = {
  desk: '#111416',
  paper: '#EFE7D4',
  ocean: '#C5D7D2',
  oceanLine: '#7C9C98',
  land: '#F4EDDD',
  ink: '#2A241E',
  ink2: 'rgba(42,36,30,0.70)',
  ink3: 'rgba(42,36,30,0.42)',
  verm: '#D0412A',
  vermDeep: '#9F2C19',
  ochre: '#C8963A',
  blue: '#2E5B7B',
  green: '#3F7A5A',
  grey: '#9A9184',
};

/* -------------------------------- layout --------------------------------- */

export const CARD = { x: 40, y: 164, w: 1360, h: 1626 };
export const IN = { x: CARD.x + 30, y: CARD.y + 30, w: CARD.w - 60, h: CARD.h - 60 };
export const MAPR = { x: IN.x, y: 548, w: IN.w, h: IN.y + IN.h - 548 };

/* ------------------------------- geo core -------------------------------- */

let WORLD = null;
const SKIP = new Set(['Antarctica', 'Fr. S. Antarctic Lands']);

const bboxOf = (pts) => {
  let x0 = 999;
  let y0 = 999;
  let x1 = -999;
  let y1 = -999;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
};

/** rings that cross the antimeridian (Russia, Fiji) split into pieces that
 *  each stay inside [-180, 180], so fills never get a chord across the map */
export function splitWrap(ring) {
  let jump = false;
  for (let i = 1; i < ring.length; i++) if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) jump = true;
  if (!jump) return [ring];
  const u = [[ring[0][0], ring[0][1]]];
  for (let i = 1; i < ring.length; i++) {
    let d = ring[i][0] - ring[i - 1][0];
    if (d > 180) d -= 360;
    else if (d < -180) d += 360;
    u.push([u[i - 1][0] + d, ring[i][1]]);
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const [x] of u) {
    lo = Math.min(lo, x);
    hi = Math.max(hi, x);
  }
  const out = [];
  for (let k = Math.floor((lo + 180) / 360); k <= Math.floor((hi + 180) / 360); k++) {
    const c = clipBand(u, k * 360 - 180, k * 360 + 180);
    if (c) out.push(c.map(([x, y]) => [x - k * 360, y]));
  }
  return out;
}

export function world() {
  if (WORLD) return WORLD;
  const topo = JSON.parse(fs.readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));
  const fc = feature(topo, topo.objects.countries);
  const countries = fc.features.map((f) => ({
    name: f.properties.name,
    polys: f.geometry ? (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) : [],
  }));
  const rings = [];
  for (const c of countries) {
    c.polys = c.polys.flatMap((poly) => {
      const parts = splitWrap(poly[0]);
      if (parts.length === 1) return [poly];
      return parts.map((r) => [r]);
    });
    if (SKIP.has(c.name)) continue;
    for (const poly of c.polys) for (const r of poly) rings.push({ pts: r, bb: bboxOf(r) });
  }
  const lines = (arr) => arr.map((l) => ({ pts: l, bb: bboxOf(l) }));
  const coast = lines(mesh(topo, topo.objects.countries, (a, b) => a === b).coordinates).filter((l) => l.bb[3] > -60);
  const borders = lines(mesh(topo, topo.objects.countries, (a, b) => a !== b).coordinates);
  WORLD = { countries, rings, coast, borders, byName: new Map(countries.map((c) => [c.name, c])) };
  return WORLD;
}

export const country = (name) => world().byName.get(name);

const EE = { A1: 1.340264, A2: -0.081106, A3: 0.000893, A4: 0.003796, M: Math.sqrt(3) / 2 };
export const MERC_CLAMP = 84;

export const PROJ = {
  merc: (lon, lat) => {
    const p = clamp(lat, -MERC_CLAMP, MERC_CLAMP) * D;
    return [lon * D, Math.log(Math.tan(Math.PI / 4 + p / 2))];
  },
  // Equal Earth at its own (equal-area) scale: area factor 1, like Mercator
  // at the equator, so sizes compare fairly between the two
  eqe: (lon, lat) => {
    const th = Math.asin(EE.M * Math.sin(lat * D));
    const t2 = th * th;
    const t6 = t2 * t2 * t2;
    const x = (lon * D * Math.cos(th)) / (EE.M * (EE.A1 + 3 * EE.A2 * t2 + t6 * (7 * EE.A3 + 9 * EE.A4 * t2)));
    const y = th * (EE.A1 + EE.A2 * t2 + t6 * (EE.A3 + EE.A4 * t2));
    return [x, y];
  },
  plate: (lon, lat) => [lon * D, lat * D],
};
export const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + clamp(lat, -MERC_CLAMP, MERC_CLAMP) * D / 2));
export const areaK = (lat) => 1 / Math.cos(lat * D) ** 2;

/* -------------------------------- views ---------------------------------- */

/** a camera on a projection: centre lon/lat at screen (ox, oy), s px/unit */
export function view(name, lon, lat, s, ox = MAPR.x + MAPR.w / 2, oy = MAPR.y + MAPR.h / 2, f = null) {
  const fn = f || PROJ[name];
  const [u0, v0] = fn(lon, lat);
  return { name, f: fn, lon, lat, s, ox, oy, u0, v0 };
}
export function px(V, lon, lat) {
  const [u, v] = V.f(lon, lat);
  return [V.ox + (u - V.u0) * V.s, V.oy - (v - V.v0) * V.s];
}
/** keyed camera: [[t, lon, lat, s], ...] eased, scale interpolated in log */
export function viewKeys(t, list, name = 'merc', ox, oy, e = io) {
  const mk = (a, b, p) => view(name, lerp(a[1], b[1], p), lerp(a[2], b[2], p), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), p)), ox, oy);
  if (t <= list[0][0]) return mk(list[0], list[0], 0);
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];
    if (t <= b[0]) return mk(a, b, e(clamp((t - a[0]) / Math.max(0.001, b[0] - a[0]))));
  }
  const l = list[list.length - 1];
  return mk(l, l, 0);
}

/* ------------------------------ path build ------------------------------- */

/** screen-space path of rings/lines through V, culled to box [x0,y0,x1,y1] */
function screenPath(list, V, box, close) {
  const p = new Path2D();
  const merc = V.name === 'merc';
  for (const it of list) {
    if (merc && box) {
      const [a0, b0] = px(V, it.bb[0], it.bb[3]);
      const [a1, b1] = px(V, it.bb[2], it.bb[1]);
      if (a1 < box[0] || a0 > box[2] || b1 < box[1] || b0 > box[3]) continue;
    }
    const pts = it.pts;
    let pl = null;
    for (let i = 0; i < pts.length; i++) {
      const lon = pts[i][0];
      const [x, y] = px(V, lon, pts[i][1]);
      if (pl === null || Math.abs(lon - pl) > 180) p.moveTo(x, y);
      else p.lineTo(x, y);
      pl = lon;
    }
    if (close) p.closePath();
  }
  return p;
}

const ringsOfNames = (names) => {
  const out = [];
  for (const n of Array.isArray(names) ? names : [names]) {
    const c = country(n);
    if (!c) continue;
    for (const poly of c.polys) for (const r of poly) out.push({ pts: r, bb: bboxOf(r) });
  }
  return out;
};

/** screen path of named countries (optional ring filter on lon/lat bbox) */
export function countryPath(names, V, { keep = null } = {}) {
  let rs = ringsOfNames(names);
  if (keep) rs = rs.filter((r) => keep(r.bb));
  return screenPath(rs, V, null, true);
}

/* ------------------------------ map prints ------------------------------- */

let HATCH = null;
/** the engraved tooth of the land: a fine diagonal hatch, clipped to `path` */
export function hatchFill(ctx, path, { a = 1 } = {}) {
  const [x0, y0, x1, y1] = path.computeTightBounds();
  ctx.save();
  ctx.clip(path, 'evenodd');
  ctx.globalAlpha *= a;
  ctx.fillStyle = ctx.createPattern(hatchTile(), 'repeat');
  ctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  ctx.restore();
}
function hatchTile() {
  if (HATCH) return HATCH;
  HATCH = createCanvas(256, 256);
  const c = HATCH.getContext('2d');
  const R = rng(77);
  c.strokeStyle = 'rgba(70,56,40,1)';
  c.lineCap = 'butt';
  for (let k = -256; k < 512; k += 6) {
    c.globalAlpha = 0.07 + R() * 0.05;
    c.lineWidth = 0.9 + R() * 0.4;
    c.beginPath();
    c.moveTo(k, 0);
    c.lineTo(k - 256, 256);
    c.stroke();
  }
  return HATCH;
}

const PRINTS = new Map();

/** engrave a Mercator map region once at view V; returns a print that
 *  drawPrints() moves under any later camera on the same projection */
export function printMap(key, V, o = {}) {
  let pr = PRINTS.get(key);
  if (pr) return pr;
  const rect = o.rect || MAPR;
  const m = o.margin ?? 120;
  const x0 = rect.x - m;
  const y0 = rect.y - m;
  const cw = Math.ceil(rect.w + 2 * m);
  const ch = Math.ceil(rect.h + 2 * m);
  const cv = createCanvas(cw, ch);
  const c = cv.getContext('2d');
  c.translate(-x0, -y0);
  const box = [x0 - 60, y0 - 60, x0 + cw + 60, y0 + ch + 60];
  const Wd = world();
  const land = screenPath(Wd.rings, V, box, true);
  const coast = screenPath(Wd.coast, V, box, false);
  const borders = screenPath(Wd.borders, V, box, false);
  c.fillStyle = o.ocean || AT.ocean;
  c.fillRect(x0, y0, cw, ch);
  c.lineJoin = 'round';
  c.lineCap = 'round';
  const wl = o.waterlines ?? 3;
  const gap = o.gap ?? 7;
  for (let i = wl; i >= 1; i--) {
    c.strokeStyle = rgba(AT.oceanLine, 0.55 * (1 - (i - 1) / (wl + 0.8)));
    c.lineWidth = 2 * i * gap;
    c.stroke(coast);
    c.strokeStyle = o.ocean || AT.ocean;
    c.lineWidth = 2 * i * gap - 2.2;
    c.stroke(coast);
  }
  if (o.graticule) graticule(c, V, { ...o.graticule, rect: { x: x0, y: y0, w: cw, h: ch } });
  c.fillStyle = o.land || AT.land;
  c.fill(land, 'evenodd');
  for (const [names, col] of o.fills || []) {
    c.fillStyle = col;
    c.fill(countryPath(names, V), 'evenodd');
  }
  c.save();
  c.clip(land, 'evenodd');
  c.fillStyle = c.createPattern(hatchTile(), 'repeat');
  c.globalAlpha = o.hatchA ?? 1;
  c.fillRect(x0, y0, cw, ch);
  c.restore();
  if (o.borders !== false) {
    c.strokeStyle = AT.ink3;
    c.lineWidth = o.borderW ?? 1.3;
    c.setLineDash([5, 3.5]);
    c.stroke(borders);
    c.setLineDash([]);
  }
  c.strokeStyle = AT.ink;
  c.globalAlpha = 0.88;
  c.lineWidth = o.coastW ?? 1.7;
  c.stroke(coast);
  c.globalAlpha = 1;
  if (o.letter) o.letter(c, V);
  pr = { cv, V, x0, y0, cw, ch };
  PRINTS.set(key, pr);
  return pr;
}

/** a transparent layer over rect, drawn once by fn in screen coordinates */
export function makeLayer(rect, fn) {
  const cv = createCanvas(Math.ceil(rect.w), Math.ceil(rect.h));
  const c = cv.getContext('2d');
  c.translate(-rect.x, -rect.y);
  fn(c);
  return { cv, x: rect.x, y: rect.y };
}

/** draw a print under camera V2 (same projection), clipped to rect */
export function drawPrint(ctx, V2, pr, { a = 1 } = {}) {
  if (a <= 0.001) return;
  const k = V2.s / pr.V.s;
  const u = pr.V.u0 + (pr.x0 - pr.V.ox) / pr.V.s;
  const v = pr.V.v0 - (pr.y0 - pr.V.oy) / pr.V.s;
  const X = V2.ox + (u - V2.u0) * V2.s;
  const Y = V2.oy - (v - V2.v0) * V2.s;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = k < 0.8 ? 'high' : 'low';
  ctx.drawImage(pr.cv, X, Y, pr.cw * k, pr.ch * k);
  ctx.restore();
}

/** levels of detail: prints sorted by scale; the camera's scale picks the
 *  pair it falls between and crossfades in log scale */
export function drawPrints(ctx, V2, prints, rect = MAPR) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.fillStyle = AT.ocean;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const L = Math.log(V2.s);
  const ls = prints.map((p) => Math.log(p.V.s));
  if (L <= ls[0] || prints.length === 1) drawPrint(ctx, V2, prints[0]);
  else if (L >= ls[ls.length - 1]) drawPrint(ctx, V2, prints[prints.length - 1]);
  else {
    for (let i = 0; i < prints.length - 1; i++) {
      if (L >= ls[i] && L <= ls[i + 1]) {
        const w = EASE.smooth(clamp((L - ls[i]) / (ls[i + 1] - ls[i])));
        drawPrint(ctx, V2, prints[i]);
        drawPrint(ctx, V2, prints[i + 1], { a: w });
        break;
      }
    }
  }
  ctx.restore();
}

/** graticule every `step` degrees through V */
export function graticule(ctx, V, { step = 15, a = 0.3, lat0 = -80, lat1 = 84, lon0 = -180, lon1 = 180, color = AT.ink, lw = 1.1, equator = true, eqColor = AT.ink } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.globalAlpha *= a;
  ctx.beginPath();
  for (let lat = Math.ceil(lat0 / step) * step; lat <= lat1; lat += step) {
    if (lat === 0 && equator) continue;
    for (let lon = lon0; lon <= lon1; lon += 2) {
      const [x, y] = px(V, lon, lat);
      if (lon === lon0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }
  for (let lon = Math.ceil(lon0 / step) * step; lon <= lon1; lon += step) {
    for (let lat = lat0; lat <= lat1; lat += 1) {
      const [x, y] = px(V, lon, lat);
      if (lat === lat0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  ctx.restore();
  if (equator) {
    ctx.save();
    ctx.strokeStyle = eqColor;
    ctx.globalAlpha *= Math.min(1, a * 2.4);
    ctx.lineWidth = lw * 1.9;
    ctx.beginPath();
    for (let lon = lon0; lon <= lon1; lon += 2) {
      const [x, y] = px(V, lon, 0);
      if (lon === lon0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/** engraved lettering for seas and countries (printed into the map) */
export function seaName(ctx, s, x, y, { size = 26, a = 0.7, track = 9, rot = 0, color = '#3F625E' } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= a;
  ctx.font = `${size}px ${F.italic}`;
  ctx.letterSpacing = `${track}px`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(s, 0, 0);
  ctx.restore();
}
export function landName(ctx, s, x, y, { size = 22, a = 0.72, track = 7, color = AT.ink, font = F.serif5 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(s, x, y);
  ctx.restore();
}

/* ------------------------------ true size -------------------------------- */

const vec = (lon, lat) => [Math.cos(lat * D) * Math.cos(lon * D), Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D)];
const ll = (v) => [Math.atan2(v[1], v[0]) / D, Math.asin(clamp(v[2], -1, 1)) / D];

/** rotation on the sphere carrying reference point C0 to T: a turn about the
 *  pole (longitude), then a tilt along T's meridian. Shapes keep their true
 *  size and stay upright at the reference point. */
export function mover(C0, T) {
  const dl = T[0] - C0[0];
  const th = -(T[1] - C0[1]) * D;
  const k = [-Math.sin(T[0] * D), Math.cos(T[0] * D), 0];
  const c = Math.cos(th);
  const s = Math.sin(th);
  return (lon, lat) => {
    const v = vec(lon + dl, lat);
    const d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
    const cr = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
    return ll([v[0] * c + cr[0] * s + k[0] * d * (1 - c), v[1] * c + cr[1] * s + k[1] * d * (1 - c), v[2] * c + cr[2] * s + k[2] * d * (1 - c)]);
  };
}

/** outer rings of countries (holes dropped), with an optional bbox filter */
export function shapeRings(names, { keep = null, minPts = 0 } = {}) {
  const out = [];
  for (const n of Array.isArray(names) ? names : [names]) {
    const c = country(n);
    if (!c) continue;
    for (const poly of c.polys) {
      const r = poly[0];
      if (r.length < minPts) continue;
      if (keep && !keep(bboxOf(r))) continue;
      out.push(r);
    }
  }
  return out;
}

/** screen path of rings carried by a mover, through view V */
export function movedPath(rings, mv, V) {
  const p = new Path2D();
  for (const ring of rings) {
    let pl = null;
    for (let i = 0; i < ring.length; i++) {
      const [lo, la] = mv(ring[i][0], ring[i][1]);
      const [x, y] = px(V, lo, la);
      if (pl === null || Math.abs(lo - pl) > 180) p.moveTo(x, y);
      else p.lineTo(x, y);
      pl = lo;
    }
    p.closePath();
  }
  return p;
}

/** great-circle points between two lon/lat points through V */
export function arcPts(V, a, b, n = 64) {
  const va = vec(a[0], a[1]);
  const vb = vec(b[0], b[1]);
  const om = Math.acos(clamp(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2], -1, 1));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s0 = Math.sin((1 - t) * om) / Math.sin(om);
    const s1 = Math.sin(t * om) / Math.sin(om);
    const [lo, la] = ll([va[0] * s0 + vb[0] * s1, va[1] * s0 + vb[1] * s1, va[2] * s0 + vb[2] * s1]);
    out.push(px(V, lo, la));
  }
  return out;
}
export const gcKm = (a, b) => {
  const va = vec(a[0], a[1]);
  const vb = vec(b[0], b[1]);
  return Math.acos(clamp(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2], -1, 1)) * R_KM;
};

/** a ground square of `km` x `km` centred at (lon, lat), as screen points */
export function groundSquare(V, lon, lat, km) {
  const dLat = (km / 2 / R_KM) / D;
  const dLon = (km / 2 / (R_KM * Math.cos(lat * D))) / D;
  return [px(V, lon - dLon, lat + dLat), px(V, lon + dLon, lat + dLat), px(V, lon + dLon, lat - dLat), px(V, lon - dLon, lat - dLat)];
}

/* ------------------------------ live maps -------------------------------- */

let LIVE = null;
/** 1:110m land as rings (for maps reprojected every frame) */
export function live() {
  if (LIVE) return LIVE;
  const topo = JSON.parse(fs.readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'));
  const fc = feature(topo, topo.objects.land);
  const rings = [];
  for (const f of fc.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) {
      for (const r of splitWrap(poly[0])) {
        if (bboxOf(r)[3] < -60) continue;
        rings.push(r);
      }
    }
  }
  LIVE = { rings, gores: new Map() };
  return LIVE;
}

/** densify a ring so long edges bend correctly under curved projections */
function densify(ring, maxDeg = 2) {
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    out.push(a);
    if (i === ring.length - 1) break;
    const d = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    if (d > maxDeg && d < 180) {
      const n = Math.ceil(d / maxDeg);
      for (let k = 1; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
    }
  }
  return out;
}

/** clip a ring to the longitude band [l0, l1] (Sutherland-Hodgman) */
function clipBand(ring, l0, l1) {
  const clip = (pts, inside, cut) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      const pi = inside(p);
      const qi = inside(q);
      if (pi) out.push(p);
      if (pi !== qi) out.push(cut(p, q));
    }
    return out;
  };
  const at = (L) => (p, q) => {
    const t = (L - p[0]) / (q[0] - p[0]);
    return [L, p[1] + t * (q[1] - p[1])];
  };
  let r = clip(ring, (p) => p[0] >= l0, at(l0));
  if (r.length < 3) return null;
  r = clip(r, (p) => p[0] <= l1, at(l1));
  return r.length < 3 ? null : r;
}

/** 12 globe gores: land clipped into 30-degree bands, densified once */
export function gores(n = 12) {
  const L = live();
  let g = L.gores.get(n);
  if (g) return g;
  const w = 360 / n;
  g = [];
  for (let i = 0; i < n; i++) {
    const l0 = -180 + i * w;
    const l1 = l0 + w;
    const parts = [];
    for (const r of L.rings) {
      const bb = bboxOf(r);
      if (bb[2] < l0 || bb[0] > l1) continue;
      const c = clipBand(densify(r, 1.5), l0, l1);
      if (c) parts.push(c);
    }
    g.push({ l0, l1, lc: (l0 + l1) / 2, parts });
  }
  L.gores.set(n, g);
  return g;
}

/** path of rings through an arbitrary (lon, lat) -> [x, y] screen function */
export function livePath(rings, f) {
  const p = new Path2D();
  for (const ring of rings) {
    let pl = null;
    for (let i = 0; i < ring.length; i++) {
      const lon = ring[i][0];
      const [x, y] = f(lon, ring[i][1]);
      if (pl === null || Math.abs(lon - pl) > 180) p.moveTo(x, y);
      else p.lineTo(x, y);
      pl = lon;
    }
    p.closePath();
  }
  return p;
}

/** an orthographic globe: land clamped to the limb on the far side */
export function globePath(rings, cx, cy, r, lon0, lat0) {
  const p = new Path2D();
  const sp = Math.sin(lat0 * D);
  const cp = Math.cos(lat0 * D);
  for (const ring of rings) {
    let started = false;
    let anyFront = false;
    const pts = [];
    for (let i = 0; i < ring.length; i++) {
      const l = (ring[i][0] - lon0) * D;
      const f = ring[i][1] * D;
      const cf = Math.cos(f);
      const x = cf * Math.sin(l);
      const y = cp * Math.sin(f) - sp * cf * Math.cos(l);
      const z = sp * Math.sin(f) + cp * cf * Math.cos(l);
      if (z > 0) anyFront = true;
      if (z <= 0) {
        const n = Math.hypot(x, y) || 1;
        pts.push([cx + (x / n) * r, cy - (y / n) * r]);
      } else pts.push([cx + x * r, cy - y * r]);
    }
    if (!anyFront) continue;
    for (const [x, y] of pts) {
      if (!started) {
        p.moveTo(x, y);
        started = true;
      } else p.lineTo(x, y);
    }
    p.closePath();
  }
  return p;
}

/* ------------------------------- cut-outs -------------------------------- */

let GRAIN = null;
function grainTile() {
  if (GRAIN) return GRAIN;
  GRAIN = createCanvas(256, 256);
  const c = GRAIN.getContext('2d');
  const id = c.createImageData(256, 256);
  let s = 9127;
  for (let i = 0; i < id.data.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const g = (s >>> 24) / 255;
    const dark = g < 0.5;
    id.data[i] = dark ? 60 : 255;
    id.data[i + 1] = dark ? 18 : 236;
    id.data[i + 2] = dark ? 6 : 220;
    id.data[i + 3] = Math.abs(g - 0.5) * 70;
  }
  c.putImageData(id, 0, 0);
  return GRAIN;
}

/** a cut-out of coloured paper in the shape of `path` (screen space), lifted
 *  by `lift` (0 lying flat .. 1 held above the sheet, wide soft shadow) */
export function cutout(ctx, path, { fill = AT.verm, lift = 0, a = 1, edge = true, shadow = true } = {}) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (shadow) {
    const dx = 3 + 16 * lift;
    const dy = 5 + 26 * lift;
    ctx.save();
    ctx.translate(dx, dy);
    ctx.fillStyle = `rgba(28,18,10,${0.16 - 0.05 * lift})`;
    ctx.fill(path, 'evenodd');
    ctx.translate(-dx * 0.45, -dy * 0.45);
    ctx.fillStyle = `rgba(28,18,10,${0.16 - 0.04 * lift})`;
    ctx.fill(path, 'evenodd');
    ctx.restore();
  }
  ctx.fillStyle = fill;
  ctx.fill(path, 'evenodd');
  const [bx0, by0, bx1, by1] = path.computeTightBounds();
  ctx.save();
  ctx.clip(path, 'evenodd');
  ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
  ctx.fillRect(bx0 - 2, by0 - 2, bx1 - bx0 + 4, by1 - by0 + 4);
  ctx.restore();
  if (edge) {
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(80,20,8,0.6)';
    ctx.lineWidth = 1.1;
    ctx.stroke(path);
  }
  ctx.restore();
}

/** an outline drawn as a dashed ink line (a ghost of the true size) */
export function ghost(ctx, path, { color = AT.ink, a = 1, lw = 2.4, dash = [9, 6], fill = null } = {}) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill(path, 'evenodd');
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.stroke(path);
  ctx.restore();
}

/* ------------------------------- the desk -------------------------------- */

function bakeDesk() {
  return bake('atlas:desk', W, H, (c) => {
    const sw = 90;
    const sh = 160;
    const small = createCanvas(sw, sh);
    const sc = small.getContext('2d');
    const img = sc.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const n = fbm(x / 18, y / 18, 5, 4) - 0.5;
        const o = (y * sw + x) * 4;
        img.data[o] = 18 + n * 18;
        img.data[o + 1] = 22 + n * 19;
        img.data[o + 2] = 24 + n * 20;
        img.data[o + 3] = 255;
      }
    }
    sc.putImageData(img, 0, 0);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(small, 0, 0, W, H);
    const R = rng(31);
    for (let i = 0; i < 80; i++) {
      c.strokeStyle = `rgba(200,210,215,${0.012 + R() * 0.022})`;
      c.lineWidth = 0.8 + R() * 1.4;
      const x = R() * W;
      const y = R() * H;
      const a = (R() - 0.5) * 0.5;
      const l = 80 + R() * 380;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5 + (R() - 0.5) * 20, x + Math.cos(a) * l, y + Math.sin(a) * l);
      c.stroke();
    }
    const id = c.getImageData(0, 0, W, H);
    let s = 1301;
    for (let i = 0; i < id.data.length; i += 4) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const g = ((s >>> 24) - 128) / 128;
      id.data[i] = clamp(id.data[i] + g * 5, 0, 255);
      id.data[i + 1] = clamp(id.data[i + 1] + g * 5, 0, 255);
      id.data[i + 2] = clamp(id.data[i + 2] + g * 5, 0, 255);
    }
    c.putImageData(id, 0, 0);
    const gl = c.createRadialGradient(W * 0.32, H * 0.2, 60, W * 0.42, H * 0.38, H * 0.92);
    gl.addColorStop(0, 'rgba(255,236,205,0.07)');
    gl.addColorStop(1, 'rgba(0,0,0,0.3)');
    c.fillStyle = gl;
    c.fillRect(0, 0, W, H);
  });
}

export function desk(ctx) {
  ctx.drawImage(bakeDesk(), 0, 0);
}

/* ------------------------------- the card -------------------------------- */

// every sheet lands a little differently, so the stack has real edges
const PLACE = [
  [0, 0, -0.30],
  [-7, 6, 0.42],
  [8, -5, -0.55],
  [-5, 8, 0.28],
  [6, -6, -0.40],
  [-8, 4, 0.50],
  [5, -7, -0.22],
  [-3, 5, 0.36],
];
export const place = (i) => {
  const [dx, dy, deg] = PLACE[i % PLACE.length];
  return { dx, dy, rot: deg * D };
};

function cardXf(ctx, i) {
  const { dx, dy, rot } = place(i);
  const cx = CARD.x + CARD.w / 2;
  const cy = CARD.y + CARD.h / 2;
  ctx.translate(cx + dx, cy + dy);
  ctx.rotate(rot);
  ctx.translate(-cx, -cy);
}

function bakeCard() {
  return bake('atlas:card', CARD.w, CARD.h, (c) => {
    const w = CARD.w;
    const h = CARD.h;
    const sw = 80;
    const sh = 96;
    const small = createCanvas(sw, sh);
    const sc = small.getContext('2d');
    const img = sc.createImageData(sw, sh);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const n = fbm(x / 14, y / 14, 12, 4) - 0.5;
        const o = (y * sw + x) * 4;
        img.data[o] = 239 + n * 14;
        img.data[o + 1] = 231 + n * 14;
        img.data[o + 2] = 212 + n * 16;
        img.data[o + 3] = 255;
      }
    }
    sc.putImageData(img, 0, 0);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(small, 0, 0, w, h);
  });
}

/** the multiply layer over the printed card: fibre, foxing, folds, worn edge */
function bakeCardOver() {
  return bake('atlas:cardOver', CARD.w, CARD.h, (c) => {
    const w = CARD.w;
    const h = CARD.h;
    c.fillStyle = '#FFFFFF';
    c.fillRect(0, 0, w, h);
    const R = rng(808);
    for (let i = 0; i < 9000; i++) {
      const x = R() * w;
      const y = R() * h;
      const l = 4 + R() * R() * 30;
      const a0 = R() * TAU;
      c.strokeStyle = `rgba(150,128,96,${0.05 + R() * 0.08})`;
      c.lineWidth = 0.6 + R() * 0.8;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + Math.cos(a0 + 1) * l * 0.3, y + Math.sin(a0 + 1) * l * 0.3, x + Math.cos(a0) * l, y + Math.sin(a0) * l);
      c.stroke();
    }
    for (let i = 0; i < 34; i++) {
      const x = R() * w;
      const y = R() * h;
      const r = 3 + R() * R() * 22;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(176,120,64,${0.08 + R() * 0.12})`);
      g.addColorStop(1, 'rgba(176,120,64,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fill();
    }
    const fold = (x0, y0, x1, y1, nx, ny) => {
      for (let k = 0; k < 26; k++) {
        const a = 0.12 * (1 - k / 26) ** 2;
        c.strokeStyle = `rgba(120,100,76,${a})`;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x0 + nx * k * 2, y0 + ny * k * 2);
        c.lineTo(x1 + nx * k * 2, y1 + ny * k * 2);
        c.stroke();
      }
      c.strokeStyle = 'rgba(110,92,70,0.38)';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();
    };
    fold(w * 0.5, 0, w * 0.5 + 3, h, 1, 0);
    fold(0, h * 0.56, w, h * 0.56 - 2, 0, -1);
    const edge = (g) => {
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    };
    const ge = c.createLinearGradient(0, 0, 0, h);
    ge.addColorStop(0, 'rgba(160,130,90,0.24)');
    ge.addColorStop(0.035, 'rgba(160,130,90,0)');
    ge.addColorStop(0.965, 'rgba(160,130,90,0)');
    ge.addColorStop(1, 'rgba(160,130,90,0.26)');
    edge(ge);
    const gx = c.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, 'rgba(160,130,90,0.22)');
    gx.addColorStop(0.03, 'rgba(160,130,90,0)');
    gx.addColorStop(0.97, 'rgba(160,130,90,0)');
    gx.addColorStop(1, 'rgba(160,130,90,0.24)');
    edge(gx);
  });
}

let SHADOW = null;
function cardShadow() {
  if (SHADOW) return SHADOW;
  SHADOW = bake('atlas:shadow', CARD.w + 200, CARD.h + 200, (c) => {
    c.shadowColor = 'rgba(0,0,0,0.8)';
    c.shadowBlur = 40;
    c.shadowOffsetY = 14;
    c.fillStyle = 'rgba(0,0,0,0.62)';
    c.fillRect(100, 100, CARD.w, CARD.h);
  });
  return SHADOW;
}

/** the sheets already dealt: blank paper edges peeking out under this one */
function stack(ctx, i) {
  for (let k = Math.max(0, i - 3); k < i; k++) {
    ctx.save();
    cardXf(ctx, k);
    ctx.drawImage(cardShadow(), CARD.x - 100, CARD.y - 100);
    ctx.drawImage(bakeCard(), CARD.x, CARD.y);
    ctx.fillStyle = 'rgba(40,30,20,0.10)';
    ctx.fillRect(CARD.x, CARD.y, CARD.w, CARD.h);
    ctx.restore();
  }
}

/** table + the stack under sheet i, baked once per sheet */
function bgCanvas(i) {
  return bake(`atlas:bg:${i}`, W, H, (c) => {
    desk(c);
    stack(c, i);
  });
}

/** the scene's sheet. o.layer: 'all' (table, stack, card), 'bg' (table and
 *  stack only) or 'card' (the card alone, for cuts). o.nudge (0..1) carries
 *  the card into its place in the stack; o.deal (1..0) slides it in. */
export function frame(ctx, o, i, fn) {
  const layer = o.layer || 'all';
  if (layer !== 'card') ctx.drawImage(bgCanvas(i), 0, 0);
  if (layer === 'bg') return;
  const cx = CARD.x + CARD.w / 2;
  const cy = CARD.y + CARD.h / 2;
  ctx.save();
  if (o.nudge) {
    const pl = place(i);
    ctx.translate(cx + pl.dx * o.nudge, cy + pl.dy * o.nudge);
    ctx.rotate(pl.rot * o.nudge);
    ctx.translate(-cx, -cy);
  }
  const d = o.deal || 0;
  if (d > 0) {
    ctx.translate(cx + d * W * 1.1, cy - d * 120);
    ctx.rotate(d * 0.085);
    ctx.translate(-cx, -cy);
  }
  const lift = clamp(d * 2.5);
  if (lift > 0) {
    ctx.globalAlpha = 1 - lift * 0.3;
    ctx.drawImage(cardShadow(), CARD.x - 100 + lift * 28, CARD.y - 100 + lift * 44, CARD.w + 200 + lift * 40, CARD.h + 200 + lift * 40);
    ctx.globalAlpha = 1;
  } else ctx.drawImage(cardShadow(), CARD.x - 100, CARD.y - 100);
  ctx.drawImage(bakeCard(), CARD.x, CARD.y);
  ctx.beginPath();
  ctx.rect(CARD.x, CARD.y, CARD.w, CARD.h);
  ctx.clip();
  fn(ctx);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(bakeCardOver(), CARD.x, CARD.y);
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(255,252,240,0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(CARD.x + CARD.w * 0.5 - 2, CARD.y);
  ctx.lineTo(CARD.x + CARD.w * 0.5 + 1, CARD.y + CARD.h);
  ctx.moveTo(CARD.x, CARD.y + CARD.h * 0.56 + 2);
  ctx.lineTo(CARD.x + CARD.w, CARD.y + CARD.h * 0.56);
  ctx.stroke();
  ctx.restore();
}

/** the frame around the map: fine rule, then the black-and-white ladder */
export function neatline(ctx, r = MAPR, { a = 1, step = 46 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = AT.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  const o = 9;
  ctx.lineWidth = 1;
  ctx.strokeRect(r.x - o, r.y - o, r.w + 2 * o, r.h + 2 * o);
  ctx.fillStyle = AT.ink;
  for (let x = r.x, i = 0; x < r.x + r.w; x += step, i++) {
    if (i % 2) continue;
    const w = Math.min(step, r.x + r.w - x);
    ctx.fillRect(x, r.y - o, w, o - 1);
    ctx.fillRect(x, r.y + r.h + 1, w, o - 1);
  }
  for (let y = r.y, i = 0; y < r.y + r.h; y += step, i++) {
    if (i % 2) continue;
    const h = Math.min(step, r.y + r.h - y);
    ctx.fillRect(r.x - o, y, o - 1, h);
    ctx.fillRect(r.x + r.w + 1, y, o - 1, h);
  }
  ctx.restore();
}

/* ------------------------------ typography ------------------------------- */

export function label(ctx, s, x, y, { size = 26, font = F.mono6, color = AT.ink, align = 'left', track = 3, a = 1, p = 1, halo = false } = {}) {
  if (p <= 0.001 || a <= 0.001) return 0;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(s).width;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.globalAlpha *= a;
  if (p < 1) {
    ctx.beginPath();
    ctx.rect(x0 - 6, y - size * 1.1, (w + 12) * EASE.outCubic(clamp(p)), size * 1.6);
    ctx.clip();
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if (halo) {
    ctx.strokeStyle = typeof halo === 'string' ? halo : 'rgba(244,237,221,0.94)';
    ctx.lineWidth = size * 0.3;
    ctx.lineJoin = 'round';
    ctx.strokeText(s, x0, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(s, x0, y);
  ctx.restore();
  return w;
}

/** the sheet's title block: kicker in red type, serif title, double rule */
export function heading(ctx, t, { kicker = '', lines = [], x = IN.x + 40, y = 372, size = 106, lead = 1.0, t0 = -1, a = 1, stagger = 0.08, sub = '', subAt = -1, ruleY = MAPR.y - 30 } = {}) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (kicker) label(ctx, kicker, x, y - size * 0.95, { size: 26, color: AT.verm, track: 5, p: P(t, t0, 0.5) });
  let yy = y;
  lines.forEach((line, li) => {
    const at = Array.isArray(t0) ? t0[li] : t0 + 0.05 + li * stagger;
    const p = P(t, at, 0.55, EASE.outExpo);
    if (p <= 0) {
      yy += size * lead;
      return;
    }
    const parts = line.split(/(\*[^*]+\*)/).filter(Boolean).map((s) => (s.startsWith('*') ? { s: s.slice(1, -1), c: AT.verm } : { s, c: AT.ink }));
    ctx.font = `${size}px ${F.serif}`;
    ctx.letterSpacing = '-2px';
    const widths = parts.map((q) => ctx.measureText(q.s).width);
    const total = widths.reduce((u, v) => u + v, 0);
    let cx = x;
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
  if (sub) label(ctx, sub, x + 2, yy - size * 0.38, { size: 34, font: F.italic, color: AT.ink2, track: 1, p: P(t, subAt, 0.7) });
  const pr = P(t, Array.isArray(t0) ? t0[0] : t0 + 0.1, 0.7, EASE.outQuart);
  ctx.strokeStyle = AT.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(IN.x + 16, ruleY);
  ctx.lineTo(IN.x + 16 + (IN.w - 32) * pr, ruleY);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(IN.x + 16, ruleY + 6);
  ctx.lineTo(IN.x + 16 + (IN.w - 32) * pr, ruleY + 6);
  ctx.stroke();
  ctx.restore();
}

/** a paper tag with a typed label, optionally pinned by a leader to (ax, ay) */
export function tag(ctx, s, x, y, { p = 1, size = 24, ax = null, ay = null, color = AT.ink, bg = 'rgba(248,242,228,0.97)', align = 'left', font = F.mono6, track = 3, fg = null } = {}) {
  if (p <= 0.001) return null;
  const w = textW(ctx, s, size, font, track) + 28;
  const h = size + 22;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const q = EASE.outBack(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  if (ax !== null) {
    const lx = clamp(ax, x0 + 8, x0 + w - 8);
    const ly = ay < y ? y - h / 2 : y + h / 2;
    const k = clamp(p * 1.4);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lerp(lx, ax, k), lerp(ly, ay, k));
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ax, ay, 5 * k, 0, TAU);
    ctx.fill();
  }
  ctx.translate(x0 + w / 2, y);
  ctx.scale(0.9 + 0.1 * q, 0.9 + 0.1 * q);
  ctx.fillStyle = 'rgba(30,20,10,0.22)';
  ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  ctx.restore();
  label(ctx, s, x0 + 14, y + size * 0.36, { size, color: fg || color, track, font, a: clamp(p * 2) });
  return { x0, w, h };
}

/** a map pin dropped in: needle, shadow and a round head */
export function pin(ctx, x, y, { p = 1, color = AT.verm, r = 14 } = {}) {
  if (p <= 0.001) return;
  const drop = (1 - EASE.outBack(clamp(p))) * 70;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 3);
  ctx.fillStyle = 'rgba(30,20,10,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 9, y + 2, 8, 3.2, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#5E554C';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x, y - drop);
  ctx.lineTo(x, y - 34 - drop);
  ctx.stroke();
  const hy = y - 40 - drop;
  const n = parseInt(color.replace('#', ''), 16);
  const dk = `rgb(${((n >> 16) & 255) * 0.55},${((n >> 8) & 255) * 0.55},${(n & 255) * 0.55})`;
  const g = ctx.createRadialGradient(x - r * 0.35, hy - r * 0.4, 1, x, hy, r);
  g.addColorStop(0, '#FFF6EA');
  g.addColorStop(0.3, color);
  g.addColorStop(1, dk);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, hy, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** a hand-drawn felt-tip loop around (cx, cy), drawn on */
export function marker(ctx, cx, cy, rx, ry, p, { color = AT.verm, lw = 6, seed = 3, rot = -0.12, a = 0.9 } = {}) {
  if (p <= 0.001) return;
  const R = rng(seed);
  const n = 90;
  const pts = [];
  const j1 = R() * 6;
  const j2 = R() * 6;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const th = -1.9 + u * TAU * 1.12;
    const wob = 1 + 0.045 * Math.sin(th * 3 + j1) + 0.03 * Math.sin(th * 5 + j2) + u * 0.07;
    const x = Math.cos(th) * rx * wob;
    const y = Math.sin(th) * ry * wob;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  drawOn(ctx, pts, p, { lw, color, a });
}

/** a felt-tip underline / stroke between two points, slightly bowed */
export function stroke(ctx, x0, y0, x1, y1, p, { color = AT.verm, lw = 6, bow = 6, a = 0.9 } = {}) {
  if (p <= 0.001) return;
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const nx = -(y1 - y0);
    const ny = x1 - x0;
    const l = Math.hypot(nx, ny) || 1;
    const b = Math.sin(u * Math.PI) * bow;
    pts.push([lerp(x0, x1, u) + (nx / l) * b, lerp(y0, y1, u) + (ny / l) * b]);
  }
  drawOn(ctx, pts, p, { lw, color, a });
}

/** an engineering dimension line with ticks, arrows and a centred label */
export function dimLine(ctx, x0, x1, y, p, { color = AT.ink, text = '', size = 28, lw = 2.4, above = true, a = 1, tick = 20 } = {}) {
  if (p <= 0.001) return;
  const e = EASE.outCubic(clamp(p));
  const xm = (x0 + x1) / 2;
  const xa = lerp(xm, x0, e);
  const xb = lerp(xm, x1, e);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(xa, y);
  ctx.lineTo(xb, y);
  ctx.moveTo(xa, y - tick);
  ctx.lineTo(xa, y + tick);
  ctx.moveTo(xb, y - tick);
  ctx.lineTo(xb, y + tick);
  ctx.stroke();
  for (const [x, d] of [[xa, 1], [xb, -1]]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + d * 18, y - 7);
    ctx.lineTo(x + d * 18, y + 7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  if (text) label(ctx, text, xm, above ? y - 16 : y + size + 12, { size, color, align: 'center', track: 2, a: a * clamp((p - 0.4) / 0.4), halo: true });
}

/** a rubber stamp slammed onto the sheet */
export function stamp(ctx, lines, x, y, p, { color = AT.verm, rot = -0.1, size = 42, seed = 5 } = {}) {
  if (p <= 0.001) return;
  const e = clamp(p);
  const sc = 1 + 0.6 * (1 - EASE.outQuart(e));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  ctx.globalAlpha *= clamp(e * 2.4) * 0.9;
  const key = `${lines.join('|')}:${size}:${seed}:${color}`;
  let cv = STAMPS.get(key);
  if (!cv) {
    cv = stampCanvas(ctx, lines, { color, size, seed });
    STAMPS.set(key, cv);
  }
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(cv, -cv.width / 2, -cv.height / 2);
  ctx.restore();
}

const STAMPS = new Map();
function stampCanvas(ctx, lines, { color, size, seed }) {
  ctx.save();
  ctx.font = `${size}px ${F.mono6}`;
  ctx.letterSpacing = '4px';
  const w = Math.max(...lines.map((s) => ctx.measureText(s).width)) + 64;
  ctx.restore();
  const h = lines.length * size * 1.2 + 40;
  const cv = createCanvas(Math.ceil(w + 20), Math.ceil(h + 20));
  const c = cv.getContext('2d');
  c.translate(cv.width / 2, cv.height / 2);
  c.strokeStyle = color;
  c.lineWidth = 6;
  c.strokeRect(-w / 2, -h / 2, w, h);
  c.lineWidth = 2.2;
  c.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
  c.fillStyle = color;
  c.font = `${size}px ${F.mono6}`;
  c.letterSpacing = '4px';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  lines.forEach((s, i) => c.fillText(s, 0, -h / 2 + 20 + size * 0.62 + i * size * 1.2));
  c.globalCompositeOperation = 'destination-out';
  const R = rng(seed);
  for (let i = 0; i < 300; i++) {
    c.globalAlpha = 0.25 + R() * 0.6;
    c.beginPath();
    c.arc((R() - 0.5) * w, (R() - 0.5) * h, 0.8 + R() * R() * 5, 0, TAU);
    c.fill();
  }
  return cv;
}

/** compass rose: rings, rhumb ticks, half-shaded points, N */
export function rose(ctx, x, y, r, { p = 1, a = 1, rot = 0 } = {}) {
  if (p <= 0.001) return;
  const e = EASE.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha *= a * clamp(p * 1.5);
  ctx.translate(x, y);
  ctx.rotate(rot + (1 - e) * -0.6);
  ctx.scale(0.7 + 0.3 * e, 0.7 + 0.3 * e);
  ctx.strokeStyle = AT.ink;
  ctx.lineWidth = 1.5;
  for (const rr of [r, r * 0.93, r * 0.6]) {
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath();
  for (let i = 0; i < 128; i++) {
    const a0 = (i / 128) * TAU;
    const l = i % 8 === 0 ? 0.85 : 0.89;
    ctx.moveTo(Math.cos(a0) * r * l, Math.sin(a0) * r * l);
    ctx.lineTo(Math.cos(a0) * r * 0.93, Math.sin(a0) * r * 0.93);
  }
  ctx.stroke();
  const point = (ang, len, wid) => {
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const tip = [c * len, s * len];
    const l = [-s * wid, c * wid];
    ctx.fillStyle = AT.ink;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tip[0], tip[1]);
    ctx.lineTo(l[0], l[1]);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = AT.paper;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tip[0], tip[1]);
    ctx.lineTo(-l[0], -l[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  for (let i = 0; i < 8; i++) point(i * (TAU / 8) + TAU / 16, r * 0.52, r * 0.07);
  for (let i = 0; i < 4; i++) point(i * (TAU / 4) + TAU / 8, r * 0.68, r * 0.1);
  for (let i = 0; i < 4; i++) point(i * (TAU / 4) - TAU / 4, r * 0.97, r * 0.13);
  ctx.fillStyle = AT.verm;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.05, 0, TAU);
  ctx.fill();
  ctx.font = `${Math.round(r * 0.3)}px ${F.serif7}`;
  ctx.fillStyle = AT.ink;
  ctx.textAlign = 'center';
  ctx.fillText('U', 0, -r * 1.08);
  ctx.restore();
}

/** a parliament hemicycle of n seats; returns seat positions in fill order */
export function hemicycleSeats(cx, cy, r0, r1, n, rows = 8) {
  const rs = [];
  for (let i = 0; i < rows; i++) rs.push(lerp(r0, r1, i / (rows - 1)));
  const sum = rs.reduce((u, v) => u + v, 0);
  const per = rs.map((r) => Math.round((n * r) / sum));
  let diff = n - per.reduce((u, v) => u + v, 0);
  for (let i = rows - 1; diff !== 0; i = (i + rows - 1) % rows) {
    per[i] += Math.sign(diff);
    diff -= Math.sign(diff);
  }
  const seats = [];
  rs.forEach((r, i) => {
    for (let k = 0; k < per[i]; k++) {
      const a = Math.PI - (k + 0.5) * (Math.PI / per[i]);
      seats.push({ a, r, x: cx + Math.cos(a) * r, y: cy - Math.sin(a) * r });
    }
  });
  seats.sort((u, v) => v.a - u.a || u.r - v.r);
  return { seats, rad: ((r1 - r0) / (rows - 1)) * 0.4 };
}

/** typewriter line: characters appear at `cps`, a caret blinks after */
export function typed(ctx, s, x, y, t, t0, { cps = 24, size = 30, color = AT.ink, track = 3, caret = true, font = F.mono6 } = {}) {
  if (t < t0) return 0;
  const n = Math.min(s.length, Math.floor((t - t0) * cps));
  const w = label(ctx, s.slice(0, n), x, y, { size, color, track, font });
  if (caret && (n < s.length || Math.floor(t * 2.2) % 2 === 0)) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(x + w + 4, y - size * 0.8, size * 0.5, size * 0.95);
    ctx.restore();
  }
  return w;
}

/** km scale bar for a Mercator view at latitude `lat` */
export function scaleKm(ctx, V, x, y, km, lat, { a = 1, p = 1, segs = 4 } = {}) {
  if (p <= 0.001) return;
  const pxPerKm = V.s / (R_KM * Math.cos(lat * D));
  const w = km * pxPerKm * clamp(p);
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < segs; i++) {
    ctx.fillStyle = i % 2 ? '#F6F0E2' : AT.ink;
    ctx.fillRect(x + (w / segs) * i, y, w / segs, 9);
  }
  ctx.strokeStyle = AT.ink;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x, y, w, 9);
  ctx.restore();
  label(ctx, '0', x, y - 10, { size: 19, color: AT.ink2, align: 'center', track: 1, a: a * p });
  label(ctx, `${idNum(km)} KM`, x + km * pxPerKm, y - 10, { size: 19, color: AT.ink2, align: 'center', track: 1, a: a * clamp((p - 0.6) / 0.4) });
}

/** a small engraved carrack under sail, facing +x */
export function ship(ctx, x, y, s, { a = 1, rot = 0, flip = false } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(flip ? -s : s, s);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = AT.ink;
  ctx.fillStyle = AT.ink;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-62, -6);
  ctx.quadraticCurveTo(-58, 18, -30, 22);
  ctx.lineTo(34, 22);
  ctx.quadraticCurveTo(58, 16, 70, -10);
  ctx.lineTo(44, -6);
  ctx.lineTo(-40, -6);
  ctx.lineTo(-50, -18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,237,221,0.55)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(-50 + k * 4, 2 + k * 6);
    ctx.lineTo(48 - k * 6, 2 + k * 6);
    ctx.stroke();
  }
  ctx.strokeStyle = AT.ink;
  ctx.lineWidth = 2.2;
  const sail = (mx, top, w, h, bow) => {
    ctx.beginPath();
    ctx.moveTo(mx - w / 2, top);
    ctx.quadraticCurveTo(mx + bow, top + h / 2, mx - w / 2, top + h);
    ctx.lineTo(mx + w / 2, top + h);
    ctx.quadraticCurveTo(mx + w / 2 + bow, top + h / 2, mx + w / 2, top);
    ctx.closePath();
    ctx.fillStyle = '#F4EEDF';
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.clip();
    ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      ctx.moveTo(mx + w / 2 - 4 - k * 3, top + 4);
      ctx.lineTo(mx + w / 2 - 4 - k * 3 + bow * 0.6, top + h - 4);
      ctx.stroke();
    }
    ctx.restore();
  };
  ctx.beginPath();
  ctx.moveTo(-28, -6);
  ctx.lineTo(-28, -92);
  ctx.moveTo(10, -6);
  ctx.lineTo(10, -112);
  ctx.moveTo(44, -8);
  ctx.lineTo(44, -70);
  ctx.moveTo(66, -12);
  ctx.lineTo(96, -40);
  ctx.stroke();
  sail(-28, -86, 34, 30, 8);
  sail(-28, -52, 40, 36, 10);
  sail(10, -106, 38, 34, 9);
  sail(10, -66, 50, 46, 12);
  sail(44, -64, 26, 40, 6);
  ctx.fillStyle = AT.verm;
  ctx.beginPath();
  ctx.moveTo(10, -112);
  ctx.lineTo(30, -106);
  ctx.lineTo(10, -100);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** bbox centre of a country in lon/lat (largest ring) */
export function bboxCentre(name) {
  const c = country(name);
  let best = null;
  for (const poly of c.polys) {
    const bb = bboxOf(poly[0]);
    const ar = (bb[2] - bb[0]) * (bb[3] - bb[1]);
    if (!best || ar > best.ar) best = { bb, ar };
  }
  return [(best.bb[0] + best.bb[2]) / 2, (best.bb[1] + best.bb[3]) / 2];
}

/** a warm paper panel (inset card) with a thin double border */
export function panel(ctx, x, y, w, h, { p = 1, bg = '#F7F1E3', a = 1 } = {}) {
  if (p <= 0.001) return;
  const e = EASE.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha *= a * clamp(p * 2);
  ctx.translate(0, (1 - e) * 30);
  ctx.fillStyle = 'rgba(30,20,10,0.2)';
  ctx.fillRect(x + 4, y + 6, w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = AT.ink;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(x + 7, y + 7, w - 14, h - 14);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 12, y + 12, w - 24, h - 24);
  ctx.restore();
}
