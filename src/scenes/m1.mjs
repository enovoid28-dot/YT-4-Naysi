import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { E, ease, vault, bar, ledPlate, chip, chartBed, path, goldFill } from './_emas.mjs';

// 01 — HARGA YANG TURUN
// Shot A: the board. Shot B: the year. Shot C: the number nobody wants to say.

const SERIES = [3168, 3090, 3020, 2960, 2880, 2790, 2710, 2650, 2600, 2620, 2570, 2517];

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    vault(ctx, { t, glowX: W * 0.5, glowY: 700, glowA: 0.13 });

    tracking(ctx, 'EMAS · SATU GRAM', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'NAYSI · 2026', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.gold, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    /* ---------------------------- SHOT A: board --------------------------- */
    if (t < 5.4) {
      bar(ctx, W / 2 - 330, 1180, 660, 175, { a: 0.9 * ease.out(clamp((t - 0.2) / 0.8)), rot: -0.008, shine: t * 0.08 });
      // the old price, crossed
      const oldA = a(0.35, 0.5);
      txt(ctx, 'JANUARI', 104, 448, { size: 26, font: F.mono6, color: hexA(E.bone, 0.4), track: 5, alpha: oldA });
      ledPlate(ctx, 104, 486, 1232, 200, 'Rp 3.168.000', { a: oldA, size: 116, color: hexA(E.goldHi, 0.48) });
      const strike = clamp((t - 1.5) / 0.5);
      if (strike > 0) {
        ctx.save();
        ctx.globalAlpha = strike * 0.8;
        ctx.strokeStyle = E.ember;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(196, 578);
        ctx.lineTo(196 + 1050 * ease.out(strike), 556);
        ctx.stroke();
        ctx.restore();
      }
      const newA = a(2.5, 0.5);
      // the arrow between them
      const ar = clamp((t - 2.3) / 0.5);
      if (ar > 0) {
        ctx.save();
        ctx.globalAlpha = ar * 0.7;
        ctx.strokeStyle = E.ember;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(W / 2, 700);
        ctx.lineTo(W / 2, 700 + 90 * ease.out(ar));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(W / 2 - 16, 700 + 90 * ease.out(ar) - 16);
        ctx.lineTo(W / 2, 700 + 90 * ease.out(ar));
        ctx.lineTo(W / 2 + 16, 700 + 90 * ease.out(ar) - 16);
        ctx.stroke();
        ctx.restore();
      }
      txt(ctx, 'HARI INI', 104, 840, { size: 26, font: F.mono6, color: hexA(E.bone, 0.4), track: 5, alpha: newA });
      ledPlate(ctx, 104, 862, 1232, 200, 'Rp 2.517.000', { a: newA, size: 116, color: E.goldHi });
    }

    /* ----------------------------- SHOT B: chart -------------------------- */
    if (t >= 5.4 && t < 9.5) {
      const x0 = 150;
      const y0 = 420;
      const cw = W - 300;
      const ch = 720;
      chartBed(ctx, x0, y0, cw, ch, { a: a(5.45, 0.4), rows: 4, cols: 6 });
      const pts = SERIES.map((v, i) => [x0 + (cw * i) / (SERIES.length - 1), y0 + (1 - (v - 2400) / 900) * ch]);
      path(ctx, pts, ease.inOut(clamp((t - 5.6) / 2.2)), {
        color: E.gold, lw: 6, glow: 30,
        fill: { h: ch, g: linGrad(ctx, 0, y0, 0, y0 + ch, [[0, hexA(E.gold, 0.26)], [1, hexA(E.gold, 0.01)]]) },
      });
      // ATH marker
      const ma = a(5.9, 0.5);
      ctx.save();
      ctx.globalAlpha = ma;
      ctx.setLineDash([6, 10]);
      ctx.strokeStyle = hexA(E.ember, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.lineTo(x0 + cw, pts[0][1]);
      ctx.stroke();
      ctx.restore();
      chip(ctx, 'REKOR · 29 JAN', pts[0][0] + 26, pts[0][1] - 34, { a: ma, color: E.ember });
      chip(ctx, 'NOV', pts[SERIES.length - 1][0] - 20, pts[SERIES.length - 1][1] + 62, { a: a(7.2, 0.5), color: E.gold, align: 'right' });
    }

    /* --------------------------- SHOT C: the drop ------------------------- */
    if (t >= 9.5) {
      const p = ease.expo(clamp((t - 9.6) / 0.8));
      const drop = clamp((t - 9.6) / 5.2);
      const yv = lerp(320, 980, drop * drop * 0.6 + drop * 0.4);
      ctx.save();
      ctx.globalAlpha = 0.8;
      bar(ctx, W / 2 - 280, yv, 560, 150, { a: 0.5, rot: -0.02, shine: t * 0.06 });
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = p;
      txt(ctx, '−20,5%', W / 2, 1420, {
        size: 260, font: F.num, color: E.ember, align: 'center', track: -8,
      });
      tracking(ctx, 'DARI PUNCAK JANUARI · DALAM RUPIAH', W / 2, 1490, {
        size: 24, font: F.mono6, track: 5, color: hexA(E.bone, 0.42), align: 'center',
      });
      ctx.restore();
    }
  },
};
