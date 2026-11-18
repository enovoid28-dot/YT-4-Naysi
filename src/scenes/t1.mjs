import { W, H, txt, fillRR, rr, measure, tracking, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk, num } from './_kertas.mjs';
import { A, roll, fadeUp, rule, clock, bracket, dot, panel } from './_cetak.mjs';

// 01 — JAM DUA
// The clock is the picture: two in the morning, and the four hours that are
// left are set as four pressed blocks. When the body stops counting hours, the
// blocks get struck out; what is left is the stamp.
function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 760, glowY: 420, glowA: 0.4 });
  const c = (i) => cue(scene, i);
  const t0 = c(0);

  // ── 02.00 ──────────────────────────────────────────────────────────────
  const pNum = A(t, t0, 0.75, ease.expo);
  roll(ctx, '02.00', 104, 500, { size: 196, p: pNum, track: -10 });
  fadeUp(ctx, A(t, t0 + 0.16, 0.5), 14, () => {
    kick(ctx, 'PAGI', 110, 556, { size: 22, track: 8, color: K.red });
  });

  // the clock, hands at two, second hand running fast because nothing good
  // happens at this hour
  const pClock = A(t, t0 + 0.1, 0.95, ease.expo);
  if (pClock > 0) {
    clock(ctx, 1080, 560, 186, 2, 0, { a: pClock, lw: 5 });
  }

  // ── the four hours that are left ───────────────────────────────────────
  const pBlocks = A(t, c(1) + 0.05, 0.9, ease.out);
  const bx = 104;
  const bw = W - 208;
  const gap = 14;
  const bh = 152;
  const by = 806;
  const cols = ['02', '03', '04', '05'];
  const cw = (bw - gap * 3) / 4;

  fadeUp(ctx, A(t, c(1) + 0.05, 0.45), 10, () => {
    kick(ctx, 'EMPAT JAM', 104, 776, { size: 21, track: 6, color: K.soft });
  });

  const p3 = A(t, c(3), 0.55);
  const p4 = A(t, c(4), 0.5);
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const p = A(t, c(1) + 0.05 + i * 0.07, 0.5, ease.back);
    if (p <= 0.004) continue;
    const x = bx + i * (cw + gap);
    ctx.save();
    ctx.globalAlpha = clamp(p) * (1 - p3);
    const yy = by + (1 - clamp(p)) * 28;
    ctx.fillStyle = K.ink;
    rr(ctx, x, yy, cw, bh, 2);
    ctx.fill();
    txt(ctx, cols[i], x + cw / 2, yy + bh * 0.68, {
      size: 74, font: F.num, color: K.paper, align: 'center', track: -3,
    });
    ctx.restore();
    if (p3 > 0.004) {
      // the hours are crossed out: the block empties and the figure stays
      ctx.save();
      ctx.globalAlpha = clamp(p) * p3;
      ctx.fillStyle = K.card;
      rr(ctx, x, yy, cw, bh, 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,17,16,0.5)';
      ctx.lineWidth = 2.4;
      rr(ctx, x, yy, cw, bh, 2);
      ctx.stroke();
      txt(ctx, cols[i], x + cw / 2, yy + bh * 0.68, {
        size: 74, font: F.num, color: K.ink, align: 'center', track: -3,
      });
      ctx.restore();
    }
  }
  ctx.restore();

  // the hours get struck out once the body stops counting them
  if (p3 > 0.004) {
    ctx.save();
    ctx.globalAlpha *= 1;
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - 6, by + bh * 0.56);
    ctx.lineTo(lerp(bx - 6, bx + bw + 6, p3), by + bh * 0.56 + 8 * p3);
    ctx.stroke();
    ctx.restore();
  }

  fadeUp(ctx, A(t, c(2), 0.5), 12, () => {
    kick(ctx, 'BANGUN 06.00', W - 104, 776, { size: 21, track: 6, color: K.red, align: 'right' });
  });

  // the night, as a ruler, under the four hours
  const pRail = A(t, c(2) + 0.1, 0.8, ease.out);
  if (pRail > 0.004) {
    const ry = 1104;
    ctx.save();
    ctx.globalAlpha *= clamp(pRail) * 0.9;
    ctx.fillStyle = 'rgba(20,17,16,0.32)';
    ctx.fillRect(104, ry, (W - 208) * clamp(pRail), 2);
    const labels = ['22', '23', '00', '01', '02', '03', '04', '05', '06'];
    labels.forEach((lab, i) => {
      const x = 104 + (i / 8) * (W - 208);
      const hot = i >= 4 && i <= 8;
      ctx.globalAlpha = clamp(pRail) * (hot ? 0.9 : 0.5);
      ctx.fillStyle = hot ? K.ink : 'rgba(20,17,16,0.6)';
      ctx.fillRect(x - 1, ry, 2, i === 8 ? 18 : 11);
      tracking(ctx, lab, x, ry + 46, {
        size: 17, font: F.mono6, track: 1,
        color: hot ? K.ink : 'rgba(20,17,16,0.45)', align: 'center',
      });
    });
    ctx.restore();
  }

  // ── what the body counts instead ───────────────────────────────────────
  fadeUp(ctx, A(t, c(4) - 0.1, 0.5), 18, () => {
    kick(ctx, 'BUKAN JAM, TAPI', 104, 1216, { size: 22, track: 7, color: K.soft });
  });
  const pStamp = A(t, c(4) + 0.12, 0.5, ease.back);
  stampInk(ctx, 'UTANG', 470, 1330, {
    a: pStamp, size: 92, track: 8, rot: -0.05, color: K.red, pad: 34,
  });

  // a printed underline that closes the thought
  const pl = A(t, c(5), 0.8, ease.out);
  if (pl > 0.004) {
    ctx.save();
    ctx.globalAlpha *= 0.9;
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(104, 1432);
    ctx.lineTo(104 + (W - 208) * pl, 1432);
    ctx.stroke();
    ctx.restore();
  }
}

export default { draw: drawScene };
