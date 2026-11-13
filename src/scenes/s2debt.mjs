import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  labelChip,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, spring, TAU } from '../engine/anim.mjs';
import { hatch } from '../art/kit.mjs';

const BASE = 1470;
const PXH = 76;               // pixels per hour
const AX = 252;               // y-axis x
const XW = 998;               // plot width
const N = 7;
const SLOT = XW / N;
const BW = 86;
const GOT = 6;
const NEED = 8;
const DAYS = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
const y = (h) => BASE - h * PXH;
const bx = (i) => AX + i * SLOT + (SLOT - BW) / 2;

function gridline(ctx, h, a, strong = false) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.setLineDash(strong ? [] : [5, 14]);
  ctx.strokeStyle = hexA(C.bone, strong ? 0.16 : 0.09);
  ctx.lineWidth = strong ? 2 : 2;
  ctx.beginPath();
  ctx.moveTo(AX, y(h));
  ctx.lineTo(AX + XW, y(h));
  ctx.stroke();
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    const bg = linGrad(ctx, 0, 240, 0, 1720, [
      [0, '#080A12'],
      [0.5, '#06080E'],
      [1, '#080A11'],
    ]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 240, W, 1480);

    tracking(ctx, 'SIKLUS 24 JAM', M, 330, {
      size: 25, font: F.num6, track: 6, color: hexA(C.bone, 0.5),
    });

    /* -------------------------------------------------------------- axes -- */
    const aA = clamp((t - 0.1) / 0.6);
    ctx.save();
    ctx.globalAlpha = aA;
    // y axis
    ctx.strokeStyle = hexA(C.bone, 0.18);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(AX, y(10));
    ctx.lineTo(AX, BASE);
    ctx.stroke();
    for (let h = 2; h <= 10; h += 2) {
      const a = clamp((t - 0.15 - h * 0.02) / 0.4);
      gridline(ctx, h, a * 0.9);
      ctx.save();
      ctx.globalAlpha = a * 0.75;
      tracking(ctx, String(h), AX - 18, y(h) + 8, {
        size: 21, font: F.num6, track: 2, align: 'right', color: hexA(C.bone, 0.55),
      });
      ctx.restore();
    }
    // unit
    tracking(ctx, 'JAM', AX - 18, y(10) - 26, {
      size: 18, font: F.num6, track: 3, align: 'right', color: hexA(C.bone, 0.35),
    });
    ctx.restore();

    /* ---------------------------------------------------- recommendation -- */
    const bA = clamp((t - 0.35) / 0.6);
    if (bA > 0) {
      ctx.save();
      ctx.globalAlpha = bA;
      const g = linGrad(ctx, 0, y(9), 0, y(7), [
        [0, 'rgba(255,176,58,0.015)'],
        [1, 'rgba(255,176,58,0.075)'],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(AX, y(9), XW, y(7) - y(9));
      ctx.setLineDash([8, 10]);
      ctx.strokeStyle = hexA(C.amber, 0.28);
      ctx.lineWidth = 2;
      [9, 7].forEach((h) => {
        ctx.beginPath();
        ctx.moveTo(AX, y(h));
        ctx.lineTo(AX + XW, y(h));
        ctx.stroke();
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- bars -- */
    for (let i = 0; i < N; i++) {
      const x = bx(i);
      const delay = 0.22 + i * 0.055;
      const p = clamp((t - delay) / 0.55);
      if (p <= 0) continue;
      const grow = spring(p, 11.5, 0.62);
      const hNow = GOT * grow;
      const top = y(hNow);

      // contact shadow
      ctx.save();
      ctx.globalAlpha = clamp(p * 1.4) * 0.7;
      const cs = radGrad(ctx, x + BW / 2, BASE + 6, 0, BW * 0.9, [
        [0, 'rgba(0,0,0,0.75)'],
        [1, 'rgba(0,0,0,0)'],
      ]);
      ctx.fillStyle = cs;
      ctx.beginPath();
      ctx.ellipse(x + BW / 2, BASE + 6, BW * 0.9, 16, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      // column
      const cg = linGrad(ctx, 0, top, 0, BASE, [
        [0, 'rgba(247,242,231,0.30)'],
        [0.45, 'rgba(247,242,231,0.17)'],
        [1, 'rgba(247,242,231,0.09)'],
      ]);
      ctx.save();
      fillRR(ctx, x, top, BW, BASE - top, 10, cg);
      // left edge light, right edge shade
      const eg = linGrad(ctx, x, 0, x + BW, 0, [
        [0, 'rgba(255,255,255,0.10)'],
        [0.18, 'rgba(255,255,255,0)'],
        [0.86, 'rgba(0,0,0,0)'],
        [1, 'rgba(0,0,0,0.22)'],
      ]);
      ctx.fillStyle = eg;
      rr(ctx, x, top, BW, BASE - top, 10);
      ctx.fill();
      // bright cap
      ctx.globalAlpha = clamp(p * 1.6);
      fillRR(ctx, x, top, BW, 5, 2.5, hexA(C.amberHi, 0.85));
      ctx.restore();
    }

    /* ------------------------------------------------------------ deficit -- */
    const dA = clamp((t - 1.45) / 0.6);
    for (let i = 0; i < N; i++) {
      if (dA <= 0) break;
      const x = bx(i);
      const top = y(NEED);
      const h = y(GOT) - y(NEED);
      const fillP = clamp((t - (6.9 + i * 0.05)) / 0.4);
      ctx.save();
      ctx.globalAlpha = dA * 0.95;
      if (fillP > 0) {
        fillRR(ctx, x, top, BW, h, 8, hexA(C.amber, 0.07 + 0.15 * fillP));
      }
      hatch(ctx, x, top, BW, h, {
        color: hexA(C.amber, 0.10 + 0.16 * fillP), spacing: 22, lw: 1.5, r: 8,
      });
      ctx.save();
      ctx.setLineDash([9, 9]);
      strokeRR(ctx, x + 1, top + 1, BW - 2, h - 2, 8, hexA(C.amber, 0.5), 2);
      ctx.restore();
      ctx.restore();

      if (i === 0) {
        const la = dA * clamp((t - 2.0) / 0.4);
        ctx.save();
        ctx.globalAlpha = la;
        txt(ctx, '−2', x + BW / 2, y(7) + 12, {
          size: 34, font: F.num, color: C.amber, align: 'center',
        });
        ctx.restore();
      }
    }

    /* ----------------------------------------------------------- baseline -- */
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.25 * clamp((t - 0.2) / 0.5);
    const bl = linGrad(ctx, AX, 0, AX + XW, 0, [
      [0, hexA(C.bone, 0.25)],
      [0.5, hexA(C.bone, 0.55)],
      [1, hexA(C.bone, 0.25)],
    ]);
    ctx.fillStyle = bl;
    ctx.fillRect(AX, BASE, XW, 2.5);
    ctx.restore();

    // day labels
    for (let i = 0; i < N; i++) {
      const a = clamp((t - 0.3 - i * 0.05) / 0.4);
      ctx.save();
      ctx.globalAlpha = a * (i === 6 ? 0.95 : 0.42);
      tracking(ctx, DAYS[i], bx(i) + BW / 2, BASE + 40, {
        size: 21, font: F.num6, track: 4, align: 'center',
        color: i === 6 ? C.amber : C.bone,
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- chips -- */
    const c1 = clamp((t - 3.05) / 0.3);
    if (c1 > 0) {
      ctx.save();
      ctx.globalAlpha = c1;
      const dx = (1 - EASE.outCubic(c1)) * -24;
      labelChip(ctx, 'KAMU DAPAT 6 JAM', M + dx, 640, {
        size: 27, font: F.num6, track: 4, padX: 20, padY: 14, align: 'left',
        dot: C.bone, dotColor: hexA(C.bone, 0.85),
      });
      ctx.restore();
    }
    const c2 = clamp((t - 0.55) / 0.35);
    if (c2 > 0) {
      ctx.save();
      ctx.globalAlpha = c2;
      labelChip(ctx, 'BUTUH 7–9 JAM', AX + XW, y(10) - 22, {
        size: 22, font: F.num6, track: 4, padX: 18, padY: 12, align: 'right',
        bg: 'rgba(20,14,4,0.85)', border: 'rgba(255,176,58,0.35)',
        dot: C.amber, dotColor: C.amber, color: C.amber,
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- total -- */
    const tot = clamp((t - 10.3) / 1.1);
    if (tot > 0) {
      const v = Math.round(EASE.outCubic(clamp((t - 10.3) / 0.9)) * 14);
      ctx.save();
      ctx.globalAlpha = clamp(tot * 2.2);
      txt(ctx, `${v}`, W - M - 92, 500, {
        size: 160, font: F.num, color: C.amber, align: 'right', track: -4,
        glowBlur: 26, glowColor: hexA(C.amber, 0.35),
      });
      txt(ctx, 'JAM', W - M, 502, {
        size: 44, font: F.num, color: hexA(C.amber, 0.85), align: 'right',
      });
      tracking(ctx, 'UTANG TIDUR', W - M, 556, {
        size: 20, font: F.num6, track: 4, align: 'right', color: hexA(C.bone, 0.5),
      });
      ctx.restore();
    }

    /* ------------------------------------------------------------ squares -- */
    const sq = clamp((t - 9.9) / 0.5);
    if (sq > 0) {
      ctx.save();
      const s = 30;
      const gap = 12;
      let x = AX + 56;
      for (let i = 0; i < N; i++) {
        const a = clamp((t - 9.9 - i * 0.07) / 0.25);
        if (a > 0) {
          ctx.globalAlpha = a;
          fillRR(ctx, x, 1604, s, s, 6, hexA(C.amber, 0.9));
        }
        x += s + gap;
      }
      ctx.globalAlpha = clamp((t - 10.2) / 0.5);
      txt(ctx, '× 2 JAM', x + 18, 1632, {
        size: 30, font: F.num6, color: hexA(C.bone, 0.72), track: 2,
      });
      ctx.restore();
    }
  },
};
