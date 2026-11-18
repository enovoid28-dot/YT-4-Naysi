import { W, H, txt, fillRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk, halftone } from './_kertas.mjs';
import { A, roll, fadeUp, rule, grid, dot, guide, hatch, panel } from './_cetak.mjs';

// 03 — FOKUS
// A performance curve, plotted the way a lab would print it: hours awake on the
// x-axis, sharpness on the y. The curve is flat enough to be ignored until it
// is not, and the marker at seventeen hours is the whole argument.
const FOCUS = (h) => 100 * Math.exp(-Math.pow(h / 17, 2.6));

function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 700, glowY: 380, glowA: 0.3 });
  const c = (i) => cue(scene, i);

  // ── the plot ───────────────────────────────────────────────────────────
  const px0 = 176;
  const px1 = 1280;
  const py0 = 420;
  const py1 = 962;
  const X = (h) => lerp(px0, px1, h / 24);
  const Y = (v) => lerp(py1, py0, v / 100);

  const pFrame = A(t, c(0), 0.7, ease.out);
  if (pFrame > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pFrame);
    // graph paper field
    const gs = 38;
    ctx.strokeStyle = 'rgba(27,63,214,0.13)';
    ctx.lineWidth = 1;
    for (let x = px0; x <= px1; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, py0); ctx.lineTo(x, py1); ctx.stroke();
    }
    for (let y = py0; y <= py1; y += gs) {
      ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(px1, y); ctx.stroke();
    }
    // axes
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px0, py0 - 14); ctx.lineTo(px0, py1); ctx.lineTo(px1 + 16, py1);
    ctx.stroke();
    // y labels
    [100, 75, 50, 25].forEach((v) => {
      tracking(ctx, `${v}`, px0 - 16, Y(v) + 7, {
        size: 17, font: F.mono6, track: 1, color: 'rgba(20,17,16,0.45)', align: 'right',
      });
      ctx.fillStyle = 'rgba(20,17,16,0.22)';
      ctx.fillRect(px0 - 9, Y(v), 9, 2);
    });
    ctx.restore();
  }

  // hours awake along the foot of the plot
  const pAxis = A(t, c(0) + 0.25, 0.6);
  if (pAxis > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pAxis);
    for (let h = 0; h <= 24; h += 6) {
      const x = X(h);
      ctx.fillStyle = 'rgba(20,17,16,0.35)';
      ctx.fillRect(x - 1, py1, 2, 12);
      tracking(ctx, String(h), x, py1 + 42, {
        size: 19, font: F.mono6, track: 1, color: K.ink2, align: 'center',
      });
    }
    tracking(ctx, 'JAM TERJAGA', px1 + 8, py1 + 42, {
      size: 17, font: F.mono6, track: 3, color: 'rgba(20,17,16,0.42)', align: 'right',
    });
    tracking(ctx, 'KESIAPAN', px0 - 16, py0 - 30, {
      size: 17, font: F.mono6, track: 3, color: 'rgba(20,17,16,0.42)', align: 'left',
    });
    ctx.restore();
  }

  // the curve, drawn on
  const pCurve = A(t, c(0) + 0.1, 1.5, ease.inOut);
  if (pCurve > 0.004) {
    ctx.save();
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    const hi = 24 * pCurve;
    for (let h = 0; h <= hi + 0.01; h += 0.2) {
      const x = X(h);
      const y = Y(FOCUS(h));
      if (h === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // the marker at seventeen hours
  const pMark = A(t, c(1), 0.6, ease.back);
  if (pMark > 0.004) {
    const x = X(17);
    const y = Y(FOCUS(17));
    guide(ctx, x, y, py1, { a: pMark, color: K.red, p: 1 });
    ctx.save();
    ctx.globalAlpha *= clamp(pMark);
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 22 + (1 - clamp(pMark)) * 40, 0, TAU);
    ctx.stroke();
    ctx.restore();
    dot(ctx, x, y, 12 * clamp(pMark), { color: K.red });
    fadeUp(ctx, A(t, c(1) + 0.14, 0.45), 12, () => {
      tracking(ctx, '17 JAM', x, py1 + 96, {
        size: 26, font: F.mono6, track: 2, color: K.red, align: 'center',
      });
    });
  }

  // ── the sentence, set as a sum ─────────────────────────────────────────
  const pEq = A(t, c(2), 0.55);
  if (pEq > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pEq);
    const y = 1338;
    roll(ctx, '17', 104, y, {
      size: 108, p: A(t, c(2) + 0.02, 0.5, ease.expo), track: -5,
    });
    kick(ctx, 'JAM', 226, y, { size: 24, track: 6, color: K.ink2 });
    txt(ctx, '=', 330, y - 6, { size: 120, font: F.num, color: K.ink, track: -4 });
    roll(ctx, '0,05%', 408, y, {
      size: 118, p: A(t, c(2) + 0.12, 0.6, ease.expo), color: K.red, track: -5,
    });
    fadeUp(ctx, A(t, c(2) + 0.3, 0.4), 10, () => {
      kick(ctx, 'ALKOHOL DALAM DARAH', 414, y + 46, { size: 20, track: 4, color: K.soft });
    });
    ctx.restore();
  }

  const pStamp = A(t, c(2) + 0.42, 0.45, ease.back);
  stampInk(ctx, 'SETARA', 1104, 1340, {
    a: pStamp, size: 46, track: 7, rot: -0.07, color: K.red, pad: 26,
  });

  // ── a reaction strip: the lag grows tick by tick ───────────────────────
  const pr = A(t, c(3) - 0.25, 0.7, ease.out);
  if (pr > 0.004) {
    const y = 1444;
    const sx = (sec) => 104 + sec * 196;
    ctx.save();
    ctx.globalAlpha *= 0.85;
    ctx.fillStyle = K.ink;
    ctx.fillRect(104, y, (sx(3) - 104) * clamp(pr), 2.4);
    for (let sec = 0; sec <= 3; sec++) {
      ctx.globalAlpha = 0.85 * clamp(pr);
      ctx.fillStyle = 'rgba(20,17,16,0.5)';
      ctx.fillRect(sx(sec) - 1, y, 2, 10);
      tracking(ctx, String(sec), sx(sec), y + 40, {
        size: 16, font: F.mono6, track: 1, color: 'rgba(20,17,16,0.45)', align: 'center',
      });
    }
    tracking(ctx, 'DETIK', sx(3) + 16, y + 40, {
      size: 16, font: F.mono6, track: 3, color: 'rgba(20,17,16,0.45)',
    });
    ctx.restore();
  }
  const lags = [0.45, 1.55, 2.9];
  lags.forEach((sec, i) => {
    const p = A(t, c(3 + i) - 0.02, 0.5, ease.out);
    if (p <= 0.004) return;
    const x = 104 + sec * 196;
    ctx.save();
    ctx.globalAlpha *= clamp(p);
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 1444);
    ctx.lineTo(x, 1444 - 54 * clamp(p));
    ctx.stroke();
    dot(ctx, x, 1444 - 54 * clamp(p), 8, { color: K.red });
    ctx.restore();
  });
}

export default { draw: drawScene };
