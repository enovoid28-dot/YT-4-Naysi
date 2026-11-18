import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, kick, paperCard, stampInk, halftone, par, folio, tape, arrow, leader,
} from './_kertas.mjs';

// 07 — DENDA
// Four slips of the same bill, each one a month later. The amount does not jump;
// it multiplies.

const SLIPS = [
  { m: 'BULAN 0', v: '1.000.000', at: 0.15, rot: -0.018 },
  { m: 'BULAN 1', v: '1.050.000', at: 1.05, rot: 0.014 },
  { m: 'BULAN 2', v: '1.102.500', at: 1.55, rot: -0.012 },
  { m: 'BULAN 3', v: '1.157.625', at: 2.05, rot: 0.010, hot: true },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.55, glowY: 320, glowA: 0.32 });
    folio(ctx, '07', 'DENDA');

    par(ctx, cam, 0.2, () => {
      kick(ctx, 'EDISI 17', W - 88, 116, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
      kick(ctx, 'TAGIHAN YANG SAMA, DIBACA ULANG', 88, 268, {
        size: 19, color: 'rgba(20,17,16,0.40)', track: 5,
      });
    });

    // the five per cent, set as the rule of the page
    const p0 = a(c(0, 0.05), 0.6);
    ctx.save();
    ctx.globalAlpha = p0;
    txt(ctx, '5%', W - 88, 300, { size: 78, font: F.num, color: K.red, align: 'right', track: -3 });
    kick(ctx, 'PER BULAN', W - 88, 340, { size: 17, color: K.soft, track: 4, align: 'right' });
    ctx.restore();

    SLIPS.forEach((S, i) => {
      const p = ease.expo(clamp((t - c(1, S.at)) / 0.55));
      if (p <= 0.001) return;
      const x = 84 + i * 54;
      const y = 420 + i * 206;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(0, (1 - p) * 44);
      paperCard(ctx, x, y, 780, 196, {
        rot: S.rot, off: 10, tone: 'rgba(20,17,16,0.17)', tape: i === 0 ? 0.5 : 0,
      });
      // inside the card the local origin is 0,0 top-left, so the contents must
      // follow the same rotation: draw them in a nested transform
      ctx.save();
      ctx.translate(x + 390, y + 98);
      ctx.rotate(S.rot);
      kick(ctx, S.m, -346, -34, { size: 18, color: 'rgba(20,17,16,0.40)', track: 5 });
      txt(ctx, S.v, 346, 30, {
        size: 66, font: F.num, color: S.hot ? K.red : K.ink, align: 'right', track: -2.5,
      });
      if (i > 0) {
        kick(ctx, '+5%', -346, 52, { size: 18, color: K.red, track: 3 });
      }
      ctx.restore();
      ctx.restore();
    });

    // the last line: it is not interest, it is interest on interest
    const p2 = a(c(2, 0.05), 0.7);
    if (p2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p2;
      ctx.fillStyle = K.ink;
      ctx.fillRect(96, 1348, W - 192, 2);
      kick(ctx, 'SELISIH TIGA BULAN', 96, 1412, { size: 19, color: K.soft, track: 6 });
      txt(ctx, '+15,8%', 96, 1520, { size: 92, font: F.num, color: K.red, track: -4 });
      kick(ctx, 'DARI TAGIHAN AWAL', 400, 1516, { size: 19, color: K.soft, track: 4 });
      ctx.restore();

      stampInk(ctx, 'MENUMPUK DI ATAS DENDA', 640, 1160, {
        a: p2, rot: -0.08, size: 26, color: K.red, pad: 18,
      });
    }
  },
};
