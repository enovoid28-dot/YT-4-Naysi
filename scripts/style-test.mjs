// Style test for Ep21: the same moment — "Lima hari kerja, sepuluh jam hilang." —
// drawn in three candidate visual languages, so a direction can be chosen before
// nine scenes are rebuilt on it. Renders three 1440×2560 stills.
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { ensureFonts, F } from '../src/engine/fonts.mjs';
import { W, H, txt, hexA, fillRR, strokeRR, measure, tracking } from '../src/engine/draw.mjs';

await ensureFonts();

const CAP1 = 'Lima hari kerja, sepuluh';
const CAP2 = 'jam hilang.';

function caption(ctx, o) {
  const { color, accent, y = 1860, size = 104, shadow = 0 } = o;
  const words1 = CAP1.split(' ');
  const words2 = CAP2.split(' ');
  const draw = (words, yy) => {
    const space = measure(ctx, ' ', size, F.semi) * 1.45;
    const ws = words.map((w) => measure(ctx, w, size, F.semi));
    const total = ws.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    let x = (W - total) / 2;
    words.forEach((w, i) => {
      const hot = w === 'sepuluh' || w === 'hilang.';
      txt(ctx, w, x, yy, {
        size, font: F.semi, color: hot ? accent : color, glowBlur: shadow,
      });
      x += ws[i] + space;
    });
  };
  draw(words1, y);
  draw(words2, y + size * 1.24);
}

/* ─────────── A · MALAM (what the episode looks like today) ─────────── */
function drawA(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#05060E');
  g.addColorStop(0.4, '#0A0C18');
  g.addColorStop(1, '#080A14');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const warm = ctx.createRadialGradient(W * 0.3, 1500, 40, W * 0.3, 1500, 900);
  warm.addColorStop(0, 'rgba(255,178,94,0.20)');
  warm.addColorStop(1, 'rgba(255,140,70,0)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 800, W, 1200);

  const X0 = 150, X1 = 900, STEP = 152;
  ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'].forEach((d, i) => {
    const y = 830 + i * STEP;
    txt(ctx, d, X0 - 24, y + 60, { size: 25, font: F.mono, color: 'rgba(255,246,232,0.62)', align: 'right', track: 4 });
    const gg = ctx.createLinearGradient(X0, y, X0 + 6 * 88, y);
    gg.addColorStop(0, 'rgba(255,178,94,0.34)');
    gg.addColorStop(1, 'rgba(255,178,94,1)');
    fillRR(ctx, X0, y, 6 * 88, 88, 44, gg);
    strokeRR(ctx, X0 + 6 * 88, y, 2 * 88, 88, 44, 'rgba(255,107,87,0.72)', 3);
  });
  for (let i = 0; i < 5; i++) {
    const x = 1004, y = 1178 + i * 96;
    const gg = ctx.createLinearGradient(x, y, x + 260, y);
    gg.addColorStop(0, 'rgba(255,215,154,0.38)');
    gg.addColorStop(1, 'rgba(255,178,94,0.96)');
    fillRR(ctx, x, y, 260, 88, 44, gg);
  }
  txt(ctx, '10', 1028, 1050, { size: 300, font: F.num, color: '#FFF6E8', track: -10, glowBlur: 40, glowColor: 'rgba(255,246,232,0.25)' });
  txt(ctx, 'JAM HILANG', 1034, 1120, { size: 32, font: F.mono6, color: '#FFB25E', track: 9 });
  caption(ctx, { color: '#FFF6E8', accent: '#FFB25E' });
}

