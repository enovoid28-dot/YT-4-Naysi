// ============================================================================
// Episode 36 kit — "optik": the light-in-a-dark-room world.
// ----------------------------------------------------------------------------
// A warm beam in a black chamber. Everything here is drawn from vectors:
// a perspective dark room with a shuttered window and a pinhole, the inverted
// city that lands on the far wall, dust that only exists inside the beam,
// candles whose flames each throw their own straight ray, a cutaway eye,
// a cream manuscript page with seven volume spines, a river blueprint, and a
// modern phone viewfinder built from the same pinhole. No image assets.
//
//   bg         black room gradient, faint plaster grid, warm bounce
//   beam       volumetric cone with a hot core and edge falloff
//   dust       motes seeded in the beam, parallax by depth
//   heading    serif/sans title with a line-mask reveal and a kicker
//   chip       mono technical chip with a hairline border
//   bigNum     display numeral with a mono unit and a count-up
//   rule       draw-on measurement line with ticks
//   corners    technical frame ticks
//   room       one-point perspective chamber with window, pinhole, screen
//   city       procedural Basra/Cairo skyline, invertible
//   candle     wax body, flame, glow, brass holder
//   eyeCut     cutaway eye with lens, iris, retina and labelled ray cones
//   page       cream paper with fibre, deckle and shadow
//   spine      a book spine with a foil rule and a volume numeral
//   phone      modern viewfinder HUD with thirds grid, focus box, shutter
//   stamp      rubber stamp with grain and a rotation
// ============================================================================

import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, txt, measure, fillRR, strokeRR, linGrad, radGrad, hexA, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, rng, TAU, EASE } from '../engine/anim.mjs';

/* --------------------------------- palette -------------------------------- */

export const OP = {
  ink: '#04060A',      // the room
  ink2: '#070B12',
  smoke: '#0D131C',
  plaster: '#131A24',
  ray: '#FFC061',      // the beam
  rayHi: '#FFE9BE',    // its core
  ember: '#FF7A2F',
  brass: '#C9922F',
  glass: '#7FD8C8',    // lens / glass
  ice: '#BFD6E6',      // telemetry type
  bone: '#F3EEE2',
  dim: '#8B98A8',
  paper: '#F2E8D2',    // manuscript
  paper2: '#E3D6BB',
  paperInk: '#211B14',
  paperRed: '#A8341F',
  river: '#3A80C4',
  red: '#E8452C',
  green: '#5BD6A6',
};

/* -------------------------------- utilities ------------------------------- */

const h1 = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
export const P = (t, at, d, e = EASE.outCubic) => e(clamp((t - at) / Math.max(0.001, d)));
export const eo = (p) => EASE.outExpo(clamp(p));
export const io = (p) => EASE.inOutQuint(clamp(p));
export const sm = (p) => EASE.smooth(clamp(p));
export const rgba = (hex, a = 1) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export { clamp, lerp, rng, TAU, EASE };

const rect = (ctx, x, y, w, h, fill) => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); };

/* ------------------------------ room backdrop ----------------------------- */

/**
 * The black of the chamber: a vertical gradient, a barely visible plaster
 * grid (24 px minor, 120 px major), a warm bounce from the light source and
 * a cold edge on the opposite side. `k` is how lit the room is.
 */
export function bg(ctx, t, { k = 1, warm = [W * 0.34, H * 0.34], r = 1100, grid = 1, ink = OP.ink } = {}) {
  ctx.save();
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#070A10');
  g.addColorStop(0.45, '#05070B');
  g.addColorStop(1, '#020305');
  rect(ctx, 0, 0, W, H, g);
  // warm bounce
  const wg = ctx.createRadialGradient(warm[0], warm[1], 0, warm[0], warm[1], r);
  wg.addColorStop(0, `rgba(255,168,74,${0.10 * k})`);
  wg.addColorStop(0.45, `rgba(255,140,52,${0.045 * k})`);
  wg.addColorStop(1, 'rgba(0,0,0,0)');
  rect(ctx, 0, 0, W, H, wg);
  // cold corner
  const cg = ctx.createRadialGradient(W * 0.9, H * 0.72, 0, W * 0.9, H * 0.72, 900);
  cg.addColorStop(0, `rgba(48,86,120,${0.07 * k})`);
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  rect(ctx, 0, 0, W, H, cg);
  if (grid > 0) {
    ctx.globalAlpha = 0.10 * grid;
    ctx.strokeStyle = '#5E7590';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 48) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 0; y <= H; y += 48) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();
    ctx.globalAlpha = 0.2 * grid;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 240) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 0; y <= H; y += 240) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * A volumetric cone from (x0,y0) width w0 to (x1,y1) width w1. The shape is
 * filled with a gradient perpendicular to the axis, then the hot core is
 * drawn as a thin tapered sliver, then the edges get a soft bloom.
 */
