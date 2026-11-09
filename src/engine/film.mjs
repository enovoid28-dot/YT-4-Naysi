import { W, H, C, radGrad, linGrad, hexA } from './draw.mjs';
import { rng, clamp } from './anim.mjs';
import { GlobalFonts } from '@napi-rs/canvas';

let grainTile = null;
let vignetteCanvas = null;
let scanCanvas = null;
let dust = null;
let filmOverlay = null;

function makeNoise(w, h, createCanvas, seed) {
  const c = createCanvas(w, h);
  const x = c.getContext('2d');
  const img = x.createImageData(w, h);
  const r = rng(seed);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = 120 + (r() - 0.5) * 190;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}

export function initFilm({ createCanvas }) {
  grainTile = createCanvas(W, H);
  const gx = grainTile.getContext('2d');
  gx.globalAlpha = 1;
  gx.drawImage(makeNoise(W, H, createCanvas, 7), 0, 0);

  vignetteCanvas = createCanvas(W, H);
  const v = vignetteCanvas.getContext('2d');
  const g = v.createRadialGradient(W * 0.5, H * 0.46, H * 0.12, W * 0.5, H * 0.5, H * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.18)');
  g.addColorStop(1, 'rgba(0,0,0,0.82)');
  v.fillStyle = g;
  v.fillRect(0, 0, W, H);
  const gt = v.createLinearGradient(0, 0, 0, 260);
  gt.addColorStop(0, 'rgba(0,0,0,0.42)');
  gt.addColorStop(1, 'rgba(0,0,0,0)');
  v.fillStyle = gt;
  v.fillRect(0, 0, W, 260);

  scanCanvas = createCanvas(W, H);
  const s = scanCanvas.getContext('2d');
  s.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 1);

  // combined film overlay: grain + vignette (one full-frame pass per frame)
  // two baked overlays (grain + vignette) alternating per frame => animated
  // grain with exactly one full-frame pass and no resampling
  filmOverlay = [];
  for (let i = 0; i < 2; i++) {
    const c = createCanvas(W, H);
    const fo = c.getContext('2d');
    fo.globalAlpha = 0.055;
    fo.drawImage(makeNoise(W, H, createCanvas, 7 + i * 977), 0, 0);
    fo.globalAlpha = 1;
    fo.drawImage(vignetteCanvas, 0, 0);
    filmOverlay.push(c);
  }

  const r = rng(99);
  dust = Array.from({ length: 90 }, () => ({
    x: r() * W,
    y: r() * H,
    r: 1 + r() * 3.4,
    sp: 6 + r() * 26,
    ph: r() * 100,
    a: 0.05 + r() * 0.22,
  }));
}

export function drawFilm(ctx, frame) {
  if (!filmOverlay || !filmOverlay.length) return;
  ctx.save();
  ctx.drawImage(filmOverlay[frame % filmOverlay.length], 0, 0);
  ctx.restore();
}

export function drawGrain(ctx, frame, alpha = 0.055) {
  if (!grainTile) return;
  const ox = ((frame * 37) % 120) - 60;
  const oy = ((frame * 71) % 120) - 60;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  ctx.drawImage(grainTile, ox - 40, oy - 40, W + 80, H + 80);
  ctx.restore();
}

export function drawScanlines(ctx, alpha = 0.5) {
  if (!scanCanvas) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(scanCanvas, 0, 0);
  ctx.restore();
}

export function drawVignette(ctx, alpha = 1) {
  if (!vignetteCanvas) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(vignetteCanvas, 0, 0);
  ctx.restore();
}

/** Bottom scrim so captions always read cleanly. */
export function drawScrim(ctx, top = 1580, strength = 0.62) {
  ctx.save();
  const g = ctx.createLinearGradient(0, top, 0, 2260);
  g.addColorStop(0, `rgba(3,4,7,0)`);
  g.addColorStop(0.45, `rgba(3,4,7,${strength * 0.55})`);
  g.addColorStop(1, `rgba(3,4,7,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, top, W, 2260 - top);
  const g2 = ctx.createLinearGradient(0, 2260, 0, H);
  g2.addColorStop(0, `rgba(3,4,7,${strength})`);
  g2.addColorStop(1, `rgba(3,4,7,${strength + 0.16})`);
  ctx.fillStyle = g2;
  ctx.fillRect(0, 2260, W, H - 2260);
  ctx.restore();
}

/** Warm anamorphic light leak, sweeps in on cuts. */
export function drawLeak(ctx, t, intensity = 1, hue = C.amber) {
  if (intensity <= 0.001) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const x = W * 0.82 + Math.sin(t * 0.7) * 40;
  const g = ctx.createRadialGradient(x, 120, 0, x, 120, W * 0.85);
  g.addColorStop(0, hexA(hue, 0.5 * intensity));
  g.addColorStop(0.4, hexA(hue, 0.16 * intensity));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function drawFlash(ctx, alpha, color = '#FFFFFF') {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** Slow floating dust motes for volume/atmosphere. */
export function drawDust(ctx, t, alpha = 1, color = '#FFE6C0') {
  if (!dust) return;
  ctx.save();
  ctx.fillStyle = color;
  for (const d of dust) {
    const y = (d.y - t * d.sp) % H;
    const yy = y < 0 ? y + H : y;
    const xx = d.x + Math.sin(t * 0.35 + d.ph) * 26;
    ctx.globalAlpha = d.a * alpha * (0.5 + 0.5 * Math.sin(t * 1.3 + d.ph));
    ctx.beginPath();
    ctx.arc(xx, yy, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Horizontal scan flicker used on LED boards. */
export function drawLedSweep(ctx, y, height, t, color = 'rgba(255,255,255,0.10)') {
  ctx.save();
  const yy = y + ((t * 260) % height);
  const g = ctx.createLinearGradient(0, yy - 40, 0, yy + 40);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.5, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, yy - 40, W, 80);
  ctx.restore();
}
