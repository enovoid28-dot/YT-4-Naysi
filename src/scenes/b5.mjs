// b5 — KUNCUP RASA: the real anatomy — buds, cells, two-week turnover.
import {
  BK, desk, motion, withSheet, drawPage, greek, budSection, leaderI, typed, margin, idNum,
  P, cue, eo, e3, clamp, F, W, H,
} from './_buku.mjs';

const leader0 = leaderI;

const SX = 140, SY = 240, SW = 1160, SH = 1560;

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b5', SX, SY, SW, SH, { folio: '132', chapter: 'BAB VII · INDERA PERASA' });
    typed(ctx, 'ANATOMI YANG NYATA', SX + 100, SY + 220, { size: 30, font: F.mono6, color: BK.print, track: 4, p: P(t, 0.3, 0.5) });
    greek(ctx, SX + 100, SY + 260, SW - 200, 2, P(t, 0.4, 0.6));

    // papilla cross-section, the pen lights one cell column
    const bp = cue(scene, 'kuncup');
    budSection(ctx, SX + 400, SY + 830, 1.7, P(t, 0.4, 0.8), { glow: P(t, bp, 0.8) });
    leader0(ctx, SX + 400, SY + 660, SX + 640, SY + 620, P(t, bp + 0.2, 0.5), { elbow: [SX + 560, SY + 660], color: BK.print2 });
    typed(ctx, 'KUNCUP RASA', SX + 650, SY + 632, { size: 30, font: F.mono6, color: BK.print, track: 3, p: P(t, bp + 0.4, 0.5) });
    leader0(ctx, SX + 430, SY + 900, SX + 640, SY + 960, P(t, bp + 0.6, 0.5), { elbow: [SX + 560, SY + 900], color: BK.print2 });
    typed(ctx, 'SEL PENGECAP', SX + 650, SY + 972, { size: 30, font: F.mono6, color: BK.print, track: 3, p: P(t, bp + 0.8, 0.5) });
    leader0(ctx, SX + 400, SY + 1090, SX + 640, SY + 1140, P(t, bp + 1.0, 0.5), { elbow: [SX + 560, SY + 1090], color: BK.print2 });
    typed(ctx, 'SARAF KE OTAK', SX + 650, SY + 1152, { size: 30, font: F.mono6, color: BK.print, track: 3, p: P(t, bp + 1.2, 0.5) });

    // the numbers, counted up with the VO
    const c1 = cue(scene, 'sepuluh');
    const n1 = Math.round(10000 * e3(P(t, c1, 1.2)));
    typed(ctx, idNum(n1), SX + SW - 120, SY + 470, { size: 108, font: F.num6, color: BK.pen, track: 0, align: 'right', p: P(t, c1, 0.4) });
    typed(ctx, 'KUNCUP RASA DI LIDAHMU', SX + SW - 120, SY + 516, { size: 26, font: F.mono6, color: BK.ink, track: 3, align: 'right', p: P(t, c1 + 0.5, 0.5) });
    const c2 = cue(scene, 'lima');
    typed(ctx, '50–100 SEL / KUNCUP', SX + SW - 120, SY + 700, { size: 30, font: F.mono6, color: BK.print, track: 2, align: 'right', p: P(t, c2, 0.5) });
    const c3 = cue(scene, 'dua');
    typed(ctx, 'GANTI BARU ± 2 MINGGU', SX + SW - 120, SY + 764, { size: 30, font: F.mono6, color: BK.print, track: 2, align: 'right', p: P(t, c3, 0.5) });
    typed(ctx, 'MEMBACA SEMUA RASA', SX + SW - 120, SY + 828, { size: 30, font: F.mono6, color: BK.pen, track: 2, align: 'right', p: P(t, cue(scene, 'membaca') || c3 + 1.2, 0.5) });
    margin(ctx, 'bukan peta, jaringan hidup', SX + 180, SY + 1330, { p: P(t, c3 + 0.8, 0.7) });
    greek(ctx, SX + 100, SY + 1400, SW - 200, 2, P(t, 1.8, 0.8));
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
