import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, hero, chip, hudFrame, wordT, glass, ringBurst } from './_bulan.mjs';
import { indoMap } from './_krakatau.mjs';
import { vessel, drawCell, markers, well, typeBadge, dotGrid, labStrip, glow } from './_darah.mjs';

// 04 — RHESUS
// Card 0: the typing tile every blood sample meets — anti-A, anti-B, anti-D.
// "rhesus" lights anti-D; positive and negative split into two cells, one
// wearing the D protein on its membrane, one without it.
// Card 1: Indonesia, and a thousand people as dots: five of them are
// rhesus negative. Under one percent.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const MINT = '95,227,192';

// five of a thousand, spread so no two sit together
const LIT = [127, 388, 512, 743, 961];

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const tRh = wordT(scene, 0, 7);
  const tPos = wordT(scene, 0, 8);
  const tNeg = wordT(scene, 0, 10);
  const t1 = wordT(scene, 1, 0);
  const tIndo = wordT(scene, 1, 1);
  const tNeg2 = wordT(scene, 1, 3);
  const tKurang = wordT(scene, 1, 4);
  const tPersen = wordT(scene, 1, 7);

  vessel(ctx, t, cam, { seed: 4, flow: [0.16, -0.4], dark: 0.3 });

  // push between the cards: card 0 lifts away, card 1 rises in
  const pX = io(P(t, t1 - 0.2, 0.8));

  /* ------------------------------- card 0 -------------------------------- */
  if (pX < 0.999) {
    ctx.save();
    ctx.globalAlpha *= 1 - pX;
    ctx.translate(0, -260 * pX);
    plane(ctx, cam, 0.9, () => {
      const pT = P(t, 0.15, 0.5);
      glass(ctx, 190, 636, 1060, 300, pT, { r: 30, tint: '255,150,140', edge: '255,200,190' });
      const names = ['ANTI-A', 'ANTI-B', 'ANTI-D'];
      names.forEach((s, i) => {
        const x = 400 + i * 320;
        const lit = i === 2 ? eo(P(t, tRh - 0.1, 0.4)) : 0;
        if (lit > 0) glow(ctx, x, 756, 300, MINT, 0.5 * lit);
        well(ctx, x, 756, 66, { p: P(t, 0.3 + i * 0.14, 0.5), seed: 40 + i, label: s, labelColor: lit > 0.5 ? '#5FE3C0' : HUD.text });
        if (i === 2) ringBurst(ctx, x, 756, P(t, tRh - 0.05, 0.8), { r: 150, color: MINT });
      });
      // rhesus positive and negative: the same cell with and without D
      const cells = [
        { x: 410, kinds: ['D', 'D', 'X'], label: 'RH +', at: tPos, seed: 51 },
        { x: 1030, kinds: null, label: 'RH −', at: tNeg, seed: 52 },
      ];
      cells.forEach((c, i) => {
        const q = eo(P(t, tRh + 0.1 + i * 0.15, 0.55));
        if (q <= 0.01) return;
        const dd = 330 * (0.7 + 0.3 * q);
        const rot = 0.3 - i * 0.6 + t * 0.06;
        const lit = eo(P(t, c.at - 0.08, 0.4));
        if (lit > 0) glow(ctx, c.x, 1140, dd * 2.1, i === 0 ? MINT : '255,120,100', 0.32 * lit);
        drawCell(ctx, c.x, 1140, dd, { hero: true, tilt: 30, rot, a: q });
        if (c.kinds) markers(ctx, c.x, 1140, dd, { kinds: c.kinds, n: 18, p: P(t, tRh + 0.25 + i * 0.15, 1.0), t, tilt: 30, rot, seed: c.seed, face: 0.5, len: 0.09, a: q });
        typeBadge(ctx, c.label, c.x, 1392, 62, P(t, c.at - 0.12, 0.4), { glowRgb: i === 0 ? MINT : '255,120,100', lit });
        txt(ctx, i === 0 ? 'ADA PENANDA D' : 'TANPA PENANDA D', c.x, 1468 - 10, { size: 20, font: F.mono6, color: i === 0 ? '#5FE3C0' : '#FF9A8A', align: 'center', track: 3, alpha: lit });
      });
    });
    ctx.restore();
  }

  /* ------------------------------- card 1 -------------------------------- */
  if (pX > 0.001) {
    ctx.save();
    ctx.globalAlpha *= pX;
    ctx.translate(0, 220 * (1 - pX));
    plane(ctx, cam, 0.9, () => {
      const mw = 1100;
      const mh = (mw * 17.6) / 47;
      const pMap = eo(P(t, tIndo - 0.35, 0.7));
      indoMap(ctx, 720 - mw / 2, 640, mw, mh, pMap, { a: 0.95 });
      // a thousand people; five are rhesus negative
      dotGrid(ctx, 230, 1088, 50, 20, 20, 4.4, P(t, t1 + 0.1, 1.3), { lit: LIT, litRgb: MINT, litP: P(t, tNeg2 - 0.1, 0.6), t, base: 'rgba(214,230,248,0.46)' });
      txt(ctx, 'TIAP TITIK = 1 ORANG', 1210, 1076, { size: 19, font: F.mono6, color: HUD.sub, align: 'right', track: 3, alpha: eo(P(t, t1 + 0.6, 0.5)) });
    });
    ctx.restore();
  }

  labStrip(ctx, t, { a: eo(P(t, 0.05, 0.6)), left: 'UJI GOLONGAN · ANTI-A · ANTI-B · ANTI-D' });

  // headline: RHESUS, then the payoff number on "kurang dari satu persen"
  const aH0 = 1 - eo(P(t, tKurang - 0.3, 0.3));
  if (aH0 > 0.01) hero(ctx, 'RHESUS', 'POSITIF ATAU NEGATIF · PENANDA D', 104, 440, P(t, 0.1, 0.7), { size: 200, a: aH0 });
  const aH1 = eo(P(t, tKurang - 0.12, 0.4));
  if (aH1 > 0.01) {
    hero(ctx, '< 1%', 'RHESUS NEGATIF DI INDONESIA', 104, 440, P(t, tKurang - 0.12, 0.7), { size: 210, a: aH1 });
    chip(ctx, '± 1,2 JUTA ORANG', 104, 568, P(t, tPersen + 0.3, 0.5), { align: 'left', color: '#5FE3C0' });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
