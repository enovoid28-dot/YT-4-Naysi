import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot, bracket } from './_cetak.mjs';
import { ringDay, mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';

// 07 — INDONESIA
// The day as a ring. A 3 h 07 m arc of social media, and the two-arc total that
// shows it is not the whole story. The world comparison is two printed bars.
function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 4.8, 9.6]);
  const cam = shotCam(t, 0.8);

  sheet(ctx, t, { glowX: 720, glowY: 520, glowA: 0.3 });
  sheen(ctx, t, { period: 6.0, a: 0.06 });

  const cx = 720;
  const cy = 800;
  const r = 292;

  // ── the ring ───────────────────────────────────────────────────────────
  const pRing = A(t, c(0), 0.9);
  if (pRing > 0.004) {
    plane(ctx, cam, 0.45, () => {
      ringDay(ctx, cx, cy, r, {
        a: clamp(pRing),
        lw: 30,
        arcs: [
          // social media: 3 h 07 m of 24 h
          { from: 0.36, to: 0.36 + 3.117 / 24, p: A(t, c(0) + 0.25, 1.3), color: BLUE, lw: 46 },
          // the rest of the online day, thinner, behind
          { from: 0.12, to: 0.12 + 2.2 / 24, p: A(t, c(2) + 0.1, 1.0) * 0.9, color: 'rgba(27,63,214,0.32)', lw: 12 },
        ],
        marks: [
          { at: 0.36, color: RED, r: 9 },
          { at: 0.36 + 3.117 / 24, color: RED, r: 9 },
        ],
        labels: [
          { at: 0.02, text: '00', size: 18 },
          { at: 0.25, text: '06', size: 18 },
          { at: 0.5, text: '12', size: 18 },
          { at: 0.75, text: '18', size: 18 },
        ],
      });
      // the wider online day, as a hairline outside the ring
      const pOuter = A(t, c(2) + 0.1, 0.9);
      if (pOuter > 0.004) {
        ctx.save();
        ctx.globalAlpha *= clamp(pOuter) * 0.55;
        ctx.strokeStyle = BLUE;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 56, -Math.PI / 2 + TAU * 0.36,
          -Math.PI / 2 + TAU * (0.36 + (5 * 60 + 20) / 60 / 24));
        ctx.stroke();
        ctx.restore();
      }

      // the needle that closes the arc, and the legend that names it
      const pNeedle = A(t, c(0) + 1.1, 0.6);
      if (pNeedle > 0.004) {
        const ang = -Math.PI / 2 + TAU * (0.36 + 3.117 / 24);
        ctx.save();
        ctx.globalAlpha *= clamp(pNeedle);
        ctx.strokeStyle = RED;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * (r - 34), cy + Math.sin(ang) * (r - 34));
        ctx.lineTo(cx + Math.cos(ang) * (r + 60), cy + Math.sin(ang) * (r + 60));
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  // ── the number in the middle of the ring ───────────────────────────────
  const pNum = A(t, c(0) + 0.5, 0.75, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pNum > 0.004) {
    plane(ctx, cam, 1, () => {
      roll(ctx, '3:07', cx, cy + 62, {
        size: 148, p: pNum, align: 'center', track: -6,
      });
      fadeUp(ctx, A(t, c(0) + 0.8, 0.45), 10, () => {
        kick(ctx, 'SEHARI', cx, cy + 130, {
          size: 22, track: 8, color: RED, align: 'center',
        });
      });
    });
  }

  // ── legend ─────────────────────────────────────────────────────────────
  const pLeg = A(t, c(2) + 0.2, 0.6);
  if (pLeg > 0.004) {
    plane(ctx, cam, 0.5, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pLeg);
      const y = 1180;
      ctx.fillStyle = BLUE;
      ctx.fillRect(104, y - 24, 34, 22);
      tracking(ctx, 'MEDIA SOSIAL · 3:07', 158, y - 4, {
        size: 20, font: F.mono6, track: 4, color: K.ink,
      });
      ctx.fillStyle = 'rgba(27,63,214,0.35)';
      ctx.fillRect(104, y + 26, 34, 8);
      tracking(ctx, 'ONLINE TOTAL · 5:20', 158, y + 46, {
        size: 20, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.5)',
      });
      ctx.restore();
    });
  }

  // ── rank ───────────────────────────────────────────────────────────────
  const pRank = A(t, c(1), 0.7, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pRank > 0.004) {
    plane(ctx, cam, 1.15, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pRank);
      ctx.fillStyle = K.ink;
      ctx.fillRect(104, 1180, (W - 208) * clamp(pRank), 2.4);
      ctx.restore();
      roll(ctx, '16', 96, 1392, { size: 178, p: pRank, color: RED, track: -8 });
      fadeUp(ctx, A(t, c(1) + 0.25, 0.45), 10, () => {
        kick(ctx, 'DARI 100 NEGARA', 320, 1330, {
          size: 22, track: 5, color: 'rgba(20,17,16,0.55)',
        });
        kick(ctx, 'PERINGKAT DUNIA', 320, 1382, {
          size: 26, track: 6, color: RED,
        });
      });
    });
  }

  // ── two printed bars: Indonesia vs the world ───────────────────────────
  const pBars = A(t, c(2), 0.9, (x) => 1 - Math.pow(1 - clamp(x), 2));
  if (pBars > 0.004) {
    plane(ctx, cam, 0.3, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pBars);
      const bx = 700;
      const by = 1250;
      const bwMax = 600;
      tracking(ctx, 'INDONESIA', bx, by - 34, {
        size: 19, font: F.mono6, track: 4, color: K.ink,
      });
      ctx.fillStyle = BLUE;
      ctx.fillRect(bx, by - 20, bwMax * (3.117 / 4) * clamp(pBars), 26);
      tracking(ctx, '3:07', bx + bwMax * (3.117 / 4) + 16, by + 4, {
        size: 24, font: F.num, color: BLUE,
      });
      tracking(ctx, 'DUNIA', bx, by + 74, {
        size: 19, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.5)',
      });
      ctx.fillStyle = 'rgba(27,63,214,0.4)';
      ctx.fillRect(bx, by + 88, bwMax * (2.65 / 4) * clamp(pBars), 26);
      tracking(ctx, '2:39', bx + bwMax * (2.65 / 4) + 16, by + 112, {
        size: 24, font: F.num, color: 'rgba(20,17,16,0.55)',
      });
      ctx.restore();
    });
  }
}

export default { draw: drawScene };
