// h15 WARNA TUA — three jars age left to right: the honey darkens, the
// sparkle fades, a decade ruler runs beneath; flavour changes, safety not.
import { MD, tomb, dust, vign, jar, heading, chip, label, leader, sparkle,
  cue, P, eo, keys, frameOn, clamp, lerp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1100, 1.05], [scene.dur - 3.5, 720, 1070, 1.0], [scene.dur, 720, 1050, 1.04],
    ]);
    tomb(ctx, t, { hex: 0.035 });
    ctx.save();
    frameOn(ctx, cam);
    const xs = [360, 720, 1080];
    const tints = [0, 0.42, 0.72];
    const decades = ['0 TAHUN', '30 TAHUN', '60 TAHUN'];
    xs.forEach((x, i) => {
      const q = eo(P(t, 0.5 + i * 0.8, 0.8));
      ctx.save();
      ctx.globalAlpha = q;
      jar(ctx, x, 1080, 0.86, { kind: 'glass', seal: true, glow: 0.5 - i * 0.14, level: 0.8 });
      // age tint over the body
      if (tints[i] > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        const tg = ctx.createRadialGradient(x, 1080, 20, x, 1080, 170);
        tg.addColorStop(0, `rgba(96,52,12,${1 - 0.55 * (1 - tints[i])})`);
        tg.addColorStop(1, 'rgba(255,255,255,1)');
        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.rect(x - 80, 990, 160, 200);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = q;
      ctx.restore();
      chip(ctx, decades[i], x, 1392, { p: q, col: i === 2 ? 'rgba(196,120,40,0.9)' : 'rgba(255,182,39,0.85)' });
      for (let k = 0; k < 4 - i; k++) {
        sparkle(ctx, x - 40 + k * 28, 1020 + (k % 2) * 60, 9, q * (0.5 - i * 0.16) * (0.6 + 0.4 * Math.sin(t * 2.4 + k + i)), k);
      }
    });
    // ageing arrow
    const aq = eo(P(t, 2.6, 1.2));
    ctx.save();
    ctx.strokeStyle = `rgba(243,239,228,${0.5 * aq})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(430, 1520);
    ctx.lineTo(430 + 580 * aq, 1520);
    if (aq > 0.9) {
      ctx.lineTo(990, 1504);
      ctx.moveTo(1010, 1520);
      ctx.lineTo(990, 1536);
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, 'WARNA GELAP · RASA BERUBAH · AMAN TETAP', 720, 1588,
      { size: 26, color: 'rgba(243,239,228,0.65)', track: 4, align: 'center' });
    leader(ctx, 1080, 980, 1210, 840, { col: 'rgba(245,208,140,0.6)' });
    chip(ctx, 'KUALITAS ≠ KEAMANAN', 1180, 800, { p: P(t, cue(scene, 'keamanan'), 0.5) });
    heading(ctx, 'GELAP', '', 120, 400, { amber: '≠ BASI', p: P(t, 0.35, 1.0), size: 110, sub: 'PULUHAN TAHUN HANYA MENGUBAH RASA' });
    ctx.restore();
    dust(ctx, t, 71, 24);
    vign(ctx, 0.5);
  },
};
