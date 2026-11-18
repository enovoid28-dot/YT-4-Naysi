import { W, H, txt, hexA, linGrad, radGrad, rr, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';
import { barcode } from '../engine/motion.mjs';

export const U = {
  ink: '#04060B', ink2: '#070C15', ink3: '#0C1420', plate: '#0A111C',
  line: 'rgba(210,226,240,0.14)', hair: 'rgba(210,226,240,0.07)',
  bone: '#F6F1E6', dim: 'rgba(246,241,230,0.55)', faint: 'rgba(246,241,230,0.28)',
  amber: '#F5B23C', amberHi: '#FFD79A', ember: '#E4573F', coral: '#FF8163',
  mint: '#58D8B4', cyan: '#9FC9E8',
  paper: '#F3E9D6', paper2: '#DCCFB4', paperInk: '#1A2029',
  leather: '#5B3B26', leather2: '#2A1A10',
};

export const ease = {
  out: (p) => EASE.outCubic(clamp(p)),
  expo: (p) => EASE.outExpo(clamp(p)),
  inOut: (p) => EASE.inOutQuad(clamp(p)),
  soft: (p) => EASE.smooth(clamp(p)),
};

export function studio(ctx, { t = 0, glow = U.amber, glowX = W * 0.5, glowY = 700, glowA = 0.13, horizon = 1240, a = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const g = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#03050A'], [0.34, U.ink2], [0.7, '#0A1220'], [1, '#05080E']]);
  ctx.fillStyle = g;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  const rg = radGrad(ctx, glowX, glowY, 0, Math.max(W, 1000) * 0.8, [[0, hexA(glow, glowA)], [0.4, hexA(glow, glowA * 0.28)], [1, hexA(glow, 0)]]);
  ctx.fillStyle = rg;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  const hg = linGrad(ctx, 0, horizon - 120, 0, horizon + 160, [[0, 'rgba(210,226,240,0)'], [0.45, 'rgba(210,226,240,0.07)'], [1, 'rgba(210,226,240,0)']]);
  ctx.fillStyle = hg;
  ctx.fillRect(0, horizon - 120, W, 280);
  for (const [bx, ph, sp] of [[250, 0, 0.11], [1090, 2, 0.085]]) {
    const x = bx + Math.sin(t * sp + ph) * 110;
    ctx.fillStyle = linGrad(ctx, x - 130, 0, x + 130, 0, [[0, 'rgba(220,235,250,0)'], [0.5, 'rgba(220,235,250,0.02)'], [1, 'rgba(220,235,250,0)']]);
    ctx.fillRect(x - 130, -200, 260, H + 400);
  }
  ctx.restore();
}

export function contact(ctx, cx, cy, rx, ry, a = 0.55) {
  const g = radGrad(ctx, cx, cy, 0, Math.max(rx, ry), [[0, `rgba(0,0,0,${a})`], [0.6, `rgba(0,0,0,${a * 0.45})`], [1, 'rgba(0,0,0,0)']]);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / Math.max(1, rx));
  ctx.translate(-cx, -cy);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(rx, ry), 0, TAU);
  ctx.fill();
  ctx.restore();
}

function tearPath(ctx, x, y, w, amp, step = 16) {
  ctx.lineTo(x + w, y);
  for (let px = x + w; px > x; px -= step) {
    ctx.lineTo(px - step / 2, y + (Math.sin(px * 0.7) > 0 ? amp : -amp * 0.4));
    ctx.lineTo(px - step, y);
  }
}

export function paper(ctx, x, y, w, h, { a = 1, rot = 0, torn = true, tint = U.paper, radius = 6 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  if (rot) ctx.rotate(rot);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 46;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - (torn ? 6 : radius));
  if (torn) tearPath(ctx, x, y + h - 6, w, 7);
  else {
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  }
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  const g = linGrad(ctx, x, y, x + w, y + h, [[0, 'rgba(255,255,255,0.30)'], [0.45, 'rgba(255,255,255,0.02)'], [1, 'rgba(90,70,40,0.16)']]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h - (torn ? 6 : 0));
  for (let i = 1; i <= 3; i++) {
    const yy = y + (h * i) / 4 + Math.sin(i * 2.1) * 12;
    ctx.fillStyle = 'rgba(120,96,60,0.05)';
    ctx.fillRect(x, yy, w, 2 + i);
  }
  ctx.restore();
}

