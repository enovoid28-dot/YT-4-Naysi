import { W, H, txt, hexA, linGrad, radGrad, fillRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker } from './_kota.mjs';
import { O, EA, contours, drawRule, material } from './_ocean.mjs';

// 09 — YANG BELUM DILIHAT. The map of the seafloor is mostly blank, and the
// blank part is the part we care about. What is drawn is drawn in hairlines.

const MAP = { x: 118, y: 306, w: 1204, h: 700 };

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    const g = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#030C10'], [0.5, '#04161B'], [1, '#02080C']]);
    ctx.fillStyle = g;
    ctx.fillRect(-260, -240, W + 520, H + 480);
    material(ctx, 'haze', { x: -200, y: -200, w: W + 400, h: H + 400, a: 0.09, s: 2.2 });

    // survey grid, as on a console
    const gridA = at(t, 0.2, 1.0) * 0.14;
    ctx.save();
    ctx.globalAlpha = gridA;
    ctx.strokeStyle = hexA(O.aqua, 0.5);
    ctx.lineWidth = 1;
    for (let x = MAP.x + 26; x < MAP.x + MAP.w; x += 106) {
      ctx.beginPath();
      ctx.moveTo(x, MAP.y);
      ctx.lineTo(x, MAP.y + MAP.h);
      ctx.stroke();
    }
    for (let y = MAP.y + 26; y < MAP.y + MAP.h; y += 106) {
      ctx.beginPath();
      ctx.moveTo(MAP.x, y);
      ctx.lineTo(MAP.x + MAP.w, y);
      ctx.stroke();
    }
    // frame
    ctx.globalAlpha = gridA * 3;
    ctx.strokeStyle = hexA(O.aqua, 0.4);
    ctx.strokeRect(MAP.x, MAP.y, MAP.w, MAP.h);
    ctx.restore();

    /* ---------------------- the part that is mapped --------------------- */
    layer(ctx, cam, 0.2, () => {
      const p = at(t, 0.5, 3.0);
      contours(ctx, {
        x: MAP.x + 30, y: MAP.y + 20, w: MAP.w - 60, h: MAP.h - 40,
        seed: 21, n: 12, p, color: '#A6BCBC', a: 0.55, lw: 1.25, fill: 0.26,
      });

      // the edge of the surveyed patch: corner brackets, not a box
      const b = at(t, 1.6, 1.2);
      if (b > 0.01) {
        const bx = MAP.x + 142;
        const by = MAP.y + 92;
        const bw = MAP.w - 284;
        const bh = MAP.h - 184;
        const arm = 34 * b;
        ctx.save();
        ctx.globalAlpha = b * 0.75;
        ctx.strokeStyle = hexA(O.amber, 0.5);
        ctx.lineWidth = 1.8;
        for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const px2 = bx + sx * bw;
          const py2 = by + sy * bh;
          ctx.beginPath();
          ctx.moveTo(px2 + (sx ? -arm : arm), py2);
          ctx.lineTo(px2, py2);
          ctx.lineTo(px2, py2 + (sy ? -arm : arm));
          ctx.stroke();
        }
        tracking(ctx, 'TERPETAKAN · RESOLUSI 100 M', bx, by - 16, {
          size: 16, font: F.mono6, track: 4, color: hexA(O.amber, 0.75), alpha: b,
        });
        ctx.restore();
      }

      // scale bar
      const s = at(t, 2.0, 1.0);
      if (s > 0.01) {
        const x0 = MAP.x + 20;
        const y0 = MAP.y + MAP.h - 18;
        const seg = 118;
        ctx.save();
        ctx.globalAlpha = s * 0.6;
        ctx.strokeStyle = hexA(O.pale, 0.62);
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x0 + i * seg, y0);
          ctx.lineTo(lerp(x0 + i * seg, x0 + (i + 1) * seg, s), y0);
          ctx.moveTo(x0 + i * seg, y0 - 6);
          ctx.lineTo(x0 + i * seg, y0 + 6);
          ctx.stroke();
          if (i % 2 === 0) {
            ctx.fillStyle = hexA(O.pale, 0.14);
            ctx.fillRect(x0 + i * seg, y0 - 4, seg * s, 8);
          }
        }
        ctx.beginPath();
        ctx.moveTo(x0 + 3 * seg * s, y0 - 6);
        ctx.lineTo(x0 + 3 * seg * s, y0 + 6);
        ctx.stroke();
        txt(ctx, '0', x0, y0 - 18, { size: 17, font: F.mono6, color: hexA(O.pale, 0.55), track: 1, align: 'center' });
        txt(ctx, '150 KM', x0 + 3 * seg, y0 - 18, {
          size: 17, font: F.mono6, color: hexA(O.pale, 0.55), track: 1, align: 'center',
        });
        ctx.restore();
      }
    });

    /* ----------------------------- the 95% ----------------------------- */
    const p = at(t, 1.5, 1.2, EA.quart);
    if (p > 0.01) {
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(0, (1 - p) * 26);
      txt(ctx, '95', 130, 1268, { size: 246, font: F.num, color: O.bone, track: -8 });
      txt(ctx, '%', 130 + 284, 1268, { size: 118, font: F.num, color: O.amber, track: -2 });
      tracking(ctx, 'BELUM PERNAH DILIHAT LANGSUNG', 136, 1322, {
        size: 22, font: F.mono6, track: 5, color: hexA(O.pale, 0.55),
      });
      ctx.restore();
    }

    drawRule(ctx, 132, 132 + 420 * at(t, 2.4, 0.9), 1372, 1, { color: O.aqua, a: 0.3 });
    const q = at(t, 2.8, 0.9);
    if (q > 0.01) {
      ctx.save();
      ctx.globalAlpha = q;
      tracking(ctx, 'PETA MARS LEBIH TAJAM DARIPADA PETA LAUT KITA', 132, 1436, {
        size: 19, font: F.mono6, track: 4, color: hexA(O.amber, 0.82),
      });
      ctx.restore();
    }

    // closing mark
    const e = at(t, Math.max(0.5, scene.dur - 2.6), 1.0);
    if (e > 0.01) {
      ctx.save();
      ctx.globalAlpha = e * 0.85;
      tracking(ctx, 'NAYSI', W * 0.5, 1512, {
        size: 32, font: F.head, track: 14, align: 'center', color: hexA(O.bone, 0.7),
      });
      ctx.restore();
    }

    kicker(ctx, 'SAMUDRA · YANG BELUM DILIHAT', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
