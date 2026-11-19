// Episode 25 v2 — the lab props, drawn like an illustrated explainer.
//
// Everything here is flat 2D illustration with light: soft gradients, a key
// light from the upper left, specular streaks, paper and plastic grain from one
// baked noise tile, and contact shadows. No 3D, no bitmaps from outside.
//   tag        in-art number label ("$100 a barrel" style), pops with overshoot
//   ribbon     a folded banner label
//   bloodBag   a donor bag with liquid, tubing, a printed sticker, a strike
//   typingCard the plastic typing card: reagent chips, wells, printed labels
//   dropper    a glass pipette with a drop that forms and falls
//   loupe      a magnifier that redraws what is under it, enlarged
//   paperCard  an old index card with typewriter lines
import { createCanvas } from '@napi-rs/canvas';
import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { fbm3 } from './_earth.mjs';
import { roll } from './_bulan.mjs';

const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const back = (p) => {
  const c = 1.9;
  const x = clamp(p) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/* ------------------------------- texture --------------------------------- */

let NOISE = null;
function noiseTile() {
  if (NOISE) return NOISE;
  const s = 256;
  const c = createCanvas(s, s);
  const x = c.getContext('2d');
  const img = x.createImageData(s, s);
  const r = rng(2501);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 120;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  NOISE = c;
  return c;
}

/** grain over whatever path is current (call after building the path) */
export function grain(ctx, a = 0.12, op = 'overlay') {
  ctx.save();
  ctx.clip();
  ctx.globalAlpha *= a;
  ctx.globalCompositeOperation = op;
  ctx.fillStyle = ctx.createPattern(noiseTile(), 'repeat');
  ctx.fillRect(-4000, -4000, 8000, 8000);
  ctx.restore();
}

export function rr(ctx, x, y, w, h, r) {
  const q = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q);
  ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q);
  ctx.arcTo(x, y, x + w, y, q);
  ctx.closePath();
}

/** soft contact shadow under an object */
export function contact(ctx, x, y, w, h, a = 0.5) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, w / 2);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.translate(x, y);
  ctx.scale(1, h / w);
  ctx.beginPath();
  ctx.arc(0, 0, w / 2, 0, TAU);
  ctx.translate(-x, -y);
  ctx.fill();
  ctx.restore();
}

function text(ctx, s, x, y, { size = 40, font = F.fig8, color = '#fff', align = 'left', alpha = 1, track = 0 } = {}) {
  if (alpha <= 0.004) return 0;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  let w = ctx.measureText(s).width + track * Math.max(0, s.length - 1);
  let x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  if (!track) ctx.fillText(s, x0, y);
  else for (const ch of s) { ctx.fillText(ch, x0, y); x0 += ctx.measureText(ch).width + track; }
  ctx.restore();
  return w;
}
export { text as labText };

/* --------------------------------- tag ----------------------------------- */

/**
 * In-art number label: a dark glass pill, the figure big in the accent colour,
 * a small word after it. Pops in with overshoot, a sheen crosses it once.
 */
