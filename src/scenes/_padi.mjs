/**
 * Episode 9 art kit — "Negeri · Padi".
 *
 * A rice field is a grid of water and green, seen from a low angle at dawn or
 * from the air at noon. So the kit is: a perspective plot grid that can hold
 * water or grain, a rice plant that can be young or ripe, a mill, and cracked
 * earth for the year the rain did not come.
 */
import { W, H, txt, hexA, fillRR, strokeRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';

export const P = {
  ink: '#0E1410',
  ink2: '#18211A',
  night: '#0A1210',
  gold: '#D9A93F',
  gold2: '#B07C24',
  young: '#5F8F45',
  young2: '#3E6B32',
  young3: '#8FB35A',
  ripe: '#C9A94E',
  ripe2: '#9C7B2E',
  water: '#7FA6A0',
  water2: '#3F6A6A',
  mud: '#5C4A33',
  mud2: '#3E3122',
  dust: '#CBB48C',
  paper: '#F3ECDC',
  bone: '#FBF6EA',
  rust: '#B4472C',
};

export const PA = {
  out: (t) => EASE.outCubic(clamp(t)),
  inOut: (t) => EASE.inOutQuad(clamp(t)),
};

const mixCol = (a, b, k) => {
  const p = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const f = (x, y) => Math.round(lerp(x, y, clamp(k))).toString(16).padStart(2, '0');
  return `#${f(r1, r2)}${f(g1, g2)}${f(b1, b2)}`;
};

/* --------------------------------- plots --------------------------------- */

export function plotCells({ x0 = -160, x1 = W + 160, y0 = 700, y1 = 1560, rows = 7, cols = 8, growth = 1.5, widthGrowth = 0.5 } = {}) {
  const raw = Array.from({ length: rows }, (_, i) => Math.pow(growth, i));
  const sum = raw.reduce((a, b) => a + b, 0);
  const hs = raw.map((v) => (v / sum) * (y1 - y0));
  const cells = [];
  const cx = (x0 + x1) / 2;
  let y = y0;
  for (let r = 0; r < rows; r++) {
    const scale = 1 + (r / Math.max(1, rows - 1)) * widthGrowth;
    const cw = ((x1 - x0) / cols) * scale;
    const span = cw * cols;
    const xs = cx - span / 2;
    for (let c = 0; c < cols; c++) {
      cells.push({ x: xs + c * cw, y, w: cw, h: hs[r], row: r, col: c, depth: r / Math.max(1, rows - 1), seed: r * 37 + c * 11 + 7 });
    }
    y += hs[r];
  }
  return cells;
}

/**
 * Paddy plots from above: standing water, young green, or ripe gold.
 * `mature` 0..1 blends green → gold; `water` 0..1 how much mirror the pan holds.
 */
export function sawah(ctx, {
  x0 = -160, x1 = W + 160, y0 = 700, y1 = 1620, rows = 7, cols = 8,
  seed = 5, t = 0, mature = 0, water = 0.6, a = 1, bund = 0.06, haze = '#B9AE8E',
} = {}) {
  const cells = plotCells({ x0, x1, y0, y1, rows, cols });
  const r = rng(seed * 17 + 3);
  const span = y1 - y0;
  ctx.save();
  ctx.globalAlpha *= a;

  // the earth between the plots
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, mixCol(P.mud2, haze, 0.35)], [0.45, P.mud], [1, mixCol(P.mud, P.young2, 0.3)]]);
  ctx.fillRect(x0 - 60, y0 - 40, x1 - x0 + 120, y1 - y0 + 80);

  for (const cell of cells) {
    const n = r();
    const gx = cell.w * bund;
    const gy = cell.h * bund;
    const x = cell.x + gx;
    const y = cell.y + gy;
    const w = cell.w - gx * 2;
    const h = cell.h - gy * 2;
    // a few pans are further along than the rest
    const m = clamp(mature * (0.82 + 0.36 * n) + (n > 0.88 ? 0.75 : 0));
    const far = 1 - cell.depth; // 1 at the horizon, 0 in the foreground

    // plot floor, hazier the further back it sits
    let base = m > 0.5 ? mixCol(P.ripe2, P.ripe, (m - 0.5) * 2) : mixCol(P.young2, P.young, m * 2);
    // each pan is at a slightly different stage: some flooded, some ripening
    base = mixCol(base, n > 0.55 ? '#A9C87C' : '#2A4526', Math.abs(n - 0.5) * 0.45);
    const top = mixCol(base, '#DFF0E6', 0.12 + far * 0.2);
    const bot = mixCol(base, '#20301F', 0.10);
    ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, top], [0.55, base], [1, bot]]);
    ctx.fillRect(x, y, w, h);

    // standing water: the sky lying flat in the pan
    if (water > 0.02) {
      ctx.save();
      ctx.globalAlpha = a * clamp(water) * 0.26 * (0.7 + n * 0.6);
      ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [
        [0, hexA('#DFF0F0', 0.9)],
        [0.5, hexA('#CBE4E6', 0.55)],
        [1, hexA('#7FA9AC', 0.0)],
      ]);
      ctx.fillRect(x, y, w, h);
      // a couple of faint glints, so it reads as water and not glass
      ctx.strokeStyle = hexA('#F4FBFA', 0.16);
      ctx.lineWidth = Math.max(1, h * 0.006);
      for (let k = 0; k < 2; k++) {
        const gx2 = x + w * (0.24 + 0.34 * k + 0.1 * n);
        ctx.beginPath();
        ctx.moveTo(gx2, y + h * 0.2);
        ctx.lineTo(gx2 + w * 0.008, y + h * (0.62 + 0.2 * n));
        ctx.stroke();
      }
      ctx.restore();
    }

    // planting rows, faint: the lines the seedlings were set on
    if (water < 0.75) {
      const rowsN = Math.max(3, Math.round(h / 16));
      ctx.strokeStyle = hexA(m > 0.5 ? '#8A6A28' : '#2F4F2A', 0.22);
      ctx.lineWidth = Math.max(1, h * 0.01);
      for (let i = 1; i < rowsN; i++) {
        const yy = y + (h * i) / rowsN;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.05, yy);
        ctx.lineTo(x + w * 0.95, yy);
        ctx.stroke();
      }
    }

    // galengan: one thin mud ridge under each plot, not a shelf edge
    const bundCol = mixCol(P.mud, '#C8B48B', 0.34 - far * 0.14);
    ctx.fillStyle = hexA(mixCol(bundCol, haze, far * 0.42), 0.9);
    ctx.fillRect(x, y + h, w, Math.max(1.5, cell.h * bund * 0.55));
    ctx.fillRect(x + w, y, Math.max(1.5, cell.w * bund * 0.42), h);
    ctx.fillStyle = hexA('#E6D6AE', 0.2 - far * 0.08);
    ctx.fillRect(x, y + h, w, Math.max(1, cell.h * bund * 0.18));
  }

  // depth haze: the far third of the field dissolves into the horizon
  ctx.fillStyle = linGrad(ctx, 0, y0 - 20, 0, y0 + span * 0.42, [
    [0, hexA(haze, 0.42)], [1, hexA(haze, 0)],
  ]);
  ctx.fillRect(x0 - 60, y0 - 40, x1 - x0 + 120, span * 0.42 + 40);
  ctx.restore();
}

