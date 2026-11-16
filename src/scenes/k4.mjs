import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, grainOverlay } from './_kirim.mjs';

// 04 — HITUNGAN SATU PESANAN
// A ledger printed in one pass, then the same numbers as a bar you can see.

const ROWS = [
  { l: 'HARGA BAJU', v: '150.000', c: K.bone, at: 0.3 },
  { l: 'BIAYA LAYANAN', v: '− 12.000', c: K.ember, at: 1.5 },
  { l: 'LOGISTIK', v: '− 5.000', c: K.ember, at: 2.4 },
  { l: 'IKLAN', v: '− 8.000', c: K.ember, at: 3.2 },
  { l: 'HARGA POKOK', v: '− 80.000', c: K.ember, at: 4.1 },
];

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 600, glowA: 0.10 });

    tracking(ctx, 'SATU PESANAN · SATU BAJU', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'HITUNGAN', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.amber, 0.62), align: 'right', alpha: a(0.02, 0.5),
    });

    /* ---------------------------- shot A: ledger -------------------------- */
    if (t < 9.6) {
      const x = 130;
      const y = 330;
      const w = W - 260;
      const h = 900;
      const p = ease.expo(clamp((t - 0.1) / 0.7));
      ctx.save();
      ctx.globalAlpha = p;
      fillRR(ctx, x, y, w, h, 12, 'rgba(10,16,23,0.92)');
      strokeRR(ctx, x, y, w, h, 12, hexA(K.bone, 0.12), 1.6);
      ctx.restore();

      ROWS.forEach((r, i) => {
        const q = clamp((t - r.at) / 0.4);
        if (q <= 0) return;
        const yy = y + 130 + i * 132;
        ctx.save();
        ctx.globalAlpha = p * q;
        tracking(ctx, r.l, x + 44, yy - 40, { size: 19, font: F.mono6, track: 4, color: hexA(K.bone, 0.40) });
        txt(ctx, r.v, x + 44, yy + 24, { size: 64, font: F.num, color: r.c, track: -2 });
        ctx.fillStyle = hexA(K.bone, 0.07);
        ctx.fillRect(x + 44, yy + 52, w - 88, 1.4);
        ctx.restore();
      });

      const q = a(5.0, 0.6);
      if (q > 0.01) {
        ctx.save();
        ctx.globalAlpha = q;
        txt(ctx, 'SISA', x + 44, y + 790, { size: 28, font: F.mono6, color: hexA(K.bone, 0.45), track: 5 });
        txt(ctx, '45.000', x + w - 44, y + 812, {
          size: 96, font: F.num, color: K.amber, align: 'right', track: -3,
        });
        ctx.restore();
      }
    }

    /* --------------------------- shot B: the bars ------------------------- */
    if (t >= 9.6) {
      const baseY = 900;
      const x0 = 150;
      const fullW = W - 300;
      const gross = 150000;
      const parts = [
        { v: 12000, c: K.ember, l: 'LAYANAN' },
        { v: 5000, c: '#C9492F', l: 'LOGISTIK' },
        { v: 8000, c: '#A83A28', l: 'IKLAN' },
        { v: 80000, c: '#7C2C1F', l: 'POKOK' },
      ];
      const p = ease.inOut(clamp((t - 9.7) / 1.6));
      let acc = 0;
      // the gross bar
      txt(ctx, '150.000', x0, baseY - 90, { size: 62, font: F.num, color: K.bone, track: -2, alpha: a(9.8, 0.5) });
      tracking(ctx, 'YANG DIBAYAR PEMBELI', x0, baseY - 130, {
        size: 19, font: F.mono6, track: 4, color: hexA(K.bone, 0.4), alpha: a(9.8, 0.5),
      });
      parts.forEach((pt, i) => {
        const wSegment = (pt.v / gross) * fullW * p;
        ctx.save();
        ctx.globalAlpha = 0.9;
        fillRR(ctx, x0 + acc, baseY - 40, Math.max(0, wSegment - 4), 84, 4, pt.c);
        ctx.restore();
        if (wSegment > 60) {
          txt(ctx, pt.l, x0 + acc + 14, baseY + 12, {
            size: 17, font: F.mono6, color: 'rgba(10,10,10,0.75)', track: 2,
          });
        }
        acc += wSegment;
      });
      // what is left
      const leftW = (45000 / gross) * fullW * p;
      ctx.save();
      ctx.globalAlpha = a(11.4, 0.6);
      fillRR(ctx, x0, baseY + 120, Math.max(0, leftW), 84, 4, K.amber);
      ctx.restore();
      tracking(ctx, 'SISA 45.000', x0, baseY + 250, {
        size: 24, font: F.mono6, track: 5, color: K.amber, alpha: a(11.6, 0.6),
      });
      tracking(ctx, 'SEBELUM RETUR · SEBELUM DISKON · SEBELUM PAJAK', W / 2, 1300, {
        size: 20, font: F.mono6, track: 4, color: hexA(K.bone, 0.38), align: 'center', alpha: a(12.6, 0.6),
      });
      txt(ctx, '30%', W - 200, baseY - 40, {
        size: 96, font: F.num, color: hexA(K.bone, 0.25), align: 'right', track: -3, alpha: a(13.6, 0.6),
      });
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
