// s7 POROS 2,5 CM — polar grid, old cross to new cross toward 145 deg E,
// honestly labelled as exaggerated.
import { GP, space, vign, motes, poleGrid, chip, cue, P, keys, frameOn,
  label, clamp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const tB = cue(scene, 'bergeser', 0, 0) || cue(scene, 'poros');
    const cam = keys(t, [[0, 720, 1000, 1.0], [scene.dur, 740, 970, 1.1]]);
    space(ctx, t, 13);
    ctx.save();
    frameOn(ctx, cam);
    poleGrid(ctx, W / 2, 980, 470, P(t, tB + 0.4, 2.6), { ex: 168, ey: 96 });
    label(ctx, 'POROS LAMA', W / 2 - 40, 980 - 40,
      { size: 28, color: 'rgba(243,239,228,0.7)', track: 4, align: 'right' });
    const q = P(t, tB + 0.4, 2.6);
    if (q > 0.5) {
      label(ctx, 'POROS BARU', W / 2 + 210, 1120, { size: 28, color: GP.amber, track: 4 });
      label(ctx, 'ARAH 145° BT', W / 2 + 210, 1168, { size: 26, color: 'rgba(255,188,66,0.8)', track: 4 });
    }
    ctx.restore();
    if (t > tB) chip(ctx, 'POROS BERGESER ±2,5 CM', 120, 420, { a: P(t, tB + 0.2, 0.6) });
    label(ctx, 'SKALA SUDUT DIGAMBAR BERLEBIH', 120, 2160,
      { size: 24, color: 'rgba(243,239,228,0.4)', track: 4 });
    motes(ctx, t, 81, 18);
    vign(ctx, 0.5);
  },
};
