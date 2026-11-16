import { W, H, txt, hexA, linGrad, radGrad, rr, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { clamp, lerp, EASE, TAU, noise1 } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';
import { barcode } from '../engine/motion.mjs';

// Art kit for the shipping episode. Everything here is drawn flat — no meshes,
// no perspective engines — but built out of the layers a photographer would
// light: base tone, fibre, edge occlusion, contact shadow, specular sweep.

export const K = {
  ink: '#05070B', ink2: '#0A0F16', ink3: '#111A24',
  bone: '#F6F1E4', dim: 'rgba(246,241,228,0.55)', faint: 'rgba(246,241,228,0.25)',
  kraft: '#C39A66', kraftHi: '#D9B684', kraftLo: '#96703F', kraftDark: '#5E4322',
  tape: '#E8C77A', tapeHi: '#FFF0C8',
  paper: '#F4EDDD', paperInk: '#1A1B1E',
  ember: '#E4573F', mint: '#63D3AE', cyan: '#9FC8E6', amber: '#F3B44A',
  van: '#2C3A46', vanHi: '#4E6070', tire: '#14181D',
  line: 'rgba(214,228,240,0.14)', hair: 'rgba(214,228,240,0.07)',
};

export const ease = {
  out: (p) => EASE.outCubic(clamp(p)),
  expo: (p) => EASE.outExpo(clamp(p)),
  inOut: (p) => EASE.inOutQuad(clamp(p)),
  soft: (p) => EASE.smooth(clamp(p)),
};

/** warehouse floor: cold concrete, one warm lamp, dust in the air */
export function depot(ctx, { t = 0, glowX = W * 0.5, glowY = 620, glowA = 0.12, a = 1, horizon = 1180 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#03060A'], [0.32, K.ink2], [0.68, '#0B121A'], [1, '#04070B']]);
  ctx.fillRect(-240, -240, W + 480, H + 480);
  ctx.fillStyle = radGrad(ctx, glowX, glowY, 0, Math.max(W, 1050) * 0.8, [
    [0, hexA(K.amber, glowA)], [0.42, hexA(K.amber, glowA * 0.24)], [1, hexA(K.amber, 0)],
  ]);
  ctx.fillRect(-240, -240, W + 480, H + 480);
  // concrete seam and a long specular streak on the floor
  ctx.fillStyle = linGrad(ctx, 0, horizon - 120, 0, horizon + 170, [
    [0, 'rgba(214,228,240,0)'], [0.45, 'rgba(214,228,240,0.07)'], [1, 'rgba(214,228,240,0)'],
  ]);
  ctx.fillRect(0, horizon - 120, W, 290);
  for (const [bx, ph, sp] of [[280, 0, 0.085], [1140, 2, 0.07]]) {
    const x = bx + Math.sin(t * sp + ph) * 110;
    ctx.fillStyle = linGrad(ctx, x - 130, 0, x + 130, 0, [
      [0, 'rgba(240,228,200,0)'], [0.5, 'rgba(240,228,200,0.02)'], [1, 'rgba(240,228,200,0)'],
    ]);
    ctx.fillRect(x - 130, -200, 260, H + 400);
  }
  ctx.restore();
}

export function contact(ctx, cx, cy, rx, ry, a = 0.6) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, Math.max(0.05, ry / Math.max(1, rx)));
  ctx.translate(-cx, -cy);
  ctx.fillStyle = radGrad(ctx, cx, cy, 0, Math.max(rx, ry), [
    [0, `rgba(0,0,0,${a})`], [0.55, `rgba(0,0,0,${a * 0.4})`], [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(rx, ry), 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** kraft fibre: a few hundred hairlines, deterministic per box seed */
function fibre(ctx, x, y, w, h, seed = 1, a = 0.10) {
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < 120; i++) {
    const r1 = noise1(seed * 31 + i * 7.1);
    const r2 = noise1(seed * 17 + i * 3.7);
    const yy = y + r1 * h;
    const xx = x + r2 * w * 0.9;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(70,44,16,0.55)';
    ctx.fillRect(xx, yy, 8 + r1 * 60, 1);
  }
  ctx.restore();
}

/**
 * A cardboard box. w/h are the front face; top and side are drawn with a
 * short, hand-made depth so it reads as an object rather than a rectangle.
 */
export function box(ctx, x, y, w, h, {
  a = 1, rot = 0, depth = 0.22, open = 0, label = null, tape = true,
  mark = null, tint = null, shade = 1, labelText = null,
} = {}) {
  if (a <= 0.002) return;
  const dx = w * depth * 0.5;
  const dy = -h * depth * 0.34;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-(x + w / 2), -(y + h / 2));

  // contact shadow on the floor
  contact(ctx, x + w / 2 + 20, y + h + 18, w * 0.62, h * 0.16, 0.55 * shade);

  // right / top faces
  ctx.fillStyle = tint || K.kraftLo;
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + dx, y + dy);
  ctx.lineTo(x + w + dx, y + h + dy);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tint || K.kraft;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx, y + dy);
  ctx.lineTo(x + w + dx, y + dy);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();

  // front face
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = tint || linGrad(ctx, x, y, x + w * 0.35, y + h, [
    [0, K.kraftHi], [0.45, K.kraft], [1, K.kraftLo],
  ]);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  fibre(ctx, x, y, w, h, (x + y) % 97 + 1, 0.09);

  // inner shadow on the two long edges
  ctx.fillStyle = linGrad(ctx, x, y, x, y + 26, [[0, 'rgba(60,36,12,0.28)'], [1, 'rgba(60,36,12,0)']]);
  ctx.fillRect(x, y, w, 26);
  ctx.fillStyle = linGrad(ctx, x, y + h - 30, x, y + h, [[0, 'rgba(60,36,12,0)'], [1, 'rgba(60,36,12,0.30)']]);
  ctx.fillRect(x, y + h - 30, w, 30);
  ctx.fillStyle = 'rgba(255,248,226,0.22)';
  ctx.fillRect(x, y, 2.5, h);
  ctx.fillRect(x, y, w, 2);

  // corrugated edge poking out at the bottom
  for (let px = x + 2; px < x + w - 2; px += 9) {
    ctx.fillStyle = 'rgba(92,64,30,0.35)';
    ctx.fillRect(px, y + h - 5, 4.5, 5);
  }

  // tape across the middle
  if (tape) {
    ctx.fillStyle = 'rgba(232,199,122,0.55)';
    ctx.fillRect(x, y + h * 0.46, w, 44);
    ctx.fillStyle = 'rgba(255,244,210,0.30)';
    ctx.fillRect(x, y + h * 0.46 + 3, w, 8);
    ctx.fillStyle = 'rgba(120,88,40,0.22)';
    ctx.fillRect(x, y + h * 0.46 + 40, w, 4);
  }

  // open flaps
  if (open > 0.01) {
    const f = open;
    ctx.fillStyle = linGrad(ctx, x, y - 40, x, y + 10, [[0, K.kraftLo], [1, K.kraft]]);
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x + w * 0.5, y - 70 * f);
    ctx.lineTo(x + w, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(30,18,6,0.55)';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 2);
    ctx.lineTo(x + w * 0.5, y - 44 * f);
    ctx.lineTo(x + w - 6, y + 2);
    ctx.closePath();
    ctx.fill();
  }

  // shipping label
  if (label) {
    const lw = Math.min(w * 0.62, 300);
    const lh = lw * 0.72;
    const lx = x + w * 0.5 - lw * 0.5;
    const ly = y + h * 0.10;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    fillRR(ctx, lx, ly, lw, lh, 3, K.paper);
    ctx.restore();
    barcode(ctx, lx + 12, ly + 10, lw - 24, lh * 0.30, { color: 'rgba(26,27,30,0.85)', a: 1, seed: 5 });
    ctx.fillStyle = 'rgba(26,27,30,0.5)';
    for (let i = 0; i < 4; i++) ctx.fillRect(lx + 12, ly + lh * 0.48 + i * 9, (lw - 24) * (0.9 - i * 0.14), 3);
    if (labelText) {
      txt(ctx, labelText, lx + lw / 2, ly + lh * 0.86, {
        size: 15, font: F.mono6, color: 'rgba(26,27,30,0.72)', align: 'center', track: 2,
      });
    }
  }

  // printed handling mark
  if (mark) {
    txt(ctx, mark, x + w * 0.5, y + h * 0.30, {
      size: 18, font: F.mono6, color: 'rgba(74,48,20,0.45)', align: 'center', track: 4,
    });
  }

  // specular sweep
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const sx = x - w * 0.5 + (w * 1.8) * ((0.35 + 0.25 * Math.sin(x * 0.01)) % 1);
  ctx.fillStyle = linGrad(ctx, sx - w * 0.2, 0, sx + w * 0.2, 0, [
    [0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,250,232,0.13)'], [1, 'rgba(255,255,255,0)'],
  ]);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.restore();
}

