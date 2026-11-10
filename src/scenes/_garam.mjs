/**
 * Episode 8 art kit — "Negeri · Asin".
 *
 * The whole episode is a satellite view of the same thing: ponds. So the kit is
 * built around one idea — a perspective grid of embanked plots — and everything
 * else (salt heaps, sacks, a bulk carrier, a washing plant) is drawn to sit on
 * or beside that grid.
 */
import { W, H, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';

export const G = {
  ink: '#140F0C',
  ink2: '#241A15',
  ink3: '#3C2B21',
  salt: '#FDFBF6',
  salt2: '#EDE6D8',
  crust: '#DFD3BC',
  crust2: '#C0AF92',
  pond: '#8CBFB6',
  pond2: '#4C8A84',
  pondDeep: '#24514F',
  sun: '#F3A75F',
  sun2: '#DF7A3C',
  rust: '#B4472C',
  rust2: '#7C2B17',
  paper: '#F5EFE3',
  paper2: '#E6DBC6',
  bone: '#FBF6EC',
  haze: '#D9E7E2',
};

export const A = {
  out: (t) => EASE.outCubic(clamp(t)),
  expo: (t) => EASE.outExpo(clamp(t)),
  inOut: (t) => EASE.inOutQuad(clamp(t)),
};

/* --------------------------------- grid ---------------------------------- */

/** Perspective plot grid. Returns cells; paint them however a scene needs. */
export function gridCells({ x0 = -140, x1 = W + 140, y0 = 380, y1 = 1520, rows = 8, cols = 10, seed = 3, growth = 1.42, widthGrowth = 0.34 } = {}) {
  const raw = Array.from({ length: rows }, (_, i) => Math.pow(growth, i));
  const sum = raw.reduce((a, b) => a + b, 0);
  const hs = raw.map((v) => (v / sum) * (y1 - y0));
  const cells = [];
  const cx = (x0 + x1) / 2;
  let y = y0;
  for (let r = 0; r < rows; r++) {
    const scale = 1 + (r / Math.max(1, rows - 1)) * widthGrowth;
    const cw = ((x1 - x0) / cols) * scale;
    const span = cw * cols;
    const xs = cx - span / 2;
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: xs + c * cw,
        y,
        w: cw,
        h: hs[r],
        row: r,
        col: c,
        depth: r / Math.max(1, rows - 1),
        key: `${r}:${c}`,
        seed: seed * 31 + r * 17 + c * 7,
      });
    }
    y += hs[r];
  }
  return { cells, heights: hs };
}

/**
 * Salt ponds seen from a drone: embankments, flat pans, thin glints on the
 * water, salt crust crawling in as the season dries.
 */
