// h2 TUTANKHAMUN 1922 — torchlight sweeps a tomb wall of glyphs and finds a
// row of sealed jars still standing where they were left.
import { MD, tomb, shafts, dust, vign, jar, glyphRow, heading, chip, leader,
  cue, P, eo, keys, frameOn, label, clamp, lerp, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 700, 1080, 1.06], [3, 720, 1060, 1.0],
      [scene.dur - 3, 760, 1030, 1.06], [scene.dur, 770, 1020, 1.08],
    ]);
    tomb(ctx, t, { hex: 0.03 });
    ctx.save();
    frameOn(ctx, cam);
    // stone courses
    ctx.strokeStyle = 'rgba(255,196,110,0.10)';
    ctx.lineWidth = 2;
    for (let y = 560; y < 1700; y += 92) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(W - 60, y);
      ctx.stroke();
      for (let x = 60 + ((y / 92) % 2) * 120; x < W - 60; x += 240) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 92);
        ctx.stroke();
      }
    }
    glyphRow(ctx, 140, 640, W - 280, 12, 5, { col: 'rgba(255,196,110,0.34)', s: 1.15 });
    glyphRow(ctx, 140, 1620, W - 280, 12, 8, { col: 'rgba(255,196,110,0.22)', s: 1.0 });
    // torch sweep
    const sx = lerp(-300, W + 300, clamp(t / (scene.dur - 1.5)));
    const g = ctx.createRadialGradient(sx, 1150, 40, sx, 1150, 760);
    g.addColorStop(0, 'rgba(255,176,64,0.30)');
    g.addColorStop(1, 'rgba(255,176,64,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 400, W, 1400);
    // jar row, lit as the sweep passes
    const xs = [400, 720, 1040];
    xs.forEach((x, i) => {
      const lit = clamp(1 - Math.abs(sx - x) / 620);
      const p = eo(P(t, 0.7 + i * 0.45, 0.9));
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.65 * lit;
      jar(ctx, x, 1290 - (i === 1 ? 40 : 0), i === 1 ? 1.0 : 0.8, { seal: true, glow: lit * 0.8 });
      ctx.restore();
      void p;
    });
    leader(ctx, 720, 1120, 980, 900, { col: 'rgba(245,208,140,0.6)' });
    chip(ctx, 'MADU · TETAP UTUH', 1120, 868, { p: P(t, cue(scene, 'stoples'), 0.5), col: 'rgba(255,182,39,0.9)' });
    heading(ctx, 'TUTANKHAMUN', '', 120, 400, { p: P(t, 0.4, 1.0), size: 96, sub: '1922 · MAKAM DIBUKA', subCol: 'rgba(243,239,228,0.75)' });
    ctx.restore();
    dust(ctx, t, 13, 30);
    vign(ctx, 0.5);
  },
};
