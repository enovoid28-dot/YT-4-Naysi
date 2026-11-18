import { W, H, txt, fillRR, rr, measure, tracking, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { K, ease } from './_kertas.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Ep21 print kit — the drawing tools the sheet scenes share.
//
// Everything here behaves like it was set on a press: graph paper, hairlines,
// letterpress numerals, diagonal hatching for "missing", dotted streams, and
// line icons drawn with a constant 5 px ink weight so they sit with the type.
// ─────────────────────────────────────────────────────────────────────────────

/** graph-paper grid inside a rectangle, fading in the y direction */
export function grid(ctx, x, y, w, h, o = {}) {
  const { step = 40, a = 0.16, color = K.blue, fade = 0.55, square = true } = o;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha *= a;
  for (let xx = 0; xx <= w + 0.5; xx += step) {
    const t = square ? 1 : 1;
    ctx.globalAlpha = a * t * (1 - Math.abs(xx / w - 0.5) * fade);
    ctx.beginPath();
    ctx.moveTo(x + xx, y);
    ctx.lineTo(x + xx, y + h);
    ctx.stroke();
  }
  for (let yy = 0; yy <= h + 0.5; yy += step) {
    ctx.globalAlpha = a * (1 - Math.abs(yy / h - 0.5) * fade);
    ctx.beginPath();
    ctx.moveTo(x, y + yy);
    ctx.lineTo(x + w, y + yy);
    ctx.stroke();
  }
  ctx.restore();
}

/** diagonal printed hatch, the fill that means "gone / missing" */
export function hatch(ctx, x, y, w, h, o = {}) {
  const { color = K.red, gap = 16, lw = 3, a = 0.9, p = 1 } = o;
  if (p <= 0.001) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w * clamp(p), h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.globalAlpha *= a;
  for (let i = -h; i < w + h; i += gap) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + h);
    ctx.lineTo(x + i + h, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** a thin ink rule, with an optional animated draw-on */
export function rule(ctx, x0, x1, y, o = {}) {
  const { lw = 2, color = K.hair, p = 1, a = 1 } = o;
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.fillRect(x0, y - lw / 2, (x1 - x0) * clamp(p), lw);
  ctx.restore();
}

/** vertical tick marks along a baseline — the hour rail grammar */
export function ticks(ctx, x0, x1, y, n, o = {}) {
  const { len = 16, lw = 2.4, color = K.ink, a = 1, every = 1, big = 0 } = o;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha *= a;
  for (let i = 0; i <= n; i++) {
    const x = lerp(x0, x1, i / n);
    const l = big && i % big === 0 ? len * 1.7 : len;
    ctx.fillRect(x - lw / 2, y, lw, l * (i % every === 0 ? 1 : 0.7));
  }
  ctx.restore();
}

/** an analogue printed clock face, hands where the story is */
export function clock(ctx, cx, cy, r, hh, mm, o = {}) {
  const { a = 1, ink = K.ink, red = K.red, lw = 5, face = K.card, sec = null } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // face
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.9, 0, TAU);
  ctx.stroke();
  // hour ticks
  for (let i = 0; i < 60; i++) {
    const an = (i / 60) * TAU - Math.PI / 2;
    const inner = r * (i % 5 === 0 ? 0.74 : 0.83);
    ctx.fillStyle = i % 5 === 0 ? ink : 'rgba(20,17,16,0.5)';
    const wgt = i % 5 === 0 ? 5 : 2;
    ctx.save();
    ctx.translate(cx + Math.cos(an) * inner, cy + Math.sin(an) * inner);
    ctx.rotate(an + Math.PI / 2);
    ctx.fillRect(-wgt / 2, -r * 0.08, wgt, r * 0.08);
    ctx.restore();
  }
  // hands
  const hand = (ang, len, wide, col) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.fillStyle = col;
    rr(ctx, -wide / 2, -len, wide, len, wide / 2);
    ctx.fill();
    ctx.restore();
  };
  hand(((hh % 12) / 12) * TAU + (mm / 60) * (TAU / 12), r * 0.56, r * 0.098, ink);
  hand((mm / 60) * TAU, r * 0.74, r * 0.05, ink);
  if (sec != null) hand((sec / 60) * TAU, r * 0.76, r * 0.024, red);
  ctx.fillStyle = red;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.045, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** line-icon coffee cup with steam */
export function cup(ctx, cx, cy, s, o = {}) {
  const { a = 1, ink = K.ink, red = K.red, lw = 5 } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = ink;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // body
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.62, cy - s * 0.18);
  ctx.lineTo(cx + s * 0.5, cy - s * 0.18);
  ctx.lineTo(cx + s * 0.4, cy + s * 0.5);
  ctx.quadraticCurveTo(cx, cy + s * 0.72, cx - s * 0.52, cy + s * 0.5);
  ctx.closePath();
  ctx.stroke();
  // handle
  ctx.beginPath();
  ctx.arc(cx + s * 0.62, cy + s * 0.06, s * 0.2, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  // saucer
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.86, cy + s * 0.74);
  ctx.lineTo(cx + s * 0.62, cy + s * 0.74);
  ctx.stroke();
  // steam
  ctx.strokeStyle = red;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    const sx = cx - s * 0.3 + i * s * 0.34;
    ctx.moveTo(sx, cy - s * 0.34);
    ctx.bezierCurveTo(sx - s * 0.16, cy - s * 0.56, sx + s * 0.16, cy - s * 0.68, sx, cy - s * 0.9);
    ctx.stroke();
  }
  ctx.restore();
}

