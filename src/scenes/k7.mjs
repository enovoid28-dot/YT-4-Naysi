import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { skyline, waves, glowSpot, darkKicker, applyGrain, P, Q } from './_ep7.mjs';

// 07 — 2050. Same city, thirty years on: the waterline is up at the top floors.
const SEA = 722;

export default {
  draw(ctx, t) {
    ctx.fillStyle = linGrad(ctx, 0, 0, W * 0.5, H, [[0, '#0B1114'], [0.42, '#101A1E'], [1, '#05080A']]);
    ctx.fillRect(0, 0, W, H);
    glowSpot(ctx, W * 0.55, SEA + 140, 900, Q.waterHi, 0.09);

    // the city first, then the water on top of it
    skyline(ctx, -40, 1500, 1520, { color: '#0C1215', seed: 41, hMin: 700, hMax: 906, gap: 11 });
    const wA = EASE.outCubic(clamp((t - 0.9) / 1.3));
    if (wA > 0.01) {
      const sy = SEA + (1 - wA) * 620;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, sy, W, H - sy);
      ctx.clip();
      waves(ctx, sy, { t, a: 0.9 });
      ctx.restore();
    }

    darkKicker(ctx, 'JIKA TIDAK ADA YANG BERUBAH', { y: 300 });

    // 95 %
    const nA = EASE.outCubic(clamp((t - 3.4) / 0.8));
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      const ty = 566 - (1 - nA) * 44;
      txt(ctx, '95', 92, ty, {
        size: 224, font: F.num, color: Q.rust, track: -8,
        glowBlur: 44, glowColor: 'rgba(196,86,58,0.32)',
      });
      txt(ctx, '%', 92 + measure(ctx, '95', 224, F.num, -8) + 8, ty, {
        size: 108, font: F.num6, color: Q.rust, track: -2,
      });
      txt(ctx, 'JAKARTA UTARA DI BAWAH AIR', 96, ty + 58, {
        size: 23, font: F.mono6, color: 'rgba(242,231,211,0.60)', track: 4,
      });
      ctx.restore();
    }

    // 2050, sunk into the water
    const gA = clamp((t - 1.8) / 0.9);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      txt(ctx, '2050', 700, 1128, {
        size: 300, font: F.num, color: 'rgba(242,231,211,0.10)', align: 'center', track: -10,
      });
      ctx.restore();
    }

    // 10,6 juta
    const pA = EASE.outCubic(clamp((t - 6.6) / 0.7));
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      ctx.fillStyle = 'rgba(4,12,15,0.72)';
      fillRR(ctx, 92, 1234, 566, 138, 69, ctx.fillStyle);
      ctx.strokeStyle = 'rgba(242,231,211,0.20)';
      ctx.lineWidth = 3;
      strokeRR(ctx, 92, 1234, 566, 138, 69);
      txt(ctx, '10,6 JUTA ORANG', 130, 1304, {
        size: 42, font: F.num6, color: '#F2E7D3', track: 1,
      });
      txt(ctx, 'TINGGAL DI JALUR INI', 132, 1346, {
        size: 19, font: F.mono6, color: 'rgba(242,231,211,0.45)', track: 4,
      });
      ctx.restore();
    }

    void C; void M; void lerp; void TAU; void radGrad; void P;
    applyGrain(ctx, 0.06);
  },
};
