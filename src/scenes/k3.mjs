import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { P, plate, eyebrow, ease, group } from './_fare.mjs';
import { tag, panel, ticks, wipeText, ghosts, rings } from '../engine/motion.mjs';

// 03 — TINGKAT HARGA
// Ten rungs that already exist inside one economy cabin. The cursor is not
// "you": it is inventory opening the next rung the moment the cheap one is gone.

const RUNGS = [
  { cls: 'Q', seats: 6, add: 0 },
  { cls: 'V', seats: 8, add: 90 },
  { cls: 'W', seats: 10, add: 180 },
  { cls: 'S', seats: 12, add: 275 },
  { cls: 'T', seats: 10, add: 370 },
  { cls: 'L', seats: 8, add: 470 },
  { cls: 'K', seats: 6, add: 575 },
  { cls: 'H', seats: 4, add: 690 },
  { cls: 'M', seats: 2, add: 810 },
  { cls: 'Y', seats: 1, add: 950 },
];

const YB = 1420; // y of the cheapest rung
const PITCH = 60;
const BARX = 196;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    plate(ctx, { t, glow: P.mint, glowX: W * 0.3, glowY: 1150, glowA: 0.05 });

    eyebrow(ctx, 'SATU KABIN · SEPULUH TINGKAT', { a: a(0.05, 0.5), rule: P.mint });

    /* ---------------------------- which rung ---------------------------- */
    const jumps = [5.6, 7.6, 9.4];
    let idx = 0;
    let frac = 0;
    for (let j = 0; j < jumps.length; j++) {
      const p = clamp((t - jumps[j]) / 0.55);
      if (p > 0) {
        idx = j + 1;
        frac = ease.expo(p);
      }
    }

    /* ------------------------------ readout ----------------------------- */
    const rA = a(1.0, 0.7);
    if (rA > 0.01) {
      const price = 700000 + RUNGS[idx].add * 1000;
      ctx.save();
      ctx.globalAlpha = rA;
      tracking(ctx, 'HARGA YANG TAMPIL DI APLIKASI', 120, 596, {
        size: 20, font: F.mono6, track: 5, color: hexA(P.bone, 0.38),
      });
      ctx.save();
      ghosts(ctx, { dx: 6, dy: 0, n: 3, spread: 1.2, alpha: 0.10 }, () => {
        txt(ctx, `Rp ${group(price)}`, 114, 706, { size: 104, font: F.num, color: P.bone, track: -4 });
      });
      ctx.restore();
      // class chip
      const cw = 120;
      fillRR(ctx, 120, 748, cw, 52, 6, hexA(P.amber, 0.16));
      strokeRR(ctx, 120, 748, cw, 52, 6, hexA(P.amber, 0.55), 1.4);
      tracking(ctx, `KELAS ${RUNGS[idx].cls}`, 120 + cw / 2, 782, {
        size: 24, font: F.mono6, track: 4, color: P.amber, align: 'center',
      });
      tracking(ctx, 'KAMU TIDAK PERNAH MELIHAT SEPULUH TINGKAT INI', W - 120, 782, {
        size: 19, font: F.mono6, track: 4, color: hexA(P.bone, 0.3), align: 'right',
      });
      // divider
      ctx.fillStyle = hexA(P.bone, 0.10);
      ctx.fillRect(120, 838, W - 240, 1);
      ctx.restore();
    }

    /* ------------------------------ rungs ------------------------------- */
    RUNGS.forEach((r, i) => {
      const p = clamp((t - 0.7 - i * 0.065) / 0.55);
      if (p <= 0) return;
      const y = YB - i * PITCH;
      const w = 210 + i * 26;
      const pass = i < idx;
      const active = i === idx;
      const e = ease.out(p);
      ctx.save();
      ctx.globalAlpha = e;
      ctx.translate(0, (1 - e) * 16);

      // bar
      const bg = active
        ? linGrad(ctx, BARX, 0, BARX + w, 0, [[0, hexA(P.amber, 0.40)], [1, hexA(P.amber, 0.05)]])
        : linGrad(ctx, BARX, 0, BARX + w, 0, [[0, hexA(P.mint, pass ? 0.05 : 0.17)], [1, hexA(P.mint, 0.02)]]);
      fillRR(ctx, BARX, y, w, 24, 4, bg);
      if (active) strokeRR(ctx, BARX, y, w, 24, 4, hexA(P.amber, 0.55), 1.4);

      // class letter
      tracking(ctx, r.cls, 132, y + 20, {
        size: 24, font: F.mono6, track: 2, color: active ? P.amber : hexA(P.bone, pass ? 0.24 : 0.5),
      });

      // remaining seats
      const soldOut = i < idx;
      for (let s = 0; s < r.seats; s++) {
        const px = BARX + w + 20 + s * 15;
        const on = !soldOut && (active ? s < Math.max(0, r.seats - Math.floor(frac * r.seats)) : true);
        ctx.fillStyle = on ? hexA(active ? P.amberHi : P.mint, 0.75) : hexA(P.bone, 0.09);
        ctx.fillRect(px, y + 8, 5, 9);
      }

      // price, right-aligned on one column
      tracking(ctx, `Rp ${group(700000 + r.add * 1000)}`, W - 132, y + 20, {
        size: 25, font: F.mono6, track: 2,
        color: active ? P.amber : hexA(P.bone, pass ? 0.2 : 0.52), align: 'right',
      });
      ctx.restore();
    });

    /* ------------------------------ footer ------------------------------ */
    const fA = a(3.4, 0.7);
    if (fA > 0.01) {
      const cy = YB + 96;
      ctx.save();
      ctx.globalAlpha = fA;
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);
      ctx.beginPath();
      ctx.arc(126, cy + 42, 5, 0, TAU);
      ctx.fillStyle = hexA(P.amber, 0.5 + 0.5 * pulse);
      ctx.fill();
      tracking(ctx, 'KURSI TERMURAH YANG MASIH ADA', 142, cy + 48, {
        size: 20, font: F.mono6, track: 4, color: hexA(P.amber, 0.85),
      });
      tracking(ctx, `BLOK ${RUNGS[idx].seats} KURSI · KELAS ${RUNGS[idx].cls}`, W - 132, cy + 48, {
        size: 20, font: F.mono6, track: 4, color: hexA(P.bone, 0.32), align: 'right',
      });
      ctx.fillStyle = hexA(P.bone, 0.10);
      ctx.fillRect(120, cy + 22, W - 240, 1);
      ctx.restore();
    }
  },
};
