// Episode 27 v2 — the motion-graphics kit on top of the chili props.
//
//   title      kinetic headline: letters rise one by one with overshoot, a
//              gradient face, a stepped 2D extrusion, a highlight edge, a
//              glow behind and one sheen sweep after they land
//   decode     text that resolves from random glyphs, left to right
//   hud        a labelled leader: pulsing anchor dot, elbow line drawn on,
//              decoding label and a sub line
//   panel      glass card: soft shadow, tinted body with grain, a gradient
//              rim, corner ticks and a light that runs along the border
//   rays       god rays out of a light source
//   haze       heat wisps rising off something hot
//   shock      a pressure wave: soft band, bright ring and speed lines
//   streaks    short light streaks flying out of a point
//   scanline   a bright line sweeping over a box, with a fading trail
import { createCanvas } from '@napi-rs/canvas';
import { W, txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng, EASE } from '../engine/anim.mjs';
import { grain, rr } from './_lab.mjs';

const back = (p) => {
  const c = 1.7;
  const x = clamp(p) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};
const hash = (n) => {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

/* --------------------------------- title --------------------------------- */

const TITLE = new Map();
const BAKED = new Map();
function titleCanvas(h) {
  const key = Math.ceil(h / 40) * 40;
  if (!TITLE.has(key)) TITLE.set(key, [createCanvas(W, key), createCanvas(W, key)]);
  return TITLE.get(key);
}

/**
 * Kinetic headline centred on cx with its baseline at y. Letters start at t0,
 * `stagger` apart, each landing in `dur` seconds.
 */
export function title(ctx, text, cx, y, t, t0, {
  size = 220, font = F.display, colors = ['#FFE7B0', '#FF7A3C', '#B9140C'], depth = 18,
  side = '#3A0806', stagger = 0.05, dur = 0.5, a = 1, glow = '255,90,40', track = -0.03,
  edge = 'rgba(255,246,230,0.55)', sheen = true,
} = {}) {
  if (a <= 0.004 || t < t0 - 0.01) return;
  const letters = [...text];
  const hgt = Math.ceil(size * 1.75);
  const base = Math.round(size * 1.18);
  // once every letter has landed and the sheen has passed, the word is a still:
  // it is composed once and blitted from then on
  const key = [text, size, font, colors.join(), depth, side, track, edge, cx].join('|');
  const settled = t > t0 + (letters.length - 1) * stagger + dur + (sheen ? 0.82 : 0.02);
  if (settled && BAKED.has(key)) {
    const b = BAKED.get(key);
    ctx.save();
    ctx.globalAlpha *= a;
    titleGlow(ctx, cx, y, size, b.total, glow, 0.85 + 0.15 * Math.sin(t * 2.4));
    ctx.drawImage(b.cv, 0, y - base);
    ctx.restore();
    return;
  }
  const [face, ext] = titleCanvas(hgt);
  const fc = face.getContext('2d');
  const ec = ext.getContext('2d');
  for (const c of [fc, ec]) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, W, hgt);
    c.font = `${size}px ${font}`;
    c.textBaseline = 'alphabetic';
  }
  const tr = size * track;
  const adv = letters.map((ch) => fc.measureText(ch).width);
  const total = adv.reduce((s, v) => s + v, 0) + tr * (letters.length - 1);
  let x = cx - total / 2;
  // the face gradient lives in each letter's own space (origin on its baseline)
  const grad = fc.createLinearGradient(0, -size * 0.74, 0, size * 0.04);
  colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
  let landed = true;
  letters.forEach((ch, i) => {
    const q = clamp((t - t0 - i * stagger) / dur);
    if (q < 1) landed = false;
    if (q <= 0) { x += adv[i] + tr; return; }
    const e = back(q);
    const al = clamp(q * 2.6);
    const yo = (1 - e) * size * 0.62;
    const sc = 0.62 + 0.38 * e;
    const rot = (1 - e) * 0.22 * (i % 2 ? 1 : -1);
    const mx = x + adv[i] / 2;
    for (const [c, fill] of [[fc, grad], [ec, side]]) {
      c.save();
      c.globalAlpha = al;
      c.translate(mx, base + yo);
      c.rotate(rot);
      c.scale(sc, sc);
      if (c === fc) {
        // a lit top edge: the face sits on a lighter copy nudged upward
        // (strokeText would trace the font's overlapping contours)
        c.fillStyle = edge;
        c.fillText(ch, -adv[i] / 2, -Math.max(2, size * 0.014));
      }
      c.fillStyle = fill;
      c.fillText(ch, -adv[i] / 2, 0);
      c.restore();
    }
    x += adv[i] + tr;
  });
  // one sheen across the word after the last letter lands
  if (sheen) {
    const tEnd = t0 + (letters.length - 1) * stagger + dur;
    const s = clamp((t - tEnd - 0.05) / 0.7);
    if (s > 0 && s < 1) {
      const sx = lerp(cx - total / 2 - 300, cx + total / 2 + 300, EASE.smooth(s));
      fc.save();
      fc.globalCompositeOperation = 'source-atop';
      const sg = fc.createLinearGradient(sx - 120, 0, sx + 120, hgt * 0.4);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,255,255,0.75)');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      fc.fillStyle = sg;
      fc.fillRect(0, 0, W, hgt);
      fc.restore();
    }
  }
  const top = y - base;
  ctx.save();
  ctx.globalAlpha *= a;
  // glow behind the word
  titleGlow(ctx, cx, y, size, total, glow, clamp((t - t0) / 0.5) * (landed ? 0.85 + 0.15 * Math.sin(t * 2.4) : 1));
  // stepped extrusion, down and to the right, darker as it goes back
  const compose = (c, oy, al) => {
    const steps = Math.max(2, Math.round(depth / 2));
    for (let k = steps; k >= 1; k--) {
      const o = (k / steps) * depth;
      c.globalAlpha = al * (0.55 + 0.45 * (1 - k / steps));
      c.drawImage(ext, o * 0.45, oy + o);
    }
    c.globalAlpha = al;
    c.drawImage(face, 0, oy);
  };
  if (settled && landed) {
    const cv = createCanvas(W, hgt + depth + 4);
    compose(cv.getContext('2d'), 0, 1);
    BAKED.set(key, { cv, total });
    ctx.drawImage(cv, 0, top);
  } else {
    compose(ctx, top, ctx.globalAlpha);
  }
  ctx.restore();
}

