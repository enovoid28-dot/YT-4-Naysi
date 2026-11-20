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
    const q = eo(P(t, 0.6, 1.3));
    craft(ctx, 720, 820, 1.7, { rot: -0.04 });
    ctx.save();
    ctx.setLineDash([10, 14]);
    ctx.strokeStyle = 'rgba(53,224,180,0.6)';
    ctx.lineWidth = 2.6;
    ctx.globalAlpha = q;
    ctx.beginPath();
    ctx.moveTo(720, 900);
    ctx.quadraticCurveTo(860, 1150, 720, 1380);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = NM.sonar;
    ctx.beginPath(); ctx.arc(720, 1400, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(53,224,180,0.45)';
    ctx.beginPath(); ctx.arc(720, 1400, 26 + 5 * Math.sin(t * 2.4), 0, TAU); ctx.stroke();
    ctx.restore();
    odo(ctx, 400, 720, 1230, P(t, 1.4, 1.5), { font: '800 150px Poppins, sans-serif', col: NM.foam, glow: 'rgba(111,216,255,0.45)', suffix: '+ TON' });
    chip(ctx, 'SEKITAR 2030', 720, 1690, { p: P(t, 2.6, 0.9) });
    heading(ctx, 'GILIRAN', 'ISS', 120, 430, { sub: 'MENUJU TITIK YANG SAMA', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
