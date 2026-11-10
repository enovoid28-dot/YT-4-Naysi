import { W, H, C, M, txt, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { dawn, kicker, chip, card, hairline, glowSpot } from './_ep4.mjs';

// 08 — CARA. Four things that work, in the order they matter.
const STEPS = [
  { n: '01', title: 'Satu alarm, di jam kamu benar-benar harus bangun', at: 0.6 },
  { n: '02', title: 'Ponsel di luar jangkauan tangan', at: 2.6 },
  { n: '03', title: 'Cahaya terang dalam sepuluh menit pertama', at: 4.6 },
  { n: '04', title: 'Butuh tiga snooze? Tidur empat puluh menit lebih awal', at: 6.6 },
];

export default {
  draw(ctx, t) {
    dawn(ctx, { top: '#06080F', mid: '#0A1019', bot: '#0D1523', warmX: 0.72, warmA: 0.09 });
    glowSpot(ctx, 1180, 420, 620, C.amber, 0.07);

    kicker(ctx, 'EMPAT YANG BEKERJA');

    STEPS.forEach((s, i) => {
      const a = EASE.outCubic(clamp((t - s.at) / 0.5));
      if (a <= 0.01) return;
      const y = 400 + i * 300;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(lerp(24, 0, a), 0);
      card(ctx, M, y, W - 2 * M, 250, { r: 30, fill: 'rgba(255,255,255,0.032)' });

      // number plate
      txt(ctx, s.n, M + 42, y + 152, {
        size: 78, font: F.num, color: hexA(C.amber, 0.85), track: -2,
      });
      hairline(ctx, M + 168, y + 52, M + 168, y + 198, { color: C.bone, alpha: 0.12, lw: 2 });

      txt(ctx, s.title, M + 208, y + 138, {
        size: 42, font: F.semi, color: C.bone, maxWidth: W - 2 * M - 208 - 190, minSize: 26,
      });

      // check
      const cA = EASE.outCubic(clamp((t - s.at - 0.25) / 0.45));
      const cx = W - M - 74;
      const cy = y + 125;
      ctx.save();
      ctx.globalAlpha *= cA;
      ctx.strokeStyle = hexA(C.amber, 0.5);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 34 * lerp(0.8, 1, cA), 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = C.amberHi;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + 1);
      ctx.lineTo(cx - 4, cy + 13);
      ctx.lineTo(cx + 16, cy - 14);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    });

    const nA = clamp((t - 9.6) / 0.8);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA * 0.92;
      card(ctx, M, 1600, W - 2 * M, 144, {
        r: 26, fill: 'rgba(255,176,58,0.07)', stroke: 'rgba(255,176,58,0.26)',
      });
      txt(ctx, 'SNOOZE TIDAK MENAMBAH TIDUR. IA MEMINDAHKANNYA KE PAGI.', M + 40, 1688, {
        size: 28, font: F.num6, color: hexA(C.amberHi, 0.92), track: 2.5, maxWidth: W - 2 * M - 80,
      });
      ctx.restore();
    }
  },
};
