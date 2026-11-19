import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { ringBurst, wordT, reticle } from './_bulan.mjs';
import { vessel, vesselFront, drawCell, glow } from './_darah.mjs';
import { tag, bloodBag, rays, sparks, grade, punch, zoomed } from './_lab.mjs';

// 01 — SATU ORANG
// Card 0: inside a vessel one cell holds the centre under a violet key light,
// locked by the reticle; on "satu" the shot punches in and the in-art label
// lands: one person, out of 8.2 billion.
// Card 1: the cell steps back and four donor bags rise on their hangers —
// A, B, AB, O — each struck through with a marker on the letter the voice says.
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
  const done = P(t, tL[3] + 0.3, 0.45);

  vessel(ctx, t, cam, { seed: 1, flow, dark: 0.1 });
  grade(ctx, { tint: '#6B4BC8', k: 0.22 });
  rays(ctx, 720, 380, { t, rgb: VIO, a: 0.075 + 0.04 * done, n: 8, len: 2000, spread: 0.6, seed: 2 });

  const pC = io(P(t, t1 - 0.25, 0.85));
  const cx = 720 + Math.sin(t * 0.5) * 14;
  const cy = lerp(1060, 700, pC) + Math.cos(t * 0.6) * 10;
  const d = lerp(700, 360, pC) * (1 + 0.012 * Math.sin(t * 2.2));
  const tilt = 24 + 12 * Math.sin(t * 0.42);
  const rot = 0.55 + t * 0.07;
  const k = punch(t, tSatu - 0.06, 0.05, 0.55) * (1 - 0.03 * pC);

  zoomed(ctx, k, cx, cy, () => {
    plane(ctx, cam, 1.1, () => {
      glow(ctx, cx, cy, d * 2.5, VIO, 0.38 + 0.08 * Math.sin(t * 3) + 0.25 * done);
      drawCell(ctx, cx, cy, d, { hero: true, tilt, rot });
      reticle(ctx, cx, cy, d * 0.64, t, P(t, 0.05, 0.8), {
        label: done > 0 ? 'GOLONGAN · ???' : 'SAMPEL #025', spin: 0.1, color: VIO,
      });
      ringBurst(ctx, cx, cy, P(t, tSatu - 0.05, 0.9), { r: d * 0.95, color: VIO });
      ringBurst(ctx, cx, cy, done, { r: d * 0.85, color: VIO });
      sparks(ctx, cx, cy, t, { n: 34, rgb: VIO, r: d * 0.75, a: 0.55 + 0.4 * done, seed: 11, rise: 80 });
    });
  });
  vesselFront(ctx, t, cam, { seed: 1, flow, a: 0.55 * (1 - 0.6 * pC) });

  // card 0: the in-art label
  const aTag = 1 - eo(P(t, t1 - 0.3, 0.3));
  tag(ctx, 720, 1560, P(t, tSatu - 0.05, 0.5), {
    big: '1', small: 'ORANG', color: '#D6BEFF', glowRgb: VIO, a: aTag, size: 150,
    sub: 'DARI ± 8,2 MILIAR MANUSIA',
  });

  // card 1: four donor bags, struck on the spoken letter
  const names = ['A', 'B', 'AB', 'O'];
  plane(ctx, cam, 0.8, () => {
    names.forEach((s, i) => {
      const x = 720 + (i - 1.5) * 315;
      const st = P(t, tL[i] - 0.02, 0.28);
      bloodBag(ctx, x, 1290 + Math.sin(t * 1.3 + i) * 4, 410, {
        type: s, p: P(t, tBukan - 0.3 + i * 0.09, 0.55), t: t + i * 0.7,
        strike: st, dim: 0.75 * eo(P(t, tL[i] + 0.1, 0.4)), tube: i % 2 ? -1 : 1,
      });
    });
  });
}

export default { draw: drawScene };
