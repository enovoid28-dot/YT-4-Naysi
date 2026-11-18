import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import {
  HUD, deepSky, earthBall, roll, hero, chip, ringBurst, hudFrame, wordT, reticle,
} from './_bulan.mjs';
import {
  KRAK, PL, CONES, gview, gproj, gRing, gIndonesia, gPin, chartView, mixView, cxy, kmPx, drawChart,
  chartPin, scaleBar, shockRing, blastFlash, ashTop, plumeTop, scope, ledMeter, lightning,
} from './_krakatau.mjs';

// 01 — KRAKATAU
// Card 0: the globe, a pressure pulse leaving one point, Indonesia lights up.
// Card 1: whip into the Sunda Strait chart, the year rolls to 1883, the old
// three-coned island under a smoking vent — and it goes.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const sm = (p) => EASE.smooth(clamp(p));

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.9);
  const tSuara = wordT(scene, 0, 0);
  const tTer = wordT(scene, 0, 1);
  const tIndo = wordT(scene, 0, 6);
  const t1 = wordT(scene, 1, 0, -0.12);
  const tSeribu = wordT(scene, 1, 1);
  const tTiga = wordT(scene, 1, 6);
  const tKrak = wordT(scene, 1, 7);
  const tBoom = wordT(scene, 1, 8, -0.06);

  const pW = P(t, t1 - 0.14, 0.55);
  const aGlobe = 1 - sm((pW - 0.4) / 0.45);
  const aChart = sm((pW - 0.3) / 0.45);
  const boom = t > tBoom;
  const shk = boom ? 30 * Math.pow(1 - P(t, tBoom, 1.5), 2) : 0;

  ctx.save();
  if (shk > 0.1) ctx.translate(Math.sin(t * 73) * shk, Math.cos(t * 61) * shk * 0.8);

  /* ------------------------------ the globe ------------------------------ */
  if (aGlobe > 0.01) {
    deepSky(ctx, t, cam, { seed: 24, band: 0.55, bandY: 820 });
    const gv = gview(720, 1030, 420, 113 - t * 1.4, -5);
    const kp = gproj(gv, KRAK[0], KRAK[1]);
    const zoom = 1 + 3.2 * EASE.inCubic(pW);
    ctx.save();
    ctx.globalAlpha *= aGlobe;
    plane(ctx, cam, 0.6, () => {
      ctx.save();
      ctx.translate(kp.x, kp.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-kp.x, -kp.y);
      earthBall(ctx, gv.cx, gv.cy, gv.r, { lon: gv.lon, tilt: gv.tilt, sun: { x: -0.5, y: 0.36, z: 0.79 }, lights: 0.5 });
      // pressure pulses leaving Krakatau; the big one lands on "terkeras"
      const pings = [[0.0, 0.5, 3], [0.55, 0.55, 3], [tTer - 0.04, 1, 6], [tTer + 0.5, 0.6, 4], [tTer + 1.1, 0.45, 3], [tTer + 1.7, 0.35, 3]];
      for (const [ts, k, lw] of pings) {
        if (t < ts) continue;
        const th = (t - ts) * (k > 0.9 ? 44 : 30);
        if (th > 80) continue;
        gRing(ctx, gv, KRAK, th, { a: k * (1 - th / 80), lw });
      }
      gIndonesia(ctx, gv, P(t, tIndo - 0.3, 0.7), { a: 0.95, fill: 0.16 });
      const pk = gPin(ctx, gv, KRAK[0], KRAK[1], { color: '#FF5A4A', r: 10, pulse: t * 1.3 });
      ctx.restore();
      if (pk) {
        const sx = kp.x + (pk.x - kp.x) * zoom;
        const sy = kp.y + (pk.y - kp.y) * zoom;
        ringBurst(ctx, sx, sy, P(t, tTer - 0.04, 0.9), { r: 220, color: '255,226,180' });
      }
      chip(ctx, 'INDONESIA', 820, 1330, P(t, tIndo - 0.1, 0.5), { color: HUD.amber, a: 1 - pW });
    });
    ctx.restore();
  }

  /* ------------------------------ the strait ----------------------------- */
  let kx = 0;
  let ky = 0;
  if (aChart > 0.01) {
    const vA = chartView(105.66, -5.98, 300, 720, 1000);
    const vB = chartView(105.58, -6.06, 760, 720, 1000);
    const vC = chartView(105.437, -6.117, 4300, 720, 1000);
    const pIn = eo(P(t, t1 - 0.08, 1.7));
    const pZ = io(P(t, tKrak - 0.45, 1.3));
    let v = mixView(vA, vB, pIn);
    if (pZ > 0) v = mixView(v, vC, pZ);
    const post = t > tBoom + 0.45;
    ctx.save();
    ctx.globalAlpha *= aChart;
    drawChart(ctx, v, {
      era: post ? 'post' : 'pre', t, heat: post ? 0 : sm(P(t, tKrak - 0.2, 0.8)), labels: 1 - pZ, grid: 0.9,
    });
    [kx, ky] = cxy(v, KRAK[0], KRAK[1]);
    // Perboewatan had been erupting since May: a thin plume before the end
    if (!post) {
      const [px, py] = cxy(v, CONES[0][0], CONES[0][1]);
      plumeTop(ctx, px, py, 120 + 380 * pZ, -2.35, t, { a: 0.35 + 0.5 * pZ, w: 10 + 44 * pZ, seed: 4 });
    }
    const aPin = eo(P(t, t1 + 0.5, 0.6)) * (1 - pZ);
    chartPin(ctx, v, KRAK[0], KRAK[1], 'KRAKATAU', { a: aPin, dot: '#FF5A4A', size: 24, r: 9 });
    chartPin(ctx, v, PL.anyer[0], PL.anyer[1], 'ANYER', { a: aPin * 0.9, dot: HUD.ice });
    chartPin(ctx, v, PL.telukbetung[0], PL.telukbetung[1], 'TELUK BETUNG', { a: aPin * 0.9, dot: HUD.ice });
    chartPin(ctx, v, PL.merak[0], PL.merak[1], 'MERAK', { a: aPin * 0.9, dot: HUD.ice });
    scaleBar(ctx, v, 1010, 1470, 20, { a: aPin });
    const aCone = sm((pZ - 0.55) / 0.35) * (1 - P(t, tBoom - 0.05, 0.2));
    CONES.forEach(([la, lo, n, h], i) => {
      chartPin(ctx, v, la, lo, `${n} · ${h}`, { a: aCone * sm((pZ - 0.6 - i * 0.1) / 0.25), r: 6, size: 21 });
    });
    reticle(ctx, kx, ky, kmPx(v, 7.5), t, sm((pZ - 0.4) / 0.5) * (1 - P(t, tBoom, 0.25)), {
      label: 'KRAKATAU · 27.08.1883', spin: 0.08,
    });
    if (boom || t > tBoom - 0.02) {
      const q = P(t, tBoom, 1.0);
      const aR = 30 + 600 * eo(P(t, tBoom, 2.0));
      ashTop(ctx, kx, ky, aR, t, { hot: 1 - P(t, tBoom + 0.2, 1.5), seed: 7, n: 42 });
      lightning(ctx, kx, ky, aR, t, { a: sm(P(t, tBoom + 0.5, 0.4)), seed: 9 });
      shockRing(ctx, kx, ky, 40 + 1800 * eo(P(t, tBoom, 1.8)), { a: 1 - P(t, tBoom + 0.7, 1.1) });
      shockRing(ctx, kx, ky, 40 + 1500 * eo(P(t, tBoom + 0.32, 1.8)), { a: 0.6 * (1 - P(t, tBoom + 1.0, 0.9)), w: 18 });
      blastFlash(ctx, kx, ky, q);
    }
    ctx.restore();
  }
  ctx.restore();

  /* --------------------------------- HUD --------------------------------- */
  const loud = 0.28 + 0.06 * Math.sin(t * 7)
    + 1.25 * Math.exp(-Math.max(0, t - tTer) * 2.2) * (t > tTer - 0.05 ? 1 : 0)
    + 1.5 * Math.exp(-Math.max(0, t - tBoom) * 1.6) * (boom ? 1 : 0);
  const spike = Math.max(Math.exp(-Math.max(0, t - tTer) * 2) * (t > tTer - 0.05 ? 1 : 0), boom ? Math.exp(-(t - tBoom) * 1.4) : 0);
  scope(ctx, 104, 1478, 1080, 110, t, loud, { a: eo(P(t, 0.05, 0.5)) * 0.95, spike });
  ledMeter(ctx, 1268, 1424, 64, 108, Math.min(1, loud * 0.75), t, { a: eo(P(t, 0.05, 0.5)), n: 10 });

  // hero, card 0
  const a0 = 1 - eo(P(t, t1 - 0.2, 0.3));
  if (a0 > 0.01) hero(ctx, 'SUARA TERKERAS', 'DALAM SEJARAH · YANG PERNAH TERCATAT', 104, 420, P(t, Math.min(0.12, tSuara - 0.08), 0.8), { size: 132, a: a0 });
  // hero, card 1: the year
  const aY = eo(P(t, t1, 0.4));
  if (aY > 0.01) {
    const val = (tt) => 1800 + 83 * io(P(tt, tSeribu - 0.1, tTiga + 0.35 - tSeribu));
    roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aY, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, '27 AGUSTUS · PUKUL 10.02', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aY });
    chip(ctx, '± 200 MEGATON TNT', 104, 568, P(t, tBoom + 0.55, 0.5), { align: 'left', color: '#FF8A6A' });
    chip(ctx, '± 13.000 × BOM HIROSHIMA', 104, 636, P(t, tBoom + 0.85, 0.5), { align: 'left', color: HUD.amber });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
