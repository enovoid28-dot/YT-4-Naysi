import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { K, ease, depot, van, box, cue, vignette } from './_kirim.mjs';

// 07 — RETUR
// One parcel, two journeys. The reverse van turns on the first line; the June
// rule lands on its own words.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 620, glowA: 0.10, horizon: 1240 });

    const start0 = c(0, 0.1);
    const go = ease.inOut(clamp((t - start0) / 2.6));
    const back = ease.inOut(clamp((t - start0 - 2.4) / 2.4));

    // outbound
    ctx.save();
    ctx.globalAlpha = 0.95 * (1 - back * 0.45);
    van(ctx, lerp(-600, 950, go), 420, 560, { a: 1, motion: go > 0.05 && go < 0.95 ? 0.8 : 0.15 });
    ctx.restore();

    // return, mirrored
    if (t > start0 + 2.4) {
      ctx.save();
      ctx.globalAlpha = a(start0 + 2.4, 0.4);
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
      van(ctx, lerp(-600, 900, back), 950, 560, { a: 1, motion: 0.8, unMirror: true });
      ctx.restore();
    }

    // the parcel between the two lanes
    box(ctx, W / 2 - 160, 700, 320, 210, { a: a(start0, 0.6), rot: 0.015, tape: true, depth: 0.18 });

    txt(ctx, 'BERANGKAT', 150, 372, {
      size: 26, font: F.mono6, color: hexA(K.bone, 0.45), track: 5, alpha: a(start0, 0.5),
    });
    txt(ctx, '8.000', W - 150, 372, {
      size: 48, font: F.num6, color: hexA(K.bone, 0.8), align: 'right', alpha: a(start0, 0.5),
    });
    const rb = a(start0 + 2.4, 0.5);
    if (rb > 0.01) {
      ctx.save();
      ctx.globalAlpha = rb;
      txt(ctx, 'KEMBALI', W - 150, 1268, {
        size: 26, font: F.mono6, color: hexA(K.ember, 0.8), track: 5, align: 'right',
      });
      txt(ctx, '8.000', 150, 1268, { size: 48, font: F.num6, color: K.ember });
      ctx.restore();
    }

    // the June rule
    const j = a(c(1, 0.05), 0.6);
    if (j > 0.01) {
      ctx.save();
      ctx.globalAlpha = j;
      ctx.translate(W / 2, 1452);
      ctx.rotate(-0.02);
      fillRR(ctx, -420, -58, 840, 116, 12, 'rgba(5,8,12,0.85)');
      strokeRR(ctx, -420, -58, 840, 116, 12, hexA(K.amber, 0.55), 2);
      txt(ctx, 'SEJAK JUNI 2026', 0, 8, { size: 42, font: F.head, color: K.amber, align: 'center', track: 5 });
      ctx.restore();
    }

    const s = a(c(2, 0.15), 0.6);
    if (s > 0.01) {
      ctx.save();
      ctx.globalAlpha = s;
      txt(ctx, 'PENJUAL ≤ Rp 5.000 / ARAH', W / 2, 1556, {
        size: 34, font: F.mono6, color: hexA(K.bone, 0.85), align: 'center', track: 3,
      });
      ctx.restore();
    }

    vignette(ctx, 0.5);
  },
};
