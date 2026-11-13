// Episode 5 props: the objects the narration actually talks about.
// A fridge, a bedside clock, blood tubes, the food that gets eaten, a scale.
// Everything here is drawn as a physical thing first and a graphic second.
import { W, H, C, M, txt, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { P } from './_ep5.mjs';

/* ------------------------------------------------------------- helpers --- */

export function softSeat(ctx, cx, y, r, a = 0.55) {
  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(1, 0.22);
  const g = radGrad(ctx, 0, 0, 2, r, [[0, `rgba(0,0,0,${a})`], [1, 'rgba(0,0,0,0)']]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** warm cream paper object (tag, note, tape) */
export function paperShape(ctx, x, y, w, h, o = {}) {
  const { fill = '#F1E4C9', a = 1, r = 3, rot = 0, shadow = 26 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  if (rot) ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = 12;
    fillRR(ctx, 0, 0, w, h, r, fill);
    ctx.restore();
  }
  fillRR(ctx, 0, 0, w, h, r, fill);
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, h, [
    [0, 'rgba(255,255,255,0.30)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(120,92,56,0.18)'],
  ]);
  fillRR(ctx, 0, 0, w, h, r, ctx.fillStyle);
  ctx.restore();
}

/** A hanging price tag: string, hole, printed label and value. */
export function priceTag(ctx, x, y, o = {}) {
  const {
    label = '', value = '', a = 1, rot = 0, color = P.ink, accent = P.red, w = 190, h = 116,
    size = 44, bg = '#F3E7CD',
  } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  // string
  ctx.strokeStyle = 'rgba(232,220,196,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2, -8);
  ctx.stroke();
  // body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  fillRR(ctx, 0, 0, w, h, 4, bg);
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, h, [[0, 'rgba(255,255,255,0.35)'], [1, 'rgba(120,92,56,0.16)']]);
  fillRR(ctx, 0, 0, w, h, 4, ctx.fillStyle);
  // hole + reinforce ring
  ctx.fillStyle = 'rgba(23,19,16,0.35)';
  ctx.beginPath();
  ctx.arc(22, h / 2, 7, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(23,19,16,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(22, h / 2, 13, 0, TAU);
  ctx.stroke();

  if (label) {
    txt(ctx, label, w - 16, h * 0.38, {
      size: 19, font: F.mono, color: 'rgba(23,19,16,0.55)', align: 'right', track: 2, maxWidth: w - 50,
    });
  }
  txt(ctx, value, w - 16, h * 0.82, {
    size, font: F.mono6, color: accent, align: 'right', track: -1,
  });
  ctx.restore();
}

/** Masking tape strip with a handwritten label. */
export function tapeStrip(ctx, x, y, w, text, o = {}) {
  const { a = 1, rot = -0.02, size = 26, color = 'rgba(30,24,18,0.8)' } = o;
  const h = size * 2.1;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(233,220,190,0.82)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(0, 0, w, 3);
  txt(ctx, text, 18, h * 0.66, { size, font: F.mono6, color, track: 2, maxWidth: w - 36 });
  ctx.restore();
}

/* -------------------------------------------------------------- fridge --- */

/* ---------------------------------------------------------- digital clock */

export function digitalClock(ctx, x, y, w, h, time, o = {}) {
  const { a = 1, on = 1, small = '' } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  // body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  fillRR(ctx, x, y, w, h, 14, '#141210');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, x, y, x, y + h, [[0, '#2A2622'], [1, '#0F0D0B']]);
  fillRR(ctx, x, y, w, h, 14, ctx.fillStyle);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 14) : ctx.rect(x, y, w, h);
  ctx.stroke();

  // display window
  const dx = x + 26;
  const dy = y + h * 0.24;
  const dw = w - 52;
  const dh = h * 0.52;
  fillRR(ctx, dx, dy, dw, dh, 6, '#120C0A');

  const col = `rgba(255,74,44,${0.92 * on})`;
  txt(ctx, time, dx + dw / 2, dy + dh * 0.84, {
    size: dh * 0.94, font: F.mono6, color: col, align: 'center', track: -2,
    glowBlur: 18 * on, glowColor: 'rgba(255,74,44,0.55)',
  });
  if (small) {
    txt(ctx, small, dx + dw / 2, dy + dh + 26, {
      size: 20, font: F.mono, color: `rgba(255,120,90,${0.5 * on})`, align: 'center', track: 3,
    });
  }
  // glass glare
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(dx, dy, dw, dh, 6);
  else ctx.rect(dx, dy, dw, dh);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, dx, dy, dx + dw * 0.7, dy + dh, [
    [0, 'rgba(255,255,255,0.10)'], [0.5, 'rgba(255,255,255,0.02)'], [1, 'rgba(255,255,255,0.06)'],
  ]);
  ctx.fillRect(dx, dy, dw, dh);
  ctx.restore();
  ctx.restore();
}

/** Analogue alarm clock, face readable at small size. */
export function alarmClock(ctx, cx, cy, r, o = {}) {
  const { hh = 23, mm = 0, a = 1, rot = 0, face = '#F3E7CD', accent = P.red, lit = 0 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  // twin bells
  ctx.save();
  ctx.fillStyle = '#9C6B3C';
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.arc(s * r * 0.62, -r * 0.86, r * 0.26, Math.PI, TAU);
    ctx.fill();
  });
  ctx.restore();

  // bezel
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 46;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = '#7C4A2A';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = radGrad(ctx, -r * 0.3, -r * 0.35, r * 0.2, r * 1.25, [
    [0, '#A9723F'], [0.6, '#6B3C22'], [1, '#38200F'],
  ]);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();

  // face
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.87, 0, TAU);
  ctx.fill();
  if (lit) {
    ctx.fillStyle = radGrad(ctx, 0, 0, r * 0.1, r * 0.9, [
      [0, `rgba(255,236,200,${0.45 * lit})`], [1, 'rgba(255,236,200,0)'],
    ]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.87, 0, TAU);
    ctx.fill();
  }

  // hour ticks
  for (let i = 0; i < 12; i++) {
    const an = (i / 12) * TAU;
    const big = i % 3 === 0;
    const r0 = r * (big ? 0.66 : 0.72);
    const r1 = r * 0.79;
    ctx.strokeStyle = big ? 'rgba(23,19,16,0.85)' : 'rgba(23,19,16,0.45)';
    ctx.lineWidth = big ? 7 : 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0);
    ctx.lineTo(Math.cos(an) * r1, Math.sin(an) * r1);
    ctx.stroke();
  }
  [[12, '12'], [3, '3'], [6, '6'], [9, '9']].forEach(([n]) => {
    const an = (n / 12) * TAU - Math.PI / 2;
    txt(ctx, String(n), Math.cos(an) * r * 0.53, Math.sin(an) * r * 0.53 + r * 0.05, {
      size: r * 0.13, font: F.mono6, color: 'rgba(23,19,16,0.6)', align: 'center', track: 1,
    });
  });

  // hands
  const hAng = ((hh % 12) / 12) * TAU - Math.PI / 2 + (mm / 60) * (TAU / 12);
  const mAng = (mm / 60) * TAU - Math.PI / 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#171310';
  ctx.lineWidth = r * 0.075;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(hAng) * r * 0.42, Math.sin(hAng) * r * 0.42);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(mAng) * r * 0.62, Math.sin(mAng) * r * 0.62);
  ctx.stroke();
  ctx.fillStyle = '#171310';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.045, 0, TAU);
  ctx.fill();

  // glass glare
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.87, 0, TAU);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, -r, -r, r * 0.4, r * 0.4, [
    [0, 'rgba(255,255,255,0.30)'], [0.55, 'rgba(255,255,255,0.02)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
  ctx.restore();
}

/* --------------------------------------------------------------- tubes --- */

function tubePath(ctx, x, y, w, h) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h - r);
  ctx.arc(x + r, y + h - r, r, Math.PI, 0, true);
  ctx.lineTo(x + w, y);
  ctx.closePath();
}

