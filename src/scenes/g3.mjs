// Sheet 03 — "Di garis lintang enam puluh derajat, luasnya sudah empat kali
// lipat. Greenland terlihat sebesar Afrika, padahal Afrika empat belas kali
// lebih luas."
//
// One ground square, 1,500 km a side, slides north along 20 E: Mercator
// draws it bigger at every step and at 60 N it covers four of its equator
// selves (sec^2 60 = 4). Then Greenland and Africa, drawn about the same
// size (map areas 35.3 vs 33.4 million km2 on this projection); Greenland is
// lifted off at its true size and fourteen copies of it are laid on Africa
// (true areas 2.16 vs 29.99 million km2, Natural Earth 1:50m).
import * as A from './_atlas.mjs';

const { AT, MAPR, cue, P, e3, io, sm, clamp, lerp, D, EASE } = A;
const IDX = 2;

export const AFRICA = ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Central African Rep.', 'Chad', 'Congo', 'Dem. Rep. Congo', "Côte d'Ivoire", 'Djibouti', 'Egypt', 'Eq. Guinea', 'Eritrea', 'eSwatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Senegal', 'Sierra Leone', 'Somalia', 'Somaliland', 'South Africa', 'S. Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'W. Sahara', 'Zambia', 'Zimbabwe'];

const GC = [-42, 71.7];
// fourteen places for a true-size Greenland on Africa, row by row
const SPOTS = [
  [-8, 23], [2, 24], [12, 24], [22, 24], [31, 24],
  [-7, 9], [3, 6], [14, 2], [23, 3], [32, 3], [41, 4],
  [18, -22], [28, -21], [46, -20],
];
const FIRST = 8;

const V_A = () => A.view('merc', 15, 33, 560);
const V_B = () => A.view('merc', -5, 28, 330);
const V_C = () => A.view('merc', 16, 3, 420);

function prints() {
  const fills = [['Greenland', 'rgba(46,91,123,0.30)'], [AFRICA, 'rgba(200,150,58,0.30)']];
  return [
    A.printMap('g3:b', V_B(), { fills, margin: 200, gap: 6, graticule: { step: 15, a: 0.22 } }),
    A.printMap('g3:c', V_C(), { fills, margin: 260, gap: 7, graticule: { step: 15, a: 0.22 } }),
    A.printMap('g3:a', V_A(), { fills, margin: 380, gap: 7, graticule: { step: 15, a: 0.24 } }),
  ];
}

let GL = null;
const gl = () => GL || (GL = A.shapeRings('Greenland', { minPts: 24 }));
const TONES = ['#7FA3BC', '#6A90AC'];
const CP = new Map();
let CLONES = null;
/** a landed copy (the camera is still by then, so paths are kept) */
function clonePath(i, V) {
  let p = CP.get(i);
  if (!p) {
    p = A.movedPath(gl(), A.mover(GC, SPOTS[i]), V);
    CP.set(i, p);
  }
  return p;
}

const fmtK = (k) => `×${k.toFixed(1).replace('.', ',')}`;

