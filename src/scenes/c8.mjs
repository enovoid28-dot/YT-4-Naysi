// s8 PENARI ES — the skater pulls her arms in while the top-view Earth pulls
// its mass in with her; spin arcs accelerate.
import { GP, vign, motes, skater, cue, P, eo, keys, frameOn, label, clamp,
  lerp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const tL = cue(scene, 'lengannya');
    const p = P(t, tL, 2.4);
    const cam = keys(t, [[0, 720, 1000, 1.02], [scene.dur, 720, 980, 1.1]]);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#07131c'); g.addColorStop(1, '#0b2430');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    skater(ctx, W * 0.30, 1020, 400, p, t);
    // divider
    ctx.strokeStyle = 'rgba(243,239,228,0.25)';
    ctx.setLineDash([6, 12]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W / 2, 480); ctx.lineTo(W / 2, 1560); ctx.stroke();
    ctx.setLineDash([]);
    // top-view earth with mass rings pulling in
    const cx = W * 0.74, cy = 1020;
    ctx.fillStyle = '#0d3a52';
    ctx.beginPath(); ctx.arc(cx, cy, 300, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(243,239,228,0.55)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, 300, 0, TAU); ctx.stroke();
    const spin = t * (0.5 + 1.6 * eo(p));
    ctx.strokeStyle = 'rgba(111,211,224,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 210, spin, spin + 4.4); ctx.stroke();
    for (let i = 0; i < 10; i++) {
      const an = (i / 10) * TAU + spin * 0.3;
      const rr = lerp(268, 190, eo(p));
      ctx.fillStyle = p > 0.02 ? GP.amber : 'rgba(243,239,228,0.75)';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, 9, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = GP.bone;
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill();
    label(ctx, 'MASSA MERAPAT KE POROS', cx, 1420,
      { size: 28, color: 'rgba(243,239,228,0.65)', track: 4, align: 'center' });
    ctx.restore();
    const tC = cue(scene, 'cepat');
    if (t > tC) label(ctx, 'POROS SAMA · PUTARAN NAIK', W / 2, 1900,
      { size: 40, color: GP.amber, track: 6, align: 'center', a: P(t, tC, 0.7) });
    motes(ctx, t, 91, 20);
    vign(ctx, 0.5);
  },
};
