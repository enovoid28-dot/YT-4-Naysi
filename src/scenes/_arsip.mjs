// Episode 18 kit — "ARSIP GELAP": an archivist's table.
//
// Everything on screen is drawn with paths: ink, hatching, halftone, parchment
// and brass. No bitmaps, no 3D. Realistic in proportion and light (a crib has
// slats that catch light, a cassette has screws and a tape path, a brain has
// gyri that cast a shadow), but flat in execution — a printed plate, not a
// render.
//
// Conventions: y is a baseline for txt(), scenes draw inside x∈[104,1336] and
// y∈[200,1560] because the caption block owns everything below 1600.

import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, txt, hexA, mixHex, rr, fillRR, strokeRR, linGrad, radGrad, measure,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';

export const K = {
  bg: '#080706',
  bg1: '#100D0B',
  desk: '#1A1410',
  desk2: '#2A2018',
  wood: '#3A2A1D',
  bone: '#F4EBDA',
  bone2: '#CDBFA6',
  bone3: '#A7977E',
  dim: 'rgba(244,235,218,0.40)',
  dimmer: 'rgba(244,235,218,0.20)',
  ink: '#0A0908',
  paper: '#E3D8C2',
  paper2: '#CFC0A4',
  red: '#C33A26',
  red2: '#8C2013',
  redHi: '#E2563C',
  gold: '#C6A052',
  gold2: '#7B6128',
  teal: '#7FA79C',
};

export const ease = {
  out: EASE.outCubic,
  expo: EASE.outExpo,
  quint: EASE.outQuint,
  smooth: EASE.smooth,
  back: EASE.outBackSoft,
  inOut: EASE.inOutQuad,
};

/** Scene-local time of caption card `i` (+ offset). */
export const cue = (scene, i, off = 0) => {
  const c = scene && scene.captions && scene.captions[i];
  const base = c ? c.from : 0;
  return Math.max(0, base + off - (i === 0 ? 0.26 : 0));
};

export const A = (t, start, dur = 0.6, fn = ease.out) => fn(clamp((t - start) / dur));

// ── plates ──────────────────────────────────────────────────────────────────
const plates = new Map();
/** Memoised offscreen drawing: static art is rasterised once, drawn per frame. */
export function plate(key, w, h, fn) {
  let c = plates.get(key);
  if (!c) {
    c = createCanvas(Math.ceil(w), Math.ceil(h));
    const g = c.getContext('2d');
    fn(g);
    plates.set(key, c);
  }
  return c;
}

export const resetPlates = () => plates.clear();

// ── the desk ────────────────────────────────────────────────────────────────
/**
 * Dark wooden table under one warm lamp. The grain is drawn, not textured, so
 * it holds up at 90 fps without a single image.
 */
export function desk(ctx, { lampX = W * 0.34, lampY = 470, key = 'a', warm = 1 } = {}) {
  const c = plate(`desk-${key}-${Math.round(lampX)}-${Math.round(lampY)}`, W, H, (g) => {
    const base = g.createLinearGradient(0, 0, W * 0.4, H);
    base.addColorStop(0, '#191310');
    base.addColorStop(0.55, '#120E0C');
    base.addColorStop(1, '#0A0807');
    g.fillStyle = base;
    g.fillRect(0, 0, W, H);

    // wood grain: long, slightly wandering fibres
    const r = rng(31);
    for (let i = 0; i < 120; i++) {
      const y0 = -H * 0.1 + r() * H * 1.2;
      const amp = 8 + r() * 40;
      const light = r() > 0.55;
      g.strokeStyle = light ? 'rgba(120,84,52,0.055)' : 'rgba(0,0,0,0.16)';
      g.lineWidth = 0.8 + r() * 2.6;
      g.beginPath();
      g.moveTo(-80, y0);
      for (let x = 0; x <= W + 160; x += 160) {
        g.quadraticCurveTo(x + 40, y0 + Math.sin((x + i * 37) * 0.0021) * amp, x + 160, y0 + Math.sin((x + i * 41) * 0.0017) * amp * 0.6);
      }
      g.stroke();
    }

    // the lamp pool
    const lg = g.createRadialGradient(lampX, lampY, 40, lampX, lampY, 1420);
    lg.addColorStop(0, `rgba(255,196,120,${0.19 * warm})`);
    lg.addColorStop(0.35, `rgba(226,150,80,${0.10 * warm})`);
    lg.addColorStop(0.72, `rgba(150,92,44,${0.035 * warm})`);
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lg;
    g.fillRect(0, 0, W, H);

    // a soft top light so the chrome at 96-115 has room to sit
    const tg = g.createLinearGradient(0, 0, 0, 320);
    tg.addColorStop(0, 'rgba(255,214,160,0.05)');
    tg.addColorStop(1, 'rgba(255,214,160,0)');
    g.fillStyle = tg;
    g.fillRect(0, 0, W, 320);

    // dust: a fixed sprinkle, so it reads as the same table in every scene
    const d = rng(77);
    for (let i = 0; i < 260; i++) {
      const x = d() * W;
      const y = d() * H;
      const rr2 = 0.5 + d() * 1.9;
      g.fillStyle = `rgba(255,226,186,${0.03 + d() * 0.09})`;
      g.beginPath();
      g.arc(x, y, rr2, 0, TAU);
      g.fill();
    }
  });
  ctx.drawImage(c, 0, 0);
}

