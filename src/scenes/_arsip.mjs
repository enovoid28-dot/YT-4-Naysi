// Episode 18 kit v2 — "ARSIP": an archivist's table, lit by one lamp.
//
// Rewritten for clarity: every scene is one object, large, lit from the upper
// left with an ambient-occlusion shadow underneath, a rim light on the lit edge
// and a specular highlight. Nothing is 3D and nothing is a bitmap — it is ink,
// gradient and line — but the forms follow real objects, so they read at a
// glance on a phone.
//
// Conventions: txt() takes a baseline; scenes keep their art between y=210 and
// y=1560 because the caption block owns everything below 1600.

import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, txt, hexA, mixHex, rr, fillRR, strokeRR, linGrad, radGrad, measure,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';

export const K = {
  bg: '#120E0B',
  desk: '#241B14',
  deskLo: '#120D0A',
  bone: '#F6EDDB',
  bone2: '#D3C4A8',
  bone3: '#A08F74',
  dim: 'rgba(246,237,219,0.46)',
  ink: '#0B0908',
  paper: '#EFE6D2',
  paper2: '#D6C8AC',
  red: '#C6402C',
  red2: '#8A2314',
  redHi: '#E4593F',
  gold: '#CBA65A',
  gold2: '#7C6128',
  teal: '#87AFA4',
  teal2: '#4F6E66',
};

export const ease = {
  out: EASE.outCubic,
  expo: EASE.outExpo,
  quint: EASE.outQuint,
  smooth: EASE.smooth,
  back: EASE.outBackSoft,
  inOut: EASE.inOutQuad,
};

/** Scene-local time of caption card `i` (+ offset). */
export const cue = (scene, i, off = 0) => {
  const c = scene && scene.captions && scene.captions[i];
  const base = c ? c.from : 0;
  return Math.max(0, base + off - (i === 0 ? 0.10 : 0.04));
};

export const A = (t, start, dur = 0.6, fn = ease.out) => fn(clamp((t - start) / dur));

/* ── plates ──────────────────────────────────────────────────────────────── */
const plates = new Map();
export function plate(key, w, h, fn) {
  let c = plates.get(key);
  if (!c) {
    c = createCanvas(Math.ceil(w), Math.ceil(h));
    fn(c.getContext('2d'));
    plates.set(key, c);
  }
  return c;
}

/* ── the table ───────────────────────────────────────────────────────────── */
/**
 * Warm wooden table under a single lamp. Brighter than episode 17: the object
 * has to be legible on a phone in daylight, so the floor of the image sits
 * around #241B14 and the lamp pool lifts the subject to ~#3a2b20.
 */
export function desk(ctx, { lampX = W * 0.42, lampY = 520, r = 1500, key = 'a', warm = 1 } = {}) {
  const c = plate(`desk2-${key}-${Math.round(lampX)}-${Math.round(lampY)}-${r}`, W, H, (g) => {
    const base = g.createLinearGradient(0, 0, W * 0.35, H);
    base.addColorStop(0, '#2A2018');
    base.addColorStop(0.45, '#1B1410');
    base.addColorStop(1, '#100C0A');
    g.fillStyle = base;
    g.fillRect(0, 0, W, H);

    // grain
    const rnd = rng(19);
    for (let i = 0; i < 90; i++) {
      const y0 = -H * 0.1 + rnd() * H * 1.2;
      const amp = 10 + rnd() * 34;
      g.strokeStyle = rnd() > 0.5 ? 'rgba(150,110,70,0.055)' : 'rgba(0,0,0,0.18)';
      g.lineWidth = 0.8 + rnd() * 2.2;
      g.beginPath();
      g.moveTo(-80, y0);
      for (let x = 0; x <= W + 160; x += 160) {
        g.quadraticCurveTo(x + 40, y0 + Math.sin((x + i * 41) * 0.0019) * amp, x + 160, y0 + Math.sin((x + i * 37) * 0.0015) * amp * 0.6);
      }
      g.stroke();
    }

    // lamp pool
    const lg = g.createRadialGradient(lampX, lampY, 60, lampX, lampY, r);
    lg.addColorStop(0, `rgba(255,204,142,${0.26 * warm})`);
    lg.addColorStop(0.32, `rgba(240,164,96,${0.13 * warm})`);
    lg.addColorStop(0.68, `rgba(170,108,54,${0.05 * warm})`);
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lg;
    g.fillRect(0, 0, W, H);

    // dust
    const d = rng(83);
    for (let i = 0; i < 220; i++) {
      g.fillStyle = `rgba(255,230,192,${0.02 + d() * 0.07})`;
      g.beginPath();
      g.arc(d() * W, d() * H, 0.5 + d() * 1.7, 0, TAU);
      g.fill();
    }
  });
  ctx.drawImage(c, 0, 0);
}

/** A pool of light behind the subject, so it separates from the table. */
export function spot(ctx, x, y, r, a = 0.16, col = '255,206,148') {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`);
  g.addColorStop(0.5, `rgba(${col},${a * 0.35})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** Ambient occlusion: the soft shadow an object leaves on the table. */
export function contact(ctx, x, y, w, h, a = 0.6) {
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.62);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(0.55, `rgba(0,0,0,${a * 0.45})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(1, (h / Math.max(1, w)) * 0.8);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, Math.max(w, h) * 0.62, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ── marks ───────────────────────────────────────────────────────────────── */
export function hatch(ctx, box, pathFn, { angle = -0.72, step = 11, lw = 1.5, color = '#000', a = 0.3 } = {}) {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.beginPath();
  pathFn(ctx);
  ctx.clip();
  ctx.strokeStyle = hexA(color, a);
  ctx.lineWidth = lw;
  const diag = Math.hypot(w, h);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const cx = x + w / 2;
  const cy = y + h / 2;
  for (let d = -diag / 2; d <= diag / 2; d += step) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * d - (dy * diag) / 2, cy + dy * d + (dx * diag) / 2);
    ctx.lineTo(cx + dx * d + (dy * diag) / 2, cy + dy * d - (dx * diag) / 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function halftone(ctx, x, y, w, h, tone, { step = 12, color = '#000', a = 1 } = {}) {
  ctx.save();
  ctx.fillStyle = hexA(color, a);
  for (let i = 0; i * step < w; i++) {
    for (let j = 0; j * step < h; j++) {
      const px = x + i * step + step / 2;
      const py = y + j * step + step / 2;
      const v = tone((px - x) / w, (py - y) / h);
      if (v <= 0.02) continue;
      ctx.beginPath();
      ctx.arc(px, py, step * 0.5 * Math.sqrt(clamp(v)), 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function pin(ctx, x, y, s = 1) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(x + 5, y + 9, 15 * s, 9 * s, 0.3, 0, TAU);
  ctx.fill();
  const g = ctx.createRadialGradient(x - 6 * s, y - 8 * s, 1, x, y, 20 * s);
  g.addColorStop(0, '#F8E2A6');
  g.addColorStop(0.45, K.gold);
  g.addColorStop(1, K.gold2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 14 * s, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(x - 4.5 * s, y - 5 * s, 3.6 * s, 2.4 * s, -0.6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function thread(ctx, pts, { p = 1, a = 0.95, lw = 3.4, sag = 18 } = {}) {
  if (pts.length < 2 || p <= 0) return;
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let remain = total * clamp(p);
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 1; i < pts.length; i++) {
    if (remain <= 0) break;
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const d = Math.hypot(x1 - x0, y1 - y0) || 1;
    const f = clamp(remain / d);
    const mx = lerp(x0, x1, f * 0.5);
    const my = lerp(y0, y1, f * 0.5) + sag * 0.5;
    const ex = lerp(x0, x1, f);
    const ey = lerp(y0, y1, f);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = lw + 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + 3);
    ctx.quadraticCurveTo(mx, my + 3, ex, ey + 3);
    ctx.stroke();
    ctx.strokeStyle = `rgba(198,64,44,${a})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
    remain -= d;
  }
  ctx.restore();
}

