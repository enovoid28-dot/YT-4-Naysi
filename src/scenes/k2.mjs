import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, card, chartFrame, curve, dot } from './_ep3.mjs';

const X0 = 250;
const X1 = 1246;
const Y0 = 830;
const Y1 = 1470;
const HRS = 12;
const mg = (h) => 200 * Math.pow(0.5, h / 5);
const px = (h) => X0 + (h / HRS) * (X1 - X0);
const py = (m) => Y1 - (m / 200) * (Y1 - Y0);

const MARKS = [
  { h: 0, m: 200, clock: '15.00', at: 1.2 },
  { h: 5, m: 100, clock: '20.00', at: 4.2 },
  { h: 10, m: 50, clock: '01.00', at: 7.2 },
];

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#080A11', mid: '#06080E', bot: '#04060A' });
    glowSpot(ctx, 900, 1100, 780, C.amber, 0.055);

    tracking(ctx, 'KAFEIN DI DARAH', M, 330, {
      size: 24, font: F.num6, track: 7, color: hexA(C.bone, 0.45),
    });
    txt(ctx, 'Satu cangkir, dua belas jam', M, 470, {
      size: 68, font: F.display, color: C.bone, alpha: EASE.outCubic(clamp((t - 0.1) / 0.8)),
    });
    txt(ctx, '200 mg kafein, diminum jam 15.00', M, 536, {
      size: 30, font: F.num6, color: hexA(C.bone, 0.45), track: 1,
      alpha: clamp((t - 0.5) / 0.8),
    });

    const pyFn = chartFrame(ctx, {
      x0: X0, x1: X1, y0: Y0, y1: Y1, yMax: 200,
      yTicks: [0, 50, 100, 150, 200], yLabel: 'MG',
      xTicks: [0, 2, 4, 6, 8, 10, 12].map(px),
      xLabels: ['15', '17', '19', '21', '23', '01', '03'],
      alpha: clamp((t - 0.3) / 0.8),
    });

    const reveal = clamp((t - 0.9) / 6.2);
    const pts = [];
    for (let h = 0; h <= HRS; h += 0.05) pts.push([px(h), pyFn(mg(h))]);
    curve(ctx, pts, { color: C.amber, lw: 8, progress: reveal, fillTo: Y1, glow: 34 });

    if (reveal < 1) {
      const hh = reveal * HRS;
      dot(ctx, px(hh), pyFn(mg(hh)), 10, C.bone, { glow: 28, ring: C.amber, ringW: 4 });
    }

    MARKS.forEach((mk) => {
      const a = EASE.outCubic(clamp((t - mk.at) / 0.55));
      if (a <= 0.01) return;
      const x = px(mk.h);
      const y = pyFn(mk.m);
      ctx.save();
      ctx.globalAlpha = a;
      dot(ctx, x, y, lerp(6, 14, a), C.ink0, { glow: 0, ring: C.amberHi, ringW: 5 });
      // label sits above the dot, inside a soft dark backing
      const label = `${mk.m} mg`;
      const lw = measure(ctx, label, 52, F.num) + 20;
      const lx = mk.h === 0 ? x + 26 : x - 6;
      ctx.fillStyle = 'rgba(6,8,13,0.82)';
      fillRR(ctx, lx - 8, y - 128, lw + 16, 96, 18, 'rgba(6,8,13,0.82)');
      txt(ctx, label, lx + 8, y - 62, { size: 52, font: F.num, color: C.bone });
      txt(ctx, mk.clock, lx + 10, y - 26, {
        size: 24, font: F.num6, color: hexA(C.bone, 0.5), track: 3,
      });
      ctx.restore();
    });

    const cA = EASE.outCubic(clamp((t - 9.4) / 0.7));
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      const cy = 1560 + (1 - cA) * 30;
      card(ctx, M, cy, W - 2 * M, 196, {
        fill: 'rgba(255,176,58,0.06)', stroke: 'rgba(255,176,58,0.30)', r: 26, glowColor: C.amber, shadowBlur: 40,
      });
      txt(ctx, 'Jam 01.00 masih 50 mg', M + 46, cy + 86, {
        size: 46, font: F.head, color: C.amberHi,
      });
      txt(ctx, 'setara setengah cangkir yang belum diminum', M + 46, cy + 144, {
        size: 28, font: F.num6, color: hexA(C.bone, 0.5), track: 1,
      });
      ctx.restore();
    }
  },
};
