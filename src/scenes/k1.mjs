import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, chip } from './_kota.mjs';
import { G, ponds, ship, A } from './_garam.mjs';

// 01 — GARIS PANTAI. From the air: the sea, one shoreline, and then nothing but
// ponds, plot after plot, all the way to the horizon. The number sits on the
// water like a data overlay. Then a bulk carrier slides in from the right and
// the second sentence lands: the salt is not ours.

const SHORE = 436;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, G.paper);

    // the sea, top of frame, lit from the left
    layer(ctx, cam, 0.12, () => {
      const g = linGrad(ctx, 0, -120, 0, SHORE + 40, [
        [0, '#2A5F63'], [0.55, G.pond2], [1, G.pond],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(-220, -220, W + 440, SHORE + 260);
      // swell
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      const r = rng(21);
      for (let i = 0; i < 26; i++) {
        const y = -20 + r() * (SHORE + 30);
        const len = 90 + r() * 220;
        const x = r() * W;
        ctx.lineWidth = 1.5 + r() * 2;
        ctx.beginPath();
        for (let k = 0; k <= 10; k++) {
          const px = x + (len * k) / 10;
          const py = y + Math.sin(k * 0.9 + t * 1.4 + i) * 3.4;
          k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
    });

    // the shore itself: a hard bright edge, foam, then the embankments
    const sA = at(t, 0.1, 1.0);
    ctx.save();
    ctx.globalAlpha = sA;
    ctx.fillStyle = '#F2EEE2';
    ctx.beginPath();
    ctx.moveTo(-220, SHORE + 26);
    for (let x = -220; x <= W + 220; x += 40) {
      const y = SHORE + Math.sin(x * 0.004) * 12 + Math.sin(x * 0.011 + 1) * 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 220, SHORE + 60);
    ctx.lineTo(-220, SHORE + 60);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // the ponds: the subject of the episode, laid out under the shore
    layer(ctx, cam, 0.22, () => {
      ponds(ctx, {
        x0: -160, x1: W + 160, y0: SHORE + 34, y1: 1700,
        rows: 12, cols: 13, seed: 6, t, crust: 0.42, a: sA, dyke: 0.07,
      });
    });

    // heat haze over the far pans
    ctx.save();
    ctx.fillStyle = linGrad(ctx, 0, SHORE + 20, 0, SHORE + 260, [
      [0, 'rgba(233,243,238,0.85)'], [1, 'rgba(233,243,238,0)'],
    ]);
    ctx.fillRect(-220, SHORE + 20, W + 440, 260);
    ctx.restore();

    // ---- data panel: the number
    const pA = at(t, 0.5, 0.9);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      const px = 72;
      const py = 1146;
      const pw = 700;
      const ph = 330;
      ctx.save();
      ctx.shadowColor = 'rgba(10,7,5,0.35)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 14;
      fillRR(ctx, px, py, pw, ph, 6, 'rgba(18,13,10,0.90)');
      ctx.restore();
      // hairline top rule
      ctx.fillStyle = hexA(G.sun, 0.9);
      ctx.fillRect(px + 34, py + 40, 46, 4);
      txt(ctx, 'GARIS PANTAI', px + 94, py + 48, {
        size: 22, font: F.mono6, color: 'rgba(251,246,236,0.72)', track: 6,
      });
      // counting number
      const c = E.out(at(t, 0.7, 1.5));
      const v = Math.round(lerp(0, 99093, c));
      txt(ctx, v.toLocaleString('id-ID'), px + 34, py + 196, {
        size: 118, font: F.num, color: G.bone, track: -4,
      });
      txt(ctx, 'KILOMETER', px + 38, py + 250, {
        size: 26, font: F.mono6, color: hexA(G.sun, 0.95), track: 6,
      });
      txt(ctx, 'terpanjang kedua di dunia', px + 38, py + 296, {
        size: 28, font: F.body, color: 'rgba(251,246,236,0.62)',
      });
      ctx.restore();
    }

    // ---- second beat: the ship, and where it came from
    const shA = at(t, 4.6, 1.4);
    if (shA > 0.01) {
      const sx = lerp(W + 380, 940, E.out(at(t, 4.6, 2.6)));
      ship(ctx, sx, 372, 0.62, { a: shA * 0.96, t });
      // route dashes
      ctx.save();
      ctx.globalAlpha = shA * 0.55;
      ctx.strokeStyle = hexA(G.sun, 0.9);
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 16]);
      ctx.lineDashOffset = -t * 30;
      ctx.beginPath();
      ctx.moveTo(sx + 40, 300);
      ctx.lineTo(W + 40, 214);
      ctx.stroke();
      ctx.restore();
      chip(ctx, 'GARAM IMPOR · AUSTRALIA', 96, 214, { a: shA, bg: 'rgba(18,13,10,0.86)', ink: G.bone, border: hexA(G.sun, 0.55) });
      ctx.save();
      ctx.globalAlpha = shA;
      ctx.fillStyle = hexA(G.rust, 0.9);
      ctx.fillRect(748, 292, 120, 3);
      ctx.restore();
    }

    // ---- label on the shore
    const lA = at(t, 1.4, 0.8);
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lA * 0.9;
      ctx.strokeStyle = 'rgba(20,15,12,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(300, SHORE + 60);
      ctx.lineTo(300, SHORE + 120);
      ctx.stroke();
      txt(ctx, 'TAMBAK', 300, SHORE + 152, { size: 24, font: F.mono6, color: 'rgba(20,15,12,0.6)', track: 5, align: 'center' });
      ctx.restore();
    }

    grain(ctx, 0.03);
  },
};
