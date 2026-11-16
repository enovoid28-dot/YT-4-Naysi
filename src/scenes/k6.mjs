import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { K, ease, depot, box, weight, dim, cue, vignette } from './_kirim.mjs';

// 06 — BERAT VOLUMETRIK
// The dimensions draw themselves while the voice says them, the division lands
// with the result, and the last line puts the pillow on the scale.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 580, glowA: 0.11, horizon: 1300 });

    const bw = 660;
    const bh = 460;
    const bx = (W - bw) / 2;
    const by = 430;

    const p = ease.expo(clamp((t - 0.05) / 0.7));
    box(ctx, bx, by, bw, bh, { a: 0.4 + 0.6 * p, rot: 0, tape: true, mark: 'BANTAL', depth: 0.22 });

    // dimensions, one per word: panjang, lebar, tinggi
    dim(ctx, bx, by + bh + 76, bx + bw, by + bh + 76, 'PANJANG 60', { a: a(c(2, 0.1), 0.5), size: 24 });
    dim(ctx, bx - 132, by, bx - 132, by + bh, '', { a: a(c(2, 0.55), 0.5), size: 21 });
    dim(ctx, bx + bw + 128, by + 26, bx + bw + 128, by + bh * 0.9, 'LEBAR 50', { a: a(c(2, 1.0), 0.5), size: 20 });

    // the height label sits outside the parcel so it never fights the edge
    const hl = a(c(2, 0.6), 0.5);
    if (hl > 0.01) {
      ctx.save();
      ctx.globalAlpha = hl;
      ctx.translate(bx - 156, by + bh / 2);
      ctx.rotate(-Math.PI / 2);
      tracking(ctx, 'TINGGI 40', 0, 0, { size: 21, font: F.mono6, track: 3, color: K.cyan, align: 'center' });
      ctx.restore();
    }

    // the division
    const f = a(c(2, 1.4), 0.6);
    if (f > 0.01) {
      ctx.save();
      ctx.globalAlpha = f;
      fillRR(ctx, 150, 980, W - 300, 210, 16, 'rgba(159,200,230,0.07)');
      strokeRR(ctx, 150, 980, W - 300, 210, 16, hexA(K.cyan, 0.35), 2);
      txt(ctx, '60 × 50 × 40 ÷ 6.000', W / 2, 1052, {
        size: 42, font: F.mono6, color: hexA(K.bone, 0.8), align: 'center', track: 2,
      });
      const q = a(c(3, 0.15), 0.5);
      txt(ctx, '= 20 KG', W / 2, 1136, {
        size: 44, font: F.num, color: K.cyan, align: 'center', track: 1, alpha: q,
      });
      ctx.restore();
    }

    // the scale takes over on the last line
    const s = a(c(3, 0.75), 0.7);
    if (s > 0.01) {
      ctx.save();
      ctx.globalAlpha = s * 0.96;
      ctx.fillStyle = 'rgba(5,8,12,0.72)';
      ctx.fillRect(0, 250, W, 1100);
      ctx.restore();
      weight(ctx, W / 2 - 400, 420, 800, 400, '0,6', { a: s });
      box(ctx, W / 2 - 300, 760, 600, 200, { a: s, rot: -0.02, tape: false, depth: 0.16 });
      const q = a(c(3, 1.5), 0.6);
      ctx.save();
      ctx.globalAlpha = q;
      txt(ctx, 'DITIMBANG 0,6 KG', W / 2 - 190, 1070, {
        size: 44, font: F.mono6, color: hexA(K.bone, 0.8), align: 'center', track: 2,
      });
      txt(ctx, 'DITAGIH 4 KG', W / 2 + 230, 1070, {
        size: 52, font: F.mono6, color: K.ember, align: 'center', track: 2,
      });
      ctx.fillStyle = hexA(K.ember, 0.5);
      ctx.fillRect(W / 2 - 20, 1020, 4, 90);
      ctx.restore();
    }

    vignette(ctx, 0.5);
  },
};
