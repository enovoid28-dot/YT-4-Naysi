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
    [[420, 760, 0.5, -0.5], [820, 940, 0.7, -0.35], [620, 1240, 0.9, -0.6]].forEach(([x, y, s, rot], i) => {
      const p = clamp(q * 2.4 - i * 0.5);
      ctx.save();
      ctx.globalAlpha = p * 0.9;
      streak(ctx, x - 260, y - 300, x, y, t, { p: p * 0.7, lw: 5, bow: 40 });
      craft(ctx, x, y, s, { rot });
      ctx.restore();
    });
    odo(ctx, 300, 720, 1560, P(t, 1.2, 1.6), { font: '800 170px Poppins, sans-serif', col: NM.foam, glow: 'rgba(255,138,80,0.4)', suffix: '+ WAHANA' });
    chip(ctx, 'SEJAK 1971', 720, 1690, { p: P(t, 2.6, 0.9), col: NM.rust });
    heading(ctx, 'KUBURAN', 'WAHANA', 120, 430, { sub: 'WAHANA ANTARIKSA PENSIUN', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
