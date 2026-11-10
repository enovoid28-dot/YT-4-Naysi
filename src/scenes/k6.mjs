import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, card, chartFrame, curve, dot, hairline } from './_ep3.mjs';

const X0 = 250;
const X1 = 1246;
const Y0 = 810;
const Y1 = 1440;
const HRS = 12;
const px = (h) => X0 + (h / HRS) * (X1 - X0);
const val = (h, hl) => 200 * Math.pow(0.5, h / hl);

const CURVES = [
  { hl: 1.5, color: C.sky, label: 'Cepat', who: '1,5 jam', at: 1.0 },
  { hl: 5, color: C.amber, label: 'Rata-rata', who: '5 jam', at: 2.0 },
  { hl: 9.5, color: C.ember, label: 'Lambat', who: '9,5 jam', at: 3.0 },
];

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#08090F', mid: '#06070C', bot: '#04050A' });
    glowSpot(ctx, 700, 1000, 820, C.amber, 0.05);

    tracking(ctx, 'SATU CANGKIR, TIGA ORANG', M, 330, {
      size: 24, font: F.num6, track: 7, color: hexA(C.bone, 0.45),
    });
    txt(ctx, 'Waktu paruh tidak sama', M, 470, {
      size: 66, font: F.display, color: C.bone, alpha: EASE.outCubic(clamp((t - 0.1) / 0.8)),
    });
    txt(ctx, 'orang lambat masih menyimpan 57 mg saat jam tidur', M, 536, {
      size: 27, font: F.num6, color: hexA(C.bone, 0.45), alpha: clamp((t - 0.4) / 0.8),
    });

    const pyFn = chartFrame(ctx, {
      x0: X0, x1: X1, y0: Y0, y1: Y1, yMax: 200,
      yTicks: [0, 50, 100, 200], yLabel: 'MG',
      xTicks: [0, 2, 4, 6, 8, 10, 12].map(px),
      xLabels: ['15', '17', '19', '21', '23', '01', '03'],
      alpha: clamp((t - 0.3) / 0.8),
    });

    // 23.00 marker
    const mA = clamp((t - 1.4) / 0.7);
    if (mA > 0.01) {
      ctx.save();
      ctx.globalAlpha = mA;
      ctx.setLineDash([7, 12]);
      ctx.strokeStyle = hexA(C.amber, 0.5);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px(8), Y0 - 30);
      ctx.lineTo(px(8), Y1);
      ctx.stroke();
      ctx.restore();
      txt(ctx, 'JAM TIDUR 23.00', px(8), Y0 - 56, {
        size: 22, font: F.num6, color: hexA(C.amber, 0.8), align: 'center', track: 4, alpha: mA,
      });
    }

    CURVES.forEach((cv, i) => {
      const reveal = clamp((t - cv.at) / 3.6);
      if (reveal <= 0) return;
      const pts = [];
      for (let h = 0; h <= HRS; h += 0.05) pts.push([px(h), pyFn(val(h, cv.hl))]);
      curve(ctx, pts, { color: cv.color, lw: i === 2 ? 9 : 6, progress: reveal, glow: i === 2 ? 36 : 18 });

      // value at 23.00
      const la = EASE.outCubic(clamp((t - (cv.at + 4.2)) / 0.6));
      if (la > 0.01) {
        const x = px(8);
        const y = pyFn(val(8, cv.hl));
        ctx.save();
        ctx.globalAlpha = la;
        dot(ctx, x, y, 12, cv.color, { glow: 24, ring: C.ink0, ringW: 4 });
        const lab = `${Math.round(val(8, cv.hl))} mg`;
        const lw = measure(ctx, lab, 34, F.num) + 26;
        const lx = x - 34;
        fillRR(ctx, lx - lw, y - 60, lw, 50, 14, 'rgba(6,8,13,0.9)');
        txt(ctx, lab, lx - 13, y - 23, {
          size: 34, font: F.num, color: cv.color, align: 'right',
        });
        ctx.restore();
      }
    });

    // legend cards
    const gA = clamp((t - 8.6) / 0.8);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      CURVES.forEach((cv, i) => {
        const y = 1524 + i * 96;
        card(ctx, M, y, W - 2 * M, 84, {
          fill: 'rgba(255,255,255,0.03)', stroke: hexA(cv.color, 0.22), r: 20, shadowBlur: 22,
        });
        ctx.fillStyle = cv.color;
        ctx.fillRect(M + 32, y + 38, 44, 8);
        txt(ctx, cv.label, M + 100, y + 56, { size: 32, font: F.head, color: C.bone });
        txt(ctx, cv.who, W - M - 32, y + 56, {
          size: 29, font: F.num6, color: hexA(cv.color, 0.95), align: 'right', track: 1,
        });
      });
      ctx.restore();
    }
  },
};
