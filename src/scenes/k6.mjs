import { W, H, C, M, txt, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { dawn, kicker, chip, card, hairline, bigStat, glowSpot } from './_ep4.mjs';

// 06 — BEDA. Snoozing has a profile: young night owls with enough sleep, not
// chronically short sleepers. For the second group it is a symptom.
export default {
  draw(ctx, t) {
    dawn(ctx, { top: '#06080F', mid: '#090E19', bot: '#0B1320', warmX: 0.3, warmA: 0.06 });

    kicker(ctx, 'SIAPA YANG SNOOZE');

    /* ------------------------------------------------------------ profile -- */
    const aA = EASE.outCubic(clamp((t - 0.4) / 0.7));
    if (aA > 0.01) {
      ctx.save();
      ctx.globalAlpha = aA;
      ctx.translate(0, lerp(30, 0, aA));
      card(ctx, M, 380, W - 2 * M, 528, { r: 34, fill: 'rgba(105,183,255,0.06)', stroke: 'rgba(105,183,255,0.24)' });
      glowSpot(ctx, M + 180, 560, 300, C.sky, 0.10);
      chip(ctx, M + 44, 424, 'TIPE MALAM', { size: 27, color: C.sky, padX: 24, h: 64, track: 4 });
      bigStat(ctx, M + 44, 700, '4', { size: 150, unit: '×', color: C.bone, label: 'lebih mungkin snooze' });
      hairline(ctx, 800, 460, 800, 800, { color: C.bone, alpha: 0.12, lw: 2 });
      bigStat(ctx, 856, 700, '6', { size: 150, unit: 'tahun', color: C.bone, label: 'lebih muda' });
      txt(ctx, 'Snooze bekerja untuk mereka: alarm berulang menghindarkan bangun dari tidur dalam.', M + 44, 862, {
        size: 26, font: F.num6, color: hexA(C.bone, 0.5), track: 1, maxWidth: W - 2 * M - 88,
      });
      ctx.restore();
    }

    /* ------------------------------------------------------------- symptom -- */
    const aB = EASE.outCubic(clamp((t - 7.4) / 0.8));
    if (aB > 0.01) {
      ctx.save();
      ctx.globalAlpha = aB;
      ctx.translate(0, lerp(30, 0, aB));
      card(ctx, M, 968, W - 2 * M, 604, { r: 34, fill: 'rgba(255,75,59,0.06)', stroke: 'rgba(255,75,59,0.26)' });
      chip(ctx, M + 44, 1012, 'KURANG TIDUR · INSOMNIA', { size: 27, color: C.red, padX: 24, h: 64, track: 4 });
      txt(ctx, 'Bukan kebiasaan.', M + 44, 1176, { size: 62, font: F.head, color: C.bone });
      txt(ctx, 'Itu gejala.', M + 44, 1252, {
        size: 62, font: F.head, color: C.red,
      });
      hairline(ctx, M + 44, 1316, W - M - 44, 1316, { color: C.bone, alpha: 0.12, lw: 2 });
      txt(ctx, 'Sembilan menit tambahan tidak menutup kekurangan tidur yang menumpuk berbulan-bulan.', M + 44, 1394, {
        size: 30, font: F.num6, color: hexA(C.bone, 0.58), track: 1, maxWidth: W - 2 * M - 88,
      });
      txt(ctx, 'YANG DIBUTUHKAN: JAM TIDUR, BUKAN ALARM KEDUA', M + 44, 1490, {
        size: 25, font: F.num6, color: hexA(C.red, 0.8), track: 3.5,
      });
      ctx.restore();
    }

    const nA = clamp((t - 12.6) / 0.7);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA * 0.9;
      txt(ctx, 'DATA: 1.732 RESPONDEN SURVEI · 31 PESERTA LABORATORIUM', M, 1650, {
        size: 23, font: F.num6, color: hexA(C.bone, 0.38), track: 3.5,
      });
      ctx.restore();
    }
  },
};
