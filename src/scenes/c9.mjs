// s9 TERBESAR KETIGA — the magnitude league table draws itself, Sumatra's
// bar hot amber, a coda trace humming underneath.
import { GP, vign, motes, rankBars, seismo, chip, cue, P, keys, frameOn,
  label, clamp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1000, 1.02], [cue(scene, 'ketiga'), 720, 1000, 1.06],
      [scene.dur, 720, 1080, 1.16],
    ]);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#050d15'); g.addColorStop(1, '#0a2029');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    label(ctx, 'MAGNITUDO MOMEN · CATATAN SEISMOGRAF', 160, 480,
      { size: 30, color: 'rgba(243,239,228,0.6)', track: 5 });
    rankBars(ctx, 160, 620, W - 620, [
      { label: 'CHILE 1960', val: 9.5 },
      { label: 'ALASKA 1964', val: 9.2 },
      { label: 'SUMATERA 2004', val: 9.1, hot: true },
    ], P(t, 0.6, 6.4), { bh: 96, gap: 74 });
    seismo(ctx, 160, 1330, W - 320, 150, P(t, 0.4, scene.dur - 1), { burst: 0.12 });
    ctx.restore();
    const tK = cue(scene, 'ketiga');
    if (t > tK) chip(ctx, 'TERBESAR KETIGA PERNAH DICATAT', 120, 300, { a: P(t, tK, 0.6) });
    motes(ctx, t, 101, 18);
    vign(ctx, 0.5);
  },
};
