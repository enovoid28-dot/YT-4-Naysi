import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip } from './_kota.mjs';
import { G, ponds } from './_garam.mjs';

// 04 — CUACA. A working season in seven seconds. The pans dry, the crust comes
// in white, and then one wall of cloud walks across the frame and takes the
// whole harvest back to water. The audience should feel the weather as an edge
// crossing the picture, not as an icon.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, '#E9E2D2');

    // hard morning sun in the upper right
    const sunA = at(t, 0.05, 0.8);
    ctx.save();
    ctx.globalAlpha = sunA;
    const sg = radGrad(ctx, 1120, 214, 20, 520, [[0, 'rgba(255,236,196,0.95)'], [0.25, 'rgba(243,167,95,0.35)'], [1, 'rgba(243,167,95,0)']]);
    ctx.fillStyle = sg;
    ctx.fillRect(-300, -300, W + 600, 900);
    ctx.fillStyle = '#FFF6E2';
    ctx.beginPath();
    ctx.arc(1120, 214, 58, 0, TAU);
    ctx.fill();
    ctx.restore();

    // crust: grows while the sun is out, collapses when the rain arrives
    const grow = clamp(E.out(at(t, 0.3, 3.0)) - E.out(at(t, 4.3, 1.5)));
    const wet = E.out(at(t, 4.1, 1.6));

    layer(ctx, cam, 0.2, () => {
      ponds(ctx, {
        x0: -160, x1: W + 160, y0: 372, y1: 1660,
        rows: 12, cols: 13, seed: 12, t, crust: 0.06 + grow * 0.94, a: 1, dyke: 0.065,
      });
      // a few workers' paths across the embankments, so the scale reads
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'rgba(120,104,80,0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-60, 640);
      ctx.lineTo(520, 780);
      ctx.lineTo(W + 60, 700);
      ctx.stroke();
      ctx.restore();
    });

    // ---- the cloud wall, and the rain behind it
    const cA = at(t, 3.4, 1.4);
    if (cA > 0.01) {
      const edge = lerp(W + 420, 240, E.inOut(at(t, 3.4, 2.2)));
      ctx.save();
      ctx.globalAlpha = cA;
      // shadow side of the wall
      const g = linGrad(ctx, edge - 300, 0, edge + 260, 0, [
        [0, 'rgba(58,60,62,0)'], [0.45, 'rgba(58,60,62,0.55)'], [1, 'rgba(38,42,46,0.86)'],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(edge - 300, -220, W + 620 - (edge - 300), H + 440);
      // rain streaks inside it
      const r = rng(41);
      ctx.strokeStyle = 'rgba(214,232,236,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 220; i++) {
        const x = edge + r() * Math.max(1, W + 200 - edge);
        const y = r() * H;
        ctx.globalAlpha = cA * (0.15 + r() * 0.4);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 8, y + 46 + r() * 40);
        ctx.stroke();
      }
      // cartoon-free cloud lumps on the leading edge
      ctx.globalAlpha = cA;
      for (let i = 0; i < 9; i++) {
        const y = -80 + i * 230 + Math.sin(i * 1.7 + t) * 16;
        const rr2 = 130 + 60 * Math.sin(i * 2.3);
        const g2 = radGrad(ctx, edge, y, 10, rr2, [[0, 'rgba(74,78,82,0.9)'], [1, 'rgba(74,78,82,0)']]);
        ctx.fillStyle = g2;
        ctx.fillRect(edge - rr2, y - rr2, rr2 * 2, rr2 * 2);
      }
      ctx.restore();
    }

    // wet film over the pans after the rain
    if (wet > 0.02) {
      ctx.save();
      ctx.globalAlpha = wet * 0.45;
      ctx.fillStyle = G.pondDeep;
      ctx.fillRect(-40, 560, W + 80, 1060);
      ctx.restore();
    }

    // ---- labels
    const k1 = at(t, 0.4, 0.6) * (1 - at(t, 3.3, 0.6));
    if (k1 > 0.01) chip(ctx, 'MUSIM KEMARAU', 96, 470, { a: k1, bg: 'rgba(20,15,12,0.82)', ink: G.bone, border: hexA(G.sun, 0.5) });
    const k2 = at(t, 4.4, 0.8);
    if (k2 > 0.01) chip(ctx, 'SATU HUJAN = PANEN HILANG', 96, 470, { a: k2, bg: 'rgba(20,15,12,0.86)', ink: G.bone, border: hexA('#8FB6BC', 0.6) });

    // the crust counter, top left, so the loss is measurable
    const cA2 = at(t, 0.6, 0.8);
    if (cA2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA2;
      const lvl = clamp(grow);
      const shown = lerp(4, 100, lvl);
      txt(ctx, 'PANEN', 96, 300, { size: 22, font: F.mono6, color: 'rgba(20,15,12,0.55)', track: 5 });
      txt(ctx, `${Math.round(shown)}%`, 96, 392, { size: 84, font: F.num, color: lvl > 0.5 ? 'rgba(20,15,12,0.9)' : G.rust, track: -2 });
      ctx.fillStyle = 'rgba(20,15,12,0.14)';
      ctx.fillRect(96, 424, 260, 6);
      ctx.fillStyle = lvl > 0.5 ? 'rgba(20,15,12,0.8)' : G.rust;
      ctx.fillRect(96, 424, 260 * lvl, 6);
      ctx.restore();
    }

    grain(ctx, 0.03);
  },
};