/** thermal shipping label as its own object (for close shots) */
export function resi(ctx, x, y, w, h, { a = 1, rot = 0, title = 'GRATIS ONGKIR', sub = 'ONGKIR 0', code = true } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  fillRR(ctx, x, y, w, h, 4, K.paper);
  ctx.restore();
  // printed header block
  fillRR(ctx, x + 10, y + 10, w - 20, 74, 3, 'rgba(26,27,30,0.06)');
  txt(ctx, title, x + w / 2, y + 58, { size: 34, font: F.head, color: K.paperInk, align: 'center', track: 3 });
  if (code) barcode(ctx, x + 14, y + 100, w - 28, 96, { color: 'rgba(26,27,30,0.9)', a: 1, seed: 12 });
  ctx.fillStyle = 'rgba(26,27,30,0.55)';
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 14, y + 214 + i * 13, (w - 28) * (0.86 - i * 0.16), 4);
  txt(ctx, sub, x + w / 2, y + h - 26, { size: 22, font: F.mono6, color: 'rgba(26,27,30,0.6)', align: 'center', track: 4 });
  // thermal grain
  ctx.fillStyle = 'rgba(26,27,30,0.05)';
  for (let i = 0; i < 60; i++) ctx.fillRect(x + noise1(i * 3.3) * w, y + noise1(i * 7.7 + 2) * h, 2, 1);
  ctx.restore();
}

