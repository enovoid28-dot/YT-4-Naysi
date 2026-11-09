import { F } from './fonts.mjs';
import { clamp, lerp } from './anim.mjs';

export const W = 1440;
export const H = 2560;
export const FPS = 90;
export const M = 104;

export const C = {
  ink0: '#05060A',
  ink1: '#0A0D15',
  ink2: '#11161F',
  ink3: '#1A2130',
  bone: '#F7F2E7',
  bone2: '#D9D2C4',
  amber: '#FFB03A',
  amberHi: '#FFD27A',
  ember: '#FF6B1A',
  red: '#FF4B3B',
  mint: '#4CE0B3',
  sky: '#69B7FF',
  plum: '#2A1236',
  dusk: '#3A1D4A',
};

export const hexA = (hex, a = 1) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const mixHex = (a, b, t) => {
  const pa = parseInt(a.replace('#', ''), 16);
  const pb = parseInt(b.replace('#', ''), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `rgb(${r},${g},${bl})`;
};

export function rr(ctx, x, y, w, h, r = 0) {
  const rad = Math.min(typeof r === 'number' ? r : r[0], Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
  return ctx;
}

export function fillRR(ctx, x, y, w, h, r, fill) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function strokeRR(ctx, x, y, w, h, r, stroke, lw = 2) {
  rr(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

export function linGrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
}

export function radGrad(ctx, x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
}

/** Draw with a soft glow around current path/fill. */
export function glow(ctx, color, blur, fn) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  fn();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.restore();
}

export function txt(ctx, s, x, y, o = {}) {
  const {
    size = 48,
    font = F.head,
    color = C.bone,
    align = 'left',
    base = 'alphabetic',
    alpha = 1,
    track = 0,
    shadow = 0,
    shadowColor = 'rgba(0,0,0,0.55)',
    shadowY = 0,
    glowBlur = 0,
    glowColor = color,
    maxWidth = 0,
    minSize = 8,
  } = o;
  let fs2 = size;
  ctx.save();
  ctx.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
  ctx.textBaseline = base;
  if (maxWidth > 0) {
    ctx.font = `${fs2}px ${font}`;
    let guard = 0;
    while (ctx.measureText(s).width > maxWidth && fs2 > minSize && guard++ < 64) {
      fs2 *= 0.96;
    }
  }
  ctx.font = `${fs2}px ${font}`;
  ctx.globalAlpha *= alpha;
  if (track) ctx.letterSpacing = `${track}px`;
  if (shadow > 0 || glowBlur > 0) {
    ctx.shadowColor = glowBlur > 0 ? glowColor : shadowColor;
    ctx.shadowBlur = glowBlur > 0 ? glowBlur : shadow;
    ctx.shadowOffsetY = shadowY;
  }
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
  return fs2;
}

export function measure(ctx, s, size, font = F.head, track = 0) {
  ctx.save();
  ctx.font = `${size}px ${font}`;
  if (track) ctx.letterSpacing = `${track}px`;
  const w = ctx.measureText(s).width;
  ctx.restore();
  return w;
}

export function tracking(ctx, s, x, y, o = {}) {
  const { size = 24, font = F.semi, color = C.bone, track = 8, align = 'left', alpha = 1 } = o;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.globalAlpha *= alpha;
  const chars = [...s];
  const widths = chars.map((c) => ctx.measureText(c).width + track);
  const total = widths.reduce((a, b) => a + b, 0) - track;
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i];
  });
  ctx.restore();
  return total;
}

export function wrap(ctx, s, maxWidth, size, font = F.semi) {
  ctx.save();
  ctx.font = `${size}px ${font}`;
  const words = s.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  ctx.restore();
  return lines;
}

