// ============================================================================
// Episode 36 kit — "atlas": the projection room.
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

// ----------------------------------------------------------------------------
// 8. TRUE-SIZE TRANSPORT — Indonesia laid over Europe, Ireland to the Caspian
// ----------------------------------------------------------------------------

/**
 * The transport: Europe sits in a map frame; the Indonesian archipelago,
 * drawn at the same kilometre-per-degree scale, slides in from the west with
 * Sabang pinned on west Ireland and Merauke landing east of the Caspian. A
 * dashed span ribbon with endpoint pins and a kilometre readout rides above
 * the group; a faint ghost of the departure position lingers behind.
 */
export function trueSizeMove(ctx, x, y, w, h, t, o = {}) {
  const { p = 1, move = 1 } = o;
  const s = w / 78;                       // degrees -> px, Europe window 78 deg
  const pr = proj(x + w * 0.16, y + h * 0.52, s, -9.7, 52.8);
  ctx.save();
  ctx.globalAlpha = p;

  // Europe + Caspian, quiet ice lines
  drawCoast(ctx, EUROPE_OUTLINE, pr, { stroke: 'rgba(154,216,232,0.5)', fill: 'rgba(154,216,232,0.05)', lw: 2, glow: 6 });
  drawCoast(ctx, CASPIAN, pr, { stroke: 'rgba(154,216,232,0.65)', fill: 'rgba(154,216,232,0.10)', lw: 2, glow: 6 });
  label(ctx, 'LAUT KASPIA', ...pr(50.5, 41.5).map((v, i) => i ? v + 66 : v), { size: 20, color: KT.iceDim, align: 'center', track: 3 });
  label(ctx, 'IRLANDIA', ...pr(-9.7, 52.8).map((v, i) => i ? v - 26 : v), { size: 20, color: KT.iceDim, align: 'center', track: 3 });

  // transport offset: from off-frame west to the pinned position
  const dx = lerp(-w * 0.95, 0, eo(move));
  const dy = lerp(h * 0.30, 0, eo(move));
  ctx.save();
  ctx.translate(dx, dy);

  // ghost of the departure slot
  if (move > 0.05 && move < 0.98) {
    ctx.save();
    ctx.translate(-dx * 0.85, -dy * 0.85);
    ctx.globalAlpha = p * 0.16;
    for (const isl of ID_ISLANDS) drawCoast(ctx, isl, pr, { stroke: KT.amber, fill: null, lw: 1.6, glow: 0 });
    ctx.restore();
  }

  for (const isl of ID_ISLANDS) {
    drawCoast(ctx, isl, pr, { stroke: amberStroke(ctx), fill: 'rgba(242,180,65,0.13)', lw: 3, glow: 16 });
  }
  drawDots(ctx, ID_DOTS, pr, { p: 1, r0: 0.8 });

  // endpoint pins Sabang / Merauke
  const [sx, sy] = pr(95.3, 5.6);
  const [mx, my] = pr(141.0, -8.5);
  for (const [px, py, tag] of [[sx, sy, 'SABANG'], [mx, my, 'MERAUKE']]) {
    ctx.strokeStyle = KT.amberHi;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = KT.amberHi;
    ctx.beginPath();
    ctx.arc(px, py, 3.4, 0, TAU);
    ctx.fill();
    ctx.font = '700 21px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.paper;
    ctx.textAlign = 'center';
    ctx.fillText(tag, px, py - 20);
  }

  // span ribbon above the group
  const ry = Math.min(sy, my) - 74;
  ctx.strokeStyle = KT.ember;
  ctx.lineWidth = 2.4;
  ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -t * 40;
  ctx.beginPath();
  ctx.moveTo(sx, ry);
  ctx.lineTo(mx, ry);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const px of [sx, mx]) {
    ctx.beginPath();
    ctx.moveTo(px, ry - 12);
    ctx.lineTo(px, ry + 12);
    ctx.stroke();
  }
  ctx.font = '800 30px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.amberHi;
  ctx.textAlign = 'center';
  ctx.fillText('5.248 KM SABANG–MERAUKE', (sx + mx) / 2, ry - 22);
  ctx.restore();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 9. CALIPER — the measuring instrument of the whole episode
// ----------------------------------------------------------------------------

/**
 * A horizontal caliper: beam, travelling jaw, kilometre ticks every 500 km,
 * endpoint pins with mono tags and a big odometer-style readout. `km` sets
 * the span being measured (5100 Indonesia, 4500 the United States) and `p`
 * opens the jaws from zero with an overshoot ease.
 */
export function caliper(ctx, x, y, w, km, t, o = {}) {
  const { p = 1, color = KT.amber, tagA = '', tagB = '', read = true, maxKm = 5600 } = o;
  const span = (km / maxKm) * w * eo(p);
  const x2 = x + span;
  ctx.save();

  // beam
  ctx.strokeStyle = rgba(color, 0.55);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  // kilometre ticks
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  for (let k = 0; k <= maxKm; k += 500) {
    const tx = x + (k / maxKm) * w;
    const big = k % 1000 === 0;
    ctx.strokeStyle = rgba(color, big ? 0.5 : 0.26);
    ctx.lineWidth = big ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(tx, y - (big ? 14 : 8));
    ctx.lineTo(tx, y + (big ? 14 : 8));
    ctx.stroke();
    if (big) {
      ctx.fillStyle = rgba(color, 0.55);
      ctx.fillText(idn(k), tx, y + 40);
    }
  }

  // jaws
  for (const [jx, tag, up] of [[x, tagA, -1], [x2, tagB, -1]]) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(jx, y - 44);
    ctx.lineTo(jx, y + 44);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(jx, y - 44);
    ctx.lineTo(jx - 8, y - 58);
    ctx.lineTo(jx + 8, y - 58);
    ctx.closePath();
    ctx.fill();
    if (tag) {
      ctx.font = '700 22px "JetBrains Mono", monospace';
      ctx.fillStyle = KT.paper;
      ctx.textAlign = 'center';
      ctx.fillText(tag, jx, y - 70);
    }
  }

  // span fill
  const g = ctx.createLinearGradient(x, 0, x2, 0);
  g.addColorStop(0, rgba(color, 0.05));
  g.addColorStop(0.5, rgba(color, 0.20));
  g.addColorStop(1, rgba(color, 0.05));
  ctx.fillStyle = g;
  ctx.fillRect(x, y - 10, span, 20);

  if (read) {
    ctx.font = '800 44px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fillText(`${idn(km * eo(p))} KM`, (x + x2) / 2, y + 96);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
  return x2;
}