export function beam(ctx, x0, y0, x1, y1, w0, w1, { a = 1, core = 1, color = OP.ray, t = 0, flicker = 0.04 } = {}) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const fl = 1 + Math.sin(t * 6.1) * flicker + Math.sin(t * 13.7 + 1.2) * flicker * 0.5;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(x0 + nx * w0, y0 + ny * w0, x0 - nx * w0, y0 - ny * w0);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(0.32, rgba(color, 0.15 * a * fl));
  g.addColorStop(0.5, rgba(color, 0.34 * a * fl));
  g.addColorStop(0.68, rgba(color, 0.15 * a * fl));
  g.addColorStop(1, rgba(color, 0));
  ctx.beginPath();
  ctx.moveTo(x0 + nx * w0, y0 + ny * w0);
  ctx.lineTo(x1 + nx * w1, y1 + ny * w1);
  ctx.lineTo(x1 - nx * w1, y1 - ny * w1);
  ctx.lineTo(x0 - nx * w0, y0 - ny * w0);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  if (core > 0) {
    const cg = ctx.createLinearGradient(x0, y0, x1, y1);
    cg.addColorStop(0, rgba(OP.rayHi, 0.5 * core * a));
    cg.addColorStop(0.5, rgba(OP.rayHi, 0.22 * core * a));
    cg.addColorStop(1, rgba(OP.rayHi, 0.06 * core * a));
    ctx.beginPath();
    ctx.moveTo(x0 + nx * w0 * 0.12, y0 + ny * w0 * 0.12);
    ctx.lineTo(x1 + nx * w1 * 0.3, y1 + ny * w1 * 0.3);
    ctx.lineTo(x1 - nx * w1 * 0.3, y1 - ny * w1 * 0.3);
    ctx.lineTo(x0 - nx * w0 * 0.12, y0 - ny * w0 * 0.12);
    ctx.closePath();
    ctx.fillStyle = cg;
    ctx.fill();
  }
  ctx.restore();
}

const moteSprite = (() => {
  let cv = null;
  return () => {
    if (cv) return cv;
    cv = createCanvas(64, 64);
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,236,196,1)');
    g.addColorStop(0.45, 'rgba(255,196,120,0.55)');
    g.addColorStop(1, 'rgba(255,170,90,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    return cv;
  };
})();

/** dust seeded inside a corridor from A to B; only drawn where the beam is */
export function dust(ctx, t, { x0, y0, x1, y1, w0 = 60, w1 = 220, n = 90, a = 0.5, seed = 11 } = {}) {
  const sp = moteSprite();
  const r = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const u = (r() + t * 0.012 * (0.4 + r())) % 1;
    const v = r() * 2 - 1;
    const w = lerp(w0, w1, u);
    const x = lerp(x0, x1, u) + v * w * 0.9 + Math.sin(t * 0.7 + i) * 12;
    const y = lerp(y0, y1, u) + Math.sin(t * 0.9 + i * 2.1) * 16 + ((t * 14 * (0.3 + r())) % 60) - 30;
    const s = (1.4 + r() * 3.4) * (0.4 + a);
    ctx.globalAlpha = a * (0.25 + 0.75 * r()) * (0.6 + 0.4 * Math.sin(t * 2 + i));
    ctx.drawImage(sp, x - s * 2, y - s * 2, s * 4, s * 4);
  }
  ctx.restore();
}

/* -------------------------------- typography ------------------------------ */

/** mono kicker with a leading square, drawn across `p` */
export function kicker(ctx, s, x, y, { p = 1, size = 26, color = OP.ray, a = 1, align = 'left' } = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(p * 3);
  ctx.fillStyle = color;
  const w = measure(ctx, s, size, F.mono6, 6) + 6;
  const x0 = align === 'center' ? x - w : align === 'right' ? x - w : x;
  ctx.fillRect(x0, y - size * 0.36, 10, 10);
  txt(ctx, s, x0 + 24, y, { size, font: F.mono6, color, track: 6 });
  ctx.restore();
}

/** big editorial heading: one array of [text, accent?] lines, line-mask reveal */
export function heading(ctx, lines, x, y, {
  t = 0, at = 0, size = 132, lead = 0.96, color = OP.bone, accent = OP.ray,
  font = F.head, align = 'left', stagger = 0.11, dur = 0.62, a = 1, shadow = 0.6,
} = {}) {
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  lines.forEach((ln, i) => {
    const s = typeof ln === 'string' ? ln : ln[0];
    const acc = typeof ln === 'string' ? false : !!ln[1];
    const p = P(t, at + i * stagger, dur);
    if (p <= 0) return;
    const yy = y + i * size * lead;
    ctx.save();
    ctx.beginPath();
    const wguess = measure(ctx, s, size, font, 0) + 40;
    const x0 = align === 'center' ? x - wguess / 2 : align === 'right' ? x - wguess : x - 12;
    ctx.rect(x0 - 20, yy - size * 0.9, (wguess + 40) * p, size * 1.12);
    ctx.clip();
    const dy = (1 - eo(p)) * size * 0.5;
    if (shadow > 0) {
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 10;
    }
    txt(ctx, s, x, yy + dy, { size, font, color: acc ? accent : color, align, alpha: a, glowBlur: acc ? 26 : 0, glowColor: rgba(accent, 0.5) });
    ctx.restore();
  });
  ctx.restore();
}