export function weight(ctx, x, y, w, h, value, { a = 1 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  fillRR(ctx, x, y, w, h, 16, linGrad(ctx, x, y, x + w, y + h, [[0, '#39434F'], [0.5, '#212932'], [1, '#12181F']]));
  ctx.restore();
  // steel plate
  fillRR(ctx, x + 14, y + 14, w - 28, h * 0.52, 10, linGrad(ctx, x, y, x + w, y + h * 0.5, [
    [0, '#C9D4DE'], [0.35, '#8E9BA8'], [0.6, '#E6EDF3'], [1, '#6E7A86'],
  ]));
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x + 30, y + 26, w - 60, 3);
  // LCD
  const lx = x + w * 0.16;
  const ly = y + h * 0.60;
  const lw = w * 0.68;
  const lh = h * 0.26;
  fillRR(ctx, lx, ly, lw, lh, 6, '#0A1712');
  ctx.save();
  ctx.shadowColor = hexA(K.mint, 0.6);
  ctx.shadowBlur = 18;
  txt(ctx, value, lx + lw - 16, ly + lh * 0.74, {
    size: lh * 0.72, font: F.num6, color: K.mint, align: 'right', track: 1,
  });
  ctx.restore();
  txt(ctx, 'KG', lx + 14, ly + lh * 0.70, { size: lh * 0.30, font: F.mono6, color: hexA(K.mint, 0.55), track: 3 });
  ctx.restore();
}