export function testTube(ctx, x, y, w, h, o = {}) {
  const {
    level = 0.55, color = P.red, a = 1, cap = '#2B2A28', capColor = null,
  } = o;
  const r = w / 2;
  ctx.save();
  ctx.globalAlpha *= a;

  // glass
  ctx.save();
  tubePath(ctx, x, y, w, h);
  ctx.clip();
  ctx.fillStyle = 'rgba(214,233,240,0.20)';
  ctx.fillRect(x, y, w, h);
  // liquid
  const lv = clamp(level);
  const surf = y + h * (1 - lv);
  ctx.fillStyle = color;
  ctx.fillRect(x, surf, w, h * lv);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(x + r, surf + 2, r * 0.92, r * 0.18, 0, 0, TAU);
  ctx.fill();
  // glass highlight + edge shade
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(x + w * 0.16, y + 6, w * 0.09, h - 14);
  ctx.fillStyle = 'rgba(4,10,14,0.28)';
  ctx.fillRect(x + w * 0.74, y, w * 0.26, h);
  // graduation ticks
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 1; i < 6; i++) {
    ctx.fillRect(x + w * 0.42, y + h * 0.18 + i * h * 0.13, w * 0.2, 2);
  }
  ctx.restore();

  // wall
  ctx.strokeStyle = 'rgba(226,244,252,0.5)';
  ctx.lineWidth = 3;
  tubePath(ctx, x, y, w, h);
  ctx.stroke();
  // rim
  ctx.fillStyle = 'rgba(232,246,252,0.55)';
  ctx.beginPath();
  ctx.ellipse(x + r, y, r, r * 0.3, 0, 0, TAU);
  ctx.fill();
  // cap
  fillRR(ctx, x - w * 0.06, y - h * 0.045, w * 1.12, h * 0.05, 3, capColor || cap);
  ctx.restore();
}

