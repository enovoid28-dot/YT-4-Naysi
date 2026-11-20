// s10 JEJAK TERUKUR — GPS vectors: the Andaman dots before and after, the
// Aceh coast dashed-offset, an Alaska inset ringing far away.
import { GP, vign, motes, mapBase, geoPts, GEO, quakeRings, chip, cue, P, eo,
  keys, frameOn, label, clamp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const tN = cue(scene, 'nyata');
    const tA = cue(scene, 'alaska');
    const q = eo(P(t, tN + 0.6, 2.6));
    const cam = keys(t, [
      [0, 720, 700, 1.5], [4, 720, 700, 1.5],
      [8, 760, 900, 1.24], [scene.dur, 760, 940, 1.2],
    ]);
    ctx.fillStyle = GP.deep; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    mapBase(ctx, -160, -260, W + 320, 2360);
    const pts = geoPts(GEO.andaman, -160, -260, W + 320, 2360);
    pts.forEach(([x, y], i) => {
      ctx.fillStyle = 'rgba(243,239,228,0.85)';
      ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
      const nx = x - 44 * q, ny = y + 30 * q;
      if (q > 0.02) {
        ctx.strokeStyle = GP.amber; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
        ctx.fillStyle = GP.amber;
        ctx.beginPath(); ctx.arc(nx, ny, 11, 0, TAU); ctx.fill();
      }
    });
    label(ctx, 'KEP. ANDAMAN · SEBELUM & SESUDAH', 260, 420,
      { size: 32, color: 'rgba(243,239,228,0.75)', track: 4 });
    // Aceh coastline, dashed after-position
    const sp = geoPts(GEO.sumatra, -160, -260, W + 320, 2360);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,188,66,0.75)';
    ctx.setLineDash([12, 10]); ctx.lineWidth = 4;
    ctx.beginPath();
    sp.forEach(([x, y], i) => (i ? ctx.lineTo(x - 34 * q, y + 24 * q) : ctx.moveTo(x - 34 * q, y + 24 * q)));
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    if (t > tN) chip(ctx, 'GPS: PULAU BERGESER BEBERAPA METER', 120, 300, { a: P(t, tN + 0.3, 0.6) });
    // Alaska inset
    if (t > tA) {
      const a = P(t, tA, 0.6);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = 'rgba(243,239,228,0.5)'; ctx.lineWidth = 3;
      ctx.strokeRect(W - 430, 300, 310, 210);
      ctx.fillStyle = 'rgba(6,20,29,0.7)';
      ctx.fillRect(W - 430, 300, 310, 210);
      quakeRings(ctx, W - 275, 405, tA, t - tA, 3, GP.teal);
      label(ctx, 'ALASKA IKUT TERPICU', W - 410, 480, { size: 26, color: GP.teal, track: 4 });
      ctx.restore();
    }
    motes(ctx, t, 111, 22, '140,220,230');
    vign(ctx, 0.48);
  },
};
