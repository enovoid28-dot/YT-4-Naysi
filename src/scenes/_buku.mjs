// Episode 31 kit — "textbook": a worn school biology book on a walnut desk,
// corrected in red pen. Printed plates in faded blue ink, greeked body text,
// folios and chapter bands; over it a teacher's red pen: circles, crosses,
// arrows, margin notes and a hand-stamped verdict. Everything baked once.
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
  return bake('d31-desk', W + 240, H + 240, (c, cv) => {
    c.fillStyle = BK.desk;
    c.fillRect(0, 0, cv.width, cv.height);
    const r = rng(5150);
    // walnut planks: vertical grain
    for (let x = 0; x < cv.width; x += 3) {
      const n = 0.5 + 0.5 * Math.sin(x / 26 + Math.sin(x / 97) * 3);
      c.fillStyle = `rgba(255,190,120,${0.012 + 0.02 * n})`;
      c.fillRect(x, 0, 2, cv.height);
    }
    for (let i = 0; i < 90; i++) {
      const x = r() * cv.width;
      const w2 = 1 + r() * 3;
      c.strokeStyle = `rgba(20,8,4,${0.10 + r() * 0.16})`;
      c.lineWidth = w2;
      c.beginPath();
      let yy = -20;
      c.moveTo(x, yy);
      while (yy < cv.height + 20) {
        yy += 60 + r() * 90;
        c.lineTo(x + (r() - 0.5) * 26, yy);
      }
      c.stroke();
    }
    // plank seams
    for (let x = 260; x < cv.width; x += 520) {
      c.strokeStyle = 'rgba(10,4,2,0.5)';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x + (r() - 0.5) * 8, 0);
      c.lineTo(x + (r() - 0.5) * 8, cv.height);
      c.stroke();
    }
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

/* --------------------------------- page ---------------------------------- */

/** a textbook page: cream stock, double rule, chapter band, greeked columns */
export function pageLayer(key, w, h, { folio = '128', chapter = 'BAB VII · INDERA PERASA' } = {}) {
  return bake(`d31-page-${key}-${w}x${h}`, w + 80, h + 80, (c, cv) => {
    const x0 = 40;
    const y0 = 40;
    const r = rng(3300 + w);
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
    // folio
    c.font = `24px ${F.mono6}`;
    c.fillStyle = BK.ink2;
    c.textAlign = 'right';
    c.fillText(folio, x0 + w - 84, y0 + h - 74);
    c.textAlign = 'left';
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
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = lw;
  ctx.globalAlpha *= 0.9;
  const a1 = -0.6 + TAU * clamp(p) * 1.06;
  ctx.beginPath();
  for (let a = -0.6; a < a1; a += 0.055) {
    const wob = 1 + 0.035 * Math.sin(a * 3.1) + 0.02 * Math.sin(a * 7.7);
    const px = Math.cos(a) * rx * wob;
    const py = Math.sin(a) * ry * wob;
    if (a === -0.6) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

/** a bold pen cross */
export function penX(ctx, cx, cy, s, p = 1, { color = BK.pen, lw = 12 } = {}) {
  if (p <= 0.001) return;
  const q = eo(clamp(p));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = lw;
  ctx.globalAlpha *= 0.92;
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s);
  ctx.lineTo(cx - s + 2 * s * q, cy - s + 2 * s * q);
  ctx.stroke();
  const q2 = eo(clamp(p * 1.3 - 0.3));
  if (q2 > 0) {
    ctx.beginPath();
    ctx.moveTo(cx + s, cy - s);
    ctx.lineTo(cx + s - 2 * s * q2, cy - s + 2 * s * q2);
    ctx.stroke();
  }
  ctx.restore();
}

/** pen arrow with a curved shaft */
export function penArrow(ctx, x0, y0, x1, y1, p = 1, { color = BK.pen, lw = 6, bow = 0.22 } = {}) {
  if (p <= 0.001) return;
  const q = eo(clamp(p));
  const mx = (x0 + x1) / 2 - (y1 - y0) * bow;
  const my = (y0 + y1) / 2 + (x1 - x0) * bow;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = lw;
  ctx.globalAlpha *= 0.92;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  // quadratic sampled to q
  const N = 24;
  for (let i = 1; i <= N * q; i++) {
    const u = i / N;
    const px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1;
    const py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
    ctx.lineTo(px, py);
  }
  ctx.stroke();
  if (q > 0.97) {
    const a = Math.atan2(y1 - my, x1 - mx);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - Math.cos(a - 0.45) * 26, y1 - Math.sin(a - 0.45) * 26);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - Math.cos(a + 0.45) * 26, y1 - Math.sin(a + 0.45) * 26);
    ctx.stroke();
  }
  ctx.restore();
}

/** wavy pen underline */
export function penUnder(ctx, x, y, w, p = 1, { color = BK.pen, lw = 5 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = lw;
  ctx.globalAlpha *= 0.9;
  ctx.beginPath();
  const n = Math.round(30 * clamp(p));
  for (let i = 0; i <= n; i++) {
    const u = i / 30;
    const px = x + u * w;
    const py = y + Math.sin(u * 22) * 4;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

/** handwritten margin note */
export function margin(ctx, s, x, y, { size = 40, color = BK.pen, p = 1, rot = -0.03, font = F.italic6 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.4);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = color;
  const n = Math.round(s.length * clamp(p));
  ctx.fillText(s.slice(0, n), 0, 0);
  ctx.restore();
}

/** hand stamp: double ring + word, ink pressed unevenly */
export function handStamp(ctx, s, x, y, { p = 1, rot = -0.14, size = 66, color = BK.pen } = {}) {
  if (p <= 0.001) return;
  const k = eo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2) * 0.9;
  ctx.translate(x, y);
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
  // pressed-ink speckle
  ctx.globalCompositeOperation = 'destination-out';
  const r = rng(s.length * 31 + 9);
  for (let i = 0; i < 110; i++) {
    ctx.beginPath();
    ctx.arc(-w / 2 - 40 + r() * (w + 80), -size + r() * size * 1.5, 0.6 + r() * 2.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/* ----------------------------- printed glyphs ----------------------------- */

/** classic textbook tongue with the four mythical zones */
export function tongueMap(ctx, x, y, s, p = 1, { zones = true, ink = BK.print } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * eo(clamp(p)), s * eo(clamp(p)));
  const out = new Path2D();
  out.moveTo(0, -250);
  out.bezierCurveTo(120, -250, 168, -120, 160, 40);
  out.bezierCurveTo(152, 180, 90, 260, 0, 268);
  out.bezierCurveTo(-90, 260, -152, 180, -160, 40);
  out.bezierCurveTo(-168, -120, -120, -250, 0, -250);
  out.closePath();
  ctx.fillStyle = 'rgba(44,74,102,0.07)';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.fill(out);
  ctx.stroke(out);
  // median groove
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -230);
  ctx.bezierCurveTo(8, -80, -8, 80, 0, 240);
  ctx.stroke();
  if (zones) {
    ctx.save();
    ctx.clip(out);
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 9]);
    ctx.strokeStyle = ink;
    // tip zone
    ctx.beginPath();
    ctx.moveTo(-160, 120);
    ctx.bezierCurveTo(-60, 90, 60, 90, 160, 120);
    ctx.stroke();
    // back zone
    ctx.beginPath();
    ctx.moveTo(-164, -110);
    ctx.bezierCurveTo(-60, -80, 60, -80, 164, -110);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  ctx.restore();
}

/** papilla cross-section with an onion-shaped taste bud */
export function budSection(ctx, x, y, s, p = 1, { ink = BK.print, glow = 0 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * eo(clamp(p)), s * eo(clamp(p)));
  // epithelium block
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(44,74,102,0.06)';
  ctx.beginPath();
  ctx.moveTo(-190, 150);
  ctx.lineTo(-190, 10);
  ctx.bezierCurveTo(-120, 6, -80, -6, -56, -60);
  ctx.bezierCurveTo(-30, -110, 30, -110, 56, -60);
  ctx.bezierCurveTo(80, -6, 120, 6, 190, 10);
  ctx.lineTo(190, 150);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // the bud: onion of cells
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, -20, 52, 92, 0, 0, TAU);
  ctx.clip();
  ctx.lineWidth = 3;
  for (let i = -3; i <= 3; i++) {
    ctx.strokeStyle = i === 0 ? BK.pen : ink;
    ctx.globalAlpha = i === 0 ? 0.5 + 0.5 * glow : 0.8;
    ctx.beginPath();
    ctx.moveTo(i * 14, 70);
    ctx.bezierCurveTo(i * 16, 0, i * 10, -60, i * 4, -104);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, -20, 52, 92, 0, 0, TAU);
  ctx.stroke();
  // pore
  ctx.beginPath();
  ctx.moveTo(-14, -108);
  ctx.lineTo(14, -108);
  ctx.stroke();
  // nerve
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 72);
  ctx.bezierCurveTo(-10, 110, 10, 130, 0, 150);
  ctx.stroke();
  ctx.restore();
}

/** simple cat head silhouette */
export function catGlyph(ctx, x, y, s, p = 1, { ink = BK.ink } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * eo(clamp(p)), s * eo(clamp(p)));
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.fillStyle = 'rgba(38,34,27,0.08)';
  ctx.beginPath();
  ctx.moveTo(-90, -40);
  ctx.lineTo(-110, -150);
  ctx.lineTo(-38, -96);
  ctx.bezierCurveTo(-14, -108, 14, -108, 38, -96);
  ctx.lineTo(110, -150);
  ctx.lineTo(90, -40);
  ctx.bezierCurveTo(96, 40, 50, 96, 0, 100);
  ctx.bezierCurveTo(-50, 96, -96, 40, -90, -40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // eyes + whiskers
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-38, -20, 12, 0, TAU);
  ctx.arc(38, -20, 12, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  for (const sgn of [-1, 1]) {
    ctx.moveTo(sgn * 60, 20);
    ctx.lineTo(sgn * 150, 6);
    ctx.moveTo(sgn * 60, 36);
    ctx.lineTo(sgn * 150, 40);
  }
  ctx.stroke();
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

/** printed bar chart with near-equal bars (Hänig's real data) */
export function barsEqual(ctx, x, y, w, h, p = 1, { ink = BK.print, vals = [0.92, 0.86, 0.9, 0.88, 0.94, 0.87] } = {}) {
  if (p <= 0.001) return;
  const n = Math.round(vals.length * clamp(p));
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  const bw = w / vals.length;
  for (let i = 0; i < n; i++) {
    const bh = h * vals[i] * eo(clamp(p * vals.length - i));
    ctx.fillStyle = 'rgba(44,74,102,0.35)';
    ctx.fillRect(x + i * bw + bw * 0.2, y + h - bh, bw * 0.6, bh);
    ctx.strokeRect(x + i * bw + bw * 0.2, y + h - bh, bw * 0.6, bh);
  }
  ctx.restore();
}

/** the myth version: spiky zone bars (Boring's redraw) */
export function barsZones(ctx, x, y, w, h, p = 1, { ink = BK.pen, vals = [1, 0.06, 0.04, 0.05, 0.08, 0.9] } = {}) {
  return barsEqual(ctx, x, y, w, h, p, { ink, vals });
}

/** printed timeline rule with year ticks */
export function yearRule(ctx, x0, x1, y, p = 1, { ink = BK.print } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.6);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x0 + (x1 - x0) * clamp(p), y);
  ctx.stroke();
  ctx.restore();
}

export const idNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
