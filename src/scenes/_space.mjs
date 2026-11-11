/**
 * Episode 10 art kit — "Semesta · Lubang Hitam", v2 photographic pass.
 *
 * Everything is still drawn in code, but the light is treated as light: a
 * photosphere with real limb darkening, granulation, faculae and sunspots; a
 * corona built from streamers instead of spokes; a black hole whose ring is a
 * lensed sky and whose disk is doppler-beamed; an atmosphere seen from orbit —
 * a green airglow line, cloud tops, city clusters on the night side.
 *
 * Textures (granulation, plasma, cloud, dust) are value-noise tiles rendered
 * once at module load into offscreen canvases, then composited per frame.
 */
import { createCanvas } from '@napi-rs/canvas';
import { W, H, txt, hexA, linGrad, radGrad } from '../engine/draw.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';

export const S = {
  void: '#03050A',
  deep: '#060A12',
  navy: '#0A1220',
  steel: '#18253B',
  blue: '#2E5C9A',
  ice: '#CFE6F2',
  ice2: '#8FB8CE',
  ice3: '#4E7C93',
  bone: '#F3EFE4',
  amber: '#FFB03A',
  sun: '#FFD27A',
  ember: '#FF6B1A',
  rust: '#C4563A',
  paper: '#F4ECDC',
  ink: '#171310',
};

/* ------------------------------- textures --------------------------------- */

const smooth = (v) => v * v * (3 - 2 * v);

/**
 * Value-noise tile. `mode='gray'` gives an opaque grey image (for 'overlay'),
 * `mode='alpha'` gives white with the noise in the alpha channel (for 'screen').
 */
function noiseTile(size, octaves, seed, { stretch = [1, 1], mode = 'alpha', contrast = 1, bias = 0 } = {}) {
  const cv = createCanvas(size, size);
  const cx = cv.getContext('2d');
  const img = cx.createImageData(size, size);
  const r = rng(seed);
  const layers = octaves.map((o) => {
    const n = o.g;
    const arr = new Float32Array(n * n);
    for (let i = 0; i < arr.length; i++) arr[i] = r();
    return { n, arr, amp: o.amp };
  });
  const [sx, sy] = stretch;
  const at = (L, i, j) => L.arr[(((j % L.n) + L.n) % L.n) * L.n + (((i % L.n) + L.n) % L.n)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      let tot = 0;
      for (const L of layers) {
        const fx = (x / size) * sx * L.n;
        const fy = (y / size) * sy * L.n;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = smooth(fx - x0);
        const ty = smooth(fy - y0);
        const v00 = at(L, x0, y0);
        const v10 = at(L, x0 + 1, y0);
        const v01 = at(L, x0, y0 + 1);
        const v11 = at(L, x0 + 1, y0 + 1);
        const v0 = v00 + (v10 - v00) * tx;
        const v1 = v01 + (v11 - v01) * tx;
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
    // photosphere granulation: fine cells
    gran: noiseTile(256, [{ g: 40, amp: 1 }, { g: 80, amp: 0.7 }, { g: 160, amp: 0.35 }], 11, { contrast: 1.5, mode: 'gray' }),
    gran2: noiseTile(256, [{ g: 22, amp: 1 }, { g: 52, amp: 0.6 }], 19, { contrast: 1.3, mode: 'gray' }),
    // plasma turbulence for the accretion disk
    plasma: noiseTile(256, [{ g: 10, amp: 1 }, { g: 24, amp: 0.7 }, { g: 56, amp: 0.4 }], 23, { contrast: 1.7, stretch: [1, 1] }),
    // cloud tops, stretched east-west
    cloud: noiseTile(512, [{ g: 6, amp: 1 }, { g: 14, amp: 0.65 }, { g: 34, amp: 0.4 }, { g: 80, amp: 0.22 }], 29, { stretch: [1.6, 1], contrast: 1.35 }),
    // milky way dust
    dust: noiseTile(512, [{ g: 3, amp: 1 }, { g: 7, amp: 0.55 }, { g: 18, amp: 0.3 }], 31, { stretch: [1, 2.2], contrast: 1.2 }),
    // sea ice / snow drift
    snow: noiseTile(256, [{ g: 8, amp: 1 }, { g: 24, amp: 0.6 }, { g: 70, amp: 0.3 }], 37, { stretch: [1.8, 1], contrast: 1.2 }),
  };
  return TEX;
}

/** Draw a texture square centred at (x,y) at `size`, rotated, tiled. */
function drawTex(ctx, img, x, y, size, rot = 0, alpha = 1, composite = 'overlay') {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.globalCompositeOperation = composite;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}

/* corona: the granulation tile, masked into a ring so it never shows an edge */
const coronaCache = new Map();
function coronaMask(pad = 1.95) {
  const key = pad.toFixed(2);
  const hit = coronaCache.get(key);
  if (hit) return hit;
  const T = tex();
  const SZ = 1024;
  const cv = createCanvas(SZ, SZ);
  const c = cv.getContext('2d');
  c.drawImage(T.gran, 0, 0, SZ, SZ);
  c.globalCompositeOperation = 'destination-in';
  const rEdge = 512 / pad; // the disc edge, in tile pixels
  const g = c.createRadialGradient(512, 512, rEdge * 0.96, 512, 512, 512);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.05, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.5)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.18)');
  g.addColorStop(0.85, 'rgba(255,255,255,0.04)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, SZ, SZ);
  coronaCache.set(key, cv);
  return cv;
}

