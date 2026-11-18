// Drawing kit for "Tidur Akhir Pekan Cuma Bayar 9%" (episode 6).
// Everything here is a physical object from the story: a bed in morning light,
// a paper ledger, a lab clipboard, a measuring cylinder, a glucose meter.
import { W, H, C, M, txt, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { P, applyGrain, sheet, stamp, tag, paperRoom, nightRoom, darkKicker, paperKicker, glowSpot } from './_ep5.mjs';

export { P, applyGrain, sheet, stamp, tag, paperRoom, nightRoom, darkKicker, paperKicker, glowSpot };
export { softSeat, priceTag, paperShape, plate, snackPile, testTube, digitalClock, alarmClock, tapeStrip } from './_props.mjs';

export const Q = {
  sun: '#FFC46B',
  sunHi: '#FFE3AE',
  wall: '#1A1512',
  wood: '#2A1B14',
  glass: 'rgba(214,233,240,0.20)',
  steel: '#8E979D',
  red: P.red,
  teal: P.teal,
};

/* ------------------------------------------------------------ bedroom --- */

/**
 * Saturday morning: warm light through a curtain on the left, a bed with a
 * rumpled blanket, a nightstand with the clock. Everything sits in one plane.
 */
export function bedroom(ctx, t, o = {}) {
  const { light = 1, night = 0 } = o;
  // ---- overhead: the bed seen from above ----
  ctx.fillStyle = linGrad(ctx, 0, 0, W, H, [[0, '#8A4432'], [0.55, '#642E24'], [1, '#3A1710']]);
  ctx.fillRect(0, 0, W, H);

  // duvet folds — long soft bands
  const folds = [
    [-0.42, 120, 190], [-0.36, 520, 120], [-0.5, 900, 240],
    [-0.3, 300, 90], [-0.44, 1250, 160], [-0.38, 1600, 200], [-0.46, 1950, 130],
  ];
  for (const [rot, y0, wdt] of folds) {
    ctx.save();
    ctx.translate(-200, y0);
    ctx.rotate(rot);
    const g = linGrad(ctx, 0, -wdt, 0, wdt, [
      [0, 'rgba(0,0,0,0)'], [0.45, 'rgba(0,0,0,0.20)'], [0.55, 'rgba(255,190,140,0.10)'], [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, -wdt, W + 500, wdt * 2);
    ctx.restore();
  }

  // caption scrim
  ctx.fillStyle = linGrad(ctx, 0, 1740, 0, H, [
    [0, 'rgba(10,7,6,0)'], [0.34, 'rgba(10,7,6,0.55)'], [1, 'rgba(8,6,5,0.88)'],
  ]);
  ctx.fillRect(0, 1740, W, H - 1740);

  // ---- pillow, top-left ----
  ctx.save();
  ctx.translate(420, 600);
  ctx.rotate(-0.14);
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  fillRR(ctx, -338, -186, 720, 430, 126, ctx.fillStyle);
  ctx.fillStyle = linGrad(ctx, -360, -220, 360, 220, [[0, '#FCF5E7'], [0.5, '#E6D9C2'], [1, '#B6A488']]);
  fillRR(ctx, -360, -215, 720, 430, 126, ctx.fillStyle);
  ctx.save();
  ctx.beginPath();
  fillRR(ctx, -360, -215, 720, 430, 126, '#fff');
  ctx.clip();
  ctx.strokeStyle = 'rgba(120,96,64,0.16)';
  ctx.lineWidth = 5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 150 - 90, -240);
    ctx.bezierCurveTo(i * 150 + 60, -60, i * 150 - 60, 110, i * 150 + 80, 240);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.26)';
  ctx.fillRect(-360, -215, 720, 96);
  ctx.restore();
  ctx.restore();

  // warm morning light from the top-left
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = radGrad(ctx, 260, 90, 0, 1500, [
    [0, `rgba(255,206,140,${(night ? 0.10 : 0.34) * light})`], [0.45, 'rgba(255,190,120,0.10)'], [1, 'rgba(255,190,120,0)'],
  ]);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // vignette
  ctx.save();
  ctx.fillStyle = radGrad(ctx, W / 2, H / 2, 0, 1420, [
    [0, 'rgba(0,0,0,0)'], [0.62, 'rgba(0,0,0,0.14)'], [1, 'rgba(0,0,0,0.62)'],
  ]);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/* ------------------------------------------------------------- ledger --- */

/** Ruled paper with a week of short nights and one tall Saturday bar. */
export function ledger(ctx, x, y, w, h, o = {}) {
  const { a = 1, rot = -0.02, values = [], labels = [], unit = 'JAM' } = o;
  sheet(ctx, x, y, w, h, { a, rot, lift: 1.1, fill: '#F4E9D2' });
  if (a < 0.4) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);

  const padX = 56;
  const top = 96;
  const baseY = h - 150;
  const plotH = baseY - top;

  // ruled lines
  ctx.strokeStyle = 'rgba(74,110,150,0.20)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i <= 8; i++) {
    const yy = top + (plotH / 8) * i;
    ctx.beginPath();
    ctx.moveTo(padX - 10, yy);
    ctx.lineTo(w - padX + 10, yy);
    ctx.stroke();
  }
  // hour axis labels
  [0, 4, 8].forEach((hr) => {
    const yy = baseY - (hr / 12) * plotH;
    txt(ctx, String(hr), padX - 22, yy + 8, {
      size: 22, font: F.mono, color: 'rgba(23,19,16,0.42)', align: 'right', track: 1,
    });
  });
  txt(ctx, unit, padX - 22, top - 26, {
    size: 20, font: F.mono6, color: 'rgba(23,19,16,0.42)', align: 'right', track: 3,
  });

  // bars
  const n = values.length || 6;
  const slot = (w - padX * 2) / n;
  const bw = slot * 0.52;
  values.forEach((v, i) => {
    const bx = padX + slot * i + (slot - bw) / 2;
    const bh = (v / 12) * plotH;
    const isWeekend = i >= 5;
    ctx.fillStyle = isWeekend ? 'rgba(179,46,28,0.92)' : 'rgba(30,95,91,0.85)';
    ctx.fillRect(bx, baseY - bh, bw, bh);
    // hand-drawn top edge
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(bx, baseY - bh, bw, 4);
    if (labels[i]) {
      txt(ctx, labels[i], bx + bw / 2, baseY + 40, {
        size: 20, font: F.mono6, color: 'rgba(23,19,16,0.55)', align: 'center', track: 2,
      });
    }
    txt(ctx, `${v}`, bx + bw / 2, baseY - bh - 14, {
      size: 22, font: F.mono6, color: isWeekend ? P.red2 : 'rgba(30,95,91,0.95)', align: 'center', track: 1,
    });
  });

  // baseline
  ctx.strokeStyle = 'rgba(23,19,16,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padX - 10, baseY);
  ctx.lineTo(w - padX + 10, baseY);
  ctx.stroke();
  ctx.restore();
}

