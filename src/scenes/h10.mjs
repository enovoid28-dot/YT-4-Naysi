// h10 OBAT MESIR KUNO — a papyrus medical sheet: glyph rows, an ochre
// wound-care diagram (bandage + honey drop) and the Hippocrates chip.
import { MD, tomb, dust, vign, papyrus, glyphRow, heading, chip, label, leader, drip,
  cue, P, eo, keys, frameOn, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 700, 1120, 1.06], [3, 720, 1090, 1.0], [scene.dur, 740, 1060, 1.05],
    ]);
    tomb(ctx, t, { hex: 0.025 });
    ctx.save();
    frameOn(ctx, cam);
    const px = 130, py = 560, pw = W - 260, ph = 1020;
    const pq = eo(P(t, 0.4, 1.0));
    ctx.save();
    ctx.globalAlpha = pq;
    papyrus(ctx, px, py, pw, ph, { seed: 9 });
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, pw, ph);
    ctx.clip();
    label(ctx, 'PAPIRUS MEDIS · MESIR KUNO', px + 70, py + 96,
      { size: 30, color: 'rgba(90,58,20,0.85)', track: 5 });
    ctx.strokeStyle = 'rgba(90,58,20,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + 70, py + 126);
    ctx.lineTo(px + pw - 70, py + 126);
    ctx.stroke();
    glyphRow(ctx, px + 70, py + 190, pw - 140, 14, 3, { s: 1.05 });
    glyphRow(ctx, px + 70, py + 260, pw - 140, 14, 6, { s: 1.05 });
    // wound diagram: forearm arc + linen bandage + honey drop
    const dy = py + 560;
    ctx.strokeStyle = 'rgba(170,110,60,0.85)';
    ctx.lineWidth = 74;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + 140, dy + 90);
    ctx.quadraticCurveTo(px + pw / 2, dy - 70, px + pw - 140, dy + 90);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(238,226,196,0.95)';
    ctx.lineWidth = 84;
    ctx.beginPath();
    ctx.moveTo(px + pw / 2 - 130, dy + 6);
    ctx.lineTo(px + pw / 2 + 130, dy + 6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(190,170,130,0.7)';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(px + pw / 2 + i * 52, dy - 36);
      ctx.lineTo(px + pw / 2 + i * 52, dy + 48);
      ctx.stroke();
    }
    const dq = eo(P(t, 2.6, 1.2));
    if (dq > 0) drip(ctx, px + pw / 2, dy - 190, 120 * dq, dq);
    label(ctx, 'MADU DI ATAS LUKA, DIBALUT LINEN', px + pw / 2, dy + 190,
      { size: 26, color: 'rgba(90,58,20,0.8)', track: 4, align: 'center' });
    glyphRow(ctx, px + 70, py + ph - 90, pw - 140, 14, 11, { s: 1.0 });
    ctx.restore();
    ctx.restore();
    leader(ctx, px + pw - 160, py + 120, px + pw + 40, py - 40, { col: 'rgba(245,208,140,0.6)' });
    chip(ctx, 'HIPPOCRATES · MADU + CUKA', W - 400, py - 70, { p: P(t, cue(scene, 'hippocrates'), 0.5) });
    heading(ctx, 'OBAT', '', 120, 400, { amber: 'LUKA', p: P(t, 0.35, 1.0), size: 110, sub: 'DARI PERSEMBAHAN SAMPAI PEMBALSAMAN' });
    ctx.restore();
    dust(ctx, t, 47, 24);
    vign(ctx, 0.5);
  },
};
