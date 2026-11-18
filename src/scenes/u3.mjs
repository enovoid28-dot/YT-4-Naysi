import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot } from './_cetak.mjs';
import { appTile, ruler, mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, sheen, reveal } from '../engine/rig.mjs';

// 03 — EMPAT PULUH TUJUH
// A filmstrip of the day: app after app, with a playhead running along it at the
// speed the research measured. The strip is the shot; the camera tracks it.
const TILES = [
  { hue: BLUE, glyph: 1 },
  { hue: K.ink, glyph: 2 },
  { hue: RED, glyph: 0 },
  { hue: BLUE, glyph: 3 },
  { hue: K.green, glyph: 1 },
  { hue: K.ink, glyph: 0 },
  { hue: BLUE, glyph: 2 },
];

function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 3.4, 9.0]);
  const cam = shotCam(t, 1.1);

  sheet(ctx, t, { glowX: 720, glowY: 520, glowA: 0.3 });
  sheen(ctx, t, { period: 5.0, a: 0.06 });

  // ── the strip ──────────────────────────────────────────────────────────
  const size = 152;
  const gap = 34;
  const total = TILES.length * size + (TILES.length - 1) * gap;
  const sx = (W - total) / 2;
  const sy = 640;

  plane(ctx, cam, 0.6, () => {
    const pIn = A(t, c(0), 0.9, (x) => 1 - Math.pow(1 - clamp(x), 3));
    if (pIn <= 0.004) return;
    // the rail the strip sits on
    ctx.save();
    ctx.globalAlpha = clamp(pIn) * 0.5;
    ctx.fillStyle = 'rgba(20,17,16,0.25)';
    ctx.fillRect(sx - 30, sy + size + 54, (total + 60) * clamp(pIn), 2);
    ctx.restore();

    TILES.forEach((tl, i) => {
      const p = A(t, c(0) + i * 0.08, 0.55, (x) => 1 - Math.pow(1 - clamp(x), 3));
      if (p <= 0.004) return;
      const x = sx + i * (size + gap);
      const y = sy + (1 - clamp(p)) * 46;
      const passed = clamp((t - (c(1) + 0.5 + i * 0.55)) / 0.5);
      ctx.save();
      ctx.globalAlpha = clamp(p);
      appTile(ctx, x, y, size, {
        hue: tl.hue, glyph: tl.glyph, dim: 0.5 * (1 - passed),
      });
      ctx.restore();
    });
  });

  // ── the playhead ───────────────────────────────────────────────────────
  const pHead = A(t, c(1), 3.4, (x) => clamp(x));
  if (pHead > 0.002) {
    const hx = lerp(sx - 20, sx + total + 20, pHead);
    plane(ctx, cam, 1, () => {
      ghosts(ctx, { dx: -26, n: 5, spread: 1, alpha: 0.16 }, () => {
        ctx.save();
        ctx.strokeStyle = RED;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(hx, sy - 40);
        ctx.lineTo(hx, sy + size + 44);
        ctx.stroke();
        ctx.restore();
      });
      // the dot at the tip, and its echo
      ctx.save();
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(hx, sy - 46, 10, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(hx, sy - 46, 26, 0, TAU);
      ctx.fill();
      ctx.restore();
    });
  }

  // ── the ruler under the strip ──────────────────────────────────────────
  plane(ctx, cam, 0.35, () => {
    const pR = A(t, c(1) + 0.2, 0.9);
    if (pR <= 0.004) return;
    ruler(ctx, sx - 20, sx + total + 20, sy + size + 96, {
      a: clamp(pR), n: 10, p: clamp(pR), len: 16, labelEvery: 5,
      label: (i) => `${i * 5}s`, color: 'rgba(20,17,16,0.4)',
    });
  });

  // ── the number the strip proves ────────────────────────────────────────
  const pNum = A(t, c(1) + 0.1, 0.7, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pNum > 0.004) {
    plane(ctx, cam, 1.15, () => {
      roll(ctx, '47', 96, 470, { size: 236, p: pNum, track: -10 });
      fadeUp(ctx, A(t, c(1) + 0.3, 0.45), 10, () => {
        kick(ctx, 'DETIK DI SATU LAYAR', 350, 470, { size: 24, track: 6, color: RED });
      });
    });
  }

  // ── how often the office interrupts you ────────────────────────────────
  const pFreq = A(t, c(2), 0.9, (x) => 1 - Math.pow(1 - clamp(x), 2));
  if (pFreq > 0.004) {
    plane(ctx, cam, 0.5, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pFreq);
      const y = 1280;
      const x0 = 104;
      const x1 = 1336;
      // a bar of ten minutes, cut every three
      ctx.fillStyle = 'rgba(20,17,16,0.10)';
      ctx.fillRect(x0, y, x1 - x0, 46);
      for (let i = 0; i < 4; i++) {
        const x = lerp(x0, x1, (i * 3) / 10);
        const w = ((x1 - x0) / 10) * 3;
        if ((x - x0) > (x1 - x0) * clamp(pFreq)) continue;
        ctx.fillStyle = i % 2 ? 'rgba(210,56,31,0.22)' : 'rgba(210,56,31,0.5)';
        ctx.fillRect(x, y, w * clamp(pFreq * 1.4 - i * 0.1), 46);
      }
      // the cut marks
      for (let i = 0; i <= 3; i++) {
        const x = lerp(x0, x1, (i * 3) / 10);
        if ((x - x0) > (x1 - x0) * clamp(pFreq) + 2) break;
        ctx.fillStyle = RED;
        ctx.fillRect(x - 1.5, y - 16, 3, 78);
      }
      tracking(ctx, 'TIGA MENIT', x0, y + 108, {
        size: 24, font: F.mono6, track: 5, color: RED,
      });
      tracking(ctx, 'TANPA PERNAH SELESAI KEMBALI', x1, y + 108, {
        size: 19, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.42)', align: 'right',
      });
      ctx.restore();
    });
  }
}

export default { draw: drawScene };
