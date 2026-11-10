import { W, H, txt, hexA, fillRR, strokeRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, soil, concrete, kicker, chip, grain, bracket, pump, borehole } from './_kota.mjs';

// 03 — SUMBERNYA. A half-cut house on the yard, and the 200 m straw that goes
// through it into the aquifer. The water that comes up is the ground leaving.
const GROUND = 700;
const AQUIFER = 1440;
const BOTTOM = 1620;
const PIPE_X = 700;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    // sky / air above the yard
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, GROUND, [
      [0, '#C9D4CF'],
      [0.55, '#E4DCC6'],
      [1, '#F1E5CD'],
    ]);
    ctx.fillRect(-200, -200, W + 400, GROUND + 204);

    // the cut: soil from the surface down, with the aquifer at the bottom
    soil(ctx, GROUND, { h: H - GROUND, seed: 21 });
    layer(ctx, cam, 0.15, () => {
      // aquifer band
      const aq = at(t, 1.0, 1.4);
      ctx.fillStyle = linGrad(ctx, 0, AQUIFER, 0, BOTTOM, [
        [0, hexA(K.teal, 0.55 * aq)],
        [1, hexA(K.waterDeep, 0.95 * aq)],
      ]);
      ctx.fillRect(0, AQUIFER, W, BOTTOM - AQUIFER);
      if (aq > 0.05) {
        ctx.save();
        ctx.globalAlpha = aq * 0.85;
        ctx.strokeStyle = 'rgba(200,240,245,0.55)';
        ctx.lineWidth = 3;
        for (let r2 = 0; r2 < 3; r2++) {
          ctx.beginPath();
          for (let x = 0; x <= W; x += 12) {
            const y = AQUIFER + 26 + r2 * 46 + Math.sin(x * 0.017 + t * 1.1 + r2) * 5;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
        txt(ctx, 'AIR TANAH DALAM', 96, AQUIFER + 54, {
          size: 26, font: F.mono6, color: hexA('#DCF2F5', 0.9 * aq), track: 5,
        });
      }
    });

    // the house, half cut: wall section + roof
    const hA = at(t, 0.15, 0.9);
    ctx.save();
    ctx.globalAlpha = hA;
    const hx = 880;
    const hw = 470;
    const roofY = 258;
    // wall block
    concrete(ctx, hx, roofY, hw, GROUND - roofY, { tone: '#BDB29A', seed: 8 });
    // roof
    ctx.fillStyle = linGrad(ctx, hx - 40, 0, hx + hw + 40, 0, [[0, '#7E5340'], [1, '#4E3126']]);
    ctx.beginPath();
    ctx.moveTo(hx - 46, roofY + 8);
    ctx.lineTo(hx + hw / 2, roofY - 130);
    ctx.lineTo(hx + hw + 46, roofY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(hx - 46, roofY + 4, hw + 92, 8);
    // interior slice: we see through the wall
    ctx.fillStyle = 'rgba(34,29,24,0.82)';
    ctx.fillRect(hx + 60, roofY + 120, hw - 120, GROUND - roofY - 130);
    // a lit window with a person's absence: warm light
    ctx.fillStyle = hexA('#FFC97A', 0.9);
    ctx.fillRect(hx + 120, roofY + 210, 130, 150);
    ctx.fillStyle = 'rgba(255,201,122,0.18)';
    ctx.fillRect(hx + 100, roofY + 190, 170, 190);
    // door
    ctx.fillStyle = 'rgba(20,17,14,0.9)';
    ctx.fillRect(hx + 300, GROUND - 330, 120, 330);
    ctx.restore();

    // the pump on the yard
    const pA = at(t, 5.2, 0.8);
    if (pA > 0.01) {
      pump(ctx, PIPE_X + 40, GROUND - 196, 0.92, { a: pA, on: t > 8.4 ? 1 : 0, t });
    }

    // the borehole: 200 m of casing, drawn as it is drilled
    const dA = at(t, 6.2, 2.2);
    if (dA > 0.01) {
      const y1 = GROUND + (BOTTOM - 20 - GROUND) * E.inOut(dA);
      borehole(ctx, PIPE_X, GROUND, y1, { a: 1, level: at(t, 8.6, 1.4), t });
      // drilling dust
      if (dA < 0.98) {
        ctx.save();
        ctx.globalAlpha = 0.5 * (1 - dA);
        ctx.fillStyle = 'rgba(210,190,150,0.7)';
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.arc(PIPE_X + Math.sin(t * 9 + i) * 26, y1 - i * 8, 5 - i * 0.4, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
      // depth bracket
      const bA = at(t, 8.8, 0.8);
      if (bA > 0.01) {
        bracket(ctx, PIPE_X - 120, GROUND + 8, BOTTOM - 30, {
          label: '200 M', color: hexA('#F6EFE0', 0.9), a: bA, side: -1,
        });
      }
    }

    kicker(ctx, 'PENYEBABNYA', { y: 250, a: at(t, 0.2, 0.8), ink: '#2A2320' });

    // the share of the cause
    const nA = at(t, 0.6, 0.9);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      txt(ctx, '80–90', 92, 520 + (1 - nA) * 26, {
        size: 168, font: F.num, color: K.rust, track: -7,
      });
      txt(ctx, '%', 92 + measure(ctx, '80–90', 168, F.num, -7) + 10, 520, {
        size: 84, font: F.num6, color: K.rust,
      });
      txt(ctx, 'PENYEBABNYA SATU:', 96, 576, {
        size: 24, font: F.mono6, color: 'rgba(28,22,18,0.66)', track: 4,
      });
      txt(ctx, 'AIR TANAH DISEDOT', 96, 612, {
        size: 24, font: F.mono6, color: 'rgba(28,22,18,0.66)', track: 4,
      });
      ctx.restore();
    }

    grain(ctx, 0.04);
  },
};
