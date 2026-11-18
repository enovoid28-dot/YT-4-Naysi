import { W, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import {
  HUD, deepSky, moonBall, earthBall, hero, mono, chip, arcArrow, ringBurst, hudFrame, wordT, roll,
  dial24, glass, sightline,
} from './_bulan.mjs';

// 06 — REM BUMI (v3)
// Card 0: the same brake, the other way round. Earth spins fast under its
// ocean bulge, which runs ahead of the Moon; the Moon tugs it back (torque).
// Card 1: a 24-hour dial around the planet: the day was 4 hours, it is 24
// now, and it keeps stretching (+~2 ms per century); the Moon drifts 3,8 cm
// a year further out.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const D = Math.PI / 180;

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.9);
  deepSky(ctx, t, cam, { seed: 66, band: 0.7, bandY: 1180 });

  const t1 = wordT(scene, 1, 0, -0.1); // "Dulu"
  const tEmpat = wordT(scene, 1, 3); // "empat"
  const tNow = wordT(scene, 1, 5); // "sekarang"
  const tDua = wordT(scene, 1, 6); // "dua"
  const t24 = wordT(scene, 1, 9, 0.2); // "jam,"
  const tTerus = wordT(scene, 1, 11); // "terus"

  const ex = 720;
  const ey = 1000;
  const er = 300;
  const sun = { x: -0.55, y: 0.35, z: 0.76 };

  // spin: fast in the past (4 h day), slowing to today's rate
  // longitude = ∫rate dt with rate easing 26 → 6 °/s (closed form)
  const tA = tNow;
  const tB = t24;
  let lon;
  if (t < tA) lon = 120 - 26 * t;
  else {
    const u = clamp((t - tA) / (tB - tA));
    const I = u < 0.5 ? u - (2 / 3) * u * u * u : 0.5 - (2 / 3) * Math.pow(1 - u, 3);
    const span = tB - tA;
    lon = 120 - 26 * tA - (26 * u * span - 20 * span * (u - I)) - (t > tB ? 6 * (t - tB) : 0);
  }

  // Moon: upper right, slowly receding at the end
  const recede = eo(P(t, tTerus, 1.6));
  const mx = 1210 + recede * 40;
  const my = 560 - recede * 22;
  const mr = 70 - recede * 8;

  // bulge lag (card 0)
  const lag = 18 * D * eo(P(t, 0.5, 0.8)) * (1 - eo(P(t, t1 + 0.4, 0.6)));
  const aBulge = eo(P(t, 0.6, 0.6)) * (1 - eo(P(t, t1 + 0.3, 0.6)));
  const lineAng = Math.atan2(my - ey, mx - ex); // Earth → Moon direction on screen

  plane(ctx, cam, 0.55, () => {
    // ocean bulge, carried ahead of the Moon by Earth's spin (counter-clockwise)
    if (aBulge > 0.01) {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(lineAng - lag);
      ctx.globalAlpha *= aBulge;
      const gr = ctx.createRadialGradient(0, 0, er * 0.92, 0, 0, er * 1.25);
      gr.addColorStop(0, 'rgba(105,183,255,0)');
      gr.addColorStop(0.5, 'rgba(105,183,255,0.2)');
      gr.addColorStop(1, 'rgba(105,183,255,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.ellipse(0, 0, er * 1.22, er * 1.03, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(105,183,255,0.85)';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.ellipse(0, 0, er * 1.22, er * 1.03, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      mono(ctx, 'TONJOLAN LAUT', ex + Math.cos(lineAng - lag) * er * 1.25 - 40, ey + Math.sin(lineAng - lag) * er * 1.25 - 40, {
        size: 20, color: HUD.ice, a: aBulge, align: 'right', track: 3,
      });
    }
    earthBall(ctx, ex, ey, er, { lon, tilt: 22, sun, cloudLon: t * 2, lights: 1 });
  });

  plane(ctx, cam, 0.75, () => {
    // Moon and its pull on the bulge
    if (aBulge > 0.01) {
      const bx = ex + Math.cos(lineAng - lag) * er * 1.22;
      const by = ey + Math.sin(lineAng - lag) * er * 1.22;
      sightline(ctx, mx, my, bx, by, t, { a: aBulge * 0.9, color: '255,176,58' });
      arcArrow(ctx, ex, ey, er * 1.36, Math.PI * 0.9, Math.PI * 0.9 + 0.9 * aBulge, {
        a: aBulge, lw: 6, head: 24, color: HUD.red, glowC: 'rgba(255,90,74,0.7)',
      });
      mono(ctx, 'REM', ex - er * 1.3, ey + er * 0.85, { size: 26, color: HUD.red, a: aBulge, track: 6 });
      // spin arrow (counter-clockwise)
      arcArrow(ctx, ex, ey, er * 1.36, -Math.PI * 0.15, -Math.PI * 0.15 - 0.9 * aBulge, {
        a: aBulge * 0.8, lw: 4, head: 18, color: HUD.ice,
      });
      mono(ctx, 'PUTARAN BUMI', ex + 40, ey - er * 1.36 - 34, { size: 20, color: HUD.ice, a: aBulge, track: 3 });
    }
    moonBall(ctx, mx, my, mr, { sun, glow: 0.4, rim: 0.3 });
    mono(ctx, 'BULAN', mx, my + mr + 38, { size: 19, color: HUD.text, align: 'center', a: eo(P(t, 0.3, 0.5)), track: 5 });
  });

  // card 1: 24-hour dial around the planet
  const aDial = eo(P(t, t1, 0.6));
  if (aDial > 0.01) {
    const hrs = t < tDua ? 4 * eo(P(t, tEmpat - 0.1, 0.6)) : 4 + 20 * io(P(t, tDua, t24 - tDua));
    dial24(ctx, ex, ey, er + 64, hrs, t, { a: aDial, p: P(t, t1, 0.9), over: 1 });
  }

  // hero: REM BUMI → day length
  const aA = 1 - eo(P(t, t1 - 0.2, 0.35));
  if (aA > 0.01) hero(ctx, 'REM BUMI', 'BULAN MEMPERLAMBAT PUTARAN BUMI', 104, 420, P(t, scene.captions[0].from, 0.8), { size: 132, a: aA });
  const aN = eo(P(t, t1 + 0.15, 0.4));
  if (aN > 0.01) {
    const val = (tt) => (tt < tDua ? 4 : 4 + 20 * io(P(tt, tDua, t24 - tDua)));
    const w = roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aN, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'JAM', 104 + w + 18, 440, { size: 70, font: F.display, color: HUD.amber, alpha: aN });
    txt(ctx, t < tNow ? 'SEHARI · DULU' : 'SEHARI · SEKARANG', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aN });
  }
  ringBurst(ctx, ex, ey, P(t, t24 - 0.1, 0.9), { r: er + 120 });

  // and it keeps going
  const aK = eo(P(t, tTerus - 0.1, 0.6));
  if (aK > 0.01) {
    glass(ctx, 104, 1400, 560, 108, aK, { r: 22 });
    glass(ctx, 776, 1400, 560, 108, aK, { r: 22 });
    mono(ctx, 'HARI MEMANJANG', 138, 1440, { size: 18, color: HUD.amber, a: aK, track: 4 });
    txt(ctx, '± 2 ms / abad', 138, 1486, { size: 36, font: F.num, color: HUD.bone, alpha: aK });
    mono(ctx, 'BULAN MENJAUH', 810, 1440, { size: 18, color: HUD.ice, a: aK, track: 4 });
    txt(ctx, '3,8 cm / tahun', 810, 1486, { size: 36, font: F.num, color: HUD.bone, alpha: aK });
  }

  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
