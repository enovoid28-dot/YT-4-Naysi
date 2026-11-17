// Episode 19 kit — "SINYAL".
//
// A dark studio with one volumetric beam, a lime signal colour and a mono HUD.
// Everything is canvas geometry: no bitmaps, no 3D. The look is built from four
// habits rather than from objects:
//
//   1. one light source (upper right), everything else falls away from it;
//   2. a constant slow push, so the frame is never dead;
//   3. type that arrives word by word behind a mask, not as a block;
//   4. signal drawing — waveforms, rings, ticks — that is generated per frame
//      from the same numbers the narration says.
//
// Conventions: txt() takes a baseline. Scenes keep their art above y=1700 because
// the caption block owns everything below.

import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, txt, hexA, mixHex, rr, fillRR, strokeRR, linGrad, radGrad, measure,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';

export const K = {
  bg: '#0A0811',
  bg2: '#15111F',
  ink: '#F4F1E8',
  dim: 'rgba(244,241,232,0.52)',
  faint: 'rgba(244,241,232,0.20)',
  lime: '#C8F751',
  limeLo: '#8FB62F',
  ember: '#FF7A45',
  ice: '#7BD1FF',
  violet: '#7A5CFF',
  panel: 'rgba(255,255,255,0.045)',
};

export const ease = {
  out: EASE.outCubic,
  expo: EASE.outExpo,
  quint: EASE.outQuint,
  smooth: EASE.smooth,
  back: EASE.outBackSoft,
  inOut: EASE.inOutQuad,
  in: EASE.inCubic,
};

/** Scene-local time of caption card `i`; the art lands 0.04 s before the word. */
export const cue = (scene, i, off = 0) => {
  const c = scene && scene.captions && scene.captions[i];
  const base = c ? c.from : 0;
  return Math.max(0, base + off - (i === 0 ? 0.10 : 0.04));
};

export const A = (t, start, dur = 0.6, fn = ease.out) => fn(clamp((t - start) / dur));

/* ── plates ──────────────────────────────────────────────────────────────── */
const plates = new Map();
export function plate(key, w, h, fn) {
  let c = plates.get(key);
  if (!c) {
    c = createCanvas(Math.ceil(w), Math.ceil(h));
    fn(c.getContext('2d'));
    plates.set(key, c);
  }
  return c;
}

/* ── the room ────────────────────────────────────────────────────────────── */
/**
 * Deep violet-black, one beam from the upper right, a faint HUD grid, grain and
 * a vignette. Cached: this is the same every frame.
 */
export function stage(ctx, o = {}) {
  const { beamX = W * 0.72, beamY = -260, key = 'a', warm = 1 } = o;
  const c = plate(`stage-${key}-${Math.round(beamX)}`, W, H, (g) => {
    const base = g.createLinearGradient(0, 0, W * 0.3, H);
    base.addColorStop(0, '#120D1E');
    base.addColorStop(0.42, '#0B0814');
    base.addColorStop(1, '#06050B');
    g.fillStyle = base;
    g.fillRect(0, 0, W, H);

    // the beam: a soft cone falling from above, widening as it descends
    g.save();
    g.translate(beamX, beamY);
    g.rotate(0.20);
    const cone = g.createLinearGradient(0, 0, 0, 2100);
    cone.addColorStop(0, `rgba(214,236,255,${0.13 * warm})`);
    cone.addColorStop(0.45, `rgba(150,180,255,${0.06 * warm})`);
    cone.addColorStop(1, 'rgba(120,140,255,0)');
    g.fillStyle = cone;
    g.beginPath();
    g.moveTo(-70, 0);
    g.lineTo(70, 0);
    g.lineTo(760, 2100);
    g.lineTo(-560, 2100);
    g.closePath();
    g.fill();
    g.restore();

    // pool of light on the floor of the frame
    const pool = g.createRadialGradient(beamX - 40, 700, 40, beamX - 40, 700, 900);
    pool.addColorStop(0, 'rgba(200,247,81,0.075)');
    pool.addColorStop(0.5, 'rgba(122,92,255,0.035)');
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = pool;
    g.fillRect(0, 0, W, H);

    // HUD grid, almost invisible
    g.strokeStyle = 'rgba(244,241,232,0.028)';
    g.lineWidth = 1;
    for (let x = 0; x <= W; x += 120) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, H);
      g.stroke();
    }
    for (let y = 0; y <= H; y += 120) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(W, y);
      g.stroke();
    }
    // heavier vertical rules at the margins
    g.strokeStyle = 'rgba(244,241,232,0.06)';
    g.lineWidth = 2;
    [72, W - 72].forEach((x) => {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, H);
      g.stroke();
    });

    // dust in the beam
    const d = rng(37);
    for (let i = 0; i < 260; i++) {
      const x = beamX - 420 + d() * 900;
      const y = d() * 1900;
      const a = 0.05 + d() * 0.16;
      g.fillStyle = `rgba(226,240,255,${a})`;
      g.beginPath();
      g.arc(x, y, 0.6 + d() * 1.8, 0, TAU);
      g.fill();
    }

    // grain
    const r2 = rng(91);
    for (let i = 0; i < 5200; i++) {
      g.fillStyle = `rgba(255,255,255,${r2() * 0.022})`;
      g.fillRect(r2() * W, r2() * H, 2, 2);
    }

    // vignette
    const vg = g.createRadialGradient(W * 0.5, H * 0.42, W * 0.28, W * 0.5, H * 0.45, W * 1.05);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(0.66, 'rgba(0,0,0,0.36)');
    vg.addColorStop(1, 'rgba(0,0,0,0.82)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
  });
  ctx.drawImage(c, 0, 0);
}

