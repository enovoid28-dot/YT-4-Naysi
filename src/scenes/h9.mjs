// h9 KRISTAL BUKAN BASI — a glass jar clouds with crystal flecks; a warm
// bath below melts them back to clear honey while sparkles fade.
import { camPar, grain, caustics,MD, tomb, dust, vign, jar, steam, heading, chip, label, sparkle, rng,
  cue, P, eo, keys, frameOn, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1080, 1.06], [scene.dur - 3.5, 720, 1050, 1.0], [scene.dur, 720, 1030, 1.04],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    tomb(ctx, t, { hex: 0.03 });
    ctx.restore();
    ctx.save();
    frameOn(ctx, cam);
    const cx = W / 2, cy = 1080;
    jar(ctx, cx, cy, 1.24, { kind: 'glass', seal: true, glow: 0.35, level: 0.8 });
    // crystal flecks inside the jar, melting away with p
    const melt = eo(P(t, cue(scene, 'hangat') || 4.2, 3.0));
    const rd = rng(12);
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - 104, cy - 130, 208, 290);
    ctx.clip();
    for (let i = 0; i < 46; i++) {
      const px = cx - 96 + rd() * 192;
      const py = cy - 20 + rd() * 170;
      const s = 4 + rd() * 9;
      const a = (1 - melt) * (0.35 + 0.4 * rd());
      if (a <= 0.02) continue;
      ctx.fillStyle = `rgba(255,238,190,${a})`;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rd() * TAU);
      ctx.fillRect(-s / 2, -s / 2, s, s * 0.7);
      ctx.restore();
    }
    ctx.restore();
    for (let i = 0; i < 5; i++) {
      const sx = cx - 90 + i * 46, sy = cy - 40 + (i % 3) * 60;
      sparkle(ctx, sx, sy, 10 + (i % 2) * 6, (1 - melt) * (0.4 + 0.35 * Math.sin(t * 2.6 + i * 1.4)), i);
    }
    // warm bath
    const bq = eo(P(t, 2.2, 1.0));
    ctx.save();
    ctx.globalAlpha = bq;
    ctx.fillStyle = '#3A2A18';
    ctx.beginPath();
    ctx.ellipse(cx, 1578, 330, 86, 0, 0, Math.PI);
    ctx.fill();
    const wg = ctx.createLinearGradient(0, 1560, 0, 1640);
    wg.addColorStop(0, 'rgba(255,196,110,0.85)');
    wg.addColorStop(1, 'rgba(196,120,40,0.65)');
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.ellipse(cx, 1578, 320, 46, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,140,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, 1578, 320, 46, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
    if (bq > 0.4) caustics(ctx, cx - 300, 1548, 600, 56, t, 0.3 * bq);
    if (bq > 0.4) steam(ctx, cx - 60, 1560, t, { a: 0.2 * bq });
    label(ctx, 'RENDEM AIR HANGAT · TEKSTUR KEMBALI', cx, 1760,
      { size: 26, color: 'rgba(243,239,228,0.6)', track: 4, align: 'center' });
    chip(ctx, 'KRISTAL ≠ BASI', cx, 560, { p: P(t, 0.9, 0.6) });
    heading(ctx, 'KRISTAL', '', 120, 400, { amber: 'BUKAN BASI', p: P(t, 0.35, 1.0), size: 104, sub: 'HANYA TEKSTUR YANG BERUBAH' });
    ctx.restore();
    ctx.save();
    frameOn(ctx, cam);
    dust(ctx, t, 43, 22);
    ctx.restore();
    vign(ctx, 0.5);
    grain(ctx, t, 0.05);
  },
};
