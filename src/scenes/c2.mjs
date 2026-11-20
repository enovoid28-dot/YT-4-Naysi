// s2 PEGAS TERKUNCI — the megathrust cross-section: slab dives, interface
// locks, strain bends the markers, then the spring releases.
import { GP, vign, motes, quakeRings, cue, P, eo, keys, frameOn, label,
  clamp, lerp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const tKunci = cue(scene, 'terkunci');
    const tLepas = cue(scene, 'lepas');
    const strain = P(t, 1.2, Math.max(2, tLepas - 1.4));
    const released = t > tLepas;
    const cam = keys(t, [
      [0, 720, 1000, 1.02], [tKunci, 720, 1000, 1.05],
      [tLepas - 0.2, 710, 1030, 1.12], [scene.dur, 705, 1020, 1.14],
    ]);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a2434'); g.addColorStop(0.24, '#0d3a52');
    g.addColorStop(0.26, '#132a33'); g.addColorStop(1, '#08161d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save();
    frameOn(ctx, cam);
    // sea
    ctx.fillStyle = 'rgba(23,96,124,0.55)';
    ctx.fillRect(-200, 120, W + 400, 480);
    ctx.strokeStyle = 'rgba(111,211,224,0.6)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-200, 600); ctx.lineTo(W + 200, 600); ctx.stroke();
    // subducting slab: dives to the lower left
    ctx.fillStyle = '#0e222c';
    ctx.beginPath();
    ctx.moveTo(W + 200, 760); ctx.lineTo(520, 1180); ctx.lineTo(180, 2100);
    ctx.lineTo(-200, 2100); ctx.lineTo(-200, 1900); ctx.lineTo(360, 1020);
    ctx.lineTo(W + 200, 620); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(243,239,228,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W + 200, 620); ctx.lineTo(360, 1020); ctx.lineTo(-160, 1860); ctx.stroke();
    // megathrust interface with the locked teeth
    const ix = 760, iy = 900;
    ctx.strokeStyle = released ? GP.slip : 'rgba(243,239,228,0.85)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(ix - 260, iy + 190);
    for (let i = 0; i <= 8; i++) {
      const x = ix - 260 + i * 65;
      ctx.lineTo(x + 32, iy + 190 - (i % 2 ? 34 : 0));
    }
    ctx.lineTo(ix + 320, iy + 150);
    ctx.stroke();
    // crust strata for texture
    ctx.strokeStyle = 'rgba(243,239,228,0.07)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = 760 + i * 190;
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.quadraticCurveTo(700, y - 26, W + 200, y + 40);
      ctx.stroke();
    }
    // strain markers: bent fence posts on the upper plate
    for (let i = 0; i < 5; i++) {
      const x = 480 + i * 150;
      const bend = strain * 52 * (released ? -0.35 : 1);
      ctx.strokeStyle = released ? GP.amber : 'rgba(243,239,228,0.8)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x, 872);
      ctx.quadraticCurveTo(x - bend, 760, x - bend * 1.6, 648);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x - 16, 872); ctx.lineTo(x + 16, 872); ctx.stroke();
    }
    // the spring glyph beside the locked patch, with a leader
    const sx0 = ix + 380, sy0 = 960;
    ctx.strokeStyle = 'rgba(255,188,66,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ix + 260, iy + 170); ctx.lineTo(sx0 - 60, sy0 + 60); ctx.stroke();
    ctx.strokeStyle = GP.amber; ctx.lineWidth = 6;
    ctx.beginPath();
    const coils = 6, cw = 130, ch = lerp(280, 160, strain);
    for (let i = 0; i <= coils * 24; i++) {
      const u = i / (coils * 24);
      const x = sx0 + Math.sin(u * coils * TAU) * cw * 0.5;
      const y = sy0 + u * ch;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    label(ctx, 'PEGAS BATUAN', sx0, sy0 - 40, { size: 28, color: GP.amber, track: 4, align: 'center' });
    // subduction direction arrow, mid-frame
    ctx.strokeStyle = 'rgba(111,211,224,0.75)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(760, 1330); ctx.lineTo(560, 1520); ctx.stroke();
    ctx.fillStyle = 'rgba(111,211,224,0.75)';
    ctx.beginPath();
    ctx.moveTo(520, 1558); ctx.lineTo(596, 1512); ctx.lineTo(566, 1480);
    ctx.closePath(); ctx.fill();
    label(ctx, 'MENYELAM ±6 CM/TAHUN', 790, 1400,
      { size: 28, color: 'rgba(111,211,224,0.8)', track: 4 });
    label(ctx, 'LEMPENG INDIA-AUSTRALIA', 240, 1740,
      { size: 30, color: 'rgba(243,239,228,0.6)', track: 4 });
    label(ctx, 'ZONA TERKUNCI', ix - 300, iy + 330, { size: 32, color: GP.bone, track: 4 });
    if (released) {
      quakeRings(ctx, ix, iy + 170, tLepas, t - tLepas, 4);
      ctx.strokeStyle = GP.slip; ctx.lineWidth = 8;
      for (let i = 0; i < 3; i++) {
        const x = 620 + i * 180;
        ctx.beginPath(); ctx.moveTo(x, 830 - i * 26); ctx.lineTo(x + 90, 780 - i * 26); ctx.stroke();
      }
    }
    ctx.restore();
    motes(ctx, t, 31, 22, '150,220,235');
    vign(ctx, 0.5);
  },
};
