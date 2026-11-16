import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  D, ease, cue, room, cone, motes, bokeh, vignette, par, meter, spark, stamp,
} from './_daya.mjs';

// 04 — SELISIHNYA
// Two meters, same 100.000 rupiah, two counters. The gap between them is the
// thing the episode is about, so the gap gets its own graphic.

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.5, glowY: 320, glowA: 0.14, horizon: 1340 });
    cone(ctx, W * 0.5, 260, 1320, 520, { a: 0.06, t, color: D.volt });
    motes(ctx, t, { n: 44, a: 0.42, color: '#D7E7F7' });

    const mw = 588;
    const gap = 30;
    const x0 = (W - (mw * 2 + gap)) / 2;
    const sides = [
      { key: 'JAKARTA', sub: 'PPJ 2,4%', read: '65,8', at: 1, tone: D.volt },
      { key: 'BANGKA', sub: 'PPJ 10%', read: '60,2', at: 2, tone: D.ember },
    ];

    // meters
    sides.forEach((S, i) => {
      const p = ease.expo(clamp((t - c(0, 0.10 + i * 0.12)) / 0.8));
      if (p <= 0.001) return;
      const x = x0 + i * (mw + gap);
      const y = 414 + (1 - p) * 46;
      ctx.save();
      ctx.globalAlpha = p;
      meter(ctx, x, y, mw, t + i * 1.7, {
        read: a(c(S.at, 0.10), 0.6) > 0.5 ? S.read : '—',
        unit: 'kWh',
        mode: 'SISA TOKEN',
        glow: 0.9,
      });
      tracking(ctx, S.key, x + 6, y - 30, { size: 20, font: F.mono6, track: 5, color: hexA(S.tone, 0.85) });
      tracking(ctx, S.sub, x + mw - 6, y - 30, { size: 17, font: F.mono6, track: 3, color: hexA(D.bone, 0.35), align: 'right' });
      ctx.restore();
    });

    // the two bars: 65,8 and 60,2, drawn to the same scale
    const barTop = 1178;
    const barMax = 372;
    const bw = 210;
    const bx0 = 117 + (588 - bw) / 2;
    const bx1 = 735 + (588 - bw) / 2;
    sides.forEach((S, i) => {
      const p = ease.expo(clamp((t - c(S.at, 0.15)) / 0.8));
      const val = parseFloat(S.read.replace(',', '.'));
      const h = (val / 70) * barMax * p;
      const bx = i === 0 ? bx0 : bx1;
      ctx.save();
      ctx.globalAlpha = p;
      fillRR(ctx, bx, barTop - h, bw, Math.max(4, h), 10, linGrad(ctx, bx, barTop - h, bx, barTop, [
        [0, hexA(S.tone, 0.9)], [1, hexA(S.tone, 0.18)],
      ]));
      txt(ctx, S.read, bx + bw / 2, barTop - h - 22, {
        size: 44, font: F.num, color: D.bone, align: 'center', track: -1,
      });
      tracking(ctx, 'kWh', bx + bw / 2, barTop + 34, {
        size: 17, font: F.mono6, track: 3, color: hexA(D.bone, 0.35), align: 'center',
      });
      ctx.restore();
    });
    ctx.save();
    ctx.fillStyle = hexA(D.bone, 0.16);
    ctx.fillRect(bx0 - 40, barTop + 2, (bx1 + bw + 40) - (bx0 - 40), 2);
    ctx.restore();

    // the gap gets measured
    const g = ease.inOut(clamp((t - c(3, 0.05)) / 0.8));
    if (g > 0.01) {
      const y0 = barTop - (60.2 / 70) * barMax;
      const y1 = barTop - (65.8 / 70) * barMax;
      const gx = bx1 - 26;
      ctx.save();
      ctx.globalAlpha = g;
      ctx.strokeStyle = D.ember;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx, y0);
      ctx.lineTo(gx, lerp(y0, y1, g));
      ctx.stroke();
      for (const yy of [y0, lerp(y0, y1, g)]) {
        ctx.beginPath();
        ctx.moveTo(gx - 12, yy);
        ctx.lineTo(gx + 12, yy);
        ctx.stroke();
      }
      ctx.restore();
      const ga = a(c(3, 0.3), 0.5);
      if (ga > 0.01) {
        ctx.save();
        ctx.globalAlpha = ga;
        const lx = W / 2 - 168;
        fillRR(ctx, lx, (y0 + y1) / 2 - 46, 300, 92, 10, 'rgba(8,13,19,0.9)');
        strokeRR(ctx, lx, (y0 + y1) / 2 - 46, 300, 92, 10, hexA(D.ember, 0.55), 1.6);
        tracking(ctx, 'SELISIH', lx + 22, (y0 + y1) / 2 - 14, {
          size: 16, font: F.mono6, track: 4, color: hexA(D.ember, 0.8),
        });
        txt(ctx, '5,6', lx + 22, (y0 + y1) / 2 + 34, { size: 46, font: F.num, color: D.bone, track: -1 });
        tracking(ctx, 'kWh', lx + 120, (y0 + y1) / 2 + 30, {
          size: 18, font: F.mono6, track: 3, color: hexA(D.bone, 0.45),
        });
        ctx.restore();
      }
    }

    // and the money that never became electricity
    const m = ease.expo(clamp((t - c(4, 0.05)) / 0.7));
    if (m > 0.01) {
      ctx.save();
      ctx.globalAlpha = m;
      const y = 1650;
      ctx.fillStyle = hexA(D.ember, 0.5);
      ctx.fillRect(bx0 - 40, y - 74, bx1 + bw + 40 - (bx0 - 40), 2);
      tracking(ctx, 'TIDAK PERNAH JADI LISTRIK', W / 2, y - 34, {
        size: 18, font: F.mono6, track: 4, color: hexA(D.ember, 0.7), align: 'center',
      });
      // a banknote falling apart as it drops
      for (let i = 0; i < 5; i++) {
        const q = clamp((t - c(4, 0.05 + i * 0.06)) / 0.9);
        if (q <= 0.01) continue;
        const nx = W / 2 - 120 + i * 60 + Math.sin(q * 3 + i) * 26;
        const ny = y + 20 + q * 130;
        ctx.save();
        ctx.globalAlpha = m * (1 - q) * 0.95;
        ctx.translate(nx, ny);
        ctx.rotate(q * (i - 2) * 0.5);
        fillRR(ctx, -40, -26, 80, 52, 4, '#DFD2B4');
        txt(ctx, 'Rp', 0, 8, { size: 20, font: F.mono6, color: 'rgba(70,54,30,0.9)', align: 'center', track: 1 });
        ctx.restore();
      }
      txt(ctx, '8.100', W / 2, y + 96, { size: 78, font: F.num, color: D.ember, align: 'center', track: -2.6 });
      ctx.restore();
      spark(ctx, W / 2, y + 8, clamp((t - c(4, 0.6)) / 0.3), { a: 0.3, size: 1.6 });
    }

    bokeh(ctx, cam, { n: 5, a: 0.09 });
    vignette(ctx, 0.5);
  },
};
