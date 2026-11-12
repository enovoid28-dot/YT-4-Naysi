/**
 * Episode 11 art kit — "Samudra · Kedalaman".
 *
 * Realism here is material and light, not glow: rock has strata, silt has
 * ripples, steel has a brushed grain, and every lamp has a falloff curve. All of
 * it is drawn — no 3D, no particles, no bloom.
 */
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, txt, hexA, rr, fillRR, strokeRR, linGrad, radGrad, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng, noise1 } from '../engine/anim.mjs';

export const O = {
  void: '#010405',
  ink: '#02070A',
  deep: '#04121A',
  mid: '#07222A',
  teal: '#0C4650',
  // A cold grey-blue for hairlines, and a warm white for light. Nothing here
  // glows on its own: colour only appears where a lamp actually reaches.
  aqua: '#8FAEB2',
  glow: '#DCE7E3',
  pale: '#E3EAE6',
  bone: '#F5F1E6',
  amber: '#E8A34A',
  amberHi: '#F2C583',
  ember: '#C9713B',
  rust: '#9C5A3E',
  dust: '#93A8A6',
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

/* ------------------------------- texture --------------------------------- */

const smoothstep = (v) => v * v * (3 - 2 * v);

/** Value-noise tile, baked once. `mode='gray'` for 'overlay' passes, 'alpha'
 *  for 'screen'. No per-frame cost. */
function noiseTile(size, octaves, seed, { stretch = [1, 1], mode = 'gray', contrast = 1, bias = 0 } = {}) {
  const cv = createCanvas(size, size);
  const cx = cv.getContext('2d');
  const img = cx.createImageData(size, size);
  const r = rng(seed);
  const layers = octaves.map((o) => {
    const n = o.g;
    const a = new Float32Array(n * n);
    for (let i = 0; i < a.length; i++) a[i] = r();
    return { n, a, amp: o.amp };
  });
  const [sx, sy] = stretch;
  const smp = (L, i, j) => L.a[(((j % L.n) + L.n) % L.n) * L.n + (((i % L.n) + L.n) % L.n)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      let tot = 0;
      for (const L of layers) {
        const fx = (x / size) * sx * L.n;
        const fy = (y / size) * sy * L.n;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = smoothstep(fx - x0);
        const ty = smoothstep(fy - y0);
        const v0 = smp(L, x0, y0) + (smp(L, x0 + 1, y0) - smp(L, x0, y0)) * tx;
        const v1 = smp(L, x0, y0 + 1) + (smp(L, x0 + 1, y0 + 1) - smp(L, x0, y0 + 1)) * tx;
        v += (v0 + (v1 - v0) * ty) * L.amp;
        tot += L.amp;
      }
      v = clamp((v / tot - 0.5) * contrast + 0.5 + bias);
      const p = (y * size + x) * 4;
      if (mode === 'gray') {
        const g = Math.round(v * 255);
        img.data[p] = g;
        img.data[p + 1] = g;
        img.data[p + 2] = g;
        img.data[p + 3] = 255;
      } else {
        img.data[p] = 255;
        img.data[p + 1] = 255;
        img.data[p + 2] = 255;
        img.data[p + 3] = Math.round(v * 255);
      }
    }
  }
  cx.putImageData(img, 0, 0);
  return cv;
}

let TEX = null;
function tex() {
  if (TEX) return TEX;
  TEX = {
    // coarse rock with a strong vertical bedding
    rock: noiseTile(256, [{ g: 4, amp: 1 }, { g: 11, amp: 0.62 }, { g: 31, amp: 0.34 }, { g: 74, amp: 0.16 }], 41, { stretch: [1, 2.6], contrast: 1.55 }),
    // fine sediment, stretched horizontally
    silt: noiseTile(256, [{ g: 3, amp: 1 }, { g: 9, amp: 0.5 }, { g: 26, amp: 0.26 }], 53, { stretch: [5, 1], contrast: 1.45 }),
    // brushed steel
    steel: noiseTile(256, [{ g: 2, amp: 1 }, { g: 6, amp: 0.55 }, { g: 19, amp: 0.22 }], 61, { stretch: [7, 1], contrast: 1.25 }),
    // soft water haze
    haze: noiseTile(256, [{ g: 3, amp: 1 }, { g: 8, amp: 0.5 }], 67, { stretch: [1.5, 1], contrast: 1.15 }),
  };
  return TEX;
}

