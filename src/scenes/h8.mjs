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
    const q = eo(P(t, 0.6, 1.2));
    ctx.save();
    ctx.setLineDash([26, 20]);
    ctx.strokeStyle = 'rgba(159,184,204,0.35)';
    ctx.lineWidth = 3;
    [[160, 860, 1280, 1020], [160, 1240, 1280, 1360]].forEach(([x0, y0, x1, y1], i) => {
      ctx.globalAlpha = q;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      ctx.setLineDash([]);
      ctx.strokeStyle = NM.rust;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(mx - 26, my - 26); ctx.lineTo(mx + 26, my + 26); ctx.moveTo(mx + 26, my - 26); ctx.lineTo(mx - 26, my + 26); ctx.stroke();
      ctx.setLineDash([26, 20]);
      ctx.strokeStyle = 'rgba(159,184,204,0.35)';
      ctx.lineWidth = 3;
    });
    ctx.restore();
    ship(ctx, 1060, 1560, 1.05, 'rgba(159,184,204,0.8)');
    waveStrip(ctx, 200, 1560, 620, 60, t, { col: 'rgba(111,216,255,0.4)', a: 0.5 });
    chip(ctx, 'TANPA RUTE DALAM 400 KM', 720, 1690, { p: P(t, 2.2, 0.9), col: NM.rust });
    heading(ctx, 'TAK ADA', 'ALASAN', 120, 430, { sub: 'KENAPA LAUT INI KOSONG', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