/* ---------------------------------------------------------- clipboard --- */

/** Metal clip over a cream protocol sheet. */
export function clipboard(ctx, x, y, w, h, o = {}) {
  const { a = 1, rot = -0.015 } = o;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);

  // board
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 22;
  fillRR(ctx, 0, 0, w, h, 14, '#4A3A2C');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, h, [[0, '#7A6350'], [0.4, '#4B3A2C'], [1, '#241A14']]);
  fillRR(ctx, 0, 0, w, h, 14, ctx.fillStyle);
  // sheet
  sheet(ctx, 26, 40, w - 52, h - 96, { a, rot: 0, lift: 0.7, fill: '#F6ECD8' });
  // clip
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 70, [[0, '#D8DDE1'], [0.5, '#9AA3A9'], [1, '#5E666B']]);
  fillRR(ctx, w / 2 - 108, -26, 216, 74, 12, ctx.fillStyle);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  fillRR(ctx, w / 2 - 96, -18, 192, 10, 5, ctx.fillStyle);
  ctx.restore();
}

/* ----------------------------------------------------------- cylinder --- */

/** Graduated cylinder with a small amount of liquid at the bottom. */
export function cylinder(ctx, cx, top, w, h, o = {}) {
  const { a = 1, level = 0.09, color = '#D9A05B', label = '', hourTicks = 0 } = o;
  const x = cx - w / 2;
  const r = w * 0.5;
  ctx.save();
  ctx.globalAlpha = a;

  // shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx, top + h + 6, w * 0.62, 22, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // glass body
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, top + h - 26);
  ctx.quadraticCurveTo(x, top + h, x + r, top + h);
  ctx.quadraticCurveTo(x + w, top + h, x + w, top + h - 26);
  ctx.lineTo(x + w, top);
  ctx.closePath();
  const glassGrad = linGrad(ctx, x, 0, x + w, 0, [
    [0, 'rgba(226,242,248,0.30)'], [0.2, 'rgba(255,255,255,0.16)'], [0.8, 'rgba(226,242,248,0.10)'], [1, 'rgba(160,190,205,0.26)'],
  ]);
  ctx.fillStyle = glassGrad;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // liquid
  const lh = h * level;
  const surf = top + h - lh;
  ctx.fillStyle = color;
  ctx.fillRect(x, surf, w, lh);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x, surf, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + w * 0.72, surf, w * 0.28, lh);
  // graduations
  const nT = hourTicks || 12;
  for (let i = 1; i < nT; i++) {
    const yy = top + h - (i / nT) * (h - 40);
    const long = hourTicks ? true : i % 3 === 0;
    ctx.fillStyle = 'rgba(240,248,252,0.55)';
    ctx.fillRect(x + w * 0.12, yy, w * (long ? 0.5 : 0.28), 2);
    if (long) {
      txt(ctx, hourTicks ? String(i) : String(i * 10), x + w * 0.70, yy + 7, {
        size: hourTicks ? 19 : 17, font: F.mono, color: 'rgba(240,248,252,0.55)', track: 0,
      });
    }
  }
  if (hourTicks) {
    txt(ctx, 'JAM', x + w * 0.86, top + 26, {
      size: 17, font: F.mono6, color: 'rgba(240,248,252,0.45)', track: 3,
    });
  }
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.fillRect(x + w * 0.14, top + 8, 7, h - 40);
  ctx.restore();

  // rim + spout
  ctx.strokeStyle = 'rgba(235,248,252,0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x + w, top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.quadraticCurveTo(x - 12, top - 16, x - 2, top - 26);
  ctx.stroke();
  if (label) {
    txt(ctx, label, cx, top + h + 74, {
      size: 26, font: F.mono6, color: 'rgba(242,231,211,0.72)', align: 'center', track: 3,
    });
  }
  ctx.restore();
}

