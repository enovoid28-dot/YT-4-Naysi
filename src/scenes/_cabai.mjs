// Episode 27 — the chili props, drawn as a warm illustrated explainer.
//
// Flat 2D illustration with light: gradients, a key light from the upper
// left, specular streaks, baked stone and papillae textures, contact shadows.
// No 3D, no bitmaps from outside.
//   slate      dark stone worktop with a lamp pool (baked texture)
//   chili      a glossy cabai rawit on a bent spine, calyx and stem
//   cobek      stone mortar with sambal and the pestle
//   molecule   capsaicin as a skeletal formula
//   tongue     top view with papillae (baked) and a heat overlay
//   badge      pill label with a drawn icon (taste, pain, flame, milk …)
//   bilayer / channel / ions   the TRPV1 heat sensor in a membrane
//   thermo     thermometer with the 43 °C threshold
//   spikes / nerve             action potentials, a nerve with pulses
//   brain / profile            the alarm, the thermal head with sweat, tears
//   cup        a glass of water or milk
//   bird / rat / plant / sprout / seed   the seed-dispersal story
//   levelMeter "level pedas" row of chilies
import { createCanvas, Path2D } from '@napi-rs/canvas';
import { W, H, txt, measure, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng, EASE } from '../engine/anim.mjs';
import { fbm3 } from './_earth.mjs';
import { grain, rr, contact } from './_lab.mjs';
import { reportBg } from '../engine/look.mjs';
import { rays } from './_fx.mjs';

export const C = {
  red: '#E3342F', redRgb: '227,52,47', redHi: '#FF6B5B', deep: '#8E0E0B',
  orange: '#FF7A1A', orangeRgb: '255,122,26', ember: '#FFB03A', emberRgb: '255,176,58', emberHi: '#FFD27A',
  green: '#3FA34D', greenDk: '#1F5E2A', leaf: '#4C9A3F',
  milk: '#F4EFE6', milkRgb: '244,239,230',
  water: '#6FC3FF', waterRgb: '111,195,255',
  nerve: '#FFD24A', nerveRgb: '255,210,74',
  teal: '#3BB3A3', tealRgb: '59,179,163',
  mint: '#5FE3C0', mintRgb: '95,227,192',
  cool: '#7CC6FF', coolRgb: '124,198,255',
  bone: '#F3EFE4', text: '#E8E2D6', sub: 'rgba(232,226,214,0.62)', ink: '#1A1412',
};