/* the ice sheet's surface texture, masked so no corner of the tile shows */
const iceCache = new Map();
function iceSheet(w, h) {
  const key = `${Math.round(w)}x${Math.round(h)}`;
  const hit = iceCache.get(key);
  if (hit) return hit;
  const T = tex();
  const SW = 1024;
  const SH = Math.max(256, Math.round((SW * h) / w));
  const cv = createCanvas(SW, SH);
  const c = cv.getContext('2d');
  c.drawImage(T.snow, 0, 0, SW, SH);
  c.globalAlpha = 0.55;
  c.globalCompositeOperation = 'overlay';
  c.drawImage(T.snow, 0, -SH * 0.2, SW * 1.15, SH * 1.3);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'destination-in';
  const g = c.createLinearGradient(0, 0, 0, SH);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.10, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.32, 'rgba(255,255,255,1)');
  g.addColorStop(0.82, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0.25)');
  c.fillStyle = g;
  c.fillRect(0, 0, SW, SH);
  // and off at the sides
  const gx = c.createLinearGradient(0, 0, SW, 0);
  gx.addColorStop(0, 'rgba(255,255,255,0)');
  gx.addColorStop(0.14, 'rgba(255,255,255,1)');
  gx.addColorStop(0.86, 'rgba(255,255,255,1)');
  gx.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = gx;
  c.fillRect(0, 0, SW, SH);
  iceCache.set(key, cv);
  return cv;
}

/* cloud tops: the cloud tile, faded away from the point where the sun rises.
   Built once per (radius, sun offset) and reused, so no per-frame compositing. */
const cloudCache = new Map();
function cloudMask(cx, r, dawnX, topY) {
  const dx = dawnX - cx;
  const dy = (topY ?? -r) + r;
  const key = `${Math.round(r)}|${Math.round(dx / 12)}`;
  const hit = cloudCache.get(key);
  if (hit) return hit;
  const T = tex();
  const SZ = 512;
  const cv = createCanvas(SZ, SZ);
  const c = cv.getContext('2d');
  c.drawImage(T.cloud, 0, 0, SZ, SZ);
  c.globalCompositeOperation = 'destination-in';
  const k = SZ / (r * 2.4); // world units → tile pixels
  const g = c.createRadialGradient(
    SZ / 2 + dx * k, SZ / 2 + dy * k, r * 0.15 * k,
    SZ / 2 + dx * k, SZ / 2 + dy * k, r * 1.75 * k,
  );
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.72)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, SZ, SZ);
  if (cloudCache.size > 32) cloudCache.delete(cloudCache.keys().next().value);
  cloudCache.set(key, cv);
  return cv;
}

/* ------------------------------- star field ------------------------------- */

