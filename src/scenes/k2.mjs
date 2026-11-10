import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { concreteWall, tape, stamp, paperKicker, applyGrain, P, Q } from './_ep7.mjs';

// 02 — DUA PULUH LIMA. A two-and-a-half metre tape stands on today's floor.
// The 2015 floor line is at its top; the slice it loses each year is at its base.
const FLOOR = 1600;
const TX = 470;
const LEN = 1150;      // 250 cm
const CM = LEN / 250;

export default {
  draw(ctx, t) {
    concreteWall(ctx, { wet: 1500 });
    paperKicker(ctx, 'JAKARTA UTARA', { y: 236 });

    // floor
    ctx.fillStyle = linGrad(ctx, 0, FLOOR, 0, H, [[0, '#8C8779'], [1, '#4C4840']]);
    ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = 'rgba(20,17,16,0.4)';
    ctx.fillRect(0, FLOOR, W, 4);

    // the doorway, as a scale reference: 2,1 m
    const dA = EASE.outCubic(clamp((t - 0.15) / 0.8));
    ctx.save();
    ctx.globalAlpha = dA;
    const dx = 880;
    const dw = 400;
    const dTop = 640;
    ctx.fillStyle = 'rgba(22,19,16,0.68)';
    ctx.fillRect(dx, dTop, dw, FLOOR - dTop);
    ctx.fillStyle = linGrad(ctx, 0, dTop, 0, dTop + 120, [[0, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(dx, dTop, dw, 120);
    ctx.fillStyle = linGrad(ctx, dx - 36, 0, dx, 0, [[0, '#DCD5C5'], [1, '#A9A294']]);
    ctx.fillRect(dx - 36, dTop - 30, 36, FLOOR - dTop + 30);
    ctx.fillRect(dx + dw, dTop - 30, 36, FLOOR - dTop + 30);
    ctx.fillStyle = linGrad(ctx, 0, dTop - 36, 0, dTop, [[0, '#E1DACA'], [1, '#ABA496']]);
    ctx.fillRect(dx - 36, dTop - 36, dw + 72, 36);
    ctx.restore();

    // the tape
    const tpA = EASE.outCubic(clamp((t - 0.5) / 0.9));
    if (tpA > 0.01) {
      ctx.save();
      ctx.globalAlpha = tpA;
      tape(ctx, TX, FLOOR, LEN * tpA, { up: true, max: 250, w: 62, labelEvery: 50 });
      ctx.restore();
    }

    // the slice that goes every year
    const yA = clamp((t - 3.0) / 0.5);
    if (yA > 0.01) {
      ctx.save();
      ctx.globalAlpha = yA;
      const y1 = FLOOR - 25 * CM;
      ctx.fillStyle = hexA(Q.rust, 0.22);
      ctx.fillRect(TX + 34, y1, 250, FLOOR - y1);
      ctx.fillStyle = hexA(Q.rust, 0.9);
      ctx.fillRect(TX + 34, y1 - 3, 250, 5);
      ctx.beginPath();
      ctx.moveTo(TX + 34, FLOOR);
      ctx.lineTo(TX + 34, y1);
      ctx.strokeStyle = hexA(Q.rust, 0.85);
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // the label, to the left of the tape
      ctx.save();
      ctx.globalAlpha = yA;
      fillRR(ctx, 96, FLOOR - 214, 344, 176, 12, 'rgba(20,17,16,0.86)');
      txt(ctx, '25 CM', 122, FLOOR - 148, {
        size: 62, font: F.num, color: Q.tape, track: -1,
      });
      txt(ctx, 'TURUN TIAP TAHUN', 122, FLOOR - 104, {
        size: 21, font: F.mono6, color: hexA('#F6EDD9', 0.72), track: 3,
      });
      txt(ctx, 'MULAI DARI LANTAI', 122, FLOOR - 62, {
        size: 20, font: F.mono6, color: hexA(Q.rust, 0.95), track: 3,
      });
      ctx.restore();
    }

    // where the floor was in 2015
    const lA = clamp((t - 6.4) / 0.6);
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lA;
      const yGone = FLOOR - 250 * CM;
      ctx.setLineDash([16, 12]);
      ctx.strokeStyle = 'rgba(20,17,16,0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, yGone);
      ctx.lineTo(W, yGone);
      ctx.stroke();
      ctx.setLineDash([]);
      fillRR(ctx, 96, yGone - 84, 372, 66, 10, 'rgba(20,17,16,0.84)');
      txt(ctx, 'LANTAI · 2015', 122, yGone - 38, {
        size: 32, font: F.mono6, color: '#F6EDD9', track: 4,
      });
      // the bracket that spans the ten years
      ctx.strokeStyle = hexA('#141110', 0.55);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(600, yGone);
      ctx.lineTo(600, FLOOR);
      ctx.stroke();
      [yGone, FLOOR].forEach((yy) => {
        ctx.beginPath();
        ctx.moveTo(586, yy);
        ctx.lineTo(614, yy);
        ctx.stroke();
      });
      txt(ctx, '2,5 M', 622, yGone + 300, {
        size: 46, font: F.num, color: Q.rust, track: -1,
      });
      txt(ctx, '10 TAHUN', 624, yGone + 344, {
        size: 22, font: F.mono6, color: hexA(Q.rust, 0.8), track: 4,
      });
      ctx.restore();
    }

    void stamp; void P; void C; void M; void measure; void lerp; void TAU; void radGrad; void strokeRR;
    applyGrain(ctx, 0.05);
  },
};
