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

/* ========================================================================= *
 * v2 — the same episode, built as objects.
 *
 * The first pass was a data page: flat panels on one ink plate. The reference
 * film (CPI) works because every scene is a *place* with a light source and a
 * hero object that could be photographed. These are the rooms and the props
 * that make that possible without importing a single asset.
 * ========================================================================= */

/** Night wall: panelled, lit from above, falling to black at the edges. */
export function nightWall(ctx, {
  top = '#0A111C', mid = '#070C14', bot = '#04070C',
  spotX = W * 0.5, spotY = 420, spotA = 0.16, spotColor = '#F5B23C', panels = 5, a = 1,
} = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = linGrad(ctx, 0, -200, 0, H + 200, [[0, top], [0.45, mid], [1, bot]]);
  ctx.fillRect(-240, -240, W + 480, H + 480);

  // wall panels: vertical seams, brighter where the light lands
  for (let i = 0; i <= panels; i++) {
    const x = (W / panels) * i;
    ctx.fillStyle = 'rgba(190,215,240,0.05)';
    ctx.fillRect(x, -200, 1.5, H + 400);
  }
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 520, [[0, 'rgba(255,255,255,0.05)'], [1, 'rgba(255,255,255,0)']]);
  ctx.fillRect(-100, -100, W + 200, 620);

  // the light itself: one soft pool, no visible fixture
  const g = radGrad(ctx, spotX, spotY, 0, 760, [
    [0, hexA(spotColor, spotA)], [0.45, hexA(spotColor, spotA * 0.22)], [1, hexA(spotColor, 0)],
  ]);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.restore();
  ctx.restore();
}

