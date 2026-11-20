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
    abyss(ctx, t, { surface: false, top: '#062033' });
    depthRuler(ctx, t, { max: 4000, y0: 560, y1: 1500 });
    const q = eo(P(t, 0.8, 1.4));
    // comparison bars
    const rows = [[4000, 'NEMO', NM.sonar], [10935, 'CHALLENGER DEEP', 'rgba(159,184,204,0.7)']];
    rows.forEach(([v, nm, col], i) => {
      const y = 820 + i * 220;
      const bw = 760 * (v / 10935) * q;
      ctx.fillStyle = 'rgba(4,16,30,0.6)';
      ctx.fillRect(420, y, 760, 74);
      const g = ctx.createLinearGradient(420, 0, 420 + bw, 0);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(111,216,255,0.55)');
      ctx.fillStyle = g;
      ctx.fillRect(420, y, bw, 74);
      label(ctx, nm, 420, y - 18, { size: 26, color: NM.foam, track: 3, p: q });
      ctx.save();
      ctx.font = '700 34px JetBrains Mono, monospace';
      ctx.fillStyle = NM.foam;
      ctx.fillText(Math.round(v * q).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' M', 420 + bw + 20, y + 50);
      ctx.restore();
    });
    chip(ctx, 'DALAM — TAPI BUKAN TERDALAM', 720, 1690, { p: P(t, 2.6, 0.9) });
    heading(ctx, 'EMPAT RIBU', 'METER', 120, 430, { sub: 'KEDALAMAN AIR DI TITIK NEMO', p: P(t, 0.4, 1.0), size: 128 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
