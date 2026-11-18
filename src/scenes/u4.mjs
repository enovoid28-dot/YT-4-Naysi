import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk, paperCard } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot, hatch } from './_cetak.mjs';
import { mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';

// 04 — RESIDU
// The same task card, three times. The one you left keeps sitting under the one
// you opened, still lit, still taking up part of the desk — which is exactly
// what attention residue is, drawn as paper.
const cardW = 620;
const cardH = 400;

function taskCard(ctx, x, y, o = {}) {
  const { a = 1, tone = K.card, ghost = 0, label = 'TUGAS' } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(20,17,16,0.18)';
  rr(ctx, x + 12, y + 18, cardW, cardH, 6);
  ctx.fill();
  ctx.fillStyle = tone;
  rr(ctx, x, y, cardW, cardH, 6);
  ctx.fill();
  ctx.strokeStyle = ghost ? 'rgba(20,17,16,0.28)' : K.ink;
  ctx.lineWidth = ghost ? 2 : 3;
  rr(ctx, x, y, cardW, cardH, 6);
  ctx.stroke();
  // the printed content of the task: a heading rule and four lines
  ctx.fillStyle = ghost ? 'rgba(20,17,16,0.28)' : 'rgba(20,17,16,0.8)';
  rr(ctx, x + 44, y + 52, 210, 22, 4);
  ctx.fill();
  ctx.fillStyle = ghost ? 'rgba(20,17,16,0.12)' : 'rgba(20,17,16,0.22)';
  for (let i = 0; i < 4; i++) {
    rr(ctx, x + 44, y + 118 + i * 52, 330 - i * 40, 14, 3);
    ctx.fill();
  }
  // the corner tag
  tracking(ctx, label, x + cardW - 34, y + 52, {
    size: 17, font: F.mono6, track: 4,
    color: ghost ? 'rgba(20,17,16,0.25)' : 'rgba(20,17,16,0.42)', align: 'right',
  });
  ctx.restore();
}

function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 4.0, 9.0]);
  const cam = shotCam(t);

  sheet(ctx, t, { glowX: 760, glowY: 520, glowA: 0.32 });
  sheen(ctx, t, { period: 5.6, a: 0.07 });

  // ── the card you left ──────────────────────────────────────────────────
  plane(ctx, cam, 0.3, () => {
    const p0 = land(t, c(0), 0.8);
    if (p0 <= 0.004) return;
    taskCard(ctx, 150, 520 + (1 - p0) * 30, { a: clamp(p0) * 0.55, ghost: 1, label: 'DITINGGAL' });
  });

  // ── a second task opens on top, and the first one stays ────────────────
  const p1 = A(t, c(0) + 0.9, 0.7, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (p1 > 0.004) {
    plane(ctx, cam, 0.55, () => {
      const dx = (1 - p1) * 380;
      ghosts(ctx, { dx: dx * 0.4, n: 4, spread: 0.85, alpha: 0.12 }, () => {
        taskCard(ctx, 300 + dx, 700, { a: clamp(p1) * 0.95, ghost: 1, label: 'DIBUKA' });
      });
    });
  }

  // ── and the third, which is where the attention actually is ────────────
  const p2 = land(t, c(1) + 0.1, 0.85);
  if (p2 > 0.004) {
    plane(ctx, cam, 1, () => {
      // what is left of the first task: a red residue under everything
      ctx.save();
      ctx.globalAlpha = clamp(p2) * 0.3;
      ctx.fillStyle = RED;
      rr(ctx, 420, 840, cardW, cardH, 6);
      ctx.fill();
      ctx.restore();
      taskCard(ctx, 470, 880 - (1 - p2) * 40, { a: clamp(p2), label: 'SEKARANG' });
      // the red hairline that connects the two
      ctx.save();
      ctx.globalAlpha = clamp(p2) * 0.6;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 2.4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(150 + cardW - 40, 520 + cardH - 60);
      ctx.lineTo(470 + 60, 880 + 30);
      ctx.stroke();
      ctx.restore();
    });
  }

  // ── the label for the thing itself ─────────────────────────────────────
  const pName = A(t, c(2), 0.6, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pName > 0.004) {
    plane(ctx, cam, 1.2, () => {
      roll(ctx, 'RESIDU', 96, 430, {
        size: 132, p: pName, color: RED, track: -4, font: F.display,
      });
      fadeUp(ctx, A(t, c(2) + 0.2, 0.45), 10, () => {
        kick(ctx, 'SISA PERHATIAN DI TUGAS LAMA', 100, 492, {
          size: 21, track: 5, color: 'rgba(20,17,16,0.5)',
        });
      });
    });
  }

  // the drawn arrow from the label to the ghost card
  const pArrow = A(t, c(2) + 0.35, 0.7, (x) => 1 - Math.pow(1 - clamp(x), 2));
  if (pArrow > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pArrow) * 0.7;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 3;
    const x0 = 330;
    const y0 = 470;
    const x1 = 470;
    const y1 = 620;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + 60, y0 + (y1 - y0) * clamp(pArrow) * 0.6,
      lerp(x0, x1, clamp(pArrow)), lerp(y0, y1, clamp(pArrow)));
    ctx.stroke();
    ctx.restore();
  }
}

export default { draw: drawScene };
