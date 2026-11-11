import { W, H, txt, hexA, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, photosphere, bhDisc, starfield } from './_space.mjs';
import { at, layer, kicker } from './_kota.mjs';

// 03 — MASSA YANG SAMA. The same mass, two sizes. No side-by-side figure: the
// camera looks at the photosphere, and a three-kilometre hole crosses in front
// of it. The lensing does the explaining — that is all the difference there is.

const SUNX = 720;
const SUNY = 1620;
const SUNR = 1260;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    ctx.fillStyle = '#04060C';
    ctx.fillRect(-240, -240, W + 480, H + 480);
    starfield(ctx, { n: 90, seed: 23, t, a: 0.35, bottom: 900 });

    const k = EASE.inOutQuad(clamp(t / Math.max(1, scene.dur)));
    const r = lerp(SUNR, SUNR * 1.09, k);
    const cy = SUNY + r - SUNR;

    layer(ctx, cam, 0.18, () => {
      photosphere(ctx, SUNX, cy, r, { t, tone: 1 });
    });

    // the hole, crossing the disc: same mass, six kilometres wide
    const bx = lerp(1120, 452, EASE.inOutQuad(clamp((t - 1.0) / (scene.dur - 2.6))));
    const by = lerp(452, 604, k) + Math.sin(t * 0.4) * 6;
    const br = 11;

    layer(ctx, cam, 0.34, () => {
      // the sky behind it is dragged into a ring
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) {
        const q = i / 14;
        const rr = br * (1.28 + q * 0.55);
        ctx.globalAlpha = 0.13 * (1 - q * 0.8) * (0.55 + 0.45 * Math.sin(t * 1.3 + i * 1.7));
        ctx.strokeStyle = i < 3 ? '#FFF3DC' : '#FFD3A4';
        ctx.lineWidth = br * (0.22 - q * 0.13);
        ctx.beginPath();
        ctx.arc(bx, by, rr, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      bhDisc(ctx, bx, by, br, { t, glow: 1, ring: 1, hot: 0 });
    });

    // the frame falls off toward the bottom, the way a long lens would
    ctx.save();
    const vg = linGrad(ctx, 0, 1120, 0, 1980, [
      [0, 'rgba(3,4,8,0)'],
      [0.55, 'rgba(3,4,8,0.62)'],
      [1, 'rgba(3,4,8,0.94)'],
    ]);
    ctx.fillStyle = vg;
    ctx.fillRect(-200, 1120, W + 400, H - 1000);
    ctx.restore();

    // the scale, spoken by the camera rather than a caption: the disc's own
    // granulation is a kilometre across, and the hole is the size of a town
    kicker(ctx, 'MASSA SAMA, UKURANNYA TIDAK', { x: 104, y: 250, color: '#FFB86B', ink: hexA(S.bone, 0.9) });

  },
};
