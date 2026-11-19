// Printed-figure graphics for the cyanotype plates (episode 28): a
// stratigraphic column, a 24-hour dial of Earth's history, the Phanerozoic
// diversity curve, a species waffle, ranked bars and a real-coastline map.
// All of it is data-driven (ICS colours and ages, Dulvy et al. 2021,
// TRAFFIC 2019, Natural Earth via world-atlas) and drawn as line work.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { CY, ICS, PERIODS, Path2D, bake, makeCanvas, label, textW, drawOn, rgba, hatch, stipple, P, eo, e3 } from './_cyano.mjs';
import { F } from '../engine/fonts.mjs';
import { W } from '../engine/draw.mjs';
import { clamp, lerp, rng, TAU, EASE } from '../engine/anim.mjs';

const require = createRequire(import.meta.url);

/* ---------------------------- lithology tiles ---------------------------- */

function tile(kind) {
  return bake(`litho:${kind}`, 64, 64, (c) => {
    c.strokeStyle = CY.paper;
    c.fillStyle = CY.paper;
    c.lineWidth = 1.6;
    c.globalAlpha = 0.62;
    if (kind === 'lime') {
      for (let y = 0; y < 64; y += 16) {
        c.beginPath();
        c.moveTo(0, y + 0.5);
        c.lineTo(64, y + 0.5);
        c.stroke();
        const off = (y / 16) % 2 ? 16 : 0;
        for (let x = off; x < 64; x += 32) {
          c.beginPath();
          c.moveTo(x + 0.5, y);
          c.lineTo(x + 0.5, y + 16);
          c.stroke();
        }
      }
    } else if (kind === 'shale') {
      for (let y = 6; y < 64; y += 12) {
        const off = (y / 12) % 2 ? 10 : 0;
        for (let x = off; x < 64; x += 22) {
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + 12, y);
          c.stroke();
        }
      }
    } else if (kind === 'sand') {
      const R = rng(9);
      for (let i = 0; i < 46; i++) {
        c.beginPath();
        c.arc(R() * 64, R() * 64, 0.9 + R() * 1.3, 0, TAU);
        c.fill();
      }
    } else if (kind === 'coal') {
      c.globalAlpha = 1;
      c.fillStyle = 'rgba(5,16,40,0.65)';
      c.fillRect(0, 0, 64, 64);
      c.strokeStyle = CY.paper;
      c.globalAlpha = 0.3;
      for (let y = 4; y < 64; y += 8) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(64, y);
        c.stroke();
      }
    } else if (kind === 'cong') {
      const R = rng(4);
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        c.ellipse(R() * 64, R() * 64, 3 + R() * 5, 2 + R() * 4, R() * 3, 0, TAU);
        c.stroke();
      }
    }
  });
}

const LITHO = { Kambrium: 'sand', Ordovisium: 'lime', Silur: 'shale', Devon: 'sand', Karbon: 'coal', Perm: 'cong', Trias: 'sand', Jura: 'lime', Kapur: 'lime', Paleogen: 'shale', Neogen: 'sand', Kuarter: 'cong' };

/**
 * A stratigraphic column from maBot (bottom, older) to maTop (top). `p`
 * reveals it from the bottom up. Returns the Ma -> y mapping.
 */
