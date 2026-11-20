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
    const q = eo(P(t, 0.6, 1.4));
    const isl = [[720, 700, 'DUCIE · UTARA'], [1150, 1180, 'MOTU NUI · TIMUR LAUT'], [430, 1420, 'MAHER · SELATAN']];
    ctx.save();
    ctx.setLineDash([10, 12]);
    ctx.strokeStyle = 'rgba(111,216,255,0.55)';
    ctx.lineWidth = 2.4;
    isl.forEach(([x, y], i) => {
      ctx.globalAlpha = q * clamp(q * 3 - i * 0.6);
      ctx.beginPath(); ctx.moveTo(720, 1120); ctx.lineTo(x, y); ctx.stroke();
    });
    ctx.setLineDash([]);
    isl.forEach(([x, y, nm], i) => {
      const p = clamp(q * 3 - i * 0.6);
      ctx.globalAlpha = p;
      ctx.fillStyle = NM.bio;
      ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(111,216,255,0.4)';
      ctx.beginPath(); ctx.arc(x, y, 22 + 4 * Math.sin(t * 2 + i), 0, TAU); ctx.stroke();
      label(ctx, nm, x, y - 40, { size: 26, color: NM.foam, align: 'center', track: 3, p });
      label(ctx, '2.688 KM', x, y + 56, { size: 24, color: NM.sonar, align: 'center', track: 3, p });
    });
    ctx.globalAlpha = q;
    ctx.fillStyle = NM.sonar;
    ctx.beginPath(); ctx.arc(720, 1120, 9, 0, TAU); ctx.fill();
    ctx.restore();
    chip(ctx, '22 JUTA KM² KOSONG MANUSIA', 720, 1668, { p: P(t, 2.6, 0.9) });
    heading(ctx, 'TIGA', 'DARATAN', 120, 430, { sub: 'SAMA JAUHNYA · TAK BERPENGHUNI', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
