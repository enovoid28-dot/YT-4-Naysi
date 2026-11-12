import { W, H, txt, hexA, linGrad, radGrad, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, drawRule, material } from './_ocean.mjs';

// 07 — KENAPA TIDAK REMUK. Water cannot be squeezed, so it pushes everywhere at
// once. Air can be squeezed, and that is the only thing that breaks. A parcel of
// deep water, drawn as a specimen: two voids inside it, one that holds, one that
// collapses.

const FR = { x: 372, y: 664, w: 700, h: 636 };

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    // a plate, not water: this is a diagram in the same film
    const g = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#03100F'], [0.5, '#04161A'], [1, '#02090C']]);
    ctx.fillStyle = g;
    ctx.fillRect(-260, -240, W + 520, H + 480);
    material(ctx, 'haze', { x: -200, y: -200, w: W + 400, h: H + 400, a: 0.10, s: 2.2 });

    const cx = FR.x + FR.w / 2;
    const cy = FR.y + FR.h / 2;

    /* --------------------------- pressure field ------------------------- */
    // uniform arrows: the whole point is that they are all the same length
    const push = clamp((t - 0.3) / 1.5);
    const n = 26;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * TAU - Math.PI / 2;
      // project onto the rectangle border
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      const tx = Math.abs(cos) > 1e-4 ? (FR.w / 2) / Math.abs(cos) : 1e6;
      const ty = Math.abs(sin) > 1e-4 ? (FR.h / 2) / Math.abs(sin) : 1e6;
      const d = Math.min(tx, ty);
      const x1 = cx + cos * (d + 20);
      const y1 = cy + sin * (d + 20);
      const x0 = cx + cos * (d + 108);
      const y0 = cy + sin * (d + 108);
      const a = 0.14 + 0.42 * EA.out(push);
      ctx.strokeStyle = hexA(O.aqua, a);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      const ah = 12;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - Math.cos(ang - 0.38) * ah, y1 - Math.sin(ang - 0.38) * ah);
      ctx.lineTo(x1 - Math.cos(ang + 0.38) * ah, y1 - Math.sin(ang + 0.38) * ah);
      ctx.closePath();
      ctx.fillStyle = hexA(O.aqua, a);
      ctx.fill();
    }
    // corner ticks imply the field continues past the frame
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = hexA(O.aqua, 0.5);
    ctx.lineWidth = 1.2;
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const bx = cx + dx * (FR.w / 2);
      const by = cy + dy * (FR.h / 2);
      ctx.beginPath();
      ctx.moveTo(bx + dx * 26, by);
      ctx.lineTo(bx + dx * 26, by + dy * 26);
      ctx.lineTo(bx, by + dy * 26);
      ctx.stroke();
    }
    ctx.restore();

    /* ------------------------- the parcel of water ---------------------- */
    layer(ctx, cam, 0.16, () => {
      // the volume itself
      ctx.beginPath();
      ctx.rect(FR.x, FR.y, FR.w, FR.h);
      const wg = linGrad(ctx, FR.x, FR.y, FR.x + FR.w * 0.7, FR.y + FR.h, [
        [0, '#0A2C33'], [0.45, '#062028'], [1, '#03141A'],
      ]);
      ctx.fillStyle = wg;
      ctx.fill();
      material(ctx, 'haze', { x: FR.x, y: FR.y, w: FR.w, h: FR.h, a: 0.22, s: 1.5 });
      ctx.strokeStyle = hexA(O.pale, 0.28);
      ctx.lineWidth = 2;
      ctx.strokeRect(FR.x, FR.y, FR.w, FR.h);

      // corner marks, as on a figure in a paper
      ctx.strokeStyle = hexA(O.pale, 0.5);
      ctx.lineWidth = 2.4;
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const bx = FR.x + dx * FR.w;
        const by = FR.y + dy * FR.h;
        ctx.beginPath();
        ctx.moveTo(bx + (dx ? -26 : 26), by);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx, by + (dy ? -26 : 26));
        ctx.stroke();
      }

      const ay = cy - 14;

      /* --- pocket of water: same volume before and after --- */
      const wx = FR.x + 186;
      const wr = 84;
      ctx.beginPath();
      ctx.arc(wx, ay, wr, 0, TAU);
      const wg2 = radGrad(ctx, wx - 24, ay - 28, 4, wr * 1.3, [
        [0, hexA(O.aqua, 0.34)], [0.6, hexA(O.aqua, 0.18)], [1, hexA(O.aqua, 0.10)],
      ]);
      ctx.fillStyle = wg2;
      ctx.fill();
      ctx.strokeStyle = hexA(O.aqua, 0.85);
      ctx.lineWidth = 2.4;
      ctx.stroke();
      // water level inside the void
      ctx.beginPath();
      ctx.arc(wx, ay, wr - 1, Math.PI * 0.08, Math.PI * 0.92);
      ctx.strokeStyle = hexA(O.pale, 0.22);
      ctx.lineWidth = 1.4;
      ctx.stroke();

      /* --- pocket of air: squeezed --- */
      const ax = FR.x + 512;
      const squeeze = EA.inOut(clamp((t - 2.2) / 3.2));
      const ar = lerp(84, 26, squeeze);
      // ghost of the original volume
      ctx.setLineDash([7, 9]);
      ctx.strokeStyle = hexA(O.amber, 0.30);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(ax, ay, 84, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      const ag = radGrad(ctx, ax - 18, ay - 20, 2, ar * 1.5, [
        [0, hexA(O.amber, 0.34)], [1, hexA(O.amber, 0.14)],
      ]);
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, TAU);
      ctx.fillStyle = ag;
      ctx.fill();
      ctx.strokeStyle = hexA(O.amberHi, 0.9);
      ctx.lineWidth = 2.2;
      ctx.stroke();
      // the shove, inside the frame
      const arrow = EA.out(clamp((t - 2.6) / 2.4));
      if (arrow > 0.02) {
        const x0 = ax + 128;
        const x1 = x0 - 52 * arrow;
        ctx.strokeStyle = hexA(O.amber, 0.6 * arrow);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x0, ay);
        ctx.lineTo(x1, ay);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, ay);
        ctx.lineTo(x1 + 15, ay - 9);
        ctx.lineTo(x1 + 15, ay + 9);
        ctx.closePath();
        ctx.fillStyle = hexA(O.amber, 0.65 * arrow);
        ctx.fill();
      }

      // labels inside the parcel
      tracking(ctx, 'AIR', wx, ay + 146, {
        size: 21, font: F.mono6, track: 6, align: 'center', color: hexA(O.aqua, 0.9),
      });
      tracking(ctx, 'TETAP', wx, ay + 180, {
        size: 16, font: F.mono6, track: 4, align: 'center', color: hexA(O.pale, 0.4),
      });
      tracking(ctx, 'UDARA', ax, ay + 146, {
        size: 21, font: F.mono6, track: 6, align: 'center', color: hexA(O.amber, 0.92),
      });
      tracking(ctx, 'MENGERUT', ax, ay + 180, {
        size: 16, font: F.mono6, track: 4, align: 'center', color: hexA(O.pale, 0.4),
      });
    });

    /* --------------------------- the labels ---------------------------- */
    const p = at(t, 0.45, 0.8);
    ctx.save();
    ctx.globalAlpha = p;
    txt(ctx, '1.086', 132, 470, { size: 112, font: F.num, color: O.bone, track: -3 });
    tracking(ctx, 'BAR', 138, 512, { size: 21, font: F.mono6, track: 6, color: hexA(O.aqua, 0.9) });
    drawRule(ctx, 132, 132 + 300 * p, 424, 1, { color: O.aqua, a: 0.35 });
    tracking(ctx, 'SAMA DARI SEGALA ARAH', 132, 350, {
      size: 19, font: F.mono6, track: 5, color: hexA(O.pale, 0.42),
    });
    ctx.restore();

    const q = at(t, 4.4, 0.9);
    if (q > 0.01) {
      ctx.save();
      ctx.globalAlpha = q;
      chip(ctx, 'AIR: HAMPIR TIDAK BISA DIMAMPATKAN', 132, 1372, {
        a: 0.94, bg: 'rgba(4,14,16,0.72)', ink: hexA(O.bone, 0.88),
        border: hexA(O.aqua, 0.24), size: 20, track: 3,
      });
      chip(ctx, 'UDARA: BISA — DAN ITU YANG PECAH', 132, 1452, {
        a: 0.94, bg: 'rgba(4,14,16,0.72)', ink: hexA(O.amber, 0.92),
        border: hexA(O.amber, 0.28), size: 20, track: 3,
      });
      ctx.restore();
    }

    kicker(ctx, 'SAMUDRA · KENAPA TIDAK REMUK', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
