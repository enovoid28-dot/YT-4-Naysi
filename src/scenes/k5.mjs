import { W, H, C, M, txt, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { paperRoom, paperKicker, sheet, sheetContent, stamp, applyGrain, P } from './_ep6.mjs';

// 05 — HARGA. The lab readout: insulin sensitivity, measured against each
// person's own baseline. The group that tried to repay fell further.
const SX = 96;
const SY = 296;
const SW = W - 192;
const SH = 1214;
const ROT = 0.009;

const BASE = 470;
const PX = 21.0;          // px per percent
const STEM_W = 132;
const STEMS = [
  { x: 396, drop: 27, name: 'PENEBUS', sub: 'tidur bebas akhir pekan', color: P.red2, at: 1.0 },
  { x: 848, drop: 13, name: 'TANPA PENEBUSAN', sub: '5 jam, sembilan malam', color: P.teal, at: 7.8 },
];

export default {
  draw(ctx, t) {
    paperRoom(ctx);
    paperKicker(ctx, 'HARGA YANG DIBAYAR', { y: 236 });

    const a0 = EASE.outCubic(clamp((t - 0.1) / 0.7));
    sheet(ctx, SX, SY, SW, SH, { a: a0, rot: ROT, lift: 1.05, fill: '#F5EBD6' });
    if (a0 < 0.35) {
      applyGrain(ctx, 0.05);
      return;
    }

    sheetContent(ctx, SX, SY, SW, SH, ROT, () => {
      ctx.globalAlpha = a0;

      // header
      txt(ctx, 'SENSITIVITAS INSULIN', 56, 104, {
        size: 34, font: F.mono6, color: 'rgba(23,19,16,0.80)', track: 5,
      });
      txt(ctx, 'perubahan dari garis awal masing-masing, dalam persen', 56, 148, {
        size: 22, font: F.mono, color: 'rgba(23,19,16,0.45)',
      });

      // the baseline every subject starts from
      txt(ctx, 'GARIS AWAL 100%', 56, BASE - 26, {
        size: 20, font: F.mono6, color: 'rgba(23,19,16,0.50)', track: 3,
      });
      ctx.fillStyle = 'rgba(23,19,16,0.55)';
      ctx.fillRect(56, BASE, SW - 112, 3);
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = 'rgba(23,19,16,0.18)';
        ctx.fillRect(56 + i * 46, BASE - 10, 2, 10);
      }

      STEMS.forEach((st) => {
        const a = EASE.outCubic(clamp((t - st.at) / 0.9));
        if (a < 0.01) return;
        const len = st.drop * PX * a;
        const x = st.x;
        ctx.save();
        ctx.globalAlpha = a0;

        // name tag above the baseline
        txt(ctx, st.name, x, BASE - 74, {
          size: 27, font: F.mono6, color: 'rgba(23,19,16,0.72)', track: 3,
        });
        txt(ctx, st.sub, x, BASE - 40, {
          size: 19, font: F.mono, color: 'rgba(23,19,16,0.40)',
        });

        // the fall, drawn as a solid column of lost sensitivity
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 26;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = linGrad(ctx, 0, BASE, 0, BASE + len, [
          [0, st.color], [1, hexA(st.color, 0.72)],
        ]);
        fillRR(ctx, x, BASE, STEM_W, Math.max(6, len), 8, ctx.fillStyle);
        ctx.restore();
        // hatching on the column reads as "measured", not "filled"
        ctx.save();
        rr(ctx, x, BASE, STEM_W, Math.max(6, len), 8);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.lineWidth = 2;
        for (let yy = BASE + 8; yy < BASE + len; yy += 16) {
          ctx.beginPath();
          ctx.moveTo(x, yy);
          ctx.lineTo(x + STEM_W, yy - 26);
          ctx.stroke();
        }
        ctx.restore();

        // the number at the bottom of the fall
        const nA = clamp((t - st.at - 0.5) / 0.5);
        if (nA > 0.01) {
          ctx.save();
          ctx.globalAlpha = a0 * nA;
          txt(ctx, `−${st.drop}%`, x + STEM_W / 2, BASE + len + 118, {
            size: 104, font: F.num, color: st.color, align: 'center', track: -3,
          });
          ctx.fillStyle = hexA(st.color, 0.35);
          ctx.fillRect(x + STEM_W / 2 - 46, BASE + len + 148, 92, 3);
          ctx.restore();
        }
        ctx.restore();
      });

    });

    // the verdict
    const sA = clamp((t - 11.0) / 0.4);
    if (sA > 0.01) {
      ctx.save();
      ctx.globalAlpha = sA;
      txt(ctx, 'YANG MEMBAYAR', 104, 1622, {
        size: 52, font: F.display, color: P.ink, track: -1,
      });
      txt(ctx, 'JUSTRU LEBIH BURUK', 104, 1686, {
        size: 52, font: F.display, color: P.red2, track: -1,
      });
      ctx.restore();
    }

    void strokeRR; void radGrad; void measure; void lerp; void TAU; void C; void M; void stamp;
    applyGrain(ctx, 0.05);
  },
};