/* --------------------------------- rice ---------------------------------- */

/** One stalk: a curved stem with a seed head. */
export function stalk(ctx, x, base, h, { lean = 0.15, mature = 0.7, a = 1, sway = 0, tone = null } = {}) {
  if (a <= 0.01 || h < 2) return;
  const topX = x + lean * h + sway * h * 0.08;
  const topY = base - h;
  const col = tone || (mature > 0.5 ? mixCol(P.ripe, P.gold, mature) : mixCol(P.young3, P.young, mature * 2));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(1, h * 0.028);
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.quadraticCurveTo(x + lean * h * 0.4, base - h * 0.6, topX, topY + h * 0.16);
  ctx.stroke();
  // seed head
  if (mature > 0.25) {
    ctx.fillStyle = mature > 0.6 ? mixCol(P.gold, '#F2D98A', (mature - 0.6) * 2) : P.young3;
    const gx = topX;
    const gy = topY + h * 0.12;
    for (let i = 0; i < 6; i++) {
      const u = i / 5;
      ctx.beginPath();
      ctx.ellipse(gx + lean * h * 0.1 * u, gy + u * h * 0.22, h * 0.02, h * 0.045, lean * 0.6, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** A clump of stalks for the foreground edge of frame. */
export function clump(ctx, x, base, h, { n = 9, mature = 0.7, a = 1, seed = 3, t = 0, spread = 1 } = {}) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const dx = (r() - 0.5) * h * 0.42 * spread;
    const hh = h * (0.7 + r() * 0.5);
    stalk(ctx, x + dx, base + (r() - 0.5) * h * 0.04, hh, {
      lean: (r() - 0.5) * 0.35,
      mature,
      a: a * (0.75 + r() * 0.25),
      sway: Math.sin(t * 1.2 + i) * (0.6 + r() * 0.6),
    });
  }
}

/** Out-of-focus rice at the frame edge: fat, dark, no seed heads. */
export function blades(ctx, x, base, h, { n = 6, a = 0.5, seed = 3, t = 0, tone = '#2E4A2A', spread = 1, lean = 0 } = {}) {
  if (a <= 0.01) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const dx = (r() - 0.5) * h * 0.34 * spread;
    const hh = h * (0.6 + r() * 0.6);
    const bend = (r() - 0.5) * 0.5 + lean + Math.sin(t * 1.1 + i * 1.7) * 0.06;
    const bx = x + dx;
    const tipX = bx + bend * hh * 0.55;
    const tipY = base - hh;
    const w0 = hh * (0.028 + r() * 0.016);
    ctx.beginPath();
    ctx.moveTo(bx - w0, base + hh * 0.06);
    ctx.quadraticCurveTo(bx + bend * hh * 0.12 - w0 * 0.5, base - hh * 0.55, tipX, tipY);
    ctx.quadraticCurveTo(bx + bend * hh * 0.12 + w0 * 0.5, base - hh * 0.55, bx + w0, base + hh * 0.06);
    ctx.closePath();
    const g = linGrad(ctx, bx, tipY, bx, base, [[0, mixCol(tone, '#8FB35A', 0.35)], [1, tone]]);
    ctx.fillStyle = g;
    ctx.fill();
  }
  ctx.restore();
}

/** A rice sack: a bag, not a pot. Slack shoulders, tied neck, stencilled band. */
export function riceSack(ctx, x, y, w, h, { a = 1, tone = '#CBB188', stripe = P.rust, seed = 3 } = {}) {
  if (a <= 0.01) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  // contact shadow
  ctx.fillStyle = radGrad(ctx, x + w / 2, y + h, 4, w * 0.7, [[0, 'rgba(20,14,8,0.42)'], [1, 'rgba(20,14,8,0)']]);
  ctx.fillRect(x - w * 0.3, y + h - 8, w * 1.6, 20);

  // body: gathered at the neck, slumping wider as it settles
  const g = linGrad(ctx, x, 0, x + w, 0, [
    [0, mixCol(tone, '#FFFFFF', 0.24)], [0.42, tone], [1, mixCol(tone, '#2E2318', 0.42)],
  ]);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.36, y + h * 0.05);
  ctx.quadraticCurveTo(x + w * 0.14, y + h * 0.2, x + w * 0.06, y + h * 0.55);
  ctx.quadraticCurveTo(x - w * 0.01, y + h * 0.86, x + w * 0.12, y + h * 0.985);
  ctx.quadraticCurveTo(x + w * 0.5, y + h * 1.03, x + w * 0.88, y + h * 0.985);
  ctx.quadraticCurveTo(x + w * 1.01, y + h * 0.86, x + w * 0.94, y + h * 0.55);
  ctx.quadraticCurveTo(x + w * 0.86, y + h * 0.2, x + w * 0.64, y + h * 0.05);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  // creases
  ctx.strokeStyle = `rgba(60,44,28,${0.22 - a * 0.05})`;
  ctx.lineWidth = Math.max(1, w * 0.012);
  for (let i = 0; i < 3; i++) {
    const cx2 = x + w * (0.3 + i * 0.2 + (r() - 0.5) * 0.05);
    ctx.beginPath();
    ctx.moveTo(cx2, y + h * 0.28);
    ctx.quadraticCurveTo(cx2 + (r() - 0.5) * w * 0.08, y + h * 0.62, cx2 + (r() - 0.5) * w * 0.1, y + h * 0.96);
    ctx.stroke();
  }

  // the tied neck
  ctx.fillStyle = mixCol(tone, '#241A10', 0.5);
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 0.035, w * 0.16, h * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexA('#E8DCC2', 0.5);
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 0.012, w * 0.12, h * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();

  // printed band
  ctx.fillStyle = hexA(stripe, 0.72);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.07, y + h * 0.44);
  ctx.lineTo(x + w * 0.93, y + h * 0.44);
  ctx.lineTo(x + w * 0.9, y + h * 0.55);
  ctx.lineTo(x + w * 0.1, y + h * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ---------------------------------- mill --------------------------------- */

export function mill(ctx, x, y, w, h, { a = 1, t = 0 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // silo
  const sw = w * 0.34;
  const sg = linGrad(ctx, x, 0, x + sw, 0, [[0, '#D8D2C0'], [0.55, '#B4AE9C'], [1, '#8C8676']]);
  fillRR(ctx, x, y - h * 1.1, sw, h * 1.1, sw * 0.18, sg);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x + sw * 0.16, y - h * 1.05, sw * 0.1, h * 0.95);
  // body
  const bg = linGrad(ctx, x, y, x, y + h * 0.5, [[0, '#A9A292'], [1, '#7A7466']]);
  ctx.fillStyle = bg;
  ctx.fillRect(x + sw * 0.6, y - h * 0.62, w - sw * 0.6, h * 0.62);
  // roof
  ctx.fillStyle = '#8B6A44';
  ctx.beginPath();
  ctx.moveTo(x + sw * 0.5, y - h * 0.62);
  ctx.lineTo(x + sw * 0.6 + (w - sw * 0.6) / 2, y - h * 0.78);
  ctx.lineTo(x + w, y - h * 0.62);
  ctx.closePath();
  ctx.fill();
  // windows
  ctx.fillStyle = 'rgba(24,20,14,0.55)';
  for (let i = 0; i < 3; i++) ctx.fillRect(x + sw * 0.8 + i * (w * 0.16), y - h * 0.46, w * 0.1, h * 0.12);
  // conveyor
  ctx.strokeStyle = '#5A5348';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.3, y);
  ctx.lineTo(x + sw * 0.7, y - h * 0.3);
  ctx.stroke();
  ctx.restore();
}

/* -------------------------------- drought -------------------------------- */

/** Cracked, dry paddy floor: a web of pale fissures on dark earth. */
export function cracked(ctx, x0, y0, x1, y1, { a = 1, seed = 9, t = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const r = rng(seed);
  const w = x1 - x0;
  const h = y1 - y0;
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, '#B49B72'], [0.5, '#9E8760'], [1, '#7C6947']]);
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = 'rgba(58,44,28,0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 46; i++) {
    let px = x0 + r() * w;
    let py = y0 + r() * h;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let k = 0; k < 4; k++) {
      px += (r() - 0.5) * 160;
      py += (r() - 0.35) * 90;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  // dust haze
  ctx.fillStyle = radGrad(ctx, x0 + w * 0.6, y0 + h * 0.2, 20, w * 0.7, [[0, 'rgba(226,206,168,0.35)'], [1, 'rgba(226,206,168,0)']]);
  ctx.fillRect(x0, y0, w, h);
  ctx.restore();
}