export function stratColumn(ctx, { x = 140, w = 150, yTop = 600, yBot = 1720, maTop = 370, maBot = 470, p = 1, a = 1, tickEvery = 10, labels = true, names = true, seed = 3 }) {
  const y = (ma) => yBot - ((maBot - ma) / (maBot - maTop)) * (yBot - yTop);
  if (a <= 0.001 || p <= 0.001) return y;
  const yReveal = lerp(yBot, yTop, EASE.outCubic(clamp(p)));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  const yClip = yReveal - 60 * clamp((p - 0.9) * 10);
  ctx.rect(x - 400, yClip, w + 1000, yBot - yClip + 40);
  ctx.clip();
  // bands, with a wavy (unconformable) top line on each
  const R = rng(seed);
  for (const [name, , color, base, top] of PERIODS) {
    if (top >= maBot || base <= maTop) continue;
    const y0 = y(Math.min(base, maBot));
    const y1 = y(Math.max(top, maTop));
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y1, w, y0 - y1);
    ctx.clip();
    ctx.fillStyle = 'rgba(237,242,239,0.07)';
    ctx.fillRect(x, y1, w, y0 - y1);
    const pat = ctx.createPattern(tile(LITHO[name] || 'sand'), 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(x, y1, w, y0 - y1);
    // thin internal beds
    ctx.strokeStyle = CY.paper;
    ctx.lineWidth = 1.2;
    for (let yy = y1 + 30 + R() * 30; yy < y0 - 10; yy += 40 + R() * 60) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      for (let xx = x; xx <= x + w; xx += 10) ctx[xx === x ? 'moveTo' : 'lineTo'](xx, yy + Math.sin(xx * 0.05 + yy) * 2.5);
      ctx.stroke();
    }
    ctx.restore();
    // boundary line
    ctx.strokeStyle = CY.paper;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let xx = x; xx <= x + w; xx += 6) ctx[xx === x ? 'moveTo' : 'lineTo'](xx, y1 + Math.sin(xx * 0.09 + base) * 3);
    ctx.stroke();
    // ICS colour strip and the period name
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(x + w + 8, y1, 34, y0 - y1);
    ctx.globalAlpha = 1;
    if (names && y0 - y1 > 120) {
      ctx.save();
      ctx.translate(x + w + 25, (y0 + y1) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `24px ${F.mono6}`;
      ctx.letterSpacing = '4px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(8,20,44,0.9)';
      ctx.fillText(name.toUpperCase(), 0, 1);
      ctx.restore();
    }
  }
  ctx.strokeStyle = CY.paper;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y(maTop), w, y(maBot) - y(maTop));
  // the age axis
  if (labels) {
    for (let ma = Math.ceil(maTop / tickEvery) * tickEvery; ma <= maBot; ma += tickEvery) {
      const yy = y(ma);
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x + w + 46, yy);
      ctx.lineTo(x + w + 66, yy);
      ctx.stroke();
      label(ctx, `${ma}`, x + w + 76, yy + 9, { size: 26, color: CY.paper, a: 0.85, track: 1 });
    }
    label(ctx, 'JT TH LALU', x + w + 46, y(maTop) - 22, { size: 22, a: 0.7, track: 3 });
  }
  ctx.restore();
  return y;
}

/* ------------------------------- the dial -------------------------------- */

const HOUR = (ma) => ((4540 - ma) / 4540) * 24;
export const dialAngle = (h) => (h / 24) * TAU - Math.PI / 2;

function guilloche(r) {
  return bake(`guil:${r}`, r * 2 + 4, r * 2 + 4, (c) => {
    c.translate(r + 2, r + 2);
    c.strokeStyle = CY.paper;
    c.lineWidth = 1;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU;
      c.globalAlpha = 0.09;
      c.beginPath();
      c.arc(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, r * 0.62, 0, TAU);
      c.stroke();
    }
    c.globalAlpha = 0.16;
    for (let k = 1; k < 7; k++) {
      c.beginPath();
      c.arc(0, 0, (r * k) / 7, 0, TAU);
      c.stroke();
    }
  });
}

/**
 * The 24-hour dial of Earth's history. `draw` 0..1 reveals the rings, `fill`
 * (hours, 0..24) colours the eon ring up to that hour, `hand` is the hand's
 * hour. Drawn live so the camera can push in without softening.
 */
