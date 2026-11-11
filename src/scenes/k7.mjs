import { W, H, txt, hexA, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, starfield, bhDisc, orbit, orbitPos } from './_space.mjs';
import { globe } from './_earth.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';

// 07 — BUKAN PENYEDOT. One shot, one camera: it drifts with the planet as the
// planet goes round. Nobody falls in. The orbit is the argument, and the camera
// makes it by following the world through a full loop.

const BX = 880;
const BY = 1040;
const RX = 520;
const RY = 296;
const ROT = -0.13;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    const g = linGrad(ctx, 0, -200, 0, H, [[0, '#04060D'], [0.5, '#060A13'], [1, '#03050A']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);
    starfield(ctx, { n: 230, seed: 419, t, a: 0.8, bottom: 1600 });

    // the planet's place on the ellipse, and the camera that follows it
    const ang = -2.35 + t * 0.44;
    const p = orbitPos(BX, BY, RX, RY, ang, ROT);
    const follow = 0.5;
    const dx = -(p.x - BX) * follow * 0.55;
    const dy = -(p.y - BY) * follow * 0.55;

    ctx.save();
    ctx.translate(dx, dy);

    layer(ctx, cam, 0.2, () => {
      orbit(ctx, BX, BY, RX, RY, { rot: ROT, color: 'rgba(140,180,240,0.20)', lw: 2, prog: at(t, 0.3, 1.6) });
      orbit(ctx, BX, BY, RX, RY, { rot: ROT, color: 'rgba(140,180,240,0.07)', lw: 12 });
    });

    // the hole: no light of its own, only the sky bending round it
    layer(ctx, cam, 0.3, () => {
      bhDisc(ctx, BX, BY, 30, { t, glow: 1, ring: 1, hot: 0 });
    });

    // the planet, going about its business
    layer(ctx, cam, 0.55, () => {
      const rr = 64;
      // a thin trail of where it has been, long exposure rather than comet
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 30; i++) {
        const a2 = ang - i * 0.022;
        const q = orbitPos(BX, BY, RX, RY, a2, ROT);
        ctx.globalAlpha = 0.16 * (1 - i / 31);
        ctx.fillStyle = 'rgba(170,210,255,0.8)';
        ctx.beginPath();
        ctx.arc(q.x, q.y, Math.max(0.6, 2.6 * (1 - i / 31)), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      globe(ctx, p.x, p.y, rr, {
        t,
        rot: 0.2 + t * 0.14,
        cloudRot: 0.24 + t * 0.19,
        sun: { x: -0.4, y: 0.86 },
        clouds: 0.55,
        lights: 0.95,
        night: 0.88,
        atmos: 0.8,
      });
    });

    ctx.restore();

    kicker(ctx, 'ORBIT YANG SAMA, TANPA PERUBAHAN', { x: 104, y: 250, color: '#8FB4E8', ink: hexA(S.bone, 0.86) });

    chip(ctx, '365 HARI  ·  TETAP', 104, 344, {
      a: at(t, 1.2, 0.7), bg: 'rgba(8,12,20,0.72)', ink: '#CFE0F6',
      border: 'rgba(150,190,240,0.35)', size: 26, track: 3,
    });

    // the distance held, read off the shot rather than a caption
    const la = at(t, 3.0, 1.0);
    if (la > 0.01) {
      ctx.save();
      ctx.globalAlpha = la * 0.35;
      ctx.strokeStyle = 'rgba(150,190,240,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 9]);
      const p2 = orbitPos(BX, BY, RX, RY, ang + 1.9, ROT);
      ctx.beginPath();
      ctx.moveTo(BX, BY);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }
  },
};
