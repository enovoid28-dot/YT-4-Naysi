import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, spring, TAU } from '../engine/anim.mjs';
import { glassPanel } from '../art/kit.mjs';

const CW = 596;
const CH = 306;
const GX = 40;
const X0 = M;
const X1 = M + CW + GX;

const iconClock = (ctx, s, c) => {
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.52, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -s * 0.3);
  ctx.moveTo(0, 0);
  ctx.lineTo(s * 0.24, s * 0.12);
  ctx.stroke();
};
const iconSun = (ctx, s, c) => {
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.22, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * s * 0.36, Math.sin(a) * s * 0.36);
    ctx.lineTo(Math.cos(a) * s * 0.52, Math.sin(a) * s * 0.52);
    ctx.stroke();
  }
};
const iconCup = (ctx, s, c) => {
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-s * 0.34, -s * 0.24);
  ctx.lineTo(-s * 0.24, s * 0.34);
  ctx.lineTo(s * 0.2, s * 0.34);
  ctx.lineTo(s * 0.3, -s * 0.24);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 0.36, 0, s * 0.15, -1.15, 1.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.22, -s * 0.42);
  ctx.lineTo(-s * 0.22, -s * 0.5);
  ctx.moveTo(0, -s * 0.44);
  ctx.lineTo(0, -s * 0.54);
  ctx.stroke();
};
const iconTemp = (ctx, s, c) => {
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.44);
  ctx.lineTo(-s * 0.1, s * 0.1);
  ctx.moveTo(s * 0.1, -s * 0.44);
  ctx.lineTo(s * 0.1, s * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, s * 0.3, s * 0.19, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.28, -s * 0.38);
  ctx.lineTo(s * 0.46, -s * 0.38);
  ctx.moveTo(s * 0.28, -s * 0.14);
  ctx.lineTo(s * 0.42, -s * 0.14);
  ctx.stroke();
};

const CARDS = [
  { i: '01', title: 'JAM BANGUN', value: '07:00', sub: 'sama tiap hari, termasuk weekend', icon: iconClock, at: 2.0 },
  { i: '02', title: 'CAHAYA PAGI', value: '10', unit: 'MENIT', sub: 'keluar rumah setelah bangun', icon: iconSun, at: 4.55 },
  { i: '03', title: 'KAFEIN', value: '8', unit: 'JAM', sub: 'stop sebelum jam tidur', icon: iconCup, at: 6.45 },
  { i: '04', title: 'SUHU KAMAR', value: '18°', sub: 'lebih dingin dari biasanya', icon: iconTemp, at: 9.1 },
];

export default {
  draw(ctx, t, scene, meta) {
    const g = linGrad(ctx, 0, 240, 0, 1520, [
      [0, '#080A12'],
      [0.55, '#06080E'],
      [1, '#080A12'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 240, W, 1300);

    tracking(ctx, 'PROTOKOL PERBAIKAN', M, 330, {
      size: 25, font: F.num6, track: 6, color: hexA(C.bone, 0.5),
    });

    const hA = clamp((t - 0.15) / 0.45);
    if (hA > 0) {
      ctx.save();
      ctx.globalAlpha = hA;
      const dy = (1 - EASE.outCubic(hA)) * 24;
      txt(ctx, '4 LANGKAH', M, 486 + dy, { size: 104, font: F.num, color: C.bone, track: -2 });
      tracking(ctx, 'YANG BEKERJA', M, 548 + dy, {
        size: 27, font: F.num6, color: hexA(C.amber, 0.9), track: 5,
      });
      ctx.restore();
    }

    CARDS.forEach((c, k) => {
      const cx = k % 2 === 0 ? X0 : X1;
      const cy = 700 + Math.floor(k / 2) * 348;
      const p = clamp((t - c.at) / 0.5);
      if (p <= 0) return;
      const e = spring(Math.min(1, p * 1.1), 10.5, 0.7);
      ctx.save();
      ctx.globalAlpha = clamp(p * 1.8);
      ctx.translate(cx + CW / 2, cy + CH / 2);
      const sc = lerp(0.93, 1, e);
      ctx.scale(sc, sc);
      ctx.translate(-(cx + CW / 2), -(cy + CH / 2));

      glassPanel(ctx, cx, cy, CW, CH, 22, { top: '#1D2433', bottom: '#070A10' });

      // icon badge
      ctx.save();
      ctx.translate(cx + 60, cy + 66);
      const bg = radGrad(ctx, -8, -10, 0, 34, [
        [0, 'rgba(255,208,140,0.20)'],
        [1, 'rgba(255,176,58,0.03)'],
      ]);
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, TAU);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,176,58,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      c.icon(ctx, 34, hexA(C.amber, 0.95));
      ctx.restore();

      tracking(ctx, c.i, cx + CW - 28, cy + 52, {
        size: 19, font: F.num6, track: 4, align: 'right', color: hexA(C.bone, 0.3),
      });

      tracking(ctx, c.title, cx + 28, cy + 142, {
        size: 24, font: F.num6, track: 5, color: hexA(C.bone, 0.66),
      });

      const vs = c.value.length > 3 ? 74 : 94;
      txt(ctx, c.value, cx + 28, cy + 240, {
        size: vs, font: F.num, color: C.amber, track: -2,
      });
      if (c.unit) {
        const w = measure(ctx, c.value, vs, F.num, -2);
        txt(ctx, c.unit, cx + 28 + w + 12, cy + 236, {
          size: 24, font: F.num6, color: hexA(C.amber, 0.75), track: 3,
        });
      }
      txt(ctx, c.sub, cx + 28, cy + 266, {
        size: 19, font: F.num6, color: hexA(C.bone, 0.42), track: 1,
      });

      // reveal rule
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(cx + 28, cy + CH - 14, CW - 56, 3);
      ctx.fillStyle = hexA(C.amber, 0.85);
      ctx.fillRect(cx + 28, cy + CH - 14, (CW - 56) * EASE.outCubic(clamp((t - c.at - 0.2) / 0.9)), 3);
      ctx.restore();

      ctx.restore();
    });

    // week strip
    const wA = clamp((t - 9.6) / 0.5);
    if (wA > 0) {
      ctx.save();
      ctx.globalAlpha = wA * 0.95;
      const y = 1490;
      const lg = linGrad(ctx, M, 0, W - M, 0, [
        [0, 'rgba(247,242,231,0.02)'],
        [0.5, 'rgba(247,242,231,0.16)'],
        [1, 'rgba(247,242,231,0.02)'],
      ]);
      ctx.fillStyle = lg;
      ctx.fillRect(M, y, W - 2 * M, 2);
      tracking(ctx, 'UJI 7 HARI', M, y + 46, {
        size: 22, font: F.num6, track: 5, color: hexA(C.bone, 0.6),
      });
      for (let i = 0; i < 7; i++) {
        const on = clamp((t - 9.7 - i * 0.09) / 0.3);
        const x = W - M - 7 * 40 + i * 40;
        ctx.save();
        ctx.globalAlpha = (wA * 0.95) * (0.18 + 0.82 * on);
        fillRR(ctx, x, y + 22, 26, 26, 6, on > 0 ? hexA(C.amber, 0.9) : hexA(C.bone, 0.14));
        ctx.restore();
      }
      ctx.restore();
    }
  },
};