/** Composite a baked material over a rect. `s` scales the grain. */
export function material(ctx, name, { x = 0, y = 0, w = W, h = H, a = 0.4, mode = 'overlay', s = 1 } = {}) {
  if (a <= 0.002) return;
  const t = tex()[name];
  if (!t) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  if (s !== 1) ctx.scale(s, s);
  ctx.fillStyle = ctx.createPattern(t, 'repeat');
  ctx.fillRect(0, 0, w / s + 2, h / s + 2);
  ctx.restore();
}

/* ------------------------------- water ----------------------------------- */

/**
 * The water column. `k` 0 = just under the surface (teal, lit), 1 = hadal
 * (black). Colours are mixed by hand so the falloff feels photographic.
 */
export function column(ctx, k = 0.5, { y0 = -200, y1 = H + 200, t = 0, glowTop = 1 } = {}) {
  const top = k < 0.25 ? '#0D3E48' : k < 0.55 ? '#07242C' : k < 0.8 ? '#041017' : '#020A0E';
  const midc = k < 0.25 ? '#082E36' : k < 0.55 ? '#051B22' : '#030D12';
  const bot = k < 0.55 ? '#031015' : '#010609';
  const g = linGrad(ctx, 0, y0, 0, y1, [[0, top], [0.45, midc], [1, bot]]);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(-260, y0, W + 520, y1 - y0);
  if (glowTop > 0.01) {
    const rg = radGrad(ctx, W * 0.5, y0 - 120, 0, 1500, [
      [0, hexA(O.pale, 0.10 * glowTop * (1 - k))],
      [1, hexA(O.glow, 0)],
    ]);
    ctx.fillStyle = rg;
    ctx.fillRect(-260, y0, W + 520, y1 - y0);
  }
  ctx.restore();
  material(ctx, 'haze', { x: -200, y: y0, w: W + 400, h: y1 - y0, a: 0.16, s: 1.6 });
  // slow caustic bands, only near the surface
  if (k < 0.4) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const y = 120 + i * 210 + Math.sin(t * 0.5 + i) * 24;
      const a = (0.028 - i * 0.005) * (1 - k * 2);
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
    const aa = a * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.35 + i * 1.3)));
    g.addColorStop(0, hexA('#EAF1EC', aa * 0.20));
    g.addColorStop(0.4, hexA('#EAF1EC', aa * 0.065));
    g.addColorStop(1, hexA('#EAF1EC', 0));
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

/**
 * A lamp cone with a real falloff: bright at the source, dust extinction along
 * the beam, and a lit pool where it lands. No bloom.
 */
