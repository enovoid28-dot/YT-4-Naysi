import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { glowSpot, darkKicker, applyGrain, P, Q } from './_ep7.mjs';

// 04 — BANDINGKAN. Two rates on one baseline: what the sea does in a year, and
// what the ground does in the same year. 3,3 mm against 250 mm.
const BASE = 620;
const PXMM = 1.8;          // 250 mm -> 450 px
const SEA = 3.3 * PXMM;    // 5,9 px
const LAND = 250 * PXMM;   // 450 px
const SX = 350;
const LX = 940;

export default {
  draw(ctx, t) {
    ctx.fillStyle = linGrad(ctx, 0, 0, W * 0.6, H, [[0, '#0C1316'], [0.5, '#121B1F'], [1, '#070B0D']]);
    ctx.fillRect(0, 0, W, H);
    glowSpot(ctx, W * 0.3, BASE - 200, 780, Q.waterHi, 0.10);

    darkKicker(ctx, 'SATU TAHUN, DUA ARAH', { y: 292 });

    // the baseline they are both measured from
    const bA = EASE.outCubic(clamp((t - 0.2) / 0.7));
    ctx.save();
    ctx.globalAlpha = bA;
    ctx.fillStyle = 'rgba(242,231,211,0.35)';
    ctx.fillRect(72, BASE, W - 144, 2);
    txt(ctx, 'GARIS NOL', W - 72, BASE - 16, {
      size: 20, font: F.mono6, color: 'rgba(242,231,211,0.45)', align: 'right', track: 4,
    });
    ctx.restore();

    // the sea: up, barely
    const sA = EASE.outCubic(clamp((t - 1.2) / 0.8));
    if (sA > 0.01) {
      ctx.save();
      ctx.globalAlpha = sA;
      ctx.fillStyle = Q.waterHi;
      fillRR(ctx, SX - 70, BASE - SEA * sA, 140, SEA * sA + 2, 3, ctx.fillStyle);
      // a halo so six pixels can be seen
      ctx.strokeStyle = hexA(Q.waterHi, 0.45);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(SX, BASE, 34, 0, TAU);
      ctx.stroke();
      txt(ctx, 'LAUT', SX, BASE + 96, {
        size: 30, font: F.mono6, color: hexA(Q.waterHi, 0.9), align: 'center', track: 5,
      });
      txt(ctx, '+3,3 MM', SX, BASE + 150, {
        size: 44, font: F.num6, color: '#F2E7D3', align: 'center', track: 0,
      });
      txt(ctx, 'NAIK', SX, BASE + 190, {
        size: 20, font: F.mono6, color: hexA(Q.waterHi, 0.7), align: 'center', track: 5,
      });
      ctx.restore();
    }

    // the ground: down, and fast
    const lA = EASE.outCubic(clamp((t - 3.4) / 1.0));
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lA;
      ctx.fillStyle = linGrad(ctx, 0, BASE, 0, BASE + LAND, [[0, Q.rust], [1, Q.rust2]]);
      fillRR(ctx, LX - 90, BASE, 180, LAND * lA, 4, ctx.fillStyle);
      // sediment lines so the column reads as ground, not a bar
      ctx.save();
      ctx.beginPath();
      ctx.rect(LX - 90, BASE, 180, LAND * lA);
      ctx.clip();
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      for (let i = 1; i < 14; i++) ctx.fillRect(LX - 90, BASE + (LAND / 14) * i, 180, 3);
      ctx.restore();
      // arrow head
      if (lA > 0.75) {
        ctx.fillStyle = Q.rust;
        ctx.beginPath();
        ctx.moveTo(LX - 34, BASE + LAND - 8);
        ctx.lineTo(LX + 34, BASE + LAND - 8);
        ctx.lineTo(LX, BASE + LAND + 40);
        ctx.closePath();
        ctx.fill();
      }
      txt(ctx, 'TANAH', LX, BASE - 40, {
        size: 30, font: F.mono6, color: hexA(Q.rust, 0.95), align: 'center', track: 5,
      });
      txt(ctx, '−250 MM', LX, BASE + LAND + 76, {
        size: 44, font: F.num6, color: '#F2E7D3', align: 'center', track: 0,
      });
      txt(ctx, 'TURUN', LX, BASE + LAND + 116, {
        size: 20, font: F.mono6, color: hexA(Q.rust, 0.8), align: 'center', track: 5,
      });
      ctx.restore();
    }

    // the ratio
    const rA = EASE.outCubic(clamp((t - 5.6) / 0.7));
    if (rA > 0.01) {
      ctx.save();
      ctx.globalAlpha = rA;
      txt(ctx, '×', 96, 1466, { size: 120, font: F.num, color: 'rgba(242,231,211,0.30)', track: 0 });
      txt(ctx, '75', 178, 1478, {
        size: 250, font: F.num, color: Q.tape, track: -8, glowBlur: 46, glowColor: 'rgba(232,180,60,0.32)',
      });
      txt(ctx, 'LEBIH CEPAT DARI LAUT', 186, 1532, {
        size: 26, font: F.mono6, color: 'rgba(242,231,211,0.55)', track: 5,
      });
      ctx.restore();
    }

    void C; void M; void measure; void lerp; void strokeRR; void radGrad;
    applyGrain(ctx, 0.06);
  },
};