export function tag(ctx, x, y, p, {
  big = '', small = '', color = '#FFB03A', size = 132, smallSize = null, align = 'center', a = 1,
  sub = '', subColor = 'rgba(243,239,228,0.72)', icon = null, glowRgb = null,
  count = null, pre = '',
} = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.004) return null;
  const ss = smallSize || Math.round(size * 0.36);
  ctx.save();
  ctx.font = `${size}px ${F.fig8}`;
  let bw = ctx.measureText(big).width;
  let dW = 0;
  let preW = 0;
  if (count) {
    // an odometer inside the pill: the pill is sized for the final figure
    dW = Math.max(...'0123456789'.split('').map((c) => ctx.measureText(c).width)) - 2;
    preW = pre ? ctx.measureText(pre).width + size * 0.08 : 0;
    bw = preW + dW * count.digits;
  }
  ctx.font = `${ss}px ${F.fig6}`;
  const sw = small ? ctx.measureText(small).width : 0;
  const iconW = icon ? size * 0.62 : 0;
  const padX = size * 0.3;
  const gap = small ? size * 0.16 : 0;
  const w = padX * 2 + iconW + bw + gap + sw;
  const h = size * 1.12;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const y0 = y - h / 2;
  const k = 0.72 + 0.28 * back(Math.min(1, q * 1.25));
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-x, -y);
  ctx.globalAlpha *= a * clamp(q * 2.2);
  if (glowRgb) {
    const g = ctx.createRadialGradient(x0 + w / 2, y, 0, x0 + w / 2, y, w * 0.75);
    g.addColorStop(0, `rgba(${glowRgb},0.3)`);
    g.addColorStop(1, `rgba(${glowRgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x0 - w * 0.3, y - w * 0.75, w * 1.6, w * 1.5);
  }
  // body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  rr(ctx, x0, y0, w, h, h * 0.24);
  const bg = ctx.createLinearGradient(0, y0, 0, y0 + h);
  bg.addColorStop(0, 'rgba(30,26,40,0.94)');
  bg.addColorStop(1, 'rgba(10,8,16,0.94)');
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();
  rr(ctx, x0, y0, w, h, h * 0.24);
  grain(ctx, 0.1);
  rr(ctx, x0 + 1.5, y0 + 1.5, w - 3, h - 3, h * 0.24);
  ctx.lineWidth = 2.5;
  const eg = ctx.createLinearGradient(0, y0, 0, y0 + h);
  eg.addColorStop(0, 'rgba(255,255,255,0.28)');
  eg.addColorStop(1, 'rgba(255,255,255,0.06)');
  ctx.strokeStyle = eg;
  ctx.stroke();
  // content
  let cx = x0 + padX;
  if (icon) {
    icon(ctx, cx + iconW * 0.42, y, size * 0.5);
    cx += iconW;
  }
  const by = y + size * 0.36;
  ctx.save();
  ctx.shadowColor = glowRgb ? `rgba(${glowRgb},0.55)` : 'rgba(0,0,0,0)';
  ctx.shadowBlur = glowRgb ? 26 : 0;
  if (count) {
    if (pre) text(ctx, pre, cx, by, { size, font: F.fig8, color, alpha: count.preA ?? 1 });
    roll(ctx, count.value, cx + bw, by, { size, font: F.fig8, color, align: 'right', prev: count.prev, track: -2, decimals: count.decimals || 0 });
  } else text(ctx, big, cx, by, { size, font: F.fig8, color });
  ctx.restore();
  if (small) text(ctx, small, cx + bw + gap, by, { size: ss, font: F.fig6, color: '#F3EFE4' });
  // sheen
  const sp = clamp((q - 0.45) / 0.55);
  if (sp > 0 && sp < 1) {
    ctx.save();
    rr(ctx, x0, y0, w, h, h * 0.24);
    ctx.clip();
    const sx = x0 - w * 0.4 + sp * w * 1.8;
    const sg = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,255,255,0.16)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(x0, y0, w, h);
    ctx.restore();
  }
  ctx.restore();
  if (sub) text(ctx, sub, x0 + w / 2, y0 + h + 58, { size: 34, font: F.fig6, color: subColor, align: 'center', alpha: a * clamp((q - 0.3) / 0.5), track: 1 });
  return { x: x0, y: y0, w, h };
}

/* -------------------------------- ribbon --------------------------------- */

/** a folded banner, unfurling from its centre (ref: "STRAIT OF HORMUZ") */
export function ribbon(ctx, x, y, s, p, { color = '#F2B33D', dark = '#B9781C', ink = '#2B1A08', size = 34, rot = -0.05, a = 1 } = {}) {
  const q = eo(p);
  if (q <= 0.01 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `${size}px ${F.fig8}`;
  const tw = ctx.measureText(s).width + s.length * 2;
  const w = (tw + size * 1.4) * q;
  const h = size * 1.6;
  // tails behind
  const tail = h * 0.8;
  ctx.fillStyle = dark;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    const ex = dir * (w / 2 - 6);
    ctx.moveTo(ex, -h / 2 + 12);
    ctx.lineTo(ex + dir * tail, -h / 2 + 12);
    ctx.lineTo(ex + dir * tail * 0.62, 12);
    ctx.lineTo(ex + dir * tail, h / 2 + 12);
    ctx.lineTo(ex, h / 2 + 12);
    ctx.closePath();
    ctx.fill();
  }
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.beginPath();
  ctx.rect(-w / 2, -h / 2, w, h);
  grain(ctx, 0.16);
  const hg = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  hg.addColorStop(0, 'rgba(255,255,255,0.28)');
  hg.addColorStop(0.5, 'rgba(255,255,255,0)');
  hg.addColorStop(1, 'rgba(0,0,0,0.14)');
  ctx.fillStyle = hg;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-w / 2, -h / 2, w, h);
  ctx.clip();
  text(ctx, s, 0, size * 0.36, { size, font: F.fig8, color: ink, align: 'center', track: 2, alpha: clamp((q - 0.4) / 0.6) });
  ctx.restore();
  ctx.restore();
}

/* ------------------------------- blood bag -------------------------------- */

const TYPE_INK = { A: '#2F6BD8', B: '#D89A16', AB: '#8A4BD8', O: '#D8402F' };

/**
 * A donor bag. (x, y) is the centre of the body; h its height.
 * o: type, rh ('+','−',''), level 0..1, p (enter), t, strike 0..1, dim 0..1,
 *    tube (side), sticker true/false, glow.
 */
export function bloodBag(ctx, x, y, h, o = {}) {
  const { type = 'A', rh = '', level = 0.82, p = 1, t = 0, strike = 0, dim = 0, tube = 1, a = 1, gold = false, question = false } = o;
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.004) return;
  const w = h * 0.66;
  const x0 = x - w / 2;
  const y0 = y - h / 2;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.8);
  const k = 0.9 + 0.1 * back(q);
  ctx.translate(x, y + (1 - eo(q)) * 60);
  ctx.scale(k, k);
  ctx.translate(-x, -y);

  contact(ctx, x, y0 + h + h * 0.2, w * 1.25, h * 0.12, 0.55);

  // tube: from the bottom port, a loose loop off to one side
  const px = x - w * 0.18;
  const py = y0 + h + h * 0.05;
  ctx.save();
  ctx.lineCap = 'round';
  const tubePath = () => {
    // a short coil that hangs under its own bag, inside its width
    const s2 = tube >= 0 ? 1 : -1;
    const ox = px + (s2 < 0 ? w * 0.36 : 0);
    ctx.beginPath();
    ctx.moveTo(ox, py);
    ctx.bezierCurveTo(ox - s2 * w * 0.03, py + h * 0.13, ox + s2 * w * 0.22, py + h * 0.17, ox + s2 * w * 0.3, py + h * 0.08);
    ctx.bezierCurveTo(ox + s2 * w * 0.34, py + h * 0.02, ox + s2 * w * 0.2, py + h * 0.0, ox + s2 * w * 0.18, py + h * 0.07);
    ctx.bezierCurveTo(ox + s2 * w * 0.16, py + h * 0.15, ox + s2 * w * 0.34, py + h * 0.2, ox + s2 * w * 0.44, py + h * 0.15);
  };
  tubePath();
  ctx.strokeStyle = 'rgba(235,240,245,0.5)';
  ctx.lineWidth = h * 0.05;
  ctx.stroke();
  tubePath();
  ctx.strokeStyle = gold ? '#B98A1E' : '#7E0A16';
  ctx.lineWidth = h * 0.032;
  ctx.stroke();
  tubePath();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = h * 0.008;
  ctx.stroke();
  ctx.restore();

  // ports
  for (const [dx, cap] of [[-0.18, null], [0.08, '#E8EEF4'], [0.26, '#4F86E8']]) {
    const tx = x + w * dx;
    ctx.fillStyle = 'rgba(232,238,244,0.75)';
    rr(ctx, tx - h * 0.022, y0 + h - 4, h * 0.044, h * 0.075, h * 0.012);
    ctx.fill();
    if (cap) {
      ctx.fillStyle = cap;
      rr(ctx, tx - h * 0.028, y0 + h + h * 0.06, h * 0.056, h * 0.05, h * 0.014);
      ctx.fill();
    }
  }

  // hanger tab with its hole
  ctx.save();
  rr(ctx, x - w * 0.36, y0 - h * 0.11, w * 0.72, h * 0.14, h * 0.035);
  ctx.fillStyle = 'rgba(232,238,244,0.32)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.globalCompositeOperation = 'destination-out';
  rr(ctx, x - w * 0.12, y0 - h * 0.075, w * 0.24, h * 0.045, h * 0.022);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  rr(ctx, x - w * 0.12, y0 - h * 0.075, w * 0.24, h * 0.045, h * 0.022);
  ctx.stroke();

  // body outline: a soft pillow
  const body = () => {
    const bulge = w * 0.035;
    ctx.beginPath();
    ctx.moveTo(x0 + w * 0.08, y0);
    ctx.lineTo(x0 + w * 0.92, y0);
    ctx.quadraticCurveTo(x0 + w + bulge * 0.4, y0, x0 + w, y0 + h * 0.08);
    ctx.quadraticCurveTo(x0 + w + bulge, y0 + h * 0.5, x0 + w, y0 + h * 0.9);
    ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w * 0.88, y0 + h);
    ctx.lineTo(x0 + w * 0.12, y0 + h);
    ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h * 0.9);
    ctx.quadraticCurveTo(x0 - bulge, y0 + h * 0.5, x0, y0 + h * 0.08);
    ctx.quadraticCurveTo(x0 - bulge * 0.4, y0, x0 + w * 0.08, y0);
    ctx.closePath();
  };
  body();
  ctx.fillStyle = 'rgba(226,234,242,0.16)';
  ctx.fill();

  // liquid
  ctx.save();
  body();
  ctx.clip();
  const ly = y0 + h * (1 - level);
  const wob = 5 + 3 * Math.sin(t * 1.7);
  ctx.beginPath();
  ctx.moveTo(x0 - 20, ly);
  for (let i = 0; i <= 24; i++) {
    const xx = x0 - 20 + ((w + 40) * i) / 24;
    ctx.lineTo(xx, ly + Math.sin(i * 0.7 + t * 2.4) * wob * 0.5 + Math.sin(i * 0.31 - t * 1.3) * wob * 0.4);
  }
  ctx.lineTo(x0 + w + 20, y0 + h + 20);
  ctx.lineTo(x0 - 20, y0 + h + 20);
  ctx.closePath();
  const lg = ctx.createLinearGradient(x0, ly, x0 + w, y0 + h);
  if (gold) {
    lg.addColorStop(0, '#F6CF5A');
    lg.addColorStop(0.5, '#D49A22');
    lg.addColorStop(1, '#8C5A0C');
  } else {
    lg.addColorStop(0, '#C0182A');
    lg.addColorStop(0.55, '#8E0A1C');
    lg.addColorStop(1, '#4E0410');
  }
  ctx.fillStyle = lg;
  ctx.fill();
  // depth at the edges of the liquid
  const eg = ctx.createLinearGradient(x0, 0, x0 + w, 0);
  eg.addColorStop(0, 'rgba(30,0,6,0.45)');
  eg.addColorStop(0.18, 'rgba(30,0,6,0)');
  eg.addColorStop(0.82, 'rgba(30,0,6,0)');
  eg.addColorStop(1, 'rgba(30,0,6,0.5)');
  ctx.fillStyle = eg;
  ctx.fillRect(x0, ly - 20, w, h);
  // meniscus light
  ctx.strokeStyle = gold ? 'rgba(255,240,180,0.7)' : 'rgba(255,120,120,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const xx = x0 - 20 + ((w + 40) * i) / 24;
    const yy = ly + Math.sin(i * 0.7 + t * 2.4) * wob * 0.5 + Math.sin(i * 0.31 - t * 1.3) * wob * 0.4 + 3;
    if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
  }
  ctx.stroke();
  ctx.restore();

  // welded seams
  ctx.strokeStyle = 'rgba(255,255,255,0.32)';
  ctx.lineWidth = 2;
  for (const yy of [y0 + h * 0.045, y0 + h * 0.07]) {
    ctx.beginPath();
    ctx.moveTo(x0 + w * 0.06, yy);
    ctx.lineTo(x0 + w * 0.94, yy);
    ctx.stroke();
  }
  // plastic edge and grain
  body();
  grain(ctx, 0.14);
  body();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(255,255,255,0.62)';
  ctx.stroke();
  // specular streaks
  ctx.save();
  body();
  ctx.clip();
  const sg = ctx.createLinearGradient(x0 + w * 0.06, 0, x0 + w * 0.2, 0);
  sg.addColorStop(0, 'rgba(255,255,255,0)');
  sg.addColorStop(0.5, 'rgba(255,255,255,0.42)');
  sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg;
  rr(ctx, x0 + w * 0.06, y0 + h * 0.1, w * 0.14, h * 0.78, w * 0.07);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(x0 + w * 0.8, y0 + h * 0.16, w * 0.05, h * 0.035, -0.5, 0, TAU);
  ctx.fill();
  const rg = ctx.createLinearGradient(x0 + w * 0.72, 0, x0 + w * 0.96, 0);
  rg.addColorStop(0, 'rgba(255,255,255,0)');
  rg.addColorStop(1, 'rgba(255,255,255,0.16)');
  ctx.fillStyle = rg;
  ctx.fillRect(x0 + w * 0.72, y0, w * 0.3, h);
  ctx.restore();

  // the sticker
  const sw = w * 0.74;
  const sh = h * 0.42;
  const sx = x - sw / 2;
  const sy = y0 + h * 0.4;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  rr(ctx, sx, sy, sw, sh, 10);
  ctx.fillStyle = '#F4F0E8';
  ctx.fill();
  ctx.restore();
  rr(ctx, sx, sy, sw, sh, 10);
  grain(ctx, 0.2, 'multiply');
  ctx.fillStyle = gold ? '#C9921D' : (TYPE_INK[type] || '#C8322A');
  rr(ctx, sx, sy, sw, sh * 0.16, 10);
  ctx.fill();
  ctx.fillRect(sx, sy + sh * 0.08, sw, sh * 0.08);
  text(ctx, 'DARAH UTUH', sx + sw / 2, sy + sh * 0.125, { size: sh * 0.085, font: F.mono6, color: '#FFFFFF', align: 'center', track: 2 });
  const letters = question ? `${type}?` : type;
  const lsz = sh * (letters.length > 2 ? 0.36 : letters.length > 1 ? 0.42 : 0.5);
  text(ctx, letters, sx + sw * (rh ? 0.4 : 0.5), sy + sh * 0.66, { size: lsz, font: F.fig8, color: '#1B1418', align: 'center' });
  if (rh) {
    const rx = sx + sw * 0.84;
    const ry = sy + sh * 0.5;
    ctx.fillStyle = rh === '+' ? '#1E9E78' : '#C8322A';
    ctx.beginPath();
    ctx.arc(rx, ry, sh * 0.13, 0, TAU);
    ctx.fill();
    text(ctx, rh, rx, ry + sh * 0.08, { size: sh * 0.22, font: F.fig8, color: '#FFFFFF', align: 'center' });
  }
  // barcode
  const br = rng(type.length * 31 + (rh === '+' ? 7 : 3));
  let bx = sx + sw * 0.12;
  while (bx < sx + sw * 0.62) {
    const bwid = 1.5 + br() * 3.5;
    ctx.fillStyle = 'rgba(27,20,24,0.85)';
    ctx.fillRect(bx, sy + sh * 0.76, bwid, sh * 0.15);
    bx += bwid + 1.5 + br() * 3;
  }
  text(ctx, '450 mL', sx + sw * 0.88, sy + sh * 0.9, { size: sh * 0.085, font: F.mono6, color: 'rgba(27,20,24,0.7)', align: 'right' });

  // dim: the bag fades back when struck
  if (dim > 0.001) {
    ctx.save();
    body();
    ctx.globalAlpha *= 0.5 * dim;
    ctx.fillStyle = '#1A0E12';
    ctx.fill();
    ctx.restore();
  }
  // strike: a red marker slash
  if (strike > 0.001) {
    const s = eo(strike);
    const ax = x0 - w * 0.08;
    const ay = y0 + h * 0.1;
    const bx2 = x0 + w * 1.08;
    const by2 = y0 + h * 0.92;
    const ex = lerp(ax, bx2, s);
    const ey = lerp(ay, by2, s);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#E8302A';
    ctx.lineWidth = h * 0.075;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.strokeStyle = 'rgba(255,190,170,0.5)';
    ctx.lineWidth = h * 0.014;
    ctx.beginPath();
    ctx.moveTo(ax + 4, ay - h * 0.018);
    ctx.lineTo(ex + 4, ey - h * 0.018);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/* ------------------------------ typing card ------------------------------- */

/**
 * The plastic card every sample meets. wells: [{label, chip, agg, drop, lit, litRgb}]
 * drop 0..1 spreads the blood in the well; agg 0..1 clumps it.
 */
export function typingCard(ctx, cx, cy, w, o = {}) {
  const { wells = [], p = 1, a = 1, t = 0, title = 'UJI GOLONGAN DARAH', well: drawWell } = o;
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  const h = w * 0.46;
  const x0 = cx - w / 2;
  const y0 = cy - h / 2 + (1 - q) * 80;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  contact(ctx, cx, y0 + h + 26, w * 1.05, 60, 0.55);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  rr(ctx, x0, y0, w, h, 34);
  const g = ctx.createLinearGradient(x0, y0, x0 + w * 0.3, y0 + h);
  g.addColorStop(0, '#FBF9F5');
  g.addColorStop(1, '#DAD3CA');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  rr(ctx, x0, y0, w, h, 34);
  grain(ctx, 0.18, 'multiply');
  rr(ctx, x0 + 2, y0 + 2, w - 4, h - 4, 33);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // header
  text(ctx, title, x0 + 44, y0 + 62, { size: 30, font: F.fig8, color: '#2A2226', track: 3 });
  ctx.fillStyle = '#C8322A';
  ctx.fillRect(x0 + 44, y0 + 80, 120, 5);
  text(ctx, 'NAMA ............  TGL ......', x0 + w - 44, y0 + 62, { size: 22, font: F.mono6, color: 'rgba(42,34,38,0.5)', align: 'right' });
  const n = wells.length;
  const r = Math.min(w / n * 0.3, h * 0.22);
  wells.forEach((wl, i) => {
    const wx = x0 + (w / n) * (i + 0.5);
    const wy = y0 + h * 0.56;
    // reagent chip
    ctx.fillStyle = wl.chip || '#E8E2D8';
    rr(ctx, wx - r * 0.9, y0 + h * 0.235, r * 1.8, 18, 9);
    ctx.fill();
    if (wl.lit > 0.01) {
      const gg = ctx.createRadialGradient(wx, wy, r, wx, wy, r * 2.2);
      gg.addColorStop(0, `rgba(${wl.litRgb || '95,227,192'},${0.55 * wl.lit})`);
      gg.addColorStop(1, `rgba(${wl.litRgb || '95,227,192'},0)`);
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(wx, wy, r * 2.2, 0, TAU);
      ctx.fill();
    }
    // the well, pressed into the plastic
    const wg = ctx.createRadialGradient(wx - r * 0.3, wy - r * 0.4, r * 0.2, wx, wy, r * 1.08);
    wg.addColorStop(0, '#CFC8BE');
    wg.addColorStop(1, '#F6F2EC');
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.arc(wx, wy, r * 1.08, 0, TAU);
    ctx.fill();
    if (drawWell) drawWell(ctx, wx, wy, r, wl, i);
    ctx.strokeStyle = wl.lit > 0.5 ? `rgba(${wl.litRgb || '95,227,192'},${wl.lit})` : 'rgba(120,110,100,0.5)';
    ctx.lineWidth = wl.lit > 0.5 ? 5 : 2.5;
    ctx.beginPath();
    ctx.arc(wx, wy, r * 1.08, 0, TAU);
    ctx.stroke();
    text(ctx, wl.label || '', wx, y0 + h - 40, { size: 30, font: F.fig8, color: wl.lit > 0.5 ? '#0E7C5E' : '#2A2226', align: 'center', track: 2 });
  });
  ctx.restore();
}

/* -------------------------------- dropper --------------------------------- */

/** a glass pipette, tip at (x, y); `drop` 0..1 forms a drop and lets it fall `fall` px */
export function dropper(ctx, x, y, s, { p = 1, drop = 0, fall = 160, a = 1, rot = 0.32 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a * q;
  ctx.translate(x, y);
  ctx.save();
  ctx.rotate(rot);
  // glass tube
  const tw = s * 0.16;
  const tl = s * 1.05;
  ctx.fillStyle = 'rgba(230,240,248,0.28)';
  rr(ctx, -tw / 2, -tl, tw, tl * 0.92, tw / 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-tw / 2, -tl * 0.12);
  ctx.lineTo(-tw * 0.12, 0);
  ctx.lineTo(tw * 0.12, 0);
  ctx.lineTo(tw / 2, -tl * 0.12);
  ctx.closePath();
  ctx.fill();
  // blood inside the tube
  ctx.fillStyle = '#9E0E20';
  rr(ctx, -tw * 0.32, -tl * 0.5, tw * 0.64, tl * 0.42, tw * 0.3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2.5;
  rr(ctx, -tw / 2, -tl, tw, tl * 0.92, tw / 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-tw * 0.22, -tl * 0.9);
  ctx.lineTo(-tw * 0.22, -tl * 0.2);
  ctx.stroke();
  // rubber bulb
  const bg = ctx.createRadialGradient(-s * 0.08, -tl - s * 0.32, s * 0.04, 0, -tl - s * 0.22, s * 0.3);
  bg.addColorStop(0, '#E2564A');
  bg.addColorStop(1, '#7A1810');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, -tl - s * 0.2, s * 0.17, s * 0.27, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#5C120C';
  rr(ctx, -tw * 0.75, -tl - 4, tw * 1.5, s * 0.07, 6);
  ctx.fill();
  ctx.restore();
  // the drop at the tip, then falling
  if (drop > 0.001) {
    const form = clamp(drop / 0.45);
    const fallP = clamp((drop - 0.45) / 0.55);
    const dy = fall * EASE.inQuad(fallP);
    const ds = s * 0.07 * (0.4 + 0.6 * form) * (1 - 0.2 * fallP);
    if (fallP < 1) {
      ctx.fillStyle = '#B5142A';
      ctx.beginPath();
      ctx.moveTo(0, dy - ds * 1.6);
      ctx.bezierCurveTo(ds * 0.9, dy - ds * 0.4, ds, dy + ds * 0.9, 0, dy + ds);
      ctx.bezierCurveTo(-ds, dy + ds * 0.9, -ds * 0.9, dy - ds * 0.4, 0, dy - ds * 1.6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,200,200,0.6)';
      ctx.beginPath();
      ctx.arc(-ds * 0.3, dy + ds * 0.1, ds * 0.25, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* --------------------------------- loupe ---------------------------------- */

/** a magnifier at (cx, cy), radius r; `inside(ctx)` is drawn enlarged by `zoom` about (fx, fy) */
export function loupe(ctx, cx, cy, r, p, inside, { zoom = 2.4, fx = cx, fy = cy, a = 1, handle = 0.8 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  const rad = r * (0.6 + 0.4 * back(clamp(p * 1.1)));
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.8);
  // handle
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(handle);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  const hg = ctx.createLinearGradient(-r * 0.12, 0, r * 0.12, 0);
  hg.addColorStop(0, '#2A2A30');
  hg.addColorStop(0.5, '#4A4A54');
  hg.addColorStop(1, '#16161A');
  ctx.fillStyle = hg;
  rr(ctx, -r * 0.11, rad * 1.02, r * 0.22, r * 0.95, r * 0.08);
  ctx.fill();
  ctx.restore();
  // lens content
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, TAU);
  ctx.clip();
  ctx.fillStyle = '#1A0408';
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.translate(-fx, -fy);
  inside(ctx);
  ctx.restore();
  // glass: a curved reflection and a darker rim inside
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, TAU);
  ctx.clip();
  const ig = ctx.createRadialGradient(cx, cy, rad * 0.65, cx, cy, rad);
  ig.addColorStop(0, 'rgba(0,0,0,0)');
  ig.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = ig;
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = rad * 0.06;
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 0.8, Math.PI * 1.08, Math.PI * 1.42);
  ctx.stroke();
  ctx.lineWidth = rad * 0.025;
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 0.8, Math.PI * 1.5, Math.PI * 1.58);
  ctx.stroke();
  ctx.restore();
  // metal rim
  const mg = ctx.createLinearGradient(cx - rad, cy - rad, cx + rad, cy + rad);
  mg.addColorStop(0, '#F2F4F8');
  mg.addColorStop(0.45, '#8C9098');
  mg.addColorStop(0.55, '#5A5E66');
  mg.addColorStop(1, '#D8DCE2');
  ctx.strokeStyle = mg;
  ctx.lineWidth = rad * 0.1;
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 1.04, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 0.99, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------- paper card ------------------------------- */

/** an old index card: lines of typewriter text, slightly turned */
export function paperCard(ctx, cx, cy, w, h, p, { rot = -0.04, lines = [], a = 1, t = 0, paper = '#E9DFC8', ruled = true, flag = null, age = 0.32 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  ctx.translate(cx, cy + (1 - q) * 120);
  ctx.rotate(rot * (0.4 + 0.6 * q));
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 16;
  rr(ctx, -w / 2, -h / 2, w, h, 10);
  ctx.fillStyle = paper;
  ctx.fill();
  ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 10);
  grain(ctx, 0.35, 'multiply');
  // age: darker edges, a coffee-brown corner
  ctx.save();
  rr(ctx, -w / 2, -h / 2, w, h, 10);
  ctx.clip();
  const vg = ctx.createRadialGradient(0, 0, Math.min(w, h) * 0.3, 0, 0, Math.max(w, h) * 0.65);
  vg.addColorStop(0, 'rgba(120,80,30,0)');
  vg.addColorStop(1, `rgba(120,80,30,${age})`);
  ctx.fillStyle = vg;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  if (ruled) {
    ctx.strokeStyle = 'rgba(80,110,160,0.25)';
    ctx.lineWidth = 2;
    for (let yy = -h / 2 + 120; yy < h / 2 - 20; yy += 64) {
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 30, yy);
      ctx.lineTo(w / 2 - 30, yy);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(200,60,50,0.35)';
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 30, -h / 2 + 92);
    ctx.lineTo(w / 2 - 30, -h / 2 + 92);
    ctx.stroke();
  }
  if (flag) {
    // a tricolour in the letterhead
    const fw = 84;
    const fh = 56;
    const fx = w / 2 - 48 - fw;
    const fy = -h / 2 + 36;
    flag.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(fx + (fw / flag.length) * i, fy, fw / flag.length + 0.5, fh); });
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(fx, fy, fw, fh);
  }
  ctx.restore();
  lines.forEach((ln, i) => {
    const lp = ln.p != null ? clamp(ln.p) * clamp((q - 0.3) / 0.3) : clamp((q - 0.25 - i * 0.12) / 0.3);
    if (lp <= 0) return;
    const s = ln.s.slice(0, Math.ceil(ln.s.length * lp));
    text(ctx, s, -w / 2 + 48 + (ln.dx || 0), -h / 2 + (ln.y || 70 + i * 64), {
      size: ln.size || 34, font: ln.font || F.mono6, color: ln.color || 'rgba(38,28,20,0.88)', track: ln.track ?? 1,
    });
  });
  ctx.restore();
}

/* ------------------------------ camera helpers ---------------------------- */

/** a quick punch-in on a beat: returns a scale (1..1+k) that eases in then settles */
export function punch(t, at, k = 0.05, dur = 0.5) {
  const x = (t - at) / dur;
  if (x <= 0) return 1;
  if (x >= 1) return 1 + k * 0.6;
  return 1 + k * (EASE.outCubic(x) - 0.4 * EASE.inOutQuad(x));
}

/** run fn with the canvas scaled by s about (cx, cy) */
export function zoomed(ctx, s, cx, cy, fn) {
  if (Math.abs(s - 1) < 1e-4) { fn(); return; }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.translate(-cx, -cy);
  fn();
  ctx.restore();
}


/* ------------------------------ environments ------------------------------ */

const BAKED = new Map();
function bake(key, w, h, fn) {
  if (BAKED.has(key)) return BAKED.get(key);
  const c = createCanvas(Math.round(w), Math.round(h));
  fn(c.getContext('2d'), c.width, c.height);
  BAKED.set(key, c);
  return c;
}

function bokehSprite(rgb) {
  return bake(`bokeh:${rgb}`, 128, 128, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, `rgba(${rgb},0.9)`);
    g.addColorStop(0.55, `rgba(${rgb},0.55)`);
    g.addColorStop(0.8, `rgba(${rgb},0.18)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = g;
    x.fillRect(0, 0, w, w);
  });
}

