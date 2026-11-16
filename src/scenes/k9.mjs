import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { K, ease, depot, box, cue, vignette } from './_kirim.mjs';
import { ghosts } from '../engine/motion.mjs';

// 09 — PINDAH TEMPAT
// The word itself moves on cue, from the receipt to the tag, and the last shot
// leaves a plain parcel with nothing written on it but the truth.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 600, glowA: 0.12, horizon: 1280 });

    const fin = a(c(3, 0.15), 0.7);
    if (fin > 0.01) {
      // closing frame
      box(ctx, W / 2 - 320, 400, 640, 420, { a: fin, rot: -0.01, tape: true, depth: 0.18, label: true, labelText: 'ISI: HARGA' });
      ctx.save();
      ctx.globalAlpha = fin;
      txt(ctx, 'ONGKIR TIDAK HILANG.', W / 2, 1000, {
        size: 62, font: F.head, color: K.bone, align: 'center', track: 1,
      });
      txt(ctx, 'IA PINDAH KE HARGA.', W / 2, 1096, {
        size: 62, font: F.head, color: K.amber, align: 'center', track: 1,
      });
      tracking(ctx, 'YANG GRATIS HANYA KATA-KATANYA', W / 2, 1210, {
        size: 26, font: F.mono6, track: 5, color: hexA(K.bone, 0.55), align: 'center',
      });
      ctx.restore();
      return;
    }

    // two panels: the receipt and the tag
    const p = ease.expo(clamp((t - 0.05) / 0.6));
    ctx.save();
    ctx.globalAlpha = p * 0.96;
    fillRR(ctx, 100, 400, 560, 520, 14, 'rgba(10,16,23,0.94)');
    strokeRR(ctx, 100, 400, 560, 520, 14, hexA(K.bone, 0.16), 2);
    tracking(ctx, 'CHECKOUT', 140, 470, { size: 22, font: F.mono6, track: 5, color: hexA(K.bone, 0.5) });
    txt(ctx, 'ONGKIR', 140, 600, { size: 32, font: F.mono6, color: hexA(K.bone, 0.6), track: 3 });
    txt(ctx, '0', 620, 620, { size: 84, font: F.num, color: K.mint, align: 'right' });
    ctx.fillStyle = hexA(K.bone, 0.12);
    ctx.fillRect(140, 690, 480, 2);
    txt(ctx, 'TOTAL', 140, 800, { size: 28, font: F.mono6, color: hexA(K.bone, 0.45), track: 3 });
    txt(ctx, '165.000', 620, 840, { size: 58, font: F.num, color: K.bone, align: 'right', track: -2 });
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = p;
    fillRR(ctx, W - 660, 400, 560, 520, 14, K.paper);
    tracking(ctx, 'HARGA BARANG', W - 620, 470, { size: 22, font: F.mono6, track: 5, color: 'rgba(26,27,30,0.5)' });
    txt(ctx, '165.000', W - 620, 660, { size: 76, font: F.num, color: '#1A1B1E', track: -3 });
    const rr = a(c(2, 0.9), 0.5);
    if (rr > 0.01) {
      ctx.save();
      ctx.globalAlpha = rr;
      txt(ctx, 'termasuk ongkir', W - 620, 730, {
        size: 30, font: F.mono, color: '#9C3524',
      });
      ctx.restore();
    }
    ctx.restore();

    // the sticker, walking across on cue 2
    const mv = ease.inOut(clamp((t - c(2, 0.05)) / 2.6));
    if (t > c(2, 0)) {
      const sx = lerp(-260, W - 340, mv);
      const sy = lerp(700, 836, mv) - Math.sin(mv * Math.PI) * 130;
      const drawSt = (al) => {
        ctx.save();
        ctx.globalAlpha = al;
        ctx.translate(sx, sy);
        ctx.rotate(-0.05 + Math.sin(mv * Math.PI) * 0.14);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 26;
        ctx.shadowOffsetY = 12;
        fillRR(ctx, -190, -52, 380, 104, 8, K.amber);
        ctx.restore();
        txt(ctx, 'GRATIS', 0, 16, { size: 60, font: F.head, color: '#231505', align: 'center', track: 5 });
        ctx.restore();
      };
      if (mv > 0.02 && mv < 0.98) {
        ghosts(ctx, { dx: 24, dy: 16, n: 2, spread: 1.5, alpha: 0.14 }, () => drawSt(0.45));
      }
      drawSt(1);
    }

    tracking(ctx, 'DARI CHECKOUT KE HARGA', W / 2, 1060, {
      size: 24, font: F.mono6, track: 5, color: hexA(K.bone, 0.55), align: 'center', alpha: a(c(2, 0.4), 0.6),
    });

    vignette(ctx, 0.5);
  },
};