/** line-icon fridge, door ajar */
export function fridge(ctx, cx, cy, s, o = {}) {
  const { a = 1, ink = K.ink, red = K.red, lw = 5 } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = ink;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  rr(ctx, cx - s * 0.42, cy - s * 0.62, s * 0.84, s * 1.34, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy - s * 0.1);
  ctx.lineTo(cx + s * 0.42, cy - s * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.26, cy - s * 0.52);
  ctx.lineTo(cx + s * 0.26, cy - s * 0.28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.26, cy + s * 0.02);
  ctx.lineTo(cx + s * 0.26, cy + s * 0.3);
  ctx.stroke();
  // a second shelf and something cold on it
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy + s * 0.34);
  ctx.lineTo(cx + s * 0.42, cy + s * 0.34);
  ctx.stroke();
  ctx.save();
  ctx.globalAlpha *= 0.5;
  ctx.beginPath();
  rr(ctx, cx - s * 0.26, cy + s * 0.06, s * 0.16, s * 0.28, 3);
  ctx.stroke();
  ctx.restore();
  // the light that spills out when the door is held open
  ctx.fillStyle = red;
  ctx.globalAlpha *= 0.18;
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.42, cy - s * 0.62);
  ctx.lineTo(cx + s * 0.78, cy - s * 0.30);
  ctx.lineTo(cx + s * 0.78, cy + s * 0.86);
  ctx.lineTo(cx + s * 0.42, cy + s * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** an ink dot that lands, used for plotted points */
export function dot(ctx, x, y, r, o = {}) {
  const { a = 1, color = K.red, ring = 0 } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  if (ring) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + ring, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

/** dashed vertical guide from a plot point down to the axis */
export function guide(ctx, x, y0, y1, o = {}) {
  const { a = 1, color = K.ink, p = 1 } = o;
  if (p <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a * 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 9]);
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, lerp(y0, y1, p));
  ctx.stroke();
  ctx.restore();
}

/** a bracket with a label, for measuring a span */
export function bracket(ctx, x0, x1, y, label, o = {}) {
  const { a = 1, color = K.red, up = 0, size = 22, p = 1 } = o;
  if (a <= 0.004 || p <= 0.004) return;
  const xx = lerp(x0, x1, p);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y + up * 14);
  ctx.lineTo(x0, y);
  ctx.lineTo(xx, y);
  ctx.lineTo(xx, y + up * 14);
  ctx.stroke();
  tracking(ctx, label, (x0 + x1) / 2, y - 14, {
    size, font: F.mono6, track: 4, color, align: 'center',
  });
  ctx.restore();
}

/** a card that reads as a pressed paper panel with a printed label tab */
export function panel(ctx, x, y, w, h, o = {}) {
  const { a = 1, fill = K.card, stroke = K.ink, lw = 2.5, r = 4, shadow = 14, tab = null } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (shadow) {
    ctx.fillStyle = 'rgba(20,17,16,0.16)';
    rr(ctx, x + shadow * 0.6, y + shadow, w, h, r);
    ctx.fill();
  }
  ctx.fillStyle = fill;
  rr(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
  if (tab) {
    const tw = measure(ctx, tab, 19, F.mono6, 5) + 34;
    ctx.fillStyle = K.ink;
    ctx.fillRect(x - 1, y - 34, tw, 34);
    tracking(ctx, tab, x + 17, y - 10, {
      size: 19, font: F.mono6, track: 5, color: K.paper,
    });
  }
  ctx.restore();
}

/** the little red square before a kicker */
export function bullet(ctx, x, y, s = 12, a = 1, color = K.red) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.fillRect(x, y - s, s, s);
  ctx.restore();
}

/* ───────────────────────────── motion ────────────────────────────────────── */

/** progress of a beat that starts at `at` and takes `d` seconds */
export const A = (t, at, d, e = ease.out) => e(clamp((t - at) / Math.max(0.001, d)));

/** type that rises out of a press slot */
export function roll(ctx, s, x, y, o = {}) {
  const {
    size = 180, font = F.num, color = K.ink, p = 1, track = -7,
    align = 'left', weight = 1,
  } = o;
  if (p <= 0.004) return;
  const w = measure(ctx, s, size, font, track);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0 - size * 0.3, y - size * 0.96, w + size * 0.6, size * 1.2);
  ctx.clip();
  ctx.globalAlpha *= clamp(p * 1.45) * weight;
  txt(ctx, s, x, y + (1 - p) * size * 0.62, { size, font, color, track, align });
  ctx.restore();
}

/** a block of type that fades up and nudges into place */
export function fadeUp(ctx, p, dy, fn) {
  if (p <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p);
  ctx.translate(0, (1 - clamp(p)) * (dy || 26));
  fn();
  ctx.restore();
}
