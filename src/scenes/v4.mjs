import { W, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import {
  HUD, deepSky, moonBall, earthBall, graticule, hero, mono, chip, donut, ringBurst, hudFrame,
  wordT, callout, roll, arrow, glass,
} from './_bulan.mjs';

// 04 — GOYANG (v3)
// Libration, measured. The Moon wobbles ±7,9° in longitude and ±6,7° in
// latitude against a fixed crosshair; terrain that sits beyond the mean limb
// lights up amber as it rocks into view. Inset: the elliptical orbit (shape
// exaggerated) with Earth at the focus — the Moon speeds up at perigee, which
// is exactly what makes it rock. The ring around the Moon fills to 59 %.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

function kepler(M, e) {
  let E = M;
  for (let i = 0; i < 6; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.9);
  deepSky(ctx, t, cam, { seed: 41, band: 0.7, bandY: 1150 });

  const tWob = wordT(scene, 0, 2, -0.1); // "kaku."
  const tEll = wordT(scene, 1, 0, -0.05); // "Orbitnya"
  const tGoy = wordT(scene, 1, 4, -0.1); // "bergoyang,"
  const tIntip = wordT(scene, 1, 6, -0.1); // "kita"
  const tLima = wordT(scene, 1, 9, -0.05); // "lima"
  const tPersen = wordT(scene, 1, 12); // "persen."

  // one anomalistic month = PERIOD seconds of screen time
  const PERIOD = 3.4;
  const amp = io(P(t, tWob, 1.6));
  const M = ((t - tWob) / PERIOD) * TAU;
  const ex = 2.0; // motion exaggerated (labelled) so the wobble and the slivers read on a phone
  const lonLib = 7.9 * Math.sin(M) * amp * ex;
  const latLib = 6.7 * Math.sin(M + 1.15) * amp * ex;

  const mx = 720;
  const my = 1065;
  const mr = 300;
  const extra = eo(P(t, tGoy, 0.8));

  plane(ctx, cam, 0.85, () => {
    // fixed reference: mean limb + crosshair
    ctx.save();
    ctx.globalAlpha *= eo(P(t, 0.3, 0.6));
    ctx.strokeStyle = 'rgba(214,230,248,0.35)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(mx, my, mr + 10, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    moonBall(ctx, mx, my, mr, {
      rot: -lonLib / 360, tilt: latLib, sun: { x: -0.25, y: 0.3, z: 0.92 }, glow: 0.45, shine: 0.05, extra,
    });
    graticule(ctx, mx, my, mr, { rot: -lonLib / 360, tilt: latLib, a: 0.16 + 0.1 * amp, color: '255,214,150' });

    ctx.save();
    ctx.globalAlpha *= eo(P(t, 0.3, 0.6));
    ctx.strokeStyle = 'rgba(160,220,255,0.75)';
    ctx.lineWidth = 2;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      ctx.beginPath();
      ctx.moveTo(mx + dx * (mr + 22), my + dy * (mr + 22));
      ctx.lineTo(mx + dx * (mr + 70), my + dy * (mr + 70));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(mx - 22, my);
    ctx.lineTo(mx + 22, my);
    ctx.moveTo(mx, my - 22);
    ctx.lineTo(mx, my + 22);
    ctx.stroke();
    ctx.restore();

    // where the sub-Earth point sits right now (it drifts around the crosshair)
    const sx = mx + Math.sin((lonLib * Math.PI) / 180) * mr;
    const sy = my - Math.sin((latLib * Math.PI) / 180) * mr;
    if (amp > 0.05) {
      ctx.save();
      ctx.globalAlpha *= amp;
      ctx.fillStyle = HUD.amber;
      ctx.shadowColor = 'rgba(255,176,58,0.9)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // the 59 % ring
    const pR = io(P(t, tIntip, tPersen + 0.3 - tIntip));
    if (pR > 0.001) {
      donut(ctx, mx, my, mr + 90, 22, [
        { v: 0.5, color: 'rgba(243,239,228,0.92)' },
        { v: 0.09, color: HUD.amber, glow: true },
        { v: 0.41, color: 'rgba(120,140,170,0.28)', hatch: true },
      ], pR, { t });
      const lab = (frac, r, s, sub, col, side) => {
        const ang = -Math.PI / 2 + frac * TAU;
        const ax = mx + Math.cos(ang) * (mr + 90);
        const ay = my + Math.sin(ang) * (mr + 90);
        const exx = mx + Math.cos(ang) * (mr + 130);
        const eyy = my + Math.sin(ang) * (mr + 130);
        callout(ctx, ax, ay, exx, eyy, 170, P(t, r, 0.7), { label: sub, value: s, side, accent: col, vsize: 36, lsize: 18 });
      };
      lab(0.25, tIntip + 0.2, '50%', 'SELALU', HUD.bone, 'right');
      lab(0.545, tLima, '+9%', 'GOYANGAN', HUD.amber, 'left');
      lab(0.795, tPersen - 0.3, '41%', 'TIDAK PERNAH', 'rgba(150,170,200,0.9)', 'left');
    }
  });

  // libration axes readouts
  const aAx = eo(P(t, tGoy, 0.6)) * (1 - eo(P(t, tIntip + 0.3, 0.5)));
  if (aAx > 0.01) {
    const yy = my + mr + 60;
    arrow(ctx, mx, yy, mx - 150, yy, { a: aAx, lw: 3, head: 16, color: HUD.amber });
    arrow(ctx, mx, yy, mx + 150, yy, { a: aAx, lw: 3, head: 16, color: HUD.amber });
    mono(ctx, '±7,9° BUJUR', mx, yy + 44, { size: 22, color: HUD.amber, align: 'center', a: aAx, track: 3 });
    mono(ctx, 'GERAK DIPERBESAR', mx, yy + 72, { size: 16, color: HUD.sub, align: 'center', a: aAx, track: 2 });
    const xx = mx + mr + 60;
    arrow(ctx, xx, my, xx, my - 130, { a: aAx, lw: 3, head: 16, color: HUD.ice });
    arrow(ctx, xx, my, xx, my + 130, { a: aAx, lw: 3, head: 16, color: HUD.ice });
    ctx.save();
    ctx.translate(xx + 40, my);
    ctx.rotate(Math.PI / 2);
    mono(ctx, '±6,7° LINTANG', 0, 0, { size: 22, color: HUD.ice, align: 'center', a: aAx, track: 3 });
    ctx.restore();
  }

  // inset: elliptical orbit (top-right)
  const aIn = eo(P(t, tEll, 0.6));
  if (aIn > 0.01) {
    const icx = 1100;
    const icy = 430;
    const a = 200;
    const e = 0.5;
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e;
    const fx = icx - c;
    glass(ctx, icx - a - 40, icy - b - 70, 2 * a + 80, 2 * b + 140, aIn, { r: 24 });
    ctx.save();
    ctx.globalAlpha *= aIn;
    ctx.strokeStyle = 'rgba(168,206,248,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(icx, icy, a, b, 0, 0, TAU);
    ctx.stroke();
    // position: true anomaly from a gentler e so the speed-up reads but does not snap
    const nu = kepler(M, 0.3);
    const rr = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
    const px = fx - Math.cos(nu) * rr;
    const py = icy - Math.sin(nu) * rr;
    // swept sector (Kepler's second law)
    ctx.fillStyle = 'rgba(255,176,58,0.16)';
    ctx.beginPath();
    ctx.moveTo(fx, icy);
    for (let k = 0; k <= 12; k++) {
      const n2 = nu - 0.5 + (k / 12) * 0.5;
      const r2 = (a * (1 - e * e)) / (1 + e * Math.cos(n2));
      ctx.lineTo(fx - Math.cos(n2) * r2, icy - Math.sin(n2) * r2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,176,58,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, icy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();
    earthBall(ctx, fx, icy, 30, { a: aIn, lon: 110 - t * 8, tilt: 20, sun: { x: -0.8, y: 0.2, z: 0.5 }, halo: 0.6 });
    moonBall(ctx, px, py, 13, { a: aIn, sun: { x: -0.8, y: 0.2, z: 0.5 }, glow: 0.2, rim: 0 });
    mono(ctx, 'PERIGEE', icx - a + 6, icy + b + 36, { size: 17, color: HUD.amber, a: aIn });
    mono(ctx, '363.300 km', icx - a + 6, icy + b + 58, { size: 17, color: HUD.text, a: aIn, track: 1 });
    mono(ctx, 'APOGEE', icx + a - 6, icy + b + 36, { size: 17, color: HUD.ice, a: aIn, align: 'right' });
    mono(ctx, '405.500 km', icx + a - 6, icy + b + 58, { size: 17, color: HUD.text, a: aIn, align: 'right', track: 1 });
    mono(ctx, 'ORBIT ELIPS · BENTUK DIPERBESAR', icx, icy - b - 30, { size: 16, color: HUD.sub, a: aIn, align: 'center', track: 2 });
  }

  // hero: LIBRASI → 59%
  const tSwap = tLima - 0.15;
  const aLib = 1 - eo(P(t, tSwap, 0.35));
  if (aLib > 0.01) hero(ctx, 'LIBRASI', 'GOYANGAN SEMU BULAN', 104, 430, P(t, scene.captions[0].from, 0.8), { size: 150, a: aLib });
  const pN = io(P(t, tLima, tPersen + 0.2 - tLima));
  const aN = eo(P(t, tSwap + 0.1, 0.4));
  if (aN > 0.01) {
    const val = (tt) => {
      const q = io(P(tt, tLima, tPersen + 0.2 - tLima));
      return q < 0.5 ? 50 * eo(q * 2) : 50 + 9 * io((q - 0.5) * 2);
    };
    const w = roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aN, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, '%', 104 + w + 6, 440, { size: 150, font: F.display, color: HUD.amber, alpha: aN });
    txt(ctx, 'YANG BISA KITA INTIP', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aN });
  }
  ringBurst(ctx, mx, my, P(t, tPersen, 0.9), { r: mr + 130 });
  chip(ctx, 'TIDAK KAKU', mx, my - mr - 100, P(t, tWob, 0.5), { color: HUD.amber, a: 1 - eo(P(t, tEll + 0.6, 0.4)) });

  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