export function beam(ctx, x, y, { len = 700, spread = 0.42, ang = Math.PI / 2, a = 0.5, color = O.pale, pool = 1 } = {}) {
  if (a <= 0.01) return;
  const w0 = 14;
  const w1 = Math.tan(spread) * len;
  const ex = x + Math.cos(ang) * len;
  const ey = y + Math.sin(ang) * len;
  const nx = Math.cos(ang + Math.PI / 2);
  const ny = Math.sin(ang + Math.PI / 2);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(x, y, ex, ey);
  g.addColorStop(0, hexA(color, 0.34 * a));
  g.addColorStop(0.25, hexA(color, 0.16 * a));
  g.addColorStop(0.75, hexA(color, 0.055 * a));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x + nx * w0, y + ny * w0);
  ctx.lineTo(x - nx * w0, y - ny * w0);
  ctx.lineTo(ex - nx * w1, ey - ny * w1);
  ctx.lineTo(ex + nx * w1, ey + ny * w1);
  ctx.closePath();
  ctx.fill();
  if (pool > 0.01) {
    const rg = radGrad(ctx, ex, ey, 0, w1 * 1.5, [[0, hexA(color, 0.10 * a * pool)], [1, hexA(color, 0)]]);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(ex, ey, w1 * 1.5, w1 * 0.6, 0, 0, TAU2);
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------ sea floor -------------------------------- */

/**
 * Silt plain: a soft gradient, ripples that follow the ground, talus and a few
 * boulders. Deterministic, textured, no sprites.
 */
export function seabed(ctx, y, t, { seed = 5, spread = 1, rocks = 1, a = 1, tint = '#0A1A1E' } = {}) {
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  const g = linGrad(ctx, 0, y - 30, 0, y + 420, [[0, tint], [0.4, '#050E12'], [1, '#02080B']]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-280, y + 40);
  for (let x = -280; x <= W + 280; x += 40) {
    const yy = y + Math.sin(x * 0.0021 + seed) * 16 + Math.sin(x * 0.0069 + seed * 2) * 7;
    ctx.lineTo(x, yy);
  }
  ctx.lineTo(W + 280, H + 300);
  ctx.lineTo(-280, H + 300);
  ctx.closePath();
  ctx.fill();
  material(ctx, 'silt', { x: -280, y: y - 40, w: W + 560, h: 900, a: 0.22, s: 2.4 });

  // ripples: irregular, low contrast — silt, not corrugation
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  let yy = y + 6;
  for (let i = 0; i < 54; i++) {
    yy += 4 + r() * 16;
    if (yy > H + 200) break;
    const al = (0.035 - i * 0.0004) * a;
    if (al <= 0) break;
    ctx.strokeStyle = hexA(O.dust, al);
    ctx.lineWidth = 0.8 + r() * 1.6;
    ctx.beginPath();
    for (let x = -240; x <= W + 240; x += 18) {
      const dy = Math.sin(x * 0.006 * spread + i * 1.3 + t * 0.04) * (1.5 + r() * 3);
      if (x === -240) ctx.moveTo(x, yy + dy);
      else ctx.lineTo(x, yy + dy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // boulders: a lit cap, a shadow under, and a little talus
  for (let i = 0; i < 18 * rocks; i++) {
    const x = r() * (W + 340) - 170;
    const by = y + 24 + Math.pow(r(), 1.6) * 330;
    const rw = 16 + r() * 52;
    const rh = rw * (0.28 + r() * 0.2);
    ctx.beginPath();
    ctx.ellipse(x, by + rh * 0.7, rw * 1.15, rh * 0.8, 0, 0, TAU2);
    ctx.fillStyle = `rgba(1,6,8,${0.35 + r() * 0.3})`;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, by, rw, rh, 0, 0, TAU2);
    ctx.fillStyle = `rgba(5,13,15,${0.55 + r() * 0.35})`;
    ctx.fill();
    ctx.strokeStyle = hexA(O.dust, 0.14 + r() * 0.12);
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(x, by, rw, rh, 0, Math.PI * 1.02, TAU2 * 0.99);
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------ creatures -------------------------------- */

/** Anglerfish, side view, facing left. `lure` 0..1 pulses the esca. */
export function anglerfish(ctx, x, y, s, { t = 0, a = 1, lure = 1, flip = 0 } = {}) {
  const escaPos = { lx: x + (flip ? -1 : 1) * 60 * s, ly: y - 196 * s };
  if (a <= 0.01) return escaPos;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);

  // caudal fin, stiff and fan-shaped
  ctx.beginPath();
  ctx.moveTo(84, 18);
  ctx.bezierCurveTo(140, -6 + Math.sin(t * 1.8) * 5, 188, -44, 206, -58);
  ctx.bezierCurveTo(184, -14, 186, 22, 202, 74);
  ctx.bezierCurveTo(162, 46, 124, 42, 86, 46);
  ctx.closePath();
  ctx.fillStyle = '#020709';
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,196,188,0.12)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // dorsal spines
  ctx.strokeStyle = 'rgba(150,196,188,0.20)';
  ctx.lineWidth = 2.6;
  for (let i = 0; i < 7; i++) {
    const u = i / 6;
    const bx = -46 + u * 110;
    const by = -88 - Math.sin(u * Math.PI) * 16;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + 8, by - 26 + u * 8);
    ctx.stroke();
  }

  // body: heavy head, humped back, tapering to the peduncle
  ctx.beginPath();
  ctx.moveTo(-178, 8);
  ctx.bezierCurveTo(-172, -42, -140, -74, -94, -86);
  ctx.bezierCurveTo(-38, -100, 40, -94, 90, -52);
  ctx.bezierCurveTo(116, -30, 116, 12, 92, 44);
  ctx.bezierCurveTo(46, 84, -42, 94, -96, 72);
  ctx.bezierCurveTo(-142, 54, -172, 34, -178, 8);
  ctx.closePath();
  const bodyG = linGrad(ctx, 0, -104, 0, 96, [[0, '#04090C'], [0.5, '#020608'], [1, '#010405']]);
  ctx.fillStyle = bodyG;
  ctx.fill();
  ctx.save();
  ctx.clip();
  material(ctx, 'steel', { x: -184, y: -106, w: 340, h: 210, a: 0.24, s: 2.6 });
  // the lure's own light on the snout and forehead: the only readable fill
  const fill = radGrad(ctx, 40, -170, 0, 340, [[0, 'rgba(214,232,224,0.10)'], [1, 'rgba(214,232,224,0)']]);
  ctx.fillStyle = fill;
  ctx.fillRect(-190, -200, 400, 320);
  ctx.restore();

  // rim light along the back
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const rim = ctx.createLinearGradient(-160, -60, 90, -96);
  rim.addColorStop(0, hexA(O.glow, 0.10));
  rim.addColorStop(0.45, hexA(O.glow, 0.52));
  rim.addColorStop(0.8, hexA(O.glow, 0.22));
  rim.addColorStop(1, hexA(O.glow, 0.05));
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-172, -12);
  ctx.bezierCurveTo(-168, -44, -138, -74, -94, -86);
  ctx.bezierCurveTo(-38, -99, 40, -93, 90, -52);
  ctx.stroke();
  ctx.restore();

  // gill cover + pectoral fin
  ctx.strokeStyle = 'rgba(150,196,188,0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-44, -50);
  ctx.quadraticCurveTo(-16, -6, -46, 52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-30, 22);
  ctx.quadraticCurveTo(4, 44 + Math.sin(t * 2.1) * 5, -6, 78);
  ctx.quadraticCurveTo(-42, 48, -30, 22);
  ctx.fillStyle = 'rgba(5,14,15,0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,196,188,0.14)';
  ctx.stroke();

  // The jaw is only a shadow line: the animal is backlit by its own lure, so
  // the head reads as a mass with a lit back, not as a face.
  ctx.beginPath();
  ctx.moveTo(-186, 2);
  ctx.bezierCurveTo(-150, 16, -108, 12, -66, -2);
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // two teeth catching the lure, nothing more
  ctx.strokeStyle = 'rgba(212,230,222,0.30)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-168, 6);
  ctx.lineTo(-166, 16);
  ctx.moveTo(-140, 11);
  ctx.lineTo(-138.5, 19);
  ctx.stroke();

  // a few head spines, so the skull is not a smooth balloon
  ctx.strokeStyle = 'rgba(150,192,184,0.22)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const u = i / 4;
    const bx = -120 + u * 66;
    const by = -78 + u * 16;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - 6 + u * 4, by - 16 + u * 6);
    ctx.stroke();
  }

  // illicium
  ctx.strokeStyle = 'rgba(168,208,200,0.22)';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-92, -80);
  ctx.bezierCurveTo(-54, -168, 4, -212, 60, -196);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(196,230,222,0.30)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // eye: small and dark, with one specular
  ctx.beginPath();
  ctx.arc(-150, -16, 6.5, 0, TAU2);
  ctx.fillStyle = 'rgba(120,164,158,0.10)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-150, -16, 4.2, 0, TAU2);
  ctx.fillStyle = 'rgba(186,216,210,0.22)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-150, -16, 2.4, 0, TAU2);
  ctx.fillStyle = '#02070A';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-150.8, -16.9, 0.9, 0, TAU2);
  ctx.fillStyle = 'rgba(240,250,246,0.7)';
  ctx.fill();

  // esca: a small dense bulb, no halo
  const lx = 60;
  const ly = -196;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const lg = radGrad(ctx, lx, ly, 0, 42, [[0, hexA('#F7FAF3', 0.26 * lure)], [0.4, hexA('#E6EFE6', 0.08 * lure)], [1, hexA('#E6EFE6', 0)]]);
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.arc(lx, ly, 42, 0, TAU2);
  ctx.fill();
  ctx.fillStyle = hexA('#FBDFC6', 0.95 * lure);
  ctx.beginPath();
  ctx.arc(lx, ly, 6.2 * (0.92 + pulse * 0.12), 0, TAU2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  return escaPos;
}

