import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { paperRoom, paperKicker, sheet, sheetContent, dashRR, stamp, tag, applyGrain, P } from './_ep6.mjs';

// 03 — LAB. The protocol, on the clipboard: 36 adults, three groups, twelve nights.
const SX = 88;
const SY = 296;
const SW = W - 176;
const SH = 1262;
const ROT = -0.012;

const DAYS = ['S', 'S', 'R', 'K', 'J', 'S', 'M', 'S', 'S', 'R', 'K', 'J'];
const GROUPS = [
  { id: 'A', h: '9 JAM', sub: 'TIDUR CUKUP', color: P.teal, cells: Array(12).fill(9) },
  { id: 'B', h: '5 JAM', sub: 'TANPA PENEBUSAN', color: P.red2, cells: Array(12).fill(5) },
  { id: 'C', h: '5 JAM', sub: 'BEBAS AKHIR PEKAN', color: '#A9641A', cells: [5, 5, 5, 5, 5, 'f', 'f', 5, 5, 5, 5, 5] },
];

const X0 = 424;
const CW = 52;
const GAP = 12;
const CELL_H = 160;
const ROW_Y = [350, 682, 1014];

function sunGlyph(ctx, cx, cy, r, a) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(169,100,26,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.45, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const an = (i / 8) * TAU;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * r * 0.66, cy + Math.sin(an) * r * 0.66);
    ctx.lineTo(cx + Math.cos(an) * r * 0.92, cy + Math.sin(an) * r * 0.92);
    ctx.stroke();
  }
  ctx.restore();
}

export default {
  draw(ctx, t) {
    paperRoom(ctx);
    paperKicker(ctx, 'PROTOKOL · 2019', { y: 232 });

    const a0 = EASE.outCubic(clamp((t - 0.1) / 0.7));
    sheet(ctx, SX, SY, SW, SH, { a: a0, rot: ROT, lift: 1.1, fill: '#F5EBD6' });
    if (a0 < 0.35) {
      applyGrain(ctx, 0.05);
      return;
    }

    sheetContent(ctx, SX, SY, SW, SH, ROT, () => {
      ctx.globalAlpha = a0;

      // header
      txt(ctx, 'CATATAN LABORATORIUM', 56, 96, {
        size: 33, font: F.mono6, color: 'rgba(23,19,16,0.80)', track: 5,
      });
      txt(ctx, 'tidur di lab, 12 malam berturut-turut', 56, 140, {
        size: 23, font: F.mono, color: 'rgba(23,19,16,0.45)', track: 0,
      });
      // right block: n
      txt(ctx, '36', SW - 56, 100, {
        size: 58, font: F.num, color: P.red2, align: 'right', track: -1,
      });
      txt(ctx, 'ORANG DEWASA', SW - 56, 138, {
        size: 19, font: F.mono6, color: 'rgba(23,19,16,0.45)', align: 'right', track: 3,
      });
      txt(ctx, 'DEPNER 2019 · CURRENT BIOLOGY', SW - 56, 170, {
        size: 17, font: F.mono, color: 'rgba(23,19,16,0.34)', align: 'right', track: 2,
      });

      ctx.fillStyle = 'rgba(23,19,16,0.20)';
      ctx.fillRect(56, 196, SW - 112, 2);

      // column headers over the night strip
      txt(ctx, 'TIAP MALAM →', X0, 250, {
        size: 17, font: F.mono6, color: 'rgba(23,19,16,0.40)', track: 4,
      });
      txt(ctx, '12 MALAM', SW - 56, 250, {
        size: 17, font: F.mono6, color: 'rgba(23,19,16,0.40)', align: 'right', track: 4,
      });

      GROUPS.forEach((g, gi) => {
        const y = ROW_Y[gi];
        const a = EASE.outCubic(clamp((t - (2.6 + gi * 3.4)) / 0.55));
        if (a < 0.01) return;
        ctx.save();
        ctx.globalAlpha = a0 * a;
        ctx.translate(0, (1 - a) * 34);

        // group badge
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(84, y + 44, 27, 0, TAU);
        ctx.fill();
        txt(ctx, g.id, 84, y + 56, {
          size: 30, font: F.mono6, color: '#F7EDD9', align: 'center', track: 0,
        });
        txt(ctx, g.h, 130, y + 46, {
          size: 46, font: F.display, color: P.ink, track: -1,
        });
        txt(ctx, g.sub, 131, y + 82, {
          size: 15, font: F.mono6, color: 'rgba(23,19,16,0.50)', track: 2,
        });

        // night cells
        g.cells.forEach((c, i) => {
          const cx = X0 + i * (CW + GAP);
          const cy = y + 8;
          const free = c === 'f';
          const cellA = EASE.outCubic(clamp((t - (3.0 + gi * 3.4) - i * 0.055) / 0.4));
          if (cellA < 0.02) return;
          ctx.save();
          ctx.globalAlpha = a0 * a * cellA;

          if (free) {
            ctx.fillStyle = 'rgba(169,100,26,0.10)';
            fillRR(ctx, cx, cy, CW, CELL_H, 7, ctx.fillStyle);
            dashRR(ctx, cx, cy, CW, CELL_H, 7, 'rgba(169,100,26,0.85)', 2.5, [7, 6]);
            sunGlyph(ctx, cx + CW / 2, cy + CELL_H / 2, 22, 0.95);
          } else {
            ctx.fillStyle = 'rgba(23,19,16,0.07)';
            fillRR(ctx, cx, cy, CW, CELL_H, 7, ctx.fillStyle);
            dashRR(ctx, cx, cy, CW, CELL_H, 7, 'rgba(23,19,16,0.22)', 2, []);
            const bh = (c / 9) * (CELL_H - 8) * cellA;
            ctx.fillStyle = g.color;
            fillRR(ctx, cx + 3, cy + CELL_H - 4 - bh, CW - 6, bh, 5, ctx.fillStyle);
          }
          ctx.restore();
        });

        // day strip under the first group only
        if (gi === 0) {
          DAYS.forEach((d, i) => {
            txt(ctx, d, X0 + i * (CW + GAP) + CW / 2, y + CELL_H + 40, {
              size: 19, font: F.mono6, color: 'rgba(23,19,16,0.42)', align: 'center', track: 1,
            });
          });
        }

        // the note for group C
        if (gi === 2) {
          ctx.save();
          ctx.globalAlpha = a0 * clamp((t - 13.6) / 0.5);
          txt(ctx, 'AKHIR PEKAN: TIDUR SEBANYAK MAU, LALU KEMBALI 5 JAM', 131, y + CELL_H + 56, {
            size: 19, font: F.mono6, color: '#A9641A', track: 2,
          });
          ctx.restore();
        }
        ctx.restore();
      });

    });

    applyGrain(ctx, 0.05);
  },
};
