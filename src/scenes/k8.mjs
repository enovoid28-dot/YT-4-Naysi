import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { K, ease, depot, box, cue, vignette } from './_kirim.mjs';

// 08 — SYARATNYA
// The gate appears, the basket fills to 70, the missing 30 is bought with an
// item nobody needed, and the badge says you saved money.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 560, glowA: 0.10, horizon: 1320 });

    const gx = 150;
    const gy = 470;
    const gw = W - 300;
    const gh = 132;

    // the gate on "bersyarat"
    const gate = a(c(1, 0.05), 0.6);
    if (gate > 0.01) {
      ctx.save();
      ctx.globalAlpha = gate;
      tracking(ctx, 'SYARAT', gx, gy - 52, { size: 22, font: F.mono6, track: 5, color: hexA(K.amber, 0.85) });
      fillRR(ctx, gx, gy, gw, gh, 14, 'rgba(246,241,228,0.07)');
      strokeRR(ctx, gx, gy, gw, gh, 14, hexA(K.bone, 0.20), 2);
      ctx.strokeStyle = hexA(K.mint, 0.85);
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(gx + gw, gy - 34);
      ctx.lineTo(gx + gw, gy + gh + 34);
      ctx.stroke();
      tracking(ctx, 'MIN. 100.000', gx + gw, gy + gh + 66, {
        size: 24, font: F.mono6, track: 4, color: K.mint, align: 'right',
      });
      ctx.restore();
    }

    // the basket filling on "minimal belanja seratus ribu"
    const f1 = ease.out(clamp((t - c(2, 0.1)) / 0.9)) * 0.70;
    const f2 = ease.out(clamp((t - c(3, 0.9)) / 0.8)) * 0.30;
    if (f1 > 0.005) {
      ctx.save();
      ctx.globalAlpha = gate;
      fillRR(ctx, gx, gy, Math.max(4, gw * f1), gh, 14, hexA(K.amber, 0.62));
      ctx.restore();
    }
    if (f2 > 0.005) {
      ctx.save();
      ctx.globalAlpha = gate;
      fillRR(ctx, gx + gw * 0.70, gy, gw * f2, gh, 14, hexA(K.ember, 0.85));
      ctx.restore();
    }
    const q1 = a(c(2, 0.3), 0.5);
    if (q1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = q1;
      txt(ctx, '70.000', gx + 34, gy + 92, { size: 46, font: F.num6, color: '#12161C' });
      ctx.restore();
    }
    const q2 = a(c(3, 1.0), 0.5);
    if (q2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = q2;
      txt(ctx, '+30.000', gx + gw - 24, gy + 92, {
        size: 40, font: F.num6, color: '#1B0D08', align: 'right',
      });
      ctx.restore();
    }

    // the unneeded item, dropped in on its own line
    const add = ease.expo(clamp((t - c(3, 0.15)) / 0.7));
    if (add > 0.001) {
      box(ctx, W / 2 + 40, 700 + (1 - add) * -90, 330, 250, {
        a: add, rot: 0.05, tape: false, depth: 0.16, tint: '#B49C7C', mark: '???',
      });
    }
    box(ctx, W / 2 - 400, 720, 340, 250, { a: a(c(3, 0.15), 0.6), rot: -0.03, tape: false, depth: 0.16, tint: '#CBB69A', mark: 'KAOS' });
    txt(ctx, '70.000', W / 2 - 230, 1020, {
      size: 40, font: F.num6, color: hexA(K.bone, 0.8), align: 'center', alpha: a(c(3, 0.15), 0.6),
    });
    txt(ctx, '30.000', W / 2 + 205, 1020, {
      size: 40, font: F.num6, color: hexA(K.ember, 0.9), align: 'center', alpha: q2,
    });
    tracking(ctx, 'TIDAK KAMU BUTUHKAN', W / 2 + 205, 1062, {
      size: 17, font: F.mono6, track: 3, color: hexA(K.ember, 0.8), align: 'center', alpha: q2,
    });

    // the badge on "lalu merasa berhemat"
    const b = a(c(4, 0.05), 0.55);
    if (b > 0.01) {
      ctx.save();
      ctx.globalAlpha = b;
      ctx.translate(W / 2, 1210);
      ctx.rotate(-0.03);
      fillRR(ctx, -390, -62, 780, 124, 12, hexA(K.amber, 0.95));
      txt(ctx, 'MERASA BERHEMAT', 0, 12, { size: 56, font: F.head, color: '#221405', align: 'center', track: 3 });
      ctx.restore();
      const bb = a(c(4, 0.7), 0.5);
      txt(ctx, 'PADAHAL TAMBAH 30.000', W / 2, 1330, {
        size: 30, font: F.mono6, color: hexA(K.ember, 0.9), align: 'center', track: 4, alpha: bb,
      });
    }

    vignette(ctx, 0.5);
  },
};
