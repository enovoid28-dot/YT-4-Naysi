import { CY, cue, P, eo, e3, io, sm, keys, frameOn, paper, plateFrame, heading, label, leader, swipe, textW, spline, sampleSpline, polyPath, swim, place, hatch, stipple, snow, waterLines, shafts, inset, drawOn, rng, clamp, lerp, TAU, F } from './_cyano.mjs';
import { ancientSprite, treeSprite, mossPatch, trilobite, crinoid } from './_fauna.mjs';

// 01 — LEBIH TUA
// A cross-section of an Ordovician coast, 450 million years ago: bare land
// with moss, a shallow sea with an early shark, crinoids and trilobites on
// the floor. "pohon" calls up a ghost tree and strikes it out (there are no
// trees yet); "Saat hiu pertama berenang" pushes the camera onto the shark;
// "daratan" pans to the bare land and "lumut" opens a lens on the moss.

const SEA = 1060;
const SURFACE = [[46, 958], [110, 942], [180, 922], [240, 910], [300, 916], [360, 936], [410, 968], [450, 1012], [482, 1064]];
const SLOPE = [[482, 1064], [536, 1160], [590, 1268], [650, 1386], [716, 1500], [790, 1596], [880, 1668], [1000, 1712], [1180, 1734], [1400, 1742]];
const GROUND = [...SURFACE.map((p) => [...p]), ...SLOPE.slice(1), [1400, 1800, 1], [40, 1800, 1], [40, 958, 1]];
const WATER = [[478, SEA, 1], [1400, SEA, 1], ...SLOPE.slice().reverse().map(([x, y]) => [x, y])];

let geom = null;
function build() {
  if (geom) return geom;
  const gPath = spline(GROUND.map(([x, y, s]) => [x, y, s ? 1 : 0]), { k: 0.9 });
  const wPath = spline(WATER, { k: 0.9 });
  const surf = sampleSpline([...SURFACE, ...SLOPE.slice(1)], { step: 8 });
  geom = { gPath, wPath, surf };
  return geom;
}

