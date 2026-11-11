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

    // one person, on a surface that used to move: a silhouette with a rim,
    // a shadow at the boots and a whisper of a reflection in the ice
    layer(ctx, cam, 0.3, () => {
      const PX = 1000;
      const PY = 1570;
      // contact shadow
      const sh = radGrad(ctx, PX, PY + 4, 4, 108, [
        [0, 'rgba(16,32,44,0.42)'],
        [0.5, 'rgba(20,40,54,0.18)'],
        [1, 'rgba(30,50,64,0)'],
      ]);
      ctx.save();
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.ellipse(PX, PY + 4, 108, 30, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      // reflection
      ctx.save();
      ctx.beginPath();
      ctx.rect(PX - 200, PY, 400, 240);
      ctx.clip();
      ctx.translate(0, PY * 2);
      ctx.scale(1, -1);
      person(ctx, PX, PY, 244, {
        pose: 'stand', facing: -1, hat: 0, cloth: '#0E161C', skin: '#120E0C',
        rim: 0.1, alpha: 0.13, lit: 0.1,
      });
      ctx.restore();

      person(ctx, PX, PY, 244, {
        pose: 'stand', facing: -1, hat: 0, cloth: '#18222A', skin: '#221C18',
        rim: 0.9, alpha: 1, lit: 0.12,
      });
    });

    // haze that sits in front of the ice, as cold air does
    ctx.save();
    ctx.globalAlpha = 0.5;
    const fg = linGrad(ctx, 0, HZ - 10, 0, HZ + 420, [
      [0, 'rgba(150,186,204,0.30)'],
      [0.5, 'rgba(150,186,204,0.10)'],
      [1, 'rgba(150,186,204,0)'],
    ]);
    ctx.fillStyle = fg;
    ctx.fillRect(-240, HZ - 10, W + 480, 430);
    ctx.restore();

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
