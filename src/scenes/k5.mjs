import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, chip } from './_kota.mjs';
import { G, ponds, houses } from './_garam.mjs';

// 05 — MENYUSUT. Same drone, later. The pans on the left still work; on the
// right they have been sold, filled and roofed. The boundary walks left across
// the frame while the sentence is spoken: a coastline does not make salt, a
// plot does, and the plots are going.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, '#120D0A');

    // the ponds, full frame
    layer(ctx, cam, 0.22, () => {
      ponds(ctx, {
        x0: -160, x1: W + 160, y0: 300, y1: 1700,
        rows: 12, cols: 13, seed: 23, t, crust: 0.30, a: 1, dyke: 0.065,
      });
    });

    // the built-over side, clipped at a boundary that moves left
    const bx = lerp(W + 120, 596, E.inOut(at(t, 0.5, 4.0)));
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, 260, W + 240 - bx, 1460);
    ctx.clip();
    layer(ctx, cam, 0.22, () => {
      houses(ctx, {
        x0: -160, x1: W + 160, y0: 300, y1: 1700,
        rows: 12, cols: 13, seed: 23, a: 1, lit: 1, t,
      });
    });
    ctx.restore();

    // the boundary itself: a rust line with survey ticks
    const bA = at(t, 0.4, 0.8);
    if (bA > 0.01) {
      ctx.save();
      ctx.globalAlpha = bA;
      ctx.strokeStyle = hexA(G.sun, 0.95);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx, 250);
      ctx.lineTo(bx, 1540);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let y = 270; y < 1540; y += 46) {
        ctx.beginPath();
        ctx.moveTo(bx - 16, y);
        ctx.lineTo(bx + 16, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // labels either side of the line, pinned to the frame, not to the line
    ctx.save();
    const lA = at(t, 1.1, 0.8);
    ctx.globalAlpha = lA;
    txt(ctx, 'TAMBAK', 96, 232, { size: 26, font: F.mono6, color: hexA('#9FD3CC', 0.9), track: 6 });
    ctx.restore();
    ctx.save();
    const rA = at(t, 1.5, 0.8);
    ctx.globalAlpha = rA;
    txt(ctx, 'PERUMAHAN & INDUSTRI', W - 96, 232, { size: 26, font: F.mono6, color: hexA('#FFC978', 0.85), track: 6, align: 'right' });
    ctx.restore();

    // the land-use legend, bottom left, over a scrim. No invented percentage:
    // the caption already carries the claim, this only names the trade.
    const cA = at(t, 0.8, 0.9);
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      const px = 84;
      const py = 1178;
      fillRR(ctx, px, py, 560, 236, 6, 'rgba(10,7,5,0.84)');
      ctx.fillStyle = hexA(G.sun, 0.9);
      ctx.fillRect(px + 30, py + 34, 42, 4);
      txt(ctx, 'ALIH FUNGSI', px + 86, py + 42, { size: 21, font: F.mono6, color: 'rgba(251,246,236,0.7)', track: 5 });
      // two swatches with an arrow between them
      ctx.fillStyle = hexA('#8CBFB6', 0.9);
      ctx.fillRect(px + 32, py + 82, 78, 54);
      ctx.strokeStyle = 'rgba(251,246,236,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 32, py + 82, 78, 54);
      ctx.strokeStyle = hexA(G.sun, 0.9);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + 130, py + 109);
      ctx.lineTo(px + 186, py + 109);
      ctx.moveTo(px + 172, py + 98);
      ctx.lineTo(px + 188, py + 109);
      ctx.lineTo(px + 172, py + 120);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,201,120,0.85)';
      ctx.fillRect(px + 206, py + 82, 78, 54);
      ctx.strokeRect(px + 206, py + 82, 78, 54);
      txt(ctx, 'TAMBAK', px + 32, py + 176, { size: 24, font: F.mono6, color: hexA('#9FD3CC', 0.9), track: 4 });
      txt(ctx, 'PERUMAHAN', px + 206, py + 176, { size: 24, font: F.mono6, color: 'rgba(255,201,120,0.9)', track: 4 });
      txt(ctx, 'harga tanah menang', px + 32, py + 212, { size: 24, font: F.body, color: 'rgba(251,246,236,0.55)' });
      ctx.restore();
    }

    grain(ctx, 0.045);
  },
};
