// Episode 31 kit — "textbook": a worn school biology book on a walnut desk,
// corrected in red pen. Everything is drawn procedurally, the way a
// broadcast graphics package would be built by hand:
//
//   * the sheet: cream stock with fibre flecks, laid & chain lines, a
//     horizontal fold, a tea ring, a thumb smudge, the block of pages under
//     it and printed crop marks, chapter band, folio and footnote;
//   * printed ink: faded blue, drawn on with a slight double-strike
//     misregistration and stippled fills, like offset litho;
//   * the red pen: real ribbon strokes — pressure widens the middle of every
//     stroke and tapers the ends, the nib stays visible while a stroke is
//     being drawn, wet ink sits darker and dries lighter, and a faint bleed
//     halo soaks into the paper;
//   * handwriting: per-glyph baseline jitter, slant and pressure, so margin
//     notes read as a hand, not a font;
//   * the room: dust motes drifting through the desk-lamp cone and a lamp
//     that breathes, drawn over the finished page.
//
// Scenes draw two layers like the dossier kit:
//   o.layer 'bg'   -> the desk
//   o.layer 'card' -> the page and its ink, under motion()
import { createCanvas } from '@napi-rs/canvas';
import {
  bake, cue, cueEnd, P, eo, e3, io, ioq, sm, rgba, textW, rng, TAU, clamp, lerp, F, W, H, EASE, Path2D,
} from './_cyano.mjs';
import {
  motion, withSheet, D_DEAL, typed, ruleI, leaderI, hand,
} from './_dossier.mjs';

export const BK = {
  desk: '#241610',
  desk2: '#3A2417',
  wood: 'rgba(255,214,160,0.05)',
  lamp: '255,206,150',
  page: '#F4EEDF',
  page2: '#E9E1CC',
  edge: '#C9BC9E',
  stack: '#D8CDB4',
  ink: '#26221B',
  ink2: 'rgba(38,34,27,0.62)',
  ink3: 'rgba(38,34,27,0.36)',
  print: '#2C4A66',
  print2: 'rgba(44,74,102,0.55)',
  print3: 'rgba(44,74,102,0.28)',
  pen: '#C22A21',
  pen2: 'rgba(194,42,33,0.65)',
  graphite: '#5A544C',
  amber: '#B8791F',
  bone: '#EDE6D8',
};

export {
  cue, cueEnd, P, eo, e3, io, ioq, sm, rgba, textW, rng, TAU, clamp, lerp, F, W, H, EASE, bake,
  motion, withSheet, D_DEAL, typed, ruleI, leaderI, hand,
};

/* --------------------------------- desk ---------------------------------- */

