import { W, H, txt, hexA, linGrad, radGrad, fillRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, starfield, sunDisc, bhDisc, leader } from './_space.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';

// 01 — BUKAN PADAM. A star, measured, then gone. The collapse is the only
// dramatic event in the whole film; everything after it is arithmetic.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    ctx.save();
    const g = linGrad(ctx, 0, -200, 0, H, [[0, '#04060C'], [0.55, '#070B14'], [1, '#03040A']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);
    ctx.restore();

    starfield(ctx, { n: 250, seed: 17, t, band: 0.55, bandY: 700, bandH: 620, a: 0.9 });

    const collapse = t < 3.5 ? 0 : EASE.inOutQuad(clamp((t - 3.5) / 1.7));
    const r = lerp(322, 27, collapse);
    const cx = 720;
    const cy = lerp(880, 905, collapse);

    layer(ctx, cam, 0.25, () => {
      sunDisc(ctx, cx, cy, Math.max(r, 20), { t, rays: 1 - collapse * 0.9, a: 1 });
      if (collapse > 0.02) {
        bhDisc(ctx, cx, cy, Math.max(18, r * 1.02), { t, a: collapse, glow: 1, ring: 1 });
      }
    });

    // the frame loses its light with the star
    ctx.save();
    ctx.globalAlpha = collapse * 0.42;
    ctx.fillStyle = '#010206';
    ctx.fillRect(-240, -240, W + 480, H + 480);
    ctx.restore();

    // measurement of the thing that is about to vanish
    const mA = 1 - at(t, 3.2, 0.5);
    if (mA > 0.01) {
      ctx.save();
      ctx.globalAlpha = mA * 0.5;
      ctx.strokeStyle = '#FFD9A0';
      ctx.lineWidth = 1.5;
      const y = cy - 322 - 44;
      ctx.beginPath();
      ctx.moveTo(cx - 322, y);
      ctx.lineTo(cx + 322, y);
      for (const dx of [-322, 322]) {
        ctx.moveTo(cx + dx, y - 12);
        ctx.lineTo(cx + dx, y + 12);
      }
      ctx.stroke();
      txt(ctx, '1.392.700 KM', cx, y - 26, { size: 26, font: F.mono6, color: '#FFD9A0', track: 5, align: 'center', alpha: 0.85 });
      ctx.restore();
    }

    // kicker: the name changes when the object does
    const swap = at(t, 4.6, 0.7);
    kicker(ctx, 'MATAHARI', { x: 104, y: 250, color: S.amber, ink: hexA(S.bone, 0.9), a: 1 - swap });
    kicker(ctx, 'LUBANG HITAM · 1 MASSA MATAHARI', { x: 104, y: 250, color: '#8FB4E8', ink: hexA(S.bone, 0.9), a: swap });

    chip(ctx, 'MATAHARI BERHENTI BERSINAR', 104, 1462, {
      a: at(t, 5.0, 0.6) * 0.95, bg: 'rgba(6,9,16,0.72)', ink: hexA(S.bone, 0.86),
      border: 'rgba(160,190,240,0.28)', size: 24, track: 3,
    });
  },
};
