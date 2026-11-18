import { txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import {
  HUD, deepSky, earthBall, roll, mono, chip, glass, callout, ringBurst, hudFrame, wordT,
} from './_bulan.mjs';
import { KRAK, PL, gview, gRing, gArc, gPin, gIndonesia } from './_krakatau.mjs';

// 02 — 4.800 KM
// Card 0: the sound front spreads over the Indian Ocean as the distance rolls;
// Perth on the way, Rodrigues at the edge ("they thought it was gunfire").
// Card 1: turn to Indonesia and lay the same yardstick from Sabang to Merauke.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const sm = (p) => EASE.smooth(clamp(p));
const ANG = 43.0; // Krakatau → Rodrigues, degrees of arc (4.780 km)

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.8);
  deepSky(ctx, t, cam, { seed: 31, band: 0.6, bandY: 860 });
  const t0 = wordT(scene, 0, 0);
  const tEmpat = wordT(scene, 0, 3);
  const tKm = wordT(scene, 0, 7);
  const t1 = wordT(scene, 1, 0, -0.1);
  const tSab = wordT(scene, 1, 2);
  const tMer = wordT(scene, 1, 4);

  const front = io(P(t, t0 + 0.05, tKm + 0.5 - t0));
  const th = ANG * front;
  const pR = io(P(t, t1 - 0.25, 1.3));
  const gv = gview(720, lerp(1060, 930, pR), lerp(470, 420, pR), lerp(86, 117, pR), lerp(-15, -3, pR));

  let pk = null;
  let pp = null;
  let pr = null;
  let ps = null;
  let pm = null;
  plane(ctx, cam, 0.6, () => {
    earthBall(ctx, gv.cx, gv.cy, gv.r, { lon: gv.lon, tilt: gv.tilt, sun: { x: -0.42, y: 0.42, z: 0.8 }, lights: 0.4 });
    gIndonesia(ctx, gv, 1, { a: 0.6 - 0.35 * pR, fill: 0.1 });
    if (front > 0.001) {
      const fade = 1 - 0.55 * P(t, tKm + 0.6, 1.2);
      gRing(ctx, gv, KRAK, th, { a: fade, lw: 5 });
      gRing(ctx, gv, KRAK, th * 0.9, { a: 0.32 * fade, lw: 3, glow: 0 });
      gRing(ctx, gv, KRAK, th * 0.8, { a: 0.16 * fade, lw: 2, glow: 0 });
    }
    gArc(ctx, gv, KRAK, PL.rodrigues, front, { color: '255,176,58', lw: 4, glow: 1 });
    pk = gPin(ctx, gv, KRAK[0], KRAK[1], { color: '#FF5A4A', r: 10, pulse: t * 1.1 });
    const aPerth = sm((th - 27.4) / 1.5);
    if (aPerth > 0.01) pp = gPin(ctx, gv, PL.perth[0], PL.perth[1], { a: aPerth, color: HUD.ice, r: 8 });
    const aRod = sm((th - 42.2) / 0.8);
    if (aRod > 0.01) pr = gPin(ctx, gv, PL.rodrigues[0], PL.rodrigues[1], { a: aRod, r: 10, pulse: t * 0.9 });
    // the yardstick across Indonesia
    const pS = io(P(t, tSab - 0.15, tMer + 0.35 - tSab));
    if (pR > 0.2) {
      ps = gPin(ctx, gv, PL.sabang[0], PL.sabang[1], { a: eo(P(t, tSab - 0.25, 0.4)), color: HUD.ice, r: 9 });
      gArc(ctx, gv, PL.sabang, PL.merauke, pS, { color: '159,216,255', lw: 5, lift: 0.06 });
      pm = gPin(ctx, gv, PL.merauke[0], PL.merauke[1], { a: eo(P(t, tMer - 0.1, 0.4)), color: HUD.ice, r: 9 });
    }
  });

  // labels (screen space)
  const aL = 1 - pR;
  if (pp) callout(ctx, pp.x, pp.y, pp.x + 70, pp.y + 110, 220, P(t, tKm - 1.2, 0.8), { label: 'PERTH', value: '3.100 km', side: 'right', vsize: 36, a: aL * pp.k });
  if (pr) {
    const ex = Math.max(400, pr.x - 30);
    callout(ctx, pr.x, pr.y, ex, pr.y + 300, 300, P(t, tKm + 0.1, 0.8), { label: 'PULAU RODRIGUES', value: '4.800 km', side: 'left', vsize: 40, a: aL * pr.k });
    chip(ctx, 'DIKIRA SUARA MERIAM', ex - 292, pr.y + 392, P(t, tKm + 0.5, 0.5), { align: 'left', color: '#FF8A6A', a: aL });
  }
  if (pk && aL > 0.01) {
    chip(ctx, 'KRAKATAU', pk.x + 30, pk.y + 64, eo(P(t, 0.2, 0.5)), { align: 'left', color: '#FF8A6A', a: aL });
  }
  if (ps) chip(ctx, 'SABANG', ps.x - 16, ps.y - 46, eo(P(t, tSab - 0.2, 0.4)), { align: 'right', color: HUD.ice, size: 22 });
  if (pm) chip(ctx, 'MERAUKE', pm.x + 16, pm.y + 50, eo(P(t, tMer, 0.4)), { align: 'left', color: HUD.ice, size: 22 });

  // hero: the distance
  const aH = eo(P(t, t0 - 0.1, 0.4));
  const val = (tt) => 4800 * io(P(tt, tEmpat - 0.1, tKm + 0.4 - tEmpat));
  if (aH > 0.01) {
    const w = roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, thousands: true, a: aH, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'KM', 104 + w + 18, 440, { size: 78, font: F.display, color: HUD.amber, alpha: aH });
    txt(ctx, pR < 0.5 ? 'DARI KRAKATAU · TERDENGAR SAMPAI RODRIGUES' : 'HAMPIR SEJAUH SABANG KE MERAUKE', 110, 492, {
      size: 25, font: F.mono6, color: HUD.amber, track: 5, alpha: aH,
    });
  }

  // card 1: the yardstick, side by side
  const aB = eo(P(t, tSab - 0.2, 0.6));
  if (aB > 0.01) {
    const bx = 104;
    const by = 1376;
    const bw = 1232;
    const bh = 168;
    glass(ctx, bx, by, bw, bh, aB, { r: 26, glowC: 'rgba(159,216,255,0.18)' });
    const maxL = bw - 360;
    const rows = [
      ['KRAKATAU – RODRIGUES', 4780, '4.800 KM', HUD.amber, 1],
      ['SABANG – MERAUKE', 5247, '5.247 KM', HUD.ice, io(P(t, tSab - 0.1, tMer + 0.3 - tSab))],
    ];
    rows.forEach(([lab, km, s, col, p], i) => {
      const y = by + 58 + i * 64;
      mono(ctx, lab, bx + 34, y - 16, { size: 19, color: HUD.sub, a: aB, track: 3 });
      ctx.save();
      ctx.globalAlpha *= aB;
      ctx.fillStyle = 'rgba(214,230,248,0.08)';
      ctx.fillRect(bx + 34, y - 4, maxL, 14);
      ctx.fillStyle = col;
      ctx.shadowColor = hexA(col, 0.8);
      ctx.shadowBlur = 14;
      ctx.fillRect(bx + 34, y - 4, maxL * (km / 5247) * p, 14);
      ctx.restore();
      txt(ctx, s, bx + bw - 34, y + 12, { size: 34, font: F.num, color: col, align: 'right', alpha: aB * sm(p * 1.5) });
    });
    ringBurst(ctx, bx + 34 + maxL, by + 122, P(t, tMer + 0.3, 0.8), { r: 60, color: '159,216,255' });
    txt(ctx, '91%', bx + 34 + maxL * (4780 / 5247) + 14, by + 64, { size: 22, font: F.mono6, color: HUD.amber, alpha: aB * eo(P(t, tMer + 0.2, 0.5)) });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