/** Contact shadow under an object sitting on the desk. */
export function contact(ctx, x, y, w, h, a = 0.5) {
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.62);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(0.6, `rgba(0,0,0,${a * 0.42})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(1, (h / Math.max(1, w)) * 0.9);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, Math.max(w, h) * 0.62, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ── marks ───────────────────────────────────────────────────────────────────
/** Parallel engraved lines clipped to a shape: the core of the "print" look. */
export function hatch(ctx, box, pathFn, { angle = -0.72, step = 11, lw = 1.5, color = '#000', a = 0.32 } = {}) {
  const { x, y, w, h } = box;
  ctx.save();
  ctx.beginPath();
  pathFn(ctx);
  ctx.clip();
  ctx.strokeStyle = hexA(color.startsWith('#') ? color : '#000', a);
  ctx.lineWidth = lw;
  const diag = Math.hypot(w, h);
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const cx = x + w / 2;
  const cy = y + h / 2;
  for (let d = -diag / 2; d <= diag / 2; d += step) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * d - dy * diag / 2, cy + dy * d + dx * diag / 2);
    ctx.lineTo(cx + dx * d + dy * diag / 2, cy + dy * d - dx * diag / 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** Halftone dots whose radius follows a tone function (0..1). */
export function halftone(ctx, x, y, w, h, tone, { step = 12, color = '#000', a = 1 } = {}) {
  ctx.save();
  ctx.fillStyle = hexA(color, a);
  for (let i = 0; i * step < w; i++) {
    for (let j = 0; j * step < h; j++) {
      const px = x + i * step + step / 2;
      const py = y + j * step + step / 2;
      const v = tone((px - x) / w, (py - y) / h);
      if (v <= 0.02) continue;
      ctx.beginPath();
      ctx.arc(px, py, (step * 0.52) * Math.sqrt(clamp(v)), 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Brass push pin with a real highlight. */
export function pin(ctx, x, y, s = 1) {
  ctx.save();
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(x + 5, y + 9, 15 * s, 9 * s, 0.3, 0, TAU);
  ctx.fill();
  const g = ctx.createRadialGradient(x - 6 * s, y - 8 * s, 1, x, y, 20 * s);
  g.addColorStop(0, '#F5DC9A');
  g.addColorStop(0.45, K.gold);
  g.addColorStop(1, K.gold2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 14 * s, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.ellipse(x - 4.5 * s, y - 5 * s, 3.6 * s, 2.4 * s, -0.6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Red evidence thread, drawn from point to point with a little sag. */
export function thread(ctx, pts, { p = 1, a = 0.95, lw = 3.2, sag = 16 } = {}) {
  if (pts.length < 2 || p <= 0) return;
  const segs = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segs.push(d);
    total += d;
  }
  let remain = total * clamp(p);
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 1; i < pts.length; i++) {
    if (remain <= 0) break;
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const d = segs[i - 1];
    const frac = clamp(remain / d);
    const mx = lerp(x0, x1, frac * 0.5);
    const my = lerp(y0, y1, frac * 0.5) + sag * 0.5;
    const ex = lerp(x0, x1, frac);
    const ey = lerp(y0, y1, frac);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = lw + 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + 2);
    ctx.quadraticCurveTo(mx, my + 2, ex, ey + 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(196,58,38,${a})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
    remain -= d;
  }
  ctx.restore();
}

/** A print on photo paper: cream border, shadow, gloss, optional tape. */
export function printCard(ctx, x, y, w, h, o = {}) {
  const {
    rot = 0, art = null, border = 16, alpha = 1, tone = 1, tape = 0, key = null, glowA = 0,
  } = o;
  const iw = w - border * 2;
  const ih = h - border * 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);

  // cast shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.62)';
  ctx.shadowBlur = 46;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = K.paper;
  fillRR(ctx, -w / 2, -h / 2, w, h, 2, K.paper);
  ctx.restore();

  // paper tone
  const pg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  pg.addColorStop(0, '#EFE5D0');
  pg.addColorStop(0.6, '#DFD3BB');
  pg.addColorStop(1, '#C9BBA1');
  ctx.fillStyle = pg;
  fillRR(ctx, -w / 2, -h / 2, w, h, 2, pg);

  // the image
  ctx.save();
  rr(ctx, -w / 2 + border, -h / 2 + border, iw, ih, 1);
  ctx.clip();
  ctx.fillStyle = '#0E0C0A';
  ctx.fillRect(-w / 2 + border, -h / 2 + border, iw, ih);
  if (art) art(ctx, iw, ih, -w / 2 + border, -h / 2 + border);
  // photographic vignette + grain inside the frame
  const vg = ctx.createRadialGradient(0, -h * 0.1, Math.min(iw, ih) * 0.2, 0, 0, Math.max(iw, ih) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(-w / 2 + border, -h / 2 + border, iw, ih);
  // gloss sweep
  const gs = ctx.createLinearGradient(-iw / 2, -ih / 2, iw / 2, ih / 2);
  gs.addColorStop(0, 'rgba(255,255,255,0.07)');
  gs.addColorStop(0.45, 'rgba(255,255,255,0)');
  gs.addColorStop(1, 'rgba(255,255,255,0.035)');
  ctx.fillStyle = gs;
  ctx.fillRect(-w / 2 + border, -h / 2 + border, iw, ih);
  ctx.restore();

  // inner edge
  ctx.strokeStyle = 'rgba(90,74,54,0.55)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-w / 2 + border, -h / 2 + border, iw, ih);

  // tape at the top corners
  if (tape) {
    ctx.save();
    ctx.globalAlpha *= 0.62;
    const tw = w * 0.30;
    ctx.fillStyle = 'rgba(226,208,170,0.55)';
    ctx.translate(-w / 2 + tw * 0.34, -h / 2 + 6);
    ctx.rotate(-0.42);
    ctx.fillRect(-tw / 2, -22, tw, 44);
    ctx.translate(w - tw * 0.68, 0);
    ctx.rotate(0.84);
    ctx.fillRect(-tw / 2, -22, tw, 44);
    ctx.restore();
  }

  if (glowA > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const gl = ctx.createRadialGradient(0, 0, w * 0.1, 0, 0, w * 0.9);
    gl.addColorStop(0, `rgba(255,196,120,${0.16 * glowA})`);
    gl.addColorStop(1, 'rgba(255,196,120,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(-w, -h, w * 2, h * 2);
    ctx.restore();
  }

  ctx.restore();
}

/** Typed paper label, the kind taped under an exhibit. */
export function typeLabel(ctx, s, x, y, o = {}) {
  const { size = 22, rot = 0, align = 'left', bg = true, a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  const tw = measure(ctx, s, size, F.mono, 1.5) + 26;
  if (bg) {
    ctx.fillStyle = 'rgba(226,214,190,0.92)';
    ctx.fillRect(align === 'center' ? -tw / 2 : 0, -size * 1.25, tw, size * 1.85);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(align === 'center' ? -tw / 2 : 0, size * 0.35, tw, 2);
  }
  txt(ctx, s, align === 'center' ? 0 : 13, 0, {
    size, font: F.mono, color: '#1A1512', align, track: 1.5,
  });
  ctx.restore();
}

/** Rubber stamp: distressed ink, never perfectly square. */
export function stampInk(ctx, s, x, y, o = {}) {
  const {
    size = 64, rot = -0.12, color = K.red, a = 1, padX = 34, padY = 26, align = 'center', track = 6,
  } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  const tw = measure(ctx, s, size, F.display, track) + track;
  const bx = align === 'center' ? -tw / 2 - padX : -padX;
  ctx.strokeStyle = hexA(color, 0.85);
  ctx.lineWidth = 5;
  ctx.strokeRect(bx, -size * 0.92 - padY, tw + padX * 2, size * 1.5 + padY * 2);
  ctx.lineWidth = 1.6;
  ctx.strokeRect(bx + 9, -size * 0.92 - padY + 9, tw + padX * 2 - 18, size * 1.5 + padY * 2 - 18);
  txt(ctx, s, align === 'center' ? 0 : 0, 6, {
    size, font: F.display, color: hexA(color, 0.92), align, track,
  });
  // worn ink: a few dry scratches, drawn in the colour of the surface below
  const r = rng(s.length * 31 + Math.round(size));
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = `rgba(16,12,10,${0.35 + r() * 0.5})`;
    ctx.fillRect(bx + r() * (tw + padX * 2), -size * 0.92 - padY + r() * (size * 1.5 + padY * 2), 2 + r() * 24, 1 + r() * 2.2);
  }
  ctx.restore();
}

/** Annotation: a rule from a point to a label, the way a plate is keyed. */
export function leader(ctx, x0, y0, x1, y1, s, o = {}) {
  const { size = 26, color = K.bone, align = 'left', a = 1, dot = true } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = hexA(color, 0.55);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  if (dot) {
    ctx.fillStyle = hexA(color, 0.9);
    ctx.beginPath();
    ctx.arc(x0, y0, 5, 0, TAU);
    ctx.fill();
  }
  txt(ctx, s, x1 + (align === 'right' ? -14 : 14), y1 + size * 0.34, {
    size, font: F.mono, color, align, track: 2.4,
  });
  ctx.restore();
}

/** Small all-caps key, the lettering under a specimen. */
export function kick(ctx, s, x, y, o = {}) {
  const { size = 20, color = K.dim, align = 'left', track = 6, a = 1 } = o;
  txt(ctx, s, x, y, { size, font: F.mono, color, align, track, alpha: a });
}

/** Big specimen numeral. */
export function num(ctx, s, x, y, o = {}) {
  const {
    size = 240, color = K.bone, align = 'left', track = -6, font = F.display, shadow = 0.5, a = 1,
  } = o;
  txt(ctx, s, x, y, {
    size, font, color, align, track, alpha: a, shadow: shadow > 0 ? 26 * shadow : 0, shadowY: 10 * shadow,
  });
}

/** Horizontal rule with a brass end cap. */
export function rule(ctx, x, y, w, { color = 'rgba(244,235,218,0.22)', a = 1, cap = true } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, 1.6);
  if (cap) {
    ctx.fillStyle = hexA(K.gold, 0.8);
    ctx.fillRect(x, y - 5, 3, 12);
    ctx.fillRect(x + w - 3, y - 5, 3, 12);
  }
  ctx.restore();
}

// ── objects ─────────────────────────────────────────────────────────────────

/**
 * Lateral brain plate. Real gyri do not run in rows — they wander, curl and close
 * on themselves — so the texture is built from ~900 short curved strokes in
 * random directions over a dark base: every gap left between strokes reads as a
 * sulcus. Cerebellum and brainstem sit behind the cerebrum and are drawn first.
 */
export function brainPlate(ctx, x, y, w, h, o = {}) {
  const { tone = 1, key = 'brain' } = o;
  const art = plate(`brainplate-${key}-${Math.round(w)}-${Math.round(h)}`, w, h, (g) => {
    const cx = w * 0.50;
    const cy = h * 0.45;
    const rx = w * 0.40;
    const ry = h * 0.34;

    const mass = (gg) => {
      gg.beginPath();
      gg.moveTo(cx - rx * 1.02, cy + ry * 0.18);
      gg.bezierCurveTo(cx - rx * 1.20, cy - ry * 0.30, cx - rx * 0.98, cy - ry * 0.80, cx - rx * 0.62, cy - ry * 0.96);
      gg.bezierCurveTo(cx - rx * 0.20, cy - ry * 1.10, cx + rx * 0.40, cy - ry * 1.04, cx + rx * 0.74, cy - ry * 0.74);
      gg.bezierCurveTo(cx + rx * 1.06, cy - ry * 0.50, cx + rx * 1.10, cy - ry * 0.02, cx + rx * 0.94, cy + ry * 0.26);
      gg.bezierCurveTo(cx + rx * 0.84, cy + ry * 0.44, cx + rx * 0.70, cy + ry * 0.44, cx + rx * 0.60, cy + ry * 0.56);
      gg.bezierCurveTo(cx + rx * 0.46, cy + ry * 0.86, cx + rx * 0.10, cy + ry * 0.92, cx - rx * 0.22, cy + ry * 0.82);
      gg.bezierCurveTo(cx - rx * 0.66, cy + ry * 0.70, cx - rx * 0.94, cy + ry * 0.48, cx - rx * 1.02, cy + ry * 0.18);
      gg.closePath();
    };
    const cerebellum = (gg) => {
      gg.beginPath();
      gg.ellipse(cx + rx * 0.52, cy + ry * 0.92, rx * 0.30, ry * 0.26, 0.08, 0, TAU);
      gg.closePath();
    };
    const stem = (gg) => {
      gg.beginPath();
      gg.moveTo(cx + rx * 0.16, cy + ry * 0.62);
      gg.quadraticCurveTo(cx + rx * 0.26, cy + ry * 1.05, cx + rx * 0.16, cy + ry * 1.22);
      gg.lineTo(cx - rx * 0.08, cy + ry * 1.16);
      gg.quadraticCurveTo(cx - rx * 0.04, cy + ry * 0.86, cx - rx * 0.10, cy + ry * 0.64);
      gg.closePath();
    };

    const base = mixHex('#7B6647', '#4A3A26', 1 - tone);
    const dark = '#241A11';

    // behind the cerebrum
    [stem, cerebellum].forEach((pth) => {
      pth(g);
      g.fillStyle = '#4B3A26';
      g.fill();
      hatch(g, { x: 0, y: 0, w, h }, pth, { angle: -0.5, step: 7, lw: 1.5, color: dark, a: 0.5 });
      g.strokeStyle = 'rgba(14,10,6,0.7)';
      g.lineWidth = 2;
      pth(g);
      g.stroke();
    });

    // the cerebrum: dark base, then a field of lit folds
    mass(g);
    g.fillStyle = base;
    g.fill();

    g.save();
    mass(g);
    g.clip();
    // ── the surface: tightly packed lobules, each shaded from the same lamp
    const r = rng(8123);
    const stepG = 30;
    const lobules = [];
    for (let gx = cx - rx * 1.3; gx < cx + rx * 1.3; gx += stepG) {
      for (let gy = cy - ry * 1.25; gy < cy + ry * 1.25; gy += stepG) {
        const px = gx + (r() - 0.5) * stepG * 0.9;
        const py = gy + (r() - 0.5) * stepG * 0.9;
        lobules.push({ px, py, rad: 26 + r() * 26, n: 7 + Math.floor(r() * 4), seed: r(), rot: r() * TAU });
      }
    }
    for (const lb of lobules) {
      const pts = [];
      for (let k = 0; k < lb.n; k++) {
        const aa = (k / lb.n) * TAU + lb.rot;
        const rr2 = lb.rad * (0.72 + ((Math.sin(lb.seed * 91 + k * 2.7) + 1) / 2) * 0.55);
        pts.push([lb.px + Math.cos(aa) * rr2, lb.py + Math.sin(aa) * rr2]);
      }
      const pathL = (gg) => {
        gg.beginPath();
        gg.moveTo((pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2);
        for (let k = 0; k < pts.length; k++) {
          const a1 = pts[k];
          const a2 = pts[(k + 1) % pts.length];
          gg.quadraticCurveTo(a1[0], a1[1], (a1[0] + a2[0]) / 2, (a1[1] + a2[1]) / 2);
        }
        gg.closePath();
      };
      const lg2 = g.createRadialGradient(
        lb.px - lb.rad * 0.42, lb.py - lb.rad * 0.48, lb.rad * 0.10,
        lb.px, lb.py, lb.rad * 1.18,
      );
      lg2.addColorStop(0, mixHex('#EFDDB8', '#D9C49C', lb.seed));
      lg2.addColorStop(0.60, mixHex('#CBB289', '#B79C71', lb.seed));
      lg2.addColorStop(1, '#6A5437');
      pathL(g);
      g.fillStyle = lg2;
      g.fill();
      g.strokeStyle = `rgba(30,21,13,${0.22 + lb.seed * 0.20})`;
      g.lineWidth = 2.8;
      g.stroke();
      // one crease inside the fold, only where the fold is big enough to hold one
      if (lb.rad > 40) {
        g.strokeStyle = 'rgba(40,29,17,0.28)';
        g.lineWidth = 2;
        g.beginPath();
        const a0 = lb.rot * 1.7;
        g.arc(lb.px, lb.py, lb.rad * 0.55, a0, a0 + 1.5);
        g.stroke();
        g.strokeStyle = 'rgba(255,246,224,0.16)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(lb.px, lb.py - 3, lb.rad * 0.55, a0, a0 + 1.5);
        g.stroke();
      }
    }
    // volume: lit from the upper left, falling away at the lower right
    const sh = g.createRadialGradient(cx - rx * 0.55, cy - ry * 0.55, rx * 0.10, cx + rx * 0.18, cy + ry * 0.28, rx * 1.45);
    sh.addColorStop(0, 'rgba(0,0,0,0)');
    sh.addColorStop(0.45, 'rgba(0,0,0,0.14)');
    sh.addColorStop(1, 'rgba(0,0,0,0.80)');
    g.fillStyle = sh;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = hexA('#FFEFCE', 0.55);
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(cx - rx * 1.12, cy + ry * 0.02);
    g.bezierCurveTo(cx - rx * 1.22, cy - ry * 0.42, cx - rx * 0.92, cy - ry * 0.88, cx - rx * 0.52, cy - ry * 0.99);
    g.stroke();
    g.restore();

    g.strokeStyle = 'rgba(16,11,7,0.7)';
    g.lineWidth = 2.6;
    mass(g);
    g.stroke();
  });
  ctx.drawImage(art, x, y);
}

/** The hippocampus, drawn as the little seahorse it is named after. */
export function hippocampus(ctx, x, y, w, h, o = {}) {
  const { a = 1, glowA = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  if (glowA > 0) {
    ctx.save();
    ctx.shadowColor = hexA(K.redHi, 0.9);
    ctx.shadowBlur = 46 * glowA;
    ctx.fillStyle = hexA(K.redHi, 0.9);
  }
  const path = (g) => {
    g.beginPath();
    g.moveTo(x + w * 0.04, y + h * 0.30);
    g.bezierCurveTo(x + w * 0.40, y + h * 0.02, x + w * 0.96, y + h * 0.24, x + w * 0.86, y + h * 0.62);
    g.bezierCurveTo(x + w * 0.80, y + h * 0.88, x + w * 0.46, y + h * 0.94, x + w * 0.30, y + h * 0.74);
    g.bezierCurveTo(x + w * 0.16, y + h * 0.56, x + w * 0.14, y + h * 0.40, x + w * 0.04, y + h * 0.30);
    g.closePath();
  };
  path(ctx);
  const g2 = ctx.createLinearGradient(x, y, x + w, y + h);
  g2.addColorStop(0, '#FF7A5E');
  g2.addColorStop(1, '#8C2013');
  ctx.fillStyle = g2;
  ctx.fill();
  if (glowA > 0) ctx.restore();
  hatch(ctx, { x, y, w, h }, path, { angle: -0.6, step: 6, lw: 1.2, color: '#3A0B05', a: 0.35 });
  ctx.strokeStyle = 'rgba(255,220,200,0.5)';
  ctx.lineWidth = 1.6;
  path(ctx);
  ctx.stroke();
  ctx.restore();
}

/**
 * A child's cot, side on: back panel, mattress and folded blanket, the baby
 * lying on it, then the front bars and top rail. `blanket` is the sheet colour,
 * so the same scene can render two plates and cross-fade them when it changes.
 */
export function crib(ctx, x, y, w, h, o = {}) {
  const { a = 1, key = 'crib', blanket = ['#9FB3AC', '#5D6F6A'] } = o;
  const art = plate(`crib-${key}-${Math.round(w)}-${Math.round(h)}`, w, h, (g) => {
    const woodLit = '#8A6236';
    const wood0 = '#5B3E24';
    const wood1 = '#2A190E';

    // back panel
    g.fillStyle = '#150E09';
    g.fillRect(w * 0.04, h * 0.10, w * 0.92, h * 0.70);

    // mattress
    const mg = g.createLinearGradient(0, h * 0.56, 0, h * 0.80);
    mg.addColorStop(0, '#E6D7B8');
    mg.addColorStop(1, '#A08A63');
    g.fillStyle = mg;
    fillRR(g, w * 0.07, h * 0.56, w * 0.86, h * 0.20, 10, mg);

    // the baby: head + swaddled body, lying on the mattress
    const bx = w * 0.44;
    const by = h * 0.62;
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.beginPath();
    g.ellipse(bx + 10, by + h * 0.10, w * 0.20, h * 0.035, 0, 0, TAU);
    g.fill();
    // swaddle
    const swg = g.createLinearGradient(bx - w * 0.16, by, bx + w * 0.16, by + h * 0.10);
    swg.addColorStop(0, '#F2E5CC');
    swg.addColorStop(0.55, '#DCC9A6');
    swg.addColorStop(1, '#A78F6C');
    g.fillStyle = swg;
    g.beginPath();
    g.moveTo(bx - w * 0.19, by + h * 0.085);
    g.bezierCurveTo(bx - w * 0.20, by - h * 0.01, bx - w * 0.06, by - h * 0.030, bx + w * 0.10, by - h * 0.020);
    g.bezierCurveTo(bx + w * 0.20, by - h * 0.014, bx + w * 0.23, by + h * 0.045, bx + w * 0.21, by + h * 0.085);
    g.closePath();
    g.fill();
    // swaddle folds
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = `rgba(120,96,64,${0.30 - i * 0.04})`;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(bx - w * 0.16 + i * w * 0.04, by - h * 0.012 + i * 3);
      g.quadraticCurveTo(bx, by + h * 0.05, bx + w * 0.18, by + h * 0.02 + i * 3);
      g.stroke();
    }
    // head, turned away from us
    const hx = bx - w * 0.13;
    const hy = by - h * 0.045;
    const hg = g.createRadialGradient(hx - 12, hy - 14, 4, hx, hy, w * 0.075);
    hg.addColorStop(0, '#F4DFC2');
    hg.addColorStop(0.7, '#D8BE99');
    hg.addColorStop(1, '#9E8060');
    g.fillStyle = hg;
    g.beginPath();
    g.arc(hx, hy, w * 0.062, 0, TAU);
    g.fill();
    // hair at the back of the head
    g.fillStyle = 'rgba(58,38,24,0.9)';
    g.beginPath();
    g.arc(hx - w * 0.008, hy - w * 0.004, w * 0.058, Math.PI * 0.86, Math.PI * 2.14);
    g.fill();
    // ear
    g.strokeStyle = 'rgba(140,104,70,0.8)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(hx + w * 0.012, hy + w * 0.004, w * 0.016, -0.6, 1.5);
    g.stroke();
    g.restore();

    // the blanket, folded back over the baby's legs
    const bg = g.createLinearGradient(0, h * 0.60, 0, h * 0.84);
    bg.addColorStop(0, blanket[0]);
    bg.addColorStop(1, blanket[1]);
    g.fillStyle = bg;
    g.beginPath();
    g.moveTo(w * 0.07, h * 0.775);
    g.bezierCurveTo(w * 0.28, h * 0.720, w * 0.58, h * 0.760, w * 0.93, h * 0.790);
    g.lineTo(w * 0.93, h * 0.845);
    g.bezierCurveTo(w * 0.58, h * 0.820, w * 0.28, h * 0.785, w * 0.07, h * 0.840);
    g.closePath();
    g.fill();
    for (let i = 0; i < 5; i++) {
      g.strokeStyle = `rgba(24,30,28,${0.16 + i * 0.02})`;
      g.lineWidth = 2.2;
      g.beginPath();
      const yy = h * (0.765 + i * 0.018);
      g.moveTo(w * 0.10, yy);
      g.bezierCurveTo(w * 0.32, yy - 9, w * 0.62, yy + 11, w * 0.91, yy);
      g.stroke();
    }
    g.strokeStyle = 'rgba(255,255,255,0.18)';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(w * 0.07, h * 0.775);
    g.bezierCurveTo(w * 0.28, h * 0.720, w * 0.58, h * 0.760, w * 0.93, h * 0.790);
    g.stroke();

    // front bars
    const railY = h * 0.24;
    const barTop = railY + 16;
    const barBot = h * 0.86;
    for (let i = 0; i <= 10; i++) {
      const sx = w * 0.055 + i * (w * 0.089);
      const gr = g.createLinearGradient(sx, 0, sx + 15, 0);
      gr.addColorStop(0, woodLit);
      gr.addColorStop(0.4, wood0);
      gr.addColorStop(1, wood1);
      g.fillStyle = gr;
      fillRR(g, sx, barTop, 15, barBot - barTop, 7.5, gr);
    }
    // top rail
    const trg = g.createLinearGradient(0, railY - 18, 0, railY + 18);
    trg.addColorStop(0, '#A2763F');
    trg.addColorStop(0.35, wood0);
    trg.addColorStop(1, '#231407');
    g.fillStyle = trg;
    fillRR(g, w * 0.02, railY - 16, w * 0.96, 30, 14, trg);
    // corner posts
    [w * 0.02, w * 0.93].forEach((px) => {
      const pg2 = g.createLinearGradient(px, 0, px + 46, 0);
      pg2.addColorStop(0, '#A2763F');
      pg2.addColorStop(0.5, wood0);
      pg2.addColorStop(1, '#1E1206');
      g.fillStyle = pg2;
      fillRR(g, px, railY - 30, 46, h * 0.62, 10, pg2);
      g.fillStyle = 'rgba(255,230,190,0.18)';
      g.beginPath();
      g.ellipse(px + 23, railY - 30, 22, 8, 0, 0, TAU);
      g.fill();
    });
    // floor shadow
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.beginPath();
    g.ellipse(w * 0.5, h * 0.90, w * 0.45, h * 0.035, 0, 0, TAU);
    g.fill();
  });
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.drawImage(art, x, y);
  ctx.restore();
}

/** Hanging mobile: an arm, three threads, three shapes that swing. */
export function mobile(ctx, x, y, w, h, t, o = {}) {
  const { a = 1, swing = 1, dim = 0 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  // arm
  ctx.strokeStyle = 'rgba(40,28,18,0.9)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y - h * 0.2);
  ctx.quadraticCurveTo(x + w * 0.5, y, x + w * 0.32, y + h * 0.12);
  ctx.stroke();
  const items = [
    { dx: 0.22, len: 0.42, kind: 'star' },
    { dx: 0.42, len: 0.56, kind: 'ring' },
    { dx: 0.64, len: 0.46, kind: 'moon' },
    { dx: 0.82, len: 0.38, kind: 'star' },
  ];
  items.forEach((it, i) => {
    const ang = Math.sin(t * 1.5 + i * 1.1) * 0.10 * swing;
    const px = x + w * it.dx;
    const py = y + h * 0.12;
    const ex = px + Math.sin(ang) * h * it.len;
    const ey = py + Math.cos(ang) * h * it.len;
    ctx.strokeStyle = `rgba(232,220,196,${0.5 - dim * 0.32})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(ang);
    const c = dim > 0.5 ? '#6D6558' : '#E9D9B8';
    ctx.fillStyle = c;
    ctx.strokeStyle = 'rgba(40,30,20,0.6)';
    ctx.lineWidth = 1.6;
    if (it.kind === 'star') {
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const rr2 = k % 2 ? 12 : 26;
        const aa = (k / 10) * TAU - Math.PI / 2;
        ctx.lineTo(Math.cos(aa) * rr2, Math.sin(aa) * rr2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (it.kind === 'ring') {
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, TAU);
      ctx.lineWidth = 9;
      ctx.strokeStyle = c;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 24, Math.PI * 0.42, Math.PI * 1.58, false);
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.strokeStyle = c;
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.restore();
}

/** Cassette tape, with a real tape path and a splice in the ribbon. */
export function cassette(ctx, x, y, w, o = {}) {
  const { a = 1, rot = 0, label = 'SISI A', sub = 'KENANGAN' } = o;
  const h = w * 0.63;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  const hw = w / 2;
  const hh = h / 2;
  // body
  const bg = ctx.createLinearGradient(-hw, -hh, hw, hh);
  bg.addColorStop(0, '#3B3733');
  bg.addColorStop(0.45, '#22201E');
  bg.addColorStop(1, '#131211');
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 44;
  ctx.shadowOffsetY = 20;
  fillRR(ctx, -hw, -hh, w, h, 16, '#1E1C1A');
  ctx.restore();
  ctx.fillStyle = bg;
  fillRR(ctx, -hw, -hh, w, h, 16, bg);
  // bevel
  ctx.strokeStyle = 'rgba(255,240,214,0.16)';
  ctx.lineWidth = 2;
  fillRR(ctx, -hw + 3, -hh + 3, w - 6, h - 6, 14, 'rgba(0,0,0,0)');
  ctx.stroke();
  // label
  ctx.fillStyle = '#D9CBAC';
  fillRR(ctx, -hw + w * 0.06, -hh + h * 0.08, w * 0.88, h * 0.38, 6, '#D9CBAC');
  ctx.fillStyle = 'rgba(120,44,30,0.9)';
  ctx.fillRect(-hw + w * 0.06, -hh + h * 0.08, w * 0.88, 10);
  txt(ctx, label, -hw + w * 0.11, -hh + h * 0.25, { size: h * 0.14, font: F.mono, color: '#3A2A20', track: 3 });
  txt(ctx, sub, -hw + w * 0.11, -hh + h * 0.375, { size: h * 0.095, font: F.mono, color: 'rgba(58,42,32,0.7)', track: 6 });
  // window
  const wy = hh * 0.20;
  const ww = w * 0.58;
  fillRR(ctx, -ww / 2, wy, ww, h * 0.34, 8, 'rgba(10,9,8,0.9)');
  // reels
  const reelR = h * 0.165;
  [-ww * 0.26, ww * 0.26].forEach((rx, i) => {
    ctx.fillStyle = '#0B0A09';
    ctx.beginPath();
    ctx.arc(rx, wy + h * 0.15, reelR * 1.5, 0, TAU);
    ctx.fill();
    const tape = ctx.createRadialGradient(rx, wy + h * 0.15, reelR * 0.4, rx, wy + h * 0.15, reelR * 1.4);
    tape.addColorStop(0, '#4A3A2A');
    tape.addColorStop(0.7, '#2A2118');
    tape.addColorStop(1, '#171310');
    ctx.fillStyle = tape;
    ctx.beginPath();
    ctx.arc(rx, wy + h * 0.15, reelR * (i === 0 ? 1.35 : 1.05), 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#CBBFA6';
    ctx.beginPath();
    ctx.arc(rx, wy + h * 0.15, reelR * 0.52, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2A2622';
    for (let k = 0; k < 6; k++) {
      const aa = (k / 6) * TAU;
      ctx.beginPath();
      ctx.arc(rx + Math.cos(aa) * reelR * 0.28, wy + h * 0.15 + Math.sin(aa) * reelR * 0.28, reelR * 0.10, 0, TAU);
      ctx.fill();
    }
  });
  // glass sheen on the window
  const sg = ctx.createLinearGradient(-ww / 2, wy, ww / 2, wy + h * 0.3);
  sg.addColorStop(0, 'rgba(255,255,255,0.10)');
  sg.addColorStop(0.5, 'rgba(255,255,255,0.01)');
  sg.addColorStop(1, 'rgba(255,255,255,0.06)');
  ctx.fillStyle = sg;
  fillRR(ctx, -ww / 2, wy, ww, h * 0.30, 8, sg);
  // screws
  [[-hw + 26, -hh + 24], [hw - 26, -hh + 24], [-hw + 26, hh - 24], [hw - 26, hh - 24], [0, hh - 22]].forEach(([sx, sy]) => {
    const rs = 8;
    const rg = ctx.createRadialGradient(sx - 3, sy - 3, 1, sx, sy, rs);
    rg.addColorStop(0, '#9A948A');
    rg.addColorStop(1, '#2A2724');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(sx, sy, rs, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 5, sy - 5);
    ctx.lineTo(sx + 5, sy + 5);
    ctx.stroke();
  });
  // a length of tape pulled out and spliced with clear tape
  ctx.strokeStyle = '#241B13';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(hw - 10, hh * 0.1);
  ctx.bezierCurveTo(hw + 70, hh * 0.5, hw + 10, hh * 1.1, hw - 40, hh * 0.95);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(224,208,178,0.55)';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(hw - 34, hh * 0.93);
  ctx.lineTo(hw - 8, hh * 0.86);
  ctx.stroke();
  ctx.restore();
}

/** Measuring tube with liquid: honest heights, honest graduations. */
export function tube(ctx, x, y, w, h, fill, o = {}) {
  const { a = 1, color = K.teal, ticks = 5, labels = null, key = 't' } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  const r = w / 2;
  // glass body
  ctx.fillStyle = 'rgba(220,236,236,0.05)';
  fillRR(ctx, x, y, w, h, r, 'rgba(220,236,236,0.05)');
  // liquid
  const lh = h * clamp(fill);
  const lg = ctx.createLinearGradient(x, y + h - lh, x + w, y + h);
  lg.addColorStop(0, hexA(color, 0.95));
  lg.addColorStop(0.55, hexA(color, 0.62));
  lg.addColorStop(1, hexA(color, 0.30));
  ctx.fillStyle = lg;
  fillRR(ctx, x + 3, y + h - lh, w - 6, lh - 3, [r, r, 4, 4], lg);
  // meniscus
  if (lh > 4) {
    ctx.fillStyle = hexA(color, 0.9);
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - lh, (w - 6) / 2, 7, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  // graduations
  ctx.strokeStyle = 'rgba(244,235,218,0.5)';
  ctx.lineWidth = 1.6;
  for (let i = 1; i < ticks; i++) {
    const ty = y + (h / ticks) * i;
    ctx.beginPath();
    ctx.moveTo(x + w - 2, ty);
    ctx.lineTo(x + w + (i === ticks - 1 ? 30 : 16), ty);
    ctx.stroke();
    if (labels && labels[i - 1] != null) {
      txt(ctx, labels[i - 1], x + w + 36, ty + 7, { size: 20, font: F.mono, color: 'rgba(244,235,218,0.55)', track: 1 });
    }
  }
  // glass highlight + rim
  ctx.strokeStyle = 'rgba(226,242,240,0.30)';
  ctx.lineWidth = 2;
  fillRR(ctx, x, y, w, h, r, 'rgba(0,0,0,0)');
  ctx.stroke();
  const hg = ctx.createLinearGradient(x, 0, x + w * 0.5, 0);
  hg.addColorStop(0, 'rgba(255,255,255,0.22)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg;
  fillRR(ctx, x + 6, y + 12, w * 0.14, h - 24, w * 0.07, hg);
  ctx.restore();
}

/** A paper exhibit tag: two fields, typed, with a blank line to fill. */
export function tagCard(ctx, x, y, w, h, rows, o = {}) {
  const { a = 1, rot = 0, title = '', key = 'tag' } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  fillRR(ctx, 0, 0, w, h, 3, '#DED2B8');
  ctx.restore();
  const pg = ctx.createLinearGradient(0, 0, w, h);
  pg.addColorStop(0, '#EFE6D2');
  pg.addColorStop(1, '#C9BB9E');
  ctx.fillStyle = pg;
  fillRR(ctx, 0, 0, w, h, 3, pg);
  ctx.fillStyle = 'rgba(120,44,30,0.85)';
  ctx.fillRect(0, 0, w, 8);
  if (title) txt(ctx, title, 26, 54, { size: 22, font: F.mono, color: 'rgba(40,30,24,0.6)', track: 5 });
  rows.forEach((r, i) => {
    const ry = 108 + i * 66;
    txt(ctx, r.k, 26, ry, { size: 24, font: F.mono, color: 'rgba(40,30,24,0.55)', track: 3 });
    txt(ctx, r.v, w - 26, ry, { size: 30, font: F.mono, color: '#221A14', align: 'right', track: 2 });
    ctx.strokeStyle = 'rgba(60,46,34,0.18)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(26, ry + 16);
    ctx.lineTo(w - 26, ry + 16);
    ctx.stroke();
  });
  ctx.restore();
}

/** A figure seen from behind — the viewer, standing in their own archive. */
export function figureBack(ctx, cx, baseY, s, o = {}) {
  const { a = 1, rim = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  const headR = 46 * s;
  const shoulderW = 132 * s;
  const bodyH = 250 * s;
  const form = (g) => {
    g.beginPath();
    g.moveTo(cx - shoulderW * 0.52, baseY);
    g.bezierCurveTo(cx - shoulderW * 0.62, baseY - bodyH * 0.45, cx - shoulderW * 0.52, baseY - bodyH * 0.72, cx - shoulderW * 0.30, baseY - bodyH * 0.80);
    g.quadraticCurveTo(cx - headR * 0.9, baseY - bodyH * 0.92, cx - headR * 0.86, baseY - bodyH * 1.02);
    g.bezierCurveTo(cx - headR * 1.1, baseY - bodyH * 1.30, cx + headR * 1.1, baseY - bodyH * 1.30, cx + headR * 0.86, baseY - bodyH * 1.02);
    g.quadraticCurveTo(cx + headR * 0.9, baseY - bodyH * 0.92, cx + shoulderW * 0.30, baseY - bodyH * 0.80);
    g.bezierCurveTo(cx + shoulderW * 0.52, baseY - bodyH * 0.72, cx + shoulderW * 0.62, baseY - bodyH * 0.45, cx + shoulderW * 0.52, baseY);
    g.closePath();
  };
  const g2 = ctx.createLinearGradient(cx - shoulderW * 0.6, baseY - bodyH, cx + shoulderW * 0.6, baseY);
  g2.addColorStop(0, 'rgba(96,74,52,0.98)');
  g2.addColorStop(0.35, 'rgba(44,34,26,0.99)');
  g2.addColorStop(1, 'rgba(12,10,9,0.99)');
  form(ctx);
  ctx.fillStyle = g2;
  ctx.fill();
  // rim light
  ctx.save();
  form(ctx);
  ctx.clip();
  ctx.strokeStyle = hexA('#FFDCA8', 0.62 * rim);
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW * 0.48, baseY - bodyH * 0.70);
  ctx.quadraticCurveTo(cx, baseY - bodyH * 0.78, cx + shoulderW * 0.48, baseY - bodyH * 0.70);
  ctx.strokeStyle = 'rgba(255,214,160,0.14)';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = hexA('#FFDCA8', 0.62 * rim);
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW * 0.5, baseY);
  ctx.bezierCurveTo(cx - shoulderW * 0.6, baseY - bodyH * 0.6, cx - shoulderW * 0.30, baseY - bodyH * 0.9, cx - headR * 0.9, baseY - bodyH * 1.06);
  ctx.stroke();
  // neck, so the head is carried rather than floating
  ctx.fillStyle = 'rgba(40,31,23,0.98)';
  ctx.beginPath();
  ctx.ellipse(cx, baseY - bodyH * 0.86, headR * 0.42, headR * 0.60, 0, 0, TAU);
  ctx.fill();
  // hair mass
  ctx.fillStyle = 'rgba(24,18,14,0.95)';
  ctx.beginPath();
  ctx.ellipse(cx, baseY - bodyH * 1.08, headR * 1.02, headR * 1.12, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** Big bracket with a caption under it, used to claim a span. */
export function bracket(ctx, x, y, w, h, o = {}) {
  const { color = K.red, a = 1, lw = 3, p = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = hexA(color, 0.9);
  ctx.lineWidth = lw;
  const seg = w * clamp(p);
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x, y + h / 2);
  ctx.lineTo(x + seg, y + h / 2);
  ctx.stroke();
  ctx.restore();
}

export { txt, measure, hexA, linGrad, radGrad, rr, fillRR, strokeRR };
