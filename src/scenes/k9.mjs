import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, card, hairline, mug, dot } from './_ep3.mjs';

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#0C0C12', mid: '#07080D', bot: '#04050A' });
    glowSpot(ctx, W / 2, 700, 720, C.amber, 0.085);

    const a1 = EASE.outCubic(clamp(t / 0.7));
    txt(ctx, 'Bukan kopinya.', W / 2, 560, {
      size: 70, font: F.display, color: hexA(C.bone, 0.5), align: 'center', alpha: a1,
    });
    const a2 = EASE.outCubic(clamp((t - 0.35) / 0.6));
    txt(ctx, 'Jamnya.', W / 2, 706, {
      size: 148, font: F.display, color: C.amberHi, align: 'center', alpha: a2,
      glowBlur: 54 * a2, glowColor: hexA(C.amber, 0.32),
    });

    // recap: two anchors and a dashed line
    const a3 = EASE.outCubic(clamp((t - 1.2) / 0.7));
    if (a3 > 0.01) {
      const y = 900;
      const xL = M + 90;
      const xR = W - M - 90;
      ctx.save();
      ctx.globalAlpha = a3;
      ctx.setLineDash([6, 12]);
      ctx.strokeStyle = hexA(C.bone, 0.18);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xL + 30, y);
      ctx.lineTo(xR - 30, y);
      ctx.stroke();
      ctx.setLineDash([]);
      dot(ctx, xL, y, 12, C.amber, { glow: 24, ring: C.ink0, ringW: 4 });
      dot(ctx, xR, y, 12, C.mint, { glow: 24, ring: C.ink0, ringW: 4 });
      txt(ctx, 'KOPI TERAKHIR', xL, y - 42, {
        size: 21, font: F.num6, color: hexA(C.bone, 0.4), track: 4,
      });
      txt(ctx, '15.00', xL, y + 74, { size: 46, font: F.num, color: C.amberHi });
      txt(ctx, 'JAM TIDUR', xR, y - 42, {
        size: 21, font: F.num6, color: hexA(C.bone, 0.4), track: 4, align: 'right',
      });
      txt(ctx, '23.00', xR, y + 74, { size: 46, font: F.num, color: C.mint, align: 'right' });
      txt(ctx, '8 JAM', (xL + xR) / 2, y - 14, {
        size: 22, font: F.num6, color: hexA(C.bone, 0.45), align: 'center', track: 5,
      });
      ctx.restore();
    }

    const a4 = clamp((t - 2.2) / 0.8);
    if (a4 > 0.01) mug(ctx, W / 2, 1340, 0.54, { t: meta.t, steamAmt: 0.5, alpha: a4 });

    const a5 = EASE.outCubic(clamp((t - 3.4) / 0.8));
    if (a5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = a5;
      hairline(ctx, M + 80, 1436, W - M - 80, 1436, { alpha: 0.14 });
      txt(ctx, 'SATU CANGKIR, TIGA JAM LEBIH AWAL', W / 2, 1512, {
        size: 27, font: F.num6, color: hexA(C.amber, 0.9), align: 'center', track: 3,
      });
      txt(ctx, 'Kopi terakhirmu kemarin jam berapa?', W / 2, 1600, {
        size: 40, font: F.head, color: C.bone, align: 'center',
      });
      txt(ctx, 'tulis di komentar', W / 2, 1650, {
        size: 25, font: F.num6, color: hexA(C.bone, 0.4), align: 'center', track: 3,
      });
      ctx.restore();
    }

    const a6 = clamp((t - 5.0) / 0.8);
    if (a6 > 0.01) {
      ctx.save();
      ctx.globalAlpha = a6 * 0.85;
      hairline(ctx, M, 1730, W - M, 1730, { alpha: 0.07 });
      txt(ctx, 'NAYSI', M, 1790, { size: 24, font: F.num6, color: hexA(C.bone, 0.45), track: 8 });
      txt(ctx, 'tidur, otak, kebiasaan', W - M, 1790, {
        size: 21, font: F.num6, color: hexA(C.bone, 0.28), align: 'right', track: 2,
      });
      ctx.restore();
    }
  },
};
