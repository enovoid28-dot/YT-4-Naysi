import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  labelChip,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, spring, TAU } from '../engine/anim.mjs';

const BASE = 1460;
const UNIT = 86;
const CW = 84;
const GAP = 40;
const NEED = 8;
const GOT = 6;
const N = 7;
const X0 = Math.round((W - (N * CW + (N - 1) * GAP)) / 2);
const DAYS = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
const y = (h) => BASE - h * UNIT;

function block(ctx, x, top, h, o = {}) {
  const { fill = 'rgba(247,242,231,0.14)', stroke = null, dash = null, lw = 2, r = 8 } = o;
  fillRR(ctx, x, top, CW, h, r, fill);
  if (stroke) {
    ctx.save();
    if (dash) ctx.setLineDash(dash);
    strokeRR(ctx, x + 1, top + 1, CW - 2, h - 2, r, stroke, lw);
    ctx.restore();
  }
}

export default {
  draw(ctx, t, scene, meta) {
    // background wash
    const bg = linGrad(ctx, 0, 200, 0, 1700, [
      [0, '#070910'],
      [0.55, '#05070C'],
      [1, '#080A11'],
    ]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 200, W, 1500);

    tracking(ctx, 'SIKLUS 24 JAM', M, 330, {
      size: 25, font: F.num6, track: 6, color: hexA(C.bone, 0.5),
    });

    // need band 7-9h
    const bandA = clamp((t - 0.1) / 0.6);
    if (bandA > 0) {
      ctx.save();
      ctx.globalAlpha = bandA * 0.9;
      const g = linGrad(ctx, 0, y(9), 0, y(7), [
        [0, 'rgba(255,176,58,0.005)'],
        [1, 'rgba(255,176,58,0.055)'],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(X0 - 24, y(9), N * CW + (N - 1) * GAP + 48, UNIT * 2);
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = hexA(C.amber, 0.22);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X0 - 24, y(9));
      ctx.lineTo(X0 - 24 + N * CW + (N - 1) * GAP + 48, y(9));
      ctx.stroke();
      ctx.restore();
    }

    // bars
    for (let i = 0; i < N; i++) {
      const x = X0 + i * (CW + GAP);
      const delay = 0.22 + i * 0.055;
      const p = clamp((t - delay) / 0.55);
      if (p <= 0) continue;
      const grow = spring(p, 12, 0.6);
      for (let h = 1; h <= GOT; h++) {
        const hh = UNIT - 8;
        const top = y(h) + 8 - (1 - grow) * (BASE - y(h));
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, top - 8, CW, BASE - top + 40);
        ctx.clip();
        block(ctx, x, top, hh, { fill: 'rgba(247,242,231,0.13)' });
        ctx.restore();
      }
      // hour scale feel: amber cap
      ctx.save();
      ctx.globalAlpha = clamp(p * 2) * 0.9;
      fillRR(ctx, x, y(GOT) + 2, CW, 6, 3, hexA(C.bone, 0.55));
      ctx.restore();
    }

    // missing hours, dashed
    const mA = clamp((t - 1.5) / 0.7);
    for (let i = 0; i < N; i++) {
      const x = X0 + i * (CW + GAP);
      for (let h = GOT + 1; h <= NEED; h++) {
        const filled = clamp((t - (6.9 + i * 0.05)) / 0.35);
        ctx.save();
        ctx.globalAlpha = mA * 0.85;
        block(ctx, x, y(h) + 8, UNIT - 8, {
          fill: filled > 0 ? hexA(C.amber, 0.06 + 0.16 * filled) : 'rgba(255,176,58,0.03)',
          stroke: hexA(C.amber, 0.55),
          dash: [9, 9],
          lw: 2,
        });
        ctx.restore();
      }
      // the -2 badge inside the upper missing block
      const a2 = mA * clamp((t - 2.1) / 0.4) * (i === 0 || i === N - 1 ? 1 : 0);
      if (a2 > 0) {
        ctx.save();
        ctx.globalAlpha = a2;
        txt(ctx, '−2', x + CW / 2, y(7) + 46, {
          size: 30, font: F.num6, color: hexA(C.amber, 0.95), align: 'center',
        });
        ctx.restore();
      }
    }

    // baseline
    ctx.save();
    ctx.globalAlpha = 0.5 * mA + 0.2;
    ctx.fillStyle = C.bone;
    ctx.fillRect(M, BASE, W - 2 * M, 3);
    ctx.restore();

    // day labels
    for (let i = 0; i < N; i++) {
      const x = X0 + i * (CW + GAP) + CW / 2;
      const a = clamp((t - 0.3 - i * 0.05) / 0.4);
      ctx.save();
      ctx.globalAlpha = a * (i === 6 ? 0.85 : 0.45);
      tracking(ctx, DAYS[i], x, BASE + 44, {
        size: 22, font: F.num6, track: 4, align: 'center',
        color: i === 6 ? C.amber : C.bone,
      });
      ctx.restore();
    }

    // chip: what you actually get
    const c1 = clamp((t - 3.1) / 0.3);
    if (c1 > 0) {
      ctx.save();
      ctx.globalAlpha = c1;
      const dx = (1 - EASE.outCubic(c1)) * -24;
      labelChip(ctx, 'KAMU DAPAT 6 JAM', M + dx, 648, {
        size: 27, font: F.num6, track: 4, padX: 20, padY: 14, align: 'left',
        dot: C.bone, dotColor: hexA(C.bone, 0.8),
      });
      ctx.restore();
    }
    const c2 = clamp((t - 0.35) / 0.3);
    if (c2 > 0) {
      ctx.save();
      ctx.globalAlpha = c2;
      labelChip(ctx, 'BUTUH 7–9 JAM', W - M, 648, {
        size: 27, font: F.num6, track: 4, padX: 20, padY: 14, align: 'right',
        dot: C.amber, dotColor: C.amber, color: C.amber,
      });
      ctx.restore();
    }

    // running debt total
    const tot = clamp((t - 10.3) / 1.1);
    if (tot > 0) {
      const v = Math.round(EASE.outCubic(clamp((t - 10.3) / 0.9)) * 14);
      ctx.save();
      ctx.globalAlpha = clamp(tot * 2.2);
      txt(ctx, `${v}`, W - M - 96, 500, {
        size: 164, font: F.num, color: C.amber, align: 'right', track: -4,
        glowBlur: 26, glowColor: hexA(C.amber, 0.4),
      });
      txt(ctx, 'JAM', W - M, 502, {
        size: 46, font: F.num, color: hexA(C.amber, 0.85), align: 'right',
      });
      tracking(ctx, 'UTANG TIDUR', W - M, 556, {
        size: 20, font: F.num6, track: 4, align: 'right', color: hexA(C.bone, 0.5),
      });
      ctx.restore();
    }

    // debt squares
    const sq = clamp((t - 9.9) / 0.5);
    if (sq > 0) {
      ctx.save();
      const s = 30;
      const gap = 12;
      const totalW = N * s + (N - 1) * gap;
      let x = 344;
      for (let i = 0; i < N; i++) {
        const a = clamp((t - 9.9 - i * 0.07) / 0.25);
        if (a > 0) {
          ctx.globalAlpha = a;
          fillRR(ctx, x, 1580, s, s, 6, hexA(C.amber, 0.85));
        }
        x += s + gap;
      }
      ctx.globalAlpha = clamp((t - 10.2) / 0.5);
      txt(ctx, '× 2 JAM', x + 20, 1610, {
        size: 32, font: F.num6, color: hexA(C.bone, 0.75), track: 2,
      });
      ctx.restore();
    }

    // baseline ticks
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (let h = 3; h <= 9; h += 3) {
      ctx.fillStyle = C.bone;
      ctx.fillRect(M, y(h), 24, 2);
    }
    ctx.restore();
  },
};
