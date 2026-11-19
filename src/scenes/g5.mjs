// Sheet 05 — "Sekarang pindahkan Indonesia ke Eropa dengan ukuran aslinya.
// Dari Sabang sampai Merauke, ia membentang dari Irlandia sampai melewati
// Laut Kaspia."
//
// The vermilion cut-out is lifted off the equator and carried north by a
// rotation of the sphere (true size). On the Mercator sheet it swells as it
// goes, exactly as Europe does. Sabang set on the west coast of Ireland puts
// Merauke at 59.3 E, 40.1 N, beyond the Caspian Sea (Natural Earth 1:50m).
import * as A from './_atlas.mjs';

const { AT, MAPR, cue, P, e3, io, sm, clamp, lerp, D, EASE } = A;
const IDX = 4;

const C0 = [118, -2.5];
const T_EU = [29.75, 50.75];
const SABANG = [95.32, 5.89];
const MERAUKE = [140.4, -8.49];

const V_W = () => A.view('merc', 64, 26, 430);
const V_E = () => A.view('merc', 25.5, 46.5, 860);

function prints() {
  const seas = (list) => (c, V) => {
    for (const [s, lon, lat, size] of list) {
      const [x, y] = A.px(V, lon, lat);
      A.seaName(c, s, x, y, { size });
    }
  };
  return [
    A.printMap('g5:w', V_W(), {
      margin: 160,
      gap: 7,
      graticule: { step: 15, a: 0.22 },
      letter: seas([['SAMUDRA HINDIA', 76, -12, 26], ['SAMUDRA ATLANTIK', -16, 30, 22]]),
    }),
    A.printMap('g5:e', V_E(), {
      margin: 240,
      gap: 8,
      graticule: { step: 5, a: 0.2 },
      letter: seas([['SAMUDRA ATLANTIK', -14, 44, 28], ['LAUT TENGAH', 17, 35, 24], ['LAUT HITAM', 34.5, 43.3, 20]]),
    }),
  ];
}

let RINGS = null;
const rings = () => RINGS || (RINGS = A.shapeRings('Indonesia'));

export function draw(ctx, t, scene, o = {}) {
  const tPin = cue(scene, 'pindahkan');
  const tAsli = cue(scene, 'aslinya');
  const tSab = cue(scene, 'sabang');
  const tMer = cue(scene, 'merauke');
  const tBent = cue(scene, 'membentang');
  const tIrl = cue(scene, 'irlandia');
  const tKas = cue(scene, 'kaspia');
  const tLew = cue(scene, 'melewati');

  const f0 = tPin + 0.05;
  const f1 = tAsli + 0.1;
  const V = A.viewKeys(t, [[0, 64, 26, 430], [f0 + 0.6, 60, 30, 440], [f1 + 0.25, 25.5, 46.5, 860], [scene.dur + 0.5, 26.5, 46.3, 900]], 'merc');

  const u = clamp((t - f0) / (f1 - f0));
  const fp = io(u);
  const T = [lerp(C0[0], T_EU[0], fp), lerp(C0[1], T_EU[1], fp)];
  const lift = Math.sin(u * Math.PI) * 0.95;
  const mv = A.mover(C0, T);
  const mvEnd = A.mover(C0, T_EU);

  A.frame(ctx, o, IDX, (c) => {
    A.drawPrints(c, V, prints());
    c.save();
    c.beginPath();
    c.rect(MAPR.x, MAPR.y, MAPR.w, MAPR.h);
    c.clip();

    // where it came from: its own outline, left empty on the equator
    if (t > f0) {
      const home = A.movedPath(rings(), (lo, la) => [lo, la], V);
      A.ghost(c, home, { a: P(t, f0, 0.4) * 0.8, lw: 1.6, dash: [6, 5], fill: 'rgba(208,65,42,0.10)' });
    }
    const path = A.movedPath(rings(), mv, V);
    A.cutout(c, path, { lift });

    const [cx, cy] = A.px(V, T[0], T[1]);
    A.tag(c, 'UKURAN ASLI', cx + 60, cy - 150 * (V.s / 430) ** 0.5, { p: P(t, f0 + 0.2, 0.4) * (1 - P(t, tSab - 0.4, 0.3)), ax: cx + 10, ay: cy - 20, color: AT.vermDeep, size: 22 });

    // Sabang and Merauke, set down where the rotation puts them
    const s = A.px(V, ...mvEnd(...SABANG));
    const m = A.px(V, ...mvEnd(...MERAUKE));
    if (t > tSab - 0.4) {
      A.drawOn(c, A.arcPts(V, mvEnd(...SABANG), mvEnd(...MERAUKE), 80), P(t, tBent - 0.05, tKas - tBent + 0.2, EASE.inOutQuad), { lw: 3.2, color: AT.ink, dash: [12, 7] });
      A.pin(c, s[0], s[1], { p: P(t, tSab - 0.12, 0.4), color: AT.ink });
      A.pin(c, m[0], m[1], { p: P(t, tMer - 0.12, 0.4), color: AT.ink });
      A.tag(c, 'SABANG', s[0] + 14, s[1] - 92, { p: P(t, tSab, 0.4), size: 24 });
      A.tag(c, 'MERAUKE', m[0] - 10, m[1] + 64, { p: P(t, tMer, 0.4), size: 24, align: 'right' });
    }
    // Ireland and the Caspian Sea
    const ir = A.px(V, -8.1, 53.3);
    A.tag(c, 'IRLANDIA', ir[0] - 30, ir[1] + 150, { p: P(t, tIrl - 0.05, 0.4), ax: ir[0], ay: ir[1] + 10, color: AT.blue, size: 24 });
    const ks = A.px(V, 50.6, 41.8);
    A.tag(c, 'LAUT KASPIA', ks[0] - 120, ks[1] + 200, { p: P(t, tKas - 0.1, 0.4), ax: ks[0], ay: ks[1] + 20, color: AT.blue, size: 24 });
    if (t > tLew - 0.1) {
      const k = A.px(V, 51.5, 41.5);
      A.marker(c, k[0] + 10, k[1], 70, 120, P(t, tLew - 0.05, 0.6, EASE.inOutQuad), { color: AT.blue, lw: 5, seed: 21, rot: 0.15, a: 0.8 });
    }
    c.restore();
    A.neatline(c);
    A.heading(c, t, { kicker: 'LEMBAR 05  ·  UKURAN ASLI', lines: ['Indonesia', 'di atas *Eropa*'] });
  });
}
