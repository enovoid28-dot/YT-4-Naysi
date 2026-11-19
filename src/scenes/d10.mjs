// d10 — UMUR SEL: gut 5 days, fat ~10%/yr, over half of heart cells from birth.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, caseTab, cellGlyph,
  P, cue, eo, e3, clamp, lerp, F, W, H, TAU,
} from './_dossier.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd10', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-J', P(t, 0.08, 0.35));
    typed(ctx, 'UMUR SEL-SELMU', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'KARBON-14 DNA · LAJU PERGANTIAN SEL', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    const cols = [
      { kind: 'gut', x: SX + 300, lbl: 'SEL USUS', cueW: 'usus', val: '5 HARI', n: 5, suf: '', cueV: 'lima' },
      { kind: 'fat', x: SX + 620, lbl: 'SEL LEMAK', cueW: 'lemak', val: '10% / THN', n: 10, suf: '', cueV: 'sepuluh' },
      { kind: 'heart', x: SX + 940, lbl: 'SEL JANTUNG', cueW: 'jantung', val: '>50% BAWAAN LAHIR', n: 0, suf: '', cueV: 'separuh' },
    ];
    for (const c of cols) {
      const cp = P(t, cue(scene, c.cueW), 0.7);
      cellGlyph(ctx, c.x, SY + 640, 128, { p: cp, kind: c.kind, t, acc: c.kind === 'heart' ? DO.verm : DO.blue });
      typed(ctx, c.lbl, c.x, SY + 830, { size: 30, font: F.mono6, color: DO.ink, track: 3, align: 'center', p: P(t, cue(scene, c.cueW) + 0.2, 0.5) });
      if (c.n) {
        const vp = P(t, cue(scene, c.cueV), 0.8, e3);
        typed(ctx, `${Math.round(c.n * vp)}${c.kind === 'fat' ? '%' : ''}`, c.x, SY + 960, { size: 96, font: F.num6, color: DO.verm, track: 0, align: 'center', p: P(t, cue(scene, c.cueV), 0.4) });
        typed(ctx, c.kind === 'fat' ? 'DIGANTI PER TAHUN' : 'HARI', c.x, SY + 1010, { size: 28, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: P(t, cue(scene, c.cueV) + 0.4, 0.5) });
      } else {
        typed(ctx, '>50%', c.x, SY + 960, { size: 96, font: F.num6, color: DO.verm, track: 0, align: 'center', p: P(t, cue(scene, 'separuh'), 0.5) });
        typed(ctx, 'SEJAK LAHIR', c.x, SY + 1010, { size: 28, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: P(t, cue(scene, 'lahir'), 0.5) });
      }
      // divider
      if (c.x !== SX + 940) {
        ctx.save();
        ctx.strokeStyle = DO.ink3;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        ctx.globalAlpha *= P(t, 0.8, 0.5);
        ctx.beginPath();
        ctx.moveTo(c.x + 160, SY + 500);
        ctx.lineTo(c.x + 160, SY + 1030);
        ctx.stroke();
        ctx.restore();
      }
    }
    hand(ctx, 'jam yang sama membocorkannya', SX + 200, SY + 1200, { size: 46, color: DO.blue, p: P(t, cue(scene, 'membocorkan'), 0.7) });
    typed(ctx, 'DNA MENGINGAT KARBON TAHUN LAHIRNYA', SX + SW / 2, SY + 1330, { size: 32, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: P(t, cue(scene, 'umur'), 0.6) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 10/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
