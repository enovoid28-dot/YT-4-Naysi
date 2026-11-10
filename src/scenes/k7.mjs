import { W, H, C, M, txt, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { nightRoom, darkKicker, glowSpot, stamp, applyGrain, P } from './_ep5.mjs';
import { plate, snackPile, softSeat } from './_props.mjs';

// 07 — MITOS. A balance on the kitchen table: the 70 kcal you "burn" by staying
// up against the 385 kcal the short night actually adds.
export default {
  draw(ctx, t) {
    nightRoom(ctx, { tableY: 1560, warm: 0.14 });

    const a0 = EASE.outCubic(clamp((t - 0.2) / 0.7));
    const tip = EASE.outCubic(clamp((t - 9.8) / 0.9));

    // ---- stand -----------------------------------------------------------
    ctx.save();
    ctx.globalAlpha = a0;
    softSeat(ctx, W / 2, 1600, 380, 0.6);
    // base
    fillRR(ctx, W / 2 - 210, 1520, 420, 74, 10, '#2E2620');
    ctx.fillStyle = linGrad(ctx, 0, 1520, 0, 1594, [[0, '#6A5644'], [1, '#241C16']]);
    fillRR(ctx, W / 2 - 210, 1520, 420, 74, 10, ctx.fillStyle);
    // column
    ctx.fillStyle = linGrad(ctx, W / 2 - 16, 0, W / 2 + 16, 0, [
      [0, '#4A3A2C'], [0.4, '#8A7052'], [1, '#2A2018'],
    ]);
    ctx.fillRect(W / 2 - 16, 760, 32, 780);
    // pivot
    ctx.fillStyle = '#B08A5A';
    ctx.beginPath();
    ctx.arc(W / 2, 780, 22, 0, TAU);
    ctx.fill();
    ctx.restore();

    // ---- beam + pans ------------------------------------------------------
    const beamA = -0.015 + tip * 0.20; // tips towards the food
    ctx.save();
    ctx.globalAlpha = a0;
    ctx.translate(W / 2, 780);
    ctx.rotate(beamA);

    // beam
    ctx.fillStyle = linGrad(ctx, -420, 0, 420, 0, [
      [0, '#3A2C20'], [0.5, '#A9865A'], [1, '#3A2C20'],
    ]);
    ctx.fillRect(-430, -12, 860, 24);
    ctx.fillStyle = 'rgba(255,240,210,0.22)';
    ctx.fillRect(-430, -12, 860, 5);

    [-380, 380].forEach((px) => {
      ctx.fillStyle = '#8A7052';
      ctx.beginPath();
      ctx.arc(px, 0, 14, 0, TAU);
      ctx.fill();
    });
    ctx.restore();

    // pan positions follow the beam
    const panY = (side) => 780 + Math.sin(beamA) * side * 380;
    const leftX = W / 2 - Math.cos(beamA) * 380;
    const rightX = W / 2 + Math.cos(beamA) * 380;
    const leftY = panY(-1) + 250;
    const rightY = panY(1) + 250;

    const pan = (px, py, a) => {
      ctx.save();
      ctx.globalAlpha = a0 * a;
      // chains
      ctx.strokeStyle = 'rgba(200,180,150,0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py - 240);
      ctx.lineTo(px - 130, py);
      ctx.moveTo(px, py - 240);
      ctx.lineTo(px + 130, py);
      ctx.stroke();
      // dish
      ctx.fillStyle = linGrad(ctx, px - 150, py, px + 150, py + 40, [
        [0, '#8A7052'], [0.35, '#C9A878'], [1, '#4A3A2C'],
      ]);
      ctx.beginPath();
      ctx.ellipse(px, py + 10, 150, 34, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(px, py, 138, 26, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    };
    pan(leftX, leftY, 1);
    pan(rightX, rightY, 1);

    // left pan: a small weight
    const lA = EASE.outCubic(clamp((t - 8.2) / 0.6));
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = a0 * lA;
      fillRR(ctx, leftX - 54, leftY - 66, 108, 76, 8, '#3A4046');
      ctx.fillStyle = linGrad(ctx, 0, leftY - 66, 0, leftY + 10, [
        [0, '#8F9AA2'], [1, '#2B3238'],
      ]);
      fillRR(ctx, leftX - 54, leftY - 66, 108, 76, 8, ctx.fillStyle);
      txt(ctx, '70', leftX, leftY - 20, {
        size: 44, font: F.mono6, color: hexA('#F2E7D3', 0.92), align: 'center', track: 1,
      });
      ctx.restore();
    }

    // right pan: the pile
    const rA = EASE.outCubic(clamp((t - 9.4) / 0.7));
    if (rA > 0.01) {
      ctx.save();
      ctx.globalAlpha = a0 * rA;
      plate(ctx, rightX, rightY - 12, 148, { a: rA, ry: 34 });
      snackPile(ctx, rightX, rightY - 46, 200, 26, { a: rA, seed: 31 });
      txt(ctx, '385', rightX, rightY - 150, {
        size: 76, font: F.head, color: P.red, align: 'center', track: -2,
      });
      ctx.restore();
    }

    // ---- the note that starts it ------------------------------------------
    const nA = EASE.outCubic(clamp((t - 3.6) / 0.7));
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      ctx.translate(W / 2, 500);
      const label = '1 JAM TERJAGA = 17 KKAL';
      const tw = measure(ctx, label, 30, F.mono6, 5);
      ctx.fillStyle = 'rgba(233,220,190,0.90)';
      ctx.fillRect(-tw / 2 - 32, -46, tw + 64, 92);
      txt(ctx, label, 0, 12, {
        size: 30, font: F.mono6, color: 'rgba(30,24,18,0.86)', align: 'center', track: 5,
      });
      ctx.restore();
    }

    // verdict
    const sA = clamp((t - 13.2) / 0.4);
    if (sA > 0.01) {
      ctx.save();
      ctx.translate(W / 2 - 250, 1700);
      ctx.rotate(-0.04);
      stamp(ctx, 0, 0, 'TIDAK PERNAH MENANG', {
        size: 38, color: P.red, rot: 0, a: sA * 0.95, padX: 24, padY: 12, font: F.mono6,
      });
      ctx.restore();
    }

    void C; void H; void M; void glowSpot; void lerp;
    applyGrain(ctx, 0.055);
  },
};
