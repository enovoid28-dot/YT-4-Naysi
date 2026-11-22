// ============================================================================
// Episode 35 kit — "utama": the Voyager console world.
// ----------------------------------------------------------------------------
// A deep-space mission identity built entirely from procedural canvas code:
// three parallax star layers with twinkle and drift, indigo nebula veils,
// the Golden Record spinning its grooves under a raking light, the spacecraft
// silhouette (high-gain dish, magnetometer boom, RTG stack), a trajectory
// polyline with planet nodes and a travelling pulse, heliopause arcs that
// breathe, DSN signal strips with telemetry ticks, watt gauges that decay,
// odometer counters for kilometres / AU / watts / years, the pale-blue-dot
// beam, a 1-AU-equals-1-metre scale ruler, glass HUD panels, gold-on-ice
// typography with staggered mono kickers, overshoot chips, film grain and a
// soft vignette. No image assets, no 3D, no useless particles: every dot is a
// star, a groove, a telemetry tick or a photon with a job to do.
// ============================================================================

import {
  cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn,
  spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch,
  snow, rgba, W, H,
} from './_cyano.mjs';
import { grain, back, odo } from './_madu.mjs';

// ----------------------------------------------------------------------------
// 1. PALETTE — gold record, copper body, ice telemetry, indigo vacuum
// ----------------------------------------------------------------------------

export const VY = {
  void: '#04050C',      // interstellar vacuum
  indigo: '#0D1533',    // nebula body
  indigo2: '#1A2450',   // nebula highlight
  gold: '#E8B84B',      // the record
  goldHi: '#FFE9A8',    // record rim light
  copper: '#B87333',    // spacecraft body
  copperDk: '#6E421C',  // body shadow
  ice: '#CFE3FF',       // telemetry type
  iceDim: '#8FA6C9',    // secondary type
  plasma: '#8A6BFF',    // heliosphere
  rose: '#FF4FA0',      // alert / silence
  teal: '#7CF29C',      // DSN lock
  white: '#F4F8FF',
};

// ----------------------------------------------------------------------------
// 2. SMALL MATH + DRAW HELPERS
// ----------------------------------------------------------------------------

/** deterministic 0..1 hash for stable per-star values */
const h1 = (n) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/** smooth pulse 0..1..0 around a phase */
const pulse = (t, hz, ph = 0) => 0.5 + 0.5 * Math.sin(TAU * hz * t + ph);

/** ease a value toward a target with a per-frame coefficient */
const approach = (v, target, k) => v + (target - v) * k;

/** rounded rectangle path, tolerant of older canvas */
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/** gold gradient stroke used by every console line */
function goldStroke(ctx, a = 1) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, `rgba(232,184,75,${0.25 * a})`);
  g.addColorStop(0.5, `rgba(255,233,168,${0.9 * a})`);
  g.addColorStop(1, `rgba(232,184,75,${0.25 * a})`);
  return g;
}

/** ice gradient stroke for telemetry */
function iceStroke(ctx, a = 1) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, `rgba(143,166,201,${0.2 * a})`);
  g.addColorStop(0.5, `rgba(207,227,255,${0.85 * a})`);
  g.addColorStop(1, `rgba(143,166,201,${0.2 * a})`);
  return g;
}

/** format an integer the Indonesian way: 25.900.000.000 */
const idn = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ----------------------------------------------------------------------------
// 3. VACUUM BACKGROUND — layered gradient, nebula veils, faint grid
// ----------------------------------------------------------------------------

/**
 * The base vacuum: vertical indigo-to-void gradient, two baked nebula veils
 * drifting in opposite directions, and a whisper-faint mission grid.
 */
