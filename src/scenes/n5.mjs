import { W, H, txt, hexA, linGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { U, ease, studio, bokeh } from './_uang.mjs';

// 05 — YANG SEDANG TERJADI
// The claim stops being an opinion: one number counted on screen, one line
// drawn under it, one source printed small. The curve is real data.

const SERIES = [18.38, 18.62, 19.05, 19.42, 19.86, 20.31, 20.66, 21.35, 22.78, 22.99, 24.05, 24.33];
const MONTHS = ['SEP', 'OKT', 'NOV', 'DES', 'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU'];

const CX = 118;
const CW = W - 236;
const CY0 = 600;
const CH = 470;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    studio(ctx, { t, glow: U.mint, glowX: W * 0.62, glowY: 620, glowA: 0.09, horizon: 1420 });
    bokeh(ctx, t, { a: 0.7 });

    const ha = a(0.02, 0.5);
    tracking(ctx, 'DATA · BUKAN PENDAPAT', 104, 200, { size: 24, font: F.mono6, track: 6, color: hexA(U.bone, 0.45), alpha: ha });
    tracking(ctx, 'OJK · SLIK AGUSTUS 2025', W - 104, 200, { size: 24, font: F.mono6, track: 5, color: hexA(U.mint, 0.6), align: 'right', alpha: ha });

    const cp = ease.out(clamp((t - 0.45) / 1.7));
    const val = 24.33 * cp;
    const str = val.toFixed(2).replace('.', ',');

    tracking(ctx, 'UTANG PAYLATER DI BANK', CX, 352, { size: 24, font: F.mono6, track: 7, color: hexA(U.bone, 0.5), alpha: a(0.25, 0.5) });
    ctx.save();
    ctx.globalAlpha = a(0.3, 0.6);
    txt(ctx, 'Rp', CX, 520, { size: 76, font: F.num, color: hexA(U.bone, 0.45), track: -2 });
    txt(ctx, str, CX + 128, 520, { size: 168, font: F.num, color: U.bone, track: -6 });
    const tw = measure(ctx, str, 168, F.num, -6);
    txt(ctx, 'T', CX + 128 + tw + 26, 520, { size: 92, font: F.num, color: U.amber, track: -2 });
    ctx.restore();

    const chp = ease.out(clamp((t - 2.15) / 0.55));
    if (chp > 0.01) {
      ctx.save();
      ctx.globalAlpha = chp;
      const ny = 320;
      const nw = 330;
      const nx = W - 104 - nw;
      fillRR(ctx, nx, ny, nw, 58, 10, hexA(U.mint, 0.12));
      strokeRR(ctx, nx, ny, nw, 58, 10, hexA(U.mint, 0.55), 1.6);
      txt(ctx, '▲ 32,35%', nx + 20, ny + 39, { size: 28, font: F.mono6, color: U.mint, track: 1 });
      txt(ctx, 'SETAHUN', nx + nw - 18, ny + 39, { size: 20, font: F.mono6, color: hexA(U.mint, 0.7), align: 'right', track: 3 });
      ctx.restore();
    }

    const gp = a(1.9, 0.6);
    if (gp > 0.01) {
      const min = 17.6;
      const max = 25.0;
      const px = (i) => CX + 40 + ((CW - 80) * i) / (SERIES.length - 1);
      const py = (v) => CY0 + CH - ((v - min) / (max - min)) * CH;

      ctx.save();
      ctx.globalAlpha = gp * 0.85;
      tracking(ctx, 'RP TRILIUN', CX + CW, CY0 - 26, { size: 17, font: F.mono6, track: 4, color: hexA(U.bone, 0.28), align: 'right' });
      for (let k = 0; k <= 4; k++) {
        const yy = CY0 + (CH * k) / 4;
        ctx.fillStyle = hexA(U.bone, k === 4 ? 0.14 : 0.06);
        ctx.fillRect(CX, yy, CW, 1.2);
        const v = max - ((max - min) * k) / 4;
        txt(ctx, v.toFixed(1).replace('.', ','), CX - 12, yy + 6, { size: 19, font: F.mono, color: hexA(U.bone, 0.30), align: 'right' });
      }
      ctx.restore();

      const draw = ease.inOut(clamp((t - 2.05) / 2.1));
      const n = SERIES.length;
      const upto = draw * (n - 1);
      ctx.save();
      ctx.globalAlpha = gp;

      ctx.beginPath();
      ctx.moveTo(px(0), py(SERIES[0]));
      for (let i = 1; i < n; i++) {
        const p = clamp(upto - i + 1);
        if (p <= 0) break;
        ctx.lineTo(px(i - 1 + p), py(lerp(SERIES[i - 1], SERIES[i], p)));
      }
      ctx.lineTo(px(Math.min(n - 1, upto)), CY0 + CH);
      ctx.lineTo(px(0), CY0 + CH);
      ctx.closePath();
      ctx.fillStyle = linGrad(ctx, 0, CY0, 0, CY0 + CH, [[0, hexA(U.mint, 0.24)], [1, hexA(U.mint, 0.0)]]);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(px(0), py(SERIES[0]));
      for (let i = 1; i < n; i++) {
        const p = clamp(upto - i + 1);
        if (p <= 0) break;
        ctx.lineTo(px(i - 1 + p), py(lerp(SERIES[i - 1], SERIES[i], p)));
      }
      ctx.strokeStyle = U.mint;
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.shadowColor = hexA(U.mint, 0.65);
      ctx.shadowBlur = 26;
      ctx.stroke();
      ctx.shadowBlur = 0;

      for (let i = 0; i < n; i++) {
        const p = clamp(upto - i + 1);
        if (p <= 0.02) continue;
        ctx.globalAlpha = gp * p;
        ctx.fillStyle = '#05090E';
        ctx.beginPath();
        ctx.arc(px(i), py(SERIES[i]), 7, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = U.mint;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      const lx = px(n - 1);
      const ly = py(SERIES[n - 1]);
      for (let k = 0; k < 2; k++) {
        const q = ((t * 0.7 + k * 0.5) % 1);
        ctx.globalAlpha = gp * (1 - q) * 0.5;
        ctx.strokeStyle = U.mint;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(lx, ly, 16 + q * 70, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = gp;
      ctx.fillStyle = U.mint;
      ctx.beginPath();
      ctx.arc(lx, ly, 9, 0, TAU);
      ctx.fill();
      MONTHS.forEach((m, i) => {
        if (i % 2 && i !== MONTHS.length - 1) return;
        txt(ctx, m, px(i), CY0 + CH + 44, { size: 19, font: F.mono6, color: hexA(U.bone, 0.32), align: 'center', track: 2 });
      });
      ctx.restore();
    }

    const sa = a(4.55, 0.55);
    if (sa > 0.01) {
      const yy = 1250;
      const cols = [
        { k: '29,33 JT', l: 'REKENING AKTIF', c: U.amber },
        { k: '56,7%', l: 'NAIK PEMBIAYAAN', c: U.ember },
        { k: '2,95%', l: 'BUNGA PER BULAN', c: U.bone },
      ];
      const cw = (W - 208) / 3;
      cols.forEach((col, i) => {
        const p = a(4.55 + i * 0.12, 0.45);
        if (p <= 0.01) return;
        const x = CX + cw * i;
        ctx.save();
        ctx.globalAlpha = p * sa;
        ctx.fillStyle = hexA(U.bone, 0.12);
        ctx.fillRect(x, yy - 46, 2, 130);
        txt(ctx, col.k, x + 30, yy, { size: 62, font: F.num, color: col.c, track: -2 });
        tracking(ctx, col.l, x + 30, yy + 44, { size: 19, font: F.mono6, track: 4, color: hexA(U.bone, 0.42) });
        ctx.restore();
      });
    }

    const src = a(6.1, 0.5);
    if (src > 0.01) {
      tracking(ctx, 'SUMBER: OJK · SLIK · AGU 2025 · RP TRILIUN', W / 2, 1560, { size: 19, font: F.mono6, track: 4, color: hexA(U.bone, 0.26), align: 'center', alpha: src });
    }
  },
};
