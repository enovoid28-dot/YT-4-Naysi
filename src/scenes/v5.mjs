import { W, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { sunDisc } from './_space.mjs';
import {
  HUD, deepSky, moonBall, hero, mono, chip, ringBurst, hudFrame, wordT, roll, glass, flare,
  luna3, photoPrint, stamp, brackets, reticle,
} from './_bulan.mjs';

// 05 — 1959 (v3)
// Card 0: the myth, struck through. The far side turns under a moving Sun —
// the terminator sweeps across it like it does on the near side; day/night
// readouts. Card 1: Luna 3 crosses the frame, shutter flash, and the first
// far-side photograph lands as an archival print: 7 OKTOBER 1959.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 1.0);
  deepSky(ctx, t, cam, { seed: 59, band: 0.65, bandY: 1250, warm: 0.7 });

  const tGelap = wordT(scene, 0, 4, 0.1); // "gelap,"
  const tSun = wordT(scene, 0, 6, -0.1); // "kena"
  const tSama = wordT(scene, 0, 8); // "sama"
  const t1 = wordT(scene, 1, 0, -0.1); // "Baru"
  const tFoto = wordT(scene, 1, 1); // "difoto"
  const tYear = wordT(scene, 1, 3); // "seribu"
  const tYearEnd = wordT(scene, 1, 8, 0.3); // "sembilan" (last)
  const tLuna = wordT(scene, 1, 10); // "Luna"

  const pM = io(P(t, t1 - 0.1, 1.1)); // Moon steps aside for the photo
  const mx = lerp(720, 470, pM);
  const my = lerp(1040, 1000, pM);
  const mr = lerp(300, 235, pM);

  // the Sun comes round: from behind the Moon to the front-left
  const sweep = io(P(t, tSun - 0.2, tSama + 0.5 - tSun));
  const phi = lerp(172, 48, sweep) * (Math.PI / 180);
  const sun = { x: -Math.sin(phi), y: 0.12, z: Math.cos(phi) };
  const sunA = eo(P(t, tSun - 0.4, 0.8));
  const sx = -60 + (1 - sunA) * -200;
  const sy = 560;

  plane(ctx, cam, 0.35, () => {
    if (sunA > 0.01) {
      sunDisc(ctx, sx, sy, 150, { a: sunA, t, rays: 1, tone: 1 });
      flare(ctx, sx + 40, sy, 220, { a: 0.55 * sunA, t, ghosts: true });
    }
  });

  plane(ctx, cam, 0.8, () => {
    moonBall(ctx, mx, my, mr, {
      rot: 0.5, tilt: 3, sun, glow: 0.35 + 0.25 * sweep, shine: 0.02, exposure: 1,
    });
    reticle(ctx, mx, my, mr, t, P(t, 0.3, 0.9) * (1 - pM), { spin: 0.04, label: 'SISI JAUH' });
    // light rays toward the Moon while the Sun sweeps
    if (sunA > 0.01 && pM < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha *= sunA * (1 - pM) * 0.5;
      for (let k = -3; k <= 3; k++) {
        const y0 = sy + k * 40;
        const y1 = my + k * mr * 0.28;
        const gr = ctx.createLinearGradient(sx, y0, mx - mr, y1);
        gr.addColorStop(0, 'rgba(255,214,150,0.55)');
        gr.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.strokeStyle = gr;
        ctx.lineWidth = 3;
        ctx.setLineDash([2, 16]);
        ctx.lineDashOffset = -t * 90;
        ctx.beginPath();
        ctx.moveTo(sx + 150, y0);
        ctx.lineTo(mx - mr * 0.9, y1);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }
  });

  // day / night readouts (card 0)
  const aD = eo(P(t, tSama - 0.2, 0.6)) * (1 - eo(P(t, t1 - 0.2, 0.4)));
  if (aD > 0.01) {
    glass(ctx, 104, 1390, 590, 110, aD, { r: 22 });
    glass(ctx, 746, 1390, 590, 110, aD, { r: 22 });
    mono(ctx, 'SIANG', 140, 1432, { size: 19, color: HUD.amber, a: aD, track: 5 });
    txt(ctx, '± 14,8 hari', 140, 1478, { size: 38, font: F.num, color: HUD.bone, alpha: aD });
    mono(ctx, 'MALAM', 782, 1432, { size: 19, color: HUD.ice, a: aD, track: 5 });
    txt(ctx, '± 14,8 hari', 782, 1478, { size: 38, font: F.num, color: HUD.bone, alpha: aD });
  }

  // hero card 0: the myth, struck through
  const aMyth = 1 - eo(P(t, t1 - 0.3, 0.4));
  if (aMyth > 0.01) {
    hero(ctx, 'SISI GELAP', '', 104, 420, P(t, scene.captions[0].from, 0.7), { size: 132, a: aMyth });
    const pStrike = eo(P(t, tGelap, 0.45));
    if (pStrike > 0.001) {
      ctx.save();
      ctx.globalAlpha *= aMyth;
      ctx.strokeStyle = HUD.red;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(255,90,74,0.6)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(96, 378);
      ctx.lineTo(96 + 760 * pStrike, 378 - 26 * pStrike);
      ctx.stroke();
      ctx.restore();
    }
    txt(ctx, 'MITOS', 110, 482, { size: 25, font: F.mono6, color: HUD.red, track: 6, alpha: aMyth * eo(P(t, tGelap + 0.1, 0.4)) });
    txt(ctx, 'FAKTA: SISI JAUH TETAP KENA MATAHARI', 110, 520, { size: 25, font: F.mono6, color: HUD.amber, track: 4, alpha: aMyth * eo(P(t, tSun, 0.5)) });
  }

  brackets(ctx, mx - mr * 1.25, my - mr * 1.25, mr * 2.5, mr * 2.5, P(t, t1 + 0.6, 0.6), { a: 0.6 });
  mono(ctx, 'SISI JAUH', mx, my + mr + 70, { size: 22, color: HUD.text, align: 'center', a: eo(P(t, t1 + 0.8, 0.5)), track: 6 });

  // card 1: Luna 3 crosses, flash, photo lands
  const pL = P(t, tFoto - 0.5, 2.6);
  if (pL > 0 && pL < 1) {
    const s = io(pL);
    const lx = (1 - s) * (1 - s) * 1560 + 2 * s * (1 - s) * 720 + s * s * -140;
    const ly = (1 - s) * (1 - s) * 860 + 2 * s * (1 - s) * 640 + s * s * 700;
    // trajectory
    ctx.save();
    ctx.globalAlpha *= 0.5 * Math.sin(pL * Math.PI);
    ctx.strokeStyle = 'rgba(214,230,248,0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(1560, 860);
    ctx.quadraticCurveTo(720, 640, -140, 700);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    luna3(ctx, lx, ly, 150, { a: clamp(Math.sin(pL * Math.PI) * 2.2), rot: -0.35 + pL * 0.5, t });
    chip(ctx, 'LUNA 3 · USSR', lx, ly + 140, clamp(Math.sin(pL * Math.PI) * 3), { color: HUD.ice, size: 21 });
  }
  const tFlash = tFoto + 0.55;
  const fl = P(t, tFlash, 0.5);
  if (fl > 0 && fl < 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = (1 - fl) * 0.55;
    ctx.fillStyle = '#FFF6E6';
    ctx.fillRect(-200, -200, W + 400, 3000);
    ctx.restore();
    ringBurst(ctx, mx, my, fl, { r: mr * 1.5, color: '255,246,230' });
  }
  const pPrint = P(t, tFlash + 0.2, 0.9);
  if (pPrint > 0) {
    photoPrint(ctx, 690, 820, 620, 700, pPrint, (x, y, w, h) => {
      ctx.fillStyle = '#060606';
      ctx.fillRect(x, y, w, h);
      moonBall(ctx, x + w * 0.52, y + h * 0.5, Math.min(w, h) * 0.4, {
        rot: 0.47, tilt: 2, sun: { x: 0.7, y: 0.1, z: 0.7 }, sepia: 1, glow: 0, rim: 0, relief: 0.6, exposure: 1.1,
      });
    }, { rot: -0.045, caption: 'LUNA 3 · 7 OKTOBER 1959', sub: 'FOTO PERTAMA SISI JAUH BULAN' });
    stamp(ctx, 'PERTAMA', 1180, 900, P(t, tLuna, 0.35), { rot: 0.18, size: 34 });
  }

  // hero card 1: 1959
  const aY = eo(P(t, t1, 0.4));
  if (aY > 0.01) {
    const val = (tt) => lerp(1900, 1959, io(P(tt, tYear, tYearEnd - tYear)));
    roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aY, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'TAHUN SISI JAUH PERTAMA DIFOTO', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 5, alpha: aY });
  }

  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
