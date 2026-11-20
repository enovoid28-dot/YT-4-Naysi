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
    panel(ctx, 220, 700, 1000, 660, { p: q });
    label(ctx, 'HIPPARCHUS · 1992', 720, 780, { size: 28, color: NM.sonar, align: 'center', track: 5, p: q });
    const lines = ['INPUT : PETA DARATAN BUMI', 'PROC  : SORT + SEARCH GEOMETRI', 'OUT   : 48°52.6′S 123°23.6′W'];
    lines.forEach((s, i) => {
      label(ctx, s, 300, 880 + i * 74, { size: 30, color: i === 2 ? NM.foam : NM.steel, track: 2, p: clamp(q * 3 - i * 0.7) });
    });
    if (Math.sin(t * 6) > 0) {
      ctx.fillStyle = NM.sonar;
      ctx.fillRect(300, 1108, 22, 40);
    }
    odo(ctx, 1992, 720, 1268, P(t, 1.4, 1.4), { font: '800 110px Poppins, sans-serif', col: NM.bio, glow: 'rgba(111,216,255,0.4)' });
    chip(ctx, 'DIHITUNG ULANG · 2022', 720, 1668, { p: P(t, 3.0, 0.9) });
    heading(ctx, 'BUKAN', 'PELAUT', 120, 430, { sub: 'DIHITUNG HRVOJE LUKATELA', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
