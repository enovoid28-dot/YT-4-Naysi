import { W, H, txt, hexA, fillRR, strokeRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { K, E, at, layer, sky, stars, water, reflection, skyline, kicker, chip, grain, tower } from './_kota.mjs';

// 07 — 2050. The same shoreline, thirty years on. The water rises past the
// second floor while the camera holds; only the rooftops stay dry.
const BASE = 1560;
const WATER_TOP = 690;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    sky(ctx, { top: '#05080B', mid: '#080F13', low: '#0E1D22', horizon: WATER_TOP, t });
    stars(ctx, { n: 44, seed: 61, t, bottom: 640, a: 0.32 });

    // the city, drawn first: the water will cover whatever is below the line
    layer(ctx, cam, 0.35, () => {
      skyline(ctx, {
        x0: -50, x1: W + 50, base: BASE, hMin: 760, hMax: 1180,
        seed: 71, lit: 0.34, win: '#FFC97C', gap: 22, glow: 1,
      });
    });

    // the water climbs to 2050
    const wA = at(t, 0.6, 3.4);
    const wy = BASE - (BASE - WATER_TOP) * E.inOut(wA);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, wy, W, H - wy);
    ctx.clip();
    water(ctx, wy, { t, a: 1, h: H - wy, calm: 1 });
    reflection(ctx, wy + 4, { t, h: 420, alpha: 0.5, seed: 12 });
    ctx.restore();

    // a thin bright line where the water is now
    if (wA > 0.02) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = hexA(K.waterHi, 0.8);
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 12) {
        const y = wy + Math.sin(x * 0.013 + t * 1.4) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    kicker(ctx, 'JIKA TIDAK ADA YANG BERUBAH', { y: 292, a: at(t, 0.2, 0.8) });

    // 2050 as a watermark that the water swallows
    const yA = at(t, 1.2, 1.0);
    if (yA > 0.01) {
      ctx.save();
      ctx.globalAlpha = yA * 0.16;
      txt(ctx, '2050', 720, 1120, {
        size: 300, font: F.num, color: K.bone, align: 'center', track: -10,
      });
      ctx.restore();
    }

    // 95 %
    const nA = at(t, 4.2, 0.9);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      const ty = 520 - (1 - nA) * 30;
      txt(ctx, '95', 92, ty, {
        size: 210, font: F.num, color: K.rust, track: -8,
        glowBlur: 44, glowColor: 'rgba(196,86,58,0.30)',
      });
      txt(ctx, '%', 92 + measure(ctx, '95', 210, F.num, -8) + 10, ty, { size: 100, font: F.num6, color: K.rust });
      txt(ctx, 'JAKARTA UTARA DI BAWAH AIR', 96, ty + 58, {
        size: 23, font: F.mono6, color: 'rgba(246,239,224,0.6)', track: 4,
      });
      ctx.restore();
    }

    // 10,6 juta
    const pA = at(t, 7.4, 0.8);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      ctx.fillStyle = 'rgba(4,12,15,0.7)';
      fillRR(ctx, 92, 1210, 580, 142, 71, ctx.fillStyle);
      ctx.strokeStyle = 'rgba(246,239,224,0.18)';
      ctx.lineWidth = 3;
      strokeRR(ctx, 92, 1210, 580, 142, 71);
      txt(ctx, '10,6 JUTA ORANG', 132, 1282, { size: 42, font: F.num6, color: K.bone });
      txt(ctx, 'TINGGAL DI JALUR INI', 134, 1324, {
        size: 19, font: F.mono6, color: 'rgba(246,239,224,0.45)', track: 4,
      });
      ctx.restore();
    }

    grain(ctx, 0.06);
  },
};
