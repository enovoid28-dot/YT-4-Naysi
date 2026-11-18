import { W, txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, deepSky, earthBall, hero, mono, chip, stamp, hudFrame, wordT } from './_bulan.mjs';
import {
  KRAK, gview, gVeil, gPin, redSky, skyline1883, ships, brooklyn, fireBell, paperRect,
} from './_krakatau.mjs';

// 06 — LANGIT MERAH
// Card 0: the ash veil wraps the planet westward from Krakatau; then the sky
// itself — a sunset gone too red, with a Bishop's ring round the Sun.
// Card 1: New York, 1883 — the bridge that opened that May, a bell, and a
// card with what happened: firefighters called out to a fire that was a sky.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const sm = (p) => EASE.smooth(clamp(p));

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const tSenja = wordT(scene, 0, 2);
  const tMerah = wordT(scene, 0, 6);
  const t1 = wordT(scene, 1, 0, -0.1);
  const tNY = wordT(scene, 1, 1);
  const tPem = wordT(scene, 1, 4);
  const tPang = wordT(scene, 1, 6);
  const tKira = wordT(scene, 1, 8);
  const tKeb = wordT(scene, 1, 10);
  const pS = io(P(t, tSenja + 0.15, 1.3));

  /* ------------------------------- the veil ------------------------------ */
  if (pS < 0.999) {
    deepSky(ctx, t, cam, { seed: 66, band: 0.5, bandY: 760 });
    const E = 360 * io(P(t, 0.2, 2.2));
    const gv = gview(720, lerp(1010, 760, pS), lerp(440, 320, pS), 100 - E * 0.5, 6);
    ctx.save();
    ctx.globalAlpha *= 1 - pS * pS;
    ctx.translate(0, pS * 1300);
    plane(ctx, cam, 0.6, () => {
      earthBall(ctx, gv.cx, gv.cy, gv.r, { lon: gv.lon, tilt: gv.tilt, sun: { x: -0.6, y: 0.3, z: 0.74 }, lights: 0.4 });
      gVeil(ctx, gv, KRAK[1], E, { a: 1 });
      gPin(ctx, gv, KRAK[0], KRAK[1], { color: '#FF5A4A', r: 9 });
    });
    chip(ctx, 'KELILING DUNIA DALAM 13 HARI', 720, 1520, P(t, 1.0, 0.5), { color: HUD.amber, a: 1 - pS });
    ctx.restore();
  }

  /* ---------------------------- the red evening -------------------------- */
  if (pS > 0.001) {
    ctx.save();
    ctx.globalAlpha *= sm(pS * 1.6);
    ctx.translate(0, -(1 - pS) * 900);
    const red = 0.35 + 0.65 * sm(P(t, tMerah - 0.4, 1.1));
    const HZ = 1200;
    plane(ctx, cam, 0.4, () => redSky(ctx, t, { red, hz: HZ, sunX: 1010, sunY: 1172 }));
    const aNY = eo(P(t, tNY - 0.5, 1.0));
    plane(ctx, cam, 0.8, () => {
      ctx.save();
      ctx.translate(0, (1 - aNY) * 140);
      skyline1883(ctx, HZ, t, { a: aNY, x0: -20, x1: 860 });
      brooklyn(ctx, 1150, HZ, 1.0, { a: aNY });
      ships(ctx, HZ, t, { a: aNY, list: [[170, 0.9], [470, 0.7], [760, 0.55]] });
      ctx.restore();
    });
    // a darker head so the type reads against a bright sky
    const tg = ctx.createLinearGradient(0, 0, 0, 700);
    tg.addColorStop(0, 'rgba(8,3,8,0.7)');
    tg.addColorStop(1, 'rgba(8,3,8,0)');
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, W, 700);
    mono(ctx, 'CINCIN BISHOP', 1010, 870, { size: 18, color: 'rgba(255,230,200,0.7)', align: 'center', a: eo(P(t, tMerah, 0.6)) * (1 - aNY * 0.6), track: 4 });
    chip(ctx, 'NEW YORK · 1883', 104, 1246, aNY, { align: 'left', color: HUD.amber });
    mono(ctx, 'JEMBATAN BROOKLYN · DIBUKA MEI 1883', 1336, 1252, { size: 18, color: 'rgba(255,220,200,0.75)', align: 'right', a: eo(P(t, tNY, 0.6)), track: 3 });
    ctx.restore();
  }

  /* ------------------------- the alarm and the card ---------------------- */
  const aBell = eo(P(t, tPem - 0.3, 0.5));
  if (aBell > 0.01) fireBell(ctx, 1130, 610, 0.9, t, { a: aBell, ring: 1 - 0.7 * P(t, tKeb + 0.6, 0.8) });
  const aC = eo(P(t, tPang - 0.25, 0.6));
  if (aC > 0.01) {
    const cx = 104;
    const cy = 1290;
    const cw = 860;
    const ch = 290;
    ctx.save();
    ctx.translate(0, (1 - aC) * 40);
    paperRect(ctx, cx, cy, cw, ch, { a: aC, rot: -0.02 });
    ctx.save();
    ctx.translate(cx + cw / 2, cy + ch / 2);
    ctx.rotate(-0.02);
    ctx.translate(-cw / 2, -ch / 2);
    const lines = [
      ['NEW YORK · POUGHKEEPSIE · NEW HAVEN', 20, 'rgba(120,30,24,0.9)', tPang - 0.2],
      ['Langit barat merah menyala.', 34, 'rgba(30,24,20,0.92)', tPang],
      ['Pemadam kebakaran dipanggil.', 34, 'rgba(30,24,20,0.92)', tKira - 0.3],
      ['Tidak ada api — itu cahaya senja.', 34, 'rgba(30,24,20,0.92)', tKeb - 0.2],
    ];
    lines.forEach(([s, size, col, at], i) => {
      const n = Math.floor(s.length * clamp((t - at) / 0.7));
      if (n <= 0) return;
      txt(ctx, s.slice(0, n), 44, 64 + i * 66, { size, font: i === 0 ? F.mono6 : F.semi, color: col, track: i === 0 ? 3 : 0, alpha: aC });
    });
    ctx.restore();
    ctx.restore();
    stamp(ctx, 'BUKAN KEBAKARAN', 1050, 1500, P(t, tKeb + 0.35, 0.35), { rot: -0.1, size: 36 });
  }

  /* --------------------------------- hero -------------------------------- */
  const a0 = 1 - eo(P(t, t1 - 0.2, 0.3));
  if (a0 > 0.01) hero(ctx, 'LANGIT MERAH', 'ABU & SULFUR DI STRATOSFER', 104, 420, P(t, wordT(scene, 0, 0) - 0.1, 0.8), { size: 150, a: a0 });
  const a1 = eo(P(t, t1, 0.4));
  if (a1 > 0.01) hero(ctx, 'ALARM PALSU', 'SENJA YANG DIKIRA KEBAKARAN', 104, 420, P(t, t1, 0.8), { size: 150, a: a1 });
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
