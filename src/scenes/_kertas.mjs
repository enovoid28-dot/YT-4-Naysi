import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1, EASE } from '../engine/anim.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Ep17 art kit — "printed sheet".
//
// After two dark-room episodes the whole language flips: warm paper, black ink,
// cobalt and vermilion, and the grammar of print — crop marks, ruled columns,
// half-tone dot fields, offset hard shadows, rubber stamps, sticky tape. Nothing
// here is lit; everything here is printed. Motion is paper motion: type that
// rises out of a slot, cards that land with weight, numbers that roll like a
// letterpress counter.
// ─────────────────────────────────────────────────────────────────────────────

export const K = {
  paper: '#F3EBD9',
  paper2: '#E9DEC7',
  card: '#FFFDF6',
  ink: '#141110',
  ink2: '#3E362E',
  soft: 'rgba(20,17,16,0.42)',
  hair: 'rgba(20,17,16,0.16)',
  rule: 'rgba(20,17,16,0.07)',
  blue: '#1B3FD6',
  blue2: '#4A6BFF',
  red: '#D2381F',
  green: '#2C6B4F',
  tape: 'rgba(209,190,146,0.55)',
};

export const ease = {
  out: (p) => EASE.outCubic(clamp(p)),
  expo: (p) => EASE.outExpo(clamp(p)),
  inOut: (p) => EASE.inOutQuad(clamp(p)),
  smooth: (p) => EASE.smooth(clamp(p)),
  back: (p) => {
    const c = 1.3;
    const x = clamp(p) - 1;
    return 1 + x * x * ((c + 1) * x + c);
  },
};

/** real caption time for card i — every beat is cued from the take */
export const cue = (scene, i, off = 0) => {
  const c = scene && scene.captions && scene.captions[i];
  return (c ? c.from : 0) + off;
};

/** parallax layer: foreground elements travel further than the sheet does */
export function par(ctx, cam, k, fn) {
  if (!cam || (!cam.dx && !cam.dy)) { fn(); return; }
  ctx.save();
  ctx.translate((cam.dx || 0) * k, (cam.dy || 0) * k);
  if (cam.zoom) {
    ctx.translate(W / 2, H / 2);
    ctx.scale(1 + cam.zoom * k, 1 + cam.zoom * k);
    ctx.translate(-W / 2, -H / 2);
  }
  fn();
  ctx.restore();
}

/* ───────────────────────────── the sheet ─────────────────────────────────── */

/** tiny deterministic grain, so the paper is never a flat fill */
function grain(ctx, t, { n = 900, a = 0.05 } = {}) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x = noise1(i * 1.71) * W;
    const y = noise1(i * 2.33 + 7) * H;
    const s = 0.6 + noise1(i * 3.1) * 1.6;
    ctx.globalAlpha = a * (0.35 + 0.65 * noise1(i * 0.77 + 3));
    ctx.fillStyle = K.ink;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

