import { W, H, C, M, txt, hexA, fillRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { nightRoom, darkKicker, sheet, stamp, applyGrain, P } from './_ep5.mjs';
import { chipsBag, cakeSlice, iceTub, priceTag, softSeat } from './_props.mjs';

// 04 — ANGKA. The extra 385 kcal, as actual food on the counter with the
// price tags still on it.
const ITEMS = [
  { at: 1.2, x: 150, label: 'KERIPIK', value: '150' },
  { at: 2.6, x: 566, label: 'ROTI MANIS', value: '120' },
  { at: 4.0, x: 946, label: 'ES KRIM', value: '115' },
];

export default {
  draw(ctx, t) {
    nightRoom(ctx, { tableY: 1150, warm: 0.16 });
    darkKicker(ctx, 'YANG MASUK SETELAH MAKAN MALAM', { y: 292 });

    // ---- the three items --------------------------------------------------
    const a0 = EASE.outCubic(clamp((t - 0.15) / 0.6));
    ctx.save();
    ctx.globalAlpha = a0;

    softSeat(ctx, 300, 1156, 190, 0.55);
    chipsBag(ctx, 152, 800, 296, 356, { a: 1, rot: -0.05 });

    softSeat(ctx, 700, 1160, 220, 0.5);
    cakeSlice(ctx, 560, 856, 288, 300, { a: 1 });

    softSeat(ctx, 1136, 1164, 170, 0.5);
    iceTub(ctx, 1136, 892, 250, 272, { a: 1 });
    ctx.restore();

    // ---- price tags -------------------------------------------------------
    ITEMS.forEach((it, i) => {
      const a = EASE.outCubic(clamp((t - it.at) / 0.55));
      if (a <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = a;
      // string from above
      ctx.strokeStyle = 'rgba(226,208,176,0.35)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(it.x + 128, 300);
      ctx.lineTo(it.x + 128, 470 + lerp(-40, 0, a));
      ctx.stroke();
      priceTag(ctx, it.x + 24, 470 + lerp(-40, 0, a), {
        label: it.label, value: it.value, a, rot: i === 1 ? 0.04 : -0.03, w: 208, h: 124,
        size: 50,
      });
      ctx.restore();
    });

    // ---- the total --------------------------------------------------------
    const tA = EASE.outCubic(clamp((t - 6.2) / 0.7));
    if (tA > 0.01) {
      ctx.save();
      ctx.globalAlpha = tA;
      ctx.translate(W / 2, 1390 + lerp(30, 0, tA));
      ctx.rotate(-0.012);
      sheet(ctx, -540, -130, 1080, 300, { a: tA, rot: 0, lift: 0.9 });
      txt(ctx, '16 STUDI · 496 ORANG · AL KHATIB 2017', -540 + 42, -66, {
        size: 22, font: F.mono, color: 'rgba(23,19,16,0.52)', track: 1, maxWidth: 1000,
      });
      ctx.fillStyle = 'rgba(23,19,16,0.20)';
      ctx.fillRect(-540 + 42, -40, 996, 2);
      txt(ctx, 'TAMBAHAN PER HARI', -540 + 42, 60, {
        size: 30, font: F.mono6, color: 'rgba(23,19,16,0.62)', track: 4,
      });
      txt(ctx, '+385', 540 - 42, 96, {
        size: 132, font: F.mono6, color: P.red, align: 'right', track: -3,
      });
      txt(ctx, 'KKAL', -540 + 42, 118, {
        size: 40, font: F.mono6, color: 'rgba(23,19,16,0.7)', track: 5,
      });
      ctx.restore();
    }

    // ---- the line that ends the excuse ------------------------------------
    const kA = EASE.outCubic(clamp((t - 10.4) / 0.6));
    if (kA > 0.01) {
      ctx.save();
      ctx.globalAlpha = kA;
      ctx.translate(W / 2, 1660);
      ctx.rotate(-0.05);
      stamp(ctx, -measure(ctx, 'TANPA TAMBAHAN PEMBAKARAN', 30, F.mono6, 4) / 2 - 20, 0, 'TANPA TAMBAHAN PEMBAKARAN', {
        size: 30, color: P.red, rot: 0, a: kA * 0.92, padX: 20, padY: 12, font: F.mono6,
      });
      ctx.restore();
    }

    applyGrain(ctx, 0.055);
  },
};
