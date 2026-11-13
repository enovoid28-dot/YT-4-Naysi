import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1, spring } from '../engine/anim.mjs';
import { P, plate, eyebrow, ease, group, plane } from './_fare.mjs';
import { tag, panel, ticks, wipeText, rings, ghosts } from '../engine/motion.mjs';

// 06 — YANG BERJALAN TERUS
// Pull back from one seat to the room around it: the auction never started when
// you opened the app, and it will not stop when you close it.

const CX = W / 2;
const CY = 876;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    plate(ctx, { t, glow: P.amber, glowX: CX, glowY: CY, glowA: 0.10, horizon: 1500 });

    eyebrow(ctx, 'SEJAK KURSINYA DIJUAL', { a: a(0.05, 0.5) });

    /* ------------------------------ the room ---------------------------- */
    const roomA = a(0.3, 0.9);
    const slow = clamp((t - 6.5) / 3.0); // the room calms at the end
    if (roomA > 0.01) {
      ctx.save();
      ctx.globalAlpha = roomA;
      rings(ctx, CX, CY, {
        t: t * (1 - 0.6 * slow), n: 4, r0: 90, r1: 470,
        color: P.amber, a: 0.22 * (1 - 0.35 * slow), lw: 1.6, speed: 0.3,
      });
      // bidder marks around the ring, each one a bid that already happened
      const nB = 26;
      for (let i = 0; i < nB; i++) {
        const ang = (i / nB) * TAU - Math.PI / 2;
        const on = i < 6 + Math.floor(t * 2.6);
        const r = 300 + (i % 3) * 34;
        const x = CX + Math.cos(ang) * r;
        const y = CY + Math.sin(ang) * r * 0.98;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + i);
        ctx.fillStyle = on
          ? hexA(P.amber, 0.28 + 0.4 * (i % 5 === 0 ? 1 : 0.35))
          : hexA(P.bone, 0.07);
        const sz = i % 5 === 0 ? 10 : 6;
        ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
        if (on && i % 5 === 0) {
          ctx.strokeStyle = hexA(P.amber, 0.12 * pulse);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 16 + 10 * pulse, 0, TAU);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    /* ----------------------------- the seat ----------------------------- */
    const seatP = ease.out(a(0.5, 0.9));
    if (seatP > 0.01) {
      const r = 132;
      ctx.save();
      ctx.globalAlpha = seatP;
      // plate
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, TAU);
      const g = radGrad(ctx, CX, CY - 30, 10, r * 1.4, [
        [0, 'rgba(24,34,48,0.98)'], [1, 'rgba(9,14,22,0.96)'],
      ]);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = hexA(P.amber, 0.42);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // seat back + cushion, drawn flat
      ctx.save();
      const sq = 0.9 + 0.1 * spring(seatP * 1.2, 10, 0.5);
      ctx.translate(CX, CY);
      ctx.scale(sq, sq);
      fillRR(ctx, -46, -46, 92, 62, 14, hexA(P.bone, 0.10));
      strokeRR(ctx, -46, -46, 92, 62, 14, hexA(P.bone, 0.30), 1.6);
      fillRR(ctx, -38, 22, 76, 14, 7, hexA(P.bone, 0.16));
      ctx.restore();
      ctx.restore();
    }

    /* ------------------------------ price ------------------------------- */
    const pA = a(1.0, 0.8);
    if (pA > 0.01) {
      const rise = ease.inOut(clamp((t - 1.2) / 5.4));
      const tickle = Math.round((noise1(t * 2.4, 21) - 0.5) * 2600 * (1 - rise) * 4);
      const value = Math.round(700000 + 540000 * rise + tickle);
      ctx.save();
      ctx.globalAlpha = pA;
      ctx.save();
      ghosts(ctx, { dx: 5, dy: 0, n: 2, spread: 1, alpha: 0.1 }, () => {
        txt(ctx, `Rp ${group(value)}`, CX, CY + 268, {
          size: 110, font: F.num, color: P.bone, track: -4, align: 'center',
        });
      });
      ctx.restore();
      tracking(ctx, 'HARGA BERJALAN', CX, CY + 322, {
        size: 20, font: F.mono6, track: 6, color: hexA(P.amber, 0.75), align: 'center',
      });
      ctx.restore();
    }

    /* ----------------------------- bid tape ----------------------------- */
    const tapeA = a(4.4, 0.7);
    if (tapeA > 0.01) {
      const y = 1330;
      const x0 = 104;
      const x1 = W - 104;
      const off = (t * 42) % 360;
      ctx.save();
      ctx.globalAlpha = tapeA * 0.9;
      ctx.beginPath();
      ctx.rect(x0, y - 34, x1 - x0, 92);
      ctx.clip();
      ctx.fillStyle = 'rgba(8,13,20,0.7)';
      ctx.fillRect(x0, y - 44, x1 - x0, 100);
      const row = 'BID · 12:41 · Rp 1.180.000 · BID · 12:44 · Rp 1.215.000 · BID · 12:47 · Rp 1.240.000 · ';
      for (let k = -1; k < 3; k++) {
        tracking(ctx, row, x0 - off + k * 1180, y + 8, {
          size: 21, font: F.mono6, track: 3, color: hexA(P.amber, 0.5),
        });
      }
      ctx.restore();
      // edge fades
      ctx.save();
      const lf = linGrad(ctx, x0, 0, x0 + 120, 0, [[0, 'rgba(4,6,11,1)'], [1, 'rgba(4,6,11,0)']]);
      ctx.fillStyle = lf;
      ctx.fillRect(x0, y - 44, 120, 100);
      const rf = linGrad(ctx, x1 - 120, 0, x1, 0, [[0, 'rgba(4,6,11,0)'], [1, 'rgba(4,6,11,1)']]);
      ctx.fillStyle = rf;
      ctx.fillRect(x1 - 120, y - 44, 120, 100);
      ctx.restore();
    }

    /* ------------------------------ ending ------------------------------ */
    const eA = a(6.9, 0.8);
    if (eA > 0.01) {
      const y = 1520;
      const word = 'MASIH DILELANG';
      const w = measure(ctx, word, 96, F.head, 2) + 8;
      const x = CX - w / 2;
      const p = clamp((t - 6.9) / 0.9);
      ctx.save();
      ctx.globalAlpha = eA * 0.95;
      wipeText(ctx, word, x, y, p, {
        size: 96, font: F.head, color: P.bone, track: 2, edgeColor: P.amber,
      });
      ctx.fillStyle = hexA(P.amber, 0.85);
      ctx.fillRect(x, y + 22, w * ease.out(p), 2.5);
      ctx.restore();
    }

    /* ------------------------------ footnote ---------------------------- */
    const fA = a(7.6, 0.7);
    if (fA > 0.01) {
      ctx.save();
      ctx.globalAlpha = fA * 0.85;
      tracking(ctx, 'DEREGULASI 1978: HARGA KURSI BERHENTI DIPASANG, MULAI DIHITUNG', 104, 348, {
        size: 18, font: F.mono6, track: 3, color: hexA(P.bone, 0.30),
      });
      ctx.restore();
    }
  },
};