/** Editorial label chip, e.g. "SELAT HORMUZ". */
export function labelChip(ctx, s, x, y, o = {}) {
  const {
    size = 34,
    font = F.semi,
    padX = 26,
    padY = 16,
    bg = 'rgba(6,8,12,0.82)',
    color = C.bone,
    border = 'rgba(255,255,255,0.16)',
    track = 4,
    align = 'center',
    dot = null,
    dotColor = C.amber,
    radius = 12,
    alpha = 1,
    shadow = 24,
  } = o;
  const tw = measure(ctx, s, size, font, track) + track;
  const w = tw + padX * 2 + (dot ? 30 : 0);
  const h = size + padY * 2;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = 6;
  }
  fillRR(ctx, x0, y - h / 2, w, h, radius, bg);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  if (border) strokeRR(ctx, x0, y - h / 2, w, h, radius, border, 2);
  let tx = x0 + padX;
  if (dot) {
    ctx.beginPath();
    ctx.arc(x0 + padX + 6, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
    tx += 26;
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  ctx.fillStyle = color;
  ctx.fillText(s, tx, y + 2);
  ctx.restore();
  return { w, h, x: x0 };
}

/** Seven-segment style digit, size = height of the glyph. */
const SEG = {
  0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg',
  6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg',
};
export function seg7(ctx, ch, x, y, h, color, o = {}) {
  const { on = 1, thickness = 0.17, offColor = null, glowBlur = 0 } = o;
  const w = h * 0.55;
  const t = h * thickness;
  const lit = SEG[ch] || '';
  const hseg = (x0, cy, len) => {
    ctx.beginPath();
    ctx.moveTo(x0 + t / 2, cy - t / 2);
    ctx.lineTo(x0 + len - t / 2, cy - t / 2);
    ctx.lineTo(x0 + len, cy);
    ctx.lineTo(x0 + len - t / 2, cy + t / 2);
    ctx.lineTo(x0 + t / 2, cy + t / 2);
    ctx.lineTo(x0, cy);
    ctx.closePath();
    ctx.fill();
  };
  const vseg = (cx, y0, len) => {
    ctx.beginPath();
    ctx.moveTo(cx - t / 2, y0 + t / 2);
    ctx.lineTo(cx, y0);
    ctx.lineTo(cx + t / 2, y0 + t / 2);
    ctx.lineTo(cx + t / 2, y0 + len - t / 2);
    ctx.lineTo(cx, y0 + len);
    ctx.lineTo(cx - t / 2, y0 + len - t / 2);
    ctx.closePath();
    ctx.fill();
  };
  const top = y + t / 2;
  const mid = y + h / 2;
  const bot = y + h - t / 2;
  const lx = x + t / 2;
  const rx = x + w - t / 2;
  ctx.save();
  if (glowBlur > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = glowBlur;
  }
  const drawSeg = (k) => {
    const isOn = lit.includes(k);
    ctx.globalAlpha = isOn ? on : 0.025;
    ctx.fillStyle = isOn ? color : offColor || color;
    if (k === 'a') hseg(x + t * 0.55, top, w - t * 1.1);
    else if (k === 'g') hseg(x + t * 0.55, mid, w - t * 1.1);
    else if (k === 'd') hseg(x + t * 0.55, bot, w - t * 1.1);
    else if (k === 'f') vseg(lx, top, h / 2 - t * 0.05);
    else if (k === 'b') vseg(rx, top, h / 2 - t * 0.05);
    else if (k === 'e') vseg(lx, mid, h / 2 - t * 0.05);
    else if (k === 'c') vseg(rx, mid, h / 2 - t * 0.05);
  };
  for (const k of 'abcdefg') drawSeg(k);
  ctx.restore();
  return w;
}

/** LED price string, handles '.' as separator. Returns width. */
export function ledNumber(ctx, s, x, y, h, color, o = {}) {
  const { glowBlur = 22, on = 1 } = o;
  let cx = x;
  for (const ch of s) {
    if (ch === '.' || ch === ',') {
      ctx.save();
      ctx.globalAlpha = on;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = glowBlur * 0.7;
      ctx.beginPath();
      ctx.arc(cx + h * 0.1, y + h * 0.92, h * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      cx += h * 0.34;
    } else if (ch === ' ') {
      cx += h * 0.3;
    } else {
      const w = seg7(ctx, ch, cx, y, h, color, { glowBlur, on });
      cx += w + h * 0.16;
    }
  }
  return cx - x;
}

export function pencilLine(ctx, x0, y0, x1, y1, o = {}) {
  const { color = C.bone, lw = 3, dash = null, cap = 'round' } = o;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = cap;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

export function arcGauge(ctx, cx, cy, r, from, to, o = {}) {
  const { lw = 18, color = C.amber, bg = 'rgba(255,255,255,0.08)', cap = 'round' } = o;
  ctx.save();
  ctx.lineCap = cap;
  ctx.lineWidth = lw;
  ctx.strokeStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, from, to);
  ctx.stroke();
  if (color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, from, from + (to - from) * clamp(o.value ?? 1));
    ctx.stroke();
  }
  ctx.restore();
}

/** Soft elliptical shadow on the ground. */
export function groundShadow(ctx, x, y, rx, ry, alpha = 0.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(0,0,0,${alpha})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Star/burst shape used for stamps and sparks. */
export function burst(ctx, x, y, r0, r1, points, color, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? r1 : r0;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}