/** technical chip: mono text in a hairline box; `tone` picks the ink */
export function chip(ctx, s, x, y, { p = 1, size = 26, tone = 'light', align = 'left', dot = false, a = 1 } = {}) {
  if (p <= 0) return { w: 0, h: 0 };
  ctx.save();
  ctx.globalAlpha *= a * clamp(p * 2.2);
  const track = 4;
  const tw = measure(ctx, s, size, F.mono6, track) + track;
  const padX = 20;
  const h = size + 26;
  const w = tw + padX * 2 + (dot ? 26 : 0);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const fg = tone === 'dark' ? OP.paperInk : OP.bone;
  const bd = tone === 'dark' ? 'rgba(33,27,20,0.28)' : 'rgba(243,238,226,0.20)';
  const bgc = tone === 'dark' ? 'rgba(242,232,210,0.55)' : 'rgba(8,10,14,0.55)';
  fillRR(ctx, x0, y - h / 2, w, h, 6, bgc);
  strokeRR(ctx, x0, y - h / 2, w, h, 6, bd, 1.4);
  if (dot) {
    ctx.fillStyle = OP.ray;
    ctx.beginPath();
    ctx.arc(x0 + padX + 5, y, 6, 0, TAU);
    ctx.fill();
  }
  txt(ctx, s, x0 + padX + (dot ? 24 : 0), y + 1, { size, font: F.mono6, color: fg, track, base: 'middle' });
  ctx.restore();
  return { w, h, x: x0 };
}

/** display numeral; optional count-up and an underline rule */
export function bigNum(ctx, n, x, y, {
  p = 1, size = 210, font = F.num, color = OP.bone, unit = '', unitSize = 44,
  align = 'left', track = -4, glowA = 0.4, sep = true, a = 1,
} = {}) {
  if (p <= 0) return 0;
  const val = Math.round(n);
  const s = sep ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : String(val);
  ctx.save();
  ctx.globalAlpha *= a;
  const w = txt(ctx, s, x, y, {
    size, font, color, align, track,
    glowBlur: glowA > 0 ? 30 : 0, glowColor: rgba(color, glowA), alpha: clamp(p * 1.6),
  });
  if (unit) {
    const uw = measure(ctx, unit, unitSize, F.mono6, 3);
    const ux = align === 'center' ? x + w / 2 + 16 : align === 'right' ? x + 16 : x + w + 16;
    txt(ctx, unit, ux, y - (unitSize * 0.06), { size: unitSize, font: F.mono6, color: rgba(color, 0.66), align: 'left', track: 3, alpha: clamp((p - 0.3) * 2) });
  }
  ctx.restore();
  return w;
}