export function receiptLine(ctx, x, y, w, left, right, { a = 1, size = 30, color = U.paperInk, dim = 0.55, bold = false, dotted = true } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const font = bold ? F.mono6 : F.mono;
  const rw = measure(ctx, right, size, font);
  txt(ctx, left, x, y, { size, font, color, alpha: dim });
  txt(ctx, right, x + w, y, { size, font: F.mono6, color, align: 'right' });
  if (dotted) {
    const x0 = x + measure(ctx, left, size, font) + 14;
    const x1 = x + w - rw - 14;
    ctx.fillStyle = hexA(color, 0.25);
    for (let px = x0; px < x1; px += 12) ctx.fillRect(px, y - 8, 3, 2);
  }
  ctx.restore();
}

export function phone(ctx, x, y, w, h, { a = 1, rot = 0, screen = '#0B1420' } = {}) {
  if (a <= 0.002) return;
  const r = w * 0.11;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot || 0);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 26;
  fillRR(ctx, x, y, w, h, r, '#0B1018');
  ctx.restore();
  strokeRR(ctx, x + 1.5, y + 1.5, w - 3, h - 3, r - 1, 'rgba(190,210,230,0.35)', 2.5);
  fillRR(ctx, x + 7, y + 7, w - 14, h - 14, r - 6, screen);
  ctx.fillStyle = radGrad(ctx, x + w * 0.5, y + h * 0.18, 0, h * 0.75, [[0, 'rgba(120,180,240,0.10)'], [1, 'rgba(120,180,240,0)']]);
  ctx.fillRect(x + 7, y + 7, w - 14, h - 14);
  fillRR(ctx, x + w / 2 - 58, y + 26, 116, 30, 15, '#05080D');
  ctx.save();
  ctx.beginPath();
  rr(ctx, x + 7, y + 7, w - 14, h - 14, r - 6);
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, x, y, x + w, y + h, [[0, 'rgba(255,255,255,0.10)'], [0.34, 'rgba(255,255,255,0.03)'], [0.5, 'rgba(255,255,255,0)']]);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.restore();
  return { sx: x + 7, sy: y + 7, sw: w - 14, sh: h - 14, r: r - 6 };
}

