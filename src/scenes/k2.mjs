import { W, H, C, M, txt, hexA, fillRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { nightRoom, darkKicker, ledger, stamp, tag, applyGrain, P } from './_ep6.mjs';

// 02 — UTANG. A week written down on ruled paper: five short nights, one tall Saturday.
const VALUES = [5, 5, 5, 5, 5, 9];
const LABELS = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

export default {
  draw(ctx, t) {
    nightRoom(ctx, { tableY: 980, warm: 0.14 });

    const a0 = EASE.outCubic(clamp((t - 0.15) / 0.7));
    ledger(ctx, 128, 300, W - 256, 1220, {
      a: a0, rot: -0.018, values: VALUES, labels: LABELS, unit: 'JAM',
    });

    // header written on the sheet
    if (a0 > 0.6) {
      const hA = clamp((a0 - 0.6) / 0.4);
      ctx.save();
      ctx.globalAlpha = hA;
      ctx.translate(128 + (W - 256) / 2, 300 + 610);
      ctx.rotate(-0.018);
      txt(ctx, 'CATATAN TIDUR · SATU MINGGU', 0, -566, {
        size: 30, font: F.mono6, color: 'rgba(23,19,16,0.78)', align: 'center', track: 5,
      });
      txt(ctx, 'butuh 8 jam', 0, -524, {
        size: 22, font: F.mono, color: 'rgba(23,19,16,0.45)', align: 'center', track: 1,
      });
      ctx.restore();
    }

    // the sum, stamped once the week is on paper
    const sA = clamp((t - 8.4) / 0.4);
    if (sA > 0.01) {
      ctx.save();
      ctx.translate(W / 2 - 320, 1618);
      ctx.rotate(-0.05);
      stamp(ctx, 0, 0, 'UTANG > 12 JAM', {
        size: 44, color: P.red, rot: 0, a: sA * 0.95, padX: 24, padY: 13, font: F.mono6,
      });
      ctx.restore();
    }

    // pen lying on the paper
    const pA = EASE.outCubic(clamp((t - 3.4) / 0.6));
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      ctx.translate(1206, 1596);
      ctx.rotate(0.92);
      fillRR(ctx, -18, -150, 36, 300, 16, '#151312');
      ctx.fillStyle = linGrad(ctx, -18, 0, 18, 0, [[0, '#3A3634'], [0.45, '#8B8781'], [1, '#121110']]);
      fillRR(ctx, -18, -150, 36, 300, 16, ctx.fillStyle);
      ctx.fillStyle = '#C7A15C';
      fillRR(ctx, -18, -30, 36, 46, 4, ctx.fillStyle);
      ctx.fillStyle = '#D8D2C6';
      ctx.beginPath();
      ctx.moveTo(-14, 150);
      ctx.lineTo(14, 150);
      ctx.lineTo(0, 196);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    void tag; void fillRR; void measure; void lerp; void TAU; void C; void H; void M;
    applyGrain(ctx, 0.055);
  },
};
