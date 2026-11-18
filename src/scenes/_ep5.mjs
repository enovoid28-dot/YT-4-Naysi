// Drawing kit for "Kamu Bukan Lapar" (episode 5).
// The look goes back to the CPI episode: real props on warm paper and dark
// wood, with cold fridge light as the only blue in the frame.
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, M, txt, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { card, hairline, shadow, glowSpot } from './_ep3.mjs';

export { card, hairline, shadow, glowSpot };

export const P = {
  paper: '#F2E7D3',
  paper2: '#E3D4B8',
  paper3: '#CBB894',
  ink: '#171310',
  ink2: '#3A3128',
  wood: '#2A1B14',
  wood2: '#120C09',
  teal: '#1E5F5B',
  tealHi: '#5FD3C6',
  red: '#E2452F',
  red2: '#B32E1C',
  cold: '#BFE3FF',
  amber: C.amber,
};

/* ------------------------------------------------------------- textures -- */

const TEX = {};

function noiseTile(size = 512, amount = 26, seed = 7) {
  const c = createCanvas(size, size);
  const x = c.getContext('2d');
  const img = x.createImageData(size, size);
  let s = seed;
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = (s / 4294967296) * 255;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = amount;
  }
  x.putImageData(img, 0, 0);
  return c;
}

export function grain() {
  if (!TEX.grain) TEX.grain = noiseTile(512, 22, 11);
  return TEX.grain;
}

