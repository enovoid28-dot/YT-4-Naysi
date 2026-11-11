import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, chip } from './_kota.mjs';
import { P, sawah } from './_padi.mjs';
import { person } from './_figure.mjs';


/**
 * A housing estate seen from the same low drone as the paddy: rooftops in
 * perspective, alleys between them, a tree every so often.
 */
function estate(ctx, { x0 = 560, x1 = W + 200, y0 = 300, y1 = 1960, rows = 11, cols = 9, seed = 41, t = 0, a = 1 } = {}) {
  const raw = Array.from({ length: rows }, (_, i) => Math.pow(1.46, i));
  const sum = raw.reduce((p, q) => p + q, 0);
  const hs = raw.map((v) => (v / sum) * (y1 - y0));
  const r = rng(seed);
  const cx = (x0 + x1) / 2;
  let y = y0;

  ctx.save();
  ctx.globalAlpha *= a;

  // the ground the estate stands on: yards, lanes, gravel
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, '#3B3428'], [0.45, '#332C22'], [1, '#241F19']]);
  ctx.fillRect(x0 - 60, y0 - 40, x1 - x0 + 120, y1 - y0 + 80);

  for (let row = 0; row < rows; row++) {
    const h = hs[row];
    const d = row / (rows - 1);
    const cw = ((x1 - x0) / cols) * (0.95 + d * 0.16);
    const span = cw * cols;
    const xs = cx - span / 2;
    // the lane behind this row of roofs
    ctx.fillStyle = `rgba(120,108,86,${0.16 - d * 0.08})`;
    ctx.fillRect(x0 - 60, y + h * 0.9, x1 - x0 + 120, h * 0.1);

    for (let c = 0; c < cols; c++) {
      const bx = xs + c * cw;
      const pad = cw * (0.03 + r() * 0.04);
      const rw = cw - pad * 2;
      const rh = h * (0.5 + r() * 0.2);
      const ry = y + h * 0.08 + (h * 0.8 - rh) * r();
      const n = r();

      // shadow on the ground, falling away from the light
      ctx.fillStyle = `rgba(8,6,4,${0.34 - d * 0.12})`;
      ctx.fillRect(bx + pad + rw * 0.06, ry + rh * 0.08, rw, rh);

      if (n > 0.9) {
        // a warehouse: wide, flat, corrugated
        ctx.fillStyle = `rgb(${108 - d * 32 | 0},${108 - d * 32 | 0},${102 - d * 28 | 0})`;
        ctx.fillRect(bx + pad, ry, rw * 1.02, rh);
        ctx.strokeStyle = `rgba(30,28,24,${0.3 - d * 0.12})`;
        ctx.lineWidth = Math.max(1, h * 0.012);
        const ribs = Math.max(3, Math.round(rh / 12));
        for (let i = 1; i < ribs; i++) {
          ctx.beginPath();
          ctx.moveTo(bx + pad, ry + (rh * i) / ribs);
          ctx.lineTo(bx + pad + rw * 1.02, ry + (rh * i) / ribs);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,238,200,0.10)';
        ctx.fillRect(bx + pad, ry, rw * 1.02, Math.max(1, h * 0.012));
      } else if (n > 0.5) {
        // a tiled gable, seen from above: two slopes, ridge across the middle
        const ridge = ry + rh * 0.42;
        const warm = r();
        const lit = warm > 0.7
          ? `rgb(${128 - d * 34 | 0},${126 - d * 34 | 0},${118 - d * 30 | 0})`
          : `rgb(${168 - d * 56 | 0},${96 - d * 32 | 0},${62 - d * 20 | 0})`;
        const shade = warm > 0.7
          ? `rgb(${96 - d * 26 | 0},${94 - d * 26 | 0},${88 - d * 24 | 0})`
          : `rgb(${128 - d * 46 | 0},${68 - d * 26 | 0},${46 - d * 16 | 0})`;
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.moveTo(bx + pad, ry + rh);
        ctx.lineTo(bx + pad + rw * 0.06, ridge);
        ctx.lineTo(bx + pad + rw * 0.94, ridge);
        ctx.lineTo(bx + pad + rw, ry + rh);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = lit;
        ctx.beginPath();
        ctx.moveTo(bx + pad + rw * 0.06, ridge);
        ctx.lineTo(bx + pad + rw * 0.16, ry);
        ctx.lineTo(bx + pad + rw * 0.84, ry);
        ctx.lineTo(bx + pad + rw * 0.94, ridge);
        ctx.closePath();
        ctx.fill();
        // ridge line
        ctx.fillStyle = 'rgba(255,226,180,0.30)';
        ctx.fillRect(bx + pad + rw * 0.06, ridge - 1, rw * 0.88, Math.max(1.5, h * 0.012));
        // tile courses
        ctx.strokeStyle = `rgba(40,20,14,${0.22 - d * 0.1})`;
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
          const yy = ridge + (rh * 0.58 * i) / 5;
          ctx.beginPath();
          ctx.moveTo(bx + pad + rw * (0.06 - 0.015 * i), yy);
          ctx.lineTo(bx + pad + rw * (0.94 + 0.015 * i), yy);
          ctx.stroke();
        }
      } else {
        // a flat concrete roof with a parapet and a water tank
        ctx.fillStyle = `rgb(${126 - d * 40 | 0},${122 - d * 40 | 0},${110 - d * 36 | 0})`;
        ctx.fillRect(bx + pad, ry, rw, rh);
        ctx.strokeStyle = `rgba(24,22,18,${0.32 - d * 0.14})`;
        ctx.lineWidth = Math.max(1.5, h * 0.014);
        ctx.strokeRect(bx + pad + 1, ry + 1, rw - 2, rh - 2);
        ctx.fillStyle = `rgba(52,46,38,${0.55 - d * 0.2})`;
        ctx.fillRect(bx + pad + rw * 0.12, ry + rh * 0.14, rw * 0.36, rh * 0.3);
        ctx.fillStyle = `rgba(190,186,172,${0.7 - d * 0.3})`;
        ctx.beginPath();
        ctx.arc(bx + pad + rw * 0.72, ry + rh * 0.52, Math.min(rw, rh) * 0.13, 0, Math.PI * 2);
        ctx.fill();
      }
      // the odd tree between the houses
      if (r() < 0.14) {
        const tx = bx + pad + rw * (r() < 0.5 ? -0.1 : 1.1);
        const ty = ry + rh * 0.9;
        ctx.fillStyle = `rgba(${34 - d * 8 | 0},${54 - d * 12 | 0},${36 - d * 8 | 0},0.95)`;
        ctx.beginPath();
        ctx.ellipse(tx, ty, cw * 0.15, h * 0.11, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    y += h;
  }

  // the last warm light of the day caught on the far roofs
  ctx.fillStyle = radGrad(ctx, (x0 + x1) / 2, y0 + 60, 30, 900, [[0, 'rgba(232,190,120,0.20)'], [1, 'rgba(232,190,120,0)']]);
  ctx.fillRect(x0 - 60, y0 - 40, x1 - x0 + 120, (y1 - y0) * 0.6);
  // haze where the estate meets the horizon
  ctx.fillStyle = linGrad(ctx, 0, y0 - 30, 0, y0 + (y1 - y0) * 0.28, [[0, 'rgba(44,40,34,0.6)'], [1, 'rgba(44,40,34,0)']]);
  ctx.fillRect(x0 - 60, y0 - 40, x1 - x0 + 120, (y1 - y0) * 0.28 + 40);
  ctx.restore();
}

// 05 — LAHAN. The same drone as shot one, years later. Left: still paddy.
// Right: roofs. The line between them walks left across the frame, and one man
// stands on the last bund watching it.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, '#0C1210');

    layer(ctx, cam, 0.22, () => {
      sawah(ctx, { y0: 300, y1: 2380, rows: 12, cols: 12, seed: 41, t, mature: 0.4, water: 0.18, bund: 0.05 });
    });

    const bx = lerp(W + 140, 566, E.inOut(at(t, 0.4, 4.2)));
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, 260, W + 260 - bx, 2180);
    ctx.clip();
    layer(ctx, cam, 0.22, () => {
      estate(ctx, { y0: 300, y1: 2380, rows: 12, cols: 9, seed: 41, a: 1, t });
    });
    ctx.restore();

    // the boundary
    const bA = at(t, 0.35, 0.8);
    if (bA > 0.01) {
      ctx.save();
      ctx.globalAlpha = bA;
      ctx.strokeStyle = hexA(P.gold, 0.95);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx, 250);
      ctx.lineTo(bx, 2300);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let y = 270; y < 2300; y += 46) {
        ctx.beginPath();
        ctx.moveTo(bx - 16, y);
        ctx.lineTo(bx + 16, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = at(t, 1.1, 0.8);
    txt(ctx, 'SAWAH', 96, 232, { size: 26, font: F.mono6, color: hexA('#9FD3A0', 0.9), track: 6 });
    txt(ctx, 'PERUMAHAN & INDUSTRI', W - 96, 232, { size: 26, font: F.mono6, color: hexA('#FFC978', 0.85), track: 6, align: 'right' });
    ctx.restore();

    // the farmer on the last bund
    const mA = at(t, 1.2, 0.9);
    if (mA > 0.01) {
      ctx.save();
      ctx.fillStyle = 'rgba(14,10,6,0.4)';
      ctx.beginPath();
      ctx.ellipse(508, 1470, 78, 16, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      person(ctx, 508, 1466, 360, { pose: 'watch', facing: 1, alpha: mA, cloth: '#D2C6A6', rim: 0.7 });
    }

    // legend
    const cA = at(t, 0.8, 0.9);
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      const px = W - 700;
      const py = 1230;
      fillRR(ctx, px, py, 620, 250, 6, 'rgba(10,7,5,0.84)');
      ctx.fillStyle = hexA(P.gold, 0.9);
      ctx.fillRect(px + 30, py + 34, 42, 4);
      txt(ctx, 'ALIH FUNGSI LAHAN', px + 86, py + 42, { size: 21, font: F.mono6, color: 'rgba(251,246,234,0.7)', track: 5 });
      ctx.fillStyle = hexA('#6E9A50', 0.9);
      ctx.fillRect(px + 32, py + 84, 78, 54);
      ctx.strokeStyle = 'rgba(251,246,234,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 32, py + 84, 78, 54);
      ctx.strokeStyle = hexA(P.gold, 0.9);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + 130, py + 111);
      ctx.lineTo(px + 186, py + 111);
      ctx.moveTo(px + 172, py + 100);
      ctx.lineTo(px + 188, py + 111);
      ctx.lineTo(px + 172, py + 122);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,201,120,0.85)';
      ctx.fillRect(px + 206, py + 84, 78, 54);
      ctx.strokeRect(px + 206, py + 84, 78, 54);
      txt(ctx, 'SAWAH', px + 32, py + 178, { size: 24, font: F.mono6, color: hexA('#9FD3A0', 0.9), track: 4 });
      txt(ctx, 'BETON', px + 206, py + 178, { size: 24, font: F.mono6, color: 'rgba(255,201,120,0.9)', track: 4 });
      txt(ctx, 'harga tanah menang', px + 32, py + 214, { size: 24, font: F.body, color: 'rgba(251,246,234,0.55)' });
      ctx.restore();
    }

    const tA = at(t, 5.6, 1.0);
    if (tA > 0.01) chip(ctx, 'YANG MENANAM SEMAKIN TUA', 84, 1700, { a: tA, bg: 'rgba(10,7,5,0.86)', ink: P.bone, border: hexA(P.gold, 0.45) });

    grain(ctx, 0.045);
  },
};
