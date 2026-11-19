// d5 — PUNCAK: the 1963 bomb pulse peak (~2x natural) and the post-treaty fall.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, caseTab, axisBox, curveInk,
  P, cue, cueEnd, eo, e3, clamp, lerp, F, W, H, TAU,
} from './_dossier.mjs';
import { hit } from '../engine/look.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

// bomb pulse, 1950..2025, in pMC (NH): flat 100, spike ~198 in 1963, decline
const YEARS = [1950, 1955, 1958, 1960, 1962, 1963, 1964, 1966, 1970, 1975, 1980, 1990, 2000, 2010, 2020, 2025];
const PMC = [100, 104, 118, 128, 168, 198, 188, 170, 150, 135, 125, 115, 108, 104, 101, 100];

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd5', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-E', P(t, 0.08, 0.35));
    typed(ctx, 'PUNCAK KURVA', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'KARBON-14 ATMOSFER · pMC · 1950 – 2025', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    const ax = SX + 170, ay = SY + 420, aw = SW - 360, ah = 780;
    axisBox(ctx, ax, ay, aw, ah, P(t, 0.45, 0.5));
    const X = (yr) => ax + ((yr - 1950) / 75) * aw;
    const Y = (v) => ay + ah - ((v - 90) / 120) * ah;
    // gridline + labels
    for (const v of [100, 150, 200]) {
      ctx.save();
      ctx.strokeStyle = v === 100 ? DO.ink3 : DO.graph5;
      ctx.lineWidth = 2;
      ctx.setLineDash(v === 100 ? [] : [8, 8]);
      ctx.globalAlpha *= P(t, 0.6, 0.5);
      ctx.beginPath();
      ctx.moveTo(ax, Y(v));
      ctx.lineTo(ax + aw, Y(v));
      ctx.stroke();
      ctx.restore();
      typed(ctx, `${v}`, ax - 16, Y(v) + 9, { size: 26, font: F.mono6, color: DO.ink2, track: 2, align: 'right', p: P(t, 0.7, 0.4) });
    }
    typed(ctx, 'ALAMIAH', ax + aw, Y(100) + 40, { size: 24, font: F.mono6, color: DO.ink3, track: 3, align: 'right', p: P(t, 0.8, 0.4) });
    for (const yr of [1950, 1963, 1980, 2000, 2025]) {
      typed(ctx, `${yr}`, X(yr), ay + ah + 42, { size: 26, font: F.mono6, color: yr === 1963 ? DO.verm : DO.ink2, track: 2, align: 'center', p: P(t, 0.7 + (yr - 1950) / 100, 0.4) });
    }

    // the pulse draws on with the VO
    const pts = YEARS.map((yr, i) => [X(yr), Y(PMC[i])]);
    const dp = P(t, cue(scene, 'puncaknya'), 3.4, e3);
    curveInk(ctx, pts, dp, { color: DO.verm, lw: 7 });

    // travelling dot at the draw head
    if (dp > 0 && dp < 1) {
      const idx = dp * (pts.length - 1);
      const i0 = Math.floor(idx);
      const f = idx - i0;
      const [dx, dy] = [lerp(pts[i0][0], pts[Math.min(i0 + 1, pts.length - 1)][0], f), lerp(pts[i0][1], pts[Math.min(i0 + 1, pts.length - 1)][1], f)];
      ctx.save();
      ctx.fillStyle = DO.verm;
      ctx.beginPath();
      ctx.arc(dx, dy, 12, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // 1963 annotations
    const pk = P(t, cue(scene, 'enam'), 0.5);
    ctx.save();
    ctx.strokeStyle = DO.verm;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.globalAlpha *= pk;
    ctx.beginPath();
    ctx.moveTo(X(1963), Y(198));
    ctx.lineTo(X(1963), ay + ah);
    ctx.stroke();
    ctx.restore();
    typed(ctx, '1963', X(1963), Y(198) - 60, { size: 64, font: F.num6, color: DO.verm, track: 2, align: 'center', p: pk });
    typed(ctx, '± 2× ALAMIAH', X(1963) + 30, Y(198) - 16, { size: 32, font: F.mono6, color: DO.ink, track: 3, p: P(t, cue(scene, 'kali'), 0.5) });
    hit(t, cue(scene, 'enam'), 0.55, 0.3);

    // treaty line + decline label
    const tr = P(t, cue(scene, 'dilarang'), 0.6);
    ctx.save();
    ctx.strokeStyle = DO.blue;
    ctx.lineWidth = 4;
    ctx.globalAlpha *= tr;
    ctx.beginPath();
    ctx.moveTo(X(1964), ay);
    ctx.lineTo(X(1964), ay + ah);
    ctx.stroke();
    ctx.restore();
    typed(ctx, 'LARANGAN UJI ATMOSFER', X(1964) + 18, ay + 40, { size: 26, font: F.mono6, color: DO.blue, track: 3, p: tr });
    typed(ctx, 'KURVA TURUN CEPAT →', SX + SW - 170, Y(130), { size: 30, font: F.mono6, color: DO.ink2, track: 3, align: 'right', p: P(t, cue(scene, 'turun'), 0.6) });
    hand(ctx, 'tanda waktu yang tajam', SX + 210, SY + 1420, { size: 48, color: DO.blue, p: P(t, cue(scene, 'tajam'), 0.7) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 05/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
