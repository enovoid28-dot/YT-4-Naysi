/**
 * Episode 12 motion toolkit — the "industry" set.
 *
 * These are the moves that separate a slideshow from a cut: split-flap digits
 * that physically turn, odometers that carry, sparks that draw themselves,
 * masks that wipe on instead of fading in, and ghost passes that read as
 * motion blur when a card travels fast.
 *
 * Everything is a pure function of a 0..1 progress, so a scene can scrub any
 * of them at any frame and stay frame-accurate (no state between frames).
 */
import { W, H, txt, hexA, linGrad, radGrad, rr, fillRR, strokeRR, measure, tracking } from './draw.mjs';
import { clamp, lerp, EASE, spring, TAU } from './anim.mjs';
import { F } from './fonts.mjs';

/* ------------------------------- helpers -------------------------------- */

export const smooth = (p) => EASE.smooth(clamp(p));
export const out3 = (p) => EASE.outCubic(clamp(p));
export const inOut = (p) => EASE.inOutQuad(clamp(p));

/** Group a number with Indonesian thousands dots: 1450000 -> "1.450.000". */
export const groupNum = (n) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** 0..1 progress of a beat, never negative. */
export const beat = (t, start, dur = 0.6) => clamp((t - start) / Math.max(0.001, dur));

/** Staggered progress: element i of n starts `stagger` seconds after the last. */
export const stagger = (t, start, i, staggerS = 0.06, dur = 0.5) =>
  clamp((t - (start + i * staggerS)) / Math.max(0.001, dur));

/* --------------------------- editorial chrome ---------------------------- */

