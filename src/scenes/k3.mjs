import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { K, ease, depot, cue, vignette } from './_kirim.mjs';
import { barcode } from '../engine/motion.mjs';

// 03 — MEI 2026
// Three receipts arrive on the three numbers the voice reads, then one grey
// bar covers what the buyer never sees.

const RECEIPTS = [
  { card: 1, name: 'SHOPEE · GRATIS ONGKIR XTRA', big: '8%', sub: 'barang biasa · maks Rp40.000', tone: K.amber },
  { card: 2, name: 'SHOPEE · BARANG BESAR', big: '9,5%', sub: 'di atas 5 kg · maks Rp60.000', tone: K.amber },
  { card: 3, name: 'TIKTOK SHOP · LOGISTIK', big: 'Rp690–4.350', sub: 'per 5 kg · Jakarta · 1 Mei 2026', tone: K.ember },
];

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 600, glowA: 0.10, horizon: 1360 });

    tracking(ctx, 'MEI 2026 · BIAYA PINDAH TANGAN', W / 2, 250, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.50), align: 'center', alpha: a(c(0, 0.1), 0.6),
    });

    RECEIPTS.forEach((r, i) => {
      const p = ease.expo(clamp((t - c(r.card, 0.08)) / 0.6));
      if (p <= 0.001) return;
      const y = 380 + i * 320 - (1 - p) * 70;
      const x = 130 + i * 30;
      const w = W - 260 - i * 60;
      const h = 270;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 44;
      ctx.shadowOffsetY = 18;
      fillRR(ctx, x, y, w, h, 8, K.paper);
      ctx.restore();
      // torn top + printed grain
      ctx.fillStyle = 'rgba(26,27,30,0.10)';
      for (let px = x + 8; px < x + w - 8; px += 20) ctx.fillRect(px, y, 11, 3);
      tracking(ctx, r.name, x + 34, y + 56, { size: 19, font: F.mono6, track: 4, color: 'rgba(26,27,30,0.55)' });
      txt(ctx, r.big, x + 34, y + 168, {
        size: r.big.length > 6 ? 78 : 108, font: F.num, color: r.tone === K.amber ? '#8A5A10' : '#9C3524', track: -3,
      });
      txt(ctx, r.sub, x + w - 34, y + 132, {
        size: 24, font: F.mono, color: 'rgba(26,27,30,0.55)', align: 'right',
      });
      barcode(ctx, x + 34, y + h - 88, 250, 44, { color: 'rgba(26,27,30,0.7)', a: 1, seed: i + 4 });
      ctx.restore();
    });

    // the buyer's blind spot: covers the three receipts on the final line
    const bl = ease.inOut(clamp((t - c(4, 0.1)) / 0.9));
    if (bl > 0.01) {
      ctx.save();
      ctx.globalAlpha = 0.92 * bl;
      ctx.fillStyle = 'rgba(5,8,12,0.95)';
      const top = 380 - 30 + (1 - bl) * 120;
      ctx.fillRect(0, top, W, 1000);
      ctx.globalAlpha = bl;
      tracking(ctx, 'PEMBELI TIDAK MELIHAT SATU BARIS PUN', W / 2, 700, {
        size: 30, font: F.mono6, track: 5, color: hexA(K.bone, 0.75), align: 'center',
      });
      txt(ctx, 'Rp 0', W / 2, 830, {
        size: 150, font: F.num, color: hexA(K.mint, 0.9), align: 'center', track: -4,
      });
      tracking(ctx, 'YANG TERTULIS DI CHECKOUT', W / 2, 900, {
        size: 22, font: F.mono6, track: 4, color: hexA(K.bone, 0.45), align: 'center',
      });
      ctx.restore();
    }

    vignette(ctx, 0.45);
  },
};