export function ponds(ctx, {
  x0 = -140, x1 = W + 140, y0 = 380, y1 = 1520, rows = 10, cols = 11,
  seed = 3, t = 0, crust = 0, a = 1, dyke = 0.055, repaint = 0, sparkle = 1,
} = {}) {
  const { cells } = gridCells({ x0, x1, y0, y1, rows, cols, seed });
  const r = rng(seed * 13 + 5);
  ctx.save();
  ctx.globalAlpha *= a;

  // the dry frame between the pans: mud, salt, dust
  const bg = linGrad(ctx, 0, y0, 0, y1, [[0, '#B2A184'], [0.5, '#BCAB8C'], [1, '#A9987B']]);
  ctx.fillStyle = bg;
  ctx.fillRect(x0 - 60, y0 - 40, x1 - x0 + 120, y1 - y0 + 80);
  ctx.fillStyle = 'rgba(120,100,72,0.10)';
  const rr0 = rng(seed + 77);
  for (let i = 0; i < 900; i++) ctx.fillRect(x0 + rr0() * (x1 - x0), y0 + rr0() * (y1 - y0), 4, 4);

  for (const cell of cells) {
    const n = r();
    const gx = cell.w * dyke;
    const gy = cell.h * dyke;
    const x = cell.x + gx;
    const y = cell.y + gy;
    const w = cell.w - gx * 2;
    const h = cell.h - gy * 2;

    // water: deeper at the near edge, brighter where the sun catches it
    const lit = 0.16 + 0.3 * n;
    const g = linGrad(ctx, 0, y, 0, y + h, [
      [0, mixCol(G.pond2, G.haze, 0.30 * (1 - cell.depth * 0.55))],
      [1, mixCol(G.pond, G.haze, 0.42 * (1 - cell.depth * 0.55))],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);

    // wind ripple: two or three thin lines, moving
    ctx.fillStyle = hexA('#EAF6F4', 0.10 + 0.05 * Math.sin(t * 0.8 + cell.seed));
    const ry = 0.18 + 0.5 * Math.abs(Math.sin(cell.seed * 0.7));
    ctx.fillRect(x + w * 0.08, y + h * ry, w * (0.4 + 0.35 * n), Math.max(1.5, h * 0.05));

    // salt crust: a wash that starts at the edges and closes over the pan
    const c = clamp(crust * (0.5 + 1.05 * n) - 0.12);
    if (c > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      // edge wash
      ctx.globalAlpha = a * Math.min(1, c * 1.5) * 0.95;
      ctx.fillStyle = G.salt;
      const edge = Math.min(w, h) * (0.18 + 0.5 * c);
      ctx.fillRect(x, y, w, edge * 0.5);
      ctx.fillRect(x, y + h - edge * 0.5, w, edge * 0.5);
      ctx.fillRect(x, y, edge * 0.5, h);
      ctx.fillRect(x + w - edge * 0.5, y, edge * 0.5, h);
      // the pan closes from one corner, irregular
      if (c > 0.55) {
        ctx.globalAlpha = a * Math.min(1, (c - 0.55) * 3.4);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w * (0.25 + 0.6 * n), y);
        ctx.lineTo(x + w * 0.9, y + h * 0.7);
        ctx.lineTo(x + w * 0.6, y + h);
        ctx.lineTo(x, y + h * 0.55);
        ctx.closePath();
        ctx.fillStyle = G.salt;
        ctx.fill();
      }
      // rake ridges across the drying salt
      if (c > 0.35) {
        ctx.globalAlpha = a * 0.22;
        ctx.strokeStyle = '#9C8A6C';
        ctx.lineWidth = Math.max(1, h * 0.02);
        for (let yy = y + h * 0.14; yy < y + h; yy += Math.max(6, h * 0.16)) {
          ctx.beginPath();
          ctx.moveTo(x + w * 0.05, yy);
          ctx.lineTo(x + w * 0.95, yy);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // embankment shading: dark on the top/left, lit on the bottom/right
    ctx.fillStyle = 'rgba(70,56,38,0.22)';
    ctx.fillRect(x, y, w, Math.max(1.5, h * 0.05));
    ctx.fillRect(x, y, Math.max(1.5, w * 0.025), h);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(x, y + h - Math.max(1.5, h * 0.04), w, Math.max(1.5, h * 0.04));

    // a scatter of loose crystals on the dry rim
    if (sparkle > 0) {
      ctx.fillStyle = hexA('#FFFFFF', 0.55 * sparkle);
      const rr2 = rng(cell.seed);
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(cell.x + rr2() * cell.w, cell.y + gy * 0.5, 2 + rr2() * 3, 2 + rr2() * 3);
      }
    }

    if (repaint > 0 && cell.depth > 1 - repaint * 1.15) {
      ctx.fillStyle = 'rgba(30,22,17,0.6)';
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
    }
  }
  ctx.restore();
}

const mixCol = (a, b, k) => {
  const p = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const f = (x, y) => Math.round(lerp(x, y, k)).toString(16).padStart(2, '0');
  return `#${f(r1, r2)}${f(g1, g2)}${f(b1, b2)}`;
};

/** Rows of roofed houses, for the land that used to be ponds. */
export function houses(ctx, {
  x0 = -140, x1 = W + 140, y0 = 380, y1 = 1520, rows = 8, cols = 8,
  seed = 11, a = 1, lit = 1, t = 0,
} = {}) {
  const { cells } = gridCells({ x0, x1, y0, y1, rows, cols, seed, growth: 1.42, widthGrowth: 0.34 });
  const r = rng(seed * 7 + 2);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = '#3A2C1E';
  ctx.fillRect(x0 - 60, y0 - 40, x1 - x0 + 120, y1 - y0 + 80);
  // service roads between the rows
  ctx.fillStyle = 'rgba(196,176,146,0.20)';
  for (const cell of cells) {
    const n = r();
    const w = cell.w * 0.62;
    const h = cell.h * 0.52;
    const x = cell.x + (cell.w - w) / 2 + (n - 0.5) * cell.w * 0.1;
    const y = cell.y + (cell.h - h) / 2;
    // lot
    ctx.fillStyle = 'rgba(214,196,168,0.13)';
    ctx.fillRect(cell.x + cell.w * 0.06, cell.y + cell.h * 0.06, cell.w * 0.88, cell.h * 0.88);
    // roof
    ctx.fillStyle = n > 0.5 ? '#7A6146' : '#6A5340';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,226,176,0.22)';
    ctx.fillRect(x, y, w, Math.max(2, h * 0.12));
    // windows
    const on = lit * (0.45 + 0.55 * Math.abs(Math.sin(t * 0.6 + cell.seed)));
    if (on > 0.05) {
      ctx.fillStyle = hexA('#FFC978', 0.75 * on);
      const cols2 = 3;
      for (let i = 0; i < cols2; i++) {
        ctx.fillRect(x + w * (0.16 + i * 0.3), y + h * 0.42, Math.max(2, w * 0.12), Math.max(2, h * 0.24));
      }
    }
  }
  ctx.restore();
}

/* --------------------------------- salt ---------------------------------- */

/** A conical salt heap with a lit side and a shadow side. */
export function heap(ctx, x, base, w, h, { a = 1, tone = G.salt, t = 0, label = '' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  // contact shadow
  ctx.fillStyle = radGrad(ctx, x, base, 4, w * 0.62, [[0, 'rgba(30,22,16,0.42)'], [1, 'rgba(30,22,16,0)']]);
  ctx.fillRect(x - w * 0.75, base - h * 0.14, w * 1.5, h * 0.4);

  const g = linGrad(ctx, x - w / 2, base - h, x + w / 2, base, [[0, tone], [0.55, mixCol(tone, '#C9BBA2', 0.25)], [1, mixCol(tone, '#A8977C', 0.5)]]);
  ctx.beginPath();
  ctx.moveTo(x - w / 2, base);
  ctx.quadraticCurveTo(x - w * 0.3, base - h * 0.62, x, base - h);
  ctx.quadraticCurveTo(x + w * 0.3, base - h * 0.62, x + w / 2, base);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  // crystal facets
  const r = rng(Math.round(x) + 3);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 26; i++) {
    const u = r();
    const v = r();
    const yy = base - h * (0.15 + v * 0.8);
    const xx = x + (u - 0.5) * w * (1 - (base - yy) / h) * 0.9;
    const s = 2 + r() * 4;
    ctx.globalAlpha = a * (0.25 + 0.5 * Math.abs(Math.sin(t * 1.4 + i)));
    ctx.fillRect(xx, yy, s, s);
  }
  ctx.globalAlpha = a;
  // ridge line
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, base - h);
  ctx.quadraticCurveTo(x + w * 0.12, base - h * 0.55, x + w * 0.34, base - h * 0.06);
  ctx.stroke();
  if (label) {
    txt(ctx, label, x, base + 44, { size: 26, font: F.mono6, color: 'rgba(251,246,236,0.86)', align: 'center', track: 3 });
  }
  ctx.restore();
}

