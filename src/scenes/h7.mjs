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
    gyre(ctx, 720, 1140, t, { scale: 175, col: 'rgba(111,216,255,0.42)', lw: 3.4 });
    const rd = rng(21);
    ctx.save();
    ctx.fillStyle = 'rgba(178,214,238,0.5)';
    for (let i = 0; i < 14; i++) {
      const x = 260 + rd() * 920, y = 760 + rd() * 760;
      ctx.globalAlpha = 0.2 + 0.3 * Math.abs(Math.sin(t * 0.8 + i));
      ctx.beginPath(); ctx.arc(x, y + Math.sin(t * 0.5 + i) * 8, 2.2, 0, TAU); ctx.fill();
    }
    ctx.restore();
    odo(ctx, 37, 720, 1180, P(t, 1.0, 1.6), { font: '800 200px Poppins, sans-serif', col: NM.foam, glow: 'rgba(111,216,255,0.45)', suffix: ' JUTA KM²' });
    label(ctx, 'ARUS MELINGKAR MENDORONG NUTRISI MENJAUH', 720, 1330, { size: 28, color: NM.steel, align: 'center', track: 3, p: P(t, 1.8, 0.9) });
    heading(ctx, 'GURUN', 'SAMUDRA', 120, 430, { sub: 'SOUTH PACIFIC GYRE', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
