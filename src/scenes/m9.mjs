import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { E, ease, vault, bar, coin } from './_emas.mjs';

// 08 — TIGA ATURAN
// Three rules, then the mirror: gold does not make money, it reflects how
// afraid the world is. Ends on the brand card.

const RULES = [
  { t: 0.25, n: '01', h: 'JANGAN SAAT RAMAI', s: 'selisih paling lebar saat euforia' },
  { t: 1.5, n: '02', h: 'SEDIKIT, TERUS', s: 'di harga yang membosankan' },
  { t: 2.7, n: '03', h: 'JANGAN SEMUA', s: 'logam yang tidak membayar apa pun' },
];

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    vault(ctx, { t, glowX: W * 0.5, glowY: 660, glowA: 0.12 });

    tracking(ctx, 'ATURAN', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'NAYSI · 08', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(E.gold, 0.6), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- SHOT A: the rules ------------------------ */
    if (t < 9.4) {
      RULES.forEach((r, i) => {
        const p = ease.expo(clamp((t - r.t) / 0.6));
        if (p <= 0.001) return;
        const y = 380 + i * 290;
        ctx.save();
        ctx.globalAlpha = p;
        fillRR(ctx, 120, y, W - 240, 220, 16, 'rgba(232,180,74,0.055)');
        strokeRR(ctx, 120, y, W - 240, 220, 16, hexA(E.gold, 0.30), 1.6);
        txt(ctx, r.n, 168, y + 128, { size: 74, font: F.num, color: hexA(E.gold, 0.55), track: -2 });
        txt(ctx, r.h, 300, y + 100, { size: 52, font: F.head, color: E.bone, track: 1 });
        txt(ctx, r.s, 300, y + 158, { size: 27, font: F.mono, color: hexA(E.bone, 0.5) });
        ctx.restore();
      });
    }

    /* --------------------------- SHOT B: mirror --------------------------- */
    if (t >= 9.4 && t < 15.6) {
      const p = ease.expo(clamp((t - 9.5) / 0.9));
      // a mirror plate, and the bar it reflects
      const cx = W / 2;
      ctx.save();
      ctx.globalAlpha = p;
      fillRR(ctx, cx - 470, 470, 940, 560, 18, 'rgba(120,150,180,0.06)');
      strokeRR(ctx, cx - 470, 470, 940, 560, 18, 'rgba(214,228,240,0.22)', 2);
      // reflection of the light in the glass
      ctx.fillStyle = linGrad(ctx, cx - 470, 470, cx + 200, 1030, [
        [0, 'rgba(255,255,255,0.10)'], [0.4, 'rgba(255,255,255,0.02)'], [1, 'rgba(255,255,255,0)'],
      ]);
      ctx.fillRect(cx - 470, 470, 940, 560);
      ctx.restore();

      bar(ctx, cx - 260, 1000, 520, 150, { a: p * 0.98, shine: t * 0.05 });

      // the reflection: dimmer, upside down
      ctx.save();
      ctx.globalAlpha = p * 0.22;
      ctx.translate(0, 2 * 1000);
      ctx.scale(1, -1);
      bar(ctx, cx - 260, 1000, 520, 150, { a: 1, shine: 0.2 });
      ctx.restore();

      txt(ctx, 'BUKAN MESIN UANG', W / 2, 1290, {
        size: 76, font: F.head, color: E.bone, align: 'center', track: -1, alpha: a(10.4, 0.6),
      });
      txt(ctx, 'CERMIN', W / 2, 1390, {
        size: 96, font: F.num, color: E.goldHi, align: 'center', track: 2, alpha: a(12.6, 0.7),
      });
      tracking(ctx, 'MEMANTULKAN SEBERAPA TAKUT DUNIA HARI ITU', W / 2, 1450, {
        size: 21, font: F.mono6, track: 4, color: hexA(E.bone, 0.42), align: 'center', alpha: a(13.2, 0.6),
      });
    }

    /* --------------------------- SHOT C: closing -------------------------- */
    if (t >= 15.6) {
      const p = ease.expo(clamp((t - 15.7) / 0.9));
      ctx.save();
      ctx.globalAlpha = p;
      coin(ctx, W / 2, 660, 150, { a: 1 });
      ctx.restore();
      txt(ctx, 'SEBELUM BELI,', W / 2, 1000, {
        size: 62, font: F.head, color: hexA(E.bone, 0.55), align: 'center', track: 2, alpha: a(16.4, 0.6),
      });
      txt(ctx, 'LIHAT DUA HARGANYA.', W / 2, 1110, {
        size: 96, font: F.num, color: E.goldHi, align: 'center', track: -2, alpha: a(17.0, 0.6),
      });
      // the two prices, small, as the takeaway
      const t2 = a(18.2, 0.6);
      if (t2 > 0.01) {
        ctx.save();
        ctx.globalAlpha = t2;
        txt(ctx, '2.517.000', W / 2 - 180, 1270, { size: 54, font: F.num, color: E.bone, align: 'right', track: -1 });
        txt(ctx, '2.293.000', W / 2 + 180, 1270, { size: 54, font: F.num, color: hexA(E.ember, 0.9), track: -1 });
        txt(ctx, 'BELI', W / 2 - 180, 1322, { size: 22, font: F.mono6, color: hexA(E.bone, 0.4), align: 'right', track: 3 });
        txt(ctx, 'JUAL', W / 2 + 180, 1322, { size: 22, font: F.mono6, color: hexA(E.ember, 0.6), track: 3 });
        ctx.fillStyle = hexA(E.bone, 0.18);
        ctx.fillRect(W / 2 - 6, 1210, 12, 2);
        ctx.restore();
      }
    }
  },
};
