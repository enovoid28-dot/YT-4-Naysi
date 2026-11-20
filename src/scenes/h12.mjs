// h12 TANPA KEDALUWARSA — recap: the sealed amphora at center, three defense
// chips orbit on leader lines, the honeycomb floods fully amber.
import { MD, tomb, shafts, dust, vign, hexGrid, pedestal, jar, heading, chip, leader, sparkle,
  cue, P, eo, keys, frameOn, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1140, 1.08], [3, 720, 1100, 1.02], [scene.dur, 720, 1060, 1.0],
    ]);
    tomb(ctx, t, { hex: 0 });
    shafts(ctx, t, { n: 3, a: 0.07 });
    ctx.save();
    frameOn(ctx, cam);
    hexGrid(ctx, 40, 560, W - 80, 1240, 120, { a: 0.06, fill: 0.55 * eo(P(t, 1.0, 4.0)), t, fillA: 0.6 });
    pedestal(ctx, W / 2, 1448, 430, 240);
    jar(ctx, W / 2, 1260, 1.2, { seal: true, glow: 0.7 + 0.25 * Math.sin(t * 1.3) });
    const defs = [
      ['AIR 17%', 250, 800, 430, 1010],
      ['pH 3–4,5', W - 250, 880, W - 430, 1080],
      ['ENZIM LEBAH', 260, 1330, 470, 1290],
    ];
    defs.forEach(([s, cx2, cy2, lx, ly], i) => {
      const q = eo(P(t, 1.4 + i * 0.8, 0.6));
      if (q <= 0) return;
      leader(ctx, lx, ly, cx2, cy2 + 40, { col: 'rgba(255,182,39,0.55)' });
      chip(ctx, s, cx2, cy2, { p: q });
    });
    for (let i = 0; i < 6; i++) {
      const an = t * 0.25 + (i / 6) * TAU;
      sparkle(ctx, W / 2 + Math.cos(an) * 400, 1240 + Math.sin(an) * 330,
        10 + (i % 3) * 5, 0.3 + 0.3 * Math.sin(t * 2 + i), an);
    }
    heading(ctx, 'TANPA', '', 120, 400, { amber: 'KEDALUWARSA', p: P(t, 0.35, 1.0), size: 110, sub: 'SELAMA SEGELNYA UTUH' });
    ctx.restore();
    dust(ctx, t, 59, 30);
    vign(ctx, 0.5);
  },
};
