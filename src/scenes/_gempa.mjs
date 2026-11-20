// Episode 32 kit — "gempa": full-frame geophysics worlds.
// Everything is drawn: space + starfield, the Sunda megathrust map, rupture
// fronts, seismograms, the length-of-day dial, pole shift, the spinning
// skater, rank bars, sea cross-sections, buoys. No image assets, no 3D.
import {
  cue, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline,
  sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, W, H,
} from './_cyano.mjs';
import { globe } from './_earth.mjs';

export const GP = {
  space: '#050d15', deep: '#081a27', ocean: '#0d3a52', ocean2: '#17607c',
  shelf: '#2a8ba3', bone: '#F3EFE4', amber: '#FFBC42', red: '#E4572E',
  slip: '#FF6B4A', teal: '#6FD3E0', ink: '#06141d',
};
const dim = (a) => `rgba(243,239,228,${a})`;

/* ---------- atmosphere ---------- */

export function space(ctx, t, seed = 7) {
  const b = bake('gp-space', W, H, (c) => {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#03080e');
    g.addColorStop(0.5, GP.space);
    g.addColorStop(1, GP.deep);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // a faint milky band, diagonal
    c.save();
    c.translate(W * 0.5, H * 0.34);
    c.rotate(-0.32);
    const mg = c.createLinearGradient(0, -260, 0, 260);
    mg.addColorStop(0, 'rgba(120,150,190,0)');
    mg.addColorStop(0.5, 'rgba(140,170,210,0.055)');
    mg.addColorStop(1, 'rgba(120,150,190,0)');
    c.fillStyle = mg;
    c.fillRect(-W, -260, W * 2, 520);
    c.restore();
    const r = rng(seed);
    for (let i = 0; i < 260; i++) {
      const x = r() * W, y = r() * H, s = r() < 0.86 ? 1 : 2;
      c.fillStyle = `rgba(255,255,255,${0.10 + r() * 0.5})`;
      c.fillRect(x, y, s, s);
    }
    for (let i = 0; i < 10; i++) {
      const x = r() * W, y = r() * H;
      const gg = c.createRadialGradient(x, y, 0, x, y, 13);
      gg.addColorStop(0, 'rgba(255,244,214,0.30)');
      gg.addColorStop(1, 'rgba(255,244,214,0)');
      c.fillStyle = gg;
      c.fillRect(x - 13, y - 13, 26, 26);
    }
  });
  ctx.drawImage(b, 0, 0);
  const r = rng(seed + 3);
  for (let i = 0; i < 22; i++) {
    const x = r() * W, y = r() * H, ph = r() * TAU, s = 1 + r();
    const a = Math.max(0, 0.2 + 0.4 * Math.sin(t * 1.6 + ph));
    ctx.fillStyle = `rgba(255,255,255,${a * 0.55})`;
    ctx.fillRect(x, y, s, s);
  }
}

/** a baked globe still: the sphere pixel-loop is too heavy per frame at
 *  90 fps, and over a 10-16 s scene its rotation is imperceptible anyway. */
export function earthStill(key, cx, cy, r, opts = {}) {
  const pad = 10;
  const b = bake(key, (r + pad) * 2, (r + pad) * 2, (c) => {
    globe(c, r + pad, r + pad, r, opts);
  });
  return { img: b, x: cx - r - pad, y: cy - r - pad };
}

