import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { glowSpot, tag, applyGrain, P } from './_ep6.mjs';

// 07 — JALAN KELUAR. A hundred people, drawn one by one: 69 can't keep the same
// clock on Saturday, a third drift more than two hours. The fix is smaller than
// the weekend lie: one hour, and open the curtains.
const N = 100;
const RED = 33;
const AMBER = 36;
const COLS = 10;
const GAP = 68;
const GX = W / 2 - (COLS - 1) * GAP / 2;
const GY = 806;

function sun(ctx, cx, cy, r, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = P.amber;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = hexA(P.amber, 0.85);
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const an = (i / 8) * TAU + 0.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * r * 0.72, cy + Math.sin(an) * r * 0.72);
    ctx.lineTo(cx + Math.cos(an) * r * 1.02, cy + Math.sin(an) * r * 1.02);
    ctx.stroke();
  }
  ctx.restore();
}

function dotColor(i) {
  if (i < RED) return P.red;
  if (i < RED + AMBER) return P.amber;
  return 'rgba(242,231,211,0.16)';
}

export default {
  draw(ctx, t) {
    ctx.fillStyle = linGrad(ctx, 0, 0, W * 0.5, H, [[0, '#120E0B'], [0.5, '#191310'], [1, '#0A0706']]);
    ctx.fillRect(0, 0, W, H);
    glowSpot(ctx, W * 0.22, 560, 820, P.amber, 0.11);

    // header
    txt(ctx, 'SOCIAL JETLAG', 96, 392, {
      size: 56, font: F.display, color: '#F2E7D3', track: -1, alpha: clamp((t - 0.1) / 0.5),
    });
    txt(ctx, 'jarak antara jam tubuh dan jam dinding', 98, 438, {
      size: 23, font: F.mono, color: hexA('#F2E7D3', 0.45), alpha: clamp((t - 0.3) / 0.5),
    });

    // the number
    const nA = EASE.outCubic(clamp((t - 0.9) / 0.7));
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      txt(ctx, '69', 92, 646, {
        size: 196, font: F.num, color: P.amber, track: -6, glowBlur: 40, glowColor: 'rgba(255,196,107,0.35)',
      });
      txt(ctx, '%', 300, 646, { size: 86, font: F.num6, color: P.amber, track: -2 });
      txt(ctx, 'ORANG', 96, 700, {
        size: 24, font: F.mono6, color: hexA('#F2E7D3', 0.55), track: 6,
      });
      ctx.restore();
    }

    // legend, right of the number
    const lA = clamp((t - 2.6) / 0.5);
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lA;
      const rows = [
        [P.red, '≥ 2 JAM', '33%'],
        [P.amber, '1–2 JAM', '36%'],
        ['rgba(242,231,211,0.16)', '≤ 1 JAM', '31%'],
      ];
      rows.forEach(([col, label, pct], i) => {
        const y = 548 + i * 62;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(792, y - 10, 13, 0, TAU);
        ctx.fill();
        txt(ctx, label, 826, y, { size: 26, font: F.mono6, color: hexA('#F2E7D3', 0.62), track: 3 });
        txt(ctx, pct, 1200, y, {
          size: 26, font: F.mono6, color: hexA('#F2E7D3', 0.38), track: 2, align: 'right',
        });
      });
      ctx.restore();
    }

    // a hundred people, one by one
    for (let i = 0; i < N; i++) {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      const a = EASE.outCubic(clamp((t - 1.4 - i * 0.016) / 0.35));
      if (a < 0.02) continue;
      const x = GX + c * GAP;
      const y = GY + r * 66;
      const hot = i < RED;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = dotColor(i);
      ctx.beginPath();
      ctx.arc(x, y, 20 * (0.4 + 0.6 * a), 0, TAU);
      ctx.fill();
      if (hot) {
        ctx.strokeStyle = hexA(P.red, 0.35);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 27, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // the fix
    const fA = EASE.outCubic(clamp((t - 11.4) / 0.6));
    if (fA > 0.01) {
      ctx.save();
      ctx.globalAlpha = fA;
      ctx.translate(0, (1 - fA) * 26);

      txt(ctx, 'YANG BEKERJA: BUKAN TIDUR PANJANG', 96, 1470, {
        size: 22, font: F.mono6, color: hexA('#F2E7D3', 0.42), track: 4,
      });

      const chip = (x, label, sub, hot) => {
        const w = 232;
        fillRR(ctx, x, 1508, w, 128, 14, hot ? hexA(P.amber, 0.14) : 'rgba(242,231,211,0.07)');
        strokeRR(ctx, x, 1508, w, 128, 14, hot ? hexA(P.amber, 0.55) : 'rgba(242,231,211,0.20)', 2);
        txt(ctx, label, x + w / 2, 1584, {
          size: 58, font: F.num6, color: hot ? P.amber : hexA('#F2E7D3', 0.75), align: 'center', track: 0,
        });
        txt(ctx, sub, x + w / 2, 1616, {
          size: 18, font: F.mono6, color: hot ? hexA(P.amber, 0.65) : hexA('#F2E7D3', 0.32),
          align: 'center', track: 4,
        });
      };
      chip(96, '06.30', 'ALARM SENIN', false);
      chip(392, '07.30', 'MAKS +1 JAM', true);

      // the gap between them is the whole point
      ctx.fillStyle = hexA(P.amber, 0.75);
      ctx.beginPath();
      ctx.moveTo(346, 1572);
      ctx.lineTo(378, 1572);
      ctx.lineTo(368, 1562);
      ctx.moveTo(378, 1572);
      ctx.lineTo(368, 1582);
      ctx.strokeStyle = hexA(P.amber, 0.75);
      ctx.lineWidth = 3;
      ctx.stroke();

      // morning light
      sun(ctx, 790, 1572, 52, 1);
      txt(ctx, 'CAHAYA PAGI', 872, 1556, {
        size: 30, font: F.mono6, color: '#F2E7D3', track: 4,
      });
      txt(ctx, '10–20 MENIT DI LUAR', 872, 1598, {
        size: 20, font: F.mono6, color: hexA('#F2E7D3', 0.40), track: 3,
      });
      ctx.restore();
    }

    void tag;
    applyGrain(ctx, 0.06);
  },
};
