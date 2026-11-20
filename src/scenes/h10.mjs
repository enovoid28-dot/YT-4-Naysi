import { NM, abyss, contours, sonar, depthRuler, gyre, craft, streak, waveStrip, panel, heading, chip, seaPass, cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, snow, rgba, W, H, grain, back, odo } from './_nemo.mjs';

const ship = (ctx, x, y, s, col) => {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-70, 0); ctx.quadraticCurveTo(-58, 26, 0, 28); ctx.quadraticCurveTo(60, 26, 74, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(-18, -26, 34, 26);
  ctx.fillRect(20, -14, 16, 14);
  ctx.fillRect(-4, -44, 4, 20);
  ctx.restore();
};

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1140, 1.08], [scene.dur * 0.5, 720, 1080, 1.03], [scene.dur, 720, 1020, 1.0],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    abyss(ctx, t, { surface: false });
    const q = eo(P(t, 0.6, 1.4));
    ctx.save();
    [220, 400, 580].forEach((r, i) => {
      ctx.strokeStyle = `rgba(53,224,180,${0.5 - i * 0.12})`;
      ctx.lineWidth = 2.6;
      ctx.setLineDash(i === 2 ? [] : [14, 12]);
      ctx.globalAlpha = q;
      ctx.beginPath(); ctx.ellipse(720, 1140, r * q, r * 0.72 * q, 0, 0, TAU); ctx.stroke();
    });
    ctx.setLineDash([]);
    const rd = rng(33);
    ctx.fillStyle = 'rgba(255,138,80,0.8)';
    for (let i = 0; i < 16; i++) {
      const an = rd() * TAU, rr = rd() * 520;
      ctx.globalAlpha = q * (0.35 + 0.5 * rd());
      ctx.beginPath();
      ctx.arc(720 + Math.cos(an) * rr, 1140 + Math.sin(an) * rr * 0.72, 2.6 + rd() * 3, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = q;
    ctx.strokeStyle = NM.foam;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(720 - 26, 1140); ctx.lineTo(720 + 26, 1140); ctx.moveTo(720, 1140 - 26); ctx.lineTo(720, 1140 + 26); ctx.stroke();
    ctx.restore();
    chip(ctx, 'ZONA TOLERANSI LEBAR', 720, 1690, { p: P(t, 2.4, 0.9) });
    heading(ctx, 'MELESET', 'ITU PASTI', 120, 430, { sub: 'FRAGMEN TAK BISA DIPREDIKSI', p: P(t, 0.4, 1.0), size: 128 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
