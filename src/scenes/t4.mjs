import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, bed, micro, A, cue, cueWord, ease, hexA, TAU, clamp, lerp, rng, leader, pill,
} from './_malam.mjs';

// 04 — MEMORI
// A brain in line, the way an engraving would draw one: a silhouette with real
// lobes, folds that follow the surface, a cerebellum tucked under the back, and a
// brain stem. One structure is lit — the hippocampus — because that is the part
// the sentence names. The night's notes are the dots: they leave it, cross to the
// cortex, and stay. Take the sleep away and the same dots drop into water.

const CX = 726;
const CY = 862;
const S = 620; // half-height unit

/* ── silhouette, traced as a closed spline: the outline a brain actually has ── */
const OUTLINE = [
  [0.95, 0.08], [0.90, -0.20], [0.72, -0.50], [0.42, -0.70], [0.05, -0.76],
  [-0.30, -0.72], [-0.62, -0.53], [-0.80, -0.24], [-0.85, 0.02],
  [-0.76, 0.28], [-0.54, 0.43], [-0.27, 0.41], [-0.04, 0.50],
  [0.24, 0.60], [0.52, 0.52], [0.75, 0.33], [0.90, 0.21],
];

function smoothClosed(ctx, pts) {
  const n = pts.length;
  const p = (i) => pts[(i + n) % n];
  ctx.beginPath();
  ctx.moveTo(p(0)[0], p(0)[1]);
  for (let i = 0; i < n; i++) {
    const a = p(i - 1);
    const b = p(i);
    const c = p(i + 1);
    const d = p(i + 2);
    const c1x = b[0] + (c[0] - a[0]) / 6;
    const c1y = b[1] + (c[1] - a[1]) / 6;
    const c2x = c[0] - (d[0] - b[0]) / 6;
    const c2y = c[1] - (d[1] - b[1]) / 6;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, c[0], c[1]);
  }
  ctx.closePath();
}

const pt = (u, v) => [CX + u * S, CY + v * S];