export function vacuum(ctx, t, o = {}) {
  const g = ctx.createLinearGradient(0, -160, 0, H + 160);
  g.addColorStop(0, o.top ?? '#0A1130');
  g.addColorStop(0.45, VY.indigo);
  g.addColorStop(1, VY.void);
  ctx.fillStyle = g;
  ctx.fillRect(-160, -160, W + 320, H + 320);

  // nebula veil A — baked blotches, slow drift right
  const a = bake('vy-neb-a', 1024, 1024, (c) => {
    const rd = rng(71);
    for (let i = 0; i < 26; i++) {
      const x = rd() * 1024, y = rd() * 1024, r = 90 + rd() * 260;
      const gg = c.createRadialGradient(x, y, 8, x, y, r);
      const hue = rd() < 0.55 ? '26,36,80' : '58,42,110';
      gg.addColorStop(0, `rgba(${hue},${0.10 + rd() * 0.10})`);
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gg;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  });
  ctx.save();
  ctx.globalAlpha = o.neb ?? 0.75;
  const dx = (t * 6) % 1024;
  ctx.drawImage(a, -160 - dx * 0.4, -160, W + 320, H + 320);
  ctx.restore();

  // nebula veil B — counter drift, warmer
  const b = bake('vy-neb-b', 1024, 1024, (c) => {
    const rd = rng(72);
    for (let i = 0; i < 18; i++) {
      const x = rd() * 1024, y = rd() * 1024, r = 120 + rd() * 300;
      const gg = c.createRadialGradient(x, y, 10, x, y, r);
      gg.addColorStop(0, `rgba(120,90,40,${0.05 + rd() * 0.05})`);
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gg;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  });
  ctx.save();
  ctx.globalAlpha = (o.neb ?? 0.75) * 0.7;
  const dx2 = (t * 4) % 1024;
  ctx.drawImage(b, -160 + dx2 * 0.3 - 512, -160, W + 320, H + 320);
  ctx.restore();

  // mission grid, barely there
  if (o.grid !== false) {
    ctx.save();
    ctx.strokeStyle = 'rgba(143,166,201,0.05)';
    ctx.lineWidth = 1.2;
    for (let x = 0; x <= W; x += 160) {
      ctx.beginPath(); ctx.moveTo(x, -160); ctx.lineTo(x, H + 160); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 200) {
      ctx.beginPath(); ctx.moveTo(-160, y); ctx.lineTo(W + 160, y); ctx.stroke();
    }
    ctx.restore();
  }
}

// ----------------------------------------------------------------------------
// 4. STARFIELD — three parallax layers, twinkle, occasional bright star
// ----------------------------------------------------------------------------

/**
 * Parallax starfield. Layer depth multiplies the camera offset so the sky
 * has real depth while the console slides. Stars twinkle on independent
 * phases; a handful get diffraction spikes because the reference footage of
 * space always has them and the eye expects them.
 */
export function stars(ctx, cam, t, o = {}) {
  const layers = [
    { n: o.n1 ?? 70, sp: 0.10, r: 1.1, a: 0.42, tw: 0.7 },
    { n: o.n2 ?? 44, sp: 0.22, r: 1.7, a: 0.62, tw: 1.1 },
    { n: o.n3 ?? 20, sp: 0.40, r: 2.5, a: 0.85, tw: 1.7 },
  ];
  const cx = cam ? cam[0] : W / 2;
  const cy = cam ? cam[1] : 1030;
  ctx.save();
  layers.forEach((L, li) => {
    const ox = (cx - W / 2) * L.sp;
    const oy = (cy - 1030) * L.sp;
    for (let i = 0; i < L.n; i++) {
      const seed = li * 997 + i;
      let x = h1(seed) * (W + 240) - 120 - ox;
      let y = h1(seed + 0.5) * (H + 240) - 120 - oy;
      x = ((x % (W + 240)) + (W + 240)) % (W + 240) - 120;
      y = ((y % (H + 240)) + (H + 240)) % (H + 240) - 120;
      const tw = 0.55 + 0.45 * Math.sin(t * L.tw + seed);
      const a = L.a * tw * (o.a ?? 1);
      ctx.fillStyle = `rgba(244,248,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, L.r * (0.8 + 0.4 * tw), 0, TAU);
      ctx.fill();
      if (li === 2 && i % 5 === 0) {
        ctx.strokeStyle = `rgba(207,227,255,${a * 0.5})`;
        ctx.lineWidth = 1.1;
        const s = L.r * 3.4 * tw;
        ctx.beginPath();
        ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
        ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
        ctx.stroke();
      }
    }
  });
  ctx.restore();
}

/** one travelling photon along a path — used for signal beams */
export function photon(ctx, x0, y0, x1, y1, t, o = {}) {
  const per = o.per ?? 2.2;
  const q = ((t / per) + (o.ph ?? 0)) % 1;
  const x = lerp(x0, x1, q);
  const y = lerp(y0, y1, q);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, o.r ?? 26);
  g.addColorStop(0, `rgba(255,233,168,${0.85 * (o.a ?? 1)})`);
  g.addColorStop(0.35, `rgba(232,184,75,${0.35 * (o.a ?? 1)})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, o.r ?? 26, 0, TAU); ctx.fill();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 5. THE GOLDEN RECORD — grooves, label, raking light, slow spin
// ----------------------------------------------------------------------------

/**
 * The 30 cm gold-plated copper disc. Grooves are concentric arcs with a
 * subtle radial wobble; the label carries the pulsar map dot ring; a raking
 * light sweeps so the metal reads as metal. `spin` is radians.
 */
export function record(ctx, x, y, r, t, o = {}) {
  const spin = o.spin ?? t * 0.35;
  const p = o.p ?? 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = p;
  ctx.scale(1, o.tilt ?? 1);
  ctx.rotate(spin);

  // disc body
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, VY.goldHi);
  g.addColorStop(0.45, VY.gold);
  g.addColorStop(0.85, '#9C7A2E');
  g.addColorStop(1, '#5E481B');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();

  // grooves
  ctx.strokeStyle = 'rgba(94,72,27,0.5)';
  ctx.lineWidth = 1.2;
  const g0 = r * (o.label ?? 0.34);
  for (let rr2 = g0; rr2 < r * 0.97; rr2 += Math.max(3, r * 0.022)) {
    ctx.beginPath();
    ctx.arc(0, 0, rr2, 0, TAU);
    ctx.stroke();
  }
  // a few brighter grooves catch the light
  ctx.strokeStyle = 'rgba(255,233,168,0.35)';
  for (let k = 0; k < 5; k++) {
    const rr2 = g0 + (r * 0.97 - g0) * (0.15 + k * 0.19);
    ctx.beginPath();
    ctx.arc(0, 0, rr2, spin * 0.2 + k, spin * 0.2 + k + 2.2);
    ctx.stroke();
  }

  // label
  ctx.fillStyle = '#2A2013';
  ctx.beginPath(); ctx.arc(0, 0, g0 * 0.92, 0, TAU); ctx.fill();
  ctx.fillStyle = VY.gold;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.035, 0, TAU); ctx.fill();
  // pulsar map: radial tick ring
  ctx.strokeStyle = 'rgba(232,184,75,0.8)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const an = (i / 14) * TAU;
    const l = g0 * (0.3 + 0.4 * h1(i + 3));
    ctx.beginPath();
    ctx.moveTo(Math.cos(an) * g0 * 0.2, Math.sin(an) * g0 * 0.2);
    ctx.lineTo(Math.cos(an) * (g0 * 0.2 + l), Math.sin(an) * (g0 * 0.2 + l));
    ctx.stroke();
  }
  ctx.restore();

  // raking light sweep (screen space, not rotated)
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, o.tilt ?? 1);
  const an = t * 0.5;
  ctx.globalCompositeOperation = 'lighter';
  const lg = ctx.createLinearGradient(Math.cos(an) * -r, Math.sin(an) * -r, Math.cos(an) * r, Math.sin(an) * r);
  lg.addColorStop(0, 'rgba(0,0,0,0)');
  lg.addColorStop(0.5, `rgba(255,244,214,${0.16 * p})`);
  lg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lg;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.restore();

  // rim
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, o.tilt ?? 1);
  ctx.strokeStyle = `rgba(255,233,168,${0.75 * p})`;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  ctx.restore();
}

/** the record cover diagram: how to play it — binary ticks + disc icon */
export function recordCover(ctx, x, y, w, h, t, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(207,227,255,0.75)';
  ctx.lineWidth = 2.4;
  rr(ctx, 0, 0, w, h, 18);
  ctx.stroke();
  // disc + stylus icon
  ctx.beginPath();
  ctx.arc(w * 0.3, h * 0.5, h * 0.26, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w * 0.3 + h * 0.26, h * 0.5);
  ctx.lineTo(w * 0.62, h * 0.32);
  ctx.stroke();
  // binary row ticks along the top
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const on = h1(i + 11) > 0.45;
    const bx = w * 0.12 + i * (w * 0.065);
    ctx.strokeStyle = on ? 'rgba(232,184,75,0.9)' : 'rgba(143,166,201,0.35)';
    ctx.beginPath();
    ctx.moveTo(bx, h * 0.14);
    ctx.lineTo(bx, h * 0.14 + (on ? 16 : 8));
    ctx.stroke();
  }
  // rotation arrow
  ctx.strokeStyle = 'rgba(124,242,156,0.8)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(w * 0.3, h * 0.5, h * 0.36, t * 0.8, t * 0.8 + 1.6);
  ctx.stroke();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 6. THE SPACECRAFT — dish, boom, RTGs, magnetometer tail
// ----------------------------------------------------------------------------

/**
 * Voyager silhouette at scale s, rotation rot. High-gain antenna dish faces
 * home; the science boom carries the magnetometer; three RTG stacks hang off
 * the bus; a thin gold wash keeps it readable against the void.
 */
