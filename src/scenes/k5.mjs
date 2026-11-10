import { W, H, txt, hexA, fillRR, strokeRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, soil, kicker, chip, grain, tower, skyline, fillAll } from './_kota.mjs';

// 05 — MANGKUK. A section through the city: the rim is still dry, the middle is
// already under the sea, and every drop that arrives runs to the middle.
const SEA = 980;

const groundY = (x) => {
  const u = (x - 720) / 760;
  return 800 + 700 * Math.exp(-u * u * 2.0);
};

function groundPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-40, groundY(-40));
  for (let x = 0; x <= W + 20; x += 10) ctx.lineTo(x, groundY(x));
  ctx.lineTo(W + 20, H);
  ctx.lineTo(-40, H);
  ctx.closePath();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    // sky above the section
    fillAll(ctx, linGrad(ctx, 0, 0, 0, 1500, [
      [0, '#D8E0DB'],
      [0.4, '#EFE7D5'],
      [0.72, '#F6EEDC'],
      [1, '#E7DCC4'],
    ]));

    // soil
    const gA = at(t, 0.1, 1.0);
    ctx.save();
    ctx.globalAlpha = gA;
    groundPath(ctx);
    ctx.fillStyle = linGrad(ctx, 0, 780, 0, H, [
      [0, '#C9B189'],
      [0.45, '#A98F63'],
      [1, '#5D4B33'],
    ]);
    ctx.fill();
    ctx.save();
    groundPath(ctx);
    ctx.clip();
    const r = rng(33);
    ctx.strokeStyle = 'rgba(60,44,26,0.12)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      const yy = 900 + i * 96;
      ctx.beginPath();
      ctx.moveTo(0, yy);
      for (let x = 0; x <= W; x += 30) ctx.lineTo(x, yy + Math.sin(x * 0.012 + i) * 7);
      ctx.stroke();
    }
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = 'rgba(40,28,16,0.10)';
      ctx.beginPath();
      ctx.ellipse(r() * W, 900 + r() * 700, 3 + r() * 6, 2 + r() * 3, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();

    // buildings on the rim and inside the bowl
    const cA = at(t, 1.6, 0.8);
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      const spots = [
        [40, 300, 110], [178, 372, 96], [310, 250, 104],
        [470, 210, 86], [560, 300, 74], [650, 372, 92], [742, 268, 78],
        [840, 200, 88], [930, 320, 108], [1074, 380, 118], [1240, 300, 104], [1360, 220, 96],
      ];
      spots.forEach(([x, h0, w]) => {
        const gy = groundY(x + w / 2);
        const h = Math.min(h0, Math.max(90, gy - 560));
        tower(ctx, x, gy, w, h, {
          seed: x * 7 + w,
          lit: 0.62,
          body: '#3B342C',
          win: '#FFD79A',
          glow: 1,
        });
      });
      ctx.restore();
    }

    // sea line
    const sA = at(t, 2.0, 0.8);
    ctx.save();
    ctx.globalAlpha = sA;
    ctx.setLineDash([22, 14]);
    ctx.strokeStyle = hexA(K.water, 0.85);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, SEA);
    ctx.lineTo(W, SEA);
    ctx.stroke();
    ctx.setLineDash([]);
    txt(ctx, 'MUKA LAUT', 720, SEA - 26, {
      size: 24, font: F.mono6, color: 'rgba(22,18,14,0.72)', align: 'center', track: 5,
    });
    ctx.restore();

    // the water that pooled: a lens between ground and sea level
    const wA = at(t, 2.6, 1.4);
    if (wA > 0.01) {
      let xL = 0;
      let xR = W;
      for (let x = 0; x <= W; x += 4) if (groundY(x) > SEA) { xL = x; break; }
      for (let x = W; x >= 0; x -= 4) if (groundY(x) > SEA) { xR = x; break; }
      const mid = 720;
      const half = ((xR - xL) / 2) * E.inOut(wA);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mid - half, SEA);
      for (let x = mid - half; x <= mid + half; x += 4) ctx.lineTo(x, Math.max(SEA, groundY(x)));
      ctx.lineTo(mid + half, SEA);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = linGrad(ctx, 0, SEA, 0, 1500, [
        [0, 'rgba(58,124,138,0.88)'],
        [1, 'rgba(16,54,62,0.94)'],
      ]);
      ctx.fillRect(0, SEA, W, H - SEA);
      ctx.strokeStyle = 'rgba(200,240,246,0.5)';
      ctx.lineWidth = 3;
      for (let row = 0; row < 3; row++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 12) {
          const y = SEA + 12 + row * 22 + Math.sin(x * 0.02 + t * 1.3 + row) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      ctx.restore();
    }

    kicker(ctx, 'JAKARTA UTARA', { y: 250, a: at(t, 0.2, 0.8), ink: '#2A2320' });

    // 40%
    const nA = at(t, 1.0, 0.8);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      txt(ctx, '40', 96, 470 + (1 - nA) * 24, { size: 168, font: F.num, color: K.rust, track: -6 });
      txt(ctx, '%', 96 + measure(ctx, '40', 168, F.num, -6) + 10, 470, {
        size: 84, font: F.num6, color: K.rust,
      });
      txt(ctx, 'KOTA SUDAH DI BAWAH LAUT', 96, 526, {
        size: 23, font: F.mono6, color: 'rgba(28,22,18,0.62)', track: 4,
      });
      ctx.restore();
    }

    // everything runs to the middle
    const fA = at(t, 6.4, 0.9);
    if (fA > 0.01) {
      ctx.save();
      ctx.globalAlpha = fA;
      for (let i = 0; i < 3; i++) {
        const y = 1120 + i * 90;
        const x0 = 170 + i * 30;
        ctx.strokeStyle = hexA('#DFF3F6', 0.55);
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.quadraticCurveTo(x0 + 230, y + 70, 520 + i * 26, y + 46);
        ctx.stroke();
        ctx.fillStyle = hexA('#DFF3F6', 0.6);
        ctx.beginPath();
        ctx.moveTo(524 + i * 26, y + 46);
        ctx.lineTo(500 + i * 26, y + 30);
        ctx.lineTo(502 + i * 26, y + 62);
        ctx.closePath();
        ctx.fill();
      }
      chip(ctx, 'SEMUA AIR KE TENGAH', 700, 1480, {
        a: fA, ink: '#F6EFE0', bg: 'rgba(18,26,28,0.75)', size: 23,
      });
      ctx.restore();
    }

    grain(ctx, 0.04);
  },
};
