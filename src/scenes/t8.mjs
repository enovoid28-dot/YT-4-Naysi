import { W, H, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, micro, number, A, cue, cueWord, ease, axisX, axisY, pill, TAU, clamp, lerp, rng,
} from './_malam.mjs';

// 08 — POLA
// A month of nights, one bar each, on a scale you can read. Nothing is dramatic
// on its own; the pattern is the danger, and the pattern is the shape all thirty
// two bars make when none of them reaches six hours.

const BASE = 1508;
const PER_H = 84;
const N = 32;

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't8b', window: false, warm: 0.5 });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wEnam = cueWord(scene, 1, 'enam');
    const stripeA = A(t, c[1] + 0.1, 1.2, ease.out);
    const risk = A(t, c[2] + 0.3, 1.4, ease.inOut);
    const price = A(t, c[4], 1.2, ease.out);

    const x0 = 150;
    const x1 = 1340;
    const pitch = (x1 - x0) / (N - 1);
    const r = rng(303);

    /* ── the month, one bar a night ──────────────────────────────────────── */
    for (let i = 0; i < N; i++) {
      const p = A(t, c[0] + 0.1 + i * 0.033, 0.55, ease.out);
      if (p <= 0.01) continue;
      const h = 4.6 + r() * 1.9;
      const bh = h * PER_H * p;
      const x = x0 + i * pitch;
      const short = h < 6;
      const g = ctx.createLinearGradient(0, BASE - bh, 0, BASE);
      if (short) {
        g.addColorStop(0, hexA(M.amber, 0.92));
        g.addColorStop(1, hexA(M.amber, 0.14));
      } else {
        g.addColorStop(0, hexA(M.ice, 0.62));
        g.addColorStop(1, hexA(M.ice, 0.08));
      }
      fillRR(ctx, x - 8, BASE - bh, 16, bh, 5, g);
    }
    // the baseline
    ctx.strokeStyle = 'rgba(255,246,232,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0 - 24, BASE);
    ctx.lineTo(x1 + 24, BASE);
    ctx.stroke();

    /* ── the scale: hours on the left, nights along the bottom ───────────── */
    ctx.save();
    ctx.globalAlpha *= A(t, c[0] + 0.2, 0.7, ease.out);
    axisX(ctx, x0, x1, BASE, [[0, 'MALAM 1'], [0.32, 'MALAM 10'], [0.65, 'MALAM 20'], [1, 'MALAM 32']], { a: 1, size: 26 });
    ctx.restore();

    /* ── the six-hour line, and everything below it ──────────────────────── */
    if (stripeA > 0.01) {
      const y = BASE - 6 * PER_H;
      ctx.save();
      ctx.globalAlpha *= stripeA;
      ctx.setLineDash([16, 13]);
      ctx.strokeStyle = hexA(M.ice, 0.42 + 0.30 * risk);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0 - 30, y);
      ctx.lineTo(W + 80, y);
      ctx.stroke();
      ctx.restore();
      micro(ctx, 'BATAS 6 JAM', 112, y - 24, { size: 28, color: M.ice, track: 6, a: stripeA * 0.92 });

      if (risk > 0.01) {
        ctx.save();
        ctx.globalAlpha *= risk;
        const g = ctx.createLinearGradient(0, y, 0, BASE);
        g.addColorStop(0, 'rgba(255,86,66,0.04)');
        g.addColorStop(1, 'rgba(255,86,66,0.30)');
        ctx.fillStyle = g;
        ctx.fillRect(x0 - 24, y, W, BASE - y);
        ctx.restore();
        micro(ctx, 'SEMUA DI BAWAH BATAS', 112, BASE + 96, {
          size: 27, color: hexA(M.red, 0.92), track: 5, a: risk,
        });
      }
    }

    /* ── the hero: six hours, every night ───────────────────────────────── */
    const sixA = A(t, wEnam - 0.3, 0.8, ease.out);
    if (sixA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= sixA;
      number(ctx, '6', 104, 620, { size: 264, color: M.ink, glow: 0.3 });
      ctx.fillStyle = M.amber;
      ctx.fillRect(330, 430, 8, 190);
      ctx.restore();
      micro(ctx, 'JAM', 366, 500, { size: 34, color: M.amber, track: 8, a: sixA });
      micro(ctx, 'TIAP MALAM', 366, 552, { size: 34, color: M.amber, track: 8, a: sixA });
      micro(ctx, '32 MALAM, SATU BULAN', 366, 626, { size: 26, color: M.faint, track: 5, a: sixA });
    }

    /* ── what the pattern travels with, listed in the empty upper right ──── */
    const withA = A(t, c[2] + 0.4, 0.9, ease.out) * (1 - A(t, c[3] + 0.4, 0.8, ease.inOut));
    if (withA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= withA;
      const items = ['TEKANAN DARAH', 'GULA DARAH', 'BERAT BADAN'];
      items.forEach((s, i) => {
        const y = 430 + i * 92;
        ctx.fillStyle = i === 1 ? M.red : 'rgba(255,246,232,0.28)';
        ctx.beginPath();
        ctx.arc(1210, y - 10, 7, 0, TAU);
        ctx.fill();
        micro(ctx, s, 1240, y, { size: 30, color: i === 1 ? M.ink : M.dim, track: 6, align: 'right', a: 1 });
        ctx.strokeStyle = i === 1 ? hexA(M.red, 0.55) : 'rgba(255,246,232,0.14)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(1240, y + 18);
        ctx.lineTo(W - 104, y + 18);
        ctx.stroke();
      });
      micro(ctx, 'YANG IKUT NAIK', 1240, 340, { size: 25, color: M.faint, track: 7, align: 'right', a: 1 });
      ctx.restore();
    }

    /* ── the price, in the quietest type on screen ──────────────────────── */
    if (price > 0.01) {
      ctx.save();
      ctx.globalAlpha *= price;
      const y = BASE + 210;
      ctx.strokeStyle = 'rgba(255,246,232,0.16)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(112, y - 44);
      ctx.lineTo(W - 104, y - 44);
      ctx.stroke();
      micro(ctx, 'HANYA HARGA', 112, y, { size: 32, color: M.faint, track: 14 });
      ctx.restore();
    }
  },
};