/** draw-on rule with end ticks, from x0 to x1 at y */
export function rule(ctx, x0, x1, y, p = 1, { color = OP.ray, a = 0.7, lw = 2, tick = 14, dash = null, off = 0 } = {}) {
  if (p <= 0) return;
  const x = lerp(x0, x1, clamp(p));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  if (dash) ctx.setLineDash(dash);
  ctx.lineDashOffset = off;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.setLineDash([]);
  if (p > 0.05) {
    ctx.beginPath();
    ctx.moveTo(x, y - tick / 2);
    ctx.lineTo(x, y + tick / 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** technical corner ticks around a rectangle */
export function corners(ctx, x, y, w, h, p = 1, { color = 'rgba(243,238,226,0.35)', len = 26, lw = 2 } = {}) {
  if (p <= 0) return;
  const e = eo(clamp(p));
  const l = len * e;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([cx, cy, sx, sy]) => {
    ctx.moveTo(cx + sx * l, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * l);
  });
  ctx.stroke();
  ctx.restore();
}

/* -------------------------------- the room -------------------------------- */

/**
 * One-point perspective chamber, cut away at the near edge. Everything is
 * projected from the same opener: the left wall carries a shuttered window,
 * the pinhole sits in it, and the beam throws the outside world onto the back
 * wall upside down. The room is clipped to its band so a headline above it is
 * never painted over.
 */
export function room(ctx, t, {
  p = 1, inset = { x: 250, y: 830, w: 940, h: 780 },
  window: win = true, screen = true, beamOn = 1, warm = 1, skyline = true, label = true,
} = {}) {
  const e = eo(clamp(p));
  const { x, y, w, h } = inset;
  const bx = x;
  const by = y;
  const bw = w;
  const bh = h;
  const HX = -80;
  const HY = -80;
  ctx.save();
  ctx.beginPath();
  ctx.rect(-40, by - 300, W + 80, H - by + 360);
  ctx.clip();

  // ceiling / floor / side walls receding to the back wall
  const side = (x0, x1, col0, col1) => {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, col0);
    g.addColorStop(1, col1);
    return g;
  };
  ctx.fillStyle = side(HX, bx, '#080B11', '#0B1017');
  ctx.beginPath(); ctx.moveTo(HX, HY); ctx.lineTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(HX, H - HY); ctx.closePath(); ctx.fill();
  ctx.fillStyle = side(W - HX, bx + bw, '#070A0F', '#0A0E15');
  ctx.beginPath(); ctx.moveTo(W - HX, HY); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(W - HX, H - HY); ctx.closePath(); ctx.fill();
  const floorG = ctx.createLinearGradient(0, by + bh, 0, H);
  floorG.addColorStop(0, '#0C121A');
  floorG.addColorStop(0.55, '#070A0F');
  floorG.addColorStop(1, '#030406');
  ctx.fillStyle = floorG;
  ctx.beginPath(); ctx.moveTo(HX, H - HY); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(W - HX, H - HY); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#04060A';
  ctx.beginPath(); ctx.moveTo(HX, HY); ctx.lineTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(W - HX, HY); ctx.closePath(); ctx.fill();

  // back wall
  const wall = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  wall.addColorStop(0, '#121924');
  wall.addColorStop(0.5, '#151D28');
  wall.addColorStop(1, '#0D1319');
  ctx.fillStyle = wall;
  ctx.fillRect(bx, by, bw, bh);
  // plaster joints
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.strokeStyle = '#8FA6C0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < 6; i++) { const xx = bx + (bw * i) / 6; ctx.moveTo(xx, by); ctx.lineTo(xx, by + bh); }
  for (let j = 1; j < 5; j++) { const yy = by + (bh * j) / 5; ctx.moveTo(bx, yy); ctx.lineTo(bx + bw, yy); }
  ctx.stroke();
  ctx.restore();
  // skirting + wall base
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(bx, by + bh - 16, bw, 16);

  // receding floor joints
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = '#6C8199';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let i = 1; i < 5; i++) {
    const px = lerp(bx + 30, bx + bw - 30, i / 5);
    ctx.moveTo(px, by + bh);
    ctx.lineTo(lerp(HX, W - HX, i / 5), H - HY);
  }
  ctx.stroke();
  ctx.restore();

  const wallX = (u) => lerp(HX, bx, u);
  const wallTop = (u) => lerp(HY, by, u);
  const wallBot = (u) => lerp(H - HY, by + bh, u);

  let hole = null;
  if (win) {
    const u0 = 0.46;
    const u1 = 0.94;
    const vTop = 0.20;
    const vBot = 0.56;
    const A = [wallX(u0), lerp(wallTop(u0), wallBot(u0), vTop)];
    const B = [wallX(u1), lerp(wallTop(u1), wallBot(u1), vTop)];
    const C = [wallX(u1), lerp(wallTop(u1), wallBot(u1), vBot)];
    const D = [wallX(u0), lerp(wallTop(u0), wallBot(u0), vBot)];
    // recessed frame
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]);
    ctx.closePath();
    const g = ctx.createLinearGradient(A[0], A[1], C[0], C[1]);
    g.addColorStop(0, rgba(OP.rayHi, 0.95 * warm));
    g.addColorStop(0.6, rgba(OP.ray, 0.7 * warm));
    g.addColorStop(1, rgba(OP.ember, 0.5 * warm));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    // the day outside, streaked
    for (let i = 0; i < 7; i++) {
      const v0 = vTop + (i / 7) * (vBot - vTop);
      const v1 = vTop + ((i + 0.55) / 7) * (vBot - vTop);
      ctx.fillStyle = `rgba(6,8,12,${0.82})`;
      const p1 = [lerp(A[0], D[0], (v0 - vTop) / (vBot - vTop)), lerp(A[1], D[1], (v0 - vTop) / (vBot - vTop))];
      const p2 = [lerp(B[0], C[0], (v0 - vTop) / (vBot - vTop)), lerp(B[1], C[1], (v0 - vTop) / (vBot - vTop))];
      const p3 = [lerp(B[0], C[0], (v1 - vTop) / (vBot - vTop)), lerp(B[1], C[1], (v1 - vTop) / (vBot - vTop))];
      const p4 = [lerp(A[0], D[0], (v1 - vTop) / (vBot - vTop)), lerp(A[1], D[1], (v1 - vTop) / (vBot - vTop))];
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // frame
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]);
    ctx.closePath();
    ctx.stroke();
    // the pinhole in the shutter
    const u = 0.7;
    const v = 0.34;
    const hx = wallX(u) + 6;
    const hy = lerp(lerp(wallTop(u), wallBot(u), vTop), lerp(wallTop(u), wallBot(u), vBot), v);
    hole = [hx, hy];
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(hx, hy, 7, 0, TAU); ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 90);
    hg.addColorStop(0, rgba(OP.rayHi, 0.85));
    hg.addColorStop(0.25, rgba(OP.ray, 0.3));
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(hx - 100, hy - 100, 200, 200);
    ctx.restore();
  }

  // the projected image patch on the back wall
  const iw = bw * 0.6;
  const ih = bh * 0.32;
  const ix = bx + bw * 0.5 - iw / 2;
  const iy = by + bh * 0.54 - ih / 2;
  if (screen) {
    ctx.save();
    // the projected sky: bright where the sky was, because the image is upside down
    const pg = ctx.createLinearGradient(0, iy + ih, 0, iy);
    pg.addColorStop(0, rgba(OP.rayHi, 0.40));
    pg.addColorStop(0.55, rgba(OP.ray, 0.17));
    pg.addColorStop(1, rgba(OP.ember, 0.04));
    ctx.fillStyle = pg;
    ctx.fillRect(ix, iy, iw, ih);
    // sunlight landing at the bottom of the inverted world
    const dg = ctx.createRadialGradient(ix + iw * 0.62, iy + ih * 0.78, 0, ix + iw * 0.62, iy + ih * 0.78, iw * 0.34);
    dg.addColorStop(0, rgba(OP.rayHi, 0.5));
    dg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = dg;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.restore();
    if (skyline) {
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.translate(0, iy * 2 + ih);
      ctx.scale(1, -1);
      city(ctx, ix, iy, iw, ih, { a: 0.92, flip: true, warm: 1.5, seed: 4 });
      ctx.restore();
    }
    // feather the projection into the plaster: four wall-coloured rakes
    ctx.save();
    const rake = 46;
    const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, 'rgba(18,25,36,1)');
      g.addColorStop(1, 'rgba(18,25,36,0)');
      ctx.fillStyle = g;
      ctx.fillRect(rx, ry, rw, rh);
    };
    edge(ix, 0, ix + rake, 0, ix - 2, iy - 2, rake, ih + 4);
    edge(ix + iw, 0, ix + iw - rake, 0, ix + iw - rake, iy - 2, rake, ih + 4);
    edge(0, iy, 0, iy + rake, ix - 2, iy - 2, iw + 4, rake);
    edge(0, iy + ih, 0, iy + ih - rake, ix - 2, iy + ih - rake, iw + 4, rake);
    ctx.restore();
    // frame ticks round the image
    corners(ctx, ix - 16, iy - 16, iw + 32, ih + 32, clamp(p * 1.2), { color: rgba(OP.ray, 0.45), len: 26, lw: 1.6 });
  }

  // the beam from the hole to the image centre
  if (hole && beamOn > 0) {
    const ex = ix + iw / 2;
    const ey = iy + ih / 2;
    beam(ctx, hole[0], hole[1], ex, ey, 5, iw * 0.34, { a: beamOn * 0.8, t, core: 0.7 });
    dust(ctx, t, { x0: hole[0], y0: hole[1], x1: ex, y1: ey, w0: 10, w1: iw * 0.26, n: 110, a: 0.45 * beamOn, seed: 21 });
  }
  ctx.restore();
  return { bx, by, bw, bh, ix, iy, iw, ih, hole };
}

