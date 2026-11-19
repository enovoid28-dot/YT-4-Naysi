// d11 — JAM PADAM: the Suess effect dilutes the bomb signature back to ~100 pMC.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, caseTab, stackGlyph,
  clockDial, axisBox, curveInk, P, cue, eo, e3, clamp, lerp, F, W, H, TAU,
} from './_dossier.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

const YEARS = [1950, 1955, 1960, 1963, 1966, 1970, 1975, 1980, 1990, 2000, 2010, 2020, 2026];
const PMC = [100, 104, 128, 198, 180, 150, 135, 125, 115, 108, 104, 100, 98];

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd11', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-K', P(t, 0.08, 0.35));
    typed(ctx, 'JAM PADAM', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'EFEK SUESS · KARBON PURBA TANPA C-14', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // fossil smokestacks pouring dead carbon
    const sp = P(t, cue(scene, 'batu'), 0.7);
    stackGlyph(ctx, SX + 260, SY + 700, 1.15, sp, t, { color: DO.ink2 });
    stackGlyph(ctx, SX + 420, SY + 740, 0.85, P(t, cue(scene, 'batu') + 0.3, 0.7), t + 2, { color: DO.ink2 });
    typed(ctx, 'BATU BARA & MINYAK', SX + 330, SY + 800, { size: 28, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: P(t, cue(scene, 'batu') + 0.5, 0.5) });
    typed(ctx, 'KARBON PURBA · 0 pMC', SX + 330, SY + 840, { size: 28, font: F.mono6, color: DO.verm, track: 3, align: 'center', p: P(t, cue(scene, 'purba'), 0.5) });

    // the dial switching off
    const dim = P(t, cue(scene, 'mengencerkan'), 2.6, e3);
    clockDial(ctx, SX + 900, SY + 620, 130, { p: P(t, 0.5, 0.6), dim: dim * 0.85, ang: -0.7 + t * 0.22 * (1 - dim) });
    typed(ctx, 'JAM C-14', SX + 900, SY + 800, { size: 28, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: P(t, 0.8, 0.5) });
    typed(ctx, '→ PADAM', SX + 900, SY + 842, { size: 32, font: F.mono6, color: DO.verm, track: 3, align: 'center', p: P(t, cue(scene, 'mengencerkan') + 1.4, 0.6) });

    // the curve sinking back under natural
    const ax = SX + 170, ay = SY + 950, aw = SW - 360, ah = 420;
    axisBox(ctx, ax, ay, aw, ah, P(t, 0.5, 0.5));
    const X = (yr) => ax + ((yr - 1950) / 76) * aw;
    const Y = (v) => ay + ah - ((v - 90) / 120) * ah;
    ctx.save();
    ctx.strokeStyle = DO.ink3;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.globalAlpha *= P(t, 0.7, 0.5);
    ctx.beginPath();
    ctx.moveTo(ax, Y(100));
    ctx.lineTo(ax + aw, Y(100));
    ctx.stroke();
    ctx.restore();
    typed(ctx, 'ALAMIAH 100', ax + aw - 6, Y(100) - 12, { size: 24, font: F.mono6, color: DO.ink3, track: 2, align: 'right', p: P(t, 0.8, 0.4) });
    curveInk(ctx, YEARS.map((yr, i) => [X(yr), Y(PMC[i])]), P(t, cue(scene, 'batas'), 3.2, e3), { color: DO.verm, lw: 6 });
    const dp = P(t, cue(scene, 'batas'), 3.2, e3);
    if (dp >= 1) {
      ctx.save();
      ctx.globalAlpha *= P(t, cue(scene, 'tumbuh'), 1.2);
      ctx.fillStyle = DO.verm;
      ctx.beginPath();
      ctx.arc(X(2026), Y(98), 12, 0, TAU);
      ctx.fill();
      ctx.restore();
      typed(ctx, 'BAHAN BARU: KEMBALI KE ~100', X(2026), Y(98) - 26, { size: 28, font: F.mono6, color: DO.verm, track: 2, align: 'right', p: P(t, cue(scene, 'tumbuh'), 0.6) });
    }
    hand(ctx, 'jam ini perlahan kehilangan ketepatannya', SX + 200, SY + 1460, { size: 42, color: DO.blue, p: P(t, cue(scene, 'kehilangan'), 0.8) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 11/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
