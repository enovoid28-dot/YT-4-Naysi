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

    // the receipts sink away on the last line, so the checkout screen stands alone
    const bl = ease.inOut(clamp((t - c(4, 0.1)) / 0.9));

    // the opening beat: the shipping cost changes hands, left chip to right chip
    const handA = 1 - ease.inOut(clamp((t - c(1, -0.32)) / 0.45));
    if (handA > 0.01) {
      const laneY = 900;
      const mv = ease.inOut(clamp((t - c(0, 0.25)) / 2.2));
      ctx.save();
      ctx.globalAlpha = 0.95 * handA * a(c(0, 0.05), 0.5);
      // dashed lane
      ctx.save();
      ctx.strokeStyle = hexA(K.bone, 0.20);
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(430, laneY);
      ctx.lineTo(W - 430, laneY);
      ctx.stroke();
      ctx.restore();
      // the cost itself, moving
      const tx = lerp(250, W - 250, mv);
      const ty = laneY - Math.sin(mv * Math.PI) * 62;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(-0.03 + Math.sin(mv * Math.PI) * 0.10);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
      fillRR(ctx, -240, -66, 480, 132, 10, K.amber);
      ctx.restore();
      tracking(ctx, 'ONGKIR 8.000', 0, 14, {
        size: 48, font: F.mono6, track: 3, color: '#231505', align: 'center',
      });
      ctx.restore();
      // chips on top: the cost disappears under the buyer's hand
      for (const [ccx, label, tone] of [[250, 'PENJUAL', K.cyan], [W - 250, 'PEMBELI', K.mint]]) {
        const lit = label === 'PENJUAL' ? 1 - 0.45 * mv : 0.55 + 0.45 * mv;
        fillRR(ctx, ccx - 195, laneY - 66, 390, 132, 12, 'rgba(9,14,20,0.98)');
        strokeRR(ctx, ccx - 195, laneY - 66, 390, 132, 12, hexA(tone, 0.12 + 0.55 * lit), 2);
        tracking(ctx, label, ccx, laneY + 12, {
          size: 36, font: F.mono6, track: 5, color: hexA(K.bone, 0.40 + 0.5 * lit), align: 'center',
        });
      }
      tracking(ctx, 'BIAYA KIRIM', W / 2, laneY + 118, {
        size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.35), align: 'center',
      });
      ctx.restore();
    }

    RECEIPTS.forEach((r, i) => {
      const p = ease.expo(clamp((t - c(r.card, 0.08)) / 0.6)) * (1 - bl);
      if (p <= 0.001) return;
      const y = 430 + i * 350 - (1 - p) * 70;
      const x = 130 + i * 26;
      const w = W - 260 - i * 52;
      const h = 300;
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
      tracking(ctx, r.name, x + 34, y + 60, { size: 20, font: F.mono6, track: 4, color: 'rgba(26,27,30,0.55)' });
      txt(ctx, r.big, x + 34, y + 186, {
        size: r.big.length > 6 ? 78 : 108, font: F.num, color: r.tone === K.amber ? '#8A5A10' : '#9C3524', track: -3,
      });
      txt(ctx, r.sub, x + w - 34, y + 146, {
        size: 24, font: F.mono, color: 'rgba(26,27,30,0.55)', align: 'right',
      });
      barcode(ctx, x + 34, y + h - 92, 250, 44, { color: 'rgba(26,27,30,0.7)', a: 1, seed: i + 4 });
      ctx.restore();
    });

    // the buyer's blind spot: all that is left is one clean checkout screen
    if (bl > 0.01) {
      ctx.save();
      ctx.globalAlpha = bl;
      const cx = 150;
      const cy = 470;
      const cw = W - 300;
      const ch = 660;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 46;
      ctx.shadowOffsetY = 18;
      fillRR(ctx, cx, cy, cw, ch, 14, 'rgba(11,17,24,0.97)');
      ctx.restore();
      strokeRR(ctx, cx, cy, cw, ch, 14, hexA(K.bone, 0.18), 2);
      tracking(ctx, 'LAYAR CHECKOUT · YANG KAMU LIHAT', cx + 44, cy + 62, {
        size: 20, font: F.mono6, track: 5, color: hexA(K.bone, 0.45),
      });

      const row = (yy, label, value, { tone = hexA(K.bone, 0.92), size = 52, six = F.num } = {}) => {
        txt(ctx, label, cx + 44, yy, { size: 24, font: F.mono6, color: hexA(K.bone, 0.45), track: 4 });
        txt(ctx, value, cx + cw - 44, yy, { size, font: six, color: tone, align: 'right', track: -1 });
      };
      ctx.fillStyle = hexA(K.bone, 0.10);
      ctx.fillRect(cx + 44, cy + 108, cw - 88, 2);
      row(cy + 190, 'SUB TOTAL', '150.000');
      ctx.fillStyle = hexA(K.bone, 0.10);
      ctx.fillRect(cx + 44, cy + 236, cw - 88, 2);
      row(cy + 322, 'ONGKIR', '0', { tone: K.mint, size: 64 });
      ctx.fillStyle = hexA(K.mint, 0.30);
      ctx.fillRect(cx + 44, cy + 368, cw - 88, 2);
      row(cy + 470, 'TOTAL DIBAYAR', '150.000', { size: 62 });
      tracking(ctx, 'TIGA BARIS. TIDAK ADA BARIS KEEMPAT.', cx + 44, cy + ch - 52, {
        size: 19, font: F.mono6, track: 4, color: hexA(K.bone, 0.35),
      });
      ctx.restore();

      // the line that was never printed, stamped underneath
      const st = a(c(4, 1.4), 0.5);
      if (st > 0.01) {
        ctx.save();
        ctx.globalAlpha = st;
        ctx.translate(W / 2, 1240);
        ctx.rotate(-0.02);
        fillRR(ctx, -430, -54, 860, 108, 10, hexA(K.ember, 0.10));
        strokeRR(ctx, -430, -54, 860, 108, 10, hexA(K.ember, 0.55), 2);
        tracking(ctx, 'SATU BARIS PUN TIDAK KAMU LIHAT', 0, 11, {
          size: 28, font: F.mono6, track: 4, color: hexA(K.ember, 0.9), align: 'center',
        });
        ctx.restore();
      }
    }

    vignette(ctx, 0.45);
  },
};
