import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot, bracket } from './_cetak.mjs';
import { mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';

// 05 — TIGA
// The interruption is not one stop. It is a stack: the task you left, the thing
// that interrupted it, and the thing you opened on the way back. Three cards,
// landing one after another, and a bracket that measures all of it.
const CW = 760;
const CH = 236;

function stopCard(ctx, x, y, n, o = {}) {
  const { a = 1, tone = K.card, accent = K.ink, label = '' } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(20,17,16,0.16)';
  rr(ctx, x + 10, y + 14, CW, CH, 6);
  ctx.fill();
  ctx.fillStyle = tone;
  rr(ctx, x, y, CW, CH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,17,16,0.75)';
  ctx.lineWidth = 3;
  rr(ctx, x, y, CW, CH, 6);
  ctx.stroke();
  // index
  txt(ctx, String(n), x + 40, y + 152, {
    size: 104, font: F.num, color: accent, track: -4,
  });
  // what it is, as printed rules
  ctx.fillStyle = 'rgba(20,17,16,0.7)';
  rr(ctx, x + 170, y + 74, 250, 20, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(20,17,16,0.2)';
  rr(ctx, x + 170, y + 116, 400, 12, 3);
  ctx.fill();
  rr(ctx, x + 170, y + 142, 300, 12, 3);
  ctx.fill();
  tracking(ctx, label, x + CW - 32, y + 62, {
    size: 16, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.4)', align: 'right',
  });
  ctx.restore();
}

function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 5.2, 8.4]);
  const cam = shotCam(t, 0.9);

  sheet(ctx, t, { glowX: 700, glowY: 560, glowA: 0.3 });
  sheen(ctx, t, { period: 6.0, a: 0.06 });

  // ── the stack ──────────────────────────────────────────────────────────
  const stack = [
    { at: c(0), n: 1, dx: 0, label: 'DITINGGAL', accent: K.ink },
    { at: c(0) + 1.15, n: 2, dx: 44, label: 'MENYELA', accent: RED },
    { at: c(0) + 2.3, n: 3, dx: 88, label: 'DISELIPKAN', accent: RED },
  ];

  stack.forEach((s, i) => {
    const p = land(t, s.at, 0.8);
    if (p <= 0.004) return;
    plane(ctx, cam, 0.45 + i * 0.22, () => {
      const slide = (1 - clamp(p)) * 420;
      ghosts(ctx, { dx: slide * 0.35, n: 3, spread: 0.8, alpha: 0.1 }, () => {
        stopCard(ctx, 240 + s.dx + slide * 0.2, 430 + i * 268, s.n, {
          a: clamp(p), accent: s.accent, label: s.label,
        });
      });
    });
  });

  // ── the bracket that measures the whole detour ─────────────────────────
  const pB = A(t, c(1), 0.8, (x) => 1 - Math.pow(1 - clamp(x), 2));
  if (pB > 0.004) {
    plane(ctx, cam, 1.15, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pB);
      const x = 1140;
      const y0 = 470;
      const y1 = 1240;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x + 26, y0);
      ctx.moveTo(x, y0);
      ctx.lineTo(x, lerp(y0, y1, clamp(pB)));
      ctx.moveTo(x, y1);
      ctx.lineTo(x + 26, y1);
      ctx.stroke();
      ctx.restore();
    });
  }

  // ── the count ──────────────────────────────────────────────────────────
  const pNum = A(t, c(2) - 0.15, 0.7, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pNum > 0.004) {
    plane(ctx, cam, 1.3, () => {
      roll(ctx, '3', 96, 1450, { size: 250, p: pNum, color: RED, track: -10 });
      fadeUp(ctx, A(t, c(2) - 0.05, 0.4), 10, () => {
        kick(ctx, 'BERHENTI', 250, 1450, { size: 24, track: 6, color: RED });
      });
    });
  }

  // the tiny label at the head of the stack
  plane(ctx, cam, 1.1, () => {
    fadeUp(ctx, A(t, c(0) - 0.1, 0.4), 8, () => {
      kick(ctx, 'SATU PEMOTONGAN', 240, 386, {
        size: 20, track: 5, color: 'rgba(20,17,16,0.45)',
      });
    });
  });
}

export default { draw: drawScene };