export function deskLayer() {
  return bake('d31b-desk', W + 240, H + 240, (c, cv) => {
    c.fillStyle = BK.desk;
    c.fillRect(0, 0, cv.width, cv.height);
    const r = rng(5150);
    // walnut planks: fine grain, pores, two knots
    for (let x = 0; x < cv.width; x += 2) {
      const n = 0.5 + 0.5 * Math.sin(x / 26 + Math.sin(x / 97) * 3);
      c.fillStyle = `rgba(255,190,120,${0.010 + 0.018 * n})`;
      c.fillRect(x, 0, 1, cv.height);
    }
    for (let i = 0; i < 130; i++) {
      const x = r() * cv.width;
      c.strokeStyle = `rgba(20,8,4,${0.10 + r() * 0.16})`;
      c.lineWidth = 1 + r() * 3;
      c.beginPath();
      let yy = -20;
      c.moveTo(x, yy);
      while (yy < cv.height + 20) {
        yy += 60 + r() * 90;
        c.lineTo(x + (r() - 0.5) * 26, yy);
      }
      c.stroke();
    }
    // open pores: short dark dashes along the grain
    for (let i = 0; i < 900; i++) {
      const x = r() * cv.width;
      const y = r() * cv.height;
      c.strokeStyle = `rgba(12,5,2,${0.10 + r() * 0.14})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (r() - 0.5) * 3, y + 4 + r() * 12);
      c.stroke();
    }
    // two knots
    for (const [kx, ky] of [[cv.width * 0.16, cv.height * 0.82], [cv.width * 0.88, cv.height * 0.62]]) {
      for (let i = 9; i > 0; i--) {
        c.strokeStyle = `rgba(16,6,2,${0.05 + 0.03 * (9 - i)})`;
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(kx, ky, i * 9 + r() * 4, i * 5 + r() * 3, 0.3, 0, TAU);
        c.stroke();
      }
    }
    // plank seams with a lit lip
    for (let x = 260; x < cv.width; x += 520) {
      c.strokeStyle = 'rgba(10,4,2,0.5)';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x + (r() - 0.5) * 8, 0);
      c.lineTo(x + (r() - 0.5) * 8, cv.height);
      c.stroke();
      c.strokeStyle = 'rgba(255,200,140,0.05)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x + 3, 0);
      c.lineTo(x + 3, cv.height);
      c.stroke();
    }
    // old scratches and a faint water mark
    for (let i = 0; i < 26; i++) {
      const x = r() * cv.width;
      const y = r() * cv.height;
      const a = r() * TAU;
      const len = 30 + r() * 160;
      c.strokeStyle = `rgba(255,220,170,${0.02 + r() * 0.03})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.stroke();
    }
    const wm = c.createRadialGradient(cv.width * 0.24, cv.height * 0.3, 40, cv.width * 0.24, cv.height * 0.3, 260);
    wm.addColorStop(0, 'rgba(0,0,0,0.10)');
    wm.addColorStop(0.8, 'rgba(0,0,0,0.04)');
    wm.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = wm;
    c.fillRect(0, 0, cv.width, cv.height);
    // desk-lamp pool from the top right
    const g = c.createRadialGradient(cv.width * 0.62, cv.height * 0.26, 140, cv.width * 0.56, cv.height * 0.42, cv.height * 0.88);
    g.addColorStop(0, `rgba(${BK.lamp},0.10)`);
    g.addColorStop(0.55, `rgba(${BK.lamp},0.035)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, cv.width, cv.height);
    const v = c.createRadialGradient(cv.width / 2, cv.height / 2, cv.height * 0.32, cv.width / 2, cv.height / 2, cv.height * 0.84);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = v;
    c.fillRect(0, 0, cv.width, cv.height);
  });
}

export function desk(ctx) {
  const cv = deskLayer();
  ctx.drawImage(cv, -120, -120);
}

/* ------------------------- the red pen: ribbon ink ------------------------ */

/** dense point list of an ellipse, hand wobble included */
const circlePts = (cx, cy, rx, ry, rot = -0.04) => {
  const pts = [];
  for (let i = 0; i <= 96; i++) {
    const u = i / 96;
    const a = -0.6 + u * TAU * 1.06;
    const wob = 1 + 0.035 * Math.sin(a * 3.1) + 0.02 * Math.sin(a * 7.7);
    const px = Math.cos(a) * rx * wob;
    const py = Math.sin(a) * ry * wob;
    pts.push([cx + px * Math.cos(rot) - py * Math.sin(rot), cy + px * Math.sin(rot) + py * Math.cos(rot)]);
  }
  return pts;
};
const linePts = (x0, y0, x1, y1, n = 26) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    pts.push([lerp(x0, x1, u), lerp(y0, y1, u)]);
  }
  return pts;
};
const quadPts = (x0, y0, mx, my, x1, y1, n = 34) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    pts.push([
      (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1,
      (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1,
    ]);
  }
  return pts;
};
const wavePts = (x, y, w, n = 44, amp = 4, fq = 22) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    pts.push([x + u * w, y + Math.sin(u * fq) * amp]);
  }
  return pts;
};

/**
 * A pen stroke as a filled ribbon: the width follows a pressure curve, wet
 * ink reads darker while the nib is moving, a bleed halo soaks the paper and
 * the nib itself stays visible at the head of an unfinished stroke.
 */
export function inkStroke(ctx, pts, p = 1, {
  color = BK.pen, lw = 7, profile = 'pen', bleed = 1, nib = true, a = 1,
} = {}) {
  if (p <= 0.001) return;
  const q = clamp(p);
  const n = Math.max(2, Math.round((pts.length - 1) * q));
  const w = (u) => {
    let k;
    if (profile === 'pen') k = 0.55 + 0.75 * Math.sin(Math.PI * clamp(u * 1.12)) ** 0.6;
    else if (profile === 'tap') k = 0.5 + 0.9 * Math.sin(Math.PI * clamp(u)) ** 0.5;
    else k = 0.95 - 0.45 * u; // shaft: firm at the hand, fine at the tip
    if (u > 0.92) k *= 1 - (u - 0.92) / 0.08 * 0.45;
    if (u < 0.06) k *= 0.55 + 0.45 * (u / 0.06);
    return lw * k;
  };
  const left = [];
  const right = [];
  for (let i = 0; i <= n; i++) {
    const u = i / (pts.length - 1);
    const [x, y] = pts[i];
    const [x2, y2] = pts[Math.min(pts.length - 1, i + 1)];
    const [x1, y1] = pts[Math.max(0, i - 1)];
    let dx = x2 - x1;
    let dy = y2 - y1;
    const L = Math.hypot(dx, dy) || 1;
    dx /= L; dy /= L;
    const hw = w(u) / 2;
    left.push([x - dy * hw, y + dx * hw]);
    right.push([x + dy * hw, y - dx * hw]);
  }
  ctx.save();
  ctx.globalAlpha *= a * (q < 1 ? 0.96 : 0.88); // wet, then dried
  if (bleed > 0) {
    ctx.shadowColor = rgba(color, 0.35);
    ctx.shadowBlur = 2.6 * bleed;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i <= n; i++) ctx.lineTo(left[i][0], left[i][1]);
  for (let i = n; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.shadowBlur = 0;
  // dry-brush skips: the paper tooth breaking the ink
  ctx.globalCompositeOperation = 'destination-out';
  const r = rng(pts.length * 17 + 5);
  for (let i = 2; i < n - 1; i += 3) {
    if (r() > 0.34) continue;
    const [x, y] = pts[i];
    ctx.globalAlpha = 0.10 + r() * 0.12;
    ctx.beginPath();
    ctx.arc(x + (r() - 0.5) * lw, y + (r() - 0.5) * lw, 0.7 + r() * 1.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  // the nib, while the hand is still moving
  if (nib && q < 1) {
    const [x, y] = pts[n];
    ctx.save();
    ctx.globalAlpha *= 0.55;
    ctx.fillStyle = rgba(color, 0.9);
    ctx.beginPath();
    ctx.arc(x, y, w(q) * 0.42, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

/** printed litho line: even weight, drawn on, with a misregistered ghost */
export function printStroke(ctx, pts, p = 1, { color = BK.print, lw = 4, dash = null, a = 0.95 } = {}) {
  if (p <= 0.001) return;
  const q = clamp(p);
  const n = Math.max(2, Math.round((pts.length - 1) * q));
  const pass = (ox, oy, al, w2) => {
    ctx.save();
    ctx.globalAlpha *= al;
    ctx.strokeStyle = color;
    ctx.lineWidth = w2;
    ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy);
    for (let i = 1; i <= n; i++) ctx.lineTo(pts[i][0] + ox, pts[i][1] + oy);
    ctx.stroke();
    ctx.restore();
  };
  pass(1.1, 0.8, a * 0.22, lw);       // second strike, half a point off
  pass(0, 0, a, lw);
}

/* --------------------------------- page ---------------------------------- */

/** a textbook page: cream stock, fibres, fold, stain, stack, printed frame */
export function pageLayer(key, w, h, { folio = '128', chapter = 'BAB VII · INDERA PERASA', footnote = '' } = {}) {
  return bake(`d31b-page-${key}-${w}x${h}`, w + 96, h + 96, (c, cv) => {
    const x0 = 40;
    const y0 = 40;
    const r = rng(3300 + w);
    // the block of pages under the open sheet
    c.save();
    for (let k = 8; k >= 1; k--) {
      c.fillStyle = k % 2 ? BK.stack : BK.page2;
      c.fillRect(x0 + k * 2.1, y0 + k * 1.7, w, h);
      c.strokeStyle = 'rgba(120,104,74,0.35)';
      c.lineWidth = 1;
      c.strokeRect(x0 + k * 2.1, y0 + k * 1.7, w, h);
    }
    c.restore();
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.5)';
    c.shadowBlur = 30;
    c.shadowOffsetY = 14;
    c.fillStyle = BK.page;
    // slightly cocked sheet
    c.beginPath();
    c.moveTo(x0 + 3, y0);
    c.lineTo(x0 + w, y0 + 4);
    c.lineTo(x0 + w - 4, y0 + h);
    c.lineTo(x0, y0 + h - 5);
    c.closePath();
    c.fill();
    c.shadowColor = 'rgba(0,0,0,0)';
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
    c.clip();
    // age gradient + foxing
    const g = c.createLinearGradient(x0, y0, x0 + w * 0.8, y0 + h);
    g.addColorStop(0, 'rgba(255,252,242,0.7)');
    g.addColorStop(0.55, 'rgba(233,225,204,0.35)');
    g.addColorStop(1, 'rgba(206,192,160,0.5)');
    c.fillStyle = g;
    c.fillRect(x0, y0, w, h);
    // paper fibre: flecks and short curved fibres
    for (let i = 0; i < 520; i++) {
      const fx = x0 + r() * w;
      const fy = y0 + r() * h;
      c.fillStyle = `rgba(${r() > 0.5 ? '150,120,70' : '255,255,250'},${0.03 + r() * 0.05})`;
      c.fillRect(fx, fy, 1 + r() * 1.6, 1);
    }
    for (let i = 0; i < 240; i++) {
      const fx = x0 + r() * w;
      const fy = y0 + r() * h;
      const a = r() * TAU;
      c.strokeStyle = `rgba(140,116,76,${0.025 + r() * 0.03})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(fx, fy);
      c.quadraticCurveTo(fx + Math.cos(a) * 8, fy + Math.sin(a) * 8 - 3, fx + Math.cos(a) * 16, fy + Math.sin(a) * 16);
      c.stroke();
    }
    // laid lines (vertical) and chain lines (horizontal) of the mould
    c.strokeStyle = 'rgba(120,100,64,0.030)';
    c.lineWidth = 1;
    for (let x = x0 + 12; x < x0 + w; x += 26) {
      c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + h); c.stroke();
    }
    c.strokeStyle = 'rgba(120,100,64,0.045)';
    for (let y = y0 + 90; y < y0 + h; y += 232) {
      c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + w, y); c.stroke();
    }
    for (let i = 0; i < 22; i++) {
      const fx = x0 + r() * w;
      const fy = y0 + r() * h;
      const rad = 5 + r() * 30;
      const fg = c.createRadialGradient(fx, fy, 0, fx, fy, rad);
      fg.addColorStop(0, 'rgba(150,120,70,0.05)');
      fg.addColorStop(1, 'rgba(150,120,70,0)');
      c.fillStyle = fg;
      c.fillRect(fx - rad, fy - rad, rad * 2, rad * 2);
    }
    // a tea ring, upper right of the plate area
    const tx = x0 + w * 0.8;
    const ty = y0 + h * 0.2;
    c.strokeStyle = 'rgba(146,102,52,0.055)';
    c.lineWidth = 9;
    c.beginPath();
    c.arc(tx, ty, 62, 0.4, TAU * 0.86);
    c.stroke();
    c.strokeStyle = 'rgba(146,102,52,0.04)';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(tx, ty, 54, 0.6, TAU * 0.8);
    c.stroke();
    // the fold: shadow band with a lit crest
    const fy2 = y0 + h * 0.52;
    const fold = c.createLinearGradient(0, fy2 - 7, 0, fy2 + 7);
    fold.addColorStop(0, 'rgba(90,70,40,0)');
    fold.addColorStop(0.45, 'rgba(90,70,40,0.075)');
    fold.addColorStop(0.55, 'rgba(255,252,240,0.5)');
    fold.addColorStop(1, 'rgba(90,70,40,0)');
    c.fillStyle = fold;
    c.fillRect(x0, fy2 - 7, w, 14);
    // thumb smudge, lower left
    const sm = c.createRadialGradient(x0 + 90, y0 + h - 130, 6, x0 + 90, y0 + h - 130, 90);
    sm.addColorStop(0, 'rgba(90,80,64,0.075)');
    sm.addColorStop(1, 'rgba(90,80,64,0)');
    c.fillStyle = sm;
    c.fillRect(x0, y0 + h - 240, 220, 240);
    // spine shadow on the left
    const sp = c.createLinearGradient(x0, 0, x0 + 90, 0);
    sp.addColorStop(0, 'rgba(90,70,40,0.28)');
    sp.addColorStop(1, 'rgba(90,70,40,0)');
    c.fillStyle = sp;
    c.fillRect(x0, y0, 90, h);
    // double rule frame
    c.strokeStyle = BK.print2;
    c.lineWidth = 2;
    c.strokeRect(x0 + 56, y0 + 52, w - 112, h - 104);
    c.lineWidth = 1;
    c.strokeRect(x0 + 64, y0 + 60, w - 128, h - 120);
    // printed registration crosses at the frame corners
    c.strokeStyle = BK.print3;
    c.lineWidth = 1.4;
    for (const [cx2, cy2] of [[x0 + 56, y0 + 52], [x0 + w - 56, y0 + 52], [x0 + 56, y0 + h - 52], [x0 + w - 56, y0 + h - 52]]) {
      c.beginPath();
      c.moveTo(cx2 - 9, cy2); c.lineTo(cx2 + 9, cy2);
      c.moveTo(cx2, cy2 - 9); c.lineTo(cx2, cy2 + 9);
      c.stroke();
    }
    // chapter band
    c.fillStyle = BK.print;
    c.font = `700 26px ${F.mono6}`;
    c.letterSpacing = '5px';
    c.fillText(chapter, x0 + 84, y0 + 106);
    c.strokeStyle = BK.print2;
    c.beginPath();
    c.moveTo(x0 + 84, y0 + 122);
    c.lineTo(x0 + w - 84, y0 + 122);
    c.stroke();
    // folio and footnote
    c.font = `24px ${F.mono6}`;
    c.fillStyle = BK.ink2;
    c.textAlign = 'right';
    c.fillText(folio, x0 + w - 84, y0 + h - 74);
    c.textAlign = 'left';
    if (footnote) {
      c.font = `20px ${F.mono6}`;
      c.fillStyle = BK.ink3;
      c.fillText(footnote, x0 + 84, y0 + h - 74);
    }
    c.restore();
  });
}

