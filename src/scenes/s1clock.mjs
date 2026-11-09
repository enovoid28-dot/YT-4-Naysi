import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  labelChip, groundShadow,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';

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

function wall(ctx, t) {
  const g = linGrad(ctx, 0, 0, 0, FLOOR, [
    [0, '#0B0E16'],
    [0.45, '#080A11'],
    [1, '#05060A'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, FLOOR + 4);

  // faint wall panel seams
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let x = 210; x < W; x += 300) {
    ctx.fillStyle = C.bone;
    ctx.fillRect(x, 0, 3, FLOOR);
  }
  ctx.restore();
}

function floorPlane(ctx, t) {
  const g = linGrad(ctx, 0, FLOOR, 0, H, [
    [0, '#0D1119'],
    [1, '#06070C'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, FLOOR, W, H - FLOOR);
  ctx.save();
  ctx.fillStyle = hexA(C.bone, 0.12);
  ctx.fillRect(0, FLOOR, W, 3);
  ctx.restore();

  // reflected window light on the boards
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const p = radGrad(ctx, 900, FLOOR + 120, 0, 640, [
    [0, 'rgba(126,158,214,0.13)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = p;
  ctx.beginPath();
  ctx.ellipse(900, FLOOR + 120, 640, 220, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function windowFn(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;

  // night sky behind the glass
  const sky = linGrad(ctx, 0, WY, 0, WY + WH, [
    [0, '#101A2C'],
    [0.55, '#0C1524'],
    [1, '#0A101C'],
  ]);
  fillRR(ctx, WX, WY, WW, WH, 6, sky);

  // moon outside
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const mg = radGrad(ctx, WX + 372, WY + 392, 0, 340, [
    [0, 'rgba(150,186,238,0.34)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = mg;
  ctx.fillRect(WX, WY, WW, WH);
  ctx.beginPath();
  ctx.arc(WX + 372, WY + 392, 44, 0, TAU);
  ctx.fillStyle = 'rgba(214,230,255,0.9)';
  ctx.fill();
  ctx.restore();

  // distant buildings
  ctx.save();
  ctx.fillStyle = 'rgba(6,9,16,0.92)';
  const r = rng(21);
  for (let x = WX; x < WX + WW; x += 62) {
    const h = 110 + r() * 250;
    ctx.fillRect(x, WY + WH - h, 54, h);
  }
  ctx.restore();

  // window frame
  strokeRR(ctx, WX, WY, WW, WH, 8, '#151A23', 14);

  // blinds
  for (let i = 0; i < 7; i++) {
    const y = WY + 34 + i * 108;
    const g = linGrad(ctx, 0, y, 0, y + 40, [
      [0, '#1C222D'],
      [1, '#0B0E15'],
    ]);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    fillRR(ctx, WX + 8, y, WW - 16, 40, 4, g);
    ctx.restore();
    ctx.fillStyle = 'rgba(160,190,235,0.10)';
    ctx.fillRect(WX + 8, y + 40, WW - 16, 2);
  }
  ctx.restore();
}

function shafts(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 4; i++) {
    const y0 = WY + 74 + i * 200;
    const y1 = y0 + 46;
    const sx = WX + 10;
    const ex = 210 - i * 40;
    const g = linGrad(ctx, sx, y0, ex, FLOOR, [
      [0, 'rgba(150,186,238,0.085)'],
      [1, 'rgba(150,186,238,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx, y0);
    ctx.lineTo(sx + WW - 20, y1);
    ctx.lineTo(640 - i * 30, FLOOR);
    ctx.lineTo(ex, FLOOR);
    ctx.closePath();
    ctx.fill();
  }
  // moon pool on the floor
  const pg = radGrad(ctx, 520, FLOOR + 60, 0, 520, [
    [0, 'rgba(150,186,238,0.12)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.ellipse(520, FLOOR + 60, 520, 170, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------- bed -- */
function bed(ctx, t, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;

  // headboard
  const hg = linGrad(ctx, 0, 1080, 0, 1520, [
    [0, '#1A1E28'],
    [1, '#0B0D14'],
  ]);
  fillRR(ctx, 10, 1080, 186, 466, 16, hg);
  strokeRR(ctx, 10, 1080, 186, 466, 16, 'rgba(255,255,255,0.07)', 2);
  fillRR(ctx, 34, 1130, 138, 6, 3, 'rgba(255,255,255,0.06)');

  groundShadow(ctx, 430, 1656, 480, 56, 0.65);

  // mattress
  const mg = linGrad(ctx, 0, 1400, 0, 1600, [
    [0, '#232A35'],
    [1, '#0F131B'],
  ]);
  fillRR(ctx, 150, 1400, 660, 200, 28, mg);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(176, 1406, 608, 5);

  // blanket over the body
  const bg = linGrad(ctx, 0, 1350, 0, 1610, [
    [0, '#1C232F'],
    [0.5, '#121822'],
    [1, '#0A0D14'],
  ]);
  ctx.beginPath();
  ctx.moveTo(310, 1440);
  ctx.bezierCurveTo(430, 1352, 660, 1358, 812, 1420);
  ctx.lineTo(812, 1596);
  ctx.bezierCurveTo(620, 1618, 380, 1614, 310, 1596);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();
  // blanket rim light from the window
  ctx.save();
  ctx.strokeStyle = 'rgba(150,186,238,0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(470, 1382);
  ctx.bezierCurveTo(610, 1356, 730, 1374, 812, 1420);
  ctx.stroke();
  ctx.restore();
  // folds
  ctx.save();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(470 + i * 108, 1400);
    ctx.bezierCurveTo(492 + i * 108, 1470, 470 + i * 108, 1530, 506 + i * 108, 1592);
    ctx.strokeStyle = 'rgba(0,0,0,0.30)';
    ctx.lineWidth = 9;
    ctx.stroke();
  }
  ctx.restore();

  // pillow
  const pg = linGrad(ctx, 260, 1330, 520, 1450, [
    [0, '#5C5A50'],
    [1, '#35342E'],
  ]);
  ctx.save();
  ctx.translate(404, 1372);
  ctx.rotate(-0.04);
  fillRR(ctx, -158, -56, 316, 112, 44, pg);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 2;
  strokeRR(ctx, -158, -56, 316, 112, 44, 'rgba(255,255,255,0.10)', 2);
  ctx.restore();

  // sleeper's head, seen from behind
  ctx.save();
  const hgd = radGrad(ctx, 420, 1298, 0, 100, [
    [0, '#1B2029'],
    [1, '#080B11'],
  ]);
  ctx.beginPath();
  ctx.ellipse(392, 1326, 62, 58, -0.06, 0, TAU);
  ctx.fillStyle = hgd;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(392, 1326, 62, 58, -0.06, -1.2, 1.25);
  ctx.strokeStyle = 'rgba(150,186,238,0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // shoulder line under the blanket
  ctx.beginPath();
  ctx.moveTo(330, 1392);
  ctx.bezierCurveTo(370, 1372, 424, 1372, 462, 1394);
  ctx.strokeStyle = 'rgba(150,186,238,0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // phone face up on the blanket, still glowing
  ctx.save();
  ctx.translate(628, 1502);
  ctx.rotate(-0.5);
  const glowR = radGrad(ctx, 0, 0, 0, 230, [
    [0, 'rgba(255,190,120,0.20)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = glowR;
  ctx.fillRect(-230, -230, 460, 460);
  fillRR(ctx, -52, -104, 104, 208, 18, '#0A0C12');
  const sc = linGrad(ctx, 0, -92, 0, 92, [
    [0, 'rgba(255,220,170,0.95)'],
    [1, 'rgba(255,168,80,0.6)'],
  ]);
  fillRR(ctx, -42, -92, 84, 184, 12, sc);
  ctx.fillStyle = 'rgba(24,16,8,0.55)';
  ctx.fillRect(-30, -74, 60, 6);
  ctx.fillRect(-30, -54, 40, 6);
  ctx.fillRect(-30, -34, 52, 6);
  ctx.restore();

  // nightstand
  const ng = linGrad(ctx, NSX, 0, NSX + NSW, 0, [
    [0, '#1B2029'],
    [1, '#0C0F16'],
  ]);
  fillRR(ctx, NSX, NSY, NSW, NSH, 12, ng);
  strokeRR(ctx, NSX, NSY, NSW, NSH, 12, 'rgba(255,255,255,0.08)', 2);
  ctx.save();
  ctx.globalAlpha = 0.5;
  fillRR(ctx, NSX + 22, NSY + 148, NSW - 44, 4, 2, 'rgba(255,255,255,0.10)');
  ctx.beginPath();
  ctx.arc(NSX + NSW / 2, NSY + 246, 9, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/* ----------------------------------------------------------------- clock -- */
function clockFace(ctx, t, x, y, w, h, alpha, ghost = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;

  if (!ghost) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = radGrad(ctx, x + w / 2, y + h / 2, 0, 240, [
      [0, 'rgba(255,140,60,0.28)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(x - 200, y - 200, w + 400, h + 400);
    ctx.restore();
  }

  fillRR(ctx, x, y, w, h, 12, ghost ? 'rgba(255,90,40,0.35)' : '#0A0B10');
  if (!ghost) strokeRR(ctx, x, y, w, h, 12, 'rgba(255,255,255,0.12)', 2);

  const blink = Math.sin(t * 3.6) > -0.35 ? 1 : 0.12;
  const col = ghost ? 'rgba(255,120,60,0.8)' : C.amber;
  const size = 62;
  const base = y + h / 2 + size * 0.34;
  txt(ctx, '03', x + 26, base, { size, font: F.num, color: col, track: 2 });
  ctx.save();
  ctx.globalAlpha *= blink;
  txt(ctx, ':', x + 134, base - 2, { size, font: F.num, color: col });
  ctx.restore();
  txt(ctx, '00', x + 158, base, { size, font: F.num, color: col, track: 2 });

  if (!ghost) {
    tracking(ctx, 'AM', x + w - 18, y + h - 16, {
      size: 17, font: F.num6, track: 3, align: 'right', color: hexA(C.bone, 0.5),
    });
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    const roomIn = clamp(t / 0.55);
    wall(ctx, t);
    windowFn(ctx, t, clamp((t - 0.05) / 0.7));
    shafts(ctx, t, clamp((t - 0.25) / 1.0));
    floorPlane(ctx, t);
    bed(ctx, t, clamp((t - 0.1) / 0.8));

    // clock on the nightstand
    const clockPop = 1 + 0.06 * Math.max(0, 1 - Math.abs(t - 0.95) / 0.4);
    ctx.save();
    ctx.translate(NSX + 0.5 * NSW, NSY - 84);
    ctx.scale(clockPop, clockPop);
    ctx.translate(-(NSX + 0.5 * NSW), -(NSY - 84));
    clockFace(ctx, t, NSX + 36, NSY - 140, 224, 112, 1);
    ctx.restore();

    // drunken double vision once the word "mabuk" lands
    const ghost = clamp((t - 10.7) / 0.5);
    if (ghost > 0) {
      const wobble = Math.sin(t * 5.2) * 16 * ghost;
      clockFace(ctx, t, NSX + 36 + wobble, NSY - 140 - 10 * ghost, 224, 112, 0.35 * ghost, 1);
      clockFace(ctx, t, NSX + 36 - wobble * 0.7, NSY - 140 + 12 * ghost, 224, 112, 0.3 * ghost, 1);
    }

    // HUD chips
    const c1 = clamp((t - 3.95) / 0.28);
    if (c1 > 0) {
      ctx.save();
      ctx.globalAlpha = c1;
      const dx = (1 - EASE.outCubic(c1)) * -26;
      labelChip(ctx, 'ALARM 07:00', M + dx, 620, {
        size: 26, font: F.num6, track: 4, padX: 20, padY: 13, align: 'left', dot: C.sky, dotColor: C.sky,
      });
      ctx.restore();
    }
    const c2 = clamp((t - 7.45) / 0.28);
    if (c2 > 0) {
      ctx.save();
      ctx.globalAlpha = c2;
      const dx = (1 - EASE.outCubic(c2)) * -26;
      labelChip(ctx, 'TIDUR 4 JAM', M + dx, 712, {
        size: 26, font: F.num6, track: 4, padX: 20, padY: 13, align: 'left',
        color: C.amber, dot: C.amber, dotColor: C.amber,
      });
      ctx.restore();
    }
  },
};