/** Metal rack with a printed lab label, standing on the table. */
export function rack(ctx, x, y, w, h, o = {}) {
  const { a = 1, label = '' } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  fillRR(ctx, x, y, w, h, 8, '#3A4046');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, x, y, x, y + h, [
    [0, '#7E8A92'], [0.25, '#4B545B'], [1, '#232A2F'],
  ]);
  fillRR(ctx, x, y, w, h, 8, ctx.fillStyle);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 8) : ctx.rect(x, y, w, h);
  ctx.stroke();
  if (label) {
    txt(ctx, label, x + 22, y + h - 18, {
      size: 20, font: F.mono6, color: 'rgba(235,245,250,0.55)', track: 3, maxWidth: w - 44,
    });
  }
  ctx.restore();
}

/* ---------------------------------------------------------------- food --- */

export function chipsBag(ctx, x, y, w, h, o = {}) {
  const { a = 1, rot = 0, band = '#C8452F', body = '#E8DCC2' } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);

  const zig = 10;
  ctx.beginPath();
  ctx.moveTo(0, zig);
  for (let i = 0; i <= 6; i++) {
    ctx.lineTo((w / 6) * i, i % 2 ? 0 : zig * 1.6);
    ctx.lineTo((w / 6) * (i + 0.5), zig * 0.4);
  }
  ctx.lineTo(w, h - zig * 2.4);
  for (let i = 6; i >= 0; i--) {
    ctx.lineTo((w / 6) * i, h - (i % 2 ? 0 : zig * 1.6));
    ctx.lineTo((w / 6) * (i + 0.5), h - zig * 0.4);
  }
  ctx.closePath();
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = body;
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, w, h, [
    [0, 'rgba(255,255,255,0.35)'], [0.45, 'rgba(255,255,255,0.05)'], [1, 'rgba(60,40,24,0.35)'],
  ]);
  ctx.fillRect(0, 0, w, h);
  // colour band
  ctx.fillStyle = band;
  ctx.fillRect(0, h * 0.34, w, h * 0.26);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(0, h * 0.34, w, 4);
  // chips peeking
  ctx.fillStyle = 'rgba(214,168,88,0.9)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(w * (0.18 + i * 0.16), h * 0.72, 17, 11, i * 0.7, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  txt(ctx, 'KERIPIK', w / 2, h * 0.5, {
    size: 26, font: F.mono6, color: 'rgba(255,248,236,0.95)', align: 'center', track: 3,
  });
  ctx.restore();
}

