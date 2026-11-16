import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, box, weight, dim, grainOverlay } from './_kirim.mjs';

// 06 — BERAT VOLUMETRIK
// A pillow is light and huge. The courier charges the space it takes, not the
// mass it has. p × l × t ÷ 6.000.

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 600, glowA: 0.11 });

    tracking(ctx, 'BERAT VOLUMETRIK', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, '÷ 6.000', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.cyan, 0.7), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- shot A: the box -------------------------- */
    if (t < 7.6) {
      const p = ease.expo(clamp((t - 0.1) / 0.9));
      const bw = 720;
      const bh = 500;
      const bx = (W - bw) / 2;
      const by = 430;
      box(ctx, bx, by, bw, bh, { a: p, rot: 0, tape: true, mark: 'BANTAL', depth: 0.24 });
      // dimension lines
      const dq = a(1.2, 0.7);
      dim(ctx, bx, by + bh + 70, bx + bw, by + bh + 70, 'PANJANG 60 CM', { a: dq });
      dim(ctx, bx - 70, by, bx - 70, by + bh, 'TINGGI 40 CM', { a: dq * 0.9 });
      // side depth
      dim(ctx, bx + bw + 40, by + 10, bx + bw + 40, by + bh * 0.8, 'LEBAR 50', { a: dq * 0.8, size: 16 });

      const fq = a(3.4, 0.7);
      if (fq > 0.01) {
        ctx.save();
        ctx.globalAlpha = fq;
        fillRR(ctx, 150, 1060, W - 300, 170, 12, 'rgba(159,200,230,0.08)');
        strokeRR(ctx, 150, 1060, W - 300, 170, 12, hexA(K.cyan, 0.4), 1.6);
        txt(ctx, '60 × 50 × 40 ÷ 6.000', W / 2, 1130, {
          size: 44, font: F.mono6, color: hexA(K.bone, 0.75), align: 'center', track: 2,
        });
        txt(ctx, '= 20 KG', W / 2, 1200, {
          size: 40, font: F.num, color: K.cyan, align: 'center', track: 1,
        });
        ctx.restore();
      }
    }

    /* -------------------------- shot B: the scale ------------------------- */
    if (t >= 7.6) {
      const p = ease.expo(clamp((t - 7.7) / 0.8));
      weight(ctx, W / 2 - 380, 560, 760, 380, '0,6', { a: p });
      box(ctx, W / 2 - 300, 380, 600, 200, { a: p, rot: -0.03, tape: false, depth: 0.2 });
      txt(ctx, '0,6 KG', W / 2, 1010, {
        size: 84, font: F.num, color: K.bone, align: 'center', track: -2, alpha: a(8.6, 0.6),
      });
      tracking(ctx, 'YANG DITIMBANG', W / 2, 1062, {
        size: 20, font: F.mono6, track: 5, color: hexA(K.bone, 0.4), align: 'center', alpha: a(8.8, 0.6),
      });
      const q = a(10.2, 0.7);
      if (q > 0.01) {
        ctx.save();
        ctx.globalAlpha = q;
        txt(ctx, '4 KG', W / 2, 1200, {
          size: 118, font: F.num, color: K.ember, align: 'center', track: -3,
        });
        tracking(ctx, 'YANG DITAGIH', W / 2, 1250, {
          size: 20, font: F.mono6, track: 5, color: hexA(K.ember, 0.75), align: 'center',
        });
        ctx.restore();
      }
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
