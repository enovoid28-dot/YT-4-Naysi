import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { nightRoom, darkKicker, cylinder, stamp, tag, applyGrain, P } from './_ep6.mjs';

// 04 — SEMBILAN PERSEN. The catch-up sleep, measured in a glass: a film of water
// at the bottom of a big cylinder that should have been full.
const CX = 420;
const TOP = 660;
const CW = 340;
const CH = 840;
const DEBT_H = 12;   // >12 h
const PAID_H = 1.1;  // 1,1 h

export default {
  draw(ctx, t) {
    nightRoom(ctx, { tableY: 1500, warm: 0.20 });

    darkKicker(ctx, 'YANG DIBAYARKAN', { y: 292 });

    const drain = EASE.inOutQuad(clamp((t - 9.1) / 1.3));
    const grow = EASE.outCubic(clamp((t - 1.0) / 1.8));
    const level = 0.09 * grow * (1 - drain);

    cylinder(ctx, CX, TOP, CW, CH, {
      level, color: '#C0392B', a: clamp((t - 0.4) / 0.6), label: 'UTANG: LEBIH 12 JAM', hourTicks: 12,
    });

    // the film of water we paid back
    const lA = clamp((t - 2.4) / 0.5);
    if (lA > 0.01) {
      const surf = TOP + CH - CH * level - 4;
      ctx.save();
      ctx.globalAlpha = lA * (1 - drain * 0.9);
      ctx.strokeStyle = hexA(P.amber, 0.75);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(CX + CW / 2 + 8, surf);
      ctx.lineTo(700, surf - 96);
      ctx.lineTo(860, surf - 96);
      ctx.stroke();
      txt(ctx, '1,1 JAM', 872, surf - 84, {
        size: 34, font: F.display, color: P.amber, track: -0.5,
      });
      txt(ctx, 'DARI 12+ JAM', 872, surf - 46, {
        size: 21, font: F.mono6, color: hexA('#F2E7D3', 0.55), track: 3,
      });
      ctx.restore();
    }

    // the verdict, big
    const vA = EASE.outCubic(clamp((t - 3.4) / 0.6));
    if (vA > 0.01) {
      const pct = 9;
      ctx.save();
      ctx.globalAlpha = vA;
      txt(ctx, String(pct), 862, 800, {
        size: 300, font: F.num, color: P.red, track: -6, glowBlur: 44, glowColor: 'rgba(194,57,43,0.45)',
      });
      const wNum = measure(ctx, String(pct), 300, F.num, -6);
      txt(ctx, '%', 862 + wNum + 6, 800, {
        size: 130, font: F.num6, color: P.red, track: -2,
      });
      ctx.fillStyle = 'rgba(242,231,211,0.22)';
      ctx.fillRect(862, 852, 470, 2);
      if (drain > 0.35) {
        ctx.save();
        ctx.globalAlpha = vA * clamp((drain - 0.35) / 0.5);
        const sl = clamp((drain - 0.35) / 0.5);
        ctx.strokeStyle = hexA(P.red, 0.95);
        ctx.lineWidth = 11;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(838, 762 - 22 * (1 - sl));
        ctx.lineTo(838 + 380 * sl, 700 - 22 * (1 - sl));
        ctx.stroke();
        ctx.restore();
      }
      txt(ctx, 'DARI UTANG SEMINGGU', 862, 902, {
        size: 24, font: F.mono6, color: hexA('#F2E7D3', 0.62), track: 4,
      });
      ctx.restore();
    }

    // the week, as a bracket under the number
    const bA = clamp((t - 5.2) / 0.6);
    if (bA > 0.01) {
      ctx.save();
      ctx.globalAlpha = bA * (1 - drain * 0.55);
      txt(ctx, '5 MALAM × 5 JAM', 862, 1000, {
        size: 26, font: F.mono6, color: hexA('#F2E7D3', 0.40), track: 3,
      });
      txt(ctx, 'BUTUH 8 JAM SEMALAM', 862, 1040, {
        size: 26, font: F.mono6, color: hexA('#F2E7D3', 0.40), track: 3,
      });
      ctx.restore();
    }

    // and it evaporates on Monday
    if (drain > 0.02) {
      ctx.save();
      ctx.globalAlpha = drain;
      txt(ctx, 'SENIN: NOL', 862, 1102, {
        size: 24, font: F.mono6, color: hexA(P.red, 0.75), track: 6,
      });
      ctx.restore();
    }
    const sA = clamp((t - 9.9) / 0.35);
    if (sA > 0.01) {
      ctx.save();
      ctx.translate(196, 1706);
      ctx.rotate(-0.07);
      stamp(ctx, 0, 0, 'HILANG SENIN', {
        size: 40, color: P.red, rot: 0, a: sA, padX: 24, padY: 12, font: F.mono6, track: 4,
      });
      ctx.restore();
    }

    void DEBT_H; void PAID_H; void tag;
    applyGrain(ctx, 0.055);
  },
};
