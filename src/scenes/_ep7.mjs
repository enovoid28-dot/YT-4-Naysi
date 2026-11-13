// Drawing kit for "Jakarta Tidak Tenggelam" (episode 7).
// Concrete, water and one yellow tape measure: the city is measured, not
// dramatised.
import { W, H, C, M, txt, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { P, applyGrain, sheet, stamp, tag, paperRoom, nightRoom, darkKicker, paperKicker, glowSpot } from './_ep5.mjs';

export { P, applyGrain, sheet, stamp, tag, paperRoom, nightRoom, darkKicker, paperKicker, glowSpot };
export { sheetContent, dashRR } from './_ep6.mjs';

export const Q = {
  ink: '#141110',
  ink2: '#2A2420',
  paper: '#EFE6D3',
  paper2: '#E2D5BC',
  concrete: '#C2BCAE',
  concrete2: '#9A9487',
  concrete3: '#6E695F',
  water: '#2F6E7C',
  waterHi: '#4E97A6',
  waterDeep: '#123B45',
  rust: '#B4442A',
  rust2: '#8E3420',
  tape: '#E8B43C',
  tape2: '#B98525',
  sand: '#BFA37C',
};

/* ------------------------------------------------------------ concrete --- */

/** Light concrete backdrop with pours, stains and one damp band. */
export function concreteWall(ctx, o = {}) {
  const { wet = 1100, a = 1 } = o;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = linGrad(ctx, 0, 0, W * 0.3, H, [[0, '#D6D0C2'], [0.45, '#C3BDAF'], [1, '#A9A395']]);
  ctx.fillRect(0, 0, W, H);
  // pour lines
  for (let i = 0; i < 5; i++) {
    const y = 220 + i * 460;
    ctx.fillStyle = 'rgba(120,114,102,0.16)';
    ctx.fillRect(0, y, W, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(0, y + 2, W, 6);
  }
  // vertical formwork seams
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = 'rgba(120,114,102,0.10)';
    ctx.fillRect(280 + i * 440, 0, 3, H);
  }
  // damp band: the wall it has been drinking
  ctx.fillStyle = linGrad(ctx, 0, wet - 120, 0, H, [
    [0, 'rgba(70,84,84,0)'], [0.35, 'rgba(70,84,84,0.18)'], [1, 'rgba(58,70,70,0.30)'],
  ]);
  ctx.fillRect(0, wet - 120, W, H - wet + 120);
  ctx.restore();
}

/** The rust line water leaves on a wall when it has been there. */
export function tideMark(ctx, y, o = {}) {
  const { a = 1, color = Q.rust2, h = 26, label = '' } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = hexA(color, 0.45);
  ctx.fillRect(0, y, W, h);
  ctx.fillStyle = hexA(color, 0.75);
  ctx.fillRect(0, y, W, 3);
  ctx.fillStyle = hexA(color, 0.30);
  for (let i = 0; i < 46; i++) {
    const x = (i * 137) % W;
    const hh = 8 + ((i * 31) % 42);
    ctx.fillRect(x, y + h, 2 + ((i * 7) % 4), hh);
  }
  if (label) {
    txt(ctx, label, 84, y - 22, { size: 22, font: F.mono6, color: hexA(color, 0.9), track: 4 });
  }
  ctx.restore();
}

/* ----------------------------------------------------------- the tape --- */

/** A steel tape pulled out of its case. Hangs downward from (x,y). */
export function tape(ctx, x, y, len, o = {}) {
  const { a = 1, max = 250, w = 58, showCase = 1, up = false, labelEvery = 50, lit = 1 } = o;
  const L = len;
  const top = up ? y - L : y;
  ctx.save();
  ctx.globalAlpha *= a;

  // blade
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.32)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetX = 9;
  ctx.fillStyle = linGrad(ctx, x - w / 2, 0, x + w / 2, 0, [
    [0, '#F7D482'], [0.34, Q.tape], [0.78, '#D49B2C'], [1, '#A2721F'],
  ]);
  ctx.fillRect(x - w / 2, top, w, L);
  ctx.restore();
  // inner shade so it curves
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x - w / 2 + 4, top, w * 0.16, L);
  ctx.fillStyle = 'rgba(80,50,0,0.16)';
  ctx.fillRect(x + w / 2 - w * 0.2, top, w * 0.2, L);

  const pxPerCm = L / max;
  for (let c = 0; c <= max; c += 1) {
    const big = c % labelEvery === 0;
    const mid = c % 10 === 0;
    const small = c % 5 === 0;
    if (!small && !big) continue;
    const yy = up ? y - c * pxPerCm : y + c * pxPerCm;
    ctx.fillStyle = big ? 'rgba(20,17,16,0.9)' : mid ? 'rgba(20,17,16,0.55)' : 'rgba(20,17,16,0.3)';
    const tw = big ? w * 0.66 : mid ? w * 0.44 : w * 0.26;
    ctx.fillRect(x - w / 2 + 2, yy - (big ? 2 : 1), tw, big ? 3 : 1.6);
    if (big) {
      txt(ctx, String(c), x + w * 0.30, yy + 9, {
        size: 19 * lit, font: F.mono6, color: 'rgba(20,17,16,0.82)', track: 0,
      });
    }
  }

  // case at the far end
  if (showCase > 0.02) {
    ctx.save();
    ctx.globalAlpha *= showCase;
    const cy = up ? y - 6 : y;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = linGrad(ctx, x - 78, cy, x + 78, cy + 110, [[0, '#F1C257'], [0.5, Q.tape], [1, Q.tape2]]);
    fillRR(ctx, x - 80, cy, 160, 112, 26, ctx.fillStyle);
    ctx.restore();
    ctx.fillStyle = 'rgba(20,17,16,0.30)';
    fillRR(ctx, x - 42, cy + 26, 84, 60, 12, ctx.fillStyle);
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    fillRR(ctx, x - 68, cy + 8, 136, 12, 6, ctx.fillStyle);
    ctx.restore();
  }
  ctx.restore();
}

