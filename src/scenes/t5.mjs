import { W, H, txt, fillRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk, halftone } from './_kertas.mjs';
import { A, roll, fadeUp, rule, grid, dot, guide, hatch, panel } from './_cetak.mjs';

// 05 — GULA
// A lab report: six nights laid along the x-axis, two-hour glucose up the y, and
// the red band at the top that the curve should never enter. It enters on the
// sixth night, which is the only night the reader is asked to look at.
const V = [96, 101, 108, 116, 130, 146];

function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 660, glowY: 400, glowA: 0.3 });
  const c = (i) => cue(scene, i);

  const px0 = 208;
  const px1 = 1240;
  const py0 = 424;
  const py1 = 930;
  const X = (n) => lerp(px0, px1, (n - 1) / 5);
  const Y = (v) => lerp(py1, py0, (v - 60) / 100);

  // ── the report sheet ───────────────────────────────────────────────────
  const pF = A(t, c(0), 0.75, ease.out);
  if (pF > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pF);
    panel(ctx, 104, 336, 1232, 712, { tab: 'HASIL PEMERIKSAAN', fill: K.card });
    // graph paper
    ctx.strokeStyle = 'rgba(27,63,214,0.10)';
    ctx.lineWidth = 1;
    for (let x = px0; x <= px1; x += 34) {
      ctx.beginPath(); ctx.moveTo(x, py0); ctx.lineTo(x, py1); ctx.stroke();
    }
    for (let y = py0; y <= py1; y += 34) {
      ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(px1, y); ctx.stroke();
    }
    // the band that means trouble
    hatch(ctx, px0, py0, px1 - px0, Y(140) - py0, { gap: 18, lw: 2, a: 0.5, color: K.red });
    ctx.fillStyle = 'rgba(210,56,31,0.10)';
    ctx.fillRect(px0, py0, px1 - px0, Y(140) - py0);
    tracking(ctx, 'PRADIABETES', px1 - 10, py0 + 40, {
      size: 20, font: F.mono6, track: 4, color: K.red, align: 'right',
    });
    // grid labels
    [160, 140, 120, 100, 80, 60].forEach((v) => {
      tracking(ctx, String(v), px0 - 18, Y(v) + 7, {
        size: 17, font: F.mono6, track: 1, color: 'rgba(20,17,16,0.45)', align: 'right',
      });
      ctx.fillStyle = 'rgba(20,17,16,0.22)';
      ctx.fillRect(px0 - 10, Y(v), 10, 2);
    });
    // axes
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px0, py0 - 10); ctx.lineTo(px0, py1); ctx.lineTo(px1 + 14, py1);
    ctx.stroke();
    ctx.restore();
  }

  // nights along the foot
  const pA = A(t, c(1), 0.6);
  if (pA > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pA);
    for (let n = 1; n <= 6; n++) {
      tracking(ctx, String(n), X(n), py1 + 40, {
        size: 20, font: F.mono6, track: 1, color: K.ink2, align: 'center',
      });
      ctx.fillStyle = 'rgba(20,17,16,0.3)';
      ctx.fillRect(X(n) - 1, py1, 2, 12);
    }
    tracking(ctx, 'MALAM', X(1) - 34, py1 + 40, {
      size: 17, font: F.mono6, track: 3, color: 'rgba(20,17,16,0.42)', align: 'right',
    });
    ctx.restore();
  }

  // ── the curve ──────────────────────────────────────────────────────────
  const pC = A(t, c(1) + 0.2, 1.6, ease.inOut);
  if (pC > 0.004) {
    ctx.save();
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    const step = pC * 5;
    for (let i = 0; i <= 5; i++) {
      if (i > step + 0.001 && i !== 0) break;
      const u = clamp(step - i + 1);
      const x = lerp(X(i + 1), X(i + 2), u);
      const v = lerp(V[i], V[i + 1], u);
      if (i === 0) ctx.moveTo(X(1), Y(V[0]));
      ctx.lineTo(x, Y(v));
    }
    ctx.stroke();
    ctx.restore();
  }

  // the plotted nights
  for (let i = 0; i < 6; i++) {
    const p = A(t, c(1) + 0.25 + i * 0.22, 0.4, ease.back);
    if (p <= 0.004) continue;
    dot(ctx, X(i + 1), Y(V[i]), 8 * clamp(p), { color: i === 5 ? K.red : K.ink });
  }

  // the last night gets the ring
  const pRing = A(t, c(3), 0.6, ease.back);
  if (pRing > 0.004) {
    const x = X(6);
    const y = Y(146);
    ctx.save();
    ctx.globalAlpha *= clamp(pRing);
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 26 + (1 - clamp(pRing)) * 34, 0, TAU);
    ctx.stroke();
    ctx.restore();
    dot(ctx, x, y, 10 * clamp(pRing), { color: K.red });
  }

  // ── before and after ───────────────────────────────────────────────────
  const pB = A(t, c(1) + 0.1, 0.7, ease.out);
  if (pB > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pB);
    kick(ctx, 'MALAM 1', 104, 1294, { size: 20, track: 5, color: K.soft });
    roll(ctx, '96', 96, 1412, {
      size: 104, p: A(t, c(1) + 0.15, 0.5, ease.expo), track: -4, color: K.ink2,
    });
    kick(ctx, 'MG/DL', 106, 1452, { size: 18, track: 4, color: K.soft });
    ctx.restore();
  }
  const pAr = A(t, c(1) + 0.4, 0.6, ease.out);
  if (pAr > 0.004) {
    const x0 = 300;
    const x1 = 424;
    ctx.save();
    ctx.globalAlpha *= clamp(pAr);
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, 1372);
    ctx.lineTo(lerp(x0, x1 - 22, clamp(pAr)), 1372);
    ctx.stroke();
    ctx.fillStyle = K.red;
    ctx.beginPath();
    ctx.moveTo(x1, 1372);
    ctx.lineTo(x1 - 30, 1355);
    ctx.lineTo(x1 - 30, 1389);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  const pN = A(t, c(3) + 0.15, 0.6, ease.expo);
  if (pN > 0.004) {
    roll(ctx, '146', 478, 1414, { size: 168, p: pN, color: K.red, track: -8 });
  }
  fadeUp(ctx, A(t, c(3) + 0.15, 0.45), 8, () => {
    kick(ctx, 'MALAM 6', 486, 1294, { size: 20, track: 5, color: K.red });
    kick(ctx, 'MG/DL', 700, 1454, { size: 20, track: 4, color: K.red });
  });
}

export default { draw: drawScene };
