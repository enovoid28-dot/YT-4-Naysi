import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, card, hairline } from './_ep3.mjs';

const ROWS = [
  { at: 0.5, claim: 'Kopi setelah makan siang aman', fix: 'Belum tentu', note: '8 jam sebelum tidur, bukan 4 jam' },
  { at: 4.2, claim: 'Kafein hilang dalam 2 jam', fix: 'Masih separuh setelah 5 jam', note: 'waktu paruh, bukan waktu kerja' },
  { at: 7.9, claim: 'Decaf bebas kafein', fix: '2–15 mg per cangkir', note: 'cukup untuk sebagian orang' },
];

function cross(ctx, x, y, r, color, a) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r, y - r);
  ctx.lineTo(x + r, y + r);
  ctx.moveTo(x + r, y - r);
  ctx.lineTo(x - r, y + r);
  ctx.stroke();
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#0A0A11', mid: '#07070D', bot: '#04050A' });
    glowSpot(ctx, W / 2, 420, 520, C.amber, 0.035);

    tracking(ctx, 'TIGA ANGGAPAN', M, 330, {
      size: 24, font: F.num6, track: 7, color: hexA(C.bone, 0.45),
    });
    txt(ctx, 'Yang sering dianggap aman', M, 470, {
      size: 64, font: F.display, color: C.bone, alpha: EASE.outCubic(clamp((t - 0.1) / 0.8)),
    });

    ROWS.forEach((row, i) => {
      const a = EASE.outCubic(clamp((t - row.at) / 0.7));
      if (a <= 0.01) return;
      const y = 592 + i * 320;
      ctx.save();
      ctx.globalAlpha = a;

      card(ctx, M, y, W - 2 * M, 276, {
        fill: 'rgba(255,255,255,0.028)', stroke: 'rgba(255,255,255,0.09)', r: 26, shadowBlur: 34,
      });

      // claim, struck through
      txt(ctx, row.claim, M + 46, y + 94, {
        size: 42, font: F.head, color: hexA(C.bone, 0.45), maxWidth: W - 2 * M - 160,
      });
      const strike = EASE.outCubic(clamp((t - row.at - 0.5) / 0.6));
      if (strike > 0.01) {
        const w = (measure(ctx, row.claim, 42, F.head) + 16) * strike;
        ctx.save();
        ctx.strokeStyle = hexA(C.red, 0.75);
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(M + 44, y + 80);
        ctx.lineTo(M + 44 + w, y + 80);
        ctx.stroke();
        ctx.restore();
      }

      // correction
      const fixA = EASE.outCubic(clamp((t - row.at - 0.7) / 0.6));
      if (fixA > 0.01) {
        ctx.save();
        ctx.globalAlpha = a * fixA;
        ctx.fillStyle = hexA(C.amber, 0.9);
        ctx.fillRect(M + 46, y + 150, 6, 62);
        txt(ctx, row.fix, M + 74, y + 200, {
          size: 46, font: F.head, color: C.amberHi, maxWidth: W - 2 * M - 190,
        });
        txt(ctx, row.note, M + 74, y + 246, {
          size: 25, font: F.num6, color: hexA(C.bone, 0.42), track: 1,
        });
        ctx.restore();
      }

      // cross mark
      if (strike > 0.5) cross(ctx, W - M - 56, y + 72, 19, hexA(C.red, 0.7), (strike - 0.5) * 2 * a);
      ctx.restore();
    });

    const fA = EASE.outCubic(clamp((t - 11.6) / 0.8));
    if (fA > 0.01) {
      ctx.save();
      ctx.globalAlpha = fA;
      const fy = 1580 + (1 - fA) * 24;
      card(ctx, M, fy, W - 2 * M, 200, {
        fill: 'rgba(255,176,58,0.06)', stroke: 'rgba(255,176,58,0.28)', r: 26, glowColor: C.amber, shadowBlur: 40,
      });
      txt(ctx, 'Aturan simpannya', M + 46, fy + 78, {
        size: 26, font: F.num6, color: hexA(C.bone, 0.45), track: 2,
      });
      txt(ctx, 'delapan jam sebelum jam tidur', M + 46, fy + 146, {
        size: 44, font: F.head, color: C.amberHi,
      });
      ctx.restore();
    }
  },
};
