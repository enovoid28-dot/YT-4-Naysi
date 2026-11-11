import { W, H, txt, hexA, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { at, layer, kicker } from './_kota.mjs';
import { S, starfield, limb } from './_space.mjs';

// 09 — CAHAYA. The closing shot is the thing that was never in danger: the
// planet, still lit at its edge by a star that is no longer there.

const CY = 2900;
const R = 1912;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    const g = linGrad(ctx, 0, -200, 0, 1100, [[0, '#03050B'], [0.6, '#050912'], [1, '#08131F']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, 1600);
    starfield(ctx, { n: 230, seed: 211, t, a: 0.85, bottom: 1020 });

    layer(ctx, cam, 0.2, () => {
      limb(ctx, 720, CY, R, { t, glow: 1, lights: 1, dawn: 0.5, dawnX: 1300 });
    });

    kicker(ctx, '150 JUTA KM DARI TITIK YANG HILANG', { x: 104, y: 250, color: '#8FB4E8', ink: hexA(S.bone, 0.86) });
  },
};
