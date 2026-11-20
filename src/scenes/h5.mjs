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
    const q = eo(P(t, 0.5, 1.1));
    panel(ctx, 260, 720, 920, 620, { p: q });
    label(ctx, 'JULES VERNE · 1870', 720, 800, { size: 28, color: NM.sonar, align: 'center', track: 5, p: q });
    label(ctx, 'VINGT MILLE LIEUES SOUS LES MERS', 720, 866, { size: 26, color: NM.steel, align: 'center', track: 2, p: q });
    ctx.save();
    ctx.globalAlpha = q;
    ctx.font = '800 150px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = NM.foam;
    ctx.shadowColor = 'rgba(111,216,255,0.45)';
    ctx.shadowBlur = 24;
    ctx.fillText('NEMO', 720, 1080);
    ctx.shadowBlur = 0;
    ctx.font = '700 44px Poppins, sans-serif';
    ctx.fillStyle = NM.sonar;
    ctx.fillText('= TIDAK SEORANG PUN', 720, 1180);
    ctx.restore();
    label(ctx, 'BAHASA LATIN', 720, 1262, { size: 26, color: NM.steel, align: 'center', track: 5, p: q });
    heading(ctx, 'KAPTEN', 'NEMO', 120, 430, { sub: 'NAMA DARI NOVEL JULES VERNE', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