/** Hadal snailfish: pale, gelatinous, almost no pigment. */
export function snailfish(ctx, x, y, s, { t = 0, a = 1, flip = 0, tint = '#CFE0DA' } = {}) {
  if (a <= 0.01) return;
  const wig = Math.sin(t * 2.2);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);

  // body: a long taper, head heavy
  ctx.beginPath();
  ctx.moveTo(-150, 2);
  ctx.bezierCurveTo(-140, -34, -76, -52, -6, -46);
  ctx.bezierCurveTo(62, -40, 116, -22, 150, -6 + wig * 4);
  ctx.bezierCurveTo(118, 20, 60, 32, -6, 30);
  ctx.bezierCurveTo(-78, 28, -142, 26, -150, 2);
  ctx.closePath();
  const g = linGrad(ctx, 0, -52, 0, 34, [[0, hexA(tint, 0.80)], [0.5, hexA(tint, 0.62)], [1, hexA(tint, 0.34)]]);
  ctx.fillStyle = g;
  ctx.fill();

  // translucent fin fold: continuous along the back and belly
  ctx.beginPath();
  ctx.moveTo(-120, -42);
  ctx.bezierCurveTo(-40, -62, 74, -44, 152, -8 + wig * 4);
  ctx.bezierCurveTo(92, -18, -30, -30, -124, -32);
  ctx.closePath();
  ctx.fillStyle = hexA(tint, 0.26);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-118, 26);
  ctx.bezierCurveTo(-20, 44, 80, 28, 150, -2 + wig * 4);
  ctx.bezierCurveTo(70, 16, -20, 26, -120, 16);
  ctx.closePath();
  ctx.fillStyle = hexA(tint, 0.20);
  ctx.fill();

  // tail
  ctx.beginPath();
  ctx.moveTo(140, -10 + wig * 4);
  ctx.quadraticCurveTo(176 + wig * 5, -40 + wig * 8, 196, -16 + wig * 8);
  ctx.quadraticCurveTo(180, 4, 198, 26 + wig * 8);
  ctx.quadraticCurveTo(168, 18, 142, 6 + wig * 4);
  ctx.closePath();
  ctx.fillStyle = hexA(tint, 0.42);
  ctx.fill();

  // gill slit + eye
  ctx.strokeStyle = hexA('#7E9B96', 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-96, -34);
  ctx.quadraticCurveTo(-88, 4, -98, 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-134, -8, 5.5, 0, TAU2);
  ctx.fillStyle = 'rgba(6,14,16,0.9)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-136, -10, 1.8, 0, TAU2);
  ctx.fillStyle = 'rgba(240,248,244,0.7)';
  ctx.fill();

  // faint spine shadow through the skin
  ctx.strokeStyle = hexA('#7E9B96', 0.18);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-120, -14);
  ctx.bezierCurveTo(-40, -26, 70, -18, 146, -6 + wig * 4);
  ctx.stroke();
  ctx.restore();
}

