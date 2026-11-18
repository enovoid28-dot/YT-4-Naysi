import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, say, micro, number, txt, hexA, TAU, clamp, lerp, rng, person, life,
} from './_langit.mjs';

// 02 — PARADOKS
// If every direction ends on a star, then the sky is a wall of star surface.
// The scene proves it on the frame itself: shafts of light from the viewer, a
// dome of stars, and then the whole sky blows out to the brightness of the Sun.

const B = 90;

export default {
  draw(ctx, t, scene) {
    sky(ctx, { key: 'r2', band: 0.5 });
    life(ctx, t, { a: 0.7, meteor: 0.6 });
    const c = [0, 1, 2, 3, 4, 5].map((i) => cue(scene, i));
    const px = W * 0.5;
    const py = 1500;

    // caption 1 — a simple question
    say(ctx, ['SATU', 'PERTANYAAN.'], 104, 320, {
      t, size: 104, at: c[0], stagger: 0.1, a: 1 - A(t, c[1], 0.45, ease.out),
    });

    // caption 2 — an unlimited universe: stars reach every corner of the frame
    const p2 = A(t, c[1], 1.2, ease.out);
    if (p2 > 0.01) {
      const r = rng(1234);
      ctx.save();
      ctx.globalAlpha = p2 * 0.9 * (1 - 0.4 * A(t, c[3], 0.6));
      for (let i = 0; i < 620; i++) {
        const x = r() * (W + 2 * B) - B;
        const y = r() * (H * 0.9 + B) - B;
        const q = A(t, c[1] + 0.1 + r() * 0.7, 0.7);
        ctx.fillStyle = `rgba(255,248,236,${(0.22 + r() * 0.6) * q})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.9 + r() * 2.2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // caption 3 — every sight-line ends on a star: wide, soft shafts, not a diagram
    const shafts = A(t, c[2], 0.6, ease.out) * (1 - A(t, c[3], 0.6, ease.out));
    if (shafts > 0.01) {
      const n = 11;
      const R = 1320;
      ctx.save();
      ctx.globalAlpha = shafts;
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.5;
        const q = A(t, c[2] + 0.1 + i * 0.07, 1.1, ease.out);
        const len = R * q;
        const x2 = px + Math.cos(ang) * len;
        const y2 = py + Math.sin(ang) * len;
        const w = 26;
        const nx = Math.cos(ang + Math.PI / 2) * w;
        const ny = Math.sin(ang + Math.PI / 2) * w;
        const g = ctx.createLinearGradient(px, py, x2, y2);
        g.addColorStop(0, 'rgba(190,220,255,0.030)');
        g.addColorStop(0.55, 'rgba(210,230,255,0.075)');
        g.addColorStop(1, 'rgba(255,246,227,0.20)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x2 - nx, y2 - ny);
        ctx.lineTo(x2 + nx, y2 + ny);
        ctx.closePath();
        ctx.fill();
        if (q > 0.97) {
          ctx.fillStyle = 'rgba(255,246,227,0.95)';
          ctx.shadowColor = 'rgba(255,240,210,0.9)';
          ctx.shadowBlur = 22;
          ctx.beginPath();
          ctx.arc(x2, y2, 5.5, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.restore();
    }

    // caption 4 — the whole sky at the brightness of the Sun's surface
    const wall = A(t, c[3] + 0.3, 1.5, ease.inOut) * (1 - A(t, c[5], 0.9, ease.inOut));
    if (wall > 0.01) {
      ctx.save();
      const rr = lerp(120, 1900, A(t, c[3] + 0.3, 1.5, ease.inOut));
      ctx.beginPath();
      ctx.rect(-B, -B, W + 2 * B, py + 6 + B);
      ctx.clip();
      const g = ctx.createRadialGradient(px, py - 420, rr * 0.16, px, py - 420, rr);
      g.addColorStop(0, 'rgba(255,255,252,1)');
      g.addColorStop(0.6, 'rgba(255,251,240,1)');
      g.addColorStop(1, 'rgba(255,236,206,0.99)');
      ctx.globalAlpha = Math.min(1, wall * 1.3);
      ctx.fillStyle = g;
      ctx.fillRect(-B, -B, W + 2 * B, H + 2 * B);
      ctx.restore();
      // the ground stays dark, so the figure has something under its feet
      ctx.save();
      ctx.globalAlpha = Math.min(1, wall * 1.3);
      const gg = ctx.createLinearGradient(0, py - 6, 0, H);
      gg.addColorStop(0, '#0A1128');
      gg.addColorStop(0.5, '#050912');
      gg.addColorStop(1, '#03050D');
      ctx.fillStyle = gg;
      ctx.fillRect(-B, py - 4, W + 2 * B, H - py + B + 4);
      ctx.restore();
      // and the caption block keeps its own darkness, whatever the sky does
      ctx.save();
      ctx.globalAlpha = Math.min(1, wall) * 0.94;
      const sg = ctx.createLinearGradient(0, 1480, 0, 1760);
      sg.addColorStop(0, 'rgba(3,5,13,0)');
      sg.addColorStop(1, 'rgba(3,5,13,1)');
      ctx.fillStyle = sg;
      ctx.fillRect(-B, 1480, W + 2 * B, 300);
      ctx.fillStyle = 'rgba(3,5,13,1)';
      ctx.fillRect(-B, 1750, W + 2 * B, H - 1750 + B);
      ctx.restore();
    }

    // the viewer stands against the light
    person(ctx, px, py, 230, { a: A(t, c[0], 0.8, ease.out), rim: wall > 0.2 ? 0 : 0.3 });

    // caption 5 — even the night should be bright (dark ink on the white wall)
    const p5 = A(t, c[4], 0.7, ease.out);
    const out5 = 1 - A(t, c[5], 0.5, ease.out);
    if (p5 > 0.01 && out5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p5, out5);
      micro(ctx, 'SETERANG PERMUKAAN MATAHARI', 108, 356, { size: 24, color: 'rgba(74,34,14,0.72)', track: 7 });
      // dark ink, because the sky behind it is now a wall of light
      say(ctx, ['MALAM PUN', 'TERANG.'], 104, 420, {
        t, size: 104, at: c[4] + 0.05, stagger: 0.09,
        color: '#241505', accent: '#8C3410',
      });
      ctx.restore();
    }

    // caption 6 — the name and the year
    const p6 = A(t, c[5], 0.8, ease.expo);
    if (p6 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p6;
      const collapse = A(t, c[5], 1.0, ease.inOut);
      // the wall shrinks to one point of light and leaves the sky black behind it
      ctx.fillStyle = `rgba(3,5,13,${0.94 * collapse})`;
      ctx.fillRect(-B, -B, W + 2 * B, H + 2 * B);
      const rr = lerp(760, 46, collapse);
      const g = ctx.createRadialGradient(px, 820, 2, px, 820, Math.max(3, rr));
      g.addColorStop(0, 'rgba(255,252,242,0.95)');
      g.addColorStop(0.34, 'rgba(255,232,186,0.55)');
      g.addColorStop(1, 'rgba(255,200,140,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, 820, Math.max(3, rr), 0, TAU);
      ctx.fill();
      ctx.restore();

      const q = A(t, c[5] + 0.55, 0.8, ease.out);
      if (q > 0.01) {
        ctx.save();
        ctx.globalAlpha = q;
        micro(ctx, '1823 · HEINRICH OLBERS', 720, 984, { size: 24, color: L.ice, align: 'center', track: 7 });
        say(ctx, ['PARADOKS', 'OLBERS.'], 104, 1090, { t, size: 112, at: c[5] + 0.6, stagger: 0.09 });
        ctx.restore();
      }
    }
  },
};
