// h5 KUMAN MENGERING — osmosis in action: microbes drift onto the honey
// surface, lose their water (arrows out), wrinkle dry and die.
import { MD, tomb, dust, vign, hexGrid, microbe, heading, chip, label, leader,
  cue, P, eo, keys, frameOn, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1060, 1.08], [3, 720, 1090, 1.0], [scene.dur, 720, 1120, 1.06],
    ]);
    tomb(ctx, t, { hex: 0 });
    ctx.save();
    frameOn(ctx, cam);
    // honey surface band
    const yS = 1400;
    const g = ctx.createLinearGradient(0, yS, 0, yS + 380);
    g.addColorStop(0, '#FFCF6E');
    g.addColorStop(0.25, MD.honey);
    g.addColorStop(1, '#6E3A08');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(80, yS + 26);
    for (let x = 80; x <= W - 80; x += 40) {
      ctx.lineTo(x, yS + 26 + Math.sin(x * 0.02 + t * 0.8) * 10);
    }
    ctx.lineTo(W - 80, H);
    ctx.lineTo(80, H);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.rect(80, yS, W - 160, 400);
    ctx.clip();
    hexGrid(ctx, 80, yS, W - 160, 400, 74, { a: 0.16, fill: 0.5, t });
    ctx.restore();
    label(ctx, 'PERMUKAAN MADU · GULA LEWAT JENUH', 100, yS + 330,
      { size: 26, color: 'rgba(40,24,8,0.75)', track: 4 });
    // three microbes descend and desiccate
    const xs = [380, 720, 1060];
    xs.forEach((x, i) => {
      const t0 = 0.6 + i * 1.1;
      const fall = eo(P(t, t0, 1.6));
      const y = 560 + fall * (yS - 620);
      const dry = eo(P(t, t0 + 1.8, 2.6));
      const dead = eo(P(t, t0 + 4.2, 1.6));
      microbe(ctx, x, y, 1.25, { dry, dead, rot: Math.sin(t * 0.7 + i) * 0.3 });
      if (dry > 0.02 && dry < 1) {
        ctx.save();
        ctx.strokeStyle = `rgba(159,216,207,${0.8 * (1 - dry)})`;
        ctx.lineWidth = 3.4;
        for (let k = 0; k < 4; k++) {
          const an = -Math.PI / 2 + (k - 1.5) * 0.7;
          const r0 = 58, r1 = 58 + 46 * dry;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0);
          ctx.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1);
          ctx.lineTo(x + Math.cos(an + 0.28) * (r1 - 12), y + Math.sin(an + 0.28) * (r1 - 12));
          ctx.moveTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1);
          ctx.lineTo(x + Math.cos(an - 0.28) * (r1 - 12), y + Math.sin(an - 0.28) * (r1 - 12));
          ctx.stroke();
        }
        ctx.restore();
      }
    });
    chip(ctx, 'AIR TARIK KELUAR · OSMOSIS', 720, 470, { p: P(t, cue(scene, 'cairan'), 0.5) });
    heading(ctx, 'KUMAN', '', 120, 380, { amber: 'MENGERING', p: P(t, 0.35, 1.0), size: 110, sub: 'SEPERTI DIAWETKAN DARI DALAM' });
    ctx.restore();
    dust(ctx, t, 29, 24);
    vign(ctx, 0.5);
  },
};