export function drawPage(ctx, key, x, y, w, h, opts = {}) {
  const cv = pageLayer(key, w, h, opts);
  ctx.drawImage(cv, Math.round(x) - 40, Math.round(y) - 40);
}

/** greeked body text: two columns of thin strokes, reveal by p */
export function greek(ctx, x, y, w, lines, p = 1, { gap = 34, color = BK.ink3 } = {}) {
  if (p <= 0.001) return;
  const r = rng(x + y);
  ctx.save();
  ctx.fillStyle = color;
  const n = Math.round(lines * clamp(p));
  for (let i = 0; i < n; i++) {
    let cx = x;
    const end = x + w * (0.86 + r() * 0.14);
    while (cx < end) {
      const wl = 18 + r() * 74;
      ctx.globalAlpha = 0.5 + r() * 0.4;
      ctx.fillRect(cx, y + i * gap, Math.min(wl, end - cx), 5);
      cx += wl + 12;
    }
  }
  ctx.restore();
}

/* ------------------------------- red pen ---------------------------------- */

/** a hand-drawn ellipse around a region */
export function penCircle(ctx, cx, cy, rx, ry, p = 1, { color = BK.pen, lw = 7, rot = -0.04 } = {}) {
  inkStroke(ctx, circlePts(cx, cy, rx, ry, rot), p, { color, lw, profile: 'pen' });
}

