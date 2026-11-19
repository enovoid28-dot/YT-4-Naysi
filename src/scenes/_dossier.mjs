// Episode 30 kit — "dossier": forensics lab paper on a dark cutting mat.
//
// The desk is a matte slate self-healing cutting mat (millimetre grid, worn
// blades lines, a warm pool of desk-lamp light). On it lie museum lab
// dossiers: warm millimetre graph paper with deckled edges, punch holes,
// vermillion stamps, typed case tabs and ink vector diagrams. Everything is
// baked once (paper, desk, glyphs) and blitted whole-pixel per frame.
//
// Scenes draw in two layers so the cut can deal one dossier over the last:
//   o.layer 'bg'   -> desk only
//   o.layer 'card' -> the sheet and its ink, under motion(local, scene, o)
// with no o.layer a scene draws both (the steady state).
import { createCanvas } from '@napi-rs/canvas';
import {
  bake, cue, cueEnd, P, eo, e3, io, ioq, sm, rgba, textW, rng, TAU, clamp, lerp, F, W, H, EASE, Path2D,
} from './_cyano.mjs';

export const DO = {
  desk: '#0B0E13',
  desk2: '#10141B',
  mat: 'rgba(214,222,232,0.055)',
  matMaj: 'rgba(214,222,232,0.10)',
  lamp: '255,214,150',
  paper: '#F2ECE0',
  paper2: '#E7DFCE',
  edge: '#C9BFA9',
  ink: '#241E15',
  ink2: 'rgba(36,30,21,0.62)',
  ink3: 'rgba(36,30,21,0.38)',
  graph: 'rgba(96,84,58,0.10)',
  graph5: 'rgba(96,84,58,0.20)',
  verm: '#C0392B',
  verm2: 'rgba(192,57,43,0.72)',
  blue: '#2E5B7B',
  green: '#3F7A5A',
  amber: '#B8791F',
  manila: '#D9C08E',
  bone: '#EDE6D8',
};

export { cue, cueEnd, P, eo, e3, io, ioq, sm, rgba, textW, rng, TAU, clamp, lerp, F, W, H, EASE, bake };

/* --------------------------------- desk ---------------------------------- */