/** out-of-focus lights drifting on two depth planes */
export function bokeh(ctx, t, cam = {}, { rgb = '255,200,150', n = 16, a = 1, seed = 1, y0 = 0, y1 = H, big = 1 } = {}) {
  if (a <= 0.004) return;
  const spr = bokehSprite(rgb);
  const r = rng(seed * 131 + 7);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const depth = r();
    const s = (40 + r() * 150) * (0.6 + depth) * big;
    const sp = 6 + depth * 18;
    const x = ((r() * (W + 400) + t * sp * (r() > 0.5 ? 1 : -1)) % (W + 400) + W + 400) % (W + 400) - 200 + (cam.dx || 0) * (0.5 + depth * 1.6);
    const y = y0 + r() * (y1 - y0) + Math.sin(t * (0.2 + r() * 0.3) + i) * 30 + (cam.dy || 0) * (0.5 + depth * 1.6);
    const tw = 0.6 + 0.4 * Math.sin(t * (0.6 + r()) + i * 2.1);
    ctx.globalAlpha = a * (0.05 + 0.13 * r()) * tw;
    ctx.drawImage(spr, x - s / 2, y - s / 2, s, s);
  }
  ctx.restore();
}

/**
 * A dark set with a key light: a vertical gradient, a soft spotlight that
 * breathes, a floor glow and bokeh. Used for the data shots.
 */
