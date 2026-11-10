import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { paperRoom, paperKicker, glowSpot, applyGrain, P, Q } from './_ep7.mjs';

// 05 — MANGKUK. A section through the city: the rim is still dry, the middle is
// already below the sea, and every drop that arrives ends up in the middle.
const SEA = 964;

function groundY(x) {
  const u = (x - 720) / 780;
  return 762 + 720 * Math.exp(-u * u * 2.1);
}

function groundPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-40, groundY(-40));
  for (let x = 0; x <= W + 20; x += 12) ctx.lineTo(x, groundY(x));
  ctx.lineTo(W + 20, H);
  ctx.lineTo(-40, H);
  ctx.closePath();
}

export default {
  draw(ctx, t) {
    paperRoom(ctx);
    glowSpot(ctx, W * 0.5, 520, 800, '#FFF3DC', 0.45);
    paperKicker(ctx, 'JAKARTA UTARA', { y: 236 });

    // the sea, as a line you can point at
    const sA = EASE.outCubic(clamp((t - 0.3) / 0.8));
    ctx.save();
    ctx.globalAlpha = sA;
    ctx.setLineDash([22, 14]);
    ctx.strokeStyle = hexA(Q.water, 0.75);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, SEA);
    ctx.lineTo(W, SEA);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // the soil
    const gA = EASE.outCubic(clamp((t - 0.1) / 0.9));
    ctx.save();
    ctx.globalAlpha = gA;
    groundPath(ctx);
    ctx.fillStyle = linGrad(ctx, 0, 600, 0, H, [[0, '#C4A97F'], [0.4, '#9C8460'], [1, '#5A4C39']]);
    ctx.fill();
    // darker the deeper it goes
    ctx.save();
    groundPath(ctx);
    ctx.clip();
    ctx.fillStyle = linGrad(ctx, 0, 1000, 0, H, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.45)']]);
    ctx.fillRect(0, 900, W, H - 900);
    // sediment
    ctx.fillStyle = 'rgba(60,44,26,0.12)';
    for (let i = 0; i < 9; i++) ctx.fillRect(0, 900 + i * 96, W, 3);
    ctx.restore();
    ctx.restore();

    // buildings: on the rim they stand, in the middle they are up to their necks
    const cityA = clamp((t - 1.4) / 0.6);
    if (cityA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cityA;
      const spots = [
        [90, 170, 120], [230, 240, 90], [352, 130, 100],
        [520, 96, 86], [612, 150, 74], [700, 210, 96], [790, 120, 80],
        [880, 92, 90], [980, 168, 112], [1120, 210, 120], [1290, 150, 96],
      ];
      spots.forEach(([x, h0, w]) => {
        const gy = groundY(x + w / 2);
        const h = Math.min(h0, Math.max(60, gy - 676));
        ctx.fillStyle = 'rgba(28,24,20,0.88)';
        ctx.fillRect(x, gy - h, w, h + 8);
        ctx.fillStyle = 'rgba(255,214,140,0.22)';
        for (let wy = gy - h + 16; wy < gy - 14; wy += 26) {
          for (let wx = x + 12; wx < x + w - 18; wx += 24) {
            if ((wx + wy) % 3) ctx.fillRect(wx, wy, 8, 11);
          }
        }
      });
      ctx.restore();
    }

    // the water that pooled in the bowl
    const wA = EASE.outCubic(clamp((t - 2.2) / 1.2));
    if (wA > 0.01) {
      ctx.save();
      ctx.globalAlpha = wA;
      // the lens of water that actually sits above the ground
      ctx.beginPath();
      let xL = 0;
      let xR = W;
      for (let x = 0; x <= W; x += 4) {
        if (groundY(x) > SEA) { xL = x; break; }
      }
      for (let x = W; x >= 0; x -= 4) {
        if (groundY(x) > SEA) { xR = x; break; }
      }
      ctx.moveTo(xL, SEA);
      for (let x = xL; x <= xR; x += 4) ctx.lineTo(x, groundY(x));
      ctx.lineTo(xR, SEA);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = linGrad(ctx, 0, SEA, 0, 1400, [[0, 'rgba(47,110,124,0.88)'], [1, 'rgba(18,59,69,0.92)']]);
      ctx.fillRect(0, SEA, W, H - SEA);
      // surface shimmer
      ctx.strokeStyle = 'rgba(190,225,231,0.55)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x < W; x += 14) {
          const y = SEA + 10 + i * 16 + Math.sin(x * 0.02 + t * 1.4 + i) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      ctx.restore();
    }

    txt(ctx, 'MUKA LAUT', 720, SEA - 30, {
      size: 22, font: F.mono6, color: 'rgba(20,17,16,0.70)', align: 'center', track: 5,
    });

    // the number
    const nA = EASE.outCubic(clamp((t - 3.2) / 0.7));
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      txt(ctx, '40', 92, 440, {
        size: 176, font: F.num, color: Q.rust, track: -6,
      });
      txt(ctx, '%', 92 + measure(ctx, '40', 176, F.num, -6) + 8, 440, {
        size: 86, font: F.num6, color: Q.rust, track: -2,
      });
      txt(ctx, 'KOTA INI SUDAH DI BAWAH', 96, 492, {
        size: 22, font: F.mono6, color: 'rgba(20,17,16,0.62)', track: 4,
      });
      txt(ctx, 'PERMUKAAN LAUT', 96, 524, {
        size: 22, font: F.mono6, color: 'rgba(20,17,16,0.62)', track: 4,
      });
      ctx.restore();
    }

    void C; void M; void lerp; void TAU; void strokeRR; void fillRR; void radGrad; void P;
    applyGrain(ctx, 0.05);
  },
};
