import { W, H, txt, fillRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot, guide, panel, cup, bracket, hatch } from './_cetak.mjs';

// 07 — KAFEIN
// A dose, plotted against the clock. The cup is at four in the afternoon; the
// curve is still a quarter full when the lights go out, which is the point and
// the reason the curve is drawn all the way to two.
const HALF = 5; // hours
const D = (h) => 100 * Math.pow(0.5, h / HALF);

function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 700, glowY: 380, glowA: 0.3 });
  const c = (i) => cue(scene, i);

  // clock hours from 14.00; h = 0 is 14.00
  const px0 = 200;
  const px1 = 1240;
  const py0 = 660;
  const py1 = 1250;
  const X = (h) => lerp(px0, px1, h / 12);
  const Y = (v) => lerp(py1, py0, v / 100);

  // ── header: the cup and the hour ───────────────────────────────────────
  const pH = A(t, c(0), 0.7, ease.expo);
  if (pH > 0.004) {
    cup(ctx, 196, 430, 150, { a: clamp(pH), lw: 6 });
  }
  roll(ctx, '16.00', 372, 480, { size: 118, p: A(t, c(0) + 0.1, 0.6, ease.expo), track: -6 });
  fadeUp(ctx, A(t, c(0) + 0.3, 0.45), 10, () => {
    kick(ctx, 'SATU CANGKIR', 378, 528, { size: 21, track: 6, color: K.soft });
  });

  // ── the report ─────────────────────────────────────────────────────────
  const pF = A(t, c(0) + 0.15, 0.7, ease.out);
  if (pF > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pF);
    panel(ctx, 104, 596, 1232, 772, { tab: 'KAFEIN DALAM DARAH' });
    ctx.strokeStyle = 'rgba(27,63,214,0.10)';
    ctx.lineWidth = 1;
    for (let x = px0; x <= px1; x += 36) {
      ctx.beginPath(); ctx.moveTo(x, py0); ctx.lineTo(x, py1); ctx.stroke();
    }
    for (let y = py0; y <= py1; y += 36) {
      ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(px1, y); ctx.stroke();
    }
    [100, 75, 50, 25].forEach((v) => {
      tracking(ctx, `${v}%`, px0 - 18, Y(v) + 7, {
        size: 17, font: F.mono6, track: 1, color: 'rgba(20,17,16,0.45)', align: 'right',
      });
      ctx.fillStyle = 'rgba(20,17,16,0.2)';
      ctx.fillRect(px0 - 10, Y(v), 10, 2);
    });
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px0, py0 - 8); ctx.lineTo(px0, py1); ctx.lineTo(px1 + 12, py1);
    ctx.stroke();
    ctx.restore();
  }

  // the clock along the foot
  const pA = A(t, c(0) + 0.35, 0.6);
  if (pA > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pA);
    [['14.00', 0], ['16.00', 2], ['19.00', 5], ['22.00', 8], ['01.00', 11]].forEach(([lab, h]) => {
      tracking(ctx, lab, X(h), py1 + 44, {
        size: 19, font: F.mono6, track: 1, color: K.ink2, align: 'center',
      });
      ctx.fillStyle = 'rgba(20,17,16,0.3)';
      ctx.fillRect(X(h) - 1, py1, 2, 12);
    });
    ctx.restore();
  }

  // ── the decay ──────────────────────────────────────────────────────────
  const pC = A(t, c(1), 1.8, ease.inOut);
  if (pC > 0.004) {
    ctx.save();
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    const hi = 2 + 10 * pC;
    for (let h = 2; h <= hi + 0.001; h += 0.1) {
      const x = X(h);
      const y = Y(D(h - 2));
      if (h === 2) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // the marks: drink, half, lights out
  const marks = [
    { h: 2, label: '100', at: c(1) + 0.3 },
    { h: 7, label: '50', at: c(3) + 0.1, red: true },
    { h: 12, label: '19', at: c(4) + 0.2 },
  ];
  marks.forEach((m) => {
    const p = A(t, m.at, 0.55, ease.back);
    if (p <= 0.004) return;
    const x = X(m.h);
    const y = Y(D(m.h - 2));
    guide(ctx, x, y, py1, { a: clamp(p), p: 1 });
    dot(ctx, x, y, 9 * clamp(p), { color: m.red ? K.red : K.ink });
    ctx.save();
    ctx.globalAlpha *= clamp(p);
    if (m.red) {
      ctx.strokeStyle = K.red;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 26 + (1 - clamp(p)) * 34, 0, TAU);
      ctx.stroke();
    }
    tracking(ctx, `${m.label}%`, x, y - 34, {
      size: 30, font: F.mono6, track: 1, color: m.red ? K.red : K.ink, align: 'center',
    });
    ctx.restore();
  });

  // five hours, measured where it matters
  const pB = A(t, c(3) + 0.3, 0.7, ease.out);
  if (pB > 0.004) {
    bracket(ctx, X(2), X(7), 1340, 'LIMA JAM', {
      a: clamp(pB), p: clamp(pB), up: 1, size: 24, color: K.red,
    });
  }

  // the hour the body wanted to be asleep
  const pS = A(t, c(4), 0.55, ease.out);
  if (pS > 0.004) {
    const x = X(8);
    ctx.save();
    ctx.globalAlpha *= clamp(pS);
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 2.6;
    ctx.setLineDash([9, 9]);
    ctx.beginPath();
    ctx.moveTo(x, py0);
    ctx.lineTo(x, py1);
    ctx.stroke();
    ctx.restore();
    fadeUp(ctx, A(t, c(4) + 0.2, 0.4), 8, () => {
      tracking(ctx, 'TIDUR', x + 14, py0 + 34, {
        size: 20, font: F.mono6, track: 4, color: K.red,
      });
    });
  }
}

export default { draw: drawScene };
