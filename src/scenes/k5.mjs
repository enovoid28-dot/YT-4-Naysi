import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { P, plate, eyebrow, ease } from './_fare.mjs';
import { tag, panel, ticks, wipeText, rings } from '../engine/motion.mjs';

// 05 — JENDELA WAKTU
// A departure calendar, priced. Eight weeks of cells, one heat scale, and the
// last fourteen days lit like a warning — which is exactly what they are.

const DAYS = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
const COLS = 7;
const ROWS = 8;
const CELL = 80;
const GAP = 12;
const GW = COLS * CELL + (COLS - 1) * GAP;
const GH = ROWS * CELL + (ROWS - 1) * GAP;
const GX = (W - GW) / 2;
const GY = 676;

const heat = (v) => {
  const a1 = [0x6f, 0xe3, 0xc0];
  const b1 = [0xf5, 0xb2, 0x3c];
  const c1 = [0xe9, 0x60, 0x3f];
  const t = clamp(v);
  const mix = (p, q, k) => p.map((n, i) => Math.round(lerp(n, q[i], k)));
  return t < 0.62 ? mix(a1, b1, t / 0.62) : mix(b1, c1, (t - 0.62) / 0.38);
};

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    plate(ctx, { t, glow: P.ember, glowX: W * 0.5, glowY: 1330, glowA: 0.06, horizon: 1600 });

    eyebrow(ctx, 'DELAPAN MINGGU SEBELUM TERBANG', { a: a(0.05, 0.5), rule: P.ember });

    /* ------------------------------- legend ------------------------------ */
    const lA = a(0.4, 0.7);
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lA;
      const lx = W - 104 - 230;
      const g = linGrad(ctx, lx, 0, lx + 230, 0, [
        [0, hexA(P.mint, 0.9)], [0.55, hexA(P.amber, 0.9)], [1, hexA(P.ember, 0.95)],
      ]);
      fillRR(ctx, lx, 566, 230, 10, 5, g);
      tracking(ctx, 'MURAH', lx, 606, { size: 17, font: F.mono6, track: 4, color: hexA(P.mint, 0.75) });
      tracking(ctx, 'MAHAL', lx + 230, 606, { size: 17, font: F.mono6, track: 4, color: hexA(P.ember, 0.85), align: 'right' });
      ctx.restore();
    }

    /* ---------------------------- day headers ---------------------------- */
    const dA = a(0.45, 0.6);
    if (dA > 0.01) {
      ctx.save();
      ctx.globalAlpha = dA * 0.68;
      DAYS.forEach((d, i) => {
        tracking(ctx, d, GX + i * (CELL + GAP) + CELL / 2, GY - 28, {
          size: 18, font: F.mono6, track: 3, align: 'center',
          color: hexA(i >= 1 && i <= 3 ? P.mint : P.bone, 0.7),
        });
      });
      ctx.restore();
    }

    /* -------------------------------- cells ------------------------------ */
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const p = clamp((t - 0.55 - i * 0.013) / 0.55);
        if (p <= 0) continue;
        const e = ease.out(p);
        const week = r / (ROWS - 1);
        let v = 0.16 + Math.pow(week, 1.6) * 0.9;
        if (r >= ROWS - 2) v += 0.34;
        if (c >= 1 && c <= 3) v -= 0.10;
        if (c === 4 || c === 6) v += 0.10;
        v = clamp(v + (noise1(i * 2.3, 11) - 0.5) * 0.12);
        const col = heat(v);

        const x = GX + c * (CELL + GAP);
        const y = GY + r * (CELL + GAP);
        const s = 0.86 + 0.14 * e;
        ctx.save();
        ctx.globalAlpha = e;
        ctx.translate(x + CELL / 2, y + CELL / 2);
        ctx.scale(s, s);
        ctx.translate(-CELL / 2, -CELL / 2);
        fillRR(ctx, 0, 0, CELL, CELL, 7, `rgba(${col[0]},${col[1]},${col[2]},${0.10 + v * 0.42})`);
        strokeRR(ctx, 0, 0, CELL, CELL, 7, `rgba(${col[0]},${col[1]},${col[2]},${0.22 + v * 0.35})`, 1.2);
        const bh = 10 + v * 42;
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.9)`;
        ctx.fillRect(12, CELL - 12 - bh, 5, bh);
        ctx.restore();
      }
    }

    /* --------------------------- the last 14 days ------------------------ */
    const bandA = a(4.5, 0.8);
    if (bandA > 0.01) {
      const y0 = GY + (ROWS - 2) * (CELL + GAP) - 9;
      const hgt = 2 * CELL + GAP + 18;
      const grow = ease.out(clamp((t - 4.5) / 0.9));
      ctx.save();
      ctx.globalAlpha = bandA;
      ctx.strokeStyle = hexA(P.ember, 0.9);
      ctx.lineWidth = 2.6;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.rect(GX - 9, y0, (GW + 18) * grow, hgt);
      ctx.stroke();
      ctx.setLineDash([]);

      // the label lives in the left margin, tied to the band with a rule
      const la = bandA * clamp((t - 5.0) / 0.45);
      if (la > 0.01) {
        ctx.globalAlpha = la;
        tracking(ctx, '14 HARI', 104, y0 + 44, {
          size: 26, font: F.mono6, track: 4, color: P.ember,
        });
        tracking(ctx, 'TERAKHIR', 104, y0 + 80, {
          size: 26, font: F.mono6, track: 4, color: hexA(P.ember, 0.8),
        });
        tracking(ctx, 'HARGA PALING TINGGI', 104, y0 + 120, {
          size: 16, font: F.mono6, track: 3, color: hexA(P.bone, 0.34),
        });
        ctx.fillStyle = hexA(P.ember, 0.55);
        ctx.fillRect(104 + 176, y0 + 34, 96, 2);
      }
      ctx.restore();
    }

    /* -------------------------- weekday bracket -------------------------- */
    const brA = a(6.9, 0.8);
    if (brA > 0.01) {
      const bx0 = GX + 1 * (CELL + GAP);
      const bx1 = GX + 4 * (CELL + GAP) - GAP;
      const by = GY + GH + 30;
      const grow = ease.out(clamp((t - 6.9) / 0.8));
      const xm = lerp(bx0, bx1, grow);
      ctx.save();
      ctx.globalAlpha = brA;
      ctx.strokeStyle = hexA(P.mint, 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx0, by);
      ctx.lineTo(xm, by);
      if (grow > 0.98) {
        ctx.moveTo(bx0, by - 12);
        ctx.lineTo(bx0, by + 4);
        ctx.moveTo(bx1, by - 12);
        ctx.lineTo(bx1, by + 4);
      }
      ctx.stroke();
      if (grow > 0.7) {
        tracking(ctx, 'SELASA–KAMIS LEBIH MURAH', (bx0 + bx1) / 2, by + 44, {
          size: 21, font: F.mono6, track: 4, color: hexA(P.mint, 0.9), align: 'center',
        });
      }
      ctx.restore();
    }

    /* ----------------------------- incognito ---------------------------- */
    const inA = a(9.4, 0.7);
    if (inA > 0.01) {
      const y = 1580;
      const label = 'MODE INCOGNITO';
      const lw = measure(ctx, label, 25, F.mono6, 5) + 5;
      const w = lw + 82;
      const x = W / 2 - w / 2;
      const s = ease.expo(clamp((t - 9.4) / 0.7));
      ctx.save();
      ctx.globalAlpha = inA;
      ctx.translate(0, (1 - s) * 16);
      fillRR(ctx, x, y - 34, w, 68, 8, 'rgba(12,18,26,0.92)');
      strokeRR(ctx, x, y - 34, w, 68, 8, hexA(P.bone, 0.18), 1.2);
      ctx.strokeStyle = hexA(P.bone, 0.5);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(x + 36, y, 14, Math.PI * 0.15, Math.PI * 0.9);
      ctx.stroke();
      tracking(ctx, label, x + 64, y + 9, {
        size: 25, font: F.mono6, track: 5, color: hexA(P.bone, 0.55),
      });
      const sp = ease.out(clamp((t - 10.0) / 0.5));
      ctx.globalAlpha = inA * 0.95;
      ctx.fillStyle = P.ember;
      ctx.fillRect(x + 14, y - 2, (w - 28) * sp, 3);
      ctx.restore();
    }
  },
};
