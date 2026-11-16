import { W, H, txt, hexA, linGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { E, ease, vault, bar, coin, chip, ledPlate } from './_emas.mjs';

// 03 — BIAYA DI DEPAN
// Three slips of paper, each one a fee you pay before the metal does anything.
// Then the interest gauge, sitting at zero.

const SLIPS = [
  { t: 0.2, title: 'ONGKOS CETAK', amount: '+ 62.000', note: 'per gram, saat beli' },
  { t: 1.4, title: 'PAJAK SAAT JUAL', amount: '+ 0,25%', note: 'dipotong dari buyback' },
  { t: 2.6, title: 'BIAYA TITIP', amount: '− 0,05%', note: 'per bulan, tabungan digital' },
];

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    vault(ctx, { t, glowX: W * 0.42, glowY: 600, glowA: 0.12 });

    tracking(ctx, 'BIAYA · SEBELUM HASIL', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'BUNGA', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.ember, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- SHOT A: the slips ------------------------ */
    if (t < 8.4) {
      SLIPS.forEach((s, i) => {
        const p = ease.expo(clamp((t - s.t) / 0.65));
        if (p <= 0.001) return;
        const y = 400 + i * 300 - (1 - p) * 60;
        const x = 120 + i * 34;
        const w = W - 240 - i * 68;
        ctx.save();
        ctx.globalAlpha = p;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 16;
        fillRR(ctx, x, y, w, 210, 12, E.paper);
        ctx.restore();
        // printed line
        txt(ctx, s.title, x + 42, y + 82, { size: 34, font: F.mono6, color: E.paperInk, track: 2 });
        txt(ctx, s.note, x + 42, y + 124, { size: 22, font: F.mono, color: 'rgba(25,28,34,0.5)', track: 1 });
        txt(ctx, s.amount, x + w - 42, y + 118, { size: 62, font: F.num, color: E.paperInk, align: 'right', track: -2 });
        ctx.fillStyle = 'rgba(25,28,34,0.16)';
        for (let px = x + 42; px < x + w - 42; px += 14) ctx.fillRect(px, y + 156, 7, 2);
        // stamp
        const sp = clamp((t - s.t - 0.35) / 0.22);
        if (sp > 0) {
          ctx.save();
          ctx.globalAlpha = p * sp * 0.9;
          ctx.translate(x + w - 150, y + 178);
          ctx.rotate(-0.06);
          ctx.strokeStyle = E.ember;
          ctx.lineWidth = 4;
          ctx.strokeRect(-110, -30, 220, 60);
          txt(ctx, 'DIBAYAR', 0, 10, { size: 30, font: F.head, color: E.ember, align: 'center', track: 4 });
          ctx.restore();
        }
        ctx.restore();
      });
      // the bar they are attached to
      bar(ctx, W / 2 - 420, 1420, 840, 170, { a: a(3.4, 0.6) * 0.85, shine: t * 0.07 });
    }

    /* --------------------------- SHOT B: zero ----------------------------- */
    if (t >= 8.4 && t < 13.4) {
      const p = ease.expo(clamp((t - 8.5) / 0.7));
      coin(ctx, W / 2, 760, 260 * (0.9 + 0.1 * p), { a: p });
      // gauge at zero
      const gx = 160;
      const gy = 1240;
      const gw = W - 320;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.fillStyle = 'rgba(247,242,228,0.10)';
      ctx.fillRect(gx, gy, gw, 6);
      ctx.fillStyle = hexA(E.ember, 0.9);
      ctx.fillRect(gx, gy - 8, 8, 22);
      for (let i = 0; i <= 10; i++) {
        ctx.fillStyle = hexA(E.bone, i === 0 ? 0.5 : 0.16);
        ctx.fillRect(gx + (gw * i) / 10, gy + 18, 1.6, i % 5 === 0 ? 18 : 10);
      }
      ctx.restore();
      txt(ctx, '0%', W / 2, 1420, { size: 150, font: F.num, color: hexA(E.goldHi, 0.9), align: 'center', track: -4, alpha: p });
      tracking(ctx, 'BUNGA YANG DIBAYAR EMAS', W / 2, 1476, {
        size: 22, font: F.mono6, track: 5, color: hexA(E.bone, 0.42), align: 'center', alpha: a(9.6, 0.5),
      });
    }

    /* ------------------------ SHOT C: the jewellery ----------------------- */
    if (t >= 13.4) {
      const p = ease.expo(clamp((t - 13.5) / 0.8));
      // a ring, drawn as two rings and a stone
      const cx = W / 2;
      const cy = 760;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.lineWidth = 46;
      ctx.strokeStyle = linGrad(ctx, cx - 200, cy - 200, cx + 200, cy + 200, [
        [0, E.goldHi], [0.5, '#C8922F'], [1, '#6E4A12'],
      ]);
      ctx.beginPath();
      ctx.arc(cx, cy, 190, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#7FD6E8';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 300);
      ctx.lineTo(cx + 54, cy - 214);
      ctx.lineTo(cx, cy - 130);
      ctx.lineTo(cx - 54, cy - 214);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // the making charge evaporates
      const burn = clamp((t - 15.2) / 2.4);
      ctx.save();
      ctx.globalAlpha = p;
      fillRR(ctx, 120, 1180, W - 240, 190, 14, 'rgba(228,87,63,0.08)');
      strokeRR(ctx, 120, 1180, W - 240, 190, 14, hexA(E.ember, 0.5), 2);
      tracking(ctx, 'ONGKOS PEMBUATAN', 160, 1240, { size: 24, font: F.mono6, track: 4, color: hexA(E.bone, 0.5) });
      txt(ctx, '− 25%', 160, 1330, { size: 86, font: F.num, color: E.ember, track: -3, alpha: 1 - burn * 0.75 });
      tracking(ctx, 'HILANG SAAT KAMU KELUAR TOKO', W - 160, 1330, {
        size: 21, font: F.mono6, track: 4, color: hexA(E.bone, 0.45), align: 'right',
      });
      ctx.restore();
    }
  },
};
