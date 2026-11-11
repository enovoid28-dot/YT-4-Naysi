import { W, H, txt, hexA, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, starfield } from './_space.mjs';
import { globe } from './_earth.mjs';
import { at, layer, kicker } from './_kota.mjs';

// 05 — DINGIN. No chart: the planet itself does the talking. The camera hangs a
// little above the equator while the ice line walks down from the poles, the
// clouds thin out, and the last daylight leaves the rim.

const CX = 720;
const CY = 1210;
const R0 = 372;
const R1 = 486;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    const g = linGrad(ctx, 0, -200, 0, H, [[0, '#03050C'], [0.45, '#05080F'], [1, '#02040A']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);
    starfield(ctx, { n: 210, seed: 307, t, a: 0.7, bottom: 1500 });

    const k = EASE.inOutQuad(clamp(t / Math.max(1, scene.dur)));
    const r = lerp(R0, R1, k);
    const ice = EASE.outQuad(clamp((t - 1.2) / 7.5));
    const night = lerp(0.18, 0.94, EASE.inOutQuad(clamp(t / (scene.dur * 0.85))));
    const sunAng = lerp(-2.2, -2.72, k);

    layer(ctx, cam, 0.35, () => {
      globe(ctx, CX, CY - k * 130, r, {
        t,
        rot: 0.62 + t * 0.012,
        cloudRot: 0.66 + t * 0.016,
        sun: { x: Math.cos(sunAng), y: Math.sin(sunAng) },
        clouds: 0.62 - ice * 0.28,
        lights: 0.25 + night * 0.75,
        ice: ice * 0.85,
        night,
        atmos: 1,
      });
    });

    // the cold that arrives before the ice does
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const cold = radGrad(ctx, CX, CY - 120, R0 * 0.9, R0 * 1.9, [
      [0, `rgba(88,130,190,${0.05 + night * 0.05})`],
      [1, 'rgba(60,100,160,0)'],
    ]);
    ctx.fillStyle = cold;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    kicker(ctx, 'TANPA CAHAYA, TIDAK ADA YANG HANGAT', { x: 104, y: 250, color: '#8FB4E8', ink: hexA(S.bone, 0.86) });

    // one number, stamped where the ice has got to
    const fa = at(t, 5.2, 0.8);
    if (fa > 0.01) {
      ctx.save();
      ctx.globalAlpha = fa;
      txt(ctx, '0 °C', 104, 1490, { size: 92, font: F.num, color: S.bone, track: -2 });
      txt(ctx, 'AIR MEMBEKU · MINGGU PERTAMA', 110, 1546, { size: 24, font: F.mono6, color: hexA(S.bone, 0.62), track: 5 });
      ctx.restore();
    }
    const fb = at(t, 7.6, 0.9);
    if (fb > 0.01) {
      ctx.save();
      ctx.globalAlpha = fb;
      txt(ctx, '−20 °C', 104, 1660, { size: 92, font: F.num, color: '#9EC4E8', track: -2 });
      txt(ctx, 'SETAHUN KEMUDIAN', 110, 1716, { size: 24, font: F.mono6, color: hexA(S.bone, 0.55), track: 5 });
      ctx.restore();
    }
  },
};