export function probe(ctx, x, y, s, o = {}) {
  const rot = o.rot ?? -0.12;
  const p = o.p ?? 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalAlpha = p;

  // bus
  ctx.fillStyle = VY.copper;
  rr(ctx, -60, -46, 120, 92, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  rr(ctx, -60, 6, 120, 40, 8);
  ctx.fill();

  // high-gain dish
  ctx.save();
  ctx.translate(0, -86);
  ctx.fillStyle = VY.ice;
  ctx.beginPath();
  ctx.ellipse(0, 0, 74, 26, 0, Math.PI, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(143,166,201,0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 74, 10, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = VY.copperDk;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 40);
  ctx.stroke();
  ctx.restore();

  // science boom + magnetometer head
  ctx.strokeStyle = VY.iceDim;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-60, 10); ctx.lineTo(-190, 34);
  ctx.stroke();
  ctx.fillStyle = VY.ice;
  rr(ctx, -214, 24, 26, 20, 5);
  ctx.fill();

  // RTG stack
  ctx.fillStyle = '#20242E';
  for (let i = 0; i < 3; i++) {
    rr(ctx, 62, -20 + i * 26, 52, 20, 8);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(232,184,75,0.5)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(118, -10 + i * 26, 4, 0, TAU);
    ctx.fill();
  }

  // plasma wave antennas (crossed whips)
  ctx.strokeStyle = 'rgba(207,227,255,0.6)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-20, 46); ctx.lineTo(-120, 150);
  ctx.moveTo(20, 46); ctx.lineTo(120, 150);
  ctx.stroke();

  // record plaque on the bus
  ctx.fillStyle = VY.gold;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(94,72,27,0.8)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.stroke();

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 7. TRAJECTORY — sun to heliopause with planet nodes and a live pulse
// ----------------------------------------------------------------------------

/**
 * Mission trajectory: a spline from the Sun through Jupiter, Saturn, the
 * Pale Blue Dot turn, the heliopause and "now". Nodes light up in order as
 * `prog` advances 0..1; a photon rides the drawn part of the line.
 */
export function trajectory(ctx, pts, t, o = {}) {
  const prog = o.prog ?? 1;
  const nodes = o.nodes ?? [];
  const sp = sampleSpline(pts, { closed: false, k: 1, step: 8 });
  const nShow = Math.max(2, Math.floor(sp.length * clamp(prog)));
  ctx.save();
  // drawn path
  ctx.strokeStyle = goldStroke(ctx, o.a ?? 0.9);
  ctx.lineWidth = o.lw ?? 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  sp.slice(0, nShow).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  // faint future path
  ctx.strokeStyle = 'rgba(143,166,201,0.18)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  sp.slice(nShow - 1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.setLineDash([]);
  // nodes
  nodes.forEach((nd, i) => {
    const q = clamp(prog * nodes.length - i + 0.4);
    if (q <= 0) return;
    ctx.globalAlpha = q;
    ctx.fillStyle = nd.col ?? VY.ice;
    ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r ?? 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = `rgba(207,227,255,${0.4 + 0.3 * pulse(t, 0.5, i)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(nd.x, nd.y, (nd.r ?? 9) + 7 + 3 * pulse(t, 0.5, i), 0, TAU); ctx.stroke();
    if (nd.label) {
      label(ctx, nd.label, nd.x, nd.y - (nd.r ?? 9) - 22, { size: 24, color: nd.col ?? VY.ice, align: 'center', track: 3, p: q });
    }
    ctx.globalAlpha = 1;
  });
  // photon riding the drawn line
  const i = Math.floor((nShow - 1) * (((t * 0.35) % 1)));
  const [px, py] = sp[Math.max(0, i)];
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(px, py, 0, px, py, 30);
  g.addColorStop(0, 'rgba(255,233,168,0.9)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(px, py, 30, 0, TAU); ctx.fill();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 8. HELIOPAUSE — the Sun's bubble edge, breathing arcs and plasma hiss
// ----------------------------------------------------------------------------

/**
 * Concentric heliosphere arcs centred off-screen left (the Sun's direction).
 * The heliopause line is brighter and breathes; beyond it, short plasma
 * hatch strokes hint at the interstellar medium the PWS "hears".
 */
export function heliopause(ctx, cx, cy, t, o = {}) {
  const base = o.r0 ?? 500;
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const r = base + i * (o.gap ?? 150) + Math.sin(t * 0.6 + i) * 8;
    const last = i === 3;
    ctx.strokeStyle = last
      ? `rgba(138,107,255,${0.55 + 0.25 * pulse(t, 0.35)})`
      : `rgba(138,107,255,${0.22 - i * 0.04})`;
    ctx.lineWidth = last ? 3.4 : 2;
    ctx.setLineDash(last ? [] : [18, 14]);
    ctx.beginPath();
    ctx.arc(cx, cy, r, -0.9, 0.9);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // interstellar plasma hatch beyond the edge
  const rE = base + 3 * (o.gap ?? 150);
  ctx.strokeStyle = 'rgba(124,242,156,0.28)';
  ctx.lineWidth = 1.6;
  for (let k = 0; k < 26; k++) {
    const an = -0.85 + (k / 25) * 1.7;
    const rr2 = rE + 26 + h1(k) * 90;
    const x = cx + Math.cos(an) * rr2;
    const y = cy + Math.sin(an) * rr2;
    const wig = Math.sin(t * 2 + k) * 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 14 + wig, y + 8);
    ctx.stroke();
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 9. DSN SIGNAL — wave strips, lock indicator, light-time bar
// ----------------------------------------------------------------------------

/**
 * Telemetry wave strip: carrier with data blips. When `lock` is false the
 * wave collapses to a flat rose line with dropouts — the 48-hour silence.
 */
export function signal(ctx, x, y, w, h, t, o = {}) {
  const lock = o.lock ?? true;
  ctx.save();
  ctx.strokeStyle = lock ? VY.teal : VY.rose;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let px = 0; px <= w; px += 5) {
    const env = Math.sin((px / w) * Math.PI);
    let v;
    if (lock) {
      v = (Math.sin(px * 0.11 + t * 6) * 0.5 + Math.sin(px * 0.031 - t * 2.2) * 0.4) * env;
      if (h1(Math.floor(px / 40)) > 0.82) v += 0.5 * env;
    } else {
      const drop = h1(Math.floor(px / 26) + Math.floor(t)) > 0.7 ? 0.5 : 0.06;
      v = Math.sin(px * 0.4 + t * 9) * drop * env;
    }
    const yy = y + h / 2 + v * (h / 2) * 0.9;
    if (px === 0) ctx.moveTo(x + px, yy); else ctx.lineTo(x + px, yy);
  }
  ctx.stroke();
  // baseline
  ctx.strokeStyle = 'rgba(143,166,201,0.3)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  ctx.restore();
}

/** DSN lock lamp + label, blinking when searching */
export function lockLamp(ctx, x, y, t, o = {}) {
  const lock = o.lock ?? true;
  const on = lock ? 1 : pulse(t, 2.2);
  ctx.save();
  ctx.fillStyle = lock ? VY.teal : VY.rose;
  ctx.globalAlpha = 0.35 + 0.65 * on;
  ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = lock ? 'rgba(124,242,156,0.5)' : 'rgba(255,79,160,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 18 + 4 * on, 0, TAU); ctx.stroke();
  label(ctx, o.txt ?? (lock ? 'DSN LOCK' : 'NO CARRIER'), x + 34, y + 9, { size: 26, color: lock ? VY.teal : VY.rose, track: 4, p: o.p ?? 1 });
  ctx.restore();
}

/** light-time bar: 24 hours drawn as a filling gold tube with hour ticks */
export function lightTime(ctx, x, y, w, t, o = {}) {
  const q = eo(o.p ?? 1);
  ctx.save();
  ctx.fillStyle = 'rgba(13,21,51,0.8)';
  rr(ctx, x, y, w, 46, 23);
  ctx.fill();
  ctx.strokeStyle = 'rgba(143,166,201,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  const g = ctx.createLinearGradient(x, 0, x + w * q, 0);
  g.addColorStop(0, 'rgba(232,184,75,0.35)');
  g.addColorStop(1, VY.goldHi);
  ctx.fillStyle = g;
  rr(ctx, x + 4, y + 4, (w - 8) * q, 38, 19);
  ctx.fill();
  ctx.strokeStyle = 'rgba(207,227,255,0.5)';
  ctx.lineWidth = 1.6;
  for (let hI = 1; hI < 24; hI += 3) {
    const hx = x + (w * hI) / 24;
    ctx.beginPath(); ctx.moveTo(hx, y + 8); ctx.lineTo(hx, y + 38); ctx.stroke();
  }
  // photon at the head
  photon(ctx, x, y + 23, x + w, y + 23, t, { per: 3.2, r: 20, a: q });
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 10. POWER — RTG watt gauge that decays year over year
// ----------------------------------------------------------------------------

/**
 * Radial watt gauge: arc from 470 W (1977) down to today's rationed budget.
 * `watts` drives the needle; the decayed span is drawn in rose so the loss
 * is visible, not just stated.
 */
export function wattGauge(ctx, x, y, r, watts, t, o = {}) {
  const p = o.p ?? 1;
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
  const q = clamp(watts / 470);
  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = 'rgba(143,166,201,0.25)';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,79,160,0.35)';
  ctx.beginPath(); ctx.arc(x, y, r, a0 + (a1 - a0) * q, a1); ctx.stroke();
  const g = ctx.createLinearGradient(x - r, y, x + r, y);
  g.addColorStop(0, VY.gold);
  g.addColorStop(1, VY.goldHi);
  ctx.strokeStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, a0, a0 + (a1 - a0) * q); ctx.stroke();
  // needle
  const an = a0 + (a1 - a0) * q + Math.sin(t * 7) * 0.006;
  ctx.strokeStyle = VY.ice;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(an) * (r - 26), y + Math.sin(an) * (r - 26));
  ctx.stroke();
  ctx.fillStyle = VY.ice;
  ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
  // ticks
  ctx.strokeStyle = 'rgba(207,227,255,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 10; i++) {
    const ta = a0 + ((a1 - a0) * i) / 10;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ta) * (r + 14), y + Math.sin(ta) * (r + 14));
    ctx.lineTo(x + Math.cos(ta) * (r + 26), y + Math.sin(ta) * (r + 26));
    ctx.stroke();
  }
  ctx.restore();
}

/** instrument rack: 11 slots, lit = alive, crossed = switched off */
export function instrumentRack(ctx, x, y, w, alive, t, o = {}) {
  const p = o.p ?? 1;
  const n = 11;
  const sw = w / n;
  ctx.save();
  ctx.globalAlpha = p;
  for (let i = 0; i < n; i++) {
    const on = i < alive;
    const sx = x + i * sw + 6;
    ctx.fillStyle = on ? 'rgba(124,242,156,0.85)' : 'rgba(143,166,201,0.18)';
    rr(ctx, sx, y, sw - 12, 64, 10);
    ctx.fill();
    if (!on) {
      ctx.strokeStyle = 'rgba(255,79,160,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + 8, y + 10); ctx.lineTo(sx + sw - 20, y + 54);
      ctx.moveTo(sx + sw - 20, y + 10); ctx.lineTo(sx + 8, y + 54);
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(4,5,12,${0.5 + 0.3 * pulse(t, 1.4, i)})`;
      ctx.beginPath(); ctx.arc(sx + (sw - 12) / 2, y + 32, 7, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 11. HUD — glass panels, gold headings, overshoot chips, odometers
// ----------------------------------------------------------------------------

/** glass console panel with gold top rule and corner ticks */
export function panel(ctx, x, y, w, h, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = 'rgba(6,8,18,0.72)';
  rr(ctx, x, y, w, h, 24);
  ctx.fill();
  ctx.strokeStyle = `rgba(232,184,75,${0.5 * p})`;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.strokeStyle = goldStroke(ctx, 0.8);
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(x + 26, y + 60); ctx.lineTo(x + w - 26, y + 60); ctx.stroke();
  ctx.strokeStyle = 'rgba(207,227,255,0.5)';
  ctx.lineWidth = 2;
  [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx2, cy2], i) => {
    const dx = i % 2 === 0 ? 1 : -1;
    const dy = i < 2 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx2 + dx * 10, cy2 + dy * 26);
    ctx.lineTo(cx2 + dx * 10, cy2 + dy * 10);
    ctx.lineTo(cx2 + dx * 26, cy2 + dy * 10);
    ctx.stroke();
  });
  ctx.restore();
}

/** gold-on-ice heading with staggered mono kicker */
export function heading(ctx, main, accent, x, y, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.globalAlpha = clamp(p * 1.6);
  ctx.textAlign = 'left';
  let size = o.size ?? 128;
  ctx.font = `800 ${size}px Poppins, sans-serif`;
  const tot = ctx.measureText(main).width + (accent ? 26 + ctx.measureText(accent).width : 0);
  if (tot > W - 220) {
    size = Math.floor(size * (W - 220) / tot);
    ctx.font = `800 ${size}px Poppins, sans-serif`;
  }
  ctx.fillStyle = VY.white;
  ctx.shadowColor = 'rgba(207,227,255,0.45)';
  ctx.shadowBlur = 26;
  ctx.fillText(main, x, y);
  const mw = ctx.measureText(main).width;
  if (accent) {
    ctx.fillStyle = VY.gold;
    ctx.shadowColor = 'rgba(232,184,75,0.55)';
    ctx.fillText(accent, x + mw + 26, y);
  }
  ctx.shadowBlur = 0;
  if (o.sub) {
    ctx.font = '600 30px JetBrains Mono, monospace';
    let lx = x, ci = 0;
    for (const ch of o.sub) {
      ctx.fillStyle = o.subCol ?? 'rgba(232,184,75,0.9)';
      ctx.globalAlpha = clamp(p * 1.9 - ci * 0.045);
      ctx.fillText(ch, lx, y + 58);
      lx += ctx.measureText(ch).width + 5;
      ci++;
    }
  }
  ctx.restore();
}

/** overshoot chip, gold border */
export function chip(ctx, txt, x, y, o = {}) {
  const p = back(o.p ?? 1);
  ctx.save();
  ctx.globalAlpha = eo(o.p ?? 1);
  ctx.translate(x, y);
  ctx.scale(0.84 + 0.16 * p, 0.84 + 0.16 * p);
  ctx.font = '700 30px JetBrains Mono, monospace';
  const w = ctx.measureText(txt).width + 64;
  ctx.fillStyle = o.fill ?? 'rgba(6,8,18,0.82)';
  rr(ctx, -w / 2, -34, w, 68, 34);
  ctx.fill();
  ctx.strokeStyle = o.col ?? VY.gold;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.fillStyle = o.txtCol ?? VY.ice;
  ctx.textAlign = 'center';
  ctx.fillText(txt, 0, 11);
  ctx.restore();
}

/** gold odometer counter with unit suffix */
export function counter(ctx, val, x, y, p, o = {}) {
  ctx.save();
  ctx.font = o.font ?? '800 150px Poppins, sans-serif';
  ctx.textAlign = o.align ?? 'center';
  ctx.fillStyle = o.col ?? VY.goldHi;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 26; }
  ctx.fillText(idn(val * eo(p)) + (o.suffix ?? ''), x, y);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 12. PALE BLUE DOT — one pixel inside a sunbeam from six billion km
// ----------------------------------------------------------------------------

/**
 * The 1990 portrait: a raking sunbeam crosses the frame and Earth is a
 * sub-pixel dot suspended in it. The beam shimmers; the dot breathes a
 * halo so the eye can find it, then the halo withdraws and leaves only
 * the pixel — the point of the photograph.
 */
export function paleBlueDot(ctx, t, o = {}) {
  const p = o.p ?? 1;
  const bx = o.x ?? W * 0.62;
  const by = o.y ?? 1080;
  ctx.save();
  ctx.globalAlpha = p;
  // beam
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(-0.62);
  const g = ctx.createLinearGradient(0, -150, 0, 150);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.5, `rgba(255,240,205,${0.16 + 0.05 * Math.sin(t * 1.3)})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-1600, -150, 3200, 300);
  // dust motes inside the beam only (they belong to the light)
  const rd = rng(88);
  ctx.fillStyle = 'rgba(255,244,214,0.35)';
  for (let i = 0; i < 26; i++) {
    const mx = -1500 + rd() * 3000;
    const my = (rd() - 0.5) * 220;
    ctx.globalAlpha = p * (0.15 + 0.3 * rd()) * (0.6 + 0.4 * Math.sin(t * 2 + i));
    ctx.beginPath(); ctx.arc(mx, my, 1.4 + rd() * 1.6, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // the dot
  ctx.globalAlpha = p;
  const halo = o.halo ?? (0.5 + 0.5 * Math.sin(t * 1.1));
  ctx.globalCompositeOperation = 'lighter';
  const hg = ctx.createRadialGradient(bx, by, 0, bx, by, 34);
  hg.addColorStop(0, `rgba(120,180,255,${0.5 * halo})`);
  hg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(bx, by, 34, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#7FB2FF';
  ctx.beginPath(); ctx.arc(bx, by, 4.2, 0, TAU); ctx.fill();
  ctx.restore();
}

/** camera-frame corner brackets, like the original imaging scan */
export function scanFrame(ctx, x, y, w, h, t, o = {}) {
  const p = o.p ?? 1;
  const L = 46;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = 'rgba(207,227,255,0.7)';
  ctx.lineWidth = 3;
  [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([cx2, cy2, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx2 + dx * L, cy2);
    ctx.lineTo(cx2, cy2);
    ctx.lineTo(cx2, cy2 + dy * L);
    ctx.stroke();
  });
  // scan line sweeping
  const sy = y + ((t * 0.22) % 1) * h;
  ctx.strokeStyle = 'rgba(124,242,156,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x + w, sy); ctx.stroke();
  label(ctx, o.tag ?? 'IMG 1990-02-14 · 6.000.000.000 KM', x, y - 18, { size: 24, color: VY.iceDim, track: 3, p });
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 13. SCALE RULER — 1 AU = 1 metre, Voyager at 170 m, Proxima at 269 km
// ----------------------------------------------------------------------------

/**
 * The shrinking-scale ruler: a metre stick whose far end is Voyager; the
 * star marker sits off-panel with an arrow and a distance chip, because
 * 269 km cannot fit on a phone screen and saying so is the joke.
 */
export function scaleRuler(ctx, x, y, w, t, o = {}) {
  const q = eo(o.p ?? 1);
  ctx.save();
  ctx.strokeStyle = iceStroke(ctx, 0.9);
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * q, y); ctx.stroke();
  // metre ticks
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(207,227,255,0.55)';
  for (let i = 0; i <= 10; i++) {
    const tx = x + (w * i) / 10;
    if (tx > x + w * q) break;
    ctx.beginPath();
    ctx.moveTo(tx, y);
    ctx.lineTo(tx, y - (i % 5 === 0 ? 26 : 14));
    ctx.stroke();
  }
  // sun bead at 0
  ctx.fillStyle = VY.goldHi;
  ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
  label(ctx, 'MATAHARI · 9 MM', x, y + 44, { size: 24, color: VY.iceDim, track: 3, p: q });
  // earth speck at 1 m
  const ex = x + w / 170;
  ctx.fillStyle = '#7FB2FF';
  ctx.beginPath(); ctx.arc(ex, y, 2.6, 0, TAU); ctx.fill();
  label(ctx, 'BUMI · 0,09 MM', ex + 14, y + 44, { size: 24, color: VY.iceDim, track: 2, p: q });
  // voyager at 170 m
  const vx = x + w * q;
  ctx.fillStyle = VY.gold;
  ctx.beginPath();
  ctx.moveTo(vx, y - 12); ctx.lineTo(vx + 12, y); ctx.lineTo(vx, y + 12); ctx.lineTo(vx - 12, y);
  ctx.closePath(); ctx.fill();
  label(ctx, 'VOYAGER 1 · 170 M', vx, y - 40, { size: 26, color: VY.gold, align: 'center', track: 3, p: q });
  // off-panel star arrow
  ctx.strokeStyle = 'rgba(255,79,160,0.7)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(x + w + 20, y); ctx.lineTo(x + w + 120, y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x + w + 120, y); ctx.lineTo(x + w + 104, y - 9); ctx.lineTo(x + w + 104, y + 9);
  ctx.closePath(); ctx.fill();
  label(ctx, 'PROXIMA · 269 KM →', x + w + 132, y + 9, { size: 26, color: VY.rose, track: 3, p: q });
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 14. GREETING WALL — 55 languages as a typographic constellation
// ----------------------------------------------------------------------------

const GREET = [
  'HALO', 'HELLO', 'SALAM', 'HOLA', 'BONJOUR', 'CIAO', 'HALLO', 'OLÁ',
  'NAMASTE', 'SALAMALEIKUM', 'KONNICHIWA', 'ANNYEONG', 'NI HAO', 'SAWASDEE',
  'MABUHAY', 'KIA ORA', 'BULA', 'TALOFA', 'ALOHA', 'SHALOM', 'SALAAM',
  'MERHABA', 'GAMARJOBA', 'BAREV', 'SALOM', 'KALIMERA', 'SALVE', 'AVE',
  'TERE', 'LABDIENA', 'SVEIKI', 'ZDRASTVUITE', 'VITAYU', 'DOBRY DEN',
  'JÓ NAPOT', 'GOD DAG', 'HYVÄÄ PÄIVÄÄ', 'GOEDE DAG', 'BONAN TAGON',
  'SALUT', 'KAIRE', 'WAH', 'KWE', 'UMOLOMO', 'SANNU', 'JAMBO', 'SAWERE',
  'MWALIMU', 'HABARI', 'SELAM', 'NNOO', 'XIN CHÀO', 'SOUSTI', 'AINU',
];

/**
 * The greeting wall: 55 words orbit the record like a typographic
 * constellation. Each word fades in on its own beat and drifts a few
 * pixels, so the wall breathes instead of sitting as a flat list.
 */
export function greetingWall(ctx, cx, cy, r, t, o = {}) {
  const p = o.p ?? 1;
  const n = o.n ?? 24;
  ctx.save();
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const an = (i / n) * TAU + t * 0.05;
    const rr2 = r * (0.55 + 0.45 * h1(i + 5));
    const x = cx + Math.cos(an) * rr2;
    const y = cy + Math.sin(an) * rr2 * 0.78;
    const q = clamp(p * 2 - (i / n) * 1.2);
    if (q <= 0) continue;
    ctx.globalAlpha = q * (0.45 + 0.4 * h1(i + 9));
    ctx.font = `700 ${22 + Math.floor(h1(i + 2) * 16)}px JetBrains Mono, monospace`;
    ctx.fillStyle = i % 6 === 0 ? VY.gold : VY.ice;
    ctx.fillText(GREET[i % GREET.length], x, y + Math.sin(t * 0.8 + i) * 5);
  }
  ctx.restore();
}

/** music ring: 90 minutes of Earth music as radial bars around the record */
export function musicRing(ctx, cx, cy, r, t, o = {}) {
  const p = o.p ?? 1;
  const n = 72;
  ctx.save();
  ctx.globalAlpha = p;
  for (let i = 0; i < n; i++) {
    const an = (i / n) * TAU - Math.PI / 2;
    const v = 0.3 + 0.7 * Math.abs(Math.sin(i * 0.7 + t * 1.6) * Math.sin(i * 0.23 - t * 0.7));
    const l = 14 + v * 44;
    ctx.strokeStyle = i % 9 === 0 ? VY.gold : 'rgba(207,227,255,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r);
    ctx.lineTo(cx + Math.cos(an) * (r + l), cy + Math.sin(an) * (r + l));
    ctx.stroke();
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 15. LAUNCH & SILENCE — full-frame events
// ----------------------------------------------------------------------------

/** launch: vertical exhaust column, clamp flash, climb shake */
export function launchFlash(ctx, t, o = {}) {
  const q = clamp(o.p ?? 1);
  if (q <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(W / 2, H, W / 2, H * 0.2);
  g.addColorStop(0, `rgba(255,190,90,${0.5 * q})`);
  g.addColorStop(0.4, `rgba(255,120,40,${0.22 * q})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  const wob = Math.sin(t * 22) * 26;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 150 + wob, H + 60);
  ctx.lineTo(W / 2 - 40, H * 0.35);
  ctx.lineTo(W / 2 + 40, H * 0.35);
  ctx.lineTo(W / 2 + 150 - wob, H + 60);
  ctx.closePath();
  ctx.fill();
  // smoke billows
  const rd = rng(95);
  ctx.fillStyle = `rgba(200,200,210,${0.10 * q})`;
  for (let i = 0; i < 10; i++) {
    const bx = W / 2 + (rd() - 0.5) * 700;
    const by = H - 80 - rd() * 260 + Math.sin(t * 1.4 + i) * 20;
    ctx.beginPath(); ctx.arc(bx, by, 60 + rd() * 90, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/** rocket silhouette climbing with a jitter */
export function rocket(ctx, x, y, s, t, o = {}) {
  ctx.save();
  ctx.translate(x + Math.sin(t * 31) * 2, y);
  ctx.scale(s, s);
  ctx.fillStyle = VY.ice;
  ctx.beginPath();
  ctx.moveTo(0, -120);
  ctx.quadraticCurveTo(26, -60, 22, 40);
  ctx.lineTo(-22, 40);
  ctx.quadraticCurveTo(-26, -60, 0, -120);
  ctx.fill();
  ctx.fillStyle = VY.copper;
  ctx.fillRect(-22, 40, 44, 60);
  ctx.beginPath();
  ctx.moveTo(-22, 60); ctx.lineTo(-44, 104); ctx.lineTo(-22, 100);
  ctx.moveTo(22, 60); ctx.lineTo(44, 104); ctx.lineTo(22, 100);
  ctx.fill();
  // flame
  ctx.globalCompositeOperation = 'lighter';
  const fg = ctx.createLinearGradient(0, 100, 0, 220);
  fg.addColorStop(0, 'rgba(255,240,200,0.95)');
  fg.addColorStop(0.5, 'rgba(255,150,60,0.7)');
  fg.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(-16, 100);
  ctx.quadraticCurveTo(0, 200 + Math.sin(t * 40) * 24, 16, 100);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** the 48-hour silence: rose dropout bars across the signal area */
export function silenceBars(ctx, x, y, w, h, t, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.globalAlpha = p;
  const n = 48;
  const bw = w / n;
  for (let i = 0; i < n; i++) {
    const on = h1(i + Math.floor(t * 0.5)) > 0.55;
    ctx.fillStyle = on ? 'rgba(255,79,160,0.55)' : 'rgba(143,166,201,0.12)';
    const bh = on ? h * (0.3 + 0.6 * h1(i + 3)) : 6;
    ctx.fillRect(x + i * bw + 2, y + h - bh, bw - 4, bh);
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 16. YEAR LINE — 1977 → 2026 milestone rail with an advancing marker
// ----------------------------------------------------------------------------

/**
 * Horizontal year rail: milestone diamonds light in sequence, the marker
 * glides with out-expo and leaves a gold trail; the current year counts up.
 */
export function yearRail(ctx, x, y, w, t, o = {}) {
  const q = eo(o.p ?? 1);
  const marks = o.marks ?? [
    { yr: 1977, label: 'LUNCUR' },
    { yr: 1979, label: 'JUPITER' },
    { yr: 1980, label: 'SATURNUS' },
    { yr: 1990, label: 'TITIK BIRU' },
    { yr: 2012, label: 'HELIOPAUSE' },
    { yr: 2026, label: '1 HARI CAHAYA' },
  ];
  const y0 = 1977, y1 = 2026;
  ctx.save();
  ctx.strokeStyle = 'rgba(143,166,201,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  ctx.strokeStyle = goldStroke(ctx, 0.9);
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * q, y); ctx.stroke();
  marks.forEach((m, i) => {
    const mx = x + (w * (m.yr - y0)) / (y1 - y0);
    const lit = q >= (m.yr - y0) / (y1 - y0) - 0.001;
    ctx.fillStyle = lit ? VY.gold : 'rgba(143,166,201,0.3)';
    ctx.save();
    ctx.translate(mx, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
    label(ctx, m.label, mx, y + 46, { size: 22, color: lit ? VY.ice : VY.iceDim, align: 'center', track: 2, p: lit ? 1 : 0.4 });
    label(ctx, String(m.yr), mx, y - 26, { size: 24, color: lit ? VY.gold : VY.iceDim, align: 'center', track: 2, p: lit ? 1 : 0.4 });
  });
  // marker
  const mx = x + w * q;
  ctx.fillStyle = VY.goldHi;
  ctx.beginPath(); ctx.arc(mx, y, 10 + 3 * pulse(t, 1.2), 0, TAU); ctx.fill();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 17. FINAL PASS — grain, vignette, lens flare on the gold
// ----------------------------------------------------------------------------

/** console pass: fine grain + vignette + a single anamorphic flare */
export function spacePass(ctx, t, o = {}) {
  grain(ctx, t, o.grain ?? 0.045);
  // vignette
  ctx.save();
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${o.vig ?? 0.5})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // anamorphic flare streak when requested
  if (o.flare) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const fx = o.flare[0], fy = o.flare[1];
    const fg = ctx.createLinearGradient(fx - 420, fy, fx + 420, fy);
    fg.addColorStop(0, 'rgba(0,0,0,0)');
    fg.addColorStop(0.5, `rgba(255,233,168,${0.14 + 0.06 * Math.sin(t * 1.7)})`);
    fg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(fx - 420, fy - 3, 840, 6);
    ctx.restore();
  }
}

/** cut transition helper: white-gold flash frame for scene joins */
export function cutFlash(ctx, t, at, dur = 0.22) {
  const q = 1 - clamp((t - at) / dur);
  if (q <= 0) return;
  ctx.save();
  ctx.globalAlpha = q * 0.5;
  ctx.fillStyle = '#FFE9A8';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 18. RE-EXPORTS so scene files need a single import line
// ----------------------------------------------------------------------------

export {
  cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn,
  spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch,
  snow, rgba, W, H, grain, back, odo, idn, pulse, rr,
};

// ----------------------------------------------------------------------------
// 19. MISSION CHARTS — decay curve, distance stack, antenna aim cone
// ----------------------------------------------------------------------------

/**
 * RTG decay chart: watts vs year from 1977 to 2035. The observed line is
 * gold and solid; the forecast beyond "now" is dashed ice; the lost area
 * between the launch budget and today's ration is filled in rose so the
 * shrinking budget is a shape, not just a number.
 */
export function decayChart(ctx, x, y, w, h, t, o = {}) {
  const q = eo(o.p ?? 1);
  const y0 = 1977, y1 = 2035;
  const watts = (yr) => 470 - (yr - 1977) * 4;
  const X = (yr) => x + (w * (yr - y0)) / (y1 - y0);
  const Y = (wv) => y + h - (h * (wv - 150)) / (470 - 150);
  ctx.save();
  // axes
  ctx.strokeStyle = 'rgba(143,166,201,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h);
  ctx.stroke();
  // grid + year labels
  ctx.font = '600 22px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(143,166,201,0.6)';
  for (let yr = 1980; yr <= 2030; yr += 10) {
    ctx.strokeStyle = 'rgba(143,166,201,0.14)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(X(yr), y); ctx.lineTo(X(yr), y + h); ctx.stroke();
    ctx.fillText(String(yr), X(yr) - 24, y + h + 34);
  }
  for (let wv = 200; wv <= 450; wv += 100) {
    ctx.strokeStyle = 'rgba(143,166,201,0.14)';
    ctx.beginPath(); ctx.moveTo(x, Y(wv)); ctx.lineTo(x + w, Y(wv)); ctx.stroke();
    ctx.fillText(`${wv} W`, x - 84, Y(wv) + 8);
  }
  // lost-area fill between 470 budget and the decay line
  const nowYr = 2026;
  ctx.beginPath();
  ctx.moveTo(X(y0), Y(470));
  for (let yr = y0; yr <= nowYr; yr += 1) ctx.lineTo(X(yr), Y(watts(yr)));
  ctx.lineTo(X(nowYr), Y(470));
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,79,160,0.14)';
  ctx.globalAlpha = q;
  ctx.fill();
  // observed line
  ctx.strokeStyle = VY.gold;
  ctx.lineWidth = 3.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const upto = y0 + (nowYr - y0) * q;
  for (let yr = y0; yr <= upto; yr += 0.5) {
    const px = X(yr), py = Y(watts(yr));
    if (yr === y0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  // forecast dashed
  ctx.strokeStyle = 'rgba(207,227,255,0.4)';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(X(nowYr), Y(watts(nowYr)));
  for (let yr = nowYr; yr <= y1; yr += 1) ctx.lineTo(X(yr), Y(watts(yr)));
  ctx.stroke();
  ctx.setLineDash([]);
  // now marker
  ctx.globalAlpha = q;
  ctx.fillStyle = VY.goldHi;
  ctx.beginPath(); ctx.arc(X(nowYr), Y(watts(nowYr)), 8 + 3 * pulse(t, 1.1), 0, TAU); ctx.fill();
  label(ctx, '2026 · ±274 W', X(nowYr), Y(watts(nowYr)) - 26, { size: 24, color: VY.gold, align: 'center', track: 2, p: q });
  ctx.restore();
}

/**
 * Distance stack: three odometer rows (km, AU, light-time) sharing one
 * gold rule, each counting up on its own beat with a unit chip.
 */
export function distanceStack(ctx, x, y, t, o = {}) {
  const rows = [
    { v: 25900000000, suf: ' KM', lab: 'JARAK DARI BUMI', font: '800 96px Poppins, sans-serif' },
    { v: 173, suf: ' AU', lab: 'UNIT ASTRONOMI', font: '800 96px Poppins, sans-serif' },
    { v: 24, suf: ' JAM', lab: W > 0 ? 'WAKTU TEMPUH CAHAYA' : '', font: '800 96px Poppins, sans-serif' },
  ];
  ctx.save();
  rows.forEach((r, i) => {
    const q = P(t, 0.4 + i * 0.5, 1.6);
    const yy = y + i * 190;
    ctx.globalAlpha = eo(q);
    ctx.font = r.font;
    ctx.textAlign = 'left';
    ctx.fillStyle = i === 0 ? VY.goldHi : VY.ice;
    if (i === 0) { ctx.shadowColor = 'rgba(232,184,75,0.5)'; ctx.shadowBlur = 24; }
    ctx.fillText(idn(r.v * eo(q)) + r.suf, x, yy);
    ctx.shadowBlur = 0;
    label(ctx, r.lab, x, yy + 40, { size: 24, color: VY.iceDim, track: 4, p: eo(q) });
    ctx.strokeStyle = 'rgba(232,184,75,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, yy + 62); ctx.lineTo(x + 900 * eo(q), yy + 62); ctx.stroke();
  });
  ctx.restore();
}

/**
 * Antenna aim cone: the high-gain dish keeps a 0.5-degree pencil beam on
 * Earth across 25.9 billion km. Draws dish, cone, and the Earth dot with
 * a DSN station tick; the cone edge shimmers to sell the precision.
 */
export function aimCone(ctx, x, y, len, t, o = {}) {
  const q = eo(o.p ?? 1);
  ctx.save();
  ctx.globalAlpha = q;
  // dish at origin
  ctx.fillStyle = VY.ice;
  ctx.beginPath();
  ctx.ellipse(x, y, 46, 16, 0, Math.PI, TAU);
  ctx.fill();
  ctx.strokeStyle = VY.copperDk;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 26); ctx.stroke();
  // cone
  const spread = 34;
  const g = ctx.createLinearGradient(x, y, x + len, y);
  g.addColorStop(0, 'rgba(124,242,156,0.5)');
  g.addColorStop(1, 'rgba(124,242,156,0.08)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + len * q, y - spread + Math.sin(t * 3) * 2);
  ctx.lineTo(x + len * q, y + spread + Math.sin(t * 3 + 1) * 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(124,242,156,0.55)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + len * q, y - spread);
  ctx.moveTo(x, y); ctx.lineTo(x + len * q, y + spread);
  ctx.stroke();
  // earth + DSN tick at the far end
  const ex = x + len * q;
  ctx.fillStyle = '#7FB2FF';
  ctx.beginPath(); ctx.arc(ex, y, 7, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(207,227,255,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ex, y + 12); ctx.lineTo(ex, y + 40); ctx.stroke();
  label(ctx, 'BUMI · DSN', ex, y + 68, { size: 24, color: VY.iceDim, align: 'center', track: 3, p: q });
  ctx.restore();
}

/** star chart panel: constellation polyline with named anchors */
export function starChart(ctx, x, y, w, h, t, o = {}) {
  const q = eo(o.p ?? 1);
  const pts = [
    [0.12, 0.30], [0.28, 0.18], [0.44, 0.34], [0.60, 0.22],
    [0.76, 0.40], [0.88, 0.28], [0.70, 0.66], [0.46, 0.74], [0.24, 0.62],
  ];
  ctx.save();
  ctx.globalAlpha = q;
  // field stars
  const rd = rng(57);
  ctx.fillStyle = 'rgba(244,248,255,0.5)';
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = q * (0.15 + 0.4 * rd());
    ctx.beginPath();
    ctx.arc(x + rd() * w, y + rd() * h, 1 + rd() * 1.6, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = q;
  // constellation lines
  ctx.strokeStyle = 'rgba(207,227,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const xx = x + px * w, yy = y + py * h;
    if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
  });
  ctx.stroke();
  // anchors
  pts.forEach(([px, py], i) => {
    const xx = x + px * w, yy = y + py * h;
    ctx.fillStyle = i === 4 ? VY.gold : VY.ice;
    ctx.beginPath(); ctx.arc(xx, yy, i === 4 ? 7 : 4.5, 0, TAU); ctx.fill();
    if (i === 4) {
      ctx.strokeStyle = `rgba(232,184,75,${0.4 + 0.3 * pulse(t, 0.8)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(xx, yy, 14 + 4 * pulse(t, 0.8), 0, TAU); ctx.stroke();
      label(ctx, 'ARAH VOYAGER', xx, yy - 26, { size: 24, color: VY.gold, align: 'center', track: 3, p: q });
    }
  });
  ctx.restore();
}

/** binary pulse row: the record cover's instruction ticks, animated */
export function binaryRow(ctx, x, y, w, t, o = {}) {
  const n = o.n ?? 24;
  const bw = w / n;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const on = h1(i + 4) > 0.42;
    const hot = Math.floor(t * 6) % n === i;
    ctx.fillStyle = hot ? VY.goldHi : on ? VY.gold : 'rgba(143,166,201,0.3)';
    const bh = on ? 34 : 16;
    ctx.fillRect(x + i * bw + 3, y - bh, bw - 6, bh);
  }
  ctx.restore();
}

/** plasma hiss ring: the PWS "sound" of interstellar gas as a radial wave */
export function plasmaHiss(ctx, cx, cy, r, t, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = 'rgba(124,242,156,0.55)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let a = 0; a <= TAU + 0.04; a += 0.05) {
    const v = Math.sin(a * 9 + t * 3.1) * 6 + Math.sin(a * 23 - t * 2.2) * 4 + Math.sin(a * 47 + t * 5) * 2;
    const rr2 = r + v;
    const xx = cx + Math.cos(a) * rr2;
    const yy = cy + Math.sin(a) * rr2;
    if (a === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 20. COMPOSITE CONSOLES — ready-made blocks the scenes stack
// ----------------------------------------------------------------------------

/** top status bar: mission clock, DSN lock, power readout */
export function statusBar(ctx, t, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = 'rgba(6,8,18,0.66)';
  ctx.fillRect(0, 0, W, 120);
  ctx.strokeStyle = goldStroke(ctx, 0.6);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 120); ctx.lineTo(W, 120); ctx.stroke();
  label(ctx, 'Voyager 1 · VIL-1', 60, 74, { size: 28, color: VY.gold, track: 4, p });
  const days = Math.floor(17900 + t * 0);
  label(ctx, `MET ${idn(days)} HARI`, W / 2, 74, { size: 26, color: VY.iceDim, align: 'center', track: 3, p });
  lockLamp(ctx, W - 320, 60, t, { lock: o.lock ?? true, p, txt: o.lockTxt ?? 'DSN LOCK' });
  ctx.restore();
}

/** bottom telemetry ribbon: scrolling hex-ish glyphs, purely decorative
 *  but tied to time so the console never freezes */
export function telemetryRibbon(ctx, t, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.globalAlpha = 0.5 * p;
  ctx.font = '600 20px JetBrains Mono, monospace';
  ctx.fillStyle = VY.iceDim;
  const off = Math.floor(t * 14) % 64;
  for (let i = 0; i < 26; i++) {
    const v = Math.floor(h1(i + Math.floor(t * 2)) * 65535);
    ctx.fillText(v.toString(16).toUpperCase().padStart(4, '0'), 40 + i * 54 - off, H - 40);
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 21. MOTION GLUE — glide, trail and the closing message card
// ----------------------------------------------------------------------------

/**
 * Probe glide: the spacecraft drifts on a slow Lissajous while its thruster
 * lamp blinks and a faint ion trail fades behind it. Keeps every frame the
 * probe is on screen alive without adding noise particles.
 */
export function probeGlide(ctx, t, o = {}) {
  const bx = o.x ?? W / 2;
  const by = o.y ?? 1080;
  const x = bx + Math.sin(t * 0.32) * (o.ax ?? 46);
  const y = by + Math.sin(t * 0.21 + 1.2) * (o.ay ?? 26);
  // ion trail
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 1; i <= 7; i++) {
    const tx = bx + Math.sin((t - i * 0.12) * 0.32) * (o.ax ?? 46);
    const ty = by + Math.sin((t - i * 0.12) * 0.21 + 1.2) * (o.ay ?? 26);
    ctx.fillStyle = `rgba(124,242,156,${0.10 * (1 - i / 8) * (o.p ?? 1)})`;
    ctx.beginPath(); ctx.arc(tx + 60, ty + 10, 10 - i, 0, TAU); ctx.fill();
  }
  ctx.restore();
  probe(ctx, x, y, o.s ?? 1.2, { rot: (o.rot ?? -0.12) + Math.sin(t * 0.4) * 0.02, p: o.p ?? 1 });
  // thruster lamp
  ctx.save();
  ctx.fillStyle = pulse(t, 1.6) > 0.5 ? VY.teal : 'rgba(124,242,156,0.25)';
  ctx.beginPath(); ctx.arc(x - 66, y - 40, 4.5, 0, TAU); ctx.fill();
  ctx.restore();
  return [x, y];
}

/** golden trail ribbon: fading stroke behind a moving point */
export function goldenTrail(ctx, fn, t, o = {}) {
  const n = o.n ?? 26;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = n; i > 0; i--) {
    const [x0, y0] = fn(t - i * 0.05);
    const [x1, y1] = fn(t - (i - 1) * 0.05);
    ctx.strokeStyle = `rgba(232,184,75,${0.5 * (1 - i / n) * (o.a ?? 1)})`;
    ctx.lineWidth = 6 * (1 - i / n) + 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  ctx.restore();
}

/**
 * Closing message card: typewriter lines on a gold-bordered card with a
 * blinking caret and a comment chip; the record spins small at the corner
 * so the CTA stays inside the mission world.
 */
export function messageCard(ctx, x, y, w, h, lines, t, o = {}) {
  const q = eo(o.p ?? 1);
  ctx.save();
  ctx.globalAlpha = q;
  ctx.fillStyle = 'rgba(6,8,18,0.82)';
  rr(ctx, x, y, w, h, 28);
  ctx.fill();
  ctx.strokeStyle = goldStroke(ctx, 0.9);
  ctx.lineWidth = 2.6;
  ctx.stroke();
  record(ctx, x + w - 92, y + 92, 56, t, { spin: t * 0.8, p: q });
  ctx.font = '700 44px Poppins, sans-serif';
  ctx.textAlign = 'left';
  let ly = y + 108;
  let budget = Math.floor(clamp(q * 1.6) * 64);
  lines.forEach((ln, i) => {
    const take = Math.max(0, Math.min(ln.length, budget));
    budget -= ln.length;
    ctx.fillStyle = i === 0 ? VY.gold : VY.ice;
    ctx.fillText(ln.slice(0, take), x + 56, ly);
    if (take < ln.length && take > 0 && Math.sin(t * 8) > 0) {
      const cw = ctx.measureText(ln.slice(0, take)).width;
      ctx.fillRect(x + 56 + cw + 6, ly - 34, 18, 40);
    }
    ly += 68;
  });
  ctx.restore();
}
