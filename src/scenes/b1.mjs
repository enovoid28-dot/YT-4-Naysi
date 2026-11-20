// b1 — PETA SALAH: the classroom tongue map, crossed out in red pen.
import {
  BK, desk, motion, withSheet, drawPage, greek, tongueMap, penCircle, penX, handStamp,
  margin, typed, ruleI, P, cue, eo, clamp, F, W, H,
} from './_buku.mjs';
import { ambient, smudge } from './_buku.mjs';
import { hit } from '../engine/look.mjs';

const SX = 140, SY = 240, SW = 1160, SH = 1560;

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b1', SX, SY, SW, SH, { folio: '128', chapter: 'BAB VII · INDERA PERASA', footnote: "¹ masih dicetak ulang sampai hari ini" });
    greek(ctx, SX + 100, SY + 170, SW - 200, 2, P(t, 0.2, 0.6));

    // the mythical map, printed
    const mp = P(t, 0.35, 0.8);
    tongueMap(ctx, SX + 420, SY + 830, 1.3, mp, { zones: true });
    typed(ctx, 'MANIS', SX + 420, SY + 1220, { size: 34, font: F.mono6, color: BK.print, track: 4, align: 'center', p: P(t, 0.9, 0.4) });
    typed(ctx, 'ASIN', SX + 150, SY + 800, { size: 34, font: F.mono6, color: BK.print, track: 4, align: 'right', p: P(t, 1.0, 0.4) });
    typed(ctx, 'ASAM', SX + 700, SY + 800, { size: 34, font: F.mono6, color: BK.print, track: 4, p: P(t, 1.0, 0.4) });
    typed(ctx, 'PAHIT', SX + 420, SY + 470, { size: 34, font: F.mono6, color: BK.print, track: 4, align: 'center', p: P(t, 1.1, 0.4) });
    typed(ctx, 'Gbr. 7.1 — “peta rasa”', SX + 700, SY + 1220, { size: 26, font: F.mono6, color: BK.ink2, track: 2, p: P(t, 1.2, 0.4) });

    // the red pen arrives with the VO
    const xs = cue(scene, 'salah');
    smudge(ctx, SX + 260, SY + 640, 340, 380, P(t, xs - 0.35, 0.5));
    penCircle(ctx, SX + 420, SY + 830, 250, 330, P(t, xs - 0.15, 0.7));
    penX(ctx, SX + 420, SY + 830, 190, P(t, xs + 0.15, 0.5));
    hit(t, xs + 0.2, 0.5, 0.3);
    handStamp(ctx, 'SALAH', SX + 880, SY + 620, { p: P(t, xs + 0.55, 0.4), rot: -0.16 });
    margin(ctx, 'sudah seabad!', SX + 700, SY + 1360, { p: P(t, cue(scene, 'seabad'), 0.7) });
    greek(ctx, SX + 100, SY + 1385, SW - 200, 2, P(t, 1.4, 0.8));
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); ambient(ctx, t, 1); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
  ambient(ctx, t, 1);
}
