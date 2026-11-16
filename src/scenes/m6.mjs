import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { E, ease, vault, chip, path, chartBed } from './_emas.mjs';

// 06 — RUPIAH YANG TURUN
// Two panels, same year, same metal: one in dollars, one in rupiah. The
// difference is not gold's gift — it is the currency you measure it with.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    vault(ctx, { t, glowX: W * 0.5, glowY: 640, glowA: 0.10 });

    tracking(ctx, 'DUA MATA UANG · SATU LOGAM', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'SELISIH 10%', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.gold, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    /* -------------------------- SHOT A: two panels ------------------------ */
    if (t < 7.2) {
      const panels = [
        { x: 104, label: 'DALAM DOLAR', val: '−30%', note: 'US$ 5.594 → 3.899', c: E.ember, at: 0.15 },
        { x: W / 2 + 16, label: 'DALAM RUPIAH', val: '−20%', note: 'Rp 3.168.000 → 2.517.000', c: E.gold, at: 0.75 },
      ];
      panels.forEach((p) => {
        const q = ease.expo(clamp((t - p.at) / 0.7));
        if (q <= 0.001) return;
        const pw = W / 2 - 120;
        ctx.save();
        ctx.globalAlpha = q;
        fillRR(ctx, p.x, 380, pw, 620, 18, 'rgba(247,242,228,0.04)');
        strokeRR(ctx, p.x, 380, pw, 620, 18, hexA(p.c, 0.35), 2);
        tracking(ctx, p.label, p.x + 40, 450, { size: 22, font: F.mono6, track: 5, color: hexA(E.bone, 0.45) });
        txt(ctx, p.val, p.x + pw / 2, 760, { size: 170, font: F.num, color: p.c, align: 'center', track: -6 });
        txt(ctx, p.note, p.x + pw / 2, 880, { size: 24, font: F.mono, color: hexA(E.bone, 0.50), align: 'center' });
        ctx.restore();
      });
      // the missing 10 points
      const gp = a(3.2, 0.6);
      if (gp > 0.01) {
        ctx.save();
        ctx.globalAlpha = gp;
        ctx.strokeStyle = hexA(E.gold, 0.5);
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 10]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 640);
        ctx.lineTo(W / 2, 1180);
        ctx.stroke();
        ctx.restore();
        chip(ctx, 'SELISIH 10 POIN', W / 2, 1230, { a: gp, color: E.gold, align: 'center' });
      }
    }

    /* ------------------------ SHOT B: the rupiah -------------------------- */
    if (t >= 7.2 && t < 12.4) {
      const p = ease.out(clamp((t - 7.3) / 1.6));
      // a weakening rupiah line: flat start, then sliding down
      const x0 = 150;
      const y0 = 430;
      const cw = W - 300;
      const ch = 520;
      chartBed(ctx, x0, y0, cw, ch, { a: a(7.2, 0.4), rows: 3, cols: 6 });
      const pts = [[x0, y0 + ch * 0.25], [x0 + cw * 0.3, y0 + ch * 0.32], [x0 + cw * 0.6, y0 + ch * 0.55], [x0 + cw, y0 + ch * 0.82]];
      path(ctx, pts, p, { color: E.ember, lw: 7, glow: 26 });
      chip(ctx, 'USD / IDR', x0 + 20, y0 - 30, { a: a(7.5, 0.5), color: E.ember });
      txt(ctx, 'RUPIAH', W / 2, 1180, { size: 120, font: F.num, color: E.ember, align: 'center', track: -3, alpha: a(8.2, 0.6) });
      tracking(ctx, 'YANG MELEMAH, BUKAN EMAS YANG NAIK', W / 2, 1240, {
        size: 22, font: F.mono6, track: 4, color: hexA(E.bone, 0.42), align: 'center', alpha: a(8.6, 0.6),
      });
    }

    /* --------------------------- SHOT C: the ruler ------------------------ */
    if (t >= 12.4) {
      const p = ease.expo(clamp((t - 12.5) / 0.7));
      ctx.save();
      ctx.globalAlpha = p;
      // two rulers of different lengths, measuring the same bar
      const y = 700;
      const x = 160;
      const g = linGrad(ctx, x, y, x + 1000, y, [[0, E.bone], [1, hexA(E.bone, 0.35)]]);
      ctx.strokeStyle = g;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + 1000, y);
      ctx.stroke();
      ctx.strokeStyle = hexA(E.ember, 0.85);
      ctx.beginPath();
      ctx.moveTo(x, y + 130); ctx.lineTo(x + 1000, y + 130);
      ctx.stroke();
      for (let i = 0; i <= 20; i++) {
        ctx.fillStyle = hexA(E.bone, i % 5 === 0 ? 0.35 : 0.16);
        ctx.fillRect(x + i * 50, y - 26, 1.6, i % 5 === 0 ? 22 : 12);
        ctx.fillRect(x + i * 46, y + 156, 1.6, i % 5 === 0 ? 22 : 12);
      }
      ctx.restore();
      txt(ctx, 'UANGNYA SAMA.', W / 2, 1060, {
        size: 84, font: F.head, color: E.bone, align: 'center', track: -1, alpha: a(13.4, 0.6),
      });
      txt(ctx, 'UKURANNYA BEDA.', W / 2, 1160, {
        size: 84, font: F.head, color: E.ember, align: 'center', track: -1, alpha: a(14.0, 0.6),
      });
    }
  },
};
