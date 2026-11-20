// Episode 34 kit — "nemo": abyssal sonar world of the South Pacific Gyre.
// Everything procedural: layered abyss gradients with a lat/long graticule,
// bathymetric contour rings, marine snow, sonar ping rings + sweep wedge,
// a depth ruler in metres, gyre spirals with arrowheads, spacecraft silhouettes
// with solar panels, rust plasma re-entry streaks, hydrophone wave strips,
// glass sonar panels, odometer counters, overshoot chips. No images, no 3D.
import {
  cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn,
  spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch,
  snow, rgba, W, H,
} from './_cyano.mjs';
import { grain, back, odo } from './_madu.mjs';

export const NM = {
  bg0: '#020912',
  bg1: '#07243A',
  deep: '#01060D',
  sonar: '#35E0B4',
  bio: '#6FD8FF',
  foam: '#EAF4FF',
  steel: '#9FB8CC',
  rust: '#FF8A50',
  ink: '#04101E',
};

/** layered abyss background: gradient + graticule + surface glow + haze */
export function abyss(ctx, t, o = {}) {
  const g = ctx.createLinearGradient(0, -140, 0, H + 140);
  g.addColorStop(0, o.top ?? '#0A2C46');
  g.addColorStop(0.42, NM.bg1);
  g.addColorStop(1, NM.deep);
  ctx.fillStyle = g;
  ctx.fillRect(-140, -140, W + 280, H + 280);
  // surface light from above
  if (o.surface !== false) {
    const r = ctx.createRadialGradient(W / 2, -500, 80, W / 2, -500, 2100);
    r.addColorStop(0, `rgba(111,216,255,${0.16 + 0.04 * Math.sin(t * 0.7)})`);
    r.addColorStop(1, 'rgba(111,216,255,0)');
    ctx.fillStyle = r;
    ctx.fillRect(-140, -140, W + 280, H + 280);
  }
  // lat/long graticule
  ctx.save();
  ctx.strokeStyle = 'rgba(159,184,204,0.07)';
  ctx.lineWidth = 1.4;
  for (let x = 0; x <= W; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(t * 0.12 + x) * 3, -140);
    ctx.lineTo(x + Math.sin(t * 0.12 + x + 2) * 3, H + 140);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 220) {
    ctx.beginPath();
    ctx.moveTo(-140, y + Math.cos(t * 0.1 + y) * 3);
    ctx.lineTo(W + 140, y + Math.cos(t * 0.1 + y + 2) * 3);
    ctx.stroke();
  }
  ctx.restore();
  // baked abyss blotches
  const img = bake('nemo-blotch', W, H, (c) => {
    const rd = rng(41);
    for (let i = 0; i < 46; i++) {
      const x = rd() * W, y = rd() * H, r = 90 + rd() * 300;
      const gg = c.createRadialGradient(x, y, 6, x, y, r);
      gg.addColorStop(0, rd() < 0.62 ? `rgba(0,0,0,${0.05 + rd() * 0.05})` : `rgba(53,224,180,${0.02 + rd() * 0.02})`);
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gg;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  });
  ctx.save();
  ctx.globalAlpha = o.blotch ?? 0.5;
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/** bathymetric contour rings around a centre */
export function contours(ctx, cx, cy, t, o = {}) {
  const n = o.n ?? 6;
  ctx.save();
  ctx.strokeStyle = o.col ?? 'rgba(111,216,255,0.16)';
  ctx.lineWidth = o.lw ?? 1.6;
  for (let i = 1; i <= n; i++) {
    const r0 = i * (o.gap ?? 120);
    ctx.beginPath();
    for (let a = 0; a <= TAU + 0.05; a += 0.12) {
      const w = Math.sin(a * 3 + i * 1.7 + t * 0.15) * 10 + Math.sin(a * 7 - i) * 5;
      const r = r0 + w;
      const x = cx + Math.cos(a) * r * (o.sx ?? 1);
      const y = cy + Math.sin(a) * r * (o.sy ?? 0.72);
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** sonar ping: expanding rings + rotating sweep wedge */
export function sonar(ctx, cx, cy, t, o = {}) {
  const per = o.per ?? 2.6;
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const ph = ((t / per) + i / 3) % 1;
    const r = 40 + ph * (o.max ?? 620);
    ctx.strokeStyle = `rgba(53,224,180,${(1 - ph) * (o.a ?? 0.5)})`;
    ctx.lineWidth = 2.6 - ph * 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * (o.sq ?? 0.8), 0, 0, TAU);
    ctx.stroke();
  }
  const an = t * (o.spin ?? 0.9);
  const wg = ctx.createConicGradient ? null : null;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(an);
  const g = ctx.createLinearGradient(0, 0, o.max ?? 620, 0);
  g.addColorStop(0, `rgba(53,224,180,${0.22 * (o.a ?? 0.5) / 0.5})`);
  g.addColorStop(1, 'rgba(53,224,180,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, o.max ?? 620, -0.28, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = NM.sonar;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** left-edge depth ruler in metres with a travelling indicator */
export function depthRuler(ctx, t, o = {}) {
  const x = o.x ?? 92, y0 = o.y0 ?? 420, y1 = o.y1 ?? 1660;
  const max = o.max ?? 4000;
  ctx.save();
  ctx.strokeStyle = 'rgba(159,184,204,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
  ctx.font = '600 24px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(159,184,204,0.75)';
  for (let m = 0; m <= max; m += 1000) {
    const y = y0 + ((y1 - y0) * m) / max;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18, y); ctx.stroke();
    ctx.fillText(m === 0 ? '0 M' : `${m / 1000}.000 M`, x + 26, y + 8);
  }
  const ph = (t * 0.06) % 1;
  const y = y0 + (y1 - y0) * ph;
  ctx.fillStyle = NM.sonar;
  ctx.beginPath();
  ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y - 8); ctx.lineTo(x + 8, y + 8);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/** South Pacific Gyre: rotating spiral arms with arrowheads */
export function gyre(ctx, cx, cy, t, o = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * (o.spin ?? 0.12));
  ctx.strokeStyle = o.col ?? 'rgba(111,216,255,0.4)';
  ctx.lineWidth = o.lw ?? 3;
  for (let arm = 0; arm < 3; arm++) {
    ctx.save();
    ctx.rotate((arm / 3) * TAU);
    ctx.beginPath();
    for (let a = 0; a < 2.4; a += 0.08) {
      const r = 60 + a * (o.scale ?? 150);
      const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.8;
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const ae = 2.4, re = 60 + ae * (o.scale ?? 150);
    const ex = Math.cos(ae) * re, ey = Math.sin(ae) * re * 0.8;
    ctx.fillStyle = o.col ?? 'rgba(111,216,255,0.4)';
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(ae + 1.9);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-16, -7); ctx.lineTo(-16, 7);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}

/** spacecraft silhouette: body + two solar panels */
export function craft(ctx, x, y, s, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? 0);
  ctx.scale(s, s);
  ctx.fillStyle = o.col ?? NM.steel;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-26, -16, 52, 32, 8); else ctx.rect(-26, -16, 52, 32);
  ctx.fill();
  ctx.fillStyle = o.panel ?? 'rgba(111,216,255,0.75)';
  ctx.fillRect(-96, -10, 60, 20);
  ctx.fillRect(36, -10, 60, 20);
  ctx.strokeStyle = 'rgba(2,9,18,0.7)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-96 + i * 15, -10); ctx.lineTo(-96 + i * 15, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(36 + i * 15, -10); ctx.lineTo(36 + i * 15, 10); ctx.stroke();
  }
  ctx.fillStyle = o.col ?? NM.steel;
  ctx.beginPath(); ctx.arc(0, 22, 7, 0, TAU); ctx.fill();
  ctx.restore();
}

