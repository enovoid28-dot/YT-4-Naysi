import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, rr, measure, tracking, ledNumber } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1, EASE } from '../engine/anim.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Ep16 art kit — "electric night room".
//
// The look is a dark apartment at night, lit by one warm lamp and the cold mint
// of a prepaid meter. Everything is still drawn in 2D, but built from the layers
// a photographer would use: ambient falloff, a volumetric cone, dust in the
// beam, contact shadow, edge occlusion, specular sweep, and a foreground bokeh
// layer that moves at a different speed than the wall (parallax).
// ─────────────────────────────────────────────────────────────────────────────

export const D = {
  ink: '#04070C', ink1: '#070C13', ink2: '#0C141D', ink3: '#131E29',
  bone: '#F6F1E4',
  paper: '#F3EDE0', paperInk: '#15171B', paperShade: '#D9CFBC',
  mint: '#7BE3C8', mintDim: 'rgba(123,227,200,0.35)',
  volt: '#7CC4F5', amber: '#F5B54B', ember: '#E4573F',
  copper: '#C87B4B', copperHi: '#E8A877',
  steel: '#9FB0BE', steelHi: '#E3ECF3', steelLo: '#5B6A77',
  plastic: '#1B2530', plasticHi: '#33424F',
  line: 'rgba(214,228,240,0.14)', hair: 'rgba(214,228,240,0.07)',
};

export const ease = {
  out: (p) => EASE.outCubic(clamp(p)),
  expo: (p) => EASE.outExpo(clamp(p)),
  inOut: (p) => EASE.inOutQuad(clamp(p)),
  smooth: (p) => EASE.smooth(clamp(p)),
  back: (p) => {
    const c = 1.24;
    const x = clamp(p) - 1;
    return 1 + x * x * ((c + 1) * x + c);
  },
};

/** real caption time for card i — every beat is cued from the take */
export const cue = (scene, i, off = 0) => {
  const c = scene && scene.captions && scene.captions[i];
  return (c ? c.from : 0) + off;
};

/** parallax layer: foreground elements travel further than the wall does */
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

/* ───────────────────────────── background ────────────────────────────────── */

export function room(ctx, {
  t = 0, glowX = W * 0.5, glowY = 520, glowA = 0.16, horizon = 1180,
  floor = 0.55, wall = 1, a = 1,
} = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  // ambient: cold at the top, warm near the lamp, black at the edges
  ctx.fillStyle = linGrad(ctx, 0, -220, 0, H + 220, [
    [0, '#03060A'], [0.30, D.ink1], [0.62, '#0A121B'], [1, '#03060A'],
  ]);
  ctx.fillRect(-260, -260, W + 520, H + 520);
  ctx.fillStyle = radGrad(ctx, glowX, glowY, 0, 900, [
    [0, hexA(D.amber, glowA)], [0.40, hexA(D.amber, glowA * 0.22)], [1, hexA(D.amber, 0)],
  ]);
  ctx.fillRect(-260, -260, W + 520, H + 520);
  // wall seam and skirting: two lines say "this is a room", not a gradient
  if (wall > 0) {
    ctx.globalAlpha = a * 0.5 * wall;
    ctx.fillStyle = 'rgba(214,228,240,0.05)';
    ctx.fillRect(0, horizon - 240, W, 2);
    ctx.globalAlpha = a * wall;
    ctx.fillStyle = linGrad(ctx, 0, horizon - 236, 0, horizon + 26, [
      [0, 'rgba(2,4,7,0)'], [1, 'rgba(2,4,7,0.55)'],
    ]);
    ctx.fillRect(0, horizon - 236, W, 262);
  }
  // floor: a long specular sheen and a dark falloff into the bottom
  if (floor > 0) {
    ctx.globalAlpha = a * floor;
    ctx.fillStyle = linGrad(ctx, 0, horizon, 0, horizon + 420, [
      [0, 'rgba(168,196,220,0.10)'], [0.25, 'rgba(168,196,220,0.035)'], [1, 'rgba(168,196,220,0)'],
    ]);
    ctx.fillRect(0, horizon, W, 460);
    ctx.fillStyle = linGrad(ctx, 0, horizon + 200, 0, H, [
      [0, 'rgba(2,4,7,0)'], [1, 'rgba(2,4,7,0.72)'],
    ]);
    ctx.fillRect(0, horizon + 200, W, H - horizon - 200);
  }
  ctx.restore();
}

