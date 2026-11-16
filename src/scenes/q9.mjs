import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, kick, paperCard, stampInk, halftone, par, folio, arrow, leader, circleMark,
} from './_kertas.mjs';

// 09 — SATU TAGIHAN
// The page becomes a form with three blank lines, and the last one is the ask.

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.5, glowY: 300, glowA: 0.38 });
    folio(ctx, '09', 'SATU TAGIHAN');

    par(ctx, cam, 0.2, () => {
      kick(ctx, 'EDISI 17', W - 88, 116, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
      halftone(ctx, W - 356, 250, 268, 150, { step: 14, a: 0.15, color: K.red });
    });

    // the statement
    const p0 = a(c(0, 0.05), 0.7);
    ctx.save();
    ctx.globalAlpha = p0;
    txt(ctx, 'Paylater tidak salah.', 88, 470, {
      size: 86, font: F.display, color: K.ink, track: -2,
    });
    ctx.restore();

    const p1 = a(c(1, 0.05), 0.7);
    if (p1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p1;
      ctx.translate(0, (1 - p1) * 30);
      txt(ctx, 'Yang salah adalah', 88, 596, {
        size: 86, font: F.display, color: 'rgba(20,17,16,0.38)', track: -2,
      });
      txt(ctx, 'tidak pernah', 88, 700, { size: 86, font: F.display, color: K.red, track: -2 });
      txt(ctx, 'menghitung totalnya.', 88, 804, { size: 86, font: F.display, color: K.red, track: -2 });
      ctx.restore();
    }

    // the form
    const pf = a(c(2, 0.05), 0.7);
    if (pf > 0.01) {
      ctx.save();
      ctx.globalAlpha = pf;
      ctx.translate(0, (1 - pf) * 50);
      paperCard(ctx, 88, 900, W - 176, 560, { off: 14, tape: 0.28 });

      kick(ctx, 'FORMULIR SENDIRI', 140, 972, { size: 19, color: K.soft, track: 6 });

      const rows = [
        ['TOTAL SEMUA CICILAN', 1060],
        ['HARGA BARANG', 1170],
      ];
      rows.forEach(([k, y]) => {
        kick(ctx, k, 140, y, { size: 22, color: K.ink2, track: 4 });
        ctx.fillStyle = 'rgba(20,17,16,0.35)';
        for (let x = 700; x < W - 160; x += 14) ctx.fillRect(x, y - 3, 6, 2);
      });

      // the last line is the only one that matters
      ctx.fillStyle = K.ink;
      ctx.fillRect(140, 1236, W - 280, 3);
      kick(ctx, 'SELISIH', 140, 1300, { size: 22, color: K.ink, track: 4 });

      const blink = (t * 1.4) % 1 < 0.55 ? 1 : 0.2;
      ctx.save();
      ctx.globalAlpha = pf * blink;
      txt(ctx, '____ %', 700, 1330, { size: 96, font: F.num, color: K.red, track: -3 });
      ctx.restore();

      stampInk(ctx, 'JAWABANMU', W - 280, 1430, {
        a: pf * 0.9, rot: -0.05, size: 24, color: K.blue, pad: 16,
      });
      ctx.restore();
    }

    // the closing rule and the line that stays on screen
    const pe = a(c(3, 0.05), 0.7);
    if (pe > 0.01) {
      ctx.save();
      ctx.globalAlpha = pe;
      ctx.fillStyle = 'rgba(20,17,16,0.16)';
      ctx.fillRect(88, 1502, W - 176, 2);
      kick(ctx, 'TULIS DI KOMENTAR', 88, 1554, { size: 20, color: K.red, track: 6 });
      ctx.restore();
    }
  },
};