/**
 * The camera. Wrap the scene body in this and pass the returned value to the end
 * of the function; every frame drifts a few pixels and pushes a fraction of a
 * percent, which is what makes a still frame feel shot rather than rendered.
 */
export function camera(ctx, t, scene, { push = 0.05, drift = 10, y = 700 } = {}) {
  const p = clamp(t / Math.max(1, scene.dur || 1));
  const s = 1 + push * ease.inOut(p);
  const dx = Math.sin(t * 0.11) * drift;
  const dy = Math.cos(t * 0.09) * drift * 0.6;
  ctx.save();
  ctx.translate(W / 2 + dx, y + dy);
  ctx.scale(s, s);
  ctx.translate(-W / 2, -y);
  return () => ctx.restore();
}

/* ── marks ───────────────────────────────────────────────────────────────── */
export function micro(ctx, s, x, y, o = {}) {
  const { size = 22, color = K.dim, align = 'left', track = 5, a = 1, font = F.mono } = o;
  if (a <= 0.01) return;
  txt(ctx, s, x, y, { size, font, color, align, track, alpha: a });
}

/** A HUD frame with corner ticks; the label sits on the top rule. */
export function hudFrame(ctx, x, y, w, h, o = {}) {
  const { a = 1, color = 'rgba(244,241,232,0.22)', label = null, tick = 26 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  const corners = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];
  corners.forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + sx * tick, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * tick);
    ctx.stroke();
  });
  if (label) micro(ctx, label, x + 4, y - 16, { size: 19, color: 'rgba(244,241,232,0.42)', track: 6 });
  ctx.restore();
}

export function hairline(ctx, x, y, w, o = {}) {
  const { color = 'rgba(244,241,232,0.16)', a = 1, weight = 1.6 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, weight);
  ctx.restore();
}

export function tickRow(ctx, x, y, n, o = {}) {
  const { step = 14, h = 12, color = K.faint, on = 0, onColor = K.lime, a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i < on ? onColor : color;
    ctx.fillRect(x + i * step, y, 2, h);
  }
  ctx.restore();
}

export function crossMark(ctx, cx, cy, s, color = K.ember, a = 1, lw = 12) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s);
  ctx.lineTo(cx + s, cy + s);
  ctx.moveTo(cx + s, cy - s);
  ctx.lineTo(cx - s, cy + s);
  ctx.stroke();
  ctx.restore();
}

/**
 * Kinetic headline: each word rises out of its own mask on a stagger. `state[i]`
 * can hold a different colour (used for the one word the line turns on).
 */