/** volumetric cone from a lamp; soft edges, no hard polygon */
export function cone(ctx, x, yTop, yBot, spread, { a = 0.10, color = D.amber, t = 0 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  const sway = Math.sin(t * 0.35) * 10;
  const g = ctx.createLinearGradient(0, yTop, 0, yBot);
  g.addColorStop(0, hexA(color, a));
  g.addColorStop(0.55, hexA(color, a * 0.42));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 26 + sway * 0.2, yTop);
  ctx.lineTo(x + 26 + sway * 0.2, yTop);
  ctx.lineTo(x + spread + sway, yBot);
  ctx.lineTo(x - spread + sway, yBot);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** dust suspended in the beam; deterministic, so the render is repeatable */
export function motes(ctx, t, { n = 54, a = 0.5, top = 120, bottom = 1500, color = '#FFE9C4' } = {}) {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const seed = i * 7.13;
    const sp = 12 + noise1(seed + 3) * 26;
    const x = (noise1(seed) * W + Math.sin(t * 0.22 + i) * 26) % W;
    const y = top + ((noise1(seed + 1) * (bottom - top) + t * sp) % (bottom - top));
    const r = 1.1 + noise1(seed + 2) * 2.4;
    const al = a * (0.25 + 0.75 * noise1(seed + 4)) * (0.55 + 0.45 * Math.sin(t * 0.9 + i * 1.7));
    ctx.globalAlpha = clamp(al, 0, 1) * 0.55;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** foreground bokeh — big, soft, out of focus, moves opposite to the camera */
export function bokeh(ctx, cam, { n = 7, a = 0.16 } = {}) {
  ctx.save();
  const dx = (cam && cam.dx ? cam.dx : 0) * -1.9;
  const dy = (cam && cam.dy ? cam.dy : 0) * -1.9;
  for (let i = 0; i < n; i++) {
    const s = i * 5.7;
    const x = noise1(s) * W + dx;
    const y = 200 + noise1(s + 2) * 1500 + dy;
    const r = 60 + noise1(s + 1) * 130;
    ctx.globalAlpha = a * (0.35 + 0.65 * noise1(s + 3));
    ctx.fillStyle = radGrad(ctx, x, y, 0, r, [
      [0, hexA(D.amber, 0.5)], [0.6, hexA(D.amber, 0.16)], [1, hexA(D.amber, 0)],
    ]);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/* ───────────────────────────── materials ────────────────────────────────── */

/** specular sweep across a rounded rect — the "plastic under a lamp" read */
export function sheen(ctx, x, y, w, h, r, t, { a = 0.10, speed = 0.22, color = '#FFFFFF' } = {}) {
  ctx.save();
  ctx.beginPath();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  const p = ((t * speed) % 1.6) - 0.3;
  const sx = x - w * 0.6 + p * (w * 1.6);
  ctx.globalAlpha = a;
  ctx.fillStyle = linGrad(ctx, sx - w * 0.16, 0, sx + w * 0.16, 0, [
    [0, hexA(color, 0)], [0.5, hexA(color, 1)], [1, hexA(color, 0)],
  ]);
  ctx.save();
  ctx.transform(1, 0, -0.35, 1, 0, 0);
  ctx.fillRect(sx - w * 0.2, y, w * 0.4, h);
  ctx.restore();
  ctx.restore();
}

/** bevel: a light top edge and a dark bottom edge on any fill */
export function bevel(ctx, x, y, w, h, r = 12, { topA = 0.22, botA = 0.5 } = {}) {
  ctx.save();
  ctx.beginPath();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + 26, [[0, `rgba(255,255,255,${topA})`], [1, 'rgba(255,255,255,0)']]);
  ctx.fillRect(x, y, w, 26);
  ctx.fillStyle = linGrad(ctx, 0, y + h - 30, 0, y + h, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${botA})`]]);
  ctx.fillRect(x, y + h - 30, w, 30);
  ctx.restore();
}

export function shadowed(ctx, { blur = 40, y = 16, color = 'rgba(0,0,0,0.62)' }, fn) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = y;
  fn();
  ctx.restore();
}

/* ───────────────────────────── hero objects ─────────────────────────────── */

/**
 * Prepaid meter: dark plastic body, mint 7-seg display, pulse LED, screws.
 * `read` is the string shown on the LCD ("65,8"), `mode` switches the header.
 */
export function meter(ctx, x, y, w, t, {
  read = '65,8', unit = 'kWh', mode = 'SISA TOKEN', glow = 1, a = 1, pulse = true, h = null,
} = {}) {
  if (a <= 0.002) return;
  const bh = h || w * 0.66;
  ctx.save();
  ctx.globalAlpha *= a;

  // cast shadow onto the wall
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.66)';
  ctx.shadowBlur = 54;
  ctx.shadowOffsetY = 26;
  fillRR(ctx, x, y, w, bh, 26, D.ink2);
  ctx.restore();

  // body
  fillRR(ctx, x, y, w, bh, 26, linGrad(ctx, x, y, x + w, y + bh, [
    [0, '#26333F'], [0.45, D.plastic], [1, '#111820'],
  ]));
  bevel(ctx, x, y, w, bh, 26, { topA: 0.26, botA: 0.62 });
  strokeRR(ctx, x, y, w, bh, 26, 'rgba(214,228,240,0.16)', 2);
  sheen(ctx, x, y, w, bh, 26, t, { a: 0.07, speed: 0.14 });

  // top strip: brand + model
  tracking(ctx, 'P L N', x + 44, y + 62, { size: 26, font: F.head, track: 6, color: hexA(D.bone, 0.72) });
  tracking(ctx, 'PRABAYAR · R-1', x + w - 44, y + 60, {
    size: 18, font: F.mono6, track: 3, color: hexA(D.bone, 0.32), align: 'right',
  });
  ctx.fillStyle = 'rgba(214,228,240,0.10)';
  ctx.fillRect(x + 40, y + 82, w - 80, 1.6);

  // LCD
  const lx = x + 44;
  const ly = y + bh * 0.30;
  const lw = w - 88;
  const lh = bh * 0.40;
  fillRR(ctx, lx, ly, lw, lh, 12, linGrad(ctx, lx, ly, lx, ly + lh, [[0, '#04120F'], [1, '#061A16']]));
  strokeRR(ctx, lx, ly, lw, lh, 12, 'rgba(0,0,0,0.6)', 3);
  // LCD inner top shadow
  ctx.save();
  ctx.beginPath();
  rr(ctx, lx, ly, lw, lh, 12);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, ly, 0, ly + 30, [[0, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']]);
  ctx.fillRect(lx, ly, lw, 30);
  ctx.restore();

  const size = Math.min(lh * 0.52, lw / (read.length * 0.72));
  ledNumber(ctx, read, lx + 34, ly + lh * 0.24, size, hexA(D.mint, glow), { glowBlur: 26 });
  tracking(ctx, unit, lx + lw - 34, ly + lh * 0.30, {
    size: 26, font: F.mono6, track: 4, color: hexA(D.mint, 0.7 * glow), align: 'right',
  });
  tracking(ctx, mode, lx + lw - 34, ly + lh - 24, {
    size: 20, font: F.mono6, track: 3, color: hexA(D.mint, 0.42 * glow), align: 'right',
  });

  // pulse LED + keypad hint
  const blink = pulse ? 0.35 + 0.65 * Math.max(0, Math.sin(t * 3.4)) : 0.8;
  ctx.save();
  ctx.shadowColor = hexA(D.mint, 0.9);
  ctx.shadowBlur = 26 * blink;
  ctx.globalAlpha *= blink;
  ctx.fillStyle = D.mint;
  ctx.beginPath();
  ctx.arc(x + 62, y + bh - 52, 11, 0, TAU);
  ctx.fill();
  ctx.restore();
  tracking(ctx, 'PULSE 3200 imp/kWh', x + 96, y + bh - 44, {
    size: 17, font: F.mono6, track: 2, color: hexA(D.bone, 0.26),
  });

  // screws
  for (const [sx, sy] of [[x + 24, y + 24], [x + w - 24, y + 24], [x + 24, y + bh - 24], [x + w - 24, y + bh - 24]]) {
    ctx.fillStyle = 'rgba(8,12,17,0.9)';
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(214,228,240,0.22)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy - 1);
    ctx.lineTo(sx + 4, sy + 1);
    ctx.stroke();
  }
  ctx.restore();
}

/** the paper token receipt: perforated, printed, held up to the lamp */
export function tokenPaper(ctx, x, y, w, h, {
  a = 1, rot = 0, t = 0, nominal = '100.000', code = '4821 9930 7714 2280 6541',
  rows = null, title = 'STRUK PEMBELIAN TOKEN',
} = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-(x + w / 2), -(y + h / 2));

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.66)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  fillRR(ctx, x, y, w, h, 6, D.paper);
  ctx.restore();
  // thermal paper grain
  ctx.save();
  ctx.beginPath();
  rr(ctx, x, y, w, h, 6);
  ctx.clip();
  ctx.globalAlpha *= 0.5;
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(120,110,94,0.10)' : 'rgba(255,255,255,0.16)';
    ctx.fillRect(x + noise1(i * 3.1) * w, y + noise1(i * 7.7 + 2) * h, 14 + noise1(i) * 60, 1);
  }
  ctx.restore();

  tracking(ctx, title, x + 30, y + 52, { size: 17, font: F.mono6, track: 3.4, color: 'rgba(21,23,27,0.55)' });
  ctx.fillStyle = 'rgba(21,23,27,0.18)';
  ctx.fillRect(x + 30, y + 70, w - 60, 1.4);
  txt(ctx, 'Rp', x + 30, y + 132, { size: 30, font: F.mono6, color: 'rgba(21,23,27,0.55)' });
  txt(ctx, nominal, x + 74, y + 152, { size: 68, font: F.num, color: D.paperInk, track: -2 });
  tracking(ctx, 'NOMINAL PEMBELIAN', x + 30, y + 184, {
    size: 14, font: F.mono6, track: 3, color: 'rgba(21,23,27,0.42)',
  });

  // printed rows
  let ry = y + 246;
  const list = rows || [
    ['BIAYA ADMIN', '2.500'],
    ['PPJ 2,4%', '2.400'],
    ['TARIF / kWh', '1.444,70'],
  ];
  list.forEach(([l, v]) => {
    txt(ctx, l, x + 30, ry, { size: 20, font: F.mono6, color: 'rgba(21,23,27,0.5)', track: 1.4 });
    txt(ctx, v, x + w - 30, ry, { size: 24, font: F.num6, color: 'rgba(21,23,27,0.82)', align: 'right' });
    ctx.fillStyle = 'rgba(21,23,27,0.10)';
    ctx.fillRect(x + 30, ry + 12, w - 60, 1.2);
    ry += 54;
  });

  // the token code
  const cy = y + h - 132;
  ctx.fillStyle = 'rgba(21,23,27,0.55)';
  tracking(ctx, 'KODE TOKEN', x + 30, cy - 26, { size: 15, font: F.mono6, track: 3, color: 'rgba(21,23,27,0.45)' });
  txt(ctx, code, x + 30, cy + 8, { size: 22, font: F.mono6, color: D.paperInk, track: 0.6 });
  // barcode
  ctx.fillStyle = 'rgba(21,23,27,0.86)';
  let bx = x + 30;
  for (let i = 0; i < 34 && bx < x + w - 40; i++) {
    const bw = 2 + noise1(i * 4.4) * 6;
    ctx.fillRect(bx, cy + 26, bw, 40);
    bx += bw + 3 + noise1(i * 2.2) * 4;
  }

  // perforation + torn bottom edge
  ctx.fillStyle = 'rgba(21,23,27,0.14)';
  for (let px = x + 16; px < x + w - 16; px += 18) ctx.fillRect(px, y + h - 62, 10, 3);
  ctx.restore();

  sheen(ctx, x, y, w, h, 6, t, { a: 0.05, speed: 0.1, color: '#FFFFFF' });
}

/** metal tariff plate, the kind screwed to a fuse box */
export function plate(ctx, x, y, w, h, { a = 1, label = '', value = '', sub = '', tone = D.steel, t = 0 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  fillRR(ctx, x, y, w, h, 12, linGrad(ctx, x, y, x + w, y + h, [
    [0, D.steelHi], [0.42, tone], [1, D.steelLo],
  ]));
  ctx.restore();
  bevel(ctx, x, y, w, h, 12, { topA: 0.42, botA: 0.5 });
  strokeRR(ctx, x, y, w, h, 12, 'rgba(255,255,255,0.28)', 2);
  sheen(ctx, x, y, w, h, 12, t, { a: 0.12, speed: 0.12 });
  if (label) tracking(ctx, label, x + 24, y + 34, { size: 16, font: F.mono6, track: 3, color: 'rgba(12,18,24,0.55)' });
  if (sub) tracking(ctx, sub, x + 24, y + 58, { size: 14, font: F.mono6, track: 2.2, color: 'rgba(12,18,24,0.40)' });
  if (value) txt(ctx, value, x + 24, y + h - 26, { size: h * 0.40, font: F.num, color: '#101820', track: -2 });
  ctx.restore();
}

/** MCB breaker: white module, black lever, printed rating */
export function breaker(ctx, x, y, w, h, { a = 1, on = 1, rating = '10A', t = 0 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  fillRR(ctx, x, y, w, h, 6, linGrad(ctx, x, y, x + w, y, [[0, '#E9E4D8'], [0.6, '#D7D1C4'], [1, '#B9B3A6']]));
  ctx.restore();
  bevel(ctx, x, y, w, h, 6, { topA: 0.5, botA: 0.3 });
  // lever recess
  fillRR(ctx, x + w * 0.26, y + h * 0.16, w * 0.48, h * 0.56, 5, '#12171C');
  const lp = lerp(0.62, 0.14, on);
  fillRR(ctx, x + w * 0.30, y + h * lp, w * 0.40, h * 0.25, 4, linGrad(ctx, x, y, x + w, y, [[0, '#5B6672'], [0.5, '#B9C4CE'], [1, '#4A545E']]));
  tracking(ctx, rating, x + w / 2, y + h - 12, {
    size: 13, font: F.mono6, track: 1.6, color: 'rgba(20,24,28,0.6)', align: 'center',
  });
  ctx.restore();
}

/** wall socket + plug, used for the standby beat */
export function socket(ctx, x, y, s, { a = 1, plug = 1, t = 0 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  fillRR(ctx, x, y, s, s, 16, linGrad(ctx, x, y, x + s, y + s, [[0, '#E6E1D5'], [1, '#BDB7AA']]));
  ctx.restore();
  fillRR(ctx, x + s * 0.18, y + s * 0.30, s * 0.64, s * 0.40, 8, '#1A2027');
  for (const dx of [-0.13, 0.13]) {
    ctx.fillStyle = '#05080B';
    fillRR(ctx, x + s * (0.5 + dx) - 5, y + s * 0.42, 10, 26, 4, '#05080B');
  }
  if (plug > 0) {
    ctx.save();
    ctx.globalAlpha *= plug;
    ctx.translate(x + s * 0.5, y + s * 0.5);
    ctx.rotate(-0.04);
    fillRR(ctx, -s * 0.20, -s * 0.16, s * 0.40, s * 0.32, 8, linGrad(ctx, -s * 0.2, 0, s * 0.2, 0, [[0, '#E8E3D7'], [1, '#C4BEB1']]));
    bevel(ctx, -s * 0.20, -s * 0.16, s * 0.40, s * 0.32, 8, { topA: 0.5, botA: 0.3 });
    ctx.restore();
  }
  ctx.restore();
}

export function cable(ctx, x0, y0, x1, y1, { a = 1, lw = 9, sag = 60, tone = '#1A222B', hi = D.copperHi } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + sag;
  ctx.strokeStyle = tone;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(mx, my, x1, y1);
  ctx.stroke();
  ctx.strokeStyle = hexA(hi, 0.55);
  ctx.lineWidth = Math.max(1.4, lw * 0.22);
  ctx.beginPath();
  ctx.moveTo(x0, y0 - lw * 0.22);
  ctx.quadraticCurveTo(mx, my - lw * 0.22, x1, y1 - lw * 0.22);
  ctx.stroke();
  ctx.restore();
}

/** hanging bulb with filament and a warm halo; the light source of the room */
export function bulb(ctx, x, y, { a = 1, t = 0, on = 1, len = 220 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(214,228,240,0.20)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - len);
  ctx.lineTo(x, y - 46);
  ctx.stroke();
  ctx.fillStyle = 'rgba(14,20,26,0.95)';
  fillRR(ctx, x - 16, y - 52, 32, 28, 4, '#141B23');
  const flick = 0.86 + 0.14 * Math.sin(t * 5.1) * Math.sin(t * 1.7);
  const glow = on * flick;
  ctx.save();
  ctx.shadowColor = hexA(D.amber, 0.9);
  ctx.shadowBlur = 90 * glow;
  ctx.fillStyle = radGrad(ctx, x, y + 10, 0, 74, [
    [0, hexA('#FFF4D6', 0.98 * glow)], [0.55, hexA(D.amber, 0.75 * glow)], [1, hexA(D.amber, 0.12 * glow)],
  ]);
  ctx.beginPath();
  ctx.arc(x, y + 8, 60, 0, TAU);
  ctx.fill();
  ctx.restore();
  // filament
  ctx.strokeStyle = hexA('#FFE9B0', 0.9 * glow);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 4);
  for (let i = 0; i < 5; i++) {
    ctx.quadraticCurveTo(x - 12 + i * 6 + 3, y + 6 + (i % 2 ? -10 : 10), x - 12 + (i + 1) * 6, y - 4);
  }
  ctx.stroke();
  ctx.restore();
}

/** split AC indoor unit with slats and three cool air arcs */
export function acUnit(ctx, x, y, w, { a = 1, t = 0, p = 1 } = {}) {
  if (a <= 0.002) return;
  const h = w * 0.30;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 20;
  fillRR(ctx, x, y, w, h, 22, linGrad(ctx, x, y, x, y + h, [[0, '#F3F0E8'], [0.55, '#DCD8CE'], [1, '#A9A49A']]));
  ctx.restore();
  bevel(ctx, x, y, w, h, 22, { topA: 0.55, botA: 0.4 });
  // grille
  ctx.fillStyle = 'rgba(20,24,30,0.12)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 26, y + h * 0.62 + i * 12, w - 52, 4);
  // vent flap
  ctx.save();
  ctx.translate(x + w * 0.5, y + h * 0.86);
  ctx.rotate(0.10 + 0.10 * p);
  fillRR(ctx, -w * 0.42, -8, w * 0.84, 16, 8, '#C9C4BA');
  ctx.restore();
  // brand dot
  ctx.fillStyle = hexA(D.volt, 0.9);
  ctx.beginPath();
  ctx.arc(x + w - 40, y + h * 0.30, 6, 0, TAU);
  ctx.fill();
  // airflow
  for (let i = 0; i < 3; i++) {
    const q = clamp(p * 1.4 - i * 0.22);
    if (q <= 0.01) continue;
    ctx.globalAlpha = a * 0.5 * q;
    ctx.strokeStyle = hexA(D.volt, 0.55);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * (0.22 + i * 0.26), y + h + 16);
    ctx.quadraticCurveTo(
      x + w * (0.22 + i * 0.26) + Math.sin(t * 1.1 + i) * 30,
      y + h + 120,
      x + w * (0.22 + i * 0.26) + Math.sin(t * 0.8 + i) * 46,
      y + h + 232,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** clothes iron, side view — the 350 W example */
export function iron(ctx, x, y, w, { a = 1, t = 0, p = 1 } = {}) {
  if (a <= 0.002) return;
  const h = w * 0.52;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  fillRR(ctx, x, y + h * 0.28, w, h * 0.72, 26, linGrad(ctx, x, y, x + w, y + h, [[0, '#3B4753'], [0.5, '#222B34'], [1, '#12181E']]));
  ctx.restore();
  // soleplate
  fillRR(ctx, x - 12, y + h * 0.80, w + 24, h * 0.20, 12, linGrad(ctx, x, y, x + w, y, [[0, D.steelHi], [0.5, D.steel], [1, D.steelLo]]));
  // handle
  ctx.strokeStyle = '#2A333D';
  ctx.lineWidth = h * 0.16;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.22, y + h * 0.30);
  ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.24, x + w * 0.78, y + h * 0.30);
  ctx.stroke();
  ctx.strokeStyle = hexA(D.copperHi, 0.5);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.24, y + h * 0.22);
  ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.28, x + w * 0.76, y + h * 0.22);
  ctx.stroke();
  // heat shimmer
  for (let i = 0; i < 4; i++) {
    const q = clamp(p * 1.3 - i * 0.18);
    if (q <= 0.01) continue;
    ctx.globalAlpha = a * 0.4 * q;
    ctx.strokeStyle = hexA(D.ember, 0.5);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w * (0.18 + i * 0.2), y + h * 1.02);
    ctx.quadraticCurveTo(
      x + w * (0.18 + i * 0.2) + Math.sin(t * 2 + i) * 14,
      y + h * 1.16,
      x + w * (0.18 + i * 0.2) + Math.sin(t * 1.4 + i) * 22,
      y + h * 1.30,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** fridge: two doors, a handle, a cold rim light */
export function fridge(ctx, x, y, w, { a = 1, p = 1 } = {}) {
  if (a <= 0.002) return;
  const h = w * 1.55;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.62)';
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 18;
  fillRR(ctx, x, y, w, h, 18, linGrad(ctx, x, y, x + w, y + h, [[0, '#F1EEE6'], [0.45, '#D8D4CA'], [1, '#9E9A91']]));
  ctx.restore();
  bevel(ctx, x, y, w, h, 18, { topA: 0.5, botA: 0.35 });
  ctx.fillStyle = 'rgba(20,24,30,0.16)';
  ctx.fillRect(x + 6, y + h * 0.38, w - 12, 3);
  // handles
  fillRR(ctx, x + w - 34, y + h * 0.12, 10, h * 0.16, 5, '#7C8791');
  fillRR(ctx, x + w - 34, y + h * 0.50, 10, h * 0.22, 5, '#7C8791');
  // cold rim
  ctx.save();
  ctx.globalAlpha *= 0.9 * p;
  ctx.strokeStyle = hexA(D.volt, 0.5);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 14);
  ctx.lineTo(x + 14, y + h - 14);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/** a short electric arc, only ever on screen for a few frames */
export function spark(ctx, x, y, p, { a = 1, size = 1, color = D.volt } = {}) {
  if (p <= 0 || p >= 1 || a <= 0.002) return;
  const env = Math.sin(p * Math.PI);
  ctx.save();
  ctx.globalAlpha *= a * env;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5 * size;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 30 * env;
  let px = x - 46 * size;
  let py = y;
  ctx.beginPath();
  ctx.moveTo(px, py);
  for (let i = 0; i < 7; i++) {
    px += (92 / 7) * size;
    py = y + (noise1(i * 3.1 + p * 9) - 0.5) * 54 * size * (1 - i / 9);
    ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

/** rubber stamp: two passes, slight rotation, ink unevenness */
export function stamp(ctx, text, x, y, { a = 1, rot = -0.05, color = D.ember, size = 34, track = 5 } = {}) {
  if (a <= 0.002) return;
  const w = measure(ctx, text, size, F.mono6, track) + size * 1.6;
  const h = size * 2.1;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  fillRR(ctx, -w / 2, -h / 2, w, h, 8, hexA(color, 0.10));
  strokeRR(ctx, -w / 2, -h / 2, w, h, 8, hexA(color, 0.66), 3);
  tracking(ctx, text, 0, size * 0.36, {
    size, font: F.mono6, track, color: hexA(color, 0.94), align: 'center',
  });
  ctx.restore();
}

/** soft vignette that keeps the eye in the middle of the 9:16 frame */
export function vignette(ctx, a = 0.5) {
  ctx.save();
  ctx.fillStyle = radGrad(ctx, W / 2, H * 0.40, H * 0.26, H * 0.86, [
    [0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${a})`],
  ]);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** label used on the floor of the frame for a value that just changed */
export function stat(ctx, value, unit, x, y, { a = 1, size = 64, color = D.bone, align = 'left', sub = null } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const vw = measure(ctx, value, size, F.num, -2);
  const x0 = align === 'center' ? x - vw / 2 : align === 'right' ? x - vw : x;
  txt(ctx, value, x0, y, { size, font: F.num, color, align: 'left', track: -2 });
  if (unit) {
    tracking(ctx, unit, x0 + vw + 12, y, { size: size * 0.30, font: F.mono6, track: 4, color: hexA(color, 0.55) });
  }
  if (sub) tracking(ctx, sub, x0, y + size * 0.46, { size: 18, font: F.mono6, track: 3, color: hexA(color, 0.4) });
  ctx.restore();
}

/** progress ring: track + value arc, used for percentages and fractions */
export function ring(ctx, cx, cy, r, p, {
  a = 1, lw = 12, color = D.mint, track = 'rgba(214,228,240,0.12)', from = -Math.PI / 2,
} = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineCap = 'round';
  ctx.strokeStyle = track;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  if (p > 0.001) {
    ctx.strokeStyle = color;
    ctx.shadowColor = hexA(color, 0.7);
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, from, from + TAU * clamp(p));
    ctx.stroke();
  }
  ctx.restore();
}
