// h8 SEGEL RAPAT — split stage: sealed amphora glows safe; the open jar
// drinks moist air (arrows in) and ferments (bubbles up).
import { MD, tomb, dust, vign, jar, heading, chip, label, leader,
  cue, P, eo, keys, frameOn, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1100, 1.05], [scene.dur - 3.5, 720, 1070, 1.0], [scene.dur, 720, 1050, 1.03],
    ]);
    tomb(ctx, t, { hex: 0.03 });
    ctx.save();
    frameOn(ctx, cam);
    // divider
    ctx.setLineDash([10, 14]);
    ctx.strokeStyle = 'rgba(243,239,228,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2, 620);
    ctx.lineTo(W / 2, 1720);
    ctx.stroke();
    ctx.setLineDash([]);
    // left: sealed
    jar(ctx, W * 0.27, 1240, 1.02, { seal: true, glow: 0.6 + 0.3 * Math.sin(t * 1.2) });
    chip(ctx, 'SEGEL UTUH · AMAN', W * 0.27, 1620, { p: P(t, 1.0, 0.6), col: 'rgba(255,182,39,0.95)' });
    ctx.save();
    ctx.strokeStyle = MD.faience;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    const ck = eo(P(t, 1.6, 0.5));
    ctx.beginPath();
    ctx.moveTo(W * 0.27 - 34, 700);
    ctx.lineTo(W * 0.27 - 8, 700 + 30 * ck);
    ctx.lineTo(W * 0.27 + 40, 700 - 34 * ck);
    ctx.stroke();
    ctx.restore();
    // right: open, drinking air
    jar(ctx, W * 0.74, 1240, 1.02, { seal: false, glow: 0.12, level: 0.74 });
    chip(ctx, 'TERBUKA · FERMENTASI', W * 0.74, 1620, { p: P(t, 2.0, 0.6), col: 'rgba(196,80,46,0.95)', text: '#F3C9B8' });
    // moist-air arrows in
    for (let i = 0; i < 4; i++) {
      const ph = ((t * 0.35 + i * 0.25) % 1);
      const ax = W * 0.74 + (i - 1.5) * 110;
      const ay = 760 + ph * 260;
      ctx.save();
      ctx.strokeStyle = `rgba(159,216,207,${0.75 * (1 - ph)})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax, ay + 56);
      ctx.moveTo(ax, ay + 56);
      ctx.lineTo(ax - 10, ay + 40);
      ctx.moveTo(ax, ay + 56);
      ctx.lineTo(ax + 10, ay + 40);
      ctx.stroke();
      ctx.restore();
    }
    // fermentation bubbles
    const fq = eo(P(t, 3.0, 1.5));
    for (let i = 0; i < 7; i++) {
      const ph = ((t * 0.3 + i * 0.14) % 1) * fq;
      const bx2 = W * 0.74 - 60 + (i % 4) * 40;
      const by2 = 1240 - ph * 220;
      ctx.strokeStyle = `rgba(240,230,200,${0.5 * (1 - ph) * fq})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(bx2 + Math.sin(ph * 8 + i) * 10, by2, 7 + (i % 3) * 4, 0, TAU);
      ctx.stroke();
    }
    label(ctx, 'UDARA LEMBAB', W * 0.74, 700, { size: 26, color: 'rgba(159,216,207,0.8)', track: 4, align: 'center' });
    heading(ctx, 'SEGEL', '', 120, 400, { amber: 'RAPAT', p: P(t, 0.35, 1.0), size: 110, sub: 'MADU MENYERAP AIR DARI UDARA' });
    ctx.restore();
    dust(ctx, t, 41, 24);
    vign(ctx, 0.5);
  },
};
