import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, kick, paperCard, stampInk, halftone, par, folio, leader, circleMark, arrow,
} from './_kertas.mjs';

// 04 — HARGA PER BULAN
// The receipt unrolls out of the slot, and the number they advertise sits at the
// top while the number you pay waits at the bottom.

const ROWS = [
  { k: 'HARGA BARANG', v: '8.000.000', at: 0.35 },
  { k: 'TENOR', v: '12 BULAN', at: 0.9 },
  { k: 'BUNGA FLAT', v: '2,6% / BLN', at: 1.45 },
  { k: 'CICILAN PER BULAN', v: '874.667', at: 2.0, hot: true },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.5, glowY: 260, glowA: 0.30 });
    folio(ctx, '04', 'HARGA PER BULAN');

    par(ctx, cam, 0.2, () => {
      kick(ctx, 'EDISI 17', W - 88, 116, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
    });

    // the slot the receipt comes out of
    const rx = 340;
    const rw = 760;
    ctx.save();
    ctx.fillStyle = 'rgba(20,17,16,0.10)';
    ctx.fillRect(rx - 30, 286, rw + 60, 16);
    ctx.fillStyle = K.ink;
    ctx.fillRect(rx - 30, 296, rw + 60, 5);
    ctx.restore();

    // the paper slides out of the slot
    const unroll = ease.inOut(clamp((t - c(0, 0.15)) / 1.3));
    const total = ease.inOut(clamp((t - c(2, 0.05)) / 0.9));
    const RW = 950;
    const RX = (W - RW) / 2;
    const RH = 1060;

    ctx.save();
    ctx.beginPath();
    ctx.rect(RX - 8, 300 - 8, RW + 16, RH * unroll + 8);
    ctx.clip();

    ctx.save();
    ctx.fillStyle = 'rgba(20,17,16,0.14)';
    ctx.fillRect(RX + 14, 314, RW, RH);
    ctx.restore();
    ctx.fillStyle = '#FFFDF4';
    ctx.fillRect(RX, 300, RW, RH);
    ctx.fillStyle = 'rgba(20,17,16,0.10)';
    ctx.fillRect(RX, 300, 3, RH);
    ctx.fillRect(RX + RW - 3, 300, 3, RH);

    // header
    kick(ctx, 'STRUK SIMULASI', RX + 48, 384, { size: 20, color: 'rgba(20,17,16,0.40)', track: 5 });
    kick(ctx, 'TENOR 12 BULAN', RX + RW - 48, 384, {
      size: 20, color: 'rgba(20,17,16,0.40)', track: 4, align: 'right',
    });
    ctx.fillStyle = 'rgba(20,17,16,0.16)';
    ctx.fillRect(RX + 48, 412, RW - 96, 1.6);

    ROWS.forEach((R) => {
      const p = a(c(1, R.at), 0.5);
      if (p <= 0.01) return;
      const y = 530 + ROWS.indexOf(R) * 118;
      ctx.save();
      ctx.globalAlpha = p;
      kick(ctx, R.k, RX + 48, y, { size: 22, color: 'rgba(20,17,16,0.45)', track: 4 });
      ctx.save();
      ctx.translate((1 - p) * 26, 0);
      txt(ctx, R.v, RX + RW - 48, y + 6, {
        size: 50, font: F.num, color: R.hot ? K.red : K.ink, align: 'right', track: -1.5,
      });
      ctx.restore();
      const lw = measure(ctx, R.k, 22, F.mono6, 4);
      const vw = measure(ctx, R.v, 50, F.num, -1.5);
      leader(ctx, RX + 48 + lw + 20, RX + RW - 48 - vw - 20, y - 8, p);
      ctx.fillStyle = 'rgba(20,17,16,0.10)';
      ctx.fillRect(RX + 48, y + 36, RW - 96, 1.2);
      ctx.restore();
    });

    // the advertised number, circled
    const pc = ease.inOut(clamp((t - c(1, 1.2)) / 0.6));
    circleMark(ctx, RX + RW - 250, 870, 240, 74, pc, { color: K.red, lw: 5 });

    // perforation
    const py = 950;
    ctx.save();
    ctx.strokeStyle = 'rgba(20,17,16,0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(RX + 24, py);
    ctx.lineTo(RX + RW - 24, py);
    ctx.stroke();
    ctx.restore();

    // the total
    if (total > 0.01) {
      ctx.save();
      ctx.globalAlpha = total;
      kick(ctx, 'YANG KAMU BAYAR', RX + 48, py + 74, {
        size: 21, color: 'rgba(20,17,16,0.45)', track: 5,
      });
      txt(ctx, '10.496.000', RX + 48, py + 210, {
        size: 128, font: F.num, color: K.ink, track: -6,
      });
      kick(ctx, 'LEBIH 2.496.000 DARI HARGA BARANG', RX + 48, py + 266, {
        size: 19, color: K.red, track: 4,
      });
      let bx = RX + 48;
      for (let i = 0; i < 52; i++) {
        const w = 3 + Math.round(noise1(i * 2.7) * 9);
        ctx.fillStyle = 'rgba(20,17,16,0.70)';
        ctx.fillRect(bx, py + 296, w, 56);
        bx += w + 6;
      }
      ctx.restore();

      stampInk(ctx, 'BUKAN HARGA', RX + RW - 220, py + 130, {
        a: total * 0.95, rot: -0.1, size: 30, color: K.red,
      });
    }
    ctx.restore();

    // margin note, taped on the left
    const pm = a(c(0, 0.6), 0.6);
    if (pm > 0.01) {
      ctx.save();
      ctx.globalAlpha = pm;
      ctx.translate(136, 640);
      ctx.rotate(-0.06);
      kick(ctx, 'YANG', 0, 0, { size: 20, color: 'rgba(20,17,16,0.40)', track: 5, align: 'center' });
      kick(ctx, 'DIIKLANKAN', 0, 40, { size: 20, color: 'rgba(20,17,16,0.40)', track: 5, align: 'center' });
      arrow(ctx, 0, 96, 0, 210, { color: K.red, lw: 4, head: 16, p: pm });
      ctx.restore();
    }
  },
};
