// Drawing kit for "Alarm 5 Menit" (episode 4).
// World: a bedroom at dawn. Cold window light from the right, one warm lamp,
// the phone as the hero object. Editorial charts for the science beats.
import { W, H, C, M, txt, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { card, hairline, shadow, glowSpot } from './_ep3.mjs';

export { card, hairline, shadow, glowSpot };

/* ------------------------------------------------------------- backdrop -- */

export function dawn(ctx, o = {}) {
  const {
    top = '#06080F', mid = '#0A101C', bot = '#0D1626',
    warmX = 0.18, warmA = 0.10,
  } = o;
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, H, [[0, top], [0.52, mid], [1, bot]]);
  ctx.fillRect(0, 0, W, H);
  // pre-dawn bloom on the horizon
  glowSpot(ctx, W * 0.5, H * 0.98, H * 0.55, '#1B3A5C', 0.35);
  glowSpot(ctx, W * warmX, H * 0.72, H * 0.4, C.amber, warmA);
  const v = radGrad(ctx, W / 2, H * 0.44, H * 0.22, H * 0.8, [
    [0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.5)'],
  ]);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

/** A window at dawn: thick jambs, a sill, cold sky glass and a warm horizon. */
export function windowLight(ctx, x, y, w, h, a = 1) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  // wall recess around the opening
  ctx.fillStyle = 'rgba(6,10,18,0.55)';
  ctx.fillRect(x - 18, y - 18, w + 36, h + 36);

  // glass: cold at the top, warm at the horizon
  const g = linGrad(ctx, x, y, x, y + h, [
    [0, 'rgba(58,92,150,0.9)'],
    [0.42, 'rgba(96,140,200,0.95)'],
    [0.72, 'rgba(150,180,215,0.95)'],
    [1, 'rgba(214,190,170,0.95)'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // distant rooftops silhouette so it reads as a window, not a blue panel
  ctx.save();
  ctx.globalAlpha *= 0.55;
  ctx.fillStyle = '#0B1524';
  const base = y + h * 0.86;
  const rooves = [
    [0.02, 0.10], [0.14, 0.16], [0.33, 0.08], [0.48, 0.19],
    [0.70, 0.12], [0.86, 0.22],
  ];
  rooves.forEach(([px, ph], i) => {
    const bx = x + w * px;
    const bw = w * (i === rooves.length - 1 ? 0.16 : 0.14);
    const bh = h * ph;
    ctx.fillRect(bx, base - bh, bw, bh + h * 0.14);
  });
  ctx.fillRect(x, base + h * 0.06, w, h * 0.08);
  ctx.restore();

  // mullions
  ctx.fillStyle = 'rgba(9,13,20,0.92)';
  ctx.fillRect(x + w * 0.5 - 7, y, 14, h);
  ctx.fillRect(x, y + h * 0.44 - 7, w, 14);
  // jambs
  ctx.fillRect(x - 16, y - 16, w + 32, 16);
  ctx.fillRect(x - 16, y + h, w + 32, 18);
  ctx.fillRect(x - 16, y - 16, 16, h + 34);
  ctx.fillRect(x + w, y - 16, 16, h + 34);
  // sill with a lit top edge
  ctx.fillStyle = '#1B2230';
  ctx.fillRect(x - 34, y + h + 18, w + 68, 20);
  hairline(ctx, x - 34, y + h + 18, x + w + 34, y + h + 18, {
    color: '#CFE4FF', alpha: 0.35, lw: 2,
  });

  // inner glow spilling onto the wall
  const b = radGrad(ctx, x + w / 2, y + h * 0.6, w * 0.25, w * 1.7, [
    [0, 'rgba(150,195,255,0.25)'], [1, 'rgba(150,195,255,0)'],
  ]);
  ctx.fillStyle = b;
  ctx.fillRect(x - w, y - w, w * 3, h + w * 2);
  ctx.restore();
}

/** Parallelogram of light falling from a window. */
export function lightShaft(ctx, o = {}) {
  const { x = 980, y = 520, w = 460, h = 1500, skew = 220, a = 0.1 } = o;
  if (a <= 0.005) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = linGrad(ctx, x, y, x + skew, y + h, [
    [0, `rgba(150,195,255,${a})`], [1, 'rgba(150,195,255,0)'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w + skew, y + h);
  ctx.lineTo(x + skew * 1.35, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ---------------------------------------------------------------- phone -- */

/**
 * The hero object: a phone standing on its side, alarm screen lit.
 * o: { h, alpha, glow, time, sub, snooze (0..3), press (0..1), dim, label }
 */
export function phone(ctx, x, y, w, o = {}) {
  const {
    h = w * 1.94, alpha = 1, glow = 0.55, time = '06:00', sub = 'SENIN · 9 NOV',
    snooze = 0, press = 0, dim = 0, label = 'ALARM',
  } = o;
  if (alpha <= 0.005) return;
  ctx.save();
  ctx.globalAlpha *= alpha;

  shadow(ctx, x + w / 2, y + h + 24, w * 0.62, w * 0.14, 0.62);

  // body
  fillRR(ctx, x, y, w, h, w * 0.13, '#0A0D14');
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 3;
  rr(ctx, x, y, w, h, w * 0.13);
  ctx.stroke();
  // edge highlight
  ctx.strokeStyle = 'rgba(190,220,255,0.10)';
  ctx.lineWidth = 6;
  rr(ctx, x + 4, y + 4, w - 8, h - 8, w * 0.12);
  ctx.stroke();
  ctx.restore();

  // side buttons
  fillRR(ctx, x - 7, y + h * 0.2, 7, h * 0.07, 3, '#1A2029');
  fillRR(ctx, x + w, y + h * 0.22, 7, h * 0.11, 3, '#1A2029');

  // screen
  const px = x + w * 0.05;
  const py = y + w * 0.05;
  const pw = w * 0.9;
  const ph = h - w * 0.1;
  const lit = 0.55 + 0.45 * (1 - dim);
  const sg = linGrad(ctx, px, py, px, py + ph, [
    [0, `rgba(30,52,86,${0.95 * lit})`],
    [0.42, `rgba(16,28,48,${0.98 * lit})`],
    [1, `rgba(8,12,22,${lit})`],
  ]);
  fillRR(ctx, px, py, pw, ph, w * 0.1, sg);

  // screen glow behind the numerals
  glowSpot(ctx, px + pw / 2, py + ph * 0.34, pw * 0.95, '#7FB2FF', 0.16 * glow * (1 - dim * 0.5));
  if (press > 0) glowSpot(ctx, px + pw / 2, py + ph * 0.34, pw * (0.8 + press * 0.5), C.amber, 0.3 * press);

  // top label
  txt(ctx, label, px + pw / 2, py + ph * 0.13, {
    size: w * 0.058, font: F.num6, color: hexA(C.bone, 0.55), align: 'center', track: w * 0.012,
  });

  // time
  txt(ctx, time, px + pw / 2, py + ph * 0.36, {
    size: w * 0.315, font: F.num, color: C.bone, align: 'center', track: -w * 0.008,
    glowBlur: 26, glowColor: hexA('#9CC6FF', 0.5),
  });

  // date / subtitle
  txt(ctx, sub, px + pw / 2, py + ph * 0.44, {
    size: w * 0.052, font: F.num6, color: hexA(C.bone, 0.42), align: 'center', track: w * 0.006,
  });

  // hint above the button
  txt(ctx, 'TARIK UNTUK MENUNDA', px + pw / 2, py + ph * 0.7, {
    size: w * 0.038, font: F.num6, color: hexA(C.bone, 0.26), align: 'center', track: w * 0.006,
  });

  // snooze bar
  const bw = pw * 0.76;
  const bx = px + (pw - bw) / 2;
  const by = py + ph * 0.79;
  fillRR(ctx, bx, by, bw, w * 0.16, w * 0.08, hexA(C.amber, 0.14));
  strokeRR(ctx, bx, by, bw, w * 0.16, w * 0.08, hexA(C.amber, 0.45), 2);
  txt(ctx, 'SNOOZE', bx + bw / 2, by + w * 0.108, {
    size: w * 0.06, font: F.head, color: C.amberHi, align: 'center', track: w * 0.008,
  });
  // dots: how many times it was pressed
  const dotY = by - w * 0.09;
  for (let i = 0; i < 3; i++) {
    const on = i < snooze;
    ctx.save();
    ctx.globalAlpha *= on ? 1 : 0.22;
    ctx.fillStyle = on ? C.amber : C.bone;
    ctx.beginPath();
    ctx.arc(px + pw / 2 + (i - 1) * w * 0.075, dotY, w * 0.016, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // press ring
  if (press > 0) {
    ctx.save();
    ctx.globalAlpha *= press * 0.8;
    ctx.strokeStyle = C.amberHi;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(px + pw / 2, by + w * 0.08, w * (0.1 + press * 0.42), 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/* ----------------------------------------------------------------- chips -- */

/** Small rounded tag. Returns its width. */
export function chip(ctx, x, y, text, o = {}) {
  const {
    size = 34, font = F.num6, color = C.amber, a = 1, track = 3,
    solid = false, padX = 26, h = 0, align = 'left',
  } = o;
  const tw = measure(ctx, text, size, font, track);
  const ch = h || size * 2.05;
  const cw = tw + padX * 2;
  const cx = align === 'center' ? x - cw / 2 : align === 'right' ? x - cw : x;
  ctx.save();
  ctx.globalAlpha *= a;
  if (solid) {
    fillRR(ctx, cx, y, cw, ch, ch / 2, hexA(color, 0.92));
    txt(ctx, text, cx + cw / 2, y + ch * 0.63, {
      size, font, color: '#0A0C12', align: 'center', track,
    });
  } else {
    fillRR(ctx, cx, y, cw, ch, ch / 2, hexA(color, 0.10));
    strokeRR(ctx, cx, y, cw, ch, ch / 2, hexA(color, 0.42), 2);
    txt(ctx, text, cx + cw / 2, y + ch * 0.63, { size, font, color, align: 'center', track });
  }
  ctx.restore();
  return cw;
}

/** Horizontal meter that fills from 0..p. */
export function meter(ctx, x, y, w, p, o = {}) {
  const { h = 14, color = C.amber, bg = 'rgba(255,255,255,0.10)', a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  fillRR(ctx, x, y, w, h, h / 2, bg);
  const pw = Math.max(h, w * clamp(p));
  const g = linGrad(ctx, x, y, x + pw, y, [[0, hexA(color, 0.65)], [1, color]]);
  fillRR(ctx, x, y, pw, h, h / 2, g);
  ctx.restore();
}

/* -------------------------------------------------------------- science -- */

/**
 * Stepped hypnogram. pts = [{ m: minutes, stage: 0..3 }] where 0 is BANGUN
 * (top lane) and 3 is DALAM (bottom lane).
 */
export function stair(ctx, pts, o = {}) {
  const {
    x0, x1, mMax, lanes, color = C.sky, lw = 7, a = 1, upto = 1, dash = null,
  } = o;
  const yOf = (stage) => lanes[clamp(stage, 0, lanes.length - 1)];
  const xOf = (m) => lerp(x0, x1, m / mMax);
  ctx.save();
  ctx.globalAlpha *= 1;
  const n = pts.length;
  const draw = (limitM) => {
    ctx.beginPath();
    ctx.moveTo(xOf(pts[0].m), yOf(pts[0].stage));
    for (let i = 1; i < n; i++) {
      const p = pts[i];
      if (p.m > limitM) break;
      const px = xOf(p.m);
      ctx.lineTo(px, yOf(pts[i - 1].stage));
      ctx.lineTo(px, yOf(p.stage));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.globalAlpha *= a;
    ctx.stroke();
  };
  if (upto >= 1) draw(mMax);
  else draw(mMax * upto);
  ctx.restore();
  return { xOf, yOf };
}

/** Vertical annotation line with a label above it. */
export function markLine(ctx, x, y0, y1, o = {}) {
  const { color = C.amber, a = 0.6, dash = [4, 10], lw = 2 } = o;
  hairline(ctx, x, y0, x, y1, { color, alpha: a, lw, dash });
}

/** Section kicker used at the top of every science scene. */
export function kicker(ctx, label, o = {}) {
  const { x = M, y = 300, color = hexA(C.bone, 0.5) } = o;
  hairline(ctx, x, y - 22, x + 54, y - 22, { color: C.amber, alpha: 0.7, lw: 4 });
  txt(ctx, label, x, y + 26, { size: 27, font: F.num6, color, track: 5 });
}

/** Big numeral with an optional unit line, left aligned. */
export function bigStat(ctx, x, y, value, o = {}) {
  const {
    size = 168, unit = '', color = C.bone, a = 1, label = '', labelColor = hexA(C.bone, 0.5),
    maxWidth = 0,
  } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  const sz = txt(ctx, value, x, y, {
    size, font: F.num, color, maxWidth, align: 'left',
    glowBlur: 20, glowColor: hexA(color, 0.28),
  });
  let endX = x + measure(ctx, value, sz, F.num);
  if (unit) {
    const uw = txt(ctx, unit, endX + 14, y - 4, { size: size * 0.26, font: F.num6, color: hexA(color, 0.8), track: 2 });
    endX += 14 + measure(ctx, unit, size * 0.26, F.num6, 2);
    void uw;
  }
  if (label) {
    txt(ctx, label, x, y + size * 0.28, { size: size * 0.135, font: F.num6, color: labelColor, track: 3 });
  }
  ctx.restore();
  return endX;
}
