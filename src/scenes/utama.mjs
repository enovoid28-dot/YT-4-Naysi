// ============================================================================
// Episode 36 kit — "utama": the projection room.
// ----------------------------------------------------------------------------
// A holographic cartography identity for the remake of "Indonesia lebih
// lebar dari Amerika Serikat": a dark survey room where the Earth exists as
// a wire globe turning over a perspective graticule floor, a live Mercator
// lattice that visibly inflates away from the equator, glowing coastline
// polygons for the archipelago and the contiguous United States, calipers
// that measure Sabang-Merauke against coast-to-coast America, a true-size
// transport that lays Indonesia over Europe from Ireland past the Caspian,
// zone dials for WIB/WITA/WIT, an island dot-matrix of seventeen thousand
// sparks, the UN vote tally of 4 September 2026 (164-1-6) and an Equal-Earth
// morph that fixes the lie. Typography is warm paper white on ink teal with
// amber for Indonesia and ice blue for the United States; coral marks every
// place the old map lies. No image assets, no 3D, no useless particles:
// every line is a meridian, a coastline, a caliper tick or a vote.
// ============================================================================

import {
  cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn,
  spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch,
  snow, rgba, W, H,
} from './_cyano.mjs';
import { grain, back, odo } from './_madu.mjs';

// ----------------------------------------------------------------------------
// 1. PALETTE — ink teal survey room, amber archipelago, ice United States
// ----------------------------------------------------------------------------

export const KT = {
  void: '#03141A',     // survey room dark
  ink: '#062730',      // room body
  ink2: '#0B3A45',     // lit graticule plane
  teal: '#3FC4D0',     // graticule glow
  tealDim: '#1E6E79',  // faint grid
  amber: '#F2B441',    // Indonesia
  amberHi: '#FFE3A0',  // coastline rim light
  ember: '#E8863A',    // Sabang-Merauke span
  ice: '#9AD8E8',      // United States
  iceDim: '#5E93A3',   // secondary type
  coral: '#FF6B5A',    // the lie / distortion
  paper: '#EDE6D6',    // headline type
  paperDim: '#A9A08C', // body type
  gold: '#D9A441',     // vote in favour
  slate: '#4A5A60',    // abstention
  white: '#F6FBFA',
};

// ----------------------------------------------------------------------------
// 2. SMALL MATH + DRAW HELPERS
// ----------------------------------------------------------------------------

/** deterministic 0..1 hash for stable per-element values */
const h1 = (n) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/** smooth pulse 0..1..0 around a phase */
const pulse = (t, hz, ph = 0) => 0.5 + 0.5 * Math.sin(TAU * hz * t + ph);

/** ease a value toward a target with a per-frame coefficient */
const approach = (v, target, k) => v + (target - v) * k;

/** rounded rectangle path, tolerant of older canvas */
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/** amber gradient stroke — every Indonesian coastline line */
function amberStroke(ctx, a = 1) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, `rgba(242,180,65,${0.25 * a})`);
  g.addColorStop(0.5, `rgba(255,227,160,${0.9 * a})`);
  g.addColorStop(1, `rgba(242,180,65,${0.25 * a})`);
  return g;
}

/** ice gradient stroke — every United States line */
function iceStroke(ctx, a = 1) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, `rgba(94,147,163,${0.22 * a})`);
  g.addColorStop(0.5, `rgba(154,216,232,${0.88 * a})`);
  g.addColorStop(1, `rgba(94,147,163,${0.22 * a})`);
  return g;
}

/** teal gradient stroke — the graticule itself */
function tealStroke(ctx, a = 1) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, `rgba(30,110,121,${0.25 * a})`);
  g.addColorStop(0.5, `rgba(63,196,208,${0.8 * a})`);
  g.addColorStop(1, `rgba(30,110,121,${0.25 * a})`);
  return g;
}

/** format an integer the Indonesian way: 5.100 / 17.508 */
const idn = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Mercator y for a latitude in degrees (unit sphere, equator at 0) */
const mercY = (lat) => {
  const p = clamp(lat, -85, 85) * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + p / 2));
};

/** Mercator area inflation factor sec^2(lat) */
const sec2 = (lat) => {
  const c = Math.cos(lat * Math.PI / 180);
  return 1 / (c * c);
};