/** a dot field, fading out in one direction — the printed half-tone */
export function halftone(ctx, x, y, w, h, { step = 18, color = K.ink, a = 0.20, dir = 'y', from = 0 } = {}) {
  ctx.save();
  ctx.fillStyle = color;
  for (let yy = 0; yy < h; yy += step) {
    const r = (dir === 'y' ? 1 - yy / h : 1 - Math.abs(yy / h - 0.5) * 2);
    for (let xx = 0; xx < w; xx += step) {
      const rr2 = (dir === 'y' ? r : 1 - xx / w) * (1 - yy / h);
      if (rr2 <= from) continue;
      ctx.globalAlpha = a * rr2;
      ctx.beginPath();
      ctx.arc(x + xx, y + yy, step * 0.17 * (0.4 + rr2), 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** the full frame: warm stock, rules, crop marks, grain */
export function sheet(ctx, t, { glowX = W * 0.5, glowY = 320, glowA = 0.35, rules = true } = {}) {
  ctx.save();
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, H, [[0, '#F8F1E2'], [0.55, K.paper], [1, K.paper2]]);
  ctx.fillRect(0, 0, W, H);

  // the light the sheet sits in
  const g = radGrad(ctx, glowX, glowY, 40, 1180, [
    [0, `rgba(255,252,240,${glowA})`],
    [0.5, 'rgba(255,250,235,0.10)'],
    [1, 'rgba(255,250,235,0)'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (rules) {
    ctx.fillStyle = K.rule;
    for (let y = 96; y < H; y += 72) ctx.fillRect(88, y, W - 176, 1);
  }
  grain(ctx, t, { n: 780, a: 0.045 });

  // corners: printed crop marks and a registration dot
  ctx.save();
  ctx.strokeStyle = 'rgba(20,17,16,0.26)';
  ctx.lineWidth = 2;
  const m = 54;
  const L = 34;
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + sy * 0);
    ctx.lineTo(x, y + sy * 0);
    ctx.moveTo(x, y);
    ctx.lineTo(x + sx * L, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + sy * L);
    ctx.stroke();
  });
  ctx.restore();

  // pressed edge shadow so the sheet reads as an object
  ctx.save();
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.34, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, 'rgba(20,17,16,0)');
  vg.addColorStop(1, 'rgba(48,32,12,0.20)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  ctx.restore();
}

/* ───────────────────────────── typography ────────────────────────────────── */

/** big ink statement, revealed by a slot that opens upward */
export function headline(ctx, lines, x, y, o = {}) {
  const {
    size = 128, font = F.display, color = K.ink, lh = 1.06, reveal = 1,
    align = 'left', track = -2, taper = 0,
  } = o;
  const arr = Array.isArray(lines) ? lines : [lines];
  const cut = 1 - clamp(reveal);
  arr.forEach((line, i) => {
    const ly = y + i * size * lh;
    ctx.save();
    // the slot: only the part of the line below `cut` is visible
    const asc = size * 0.92;
    ctx.beginPath();
    ctx.rect(0, ly - asc + cut * asc * 1.12, W, asc * 1.3);
    ctx.clip();
    txt(ctx, line, x, ly - cut * asc * 0.28, {
      size: size * (1 - taper * i), font, color, align, track,
    });
    ctx.restore();
  });
}

/** numb, tabular, tight — the number is the picture */
export function num(ctx, s, x, y, o = {}) {
  const { size = 160, color = K.ink, font = F.num, align = 'left', track = -6 } = o;
  txt(ctx, s, x, y, { size, color, font, align, track });
}

/** micro label in mono, the way a print sheet names its columns */
export function kick(ctx, s, x, y, o = {}) {
  const { size = 20, color = K.soft, align = 'left', track = 5, font = F.mono6 } = o;
  tracking(ctx, s, x, y, { size, font, track, color, align });
}

/* ───────────────────────────── paper objects ─────────────────────────────── */

/** a printed card with an offset hard shadow (riso) and an optional tape strip */
export function paperCard(ctx, x, y, w, h, o = {}) {
  const {
    rot = 0, shadow = true, fill = K.card, stroke = K.ink, lw = 2.5,
    r = 4, off = 12, tone = 'rgba(20,17,16,0.20)', tape = 0,
  } = o;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  if (shadow) {
    ctx.save();
    ctx.globalAlpha *= 1;
    ctx.fillStyle = tone;
    rr(ctx, off, off, w, h, r);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = fill;
  rr(ctx, 0, 0, w, h, r);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  rr(ctx, 0, 0, w, h, r);
  ctx.stroke();
  if (tape) {
    ctx.save();
    ctx.globalAlpha *= 0.9;
    ctx.translate(w * tape, -14);
    ctx.rotate(-0.06);
    ctx.fillStyle = K.tape;
    ctx.fillRect(-96, -20, 192, 40);
    ctx.restore();
  }
  ctx.restore();
}

export function tape(ctx, x, y, w, rot = 0, a = 0.9) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= a;
  ctx.fillStyle = K.tape;
  ctx.fillRect(-w / 2, -21, w, 42);
  ctx.globalAlpha *= 0.5;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-w / 2, -21, w, 3);
  ctx.restore();
}

/** a rubber stamp: roughened frame, ink that skipped */
export function stampInk(ctx, text, x, y, o = {}) {
  const { a = 1, rot = -0.06, color = K.red, size = 40, pad = 22, track = 4, box = true } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= a;
  const w = measure(ctx, text, size, F.mono6, track) + pad * 2;
  const h = size * 1.9;
  if (box) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
  }
  tracking(ctx, text, 0, size * 0.33, {
    size, font: F.mono6, track, color, align: 'center',
  });
  // ink dropout: a few paper-coloured flecks over the stamp
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 90; i++) {
    const px = -w / 2 + noise1(i * 1.3) * w;
    const py = -h / 2 + noise1(i * 2.1 + 5) * h;
    ctx.globalAlpha = 0.55 * a;
    ctx.fillStyle = '#000';
    ctx.fillRect(px, py, 2 + noise1(i * 0.9) * 3, 2 + noise1(i * 1.7) * 2);
  }
  ctx.restore();
}