/** Cropped corner ticks, like a framing guide burned into the layout. */
export function cornerMarks(ctx, { a = 0.22, len = 34, inset = 56, color = '#DCE6F2', side = 'tl' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  const L = (ox, oy, sx, sy) => {
    ctx.beginPath();
    ctx.moveTo(ox + sx * len, oy);
    ctx.lineTo(ox, oy);
    ctx.lineTo(ox, oy + sy * len);
    ctx.stroke();
  };
  if (side.includes('t')) {
    if (side.includes('l')) L(inset, inset, 1, 1);
    if (side.includes('r')) L(W - inset, inset, -1, 1);
  }
  if (side.includes('b')) {
    if (side.includes('l')) L(inset, H - inset, 1, -1);
    if (side.includes('r')) L(W - inset, H - inset, -1, -1);
  }
  ctx.restore();
}

/** Hairline column grid — the invisible structure that makes layout look built. */
export function hairGrid(ctx, { cols = 6, a = 0.05, color = '#DCE6F2', y0 = 0, y1 = H, inset = 56 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  const x0 = inset;
  const w = W - inset * 2;
  for (let i = 0; i <= cols; i++) {
    const x = Math.round(x0 + (w * i) / cols) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
  }
  ctx.restore();
}

/** Micro label with a short rule above it: "T-72 JAM" / "GERBANG". */
export function tag(ctx, s, x, y, {
  size = 22, color = '#DCE6F2', a = 1, track = 5, align = 'left', ruleW = 40, ruleA = 0.5,
} = {}) {
  if (a <= 0.002) return 0;
  ctx.save();
  ctx.globalAlpha *= a;
  const tw = measure(ctx, s, size, F.mono6, track) + track;
  const x0 = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
  if (ruleW > 0) {
    ctx.fillStyle = hexA(color, ruleA);
    ctx.fillRect(align === 'center' ? x - ruleW / 2 : x0, y - size - 14, ruleW, 2);
  }
  tracking(ctx, s, x0, y, { size, font: F.mono6, track, color });
  ctx.restore();
  return tw;
}

/** A value + unit pair, the way data desks set them. */
export function readout(ctx, value, unit, x, y, {
  size = 72, unitSize = 22, color = '#F6F1E6', unitColor = null, a = 1, align = 'left', track = -2,
} = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const vw = measure(ctx, value, size, F.num, track);
  const uw = measure(ctx, unit, unitSize, F.mono6, 4) + 4;
  const total = vw + 12 + uw;
  const x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  txt(ctx, value, x0, y, { size, font: F.num, color, track });
  tracking(ctx, unit, x0 + vw + 12, y, {
    size: unitSize, font: F.mono6, track: 4, color: unitColor || hexA(color, 0.55),
  });
  ctx.restore();
}

/* ----------------------------- split flap -------------------------------- */

const halfH = (cellH) => cellH / 2 - 4;

function drawCharInHalf(ctx, ch, x, y, cellW, cellH, color, which) {
  // `which`: 'top' | 'bottom'. The glyph is drawn with the full cell metrics
  // and clipped to its half, so the character never changes size mid-flip.
  ctx.save();
  ctx.beginPath();
  if (which === 'top') ctx.rect(x, y, cellW, cellH / 2);
  else ctx.rect(x, y + cellH / 2, cellW, cellH / 2);
  ctx.clip();
  txt(ctx, ch, x + cellW / 2, y + cellH * 0.72, {
    size: cellH * 0.74, font: F.num, color, align: 'center', track: -2,
  });
  ctx.restore();
}

/**
 * Split-flap board. `value`/`prev` are strings of the same length; `p` is the
 * 0..1 progress of the whole flip and each cell starts a little later, which is
 * what makes it read as a machine rather than a CSS transition.
 */
export function splitFlap(ctx, {
  value, prev, p, x, y, cellW = 96, cellH = 132, gap = 10,
  bg = '#0C1420', bgTop = '#111B29', ink = '#F6F1E6', seam = 'rgba(0,0,0,0.45)',
  a = 1, staggerS = 0.045, radius = 10,
}) {
  if (a <= 0.002) return;
  const cells = value.length;
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < cells; i++) {
    const ch = value[i];
    const old = prev && prev.length === value.length ? prev[i] : ch;
    const cx = x + i * (cellW + gap);
    const pi = clamp((p - i * staggerS) / 0.42);

    // card
    fillRR(ctx, cx, y, cellW, cellH, radius, bg);
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, y, cellW, cellH / 2 - 2);
    ctx.clip();
    ctx.fillStyle = bgTop;
    ctx.fillRect(cx, y, cellW, cellH / 2);
    ctx.restore();
    strokeRR(ctx, cx, y, cellW, cellH, radius, 'rgba(220,232,245,0.10)', 1.2);

    if (ch === '.' || ch === ',' || ch === ':') {
      txt(ctx, ch, cx + cellW / 2, y + cellH * 0.78, {
        size: cellH * 0.6, font: F.num, color: ink, align: 'center',
      });
      continue;
    }

    const flipping = pi < 1 && old !== ch;
    const showNew = !flipping || pi >= 0.5;
    drawCharInHalf(ctx, showNew ? ch : old, cx, y, cellW, cellH, ink, 'top');
    drawCharInHalf(ctx, showNew ? ch : old, cx, y, cellW, cellH, ink, 'bottom');

    if (flipping) {
      // The flap is a glyph squashed toward the hinge, not a blank card: the
      // digit is never missing at any point of the turn.
      const flat = Math.abs(0.5 - pi) * 2; // 1 at the seam, 0 at either end
      const hh = Math.max(4, cellH * 0.5 * flat);
      const isTop = pi < 0.5;
      const cy = isTop ? y + cellH / 2 - hh : y + cellH / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, cellW, hh);
      ctx.clip();
      ctx.translate(0, isTop ? y + cellH / 2 : y + cellH / 2 - (cellH - cellH * 0));
      ctx.translate(0, isTop ? 0 : 0);
      // draw the glyph in the squashed band
      const sy = Math.max(0.04, flat);
      ctx.save();
      ctx.translate(cx + cellW / 2, cy + hh / 2);
      ctx.scale(1, sy);
      txt(ctx, isTop ? old : ch, 0, cellH * 0.2, {
        size: cellH * 0.74, font: F.num, color: ink, align: 'center', track: -2,
      });
      ctx.restore();
      // a little shading so the band reads as a physical surface
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(cx, cy, cellW, 2);
      ctx.restore();
    }

    // hinge line
    ctx.globalAlpha *= 1;
    ctx.fillStyle = seam;
    ctx.fillRect(cx, y + cellH / 2 - 1, cellW, 2);
  }
  ctx.restore();
}

