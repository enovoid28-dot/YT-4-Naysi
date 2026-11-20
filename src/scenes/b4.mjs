// b4 — 1974: Collings re-tests; every region detects every basic taste.
import {
  BK, desk, motion, withSheet, drawPage, greek, tongueMap, penUnder, margin, typed,
  P, cue, eo, clamp, rng, F, W, H, TAU,
} from './_buku.mjs';
import { ambient, smudge } from './_buku.mjs';

const SX = 140, SY = 240, SW = 1160, SH = 1560;

const DOTS = [[0, 190], [-95, 60], [95, 60], [-120, -60], [120, -60], [0, -150], [-60, 130], [60, 130]];

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b4', SX, SY, SW, SH, { folio: '131', chapter: 'BAB VII · INDERA PERASA', footnote: "¹ percept. psychophys. 16, 119" });
    typed(ctx, '1974', SX + SW - 130, SY + 330, { size: 150, font: F.num6, color: BK.print, track: 0, align: 'right', p: P(t, 0.3, 0.6) });
    typed(ctx, 'COLLINGS · PERCEPTION & PSYCHOPHYSICS', SX + 100, SY + 220, { size: 26, font: F.mono6, color: BK.ink2, track: 3, p: P(t, 0.5, 0.5) });

    // tongue without zones, test loci lighting up one by one
    tongueMap(ctx, SX + 400, SY + 830, 1.25, P(t, 0.4, 0.8), { zones: false });
    const dp = cue(scene, 'empat');
    DOTS.forEach(([dx, dy], i) => {
      const q = P(t, dp + i * 0.22, 0.35);
      ctx.save();
      ctx.globalAlpha *= eo(q);
      ctx.fillStyle = BK.pen;
      ctx.beginPath();
      ctx.arc(SX + 400 + dx * 1.25, SY + 830 + dy * 1.25, 11, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = BK.pen;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(SX + 400 + dx * 1.25, SY + 830 + dy * 1.25, 22, 0, TAU);
      ctx.stroke();
      ctx.restore();
    });
    // legend: every locus answers all four
    const lg = cue(scene, 'regio');
    ['MANIS', 'ASIN', 'ASAM', 'PAHIT'].forEach((s, i) => {
      const q = P(t, lg + i * 0.25, 0.4);
      ctx.save();
      ctx.globalAlpha *= eo(q);
      ctx.fillStyle = BK.pen;
      ctx.beginPath();
      ctx.arc(SX + 776, SY + 610 + i * 56, 9, 0, TAU);
      ctx.fill();
      ctx.restore();
      typed(ctx, s, SX + 806, SY + 620 + i * 56, { size: 32, font: F.mono6, color: BK.print, track: 3, p: q });
    });
    typed(ctx, 'DI SEMUA TITIK UJI', SX + 750, SY + 880, { size: 26, font: F.mono6, color: BK.pen, track: 3, p: P(t, lg + 1.1, 0.5) });

    const ny = cue(scene, 'peta') - 0.3;
    penUnder(ctx, SX + 160, SY + 1240, 700, P(t, ny, 0.6));
    typed(ctx, 'PETA ZONA ITU TIDAK PERNAH NYATA', SX + 160, SY + 1300, { size: 36, font: F.mono6, color: BK.pen, track: 3, p: P(t, ny + 0.2, 0.6) });
    margin(ctx, 'kasus tertutup', SX + 760, SY + 1400, { p: P(t, ny + 0.6, 0.7) });
    greek(ctx, SX + 100, SY + 1400, SW - 200, 2, P(t, 1.8, 0.8));
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); ambient(ctx, t, 4); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
  ambient(ctx, t, 4);
}