/** A filled sack, the unit of the trade. */
export function sack(ctx, x, y, w, h, { a = 1, tone = '#D8C9AE', stripe = G.rust } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = radGrad(ctx, x + w / 2, y + h, 3, w * 0.8, [[0, 'rgba(25,18,13,0.4)'], [1, 'rgba(25,18,13,0)']]);
  ctx.fillRect(x - w * 0.3, y + h - 6, w * 1.6, 14);
  const g = linGrad(ctx, x, 0, x + w, 0, [[0, mixCol(tone, '#FFFFFF', 0.25)], [0.6, tone], [1, mixCol(tone, '#4A3B2C', 0.35)]]);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.22, y);
  ctx.quadraticCurveTo(x - w * 0.06, y + h * 0.55, x + w * 0.16, y + h);
  ctx.lineTo(x + w * 0.86, y + h);
  ctx.quadraticCurveTo(x + w * 1.04, y + h * 0.5, x + w * 0.78, y);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  // tie
  ctx.fillStyle = mixCol(tone, '#3A2C20', 0.5);
  ctx.fillRect(x + w * 0.2, y + 2, w * 0.6, 8);
  // printed band
  ctx.fillStyle = hexA(stripe, 0.85);
  ctx.fillRect(x + w * 0.2, y + h * 0.46, w * 0.58, h * 0.12);
  ctx.restore();
}

