import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, hero, chip, hudFrame, wordT, ringBurst } from './_bulan.mjs';
import { vessel, vesselFront, drawCell, markers, typeBadge, glow, bubble, labStrip } from './_darah.mjs';

// 07 — GOLONGANMU
// Card 0: the letters and the plus/minus sit on the face of one cell — and
// then the rest of its markers come up around them: far more than a letter.
// Card 1: the cell drifts up into the flow, a comment bubble lands, and the
// question goes to the viewer: what's yours?
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.8);
  const tHuruf = wordT(scene, 0, 5);
  const tPlus = wordT(scene, 0, 7);
  const tMinus = wordT(scene, 0, 8);
  const tBukan = wordT(scene, 0, 3);
  const t1 = wordT(scene, 1, 0);
  const tKom = wordT(scene, 1, 2);
  const tGol = wordT(scene, 1, 3);
  const tApa = wordT(scene, 1, 5);
  const flow = [0.16, -0.5];

  vessel(ctx, t, cam, { seed: 7, flow, dark: 0.15 * io(P(t, t1 - 0.2, 0.6)) });

  const pX = io(P(t, t1 - 0.2, 1.0));
  const cx = 720 + Math.sin(t * 0.45) * 12;
  const cy = lerp(1000, 900, pX);
  const d = lerp(640, 470, pX);
  const tilt = 22 + 10 * Math.sin(t * 0.4);
  const rot = -0.2 + t * 0.06;
  plane(ctx, cam, 1.0, () => {
    glow(ctx, cx, cy, d * 2.3, '255,90,74', 0.25);
    drawCell(ctx, cx, cy, d, { hero: true, tilt, rot });
    // more than a letter: the whole coat of markers comes up
    markers(ctx, cx, cy, d, {
      kinds: ['A', 'B', 'D', 'X', 'X', 'X', 'G', 'H'], n: 40, p: P(t, tMinus + 0.1, 1.4), t, tilt, rot, seed: 91, face: 0.8, len: 0.075,
    });
    ringBurst(ctx, cx, cy, P(t, tMinus + 0.1, 1.0), { r: d * 0.95, color: '255,176,58' });
    // card 1: the bubble lands on "komentar"
    bubble(ctx, 1200, 700, 120, P(t, tKom - 0.05, 0.6), { t });
  });
  vesselFront(ctx, t, cam, { seed: 7, flow, a: 0.55 });

  // card 0: what people think blood type is — a letter and a sign
  const aB = 1 - eo(P(t, t1 - 0.12, 0.3));
  const row = [['A', HUD.bone, tHuruf - 0.3], ['B', HUD.bone, tHuruf - 0.24], ['AB', HUD.bone, tHuruf - 0.18], ['O', HUD.bone, tHuruf - 0.12], ['+', '#5FE3C0', tPlus - 0.1], ['−', '#FF8A7A', tMinus - 0.1]];
  row.forEach(([s, col, at], i) => {
    typeBadge(ctx, s, 720 + (i - 2.5) * 200, 1330, 80, P(t, at, 0.45), { a: aB, color: col });
  });

  // card 1: the answers people will give
  const opts = ['A', 'B', 'AB', 'O'];
  opts.forEach((s, i) => {
    typeBadge(ctx, s + '?', 720 + (i - 1.5) * 280, 1340, 74, P(t, tGol + i * 0.1, 0.45), {});
  });

  labStrip(ctx, t, { a: eo(P(t, 0.05, 0.6)), left: 'GOLONGAN DARAHMU?' });

  // headlines
  const aH0 = 1 - eo(P(t, t1 - 0.15, 0.3));
  if (aH0 > 0.01) {
    hero(ctx, 'GOLONGAN DARAH', '', 104, 440, P(t, 0.12, 0.7), { size: 128, a: aH0 });
    txt(ctx, 'BUKAN CUMA HURUF DAN PLUS-MINUS', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aH0 * eo(P(t, tBukan - 0.1, 0.5)) });
  }
  const aH1 = eo(P(t, t1 - 0.05, 0.4));
  if (aH1 > 0.01) {
    hero(ctx, 'PUNYAMU?', 'TULIS DI KOMENTAR', 104, 440, P(t, t1 - 0.05, 0.7), { size: 200, a: aH1 });
    chip(ctx, 'A · B · AB · O · RH + / −', 104, 568, P(t, tApa + 0.1, 0.5), { align: 'left', color: HUD.amber });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