/* ---------------------------------------------------------- glucometer --- */

export function glucometer(ctx, x, y, w, h, o = {}) {
  const { a = 1, value = '5,9', strip = 1, rot = 0 } = o;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  // body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 16;
  fillRR(ctx, 0, 0, w, h, 26, '#E9E4DA');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, 0, 0, w, h, [[0, '#FBFAF6'], [0.6, '#DDD6C8'], [1, '#B6AE9E']]);
  fillRR(ctx, 0, 0, w, h, 26, ctx.fillStyle);
  ctx.strokeStyle = 'rgba(0,0,0,0.20)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(1, 1, w - 2, h - 2, 26);
  else ctx.rect(0, 0, w, h);
  ctx.stroke();

  // screen
  fillRR(ctx, w * 0.12, h * 0.10, w * 0.76, h * 0.34, 8, '#12100E');
  txt(ctx, value, w * 0.5, h * 0.34, {
    size: h * 0.22, font: F.mono6, color: '#7FE8D2', align: 'center', track: 0,
    glowBlur: 14, glowColor: 'rgba(127,232,210,0.55)',
  });
  txt(ctx, 'mmol/L', w * 0.5, h * 0.42, {
    size: h * 0.055, font: F.mono, color: 'rgba(127,232,210,0.55)', align: 'center', track: 1,
  });

  // buttons
  ctx.fillStyle = 'rgba(60,60,60,0.35)';
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.arc(w * (0.28 + i * 0.22), h * 0.62, h * 0.045, 0, TAU);
    ctx.fill();
  });
  // brand strip
  ctx.fillStyle = 'rgba(30,95,91,0.7)';
  ctx.fillRect(w * 0.12, h * 0.74, w * 0.36, 6);

  // test strip sticking out of the top
  if (strip > 0) {
    ctx.save();
    ctx.globalAlpha *= strip;
    fillRR(ctx, w * 0.42, -h * 0.26, w * 0.16, h * 0.34, 4, '#F7F5EE');
    ctx.fillStyle = 'rgba(200,60,40,0.9)';
    ctx.fillRect(w * 0.42, -h * 0.26, w * 0.16, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(w * 0.46, -h * 0.16, w * 0.08, h * 0.16);
    ctx.restore();
  }
  ctx.restore();
}

