import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, resi, box, grainOverlay } from './_kirim.mjs';
import { ghosts } from '../engine/motion.mjs';

// 09 — PINDAH TEMPAT
// The word itself is the last object: a sticker that walks from the receipt to
// the price tag, and leaves nothing behind.

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 620, glowA: 0.12 });

    tracking(ctx, 'PINDAH TEMPAT', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'NAYSI · 09', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.amber, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- shot A: the move ------------------------- */
    if (t < 8.4) {
      const p = ease.expo(clamp((t - 0.15) / 0.8));
      // left: the checkout card
      ctx.save();
      ctx.globalAlpha = p * 0.95;
      fillRR(ctx, 110, 430, 560, 520, 12, 'rgba(10,16,23,0.92)');
      strokeRR(ctx, 110, 430, 560, 520, 12, hexA(K.bone, 0.14), 1.6);
      tracking(ctx, 'CHECKOUT', 150, 500, { size: 20, font: F.mono6, track: 5, color: hexA(K.bone, 0.45) });
      txt(ctx, 'ONGKIR', 150, 620, { size: 30, font: F.mono6, color: hexA(K.bone, 0.55), track: 3 });
      txt(ctx, '0', 630, 640, { size: 72, font: F.num, color: K.mint, align: 'right' });
      ctx.fillStyle = hexA(K.bone, 0.10);
      ctx.fillRect(150, 700, 480, 1.6);
      txt(ctx, 'TOTAL', 150, 800, { size: 26, font: F.mono6, color: hexA(K.bone, 0.45), track: 3 });
      txt(ctx, '165.000', 630, 830, { size: 56, font: F.num, color: K.bone, align: 'right', track: -2 });
      ctx.restore();

      // right: the price tag
      ctx.save();
      ctx.globalAlpha = p;
      fillRR(ctx, W - 670, 430, 560, 520, 12, K.paper);
      tracking(ctx, 'HARGA BARANG', W - 630, 500, {
        size: 20, font: F.mono6, track: 5, color: 'rgba(26,27,30,0.5)',
      });
      txt(ctx, '150.000', W - 630, 700, { size: 78, font: F.num, color: '#1A1B1E', track: -3 });
      txt(ctx, '→ 165.000', W - 630, 790, {
        size: 44, font: F.mono6, color: '#9C3524', track: 1, alpha: a(4.4, 0.6),
      });
      ctx.restore();

      // the sticker in transit
      const mv = ease.inOut(clamp((t - 3.4) / 2.4));
      if (t > 3.3) {
        const sx = lerp(370, W - 370, mv);
        const sy = lerp(760, 800, mv) - Math.sin(mv * Math.PI) * 220;
        const drawSt = (al) => {
          ctx.save();
          ctx.globalAlpha = al;
          ctx.translate(sx, sy);
          ctx.rotate(-0.05 + Math.sin(mv * Math.PI) * 0.12);
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 10;
          fillRR(ctx, -170, -44, 340, 88, 6, K.amber);
          ctx.restore();
          txt(ctx, 'GRATIS', 0, 14, { size: 52, font: F.head, color: '#231505', align: 'center', track: 5 });
          ctx.restore();
        };
        if (mv > 0.02 && mv < 0.98) {
          ghosts(ctx, { dx: 22, dy: 14, n: 2, spread: 1.5, alpha: 0.12 }, () => drawSt(0.5));
        }
        drawSt(1);
      }

      tracking(ctx, 'DARI CHECKOUT KE HARGA', W / 2, 1120, {
        size: 22, font: F.mono6, track: 5, color: hexA(K.bone, 0.5), align: 'center', alpha: a(5.6, 0.6),
      });
    }

    /* --------------------------- shot B: closing -------------------------- */
    if (t >= 8.4) {
      const p = ease.expo(clamp((t - 8.5) / 0.8));
      // the parcel, alone, with nothing written on it but a plain label
      box(ctx, W / 2 - 300, 430, 600, 400, { a: p, rot: -0.01, tape: true, depth: 0.2, label: true, labelText: 'ISI: HARGA' });
      const q = a(10.2, 0.7);
      if (q > 0.01) {
        ctx.save();
        ctx.globalAlpha = q;
        txt(ctx, 'ONGKIR TIDAK HILANG.', W / 2, 1010, {
          size: 66, font: F.head, color: K.bone, align: 'center', track: 1,
        });
        txt(ctx, 'IA PINDAH KE HARGA.', W / 2, 1105, {
          size: 66, font: F.head, color: K.amber, align: 'center', track: 1,
        });
        ctx.restore();
      }
      const r = a(12.4, 0.7);
      if (r > 0.01) {
        ctx.save();
        ctx.globalAlpha = r;
        tracking(ctx, 'YANG GRATIS HANYA KATA-KATANYA', W / 2, 1230, {
          size: 26, font: F.mono6, track: 6, color: hexA(K.bone, 0.55), align: 'center',
        });
        ctx.restore();
      }
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
