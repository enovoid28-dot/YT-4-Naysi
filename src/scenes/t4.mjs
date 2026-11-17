import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, bed, dust, micro, A, cue, cueWord, ease, hexA, fillRR, TAU, clamp, lerp, rng,
} from './_malam.mjs';

// 04 — MEMORI
// The day is filed after the lights go out. A warm cloud of memory sits over the
// sleeper; when the voice names the two structures, points start moving from the
// low cluster to the high one. Take the sleep away and the same points fall into
// a water surface and are gone.

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't4', window: false, warm: 0.6 });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const wAir = cueWord(scene, 3, 'air');
    const rise = A(t, c[1] + 0.1, 1.6, ease.inOut);
    const lose = A(t, c[2] + 0.2, 1.4, ease.inOut);
    const water = A(t, wAir - 0.3, 1.2, ease.inOut);
    const dim = 1 - 0.55 * water;

    // ── the duvet, bottom: someone is asleep under it or nobody is
    bed(ctx, { y: 2110, pillow: false, a: 0.9 });
    const wash = ctx.createLinearGradient(0, 1500, 0, 1900);
    wash.addColorStop(0, 'rgba(4,5,12,0)');
    wash.addColorStop(1, 'rgba(4,5,12,0.85)');
    ctx.fillStyle = wash;
    ctx.fillRect(-80, 1500, W + 160, 700);

    const cx = 720;
    const cyHigh = 760;
    const cyLow = 1210;

    // ── the high cluster (cortex) and the low one (hippocampus)
    const cloud = (x, y, r, alpha, hue) => {
      const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
      g.addColorStop(0, hexA(hue, 0.30 * alpha));
      g.addColorStop(0.45, hexA(hue, 0.14 * alpha));
      g.addColorStop(1, hexA(hue, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    ctx.save();
    ctx.globalAlpha *= dim;
    cloud(cx, cyHigh, 470, 1.5 * A(t, c[0], 1.2) * (0.85 + 0.15 * Math.sin(t * 0.9)), M.ice);
    cloud(cx - 40, cyLow, 270, 1.6 * A(t, c[0] + 0.4, 1.0), M.amber);
    // filaments
    const r0 = rng(7);
    ctx.strokeStyle = hexA(M.ice, 0.16);
    ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      const a0 = r0() * TAU;
      const rr = 150 + r0() * 240;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a0) * 40, cyHigh + Math.sin(a0) * 30, rr, a0, a0 + 1.5 + r0());
      ctx.stroke();
    }
    micro(ctx, 'KORTEKS', cx + 250, cyHigh - 210, { size: 24, color: hexA(M.ice, 0.8), track: 9, a: A(t, c[1] + 0.5, 0.6) });
    micro(ctx, 'HIPOKAMPUS', cx - 210, cyLow + 190, { size: 24, color: hexA(M.amber, 0.9), track: 8, a: A(t, c[1] + 0.8, 0.6) });
    ctx.restore();

    // ── the memory points: up while the night is slept, down when it is not
    const r = rng(21);
    ctx.save();
    for (let i = 0; i < 46; i++) {
      const ax = cx - 220 + r() * 440;
      const ay = cyLow - 60 + r() * 140;
      const bx = cx - 330 + r() * 660;
      const by = cyHigh - 180 + r() * 320;
      const ph = r();
      const up = clamp(rise * 1.25 - ph * 0.25, 0, 1);
      const fall = clamp(lose * 1.3 - ph * 0.3, 0, 1);
      const p = up * (1 - fall);
      let x = lerp(ax, bx, p);
      let y = lerp(ay, by, p);
      // when the night is lost they drop instead, and dissolve on the way down
      if (fall > 0.01) {
        const q = clamp((fall - ph * 0.2) / 0.9, 0, 1);
        x = lerp(x, x + 60 * (ph - 0.5), q);
        y = lerp(y, 1760 - 120 * ph, q * q);
      }
      const a = (0.25 + 0.65 * r()) * (1 - fall * 0.85) * dim;
      if (a <= 0.01) continue;
      ctx.fillStyle = hexA(ph < 0.5 ? M.gold : M.ice, a);
      ctx.shadowColor = hexA(M.gold, 0.5);
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(x, y, 3.2 + 2.6 * r(), 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // ── the water the lesson is written on
    const surf = 1590;
    ctx.save();
    ctx.globalAlpha *= water;
    const g = ctx.createLinearGradient(0, surf - 40, 0, surf + 220);
    g.addColorStop(0, 'rgba(140,200,255,0)');
    g.addColorStop(0.35, 'rgba(120,190,255,0.20)');
    g.addColorStop(1, 'rgba(40,90,160,0.05)');
    ctx.fillStyle = g;
    ctx.fillRect(-80, surf - 40, W + 160, 260);
    for (let i = 0; i < 7; i++) {
      const q = ((t * 0.42 + i / 7) % 1);
      const rad = 60 + q * 700;
      ctx.strokeStyle = `rgba(190,225,255,${(1 - q) * 0.34})`;
      ctx.lineWidth = 3 * (1 - q) + 1;
      ctx.beginPath();
      ctx.ellipse(720 + Math.sin(i * 2.1) * 120, surf + 40, rad, rad * 0.22, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  },
};
