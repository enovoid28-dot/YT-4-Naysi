import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { darkCard } from '../art/parts.mjs';

const CW = 596;
const CH = 302;
const GX = 40;
const X0 = M;
const X1 = M + CW + GX;

const iconClock = (ctx, x, y, s, c) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.5, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -s * 0.3);
  ctx.moveTo(0, 0);
  ctx.lineTo(s * 0.22, s * 0.1);
  ctx.stroke();
  ctx.restore();
};
const iconSun = (ctx, x, y, s, c) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.22, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * s * 0.34, Math.sin(a) * s * 0.34);
    ctx.lineTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5);
    ctx.stroke();
  }
  ctx.restore();
};
const iconCup = (ctx, x, y, s, c) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-s * 0.34, -s * 0.22);
  ctx.lineTo(-s * 0.26, s * 0.34);
  ctx.lineTo(s * 0.2, s * 0.34);
  ctx.lineTo(s * 0.28, -s * 0.22);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 0.34, 0, s * 0.16, -1.1, 1.1);
  ctx.stroke();
  ctx.restore();
};
const iconTemp = (ctx, x, y, s, c) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = c;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.42);
  ctx.lineTo(-s * 0.1, s * 0.16);
  ctx.moveTo(s * 0.1, -s * 0.42);
  ctx.lineTo(s * 0.1, s * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, s * 0.3, s * 0.18, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.28, -s * 0.36);
  ctx.lineTo(s * 0.44, -s * 0.36);
  ctx.moveTo(s * 0.28, -s * 0.14);
  ctx.lineTo(s * 0.4, -s * 0.14);
  ctx.stroke();
  ctx.restore();
};

const CARDS = [
  { i: '01', title: 'JAM BANGUN', value: '07:00', sub: 'sama tiap hari, termasuk weekend', icon: iconClock, at: 2.0 },
  { i: '02', title: 'CAHAYA PAGI', value: '10', unit: 'MENIT', sub: 'keluar rumah setelah bangun', icon: iconSun, at: 4.55 },
  { i: '03', title: 'KAFEIN', value: '8', unit: 'JAM', sub: 'stop sebelum jam tidur', icon: iconCup, at: 6.45 },
  { i: '04', title: 'SUHU KAMAR', value: '18°', sub: 'lebih dingin dari biasanya', icon: iconTemp, at: 9.1 },
];

export default {
  draw(ctx, t, scene, meta) {
    const g = linGrad(ctx, 0, 240, 0, 1500, [
      [0, '#070910'],
      [0.6, '#05070C'],
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
      txt(ctx, '4 LANGKAH', M, 480 + dy, { size: 104, font: F.num, color: C.bone, track: -2 });
      const w = measure(ctx, '4 LANGKAH', 104, F.num, -2);
      txt(ctx, 'YANG BEKERJA', M, 540 + dy, {
        size: 30, font: F.num6, color: hexA(C.amber, 0.9), track: 4,
      });
      ctx.restore();
    }

    CARDS.forEach((c, k) => {
      const cx = k % 2 === 0 ? X0 : X1;
      const cy = 712 + Math.floor(k / 2) * 342;
      const p = clamp((t - c.at) / 0.5);
      if (p <= 0) return;
      const e = EASE.outCubic(p);
      ctx.save();
      ctx.globalAlpha = clamp(p * 1.6);
      ctx.translate(cx + CW / 2, cy + CH / 2);
      const sc = lerp(0.94, 1, e);
      ctx.scale(sc, sc);
      ctx.translate(-(cx + CW / 2), -(cy + CH / 2));

      darkCard(ctx, cx, cy, CW, CH, 20, { alpha: 1 });

      tracking(ctx, c.i, cx + 28, cy + 48, {
        size: 20, font: F.num6, track: 4, color: hexA(C.amber, 0.9),
      });
      c.icon(ctx, cx + CW - 56, cy + 58, 46, hexA(C.bone, 0.45));

      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = C.bone;
      ctx.fillRect(cx + 28, cy + 70, CW - 56, 2);
      ctx.restore();

      tracking(ctx, c.title, cx + 28, cy + 128, {
        size: 25, font: F.num6, track: 5, color: hexA(C.bone, 0.72),
      });

      const vs = c.value.length > 3 ? 76 : 96;
      txt(ctx, c.value, cx + 28, cy + 232, {
        size: vs, font: F.num, color: C.amber, track: -2,
      });
      if (c.unit) {
        const w = measure(ctx, c.value, vs, F.num, -2);
        txt(ctx, c.unit, cx + 28 + w + 12, cy + 228, {
          size: 26, font: F.num6, color: hexA(C.amber, 0.75), track: 3,
        });
      }
      txt(ctx, c.sub, cx + 28, cy + 272, {
        size: 20, font: F.num6, color: hexA(C.bone, 0.45), track: 1,
      });
      ctx.restore();
    });

    // week strip
    const wA = clamp((t - 9.6) / 0.5);
    if (wA > 0) {
      ctx.save();
      ctx.globalAlpha = wA * 0.9;
      const y = 1478;
      ctx.fillStyle = hexA(C.bone, 0.14);
      ctx.fillRect(M, y, W - 2 * M, 2);
      tracking(ctx, 'UJI 7 HARI', M, y + 44, {
        size: 22, font: F.num6, track: 5, color: hexA(C.bone, 0.6),
      });
      for (let i = 0; i < 7; i++) {
        const on = clamp((t - 9.7 - i * 0.09) / 0.3);
        const x = W - M - 7 * 40 + i * 40;
        ctx.save();
        ctx.globalAlpha = (wA * 0.9) * (0.25 + 0.75 * on);
        fillRR(ctx, x, y + 20, 26, 26, 6, on > 0 ? hexA(C.amber, 0.9) : hexA(C.bone, 0.2));
        ctx.restore();
      }
      ctx.restore();
    }
  },
};
