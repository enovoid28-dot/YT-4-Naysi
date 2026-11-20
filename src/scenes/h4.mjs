// h4 PERTAHANAN AIR — the first defense: 17% moisture. A glass panel chart
// pits honey against ordinary food while a honeycomb floods amber.
import { camPar, grain, odo,MD, tomb, dust, vign, hexGrid, glassPanel, bars, heading, chip, label,
  cue, P, eo, keys, frameOn, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1120, 1.06], [2.5, 720, 1090, 1.0], [scene.dur, 720, 1050, 1.05],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    tomb(ctx, t, { hex: 0 });
    ctx.restore();
    ctx.save();
    frameOn(ctx, cam);
    hexGrid(ctx, 760, 560, 640, 1080, 96, { a: 0.07, fill: 0.55 * eo(P(t, 1.0, 3.4)), t });
    glassPanel(ctx, 110, 620, 900, 980, { p: eo(P(t, 0.4, 0.8)) });
    label(ctx, 'KANDUNGAN AIR', 170, 706, { size: 30, color: MD.amber, track: 5 });
    label(ctx, 'PERSEN BERAT', 170, 748, { size: 24, color: 'rgba(243,239,228,0.45)', track: 4 });
    bars(ctx, 200, 800, 720, 620, [
      { v: 0.17, txt: '17%', count: 17, suffix: '%', label: 'MADU' },
      { v: 0.8, txt: '70–90%', label: 'BUAH & SUSU', c0: '#BFE8DE', c1: '#2E7A6C' },
    ], P(t, 1.1, 2.6), { grid: true, stag: 0.22 });
    const tC = cue(scene, 'tujuh');
    if (t > tC - 0.4) chip(ctx, 'RAHASIA 01 · AIR', 560, 560, { p: P(t, tC - 0.4, 0.5) });
    heading(ctx, 'HAMPIR', '', 120, 400, { amber: 'TANPA AIR', p: P(t, 0.35, 1.0), size: 110, sub: 'SELEBIHNYA GULA LEWAT JENUH' });
    ctx.restore();
    ctx.save();
    frameOn(ctx, cam);
    dust(ctx, t, 23, 26);
    ctx.restore();
    vign(ctx, 0.5);
    grain(ctx, t, 0.05);
  },
};
