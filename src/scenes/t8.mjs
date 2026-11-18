import { W, H, txt, fillRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk } from './_kertas.mjs';
import { A, roll, fadeUp, rule, panel, bullet, hatch } from './_cetak.mjs';

// 08 — POLA
// Thirty-two nights as one grid. Each cell is a night, each bar the hours slept,
// and the dashed rule across every cell is the same six hours. The pattern is
// not a story about one bad night: it is the shape of the whole field.
const N = 32;
const HOURS = Array.from({ length: N }, (_, i) => {
  const r = noise1(i * 12.9898 + 4.1);
  const short = i % 3 !== 0;
  return short ? 4.3 + r * 1.5 : 6.6 + r * 1.3;
});

function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 720, glowY: 420, glowA: 0.3 });
  const c = (i) => cue(scene, i);

  const cols = 8;
  const rows = 4;
  const cw = 140;
  const ch = 172;
  const gx = 22;
  const gy = 22;
  const x0 = 104;
  const y0 = 402;
  const lo = 3;
  const hi = 8;
  const hOf = (h) => ((h - lo) / (hi - lo)) * (ch - 56);

  // ── the grid ───────────────────────────────────────────────────────────
  const pG = A(t, c(0), 0.5);
  if (pG > 0.004) {
    for (let i = 0; i < N; i++) {
      const p = A(t, c(0) + 0.05 + i * 0.032, 0.45, ease.out);
      if (p <= 0.004) continue;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = x0 + col * (cw + gx);
      const y = y0 + row * (ch + gy);
      const h = HOURS[i];
      const short = h < 6;

      ctx.save();
      ctx.globalAlpha *= clamp(p * 1.25);
      // cell
      ctx.fillStyle = 'rgba(255,253,246,0.85)';
      rr(ctx, x, y, cw, ch, 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,17,16,0.22)';
      ctx.lineWidth = 2;
      rr(ctx, x, y, cw, ch, 3);
      ctx.stroke();
      // the night
      const bh = hOf(h) * clamp(p);
      ctx.fillStyle = short ? K.red : K.ink;
      ctx.fillRect(x + cw / 2 - 25, y + ch - 16 - bh, 50, bh);

      // the hour, in small type at the foot of the cell
      tracking(ctx, String(Math.round(h)), x + cw / 2, y + ch + 20, {
        size: 15, font: F.mono6, track: 1,
        color: short ? K.red : 'rgba(20,17,16,0.42)', align: 'center',
      });
      ctx.restore();
    }
  }

  // the six-hour rule, struck across every row at once
  const pR = A(t, c(1), 0.8, ease.out);
  if (pR > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pR);
    const ly = y0 + ch - 16 - hOf(6);
    const xEnd = x0 + cols * (cw + gx) - gx;
    for (let row = 0; row < rows; row++) {
      const yy = ly + row * (ch + gy);
      const p = clamp(pR * 1.3 - row * 0.08);
      ctx.strokeStyle = K.red;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([10, 8]);
      ctx.globalAlpha = clamp(pR) * 0.85;
      ctx.beginPath();
      ctx.moveTo(x0 - 10, yy);
      ctx.lineTo(x0 - 10 + (xEnd - x0 + 20) * p, yy);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
    fadeUp(ctx, A(t, c(1) + 0.2, 0.45), 8, () => {
      kick(ctx, 'BATAS 6 JAM', x0, y0 - 30, { size: 20, track: 5, color: K.red });
    });
  }

  // ── what the pattern is associated with ────────────────────────────────
  const pF = A(t, c(2), 0.6);
  if (pF > 0.004) {
    const y = 1250;
    const items = ['TEKANAN DARAH TINGGI', 'DIABETES', 'BERAT BADAN NAIK'];
    ctx.save();
    ctx.globalAlpha *= clamp(pF) * 0.95;
    let x = 104;
    items.forEach((s, i) => {
      const p = A(t, c(2) + 0.05 + i * 0.12, 0.45);
      ctx.save();
      ctx.globalAlpha = clamp(pF) * clamp(p) * 0.95;
      bullet(ctx, x, y + 4, 11, 1, K.red);
      tracking(ctx, s, x + 24, y, {
        size: 21, font: F.mono6, track: 3, color: K.ink,
      });
      const w = measure(ctx, s, 21, F.mono6, 3);
      x += 24 + w + 44;
      ctx.restore();
    });
    ctx.restore();
  }

  // ── the verdict ────────────────────────────────────────────────────────
  const pV = A(t, c(3), 0.5, ease.out);
  if (pV > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pV) * 0.8;
    ctx.strokeStyle = 'rgba(20,17,16,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(104, 1310);
    ctx.lineTo(104 + (W - 208) * clamp(pV), 1310);
    ctx.stroke();
    ctx.restore();
  }

  const pS = A(t, c(4) - 0.1, 0.5, ease.back);
  if (pS > 0.004) {
    stampInk(ctx, 'HARGA', 720, 1398, {
      a: clamp(pS), size: 54, track: 10, rot: -0.045, color: K.red, pad: 34,
    });
  }
}

export default { draw: drawScene };
