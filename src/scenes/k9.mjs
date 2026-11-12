import { W, H, txt, hexA, linGrad, radGrad, fillRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker } from './_kota.mjs';
import { O, EA, snow, contours, drawRule } from './_ocean.mjs';

// 09 — YANG BELUM DILIHAT. The map of the seafloor is mostly empty, and the
// emptiest part is the part we care about. A sonar sweep keeps promising.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    const g = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#030C10'], [0.5, '#04161B'], [1, '#02080C']]);
    ctx.fillStyle = g;
    ctx.fillRect(-260, -240, W + 520, H + 480);

    // faint grid, as on a survey console
    const gridA = at(t, 0.2, 1.0) * 0.16;
    ctx.save();
    ctx.globalAlpha = gridA;
    ctx.strokeStyle = hexA(O.aqua, 0.5);
    ctx.lineWidth = 1;
    for (let x = 120; x < W; x += 106) {
      ctx.beginPath();
      ctx.moveTo(x, 300);
      ctx.lineTo(x, 1450);
      ctx.stroke();
    }
    for (let y = 300; y < 1450; y += 106) {
      ctx.beginPath();
      ctx.moveTo(120, y);
      ctx.lineTo(W - 120, y);
      ctx.stroke();
    }
    ctx.restore();

    // surveyed patch (26%) vs the blank rest
    layer(ctx, cam, 0.2, () => {
      const p = at(t, 0.6, 3.0);
      ctx.save();
      ctx.globalAlpha = 0.9;
      contours(ctx, { x: 120, y: 320, w: 1180, h: 760, seed: 21, n: 11, p, color: O.aqua, a: 0.7, lw: 1.7 });
      ctx.restore();

      // sonar sweep
      const ang = t * 1.05;
      const cx = 700;
      const cy = 700;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.globalCompositeOperation = 'lighter';
      const sg = ctx.createLinearGradient(0, 0, 520, 0);
      sg.addColorStop(0, hexA(O.glow, 0.22));
      sg.addColorStop(1, hexA(O.glow, 0));
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 520, -0.30, 0.30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // rings
      ctx.save();
      ctx.globalAlpha = 0.35;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, i * 120, 0, TAU);
        ctx.strokeStyle = hexA(O.aqua, 0.18);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();
    });

    /* ----------------------------- the 95% ----------------------------- */
    const p = at(t, 1.6, 1.2, EA.quart);
    if (p > 0.01) {
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(0, (1 - p) * 30);
      txt(ctx, '95', 132, 1240, { size: 250, font: F.num, color: O.bone, track: -8 });
      txt(ctx, '%', 132 + 290, 1240, { size: 120, font: F.num, color: O.amber, track: -2 });
      tracking(ctx, 'DASAR LAUT BELUM TERPETAKAN', 138, 1298, {
        size: 22, font: F.mono6, track: 5, color: hexA(O.pale, 0.55),
      });
      ctx.restore();
    }

    drawRule(ctx, 132, 132 + 420 * at(t, 2.4, 0.9), 1348, 1, { color: O.aqua, a: 0.35 });
    const q = at(t, 2.8, 0.9);
    if (q > 0.01) {
      ctx.save();
      ctx.globalAlpha = q;
      tracking(ctx, 'PETA MARS LEBIH TAJAM DARIPADA PETA LAUT KITA', 132, 1410, {
        size: 20, font: F.mono6, track: 4, color: hexA(O.amber, 0.85),
      });
      ctx.restore();
    }

    // closing mark
    const e = at(t, Math.max(0.5, scene.dur - 2.6), 1.0);
    if (e > 0.01) {
      ctx.save();
      ctx.globalAlpha = e * 0.9;
      ctx.textAlign = 'center';
      tracking(ctx, 'NAYSI', W * 0.5, 1500, {
        size: 34, font: F.head, track: 14, align: 'center', color: hexA(O.bone, 0.75),
      });
      ctx.restore();
    }

    snow(ctx, t, { n: 60, seed: 5, a: 0.14, speed: 6 });

    kicker(ctx, 'SAMUDRA · YANG BELUM DILIHAT', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
