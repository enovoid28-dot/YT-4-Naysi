/**
 * Episode 12 art kit — "Harga" (airline pricing).
 *
 * One language for the whole episode: ink-blue plate, paper-white type,
 * sodium amber for money, mint for "cheap", ember for "it just went up".
 * Every object is a real object from the world of air travel — a fare board,
 * a seat map, a ticket stub, a fare ladder, a departure calendar — so the
 * numbers always sit on something you can recognise.
 */
import { W, H, txt, hexA, linGrad, radGrad, rr, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { clamp, lerp, EASE, TAU, noise1 } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';
import { tag, panel, barcode, ticks } from '../engine/motion.mjs';

export const P = {
  ink: '#04060B',
  ink2: '#080D16',
  ink3: '#0E1723',
  plate: '#0C141F',
  line: 'rgba(210,226,240,0.14)',
  hair: 'rgba(210,226,240,0.07)',
  bone: '#F6F1E6',
  dim: 'rgba(246,241,230,0.52)',
  faint: 'rgba(246,241,230,0.28)',
  amber: '#F5B23C',
  amberHi: '#FFD79A',
  ember: '#E9603F',
  mint: '#6FE3C0',
  cyan: '#8FC7E8',
  paper: '#EFE3CB',
  paper2: '#D9C9AA',
};

export const ease = {
  out: (p) => EASE.outCubic(clamp(p)),
  expo: (p) => EASE.outExpo(clamp(p)),
  inOut: (p) => EASE.inOutQuad(clamp(p)),
  soft: (p) => EASE.smooth(clamp(p)),
};

/* --------------------------------- plate --------------------------------- */

/**
 * The base plate: a deep, slightly cool field with one soft light behind the
 * subject and a horizon hairline. No vignette here — the film pass adds it.
 */
export function plate(ctx, { t = 0, glow = P.amber, glowX = W * 0.5, glowY = 780, glowA = 0.11, horizon = 1180, a = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const g = linGrad(ctx, 0, -200, 0, H + 200, [
    [0, '#03050A'],
    [0.38, P.ink2],
    [0.72, '#0A1220'],
    [1, '#05080E'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(-240, -240, W + 480, H + 480);

  // one soft light, the only "atmosphere" in the frame
  const rg = radGrad(ctx, glowX, glowY, 0, Math.max(W, 900) * 0.85, [
    [0, hexA(glow, glowA)],
    [0.45, hexA(glow, glowA * 0.25)],
    [1, hexA(glow, 0)],
  ]);
  ctx.fillStyle = rg;
  ctx.fillRect(-240, -240, W + 480, H + 480);

  // the horizon: a single line the composition can sit on
  const hg = linGrad(ctx, 0, horizon - 90, 0, horizon + 120, [
    [0, 'rgba(210,226,240,0)'],
    [0.5, 'rgba(210,226,240,0.05)'],
    [1, 'rgba(210,226,240,0)'],
  ]);
  ctx.fillStyle = hg;
  ctx.fillRect(0, horizon - 90, W, 210);

  // faint scan of the plate itself: two very slow bright bands
  const band = (x) => {
    const b = linGrad(ctx, x - 120, 0, x + 120, 0, [
      [0, 'rgba(220,235,250,0)'],
      [0.5, 'rgba(220,235,250,0.022)'],
      [1, 'rgba(220,235,250,0)'],
    ]);
    ctx.fillStyle = b;
    ctx.fillRect(x - 120, -200, 240, H + 400);
  };
  band(260 + Math.sin(t * 0.12) * 120);
  band(1080 + Math.sin(t * 0.09 + 2) * 90);
  ctx.restore();
}

/* ------------------------------- furniture -------------------------------- */

/** Route line: CGK ————— ✈ ————— DPS, with a slowly travelling highlight. */
export function routeLine(ctx, x, y, w, { from = 'CGK', to = 'DPS', a = 1, t = 0, color = P.cyan } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  tracking(ctx, from, x, y, { size: 30, font: F.mono6, track: 6, color: P.bone });
  tracking(ctx, to, x + w, y, { size: 30, font: F.mono6, track: 6, color: P.bone, align: 'right' });
  const x0 = x + 104;
  const x1 = x + w - 104;
  ctx.strokeStyle = hexA(color, 0.35);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, y - 10);
  ctx.lineTo(x1, y - 10);
  ctx.stroke();
  // ticks along the route
  for (let i = 0; i <= 10; i++) {
    const xx = lerp(x0, x1, i / 10);
    ctx.globalAlpha = a * (i % 5 === 0 ? 0.5 : 0.22);
    ctx.beginPath();
    ctx.moveTo(xx, y - 16);
    ctx.lineTo(xx, y - 4);
    ctx.stroke();
  }
  ctx.globalAlpha = a;
  // plane
  const pp = (t * 0.18) % 1;
  const px = lerp(x0, x1, pp);
  plane(ctx, px, y - 11, 0.5, { color: P.bone, a: 0.9 });
  ctx.restore();
}

/** Small side-view aircraft, drawn with a path so it never looks like an icon. */
export function plane(ctx, x, y, s = 1, { color = P.bone, a = 1, flip = 1 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s * flip, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-46, 2);
  ctx.lineTo(-8, -6);
  ctx.lineTo(6, -22);
  ctx.lineTo(14, -22);
  ctx.lineTo(10, -6);
  ctx.lineTo(34, -2);
  ctx.lineTo(44, -8);
  ctx.lineTo(48, -8);
  ctx.lineTo(46, 2);
  ctx.lineTo(-40, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Ticket stub: paper, perforation, barcode. Used where the object must feel real. */
export function stub(ctx, x, y, w, h, { a = 1, t = 0, ink = '#0A1018', glow = 0 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (glow) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;
  }
  fillRR(ctx, x, y, w, h, 18, P.paper);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  // micro-print text on the paper
  ctx.save();
  ctx.beginPath();
  rr(ctx, x, y, w, h, 18);
  ctx.clip();
  tracking(ctx, 'BOARDING PASS · NAYSI AIR', x + 34, y + 58, {
    size: 20, font: F.mono6, track: 4, color: hexA(ink, 0.55),
  });
  tracking(ctx, 'SEAT 17A · GATE 4 · 06:20', x + 34, y + h - 34, {
    size: 18, font: F.mono6, track: 3, color: hexA(ink, 0.45),
  });
  barcode(ctx, x + w - 300, y + h - 96, 260, 52, { color: hexA(ink, 0.8), a: 0.85, seed: 17 });
  // perforation
  ctx.strokeStyle = hexA(ink, 0.25);
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.moveTo(x + w - 350, y + 20);
  ctx.lineTo(x + w - 350, y + h - 20);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  ctx.restore();
}

/**
 * Seat map. `sold` is 0..1 (fraction of the cabin filled); seats light up in a
 * deterministic order so the same frame always shows the same cabin.
 */
export function seatMap(ctx, x, y, { cols = 6, rows = 8, cw = 62, ch = 46, gap = 16, a = 1, sold = 0, accent = P.mint, dim = 'rgba(210,226,240,0.16)' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const total = cols * rows;
  const soldCount = Math.round(sold * total);
  for (let i = 0; i < total; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const sx = x + c * (cw + gap);
    const sy = y + r * (ch + gap);
    const order = ((c * 7 + r * 13) % total) / total; // deterministic fill order
    const on = order < sold;
    if (on) {
      // sold: a filled seat with its back rest drawn in
      fillRR(ctx, sx, sy, cw, ch, 8, hexA(accent, 0.26));
      strokeRR(ctx, sx, sy, cw, ch, 8, hexA(accent, 0.72), 1.6);
      ctx.fillStyle = hexA(accent, 0.85);
      ctx.fillRect(sx + 12, sy + ch * 0.46, cw - 24, 5);
      ctx.fillStyle = hexA(accent, 0.35);
      ctx.fillRect(sx + cw * 0.32, sy + ch * 0.62, cw * 0.36, 4);
    } else {
      // still for sale: an empty outline, and nothing inside it
      ctx.save();
      ctx.setLineDash([6, 6]);
      strokeRR(ctx, sx, sy, cw, ch, 8, dim, 1.2);
      ctx.restore();
    }
  }
  // cabin outline
  const gw = cols * cw + (cols - 1) * gap;
  const gh = rows * ch + (rows - 1) * gap;
  ctx.strokeStyle = hexA(P.bone, 0.10);
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 10]);
  ctx.strokeRect(x - 22, y - 22, gw + 44, gh + 44);
  ctx.setLineDash([]);
  ctx.restore();
  return { w: gw, h: gh, soldCount };
}

/** Small stat panel: label, big value, unit — used in threes. */
export function statCard(ctx, x, y, w, h, { label, value, unit, a = 1, p = 1, color = P.bone, accent = P.amber, sparkPts = null, t = 0 } = {}) {
  if (a <= 0.002) return;
  const s = ease.out(p);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(0, (1 - s) * 34);
  panel(ctx, x, y, w, h, { a: s, fill: 'rgba(10,17,26,0.86)' });
  tag(ctx, label, x + 28, y + 56, { size: 20, track: 4, color: P.dim, ruleW: 26, a: 1 });
  readoutInline(ctx, value, unit, x + 28, y + h - 34, { color, accent });
  ctx.restore();
}

function readoutInline(ctx, value, unit, x, y, { color = P.bone, accent = P.amber, size = 62 } = {}) {
  txt(ctx, value, x, y, { size, font: F.num, color, track: -2 });
  const w = measure(ctx, value, size, F.num, -2);
  tracking(ctx, unit, x + w + 12, y, { size: 20, font: F.mono6, track: 4, color: accent });
}

/** Header line inside a scene: a small eyebrow + a rule. */
export function eyebrow(ctx, s, { x = 104, y = 250, a = 1, color = P.dim, rule = P.amber } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = hexA(rule, 0.85);
  ctx.fillRect(x, y - 30, 54, 4);
  tracking(ctx, s, x, y + 4, { size: 26, font: F.mono6, track: 5, color });
  ctx.restore();
}

export const money = (n) => group(n);

export const group = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
