/**
 * Episode 11 art kit — "Samudra · Kedalaman".
 *
 * Everything is drawn: a water column that loses light, god rays, marine snow,
 * a bathyscaphe, a hadal snailfish, an anglerfish, bathymetric contours. The
 * scenes animate these with the Naysi grammar (mono labels, rules, kinetic
 * numbers) so the film reads as one system, not nine pictures.
 */
import { W, H, C, txt, hexA, rr, fillRR, strokeRR, linGrad, radGrad, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng, noise1 } from '../engine/anim.mjs';

export const O = {
  void: '#010508',
  ink: '#020B10',
  deep: '#03161C',
  mid: '#062A33',
  teal: '#0B5560',
  aqua: '#1FBDB6',
  glow: '#7DF2E3',
  pale: '#CFEFEA',
  bone: '#F7F2E7',
  amber: '#FFB03A',
  amberHi: '#FFD27A',
  ember: '#FF6B1A',
  rust: '#C4563A',
  dust: '#9FC9C4',
};

export const TAU2 = TAU;

/** Easing curves that clamp first: EASE.* do not, and an overshoot of 8 is a
 *  silent transform off the canvas. */
export const EA = {
  out: (x) => EASE.outCubic(clamp(x)),
  quart: (x) => EASE.outQuart(clamp(x)),
  expo: (x) => EASE.outExpo(clamp(x)),
  inOut: (x) => EASE.inOutQuad(clamp(x)),
  smooth: (x) => EASE.smooth(clamp(x)),
};

/* ------------------------------- water ----------------------------------- */

/**
 * The water column. `k` 0 = just under the surface (teal, lit), 1 = hadal
 * (black). Colours are mixed by hand so the falloff feels photographic.
 */
export function column(ctx, k = 0.5, { y0 = -200, y1 = H + 200, t = 0, glowTop = 1 } = {}) {
  const top = k < 0.25 ? '#0C4B58' : k < 0.55 ? '#062633' : k < 0.8 ? '#03161E' : '#010A0F';
  const midc = k < 0.25 ? '#073440' : k < 0.55 ? '#04202A' : '#020E14';
  const bot = k < 0.55 ? '#021218' : '#01070B';
  const g = linGrad(ctx, 0, y0, 0, y1, [[0, top], [0.45, midc], [1, bot]]);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(-260, y0, W + 520, y1 - y0);
  if (glowTop > 0.01) {
    const rg = radGrad(ctx, W * 0.5, y0 - 120, 0, 1500, [
      [0, hexA(O.glow, 0.16 * glowTop * (1 - k))],
      [1, hexA(O.glow, 0)],
    ]);
    ctx.fillStyle = rg;
    ctx.fillRect(-260, y0, W + 520, y1 - y0);
  }
  ctx.restore();
  // slow caustic bands, only near the surface
  if (k < 0.4) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const y = 120 + i * 210 + Math.sin(t * 0.5 + i) * 24;
      const a = (0.05 - i * 0.009) * (1 - k * 2);
      if (a <= 0) continue;
      const g2 = linGrad(ctx, 0, y - 80, 0, y + 80, [[0, hexA(O.glow, 0)], [0.5, hexA(O.glow, a)], [1, hexA(O.glow, 0)]]);
      ctx.fillStyle = g2;
      ctx.fillRect(-260, y - 80, W + 520, 160);
    }
    ctx.restore();
  }
}

