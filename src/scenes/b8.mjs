// b8 — ORKESTRA: every point sings every taste at nearly the same volume.
import {
  BK, desk, motion, withSheet, drawPage, greek, tongueMap, noteGlyph, penUnder, margin,
  typed, barsEqual, P, cue, eo, clamp, F, W, H, TAU,
} from './_buku.mjs';

const SX = 140, SY = 240, SW = 1160, SH = 1560;

const PTS = [[0, 180, 'UJUNG'], [-110, -40, 'SAMPING'], [0, -160, 'PANGKAL']];

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b8', SX, SY, SW, SH, { folio: '135', chapter: 'BAB VII · INDERA PERASA' });
    typed(ctx, 'LIDAH SEBAGAI ORKESTRA', SX + 100, SY + 220, { size: 30, font: F.mono6, color: BK.print, track: 4, p: P(t, 0.3, 0.5) });

    tongueMap(ctx, SX + 330, SY + 780, 1.15, P(t, 0.4, 0.8), { zones: false });
    // three sampled points, each with four equal bars
    PTS.forEach(([dx, dy, lbl], i) => {
      const q = P(t, cue(scene, 'titik', 0) + i * 0.7, 0.6);
      const px = SX + 330 + dx * 1.15;
      const py = SY + 780 + dy * 1.15;
      ctx.save();
      ctx.globalAlpha *= eo(q);
      ctx.fillStyle = BK.pen;
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, TAU);
      ctx.fill();
      ctx.restore();
      barsEqual(ctx, px + 40, py - 120, 150, 110, q, { vals: [0.9, 0.86, 0.92, 0.88], ink: BK.print });
      typed(ctx, lbl, px + 40, py + 26, { size: 24, font: F.mono6, color: BK.ink2, track: 3, p: q });
    });
    // floating notes
    [0, 1, 2, 3].forEach((i) => {
      const q = P(t, 1.2 + i * 0.5, 0.5);
      noteGlyph(ctx, SX + 760 + (i % 2) * 180, SY + 480 + Math.floor(i / 2) * 150, 0.9, q, { dy: -14 * eo(q) });
    });
    const vk = cue(scene, 'volume');
    typed(ctx, 'VOLUME NYARIS SAMA DI SETIAP TITIK', SX + 620, SY + 1080, { size: 29, font: F.mono6, color: BK.pen, track: 3, align: 'center', p: P(t, vk, 0.6) });
    penUnder(ctx, SX + 330, SY + 1110, 580, P(t, vk + 0.3, 0.6));
    margin(ctx, 'bukan zona, paduan suara', SX + 540, SY + 1220, { p: P(t, vk + 0.8, 0.7), rot: -0.02, size: 38 });
    greek(ctx, SX + 100, SY + 1320, SW - 200, 3, P(t, 1.6, 0.8));
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