/** A photographic print: paper border, cast shadow, gloss, optional tape. */
export function printCard(ctx, x, y, w, h, o = {}) {
  const { rot = 0, art = null, border = 18, alpha = 1, tape = 0, caption = null } = o;
  const iw = w - border * 2;
  const ih = h - border * 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.66)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 22;
  fillRR(ctx, -w / 2, -h / 2, w, h, 2, K.paper);
  ctx.restore();
  const pg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  pg.addColorStop(0, '#F2E9D6');
  pg.addColorStop(0.62, '#DFD3BA');
  pg.addColorStop(1, '#C6B79A');
  fillRR(ctx, -w / 2, -h / 2, w, h, 2, pg);

  ctx.save();
  rr(ctx, -w / 2 + border, -h / 2 + border, iw, ih, 1);
  ctx.clip();
  ctx.fillStyle = '#0C0B0A';
  ctx.fillRect(-w / 2 + border, -h / 2 + border, iw, ih);
  if (art) art(ctx, iw, ih, -w / 2 + border, -h / 2 + border);
  const vg = ctx.createRadialGradient(0, -h * 0.12, Math.min(iw, ih) * 0.18, 0, 0, Math.max(iw, ih) * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(-w / 2 + border, -h / 2 + border, iw, ih);
  const gs = ctx.createLinearGradient(-iw / 2, -ih / 2, iw / 2, ih / 2);
  gs.addColorStop(0, 'rgba(255,255,255,0.09)');
  gs.addColorStop(0.42, 'rgba(255,255,255,0)');
  gs.addColorStop(1, 'rgba(255,255,255,0.04)');
  ctx.fillStyle = gs;
  ctx.fillRect(-w / 2 + border, -h / 2 + border, iw, ih);
  ctx.restore();

  ctx.strokeStyle = 'rgba(92,76,56,0.5)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-w / 2 + border, -h / 2 + border, iw, ih);

  if (tape) {
    ctx.save();
    ctx.globalAlpha *= 0.66;
    const tw = w * 0.28;
    ctx.fillStyle = 'rgba(232,214,176,0.6)';
    ctx.translate(-w / 2 + tw * 0.3, -h / 2 + 4);
    ctx.rotate(-0.45);
    ctx.fillRect(-tw / 2, -20, tw, 40);
    ctx.translate(w - tw * 0.6, 0);
    ctx.rotate(0.9);
    ctx.fillRect(-tw / 2, -20, tw, 40);
    ctx.restore();
  }
  if (caption) {
    // handwritten label in the bottom border, as on a real print
    txt(ctx, caption, 0, h / 2 - border * 0.34, {
      size: 20, font: F.mono, color: 'rgba(70,56,42,0.78)', align: 'center', track: 1.4,
    });
  }
  ctx.restore();
}