function ground(ctx, t) {
  const { gPath, surf } = build();
  ctx.save();
  ctx.fillStyle = 'rgba(237,242,239,0.07)';
  ctx.fill(gPath);
  ctx.clip(gPath);
  // strata: the surface line repeated downward, each band its own texture
  const R = rng(5);
  for (let i = 1; i < 16; i++) {
    const off = i * 46 + Math.sin(i * 1.7) * 10;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = CY.paper;
    ctx.lineWidth = i % 3 === 0 ? 2.2 : 1.2;
    ctx.beginPath();
    surf.forEach(([x, y], j) => {
      const yy = y + off + Math.sin(x * 0.012 + i) * 6;
      if (j) ctx.lineTo(x, yy);
      else ctx.moveTo(x, yy);
    });
    ctx.stroke();
    if (i % 2 === 0) {
      // stipple the sandstone bands
      for (let k = 0; k < 120; k++) {
        const j = Math.floor(R() * surf.length);
        const [x, y] = surf[j];
        const yy = y + off + 8 + R() * 30;
        ctx.globalAlpha = 0.35 + R() * 0.3;
        ctx.fillStyle = CY.paper;
        ctx.fillRect(x + (R() - 0.5) * 8, yy, 2, 2);
      }
    }
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = CY.white;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  surf.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
  // rocks and pebbles on the bare land
  const RR = rng(19);
  for (let i = 0; i < 18; i++) {
    const u = RR() * 0.62;
    const j = Math.floor(u * (surf.length - 1) * 0.42);
    const [x, y] = surf[j];
    const r = 4 + RR() * 12;
    ctx.save();
    ctx.strokeStyle = CY.paper;
    ctx.fillStyle = 'rgba(237,242,239,0.18)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(x + RR() * 6, y - r * 0.4, r * 1.4, r * 0.7, (RR() - 0.5) * 0.4, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  void t;
}

function sea(ctx, t) {
  const { wPath } = build();
  ctx.save();
  ctx.clip(wPath);
  ctx.fillStyle = 'rgba(4,15,40,0.32)';
  ctx.fillRect(440, SEA, 980, 760);
  shafts(ctx, t, { x: 980, y: SEA, len: 700, n: 6, spread: 800, a: 0.07 });
  waterLines(ctx, 440, 1400, SEA + 10, t, { n: 12, gap: 10, a: 0.45, seed: 4 });
  snow(ctx, t, { x0: 480, x1: 1400, y0: SEA + 20, y1: 1740, n: 80, a: 0.55 });
  ctx.restore();
  // the surface line
  ctx.save();
  ctx.strokeStyle = CY.white;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let x = 478; x <= 1400; x += 10) {
    const y = SEA + Math.sin(x * 0.03 + t * 1.4) * 3 + Math.sin(x * 0.011 - t * 0.7) * 2;
    if (x === 478) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
  label(ctx, 'LAUT', 1350, SEA + 52, { size: 26, align: 'right', a: 0.7, track: 6 });
}

function floorLife(ctx, t) {
  crinoid(ctx, 1110, 1724, 230, t, { seed: 2 });
  crinoid(ctx, 1196, 1732, 300, t, { seed: 5 });
  crinoid(ctx, 1300, 1738, 210, t, { seed: 8 });
  trilobite(ctx, 960, 1690, 0.42, { rot: -0.4 + Math.sin(t * 0.6) * 0.04 });
  trilobite(ctx, 1372, 1730, 0.34, { rot: 0.9 });
  trilobite(ctx, 850, 1652, 0.3, { rot: -0.8 });
  label(ctx, 'krinoid', 1330, 1500, { size: 26, align: 'left', font: F.italic, track: 0, color: CY.light, a: 0.9 });
  label(ctx, 'trilobit', 960, 1646, { size: 26, align: 'center', font: F.italic, track: 0, color: CY.light, a: 0.9 });
}

export default {
  draw(ctx, t, scene, env) {
    const tTua = cue(scene, 'tua');
    const tPohon = cue(scene, 'pohon');
    const tSaat = cue(scene, 'saat');
    const tDarat = cue(scene, 'daratan');
    const tGundul = cue(scene, 'gundul');
    const tLumut = cue(scene, 'lumut');

    const cam = keys(t, [
      [0, 720, 1000, 1.05],
      [1.6, 720, 1000, 1.0],
      [tSaat - 0.15, 720, 1000, 1.0],
      [tSaat + 0.85, 990, 1290, 1.42],
      [tDarat - 0.2, 1010, 1300, 1.44],
      [tDarat + 0.75, 440, 930, 1.5],
      [scene.dur, 446, 935, 1.56],
    ]);
    ctx.save();
    frameOn(ctx, cam, 720, 1000);
    paper(ctx, env.cam, { kind: 'plate' });
    plateFrame(ctx, { a: 0.9 });

    const hA = 1 - P(t, tSaat - 0.1, 0.4);
    heading(ctx, t, { kicker: 'PL. I  ·  ± 450 JUTA TAHUN LALU', lines: ['*Hiu* lebih tua', 'dari pohon.'], y: 452, size: 150, t0: -1, a: hA });
    // "tua": a brush swipe under the word as it is spoken
    const wHiu = textW(ctx, 'Hiu lebih ', 150, F.serif, -2);
    const wTua = textW(ctx, 'tua', 150, F.serif, -2);
    ctx.save();
    ctx.globalAlpha = hA;
    swipe(ctx, 104 + wHiu, 478, wTua, P(t, tTua, 0.35), { h: 14 });
    ctx.restore();

    sea(ctx, t);
    ground(ctx, t);
    floorLife(ctx, t);

    // moss on the land, small
    mossPatch(ctx, 130, 938, 0.22, { seed: 3 });
    mossPatch(ctx, 300, 914, 0.26, { seed: 7 });
    mossPatch(ctx, 392, 955, 0.18, { seed: 11 });

    // the ghost tree: called up by "pohon", then struck out
    const tree = treeSprite(0.9, 3);
    const gIn = P(t, tPohon - 0.1, 0.35);
    const gOut = 1 - P(t, tSaat + 0.1, 0.5);
    if (gIn * gOut > 0.01) {
      const k = 0.27;
      ctx.save();
      ctx.globalAlpha = 0.42 * gIn * gOut;
      ctx.drawImage(tree, 230 - tree.width * k * 0.5, 914 - tree.height * k, tree.width * k, tree.height * k);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = gOut;
      drawOn(ctx, [[140, 664], [322, 890]], P(t, tPohon + 0.3, 0.28, eo), { lw: 8, color: CY.amber });
      drawOn(ctx, [[322, 664], [140, 890]], P(t, tPohon + 0.45, 0.28, eo), { lw: 8, color: CY.amber });
      label(ctx, 'POHON?', 352, 752, { size: 34, color: CY.amber, p: P(t, tPohon + 0.5, 0.4), track: 5 });
      label(ctx, 'BELUM ADA', 352, 796, { size: 34, color: CY.amber, p: P(t, tPohon + 0.62, 0.4), track: 5 });
      ctx.restore();
    }

    // the early shark, cruising left
    const sp = ancientSprite(1.6);
    const sx = lerp(1010, 900, sm(t / scene.dur));
    swim(ctx, sp, sx, 1290 + Math.sin(t * 0.8) * 8, 0.66, t, { ux: 500, uy: 0, flip: true, amp: 0.02, hz: 0.75 });
    const pl = P(t, tSaat + 0.35, 0.6) * (1 - P(t, tDarat - 0.1, 0.4));
    leader(ctx, sx - 290, 1280, sx - 330, 1162, pl, { a: 0.9 });
    label(ctx, 'HIU PURBA', sx - 330, 1142, { size: 34, p: pl, align: 'center', track: 5, font: F.mono6 });
    label(ctx, 'rekonstruksi', sx - 330, 1104, { size: 30, p: P(t, tSaat + 0.55, 0.5), a: 1 - P(t, tDarat - 0.1, 0.4), align: 'center', font: F.italic, track: 0, color: CY.light });

    // bare land, and a lens on the moss
    label(ctx, 'DARAT', 70, 872, { size: 26, a: 0.7 * (1 - P(t, tGundul - 0.35, 0.25)), track: 6 });
    label(ctx, 'DARATAN', 70, 790, { size: 34, p: P(t, tGundul - 0.25, 0.45), track: 5, color: CY.amber });
    label(ctx, 'GUNDUL', 70, 836, { size: 34, p: P(t, tGundul - 0.1, 0.45), track: 5, color: CY.amber });
    inset(ctx, 600, 690, 150, P(t, tLumut - 0.25, 0.6), (c) => {
      c.save();
      c.fillStyle = 'rgba(237,242,239,0.08)';
      c.fillRect(440, 752, 320, 120);
      c.strokeStyle = CY.paper;
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(440, 754);
      c.quadraticCurveTo(600, 742, 760, 758);
      c.stroke();
      stipple(c, 440, 756, 760, 850, { n: 260, r: 2, a: 0.5, seed: 12 });
      mossPatch(c, 596, 752, 0.95, { seed: 7 });
      c.restore();
    }, { from: [300, 900, 36] });
    label(ctx, 'LUMUT & LUMUT HATI', 600, 884, { size: 26, align: 'center', p: P(t, tLumut + 0.1, 0.5), track: 4 });
    label(ctx, 'tinggi beberapa cm', 600, 920, { size: 28, align: 'center', p: P(t, tLumut + 0.25, 0.5), font: F.italic, track: 0, color: CY.light });
    ctx.restore();
  },
};
