import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, kick, paperCard, stampInk, halftone, par, folio, arrow, circleMark,
} from './_kertas.mjs';

// 08 — UJI LIMA BELAS
// One formula, one ruler, one number that lands past the line.

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.5, glowY: 340, glowA: 0.34 });
    folio(ctx, '08', 'UJI LIMA BELAS');

    par(ctx, cam, 0.2, () => {
      kick(ctx, 'EDISI 17', W - 88, 116, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
    });

    // the formula, printed as a form
    const p0 = ease.expo(clamp((t - c(0, 0.05)) / 0.7));
    ctx.save();
    ctx.globalAlpha = p0;
    ctx.translate(0, (1 - p0) * 40);
    paperCard(ctx, 88, 300, W - 176, 470, { off: 14, tape: 0.5 });
    kick(ctx, 'RUMUS', 140, 372, { size: 19, color: K.soft, track: 6 });

    const p1 = a(c(1, 0.05), 0.6);
    kick(ctx, 'TOTAL SEMUA CICILAN', 140, 474, { size: 30, color: K.ink2, track: 3 });
    kick(ctx, 'HARGA BARANG', 140, 574, { size: 30, color: K.ink2, track: 3 });

    if (p1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p1;
      ctx.fillStyle = K.ink;
      ctx.fillRect(140, 500, W - 280, 4);
      kick(ctx, '= PERSEN YANG KAMU BAYAR', 140, 664, { size: 30, color: K.red, track: 3 });
      ctx.restore();
    }
    // the big division slash
    ctx.save();
    ctx.globalAlpha = clamp(p0 * 0.9);
    txt(ctx, '÷', W - 210, 570, { size: 150, font: F.num, color: 'rgba(20,17,16,0.18)', align: 'right' });
    ctx.restore();
    ctx.restore();

    // the ruler
    const R0 = 88;
    const RW = W - 176;
    const RY = 900;
    const maxPct = 40;
    const px = (pct) => R0 + (pct / maxPct) * RW;

    const pr = a(c(0, 0.4), 0.7);
    if (pr > 0.01) {
      ctx.save();
      ctx.globalAlpha = pr;
      ctx.fillStyle = K.ink;
      ctx.fillRect(R0, RY, RW, 5);
      for (let p = 0; p <= maxPct; p += 5) {
        const x = px(p);
        ctx.fillStyle = p % 10 === 0 ? 'rgba(20,17,16,0.75)' : 'rgba(20,17,16,0.38)';
        ctx.fillRect(x, RY, 2, p % 10 === 0 ? 26 : 14);
        if (p % 10 === 0) {
          kick(ctx, `${p}%`, x, RY + 66, { size: 21, color: 'rgba(20,17,16,0.55)', track: 2, align: 'center' });
        }
      }
      // the threshold
      const tx = px(15);
      ctx.strokeStyle = K.blue;
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(tx, RY - 150);
      ctx.lineTo(tx, RY + 96);
      ctx.stroke();
      ctx.setLineDash([]);
      kick(ctx, 'BATAS 15%', tx, RY + 118, { size: 22, color: K.blue, track: 4, align: 'center' });
      ctx.restore();
    }

    // the marker falls past the line
    const pm = ease.back(clamp((t - c(2, 0.1)) / 0.9));
    if (pm > 0.01) {
      const target = px(31.2);
      const x = lerp(px(0), target, clamp(pm));
      ctx.save();
      ctx.globalAlpha = clamp(pm * 2);
      ctx.fillStyle = K.red;
      ctx.fillRect(x - 4, RY - 232, 8, 232);
      ctx.beginPath();
      ctx.moveTo(x - 26, RY - 232);
      ctx.lineTo(x + 26, RY - 232);
      ctx.lineTo(x, RY - 186);
      ctx.closePath();
      ctx.fill();
      txt(ctx, '31,2%', x, RY - 268, {
        size: 62, font: F.num, color: K.red, align: 'center', track: -2,
      });
      ctx.restore();

      // the zone past the line is hatched
      const ph = a(c(2, 0.6), 0.7);
      if (ph > 0.01) {
        ctx.save();
        ctx.globalAlpha = ph * 0.30;
        ctx.beginPath();
        ctx.rect(px(15), RY - 150, (px(40) - px(15)) * ph, 246);
        ctx.clip();
        ctx.strokeStyle = K.red;
        ctx.lineWidth = 3;
        for (let i = -300; i < RW + 300; i += 22) {
          ctx.beginPath();
          ctx.moveTo(px(15) + i, RY + 96);
          ctx.lineTo(px(15) + i + 150, RY - 150);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // the verdict
    const p3 = a(c(3, 0.1), 0.6);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3;
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 1130, W - 176, 2);
      txt(ctx, 'itu biaya', 88, 1300, { size: 132, font: F.display, color: K.ink, track: -3 });
      circleMark(ctx, 420, 1258, 340, 96, ease.inOut(clamp((t - c(3, 0.3)) / 0.7)), { color: K.red, lw: 6 });
      stampInk(ctx, 'BUKAN KEMUDAHAN', W - 340, 1420, {
        a: p3, rot: -0.06, size: 26, color: K.red,
      });
      ctx.restore();
    }
  },
};