// ----------------------------------------------------------------------------
// 10. OVERLAY COMPARE — Indonesia draped over the United States
// ----------------------------------------------------------------------------

/**
 * The money shot: the contiguous United States in ice, then the archipelago
 * in amber slides on top at the same scale, centred on the US midpoint. Both
 * ends overhang the coasts; coral overhang brackets and kilometre tags name
 * the surplus on the Atlantic and Pacific side while a centre line ties the
 * two spans together.
 */
export function overlayCompare(ctx, cx, cy, w, t, o = {}) {
  const { p = 1, slide = 1 } = o;
  const sUs = w / 58;                          // 58 degrees of US longitude
  const prUs = proj(cx, cy, sUs, -96, 37.5);
  const sId = sUs * 1.0;                       // same km/deg at the equator
  const dx = lerp(-w * 0.8, 0, eo(slide));
  ctx.save();
  ctx.globalAlpha = p;

  drawCoast(ctx, US_OUTLINE, prUs, { stroke: iceStroke(ctx), fill: 'rgba(154,216,232,0.07)', lw: 2.6, glow: 10 });

  ctx.save();
  ctx.translate(cx + dx, cy);
  const prId = proj(0, 22 * sId / sUs, sId, -118, 0);
  for (const isl of ID_ISLANDS) {
    drawCoast(ctx, isl, (lon, lat) => prId(lon - 0, lat), { stroke: amberStroke(ctx), fill: 'rgba(242,180,65,0.12)', lw: 3, glow: 16 });
  }
  drawDots(ctx, ID_DOTS, prId, { r0: 0.8 });
  ctx.restore();

  // overhang brackets once the slide lands
  if (slide > 0.9) {
    const q = clamp((slide - 0.9) / 0.1, 0, 1);
    const idHalf = (46 / 2) * sId;
    const usHalf = (57.7 / 2) * sUs;
    ctx.globalAlpha = p * q;
    ctx.strokeStyle = KT.coral;
    ctx.lineWidth = 3;
    for (const sgn of [-1, 1]) {
      const a = cx + sgn * usHalf;
      const b = cx + sgn * idHalf;
      ctx.beginPath();
      ctx.moveTo(a, cy + 150);
      ctx.lineTo(a, cy + 190);
      ctx.lineTo(b, cy + 190);
      ctx.lineTo(b, cy + 150);
      ctx.stroke();
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillStyle = KT.coral;
      ctx.textAlign = 'center';
      ctx.fillText(sgn < 0 ? 'PASIFIK +' : 'ATLANTIK +', (a + b) / 2, cy + 226);
    }
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 11. AREA DUEL — Greenland vs Africa, the Mercator lie in one frame
// ----------------------------------------------------------------------------

/**
 * Two sheets side by side at identical Mercator scale: Greenland bloated to
 * Africa's apparent size on the left, Africa's true body on the right. A
 * coral "x14" bridge counts up between them while both coastlines breathe;
 * beneath, a pair of honest equal-area bars settles the argument.
 */
export function areaDuel(ctx, x, y, w, h, t, o = {}) {
  const { p = 1, count = 1 } = o;
  const half = w / 2 - 30;
  const s = half / 85;
  ctx.save();
  ctx.globalAlpha = p;

  const prG = proj(x + half / 2, y + h * 0.42, s, -47, 71);
  const prA = proj(x + w - half / 2, y + h * 0.42, s * 0.62, 17, 5);
  drawCoast(ctx, GREENLAND, prG, { stroke: KT.coral, fill: 'rgba(255,107,90,0.12)', lw: 2.6, glow: 12 });
  drawCoast(ctx, AFRICA, prA, { stroke: KT.teal, fill: 'rgba(63,196,208,0.10)', lw: 2.6, glow: 12 });

  label(ctx, 'GREENLAND DI PETA', x + half / 2, y + h * 0.42 + 190, { size: 22, color: KT.coral, align: 'center', track: 3 });
  label(ctx, 'AFRIKA SESUNGGUHNYA', x + w - half / 2, y + h * 0.42 + 250, { size: 22, color: KT.teal, align: 'center', track: 3 });

  // the x14 bridge
  const bx = x + w / 2;
  ctx.strokeStyle = rgba(KT.paper, 0.5);
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(bx - 90, y + h * 0.42);
  ctx.lineTo(bx + 90, y + h * 0.42);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '800 64px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.coral;
  ctx.textAlign = 'center';
  ctx.shadowColor = KT.coral;
  ctx.shadowBlur = 18;
  ctx.fillText(`×${Math.round(14 * eo(count))}`, bx, y + h * 0.42 - 26);
  ctx.shadowBlur = 0;

  // honest equal-area bars
  const by = y + h - 60;
  const bw = w - 120;
  ctx.fillStyle = 'rgba(255,107,90,0.75)';
  ctx.fillRect(x + 60, by, bw * (2.17 / 30.37) * eo(count), 18);
  ctx.fillStyle = 'rgba(63,196,208,0.75)';
  ctx.fillRect(x + 60, by + 28, bw * eo(count), 18);
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = KT.paperDim;
  ctx.fillText('2,17 jt km²', x + 60, by - 10);
  ctx.fillText('30,37 jt km²', x + 60, by + 66);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 12. EQUATOR BEAM + LATITUDE INFLATION BARS
// ----------------------------------------------------------------------------

/**
 * A vertical latitude column: the equator as a hot amber beam across the
 * middle, latitude rails above and below, and three inflation bars (0, 45,
 * 60 degrees) whose lengths are sec^2(lat) — the geometry of the lie as a
 * bar chart that grows while the voice explains it.
 */
export function equatorBeam(ctx, x, y, w, h, t, o = {}) {
  const { p = 1, grow = 1 } = o;
  const yEq = y + h / 2;
  ctx.save();
  ctx.globalAlpha = p;

  // latitude rails
  ctx.strokeStyle = 'rgba(63,196,208,0.30)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  for (let lat = -60; lat <= 60; lat += 30) {
    const yy = yEq - (lat / 75) * (h / 2);
    ctx.strokeStyle = 'rgba(63,196,208,0.4)';
    ctx.beginPath();
    ctx.moveTo(x - 10, yy);
    ctx.lineTo(x + 10, yy);
    ctx.stroke();
    ctx.fillStyle = KT.iceDim;
    ctx.fillText(`${Math.abs(lat)}°${lat < 0 ? 'S' : lat > 0 ? 'N' : ''}`, x - 18, yy + 7);
  }

  // equator beam
  const bg = ctx.createLinearGradient(x, 0, x + w, 0);
  bg.addColorStop(0, 'rgba(242,180,65,0)');
  bg.addColorStop(0.5, `rgba(255,227,160,${0.75 + 0.2 * pulse(t, 0.5)})`);
  bg.addColorStop(1, 'rgba(242,180,65,0)');
  ctx.fillStyle = bg;
  ctx.shadowColor = 'rgba(242,180,65,0.8)';
  ctx.shadowBlur = 22;
  ctx.fillRect(x, yEq - 3, w, 6);
  ctx.shadowBlur = 0;
  label(ctx, 'KHATULISTIWA · ×1', x + w - 8, yEq - 20, { size: 22, color: KT.amberHi, align: 'right', track: 3 });

  // inflation bars
  const rows = [[45, 2.0, KT.amber], [60, 4.0, KT.coral]];
  let by = yEq + 70;
  for (const [lat, fac, col] of rows) {
    const yy = yEq - (lat / 75) * (h / 2);
    const bl = (w - 160) * (fac / 4.4) * eo(grow);
    ctx.fillStyle = rgba(col, 0.8);
    ctx.fillRect(x + 40, yy - 9, bl, 18);
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillStyle = col;
    ctx.textAlign = 'left';
    ctx.fillText(`×${fac.toFixed(0)}`, x + 46 + bl, yy + 8);
    by += 40;
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 13. ISLAND MATRIX — seventeen thousand sparks, counted honestly
// ----------------------------------------------------------------------------

/** point-in-polygon test on [lon, lat] pairs — ray casting, no libraries */
function pip(poly, lon, lat) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** true if a lon/lat falls inside any major island silhouette */
function inArchipelago(lon, lat) {
  for (const isl of ID_ISLANDS) if (pip(isl, lon, lat)) return true;
  for (const d of ID_DOTS) {
    const dx = (lon - d[0]) * Math.cos(lat * Math.PI / 180);
    const dy = lat - d[1];
    if (dx * dx + dy * dy < 0.55) return true;
  }
  return false;
}

/**
 * The island matrix: a lon/lat grid sampled through a real point-in-polygon
 * test against the archipelago, so the dot cloud IS the country's shape.
 * Each spark stands for ten islands; they ignite west to east with a hash
 * jitter, and a mono counter climbs to 17.508 beside the cloud.
 */
export function islandMatrix(ctx, x, y, w, h, t, o = {}) {
  const { p = 1, count = 1 } = o;
  const pr = proj(x, y + h, w / 46, 95, -11);
  const stepLon = 0.62;
  const stepLat = 0.52;
  ctx.save();
  ctx.globalAlpha = p;

  let idx = 0;
  const total = 96;
  for (let lat = 6; lat >= -11; lat -= stepLat) {
    for (let lon = 95; lon <= 141; lon += stepLon) {
      if (!inArchipelago(lon, lat)) continue;
      const [px, py] = pr(lon, lat);
      const gate = clamp(count * total - (idx * 0.55 + h1(idx) * 14), 0, 1);
      idx++;
      if (gate <= 0) continue;
      const tw = 0.65 + 0.35 * pulse(t, 0.7 + h1(idx) * 0.5, idx);
      ctx.fillStyle = rgba(h1(idx) > 0.82 ? KT.amberHi : KT.amber, 0.85 * gate * tw);
      ctx.beginPath();
      ctx.arc(px, py, 2.6 + h1(idx + 7) * 1.6, 0, TAU);
      ctx.fill();
    }
  }

  // counter to 17.508
  const n = Math.round(17508 * eo(count));
  ctx.font = '800 62px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.amberHi;
  ctx.textAlign = 'right';
  ctx.shadowColor = 'rgba(242,180,65,0.6)';
  ctx.shadowBlur = 18;
  ctx.fillText(idn(n), x + w, y - 26);
  ctx.shadowBlur = 0;
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.paperDim;
  ctx.fillText('PULAU · 1 TITIK = 10 PULAU', x + w, y + h + 40);
  ctx.restore();
}

/**
 * Coastline ribbon: three layered sine strokes whose combined length stands
 * for the 99.093 km coastline — the second longest on Earth. A travelling
 * highlight runs the ribbon like a survey wheel, with a km odometer tag.
 */
export function coastRibbon(ctx, x, y, w, t, o = {}) {
  const { p = 1, km = 99093 } = o;
  ctx.save();
  ctx.globalAlpha = p;
  const layers = [[0, 10, 0.55], [1.7, 7, 0.35], [3.1, 13, 0.22]];
  for (const [ph, amp, al] of layers) {
    ctx.strokeStyle = rgba(KT.teal, al);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= w; i += 6) {
      const yy = y + Math.sin(i * 0.016 + t * 1.1 + ph) * amp
        + Math.sin(i * 0.041 - t * 0.7 + ph) * amp * 0.5;
      if (i === 0) ctx.moveTo(x + i, yy); else ctx.lineTo(x + i, yy);
    }
    ctx.stroke();
  }
  // survey wheel highlight
  const hx = x + ((t * 0.12) % 1) * w;
  const hg = ctx.createRadialGradient(hx, y, 4, hx, y, 90);
  hg.addColorStop(0, 'rgba(255,227,160,0.55)');
  hg.addColorStop(1, 'rgba(255,227,160,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(hx - 90, y - 40, 180, 80);
  ctx.font = '700 26px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.paper;
  ctx.textAlign = 'right';
  ctx.fillText(`${idn(km)} KM GARIS PANTAI`, x + w, y + 56);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 14. ZONE DIALS — WIB / WITA / WIT, one sun, three clocks
// ----------------------------------------------------------------------------

/**
 * Three clock dials for UTC+7 / +8 / +9 driven by one base UTC hour, so the
 * hands really disagree by exactly one hour each: when Jayapura reads 07:00
 * Banda Aceh reads 05:00. Each dial carries a sun or moon glyph by local
 * hour, a city tag, and a rim arc tinted amber (day) or ink (night).
 */
export function zoneDials(ctx, cx, cy, t, o = {}) {
  const { p = 1, utcHour = 22, gap = 300 } = o;
  const zones = [
    { tag: 'WIB · UTC+7', city: 'BANDA ACEH', off: 7 },
    { tag: 'WITA · UTC+8', city: 'MAKASSAR', off: 8 },
    { tag: 'WIT · UTC+9', city: 'JAYAPURA', off: 9 },
  ];
  ctx.save();
  ctx.globalAlpha = p;
  zones.forEach((z, i) => {
    const x = cx + (i - 1) * gap;
    const r = 108;
    const local = (utcHour + z.off) % 24;
    const hour = local % 12;
    const day = local >= 6 && local < 18;

    // dial body
    ctx.fillStyle = 'rgba(6,39,48,0.75)';
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = day ? rgba(KT.amber, 0.8) : rgba(KT.iceDim, 0.6);
    ctx.lineWidth = 2.4;
    ctx.shadowColor = day ? KT.amber : KT.iceDim;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // hour ticks
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU - Math.PI / 2;
      ctx.strokeStyle = rgba(KT.paper, k % 3 === 0 ? 0.7 : 0.3);
      ctx.lineWidth = k % 3 === 0 ? 3 : 1.4;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14));
      ctx.lineTo(x + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
      ctx.stroke();
    }

    // hands: minute hand sweeps live, hour hand from the zone offset
    const mA = (t * 0.05 % 1) * TAU - Math.PI / 2;
    const hA = ((hour + 0.5) / 12) * TAU - Math.PI / 2;
    ctx.strokeStyle = KT.paper;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, cy);
    ctx.lineTo(x + Math.cos(hA) * (r * 0.5), cy + Math.sin(hA) * (r * 0.5));
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = rgba(KT.teal, 0.9);
    ctx.beginPath();
    ctx.moveTo(x, cy);
    ctx.lineTo(x + Math.cos(mA) * (r * 0.78), cy + Math.sin(mA) * (r * 0.78));
    ctx.stroke();
    ctx.lineCap = 'butt';

    // sun / moon glyph
    const gy = cy - r - 44;
    if (day) {
      ctx.fillStyle = KT.amberHi;
      ctx.shadowColor = KT.amber;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(x, gy, 12, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU + t * 0.3;
        ctx.strokeStyle = rgba(KT.amberHi, 0.8);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 17, gy + Math.sin(a) * 17);
        ctx.lineTo(x + Math.cos(a) * 24, gy + Math.sin(a) * 24);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = KT.iceDim;
      ctx.beginPath();
      ctx.arc(x, gy, 12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(6,39,48,1)';
      ctx.beginPath();
      ctx.arc(x + 6, gy - 4, 10, 0, TAU);
      ctx.fill();
    }

    // tags + digital readout
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillStyle = day ? KT.amber : KT.ice;
    ctx.textAlign = 'center';
    ctx.fillText(z.tag, x, cy + r + 44);
    ctx.font = '600 21px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.paperDim;
    ctx.fillText(z.city, x, cy + r + 74);
    ctx.font = '800 34px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.paper;
    ctx.fillText(`${String(local).padStart(2, '0')}:00`, x, cy + r + 116);
  });
  ctx.restore();
}

/**
 * Terminator sweep across the archipelago: a vertical band of dawn light
 * travels west to east over the island silhouettes at true longitude speed,
 * leaving lit coastlines behind it and night ahead — width you can watch.
 */
export function sunSweep(ctx, x, y, w, h, t, o = {}) {
  const { p = 1, prog = 0.5 } = o;
  const pr = proj(x, y + h / 2, w / 46, 95, -2.5);
  const lx = x + eo(prog) * w;
  ctx.save();
  ctx.globalAlpha = p;
  for (const isl of ID_ISLANDS) {
    drawCoast(ctx, isl, pr, { stroke: 'rgba(154,216,232,0.45)', fill: 'rgba(154,216,232,0.05)', lw: 2, glow: 4 });
  }
  // lit side clipped
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y - 20, lx - x, h + 40);
  ctx.clip();
  for (const isl of ID_ISLANDS) {
    drawCoast(ctx, isl, pr, { stroke: amberStroke(ctx), fill: 'rgba(242,180,65,0.12)', lw: 2.6, glow: 14 });
  }
  ctx.restore();
  // dawn band
  const bg = ctx.createLinearGradient(lx - 70, 0, lx + 70, 0);
  bg.addColorStop(0, 'rgba(255,227,160,0)');
  bg.addColorStop(0.5, 'rgba(255,227,160,0.35)');
  bg.addColorStop(1, 'rgba(255,227,160,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(lx - 70, y - 20, 140, h + 40);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 15. VOTE TALLY — 4 September 2026, 164 in favour, 1 against, 6 abstaining
// ----------------------------------------------------------------------------

/**
 * The UN hemicycle as concentric dot arcs: 164 gold votes ignite seat by
 * seat, six slate abstentions sit at the rim, and the single coral "no" —
 * the United States — pulses alone under a tag once the count completes.
 * A three-part mono counter runs beneath the arc.
 */
export function voteTally(ctx, cx, cy, r, t, o = {}) {
  const { p = 1, count = 1 } = o;
  const seats = 171;
  ctx.save();
  ctx.globalAlpha = p;

  let n = 0;
  for (let ring = 0; ring < 6; ring++) {
    const rr2 = r - ring * 34;
    const per = Math.floor((rr2 * Math.PI) / 26);
    for (let k = 0; k < per && n < seats; k++, n++) {
      const a = Math.PI + (k + 0.5) / per * Math.PI;
      const x = cx + Math.cos(a) * rr2;
      const y = cy + Math.sin(a) * rr2;
      const gate = clamp(count * seats * 1.15 - n, 0, 1);
      let col = KT.gold;
      if (n >= 164 && n < 170) col = KT.slate;
      const isNo = n === 170;
      if (isNo) col = KT.coral;
      const al = gate * (isNo ? 0.7 + 0.3 * pulse(t, 1.6) : 0.85);
      ctx.fillStyle = rgba(col, al);
      if (isNo && gate > 0) {
        ctx.shadowColor = KT.coral;
        ctx.shadowBlur = 16;
      }
      ctx.beginPath();
      ctx.arc(x, y, isNo ? 7 : 5, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (isNo && gate > 0.5) {
        ctx.font = '700 22px "JetBrains Mono", monospace';
        ctx.fillStyle = KT.coral;
        ctx.textAlign = 'center';
        ctx.fillText('AS', x, y + 34);
      }
    }
  }

  // counter row
  const yes = Math.round(164 * eo(count));
  const abs = Math.round(6 * clamp(count * 1.4 - 0.4, 0, 1));
  const no = count > 0.97 ? 1 : 0;
  ctx.font = '800 40px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = KT.gold;
  ctx.fillText(`${yes} SETUJU`, cx - 330, cy + 70);
  ctx.fillStyle = KT.slate;
  ctx.fillText(`${abs} ABSTAIN`, cx, cy + 70);
  ctx.fillStyle = KT.coral;
  ctx.fillText(`${no} MENOLAK`, cx + 330, cy + 70);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 16. PROJECTION MORPH — Mercator to Equal Earth, live
// ----------------------------------------------------------------------------

/** Equal-Earth-style honest y (sine-area spacing), degrees -> -1..1 */
const eeY = (lat) => Math.sin(lat * Math.PI / 180);

/**
 * One graticule drawn twice: parallels sit at lerp(mercator, equal-earth, m),
 * so the sheet visibly deflates toward honesty as m sweeps 0..1. Indonesia's
 * silhouette rides along unchanged (it lives on the equator) while Greenland
 * shrinks toward its true body — the correction as motion, not as talk.
 */
export function projectionMorph(ctx, x, y, w, h, t, o = {}) {
  const { p = 1, m = 0 } = o;
  const yEq = y + h / 2;
  const yOf = (lat) => {
    const mm = (mercY(lat) / mercY(78)) * (h / 2);
    const ee = (eeY(lat) / eeY(78)) * (h / 2) * 1.12;
    return yEq - lerp(mm, ee, m);
  };
  const pr = (lon, lat) => [x + ((lon + 180) / 360) * w, yOf(lat)];
  ctx.save();
  ctx.globalAlpha = p;

  // meridians
  ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const mx = x + ((lon + 180) / 360) * w;
    ctx.strokeStyle = 'rgba(63,196,208,0.20)';
    ctx.beginPath();
    ctx.moveTo(mx, y);
    ctx.lineTo(mx, y + h);
    ctx.stroke();
  }
  // parallels at morphed spacing
  for (let lat = -75; lat <= 75; lat += 15) {
    ctx.strokeStyle = lat === 0 ? 'rgba(242,180,65,0.85)' : 'rgba(63,196,208,0.26)';
    ctx.lineWidth = lat === 0 ? 2.4 : 1.1;
    ctx.beginPath();
    ctx.moveTo(x, yOf(lat));
    ctx.lineTo(x + w, yOf(lat));
    ctx.stroke();
  }

  // Greenland deflating, Indonesia steady
  drawCoast(ctx, GREENLAND, pr, { stroke: rgba(KT.coral, 0.9 - 0.5 * m), fill: rgba(KT.coral, 0.10), lw: 2.2, glow: 8 });
  for (const isl of ID_ISLANDS) {
    drawCoast(ctx, isl, pr, { stroke: amberStroke(ctx), fill: 'rgba(242,180,65,0.12)', lw: 2.4, glow: 12 });
  }

  // mode tag
  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = m < 0.5 ? KT.coral : KT.teal;
  ctx.fillText(m < 0.5 ? 'MERCATOR 1569' : 'EQUAL EARTH 2018', x + 18, y + 36);
  const bar = 150;
  ctx.strokeStyle = rgba(KT.paper, 0.4);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w - bar - 18, y + 28);
  ctx.lineTo(x + w - 18, y + 28);
  ctx.stroke();
  ctx.fillStyle = KT.teal;
  ctx.beginPath();
  ctx.arc(x + w - bar - 18 + bar * m, y + 28, 6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 17. COMPASS ROSE + LONGITUDE PROTRACTOR
// ----------------------------------------------------------------------------

/**
 * Eight-point compass rose with a shimmering needle and mono cardinal tags;
 * used as the room's furniture and as a transition anchor.
 */
export function compassRose(ctx, x, y, r, t, o = {}) {
  const { p = 1 } = o;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = rgba(KT.teal, 0.6);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.62, 0, TAU);
  ctx.stroke();
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU - Math.PI / 2;
    const long = k % 2 === 0;
    const rl = long ? r : r * 0.62;
    ctx.fillStyle = long ? rgba(KT.amber, 0.85) : rgba(KT.teal, 0.6);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * rl, y + Math.sin(a) * rl);
    ctx.lineTo(x + Math.cos(a + 0.16) * r * 0.24, y + Math.sin(a + 0.16) * r * 0.24);
    ctx.lineTo(x + Math.cos(a - 0.16) * r * 0.24, y + Math.sin(a - 0.16) * r * 0.24);
    ctx.closePath();
    ctx.fill();
  }
  // needle shimmer
  const na = -Math.PI / 2 + Math.sin(t * 0.6) * 0.06;
  ctx.strokeStyle = KT.amberHi;
  ctx.lineWidth = 2.6;
  ctx.shadowColor = KT.amber;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x - Math.cos(na) * r * 0.5, y - Math.sin(na) * r * 0.5);
  ctx.lineTo(x + Math.cos(na) * r * 0.9, y + Math.sin(na) * r * 0.9);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.paper;
  ctx.textAlign = 'center';
  ctx.fillText('U', x, y - r - 14);
  ctx.fillText('S', x, y + r + 28);
  ctx.fillText('T', x + r + 18, y + 8);
  ctx.fillText('B', x - r - 18, y + 8);
  ctx.restore();
}

/**
 * Longitude protractor: a half-disc centred on the equator measuring the
 * 46-degree span 95E-141E with 5-degree ticks, degree numerals and a filled
 * amber sector that closes as `p` rises — the width of Indonesia expressed
 * as pure angle.
 */
export function lonProtractor(ctx, cx, cy, r, t, o = {}) {
  const { p = 1, a0 = 95, a1 = 141 } = o;
  const toA = (lon) => Math.PI - ((lon - 60) / 120) * Math.PI;
  ctx.save();
  ctx.globalAlpha = p;

  ctx.strokeStyle = rgba(KT.teal, 0.5);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, Math.PI, TAU);
  ctx.stroke();

  for (let lon = 60; lon <= 180; lon += 5) {
    const a = toA(lon);
    const big = lon % 30 === 0;
    ctx.strokeStyle = rgba(KT.teal, big ? 0.7 : 0.3);
    ctx.lineWidth = big ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - (big ? 18 : 9)), cy + Math.sin(a) * (r - (big ? 18 : 9)));
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
    if (big) {
      ctx.font = '600 19px "JetBrains Mono", monospace';
      ctx.fillStyle = KT.iceDim;
      ctx.textAlign = 'center';
      ctx.fillText(`${lon}°`, cx + Math.cos(a) * (r + 26), cy + Math.sin(a) * (r + 26) + 6);
    }
  }

  // the 46-degree sector, closing with p
  const aEnd = toA(lerp(a0, a1, eo(p)));
  ctx.fillStyle = 'rgba(242,180,65,0.18)';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r * 0.8, toA(a0), aEnd);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = KT.amber;
  ctx.lineWidth = 3;
  ctx.shadowColor = KT.amber;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(toA(a0)) * r * 0.8, cy + Math.sin(toA(a0)) * r * 0.8);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + Math.cos(aEnd) * r * 0.8, cy + Math.sin(aEnd) * r * 0.8);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = '800 40px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.amberHi;
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(lerp(0, a1 - a0, eo(p)))}° BUJUR`, cx, cy - r * 0.34);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 18. HUD KIT — panels, headings, chips, counters, coordinate cursor
// ----------------------------------------------------------------------------

/**
 * Glass survey panel: ink fill, teal hairline, doubled corner ticks and an
 * optional mono title bar. Every instrument in the room hangs on one of
 * these so the composition stays architectural.
 */
export function panel(ctx, x, y, w, h, o = {}) {
  const { title = '', p = 1, tint = 'rgba(6,39,48,0.62)' } = o;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = tint;
  rr(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = rgba(KT.teal, 0.42);
  ctx.lineWidth = 1.4;
  rr(ctx, x, y, w, h, 12);
  ctx.stroke();
  const c = 20;
  ctx.strokeStyle = KT.teal;
  ctx.lineWidth = 2.2;
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const cx0 = sx > 0 ? x : x + w;
    const cy0 = sy > 0 ? y : y + h;
    ctx.beginPath();
    ctx.moveTo(cx0 + sx * c, cy0);
    ctx.lineTo(cx0, cy0);
    ctx.lineTo(cx0, cy0 + sy * c);
    ctx.stroke();
  }
  if (title) {
    ctx.fillStyle = rgba(KT.teal, 0.14);
    rr(ctx, x + 1, y + 1, w - 2, 46, 11);
    ctx.fill();
    ctx.font = '700 22px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.teal;
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 32);
  }
  ctx.restore();
}

/**
 * Episode heading: paper-white main line with an amber accent word, mono
 * kicker above and optional sub line below. Auto-fits: if the composed line
 * exceeds W-220 it scales down instead of overflowing (the Ep34 fix, kept).
 */
export function heading(ctx, main, accent, x, y, o = {}) {
  const { sub = '', kicker = '', p = 1, size = 118 } = o;
  ctx.save();
  ctx.globalAlpha = p;
  const line = `${main} ${accent}`;
  let fs = size;
  ctx.font = `800 ${fs}px "Archivo Black", "Arial Black", sans-serif`;
  const wNeed = ctx.measureText(line).width;
  if (wNeed > W - 220) fs = Math.floor(fs * (W - 220) / wNeed);
  const stagger = 1 - Math.pow(1 - clamp(p, 0, 1), 3);

  if (kicker) {
    ctx.font = '700 26px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.teal;
    ctx.textAlign = 'left';
    for (let i = 0; i < kicker.length; i++) {
      const q = clamp(p * 2 - i * 0.06, 0, 1);
      ctx.globalAlpha = p * q;
      ctx.fillText(kicker[i], x + i * 20, y - fs * 0.72);
    }
    ctx.globalAlpha = p;
  }

  ctx.font = `800 ${fs}px "Archivo Black", "Arial Black", sans-serif`;
  ctx.textAlign = 'left';
  const wMain = ctx.measureText(main + ' ').width;
  ctx.save();
  ctx.translate(0, (1 - stagger) * 26);
  ctx.fillStyle = KT.paper;
  ctx.shadowColor = 'rgba(237,230,214,0.35)';
  ctx.shadowBlur = 22;
  ctx.fillText(main + ' ', x, y);
  ctx.shadowColor = 'rgba(242,180,65,0.55)';
  ctx.fillStyle = KT.amber;
  ctx.fillText(accent, x + wMain, y);
  ctx.shadowBlur = 0;
  ctx.restore();

  if (sub) {
    ctx.font = '600 26px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.paperDim;
    ctx.save();
    ctx.translate(0, (1 - stagger) * 14);
    ctx.fillText(sub, x, y + 52);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Overshoot chip: mono tag in a pill that pops in with a spring scale and a
 * tinted hairline; color follows the argument (amber Indonesia, ice US,
 * coral the lie, teal the graticule).
 */
export function chip(ctx, txt, x, y, o = {}) {
  const { p = 1, color = KT.amber } = o;
  const s = 0.7 + 0.3 * eo(p) + 0.06 * Math.sin(clamp(p, 0, 1) * Math.PI);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha = clamp(p * 1.4, 0, 1);
  ctx.font = '700 26px "JetBrains Mono", monospace';
  const w = ctx.measureText(txt).width + 52;
  ctx.fillStyle = 'rgba(3,20,26,0.8)';
  rr(ctx, -w / 2, -28, w, 56, 28);
  ctx.fill();
  ctx.strokeStyle = rgba(color, 0.85);
  ctx.lineWidth = 2;
  rr(ctx, -w / 2, -28, w, 56, 28);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(txt, 0, 9);
  ctx.restore();
}

/**
 * Odometer counter: digits roll column by column (Indonesian thousands
 * dots included) inside a mono slab; `p` drives the roll with a settle.
 */
export function counter(ctx, val, x, y, p, o = {}) {
  const { size = 54, color = KT.amberHi, suffix = '' } = o;
  const target = Math.round(val * eo(p));
  const str = idn(target) + suffix;
  ctx.save();
  ctx.font = `800 ${size}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'left';
  let cx = x;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (/\d/.test(ch)) {
      const roll = clamp(p * 3 - i * 0.12, 0, 1);
      const off = (1 - roll) * size * 0.7;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - 2, y - size, size * 0.72, size * 1.25);
      ctx.clip();
      ctx.fillStyle = rgba(color, 0.35);
      ctx.fillText(String((+ch + 3) % 10), cx, y - off);
      ctx.fillStyle = color;
      ctx.fillText(ch, cx, y - off + off * 0 + (roll >= 1 ? 0 : 0));
      ctx.restore();
      ctx.fillStyle = color;
      ctx.fillText(ch, cx, y);
    } else {
      ctx.fillStyle = rgba(color, 0.7);
      ctx.fillText(ch, cx, y);
    }
    cx += ctx.measureText(ch).width + 2;
  }
  ctx.restore();
  return cx;
}

