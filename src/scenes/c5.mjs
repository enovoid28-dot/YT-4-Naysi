// s5 TSUNAMI — cross-section: the floor lifts, the water column bulges,
// the bulge splits into two running waves; run-up and travel-time chips.
import { GP, vign, motes, seaSection, chip, cue, P, keys, frameOn, label,
  clamp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const tK = cue(scene, 'kolom');
    const tT = cue(scene, 'tsunami');
    const cam = keys(t, [
      [0, 720, 1000, 1.04], [tT, 720, 1000, 1.04],
      [scene.dur - 2, 830, 980, 1.14], [scene.dur, 850, 980, 1.16],
    ]);
    ctx.fillStyle = '#07141d'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    seaSection(ctx, 90, 420, W - 180, 1180, {
      up: P(t, tK, 1.8), bulge: P(t, tK + 0.5, 2.2), t, wave: P(t, tT, 6.5),
    });
    label(ctx, 'KOLOM AIR TERANGKAT SELURUH', 90, 380,
      { size: 30, color: 'rgba(243,239,228,0.6)', track: 4, a: P(t, tK, 0.6) });
    // run-up scale
    const rx = W - 260;
    ctx.strokeStyle = 'rgba(243,239,228,0.6)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(rx, 1660); ctx.lineTo(rx, 1660 - 420); ctx.stroke();
    for (let m = 0; m <= 30; m += 10) {
      const y = 1660 - (m / 30) * 420;
      ctx.beginPath(); ctx.moveTo(rx - 14, y); ctx.lineTo(rx, y); ctx.stroke();
      label(ctx, `${m} M`, rx - 26, y + 10, { size: 24, color: 'rgba(243,239,228,0.6)', track: 2, align: 'right' });
    }
    ctx.restore();
    if (t > tT) chip(ctx, 'RUN-UP ±30 M DI ACEH', 120, 300, { a: P(t, tT + 0.6, 0.6) });
    const t7 = cue(scene, 'tujuh');
    if (t > t7) chip(ctx, 'MENYEBERANG SAMUDRA SAMPAI 7 JAM', 120, 392, { a: P(t, t7, 0.6) });
    motes(ctx, t, 61, 24, '140,220,230');
    vign(ctx, 0.5);
  },
};
