import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, card, hairline, clockFace, pill } from './_ep3.mjs';

const STEPS = [
  { n: '01', a: 'Kunci jam tidur', b: 'misal 23.00' },
  { n: '02', a: 'Hitung mundur 8 jam', b: 'kopi terakhir 15.00' },
  { n: '03', a: 'Sore tanpa kafein', b: 'air, teh herbal, decaf' },
  { n: '04', a: 'Cahaya pagi 10 menit', b: 'jam tubuh lebih tegas' },
];

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#0A0B12', mid: '#07080E', bot: '#04050A' });
    glowSpot(ctx, W / 2, 760, 760, C.amber, 0.07);

    tracking(ctx, 'HITUNG MUNDUR DARI JAM TIDUR', M, 330, {
      size: 24, font: F.num6, track: 6, color: hexA(C.bone, 0.45),
    });
    txt(ctx, 'Empat langkah, tanpa alat', M, 466, {
      size: 62, font: F.display, color: C.bone, alpha: EASE.outCubic(clamp((t - 0.1) / 0.8)),
    });

    const cA = EASE.outCubic(clamp((t - 0.2) / 0.8));
    const sweep = clamp((t - 0.8) / 2.6);
    const start = -Math.PI / 2 + (23 / 12) * TAU;
    clockFace(ctx, 470, 830, 236 * lerp(0.94, 1, cA), {
      hours: 23, minutes: 0, alpha: cA,
      arc: { from: start - sweep * (8 / 12) * TAU, to: start },
      glow: 0.9,
    });

    const tA = clamp((t - 1.1) / 0.6);
    ctx.save();
    ctx.globalAlpha = tA;
    txt(ctx, '23.00', 470, 1170, { size: 76, font: F.num, color: C.bone, align: 'center' });
    txt(ctx, 'jam tidurmu', 470, 1212, {
      size: 24, font: F.num6, color: hexA(C.bone, 0.45), align: 'center', track: 3,
    });
    ctx.restore();

    // side note
    const nA = EASE.outCubic(clamp((t - 1.9) / 0.7));
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      card(ctx, 800, 700, W - M - 800, 320, {
        fill: 'rgba(255,176,58,0.06)', stroke: 'rgba(255,176,58,0.26)', r: 26, glowColor: C.amber, shadowBlur: 40,
      });
      txt(ctx, '8', 892, 918, {
        size: 168, font: F.num, color: C.amberHi, align: 'center',
        glowBlur: 46, glowColor: hexA(C.amber, 0.4),
      });
      txt(ctx, 'jam', 1004, 828, { size: 46, font: F.head, color: C.amberHi });
      txt(ctx, 'jarak aman', 1004, 884, { size: 28, font: F.num6, color: hexA(C.bone, 0.55), track: 1 });
      txt(ctx, 'untuk satu cangkir', 1004, 928, { size: 24, font: F.num6, color: hexA(C.bone, 0.4) });
      txt(ctx, 'standar ±107 mg', 1004, 966, { size: 24, font: F.num6, color: hexA(C.amber, 0.85) });
      ctx.restore();
    }

    // ruler
    const rA = clamp((t - 2.8) / 0.7);
    if (rA > 0.01) {
      const y = 1330;
      const x0 = M + 40;
      const x1 = W - M - 40;
      ctx.save();
      ctx.globalAlpha = rA;
      hairline(ctx, x0, y, x1, y, { alpha: 0.22, lw: 3 });
      [15, 17, 19, 21, 23].forEach((h, i) => {
        const x = x0 + (i / 4) * (x1 - x0);
        hairline(ctx, x, y - 14, x, y + 14, { alpha: 0.3 });
        txt(ctx, String(h), x, y + 56, { size: 24, font: F.num6, color: hexA(C.bone, 0.4), align: 'center' });
      });
      const g = linGrad(ctx, x0, 0, x1, 0, [[0, hexA(C.mint, 0.85)], [1, hexA(C.mint, 0.18)]]);
      ctx.fillStyle = g;
      ctx.fillRect(x0, y - 5, (x1 - x0) * clamp((t - 3.0) / 2.2), 10);
      // cut-off marker at 15.00
      const cw = clamp((t - 3.2) / 0.5);
      if (cw > 0.01) {
        ctx.save();
        ctx.globalAlpha = cw;
        ctx.strokeStyle = C.amber;
        ctx.lineWidth = 6;
        ctx.shadowColor = hexA(C.amber, 0.7);
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.moveTo(x0, y - 40);
        ctx.lineTo(x0, y + 26);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      const kA = EASE.outCubic(clamp((t - 3.6) / 0.6));
      if (kA > 0.01) {
        txt(ctx, 'JENDELA BEBAS KAFEIN', (x0 + x1) / 2 + 40, y - 52, {
          size: 22, font: F.num6, color: hexA(C.amber, 0.8), align: 'center', track: 4, alpha: kA,
        });
        pill(ctx, 'KOPI TERAKHIR 15.00', x0 + 30, y + 118, {
          size: 26, color: C.amberHi, alpha: kA, align: 'left',
        });
      }
    }

    // steps
    STEPS.forEach((s, i) => {
      const a = EASE.outCubic(clamp((t - (4.4 + i * 1.2)) / 0.55));
      if (a <= 0.01) return;
      const y = 1500 + i * 80 + (1 - a) * 22;
      ctx.save();
      ctx.globalAlpha = a;
      hairline(ctx, M, y - 32, W - M, y - 32, { alpha: 0.07 });
      txt(ctx, s.n, M, y + 22, { size: 24, font: F.num6, color: hexA(C.amber, 0.8), track: 2 });
      txt(ctx, s.a, M + 92, y + 22, { size: 38, font: F.head, color: C.bone });
      txt(ctx, s.b, W - M, y + 20, { size: 25, font: F.num6, color: hexA(C.bone, 0.45), align: 'right', track: 1 });
      ctx.restore();
    });
  },
};
