import { W, H, C, M, txt, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { dawn, kicker, chip, card, hairline, glowSpot, bigStat } from './_ep4.mjs';

// 09 — JAMNYA. Recap, the bill for the morning, and the question that goes in
// the comments. The question itself lives in the caption track, not twice here.
export default {
  draw(ctx, t) {
    dawn(ctx, { top: '#05070E', mid: '#080D18', bot: '#0A1220', warmX: 0.3, warmA: 0.10 });
    glowSpot(ctx, 720, 520, 700, C.amber, 0.07);

    /* ---------------------------------------------------------- statement -- */
    const a0 = EASE.outCubic(clamp((t - 0.2) / 0.8));
    ctx.save();
    ctx.globalAlpha = a0;
    ctx.translate(0, lerp(30, 0, a0));
    txt(ctx, 'Snooze bukan', M, 560, { size: 92, font: F.head, color: C.bone, track: -1 });
    txt(ctx, 'tidur tambahan.', M, 672, { size: 92, font: F.head, color: C.amberHi, track: -1 });
    txt(ctx, 'Itu tidur yang sama, dipotong jadi sembilan menit.', M, 782, {
      size: 40, font: F.med, color: hexA(C.bone, 0.62), maxWidth: W - 2 * M,
    });
    ctx.restore();

    /* ------------------------------------------------------------ recap --- */
    const rA = EASE.outCubic(clamp((t - 2.4) / 0.7));
    if (rA > 0.01) {
      ctx.save();
      ctx.globalAlpha = rA;
      hairline(ctx, M, 862, W - M, 862, { color: C.bone, alpha: 0.14, lw: 2 });
      const items = [
        ['BUKAN RACUN', 'tidak merusak kognisi'],
        ['BUKAN TIDUR', '9 menit, 0,1 siklus'],
        ['BUKAN OBAT', 'kurang tidur tetap kurang'],
      ];
      items.forEach(([k, v], i) => {
        const x = M + i * 412;
        txt(ctx, k, x, 942, { size: 25, font: F.num6, color: hexA(C.amber, 0.85), track: 3.5 });
        txt(ctx, v, x, 996, {
          size: 27, font: F.num6, color: hexA(C.bone, 0.5), track: 0.5, maxWidth: 356,
        });
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- bill -- */
    const qA = EASE.outCubic(clamp((t - 5.6) / 0.8));
    if (qA > 0.01) {
      ctx.save();
      ctx.globalAlpha = qA;
      ctx.translate(0, lerp(34, 0, qA));
      card(ctx, M, 1100, W - 2 * M, 400, {
        r: 36, fill: 'rgba(255,255,255,0.045)', stroke: 'rgba(255,255,255,0.14)',
      });
      txt(ctx, 'TAGIHAN PAGI INI', M + 48, 1176, {
        size: 25, font: F.num6, color: hexA(C.bone, 0.45), track: 5,
      });
      bigStat(ctx, M + 48, 1338, '27', { size: 132, unit: 'menit', color: C.bone, label: 'alarm pertama sampai berdiri' });
      hairline(ctx, 760, 1200, 760, 1444, { color: C.bone, alpha: 0.12, lw: 2 });
      bigStat(ctx, 820, 1338, '0', { size: 132, unit: 'siklus', color: C.amberHi, label: 'yang sempat selesai' });
      ctx.restore();
    }

    /* ------------------------------------------------------------ footer -- */
    const fA = clamp((t - 9.0) / 0.8);
    if (fA > 0.01) {
      ctx.save();
      ctx.globalAlpha = fA * 0.85;
      txt(ctx, 'NAYSI · TIDUR & OTAK', W / 2, 1640, {
        size: 24, font: F.num6, color: hexA(C.bone, 0.42), align: 'center', track: 6,
      });
      txt(ctx, 'SUMBER: JOURNAL OF SLEEP RESEARCH 2023 · SLEEP 2022', W / 2, 1690, {
        size: 20, font: F.num6, color: hexA(C.bone, 0.28), align: 'center', track: 3.5,
      });
      ctx.restore();
    }
  },
};
