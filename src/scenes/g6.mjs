// Sheet 06 — "Lebarnya sekitar lima ribu seratus kilometer. Amerika Serikat
// dari pantai ke pantai cuma sekitar empat ribu lima ratus."
//
// The overlay again, now measured. On the map the vermilion cut-out (true
// size) lies across the lower 48 states; under it two engraved rulers at one
// true scale: Indonesia east-west ~5,100 km (95.2 E - 141.0 E along the
// equator: 5,095 km), the United States coast to coast ~4,500 km (124.7 W -
// 67.0 W along 45 N: 4,544 km). Each bar is set by its spoken words.
import * as A from './_atlas.mjs';

const { AT, cue, P, e3, io, sm, clamp, lerp, D, EASE } = A;
const IDX = 5;

const C0 = [118, -2.5];
const T_US = [-95.85, 36.96];
const R6 = { x: A.MAPR.x, y: A.MAPR.y, w: A.MAPR.w, h: 760 };
const V6 = () => A.view('merc', -97, 36.3, 905, R6.x + R6.w / 2, R6.y + R6.h / 2);

function print() {
  return A.printMap('g6', V6(), {
    rect: R6,
    margin: 80,
    gap: 8,
    fills: [['United States of America', 'rgba(46,91,123,0.22)']],
    graticule: { step: 5, a: 0.2 },
    letter: (c, V) => {
      for (const [s, lon, lat, size] of [['SAMUDRA PASIFIK', -130, 27, 28], ['SAMUDRA ATLANTIK', -63, 32, 28]]) {
        const [x, y] = A.px(V, lon, lat);
        A.seaName(c, s, x, y, { size });
      }
    },
  });
}

let RINGS = null;
const rings = () => RINGS || (RINGS = A.shapeRings('Indonesia'));
let PATH = null;

/** the value a bar shows: set piecewise by the words that say it */
function spoken(t, steps) {
  let v = 0;
  for (const [at, val] of steps) {
    const p = P(t, at, 0.32, EASE.outCubic);
    if (p <= 0) break;
    v = lerp(v, val, p);
  }
  return v;
}

export function draw(ctx, t, scene, o = {}) {
  const tLima = cue(scene, 'lima');
  const tSeratus = cue(scene, 'seratus');
  const tKm = cue(scene, 'kilometer');
  const tAS = cue(scene, 'amerika');
  const tP1 = cue(scene, 'pantai');
  const tP2 = cue(scene, 'pantai', 1);
  const tEmpat = cue(scene, 'empat');
  const tLima2 = cue(scene, 'lima', 1);
  const V = V6();

  A.frame(ctx, o, IDX, (c) => {
    A.drawPrints(c, V, [print()], R6);
    c.save();
    c.beginPath();
    c.rect(R6.x, R6.y, R6.w, R6.h);
    c.clip();
    PATH = PATH || A.movedPath(rings(), A.mover(C0, T_US), V);
    A.cutout(c, PATH, { lift: 0.08 + 0.04 * Math.sin(t * 2) });
    // the overhangs: west end in the Pacific, east end in the Atlantic
    const w = A.px(V, -126.4, 41.2);
    const e = A.px(V, -71.2, 28.6);
    A.tag(c, 'INDONESIA · UKURAN ASLI', w[0] + 10, w[1] + 150, { p: P(t, 0.2, 0.45), ax: w[0] + 26, ay: w[1] + 12, color: AT.vermDeep, size: 22 });
    // coast to coast: the two shores of the United States
    const pc = A.px(V, -124.1, 44.5);
    const ac = A.px(V, -68.6, 44.6);
    A.tag(c, 'PANTAI PASIFIK', pc[0] + 10, pc[1] - 130, { p: P(t, tP1 - 0.1, 0.4), ax: pc[0], ay: pc[1], color: AT.blue, size: 20 });
    A.tag(c, 'PANTAI ATLANTIK', ac[0] - 10, ac[1] - 150, { p: P(t, tP2 - 0.1, 0.4), ax: ac[0], ay: ac[1], color: AT.blue, size: 20, align: 'right' });
    A.tag(c, 'AMERIKA SERIKAT', A.px(V, -100, 47.5)[0] - 140, R6.y + 60, { p: P(t, tAS - 0.1, 0.4), ax: A.px(V, -100, 46)[0], ay: A.px(V, -100, 46)[1], color: AT.blue, size: 22 });
    c.restore();
    A.neatline(c, R6);

    // ------------------------- the rulers, one scale -------------------------
    const x0 = R6.x + 60;
    const KM = 5500;
    const L = R6.w - 120;
    const k = L / KM;
    const y0 = R6.y + R6.h + 74;
    const rp = P(t, 0, 0.6);
    c.save();
    c.globalAlpha = rp;
    c.strokeStyle = AT.ink;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x0 + L, y0);
    for (let km = 0; km <= KM; km += 100) {
      const x = x0 + km * k;
      const h = km % 1000 === 0 ? 18 : km % 500 === 0 ? 12 : 6;
      c.moveTo(x, y0);
      c.lineTo(x, y0 - h);
    }
    c.stroke();
    c.restore();
    for (let km = 0; km <= 5000; km += 1000) A.label(c, km === 0 ? '0' : `${km / 1000}.000`, x0 + km * k, y0 - 28, { size: 18, align: 'center', track: 1, color: AT.ink2, a: rp });
    A.label(c, 'KM', x0 + 5500 * k, y0 - 28, { size: 18, align: 'center', track: 2, color: AT.ink2, a: rp });

    const bars = [
      { name: 'INDONESIA · TIMUR–BARAT', col: AT.verm, deep: AT.vermDeep, y: y0 + 60, steps: [[tLima - 0.02, 5000], [tSeratus - 0.02, 5100]], unit: tKm },
      { name: 'AMERIKA SERIKAT · PANTAI KE PANTAI', col: AT.blue, deep: AT.blue, y: y0 + 210, steps: [[tEmpat - 0.02, 4000], [tLima2 - 0.02, 4500]], unit: tLima2 + 0.3 },
    ];
    for (const b of bars) {
      const v = spoken(t, b.steps);
      const la = P(t, b.steps[0][0] - 0.6, 0.4);
      A.label(c, b.name, x0, b.y - 16, { size: 20, track: 3, p: la, color: b.deep });
      if (v <= 0.5) continue;
      const w = v * k;
      c.save();
      c.fillStyle = b.col;
      c.globalAlpha = 0.9;
      c.fillRect(x0, b.y, w, 42);
      c.globalAlpha = 0.25;
      c.fillStyle = '#000';
      for (let xx = x0 + 6; xx < x0 + w - 2; xx += 9) c.fillRect(xx, b.y, 1.2, 42);
      c.restore();
      c.save();
      c.strokeStyle = AT.ink;
      c.lineWidth = 1.6;
      c.strokeRect(x0, b.y, w, 42);
      c.restore();
      const shown = Math.round(v / 100) * 100;
      const txt = `${A.idNum(shown)}${P(t, b.unit - 0.05, 0.2) > 0 ? ' KM' : ''}`;
      A.numCells(c, txt, Math.min(x0 + w + 18, x0 + L - 250), b.y + 96, { size: 64, font: A.F.serif, color: b.deep, cell: 0.6, track: 4 });
    }
    A.heading(c, t, { kicker: 'LEMBAR 06  ·  LEBAR', lines: ['Lebar Indonesia', 'vs *Amerika Serikat*'] });
  });
}
