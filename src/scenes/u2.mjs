import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk, halftone } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot, bracket, panel, hatch } from './_cetak.mjs';
import { mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';

// 02 — PENGUKURAN
// The number is a measurement, so it is shown as one: a distribution of how long
// people took to come back, plotted on graph paper, with the mean struck through
// it in vermilion. No metaphor — the plot is the shot.
const N = 11;
// resumption times (minutes) across the observed sample, sorted
const BARS = [3, 6, 9, 12, 15, 19, 23, 27, 32, 38, 46];

function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 3.0, 7.2, 10.4]);
  const cam = shotCam(t);

  sheet(ctx, t, { glowX: 700, glowY: 460, glowA: 0.3 });
  sheen(ctx, t, { period: 6.2, a: 0.06 });

  const x0 = 168;
  const x1 = 1250;
  const y0 = 520;
  const y1 = 1080;
  const X = (i) => lerp(x0, x1, (i + 0.5) / N);
  const Y = (v) => lerp(y1, y0, v / 50);
  const bw = (x1 - x0) / N - 22;

  // ── the sheet ──────────────────────────────────────────────────────────
  plane(ctx, cam, 0.25, () => {
    const pF = A(t, c(0), 0.7);
    if (pF <= 0.004) return;
    ctx.save();
    ctx.globalAlpha *= clamp(pF);
    // graph paper
    ctx.strokeStyle = 'rgba(27,63,214,0.11)';
    ctx.lineWidth = 1;
    for (let x = x0; x <= x1; x += 36) {
      ctx.beginPath(); ctx.moveTo(x, y0 - 40); ctx.lineTo(x, y1); ctx.stroke();
    }
    for (let y = y0 - 40; y <= y1; y += 36) {
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    }
    // axis + labels
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0 - 26, y0 - 60); ctx.lineTo(x0 - 26, y1); ctx.lineTo(x1 + 20, y1);
    ctx.stroke();
    [0, 10, 20, 30, 40, 50].forEach((v) => {
      tracking(ctx, String(v), x0 - 40, Y(v) + 6, {
        size: 17, font: F.mono6, track: 1, color: 'rgba(20,17,16,0.42)', align: 'right',
      });
      ctx.fillStyle = 'rgba(20,17,16,0.2)';
      ctx.fillRect(x0 - 34, Y(v), 8, 2);
    });
    tracking(ctx, 'MENIT SAMPAI KEMBALI', x1 + 12, y1 + 44, {
      size: 17, font: F.mono6, track: 3, color: 'rgba(20,17,16,0.42)', align: 'right',
    });
    ctx.restore();
  });

  // ── the sample ─────────────────────────────────────────────────────────
  const pBars = A(t, c(1), 1.5, (x) => 1 - Math.pow(1 - clamp(x), 2));
  if (pBars > 0.004) {
    plane(ctx, cam, 0.5, () => {
      for (let i = 0; i < N; i++) {
        const p = A(t, c(1) + i * 0.055, 0.5, (x) => 1 - Math.pow(1 - clamp(x), 3));
        if (p <= 0.004) continue;
        const h = (Y(0) - Y(BARS[i])) * clamp(p);
        const hot = BARS[i] >= 23;
        ctx.fillStyle = hot ? RED : K.ink;
        ctx.globalAlpha = hot ? 0.9 : 0.86;
        ctx.fillRect(X(i) - bw / 2, Y(0) - h, bw, h);
        // the printed cap
        ctx.globalAlpha = 0.5;
        ctx.fillRect(X(i) - bw / 2, Y(0) - h - 6, bw, 6);
        ctx.globalAlpha = 1;
      }
    });
  }

  // ── the mean, drawn across the plot ────────────────────────────────────
  const pMean = A(t, c(1) + 0.9, 1.2, (x) => 1 - Math.pow(1 - clamp(x), 2));
  if (pMean > 0.004) {
    const ym = Y(23.25);
    plane(ctx, cam, 0.9, () => {
      ctx.save();
      ctx.strokeStyle = RED;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.moveTo(x0 - 26, ym);
      ctx.lineTo(lerp(x0 - 26, x1 + 20, clamp(pMean)), ym);
      ctx.stroke();
      ctx.setLineDash([]);
      // the flag on the line
      if (pMean > 0.55) {
        const a = clamp((pMean - 0.55) / 0.45);
        ctx.globalAlpha = a;
        ctx.fillStyle = RED;
        const fx = x1 - 250;
        fillRR(ctx, fx, ym - 84, 250, 62, 8);
        tracking(ctx, 'RATA-RATA', fx + 22, ym - 42, {
          size: 24, font: F.mono6, track: 4, color: K.card,
        });
        ctx.fillStyle = RED;
        ctx.beginPath();
        ctx.moveTo(fx + 40, ym - 22);
        ctx.lineTo(fx + 62, ym - 22);
        ctx.lineTo(fx + 51, ym - 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // ── the number ─────────────────────────────────────────────────────────
  const pNum = A(t, c(1) + 0.1, 0.75, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pNum > 0.004) {
    plane(ctx, cam, 1.1, () => {
      roll(ctx, '23', 96, 400, { size: 168, p: pNum, track: -8 });
      fadeUp(ctx, A(t, c(1) + 0.35, 0.45), 10, () => {
        kick(ctx, 'MENIT 15 DETIK', 300, 400, { size: 26, track: 6, color: RED });
      });
    });
  }

  // ── the provenance ─────────────────────────────────────────────────────
  const pSrc = A(t, c(2), 0.6);
  if (pSrc > 0.004) {
    plane(ctx, cam, 0.15, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pSrc);
      ctx.fillStyle = 'rgba(20,17,16,0.16)';
      ctx.fillRect(104, 1216, (W - 208) * clamp(pSrc), 2);
      tracking(ctx, 'MARK, GUDITH & KLOCKE · CHI 2008 · UC IRVINE', 104, 1268, {
        size: 19, font: F.mono6, track: 3, color: 'rgba(20,17,16,0.5)',
      });
      ctx.restore();
    });
  }
  const pSrc2 = A(t, c(3), 0.6);
  if (pSrc2 > 0.004) {
    plane(ctx, cam, 0.15, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pSrc2);
      tracking(ctx, 'KANTOR NYATA · SATU MINGGU KERJA', 104, 1314, {
        size: 19, font: F.mono6, track: 3, color: 'rgba(20,17,16,0.36)',
      });
      ctx.restore();
    });
  }

  // the plot's own annotation, pinned in the corner of the sheet
  const pNote = A(t, c(3) + 0.3, 0.5);
  if (pNote > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pNote) * 0.8;
    const bx = 940;
    const by = 1370;
    ctx.strokeStyle = 'rgba(20,17,16,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, by + 30);
    ctx.lineTo(bx + 300, by + 30);
    ctx.stroke();
    tracking(ctx, 'BUKAN KIASAN', bx, by + 78, {
      size: 22, font: F.mono6, track: 5, color: RED,
    });
    ctx.restore();
  }
}

export default { draw: drawScene };
