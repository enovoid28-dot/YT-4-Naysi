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
    // sea line
    ctx.strokeStyle = 'rgba(159,184,204,0.5)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = 100; x <= W - 100; x += 14) {
      const y = 1300 + Math.sin(x * 0.02 + t * 1.4) * 5;
      if (x === 100) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ship(ctx, 300, 1288, 0.9, 'rgba(159,184,204,0.75)');
    label(ctx, 'TANPA RUTE RUTIN', 300, 1392, { size: 26, color: NM.steel, align: 'center', track: 3, p: q });
    // ISS overhead
    ctx.save();
    ctx.setLineDash([8, 10]);
    ctx.strokeStyle = 'rgba(53,224,180,0.6)';
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = q;
    ctx.beginPath(); ctx.moveTo(980, 830); ctx.lineTo(980, 1290); ctx.stroke();
    ctx.restore();
    craft(ctx, 980, 780, 1.15, { rot: -0.06 });
    odo(ctx, 415, 980, 1080, q, { font: '800 96px Poppins, sans-serif', col: NM.sonar, glow: 'rgba(53,224,180,0.5)', suffix: ' KM' });
    label(ctx, 'STASIUN LUAR ANGKASA DI ATAS KEPALA', 980, 1140, { size: 26, color: NM.bio, align: 'center', track: 3, p: q });
    contours(ctx, 720, 2100, t, { n: 3, gap: 150, sy: 0.5, col: 'rgba(111,216,255,0.10)' });
    heading(ctx, 'MANUSIA', 'TERDEKAT', 120, 430, { sub: 'BUKAN DI KAPAL · BUKAN DI PULAU', p: P(t, 0.4, 1.0), size: 128 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
