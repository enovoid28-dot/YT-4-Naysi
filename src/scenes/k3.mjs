import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, resi, grainOverlay } from './_kirim.mjs';
import { barcode } from '../engine/motion.mjs';

// 03 — MEI 2026
// Three receipts, one move: the shipping bill leaves the platform's column and
// appears in the seller's.

const PLAT = [
  { at: 0.25, name: 'SHOPEE', line1: '8%', line2: 'dari harga jual', line3: 'maks Rp40.000', c: K.amber },
  { at: 1.25, name: 'SHOPEE', line1: '9,5%', line2: 'barang besar (>5kg)', line3: 'maks Rp60.000', c: K.amber },
  { at: 2.25, name: 'TIKTOK SHOP', line1: 'Rp690–4.350', line2: 'per 5 kg · Jakarta', line3: 'sejak 1 Mei 2026', c: K.ember },
];

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 620, glowA: 0.10 });

    tracking(ctx, 'MEI 2026', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'BIAYA PINDAH TANGAN', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.ember, 0.62), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- shot A: receipts ------------------------- */
    if (t < 10.4) {
      PLAT.forEach((p, i) => {
        const q = ease.expo(clamp((t - p.at) / 0.7));
        if (q <= 0.001) return;
        const y = 380 + i * 300 - (1 - q) * 50;
        const x = 120 + i * 26;
        const w = W - 240 - i * 52;
        const h = 250;
        ctx.save();
        ctx.globalAlpha = q;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 16;
        fillRR(ctx, x, y, w, h, 6, K.paper);
        ctx.restore();
        ctx.fillStyle = 'rgba(26,27,30,0.06)';
        for (let px = x + 10; px < x + w - 10; px += 16) ctx.fillRect(px, y + h - 26, 8, 2);
        // torn top edge
        ctx.fillStyle = 'rgba(26,27,30,0.10)';
        for (let px = x + 8; px < x + w - 8; px += 18) ctx.fillRect(px, y, 10, 3);
        tracking(ctx, p.name, x + 34, y + 54, { size: 20, font: F.mono6, track: 5, color: 'rgba(26,27,30,0.55)' });
        txt(ctx, 'BIAYA LAYANAN LOGISTIK', x + w - 34, y + 54, {
          size: 18, font: F.mono6, color: 'rgba(26,27,30,0.42)', align: 'right', track: 2,
        });
        txt(ctx, p.line1, x + 34, y + 148, { size: 82, font: F.num, color: p.c === K.amber ? '#8A5A10' : '#9C3524', track: -3 });
        txt(ctx, p.line2, x + w - 34, y + 130, {
          size: 24, font: F.mono, color: 'rgba(26,27,30,0.55)', align: 'right',
        });
        txt(ctx, p.line3, x + w - 34, y + 166, {
          size: 24, font: F.mono6, color: 'rgba(26,27,30,0.40)', align: 'right',
        });
        barcode(ctx, x + 34, y + h - 92, 260, 46, { color: 'rgba(26,27,30,0.7)', a: 1, seed: i + 3 });
        ctx.restore();
      });
    }

    /* -------------------------- shot B: the seller ------------------------ */
    if (t >= 10.4) {
      const p = ease.expo(clamp((t - 10.5) / 0.8));
      const x = 150;
      const y = 400;
      const w = W - 300;
      const h = 900;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 20;
      fillRR(ctx, x, y, w, h, 10, K.paper);
      ctx.restore();
      tracking(ctx, 'RINCIAN PENDAPATAN PENJUAL', x + 40, y + 62, {
        size: 20, font: F.mono6, track: 5, color: 'rgba(26,27,30,0.55)',
      });
      const rows = [
        { l: 'HARGA JUAL', v: '150.000', at: 11.1, c: 'rgba(26,27,30,0.9)' },
        { l: 'BIAYA LAYANAN 8%', v: '− 12.000', at: 11.5, c: '#9C3524' },
        { l: 'BIAYA LOGISTIK', v: '− 5.000', at: 11.9, c: '#9C3524' },
        { l: 'BIAYA IKLAN', v: '− 8.000', at: 12.3, c: '#9C3524' },
        { l: 'HARGA POKOK', v: '− 80.000', at: 12.7, c: '#9C3524' },
      ];
      rows.forEach((r, i) => {
        const q = clamp((t - r.at) / 0.35);
        if (q <= 0) return;
        const yy = y + 150 + i * 88;
        ctx.save();
        ctx.globalAlpha = p * q;
        txt(ctx, r.l, x + 40, yy, { size: 26, font: F.mono6, color: 'rgba(26,27,30,0.55)', track: 2 });
        txt(ctx, r.v, x + w - 40, yy, { size: 40, font: F.num6, color: r.c, align: 'right', track: -1 });
        ctx.fillStyle = 'rgba(26,27,30,0.10)';
        ctx.fillRect(x + 40, yy + 30, w - 80, 1.4);
        ctx.restore();
      });
      const q = a(13.5, 0.6);
      if (q > 0.01) {
        ctx.save();
        ctx.globalAlpha = q;
        ctx.fillStyle = 'rgba(26,27,30,0.14)';
        ctx.fillRect(x + 40, y + 620, w - 80, 3);
        txt(ctx, 'SISA UNTUK PENJUAL', x + 40, y + 700, {
          size: 26, font: F.mono6, color: 'rgba(26,27,30,0.6)', track: 3,
        });
        txt(ctx, '45.000', x + w - 40, y + 716, {
          size: 86, font: F.num, color: '#1A1B1E', align: 'right', track: -3,
        });
        ctx.restore();
      }
      ctx.restore();

      // the red note: the buyer never saw any of it
      const nq = a(15.6, 0.6);
      if (nq > 0.01) {
        ctx.save();
        ctx.globalAlpha = nq;
        ctx.translate(W - 210, 300);
        ctx.rotate(-0.06);
        strokeRR(ctx, -190, -46, 380, 92, 8, hexA(K.ember, 0.8), 3);
        txt(ctx, 'PEMBELI TIDAK LIHAT', 0, 8, {
          size: 26, font: F.head, color: K.ember, align: 'center', track: 3,
        });
        ctx.restore();
      }
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