/** A cone of light from above the frame, the way a stage is lit. */
export function lightCone(ctx, x, y0, y1, half0, half1, { color = '#FFD9A0', a = 0.10 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = linGrad(ctx, 0, y0, 0, y1, [[0, hexA(color, a)], [0.65, hexA(color, a * 0.4)], [1, hexA(color, 0)]]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - half0, y0);
  ctx.lineTo(x + half0, y0);
  ctx.lineTo(x + half1, y1);
  ctx.lineTo(x - half1, y1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Cabinet housing for the fare board: bevel, recess, screws, glass glare. */
export function boardHousing(ctx, x, y, w, h, { a = 1, r = 18, fill = '#0E1621' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // body + drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 22;
  fillRR(ctx, x, y, w, h, r, fill);
  ctx.restore();
  // vertical sheen
  ctx.save();
  ctx.beginPath();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [
    [0, 'rgba(210,230,250,0.12)'], [0.18, 'rgba(210,230,250,0.02)'],
    [0.8, 'rgba(0,0,0,0.10)'], [1, 'rgba(0,0,0,0.34)'],
  ]);
  ctx.fillRect(x, y, w, h);
  // glass glare: one diagonal streak, the detail that reads as a photograph
  ctx.globalCompositeOperation = 'lighter';
  const gl = linGrad(ctx, x + w * 0.1, y, x + w * 0.55, y + h * 0.6, [
    [0, 'rgba(255,255,255,0.055)'], [0.5, 'rgba(255,255,255,0.02)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.06, y);
  ctx.lineTo(x + w * 0.4, y);
  ctx.lineTo(x + w * 0.18, y + h);
  ctx.lineTo(x - w * 0.1, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // bevel + inner recess line
  strokeRR(ctx, x, y, w, h, r, 'rgba(214,232,250,0.16)', 2);
  strokeRR(ctx, x + 12, y + 12, w - 24, h - 24, r - 8, 'rgba(0,0,0,0.55)', 3);
  strokeRR(ctx, x + 14, y + 14, w - 28, h - 28, r - 9, 'rgba(214,232,250,0.07)', 1.4);
  // screws
  [[x + 30, y + 30], [x + w - 30, y + 30], [x + 30, y + h - 30], [x + w - 30, y + h - 30]].forEach(([sx, sy]) => {
    const sg = radGrad(ctx, sx - 2, sy - 2, 0, 10, [[0, 'rgba(220,235,250,0.42)'], [1, 'rgba(90,110,130,0.12)']]);
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, TAU);
    ctx.fillStyle = sg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy - 2.4);
    ctx.lineTo(sx + 4, sy + 2.4);
    ctx.stroke();
  });
  ctx.restore();
}

/** A printed label engraved on the housing. */
export function engraved(ctx, s, x, y, { size = 22, color = 'rgba(226,238,250,0.5)', track = 5, align = 'left', a = 1 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  tracking(ctx, s, x + 1, y + 1.5, { size, font: F.mono6, track, color: 'rgba(0,0,0,0.6)', align });
  tracking(ctx, s, x, y, { size, font: F.mono6, track, color, align });
  ctx.restore();
}

/** Paper sticker with a torn feel, slapped onto a surface at an angle. */
export function sticker(ctx, x, y, text, {
  w = 320, h = 92, rot = -0.06, a = 1, bg = '#E9603F', ink = '#FFF3E4', size = 34, sub = '',
} = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  fillRR(ctx, -w / 2, -h / 2, w, h, 6, bg);
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, 0, -h / 2, 0, h / 2, [
    [0, 'rgba(255,255,255,0.28)'], [0.5, 'rgba(255,255,255,0.02)'], [1, 'rgba(0,0,0,0.20)'],
  ]);
  fillRR(ctx, -w / 2, -h / 2, w, h, 6, ctx.fillStyle);
  txt(ctx, text, 0, sub ? -2 : size * 0.34, {
    size, font: F.head, color: ink, align: 'center', track: 1,
  });
  if (sub) {
    tracking(ctx, sub, 0, size * 0.34 + 4, {
      size: 18, font: F.mono6, track: 4, color: hexA(ink, 0.75), align: 'center',
    });
  }
  ctx.restore();
}

/** A strip of thermal paper with rows printed on it — a machine's own record. */
export function paperTape(ctx, x, y, w, rows, { a = 1, rot = 0, rowH = 62, pad = 30, head = 'LOG HARGA' } = {}) {
  if (a <= 0.002) return;
  const h = pad * 2 + 54 + rows.length * rowH;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  fillRR(ctx, 0, 0, w, h, 4, '#F0E4CC');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, h, [
    [0, 'rgba(255,255,255,0.28)'], [0.4, 'rgba(255,255,255,0)'], [1, 'rgba(118,92,54,0.20)'],
  ]);
  fillRR(ctx, 0, 0, w, h, 4, ctx.fillStyle);
  // perforation top and bottom
  for (const yy of [10, h - 10]) {
    ctx.fillStyle = 'rgba(23,19,16,0.25)';
    for (let i = 12; i < w - 12; i += 18) ctx.fillRect(i, yy, 8, 2);
  }
  tracking(ctx, head, pad, pad + 18, { size: 17, font: F.mono6, track: 4, color: 'rgba(23,19,16,0.5)' });
  rows.forEach((row, i) => {
    const ry = pad + 76 + i * rowH;
    tracking(ctx, row.time, pad, ry, { size: 20, font: F.mono6, track: 3, color: 'rgba(23,19,16,0.55)' });
    tracking(ctx, row.price, pad + 130, ry, { size: 24, font: F.mono6, track: 2, color: 'rgba(23,19,16,0.88)' });
    if (row.delta) {
      const col = row.up ? '#B23A24' : '#1E6B57';
      tracking(ctx, row.delta, w - pad, ry, { size: 22, font: F.mono6, track: 2, color: col, align: 'right' });
    }
  });
  ctx.restore();
}

/** Brass dial with a needle — the instrument version of a metric. */
export function dial(ctx, cx, cy, r, {
  value = 0.5, label = '', readout = '', unit = '', a = 1, color = '#F5B23C', sweep = 2.4, start = -Math.PI * 0.5 - 1.2,
} = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // body
  const g = radGrad(ctx, cx, cy - r * 0.3, r * 0.1, r * 1.25, [
    [0, 'rgba(40,50,64,0.98)'], [0.7, 'rgba(16,22,31,0.98)'], [1, 'rgba(8,12,18,0.98)'],
  ]);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(214,232,250,0.16)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 14, 0, TAU);
  ctx.stroke();
  // scale ticks
  for (let i = 0; i <= 24; i++) {
    const ang = start + (sweep * i) / 24;
    const major = i % 4 === 0;
    const r0 = r - (major ? 34 : 22);
    ctx.strokeStyle = major ? 'rgba(226,238,250,0.55)' : 'rgba(226,238,250,0.22)';
    ctx.lineWidth = major ? 2.4 : 1.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    ctx.lineTo(cx + Math.cos(ang) * (r - 12), cy + Math.sin(ang) * (r - 12));
    ctx.stroke();
  }
  // arc of the value
  ctx.beginPath();
  ctx.arc(cx, cy, r - 26, start, start + sweep * clamp(value), false);
  ctx.strokeStyle = hexA(color, 0.85);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();
  // needle
  const ang = start + sweep * clamp(value);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 10;
  fillRR(ctx, -8, -3, r - 40, 6, 3, '#F6F1E6');
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, TAU);
  ctx.fillStyle = '#1B2430';
  ctx.fill();
  ctx.strokeStyle = hexA(color, 0.8);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/** Hanging tag: paper, grommet, string to the rail above. */
export function hangTag(ctx, x, topY, y, { w = 210, h = 118, rot = 0, a = 1, cls = '', price = '', tone = '#F5B23C' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // string
  ctx.strokeStyle = 'rgba(236,226,206,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, topY);
  ctx.lineTo(x + w / 2 + Math.sin(rot * 8) * 4, y - h * 0.5);
  ctx.stroke();
  // tag
  ctx.translate(x + w / 2, y);
  ctx.rotate(rot);
  const hw = w / 2;
  const hh = h / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.66)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  fillRR(ctx, -hw, -hh, w, h, 8, '#F2E6CE');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, 0, -hh, 0, hh, [
    [0, 'rgba(255,255,255,0.34)'], [0.45, 'rgba(255,255,255,0)'], [1, 'rgba(116,90,52,0.20)'],
  ]);
  fillRR(ctx, -hw, -hh, w, h, 8, ctx.fillStyle);
  // grommet
  ctx.beginPath();
  ctx.arc(0, -hh + 20, 8, 0, TAU);
  ctx.fillStyle = 'rgba(23,19,16,0.5)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(23,19,16,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -hh + 20, 14, 0, TAU);
  ctx.stroke();
  // print
  tracking(ctx, `KELAS ${cls}`, 0, -hh + 62, {
    size: 18, font: F.mono6, track: 3, color: 'rgba(23,19,16,0.55)', align: 'center',
  });
  txt(ctx, price, 0, hh - 18, {
    size: 40, font: F.num, color: tone === '#F5B23C' ? '#B23A24' : 'rgba(23,19,16,0.82)', align: 'center', track: -1,
  });
  ctx.restore();
}