/** procedural skyline: domes, minarets, flat roofs, palms */
export function city(ctx, x, y, w, h, { a = 1, flip = false, warm = 1, seed = 7, sky = null } = {}) {
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  if (sky) {
    // the light of a town at dusk: a glow on the horizon, black sky above
    const g = ctx.createLinearGradient(x, y + h, x, y);
    g.addColorStop(0, rgba(OP.ray, 0.26 * warm));
    g.addColorStop(0.38, rgba(OP.ember, 0.13 * warm));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    // feather the sides so the skyline does not read as a poster
    const side = ctx.createLinearGradient(x, 0, x + w, 0);
    side.addColorStop(0, 'rgba(4,6,10,0.95)');
    side.addColorStop(0.16, 'rgba(4,6,10,0)');
    side.addColorStop(0.84, 'rgba(4,6,10,0)');
    side.addColorStop(1, 'rgba(4,6,10,0.95)');
    ctx.fillStyle = side;
    ctx.fillRect(x, y, w, h);
  }
  const base = y + h * 0.94;
  const ink = flip ? 'rgba(12,14,18,0.92)' : 'rgba(8,10,14,0.94)';
  const rim = rgba(OP.rayHi, 0.55 * warm);
  let cx = x;
  const blocks = 11;
  for (let i = 0; i < blocks; i++) {
    const bw = (w / blocks) * (0.55 + r() * 0.7);
    const bh = h * (0.12 + r() * 0.52);
    ctx.fillStyle = ink;
    ctx.fillRect(cx, base - bh, bw, bh);
    // the rim of the roof catches the light
    ctx.fillStyle = rgba(OP.rayHi, 0.30 * warm);
    ctx.fillRect(cx, base - bh, bw, 2);
    // tiny windows
    ctx.fillStyle = rgba(OP.ray, 0.55 * warm);
    const wn = Math.max(1, Math.floor(bw / 13));
    for (let k = 0; k < wn; k++) {
      if (r() > 0.5) ctx.fillRect(cx + 3 + k * (bw / wn), base - bh + 8 + (r() * (bh - 16)), 3, 4);
    }
    // a dome or a minaret now and then
    if (i % 3 === 1) {
      ctx.beginPath();
      ctx.arc(cx + bw / 2, base - bh, bw * 0.42, Math.PI, 0);
      ctx.fillStyle = ink;
      ctx.fill();
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx + bw / 2, base - bh, bw * 0.42, Math.PI, 0);
      ctx.stroke();
    }
    if (i % 4 === 2) {
      const mx = cx + bw * 0.78;
      const mh = h * (0.4 + r() * 0.22);
      ctx.fillStyle = ink;
      ctx.fillRect(mx - 5, base - mh, 10, mh);
      ctx.beginPath();
      ctx.moveTo(mx - 7, base - mh);
      ctx.lineTo(mx, base - mh - 22);
      ctx.lineTo(mx + 7, base - mh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(mx, base - mh - 22);
      ctx.lineTo(mx, base - mh - 34);
      ctx.stroke();
    }
    cx += bw * 0.96;
    if (cx > x + w) break;
  }
  // a warm ground line
  ctx.strokeStyle = rgba(OP.ray, 0.55 * warm);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x + w, base);
  ctx.stroke();
  ctx.restore();
}

