import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { concreteWall, tideMark, skyline, waves, stamp, darkKicker, glowSpot, applyGrain, P, Q } from './_ep7.mjs';

// 01 — JAKARTA UTARA. The city at the water's edge, with a tape measure next to
// it: whatever is happening here can be counted in centimetres.
const WATER = 1436;

export default {
  draw(ctx, t) {
    // dusk sky over the bay
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, WATER, [
      [0, '#101A20'], [0.45, '#1B2A30'], [0.82, '#3A4742'], [1, '#6B6247'],
    ]);
    ctx.fillRect(0, 0, W, H);
    glowSpot(ctx, W * 0.62, WATER - 60, 620, '#E8B43C', 0.20);

    // haze bands
    ctx.fillStyle = 'rgba(232,180,60,0.05)';
    for (let i = 0; i < 4; i++) ctx.fillRect(0, 1040 + i * 70, W, 26);

    const rise = EASE.outCubic(clamp((t - 0.2) / 1.1));
    ctx.save();
    ctx.globalAlpha = rise;
    skyline(ctx, 20, WATER + 8, 1200, { color: '#0E1518', seed: 11, hMin: 220, hMax: 780, gap: 8 });
    ctx.restore();

    // water
    waves(ctx, WATER, { t, a: 1 });
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, WATER, W, 6);

    // the rust line: the water has been higher than this
    const tA = clamp((t - 2.4) / 0.7);
    if (tA > 0.01) tideMark(ctx, 1178, { a: tA });

    darkKicker(ctx, 'JAKARTA UTARA · 2025', { y: 292 });

    // and the word that matters, stamped on the water
    const sA = clamp((t - 4.6) / 0.35);
    if (sA > 0.01) {
      ctx.save();
      ctx.translate(120, 1600);
      ctx.rotate(-0.05);
      stamp(ctx, 0, 0, 'TANAH TURUN', {
        size: 42, color: Q.tape, rot: 0, a: sA * 0.95, padX: 24, padY: 13, font: F.mono6, track: 5,
      });
      ctx.restore();
    }

    void concreteWall; void P; void C; void M; void measure; void lerp; void TAU; void radGrad; void fillRR; void strokeRR;
    applyGrain(ctx, 0.06);
  },
};
