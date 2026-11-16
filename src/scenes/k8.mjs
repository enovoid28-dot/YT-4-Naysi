import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, box, grainOverlay } from './_kirim.mjs';

// 08 — SYARATNYA
// The free shipping badge is gated by a number. The gap between you and that
// number is where the extra item comes from.

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 600, glowA: 0.10 });

    tracking(ctx, 'SYARAT GRATIS ONGKIR', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'MIN. 100.000', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.amber, 0.7), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- shot A: the bar -------------------------- */
    if (t < 6.4) {
      const p = ease.expo(clamp((t - 0.1) / 0.7));
      const x = 150;
      const y = 520;
      const w = W - 300;
      const h = 120;
      const fill1 = ease.out(clamp((t - 0.6) / 1.2)) * 0.70;
      const fill2 = ease.out(clamp((t - 3.2) / 1.1)) * 0.30;
      ctx.save();
      ctx.globalAlpha = p;
      fillRR(ctx, x, y, w, h, 12, 'rgba(246,241,228,0.07)');
      strokeRR(ctx, x, y, w, h, 12, hexA(K.bone, 0.18), 1.6);
      // the 70 already in the basket
      fillRR(ctx, x, y, w * fill1, h, 12, hexA(K.amber, 0.55));
      // the 30 you add
      if (fill2 > 0.01) fillRR(ctx, x + w * fill1, y, w * fill2, h, 12, hexA(K.ember, 0.75));
      // the gate
      ctx.strokeStyle = hexA(K.mint, 0.8);
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(x + w, y - 40);
      ctx.lineTo(x + w, y + h + 40);
      ctx.stroke();
      ctx.restore();

      txt(ctx, '70.000', x + 30, y + 82, { size: 44, font: F.num6, color: '#12161C', track: -1, alpha: p });
      const q = a(3.3, 0.5);
      txt(ctx, '+30.000', x + w * 0.86, y + 82, {
        size: 34, font: F.num6, color: '#20100A', align: 'center', alpha: q,
      });
      tracking(ctx, 'KERANJANG KAMU', x, y - 40, {
        size: 20, font: F.mono6, track: 4, color: hexA(K.bone, 0.4), alpha: a(0.8, 0.5),
      });
      tracking(ctx, 'AMBANG GRATIS ONGKIR', x + w, y + h + 74, {
        size: 18, font: F.mono6, track: 3, color: hexA(K.mint, 0.7), align: 'right', alpha: a(1.0, 0.5),
      });
      txt(ctx, '100.000', W / 2, 900, {
        size: 130, font: F.num, color: K.bone, align: 'center', track: -5, alpha: a(4.4, 0.6),
      });
      tracking(ctx, 'TOTAL KERANJANG', W / 2, 960, {
        size: 20, font: F.mono6, track: 5, color: hexA(K.bone, 0.4), align: 'center', alpha: a(4.6, 0.6),
      });
      const bq = a(5.2, 0.5);
      if (bq > 0.01) {
        ctx.save();
        ctx.globalAlpha = bq;
        ctx.translate(W / 2, 1080);
        ctx.rotate(-0.03);
        fillRR(ctx, -300, -46, 600, 92, 8, hexA(K.amber, 0.9));
        txt(ctx, 'GRATIS ONGKIR!', 0, 12, { size: 44, font: F.head, color: '#221405', align: 'center', track: 3 });
        ctx.restore();
      }
    }

    /* -------------------------- shot B: the basket ------------------------ */
    if (t >= 6.4) {
      const p = ease.expo(clamp((t - 6.5) / 0.8));
      // a shirt you wanted
      box(ctx, W / 2 - 330, 470, 420, 320, { a: p, rot: -0.03, tape: false, depth: 0.18, tint: '#C9B79A', mark: 'KAOS' });
      // the extra thing you did not
      const q = ease.expo(clamp((t - 7.6) / 0.8));
      if (q > 0.001) {
        ctx.save();
        ctx.globalAlpha = q;
        box(ctx, W / 2 + 90, 560 + (1 - q) * 60, 320, 260, { rot: 0.05, tape: false, depth: 0.18, tint: '#B7A283', mark: '???' });
        ctx.restore();
      }
      txt(ctx, '70.000', W / 2 - 120, 850, { size: 44, font: F.num6, color: hexA(K.bone, 0.8), align: 'center', alpha: p });
      txt(ctx, '30.000', W / 2 + 250, 870, { size: 44, font: F.num6, color: hexA(K.ember, 0.9), align: 'center', alpha: q });
      tracking(ctx, 'TIDAK KAMU BUTUHKAN', W / 2 + 250, 920, {
        size: 17, font: F.mono6, track: 3, color: hexA(K.ember, 0.75), align: 'center', alpha: q,
      });
      txt(ctx, 'MERASA BERHEMAT', W / 2, 1120, {
        size: 76, font: F.head, color: K.bone, align: 'center', track: 1, alpha: a(9.6, 0.7),
      });
      txt(ctx, 'PADAHAL TAMBAH 30.000', W / 2, 1200, {
        size: 34, font: F.mono6, color: hexA(K.ember, 0.9), align: 'center', track: 3, alpha: a(10.4, 0.6),
      });
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
