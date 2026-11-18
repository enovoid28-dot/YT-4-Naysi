import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, roll, hero, chip, hudFrame, wordT, stamp, ringBurst, reticle } from './_bulan.mjs';
import { vessel, systemTiles, drawCell, markers, glow, well, tick, cross, personIcon, labStrip, legend } from './_darah.mjs';

// 06 — GWADA
// Card 0: 2025, France. The 48th tile of the ISBT wall lights violet — PIGZ,
// a new system — and one antigen is named: GWADA, negative.
// Card 1: one woman. Her blood against every donor: the wells clump, one by
// one. Only her own sample stays smooth — "only compatible with herself".
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const VIO = '200,168,255';

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const tTahun = wordT(scene, 0, 0);
  const tLima = wordT(scene, 0, 5);
  const tPr = wordT(scene, 0, 6);
  const tBaru = wordT(scene, 0, 10);
  const tGw = wordT(scene, 0, 11);
  const tNeg = wordT(scene, 0, 12);
  const t1 = wordT(scene, 1, 0);
  const tPer = wordT(scene, 1, 3);
  const tHanya = wordT(scene, 1, 6);
  const tCocok = wordT(scene, 1, 7);
  const tSendiri = wordT(scene, 1, 10);

  vessel(ctx, t, cam, { seed: 6, flow: [-0.1, -0.36], dark: 0.45 });
  const pX = io(P(t, t1 - 0.22, 0.8));

  /* ------------------------------- card 0 -------------------------------- */
  if (pX < 0.999) {
    ctx.save();
    ctx.globalAlpha *= 1 - pX;
    ctx.translate(-300 * pX, 0);
    plane(ctx, cam, 0.85, () => {
      // the wall at rest, tile 048 lights and lifts
      const lit = eo(P(t, tBaru - 0.15, 0.5));
      // the wall as it stood in 2025: PIGZ is the newest, the 48th
      systemTiles(ctx, 104, 630, 8, 140, 64, 12, 1, {
        count: 48, hi: { 47: [VIO, lit * (0.8 + 0.2 * Math.sin(t * 5))] }, dim: 0.55 * lit,
      });
      const tx = 104 + 7 * 152 + 70;
      const ty = 630 + 5 * 76 + 32;
      ringBurst(ctx, tx, ty, P(t, tBaru - 0.1, 0.9), { r: 180, color: VIO });
      ringBurst(ctx, tx, ty, P(t, tBaru + 0.25, 0.9), { r: 260, color: VIO });
      // the cell with its GWADA markers, missing in her
      const q = eo(P(t, tGw - 0.3, 0.6));
      if (q > 0.01) {
        const cx = 720;
        const cy = 1262;
        const d = 330 * (0.7 + 0.3 * q);
        const rot = -0.4 + t * 0.06;
        glow(ctx, cx, cy, d * 2.2, VIO, 0.35 * q);
        drawCell(ctx, cx, cy, d, { hero: true, tilt: 30, rot, a: q });
        markers(ctx, cx, cy, d, { kinds: ['G', 'X'], n: 16, p: P(t, tGw - 0.1, 0.8), t, tilt: 30, rot, seed: 71, face: 0.5, len: 0.1, a: q, peelKind: 'G', peel: io(P(t, tNeg - 0.05, 1.1)) });
        legend(ctx, 'G', 'PENANDA GWADA', 960, 1262, P(t, tGw, 0.5));
        stamp(ctx, 'NEGATIF', 330, 1270, P(t, tNeg + 0.05, 0.35), { color: '#C8A8FF', size: 44, rot: -0.1 });
      }
    });
    ctx.restore();
  }

  /* ------------------------------- card 1 -------------------------------- */
  if (pX > 0.001) {
    ctx.save();
    ctx.globalAlpha *= pX;
    ctx.translate(300 * (1 - pX), 0);
    plane(ctx, cam, 0.85, () => {
      // her, in the middle, highlighted; others dim around her
      const pP = eo(P(t, t1 + 0.0, 0.6));
      const pulse = 1 + 0.05 * Math.sin(t * 4);
      glow(ctx, 720, 760, 420 * pulse, VIO, 0.45 * pP);
      personIcon(ctx, 720, 860, 230, { fem: true, color: '#C8A8FF', a: pP });
      ringBurst(ctx, 720, 770, P(t, tPer - 0.05, 0.9), { r: 260, color: VIO });
      for (let i = 0; i < 6; i++) {
        const x = 720 + (i < 3 ? -1 : 1) * (170 + (i % 3) * 120);
        personIcon(ctx, x, 860, 140, { fem: i % 2 === 1, color: 'rgba(214,230,248,0.28)', a: pP * eo(P(t, t1 + 0.1 + i * 0.05, 0.5)) });
      }
      // her blood vs donors: five clump, hers stays smooth
      const xs = [205, 410, 615, 820, 1025, 1230];
      xs.forEach((x, i) => {
        const self = i === 5;
        const at = t1 + 0.55 + i * 0.12;
        const aggAt = tCocok - 0.1 + i * 0.12;
        well(ctx, x, 1180, 74, {
          p: P(t, at, 0.5), seed: 80 + i, agg: self ? 0 : eo(P(t, aggAt, 0.7)), t,
          label: self ? 'DIRINYA' : `DONOR ${i + 1}`, labelColor: self ? '#C8A8FF' : HUD.text,
        });
        if (self) tick(ctx, x, 1360, 48, P(t, tSendiri - 0.05, 0.4), { color: '#5FE3C0', lw: 8 });
        else cross(ctx, x, 1360, 36, P(t, aggAt + 0.4, 0.3), { lw: 7 });
      });
      reticle(ctx, xs[5], 1180, 92, t, P(t, tSendiri - 0.1, 0.6), { color: VIO, spin: 0.15 });
    });
    ctx.restore();
  }

  labStrip(ctx, t, { a: eo(P(t, 0.05, 0.6)), left: 'ISBT 048 · PIGZ · GWADA' });

  // headlines: the year, then GWADA−, then the one woman
  const aY = eo(P(t, 0.25, 0.4)) * (1 - eo(P(t, tGw - 0.35, 0.3)));
  if (aY > 0.01) {
    const val = (tt) => 2000 + 25 * io(P(tt, tTahun, tLima + 0.3 - tTahun));
    roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aY, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'PRANCIS · ISBT MILAN, JUNI', 110, 492, { size: 25, font: F.mono6, color: '#C8A8FF', track: 6, alpha: aY * eo(P(t, tPr - 0.1, 0.5)) });
    chip(ctx, 'SISTEM KE-48', 104, 568, P(t, tBaru, 0.5), { align: 'left', color: '#C8A8FF' });
  }
  const aG = eo(P(t, tGw - 0.15, 0.4)) * (1 - eo(P(t, t1 - 0.3, 0.3)));
  if (aG > 0.01) hero(ctx, 'GWADA −', 'GOLONGAN DARAH BARU', 104, 440, P(t, tGw - 0.15, 0.7), { size: 200, a: aG, color: '#E6D8FF' });
  const aW = eo(P(t, t1 - 0.05, 0.4));
  if (aW > 0.01) {
    hero(ctx, '1 ORANG', 'SEORANG PEREMPUAN DARI GUADELOUPE', 104, 440, P(t, t1 - 0.05, 0.7), { size: 200, a: aW });
    chip(ctx, 'HANYA COCOK DENGAN DIRINYA', 104, 568, P(t, tSendiri - 0.05, 0.5), { align: 'left', color: '#C8A8FF' });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
