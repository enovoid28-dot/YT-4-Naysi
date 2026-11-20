// h14 DAPUR LEBAH — the origin: a blossom on the left, the bee's dashed
// commute, and a honeycomb whose cells flood amber as the fanning dries it.
import { MD, tomb, shafts, dust, vign, hexGrid, bee, heading, chip, label, leader, plateFrame,
  cue, P, eo, keys, frameOn, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1080, 1.06], [3, 720, 1060, 1.0], [scene.dur, 720, 1030, 1.05],
    ]);
    tomb(ctx, t, { hex: 0 });
    shafts(ctx, t, { n: 2, a: 0.06, x: 300, gap: 620 });
    ctx.save();
    frameOn(ctx, cam);
    // blossom
    const fx = 330, fy = 1240;
    ctx.save();
    ctx.strokeStyle = 'rgba(120,160,90,0.8)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 40);
    ctx.quadraticCurveTo(fx - 30, fy + 220, fx + 10, fy + 400);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const an = (i / 6) * TAU + t * 0.1;
      ctx.save();
      ctx.translate(fx + Math.cos(an) * 74, fy + Math.sin(an) * 74);
      ctx.rotate(an);
      const g = ctx.createLinearGradient(0, 0, 86, 0);
      g.addColorStop(0, 'rgba(255,214,130,0.95)');
      g.addColorStop(1, 'rgba(255,150,60,0.75)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(40, 0, 52, 26, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    const cg = ctx.createRadialGradient(fx, fy, 4, fx, fy, 46);
    cg.addColorStop(0, '#FFE9AE');
    cg.addColorStop(1, MD.honey);
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(fx, fy, 44, 0, TAU);
    ctx.fill();
    ctx.restore();
    label(ctx, 'NEKTAR · AIR 70%', fx, fy + 470, { size: 26, color: 'rgba(243,239,228,0.6)', track: 4, align: 'center' });
    // comb plate on the right, cells flooding
    const cx0 = 700, cy0 = 860, cw = 620, chh = 620;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx0, cy0, cw, chh);
    ctx.clip();
    hexGrid(ctx, cx0, cy0, cw, chh, 86, { a: 0.22, fill: 0.85 * eo(P(t, 1.4, 4.2)), t, fillA: 1.2 });
    ctx.restore();
    plateFrame(ctx, cx0 - 16, cy0 - 16, cw + 32, chh + 32, { a: 0.7 });
    label(ctx, 'SARANG · AIR TURUN KE 17%', cx0 + cw / 2, cy0 + chh + 60,
      { size: 26, color: MD.amber, track: 4, align: 'center' });
    // fanning arcs above the comb
    for (let i = 0; i < 3; i++) {
      const q = (t * 0.8 + i * 0.33) % 1;
      ctx.save();
      ctx.strokeStyle = `rgba(236,244,246,${0.35 * (1 - q)})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx0 + cw / 2, cy0 + 6, 60 + q * 95, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      ctx.restore();
    }
    // water leaving
    for (let i = 0; i < 4; i++) {
      const ph = ((t * 0.3 + i * 0.25) % 1);
      const wx = cx0 + 90 + i * 150;
      ctx.save();
      ctx.strokeStyle = `rgba(159,216,207,${0.6 * (1 - ph)})`;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(wx, cy0 - 40 - ph * 180);
      ctx.lineTo(wx, cy0 - 90 - ph * 180);
      ctx.moveTo(wx, cy0 - 90 - ph * 180);
      ctx.lineTo(wx - 8, cy0 - 76 - ph * 180);
      ctx.moveTo(wx, cy0 - 90 - ph * 180);
      ctx.lineTo(wx + 8, cy0 - 76 - ph * 180);
      ctx.stroke();
      ctx.restore();
    }
    // the commuter
    const bp = eo(P(t, 0.4, 2.2));
    const bx = 380 + bp * 300 + Math.sin(t * 1.3) * 26;
    const by = 1150 - bp * 380 + Math.sin(t * 2.1) * 20;
    bee(ctx, bx, by, 1.6, t, { tilt: -0.3 + bp * 0.5, trail: [[fx + 60, fy - 60], [520, 1000], [640, 860]] });
    chip(ctx, 'ENZIM DITAMBAHKAN', 430, 640, { p: P(t, cue(scene, 'enzim'), 0.5) });
    heading(ctx, 'DARI', '', 120, 400, { amber: 'NEKTAR', p: P(t, 0.35, 1.0), size: 110, sub: 'LEBAH MENGIPASI AIR SAMPAI HABIS' });
    ctx.restore();
    dust(ctx, t, 67, 26);
    vign(ctx, 0.5);
  },
};
