import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  D, ease, cue, room, cone, motes, bokeh, vignette, par, acUnit, iron, fridge,
} from './_daya.mjs';

// 07 — ARTINYA
// 65,8 kWh is abstract. An air conditioner running for 88 hours is not.

const ITEMS = [
  { at: 1, n: '88', unit: 'JAM', name: 'AC 1 PK · 750 W', tone: D.volt },
  { at: 2, n: '188', unit: 'JAM', name: 'SETRIKA · 350 W', tone: D.ember },
  { at: 3, n: '27', unit: 'HARI', name: 'KULKAS · 100 W', tone: D.mint },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.5, glowY: 380, glowA: 0.14, horizon: 1320 });
    cone(ctx, W * 0.5, 260, 1300, 520, { a: 0.06, t });
    motes(ctx, t, { n: 40, a: 0.36 });

    // the constant: what we are converting
    tracking(ctx, '65,8 kWh  =', W / 2, 352, {
      size: 22, font: F.mono6, track: 6, color: hexA(D.bone, 0.38), align: 'center',
    });

    // which item is on screen
    const idx = t >= c(3, 0.02) ? 2 : t >= c(2, 0.02) ? 1 : 0;
    const since = idx === 2 ? c(3, 0.02) : idx === 1 ? c(2, 0.02) : c(1, 0.02);
    const pop = ease.expo(clamp((t - since) / 0.55));

    const I = ITEMS[idx];
    // the number
    ctx.save();
    ctx.globalAlpha = clamp(pop * 1.6);
    txt(ctx, I.n, W / 2, 700, {
      size: 300 * (0.9 + 0.1 * pop), font: F.num, color: D.bone, align: 'center', track: -10,
    });
    tracking(ctx, I.unit, W / 2, 786, {
      size: 34, font: F.mono6, track: 8, color: hexA(I.tone, 0.85), align: 'center',
    });
    tracking(ctx, I.name, W / 2, 862, {
      size: 20, font: F.mono6, track: 4, color: hexA(D.bone, 0.42), align: 'center',
    });
    ctx.restore();

    // the object itself, on a floor line
    par(ctx, cam, 0.7, () => {
      const show = (i, fn) => {
        const s0 = c(ITEMS[i].at, 0.02);
        const e0 = i < ITEMS.length - 1 ? c(ITEMS[i + 1].at, 0.02) : Infinity;
        const pin = ease.expo(clamp((t - s0) / 0.55));
        const pout = i < ITEMS.length - 1 ? clamp((t - e0) / 0.30) : 0;
        const al = pin * (1 - pout);
        if (!(al > 0.01)) return;
        ctx.save();
        ctx.globalAlpha = al;
        ctx.translate(0, (1 - pin) * 34);
        fn(pin);
        ctx.restore();
      };
      show(0, (p) => acUnit(ctx, W / 2 - 350, 1000, 700, { p: p, t }));
      show(1, (p) => iron(ctx, W / 2 - 320, 1080, 640, { p, t }));
      show(2, () => fridge(ctx, W / 2 - 230, 960, 460, { p: 1 }));
    });

    // the floor and its reflection
    ctx.save();
    ctx.fillStyle = linGrad(ctx, 0, 1340, 0, 1520, [[0, 'rgba(168,196,220,0.10)'], [1, 'rgba(168,196,220,0)']]);
    ctx.fillRect(0, 1340, W, 180);
    ctx.restore();

    bokeh(ctx, cam, { n: 5, a: 0.09 });
    vignette(ctx, 0.5);
  },
};