/** Width of a split-flap row, so callers can centre it. */
export const flapWidth = (n, cellW = 96, gap = 10) => n * cellW + (n - 1) * gap;

/* ------------------------------- sparks ---------------------------------- */

/**
 * Poly-line that draws itself. `p` reveals from left to right; a bright head
 * dot rides the tip so the eye is pulled along the data.
 */
export function spark(ctx, pts, {
  p = 1, x = 0, y = 0, w = 1, h = 1, color = '#F5B23C', lw = 4,
  fill = null, head = true, headColor = null, dash = null, a = 1,
} = {}) {
  if (a <= 0.002 || p <= 0.002) return;
  const n = pts.length;
  const X = (v) => x + v[0] * w;
  const Y = (v) => y + v[1] * h;
  const cut = clamp(p) * (n - 1);
  const last = Math.floor(cut);
  const frac = cut - last;
  ctx.save();
  ctx.globalAlpha *= a;
  if (fill) {
    ctx.beginPath();
    ctx.moveTo(X(pts[0]), y + h);
    for (let i = 0; i <= last; i++) ctx.lineTo(X(pts[i]), Y(pts[i]));
    const ex = lerp(X(pts[last]), X(pts[Math.min(n - 1, last + 1)]), frac);
    const ey = lerp(Y(pts[last]), Y(pts[Math.min(n - 1, last + 1)]), frac);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex, y + h);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, hexA(color, 0.26));
    g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(X(pts[0]), Y(pts[0]));
  for (let i = 1; i <= last; i++) ctx.lineTo(X(pts[i]), Y(pts[i]));
  const ex = lerp(X(pts[last]), X(pts[Math.min(n - 1, last + 1)]), frac);
  const ey = lerp(Y(pts[last]), Y(pts[Math.min(n - 1, last + 1)]), frac);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.stroke();
  ctx.setLineDash([]);
  if (head) {
    ctx.beginPath();
    ctx.arc(ex, ey, lw * 2.1, 0, TAU);
    ctx.fillStyle = headColor || color;
    ctx.globalAlpha *= 0.95;
    ctx.fill();
    ctx.globalAlpha *= 1;
    ctx.beginPath();
    ctx.arc(ex, ey, lw * 5, 0, TAU);
    ctx.fillStyle = hexA(headColor || color, 0.14);
    ctx.fill();
  }
  ctx.restore();
}

/* -------------------------------- motion --------------------------------- */

/** Ghost pass: fake motion blur by redrawing a moving thing a few times. */
export function ghosts(ctx, { dx = 0, dy = 0, n = 3, spread = 1, alpha = 0.16 }, fn) {
  ctx.save();
  for (let i = n; i >= 1; i--) {
    const k = (i / n) * spread;
    ctx.save();
    ctx.globalAlpha *= alpha * (1 - i / (n + 1));
    ctx.translate(-dx * k, -dy * k);
    fn();
    ctx.restore();
  }
  ctx.restore();
  fn();
}

