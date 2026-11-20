// Episode 33 kit — "madu": tomb-light honey world.
// Everything is drawn procedurally: tomb gradients with god-ray shafts and
// drifting dust, a faint honeycomb lattice, clay amphorae and glass jars with
// glossy honey gradients and drips, bees with blurred wing arcs, microbes
// that desiccate (osmosis), papyrus sheets with hieroglyph glyph-rows,
// cartouches, bracketed chart plates, glass HUD panels, gradient bar charts,
// year rulers, sparkles. No image assets, no 3D.
import {
  cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn,
  spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, W, H,
} from './_cyano.mjs';

export const MD = {
  amber: '#FFB627',
  gold: '#F5D08C',
  honey: '#E8901A',
  deep: '#A05A0C',
  wine: '#6E3A10',
  faience: '#4FC0B4',
  linen: '#EAD9B0',
  bone: '#F3EFE4',
  ink: '#2A1C0E',
  red: '#C4502E',
  dim: 'rgba(243,239,228,0.55)',
};

/* ─────────────────────────── background world ─────────────────────────── */

/** tomb background: warm vertical gradient + top glow + faint hex lattice */
export function tomb(ctx, t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, o.top || '#1B1108');
  g.addColorStop(0.55, '#0E0803');
  g.addColorStop(1, '#050302');
  ctx.fillStyle = g;
  ctx.fillRect(-120, -120, W + 240, H + 240);
  const r = ctx.createRadialGradient(W * 0.5, -260, 60, W * 0.5, -260, 1900);
  r.addColorStop(0, 'rgba(255,176,64,0.16)');
  r.addColorStop(1, 'rgba(255,176,64,0)');
  ctx.fillStyle = r;
  ctx.fillRect(-120, -120, W + 240, H + 240);
  if (o.hex !== 0) hexGrid(ctx, 0, 0, W, H, 118, { a: o.hex ?? 0.05, t });
}

