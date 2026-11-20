// h3 SAMPEL TERTUA — a year ruler stretches back: 3.000 (Egypt) then 5.500
// (Georgian pottery), the oldest honey ever found.
import { MD, tomb, shafts, dust, vign, yearRuler, jar, heading, chip,
  cue, P, eo, keys, frameOn, label, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1150, 1.05], [scene.dur - 4, 720, 1080, 1.0], [scene.dur, 720, 1060, 1.03],
    ]);
    tomb(ctx, t, { hex: 0.04 });
    shafts(ctx, t, { n: 2, a: 0.06, x: 320, gap: 560 });
    ctx.save();
    frameOn(ctx, cam);
    const p = eo(P(t, 0.6, 3.2));
    yearRuler(ctx, 150, W - 150, 1420, 6000, p, [
      { year: 3000, txt: '3.000', label: 'MESIR · MAKAM' },
      { year: 5500, txt: '5.500', label: 'GEORGIA · TEMBIKAR', col: MD.gold },
    ], );
    // pottery vessel over the 5.500 mark
    const q = eo(P(t, 3.6, 1.2));
    if (q > 0) {
      ctx.save();
      ctx.globalAlpha = q;
      jar(ctx, 150 + (5500 / 6000) * (W - 300), 900, 0.62 * q, { seal: false, glow: 0.5, level: 0.7 });
      ctx.restore();
    }
    label(ctx, 'UMUR SAMPEL MADU · TAHUN SEBELUM KINI', 150, 1560,
      { size: 26, color: 'rgba(243,239,228,0.5)', track: 4 });
    heading(ctx, '5.500', '', 120, 430, { amber: 'TAHUN', p: P(t, 0.4, 1.0), size: 150, sub: 'SAMPEL MADU TERTUA PERNAH DITEMUKAN' });
    const tC = cue(scene, 'tembikar');
    if (t > tC - 0.6) chip(ctx, 'BEJANA TEMBIKAR · GEORGIA', W - 430, 700, { p: P(t, tC - 0.6, 0.5) });
    ctx.restore();
    dust(ctx, t, 17, 26);
    vign(ctx, 0.5);
  },
};