export function headline(ctx, lines, x, y, o = {}) {
  const {
    size = 120, lineH = 1.06, font = F.head, color = K.ink, align = 'left',
    t = 0, at = 0, stagger = 0.09, dur = 0.62, accent = K.lime, accents = [], a = 1,
  } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  let idx = 0;
  lines.forEach((line, li) => {
    const words = String(line).split(' ');
    const yy = y + li * size * lineH;
    // measure for alignment
    const total = words.reduce((s, w, i) => s + measure(ctx, w, size, font, -size * 0.028) + (i ? size * 0.24 : 0), 0);
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    words.forEach((w) => {
      const p = A(t, at + idx * stagger, dur, ease.expo);
      const ww = measure(ctx, w, size, font, -size * 0.028);
      if (p > 0.01) {
        const rise = (1 - p) * size * 0.72;
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - 12, yy - size * 0.95, ww + 24, size * 1.24);
        ctx.clip();
        const isAcc = accents.includes(idx);
        txt(ctx, w, cx, yy + rise, {
          size, font, color: isAcc ? accent : color, track: -size * 0.028,
        });
        ctx.restore();
      }
      cx += ww + size * 0.24;
      idx += 1;
    });
  });
  ctx.restore();
}

export function number(ctx, v, x, y, o = {}) {
  const { size = 220, color = K.ink, align = 'left', a = 1, font = F.num, track = -0.045, glow = 0 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (glow > 0) {
    ctx.shadowColor = hexA(color, 0.55);
    ctx.shadowBlur = glare(size * glow);
  }
  txt(ctx, v, x, y, { size, font, color, align, track: track * size });
  ctx.restore();
}

const glare = (v) => v;

/* ── objects ─────────────────────────────────────────────────────────────── */

/**
 * A record. Grooves are a cached plate; the label turns, which is the only way
 * the eye can tell the disc is spinning.
 */
export function vinyl(ctx, cx, cy, r, t, o = {}) {
  const { a = 1, glow = 0.5, label = 'SISI A', sub = '04 · 12', speed = 0.55 } = o;
  if (a <= 0.01) return;
  const disc = plate(`vinyl-${Math.round(r)}`, r * 2 + 8, r * 2 + 8, (g) => {
    const R = r + 4;
    const body = g.createRadialGradient(R * 0.7, R * 0.55, 6, R, R, R);
    body.addColorStop(0, '#191722');
    body.addColorStop(0.55, '#0E0C14');
    body.addColorStop(1, '#050409');
    g.fillStyle = body;
    g.beginPath();
    g.arc(R, R, r, 0, TAU);
    g.fill();
    // grooves
    for (let i = 1; i <= 46; i++) {
      const rr2 = r * (0.40 + (i / 46) * 0.585);
      g.strokeStyle = i % 3 === 0 ? 'rgba(214,224,255,0.09)' : 'rgba(190,200,235,0.045)';
      g.lineWidth = 1 + (i % 4 === 0 ? 0.8 : 0);
      g.beginPath();
      g.arc(R, R, rr2, 0, TAU);
      g.stroke();
    }
    // two specular bands, the sheen of a record under a lamp
    g.save();
    g.beginPath();
    g.arc(R, R, r, 0, TAU);
    g.clip();
    g.globalCompositeOperation = 'screen';
    // one wide band of light across the disc, the way a lamp hits vinyl
    g.save();
    g.translate(R, R);
    g.rotate(-0.65);
    const sheen = g.createLinearGradient(0, -r, 0, r);
    sheen.addColorStop(0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.34, 'rgba(214,228,255,0.10)');
    sheen.addColorStop(0.5, 'rgba(232,240,255,0.17)');
    sheen.addColorStop(0.66, 'rgba(214,228,255,0.07)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sheen;
    g.fillRect(-r, -r, r * 2, r * 2);
    g.restore();
    g.restore();
    // rim
    g.strokeStyle = 'rgba(240,244,255,0.16)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(R, R, r - 1, 0, TAU);
    g.stroke();
  });

  ctx.save();
  ctx.globalAlpha *= a;
  if (glow > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g2 = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r * 1.6);
    g2.addColorStop(0, `rgba(200,247,81,${0.10 * glow})`);
    g2.addColorStop(1, 'rgba(200,247,81,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(cx - r * 1.7, cy - r * 1.7, r * 3.4, r * 3.4);
    ctx.restore();
  }
  ctx.drawImage(disc, cx - r - 4, cy - r - 4);

  // the label turns with the record
  const ang = t * speed;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  const lr = r * 0.255;
  const lg = ctx.createLinearGradient(-lr, -lr, lr, lr);
  lg.addColorStop(0, '#E9F7C6');
  lg.addColorStop(0.55, '#C8F751');
  lg.addColorStop(1, '#7FA324');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.arc(0, 0, lr, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,8,17,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  txt(ctx, label, 0, -lr * 0.22, { size: lr * 0.30, font: F.mono6, color: 'rgba(12,14,10,0.82)', align: 'center', track: 4 });
  txt(ctx, sub, 0, lr * 0.34, { size: lr * 0.22, font: F.mono, color: 'rgba(12,14,10,0.62)', align: 'center', track: 3 });
  ctx.fillStyle = '#0A0811';
  ctx.beginPath();
  ctx.arc(0, 0, lr * 0.08, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/**
 * Oscilloscope. `amp` is the envelope, the phase sweeps left to right so the
 * trace looks sampled rather than cycled.
 */
export function waveform(ctx, x, y, w, h, t, o = {}) {
  const {
    a = 1, color = K.lime, amp = 0.6, speed = 1.4, seed = 1, bars = 96, fill = true,
    line = 3.2, glow = 0.5, freq = 1,
  } = o;
  if (a <= 0.01) return;
  const mid = y + h / 2;
  const r = rng(seed);
  const phase = t * speed;
  const vals = [];
  for (let i = 0; i < bars; i++) {
    const p = i / (bars - 1);
    const env = Math.sin(p * Math.PI) ** 0.6;
    const v =
      Math.sin(p * 17 * freq + phase * 3.1 + r() * 0.4) * 0.55 +
      Math.sin(p * 6.4 * freq - phase * 1.7) * 0.32 +
      Math.sin(p * 31 * freq + phase * 2.2) * 0.13;
    vals.push(v * env * amp);
  }
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (fill) {
    ctx.beginPath();
    ctx.moveTo(x, mid);
    vals.forEach((v, i) => ctx.lineTo(x + (i / (bars - 1)) * w, mid - v * (h / 2)));
    ctx.lineTo(x + w, mid);
    ctx.closePath();
    const fg = ctx.createLinearGradient(0, mid - h / 2, 0, mid + h / 2);
    fg.addColorStop(0, hexA(color, 0.22));
    fg.addColorStop(0.5, hexA(color, 0.06));
    fg.addColorStop(1, hexA(color, 0.01));
    ctx.fillStyle = fg;
    ctx.fill();
  }
  if (glow > 0) {
    ctx.shadowColor = hexA(color, 0.75);
    ctx.shadowBlur = 22 * glow;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = line;
  ctx.beginPath();
  vals.forEach((v, i) => {
    const px = x + (i / (bars - 1)) * w;
    const py = mid - v * (h / 2);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.restore();
  // the zero line
  ctx.save();
  ctx.globalAlpha *= a * 0.5;
  ctx.fillStyle = hexA(color, 0.22);
  ctx.fillRect(x, mid, w, 1.2);
  ctx.restore();
}

/** A head in profile, lit from inside: the auditory cortex glows. */
export function headProfile(ctx, cx, cy, s, o = {}) {
  const { a = 1, t = 0, glowP = 0, color = K.lime } = o;
  if (a <= 0.01) return;
  const path = (g) => {
    g.beginPath();
    g.moveTo(cx - 0.42 * s, cy + 0.62 * s);
    g.bezierCurveTo(cx - 0.52 * s, cy + 0.34 * s, cx - 0.54 * s, cy + 0.03 * s, cx - 0.46 * s, cy - 0.20 * s);
    g.bezierCurveTo(cx - 0.40 * s, cy - 0.44 * s, cx - 0.20 * s, cy - 0.60 * s, cx + 0.02 * s, cy - 0.60 * s);
    g.bezierCurveTo(cx + 0.24 * s, cy - 0.60 * s, cx + 0.40 * s, cy - 0.46 * s, cx + 0.44 * s, cy - 0.26 * s);
    g.bezierCurveTo(cx + 0.46 * s, cy - 0.14 * s, cx + 0.42 * s, cy - 0.06 * s, cx + 0.46 * s, cy + 0.00 * s);
    g.bezierCurveTo(cx + 0.54 * s, cy + 0.06 * s, cx + 0.52 * s, cy + 0.16 * s, cx + 0.46 * s, cy + 0.20 * s);
    g.bezierCurveTo(cx + 0.44 * s, cy + 0.26 * s, cx + 0.40 * s, cy + 0.24 * s, cx + 0.38 * s, cy + 0.30 * s);
    g.bezierCurveTo(cx + 0.36 * s, cy + 0.40 * s, cx + 0.26 * s, cy + 0.44 * s, cx + 0.18 * s, cy + 0.50 * s);
    g.bezierCurveTo(cx + 0.12 * s, cy + 0.56 * s, cx + 0.10 * s, cy + 0.62 * s, cx + 0.10 * s, cy + 0.66 * s);
    g.lineTo(cx - 0.42 * s, cy + 0.66 * s);
    g.closePath();
  };
  ctx.save();
  ctx.globalAlpha *= a;
  // the void where the brain sits
  path(ctx);
  const bg = ctx.createLinearGradient(cx - s * 0.5, cy - s * 0.6, cx + s * 0.5, cy + s * 0.6);
  bg.addColorStop(0, 'rgba(30,26,48,0.92)');
  bg.addColorStop(1, 'rgba(12,10,20,0.96)');
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,241,232,0.30)';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // the cortex region, lit
  if (glowP > 0.01) {
    ctx.save();
    path(ctx);
    ctx.clip();
    const gx = cx + 0.16 * s;
    const gy = cy - 0.10 * s;
    const pulse = 0.85 + Math.sin(t * 2.4) * 0.15;
    ctx.globalCompositeOperation = 'screen';
    const g2 = ctx.createRadialGradient(gx, gy, 4, gx, gy, s * 0.42 * glowP);
    g2.addColorStop(0, hexA(color, 0.55 * pulse));
    g2.addColorStop(0.45, hexA(color, 0.16 * glowP));
    g2.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g2;
    ctx.fillRect(cx - s, cy - s, s * 2, s * 2);
    // gyri suggested with a few arcs
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = hexA(color, 0.24 * glowP);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx - i * 6, gy + i * 12, s * (0.10 + i * 0.045), -2.4, 1.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // concentric arcs leaving the ear, only when the inner sound is loud
  if (glowP > 0.01) {
    for (let i = 0; i < 4; i++) {
      const p = ((t * 0.55 + i * 0.25) % 1);
      ctx.strokeStyle = hexA(color, (1 - p) * 0.30 * glowP);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx + 0.46 * s, cy + 0.06 * s, s * (0.14 + p * 0.62), -1.1, 1.1);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** A loop with a playhead; `gap` opens the ring where it is not finished. */
export function loopRing(ctx, cx, cy, r, t, o = {}) {
  const { a = 1, p = 0, color = K.lime, gap = 0.30, lw = 8, trail = true, speed = 0.9 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const start = -Math.PI / 2;
  const end = start + TAU * (1 - gap);
  ctx.strokeStyle = 'rgba(244,241,232,0.12)';
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();

  const draw = clamp(p) * (end - start);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.shadowColor = hexA(color, 0.7);
  ctx.shadowBlur = 26;
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, start + draw);
  ctx.stroke();
  ctx.restore();

  if (trail) {
    const ang = start + t * speed * TAU * 0.6;
    const px = cx + Math.cos(ang) * r;
    const py = cy + Math.sin(ang) * r;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = K.ink;
    ctx.shadowColor = hexA(color, 0.9);
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(px, py, lw * 0.85, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

/** Piano roll: grid, bars, one melody line. */
export function pianoRoll(ctx, x, y, w, h, t, o = {}) {
  const { a = 1, p = 0, color = K.ice, rows = 7, cols = 16, scroll = 0 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const cw = w / cols;
  const ch = h / rows;
  ctx.strokeStyle = 'rgba(244,241,232,0.10)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * cw, y);
    ctx.lineTo(x + i * cw, y + h);
    ctx.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    ctx.beginPath();
    ctx.moveTo(x, y + j * ch);
    ctx.lineTo(x + w, y + j * ch);
    ctx.stroke();
  }
  const notes = [
    [0, 3, 2], [2, 4, 2], [4, 2, 1], [5, 3, 1], [6, 5, 2], [8, 4, 2],
    [10, 2, 1], [11, 3, 2], [13, 4, 1], [14, 2, 1],
  ];
  notes.forEach(([c0, r0, len], i) => {
    const q = clamp(p * 1.5 - i * 0.06);
    if (q <= 0.01) return;
    const nx = x + (c0 + scroll) * cw;
    const ny = y + (rows - 1 - r0) * ch;
    ctx.globalAlpha = a * q;
    ctx.fillStyle = i % 3 === 0 ? K.lime : color;
    fillRR(ctx, nx + 2, ny + 3, cw * len - 4, ch - 6, 4, i % 3 === 0 ? K.lime : color);
  });
  ctx.restore();
}

/** A pack of gum, drawn from the top corner so it reads as a box, not a card. */
export function gumPack(ctx, x, y, w, h, o = {}) {
  const { a = 1, rot = -0.06 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  const bw = w;
  const bh = h;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  fillRR(ctx, -bw / 2 + 14, -bh / 2 + 22, bw, bh, 18, 'rgba(0,0,0,0.5)');
  // body
  const g = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
  g.addColorStop(0, '#F6F3E8');
  g.addColorStop(0.45, '#DCD6C2');
  g.addColorStop(1, '#9C9481');
  fillRR(ctx, -bw / 2, -bh / 2, bw, bh, 18, g);
  // the little top flap
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  fillRR(ctx, -bw / 2, -bh / 2, bw, bh * 0.16, [18, 18, 0, 0], 'rgba(255,255,255,0.5)');
  // label band
  ctx.fillStyle = K.lime;
  fillRR(ctx, -bw / 2 + 10, -bh * 0.10, bw - 20, bh * 0.30, 8, K.lime);
  txt(ctx, 'KUNYAH', 0, bh * 0.10, { size: bh * 0.16, font: F.head, color: '#101408', align: 'center', track: 2 });
  txt(ctx, '3 MENIT', 0, -bh * 0.02, { size: bh * 0.075, font: F.mono6, color: 'rgba(16,20,8,0.75)', align: 'center', track: 4 });
  // foil edge
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  fillRR(ctx, -bw / 2, -bh / 2, bw, bh, 18, 'rgba(0,0,0,0)');
  ctx.stroke();
  ctx.restore();
}

/** 100 dots: the population, with the lit share pushed forward. */
export function dotField(ctx, x, y, o = {}) {
  const {
    a = 1, cols = 10, rows = 10, gap = 34, lit = 0, color = K.lime, dark = 'rgba(244,241,232,0.13)',
    size = 9, seed = 5,
  } = o;
  if (a <= 0.01) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const idx = j * cols + i;
      const on = idx < Math.round(lit * cols * rows);
      ctx.fillStyle = on ? color : dark;
      if (on) {
        ctx.shadowColor = hexA(color, 0.75);
        ctx.shadowBlur = 16;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(x + i * gap, y + j * gap, size * (0.85 + r() * 0.3), 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** A clock arc with a countdown; used for the 27-minute chapter. */
export function clockArc(ctx, cx, cy, r, o = {}) {
  const { a = 1, p = 0, color = K.ice, lw = 10, ticks = 12 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < ticks; i++) {
    const ang = (i / ticks) * TAU - Math.PI / 2;
    const long = i % 3 === 0;
    ctx.strokeStyle = long ? 'rgba(244,241,232,0.45)' : 'rgba(244,241,232,0.20)';
    ctx.lineWidth = long ? 3 : 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * (r - (long ? 26 : 16)), cy + Math.sin(ang) * (r - (long ? 26 : 16)));
    ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(244,241,232,0.14)';
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 40, -Math.PI / 2, -Math.PI / 2 + TAU);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.shadowColor = hexA(color, 0.6);
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 40, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p));
  ctx.stroke();
  ctx.restore();
}

export { txt, measure, hexA, linGrad, radGrad, rr, fillRR, strokeRR, clamp, lerp, TAU, rng };
