import { W, H, C, M, txt, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { dawn, kicker, chip, card, hairline, bigStat, glowSpot } from './_ep4.mjs';

// 03 — BUKTI. The lab night: thirty minutes of snoozing, and nothing broke.
// Honest beat — the cost is not cognition, it is minutes.
const ROWS = [
  { y: 604, title: 'Kognisi setelah bangun', verdict: 'TIDAK TURUN', color: C.mint, note: 'sedikit lebih cepat, bukan lebih lambat', at: 1.0 },
  { y: 806, title: 'Bangun dari tidur dalam', verdict: 'LEBIH JARANG', color: C.sky, note: 'pemicu inersia paling berat', at: 3.8 },
  { y: 1008, title: 'Kortisol pagi', verdict: 'TIDAK BERUBAH', color: C.bone, note: 'sinyal bangun tetap utuh', at: 6.4 },
];

export default {
  draw(ctx, t) {
    dawn(ctx, { top: '#06090F', mid: '#0A101A', bot: '#0C1522', warmX: 0.2, warmA: 0.07 });
    glowSpot(ctx, 1100, 500, 520, C.mint, 0.05);

    kicker(ctx, 'EKSPERIMEN LABORATORIUM · n = 31');

    const a0 = EASE.outCubic(clamp((t - 0.3) / 0.7));
    ctx.save();
    ctx.globalAlpha = a0;
    ctx.translate(0, lerp(26, 0, a0));
    card(ctx, M, 372, W - 2 * M, 748, { r: 36, fill: 'rgba(255,255,255,0.035)' });

    txt(ctx, '30 MENIT SNOOZE', M + 48, 462, { size: 30, font: F.num6, color: C.amberHi, track: 5 });
    txt(ctx, 'SATU MALAM · DUA KONDISI', W - M - 48, 462, {
      size: 24, font: F.num6, color: hexA(C.bone, 0.42), align: 'right', track: 4,
    });

    ROWS.forEach((r, i) => {
      const a = EASE.outCubic(clamp((t - r.at) / 0.5));
      if (a <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(lerp(24, 0, a), 0);
      if (i > 0) hairline(ctx, M + 48, r.y - 46, W - M - 48, r.y - 46, { color: C.bone, alpha: 0.09, lw: 2 });
      txt(ctx, r.title, M + 48, r.y + 24, { size: 46, font: F.semi, color: C.bone, maxWidth: 600 });
      txt(ctx, r.note, M + 48, r.y + 78, {
        size: 26, font: F.num6, color: hexA(C.bone, 0.45), track: 1, maxWidth: 620,
      });
      chip(ctx, W - M - 48, r.y - 8, r.verdict, {
        size: 26, color: r.color, align: 'right', padX: 24, h: 64, track: 3,
      });
      ctx.restore();
    });
    ctx.restore();

    /* ------------------------------------------------------ the real bill -- */
    const bA = EASE.outCubic(clamp((t - 8.6) / 0.7));
    if (bA > 0.01) {
      ctx.save();
      ctx.globalAlpha = bA;
      ctx.translate(0, lerp(24, 0, bA));
      card(ctx, M, 1168, W - 2 * M, 300, {
        r: 30, fill: 'rgba(255,176,58,0.06)', stroke: 'rgba(255,176,58,0.26)',
      });
      txt(ctx, 'HARGA YANG TETAP DIBAYAR', M + 44, 1240, {
        size: 25, font: F.num6, color: hexA(C.amber, 0.8), track: 4.5,
      });
      bigStat(ctx, M + 44, 1372, '6', { size: 96, unit: 'menit tidur hilang', color: C.amberHi });
      txt(ctx, 'tanpa efek buruk pada kognisi', W - M - 44, 1368, {
        size: 26, font: F.num6, color: hexA(C.bone, 0.45), align: 'right', track: 1, maxWidth: 470,
      });
      ctx.restore();
    }

    const nA = clamp((t - 11.4) / 0.8);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA * 0.9;
      hairline(ctx, M, 1540, W - M, 1540, { color: C.bone, alpha: 0.12, lw: 2 });
      txt(ctx, 'JADI SNOOZE BUKAN RACUN. MASALAHNYA DI TEMPAT LAIN.', M, 1612, {
        size: 27, font: F.num6, color: hexA(C.amber, 0.85), track: 3, maxWidth: W - 2 * M,
      });
      txt(ctx, 'Sumber: Journal of Sleep Research, 2023 — 31 pengguna snooze rutin, dua malam di lab.', M, 1672, {
        size: 22, font: F.num6, color: hexA(C.bone, 0.32), track: 1, maxWidth: W - 2 * M,
      });
      ctx.restore();
    }
  },
};
