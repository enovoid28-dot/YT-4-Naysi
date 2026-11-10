import { W, H, C, M, txt, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bedroom, alarmClock, darkKicker, stamp, applyGrain, glowSpot, P } from './_ep6.mjs';

// 01 — SABTU. The clock on the nightstand says 09.12. The bed is still warm.
export default {
  draw(ctx, t) {
    bedroom(ctx, t, { light: 1 });
    darkKicker(ctx, 'SABTU · 09.12', { y: 292 });

    // the clock
    const a0 = EASE.outCubic(clamp((t - 0.2) / 0.7));
    ctx.save();
    ctx.globalAlpha = a0;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 42;
    ctx.shadowOffsetY = 26;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(1046, 1352, 168, 44, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    alarmClock(ctx, 1046, 1330, 196, { hh: 9, mm: 12, a: 1, lit: 0.06 });
    ctx.restore();

    // discarded phone, face down
    ctx.save();
    ctx.globalAlpha = a0 * 0.95;
    ctx.translate(844, 690);
    ctx.rotate(0.46);
    fillRR(ctx, 0, 0, 186, 306, 22, '#0E0C0B');
    ctx.fillStyle = linGrad(ctx, 0, 0, 186, 306, [[0, '#2A2724'], [1, '#0A0908']]);
    fillRR(ctx, 0, 0, 186, 306, 22, ctx.fillStyle);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    fillRR(ctx, 14, 14, 158, 278, 16, ctx.fillStyle);
    ctx.restore();

    // the verdict, stamped late in the beat
    const stA = clamp((t - 10.6) / 0.4);
    if (stA > 0.01) {
      ctx.save();
      ctx.translate(150, 1642);
      ctx.rotate(-0.09);
      stamp(ctx, 0, 0, 'BARU 9% LUNAS', {
        size: 46, color: P.red, rot: 0, a: stA * 0.95, padX: 26, padY: 14, font: F.mono6,
      });
      ctx.restore();
    }

    void C; void H; void linGrad; void radGrad; void measure; void lerp; void glowSpot; void W;
    applyGrain(ctx, 0.055);
  },
};