// deterministic pseudo-random in [0,1) from an integer
const hash = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function starfield(ctx, {
  n = 240, seed = 7, t = 0, a = 1, top = -80, bottom = H + 80,
  band = 0, bandY = 780, bandH = 620,
} = {}) {
  if (a <= 0.01) return;
  const r = rng(seed);
  const T = tex();
  ctx.save();
  ctx.globalAlpha *= a;

  // the milky way: a soft band of light from overlapping glows, plus the dust
  // it hides. Nothing here has a straight edge.
  if (band > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 30; i++) {
      const q = hash(i * 13 + 3);
      const bx = -120 + (i / 29) * (W + 240) + (q - 0.5) * 110;
      const by = bandY + Math.sin(i * 0.63) * bandH * 0.14 + (hash(i * 7 + 2) - 0.5) * bandH * 0.42;
      const rr = bandH * (0.20 + hash(i * 5 + 1) * 0.34);
      const g = radGrad(ctx, bx, by, 0, rr, [
        [0, `rgba(146,166,212,${0.05 * band})`],
        [0.42, `rgba(116,138,190,${0.028 * band})`],
        [0.75, `rgba(96,116,168,${0.011 * band})`],
        [1, 'rgba(90,110,160,0)'],
      ]);
      ctx.globalAlpha = a;
      ctx.fillStyle = g;
      ctx.fillRect(bx - rr, by - rr, rr * 2, rr * 2);
    }
    ctx.restore();
  }

  for (let i = 0; i < n; i++) {
    const x = r() * (W + 200) - 100;
    const y = top + r() * (bottom - top);
    // a real magnitude distribution: almost everything is faint
    const q = Math.pow(r(), 2.1);
    const size = 0.55 + q * 2.3;
    const tw = 0.72 + 0.28 * Math.sin(t * (0.5 + hash(i) * 1.4) + i * 1.73);
    const warm = hash(i + 900);
    const col = warm > 0.82 ? '255,226,190' : warm > 0.5 ? '235,240,255' : '198,216,255';
    ctx.globalAlpha = a * (0.18 + q * 0.9) * tw;
    ctx.fillStyle = `rgb(${col})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.fill();
    if (q > 0.93) {
      // the brightest few get a halo and a short diffraction cross
      const gl = radGrad(ctx, x, y, 0, size * 7, [
        [0, `rgba(${col},0.5)`],
        [1, `rgba(${col},0)`],
      ]);
      ctx.globalAlpha = a * 0.55 * tw;
      ctx.fillStyle = gl;
      ctx.fillRect(x - size * 7, y - size * 7, size * 14, size * 14);
      ctx.globalAlpha = a * 0.32 * tw;
      ctx.strokeStyle = `rgb(${col})`;
      ctx.lineWidth = Math.max(0.8, size * 0.35);
      const L = size * (7 + hash(i) * 8);
      ctx.beginPath();
      ctx.moveTo(x - L, y);
      ctx.lineTo(x + L, y);
      ctx.moveTo(x, y - L);
      ctx.lineTo(x, y + L);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ---------------------------------- star ---------------------------------- */

export function sunDisc(ctx, x, y, r, { a = 1, t = 0, rays = 1, tone = 1, spots = 1 } = {}) {
  if (a <= 0.01 || r <= 0.5) return;
  const T = tex();
  ctx.save();
  ctx.globalAlpha *= a;

  /* --- corona ------------------------------------------------------------ */
  // broad, soft, warm at the base
  const halo = radGrad(ctx, x, y, r * 0.97, r * 3.6, [
    [0, `rgba(255,232,184,${0.42 * tone})`],
    [0.09, `rgba(255,206,138,${0.24 * tone})`],
    [0.26, `rgba(255,172,102,${0.09 * tone})`],
    [0.62, `rgba(255,150,86,${0.025 * tone})`],
    [1, 'rgba(255,140,80,0)'],
  ]);
  ctx.fillStyle = halo;
  ctx.fillRect(x - r * 3.7, y - r * 3.7, r * 7.4, r * 7.4);

  // turbulent corona: the granulation tile, smeared outward in a ring
  if (rays > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r * 1.34, 0, TAU);
    ctx.arc(x, y, r * 0.99, 0, TAU, true);
    ctx.clip();
    ctx.globalCompositeOperation = 'screen';
    // a thin, bright fringe hugging the limb
    const rt = radGrad(ctx, x, y, r * 0.99, r * 1.30, [
      [0, `rgba(255,226,180,${0.42 * rays})`],
      [0.4, `rgba(255,196,140,${0.16 * rays})`],
      [1, 'rgba(255,170,110,0)'],
    ]);
    ctx.globalAlpha = a * rays;
    ctx.fillStyle = rt;
    ctx.fillRect(x - r * 1.3, y - r * 1.3, r * 2.6, r * 2.6);
    // one masked ring of granulation, so the fringe has structure without a tile
    {
      const sc = r * 2.44;
      ctx.globalAlpha = a * rays * 0.16;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 0.012);
      ctx.drawImage(coronaMask(1.22), -sc / 2, -sc / 2, sc, sc);
      ctx.restore();
    }
    ctx.restore();

    // a handful of long, very faint streamers
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 22; i++) {
      const q = hash(i * 17 + 5);
      const ang = (i / 22) * TAU + q * 0.24 + t * 0.02;
      const len = r * (1.10 + q * 0.42);
      ctx.globalAlpha = a * rays * (0.010 + q * 0.016) * tone;
      ctx.strokeStyle = '#FFD9B0';
      ctx.lineWidth = r * (0.014 + q * 0.03);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ang) * r * 1.02, y + Math.sin(ang) * r * 1.02);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* --- photosphere ------------------------------------------------------- */
  ctx.globalAlpha = a;
  const disc = radGrad(ctx, x, y, r * 0.02, r, [
    [0, '#FFFDF4'],
    [0.42, '#FFF6D8'],
    [0.72, '#FFE3A6'],
    [0.88, '#FFC172'],
    [0.95, '#FF8E3E'],
    [1, '#CE5115'],
  ]);
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();

  // granulation + faculae, both clipped to the disc and drifting
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.995, 0, TAU);
  ctx.clip();
  drawTex(ctx, T.gran, x, y, r * 2.6, t * 0.015, 0.42 * tone, 'soft-light');
  drawTex(ctx, T.gran2, x, y, r * 1.5, -t * 0.022, 0.30 * tone, 'soft-light');
  drawTex(ctx, T.gran, x + r * 0.2, y - r * 0.1, r * 4.2, t * 0.008, 0.14 * tone, 'overlay');

  // sunspots: umbra inside a softer penumbra
  if (spots > 0) {
    for (const [sx, sy, sr, al] of [[-0.38, -0.24, 0.05, 0.8], [0.26, 0.33, 0.034, 0.7], [0.5, -0.36, 0.024, 0.6]]) {
      const px = x + sx * r;
      const py = y + sy * r;
      const pr = sr * r;
      const pg = radGrad(ctx, px, py, 0, pr * 3.2, [
        [0, `rgba(104,52,22,${0.5 * al})`],
        [0.34, `rgba(140,80,38,${0.3 * al})`],
        [0.66, `rgba(176,116,62,${0.11 * al})`],
        [1, 'rgba(186,128,72,0)'],
      ]);
      ctx.globalAlpha = a;
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(px, py, pr * 2.4, pr * 1.5, 0.5, 0, TAU);
      ctx.fill();
      // umbra: small, soft, not a hole
      const ug = radGrad(ctx, px, py, 0, pr * 0.95, [
        [0, `rgba(46,18,8,${0.86 * al})`],
        [0.62, `rgba(74,32,14,${0.6 * al})`],
        [1, 'rgba(104,52,22,0.16)'],
      ]);
      ctx.fillStyle = ug;
      ctx.beginPath();
      ctx.ellipse(px, py, pr * 0.9, pr * 0.55, 0.5, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  // chromosphere: a thin dark-red rind, brighter where the limb is seen edge-on
  ctx.globalAlpha = a * 0.34;
  ctx.strokeStyle = '#FFB079';
  ctx.lineWidth = Math.max(1.2, r * 0.008);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.997, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = a * 0.26;
  ctx.strokeStyle = '#FFE9C8';
  ctx.lineWidth = Math.max(0.8, r * 0.0035);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.985, 0, TAU);
  ctx.stroke();

  // prominences: a few plasma loops lifting off the limb, never over the disc
  ctx.save();
  ctx.beginPath();
  ctx.rect(-400, -400, W + 800, H + 800);
  ctx.arc(x, y, r * 0.99, 0, TAU, true);
  ctx.clip('evenodd');
  ctx.globalAlpha = a;
  for (const [ang, span, hh, al] of [[0.62, 0.3, 0.26, 0.55], [-2.16, 0.24, 0.17, 0.42], [2.62, 0.2, 0.13, 0.34]]) {
    const x0 = x + Math.cos(ang) * r;
    const y0 = y + Math.sin(ang) * r;
    const x1 = x + Math.cos(ang + span) * r;
    const y1 = y + Math.sin(ang + span) * r;
    const mx = x + Math.cos(ang + span * 0.5) * r * (1 + hh);
    const my = y + Math.sin(ang + span * 0.5) * r * (1 + hh);
    ctx.save();
    ctx.globalAlpha = a * al;
    ctx.strokeStyle = '#FF5A2A';
    ctx.lineWidth = Math.max(2, r * 0.014);
    ctx.shadowColor = 'rgba(255,90,40,0.8)';
    ctx.shadowBlur = r * 0.05;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(mx, my, x1, y1);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}

/* ------------------------------- black hole ------------------------------- */

/** The lensed sky: arcs of starlight dragged around the shadow. */
function lensRing(ctx, x, y, R, { t = 0, a = 1, strength = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 26; i++) {
    const q = hash(i * 3 + 11);
    const rad = R * (1.28 + q * 0.72);
    const a0 = hash(i * 5 + 2) * TAU + t * 0.05;
    const span = 0.18 + hash(i * 7 + 5) * 0.5;
    ctx.globalAlpha = a * strength * (0.02 + q * 0.05);
    ctx.strokeStyle = q > 0.7 ? 'rgba(255,226,196,1)' : 'rgba(196,216,255,1)';
    ctx.lineWidth = Math.max(2, R * (0.012 + q * 0.022));
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad, 0, a0, a0 + span);
    ctx.stroke();
  }
  ctx.restore();
}

export function bhDisc(ctx, x, y, r, {
  a = 1, t = 0, glow = 1, ring = 1, hot = 0, tone = 1,
} = {}) {
  if (a <= 0.01 || r <= 0.2) return;
  const R = Math.max(r, 1);
  const T = tex();
  ctx.save();
  ctx.globalAlpha *= a;

  // gravitational light bending, seen as a bright halo of dragged sky
  if (glow > 0) {
    const g = radGrad(ctx, x, y, R * 0.98, R * 2.6, [
      [0, `rgba(${hot > 0.4 ? '255,200,150' : '205,222,255'},${(0.14 + hot * 0.22) * glow * tone})`],
      [0.35, `rgba(${hot > 0.4 ? '255,160,100' : '170,196,255'},${(0.05 + hot * 0.12) * glow * tone})`],
      [1, 'rgba(150,180,255,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(x - R * 3, y - R * 3, R * 6, R * 6);
    lensRing(ctx, x, y, R, { t, a: glow, strength: hot > 0.4 ? 0.5 : 1 });
  }

  // the disk, when this hole is being fed
  if (hot > 0) {
    accretion(ctx, x, y, R, { t, a: hot, back: true });
  }

  // the shadow: nothing comes back out of it
  ctx.globalAlpha = a;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x, y, R * 0.985, 0, TAU);
  ctx.fill();

  // the front of the disk crosses in front of the shadow
  if (hot > 0) {
    accretion(ctx, x, y, R, { t, a: hot, back: false });
  }

  // photon ring: razor thin, brightest where the disk's light is beamed at us
  if (ring > 0) {
    const flick = 0.85 + 0.15 * Math.sin(t * 1.7);
    const pr = R * 1.055;
    ctx.save();
    ctx.globalAlpha = a * ring * flick;
    ctx.strokeStyle = hot > 0.4 ? '#FFF1CE' : '#E4EDFF';
    ctx.lineWidth = Math.max(1, R * 0.011);
    ctx.shadowColor = hot > 0.4 ? 'rgba(255,214,150,0.95)' : 'rgba(190,214,255,0.9)';
    ctx.shadowBlur = Math.min(34, R * 0.5);
    ctx.beginPath();
    ctx.arc(x, y, pr, 0, TAU);
    ctx.stroke();
    // bloom: the ring's light spills a little into the sky
    ctx.globalAlpha = a * ring * flick * 0.30;
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(3, R * 0.055);
    ctx.strokeStyle = hot > 0.4 ? 'rgba(255,208,150,0.55)' : 'rgba(190,214,255,0.5)';
    ctx.beginPath();
    ctx.arc(x, y, pr, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // brightness variations travelling around the ring
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 7; i++) {
      const p0 = (t * 0.14 + i * 0.143) % 1;
      const a0 = p0 * TAU;
      ctx.globalAlpha = a * ring * 0.42 * (0.4 + 0.6 * hash(i * 13 + 7));
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(1, R * 0.013);
      ctx.beginPath();
      ctx.arc(x, y, pr, a0, a0 + 0.16 + hash(i) * 0.2);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

/**
 * The disk, baked once per radius: a circular sheet of glowing gas in the disk
 * plane, masked by a radial gradient so it has no edge. Drawing it squashed is
 * what gives the low inclination; the streaks on top give the motion.
 */
const FLAT = 0.17; // disk height as a fraction of its radius
const diskCache = new Map();
function diskSheet(R) {
  const key = Math.round(R);
  const hit = diskCache.get(key);
  if (hit) return hit;
  const T = tex();
  const SZ = 1024;
  const cv = createCanvas(SZ, SZ);
  const c = cv.getContext('2d');
  const mid = SZ / 2;
  const k = mid / 2.05; // one disk radius in sprite pixels
  // base glow: hot at the innermost stable orbit, colder outward
  const g = c.createRadialGradient(mid, mid, k * 0.92, mid, mid, mid);
  g.addColorStop(0, 'rgba(255,242,218,0.92)');
  g.addColorStop(0.09, 'rgba(255,198,134,0.82)');
  g.addColorStop(0.28, 'rgba(255,142,66,0.50)');
  g.addColorStop(0.58, 'rgba(206,80,32,0.22)');
  g.addColorStop(0.84, 'rgba(148,56,24,0.06)');
  g.addColorStop(1, 'rgba(112,40,20,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, SZ, SZ);
  // structure: plasma turbulence, spiralled so it wraps around the hole
  c.save();
  c.globalCompositeOperation = 'overlay';
  c.globalAlpha = 0.6;
  for (let i = 0; i < 3; i++) {
    c.save();
    c.translate(mid, mid);
    c.rotate(i * 2.1);
    c.scale(1, 0.55 + i * 0.2);
    c.drawImage(T.plasma, -mid, -mid, SZ, SZ);
    c.restore();
  }
  c.restore();
  c.save();
  c.globalCompositeOperation = 'destination-in';
  const m = c.createRadialGradient(mid, mid, k * 0.9, mid, mid, mid);
  m.addColorStop(0, 'rgba(255,255,255,1)');
  m.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  m.addColorStop(0.72, 'rgba(255,255,255,0.35)');
  m.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = m;
  c.fillRect(0, 0, SZ, SZ);
  // nothing shines inside the innermost orbit: punch the hole out of the sheet
  c.globalCompositeOperation = 'destination-out';
  const hole = c.createRadialGradient(mid, mid, k * 0.62, mid, mid, k * 0.95);
  hole.addColorStop(0, 'rgba(0,0,0,1)');
  hole.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = hole;
  c.fillRect(0, 0, SZ, SZ);
  c.globalCompositeOperation = 'destination-in';
  // beaming: the side swinging toward the viewer is the bright one
  const bm = c.createLinearGradient(0, 0, SZ, 0);
  bm.addColorStop(0, 'rgba(255,255,255,1)');
  bm.addColorStop(0.42, 'rgba(255,255,255,0.62)');
  bm.addColorStop(0.62, 'rgba(255,255,255,0.34)');
  bm.addColorStop(1, 'rgba(255,255,255,0.16)');
  c.fillStyle = bm;
  c.fillRect(0, 0, SZ, SZ);
  c.restore();
  if (diskCache.size > 8) diskCache.delete(diskCache.keys().next().value);
  diskCache.set(key, cv);
  return cv;
}

/** Doppler-beamed accretion disk. The near side crosses in front of the shadow. */
export function accretion(ctx, x, y, R, { a = 1, t = 0, back = true, tilt = -0.11, tone = 1 } = {}) {
  if (a <= 0.01) return;
  const rx = R * 2.05;
  const ry = rx * FLAT;
  const sheet = diskSheet(R);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.globalAlpha *= a;

  // only one half at a time: the shadow sits between them
  ctx.beginPath();
  if (back) ctx.rect(-rx * 1.6, -ry * 2.2, rx * 3.2, ry * 2.2);
  else ctx.rect(-rx * 1.6, 0, rx * 3.2, ry * 2.2);
  ctx.clip();

  ctx.globalCompositeOperation = 'lighter';

  // the gas sheet (doppler beaming is already baked into it)
  ctx.globalAlpha = a * 0.72 * tone;
  ctx.drawImage(sheet, -rx, -ry, rx * 2, ry * 2);

  // fine streaks: they carry the rotation, the eye reads them as speed
  const N = 120;
  ctx.lineCap = 'round';
  for (let i = 0; i < N; i++) {
    const q = hash(i * 5 + 1);
    const rr = 1.04 + Math.pow(q, 0.6) * 1.0;
    const rad = R * rr;
    const a0 = hash(i * 7 + 3) * TAU + t * (0.45 + hash(i) * 0.55);
    const span = 0.2 + hash(i * 11 + 5) * 1.0;
    const heat = 1 - (rr - 1.04) / 1.0;
    const beamed = (1 - Math.cos(a0 + span * 0.5)) * 0.5;
    const warm = 1 - beamed;
    ctx.globalAlpha = a * (0.05 + hash(i + 9) * 0.12) * (0.3 + heat * 1.2) * (0.5 + beamed * 1.3) * tone;
    ctx.strokeStyle = `rgb(255,${Math.round(lerp(150, 250, beamed))},${Math.round(lerp(90, 236, beamed))})`;
    ctx.lineWidth = R * (0.012 + q * 0.035);
    ctx.beginPath();
    ctx.ellipse(0, 0, rad, rad * FLAT * (0.95 + hash(i * 21 + 6) * 0.1), 0, a0, a0 + span);
    ctx.stroke();
  }

  // the inner edge is a wall of light: two thin annuli, no wash
  for (let i = 0; i < 2; i++) {
    const rad = R * (1.02 + i * 0.075);
    ctx.globalAlpha = a * (0.5 - i * 0.2) * tone;
    ctx.strokeStyle = ['#FFF6E6', '#FFC998'][i];
    ctx.lineWidth = R * (0.038 - i * 0.014);
    ctx.beginPath();
    ctx.ellipse(0, 0, rad, rad * FLAT, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();

  // the far side of the disk, lensed into arcs over the shadow
  if (back) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const rad = R * (1.03 + i * 0.08);
      ctx.globalAlpha = a * (0.34 - i * 0.075) * tone;
      ctx.strokeStyle = i === 0 ? '#FFF7E8' : '#FFC089';
      ctx.lineWidth = R * (0.05 - i * 0.01);
      ctx.shadowColor = 'rgba(255,206,150,0.85)';
      ctx.shadowBlur = R * 0.35;
      ctx.beginPath();
      ctx.ellipse(0, 0, rad, rad * 0.30, 0, Math.PI * 1.16, Math.PI * 1.84);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* --------------------------------- planet --------------------------------- */

/** Earth from orbit: night side with cloud tops, airglow and city clusters. */
export function limb(ctx, cx, cy, r, {
  a = 1, t = 0, glow = 1, lights = 1, dawn = 0, dawnX = 1260, clouds = 1,
} = {}) {
  if (a <= 0.01) return;
  const T = tex();
  ctx.save();
  ctx.globalAlpha *= a;

  // the body: a dark ocean under a thin skin of air
  const g = radGrad(ctx, cx, cy, r * 0.4, r + 24, [
    [0, '#010205'],
    [0.6, '#03080F'],
    [0.86, '#061726'],
    [0.96, '#0A2C44'],
    [1, '#14506E'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();

  // cloud tops, only where the sun would still reach them
  if (clouds > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, TAU);
    ctx.clip();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = a * 0.85 * clouds;
    ctx.drawImage(cloudMask(cx, r, dawnX, cy - r), cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);
    ctx.restore();
  }

  // warm dawn creeping over the terminator
  if (dawn > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, TAU);
    ctx.clip();
    const dg = radGrad(ctx, dawnX, cy - r + 150, 10, 520, [
      [0, `rgba(255,214,164,${0.34 * dawn})`],
      [0.5, `rgba(255,168,104,${0.12 * dawn})`],
      [1, 'rgba(255,160,100,0)'],
    ]);
    ctx.fillStyle = dg;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  // airglow: the green-cyan line that is all the atmosphere really is
  if (glow > 0) {
    const haze = radGrad(ctx, cx, cy, r - 6, r + 120, [
      [0, 'rgba(110,190,220,0)'],
      [0.24, `rgba(120,214,226,${0.30 * glow})`],
      [0.5, `rgba(150,214,255,${0.16 * glow})`],
      [1, 'rgba(120,170,240,0)'],
    ]);
    ctx.fillStyle = haze;
    ctx.fillRect(cx - r - 130, cy - r - 130, (r + 130) * 2, (r + 130) * 2);

    ctx.save();
    ctx.strokeStyle = `rgba(196,242,238,${0.9 * glow})`;
    ctx.lineWidth = Math.max(2.5, r * 0.0035);
    ctx.shadowColor = 'rgba(150,230,235,0.95)';
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 1.5, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,214,170,${0.32 * glow * (0.4 + dawn)})`;
    ctx.lineWidth = Math.max(1.4, r * 0.002);
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // cities: clusters, not confetti
  if (lights > 0) {
    const rl = rng(303);
    const clusters = 26;
    for (let c = 0; c < clusters; c++) {
      const ang = -Math.PI * 0.96 + rl() * Math.PI * 0.92;
      const rr = r - 12 - rl() * r * 0.2;
      const bx = cx + Math.cos(ang) * rr;
      const by = cy + Math.sin(ang) * rr;
      const n = 3 + Math.floor(rl() * 9);
      const spread = 6 + rl() * 26;
      for (let i = 0; i < n; i++) {
        const x = bx + (rl() - 0.5) * spread;
        const y = by + (rl() - 0.5) * spread * 0.7;
        const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + rl() * 1.6) + i * 2.1);
        ctx.globalAlpha = a * lights * (0.25 + rl() * 0.55) * tw;
        ctx.fillStyle = rl() > 0.74 ? '#FFE9C0' : '#FFB765';
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + rl() * 2.6, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = a * lights * 0.10;
      const cg2 = radGrad(ctx, bx, by, 2, spread * 1.6, [[0, 'rgba(255,190,120,0.75)'], [1, 'rgba(255,170,90,0)']]);
      ctx.fillStyle = cg2;
      ctx.fillRect(bx - spread * 1.6, by - spread * 1.6, spread * 3.2, spread * 3.2);
    }
  }
  ctx.restore();
}

