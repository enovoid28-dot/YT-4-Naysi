import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, bed, dust, clock, micro, say, A, cue, cueWord, ease, hexA, fillRR, TAU, clamp, lerp, rng,
} from './_malam.mjs';

// 09 — MALAM INI
// Back in the room, but the window has already gone the colour of morning and
// the clock is put to bed before the viewer is. The last thing on screen is the
// one thing the episode asks for: the hour you actually fell asleep.

export default {
  draw(ctx, t, scene) {
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wJam = cueWord(scene, 4, 'jam');
    const dawn = A(t, c[1] + 0.2, 3.0, ease.inOut);
    const off = 1 - A(t, c[1] + 0.4, 1.6, ease.inOut);

    room(ctx, { key: 't9', side: 'right', morning: 0.7 });

    // the window warms up while the room stays asleep
    if (dawn > 0.01) {
      const g = ctx.createLinearGradient(0, 200, 0, 1200);
      g.addColorStop(0, `rgba(255,190,140,${0.10 * dawn})`);
      g.addColorStop(1, `rgba(255,150,110,${0.22 * dawn})`);
      ctx.fillStyle = g;
      ctx.fillRect(760, 200, 760, 1000);
      const s = ctx.createRadialGradient(1240, 900, 40, 1240, 900, 1100);
      s.addColorStop(0, `rgba(255,178,120,${0.16 * dawn})`);
      s.addColorStop(1, 'rgba(255,170,110,0)');
      ctx.fillStyle = s;
      ctx.fillRect(0, 200, W, 2000);
    }

    dust(ctx, t, { a: 0.3, seed: 17, y0: 400, y1: 1700 });

    // the bed, made, empty
    bed(ctx, { y: 2050, pillow: true, pillowX: 470, pillowY: 1918, a: A(t, -0.2, 1.0, ease.out) });

    // the clock being switched off
    const clkA = A(t, c[0] + 0.05, 0.6, ease.out);
    if (clkA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= clkA;
      clock(ctx, 820, 1240, 190, '22:00', { color: M.amber, on: Math.max(0, off), halo: off });
      if (off < 0.5) micro(ctx, 'LAMPU MATI', 826, 1462, { size: 22, color: M.faint, track: 9, a: clkA * off });
      ctx.restore();
    }

    // ── caption 3–4: the two lines that are the whole point
    const core = A(t, c[2] + 0.1, 0.9, ease.out) * (1 - A(t, c[4] + 0.2, 0.9, ease.inOut));
    if (core > 0.01) {
      ctx.save();
      ctx.globalAlpha *= core;
      micro(ctx, 'BUKAN WAKTU YANG HILANG', 112, 640, { size: 24, color: M.faint, track: 9 });
      say(ctx, ['TEMPAT OTAK', 'BERES.'], 104, 760, {
        t, size: 112, at: c[3] + 0.1, stagger: 0.10, color: M.ink, accent: M.amber,
      });
      ctx.restore();
    }

    // ── caption 5: the question
    const ask = A(t, wJam - 0.4, 0.9, ease.out);
    if (ask > 0.01) {
      ctx.save();
      ctx.globalAlpha *= ask;
      const plateG = ctx.createLinearGradient(0, 760, 0, 1560);
      plateG.addColorStop(0, 'rgba(8,10,18,0.72)');
      plateG.addColorStop(1, 'rgba(8,10,18,0.30)');
      fillRR(ctx, 88, 780, 1264, 700, 34, plateG);
      ctx.strokeStyle = hexA(M.amber, 0.35);
      ctx.lineWidth = 2;
      ctx.strokeRect(88, 780, 1264, 700);
      micro(ctx, 'JAWAB DI KOMENTAR', 140, 890, { size: 26, color: M.amber, track: 10 });
      say(ctx, ['JAM BERAPA', 'KAMU TIDUR', 'SEMALAM?'], 132, 1010, {
        t, size: 108, at: wJam - 0.2, stagger: 0.08, color: M.ink, accent: M.gold,
      });
      ctx.restore();
    }
  },
};
