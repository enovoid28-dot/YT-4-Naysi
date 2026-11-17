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
    bed(ctx, { y: 2060, pillow: false, a: A(t, -0.2, 1.0, ease.out) });

    // the clock being switched off
    const clkA = A(t, c[0] + 0.05, 0.6, ease.out);
    if (clkA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= clkA;
      clock(ctx, 664, 1236, 178, '22:00', { color: M.amber, on: off, halo: off * 0.8 });
      micro(ctx, off < 0.5 ? 'LAMPU MATI' : 'JAM TIDUR', 670, 1450, {
        size: 26, color: off < 0.5 ? M.faint : M.amber, track: 9, a: clkA * (0.35 + 0.65 * off),
      });
      ctx.restore();
    }

    // ── caption 3–4: the two lines that are the whole point
    const core = A(t, c[2] + 0.1, 0.9, ease.out) * (1 - A(t, c[4] + 0.2, 0.9, ease.inOut));
    if (core > 0.01) {
      ctx.save();
      ctx.globalAlpha *= core;
      micro(ctx, 'BUKAN WAKTU YANG HILANG', 112, 812, { size: 26, color: M.faint, track: 9 });
      ctx.fillStyle = hexA(M.amber, 0.75);
      ctx.fillRect(112, 838, 96, 5);
      say(ctx, ['TEMPAT OTAK', 'BERES.'], 104, 930, {
        t, size: 112, at: c[3] + 0.1, stagger: 0.10, color: M.ink, accent: M.amber,
      });
      ctx.restore();
    }

    // ── caption 5: the question
    const ask = A(t, wJam - 0.4, 0.9, ease.out);
    if (ask > 0.01) {
      ctx.save();
      ctx.globalAlpha *= ask;
      const plateG = ctx.createLinearGradient(0, 836, 0, 1272);
      plateG.addColorStop(0, 'rgba(6,8,15,0.86)');
      plateG.addColorStop(1, 'rgba(6,8,15,0.52)');
      fillRR(ctx, 88, 836, 1264, 432, 30, plateG);
      ctx.strokeStyle = hexA(M.amber, 0.40);
      ctx.lineWidth = 2;
      ctx.strokeRect(88, 836, 1264, 432);
      ctx.fillStyle = hexA(M.amber, 0.9);
      ctx.fillRect(140, 892, 88, 5);
      micro(ctx, 'MULAI MALAM INI', 140, 952, { size: 27, color: M.amber, track: 9 });
      say(ctx, ['SATU JAM', 'LEBIH AWAL.'], 132, 1052, {
        t, size: 116, at: wJam - 0.2, stagger: 0.09, color: M.ink, accent: M.gold,
      });
      ctx.restore();

      // the takeaway, in three pieces, under the card
      const take = A(t, wJam + 0.35, 0.9, ease.out);
      if (take > 0.01) {
        ctx.save();
        ctx.globalAlpha *= take;
        ctx.strokeStyle = 'rgba(255,246,232,0.16)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(112, 1404);
        ctx.lineTo(W - 104, 1404);
        ctx.stroke();
        ['7 – 9 JAM', 'JAM SAMA', 'LAYAR MATI'].forEach((s2, i) => {
          const x = 112 + i * 416;
          micro(ctx, s2, x, 1478, { size: 30, color: i === 0 ? M.gold : M.dim, track: 6, a: 1 });
          micro(ctx, ['DURASI', 'RUTIN', 'SEBELUM TIDUR'][i], x, 1522, {
            size: 23, color: M.faint, track: 6, a: 1,
          });
        });
        ctx.restore();
      }
    }
  },
};
