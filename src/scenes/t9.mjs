import { W, H, txt, fillRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk, circleMark } from './_kertas.mjs';
import { A, roll, fadeUp, rule, panel, clock, bracket } from './_cetak.mjs';

// 09 — MALAM INI
// One instruction and one invitation. Two clocks, an hour apart, and a comment
// field that is still waiting — nothing here is a rule, so nothing here is
// stamped "harus".
function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 720, glowY: 460, glowA: 0.42 });
  const c = (i) => cue(scene, i);

  // ── the hour, moved ────────────────────────────────────────────────────
  const pA = A(t, c(0), 0.9, ease.expo);
  if (pA > 0.004) {
    clock(ctx, 380, 580, 152, 11, 0, { a: clamp(pA) * 0.72, lw: 5 });
    fadeUp(ctx, A(t, c(0) + 0.2, 0.45), 10, () => {
      tracking(ctx, '23.00', 380, 800, {
        size: 26, font: F.mono6, track: 2, color: 'rgba(20,17,16,0.42)', align: 'center',
      });
    });
  }

  const pB = A(t, c(1) - 0.1, 0.9, ease.expo);
  if (pB > 0.004) {
    clock(ctx, 1064, 580, 152, 10, 0, { a: clamp(pB), lw: 5, sec: (t * 20) % 60 });
    fadeUp(ctx, A(t, c(1) + 0.1, 0.45), 10, () => {
      tracking(ctx, '22.00', 1064, 800, {
        size: 26, font: F.mono6, track: 2, color: K.ink, align: 'center',
      });
    });
    // hand-drawn ring, the way you would circle it on a printout
    circleMark(ctx, 1064, 580, 178, 172, A(t, c(1) + 0.35, 0.8, ease.inOut), {
      color: K.red, lw: 5, rot: -0.12,
    });
  }

  // the arrow and the hour it saves
  const pAr = A(t, c(1) + 0.15, 0.7, ease.out);
  if (pAr > 0.004) {
    const x0 = 590;
    const x1 = 846;
    ctx.save();
    ctx.globalAlpha *= clamp(pAr);
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, 580);
    ctx.lineTo(lerp(x0, x1 - 26, clamp(pAr)), 580);
    ctx.stroke();
    ctx.fillStyle = K.red;
    ctx.beginPath();
    ctx.moveTo(x1, 580);
    ctx.lineTo(x1 - 34, 562);
    ctx.lineTo(x1 - 34, 598);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    fadeUp(ctx, A(t, c(1) + 0.4, 0.45), 8, () => {
      tracking(ctx, '−1 JAM', 718, 540, {
        size: 30, font: F.mono6, track: 3, color: K.red, align: 'center',
      });
    });
  }

  // ── the comment field, still empty ─────────────────────────────────────
  const pC = A(t, c(2), 0.7, ease.back);
  if (pC > 0.004) {
    const bx = 168;
    const by = 900;
    const bw = 1104;
    const bh = 340;
    ctx.save();
    ctx.globalAlpha *= clamp(pC);
    ctx.translate(0, (1 - clamp(pC)) * 40);
    // bubble with a tail
    ctx.fillStyle = 'rgba(20,17,16,0.16)';
    rr(ctx, bx + 10, by + 14, bw, bh, 26);
    ctx.fill();
    ctx.fillStyle = K.card;
    rr(ctx, bx, by, bw, bh, 26);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + 92, by + bh - 2);
    ctx.lineTo(bx + 86, by + bh + 62);
    ctx.lineTo(bx + 178, by + bh - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 4;
    rr(ctx, bx, by, bw, bh, 26);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + 180, by + bh - 2);
    ctx.lineTo(bx + 86, by + bh + 60);
    ctx.lineTo(bx + 92, by + bh - 2);
    ctx.stroke();
    ctx.restore();

    // the question mark, in red
    roll(ctx, '?', bx + 104, by + 262, {
      size: 250, p: A(t, c(2) + 0.12, 0.6, ease.expo), color: K.red, font: F.display,
      track: -2,
    });

    // three dots, typing
    const pd = A(t, c(3), 0.5);
    if (pd > 0.004) {
      for (let i = 0; i < 3; i++) {
        const ph = Math.sin(t * 3.4 - i * 0.7) * 0.5 + 0.5;
        ctx.save();
        ctx.globalAlpha = clamp(pd) * (0.35 + 0.65 * ph);
        ctx.fillStyle = K.ink;
        ctx.beginPath();
        ctx.arc(bx + 640 + i * 78, by + 176, 17, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    // a printed cursor
    const pCur = A(t, c(4), 0.5);
    if (pCur > 0.004) {
      ctx.save();
      ctx.globalAlpha *= clamp(pCur);
      ctx.fillStyle = K.red;
      ctx.fillRect(bx + 640, by + 214, 232, 5);
      ctx.restore();
    }
  }

  // ── the last printed line ──────────────────────────────────────────────
  const pL = A(t, c(3) + 0.2, 0.8, ease.out);
  if (pL > 0.004) {
    ctx.save();
    ctx.globalAlpha *= 0.8;
    ctx.fillStyle = K.ink;
    ctx.fillRect(104, 1380, (W - 208) * clamp(pL), 2.4);
    ctx.restore();
  }
  const pS = A(t, c(4) - 0.05, 0.5, ease.back);
  stampInk(ctx, 'TULIS', 720, 1462, {
    a: clamp(pS), size: 40, track: 9, rot: -0.04, color: K.red, pad: 28,
  });
}

export default { draw: drawScene };
