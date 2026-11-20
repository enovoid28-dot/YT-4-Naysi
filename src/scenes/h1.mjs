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
    abyss(ctx, t);
    contours(ctx, 720, 1180, t, { n: 5, gap: 150 });
    sonar(ctx, 720, 1180, t, { max: 700, a: 0.55 });
    const q = eo(P(t, 1.0, 1.2));
    label(ctx, '48°52.6′S  123°23.6′W', 720, 1560, { size: 34, color: NM.bio, align: 'center', track: 4, p: q });
    chip(ctx, 'MANUSIA TERDEKAT: ASTRONOT', 720, 1668, { p: P(t, 2.4, 0.9) });
    heading(ctx, 'TITIK', 'NEMO', 120, 430, { sub: 'SAMUDRA PASIFIK SELATAN', p: P(t, 0.4, 1.0), size: 150 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
