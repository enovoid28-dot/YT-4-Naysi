// Episode 20 kit — "LANGIT".
//
// The episode is told with the sky, not with diagrams: a real star field with
// parallax layers, a hill horizon, a person looking up, sight-lines that end on
// stars, a light sphere with a finite radius, space stretching light red, and the
// microwave wall that is left of the first light. Type is used sparingly — the
// objects carry the explanation.
import { createCanvas } from '@napi-rs/canvas';
import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, rng, TAU } from '../engine/anim.mjs';
import { A, cue, cueWord, ease, plate, micro, headline, number } from './_sinyal.mjs';

export const L = {
  void: '#03050D',
  deep: '#070C1B',
  mid: '#0B1430',
  star: '#FFF6E3',
  warm: '#FFC987',
  gold: '#FFE9B8',
  ice: '#8FD8FF',
  violet: '#6C5CE7',
  crimson: '#FF6B57',
  dim: 'rgba(240,244,255,0.62)',
  faint: 'rgba(240,244,255,0.22)',
};

export { A, cue, cueWord, ease, plate, micro, headline, number, txt, hexA, fillRR, measure, clamp, lerp, rng, TAU };

/* ── the sky plate: gradient, milky way, three star layers, hills ─────────── */
export function sky(ctx, o = {}) {
  const { key = 'a', hills = true, band = 1, glowY = 1460, stars: wantStars = true, warm = 0 } = o;
  const c = plate(`sky-${key}-${wantStars ? 1 : 0}-${warm}`, W, H, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#02030A');
    grad.addColorStop(0.42, '#060B1C');
    grad.addColorStop(0.78, '#0A1330');
    grad.addColorStop(1, '#12203F');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    // the milky way: a soft diagonal band of unresolved light
    g.save();
    g.translate(W * 0.62, H * 0.42);
    g.rotate(-0.62);
    const bandGrad = g.createLinearGradient(0, -420, 0, 420);
    bandGrad.addColorStop(0, 'rgba(120,150,255,0)');
    bandGrad.addColorStop(0.42, `rgba(150,175,255,${0.10 * band})`);
    bandGrad.addColorStop(0.52, `rgba(215,225,255,${0.16 * band})`);
    bandGrad.addColorStop(0.62, `rgba(150,175,255,${0.09 * band})`);
    bandGrad.addColorStop(1, 'rgba(120,150,255,0)');
    g.fillStyle = bandGrad;
    g.fillRect(-1100, -460, 2200, 920);
    g.restore();

    // dust lane through the band
    g.save();
    g.globalCompositeOperation = 'source-over';
    g.translate(W * 0.62, H * 0.42);
    g.rotate(-0.62);
    for (let i = 0; i < 220; i++) {
      const r = rng(700 + i);
      const x = -900 + r() * 1800;
      const y = (r() - 0.5) * 300;
      g.fillStyle = `rgba(2,3,9,${0.10 + r() * 0.22})`;
      g.beginPath();
      g.ellipse(x, y, 40 + r() * 130, 12 + r() * 40, 0, 0, TAU);
      g.fill();
    }
    g.restore();

    // star layers: far (tiny, many), mid, near (few, bright)
    const layers = [
      { n: 520, r0: 1.1, r1: 2.4, a: 0.30, seed: 11 },
      { n: 230, r0: 1.8, r1: 3.6, a: 0.55, seed: 23 },
      { n: 70, r0: 2.6, r1: 5.4, a: 0.9, seed: 37 },
    ];
    if (wantStars) layers.forEach((ly) => {
      const r = rng(ly.seed);
      for (let i = 0; i < ly.n; i++) {
        const x = r() * W;
        const y = r() * H * 0.92;
        const rad = lerp(ly.r0, ly.r1, r());
        const a = ly.a * (0.45 + r() * 0.55);
        const warm = r() < 0.25;
        g.fillStyle = warm ? `rgba(255,226,190,${a})` : `rgba(226,238,255,${a})`;
        g.beginPath();
        g.arc(x, y, rad, 0, TAU);
        g.fill();
      }
    });

    // horizon glow, the light of a city that is not there
    const hg = g.createRadialGradient(W * 0.5, glowY, 60, W * 0.5, glowY, 900);
    hg.addColorStop(0, 'rgba(255,176,110,0.16)');
    hg.addColorStop(0.4, 'rgba(120,90,180,0.08)');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = hg;
    g.fillRect(0, glowY - 700, W, 1100);

    // hills
    if (hills) {
      const rr = rng(91);
      const pts = [];
      for (let x = -40; x <= W + 40; x += 60) {
        const y = 1520 + Math.sin(x * 0.0032) * 46 + Math.sin(x * 0.0091 + 1.3) * 18 + rr() * 10;
        pts.push([x, y]);
      }
      g.beginPath();
      g.moveTo(-40, H);
      pts.forEach(([x, y]) => g.lineTo(x, y));
      g.lineTo(W + 40, H);
      g.closePath();
      g.fillStyle = '#04060D';
      g.fill();
      // a rim of warm light on the ridge
      g.strokeStyle = 'rgba(255,190,130,0.22)';
      g.lineWidth = 3;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
    }

    // grain + vignette
    if (warm > 0) {
      const wg = g.createLinearGradient(0, 0, 0, H);
      wg.addColorStop(0, `rgba(255,214,150,${0.10 * warm})`);
      wg.addColorStop(0.7, `rgba(255,196,120,${0.18 * warm})`);
      wg.addColorStop(1, `rgba(255,170,90,${0.26 * warm})`);
      g.fillStyle = wg;
      g.fillRect(0, 0, W, H);
    }

    const rg = rng(5);
    for (let i = 0; i < 4200; i++) {
      g.fillStyle = `rgba(255,255,255,${rg() * 0.02})`;
      g.fillRect(rg() * W, rg() * H, 2, 2);
    }
    const vg = g.createRadialGradient(W / 2, H * 0.45, W * 0.3, W / 2, H * 0.45, W * 1.02);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(0.7, 'rgba(0,0,0,0.30)');
    vg.addColorStop(1, 'rgba(0,0,0,0.80)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
  });
  // 80 px of bleed on every side: the camera breathes a few pixels per frame and
  // a flush-drawn plate would let the page background peek in at the edges.
  ctx.drawImage(c, -80, -80, W + 160, H + 160);
}

