// Sheet 04 — "Indonesia ada tepat di khatulistiwa, jadi ukurannya hampir
// tidak digelembungkan. Sementara Eropa tampil lebih dari dua kali luas
// aslinya."
//
// The same Mercator sheet holds both. A gauge in the left margin is the
// projection's area factor sec^2(lat), drawn against the map's own
// latitudes: Indonesia's band (6 N - 11 S) sits at x1.00-1.04 (its whole
// area x1.005), Europe at x2 to x4 and beyond (Europe without Russia: drawn
// x3.1 too big). Then Europe deflates in place to its true size at the
// equator's scale (Lambert equal-area about its own centre).
import * as A from './_atlas.mjs';

const { AT, MAPR, cue, P, e3, io, sm, clamp, lerp, D, EASE } = A;
const IDX = 3;

export const EUROPE = ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herz.', 'Bulgaria', 'Croatia', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican'];

const V0 = () => A.view('merc', 62.5, 41, 425);
const EC = [16, 53];

function print() {
  return A.printMap('g4', V0(), {
    margin: 60,
    gap: 7,
    graticule: { step: 15, a: 0.22 },
    letter: (c, V) => {
      for (const [s, lon, lat, size] of [['SAMUDRA HINDIA', 78, -14, 26], ['SAMUDRA ATLANTIK', -16, 22, 22]]) {
        const [x, y] = A.px(V, lon, lat);
        A.seaName(c, s, x, y, { size });
      }
    },
  });
}

const CACHE = {};
function eurRings() {
  return CACHE.eur || (CACHE.eur = A.shapeRings(EUROPE, { minPts: 6, keep: (bb) => bb[1] > 30 }));
}
function indoPath(V) {
  return CACHE.indo || (CACHE.indo = A.countryPath('Indonesia', V));
}

/** Europe between its Mercator outline (p=0) and its true size (p=1) */
function europePath(V, p) {
  if (p <= 0 && CACHE.eurM) return CACHE.eurM;
  if (p >= 1 && CACHE.eurT) return CACHE.eurT;
  const [Xc, Yc] = A.px(V, EC[0], EC[1]);
  const l0 = EC[0] * D;
  const f0 = EC[1] * D;
  const path = new A.Path2D();
  for (const ring of eurRings()) {
    ring.forEach(([lon, lat], i) => {
      const [mx, my] = A.px(V, lon, lat);
      let x = mx;
      let y = my;
      if (p > 0) {
        const l = lon * D - l0;
        const f = lat * D;
        const k = Math.sqrt(2 / (1 + Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l)));
        const ex = Xc + k * Math.cos(f) * Math.sin(l) * V.s;
        const ey = Yc - k * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l)) * V.s;
        x = lerp(mx, ex, p);
        y = lerp(my, ey, p);
      }
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    path.closePath();
  }
  if (p <= 0) CACHE.eurM = path;
  if (p >= 1) CACHE.eurT = path;
  return path;
}

