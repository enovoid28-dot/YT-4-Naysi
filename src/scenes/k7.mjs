import { W, H, C, M, txt, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { dawn, kicker, chip, card, hairline } from './_ep4.mjs';

// 07 — MITOS. Three claims that survive because nobody checks them.
const ROWS = [
  { claim: 'Snooze merusak otak', verdict: 'BELUM TERBUKTI', color: C.bone, at: 0.5 },
  { claim: 'Snooze menambah tidur', verdict: 'SALAH', color: C.red, at: 2.4 },
  { claim: 'Lima menit cukup untuk pulih', verdict: 'TIDAK', color: C.red, at: 4.3 },
];

export default {
  draw(ctx, t) {
    dawn(ctx, { top: '#06080F', mid: '#090E19', bot: '#0B1320', warmX: 0.5, warmA: 0.05 });

    kicker(ctx, 'TIGA YANG SERING DIKIRA BENAR');

    ROWS.forEach((r, i) => {
      const a = EASE.outCubic(clamp((t - r.at) / 0.6));
      if (a <= 0.01) return;
      const y = 418 + i * 410;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(lerp(0, 0, a), lerp(30, 0, a));
      card(ctx, M, y, W - 2 * M, 356, { r: 32, fill: 'rgba(255,255,255,0.032)' });
      txt(ctx, `0${i + 1}`, W - M - 42, y + 78, {
        size: 24, font: F.num6, color: hexA(C.bone, 0.3), align: 'right', track: 2,
      });
      txt(ctx, r.claim, M + 44, y + 172, {
        size: 58, font: F.semi, color: C.bone, maxWidth: W - 2 * M - 88, minSize: 34,
      });
      chip(ctx, M + 44, y + 232, r.verdict, { size: 28, color: r.color, padX: 26, h: 68, track: 3.5 });
      ctx.restore();
    });

    const nA = clamp((t - 6.2) / 0.7);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA * 0.9;
      hairline(ctx, M, 1636, W - M, 1636, { color: C.bone, alpha: 0.12, lw: 2 });
      txt(ctx, 'YANG SALAH BUKAN SNOOZE. YANG SALAH ADALAH MENGIRANYA TIDUR.', M, 1700, {
        size: 26, font: F.num6, color: hexA(C.amber, 0.85), track: 3, maxWidth: W - 2 * M,
      });
      ctx.restore();
    }
  },
};
