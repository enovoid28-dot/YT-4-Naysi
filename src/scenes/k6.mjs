import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, snow, bathyscaphe, motes, drawRule } from './_ocean.mjs';

// 06 — CHALLENGER DEEP. Eleven kilometres of water, and a number that sounds
// made up until you stack the weight it implies.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    column(ctx, 1, { t, glowTop: 0 });

    // a thin shaft of light that has almost nothing left after 11 km
    const shaft = at(t, 0.2, 2.4);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = linGrad(ctx, 0, -200, 0, 900, [[0, hexA(O.pale, 0.16 * (1 - shaft * 0.55))], [1, hexA(O.pale, 0)]]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(W * 0.5 - 90, -200);
    ctx.lineTo(W * 0.5 + 90, -200);
    ctx.lineTo(W * 0.5 + 260, 900);
    ctx.lineTo(W * 0.5 - 260, 900);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    snow(ctx, t, { n: 170, seed: 77, a: 0.3, speed: 7, scale: 1.15 });

    // the tiny machine on the floor of the world
    const subY = 1290 + Math.sin(t * 0.5) * 6;
    layer(ctx, cam, 0.35, () => {
      bathyscaphe(ctx, W * 0.5 + 10, subY, 0.5, { t, a: at(t, 0.8, 1.1), lamp: 1, window: 1 });
    });
    motes(ctx, W * 0.5, subY + 40, 200, { t, a: 0.24, n: 20, seed: 5 });

    // the number
    const p = at(t, 1.2, 1.6, EA.quart);
    const val = Math.round(lerp(8000, 10935, p));
    const label = `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    ctx.save();
    ctx.globalAlpha = at(t, 1.0, 0.8);
    txt(ctx, label, W * 0.5, 760, {
      size: 200, font: F.num, color: O.bone, track: -8, align: 'center',
    });
    tracking(ctx, 'METER DI BAWAH PERMUKAAN', W * 0.5, 826, {
      size: 22, font: F.mono6, track: 7, align: 'center', color: hexA(O.pale, 0.55),
    });
    ctx.restore();

    // the weight of it: one square centimetre, one tonne
    const w = at(t, 3.0, 0.9);
    if (w > 0.01) {
      const bx = W * 0.5 - 150;
      const by = 1010;
      ctx.save();
      ctx.globalAlpha = w;
      // the square
      ctx.strokeStyle = hexA(O.aqua, 0.75);
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bx, by, 300, 150);
      ctx.fillStyle = hexA(O.aqua, 0.10);
      ctx.fillRect(bx, by, 300, 150);
      tracking(ctx, '1 CM²', bx + 150, by + 86, {
        size: 22, font: F.mono6, track: 6, align: 'center', color: hexA(O.aqua, 0.9),
      });
      // the weight falling onto it
      const drop = EA.out(clamp((t - 3.4) / 0.9));
      const wy = by - 250 + drop * 190;
      ctx.fillStyle = 'rgba(12,26,30,0.95)';
      fillRR(ctx, bx + 40, wy, 220, 74, 10, 'rgba(12,26,30,0.95)');
      ctx.strokeStyle = hexA(O.amber, 0.8);
      ctx.lineWidth = 2.5;
      strokeRR(ctx, bx + 40, wy, 220, 74, 10, hexA(O.amber, 0.8), 2.5);
      tracking(ctx, '1 TON', bx + 150, wy + 46, {
        size: 30, font: F.mono6, track: 6, align: 'center', color: O.amber,
      });
      // impact
      if (drop > 0.98) {
        const imp = at(t, 4.3, 1.0);
        ctx.globalAlpha = (1 - imp) * 0.6 * w;
        ctx.strokeStyle = O.amberHi;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(bx + 150, by + 6, 150 + imp * 220, 16 + imp * 26, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    chip(ctx, '1 °C · GELAP TOTAL', 900, 1400, {
      a: at(t, 2.6, 0.7) * 0.9, bg: 'rgba(3,10,14,0.72)', ink: hexA(O.bone, 0.85),
      border: hexA(O.aqua, 0.2), size: 20, track: 3,
    });

    kicker(ctx, 'SAMUDRA · CHALLENGER DEEP', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