export function draw(ctx, t, scene, o = {}) {
  const tKhat = cue(scene, 'khatulistiwa');
  const tUkur = cue(scene, 'ukurannya');
  const tHamp = cue(scene, 'hampir');
  const tEropa = cue(scene, 'eropa');
  const tLebih = cue(scene, 'lebih');
  const tDua = cue(scene, 'dua');
  const tAsli = cue(scene, 'aslinya');
  const V = V0();

  A.frame(ctx, o, IDX, (c) => {
    A.drawPrints(c, V, [print()]);
    c.save();
    c.beginPath();
    c.rect(MAPR.x, MAPR.y, MAPR.w, MAPR.h);
    c.clip();

    // Indonesia's band and the equator
    const [, yN] = A.px(V, 0, 6);
    const [, yS] = A.px(V, 0, -11);
    const [, yEq] = A.px(V, 0, 0);
    const bp = P(t, tKhat - 0.3, 0.6);
    c.save();
    c.fillStyle = `rgba(208,65,42,${0.085 * bp})`;
    c.fillRect(MAPR.x, yN, MAPR.w, yS - yN);
    c.restore();
    A.drawOn(c, [[MAPR.x, yEq], [MAPR.x + MAPR.w, yEq]], P(t, 0.1, 1.0, EASE.inOutQuad), { lw: 3, color: AT.verm });
    A.tag(c, 'KHATULISTIWA', MAPR.x + MAPR.w - 24, yEq - 36, { p: P(t, tKhat - 0.1, 0.4), align: 'right', size: 20, color: AT.vermDeep });
    A.label(c, '6°U', MAPR.x + MAPR.w - 14, yN - 8, { size: 18, align: 'right', color: AT.vermDeep, a: bp, track: 1 });
    A.label(c, '11°S', MAPR.x + MAPR.w - 14, yS + 24, { size: 18, align: 'right', color: AT.vermDeep, a: bp, track: 1 });

    A.cutout(c, indoPath(V), { lift: 0 });

    // the gauge: area factor against latitude, in the Atlantic margin
    const gx = MAPR.x + 28;
    const gp = P(t, tUkur - 0.4, 1.1, EASE.inOutQuad);
    if (gp > 0) {
      const top = 76 - (76 + 22) * (1 - gp);
      const pts = [];
      for (let la = -22; la <= top; la += 0.5) {
        const [, y] = A.px(V, 0, la);
        pts.push([gx + Math.min(118, 8 + 7.5 * (A.areaK(la) - 1)), y]);
      }
      if (pts.length > 1) {
        c.save();
        c.beginPath();
        c.moveTo(gx, pts[0][1]);
        pts.forEach(([x, y]) => c.lineTo(x, y));
        c.lineTo(gx, pts[pts.length - 1][1]);
        c.closePath();
        c.fillStyle = 'rgba(244,237,221,0.9)';
        c.fill();
        c.fillStyle = 'rgba(208,65,42,0.26)';
        c.fill();
        c.strokeStyle = AT.ink;
        c.lineWidth = 1.8;
        c.stroke();
        c.restore();
      }
      for (const [la, s] of [[0, '×1'], [45, '×2'], [60, '×4']]) {
        if (la > top) continue;
        const [, y] = A.px(V, 0, la);
        const x = gx + 8 + 7.5 * (A.areaK(la) - 1);
        c.save();
        c.strokeStyle = AT.ink;
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(gx, y);
        c.lineTo(x + 8, y);
        c.stroke();
        c.restore();
        A.label(c, s, x + 12, y + 9, { size: 27, color: AT.ink, track: 0, font: A.F.mono6, halo: true });
      }
      A.label(c, 'PEMBESARAN LUAS', gx, MAPR.y + 42, { size: 21, track: 3, a: gp, halo: true });
    }
    const [ix, iy] = A.px(V, 118, -2);
    A.tag(c, 'INDONESIA ×1,0', ix - 40, iy + 150, { p: P(t, tHamp - 0.15, 0.45), ax: ix - 10, ay: iy + 40, color: AT.vermDeep, size: 24 });

    // Europe: tinted as drawn, then deflated to its true size
    const ea = P(t, tEropa - 0.15, 0.4);
    if (ea > 0) {
      const big = europePath(V, 0);
      const dp = io(clamp((t - (tLebih - 0.05)) / 1.0));
      // the static states are baked once: tinted, and deflated
      if (dp <= 0 && ea >= 1) {
        CACHE.tint = CACHE.tint || A.makeLayer(MAPR, (cc) => {
          cc.fillStyle = 'rgba(200,150,58,0.42)';
          cc.fill(big, 'evenodd');
        });
        c.drawImage(CACHE.tint.cv, CACHE.tint.x, CACHE.tint.y);
      } else if (dp >= 1) {
        CACHE.done = CACHE.done || A.makeLayer(MAPR, (cc) => {
          cc.fillStyle = 'rgba(200,150,58,0.42)';
          cc.fill(big, 'evenodd');
          A.ghost(cc, big, { lw: 2, dash: [8, 6] });
          A.cutout(cc, europePath(V, 1), { fill: '#C8963A' });
        });
        c.drawImage(CACHE.done.cv, CACHE.done.x, CACHE.done.y);
      } else {
        c.save();
        c.globalAlpha = ea;
        c.fillStyle = 'rgba(200,150,58,0.42)';
        c.fill(big, 'evenodd');
        c.restore();
      }
      if (dp > 0) {
        if (dp < 1) {
          A.ghost(c, big, { a: dp, lw: 2, dash: [8, 6] });
          A.cutout(c, europePath(V, dp), { fill: '#C8963A', lift: Math.sin(dp * Math.PI) * 0.5 });
        }
        const [ex, ey] = A.px(V, EC[0], EC[1]);
        A.tag(c, 'UKURAN ASLI', ex + 150, ey + 230, { p: P(t, tLebih + 0.6, 0.4), ax: ex + 30, ay: ey + 40, color: '#7A5A1E', size: 22 });
        A.tag(c, 'DI PETA', ex - 250, ey - 190, { p: P(t, tLebih + 0.8, 0.4), ax: ex - 150, ay: ey - 120, size: 22 });
      }
      const np = P(t, tDua - 0.05, 0.4, EASE.outBack);
      if (np > 0) {
        const [ex, ey] = A.px(V, 56, 55);
        c.save();
        c.translate(ex, ey);
        c.scale(0.6 + 0.4 * np, 0.6 + 0.4 * np);
        A.label(c, '>2×', 0, 0, { size: 150, font: A.F.serif, color: AT.verm, align: 'center', track: -3, a: clamp(np * 2), halo: true });
        c.restore();
        A.label(c, 'LEBIH BESAR DARI ASLINYA', ex, ey + 48, { size: 20, align: 'center', track: 3, p: P(t, tAsli - 0.1, 0.4), halo: true });
      }
    }
    c.restore();
    A.neatline(c);
    A.heading(c, t, { kicker: 'LEMBAR 04  ·  KHATULISTIWA', lines: ['Di khatulistiwa,', 'ukuran *nyaris asli*'] });
  });
}
