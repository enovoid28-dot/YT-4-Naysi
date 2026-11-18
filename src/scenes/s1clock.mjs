import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  labelChip, groundShadow, seg7,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import { castShadow } from '../art/kit.mjs';

/* ------------------------------------------------------------------ room -- */
const WX = 830;
const WY = 250;
const WW = 520;
const WH = 820;
const FLOOR = 1700;
const NSX = 890;
const NSW = 296;
const NSY = 1290;
const NSH = 340;
const CLOCK_W = 228;
const CLOCK_H = 116;

function wall(ctx) {
  const g = linGrad(ctx, 0, 0, 0, FLOOR, [
    [0, '#0C101A'],
    [0.4, '#080B13'],
    [1, '#05070C'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, FLOOR + 2);

  // cool spill from the window onto the wall
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const s = radGrad(ctx, WX + WW * 0.45, WY + WH * 0.5, 0, 760, [
    [0, 'rgba(96,130,190,0.14)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = s;
  ctx.fillRect(WX - 420, WY - 300, WW + 840, WH + 700);
  ctx.restore();

  // baseboard
  const b1 = linGrad(ctx, 0, FLOOR - 52, 0, FLOOR, [
    [0, '#171C27'],
    [1, '#0A0D14'],
  ]);
  ctx.fillStyle = b1;
  ctx.fillRect(0, FLOOR - 52, W, 52);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(0, FLOOR - 52, W, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, FLOOR - 6, W, 6);
}

function floorPlane(ctx, t) {
  const g = linGrad(ctx, 0, FLOOR, 0, H, [
    [0, '#111722'],
    [0.35, '#0B0F18'],
    [1, '#05070C'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, FLOOR, W, H - FLOOR);

  // plank seams, converging to a vanishing point
  ctx.save();
  ctx.globalAlpha = 0.5;
  const vx = 720;
  const vy = 900;
  for (let i = -6; i <= 6; i++) {
    const fx = vx + i * 168;
    ctx.beginPath();
    ctx.moveTo(fx, H);
    ctx.lineTo(lerp(fx, vx, 0.42), FLOOR + 4);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const y = FLOOR + 110 + i * 170;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y + 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();

  // sheen where the moonlight lands
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const p = radGrad(ctx, 980, FLOOR + 150, 0, 720, [
    [0, 'rgba(120,155,215,0.16)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = p;
  ctx.beginPath();
  ctx.ellipse(980, FLOOR + 150, 720, 250, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function windowUnit(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;

  // recess behind the glass
  fillRR(ctx, WX - 18, WY - 18, WW + 36, WH + 36, 8, '#05070C');

  // night sky
  const sky = linGrad(ctx, 0, WY, 0, WY + WH, [
    [0, '#0F1A2E'],
    [0.45, '#0B1524'],
    [1, '#080E19'],
  ]);
  fillRR(ctx, WX, WY, WW, WH, 4, sky);

  // moon + halo
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const mx = WX + 366;
  const my = WY + 392;
  const halo = radGrad(ctx, mx, my, 0, 300, [
    [0, 'rgba(146,180,236,0.30)'],
    [0.35, 'rgba(120,158,220,0.12)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = halo;
  ctx.fillRect(WX, WY, WW, WH);
  ctx.beginPath();
  ctx.arc(mx, my, 40, 0, TAU);
  ctx.fillStyle = 'rgba(222,236,255,0.92)';
  ctx.fill();
  ctx.restore();

  // distant skyline
  ctx.save();
  ctx.fillStyle = 'rgba(5,8,14,0.94)';
  const r2 = rng(21);
  for (let x = WX - 10; x < WX + WW; x += 58) {
    const hh = 120 + r2() * 240;
    ctx.fillRect(x, WY + WH - hh, 50, hh);
    if (r2() > 0.62) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,196,120,0.16)';
      for (let k = 0; k < 4; k++) ctx.fillRect(x + 8 + (k % 2) * 20, WY + WH - hh + 30 + k * 42, 10, 12);
      ctx.restore();
      ctx.fillStyle = 'rgba(5,8,14,0.94)';
    }
  }
  ctx.restore();

  // blinds
  const slatH = 42;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const y = WY + 30 + i * 112;
    const g = linGrad(ctx, 0, y, 0, y + slatH, [
      [0, '#252C39'],
      [0.5, '#161C26'],
      [1, '#080B11'],
    ]);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    fillRR(ctx, WX + 6, y, WW - 12, slatH, 3, g);
    ctx.restore();
    // top highlight of each slat
    ctx.fillStyle = 'rgba(180,205,245,0.20)';
    ctx.fillRect(WX + 6, y, WW - 12, 2);
    // shadow line under the slat on the glass
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(WX + 6, y + slatH, WW - 12, 10);
  }

  // mullions
  ctx.fillStyle = '#101520';
  ctx.fillRect(WX + WW / 2 - 7, WY, 14, WH);
  ctx.fillRect(WX, WY + WH * 0.5 - 7, WW, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(WX + WW / 2 - 7, WY, 3, WH);

  // frame
  strokeRR(ctx, WX - 4, WY - 4, WW + 8, WH + 8, 6, '#1A2029', 18);
  strokeRR(ctx, WX + 1, WY + 1, WW - 2, WH - 2, 4, 'rgba(255,255,255,0.10)', 2);

  // sill
  const sill = linGrad(ctx, 0, WY + WH, 0, WY + WH + 30, [
    [0, '#20262F'],
    [1, '#0C1016'],
  ]);
  fillRR(ctx, WX - 34, WY + WH + 6, WW + 68, 26, 6, sill);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(WX - 34, WY + WH + 6, WW + 68, 2);
  ctx.restore();
}

function wallClock(ctx, t, a) {
  if (a <= 0) return;
  const cx = 336;
  const cy = 470;
  const R = 96;
  ctx.save();
  ctx.globalAlpha = a;

  // ambient shadow behind
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const halo = radGrad(ctx, cx, cy, R * 0.9, R * 2.6, [
    [0, 'rgba(120,150,205,0.06)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = halo;
  ctx.fillRect(cx - R * 2.6, cy - R * 2.6, R * 5.2, R * 5.2);
  ctx.restore();

  // drop shadow on the wall
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fillStyle = '#0F131B';
  ctx.fill();
  ctx.restore();

  // face
  ctx.beginPath();
  ctx.arc(cx, cy, R - 8, 0, TAU);
  ctx.fillStyle = radGrad(ctx, cx - 20, cy - 26, 0, R, [
    [0, '#1B212C'],
    [0.7, '#111520'],
    [1, '#090C13'],
  ]);
  ctx.fill();

  // ticks
  for (let i = 0; i < 60; i++) {
    const ang = (i / 60) * TAU;
    const major = i % 5 === 0;
    const r0 = R - (major ? 24 : 14);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    ctx.lineTo(cx + Math.cos(ang) * (R - 10), cy + Math.sin(ang) * (R - 10));
    ctx.strokeStyle = hexA(C.bone, major ? 0.42 : 0.16);
    ctx.lineWidth = major ? 3 : 1.5;
    ctx.stroke();
  }

  // bezel
  ctx.beginPath();
  ctx.arc(cx, cy, R - 3, 0, TAU);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // hands: 03:00 + a few minutes
  const handTo = (ang, len, w, col) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -len);
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  };
  handTo(TAU / 4, R - 46, 8, hexA(C.bone, 0.85));      // hour -> 3
  handTo(TAU * 0.08, R - 22, 5, hexA(C.bone, 0.8));    // minute -> +5min
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, TAU);
  ctx.fillStyle = C.amber;
  ctx.fill();
  ctx.restore();
}

/** Striped moon light thrown by the blinds, drawn on top of the room. */
function lightStripes(ctx, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 4; i++) {
    const top = WY + 210 + i * 168;
    const g = linGrad(ctx, WX, top, 470, FLOOR, [
      [0, 'rgba(140,175,235,0.075)'],
      [0.5, 'rgba(120,155,215,0.045)'],
      [1, 'rgba(120,155,215,0)'],
    ]);
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(WX + 20, top);
    ctx.lineTo(WX + WW - 20, top + 22);
    ctx.lineTo(690 - i * 30, FLOOR + 6);
    ctx.lineTo(430 - i * 54, FLOOR + 6);
    ctx.closePath();
    ctx.fill();
  }
  // pool on the floor
  const pg = radGrad(ctx, 560, FLOOR + 30, 0, 520, [
    [0, 'rgba(130,165,225,0.13)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.ellipse(560, FLOOR + 30, 520, 170, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------- bed -- */
function bed(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;

  castShadow(ctx, 540, 1690, 560, 58, 0.75);

  // headboard
  const hg = linGrad(ctx, 0, 1112, 0, 1700, [
    [0, '#2A323F'],
    [0.45, '#171D27'],
    [1, '#090C12'],
  ]);
  fillRR(ctx, 18, 1112, 224, 588, 24, hg);
  strokeRR(ctx, 18, 1112, 224, 588, 24, 'rgba(255,255,255,0.10)', 2);
  for (let i = 0; i < 3; i++) {
    fillRR(ctx, 38, 1136 + i * 184, 184, 170, 12, 'rgba(255,255,255,0.022)');
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fillRect(38, 1306 + i * 184, 184, 3);
  }
  ctx.save();
  ctx.beginPath();
  rr(ctx, 18, 1112, 224, 588, 24);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 190, 0, 242, 0, [
    [0, 'rgba(150,185,240,0)'],
    [1, 'rgba(150,185,240,0.20)'],
  ]);
  ctx.fillRect(190, 1112, 52, 588);
  ctx.restore();

  // base
  const bg = linGrad(ctx, 0, 1548, 0, 1690, [
    [0, '#1E2531'],
    [1, '#090C12'],
  ]);
  fillRR(ctx, 108, 1548, 754, 138, 18, bg);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(126, 1554, 718, 3);

  // mattress
  const mg = linGrad(ctx, 0, 1400, 0, 1560, [
    [0, '#3D4755'],
    [0.45, '#262E3A'],
    [1, '#141A23'],
  ]);
  fillRR(ctx, 108, 1396, 754, 158, 24, mg);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(136, 1400, 700, 3);
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 1470);
  ctx.lineTo(852, 1470);
  ctx.stroke();
  ctx.restore();

  // duvet, shaped by the body underneath
  const dg = linGrad(ctx, 0, 1318, 0, 1600, [
    [0, '#2C3546'],
    [0.38, '#1B2231'],
    [1, '#0B0F17'],
  ]);
  const duvetPath = () => {
    ctx.beginPath();
    ctx.moveTo(424, 1420);
    ctx.bezierCurveTo(452, 1348, 524, 1330, 606, 1344);
    ctx.bezierCurveTo(704, 1360, 764, 1346, 852, 1382);
    ctx.lineTo(852, 1544);
    ctx.bezierCurveTo(716, 1584, 520, 1580, 424, 1544);
    ctx.closePath();
  };
  duvetPath();
  ctx.fillStyle = dg;
  ctx.fill();

  ctx.save();
  duvetPath();
  ctx.clip();
  // rim light along the top
  ctx.strokeStyle = 'rgba(175,205,245,0.30)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(470, 1370);
  ctx.bezierCurveTo(560, 1338, 660, 1352, 748, 1350);
  ctx.stroke();
  // folds
  for (let i = 0; i < 3; i++) {
    const x = 520 + i * 112;
    ctx.beginPath();
    ctx.moveTo(x, 1340);
    ctx.bezierCurveTo(x + 28, 1420, x - 12, 1500, x + 18, 1590);
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 16;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 20, 1340);
    ctx.bezierCurveTo(x + 48, 1420, x + 8, 1500, x + 38, 1590);
    ctx.strokeStyle = 'rgba(255,255,255,0.055)';
    ctx.lineWidth = 8;
    ctx.stroke();
  }
  // shoulder crease
  ctx.beginPath();
  ctx.moveTo(452, 1424);
  ctx.bezierCurveTo(486, 1384, 552, 1368, 618, 1372);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.restore();

  // pillow
  const pg = linGrad(ctx, 200, 1352, 440, 1470, [
    [0, '#615C4E'],
    [0.5, '#464338'],
    [1, '#26251F'],
  ]);
  ctx.save();
  ctx.translate(318, 1424);
  ctx.rotate(-0.05);
  fillRR(ctx, -118, -54, 236, 108, 44, pg);
  strokeRR(ctx, -118, -54, 236, 108, 44, 'rgba(255,255,255,0.13)', 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-78, -2);
  ctx.lineTo(78, -2);
  ctx.stroke();
  ctx.restore();
  // shadow the head casts back onto the pillow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(356, 1402, 74, 56, -0.08, 0, TAU);
  const sg = radGrad(ctx, 356, 1402, 0, 78, [
    [0, 'rgba(0,0,0,0.55)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.restore();

  // sleeper, half sunk into the pillow
  ctx.save();
  const hgd = radGrad(ctx, 420, 1376, 0, 108, [
    [0, '#2E3743'],
    [0.55, '#161B24'],
    [1, '#070A0F'],
  ]);
  ctx.beginPath();
  ctx.ellipse(378, 1394, 70, 64, -0.05, 0, TAU);
  ctx.fillStyle = hgd;
  ctx.fill();
  // rim light
  ctx.beginPath();
  ctx.ellipse(378, 1394, 70, 64, -0.05, -1.35, 1.05);
  ctx.strokeStyle = 'rgba(170,205,250,0.42)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // neck shadow onto the duvet
  ctx.beginPath();
  ctx.ellipse(452, 1440, 34, 18, 0.3, 0, TAU);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  ctx.restore();

  // phone on the duvet
  ctx.save();
  ctx.translate(690, 1466);
  ctx.rotate(-0.46);
  const glowR = radGrad(ctx, 0, 0, 0, 250, [
    [0, 'rgba(255,196,128,0.24)'],
    [0.5, 'rgba(255,170,80,0.09)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = glowR;
  ctx.fillRect(-250, -250, 500, 500);
  const bodyG = linGrad(ctx, -54, 0, 54, 0, [
    [0, '#232932'],
    [1, '#0A0D12'],
  ]);
  fillRR(ctx, -52, -104, 104, 208, 20, bodyG);
  strokeRR(ctx, -52, -104, 104, 208, 20, 'rgba(255,255,255,0.18)', 2);
  const sc = linGrad(ctx, 0, -90, 0, 90, [
    [0, 'rgba(255,228,186,0.98)'],
    [1, 'rgba(255,168,72,0.9)'],
  ]);
  fillRR(ctx, -42, -90, 84, 180, 13, sc);
  ctx.fillStyle = 'rgba(30,18,8,0.5)';
  ctx.fillRect(-28, -72, 58, 7);
  ctx.fillRect(-28, -50, 42, 7);
  ctx.fillRect(-28, -28, 52, 7);
  const sheen = linGrad(ctx, -42, -90, 42, 90, [
    [0, 'rgba(255,255,255,0.32)'],
    [0.45, 'rgba(255,255,255,0.04)'],
    [1, 'rgba(255,255,255,0)'],
  ]);
  fillRR(ctx, -42, -90, 84, 180, 13, sheen);
  ctx.restore();

  // nightstand
  castShadow(ctx, NSX + NSW / 2, NSY + NSH + 12, 220, 32, 0.7);
  const ng = linGrad(ctx, 0, NSY, 0, NSY + NSH, [
    [0, '#2B323D'],
    [0.14, '#1B2129'],
    [1, '#0B0E15'],
  ]);
  fillRR(ctx, NSX, NSY, NSW, NSH, 10, ng);
  const tg = linGrad(ctx, 0, NSY, 0, NSY + 26, [
    [0, '#343C49'],
    [1, '#1B2129'],
  ]);
  fillRR(ctx, NSX, NSY, NSW, 26, 9, tg);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(NSX + 8, NSY, NSW - 16, 2);
  fillRR(ctx, NSX + 18, NSY + 54, NSW - 36, 120, 6, '#0E121A');
  strokeRR(ctx, NSX + 18, NSY + 54, NSW - 36, 120, 6, 'rgba(255,255,255,0.09)', 2);
  ctx.beginPath();
  ctx.arc(NSX + NSW / 2, NSY + 114, 11, 0, TAU);
  ctx.fillStyle = radGrad(ctx, NSX + NSW / 2 - 3, NSY + 111, 0, 14, [
    [0, '#CFA76B'],
    [1, '#6B5127'],
  ]);
  ctx.fill();

  ctx.restore();
}

/* ----------------------------------------------------------------- clock -- */
function clockFace(ctx, t, x, y, alpha, ghost = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;

  if (!ghost) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = radGrad(ctx, x + CLOCK_W / 2, y + CLOCK_H / 2, 0, 250, [
      [0, 'rgba(255,150,60,0.30)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(x - 200, y - 200, CLOCK_W + 400, CLOCK_H + 400);
    ctx.restore();
  }

  // body
  const body = linGrad(ctx, 0, y, 0, y + CLOCK_H, [
    [0, ghost ? 'rgba(255,110,60,0.5)' : '#1B1F27'],
    [1, ghost ? 'rgba(255,90,40,0.32)' : '#080A0F'],
  ]);
  fillRR(ctx, x, y, CLOCK_W, CLOCK_H, 10, body);
  if (!ghost) {
    strokeRR(ctx, x, y, CLOCK_W, CLOCK_H, 10, 'rgba(255,255,255,0.14)', 2);
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(x + 10, y + 1.5, CLOCK_W - 20, 2);
  }

  // digits
  const col = ghost ? 'rgba(255,130,70,0.85)' : C.amber;
  const h = 62;
  const dy = y + (CLOCK_H - h) / 2;
  let dx = x + 20;
  const dw = h * 0.55;
  const blink = Math.sin(t * 3.6) > -0.35 ? 1 : 0.14;
  seg7(ctx, '0', dx, dy, h, col, { glowBlur: ghost ? 0 : 18, on: 1 });
  dx += dw + 9;
  seg7(ctx, '3', dx, dy, h, col, { glowBlur: ghost ? 0 : 18, on: 1 });
  dx += dw + 12;
  ctx.save();
  ctx.globalAlpha *= blink;
  ctx.fillStyle = col;
  ctx.fillRect(dx, dy + h * 0.28, 9, 9);
  ctx.fillRect(dx, dy + h * 0.64, 9, 9);
  ctx.restore();
  dx += 22;
  seg7(ctx, '0', dx, dy, h, col, { glowBlur: ghost ? 0 : 18, on: 1 });
  dx += dw + 9;
  seg7(ctx, '0', dx, dy, h, col, { glowBlur: ghost ? 0 : 18, on: 1 });

  // glass sheen
  if (!ghost) {
    ctx.save();
    rr(ctx, x, y, CLOCK_W, CLOCK_H, 10);
    ctx.clip();
    const sh = linGrad(ctx, x, y, x + CLOCK_W, y + CLOCK_H, [
      [0, 'rgba(255,255,255,0.10)'],
      [0.35, 'rgba(255,255,255,0.02)'],
      [1, 'rgba(255,255,255,0)'],
    ]);
    ctx.fillStyle = sh;
    ctx.fillRect(x, y, CLOCK_W, CLOCK_H);
    ctx.restore();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    wall(ctx);
    floorPlane(ctx, t);
    windowUnit(ctx, t, clamp((t - 0.05) / 0.7));
    wallClock(ctx, t, clamp((t - 0.3) / 0.9));
    bed(ctx, t, clamp((t - 0.1) / 0.8));
    lightStripes(ctx, clamp((t - 0.35) / 1.1));

    // clock on the nightstand
    const cx = NSX + (NSW - CLOCK_W) / 2;
    const cy = NSY - CLOCK_H;
    const pop = 1 + 0.05 * Math.max(0, 1 - Math.abs(t - 0.95) / 0.4);
    ctx.save();
    ctx.translate(cx + CLOCK_W / 2, cy + CLOCK_H / 2);
    ctx.scale(pop, pop);
    ctx.translate(-(cx + CLOCK_W / 2), -(cy + CLOCK_H / 2));
    // contact shadow on the wood
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(cx + CLOCK_W / 2, cy + CLOCK_H + 4, CLOCK_W * 0.52, 10, 0, 0, TAU);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fill();
    ctx.restore();
    clockFace(ctx, t, cx, cy, 1);
    ctx.restore();

    // drunken double vision
    const ghost = clamp((t - 10.7) / 0.5);
    if (ghost > 0) {
      const wob = Math.sin(t * 5.2) * 15 * ghost;
      clockFace(ctx, t, cx + wob, cy - 10 * ghost, 0.24 * ghost, 1);
      clockFace(ctx, t, cx - wob * 0.7, cy + 12 * ghost, 0.20 * ghost, 1);
    }

    // HUD chips
    const c1 = clamp((t - 3.95) / 0.28);
    if (c1 > 0) {
      ctx.save();
      ctx.globalAlpha = c1;
      const dx = (1 - EASE.outCubic(c1)) * -26;
      labelChip(ctx, 'ALARM 07:00', M + dx, 790, {
        size: 26, font: F.num6, track: 4, padX: 20, padY: 13, align: 'left',
        dot: C.sky, dotColor: C.sky,
      });
      ctx.restore();
    }
    const c2 = clamp((t - 7.45) / 0.28);
    if (c2 > 0) {
      ctx.save();
      ctx.globalAlpha = c2;
      const dx = (1 - EASE.outCubic(c2)) * -26;
      labelChip(ctx, 'TIDUR 4 JAM', M + dx, 882, {
        size: 26, font: F.num6, track: 4, padX: 20, padY: 13, align: 'left',
        color: C.amber, dot: C.amber, dotColor: C.amber,
      });
      ctx.restore();
    }
  },
};