/** Light shafts falling from above; `a` fades them out with depth. */
export function rays(ctx, t, { x = W * 0.5, from = -160, len = 1800, n = 7, spread = 1200, a = 0.5, tilt = 0.16 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0.5 : i / (n - 1);
    const x0 = x + (u - 0.5) * spread + Math.sin(t * 0.28 + i * 1.7) * 26;
    const w0 = 26 + (i % 3) * 16;
    const w1 = w0 * 4.2;
    const sway = Math.sin(t * 0.22 + i * 2.1) * 40;
    const g = ctx.createLinearGradient(0, from, 0, from + len);
    const aa = a * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.6 + i * 1.3)));
    g.addColorStop(0, hexA(O.glow, aa * 0.34));
    g.addColorStop(0.35, hexA(O.glow, aa * 0.14));
    g.addColorStop(1, hexA(O.glow, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0 - w0 / 2, from);
    ctx.lineTo(x0 + w0 / 2, from);
    ctx.lineTo(x0 + tilt * len + w1 / 2 + sway, from + len);
    ctx.lineTo(x0 + tilt * len - w1 / 2 + sway, from + len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Marine snow: deterministic, no per-frame allocation. */
export function snow(ctx, t, { n = 130, seed = 7, a = 0.5, speed = 26, y0 = -100, y1 = H + 100, scale = 1 } = {}) {
  const r = rng(seed);
  const span = y1 - y0;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const bx = r() * (W + 240) - 120;
    const off = r();
    const sp = speed * (0.4 + off);
    const y = y0 + ((off * span + t * sp) % span);
    const drift = Math.sin(t * 0.5 + i * 0.7) * 16 + t * 6 * (0.3 + off * 0.4);
    const x = ((bx + drift) % (W + 240)) - 120;
    const sz = (0.9 + off * 2.1) * scale;
    const aa = a * (0.25 + off * 0.75);
    ctx.fillStyle = hexA(O.dust, aa * 0.9);
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, TAU2);
    ctx.fill();
  }
  ctx.restore();
}