/** A handful of stars that actually twinkle, plus one meteor. */
export function life(ctx, t, o = {}) {
  const { a = 1, seed = 3, meteor = true } = o;
  if (a <= 0.01) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const y = r() * H * 0.86;
    const base = 1.6 + r() * 2.6;
    const ph = r() * TAU;
    const tw = 0.45 + 0.55 * Math.sin(t * (1.2 + r() * 2.4) + ph);
    ctx.fillStyle = `rgba(255,250,240,${0.35 + tw * 0.55})`;
    ctx.shadowColor = 'rgba(200,225,255,0.9)';
    ctx.shadowBlur = 10 + tw * 14;
    ctx.beginPath();
    ctx.arc(x, y, base * (0.7 + tw * 0.5), 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  if (meteor) {
    const period = 17;
    const p = ((t / period) % 1);
    if (p < 0.16) {
      const q = p / 0.16;
      const x0 = W * 0.12 + q * W * 0.55;
      const y0 = 180 + q * 210;
      const len = 210;
      const g = ctx.createLinearGradient(x0, y0, x0 - len * 0.7, y0 - len * 0.5);
      g.addColorStop(0, `rgba(255,255,255,${(1 - q) * 0.85 * a})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save();
      ctx.strokeStyle = g;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 - len * 0.7, y0 - len * 0.5);
      ctx.stroke();
      ctx.restore();
    }
  }
}

/**
 * A person in silhouette, seen from behind, head tipped back to the sky.
 *
 * Built from one continuous outline instead of a ball on a dome: neck, sloped
 * shoulders, arms with an elbow, legs, and a rim of sky light along the top of
 * the head and shoulders. Height is s, feet sit on y.
 */
export function person(ctx, x, y, s, o = {}) {
  const { a = 1, rim = 0.30, lean = 0 } = o;
  if (a <= 0.01) return;
  const r = 0.072 * s;            // head radius
  const hy = y - 0.895 * s;       // head centre
  const hx = x + lean * 0.02 * s;
  const nw = 0.036 * s;           // neck half width
  const sy = y - 0.775 * s;       // shoulder line
  const sw = 0.155 * s;           // shoulder half width
  const hipY = y - 0.455 * s;
  const hw = 0.095 * s;           // hip half width
  const aw = 0.040 * s;           // arm half width

  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = '#02030A';
  ctx.beginPath();
  // left arm outer edge
  ctx.moveTo(x - sw - 0.006 * s, sy + 0.02 * s);
  ctx.bezierCurveTo(x - sw - 0.03 * s, y - 0.60 * s, x - sw - 0.02 * s, y - 0.50 * s, x - sw + 0.012 * s, y - 0.395 * s);
  ctx.quadraticCurveTo(x - sw + 0.05 * s, y - 0.345 * s, x - sw + 0.075 * s, y - 0.395 * s);
  // back up the inside of the arm
  ctx.lineTo(x - hw - 0.012 * s, y - 0.455 * s);
  // hip and left leg
  ctx.lineTo(x - hw * 0.82, y);
  ctx.lineTo(x - 0.016 * s, y);
  ctx.lineTo(x - 0.016 * s, hipY);
  ctx.lineTo(x + 0.016 * s, hipY);
  ctx.lineTo(x + 0.016 * s, y);
  ctx.lineTo(x + hw * 0.82, y);
  ctx.lineTo(x + hw + 0.012 * s, y - 0.455 * s);
  // right arm, mirrored
  ctx.lineTo(x + sw - 0.075 * s, y - 0.395 * s);
  ctx.quadraticCurveTo(x + sw - 0.05 * s, y - 0.345 * s, x + sw - 0.012 * s, y - 0.395 * s);
  ctx.bezierCurveTo(x + sw + 0.02 * s, y - 0.50 * s, x + sw + 0.03 * s, y - 0.60 * s, x + sw + 0.006 * s, sy + 0.02 * s);
  // shoulders and the back of the neck
  ctx.bezierCurveTo(x + sw * 0.72, sy - 0.045 * s, x + nw + 0.014 * s, sy - 0.055 * s, x + nw, sy - 0.076 * s);
  ctx.lineTo(x + nw * 0.92, hy + r * 0.86);
  // head, drawn as a slightly egg-shaped skull tipped back
  ctx.bezierCurveTo(x + r * 0.98, hy + r * 0.30, x + r * 0.92, hy - r * 0.72, x + r * 0.34, hy - r * 0.95);
  ctx.bezierCurveTo(x - r * 0.30, hy - r * 1.12, x - r * 0.92, hy - r * 0.72, x - r * 0.96, hy + r * 0.16);
  ctx.bezierCurveTo(x - r * 0.98, hy + r * 0.70, x - r * 0.60, hy + r * 0.95, x - nw * 0.95, hy + r * 0.90);
  ctx.lineTo(x - nw, sy - 0.076 * s);
  ctx.bezierCurveTo(x - nw - 0.014 * s, sy - 0.055 * s, x - sw * 0.72, sy - 0.045 * s, x - sw - 0.006 * s, sy + 0.02 * s);
  ctx.closePath();
  ctx.fill();

  // rim light: the sky spills over the shoulders and the crown
  if (rim > 0) {
    const g = ctx.createLinearGradient(x - sw, sy, x + sw, hy - r);
    g.addColorStop(0, `rgba(150,195,255,${0.42 * rim})`);
    g.addColorStop(0.6, `rgba(255,236,200,${0.55 * rim})`);
    g.addColorStop(1, `rgba(150,195,255,${0.30 * rim})`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x - sw - 0.006 * s, sy + 0.02 * s);
    ctx.bezierCurveTo(x - sw * 0.72, sy - 0.045 * s, x - nw - 0.014 * s, sy - 0.055 * s, x - nw, sy - 0.076 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + sw + 0.006 * s, sy + 0.02 * s);
    ctx.bezierCurveTo(x + sw * 0.72, sy - 0.045 * s, x + nw + 0.014 * s, sy - 0.055 * s, x + nw, sy - 0.076 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.98, hy + r * 0.30);
    ctx.bezierCurveTo(x + r * 0.92, hy - r * 0.72, x + r * 0.34, hy - r * 0.95, x - r * 0.30, hy - r * 1.02);
    ctx.bezierCurveTo(x - r * 0.92, hy - r * 0.72, x - r * 0.98, hy - r * 0.02, x - r * 0.96, hy + r * 0.16);
    ctx.stroke();
    // a touch of hair volume behind the crown
    ctx.strokeStyle = `rgba(200,220,255,${0.22 * rim})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.86, hy - r * 0.20);
    ctx.quadraticCurveTo(x - r * 0.30, hy - r * 1.22, x + r * 0.34, hy - r * 0.98);
    ctx.stroke();
  }
  ctx.restore();
}

/** Sight-lines from a viewer upward; each one ends on a star. */
export function sightRays(ctx, cx, cy, r, t, o = {}) {
  const { a = 1, p = 0, n = 13, color = L.ice, spread = 1.5 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (i / (n - 1) - 0.5) * spread * 2;
    const q = clamp(p * 1.4 - i * 0.04);
    if (q <= 0.01) continue;
    const len = r * q;
    const x2 = cx + Math.cos(ang) * len;
    const y2 = cy + Math.sin(ang) * len;
    const g = ctx.createLinearGradient(cx, cy, x2, y2);
    g.addColorStop(0, hexA(color, 0.02));
    g.addColorStop(1, hexA(color, 0.42));
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (q > 0.98) {
      ctx.fillStyle = L.star;
      ctx.shadowColor = 'rgba(255,245,220,0.9)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(x2, y2, 3.4, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  ctx.restore();
}

/** A sphere of light with a hard edge: everything outside it is still dark. */
export function lightSphere(ctx, cx, cy, r, t, o = {}) {
  const { a = 1, p = 0, color = L.gold } = o;
  if (a <= 0.01) return;
  const R = r * p;
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, Math.max(2, R));
  g.addColorStop(0, hexA(color, 0.55));
  g.addColorStop(0.55, hexA(color, 0.18));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, R), 0, TAU);
  ctx.fill();
  // the wavefront itself
  ctx.strokeStyle = hexA(color, 0.75);
  ctx.lineWidth = 3;
  ctx.shadowColor = hexA(color, 0.8);
  ctx.shadowBlur = 26;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, R), 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** Space stretching: stars streaming outward, cooling from white to red to nothing. */
export function stretch(ctx, cx, cy, t, o = {}) {
  const { a = 1, p = 0, n = 120, seed = 17, reach = 1500 } = o;
  if (a <= 0.01) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const ang = r() * TAU;
    const base = 60 + r() * 320;
    const spd = 0.25 + r() * 0.9;
    const dist = base + ((t * 90 * spd + p * 600) % reach);
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist * 0.9;
    if (x < -40 || x > W + 40 || y < -40 || y > H) continue;
    const k = clamp((dist - 120) / reach);
    const col = k < 0.45 ? [255, 246, 227] : k < 0.75 ? [255, 201, 135] : [255, 107, 87];
    const al = (1 - k) * 0.9;
    ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${al})`;
    const rad = 1.4 + (1 - k) * 3;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TAU);
    ctx.fill();
    if (k > 0.2) {
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${al * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(cx + Math.cos(ang) * (dist - 26 * (1 - k)), cy + Math.sin(ang) * (dist - 26 * (1 - k)) * 0.9);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** The first light, now microwave: a wall of static that never stops. */
export function noiseWall(ctx, t, w, h, x0, y0, o = {}) {
  const { a = 1, cell = 16, color = L.violet } = o;
  if (a <= 0.01) return;
  const r = rng(1000 + Math.floor(t * 26));
  ctx.save();
  ctx.globalAlpha *= a;
  // a fine grain of cold static: mostly dots, a few cold rectangles, and
  // occasional hot pixels so it reads as a receiver, not as a pattern
  for (let y = y0; y < y0 + h; y += cell) {
    for (let x = x0; x < x0 + w; x += cell) {
      const v = r();
      if (v < 0.5) continue;
      const hot = v > 0.985;
      const cx = x + r() * cell;
      const cy = y + r() * cell;
      if (v > 0.82) {
        ctx.fillStyle = hot ? 'rgba(255,248,236,0.9)' : `rgba(178,170,255,${0.10 + v * 0.22})`;
        ctx.fillRect(x + 1, y + 1, cell - 3, cell - 3);
      } else {
        ctx.fillStyle = hot ? 'rgba(255,252,240,0.95)' : `rgba(214,220,255,${0.08 + v * 0.30})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 1.2 + r() * 2.4, 0, TAU);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/** A thin scale with a travelling light pulse — used for light-time. */
