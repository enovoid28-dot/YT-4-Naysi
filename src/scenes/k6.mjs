import { W, H, txt, hexA, linGrad, radGrad, fillRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, starfield, iceSea } from './_space.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { person } from './_figure.mjs';

// 06 — LAUT MEMBEKU. No sun in the sky, no waves on the water: a plain of ice
// with one person standing on it, which is all the scale the shot needs.

const HZ = 1218;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    const g = linGrad(ctx, 0, -200, 0, HZ + 40, [
      [0, '#04070E'],
      [0.45, '#081420'],
      [0.78, '#123040'],
      [1, '#33586A'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, HZ + 260);
    starfield(ctx, { n: 150, seed: 91, t, a: 0.55, bottom: HZ - 120 });

    ctx.save();
    const hz = linGrad(ctx, 0, HZ - 190, 0, HZ + 30, [
      [0, 'rgba(90,140,170,0)'],
      [0.6, 'rgba(96,146,176,0.22)'],
      [1, 'rgba(150,190,210,0.35)'],
    ]);
    ctx.fillStyle = hz;
    ctx.fillRect(-240, HZ - 190, W + 480, 220);
    ctx.restore();

    layer(ctx, cam, 0.12, () => iceSea(ctx, HZ, { t, h: H - HZ + 160, seed: 23 }));

    // one person, on a surface that used to move
    layer(ctx, cam, 0.3, () => {
      person(ctx, 1000, 1570, 244, {
        pose: 'stand', facing: -1, hat: 0, cloth: '#33424C', skin: '#7D6048',
        rim: 0.55, alpha: 0.97,
      });
    });

    kicker(ctx, 'LAUT TIDAK LAGI BERGERAK', { x: 104, y: 250, color: '#8FB4E8', ink: hexA(S.bone, 0.86) });

    chip(ctx, '0 °C', 104, 1352, {
      a: at(t, 0.5, 0.7), bg: 'rgba(8,20,28,0.72)', ink: '#CFE6F2',
      border: 'rgba(160,205,230,0.35)', size: 30, track: 2,
    });
    txt(ctx, 'PERMUKAAN MEMBEKU', 104, 1416, {
      size: 23, font: F.mono6, color: hexA(S.bone, 0.5), track: 4, alpha: at(t, 0.8, 0.7),
    });
    txt(ctx, 'lalu menyusut ke bawah, lapis demi lapis', 104, 1458, {
      size: 25, font: F.body, color: hexA(S.bone, 0.62), alpha: at(t, 2.4, 0.8),
    });
  },
};
