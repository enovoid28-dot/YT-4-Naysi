// Sheet 07 — "Empat September lalu, PBB mendukung pemakaian peta yang
// ukurannya sesuai luas asli. Seratus enam puluh empat negara setuju. Yang
// menolak cuma satu: Amerika Serikat."
//
// UN General Assembly resolution A/RES/80/307 "Correct the Map" (draft
// A/80/L.104), adopted 4 September 2026: 164 in favour, 1 against (United
// States), 6 abstentions; it encourages equal-area maps such as Equal Earth
// (Savric, Patterson & Jenny 2018). The world map morphs from Mercator to
// Equal Earth on the words; the hemicycle fills as the count is spoken.
import * as A from './_atlas.mjs';
import { AFRICA } from './g3.mjs';

const { AT, MAPR, cue, P, e3, io, sm, clamp, lerp, D, EASE } = A;
const IDX = 6;

const MR = { x: MAPR.x, y: MAPR.y, w: MAPR.w, h: 640 };
const S7 = 186;
const CX = MR.x + MR.w / 2;
const CY = MR.y + MR.h / 2 + 6;

function morph(k) {
  return (lon, lat) => {
    const a = A.PROJ.merc(lon, lat);
    const b = A.PROJ.eqe(lon, lat);
    return [CX + lerp(a[0], b[0], k) * S7, CY - lerp(a[1], b[1], k) * S7];
  };
}

const CACHE = {};
const tints = () =>
  CACHE.t ||
  (CACHE.t = [
    [A.shapeRings('Greenland', { minPts: 30 }), 'rgba(46,91,123,0.55)'],
    [A.shapeRings(AFRICA, { minPts: 30 }), 'rgba(200,150,58,0.5)'],
    [A.shapeRings('Indonesia', { minPts: 12 }), AT.verm],
  ]);