export function studio(ctx, t, cam = {}, {
  top = '#0E0A18', bottom = '#040308', rgb = '150,110,255', spot = [720, 1300], spotR = 1150, spotA = 0.3,
  floor = 0, a = 1, seed = 1, bokehN = 14, bokehRgb = null,
} = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const bg = bake(`studio:${top}:${bottom}`, 360, 640, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  });
  ctx.drawImage(bg, -60, -60, W + 120, H + 120);
  const br = 1 + 0.04 * Math.sin(t * 0.9);
  const sx = spot[0] + (cam.dx || 0) * 0.4;
  const sy = spot[1] + (cam.dy || 0) * 0.4;
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, spotR * br);
  g.addColorStop(0, `rgba(${rgb},${spotA})`);
  g.addColorStop(0.45, `rgba(${rgb},${spotA * 0.35})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  if (floor > 0) {
    // a perspective floor grid fading into the dark
    ctx.save();
    ctx.globalAlpha *= floor;
    const hy = 1500;
    const vx = 720 + (cam.dx || 0) * 0.6;
    ctx.strokeStyle = `rgba(${rgb},0.22)`;
    ctx.lineWidth = 2;
    for (let i = -12; i <= 12; i++) {
      ctx.beginPath();
      ctx.moveTo(vx + i * 30, hy);
      ctx.lineTo(vx + i * 260, H + 200);
      ctx.stroke();
    }
    const off = (t * 40) % 1;
    for (let j = 0; j < 14; j++) {
      const z = (j + off) / 14;
      const y = hy + (H + 200 - hy) * z * z;
      ctx.globalAlpha = floor * (0.1 + 0.6 * z);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
    const fg = ctx.createLinearGradient(0, 1380, 0, 1640);
    fg.addColorStop(0, 'rgba(0,0,0,0)');
    fg.addColorStop(0.5, `rgba(${rgb},0.08)`);
    fg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 1380, W, 260);
  }
  bokeh(ctx, t, cam, { rgb: bokehRgb || rgb, n: bokehN, seed, a: 0.9 });
  ctx.restore();
}

function woodTexture(tone) {
  const PAL_W = {
    wood: [[46, 25, 16], [92, 54, 31], [120, 74, 44]],
    slate: [[22, 27, 34], [40, 48, 58], [58, 68, 80]],
  }[tone];
  return bake(`desk:${tone}`, (W + 160) / 2, (H + 160) / 2, (x, w, h) => {
    const img = x.createImageData(w, h);
    const d = img.data;
    const r = rng(77);
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        let v;
        if (tone === 'wood') {
          // wide planks along y; grain lines bent by low-frequency noise,
          // each plank its own tone
          const PW = 196;
          const plank = Math.floor(xx / PW);
          const pt = ((plank * 7919) % 13) / 13 - 0.5;
          const n = fbm3(xx * 0.006 + plank * 3.1, yy * 0.0022, plank * 0.7, 3, 11);
          const ring = Math.sin(xx * 0.11 + n * 16 + plank * 1.7);
          const fine = fbm3(xx * 0.09, yy * 0.004, plank, 2, 5);
          const knot = fbm3(xx * 0.012, yy * 0.006, plank + 9, 2, 3);
          v = 0.46 + 0.1 * ring + 0.22 * (fine - 0.5) + 0.18 * (knot - 0.5) + pt * 0.18;
          if (xx % PW < 2) v *= 0.45; // the gap between planks
        } else {
          const n = fbm3(xx * 0.01, yy * 0.01, 0.3, 4, 9);
          v = 0.35 + 0.6 * (n - 0.3) + (r() - 0.5) * 0.08;
        }
        v = clamp(v);
        const lo = v < 0.5 ? PAL_W[0] : PAL_W[1];
        const hi = v < 0.5 ? PAL_W[1] : PAL_W[2];
        const k = v < 0.5 ? v * 2 : (v - 0.5) * 2;
        const i = (yy * w + xx) * 4;
        d[i] = lo[0] + (hi[0] - lo[0]) * k;
        d[i + 1] = lo[1] + (hi[1] - lo[1]) * k;
        d[i + 2] = lo[2] + (hi[2] - lo[2]) * k;
        d[i + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
  });
}

/** a desk under a lamp: wood or slate, a warm pool of light, dust in the beam */
export function desk(ctx, t, cam = {}, { tone = 'wood', lamp = [700, 1250], lampR = 1150, rgb = '255,206,150', a = 1, dim = 0.0 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const tex = woodTexture(tone);
  ctx.drawImage(tex, -80 + (cam.dx || 0) * 0.5, -80 + (cam.dy || 0) * 0.5, W + 160, H + 160);
  // the room is dark: only the lamp pool shows the surface
  const fl = 1 + 0.015 * Math.sin(t * 7.3) + 0.01 * Math.sin(t * 13.1);
  const lx = lamp[0] + (cam.dx || 0) * 0.5;
  const ly = lamp[1] + (cam.dy || 0) * 0.5;
  const g = ctx.createRadialGradient(lx, ly, lampR * 0.08, lx, ly, lampR * fl);
  g.addColorStop(0, 'rgba(6,4,3,0.05)');
  g.addColorStop(0.55, 'rgba(6,4,3,0.5)');
  g.addColorStop(1, 'rgba(6,4,3,0.9)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  const g2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, lampR * 0.75 * fl);
  g2.addColorStop(0, `rgba(${rgb},0.9)`);
  g2.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // dust motes inside the beam
  const r = rng(91);
  for (let i = 0; i < 46; i++) {
    const x0 = r() * W;
    const y0 = r() * H;
    const x = x0 + Math.sin(t * 0.3 + i) * 40 + t * (4 + r() * 6);
    const y = y0 - t * (6 + r() * 10) + Math.cos(t * 0.4 + i * 1.3) * 30;
    const xx = ((x % W) + W) % W;
    const yy = ((y % H) + H) % H;
    const dd = Math.hypot(xx - lx, yy - ly) / lampR;
    const al = clamp(1 - dd) * (0.25 + 0.5 * r());
    if (al < 0.02) continue;
    ctx.fillStyle = `rgba(255,236,206,${al})`;
    ctx.beginPath();
    ctx.arc(xx, yy, 1.4 + r() * 2.6, 0, TAU);
    ctx.fill();
  }
  if (dim > 0) {
    ctx.fillStyle = `rgba(0,0,0,${dim})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/** volumetric light: soft wedges from (x, y) along `ang`, shimmering */
export function rays(ctx, x, y, { ang = Math.PI / 2, spread = 0.55, len = 2200, n = 7, rgb = '255,230,200', a = 0.1, t = 0, seed = 1 } = {}) {
  if (a <= 0.004) return;
  const r = rng(seed * 53 + 1);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const c = ang + (r() - 0.5) * spread;
    const wdt = 0.03 + r() * 0.07;
    const sh = 0.55 + 0.45 * Math.sin(t * (0.5 + r() * 0.8) + i * 1.9);
    const L = len * (0.7 + 0.3 * r());
    const g = ctx.createLinearGradient(x, y, x + Math.cos(c) * L, y + Math.sin(c) * L);
    g.addColorStop(0, `rgba(${rgb},${a * sh})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(c - wdt) * L, y + Math.sin(c - wdt) * L);
    ctx.lineTo(x + Math.cos(c + wdt) * L, y + Math.sin(c + wdt) * L);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function star4(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.closePath();
}

/** glitter around (x, y): dots and four-point stars that rise and twinkle */
export function sparks(ctx, x, y, t, { n = 40, rgb = '255,214,120', r = 420, a = 1, seed = 3, rise = 90, born = -99 } = {}) {
  if (a <= 0.004) return;
  const R = rng(seed * 17 + 5);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const an = R() * TAU;
    const rad = r * (0.35 + 0.65 * Math.sqrt(R()));
    const life = 1.6 + R() * 1.4;
    const ph = R() * life;
    const age = ((t - born + ph) % life) / life;
    if (t - born < ph * 0.3) continue;
    const px = x + Math.cos(an) * rad + Math.sin(t + i) * 12;
    const py = y + Math.sin(an) * rad * 0.8 - age * rise;
    const tw = Math.sin(age * Math.PI);
    const al = a * tw * (0.35 + 0.65 * R());
    if (al < 0.02) continue;
    if (i % 4 === 0) {
      ctx.fillStyle = `rgba(${rgb},${al})`;
      star4(ctx, px, py, 7 + R() * 12);
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(${rgb},${al * 0.8})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.6 + R() * 2.6, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** a whole-frame colour grade: soft-light tint plus optional top/bottom shade */
export function grade(ctx, { tint = null, k = 0.35, op = 'soft-light', shade = 0 } = {}) {
  ctx.save();
  if (tint) {
    ctx.globalCompositeOperation = op;
    ctx.globalAlpha = k;
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
  if (shade > 0) {
    ctx.save();
    const g = ctx.createLinearGradient(0, H * 0.7, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${shade})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.7, W, H * 0.3);
    ctx.restore();
  }
}

/** ghost trail for something moving fast: call fn(dx, dy, alpha) a few times */
export function smear(vx, vy, fn, { n = 4, k = 0.012 } = {}) {
  const sp = Math.hypot(vx, vy);
  if (sp < 300) { fn(0, 0, 1); return; }
  for (let i = n; i >= 1; i--) fn(-vx * k * i / n, -vy * k * i / n, 0.22 * (1 - i / (n + 1)));
  fn(0, 0, 1);
}


/* -------------------------------- membrane -------------------------------- */

const AG_COL = {
  A: ['#4F8CFF', '#A9C8FF'], B: ['#F2B33D', '#FFE19A'], D: ['#3FD6A8', '#A6F5DC'],
  X: ['#C78BFF', '#E6CCFF'], G: ['#C8A8FF', '#F0E6FF'], H: ['#E9E4DA', '#FFFFFF'],
};

/**
 * The membrane seen up close (inside the loupe): an arc of the cell's edge
 * with its double layer of lipids, and antigens standing on it — protein
 * stalks topped with chains of sugar beads, each kind its own colour.
 * kinds: list cycled along the arc; p grows them; peel lifts `peelKind` off.
 */
export function membrane(ctx, cx, cy, R, a0, a1, t, { kinds = ['A', 'X', 'D', 'B'], p = 1, n = 9, a = 1, peel = 0, peelKind = null, seed = 1 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // cytoplasm below the edge
  const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
  g.addColorStop(0, '#7A0616');
  g.addColorStop(0.92, '#C8202E');
  g.addColorStop(1, '#E2464A');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fill();
  // lipid bilayer: two rows of heads with tails between them
  const th = 26;
  const step = 15 / R;
  for (let an = a0 - 0.2; an < a1 + 0.2; an += step) {
    const ca = Math.cos(an);
    const sa = Math.sin(an);
    for (const [rr2, col] of [[R + th / 2, '#F6C9A8'], [R - th / 2, '#E8A888']]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx + ca * rr2, cy + sa * rr2, 6.2, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(246,190,160,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + ca * (R + th / 2 - 6), cy + sa * (R + th / 2 - 6));
    ctx.lineTo(cx + ca * (R + 2), cy + sa * (R + 2));
    ctx.moveTo(cx + ca * (R - th / 2 + 6), cy + sa * (R - th / 2 + 6));
    ctx.lineTo(cx + ca * (R - 2), cy + sa * (R - 2));
    ctx.stroke();
  }
  // antigens
  const r = rng(seed * 41 + 3);
  for (let i = 0; i < n; i++) {
    const kind = kinds[i % kinds.length];
    const an = lerp(a0, a1, (i + 0.5) / n) + (r() - 0.5) * 0.04;
    const grow = eo(clamp(p * 1.4 - (i / n) * 0.4));
    if (grow <= 0.01) continue;
    const isPeel = peelKind && kind === peelKind ? clamp(peel) : 0;
    const ca = Math.cos(an);
    const sa = Math.sin(an);
    const sway = Math.sin(t * 1.6 + i * 1.3) * 0.06;
    const dir = an + sway;
    const lift = isPeel * 260;
    const bx = cx + ca * (R + th / 2 + lift);
    const by = cy + sa * (R + th / 2 + lift);
    const [c1, c2] = AG_COL[kind] || AG_COL.X;
    const L = (70 + r() * 40) * grow;
    ctx.save();
    ctx.globalAlpha *= 1 - isPeel;
    // the protein stalk (with a foot in the membrane)
    ctx.strokeStyle = c1;
    ctx.lineCap = 'round';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(bx - Math.cos(dir) * 30, by - Math.sin(dir) * 30);
    const ex = bx + Math.cos(dir) * L;
    const ey = by + Math.sin(dir) * L;
    ctx.quadraticCurveTo(bx + Math.cos(dir + 0.25) * L * 0.5, by + Math.sin(dir + 0.25) * L * 0.5, ex, ey);
    ctx.stroke();
    // sugar chain: a branching run of beads
    const beads = 3 + Math.floor(r() * 3);
    let px = ex;
    let py = ey;
    for (let b = 0; b < beads; b++) {
      const k = clamp(grow * (beads + 1) - b - 0.5);
      if (k <= 0) break;
      const bd = dir + (b % 2 ? 0.45 : -0.45) + Math.sin(t * 2 + b + i) * 0.08;
      px += Math.cos(bd) * 22;
      py += Math.sin(bd) * 22;
      const rad = 11 * k;
      const bg = ctx.createRadialGradient(px - rad * 0.35, py - rad * 0.35, rad * 0.1, px, py, rad);
      bg.addColorStop(0, c2);
      bg.addColorStop(1, c1);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, TAU);
      ctx.fill();
      if (b === 1 && beads > 3) {
        const sx = px + Math.cos(bd + 1.2) * 22;
        const sy = py + Math.sin(bd + 1.2) * 22;
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.arc(sx, sy, 9 * k, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

/* ------------------------------- glass slide ------------------------------ */

/** a microscope slide lying on the desk, a drop of blood on it */
export function slide(ctx, cx, cy, w, h, p, { label = 'A', rot = 0, a = 1, drop = 1, agg = 0, t = 0, seed = 1, labelColor = '#2A2226' } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.8);
  ctx.translate(cx + (1 - q) * 220, cy);
  ctx.rotate(rot - (1 - q) * 0.15);
  contact(ctx, 10, h * 0.62, w * 1.02, h * 0.5, 0.45);
  // glass
  rr(ctx, -w / 2, -h / 2, w, h, 6);
  ctx.fillStyle = 'rgba(214,236,240,0.16)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(230,248,250,0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(140,200,200,0.35)';
  ctx.lineWidth = 6;
  rr(ctx, -w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 4);
  ctx.stroke();
  // frosted label end
  const lw2 = w * 0.26;
  rr(ctx, -w / 2 + 8, -h / 2 + 8, lw2, h - 16, 4);
  ctx.fillStyle = 'rgba(244,242,236,0.92)';
  ctx.fill();
  rr(ctx, -w / 2 + 8, -h / 2 + 8, lw2, h - 16, 4);
  grain(ctx, 0.3, 'multiply');
  text(ctx, label, -w / 2 + 8 + lw2 / 2, h * 0.2, { size: h * 0.56, font: F.fig8, color: labelColor, align: 'center' });
  // the drop
  if (drop > 0.01) {
    const dx = w * 0.12;
    const dr = h * 0.34 * eo(drop);
    const g = ctx.createRadialGradient(dx - dr * 0.3, -dr * 0.3, dr * 0.1, dx, 0, dr);
    g.addColorStop(0, '#D8283A');
    g.addColorStop(1, '#7E0A18');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(dx, 0, dr * 1.25, dr, 0, 0, TAU);
    ctx.fill();
    if (agg > 0.01) {
      const r = rng(seed * 13);
      for (let i = 0; i < 16; i++) {
        const an = r() * TAU;
        const dd = Math.sqrt(r()) * dr * 0.85;
        ctx.fillStyle = `rgba(70,4,12,${0.9 * agg})`;
        ctx.beginPath();
        ctx.arc(dx + Math.cos(an) * dd * 1.2, Math.sin(an) * dd, dr * (0.08 + r() * 0.1), 0, TAU);
        ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(255,220,220,0.55)';
    ctx.beginPath();
    ctx.ellipse(dx - dr * 0.45, -dr * 0.45, dr * 0.32, dr * 0.16, -0.4, 0, TAU);
    ctx.fill();
  }
  // glass glare
  const gg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  gg.addColorStop(0.3, 'rgba(255,255,255,0)');
  gg.addColorStop(0.42, 'rgba(255,255,255,0.22)');
  gg.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = gg;
  rr(ctx, -w / 2, -h / 2, w, h, 6);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------ sticker label ----------------------------- */

/** a blood-type sticker card that pops in */
export function sticker(ctx, s, x, y, size, p, { color = '#C8322A', ink = '#1B1418', rot = 0, a = 1 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.004) return;
  const k = 0.5 + 0.5 * back(q);
  const w = size * (s.length > 1 ? 1.25 : 1);
  const h = size * 1.12;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 2);
  ctx.translate(x, y);
  ctx.rotate(rot * (2 - q));
  ctx.scale(k, k);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  rr(ctx, -w / 2, -h / 2, w, h, size * 0.14);
  ctx.fillStyle = '#F4F0E8';
  ctx.fill();
  ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, size * 0.14);
  grain(ctx, 0.22, 'multiply');
  ctx.save();
  rr(ctx, -w / 2, -h / 2, w, h, size * 0.14);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h * 0.2);
  ctx.restore();
  text(ctx, s, 0, h * 0.34, { size: size * (s.length > 1 ? 0.56 : 0.66), font: F.fig8, color: ink, align: 'center' });
  ctx.restore();
}

/* ------------------------------- comment box ------------------------------ */

/** a comment composer, typing `typed` (0..1 of the string), a cursor blinking */
export function commentBox(ctx, cx, cy, w, p, { typed = 0, s = '', t = 0, a = 1, hint = 'Tambahkan komentar...', send = 0 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  const h = 150;
  const x0 = cx - w / 2;
  const y0 = cy - h / 2 + (1 - q) * 90;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  rr(ctx, x0, y0, w, h, 40);
  ctx.fillStyle = '#1E1A22';
  ctx.fill();
  ctx.restore();
  rr(ctx, x0, y0, w, h, 40);
  grain(ctx, 0.08);
  rr(ctx, x0 + 1.5, y0 + 1.5, w - 3, h - 3, 39);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // avatar
  const ax = x0 + 80;
  const ay = y0 + h / 2;
  const ag = ctx.createLinearGradient(ax - 44, ay - 44, ax + 44, ay + 44);
  ag.addColorStop(0, '#FF8A5C');
  ag.addColorStop(1, '#C8322A');
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.arc(ax, ay, 44, 0, TAU);
  ctx.fill();
  text(ctx, 'N', ax, ay + 17, { size: 48, font: F.fig8, color: '#FFFFFF', align: 'center' });
  // field
  const fx = ax + 74;
  const str = s.slice(0, Math.round(s.length * clamp(typed)));
  if (!str) text(ctx, hint, fx, ay + 15, { size: 42, font: F.sub, color: 'rgba(243,239,228,0.4)' });
  const tw = str ? text(ctx, str, fx, ay + 15, { size: 44, font: F.fig6, color: '#F3EFE4' }) : 0;
  if (Math.sin(t * 9) > -0.2 && typed < 1.2) {
    ctx.fillStyle = '#3D7BFA';
    ctx.fillRect(fx + tw + 6, ay - 26, 4, 52);
  }
  // send button
  const sx = x0 + w - 78;
  ctx.fillStyle = send > 0.5 ? '#3D7BFA' : 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(sx, ay, 42, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(sx - 16, ay - 18);
  ctx.lineTo(sx + 20, ay);
  ctx.lineTo(sx - 16, ay + 18);
  ctx.lineTo(sx - 9, ay);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}


/* -------------------------------- ink stamp ------------------------------- */

let SPECK = null;
function speckTile() {
  if (SPECK) return SPECK;
  const c = createCanvas(256, 256);
  const x = c.getContext('2d');
  const r = rng(404);
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = `rgba(0,0,0,${0.5 + r() * 0.5})`;
    x.beginPath();
    x.arc(r() * 256, r() * 256, 0.6 + r() * 2.2, 0, TAU);
    x.fill();
  }
  SPECK = c;
  return c;
}

const STAMPS = new Map();
function stampSprite(s, color, size) {
  const key = `${s}|${color}|${size}`;
  if (STAMPS.has(key)) return STAMPS.get(key);
  const m = createCanvas(8, 8).getContext('2d');
  m.font = `${size}px ${F.fig8}`;
  const tw = m.measureText(s).width + s.length * 3;
  const w = Math.ceil(tw + size * 1.2);
  const h = Math.ceil(size * 1.9);
  const c = createCanvas(w + 20, h + 20);
  const x = c.getContext('2d');
  x.translate(10, 10);
  x.strokeStyle = color;
  x.lineWidth = size * 0.11;
  rr(x, 0, 0, w, h, size * 0.22);
  x.stroke();
  x.lineWidth = size * 0.045;
  rr(x, size * 0.16, size * 0.16, w - size * 0.32, h - size * 0.32, size * 0.14);
  x.stroke();
  x.fillStyle = color;
  x.font = `${size}px ${F.fig8}`;
  x.textBaseline = 'alphabetic';
  let cx = (w - tw) / 2;
  for (const ch of s) { x.fillText(ch, cx, h / 2 + size * 0.36); cx += x.measureText(ch).width + 3; }
  // worn rubber: knock specks out of the ink
  x.globalCompositeOperation = 'destination-out';
  x.globalAlpha = 0.75;
  x.fillStyle = x.createPattern(speckTile(), 'repeat');
  x.fillRect(-10, -10, w + 20, h + 20);
  STAMPS.set(key, c);
  return c;
}

/** a rubber stamp that drops onto the paper: falls, squashes, inks */
export function inkStamp(ctx, s, x, y, p, { color = '#C8322A', size = 56, rot = -0.12, a = 1 } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.004) return;
  const spr = stampSprite(s, color, size);
  const fall = clamp(q / 0.4);
  const settle = clamp((q - 0.4) / 0.6);
  const k = q < 0.4 ? lerp(2.1, 1, EASE.inQuad(fall)) : 1 - 0.05 * Math.sin(settle * Math.PI) * (1 - settle);
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 4) * (q < 0.4 ? 0.55 + 0.45 * fall : 1);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(k, k);
  if (q < 0.4) {
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 30 * (1 - fall);
    ctx.shadowOffsetY = 20 * (1 - fall);
  }
  ctx.globalCompositeOperation = q >= 0.4 ? 'multiply' : 'source-over';
  ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
  ctx.restore();
}

export { eo, io, back };
