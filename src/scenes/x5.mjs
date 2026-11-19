import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, ringBurst } from './_bulan.mjs';
import { vessel, vesselFront, drawCell, markers, glow, worldDots, sweep } from './_darah.mjs';
import { tag, studio, rays, sparks, grade, punch, zoomed } from './_lab.mjs';

// 05 — DARAH EMAS
// Card 0: the cell turns gold on "emas" — a shine crosses it, glitter rises,
// the light goes warm. On "nol" every Rh marker peels off its membrane and
// drifts away: Rh-null, nothing left to see.
// Card 1: a dark set and the world as a dot map; fewer than fifty people on
// all of it. The counter stops under 50 and a gold sweep crosses the land.
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
  const tDarah = wordT(scene, 0, 2);
  const tEmas = wordT(scene, 0, 3);
  const tNol = wordT(scene, 0, 5);
  const t1 = wordT(scene, 1, 0);
  const tKurang = wordT(scene, 1, 1);
  const tLima = wordT(scene, 1, 3);
  const tSel = wordT(scene, 1, 7);
  const tDunia = wordT(scene, 1, 8);
  const flow = [0.12, -0.38];
  const kGold = eo(P(t, tEmas - 0.1, 0.7));
  const pX = io(P(t, t1 - 0.35, 0.7));

  /* ------------------------------- card 0 -------------------------------- */
  if (pX < 0.999) {
    vessel(ctx, t, cam, { seed: 5, flow, dark: 0.12 });
    grade(ctx, { tint: '#FFB23A', k: 0.08 + 0.22 * kGold });
    rays(ctx, 720, 320, { t, rgb: '255,214,140', a: 0.04 + 0.07 * kGold, n: 9, len: 2000, spread: 0.65, seed: 6 });
    const cx = 720 + Math.sin(t * 0.5) * 10;
    const cy = 1040 + Math.cos(t * 0.55) * 8;
    const d = 720 * (1 - 0.15 * pX);
    const tilt = 26 + 10 * Math.sin(t * 0.4);
    const rot = 0.2 + t * 0.06;
    const k = punch(t, tEmas - 0.08, 0.05, 0.55);
    zoomed(ctx, k, cx, cy, () => plane(ctx, cam, 1.0, () => {
      glow(ctx, cx, cy, d * 2.6, GOLD, 0.5 * kGold);
      drawCell(ctx, cx, cy, d, { hero: true, tilt, rot, mix: { pal: 'gold', k: kGold } });
      const th = (tilt * Math.PI) / 180;
      sweep(ctx, cx - d * 0.6, cy - d * 0.6, d * 1.2, d * 1.2, P(t, tEmas - 0.05, 0.8), '255,240,190', 1, [cx, cy, d * 0.47, d * 0.47 * (Math.cos(th) + 0.3 * Math.sin(th)), rot]);
      markers(ctx, cx, cy, d, {
        kinds: ['D'], n: 22, p: P(t, 0.1, 1.2), t, tilt, rot, seed: 61, face: 0.55, len: 0.085,
        peel: io(P(t, tNol - 0.05, 1.3)),
      });
      ringBurst(ctx, cx, cy, P(t, tNol - 0.02, 0.9), { r: d * 0.95, color: GOLD });
      sparks(ctx, cx, cy, t, { n: 70, rgb: '255,214,120', r: d * 0.8, a: kGold, seed: 5, rise: 140, born: tEmas });
    }));
    vesselFront(ctx, t, cam, { seed: 5, flow, a: 0.5 });
    tag(ctx, 720, 1590, P(t, tNol - 0.05, 0.5), {
      big: 'RH-NULL', color: '#FFD98A', size: 130, glowRgb: GOLD, sub: '0 PENANDA RHESUS', a: 1 - pX,
    });
    void tDarah;
  }

  /* ------------------------------- card 1 -------------------------------- */
  if (pX > 0.001) {
    ctx.save();
    ctx.globalAlpha *= pX;
    studio(ctx, t, cam, { top: '#160F05', bottom: '#050302', rgb: '255,180,80', spot: [720, 900], spotR: 1150, spotA: 0.2, seed: 5 });
    plane(ctx, cam, 0.85, () => {
      const mw = 1240;
      const mh = mw * 0.3965;
      const mx = 100;
      const my = 600;
      worldDots(ctx, mx, my, mw, mh, P(t, t1 - 0.05, 0.9), { a: 1, base: 0.42, sweep: P(t, tSel - 0.3, 1.2) * 1.2 - 0.1, sweepRgb: GOLD });
      const nShow = Math.floor(CARRIERS.length * eo(P(t, tKurang, tLima + 0.6 - tKurang)));
      for (let i = 0; i < nShow; i++) {
        const [u, v] = CARRIERS[i];
        const x = mx + u * mw;
        const y = my + v * mh;
        const pulse = 1 + 0.25 * Math.sin(t * 4 + i * 1.7);
        glow(ctx, x, y, 80 * pulse, GOLD, 0.85);
        ctx.fillStyle = 'rgba(255,214,120,1)';
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    const val = (tt) => 50 * io(P(tt, tKurang - 0.05, tLima + 0.5 - tKurang));
    const pLt = eo(P(t, tLima + 0.45, 0.4));
    tag(ctx, 720, 1400, P(t, tKurang - 0.12, 0.5), {
      pre: '<', count: { value: val(t), prev: val(t - 1 / 90), digits: 2, preA: pLt }, small: 'ORANG', color: '#FFD98A', size: 150,
      glowRgb: GOLD, sub: 'PERTAMA DITEMUKAN · 1961',
    });
    void tDunia;
    void lerp;
    ctx.restore();
  }
}

export default { draw: drawScene };
