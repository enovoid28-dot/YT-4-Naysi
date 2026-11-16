import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { E, ease, vault, chip, chartBed, path } from './_emas.mjs';

// 05 — TAHUN YANG BERUBAH
// The same chart, now annotated: the rate hike, the dollar, the bonds. Then the
// number in dollars, which is uglier than the number in rupiah.

const SPOT = [5594, 5400, 5250, 5050, 4800, 4560, 4300, 4120, 4000, 4050, 3960, 3899];
const EVENTS = [
  { at: 0.35, label: 'FED NAIKKAN BUNGA', i: 3 },
  { at: 0.95, label: 'DOLAR TERTINGGI 19 BLN', i: 6 },
  { at: 1.55, label: 'OBLIGASI MEMBAYAR', i: 8 },
];

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    vault(ctx, { t, glowX: W * 0.55, glowY: 640, glowA: 0.10 });

    tracking(ctx, '2026 · DALAM DOLAR', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'XAU / USD', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.ember, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- SHOT A: the fall ------------------------- */
    if (t < 9.6) {
      const x0 = 150;
      const y0 = 400;
      const cw = W - 300;
      const ch = 660;
      chartBed(ctx, x0, y0, cw, ch, { a: a(0.05, 0.4), rows: 4, cols: 6 });
      const pts = SPOT.map((v, i) => [x0 + (cw * i) / (SPOT.length - 1), y0 + (1 - (v - 3700) / 2000) * ch]);
      path(ctx, pts, ease.inOut(clamp((t - 0.25) / 2.4)), {
        color: E.gold, lw: 6, glow: 28,
        fill: { h: ch, g: linGrad(ctx, 0, y0, 0, y0 + ch, [[0, hexA(E.gold, 0.24)], [1, hexA(E.gold, 0.01)]]) },
      });
      EVENTS.forEach((ev) => {
        const p = a(ev.at + 2.4, 0.5);
        if (p <= 0.01) return;
        const [ex, ey] = pts[ev.i];
        ctx.save();
        ctx.globalAlpha = p;
        ctx.fillStyle = E.ember;
        ctx.beginPath();
        ctx.arc(ex, ey, 9, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = hexA(E.ember, 0.4);
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex, y0 - 60);
        ctx.stroke();
        ctx.restore();
        chip(ctx, ev.label, Math.min(W - 150, Math.max(150, ex)), y0 - 70, {
          a: p, color: E.ember, align: 'center', size: 17,
        });
      });
    }

    /* --------------------------- SHOT B: the why -------------------------- */
    if (t >= 9.6 && t < 16.4) {
      const rows = [
        { t: 9.8, k: 'FED', v: 'Bunga naik. Uang berbunga jadi lebih menarik.' },
        { t: 10.9, k: 'DOLAR', v: 'Menguat 19 bulan. Emas jadi mahal di luar AS.' },
        { t: 12.0, k: 'EMAS', v: 'Tidak membayar apa pun. Uang pindah.' },
      ];
      rows.forEach((r, i) => {
        const p = ease.expo(clamp((t - r.t) / 0.6));
        if (p <= 0.001) return;
        const y = 430 + i * 300;
        ctx.save();
        ctx.globalAlpha = p;
        fillRR(ctx, 120, y, W - 240, 220, 14, 'rgba(247,242,228,0.045)');
        strokeRR(ctx, 120, y, W - 240, 220, 14, hexA(E.bone, 0.10), 1.4);
        ctx.fillStyle = hexA(i === 2 ? E.ember : E.gold, 0.9);
        ctx.fillRect(120, y, 8, 220);
        txt(ctx, r.k, 170, y + 92, { size: 62, font: F.head, color: E.bone, track: 2 });
        txt(ctx, r.v, 170, y + 156, { size: 30, font: F.mono, color: hexA(E.bone, 0.55) });
        ctx.restore();
      });
    }

    /* -------------------------- SHOT C: the dollar ------------------------ */
    if (t >= 16.4) {
      const p = ease.expo(clamp((t - 16.5) / 0.8));
      ctx.save();
      ctx.globalAlpha = p;
      txt(ctx, '−30%', W / 2, 900, { size: 300, font: F.num, color: E.ember, align: 'center', track: -10 });
      tracking(ctx, 'DARI PUNCAK · DALAM DOLAR', W / 2, 980, {
        size: 26, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), align: 'center',
      });
      txt(ctx, 'US$ 5.594 → 3.899', W / 2, 1150, {
        size: 44, font: F.mono6, color: hexA(E.bone, 0.60), align: 'center', track: 2,
      });
      ctx.restore();
    }
  },
};