export function vign(ctx, a = 0.46) {
  const g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.30, W / 2, H * 0.5, H * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function motes(ctx, t, seed = 11, n = 34, col = '255,196,120') {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, sp = 6 + r() * 16, ph = r() * TAU, s = 1 + r() * 2.2;
    const x = (x0 + Math.sin(t * 0.22 + ph) * 26 + W) % W;
    const y = (y0 - t * sp + H * 2) % H;
    const a = 0.035 + 0.065 * (0.5 + 0.5 * Math.sin(t * 0.9 + ph * 2));
    ctx.fillStyle = `rgba(${col},${a})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }
}

/* ---------- the Sunda megathrust map ---------- */
// stylised 0..1 chart space (x east, y south): Sumatra blade, Andaman chain,
// the trench arc, the epicentre star.
export const GEO = {
  sumatra: [
    [0.52, 0.99], [0.56, 0.88], [0.62, 0.76], [0.69, 0.64], [0.76, 0.54],
    [0.82, 0.46], [0.86, 0.40], [0.83, 0.37], [0.76, 0.43], [0.68, 0.51],
    [0.60, 0.61], [0.52, 0.72], [0.46, 0.84], [0.43, 0.95],
  ],
  andaman: [[0.50, 0.30], [0.53, 0.24], [0.56, 0.18], [0.58, 0.12], [0.60, 0.06]],
  trench: [
    [0.34, 0.99], [0.40, 0.87], [0.46, 0.73], [0.53, 0.59], [0.60, 0.47],
    [0.62, 0.37], [0.58, 0.27], [0.52, 0.17], [0.48, 0.07],
  ],
  epic: [0.60, 0.60],
};
export const geoPts = (arr, x0, y0, w, h) => arr.map(([u, v]) => [x0 + u * w, y0 + v * h]);

export function mapBase(ctx, x0, y0, w, h, o = {}) {
  const { grid = 1, land = 1 } = o;
  const g = ctx.createLinearGradient(x0, y0, x0 + w, y0 + h);
  g.addColorStop(0, '#0a2a3d');
  g.addColorStop(0.6, GP.ocean);
  g.addColorStop(1, '#0b3145');
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, w, h);
  if (grid) {
    ctx.strokeStyle = dim(0.07);
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath(); ctx.moveTo(x0 + (w / 8) * i, y0); ctx.lineTo(x0 + (w / 8) * i, y0 + h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0, y0 + (h / 8) * i); ctx.lineTo(x0 + w, y0 + (h / 8) * i); ctx.stroke();
    }
  }
  if (land) {
    const sp = geoPts(GEO.sumatra, x0, y0, w, h);
    ctx.save();
    ctx.fillStyle = 'rgba(233,226,206,0.16)';
    ctx.strokeStyle = 'rgba(243,239,228,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    sp.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(243,239,228,0.42)';
    for (const [u, v] of GEO.andaman) {
      ctx.beginPath();
      ctx.arc(x0 + u * w, y0 + v * h, 5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  // the trench: dashed teal arc
  const tr = sampleSpline(geoPts(GEO.trench, x0, y0, w, h), { step: 8 });
  ctx.save();
  ctx.strokeStyle = 'rgba(111,211,224,0.5)';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  tr.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
  // frame
  ctx.strokeStyle = dim(0.22);
  ctx.lineWidth = 2;
  ctx.strokeRect(x0, y0, w, h);
}

export function rupture(ctx, p, x0, y0, w, h, o = {}) {
  if (p <= 0.001) return;
  const tr = sampleSpline(geoPts(GEO.trench, x0, y0, w, h), { step: 6 });
  const n = Math.max(2, Math.floor(tr.length * clamp(p)));
  const pts = tr.slice(0, n);
  ctx.save();
  ctx.shadowColor = 'rgba(255,107,74,0.8)';
  ctx.shadowBlur = 26;
  ctx.strokeStyle = GP.slip;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
  const [fx, fy] = pts[pts.length - 1];
  // uplift arrows along the drawn part
  ctx.strokeStyle = dim(0.75);
  ctx.fillStyle = dim(0.75);
  ctx.lineWidth = 3;
  for (let i = 8; i < pts.length - 4; i += 14) {
    const [x, y] = pts[i];
    const dx = pts[i + 1][0] - x, dy = pts[i + 1][1] - y;
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const bx = x + nx * 26, by = y + ny * 26;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + nx * 22, by + ny * 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + nx * 30, by + ny * 30);
    ctx.lineTo(bx + nx * 20 - (dx / L) * 6, by + ny * 20 - (dy / L) * 6);
    ctx.lineTo(bx + nx * 20 + (dx / L) * 6, by + ny * 20 + (dy / L) * 6);
    ctx.closePath();
    ctx.fill();
  }
  quakeRings(ctx, fx, fy, 0, o.ringT ?? 0.9, 3);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(fx, fy, 7, 0, TAU);
  ctx.fill();
}

export function quakeRings(ctx, x, y, t0, t, n = 3, col = GP.slip) {
  for (let i = 0; i < n; i++) {
    const r = (t - t0) * 240 - i * 46;
    if (r <= 4) continue;
    const a = clamp(1 - r / 420) * 0.5;
    ctx.strokeStyle = col;
    ctx.globalAlpha *= 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

export function epicStar(ctx, x, y, s, a = 1) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = GP.amber;
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) {
    const an = (i / 4) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(an) * s, y - Math.sin(an) * s);
    ctx.lineTo(x + Math.cos(an) * s, y + Math.sin(an) * s);
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------- instruments ---------- */

export function seismo(ctx, x, y, w, h, p, o = {}) {
  const { color = GP.bone, burst = 0.22 } = o;
  if (p <= 0.001) return;
  const n = Math.floor(240 * clamp(p));
  const pts = [];
  const r = rng(41);
  for (let i = 0; i <= n; i++) {
    const u = i / 240;
    let amp = 0.06;
    if (u > burst) amp = 0.06 + 0.94 * Math.exp(-(u - burst) * 3.4);
    const wob = Math.sin(u * 210) * 0.6 + Math.sin(u * 87 + 1.7) * 0.4 + (r() - 0.5) * 0.5;
    pts.push([x + u * w, y + wob * amp * h * 0.5]);
  }
  ctx.save();
  ctx.strokeStyle = dim(0.18);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
  const [hx, hy] = pts[pts.length - 1];
  ctx.fillStyle = GP.amber;
  ctx.beginPath();
  ctx.arc(hx, hy, 6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function clockDial(ctx, cx, cy, r, p, o = {}) {
  const { wedge = 0, hand = 0 } = o;
  ctx.save();
  ctx.strokeStyle = dim(0.8);
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const an = (i / 24) * TAU - Math.PI / 2;
    const long = i % 6 === 0;
    ctx.strokeStyle = long ? dim(0.9) : dim(0.4);
    ctx.lineWidth = long ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * (r - (long ? 26 : 14)), cy + Math.sin(an) * (r - (long ? 26 : 14)));
    ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r);
    ctx.stroke();
  }
  if (wedge > 0) {
    ctx.fillStyle = 'rgba(255,188,66,0.85)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r - 8, -Math.PI / 2, -Math.PI / 2 + wedge);
    ctx.closePath();
    ctx.fill();
  }
  const an = -Math.PI / 2 + hand * TAU;
  ctx.strokeStyle = GP.amber;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(an) * (r - 44), cy + Math.sin(an) * (r - 44));
  ctx.stroke();
  ctx.fillStyle = GP.bone;
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, TAU); ctx.fill();
  ctx.restore();
}

export function poleGrid(ctx, cx, cy, r, p, o = {}) {
  const ex = o.ex ?? r * 0.34, ey = o.ey ?? r * 0.2;
  ctx.save();
  ctx.strokeStyle = dim(0.28);
  ctx.lineWidth = 2;
  for (const rr of [r, r * 0.66, r * 0.33]) {
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const an = (i / 12) * TAU;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * r * 0.33, cy + Math.sin(an) * r * 0.33);
    ctx.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r);
    ctx.stroke();
  }
  // old pole
  ctx.strokeStyle = dim(0.85);
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx - 16, cy - 16); ctx.lineTo(cx + 16, cy + 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 16, cy - 16); ctx.lineTo(cx - 16, cy + 16); ctx.stroke();
  // trail + new pole
  const q = eo(clamp(p));
  const nx = cx + ex * q, ny = cy + ey * q;
  ctx.strokeStyle = GP.amber;
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(nx - 16, ny - 16); ctx.lineTo(nx + 16, ny + 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(nx + 16, ny - 16); ctx.lineTo(nx - 16, ny + 16); ctx.stroke();
  ctx.restore();
}

export function skater(ctx, cx, cy, s, p, t) {
  const spin = t * (1.5 + 3.2 * eo(clamp(p)));
  ctx.save();
  ctx.translate(cx, cy);
  // spin arcs
  ctx.strokeStyle = 'rgba(255,188,66,0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, s * (0.92 + i * 0.14), spin * (i ? -1 : 1) + i, spin * (i ? -1 : 1) + i + 1.5);
    ctx.stroke();
  }
  ctx.rotate(Math.sin(spin) * 0.06);
  const arm = lerp(1.25, 0.16, eo(clamp(p)));
  ctx.strokeStyle = GP.bone;
  ctx.fillStyle = GP.bone;
  ctx.lineWidth = Math.max(6, s * 0.075);
  ctx.lineCap = 'round';
  // head
  ctx.beginPath(); ctx.arc(0, -s * 0.62, s * 0.11, 0, TAU); ctx.fill();
  // torso
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.quadraticCurveTo(s * 0.06, -s * 0.2, 0, s * 0.06);
  ctx.stroke();
  // arms: wide glide out -> crossed at the chest
  const q2 = eo(clamp(p));
  for (const sg of [-1, 1]) {
    const hx = sg * lerp(0.58, 0.12, q2) * s;
    const hy = lerp(-0.26, -0.46, q2) * s;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.42);
    ctx.quadraticCurveTo(sg * lerp(0.34, 0.16, q2) * s, -s * 0.34, hx, hy);
    ctx.stroke();
  }
  // skirt + legs
  ctx.beginPath();
  ctx.moveTo(0, s * 0.02);
  ctx.quadraticCurveTo(-s * 0.26, s * 0.2, -s * 0.2, s * 0.3);
  ctx.lineTo(s * 0.2, s * 0.3);
  ctx.quadraticCurveTo(s * 0.26, s * 0.2, 0, s * 0.02);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.06, s * 0.3);
  ctx.lineTo(-s * 0.1, s * 0.66);
  ctx.moveTo(s * 0.08, s * 0.3);
  ctx.lineTo(s * 0.16, s * 0.62);
  ctx.stroke();
  // blade
  ctx.lineWidth = Math.max(4, s * 0.05);
  ctx.beginPath();
  ctx.moveTo(-s * 0.22, s * 0.7);
  ctx.lineTo(s * 0.02, s * 0.7);
  ctx.stroke();
  ctx.restore();
}

export function rankBars(ctx, x, y, w, rows, p, o = {}) {
  const bh = o.bh ?? 74, gap = o.gap ?? 46, max = o.max ?? 9.6;
  rows.forEach((r, i) => {
    const pi = eo(clamp((p - i * 0.22) / 0.5));
    const bw = (r.val / max) * w * pi;
    const by = y + i * (bh + gap);
    ctx.fillStyle = r.hot ? 'rgba(255,188,66,0.9)' : 'rgba(243,239,228,0.30)';
    ctx.fillRect(x, by, bw, bh);
    ctx.strokeStyle = r.hot ? GP.amber : dim(0.6);
    ctx.lineWidth = 3;
    ctx.strokeRect(x, by, (r.val / max) * w, bh);
    label(ctx, r.label, x, by - 14, { size: 30, color: r.hot ? GP.amber : dim(0.85), track: 3 });
    if (pi > 0.6) {
      label(ctx, r.val.toFixed(1), x + (r.val / max) * w + 26, by + bh / 2 + 11, {
        size: 46, color: r.hot ? GP.amber : dim(0.9), track: 2,
      });
    }
  });
}

export function seaSection(ctx, x0, y0, w, h, o = {}) {
  const { up = 0, bulge = 0, t = 0, wave = 0 } = o;
  const seaTop = y0 + h * 0.30;
  const floor = y0 + h * 0.82;
  const g = ctx.createLinearGradient(0, seaTop, 0, y0 + h);
  g.addColorStop(0, GP.ocean2);
  g.addColorStop(0.5, GP.ocean);
  g.addColorStop(1, '#07202e');
  ctx.fillStyle = g;
  ctx.fillRect(x0, seaTop, w, h - (seaTop - y0));
  // sky
  const sg = ctx.createLinearGradient(0, y0, 0, seaTop);
  sg.addColorStop(0, '#0a1a26');
  sg.addColorStop(1, '#123c50');
  ctx.fillStyle = sg;
  ctx.fillRect(x0, y0, w, seaTop - y0);
  // seafloor with the uplift step
  const upPx = up * h * 0.10;
  ctx.fillStyle = '#132a33';
  ctx.beginPath();
  ctx.moveTo(x0, y0 + h);
  ctx.lineTo(x0, floor);
  ctx.lineTo(x0 + w * 0.30, floor);
  ctx.lineTo(x0 + w * 0.34, floor - upPx);
  ctx.lineTo(x0 + w * 0.66, floor - upPx);
  ctx.lineTo(x0 + w * 0.70, floor);
  ctx.lineTo(x0 + w, floor);
  ctx.lineTo(x0 + w, y0 + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(243,239,228,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, floor);
  ctx.lineTo(x0 + w * 0.30, floor);
  ctx.lineTo(x0 + w * 0.34, floor - upPx);
  ctx.lineTo(x0 + w * 0.66, floor - upPx);
  ctx.lineTo(x0 + w * 0.70, floor);
  ctx.lineTo(x0 + w, floor);
  ctx.stroke();
  // water surface: the bulge that becomes the tsunami
  ctx.strokeStyle = GP.teal;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const x = x0 + u * w;
    const c = Math.exp(-Math.pow((u - 0.5) / 0.16, 2));
    const run = wave > 0 ? Math.exp(-Math.pow((Math.abs(u - 0.5) - wave * 0.5) / 0.10, 2)) : 0;
    const y = seaTop - bulge * h * 0.06 * c - run * h * 0.05 + Math.sin(u * 40 + t * 2) * 2;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  // uplift arrows
  if (up > 0.05) {
    ctx.strokeStyle = dim(0.8);
    ctx.fillStyle = dim(0.8);
    ctx.lineWidth = 4;
    for (const u of [0.42, 0.5, 0.58]) {
      const x = x0 + u * w;
      ctx.beginPath();
      ctx.moveTo(x, floor - upPx - 26);
      ctx.lineTo(x, floor - upPx - 92);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, floor - upPx - 108);
      ctx.lineTo(x - 9, floor - upPx - 88);
      ctx.lineTo(x + 9, floor - upPx - 88);
      ctx.closePath();
      ctx.fill();
    }
  }
  return { seaTop, floor };
}

export function buoy(ctx, x, y, s, t, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(111,211,224,0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const r = ((t * 90 + i * 60) % 180) * (s / 40);
    const a = clamp(1 - r / (180 * (s / 40))) * 0.5;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(0, -s * 0.5, r, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = GP.amber;
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, 0);
  ctx.lineTo(s * 0.5, 0);
  ctx.lineTo(s * 0.32, s * 0.42);
  ctx.lineTo(-s * 0.32, s * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = GP.bone;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -s * 0.62);
  ctx.stroke();
  const fl = 0.5 + 0.5 * Math.sin(t * 4);
  ctx.fillStyle = `rgba(255,90,60,${0.35 + 0.65 * fl})`;
  ctx.beginPath();
  ctx.arc(0, -s * 0.7, s * 0.12, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function chip(ctx, s, x, y, o = {}) {
  const { color = GP.amber, a = 1, size = 30 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  const w = textW(ctx, s, size, F.mono6, 3) + 44;
  ctx.fillStyle = 'rgba(6,20,29,0.72)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y - size - 12, w, size + 30, 8);
  ctx.fill();
  ctx.stroke();
  label(ctx, s, x + 22, y + 4, { size, color, track: 3 });
  ctx.restore();
}

export { cue, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, W, H, globe };
