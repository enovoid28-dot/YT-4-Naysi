/**
 * A planet, painted.
 *
 * The surface is a procedural equirectangular map — oceans with depth, biomes,
 * ice caps, cloud fields, city lights. The globe itself is drawn the way an
 * orthographic photograph is built: the map is cut into columns, each column
 * scaled to the height of the sphere at that x. That keeps the whole planet a
 * pure canvas job: no 3D, no textures from anywhere but this file.
 */
import { createCanvas } from '@napi-rs/canvas';
import { TAU, clamp, lerp, rng } from '../engine/anim.mjs';

const TW = 1024;
const TH = 512;

/* ------------------------------- noise ------------------------------------ */

const hash3 = (x, y, z, s) => {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647 + s * 1442695040) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
};

const smooth = (v) => v * v * (3 - 2 * v);

function noise3(x, y, z, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const tx = smooth(x - xi);
  const ty = smooth(y - yi);
  const tz = smooth(z - zi);
  const c = (i, j, k) => hash3(xi + i, yi + j, zi + k, seed);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), tx);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), tx);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), tx);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), tx);
  return lerp(lerp(x00, x10, ty), lerp(x01, x11, ty), tz);
}

function fbm3(x, y, z, oct, seed) {
  let v = 0;
  let amp = 1;
  let tot = 0;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += noise3(x * f, y * f, z * f, seed + i * 17) * amp;
    tot += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return v / tot;
}

/* ------------------------------- maps ------------------------------------- */

let MAPS = null;

