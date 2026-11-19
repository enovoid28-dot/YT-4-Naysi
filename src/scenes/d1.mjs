// d1 — JEJAK BOM: the molar with its locked enamel cap, the bomb that wrote it.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, leaderI, stamp, paperclip,
  caseTab, tooth, cloudGlyph, P, cue, eo, clamp, F, W, H, TAU,
} from './_dossier.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd1', SX, SY, SW, SH);
    paperclip(ctx, SX + SW - 150, SY - 16, { p: P(t, 0.15, 0.3), rot: 0.16 });
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-A', P(t, 0.08, 0.35));
    typed(ctx, 'JEJAK BOM NUKLIR', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'BARANG BUKTI: ENAMEL GIGI · REF. AMS-1963', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // the molar, centre-left; enamel lights when the VO says "bom nuklir"
    const ep = P(t, cue(scene, 'nuklir'), 0.9);
    tooth(ctx, SX + 380, SY + 830, 1.62, { p: P(t, 0.35, 0.7), ep });
    leaderI(ctx, SX + 470, SY + 560, SX + 620, SY + 470, P(t, cue(scene, 'tersimpan') || 0.8, 0.5), { elbow: [SX + 580, SY + 560] });
    typed(ctx, 'ENAMEL: LAPISAN TERKERAS', SX + 630, SY + 452, { size: 28, font: F.mono6, color: DO.ink, track: 2, p: P(t, cue(scene, 'tersimpan') || 0.9, 0.5) });
    typed(ctx, 'TERKUNCI SEJAK KECIL', SX + 630, SY + 492, { size: 28, font: F.mono6, color: DO.verm, track: 2, p: P(t, (cue(scene, 'tersimpan') || 0.9) + 0.25, 0.5) });

    // the bomb that signed it
    const cb = cue(scene, 'dingin');
    cloudGlyph(ctx, SX + 930, SY + 1120, 1.05, P(t, cb, 0.6));
    typed(ctx, 'UJI ATMOSFER', SX + 930, SY + 1180, { size: 30, font: F.mono6, color: DO.ink, track: 3, align: 'center', p: P(t, cb + 0.3, 0.5) });
    typed(ctx, '1945 – 1980', SX + 930, SY + 1222, { size: 30, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: P(t, cb + 0.5, 0.5) });

    hand(ctx, 'di dalam gigimu…', SX + 150, SY + 1330, { size: 56, color: DO.blue, p: P(t, cue(scene, 'gigimu'), 0.7) });
    stamp(ctx, 'TERBUKTI', SX + 900, SY + 1420, { p: P(t, cue(scene, 'miliaran') + 0.3, 0.45), rot: -0.1, size: 66 });
    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 01/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