function worldMap(c, k) {
  const f = morph(k);
  const L = A.live();
  // the sheet of the projection: its outline, ocean inside
  const o = new A.Path2D();
  for (let la = -85; la <= 85; la += 2.5) {
    const [x, y] = f(-180, la);
    if (la === -85) o.moveTo(x, y);
    else o.lineTo(x, y);
  }
  for (let la = 85; la >= -85; la -= 2.5) {
    const [x, y] = f(180, la);
    o.lineTo(x, y);
  }
  o.closePath();
  c.fillStyle = AT.ocean;
  c.fill(o);
  c.save();
  c.clip(o);
  c.strokeStyle = AT.ink;
  c.globalAlpha = 0.24;
  c.lineWidth = 1;
  c.beginPath();
  for (let la = -60; la <= 60; la += 30) {
    for (let lo = -180; lo <= 180; lo += 5) {
      const [x, y] = f(lo, la);
      if (lo === -180) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
  }
  for (let lo = -150; lo <= 150; lo += 30) {
    for (let la = -85; la <= 85; la += 2.5) {
      const [x, y] = f(lo, la);
      if (la === -85) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
  }
  c.stroke();
  c.globalAlpha = 1;
  const land = A.livePath(L.rings, f);
  c.fillStyle = AT.land;
  c.fill(land, 'evenodd');
  A.hatchFill(c, land);
  for (const [rings, col] of tints()) {
    c.fillStyle = col;
    c.fill(A.livePath(rings, f), 'evenodd');
  }
  c.strokeStyle = AT.ink;
  c.lineWidth = 1.3;
  c.stroke(land);
  c.restore();
  c.strokeStyle = AT.ink;
  c.lineWidth = 2;
  c.stroke(o);
}

export function draw(ctx, t, scene, o = {}) {
  const tPBB = cue(scene, 'pbb');
  const tPeta = cue(scene, 'peta');
  const tLuas = cue(scene, 'luas');
  const t100 = cue(scene, 'seratus');
  const t60 = cue(scene, 'enam');
  const t4 = cue(scene, 'empat', 1);
  const tSetuju = cue(scene, 'setuju');
  const tTolak = cue(scene, 'menolak');
  const tSatu = cue(scene, 'satu');
  const tAS = cue(scene, 'amerika');
  const tSer = cue(scene, 'serikat');

  A.frame(ctx, o, IDX, (c) => {
    // ------------------------------- the map -------------------------------
    c.save();
    c.beginPath();
    c.rect(MR.x, MR.y, MR.w, MR.h);
    c.clip();
    c.fillStyle = '#E9E0CB';
    c.fillRect(MR.x, MR.y, MR.w, MR.h);
    const k = io(clamp((t - (tPeta - 0.15)) / 1.7));
    worldMap(c, k);
    c.restore();
    A.neatline(c, MR);
    A.typed(c, 'A/RES/80/307 · CORRECT THE MAP', MR.x + 22, MR.y + 44, t, 0.35, { size: 20, cps: 30, caret: t < 3 });
    const nm = k < 0.5 ? 'MERCATOR' : 'EQUAL EARTH';
    A.tag(c, nm, MR.x + MR.w - 22, MR.y + MR.h - 40, { p: P(t, tPBB, 0.4), align: 'right', size: 22, color: k < 0.5 ? AT.ink : AT.green });
    A.tag(c, 'LUAS SESUAI ASLI', MR.x + 22, MR.y + MR.h - 40, { p: P(t, tLuas - 0.1, 0.45), size: 22, color: AT.green });

    // ---------------------------- the assembly -----------------------------
    const { seats, rad } = A.hemicycleSeats(CX, 1742, 214, 500, 171, 8);
    // seats filled as the number is said: 100, 160, 164
    const nYes = Math.round(spoken(t, [[t100 - 0.02, 100, 0.55], [t60 - 0.02, 160, 0.4], [t4 - 0.02, 164, 0.18]]));
    const abst = P(t, tTolak - 0.1, 0.5);
    const no = P(t, tSatu - 0.08, 0.3, EASE.outBack);
    seats.forEach((s, i) => {
      let col = null;
      let q = 1;
      if (i < nYes) col = AT.green;
      else if (i < 170 && abst > 0) {
        col = AT.grey;
        q = abst;
      } else if (i === 170 && no > 0) {
        col = AT.verm;
        q = no;
      }
      c.save();
      if (!col) {
        c.strokeStyle = 'rgba(42,36,30,0.35)';
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(s.x, s.y, rad, 0, Math.PI * 2);
        c.stroke();
      } else {
        c.fillStyle = col;
        c.beginPath();
        c.arc(s.x, s.y, rad * (0.55 + 0.45 * clamp(q)), 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    });
    const red = seats[170];
    if (no > 0) {
      const pr = clamp((t - tSatu) / 0.8);
      c.save();
      c.strokeStyle = AT.verm;
      c.lineWidth = 3;
      c.globalAlpha = (1 - pr) * 0.9;
      c.beginPath();
      c.arc(red.x, red.y, rad + 6 + pr * 40, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
    // the count, inside the arch
    const cp = P(t, t100 - 0.1, 0.3);
    if (cp > 0) {
      A.numCells(c, String(nYes), CX, 1706, { size: 136, font: A.F.serif, color: AT.green, align: 'center', a: cp, cell: 0.6 });
      A.label(c, 'SETUJU', CX, 1748, { size: 22, align: 'center', track: 6, color: AT.green, p: P(t, tSetuju - 0.1, 0.4) });
    }
    A.tag(c, '1 MENOLAK', red.x - 10, red.y - 210, { p: P(t, tSatu - 0.05, 0.4), ax: red.x, ay: red.y - rad - 4, align: 'right', color: AT.vermDeep, size: 24 });
    A.tag(c, 'AMERIKA SERIKAT', red.x - 10, red.y - 150, { p: P(t, tAS - 0.05, 0.4), align: 'right', color: AT.vermDeep, size: 24 });
    const ab = seats[167];
    A.label(c, '6 ABSTAIN', ab.x - 24, ab.y - rad - 16, { size: 21, align: 'right', color: AT.ink, track: 2, p: abst, halo: true });
    A.stamp(c, ['DIADOPSI', '164 · 1 · 6'], 330, 1420, P(t, tSer + 0.25, 0.3), { rot: -0.14, size: 34 });
    A.heading(c, t, { kicker: 'LEMBAR 07  ·  SIDANG UMUM PBB', lines: ['Peta yang *adil*,', '4 September 2026'] });
  });
}

function spoken(t, steps) {
  let v = 0;
  for (const [at, val, d] of steps) {
    const p = P(t, at, d, EASE.inOutQuad);
    if (p <= 0) break;
    v = lerp(v, val, p);
  }
  return v;
}