export const P = (t, at, d) => clamp((t - at) / Math.max(1e-3, d));
export const eo = (p) => EASE.outCubic(clamp(p));
export const io = (p) => EASE.inOutQuad(clamp(p));
export const back = (p) => {
  const c = 1.9;
  const x = clamp(p) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/** draw `fn` into an offscreen frame and lay it over at `alpha` (clean cross-fades) */
const LAYERS = [];
let depth = 0;
let LA = 1; // opacity of the layer being drawn (backdrops report it to the look pass)
export function layer(ctx, alpha, fn) {
  if (alpha <= 0.001) return;
  if (alpha >= 0.999) { fn(ctx); return; }
  if (!LAYERS[depth]) LAYERS[depth] = createCanvas(W, H);
  const cv = LAYERS[depth];
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
  c.clearRect(0, 0, W, H);
  depth++;
  const prevLA = LA;
  LA *= alpha;
  try { fn(c); } finally { depth--; LA = prevLA; }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(cv, 0, 0);
  ctx.restore();
}

/* ================================ surfaces ================================= */

let SLATE = null;
/**
 * The worktop, baked once at half resolution: two scales of stone, a fine
 * speckle, faint mineral veins and scratches, and a scatter of what a sambal
 * leaves behind — chili flakes, pale seeds and salt grains, thicker toward
 * the edges.
 */
function slateTex() {
  if (SLATE) return SLATE;
  const w = 720;
  const h = 1280;
  const cv = createCanvas(w, h);
  const c = cv.getContext('2d');
  const img = c.createImageData(w, h);
  const R = rng(2727);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = fbm3(x / 140, y / 140, 0.5, 4, 27);
      const m = fbm3(x / 26, y / 26, 2.2, 2, 29);
      const v = 15 + n * 27 + m * 8 + (R() - 0.5) * 7;
      const i = (y * w + x) * 4;
      img.data[i] = v * 1.03;
      img.data[i + 1] = v * 0.94;
      img.data[i + 2] = v * 0.88;
      img.data[i + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  // mineral veins and fine scratches
  c.lineCap = 'round';
  for (let k = 0; k < 9; k++) {
    let x = R() * w;
    let y = R() * h;
    let an = R() * TAU;
    c.beginPath();
    c.moveTo(x, y);
    for (let s2 = 0; s2 < 40; s2++) {
      an += (R() - 0.5) * 0.5;
      x += Math.cos(an) * 9;
      y += Math.sin(an) * 9;
      c.lineTo(x, y);
    }
    c.strokeStyle = `rgba(255,236,214,${0.025 + R() * 0.035})`;
    c.lineWidth = 0.8 + R() * 1.4;
    c.stroke();
  }
  for (let k = 0; k < 60; k++) {
    const x = R() * w;
    const y = R() * h;
    const an = R() * TAU;
    const L = 20 + R() * 90;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(an) * L, y + Math.sin(an) * L);
    c.strokeStyle = `rgba(255,240,225,${0.02 + R() * 0.03})`;
    c.lineWidth = 0.6;
    c.stroke();
  }
  // scatter density: more toward the edges and the bottom
  const place = () => {
    for (;;) {
      const x = R() * w;
      const y = R() * h;
      const ex = Math.min(x, w - x) / (w / 2);
      const dens = 0.25 + 0.75 * (1 - ex) * (0.5 + 0.5 * (y / h));
      if (R() < dens) return [x, y];
    }
  };
  for (let k = 0; k < 170; k++) {
    const [x, y] = place();
    const rad = 1.6 + R() * 4.2;
    const n = 4 + Math.floor(R() * 3);
    const rot = R() * TAU;
    c.beginPath();
    for (let j = 0; j < n; j++) {
      const an = rot + (j / n) * TAU;
      const rr2 = rad * (0.55 + R() * 0.6);
      const px = x + Math.cos(an) * rr2;
      const py = y + Math.sin(an) * rr2 * 0.8;
      if (j === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    const hue = R();
    c.fillStyle = hue < 0.6 ? `rgba(${150 + R() * 60},${20 + R() * 25},${12 + R() * 10},${0.55 + R() * 0.35})` : `rgba(${190 + R() * 50},${60 + R() * 40},${20 + R() * 15},${0.5 + R() * 0.3})`;
    c.fill();
    c.fillStyle = `rgba(255,190,160,${0.25 + R() * 0.25})`;
    c.fillRect(x - rad * 0.3, y - rad * 0.35, Math.max(0.8, rad * 0.35), Math.max(0.6, rad * 0.22));
  }
  for (let k = 0; k < 70; k++) {
    const [x, y] = place();
    c.save();
    c.translate(x, y);
    c.rotate(R() * TAU);
    c.beginPath();
    c.ellipse(0, 0, 3.4 + R() * 1.2, 2.3 + R() * 0.6, 0, 0, TAU);
    c.fillStyle = `rgba(${220 + R() * 20},${185 + R() * 20},${110 + R() * 30},${0.5 + R() * 0.3})`;
    c.fill();
    c.strokeStyle = 'rgba(120,80,30,0.5)';
    c.lineWidth = 0.6;
    c.stroke();
    c.restore();
  }
  for (let k = 0; k < 260; k++) {
    const [x, y] = place();
    const sz = 0.7 + R() * 1.6;
    c.fillStyle = `rgba(255,250,240,${0.15 + R() * 0.35})`;
    c.fillRect(x, y, sz, sz);
  }
  SLATE = cv;
  return cv;
}

/** dark stone worktop under a warm lamp */
export function slate(ctx, t, cam = {}, { lamp = [720, 900], lampR = 1250, rgb = '255,170,110', a = 1, heat = 0, k = 1 } = {}) {
  if (a <= 0.004) return;
  reportBg('slate', a * LA * ctx.globalAlpha);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(slateTex(), -60 + (cam.dx || 0) * 0.4, -60 + (cam.dy || 0) * 0.4, W + 120, H + 120);
  ctx.globalCompositeOperation = 'soft-light';
  const fl = 1 + 0.012 * Math.sin(t * 6.1);
  const g = ctx.createRadialGradient(lamp[0], lamp[1], 40, lamp[0], lamp[1], lampR * fl);
  g.addColorStop(0, `rgba(${rgb},${0.85 * k})`);
  g.addColorStop(0.5, `rgba(${rgb},${0.35 * k})`);
  g.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(lamp[0], lamp[1], lampR * 0.35, lamp[0], lamp[1], lampR * 1.25);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // the lamp's beams falling through the steam
  ctx.globalCompositeOperation = 'source-over';
  rays(ctx, lamp[0] + 260 + (cam.dx || 0) * 0.6, -260, t, { n: 6, len: 2600, dir: Math.PI / 2 + 0.12, spread: 0.55, rgb, a: 0.075 * k, seed: 61 });
  if (heat > 0.01) {
    ctx.globalCompositeOperation = 'screen';
    const hg = ctx.createRadialGradient(lamp[0], lamp[1] + 300, 60, lamp[0], lamp[1] + 300, 1100);
    hg.addColorStop(0, `rgba(255,90,40,${0.35 * heat})`);
    hg.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/** a hexagonal lattice and a few loose fibres, baked once at full size */
let HEX = null;
function hexTex() {
  if (HEX) return HEX;
  const cv = createCanvas(W + 160, H + 160);
  const c = cv.getContext('2d');
  const R = rng(91);
  const r = 46;
  const dx = r * Math.sqrt(3);
  const dy = r * 1.5;
  c.lineWidth = 1.6;
  for (let row = 0; row * dy < cv.height + r; row++) {
    for (let col = 0; col * dx < cv.width + dx; col++) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0);
      const cy = row * dy;
      c.beginPath();
      for (let k = 0; k < 6; k++) {
        const an = Math.PI / 6 + (k * Math.PI) / 3;
        const px = cx + Math.cos(an) * r;
        const py = cy + Math.sin(an) * r;
        if (k === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.strokeStyle = `rgba(150,235,225,${0.35 + R() * 0.4})`;
      c.stroke();
      if (R() < 0.05) {
        c.fillStyle = 'rgba(150,235,225,0.22)';
        c.fill();
      }
    }
  }
  // loose fibres in the medium
  c.lineCap = 'round';
  for (let k = 0; k < 26; k++) {
    let x = R() * cv.width;
    let y = R() * cv.height;
    let an = R() * TAU;
    c.beginPath();
    c.moveTo(x, y);
    for (let j = 0; j < 30; j++) {
      an += (R() - 0.5) * 0.4;
      x += Math.cos(an) * 14;
      y += Math.sin(an) * 14;
      c.lineTo(x, y);
    }
    c.strokeStyle = `rgba(190,240,230,${0.25 + R() * 0.3})`;
    c.lineWidth = 1.2 + R() * 2.4;
    c.stroke();
  }
  HEX = cv;
  return cv;
}

/** a deep microscope field: dark, cool, with soft out-of-focus blobs and a lattice */
export function micro(ctx, t, cam = {}, { a = 1, rgb = '60,120,140', warm = 0 } = {}) {
  if (a <= 0.004) return;
  reportBg('micro', a * LA * ctx.globalAlpha);
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#05090C');
  g.addColorStop(0.5, '#081218');
  g.addColorStop(1, '#040608');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const base = ctx.globalAlpha;
  ctx.globalAlpha = base * 0.07;
  ctx.drawImage(hexTex(), -80 + (cam.dx || 0) * 0.5 + Math.sin(t * 0.11) * 14, -80 + (cam.dy || 0) * 0.5 - t * 4 % 69);
  ctx.globalAlpha = base;
  const r = rng(77);
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 14; i++) {
    const x = r() * W + Math.sin(t * 0.2 + i) * 30 + (cam.dx || 0) * 0.3;
    const y = r() * 1800 + Math.cos(t * 0.17 + i * 1.7) * 30 + (cam.dy || 0) * 0.3;
    const rad = 120 + r() * 320;
    const c = i % 4 === 0 && warm ? '255,120,70' : rgb;
    const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
    gg.addColorStop(0, `rgba(${c},${0.10 + r() * 0.08})`);
    gg.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = gg;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // the microscope's light from above
  ctx.globalCompositeOperation = 'source-over';
  rays(ctx, 720 + (cam.dx || 0) * 0.4, -400, t, { n: 5, len: 2600, dir: Math.PI / 2, spread: 0.6, rgb: '120,220,210', a: 0.05, seed: 17 });
  ctx.restore();
}

/* ================================= chili ================================== */

const HUES = {
  red: ['#FF6A52', '#D9261C', '#7A0A07'],
  green: ['#8FD46A', '#3E9A36', '#174D18'],
  orange: ['#FFB25A', '#F0731A', '#8A3306'],
};

/** a cabai rawit: base at (x, y), pointing along `rot`, `len` long */
export function chili(ctx, x, y, len, { rot = 0, hue = 'red', bend = 0.16, w = 0.17, a = 1, gloss = 1, stem = 1, shadow = 1, sheen = -1 } = {}) {
  if (a <= 0.004 || len < 2) return;
  const [c0, c1, c2] = HUES[hue] || HUES.red;
  const N = 26;
  const wmax = len * w;
  const spine = (u) => [u * len, -bend * len * Math.sin(Math.PI * u * 0.92) + bend * len * 0.18 * u];
  const L = [];
  const R = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const [sx, sy] = spine(u);
    const [ax, ay] = spine(Math.max(0, u - 0.01));
    const [bx, by] = spine(Math.min(1, u + 0.01));
    const tx = bx - ax;
    const ty = by - ay;
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;
    const wu = wmax * (u < 0.1 ? lerp(0.78, 1, u / 0.1) : Math.pow(Math.max(0, 1 - (u - 0.1) / 0.9), 0.8)) * 0.5;
    L.push([sx + nx * wu, sy + ny * wu]);
    R.push([sx - nx * wu, sy - ny * wu]);
  }
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  if (shadow) {
    ctx.save();
    ctx.translate(wmax * 0.25, wmax * 0.55);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.filter = 'blur(6px)';
    ctx.beginPath();
    L.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();
  }
  ctx.beginPath();
  L.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -wmax * 0.7, 0, wmax * 0.6);
  g.addColorStop(0, c0);
  g.addColorStop(0.45, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fill();
  if (gloss > 0) {
    ctx.save();
    ctx.clip();
    ctx.lineCap = 'round';
    for (const [off, lw, al] of [[-0.22, 0.16, 0.22], [-0.26, 0.06, 0.75]]) {
      ctx.beginPath();
      for (let i = 2; i <= N - 4; i++) {
        const u = i / N;
        const [sx, sy] = spine(u);
        const wu = wmax * Math.pow(Math.max(0, 1 - u), 0.8);
        if (i === 2) ctx.moveTo(sx, sy + off * wu * 1.6);
        else ctx.lineTo(sx, sy + off * wu * 1.6);
      }
      const hg = ctx.createLinearGradient(0, 0, len, 0);
      hg.addColorStop(0, `rgba(255,255,255,${al * gloss})`);
      hg.addColorStop(0.7, `rgba(255,255,255,${al * 0.4 * gloss})`);
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = hg;
      ctx.lineWidth = wmax * lw;
      ctx.stroke();
    }
    if (sheen > -0.5) {
      // a light band sweeping along the fruit
      const sx = lerp(-0.2, 1.2, sheen) * len;
      const sg = ctx.createLinearGradient(sx - len * 0.12, 0, sx + len * 0.12, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,240,230,0.45)');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = sg;
      ctx.fillRect(-len * 0.3, -wmax * 2, len * 1.6, wmax * 4);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }
  if (stem) {
    // calyx: a green cap over the shoulder, then a curved stem
    const cw = wmax * 0.62;
    const cg = ctx.createLinearGradient(0, -cw, 0, cw);
    cg.addColorStop(0, '#7CC65A');
    cg.addColorStop(1, '#245E22');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(wmax * 0.35, -cw * 0.8);
    ctx.quadraticCurveTo(wmax * 0.05, -cw * 1.05, -wmax * 0.12, -cw * 0.55);
    ctx.lineTo(-wmax * 0.12, cw * 0.55);
    ctx.quadraticCurveTo(wmax * 0.05, cw * 1.05, wmax * 0.35, cw * 0.8);
    ctx.quadraticCurveTo(wmax * 0.18, 0, wmax * 0.35, -cw * 0.8);
    ctx.fill();
    ctx.strokeStyle = '#3F8A34';
    ctx.lineWidth = wmax * 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-wmax * 0.08, 0);
    ctx.quadraticCurveTo(-len * 0.12, -wmax * 0.2, -len * 0.2, -wmax * 0.9);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(200,240,170,0.5)';
    ctx.lineWidth = wmax * 0.05;
    ctx.beginPath();
    ctx.moveTo(-wmax * 0.1, -wmax * 0.06);
    ctx.quadraticCurveTo(-len * 0.12, -wmax * 0.28, -len * 0.19, -wmax * 0.95);
    ctx.stroke();
  }
  ctx.restore();
}

/* ================================= cobek =================================== */

let STONE = null;
function stoneTex() {
  if (STONE) return STONE;
  const s = 256;
  const cv = createCanvas(s, s);
  const c = cv.getContext('2d');
  const img = c.createImageData(s, s);
  const r = rng(515);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const n = fbm3(x / 30, y / 30, 1.3, 3, 61);
      const v = 70 + n * 70 + (r() - 0.5) * 30 + (r() < 0.02 ? -40 : 0);
      const i = (y * s + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v * 0.97;
      img.data[i + 2] = v * 0.93;
      img.data[i + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  STONE = cv;
  return cv;
}

let SAMBAL = null;
function sambalTex() {
  if (SAMBAL) return SAMBAL;
  const s = 320;
  const cv = createCanvas(s, s);
  const c = cv.getContext('2d');
  const img = c.createImageData(s, s);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const n = fbm3(x / 22, y / 22, 0.7, 4, 71);
      const m = fbm3(x / 6, y / 6, 3.1, 2, 73);
      const i = (y * s + x) * 4;
      img.data[i] = 120 + n * 120 + m * 20;
      img.data[i + 1] = 14 + n * 30 + m * 10;
      img.data[i + 2] = 8 + n * 14;
      img.data[i + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  // seeds and skin flecks
  const r = rng(717);
  for (let k = 0; k < 140; k++) {
    const x = r() * s;
    const y = r() * s;
    if (r() < 0.55) {
      c.fillStyle = `rgba(245,220,150,${0.5 + r() * 0.4})`;
      c.beginPath();
      c.ellipse(x, y, 3 + r() * 2, 2 + r() * 1.5, r() * TAU, 0, TAU);
      c.fill();
    } else {
      c.fillStyle = `rgba(255,90,60,${0.35 + r() * 0.4})`;
      c.beginPath();
      c.ellipse(x, y, 5 + r() * 6, 2 + r() * 3, r() * TAU, 0, TAU);
      c.fill();
    }
  }
  SAMBAL = cv;
  return cv;
}

/** stone mortar (cobek) with sambal and the pestle (ulekan), 3/4 view */
export function cobek(ctx, cx, cy, r, { a = 1, t = 0, fill = 1, pestle = 1 } = {}) {
  if (a <= 0.004) return;
  const ry = r * 0.42;
  ctx.save();
  ctx.globalAlpha *= a;
  contact(ctx, cx + r * 0.05, cy + ry * 1.25, r * 2.5, r * 0.5, 0.7);
  // body (outer wall)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, ry, 0, Math.PI, 0, true);
  ctx.lineTo(cx + r * 0.86, cy + ry * 0.9);
  ctx.ellipse(cx, cy + ry * 0.9, r * 0.86, ry * 0.75, 0, 0, Math.PI);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(stoneTex(), cx - r, cy - ry, r * 2, ry * 2.6);
  const wg = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  wg.addColorStop(0, 'rgba(255,230,200,0.18)');
  wg.addColorStop(0.35, 'rgba(0,0,0,0)');
  wg.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = wg;
  ctx.fillRect(cx - r, cy - ry, r * 2, ry * 3);
  const vg = ctx.createLinearGradient(0, cy, 0, cy + ry * 1.7);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(cx - r, cy, r * 2, ry * 2);
  ctx.restore();
  // rim top
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, ry, 0, 0, TAU);
  ctx.clip();
  ctx.drawImage(stoneTex(), cx - r, cy - ry, r * 2, ry * 2);
  ctx.fillStyle = 'rgba(255,235,210,0.08)';
  ctx.fillRect(cx - r, cy - ry, r * 2, ry * 2);
  // the bowl, sunk in
  ctx.beginPath();
  ctx.ellipse(cx, cy + ry * 0.06, r * 0.84, ry * 0.8, 0, 0, TAU);
  const bg = ctx.createRadialGradient(cx - r * 0.2, cy - ry * 0.3, r * 0.1, cx, cy, r * 0.9);
  bg.addColorStop(0, '#3A3532');
  bg.addColorStop(1, '#141110');
  ctx.fillStyle = bg;
  ctx.fill();
  if (fill > 0.01) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry * 0.12, r * 0.76 * (0.7 + 0.3 * fill), ry * 0.66 * (0.7 + 0.3 * fill), 0, 0, TAU);
    ctx.clip();
    ctx.drawImage(sambalTex(), cx - r * 0.8, cy - ry * 0.7, r * 1.6, ry * 1.6);
    const sg = ctx.createRadialGradient(cx - r * 0.25, cy - ry * 0.2, 4, cx, cy, r * 0.8);
    sg.addColorStop(0, 'rgba(255,170,120,0.35)');
    sg.addColorStop(0.5, 'rgba(0,0,0,0)');
    sg.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = sg;
    ctx.fillRect(cx - r, cy - ry, r * 2, ry * 2);
    // oil sheen
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(255,200,150,0.45)';
    ctx.lineWidth = r * 0.012;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.2 + k * r * 0.12, cy - ry * 0.1 + k * ry * 0.08, r * 0.12, ry * 0.05, 0.2, Math.PI * 1.1, Math.PI * 1.8);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
  // rim highlight
  ctx.strokeStyle = 'rgba(255,240,220,0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r - 1.5, ry - 1.5, 0, Math.PI * 1.05, Math.PI * 1.75);
  ctx.stroke();
  if (pestle > 0.01) {
    // the ulekan resting in the bowl, out over the rim
    ctx.save();
    ctx.translate(cx + r * 0.15, cy - ry * 0.05);
    ctx.rotate(-0.62);
    const pl = r * 1.25;
    const pw = r * 0.2;
    ctx.save();
    ctx.translate(pw * 0.4, pw * 0.9);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.filter = 'blur(8px)';
    ctx.beginPath();
    ctx.roundRect(-pw * 0.2, -pw / 2, pl, pw, pw / 2);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(0, -pw * 0.62);
    ctx.lineTo(pl * 0.9, -pw * 0.42);
    ctx.quadraticCurveTo(pl, 0, pl * 0.9, pw * 0.42);
    ctx.lineTo(0, pw * 0.62);
    ctx.quadraticCurveTo(-pw * 0.6, 0, 0, -pw * 0.62);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.drawImage(stoneTex(), -pw, -pw, pl + pw * 2, pw * 2);
    const pg = ctx.createLinearGradient(0, -pw * 0.62, 0, pw * 0.62);
    pg.addColorStop(0, 'rgba(255,240,220,0.35)');
    pg.addColorStop(0.4, 'rgba(0,0,0,0)');
    pg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = pg;
    ctx.fillRect(-pw, -pw, pl + pw * 2, pw * 2);
    // sambal on the grinding end
    ctx.fillStyle = 'rgba(150,20,10,0.75)';
    ctx.beginPath();
    ctx.ellipse(-pw * 0.05, 0, pw * 0.55, pw * 0.7, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}

/* ================================ molecule ================================= */

/** capsaicin, skeletal formula: vanillyl ring, amide, fatty tail */
export function molecule(ctx, x, y, s, { rot = 0, a = 1, color = '#FF9A6B', glowK = 0.6, atoms = 1 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.lineWidth = Math.max(1.4, s * 0.14);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  if (glowK > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = s * 0.9 * glowK;
  }
  const hex = [];
  for (let i = 0; i < 6; i++) {
    const an = (i / 6) * TAU + Math.PI / 6;
    hex.push([Math.cos(an) * s, Math.sin(an) * s]);
  }
  ctx.beginPath();
  hex.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.55, 0, TAU);
  ctx.stroke();
  // OH and OMe on the left
  const sub = (i, len, ang) => {
    const [px, py] = hex[i];
    const ex = px + Math.cos(ang) * len;
    const ey = py + Math.sin(ang) * len;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    return [ex, ey];
  };
  const o1 = sub(3, s * 0.8, Math.PI * 1.05);
  const o2 = sub(4, s * 0.8, Math.PI * 1.35);
  // the chain from the right vertex: CH2 – NH – C(=O) – zigzag
  let [px, py] = hex[0];
  const pts = [[px, py]];
  const seg = s * 0.95;
  for (let k = 0; k < 9; k++) {
    const ang = k % 2 === 0 ? -Math.PI / 6 : Math.PI / 6;
    px += Math.cos(ang) * seg;
    py += Math.sin(ang) * seg;
    pts.push([px, py]);
  }
  ctx.beginPath();
  pts.forEach(([qx, qy], i) => (i ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy)));
  ctx.stroke();
  // C=O on the third atom, a trans double bond near the end, a branch at the tip
  const [cx3, cy3] = pts[3];
  ctx.beginPath();
  ctx.moveTo(cx3, cy3);
  ctx.lineTo(cx3, cy3 + s * 0.85);
  ctx.moveTo(cx3 + s * 0.2, cy3 + s * 0.1);
  ctx.lineTo(cx3 + s * 0.2, cy3 + s * 0.85);
  ctx.stroke();
  const [ax7, ay7] = pts[7];
  const [ax8, ay8] = pts[8];
  ctx.beginPath();
  ctx.moveTo(lerp(ax7, ax8, 0.15), lerp(ay7, ay8, 0.15) + s * 0.2);
  ctx.lineTo(lerp(ax7, ax8, 0.85), lerp(ay7, ay8, 0.85) + s * 0.2);
  ctx.stroke();
  const [ex, ey] = pts[9];
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex + seg * 0.8, ey - seg * 0.45);
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex + seg * 0.8, ey + seg * 0.45);
  ctx.stroke();
  ctx.shadowBlur = 0;
  if (atoms) {
    const dot = (qx, qy, c) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(qx, qy, s * 0.24, 0, TAU);
      ctx.fill();
    };
    dot(o1[0], o1[1], '#FF5A4A');
    dot(o2[0], o2[1], '#FF5A4A');
    dot(cx3 + s * 0.1, cy3 + s * 0.95, '#FF5A4A');
    dot(pts[2][0], pts[2][1], '#7CC6FF');
  }
  ctx.restore();
}

/* ================================= tongue ================================== */

const TONGUES = new Map();
function tonguePath(c, x, y, w, h) {
  c.beginPath();
  c.moveTo(x - w * 0.5, y - h * 0.36);
  c.bezierCurveTo(x - w * 0.52, y + h * 0.05, x - w * 0.4, y + h * 0.42, x, y + h * 0.5);
  c.bezierCurveTo(x + w * 0.4, y + h * 0.42, x + w * 0.52, y + h * 0.05, x + w * 0.5, y - h * 0.36);
  c.bezierCurveTo(x + w * 0.46, y - h * 0.52, x + w * 0.16, y - h * 0.47, x, y - h * 0.44);
  c.bezierCurveTo(x - w * 0.16, y - h * 0.47, x - w * 0.46, y - h * 0.52, x - w * 0.5, y - h * 0.36);
  c.closePath();
}
function tongueSprite(w, h) {
  const key = `${Math.round(w)}x${Math.round(h)}`;
  let cv = TONGUES.get(key);
  if (cv) return cv;
  const pad = 20;
  cv = createCanvas(Math.ceil(w + pad * 2), Math.ceil(h + pad * 2));
  const c = cv.getContext('2d');
  const x = cv.width / 2;
  const y = cv.height / 2;
  tonguePath(c, x, y, w, h);
  const g = c.createRadialGradient(x - w * 0.12, y - h * 0.1, w * 0.05, x, y, w * 0.7);
  g.addColorStop(0, '#F59AA0');
  g.addColorStop(0.6, '#DA6E7A');
  g.addColorStop(1, '#9E3E4E');
  c.fillStyle = g;
  c.fill();
  c.save();
  c.clip();
  const r = rng(321);
  for (let k = 0; k < (w * h) / 260; k++) {
    const px = x + (r() - 0.5) * w;
    const py = y + (r() - 0.5) * h;
    const big = r() < 0.06;
    c.fillStyle = big ? 'rgba(255,190,190,0.55)' : r() < 0.5 ? 'rgba(255,200,205,0.28)' : 'rgba(120,30,45,0.22)';
    c.beginPath();
    c.arc(px, py, big ? 4 + r() * 3 : 1.4 + r() * 1.8, 0, TAU);
    c.fill();
  }
  // the median groove
  const gg = c.createLinearGradient(x - 20, 0, x + 20, 0);
  gg.addColorStop(0, 'rgba(120,30,45,0)');
  gg.addColorStop(0.5, 'rgba(110,25,40,0.45)');
  gg.addColorStop(1, 'rgba(120,30,45,0)');
  c.fillStyle = gg;
  c.beginPath();
  c.moveTo(x - 6, y - h * 0.44);
  c.quadraticCurveTo(x - 16, y, x, y + h * 0.22);
  c.quadraticCurveTo(x + 16, y, x + 6, y - h * 0.44);
  c.fill();
  // a sheen from the key light
  const hg = c.createRadialGradient(x - w * 0.2, y - h * 0.2, 4, x - w * 0.2, y - h * 0.2, w * 0.35);
  hg.addColorStop(0, 'rgba(255,255,255,0.28)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = hg;
  c.fillRect(0, 0, cv.width, cv.height);
  const eg = c.createRadialGradient(x, y, w * 0.3, x, y, w * 0.62);
  eg.addColorStop(0, 'rgba(60,10,20,0)');
  eg.addColorStop(1, 'rgba(60,10,20,0.45)');
  c.fillStyle = eg;
  c.fillRect(0, 0, cv.width, cv.height);
  c.restore();
  TONGUES.set(key, cv);
  return cv;
}

/** a tongue seen from above (tip down), with an optional heat overlay */
export function tongue(ctx, cx, cy, w, h, { a = 1, heat = 0, t = 0, heatAt = [0, 0.15], dim = 0 } = {}) {
  if (a <= 0.004) return;
  const cv = tongueSprite(w, h);
  ctx.save();
  ctx.globalAlpha *= a;
  contact(ctx, cx, cy + h * 0.46, w * 1.1, h * 0.16, 0.5);
  ctx.drawImage(cv, cx - cv.width / 2, cy - cv.height / 2);
  if (dim > 0.01) {
    // an x-ray look: the tissue goes dark and translucent
    ctx.save();
    tonguePath(ctx, cx, cy, w, h);
    ctx.fillStyle = `rgba(22,6,12,${0.72 * dim})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,150,170,${0.5 * dim})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
  if (heat > 0.01) {
    ctx.save();
    tonguePath(ctx, cx, cy, w, h);
    ctx.clip();
    ctx.globalCompositeOperation = 'screen';
    const hx = cx + heatAt[0] * w;
    const hy = cy + heatAt[1] * h;
    const pul = 1 + 0.05 * Math.sin(t * 7);
    const g = ctx.createRadialGradient(hx, hy, 10, hx, hy, w * 0.75 * pul);
    g.addColorStop(0, `rgba(255,170,60,${0.85 * heat})`);
    g.addColorStop(0.4, `rgba(255,70,30,${0.55 * heat})`);
    g.addColorStop(1, 'rgba(255,40,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - w, cy - h, w * 2, h * 2);
    ctx.restore();
  }
  ctx.restore();
}

/* ================================== icons ================================== */

export function icon(ctx, kind, x, y, s, { color = C.bone, a = 1 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.lineWidth = s * 0.09;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (kind === 'manis') {
    // a sugar cube
    const k = s * 0.42;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -k);
    ctx.lineTo(k * 0.95, -k * 0.5);
    ctx.lineTo(0, 0);
    ctx.lineTo(-k * 0.95, -k * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#D9D4CC';
    ctx.beginPath();
    ctx.moveTo(-k * 0.95, -k * 0.5);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, k);
    ctx.lineTo(-k * 0.95, k * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#B9B2A8';
    ctx.beginPath();
    ctx.moveTo(k * 0.95, -k * 0.5);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, k);
    ctx.lineTo(k * 0.95, k * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'asam') {
    // a lemon slice
    ctx.fillStyle = '#F7D23E';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.44, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#FFF3B0';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.36, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#F5C42C';
    for (let i = 0; i < 8; i++) {
      const a0 = (i / 8) * TAU + 0.06;
      const a1 = ((i + 1) / 8) * TAU - 0.06;
      ctx.beginPath();
      ctx.moveTo(Math.cos((a0 + a1) / 2) * s * 0.05, Math.sin((a0 + a1) / 2) * s * 0.05);
      ctx.arc(0, 0, s * 0.31, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === 'asin') {
    // salt crystals
    ctx.fillStyle = '#F4F4F2';
    for (const [dx, dy, k, r] of [[-s * 0.14, s * 0.08, 0.3, 0.2], [s * 0.18, -s * 0.06, 0.24, -0.3], [s * 0.02, -s * 0.24, 0.18, 0.5]]) {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(r);
      ctx.fillRect(-s * k / 2, -s * k / 2, s * k, s * k);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(-s * k / 2, 0, s * k, s * k / 2);
      ctx.fillStyle = '#F4F4F2';
      ctx.restore();
    }
  } else if (kind === 'pahit') {
    // a coffee bean
    ctx.save();
    ctx.rotate(-0.5);
    ctx.fillStyle = '#7A4A2A';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.26, s * 0.4, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#3A1F0E';
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.36);
    ctx.bezierCurveTo(-s * 0.12, -s * 0.1, s * 0.12, s * 0.1, 0, s * 0.36);
    ctx.stroke();
    ctx.restore();
  } else if (kind === 'gurih') {
    // a bowl of broth with steam
    ctx.fillStyle = '#E9E1D2';
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.02);
    ctx.lineTo(s * 0.42, -s * 0.02);
    ctx.quadraticCurveTo(s * 0.38, s * 0.38, 0, s * 0.4);
    ctx.quadraticCurveTo(-s * 0.38, s * 0.38, -s * 0.42, -s * 0.02);
    ctx.fill();
    ctx.fillStyle = '#C98B3C';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.02, s * 0.42, s * 0.08, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = s * 0.06;
    for (const dx of [-s * 0.14, s * 0.02, s * 0.18]) {
      ctx.beginPath();
      ctx.moveTo(dx, -s * 0.14);
      ctx.bezierCurveTo(dx - s * 0.1, -s * 0.26, dx + s * 0.1, -s * 0.32, dx, -s * 0.44);
      ctx.stroke();
    }
  } else if (kind === 'pedas') {
    ctx.restore();
    chili(ctx, x - s * 0.36, y + s * 0.12, s * 0.8, { rot: -0.5, bend: 0.12, w: 0.24, a, shadow: 0 });
    return;
  } else if (kind === 'nyeri') {
    // a lightning bolt (pain)
    ctx.fillStyle = C.nerve;
    ctx.beginPath();
    ctx.moveTo(s * 0.08, -s * 0.46);
    ctx.lineTo(-s * 0.26, s * 0.06);
    ctx.lineTo(-s * 0.02, s * 0.06);
    ctx.lineTo(-s * 0.12, s * 0.46);
    ctx.lineTo(s * 0.28, -s * 0.08);
    ctx.lineTo(s * 0.03, -s * 0.08);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'api') {
    flameIcon(ctx, 0, s * 0.3, s * 0.8);
  } else if (kind === 'air') {
    ctx.fillStyle = C.water;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.44);
    ctx.bezierCurveTo(s * 0.12, -s * 0.2, s * 0.32, 0, s * 0.32, s * 0.14);
    ctx.arc(0, s * 0.14, s * 0.32, 0, Math.PI);
    ctx.bezierCurveTo(-s * 0.32, 0, -s * 0.12, -s * 0.2, 0, -s * 0.44);
    ctx.fill();
  } else if (kind === 'susu') {
    ctx.fillStyle = C.milk;
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.3);
    ctx.lineTo(s * 0.22, -s * 0.3);
    ctx.lineTo(s * 0.18, s * 0.42);
    ctx.lineTo(-s * 0.18, s * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(-s * 0.2, -s * 0.3, s * 0.4, s * 0.08);
  } else if (kind === 'lemak') {
    // an oil droplet with a sheen
    ctx.fillStyle = '#F2C14E';
    ctx.beginPath();
    ctx.arc(0, s * 0.05, s * 0.34, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.12, -s * 0.06, s * 0.1, s * 0.06, -0.6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function flameIcon(ctx, x, y, h, { a = 1, t = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const wob = Math.sin(t * 9) * h * 0.03;
  const layerF = (k, c0, c1) => {
    const hh = h * k;
    const g = ctx.createLinearGradient(0, y - hh, 0, y);
    g.addColorStop(0, c0);
    g.addColorStop(1, c1);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x + wob, y - hh);
    ctx.bezierCurveTo(x + hh * 0.5, y - hh * 0.55, x + hh * 0.46, y - hh * 0.08, x, y);
    ctx.bezierCurveTo(x - hh * 0.46, y - hh * 0.08, x - hh * 0.5, y - hh * 0.55, x + wob, y - hh);
    ctx.fill();
  };
  layerF(1, '#FF7A1A', '#E3342F');
  layerF(0.66, '#FFD27A', '#FF8A2A');
  layerF(0.34, '#FFF6D8', '#FFD27A');
  ctx.restore();
}

/** pill label with an icon; pops with overshoot; `cross` strikes it */
export function badge(ctx, x, y, label, p, { icon: ic = null, color = C.bone, rgb = '232,226,214', size = 30, cross = 0, a = 1, glow = 0, bg = 'rgba(16,12,12,0.86)' } = {}) {
  const q = clamp(p);
  if (q <= 0.001 || a <= 0.004) return null;
  ctx.save();
  ctx.font = `${size}px ${F.semi}`;
  const tw = ctx.measureText(label).width;
  const iw = ic ? size * 1.5 : 0;
  const padX = size * 0.6;
  const w = padX * 2 + iw + tw;
  const h = size * 1.9;
  const k = 0.6 + 0.4 * back(Math.min(1, q * 1.2));
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.globalAlpha *= a * clamp(q * 2.2);
  if (glow > 0) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.7);
    g.addColorStop(0, `rgba(${rgb},${0.35 * glow})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(-w, -w, w * 2, w * 2);
  }
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  rr(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();
  rr(ctx, -w / 2 + 1, -h / 2 + 1, w - 2, h - 2, h / 2);
  ctx.strokeStyle = `rgba(${rgb},0.55)`;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  if (ic) icon(ctx, ic, -w / 2 + padX + iw * 0.36, 0, size * 1.15);
  txt(ctx, label, -w / 2 + padX + iw, size * 0.36, { size, font: F.semi, color });
  if (cross > 0.001) {
    const c = eo(cross);
    ctx.strokeStyle = '#FF4A3A';
    ctx.lineWidth = size * 0.16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 10, h * 0.3);
    ctx.lineTo(-w / 2 + 10 + (w - 20) * c, h * 0.3 - h * 0.6 * c);
    ctx.stroke();
  }
  ctx.restore();
  return { w: w * k, h: h * k };
}

/* ============================ the heat sensor ============================== */

/** one leaflet row of a lipid bilayer from x0 to x1; skips `gap` */
export function bilayer(ctx, x0, x1, y, t, { a = 1, gap = null, s = 1, head = '#E9B6A0', tail = 'rgba(255,214,190,0.32)' } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const step = 30 * s;
  const hr = 11 * s;
  const th = 44 * s;
  for (const side of [-1, 1]) {
    for (let x = x0; x <= x1; x += step) {
      if (gap && x > gap[0] && x < gap[1]) continue;
      const wob = Math.sin(x * 0.05 + t * 1.6 + side) * 2.5 * s;
      const hy = y + side * (th + hr) + wob;
      ctx.strokeStyle = tail;
      ctx.lineWidth = 3 * s;
      ctx.lineCap = 'round';
      for (const dx of [-4 * s, 4 * s]) {
        ctx.beginPath();
        ctx.moveTo(x + dx, hy - side * hr * 0.6);
        ctx.bezierCurveTo(x + dx + 4 * s, hy - side * th * 0.4, x + dx - 4 * s, hy - side * th * 0.7, x + dx, y + wob * 0.3);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(x - hr * 0.35, hy - hr * 0.35, 1, x, hy, hr);
      g.addColorStop(0, '#FFE6D8');
      g.addColorStop(1, head);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, hy, hr, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * TRPV1 seen from the side: two of its four subunits flank the pore. `open`
 * 0..1 parts them; `glow` lights the pore; `dock` 0..1 fills the pocket.
 */
export function channel(ctx, cx, y, s, open, t, { a = 1, glow = 0, rgb = C.tealRgb, label = null, deaf = 0 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const gapW = s * (0.1 + 0.22 * open);
  const pw = s * 0.42;
  const ph = s * 1.25;
  if (glow > 0.01) {
    const g = ctx.createRadialGradient(cx, y, 0, cx, y, s * 1.2);
    g.addColorStop(0, `rgba(255,190,90,${0.6 * glow})`);
    g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - s * 1.3, y - s * 1.3, s * 2.6, s * 2.6);
  }
  for (const side of [-1, 1]) {
    const x = cx + side * (gapW / 2 + pw / 2);
    const g = ctx.createLinearGradient(x - pw / 2, 0, x + pw / 2, 0);
    if (deaf) {
      g.addColorStop(0, '#8C9AA6');
      g.addColorStop(1, '#4C5862');
    } else {
      g.addColorStop(0, side < 0 ? '#6FE0CF' : '#3BB3A3');
      g.addColorStop(1, side < 0 ? '#2C8C80' : '#1D6A61');
    }
    ctx.fillStyle = g;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(x - pw / 2, y - ph / 2, pw, ph, pw * 0.45);
    ctx.fill();
    ctx.restore();
    // helices hinted as bands
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = s * 0.03;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(x - pw * 0.38, y + k * ph * 0.17 - s * 0.04);
      ctx.quadraticCurveTo(x, y + k * ph * 0.17 + s * 0.05, x + pw * 0.38, y + k * ph * 0.17 - s * 0.04);
      ctx.stroke();
    }
    // the binding pocket faces the pore
    ctx.fillStyle = deaf ? 'rgba(20,26,30,0.6)' : 'rgba(10,30,28,0.65)';
    ctx.beginPath();
    ctx.ellipse(x - side * pw * 0.32, y - ph * 0.12, pw * 0.18, ph * 0.09, 0, 0, TAU);
    ctx.fill();
  }
  // intracellular domain
  const dg = ctx.createLinearGradient(0, y + ph / 2, 0, y + ph / 2 + s * 0.45);
  dg.addColorStop(0, deaf ? '#5E6A74' : '#2B8C80');
  dg.addColorStop(1, deaf ? '#39424A' : '#164F48');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.62 - gapW * 0.3, y + ph / 2 - s * 0.08, s * 1.24 + gapW * 0.6, s * 0.45, s * 0.18);
  ctx.fill();
  if (label) {
    txt(ctx, label, cx, y - ph / 2 - s * 0.22, { size: Math.max(18, s * 0.16), font: F.mono6, color: deaf ? 'rgba(200,210,220,0.8)' : C.mint, align: 'center', track: 3 });
  }
  ctx.restore();
}

/** calcium and sodium ions dropping through an open pore */
export function ions(ctx, cx, y, s, t, flow, { a = 1 } = {}) {
  if (flow <= 0.01 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < 9; i++) {
    const ph = ((t * 0.9 + i / 9) % 1);
    const yy = y - s * 1.4 + ph * s * 2.8;
    const xx = cx + Math.sin(i * 2.3 + t * 3) * s * 0.06 * (1 - Math.abs(ph - 0.5) * 2);
    const al = flow * Math.min(1, ph * 5) * Math.min(1, (1 - ph) * 5);
    const big = i % 3 === 0;
    ctx.fillStyle = big ? `rgba(255,214,120,${al})` : `rgba(140,210,255,${al})`;
    ctx.beginPath();
    ctx.arc(xx, yy, s * (big ? 0.07 : 0.05), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** a thermometer with ticks and the 43 °C line */
export function thermo(ctx, x, y, h, temp, { min = 20, max = 50, mark = 43, p = 1, a = 1, w = 54 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  ctx.translate(0, (1 - q) * 40);
  const br = w * 0.85;
  const top = y - h / 2;
  const bot = y + h / 2;
  const Y = (v) => bot - ((v - min) / (max - min)) * (h - br * 0.4);
  // glass
  ctx.fillStyle = 'rgba(230,240,248,0.1)';
  ctx.strokeStyle = 'rgba(230,240,248,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, top, w, h, w / 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, bot + br * 0.6, br, 0, TAU);
  ctx.fill();
  ctx.stroke();
  // mercury
  const hot = clamp((temp - 37) / (mark - 37));
  const mc = `rgb(${Math.round(lerp(255, 255, hot))},${Math.round(lerp(150, 60, hot))},${Math.round(lerp(60, 40, hot))})`;
  ctx.fillStyle = mc;
  ctx.beginPath();
  ctx.arc(x, bot + br * 0.6, br * 0.78, 0, TAU);
  ctx.fill();
  const ty = Y(clamp(temp, min, max));
  ctx.beginPath();
  ctx.roundRect(x - w * 0.24, ty, w * 0.48, bot + br * 0.6 - ty, w * 0.24);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x - w * 0.34, top + 12, w * 0.1, h - 24);
  // ticks
  for (let v = min; v <= max; v += 1) {
    const yy = Y(v);
    const big = v % 5 === 0;
    ctx.strokeStyle = big ? 'rgba(230,240,248,0.85)' : 'rgba(230,240,248,0.35)';
    ctx.lineWidth = big ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + 6, yy);
    ctx.lineTo(x + w / 2 + (big ? 26 : 14), yy);
    ctx.stroke();
    if (big) txt(ctx, `${v}`, x + w / 2 + 34, yy + 8, { size: 22, font: F.mono6, color: 'rgba(230,240,248,0.75)' });
  }
  // the threshold
  const my = Y(mark);
  ctx.strokeStyle = 'rgba(255,90,74,0.95)';
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 110, my);
  ctx.lineTo(x + w / 2 + 6, my);
  ctx.stroke();
  ctx.setLineDash([]);
  txt(ctx, `${mark} °C`, x - w / 2 - 118, my + 10, { size: 30, font: F.fig8, color: '#FF7A6A', align: 'right' });
  ctx.restore();
}

/* ============================== nerve signals ============================== */

/** an action-potential trace scrolling left; same seed == same pattern */
export function spikes(ctx, x, y, w, h, t, { rate = 6, a = 1, rgb = C.nerveRgb, speed = 320, seed = 1, on = 1, lw = 3 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  ctx.rect(x, y - h, w, h * 2);
  ctx.clip();
  const pts = [];
  const N = Math.ceil(w / 3);
  // spikes live at fixed times; screen x = x + w - (t - ts) * speed
  const r = rng(seed);
  const times = [];
  let ts = -2;
  while (ts < 120) {
    ts += (0.7 + r() * 0.6) / rate;
    times.push(ts);
  }
  const amp = (sx) => {
    const tt = t - (x + w - sx) / speed;
    let v = 0;
    for (const s0 of times) {
      const d = (tt - s0) * 1000;
      if (d < -6 || d > 22) continue;
      if (d < 0) v += 0.15 * (1 + d / 6);
      else if (d < 3) v += 1 * (d / 3) + 0.15 * (1 - d / 3);
      else if (d < 8) v += 1 - (d - 3) / 5 * 1.25;
      else v += -0.25 * Math.exp(-(d - 8) / 6);
    }
    return v * on;
  };
  for (let i = 0; i <= N; i++) {
    const sx = x + (i / N) * w;
    pts.push([sx, y - amp(sx) * h * 0.8]);
  }
  for (const [lwk, al] of [[lw * 3.2, 0.14], [lw, 1]]) {
    ctx.strokeStyle = `rgba(${rgb},${al})`;
    ctx.lineWidth = lwk;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.stroke();
  }
  ctx.restore();
}

/** a glowing nerve along a polyline with pulses travelling to its end */
export function nerve(ctx, pts, t, { a = 1, rgb = C.nerveRgb, lw = 6, n = 3, speed = 0.9, on = 1, reveal = 1 } = {}) {
  if (a <= 0.004 || pts.length < 2) return;
  const seg = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    L += d;
  }
  const at = (f) => {
    let s = clamp(f) * L;
    for (let i = 0; i < seg.length; i++) {
      if (s <= seg[i] || i === seg.length - 1) {
        const k = seg[i] ? s / seg[i] : 0;
        return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
      }
      s -= seg[i];
    }
    return pts[pts.length - 1];
  };
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const steps = Math.max(2, Math.ceil(60 * reveal));
  for (const [k, al] of [[3.2, 0.12], [1, 0.75]]) {
    ctx.strokeStyle = `rgba(${rgb},${al})`;
    ctx.lineWidth = lw * k;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const [px, py] = at((i / steps) * reveal);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  if (on > 0.01) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const f = ((t * speed + i / n) % 1);
      if (f > reveal) continue;
      const [px, py] = at(f);
      const pr = lw * 3.6;
      const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, `rgba(255,255,240,${on})`);
      g.addColorStop(0.3, `rgba(${rgb},${0.8 * on})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }
  }
  ctx.restore();
}

/* ============================ brain and the head =========================== */

let BRAINP = null;
function brainPaths() {
  if (BRAINP) return BRAINP;
  // a side view in a 1000 × 760 box, front to the right
  const outline = new Path2D();
  outline.moveTo(140, 470);
  outline.bezierCurveTo(60, 330, 150, 130, 360, 80);
  outline.bezierCurveTo(520, 30, 720, 50, 840, 160);
  outline.bezierCurveTo(960, 260, 960, 420, 880, 500);
  outline.bezierCurveTo(820, 560, 700, 560, 620, 545);
  outline.bezierCurveTo(560, 600, 480, 610, 420, 585);
  outline.bezierCurveTo(330, 640, 210, 600, 140, 470);
  outline.closePath();
  const cereb = new Path2D();
  cereb.moveTo(250, 560);
  cereb.bezierCurveTo(260, 650, 420, 690, 500, 620);
  cereb.bezierCurveTo(470, 590, 420, 585, 390, 590);
  cereb.bezierCurveTo(330, 620, 280, 600, 250, 560);
  cereb.closePath();
  const stem = new Path2D();
  stem.moveTo(470, 590);
  stem.bezierCurveTo(480, 650, 470, 700, 455, 760);
  stem.lineTo(520, 760);
  stem.bezierCurveTo(530, 700, 540, 640, 560, 585);
  stem.closePath();
  // folds: wavy contour lines across the hemisphere (clipped by the outline)
  const gyri = new Path2D();
  const r = rng(1997);
  for (let k = 0; k < 9; k++) {
    const y0 = 120 + k * 52;
    const amp = 16 + r() * 10;
    const fq = 0.035 + r() * 0.02;
    const ph = r() * TAU;
    let first = true;
    for (let x = 90; x <= 960; x += 6) {
      const y = y0 + Math.sin(x * fq + ph) * amp + Math.sin(x * fq * 2.7 + ph * 1.3) * amp * 0.35 + (x - 520) * (x - 520) * 0.00018 * (k - 4);
      if (first) { gyri.moveTo(x, y); first = false; } else gyri.lineTo(x, y);
    }
  }
  // short cross folds between the contours
  for (let k = 0; k < 34; k++) {
    const x = 160 + r() * 720;
    const y = 140 + r() * 400;
    gyri.moveTo(x, y);
    gyri.bezierCurveTo(x + 10 + r() * 20, y + 12, x - 10 - r() * 20, y + 26, x + (r() - 0.5) * 20, y + 40 + r() * 16);
  }
  const sulcus = new Path2D();
  sulcus.moveTo(260, 420);
  sulcus.bezierCurveTo(400, 380, 520, 400, 640, 470);
  sulcus.moveTo(560, 90);
  sulcus.bezierCurveTo(540, 220, 600, 330, 580, 420);
  BRAINP = { outline, cereb, stem, gyri, sulcus };
  return BRAINP;
}

/** a stylised brain, side view; `alarm` 0..1 floods it red */
export function brain(ctx, cx, cy, s, { a = 1, alarm = 0, t = 0 } = {}) {
  if (a <= 0.004) return;
  const B = brainPaths();
  const k = s / 1000;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx - 500 * k, cy - 400 * k);
  ctx.scale(k, k);
  if (alarm > 0.01) {
    const pul = 0.75 + 0.25 * Math.sin(t * 12);
    const g = ctx.createRadialGradient(520, 340, 50, 520, 340, 720);
    g.addColorStop(0, `rgba(255,60,40,${0.55 * alarm * pul})`);
    g.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-200, -300, 1400, 1300);
  }
  const sg = ctx.createLinearGradient(0, 600, 0, 760);
  sg.addColorStop(0, '#C98A8F');
  sg.addColorStop(1, '#7A4048');
  ctx.fillStyle = sg;
  ctx.fill(B.stem);
  const cg = ctx.createLinearGradient(0, 540, 0, 680);
  cg.addColorStop(0, '#E4A9AE');
  cg.addColorStop(1, '#94505B');
  ctx.fillStyle = cg;
  ctx.fill(B.cereb);
  ctx.strokeStyle = 'rgba(110,40,55,0.6)';
  ctx.lineWidth = 6;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(270 + i * 10, 580 + i * 14);
    ctx.quadraticCurveTo(380, 600 + i * 16, 480, 600 + i * 8);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(420, 220, 40, 520, 340, 560);
  g.addColorStop(0, '#F6C1C4');
  g.addColorStop(0.6, '#DE8E97');
  g.addColorStop(1, '#A65466');
  ctx.fillStyle = g;
  ctx.fill(B.outline);
  ctx.save();
  ctx.clip(B.outline);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255,226,230,0.32)';
  ctx.lineWidth = 7;
  ctx.translate(-4, -7);
  ctx.stroke(B.gyri);
  ctx.translate(4, 7);
  ctx.strokeStyle = 'rgba(122,38,58,0.62)';
  ctx.lineWidth = 8;
  ctx.stroke(B.gyri);
  ctx.strokeStyle = 'rgba(100,30,48,0.7)';
  ctx.lineWidth = 12;
  ctx.stroke(B.sulcus);
  if (alarm > 0.01) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(255,40,30,${0.45 * alarm})`;
    ctx.fillRect(0, 0, 1000, 800);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(90,25,40,0.6)';
  ctx.lineWidth = 5;
  ctx.stroke(B.outline);
  ctx.restore();
}

let HEAD = null;
function headPath() {
  if (HEAD) return HEAD;
  const p = new Path2D();
  // a profile facing right in a 1000 × 1300 box
  p.moveTo(330, 1300);
  p.bezierCurveTo(320, 1180, 300, 1080, 280, 1010);
  p.bezierCurveTo(200, 900, 170, 720, 210, 540);
  p.bezierCurveTo(250, 330, 380, 190, 560, 170);
  p.bezierCurveTo(700, 160, 790, 250, 810, 380);
  p.bezierCurveTo(818, 440, 812, 480, 800, 515);
  p.bezierCurveTo(830, 570, 870, 640, 905, 690);
  p.bezierCurveTo(915, 712, 895, 728, 860, 730);
  p.lineTo(830, 735);
  p.bezierCurveTo(840, 760, 855, 790, 852, 815);
  p.bezierCurveTo(840, 830, 822, 840, 825, 852);
  p.bezierCurveTo(845, 865, 850, 890, 838, 910);
  p.bezierCurveTo(828, 950, 820, 985, 770, 1005);
  p.bezierCurveTo(720, 1022, 660, 1022, 630, 1040);
  p.bezierCurveTo(610, 1100, 615, 1200, 620, 1300);
  p.closePath();
  HEAD = p;
  return p;
}

/** a profile in a thermal palette: `heat` flushes it, sweat beads, a tear runs */
export function profile(ctx, x, y, s, { a = 1, heat = 0, sweat = 0, tears = 0, t = 0 } = {}) {
  if (a <= 0.004) return;
  const k = s / 1000;
  const hp = headPath();
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x - 560 * k, y - 650 * k);
  ctx.scale(k, k);
  // the cool base: deep blue to violet thermal
  const g = ctx.createLinearGradient(200, 200, 900, 1100);
  g.addColorStop(0, '#20184A');
  g.addColorStop(0.5, '#3A1F6E');
  g.addColorStop(1, '#5B2A7A');
  ctx.fillStyle = g;
  ctx.fill(hp);
  ctx.save();
  ctx.clip(hp);
  ctx.globalCompositeOperation = 'screen';
  // warm zones grow with heat: mouth, cheeks, forehead, neck
  const zones = [
    [830, 840, 260, 1.0],
    [690, 760, 300, 0.85],
    [600, 330, 320, 0.7],
    [470, 1100, 280, 0.45],
    [430, 620, 280, 0.35],
  ];
  const base = 0.18;
  for (const [zx, zy, zr, w] of zones) {
    const hk = clamp(base + heat * w);
    const zg = ctx.createRadialGradient(zx, zy, 10, zx, zy, zr * (0.8 + heat * 0.6));
    zg.addColorStop(0, `rgba(255,${Math.round(lerp(120, 240, hk))},${Math.round(lerp(60, 120, hk))},${hk})`);
    zg.addColorStop(0.45, `rgba(255,${Math.round(lerp(40, 110, hk))},40,${hk * 0.7})`);
    zg.addColorStop(1, 'rgba(120,30,90,0)');
    ctx.fillStyle = zg;
    ctx.fillRect(zx - zr * 2, zy - zr * 2, zr * 4, zr * 4);
  }
  ctx.globalCompositeOperation = 'source-over';
  // contour lines like a thermal camera
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 3;
  for (let i = 1; i < 6; i++) {
    ctx.beginPath();
    ctx.ellipse(760, 760, 90 * i * (0.9 + heat * 0.3), 70 * i * (0.9 + heat * 0.3), -0.3, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
  // rim
  ctx.strokeStyle = `rgba(255,${Math.round(lerp(180, 230, heat))},${Math.round(lerp(220, 150, heat))},0.6)`;
  ctx.lineWidth = 5;
  ctx.stroke(hp);
  // eye and ear
  ctx.fillStyle = 'rgba(10,6,20,0.85)';
  ctx.beginPath();
  ctx.ellipse(712, 520, 26, 12, -0.1, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,200,0.35)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(430, 640, 46, 74, 0.15, -1.2, 1.8);
  ctx.stroke();
  // sweat beads on the forehead and temple
  if (sweat > 0.01) {
    const r = rng(42);
    for (let i = 0; i < 9; i++) {
      const sx = 560 + r() * 220;
      const sy0 = 260 + r() * 170;
      const born = i / 9;
      const q = clamp((sweat - born * 0.6) / 0.4);
      if (q <= 0) continue;
      const slide = ((t * (0.2 + r() * 0.2) + r()) % 1) * 90 * q;
      drop(ctx, sx, sy0 + slide, 12 + r() * 10, q, 'rgba(160,220,255,0.9)');
    }
  }
  // a tear from the eye down the cheek
  if (tears > 0.01) {
    const ty = 540 + eo(tears) * 160 + ((t * 0.6) % 1) * 30 * tears;
    ctx.strokeStyle = `rgba(160,220,255,${0.55 * tears})`;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(725, 535);
    ctx.quadraticCurveTo(735, 590, 728, ty - 14);
    ctx.stroke();
    drop(ctx, 728, ty, 18, tears, 'rgba(170,225,255,0.95)');
  }
  ctx.restore();
}

function drop(ctx, x, y, r, a, color) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.6);
  ctx.bezierCurveTo(x + r * 0.5, y - r * 0.7, x + r, y - r * 0.1, x + r, y + r * 0.25);
  ctx.arc(x, y + r * 0.25, r, 0, Math.PI);
  ctx.bezierCurveTo(x - r, y - r * 0.1, x - r * 0.5, y - r * 0.7, x, y - r * 1.6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, y + r * 0.05, r * 0.2, r * 0.32, -0.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}
export { drop };

/* ================================= the glass ================================ */

/** a tumbler of water or milk; `level` 0..1, `tilt` pours to the right */
export function cup(ctx, x, y, w, h, { liquid = 'water', level = 0.72, t = 0, a = 1, tilt = 0 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(tilt);
  const tw = w;
  const bw = w * 0.8;
  const top = -h / 2;
  const bot = h / 2;
  const glassPath = () => {
    ctx.beginPath();
    ctx.moveTo(-tw / 2, top);
    ctx.lineTo(tw / 2, top);
    ctx.lineTo(bw / 2, bot);
    ctx.lineTo(-bw / 2, bot);
    ctx.closePath();
  };
  contact(ctx, 0, bot + 8, w * 1.2, w * 0.18, 0.45);
  // liquid: keeps level in world space while the glass tilts
  ctx.save();
  glassPath();
  ctx.clip();
  ctx.rotate(-tilt);
  const ly = bot - h * level;
  const wave = Math.sin(t * 3) * 4;
  if (liquid && liquid.startsWith('rgb')) {
    ctx.fillStyle = liquid;
  } else if (liquid === 'milk') {
    const g = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
    g.addColorStop(0, '#E9E1D4');
    g.addColorStop(0.3, '#FFFDF8');
    g.addColorStop(0.75, '#EDE5D8');
    g.addColorStop(1, '#BFB4A4');
    ctx.fillStyle = g;
  } else {
    const g = ctx.createLinearGradient(0, ly, 0, bot + h);
    g.addColorStop(0, 'rgba(140,210,255,0.55)');
    g.addColorStop(1, 'rgba(60,140,220,0.65)');
    ctx.fillStyle = g;
  }
  ctx.beginPath();
  ctx.moveTo(-w * 1.5, ly + wave);
  ctx.quadraticCurveTo(0, ly - wave, w * 1.5, ly + wave);
  ctx.lineTo(w * 1.5, bot + h);
  ctx.lineTo(-w * 1.5, bot + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = liquid === 'milk' ? 'rgba(255,255,255,0.9)' : liquid === 'water' ? 'rgba(220,245,255,0.55)' : 'rgba(255,235,220,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, ly, w * 0.46, w * 0.06, 0, 0, TAU);
  ctx.fill();
  if (liquid === 'water') {
    const r = rng(9);
    for (let i = 0; i < 10; i++) {
      const bx = (r() - 0.5) * w * 0.6;
      const by = bot - ((t * (20 + r() * 30) + r() * h) % (h * level));
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(bx, by, 2 + r() * 3, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
  // glass walls and highlights
  glassPath();
  ctx.fillStyle = 'rgba(230,245,255,0.06)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(230,245,255,0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.moveTo(-tw / 2 + 12, top + 10);
  ctx.lineTo(-tw / 2 + 26, top + 10);
  ctx.lineTo(-bw / 2 + 26, bot - 14);
  ctx.lineTo(-bw / 2 + 16, bot - 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(230,245,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, top, tw / 2, w * 0.07, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/* ============================ birds, rats, plants =========================== */

/** a sooty-headed bulbul (cucak kutilang), facing right, perched */
export function bird(ctx, x, y, s, { a = 1, t = 0, flap = 0, peck = 0, flip = false, gulp = 0, legs = 1 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(s / 100, s / 100);
  const bob = Math.sin(t * 2.4) * 1.5;
  ctx.translate(0, bob);
  // tail
  ctx.fillStyle = '#2E2A28';
  ctx.beginPath();
  ctx.moveTo(-38, 10);
  ctx.lineTo(-108, 48);
  ctx.lineTo(-100, 62);
  ctx.lineTo(-30, 26);
  ctx.closePath();
  ctx.fill();
  // legs
  if (legs) {
    ctx.strokeStyle = '#3A2E28';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-4, 38);
    ctx.lineTo(-8, 58);
    ctx.moveTo(10, 38);
    ctx.lineTo(8, 58);
    ctx.stroke();
  }
  // body
  const bg = ctx.createLinearGradient(0, -30, 0, 45);
  bg.addColorStop(0, '#A9A6A0');
  bg.addColorStop(0.55, '#D9D6CF');
  bg.addColorStop(1, '#EDEAE3');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, 10, 50, 32, -0.18, 0, TAU);
  ctx.fill();
  // the yellow vent
  ctx.fillStyle = '#F2B636';
  ctx.beginPath();
  ctx.ellipse(-30, 30, 16, 10, -0.5, 0, TAU);
  ctx.fill();
  // wing
  ctx.save();
  ctx.translate(-6, 0);
  ctx.rotate(-flap * 1.2);
  const wg = ctx.createLinearGradient(0, -20, 0, 30);
  wg.addColorStop(0, '#5A5550');
  wg.addColorStop(1, '#34302D');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.moveTo(26, -10);
  ctx.bezierCurveTo(0, -22, -40, -6, -62, 22);
  ctx.bezierCurveTo(-30, 26, 10, 18, 26, -10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(10 - i * 12, -6 + i * 3);
    ctx.lineTo(-20 - i * 10, 14 + i * 2);
    ctx.stroke();
  }
  ctx.restore();
  // head, with the peck tilt
  ctx.save();
  ctx.translate(40, -20);
  ctx.rotate(peck * 0.5);
  ctx.fillStyle = '#1E1B1A';
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, TAU);
  ctx.fill();
  // crest
  ctx.beginPath();
  ctx.moveTo(-14, -16);
  ctx.quadraticCurveTo(-6, -40, 8, -30);
  ctx.quadraticCurveTo(2, -22, 6, -18);
  ctx.closePath();
  ctx.fill();
  // pale cheek
  ctx.fillStyle = '#E8E4DC';
  ctx.beginPath();
  ctx.ellipse(4, 12, 14, 9, 0.2, 0, TAU);
  ctx.fill();
  // eye
  ctx.fillStyle = '#0A0808';
  ctx.beginPath();
  ctx.arc(9, -4, 5.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(10.8, -5.8, 1.8, 0, TAU);
  ctx.fill();
  // beak, opens for the gulp
  ctx.fillStyle = '#141110';
  ctx.beginPath();
  ctx.moveTo(22, -6);
  ctx.lineTo(44, -2 - gulp * 6);
  ctx.lineTo(22, 3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(22, 3);
  ctx.lineTo(42, 4 + gulp * 8);
  ctx.lineTo(21, 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** a field rat, facing right; `chew` works the jaw */
export function rat(ctx, x, y, s, { a = 1, t = 0, chew = 0, flip = false } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(s / 100, s / 100);
  contact(ctx, 0, 34, 220, 26, 0.45);
  // tail
  ctx.strokeStyle = '#B48A80';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-70, 20);
  ctx.bezierCurveTo(-130, 30, -150, -10, -190, 6 + Math.sin(t * 3) * 6);
  ctx.stroke();
  // body
  const g = ctx.createLinearGradient(0, -40, 0, 36);
  g.addColorStop(0, '#8B7568');
  g.addColorStop(1, '#5A463C');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(-10, 4, 72, 36, 0, 0, TAU);
  ctx.fill();
  // head
  const jaw = Math.abs(Math.sin(t * 14)) * chew;
  ctx.beginPath();
  ctx.moveTo(40, -24);
  ctx.bezierCurveTo(70, -26, 96, -6, 108, 8);
  ctx.bezierCurveTo(96, 16 + jaw * 6, 70, 24, 40, 24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#E79A9A';
  ctx.beginPath();
  ctx.arc(108, 8, 5, 0, TAU);
  ctx.fill();
  // ear
  ctx.fillStyle = '#C79A92';
  ctx.beginPath();
  ctx.ellipse(48, -28, 14, 18, -0.3, 0, TAU);
  ctx.fill();
  // eye
  ctx.fillStyle = '#0A0808';
  ctx.beginPath();
  ctx.arc(74, -6, 4.5, 0, TAU);
  ctx.fill();
  // whiskers
  ctx.strokeStyle = 'rgba(240,230,220,0.6)';
  ctx.lineWidth = 1.5;
  for (const dy of [-6, 0, 6]) {
    ctx.beginPath();
    ctx.moveTo(100, 8);
    ctx.lineTo(130, 4 + dy * 2);
    ctx.stroke();
  }
  // feet
  ctx.fillStyle = '#E3B3A8';
  for (const fx of [-40, 20, 40]) {
    ctx.beginPath();
    ctx.ellipse(fx, 36, 10, 5, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** a chili plant: stem, leaves, upright fruits (as cabai rawit grows) */
export function plant(ctx, x, y, s, { a = 1, t = 0, grow = 1, fruits = 5, taken = -1, seed = 3 } = {}) {
  if (a <= 0.004 || grow <= 0.001) return [];
  const r = rng(seed);
  const out = [];
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  const k = (s / 100) * eo(grow);
  ctx.scale(k, k);
  const sway = Math.sin(t * 1.3) * 0.03;
  ctx.rotate(sway);
  // stems
  ctx.strokeStyle = '#4E7A32';
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -120, 4, -240);
  ctx.stroke();
  const branches = [[-0.9, -90, 110], [0.8, -130, 120], [-0.7, -180, 90], [0.6, -205, 80], [0, -240, 40]];
  ctx.lineWidth = 6;
  for (const [ang, by, len] of branches) {
    ctx.beginPath();
    ctx.moveTo(0, by);
    ctx.lineTo(Math.sin(ang) * len, by - Math.cos(ang) * len * 0.6);
    ctx.stroke();
  }
  // leaves
  const leaf = (lx, ly, ang, ls) => {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, -ls * 0.3, 0, ls * 0.3);
    g.addColorStop(0, '#76BE52');
    g.addColorStop(1, '#2E6B26');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(ls * 0.5, -ls * 0.3, ls, 0);
    ctx.quadraticCurveTo(ls * 0.5, ls * 0.3, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220,255,200,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ls * 0.9, 0);
    ctx.stroke();
    ctx.restore();
  };
  for (let i = 0; i < 16; i++) {
    const [ang, by, len] = branches[i % branches.length];
    const f = 0.4 + r() * 0.6;
    const lx = Math.sin(ang) * len * f;
    const ly = by - Math.cos(ang) * len * 0.6 * f;
    leaf(lx, ly, -Math.PI / 2 + ang * 1.4 + (r() - 0.5) * 1.6 + Math.sin(t * 2 + i) * 0.04, 60 + r() * 40);
  }
  // fruits pointing up
  for (let i = 0; i < fruits; i++) {
    const [ang, by, len] = branches[i % branches.length];
    const fx = Math.sin(ang) * len * 0.95;
    const fy = by - Math.cos(ang) * len * 0.6 * 0.95;
    if (i === taken) {
      out.push([fx, fy]);
      continue;
    }
    chili(ctx, fx, fy, 64, { rot: -Math.PI / 2 + ang * 0.5 + (r() - 0.5) * 0.4, hue: i % 4 === 3 ? 'orange' : 'red', bend: 0.1, w: 0.2, shadow: 0 });
    out.push([fx, fy]);
  }
  ctx.restore();
  // fruit positions in screen space (for birds and rats)
  const c = Math.cos(sway);
  const sn = Math.sin(sway);
  return out.map(([fx, fy]) => [x + (fx * c - fy * sn) * k, y + (fx * sn + fy * c) * k]);
}

export function seed(ctx, x, y, s, { a = 1, rot = 0, broken = 0 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = '#F2DFA0';
  if (broken > 0.5) {
    for (const [dx, dy, r0] of [[-s * 0.3, 0, 0.4], [s * 0.35, s * 0.1, -0.5], [0, -s * 0.35, 1.2]]) {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(r0);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, s * 0.42, 0, 1.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s * 0.42, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,120,50,0.5)';
    ctx.beginPath();
    ctx.arc(s * 0.4, 0, s * 0.12, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** a seedling that grows with p */
export function sprout(ctx, x, y, s, p, { a = 1 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = '#5E9E3A';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -40 * q, 0, -70 * q);
  ctx.stroke();
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(0, -70 * q);
    ctx.rotate(side * (0.9 - 0.3 * q));
    ctx.fillStyle = side < 0 ? '#7BC452' : '#5FAE3E';
    ctx.beginPath();
    ctx.ellipse(side * 24 * q, -6 * q, 26 * q, 12 * q, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(60,40,24,0.8)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 26, 6, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** a row of chili icons: the "level pedas" picker */
export function levelMeter(ctx, cx, cy, w, level, { p = 1, a = 1, max = 10 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  const step = w / max;
  for (let i = 0; i < max; i++) {
    const x = cx - w / 2 + step * (i + 0.5);
    const on = clamp(level - i);
    const pop = 1 + 0.25 * Math.max(0, 1 - Math.abs(level - i - 0.5) * 2) * (on > 0 && on < 1 ? 1 : 0);
    ctx.save();
    ctx.translate(x, cy);
    ctx.scale(pop, pop);
    if (on > 0.01) {
      chili(ctx, -step * 0.18, step * 0.28, step * 0.62, { rot: -1.2, hue: 'red', bend: 0.12, w: 0.24, a: 0.25 + 0.75 * on, shadow: 0 });
    } else {
      ctx.strokeStyle = 'rgba(232,226,214,0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, step * 0.16, step * 0.3, 0.35, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}


/* ============================ extra props (ep27) ============================ */

/** branching nerve fibres under a tongue: fixed polylines (no per-frame jitter) */
const TREES = new Map();
export function nerveTreePaths(cx, cy, w, h, seed = 5) {
  const key = `${cx},${cy},${w},${h},${seed}`;
  if (TREES.has(key)) return TREES.get(key);
  const r = rng(seed);
  const paths = [];
  const grow = (x, y, ang, len, depth) => {
    const pts = [[x, y]];
    let px = x;
    let py = y;
    const n = 6;
    for (let i = 0; i < n; i++) {
      ang += (r() - 0.5) * 0.5;
      px += Math.cos(ang) * (len / n);
      py += Math.sin(ang) * (len / n);
      pts.push([px, py]);
    }
    paths.push({ pts, depth });
    if (depth < 3) {
      const k = depth === 0 ? 3 : 2;
      for (let j = 0; j < k; j++) {
        const at = pts[2 + Math.floor(r() * 3)];
        grow(at[0], at[1], ang + (r() < 0.5 ? -1 : 1) * (0.35 + r() * 0.5), len * (0.5 + r() * 0.18), depth + 1);
      }
    }
  };
  // two trunks enter from the root (top) and fan toward the tip
  grow(cx - w * 0.12, cy - h * 0.5, Math.PI / 2 + 0.12, h * 0.55, 0);
  grow(cx + w * 0.12, cy - h * 0.5, Math.PI / 2 - 0.12, h * 0.55, 0);
  TREES.set(key, paths);
  return paths;
}

export function nerveTree(ctx, cx, cy, w, h, t, { reveal = 1, on = 1, a = 1, seed = 5, clip = true, rgb = C.nerveRgb } = {}) {
  if (a <= 0.004 || reveal <= 0.001) return;
  const paths = nerveTreePaths(cx, cy, w, h, seed);
  ctx.save();
  ctx.globalAlpha *= a;
  if (clip) {
    tonguePath(ctx, cx, cy, w * 0.96, h * 0.96);
    ctx.clip();
  }
  for (const { pts, depth } of paths) {
    const rv = clamp(reveal * 1.6 - depth * 0.2);
    if (rv <= 0) continue;
    nerve(ctx, pts, t + depth * 0.13, { rgb, lw: Math.max(1.6, 5.5 - depth * 1.3), n: 2, speed: 0.8, on, reveal: rv });
  }
  ctx.restore();
}

/** a round microscope window: a ring, a glass glint, and `inside` drawn clipped */
export function porthole(ctx, cx, cy, r, p, inside, { a = 1, label = '', rgb = '232,226,214', mag = '' } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  const rr0 = r * (0.6 + 0.4 * back(Math.min(1, q * 1.1)));
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.8);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#0B0A0A';
  ctx.beginPath();
  ctx.arc(cx, cy, rr0 + 14, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rr0, 0, TAU);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.scale(rr0 / r, rr0 / r);
  ctx.translate(-cx, -cy);
  inside(ctx);
  ctx.restore();
  // inner shade, glint, ring
  const ig = ctx.createRadialGradient(cx, cy, rr0 * 0.7, cx, cy, rr0);
  ig.addColorStop(0, 'rgba(0,0,0,0)');
  ig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(cx, cy, rr0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = rr0 * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, rr0 * 0.9, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();
  const rg = ctx.createLinearGradient(cx - rr0, cy - rr0, cx + rr0, cy + rr0);
  rg.addColorStop(0, '#8C857C');
  rg.addColorStop(0.5, '#3A3632');
  rg.addColorStop(1, '#1A1816');
  ctx.strokeStyle = rg;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(cx, cy, rr0 + 7, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(${rgb},0.45)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, rr0 + 16, 0, TAU);
  ctx.stroke();
  // tick marks on the ring
  for (let i = 0; i < 48; i++) {
    const an = (i / 48) * TAU;
    const l = i % 4 === 0 ? 14 : 7;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * (rr0 + 20), cy + Math.sin(an) * (rr0 + 20));
    ctx.lineTo(cx + Math.cos(an) * (rr0 + 20 + l), cy + Math.sin(an) * (rr0 + 20 + l));
    ctx.stroke();
  }
  if (label) txt(ctx, label, cx, cy - rr0 - 52, { size: 24, font: F.mono6, color: `rgba(${rgb},0.9)`, align: 'center', track: 5 });
  if (mag) txt(ctx, mag, cx + rr0 * 0.72, cy + rr0 + 62, { size: 22, font: F.mono6, color: `rgba(${rgb},0.7)`, align: 'center', track: 3 });
  ctx.restore();
}

/** tongue surface seen through the scope: pink tissue with papillae */
let SURF = null;
export function tissue(ctx, cx, cy, r, t, { heat = 0, a = 1 } = {}) {
  if (!SURF) {
    const s = 512;
    const cv = createCanvas(s, s);
    const c = cv.getContext('2d');
    const img = c.createImageData(s, s);
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n = fbm3(x / 40, y / 40, 0.3, 4, 91);
        const i = (y * s + x) * 4;
        img.data[i] = 190 + n * 50;
        img.data[i + 1] = 92 + n * 40;
        img.data[i + 2] = 104 + n * 36;
        img.data[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);
    const r0 = rng(93);
    for (let k = 0; k < 120; k++) {
      const x = r0() * s;
      const y = r0() * s;
      const rad = 10 + r0() * 16;
      const g = c.createRadialGradient(x - rad * 0.3, y - rad * 0.4, 1, x, y, rad);
      g.addColorStop(0, 'rgba(255,214,218,0.9)');
      g.addColorStop(0.6, 'rgba(228,128,140,0.7)');
      g.addColorStop(1, 'rgba(120,40,60,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, rad, 0, TAU);
      c.fill();
    }
    SURF = cv;
  }
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.drawImage(SURF, cx - r * 1.1, cy - r * 1.1, r * 2.2, r * 2.2);
  if (heat > 0.01) {
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.1);
    g.addColorStop(0, `rgba(255,120,40,${0.6 * heat})`);
    g.addColorStop(1, `rgba(255,40,20,${0.15 * heat})`);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);
  }
  ctx.restore();
}

/** a casein micelle: a white globule with a fuzzy hairy layer */
export function micelle(ctx, x, y, r, { a = 1, t = 0, seed = 1 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const rr1 = rng(seed);
  ctx.strokeStyle = 'rgba(255,250,240,0.55)';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.lineCap = 'round';
  for (let i = 0; i < 28; i++) {
    const an = (i / 28) * TAU + rr1() * 0.2;
    const l = r * (0.25 + rr1() * 0.2);
    const wob = Math.sin(t * 3 + i) * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(an) * r * 0.92, y + Math.sin(an) * r * 0.92);
    ctx.quadraticCurveTo(
      x + Math.cos(an + wob) * (r + l * 0.6), y + Math.sin(an + wob) * (r + l * 0.6),
      x + Math.cos(an + wob * 2) * (r + l), y + Math.sin(an + wob * 2) * (r + l),
    );
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, '#FFFFFF');
  g.addColorStop(0.65, '#EDE5D8');
  g.addColorStop(1, '#BDB2A2');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  // sub-micelle bumps
  ctx.fillStyle = 'rgba(160,150,135,0.35)';
  for (let i = 0; i < 9; i++) {
    const an = rr1() * TAU;
    const d = rr1() * r * 0.65;
    ctx.beginPath();
    ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, r * (0.12 + rr1() * 0.1), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** a little capsaicin token: a glowing orange droplet with the molecule hint */
export function capsa(ctx, x, y, r, { a = 1, rot = 0, glow = 1 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (glow > 0) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
    g.addColorStop(0, `rgba(255,120,40,${0.45 * glow})`);
    g.addColorStop(1, 'rgba(255,80,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 2.6, y - r * 2.6, r * 5.2, r * 5.2);
  }
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = '#FF9A5A';
  ctx.lineWidth = Math.max(1.5, r * 0.22);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // ring + tail, tiny
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const an = (i / 6) * TAU + Math.PI / 6;
    const px = -r * 0.55 + Math.cos(an) * r * 0.5;
    const py = Math.sin(an) * r * 0.5;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-r * 0.1, 0);
  for (let k = 1; k <= 4; k++) ctx.lineTo(-r * 0.1 + k * r * 0.36, k % 2 ? -r * 0.22 : r * 0.08);
  ctx.stroke();
  ctx.restore();
}

/** a beaker with water below and an oil layer on top */
export function beaker(ctx, x, y, w, h, { a = 1, t = 0, oil = 0.28, p = 1 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return null;
  ctx.save();
  ctx.globalAlpha *= a * clamp(q * 1.6);
  ctx.translate(0, (1 - q) * 50);
  const x0 = x - w / 2;
  const top = y - h / 2;
  const bot = y + h / 2;
  contact(ctx, x, bot + 6, w * 1.3, w * 0.18, 0.5);
  const liqTop = top + h * 0.18;
  const oilB = liqTop + (bot - liqTop) * oil;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x0, top, w, h, [4, 4, 18, 18]);
  ctx.clip();
  const wg = ctx.createLinearGradient(0, oilB, 0, bot);
  wg.addColorStop(0, 'rgba(120,200,255,0.35)');
  wg.addColorStop(1, 'rgba(60,140,220,0.5)');
  ctx.fillStyle = wg;
  ctx.fillRect(x0, oilB, w, bot - oilB);
  const og = ctx.createLinearGradient(0, liqTop, 0, oilB);
  og.addColorStop(0, 'rgba(255,214,90,0.85)');
  og.addColorStop(1, 'rgba(240,170,40,0.85)');
  ctx.fillStyle = og;
  const wv = Math.sin(t * 2.2) * 3;
  ctx.beginPath();
  ctx.moveTo(x0, liqTop + wv);
  ctx.quadraticCurveTo(x, liqTop - wv, x0 + w, liqTop + wv);
  ctx.lineTo(x0 + w, oilB);
  ctx.lineTo(x0, oilB);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,200,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, oilB);
  ctx.lineTo(x0 + w, oilB);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(230,245,255,0.6)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(x0, top, w, h, [4, 4, 18, 18]);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x0 + 12, top + 14, 10, h - 34);
  for (let i = 1; i <= 4; i++) {
    const yy = bot - (i / 5) * h * 0.82;
    ctx.beginPath();
    ctx.moveTo(x0 + w - 4, yy);
    ctx.lineTo(x0 + w - 26, yy);
    ctx.stroke();
  }
  ctx.restore();
  return { liqTop, oilB, bot, x0, w };
}

/** a wall of flame along y, flickering with fixed noise */
export function fireWall(ctx, x0, x1, y, h, t, { a = 1, n = 9, seed = 4 } = {}) {
  if (a <= 0.004 || h < 2) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.globalCompositeOperation = 'screen';
  const glowG = ctx.createLinearGradient(0, y - h * 1.4, 0, y);
  glowG.addColorStop(0, 'rgba(255,90,30,0)');
  glowG.addColorStop(1, 'rgba(255,110,30,0.55)');
  ctx.fillStyle = glowG;
  ctx.fillRect(x0, y - h * 1.4, x1 - x0, h * 1.4);
  for (let i = 0; i < n; i++) {
    const fx = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * 40;
    const fh = h * (0.6 + r() * 0.5) * (0.85 + 0.15 * Math.sin(t * (7 + r() * 5) + i));
    flameIcon(ctx, fx, y, fh, { t: t + i * 0.37 });
  }
  ctx.restore();
}

/** a dusk garden: deep green gradient, leaf bokeh, warm low sun */
export function garden(ctx, t, cam = {}, { a = 1, sun = [1080, 520] } = {}) {
  if (a <= 0.004) return;
  reportBg('garden', a * LA * ctx.globalAlpha);
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0B1A12');
  g.addColorStop(0.55, '#10261A');
  g.addColorStop(1, '#050B07');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const sx = sun[0] + (cam.dx || 0) * 0.3;
  const sy = sun[1] + (cam.dy || 0) * 0.3;
  const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 900);
  sg.addColorStop(0, 'rgba(255,200,120,0.45)');
  sg.addColorStop(0.35, 'rgba(255,170,90,0.12)');
  sg.addColorStop(1, 'rgba(255,170,90,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, H);
  const r = rng(808);
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 26; i++) {
    const x = r() * W + Math.sin(t * 0.3 + i) * 12 + (cam.dx || 0) * (0.4 + r() * 0.6);
    const y = r() * 1700 + Math.cos(t * 0.25 + i) * 10 + (cam.dy || 0) * 0.5;
    const rad = 30 + r() * 110;
    const warm = r() < 0.35;
    const c = warm ? '255,200,120' : r() < 0.5 ? '120,200,110' : '80,160,90';
    const gg = ctx.createRadialGradient(x, y, rad * 0.6, x, y, rad);
    gg.addColorStop(0, `rgba(${c},${0.10 + r() * 0.12})`);
    gg.addColorStop(0.9, `rgba(${c},${0.06})`);
    gg.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TAU);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  rays(ctx, sx, sy, t, { n: 9, len: 2400, dir: Math.PI * 0.62, spread: 1.6, rgb: '255,214,150', a: 0.07, seed: 23 });
  // out-of-focus leaves framing the shot, nearer than everything else
  const fx = (cam.dx || 0) * 1.6;
  const fy = (cam.dy || 0) * 1.6;
  ctx.drawImage(foliageTex(), -70 + fx + Math.sin(t * 0.4) * 6, -70 + fy, W + 140, H + 140);
  const vg = ctx.createRadialGradient(720, 1000, 500, 720, 1000, 1700);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

let FOLIAGE = null;
/** soft dark leaves in the corners, baked at half size so they read out of focus */
function foliageTex() {
  if (FOLIAGE) return FOLIAGE;
  const w = 720;
  const h = 1280;
  const cv = createCanvas(w, h);
  const c = cv.getContext('2d');
  const R = rng(4711);
  const leaf = (x, y, L, an, col, edge) => {
    c.save();
    c.translate(x, y);
    c.rotate(an);
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(L * 0.3, -L * 0.22, L * 0.75, -L * 0.18, L, 0);
    c.bezierCurveTo(L * 0.75, L * 0.18, L * 0.3, L * 0.22, 0, 0);
    c.fillStyle = col;
    c.fill();
    c.strokeStyle = edge;
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(L * 0.05, 0);
    c.lineTo(L * 0.92, 0);
    c.stroke();
    c.restore();
  };
  const clusters = [[-20, 80, 0.4], [740, 40, 2.6], [-30, 760, -0.3], [750, 820, 3.5], [120, 1010, -0.9], [640, 1000, -2.3]];
  for (const [cx, cy, dir] of clusters) {
    for (let k = 0; k < 9; k++) {
      const an = dir + (R() - 0.5) * 1.5;
      const L = 120 + R() * 150;
      const d = R() * 60;
      const g = 14 + R() * 16;
      leaf(cx + Math.cos(an) * d, cy + Math.sin(an) * d, L, an, `rgba(${g * 0.6},${g * 1.5},${g * 0.8},0.92)`, `rgba(120,200,110,${0.08 + R() * 0.08})`);
    }
  }
  // soften: draw it back through a blur, like a lens at f/1.8
  const out = createCanvas(w, h);
  const o = out.getContext('2d');
  o.filter = 'blur(5px)';
  o.drawImage(cv, 0, 0);
  o.filter = 'none';
  FOLIAGE = out;
  return out;
}

/** a soft dashed leader line with a dot at its start */
export function leader(ctx, x0, y0, x1, y1, p, { color = 'rgba(232,226,214,0.6)', a = 1, dash = [7, 8], t = 0, lw = 2.4 } = {}) {
  const q = eo(p);
  if (q <= 0.001 || a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.setLineDash(dash);
  ctx.lineDashOffset = -t * 30;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(lerp(x0, x1, q), lerp(y0, y1, q));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x0, y0, lw * 2.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export { hexA, measure, txt, grain };