export function sneaker(ctx, cx, cy, s = 1, { a = 1, body = '#EDF1F6', accent = U.amber, sole = '#161E2A' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.fillStyle = sole;
  ctx.beginPath();
  ctx.moveTo(-104, 6);
  ctx.quadraticCurveTo(-112, 46, -76, 50);
  ctx.lineTo(72, 50);
  ctx.quadraticCurveTo(112, 46, 104, 4);
  ctx.quadraticCurveTo(96, 18, 60, 18);
  ctx.lineTo(-64, 18);
  ctx.quadraticCurveTo(-96, 18, -104, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  ctx.fillRect(-88, 36, 176, 4);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-98, 8);
  ctx.lineTo(-100, -34);
  ctx.quadraticCurveTo(-98, -76, -62, -82);
  ctx.quadraticCurveTo(-34, -86, -26, -60);
  ctx.quadraticCurveTo(-22, -44, -6, -38);
  ctx.quadraticCurveTo(34, -26, 66, -8);
  ctx.quadraticCurveTo(92, 2, 100, 8);
  ctx.lineTo(60, 16);
  ctx.lineTo(-64, 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(22,32,46,0.16)';
  ctx.beginPath();
  ctx.moveTo(-98, 8);
  ctx.lineTo(-100, -34);
  ctx.quadraticCurveTo(-98, -70, -66, -78);
  ctx.quadraticCurveTo(-52, -34, -44, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(22,32,46,0.40)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-62, -80);
  ctx.quadraticCurveTo(-34, -84, -26, -58);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-58, 4);
  ctx.quadraticCurveTo(-4, -8, 58, -22);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(22,32,46,0.55)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    const x0 = -30 + i * 18;
    ctx.beginPath();
    ctx.moveTo(x0, -52 + i * 6);
    ctx.lineTo(x0 + 17, -38 + i * 6);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(22,32,46,0.18)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(46, 10);
  ctx.quadraticCurveTo(52, -10, 44, -18);
  ctx.stroke();
  ctx.restore();
}

export function stamp(ctx, text, cx, cy, { a = 1, rot = -0.07, size = 96, color = U.ember, w = 0, h = 0, sub = null, scale = 1 } = {}) {
  if (a <= 0.002) return;
  const tw = w || measure(ctx, text, size, F.head, 4) + 96;
  const th = h || size * 1.76;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);
  ctx.strokeStyle = hexA(color, 0.92);
  ctx.lineWidth = 7;
  ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
  ctx.lineWidth = 2;
  ctx.strokeStyle = hexA(color, 0.55);
  ctx.strokeRect(cx - tw / 2 + 13, cy - th / 2 + 13, tw - 26, th - 26);
  txt(ctx, text, cx, cy + size * 0.34, { size, font: F.head, color, align: 'center', track: 4, alpha: 0.96 });
  if (sub) {
    tracking(ctx, sub, cx, cy + th / 2 - 20, { size: 19, font: F.mono6, track: 4, color: hexA(color, 0.8), align: 'center' });
  }
  ctx.globalAlpha *= 0.5;
  ctx.fillStyle = 'rgba(6,9,14,0.55)';
  for (let i = 0; i < 26; i++) {
    const px = cx - tw / 2 + ((i * 137) % tw);
    const py = cy - th / 2 + ((i * 71) % th);
    ctx.fillRect(px, py, 2 + (i % 4), 1.6);
  }
  ctx.restore();
}

export function penCircle(ctx, cx, cy, rx, ry, p, { color = U.ember, lw = 5, a = 1 } = {}) {
  if (a <= 0.002 || p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  const steps = 46;
  const n = Math.max(2, Math.floor(steps * clamp(p)));
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const th = (i / steps) * TAU * 1.06 - 0.5;
    const wob = 1 + Math.sin(th * 3.1) * 0.028;
    const x = cx + Math.cos(th) * rx * wob;
    const y = cy + Math.sin(th) * ry * wob;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

export const grp = (n) => String(Math.round(n)).replace(/\B(?=(?:\d{3})+(?!\d))/g, '.');

export function stub(ctx, x, y, w, h, { a = 1, label = '', value = '', color = U.paper, ink = U.paperInk, accent = U.ember } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  fillRR(ctx, x, y, w, h, 8, color);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = hexA(ink, 0.18);
  for (let px = x + 10; px < x + w - 8; px += 12) ctx.fillRect(px, y + h - 22, 6, 1.6);
  if (label) tracking(ctx, label, x + 12, y + 22, { size: 14, font: F.mono6, track: 2, color: hexA(ink, 0.5) });
  if (value) txt(ctx, value, x + 12, y + h - 32, { size: 22, font: F.num6, color: ink, track: -0.4 });
  ctx.fillStyle = hexA(accent, 0.9);
  ctx.fillRect(x, y, 6, h);
  ctx.restore();
}

export function inkBarcode(ctx, x, y, w, h, { a = 1, color = 'rgba(26,32,41,0.8)' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  barcode(ctx, x, y, w, h, { color, a: 1, seed: 9 });
  ctx.restore();
}

export function bokeh(ctx, t, { a = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const blobs = [
    { x: 120, y: 250, r: 54, c: U.amber, s: 0.21 },
    { x: 1320, y: 470, r: 72, c: U.cyan, s: 0.13 },
    { x: 1250, y: 1420, r: 44, c: U.amber, s: 0.17 },
  ];
  for (const b of blobs) {
    const x = b.x + Math.sin(t * b.s) * 22;
    const y = b.y + Math.cos(t * b.s * 1.3) * 16;
    const g = radGrad(ctx, x, y, 0, b.r, [[0, hexA(b.c, 0.10)], [0.55, hexA(b.c, 0.045)], [1, hexA(b.c, 0)]]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, b.r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
