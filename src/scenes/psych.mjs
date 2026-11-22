import { W, H, C, txt, tracking, hexA, fillRR, strokeRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';

const ink = '#080B12';
const cyan = '#6AE2E7';
const coral = '#FF765F';
const cream = '#F4F0E6';

function line(ctx, points, color, width = 3, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.stroke(); ctx.restore();
}
function ring(ctx, x, y, r, color, a = 1, width = 3) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, r, color, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
}
function panel(ctx, x, y, w, h, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; fillRR(ctx, x, y, w, h, 24, 'rgba(16,23,34,0.82)');
  strokeRR(ctx, x, y, w, h, 24, 'rgba(210,232,235,0.13)', 2); ctx.restore();
}
function brain(ctx, x, y, s, t, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  const halo = radGrad(ctx, 0, 0, 26, 260, [[0, 'rgba(106,226,231,0.16)'], [1, 'rgba(106,226,231,0)']]);
  ctx.fillStyle = halo; ctx.fillRect(-260, -260, 520, 520);
  ctx.fillStyle = '#152532'; ctx.strokeStyle = cyan; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, -124); ctx.bezierCurveTo(-35, -196, -126, -174, -132, -97);
  ctx.bezierCurveTo(-215, -78, -191, 25, -142, 49); ctx.bezierCurveTo(-156, 123, -83, 164, -30, 129);
  ctx.bezierCurveTo(-6, 159, 8, 159, 30, 129); ctx.bezierCurveTo(83, 164, 156, 123, 142, 49);
  ctx.bezierCurveTo(191, 25, 215, -78, 132, -97); ctx.bezierCurveTo(126, -174, 35, -196, 0, -124); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(106,226,231,0.62)'; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const xx = -100 + i * 39;
    ctx.beginPath(); ctx.moveTo(xx, -100 + Math.sin(i) * 8);
    ctx.bezierCurveTo(xx - 35, -52, xx + 31, -24, xx - 4, 4 + i * 4);
    ctx.bezierCurveTo(xx - 42, 45, xx + 35, 74, xx - 5, 110); ctx.stroke();
  }
  ctx.strokeStyle = '#FFBA69'; ctx.lineWidth = 5; ctx.setLineDash([7, 10]);
  ctx.beginPath(); ctx.moveTo(0, -128); ctx.lineTo(0, 132); ctx.stroke(); ctx.setLineDash([]);
  const p = (t * 0.72) % 1; const yy = lerp(-116, 118, p);
  dot(ctx, -9, yy, 11, '#FFF1CC');
  ctx.restore();
}
function hand(ctx, x, y, s, t, { palm = cream, glow = cyan, a = 1, flip = false } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (flip ? -1 : 1), s); ctx.globalAlpha *= a;
  const bob = Math.sin(t * 2.1) * 8;
  const g = radGrad(ctx, 0, 0, 30, 380, [[0, hexA(glow, 0.18)], [1, 'rgba(0,0,0,0)']]);
  ctx.fillStyle = g; ctx.fillRect(-380, -380, 760, 760);
  ctx.fillStyle = palm; ctx.strokeStyle = 'rgba(255,255,255,0.72)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-95, 105 + bob); ctx.bezierCurveTo(-137, 85, -144, 25, -125, -42);
  ctx.lineTo(-102, -133); ctx.quadraticCurveTo(-90, -162, -71, -150); ctx.quadraticCurveTo(-57, -142, -66, -111);
  ctx.lineTo(-81, -55); ctx.lineTo(-59, -192); ctx.quadraticCurveTo(-55, -222, -34, -217);
  ctx.quadraticCurveTo(-14, -213, -21, -184); ctx.lineTo(-33, -45);
  ctx.lineTo(-14, -222); ctx.quadraticCurveTo(-10, -252, 12, -247); ctx.quadraticCurveTo(31, -243, 27, -212);
  ctx.lineTo(17, -43); ctx.lineTo(39, -190); ctx.quadraticCurveTo(44, -218, 65, -208); ctx.quadraticCurveTo(84, -199, 76, -169);
  ctx.lineTo(53, -27); ctx.quadraticCurveTo(103, -90, 124, -57); ctx.quadraticCurveTo(137, -38, 113, -10);
  ctx.lineTo(54, 89); ctx.quadraticCurveTo(27, 133, -23, 134); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function wave(ctx, x, y, w, amp, phase, color, alpha = 1, freq = 0.018) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.beginPath();
  for (let i = 0; i <= w; i += 5) {
    const env = 0.25 + 0.75 * Math.pow(Math.sin(Math.PI * i / w), 0.8);
    const yy = y + Math.sin(i * freq + phase) * amp * env + Math.sin(i * freq * 2.37 - phase * 0.6) * amp * 0.14 * env;
    if (!i) ctx.moveTo(x + i, yy); else ctx.lineTo(x + i, yy);
  }
  ctx.stroke(); ctx.restore();
}
function foot(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.2) * 0.025);
  ctx.fillStyle = '#E9C8AA'; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-150, 146); ctx.bezierCurveTo(-185, 80, -163, -11, -129, -102);
  ctx.bezierCurveTo(-99, -181, -36, -204, 18, -161); ctx.bezierCurveTo(79, -116, 106, -21, 83, 61);
  ctx.bezierCurveTo(64, 126, 15, 166, -55, 170); ctx.closePath(); ctx.fill(); ctx.stroke();
  [-78, -40, 0, 36].forEach((xx, i) => {
    ctx.beginPath(); ctx.ellipse(xx, -133 - (i === 0 ? 12 : 0), 24, 35 - i * 2, 0.2, 0, TAU);
    ctx.fillStyle = '#F3D8C2'; ctx.fill(); ctx.stroke();
  });
  ctx.restore();
}
function tickleLines(ctx, x, y, t, strength = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3) * 0.04); ctx.strokeStyle = coral; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const a = -1.45 + (i / 6) * 1.5; const r = 50 + (i % 3) * 18;
    const p = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.7);
    ctx.globalAlpha = strength * p;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(a) * (r + 33 + p * 22), Math.sin(a) * (r + 33 + p * 22)); ctx.stroke();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene) {
    const phase = Math.max(1, Number(scene.index) || 1);
    const fade = EASE.outCubic(clamp((t + 0.12) / 0.65));
    ctx.save(); ctx.fillStyle = ink; ctx.fillRect(0, 0, W, H);
    const bg = radGrad(ctx, 720, 930, 10, 1280, [[0, 'rgba(22,46,57,0.58)'], [0.58, 'rgba(10,18,28,0.22)'], [1, 'rgba(5,6,10,0)']]);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // Technical drafting grid and warm edge falloff.
    ctx.save(); ctx.globalAlpha = 0.11;
    for (let x = 80; x < W; x += 80) { ctx.strokeStyle = x % 320 === 0 ? cyan : '#8898A7'; ctx.lineWidth = x % 320 === 0 ? 1.5 : 0.7; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 1810); ctx.stroke(); }
    for (let y = 320; y < 1820; y += 80) { ctx.strokeStyle = y % 320 === 0 ? cyan : '#8898A7'; ctx.lineWidth = y % 320 === 0 ? 1.5 : 0.7; ctx.beginPath(); ctx.moveTo(64, y); ctx.lineTo(W - 64, y); ctx.stroke(); }
    ctx.restore();
    // Header / specimen index.
    tracking(ctx, 'NAYSI  /  LABORATORIUM PERSEPSI', 112, 284, { size: 24, font: F.num6, track: 4, color: hexA(cream, 0.62) });
    panel(ctx, 1100, 235, 210, 70, 0.75); tracking(ctx, `TEST 0${phase}`, 1202, 280, { size: 23, font: F.num6, track: 3, color: cyan, align: 'center' });
    const pulse = 0.58 + 0.42 * Math.sin(t * 4.2);

    if (phase === 1) {
      foot(ctx, 720, 1060, 1.35, t);
      hand(ctx, 475, 710, 0.72, t, { glow: cyan, flip: true, palm: '#F6D9C2' });
      tickleLines(ctx, 650, 1040, t, 0.36);
      ring(ctx, 720, 1050, 345 + pulse * 14, cyan, 0.28, 3);
      txt(ctx, 'SELF / TOUCH', 720, 1530, { size: 28, font: F.num6, color: cyan, align: 'center', track: 6 });
    } else if (phase === 2) {
      brain(ctx, 720, 770, 1.2, t, fade);
      wave(ctx, 160, 1260, 1120, 30, t * 4, cyan, 0.9, 0.018);
      panel(ctx, 245, 1370, 950, 122, 0.84);
      tracking(ctx, 'PREDIKSI  →  SENTUHAN', 720, 1450, { size: 35, font: F.num6, track: 5, color: cream, align: 'center' });
      for (let i = 0; i < 6; i++) ring(ctx, 260 + i * 185, 1260, 15 + ((t * 45 + i * 14) % 54), cyan, 0.55 - (i % 3) * 0.1, 2);
    } else if (phase === 3) {
      brain(ctx, 565, 810, 0.94, t, fade);
      hand(ctx, 1060, 1170, 0.74, t, { palm: '#F3D8C2', glow: coral });
      line(ctx, [[610, 1040], [736, 1185], [935, 1230]], '#FFBA69', 5, 0.84);
      line(ctx, [[615, 1080], [835, 930], [1015, 970]], cyan, 5, 0.82);
      [0, 1, 2, 3].forEach((i) => dot(ctx, 705 + i * 56, 1155 - i * 37, 10, '#FFBA69', pulse));
      panel(ctx, 270, 1480, 900, 118, 0.82);
      tracking(ctx, 'PERINTAH  +  SALINAN PREDIKSI', 720, 1554, { size: 27, font: F.num6, track: 3, color: cream, align: 'center' });
    } else if (phase === 4) {
      hand(ctx, 985, 900, 0.9, t, { palm: '#F2D5BE', glow: cyan, flip: true });
      // Two distinct arrival traces: a quiet, expected tap and a broad, delayed one.
      wave(ctx, 170, 1260, 1100, 18, t * 5, cyan, 0.9, 0.024);
      for (let i = 0; i < 6; i++) ring(ctx, 285 + i * 142, 1260, 20 + (t * 48 + i * 19) % 58, cyan, 0.36, 2);
      panel(ctx, 244, 1410, 952, 120, 0.8);
      tracking(ctx, 'GERAKAN SENDIRI  /  KEJUTAN KECIL', 720, 1488, { size: 28, font: F.num6, track: 3, color: cream, align: 'center' });
      tickleLines(ctx, 1110, 1190, t, 0.3);
    } else if (phase === 5) {
      // Lab apparatus: remote lever, actuator, finger pad and measurement display.
      panel(ctx, 160, 550, 1120, 820, 0.92);
      tracking(ctx, 'ROBOTIC SELF-TICKLE TEST', 720, 625, { size: 27, font: F.num6, track: 5, color: cyan, align: 'center' });
      fillRR(ctx, 300, 735, 315, 370, 22, '#182633'); strokeRR(ctx, 300, 735, 315, 370, 22, 'rgba(106,226,231,0.54)', 3);
      fillRR(ctx, 360, 830, 195, 40, 14, '#3B5966');
      line(ctx, [[410, 1030], [600, 980], [730, 980], [910, 930]], '#D9E2DE', 16, 0.95);
      ring(ctx, 450, 1018, 44, '#FFBA69', 0.95, 8);
      fillRR(ctx, 890, 825, 170, 58, 20, '#F0D4BE');
      const delay = 0.5 + 0.5 * Math.sin(t * 2.3);
      dot(ctx, 735 + 110 * delay, 978, 18, coral); dot(ctx, 450, 1018, 13, cyan);
      line(ctx, [[450, 1090], [450, 1190], [1005, 1190], [1005, 900]], coral, 4, 0.7);
      txt(ctx, 'TUAS', 450, 1254, { size: 24, font: F.num6, color: cream, align: 'center', track: 4 });
      txt(ctx, 'AKTUATOR', 1005, 1254, { size: 24, font: F.num6, color: cream, align: 'center', track: 4 });
      panel(ctx, 380, 1448, 680, 96, 0.82);
      tracking(ctx, 'RESPONS SENTUHAN', 720, 1510, { size: 25, font: F.num6, track: 4, color: cream, align: 'center' });
    } else if (phase === 6) {
      panel(ctx, 150, 560, 1140, 900, 0.9);
      tracking(ctx, 'PREDIKSI  /  KENYATAAN', 720, 650, { size: 27, font: F.num6, track: 5, color: hexA(cream, 0.74), align: 'center' });
      const off = Math.sin(t * 1.4) * 8;
      wave(ctx, 240, 860, 960, 38, t * 2, cyan, 0.98, 0.014);
      wave(ctx, 240, 1140, 960, 52, t * 2 + 1.1 + off * 0.01, coral, 0.96, 0.014);
      for (let i = 0; i < 8; i++) {
        const xx = 280 + i * 120;
        line(ctx, [[xx, 790], [xx, 1210]], 'rgba(228,238,239,0.18)', 2);
        dot(ctx, xx, 860 + Math.sin(i * 1.3 + t * 2) * 25, 7, cyan);
        dot(ctx, xx + (i % 3 === 0 ? 34 : 0), 1140 + Math.sin(i * 1.3 + t * 2 + 1) * 34, 8, coral);
      }
      tracking(ctx, 'DIHARAPKAN', 360, 1325, { size: 22, font: F.num6, track: 3, color: cyan });
      tracking(ctx, 'TERTUNDA', 360, 1405, { size: 22, font: F.num6, track: 3, color: coral });
      txt(ctx, 'JEDA  →  LEBIH MENGEJUTKAN', 720, 1545, { size: 28, font: F.num6, color: cream, align: 'center', track: 3 });
    } else if (phase === 7) {
      brain(ctx, 720, 780, 1.18, t, fade);
      // Cerebellum as a highlighted lower-rear region; labelled without overclaiming.
      ctx.save(); ctx.fillStyle = coral; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.ellipse(845, 875, 72, 44, -0.15, 0, TAU); ctx.fill(); ctx.restore();
      line(ctx, [[832, 893], [1030, 1070], [1100, 1070]], coral, 4, 0.9);
      panel(ctx, 960, 1030, 290, 94, 0.92);
      tracking(ctx, 'SEREBELUM', 1105, 1089, { size: 23, font: F.num6, track: 3, color: cream, align: 'center' });
      wave(ctx, 185, 1380, 1070, 20, t * 5, cyan, 0.82, 0.02);
      tracking(ctx, 'PREDIKSI SENSORIK', 720, 1505, { size: 26, font: F.num6, track: 4, color: cyan, align: 'center' });
    } else {
      // Payoff: one expected self-made touch versus another person breaking the prediction.
      panel(ctx, 110, 545, 580, 780, 0.88); panel(ctx, 750, 545, 580, 780, 0.88);
      txt(ctx, 'KAMU SENDIRI', 400, 642, { size: 27, font: F.num6, color: cyan, align: 'center', track: 4 });
      txt(ctx, 'ORANG LAIN', 1040, 642, { size: 27, font: F.num6, color: coral, align: 'center', track: 4 });
      hand(ctx, 400, 870, 0.7, t, { palm: '#F1D4BC', glow: cyan, flip: true });
      hand(ctx, 1040, 870, 0.7, t, { palm: '#F1D4BC', glow: coral });
      tickleLines(ctx, 465, 1090, t, 0.27); tickleLines(ctx, 1115, 1090, t, 0.95);
      wave(ctx, 210, 1350, 1020, 34, t * 3, coral, 0.85, 0.018);
      tracking(ctx, 'PREDIKSI ≠ KEJUTAN', 720, 1470, { size: 31, font: F.num6, track: 4, color: cream, align: 'center' });
      ring(ctx, 720, 1090, 290 + pulse * 18, coral, 0.21, 3);
    }

    // A bold changing chapter strap, built to work silently on mobile.
    const title = phase === 1 ? 'SENTUH DIRI SENDIRI.'
      : phase === 2 ? 'OTAK SUDAH MENEBak.'
        : phase === 3 ? 'SALINAN PERINTAH.'
          : phase === 4 ? 'SENSASINYA DIREM.'
            : phase === 5 ? 'UJI DENGAN ROBOT.'
              : phase === 6 ? 'JEDA = KEJUTAN.'
                : phase === 7 ? 'ADA PREDIKSI.' : 'ORANG LAIN MENGECEK.';
    txt(ctx, title.toUpperCase(), 720, 1744, { size: 43, font: F.head, color: cream, align: 'center', alpha: 0.9 });
    ctx.restore();
  },
};
