import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, box, contact, grainOverlay } from './_kirim.mjs';

// 02 — KENAPA DULU MURAH
// Subsidy is a bar that used to be tall. Then the users arrived, and the bar
// had to come down.

const YEARS = [
  { y: '2020', h: 0.95 }, { y: '2021', h: 0.88 }, { y: '2022', h: 0.76 },
  { y: '2023', h: 0.62 }, { y: '2024', h: 0.44 }, { y: '2025', h: 0.26 }, { y: '2026', h: 0.10 },
];

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 560, glowA: 0.11 });

    tracking(ctx, 'SUBSIDI ONGKIR', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, '2020 → 2026', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.ember, 0.62), align: 'right', alpha: a(0.02, 0.5),
    });

    /* ---------------------------- shot A: the bars ------------------------ */
    if (t < 6.4) {
      const baseY = 1060;
      const maxH = 560;
      const bw = 108;
      const gap = 36;
      const total = YEARS.length * bw + (YEARS.length - 1) * gap;
      const x0 = (W - total) / 2;
      ctx.save();
      ctx.fillStyle = hexA(K.bone, 0.16);
      ctx.fillRect(x0 - 10, baseY, total + 20, 2);
      ctx.restore();
      YEARS.forEach((yr, i) => {
        const p = ease.expo(clamp((t - 0.15 - i * 0.16) / 0.7));
        const h = maxH * yr.h * p;
        const x = x0 + i * (bw + gap);
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.65 * p;
        fillRR(ctx, x, baseY - h, bw, h, 6, linGrad(ctx, x, baseY - h, x, baseY, [
          [0, i > 4 ? K.ember : K.amber], [1, i > 4 ? 'rgba(228,87,63,0.35)' : 'rgba(243,180,74,0.30)'],
        ]));
        ctx.restore();
        txt(ctx, yr.y, x + bw / 2, baseY + 44, {
          size: 20, font: F.mono6, color: hexA(K.bone, 0.40), align: 'center', track: 2,
        });
      });
      tracking(ctx, 'BAGIAN ONGKIR YANG DITANGGUNG PLATFORM', W / 2, 1200, {
        size: 21, font: F.mono6, track: 4, color: hexA(K.bone, 0.42), align: 'center', alpha: a(1.2, 0.6),
      });
    }

    /* --------------------------- shot B: the tag ------------------------- */
    if (t >= 6.4) {
      const p = ease.expo(clamp((t - 6.5) / 0.8));
      box(ctx, W / 2 - 300, 620 + (1 - p) * 30, 600, 400, {
        a: 0.4 + 0.6 * p, rot: 0.01, tape: true, mark: 'SEGEL', depth: 0.18,
      });
      // the subsidy tag is cut loose and drops
      const cut = clamp((t - 8.4) / 1.2);
      const ty = 520 + cut * cut * 620;
      const trot = cut * 0.5;
      ctx.save();
      ctx.globalAlpha = (1 - cut * 0.75) * p;
      ctx.translate(W / 2, ty);
      ctx.rotate(trot - 0.04);
      fillRR(ctx, -250, -46, 500, 92, 6, 'rgba(99,211,174,0.16)');
      strokeRR(ctx, -250, -46, 500, 92, 6, hexA(K.mint, 0.75), 2);
      txt(ctx, 'DISUBSIDI', 0, -2, { size: 40, font: F.head, color: K.mint, align: 'center', track: 5 });
      txt(ctx, 'PLATFORM', 0, 30, { size: 18, font: F.mono6, color: hexA(K.mint, 0.65), align: 'center', track: 5 });
      ctx.restore();
      // the scissors line
      const sl = clamp((t - 7.9) / 0.5);
      if (sl > 0 && sl < 1) {
        ctx.save();
        ctx.globalAlpha = (1 - Math.abs(sl - 0.5) * 2) * 0.8;
        ctx.strokeStyle = K.ember;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 9]);
        ctx.beginPath();
        ctx.moveTo(W / 2 - 260, ty - 46);
        ctx.lineTo(W / 2 + 260, ty - 46);
        ctx.stroke();
        ctx.restore();
      }
      tracking(ctx, 'PENGGUNANYA SUDAH ADA', W / 2, 1290, {
        size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.55), align: 'center', alpha: a(9.6, 0.6),
      });
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
