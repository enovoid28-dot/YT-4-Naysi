import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip } from './_kota.mjs';
import { P } from './_padi.mjs';

// 07 — 2025. The year the field answered. One bar collapses, one climbs, and the
// country discovers that self-sufficiency is a thing you have to keep doing.

const BASE = 1500;
const FULL = 900;
const Impor = [{ y: '2024', v: 4.52, c: P.rust }, { y: '2025', v: 0.45, c: '#6E9A50' }];

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, P.paper);
    ctx.save();
    const g = linGrad(ctx, 0, 120, 0, H, [[0, 'rgba(255,250,236,0.95)'], [1, 'rgba(206,192,167,0.5)']]);
    ctx.fillStyle = g;
    ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.restore();

    kicker(ctx, 'IMPOR BERAS', { x: 96, y: 262, a: at(t, 0.15, 0.6), color: P.rust, ink: 'rgba(20,24,18,0.7)' });
    txt(ctx, 'juta ton', W - 96, 268, { size: 22, font: F.mono6, color: 'rgba(20,24,18,0.4)', track: 5, align: 'right', alpha: at(t, 0.4, 0.6) });

    // baseline
    const bA = at(t, 0.2, 0.7);
    ctx.save();
    ctx.globalAlpha = bA;
    ctx.fillStyle = 'rgba(20,24,18,0.5)';
    ctx.fillRect(220, BASE, W - 440, 3);
    ctx.restore();

    // two bars, side by side, far apart in height
    const barW = 300;
    const xs = [330, 810];
    Impor.forEach((d, i) => {
      const a = at(t, 0.4 + i * 1.4, 1.1);
      const h = (d.v / 4.6) * FULL * a;
      if (h > 1) {
        const gg = linGrad(ctx, xs[i], 0, xs[i] + barW, 0, [[0, d.c], [1, i === 0 ? '#7C2B17' : '#3E6B32']]);
        ctx.fillStyle = gg;
        ctx.fillRect(xs[i], BASE - h, barW, h);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(xs[i], BASE - h, barW, 5);
      }
      txt(ctx, d.y, xs[i] + barW / 2, BASE + 60, { size: 32, font: F.num6, color: 'rgba(20,24,18,0.7)', align: 'center', alpha: at(t, 0.4 + i * 1.4, 0.6) });
      const val = i === 0 ? '4,52' : '0,45';
      txt(ctx, val, xs[i] + barW / 2, BASE - h - 28, {
        size: 56, font: F.num6, color: d.c, align: 'center', alpha: at(t, 0.6 + i * 1.4, 0.7),
      });
    });

    // the collapse, called out
    const cA = at(t, 3.4, 1.0);
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      const ax = xs[0] + barW + 40;
      const ay0 = BASE - FULL * (4.52 / 4.6);
      const ay1 = BASE - FULL * (0.45 / 4.6) * 0.999;
      const bx = xs[1] - 40;
      ctx.strokeStyle = 'rgba(20,24,18,0.35)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(bx, ay1);
      ctx.lineTo(xs[1] + barW, ay1);
      ctx.stroke();
      ctx.setLineDash([]);
      // arrow from the tall bar down to the short one
      ctx.strokeStyle = P.rust;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay0 + 24);
      ctx.bezierCurveTo(ax + 96, ay0 - 20, bx - 96, ay1 - 40, bx - 16, ay1 - 18);
      ctx.stroke();
      // a solid head on the end of it
      ctx.fillStyle = P.rust;
      ctx.beginPath();
      ctx.moveTo(bx + 4, ay1 - 14);
      ctx.lineTo(bx - 34, ay1 - 40);
      ctx.lineTo(bx - 40, ay1 + 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // the percentage
    const pA = at(t, 3.8, 1.1);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      const v = Math.round(lerp(0, 90, E.out(at(t, 3.8, 1.3))));
      txt(ctx, `-${v}%`, 996, 642, { size: 100, font: F.num, color: '#3E6B32', track: -5 });
      txt(ctx, 'IMPOR', 1000, 692, { size: 24, font: F.mono6, color: 'rgba(20,24,18,0.6)', track: 6 });
      txt(ctx, 'dalam satu tahun', 1000, 736, { size: 26, font: F.body, color: 'rgba(20,24,18,0.5)' });
      ctx.restore();
    }

    // harvest note
    const hA = at(t, 6.6, 1.0);
    if (hA > 0.01) {
      ctx.save();
      ctx.globalAlpha = hA;
      fillRR(ctx, 96, 1592, W - 192, 150, 6, 'rgba(20,24,18,0.07)');
      txt(ctx, '34,7 JUTA TON', 128, 1672, { size: 46, font: F.num6, color: P.ink });
      txt(ctx, 'panen 2025 — naik 13,3 persen dari tahun sebelumnya', 128, 1720, {
        size: 27, font: F.body, color: 'rgba(20,24,18,0.6)',
      });
      ctx.restore();
    }

    grain(ctx, 0.03);
  },
};
