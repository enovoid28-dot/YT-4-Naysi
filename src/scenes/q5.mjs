import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, kick, paperCard, stampInk, halftone, par, folio, swash, circleMark,
} from './_kertas.mjs';

// 05 — BUNGA FLAT
// Twelve months, each one charged on the price you started with. Twelve small
// squares that add up to a number nobody puts on the banner.

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.4, glowY: 360, glowA: 0.34 });
    folio(ctx, '05', 'BUNGA FLAT');

    par(ctx, cam, 0.2, () => {
      kick(ctx, 'EDISI 17', W - 88, 116, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
    });

    // the monthly rate, as advertised
    const p0 = ease.expo(clamp((t - c(0, 0.05)) / 0.8));
    ctx.save();
    ctx.globalAlpha = p0;
    txt(ctx, '2,6%', 88 - (1 - p0) * 30, 560, { size: 250, font: F.num, color: K.ink, track: -10 });
    kick(ctx, 'PER BULAN', 96, 620, { size: 26, color: K.soft, track: 7 });
    ctx.restore();

    const p1 = a(c(0, 0.5), 0.6);
    if (p1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p1;
      stampInk(ctx, 'FLAT', 830, 470, { a: p1, rot: -0.07, size: 52, color: K.red, pad: 30 });
      ctx.restore();
    }

    // twelve cells, filled as the sentence counts them
    const gx = 88;
    const gy = 750;
    const cellW = 196;
    const cellH = 132;
    const gap = 16;
    for (let i = 0; i < 12; i++) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = gx + col * (cellW + gap);
      const y = gy + row * (cellH + gap);
      const p = ease.expo(clamp((t - c(2, 0.06 + i * 0.11)) / 0.4));
      // empty frame always there; the ink arrives with the beat
      ctx.save();
      ctx.strokeStyle = K.ink;
      ctx.lineWidth = 2.4;
      ctx.strokeRect(x, y, cellW, cellH);
      if (p > 0.001) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y + cellH * (1 - p), cellW, cellH * p);
        ctx.clip();
        ctx.fillStyle = K.ink;
        ctx.fillRect(x, y, cellW, cellH);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = p;
        txt(ctx, '2,6', x + cellW / 2, y + cellH * 0.62, {
          size: 52, font: F.num, color: '#F6F1E4', align: 'center', track: -2,
        });
        kick(ctx, `BULAN ${i + 1}`, x + cellW / 2, y + cellH - 18, {
          size: 14, color: 'rgba(246,241,228,0.55)', track: 3, align: 'center',
        });
        ctx.restore();
      }
      ctx.restore();
    }

    // the sum
    const ps = a(c(2, 1.45), 0.6);
    if (ps > 0.01) {
      ctx.save();
      ctx.globalAlpha = ps;
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 1064, W - 176, 3);
      kick(ctx, '2,6 × 12', 88, 1128, { size: 22, color: K.soft, track: 6 });
      ctx.save();
      ctx.translate((1 - ps) * 40, 0);
      txt(ctx, '31,2%', 88, 1300, { size: 260, font: F.num, color: K.red, track: -12 });
      ctx.restore();
      kick(ctx, 'DARI HARGA BARANG', 96, 1360, { size: 26, color: 'rgba(20,17,16,0.55)', track: 6 });
      ctx.restore();
    }

    const p3 = a(c(3, 0.05), 0.6);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3;
      // the false reading, crossed out
      ctx.translate(840, 1090);
      ctx.rotate(-0.03);
      paperCard(ctx, 0, 0, 560, 150, { off: 8, fill: '#FFFDF6' });
      kick(ctx, 'YANG KAMU BACA', 36, 52, { size: 16, color: 'rgba(20,17,16,0.40)', track: 4 });
      txt(ctx, '2,6% setahun', 36, 112, { size: 50, font: F.num, color: 'rgba(20,17,16,0.5)', track: -2 });
      swash(ctx, 40, 96, 470, p3, { color: 'rgba(210,56,31,0.20)', h: 56 });
      ctx.strokeStyle = K.red;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(34, 118);
      ctx.lineTo(34 + 470 * p3, 96);
      ctx.stroke();
      ctx.restore();
    }
  },
};
