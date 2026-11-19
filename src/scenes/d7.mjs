// d7 — GADING ILEGAL: bomb-curve dating vs the 1989 global ban (CITES).
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, caseTab, tusk, tag, stamp,
  axisBox, P, cue, eo, e3, clamp, lerp, F, W, H, TAU,
} from './_dossier.mjs';
import { hit } from '../engine/look.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd7', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-G', P(t, 0.08, 0.35));
    typed(ctx, 'GADING ILEGAL', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'BOMB-CURVE · USIA GADING · CITES 1989', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // the tusk with its newly deposited base band
    const bp = P(t, cue(scene, 'mati'), 0.9);
    tusk(ctx, SX + 430, SY + 830, 1.5, { p: P(t, 0.3, 0.8), bp });
    tag(ctx, SX + 170, SY + 1240, 300, 120, { p: P(t, 0.6, 0.5), rot: 0.05 });
    typed(ctx, 'BARANG BUKTI No. 07', SX + 210, SY + 1300, { size: 28, font: F.mono6, color: DO.ink, track: 2, p: P(t, 0.8, 0.5) });
    typed(ctx, 'SITAAN PELABUHAN', SX + 210, SY + 1338, { size: 24, font: F.mono6, color: DO.ink2, track: 2, p: P(t, 0.9, 0.5) });

    // year axis on the right with the 1989 ban
    const ax = SX + 760, ay = SY + 430, ah = 760;
    axisBox(ctx, ax, ay, 10, ah, P(t, 0.5, 0.5));
    const Y = (yr) => ay + ((2020 - yr) / 70) * ah;
    for (const yr of [1950, 1963, 1989, 2020]) {
      ctx.save();
      ctx.strokeStyle = DO.ink2;
      ctx.lineWidth = 3;
      ctx.globalAlpha *= P(t, 0.6 + (2020 - yr) / 200, 0.4);
      ctx.beginPath();
      ctx.moveTo(ax - 10, Y(yr));
      ctx.lineTo(ax + 10, Y(yr));
      ctx.stroke();
      ctx.restore();
      typed(ctx, `${yr}`, ax + 26, Y(yr) + 10, { size: 28, font: F.mono6, color: yr === 1989 ? DO.verm : DO.ink2, track: 2, p: P(t, 0.7 + (2020 - yr) / 200, 0.4) });
    }
    // ban line
    const bl = P(t, cue(scene, 'larangan'), 0.6);
    ctx.save();
    ctx.strokeStyle = DO.verm;
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 10]);
    ctx.globalAlpha *= bl;
    ctx.beginPath();
    ctx.moveTo(ax - 120, Y(1989));
    ctx.lineTo(ax + 300, Y(1989));
    ctx.stroke();
    ctx.restore();
    typed(ctx, 'LARANGAN GLOBAL', ax + 30, Y(1989) - 46, { size: 30, font: F.mono6, color: DO.verm, track: 3, p: bl });

    // death-year marker sliding down into the illegal zone
    const dm = P(t, cue(scene, 'mati'), 1.0, e3);
    const my = lerp(Y(1975), Y(2006), dm);
    ctx.save();
    ctx.globalAlpha *= clamp(dm * 2);
    ctx.fillStyle = DO.verm;
    ctx.beginPath();
    ctx.arc(ax, my, 13, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = DO.verm;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax - 60, my);
    ctx.lineTo(ax - 14, my);
    ctx.stroke();
    ctx.restore();
    typed(ctx, 'MATI: 2006', ax - 70, my - 20, { size: 30, font: F.mono6, color: DO.verm, track: 2, align: 'right', p: P(t, cue(scene, 'mati') + 0.8, 0.5) });
    typed(ctx, '→ SETELAH 1989 = BURUAN ILEGAL', ax + 30, Y(2006) + 46, { size: 28, font: F.mono6, color: DO.ink, track: 2, p: P(t, cue(scene, 'delapan'), 0.6) });
    stamp(ctx, 'ILEGAL', SX + 900, SY + 1400, { p: P(t, cue(scene, 'ilegal'), 0.45), rot: -0.12, size: 72 });
    hit(t, cue(scene, 'ilegal'), 0.55, 0.3);
    hand(ctx, 'jam yang sama mengungkapnya', SX + 560, SY + 1414, { size: 40, color: DO.blue, p: P(t, cue(scene, 'jam'), 0.7) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 07/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
