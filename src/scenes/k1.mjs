import { W, H, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import {
  K, E, at, layer, sky, stars, water, reflection, tower, skyline, kicker, chip, grain, bracket,
} from './_kota.mjs';

// 01 — JAKARTA UTARA. Dusk on the bay. The sea is not climbing the city; the
// city is dropping away from the sea, and the wet tide line is what is left
// behind on the walls.
const SEA = 1252;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    sky(ctx, { top: '#070C11', mid: '#0E1B23', low: '#233E47', horizon: SEA, sun: [1080, SEA - 90, 760, '#FFB877'], t });

    layer(ctx, cam, 0.25, () => stars(ctx, { n: 70, seed: 9, t, bottom: 760, a: 0.55 }));

    // far bank: haze, no windows
    layer(ctx, cam, 0.35, () => {
      ctx.save();
      ctx.globalAlpha = 0.5;
      skyline(ctx, { base: SEA + 4, hMin: 180, hMax: 420, seed: 31, lit: 0.12, body: '#12222A', alpha: 0.9 });
      ctx.restore();
    });

    // the city itself, lit
    layer(ctx, cam, 0.62, () => {
      const a = at(t, 0.1, 0.9);
      ctx.save();
      ctx.globalAlpha = a;
      skyline(ctx, { x0: -60, x1: W + 60, base: SEA + 6, hMin: 300, hMax: 780, seed: 12, lit: 0.34, win: '#FFC97C' });
      ctx.restore();
    });

    // water, and its reflection
    const drop = 46 * at(t, 4.6, 1.8);
    layer(ctx, cam, 0.85, () => {
      water(ctx, SEA + 2, { t, h: H - SEA, calm: 1 });
      reflection(ctx, SEA + 2, { t, h: 360, alpha: 0.42, seed: 4 });
      ctx.save();
      ctx.globalAlpha = 0.5;
      water(ctx, SEA + drop, { t: t * 1.3, h: H - SEA, calm: 0.7, alpha: 0.35 });
      ctx.restore();
    });

    // the tide line: where the water was, on the walls
    const tl = at(t, 1.1, 1.2);
    if (tl > 0.01) {
      ctx.save();
      ctx.globalAlpha = tl;
      const y = SEA - 6;
      ctx.strokeStyle = hexA(K.rust, 0.95);
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, y);
      const x1 = W * E.inOut(tl);
      for (let x = 0; x <= x1; x += 12) ctx.lineTo(x, y + Math.sin(x * 0.02) * 3);
      ctx.stroke();
      // little drips under the line
      ctx.fillStyle = hexA(K.rust, 0.22);
      const r = rng(5);
      for (let i = 0; i < 40; i++) {
        const x = r() * x1;
        const hh = 10 + r() * 90;
        ctx.fillRect(x, y, 3, hh);
      }
      ctx.restore();
    }

    kicker(ctx, 'JAKARTA UTARA  ·  2025', { y: 250, a: at(t, 0.2, 0.8) });

    // the claim: not the sea — the ground
    const gA = at(t, 4.9, 0.8);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      const x = 1080;
      // arrow driving down into the water/ground
      ctx.strokeStyle = hexA(K.amber, 0.95);
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x, SEA + 60);
      ctx.lineTo(x, SEA + 250 * E.out(gA));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 34, SEA + 50 + 226 * E.out(gA));
      ctx.lineTo(x + 34, SEA + 50 + 226 * E.out(gA));
      ctx.lineTo(x, SEA + 50 + 292 * E.out(gA));
      ctx.closePath();
      ctx.fillStyle = hexA(K.amber, 0.95);
      ctx.fill();
      chip(ctx, 'TANAH TURUN', x + 48, SEA + 150, {
        a: gA, ink: K.amber, bg: 'rgba(6,10,12,0.72)', border: hexA(K.amber, 0.4), size: 25,
      });
      ctx.restore();
    }

    grain(ctx, 0.05);
  },
};
