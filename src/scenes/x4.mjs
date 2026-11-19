import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, wordT, ringBurst } from './_bulan.mjs';
import { indoMap } from './_krakatau.mjs';
import { well, dotGrid, glow } from './_darah.mjs';
import { tag, typingCard, dropper, desk, studio, rays } from './_lab.mjs';

// 04 — RHESUS
// Card 0: a lab bench under a cold lamp. The typing card every sample meets —
// anti-A, anti-B, anti-D — and a pipette drops blood into each well on
// "dicek". "Rhesus" lights anti-D. Below it the two answers: the blood that
// clumps with anti-D is positive, the one that stays smooth is negative.
// Card 1: Indonesia, and a thousand people as dots: five of them are rhesus
// negative. Under one percent.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const MINT = '95,227,192';
const CORAL = '255,138,122';

// five of a thousand, spread so no two sit together
const LIT = [127, 388, 512, 743, 961];

// the card's geometry (typingCard lays its wells out like this)
const CW = 1180;
const CX = 720;
const CY = 1150;
const CH = CW * 0.46;
const WX = (i) => CX - CW / 2 + (CW / 3) * (i + 0.5);
const WY = CY - CH / 2 + CH * 0.56;

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const tDicek = wordT(scene, 0, 3);
  const tRh = wordT(scene, 0, 7);
  const tPos = wordT(scene, 0, 8);
  const tNeg = wordT(scene, 0, 10);
  const t1 = wordT(scene, 1, 0);
  const tIndo = wordT(scene, 1, 1);
  const tNeg2 = wordT(scene, 1, 3);
  const tKurang = wordT(scene, 1, 4);
  const tPersen = wordT(scene, 1, 7);

  const pX = io(P(t, t1 - 0.3, 0.7));
  // the drops: one per well, the middle one on "dicek"
  const tDrop = [tDicek - 0.42, tDicek - 0.05, tDicek + 0.32];

  /* ------------------------------- card 0 -------------------------------- */
  if (pX < 0.999) {
    desk(ctx, t, cam, { tone: 'slate', lamp: [720, 1250], lampR: 1300, rgb: '190,220,255' });
    rays(ctx, 720, 560, { t, rgb: '200,230,255', a: 0.05, n: 6, len: 1900, spread: 0.55, seed: 4 });
    ctx.save();
    ctx.translate(0, -200 * pX);
    ctx.globalAlpha *= 1 - pX;
    plane(ctx, cam, 0.8, () => {
      const litD = eo(P(t, tRh - 0.1, 0.4));
      const chips = ['#3F7FE0', '#E8C23A', '#E8E4DC'];
      const labels = ['ANTI-A', 'ANTI-B', 'ANTI-D'];
      typingCard(ctx, CX, CY, CW, {
        p: P(t, 0.05, 0.6), t,
        wells: labels.map((s, i) => ({ label: s, chip: chips[i], lit: i === 2 ? litD : 0, litRgb: MINT })),
        well: (c, x, y, r, wl, i) => well(c, x, y, r * 0.9, { p: P(t, tDrop[i] + 0.22, 0.45), seed: 40 + i, t, agg: i === 2 ? 0.0 : 0 }),
      });
      ringBurst(ctx, WX(2), WY, P(t, tRh - 0.05, 0.8), { r: 190, color: MINT });
      // the pipette: in from the right, over each well in turn, then away
      const at = (tt) => {
        if (tt < tDrop[0]) return [lerp(1500, WX(0), eo(P(tt, tDrop[0] - 0.55, 0.5))), WY - 250];
        if (tt < tDrop[1]) return [lerp(WX(0), WX(1), io(P(tt, tDrop[0] + 0.12, tDrop[1] - tDrop[0] - 0.2))), WY - 250];
        if (tt < tDrop[2]) return [lerp(WX(1), WX(2), io(P(tt, tDrop[1] + 0.12, tDrop[2] - tDrop[1] - 0.2))), WY - 250];
        return [lerp(WX(2), 1700, EASE.inQuad(P(tt, tDrop[2] + 0.3, 0.6))), WY - 250 - 300 * EASE.inQuad(P(tt, tDrop[2] + 0.3, 0.6))];
      };
      const [px, py] = at(t);
      let drop = 0;
      for (let i = 0; i < 3; i++) {
        const dd = P(t, tDrop[i] - 0.2, 0.42);
        if (dd > 0 && dd < 1) drop = dd;
      }
      dropper(ctx, px, py, 300, { p: P(t, tDrop[0] - 0.6, 0.4), drop, fall: 170, rot: 0.0 });

      // the two answers
      const ys = 1650;
      const pPos = P(t, tPos - 0.15, 0.45);
      const pNeg = P(t, tNeg - 0.15, 0.45);
      if (pPos > 0) glow(ctx, 450, ys, 340, MINT, 0.3 * eo(pPos));
      if (pNeg > 0) glow(ctx, 990, ys, 340, CORAL, 0.26 * eo(pNeg));
      well(ctx, 450, ys, 104, { p: pPos, seed: 61, t, agg: eo(P(t, tPos + 0.05, 0.8)) });
      well(ctx, 990, ys, 104, { p: pNeg, seed: 62, t, agg: 0 });
      tag(ctx, 450, 1880, P(t, tPos - 0.05, 0.45), { big: 'RH +', color: '#7FF0CF', size: 104, glowRgb: MINT, sub: 'MENGGUMPAL' });
      tag(ctx, 990, 1880, P(t, tNeg - 0.05, 0.45), { big: 'RH −', color: '#FFA090', size: 104, glowRgb: CORAL, sub: 'TETAP HALUS' });
    });
    ctx.restore();
  }

  /* ------------------------------- card 1 -------------------------------- */
  if (pX > 0.001) {
    ctx.save();
    ctx.globalAlpha *= pX;
    studio(ctx, t, cam, { top: '#03141A', bottom: '#010608', rgb: '60,200,180', spot: [720, 1150], spotR: 1150, spotA: 0.22, seed: 4 });
    ctx.translate(0, 200 * (1 - pX));
    plane(ctx, cam, 0.85, () => {
      const mw = 1240;
      const mh = (mw * 17.6) / 47;
      const pMap = eo(P(t, tIndo - 0.35, 0.7));
      indoMap(ctx, 720 - mw / 2, 860, mw, mh, pMap, { a: 0.95 });
      // a thousand people; five are rhesus negative
      dotGrid(ctx, 181, 1400, 50, 20, 22, 4.8, P(t, t1 + 0.1, 1.3), { lit: LIT, litRgb: MINT, litP: P(t, tNeg2 - 0.1, 0.6), t, base: 'rgba(214,230,248,0.46)' });
      txt(ctx, 'TIAP TITIK = 1 ORANG', 1259, 1366, { size: 22, font: F.mono6, color: HUD.sub, align: 'right', track: 3, alpha: eo(P(t, t1 + 0.6, 0.5)) });
    });
    tag(ctx, 720, 1960, P(t, tKurang - 0.1, 0.5), {
      big: '< 1%', color: '#7FF0CF', size: 150, glowRgb: MINT, sub: '± 1,2 JUTA ORANG',
    });
    void tPersen;
    ctx.restore();
  }
}

export default { draw: drawScene };
