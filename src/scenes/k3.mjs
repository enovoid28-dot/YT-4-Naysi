import { W, H, txt, hexA, linGrad, radGrad, fillRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, anglerfish, jelly, ruler, drawRule } from './_ocean.mjs';

// 03 — GELAP TOTAL. At a kilometre the sun is gone, so the animals make their
// own. One lamp in the dark, hung off a fish's head, then the count.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    column(ctx, 0.74, { t, glowTop: 0.1 });

    // the lure is the only light in frame, so it is also the only fill light:
    // a small pool that reaches the fish's own jaw and nothing else
    const fx = 880 + Math.sin(t * 0.45) * 16;
    const fy = 1010 + Math.cos(t * 0.38) * 12;
    const esca = { lx: fx + 60 * 1.32, ly: fy - 196 * 1.32 };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pool = radGrad(ctx, esca.lx, esca.ly, 0, 330, [
      [0, 'rgba(226,238,228,0.055)'], [0.45, 'rgba(206,226,216,0.022)'], [1, 'rgba(206,226,216,0)'],
    ]);
    ctx.fillStyle = pool;
    ctx.fillRect(esca.lx - 340, esca.ly - 340, 680, 680);
    ctx.restore();

    layer(ctx, cam, 0.3, () => {
      anglerfish(ctx, fx, fy, 1.32, { t, a: at(t, 0.35, 1.1), lure: 1 });
    });

    layer(ctx, cam, 0.22, () => {
      jelly(ctx, 330, 1210 + Math.sin(t * 0.6) * 12, 1.12, { t, a: at(t, 1.1, 1.0) * 0.62 });
    });

    /* ------------------------ the count of light ------------------------ */
    const p = at(t, 1.8, 0.9);
    if (p > 0.01) {
      const x0 = 132;
      const y0 = 424;
      ctx.save();
      ctx.globalAlpha = p;
      tracking(ctx, 'MAKHLUK YANG BERCAHAYA', x0, y0 - 28, {
        size: 20, font: F.mono6, track: 5, color: hexA(O.pale, 0.5),
      });
      for (let i = 0; i < 12; i++) {
        const cx = x0 + (i % 4) * 64;
        const cy = y0 + Math.floor(i / 4) * 64;
        const lit = i < 9;
        const on = at(t, 2.1 + i * 0.07, 0.5);
        ctx.beginPath();
        ctx.arc(cx, cy, 13, 0, TAU);
        ctx.fillStyle = lit ? hexA(O.bone, 0.10 + 0.62 * on) : 'rgba(118,138,138,0.07)';
        ctx.fill();
        ctx.strokeStyle = lit ? hexA(O.bone, 0.30) : 'rgba(136,156,156,0.12)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.restore();
    }

    const num = at(t, 2.9, 1.1, EA.quart);
    if (num > 0.01) {
      ctx.save();
      ctx.globalAlpha = num;
      ctx.translate(0, (1 - num) * 22);
      txt(ctx, '3/4', 130, 784, { size: 188, font: F.num, color: O.bone, track: -6 });
      tracking(ctx, 'DARI SEMUA MAKHLUK DI SINI', 136, 834, {
        size: 19, font: F.mono6, track: 4, color: hexA(O.pale, 0.5),
      });
      ctx.restore();
      drawRule(ctx, 132, 132 + 300 * num, 880, 1, { color: O.aqua, a: 0.35 });
    }

    // one kilometre: the depth that makes all of this necessary
    const dd = at(t, 2.2, 0.8);
    if (dd > 0.01) {
      ctx.save();
      ctx.globalAlpha = dd * 0.9;
      tracking(ctx, '1.000 M', 136, 960, {
        size: 26, font: F.mono6, track: 5, color: hexA(O.aqua, 0.85),
      });
      tracking(ctx, 'MATAHARI SUDAH HABIS', 136, 1002, {
        size: 17, font: F.mono6, track: 4, color: hexA(O.pale, 0.4),
      });
      ctx.restore();
    }

    ruler(ctx, 1246, {
      y0: 420, y1: 1420, max: 4000, cur: lerp(760, 1000, EA.inOut(clamp(t / Math.max(3, scene.dur)))),
      a: at(t, 0.5, 0.8), ticks: 8, label: '',
    });

    chip(ctx, 'MATAHARI TIDAK SAMPAI KE SINI', 132, 1452, {
      a: at(t, 3.4, 0.7) * 0.9, bg: 'rgba(3,14,18,0.72)', ink: hexA(O.pale, 0.85),
      border: hexA(O.aqua, 0.22), size: 21, track: 3,
    });

    kicker(ctx, 'SAMUDRA · GELAP TOTAL', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
