// b2 — 1901: Hänig's real data — thresholds barely differ across the tongue.
import {
  BK, desk, motion, withSheet, drawPage, greek, barsEqual, penArrow, penUnder, margin,
  typed, P, cue, eo, clamp, F, W, H,
} from './_buku.mjs';

const SX = 140, SY = 240, SW = 1160, SH = 1560;

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b2', SX, SY, SW, SH, { folio: '129', chapter: 'BAB VII · INDERA PERASA' });
    typed(ctx, '1901', SX + SW - 130, SY + 330, { size: 150, font: F.num6, color: BK.print, track: 0, align: 'right', p: P(t, 0.3, 0.6) });
    typed(ctx, 'ZUR PSYCHOPHYSIK DES GESCHMACKSSINNES', SX + 100, SY + 220, { size: 26, font: F.mono6, color: BK.ink2, track: 3, p: P(t, 0.5, 0.5) });
    greek(ctx, SX + 100, SY + 260, SW - 200, 2, P(t, 0.4, 0.6));

    // the measured bars: almost equal
    const bp = P(t, cue(scene, 'hänig'), 1.6, eo);
    barsEqual(ctx, SX + 170, SY + 520, 800, 460, bp);
    typed(ctx, 'AMBANG DETEKSI PER TITIK LIDAH', SX + 170, SY + 1040, { size: 28, font: F.mono6, color: BK.print, track: 3, p: P(t, cue(scene, 'hänig') + 0.6, 0.5) });
    typed(ctx, 'ujung → pangkal', SX + 970, SY + 1082, { size: 24, font: F.mono6, color: BK.ink2, track: 2, align: 'right', p: P(t, cue(scene, 'hänig') + 0.9, 0.5) });

    // the pen: the differences are tiny
    const tp = cue(scene, 'tipis');
    penUnder(ctx, SX + 170, SY + 1120, 560, P(t, tp, 0.6));
    typed(ctx, 'SELISIHNYA TIPIS — BUKAN ZONA', SX + 170, SY + 1180, { size: 34, font: F.mono6, color: BK.pen, track: 3, p: P(t, tp + 0.2, 0.6) });
    penArrow(ctx, SX + 880, SY + 1150, SX + 620, SY + 640, P(t, tp + 0.5, 0.6), { bow: 0.3 });
    margin(ctx, 'hampir rata!', SX + 760, SY + 1300, { p: P(t, tp + 0.8, 0.7) });
    greek(ctx, SX + 100, SY + 1360, SW - 200, 3, P(t, 1.6, 0.8));
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