/** the cutting mat: mm grid, worn blade cuts, lamp pool. baked once. */
export function deskLayer() {
  return bake('d30-desk', W + 240, H + 240, (c, cv) => {
    c.fillStyle = DO.desk;
    c.fillRect(0, 0, cv.width, cv.height);
    // slate mottle
    const r = rng(88);
    for (let i = 0; i < 260; i++) {
      const x = r() * cv.width;
      const y = r() * cv.height;
      const rad = 60 + r() * 260;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() > 0.5;
      g.addColorStop(0, dark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.016)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // millimetre grid of the self-healing mat
    c.lineWidth = 1;
    for (let x = 0; x < cv.width; x += 16) {
      c.strokeStyle = x % 80 === 0 ? DO.matMaj : DO.mat;
      c.beginPath();
      c.moveTo(x + 0.5, 0);
      c.lineTo(x + 0.5, cv.height);
      c.stroke();
    }
    for (let y = 0; y < cv.height; y += 16) {
      c.strokeStyle = y % 80 === 0 ? DO.matMaj : DO.mat;
      c.beginPath();
      c.moveTo(0, y + 0.5);
      c.lineTo(cv.width, y + 0.5);
      c.stroke();
    }
    // healed blade cuts
    for (let i = 0; i < 46; i++) {
      const x = r() * cv.width;
      const y = r() * cv.height;
      const a = r() * TAU;
      const len = 40 + r() * 320;
      c.strokeStyle = `rgba(255,255,255,${0.018 + r() * 0.02})`;
      c.lineWidth = 1 + r();
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      c.stroke();
    }
    // lamp pool from top-left
    const g = c.createRadialGradient(cv.width * 0.42, cv.height * 0.30, 120, cv.width * 0.46, cv.height * 0.44, cv.height * 0.86);
    g.addColorStop(0, `rgba(${DO.lamp},0.075)`);
    g.addColorStop(0.55, `rgba(${DO.lamp},0.028)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, cv.width, cv.height);
    // corner falloff
    const v = c.createRadialGradient(cv.width / 2, cv.height / 2, cv.height * 0.34, cv.width / 2, cv.height / 2, cv.height * 0.82);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.5)');
    c.fillStyle = v;
    c.fillRect(0, 0, cv.width, cv.height);
  });
}

/** draw the desk under a slow parallax; whole pixels only */
export function desk(ctx, cam = {}) {
  const cv = deskLayer();
  const dx = Math.round((cam.dx || 0) * 0.5) ;
  const dy = Math.round((cam.dy || 0) * 0.5);
  ctx.save();
  ctx.drawImage(cv, -120 + dx, -120 + dy);
  ctx.restore();
}

/* --------------------------------- paper --------------------------------- */

const MM = 12; // graph millimetre

/** warm millimetre graph paper with deckled edges, punch holes, foxing */
export function paperLayer(key, w, h, { holes = 3 } = {}) {
  return bake(`d30-paper-${key}-${w}x${h}-${holes}`, w + 80, h + 80, (c, cv) => {
    const x0 = 40;
    const y0 = 40;
    const r = rng(1200 + w + h);
    // deckled silhouette
    c.save();
    c.beginPath();
    const jag = (xa, ya, xb, yb) => {
      const n = Math.max(8, Math.round(Math.hypot(xb - xa, yb - ya) / 26));
      for (let i = 0; i <= n; i++) {
        const p = i / n;
        const nx = -(yb - ya);
        const ny = xb - xa;
        const nl = Math.hypot(nx, ny) || 1;
        const o = (r() - 0.5) * 5;
        c.lineTo(xa + (xb - xa) * p + (nx / nl) * o, ya + (yb - ya) * p + (ny / nl) * o);
      }
    };
    c.moveTo(x0, y0);
    jag(x0, y0, x0 + w, y0);
    jag(x0 + w, y0, x0 + w, y0 + h);
    jag(x0 + w, y0 + h, x0, y0 + h);
    jag(x0, y0 + h, x0, y0);
    c.closePath();
    c.shadowColor = 'rgba(0,0,0,0.55)';
    c.shadowBlur = 34;
    c.shadowOffsetY = 16;
    c.fillStyle = DO.paper;
    c.fill();
    c.shadowColor = 'rgba(0,0,0,0)';
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
    c.clip();
    // warm gradient + fibre
    const g = c.createLinearGradient(x0, y0, x0 + w * 0.7, y0 + h);
    g.addColorStop(0, 'rgba(255,252,244,0.75)');
    g.addColorStop(0.5, 'rgba(231,223,206,0.35)');
    g.addColorStop(1, 'rgba(214,203,180,0.5)');
    c.fillStyle = g;
    c.fillRect(x0, y0, w, h);
    for (let i = 0; i < 900; i++) {
      const x = x0 + r() * w;
      const y = y0 + r() * h;
      c.fillStyle = r() > 0.5 ? 'rgba(120,102,70,0.05)' : 'rgba(255,255,255,0.06)';
      c.fillRect(x, y, 1 + r() * 2, 1);
    }
    // foxing spots
    for (let i = 0; i < 26; i++) {
      const x = x0 + r() * w;
      const y = y0 + r() * h;
      const rad = 4 + r() * 26;
      const fg = c.createRadialGradient(x, y, 0, x, y, rad);
      fg.addColorStop(0, 'rgba(150,120,70,0.055)');
      fg.addColorStop(1, 'rgba(150,120,70,0)');
      c.fillStyle = fg;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // millimetre graph
    c.lineWidth = 1;
    for (let x = x0; x <= x0 + w; x += MM) {
      c.strokeStyle = (x - x0) % (MM * 5) === 0 ? DO.graph5 : DO.graph;
      c.beginPath();
      c.moveTo(x + 0.5, y0);
      c.lineTo(x + 0.5, y0 + h);
      c.stroke();
    }
    for (let y = y0; y <= y0 + h; y += MM) {
      c.strokeStyle = (y - y0) % (MM * 5) === 0 ? DO.graph5 : DO.graph;
      c.beginPath();
      c.moveTo(x0, y + 0.5);
      c.lineTo(x0 + w, y + 0.5);
      c.stroke();
    }
    // punch holes
    if (holes) {
      for (let i = 0; i < holes; i++) {
        const y = y0 + h * (0.22 + 0.28 * i);
        c.save();
        c.globalCompositeOperation = 'destination-out';
        c.beginPath();
        c.arc(x0 + 46, y, 15, 0, TAU);
        c.fill();
        c.restore();
        c.strokeStyle = 'rgba(60,50,34,0.35)';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(x0 + 46, y, 16, 0, TAU);
        c.stroke();
      }
    }
    c.restore();
    // deckle rim light
    c.strokeStyle = 'rgba(255,252,240,0.5)';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(x0 + 2, y0 + 1.5);
    c.lineTo(x0 + w - 2, y0 + 1.5);
    c.stroke();
  });
}

/** blit a paper layer so its paper rect (w,h) sits at (x,y) */
export function drawPaper(ctx, key, x, y, w, h, opts = {}) {
  const cv = paperLayer(key, w, h, opts);
  ctx.drawImage(cv, Math.round(x) - 40, Math.round(y) - 40);
}

/* ------------------------------ sheet motion ------------------------------ */

export const D_DEAL = 0.46;

/** entry/exit state of a dossier sheet at a cut */
export function motion(local, scene, o = {}) {
  const deal = o.deal ?? 0;      // 1 -> still off table, 0 -> landed
  const exit = o.exit ?? 0;      // 0 -> on table, 1 -> pulled away
  const e = 1 - EASE.outQuint(clamp(deal));
  const x = exit > 0 ? EASE.inQuad(clamp(exit)) : 0;
  return {
    // entry: drops from above-right with a touch of rotation, settles
    dx: Math.round(deal > 0 ? 260 * deal + 40 * deal * deal : -340 * x),
    dy: Math.round(deal > 0 ? -520 * deal * deal : -120 * x),
    rot: deal > 0 ? -0.05 * deal : -0.035 * x,
    a: deal > 0 ? clamp(1 - deal * 0.25) : 1 - x * 0.9,
    lift: deal > 0 ? deal : x,
    landed: e,
  };
}

/** run fn under the sheet transform (shadow follows the lift) */
export function withSheet(ctx, m, fn) {
  ctx.save();
  ctx.globalAlpha *= m.a;
  ctx.translate(W / 2 + m.dx, H / 2 + m.dy);
  ctx.rotate(m.rot);
  ctx.translate(-W / 2, -H / 2);
  fn();
  ctx.restore();
}

/* ------------------------------ ink on paper ------------------------------ */

export function typed(ctx, s, x, y, { size = 30, font = F.mono6, color = DO.ink, track = 2, a = 1, p = 1, align = 'left' } = {}) {
  if (p <= 0.001 || a <= 0.001) return 0;
  const n = Math.round(s.length * clamp(p));
  const shown = s.slice(0, n);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `${size}px ${font}`;
  ctx.letterSpacing = `${track}px`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = align;
  ctx.fillText(shown, x, y);
  // typing caret while revealing
  if (p < 1) {
    const w = ctx.measureText(shown).width;
    const cx = align === 'left' ? x + w : align === 'right' ? x - w : x + w / 2;
    ctx.fillStyle = DO.verm;
    ctx.globalAlpha *= 0.5 + 0.5 * Math.sin(p * 90);
    ctx.fillRect(cx + 3, y - size * 0.78, size * 0.12 + 2, size * 0.82);
  }
  ctx.restore();
  return textW(ctx, s, size, font, track);
}

export function hand(ctx, s, x, y, { size = 44, color = DO.blue, a = 1, p = 1, rot = -0.02, font = F.serif } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `italic ${size}px ${font}`;
  ctx.fillStyle = color;
  const n = Math.round(s.length * clamp(p));
  ctx.fillText(s.slice(0, n), 0, 0);
  ctx.restore();
}

export function ruleI(ctx, x0, x1, y, p = 1, { color = DO.ink3, lw = 2, ticks = 0, a = 1 } = {}) {
  if (p <= 0.001) return;
  const x = x0 + (x1 - x0) * clamp(p);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x, y);
  ctx.stroke();
  if (ticks) {
    for (let tx = x0; tx <= x; tx += ticks) {
      ctx.beginPath();
      ctx.moveTo(tx + 0.5, y - 5);
      ctx.lineTo(tx + 0.5, y + 5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function leaderI(ctx, x0, y0, x1, y1, p, { color = DO.ink2, lw = 2, dot = 5, elbow = null, a = 0.9 } = {}) {
  if (p <= 0.001) return;
  const pts = elbow ? [[x0, y0], elbow, [x1, y1]] : [[x0, y0], [x1, y1]];
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let rem = p;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const seg = 1 / (pts.length - 1);
    const q = clamp(rem / seg);
    ctx.lineTo(ax + (bx - ax) * q, ay + (by - ay) * q);
    rem -= seg;
    if (q < 1) break;
  }
  ctx.stroke();
  if (p > 0.98) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x0, y0, dot, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** vermillion rubber stamp, grunged, kicks in with an overscale */
export function stamp(ctx, s, x, y, { p = 1, rot = -0.12, size = 74, color = DO.verm, box = true, a = 0.86 } = {}) {
  if (p <= 0.001) return;
  const k = EASE.outBack ? EASE.outBack(clamp(p)) : eo(clamp(p));
  const sc = 1.5 - 0.5 * k;
  ctx.save();
  ctx.globalAlpha *= a * clamp(p * 2);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  ctx.font = `700 ${size}px ${F.head}`;
  ctx.letterSpacing = '6px';
  const w = ctx.measureText(s).width;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (box) {
    ctx.lineWidth = 7;
    ctx.strokeRect(-w / 2 - 34, -size * 0.86, w + 68, size * 1.24);
    ctx.lineWidth = 3;
    ctx.strokeRect(-w / 2 - 22, -size * 0.86 + 11, w + 44, size * 1.24 - 22);
  }
  ctx.textAlign = 'center';
  ctx.fillText(s, 0, 0);
  // grunge: knock ink out with speckles
  ctx.globalCompositeOperation = 'destination-out';
  const r = rng(s.length * 77 + 5);
  for (let i = 0; i < 130; i++) {
    const gx = -w / 2 - 34 + r() * (w + 68);
    const gy = -size * 0.9 + r() * size * 1.35;
    c2(ctx, gx, gy, 0.6 + r() * 2.6);
  }
  ctx.restore();
}
function c2(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

/** manila evidence tag with string */
export function tag(ctx, x, y, w, h, { p = 1, rot = 0.06, a = 1 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a * clamp(p * 1.6);
  ctx.translate(x, y);
  ctx.rotate(rot * (1.4 - p));
  const sc = 0.9 + 0.1 * eo(clamp(p));
  ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = DO.manila;
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.lineTo(0, 26);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.strokeStyle = 'rgba(90,70,40,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // eyelet
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(34, h / 2, 9, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(90,70,40,0.6)';
  ctx.beginPath();
  ctx.arc(34, h / 2, 10, 0, TAU);
  ctx.stroke();
  // string
  ctx.strokeStyle = 'rgba(220,214,196,0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(34, h / 2);
  ctx.quadraticCurveTo(-60, h / 2 - 60, -120, h / 2 + 30);
  ctx.stroke();
  ctx.restore();
}

/** case tab riveted to the sheet top */
export function caseTab(ctx, x, y, s, p = 1, { color = DO.verm } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.5);
  ctx.font = `700 30px ${F.mono6}`;
  ctx.letterSpacing = '3px';
  const w = ctx.measureText(s).width + 56;
  const h = 58;
  const dx = -14 * (1 - eo(clamp(p)));
  ctx.translate(dx, 0);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - 16, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x + w - 16, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = DO.paper;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x + 26, y + h / 2 + 2);
  ctx.restore();
}

export function paperclip(ctx, x, y, { p = 1, rot = 0.2, s = 1 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.6);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(190,196,204,0.9)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 120);
  ctx.arc(14, 120, 14, Math.PI, 0, true);
  ctx.lineTo(28, 26);
  ctx.arc(17, 26, 11, 0, Math.PI, true);
  ctx.lineTo(6, 108);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------- ink diagrams ----------------------------- */

/** molar: crown with enamel cap + two roots; enamel band lights up at ep */
export function tooth(ctx, x, y, s, { p = 1, ep = 0, ink = DO.ink, glow = DO.verm } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * eo(clamp(p)), s * eo(clamp(p)));
  ctx.lineJoin = 'round';
  const crown = new Path2D();
  crown.moveTo(-96, -20);
  crown.bezierCurveTo(-108, -120, -60, -168, 0, -168);
  crown.bezierCurveTo(60, -168, 108, -120, 96, -20);
  crown.bezierCurveTo(88, 26, 60, 40, 40, 44);
  crown.lineTo(-40, 44);
  crown.bezierCurveTo(-60, 40, -88, 26, -96, -20);
  crown.closePath();
  const rootL = new Path2D();
  rootL.moveTo(-52, 40);
  rootL.bezierCurveTo(-64, 110, -58, 168, -40, 208);
  rootL.bezierCurveTo(-30, 226, -14, 224, -10, 202);
  rootL.bezierCurveTo(-4, 160, -8, 100, -12, 44);
  rootL.closePath();
  const rootR = new Path2D();
  rootR.moveTo(52, 40);
  rootR.bezierCurveTo(64, 110, 58, 168, 40, 208);
  rootR.bezierCurveTo(30, 226, 14, 224, 10, 202);
  rootR.bezierCurveTo(4, 160, 8, 100, 12, 44);
  rootR.closePath();
  ctx.fillStyle = 'rgba(36,30,21,0.06)';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  for (const pa of [crown, rootL, rootR]) {
    ctx.fill(pa);
    ctx.stroke(pa);
  }
  // enamel cap: the locked layer
  ctx.save();
  ctx.clip(crown);
  ctx.strokeStyle = glow;
  ctx.lineWidth = 26;
  ctx.globalAlpha *= 0.25 + 0.75 * clamp(ep);
  ctx.beginPath();
  ctx.moveTo(-92, -34);
  ctx.bezierCurveTo(-102, -122, -58, -160, 0, -160);
  ctx.bezierCurveTo(58, -160, 102, -122, 92, -34);
  ctx.stroke();
  // growth lines (perikymata)
  ctx.globalAlpha *= 0.5;
  ctx.lineWidth = 2;
  ctx.strokeStyle = ink;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-88 + i * 4, -30 - i * 4);
    ctx.bezierCurveTo(-92 + i * 4, -118 + i * 8, -50, -150 + i * 9, 0, -150 + i * 9);
    ctx.stroke();
  }
  ctx.restore();
  // pulp chamber
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-26, 30);
  ctx.bezierCurveTo(-20, -30, 20, -30, 26, 30);
  ctx.stroke();
  ctx.restore();
}

/** mushroom cloud silhouette in vermillion ink */
export function cloudGlyph(ctx, x, y, s, p = 1, { color = DO.verm } = {}) {
  if (p <= 0.001) return;
  const q = eo(clamp(p));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s * q);
  ctx.fillStyle = color;
  ctx.globalAlpha *= 0.9;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.bezierCurveTo(-26, -60, -20, -96, -34, -118);
  ctx.bezierCurveTo(-86, -124, -96, -176, -58, -196);
  ctx.bezierCurveTo(-52, -232, 52, -232, 58, -196);
  ctx.bezierCurveTo(96, -176, 86, -124, 34, -118);
  ctx.bezierCurveTo(20, -96, 26, -60, 14, 0);
  ctx.closePath();
  ctx.fill();
  // ground shockwave
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.globalAlpha *= 0.7;
  ctx.beginPath();
  ctx.ellipse(0, 6, 90 * q, 14 * q, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** cooling-tower / chimney with a plume */
export function stackGlyph(ctx, x, y, s, p = 1, t = 0, { color = DO.ink2 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.fillStyle = 'rgba(36,30,21,0.08)';
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-16, -120);
  ctx.lineTo(16, -120);
  ctx.lineTo(26, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // plume
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const ph = t * 0.8 + i * 1.7;
    ctx.globalAlpha = 0.5 * clamp(p) * (1 - i * 0.18);
    ctx.beginPath();
    ctx.moveTo(0, -124);
    ctx.bezierCurveTo(
      -18 - i * 8 + Math.sin(ph) * 6, -160 - i * 26,
      22 + i * 10 + Math.cos(ph) * 8, -190 - i * 30,
      -6 + i * 4 + Math.sin(ph * 1.3) * 10, -230 - i * 34,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** cell glyph: membrane, nucleus; kind tweaks the interior */
export function cellGlyph(ctx, x, y, r, { p = 1, kind = 'gut', ink = DO.ink, acc = DO.blue, t = 0 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  const q = eo(clamp(p));
  ctx.scale(q, q);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(46,91,123,0.08)';
  ctx.beginPath();
  // wobbly membrane
  for (let a = 0; a <= TAU + 0.01; a += 0.22) {
    const rr = r * (1 + 0.05 * Math.sin(a * 3 + t * 0.7) + 0.03 * Math.sin(a * 5));
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = acc;
  ctx.lineWidth = 3;
  if (kind === 'gut') {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.3 + 0.2 * i), 0.4 + i, 3.6 + i);
      ctx.stroke();
    }
  } else if (kind === 'fat') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.62, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-r * 0.55, -r * 0.2, r * 0.16, 0, TAU);
    ctx.stroke();
  } else {
    // heart: striations
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, i * r * 0.26);
      ctx.bezierCurveTo(-r * 0.2, i * r * 0.26 - 8, r * 0.2, i * r * 0.26 + 8, r * 0.7, i * r * 0.26);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** dial clock whose face dims (the Suess switch-off) */
export function clockDial(ctx, x, y, r, { p = 1, dim = 0, ang = -0.6, ink = DO.ink, acc = DO.verm } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha *= eo(clamp(p));
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82);
    ctx.lineTo(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92);
    ctx.stroke();
  }
  ctx.strokeStyle = acc;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(ang) * r * 0.66, Math.sin(ang) * r * 0.66);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, TAU);
  ctx.fill();
  if (dim > 0.001) {
    ctx.globalAlpha *= dim;
    ctx.fillStyle = DO.paper;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.02, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** code-drawn cubist canvas (planes + guitar hint), framed */
export function cubistCanvas(ctx, x, y, w, h, { p = 1, seed = 7 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha *= eo(clamp(p));
  // stretcher + frame
  ctx.fillStyle = '#8A6B3F';
  ctx.fillRect(-16, -16, w + 32, h + 32);
  ctx.fillStyle = '#5E4626';
  ctx.fillRect(-8, -8, w + 16, h + 16);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  ctx.fillStyle = '#CBB894';
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  const pal = ['#8C7A5B', '#A6906A', '#6E6146', '#B9A87F', '#77684C', '#94825F', '#5C5138', '#C2B28C'];
  for (let i = 0; i < 26; i++) {
    const cx = r() * w;
    const cy = r() * h;
    const pw = 40 + r() * w * 0.42;
    const ph = 40 + r() * h * 0.4;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((r() - 0.5) * 0.9);
    ctx.fillStyle = pal[Math.floor(r() * pal.length)];
    ctx.globalAlpha = 0.5 + r() * 0.5;
    ctx.beginPath();
    ctx.moveTo(-pw / 2, -ph / 2);
    ctx.lineTo(pw / 2 - r() * 24, -ph / 2 + r() * 18);
    ctx.lineTo(pw / 2, ph / 2);
    ctx.lineTo(-pw / 2 + r() * 20, ph / 2 - r() * 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // guitar sound-hole + strings hint
  ctx.strokeStyle = 'rgba(40,32,20,0.8)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(w * 0.56, h * 0.58, h * 0.13, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * (0.3 + i * 0.05));
    ctx.lineTo(w * 0.92, h * (0.26 + i * 0.06));
    ctx.stroke();
  }
  // craquelure
  ctx.strokeStyle = 'rgba(50,40,24,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    let cx = r() * w;
    let cy = r() * h;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let k = 0; k < 4; k++) {
      cx += (r() - 0.5) * 46;
      cy += (r() - 0.5) * 46;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

/** tusk: curved cone with growth arcs; bomb-curve band lights at bp */
export function tusk(ctx, x, y, s, { p = 1, bp = 0, ink = DO.ink, acc = DO.verm, rot = -0.06 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // shear: a tusk curves along its length
  ctx.transform(1, 0, -0.3, 1, 40, 0);
  ctx.scale(s * eo(clamp(p)), s * eo(clamp(p)));
  ctx.lineJoin = 'round';
  const body = new Path2D();
  body.moveTo(0, -230);
  body.bezierCurveTo(70, -180, 96, -60, 84, 60);
  body.bezierCurveTo(76, 150, 40, 210, 0, 230);
  body.bezierCurveTo(-40, 210, -76, 150, -84, 60);
  body.bezierCurveTo(-96, -60, -70, -180, 0, -230);
  body.closePath();
  ctx.fillStyle = 'rgba(36,30,21,0.06)';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.fill(body);
  ctx.stroke(body);
  ctx.save();
  ctx.clip(body);
  // growth rings, denser at the base (new ivory); arcs bow toward the tip
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    const yy = 210 - i * 26 - i * i * 0.4;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(0, yy + 10, 84 - i * 3.4, 18, 0, Math.PI, TAU);
    ctx.stroke();
  }
  // the newly deposited band at the pulp base
  ctx.globalAlpha = 0.3 + 0.7 * clamp(bp);
  ctx.strokeStyle = acc;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.ellipse(0, 200, 62, 20, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/** axis box on paper with ink ticks + labels via typed() */
export function axisBox(ctx, x, y, w, h, p = 1, { ink = DO.ink2 } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 1.4);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w * clamp(p), y + h);
  ctx.stroke();
  ctx.restore();
}

/** draw-on polyline in ink; pts in px */
export function curveInk(ctx, pts, p, { color = DO.verm, lw = 6, dot = 0, a = 1 } = {}) {
  if (p <= 0.001 || pts.length < 2) return;
  const n = Math.max(2, Math.round(pts.length * clamp(p)));
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  if (dot && p >= 1) {
    const [lx, ly] = pts[pts.length - 1];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lx, ly, dot, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** black censor bar sliding over a line of type */
export function redact(ctx, x, y, w, h, p = 1) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.fillStyle = 'rgba(12,10,8,0.92)';
  ctx.fillRect(x, y, w * eo(clamp(p)), h);
  ctx.restore();
}

export const idNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