/** Text that is revealed by a hard edge instead of an opacity fade. */
export function wipeText(ctx, s, x, y, p, {
  size = 120, font = F.head, color = '#F6F1E6', track = 0, align = 'left',
  a = 1, edge = true, edgeColor = null,
} = {}) {
  if (p <= 0.002 || a <= 0.002) return;
  const w = measure(ctx, s, size, font, track) + Math.abs(track) * [...s].length;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const cut = clamp(p);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  ctx.rect(x0 - 6, y - size * 1.15, (w + 12) * cut, size * 1.7);
  ctx.clip();
  txt(ctx, s, x0, y, { size, font, color, track });
  ctx.restore();
  if (edge && cut < 0.995) {
    const ex = x0 + w * cut;
    ctx.save();
    ctx.fillStyle = edgeColor || hexA(color, 0.8);
    ctx.fillRect(ex - 2, y - size * 0.78, 4, size * 0.9);
    ctx.globalAlpha *= 0.25;
    ctx.fillRect(ex - 26, y - size * 0.78, 24, size * 0.9);
    ctx.restore();
  }
}

/** Concentric pulse rings, for "something is live" without any particle spam. */
export function rings(ctx, cx, cy, {
  t = 0, n = 3, r0 = 20, r1 = 220, color = '#F5B23C', a = 0.5, lw = 2, speed = 0.55, phase = 0,
} = {}) {
  if (a <= 0.002) return;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const p = ((t * speed + i / n + phase) % 1);
    const r = lerp(r0, r1, EASE.outCubic(p));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.strokeStyle = hexA(color, a * (1 - p) * 0.9);
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.restore();
}

/** A dashed connector that flows toward its target. */
export function flowLine(ctx, x0, y0, x1, y1, {
  p = 1, t = 0, color = '#8FC7E8', a = 0.5, lw = 2, dash = [6, 12], speed = 40, curve = 0.4,
} = {}) {
  if (p <= 0.002 || a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const mx = lerp(x0, x1, 0.5);
  const my = lerp(y0, y1, 0.5) - Math.abs(x1 - x0) * curve * 0.25 - (y1 - y0) * 0.12;
  const N = 40;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1;
    const y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
    pts.push([x, y]);
  }
  const seg = Math.floor(N * clamp(p));
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= seg; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.setLineDash(dash);
  ctx.lineDashOffset = -t * speed;
  ctx.stroke();
  ctx.setLineDash([]);
  const e = pts[seg];
  ctx.beginPath();
  ctx.arc(e[0], e[1], lw * 2, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** Panel: soft card with a top highlight and a hairline border. */
export function panel(ctx, x, y, w, h, {
  r = 16, fill = 'rgba(12,20,32,0.82)', border = 'rgba(214,228,242,0.14)', lw = 1.4,
  topGlow = 0.06, a = 1, shadowA = 0.35,
} = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (shadowA > 0) {
    ctx.shadowColor = `rgba(0,0,0,${shadowA})`;
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 14;
  }
  fillRR(ctx, x, y, w, h, r, fill);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  if (topGlow > 0) {
    ctx.save();
    ctx.beginPath();
    rr(ctx, x, y, w, h, r);
    ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h * 0.4);
    g.addColorStop(0, `rgba(255,255,255,${topGlow})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h * 0.4);
    ctx.restore();
  }
  if (border) strokeRR(ctx, x, y, w, h, r, border, lw);
  ctx.restore();
}

/** Tick marks along an axis — the detail that reads as "measured". */
export function ticks(ctx, x0, y, len, { n = 24, color = '#DCE6F2', a = 0.25, major = 4, lw = 1.2 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  for (let i = 0; i <= n; i++) {
    const x = x0 + (len * i) / n;
    const h = i % major === 0 ? 14 : 7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - h);
    ctx.stroke();
  }
  ctx.restore();
}

/** Barcode — printable detail that sells the ticket metaphor. */
export function barcode(ctx, x, y, w, h, { color = '#F6F1E6', a = 0.75, seed = 5 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let cx = x;
  while (cx < x + w) {
    const bw = 1 + Math.floor(rnd() * 5);
    if (rnd() > 0.32) ctx.fillRect(cx, y, bw, h);
    cx += bw + 1 + Math.floor(rnd() * 4);
  }
  ctx.restore();
}
