// s1 SEPULUH MENIT — dawn over the limb of the Earth, the trace grows,
// a ten-minute dial fills while the ground will not stop.
import { GP, space, vign, motes, seismo, clockDial, quakeRings, earthStill,
  cue, P, eo, keys, frameOn, label, clamp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1060, 1.06], [2.4, 720, 1050, 1.0],
      [scene.dur - 3, 720, 990, 1.1], [scene.dur, 720, 980, 1.12],
    ]);
    space(ctx, t);
    ctx.save();
    frameOn(ctx, cam);
    const eb = earthStill('g32-limb', W / 2, H + 700, 1180, { clouds: 0.75, night: 0.55, atmos: 1 });
    ctx.drawImage(eb.img, eb.x, eb.y);
    label(ctx, '26 DES 2004 · 07:58 WIB · LEPAS PANTAI ACEH', 120, 330,
      { size: 30, color: 'rgba(243,239,228,0.62)', track: 5 });
    seismo(ctx, 140, 1120, W - 280, 430, P(t, 0.5, 7), { burst: 0.16 });
    label(ctx, 'SEISMOGRAM · STASIUN GLOBAL', 140, 1420,
      { size: 26, color: 'rgba(243,239,228,0.45)', track: 4 });
    // the ten-minute dial
    const min = clamp(t / scene.dur) * 10;
    clockDial(ctx, W - 300, 560, 165, 1, { hand: min / 60, wedge: 0 });
    label(ctx, `${Math.max(1, Math.ceil(min))} MENIT`, W - 300, 800,
      { size: 44, color: GP.amber, track: 4, align: 'center' });
    const tM = cue(scene, 'menit');
    if (t > tM) quakeRings(ctx, W - 300, 560, tM, t - tM, 2, GP.amber);
    const tB = cue(scene, 'berputar');
    if (t > tB) {
      const q = P(t, tB, 2.2);
      ctx.save();
      ctx.strokeStyle = GP.amber;
      ctx.globalAlpha = 0.8 * q;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(W / 2, H + 700, 1250, -Math.PI * 0.82, -Math.PI * 0.82 + 0.5 * q);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    motes(ctx, t, 21, 26);
    vign(ctx, 0.5);
  },
};