export function typeLabel(ctx, s, x, y, o = {}) {
  const { size = 22, rot = 0, align = 'left', bg = true, a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  const tw = measure(ctx, s, size, F.mono, 1.5) + 28;
  if (bg) {
    ctx.fillStyle = 'rgba(233,221,197,0.94)';
    ctx.fillRect(align === 'center' ? -tw / 2 : 0, -size * 1.3, tw, size * 1.9);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(align === 'center' ? -tw / 2 : 0, size * 0.36, tw, 2);
  }
  txt(ctx, s, align === 'center' ? 0 : 13, 0, { size, font: F.mono, color: '#1C1611', align, track: 1.5 });
  ctx.restore();
}

export function stampInk(ctx, s, x, y, o = {}) {
  const { size = 64, rot = -0.10, color = K.red, a = 1, padX = 32, padY = 24, align = 'center', track = 6 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  const tw = measure(ctx, s, size, F.display, track) + track;
  const bx = align === 'center' ? -tw / 2 - padX : -padX;
  ctx.strokeStyle = hexA(color, 0.9);
  ctx.lineWidth = 5;
  ctx.strokeRect(bx, -size * 0.92 - padY, tw + padX * 2, size * 1.5 + padY * 2);
  ctx.lineWidth = 1.6;
  ctx.strokeRect(bx + 9, -size * 0.92 - padY + 9, tw + padX * 2 - 18, size * 1.5 + padY * 2 - 18);
  txt(ctx, s, 0, 6, { size, font: F.display, color: hexA(color, 0.94), align, track });
  const r2 = rng(s.length * 31 + Math.round(size));
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(18,13,10,${0.3 + r2() * 0.45})`;
    ctx.fillRect(bx + r2() * (tw + padX * 2), -size * 0.92 - padY + r2() * (size * 1.5 + padY * 2), 2 + r2() * 22, 1 + r2() * 2);
  }
  ctx.restore();
}

export function leader(ctx, x0, y0, x1, y1, s, o = {}) {
  const { size = 26, color = K.bone, align = 'left', a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = hexA(color, 0.5);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.fillStyle = hexA(color, 0.9);
  ctx.beginPath();
  ctx.arc(x0, y0, 5, 0, TAU);
  ctx.fill();
  txt(ctx, s, x1 + (align === 'right' ? -14 : 14), y1 + size * 0.34, { size, font: F.mono, color, align, track: 2.4 });
  ctx.restore();
}

export function kick(ctx, s, x, y, o = {}) {
  const { size = 20, color = K.dim, align = 'left', track = 6, a = 1 } = o;
  txt(ctx, s, x, y, { size, font: F.mono, color, align, track, alpha: a });
}

export function num(ctx, s, x, y, o = {}) {
  const { size = 240, color = K.bone, align = 'left', track = -6, font = F.display, shadow = 0.5, a = 1 } = o;
  txt(ctx, s, x, y, {
    size, font, color, align, track, alpha: a, shadow: shadow > 0 ? 30 * shadow : 0, shadowY: 12 * shadow,
  });
}

export function rule(ctx, x, y, w, { color = 'rgba(246,237,219,0.24)', a = 1, cap = true } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, 1.6);
  if (cap) {
    ctx.fillStyle = hexA(K.gold, 0.85);
    ctx.fillRect(x, y - 5, 3, 12);
    ctx.fillRect(x + w - 3, y - 5, 3, 12);
  }
  ctx.restore();
}

/** One consistent statistic: small label, big number, one line of context. */
export function stat(ctx, x, y, { label, value, sub = null, color = K.bone, size = 150, a = 1, w = 560 }) {
  ctx.save();
  ctx.globalAlpha *= a;
  rule(ctx, x, y - 84, w, { a: 0.8 });
  kick(ctx, label, x, y - 34, { size: 20, color: K.dim, track: 6 });
  num(ctx, value, x - 6, y + 92, { size, color, track: -5 });
  if (sub) txt(ctx, sub, x, y + 142, { size: 30, font: F.mono, color: 'rgba(246,237,219,0.5)', track: 1 });
  ctx.restore();
}

/* ── objects ─────────────────────────────────────────────────────────────── */

/**
 * A cot from directly above: mattress, folded sheet, the baby, and the mobile
 * arm crossing the top corner. Top-down keeps the proportions honest and avoids
 * the toy-box look of a side view.
 */
export function cotTop(ctx, x, y, w, h, o = {}) {
  const { a = 1, key = 'cot', sheet = ['#C6CFC4', '#8D9A90'], t = 0 } = o;
  const art = plate(`cot3-${key}-${Math.round(w)}-${Math.round(h)}-${sheet[0]}`, w, h, (g) => {
    const rail = w * 0.075;
    // ── well
    g.fillStyle = '#0B0908';
    g.fillRect(0, 0, w, h);
    // ── rails: four boards with grain and an inner shadow
    const board = (bx, by, bw, bh, horiz) => {
      const gr = horiz
        ? g.createLinearGradient(0, by, 0, by + bh)
        : g.createLinearGradient(bx, 0, bx + bw, 0);
      gr.addColorStop(0, '#8A6034');
      gr.addColorStop(0.16, '#5E3F22');
      gr.addColorStop(0.60, '#382312');
      gr.addColorStop(1, '#170E07');
      g.fillStyle = gr;
      g.fillRect(bx, by, bw, bh);
      // grain
      for (let i = 0; i < 7; i++) {
        g.strokeStyle = i % 2 ? 'rgba(255,224,176,0.10)' : 'rgba(0,0,0,0.20)';
        g.lineWidth = 1.4;
        g.beginPath();
        if (horiz) {
          const yy = by + bh * (0.12 + i * 0.12);
          g.moveTo(bx, yy);
          g.bezierCurveTo(bx + bw * 0.3, yy + 3, bx + bw * 0.7, yy - 3, bx + bw, yy);
        } else {
          const xx = bx + bw * (0.12 + i * 0.12);
          g.moveTo(xx, by);
          g.bezierCurveTo(xx + 3, by + bh * 0.3, xx - 3, by + bh * 0.7, xx, by + bh);
        }
        g.stroke();
      }
      // top light edge
      g.fillStyle = 'rgba(255,226,180,0.38)';
      if (horiz) g.fillRect(bx, by, bw, 4);
      else g.fillRect(bx, by, 4, bh);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      if (horiz) g.fillRect(bx, by + bh * 0.72, bw, bh * 0.28);
      else g.fillRect(bx + bw * 0.72, by, bw * 0.28, bh);
    };
    // ── mattress
    const mx = rail, my = rail, mw = w - rail * 2, mh = h - rail * 2;
    const mg = g.createLinearGradient(0, my, 0, my + mh);
    mg.addColorStop(0, '#F4E9D2');
    mg.addColorStop(0.5, '#E1D0AE');
    mg.addColorStop(1, '#B29C79');
    g.fillStyle = mg;
    fillRR(g, mx, my, mw, mh, 12, mg);
    g.save();
    fillRR(g, mx, my, mw, mh, 12, mg);
    g.clip();
    // fitted sheet: a soft rim just inside the rails
    g.strokeStyle = 'rgba(120,100,72,0.30)';
    g.lineWidth = 5;
    fillRR(g, mx + 14, my + 14, mw - 28, mh - 28, 16, 'rgba(0,0,0,0)');
    g.stroke();
    // sheet folds
    const r2 = rng(31);
    for (let i = 0; i < 7; i++) {
      const fy = my + mh * (0.14 + i * 0.09) + (r2() - 0.5) * 22;
      const sg = g.createLinearGradient(0, fy - 22, 0, fy + 22);
      sg.addColorStop(0, 'rgba(255,252,240,0.34)');
      sg.addColorStop(0.5, 'rgba(126,106,74,0.20)');
      sg.addColorStop(1, 'rgba(255,252,240,0.12)');
      g.fillStyle = sg;
      g.beginPath();
      g.moveTo(mx, fy);
      g.bezierCurveTo(w * 0.3, fy - 26, w * 0.7, fy + 30, w - rail, fy - 6);
      g.lineTo(w - rail, fy + 26);
      g.bezierCurveTo(w * 0.7, fy + 56, w * 0.3, fy + 6, mx, fy + 30);
      g.closePath();
      g.fill();
    }
    // ── pillow
    const px = w * 0.10;
    const py = h * 0.16;
    const pw = w * 0.34;
    const ph = h * 0.30;
    g.save();
    g.shadowColor = 'rgba(60,44,26,0.35)';
    g.shadowBlur = 26;
    g.fillStyle = '#F7EEDC';
    fillRR(g, px, py, pw, ph, ph * 0.32, '#F7EEDC');
    g.restore();
    g.strokeStyle = 'rgba(150,128,96,0.35)';
    g.lineWidth = 2;
    fillRR(g, px + 8, py + 8, pw - 16, ph - 16, ph * 0.28, 'rgba(0,0,0,0)');
    g.stroke();
    // ── the blanket, folded over the legs
    const by0 = my + mh * 0.50;
    const bg = g.createLinearGradient(0, by0, 0, my + mh);
    bg.addColorStop(0, sheet[0]);
    bg.addColorStop(0.7, sheet[1]);
    bg.addColorStop(1, '#3F4A44');
    g.fillStyle = bg;
    g.beginPath();
    g.moveTo(mx + 4, by0 + 16);
    g.save();
    g.bezierCurveTo(w * 0.30, by0 - 30, w * 0.52, by0 + 34, mx + mw * 0.72, by0 + 2);
    g.bezierCurveTo(w * 0.86, by0 - 14, w * 0.94, by0 + 24, mx + mw - 4, by0 + 6);
    g.lineTo(mx + mw - 4, my + mh - 4);
    g.lineTo(mx + 4, my + mh - 4);
    g.closePath();
    g.fill();
    // knit ribs
    g.save();
    g.clip();
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(12,20,16,0.10)';
      g.lineWidth = 9;
      const xx = mx + (i / 26) * mw;
      g.beginPath();
      g.moveTo(xx, by0 - 20);
      g.lineTo(xx + 4, my + mh);
      g.stroke();
    }
    g.restore();
    g.restore();
    // folded hem
    g.fillStyle = 'rgba(255,255,255,0.16)';
    g.beginPath();
    g.moveTo(mx + 4, by0 + 16);
    g.bezierCurveTo(w * 0.30, by0 - 30, w * 0.52, by0 + 34, mx + mw * 0.72, by0 + 2);
    g.bezierCurveTo(w * 0.86, by0 - 14, w * 0.94, by0 + 24, mx + mw - 4, by0 + 6);
    g.lineTo(mx + mw - 4, by0 + 40);
    g.bezierCurveTo(w * 0.90, by0 + 58, w * 0.70, by0 + 64, mx + mw * 0.60, by0 + 44);
    g.bezierCurveTo(w * 0.40, by0 + 20, w * 0.22, by0 + 56, mx + 4, by0 + 44);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(26,32,28,0.40)';
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(mx + 6, by0 + 42);
    g.bezierCurveTo(w * 0.32, by0 + 14, w * 0.70, by0 + 44, mx + mw - 6, by0 + 24);
    g.stroke();
    // weave
    for (let i = 0; i < 10; i++) {
      g.strokeStyle = `rgba(26,32,28,${0.10 + (i % 3) * 0.03})`;
      g.lineWidth = 1.6;
      const yy = by0 + 46 + i * ((my + mh - by0 - 52) / 10);
      g.beginPath();
      g.moveTo(mx + 12, yy);
      g.bezierCurveTo(w * 0.34, yy - 5, w * 0.68, yy + 6, mx + mw - 12, yy - 2);
      g.stroke();
    }

    // ── the baby: head on the pillow, swaddled body under the blanket
    const hx = w * 0.275;
    const hy = h * 0.315;
    const hr = w * 0.108;
    g.save();
    g.shadowColor = 'rgba(40,28,18,0.45)';
    g.shadowBlur = 30;
    g.shadowOffsetY = 10;
    // swaddle body
    const swg = g.createLinearGradient(hx - hr, hy, hx + hr * 3.4, hy + hr * 2.4);
    swg.addColorStop(0, '#FDF4DF');
    swg.addColorStop(0.55, '#EFE1C4');
    swg.addColorStop(1, '#B9A483');
    g.fillStyle = swg;
    g.beginPath();
    g.moveTo(hx + hr * 0.15, hy - hr * 0.45);
    g.bezierCurveTo(hx + hr * 1.45, hy - hr * 0.78, hx + hr * 2.35, hy + hr * 0.25, hx + hr * 2.2, hy + hr * 1.35);
    g.bezierCurveTo(hx + hr * 2.05, hy + hr * 2.1, hx + hr * 0.55, hy + hr * 2.05, hx + hr * 0.15, hy + hr * 1.0);
    g.closePath();
    g.fill();
    g.restore();
    // swaddle folds
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = `rgba(160,132,94,${0.30 - i * 0.05})`;
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(hx + hr * (0.5 + i * 0.55), hy - hr * 0.35);
      g.quadraticCurveTo(hx + hr * (0.2 + i * 0.75), hy + hr * 0.9, hx + hr * (0.9 + i * 0.6), hy + hr * 1.5);
      g.stroke();
    }
    // head
    const hg2 = g.createRadialGradient(hx - hr * 0.38, hy - hr * 0.44, hr * 0.06, hx, hy, hr * 1.22);
    hg2.addColorStop(0, '#FEF0D8');
    hg2.addColorStop(0.55, '#EDD3AE');
    hg2.addColorStop(0.88, '#C99E72');
    hg2.addColorStop(1, '#8E6844');
    g.fillStyle = hg2;
    g.beginPath();
    g.arc(hx, hy, hr, 0, TAU);
    g.fill();
    // hair: fine, dark, only over the crown
    g.save();
    g.beginPath();
    g.arc(hx, hy, hr, 0, TAU);
    g.clip();
    const hair = g.createLinearGradient(hx, hy - hr * 1.1, hx, hy + hr * 0.35);
    hair.addColorStop(0, 'rgba(38,24,14,0.98)');
    hair.addColorStop(0.55, 'rgba(62,40,22,0.72)');
    hair.addColorStop(1, 'rgba(84,58,34,0.05)');
    g.fillStyle = hair;
    g.beginPath();
    g.ellipse(hx - hr * 0.05, hy - hr * 0.30, hr * 1.02, hr * 0.82, -0.10, 0, TAU);
    g.fill();
    for (let i = 0; i < 26; i++) {
      const aa = Math.PI * (1.02 + (i / 26) * 0.96);
      g.strokeStyle = `rgba(46,30,18,${0.35 + (i % 3) * 0.12})`;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(hx + Math.cos(aa) * hr * 0.55, hy - hr * 0.34 + Math.sin(aa) * hr * 0.5);
      g.quadraticCurveTo(
        hx + Math.cos(aa) * hr * 0.95, hy - hr * 0.34 + Math.sin(aa) * hr * 0.9,
        hx + Math.cos(aa) * hr * 1.06, hy - hr * 0.34 + Math.sin(aa) * hr * 0.98,
      );
      g.stroke();
    }
    g.restore();
    // ear, cheek, eyes closed
    g.strokeStyle = 'rgba(150,108,72,0.8)';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(hx + hr * 0.16, hy + hr * 0.12, hr * 0.22, -0.6, 1.9);
    g.stroke();
    g.fillStyle = 'rgba(224,142,116,0.20)';
    g.beginPath();
    g.ellipse(hx + hr * 0.44, hy + hr * 0.40, hr * 0.30, hr * 0.20, 0.25, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(96,66,44,0.75)';
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(hx + hr * 0.30, hy + hr * 0.02);
    g.quadraticCurveTo(hx + hr * 0.46, hy + hr * 0.10, hx + hr * 0.60, hy + hr * 0.02);
    g.stroke();
    // nose
    g.fillStyle = 'rgba(198,152,112,0.35)';
    g.beginPath();
    g.ellipse(hx + hr * 0.52, hy + hr * 0.32, hr * 0.11, hr * 0.08, 0.3, 0, TAU);
    g.fill();
    // lips
    g.strokeStyle = 'rgba(170,96,78,0.6)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(hx + hr * 0.40, hy + hr * 0.52);
    g.quadraticCurveTo(hx + hr * 0.50, hy + hr * 0.58, hx + hr * 0.60, hy + hr * 0.52);
    g.stroke();
    // the hand out of the swaddle
    g.fillStyle = '#F3D9B4';
    g.beginPath();
    g.ellipse(hx + hr * 1.95, hy + hr * 1.42, hr * 0.44, hr * 0.34, 0.6, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(150,112,76,0.55)';
    g.lineWidth = 1.8;
    g.stroke();
    // finger lines
    for (let i = 0; i < 3; i++) {
      g.strokeStyle = 'rgba(160,118,80,0.42)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(hx + hr * (2.3 + i * 0.14), hy + hr * (1.44 + i * 0.04));
      g.lineTo(hx + hr * (2.52 + i * 0.14), hy + hr * (1.66 + i * 0.04));
      g.stroke();
    }
    // inner shadow of the well
    const is = g.createLinearGradient(0, 0, 0, h);
    is.addColorStop(0, 'rgba(0,0,0,0.30)');
    is.addColorStop(0.14, 'rgba(0,0,0,0)');
    is.addColorStop(0.88, 'rgba(0,0,0,0)');
    is.addColorStop(1, 'rgba(0,0,0,0.22)');
    g.fillStyle = is;
    g.fillRect(mx, my, mw, mh);
    g.restore();

    board(0, 0, w, rail * 1.05, true);
    board(0, h - rail * 1.15, w, rail * 1.15, true);
    board(0, 0, rail * 1.15, h, false);
    board(w - rail * 1.15, 0, rail * 1.15, h, false);
    // corner posts
    [[0, 0], [w - rail * 1.7, 0], [0, h - rail * 1.7], [w - rail * 1.7, h - rail * 1.7]].forEach(([px2, py2]) => {
      const r3 = rail * 0.46;
      const cg = g.createRadialGradient(px2 + r3 * 1.1, py2 + r3 * 1.1, 2, px2 + r3, py2 + r3, r3 * 1.7);
      cg.addColorStop(0, '#B78A52');
      cg.addColorStop(0.55, '#6A4626');
      cg.addColorStop(1, '#1E1208');
      g.fillStyle = cg;
      g.beginPath();
      g.arc(px2 + r3, py2 + r3, r3, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.5)';
      g.lineWidth = 2;
      g.stroke();
      g.strokeStyle = 'rgba(255,236,196,0.30)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(px2 + r3, py2 + r3, r3 * 0.62, Math.PI * 1.05, Math.PI * 1.75);
      g.stroke();
    });
  });
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.drawImage(art, x, y);
  ctx.restore();
}

/** The mobile arm with three hanging toys, swaying. */
export function mobile(ctx, x, y, w, h, t, o = {}) {
  const { a = 1, swing = 1, dim = 0 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(46,32,20,0.95)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y - h * 0.3);
  ctx.quadraticCurveTo(x + w * 0.5, y, x + w * 0.30, y + h * 0.14);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,170,0.16)';
  ctx.lineWidth = 2.4;
  ctx.stroke();
  const items = [
    { dx: 0.18, len: 0.46, kind: 'star' },
    { dx: 0.40, len: 0.62, kind: 'ring' },
    { dx: 0.62, len: 0.50, kind: 'moon' },
    { dx: 0.82, len: 0.40, kind: 'star' },
  ];
  items.forEach((it, i) => {
    const ang = Math.sin(t * 1.4 + i * 1.2) * 0.11 * swing;
    const px = x + w * it.dx;
    const py = y + h * 0.14;
    const ex = px + Math.sin(ang) * h * it.len;
    const ey = py + Math.cos(ang) * h * it.len;
    ctx.strokeStyle = `rgba(238,226,202,${0.55 - dim * 0.35})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(ang);
    const c = dim > 0.5 ? '#7A7264' : '#F0E0BE';
    ctx.fillStyle = c;
    ctx.strokeStyle = 'rgba(40,30,20,0.55)';
    ctx.lineWidth = 1.6;
    if (it.kind === 'star') {
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r3 = k % 2 ? 13 : 28;
        const aa = (k / 10) * TAU - Math.PI / 2;
        ctx.lineTo(Math.cos(aa) * r3, Math.sin(aa) * r3);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (it.kind === 'ring') {
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, TAU);
      ctx.lineWidth = 10;
      ctx.strokeStyle = c;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 26, Math.PI * 0.44, Math.PI * 1.56, false);
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.strokeStyle = c;
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.restore();
}

/**
 * Lateral brain. Packed lobules with a shared light, a real Sylvian fissure, a
 * cerebellum with folia and a brainstem. Reads as an anatomical plate, not a
 * cauliflower, because the two lobes are separated by a groove.
 */
export function brain(ctx, x, y, w, h, o = {}) {
  const { key = 'b', pink = 1 } = o;
  const art = plate(`brain4-${key}-${Math.round(w)}-${Math.round(h)}-${pink}`, w, h, (g) => {
    const P = (px, py) => [x0 + px * S, y0 + py * S];
    const S = Math.min(w, h * 1.24);
    const x0 = (w - S) / 2;
    const y0 = (h - S * 0.86) / 2;

    const smooth = (gg, pts, close = true) => {
      gg.beginPath();
      if (close) {
        const m0 = [(pts[pts.length - 1][0] + pts[0][0]) / 2, (pts[pts.length - 1][1] + pts[0][1]) / 2];
        gg.moveTo(m0[0], m0[1]);
        for (let i = 0; i < pts.length; i++) {
          const c1 = pts[i];
          const c2 = pts[(i + 1) % pts.length];
          gg.quadraticCurveTo(c1[0], c1[1], (c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2);
        }
        gg.closePath();
      } else {
        gg.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) {
          const c1 = pts[i];
          const c2 = pts[i + 1];
          gg.quadraticCurveTo(c1[0], c1[1], (c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2);
        }
        gg.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      }
    };

    // a lateral brain: frontal pole left, occipital right, temporal lobe below
    const cerebrum = [
      [0.06, 0.56], [0.09, 0.40], [0.18, 0.24], [0.32, 0.14], [0.48, 0.11],
      [0.64, 0.13], [0.78, 0.20], [0.89, 0.30], [0.95, 0.42], [0.95, 0.52],
      [0.90, 0.60], [0.80, 0.63], [0.70, 0.62], [0.66, 0.70], [0.58, 0.78],
      [0.46, 0.80], [0.36, 0.76], [0.28, 0.70], [0.18, 0.66], [0.10, 0.63],
    ].map(([a, b]) => P(a, b));

    const temporal = [
      [0.24, 0.62], [0.40, 0.58], [0.58, 0.60], [0.70, 0.66], [0.70, 0.80],
      [0.60, 0.90], [0.44, 0.90], [0.31, 0.82],
    ].map(([a, b]) => P(a, b));

    const cerebellum = [
      [0.68, 0.58], [0.80, 0.56], [0.89, 0.64], [0.89, 0.78], [0.79, 0.86],
      [0.69, 0.80],
    ].map(([a, b]) => P(a, b));

    const stem = [
      [0.58, 0.80], [0.66, 0.82], [0.66, 0.96], [0.58, 0.96], [0.54, 0.88],
    ].map(([a, b]) => P(a, b));

    const tissue = ['#E3B7A6', '#C99180', '#A97365'];
    const lobe = (pts, lit, outline = true) => {
      smooth(g, pts);
      g.save();
      g.clip();
      const cx = w * 0.5;
      const cy = h * 0.45;
      const base = g.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, lit ? tissue[0] : '#B98A7C');
      base.addColorStop(0.5, lit ? tissue[1] : '#9C6E62');
      base.addColorStop(1, lit ? tissue[2] : '#6F4A42');
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);

      // packed gyri: rows of small rounded coils, finer near the poles
      const r3 = rng(213 + (lit ? 0 : 11));
      const step = w * 0.047;
      for (let gy = -step; gy < h + step; gy += step * 0.82) {
        for (let gx = -step; gx < w + step; gx += step * 0.92) {
          const jx = gx + (r3() - 0.5) * step * 0.55;
          const jy = gy + (r3() - 0.5) * step * 0.55;
          const rad = step * (0.32 + r3() * 0.20);
          const rot = r3() * TAU;
          const stretch = 1.28 + r3() * 0.5;
          const n = 9;
          const pts = [];
          for (let k = 0; k < n; k++) {
            const aa = (k / n) * TAU;
            const rr2 = rad * (0.78 + r3() * 0.34);
            const ex = Math.cos(aa) * rr2 * stretch;
            const ey = Math.sin(aa) * rr2;
            pts.push([jx + ex * Math.cos(rot) - ey * Math.sin(rot), jy + ex * Math.sin(rot) + ey * Math.cos(rot)]);
          }
          smooth(g, pts);
          const gg2 = g.createRadialGradient(jx - rad * 0.5, jy - rad * 0.6, rad * 0.05, jx, jy, rad * 1.5);
          gg2.addColorStop(0, lit ? '#F6D9C8' : '#CB9E8E');
          gg2.addColorStop(0.45, lit ? '#DDB0A0' : '#A87A6C');
          gg2.addColorStop(1, lit ? '#7E544B' : '#5B3C35');
          g.fillStyle = gg2;
          g.fill();
          g.strokeStyle = 'rgba(44,22,18,0.26)';
          g.lineWidth = w * 0.0038;
          g.stroke();
        }
      }
      // deep shadow to the lower right, so the mass turns
      const sh = g.createRadialGradient(w * 0.36, h * 0.30, w * 0.08, w * 0.58, h * 0.62, w * 0.78);
      sh.addColorStop(0, 'rgba(0,0,0,0)');
      sh.addColorStop(0.45, 'rgba(38,16,12,0.22)');
      sh.addColorStop(1, 'rgba(26,10,8,0.72)');
      g.fillStyle = sh;
      g.fillRect(0, 0, w, h);
      if (!lit) {
        g.fillStyle = 'rgba(22,10,8,0.30)';
        g.fillRect(0, 0, w, h);
      }
      g.restore();
      if (outline) {
        smooth(g, pts);
        g.strokeStyle = 'rgba(38,18,14,0.72)';
        g.lineWidth = w * 0.005;
        g.stroke();
      }
    };

    // behind: stem, cerebellum and temporal lobe, all tucked under the cerebrum
    smooth(g, stem);
    g.fillStyle = '#7E574D';
    g.fill();
    lobe(cerebellum, false, false);
    g.save();
    smooth(g, cerebellum);
    g.clip();
    for (let i = 0; i < 10; i++) {
      g.strokeStyle = `rgba(46,24,20,${0.20 + (i % 3) * 0.05})`;
      g.lineWidth = w * 0.004;
      g.beginPath();
      g.moveTo(w * 0.64, h * (0.60 + i * 0.022));
      g.quadraticCurveTo(w * 0.79, h * (0.585 + i * 0.023), w * 0.90, h * (0.64 + i * 0.020));
      g.stroke();
    }
    g.restore();

    lobe(temporal, false, false);
    lobe(cerebrum, true);

    // the grooves that make it a brain and not a stone
    g.save();
    smooth(g, cerebrum);
    g.clip();
    const grooves = [
      [[0.06, 0.62], [0.30, 0.52], [0.52, 0.50], [0.70, 0.56]],
      [[0.14, 0.42], [0.34, 0.34], [0.58, 0.32], [0.80, 0.38]],
      [[0.26, 0.20], [0.44, 0.26], [0.62, 0.22], [0.84, 0.30]],
      [[0.52, 0.13], [0.56, 0.30], [0.50, 0.46], [0.54, 0.60]],
      [[0.74, 0.16], [0.70, 0.32], [0.76, 0.46], [0.72, 0.60]],
    ];
    grooves.forEach((gv) => {
      const pts = gv.map(([a, b]) => P(a, b));
      const path = (gg) => {
        gg.beginPath();
        gg.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) {
          const c1 = pts[i];
          const c2 = pts[i + 1];
          gg.quadraticCurveTo(c1[0], c1[1], (c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2);
        }
        gg.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      };
      g.lineCap = 'round';
      path(g);
      g.strokeStyle = 'rgba(30,12,10,0.22)';
      g.lineWidth = w * 0.013;
      g.stroke();
      path(g);
      g.strokeStyle = 'rgba(26,10,8,0.44)';
      g.lineWidth = w * 0.0045;
      g.stroke();
    });
    g.restore();

    // the Sylvian fissure along the top of the temporal lobe
    g.save();
    smooth(g, cerebrum);
    g.clip();
    const syl = [[0.20, 0.62], [0.38, 0.585], [0.56, 0.60], [0.70, 0.66]].map(([a, b]) => P(a, b));
    g.beginPath();
    g.moveTo(syl[0][0], syl[0][1]);
    for (let i = 1; i < syl.length - 1; i++) {
      const c1 = syl[i];
      const c2 = syl[i + 1];
      g.quadraticCurveTo(c1[0], c1[1], (c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2);
    }
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(26,10,8,0.55)';
    g.lineWidth = w * 0.012;
    g.stroke();
    g.restore();
  });
  ctx.drawImage(art, x, y);
}

export function hippocampus(ctx, x, y, w, h, o = {}) {
  const { a = 1, glowA = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  const path = (g) => {
    g.beginPath();
    g.moveTo(x + w * 0.06, y + h * 0.34);
    g.bezierCurveTo(x + w * 0.34, y + h * 0.02, x + w * 0.86, y + h * 0.14, x + w * 0.90, y + h * 0.52);
    g.bezierCurveTo(x + w * 0.93, y + h * 0.82, x + w * 0.62, y + h * 0.98, x + w * 0.40, y + h * 0.86);
    g.bezierCurveTo(x + w * 0.20, y + h * 0.75, x + w * 0.16, y + h * 0.52, x + w * 0.06, y + h * 0.34);
    g.closePath();
  };
  if (glowA > 0) {
    ctx.save();
    ctx.shadowColor = hexA(K.redHi, 0.85);
    ctx.shadowBlur = 52 * glowA;
    path(ctx);
    ctx.fillStyle = hexA(K.redHi, 0.92);
    ctx.fill();
    ctx.restore();
  }
  path(ctx);
  const g2 = ctx.createLinearGradient(x, y, x + w, y + h);
  g2.addColorStop(0, '#FF8365');
  g2.addColorStop(0.55, '#D8452C');
  g2.addColorStop(1, '#7E1C10');
  ctx.fillStyle = g2;
  ctx.fill();
  // inner striations, like the curled dentate gyrus
  ctx.save();
  path(ctx);
  ctx.clip();
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(255,200,180,${0.20 - i * 0.02})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x + w * (0.16 + i * 0.03), y + h * 0.80);
    ctx.bezierCurveTo(x + w * 0.36, y + h * (0.44 + i * 0.04), x + w * 0.66, y + h * (0.30 + i * 0.03), x + w * 0.88, y + h * (0.42 + i * 0.02));
    ctx.stroke();
  }
  ctx.restore();
  path(ctx);
  ctx.strokeStyle = 'rgba(255,214,196,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/** Cassette tape: body, hubs, tape path, hand-written label. */
export function cassette(ctx, x, y, w, o = {}) {
  const { a = 1, rot = 0, label = 'SISI A', sub = 'KENANGAN' } = o;
  const h = w * 0.63;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  const hw = w / 2;
  const hh = h / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.72)';
  ctx.shadowBlur = 52;
  ctx.shadowOffsetY = 24;
  fillRR(ctx, -hw, -hh, w, h, w * 0.028, '#1B1917');
  ctx.restore();
  const bg = ctx.createLinearGradient(-hw, -hh, hw, hh);
  bg.addColorStop(0, '#4A4440');
  bg.addColorStop(0.38, '#292624');
  bg.addColorStop(1, '#121110');
  ctx.fillStyle = bg;
  fillRR(ctx, -hw, -hh, w, h, w * 0.028, bg);
  // bevel edges
  ctx.strokeStyle = 'rgba(255,244,220,0.22)';
  ctx.lineWidth = 2.4;
  fillRR(ctx, -hw + 3, -hh + 3, w - 6, h - 6, w * 0.024, 'rgba(0,0,0,0)');
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1.6;
  fillRR(ctx, -hw + 9, -hh + 9, w - 18, h - 18, w * 0.02, 'rgba(0,0,0,0)');
  ctx.stroke();

  // label
  const lx = -hw + w * 0.055;
  const ly = -hh + h * 0.075;
  const lw = w * 0.89;
  const lh = h * 0.36;
  const lg = ctx.createLinearGradient(lx, ly, lx + lw, ly + lh);
  lg.addColorStop(0, '#F2E7CE');
  lg.addColorStop(1, '#D2C1A0');
  ctx.fillStyle = lg;
  fillRR(ctx, lx, ly, lw, lh, 4, lg);
  ctx.fillStyle = 'rgba(150,44,28,0.92)';
  ctx.fillRect(lx, ly, lw, h * 0.035);
  // ruled lines on the label, as on a real cassette insert
  for (let i = 1; i < 3; i++) {
    ctx.fillStyle = 'rgba(90,72,52,0.22)';
    ctx.fillRect(lx + 14, ly + lh * (0.44 + i * 0.22), lw - 28, 1.4);
  }
  txt(ctx, label, lx + 18, ly + lh * 0.44, { size: h * 0.125, font: F.mono, color: '#37271D', track: 3 });
  txt(ctx, sub, lx + 18, ly + lh * 0.86, { size: h * 0.082, font: F.mono, color: 'rgba(60,44,32,0.72)', track: 5 });

  // window + hubs
  const wy = hh * 0.16;
  const ww = w * 0.60;
  const wh = h * 0.36;
  fillRR(ctx, -ww / 2, wy, ww, wh, 10, 'rgba(9,8,7,0.94)');
  const reelR = h * 0.155;
  [-ww * 0.25, ww * 0.25].forEach((rxx, i) => {
    const cy2 = wy + wh / 2;
    const tapeR = reelR * (i === 0 ? 1.42 : 1.06);
    const tg = ctx.createRadialGradient(rxx - tapeR * 0.3, cy2 - tapeR * 0.3, tapeR * 0.1, rxx, cy2, tapeR);
    tg.addColorStop(0, '#57402A');
    tg.addColorStop(0.65, '#33251A');
    tg.addColorStop(1, '#1A1410');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.arc(rxx, cy2, tapeR, 0, TAU);
    ctx.fill();
    // tape edge lines give the spool depth
    for (let k = 0; k < 5; k++) {
      ctx.strokeStyle = `rgba(255,226,180,${0.05 + k * 0.012})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rxx, cy2, tapeR - 3 - k * 5, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = '#D8CCB2';
    ctx.beginPath();
    ctx.arc(rxx, cy2, reelR * 0.54, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2B2622';
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * TAU;
      ctx.beginPath();
      ctx.arc(rxx + Math.cos(aa) * reelR * 0.28, cy2 + Math.sin(aa) * reelR * 0.28, reelR * 0.11, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(rxx, cy2, reelR * 0.16, 0, TAU);
    ctx.fill();
  });
  // glass over the window
  const sg = ctx.createLinearGradient(-ww / 2, wy, ww / 2, wy + wh);
  sg.addColorStop(0, 'rgba(255,255,255,0.14)');
  sg.addColorStop(0.45, 'rgba(255,255,255,0.01)');
  sg.addColorStop(1, 'rgba(255,255,255,0.07)');
  ctx.fillStyle = sg;
  fillRR(ctx, -ww / 2, wy, ww, wh, 10, sg);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 2;
  fillRR(ctx, -ww / 2, wy, ww, wh, 10, 'rgba(0,0,0,0)');
  ctx.stroke();

  // screws
  [[-hw + 24, -hh + 22], [hw - 24, -hh + 22], [-hw + 24, hh - 22], [hw - 24, hh - 22], [0, hh - 20]].forEach(([sx, sy]) => {
    const rg = ctx.createRadialGradient(sx - 3, sy - 3, 1, sx, sy, 9);
    rg.addColorStop(0, '#B4AEA2');
    rg.addColorStop(1, '#242120');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(sx, sy, 9, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 5, sy - 5);
    ctx.lineTo(sx + 5, sy + 5);
    ctx.stroke();
  });
  ctx.restore();
}

/** Glass measuring tube with liquid, graduations and a highlight. */
export function tube(ctx, x, y, w, h, fill, o = {}) {
  const { a = 1, color = K.teal, ticks = 4, labels = null } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  const lip = w * 0.10;
  const bodyTop = y + lip;
  const bodyH = h - lip * 0.4;
  const rTop = w * 0.10;

  // glass body, faint
  const gl = ctx.createLinearGradient(x, 0, x + w, 0);
  gl.addColorStop(0, 'rgba(226,240,238,0.10)');
  gl.addColorStop(0.42, 'rgba(226,240,238,0.03)');
  gl.addColorStop(1, 'rgba(226,240,238,0.09)');
  fillRR(ctx, x, bodyTop, w, bodyH, [0, 0, rTop, rTop], gl);

  // liquid
  const lh = bodyH * clamp(fill);
  if (lh > 3) {
    const ly = bodyTop + bodyH - lh;
    const lg = ctx.createLinearGradient(x, ly, x + w, y + h);
    lg.addColorStop(0, hexA(color, 0.98));
    lg.addColorStop(0.35, hexA(color, 0.80));
    lg.addColorStop(1, hexA(color, 0.46));
    ctx.fillStyle = lg;
    fillRR(ctx, x + 3.5, ly, w - 7, lh, [0, 0, rTop * 0.8, rTop * 0.8], lg);
    // meniscus
    ctx.fillStyle = hexA(color, 0.98);
    ctx.beginPath();
    ctx.ellipse(x + w / 2, ly, (w - 7) / 2, 7, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // the liquid's own reflection
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + w * 0.30, ly + 12, w * 0.10, lh - 24);
  }

  // scale marks on the right
  ctx.strokeStyle = 'rgba(246,240,226,0.50)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i <= ticks; i++) {
    const ty = bodyTop + (bodyH / ticks) * i;
    ctx.beginPath();
    ctx.moveTo(x + w - 2, ty);
    ctx.lineTo(x + w + (i % 2 === 0 ? 30 : 15), ty);
    ctx.stroke();
    if (labels && i > 0 && labels[i - 1] != null) {
      txt(ctx, labels[i - 1], x + w + 38, ty + 8, {
        size: 22, font: F.mono, color: 'rgba(246,240,226,0.55)', track: 1,
      });
    }
  }

  // lip
  ctx.fillStyle = 'rgba(232,246,242,0.16)';
  fillRR(ctx, x - 6, y, w + 12, lip, lip * 0.45, 'rgba(232,246,242,0.16)');
  ctx.strokeStyle = 'rgba(236,248,244,0.55)';
  ctx.lineWidth = 2;
  fillRR(ctx, x - 6, y, w + 12, lip, lip * 0.45, 'rgba(0,0,0,0)');
  ctx.stroke();

  // glass edges and highlights
  ctx.strokeStyle = 'rgba(232,246,242,0.40)';
  ctx.lineWidth = 2.6;
  fillRR(ctx, x, bodyTop, w, bodyH, [0, 0, rTop, rTop], 'rgba(0,0,0,0)');
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  ctx.fillRect(x + w * 0.14, bodyTop + 16, w * 0.075, bodyH - 40);
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.fillRect(x + w * 0.78, bodyTop + 20, w * 0.05, bodyH - 50);
  ctx.restore();
}

/** A figure seen from behind: shoulders, sleeves, hair. */
export function figureBack(ctx, cx, baseY, s, o = {}) {
  const { a = 1, rim = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  const headR = 44 * s;
  const shoulderW = 168 * s;
  const bodyH = 250 * s;
  const hipY = baseY;
  const shoulderY = baseY - bodyH * 0.74;
  const headY = baseY - bodyH * 0.96;

  const form = (g) => {
    g.beginPath();
    g.moveTo(cx - shoulderW * 0.50, hipY);
    g.bezierCurveTo(cx - shoulderW * 0.54, hipY - bodyH * 0.20, cx - shoulderW * 0.50, hipY - bodyH * 0.36, cx - shoulderW * 0.44, shoulderY);
    g.bezierCurveTo(cx - shoulderW * 0.40, shoulderY - bodyH * 0.06, cx - headR * 1.05, shoulderY - bodyH * 0.03, cx - headR * 0.52, shoulderY - bodyH * 0.06);
    g.lineTo(cx - headR * 0.48, headY + headR * 0.62);
    g.bezierCurveTo(cx - headR * 1.10, headY + headR * 0.10, cx - headR * 1.06, headY - headR * 1.02, cx, headY - headR * 1.04);
    g.bezierCurveTo(cx + headR * 1.06, headY - headR * 1.02, cx + headR * 1.10, headY + headR * 0.10, cx + headR * 0.48, headY + headR * 0.62);
    g.lineTo(cx + headR * 0.52, shoulderY - bodyH * 0.06);
    g.bezierCurveTo(cx + headR * 1.05, shoulderY - bodyH * 0.03, cx + shoulderW * 0.40, shoulderY - bodyH * 0.06, cx + shoulderW * 0.44, shoulderY);
    g.bezierCurveTo(cx + shoulderW * 0.50, hipY - bodyH * 0.36, cx + shoulderW * 0.54, hipY - bodyH * 0.20, cx + shoulderW * 0.50, hipY);
    g.closePath();
  };

  const g2 = ctx.createLinearGradient(cx - shoulderW * 0.55, shoulderY, cx + shoulderW * 0.55, hipY);
  g2.addColorStop(0, '#9A7B54');
  g2.addColorStop(0.22, '#5F4732');
  g2.addColorStop(0.62, '#332619');
  g2.addColorStop(1, '#150F0B');
  form(ctx);
  ctx.fillStyle = g2;
  ctx.fill();

  ctx.save();
  form(ctx);
  ctx.clip();
  // neck
  ctx.fillStyle = 'rgba(120,92,64,0.95)';
  ctx.beginPath();
  ctx.ellipse(cx, shoulderY - bodyH * 0.03, headR * 0.40, headR * 0.46, 0, 0, TAU);
  ctx.fill();
  // shoulder blades and the spine groove
  ctx.strokeStyle = 'rgba(255,222,176,0.13)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, shoulderY + bodyH * 0.04);
  ctx.quadraticCurveTo(cx + 6, shoulderY + bodyH * 0.20, cx, shoulderY + bodyH * 0.36);
  ctx.stroke();
  [-1, 1].forEach((sg) => {
    ctx.strokeStyle = 'rgba(255,222,176,0.11)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx + sg * headR * 0.6, shoulderY + bodyH * 0.04);
    ctx.quadraticCurveTo(cx + sg * shoulderW * 0.30, shoulderY + bodyH * 0.10, cx + sg * shoulderW * 0.34, shoulderY + bodyH * 0.30);
    ctx.stroke();
  });
  // sleeve seams
  [-1, 1].forEach((sg) => {
    ctx.strokeStyle = 'rgba(20,14,10,0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + sg * shoulderW * 0.36, shoulderY + bodyH * 0.02);
    ctx.bezierCurveTo(cx + sg * shoulderW * 0.46, hipY - bodyH * 0.34, cx + sg * shoulderW * 0.48, hipY - bodyH * 0.18, cx + sg * shoulderW * 0.46, hipY);
    ctx.stroke();
  });
  // knit texture
  const r3 = rng(41);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(255,230,190,${0.012 + r3() * 0.02})`;
    ctx.fillRect(cx - shoulderW * 0.5 + r3() * shoulderW, shoulderY + r3() * bodyH * 0.9, 2.2, 2.2);
  }
  // rim light down the left edge
  ctx.strokeStyle = `rgba(255,214,158,${0.42 * rim})`;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW * 0.50, hipY);
  ctx.bezierCurveTo(cx - shoulderW * 0.55, hipY - bodyH * 0.30, cx - shoulderW * 0.46, shoulderY - bodyH * 0.05, cx - headR * 1.00, headY - headR * 0.30);
  ctx.stroke();
  // hair
  ctx.fillStyle = '#160F0A';
  ctx.beginPath();
  ctx.ellipse(cx, headY - headR * 0.10, headR * 1.04, headR * 1.06, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,168,0.16)';
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.45, headY - headR * 0.55, headR * 0.42, headR * 0.50, -0.4, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 22; i++) {
    const aa = Math.PI * (0.82 + (i / 22) * 1.36);
    ctx.strokeStyle = `rgba(96,70,44,${0.16 + (i % 4) * 0.05})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(aa) * headR * 0.75, headY - headR * 0.10 + Math.sin(aa) * headR * 0.8);
    ctx.quadraticCurveTo(
      cx + Math.cos(aa) * headR * 1.02, headY - headR * 0.10 + Math.sin(aa) * headR * 1.04,
      cx + Math.cos(aa) * headR * 1.10, headY - headR * 0.10 + Math.sin(aa) * headR * 1.02,
    );
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

/** The bottom of every page: a rule, the chapter, the archive mark. */
export function footer(ctx, { chapter = '', no = '18', a = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(246,237,219,0.12)';
  ctx.fillRect(104, 1652, W - 208, 1.4);
  kick(ctx, `ARSIP ${no}`, 104, 1692, { size: 19, color: 'rgba(246,237,219,0.30)', track: 7 });
  kick(ctx, chapter, W / 2, 1692, { size: 19, color: 'rgba(246,237,219,0.34)', align: 'center', track: 7 });
  kick(ctx, 'NAYSI · INGAT', W - 104, 1692, { size: 19, color: 'rgba(246,237,219,0.24)', align: 'right', track: 7 });
  ctx.restore();
}

export { txt, measure, hexA, linGrad, radGrad, rr, fillRR, strokeRR };