/* ---------------------------------------------------------- silhouettes --- */

/** Blocky skyline. Returns the tallest x so callers can hang things off it. */
export function skyline(ctx, x0, baseY, span, o = {}) {
  const { color = '#151B1E', a = 1, seed = 3, hMin = 140, hMax = 520, gap = 12 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  let x = x0;
  const towers = [];
  while (x < x0 + span) {
    const w = 70 + rnd() * 110;
    const h = hMin + rnd() * (hMax - hMin);
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - h, w, h + 40);
    // windows
    ctx.fillStyle = 'rgba(255,205,130,0.16)';
    for (let wy = baseY - h + 26; wy < baseY - 26; wy += 34) {
      for (let wx = x + 12; wx < x + w - 16; wx += 26) {
        if (rnd() > 0.62) ctx.fillRect(wx, wy, 10, 14);
      }
    }
    towers.push({ x, w, h });
    x += w + gap;
  }
  ctx.restore();
  return towers;
}

/** Small water surface: a band with slow wave arcs. */
export function waves(ctx, y, o = {}) {
  const { a = 1, color = Q.water, amp = 7, speed = 1, t = 0, h = 1200 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, color], [0.5, Q.waterDeep], [1, '#0B2A32']]);
  ctx.fillRect(0, y, W, H - y);
  ctx.strokeStyle = 'rgba(190,225,231,0.30)';
  ctx.lineWidth = 3;
  for (let row = 0; row < 7; row++) {
    const yy = y + 14 + row * 34;
    ctx.beginPath();
    for (let x = -40; x < W + 40; x += 12) {
      const wv = Math.sin(x * 0.012 + t * speed * 1.4 + row * 0.9) * (amp - row * 0.7);
      if (x === -40) ctx.moveTo(x, yy + wv);
      else ctx.lineTo(x, yy + wv);
    }
    ctx.globalAlpha *= 0.82;
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------------- the pump --- */

/** A jet pump bolted to a yard wall, with its suction pipe running down. */
export function pump(ctx, x, y, s = 1, o = {}) {
  const { a = 1, on = 0 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  // bracket
  ctx.fillStyle = '#5B5850';
  fillRR(ctx, -150, 190, 300, 26, 6, ctx.fillStyle);
  // motor body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = linGrad(ctx, -160, -90, 160, 90, [[0, '#9AC7B6'], [0.5, '#4E8F7E'], [1, '#2C5B4F']]);
  fillRR(ctx, -160, -90, 250, 180, 26, ctx.fillStyle);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  fillRR(ctx, -142, -74, 210, 20, 10, ctx.fillStyle);
  // cooling fins
  ctx.fillStyle = 'rgba(10,20,18,0.20)';
  for (let i = 0; i < 7; i++) ctx.fillRect(-140 + i * 30, -40, 12, 100);
  // fan housing
  ctx.fillStyle = linGrad(ctx, 90, -70, 150, 70, [[0, '#D8D2C4'], [1, '#8E8A7E']]);
  ctx.beginPath();
  ctx.arc(140, 0, 62, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,17,16,0.35)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const an = i * (Math.PI / 2) + on * 6;
    ctx.beginPath();
    ctx.moveTo(140, 0);
    ctx.lineTo(140 + Math.cos(an) * 52, Math.sin(an) * 52);
    ctx.stroke();
  }
  // pressure gauge
  ctx.fillStyle = '#EDE7D9';
  ctx.beginPath();
  ctx.arc(30, -140, 34, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#3B3830';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = Q.rust;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, -140);
  ctx.lineTo(30 + 22, -152);
  ctx.stroke();
  // pipes
  ctx.fillStyle = '#C9C3B4';
  ctx.fillRect(-120, 176, 34, 90);
  ctx.fillStyle = '#B4AE9F';
  ctx.fillRect(-124, 240, 42, 24);
  ctx.restore();
}

/* ---------------------------------------------------------- cross section --- */

/** Underground section: soil bands, a borehole and the aquifer it drinks. */
export function strata(ctx, y0, y1, o = {}) {
  const { a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  const bands = [
    [0.0, '#B9A98A'], [0.18, '#A9946F'], [0.34, '#8E7B5D'],
    [0.52, '#75664E'], [0.7, '#5C5040'], [0.86, '#463D31'], [1, '#2F291F'],
  ];
  for (let i = 0; i < bands.length - 1; i++) {
    const [p0, c0] = bands[i];
    const [p1] = bands[i + 1];
    ctx.fillStyle = c0;
    ctx.fillRect(0, y0 + (y1 - y0) * p0, W, (y1 - y0) * (p1 - p0) + 1);
  }
  // grit
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let i = 0; i < 260; i++) {
    const x = (i * 193) % W;
    const y = y0 + ((i * 389) % (y1 - y0));
    ctx.fillRect(x, y, 3 + (i % 3), 2);
  }
  ctx.restore();
}
