import { W, H, txt, rr, fillRR, measure, tracking, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { K, ease, cue, sheet } from './_kertas.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Ep22 kit — "instrument board".
//
// Same paper as the last episode, but the objects on it are instruments: a
// phone that behaves like a device (it lights, it buzzes, it steals), ruled
// scales, a day ring, a receipt. Cobalt is the screen; vermilion is the cost.
// ─────────────────────────────────────────────────────────────────────────────

export const BLUE = K.blue;
export const RED = K.red;
export const INK = K.ink;

/**
 * Beat times that survive a missing alignment: with a VO they come from the
 * caption cards, without one they fall back to the storyboard's own rhythm so
 * stills and previews can be rendered before the voice exists.
 */
export function mkCue(scene, fb) {
  return (i) => {
    const card = scene && scene.captions && scene.captions[i];
    if (card && typeof card.from === 'number') return card.from;
    return fb[i] ?? 0;
  };
}

/* ───────────────────────────── the device ───────────────────────────────── */

/** a phone drawn as a printed object: ink body, cobalt glass, one glare */
export function phone(ctx, cx, cy, w, h, o = {}) {
  const {
    a = 1, rot = 0, screen = BLUE, glare = 0.5, face = K.card,
    lit = 1, shadow = true, rim = 0.5,
  } = o;
  if (a <= 0.004) return;
  const r = w * 0.14;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  if (shadow) {
    ctx.save();
    ctx.fillStyle = 'rgba(20,17,16,0.20)';
    rr(ctx, -w / 2 + 10, -h / 2 + 22, w, h, r);
    ctx.fill();
    ctx.restore();
  }

  // body
  ctx.fillStyle = K.ink;
  rr(ctx, -w / 2, -h / 2, w, h, r);
  ctx.fill();

  // glass
  const iw = w - 22;
  const ih = h - 22;
  ctx.save();
  ctx.beginPath();
  rr(ctx, -iw / 2, -ih / 2, iw, ih, r * 0.86);
  ctx.clip();
  ctx.fillStyle = K.ink;
  ctx.fillRect(-iw / 2, -ih / 2, iw, ih);
  if (lit > 0.004) {
    ctx.globalAlpha *= lit;
    ctx.fillStyle = screen;
    ctx.fillRect(-iw / 2, -ih / 2, iw, ih);
    // the light the screen throws on the paper
    const g = ctx.createLinearGradient(0, -ih / 2, 0, -ih / 2 + ih * 0.5);
    g.addColorStop(0, 'rgba(255,255,255,0.28)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-iw / 2, -ih / 2, iw, ih * 0.5);
    if (glare > 0.004) {
      ctx.globalAlpha = glare * lit;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-iw / 2, ih * 0.16);
      ctx.lineTo(-iw / 2 + iw * 0.9, -ih / 2);
      ctx.lineTo(-iw / 2 + iw, -ih / 2);
      ctx.lineTo(-iw / 2 + iw * 0.36, ih * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.fillStyle = face;
    ctx.fillRect(-iw / 2, -ih / 2, iw, ih);
  }
  ctx.restore();

  // rim light and glass edge
  ctx.strokeStyle = `rgba(255,253,246,${0.5 * rim})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  rr(ctx, -w / 2 + 3, -h / 2 + 3, w - 6, h - 6, r - 2);
  ctx.stroke();

  // notch + home bar
  ctx.fillStyle = 'rgba(255,253,246,0.5)';
  rr(ctx, -w * 0.16, -h / 2 + 14, w * 0.32, 12, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,253,246,0.35)';
  rr(ctx, -w * 0.2, h / 2 - 26, w * 0.4, 8, 4);
  ctx.fill();
  ctx.restore();
}

/** notification card that lands like an object */
export function notif(ctx, x, y, w, o = {}) {
  const {
    a = 1, h = 132, hue = BLUE, dot = RED, glyph = 1, t = 0,
  } = o;
  if (a <= 0.004) return;
  const r = 16;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(20,17,16,0.22)';
  rr(ctx, x + 8, y + 16, w, h, r);
  ctx.fill();
  ctx.fillStyle = K.card;
  rr(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,17,16,0.18)';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, r);
  ctx.stroke();

  // app mark
  const s = 62;
  ctx.fillStyle = hue;
  rr(ctx, x + 26, y + (h - s) / 2, s, s, 14);
  ctx.fill();
  // glyph: three bars, a chat bubble or a play triangle
  ctx.fillStyle = 'rgba(255,253,246,0.92)';
  if (glyph === 0) {
    for (let i = 0; i < 3; i++) ctx.fillRect(x + 26 + 14, y + (h - s) / 2 + 16 + i * 12, 34, 5);
  } else if (glyph === 1) {
    rr(ctx, x + 26 + 14, y + (h - s) / 2 + 16, 34, 24, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 26 + 22, y + (h - s) / 2 + 40);
    ctx.lineTo(x + 26 + 22, y + (h - s) / 2 + 48);
    ctx.lineTo(x + 26 + 32, y + (h - s) / 2 + 40);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + 26 + 20, y + (h - s) / 2 + 16);
    ctx.lineTo(x + 26 + 20, y + (h - s) / 2 + 46);
    ctx.lineTo(x + 26 + 44, y + (h - s) / 2 + 31);
    ctx.closePath();
    ctx.fill();
  }

  // two lines of "copy", then the time
  ctx.fillStyle = 'rgba(20,17,16,0.78)';
  rr(ctx, x + 108, y + 34, w * 0.42, 12, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(20,17,16,0.36)';
  rr(ctx, x + 108, y + 60, w * 0.62, 10, 5);
  ctx.fill();
  rr(ctx, x + 108, y + 80, w * 0.34, 10, 5);
  ctx.fill();

  // unread dot
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(x + w - 34, y + 34, 9 + Math.sin(t * 6) * 1.2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** a rounded app tile with a printed glyph */
export function appTile(ctx, x, y, s, o = {}) {
  const { a = 1, hue = BLUE, glyph = 0, label = null, dim = 0 } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = hue;
  rr(ctx, x, y, s, s, s * 0.26);
  ctx.fill();
  if (dim) {
    ctx.fillStyle = `rgba(20,17,16,${dim})`;
    rr(ctx, x, y, s, s, s * 0.26);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,253,246,0.94)';
  const c = x + s / 2;
  const m = y + s / 2;
  if (glyph === 0) {
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(c - s * 0.24, m - s * 0.2 + i * s * 0.16, s * 0.48, s * 0.07);
    }
  } else if (glyph === 1) {
    rr(ctx, c - s * 0.24, m - s * 0.22, s * 0.48, s * 0.3, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(c - s * 0.12, m + s * 0.08);
    ctx.lineTo(c - s * 0.12, m + s * 0.24);
    ctx.lineTo(c + s * 0.02, m + s * 0.08);
    ctx.closePath();
    ctx.fill();
  } else if (glyph === 2) {
    ctx.beginPath();
    ctx.moveTo(c - s * 0.14, m - s * 0.24);
    ctx.lineTo(c - s * 0.14, m + s * 0.24);
    ctx.lineTo(c + s * 0.24, m);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(c, m, s * 0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = hue;
    ctx.beginPath();
    ctx.arc(c, m, s * 0.09, 0, TAU);
    ctx.fill();
  }
  if (label) {
    tracking(ctx, label, c, y + s + 26, {
      size: 17, font: F.mono6, track: 2, color: 'rgba(20,17,16,0.42)', align: 'center',
    });
  }
  ctx.restore();
}

/* ───────────────────────────── instruments ──────────────────────────────── */

/** ruled scale with ticks and optional labels */
export function ruler(ctx, x0, x1, y, o = {}) {
  const {
    a = 1, n = 12, lw = 2.2, color = 'rgba(20,17,16,0.45)', len = 14,
    label = null, labelEvery = 0, p = 1, up = false,
  } = o;
  if (a <= 0.004 || p <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.fillRect(x0, y - lw / 2, (x1 - x0) * clamp(p), lw);
  for (let i = 0; i <= n; i++) {
    const x = lerp(x0, x1, i / n);
    if (x > x0 + (x1 - x0) * p) break;
    const big = labelEvery && i % labelEvery === 0;
    ctx.fillStyle = color;
    ctx.fillRect(x - 1, up ? y - (big ? len * 1.5 : len) : y, 2, big ? len * 1.5 : len);
    if (big && label) {
      tracking(ctx, label(i), x, up ? y - len * 1.5 - 12 : y + len + 26, {
        size: 16, font: F.mono6, track: 1, color: 'rgba(20,17,16,0.45)', align: 'center',
      });
    }
  }
  ctx.restore();
}

/** the day as a ring: midnight at the top, the day running clockwise */
export function ringDay(ctx, cx, cy, r, o = {}) {
  const {
    a = 1, arcs = [], marks = [], labels = [], lw = 26, track = 'rgba(20,17,16,0.10)',
  } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = track;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  arcs.forEach((arc) => {
    if (arc.p <= 0.002) return;
    ctx.strokeStyle = arc.color || BLUE;
    ctx.lineWidth = arc.lw || lw;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2 + TAU * arc.from, -Math.PI / 2 + TAU * lerp(arc.from, arc.to, arc.p));
    ctx.stroke();
  });
  for (let i = 0; i < 24; i++) {
    const ang = -Math.PI / 2 + (i / 24) * TAU;
    const big = i % 6 === 0;
    ctx.strokeStyle = 'rgba(20,17,16,0.32)';
    ctx.lineWidth = big ? 3 : 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * (r + lw * 0.62), cy + Math.sin(ang) * (r + lw * 0.62));
    ctx.lineTo(cx + Math.cos(ang) * (r + lw * 0.62 + (big ? 18 : 10)),
      cy + Math.sin(ang) * (r + lw * 0.62 + (big ? 18 : 10)));
    ctx.stroke();
  }
  marks.forEach((m) => {
    const ang = -Math.PI / 2 + TAU * m.at;
    ctx.fillStyle = m.color || RED;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, m.r || 8, 0, TAU);
    ctx.fill();
  });
  labels.forEach((l) => {
    const ang = -Math.PI / 2 + TAU * l.at;
    tracking(ctx, l.text, cx + Math.cos(ang) * (r + 78), cy + Math.sin(ang) * (r + 78) + 6, {
      size: l.size || 20, font: F.mono6, track: 2, color: l.color || 'rgba(20,17,16,0.55)',
      align: 'center',
    });
  });
  ctx.restore();
}

/** a cabinet with one drawer pulled out — where the phone goes */
export function drawer(ctx, x, y, w, h, o = {}) {
  const { a = 1, open = 0, color = 'rgba(20,17,16,0.55)', fill = K.card } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // carcass
  ctx.fillStyle = fill;
  rr(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  rr(ctx, x, y, w, h, 6);
  ctx.stroke();
  // the opening, and the drawer sliding out of it
  const dh = h * 0.22;
  const dy = y + h * 0.44;
  ctx.fillStyle = 'rgba(20,17,16,0.10)';
  ctx.fillRect(x + 8, dy, w - 16, dh);
  ctx.save();
  ctx.translate(0, open * dh * 1.5);
  ctx.fillStyle = fill;
  rr(ctx, x + 8, dy, w - 16, dh, 3);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.4;
  rr(ctx, x + 8, dy, w - 16, dh, 3);
  ctx.stroke();
  ctx.fillStyle = color;
  rr(ctx, x + w / 2 - 46, dy + dh / 2 - 4, 92, 8, 4);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** a small printed pill */
export function chip(ctx, s, x, y, o = {}) {
  const {
    a = 1, color = K.ink, bg = null, size = 20, align = 'left', track = 4, pad = 14,
  } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const w = measure(ctx, s, size, F.mono6, track);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  if (bg) {
    ctx.fillStyle = bg;
    fillRR(ctx, x0 - pad, y - size * 0.95, w + pad * 2, size * 1.8, size * 0.9);
  }
  tracking(ctx, s, x0, y, { size, font: F.mono6, track, color });
  ctx.restore();
}

/** a progress bar that fills from the left, with a printed head */
export function bar(ctx, x, y, w, h, p, o = {}) {
  const { a = 1, color = INK, track = 'rgba(20,17,16,0.12)', head = true } = o;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = track;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * clamp(p), h);
  if (head && p > 0.01) {
    ctx.fillStyle = color;
    ctx.fillRect(x + w * clamp(p) - 3, y - 8, 6, h + 16);
  }
  ctx.restore();
}

export { K, sheet, ease, cue };

/** the camera every scene in this episode is shot with: one slow push, a drift */
export const shotCam = (t, amp = 1) => ({
  dx: Math.sin(t * 0.24) * 13 * amp,
  dy: Math.sin(t * 0.19 + 1.2) * 9 * amp,
  zoom: 0.055 * (1 - Math.exp(-t / 8)) * amp,
});