export function dial(ctx, cx, cy, r, { draw = 1, fill = 24, hand = 0, handA = 1, a = 1, eonLabels = 1 } = {}) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const q = EASE.outCubic(clamp(draw));
  // face
  ctx.save();
  ctx.globalAlpha *= q;
  ctx.fillStyle = 'rgba(6,20,48,0.38)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  const g = guilloche(Math.round(r * 0.62));
  ctx.drawImage(g, cx - g.width / 2, cy - g.height / 2);
  ctx.restore();
  // rings drawn on
  ctx.strokeStyle = CY.paper;
  const ring = (rr, lw, al = 1) => {
    ctx.globalAlpha = a * al;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + TAU * q);
    ctx.stroke();
  };
  ring(r, 4);
  ring(r - 14, 1.5, 0.7);
  ring(r * 0.78, 2);
  ring(r * 0.66, 2);
  ring(r * 0.64, 1, 0.6);
  // eon ring: filled up to `fill`
  const r0 = r * 0.66;
  const r1 = r * 0.78;
  for (const key of ['hadean', 'archean', 'proterozoic', 'phanerozoic']) {
    const [name, color, base, top] = ICS[key];
    const h0 = HOUR(base);
    const h1 = Math.min(HOUR(top), fill);
    if (h1 <= h0) continue;
    ctx.globalAlpha = a * 0.82;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r1 - 3, dialAngle(h0), dialAngle(h1));
    ctx.arc(cx, cy, r0 + 3, dialAngle(h1), dialAngle(h0), true);
    ctx.closePath();
    ctx.fill();
    // engraved hatch over the colour so it reads printed, not flat
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = a * 0.25;
    ctx.strokeStyle = '#06142E';
    ctx.lineWidth = 1.4;
    for (let k = -r; k < r; k += 9) {
      ctx.beginPath();
      ctx.moveTo(cx + k, cy - r);
      ctx.lineTo(cx + k + r * 0.6, cy + r);
      ctx.stroke();
    }
    ctx.restore();
    if (eonLabels > 0.01 && HOUR(top) - h0 > 1.5 && fill >= HOUR(top) - 0.01) {
      const mid = dialAngle((h0 + HOUR(top)) / 2);
      ctx.save();
      ctx.globalAlpha = a * eonLabels;
      ctx.translate(cx + Math.cos(mid) * (r0 + r1) / 2, cy + Math.sin(mid) * (r0 + r1) / 2);
      let rot = mid + Math.PI / 2;
      if (Math.sin(mid) > 0.2) rot += Math.PI;
      ctx.rotate(rot);
      ctx.font = `22px ${F.mono6}`;
      ctx.letterSpacing = '3px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(6,18,44,0.95)';
      ctx.fillText(name.toUpperCase(), 0, 1);
      ctx.restore();
    }
  }
  // ticks: quarter hours, hours, and the hour numerals
  ctx.strokeStyle = CY.paper;
  for (let i = 0; i < 96; i++) {
    const u = i / 96;
    if (u > q) break;
    const an = u * TAU - Math.PI / 2;
    const major = i % 4 === 0;
    const l = major ? 30 : 14;
    ctx.globalAlpha = a * (major ? 0.95 : 0.6);
    ctx.lineWidth = major ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * (r - 16), cy + Math.sin(an) * (r - 16));
    ctx.lineTo(cx + Math.cos(an) * (r - 16 - l), cy + Math.sin(an) * (r - 16 - l));
    ctx.stroke();
  }
  for (let h = 0; h < 24; h++) {
    const u = h / 24;
    if (u > q) break;
    const an = dialAngle(h);
    const big = h % 6 === 0;
    const rr = r * 0.88;
    ctx.globalAlpha = a * (big ? 1 : 0.85);
    ctx.font = `${big ? 50 : 34}px ${big ? F.serif : F.serif5}`;
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CY.white;
    ctx.fillText(String(h), cx + Math.cos(an) * rr, cy + Math.sin(an) * rr + 2);
  }
  // hand
  if (handA > 0.001) {
    const an = dialAngle(hand);
    ctx.save();
    ctx.globalAlpha = a * handA;
    ctx.translate(cx, cy);
    ctx.rotate(an);
    ctx.fillStyle = CY.white;
    ctx.strokeStyle = CY.white;
    ctx.beginPath();
    ctx.moveTo(-r * 0.16, -7);
    ctx.lineTo(r * 0.5, -5);
    // a spade near the tip
    ctx.quadraticCurveTo(r * 0.56, -26, r * 0.62, -10);
    ctx.lineTo(r * 0.9, 0);
    ctx.lineTo(r * 0.62, 10);
    ctx.quadraticCurveTo(r * 0.56, 26, r * 0.5, 5);
    ctx.lineTo(-r * 0.16, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = CY.deep;
    ctx.beginPath();
    ctx.arc(r * 0.58, 0, 6, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = CY.white;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, TAU);
    ctx.fill();
    ctx.fillStyle = CY.deep;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export { HOUR };

/* ------------------------- Phanerozoic diversity ------------------------- */

// marine genera through the Phanerozoic, schematic after Sepkoski: the big
// five are the sharp drops at 445, 372/359, 252, 201 and 66 Ma
export const DIVERSITY = [
  [540, 150], [525, 420], [510, 470], [495, 430], [486, 520], [470, 1080], [458, 1480], [447, 1450], [444, 960], [432, 1150], [420, 1250], [405, 1340],
  [390, 1440], [378, 1400], [372, 980], [366, 1020], [359, 760], [345, 930], [325, 900], [305, 960], [285, 1050], [265, 1160], [256, 1060], [252, 360],
  [246, 470], [232, 760], [212, 880], [201, 520], [190, 660], [170, 900], [150, 1100], [125, 1260], [100, 1480], [80, 1720], [68, 1780], [66, 1120],
  [56, 1560], [40, 2000], [23, 2560], [10, 3000], [0, 3280],
];
export const BIG5 = [
  [445, 'Akhir Ordovisium'],
  [372, 'Akhir Devon'],
  [252, 'Perm–Trias'],
  [201, 'Trias–Jura'],
  [66, 'Kapur–Paleogen'],
];

export function diversityAt(ma) {
  for (let i = 0; i < DIVERSITY.length - 1; i++) {
    const [a0, v0] = DIVERSITY[i];
    const [a1, v1] = DIVERSITY[i + 1];
    if (ma <= a0 && ma >= a1) return lerp(v0, v1, (a0 - ma) / (a0 - a1));
  }
  return DIVERSITY[DIVERSITY.length - 1][1];
}

/** ICS period strip along a time axis (x0 = 540 Ma ... x1 = 0) */
export function periodStrip(ctx, x0, x1, y, h, maL = 540, maR = 0, { a = 1, p = 1, letters = true } = {}) {
  const X = (ma) => x0 + ((maL - ma) / (maL - maR)) * (x1 - x0);
  const xr = lerp(x0, x1, EASE.outCubic(clamp(p)));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  ctx.rect(x0 - 2, y - 4, xr - x0 + 4, h + 60);
  ctx.clip();
  for (const [name, abbr, color, base, top] of PERIODS) {
    if (top >= maL || base <= maR) continue;
    const xa = X(Math.min(base, maL));
    const xb = X(Math.max(top, maR));
    ctx.fillStyle = color;
    ctx.globalAlpha = a * 0.9;
    ctx.fillRect(xa, y, xb - xa, h);
    ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(6,18,44,0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(xa, y, xb - xa, h);
    if (letters && xb - xa > 26) {
      ctx.font = `${Math.min(26, h * 0.62)}px ${F.mono6}`;
      ctx.letterSpacing = '0px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(6,18,44,0.92)';
      ctx.fillText(abbr, (xa + xb) / 2, y + h / 2 + 1);
    }
    void name;
  }
  ctx.restore();
  return X;
}

/* -------------------------------- waffle --------------------------------- */

/**
 * 100 cells. `cells` lists each cell's group and status; `p` reveals the grid,
 * `paint` 0..1 colours the threatened cells in order.
 */
export function waffle(ctx, x, y, size, gap, cells, icons, { p = 1, paint = 0, a = 1, t = 0 } = {}) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const col = { cr: CY.cr, en: CY.en, vu: CY.vu };
  let threatIndex = 0;
  const nThreat = cells.filter((c) => c.st).length;
  cells.forEach((c, i) => {
    const cx = x + (i % 10) * (size + gap);
    const cy = y + Math.floor(i / 10) * (size + gap);
    const q = EASE.outBack(clamp(p * 1.6 - (i % 10) * 0.03 - Math.floor(i / 10) * 0.05));
    if (q <= 0.001) return;
    let painted = 0;
    if (c.st) {
      painted = clamp(paint * nThreat * 1.15 - threatIndex);
      threatIndex++;
    }
    ctx.save();
    ctx.translate(cx + size / 2, cy + size / 2);
    ctx.scale(q, q);
    ctx.strokeStyle = CY.paper;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = a * 0.45;
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.globalAlpha = a;
    if (painted > 0) {
      ctx.fillStyle = col[c.st];
      const hh = size * EASE.outCubic(painted) * (c.half ? 0.5 : 1);
      ctx.fillRect(-size / 2, size / 2 - hh, size, hh);
    }
    const ic = icons[c.g];
    const s = (size * 0.8) / ic.width;
    ctx.globalAlpha = a * (painted > 0.5 ? 1 : 0.9);
    ctx.drawImage(painted > 0.5 ? icons[c.g + 'Dark'] : ic, (-ic.width * s) / 2, (-ic.height * s) / 2, ic.width * s, ic.height * s);
    ctx.restore();
  });
  ctx.restore();
  void t;
}

/* -------------------------------- bars ----------------------------------- */

/** a ranked horizontal bar with an engraved fill */
export function bar(ctx, x, y, w, h, p, { color = CY.paper, fillA = 0.18, hatchA = 0.5, a = 1, seed = 1 } = {}) {
  const q = EASE.outExpo(clamp(p));
  if (q <= 0.001 || a <= 0.001) return 0;
  const ww = w * q;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = rgba(color, fillA);
  ctx.fillRect(x, y, ww, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, ww, h);
  ctx.clip();
  hatch(ctx, x, y, x + w, y + h, { angle: -0.9, step: 9, lw: 1.6, color, a: hatchA, seed });
  ctx.restore();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.6;
  ctx.strokeRect(x, y, ww, h);
  ctx.restore();
  return ww;
}

/* --------------------------------- map ----------------------------------- */

let GEO = null;
function geo() {
  if (GEO) return GEO;
  const topo = JSON.parse(fs.readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));
  const fc = feature(topo, topo.objects.countries);
  GEO = fc.features;
  return GEO;
}

const NEIGHBOURS = new Set(['458', '096', '626', '598', '608', '036', '702', '764', '704', '116', '104', '418', '156', '090']);

/**
 * Indonesia and its neighbours, baked at `scale` x. Box in lon/lat; returns
 * { cv, X, Y, w, h, s } where X(lon), Y(lat) give map pixels (unscaled).
 */
export function mapSprite({ lon0 = 94, lon1 = 142, lat0 = 7.5, lat1 = -11.5, w = 1240, s = 1.5 } = {}) {
  const k = w / (lon1 - lon0);
  const h = (lat0 - lat1) * k;
  const X = (lon) => (lon - lon0) * k;
  const Y = (lat) => (lat0 - lat) * k;
  const cv = bake(`map:${lon0}:${lon1}:${w}:${s}`, w * s, h * s, (c) => {
    const feats = geo();
    const pathOf = (f) => {
      const p = new Path2D();
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [];
      for (const poly of polys) {
        for (const ringPts of poly) {
          ringPts.forEach(([lon, lat], i) => {
            const px = X(lon) * s;
            const py = Y(lat) * s;
            if (i) p.lineTo(px, py);
            else p.moveTo(px, py);
          });
          p.closePath();
        }
      }
      return p;
    };
    const indo = feats.find((f) => f.id === '360');
    const near = feats.filter((f) => NEIGHBOURS.has(f.id));
    const pIndo = pathOf(indo);
    const pNear = near.map(pathOf);
    // coastal water lines around everything (rings in the sea only)
    const rings = makeCanvas(w * s, h * s);
    const r = rings.getContext('2d');
    r.lineJoin = 'round';
    for (const [wd, al] of [[44, 0.1], [30, 0.16], [18, 0.24], [9, 0.32]]) {
      r.globalCompositeOperation = 'source-over';
      r.strokeStyle = `rgba(237,242,239,${al})`;
      r.lineWidth = wd * s;
      r.stroke(pIndo);
      pNear.forEach((p) => r.stroke(p));
      r.globalCompositeOperation = 'destination-out';
      r.lineWidth = (wd - 3) * s;
      r.strokeStyle = '#000';
      r.stroke(pIndo);
      pNear.forEach((p) => r.stroke(p));
    }
    r.globalCompositeOperation = 'destination-out';
    r.fillStyle = '#000';
    r.fill(pIndo);
    pNear.forEach((p) => r.fill(p));
    c.drawImage(rings, 0, 0);
    // neighbours: faint
    c.fillStyle = 'rgba(237,242,239,0.08)';
    pNear.forEach((p) => c.fill(p));
    c.strokeStyle = 'rgba(237,242,239,0.45)';
    c.lineWidth = 1.4 * s;
    pNear.forEach((p) => c.stroke(p));
    // Indonesia: pale land with level hatching, a firm coast
    c.save();
    c.fillStyle = 'rgba(237,242,239,0.2)';
    c.fill(pIndo);
    c.clip(pIndo);
    c.strokeStyle = 'rgba(237,242,239,0.55)';
    c.lineWidth = 1.2 * s;
    for (let yy = 0; yy < h * s; yy += 5 * s) {
      c.beginPath();
      c.moveTo(0, yy);
      c.lineTo(w * s, yy);
      c.stroke();
    }
    c.restore();
    c.strokeStyle = CY.white;
    c.lineWidth = 2.2 * s;
    c.lineJoin = 'round';
    c.stroke(pIndo);
  });
  return { cv, X, Y, w, h, s };
}

/** graticule with LU/LS and BT labels (Indonesian notation) */
export function graticule(ctx, ox, oy, m, { a = 0.5, p = 1, lonStep = 10, latStep = 5 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = CY.paper;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 7]);
  const lonA = Math.ceil(94 / lonStep) * lonStep;
  for (let lon = lonA; lon <= 142; lon += lonStep) {
    const x = ox + m.X(lon);
    ctx.beginPath();
    ctx.moveTo(x, oy);
    ctx.lineTo(x, oy + m.h * clamp(p));
    ctx.stroke();
    label(ctx, `${lon}°BT`, x, oy + m.h + 34, { size: 22, align: 'center', a: 0.9, track: 1, p });
  }
  for (let lat = 5; lat >= -10; lat -= latStep) {
    const y = oy + m.Y(lat);
    ctx.beginPath();
    ctx.moveTo(ox, y);
    ctx.lineTo(ox + m.w * clamp(p), y);
    ctx.stroke();
    const lab = lat === 0 ? '0°' : lat > 0 ? `${lat}°LU` : `${-lat}°LS`;
    label(ctx, lab, ox - 14, y + 8, { size: 22, align: 'right', a: 0.9, track: 1, p });
  }
  ctx.restore();
}

export { stipple, drawOn, P, eo, e3, textW };
