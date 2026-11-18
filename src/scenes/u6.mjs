import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot, hatch } from './_cetak.mjs';
import { mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';

// 06 — TAGIHAN
// Six checks a day, priced like a receipt. The paper is drawn, the perforation is
// drawn, and the total is the only line that is not small print.
const RX = 190;
const RY = 316;
const RW = 1060;
const RH = 1010;

function zigzag(ctx, x0, x1, y, step = 26, amp = 12) {
  ctx.beginPath();
  ctx.moveTo(x0, y);
  let up = true;
  for (let x = x0; x <= x1; x += step) {
    ctx.lineTo(x, y + (up ? -amp : 0));
    up = !up;
  }
  ctx.lineTo(x1, y + 30);
  ctx.lineTo(x0, y + 30);
  ctx.closePath();
}

function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 4.6, 9.4]);
  const cam = shotCam(t, 0.85);

  sheet(ctx, t, { glowX: 700, glowY: 480, glowA: 0.28 });
  sheen(ctx, t, { period: 6.6, a: 0.06 });

  const pR = land(t, c(0), 0.9);
  if (pR > 0.004) {
    plane(ctx, cam, 0.5, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pR);
      ctx.translate(RX + RW / 2, RY + RH / 2);
      ctx.rotate(-0.012);
      ctx.translate(-(RX + RW / 2), -(RY + RH / 2) + (1 - clamp(pR)) * 40);
      // shadow, then the sheet with a torn top edge
      ctx.fillStyle = 'rgba(20,17,16,0.16)';
      rr(ctx, RX + 14, RY + 20, RW, RH, 4);
      ctx.fill();
      ctx.fillStyle = K.card;
      ctx.fillRect(RX, RY + 20, RW, RH - 20);
      zigzag(ctx, RX, RX + RW, RY, 26, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,17,16,0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(RX, RY + 26, RW, RH - 26);
      ctx.restore();
    });
  }

  // ── the header of the bill ─────────────────────────────────────────────
  plane(ctx, cam, 0.7, () => {
    const p = A(t, c(0) + 0.2, 0.5);
    if (p <= 0.004) return;
    ctx.save();
    ctx.globalAlpha *= clamp(p);
    tracking(ctx, 'TAGIHAN HARI INI', RX + 56, RY + 106, {
      size: 22, font: F.mono6, track: 6, color: 'rgba(20,17,16,0.5)',
    });
    ctx.fillStyle = 'rgba(20,17,16,0.16)';
    ctx.fillRect(RX + 56, RY + 136, RW - 112, 2);
    tracking(ctx, 'SATUAN', RX + 56, RY + 178, {
      size: 17, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.34)',
    });
    tracking(ctx, 'BIAYA', RX + RW - 56, RY + 178, {
      size: 17, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.34)', align: 'right',
    });
    ctx.restore();
  });

  // ── six lines ──────────────────────────────────────────────────────────
  const rows = [0, 1, 2, 3, 4, 5];
  rows.forEach((i) => {
    const p = A(t, c(0) + 0.45 + i * 0.28, 0.5, (x) => 1 - Math.pow(1 - clamp(x), 3));
    if (p <= 0.004) return;
    plane(ctx, cam, 0.8, () => {
      const y = RY + 250 + i * 92;
      ctx.save();
      ctx.globalAlpha *= clamp(p);
      ctx.translate((1 - clamp(p)) * 26, 0);
      txt(ctx, `CEK ${String(i + 1).padStart(2, '0')}`, RX + 56, y, {
        size: 40, font: F.mono6, color: K.ink, track: 2,
      });
      // a small filled bar showing how much of the day each one eats
      ctx.fillStyle = 'rgba(20,17,16,0.12)';
      ctx.fillRect(RX + 300, y - 24, 360, 22);
      ctx.fillStyle = RED;
      ctx.fillRect(RX + 300, y - 24, 360 * clamp(p), 22);
      txt(ctx, '23:15', RX + RW - 56, y, {
        size: 44, font: F.num, color: RED, align: 'right', track: -1,
      });
      ctx.fillStyle = 'rgba(20,17,16,0.12)';
      ctx.fillRect(RX + 56, y + 34, RW - 112, 1.6);
      ctx.restore();
    });
  });

  // ── the total ──────────────────────────────────────────────────────────
  const pT = A(t, c(1), 0.7, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pT > 0.004) {
    plane(ctx, cam, 1.1, () => {
      const y = RY + 862;
      ctx.save();
      ctx.globalAlpha *= clamp(pT);
      // cut line
      ctx.strokeStyle = 'rgba(20,17,16,0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(RX + 40, y - 74);
      ctx.lineTo(RX + RW - 40, y - 74);
      ctx.stroke();
      ctx.restore();
      tracking(ctx, 'TOTAL', RX + 56, y + 6, {
        size: 24, font: F.mono6, track: 6, color: 'rgba(20,17,16,0.5)',
      });
      roll(ctx, '2:19', RX + 210, y + 34, {
        size: 148, p: A(t, c(1) + 0.1, 0.7, (x) => 1 - Math.pow(1 - clamp(x), 3)),
        color: RED, track: -6,
      });
      fadeUp(ctx, A(t, c(1) + 0.45, 0.45), 8, () => {
        kick(ctx, 'JAM · DARI 6 CEK', RX + 214, y + 84, {
          size: 21, track: 5, color: 'rgba(20,17,16,0.5)',
        });
      });
    });
  }

  // ── the stamp ──────────────────────────────────────────────────────────
  const pS = A(t, c(2) - 0.1, 0.5, (x) => 1 - Math.pow(1 - clamp(x), 4));
  if (pS > 0.004) {
    stampInk(ctx, 'PULANG', 1120, 1400, {
      a: clamp(pS), size: 62, track: 8, rot: -0.08, color: RED, pad: 34,
    });
  }

  // the arithmetic, printed small under the receipt
  const pM = A(t, c(1) + 0.6, 0.5);
  if (pM > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pM) * 0.8;
    tracking(ctx, '6 × 23:15', 200, 1410, {
      size: 22, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.45)',
    });
    ctx.restore();
  }
}

export default { draw: drawScene };