function titleGlow(ctx, cx, y, size, total, glow, gl) {
  const gR = Math.max(total * 0.62, size);
  const gy = y - size * 0.38;
  const rg = ctx.createRadialGradient(cx, gy, 10, cx, gy, gR);
  rg.addColorStop(0, `rgba(${glow},${0.3 * gl})`);
  rg.addColorStop(1, `rgba(${glow},0)`);
  ctx.fillStyle = rg;
  ctx.fillRect(cx - gR, gy - gR, gR * 2, gR * 2);
}

/* --------------------------------- decode -------------------------------- */

const GLYPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&+=/<>';
/** `text` resolving left to right as q goes 0 → 1; unresolved letters flicker */
export function decode(text, q, t = 0, seed = 1, pad = false) {
  if (q >= 1) return text;
  if (q <= 0) return pad ? ' '.repeat(text.length) : '';
  const n = text.length;
  const head = q * (n + 5);
  const tick = Math.floor(t * 24);
  let out = '';
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    if (i < head - 5) out += ch;
    else if (i < head) out += ch === ' ' ? ' ' : GLYPH[Math.floor(hash(i * 131 + tick * 7 + seed * 977) * GLYPH.length)];
    else if (pad) out += ' ';
    else break;
  }
  return out;
}

/* ---------------------------------- hud ---------------------------------- */

