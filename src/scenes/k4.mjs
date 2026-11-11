import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip } from './_kota.mjs';
import { P } from './_padi.mjs';
import { person } from './_figure.mjs';

// 04 — CUACA. The year the rain did not come. A dry paddy seen from the bund:
// cracked floor, a block of stalks that died standing, and a man who came out
// to look at it anyway.

const HZ = 1090;
const NEAR = 1480;

const cracks = (ctx, x0, y0, x1, y1, { seed = 9, n = 40, alpha = 0.5, w = 3, len = 120 } = {}) => {
  const r = rng(seed);
  const ww = x1 - x0;
  const hh = y1 - y0;
  ctx.save();
  ctx.strokeStyle = `rgba(46,33,20,${alpha})`;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    let px = x0 + r() * ww;
    let py = y0 + r() * hh;
    ctx.lineWidth = w * (0.5 + r());
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let k = 0; k < 4; k++) {
      px += (r() - 0.5) * len;
      py += (r() - 0.4) * len * 0.5;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
};

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    // sky: brass, no cloud worth the name
    ctx.save();
    const g = linGrad(ctx, 0, -140, 0, HZ + 20, [[0, '#6E6552'], [0.35, '#A99272'], [0.72, '#D6B488'], [1, '#F0D8A8']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, HZ + 300);
    ctx.restore();

    // a hard, high sun
    ctx.save();
    ctx.globalAlpha = at(t, 0.1, 1.4);
    const sg = radGrad(ctx, 1010, 430, 40, 620, [[0, 'rgba(255,240,196,0.55)'], [0.4, 'rgba(255,222,158,0.16)'], [1, 'rgba(255,214,150,0)']]);
    ctx.fillStyle = sg;
    ctx.fillRect(300, -100, 1300, 1200);
    ctx.fillStyle = hexA('#FFF6DC', 0.9);
    ctx.beginPath();
    ctx.arc(1010, 430, 62, 0, TAU);
    ctx.fill();
    ctx.restore();

    // far hills, bleached to nothing
    ctx.save();
    ctx.fillStyle = 'rgba(126,108,80,0.5)';
    ctx.beginPath();
    ctx.moveTo(-200, HZ + 10);
    for (let x = -200; x <= W + 200; x += 40) {
      const y = HZ - 30 - (Math.sin(x * 0.0031) * 0.5 + 0.5) * 56 - Math.sin(x * 0.0013 + 1) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 200, HZ + 40);
    ctx.lineTo(-200, HZ + 40);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // the dry floor, in three depths
    layer(ctx, cam, 0.12, () => {
      ctx.fillStyle = linGrad(ctx, 0, HZ, 0, H + 80, [[0, '#C6AE84'], [0.28, '#B69C73'], [1, '#8C7551']]);
      ctx.fillRect(-200, HZ, W + 400, H + 200);
      // a few soft ridges where the bunds used to hold water
      for (let i = 1; i < 5; i++) {
        const y = HZ + 26 + Math.pow(i, 2.1) * 11;
        const hgt = 3 + i * 1.2;
        ctx.fillStyle = linGrad(ctx, 0, y - hgt, 0, y + hgt, [
          [0, 'rgba(214,192,152,0.0)'], [0.5, 'rgba(190,162,120,0.45)'], [1, 'rgba(120,98,68,0.35)'],
        ]);
        ctx.fillRect(-200, y - hgt, W + 400, hgt * 2);
      }
      cracks(ctx, -160, HZ + 10, W + 160, HZ + 210, { seed: 41, n: 34, alpha: 0.26, w: 2.4, len: 70 });
    });

    layer(ctx, cam, 0.2, () => {
      cracks(ctx, -160, HZ + 180, W + 160, H + 120, { seed: 62, n: 60, alpha: 0.42, w: 3.4, len: 150 });
      // a dust sheen across the middle distance
      ctx.fillStyle = radGrad(ctx, W * 0.62, HZ + 220, 30, 700, [[0, 'rgba(232,212,172,0.28)'], [1, 'rgba(232,212,172,0)']]);
      ctx.fillRect(-100, HZ, W + 200, 700);
    });

    // the dead block: stubble that never filled
    const dA = at(t, 0.9, 1.2);
    if (dA > 0.01) {
      const r = rng(5);
      ctx.save();
      ctx.globalAlpha = dA;
      // the silt where the block stood: a soft dark pool, no hard edges
      const sg2 = radGrad(ctx, 400, 1385, 40, 520, [[0, 'rgba(112,88,58,0.2)'], [0.7, 'rgba(112,88,58,0.1)'], [1, 'rgba(112,88,58,0)']]);
      ctx.fillStyle = sg2;
      ctx.beginPath();
      ctx.ellipse(400, 1385, 430, 128, -0.04, 0, TAU);
      ctx.fill();

      for (let row = 0; row < 9; row++) {
        const y = 1300 + Math.pow(row, 1.45) * 16;
        const n = 16 - row;
        for (let i = 0; i < n; i++) {
          const x = 70 + (i + (row % 2) * 0.5) * (620 / n) + (r() - 0.5) * 12;
          const hh = (26 + row * 7) * (0.55 + r() * 0.6);
          const bend = 0.35 + r() * 0.55;
          const tone = 150 + r() * 26;
          ctx.strokeStyle = `rgba(${tone + 24 | 0},${tone | 0},${tone - 42 | 0},${0.75 + r() * 0.22})`;
          ctx.lineWidth = Math.max(2, hh * 0.09);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.bezierCurveTo(x + bend * hh * 0.18, y - hh * 0.55, x + bend * hh * 0.55, y - hh * 0.85, x + bend * hh * 0.95, y - hh * 0.62);
          ctx.stroke();
          // a broken ear or two
          if (r() > 0.7) {
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(x + bend * hh * 0.5, y - hh * 0.8);
            ctx.lineTo(x + bend * hh * 0.5 + 7, y - hh * 0.95);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    // one man, standing on the bund, looking at it
    const mA = at(t, 0.7, 1.0);
    if (mA > 0.01) {
      ctx.save();
      ctx.globalAlpha = mA;
      // long light, short shadow
      // the shadow falls away from the sun, long and thin
      const sh = ctx.createLinearGradient(1050, 0, 700, 0);
      sh.addColorStop(0, 'rgba(52,38,22,0.34)');
      sh.addColorStop(1, 'rgba(52,38,22,0)');
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.moveTo(1030, 1470);
      ctx.lineTo(1082, 1470);
      ctx.lineTo(760, 1512);
      ctx.lineTo(700, 1500);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(60,44,26,0.2)';
      ctx.beginPath();
      ctx.ellipse(1054, 1484, 84, 14, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      person(ctx, 1050, 1482, 430, { pose: 'watch', facing: -1, alpha: mA, cloth: '#DCCFB0', rim: 0.75 });
    }

    // heat shimmer over the far field
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const y = HZ + 8 + i * 22 + Math.sin(t * 1.3 + i) * 6;
      ctx.fillStyle = linGrad(ctx, 0, y, 0, y + 22, [
        [0, 'rgba(255,242,210,0)'], [0.5, `rgba(255,242,210,${0.14 - i * 0.015})`], [1, 'rgba(255,242,210,0)'],
      ]);
      ctx.fillRect(-100, y, W + 200, 22);
    }
    ctx.restore();

    // labels
    kicker(ctx, 'EL NIÑO · MUSIM KEMARAU 2023', { x: 96, y: 266, a: at(t, 0.2, 0.7), color: P.rust, ink: 'rgba(30,22,12,0.85)' });
    const cA = at(t, 2.1, 0.9);
    if (cA > 0.01) {
      chip(ctx, 'TANAM MUNDUR', 96, 872, { a: cA, bg: 'rgba(30,22,12,0.86)', ink: P.bone, border: hexA(P.rust, 0.6) });
      chip(ctx, 'PANEN MEMPENDEK', 96, 950, { a: cA, bg: 'rgba(30,22,12,0.86)', ink: P.bone, border: hexA(P.rust, 0.6) });
    }

    grain(ctx, 0.04);
  },
};
