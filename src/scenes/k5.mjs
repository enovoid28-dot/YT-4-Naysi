import { W, H, C, M, txt, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { nightRoom, darkKicker, glowSpot, applyGrain, P } from './_ep5.mjs';
import { plate, snackPile, softSeat, tapeStrip } from './_props.mjs';

// 05 — OTAK. The reward signal plotted across the day, and the plate it fills.
// Two plates of the same snack table: enough sleep eats once, short sleep twice.
const H0 = 8;
const H1 = 24;
const BX = 130;
const BW = W - 2 * BX;
const xOfH = (h) => BX + ((h - H0) / (H1 - H0)) * BW;

// rough shape of the endocannabinoid signal across the day
const NORMAL = [0.18, 0.22, 0.30, 0.33, 0.24, 0.16, 0.10, 0.06, 0.04];
const SHORT = [0.22, 0.30, 0.38, 0.48, 0.47, 0.44, 0.40, 0.20, 0.10];
const smooth = (arr, u) => {
  const f = u * (arr.length - 1);
  const i = Math.min(arr.length - 2, Math.floor(f));
  const k = f - i;
  return lerp(arr[i], arr[i + 1], (1 - Math.cos(k * Math.PI)) / 2);
};

export default {
  draw(ctx, t) {
    nightRoom(ctx, { tableY: 1180, warm: 0.08, cold: 0.10, coldX: 0.86 });
    darkKicker(ctx, 'SINYAL HADIAH, SEHARIAN', { y: 288 });

    const baseY = 860;
    const amp = 300;
    const yOf = (v) => baseY - v * amp;

    // ---- hour axis -------------------------------------------------------
    const aA = EASE.outCubic(clamp((t - 0.3) / 0.7));
    ctx.save();
    ctx.globalAlpha = aA;
    for (let h = H0; h <= H1; h += 2) {
      const x = xOfH(h);
      const big = h % 4 === 0;
      ctx.fillStyle = hexA('#F2E7D3', big ? 0.28 : 0.14);
      ctx.fillRect(x, baseY, 2, big ? 26 : 14);
      if (big) {
        txt(ctx, String(h).padStart(2, '0'), x, baseY + 58, {
          size: 24, font: F.mono, color: hexA('#F2E7D3', 0.45), align: 'center', track: 1,
        });
      }
    }
    ctx.fillStyle = hexA('#F2E7D3', 0.18);
    ctx.fillRect(BX, baseY, BW, 2);
    txt(ctx, 'JAM', xOfH(H1), baseY + 104, {
      size: 20, font: F.mono6, color: hexA('#F2E7D3', 0.35), align: 'right', track: 4,
    });
    ctx.restore();

    // ---- the band that stays up until 21.00 ------------------------------
    const bA = EASE.outCubic(clamp((t - 8.4) / 0.8));
    if (bA > 0.01) {
      const bx0 = xOfH(14);
      const bx1 = xOfH(21);
      ctx.save();
      ctx.globalAlpha = bA;
      ctx.fillStyle = 'rgba(226,69,47,0.12)';
      ctx.fillRect(bx0, yOf(0.52), (bx1 - bx0) * bA, amp * 0.52 + 4);
      ctx.strokeStyle = 'rgba(226,69,47,0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 8]);
      ctx.beginPath();
      ctx.moveTo(bx0, yOf(0.52));
      ctx.lineTo(bx0, baseY);
      ctx.moveTo(bx1, yOf(0.52));
      ctx.lineTo(bx1, baseY);
      ctx.stroke();
      ctx.restore();
      txt(ctx, 'MASIH TINGGI', (bx0 + bx1) / 2, baseY - 24, {
        size: 23, font: F.mono6, color: P.red, align: 'center', track: 5, alpha: bA,
      });
    }

    // ---- the two curves ---------------------------------------------------
    const curve = (arr, reveal, color, lw, alpha) => {
      if (reveal <= 0.002) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      const steps = 110;
      const n = Math.max(2, Math.floor(steps * reveal));
      for (let i = 0; i <= n; i++) {
        const u = i / steps;
        const x = BX + u * BW;
        const y = yOf(smooth(arr, u));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    };
    curve(NORMAL, EASE.outCubic(clamp((t - 1.2) / 1.6)), hexA('#F2E7D3', 0.34), 5, 1);
    curve(SHORT, EASE.outCubic(clamp((t - 2.2) / 2.0)), P.red, 10, 1);

    // peak marker + 33%
    const pA = EASE.outCubic(clamp((t - 4.6) / 0.6));
    if (pA > 0.01) {
      const px = xOfH(14.2);
      const py = yOf(smooth(SHORT, (14.2 - H0) / (H1 - H0)));
      ctx.save();
      ctx.globalAlpha = pA;
      ctx.fillStyle = P.red;
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(226,69,47,0.22)';
      ctx.beginPath();
      ctx.arc(px, py, 30, 0, TAU);
      ctx.fill();
      txt(ctx, '+33%', px + 44, py - 44, { size: 86, font: F.head, color: P.red, track: -2 });
      txt(ctx, '2-AG · SINYAL HADIAH', px + 46, py - 2, {
        size: 21, font: F.mono6, color: hexA('#F2E7D3', 0.55), track: 3,
      });
      ctx.restore();
    }

    // legend
    const lA = clamp((t - 1.0) / 0.6);
    ctx.save();
    ctx.globalAlpha = lA;
    ctx.fillStyle = hexA('#F2E7D3', 0.34);
    ctx.fillRect(BX, 470, 36, 5);
    txt(ctx, 'TIDUR CUKUP', BX + 50, 478, {
      size: 20, font: F.mono6, color: hexA('#F2E7D3', 0.5), track: 3,
    });
    ctx.fillStyle = P.red;
    ctx.fillRect(BX + 330, 470, 36, 5);
    txt(ctx, 'KURANG TIDUR', BX + 380, 478, {
      size: 20, font: F.mono6, color: hexA('#F2E7D3', 0.7), track: 3,
    });
    ctx.restore();

    // ---- two plates -------------------------------------------------------
    const plA = EASE.outCubic(clamp((t - 11.6) / 0.8));
    if (plA > 0.01) {
      const grow = EASE.outCubic(clamp((t - 12.6) / 1.2));
      ctx.save();
      ctx.globalAlpha = plA;

      txt(ctx, 'TIDUR CUKUP', 384, 1010, {
        size: 26, font: F.mono6, color: hexA('#F2E7D3', 0.55), align: 'center', track: 4,
      });
      softSeat(ctx, 384, 1246, 250, 0.5);
      plate(ctx, 384, 1216, 216, { a: plA });
      snackPile(ctx, 384, 1186, 190, 15, { a: plA, seed: 7 });

      txt(ctx, 'KURANG TIDUR', 1056, 1010, {
        size: 26, font: F.mono6, color: P.red, align: 'center', track: 4,
      });
      softSeat(ctx, 1056, 1246, 250, 0.5);
      plate(ctx, 1056, 1216, 216, { a: plA });
      snackPile(ctx, 1056, 1156, 240, Math.round(15 + 22 * grow), { a: plA, seed: 21 });
      ctx.restore();

      const xA = EASE.outCubic(clamp((t - 13.8) / 0.6));
      if (xA > 0.01) {
        ctx.save();
        ctx.globalAlpha = xA;
        txt(ctx, '1×', 384, 1380, {
          size: 54, font: F.mono6, color: hexA('#F2E7D3', 0.4), align: 'center', track: 2,
        });
        txt(ctx, '2×', 1056, 1380, {
          size: 54, font: F.mono6, color: P.red, align: 'center', track: 2,
        });
        txt(ctx, 'LEMAK YANG DIMAKAN · HANLON 2016', W / 2, 1476, {
          size: 20, font: F.mono, color: hexA('#F2E7D3', 0.4), align: 'center', track: 1,
          maxWidth: W - 2 * M,
        });
        ctx.restore();
      }
    }

    void C; void fillRR; void measure; void glowSpot; void tapeStrip; void linGrad; void radGrad;
    applyGrain(ctx, 0.055);
  },
};
