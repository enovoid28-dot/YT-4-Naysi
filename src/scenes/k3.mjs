import { W, H, C, M, txt, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { nightRoom, darkKicker, glowSpot, sheet, stamp, arrow, applyGrain, P } from './_ep5.mjs';
import { testTube, rack, softSeat } from './_props.mjs';

// 03 — HORMON. Two blood tubes from a 2004 sleep study: one rises, one falls.
const T1 = { x: 330, w: 148, h: 720, y: 620 };
const T2 = { x: 862, w: 148, h: 720, y: 620 };

export default {
  draw(ctx, t) {
    nightRoom(ctx, { tableY: 1372, warm: 0.13, cold: 0.1, coldX: 0.5 });
    darkKicker(ctx, 'LAB TIDUR · 2004', { y: 292 });

    const sA = EASE.outCubic(clamp((t - 0.1) / 0.7));

    // rack sits on the bench
    softSeat(ctx, W / 2, 1420, 620, 0.6);
    rack(ctx, 150, 1290, W - 300, 150, { a: sA, label: '12 PRIA MUDA · 4 JAM × 2 MALAM' });

    // tubes: ghrelin rises, leptin falls
    const gLevel = lerp(0.34, 0.74, EASE.outCubic(clamp((t - 7.0) / 1.2)));
    const lLevel = lerp(0.74, 0.42, EASE.outCubic(clamp((t - 11.0) / 1.2)));

    ctx.save();
    ctx.globalAlpha = sA;
    testTube(ctx, T1.x, T1.y, T1.w, T1.h, { level: gLevel, color: '#B33A24', cap: '#26282A' });
    testTube(ctx, T2.x, T2.y, T2.w, T2.h, { level: lLevel, color: '#1E5F5B', cap: '#26282A' });
    ctx.restore();

    // baseline marks: where each level started
    const markLine = (tube, level, color, a) => {
      if (a <= 0.01) return;
      const y = tube.y + tube.h * (1 - level);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.moveTo(tube.x - 26, y);
      ctx.lineTo(tube.x + tube.w + 26, y);
      ctx.stroke();
      ctx.restore();
    };
    markLine(T1, 0.34, hexA('#F2E7D3', 0.35), clamp((t - 1.0) / 0.5));
    markLine(T2, 0.74, hexA('#F2E7D3', 0.35), clamp((t - 1.0) / 0.5));

    // names on the rack
    ctx.save();
    ctx.globalAlpha = sA;
    txt(ctx, 'GHRELIN', T1.x + T1.w / 2, 432, {
      size: 36, font: F.mono6, color: hexA('#F2E7D3', 0.92), align: 'center', track: 7,
    });
    txt(ctx, 'SINYAL LAPAR', T1.x + T1.w / 2, 478, {
      size: 22, font: F.mono, color: hexA('#F2E7D3', 0.45), align: 'center', track: 4,
    });
    txt(ctx, 'LEPTIN', T2.x + T2.w / 2, 432, {
      size: 36, font: F.mono6, color: hexA('#F2E7D3', 0.92), align: 'center', track: 7,
    });
    txt(ctx, 'SINYAL KENYANG', T2.x + T2.w / 2, 478, {
      size: 22, font: F.mono, color: hexA('#F2E7D3', 0.45), align: 'center', track: 4,
    });
    ctx.restore();

    // values appear with their sentence
    const v1 = EASE.outCubic(clamp((t - 8.0) / 0.6));
    if (v1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = v1;
      txt(ctx, '+28%', T1.x + T1.w / 2, 596, {
        size: 120, font: F.head, color: P.red, align: 'center', track: -2,
      });
      ctx.restore();
    }
    const v2 = EASE.outCubic(clamp((t - 11.9) / 0.6));
    if (v2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = v2;
      txt(ctx, '−18%', T2.x + T2.w / 2, 596, {
        size: 120, font: F.head, color: '#5FD3C6', align: 'center', track: -2,
      });
      ctx.restore();
    }

    // hunger rating slip, last beat
    const hA = EASE.outCubic(clamp((t - 15.2) / 0.7));
    if (hA > 0.01) {
      ctx.save();
      ctx.globalAlpha = hA;
      ctx.translate(W / 2, 1560 + lerp(26, 0, hA));
      ctx.rotate(-0.02);
      sheet(ctx, -330, -110, 660, 220, { a: hA, rot: 0, lift: 0.8 });
      txt(ctx, 'RASA LAPAR', -330 + 44, -40, {
        size: 30, font: F.mono6, color: 'rgba(23,19,16,0.6)', track: 4,
      });
      txt(ctx, 'subjektif, dilaporkan sendiri', -330 + 44, 2, {
        size: 20, font: F.mono, color: 'rgba(23,19,16,0.45)', track: 0,
      });
      txt(ctx, '+24%', 330 - 44, 34, {
        size: 108, font: F.head, color: P.red, align: 'right', track: -2,
      });
      ctx.restore();
    }

    // study stamp on the bench
    const stA = clamp((t - 2.0) / 0.35);
    if (stA > 0.01) {
      ctx.save();
      ctx.translate(W - 520, 900);
      ctx.rotate(-0.14);
      stamp(ctx, 0, 0, 'SPIEGEL 2004', {
        size: 30, color: hexA('#E2452F', 0.85), rot: 0, a: stA * 0.8, padX: 16, padY: 9, font: F.mono6,
      });
      ctx.restore();
    }

    void M; void radGrad; void glowSpot; void measure; void TAU; void fillRR; void linGrad; void arrow;
    applyGrain(ctx, 0.055);
  },
};