export function earthMaps() {
  if (MAPS) return MAPS;

  const alb = createCanvas(TW, TH);
  const ac = alb.getContext('2d');
  const aimg = ac.createImageData(TW, TH);
  const d = aimg.data;
  const land = new Float32Array(TW * TH);

  for (let y = 0; y < TH; y++) {
    const lat = (0.5 - (y + 0.5) / TH) * Math.PI; // +pi/2 north
    const cl = Math.cos(lat);
    const sl = Math.sin(lat);
    for (let x = 0; x < TW; x++) {
      const lon = ((x + 0.5) / TW) * TAU;
      const px = cl * Math.cos(lon);
      const py = sl;
      const pz = cl * Math.sin(lon);

      // continents: one big fbm, warped a little so coastlines are not smooth
      const warp = fbm3(px * 2.3 + 11.2, py * 2.3, pz * 2.3, 3, 5) - 0.5;
      const wx = px + warp * 0.35;
      const wy = py + warp * 0.3;
      const wz = pz + warp * 0.35;
      const e = fbm3(wx * 1.55, wy * 1.55, wz * 1.55, 5, 1);
      const det = fbm3(wx * 7.5, wy * 7.5, wz * 7.5, 3, 9);
      const elev = e * 0.78 + det * 0.22;
      const isLand = elev > 0.505 ? 1 : 0;
      land[y * TW + x] = isLand;

      const alat = Math.abs(sl);
      let r;
      let g;
      let b;
      if (elev > 0.505) {
        // land: biome by latitude and height
        const h = clamp((elev - 0.505) / 0.3);
        const dry = clamp(fbm3(wx * 3.4, wy * 3.4, wz * 3.4, 3, 21) * 1.5 - 0.15);
        const polarN = (noise3(wx * 6, wy * 6, wz * 6, 71) - 0.5) * 0.16;
        const polar = clamp((alat - 0.60 + polarN) / 0.16);
        const tropical = 1 - clamp(Math.abs(lat) / 0.72);
        // savanna / forest / desert
        r = lerp(88, 178, dry * 0.85 + 0.1) + tropical * 12;
        g = lerp(104, 158, dry * 0.7) + (1 - dry) * 26;
        b = lerp(62, 118, dry * 0.9);
        // mountains get grey-brown, then snow
        const rock = clamp((h - 0.42) / 0.3);
        r = lerp(r, 124, rock * 0.8);
        g = lerp(g, 108, rock * 0.8);
        b = lerp(b, 96, rock * 0.8);
        const snow = clamp((h - 0.66) / 0.2) * clamp(0.4 + alat);
        r = lerp(r, 238, snow);
        g = lerp(g, 242, snow);
        b = lerp(b, 248, snow);
        // ice caps
        r = lerp(r, 240, polar);
        g = lerp(g, 245, polar);
        b = lerp(b, 250, polar);
      } else {
        // ocean: shallow shelf near the coast, deep basins away from it
        const depth = clamp((0.505 - elev) / 0.22);
        r = lerp(22, 4, depth);
        g = lerp(74, 16, depth);
        b = lerp(112, 52, depth);
        // polar sea ice, with a broken edge
        const packN = (noise3(wx * 9, wy * 9, wz * 9, 61) - 0.5) * 0.10;
        const pack = clamp((alat - 0.78 + packN) / 0.06);
        r = lerp(r, 226, pack);
        g = lerp(g, 236, pack);
        b = lerp(b, 246, pack);
      }
      // per-pixel grain so nothing reads as flat vector fill
      const n = 0;
      const p = (y * TW + x) * 4;
      d[p] = clamp((r + n) / 255) * 255;
      d[p + 1] = clamp((g + n) / 255) * 255;
      d[p + 2] = clamp((b + n) / 255) * 255;
      d[p + 3] = 255;
    }
  }
  ac.putImageData(aimg, 0, 0);

  // clouds: banded turbulence, thin and thick like the real deck
  const cld = createCanvas(TW, TH);
  const cc = cld.getContext('2d');
  const cimg = cc.createImageData(TW, TH);
  const cd = cimg.data;
  for (let y = 0; y < TH; y++) {
    const lat = (0.5 - (y + 0.5) / TH) * Math.PI;
    const cl = Math.cos(lat);
    const sl = Math.sin(lat);
    for (let x = 0; x < TW; x++) {
      const lon = ((x + 0.5) / TW) * TAU;
      const px = cl * Math.cos(lon);
      const py = sl;
      const pz = cl * Math.sin(lon);
      const w1 = fbm3(px * 3.1, py * 3.1, pz * 3.1, 3, 41) - 0.5;
      const band = 0.5 + 0.5 * Math.cos(lat * 7.4);
      const base = fbm3(px * 2.2 + w1 * 1.4, py * 2.2 + w1, pz * 2.2 + w1 * 1.4, 5, 33);
      const wisp = fbm3(px * 9, py * 9, pz * 9, 3, 51);
      let v = base * 0.82 + wisp * 0.18;
      v = (v - 0.42) * 2.35 + band * 0.16;
      const al = clamp(v);
      const p = (y * TW + x) * 4;
      cd[p] = 252;
      cd[p + 1] = 253;
      cd[p + 2] = 255;
      cd[p + 3] = Math.round(al * 255 * 0.92);
    }
  }
  cc.putImageData(cimg, 0, 0);

  // city lights: a few hundred settlements, not a flood over every continent
  const lit = createCanvas(TW, TH);
  const lc = lit.getContext('2d');
  lc.globalCompositeOperation = 'lighter';
  const rl = rng(733);
  const isLand = (x, y) => land[clamp(y, 0, TH - 1) * TW + (((x % TW) + TW) % TW)] > 0.5;
  const metab = (x, y) => {
    // big smoke: coasts and the temperate belt
    const lat = Math.abs(0.5 - y / TH) * Math.PI;
    if (lat > 1.1) return 0;
    let near = 0;
    for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) {
      if (!isLand(x + ox, y + oy)) near++;
    }
    return clamp(0.12 + near * 0.3 + (0.5 - Math.abs(0.5 - y / TH)) * 0.55);
  };
  let cities = 0;
  for (let tries = 0; tries < 260000 && cities < 950; tries++) {
    const bx = Math.floor(rl() * TW);
    const by = Math.floor(rl() * TH);
    if (!isLand(bx, by)) continue;
    if (rl() > metab(bx, by)) continue;
    cities++;
    const big = Math.pow(rl(), 2.2); // most are towns, a few are metros
    const spread = 0.9 + big * 5.0;
    const n = Math.round(9 + big * 96);
    for (let i = 0; i < n; i++) {
      const ang = rl() * TAU;
      const rr = Math.pow(rl(), 0.65) * spread;
      const x = bx + Math.cos(ang) * rr;
      const y = by + Math.sin(ang) * rr * 0.8;
      if (!isLand(Math.round(x), Math.round(y))) continue;
      const warm = rl();
      const col = warm > 0.8 ? '255,236,190' : warm > 0.45 ? '255,206,140' : '255,172,96';
      const a = 0.18 + rl() * 0.42;
      lc.fillStyle = `rgba(${col},${a})`;
      lc.beginPath();
      lc.arc(x, y, 0.26 + rl() * 0.42, 0, TAU);
      lc.fill();
    }
    if (big > 0.45) {
      const gr = spread * 1.35;
      const g = lc.createRadialGradient(bx, by, 0, bx, by, gr);
      g.addColorStop(0, `rgba(255,196,130,${0.03 + big * 0.045})`);
      g.addColorStop(1, 'rgba(255,170,90,0)');
      lc.fillStyle = g;
      lc.fillRect(bx - gr, by - gr, gr * 2, gr * 2);
    }
  }

  MAPS = { albedo: alb, cloud: cld, lights: lit, land };
  return MAPS;
}