/** A whole planet, for the rare wide shot. */
export function earth(ctx, cx, cy, r, { a = 1, t = 0, spin = 0, light = 'left' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.clip();
  const lx = light === 'left' ? -0.4 : 0.4;
  const g = radGrad(ctx, cx + lx * r, cy - r * 0.3, r * 0.05, r * 1.55, [
    [0, '#3E7FB0'],
    [0.5, '#17517D'],
    [1, '#06203A'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  const tg = linGrad(ctx, cx + (light === 'left' ? -r * 0.6 : r * 0.15), cy - r, cx + r * 1.25, cy + r, [
    [0, 'rgba(1,3,8,0)'],
    [0.5, 'rgba(1,3,8,0.4)'],
    [1, 'rgba(1,2,6,0.94)'],
  ]);
  ctx.fillStyle = tg;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

/* --------------------------------- orbits --------------------------------- */

export function orbitPos(cx, cy, rx, ry, ang, rot = 0) {
  const x = Math.cos(ang) * rx;
  const y = Math.sin(ang) * ry;
  return {
    x: cx + x * Math.cos(rot) - y * Math.sin(rot),
    y: cy + x * Math.sin(rot) + y * Math.cos(rot),
  };
}

export function orbit(ctx, cx, cy, rx, ry, {
  a = 1, rot = 0, color = 'rgba(150,190,240,0.34)', lw = 2, prog = 1, from = 0, dash = null,
} = {}) {
  if (a <= 0.01 || prog <= 0) return;
  const n = 200;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= n * prog; i++) {
    const ang = from + (i / n) * TAU;
    const p = orbitPos(cx, cy, rx, ry, ang, rot);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.restore();
}

/* --------------------------------- ice ------------------------------------ */

export function iceSea(ctx, y0, { t = 0, h = H - y0 + 120, seed = 5, a = 1 } = {}) {
  if (a <= 0.01) return;
  const T = tex();
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;

  const g = linGrad(ctx, 0, y0, 0, y0 + h, [
    [0, '#5B7B8C'],
    [0.18, '#7C9EAD'],
    [0.5, '#A7C4D0'],
    [0.82, '#C6DCE4'],
    [1, '#D6E7EC'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(-240, y0, W + 480, h);

  // sheen: low sunlight would be gone, but the sky still pools on the ice
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const sh = radGrad(ctx, W * 0.5, y0 + 40, 40, W * 0.95, [
    [0, 'rgba(198,224,236,0.30)'],
    [0.4, 'rgba(170,200,216,0.14)'],
    [1, 'rgba(140,180,200,0)'],
  ]);
  ctx.fillStyle = sh;
  ctx.fillRect(-240, y0, W + 480, h);
  ctx.restore();

  // snow drift texture, masked into the sheet
  ctx.save();
  ctx.globalAlpha = a * 0.5;
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(iceSheet(W + 480, h), -240, y0, W + 480, h);
  ctx.restore();

  // horizon haze
  const hz = linGrad(ctx, 0, y0 - 70, 0, y0 + 110, [
    [0, 'rgba(10,20,30,0)'],
    [0.45, 'rgba(10,22,32,0.62)'],
    [1, 'rgba(10,22,32,0)'],
  ]);
  ctx.fillStyle = hz;
  ctx.fillRect(-240, y0 - 70, W + 480, 180);

  // pressure ridges
  for (let i = 0; i < 30; i++) {
    const x = -80 + r() * (W + 160);
    const y = y0 + 8 + r() * 70;
    const w = 40 + r() * 150;
    const hh = 3 + r() * 10;
    ctx.globalAlpha = a * (0.10 + r() * 0.18);
    ctx.fillStyle = '#E6F2F7';
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x - w * 0.16, y - hh);
    ctx.lineTo(x + w * 0.14, y - hh * 0.65);
    ctx.lineTo(x + w / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = a * (0.10 + r() * 0.12);
    ctx.fillStyle = '#43677A';
    ctx.fillRect(x - w * 0.06, y - 1.5, w * 0.46, 2.5);
  }

  // cracks
  for (let i = 0; i < 18; i++) {
    let x = -60 + r() * (W + 120);
    let y = y0 + 40 + r() * (h - 60);
    const seg = 6 + Math.floor(r() * 6);
    ctx.globalAlpha = a * (0.14 + r() * 0.26);
    ctx.strokeStyle = '#3F6274';
    ctx.lineWidth = 0.9 + r() * 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < seg; k++) {
      x += (r() - 0.5) * 200;
      y += (r() - 0.35) * 70;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = a * 0.26;
    ctx.strokeStyle = '#F4FCFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // glitter
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 260; i++) {
    const x = r() * W;
    const y = y0 + 30 + r() * (h - 30);
    const tw = 0.35 + 0.65 * Math.sin(t * 1.1 + i);
    ctx.globalAlpha = a * 0.14 * tw;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, 2.2, 2.2);
  }
  ctx.restore();
}

/* --------------------------------- small bits ----------------------------- */

export function rule(ctx, x0, x1, y, { color = 'rgba(23,19,16,0.35)', ticks = 0, a = 1, lw = 1.5 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  for (let i = 0; i <= ticks; i++) {
    const x = x0 + ((x1 - x0) * i) / Math.max(1, ticks);
    ctx.beginPath();
    ctx.moveTo(x, y - 7);
    ctx.lineTo(x, y + 7);
    ctx.stroke();
  }
  ctx.restore();
}

export function leader(ctx, x0, y0, x1, y1, { color = 'rgba(23,19,16,0.55)', a = 1, dot = 1, lw = 1.6 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  if (dot) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x1, y1, 4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