/** rust plasma re-entry streak with breakup sparks */
export function streak(ctx, x0, y0, x1, y1, t, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, 'rgba(255,138,80,0)');
  g.addColorStop(0.7, `rgba(255,138,80,${0.55 * p})`);
  g.addColorStop(1, `rgba(255,236,200,${0.9 * p})`);
  ctx.strokeStyle = g;
  ctx.lineWidth = o.lw ?? 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + (o.bow ?? 90), x1, y1);
  ctx.stroke();
  const rd = rng(77);
  ctx.fillStyle = `rgba(255,170,110,${0.7 * p})`;
  for (let i = 0; i < 10; i++) {
    const q = rd();
    const bx = lerp(x0, x1, q) + (rd() - 0.5) * 40;
    const by = lerp(y0, y1, q) + Math.sin(q * Math.PI) * (o.bow ?? 90) + (rd() - 0.5) * 40;
    ctx.beginPath(); ctx.arc(bx, by + Math.sin(t * 6 + i) * 4, 1.6 + rd() * 2.4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/** hydrophone wave strip */
export function waveStrip(ctx, x, y, w, h, t, o = {}) {
  ctx.save();
  ctx.strokeStyle = o.col ?? NM.sonar;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let px = 0; px <= w; px += 6) {
    const env = Math.sin((px / w) * Math.PI);
    const v = Math.sin(px * 0.09 + t * 5) * 0.5 + Math.sin(px * 0.23 - t * 3.1) * 0.35 + Math.sin(px * 0.031 + t) * 0.4;
    const yy = y + h / 2 + v * env * (h / 2) * (o.a ?? 1);
    if (px === 0) ctx.moveTo(x + px, yy); else ctx.lineTo(x + px, yy);
  }
  ctx.stroke();
  ctx.restore();
}

/** glass sonar panel */
export function panel(ctx, x, y, w, h, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.fillStyle = 'rgba(4,16,30,0.72)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 26); else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.strokeStyle = `rgba(53,224,180,${0.5 * p})`;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(111,216,255,0.25)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x + 26, y + 64); ctx.lineTo(x + w - 26, y + 64); ctx.stroke();
  ctx.restore();
}

/** sonar-styled heading: foam main + sonar accent + staggered mono kicker */
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
  ctx.fillStyle = NM.foam;
  ctx.shadowColor = 'rgba(111,216,255,0.5)';
  ctx.shadowBlur = 26;
  ctx.fillText(main, x, y);
  const mw = ctx.measureText(main).width;
  if (accent) {
    ctx.fillStyle = NM.sonar;
    ctx.shadowColor = 'rgba(53,224,180,0.55)';
    ctx.fillText(accent, x + mw + 26, y);
  }
  ctx.shadowBlur = 0;
  if (o.sub) {
    ctx.font = '600 30px JetBrains Mono, monospace';
    let lx = x, ci = 0;
    for (const ch of o.sub) {
      ctx.fillStyle = o.subCol ?? 'rgba(53,224,180,0.9)';
      ctx.globalAlpha = clamp(p * 1.9 - ci * 0.045);
      ctx.fillText(ch, lx, y + 58);
      lx += ctx.measureText(ch).width + 5;
      ci++;
    }
  }
  ctx.restore();
}

/** overshoot chip, sonar border */
export function chip(ctx, txt, x, y, o = {}) {
  const p = back(o.p ?? 1);
  ctx.save();
  ctx.globalAlpha = eo(o.p ?? 1);
  ctx.translate(x, y);
  ctx.scale(0.84 + 0.16 * p, 0.84 + 0.16 * p);
  ctx.font = '700 30px JetBrains Mono, monospace';
  const w = ctx.measureText(txt).width + 64;
  ctx.fillStyle = o.fill ?? 'rgba(4,16,30,0.8)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-w / 2, -34, w, 68, 34); else ctx.rect(-w / 2, -34, w, 68);
  ctx.fill();
  ctx.strokeStyle = o.col ?? NM.sonar;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.fillStyle = o.txtCol ?? NM.foam;
  ctx.textAlign = 'center';
  ctx.fillText(txt, 0, 11);
  ctx.restore();
}

/** marine snow + grain + vignette pass for every scene */
export function seaPass(ctx, t, o = {}) {
  snow(ctx, t, { n: o.n ?? 46, a: o.a ?? 0.4, color: '178,214,238', drift: 0.6 });
  grain(ctx, t, 0.05);
}

export { cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, snow, rgba, W, H, grain, back, odo };
