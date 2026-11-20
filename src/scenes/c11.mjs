// s11 PERMANEN — the length-of-day chart: tidal sway with a small permanent
// step at the quake; a satellite passes and scans the step.
import { GP, vign, motes, chip, epicStar, cue, P, eo, keys, frameOn, label,
  clamp, lerp, TAU, W, H, drawOn } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const tK = cue(scene, 'kecil');
    const tS = cue(scene, 'satelit');
    const cam = keys(t, [[0, 720, 1000, 1.02], [scene.dur, 720, 980, 1.12]]);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#04090f'); g.addColorStop(1, '#0a1a26');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    const x0 = 170, x1 = W - 170, yMid = 1050, uq = 0.46;
    // axes
    ctx.strokeStyle = 'rgba(243,239,228,0.4)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, 560); ctx.lineTo(x0, 1560); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0, 1560); ctx.lineTo(x1, 1560); ctx.stroke();
    label(ctx, 'PANJANG HARI', x0, 520, { size: 28, color: 'rgba(243,239,228,0.6)', track: 4 });
    label(ctx, 'WAKTU →', x1, 1610, { size: 28, color: 'rgba(243,239,228,0.6)', track: 4, align: 'right' });
    // the curve: tidal sway + permanent step
    const p = P(t, 0.5, scene.dur - 3);
    const n = Math.floor(200 * p);
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / 200;
      const step = u > uq ? 120 : 0;
      pts.push([x0 + u * (x1 - x0), yMid + Math.sin(u * TAU * 2.6) * 210 + step]);
    }
    ctx.strokeStyle = GP.teal; ctx.lineWidth = 5;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    // the step marker
    if (p > uq) {
      const sx = x0 + uq * (x1 - x0);
      ctx.strokeStyle = GP.slip; ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(sx, 620); ctx.lineTo(sx, 1540); ctx.stroke();
      ctx.setLineDash([]);
      epicStar(ctx, sx, yMid + 210 * Math.sin(uq * TAU * 2.6) + 60, 20);
      label(ctx, '26 DES 2004', sx + 20, 700, { size: 30, color: GP.slip, track: 4 });
      label(ctx, 'PASANG BULAN', x0 + 0.78 * (x1 - x0), yMid - 260,
        { size: 26, color: 'rgba(111,211,224,0.8)', track: 4 });
      label(ctx, 'LANGKAH PERMANEN −2,68 µs', sx + 20, 1330,
        { size: 28, color: GP.amber, track: 4 });
    }
    // satellite
    if (t > tS) {
      const q = P(t, tS, scene.dur - tS - 0.5);
      const sx = lerp(x0 - 80, x1 + 60, q);
      ctx.save();
      ctx.translate(sx, 430);
      ctx.fillStyle = GP.bone;
      ctx.fillRect(-26, -18, 52, 36);
      ctx.fillStyle = 'rgba(111,211,224,0.9)';
      ctx.fillRect(-96, -12, 58, 24);
      ctx.fillRect(38, -12, 58, 24);
      ctx.strokeStyle = 'rgba(255,188,66,0.5)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(-40, 300); ctx.lineTo(40, 300); ctx.closePath(); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    if (t > tS) chip(ctx, 'TERUKUR SATELIT · PERMANEN', 120, 300, { a: P(t, tS + 0.4, 0.6) });
    motes(ctx, t, 121, 18);
    vign(ctx, 0.52);
  },
};
