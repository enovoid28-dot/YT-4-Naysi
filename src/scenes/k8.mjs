import { W, H, txt, hexA, fillRR, strokeRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip } from './_kota.mjs';
import { G, heap, refinery } from './_garam.mjs';
import { person } from './_figure.mjs';

// 08 — CUCI. The answer is a machine, not a coastline. Dirty salt goes in on a
// belt, water washes it, white salt comes out the other side. Under it, the two
// coastlines, side by side, to close the loop opened in shot one.

const BASE = 1108;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, '#EFE8D9');
    ctx.save();
    const g = radGrad(ctx, 720, 620, 60, 1080, [[0, 'rgba(255,250,238,0.95)'], [1, 'rgba(214,201,177,0)']]);
    ctx.fillStyle = g;
    ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.restore();

    kicker(ctx, 'PENCUCIAN & PEMURNIAN', { x: 96, y: 262, a: at(t, 0.2, 0.6), color: G.rust, ink: 'rgba(20,15,12,0.72)' });

    // ground plane
    const gA = at(t, 0.15, 0.7);
    ctx.save();
    ctx.globalAlpha = gA;
    const floor = linGrad(ctx, 0, BASE, 0, BASE + 320, [[0, 'rgba(20,15,12,0.14)'], [1, 'rgba(20,15,12,0.02)']]);
    ctx.fillStyle = floor;
    ctx.fillRect(-160, BASE, W + 320, 340);
    ctx.fillStyle = 'rgba(20,15,12,0.45)';
    ctx.fillRect(-160, BASE, W + 320, 3);
    ctx.restore();

    // dirty heap, in
    const h1 = at(t, 0.5, 1.0);
    layer(ctx, cam, 0.14, () => heap(ctx, 268, BASE, 470, 330, { a: h1, tone: '#D6C3A0', t }));
    if (h1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = h1;
      txt(ctx, 'GARAM RAKYAT', 268, BASE + 74, { size: 26, font: F.mono6, color: 'rgba(20,15,12,0.8)', align: 'center', track: 4 });
      txt(ctx, 'kotor, kadar rendah', 268, BASE + 114, { size: 26, font: F.body, color: 'rgba(20,15,12,0.6)', align: 'center' });
      ctx.restore();
    }

    // the plant, standing on its own plinth
    const rA = at(t, 1.3, 1.1);
    if (rA > 0.01) {
      ctx.save();
      ctx.globalAlpha = rA;
      // plinth
      ctx.fillStyle = 'rgba(20,15,12,0.16)';
      ctx.fillRect(500, 1024, 480, BASE - 1024);
      ctx.fillStyle = '#7E8A84';
      ctx.fillRect(500, 1018, 480, 10);
      ctx.restore();
    }
    layer(ctx, cam, 0.1, () => refinery(ctx, 536, 556, 408, 462, { a: rA, t, spray: at(t, 2.0, 1.0) }));
    const rlA = at(t, 1.9, 0.8);
    if (rlA > 0.01) {
      ctx.save();
      ctx.globalAlpha = rlA;
      txt(ctx, 'CUCI + MURNI', 740, 1074, { size: 24, font: F.mono6, color: 'rgba(20,15,12,0.55)', align: 'center', track: 5 });
      ctx.restore();
    }

    // clean heap, out
    const h2 = at(t, 2.8, 1.1);
    layer(ctx, cam, 0.14, () => heap(ctx, 1180, BASE, 400, 372, { a: h2, tone: G.salt, t }));
    if (h2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = h2;
      txt(ctx, 'LAYAK INDUSTRI', 1180, BASE + 74, { size: 26, font: F.mono6, color: hexA(G.rust2, 0.95), align: 'center', track: 4 });
      txt(ctx, 'di atas 97 persen NaCl', 1180, BASE + 114, { size: 26, font: F.body, color: 'rgba(20,15,12,0.62)', align: 'center' });
      ctx.restore();
    }

    // he ends the film where the salt becomes usable
    const mA = at(t, 3.2, 1.0);
    if (mA > 0.01) {
      ctx.save();
      ctx.fillStyle = 'rgba(20,14,10,0.30)';
      ctx.beginPath();
      ctx.ellipse(404, BASE - 4, 86, 14, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      person(ctx, 404, BASE - 6, 352, { pose: 'watch', facing: 1, alpha: mA, cloth: '#D6CFBB' });
    }

    // the two coastlines, closing the argument
    const cA = at(t, 4.6, 1.0);
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      const x = 96;
      const y = 1400;
      txt(ctx, 'PANTAI', x, y - 112, { size: 22, font: F.mono6, color: 'rgba(20,15,12,0.5)', track: 5 });
      // ours: the full length of the ruler
      ctx.fillStyle = G.ink;
      ctx.fillRect(x, y - 72, 830 * E.out(at(t, 4.6, 1.4)), 34);
      txt(ctx, 'INDONESIA 99.093 KM', x + 830 + 24, y - 46, { size: 25, font: F.mono6, color: 'rgba(20,15,12,0.82)', track: 2 });
      // theirs: a quarter of it
      ctx.fillStyle = hexA(G.rust, 0.92);
      ctx.fillRect(x, y + 34, 830 * (25760 / 99093) * E.out(at(t, 5.0, 1.4)), 34);
      txt(ctx, 'AUSTRALIA 25.760 KM', x + 830 * (25760 / 99093) + 26, y + 60, { size: 25, font: F.mono6, color: hexA(G.rust2, 0.95), track: 2 });
      ctx.restore();
    }

    grain(ctx, 0.03);
  },
};