export function lightRuler(ctx, x, y, w, t, o = {}) {
  const { a = 1, p = 0, color = L.gold, ticks = 8, label = '' } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(240,244,255,0.18)';
  ctx.fillRect(x, y, w, 3);
  for (let i = 0; i <= ticks; i++) {
    ctx.fillStyle = 'rgba(240,244,255,0.30)';
    ctx.fillRect(x + (i / ticks) * w, y - 8, 2, 20);
  }
  const px = x + w * clamp(p);
  ctx.fillStyle = color;
  ctx.shadowColor = hexA(color, 0.9);
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(px, y + 1, 9, 0, TAU);
  ctx.fill();
  ctx.restore();
  if (label) micro(ctx, label, x + w + 22, y + 26, { size: 26, color: L.star, track: 5 });
}

/**
 * A soft wash of ink behind type: opaque in the middle, feathered at both ends,
 * so a text block never shows the edge of a rectangle over the sky.
 */
export function wash(ctx, y0, y1, alpha = 0.86, color = '3,5,13', pad = 120) {
  const g = ctx.createLinearGradient(0, y0 - pad, 0, y1 + pad);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(Math.min(0.49, pad / (y1 - y0 + pad * 2)), `rgba(${color},${alpha})`);
  g.addColorStop(Math.max(0.51, 1 - pad / (y1 - y0 + pad * 2)), `rgba(${color},${alpha})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(-100, y0 - pad, W + 200, (y1 - y0) + pad * 2);
}

/** Big serif-ish statement in the sky palette. */
export function say(ctx, lines, x, y, o = {}) {
  return headline(ctx, lines, x, y, {
    size: 112, font: F.display, color: L.star, accent: L.warm, lineH: 1.04, ...o,
  });
}