/* ------------------------------- sphere ----------------------------------- */

/**
 * Project one equirectangular map onto a sphere footprint, column by column.
 * `rot` is the longitude facing the camera, in turns.
 */
function sphereMap(ctx, map, cx, cy, r, rot, alpha = 1, composite = 'source-over', latShift = 0) {
  // A big sphere needs fewer columns: at the limb they are sub-pixel on screen.
  const N = clamp(Math.round(r / (r > 900 ? 4.5 : 1.5)), 48, 460);
  const step = (2 * r) / N;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.globalCompositeOperation = composite;
  const yShift = ((latShift % 1) + 1) % 1;
  const sy0 = Math.round(yShift * map.height);
  const h1 = map.height - sy0;
  const h2 = sy0;
  for (let i = 0; i < N; i++) {
    const x0 = -r + i * step;
    const x1 = x0 + step;
    // edge-snapped columns: abutting integer edges leave no seam to blend
    const dl = Math.round(cx + x0);
    const dr = Math.round(cx + x1);
    const dw = dr - dl;
    if (dw <= 0) continue;
    const th0 = Math.asin(clamp(x0 / r, -0.9995, 0.9995));
    const th1 = Math.asin(clamp(x1 / r, -0.9995, 0.9995));
    let sx0 = ((rot + th0 / TAU) % 1 + 1) % 1;
    let sx1 = ((rot + th1 / TAU) % 1 + 1) % 1;
    let w = sx1 - sx0;
    if (w < 0) w += 1;
    const y0 = cy - Math.sqrt(Math.max(0, r * r - x0 * x0));
    const y1 = cy + Math.sqrt(Math.max(0, r * r - x0 * x0));
    const dh = y1 - y0;
    const sxPix = sx0 * map.width;
    const wPix = w * map.width;
    const drawCol = (sx, sw, dx0, dwid) => {
      if (sw <= 0.01 || dwid <= 0) return;
      if (h2 <= 0) {
        ctx.drawImage(map, sx, 0, sw, map.height, dx0, y0, dwid, dh);
        return;
      }
      ctx.drawImage(map, sx, sy0, sw, h1, dx0, y0, dwid, dh * (h1 / map.height));
      ctx.drawImage(map, sx, 0, sw, h2, dx0, y0 + dh * (h1 / map.height), dwid, dh * (h2 / map.height));
    };
    if (sxPix + wPix <= map.width) {
      drawCol(sxPix, wPix, dl, dw);
    } else {
      const w1 = map.width - sxPix;
      const w2 = wPix - w1;
      const d1 = Math.round(dw * (w1 / wPix));
      drawCol(sxPix, w1, dl, d1);
      drawCol(0, w2, dl + d1, dw - d1);
    }
  }
  ctx.restore();
}

/**
 * An orthographic buffer for the sphere. Drawing the strips into an offscreen
 * and compositing once is what keeps the overlaps from showing as seams: an
 * alpha layer drawn strip by strip double-counts wherever two strips meet.
 */
