import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, hero, chip, ringBurst, hudFrame, wordT, reticle } from './_bulan.mjs';
import { vessel, vesselFront, drawCell, glow, typeBadge, labStrip } from './_darah.mjs';

// 01 — SATU ORANG
// Card 0: inside a vessel, one cell among millions is locked by the reticle —
// its blood type belongs to one person on Earth. The headline is up on frame 0.
// Card 1: the four types everyone knows land under it and are struck out one
// by one, each on the letter the voice says.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const VIO = '200,168,255';

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.9);
  const tSatu = wordT(scene, 0, 6);
  const t1 = wordT(scene, 1, 0);
  const tBukan = wordT(scene, 1, 2);
  const tL = [wordT(scene, 1, 3), wordT(scene, 1, 4), wordT(scene, 1, 5), wordT(scene, 1, 7)];
  const flow = [0.18, -0.5];

  vessel(ctx, t, cam, { seed: 1, flow });

  // the one cell: holds the centre while everything else streams past
  const pC = io(P(t, t1 - 0.2, 0.9));
  const cx = 720 + Math.sin(t * 0.5) * 14;
  const cy = lerp(1000, 870, pC) + Math.cos(t * 0.6) * 10;
  const d = lerp(600, 470, pC) * (1 + 0.012 * Math.sin(t * 2.2));
  const tilt = 24 + 12 * Math.sin(t * 0.42);
  const rot = 0.55 + t * 0.07;
  plane(ctx, cam, 1.1, () => {
    glow(ctx, cx, cy, d * 2.4, VIO, 0.36 + 0.08 * Math.sin(t * 3));
    drawCell(ctx, cx, cy, d, { hero: true, tilt, rot });
    const done = P(t, tL[3] + 0.25, 0.4);
    reticle(ctx, cx, cy, d * 0.64, t, P(t, 0.05, 0.8), {
      label: done > 0 ? 'GOLONGAN · ???' : 'SAMPEL #025', spin: 0.1, color: VIO,
    });
    ringBurst(ctx, cx, cy, P(t, tSatu - 0.05, 0.9), { r: d * 0.95, color: VIO });
    ringBurst(ctx, cx, cy, done, { r: d * 0.85, color: VIO });
  });
  vesselFront(ctx, t, cam, { seed: 1, flow, a: 0.7 });

  // card 1: A, B, AB, O land and are struck out on the spoken letter
  const names = ['A', 'B', 'AB', 'O'];
  names.forEach((s, i) => {
    const x = 720 + (i - 1.5) * 300;
    typeBadge(ctx, s, x, 1300, 118, P(t, tBukan - 0.25 + i * 0.07, 0.45), {
      strike: P(t, tL[i] - 0.02, 0.28),
    });
  });

  labStrip(ctx, t, { a: eo(P(t, 0.05, 0.6)), left: 'SPESIMEN · DARAH UTUH' });

  // headline from frame 0: one person
  hero(ctx, '1 ORANG', 'PUNYA GOLONGAN DARAH INI', 104, 440, P(t, 0.0, 0.7), { size: 200 });
  chip(ctx, '1 DARI ± 8,2 MILIAR MANUSIA', 104, 568, P(t, tSatu + 0.15, 0.5), { align: 'left', color: '#C8A8FF' });
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
