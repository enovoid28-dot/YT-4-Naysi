import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, contact, grainOverlay } from './_kirim.mjs';

// 05 — YANG BAYAR
// A hanging price tag that ticks up, and a balance that tips: the shipping bill
// is not gone, it is on the other side of the same scale.

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 560, glowA: 0.11 });

    tracking(ctx, 'HARGA BARANG', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'NAIK 5–10%', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.ember, 0.65), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- shot A: the tag -------------------------- */
    if (t < 6.6) {
      const swing = Math.sin(t * 1.4) * 0.02;
      const p = ease.expo(clamp((t - 0.1) / 0.8));
      // string
      ctx.save();
      ctx.globalAlpha = p * 0.8;
      ctx.strokeStyle = hexA(K.bone, 0.30);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2, 250);
      ctx.lineTo(W / 2 + Math.sin(swing) * 300, 470);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2, 470);
      ctx.rotate(swing);
      ctx.globalAlpha = p;
      // shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 18;
      fillRR(ctx, -330, 0, 660, 420, 14, K.paper);
      ctx.restore();
      // hole + eyelet
      ctx.fillStyle = '#0B1118';
      ctx.beginPath();
      ctx.arc(0, 46, 18, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(26,27,30,0.35)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 46, 26, 0, TAU);
      ctx.stroke();
      tracking(ctx, 'KAOS · UK M', 0, 130, {
        size: 20, font: F.mono6, track: 5, color: 'rgba(26,27,30,0.5)', align: 'center',
      });
      const rise = ease.inOut(clamp((t - 2.4) / 1.6));
      const price = 150000 + 15000 * rise;
      txt(ctx, `${Math.round(price).toLocaleString('id-ID')}`, 0, 300, {
        size: 130, font: F.num, color: '#1A1B1E', align: 'center', track: -5,
      });
      txt(ctx, 'Rp', -40, 300, { size: 40, font: F.num, color: 'rgba(26,27,30,0.45)', align: 'right' });
      if (rise > 0.02) {
        ctx.save();
        ctx.globalAlpha = rise;
        txt(ctx, '+10%', 0, 380, {
          size: 34, font: F.mono6, color: '#9C3524', align: 'center', track: 3,
        });
        ctx.restore();
      }
      ctx.restore();
      contact(ctx, W / 2, 1010, 360, 40, 0.4 * p);

      tracking(ctx, 'ONGKIR PINDAH KE SINI', W / 2, 1120, {
        size: 24, font: F.mono6, track: 5, color: hexA(K.amber, 0.8), align: 'center', alpha: a(4.2, 0.6),
      });
    }

    /* -------------------------- shot B: the scale ------------------------- */
    if (t >= 6.6) {
      const p = ease.expo(clamp((t - 6.7) / 0.9));
      const tilt = ease.inOut(clamp((t - 8.2) / 1.4)) * 0.14;
      const cx = W / 2;
      const cy = 760;
      ctx.save();
      ctx.globalAlpha = p;
      // stand
      ctx.fillStyle = 'rgba(214,228,240,0.22)';
      ctx.fillRect(cx - 7, cy, 14, 320);
      fillRR(ctx, cx - 200, cy + 310, 400, 22, 8, 'rgba(214,228,240,0.20)');
      // beam
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.fillStyle = linGrad(ctx, -380, 0, 380, 0, [[0, '#8FA0B0'], [0.5, '#D7E2EC'], [1, '#7C8C9C']]);
      ctx.fillRect(-380, -9, 760, 18);
      // pans
      for (const s of [-1, 1]) {
        const px = s * 360;
        ctx.strokeStyle = hexA(K.bone, 0.32);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px - 70, 120);
        ctx.moveTo(px, 0);
        ctx.lineTo(px + 70, 120);
        ctx.stroke();
        ctx.fillStyle = linGrad(ctx, px - 120, 120, px + 120, 150, [[0, '#9AA9B8'], [1, '#5E6C79']]);
        ctx.beginPath();
        ctx.ellipse(px, 128, 120, 22, 0, 0, TAU);
        ctx.fill();
        // weight block
        const isSeller = s < 0;
        fillRR(ctx, px - 76, 60, 152, 62, 6, isSeller ? 'rgba(228,87,63,0.85)' : 'rgba(243,180,74,0.9)');
        tracking(ctx, isSeller ? 'PENJUAL' : 'PEMBELI', px, 98, {
          size: 15, font: F.mono6, track: 3, color: '#0B0F14', align: 'center',
        });
      }
      ctx.restore();

      tracking(ctx, 'SIAPA YANG MENANGGUNG', cx, 1180, {
        size: 24, font: F.mono6, track: 5, color: hexA(K.bone, 0.5), align: 'center', alpha: a(7.4, 0.6),
      });
      txt(ctx, 'TIDAK ADA YANG GRATIS', cx, 1300, {
        size: 68, font: F.head, color: K.bone, align: 'center', track: 1, alpha: a(9.6, 0.7),
      });
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