/**
 * Coordinate cursor: a surveyor's crosshair that drifts over the sheet with
 * a live lon/lat readout in a mono tag — the room's way of saying "measured,
 * not guessed".
 */
export function coordCursor(ctx, x, y, t, o = {}) {
  const { p = 1, lon = 118, lat = -2 } = o;
  ctx.save();
  ctx.globalAlpha = p;
  const jx = x + Math.sin(t * 0.7) * 5;
  const jy = y + Math.cos(t * 0.9) * 4;
  ctx.strokeStyle = rgba(KT.amberHi, 0.8);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(jx - 22, jy); ctx.lineTo(jx - 7, jy);
  ctx.moveTo(jx + 7, jy); ctx.lineTo(jx + 22, jy);
  ctx.moveTo(jx, jy - 22); ctx.lineTo(jx, jy - 7);
  ctx.moveTo(jx, jy + 7); ctx.lineTo(jx, jy + 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(jx, jy, 4, 0, TAU);
  ctx.stroke();
  ctx.font = '600 19px "JetBrains Mono", monospace';
  ctx.fillStyle = rgba(KT.paper, 0.8);
  ctx.textAlign = 'left';
  ctx.fillText(`${lon.toFixed(1)}°E ${Math.abs(lat).toFixed(1)}°${lat < 0 ? 'S' : 'N'}`, jx + 28, jy - 12);
  ctx.restore();
}

/**
 * Distance arc: a dashed great-circle-style arc between two projected points
 * with endpoint pins and a kilometre tag — the room's way of tying two places
 * together with a measured span (used on the true-size sheet and the
 * equator sheet).
 */
export function distanceArc(ctx, pr, a, b, t, o = {}) {
  const { p = 1, tag = '', color = KT.amberHi } = o;
  const [x0, y0] = pr(a[0], a[1]);
  const [x1, y1] = pr(b[0], b[1]);
  const mx = (x0 + x1) / 2;
  const my = Math.min(y0, y1) - 90;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = rgba(color, 0.8);
  ctx.lineWidth = 2.4;
  ctx.setLineDash([12, 8]);
  ctx.lineDashOffset = -t * 60;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(mx, my, x1, y1);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const [px, py] of [[x0, y0], [x1, y1]]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, TAU);
    ctx.fill();
  }
  if (tag) {
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(tag, mx, my - 18);
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 19. TRANSITIONS — grid flash, route pass, sheet turn
// ----------------------------------------------------------------------------

/**
 * Grid flash: on a scene cut the graticule ignites for ~0.2 s — teal lines
 * bloom from the centre out, selling the cut as the room re-projecting.
 */
export function gridFlash(ctx, t, at, dur = 0.24) {
  const q = (t - at) / dur;
  if (q < 0 || q > 1) return;
  const a = Math.sin(q * Math.PI);
  ctx.save();
  ctx.globalAlpha = a * 0.5;
  ctx.strokeStyle = KT.teal;
  ctx.lineWidth = 1.4;
  for (let i = 1; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo((W / 8) * i, 0);
    ctx.lineTo((W / 8) * i, H);
    ctx.stroke();
  }
  for (let i = 1; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (H / 12) * i);
    ctx.lineTo(W, (H / 12) * i);
    ctx.stroke();
  }
  ctx.fillStyle = rgba(KT.white, a * 0.10);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/**
 * Route pass: a dashed great-circle arc sweeps the frame with a travelling
 * glow head — used between the measure scenes as if the room were redrawing
 * the route from Sabang to Merauke.
 */
export function routePass(ctx, t, o = {}) {
  const { p = 1, y0 = 900 } = o;
  ctx.save();
  ctx.globalAlpha = p;
  const q = (t * 0.5) % 1.4;
  if (q < 1) {
    const hx = eo(q) * (W + 400) - 200;
    ctx.strokeStyle = rgba(KT.amber, 0.7);
    ctx.lineWidth = 2.4;
    ctx.setLineDash([14, 10]);
    ctx.lineDashOffset = -t * 90;
    ctx.beginPath();
    ctx.moveTo(-100, y0 + 60);
    ctx.quadraticCurveTo(W / 2, y0 - 160, W + 100, y0 + 60);
    ctx.stroke();
    ctx.setLineDash([]);
    const hy = y0 + 60 - Math.sin(q * Math.PI) * 150;
    const hg = ctx.createRadialGradient(hx, hy, 2, hx, hy, 120);
    hg.addColorStop(0, 'rgba(255,227,160,0.8)');
    hg.addColorStop(1, 'rgba(255,227,160,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(hx, hy, 120, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Sheet turn: the outgoing sheet rotates away on its left edge like a page
 * of an atlas being turned by an invisible hand; paired with gridFlash on
 * the incoming side.
 */
export function sheetTurn(ctx, t, at, dur = 0.4) {
  const q = (t - at) / dur;
  if (q < 0 || q > 1) return;
  ctx.save();
  ctx.translate(0, 0);
  const a = eo(q) * 0.5;
  ctx.fillStyle = rgba(KT.ink2, 0.55 * (1 - q));
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W * (1 - a), 0);
  ctx.lineTo(W * (1 - a * 1.4), H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(KT.teal, 0.5 * (1 - q));
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * (1 - a), 0);
  ctx.lineTo(W * (1 - a * 1.4), H);
  ctx.stroke();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 20. ROOM FINISH — holo scan, vignette, projector flare
// ----------------------------------------------------------------------------

/**
 * Hologram scanlines: fine horizontal interference lines with a slow bright
 * band climbing the frame — the sheet is light, not paper.
 */
export function holoScan(ctx, t, o = {}) {
  const { a = 0.05 } = o;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = KT.white;
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 1);
  const by = ((t * 0.09) % 1.2 - 0.1) * H;
  const g = ctx.createLinearGradient(0, by - 90, 0, by + 90);
  g.addColorStop(0, 'rgba(246,251,250,0)');
  g.addColorStop(0.5, 'rgba(246,251,250,0.5)');
  g.addColorStop(1, 'rgba(246,251,250,0)');
  ctx.globalAlpha = a * 1.6;
  ctx.fillStyle = g;
  ctx.fillRect(0, by - 90, W, 180);
  ctx.restore();
}

/** survey-room vignette: corners fall off into the dark */
export function vignette(ctx, o = {}) {
  const { a = 0.5 } = o;
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.78);
  g.addColorStop(0, 'rgba(3,20,26,0)');
  g.addColorStop(1, `rgba(3,20,26,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/**
 * Projector flare: an anamorphic streak from the room's light source, plus
 * two soft bokeh ghosts — the only "light effect" furniture the identity
 * allows, and it always sits behind the caption scrim.
 */
export function flareProj(ctx, x, y, t, o = {}) {
  const { p = 1, color = KT.amber } = o;
  ctx.save();
  ctx.globalAlpha = p;
  const g = ctx.createLinearGradient(x - 620, y, x + 620, y);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(0.5, rgba(color, 0.5 + 0.15 * pulse(t, 0.4)));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - 620, y - 3, 1240, 6);
  const rg = ctx.createRadialGradient(x, y, 2, x, y, 130);
  rg.addColorStop(0, rgba(KT.white, 0.7));
  rg.addColorStop(0.35, rgba(color, 0.35));
  rg.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(x, y, 130, 0, TAU);
  ctx.fill();
  for (const [gx, gr, ga] of [[x + 260, 46, 0.10], [x - 340, 70, 0.07]]) {
    const gg = ctx.createRadialGradient(gx, y, 2, gx, y, gr);
    gg.addColorStop(0, rgba(color, ga));
    gg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(gx, y, gr, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 21. COMMENT CARD — the closing typewriter question
// ----------------------------------------------------------------------------

/**
 * Closing card: a panel with a typewriter question line, a blinking caret
 * and three sample island tags that pop as suggestions — the comment CTA
 * rendered as part of the room, not as a sticker.
 */
export function commentCard(ctx, x, y, w, h, lines, t, o = {}) {
  const { p = 1, tags = ['SUMATRA', 'JAWA', 'SULAWESI', 'PAPUA'] } = o;
  ctx.save();
  ctx.globalAlpha = p;
  panel(ctx, x, y, w, h, { title: 'KOMENTAR' });
  ctx.font = '700 40px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.paper;
  ctx.textAlign = 'left';
  const full = lines.join(' ');
  const n = Math.floor(full.length * clamp(p * 1.6, 0, 1));
  const shown = full.slice(0, n);
  const lh = 58;
  const per = Math.floor((w - 90) / ctx.measureText('M').width);
  for (let i = 0; i * per < shown.length; i++) {
    ctx.fillText(shown.slice(i * per, (i + 1) * per), x + 44, y + 108 + i * lh);
  }
  if (p < 1 || pulse(t, 1.1) > 0.5) {
    const line = Math.floor(n / per);
    const cw = ctx.measureText(shown.slice(line * per)).width;
    ctx.fillStyle = KT.amber;
    ctx.fillRect(x + 44 + cw + 6, y + 108 + line * lh - 34, 22, 40);
  }
  tags.forEach((tg, i) => {
    const q = clamp(p * 2 - 1 - i * 0.15, 0, 1);
    if (q <= 0) return;
    chip(ctx, tg, x + 120 + i * 210, y + h - 70, { p: q, color: i % 2 ? KT.teal : KT.amber });
  });
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 23. MEASUREMENT FURNITURE — Tissot row, city marks, span stack
// ----------------------------------------------------------------------------

/**
 * Tissot indicatrix row: identical true-size circles placed at 0, 30, 45 and
 * 60 degrees on the Mercator sheet. On the sheet they grow exactly by
 * sec(lat) — the classical proof of distortion, drawn as four glowing rings
 * with their factor tagged, so the lie is geometry the eye can check.
 */
export function tissotRow(ctx, x, y, w, r0, t, o = {}) {
  const { p = 1, k = 1 } = o;
  const lats = [0, 30, 45, 60];
  ctx.save();
  ctx.globalAlpha = p;
  lats.forEach((lat, i) => {
    const cx = x + (i + 0.5) * (w / 4);
    const fac = 1 + (Math.sqrt(sec2(lat)) - 1) * k;
    const r = r0 * fac;
    const col = lat === 0 ? KT.teal : lat < 45 ? KT.amber : KT.coral;
    ctx.strokeStyle = rgba(col, 0.85);
    ctx.lineWidth = 2.6;
    ctx.shadowColor = col;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, y, r, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = rgba(col, 0.4);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, y, r0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillStyle = col;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.abs(lat)}°`, cx, y + r0 + 46);
    ctx.fillText(`×${fac.toFixed(2)}`, cx, y - r0 - 24);
  });
  ctx.restore();
}