/* --------------------------------- objects -------------------------------- */

export function candle(ctx, x, y, s, t, { a = 1, seed = 1, pan = 0 } = {}) {
  const fl = 0.86 + 0.1 * Math.sin(t * 11 + seed) + 0.05 * Math.sin(t * 23 + seed * 2);
  ctx.save();
  ctx.globalAlpha *= a;
  // brass dish
  ctx.fillStyle = '#8A6524';
  ctx.beginPath();
  ctx.ellipse(x, y, 44 * s, 11 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#C9922F';
  ctx.beginPath();
  ctx.ellipse(x, y - 3 * s, 44 * s, 9 * s, 0, 0, TAU);
  ctx.fill();
  // wax
  const wg = ctx.createLinearGradient(x - 18 * s, 0, x + 18 * s, 0);
  wg.addColorStop(0, '#B7A98C');
  wg.addColorStop(0.4, '#F0E6CF');
  wg.addColorStop(1, '#9C8F76');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.moveTo(x - 16 * s, y - 4 * s);
  ctx.lineTo(x - 15 * s, y - 96 * s);
  ctx.quadraticCurveTo(x, y - 104 * s, x + 15 * s, y - 96 * s);
  ctx.lineTo(x + 16 * s, y - 4 * s);
  ctx.closePath();
  ctx.fill();
  // wick
  ctx.strokeStyle = '#241C13';
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  ctx.moveTo(x, y - 100 * s);
  ctx.lineTo(x + 1.5 * s, y - 112 * s);
  ctx.stroke();
  // flame
  const py = y - 112 * s;
  ctx.globalCompositeOperation = 'screen';
  const glowR = 150 * s * fl;
  const gg = ctx.createRadialGradient(x, py - 12 * s, 0, x, py - 12 * s, glowR);
  gg.addColorStop(0, 'rgba(255,226,170,0.55)');
  gg.addColorStop(0.25, 'rgba(255,168,72,0.22)');
  gg.addColorStop(1, 'rgba(255,120,30,0)');
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(x, py - 12 * s, glowR, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255,214,150,${0.82 * fl})`;
  ctx.beginPath();
  ctx.moveTo(x, py - 44 * s * fl);
  ctx.quadraticCurveTo(x + 13 * s, py - 14 * s, x, py + 2 * s);
  ctx.quadraticCurveTo(x - 13 * s, py - 14 * s, x, py - 44 * s * fl);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,240,${0.9 * fl})`;
  ctx.beginPath();
  ctx.ellipse(x, py - 12 * s, 3.6 * s, 8 * s, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** cutaway eye with an optional ray fan either entering or leaving */
export function eyeCut(ctx, cx, cy, r, t, {
  p = 1, mode = 'in', a = 1, labels = true, target = null, targetP = 0,
} = {}) {
  const e = eo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= a;
  // sclera
  const bgc = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r);
  bgc.addColorStop(0, '#F6F0E2');
  bgc.addColorStop(0.72, '#D8CDB8');
  bgc.addColorStop(1, '#9C907C');
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * e, r * 0.98 * e, 0, 0, TAU);
  ctx.fillStyle = bgc;
  ctx.fill();
  // cornea bulge on the left
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.96, cy, r * 0.2, r * 0.42, 0, 0, TAU);
  ctx.fillStyle = 'rgba(190,226,236,0.55)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,170,190,0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // iris + pupil
  ctx.fillStyle = '#3E6E7C';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.68, cy, r * 0.1, r * 0.3, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#0A0D11';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.7, cy, r * 0.055, r * 0.19, 0, 0, TAU);
  ctx.fill();
  // lens
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.4, cy, r * 0.09, r * 0.26, 0, 0, TAU);
  ctx.fillStyle = 'rgba(180,230,226,0.5)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(127,216,200,0.9)';
  ctx.stroke();
  // retina arc + optic nerve
  ctx.strokeStyle = 'rgba(232,69,44,0.8)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, -Math.PI * 0.52, Math.PI * 0.52, true);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(243,238,226,0.65)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.78, cy + r * 0.16);
  ctx.lineTo(cx + r * 1.16, cy + r * 0.34);
  ctx.stroke();
  // vitreous lines
  ctx.save();
  ctx.globalAlpha *= 0.22;
  ctx.strokeStyle = '#8FA6C0';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * (0.3 + i * 0.075), -1.1, 1.1);
    ctx.stroke();
  }
  ctx.restore();
  // rays
  const src = [cx - r * 1.25, cy];
  ctx.save();
  ctx.lineCap = 'round';
  if (mode === 'out') {
    for (let i = 0; i < 5; i++) {
      const ang = -0.5 + i * 0.25;
      const len = r * (2.0 + 0.2 * Math.sin(t * 2 + i));
      const gx = src[0] - Math.cos(ang) * len;
      const gy = src[1] - Math.sin(ang) * len;
      ctx.strokeStyle = rgba(OP.red, 0.55);
      ctx.lineWidth = 2.2;
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = -t * 90;
      ctx.beginPath();
      ctx.moveTo(src[0], src[1]);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = rgba(OP.red, 0.8);
      ctx.beginPath();
      ctx.moveTo(gx - 9, gy - 9); ctx.lineTo(gx + 9, gy + 9);
      ctx.moveTo(gx + 9, gy - 9); ctx.lineTo(gx - 9, gy + 9);
      ctx.stroke();
    }
  } else {
    const tg = target || [cx + r * 2.4, cy - r * 1.1];
    for (let i = 0; i < 6; i++) {
      const u = i / 5;
      const sx = lerp(tg[0] - 220 + u * 440, tg[0] - 160 + u * 320, 0.4 + 0.4 * Math.sin(t));
      const sy = tg[1] + (u - 0.5) * 210;
      ctx.strokeStyle = rgba(OP.ray, 0.16 + 0.5 * targetP);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(src[0], src[1]);
      ctx.stroke();
    }
  }
  ctx.restore();
  // labels
  if (labels) {
    const lab = (s, x, y, px, py) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(243,238,226,0.36)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = rgba(OP.ray, 0.9);
      ctx.beginPath();
      ctx.arc(px, py, 3.4, 0, TAU);
      ctx.fill();
      txt(ctx, s, x + (x > px ? 10 : -10), y + 8, { size: 22, font: F.mono6, color: 'rgba(243,238,226,0.72)', track: 2, align: x > px ? 'left' : 'right' });
      ctx.restore();
    };
    lab('KORNEA', cx + r * 1.05, cy - r * 0.68, cx - r * 0.93, cy - r * 0.34);
    lab('LENSA', cx + r * 0.9, cy + r * 0.62, cx - r * 0.4, cy + r * 0.24);
    lab('RETINA', cx - r * 1.0, cy + r * 0.92, cx + r * 0.2, cy + r * 0.78);
  }
  ctx.restore();
}

