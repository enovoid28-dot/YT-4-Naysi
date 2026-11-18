import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { E, ease, vault, bar, chip, goldFill } from './_emas.mjs';

// 04 — HARGA DARI TAKUT
// The vault door, then the stack a central bank keeps, then the only gauge that
// actually prices gold: how much the world is afraid.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    vault(ctx, { t, glowX: W * 0.5, glowY: 620, glowA: 0.10 });

    tracking(ctx, 'SIAPA YANG BELI', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'BANK SENTRAL', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.gold, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- SHOT A: the door ------------------------- */
    if (t < 5.6) {
      const p = ease.expo(clamp((t - 0.1) / 0.9));
      const cx = W / 2;
      const cy = 790;
      const r = 330 * (0.92 + 0.08 * p);
      ctx.save();
      ctx.globalAlpha = p;
      // door plate
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 70;
      ctx.shadowOffsetY = 26;
      ctx.fillStyle = linGrad(ctx, cx - r, cy - r, cx + r, cy + r, [[0, '#26303C'], [0.5, '#131A23'], [1, '#080C12']]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(214,228,240,0.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 8, 0, TAU);
      ctx.stroke();
      // bolts
      for (let i = 0; i < 8; i++) {
        const th = (i / 8) * TAU + 0.2;
        const bx = cx + Math.cos(th) * (r - 58);
        const by = cy + Math.sin(th) * (r - 58);
        const bg = radGrad(ctx, bx - 6, by - 6, 2, 22, [[0, '#8C9AA8'], [1, '#2A333D']]);
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(bx, by, 20, 0, TAU);
        ctx.fill();
      }
      // wheel
      ctx.strokeStyle = linGrad(ctx, cx - 140, cy - 140, cx + 140, cy + 140, [[0, E.goldHi], [1, '#8A5F17']]);
      ctx.lineWidth = 16;
      for (let i = 0; i < 3; i++) {
        const th = (i / 3) * Math.PI * 2 + t * 0.12;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(th) * 40, cy + Math.sin(th) * 40);
        ctx.lineTo(cx + Math.cos(th) * 132, cy + Math.sin(th) * 132);
        ctx.stroke();
      }
      ctx.fillStyle = linGrad(ctx, cx - 46, cy - 46, cx + 46, cy + 46, [[0, E.goldHi], [1, '#9A6C1E']]);
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    /* --------------------------- SHOT B: the stack ------------------------ */
    if (t >= 5.6 && t < 10.6) {
      // a wall of bars, laid like bricks, growing upward
      const rows = 5;
      const cols = 6;
      const bw = 168;
      const bh = 74;
      const x0 = (W - cols * (bw + 10)) / 2;
      const y0 = 1120;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const p = ease.out(clamp((t - 5.7 - idx * 0.035) / 0.45));
          if (p <= 0.001) continue;
          const x = x0 + c * (bw + 10) + (r % 2) * 20;
          const y = y0 - r * (bh + 8) - (1 - p) * 60;
          bar(ctx, x, y, bw, bh, { a: p, shine: (t * 0.05 + idx * 0.07) % 1 });
        }
      }
      const bal = a(7.4, 0.6);
      txt(ctx, '+1.000 TON', W / 2, 420, {
        size: 150, font: F.num, color: E.goldHi, align: 'center', track: -5, alpha: bal,
      });
      tracking(ctx, 'PEMBELIAN BANK SENTRAL · PER TAHUN', W / 2, 490, {
        size: 22, font: F.mono6, track: 5, color: hexA(E.bone, 0.42), align: 'center', alpha: bal,
      });
    }

    /* --------------------------- SHOT C: the fear ------------------------- */
    if (t >= 10.6) {
      const p = ease.out(clamp((t - 10.7) / 1.4));
      const gx = 140;
      const gy = 620;
      const gw = W - 280;
      ctx.save();
      ctx.globalAlpha = a(10.7, 0.6);
      // arc gauge
      const cx = W / 2;
      const cy = 1080;
      const r = 430;
      ctx.lineWidth = 26;
      ctx.strokeStyle = 'rgba(247,242,228,0.10)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 1.18, Math.PI * 1.82);
      ctx.stroke();
      ctx.strokeStyle = linGrad(ctx, cx - r, cy, cx + r, cy, [[0, E.mint], [0.5, E.gold], [1, E.ember]]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 1.18, Math.PI * 1.18 + Math.PI * 0.64 * p);
      ctx.stroke();
      // needle
      const th = Math.PI * 1.18 + Math.PI * 0.64 * p;
      ctx.strokeStyle = E.bone;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(th) * (r - 20), cy + Math.sin(th) * (r - 20));
      ctx.stroke();
      ctx.fillStyle = E.gold;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, TAU);
      ctx.fill();
      ctx.restore();

      txt(ctx, 'TAKUT', W / 2, 1240, { size: 120, font: F.num, color: E.ember, align: 'center', track: -3, alpha: a(11.4, 0.6) });
      tracking(ctx, 'SATU-SATUNYA HARGA YANG DIJUAL EMAS', W / 2, 1300, {
        size: 22, font: F.mono6, track: 4, color: hexA(E.bone, 0.42), align: 'center', alpha: a(11.8, 0.6),
      });
    }
  },
};
