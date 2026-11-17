import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, micro, number, A, cue, cueWord, ease, hexA, fillRR, TAU, clamp, lerp, rng,
} from './_malam.mjs';

// 08 — POLA
// A month of nights, one bar each. Nothing here is dramatic on its own: the
// pattern is what is dangerous, and the pattern is the shape the bars make when
// they all stop short of six hours.

const BASE = 1600;
const PER_H = 82;

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't8', window: false, warm: 0.5 });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wPola = cueWord(scene, 0, 'polanya');
    const wEnam = cueWord(scene, 1, 'enam');
    const stripeA = A(t, c[1] + 0.1, 1.2, ease.out);
    const risk = A(t, c[2] + 0.3, 1.4, ease.inOut);
    const price = A(t, c[4], 1.2, ease.out);

    const N = 32;
    const x0 = 104;
    const x1 = 1334;
    const pitch = (x1 - x0) / (N - 1);

    // ── the month of nights
    const r = rng(303);
    for (let i = 0; i < N; i++) {
      const p = A(t, c[0] + 0.1 + i * 0.035, 0.6, ease.out);
      if (p <= 0.01) continue;
      const h = 5.0 + r() * 1.9;
      const bh = h * PER_H * p;
      const x = x0 + i * pitch;
      const warmBar = h < 6;
      const g = ctx.createLinearGradient(0, BASE - bh, 0, BASE);
      if (warmBar) {
        g.addColorStop(0, hexA(M.amber, 0.85));
        g.addColorStop(1, hexA(M.amber, 0.12));
      } else {
        g.addColorStop(0, hexA(M.ice, 0.55));
        g.addColorStop(1, hexA(M.ice, 0.06));
      }
      ctx.fillStyle = g;
      fillRR(ctx, x - 9, BASE - bh, 18, bh, 6, g);
    }
    ctx.strokeStyle = 'rgba(255,246,232,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-80, BASE);
    ctx.lineTo(W + 80, BASE);
    ctx.stroke();

    // ── the six-hour line: everything below it is the pattern
    if (stripeA > 0.01) {
      const y = BASE - 6 * PER_H;
      ctx.save();
      ctx.globalAlpha *= stripeA;
      ctx.setLineDash([16, 14]);
      ctx.strokeStyle = hexA(M.ice, 0.35 + 0.3 * risk);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-80, y);
      ctx.lineTo(W + 80, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      micro(ctx, '6 JAM', 112, y - 34, { size: 26, color: M.ice, track: 8, a: stripeA * 0.85 });

      // the shortfall, pooled under the line
      if (risk > 0.01) {
        ctx.save();
        ctx.globalAlpha *= risk;
        const g = ctx.createLinearGradient(0, y, 0, BASE);
        g.addColorStop(0, 'rgba(255,86,66,0.05)');
        g.addColorStop(1, 'rgba(255,86,66,0.26)');
        ctx.fillStyle = g;
        ctx.fillRect(-80, y, W + 160, BASE - y);
        ctx.fillStyle = 'rgba(255,86,66,0.55)';
        ctx.fillRect(-80, BASE - 4, W + 160, 4);
        ctx.restore();
      }
    }

    // ── the hero: six hours, every night
    const sixA = A(t, wEnam - 0.3, 0.8, ease.out);
    if (sixA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= sixA;
      micro(ctx, 'KURANG LEBIH', 112, 470, { size: 24, color: M.faint, track: 10 });
      number(ctx, '6', 108, 700, { size: 300, color: M.ink, glow: 0.35 });
      micro(ctx, 'JAM TIAP MALAM', 234, 560, { size: 30, color: M.amber, track: 8 });
      ctx.restore();
    }

    // ── caption 3: what that pattern goes with
    const withA = A(t, c[2] + 0.4, 0.9, ease.out) * (1 - A(t, c[3] + 0.4, 0.8, ease.inOut));
    if (withA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= withA;
      ['TEKANAN DARAH', 'GULA DARAH', 'BERAT BADAN'].forEach((s, i) => {
        const y = 1180 + i * 86;
        micro(ctx, s, 112, y, { size: 26, color: i === 1 ? M.red : M.dim, track: 8 });
        ctx.strokeStyle = i === 1 ? hexA(M.red, 0.5) : 'rgba(255,246,232,0.16)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(112, y + 20);
        ctx.lineTo(112 + 240, y + 20);
        ctx.stroke();
      });
      ctx.restore();
    }

    // ── caption 5: the price, in the quietest type in the film
    if (price > 0.01) {
      ctx.save();
      ctx.globalAlpha *= price;
      micro(ctx, 'HANYA HARGA', 112, 1240, { size: 30, color: M.faint, track: 14 });
      ctx.restore();
    }
  },
};
