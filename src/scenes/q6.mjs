import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, kick, paperCard, stampInk, halftone, par, folio, arrow, circleMark,
} from './_kertas.mjs';

// 06 — NOL PERSEN
// Two numbers, printed at the same size. The one on the right is paid before
// anything is owed.

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.5, glowY: 340, glowA: 0.36 });
    folio(ctx, '06', 'NOL PERSEN');

    par(ctx, cam, 0.2, () => {
      kick(ctx, 'EDISI 17', W - 88, 116, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
      halftone(ctx, 88, 240, 260, 130, { step: 14, a: 0.14, color: K.blue });
    });

    const cw = 588;
    const ch = 620;
    const cy = 420;

    // left: the interest
    const p0 = ease.expo(clamp((t - c(0, 0.05)) / 0.75));
    ctx.save();
    ctx.globalAlpha = p0;
    ctx.translate(0, (1 - p0) * 40);
    paperCard(ctx, 88, cy, cw, ch, { off: 14 });
    kick(ctx, 'BUNGA', 88 + 44, cy + 72, { size: 22, color: K.soft, track: 7 });
    txt(ctx, '0%', 88 + 44, cy + 400, { size: 320, font: F.num, color: K.blue, track: -16 });
    kick(ctx, 'UNTUK 3 BULAN', 88 + 46, cy + ch - 56, { size: 18, color: 'rgba(20,17,16,0.40)', track: 4 });
    ctx.restore();

    // right: the fee, arriving later
    const p2 = ease.expo(clamp((t - c(2, 0.05)) / 0.75));
    if (p2 > 0.01) {
      const rx = W - 88 - cw;
      ctx.save();
      ctx.globalAlpha = p2;
      ctx.translate(0, (1 - p2) * 46);
      paperCard(ctx, rx, cy, cw, ch, { fill: '#1A1613', stroke: '#1A1613', off: 14, tone: 'rgba(20,17,16,0.24)' });
      kick(ctx, 'BIAYA LAYANAN', rx + 44, cy + 72, { size: 22, color: 'rgba(246,241,228,0.55)', track: 7 });
      txt(ctx, '9%', rx + 44, cy + 400, { size: 320, font: F.num, color: '#F6F1E4', track: -16 });
      kick(ctx, 'DIBAYAR DI DEPAN', rx + 46, cy + ch - 56, { size: 18, color: 'rgba(246,241,228,0.45)', track: 4 });
      ctx.restore();

      // the cash register that takes it before the goods arrive
      const pa = ease.inOut(clamp((t - c(2, 0.5)) / 0.6));
      if (pa > 0.01) {
        ctx.save();
        ctx.globalAlpha = pa;
        arrow(ctx, rx + cw / 2, cy - 26, rx + cw / 2, cy - 150, { color: K.red, lw: 5, head: 20, p: pa });
        kick(ctx, 'DIAMBIL DULUAN', rx + cw / 2, cy - 190, {
          size: 20, color: K.red, track: 5, align: 'center',
        });
        ctx.restore();
      }
    }

    // the three months, bracketed under the left card
    const pm = a(c(1, 0.1), 0.6);
    if (pm > 0.01) {
      ctx.save();
      ctx.globalAlpha = pm;
      const y = cy + ch + 46;
      ctx.strokeStyle = K.ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(88, y - 14);
      ctx.lineTo(88, y);
      ctx.lineTo(88 + cw * pm, y);
      ctx.lineTo(88 + cw * pm, y - 14);
      ctx.stroke();
      kick(ctx, '3 BULAN', 88 + cw / 2, y + 44, {
        size: 22, color: K.ink2, track: 6, align: 'center',
      });
      ctx.restore();
    }

    // annualised: the number that ends the argument
    const p5 = a(c(5, 0.05), 0.7);
    if (p5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p5;
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 1150, W - 176, 4);
      kick(ctx, 'SETARA PER TAHUN', 88, 1120, { size: 21, color: K.soft, track: 6 });
      ctx.save();
      ctx.translate((1 - p5) * 50, 0);
      txt(ctx, '36%', 88, 1448, { size: 290, font: F.num, color: K.red, track: -14 });
      ctx.restore();
      stampInk(ctx, 'BUKAN GRATIS', W - 330, 1330, {
        a: p5, rot: -0.07, size: 36, color: K.red,
      });
      ctx.restore();
    }
  },
};