/** a bold pen cross */
export function penX(ctx, cx, cy, s, p = 1, { color = BK.pen, lw = 12 } = {}) {
  const q = clamp(p);
  inkStroke(ctx, linePts(cx - s, cy - s, cx + s, cy + s, 22), clamp(q * 1.8), { color, lw, profile: 'tap' });
  inkStroke(ctx, linePts(cx + s, cy - s, cx - s, cy + s, 22), clamp(q * 1.8 - 0.8), { color, lw: lw * 0.92, profile: 'tap' });
}

/** pen arrow with a curved shaft */
export function penArrow(ctx, x0, y0, x1, y1, p = 1, { color = BK.pen, lw = 6, bow = 0.22 } = {}) {
  const q = clamp(p);
  const mx = (x0 + x1) / 2 - (y1 - y0) * bow;
  const my = (y0 + y1) / 2 + (x1 - x0) * bow;
  const pts = quadPts(x0, y0, mx, my, x1, y1, 34);
  inkStroke(ctx, pts, q, { color, lw, profile: 'shaft' });
  if (q > 0.97) {
    const a = Math.atan2(y1 - my, x1 - mx);
    inkStroke(ctx, linePts(x1, y1, x1 - Math.cos(a - 0.45) * 26, y1 - Math.sin(a - 0.45) * 26, 8), 1, { color, lw: lw * 0.9, profile: 'tap', nib: false });
    inkStroke(ctx, linePts(x1, y1, x1 - Math.cos(a + 0.45) * 26, y1 - Math.sin(a + 0.45) * 26, 8), 1, { color, lw: lw * 0.9, profile: 'tap', nib: false });
  }
}

