import { W, H, txt, hexA, linGrad, radGrad, fillRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, snow, anglerfish, jelly, motes, ruler } from './_ocean.mjs';

// 03 — GELAP TOTAL. At a kilometre the sun is gone, so the animals make their
// own. One lamp in the dark, then the count: three in four of them glow.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    column(ctx, 0.72, { t, glowTop: 0.15 });

    layer(ctx, cam, 0.15, () => {
      snow(ctx, t, { n: 150, seed: 31, a: 0.35, speed: 16, scale: 0.9 });
    });

    // the lure is the only light source in frame, and it hangs off the fish
    const fx = 900 + Math.sin(t * 0.5) * 18;
    const fy = 980 + Math.cos(t * 0.42) * 14;
    let esca = { lx: fx + 58, ly: fy - 198 };

    layer(ctx, cam, 0.3, () => {
      jelly(ctx, 288, 1080 + Math.sin(t * 0.6) * 14, 1.05, { t, a: at(t, 1.1, 1.0) * 0.5 });
      esca = anglerfish(ctx, fx, fy, 1.35, { t, a: at(t, 0.4, 1.2), lure: 1 });
    });

    if (esca) motes(ctx, esca.lx, esca.ly, 330, { t, a: 0.45 * at(t, 0.4, 1.2), n: 34, seed: 12 });

    // the swatch of animals that make light
    const p = at(t, 1.8, 0.9);
    if (p > 0.01) {
      const x0 = 132;
      const y0 = 420;
      ctx.save();
      ctx.globalAlpha = p;
      tracking(ctx, 'MAKHLUK YANG BERCAHAYA', x0, y0 - 26, {
        size: 20, font: F.mono6, track: 5, color: hexA(O.pale, 0.5),
      });
      for (let i = 0; i < 12; i++) {
        const cx = x0 + (i % 4) * 66;
        const cy = y0 + Math.floor(i / 4) * 66;
        const lit = i < 9;
        const on = at(t, 2.1 + i * 0.075, 0.5);
        if (lit) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const g = radGrad(ctx, cx, cy, 0, 30, [[0, hexA(O.glow, 0.55 * on)], [1, hexA(O.glow, 0)]]);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, 30, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, TAU);
        ctx.fillStyle = lit ? hexA(O.glow, 0.25 + 0.7 * on) : 'rgba(120,160,160,0.12)';
        ctx.fill();
        ctx.strokeStyle = lit ? hexA(O.glow, 0.55) : 'rgba(140,180,180,0.18)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    const num = at(t, 2.9, 1.1, EA.quart);
    if (num > 0.01) {
      ctx.save();
      ctx.globalAlpha = num;
      ctx.translate(0, (1 - num) * 26);
      txt(ctx, '3/4', 132, 780, { size: 190, font: F.num, color: O.bone, track: -6 });
      tracking(ctx, 'DARI SEMUA MAKHLUK DI SINI', 138, 836, {
        size: 19, font: F.mono6, track: 4, color: hexA(O.pale, 0.5),
      });
      ctx.restore();
    }

    ruler(ctx, W - 250, {
      y0: 420, y1: 1420, max: 4000, cur: lerp(760, 1000, EA.inOut(clamp(t / Math.max(3, scene.dur)))),
      a: at(t, 0.5, 0.8), ticks: 8, label: '',
    });

    chip(ctx, 'MATAHARI TIDAK SAMPAI KE SINI', 132, 1400, {
      a: at(t, 3.4, 0.7) * 0.9, bg: 'rgba(3,14,18,0.7)', ink: hexA(O.pale, 0.85),
      border: hexA(O.aqua, 0.25), size: 21, track: 3,
    });

    kicker(ctx, 'SAMUDRA · GELAP TOTAL', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