// ----------------------------------------------------------------------------
// 3. PROJECTION ROOM BACKGROUND — gradient, horizon glow, graticule floor
// ----------------------------------------------------------------------------

/**
 * The survey room: vertical ink-teal gradient, a soft horizon glow where the
 * hologram table meets the dark, a perspective graticule floor whose latitude
 * lines travel slowly toward the viewer, and a whisper-faint ceiling mirror
 * of the same grid so the room feels enclosed by coordinates.
 */
export function roomBG(ctx, t, o = {}) {
  const { floorY = 1980, vanY = 1470, glow = 0.5 } = o;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, KT.void);
  g.addColorStop(0.45, KT.ink);
  g.addColorStop(0.78, KT.ink2);
  g.addColorStop(1, KT.void);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // horizon glow band behind the hologram table
  const hg = ctx.createRadialGradient(W / 2, vanY + 60, 40, W / 2, vanY + 60, 980);
  hg.addColorStop(0, `rgba(63,196,208,${0.16 * glow})`);
  hg.addColorStop(0.5, `rgba(63,196,208,${0.06 * glow})`);
  hg.addColorStop(1, 'rgba(63,196,208,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, vanY - 700, W, 1400);

  // perspective floor: meridians converge to the vanishing point
  ctx.save();
  ctx.lineWidth = 1;
  for (let i = -9; i <= 9; i++) {
    const xb = W / 2 + i * 190;
    const xt = W / 2 + i * 26;
    ctx.strokeStyle = `rgba(30,110,121,${0.30 - Math.abs(i) * 0.022})`;
    ctx.beginPath();
    ctx.moveTo(xb, H + 40);
    ctx.lineTo(xt, floorY - 330);
    ctx.stroke();
  }
  // latitude lines travel toward the viewer
  for (let k = 0; k < 9; k++) {
    const ph = ((t * 0.055) + k / 9) % 1;
    const y = floorY - 330 + Math.pow(ph, 2.1) * (H - floorY + 420);
    const a = 0.05 + ph * 0.22;
    ctx.strokeStyle = `rgba(63,196,208,${a})`;
    ctx.lineWidth = 1 + ph * 1.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  // ceiling mirror, much fainter, lines receding upward
  for (let k = 0; k < 5; k++) {
    const ph = ((t * 0.03) + k / 5) % 1;
    const y = 330 - Math.pow(ph, 1.8) * 320;
    ctx.strokeStyle = `rgba(30,110,121,${0.10 * (1 - ph)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Faint drifting coordinate readouts on the room walls — longitude tags on
 * the left, latitude tags on the right. They are the room's wallpaper and
 * they never compete with the caption scrim.
 */
export function wallTags(ctx, t, o = {}) {
  const { p = 1 } = o;
  ctx.save();
  ctx.globalAlpha = 0.5 * p;
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.tealDim;
  for (let k = 0; k < 7; k++) {
    const y = 420 + k * 260 + Math.sin(t * 0.24 + k) * 6;
    const lon = 95 + k * 8;
    ctx.textAlign = 'left';
    ctx.fillText(`${lon}°E`, 44, y);
    ctx.textAlign = 'right';
    const lat = 6 - k * 3;
    ctx.fillText(`${Math.abs(lat)}°${lat < 0 ? 'S' : 'N'}`, W - 44, y + 130);
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 4. WIRE GLOBE — orthographic graticule sphere with an equator beam
// ----------------------------------------------------------------------------

/**
 * A wire Earth: parallels as stacked ellipses, meridians as rotating
 * ellipses, the equator as a bright amber beam (Indonesia's latitude), and a
 * longitude wedge (95E-141E) that glows while it faces the viewer. Sabang and
 * Merauke ride the wedge as pin dots with mono tags when they rotate front.
 */
export function globeWire(ctx, cx, cy, r, t, o = {}) {
  const { p = 1, rot = 0.10, wedge = true, tags = true } = o;
  const a0 = t * rot;
  ctx.save();
  ctx.globalAlpha = p;

  // sphere body: deep ink with a teal limb
  const bg = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.2, cx, cy, r);
  bg.addColorStop(0, 'rgba(11,58,69,0.85)');
  bg.addColorStop(0.75, 'rgba(6,39,48,0.9)');
  bg.addColorStop(1, 'rgba(3,20,26,0.95)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();

  // limb glow
  ctx.strokeStyle = 'rgba(63,196,208,0.5)';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(63,196,208,0.55)';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // parallels
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = cy - r * Math.sin(lat * Math.PI / 180) * 0.94;
    const rx = r * Math.cos(lat * Math.PI / 180);
    const ry = rx * 0.20;
    ctx.strokeStyle = lat === 0 ? 'rgba(242,180,65,0.95)' : 'rgba(63,196,208,0.30)';
    ctx.lineWidth = lat === 0 ? 3 : 1.2;
    if (lat === 0) {
      ctx.shadowColor = 'rgba(242,180,65,0.7)';
      ctx.shadowBlur = 16;
    }
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, ry, 0, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // meridians: ellipses whose width breathes with rotation
  for (let k = 0; k < 6; k++) {
    const th = a0 + k * Math.PI / 6;
    const wfac = Math.cos(th);
    const rx = Math.abs(wfac) * r;
    ctx.strokeStyle = `rgba(63,196,208,${0.14 + 0.16 * Math.abs(wfac)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, r * 0.98, 0, 0, TAU);
    ctx.stroke();
  }

  // the Indonesian longitude wedge 95E..141E, lit while facing front
  if (wedge) {
    const lonC = 118 * Math.PI / 180;
    const face = Math.cos(lonC - a0 - Math.PI / 2);
    if (face > 0.15) {
      const half = 23 * Math.PI / 180;
      const x1 = Math.abs(Math.cos(lonC - half - a0 - Math.PI / 2)) * r;
      const x2 = Math.abs(Math.cos(lonC + half - a0 - Math.PI / 2)) * r;
      const sgn = Math.sign(Math.sin(lonC - a0 - Math.PI / 2)) || 1;
      ctx.fillStyle = `rgba(242,180,65,${0.16 * face})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, x2, r * 0.98, 0, -Math.PI / 2, Math.PI / 2, sgn < 0);
      ctx.ellipse(cx, cy, x1, r * 0.98, 0, Math.PI / 2, -Math.PI / 2, sgn >= 0);
      ctx.closePath();
      ctx.fill();
    }
    // Sabang / Merauke pins riding the rotation
    if (tags) {
      const pins = [
        { lon: 95.3, lat: 5.6, tag: 'SABANG' },
        { lon: 141.0, lat: -8.5, tag: 'MERAUKE' },
      ];
      for (const q of pins) {
        const th = q.lon * Math.PI / 180 - a0 - Math.PI / 2;
        const f = Math.cos(th);
        if (f < 0.2) continue;
        const x = cx + Math.sin(th) * r * Math.cos(q.lat * Math.PI / 180);
        const y = cy - r * Math.sin(q.lat * Math.PI / 180) * 0.94
          - Math.cos(q.lat * Math.PI / 180) * r * 0.20 * Math.sin(th) * 0.0;
        ctx.fillStyle = `rgba(255,227,160,${0.9 * f})`;
        ctx.shadowColor = 'rgba(242,180,65,0.8)';
        ctx.shadowBlur = 12 * f;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = '600 20px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(237,230,214,${0.75 * f})`;
        ctx.textAlign = 'center';
        ctx.fillText(q.tag, x, y - 16);
      }
    }
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 5. MERCATOR LATTICE — the lie, drawn live
// ----------------------------------------------------------------------------

/**
 * The Mercator lattice: meridians stay evenly spaced while parallels spread
 * by sec(lat). An inflation parameter k sweeps 0..1 to morph the grid from
 * honest (equirectangular) to full Mercator, and latitude bands tint by their
 * area factor — teal near the equator, amber mid, coral at 60+ — with mono
 * chips naming the factor (x1, x2, x4). The equator keeps a gold beam.
 */
export function mercatorLattice(ctx, x, y, w, h, t, o = {}) {
  const { p = 1, k = 1, chips = true } = o;
  const cxm = x + w / 2;
  const yEq = y + h / 2;
  const latMax = 78;
  const yOf = (lat) => {
    const eq = (lat / latMax) * (h / 2);                 // honest
    const mm = (mercY(lat) / mercY(latMax)) * (h / 2);  // mercator
    return yEq - lerp(eq, mm, k);
  };
  ctx.save();
  ctx.globalAlpha = p;

  // band tint by area factor
  const bands = [[0, 30, 'rgba(63,196,208,0.10)'], [30, 60, 'rgba(242,180,65,0.10)'], [60, 78, 'rgba(255,107,90,0.13)']];
  for (const [a, b, col] of bands) {
    ctx.fillStyle = col;
    ctx.fillRect(x, yOf(b), w, yOf(a) - yOf(b));
    ctx.fillRect(x, yOf(-a), w, yOf(-b) - yOf(-a));
  }

  // meridians
  ctx.lineWidth = 1;
  for (let i = 0; i <= 12; i++) {
    const mx = x + (i / 12) * w;
    ctx.strokeStyle = `rgba(63,196,208,${i % 3 === 0 ? 0.34 : 0.16})`;
    ctx.beginPath();
    ctx.moveTo(mx, y);
    ctx.lineTo(mx, y + h);
    ctx.stroke();
  }
  // parallels at mercator spacing
  for (let lat = -75; lat <= 75; lat += 15) {
    const yy = yOf(lat);
    ctx.strokeStyle = lat === 0 ? 'rgba(242,180,65,0.9)' : 'rgba(63,196,208,0.26)';
    ctx.lineWidth = lat === 0 ? 2.6 : 1.1;
    if (lat === 0) {
      ctx.shadowColor = 'rgba(242,180,65,0.6)';
      ctx.shadowBlur = 14;
    }
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + w, yy);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // travelling scan line that reads the inflation
  const sy = y + ((t * 0.16) % 1) * h;
  ctx.strokeStyle = 'rgba(237,230,214,0.20)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, sy);
  ctx.lineTo(x + w, sy);
  ctx.stroke();

  if (chips) {
    const rows = [[0, '×1', KT.teal], [45, '×2', KT.amber], [60, '×4', KT.coral]];
    ctx.font = '700 24px "JetBrains Mono", monospace';
    for (const [lat, txt, col] of rows) {
      const yy = yOf(lat);
      ctx.fillStyle = col;
      ctx.textAlign = 'left';
      ctx.fillText(txt, x + w + 14, yy + 8);
      ctx.strokeStyle = col;
      ctx.globalAlpha = p * 0.5;
      ctx.beginPath();
      ctx.moveTo(x + w, yy);
      ctx.lineTo(x + w + 10, yy);
      ctx.stroke();
      ctx.globalAlpha = p;
    }
  }
  ctx.restore();
  return { yOf, cxm };
}

// ----------------------------------------------------------------------------
// 6. COASTLINE DATA — stylised [lon, lat] polygons, no image assets
// ----------------------------------------------------------------------------

/** Indonesian islands, stylised but recognisable silhouettes. */
export const ID_ISLANDS = [
  // Sumatra
  [[95.3, 5.6], [97.5, 5.2], [99.5, 3.5], [102.0, 1.0], [104.5, -1.0], [106.0, -3.0], [105.9, -5.9], [104.5, -5.9], [102.5, -4.0], [100.5, -1.5], [98.5, 1.0], [96.5, 3.5], [95.0, 5.0]],
  // Java
  [[105.2, -6.1], [108.0, -6.5], [111.0, -6.5], [114.5, -7.5], [114.6, -8.5], [112.0, -8.4], [109.0, -7.8], [106.5, -7.4], [105.1, -6.8]],
  // Kalimantan
  [[109.0, 2.0], [111.5, 3.5], [115.0, 5.0], [117.5, 4.0], [119.0, 1.0], [117.5, -1.5], [116.0, -3.5], [114.0, -3.5], [112.0, -3.0], [110.0, -1.5], [108.8, 0.5]],
  // Sulawesi
  [[119.0, 1.5], [121.0, 1.5], [123.0, 0.5], [122.0, -1.0], [121.0, -2.0], [122.5, -4.0], [121.0, -5.5], [119.5, -5.5], [120.5, -3.0], [119.5, -1.0], [118.8, 0.3]],
  // Papua (Indonesian side)
  [[131.0, -1.0], [134.0, -1.5], [138.0, -2.0], [141.0, -2.5], [141.0, -7.0], [138.5, -7.5], [135.5, -6.0], [132.5, -4.0], [130.9, -2.5]],
];

/** Lesser islands and Maluku as pin dots [lon, lat, radius]. */
export const ID_DOTS = [
  [115.2, -8.4, 5], [118.7, -8.6, 6], [122.0, -8.6, 7], [125.1, -8.9, 6],
  [127.3, -0.8, 7], [129.5, -3.2, 6], [131.3, -1.2, 5], [134.7, -3.9, 6],
  [119.8, -0.9, 5], [121.4, 1.3, 5], [108.9, -3.2, 4], [123.6, -5.0, 4],
];

/** Contiguous United States, stylised coast-to-coast silhouette. */
export const US_OUTLINE = [
  [-124.7, 48.4], [-122.0, 49.0], [-95.2, 49.0], [-94.6, 48.7], [-89.0, 48.0],
  [-84.8, 46.9], [-82.5, 45.3], [-83.0, 42.3], [-79.0, 42.8], [-76.8, 43.6],
  [-71.5, 45.0], [-67.0, 44.8], [-70.0, 41.7], [-74.0, 39.5], [-75.5, 37.5],
  [-76.0, 35.2], [-78.5, 33.8], [-80.0, 32.5], [-81.5, 30.7], [-80.0, 26.8],
  [-81.8, 24.5], [-83.7, 29.9], [-85.3, 29.7], [-89.0, 29.2], [-91.3, 29.5],
  [-93.8, 29.7], [-97.1, 25.9], [-99.5, 27.5], [-101.4, 29.7], [-104.5, 29.6],
  [-106.5, 31.8], [-108.2, 31.3], [-111.0, 31.3], [-114.8, 32.5], [-117.1, 32.5],
  [-118.4, 33.7], [-120.6, 34.6], [-122.0, 36.9], [-124.0, 40.4], [-124.7, 43.4],
];

/** Rough Europe + western Asia frame for the true-size transport. */
export const EUROPE_OUTLINE = [
  [-9.9, 36.0], [-9.0, 43.0], [-4.5, 48.5], [0.0, 49.5], [4.0, 52.0], [8.0, 54.0],
  [10.5, 57.5], [18.0, 55.0], [21.0, 57.0], [24.0, 59.5], [28.0, 60.5], [30.0, 59.5],
  [31.0, 56.0], [33.0, 52.0], [36.0, 49.0], [39.0, 47.0], [36.0, 44.0], [30.0, 46.0],
  [28.0, 41.0], [26.0, 40.0], [23.0, 36.5], [18.5, 40.0], [15.5, 38.0], [12.5, 41.5],
  [9.5, 44.0], [3.0, 43.0], [-2.0, 43.5],
];

/** The Caspian Sea, the transport's eastern landmark. */
export const CASPIAN = [
  [50.0, 47.0], [53.0, 45.0], [54.0, 42.0], [51.5, 38.0], [49.0, 37.0],
  [48.0, 40.0], [47.0, 44.0], [48.0, 46.5],
];

/** Greenland as Mercator shows it (the lie) — same points, inflated frame. */
export const GREENLAND = [
  [-45.0, 60.0], [-42.0, 62.0], [-40.0, 65.0], [-32.0, 68.0], [-25.0, 70.0],
  [-22.0, 73.0], [-25.0, 77.0], [-32.0, 80.0], [-45.0, 82.0], [-58.0, 82.0],
  [-68.0, 80.0], [-73.0, 78.0], [-68.0, 76.0], [-60.0, 74.0], [-55.0, 70.0],
  [-53.0, 66.0], [-50.0, 62.0],
];

/** Africa at the same scale — fourteen Greenlands of truth. */
export const AFRICA = [
  [-17.0, 14.7], [-16.0, 20.0], [-13.0, 27.0], [-9.0, 32.0], [-5.0, 35.5],
  [0.0, 37.0], [10.0, 37.3], [19.0, 32.0], [25.0, 32.0], [32.0, 31.0],
  [35.0, 28.0], [37.0, 18.0], [43.0, 11.5], [48.0, 11.0], [51.0, 10.4],
  [45.0, 2.0], [41.0, -2.0], [40.0, -10.0], [36.0, -18.0], [33.0, -26.0],
  [27.0, -33.5], [20.0, -34.8], [17.0, -33.0], [14.0, -22.0], [12.0, -12.0],
  [9.0, -1.0], [9.0, 4.0], [6.0, 4.3], [-8.0, 4.5], [-13.0, 8.5],
];

/** equirectangular projector factory: degrees -> canvas px */
export function proj(x0, y0, s, clon = 0, clat = 0) {
  return (lon, lat) => [x0 + (lon - clon) * s, y0 - (lat - clat) * s];
}

/**
 * Draw one coastline polygon through a projector. `p` gates the reveal: the
 * outline draws itself around the perimeter like a plotter pen, then the
 * fill fades in under a rim-light stroke.
 */
export function drawCoast(ctx, pts, pr, o = {}) {
  const { stroke = KT.amber, fill = 'rgba(242,180,65,0.10)', lw = 3, p = 1, glow = 14, close = true } = o;
  if (p <= 0) return;
  const n = pts.length;
  const m = Math.max(2, Math.ceil(n * clamp(p * 1.25, 0, 1)));
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < m && i < n; i++) {
    const [x, y] = pr(pts[i][0], pts[i][1]);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  if (close && p >= 0.999) ctx.closePath();
  if (p >= 0.999 && fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.shadowColor = stroke;
  ctx.shadowBlur = glow;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

/** pin dots for the lesser islands */
export function drawDots(ctx, dots, pr, o = {}) {
  const { color = KT.amberHi, p = 1, r0 = 1 } = o;
  ctx.save();
  for (let i = 0; i < dots.length; i++) {
    const q = clamp(p * dots.length * 1.4 - i, 0, 1);
    if (q <= 0) continue;
    const [x, y] = pr(dots[i][0], dots[i][1]);
    ctx.fillStyle = color;
    ctx.globalAlpha = q;
    ctx.beginPath();
    ctx.arc(x, y, dots[i][2] * r0 * (0.6 + 0.4 * q), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 7. MAP FRAME — graticule sheet with corner ticks and coordinate readout
// ----------------------------------------------------------------------------

/**
 * A holographic sheet: 1px teal border with doubled corner ticks, an inner
 * 10-degree graticule, a mono title top-left and a live coordinate readout
 * bottom-right that counts like a surveyor's cursor.
 */
export function mapFrame(ctx, x, y, w, h, t, o = {}) {
  const { title = '', p = 1, step = 10, read = true } = o;
  ctx.save();
  ctx.globalAlpha = p;

  ctx.fillStyle = 'rgba(6,39,48,0.55)';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(63,196,208,0.45)';
  ctx.lineWidth = 1.4;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();

  // corner ticks
  ctx.strokeStyle = KT.teal;
  ctx.lineWidth = 2.4;
  const c = 26;
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const cx0 = sx > 0 ? x : x + w;
    const cy0 = sy > 0 ? y : y + h;
    ctx.beginPath();
    ctx.moveTo(cx0 + sx * c, cy0);
    ctx.lineTo(cx0, cy0);
    ctx.lineTo(cx0, cy0 + sy * c);
    ctx.stroke();
  }

  // inner graticule
  ctx.save();
  rr(ctx, x + 2, y + 2, w - 4, h - 4, 9);
  ctx.clip();
  ctx.lineWidth = 1;
  for (let gx = x + step; gx < x + w; gx += step * 3.2) {
    ctx.strokeStyle = 'rgba(30,110,121,0.30)';
    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
  }
  for (let gy = y + step; gy < y + h; gy += step * 3.2) {
    ctx.strokeStyle = 'rgba(30,110,121,0.30)';
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
  }
  ctx.restore();

  if (title) {
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.teal;
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 22, y + 40);
  }
  if (read) {
    const lon = 95 + ((t * 3.1) % 46);
    const lat = 6 - ((t * 1.7) % 17);
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.iceDim;
    ctx.textAlign = 'right';
    ctx.fillText(`${lon.toFixed(1)}°E  ${Math.abs(lat).toFixed(1)}°${lat < 0 ? 'S' : 'N'}`, x + w - 20, y + h - 18);
  }
  ctx.restore();
}