/* ─────────── B · KERTAS (printed sheet: paper, ink, vermilion) ─────────── */
function drawB(ctx) {
  ctx.fillStyle = '#F3EBD9';
  ctx.fillRect(0, 0, W, H);

  // halftone field, right side
  ctx.save();
  ctx.globalAlpha = 0.5;
  for (let y = 700; y < 1500; y += 16) {
    for (let x = 980; x < 1360; x += 16) {
      const d = Math.hypot(x - 1180, y - 1080) / 420;
      if (d > 1) continue;
      ctx.fillStyle = `rgba(210,56,31,${(1 - d) * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, 3.2 * (1 - d) + 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // ruled columns
  ctx.strokeStyle = 'rgba(20,17,16,0.10)';
  ctx.lineWidth = 2;
  [150, 420, 690, 960, 1230].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, 360);
    ctx.lineTo(x, 1560);
    ctx.stroke();
  });

  // kicker + headline
  ctx.fillStyle = '#D2381F';
  ctx.fillRect(150, 300, 120, 10);
  txt(ctx, 'UTANG TIDUR', 150, 380, { size: 34, font: F.mono6, color: '#141110', track: 10 });

  const X0 = 150, U = 108, STEP = 168;
  ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'].forEach((d, i) => {
    const y = 520 + i * STEP;
    txt(ctx, d, X0, y - 22, { size: 26, font: F.mono6, color: 'rgba(20,17,16,0.55)', track: 6 });
    // the eight-hour rail, the six slept, the two owed
    strokeRR(ctx, X0, y, 8 * U, 76, 4, 'rgba(20,17,16,0.20)', 2);
    ctx.fillStyle = '#141110';
    fillRR(ctx, X0, y, 6 * U, 76, 4, '#141110');
    ctx.save();
    ctx.beginPath();
    ctx.rect(X0 + 6 * U, y, 2 * U, 76);
    ctx.clip();
    ctx.strokeStyle = '#D2381F';
    ctx.lineWidth = 4;
    for (let k = -80; k < 2 * U + 80; k += 14) {
      ctx.beginPath();
      ctx.moveTo(X0 + 6 * U + k, y + 76);
      ctx.lineTo(X0 + 6 * U + k + 76, y);
      ctx.stroke();
    }
    ctx.restore();
    strokeRR(ctx, X0 + 6 * U, y, 2 * U, 76, 4, '#D2381F', 4);
  });

  // the number, letterpressed
  txt(ctx, '10', 980, 1180, { size: 330, font: F.num, color: '#D2381F', track: -14 });
  txt(ctx, 'JAM', 992, 1262, { size: 44, font: F.mono6, color: '#141110', track: 8 });
  txt(ctx, 'HILANG', 992, 1308, { size: 44, font: F.mono6, color: '#141110', track: 8 });
  txt(ctx, '5 × 2 JAM', 992, 1380, { size: 30, font: F.mono, color: 'rgba(20,17,16,0.55)', track: 4 });

  // crop marks
  ctx.strokeStyle = 'rgba(20,17,16,0.35)';
  ctx.lineWidth = 2;
  [[72, 72, 1, 1], [W - 72, 72, -1, 1], [72, H - 72, 1, -1], [W - 72, H - 72, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * 44, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * 44);
    ctx.stroke();
  });

  caption(ctx, { color: '#141110', accent: '#D2381F' });
}

/* ─────────── C · SIARAN (broadcast: ink, panels, white type, red) ─────────── */
function drawC(ctx) {
  ctx.fillStyle = '#06070C';
  ctx.fillRect(0, 0, W, H);
  // studio grid
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 72) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 72) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  const glow = ctx.createRadialGradient(W * 0.5, 520, 60, W * 0.5, 520, 900);
  glow.addColorStop(0, 'rgba(255,59,48,0.10)');
  glow.addColorStop(1, 'rgba(255,59,48,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 1600);

  // kicker
  fillRR(ctx, 104, 300, 250, 64, 8, '#FF3B30');
  txt(ctx, 'UTANG TIDUR', 128, 344, { size: 30, font: F.mono6, color: '#FFFDF7', track: 10 });

  // panel
  fillRR(ctx, 104, 420, 1232, 1060, 18, 'rgba(255,255,255,0.03)');
  strokeRR(ctx, 104, 420, 1232, 1060, 18, 'rgba(255,255,255,0.14)', 2);

  const X0 = 176, U = 100, STEP = 168;
  ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'].forEach((d, i) => {
    const y = 520 + i * STEP;
    txt(ctx, d, X0, y - 18, { size: 26, font: F.mono6, color: 'rgba(255,255,255,0.55)', track: 6 });
    fillRR(ctx, X0, y, 6 * U, 76, 4, '#FFFDF7');
    ctx.save();
    ctx.beginPath();
    ctx.rect(X0 + 6 * U, y, 2 * U, 76);
    ctx.clip();
    ctx.strokeStyle = '#FF3B30';
    ctx.lineWidth = 4;
    for (let k = -80; k < 2 * U + 80; k += 14) {
      ctx.beginPath();
      ctx.moveTo(X0 + 6 * U + k, y + 76);
      ctx.lineTo(X0 + 6 * U + k + 76, y);
      ctx.stroke();
    }
    ctx.restore();
    strokeRR(ctx, X0 + 6 * U, y, 2 * U, 76, 4, 'rgba(255,59,48,0.85)', 3);
  });

  txt(ctx, '10', 1010, 1120, { size: 320, font: F.num, color: '#FFFDF7', track: -12 });
  txt(ctx, 'JAM HILANG', 1018, 1190, { size: 34, font: F.mono6, color: '#FF3B30', track: 10 });
  txt(ctx, '5 MALAM × 2 JAM', 1018, 1250, { size: 28, font: F.mono, color: 'rgba(255,255,255,0.55)', track: 4 });

  caption(ctx, { color: '#FFFDF7', accent: '#FF6B5E' });
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
fs.mkdirSync('out/style', { recursive: true });
for (const [name, fn] of [['a-malam', drawA], ['b-kertas', drawB], ['c-siaran', drawC]]) {
  ctx.clearRect(0, 0, W, H);
  fn(ctx);
  fs.writeFileSync(`out/style/${name}.jpg`, await canvas.encode('jpeg', 92));
  console.log(`out/style/${name}.jpg`);
}