/** a hand-drawn circle that closes with progress p */
export function circleMark(ctx, cx, cy, rx, ry, p, o = {}) {
  const { color = K.red, lw = 5, rot = -0.2 } = o;
  if (p <= 0.01) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const a0 = -2.2;
  const a1 = a0 + TAU * 1.06 * p;
  for (let a = a0; a <= a1; a += 0.12) {
    const wob = 1 + 0.035 * Math.sin(a * 3.1);
    const x = Math.cos(a) * rx * wob;
    const y = Math.sin(a) * ry * wob;
    if (a === a0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

/** a highlighter swipe behind a line of type */
export function swash(ctx, x, y, w, p, o = {}) {
  const { color = 'rgba(255,214,64,0.62)', h = 44, rot = -0.012 } = o;
  if (p <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.globalAlpha *= 0.95;
  ctx.beginPath();
  const ww = w * p;
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(ww, -h / 2 + 2);
  ctx.lineTo(ww - 3, h / 2);
  ctx.lineTo(0, h / 2 - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** ruled row: label on the left, value on the right, hairline under */
export function rowItem(ctx, x, y, w, label, value, o = {}) {
  const { a = 1, size = 30, vsize = 40, color = K.ink, rule = true, accent = null } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  kick(ctx, label, x, y, { size: size * 0.62, color: K.soft, track: 4 });
  txt(ctx, value, x + w, y, {
    size: vsize, font: F.num, color: accent || color, align: 'right', track: -1.5,
  });
  if (rule) {
    ctx.fillStyle = K.hair;
    ctx.fillRect(x, y + 18, w, 1.4);
  }
  ctx.restore();
}

/** a column of type that wipes in from the left, for the fine print */
export function wipeText(ctx, s, x, y, p, o = {}) {
  const { size = 26, font = F.mono, color = K.ink2, track = 0, align = 'left' } = o;
  if (p <= 0.01) return;
  ctx.save();
  const w = measure(ctx, s, size, font, track);
  ctx.beginPath();
  ctx.rect(x - (align === 'center' ? w / 2 : 0), y - size * 1.2, w * p, size * 1.6);
  ctx.clip();
  txt(ctx, s, x, y, { size, font, color, track, align });
  ctx.restore();
}

/** dotted leader line between two x positions, like a table of contents */
export function leader(ctx, x0, x1, y, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = K.hair;
  for (let x = x0; x < x1; x += 12) ctx.fillRect(x, y, 4, 1.6);
  ctx.restore();
}

/** arrow with a chunky printed head */
export function arrow(ctx, x0, y0, x1, y1, o = {}) {
  const { color = K.ink, lw = 5, head = 20, p = 1 } = o;
  if (p <= 0.01) return;
  const xe = lerp(x0, x1, p);
  const ye = lerp(y0, y1, p);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(xe, ye);
  ctx.stroke();
  const ang = Math.atan2(ye - y0, xe - x0);
  ctx.translate(xe, ye);
  ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-head, -head * 0.55);
  ctx.lineTo(-head * 0.72, 0);
  ctx.lineTo(-head, head * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** a big index number for the chapter, top-left of the sheet */
export function folio(ctx, index, label, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  kick(ctx, `${index} — ${label}`, 88, 116, { size: 19, color: 'rgba(20,17,16,0.45)', track: 5 });
  ctx.restore();
}
