// d3 — WAKTU PARUH: 5,730 years is perfect for mummies, blind for modern things.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, caseTab, axisBox, curveInk,
  redact, clockDial, P, cue, eo, e3, clamp, lerp, F, W, H, TAU,
} from './_dossier.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd3', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-C', P(t, 0.08, 0.35));
    typed(ctx, 'WAKTU PARUH', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'PELURUHAN KARBON-14 · PARUH 5.730 TAHUN', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // decay curve
    const ax = SX + 150, ay = SY + 400, aw = SW - 320, ah = 560;
    axisBox(ctx, ax, ay, aw, ah, P(t, 0.5, 0.5));
    typed(ctx, '100%', ax - 14, ay + 10, { size: 26, font: F.mono6, color: DO.ink2, track: 2, align: 'right', p: P(t, 0.7, 0.4) });
    typed(ctx, '50%', ax - 14, ay + ah / 2 + 8, { size: 26, font: F.mono6, color: DO.ink2, track: 2, align: 'right', p: P(t, cue(scene, 'paruh'), 0.4) });
    typed(ctx, '0', ax - 14, ay + ah + 8, { size: 26, font: F.mono6, color: DO.ink2, track: 2, align: 'right', p: P(t, 0.7, 0.4) });
    // half line
    ctx.save();
    ctx.strokeStyle = DO.ink3;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.globalAlpha *= P(t, cue(scene, 'paruh'), 0.6);
    ctx.beginPath();
    ctx.moveTo(ax, ay + ah / 2);
    ctx.lineTo(ax + aw * 0.52, ay + ah / 2);
    ctx.moveTo(ax + aw * 0.52, ay + ah / 2);
    ctx.lineTo(ax + aw * 0.52, ay + ah);
    ctx.stroke();
    ctx.restore();
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const u = i / 60;
      pts.push([ax + u * aw, ay + ah * (1 - Math.pow(0.5, u * 2.2))]);
    }
    curveInk(ctx, pts, P(t, cue(scene, 'meluruh'), 1.6), { color: DO.blue, lw: 6 });
    typed(ctx, '0', ax + 6, ay + ah + 40, { size: 26, font: F.mono6, color: DO.ink2, track: 2, p: P(t, 0.8, 0.4) });
    typed(ctx, '5.730 THN', ax + aw * 0.52, ay + ah + 40, { size: 26, font: F.mono6, color: DO.ink2, track: 2, align: 'center', p: P(t, cue(scene, 'paruh') + 0.3, 0.4) });
    typed(ctx, '11.460 THN', ax + aw, ay + ah + 40, { size: 26, font: F.mono6, color: DO.ink2, track: 2, align: 'right', p: P(t, 0.9, 0.4) });

    // the big number
    const bn = P(t, cue(scene, 'lima'), 0.8);
    typed(ctx, '5.730', SX + SW - 150, SY + 620, { size: 150, font: F.num6, color: DO.verm, track: 0, align: 'right', p: bn });
    typed(ctx, 'TAHUN', SX + SW - 150, SY + 680, { size: 40, font: F.mono6, color: DO.ink, track: 8, align: 'right', p: P(t, cue(scene, 'lima') + 0.4, 0.5) });
    clockDial(ctx, SX + SW - 260, SY + 860, 92, { p: P(t, cue(scene, 'lima') + 0.6, 0.6), ang: -0.9 + t * 0.05 });

    // modern objects: blind
    const mb = cue(scene, 'buta');
    typed(ctx, 'BENDA MODERN (± 50 TAHUN):', SX + 150, SY + 1180, { size: 34, font: F.mono6, color: DO.ink, track: 2, p: P(t, mb - 0.4, 0.5) });
    typed(ctx, 'SELISIH SINYAL HAMPIR NOL', SX + 150, SY + 1240, { size: 34, font: F.mono6, color: DO.ink2, track: 2, p: P(t, mb - 0.2, 0.5) });
    redact(ctx, SX + 148, SY + 1208, 620, 46, P(t, mb, 0.6));
    hand(ctx, 'hampir buta!', SX + 820, SY + 1290, { size: 52, color: DO.verm, p: P(t, mb + 0.3, 0.6), rot: -0.05 });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 03/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
