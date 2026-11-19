import { CY, cue, P, eo, e3, paper, plateFrame, heading, label, textW, drawOn, clamp, lerp, TAU, F } from './_cyano.mjs';
import { waffle } from './_chart.mjs';
import { sharkIcon, rayIcon, chimaeraIcon } from './_fauna.mjs';

// 07 — TERANCAM
// All 1,199 sharks, rays and chimaeras as a 100-cell waffle (Dulvy et al.
// 2021): 45 cells of sharks, 51 of rays, 4 of chimaeras. "lebih dari
// sepertiga" paints the threatened 37.5% in IUCN colours, critically
// endangered first; "penangkapan berlebihan" draws a net over the grid.

const G = { x: 206, y: 690, size: 92, gap: 12 };
const GW = 10 * G.size + 9 * G.gap;

// cells in reading order: each group's threatened species first, worst first
const CELLS = (() => {
  const list = [];
  const group = (g, n, cr, en, vu) => {
    for (let i = 0; i < n; i++) list.push({ g, st: i < cr ? 'cr' : i < cr + en ? 'en' : i < cr + en + vu ? 'vu' : null });
  };
  group('shark', 45, 4, 5, 7);
  group('ray', 51, 5, 7, 10);
  group('chim', 4, 0, 0, 0);
  return list;
})();

let ICONS = null;
function icons() {
  if (ICONS) return ICONS;
  ICONS = {
    shark: sharkIcon(150, CY.paper),
    sharkDark: sharkIcon(150, CY.deep),
    ray: rayIcon(150, CY.paper),
    rayDark: rayIcon(150, CY.deep),
    chim: chimaeraIcon(150, CY.paper),
    chimDark: chimaeraIcon(150, CY.deep),
  };
  return ICONS;
}

/** a fishing net drawn down over the grid: diamond mesh, knots, a float line */
function net(ctx, x, y, w, h, p, t) {
  if (p <= 0.001) return;
  const yr = y + (h + 40) * e3(p);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 30, y - 40, w + 60, yr - y + 40);
  ctx.clip();
  const m = 64;
  const sag = (xx) => Math.sin((xx - x) / w * Math.PI) * 26 * p;
  ctx.strokeStyle = CY.white;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.72;
  for (let k = -h; k < w + h; k += m) {
    ctx.beginPath();
    for (let s = 0; s <= h; s += 16) {
      const xx = x + k + s;
      if (xx < x - 30 || xx > x + w + 30) continue;
      ctx.lineTo(xx + Math.sin(t * 1.3 + s * 0.02) * 2, y + s + sag(xx));
    }
    ctx.stroke();
    ctx.beginPath();
    for (let s = 0; s <= h; s += 16) {
      const xx = x + k - s;
      if (xx < x - 30 || xx > x + w + 30) continue;
      ctx.lineTo(xx + Math.sin(t * 1.3 + s * 0.02) * 2, y + s + sag(xx));
    }
    ctx.stroke();
  }
  // head rope with floats
  ctx.globalAlpha = 1;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 30, y - 12);
  ctx.lineTo(x + w + 30, y - 12);
  ctx.stroke();
  ctx.fillStyle = CY.amber;
  for (let xx = x; xx <= x + w; xx += 128) {
    ctx.beginPath();
    ctx.ellipse(xx, y - 12, 22, 13, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, env) {
    const tBertahan = cue(scene, 'bertahan');
    const tLebih = cue(scene, 'lebih');
    const tSeper = cue(scene, 'sepertiga');
    const tJenis = cue(scene, 'jenis');
    const tTer = cue(scene, 'terancam');
    const tPeny = cue(scene, 'penyebab');
    const tPen = cue(scene, 'penangkapan');

    paper(ctx, env.cam, { kind: 'plate' });
    plateFrame(ctx, {});
    const h1 = 1 - P(t, tLebih - 0.35, 0.3);
    heading(ctx, t, { kicker: 'PL. VII  ·  1.199 JENIS', lines: ['Bertahan 450', 'juta *tahun*…'], y: 410, size: 124, t0: -0.4, a: h1 });
    const h2 = P(t, tLebih - 0.2, 0.2) * (1 - P(t, tPeny - 0.35, 0.3));
    heading(ctx, t, { kicker: 'PL. VII  ·  STATUS IUCN', lines: ['Lebih dari *1/3*', 'terancam punah'], y: 410, size: 124, t0: tLebih - 0.15, a: h2 });
    const h3 = P(t, tPeny - 0.2, 0.2);
    heading(ctx, t, { kicker: 'PL. VII  ·  PENYEBAB UTAMA', lines: ['Penangkapan', '*berlebihan*'], y: 410, size: 124, t0: tPeny - 0.15, a: h3 });

    // the grid: every chondrichthyan species, 1 cell ~ 12 species
    const ic = icons();
    const paint = clamp((t - (tSeper - 0.1)) / Math.max(0.5, tTer + 0.3 - tSeper));
    waffle(ctx, G.x, G.y, G.size, G.gap, CELLS, ic, { p: P(t, -0.1, 1.6, (x) => x), paint, t });

    // group legend
    const legend = [['shark', 'HIU', '536'], ['ray', 'PARI', '611'], ['chim', 'HIU HANTU', '52']];
    let lx = G.x;
    legend.forEach(([g, name, n], i) => {
      const q = P(t, 0.9 + i * 0.12, 0.5);
      const im = ic[g];
      const w = 64;
      const s = `${name} ${n}`;
      ctx.save();
      ctx.globalAlpha = q;
      ctx.drawImage(im, lx, 1762 - (im.height * w) / im.width / 2 - 8, w, (im.height * w) / im.width);
      ctx.restore();
      label(ctx, s, lx + w + 14, 1764, { size: 26, track: 3, p: q });
      lx += w + 14 + textW(ctx, s, 26, F.mono6, 3) + 52;
    });
    // scale note, then the status legend once the colour goes in
    const ps = P(t, tSeper, 0.5);
    label(ctx, '1 KOTAK ≈ 12 JENIS', G.x + GW, 644, { size: 26, align: 'right', track: 3, a: 0.85 * P(t, 1.2, 0.6) * (1 - ps) });
    if (ps > 0.001) {
      const st = [[CY.cr, 'KRITIS'], [CY.en, 'GENTING'], [CY.vu, 'RENTAN']];
      let sx = G.x;
      st.forEach(([col, name], i) => {
        const q = P(t, tSeper + i * 0.15, 0.4);
        ctx.save();
        ctx.globalAlpha = q;
        ctx.fillStyle = col;
        ctx.fillRect(sx, 618, 30, 30);
        ctx.restore();
        label(ctx, name, sx + 44, 644, { size: 26, track: 3, p: q });
        sx += 44 + textW(ctx, name, 26, F.mono6, 3) + 40;
      });
      label(ctx, '37,5% · DULVY DKK. 2021', G.x + GW, 644, { size: 26, align: 'right', track: 2, color: CY.amber, p: P(t, tJenis, 0.5) });
    }

    // the cause: a net comes down over all of it
    const pn = P(t, tPen - 0.25, 1.1, (x) => x);
    net(ctx, G.x, G.y, GW, GW, pn, t);
    void tBertahan;
    void eo;
    void drawOn;
    void lerp;
    void F;
  },
};