/* ----------------------------------------------------------- wall clock --- */

/** Wall clock without bells; the body of the "two clocks" beat. */
export function wallClock(ctx, cx, cy, r, o = {}) {
  const {
    hh = 7, mm = 0, a = 1, face = '#F3E7CD', hands = '#171310',
    accent = P.red, rim = ['#A9723F', '#6B3C22', '#38200F'], label = '', glow = 0,
  } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx, cy);

  // bezel
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = '#2A1B14';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = radGrad(ctx, -r * 0.3, -r * 0.35, r * 0.2, r * 1.25, [
    [0, rim[0]], [0.6, rim[1]], [1, rim[2]],
  ]);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();

  // face
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.87, 0, TAU);
  ctx.fill();
  if (glow > 0) {
    ctx.fillStyle = radGrad(ctx, 0, 0, r * 0.1, r * 0.9, [
      [0, `rgba(120,232,214,${0.20 * glow})`], [1, 'rgba(120,232,214,0)'],
    ]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.87, 0, TAU);
    ctx.fill();
  }

  // minute ticks
  for (let i = 0; i < 60; i++) {
    const an = (i / 60) * TAU - Math.PI / 2;
    const big = i % 5 === 0;
    ctx.strokeStyle = big ? 'rgba(23,19,16,0.7)' : 'rgba(23,19,16,0.28)';
    ctx.lineWidth = big ? 4.5 : 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(an) * r * (big ? 0.74 : 0.79), Math.sin(an) * r * (big ? 0.74 : 0.79));
    ctx.lineTo(Math.cos(an) * r * 0.82, Math.sin(an) * r * 0.82);
    ctx.stroke();
  }
  [12, 3, 6, 9].forEach((n) => {
    const an = (n / 12) * TAU - Math.PI / 2;
    txt(ctx, String(n), Math.cos(an) * r * 0.58, Math.sin(an) * r * 0.58 + r * 0.045, {
      size: r * 0.15, font: F.mono6, color: 'rgba(23,19,16,0.72)', align: 'center', track: 1,
    });
  });

  // hands
  const hAng = ((hh % 12) / 12) * TAU - Math.PI / 2 + (mm / 60) * (TAU / 12);
  const mAng = (mm / 60) * TAU - Math.PI / 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = hands;
  ctx.lineWidth = r * 0.085;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(hAng) * r * 0.44, Math.sin(hAng) * r * 0.44);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(mAng) * r * 0.64, Math.sin(mAng) * r * 0.64);
  ctx.stroke();
  ctx.fillStyle = '#171310';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.045, 0, TAU);
  ctx.fill();

  // glass
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.87, 0, TAU);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, -r, -r, r * 0.5, r * 0.5, [
    [0, 'rgba(255,255,255,0.26)'], [0.5, 'rgba(255,255,255,0.02)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();

  if (label) {
    txt(ctx, label, 0, r + 92, {
      size: 24, font: F.mono6, color: 'rgba(242,231,211,0.6)', align: 'center', track: 5,
    });
  }
  ctx.restore();
}

/* -------------------------------------------------------- sheet content --- */

/** Run `fn` in the local coordinate space of a `sheet()` at (x,y,w,h,rot). */
export function sheetContent(ctx, x, y, w, h, rot, fn) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  fn();
  ctx.restore();
}

/** Rounded-rect stroke with an optional dash pattern. */
export function dashRR(ctx, x, y, w, h, r, color, lw = 2, dash = []) {
  ctx.save();
  if (dash.length) ctx.setLineDash(dash);
  strokeRR(ctx, x, y, w, h, r, color, lw);
  ctx.restore();
}
