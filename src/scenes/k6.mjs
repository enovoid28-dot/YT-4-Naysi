import { W, H, txt, hexA, fillRR, strokeRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, sky, stars, water, reflection, grain, chip } from './_kota.mjs';
import { G, ship, sack } from './_garam.mjs';

// 06 — KAPAL. The whole argument in one frame: a ship that unloads faster than
// a pond can dry, and a farmer whose price has to sit under a line he cannot
// reach. No invented rupiah figures — the shape of the thing is the point.

const SEA = 1108;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    sky(ctx, { top: '#0A0C10', mid: '#141A1E', low: '#3A3A34', horizon: SEA, sun: [700, SEA - 8, 320, '#F3A75F'], t });
    stars(ctx, { n: 40, seed: 27, t, bottom: 620, a: 0.3 });

    layer(ctx, cam, 0.3, () => {
      water(ctx, SEA, { t, h: H - SEA, depth: 1, color: '#16323A', calm: 0.8 });
      reflection(ctx, SEA, { t, h: 420, color: 'rgba(243,167,95,0.16)', alpha: 0.5, seed: 4 });
    });

    // the ship, arriving and staying
    const shA = at(t, 0.4, 1.6);
    layer(ctx, cam, 0.45, () => {
      const sx = lerp(W + 660, 806, E.out(at(t, 0.4, 3.2)));
      ship(ctx, sx, SEA + 52, 1.18, { a: shA, t, tone: '#1B2A31' });
    });

    // sacks on the quay: the unit of the trade, stacking up
    const qA = at(t, 1.6, 0.8);
    if (qA > 0.01) {
      ctx.save();
      ctx.globalAlpha = qA;
      // quay deck
      ctx.fillStyle = linGrad(ctx, 0, 1330, 0, H, [[0, '#33291F'], [1, '#161111']]);
      ctx.fillRect(-160, 1330, W + 320, H);
      ctx.fillStyle = 'rgba(243,167,95,0.10)';
      ctx.fillRect(-160, 1330, W + 320, 4);
      // a bollard for scale
      ctx.fillStyle = '#3A3128';
      ctx.fillRect(1268, 1256, 34, 74);
      ctx.restore();

      const rowsS = [[0, 3], [1, 2], [2, 1]];
      let n = 0;
      for (const [row, count] of rowsS) {
        for (let i = 0; i < count; i++) {
          const a2 = at(t, 1.8 + n * 0.22, 0.7);
          if (a2 <= 0.01) { n++; continue; }
          const x = 120 + i * 148 + row * 74;
          const y = 1330 - 62 - row * 92;
          sack(ctx, x, y - 60 + (1 - a2) * 70, 132, 152, { a: a2 * 0.98, tone: '#D8C9AE' });
          n++;
        }
      }
    }

    // ---- the price panel
    const pA = at(t, 3.2, 1.0);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      const px = 84;
      const py = 268;
      const pw = 780;
      const ph = 480;
      fillRR(ctx, px, py, pw, ph, 6, 'rgba(8,6,5,0.93)');
      ctx.fillStyle = hexA(G.sun, 0.9);
      ctx.fillRect(px + 34, py + 38, 44, 4);
      txt(ctx, 'HARGA PER KILO', px + 92, py + 46, { size: 22, font: F.mono6, color: 'rgba(251,246,236,0.72)', track: 6 });

      const x0 = px + 40;
      const wMax = pw - 300;
      // import bar
      const b1 = at(t, 3.5, 1.0);
      ctx.fillStyle = G.rust;
      ctx.fillRect(x0, py + 96, wMax * 1.0 * b1, 62);
      txt(ctx, 'IMPOR', x0 + wMax + 24, py + 138, { size: 26, font: F.mono6, color: '#EE9C7E', track: 4, alpha: b1 });
      txt(ctx, 'kapal, seragam, murah', x0, py + 190, { size: 25, font: F.body, color: 'rgba(251,246,236,0.5)', alpha: b1 });

      // cost line
      const b2 = at(t, 4.4, 0.9);
      const cy = py + 300;
      ctx.strokeStyle = 'rgba(251,246,236,0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 9]);
      ctx.beginPath();
      ctx.moveTo(x0, cy - 34);
      ctx.lineTo(x0 + wMax * 0.86, cy - 34);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, 'BIAYA PRODUKSI PETANI', x0, cy - 48, { size: 21, font: F.mono6, color: 'rgba(251,246,236,0.55)', track: 4, alpha: b2 });

      // what the farmer actually gets: below the line
      const b3 = at(t, 4.9, 1.1);
      if (b3 > 0.01) {
        ctx.fillStyle = '#8E8A7C';
        ctx.fillRect(x0, cy, wMax * 0.58 * b3, 56);
        txt(ctx, 'HARGA PETANI', x0 + wMax * 0.58 + 24, cy + 38, { size: 25, font: F.mono6, color: 'rgba(251,246,236,0.85)', track: 3, alpha: b3 });
        // the shortfall, bracketed downwards
        ctx.strokeStyle = hexA('#EE9C7E', 0.9);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x0 + wMax * 0.3, cy - 34);
        ctx.lineTo(x0 + wMax * 0.3, cy + 4);
        ctx.moveTo(x0 + wMax * 0.3 - 10, cy - 18);
        ctx.lineTo(x0 + wMax * 0.3, cy - 4);
        ctx.lineTo(x0 + wMax * 0.3 + 10, cy - 18);
        ctx.stroke();
        txt(ctx, 'DI BAWAH BIAYA', x0, py + ph - 44, { size: 30, font: F.num6, color: '#EE9C7E', alpha: b3 });
      }
      ctx.restore();
    }

    // chips
    const cA = at(t, 2.4, 0.8);
    if (cA > 0.01) chip(ctx, 'BONGKAR MUATAN · TANPA MUSIM', 986, 220, { a: cA, bg: 'rgba(10,8,6,0.8)', ink: G.bone, border: hexA(G.sun, 0.45), align: 'center' });

    grain(ctx, 0.05);
  },
};
