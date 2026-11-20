// h13 KOMENTAR — outro: the question hangs in the tomb light, a small jar
// glows under it, subscribe chip closes the episode.
import { camPar, grain, MD, tomb, shafts, dust, vign, hexGrid, jar, heading, chip, label, sparkle,
  cue, P, eo, keys, frameOn, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1080, 1.05], [scene.dur, 720, 1040, 1.0],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    tomb(ctx, t, { hex: 0 });
        shafts(ctx, t, { n: 3, a: 0.09 });
ctx.restore();
    ctx.save();
    frameOn(ctx, cam);
    hexGrid(ctx, 100, 1150, W - 200, 900, 110, { a: 0.05, fill: 0.3 + 0.2 * Math.sin(t * 0.8), t });
    jar(ctx, W / 2, 1420, 0.95, { seal: true, glow: 0.6 + 0.3 * Math.sin(t * 1.4) });
    heading(ctx, 'MAKANAN APA', '', 120, 430, { amber: 'LAGI?', p: P(t, 0.3, 1.0), size: 116, sub: 'YANG BISA BERTAHAN RIBUAN TAHUN?' });
    const tC = cue(scene, 'komentar');
    chip(ctx, 'TULIS DI KOMENTAR', W / 2, 860, { p: P(t, Math.max(1.2, tC), 0.6) });
    chip(ctx, 'SUBSCRIBE · NAYSI', W / 2, 950, { p: P(t, Math.max(2.0, tC + 1.4), 0.6), col: 'rgba(243,239,228,0.6)', text: MD.bone });
    for (let i = 0; i < 4; i++) {
      sparkle(ctx, 240 + i * 320, 1180 + (i % 2) * 80, 12, 0.3 + 0.3 * Math.sin(t * 2.4 + i * 1.7), i);
    }
    ctx.restore();
    ctx.save();
    frameOn(ctx, cam);
    dust(ctx, t, 61, 32);
    ctx.restore();
    vign(ctx, 0.52);
    grain(ctx, t, 0.05);
  },
};
