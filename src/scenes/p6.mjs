import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  D, ease, cue, room, cone, motes, bokeh, vignette, par, plate, ring, sheen,
} from './_daya.mjs';

// 06 — HARGA ASLI
// The tariff plate is crossed out; the number you actually paid takes its place.

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.54, glowY: 300, glowA: 0.15, horizon: 1300 });
    cone(ctx, W * 0.5, 250, 1290, 500, { a: 0.06, t, color: D.mint });
    motes(ctx, t, { n: 44, a: 0.42 });

    // ── the plate: official price
    const plw = 720;
    const plx = (W - plw) / 2;
    const pin = ease.expo(clamp((t - c(0, 0.02)) / 0.65));
    par(ctx, cam, 0.6, () => {
      ctx.save();
      ctx.globalAlpha = pin;
      plate(ctx, plx, 352, plw, 236, {
        label: 'TARIF RESMI', value: '1.444,70', sub: 'R-1 / 1.300 VA · PER kWh', t,
      });
      ctx.restore();
      // struck through on the first line
      const sp = ease.inOut(clamp((t - c(0, 0.35)) / 0.45));
      if (sp > 0.01) {
        ctx.save();
        ctx.globalAlpha = 0.9 * sp;
        ctx.strokeStyle = D.ember;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(plx + 26, 352 + 168);
        ctx.lineTo(plx + 26 + (plw - 52) * sp, 352 + 152);
        ctx.stroke();
        ctx.restore();
      }
    });

    // ── the equation
    const eq = ease.expo(clamp((t - c(1, 0.05)) / 0.6));
    if (eq > 0.01) {
      ctx.save();
      ctx.globalAlpha = eq;
      const y = 720;
      tracking(ctx, 'YANG KAMU BAYAR, DIBAGI YANG KAMU DAPAT', W / 2, y - 44, {
        size: 18, font: F.mono6, track: 4, color: hexA(D.bone, 0.38), align: 'center',
      });
      txt(ctx, '100.000  ÷  65,8', W / 2, y + 86, {
        size: 84, font: F.num, color: D.bone, align: 'center', track: -2.6,
      });
      ctx.fillStyle = hexA(D.bone, 0.14);
      ctx.fillRect(W / 2 - 300, y + 122, 600 * eq, 2);
      ctx.restore();
    }

    // ── the price you actually paid
    const n = ease.expo(clamp((t - c(2, 0.05)) / 0.7));
    if (n > 0.01) {
      const w = 760;
      const h = 380;
      const x = (W - w) / 2;
      const y = 980 + (1 - n) * 40;
      ctx.save();
      ctx.globalAlpha = n;
      ctx.save();
      ctx.shadowColor = hexA(D.mint, 0.35);
      ctx.shadowBlur = 70;
      ctx.shadowOffsetY = 20;
      fillRR(ctx, x, y, w, h, 20, 'rgba(9,26,22,0.94)');
      ctx.restore();
      strokeRR(ctx, x, y, w, h, 20, hexA(D.mint, 0.55), 2.2);
      sheen(ctx, x, y, w, h, 20, t, { a: 0.07, speed: 0.14 });
      tracking(ctx, 'HARGA LISTRIK SEBENARNYA', x + w / 2, y + 62, {
        size: 19, font: F.mono6, track: 5, color: hexA(D.mint, 0.7), align: 'center',
      });
      txt(ctx, '1.519', x + w / 2, y + 226, {
        size: 150, font: F.num, color: D.bone, align: 'center', track: -5,
      });
      tracking(ctx, 'RUPIAH PER KILOWATT JAM', x + w / 2, y + 292, {
        size: 20, font: F.mono6, track: 4, color: hexA(D.bone, 0.45), align: 'center',
      });
      ctx.restore();

      // +5% badge
      const d = a(c(3, 0.05), 0.5);
      if (d > 0.01) {
        ctx.save();
        ctx.globalAlpha = d;
        const cx = x + w - 130;
        const cy = y + 118;
        ring(ctx, cx, cy, 74, 0.05 / 0.05 * d, { lw: 10, color: D.ember });
        txt(ctx, '+5%', cx, cy + 16, { size: 40, font: F.num, color: D.ember, align: 'center', track: -1 });
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = d * 0.9;
        tracking(ctx, 'DI ATAS TARIF RESMI', W / 2, y + h + 62, {
          size: 20, font: F.mono6, track: 4.5, color: hexA(D.ember, 0.8), align: 'center',
        });
        ctx.restore();
      }
    }

    bokeh(ctx, cam, { n: 5, a: 0.10 });
    vignette(ctx, 0.5);
  },
};
