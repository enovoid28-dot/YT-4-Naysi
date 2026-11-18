import { txt, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, roll, hudFrame, wordT, ringBurst } from './_bulan.mjs';
import { vessel, systemTiles, glyph, labStrip, glow } from './_darah.mjs';

// 03 — 49 SISTEM
// Card 0: ABO lands alone as one big tile, drops into slot 001, and the other
// 48 ISBT systems fill a seven-by-seven wall while the counter runs to 49; the
// two newest wear their year (PIGZ 2025, JAMA 2026).
// Card 1: the wall sinks back and its markers pour out of it, one glyph per
// antigen, counted up past 360.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

const COLS = 7;
const TW = 165;
const TH = 104;
const GAP = 12;
const X0 = 104;
const Y0 = 628;
const tileC = (i) => [X0 + (i % COLS) * (TW + GAP) + TW / 2, Y0 + Math.floor(i / COLS) * (TH + GAP) + TH / 2];

// the antigen cloud: 371 glyphs (the antigens inside the systems, ISBT 2025)
const N_AG = 371;
const CLOUD = (() => {
  const r = rng(2025);
  const kinds = ['X', 'X', 'X', 'X', 'A', 'B', 'D', 'H', 'G'];
  const out = [];
  for (let i = 0; i < N_AG; i++) {
    const home = Math.floor(r() * 49);
    // a loose ellipse of points over the wall, denser in the middle
    const an = r() * TAU;
    const rad = Math.sqrt(r());
    out.push({
      home,
      x: 720 + Math.cos(an) * rad * 590,
      y: 1050 + Math.sin(an) * rad * 400,
      kind: kinds[Math.floor(r() * kinds.length)],
      rot: r() * TAU,
      s: 8 + r() * 6,
      ph: r() * TAU,
    });
  }
  return out;
})();

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const tA = wordT(scene, 0, 1);
  const tSatu = wordT(scene, 0, 5);
  const tEmpat = wordT(scene, 0, 7);
  const tSistem = wordT(scene, 0, 10);
  const t1 = wordT(scene, 1, 0);
  const tPuluh = wordT(scene, 1, 7);

  vessel(ctx, t, cam, { seed: 3, flow: [0.1, -0.35], dark: 0.5 });

  const pBig = eo(P(t, tA - 0.2, 0.5));
  const pDrop = io(P(t, tSatu - 0.1, 0.7));
  const pWall = P(t, tEmpat - 0.25, tSistem + 0.25 - tEmpat);
  const dim = 0.62 * eo(P(t, t1 - 0.1, 0.6));
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);

  plane(ctx, cam, 0.8, () => {
    // the wall (ABO drawn on its own while it is the big tile)
    systemTiles(ctx, X0, Y0, COLS, TW, TH, GAP, pWall, {
      hi: {
        0: ['95,227,255', pDrop >= 1 ? 1 : 0],
        3: ['95,227,192', 0.7 * eo(P(t, tSistem + 0.4, 0.6))],
        47: ['200,160,255', 0.8 * eo(P(t, tSistem + 0.6, 0.6)) * (0.7 + 0.3 * pulse)],
        48: ['255,176,58', 0.85 * eo(P(t, tSistem + 0.85, 0.6))],
      },
      badge: {
        47: ['2025', '200,160,255', P(t, tSistem + 0.6, 0.4)],
        48: ['2026', '255,176,58', P(t, tSistem + 0.85, 0.4)],
      },
      dim,
      skip: pDrop < 1 ? 0 : -1,
    });
    // ABO, big, then dropping into slot 001
    if (pBig > 0.01 && pDrop < 1) {
      const [sx, sy] = tileC(0);
      const k = lerp(3.2, 1, pDrop);
      const x = lerp(720, sx, pDrop);
      const y = lerp(1040, sy, pDrop);
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(k * (0.85 + 0.15 * pBig), k * (0.85 + 0.15 * pBig));
      ctx.translate(-TW / 2, -TH / 2);
      systemTiles(ctx, 0, 0, 1, TW, TH, 0, 1, { count: 1, hi: { 0: ['95,227,255', 1] }, a: pBig });
      ctx.restore();
    }
    const [ox, oy] = tileC(0);
    ringBurst(ctx, ox, oy, P(t, tSatu + 0.55, 0.8), { r: 160, color: '95,227,255' });

    // card 1: the markers pour out of their tiles, counted
    const val = (tt) => 360 * io(P(tt, t1 + 0.05, tPuluh + 0.3 - t1 - 0.05));
    const v = val(t);
    const shown = v >= 359.5 ? N_AG : Math.floor((v / 360) * (N_AG - 11));
    for (let i = 0; i < shown; i++) {
      const c = CLOUD[i];
      const born = t1 + 0.05 + (i / N_AG) * (tPuluh + 0.3 - t1);
      const q = eo(P(t, born, 0.7));
      const [hx, hy] = tileC(c.home);
      const x = lerp(hx, c.x, q) + Math.sin(t * 0.9 + c.ph) * 10 * q;
      const y = lerp(hy, c.y, q) + Math.cos(t * 0.8 + c.ph) * 10 * q;
      glyph(ctx, c.kind, x, y, c.s, c.rot + t * 0.3, clamp(q * 2), 0.45);
    }
  });

  labStrip(ctx, t, { a: eo(P(t, 0.05, 0.6)), left: 'ISBT · 49 SISTEM · 2026' });

  // headline: the counter, 1 -> 49, then 0 -> 360+
  const aC = eo(P(t, 0.3, 0.5)) * (1 - eo(P(t, t1 - 0.25, 0.3)));
  if (aC > 0.01) {
    const n = (tt) => 1 + 48 * io(P(tt, tEmpat - 0.1, tSistem + 0.3 - tEmpat));
    const w = roll(ctx, n(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aC, track: -6, prev: n(t - 1 / 90) });
    txt(ctx, 'SISTEM', 104 + w + 26, 440, { size: 96, font: F.display, color: HUD.bone, alpha: aC });
    txt(ctx, 'GOLONGAN DARAH · DIAKUI ISBT', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aC });
  }
  const aN = eo(P(t, t1 - 0.05, 0.4));
  if (aN > 0.01) {
    const val = (tt) => 360 * io(P(tt, t1 + 0.05, tPuluh + 0.3 - t1 - 0.05));
    const w = roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aN, track: -6, prev: val(t - 1 / 90) });
    const pPlus = eo(P(t, tPuluh + 0.3, 0.35));
    if (pPlus > 0.01) {
      txt(ctx, '+', 104 + w + 10, 440 - (1 - pPlus) * 30, { size: 170, font: F.display, color: HUD.amber, alpha: aN * pPlus });
    }
    txt(ctx, 'PENANDA (ANTIGEN) TERCATAT', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aN });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
