// d9 — TAHUN LAHIR: enamel birth-year dating (±1.5 yr), 2004 tsunami IDs.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, leaderI, caseTab, tag,
  axisBox, curveInk, P, cue, eo, e3, clamp, lerp, F, W, H, TAU,
} from './_dossier.mjs';
import { hit } from '../engine/look.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

const YEARS = [1950, 1955, 1960, 1963, 1966, 1970, 1975, 1980, 1990, 2000, 2010, 2020];
const PMC = [100, 104, 128, 198, 180, 150, 135, 125, 115, 108, 104, 101];

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd9', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-I', P(t, 0.08, 0.35));
    typed(ctx, 'TAHUN LAHIR', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'ENAMEL · AKURASI ±1,5 TAHUN · AMS', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // bomb curve, small, top-left
    const ax = SX + 170, ay = SY + 400, aw = 620, ah = 420;
    axisBox(ctx, ax, ay, aw, ah, P(t, 0.4, 0.5));
    const X = (yr) => ax + ((yr - 1950) / 70) * aw;
    const Y = (v) => ay + ah - ((v - 90) / 120) * ah;
    curveInk(ctx, YEARS.map((yr, i) => [X(yr), Y(PMC[i])]), P(t, 0.5, 1.4, e3), { color: DO.ink2, lw: 4 });
    typed(ctx, 'pMC', ax - 14, ay + 8, { size: 24, font: F.mono6, color: DO.ink3, track: 2, align: 'right', p: P(t, 0.7, 0.4) });
    typed(ctx, '1963', X(1963), ay + ah + 36, { size: 24, font: F.mono6, color: DO.ink3, track: 2, align: 'center', p: P(t, 0.8, 0.4) });

    // measured enamel value -> horizontal line -> intersection -> birth year
    const mv = P(t, cue(scene, 'lahirmu'), 1.0, e3);
    const valY = Y(150);
    ctx.save();
    ctx.strokeStyle = DO.verm;
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.globalAlpha *= mv;
    ctx.beginPath();
    ctx.moveTo(ax, valY);
    ctx.lineTo(X(1970), valY);
    ctx.lineTo(X(1970), ay + ah);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= clamp(mv * 1.6);
    ctx.fillStyle = DO.verm;
    ctx.beginPath();
    ctx.arc(X(1970), valY, 12, 0, TAU);
    ctx.fill();
    ctx.restore();
    typed(ctx, 'NILAI ENAMEL', ax + 8, valY - 18, { size: 26, font: F.mono6, color: DO.verm, track: 2, p: P(t, cue(scene, 'lahirmu') + 0.4, 0.5) });
    typed(ctx, 'TAHUN LAHIR', X(1970), ay + ah + 36, { size: 26, font: F.mono6, color: DO.verm, track: 2, align: 'center', p: P(t, cue(scene, 'lahirmu') + 0.6, 0.5) });

    // the accuracy figure
    typed(ctx, '±1,5', SX + SW - 150, SY + 560, { size: 150, font: F.num6, color: DO.verm, track: 0, align: 'right', p: P(t, cue(scene, 'lima'), 0.6) });
    typed(ctx, 'TAHUN', SX + SW - 150, SY + 620, { size: 40, font: F.mono6, color: DO.ink, track: 8, align: 'right', p: P(t, cue(scene, 'lima') + 0.35, 0.5) });
    hit(t, cue(scene, 'lima'), 0.45, 0.3);

    // tsunami identification
    const ts = cue(scene, 'tsunami');
    ctx.save();
    ctx.strokeStyle = DO.blue;
    ctx.lineWidth = 4;
    ctx.globalAlpha *= P(t, ts, 0.8);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let x = 0; x <= 520; x += 10) {
        const y = SY + 1020 + i * 34 + Math.sin(x / 46 + t * 1.4 + i) * 10;
        if (x === 0) ctx.moveTo(SX + 170 + x, y);
        else ctx.lineTo(SX + 170 + x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    typed(ctx, 'TSUNAMI SAMUDRA HINDIA', SX + 170, SY + 1160, { size: 32, font: F.mono6, color: DO.blue, track: 3, p: P(t, ts, 0.6) });
    typed(ctx, '26 DES 2004 · IDENTIFIKASI KORBAN', SX + 170, SY + 1204, { size: 28, font: F.mono6, color: DO.ink2, track: 3, p: P(t, ts + 0.4, 0.6) });
    tag(ctx, SX + 760, SY + 1060, 320, 130, { p: P(t, cue(scene, 'nama'), 0.6), rot: -0.04 });
    typed(ctx, 'MEMBERI NAMA', SX + 800, SY + 1120, { size: 30, font: F.mono6, color: DO.ink, track: 2, p: P(t, cue(scene, 'nama') + 0.2, 0.5) });
    typed(ctx, 'PARA KORBAN', SX + 800, SY + 1158, { size: 30, font: F.mono6, color: DO.verm, track: 2, p: P(t, cue(scene, 'nama') + 0.45, 0.5) });
    hand(ctx, 'tercatat di enamel…', SX + 200, SY + 1360, { size: 46, color: DO.blue, p: P(t, cue(scene, 'tercatat'), 0.7) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 09/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
