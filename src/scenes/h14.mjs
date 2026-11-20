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
    abyss(ctx, t, { top: '#0E3A5C' });
    const q = eo(P(t, 0.6, 1.2));
    ctx.strokeStyle = 'rgba(159,184,204,0.55)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let x = 120; x <= W - 120; x += 14) {
      const y = 1240 + Math.sin(x * 0.018 + t * 1.2) * 6;
      if (x === 120) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ship(ctx, 720, 1226, 1.5, 'rgba(234,244,255,0.85)');
    label(ctx, 'HESPÉRIDES · KAPAL RISET SPANYOL', 720, 1350, { size: 28, color: NM.foam, align: 'center', track: 3, p: q });
    odo(ctx, 1999, 720, 1520, P(t, 1.4, 1.4), { font: '800 130px Poppins, sans-serif', col: NM.sonar, glow: 'rgba(53,224,180,0.45)' });
    heading(ctx, 'KAPAL', 'PERTAMA', 120, 430, { sub: 'MENYAMBANGI KAWASAN INI', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