/**
 * A labelled leader from an anchor (ax, ay) to a label at (lx, ly). The line
 * goes horizontal last, so the label sits on a shelf. `p` draws it on.
 */
export function hud(ctx, ax, ay, lx, ly, p, t, {
  label = '', sub = '', rgb = '255,210,140', size = 30, subSize = 26, a = 1, align = null, seed = 1, dot = true,
} = {}) {
  if (p <= 0.001 || a <= 0.004) return;
  const q = EASE.outCubic(clamp(p));
  // the label reads from the far end of its shelf: left of the anchor it is
  // left-aligned at lx, right of the anchor right-aligned at lx
  const dir = align || (lx < ax ? 'left' : 'right');
  const ex = lx;
  ctx.save();
  ctx.font = `${size}px ${F.mono6}`;
  const tw = Math.max(ctx.measureText(label).width + 3 * label.length, ctx.measureText(sub).width * (subSize / size) + 3 * sub.length);
  ctx.restore();
  // elbow: diagonal from the anchor up to the shelf, then the shelf under the label
  const mx = dir === 'left' ? Math.min(ax, lx + tw + 26) : Math.max(ax, lx - tw - 26);
  const L1 = Math.hypot(mx - ax, ly - ay);
  const L2 = Math.abs(ex - mx);
  const d = q * (L1 + L2);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = `rgba(${rgb},0.85)`;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  if (d <= L1) {
    const u = d / Math.max(1, L1);
    ctx.lineTo(lerp(ax, mx, u), lerp(ay, ly, u));
  } else {
    ctx.lineTo(mx, ly);
    const u = (d - L1) / Math.max(1, L2);
    ctx.lineTo(lerp(mx, ex, u), ly);
  }
  ctx.stroke();
  if (dot) {
    const pulse = (t * 0.9) % 1;
    ctx.fillStyle = `rgba(${rgb},1)`;
    ctx.beginPath();
    ctx.arc(ax, ay, 7, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(${rgb},${0.7 * (1 - pulse)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ax, ay, 8 + pulse * 26, 0, TAU);
    ctx.stroke();
  }
  const lq = clamp((p - 0.45) / 0.55);
  if (label && lq > 0) {
    txt(ctx, decode(label, lq * 1.15, t, seed, dir === 'right'), lx, ly - 14, { size, font: F.mono6, color: `rgb(${rgb})`, track: 3, align: dir });
  }
  if (sub && lq > 0.3) {
    txt(ctx, decode(sub, (lq - 0.3) * 1.6, t, seed + 7, dir === 'right'), lx, ly + subSize + 12, {
      size: subSize, font: F.mono6, color: 'rgba(232,226,214,0.78)', track: 3, align: dir,
    });
  }
  ctx.restore();
}

/* --------------------------------- panel --------------------------------- */

/** a glass card with a running border light; returns nothing, draws at (x, y) */
export function panel(ctx, x, y, w, h, t, p = 1, {
  rgb = '255,170,90', r = 30, a = 1, fill = 0.55, trace = 1, head = '', headRgb = null, ticks = true,
} = {}) {
  const q = EASE.outCubic(clamp(p));
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a * q;
  const yy = y + (1 - q) * 30;
  // drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  rr(ctx, x, yy, w, h, r);
  ctx.fillStyle = `rgba(12,9,8,${fill})`;
  ctx.fill();
  ctx.restore();
  // body tint: lit from the top left
  rr(ctx, x, yy, w, h, r);
  const bg = ctx.createLinearGradient(x, yy, x + w * 0.4, yy + h);
  bg.addColorStop(0, `rgba(${rgb},0.16)`);
  bg.addColorStop(0.5, `rgba(${rgb},0.05)`);
  bg.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = bg;
  ctx.fill();
  rr(ctx, x, yy, w, h, r);
  grain(ctx, 0.1, 'overlay');
  // rim
  rr(ctx, x + 1, yy + 1, w - 2, h - 2, r);
  const rim = ctx.createLinearGradient(x, yy, x + w, yy + h);
  rim.addColorStop(0, `rgba(${rgb},0.85)`);
  rim.addColorStop(0.45, `rgba(${rgb},0.22)`);
  rim.addColorStop(1, `rgba(${rgb},0.5)`);
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  // top inner highlight
  ctx.beginPath();
  ctx.moveTo(x + r, yy + 3);
  ctx.lineTo(x + w - r, yy + 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // the light running along the border
  if (trace > 0.01) {
    const per = 2 * (w + h);
    const seg = per * 0.16;
    rr(ctx, x + 1, yy + 1, w - 2, h - 2, r);
    ctx.setLineDash([seg, per - seg]);
    ctx.lineDashOffset = -((t * 0.22) % 1) * per;
    ctx.strokeStyle = `rgba(255,236,200,${0.9 * trace})`;
    ctx.lineWidth = 3.4;
    ctx.shadowColor = `rgba(${rgb},0.9)`;
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
  }
  if (ticks) {
    ctx.strokeStyle = `rgba(${rgb},0.9)`;
    ctx.lineWidth = 3;
    const L = 22;
    for (const [cx, cy, sx, sy] of [[x, yy, 1, 1], [x + w, yy, -1, 1], [x, yy + h, 1, -1], [x + w, yy + h, -1, -1]]) {
      ctx.beginPath();
      ctx.moveTo(cx + sx * 10, cy + sy * (10 + L));
      ctx.lineTo(cx + sx * 10, cy + sy * 10);
      ctx.lineTo(cx + sx * (10 + L), cy + sy * 10);
      ctx.stroke();
    }
  }
  if (head) {
    txt(ctx, head, x + 34, yy + 50, { size: 28, font: F.mono6, color: `rgb(${headRgb || rgb})`, track: 4 });
  }
  ctx.restore();
}

/* ------------------------------- light, air ------------------------------- */

/** god rays from (x, y), fanning down over `spread` radians around `dir` */
export function rays(ctx, x, y, t, { n = 7, len = 2200, dir = Math.PI / 2, spread = 1.0, rgb = '255,200,140', a = 0.1, seed = 3 } = {}) {
  if (a <= 0.004) return;
  const R = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const base = dir + (R() - 0.5) * spread + Math.sin(t * 0.13 + i * 1.7) * 0.025;
    const wdt = 0.025 + R() * 0.06;
    const al = a * (0.4 + 0.6 * R()) * (0.75 + 0.25 * Math.sin(t * 0.7 + i * 2.1));
    const g = ctx.createRadialGradient(x, y, 0, x, y, len);
    g.addColorStop(0, `rgba(${rgb},${al})`);
    g.addColorStop(0.55, `rgba(${rgb},${al * 0.35})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(base - wdt) * len, y + Math.sin(base - wdt) * len);
    ctx.lineTo(x + Math.cos(base + wdt) * len, y + Math.sin(base + wdt) * len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** heat wisps rising from a band (x0..x1 at y), `h` tall */
export function haze(ctx, x0, x1, y, h, t, { n = 6, a = 0.22, rgb = '255,190,150', seed = 5, lw = 26 } = {}) {
  if (a <= 0.004) return;
  const R = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const bx = lerp(x0, x1, (i + 0.5) / n) + (R() - 0.5) * 40;
    const life = 2.4 + R() * 1.6;
    const ph = R() * life;
    const u = ((t + ph) % life) / life;
    const yy = y - u * h * 0.35;
    const al = a * Math.sin(u * Math.PI) * (0.6 + 0.4 * R());
    if (al < 0.01) continue;
    const amp = 22 + R() * 30;
    const fr = 1.4 + R();
    ctx.beginPath();
    const steps = 14;
    for (let k = 0; k <= steps; k++) {
      const v = k / steps;
      const px = bx + Math.sin(v * fr * TAU * 0.6 + t * 1.6 + i) * amp * v;
      const py = yy - v * h;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (const [wm, am] of [[2.2, 0.25], [1.2, 0.5], [0.45, 1]]) {
      ctx.strokeStyle = `rgba(${rgb},${al * am * 0.5})`;
      ctx.lineWidth = lw * wm;
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** a pressure wave from (x, y): soft band, bright ring, speed lines */
export function shock(ctx, x, y, p, { r = 360, rgb = '255,170,90', a = 1, lines = 14, seed = 2, lw = 5 } = {}) {
  if (p <= 0 || p >= 1 || a <= 0.004) return;
  const e = EASE.outCubic(p);
  const rad = r * e;
  const fade = (1 - p) * (1 - p);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.globalCompositeOperation = 'screen';
  const band = ctx.createRadialGradient(x, y, Math.max(0, rad * 0.7), x, y, rad * 1.06);
  band.addColorStop(0, `rgba(${rgb},0)`);
  band.addColorStop(0.75, `rgba(${rgb},${0.32 * fade})`);
  band.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = band;
  ctx.beginPath();
  ctx.arc(x, y, rad * 1.06, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(255,240,220,${0.9 * fade})`;
  ctx.lineWidth = lw * (1 - p * 0.6);
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, TAU);
  ctx.stroke();
  const R = rng(seed);
  ctx.strokeStyle = `rgba(${rgb},${0.85 * fade})`;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < lines; i++) {
    const an = (i / lines) * TAU + R() * 0.3;
    const r0 = rad * (0.9 + R() * 0.25);
    const r1 = r0 + 40 + R() * 70;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0);
    ctx.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

/** short light streaks flying out of (x, y) */
export function streaks(ctx, x, y, p, { n = 18, r = 420, rgb = '255,214,140', a = 1, seed = 4, lw = 4 } = {}) {
  if (p <= 0 || p >= 1 || a <= 0.004) return;
  const R = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const an = R() * TAU;
    const sp = 0.5 + R() * 0.5;
    const d = EASE.outCubic(p) * r * sp;
    const L = (1 - p) * (60 + R() * 90);
    const al = (1 - p) * (0.5 + 0.5 * R());
    ctx.strokeStyle = `rgba(${rgb},${al})`;
    ctx.lineWidth = lw * (0.6 + R() * 0.8);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(an) * d, y + Math.sin(an) * d);
    ctx.lineTo(x + Math.cos(an) * (d + L), y + Math.sin(an) * (d + L));
    ctx.stroke();
  }
  ctx.restore();
}

/** a bright line sweeping down a box with a fading trail */
export function scanline(ctx, x, y, w, h, p, { rgb = '120,230,210', a = 1, trail = 160 } = {}) {
  if (p <= 0 || p >= 1 || a <= 0.004) return;
  const sy = y + h * p;
  ctx.save();
  ctx.globalAlpha *= a * Math.sin(p * Math.PI);
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(0, sy - trail, 0, sy);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(1, `rgba(${rgb},0.28)`);
  ctx.fillStyle = g;
  ctx.fillRect(x, Math.max(y, sy - trail), w, Math.min(trail, sy - y));
  ctx.fillStyle = `rgba(${rgb},0.9)`;
  ctx.fillRect(x, sy - 1.5, w, 3);
  ctx.restore();
}

/** a mono label that decodes in */
export function monoFx(ctx, s, x, y, q, t, { size = 30, color = 'rgba(232,226,214,0.8)', align = 'left', track = 4, a = 1, seed = 1 } = {}) {
  if (q <= 0 || a <= 0.004) return;
  txt(ctx, decode(s, q, t, seed, align !== 'left'), x, y, { size, font: F.mono6, color, align, track, alpha: a });
}
