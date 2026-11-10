/**
 * Episode 7 art kit — "Kota · Air".
 *
 * Everything here is drawn, not imported: a dusk sky with haze and stars, a
 * city with depth layers, water with parallax ripples and reflections, soil
 * with strata, concrete with texture. Scenes compose these and animate them.
 */
import { W, H, C, txt, hexA, rr, fillRR, strokeRR, linGrad, radGrad, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng, noise1, spring } from '../engine/anim.mjs';

export const K = {
  ink: '#080D11',
  ink2: '#0E161B',
  ink3: '#16232A',
  paper: '#F4ECDC',
  paper2: '#E8DCC4',
  concrete: '#8E887A',
  concrete2: '#B9B2A1',
  concrete3: '#5E594E',
  water: '#2C6B7A',
  waterHi: '#7FC4CE',
  waterDeep: '#0E3038',
  teal: '#1B5560',
  rust: '#C4563A',
  rust2: '#8E3623',
  amber: '#E8B43C',
  bone: '#F6EFE0',
  sand: '#C0A67C',
  sand2: '#8A7350',
};

/* ---------------------------------- time --------------------------------- */

export const E = {
  out: (t) => EASE.outCubic(clamp(t)),
  inOut: (t) => EASE.inOutQuad(clamp(t)),
  expo: (t) => EASE.outExpo(clamp(t)),
  soft: (t) => EASE.smooth(clamp(t)),
};

/** 0→1 progress of a beat that starts at `s` and lasts `d`. */
export const at = (t, s, d = 0.7, ease = E.out) => ease((t - s) / d);

/** Parallax layer: `depth` 0 = locked to frame, 1 = moves most. */
export function layer(ctx, cam, depth, fn) {
  if (!cam) return fn();
  const { p = 0, dx = 0, dy = 0, zoom = 0 } = cam;
  ctx.save();
  ctx.translate(dx * depth, dy * depth);
  const s = 1 + zoom * depth;
  if (s !== 1) {
    ctx.translate(W / 2, H / 2);
    ctx.scale(s, s);
    ctx.translate(-W / 2, -H / 2);
  }
  fn(p);
  ctx.restore();
}

/** Fill the whole frame with overscan, so the camera move never shows an edge. */
export function fillAll(ctx, style, pad = 220) {
  ctx.fillStyle = style;
  ctx.fillRect(-pad, -pad, W + pad * 2, H + pad * 2);
}

/* ---------------------------------- sky ---------------------------------- */

