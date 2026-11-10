import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { pump, strata, paperKicker, applyGrain, P, Q } from './_ep7.mjs';

// 03 — SUMBERNYA. The yard, the pump, and the hole it drinks from: two hundred
// metres straight down into the aquifer.
const GROUND = 560;
const PIPE_X = 966;
const AQUIFER = 1430;
const BOTTOM = 1596;

export default {
  draw(ctx, t) {
    // sky over the yard
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, GROUND, [[0, '#E9DFC8'], [0.6, '#DCD0B6'], [1, '#C9BC9E']]);
    ctx.fillRect(0, 0, W, GROUND);
    // a house, cut in half
    ctx.save();
    ctx.fillStyle = '#9C8A6E';
    ctx.fillRect(1180, 250, 300, GROUND - 250);
    ctx.fillStyle = '#7C6C54';
    ctx.beginPath();
    ctx.moveTo(1150, 258);
    ctx.lineTo(1330, 150);
    ctx.lineTo(1500, 258);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(30,24,18,0.55)';
    ctx.fillRect(1230, 330, 110, 110);
    ctx.fillRect(1380, 360, 80, 200);
    ctx.restore();

    paperKicker(ctx, 'SUMBERNYA', { y: 236 });

    // soil
    strata(ctx, GROUND, H, { a: 1 });
    ctx.fillStyle = 'rgba(20,17,16,0.25)';
    ctx.fillRect(0, GROUND - 6, W, 8);

    // the aquifer
    const aqA = EASE.outCubic(clamp((t - 1.0) / 0.9));
    ctx.save();
    ctx.globalAlpha = aqA;
    ctx.fillStyle = 'rgba(47,110,124,0.55)';
    ctx.fillRect(0, AQUIFER, W, BOTTOM - AQUIFER);
    ctx.fillStyle = 'rgba(190,225,231,0.35)';
    ctx.fillRect(0, AQUIFER, W, 3);
    for (let i = 0; i < 90; i++) {
      const x = (i * 157) % W;
      const y = AQUIFER + 22 + ((i * 61) % (BOTTOM - AQUIFER - 40));
      ctx.fillStyle = 'rgba(220,240,244,0.35)';
      ctx.fillRect(x, y, 4, 3);
    }
    txt(ctx, 'AIR TANAH DALAM', 60, AQUIFER + 54, {
      size: 22, font: F.mono6, color: 'rgba(240,250,252,0.85)', track: 4,
    });
    ctx.restore();

    // the borehole
    const pA = EASE.outCubic(clamp((t - 0.35) / 1.1));
    if (pA > 0.01) {
      const bottom = GROUND + (BOTTOM - GROUND) * pA;
      ctx.save();
      ctx.fillStyle = linGrad(ctx, PIPE_X - 16, 0, PIPE_X + 16, 0, [[0, '#D3CCBC'], [0.5, '#F2ECDE'], [1, '#9E978A']]);
      ctx.fillRect(PIPE_X - 16, GROUND, 32, bottom - GROUND);
      ctx.fillStyle = hexA(Q.water, 0.85);
      ctx.fillRect(PIPE_X - 8, GROUND, 16, bottom - GROUND);
      // the screen at the bottom
      if (pA > 0.9) {
        ctx.fillStyle = '#CFC8B8';
        fillRR(ctx, PIPE_X - 30, bottom - 60, 60, 76, 8, ctx.fillStyle);
        ctx.fillStyle = 'rgba(47,110,124,0.9)';
        for (let i = 0; i < 6; i++) ctx.fillRect(PIPE_X - 24, bottom - 52 + i * 11, 48, 5);
      }
      ctx.restore();
    }

    // the pump on the yard
    const puA = EASE.outCubic(clamp((t - 0.2) / 0.8));
    if (puA > 0.01) pump(ctx, PIPE_X + 6, GROUND - 190, 0.88, { a: puA, on: t });

    // depth measurement
    const dA = clamp((t - 2.4) / 0.7);
    if (dA > 0.01) {
      ctx.save();
      ctx.globalAlpha = dA;
      const x = PIPE_X - 130;
      ctx.strokeStyle = 'rgba(240,232,214,0.55)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(x, GROUND);
      ctx.lineTo(x, BOTTOM);
      ctx.stroke();
      ctx.setLineDash([]);
      [GROUND, BOTTOM].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(x - 12, y);
        ctx.lineTo(x + 12, y);
        ctx.stroke();
      });
      txt(ctx, '200 M', x - 20, (GROUND + BOTTOM) / 2, {
        size: 40, font: F.num, color: '#F6EDD9', align: 'right', track: -1,
      });
      ctx.restore();
    }

    // the number that matters
    const nA = EASE.outCubic(clamp((t - 3.8) / 0.7));
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      txt(ctx, '80', 96, 442, {
        size: 168, font: F.num, color: Q.rust, track: -6,
      });
      txt(ctx, '–90', 96 + measure(ctx, '80', 168, F.num, -6) + 10, 442, {
        size: 168, font: F.num, color: Q.rust, track: -6,
      });
      const wEnd = 96 + measure(ctx, '80', 168, F.num, -6) + 10 + measure(ctx, '–90', 168, F.num, -6);
      txt(ctx, '%', wEnd + 6, 442, { size: 92, font: F.num6, color: Q.rust, track: -2 });
      txt(ctx, 'PENYEBABNYA SATU:', 100, 500, {
        size: 24, font: F.mono6, color: 'rgba(20,17,16,0.62)', track: 4,
      });
      txt(ctx, 'AIR TANAH DISEDOT', 100, 536, {
        size: 24, font: F.mono6, color: 'rgba(20,17,16,0.62)', track: 4,
      });
      ctx.restore();
    }

    void strokeRR; void radGrad; void lerp; void TAU; void C; void M; void P;
    applyGrain(ctx, 0.05);
  },
};