/**
 * City mark: a survey pin at a lon/lat through any projector — ring pulse,
 * stem and mono tag with a leader line; used for Sabang, Merauke, Jayapura,
 * Banda Aceh and the Irish and Caspian anchors of the transport.
 */
export function cityMark(ctx, pr, lon, lat, tag, t, o = {}) {
  const { p = 1, color = KT.amberHi, dy = -34, align = 'center' } = o;
  const [x, y] = pr(lon, lat);
  ctx.save();
  ctx.globalAlpha = p;
  const ring = 6 + 10 * ((t * 0.7 + lon * 0.01) % 1);
  ctx.strokeStyle = rgba(color, 0.55 * (1 - ((t * 0.7 + lon * 0.01) % 1)));
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, ring, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = rgba(color, 0.7);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + dy + 8);
  ctx.stroke();
  ctx.font = '700 21px "JetBrains Mono", monospace';
  ctx.fillStyle = KT.paper;
  ctx.textAlign = align;
  ctx.fillText(tag, x, y + dy);
  ctx.restore();
}

/**
 * Span stack: four measured spans as horizontal bars on one kilometre axis
 * — Sabang-Merauke great circle 5.248, Indonesia east-west 5.120, contiguous
 * US along 45N 4.544, US great circle 4.322 — each bar drawing in with an
 * odometer tag, so "lebih lebar" ends as a chart, not a claim.
 */
