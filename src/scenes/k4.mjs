import { W, H, txt, hexA, fillRR, strokeRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, sky, stars, kicker, chip, grain, bracket, bigNumber } from './_kota.mjs';

// 04 — BANDINGKAN. One year, two directions, on the same baseline. The sea is
// a hairline; the ground is a cliff. Three millimetres against a quarter metre.
const BASE = 830;
const PXMM = 2.24;
const SEA = 3.3 * PXMM;   // ~5,7 px
const LAND = 250 * PXMM;  // 560 px

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    sky(ctx, { top: '#05070A', mid: '#080E12', low: '#0D181D', horizon: BASE + 4, t });
    stars(ctx, { n: 46, seed: 17, t, bottom: BASE - 60, a: 0.35 });

    // the baseline both columns are measured from
    const bA = at(t, 0.15, 0.7);
    ctx.save();
    ctx.globalAlpha = bA;
    ctx.fillStyle = 'rgba(246,239,224,0.32)';
    ctx.fillRect(80, BASE, W - 160, 2);
    txt(ctx, 'GARIS NOL', 80, BASE - 18, {
      size: 21, font: F.mono6, color: 'rgba(246,239,224,0.42)', track: 4,
    });
    ctx.restore();

    // the sea: barely a sliver, so we give it a callout ring
    const sA = at(t, 1.2, 0.8);
    const sx = 330;
    if (sA > 0.01) {
      ctx.save();
      ctx.globalAlpha = sA;
      ctx.fillStyle = K.waterHi;
      const h = Math.max(3, SEA * sA);
      ctx.fillRect(sx - 70, BASE - h, 140, h);
      ctx.strokeStyle = hexA(K.waterHi, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, BASE + 6, 44, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      txt(ctx, 'LAUT', sx, BASE + 104, {
        size: 30, font: F.mono6, color: hexA(K.waterHi, 0.95), align: 'center', track: 5,
      });
      txt(ctx, '+3,3 MM', sx, BASE + 162, {
        size: 46, font: F.num6, color: K.bone, align: 'center',
      });
      txt(ctx, 'PER TAHUN', sx, BASE + 202, {
        size: 20, font: F.mono6, color: hexA(K.waterHi, 0.7), align: 'center', track: 4,
      });
      ctx.restore();
    }

    // the ground: a cliff, revealed as a falling column
    const lA = at(t, 2.6, 1.3);
    const lx = 966;
    if (lA > 0.01) {
      ctx.save();
      const h = LAND * E.inOut(lA);
      ctx.fillStyle = linGrad(ctx, 0, BASE, 0, BASE + LAND, [[0, '#D27B54'], [1, '#7E2E18']]);
      ctx.fillRect(lx - 96, BASE, 192, h);
      // sediment strata
      ctx.save();
      ctx.beginPath();
      ctx.rect(lx - 96, BASE, 192, h);
      ctx.clip();
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      for (let i = 1; i < 12; i++) ctx.fillRect(lx - 96, BASE + (LAND / 12) * i, 192, 4);
      ctx.fillStyle = 'rgba(255,220,180,0.10)';
      for (let i = 0; i < 12; i++) ctx.fillRect(lx - 96, BASE + (LAND / 12) * i + 4, 192, 2);
      ctx.restore();
      // arrow head at the bottom of the fall
      if (lA > 0.6) {
        const ay = BASE + h;
        ctx.fillStyle = K.rust;
        ctx.beginPath();
        ctx.moveTo(lx - 40, ay);
        ctx.lineTo(lx + 40, ay);
        ctx.lineTo(lx, ay + 54);
        ctx.closePath();
        ctx.fill();
      }
      txt(ctx, 'TANAH', lx, BASE - 44, {
        size: 30, font: F.mono6, color: hexA(K.rust, 0.95), align: 'center', track: 5,
      });
      txt(ctx, '−250 MM', lx, BASE + LAND + 92, {
        size: 46, font: F.num6, color: K.bone, align: 'center',
      });
      txt(ctx, 'PER TAHUN', lx, BASE + LAND + 132, {
        size: 20, font: F.mono6, color: hexA(K.rust, 0.8), align: 'center', track: 4,
      });
      ctx.restore();
    }

    // ×75
    const rA = at(t, 5.4, 0.8);
    if (rA > 0.01) {
      ctx.save();
      ctx.globalAlpha = rA;
      txt(ctx, '×', 96, 1268, { size: 110, font: F.num, color: 'rgba(246,239,224,0.28)' });
      txt(ctx, '75', 178, 1284, {
        size: 250, font: F.num, color: K.amber, track: -8,
        glowBlur: 48, glowColor: 'rgba(232,180,60,0.30)',
      });
      txt(ctx, 'LEBIH CEPAT DARI LAUT', 96, 1408, {
        size: 25, font: F.mono6, color: 'rgba(246,239,224,0.55)', track: 5,
      });
      ctx.restore();
    }

    kicker(ctx, 'SATU TAHUN, DUA ARAH', { y: 250, a: at(t, 0.2, 0.8) });
    grain(ctx, 0.05);
  },
};
