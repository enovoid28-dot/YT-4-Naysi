import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, sky, stars, water, reflection, grain, chip } from './_kota.mjs';
import { P, riceSack } from './_padi.mjs';
import { ship } from './_garam.mjs';
import { person } from './_figure.mjs';

// 06 — KAPAL. A hull the length of the frame, sacks on the quay, three flags
// that are not ours. The point is not that it is foreign; it is that it is
// reliable, while a harvest is not.

const SEA = 1100;
const QUAY = 1258;
const FLAGS = [
  { t: 'THAILAND', x: 300 },
  { t: 'VIETNAM', x: 640 },
  { t: 'PAKISTAN', x: 980 },
];

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    sky(ctx, { top: '#080A0C', mid: '#12181A', low: '#3A3A30', horizon: SEA, sun: [660, SEA - 10, 300, '#D9A93F'], t });
    stars(ctx, { n: 38, seed: 33, t, bottom: 600, a: 0.26 });

    layer(ctx, cam, 0.3, () => {
      water(ctx, SEA, { t, h: H - SEA, depth: 1, color: '#15302C', calm: 0.85 });
      reflection(ctx, SEA, { t, h: 420, color: 'rgba(217,169,63,0.16)', alpha: 0.5, seed: 6 });
    });

    // the hull
    const shA = at(t, 0.3, 1.6);
    layer(ctx, cam, 0.45, () => {
      const sx = lerp(W + 700, 800, E.out(at(t, 0.3, 3.4)));
      ship(ctx, sx, SEA + 52, 1.24, { a: shA, t, tone: '#1A2A2A' });
    });

    // quay, sacks, and the men who move them
    const qA = at(t, 1.4, 0.8);
    if (qA > 0.01) {
      ctx.save();
      ctx.globalAlpha = qA;
      ctx.fillStyle = linGrad(ctx, 0, QUAY, 0, H, [[0, '#3B3025'], [1, '#171212']]);
      ctx.fillRect(-180, QUAY, W + 360, H);
      ctx.fillStyle = 'rgba(217,169,63,0.12)';
      ctx.fillRect(-180, QUAY, W + 360, 4);
      ctx.fillStyle = '#3A3128';
      ctx.fillRect(1280, QUAY - 74, 34, 74);
      ctx.restore();

      // a stack of sacks, three on the ground and two on top of them
      const rowsS = [[0, 3], [1, 2]];
      let n = 0;
      for (const [row, count] of rowsS) {
        for (let i = 0; i < count; i++) {
          const a2 = at(t, 1.7 + n * 0.22, 0.7);
          if (a2 <= 0.01) { n++; continue; }
          const x = 92 + i * 142 + row * 74;
          const y = QUAY - 168 - row * 150;
          riceSack(ctx, x, y + (1 - a2) * 60, 118, 148, { a: a2 * 0.98, tone: '#CBB188' });
          n++;
        }
      }

      // one man hauling a sack up the quay, one walking past him
      const wA = at(t, 2.2, 0.9);
      if (wA > 0.01) {
        person(ctx, 560, QUAY + 6, 330, {
          pose: 'carry', facing: 1, sack: wA, alpha: wA, cloth: '#C9C2AE', rim: 0.5,
        });
      }
      const wB = at(t, 2.8, 0.9);
      if (wB > 0.01) {
        person(ctx, 860, QUAY + 26, 292, {
          pose: 'walk', facing: -1, alpha: wB, cloth: '#B4AC96', rim: 0.4, hat: 0,
        });
      }
      const wC = at(t, 3.3, 0.9);
      if (wC > 0.01) {
        person(ctx, 1080, QUAY + 44, 236, {
          pose: 'stand', facing: -1, alpha: wC * 0.9, cloth: '#A9A28C', rim: 0.3, hat: 0,
        });
      }
    }

    // flags on the hull: where the rice comes from
    const fA = at(t, 3.6, 0.8);
    if (fA > 0.01) {
      FLAGS.forEach((f, i) => {
        const a = fA * (1 - clamp((i * 0.3 - (t - 3.6)) * 0)) * 1;
        chip(ctx, f.t, f.x, 300, {
          a: clamp(a) * (0.7 + 0.3 * Math.sin(t * 0.6 + i)),
          bg: 'rgba(12,14,12,0.86)', ink: P.bone, border: hexA(P.gold, 0.45),
        });
      });
    }

    // the reliability ledger
    const pA = at(t, 6.4, 1.0);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      const px = 96;
      const py = 1436;
      fillRR(ctx, px, py, 700, 240, 6, 'rgba(10,8,6,0.9)');
      ctx.fillStyle = hexA(P.gold, 0.9);
      ctx.fillRect(px + 30, py + 34, 42, 4);
      txt(ctx, 'YANG DIBELI BUKAN CUACA', px + 86, py + 42, { size: 21, font: F.mono6, color: 'rgba(251,246,234,0.7)', track: 4 });
      txt(ctx, 'kepastian', px + 30, py + 130, { size: 54, font: F.num, color: P.bone });
      txt(ctx, 'pasokan yang tidak bergantung musim', px + 32, py + 180, { size: 25, font: F.body, color: 'rgba(251,246,234,0.55)' });
      ctx.restore();
    }

    grain(ctx, 0.05);
  },
};
