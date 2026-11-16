import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, cue, vignette, contact } from './_kirim.mjs';

// 05 — YANG BAYAR
// The money does not vanish: it slides from the shipping line into the price
// tag, then the price ticks up, then the scale tips.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 560, glowA: 0.11, horizon: 1300 });

    // left: the shipping line, emptying
    const lOut = ease.inOut(clamp((t - c(1, 0)) / 0.9));
    ctx.save();
    ctx.globalAlpha = 0.95 * (1 - lOut * 0.55);
    fillRR(ctx, 110, 470, 520, 300, 12, 'rgba(10,16,23,0.92)');
    strokeRR(ctx, 110, 470, 520, 300, 12, hexA(K.bone, 0.16), 2);
    tracking(ctx, 'ONGKIR DI CHECKOUT', 150, 540, { size: 20, font: F.mono6, track: 4, color: hexA(K.bone, 0.5) });
    txt(ctx, lOut > 0.5 ? '0' : '8.000', 590, 660, {
      size: 76, font: F.num, color: lOut > 0.5 ? hexA(K.mint, 0.75) : K.bone, align: 'right',
    });
    ctx.restore();

    // right: the price tag, receiving it
    const swing = Math.sin(t * 1.2) * 0.012;
    ctx.save();
    ctx.translate(W - 330, 470);
    ctx.rotate(swing);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 46;
    ctx.shadowOffsetY = 18;
    fillRR(ctx, -270, 0, 540, 360, 12, K.paper);
    ctx.restore();
    tracking(ctx, 'HARGA BARANG', 0, 60, { size: 20, font: F.mono6, track: 4, color: 'rgba(26,27,30,0.5)', align: 'center' });
    const rise = ease.inOut(clamp((t - c(2, 0.25)) / 1.5));
    const price = 150000 + 15000 * rise;
    txt(ctx, price.toLocaleString('id-ID'), 0, 220, {
      size: 118, font: F.num, color: '#1A1B1E', align: 'center', track: -4,
    });
    if (rise > 0.02) {
      ctx.save();
      ctx.globalAlpha = rise;
      txt(ctx, '+10%', 0, 300, { size: 34, font: F.mono6, color: '#9C3524', align: 'center', track: 4 });
      ctx.restore();
    }
    ctx.restore();
    contact(ctx, W - 330, 860, 280, 30, 0.35);

    // the money in transit: a note that leaves the left card on cue 0
    const mv = ease.inOut(clamp((t - c(0, 0.35)) / 1.5));
    if (t > c(0, 0.35) && mv < 1.02) {
      const nx = lerp(360, W - 330, mv);
      const ny = 640 - Math.sin(mv * Math.PI) * 170;
      ctx.save();
      ctx.globalAlpha = 0.95 * (1 - clamp((mv - 0.9) / 0.1));
      ctx.translate(nx, ny);
      ctx.rotate(-0.06 + Math.sin(mv * Math.PI) * 0.16);
      fillRR(ctx, -110, -46, 220, 92, 6, '#D9C9A4');
      ctx.strokeStyle = 'rgba(90,70,40,0.35)';
      ctx.lineWidth = 2;
      strokeRR(ctx, -100, -36, 200, 72, 4, 'rgba(90,70,40,0.35)', 2);
      txt(ctx, '8.000', 0, 12, { size: 34, font: F.num6, color: 'rgba(80,60,34,0.8)', align: 'center' });
      ctx.restore();
    }

    // the scale on the final line
    const sc = a(c(3, 0.15), 0.6);
    if (sc > 0.01) {
      const tilt = ease.inOut(clamp((t - c(3, 0.6)) / 1.3)) * 0.13;
      const cx = W / 2;
      const cy = 1120;
      ctx.save();
      ctx.globalAlpha = sc * 0.95;
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.fillStyle = linGrad(ctx, -300, 0, 300, 0, [[0, '#8FA0B0'], [0.5, '#D7E2EC'], [1, '#7C8C9C']]);
      ctx.fillRect(-300, -8, 600, 16);
      for (const s of [-1, 1]) {
        ctx.strokeStyle = hexA(K.bone, 0.30);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s * 280, 0);
        ctx.lineTo(s * 280 - 60, 90);
        ctx.moveTo(s * 280, 0);
        ctx.lineTo(s * 280 + 60, 90);
        ctx.stroke();
        ctx.fillStyle = linGrad(ctx, s * 280 - 90, 90, s * 280 + 90, 120, [[0, '#9AA9B8'], [1, '#5E6C79']]);
        ctx.beginPath();
        ctx.ellipse(s * 280, 96, 92, 16, 0, 0, TAU);
        ctx.fill();
        fillRR(ctx, s * 280 - 62, 40, 124, 46, 5, s < 0 ? 'rgba(228,87,63,0.9)' : 'rgba(243,180,74,0.95)');
        tracking(ctx, s < 0 ? 'PENJUAL' : 'PEMBELI', s * 280, 70, {
          size: 14, font: F.mono6, track: 2, color: '#0B0F14', align: 'center',
        });
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = sc;
      ctx.fillStyle = 'rgba(214,228,240,0.22)';
      ctx.fillRect(cx - 6, cy, 12, 240);
      ctx.restore();
    }

    vignette(ctx, 0.5);
  },
};