/** A veil of dust catching a lamp — used around every light source. */
export function motes(ctx, x, y, r, { t = 0, a = 0.5, n = 26, seed = 3 } = {}) {
  const rr2 = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ang = rr2() * TAU2;
    const rad = Math.pow(rr2(), 0.6) * r;
    const px = x + Math.cos(ang) * rad + Math.sin(t * 0.7 + i) * 6;
    const py = y + Math.sin(ang) * rad * 0.8 + Math.cos(t * 0.5 + i) * 6;
    ctx.globalAlpha = a * (0.25 + rr2() * 0.75) * (1 - rad / r);
    ctx.fillStyle = O.glow;
    ctx.beginPath();
    ctx.arc(px, py, 1.4 + rr2() * 1.6, 0, TAU2);
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------ creatures -------------------------------- */

/** Anglerfish, side view, facing left. `lure` 0..1 pulses the esca. */
export function anglerfish(ctx, x, y, s, { t = 0, a = 1, lure = 1, flip = 0 } = {}) {
  const escaPos = { lx: x + (flip ? -1 : 1) * 58 * s, ly: y - 198 * s };
  if (a <= 0.01) return escaPos;
  const pulse = 0.55 + 0.45 * Math.sin(t * 3.1);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  // body
  ctx.beginPath();
  ctx.moveTo(-150, 6);
  ctx.bezierCurveTo(-120, -84, 40, -104, 118, -26);
  ctx.bezierCurveTo(150, 6, 140, 62, 92, 84);
  ctx.bezierCurveTo(20, 116, -108, 84, -150, 6);
  ctx.closePath();
  ctx.fillStyle = '#04090C';
  ctx.fill();
  // a cool rim so the silhouette separates from the water
  ctx.strokeStyle = hexA(O.glow, 0.30);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-146, 2);
  ctx.bezierCurveTo(-118, -82, 40, -102, 116, -26);
  ctx.stroke();
  // tail
  ctx.beginPath();
  ctx.moveTo(110, 30);
  ctx.quadraticCurveTo(190, 6 + Math.sin(t * 2.2) * 8, 206, -34);
  ctx.quadraticCurveTo(186, 34, 206, 92);
  ctx.quadraticCurveTo(170, 54, 112, 48);
  ctx.closePath();
  ctx.fill();
  // jaw + teeth
  ctx.beginPath();
  ctx.moveTo(-150, 6);
  ctx.quadraticCurveTo(-96, 30, -30, 24);
  ctx.quadraticCurveTo(-92, 62, -146, 34);
  ctx.closePath();
  ctx.fillStyle = '#070F13';
  ctx.fill();
  ctx.strokeStyle = 'rgba(220,240,235,0.55)';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 5; i++) {
    const u = i / 4;
    const bx = -138 + u * 92;
    const by = 10 + u * 12;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + 4, by + 10);
    ctx.stroke();
  }
  // illicium + esca
  ctx.strokeStyle = 'rgba(196,236,230,0.20)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-70, -84);
  ctx.quadraticCurveTo(-30, -190, 54, -196);
  ctx.stroke();
  // a dull eye
  ctx.beginPath();
  ctx.arc(-64, -46, 6, 0, TAU2);
  ctx.fillStyle = 'rgba(210,240,235,0.35)';
  ctx.fill();
  const lx = 58;
  const ly = -198;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = hexA(O.glow, 0.9);
  ctx.shadowBlur = 60 * pulse;
  const g = radGrad(ctx, lx, ly, 0, 60, [[0, hexA('#EAFFF8', 0.95 * lure)], [1, hexA(O.glow, 0)]]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(lx, ly, 60, 0, TAU2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = hexA('#F2FFFB', 0.9 * lure);
  ctx.beginPath();
  ctx.arc(lx, ly, 7 * (0.8 + pulse * 0.3), 0, TAU2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  return escaPos;
}

/** Hadal snailfish: pale, long, almost no pigment. */
export function snailfish(ctx, x, y, s, { t = 0, a = 1, flip = 0, tint = '#CFE6E2' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.beginPath();
  ctx.moveTo(-120, 0);
  ctx.bezierCurveTo(-72, -46, 60, -52, 118, -8);
  ctx.bezierCurveTo(60, 42, -70, 44, -120, 0);
  ctx.closePath();
  const g = linGrad(ctx, 0, -50, 0, 46, [[0, hexA(tint, 0.92)], [1, hexA(tint, 0.42)]]);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(112, -6);
  ctx.quadraticCurveTo(150 + Math.sin(t * 3) * 6, -46 + Math.sin(t * 3) * 10, 172, -20 + Math.sin(t * 3) * 12);
  ctx.quadraticCurveTo(152, 0, 170, 26 + Math.sin(t * 3) * 12);
  ctx.quadraticCurveTo(140, 12, 114, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(6,14,16,0.85)';
  ctx.beginPath();
  ctx.arc(-96, -10, 5, 0, TAU2);
  ctx.fill();
  ctx.restore();
}

/** Jellyfish with a pulsing bell and drifting tentacles. */
export function jelly(ctx, x, y, s, { t = 0, a = 1, hue = O.glow } = {}) {
  if (a <= 0.01) return;
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.9);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = radGrad(ctx, 0, 0, 0, 150, [[0, hexA(hue, 0.30)], [1, hexA(hue, 0)]]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 150, 0, TAU2);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 0, 84 + pulse * 6, 62 - pulse * 8, 0, Math.PI, TAU2);
  ctx.closePath();
  ctx.fillStyle = hexA(hue, 0.30);
  ctx.fill();
  ctx.strokeStyle = hexA(hue, 0.75);
  ctx.lineWidth = 2.5;
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const u = i / 8 - 0.5;
    ctx.beginPath();
    ctx.moveTo(u * 140, 2);
    for (let k = 1; k <= 6; k++) {
      const yy = k * 34;
      ctx.lineTo(u * 140 + Math.sin(t * 1.4 + k * 0.6 + i) * 16 * (k / 6), yy);
    }
    ctx.strokeStyle = hexA(hue, 0.34);
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------- vehicles -------------------------------- */

/** Bathyscaphe silhouette (Trieste-like): float, sphere, tower, window. */
export function bathyscaphe(ctx, x, y, s, { a = 1, t = 0, lamp = 1, window = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  // float (stabiliser filled with petrol)
  ctx.beginPath();
  ctx.moveTo(-108, -86);
  ctx.bezierCurveTo(-40, -128, 60, -128, 104, -82);
  ctx.bezierCurveTo(66, -58, -66, -58, -108, -86);
  ctx.closePath();
  ctx.fillStyle = '#0B1A20';
  ctx.fill();
  ctx.strokeStyle = 'rgba(160,210,205,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // sphere
  const g = radGrad(ctx, -18, 40, 0, 96, [[0, '#1A3038'], [0.6, '#0A161C'], [1, '#060D11']]);
  ctx.beginPath();
  ctx.arc(0, 46, 78, 0, TAU2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,200,196,0.30)';
  ctx.stroke();
  // conning tower bridging float and sphere
  fillRR(ctx, -26, -52, 52, 60, 9, '#12262C');
  strokeRR(ctx, -26, -52, 52, 60, 9, 'rgba(170,220,215,0.28)', 1.6);
  // porthole
  if (window > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.arc(-46, 34, 15, 0, TAU2);
    ctx.fillStyle = hexA(O.glow, 0.85 * window);
    ctx.fill();
    ctx.shadowColor = hexA(O.glow, 0.9);
    ctx.shadowBlur = 26 * window;
    ctx.beginPath();
    ctx.arc(-46, 34, 8, 0, TAU2);
    ctx.fill();
    ctx.restore();
  }
  if (lamp > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cone = 240;
    const lg = ctx.createLinearGradient(-10, 120, -10, 120 + cone);
    lg.addColorStop(0, hexA(O.pale, 0.30 * lamp));
    lg.addColorStop(1, hexA(O.pale, 0));
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(-16, 120);
    ctx.lineTo(16, 120);
    ctx.lineTo(90, 120 + cone);
    ctx.lineTo(-90, 120 + cone);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/* --------------------------------- HUD ----------------------------------- */

/**
 * Vertical depth ruler. `cur` and `max` in metres; the marker rides down.
 */
export function ruler(ctx, x, { y0 = 300, y1 = 1500, max = 11000, cur = 0, a = 1, ticks = 12, label = 'KEDALAMAN', color = O.dust, warm = O.amber } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const h = y1 - y0;
  ctx.strokeStyle = hexA(color, 0.35);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1);
  ctx.stroke();
  for (let i = 0; i <= ticks; i++) {
    const u = i / ticks;
    const y = y0 + u * h;
    const long = i % 3 === 0;
    ctx.strokeStyle = hexA(color, long ? 0.55 : 0.28);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (long ? 26 : 14), y);
    ctx.stroke();
    if (long) {
      const raw = u * max;
      const val = max <= 2000 ? Math.round(raw / 100) * 100 : Math.round(raw / 1000) * 1000;
      const label2 = max <= 2000 ? `${val} m` : `${(val / 1000).toString().replace('.', ',')} KM`;
      txt(ctx, label2, x + 38, y + 8, {
        size: 22, font: F.mono6, color: hexA(color, 0.6), track: 2,
      });
    }
  }
  // marker
  const u = clamp(cur / max);
  const my = y0 + u * h;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = radGrad(ctx, x, my, 0, 80, [[0, hexA(warm, 0.5)], [1, hexA(warm, 0)]]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, my, 80, 0, TAU2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = warm;
  ctx.beginPath();
  ctx.moveTo(x - 16, my);
  ctx.lineTo(x - 2, my - 9);
  ctx.lineTo(x - 2, my + 9);
  ctx.closePath();
  ctx.fill();
  txt(ctx, `${Math.round(cur).toLocaleString('id-ID')} m`, x - 26, my - 16, {
    size: 30, font: F.mono6, color: warm, track: 2, alpha: 0.95, align: 'right',
  });
  // caption of the scale, above the first tick
  if (label) tracking(ctx, label, x - 6, y0 - 26, { size: 19, font: F.mono6, track: 6, color: hexA(color, 0.45) });
  ctx.restore();
}

/** Thin animated rule that draws itself from x0 to x1. */
export function drawRule(ctx, x0, x1, y, p = 1, { color = O.dust, a = 0.5, lw = 1.5 } = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(lerp(x0, x1, clamp(p)), y);
  ctx.stroke();
  ctx.restore();
}

/** Bathymetric contour field: nested rings from a seeded radial noise. */
export function contours(ctx, { x = 0, y = 0, w = W, h = 700, seed = 9, n = 9, p = 1, color = O.aqua, a = 0.5, lw = 1.6 } = {}) {
  if (p <= 0.001) return;
  const r = rng(seed);
  const ph = [r() * 10, r() * 10, r() * 10];
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const maxR = Math.min(w, h) * 0.52;
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    if (k > p) break;
    const base = maxR * k;
    ctx.beginPath();
    const steps = 72;
    for (let sIdx = 0; sIdx <= steps; sIdx++) {
      const ang = (sIdx / steps) * TAU2;
      const wob = 1
        + 0.16 * Math.sin(ang * 3 + ph[0] + i * 0.3)
        + 0.09 * Math.sin(ang * 5 + ph[1] - i * 0.2)
        + 0.05 * Math.sin(ang * 9 + ph[2]);
      const rad = base * wob;
      const px = cx + Math.cos(ang) * rad * 1.25;
      const py = cy + Math.sin(ang) * rad * 0.72;
      if (sIdx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.globalAlpha = a * (0.9 - k * 0.55);
    ctx.stroke();
  }
  ctx.restore();
}
