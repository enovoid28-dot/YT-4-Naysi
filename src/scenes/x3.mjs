import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { ringBurst, wordT } from './_bulan.mjs';
import { systemTiles, glyph } from './_darah.mjs';
import { tag, studio, rays, punch, zoomed } from './_lab.mjs';

// 03 — 49 SISTEM
// Card 0: a dark set, a cold key light. ABO arrives as one big glass tile and
// drops into slot 001; then the ISBT wall builds around it, 49 tiles in a wave,
// while the in-art counter rolls 1 → 49. The two newest wear their year.
// Card 1: the wall sinks back and its antigens pour out of it, one glyph per
// antigen, while the counter rolls past 360.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const ICE = '95,227,255';

const COLS = 7;
const TW = 172;
const TH = 110;
const GAP = 14;
const X0 = (1440 - (COLS * TW + (COLS - 1) * GAP)) / 2;
const Y0 = 470;
const tileC = (i) => [X0 + (i % COLS) * (TW + GAP) + TW / 2, Y0 + Math.floor(i / COLS) * (TH + GAP) + TH / 2];

// the antigen cloud: 371 glyphs (the antigens inside the systems, ISBT 2025)
const N_AG = 371;
const CLOUD = (() => {
  const r = rng(2025);
  const kinds = ['X', 'X', 'X', 'X', 'A', 'B', 'D', 'H', 'G'];
  const out = [];
  for (let i = 0; i < N_AG; i++) {
    const home = Math.floor(r() * 49);
    const an = r() * TAU;
    const rad = Math.sqrt(r());
    out.push({
      home,
      x: 720 + Math.cos(an) * rad * 620,
      y: 900 + Math.sin(an) * rad * 430,
      kind: kinds[Math.floor(r() * kinds.length)],
      rot: r() * TAU,
      s: 9 + r() * 7,
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
  const tTiga = wordT(scene, 1, 4);
  const tPuluh = wordT(scene, 1, 7);

  studio(ctx, t, cam, { top: '#061420', bottom: '#020509', rgb: '70,170,255', spot: [720, 950], spotR: 1200, spotA: 0.26, floor: 0.55, seed: 3 });
  rays(ctx, 720, 240, { t, rgb: '150,210,255', a: 0.055, n: 7, len: 1900, spread: 0.7, seed: 3 });

  const pBig = eo(P(t, tA - 0.2, 0.5));
  const pDrop = io(P(t, tSatu - 0.1, 0.7));
  const pWall = P(t, tEmpat - 0.25, tSistem + 0.25 - tEmpat);
  const dim = 0.66 * eo(P(t, t1 - 0.1, 0.6));
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  // a light wave sweeps the wall once it is complete
  const wv = P(t, tSistem + 0.2, 0.9);
  const wave = (i, c, r) => (wv > 0 && wv < 1 ? Math.max(0, 1 - Math.abs((c + r) / 12 - wv * 1.3 + 0.15) * 6) : 0);
  const k = punch(t, tSatu + 0.5, 0.035, 0.5);

  zoomed(ctx, k, 720, 900, () => plane(ctx, cam, 0.8, () => {
    systemTiles(ctx, X0, Y0, COLS, TW, TH, GAP, pWall, {
      hi: {
        0: [ICE, pDrop >= 1 ? 1 : 0],
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
      fill: 'rgba(8,22,36,0.86)', edge: 'rgba(150,210,255,0.24)', gloss: true, wave,
    });
    // ABO, big, then dropping into slot 001
    if (pBig > 0.01 && pDrop < 1) {
      const [sx, sy] = tileC(0);
      const kk = lerp(3.4, 1, pDrop);
      const x = lerp(720, sx, pDrop);
      const y = lerp(900, sy, pDrop);
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(kk * (0.85 + 0.15 * pBig), kk * (0.85 + 0.15 * pBig));
      ctx.translate(-TW / 2, -TH / 2);
      systemTiles(ctx, 0, 0, 1, TW, TH, 0, 1, { count: 1, hi: { 0: [ICE, 1] }, a: pBig, gloss: true, fill: 'rgba(8,22,36,0.9)' });
      ctx.restore();
    }
    const [ox, oy] = tileC(0);
    ringBurst(ctx, ox, oy, P(t, tSatu + 0.55, 0.8), { r: 160, color: ICE });

    // card 1: the antigens pour out of their tiles
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
  }));

  // the counters: systems, then antigens
  const aC = 1 - eo(P(t, t1 - 0.3, 0.3));
  const n = (tt) => 1 + 48 * io(P(tt, tEmpat - 0.1, tSistem + 0.3 - tEmpat));
  tag(ctx, 720, 1560, P(t, tEmpat - 0.15, 0.5), {
    count: { value: n(t), prev: n(t - 1 / 90), digits: 2 }, small: 'SISTEM', color: '#9FE8FF', size: 150, glowRgb: ICE, a: aC,
    sub: 'DIAKUI ISBT · 2026',
  });
  const val = (tt) => 360 * io(P(tt, t1 + 0.05, tPuluh + 0.3 - t1 - 0.05));
  const pGt = eo(P(t, tPuluh + 0.3, 0.35));
  tag(ctx, 720, 1560, P(t, t1 - 0.05, 0.5), {
    pre: '>', count: { value: val(t), prev: val(t - 1 / 90), digits: 3, preA: pGt }, small: 'PENANDA', color: '#FFD27A', size: 150,
    glowRgb: '255,198,84', sub: 'ANTIGEN TERCATAT',
  });
  void tTiga;
}

export default { draw: drawScene };
