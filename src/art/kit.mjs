// Shared "material" kit: small helpers that give flat vector shapes weight,
// depth and a believable surface. No particles, no filler — just light.
import { W, C, hexA, rr, fillRR, strokeRR, linGrad, radGrad } from '../engine/draw.mjs';

/** Dark glass panel with a lit top edge, hairline border and contact shadow. */
export function glassPanel(ctx, x, y, w, h, r, o = {}) {
  const {
    top = '#1B2232', bottom = '#080A11', alpha = 1, border = 'rgba(255,255,255,0.10)',
    lw = 2, specular = 0.30, shadow = 0.55, radius = r,
  } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.shadowColor = `rgba(0,0,0,${shadow})`;
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 20;
  const g = linGrad(ctx, 0, y, 0, y + h, [
    [0, top],
    [0.5, '#11161F'],
    [1, bottom],
  ]);
  fillRR(ctx, x, y, w, h, radius, g);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha *= alpha;
  strokeRR(ctx, x + 1, y + 1, w - 2, h - 2, radius, border, lw);
  // lit top edge
  const gl = linGrad(ctx, 0, y, 0, y + 90, [
    [0, `rgba(255,255,255,${specular * 0.35})`],
    [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillStyle = gl;
  rr(ctx, x + 1, y + 1, w - 2, 90, radius);
  ctx.fill();
  // crisp specular line along the top
  const sp = linGrad(ctx, x, 0, x + w, 0, [
    [0, `rgba(255,255,255,0)`],
    [0.35, `rgba(255,255,255,${specular})`],
    [0.7, `rgba(255,255,255,${specular * 0.5})`],
    [1, `rgba(255,255,255,0)`],
  ]);
  ctx.fillStyle = sp;
  ctx.fillRect(x + radius, y + 1, w - radius * 2, 2);
  // inner bottom shadow
  const sb = linGrad(ctx, 0, y + h - 60, 0, y + h, [
    [0, 'rgba(0,0,0,0)'],
    [1, 'rgba(0,0,0,0.35)'],
  ]);
  ctx.fillStyle = sb;
  rr(ctx, x + 1, y + h - 60, w - 2, 59, radius);
  ctx.fill();
  ctx.restore();
}

/** Diagonal hatch clipped to a rounded rect (used for "missing" data). */
export function hatch(ctx, x, y, w, h, o = {}) {
  const { color = 'rgba(255,176,58,0.5)', spacing = 18, angle = -Math.PI / 4, lw = 2, r = 6 } = o;
  if (w <= 0 || h <= 0) return;
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  const len = Math.hypot(w, h);
  const dx = Math.cos(angle) * len;
  const dy = Math.sin(angle) * len;
  const cx = x + w / 2;
  const cy = y + h / 2;
  for (let d = -len / 2; d <= len / 2; d += spacing) {
    const ox = Math.cos(angle + Math.PI / 2) * d;
    const oy = Math.sin(angle + Math.PI / 2) * d;
    ctx.beginPath();
    ctx.moveTo(cx + ox - dx / 2, cy + oy - dy / 2);
    ctx.lineTo(cx + ox + dx / 2, cy + oy + dy / 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** Catmull-Rom sampling for soft, natural curves through points. */
export function smoothPath(ctx, pts, move = true) {
  const n = pts.length;
  if (n < 2) return;
  const p = (i) => pts[Math.max(0, Math.min(n - 1, i))];
  move ? ctx.moveTo(pts[0].x, pts[0].y) : ctx.lineTo(pts[0].x, pts[0].y);
  for (let i = 0; i < n - 1; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
  }
}

/** Vertical fade of an already drawn shape: pass a draw callback. */
export function mirroredFade(ctx, x, y, w, h, fn, o = {}) {
  const { alpha = 0.16, stops = [[0, 1], [1, 0]] } = o;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha *= alpha;
  fn();
  ctx.restore();
}

/** A soft cast shadow ellipse (no gradients leaking outside). */
export function castShadow(ctx, x, y, rx, ry, a = 0.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(0.55, `rgba(0,0,0,${a * 0.55})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Tick mark + label helper for chart axes. */
export function axisTick(ctx, x, y, len, vertical, color, lw = 2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  if (vertical) {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + len);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
  }
  ctx.stroke();
  ctx.restore();
}
