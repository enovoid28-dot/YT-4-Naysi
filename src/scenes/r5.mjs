import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, crib, mobile, kick, num, rule, stampInk, typeLabel, pin, thread,
  hatch, leader,
} from './_arsip.mjs';

// 05 — SEPRAI
// The cot from the experiment. The baby remembers the mobile for a week — as
// long as the sheet is the same sheet. Change the liner and the memory is gone.

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.32, lampY: 520, key: 'r5' });

    const swapped = A(t, c(3, 0.05), 0.9, ease.inOut);

    // ── the cot
    const pc = A(t, 0.05, 0.9, ease.expo);
    const cx0 = 62;
    const cy0 = 408;
    const cw = 1010;
    const ch = 700;
    ctx.save();
    ctx.globalAlpha = pc;
    ctx.translate((1 - pc) * -120, 0);
    contact(ctx, cx0 + 20, cy0 + ch - 40, cw - 40, 90, 0.5);
    crib(ctx, cx0, cy0, cw, ch, { key: 'r5a', blanket: ['#A9BDB4', '#5C7069'] });
    // the lamp finds the cot
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const wl = ctx.createRadialGradient(cx0 + cw * 0.5, cy0 + ch * 0.5, 20, cx0 + cw * 0.5, cy0 + ch * 0.5, cw * 0.62);
    wl.addColorStop(0, 'rgba(255,198,132,0.20)');
    wl.addColorStop(1, 'rgba(255,198,132,0)');
    ctx.fillStyle = wl;
    ctx.fillRect(cx0 - 60, cy0 - 60, cw + 120, ch + 120);
    ctx.restore();
    if (swapped > 0.001) {
      ctx.save();
      ctx.globalAlpha = pc * swapped;
      crib(ctx, cx0, cy0, cw, ch, { key: 'r5b', blanket: ['#DBB58A', '#8A5730'] });
      ctx.restore();
      const pl = A(t, c(3, 0.55), 0.6, ease.out);
      typeLabel(ctx, 'SEPRAI DIGANTI', cx0 + 250, cy0 + 96, { size: 20, a: pl, rot: -0.02 });
    }
    ctx.restore();

    // ── the mobile above the cot
    const pm = A(t, 0.35, 0.9, ease.out);
    if (pm > 0.01) {
      ctx.save();
      ctx.globalAlpha = pm;
      mobile(ctx, 330, 150, 470, 270, t, { a: pm, swing: 1 - swapped * 0.9, dim: swapped });
      ctx.restore();
    }

    // ── the two measurements
    const rows = [
      { y: 1226, age: '3 BULAN', w: '1 MINGGU', d: 0.55 },
      { y: 1378, age: '6 BULAN', w: '2 MINGGU', d: 0.85 },
    ];
    rows.forEach((r2, i) => {
      const a = A(t, c(1, r2.d), 0.55, ease.out);
      if (a <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate((1 - a) * 40, 0);
      rule(ctx, 96, r2.y - 62, 1248, { a: 0.55 });
      txt(ctx, r2.age, 96, r2.y + 26, { size: 44, font: F.mono, color: K.dim, track: 3 });
      txt(ctx, 'ingat', 340, r2.y + 24, { size: 30, font: F.mono, color: 'rgba(244,235,218,0.34)', track: 2 });
      txt(ctx, r2.w, 1168, r2.y + 34, {
        size: 76, font: F.display, color: i ? K.bone : K.bone2, align: 'right', track: -2,
      });
      ctx.restore();
    });

    // ── the rule of the experiment
    const pr = A(t, c(4, 0.10), 0.6, ease.out);
    if (pr > 0.01) {
      ctx.save();
      ctx.globalAlpha = pr;
      const y = 1520;
      const bx = 96;
      stampInk(ctx, 'GANTI SEPRAI = HILANG', 720, y - 8, {
        size: 40, rot: -0.05, a: pr, color: K.red, padX: 22, padY: 14, track: 3,
      });
      kick(ctx, 'KONTEKS, BUKAN ISI', bx, y + 6, { size: 19, color: K.dim, track: 6 });
      ctx.restore();
    }

    typeLabel(ctx, 'UJI MAINAN GANTUNG — ROVEE-COLLIER', 74, 1174, { size: 20, a: pc });
  },
};
