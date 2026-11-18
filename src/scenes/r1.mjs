import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, life, person, say, micro, number, txt, hexA, fillRR, TAU, clamp, lerp, rng,
} from './_langit.mjs';

// 01 — LANGIT HITAM
// One person under a real sky. The sky answers before the voice does: light
// floods up out of the horizon, the stars multiply, and then the frame goes
// black again — and none of it is because the stars are far.

const B = 90; // bleed, so no layer ever shows the page edge through the camera move

export default {
  draw(ctx, t, scene) {
    sky(ctx, { key: 'r1' });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wHitam = cueWord(scene, 3, 'hitam');
    const wJauh = cueWord(scene, 4, 'jauh');

    const px = W * 0.70;
    const py = 1530;
    person(ctx, px, py, 250, { a: A(t, c[0], 1.0, ease.out) });

    // caption 2 — light should come from everywhere: it spills up out of the
    // horizon in wide, soft shafts
    const p2 = A(t, c[1], 0.6, ease.out);
    const out2 = 1 - A(t, c[2], 0.45, ease.out);
    const spill = A(t, c[1] + 0.3, 2.0, ease.inOut) * (1 - A(t, wHitam - 0.3, 0.8, ease.inOut));
    if (spill > 0.01) {
      ctx.save();
      // light rising out of the whole horizon, not out of a diagram
      const hg = ctx.createLinearGradient(0, py + 180, 0, 120);
      hg.addColorStop(0, `rgba(255,196,132,${0.34 * spill})`);
      hg.addColorStop(0.35, `rgba(255,178,120,${0.16 * spill})`);
      hg.addColorStop(0.75, `rgba(180,150,255,${0.06 * spill})`);
      hg.addColorStop(1, 'rgba(140,130,255,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(-B, 110, W + 2 * B, py + 80);
      // and a warm bloom sitting on the ridge itself
      const bg = ctx.createRadialGradient(px, py, 20, px, py, 900);
      bg.addColorStop(0, `rgba(255,206,150,${0.30 * spill})`);
      bg.addColorStop(0.45, `rgba(255,186,130,${0.10 * spill})`);
      bg.addColorStop(1, 'rgba(255,180,120,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(-B, py - 900, W + 2 * B, 1000);
      ctx.restore();
    }

    // the stars that are supposed to be uncountable
    const many = A(t, c[2], 1.4, ease.out) * (1 - A(t, wHitam, 0.5, ease.out));
    if (many > 0.01) {
      const r = rng(41);
      ctx.save();
      ctx.globalAlpha = many * 0.95;
      for (let i = 0; i < 760; i++) {
        const x = -B + r() * (W + 2 * B);
        const y = -B + r() * (H * 0.9 + B);
        const q = A(t, c[2] + 0.1 + r() * 0.9, 0.6);
        ctx.fillStyle = `rgba(255,248,236,${(0.25 + r() * 0.7) * q})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.8 + r() * 2.0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // caption 1 — look up
    say(ctx, ['LIHAT KE ATAS.'], 104, 330, {
      t, size: 112, at: c[0], stagger: 0.1, a: 1 - A(t, c[1], 0.4, ease.out),
    });

    // caption 2 label — every direction
    if (p2 > 0.01 && out2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p2, out2);
      micro(ctx, 'SETIAP ARAH', 104, 300, { size: 28, color: L.warm, track: 12 });
      micro(ctx, 'SEHARUSNYA ADA CAHAYA', 104, 344, { size: 22, color: L.dim, track: 6 });
      ctx.restore();
    }

    // caption 3 — the count
    const p3 = A(t, c[2], 0.6, ease.out);
    const out3 = 1 - A(t, wHitam, 0.5, ease.out);
    if (p3 > 0.01 && out3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p3, out3);
      micro(ctx, 'TIDAK TERHITUNG', 104, 300, { size: 26, color: L.ice, track: 9 });
      say(ctx, ['BINTANG', 'DI MANA-MANA'], 104, 380, { t, size: 100, at: c[2] + 0.1, stagger: 0.09 });
      ctx.restore();
    }

    // caption 4 — and yet: the frame drops back to black
    const p4 = A(t, wHitam - 0.1, 0.5, ease.expo);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4 * 0.94;
      const g = ctx.createRadialGradient(px, 900, 60, px, 900, 1250);
      g.addColorStop(0, 'rgba(3,5,13,0.10)');
      g.addColorStop(1, 'rgba(3,5,13,0.94)');
      ctx.fillStyle = g;
      ctx.fillRect(-B, -B, W + 2 * B, H + 2 * B);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = p4;
      say(ctx, ['TETAP', 'HITAM.'], 104, 420, { t, size: 138, at: wHitam, stagger: 0.1 });
      micro(ctx, 'PADAHAL SEHARUSNYA TERANG', 108, 700, { size: 25, color: L.dim, track: 5 });
      ctx.restore();
    }

    // caption 5 — not distance: the distance is real, and it changes nothing
    const p5 = A(t, wJauh - 0.2, 0.7, ease.out);
    if (p5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p5 * 0.96;
      micro(ctx, 'BUKAN KARENA JARAK', 104, 800, { size: 27, color: L.ice, track: 9 });
      const q = A(t, wJauh, 1.2, ease.inOut);
      // a measured line from the eye to one star, with the label crossed out
      const sx = 1180;
      const sy = 420;
      ctx.strokeStyle = hexA(L.star, 0.45);
      ctx.setLineDash([9, 13]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px - 4, py - 230);
      ctx.lineTo(lerp(px - 4, sx, q), lerp(py - 230, sy + 14, q));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = hexA(L.star, 0.9);
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, TAU);
      ctx.fill();
      const k = A(t, wJauh + 0.55, 0.45, ease.inOut);
      if (k > 0.01) {
        ctx.strokeStyle = hexA(L.crimson, 0.9);
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(104, 852);
        ctx.lineTo(104 + 520 * k, 852);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
};