/** wavy pen underline */
export function penUnder(ctx, x, y, w, p = 1, { color = BK.pen, lw = 5 } = {}) {
  inkStroke(ctx, wavePts(x, y, w), p, { color, lw, profile: 'pen' });
}

/** an eraser smudge under a correction */
export function smudge(ctx, x, y, w, h, p = 1) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= 0.5 * eo(clamp(p));
  const r = rng(x * 3 + y);
  for (let i = 0; i < 26; i++) {
    const px = x + r() * w;
    const py = y + r() * h;
    const rad = 8 + r() * 26;
    const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
    g.addColorStop(0, 'rgba(120,110,96,0.10)');
    g.addColorStop(1, 'rgba(120,110,96,0)');
    ctx.fillStyle = g;
    ctx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  // rubber crumbs
  ctx.globalAlpha *= 0.8;
  ctx.fillStyle = 'rgba(96,88,76,0.35)';
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(x + r() * w, y + h + r() * 14, 1 + r() * 1.6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** handwritten margin note: per-glyph hand, not a font run */
export function margin(ctx, s, x, y, { size = 40, color = BK.pen, p = 1, rot = -0.03, font = F.italic6 } = {}) {
  if (p <= 0.001) return;
  const q = clamp(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color;
  const n = Math.round(s.length * q);
  const r = rng(s.length * 7 + 3);
  let cx = 0;
  for (let i = 0; i < n; i++) {
    const ch = s[i];
    const wch = ctx.measureText(ch).width;
    const dy = (r() - 0.5) * size * 0.07;
    const dr = (r() - 0.5) * 0.06;
    ctx.save();
    ctx.translate(cx, dy);
    ctx.rotate(dr);
    ctx.globalAlpha = 0.78 + r() * 0.22; // pressure
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    cx += wch + 0.4;
  }
  // the pen lifting: a faint tail after the last glyph
  if (q < 1) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(cx + 2, -size * 0.3, size * 0.05, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** hand stamp: double-struck ring + word, pressed unevenly, with a smear */
export function handStamp(ctx, s, x, y, { p = 1, rot = -0.14, size = 66, color = BK.pen } = {}) {
  if (p <= 0.001) return;
  const k = eo(clamp(p));
  const draw = (ox, oy, al) => {
    ctx.save();
    ctx.globalAlpha *= al;
    ctx.translate(x + ox, y + oy);
    ctx.rotate(rot);
    ctx.scale(1.4 - 0.4 * k, 1.4 - 0.4 * k);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.font = `800 ${size}px ${F.head}`;
    ctx.letterSpacing = '6px';
    ctx.textAlign = 'center';
    const w = ctx.measureText(s).width;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.34, w / 2 + 46, size * 0.92, 0, 0, TAU);
    ctx.stroke();
    ctx.fillText(s, 0, 0);
    ctx.restore();
  };
  ctx.save();
  ctx.globalAlpha = clamp(p * 2) * 0.9;
  // the smear of the hand dragging off
  ctx.save();
  ctx.globalAlpha *= 0.10;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.fillRect(-140, -size * 0.9, 300, size * 1.5);
  ctx.restore();
  draw(2.6, 1.8, 0.22);   // the first, lighter strike
  draw(0, 0, 0.9);
  // pressed-ink speckle
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'destination-out';
  const r = rng(s.length * 31 + 9);
  const w = ctx.measureText(s).width || s.length * size * 0.6;
  for (let i = 0; i < 130; i++) {
    ctx.beginPath();
    ctx.arc(-w / 2 - 40 + r() * (w + 80), -size + r() * size * 1.5, 0.6 + r() * 2.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/* ----------------------------- printed glyphs ----------------------------- */

const TONGUE_OUT = (() => {
  // sample the textbook tongue outline once
  const seg = (p0, c1, c2, p1, n) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const a = (1 - u) ** 3;
      const b = 3 * (1 - u) ** 2 * u;
      const c = 3 * (1 - u) * u * u;
      const d = u ** 3;
      out.push([a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0], a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1]]);
    }
    return out;
  };
  return [
    ...seg([0, -250], [120, -250], [168, -120], [160, 40], 26),
    ...seg([160, 40], [152, 180], [90, 260], [0, 268], 26),
    ...seg([0, 268], [-90, 260], [-152, 180], [-160, 40], 26),
    ...seg([-160, 40], [-168, -120], [-120, -250], [0, -250], 26),
  ];
})();

/** classic textbook tongue: the plate draws on, papillae stipple in */
export function tongueMap(ctx, x, y, s, p = 1, { zones = true, ink = BK.print } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const op = clamp(p / 0.7);
  const pts = TONGUE_OUT.map(([px, py]) => [px, py]);
  // stippled papillae inside the outline
  const sp = clamp((p - 0.45) / 0.55);
  if (sp > 0) {
    const r = rng(91);
    ctx.save();
    ctx.globalAlpha *= 0.30 * sp;
    ctx.fillStyle = ink;
    for (let i = 0; i < 240; i++) {
      const px = (r() * 2 - 1) * 150;
      const py = (r() * 2 - 1) * 250;
      if ((px / 152) ** 2 + (py / 252) ** 2 > 0.92) continue;
      ctx.beginPath();
      ctx.arc(px, py, 0.9 + r() * 1.3, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  printStroke(ctx, pts, op, { color: ink, lw: 5, a: 0.95 });
  // median groove
  printStroke(ctx, linePts(0, -230, 0, 240, 20).map(([px, py], i) => [px + Math.sin(i / 3) * 6, py]), op, { color: ink, lw: 3, a: 0.8 });
  if (zones) {
    const zp = clamp((p - 0.6) / 0.4);
    const tip = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      tip.push([lerp(-160, 160, u), 120 - Math.sin(u * Math.PI) * 30]);
    }
    const back = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      back.push([lerp(-164, 164, u), -110 + Math.sin(u * Math.PI) * 30]);
    }
    printStroke(ctx, tip, zp, { color: ink, lw: 4, dash: [12, 9], a: 0.85 });
    printStroke(ctx, back, zp, { color: ink, lw: 4, dash: [12, 9], a: 0.85 });
  }
  ctx.restore();
}

/** papilla cross-section with an onion-shaped taste bud, drawn on */
export function budSection(ctx, x, y, s, p = 1, { ink = BK.print, glow = 0 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const op = clamp(p / 0.8);
  const epi = [
    ...linePts(-190, 150, -190, 10, 8),
    ...quadPts(-190, 10, -90, 4, -56, -60, 12),
    ...quadPts(-56, -60, -30, -110, 0, -110, 10),
    ...quadPts(0, -110, 30, -110, 56, -60, 10),
    ...quadPts(56, -60, 90, 4, 190, 10, 12),
    ...linePts(190, 10, 190, 150, 8),
    ...linePts(190, 150, -190, 150, 12),
  ];
  printStroke(ctx, epi, op, { color: ink, lw: 4, a: 0.95 });
  // the bud: onion of cells, the pen's column in red
  const bp = clamp((p - 0.35) / 0.65);
  if (bp > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -20, 52, 92, 0, 0, TAU);
    ctx.clip();
    for (let i = -3; i <= 3; i++) {
      const col = linePts(i * 14, 70, i * 4, -104, 14).map(([px, py], k) => [px + Math.sin(k / 3 + i) * 5, py]);
      if (i === 0) inkStroke(ctx, col, bp, { color: BK.pen, lw: 3.4, profile: 'pen', nib: false, a: 0.5 + 0.5 * glow });
      else printStroke(ctx, col, bp, { color: ink, lw: 3, a: 0.8 });
    }
    ctx.restore();
    const ring = [];
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * TAU;
      ring.push([Math.cos(a) * 52, -20 + Math.sin(a) * 92]);
    }
    printStroke(ctx, ring, bp, { color: ink, lw: 4, a: 0.95 });
    printStroke(ctx, linePts(-14, -108, 14, -108, 4), bp, { color: ink, lw: 4, a: 0.9 });
    printStroke(ctx, quadPts(0, 72, -10, 110, 0, 150, 10), bp, { color: ink, lw: 3, a: 0.85 });
  }
  ctx.restore();
}

/** simple cat head silhouette */
export function catGlyph(ctx, x, y, s, p = 1, { ink = BK.ink } = {}) {
  if (p <= 0.001) return;
  const q = eo(clamp(p));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * q, s * q);
  const out = [
    ...linePts(-90, -40, -110, -150, 6),
    ...linePts(-110, -150, -38, -96, 6),
    ...quadPts(-38, -96, 0, -112, 38, -96, 8),
    ...linePts(38, -96, 110, -150, 6),
    ...linePts(110, -150, 90, -40, 6),
    ...quadPts(90, -40, 96, 60, 0, 100, 12),
    ...quadPts(0, 100, -96, 60, -90, -40, 12),
  ];
  ctx.save();
  ctx.globalAlpha *= 0.08;
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(out[0][0], out[0][1]);
  out.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  printStroke(ctx, out, clamp(p / 0.8), { color: ink, lw: 5, a: 0.95 });
  const fp = clamp((p - 0.7) / 0.3);
  if (fp > 0) {
    printStroke(ctx, [...circlePts(-38, -20, 12, 12, 0), ...circlePts(38, -20, 12, 12, 0)], fp, { color: ink, lw: 4, a: 0.9 });
    printStroke(ctx, [
      ...linePts(-60, 20, -150, 6, 6), ...linePts(-60, 36, -150, 40, 6),
      ...linePts(60, 20, 150, 6, 6), ...linePts(60, 36, 150, 40, 6),
    ], fp, { color: ink, lw: 4, a: 0.85 });
  }
  ctx.restore();
}

/** eighth-note glyph */
export function noteGlyph(ctx, x, y, s, p = 1, { ink = BK.print, dy = 0 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.translate(x, y + dy);
  ctx.scale(s, s);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 15, -0.35, 0, TAU);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(18, -4);
  ctx.lineTo(18, -86);
  ctx.bezierCurveTo(40, -78, 46, -60, 40, -44);
  ctx.stroke();
  ctx.restore();
}

/** printed figure frame with caption rule */
export function figFrame(ctx, x, y, w, h, p = 1, { ink = BK.print2, label = 'Gbr. 7.1' } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.5);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.font = `24px ${F.mono6}`;
  ctx.fillStyle = BK.ink2;
  ctx.fillText(label, x, y + h + 34);
  ctx.restore();
}

const backOut = (u) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const t = clamp(u) - 1;
  return 1 + c3 * t * t * t + c1 * t * t;
};