const orthoCache = new Map();
function orthoBuf(size) {
  const key = Math.round(size);
  let cv = orthoCache.get(key);
  if (!cv) {
    cv = createCanvas(key, key);
    if (orthoCache.size > 8) orthoCache.delete(orthoCache.keys().next().value);
    orthoCache.set(key, cv);
  }
  return cv;
}

/**
 * A lit world.
 * `sun` is the direction of the sun in screen space, normalised-ish.
 * `ice` 0→1 grows the polar caps and whitens the oceans as the world freezes.
 */
export function globe(ctx, cx, cy, r, {
  a = 1,
  t = 0,
  rot = 0,
  cloudRot = 0.06,
  sun = { x: -0.75, y: -0.42 },
  clouds = 0.9,
  lights = 0,
  ice = 0,
  atmos = 1,
  night = 1,
  soften = 0.5,
  latShift = 0,
} = {}) {
  if (a <= 0.01 || r < 2) return;
  const M = earthMaps();
  const sx = sun.x;
  const sy = sun.y;
  const sl = Math.hypot(sx, sy) || 1;
  const ux = sx / sl;
  const uy = sy / sl;

  // supersample small spheres: the strip edges then average away instead of
  // lining up into visible columns
  // small spheres are supersampled; a whole limb is drawn at half resolution and
  // scaled up, which is invisible on a smooth cloud deck and four times cheaper
  const ss = r > 900 ? 1 : r <= 760 ? 2 : 1;
  const size = Math.max(16, Math.ceil(r * 2 * ss) + 2);
  const buf = orthoBuf(size);
  const b = buf.getContext('2d');
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, buf.width, buf.height);
  b.scale(ss, ss);
  const L = buf.width / ss;
  const bcx = L / 2;
  const bcy = L / 2;

  b.save();
  b.beginPath();
  b.arc(bcx, bcy, r, 0, TAU);
  b.clip();

  sphereMap(b, M.albedo, bcx, bcy, r, rot, 1, 'source-over', latShift);

  // the frozen world: white creeps down from the poles
  if (ice > 0.01) {
    const g = b.createLinearGradient(0, bcy - r, 0, bcy + r);
    const top = clamp(0.55 - ice * 0.52);
    g.addColorStop(0, `rgba(228,238,248,${0.95 * ice})`);
    g.addColorStop(clamp(top, 0.04, 0.96), `rgba(216,230,242,${0.72 * ice})`);
    g.addColorStop(0.5, `rgba(198,216,232,${0.36 * ice})`);
    g.addColorStop(clamp(1 - top, 0.04, 0.96), `rgba(216,230,242,${0.72 * ice})`);
    g.addColorStop(1, `rgba(228,238,248,${0.95 * ice})`);
    b.fillStyle = g;
    b.fillRect(bcx - r, bcy - r, r * 2, r * 2);
  }

  // weather
  if (clouds > 0.01) {
    b.save();
    b.globalAlpha = clouds * (0.30 + 0.70 * clamp(1 - night));
    sphereMap(b, M.cloud, bcx, bcy, r, cloudRot, 1, 'source-over', latShift);
    b.restore();
  }

  // limb darkening + the night side
  const lit = clamp(1 - night);
  b.save();
  b.globalCompositeOperation = 'multiply';
  const lg = b.createRadialGradient(bcx, bcy, r * 0.55, bcx, bcy, r);
  lg.addColorStop(0, 'rgba(255,255,255,1)');
  lg.addColorStop(0.72, 'rgba(240,244,251,1)');
  lg.addColorStop(0.92, 'rgba(182,198,224,1)');
  lg.addColorStop(1, 'rgba(104,122,156,1)');
  b.fillStyle = lg;
  b.fillRect(bcx - r, bcy - r, r * 2, r * 2);

  const sx0 = bcx + ux * r * 0.1;
  const sy0 = bcy + uy * r * 0.1;
  const ng = b.createLinearGradient(sx0, sy0, sx0 - ux * r * 1.15, sy0 - uy * r * 1.15);
  const w = (k) => `rgba(${Math.round(255 * k * 0.94)},${Math.round(255 * k * 0.97)},${Math.round(255 * k)},1)`;
  ng.addColorStop(0, w(0.98 * lit + 0.05));
  ng.addColorStop(0.34, w(0.92 * lit + 0.045));
  ng.addColorStop(0.50, w(0.30 * lit + 0.035));
  ng.addColorStop(clamp(0.54 + soften * 0.16), w(0.05));
  ng.addColorStop(1, w(0.028));
  b.fillStyle = ng;
  b.fillRect(bcx - r, bcy - r, r * 2, r * 2);
  b.restore();

  // cities, only on the side facing away from the sun
  if (lights > 0.01) {
    b.save();
    b.translate(bcx, bcy);
    b.rotate(Math.atan2(uy, ux));
    b.beginPath();
    b.rect(-r * 2.2, -r * 2.2, r * 2.2, r * 4.4); // local x<0 is the night side
    b.clip();
    b.globalAlpha = lights;
    sphereMap(b, M.lights, 0, 0, r, rot, 1, 'screen', latShift);
    b.restore();
  }
  b.restore();

  // composite the world onto the frame, then wrap it in air
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.drawImage(buf, cx - L / 2, cy - L / 2, L, L);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.clip();
  const bloom = 0.22 + 0.78 * clamp(1 - night * 0.9);
  const rim = ctx.createRadialGradient(cx, cy, r * 0.86, cx, cy, r * 1.0);
  rim.addColorStop(0, 'rgba(120,180,230,0)');
  rim.addColorStop(0.78, `rgba(140,196,244,${0.14 * atmos * bloom})`);
  rim.addColorStop(1, `rgba(200,228,255,${0.40 * atmos * bloom})`);
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = rim;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  if (atmos > 0.01) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.globalCompositeOperation = 'screen';
    const h = ctx.createRadialGradient(cx, cy, r * 0.995, cx, cy, r * 1.13);
    h.addColorStop(0, `rgba(150,205,250,${0.30 * atmos * bloom})`);
    h.addColorStop(0.35, `rgba(110,170,235,${0.14 * atmos * bloom})`);
    h.addColorStop(1, 'rgba(80,130,210,0)');
    ctx.fillStyle = h;
    ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);
    ctx.restore();
  }
  ctx.restore();
}