export function sky(ctx, { top = '#0A1218', mid = '#122630', low = '#2A4A52', horizon = 1180, sun = null, t = 0 }) {
  const g = linGrad(ctx, 0, 0, 0, horizon, [
    [0, top],
    [0.42, mid],
    [0.78, low],
    [1, low],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(-200, -200, W + 400, horizon + 204);
  // fade the sky into whatever the scene puts underneath it
  const tail = linGrad(ctx, 0, horizon - 2, 0, horizon + 260, [
    [0, low],
    [1, hexA(low, 0)],
  ]);
  ctx.fillStyle = tail;
  ctx.fillRect(0, horizon - 2, W, 262);

  if (sun) {
    const [sx, sy, r, col] = sun;
    const gl = radGrad(ctx, sx, sy, 0, r, [
      [0, hexA(col, 0.55)],
      [0.25, hexA(col, 0.22)],
      [1, hexA(col, 0)],
    ]);
    ctx.fillStyle = gl;
    ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  }
  // haze band sits just above the skyline
  const hz = linGrad(ctx, 0, horizon - 420, 0, horizon, [
    [0, 'rgba(255,190,130,0)'],
    [0.7, 'rgba(255,180,120,0.07)'],
    [1, 'rgba(255,190,130,0.16)'],
  ]);
  ctx.fillStyle = hz;
  ctx.fillRect(0, horizon - 420, W, 420);
}

export function stars(ctx, { n = 90, seed = 5, t = 0, top = 0, bottom = 900, a = 0.7 }) {
  const r = rng(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x = r() * W;
    const y = top + r() * (bottom - top);
    const s = 0.7 + r() * 1.5;
    const tw = 0.55 + 0.45 * Math.sin(t * (0.6 + r()) + i);
    ctx.globalAlpha = a * tw * (1 - y / (bottom + 400));
    ctx.fillStyle = i % 9 === 0 ? hexA(K.amber, 0.9) : '#EAF2F6';
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

/* --------------------------------- water --------------------------------- */

export function water(ctx, y, { t = 0, h = H - 900, depth = 1, color = K.water, calm = 1, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = linGrad(ctx, 0, y, 0, y + h, [
    [0, color],
    [0.35, hexA(K.waterDeep, 0.92)],
    [1, '#071C22'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 2, W, h);

  // surface specular
  ctx.strokeStyle = hexA(K.waterHi, 0.5);
  ctx.lineWidth = 3;
  for (let row = 0; row < 5; row++) {
    const yy = y + 6 + row * 26;
    ctx.globalAlpha = alpha * (0.5 - row * 0.07);
    ctx.beginPath();
    for (let x = -30; x < W + 30; x += 10) {
      const wv = Math.sin(x * 0.011 + t * (1.1 + row * 0.16) + row) * (5 - row * 0.7) * calm;
      if (x === -30) ctx.moveTo(x, yy + wv);
      else ctx.lineTo(x, yy + wv);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Vertical smear of whatever sits above the waterline, reflected back. */
export function reflection(ctx, y, { t = 0, h = 520, color = '#0A1218', alpha = 0.5, seed = 3 } = {}) {
  const r = rng(seed);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, y, W, h);
  ctx.clip();
  for (let i = 0; i < 22; i++) {
    const x = r() * W;
    const w = 26 + r() * 90;
    const hh = 60 + r() * 300;
    ctx.globalAlpha = alpha * (0.3 + r() * 0.5);
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 4, w, hh * (1 - 0.4 * (i / 22)));
  }
  // horizontal wobble bands
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = hexA('#04141A', 0.7);
  for (let b = 0; b < 14; b++) {
    const by = y + 10 + b * (h / 14);
    const amp = 3 + Math.sin(t * 1.2 + b) * 2;
    ctx.fillRect(0, by + Math.sin(t * 0.9 + b * 0.7) * 2, W, amp);
  }
  ctx.restore();
}

/* ---------------------------------- city --------------------------------- */

/** One tower with a real facade: window grid, ledges, roof furniture. */
export function tower(ctx, x, base, w, h, o = {}) {
  const {
    seed = 1, lit = 0.35, body = '#0B1216', win = '#FFC978', sill = 'rgba(255,255,255,0.06)',
    alpha = 1, rows = null, glow = 0,
  } = o;
  const r = rng(seed);
  const top = base - h;
  ctx.save();
  ctx.globalAlpha *= alpha;

  // body with a subtle vertical gradient so the mass is not flat
  ctx.fillStyle = linGrad(ctx, x, top, x + w, base, [
    [0, body],
    [0.55, body],
    [1, hexA('#000000', 0.35)],
  ]);
  ctx.fillRect(x, top, w, h);
  // right edge shade
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(x + w - Math.max(3, w * 0.14), top, Math.max(3, w * 0.14), h);

  // window grid
  const cols = Math.max(2, Math.floor(w / 26));
  const gapX = w / cols;
  const rowsN = Math.max(3, Math.floor(h / 34));
  const gapY = h / rowsN;
  for (let ix = 0; ix < cols; ix++) {
    for (let iy = 0; iy < rowsN; iy++) {
      const on = r() < lit;
      const wx = x + gapX * ix + gapX * 0.22;
      const wy = top + gapY * iy + gapY * 0.24;
      const ww = gapX * 0.56;
      const wh = gapY * 0.5;
      if (on) {
        const warm = 0.5 + r() * 0.5;
        ctx.fillStyle = hexA(win, (0.35 + warm * 0.5) * (glow ? 1 : 0.9));
        ctx.fillRect(wx, wy, ww, wh);
        if (glow) {
          ctx.fillStyle = hexA(win, 0.10);
          ctx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
        }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.045)';
        ctx.fillRect(wx, wy, ww, wh);
      }
    }
  }
  // roof line + furniture
  ctx.fillStyle = sill;
  ctx.fillRect(x, top, w, 3);
  if (r() > 0.45) {
    ctx.fillStyle = hexA(body, 1);
    ctx.fillRect(x + w * 0.18, top - 16, w * 0.28, 16);
  }
  if (r() > 0.55) {
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.62, top);
    ctx.lineTo(x + w * 0.62, top - 44 - r() * 40);
    ctx.stroke();
    // aircraft light
    ctx.fillStyle = hexA(K.rust, 0.9);
    ctx.beginPath();
    ctx.arc(x + w * 0.62, top - 46 - 4, 2.6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** A layered skyline: far haze block, mid towers, near silhouettes. */
export function skyline(ctx, { x0 = -40, x1 = W + 40, base = 1500, seed = 7, hMin = 260, hMax = 780, lit = 0.3, alpha = 1, body = '#0B1216', win = '#FFC978', gap = 10, glow = 0 } = {}) {
  const r = rng(seed);
  let x = x0;
  while (x < x1) {
    const w = 60 + r() * 96;
    const h = hMin + r() * (hMax - hMin);
    tower(ctx, x, base, w, h, {
      seed: Math.floor(r() * 1e6),
      lit: lit * (0.6 + r() * 0.8),
      body,
      win,
      alpha,
      glow,
    });
    x += w + gap * (0.4 + r() * 1.4);
  }
}

/* --------------------------------- ground -------------------------------- */

export function soil(ctx, y, { h = H - 1500, seed = 11, tone = 1 } = {}) {
  const bands = [
    ['#CDB68D', 0.00],
    ['#B79E75', 0.18],
    ['#9C8259', 0.42],
    ['#7C6644', 0.68],
    ['#5A4A33', 1.0],
  ];
  ctx.save();
  const g = linGrad(ctx, 0, y, 0, y + h, bands.map(([c, p]) => [p, tone > 0 ? c : hexA(c, 0.9)]));
  ctx.fillStyle = g;
  ctx.fillRect(0, y, W, h);

  // strata lines
  const r = rng(seed);
  for (let i = 1; i < 9; i++) {
    const yy = y + (h / 9) * i + (r() - 0.5) * 18;
    ctx.strokeStyle = 'rgba(60,44,26,0.13)';
    ctx.lineWidth = 2 + r() * 2;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, yy + Math.sin(x * 0.01 + i) * 6);
    ctx.stroke();
  }
  // pebbles
  for (let i = 0; i < 130; i++) {
    const x = r() * W;
    const yy = y + 20 + r() * (h - 40);
    const rr2 = 2 + r() * 5;
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,240,210,0.10)' : 'rgba(40,28,16,0.12)';
    ctx.beginPath();
    ctx.ellipse(x, yy, rr2 * 1.4, rr2, r() * 3, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** Warm concrete for walls and cutaways. */
export function concrete(ctx, x, y, w, h, { seed = 4, tone = '#9A9486', wet = null, a = 1, grain = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const g = linGrad(ctx, x, y, x + w, y + h, [
    [0, tone],
    [0.5, hexA('#D8D2C2', 0.9)],
    [1, hexA('#6D675B', 0.95)],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  if (grain) {
    const r = rng(seed);
    ctx.globalAlpha *= 0.5 * grain;
    for (let i = 0; i < 160; i++) {
      const px = x + r() * w;
      const py = y + r() * h;
      const s = 1 + r() * 3;
      ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(px, py, s, s);
    }
    ctx.globalAlpha /= 0.5 * grain;
  }
  // wet tide mark
  if (wet != null) {
    const wy = wet;
    const wg = linGrad(ctx, 0, wy, 0, wy + 90, [
      [0, hexA(K.teal, 0.30)],
      [1, hexA(K.teal, 0)],
    ]);
    ctx.fillStyle = wg;
    ctx.fillRect(x, wy, w, 90);
    ctx.fillStyle = hexA(K.teal, 0.35);
    ctx.fillRect(x, wy, w, 2);
  }
  ctx.restore();
}

/* --------------------------------- props --------------------------------- */

/** Brass tap, drawn clean enough to read at 400 px wide. */
export function tap(ctx, x, y, s = 1, { a = 1, drip = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  const brass = linGrad(ctx, -80, -120, 60, 60, [
    [0, '#C9BE9F'],
    [0.45, '#EFE4C7'],
    [1, '#A2957A'],
  ]);
  // wall pipe
  ctx.fillStyle = brass;
  fillRR(ctx, -240, -58, 176, 42, 14, brass);
  ctx.fillStyle = '#8B8068';
  fillRR(ctx, -244, -76, 22, 78, 8, ctx.fillStyle);
  // body
  ctx.fillStyle = brass;
  fillRR(ctx, -76, -106, 118, 152, 20, brass);
  fillRR(ctx, -54, -180, 74, 88, 16, brass);
  // handle
  ctx.fillStyle = K.rust;
  fillRR(ctx, -98, -200, 164, 26, 13, ctx.fillStyle);
  fillRR(ctx, -22, -236, 108, 42, 21, ctx.fillStyle);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  fillRR(ctx, -22, -208, 108, 8, 4, ctx.fillStyle);
  // spout
  ctx.fillStyle = brass;
  fillRR(ctx, 26, -36, 78, 48, 16, brass);
  fillRR(ctx, 64, 4, 48, 92, 14, brass);
  ctx.fillStyle = '#9C9280';
  fillRR(ctx, 54, 88, 66, 26, 10, ctx.fillStyle);
  ctx.fillStyle = 'rgba(15,12,10,0.55)';
  fillRR(ctx, 66, 110, 42, 9, 4, ctx.fillStyle);
  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  fillRR(ctx, -60, -92, 10, 120, 5, ctx.fillStyle);
  if (drip > 0) {
    ctx.fillStyle = hexA(K.waterHi, 0.9);
    ctx.beginPath();
    ctx.ellipse(87, 132 + drip * 120, 7, 11, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** A drinking glass, filled to `level` 0..1. */
export function glass(ctx, x, y, w, h, level = 0, { a = 1, t = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - 14, y + h);
    ctx.lineTo(x + 14, y + h);
    ctx.closePath();
  };
  path();
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fill();
  if (level > 0.01) {
    const lh = (h - 16) * level;
    ctx.save();
    path();
    ctx.clip();
    ctx.fillStyle = linGrad(ctx, 0, y + h - lh, 0, y + h, [
      [0, hexA(K.waterHi, 0.62)],
      [1, hexA(K.teal, 0.92)],
    ]);
    ctx.fillRect(x, y + h - 10 - lh, w, lh + 10);
    // surface
    ctx.strokeStyle = 'rgba(235,250,252,0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= w; i += 8) {
      ctx.lineTo(x + i, y + h - 10 - lh + Math.sin(i * 0.08 + t * 2) * 2.5);
    }
    ctx.stroke();
    ctx.restore();
  }
  path();
  ctx.strokeStyle = 'rgba(20,17,14,0.55)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(x + 18, y + 14, 8, h - 44);
  ctx.restore();
}

/** Borehole: casing, screen, and the water that climbs it. */
export function borehole(ctx, x, y0, y1, { a = 1, level = 0, t = 0, w = 54 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  // casing
  ctx.fillStyle = linGrad(ctx, x - w / 2, 0, x + w / 2, 0, [
    [0, '#E6E0D0'],
    [0.45, '#CFC8B6'],
    [1, '#A69E8B'],
  ]);
  ctx.fillRect(x - w / 2, y0, w, y1 - y0);
  ctx.fillStyle = 'rgba(20,17,16,0.14)';
  ctx.fillRect(x + w / 2 - 14, y0, 14, y1 - y0);
  // water inside, climbing with `level`
  const wh = (y1 - y0 - 30) * clamp(level);
  ctx.fillStyle = hexA(K.waterHi, 0.75);
  ctx.fillRect(x - w / 2 + 9, y1 - 20 - wh, w - 18, wh);
  // screen slots at the bottom
  ctx.fillStyle = '#7E7666';
  for (let i = 0; i < 7; i++) ctx.fillRect(x - w / 2 + 6, y1 - 14 - i * 12, w - 12, 5);
  // rising bubbles
  if (level > 0.05) {
    for (let i = 0; i < 7; i++) {
      const ph = ((t * 0.5 + i * 0.14) % 1);
      const by = y1 - 24 - ph * wh;
      ctx.globalAlpha = a * (1 - ph) * 0.9;
      ctx.fillStyle = '#DFF4F7';
      ctx.beginPath();
      ctx.arc(x - 8 + (i % 3) * 8, by, 2.4, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = a;
  }
  ctx.restore();
}

/** Small pump with a spinning fan. */
export function pump(ctx, x, y, s = 1, { a = 1, on = 0, t = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  fillRR(ctx, -156, 196, 312, 22, 11, ctx.fillStyle);
  const body = linGrad(ctx, -160, -90, 160, 90, [
    [0, '#A9D2C2'],
    [0.45, '#5C9C8A'],
    [1, '#2F6053'],
  ]);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  fillRR(ctx, -166, 190, 312, 26, 8, ctx.fillStyle);
  ctx.fillStyle = body;
  fillRR(ctx, -162, -92, 254, 182, 28, body);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  fillRR(ctx, -144, -76, 214, 18, 9, ctx.fillStyle);
  ctx.fillStyle = 'rgba(8,18,16,0.22)';
  for (let i = 0; i < 7; i++) ctx.fillRect(-142 + i * 30, -42, 12, 104);
  // fan
  ctx.fillStyle = linGrad(ctx, 90, -70, 150, 70, [[0, '#E2DCCC'], [1, '#8F8B7E']]);
  ctx.beginPath();
  ctx.arc(142, 0, 64, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.translate(142, 0);
  ctx.rotate(on * t * 9);
  ctx.strokeStyle = 'rgba(24,20,17,0.45)';
  ctx.lineWidth = 8;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos((i * TAU) / 4) * 52, Math.sin((i * TAU) / 4) * 52);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(30,26,22,0.5)';
  ctx.beginPath();
  ctx.arc(142, 0, 9, 0, TAU);
  ctx.fill();
  // gauge
  ctx.fillStyle = '#F0EADA';
  ctx.beginPath();
  ctx.arc(30, -142, 34, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#3B3830';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = K.rust;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, -142);
  ctx.lineTo(30 + 20 * Math.cos(-0.9 + Math.sin(t * 2) * 0.05), -142 + 20 * Math.sin(-0.9));
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------- typography ------------------------------ */

export function kicker(ctx, text, { x = 96, y = 250, color = K.rust, ink = K.bone, a = 1, rule = true } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  if (rule) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 30, 54, 5);
  }
  tracking(ctx, text, x, y + 6, { size: 27, font: F.mono6, track: 5, color: ink, alpha: 0.92 });
  ctx.restore();
}

export function counterTo(v, digits = 0) {
  return v.toFixed(digits).replace('.', ',');
}

/** Big number that slides up into place. */
export function bigNumber(ctx, s, x, y, { size = 200, color = K.bone, a = 1, rise = 0, track = -6, font = F.num, align = 'left' } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  txt(ctx, s, x, y + (1 - a) * 0 + rise, { size, font, color, track, align });
  ctx.restore();
}

export function bracket(ctx, x, y0, y1, { label = '', color = K.bone, a = 1, side = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1);
  ctx.moveTo(x - 16, y0);
  ctx.lineTo(x + 16, y0);
  ctx.moveTo(x - 16, y1);
  ctx.lineTo(x + 16, y1);
  ctx.stroke();
  if (label) {
    txt(ctx, label, x + 26 * side, (y0 + y1) / 2 + 10, {
      size: 32, font: F.num6, color, align: side > 0 ? 'left' : 'right',
    });
  }
  ctx.restore();
}

export function chip(ctx, s, x, y, { a = 1, bg = 'rgba(6,10,12,0.78)', ink = K.bone, border = 'rgba(255,255,255,0.18)', size = 26, track = 4, align = 'left' } = {}) {
  const tw = measure(ctx, s, size, F.mono6, track) + track;
  const padX = 22;
  const h = size + 26;
  const x0 = align === 'center' ? x - (tw + padX * 2) / 2 : x;
  ctx.save();
  ctx.globalAlpha *= a;
  fillRR(ctx, x0, y - h / 2, tw + padX * 2, h, 8, bg);
  if (border) strokeRR(ctx, x0, y - h / 2, tw + padX * 2, h, 8, border, 1.5);
  txt(ctx, s, x0 + padX, y + 2, { size, font: F.mono6, color: ink, track, base: 'middle' });
  ctx.restore();
  return { x: x0, w: tw + padX * 2 };
}

export function grain(ctx, a = 0.05) {
  // local grain for scenes that need extra tooth on top of the film pass
  const r = rng(91);
  ctx.save();
  ctx.globalAlpha = a;
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = r() > 0.5 ? '#fff' : '#000';
    ctx.fillRect(r() * W, r() * 2100, 2, 2);
  }
  ctx.restore();
}
