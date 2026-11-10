import { W, H, C, M, txt, hexA, fillRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { dawn, kicker, chip, card, hairline, bigStat, meter } from './_ep4.mjs';

// 02 — ANGKA. Two datasets, the same shape: the alarm goes off, and the body
// does not follow for another twenty-odd minutes.
export default {
  draw(ctx, t) {
    dawn(ctx, { top: '#06080F', mid: '#090F1A', bot: '#0C1522', warmX: 0.8, warmA: 0.08 });

    kicker(ctx, 'DUA DATASET · SATU POLA');

    const blocks = [
      { y: 372, chip: 'SURVEI · 2023 · n = 1.732', pct: 69, big: '22', unit: 'menit', note: 'rata-rata snooze', at: 0.5 },
      { y: 940, chip: 'PELACAK TIDUR · 2022 · n = 450', pct: 57, big: '27', unit: 'menit', note: 'alarm pertama sampai berdiri', at: 6.4 },
    ];

    blocks.forEach((b, i) => {
      const a = EASE.outCubic(clamp((t - b.at) / 0.7));
      if (a <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(0, lerp(34, 0, a));
      card(ctx, M, b.y, W - 2 * M, 520, { r: 34, fill: 'rgba(255,255,255,0.035)' });
      chip(ctx, M + 48, b.y + 44, b.chip, { size: 26, color: hexA(C.bone, 0.62), padX: 22, h: 62, track: 3.5 });

      // percentage
      bigStat(ctx, M + 48, b.y + 300, `${b.pct}`, {
        size: 196, unit: '%', color: i === 0 ? C.amberHi : C.sky, label: 'menekan snooze',
      });
      meter(ctx, M + 48, b.y + 386, 520, (b.pct / 100) * clamp((t - b.at - 0.3) / 0.9), {
        h: 12, color: i === 0 ? C.amber : C.sky,
      });

      // right column
      hairline(ctx, M + 660, b.y + 96, M + 660, b.y + 424, { color: C.bone, alpha: 0.12, lw: 2 });
      txt(ctx, b.big, M + 726, b.y + 300, { size: 168, font: F.num, color: C.bone, track: -4 });
      txt(ctx, b.unit, M + 726 + measure(ctx, b.big, 168, F.num) + 16, b.y + 300, {
        size: 44, font: F.num6, color: hexA(C.bone, 0.62), track: 1,
      });
      txt(ctx, b.note, M + 726, b.y + 366, {
        size: 30, font: F.num6, color: hexA(C.bone, 0.52), track: 1.5, maxWidth: 420,
      });
      ctx.restore();
    });

    // the gap between the two numbers
    const gA = clamp((t - 12.4) / 0.7);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      hairline(ctx, M + 24, 1560, W - M - 24, 1560, { color: C.bone, alpha: 0.14, lw: 2 });
      txt(ctx, 'DUA STUDI BERBEDA, DUA NEGARA, POLA YANG SAMA', M + 24, 1622, {
        size: 25, font: F.num6, color: hexA(C.bone, 0.44), track: 4,
      });
      ctx.restore();
    }
  },
};
