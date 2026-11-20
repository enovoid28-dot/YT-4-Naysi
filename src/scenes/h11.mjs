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
    abyss(ctx, t, { top: '#123B57' });
    const q = eo(P(t, 0.5, 1.2));
    streak(ctx, 180, 640, 1080, 1020, t, { p: q, lw: 9, bow: 120 });
    craft(ctx, 1080, 1020, 1.05, { rot: 0.62 });
    waveStrip(ctx, 160, 1420, 1120, 90, t, { col: 'rgba(111,216,255,0.45)', a: 0.7 });
    label(ctx, 'DISAKSIKAN DARI FIJI', 720, 1560, { size: 28, color: NM.steel, align: 'center', track: 4, p: q });
    chip(ctx, '135 TON', 460, 1690, { p: P(t, 1.6, 0.8), col: NM.rust });
    chip(ctx, '20–25 TON SAMPAI AIR', 960, 1690, { p: P(t, 2.2, 0.8), col: NM.rust });
    heading(ctx, 'MIR', '2001', 120, 430, { sub: 'MARET 2001 · EKOR PLASMA 1.500 KM', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