/* ------------------------------- paper world ------------------------------ */

let paperTile = null;
function paperTexture() {
  if (paperTile) return paperTile;
  const cv = createCanvas(360, 360);
  const c = cv.getContext('2d');
  const img = c.createImageData(360, 360);
  const r = rng(99);
  for (let i = 0; i < 360 * 360; i++) {
    const v = 236 + (r() - 0.5) * 26;
    img.data[i * 4] = v + 4;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v - 16;
    img.data[i * 4 + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  paperTile = cv;
  return cv;
}

/** cream manuscript paper with a soft shadow, a deckle edge and fibres */
export function page(ctx, x, y, w, h, { a = 1, rot = 0, shadow = 1, p = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  if (shadow > 0) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 46 * shadow;
    ctx.shadowOffsetY = 22 * shadow;
  }
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, OP.paper);
  g.addColorStop(0.6, '#EFE4CB');
  g.addColorStop(1, OP.paper2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalAlpha *= 0.5;
  const pat = ctx.createPattern(paperTexture(), 'repeat');
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha /= 0.5;
  // edge darkening
  const eg = ctx.createLinearGradient(0, 0, 0, h);
  eg.addColorStop(0, 'rgba(120,96,60,0.16)');
  eg.addColorStop(0.18, 'rgba(120,96,60,0)');
  eg.addColorStop(0.85, 'rgba(120,96,60,0)');
  eg.addColorStop(1, 'rgba(120,96,60,0.2)');
  ctx.fillStyle = eg;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** a bound volume seen from the spine, foil rule and a roman numeral */
export function spine(ctx, x, y, w, h, { a = 1, label = '', roman = '', p = 1, lean = 0, color = '#3A2A1C' } = {}) {
  if (p <= 0) return;
  const e = eo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y + h * (1 - e) * 0.15);
  ctx.rotate(lean);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#241A12');
  g.addColorStop(0.35, color);
  g.addColorStop(0.75, '#2A1E14');
  g.addColorStop(1, '#191008');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, w * 0.06, h);
  // bands
  ctx.fillStyle = rgba(OP.brass, 0.85);
  ctx.fillRect(w * 0.1, h * 0.1, w * 0.8, 4);
  ctx.fillRect(w * 0.1, h * 0.86, w * 0.8, 4);
  // foil label
  ctx.save();
  ctx.translate(w * 0.52, h * 0.48);
  ctx.rotate(-Math.PI / 2);
  txt(ctx, label, 0, 0, { size: Math.min(30, w * 0.3), font: F.serif5, color: rgba(OP.brass, 0.95), align: 'center', base: 'middle', track: 3 });
  ctx.restore();
  if (roman) txt(ctx, roman, w * 0.52, h * 0.925, { size: 22, font: F.mono6, color: rgba(OP.rayHi, 0.8), align: 'center' });
  ctx.restore();
}

/* ------------------------------- phone world ------------------------------ */

/** a modern viewfinder: rounded frame, thirds grid, focus box, chips, shutter */
export function phone(ctx, x, y, w, h, t, {
  p = 1, a = 1, content = null, zoom = '1×', live = true, shutter = 1,
} = {}) {
  const e = eo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= a;
  const r = 84;
  // body
  fillRR(ctx, x, y, w, h * (0.4 + 0.6 * e), r, '#0A0D12');
  ctx.save();
  rr(ctx, x + 8, y + 8, w - 16, h * (0.4 + 0.6 * e) - 16, r - 8);
  ctx.clip();
  if (content) content(ctx, x, y, w, h);
  // thirds grid
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(x + (w * i) / 3, y);
    ctx.lineTo(x + (w * i) / 3, y + h);
    ctx.moveTo(x, y + (h * i) / 3);
    ctx.lineTo(x + w, y + (h * i) / 3);
  }
  ctx.stroke();
  ctx.restore();
  // focus box
  const fz = 150 + Math.sin(t * 1.6) * 6;
  ctx.save();
  ctx.globalAlpha = 0.85;
  corners(ctx, x + w * 0.5 - fz / 2, y + h * 0.46 - fz / 2, fz, fz, clamp(p * 1.4), { color: 'rgba(255,208,120,0.95)', len: 30, lw: 2.4 });
  ctx.restore();
  // HUD top: live dot + zoom chip
  const top = y + 46;
  if (live) {
    ctx.fillStyle = OP.red;
    ctx.beginPath();
    ctx.arc(x + 54, top, 9 + 2 * Math.sin(t * 4), 0, TAU);
    ctx.fill();
    txt(ctx, 'LIVE', x + 76, top + 2, { size: 24, font: F.mono6, color: 'rgba(255,255,255,0.9)', track: 4, base: 'middle' });
  }
  ctx.restore();
  // chips row under the frame
  const cy = y + h + 42;
  chip(ctx, `${zoom} · PORTRET`, x + w / 2, cy, { p, size: 24, align: 'center', dot: true, a });
  // shutter
  if (shutter > 0) {
    const sc = [x + w - 96, cy + 4];
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.beginPath();
    ctx.arc(sc[0], sc[1], 40, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sc[0], sc[1], 40, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sc[0], sc[1], 28, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** rubber stamp: rotated box, two rules of type, grain */
export function stamp(ctx, s, x, y, { p = 1, rot = -0.12, color = OP.red, size = 54, a = 1 } = {}) {
  if (p <= 0) return;
  const e = eo(clamp(p));
  const sc = 1.25 - 0.25 * e;
  ctx.save();
  ctx.globalAlpha *= a * e;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  ctx.strokeStyle = rgba(color, 0.85);
  ctx.lineWidth = 6;
  const w = measure(ctx, s, size, F.head, 8) + 70;
  const h = size + 46;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.lineWidth = 2;
  ctx.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
  txt(ctx, s, 0, 2, { size, font: F.head, color: rgba(color, 0.9), align: 'center', track: 8, base: 'middle' });
  ctx.restore();
}

/* --------------------------------- charts -------------------------------- */

/** a river seen from above: blueprint line with flow and a dam proposal */
export function riverPlan(ctx, t, { x, y, w, h, p = 1, a = 1 } = {}) {
  const e = eo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = rgba(OP.river, 0.16);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) { ctx.moveTo(x, y + (h * i) / 8); ctx.lineTo(x + w, y + (h * i) / 8); }
  for (let i = 0; i <= 6; i++) { ctx.moveTo(x + (w * i) / 6, y); ctx.lineTo(x + (w * i) / 6, y + h); }
  ctx.stroke();
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    pts.push([x + u * w * e, y + h * (0.5 + 0.22 * Math.sin(u * 4.6 + 0.6) + 0.09 * Math.sin(u * 11.3))]);
  }
  // river body
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const draw = (lw, col, dash = null, off = 0) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    if (dash) ctx.setLineDash(dash);
    ctx.lineDashOffset = off;
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.stroke();
    ctx.setLineDash([]);
  };
  draw(66, 'rgba(58,128,196,0.14)');
  draw(30, 'rgba(58,128,196,0.35)');
  draw(2.4, rgba(OP.river, 0.9), [26, 22], -t * 60);
  // dam proposal: two hatched blocks across the river
  const di = 13;
  const [dx, dy] = pts[di];
  ctx.save();
  ctx.translate(dx, dy);
  ctx.strokeStyle = rgba(OP.red, 0.8);
  ctx.lineWidth = 2;
  ctx.strokeRect(-12, -46, 24, 92);
  ctx.beginPath();
  for (let i = -40; i < 44; i += 9) { ctx.moveTo(-12, i); ctx.lineTo(12, i + 8); }
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  return pts;
}
