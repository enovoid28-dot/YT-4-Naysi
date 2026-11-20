// h1 MAKAM GELAP — tomb slit light finds a sealed amphora; the 3.000-year
// number rises out of the dark while dust hangs in the shafts.
import { MD, tomb, shafts, dust, vign, hexGrid, pedestal, jar, heading,
  chip, cue, P, eo, keys, frameOn, label, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1120, 1.10], [2.6, 720, 1080, 1.04],
      [scene.dur - 3, 720, 1010, 1.0], [scene.dur, 720, 995, 1.02],
    ]);
    tomb(ctx, t);
    shafts(ctx, t, { n: 3, a: 0.085 });
    ctx.save();
    frameOn(ctx, cam);
    hexGrid(ctx, 60, 620, W - 120, 760, 128, { a: 0.05, fill: 0.10 * eo(P(t, 1.2, 4)), t, fillA: 0.8 });
    pedestal(ctx, W / 2, 1452, 470, 250);
    const glow = 0.55 + 0.35 * Math.sin(t * 1.15);
    jar(ctx, W / 2, 1250, 1.32, { seal: true, glow, level: 0.86 });
    // age ring ticks around the jar
    const q = eo(P(t, 0.8, 2.4));
    ctx.save();
    ctx.strokeStyle = `rgba(255,182,39,${0.5 * q})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 24; i++) {
      const an = (i / 24) * TAU - Math.PI / 2;
      const r0 = 430, r1 = i % 6 === 0 ? 470 : 452;
      ctx.globalAlpha = q * (i / 24 < q ? 1 : 0.15);
      ctx.beginPath();
      ctx.moveTo(W / 2 + Math.cos(an) * r0, 1250 + Math.sin(an) * r0);
      ctx.lineTo(W / 2 + Math.cos(an) * r1, 1250 + Math.sin(an) * r1);
      ctx.stroke();
    }
    ctx.restore();
    heading(ctx, '3.000', '', 120, 430, { amber: 'TAHUN', p: P(t, 0.5, 1.1), size: 150, sub: 'DISIMPAN DI MAKAM FIRAUN', p2: 1 });
    const tC = cue(scene, 'makam');
    if (t > tC + 1.5) chip(ctx, 'MESIR KUNO · SEGEL UTUH', W / 2, 1905, { p: P(t, tC + 1.5, 0.5) });
    ctx.restore();
    dust(ctx, t, 21, 34);
    vign(ctx, 0.52);
  },
};
