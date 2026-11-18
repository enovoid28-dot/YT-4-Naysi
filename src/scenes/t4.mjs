import { W, H, txt, fillRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk, halftone } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot, panel } from './_cetak.mjs';

// 04 — MEMORI
// A printed cross-section: the day's notes travel from the hippocampus to the
// cortex only after the lights go out. Without that trip the notes have nowhere
// to land, so they fall — and the last third of the scene is the water they
// fall into.

/** catmull-rom through normalised points, closed */
function closedPath(ctx, pts, cx, cy, s) {
  const p = pts.map(([x, y]) => [cx + x * s, cy + y * s]);
  const n = p.length;
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1],
    );
  }
  ctx.closePath();
}

const BRAIN = [
  [-0.96, 0.06], [-0.90, -0.26], [-0.68, -0.56], [-0.34, -0.76],
  [0.06, -0.80], [0.46, -0.70], [0.76, -0.46], [0.93, -0.12],
  [0.94, 0.16], [0.80, 0.38], [0.54, 0.44], [0.44, 0.66],
  [0.22, 0.58], [0.06, 0.76], [-0.22, 0.70], [-0.52, 0.58],
  [-0.80, 0.40], [-0.94, 0.22],
];

function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 720, glowY: 420, glowA: 0.36 });
  const c = (i) => cue(scene, i);

  const cx = 640;
  const cy = 620;
  const s = 400;

  // ── the brain, drawn on like a plate in a textbook ─────────────────────
  const pDraw = A(t, c(0), 1.5, ease.inOut);
  if (pDraw > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pDraw * 1.2);
    closedPath(ctx, BRAIN, cx, cy, s * (0.94 + 0.06 * pDraw));
    ctx.fillStyle = K.card;
    ctx.fill();
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.restore();

    // gyri: printed folds, clipped to the plate
    ctx.save();
    closedPath(ctx, BRAIN, cx, cy, s);
    ctx.clip();
    ctx.strokeStyle = 'rgba(20,17,16,0.55)';
    ctx.lineWidth = 3.4;
    const folds = [
      [-0.55, -0.62, -0.10, -0.34, 0.20, -0.62],
      [-0.72, -0.34, -0.24, -0.10, 0.34, -0.40],
      [-0.80, -0.02, -0.30, 0.14, 0.20, -0.12],
      [-0.62, 0.30, -0.10, 0.30, 0.44, 0.06],
      [0.30, -0.62, 0.56, -0.30, 0.60, -0.02],
      [0.44, 0.14, 0.66, 0.10, 0.80, 0.20],
    ];
    folds.forEach(([ax, ay, bx, by, ex, ey], i) => {
      const p = A(t, c(0) + 0.25 + i * 0.08, 0.6);
      if (p <= 0.004) return;
      ctx.globalAlpha = clamp(p) * 0.7;
      ctx.beginPath();
      ctx.moveTo(cx + ax * s, cy + ay * s);
      ctx.quadraticCurveTo(cx + bx * s, cy + by * s, cx + ex * s, cy + ey * s);
      ctx.stroke();
    });
    ctx.restore();
  }

  // ── hippocampus: the red organ that does the filing ────────────────────
  const pHip = A(t, c(1), 0.7, ease.out);
  if (pHip > 0.004) {
    const hx = cx - 0.02 * s;
    const hy = cy + 0.30 * s;
    ctx.save();
    ctx.globalAlpha *= clamp(pHip);
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx - 52, hy + 18);
    ctx.bezierCurveTo(hx - 26, hy - 66, hx + 96, hy - 88, hx + 132, hy - 8);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,253,246,0.55)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(hx - 40, hy + 8);
    ctx.bezierCurveTo(hx - 18, hy - 52, hx + 84, hy - 70, hx + 118, hy - 12);
    ctx.stroke();
    ctx.restore();

    // leader to the label
    const lx = 1044;
    const ly = 470;
    const p2 = A(t, c(1) + 0.2, 0.55, ease.out);
    if (p2 > 0.004) {
      ctx.save();
      ctx.globalAlpha *= clamp(p2);
      ctx.strokeStyle = K.red;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(hx + 128, hy - 22);
      ctx.lineTo(lx - 22, ly - 26);
      ctx.lineTo(lx, ly - 26);
      ctx.stroke();
      ctx.fillStyle = K.red;
      ctx.beginPath();
      ctx.arc(hx + 128, hy - 22, 5, 0, TAU);
      ctx.fill();
      tracking(ctx, 'HIPOKAMPUS', lx + 8, ly - 20, {
        size: 25, font: F.mono6, track: 4, color: K.red,
      });
      fadeUp(ctx, A(t, c(1) + 0.4, 0.4), 8, () => {
        tracking(ctx, 'MENYERAHKAN CATATAN', lx + 8, ly + 30, {
          size: 18, font: F.mono6, track: 3, color: K.soft,
        });
      });
      ctx.restore();
    }
  }

  // cortex label, the receiving end
  const pCor = A(t, c(1) + 0.5, 0.5);
  if (pCor > 0.004) {
    const lx = 1044;
    const ly = 300;
    ctx.save();
    ctx.globalAlpha *= clamp(pCor);
    ctx.strokeStyle = K.ink2;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx + 0.52 * s, cy - 0.42 * s);
    ctx.lineTo(lx - 26, ly + 40);
    ctx.stroke();
    tracking(ctx, 'KORTEKS', lx + 2, ly + 46, {
      size: 25, font: F.mono6, track: 4, color: K.ink,
    });
    ctx.restore();
  }

  // ── the notes that travel, then fall ───────────────────────────────────
  const pFlow = A(t, c(1) + 0.55, 0.7);
  const pFall = A(t, c(2), 1.4, ease.inOut);
  if (pFlow > 0.004) {
    const n = 7;
    const ax = cx + 0.06 * s;
    const ay = cy + 0.24 * s;
    const bx = cx + 0.46 * s;
    const by = cy - 0.36 * s;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const ph = ((t * 0.36 + i / n) % 1);
      const u = ph;
      const x = lerp(ax, bx, u) + Math.sin(u * Math.PI) * 40;
      const y = lerp(ay, by, u) - Math.sin(u * Math.PI) * 110;
      const fallY = pFall * (300 + i * 32) * (0.55 + u * 0.8);
      const a = clamp(pFlow) * (0.18 + 0.82 * Math.sin(ph * Math.PI)) * (1 - 0.45 * pFall);
      ctx.globalAlpha = a;
      ctx.fillStyle = K.ink;
      const r = 6 - pFall * 1.5;
      ctx.fillRect(x - r, y + fallY - r, r * 2, r * 2);
    }
    ctx.restore();
  }

  // ── the water ──────────────────────────────────────────────────────────
  const pWater = A(t, c(3) - 0.35, 1.1, ease.out);
  if (pWater > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pWater);
    for (let k = 0; k < 3; k++) {
      const y = 1216 + k * 62;
      const amp = 16 - k * 3;
      const p = clamp(pWater * 1.2 - k * 0.12);
      ctx.strokeStyle = k === 0 ? K.red : 'rgba(210,56,31,0.55)';
      ctx.lineWidth = k === 0 ? 6 : 4;
      ctx.beginPath();
      for (let x = 104; x <= 104 + (W - 208) * p; x += 6) {
        const yy = y + Math.sin((x / 96) + t * 1.1 + k * 1.4) * amp
          + Math.sin((x / 37) + t * 2.2 + k) * 4;
        if (x === 104) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    // the ink that never settles
    for (let i = 0; i < 26; i++) {
      const x = 140 + noise1(i * 3.1) * (W - 300);
      const y = 1150 + noise1(i * 5.7) * 300 + Math.sin(t * 1.6 + i) * 6;
      ctx.globalAlpha = clamp(pWater) * 0.45 * (0.4 + noise1(i * 1.3));
      ctx.fillStyle = K.ink;
      ctx.fillRect(x, y, 4, 4);
    }
    ctx.restore();
  }
}

export default { draw: drawScene };
