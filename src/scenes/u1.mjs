import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot, bracket } from './_cetak.mjs';
import { phone, notif, mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, reveal, sheen, land } from '../engine/rig.mjs';

// 01 — SATU CEK
// The whole film in one frame: one second on a phone, and the twenty-three
// minutes it takes to come back. The notification is the only thing that moves
// fast; everything after it is slow, because that is the argument.
function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 4.4, 9.2]);
  const cam = shotCam(t);

  sheet(ctx, t, { glowX: 980, glowY: 620, glowA: 0.34 });
  sheen(ctx, t, { period: 5.5, a: 0.07 });

  // ── the cost, before the cause ─────────────────────────────────────────
  plane(ctx, cam, 0.4, () => {
    fadeUp(ctx, A(t, c(0), 0.4), 12, () => {
      kick(ctx, 'SATU CEK', 104, 302, { size: 21, track: 7, color: 'rgba(20,17,16,0.5)' });
    });
    const pOne = land(t, c(0) + 0.06, 0.7);
    roll(ctx, '1', 88, 620, { size: 380, p: pOne, track: -16 });
    fadeUp(ctx, A(t, c(0) + 0.35, 0.45), 10, () => {
      kick(ctx, 'DETIK', 104, 686, { size: 28, track: 9, color: RED });
    });
  });

  // ── the device ─────────────────────────────────────────────────────────
  plane(ctx, cam, 0.85, () => {
    const pPhone = A(t, c(0) + 0.02, 0.9, (x) => 1 - Math.pow(1 - clamp(x), 3));
    if (pPhone > 0.004) {
      // the light the screen keeps throwing, as an arc behind the body
      ctx.save();
      ctx.globalAlpha = 0.16 * pPhone;
      const g = ctx.createRadialGradient(1010, 700, 40, 1010, 700, 520);
      g.addColorStop(0, BLUE);
      g.addColorStop(1, 'rgba(27,63,214,0)');
      ctx.fillStyle = g;
      ctx.fillRect(420, 140, 1180, 1160);
      ctx.restore();
      phone(ctx, 1064, 742, 372, 748, {
        a: pPhone, rot: -0.04, lit: 1, glare: 0.18,
      });
    }
  });

  // the notification lands on it, hard, with a blur
  const pN = A(t, c(0) + 0.5, 0.55);
  if (pN > 0.004) {
    const slide = (1 - clamp(pN)) * -120;
    plane(ctx, cam, 1, () => {
      ghosts(ctx, { dy: slide * 0.5, n: 4, spread: 0.9, alpha: 0.14 }, () => {
        notif(ctx, 900, 626 + slide, 330, {
          a: clamp(pN) * (1 - 0.55 * A(t, c(1), 0.6)),
          h: 96, hue: BLUE, t,
        });
      });
    });
  }

  // ── the number that comes after ────────────────────────────────────────
  const pBack = A(t, c(1), 0.6);
  if (pBack > 0.004) {
    plane(ctx, cam, 0.2, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pBack);
      // a red rule measures the wait like a scale
      const x0 = 104;
      const x1 = 1336;
      const y = 1120;
      ctx.fillStyle = 'rgba(20,17,16,0.14)';
      ctx.fillRect(x0, y, x1 - x0, 2);
      const pTick = A(t, c(1) + 0.15, 1.6, (x) => 1 - Math.pow(1 - clamp(x), 2));
      for (let i = 0; i <= 23; i++) {
        const x = lerp(x0, x1, i / 23);
        if (x > x0 + (x1 - x0) * pTick) break;
        const big = i % 5 === 0;
        ctx.fillStyle = i >= 1 ? RED : 'rgba(20,17,16,0.4)';
        ctx.fillRect(x - 1, y, 2, big ? 26 : 14);
      }
      ctx.restore();
    });

    const pBig = A(t, c(1) + 0.1, 0.75, (x) => 1 - Math.pow(1 - clamp(x), 3));
    roll(ctx, '23:15', 96, 1300, {
      size: 232, p: pBig, color: K.ink, track: -12,
    });
    fadeUp(ctx, A(t, c(1) + 0.45, 0.5), 12, () => {
      kick(ctx, 'MENIT · UNTUK KEMBALI', 110, 1364, { size: 22, track: 6, color: RED });
    });
  }

  // ── the last card ties the two halves ──────────────────────────────────
  const pTie = A(t, c(2), 0.6);
  if (pTie > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pTie) * 0.9;
    const y = 1444;
    ctx.fillStyle = 'rgba(20,17,16,0.55)';
    ctx.fillRect(104, y, 1232 * clamp(pTie), 3);
    ctx.restore();
  }
}

export default { draw: drawScene };
