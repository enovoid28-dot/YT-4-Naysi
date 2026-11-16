import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { E, ease, vault, bar, ledPlate, chip, goldFill } from './_emas.mjs';

// 02 — DUA HARGA
// A price is a doorway: one side is the price you pay, the other is the price
// you get. Shot B measures the gap; shot C shows that you start behind it.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    vault(ctx, { t, glowX: W * 0.5, glowY: 640, glowA: 0.12 });

    tracking(ctx, 'HARGA BELI · HARGA JUAL', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'SELISIH', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.ember, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    const inA = (k) => ease.expo(clamp((t - k) / 0.7));

    /* ---------------------------- SHOT A: tags ---------------------------- */
    if (t < 6.0) {
      // buying side
      const p1 = inA(0.15);
      ctx.save();
      ctx.globalAlpha = p1;
      bar(ctx, 120, 470 - (1 - p1) * 40, 520, 150, { a: 1, rot: -0.01, shine: t * 0.07, label: '', sub: '' });
      tracking(ctx, 'KAMU BELI', 120, 700, { size: 24, font: F.mono6, track: 5, color: hexA(E.bone, 0.45) });
      ledPlate(ctx, 120, 726, 520, 150, '2.517.000', { a: 1, size: 78, color: E.goldHi });
      ctx.restore();

      // selling side
      const p2 = inA(1.5);
      ctx.save();
      ctx.globalAlpha = p2;
      bar(ctx, W - 640, 470 - (1 - p2) * 40, 520, 150, { a: 0.6, rot: 0.01, shine: t * 0.07, label: '', sub: '' });
      tracking(ctx, 'KAMU JUAL', W - 640, 700, { size: 24, font: F.mono6, track: 5, color: hexA(E.bone, 0.45) });
      ledPlate(ctx, W - 640, 726, 520, 150, '2.293.000', { a: 1, size: 78, color: hexA(E.goldHi, 0.62) });
      ctx.restore();

      // the gap between them
      const gp = clamp((t - 2.6) / 0.6);
      if (gp > 0) {
        ctx.save();
        ctx.globalAlpha = gp * 0.9;
        ctx.strokeStyle = E.ember;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 10]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 500);
        ctx.lineTo(W / 2, 876);
        ctx.stroke();
        ctx.restore();
      }
    }

    /* --------------------------- SHOT B: the gap -------------------------- */
    if (t >= 6.0 && t < 10.6) {
      const g = ease.out(clamp((t - 6.1) / 1.1));
      // two ledges with a chasm between them
      tracking(ctx, 'KAMU BELI', 150, 496, { size: 22, font: F.mono6, track: 5, color: hexA(E.bone, 0.45) });
      tracking(ctx, 'KAMU JUAL', W - 610, 496, { size: 22, font: F.mono6, track: 5, color: hexA(E.bone, 0.45) });
      fillRR(ctx, 120, 520, 520, 250, 12, 'rgba(232,180,74,0.10)');
      fillRR(ctx, W - 640, 520, 520, 250, 12, 'rgba(232,180,74,0.05)');
      txt(ctx, 'Rp', 168, 692, { size: 40, font: F.num, color: hexA(E.goldHi, 0.5) });
      txt(ctx, 'Rp', W - 640 + 48, 692, { size: 40, font: F.num, color: hexA(E.goldHi, 0.3) });
      txt(ctx, '2.517.000', 210 + 210, 692, { size: 76, font: F.num, color: E.goldHi, align: 'center', track: -3 });
      txt(ctx, '2.293.000', W - 592 + 210, 692, { size: 76, font: F.num, color: hexA(E.goldHi, 0.55), align: 'center', track: -3 });
      // the measured distance
      ctx.save();
      ctx.globalAlpha = a(6.3, 0.5);
      ctx.strokeStyle = hexA(E.ember, 0.75);
      ctx.lineWidth = 3;
      const x1 = 660;
      const x2 = lerp(660, 780, g);
      ctx.beginPath();
      ctx.moveTo(x1, 1000); ctx.lineTo(x2, 1000);
      ctx.moveTo(x1, 984); ctx.lineTo(x1, 1016);
      ctx.moveTo(x2, 984); ctx.lineTo(x2, 1016);
      ctx.stroke();
      ctx.restore();
      chip(ctx, 'SELISIH', 720, 1060, { a: a(6.5, 0.5), color: E.ember, align: 'center' });
      txt(ctx, '+224.000', W / 2, 1250, { size: 140, font: F.num, color: E.ember, align: 'center', track: -5, alpha: a(7.0, 0.6) });
      tracking(ctx, 'PER GRAM · SEBELUM HARGA BERGERAK', W / 2, 1320, {
        size: 22, font: F.mono6, track: 5, color: hexA(E.bone, 0.4), align: 'center', alpha: a(7.3, 0.5),
      });
    }

    /* -------------------------- SHOT C: behind ---------------------------- */
    if (t >= 10.6) {
      // the bar sinks below the line it was bought at
      const drop = ease.inOut(clamp((t - 10.7) / 2.2));
      const baseY = 640;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.setLineDash([10, 12]);
      ctx.strokeStyle = hexA(E.bone, 0.22);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(120, baseY); ctx.lineTo(W - 120, baseY);
      ctx.stroke();
      ctx.restore();
      tracking(ctx, 'HARGA BELI', W - 120, baseY - 16, {
        size: 20, font: F.mono6, track: 4, color: hexA(E.bone, 0.4), align: 'right',
      });
      bar(ctx, W / 2 - 300, lerp(baseY - 150, baseY + 210, drop), 600, 160, {
        a: 1, rot: -0.02, shine: t * 0.05,
      });
      // the distance below the line
      const p = a(12.9, 0.6);
      if (p > 0.01) {
        ctx.save();
        ctx.globalAlpha = p;
        fillRR(ctx, 104, 1310, W - 208, 150, 14, 'rgba(228,87,63,0.10)');
        strokeRR(ctx, 104, 1310, W - 208, 150, 14, hexA(E.ember, 0.55), 2);
        txt(ctx, '−8,9%', 154, 1416, { size: 96, font: F.num, color: E.ember, track: -3 });
        tracking(ctx, 'DI BELAKANG SEJAK HARI PERTAMA', W - 154, 1400, {
          size: 22, font: F.mono6, track: 4, color: hexA(E.bone, 0.55), align: 'right',
        });
        ctx.restore();
      }
    }
  },
};