/* --------------------------------- sea ----------------------------------- */

/** Bulk carrier: long deck, four cranes, hatches, bridge aft. Faces left. */
export function ship(ctx, x, y, s = 1, { a = 1, t = 0, tone = '#1B2A30' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  // hull
  const g = linGrad(ctx, 0, -190, 0, 0, [[0, mixCol(tone, '#FFFFFF', 0.18)], [1, tone]]);
  ctx.beginPath();
  ctx.moveTo(-470, 0);
  ctx.lineTo(-430, -128);
  ctx.lineTo(430, -128);
  ctx.lineTo(470, -22);
  ctx.quadraticCurveTo(430, -2, 380, 0);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  // boot topping
  ctx.fillStyle = hexA(G.rust, 0.9);
  ctx.fillRect(-452, -46, 900, 22);
  // deck
  ctx.fillStyle = '#2C3D42';
  ctx.fillRect(-430, -150, 860, 24);
  // hatches
  ctx.fillStyle = '#22343A';
  for (let i = 0; i < 5; i++) ctx.fillRect(-330 + i * 130, -196, 96, 48);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let i = 0; i < 5; i++) ctx.fillRect(-330 + i * 130, -196, 96, 6);
  // cranes
  ctx.strokeStyle = '#3E545A';
  ctx.lineWidth = 9;
  for (let i = 0; i < 4; i++) {
    const cx = -260 + i * 150;
    ctx.beginPath();
    ctx.moveTo(cx, -196);
    ctx.lineTo(cx, -330);
    ctx.lineTo(cx + 96, -352);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 96, -352);
    ctx.lineTo(cx + 96, -272);
    ctx.stroke();
  }
  // bridge / accommodation at the stern
  ctx.fillStyle = '#D9D2C4';
  ctx.fillRect(300, -300, 120, 150);
  ctx.fillStyle = '#B9B1A2';
  ctx.fillRect(300, -300, 120, 16);
  ctx.fillStyle = '#2A3B40';
  for (let i = 0; i < 3; i++) ctx.fillRect(312, -282 + i * 34, 96, 14);
  // funnel
  ctx.fillStyle = G.rust;
  ctx.fillRect(352, -352, 40, 56);
  // bow wave
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(-470, -6, 120, 7);
  ctx.fillStyle = hexA('#EAF6F4', 0.28 + 0.08 * Math.sin(t * 2.4));
  ctx.fillRect(-470, 0, 900, 6);
  ctx.restore();
}

/* ------------------------------- industry -------------------------------- */