/** god-ray shafts falling from a tomb ceiling slit */
export function shafts(ctx, t, o = {}) {
  const n = o.n ?? 3;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const rd = rng(o.seed ?? 4, i);
    const x = (o.x ?? 180) + i * (o.gap ?? 430) + rd() * 90;
    const rot = -0.16 + rd() * 0.1;
    const wdt = 150 + rd() * 150;
    const a = (o.a ?? 0.06) * (0.72 + 0.28 * Math.sin(t * 0.6 + i * 2.1));
    ctx.save();
    ctx.translate(x, -80);
    ctx.rotate(rot);
    for (const [e, m] of [[1, 0.34], [0.62, 0.4], [0.3, 0.5]]) {
      const g = ctx.createLinearGradient(0, 0, 0, H * 1.25);
      g.addColorStop(0, `rgba(255,206,120,${a * m})`);
      g.addColorStop(0.7, `rgba(255,186,90,${a * m * 0.45})`);
      g.addColorStop(1, 'rgba(255,186,90,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-wdt * 0.28 * e, 0);
      ctx.lineTo(wdt * 0.28 * e, 0);
      ctx.lineTo(wdt * 0.95 * e, H * 1.25);
      ctx.lineTo(-wdt * 0.95 * e, H * 1.25);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

/** drifting dust motes caught in the light */
export function dust(ctx, t, seed = 9, n = 30, col = '255,206,130') {
  const rd = rng(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const x0 = rd() * W, y0 = rd() * H, s = 1.1 + rd() * 2.6, sp = 6 + rd() * 16;
    const x = (x0 + Math.sin(t * 0.11 + i) * 34 + t * sp * 0.22) % (W + 60) - 30;
    const y = (y0 - t * sp * 0.5 + Math.cos(t * 0.17 + i * 1.7) * 26 + H * 4) % H;
    const a = 0.10 + 0.16 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 2.4));
    ctx.fillStyle = `rgba(${col},${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** honeycomb lattice; `fill` = fraction of cells flooded with amber */
export function hexGrid(ctx, x0, y0, w, h, cell, o = {}) {
  const a = o.a ?? 0.06, fill = o.fill ?? 0, t = o.t ?? 0;
  const rw = cell * 0.866, rh = cell * 0.75;
  const rd = rng(o.seed ?? 3);
  ctx.save();
  ctx.lineWidth = o.lw ?? 1.6;
  for (let row = -1, y = y0; y < y0 + h + cell; y += rh, row++) {
    for (let x = x0 + (row % 2 ? rw : 0); x < x0 + w + cell; x += rw * 2) {
      const q = rd();
      const flooded = q < fill;
      const hex = () => {
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const an = Math.PI / 6 + (k * TAU) / 6;
          const px = x + Math.cos(an) * cell * 0.5;
          const py = y + Math.sin(an) * cell * 0.5;
          if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        ctx.closePath();
      };
      if (flooded) {
        const pul = 0.5 + 0.5 * Math.sin(t * 1.3 + q * 40);
        const A = o.fillA ?? 1;
        const g = ctx.createLinearGradient(0, y - cell * 0.5, 0, y + cell * 0.5);
        g.addColorStop(0, `rgba(255,214,120,${(0.50 + 0.14 * pul) * A})`);
        g.addColorStop(0.45, `rgba(232,144,26,${(0.42 + 0.12 * pul) * A})`);
        g.addColorStop(1, `rgba(122,62,8,${(0.40 + 0.10 * pul) * A})`);
        hex();
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,226,150,${0.32 * A})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,244,214,${0.28 * A * (0.6 + 0.4 * pul)})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x - cell * 0.26, y - cell * 0.28);
        ctx.lineTo(x, y - cell * 0.42);
        ctx.lineTo(x + cell * 0.26, y - cell * 0.28);
        ctx.stroke();
        ctx.lineWidth = o.lw ?? 1.6;
      } else {
        hex();
        ctx.fillStyle = `rgba(0,0,0,${0.22 * (o.cav ?? 1)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,190,100,${a})`;
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

export function vign(ctx, a = 0.46) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.34, W / 2, H / 2, H * 0.86);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/* ─────────────────────────────── objects ─────────────────────────────── */

/** stone pedestal block */
export function pedestal(ctx, cx, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#3A2A18');
  g.addColorStop(0.12, '#241A0E');
  g.addColorStop(1, '#120C06');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, y);
  ctx.lineTo(cx + w / 2, y);
  ctx.lineTo(cx + w / 2 + 26, y + h);
  ctx.lineTo(cx - w / 2 - 26, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,196,110,0.30)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, y + 1.5);
  ctx.lineTo(cx + w / 2, y + 1.5);
  ctx.stroke();
}

/**
 * honey vessel. kind 'clay' = Egyptian amphora, 'glass' = modern jar.
 * o: { s, seal, level, glow, drip, open }
 */
export function jar(ctx, cx, cy, s, o = {}) {
  const kind = o.kind ?? 'clay';
  const seal = o.seal ?? true;
  const glow = o.glow ?? 0;
  const tint = o.tint ?? 0;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  // contact shadow
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.beginPath();
  ctx.ellipse(0, 150, 118, 22, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 150, 150, 30, 0, 0, TAU);
  ctx.fill();
  if (glow > 0) {
    const g = ctx.createRadialGradient(0, 20, 20, 0, 20, 340);
    g.addColorStop(0, `rgba(255,178,50,${0.30 * glow})`);
    g.addColorStop(1, 'rgba(255,178,50,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 20, 340, 0, TAU);
    ctx.fill();
  }
  const body = () => {
    ctx.beginPath();
    if (kind === 'clay') {
      ctx.moveTo(-46, -150);
      ctx.bezierCurveTo(-52, -120, -96, -96, -102, -30);
      ctx.bezierCurveTo(-108, 44, -70, 118, -34, 148);
      ctx.lineTo(34, 148);
      ctx.bezierCurveTo(70, 118, 108, 44, 102, -30);
      ctx.bezierCurveTo(96, -96, 52, -120, 46, -150);
      ctx.closePath();
    } else {
      const r = 34;
      ctx.moveTo(-88, -118);
      ctx.lineTo(-88, 108);
      ctx.quadraticCurveTo(-88, 148, -88 + r, 148);
      ctx.lineTo(88 - r, 148);
      ctx.quadraticCurveTo(88, 148, 88, 108);
      ctx.lineTo(88, -118);
      ctx.closePath();
    }
  };
  if (kind === 'clay') {
    // glowing honey-clay body
    const bg = ctx.createRadialGradient(-36, -64, 24, 0, 10, 268);
    bg.addColorStop(0, '#F7C56A');
    bg.addColorStop(0.35, '#D9820F');
    bg.addColorStop(0.75, '#7A3E08');
    bg.addColorStop(1, '#4A2404');
    body();
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.save();
    body();
    ctx.clip();
    // inner occlusion rim
    ctx.strokeStyle = 'rgba(30,15,4,0.5)';
    ctx.lineWidth = 30;
    body();
    ctx.stroke();
    // left rim light
    ctx.strokeStyle = 'rgba(255,236,180,0.5)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-88, -70);
    ctx.bezierCurveTo(-98, -10, -84, 70, -52, 122);
    ctx.stroke();
    // painted bands with zigzag
    for (const by of [16, 62]) {
      ctx.fillStyle = 'rgba(52,28,10,0.78)';
      ctx.fillRect(-110, by, 220, 26);
      ctx.strokeStyle = 'rgba(255,206,120,0.55)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let zx = -100; zx <= 100; zx += 16) {
        ctx.moveTo(zx, by + 20);
        ctx.lineTo(zx + 8, by + 7);
        ctx.lineTo(zx + 16, by + 20);
      }
      ctx.stroke();
    }
    // throwing rings + clay speckle
    ctx.strokeStyle = 'rgba(30,15,4,0.14)';
    ctx.lineWidth = 3;
    for (let yy = -120; yy <= 130; yy += 22) {
      ctx.beginPath();
      ctx.ellipse(0, yy, 98 - Math.abs(yy - 10) * 0.22, 7, 0, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
    const spd = rng(5);
    ctx.fillStyle = 'rgba(58,32,12,0.22)';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(-90 + spd() * 180, -130 + spd() * 260, 1.2 + spd() * 2.2, 0, TAU);
      ctx.fill();
    }
    if (tint > 0) {
      const tg = ctx.createLinearGradient(0, -150, 0, 150);
      tg.addColorStop(0, `rgba(64,32,6,${0.75 * tint})`);
      tg.addColorStop(1, `rgba(48,22,4,${0.85 * tint})`);
      ctx.fillStyle = tg;
      ctx.fillRect(-120, -160, 240, 320);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,206,120,0.45)';
    ctx.lineWidth = 3;
    body();
    ctx.stroke();
    // handles
    ctx.strokeStyle = 'rgba(150,92,34,0.95)';
    ctx.lineWidth = 12;
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sgn * 86, -74);
      ctx.bezierCurveTo(sgn * 146, -66, sgn * 148, -6, sgn * 96, 6);
      ctx.stroke();
    }
    // neck collar
    ctx.fillStyle = '#5E3410';
    ctx.fillRect(-50, -172, 100, 26);
    ctx.fillStyle = 'rgba(255,206,120,0.35)';
    ctx.fillRect(-50, -172, 100, 5);
  } else {
    // glass jar with honey fill
    ctx.save();
    body();
    ctx.clip();
    const hg = ctx.createLinearGradient(0, -118, 0, 150);
    hg.addColorStop(0, '#FFD37A');
    hg.addColorStop(0.4, MD.honey);
    hg.addColorStop(1, '#7A3E08');
    ctx.fillStyle = hg;
    ctx.fillRect(-100, -40, 200, 300);
    ctx.fillStyle = 'rgba(255,226,150,0.75)';
    ctx.beginPath();
    ctx.ellipse(0, -40, 88, 9, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,244,214,0.10)';
    ctx.fillRect(-100, -118, 200, 80);
    if (tint > 0) {
      ctx.fillStyle = `rgba(64,32,6,${0.6 * tint})`;
      ctx.fillRect(-100, -118, 200, 270);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(236,244,246,0.55)';
    ctx.lineWidth = 4;
    body();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-64, -96);
    ctx.lineTo(-64, 96);
    ctx.stroke();
    ctx.fillStyle = 'rgba(230,240,242,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, -118, 92, 12, 0, 0, TAU);
    ctx.fill();
  }
  // rim
  ctx.fillStyle = kind === 'clay' ? '#4A2C12' : 'rgba(230,240,242,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, kind === 'clay' ? -172 : -118, kind === 'clay' ? 52 : 92, 12, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,140,0.6)';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (seal) {
    const ry = kind === 'clay' ? -172 : -118;
    const rw = kind === 'clay' ? 60 : 100;
    // linen cloth hugging the rim, scalloped drape over the neck
    const cg = ctx.createLinearGradient(0, ry - 46, 0, ry + 34);
    cg.addColorStop(0, '#F4E6C4');
    cg.addColorStop(1, '#C7AE7E');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(-rw, ry + 2);
    ctx.quadraticCurveTo(0, ry - 52, rw, ry + 2);
    ctx.lineTo(rw + 6, ry + 26);
    for (let k = 0; k < 4; k++) {
      const x1 = rw + 6 - ((k + 0.5) * (rw + 6) * 2) / 4;
      const x2 = rw + 6 - ((k + 1) * (rw + 6) * 2) / 4;
      ctx.quadraticCurveTo(x1, ry + 40, x2, ry + 26);
    }
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.rect(-rw - 8, ry - 52, rw * 2 + 16, 56);
    ctx.clip();
    ctx.strokeStyle = 'rgba(120,86,40,0.12)';
    ctx.lineWidth = 1.4;
    for (let gx = -rw - 8; gx < rw + 8; gx += 7) {
      ctx.beginPath(); ctx.moveTo(gx, ry - 52); ctx.lineTo(gx + 10, ry + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + 10, ry - 52); ctx.lineTo(gx, ry + 4); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(120,86,40,0.45)';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * rw * 0.36, ry - 34);
      ctx.lineTo(i * rw * 0.42, ry + 18);
      ctx.stroke();
    }
    // cord + knot
    ctx.strokeStyle = MD.red;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-rw - 2, ry + 12);
    ctx.quadraticCurveTo(0, ry + 22, rw + 2, ry + 12);
    ctx.stroke();
    ctx.fillStyle = MD.red;
    ctx.beginPath();
    ctx.arc(rw * 0.7, ry + 20, 7, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  if (o.drip > 0) drip(ctx, cx + s * 46, cy - s * 140, s * (60 + 240 * o.drip), o.drip);
}

/** a glossy honey thread stretching into a droplet */
export function drip(ctx, x, y, len, p = 1) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,190,70,0.9)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + 6, y + len * 0.4, x - 5, y + len * 0.7, x, y + len);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,190,0.8)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x - 1.6, y + 4);
  ctx.lineTo(x - 1.2, y + len * 0.8);
  ctx.stroke();
  const r = 9 + 7 * p;
  const g = ctx.createRadialGradient(x - r * 0.3, y + len - r * 0.3, 1, x, y + len, r);
  g.addColorStop(0, '#FFE9AE');
  g.addColorStop(1, MD.honey);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y + len + r * 0.4, r * 0.86, r, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** bee with blurred wing arcs; o.trail = [[x,y],...] flight path in scene space */
export function bee(ctx, x, y, s, t, o = {}) {
  ctx.save();
  if (o.trail) {
    ctx.strokeStyle = 'rgba(255,206,120,0.35)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 12]);
    ctx.lineDashOffset = -t * 60;
    ctx.beginPath();
    o.trail.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 2.2) * 0.12 + (o.tilt ?? 0));
  ctx.scale(s, s);
  const flap = Math.sin(t * 34);
  for (const sgn of [-1, 1]) {
    ctx.save();
    ctx.rotate(sgn * 0.15);
    ctx.fillStyle = `rgba(214,234,242,${0.20 + 0.10 * flap})`;
    ctx.beginPath();
    ctx.ellipse(-6, -26 + sgn * 2, 30, 12 + 4 * flap, -0.5 + sgn * 0.25, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(214,234,242,0.10)';
    ctx.beginPath();
    ctx.ellipse(-2, -30 + sgn * 2, 34, 13 - 3 * flap, -0.42 + sgn * 0.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  const bg = ctx.createLinearGradient(-34, 0, 34, 0);
  bg.addColorStop(0, '#F2B32A');
  bg.addColorStop(1, '#C97A10');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 24, 0, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 24, 0, 0, TAU);
  ctx.clip();
  ctx.fillStyle = '#2A1C0E';
  for (const bx of [-10, 4, 18]) ctx.fillRect(bx, -26, 9, 52);
  ctx.restore();
  ctx.fillStyle = '#2A1C0E';
  ctx.beginPath();
  ctx.arc(36, -2, 13, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#2A1C0E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.lineTo(-46, 4);
  ctx.stroke();
  ctx.restore();
}

/** microbe; dry 0→1 desiccates (osmosis), dead 0→1 cracks and fades */
export function microbe(ctx, x, y, s, o = {}) {
  const dry = o.dry ?? 0, dead = o.dead ?? 0;
  const sc = s * (1 - 0.42 * dry);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.rotate(o.rot ?? 0);
  ctx.beginPath();
  const STEPS = 56;
  for (let k = 0; k <= STEPS; k++) {
    const an = (k / STEPS) * TAU;
    const wr = 1 + (0.075 - 0.05 * dry) * Math.sin(an * 7)
      - 0.09 * dry * Math.sin(an * 11) + 0.03 * Math.sin(an * 3);
    const px = Math.cos(an) * 42 * wr, py = Math.sin(an) * 34 * wr;
    if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-10, -10, 4, 0, 0, 54);
  if (dry < 0.5) {
    g.addColorStop(0, 'rgba(146,224,206,0.9)');
    g.addColorStop(0.7, 'rgba(64,140,122,0.9)');
    g.addColorStop(1, 'rgba(30,92,80,0.9)');
  } else {
    g.addColorStop(0, 'rgba(178,128,68,0.85)');
    g.addColorStop(1, 'rgba(78,48,20,0.85)');
  }
  ctx.fillStyle = g;
  ctx.globalAlpha = 1 - 0.45 * dead;
  ctx.fill();
  ctx.strokeStyle = `rgba(226,246,238,${0.55 - 0.3 * dry})`;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  // rim light
  ctx.strokeStyle = `rgba(255,255,255,${0.3 - 0.2 * dry})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 38, Math.PI * 1.1, Math.PI * 1.7);
  ctx.stroke();
  // cilia
  ctx.strokeStyle = `rgba(200,236,226,${0.4 - 0.3 * dry})`;
  ctx.lineWidth = 1.8;
  for (let k = 0; k < 10; k++) {
    const an = (k / 10) * TAU + 0.2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(an) * 42, Math.sin(an) * 34);
    ctx.lineTo(Math.cos(an) * 52, Math.sin(an) * 42);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(18,58,50,0.85)';
  ctx.beginPath();
  ctx.arc(6, 2, 10 * (1 - 0.4 * dry), 0, TAU);
  ctx.fill();
  if (dead > 0.2) {
    ctx.strokeStyle = `rgba(40,24,10,${dead})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-24 + i * 16, -18 + i * 6);
      ctx.lineTo(-8 + i * 16, 14 - i * 4);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ───────────────────────── plates, frames, charts ───────────────────────── */

/** papyrus / linen sheet with fibers, stains and deckled edges */
export function papyrus(ctx, x, y, w, h, o = {}) {
  const rd = rng(o.seed ?? 6);
  ctx.save();
  ctx.beginPath();
  const j = 7;
  ctx.moveTo(x + rd() * j, y + rd() * j);
  for (let px = x; px <= x + w; px += 60) ctx.lineTo(px + rd() * j, y + rd() * j - j / 2);
  for (let py = y; py <= y + h; py += 60) ctx.lineTo(x + w + rd() * j - j / 2, py + rd() * j);
  for (let px = x + w; px >= x; px -= 60) ctx.lineTo(px + rd() * j - j, y + h + rd() * j - j / 2);
  for (let py = y + h; py >= y; py -= 60) ctx.lineTo(x + rd() * j - j / 2, py + rd() * j - j);
  ctx.closePath();
  const g = ctx.createLinearGradient(x, y, x + w * 0.3, y + h);
  g.addColorStop(0, '#EFE0BC');
  g.addColorStop(0.5, '#E6D3A8');
  g.addColorStop(1, '#D9C294');
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 12;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(150,120,70,0.16)';
  ctx.lineWidth = 1.4;
  for (let py = y + 4; py < y + h; py += 7) {
    ctx.beginPath();
    ctx.moveTo(x, py + Math.sin(py) * 1.2);
    ctx.lineTo(x + w, py);
    ctx.stroke();
  }
  for (let px = x + 5; px < x + w; px += 11) {
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px + 2, y + h);
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const sx = x + rd() * w, sy = y + rd() * h, sr = 30 + rd() * 90;
    const sg = ctx.createRadialGradient(sx, sy, 2, sx, sy, sr);
    sg.addColorStop(0, 'rgba(150,110,50,0.14)');
    sg.addColorStop(1, 'rgba(150,110,50,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(120,90,45,0.20)';
  ctx.lineWidth = 3;
  for (const fx of [0.34, 0.68]) {
    ctx.beginPath();
    ctx.moveTo(x + w * fx, y);
    ctx.lineTo(x + w * fx + 6, y + h);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

/** hieroglyph glyph-row: ankh, eye, water, reed, sun, bird — vector strokes */
export function glyphRow(ctx, x, y, w, n, seed = 2, o = {}) {
  const rd = rng(seed);
  const col = o.col ?? 'rgba(58,36,14,0.8)';
  const s = o.s ?? 1;
  ctx.save();
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineWidth = 3 * s;
  ctx.lineCap = 'round';
  const step = w / n;
  for (let i = 0; i < n; i++) {
    const cx = x + step * (i + 0.5), k = Math.floor(rd() * 6);
    ctx.save();
    ctx.translate(cx, y);
    ctx.scale(s, s);
    if (k === 0) { // ankh
      ctx.beginPath();
      ctx.ellipse(0, -14, 8, 11, 0, 0, TAU);
      ctx.moveTo(0, -3); ctx.lineTo(0, 18);
      ctx.moveTo(-11, 4); ctx.lineTo(11, 4);
      ctx.stroke();
    } else if (k === 1) { // eye
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.quadraticCurveTo(0, -12, 14, 0);
      ctx.quadraticCurveTo(0, 8, -14, 0);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -2, 4, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(6, 16); ctx.stroke();
    } else if (k === 2) { // water
      ctx.beginPath();
      for (let z = -14; z <= 14; z += 7) { ctx.moveTo(z, -4); ctx.lineTo(z + 3.5, -10); ctx.lineTo(z + 7, -4); }
      for (let z = -14; z <= 14; z += 7) { ctx.moveTo(z, 8); ctx.lineTo(z + 3.5, 2); ctx.lineTo(z + 7, 8); }
      ctx.stroke();
    } else if (k === 3) { // reed
      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.lineTo(0, -14);
      ctx.moveTo(0, -6); ctx.lineTo(-8, -14);
      ctx.moveTo(0, 0); ctx.lineTo(8, -8);
      ctx.stroke();
    } else if (k === 4) { // sun disc
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
    } else { // bird
      ctx.beginPath();
      ctx.moveTo(-12, 8); ctx.quadraticCurveTo(-2, -6, 6, -4);
      ctx.quadraticCurveTo(14, -3, 12, 4);
      ctx.moveTo(6, -4); ctx.lineTo(8, -12); ctx.lineTo(12, -10);
      ctx.moveTo(-4, 8); ctx.lineTo(-4, 16);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

/** Egyptian cartouche capsule around monospace text */
export function cartouche(ctx, cx, cy, text, o = {}) {
  ctx.save();
  ctx.font = `600 ${o.size ?? 34}px ${'JetBrains Mono, monospace'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width + (o.track ?? 4) * text.length;
  const w = tw + 92, h = (o.h ?? 74);
  const p = o.p ?? 1;
  ctx.globalAlpha = p;
  ctx.strokeStyle = o.col ?? MD.gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + h / 2, cy - h / 2);
  ctx.lineTo(cx + w / 2 - h / 2, cy - h / 2);
  ctx.arc(cx + w / 2 - h / 2, cy, h / 2, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(cx - w / 2 + h / 2, cy + h / 2);
  ctx.arc(cx - w / 2 + h / 2, cy, h / 2, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx + w / 2 + 10, cy - 16);
  ctx.lineTo(cx + w / 2 + 10, cy + 16);
  ctx.stroke();
  ctx.fillStyle = o.text ?? MD.linen;
  let lx = cx - tw / 2;
  for (const ch of text) {
    ctx.textAlign = 'left';
    ctx.fillText(ch, lx, cy + 2);
    lx += ctx.measureText(ch).width + (o.track ?? 4);
  }
  ctx.restore();
}

/** bracketed chart plate (Ep27 grammar): thin frame + corner brackets */
export function plateFrame(ctx, x, y, w, h, o = {}) {
  const col = o.col ?? 'rgba(255,182,39,0.75)';
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.globalAlpha = o.a ?? 0.8;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 5;
  const L = 46;
  for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    ctx.beginPath();
    ctx.moveTo(cx + sx * L, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * L);
    ctx.stroke();
  }
  ctx.restore();
}

/** dark glass HUD panel (Ep26 grammar) */
export function glassPanel(ctx, x, y, w, h, o = {}) {
  ctx.save();
  const r = o.r ?? 26;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = o.fill ?? 'rgba(24,17,10,0.66)';
  ctx.fill();
  ctx.strokeStyle = o.col ?? 'rgba(245,208,140,0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,236,190,0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y + 2);
  ctx.lineTo(x + w - r, y + 2);
  ctx.stroke();
  ctx.restore();
}

/** gradient bar chart with glowing values, axis, grid, stagger */
export function bars(ctx, x, y, w, h, rows, p, o = {}) {
  const n = rows.length;
  const bw = o.bw ?? Math.min(150, (w / n) * 0.42);
  const gap = w / n;
  ctx.save();
  ctx.strokeStyle = 'rgba(243,239,228,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  if (o.grid) {
    ctx.setLineDash([4, 10]);
    ctx.strokeStyle = 'rgba(243,239,228,0.14)';
    for (let i = 1; i <= 4; i++) {
      const gy = y + h - (h * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
  rows.forEach((r, i) => {
    const q = eo(clamp((p - i * (o.stag ?? 0.12)) / (1 - (n - 1) * (o.stag ?? 0.12))));
    const bh = h * r.v * q;
    const bx = x + gap * i + gap / 2 - bw / 2;
    const g = ctx.createLinearGradient(0, y + h - bh, 0, y + h);
    g.addColorStop(0, r.c0 ?? '#FFD37A');
    g.addColorStop(1, r.c1 ?? MD.honey);
    ctx.fillStyle = g;
    ctx.shadowColor = `rgba(255,182,39,${0.35 * q})`;
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.moveTo(bx, y + h);
    ctx.lineTo(bx, y + h - bh + 8);
    ctx.quadraticCurveTo(bx, y + h - bh, bx + 8, y + h - bh);
    ctx.lineTo(bx + bw - 8, y + h - bh);
    ctx.quadraticCurveTo(bx + bw, y + h - bh, bx + bw, y + h - bh + 8);
    ctx.lineTo(bx + bw, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    if (q > 0.6) {
      ctx.globalAlpha = (q - 0.6) / 0.4;
      ctx.fillStyle = MD.bone;
      ctx.font = '800 46px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(255,196,90,0.8)';
      ctx.shadowBlur = 22;
      ctx.fillText(r.count != null ? fmtInt(r.count * q) + (r.suffix ?? '') : r.txt, bx + bw / 2, y + h - bh - 26);
      ctx.shadowColor = 'transparent';
      ctx.font = '600 28px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(243,239,228,0.72)';
      ctx.fillText(r.label, bx + bw / 2, y + h + 46);
      if (r.sub) {
        ctx.fillStyle = 'rgba(243,239,228,0.42)';
        ctx.font = '500 24px JetBrains Mono, monospace';
        ctx.fillText(r.sub, bx + bw / 2, y + h + 82);
      }
      ctx.globalAlpha = 1;
    }
  });
  ctx.restore();
}

/** horizontal year ruler with minor ticks and lollipop marks */
export function yearRuler(ctx, x0, x1, y, maxYear, p, marks, o = {}) {
  ctx.save();
  const ux = (x1 - x0) / maxYear;
  ctx.strokeStyle = 'rgba(243,239,228,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x0 + (x1 - x0) * eo(p), y);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.font = '500 24px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(243,239,228,0.5)';
  ctx.textAlign = 'center';
  for (let yr = 0; yr <= maxYear; yr += 500) {
    const x = x0 + yr * ux;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + (yr % 1000 === 0 ? 20 : 11));
    ctx.stroke();
    if (yr % 1000 === 0) ctx.fillText(String(yr), x, y + 52);
  }
  marks.forEach((m, i) => {
    const q = eo(clamp((p - 0.35 - i * 0.18) / 0.3));
    if (q <= 0) return;
    const x = x0 + m.year * ux;
    ctx.globalAlpha = q;
    ctx.strokeStyle = m.col ?? MD.amber;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 90 * q);
    ctx.stroke();
    ctx.fillStyle = m.col ?? MD.amber;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, TAU);
    ctx.fill();
    ctx.font = '800 44px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255,196,90,0.7)';
    ctx.shadowBlur = 20;
    ctx.fillText(m.count != null ? fmtInt(m.count * q) : m.txt, x, y - 110 - (i % 2) * 64);
    ctx.shadowColor = 'transparent';
    ctx.font = '600 26px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(243,239,228,0.7)';
    ctx.fillText(m.label, x, y - 152 - (i % 2) * 64);
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}

/** four-point glint for crystals and gold */
export function sparkle(ctx, x, y, s, a, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = `rgba(255,240,200,${a})`;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
  ctx.moveTo(0, -s); ctx.lineTo(0, s);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, -s * 0.45); ctx.lineTo(s * 0.45, s * 0.45);
  ctx.moveTo(-s * 0.45, s * 0.45); ctx.lineTo(s * 0.45, -s * 0.45);
  ctx.stroke();
  ctx.restore();
}

/** rising steam curls */
export function steam(ctx, x, y, t, o = {}) {
  ctx.save();
  ctx.strokeStyle = `rgba(255,236,200,${o.a ?? 0.22})`;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < (o.n ?? 3); i++) {
    const ph = (t * 0.5 + i * 0.37) % 1;
    ctx.globalAlpha = (1 - ph) * (o.a ?? 0.22);
    ctx.beginPath();
    for (let k = 0; k <= 20; k++) {
      const q = k / 20;
      const px = x + i * 60 - 60 + Math.sin(q * 5 + t * 1.4 + i) * 22 * q;
      const py = y - q * 260 * ph - q * 120;
      if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** display heading + mono kicker, masked reveal */
export function heading(ctx, main, sub, x, y, o = {}) {
  const p = eo(o.p ?? 1);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 20, y - 160, (W - x + 40) * p, 320);
  ctx.clip();
  ctx.font = `800 ${o.size ?? 104}px Poppins, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = o.col ?? MD.bone;
  ctx.shadowColor = 'rgba(255,196,90,0.35)';
  ctx.shadowBlur = 30;
  ctx.fillText(main, x, y);
  ctx.shadowColor = 'transparent';
  if (o.amber) {
    const wMain = ctx.measureText(main).width;
    ctx.fillStyle = MD.amber;
    ctx.shadowColor = 'rgba(255,182,39,0.55)';
    ctx.shadowBlur = 30;
    ctx.fillText(o.amber, x + wMain + 26, y);
    ctx.shadowColor = 'transparent';
  }
  if (sub) {
    ctx.font = '600 30px JetBrains Mono, monospace';
    let lx = x;
    let ci = 0;
    for (const ch of sub) {
      ctx.fillStyle = o.subCol ?? 'rgba(255,182,39,0.9)';
      ctx.globalAlpha = clamp(p * 1.9 - ci * 0.045);
      ctx.fillText(ch, lx, y + 58);
      lx += ctx.measureText(ch).width + 5;
      ci++;
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** small rounded chip with mono caption (house grammar) */
export function chip(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = `600 ${o.size ?? 27}px JetBrains Mono, monospace`;
  const tw = ctx.measureText(s).width + 5 * s.length;
  const w = tw + 64, h = o.h ?? 62;
  const p = eo(o.p ?? 1);
  ctx.globalAlpha = p;
  ctx.translate(x, y);
  const sc = 0.84 + 0.16 * back(o.p ?? 1);
  ctx.scale(sc, sc);
  ctx.beginPath();
  ctx.moveTo(-w / 2 + h / 2, -h / 2);
  ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, h / 2);
  ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, h / 2);
  ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, h / 2);
  ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, h / 2);
  ctx.closePath();
  ctx.fillStyle = o.fill ?? 'rgba(20,13,7,0.82)';
  ctx.fill();
  ctx.strokeStyle = o.col ?? 'rgba(255,182,39,0.8)';
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.fillStyle = o.text ?? MD.gold;
  ctx.textBaseline = 'middle';
  let lx = -tw / 2;
  for (const ch of s) {
    ctx.fillText(ch, lx, 2);
    lx += ctx.measureText(ch).width + 5;
  }
  ctx.restore();
}

/** leader line with dot terminal */
export function leader(ctx, x0, y0, x1, y1, o = {}) {
  ctx.save();
  ctx.strokeStyle = o.col ?? 'rgba(243,239,228,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.fillStyle = o.col ?? 'rgba(243,239,228,0.5)';
  ctx.beginPath();
  ctx.arc(x0, y0, 5, 0, TAU);
  ctx.fill();
  ctx.restore();
}


/* ─────────────── pro pass: depth, texture, counters, easing ─────────────── */

/** parallax camera: f<1 background lag, f>1 foreground lead */
export const camPar = (cam, f, fx = W / 2, fy = 1030) =>
  [fx + (cam[0] - fx) * f, fy + (cam[1] - fy) * f, 1 + (cam[2] - 1) * f];

/** 24 fps film grain — alive but never dirty */
export function grain(ctx, t, a = 0.05) {
  const rd = rng(9000 + Math.floor(t * 24));
  ctx.save();
  for (let i = 0; i < 240; i++) {
    const x = rd() * W, y = rd() * H;
    const w = rd() < 0.86 ? 1.4 : 2.6;
    const white = rd() < 0.5;
    ctx.fillStyle = white ? `rgba(255,246,228,${a * (0.3 + 0.7 * rd())})`
      : `rgba(0,0,0,${a * (0.3 + 0.7 * rd())})`;
    ctx.fillRect(x, y, w, w);
  }
  ctx.restore();
}

/** baked plaster wall: blotches + hairline cracks with a lit edge */
export function wallTex(ctx, seed = 7, a = 0.5) {
  const img = bake(`madu-wall-${seed}`, W, H, (c) => {
    const rd = rng(seed);
    for (let i = 0; i < 70; i++) {
      const x = rd() * W, y = rd() * H, r = 60 + rd() * 260;
      const g = c.createRadialGradient(x, y, 4, x, y, r);
      const dark = rd() < 0.6;
      g.addColorStop(0, dark ? `rgba(0,0,0,${0.05 + rd() * 0.06})` : `rgba(255,214,150,${0.03 + rd() * 0.04})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
    for (let k = 0; k < 6; k++) {
      let x = rd() * W, y = rd() * H * 0.8;
      c.strokeStyle = 'rgba(0,0,0,0.34)';
      c.lineWidth = 1.6 + rd() * 1.4;
      c.beginPath();
      c.moveTo(x, y);
      const n = 6 + Math.floor(rd() * 8);
      for (let i = 0; i < n; i++) {
        x += (rd() - 0.5) * 160;
        y += 40 + rd() * 120;
        c.lineTo(x, y);
      }
      c.stroke();
      c.strokeStyle = 'rgba(255,220,160,0.10)';
      c.lineWidth = 1.2;
      c.stroke();
    }
  });
  ctx.save();
  ctx.globalAlpha = a;
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/** water caustics: wandering highlight bands */
export function caustics(ctx, x, y, w, h, t, a = 0.25) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const yy = y + h * (0.18 + 0.22 * i);
    ctx.strokeStyle = `rgba(255,240,200,${a * (0.45 + 0.55 * Math.sin(t * 0.9 + i * 1.7))})`;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let px = 0; px <= w; px += 12) {
      const py = yy + Math.sin(px * 0.02 + t * 1.3 + i * 2.2) * 4.5
        + Math.sin(px * 0.043 - t * 0.8 + i) * 2.5;
      if (px) ctx.lineTo(x + px, py); else ctx.moveTo(x + px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** rising ember sparks with flicker */
export function embers(ctx, t, n = 14, seed = 3) {
  const rd = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x0 = rd() * W, sp = 26 + rd() * 60, ph = rd();
    const life = ((t * 0.06 + ph) % 1);
    const x = x0 + Math.sin(t * 0.7 + i * 2.4) * 46;
    const y = H * 1.02 - life * H * 0.85;
    const fl = 0.5 + 0.5 * Math.sin(t * 9 + i * 3.1);
    const a = (1 - life) * 0.5 * fl;
    ctx.strokeStyle = `rgba(255,176,64,${a})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.sin(t * 0.7 + i * 2.4) * 6, y + 14 + sp * 0.12);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,214,120,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + fl * 1.6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** out-back easing for pops with overshoot */
export const back = (p) => {
  const c = 1.70158, q = clamp(p) - 1;
  return 1 + (c + 1) * q * q * q + c * q * q;
};

const fmtInt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** odometer count-up number */
export function odo(ctx, val, x, y, p, o = {}) {
  ctx.save();
  ctx.font = o.font ?? '800 52px Poppins, sans-serif';
  ctx.textAlign = o.align ?? 'center';
  ctx.fillStyle = o.col ?? MD.bone;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 22; }
  ctx.fillText(fmtInt(val * eo(p)) + (o.suffix ?? ''), x, y);
  ctx.restore();
}

export { cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, W, H };
