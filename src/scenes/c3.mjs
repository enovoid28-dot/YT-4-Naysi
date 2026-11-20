// s3 ROBEKAN 1.300 KM — the trench unzips northward with a glowing front,
// a kilometre counter racing beside it.
import { GP, vign, motes, mapBase, rupture, epicStar, chip, cue, P, eo, keys,
  frameOn, label, clamp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const p = P(t, 0.7, 8.2);
    const cam = keys(t, [
      [0, 720, 1240, 1.12], [2, 720, 1220, 1.08],
      [4 + 8 * p, 720, 1220 - 520 * p, 1.08 + 0.1 * p], [scene.dur, 720, 660, 1.18],
    ]);
    ctx.fillStyle = GP.deep; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    mapBase(ctx, 100, 220, W - 200, 1620);
    const [ex, ey] = [100 + 0.60 * (W - 200), 220 + 0.60 * 1620];
    epicStar(ctx, ex, ey, 26, P(t, 0.3, 0.6));
    label(ctx, 'ACEH', 100 + 0.86 * (W - 200), 220 + 0.42 * 1620,
      { size: 34, color: 'rgba(243,239,228,0.8)', track: 5 });
    if (p > 0.82) {
      label(ctx, 'KEP. ANDAMAN', 100 + 0.70 * (W - 200), 220 + 0.17 * 1620,
        { size: 34, color: 'rgba(243,239,228,0.8)', track: 5 });
    }
    rupture(ctx, p, 100, 220, W - 200, 1620, { ringT: (t - 0.7) % 1.4 });
    ctx.restore();
    label(ctx, `${Math.round(1300 * p)} KM`, 130, 430,
      { size: 130, color: GP.amber, track: 2 });
    label(ctx, 'PANJANG ROBEKAN PATAHAN', 134, 490,
      { size: 28, color: 'rgba(243,239,228,0.55)', track: 4 });
    if (p > 0.12) chip(ctx, 'MERAYAP 2–3 KM/DETIK', 120, 610, { a: P(t, 1.4, 0.5) });
    motes(ctx, t, 41, 26, '140,220,230');
    vign(ctx, 0.48);
  },
};
