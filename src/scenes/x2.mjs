import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, roll, hero, chip, hudFrame, wordT, callout, dimension } from './_bulan.mjs';
import { vessel, vesselFront, drawCell, markers, typeBadge, legend, labStrip } from './_darah.mjs';

// 02 — PENANDA
// Card 0: one red cell, close. Markers sprout over its membrane on "penanda",
// a callout names them, a dimension line gives the cell's size.
// Card 1: the cell flies into a row of four — A, B, AB, O — each wearing its
// own markers, and the year rolls to 1901.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

const TYPES = [
  { s: 'A', kinds: ['A'] },
  { s: 'B', kinds: ['B'] },
  { s: 'AB', kinds: ['A', 'B'] },
  { s: 'O', kinds: ['H'] },
];
const SLOT = (i) => [720 + (i - 1.5) * 316, 960];

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.8);
  const tPen = wordT(scene, 0, 4);
  const tPerm = wordT(scene, 0, 7);
  const t1 = wordT(scene, 1, 0);
  const tA = wordT(scene, 1, 1);
  const tB = wordT(scene, 1, 2);
  const tO = wordT(scene, 1, 3);
  const tTahun = wordT(scene, 1, 5);
  const tSeribu = wordT(scene, 1, 6);
  const tSatu = wordT(scene, 1, 9);
  const flow = [-0.14, -0.42];
  const appear = [tA - 0.12, tB - 0.12, (tB + tO) / 2 - 0.12, tO - 0.12];

  vessel(ctx, t, cam, { seed: 2, flow, dark: 0.12 });

  // the transition: the big cell flies into slot A and becomes the A cell
  const pX = io(P(t, t1 - 0.3, 0.85));
  const [ax, ay] = SLOT(0);
  const cx = lerp(720, ax, pX);
  const cy = lerp(1000, ay, pX);
  const d = lerp(700, 250, pX);
  const tilt = 28;
  const rot = -0.35 + t * 0.05;
  plane(ctx, cam, 1.0, () => {
    drawCell(ctx, cx, cy, d, { hero: true, tilt, rot });
    // card 0 markers: a mix of systems; they give way to the A markers
    markers(ctx, cx, cy, d, {
      kinds: ['X', 'X', 'A', 'D', 'X', 'B'], n: 30, p: P(t, tPen - 0.15, 1.5), t, tilt, rot, seed: 21,
      face: 0.7, len: 0.07, a: 1 - pX,
    });
    markers(ctx, cx, cy, d, { kinds: ['A'], n: 16, p: P(t, appear[0], 0.9), t, tilt, rot, seed: 31, face: 0.5, len: 0.09 });
    // the other three types
    for (let i = 1; i < 4; i++) {
      const [x, y] = SLOT(i);
      const q = eo(P(t, appear[i], 0.5));
      if (q <= 0.01) continue;
      const dd = 250 * (0.6 + 0.4 * q);
      const rr = 0.4 * i + t * 0.05;
      drawCell(ctx, x, y + (1 - q) * 60, dd, { hero: true, tilt, rot: rr, a: q });
      markers(ctx, x, y + (1 - q) * 60, dd, { kinds: TYPES[i].kinds, n: TYPES[i].s === 'O' ? 14 : 16, p: P(t, appear[i] + 0.1, 0.9), t, tilt, rot: rr, seed: 31 + i * 7, face: 0.5, len: TYPES[i].s === 'O' ? 0.05 : 0.09, a: q });
    }
    // card 0 annotations
    const a0 = 1 - eo(P(t, t1 - 0.4, 0.3));
    if (a0 > 0.01) {
      const an = -2.35;
      const px = 720 + Math.cos(an) * 700 * 0.55;
      const py = 1000 + Math.sin(an) * 700 * 0.52;
      callout(ctx, px, py, px - 70, py - 120, 250, P(t, tPen + 0.35, 0.8), {
        label: 'PROTEIN & GULA', value: 'ANTIGEN', side: 'left', vsize: 50, a: a0,
      });
      dimension(ctx, 370, 1380, 1070, 1380, P(t, tPerm - 0.1, 0.8), { label: '± 7,5 µm · SEL DARAH MERAH', a: a0, size: 24 });
    }
  });
  vesselFront(ctx, t, cam, { seed: 2, flow, a: 0.55 * (1 - pX) });

  // card 1: the letters under the four cells, and what each one wears
  TYPES.forEach((ty, i) => {
    const [x] = SLOT(i);
    typeBadge(ctx, ty.s, x, 1218, 70, P(t, appear[i] + 0.15, 0.4), {});
  });
  const pL = P(t, tO + 0.35, 0.5);
  legend(ctx, 'A', 'PENANDA A', 150, 1392, pL);
  legend(ctx, 'B', 'PENANDA B', 560, 1392, P(t, tO + 0.45, 0.5));
  legend(ctx, 'H', 'TANPA A & B = O', 950, 1392, P(t, tO + 0.55, 0.5));

  labStrip(ctx, t, { a: eo(P(t, 0.05, 0.6)), left: 'ERITROSIT · ± 7,5 µm' });

  // headlines: PENANDA, then SISTEM ABO, then the year
  const aH0 = 1 - eo(P(t, t1 - 0.3, 0.3));
  if (aH0 > 0.01) hero(ctx, 'PENANDA', 'DI PERMUKAAN SEL DARAH MERAH', 104, 440, P(t, 0.35, 0.7), { size: 200, a: aH0 });
  const aH1 = eo(P(t, t1 - 0.05, 0.4)) * (1 - eo(P(t, tTahun - 0.3, 0.3)));
  if (aH1 > 0.01) hero(ctx, 'SISTEM ABO', 'A · B · AB · O', 104, 440, P(t, t1 - 0.05, 0.7), { size: 170, a: aH1 });
  const aY = eo(P(t, tTahun - 0.1, 0.4));
  if (aY > 0.01) {
    const val = (tt) => 1890 + 11 * io(P(tt, tSeribu - 0.1, tSatu + 0.35 - tSeribu + 0.1));
    roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aY, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'KARL LANDSTEINER · WINA', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aY });
    chip(ctx, 'NOBEL KEDOKTERAN 1930', 104, 568, P(t, tSatu + 0.45, 0.5), { align: 'left', color: HUD.amber });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