/** Jellyfish with a scalloped bell, oral arms and drifting tentacles. */
export function jelly(ctx, x, y, s, { t = 0, a = 1, hue = '#C9D8D2' } = {}) {
  if (a <= 0.01) return;
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.7);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);

  // tentacles first, behind the bell
  for (let i = 0; i < 7; i++) {
    const u = i / 6 - 0.5;
    ctx.beginPath();
    ctx.moveTo(u * 128, 6);
    for (let k = 1; k <= 8; k++) {
      const yy = k * 30;
      const xx = u * 128 * (1 - k * 0.03) + Math.sin(t * 1.1 + k * 0.5 + i * 1.3) * 18 * (k / 8);
      ctx.lineTo(xx, yy);
    }
    ctx.strokeStyle = hexA(hue, 0.20);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  // oral arms: thicker, frilled
  for (let i = 0; i < 4; i++) {
    const u = (i / 3 - 0.5) * 0.7;
    ctx.beginPath();
    ctx.moveTo(u * 90, 4);
    ctx.bezierCurveTo(u * 70 + 16, 60, u * 50 - 22, 96, u * 40 + Math.sin(t * 1.3 + i) * 14, 150);
    ctx.strokeStyle = hexA(hue, 0.26);
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // bell: dome with a scalloped margin
  const rw = 84 + pulse * 5;
  const rh = 66 - pulse * 7;
  ctx.beginPath();
  ctx.moveTo(-rw, 0);
  ctx.bezierCurveTo(-rw, -rh * 1.35, rw, -rh * 1.35, rw, 0);
  for (let i = 4; i >= 0; i--) {
    const u = i / 4;
    const px = -rw + u * rw * 2;
    ctx.quadraticCurveTo(px + rw / 4, 12 - Math.sin(u * Math.PI) * 6, px, 0);
  }
  ctx.closePath();
  const bg = radGrad(ctx, -24, -rh * 0.7, 4, rw * 1.7, [
    [0, hexA(hue, 0.42)], [0.5, hexA(hue, 0.20)], [1, hexA(hue, 0.10)],
  ]);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = hexA(hue, 0.52);
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // internal canals
  ctx.strokeStyle = hexA(hue, 0.22);
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) {
    const u = (i / 4 - 0.5) * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -rh * 0.95);
    ctx.quadraticCurveTo(u * rw * 0.7, -rh * 0.35, u * rw * 1.4, 0);
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------- vehicles -------------------------------- */

/** Bathyscaphe (Trieste-like): petrol float, tower, sphere, lamps. */
export function bathyscaphe(ctx, x, y, s, { a = 1, t = 0, lamp = 1, window = 1, hull = true } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);

  // petrol float
  ctx.beginPath();
  ctx.moveTo(-116, -74);
  ctx.bezierCurveTo(-70, -122, 66, -122, 112, -70);
  ctx.bezierCurveTo(84, -46, -84, -46, -116, -74);
  ctx.closePath();
  ctx.fillStyle = '#0B1B20';
  ctx.fill();
  material(ctx, 'steel', { x: -120, y: -125, w: 240, h: 85, a: 0.30, s: 2 });
  ctx.strokeStyle = 'rgba(168,212,204,0.34)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // float ribs
  ctx.strokeStyle = 'rgba(150,196,190,0.16)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) {
    const px = -90 + i * 45;
    ctx.beginPath();
    ctx.moveTo(px, -78 - Math.sin(((px + 90) / 180) * Math.PI) * 26);
    ctx.lineTo(px, -50);
    ctx.stroke();
  }
  // petrol fill line
  ctx.strokeStyle = 'rgba(190,226,220,0.12)';
  ctx.beginPath();
  ctx.moveTo(-96, -78);
  ctx.quadraticCurveTo(0, -66, 96, -76);
  ctx.stroke();

  // tower
  ctx.fillStyle = '#0E2026';
  fillRR(ctx, -24, -58, 48, 52, 6, '#0E2026');
  material(ctx, 'steel', { x: -24, y: -58, w: 48, h: 52, a: 0.35, s: 1.2 });
  strokeRR(ctx, -24, -58, 48, 52, 6, 'rgba(172,216,208,0.30)', 1.6);
  ctx.strokeStyle = 'rgba(150,196,190,0.22)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-24, -40);
  ctx.lineTo(24, -40);
  ctx.stroke();

  // sphere
  const g = radGrad(ctx, -26, 26, 6, 96, [[0, '#22424A'], [0.45, '#0E2026'], [1, '#060D11']]);
  ctx.beginPath();
  ctx.arc(0, 40, 62, 0, TAU2);
  ctx.fillStyle = g;
  ctx.fill();
  material(ctx, 'steel', { x: -62, y: -22, w: 124, h: 124, a: 0.26, s: 0.9 });
  ctx.strokeStyle = 'rgba(160,206,198,0.34)';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  // weld seam
  ctx.strokeStyle = 'rgba(150,196,190,0.16)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 40, 62, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  if (hull) {
    // ballast tubes
    ctx.fillStyle = '#0A171C';
    fillRR(ctx, -96, 14, 26, 62, 10, '#0A171C');
    fillRR(ctx, 70, 14, 26, 62, 10, '#0A171C');
    ctx.strokeStyle = 'rgba(150,196,190,0.20)';
    ctx.lineWidth = 1.4;
    strokeRR(ctx, -96, 14, 26, 62, 10, 'rgba(150,196,190,0.20)', 1.4);
    strokeRR(ctx, 70, 14, 26, 62, 10, 'rgba(150,196,190,0.20)', 1.4);
  }

  // porthole, lit from inside
  if (window > 0.01) {
    ctx.beginPath();
    ctx.arc(-30, 30, 15, 0, TAU2);
    ctx.fillStyle = '#061115';
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,224,216,0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-30, 30, 10, 0, TAU2);
    const wg = radGrad(ctx, -30, 30, 0, 11, [[0, hexA('#F0F6EE', 0.72 * window)], [1, hexA('#CBDCD6', 0.30 * window)]]);
    ctx.fillStyle = wg;
    ctx.fill();
  }

  // lamp housing
  if (lamp > 0.01) {
    fillRR(ctx, -14, 96, 28, 16, 4, '#0D1D22');
    strokeRR(ctx, -14, 96, 28, 16, 4, 'rgba(180,220,212,0.35)', 1.4);
    ctx.beginPath();
    ctx.arc(0, 104, 5, 0, TAU2);
    ctx.fillStyle = hexA('#F6FAF2', 0.95 * lamp);
    ctx.fill();
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
  ctx.strokeStyle = hexA(color, 0.32);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1);
  ctx.stroke();
  for (let i = 0; i <= ticks; i++) {
    const u = i / ticks;
    const y = y0 + u * h;
    const long = i % 3 === 0;
    ctx.strokeStyle = hexA(color, long ? 0.52 : 0.26);
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
  // marker: a tick and a hairline, not a lamp
  const u = clamp(cur / max);
  const my = y0 + u * h;
  ctx.strokeStyle = hexA(warm, 0.85);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x - 26, my);
  ctx.lineTo(x + 26, my);
  ctx.stroke();
  ctx.fillStyle = warm;
  ctx.beginPath();
  ctx.moveTo(x - 26, my);
  ctx.lineTo(x - 12, my - 8);
  ctx.lineTo(x - 12, my + 8);
  ctx.closePath();
  ctx.fill();
  txt(ctx, `${Math.round(cur).toLocaleString('id-ID')} m`, x + 40, my + 34, {
    size: 28, font: F.mono6, color: warm, track: 2, alpha: 0.92, align: 'left',
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
export function contours(ctx, { x = 0, y = 0, w = W, h = 700, seed = 9, n = 9, p = 1, color = '#9EB4B4', a = 0.4, lw = 1.4, fill = 0 } = {}) {
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
    if (fill > 0) {
      // the basin reads as depth, not as a line drawing
      ctx.fillStyle = hexA('#020C10', fill * (0.9 - k * 0.8));
      ctx.fill();
    }
    ctx.globalAlpha = a * (0.85 - k * 0.5);
    ctx.stroke();
  }
  ctx.restore();
}