/** The limb of the same world, from low orbit: airglow, haze, cities below. */
export function earthLimb(ctx, cx, cy, r, {
  a = 1,
  t = 0,
  glow = 1,
  lights = 1,
  clouds = 0.85,
  rot = 0.12,
  sun = { x: -0.55, y: -0.83 },
  ice = 0,
  night = 1,
  latShift = 0.30,
} = {}) {
  globe(ctx, cx, cy, r, {
    a, t, rot, cloudRot: rot + 0.03, sun, clouds, lights, ice, atmos: 0, night, soften: 0.16, latShift,
  });

  if (glow <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // the green line is the whole atmosphere, seen edge-on
  const haze = ctx.createRadialGradient(cx, cy, r - 2, cx, cy, r + Math.max(26, r * 0.05));
  haze.addColorStop(0, 'rgba(120,200,220,0)');
  haze.addColorStop(0.18, `rgba(120,216,226,${0.30 * glow})`);
  haze.addColorStop(0.45, `rgba(150,214,255,${0.15 * glow})`);
  haze.addColorStop(1, 'rgba(110,170,240,0)');
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = haze;
  const pad = Math.max(40, r * 0.07);
  ctx.fillRect(cx - r - pad, cy - r - pad, (r + pad) * 2, (r + pad) * 2);

  ctx.strokeStyle = `rgba(198,244,238,${0.62 * glow})`;
  ctx.lineWidth = Math.max(1.6, r * 0.0024);
  ctx.shadowColor = 'rgba(150,230,235,0.9)';
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 1.6, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255,212,170,${0.22 * glow})`;
  ctx.lineWidth = Math.max(1.2, r * 0.0018);
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, TAU);
  ctx.stroke();
  ctx.restore();
}
