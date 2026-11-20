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
    contours(ctx, 720, 1120, t, { n: 4, gap: 190, sy: 0.6 });
    const q = P(t, 0.6, 1.8);
    const rd = rng(9);
    ctx.save();
    ctx.strokeStyle = 'rgba(53,224,180,0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 36; i++) {
      const an = (i / 36) * TAU - Math.PI / 2;
      const r0 = 430, r1 = i % 9 === 0 ? 486 : 462;
      ctx.globalAlpha = eo(q) * (i / 36 < eo(q) ? 1 : 0.14);
      ctx.beginPath();
      ctx.moveTo(720 + Math.cos(an) * r0, 1120 + Math.sin(an) * r0 * 0.86);
      ctx.lineTo(720 + Math.cos(an) * r1, 1120 + Math.sin(an) * r1 * 0.86);
      ctx.stroke();
    }
    ctx.restore();
    odo(ctx, 2688, 720, 1180, q, { font: '800 230px Poppins, sans-serif', col: NM.foam, glow: 'rgba(111,216,255,0.5)', suffix: ' KM' });
    label(ctx, 'KE ARAH MANA PUN KAMU MENGHADAP', 720, 1330, { size: 30, color: NM.steel, align: 'center', track: 4, p: P(t, 1.6, 0.9) });
    heading(ctx, 'SEJAUH', 'APA?', 120, 430, { sub: 'DARI DARATAN TERDEKAT', p: P(t, 0.4, 1.0), size: 132 });
    ctx.restore();
    seaPass(ctx, t);
  },
};
