import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, ringBurst } from './_bulan.mjs';
import { vessel, vesselFront, drawCell, markers, glow } from './_darah.mjs';
import { sticker, commentBox, rays, sparks, grade, punch, zoomed } from './_lab.mjs';

// 07 — GOLONGANMU
// Card 0: what most people think blood type is — four letters and a plus or a
// minus, stuck on like labels. Then the cell's whole coat of markers comes up:
// far more than a letter.
// Card 1: the cell rises into the flow, a comment box slides up and starts
// typing; the possible answers pop under it. What's yours?
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

const TYPE_COL = { A: '#2F6BD8', B: '#D89A16', AB: '#8A4BD8', O: '#D8402F', '+': '#1E9E78', '−': '#C8322A' };

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.8);
  const tHuruf = wordT(scene, 0, 5);
  const tPlus = wordT(scene, 0, 7);
  const tMinus = wordT(scene, 0, 8);
  const t1 = wordT(scene, 1, 0);
  const tKom = wordT(scene, 1, 2);
  const tGol = wordT(scene, 1, 3);
  const tApa = wordT(scene, 1, 5);
  const flow = [0.16, -0.5];
  const pX = io(P(t, t1 - 0.2, 1.0));
  const coat = P(t, tMinus + 0.15, 1.4);

  vessel(ctx, t, cam, { seed: 7, flow, dark: 0.12 + 0.2 * pX });
  grade(ctx, { tint: '#FF8A3D', k: 0.14 });
  rays(ctx, 720, 600, { t, rgb: '255,200,150', a: 0.05 + 0.04 * eo(coat), n: 8, len: 2000, spread: 0.6, seed: 9 });

  const cx = 720 + Math.sin(t * 0.45) * 12;
  const cy = lerp(1320, 1080, pX);
  const d = lerp(660, 470, pX);
  const tilt = 22 + 10 * Math.sin(t * 0.4);
  const rot = -0.2 + t * 0.06;
  const k = punch(t, tMinus + 0.12, 0.045, 0.5);
  zoomed(ctx, k, cx, cy, () => plane(ctx, cam, 1.0, () => {
    glow(ctx, cx, cy, d * 2.4, '255,120,80', 0.26 + 0.2 * eo(coat));
    drawCell(ctx, cx, cy, d, { hero: true, tilt, rot });
    markers(ctx, cx, cy, d, {
      kinds: ['A', 'B', 'D', 'X', 'X', 'X', 'G', 'H'], n: 44, p: coat, t, tilt, rot, seed: 91, face: 0.8, len: 0.075,
    });
    ringBurst(ctx, cx, cy, P(t, tMinus + 0.12, 1.0), { r: d * 0.95, color: '255,176,58' });
    sparks(ctx, cx, cy, t, { n: 30, rgb: '255,190,120', r: d * 0.7, a: 0.5 * eo(coat), seed: 7, rise: 90, born: tMinus });
  }));
  vesselFront(ctx, t, cam, { seed: 7, flow, a: 0.5 });

  // card 0: a letter and a sign, stuck on like labels, then shrugged off
  const aB = 1 - eo(P(t, t1 - 0.2, 0.35));
  const row = [['A', tHuruf - 0.3], ['B', tHuruf - 0.22], ['AB', tHuruf - 0.14], ['O', tHuruf - 0.06], ['+', tPlus - 0.1], ['−', tMinus - 0.1]];
  row.forEach(([s, at], i) => {
    const x = 720 + (i - 2.5) * 205;
    const fall = EASE.inQuad(P(t, t1 - 0.25 + i * 0.03, 0.5));
    sticker(ctx, s, x, 1930 + fall * 260, 124, P(t, at, 0.4), {
      color: TYPE_COL[s], rot: (i % 2 ? 1 : -1) * 0.06, a: aB,
    });
  });

  // card 1: the comment box, and the answers people will give
  commentBox(ctx, 720, 1640, 1240, P(t, tKom - 0.35, 0.55), {
    typed: P(t, tKom + 0.1, 1.2), s: 'Golongan darahku: ', t, send: 0,
  });
  ['A', 'B', 'AB', 'O'].forEach((s, i) => {
    sticker(ctx, `${s}?`, 720 + (i - 1.5) * 270, 1930, 118, P(t, tGol + i * 0.1, 0.4), {
      color: TYPE_COL[s], rot: (i % 2 ? 1 : -1) * 0.05,
    });
  });
  void tApa;
}

export default { draw: drawScene };