export function draw(ctx, t, scene, o = {}) {
  const tGaris = cue(scene, 'garis');
  const t60 = cue(scene, 'enam');
  const tLuas = cue(scene, 'luasnya');
  const t4 = cue(scene, 'empat');
  const tGreen = cue(scene, 'greenland');
  const tAfr = cue(scene, 'afrika');
  const tPad = cue(scene, 'padahal');
  const t14 = cue(scene, 'empat', 1);
  const tBelas = cue(scene, 'belas');

  const b0 = tGreen - 0.35;
  const c0 = t14 - 0.55;
  const V = A.viewKeys(t, [[0, 15, 33, 560], [b0 - 0.6, 15.5, 33.5, 575], [b0 + 0.75, -5, 28, 330], [c0, -4, 27, 336], [c0 + 0.8, 16, 3, 420]], 'merc');
  const still = t >= c0 + 0.8;

  A.frame(ctx, o, IDX, (c) => {
    A.drawPrints(c, V, prints());
    c.save();
    c.beginPath();
    c.rect(MAPR.x, MAPR.y, MAPR.w, MAPR.h);
    c.clip();

    // ---------------- part A: the square that grows northward ----------------
    const aA = 1 - sm((t - (b0 - 0.25)) / 0.4);
    if (aA > 0.001) {
      c.save();
      c.globalAlpha = aA;
      const lineAt = (lat) => {
        const pts = [];
        for (let lon = -80; lon <= 110; lon += 2) pts.push(A.px(V, lon, lat));
        return pts;
      };
      A.drawOn(c, lineAt(0), P(t, 0.05, 0.6), { lw: 2.4, color: AT.ink, a: 0.8 });
      A.drawOn(c, lineAt(60), P(t, tGaris - 0.1, 0.9, EASE.inOutQuad), { lw: 3.2, color: AT.verm });
      const [, y60] = A.px(V, 0, 60);
      const [, y0] = A.px(V, 0, 0);
      A.tag(c, 'LINTANG 60°', MAPR.x + 22, y60 - 34, { p: P(t, t60 - 0.05, 0.45), size: 22, color: AT.vermDeep });
      A.tag(c, 'KHATULISTIWA 0°', MAPR.x + 22, y0 - 34, { p: P(t, 0.3, 0.45), size: 20 });

      const KM = 1500;
      const LON = 20;
      const mv = io(clamp((t - (tLuas - 0.1)) / (t4 - tLuas + 0.06)));
      const lat = lerp(0, 60, mv);
      const sq = (la) => A.groundSquare(V, LON, la, KM);
      const poly = (pts) => {
        c.beginPath();
        pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.closePath();
      };
      // ghosts left behind at the equator, 30 and 45 degrees
      for (const [la, kk] of [[0, 1], [30, 4 / 3], [45, 2]]) {
        if (lat < la + 0.5 && la > 0) continue;
        if (t < 0.4) continue;
        const pts = sq(la);
        c.save();
        c.setLineDash([8, 6]);
        c.strokeStyle = AT.ink;
        c.lineWidth = 2;
        c.globalAlpha *= la === 0 ? P(t, tLuas, 0.3) : 0.9;
        poly(pts);
        c.stroke();
        c.restore();
        if (la > 0) A.label(c, fmtK(kk), pts[1][0] + 12, (pts[1][1] + pts[2][1]) / 2 + 8, { size: 24, color: AT.ink2, track: 1, halo: true });
      }
      // the moving square
      const pts = sq(lat);
      const sa = P(t, 0.35, 0.5);
      c.save();
      c.globalAlpha *= sa;
      poly(pts);
      c.fillStyle = 'rgba(208,65,42,0.20)';
      c.fill();
      c.strokeStyle = AT.verm;
      c.lineWidth = 3.4;
      c.stroke();
      // at 60 N: four equator squares fit inside
      const gp = P(t, t4 - 0.05, 0.4);
      if (gp > 0) {
        const mx = (pts[0][0] + pts[1][0]) / 2;
        const my = (pts[0][1] + pts[3][1]) / 2;
        c.globalAlpha *= gp;
        c.lineWidth = 2;
        c.setLineDash([7, 5]);
        c.beginPath();
        c.moveTo(mx, pts[0][1]);
        c.lineTo(mx, pts[3][1]);
        c.moveTo(pts[0][0], my);
        c.lineTo(pts[1][0], my);
        c.stroke();
      }
      c.restore();
      const kNow = 1 / Math.cos(lat * D) ** 2;
      const rx = pts[1][0] + 16;
      const ry = (pts[1][1] + pts[2][1]) / 2;
      if (t > tLuas - 0.2 && t < t4 - 0.05) A.tag(c, `LUAS ${fmtK(kNow)}`, rx, ry, { p: P(t, tLuas - 0.2, 0.3), size: 22, color: AT.vermDeep });
      const bp = P(t, t4 - 0.05, 0.4, EASE.outBack);
      if (bp > 0) {
        c.save();
        c.translate(rx + 70, ry + 30);
        c.scale(0.6 + 0.4 * bp, 0.6 + 0.4 * bp);
        A.label(c, '×4', 0, 0, { size: 150, font: A.F.serif, color: AT.verm, track: -2, align: 'center', a: clamp(bp * 2), halo: true });
        c.restore();
        A.label(c, 'LUAS ASLI YANG SAMA', rx + 70, ry + 78, { size: 20, color: AT.ink, align: 'center', track: 3, p: P(t, t4 + 0.2, 0.4), halo: true });
      }
      if (sa > 0 && t < tLuas) A.tag(c, '1.500 × 1.500 KM', pts[1][0] + 16, (pts[1][1] + pts[2][1]) / 2, { p: P(t, 0.5, 0.4), size: 20 });
      c.restore();
    }

    // ------------- part B: Greenland and Africa, drawn alike --------------
    const bA = P(t, b0 + 0.3, 0.5);
    const [gx, gy] = A.px(V, -41, 73);
    const [fx, fy] = A.px(V, 21, 6);
    if (bA > 0) {
      const out = 1 - P(t, c0, 0.4);
      A.tag(c, 'GREENLAND', gx + 70, gy - 120, { p: P(t, tGreen - 0.05, 0.45) * out, ax: gx, ay: gy, color: AT.blue, size: 24 });
      A.tag(c, 'AFRIKA', fx - 80, fy - 210, { p: P(t, tAfr - 0.1, 0.45) * out, ax: fx, ay: fy - 40, color: '#7A5A1E', size: 24 });
      // map areas on this projection, side by side
      const ip = P(t, tAfr + 0.15, 0.5) * out;
      if (ip > 0) {
        const x = MAPR.x + 28;
        const y = MAPR.y + MAPR.h - 262;
        A.panel(c, x, y, 500, 234, { p: ip });
        A.label(c, 'UKURAN DI PETA', x + 30, y + 54, { size: 20, track: 4, a: e3(ip) });
        // map areas on Mercator (Natural Earth 1:50m): 35.3 vs 33.4 million km2
        const bars = [['GREENLAND', 35.3, AT.blue], ['AFRIKA', 33.4, '#B58430']];
        bars.forEach(([name, v, col], i) => {
          const by = y + 92 + i * 66;
          const w = (v / 36) * 420 * e3(clamp(ip * 1.4 - i * 0.2));
          c.save();
          c.fillStyle = col;
          c.globalAlpha = 0.8;
          c.fillRect(x + 30, by, w, 26);
          c.restore();
          A.label(c, name, x + 30, by + 52, { size: 18, track: 3, a: e3(ip) });
        });
      }
    }

    // ------------- part C: fourteen true-size Greenlands on Africa -------------
    if (t > tPad - 0.1) {
      const f0 = tPad - 0.05;
      const f1 = t14 - 0.12;
      const fp = io(clamp((t - f0) / (f1 - f0)));
      const T0 = SPOTS[FIRST];
      const T = [lerp(GC[0], T0[0], fp), lerp(GC[1], T0[1], fp)];
      const lift = Math.sin(clamp((t - f0) / (f1 - f0)) * Math.PI) * 0.9;
      // the others, laid down one by one on "empat belas"; once all are down
      // and the camera is still, the fourteen are one baked layer
      const allDown = t14 + 12 * 0.045 + 0.3;
      if (still && t > allDown) {
        if (!CLONES) {
          CLONES = A.makeLayer(A.MAPR, (cc) => {
            SPOTS.forEach((s, i) => A.cutout(cc, clonePath(i, V), { fill: TONES[i % 2] }));
          });
        }
        c.drawImage(CLONES.cv, CLONES.x, CLONES.y);
      } else {
        SPOTS.forEach((s, i) => {
          if (i === FIRST) return;
          const k = i < FIRST ? i : i - 1;
          const q = P(t, t14 + k * 0.045, 0.22, EASE.outBack);
          if (q <= 0) return;
          const path = still ? clonePath(i, V) : A.movedPath(gl(), A.mover(GC, s), V);
          const [cx, cy] = A.px(V, s[0], s[1]);
          c.save();
          c.translate(cx, cy);
          c.scale(1.25 - 0.25 * q, 1.25 - 0.25 * q);
          c.translate(-cx, -cy);
          A.cutout(c, path, { fill: TONES[i % 2], lift: (1 - clamp(q)) * 0.6, a: clamp(q * 3) });
          c.restore();
        });
        const path = fp >= 1 && still ? clonePath(FIRST, V) : A.movedPath(gl(), A.mover(GC, T), V);
        A.cutout(c, path, { fill: TONES[FIRST % 2], lift });
      }
      const np = P(t, tBelas + 0.05, 0.45, EASE.outBack);
      if (np > 0) {
        const [nx, ny] = A.px(V, 76, -6);
        c.save();
        c.translate(nx, ny);
        c.scale(0.6 + 0.4 * np, 0.6 + 0.4 * np);
        A.label(c, '14×', 0, 0, { size: 170, font: A.F.serif, color: AT.verm, align: 'center', track: -3, a: clamp(np * 2), halo: true });
        c.restore();
        A.label(c, 'AFRIKA LEBIH LUAS', nx, ny + 54, { size: 22, align: 'center', track: 3, p: P(t, tBelas + 0.3, 0.4), halo: true });
      }
    }
    c.restore();
    A.neatline(c);
    A.heading(c, t, { kicker: 'LEMBAR 03  ·  DISTORSI', lines: ['Makin ke kutub,', '*makin besar*'] });
  });
}