/** printed bar chart with near-equal bars: each bar overshoots and settles */
export function barsEqual(ctx, x, y, w, h, p = 1, { ink = BK.print, vals = [0.92, 0.86, 0.9, 0.88, 0.94, 0.87] } = {}) {
  if (p <= 0.001) return;
  const q = clamp(p);
  ctx.save();
  printStroke(ctx, [...linePts(x, y, x, y + h, 10), ...linePts(x, y + h, x + w, y + h, 14)], clamp(q * 2.4), { color: ink, lw: 3, a: 0.9 });
  const bw = w / vals.length;
  vals.forEach((v, i) => {
    const u = clamp(q * vals.length - i);
    if (u <= 0) return;
    const bh = h * v * backOut(u);
    const bx = x + i * bw + bw * 0.2;
    const bwd = bw * 0.6;
    ctx.save();
    ctx.globalAlpha *= 0.32;
    ctx.fillStyle = ink;
    ctx.fillRect(bx, y + h - bh, bwd, bh);
    ctx.restore();
    // litho hatch inside the bar
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, y + h - bh, bwd, bh);
    ctx.clip();
    ctx.globalAlpha *= 0.30;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.4;
    for (let d = -bh; d < bwd + bh; d += 7) {
      ctx.beginPath();
      ctx.moveTo(bx + d, y + h);
      ctx.lineTo(bx + d + bh, y + h - bh);
      ctx.stroke();
    }
    ctx.restore();
    printStroke(ctx, [
      ...linePts(bx, y + h, bx, y + h - bh, 8),
      ...linePts(bx, y + h - bh, bx + bwd, y + h - bh, 6),
      ...linePts(bx + bwd, y + h - bh, bx + bwd, y + h, 8),
    ], 1, { color: ink, lw: 3, a: 0.9 });
  });
  ctx.restore();
}

