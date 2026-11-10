import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { skyline, waves, glowSpot, darkKicker, applyGrain, P, Q } from './_ep7.mjs';

// 06 — TEMBOK. The wall holds the sea back. It cannot hold the ground up.
const SEA = 900;
const GROUND = 1210;

export default {
  draw(ctx, t) {
    ctx.fillStyle = linGrad(ctx, 0, 0, W * 0.4, H, [[0, '#0E1418'], [0.45, '#151D21'], [1, '#080C0E']]);
    ctx.fillRect(0, 0, W, H);
    glowSpot(ctx, W * 0.16, 720, 760, Q.waterHi, 0.12);

    // city behind the wall, standing below sea level
    skyline(ctx, 700, GROUND + 6, 800, { color: '#0B1114', seed: 23, hMin: 180, hMax: 520, gap: 14 });
    // its ground
    ctx.fillStyle = linGrad(ctx, 0, GROUND, 0, H, [[0, '#6D6047'], [1, '#3A3227']]);
    ctx.fillRect(620, GROUND, W - 620, H - GROUND);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(620, GROUND, W - 620, 5);

    // the sea
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 640, H);
    ctx.clip();
    waves(ctx, SEA, { t, a: 1, h: 900 });
    ctx.restore();

    // the wall
    const wA = EASE.outCubic(clamp((t - 0.2) / 0.9));
    ctx.save();
    ctx.globalAlpha = wA;
    ctx.beginPath();
    ctx.moveTo(592, SEA - 40);
    ctx.lineTo(786, SEA - 40);
    ctx.lineTo(900, H - 120);
    ctx.lineTo(520, H - 120);
    ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 520, 0, 900, 0, [[0, '#B6B0A1'], [0.35, '#8E887A'], [1, '#5C574C']]);
    ctx.fill();
    // coping
    ctx.fillStyle = '#D8D2C2';
    fillRR(ctx, 574, SEA - 62, 230, 26, 6, ctx.fillStyle);
    // block joints
    ctx.strokeStyle = 'rgba(20,17,16,0.28)';
    ctx.lineWidth = 3;
    for (let i = 1; i < 7; i++) {
      const y = SEA + i * 110;
      const k = (y - (SEA - 40)) / (H - 120 - (SEA - 40));
      const x0 = 592 - k * 72;
      const x1 = 786 + k * 114;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    }
    ctx.restore();

    // sea level, drawn over the city: it is above their roofs' base
    const lA = clamp((t - 1.6) / 0.6);
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lA;
      ctx.setLineDash([18, 14]);
      ctx.strokeStyle = hexA(Q.waterHi, 0.95);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(700, SEA);
      ctx.lineTo(W, SEA);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, 'MUKA LAUT', 92, SEA - 22, {
        size: 20, font: F.mono6, color: hexA(Q.waterHi, 0.95), track: 4,
      });
      ctx.restore();
    }

    darkKicker(ctx, 'TANGGUL LAUT', { y: 292 });

    // the wall grows every year
    const gA = clamp((t - 3.6) / 0.7);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      const xs = 700;
      ctx.strokeStyle = hexA(Q.tape, 0.9);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(xs, 832);
      ctx.lineTo(xs, 560);
      ctx.stroke();
      [832, 700, 560].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(xs - 16, y);
        ctx.lineTo(xs + 16, y);
        ctx.stroke();
      });
      [['2020', 832], ['2025', 700], ['2050', 560]].forEach(([yr, y]) => {
        txt(ctx, yr, xs + 28, y + 8, {
          size: 20, font: F.mono6, color: hexA(Q.tape, 0.9), track: 2,
        });
      });
      ctx.restore();
    }

    // 32 km
    const kA = clamp((t - 6.4) / 0.7);
    if (kA > 0.01) {
      ctx.save();
      ctx.globalAlpha = kA;
      txt(ctx, '32 KM', 96, 520, {
        size: 92, font: F.num, color: '#F2E7D3', track: -3,
      });
      txt(ctx, 'PANJANGNYA', 100, 566, {
        size: 22, font: F.mono6, color: 'rgba(242,231,211,0.5)', track: 5,
      });
      ctx.restore();
    }

    // and it still cannot stop this
    const aA = clamp((t - 8.4) / 0.7);
    if (aA > 0.01) {
      ctx.save();
      ctx.globalAlpha = aA;
      const x = 1010;
      ctx.strokeStyle = hexA(Q.rust, 0.9);
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x, 1252);
      ctx.lineTo(x, 1500);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 26, 1458);
      ctx.lineTo(x + 26, 1458);
      ctx.lineTo(x, 1514);
      ctx.closePath();
      ctx.fillStyle = hexA(Q.rust, 0.9);
      ctx.fill();
      txt(ctx, '25 CM', x, 1582, {
        size: 40, font: F.num, color: Q.rust, align: 'center', track: -1,
      });
      txt(ctx, 'TIAP TAHUN', x, 1620, {
        size: 18, font: F.mono6, color: hexA(Q.rust, 0.8), align: 'center', track: 4,
      });
      ctx.restore();
    }

    void C; void M; void measure; void lerp; void TAU; void strokeRR; void radGrad; void P;
    applyGrain(ctx, 0.06);
  },
};
