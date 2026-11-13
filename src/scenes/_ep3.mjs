// Drawing kit for "Kopi Jam 3 Sore" (v2): objects with real shading,
// editorial charts, no decorative particle systems.
import { W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';

export const INK = '#05060A';

export function bg(ctx, o = {}) {
  const { top = '#0B0D14', mid = '#07080D', bot = '#04050A' } = o;
  const g = linGrad(ctx, 0, 0, 0, H, [[0, top], [0.5, mid], [1, bot]]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // soft vignette so type always sits on a quiet field
  const v = radGrad(ctx, W / 2, H * 0.45, H * 0.2, H * 0.78, [
    [0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)'],
  ]);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

export function glowSpot(ctx, x, y, r, color, alpha = 0.5) {
  const g = radGrad(ctx, x, y, 0, r, [
    [0, hexA(color, alpha)], [0.5, hexA(color, alpha * 0.32)], [1, hexA(color, 0)],
  ]);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function shadow(ctx, x, y, rx, ry, a = 0.55) {
  const g = radGrad(ctx, x, y, 0, Math.max(rx, ry), [
    [0, `rgba(0,0,0,${a})`], [0.6, `rgba(0,0,0,${a * 0.4})`], [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / Math.max(rx, ry));
  ctx.translate(-x, -y);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(rx, ry), 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function card(ctx, x, y, w, h, o = {}) {
  const {
    a = 1, r = 30, fill = 'rgba(255,255,255,0.035)', stroke = 'rgba(255,255,255,0.10)',
    lw = 2, glowColor = null, shadowBlur = 60,
  } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.shadowColor = glowColor ? hexA(glowColor, 0.28) : 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetY = 18;
  fillRR(ctx, x, y, w, h, r, fill);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  // top light edge
  const g = linGrad(ctx, x, y, x, y + h, [
    [0, 'rgba(255,255,255,0.06)'], [0.35, 'rgba(255,255,255,0.012)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
  ctx.fill();
  strokeRR(ctx, x, y, w, h, r, stroke, lw);
  ctx.restore();
}

export function hairline(ctx, x0, y0, x1, y1, o = {}) {
  const { color = C.bone, alpha = 0.16, lw = 2, dash = null } = o;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------------------ mug -- */
/** Ceramic mug with saucer, contact shadow, rim light and a liquid surface. */
const midshade = () => '#171B24';

export function mug(ctx, x, y, s = 1, o = {}) {
  const {
    bodyA = '#2A303C', bodyB = '#0E1118', rim = 'rgba(255,255,255,0.22)',
    liquid = '#4A2A18', liquidA = 1, alpha = 1, steamAmt = 0.5, t = 0,
  } = o;
  const w = 300 * s;
  const h = 336 * s;
  const bx = x - w / 2;

  ctx.save();
  ctx.globalAlpha *= alpha;

  // contact shadow + saucer
  shadow(ctx, x, y + 34 * s, 250 * s, 58 * s, 0.6);
  const sa = 224 * s;
  ctx.fillStyle = '#14171F';
  ctx.beginPath();
  ctx.ellipse(x, y + 26 * s, sa, sa * 0.2, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = hexA('#ffffff', 0.10);
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.ellipse(x, y + 26 * s, sa, sa * 0.2, 0, 0, TAU);
  ctx.stroke();

  // handle (behind body): thick torus segment, attached at the waist
  ctx.save();
  ctx.lineCap = 'round';
  const hx = x + w * 0.36;
  const hy = y - h * 0.44;
  const hr = 104 * s;
  ctx.strokeStyle = '#232833';
  ctx.lineWidth = 44 * s;
  ctx.beginPath();
  ctx.arc(hx, hy, hr, -Math.PI * 0.42, Math.PI * 0.42);
  ctx.stroke();
  ctx.strokeStyle = midshade();
  ctx.lineWidth = 40 * s;
  ctx.beginPath();
  ctx.arc(hx, hy, hr, -Math.PI * 0.1, Math.PI * 0.42);
  ctx.stroke();
  // rim light along the top of the handle
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.arc(hx, hy, hr + 16 * s, -Math.PI * 0.36, -Math.PI * 0.02);
  ctx.stroke();
  ctx.restore();

  // body
  const g = linGrad(ctx, bx, y - h, bx + w, y, [
    [0, bodyA], [0.42, '#171B24'], [1, bodyB],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(bx, y - h);
  ctx.lineTo(bx + w, y - h);
  ctx.lineTo(bx + w - 22 * s, y - 12 * s);
  ctx.quadraticCurveTo(x, y + 14 * s, bx + 22 * s, y - 12 * s);
  ctx.closePath();
  ctx.fill();

  // left highlight
  const hl = linGrad(ctx, bx + 8 * s, 0, bx + 70 * s, 0, [
    [0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.13)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.moveTo(bx + 10 * s, y - h + 10 * s);
  ctx.lineTo(bx + 62 * s, y - h + 10 * s);
  ctx.lineTo(bx + 72 * s, y - 20 * s);
  ctx.lineTo(bx + 30 * s, y - 20 * s);
  ctx.closePath();
  ctx.fill();

  // rim
  ctx.strokeStyle = rim;
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.ellipse(x, y - h, w / 2, 26 * s, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.ellipse(x, y - h + 5 * s, w / 2 - 3 * s, 24 * s, 0, 0, TAU);
  ctx.stroke();

  // liquid surface
  ctx.save();
  ctx.globalAlpha *= liquidA;
  const lg = radGrad(ctx, x - 40 * s, y - h - 8 * s, 10, 170 * s, [
    [0, '#6B3C22'], [1, liquid],
  ]);
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.ellipse(x, y - h + 7 * s, w / 2 - 16 * s, 21 * s, 0, 0, TAU);
  ctx.fill();
  // reflection of light on the liquid
  ctx.globalAlpha *= 0.5;
  ctx.fillStyle = 'rgba(255,210,150,0.55)';
  ctx.beginPath();
  ctx.ellipse(x - 46 * s, y - h + 2 * s, 46 * s, 7 * s, -0.12, 0, TAU);
  ctx.fill();
  ctx.restore();

  // steam — three short tapered wisps that fade as they rise
  if (steamAmt > 0) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const dir = i === 1 ? 1 : -1;
      const off = (i - 1) * 34 * s;
      const phase = t * 0.9 + i * 2.1;
      const len = 210 * s * (0.8 + 0.2 * Math.sin(phase));
      const N = 26;
      for (let k = 0; k < N; k++) {
        const p0 = k / N;
        const p1 = (k + 1) / N;
        const pt = (p) => [
          x + off + dir * Math.sin(p * 3.6 + phase) * 26 * s * p,
          y - h - 8 * s - p * len,
        ];
        const [x0, y0] = pt(p0);
        const [x1, y1] = pt(p1);
        ctx.globalAlpha = steamAmt * 0.34 * (1 - p0) * (1 - p0);
        ctx.strokeStyle = 'rgba(255,246,232,0.9)';
        ctx.lineWidth = (13 - p0 * 9) * s;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  ctx.restore();
}

/* ---------------------------------------------------------------- clock -- */
export function clockFace(ctx, cx, cy, r, o = {}) {
  const {
    hours = 23, minutes = 12, alpha = 1, arc = null, accent = C.amber,
    showNumbers = true, tint = C.bone, glow = 1,
  } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;

  // wall shadow behind the clock
  shadow(ctx, cx + 12, cy + 26, r * 1.16, r * 1.1, 0.5);

  // bezel
  const bez = linGrad(ctx, cx - r, cy - r, cx + r, cy + r, [
    [0, '#3A4150'], [0.35, '#161A22'], [0.62, '#2C323E'], [1, '#0E1117'],
  ]);
  ctx.fillStyle = bez;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1.5, 0, TAU);
  ctx.stroke();

  // dial
  const face = radGrad(ctx, cx - r * 0.3, cy - r * 0.4, r * 0.1, r * 0.98, [
    [0, '#151A24'], [0.6, '#0D1118'], [1, '#080A10'],
  ]);
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.9, 0, TAU);
  ctx.fill();

  // ticks
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU - Math.PI / 2;
    const big = i % 5 === 0;
    const r0 = r * (big ? 0.74 : 0.8);
    const r1 = r * 0.86;
    ctx.strokeStyle = big ? hexA(tint, 0.62) : hexA(tint, 0.2);
    ctx.lineWidth = big ? 7 : 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.stroke();
  }

  if (showNumbers) {
    [[12, 0], [3, 3], [6, 6], [9, 9]].forEach(([label, hh]) => {
      const a = (hh / 12) * TAU - Math.PI / 2;
      txt(ctx, String(label), cx + Math.cos(a) * r * 0.63, cy + Math.sin(a) * r * 0.63 + r * 0.055, {
        size: r * 0.135, font: F.num6, color: hexA(tint, 0.52), align: 'center',
      });
    });
  }

  if (arc) {
    ctx.save();
    ctx.strokeStyle = hexA(accent, 0.95);
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.shadowColor = hexA(accent, 0.75 * glow);
    ctx.shadowBlur = 34 * glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.965, arc.from, arc.to);
    ctx.stroke();
    ctx.restore();
  }

  const hAng = (((hours % 12) + minutes / 60) / 12) * TAU;
  const mAng = (minutes / 60) * TAU;

  const hand = (ang, len, wide, color, glowCol = null) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    if (glowCol) {
      ctx.shadowColor = glowCol;
      ctx.shadowBlur = 26;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-wide, 0);
    ctx.quadraticCurveTo(-wide * 0.4, -len * 0.12, 0, -len);
    ctx.quadraticCurveTo(wide * 0.4, -len * 0.12, wide, 0);
    ctx.quadraticCurveTo(0, wide * 1.1, -wide, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // minute hand
  hand(mAng, r * 0.78, r * 0.035, '#E9E3D6');
  // hour hand
  hand(hAng, r * 0.5, r * 0.055, C.amber, hexA(C.amber, 0.55 * glow));

  // centre cap
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.05, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.015, cy - r * 0.015, r * 0.02, 0, TAU);
  ctx.fill();

  // glass sheen
  ctx.save();
  ctx.globalAlpha *= 0.10;
  const gl = linGrad(ctx, cx - r, cy - r, cx + r * 0.4, cy + r * 0.7, [
    [0, 'rgba(255,255,255,0.9)'], [0.45, 'rgba(255,255,255,0.05)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.9, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/* ----------------------------------------------------------------- pill -- */
export function pill(ctx, s, x, y, o = {}) {
  const {
    color = C.amber, size = 32, bgc = 'rgba(255,176,58,0.12)',
    border = 'rgba(255,176,58,0.42)', alpha = 1, align = 'center',
  } = o;
  const tw = measure(ctx, s, size, F.num6, 3) + 3;
  const w = tw + 54;
  const h = size + 28;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.globalAlpha *= alpha;
  fillRR(ctx, x0, y - h / 2, w, h, h / 2, bgc);
  strokeRR(ctx, x0, y - h / 2, w, h, h / 2, border, 2);
  txt(ctx, s, x0 + w / 2, y + size * 0.36, { size, font: F.num6, color, align: 'center', track: 3 });
  ctx.restore();
  return { w, h, x: x0 };
}

/* ---------------------------------------------------------------- chart -- */
export function chartFrame(ctx, o) {
  const {
    x0, x1, y0, y1, yMax, yTicks = [], xTicks = [], xLabels = [], yLabel = '',
    alpha = 1, unit = '',
  } = o;
  const py = (v) => y1 - (v / yMax) * (y1 - y0);
  ctx.save();
  ctx.globalAlpha *= alpha;

  yTicks.forEach((v) => {
    const y = py(v);
    if (v !== 0) hairline(ctx, x0, y, x1, y, { alpha: 0.07, dash: [3, 10] });
    txt(ctx, String(v), x0 - 26, y + 9, {
      size: 26, font: F.num6, color: hexA(C.bone, 0.42), align: 'right',
    });
  });
  if (yLabel) {
    txt(ctx, yLabel, x0 - 26, y0 - 34, {
      size: 21, font: F.num6, color: hexA(C.bone, 0.3), align: 'right', track: 3,
    });
  }

  // baseline
  hairline(ctx, x0, y1, x1, y1, { alpha: 0.3, lw: 3 });
  xTicks.forEach((x, i) => {
    hairline(ctx, x, y1, x, y1 + 16, { alpha: 0.24 });
    if (xLabels[i]) {
      txt(ctx, xLabels[i], x, y1 + 56, {
        size: 26, font: F.num6, color: hexA(C.bone, 0.42), align: 'center',
      });
    }
  });
  ctx.restore();
  return py;
}

export function curve(ctx, pts, o = {}) {
  const { color = C.amber, lw = 7, progress = 1, glow = 30, fillTo = null } = o;
  const n = Math.max(2, Math.floor(pts.length * clamp(progress)));
  ctx.save();
  if (fillTo !== null && n > 1) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineTo(pts[n - 1][0], fillTo);
    ctx.lineTo(pts[0][0], fillTo);
    ctx.closePath();
    const g = linGrad(ctx, 0, Math.min(...pts.slice(0, n).map((p) => p[1])), 0, fillTo, [
      [0, hexA(color, 0.26)], [1, hexA(color, 0.01)],
    ]);
    ctx.fillStyle = g;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = hexA(color, 0.6);
  ctx.shadowBlur = glow;
  ctx.stroke();
  ctx.restore();
}

export function dot(ctx, x, y, r, color, o = {}) {
  const { ring = C.ink0, ringW = 5, a = 1, glow = 26 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.shadowColor = hexA(color, 0.8);
  ctx.shadowBlur = glow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  if (ring) {
    ctx.lineWidth = ringW;
    ctx.strokeStyle = ring;
    ctx.stroke();
  }
  ctx.restore();
}
