/**
 * Episode 10 art kit — "Semesta · Lubang Hitam".
 *
 * Nothing here is an asset: a star field that twinkles, a star with a real
 * corona and granulation, a black hole with a photon ring and a lensed halo, a
 * planet with continents, a terminator and atmosphere, orbit paths, and a
 * frozen sea. Scenes compose these and animate them.
 */
import { W, H, txt, hexA, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
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

/* ------------------------------- star field ------------------------------- */

export function starfield(ctx, {
  n = 240, seed = 7, t = 0, a = 1, top = -80, bottom = H + 80,
  band = 0, bandY = 780, bandH = 560,
} = {}) {
  if (a <= 0.01) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  if (band > 0) {
    const g = linGrad(ctx, 0, bandY - bandH / 2, 0, bandY + bandH / 2, [
      [0, 'rgba(90,120,190,0)'],
      [0.42, `rgba(120,150,210,${0.10 * band})`],
      [0.56, `rgba(160,175,225,${0.13 * band})`],
      [1, 'rgba(90,120,190,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(-120, bandY - bandH / 2, W + 240, bandH);
  }
  for (let i = 0; i < n; i++) {
    const x = r() * (W + 200) - 100;
    const y = top + r() * (bottom - top);
    const q = r();
    const tw = 0.5 + 0.5 * Math.sin(t * (0.7 + q * 2.4) + i * 1.73);
    const size = q > 0.972 ? 3.6 : q > 0.9 ? 2.2 : q > 0.62 ? 1.5 : 1.0;
    ctx.globalAlpha = a * (0.2 + 0.8 * q) * (0.55 + 0.45 * tw);
    ctx.fillStyle = q > 0.93 ? '#D9E8FF' : '#FFF6E2';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.fill();
    if (q > 0.985) {
      ctx.globalAlpha = a * 0.35 * tw;
      ctx.strokeStyle = '#DCE9FF';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x - size * 4, y);
      ctx.lineTo(x + size * 4, y);
      ctx.moveTo(x, y - size * 4);
      ctx.lineTo(x, y + size * 4);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ---------------------------------- star ---------------------------------- */

export function sunDisc(ctx, x, y, r, { a = 1, t = 0, rays = 1, tone = 1, color = S.sun } = {}) {
  if (a <= 0.01 || r <= 0.5) return;
  const r0 = rng(31);
  ctx.save();
  ctx.globalAlpha *= a;

  const halo = radGrad(ctx, x, y, r * 0.8, r * 3.6, [
    [0, `rgba(255,196,110,${0.30 * tone})`],
    [0.35, `rgba(255,150,74,${0.12 * tone})`],
    [1, 'rgba(255,140,60,0)'],
  ]);
  ctx.fillStyle = halo;
  ctx.fillRect(x - r * 3.7, y - r * 3.7, r * 7.4, r * 7.4);

  if (rays > 0) {
    for (let i = 0; i < 84; i++) {
      const ang = (i / 84) * TAU + t * 0.045;
      const wob = 0.5 + 0.5 * Math.sin(i * 2.37 + t * 0.6);
      const len = r * (1.14 + 0.55 * wob + 0.5 * (i % 3 === 0 ? 1 : 0));
      ctx.globalAlpha = a * rays * (0.045 + 0.075 * wob) * tone;
      ctx.strokeStyle = '#FFC078';
      ctx.lineWidth = 1.5 + wob * 2.6;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ang) * r * 1.02, y + Math.sin(ang) * r * 1.02);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = a;
  const g = radGrad(ctx, x - r * 0.18, y - r * 0.2, r * 0.05, r * 1.02, [
    [0, '#FFFDF4'],
    [0.42, '#FFE9AE'],
    [0.78, '#FFB347'],
    [1, '#F1711F'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.97, 0, TAU);
  ctx.clip();
  for (let i = 0; i < 240; i++) {
    const ang = r0() * TAU;
    const d = Math.sqrt(r0()) * r * 0.95;
    const s = r * (0.02 + r0() * 0.06);
    ctx.globalAlpha = a * (0.03 + r0() * 0.05);
    ctx.fillStyle = r0() > 0.5 ? '#FFD79A' : '#E8832E';
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(ang) * d, y + Math.sin(ang) * d, s, s * 0.8, ang, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  ctx.globalAlpha = a * 0.55;
  ctx.strokeStyle = '#FFE7BC';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.985, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------- black hole ------------------------------- */

export function bhDisc(ctx, x, y, r, {
  a = 1, t = 0, glow = 1, ring = 1, hot = 0, tone = 1,
} = {}) {
  if (a <= 0.01 || r <= 0.2) return;
  const R = Math.max(r, 1);
  ctx.save();
  ctx.globalAlpha *= a;

  if (glow > 0) {
    const g = radGrad(ctx, x, y, R * 0.95, R * (2.4 + hot * 2.6), [
      [0, `rgba(${hot > 0.4 ? '255,150,90' : '150,190,255'},${(0.16 + hot * 0.5) * glow * tone})`],
      [0.4, `rgba(${hot > 0.4 ? '255,120,60' : '120,170,255'},${(0.06 + hot * 0.26) * glow * tone})`],
      [1, 'rgba(120,160,240,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(x - R * 5.2, y - R * 5.2, R * 10.4, R * 10.4);
  }

  if (hot > 0) {
    for (let k = 0; k < 2; k++) {
      const ry = R * (0.42 + k * 0.34);
      ctx.globalAlpha = a * (0.55 - k * 0.2) * hot;
      ctx.strokeStyle = k === 0 ? '#FFE0A8' : '#FF8A3C';
      ctx.lineWidth = 10 - k * 4;
      ctx.beginPath();
      ctx.ellipse(x, y - R * (0.02 + k * 0.05), R * (1.18 + k * 0.14), ry, 0, Math.PI * 1.02, Math.PI * 1.98);
      ctx.stroke();
      ctx.globalAlpha = a * (0.5 - k * 0.18) * hot;
      ctx.beginPath();
      ctx.ellipse(x, y + R * (0.02 + k * 0.05), R * (1.16 + k * 0.13), ry * 0.85, 0, Math.PI * 0.03, Math.PI * 0.97);
      ctx.stroke();
    }
  }

  if (ring > 0) {
    const flick = 0.78 + 0.22 * Math.sin(t * 2.1);
    ctx.globalAlpha = a * ring * flick;
    ctx.strokeStyle = hot > 0.4 ? '#FFE3B0' : '#E8D8A8';
    ctx.lineWidth = Math.max(1.6, R * 0.05);
    ctx.shadowColor = 'rgba(255,200,120,0.85)';
    ctx.shadowBlur = Math.min(46, R * 1.4);
    ctx.beginPath();
    ctx.arc(x, y, R * 1.03, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 5; i++) {
      const p0 = (t * 0.22 + i * 0.21) % 1;
      const a0 = p0 * TAU;
      ctx.globalAlpha = a * ring * 0.5 * (0.5 + 0.5 * Math.sin(t * 1.7 + i));
      ctx.strokeStyle = '#FFF4D6';
      ctx.lineWidth = Math.max(1.4, R * 0.045);
      ctx.beginPath();
      ctx.arc(x, y, R * 1.03, a0, a0 + 0.22);
      ctx.stroke();
    }
    ctx.globalAlpha = a;
  }

  ctx.globalAlpha = a;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x, y, R * 0.99, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* --------------------------------- planet --------------------------------- */

const blob = (ctx, cx, cy, rx, ry, seed, color, a = 1) => {
  const r = rng(seed);
  const pts = [];
  const n = 11;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * TAU;
    const k = 0.68 + r() * 0.6;
    pts.push([cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k]);
  }
  ctx.globalAlpha = a;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2);
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
  ctx.fill();
};

export function earth(ctx, cx, cy, r, { a = 1, t = 0, spin = 0, light = 'left', ice = 1, clouds = 1, atmo = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  if (atmo > 0) {
    const g = radGrad(ctx, cx, cy, r * 0.98, r * 1.16, [
      [0, 'rgba(150,205,255,0.34)'],
      [0.5, 'rgba(110,170,235,0.14)'],
      [1, 'rgba(90,150,220,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4);
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.clip();

  const lx = light === 'left' ? -0.45 : light === 'right' ? 0.45 : 0;
  const g = radGrad(ctx, cx + lx * r, cy - r * 0.35, r * 0.06, r * 1.5, [
    [0, '#4F93C6'],
    [0.55, '#22608F'],
    [1, '#0A2743'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  const drift = spin * r * 0.5;
  const conts = [
    [-0.42, -0.30, 0.34, 0.20, 3, '#2F6B45'],
    [-0.05, -0.46, 0.30, 0.16, 11, '#37774C'],
    [0.34, -0.18, 0.26, 0.28, 19, '#2C6440'],
    [-0.30, 0.22, 0.32, 0.24, 27, '#3A7248'],
    [0.16, 0.34, 0.30, 0.18, 33, '#2E6540'],
    [0.46, 0.42, 0.16, 0.14, 41, '#356C46'],
    [-0.62, 0.02, 0.14, 0.14, 47, '#3E7A50'],
  ];
  for (const [dx, dy, rx, ry, seed, col] of conts) {
    blob(ctx, cx + dx * r + drift, cy + dy * r, rx * r, ry * r, seed, col, 0.95);
    blob(ctx, cx + dx * r + drift - rx * r * 0.12, cy + dy * r - ry * r * 0.18, rx * r * 0.55, ry * r * 0.5, seed + 1, '#77A468', 0.35);
  }

  if (ice > 0) {
    ctx.globalAlpha = 0.9 * ice;
    ctx.fillStyle = '#EAF6FF';
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.93, r * 0.55, r * 0.2, 0, 0, TAU);
    ctx.ellipse(cx, cy + r * 0.95, r * 0.5, r * 0.17, 0, 0, TAU);
    ctx.fill();
  }

  if (clouds > 0) {
    const rc = rng(77);
    for (let i = 0; i < 16; i++) {
      const ang = rc() * TAU;
      const d = rc() * r * 0.92;
      const w = r * (0.1 + rc() * 0.26);
      ctx.globalAlpha = (0.06 + rc() * 0.12) * clouds;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d * 0.9, w, w * 0.34, ang, 0, TAU);
      ctx.fill();
    }
  }

  const tg = linGrad(
    ctx,
    cx + (light === 'left' ? -r * 0.55 : r * 0.1), cy - r,
    cx + (light === 'left' ? r * 0.75 : r * 1.3), cy + r,
    [
      [0, 'rgba(2,6,14,0)'],
      [0.55, 'rgba(2,6,14,0.42)'],
      [1, 'rgba(1,3,8,0.9)'],
    ],
  );
  ctx.globalAlpha = 1;
  ctx.fillStyle = tg;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.globalAlpha = a * 0.5;
  ctx.strokeStyle = 'rgba(180,220,255,0.5)';
  ctx.lineWidth = Math.max(1.5, r * 0.012);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.995, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** A planet seen from close orbit: a curved horizon, a thin atmosphere, lights. */
export function limb(ctx, cx, cy, r, {
  a = 1, t = 0, glow = 1, lights = 0, dawn = 0, dawnX = 1260,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  const g = radGrad(ctx, cx, cy, r * 0.55, r + 30, [
    [0, '#010306'],
    [0.72, '#05121F'],
    [0.93, '#0A2136'],
    [1, '#123A55'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();

  // warm dawn on the surface, clipped so it never spills into space
  if (dawn > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, TAU);
    ctx.clip();
    const dg = radGrad(ctx, dawnX, cy - r + 170, 10, 470, [
      [0, `rgba(255,206,150,${0.36 * dawn})`],
      [0.5, `rgba(255,178,110,${0.13 * dawn})`],
      [1, 'rgba(255,170,100,0)'],
    ]);
    ctx.fillStyle = dg;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  // the atmosphere: a bright line and the haze that hangs above it
  if (glow > 0) {
    const haze = radGrad(ctx, cx, cy, r - 24, r + 110, [
      [0, 'rgba(120,190,255,0)'],
      [0.5, `rgba(130,200,255,${0.26 * glow})`],
      [0.74, `rgba(175,225,255,${0.22 * glow})`],
      [1, 'rgba(120,180,240,0)'],
    ]);
    ctx.fillStyle = haze;
    ctx.fillRect(cx - r - 130, cy - r - 130, (r + 130) * 2, (r + 130) * 2);
    ctx.save();
    ctx.strokeStyle = `rgba(178,228,255,${0.8 * glow})`;
    ctx.lineWidth = 4.5;
    ctx.shadowColor = 'rgba(120,200,255,0.9)';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 1, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // cities on the night side
  if (lights > 0) {
    const rl = rng(303);
    for (let i = 0; i < 80; i++) {
      const ang = -Math.PI * 0.95 + rl() * Math.PI * 0.9;
      const rr = r - 8 - rl() * r * 0.22;
      const x = cx + Math.cos(ang) * rr;
      const y = cy + Math.sin(ang) * rr;
      const tw = 0.4 + 0.6 * Math.sin(t * (1.1 + rl() * 1.7) + i * 2.1);
      ctx.globalAlpha = a * lights * 0.62 * tw;
      ctx.fillStyle = rl() > 0.76 ? '#FFE7B4' : '#FFB765';
      ctx.beginPath();
      ctx.arc(x, y, 2 + rl() * 3.2, 0, TAU);
      ctx.fill();
      if (rl() > 0.88) {
        const cg = radGrad(ctx, x, y, 1, 24, [[0, 'rgba(255,190,110,0.75)'], [1, 'rgba(255,170,90,0)']]);
        ctx.globalAlpha = a * lights * 0.18 * tw;
        ctx.fillStyle = cg;
        ctx.fillRect(x - 24, y - 24, 48, 48);
      }
    }
  }
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
  const n = 180;
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

/* -------------------------------- ice sea --------------------------------- */

export function iceSea(ctx, y0, { t = 0, h = H - y0 + 120, seed = 5, a = 1 } = {}) {
  if (a <= 0.01) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;

  const g = linGrad(ctx, 0, y0, 0, y0 + h, [
    [0, '#5E7F91'],
    [0.22, '#7FA1B0'],
    [0.55, '#A9C6D1'],
    [1, '#C3DAE2'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(-240, y0, W + 480, h);

  const hz = linGrad(ctx, 0, y0 - 60, 0, y0 + 90, [
    [0, 'rgba(12,24,34,0)'],
    [0.5, 'rgba(12,24,34,0.55)'],
    [1, 'rgba(12,24,34,0)'],
  ]);
  ctx.fillStyle = hz;
  ctx.fillRect(-240, y0 - 60, W + 480, 150);

  // low pressure ridges along the horizon
  for (let i = 0; i < 26; i++) {
    const x = -80 + r() * (W + 160);
    const y = y0 + 10 + r() * 54;
    const w = 40 + r() * 120;
    const hh = 4 + r() * 9;
    ctx.globalAlpha = a * (0.12 + r() * 0.16);
    ctx.fillStyle = '#DCEBF2';
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x - w * 0.18, y - hh);
    ctx.lineTo(x + w * 0.12, y - hh * 0.7);
    ctx.lineTo(x + w / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = a * (0.1 + r() * 0.12);
    ctx.fillStyle = '#4C6E80';
    ctx.fillRect(x - w * 0.1, y - 1.5, w * 0.5, 2.5);
  }

  // cracks
  for (let i = 0; i < 16; i++) {
    let x = -60 + r() * (W + 120);
    let y = y0 + 40 + r() * (h - 60);
    const seg = 5 + Math.floor(r() * 5);
    ctx.globalAlpha = a * (0.22 + r() * 0.3);
    ctx.strokeStyle = '#3F6072';
    ctx.lineWidth = 1.5 + r() * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < seg; k++) {
      x += (r() - 0.5) * 190;
      y += (r() - 0.35) * 70;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = a * 0.22;
    ctx.strokeStyle = '#F2FBFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < 220; i++) {
    const x = r() * W;
    const y = y0 + 30 + r() * (h - 30);
    const tw = 0.4 + 0.6 * Math.sin(t * 1.3 + i);
    ctx.globalAlpha = a * 0.16 * tw;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, 2.4, 2.4);
  }

  const fg = linGrad(ctx, 0, y0 + h * 0.55, 0, y0 + h, [
    [0, 'rgba(230,244,250,0)'],
    [1, 'rgba(226,241,248,0.35)'],
  ]);
  ctx.globalAlpha = a;
  ctx.fillStyle = fg;
  ctx.fillRect(-240, y0 + h * 0.55, W + 480, h * 0.45);
  ctx.restore();
}

/* --------------------------------- small bits ----------------------------- */

/** Thin technical rule with ticks — the diagram voice of the light scenes. */
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

/** Leader line with an end dot: the "this is the thing" annotation. */
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