export function cakeSlice(ctx, x, y, w, h, o = {}) {
  const { a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  // sponge
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h * 0.28);
  ctx.lineTo(x + w, y + h * 0.05);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#D8A96A';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#E7C288';
  ctx.fillRect(x, y, w, h);
  // cream + filling layers
  const layer = (p, col) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y + h * p);
    ctx.lineTo(x + w, y + h * p - h * 0.06);
    ctx.lineTo(x + w, y + h * p + h * 0.10);
    ctx.lineTo(x, y + h * p + h * 0.14);
    ctx.closePath();
    ctx.fill();
  };
  layer(0.34, '#F2DCC0');
  layer(0.55, '#7A3B2A');
  layer(0.72, '#F2DCC0');
  // icing top
  ctx.fillStyle = '#FBF3E4';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.28);
  ctx.lineTo(x + w, y + h * 0.05);
  ctx.lineTo(x + w, y + h * 0.02);
  ctx.lineTo(x, y + h * 0.24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(52,32,16,0.28)';
  ctx.fillRect(x + w * 0.86, y, w * 0.14, h);
  ctx.restore();
  ctx.restore();
}

export function iceTub(ctx, cx, y, w, h, o = {}) {
  const { a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  const x = cx - w / 2;
  // body
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w * 0.88, y + h);
  ctx.lineTo(x + w * 0.12, y + h);
  ctx.closePath();
  ctx.fillStyle = '#F6EFE2';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, x, 0, x + w, 0, [
    [0, 'rgba(70,50,30,0.30)'], [0.25, 'rgba(255,255,255,0.35)'], [1, 'rgba(70,50,30,0.34)'],
  ]);
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#7A3B2A';
  ctx.fillRect(x, y + h * 0.34, w, h * 0.30);
  ctx.fillStyle = 'rgba(255,248,236,0.92)';
  ctx.fillRect(x, y + h * 0.42, w, h * 0.035);
  ctx.fillRect(x, y + h * 0.5, w * 0.6, h * 0.03);
  ctx.restore();
  // lid
  fillRR(ctx, x - w * 0.05, y - h * 0.16, w * 1.1, h * 0.2, 6, '#CFC2A6');
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(x - w * 0.05, y - h * 0.16, w * 1.1, 3);
  ctx.restore();
}

export function plate(ctx, cx, cy, rx, o = {}) {
  const { a = 1, ry = rx * 0.28, fill = '#EDE4D2', rim = '#C7BBA4' } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  softSeat(ctx, cx, cy + ry * 0.5, rx * 1.15, 0.5);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(cx, cy + ry * 0.06, rx * 0.72, ry * 0.68, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy - ry * 0.1, rx * 0.92, ry * 0.8, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.restore();
}

/** small pile of snack shapes for the buffet beat */
export function snackPile(ctx, cx, cy, spread, n, o = {}) {
  const { a = 1, seed = 3 } = o;
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const px = cx + (rnd() - 0.5) * spread;
    const py = cy + (rnd() - 0.5) * spread * 0.34 - (n - i) * 1.6;
    const rr2 = 16 + rnd() * 9;
    const kind = i % 3;
    ctx.fillStyle = kind === 0 ? '#D8A45E' : kind === 1 ? '#B5763A' : '#E7CE96';
    ctx.beginPath();
    ctx.ellipse(px, py, rr2, rr2 * 0.66, rnd() * 2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.beginPath();
    ctx.ellipse(px - rr2 * 0.3, py - rr2 * 0.2, rr2 * 0.35, rr2 * 0.16, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
