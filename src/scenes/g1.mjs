// Sheet 01 — "Indonesia itu lebih lebar dari Amerika Serikat. Tapi di peta
// dunia yang kita lihat sejak SD, Indonesia terlihat kecil."
//
// Frame 0 is the claim itself: Indonesia cut from vermilion paper at its true
// size (a rotation on the sphere, not a rescale) lying across the United
// States and overhanging both coasts. On "Tapi" the camera pulls back to the
// classroom world map and the cut-out flies home, shrinking as it nears the
// equator, and drops into its own outline, small.
import * as A from './_atlas.mjs';

const { AT, MAPR, cue, P, e3, eo, io, clamp, lerp, EASE } = A;
const IDX = 0;
const C0 = [118, -2.5];
const T_US = [-95.85, 36.96];

const V_US = () => A.view('merc', -97, 36.5, 1000);
const V_MID = () => A.view('merc', -40, 28, 455);
const V_W = () => A.view('merc', 12, 16, 207);

const US48 = (bb) => bb[0] > -130 && bb[2] < -60 && bb[1] > 20 && bb[3] < 52;

function prints() {
  const fills = [['United States of America', 'rgba(46,91,123,0.20)']];
  const seas = (list) => (c, V) => {
    for (const [s, lon, lat, size, rot] of list) {
      const [x, y] = A.px(V, lon, lat);
      A.seaName(c, s, x, y, { size, rot: rot || 0 });
    }
  };
  return [
    A.printMap('m1:w', V_W(), {
      fills,
      margin: 90,
      gap: 6,
      graticule: { step: 15, a: 0.22 },
      letter: seas([['SAMUDRA PASIFIK', -150, 8, 24], ['SAMUDRA ATLANTIK', -38, 22, 22], ['SAMUDRA HINDIA', 78, -24, 22]]),
    }),
    A.printMap('m1:mid', V_MID(), {
      fills,
      margin: 300,
      gap: 7,
      graticule: { step: 10, a: 0.22 },
      letter: seas([['SAMUDRA PASIFIK', -138, 22, 30], ['SAMUDRA ATLANTIK', -42, 30, 30]]),
    }),
    A.printMap('m1:us', V_US(), {
      fills,
      margin: 260,
      gap: 8,
      graticule: { step: 5, a: 0.24 },
      letter: seas([['SAMUDRA PASIFIK', -128, 25, 34, -0.1], ['SAMUDRA ATLANTIK', -64, 33, 34, 0.05], ['TELUK MEKSIKO', -90, 25.2, 22]]),
    }),
  ];
}

let RINGS = null;
const rings = () => RINGS || (RINGS = A.shapeRings('Indonesia'));

export function draw(ctx, t, scene, o = {}) {
  const tTapi = cue(scene, 'tapi');
  const tSD = cue(scene, 'sd');
  const tIndo2 = cue(scene, 'indonesia', 1);
  const tKecil = cue(scene, 'kecil');
  const tLebar = cue(scene, 'lebih');
  const tAS = cue(scene, 'amerika');

  // camera: hold on the overlay with a slow push, pull back to the world
  const z0 = tTapi + 0.05;
  const z1 = z0 + 1.5;
  const V = A.viewKeys(t, [[0, -97, 36.5, 990], [z0, -97.5, 36.2, 1035], [z1, 12, 16, 207], [scene.dur + 0.6, 24, 12, 224]], 'merc');

  // the cut-out: dropped in at once, flown home on the pull-back
  const f0 = z0 + 0.1;
  const f1 = f0 + 1.55;
  const fp = io(clamp((t - f0) / (f1 - f0)));
  const T = [lerp(T_US[0], C0[0], fp), lerp(T_US[1], C0[1], fp) + Math.sin(fp * Math.PI) * 6];
  const lift = t < f0 ? 0.55 * (1 - e3(t / 0.5)) : t < f1 ? Math.sin(clamp((t - f0) / (f1 - f0)) * Math.PI) * 0.9 : 0;
  const landed = t >= f1;

  A.frame(ctx, o, IDX, (c) => {
    A.drawPrints(c, V, prints());
    c.save();
    c.beginPath();
    c.rect(MAPR.x, MAPR.y, MAPR.w, MAPR.h);
    c.clip();

    // tags on the overlay, gone with the pull-back
    const ta = 1 - e3((t - z0) / 0.4);
    if (ta > 0.01) {
      const [ax, ay] = A.px(V, -100, 44.5);
      A.tag(c, 'AMERIKA SERIKAT', ax - 40, MAPR.y + 120, { p: P(t, tAS - 0.1, 0.5) * ta, ax, ay, color: AT.blue, size: 24 });
    }

    // the cut-out (lands in its own printed outline)
    const mv = landed ? (lon, lat) => [lon, lat] : A.mover(C0, T);
    const path = A.movedPath(rings(), mv, V);
    const drop = t < 0.5 ? 1 + 0.035 * (1 - e3(t / 0.5)) : 1;
    if (drop !== 1) {
      const [cx, cy] = A.px(V, T[0], T[1]);
      c.save();
      c.translate(cx, cy);
      c.scale(drop, drop);
      c.translate(-cx, -cy);
      A.cutout(c, path, { lift });
      c.restore();
    } else A.cutout(c, path, { lift });

    if (ta > 0.01) {
      const [ax, ay] = A.px(V, -103, 31.5);
      A.tag(c, 'INDONESIA · UKURAN ASLI', MAPR.x + 360, MAPR.y + MAPR.h - 300, { p: P(t, 0.15, 0.55) * ta, ax, ay, color: AT.vermDeep, size: 24 });
      // felt-tip ticks where the cut-out runs past each coast
      const w = A.px(V, -126.4, 41.2);
      const e = A.px(V, -71.2, 28.6);
      const pw = P(t, tLebar + 0.1, 0.35) * ta;
      const pe = P(t, tLebar + 0.35, 0.35) * ta;
      A.marker(c, w[0] - 4, w[1] + 4, 46, 30, pw, { seed: 4, lw: 5, rot: -0.3 });
      A.marker(c, e[0] + 6, e[1] - 2, 50, 34, pe, { seed: 9, lw: 5, rot: 0.2 });
    }

    // the classroom map: a cartouche, then the circle round small Indonesia
    const cp = P(t, tSD - 0.2, 0.6);
    if (cp > 0) {
      const x = MAPR.x + 40;
      const y = MAPR.y + MAPR.h - 214;
      A.panel(c, x, y, 420, 150, { p: cp });
      A.label(c, 'PETA DUNIA', x + 210, y + 72, { size: 40, font: A.F.serif7, align: 'center', track: 8, a: e3(cp * 1.4) });
      A.label(c, 'untuk sekolah dasar', x + 210, y + 116, { size: 26, font: A.F.italic, align: 'center', track: 1, color: AT.ink2, a: e3(cp * 1.4) });
    }
    if (landed) {
      const [ix, iy] = A.px(V, 118, -2.2);
      const k = V.s / 207;
      A.marker(c, ix, iy, 128 * k, 70 * k, P(t, tIndo2 - 0.05, 0.6, EASE.inOutQuad), { seed: 12, lw: 6 });
      A.tag(c, 'KECIL?', ix + 40 * k, iy + 130 * k, { p: P(t, tKecil - 0.05, 0.45), ax: ix + 30 * k, ay: iy + 62 * k, color: AT.vermDeep, size: 26 });
    }
    c.restore();
    A.neatline(c);
    A.heading(c, t, { kicker: 'LEMBAR 01  ·  UKURAN ASLI', lines: ['Indonesia *lebih lebar*', 'dari Amerika Serikat'] });
  });
}
