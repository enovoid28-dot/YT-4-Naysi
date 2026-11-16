import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { E, ease, vault, bar, chip } from './_emas.mjs';

// 07 — KAPAN IA BEKERJA
// Gold only has a job on the day everything else stops. Three states, then the
// quiet frame: one bar, no yield, nothing happening.

const STATES = [
  { t: 6.3, title: 'BANK TUTUP', sub: 'rekening tidak bisa dibuka' },
  { t: 7.4, title: 'UANG DIPERCAYA PALSUT', sub: 'nilainya hilang dalam hitungan hari' },
  { t: 8.5, title: 'ORANG PILIH LOGAM', sub: 'karena logam tidak perlu dipercaya' },
];

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    vault(ctx, { t, glowX: W * 0.5, glowY: 700, glowA: 0.15 });

    tracking(ctx, 'KAPAN IA BEKERJA', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'HARI BIASA · HARI RUSAK', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.gold, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- SHOT A: one bar -------------------------- */
    if (t < 6.1) {
      const p = ease.expo(clamp((t - 0.1) / 1.0));
      // a pool of light on the floor
      ctx.save();
      ctx.globalAlpha = p * 0.9;
      ctx.fillStyle = radGrad(ctx, W / 2, 980, 40, 620, [
        [0, 'rgba(255,226,160,0.20)'], [0.5, 'rgba(255,226,160,0.06)'], [1, 'rgba(255,226,160,0)'],
      ]);
      ctx.fillRect(0, 500, W, 900);
      ctx.restore();
      bar(ctx, W / 2 - 330, 900, 660, 190, { a: p, rot: -0.015, shine: t * 0.06 });
      tracking(ctx, 'SATU GRAM · TIDAK BERBUNYI', W / 2, 1180, {
        size: 22, font: F.mono6, track: 5, color: hexA(E.bone, 0.35), align: 'center', alpha: a(1.6, 0.6),
      });
    }

    /* -------------------------- SHOT B: the states ------------------------ */
    if (t >= 6.1 && t < 12.2) {
      STATES.forEach((s, i) => {
        const p = ease.expo(clamp((t - s.t) / 0.55));
        if (p <= 0.001) return;
        const y = 400 + i * 290;
        ctx.save();
        ctx.globalAlpha = p;
        fillRR(ctx, 120, y, W - 240, 210, 14, 'rgba(228,87,63,0.06)');
        strokeRR(ctx, 120, y, W - 240, 210, 14, hexA(E.ember, 0.35), 1.6);
        ctx.fillStyle = E.ember;
        ctx.beginPath();
        ctx.arc(190, y + 105, 14, 0, TAU);
        ctx.fill();
        txt(ctx, s.title, 240, y + 92, { size: 54, font: F.head, color: E.bone, track: 1 });
        txt(ctx, s.sub, 240, y + 150, { size: 28, font: F.mono, color: hexA(E.bone, 0.5) });
        ctx.restore();
      });
      tracking(ctx, 'YANG BERHENTI', W / 2, 1330, {
        size: 22, font: F.mono6, track: 6, color: hexA(E.ember, 0.65), align: 'center', alpha: a(6.6, 0.6),
      });
    }

    /* ------------------------- SHOT C: the nothing ------------------------ */
    if (t >= 12.2) {
      const p = ease.expo(clamp((t - 12.3) / 0.8));
      ctx.save();
      ctx.globalAlpha = p;
      bar(ctx, W / 2 - 250, 640, 500, 150, { a: 0.85, rot: 0, shine: t * 0.05 });
      // a flat yield line: nothing ever moves
      ctx.strokeStyle = hexA(E.bone, 0.25);
      ctx.lineWidth = 2;
      ctx.setLineDash([9, 11]);
      ctx.beginPath();
      ctx.moveTo(140, 1000);
      ctx.lineTo(W - 140, 1000);
      ctx.stroke();
      ctx.restore();
      txt(ctx, '0', W - 190, 1010, { size: 64, font: F.num, color: hexA(E.ember, 0.9), align: 'right', alpha: a(13.4, 0.6) });
      tracking(ctx, 'IMBAL HASIL PER TAHUN', 140, 1060, {
        size: 21, font: F.mono6, track: 4, color: hexA(E.bone, 0.4), alpha: a(13.7, 0.6),
      });
      txt(ctx, 'DIAM.', W / 2, 1290, { size: 130, font: F.num, color: hexA(E.bone, 0.9), align: 'center', track: -4, alpha: a(14.4, 0.7) });
      tracking(ctx, 'DI BRANKAS · TANPA BUNGA · TANPA ARUS KAS', W / 2, 1350, {
        size: 21, font: F.mono6, track: 4, color: hexA(E.bone, 0.38), align: 'center', alpha: a(14.8, 0.6),
      });
    }
  },
};
