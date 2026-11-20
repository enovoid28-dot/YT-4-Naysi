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
    contours(ctx, 720, 1150, t, { n: 4, gap: 160 });
    sonar(ctx, 720, 1150, t, { max: 480, a: 0.4, per: 3.2 });
    const q = eo(P(t, 0.5, 1.1));
    panel(ctx, 240, 860, 960, 480, { p: q });
    label(ctx, 'MALAM INI DI TITIK NEMO', 720, 940, { size: 28, color: NM.sonar, align: 'center', track: 5, p: q });
    ctx.save();
    ctx.globalAlpha = q;
    ctx.font = '700 52px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = NM.foam;
    ctx.fillText('MANUSIA TERDEKATMU', 720, 1080);
    ctx.fillStyle = NM.sonar;
    ctx.fillText('MENGAPUNG DI ATASMU', 720, 1156);
    ctx.restore();
    chip(ctx, 'TULIS KOMENTARMU', 720, 1690, { p: P(t, 2.0, 0.9) });
    heading(ctx, 'KAMU DI', 'SANA?', 120, 430, { sub: 'TEMPAT PALING SUNYI DI BUMI', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
