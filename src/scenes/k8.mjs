import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip } from './_kota.mjs';
import { P, sawah, clump, stalk, blades } from './_padi.mjs';
import { person } from './_figure.mjs';

// 08 — BUKAN ANGKA. Back to the water, back to the morning, back to the only
// thing that has ever produced a harvest: a person standing in mud, planting.

const HZ = 900;
const GROUND = 1460;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    // dawn again, warmer than shot one
    ctx.save();
    const g = linGrad(ctx, 0, -140, 0, HZ + 24, [[0, '#26383A'], [0.45, '#586A62'], [0.76, '#B49A70'], [1, '#E8C48A']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, HZ + 260);
    ctx.restore();

    const sA = at(t, 0.2, 2.0);
    ctx.save();
    ctx.globalAlpha = sA;
    const sg = radGrad(ctx, 760, HZ - 20, 10, 700, [[0, 'rgba(255,226,168,0.6)'], [0.3, 'rgba(255,206,140,0.18)'], [1, 'rgba(255,206,140,0)']]);
    ctx.fillStyle = sg;
    ctx.fillRect(0, -200, W, 1200);
    ctx.restore();

    // water mirror in the near plots
    layer(ctx, cam, 0.14, () => {
      sawah(ctx, { y0: HZ + 4, y1: 1900, rows: 12, cols: 10, seed: 55, t, mature: 0.12, water: 1, bund: 0.05 });
    });

    // the man, planting: bent forward, hands in the water
    const mA = at(t, 0.6, 1.0);
    if (mA > 0.01) {
      ctx.save();
      ctx.globalAlpha = mA;
      // his reflection in the flooded plot
      ctx.fillStyle = 'rgba(24,30,22,0.22)';
      ctx.beginPath();
      ctx.ellipse(1130, GROUND + 22, 150, 24, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      person(ctx, 1120, GROUND, 430, { pose: 'plant', facing: 1, alpha: mA, cloth: '#D8CFB4', rim: 0.85, hat: 1, seedlings: 1 });
    }

    // a line of seedlings half planted behind him
    const rA = at(t, 1.4, 1.0);
    if (rA > 0.01) {
      const r = rng(12);
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 22; i++) {
          const x = 90 + i * 60 + row * 18 + (r() - 0.5) * 16;
          const y = GROUND - 90 + row * 46;
          const hh = (54 - row * 8) * (0.8 + r() * 0.5);
          stalk(ctx, x, y, hh, { lean: 0.08, mature: 0, a: rA * (0.85 - row * 0.12), tone: row ? '#6E9A50' : '#86B061' });
        }
      }
    }

    // foreground clumps, warm
    layer(ctx, cam, 0.48, () => {
      const a = at(t, 0.3, 1.2);
      for (let i = 0; i < 10; i++) {
        blades(ctx, -20 + i * 44, H + 30, 620 + (i % 3) * 80, { n: 5, a: a * 0.16, seed: 60 + i, t, tone: '#2A4228', spread: 1.2, lean: -0.1 });
        blades(ctx, W + 20 - i * 46, H + 40, 660 + (i % 4) * 70, { n: 5, a: a * 0.15, seed: 80 + i, t, tone: '#274026', spread: 1.2, lean: 0.1 });
      }
    });

    // the closing line, set as type, not as a chip
    const cA = at(t, 4.6, 1.1);
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      fillRR(ctx, 72, 1080, 860, 300, 6, 'rgba(14,18,14,0.86)');
      ctx.fillStyle = hexA(P.gold, 0.95);
      ctx.fillRect(104, 1116, 46, 4);
      txt(ctx, 'SWASEMBADA', 104, 1250, { size: 76, font: F.num, color: P.bone, track: -2 });
      txt(ctx, 'bukan angka satu tahun', 108, 1310, {
        size: 34, font: F.body, color: 'rgba(251,246,234,0.72)',
      });
      ctx.restore();
    }

    const eA = at(t, 6.4, 1.0);
    if (eA > 0.01) chip(ctx, 'LAHAN · AIR · ORANG', 72, 1420, { a: eA, bg: 'rgba(14,18,14,0.84)', ink: P.bone, border: hexA(P.gold, 0.5) });

    grain(ctx, 0.04);
  },
};