/** Warm paper fibre: fine horizontal strands plus speckle. */
export function paperTex() {
  if (TEX.paper) return TEX.paper;
  const s = 512;
  const c = createCanvas(s, s);
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,255,255,0)';
  x.fillRect(0, 0, s, s);
  let seed = 91;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 2200; i++) {
    const y = rnd() * s;
    const x0 = rnd() * s;
    const w = 8 + rnd() * 46;
    x.strokeStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '120,96,64'},${0.03 + rnd() * 0.05})`;
    x.lineWidth = 0.6 + rnd() * 0.9;
    x.beginPath();
    x.moveTo(x0, y);
    x.lineTo(x0 + w, y + (rnd() - 0.5) * 2);
    x.stroke();
  }
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = `rgba(90,70,45,${0.02 + rnd() * 0.05})`;
    x.fillRect(rnd() * s, rnd() * s, 1.4, 1.4);
  }
  TEX.paper = c;
  return c;
}

/** Dark wood grain, one big plate, reused across scenes. */
export function woodTex() {
  if (TEX.wood) return TEX.wood;
  const w = 1440;
  const h = 900;
  const c = createCanvas(w, h);
  const x = c.getContext('2d');
  x.fillStyle = '#241710';
  x.fillRect(0, 0, w, h);
  let seed = 5;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 520; i++) {
    const y = rnd() * h;
    const amp = 2 + rnd() * 12;
    const a = 0.05 + rnd() * 0.16;
    x.strokeStyle = rnd() > 0.45 ? `rgba(0,0,0,${a})` : `rgba(120,80,50,${a * 0.8})`;
    x.lineWidth = 0.8 + rnd() * 2.6;
    x.beginPath();
    for (let px = 0; px <= w; px += 24) {
      const yy = y + Math.sin(px * 0.006 + i) * amp + Math.sin(px * 0.021 + i * 2) * amp * 0.3;
      if (px === 0) x.moveTo(px, yy);
      else x.lineTo(px, yy);
    }
    x.stroke();
  }
  TEX.wood = c;
  return c;
}

export function applyGrain(ctx, alpha = 0.06) {
  const t = grain();
  ctx.save();
  ctx.globalAlpha *= alpha;
  const pat = ctx.createPattern(t, 'repeat');
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/* ----------------------------------------------------------- backdrops --- */

/** Warm dark room: wood table, lamp pool, vignette. */
export function nightRoom(ctx, o = {}) {
  const { tableY = 1460, warm = 0.12, cold = 0.0, coldX = 0.78 } = o;
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, H, [
    [0, '#0E0B09'], [0.45, '#141010'], [1, '#0A0706'],
  ]);
  ctx.fillRect(0, 0, W, H);
  glowSpot(ctx, W * 0.22, tableY - 260, 720, P.amber, warm);
  if (cold > 0) glowSpot(ctx, W * coldX, tableY - 520, 900, P.cold, cold);

  // table
  const t = woodTex();
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, tableY, W, H - tableY);
  ctx.clip();
  ctx.drawImage(t, 0, tableY - 40, W, 900);
  ctx.fillStyle = linGrad(ctx, 0, tableY, 0, tableY + 340, [
    [0, 'rgba(255,190,120,0.10)'], [1, 'rgba(0,0,0,0.55)'],
  ]);
  ctx.fillRect(0, tableY, W, H - tableY);
  ctx.restore();
  hairline(ctx, 0, tableY, W, tableY, { color: '#C99A66', alpha: 0.22, lw: 3 });
}

/** Cream paper field for the typographic beats. */
export function paperRoom(ctx, o = {}) {
  const { top = '#F6EDDC', bot = '#DCCBAE' } = o;
  ctx.fillStyle = linGrad(ctx, 0, 0, W, H, [[0, top], [0.55, '#EFE3CE'], [1, bot]]);
  ctx.fillRect(0, 0, W, H);
  glowSpot(ctx, W * 0.5, H * 0.2, H * 0.6, '#FFF6E4', 0.5);
  const v = radGrad(ctx, W / 2, H * 0.5, H * 0.35, H * 0.95, [
    [0, 'rgba(0,0,0,0)'], [1, 'rgba(90,64,32,0.28)'],
  ]);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

/* --------------------------------------------------------------- props --- */

/** A sheet of warm paper with fibre, edge light and a soft cast shadow. */
export function sheet(ctx, x, y, w, h, o = {}) {
  const {
    rot = 0, r = 6, fill = P.paper, a = 1, shadowA = 0.55, lift = 1,
    stroke = 'rgba(255,255,255,0.55)', texA = 0.5,
  } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  if (rot) ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);

  // cast shadow (two lobes = penumbra)
  ctx.save();
  ctx.globalAlpha *= shadowA;
  ctx.shadowColor = 'rgba(0,0,0,0.72)';
  ctx.shadowBlur = 60 * lift;
  ctx.shadowOffsetY = 26 * lift;
  fillRR(ctx, 0, 0, w, h, r, '#000');
  ctx.restore();

  fillRR(ctx, 0, 0, w, h, r, fill);
  // fibre
  ctx.save();
  ctx.beginPath();
  rr(ctx, 0, 0, w, h, r);
  ctx.clip();
  const pat = ctx.createPattern(paperTex(), 'repeat');
  ctx.globalAlpha *= texA;
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, w, h);
  // paper shading: top light, bottom weight
  ctx.globalAlpha = 1;
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, h, [
    [0, 'rgba(255,255,255,0.35)'], [0.35, 'rgba(255,255,255,0.02)'], [1, 'rgba(120,92,56,0.16)'],
  ]);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  strokeRR(ctx, 0, 0, w, h, r, stroke, 2);
  ctx.restore();
}

/** Rubber stamp with rough edges. */
export function stamp(ctx, x, y, text, o = {}) {
  const {
    size = 54, color = P.red, rot = -0.12, padX = 26, padY = 14, a = 1, font = F.head, track = 4,
  } = o;
  if (a <= 0.01) return 0;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  const tw = measure(ctx, text, size, font, track);
  const w = tw + padX * 2;
  const h = size + padY * 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, size * 0.09);
  ctx.globalAlpha *= 0.85;
  strokeRR(ctx, 0, -h / 2, w, h, 8, color, Math.max(3, size * 0.09));
  ctx.globalAlpha = a;
  txt(ctx, text, w / 2, size * 0.36, {
    size, font, color, align: 'center', track, alpha: 0.9,
  });
  ctx.restore();
  return w;
}

/** Small capsule tag, paper style. */
export function tag(ctx, x, y, text, o = {}) {
  const { size = 28, color = P.ink, bg = 'rgba(23,19,16,0.08)', a = 1, padX = 20 } = o;
  const tw = measure(ctx, text, size, F.mono6, 2);
  const w = tw + padX * 2;
  const h = size * 1.9;
  ctx.save();
  ctx.globalAlpha *= a;
  fillRR(ctx, x, y, w, h, h / 2, bg);
  txt(ctx, text, x + w / 2, y + h * 0.65, { size, font: F.mono6, color, align: 'center', track: 2 });
  ctx.restore();
  return w;
}

/** Thermal receipt: narrow, mono, perforated top and bottom. */
export function receipt(ctx, x, y, w, rows, o = {}) {
  const {
    a = 1, rot = 0, pad = 34, lineH = 46, header = 'STRUK MALAM', sub = '23.47 · DAPUR',
    total = null, totalLabel = 'TOTAL', foot = null, accent = P.red,
  } = o;
  if (a <= 0.004) return;
  const bodyH = rows.length * lineH;
  const h = pad * 2 + 96 + bodyH + (total ? 116 : 0) + (foot ? 74 : 0);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  if (rot) ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);

  // shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 46;
  ctx.shadowOffsetY = 20;
  fillRR(ctx, 0, 0, w, h, 4, '#F7F1E4');
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  rr(ctx, 0, 0, w, h, 4);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, h, [[0, '#FBF6EA'], [0.5, '#F6EFE0'], [1, '#EFE5D1']]);
  ctx.fillRect(0, 0, w, h);
  const pat = ctx.createPattern(paperTex(), 'repeat');
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;

  // header
  txt(ctx, header, pad, pad + 34, { size: 30, font: F.mono6, color: P.ink, track: 4 });
  txt(ctx, sub, pad, pad + 74, { size: 22, font: F.mono, color: 'rgba(23,19,16,0.55)', track: 2 });
  dottedRule(ctx, pad, pad + 100, w - pad, 'rgba(23,19,16,0.35)');

  // rows
  rows.forEach((r, i) => {
    const yy = pad + 148 + i * lineH;
    txt(ctx, r.label, pad, yy, { size: 25, font: F.mono, color: P.ink2, track: 1 });
    const val = r.value;
    const vw = measure(ctx, val, 25, F.mono6, 1);
    txt(ctx, val, w - pad - vw, yy, {
      size: 25, font: F.mono6, color: r.color || P.ink, track: 1,
    });
    if (r.note) {
      txt(ctx, r.note, pad, yy + 26, { size: 18, font: F.mono, color: 'rgba(23,19,16,0.45)', track: 1 });
    }
  });

  let yy = pad + 148 + bodyH + 18;
  if (total) {
    dottedRule(ctx, pad, yy, w - pad, 'rgba(23,19,16,0.45)');
    yy += 62;
    txt(ctx, totalLabel, pad, yy, { size: 24, font: F.mono6, color: P.ink, track: 3 });
    txt(ctx, total, w - pad, yy, { size: 54, font: F.mono6, color: accent, align: 'right', track: -1 });
    yy += 34;
  }
  if (foot) {
    txt(ctx, foot, pad, yy + 26, { size: 19, font: F.mono, color: 'rgba(23,19,16,0.5)', track: 1 });
  }
  ctx.restore();

  // perforation
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let px = 6; px < w - 6; px += 16) {
    ctx.beginPath();
    ctx.arc(px, 2, 2.4, 0, TAU);
    ctx.arc(px, h - 2, 2.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

function dottedRule(ctx, x0, y, x1, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 7]);
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  ctx.restore();
}

/** Clipboard-held laboratory slip with two measured values. */
export function labSlipValues(ctx, o = {}) {
  return o;
}

/** Up / down arrow with a chunky editorial weight. */
export function arrow(ctx, x, y, size, dir = 1, color = P.red, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - dir * size);
  ctx.lineTo(x + size * 0.62, y + dir * size * 0.05);
  ctx.lineTo(x + size * 0.22, y + dir * size * 0.05);
  ctx.lineTo(x + size * 0.22, y + dir * size * 0.85);
  ctx.lineTo(x - size * 0.22, y + dir * size * 0.85);
  ctx.lineTo(x - size * 0.22, y + dir * size * 0.05);
  ctx.lineTo(x - size * 0.62, y + dir * size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Section kicker for the paper scenes (dark ink on cream). */
export function paperKicker(ctx, label, o = {}) {
  const { x = M, y = 300, color = 'rgba(23,19,16,0.55)' } = o;
  ctx.save();
  ctx.strokeStyle = P.red;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y - 22);
  ctx.lineTo(x + 54, y - 22);
  ctx.stroke();
  txt(ctx, label, x, y + 26, { size: 27, font: F.mono6, color, track: 6 });
  ctx.restore();
}

/** Section kicker for the dark scenes. */
export function darkKicker(ctx, label, o = {}) {
  const { x = M, y = 300, color = hexA(C.bone, 0.5) } = o;
  ctx.save();
  hairline(ctx, x, y - 22, x + 54, y - 22, { color: P.amber, alpha: 0.8, lw: 4 });
  txt(ctx, label, x, y + 26, { size: 27, font: F.mono6, color, track: 6 });
  ctx.restore();
}

/** Soft cold light wash used for the fridge. */
export function coldWash(ctx, x, y, w, h, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  const g = linGrad(ctx, x, y, x, y + h, [
    [0, 'rgba(190,225,255,0.30)'], [0.5, 'rgba(150,200,245,0.14)'], [1, 'rgba(120,170,220,0.03)'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Bar with a label, used instead of axes in the data beats. */
export function bar(ctx, x, y, w, h, p, o = {}) {
  const { color = P.red, bg = 'rgba(23,19,16,0.08)', a = 1, r = 6 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  fillRR(ctx, x, y, w, h, r, bg);
  fillRR(ctx, x, y, Math.max(h, w * clamp(p)), h, r, color);
  ctx.restore();
}