/** courier van, side view, flat but lit */
export function van(ctx, x, y, w, { a = 1, tilt = 0, motion = 0 } = {}) {
  if (a <= 0.002) return;
  const h = w * 0.42;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(tilt);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  contact(ctx, x + w / 2, y + h + 12, w * 0.55, h * 0.14, 0.6);

  // cargo body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 12;
  fillRR(ctx, x, y, w * 0.74, h * 0.78, 12, linGrad(ctx, x, y, x + w, y + h, [[0, K.vanHi], [0.5, K.van], [1, '#161E26']]));
  ctx.restore();
  // cab
  ctx.fillStyle = linGrad(ctx, x + w * 0.74, y + h * 0.16, x + w, y + h, [[0, K.vanHi], [1, '#1B242D']]);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.74, y + h * 0.78);
  ctx.lineTo(x + w * 0.74, y + h * 0.30);
  ctx.quadraticCurveTo(x + w * 0.78, y + h * 0.06, x + w * 0.90, y + h * 0.08);
  ctx.quadraticCurveTo(x + w * 0.99, y + h * 0.10, x + w, y + h * 0.30);
  ctx.lineTo(x + w, y + h * 0.78);
  ctx.closePath();
  ctx.fill();
  // windscreen
  ctx.fillStyle = 'rgba(160,205,235,0.35)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.77, y + h * 0.34);
  ctx.lineTo(x + w * 0.79, y + h * 0.16);
  ctx.lineTo(x + w * 0.94, y + h * 0.18);
  ctx.lineTo(x + w * 0.97, y + h * 0.34);
  ctx.closePath();
  ctx.fill();
  // side panel seam + logo plate
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + w * 0.03, y + h * 0.52, w * 0.68, 3);
  fillRR(ctx, x + w * 0.10, y + h * 0.22, w * 0.26, h * 0.26, 6, 'rgba(246,241,228,0.10)');
  tracking(ctx, 'KIRIM', x + w * 0.23, y + h * 0.40, {
    size: h * 0.13, font: F.head, track: 5, color: hexA(K.bone, 0.65), align: 'center',
  });
  // wheels
  for (const wx of [x + w * 0.16, x + w * 0.82]) {
    ctx.fillStyle = K.tire;
    ctx.beginPath();
    ctx.arc(wx, y + h * 0.86, h * 0.16, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,214,226,0.55)';
    ctx.beginPath();
    ctx.arc(wx, y + h * 0.86, h * 0.07, 0, TAU);
    ctx.fill();
  }
  // motion streaks
  if (motion > 0) {
    ctx.globalAlpha = a * motion * 0.4;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(220,235,250,0.5)';
      ctx.fillRect(x - 90 - i * 46, y + h * (0.30 + i * 0.18), 110, 3);
    }
  }
  ctx.restore();
}

export function grainOverlay(ctx, t, { a = 0.05 } = {}) {
  ctx.save();
  ctx.globalAlpha = a;
  for (let i = 0; i < 90; i++) {
    const x = (noise1(i * 2.7 + Math.floor(t * 12) * 0.31) * W);
    const y = (noise1(i * 5.3 + Math.floor(t * 12) * 0.17) * H);
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();
}

/** measurement callout: a dimension line with ticks and a label */
export function dim(ctx, x1, y1, x2, y2, label, { a = 1, color = K.cyan, flip = false, size = 20 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1);
  for (const [px, py] of [[x1, y1], [x2, y2]]) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 0);
    ctx.stroke();
    ctx.restore();
  }
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  tracking(ctx, label, mx, my + (flip ? -14 : 26), {
    size, font: F.mono6, track: 3, color, align: 'center',
  });
  ctx.restore();
}

/** real caption start time for card i, so every beat lands on the spoken word */
export const cue = (scene, i, off = 0) => {
  const c = scene && scene.captions && scene.captions[i];
  return (c ? c.from : 0) + off;
};

/** soft vignette that keeps attention on the middle of the frame */
export function vignette(ctx, a = 0.55) {
  ctx.save();
  const g = radGrad(ctx, W / 2, H * 0.42, H * 0.30, H * 0.85, [
    [0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${a})`],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
