import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, sky, stars, grain, kicker, chip, bracket } from './_kota.mjs';
import { P } from './_padi.mjs';

// 02 — SEBELAS KALI. Four bars, one baseline. Three of them look like a country
// that solved its problem; the fourth is the year it did not.

const BASE = 1452;
const FULL = 1010;
const DATA = [
  { y: '2021', v: 0.41, label: '407 ribu' },
  { y: '2022', v: 0.43, label: '429 ribu' },
  { y: '2023', v: 3.06, label: '3,06 juta' },
  { y: '2024', v: 4.52, label: '4,52 juta' },
];
const BW = 190;
const GAP = 92;
const X0 = (W - (DATA.length * BW + (DATA.length - 1) * GAP)) / 2;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    sky(ctx, { top: '#070C0A', mid: '#0B1310', low: '#16241C', horizon: BASE + 8, t });
    stars(ctx, { n: 54, seed: 21, t, bottom: BASE - 140, a: 0.3 });

    // faint reference grid
    ctx.save();
    ctx.strokeStyle = 'rgba(251,246,234,0.07)';
    ctx.lineWidth = 1.5;
    for (let v = 1; v <= 4; v++) {
      const y = BASE - (v / 4.52) * FULL;
      ctx.beginPath();
      ctx.moveTo(120, y);
      ctx.lineTo(W - 120, y);
      ctx.stroke();
      txt(ctx, `${v}`, 108, y + 8, { size: 20, font: F.mono, color: 'rgba(251,246,234,0.24)', align: 'right' });
    }
    ctx.restore();

    // baseline
    const bA = at(t, 0.15, 0.7);
    ctx.save();
    ctx.globalAlpha = bA;
    ctx.fillStyle = 'rgba(251,246,234,0.45)';
    ctx.fillRect(120, BASE, W - 240, 2);
    ctx.restore();

    DATA.forEach((d, i) => {
      const x = X0 + i * (BW + GAP);
      const a = at(t, 0.5 + i * 0.55, 1.0);
      const h = (d.v / 4.52) * FULL * a;
      const isLast = i === DATA.length - 1;
      if (h > 1) {
        ctx.save();
        if (isLast) {
          ctx.shadowColor = 'rgba(180,71,44,0.45)';
          ctx.shadowBlur = 48;
        }
        const g = isLast
          ? linGrad(ctx, x, 0, x + BW, 0, [[0, '#C9583A'], [0.6, P.rust], [1, '#7C2B17']])
          : linGrad(ctx, x, 0, x + BW, 0, [[0, '#CFC4A4'], [0.55, '#A79C7E'], [1, '#6E6650']]);
        ctx.fillStyle = g;
        ctx.fillRect(x, BASE - h, BW, h);
        ctx.restore();
        // top edge light
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(x, BASE - h, BW, 4);
      }
      // year under the bar
      ctx.save();
      ctx.globalAlpha = at(t, 0.4 + i * 0.5, 0.7);
      txt(ctx, d.y, x + BW / 2, BASE + 56, {
        size: 30, font: F.num6, color: isLast ? '#EE9C7E' : 'rgba(251,246,234,0.75)', align: 'center',
      });
      txt(ctx, d.label, x + BW / 2, BASE + 100, {
        size: 22, font: F.mono6, color: isLast ? 'rgba(238,156,126,0.9)' : 'rgba(251,246,234,0.42)',
        align: 'center', track: 2,
      });
      ctx.restore();
    });

    kicker(ctx, 'IMPOR BERAS INDONESIA', { x: 120, y: 268, a: at(t, 0.2, 0.6), color: P.gold });
    txt(ctx, 'juta ton', W - 120, 274, { size: 22, font: F.mono6, color: 'rgba(251,246,234,0.4)', track: 5, align: 'right', alpha: at(t, 0.5, 0.6) });

    // the multiplier, once the last bar has landed
    const mA = at(t, 3.4, 1.0);
    if (mA > 0.01) {
      ctx.save();
      ctx.globalAlpha = mA;
      const lx = X0 + 3 * (BW + GAP) - 26;
      const top = BASE - FULL;
      bracket(ctx, lx, top, BASE, { label: '', color: hexA(P.rust, 0.85), a: 1 });
      const lc = X0 + 3 * (BW + GAP) + BW / 2;
      txt(ctx, '11×', lc, top - 72, { size: 88, font: F.num, color: '#EE9C7E', track: -3, align: 'center' });
      txt(ctx, 'DALAM TIGA TAHUN', lc, top - 32, { size: 17, font: F.mono6, color: 'rgba(238,156,126,0.85)', track: 3, align: 'center' });
      ctx.restore();
    }

    grain(ctx, 0.045);
  },
};