export function spanStack(ctx, x, y, w, t, o = {}) {
  const { p = 1 } = o;
  const rows = [
    ['SABANG–MERAUKE', 5248, KT.amberHi],
    ['INDONESIA T–B', 5120, KT.amber],
    ['AS SEPANJANG 45°N', 4544, KT.ice],
    ['AS GARIS LURUS', 4322, KT.iceDim],
  ];
  const maxKm = 5600;
  ctx.save();
  ctx.globalAlpha = p;
  rows.forEach(([tag, km, col], i) => {
    const yy = y + i * 92;
    const bw = (km / maxKm) * w * eo(clamp(p * 1.6 - i * 0.14, 0, 1));
    ctx.fillStyle = rgba(KT.teal, 0.12);
    ctx.fillRect(x, yy, w, 34);
    const g = ctx.createLinearGradient(x, 0, x + bw, 0);
    g.addColorStop(0, rgba(col, 0.35));
    g.addColorStop(1, rgba(col, 0.9));
    ctx.fillStyle = g;
    ctx.fillRect(x, yy, bw, 34);
    ctx.strokeStyle = rgba(col, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + bw, yy - 6);
    ctx.lineTo(x + bw, yy + 40);
    ctx.stroke();
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.fillStyle = KT.paperDim;
    ctx.textAlign = 'left';
    ctx.fillText(tag, x, yy - 12);
    ctx.fillStyle = col;
    ctx.textAlign = 'right';
    ctx.fillText(`${idn(km)} km`, x + w, yy - 12);
  });
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 22. RE-EXPORTS — the shared house kit, so scenes import one file
// ----------------------------------------------------------------------------

export {
  cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn,
  spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch,
  snow, rgba, W, H, grain, back, odo, idn, pulse, rr,
};
