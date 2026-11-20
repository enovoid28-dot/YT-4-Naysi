// s6 HARI MEMENDEK — the day dial, mass sliding toward the axis, and the
// microsecond wedge magnified in an inset loupe.
import { GP, vign, motes, clockDial, chip, cue, P, eo, keys, frameOn, label,
  clamp, lerp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const tP = cue(scene, 'poros');
    const tC = cue(scene, 'cepat');
    const tK = cue(scene, 'pendek');
    const cam = keys(t, [[0, 720, 1000, 1.02], [scene.dur, 720, 960, 1.12]]);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#04090f'); g.addColorStop(1, '#0a1a26');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    clockDial(ctx, W / 2, 950, 430, 1, { hand: clamp(t / scene.dur) * 0.5, wedge: t > tK ? 0.05 * P(t, tK, 1.2) : 0 });
    label(ctx, 'SATU HARI', W / 2, 420, { size: 40, color: 'rgba(243,239,228,0.8)', track: 8, align: 'center' });
    // mass dots sliding inward
    const q = eo(P(t, tP, 2.4));
    for (let i = 0; i < 8; i++) {
      const an = (i / 8) * TAU + 0.4;
      const r0 = lerp(360, 248, q);
      const x = W / 2 + Math.cos(an) * r0, y = 950 + Math.sin(an) * r0;
      ctx.fillStyle = q > 0.02 ? GP.amber : 'rgba(243,239,228,0.7)';
      ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
      if (q > 0.02 && q < 0.98) {
        ctx.strokeStyle = 'rgba(255,188,66,0.6)'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(W / 2 + Math.cos(an) * (r0 + 46), 950 + Math.sin(an) * (r0 + 46));
        ctx.lineTo(x + Math.cos(an) * 16, y + Math.sin(an) * 16);
        ctx.stroke();
      }
    }
    // axis line
    ctx.strokeStyle = 'rgba(243,239,228,0.5)';
    ctx.setLineDash([10, 10]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W / 2, 380); ctx.lineTo(W / 2, 1520); ctx.stroke();
    ctx.setLineDash([]);
    // loupe inset: the wedge, magnified
    if (t > tK) {
      const a = P(t, tK, 0.7);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = GP.amber; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(W - 330, 500, 170, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(6,20,29,0.8)';
      ctx.beginPath(); ctx.arc(W - 330, 500, 166, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,188,66,0.9)';
      ctx.beginPath(); ctx.moveTo(W - 330, 500);
      ctx.arc(W - 330, 500, 150, -Math.PI / 2, -Math.PI / 2 + 0.5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,188,66,0.8)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(W - 470, 640); ctx.lineTo(W - 560, 760); ctx.stroke();
      ctx.restore();
      label(ctx, 'DIPERBESAR', W - 330, 720, { size: 24, color: GP.amber, track: 4, align: 'center', a });
    }
    ctx.restore();
    if (t > tK) chip(ctx, 'HARI −2,68 MIKRODETIK', 120, 300, { a: P(t, tK + 0.3, 0.6) });
    motes(ctx, t, 71, 22);
    vign(ctx, 0.52);
  },
};
