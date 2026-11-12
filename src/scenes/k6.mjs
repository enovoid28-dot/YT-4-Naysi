import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, bathyscaphe, drawRule, seabed, snailfish } from './_ocean.mjs';

// 06 — CHALLENGER DEEP. Eleven kilometres of water, and a number that sounds
// made up until you stack the weight it implies.

const BED = 1336;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    column(ctx, 1, { t, glowTop: 0 });

    // the last of the daylight: almost nothing survives eleven kilometres, and
    // what does arrives as a grey wash, not a spotlight
    ctx.save();
    const shaftA = (1 - at(t, 0.4, 3.2) * 0.45) * 0.055;
    const g = linGrad(ctx, 0, -240, 0, 1080, [[0, hexA(O.pale, shaftA)], [0.55, hexA(O.pale, shaftA * 0.32)], [1, hexA(O.pale, 0)]]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(W * 0.5 - 120, -240);
    ctx.lineTo(W * 0.5 + 120, -240);
    ctx.lineTo(W * 0.5 + 330, 1080);
    ctx.lineTo(W * 0.5 - 330, 1080);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    layer(ctx, cam, 0.08, () => {
      seabed(ctx, BED, t, { seed: 12, rocks: 0.8, tint: '#081519' });
    });

    // the machine on the floor of the world, lamp on
    const subY = BED - 96;
    layer(ctx, cam, 0.3, () => {
      // its lamp lands on the silt: a soft patch, then the machine above it
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const lamp = radGrad(ctx, W * 0.5 - 6, BED - 10, 0, 250, [[0, 'rgba(210,228,216,0.10)'], [1, 'rgba(210,228,216,0)']]);
      ctx.fillStyle = lamp;
      ctx.beginPath();
      ctx.ellipse(W * 0.5 - 6, BED - 10, 250, 70, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      bathyscaphe(ctx, W * 0.5 - 6, subY, 0.74, { t, a: at(t, 0.7, 1.1), lamp: 1, window: 1 });
    });

    // a measuring line from the surface to the floor of the world
    const ml = at(t, 1.4, 2.2);
    if (ml > 0.01) {
      ctx.save();
      ctx.globalAlpha = ml * 0.55;
      const lx = 1216;
      ctx.strokeStyle = hexA(O.aqua, 0.5);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 16]);
      ctx.beginPath();
      ctx.moveTo(lx, 260);
      ctx.lineTo(lx, lerp(260, BED - 60, ml));
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 1; i <= 12; i++) {
        const y = 260 + ((BED - 60 - 260) * i) / 13;
        ctx.globalAlpha = ml * 0.4;
        ctx.beginPath();
        ctx.moveTo(lx - 9, y);
        ctx.lineTo(lx + 9, y);
        ctx.stroke();
      }
      ctx.globalAlpha = ml * 0.6;
      txt(ctx, '0 m', lx + 18, 266, { size: 16, font: F.mono6, color: hexA(O.pale, 0.4), track: 2 });
      txt(ctx, '10.933 m', lx + 18, BED - 56, { size: 16, font: F.mono6, color: hexA(O.amber, 0.7), track: 2 });
      ctx.restore();
    }

    /* ---------------------------- the number ---------------------------- */
    const p = at(t, 1.2, 1.6, EA.quart);
    const val = Math.round(lerp(8000, 10935, p));
    const label = `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    ctx.save();
    ctx.globalAlpha = at(t, 1.0, 0.8);
    tracking(ctx, 'TITIK TERDALAM BUMI', W * 0.5, 470, {
      size: 20, font: F.mono6, track: 7, align: 'center', color: hexA(O.pale, 0.42),
    });
    txt(ctx, label, W * 0.5, 720, {
      size: 196, font: F.num, color: O.bone, track: -8, align: 'center',
    });
    tracking(ctx, 'METER DI BAWAH PERMUKAAN', W * 0.5, 782, {
      size: 22, font: F.mono6, track: 7, align: 'center', color: hexA(O.pale, 0.55),
    });
    ctx.restore();

    /* ------------------------------ 1.086 bar --------------------------- */
    const bar = at(t, 5.4, 0.8);
    if (bar > 0.01) {
      ctx.save();
      ctx.globalAlpha = bar;
      drawRule(ctx, 132, 132 + 380 * bar, 892, 1, { color: O.aqua, a: 0.32 });
      tracking(ctx, 'TEKANAN', 132, 946, { size: 19, font: F.mono6, track: 6, color: hexA(O.pale, 0.45) });
      txt(ctx, '1.086', 128, 1064, { size: 96, font: F.num, color: O.bone, track: -3 });
      tracking(ctx, 'BAR', 136, 1108, { size: 22, font: F.mono6, track: 6, color: hexA(O.aqua, 0.9) });
      ctx.restore();
    }

    /* ---------------------------- one tonne ----------------------------- */
    const w = at(t, 8.2, 0.9);
    if (w > 0.01) {
      const bx = 856;
      const by = 884;
      const bw = 300;
      const bh = 150;
      ctx.save();
      ctx.globalAlpha = w;
      // the square: one square centimetre of hull
      ctx.fillStyle = 'rgba(4,14,18,0.7)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = hexA(O.aqua, 0.7);
      ctx.lineWidth = 2.2;
      ctx.strokeRect(bx, by, bw, bh);
      tracking(ctx, '1 CM²', bx + bw / 2, by + 88, {
        size: 22, font: F.mono6, track: 6, align: 'center', color: hexA(O.aqua, 0.9),
      });
      // the weight coming down onto it
      const drop = EA.out(clamp((t - 8.7) / 0.9));
      const wy = by - 250 + drop * 150;
      ctx.fillStyle = 'rgba(10,24,28,0.96)';
      fillRR(ctx, bx + 42, wy, bw - 84, 66, 6, 'rgba(10,24,28,0.96)');
      strokeRR(ctx, bx + 42, wy, bw - 84, 66, 6, hexA(O.amber, 0.72), 2);
      tracking(ctx, '1 TON', bx + bw / 2, wy + 42, {
        size: 27, font: F.mono6, track: 6, align: 'center', color: O.amber,
      });
      // it rests on the plate and holds
      if (drop > 0.98) {
        ctx.strokeStyle = hexA(O.amberHi, 0.55);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx - 14, by + bh / 2);
        ctx.lineTo(bx - 34, by + bh / 2);
        ctx.moveTo(bx + bw + 14, by + bh / 2);
        ctx.lineTo(bx + bw + 34, by + bh / 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* --------------------------- and yet, life -------------------------- */
    const life = at(t, 11.6, 1.4);
    if (life > 0.01) {
      snailfish(ctx, 1042, BED - 30, 0.5, { t, a: life * 0.95, flip: 1 });
      ctx.save();
      ctx.globalAlpha = life * 0.7;
      drawRule(ctx, 1002, 1002 + 150 * life, BED - 96, 1, { color: O.glow, a: 0.4 });
      tracking(ctx, 'IKAN HADAL · 24 CM', 1002, BED - 114, {
        size: 16, font: F.mono6, track: 4, color: hexA(O.glow, 0.65),
      });
      ctx.restore();
    }

    chip(ctx, '1 °C · GELAP TOTAL', 132, 1200, {
      a: at(t, 3.0, 0.7) * 0.85, bg: 'rgba(3,10,14,0.7)', ink: hexA(O.bone, 0.85),
      border: hexA(O.aqua, 0.2), size: 19, track: 3,
    });

    kicker(ctx, 'SAMUDRA · CHALLENGER DEEP', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
