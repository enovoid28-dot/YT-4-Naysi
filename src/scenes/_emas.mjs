import { W, H, txt, hexA, linGrad, radGrad, rr, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';

export const E = {
  ink: '#04070C', ink2: '#080D14', ink3: '#0C131C',
  bone: '#F7F2E4', dim: 'rgba(247,242,228,0.55)', faint: 'rgba(247,242,228,0.26)',
  gold: '#E8B44A', goldHi: '#FFE9B0', goldDeep: '#8A5F17', goldDark: '#3A2708',
  ember: '#E4573F', mint: '#5FD6AE', cyan: '#9CC6E6', paper: '#F2E7CE', paperInk: '#191C22',
  line: 'rgba(214,228,240,0.14)', hair: 'rgba(214,228,240,0.07)',
};

export const ease = {
  out: (p) => EASE.outCubic(clamp(p)),
  expo: (p) => EASE.outExpo(clamp(p)),
  inOut: (p) => EASE.inOutQuad(clamp(p)),
  soft: (p) => EASE.smooth(clamp(p)),
};

/** deep room, one warm light: the vault the whole episode lives in */
export function vault(ctx, { t = 0, glowX = W * 0.5, glowY = 620, glowA = 0.14, a = 1, horizon = 1180 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const g = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#02040A'], [0.3, E.ink2], [0.66, '#0A1019'], [1, '#04070C']]);
  ctx.fillStyle = g;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  const rg = radGrad(ctx, glowX, glowY, 0, Math.max(W, 1050) * 0.78, [
    [0, hexA(E.gold, glowA)], [0.42, hexA(E.gold, glowA * 0.26)], [1, hexA(E.gold, 0)],
  ]);
  ctx.fillStyle = rg;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  const hg = linGrad(ctx, 0, horizon - 110, 0, horizon + 140, [
    [0, 'rgba(214,228,240,0)'], [0.45, 'rgba(214,228,240,0.06)'], [1, 'rgba(214,228,240,0)'],
  ]);
  ctx.fillStyle = hg;
  ctx.fillRect(0, horizon - 110, W, 250);
  for (const [bx, ph, sp] of [[300, 0, 0.09], [1120, 2.1, 0.075]]) {
    const x = bx + Math.sin(t * sp + ph) * 120;
    ctx.fillStyle = linGrad(ctx, x - 140, 0, x + 140, 0, [
      [0, 'rgba(240,225,190,0)'], [0.5, 'rgba(240,225,190,0.022)'], [1, 'rgba(240,225,190,0)'],
    ]);
    ctx.fillRect(x - 140, -200, 280, H + 400);
  }
  ctx.restore();
}

/** the metal itself: a gradient that reads as polished gold, plus a sweep */
export function goldFill(ctx, x, y, w, h, { a = 1, deep = 0 } = {}) {
  const g = linGrad(ctx, x, y, x + w * 0.6, y + h, [
    [0, deep ? '#6E4A12' : E.goldDeep],
    [0.18, deep ? '#A9791F' : '#C8922F'],
    [0.42, deep ? '#D8A94A' : E.goldHi],
    [0.58, deep ? '#A9791F' : '#E7B84F'],
    [0.82, deep ? '#7A5213' : '#B8842A'],
    [1, deep ? '#4A3109' : E.goldDark],
  ]);
  return g;
}

/** a bullion bar with a bevel, an engraved serial and a moving specular */
export function bar(ctx, x, y, w, h, { a = 1, rot = 0, shine = 0.4, label = '999.9', sub = '1 G' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-(x + w / 2), -(y + h / 2));

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 46;
  ctx.shadowOffsetY = 20;
  fillRR(ctx, x, y, w, h, Math.min(18, h * 0.14), goldFill(ctx, x, y, w, h));
  ctx.restore();

  // top facet: the lit face
  const inset = Math.min(26, w * 0.07);
  ctx.fillStyle = linGrad(ctx, x, y, x + w * 0.5, y + h * 0.7, [
    [0, 'rgba(255,246,214,0.55)'], [0.5, 'rgba(255,236,180,0.10)'], [1, 'rgba(120,80,20,0.16)'],
  ]);
  ctx.beginPath();
  ctx.moveTo(x + inset, y + 8);
  ctx.lineTo(x + w - inset, y + 8);
  ctx.lineTo(x + w - inset * 0.4, y + h - inset * 0.9);
  ctx.lineTo(x + inset * 0.4, y + h - inset * 0.9);
  ctx.closePath();
  ctx.fill();
  strokeRR(ctx, x + 1.5, y + 1.5, w - 3, h - 3, Math.min(16, h * 0.13), 'rgba(52,32,6,0.85)', 3);
  // bevel: bright top edge, dark bottom edge
  ctx.fillStyle = 'rgba(255,248,220,0.55)';
  ctx.fillRect(x + 10, y + 3, w - 20, 3);
  ctx.fillStyle = 'rgba(58,36,6,0.55)';
  ctx.fillRect(x + 10, y + h - 6, w - 20, 3);

  // specular sweep that travels across the bar
  const sx = x - w * 0.4 + (w * 1.9) * ((shine % 1 + 1) % 1);
  ctx.save();
  ctx.beginPath();
  rr(ctx, x, y, w, h, Math.min(18, h * 0.14));
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, sx - w * 0.22, 0, sx + w * 0.22, 0, [
    [0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,252,235,0.30)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // engraving
  if (w > 240 && h > 100) {
    txt(ctx, label, x + w / 2, y + h * 0.60, {
      size: Math.min(30, h * 0.20), font: F.mono6, color: 'rgba(62,38,6,0.55)', align: 'center', track: 4,
    });
    txt(ctx, sub, x + w / 2, y + h * 0.79, {
      size: Math.min(19, h * 0.13), font: F.mono, color: 'rgba(62,38,6,0.42)', align: 'center', track: 5,
    });
  }
  ctx.restore();
}

/** a coin seen slightly from above */
export function coin(ctx, cx, cy, r, { a = 1, shine = 0 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  const g = radGrad(ctx, cx - r * 0.3, cy - r * 0.35, r * 0.1, r, [
    [0, E.goldHi], [0.55, '#D8A33A'], [1, '#7C5514'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.86, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(90,58,10,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.86, r * 0.74, 0, 0, TAU);
  ctx.stroke();
  txt(ctx, '1 G', cx, cy + r * 0.12, {
    size: r * 0.34, font: F.num, color: 'rgba(74,46,8,0.6)', align: 'center',
  });
  // rim light
  ctx.strokeStyle = 'rgba(255,240,200,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.86, 0, Math.PI * 1.05, Math.PI * 1.75);
  ctx.stroke();
  ctx.restore();
}

/** an LED price plate: dark glass, warm digits, a few scan lines */
export function ledPlate(ctx, x, y, w, h, text, { a = 1, size = 96, color = E.goldHi, label = '', align = 'center' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  fillRR(ctx, x, y, w, h, 14, 'rgba(4,6,10,0.92)');
  strokeRR(ctx, x, y, w, h, 14, 'rgba(232,180,74,0.28)', 2);
  ctx.save();
  ctx.shadowColor = hexA(color, 0.55);
  ctx.shadowBlur = 26;
  txt(ctx, text, align === 'center' ? x + w / 2 : x + 28, y + h / 2 + size * 0.34, {
    size, font: F.num6, color, align, track: 1,
  });
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let yy = y + 6; yy < y + h - 6; yy += 4) ctx.fillRect(x + 4, yy, w - 8, 1);
  if (label) {
    tracking(ctx, label, x + w / 2, y + h + 30, {
      size: 19, font: F.mono6, track: 5, color: hexA(E.bone, 0.4), align: 'center',
    });
  }
  ctx.restore();
}

/** small editorial caption chip used for annotations on charts */
export function chip(ctx, text, x, y, { a = 1, color = E.ember, align = 'left', size = 18 } = {}) {
  if (a <= 0.002) return;
  const pad = 16;
  const tw = measure(ctx, text, size, F.mono6, 2) + pad * 2;
  const bx = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
  ctx.save();
  ctx.globalAlpha *= a;
  fillRR(ctx, bx, y - 24, tw, 40, 6, hexA(color, 0.12));
  strokeRR(ctx, bx, y - 24, tw, 40, 6, hexA(color, 0.55), 1.2);
  txt(ctx, text, bx + pad, y + 3, { size, font: F.mono6, color, track: 2 });
  ctx.restore();
}

/** a hairline chart bed: grid + baseline, no axes labels */
export function chartBed(ctx, x, y, w, h, { a = 1, rows = 4, cols = 8, color = E.line } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  for (let r = 0; r <= rows; r++) {
    ctx.fillStyle = r === rows ? hexA(E.bone, 0.16) : color;
    ctx.fillRect(x, y + (h * r) / rows, w, r === rows ? 1.6 : 1);
  }
  for (let c = 0; c <= cols; c++) {
    ctx.fillStyle = E.hair;
    ctx.fillRect(x + (w * c) / cols, y, 1, h);
  }
  ctx.restore();
}

/** draws a polyline progressively, 0..1 */
export function path(ctx, pts, p, { color = E.gold, lw = 5, glow = 0, fill = null } = {}) {
  if (p <= 0.001) return;
  const n = pts.length - 1;
  const upto = clamp(p) * n;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= n; i++) {
    const seg = clamp(upto - (i - 1));
    if (seg <= 0) break;
    const x = lerp(pts[i - 1][0], pts[i][0], seg);
    const y = lerp(pts[i - 1][1], pts[i][1], seg);
    ctx.lineTo(x, y);
  }
  if (fill) {
    const last = clamp(upto);
    const li = Math.floor(last);
    const lx = lerp(pts[li][0], pts[Math.min(n, li + 1)][0], last - li);
    ctx.save();
    ctx.lineTo(lx, pts[0][1] + fill.h);
    ctx.lineTo(pts[0][0], pts[0][1] + fill.h);
    ctx.closePath();
    ctx.fillStyle = fill.g;
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    // rebuild the stroke path (it was consumed by the fill close)
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= n; i++) {
      const seg = clamp(upto - (i - 1));
      if (seg <= 0) break;
      ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], seg), lerp(pts[i - 1][1], pts[i][1], seg));
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (glow) {
    ctx.shadowColor = hexA(color, 0.55);
    ctx.shadowBlur = glow;
  }
  ctx.stroke();
  ctx.restore();
}
