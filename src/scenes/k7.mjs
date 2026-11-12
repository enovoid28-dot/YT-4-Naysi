import { W, H, txt, hexA, linGrad, radGrad, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, snow, motes, drawRule } from './_ocean.mjs';

// 07 — KENAPA TIDAK REMUK. Water cannot be squeezed, so it pushes everywhere at
// once. Air can be squeezed, and that is the only thing that breaks.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    // a dark green-black plate, not water: this is a diagram in the same film
    const g = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#03100F'], [0.5, '#04161A'], [1, '#02090C']]);
    ctx.fillStyle = g;
    ctx.fillRect(-260, -240, W + 520, H + 480);
    snow(ctx, t, { n: 90, seed: 91, a: 0.16, speed: 8 });

    const cx = W * 0.5;
    const cy = 860;

    /* ------------------------- the hull sphere ------------------------- */
    layer(ctx, cam, 0.2, () => {
      const R = 250;
      const gg = radGrad(ctx, cx - 70, cy - 90, 20, R * 1.5, [
        [0, 'rgba(40,96,100,0.55)'], [0.55, 'rgba(12,40,46,0.9)'], [1, 'rgba(4,16,20,0.98)'],
      ]);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fillStyle = gg;
      ctx.fill();
      ctx.strokeStyle = hexA(O.pale, 0.30);
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // water pressure: arrows converging from every direction
      const push = clamp((t - 0.6) / 2.2);
      const n = 18;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * TAU;
        const r0 = R + 190 + Math.sin(i * 2.3) * 40;
        const r1 = R + 22 - push * 0;
        const x0 = cx + Math.cos(ang) * r0;
        const y0 = cy + Math.sin(ang) * r0;
        const x1 = cx + Math.cos(ang) * (r0 - 120 * EA.out(push));
        const y1 = cy + Math.sin(ang) * (r0 - 120 * EA.out(push));
        const a = 0.16 + 0.5 * EA.out(push);
        ctx.strokeStyle = hexA(O.aqua, a);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        // arrow head
        const ah = 14;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - Math.cos(ang - 0.34) * ah, y1 - Math.sin(ang - 0.34) * ah);
        ctx.lineTo(x1 - Math.cos(ang + 0.34) * ah, y1 - Math.sin(ang + 0.34) * ah);
        ctx.closePath();
        ctx.fillStyle = hexA(O.aqua, a);
        ctx.fill();
      }

      // inside: an air pocket that cannot survive, and water that can
      const squeeze = EA.inOut(clamp((t - 2.6) / 3.2));
      const ax = cx - 96;
      const ay = cy + 6;
      const ar = lerp(58, 12, squeeze);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const ag = radGrad(ctx, ax, ay, 0, ar * 2.2, [[0, hexA(O.amber, 0.5)], [1, hexA(O.amber, 0)]]);
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(ax, ay, ar * 2.2, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, TAU);
      ctx.fillStyle = hexA(O.amber, 0.22 + 0.25 * (1 - squeeze));
      ctx.fill();
      ctx.strokeStyle = hexA(O.amberHi, 0.85);
      ctx.lineWidth = 2;
      ctx.stroke();
      tracking(ctx, 'UDARA', ax, ay + 108, {
        size: 19, font: F.mono6, track: 4, align: 'center', color: hexA(O.amber, 0.85),
      });

      // water-filled side: same volume, unmoved
      const bx = cx + 104;
      ctx.beginPath();
      ctx.arc(bx, ay, 58, 0, TAU);
      ctx.fillStyle = hexA(O.aqua, 0.16);
      ctx.fill();
      ctx.strokeStyle = hexA(O.aqua, 0.8);
      ctx.stroke();
      tracking(ctx, 'AIR', bx, ay + 108, {
        size: 19, font: F.mono6, track: 4, align: 'center', color: hexA(O.aqua, 0.85),
      });
    });

    /* --------------------------- the labels ---------------------------- */
    const p = at(t, 1.2, 0.8);
    ctx.save();
    ctx.globalAlpha = p;
    txt(ctx, '1.086', 132, 470, { size: 118, font: F.num, color: O.bone, track: -3 });
    tracking(ctx, 'BAR · SAMA DARI SEGALA ARAH', 138, 514, {
      size: 20, font: F.mono6, track: 4, color: hexA(O.pale, 0.5),
    });
    drawRule(ctx, 132, 132 + 300 * p, 430, 1, { color: O.aqua, a: 0.4 });
    ctx.restore();

    const q = at(t, 3.4, 0.9);
    if (q > 0.01) {
      ctx.save();
      ctx.globalAlpha = q;
      chip(ctx, 'AIR: HAMPIR TIDAK BISA DIMAMPATKAN', 132, 1290, {
        a: 0.94, bg: 'rgba(4,14,16,0.72)', ink: hexA(O.bone, 0.88),
        border: hexA(O.aqua, 0.24), size: 20, track: 3,
      });
      chip(ctx, 'UDARA: BISA — DAN ITU YANG PECAH', 132, 1370, {
        a: 0.94, bg: 'rgba(4,14,16,0.72)', ink: hexA(O.amber, 0.92),
        border: hexA(O.amber, 0.28), size: 20, track: 3,
      });
      ctx.restore();
    }

    motes(ctx, cx, cy, 420, { t, a: 0.16, n: 22, seed: 4 });

    kicker(ctx, 'SAMUDRA · KENAPA TIDAK REMUK', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