function brainPath(ctx) {
  smoothClosed(ctx, OUTLINE.map(([u, v]) => pt(u, v)));
}

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't4c', window: false, warm: 0.5 });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const wAir = cueWord(scene, 3, 'air');
    const appear = A(t, c[0] - 0.1, 1.2, ease.out);
    const rise = A(t, c[1] + 0.15, 1.6, ease.inOut);
    const lose = A(t, c[2] + 0.15, 1.6, ease.inOut);
    const water = A(t, wAir - 0.35, 1.1, ease.inOut);
    const dim = 1 - 0.30 * water;

    bed(ctx, { y: 2150, pillow: false, a: 0.8 * (1 - 0.5 * water) });
    const scrim = ctx.createLinearGradient(0, 1560, 0, 1920);
    scrim.addColorStop(0, 'rgba(4,5,12,0)');
    scrim.addColorStop(1, 'rgba(4,5,12,0.86)');
    ctx.fillStyle = scrim;
    ctx.fillRect(-80, 1560, W + 160, 720);

    if (appear > 0.01) {
      ctx.save();
      ctx.globalAlpha *= appear * dim;
      const pulse = 0.9 + 0.1 * Math.sin(t * 1.5);

      // light behind the head
      const bg = ctx.createRadialGradient(...pt(0.05, -0.15), 40, ...pt(0.05, -0.15), S * 1.25);
      bg.addColorStop(0, `rgba(110,160,255,${0.13 * pulse})`);
      bg.addColorStop(0.55, 'rgba(70,110,190,0.05)');
      bg.addColorStop(1, 'rgba(40,70,150,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(-80, 120, W + 160, 1800);

      // the hindbrain sits behind the cerebrum: cerebellum and stem first
      ctx.save();
      const cbl = pt(-0.34, 0.33);
      ctx.beginPath();
      ctx.ellipse(cbl[0], cbl[1], 0.22 * S, 0.13 * S, -0.18, 0, TAU);
      const cg = ctx.createLinearGradient(cbl[0], cbl[1] - 0.13 * S, cbl[0], cbl[1] + 0.13 * S);
      cg.addColorStop(0, 'rgba(96,132,205,0.30)');
      cg.addColorStop(1, 'rgba(30,46,96,0.34)');
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(176,212,255,0.34)';
      ctx.lineWidth = 3;
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(cbl[0], cbl[1], 0.18 * S - i * 0.02 * S, 0.10 * S - i * 0.025 * S, -0.18, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.strokeStyle = 'rgba(176,212,255,0.20)';
        ctx.lineWidth = 2.4;
        ctx.stroke();
      }
      ctx.restore();

      // a whisper of fill, then the line
      brainPath(ctx);
      const fill = ctx.createLinearGradient(...pt(0, -0.7), ...pt(0, 0.6));
      fill.addColorStop(0, 'rgba(140,185,255,0.10)');
      fill.addColorStop(1, 'rgba(30,48,100,0.16)');
      ctx.fillStyle = fill;
      ctx.fill();

      /* ── folds: short strokes that run with the surface ───────────────── */
      ctx.save();
      brainPath(ctx);
      ctx.clip();
      // the surface: many small folds, the way a cortex actually looks at this
      // size — a texture, not a diagram
      const rf = rng(77);
      const BANDS = [[-0.60, -0.34], [-0.36, -0.12], [-0.14, 0.10], [0.08, 0.30], [0.28, 0.44]];
      BANDS.forEach(([v0, v1], bi) => {
        const count = 16 - bi;
        for (let i = 0; i < count; i++) {
          const u = -0.72 + (i + 0.5) / count * 1.62 + (rf() - 0.5) * 0.06;
          const v = lerp(v0, v1, rf());
          const [x, y] = pt(u, v);
          const rad = S * (0.028 + rf() * 0.028);
          const a0 = rf() * TAU;
          ctx.strokeStyle = `rgba(184,216,255,${0.11 + rf() * 0.10})`;
          ctx.lineWidth = 2.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(x, y, rad, a0, a0 + 1.5 + rf() * 0.9);
          ctx.stroke();
        }
      });
      ctx.restore();

      // silhouette line
      brainPath(ctx);
      ctx.strokeStyle = 'rgba(176,212,255,0.46)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // lobes: the central sulcus and the lateral (sylvian) fissure
      ctx.strokeStyle = 'rgba(176,212,255,0.30)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(...pt(0.04, -0.62));
      ctx.bezierCurveTo(...pt(-0.04, -0.40), ...pt(0.06, -0.22), ...pt(-0.02, -0.06));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(...pt(0.66, 0.06));
      ctx.bezierCurveTo(...pt(0.40, 0.18), ...pt(0.12, 0.20), ...pt(-0.14, 0.18));
      ctx.stroke();

      /* ── the hippocampus, lit: a hooked structure inside the temporal lobe ── */
      const hx = CX + 0.12 * S;
      const hy = CY + 0.20 * S;
      const lit = 0.5 + 0.5 * rise;
      ctx.save();
      ctx.strokeStyle = hexA(M.amber, 0.30 + 0.55 * lit);
      ctx.lineWidth = 30;
      ctx.lineCap = 'round';
      ctx.shadowColor = hexA(M.amber, 0.85);
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(hx, hy, 0.075 * S, 0.05 * Math.PI, 1.15 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexA(M.gold, 0.55 + 0.40 * lit);
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(hx, hy, 0.075 * S, 0.08 * Math.PI, 1.12 * Math.PI);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    /* ── labels, on leaders, pointing at what they name ─────────────────── */
    const labA = A(t, c[1] + 0.45, 0.6, ease.out) * dim;
    if (labA > 0.01) {
      leader(ctx, ...pt(0.10, -0.44), ...pt(0.30, -0.66), 'KORTEKS', {
        a: labA, color: M.ice, dot: M.ice, size: 32, align: 'left',
      });
      micro(ctx, 'TEMPAT CATATAN DISIMPAN', CX + 0.30 * S + 12, CY - 0.66 * S + 54, {
        size: 25, color: M.faint, track: 4, a: labA * 0.9,
      });
      leader(ctx, CX + 0.12 * S, CY + 0.24 * S, CX - 0.34 * S, CY + 0.50 * S, 'HIPOKAMPUS', {
        a: labA, color: M.amber, dot: M.amber, size: 32, align: 'right',
      });
      micro(ctx, 'PINTU MASUK INGATAN', CX - 0.34 * S - 12, CY + 0.50 * S + 46, {
        size: 25, color: M.faint, track: 4, align: 'right', a: labA * 0.9,
      });
    }

    /* ── the notes of the day ───────────────────────────────────────────── */
    const rp = rng(21);
    ctx.save();
    for (let i = 0; i < 54; i++) {
      const ph = rp();
      const spread = rp() - 0.5;
      const ax = CX + 0.12 * S + spread * 0.13 * S;
      const ay = CY + 0.20 * S + (rp() - 0.5) * 0.09 * S;
      const bx = CX - 0.16 * S + spread * 0.66 * S;
      const by = CY - 0.34 * S + (rp() - 0.5) * 0.24 * S;

      const up = clamp(rise * 1.5 - ph * 0.5, 0, 1);
      const fall = clamp(lose * 1.5 - ph * 0.5, 0, 1);
      const p = up * (1 - fall);
      const arcY = Math.sin(Math.PI * p) * -0.10 * S;
      let x = lerp(ax, bx, p) + Math.sin(p * Math.PI) * spread * 44;
      let y = lerp(ay, by, p) + arcY;
      if (fall > 0.01) {
        const q = clamp((fall - ph * 0.3) / 0.8, 0, 1);
        x = lerp(x, x + spread * 130, q);
        y = lerp(y, 1730 - ph * 160, q * q);
      }
      const a = (0.35 + 0.6 * rp()) * (1 - fall * 0.8) * dim * clamp(rise * 2, 0.15, 1);
      if (a <= 0.01) continue;
      ctx.fillStyle = ph < 0.55 ? hexA(M.gold, a) : hexA(M.ice, a);
      ctx.shadowColor = hexA(M.gold, 0.55);
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(x, y, 3.8 + 3.2 * rp(), 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // the route the notes take, drawn under them
    const trailA = A(t, c[1] + 0.3, 0.8, ease.out) * (1 - A(t, c[2] + 0.1, 0.7, ease.out));
    if (trailA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= trailA * dim;
      ctx.strokeStyle = 'rgba(255,214,150,0.34)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 12]);
      ctx.beginPath();
      ctx.moveTo(CX + 0.10 * S, CY + 0.12 * S);
      ctx.bezierCurveTo(CX + 0.02 * S, CY - 0.06 * S, CX - 0.06 * S, CY - 0.18 * S, CX - 0.14 * S, CY - 0.30 * S);
      ctx.stroke();
      ctx.restore();
    }

    /* ── the water the lesson is written on ─────────────────────────────── */
    const surf = 1596;
    if (water > 0.01) {
      ctx.save();
      ctx.globalAlpha *= water;
      const g = ctx.createLinearGradient(0, surf - 40, 0, surf + 260);
      g.addColorStop(0, 'rgba(140,205,255,0)');
      g.addColorStop(0.3, 'rgba(120,195,255,0.20)');
      g.addColorStop(1, 'rgba(30,80,150,0.05)');
      ctx.fillStyle = g;
      ctx.fillRect(-80, surf - 40, W + 160, 300);
      ctx.strokeStyle = 'rgba(190,225,255,0.50)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = -80; x <= W + 80; x += 30) {
        const y = surf + Math.sin(x * 0.012 + t * 1.1) * 6;
        if (x === -80) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const q = ((t * 0.4 + i / 8) % 1);
        const rad = 50 + q * 660;
        ctx.strokeStyle = `rgba(190,225,255,${(1 - q) * 0.30})`;
        ctx.lineWidth = 3 * (1 - q) + 1;
        ctx.beginPath();
        ctx.ellipse(700 + Math.sin(i * 2.1) * 150, surf + 54, rad, rad * 0.20, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      pill(ctx, 'MENULIS DI ATAS AIR', 108, 1480, { a: water, color: M.ice, size: 29 });
    }
  },
};