/** Washing plant: brine in, spray, clean salt out. */
export function refinery(ctx, x, y, w, h, { a = 1, t = 0, spray = 0 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  // steel legs down to the plinth
  ctx.fillStyle = '#6E7A74';
  for (const lx of [x + 40, x + w * 0.46, x + w - 60]) ctx.fillRect(lx, y + h - 6, 20, 34);

  // tanks on the roof
  for (let i = 0; i < 3; i++) {
    const tx = x + 46 + i * (w * 0.24);
    const tw = w * 0.16;
    const g2 = linGrad(ctx, tx, 0, tx + tw, 0, [[0, '#D6DCD6'], [0.55, '#AFB8B2'], [1, '#7C8782']]);
    fillRR(ctx, tx, y - h * 0.24, tw, h * 0.26, tw * 0.22, g2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(tx + tw * 0.2, y - h * 0.22, tw * 0.12, h * 0.18);
  }
  // chimney with a thin plume
  ctx.fillStyle = '#8C968F';
  ctx.fillRect(x + w - 54, y - h * 0.5, 26, h * 0.5);
  ctx.fillStyle = hexA('#D8DEDA', 0.28 + 0.06 * Math.sin(t * 0.9));
  for (let i = 0; i < 7; i++) {
    const ph = ((t * 70 + i * 40) % 280) / 280;
    ctx.beginPath();
    ctx.arc(x + w - 41 + Math.sin(ph * 3 + i) * 16, y - h * 0.52 - ph * 190, 16 + ph * 40, 0, Math.PI * 2);
    ctx.globalAlpha = a * (1 - ph) * 0.3;
    ctx.fill();
  }
  ctx.globalAlpha = a;

  // body
  const g = linGrad(ctx, x, y, x, y + h, [[0, '#C2CAC4'], [0.55, '#9EA9A3'], [1, '#77837D']]);
  fillRR(ctx, x, y, w, h, 16, g);
  ctx.strokeStyle = 'rgba(24,18,14,0.35)';
  ctx.lineWidth = 3;
  strokeRR(ctx, x, y, w, h, 16, 'rgba(24,18,14,0.35)', 3);
  // panel seams
  ctx.strokeStyle = 'rgba(24,18,14,0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.34);
  ctx.lineTo(x + w, y + h * 0.34);
  ctx.moveTo(x, y + h * 0.66);
  ctx.lineTo(x + w, y + h * 0.66);
  ctx.stroke();

  // window band
  ctx.fillStyle = hexA(G.pondDeep, 0.9);
  fillRR(ctx, x + 26, y + 34, w - 52, h * 0.24, 8, ctx.fillStyle);
  ctx.fillStyle = hexA('#D7F0EA', 0.4);
  for (let i = 0; i < 6; i++) ctx.fillRect(x + 44 + i * ((w - 88) / 6), y + 44, (w - 88) / 12, h * 0.17);
  // dials
  for (let i = 0; i < 3; i++) {
    const cx = x + 60 + i * 70;
    const cy = y + h * 0.5;
    ctx.fillStyle = 'rgba(24,18,14,0.55)';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(-1.1 + i * 0.7 + Math.sin(t * 0.8) * 0.2) * 15, cy + Math.sin(-1.1 + i * 0.7) * 15);
    ctx.stroke();
  }

  // spray manifold under the belt
  ctx.fillStyle = '#5C6660';
  ctx.fillRect(x + 20, y + h * 0.72, w - 40, 9);
  if (spray > 0) {
    const r = rng(44);
    ctx.fillStyle = hexA('#CFEDE8', 0.75);
    for (let i = 0; i < 70; i++) {
      const px = x + 24 + r() * (w - 48);
      const ph = ((t * 300 + r() * 320) % 210) / 210;
      if (ph > spray) continue;
      ctx.globalAlpha = a * (1 - ph) * 0.85;
      ctx.fillRect(px, y + h * 0.74 + ph * h * 0.24, 3, 14);
    }
    ctx.globalAlpha = a;
  }

  // belt in, with a roller line
  ctx.save();
  ctx.translate(x - 30, y + h * 0.78);
  ctx.rotate(-0.30);
  ctx.fillStyle = '#4A524C';
  ctx.fillRect(-150, -14, 200, 28);
  ctx.fillStyle = 'rgba(233,226,214,0.85)';
  ctx.fillRect(-150, -14, 200, 9);
  ctx.fillStyle = 'rgba(24,18,14,0.25)';
  for (let i = -140; i < 40; i += 26) ctx.fillRect(i, -14, 5, 28);
  ctx.restore();

  // hopper where the dirty salt drops in
  ctx.fillStyle = '#6E7A74';
  ctx.beginPath();
  ctx.moveTo(x - 6, y + h * 0.28);
  ctx.lineTo(x + 96, y + h * 0.28);
  ctx.lineTo(x + 64, y + h * 0.46);
  ctx.lineTo(x + 24, y + h * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Horizontal purity ruler with threshold markers. */
export function gauge(ctx, x, y, w, { a = 1, t = 0, from = '$', to = '$' } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(20,15,12,0.16)';
  ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = 'rgba(20,15,12,0.5)';
  for (let v = 80; v <= 100; v += 5) {
    const px = x + ((v - 80) / 20) * w;
    ctx.fillRect(px, y - 8, 2, 20);
    txt(ctx, String(v), px, y + 44, { size: 20, font: F.mono6, color: 'rgba(20,15,12,0.55)', align: 'center' });
  }
  ctx.restore();
}
