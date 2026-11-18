import { txt, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, hero, chip, hudFrame, wordT, ringBurst, roll } from './_bulan.mjs';
import { vessel, vesselFront, drawCell, markers, glow, sweep, worldDots, labStrip } from './_darah.mjs';

// 05 — DARAH EMAS
// Card 0: the cell turns gold on "emas"; on "nol" every Rh marker peels off
// its membrane and drifts away — Rh-null, nothing left to see.
// Card 1: the world as a dot map; fewer than fifty people on all of it, the
// counter stops under 50 and a gold sweep crosses the continents.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const GOLD = '255,198,84';

// scattered points for "around the world" (lon, lat), drawn without labels
const CARRIERS = [
  [133, -24], [139, 36], [-8, 53], [7.5, 46.8], [-77, 39], [-47, -15], [-74, 4.6], [116, 40],
  [78, 21], [-120, 37], [2, 47], [28, -26], [45, 24], [37, 55],
].map(([lo, la]) => [(lo + 180) / 360, (84 - la) / 142]);

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.8);
  const tEmas = wordT(scene, 0, 3);
  const tNol = wordT(scene, 0, 5);
  const tTanpa = wordT(scene, 0, 6);
  const t1 = wordT(scene, 1, 0);
  const tKurang = wordT(scene, 1, 1);
  const tLima = wordT(scene, 1, 3);
  const tSel = wordT(scene, 1, 7);
  const tDunia = wordT(scene, 1, 8);
  const flow = [0.12, -0.38];

  const kGold = eo(P(t, tEmas - 0.1, 0.7));
  vessel(ctx, t, cam, { seed: 5, flow, dark: 0.18 + 0.35 * io(P(t, t1 - 0.3, 0.7)), gold: 0 });

  const pX = io(P(t, t1 - 0.25, 0.8));
  const cx = 720 + Math.sin(t * 0.5) * 10;
  const cy = lerp(1000, 760, pX);
  const d = lerp(640, 300, pX);
  const tilt = 26 + 10 * Math.sin(t * 0.4);
  const rot = 0.2 + t * 0.06;
  plane(ctx, cam, 1.0, () => {
    glow(ctx, cx, cy, d * 2.5, GOLD, 0.45 * kGold * (1 - 0.5 * pX));
    drawCell(ctx, cx, cy, d, { hero: true, tilt, rot, mix: { pal: 'gold', k: kGold } });
    {
      const th = (tilt * Math.PI) / 180;
      sweep(ctx, cx - d * 0.6, cy - d * 0.6, d * 1.2, d * 1.2, P(t, tEmas - 0.05, 0.8), '255,240,190', 1, [cx, cy, d * 0.47, d * 0.47 * (Math.cos(th) + 0.3 * Math.sin(th)), rot]);
    }
    // Rh markers, then none: they peel off on "nol"
    markers(ctx, cx, cy, d, {
      kinds: ['D'], n: 20, p: P(t, 0.1, 1.2), t, tilt, rot, seed: 61, face: 0.55, len: 0.085,
      peel: io(P(t, tNol - 0.05, 1.3)), a: 1 - pX,
    });
    ringBurst(ctx, cx, cy, P(t, tNol - 0.02, 0.9), { r: d * 0.95, color: GOLD });
    if (pX > 0.01) {
      // card 1: the world, a sweep, and the few carriers
      const mw = 1240;
      const mh = mw * 0.3965;
      const mx = 100;
      const my = 940;
      const pMap = P(t, t1 - 0.05, 0.9);
      worldDots(ctx, mx, my, mw, mh, pMap, { a: pX, base: 0.42, sweep: P(t, tSel - 0.3, 1.2) * 1.2 - 0.1, sweepRgb: GOLD });
      const nShow = Math.floor(CARRIERS.length * eo(P(t, tKurang, tLima + 0.6 - tKurang)));
      for (let i = 0; i < nShow; i++) {
        const [u, v] = CARRIERS[i];
        const x = mx + u * mw;
        const y = my + v * mh;
        const pulse = 1 + 0.25 * Math.sin(t * 4 + i * 1.7);
        glow(ctx, x, y, 70 * pulse, GOLD, 0.8 * pX);
        ctx.fillStyle = `rgba(255,214,120,${pX})`;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  vesselFront(ctx, t, cam, { seed: 5, flow, a: 0.6 * (1 - pX) });

  // card 0 chips: Rh-null, zero markers
  const a0 = 1 - eo(P(t, t1 - 0.3, 0.3));
  chip(ctx, 'RH-NULL', 1336, 1290, P(t, tNol + 0.05, 0.5), { align: 'right', color: '#FFC654', a: a0 });
  chip(ctx, '0 PENANDA RHESUS', 1336, 1370, P(t, tTanpa + 0.2, 0.5), { align: 'right', color: '#FFC654', a: a0 });

  labStrip(ctx, t, { a: eo(P(t, 0.05, 0.6)), left: 'RH-NULL · DARAH EMAS' });

  // headlines
  const aH0 = 1 - eo(P(t, tKurang - 0.3, 0.3));
  if (aH0 > 0.01) hero(ctx, 'DARAH EMAS', 'RHESUS NOL · TANPA PENANDA RH', 104, 440, P(t, wordT(scene, 0, 2) - 0.12, 0.7), { size: 180, a: aH0, color: '#FFD98A' });
  const aH1 = eo(P(t, tKurang - 0.12, 0.4));
  if (aH1 > 0.01) {
    const val = (tt) => 50 * io(P(tt, tKurang - 0.05, tLima + 0.5 - tKurang));
    // the count runs up first; the "<" slides in once it lands on 50
    const pLt = eo(P(t, tLima + 0.45, 0.4));
    const lt = measure(ctx, '< ', 210, F.display, -6) * pLt;
    txt(ctx, '<', 104 - (1 - pLt) * 40, 440, { size: 210, font: F.display, color: '#FFD98A', alpha: aH1 * pLt });
    roll(ctx, val(t), 104 + lt, 440, { size: 210, font: F.display, color: HUD.bone, a: aH1, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'ORANG DI SELURUH DUNIA', 110, 492, { size: 25, font: F.mono6, color: '#FFC654', track: 6, alpha: aH1 });
    chip(ctx, 'PERTAMA DITEMUKAN · 1961', 104, 568, P(t, tDunia + 0.3, 0.5), { align: 'left', color: '#FFC654' });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