/** the myth version: spiky zone bars (Boring's redraw) */
export function barsZones(ctx, x, y, w, h, p = 1, { ink = BK.pen, vals = [1, 0.06, 0.04, 0.05, 0.08, 0.9] } = {}) {
  return barsEqual(ctx, x, y, w, h, p, { ink, vals });
}

/** printed timeline rule with year ticks */
export function yearRule(ctx, x0, x1, y, p = 1, { ink = BK.print } = {}) {
  if (p <= 0.001) return;
  printStroke(ctx, linePts(x0, y, x1, y, 24), p, { color: ink, lw: 3, a: 0.9 });
}

/* ------------------------------ the room ---------------------------------- */

/** dust motes drifting through the desk-lamp cone */
export function dust(ctx, t, seed = 1, n = 26) {
  const r = rng(seed * 771 + 13);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const bx = r() * W;
    const by = r() * H;
    const vx = 6 + r() * 14;
    const vy = 9 + r() * 16;
    const ph = r() * TAU;
    const x = (bx + t * vx + Math.sin(t * 0.31 + ph) * 26) % W;
    const y = (by + t * vy + Math.cos(t * 0.23 + ph) * 18) % H;
    // weight towards the lamp cone
    const d = Math.hypot(x - W * 0.62, y - H * 0.3) / (H * 0.62);
    const light = Math.max(0, 1 - d);
    const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + r() * 1.6) + ph * 3);
    const a = 0.028 + 0.075 * light * light * tw;
    const sz = 1.2 + r() * 2.2;
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgb(255,224,178)';
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** the desk lamp breathing over the whole frame */
export function lampGlow(ctx, t) {
  const f = 0.045 + 0.016 * Math.sin(t * 1.7) + 0.010 * Math.sin(t * 4.3 + 1.2) + 0.006 * Math.sin(t * 9.1);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(W * 0.62, H * 0.24, 60, W * 0.58, H * 0.4, H * 0.85);
  g.addColorStop(0, `rgba(${BK.lamp},${f})`);
  g.addColorStop(0.6, `rgba(${BK.lamp},${f * 0.35})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** room layer: lamp breath + dust, drawn over the finished picture */
export function ambient(ctx, t, seed = 1) {
  lampGlow(ctx, t);
  dust(ctx, t, seed);
}

export const idNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
