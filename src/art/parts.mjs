import { W, H, C, F_ } from './consts.mjs';
import { F } from '../engine/fonts.mjs';
import {
  hexA, rr, fillRR, strokeRR, linGrad, radGrad, txt, tracking, measure, burst,
} from '../engine/draw.mjs';
import { rng, clamp, lerp, noise1, EASE, spring } from '../engine/anim.mjs';

/* ---------------------------------- sky ---------------------------------- */

export function duskSky(ctx, t, o = {}) {
  const { top = 0, bottom = 1800, horizon = 1240, warm = C.ember } = o;
  const g = linGrad(ctx, 0, top, 0, bottom, [
    [0, '#07070F'],
    [0.34, '#12101F'],
    [0.6, '#2A1730'],
    [0.78, '#472033'],
    [0.92, '#6E2F2A'],
    [1, '#8A3E22'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, top, W, bottom - top);

  // horizon sun glow
  const gg = radGrad(ctx, W * 0.62, horizon, 0, W * 0.95, [
    [0, hexA(warm, 0.45)],
    [0.35, hexA('#FF8A3D', 0.16)],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = gg;
  ctx.fillRect(0, top, W, bottom - top);

  // stars
  const r = rng(31);
  ctx.save();
  for (let i = 0; i < 130; i++) {
    const x = r() * W;
    const y = r() * 780;
    const a = (0.12 + r() * 0.5) * (0.6 + 0.4 * Math.sin(t * (0.6 + r()) + i));
    ctx.globalAlpha = a * (1 - y / 900);
    ctx.fillStyle = '#FFE9CC';
    ctx.beginPath();
    ctx.arc(x, y, 0.9 + r() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // haze bands
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const y = horizon - 120 - i * 90;
    const h = 70 + i * 30;
    const hg = linGrad(ctx, 0, y, 0, y + h, [
      [0, 'rgba(255,150,90,0)'],
      [0.5, `rgba(255,150,90,${0.05 + i * 0.012})`],
      [1, 'rgba(255,150,90,0)'],
    ]);
    ctx.fillStyle = hg;
    ctx.fillRect(0, y, W, h);
  }
  ctx.restore();
}

export function cityLayers(ctx, t, o = {}) {
  const {
    baseY = 1320, color = '#0A0913', seed = 11, count = 16, hMin = 120, hMax = 420,
    windowColor = '#FFC27A', windowAlpha = 0.55, parallax = 0, rim = 0.22, cool = '#9FD8FF',
  } = o;
  const r = rng(seed);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const bw = 74 + r() * 140;
    const bh = hMin + r() * (hMax - hMin);
    const x = (W / count) * i - 70 + r() * 46 + parallax;
    const y = baseY - bh;
    ctx.fillStyle = color;
    fillRR(ctx, x, y, bw, bh + 240, 3, color);
    // roof hardware
    if (r() > 0.55) fillRR(ctx, x + bw * (0.2 + r() * 0.5), y - 26 - r() * 40, 5, 40, 2, color);
    if (r() > 0.75) fillRR(ctx, x + bw * 0.62, y - 16, bw * 0.28, 16, 2, color);
    // rim light from the horizon
    ctx.globalAlpha = rim * (0.5 + 0.5 * r());
    ctx.fillStyle = '#FFB069';
    ctx.fillRect(x + 2, y, bw - 4, 2.5);
    ctx.globalAlpha = 1;
    // windows
    const cols = Math.max(2, Math.floor((bw - 16) / 24));
    const rows = Math.max(3, Math.floor(bh / 30));
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        if (r() > 0.42) continue;
        const wx = x + 12 + cx * ((bw - 20) / cols);
        const wy = y + 14 + cy * 30;
        const flick = 0.5 + 0.5 * Math.sin(t * (0.25 + r()) + cx * 1.7 + cy * 0.9);
        ctx.globalAlpha = windowAlpha * (0.35 + 0.65 * flick) * (0.5 + 0.5 * r());
        ctx.fillStyle = r() > 0.86 ? cool : windowColor;
        ctx.fillRect(wx, wy, 7 + r() * 6, 10 + r() * 4);
      }
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function rain(ctx, t, o = {}) {
  const {
    count = 170, seed = 5, alpha = 0.5, speed = 1700, y0 = -60, y1 = 1760,
    color = 'rgba(210,228,255,0.75)', windX = 0.22, thick = 2,
  } = o;
  const r = rng(seed);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const px = r() * (W + 200) - 100;
    const base = r();
    const len = 60 + r() * 120;
    const y = y0 + ((base * (y1 - y0) + t * speed * (0.7 + r() * 0.6)) % (y1 - y0));
    ctx.globalAlpha = alpha * (0.25 + r() * 0.75);
    ctx.lineWidth = thick * (0.5 + r());
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px - len * windX, y + len);
    ctx.stroke();
  }
  ctx.restore();
}

export function wetRoad(ctx, t, o = {}) {
  const { y = 1560, height = 400, color = '#100A0C', glow = C.ember } = o;
  const g = linGrad(ctx, 0, y - 60, 0, y + height, [
    [0, 'rgba(16,10,12,0)'],
    [0.18, color],
    [1, '#05040A'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 60, W, height + 60);
  // reflection streaks
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const r = rng(77);
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const w = 8 + r() * 46;
    const a = 0.04 + r() * 0.1;
    const gg = linGrad(ctx, 0, y, 0, y + 220 * (0.5 + r()), [
      [0, hexA(glow, a * (0.7 + 0.3 * Math.sin(t * 1.6 + i)))],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = gg;
    ctx.fillRect(x, y, w, 220);
  }
  ctx.restore();
}

/* -------------------------------- glyphs -------------------------------- */

export function glyphPump(ctx, x, y, s, color = C.ink1, accent = C.ember) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // body
  rr(ctx, 0.08, 0.12, 0.5, 0.78, 0.06);
  ctx.fillStyle = color;
  ctx.fill();
  // screen
  fillRR(ctx, 0.15, 0.22, 0.36, 0.22, 0.03, accent);
  fillRR(ctx, 0.15, 0.52, 0.36, 0.16, 0.03, hexA('#FFFFFF', 0.28));
  // hose
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.075;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0.58, 0.3);
  ctx.bezierCurveTo(0.95, 0.34, 0.98, 0.62, 0.74, 0.7);
  ctx.stroke();
  // nozzle
  fillRR(ctx, 0.68, 0.68, 0.16, 0.12, 0.03, color);
  ctx.restore();
}

export function glyphPlane(ctx, x, y, s, color = C.ink1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  // fuselage
  ctx.beginPath();
  ctx.moveTo(0.05, 0.56);
  ctx.quadraticCurveTo(0.1, 0.42, 0.3, 0.4);
  ctx.lineTo(0.86, 0.4);
  ctx.quadraticCurveTo(0.97, 0.42, 0.97, 0.52);
  ctx.quadraticCurveTo(0.97, 0.62, 0.85, 0.63);
  ctx.lineTo(0.3, 0.63);
  ctx.quadraticCurveTo(0.1, 0.62, 0.05, 0.56);
  ctx.closePath();
  ctx.fill();
  // wing
  ctx.beginPath();
  ctx.moveTo(0.44, 0.62);
  ctx.lineTo(0.66, 0.92);
  ctx.lineTo(0.56, 0.92);
  ctx.lineTo(0.3, 0.63);
  ctx.closePath();
  ctx.fill();
  // tail
  ctx.beginPath();
  ctx.moveTo(0.06, 0.55);
  ctx.lineTo(0.02, 0.2);
  ctx.lineTo(0.14, 0.2);
  ctx.lineTo(0.2, 0.55);
  ctx.closePath();
  ctx.fill();
  // windows
  ctx.fillStyle = hexA('#FFFFFF', 0.85);
  for (let i = 0; i < 7; i++) ctx.fillRect(0.3 + i * 0.07, 0.47, 0.035, 0.035);
  ctx.restore();
}

export function glyphBasket(ctx, x, y, s, color = C.ink1, accent = C.ember) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.055;
  ctx.lineCap = 'round';
  // handle
  ctx.beginPath();
  ctx.arc(0.5, 0.36, 0.26, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();
  // body
  ctx.beginPath();
  ctx.moveTo(0.12, 0.38);
  ctx.lineTo(0.88, 0.38);
  ctx.lineTo(0.78, 0.9);
  ctx.lineTo(0.22, 0.9);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  // weave
  ctx.strokeStyle = hexA('#FFFFFF', 0.25);
  ctx.lineWidth = 0.02;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0.14 + i * 0.02, 0.38 + i * 0.13);
    ctx.lineTo(0.86 - i * 0.02, 0.38 + i * 0.13);
    ctx.stroke();
  }
  // items poking out
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(0.34, 0.33, 0.11, 0.14, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexA('#FFFFFF', 0.92);
  fillRR(ctx, 0.55, 0.16, 0.16, 0.24, 0.03, hexA('#FFFFFF', 0.92));
  ctx.restore();
}

/* -------------------------------- cards -------------------------------- */

export function softShadow(ctx, x, y, w, h, r, blur = 40, alpha = 0.5, oy = 18) {
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = oy;
  fillRR(ctx, x, y, w, h, r, '#000');
  ctx.restore();
}

/** Paper card with a warm gradient, hairline border and optional corner fold. */
export function paperCard(ctx, x, y, w, h, r, o = {}) {
  const { rot = 0, scale = 1, alpha = 1, tint = '#F8F3E8', tint2 = '#E9E1D2', border = 'rgba(0,0,0,0.10)' } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 18;
  const g = linGrad(ctx, 0, 0, w * 0.4, h, [
    [0, tint],
    [1, tint2],
  ]);
  fillRR(ctx, 0, 0, w, h, r, g);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  strokeRR(ctx, 0.5, 0.5, w - 1, h - 1, r, border, 2);
  // top light
  const gl = linGrad(ctx, 0, 0, 0, h * 0.3, [
    [0, 'rgba(255,255,255,0.55)'],
    [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillStyle = gl;
  rr(ctx, 0, 0, w, h * 0.3, r);
  ctx.fill();
  ctx.restore();
  return { x, y, w, h, r };
}

export function darkCard(ctx, x, y, w, h, r, o = {}) {
  const { rot = 0, scale = 1, alpha = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 20;
  const g = linGrad(ctx, 0, 0, w * 0.2, h, [
    [0, '#171A24'],
    [0.55, '#0C0E15'],
    [1, '#070810'],
  ]);
  fillRR(ctx, 0, 0, w, h, r, g);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  strokeRR(ctx, 1, 1, w - 2, h - 2, r, 'rgba(255,255,255,0.14)', 2);
  // inner top gloss
  const gl = linGrad(ctx, 0, 0, 0, h * 0.45, [
    [0, 'rgba(255,255,255,0.10)'],
    [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillStyle = gl;
  rr(ctx, 1, 1, w - 2, h * 0.45, r);
  ctx.fill();
  ctx.restore();
  return { x, y, w, h, r };
}

export function badge(ctx, s, x, y, o = {}) {
  const {
    size = 38, bg = C.red, color = '#fff', padX = 22, padY = 12, radius = 12,
    align = 'center', track = 1, font = F.num, rot = 0, alpha = 1, glowBlur = 0,
  } = o;
  const tw = measure(ctx, s, size, font, track);
  const w = tw + padX * 2 + track;
  const h = size + padY * 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  const x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
  if (glowBlur) {
    ctx.shadowColor = hexA(bg.startsWith('#') ? bg : C.red, 0.55);
    ctx.shadowBlur = glowBlur;
  }
  fillRR(ctx, x0, -h / 2, w, h, radius, bg);
  ctx.shadowBlur = 0;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  ctx.fillStyle = color;
  ctx.fillText(s, x0 + padX, 2);
  ctx.restore();
  return { w, h };
}

/** Huge outlined wordmark used as a background texture. */
export function giantWord(ctx, s, x, y, size, o = {}) {
  const { color = C.bone, alpha = 0.1, stroke = 3, font = F.display, track = -6, fill = null } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillText(s, x, y);
  }
  if (stroke) {
    ctx.strokeStyle = color;
    ctx.lineWidth = stroke;
    ctx.strokeText(s, x, y);
  }
  ctx.restore();
}

/** Spotlight cone from the top of the frame. */
export function spotlight(ctx, x, top, width, bottomY, o = {}) {
  const { color = '#FFE0B0', alpha = 0.16 } = o;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(0, top, 0, bottomY);
  g.addColorStop(0, hexA(color, alpha * 1.2));
  g.addColorStop(0.55, hexA(color, alpha * 0.5));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.16, top);
  ctx.lineTo(x + width * 0.16, top);
  ctx.lineTo(x + width, bottomY);
  ctx.lineTo(x - width, bottomY);
  ctx.closePath();
  ctx.fill();

  // pool of light on the floor
  const pg = radGrad(ctx, x, bottomY, 0, width, [
    [0, hexA(color, alpha * 1.1)],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.ellipse(x, bottomY, width, width * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function dustMotes(ctx, t, o = {}) {
  const { count = 60, area = [0, 0, W, H], color = '#FFE2B8', alpha = 0.4, seed = 3 } = o;
  const r = rng(seed);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const bx = area[0] + r() * area[2];
    const by = area[1] + r() * area[3];
    const sp = 6 + r() * 22;
    const y = by - ((t * sp) % area[3]);
    const yy = y < area[1] ? y + area[3] : y;
    const x = bx + Math.sin(t * 0.4 + i) * 18;
    ctx.globalAlpha = alpha * (0.2 + r() * 0.8) * (0.5 + 0.5 * Math.sin(t * 1.2 + i));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, yy, 1 + r() * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Rubber-stamp style rotated label. */
export function stamp(ctx, s, x, y, o = {}) {
  const {
    size = 46, color = C.red, rot = -0.22, alpha = 1, font = F.display, padX = 26, padY = 14,
    border = true, scale = 1, track = 3,
  } = o;
  const tw = measure(ctx, s, size, font, track);
  const w = tw + padX * 2 + track;
  const h = size + padY * 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  if (border) {
    strokeRR(ctx, -w / 2, -h / 2, w, h, 8, color, 5);
    strokeRR(ctx, -w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 5, hexA(color, 0.55), 2);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  ctx.fillText(s, 0, 3);
  ctx.restore();
}

/** Out-of-focus city lights for depth in the lower third. */
export function bokeh(ctx, t, o = {}) {
  const {
    count = 16, seed = 12, y0 = 900, y1 = 1750, alpha = 0.16,
    colors = ['#FFB067', '#FF7A4D', '#FFD9A0', '#7FC8FF'],
  } = o;
  const r = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const y = y0 + r() * (y1 - y0);
    const rad = 40 + r() * 120;
    const a = alpha * (0.3 + r() * 0.7) * (0.65 + 0.35 * Math.sin(t * (0.3 + r() * 0.5) + i));
    const col = colors[Math.floor(r() * colors.length)];
    const g = radGrad(ctx, x, y, 0, rad, [
      [0, hexA(col, a)],
      [0.55, hexA(col, a * 0.45)],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
