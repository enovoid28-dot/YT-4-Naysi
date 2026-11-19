// Sheet 02 — "Penyebabnya proyeksi Mercator, peta buatan tahun 1569 untuk
// para pelaut. Bumi yang bulat dibentangkan jadi persegi panjang. Makin jauh
// dari khatulistiwa, wilayah makin digelembungkan."
//
// A sea chart in the 1569 manner (rhumb-line network, compass rose) with a
// carrack holding one bearing: on Mercator's chart a constant course is a
// straight line, the reason sailors wanted it. The year is set digit by
// digit as it is spoken. Then the globe is peeled into twelve gores, the
// gores are pulled sideways into a rectangle, and the rectangle is stretched
// vertically more and more toward the poles: Mercator.
import * as A from './_atlas.mjs';

const { AT, MAPR, cue, cueEnd, P, e3, io, ioq, sm, clamp, lerp, D, EASE } = A;
const IDX = 1;

const LIS = [-9.14, 38.72];
const SJU = [-66.1, 18.4];
const R1 = [-50, 40];
const R2 = [-30, 12];
const V_A = () => A.view('merc', -42, 31, 640);

function chart() {
  return A.printMap('m2:chart', V_A(), {
    margin: 40,
    gap: 8,
    graticule: { step: 10, a: 0.14 },
    letter: (c, V) => {
      // rhumb lines from two roses, coloured the way the old charts were
      const roses = [A.px(V, ...R1), A.px(V, ...R2)];
      for (const [rx, ry] of roses) {
        for (let k = 0; k < 32; k++) {
          const a = (k / 32) * Math.PI * 2;
          c.strokeStyle = k % 4 === 0 ? 'rgba(42,36,30,0.42)' : k % 2 === 0 ? 'rgba(63,122,90,0.42)' : 'rgba(208,65,42,0.38)';
          c.lineWidth = k % 4 === 0 ? 1.4 : 1.1;
          c.beginPath();
          c.moveTo(rx, ry);
          c.lineTo(rx + Math.sin(a) * 2600, ry - Math.cos(a) * 2600);
          c.stroke();
        }
      }
      for (const [s, lon, lat, size] of [['OCEANUS ATLANTICUS', -40, 22, 30], ['MARE DEL NORT', -36, 48, 22]]) {
        const [x, y] = A.px(V, lon, lat);
        A.seaName(c, s, x, y, { size });
      }
    },
  });
}

/* ------------------------------ live world ------------------------------- */

const S_PC = 190;
const CX = MAPR.x + MAPR.w / 2;
const CY = MAPR.y + MAPR.h / 2 + 30;
const LAT_MAX = 80;

/** gore sheet (k=0) -> plate carree (k=1); then Mercator stretch m (0..1) */
function goreProj(lc, k, m) {
  return (lon, lat) => {
    const f = clamp(lat, -LAT_MAX, LAT_MAX);
    const kk = lerp(Math.cos(f * D), 1, k);
    const x = (lc + (lon - lc) * kk) * D;
    const y = lerp(f * D, A.mercY(f), m);
    return [CX + x * S_PC, CY - y * S_PC];
  };
}

function drawGores(c, k, m, a, grow, tint) {
  const gs = A.gores(12);
  c.save();
  c.globalAlpha *= a;
  c.lineJoin = 'round';
  const shapes = [];
  gs.forEach((g, i) => {
    const gr = grow(i);
    if (gr <= 0.001) return;
    const f = goreProj(g.lc, k, m);
    const [gx] = f(g.lc, 0);
    // the gore outline (ocean), its land, its graticule
    const o = new A.Path2D();
    for (let la = -LAT_MAX; la <= LAT_MAX; la += 4) {
      const [x, y] = f(g.l0, la);
      if (la === -LAT_MAX) o.moveTo(x, y);
      else o.lineTo(x, y);
    }
    for (let la = LAT_MAX; la >= -LAT_MAX; la -= 4) {
      const [x, y] = f(g.l1, la);
      o.lineTo(x, y);
    }
    o.closePath();
    c.save();
    c.translate(gx, CY);
    c.scale(1, gr);
    c.translate(-gx, -CY);
    c.fillStyle = AT.ocean;
    c.fill(o);
    const land = A.livePath(g.parts, f);
    c.fillStyle = AT.land;
    c.fill(land, 'evenodd');
    A.hatchFill(c, land);
    if (tint) {
      c.save();
      c.clip(o);
      tint(c, f);
      c.restore();
    }
    c.strokeStyle = AT.ink;
    c.lineWidth = 1.3;
    c.stroke(land);
    c.globalAlpha *= 0.32;
    c.lineWidth = 1;
    c.beginPath();
    for (let la = -75; la <= 75; la += 15) {
      const [x0, y0] = f(g.l0, la);
      const [x1, y1] = f(g.l1, la);
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
    }
    for (const lo of [g.l0 + 15]) {
      for (let la = -LAT_MAX; la <= LAT_MAX; la += 4) {
        const [x, y] = f(lo, la);
        if (la === -LAT_MAX) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
    }
    c.stroke();
    c.globalAlpha /= 0.32;
    c.strokeStyle = AT.ink;
    c.lineWidth = 1.6 - k * 0.8;
    c.stroke(o);
    c.restore();
    shapes.push(o);
  });
  c.restore();
}

function drawGlobe(c, t, r, a, lon0) {
  if (a <= 0.001) return;
  const L = A.live();
  const lat0 = 18;
  c.save();
  c.globalAlpha *= a;
  c.fillStyle = AT.ocean;
  c.beginPath();
  c.arc(CX, CY, r, 0, Math.PI * 2);
  c.fill();
  c.save();
  c.beginPath();
  c.arc(CX, CY, r, 0, Math.PI * 2);
  c.clip();
  // graticule in orthographic
  const sp = Math.sin(lat0 * D);
  const cp = Math.cos(lat0 * D);
  const pt = (lon, lat) => {
    const l = (lon - lon0) * D;
    const f = lat * D;
    const cf = Math.cos(f);
    return [CX + cf * Math.sin(l) * r, CY - (cp * Math.sin(f) - sp * cf * Math.cos(l)) * r, sp * Math.sin(f) + cp * cf * Math.cos(l)];
  };
  c.strokeStyle = AT.ink;
  c.globalAlpha *= 0.3;
  c.lineWidth = 1;
  c.beginPath();
  for (let lat = -75; lat <= 75; lat += 15) {
    let pen = false;
    for (let lon = -180; lon <= 180; lon += 3) {
      const [x, y, z] = pt(lon, lat);
      if (z > 0) {
        if (pen) c.lineTo(x, y);
        else c.moveTo(x, y);
        pen = true;
      } else pen = false;
    }
  }
  for (let lon = -180; lon < 180; lon += 15) {
    let pen = false;
    for (let lat = -90; lat <= 90; lat += 3) {
      const [x, y, z] = pt(lon, lat);
      if (z > 0) {
        if (pen) c.lineTo(x, y);
        else c.moveTo(x, y);
        pen = true;
      } else pen = false;
    }
  }
  c.stroke();
  c.globalAlpha /= 0.3;
  const land = A.globePath(L.rings, CX, CY, r, lon0, lat0);
  c.fillStyle = AT.land;
  c.fill(land, 'evenodd');
  A.hatchFill(c, land);
  c.strokeStyle = AT.ink;
  c.lineWidth = 1.4;
  c.stroke(land);
  // engraved shading: rings of hatch thickening toward the limb
  for (let i = 0; i < 9; i++) {
    const rr = r * (0.8 + i * 0.024);
    c.strokeStyle = `rgba(42,36,30,${0.04 + i * 0.022})`;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(CX + r * 0.04, CY + r * 0.05, rr, 0, Math.PI * 2);
    c.stroke();
  }
  c.restore();
  c.strokeStyle = AT.ink;
  c.lineWidth = 2.4;
  c.beginPath();
  c.arc(CX, CY, r, 0, Math.PI * 2);
  c.stroke();
  c.restore();
}

/* --------------------------------- draw ---------------------------------- */

let GL = null;
const greenland = () => GL || (GL = A.shapeRings('Greenland', { minPts: 20 }));

export function draw(ctx, t, scene, o = {}) {
  const tPeta = cue(scene, 'peta');
  const tTahun = cue(scene, 'tahun');
  const tD = [cue(scene, 'seribu'), cue(scene, 'lima'), cue(scene, 'enam'), cue(scene, 'sembilan')];
  const tPelaut = cue(scene, 'untuk');
  const tBumi = cue(scene, 'bumi');
  const tDib = cue(scene, 'dibentangkan');
  const tJadi = cue(scene, 'jadi');
  const tMakin = cue(scene, 'makin');
  const tWil = cue(scene, 'wilayah');
  const tDig = cue(scene, 'digelembungkan');

  A.frame(ctx, o, IDX, (c) => {
    // ------------------------------ the chart ------------------------------
    const chartA = 1 - sm((t - (tBumi - 0.25)) / 0.45);
    if (chartA > 0.001) {
      const V = A.viewKeys(t, [[0, -42, 31, 640], [tBumi, -40, 30.5, 668]], 'merc');
      c.save();
      c.globalAlpha = chartA;
      A.drawPrints(c, V, [chart()]);
      c.beginPath();
      c.rect(MAPR.x, MAPR.y, MAPR.w, MAPR.h);
      c.clip();
      const [rx, ry] = A.px(V, ...R1);
      A.rose(c, rx, ry, 92, { p: P(t, 0, 0.8) });
      const [r2x, r2y] = A.px(V, ...R2);
      A.rose(c, r2x, r2y, 60, { p: P(t, 0.1, 0.8), a: 0.85 });
      // the course: one bearing, one straight line
      const a0 = A.px(V, ...LIS);
      const a1 = A.px(V, ...SJU);
      const sp = io(clamp((t - (tPeta - 0.4)) / (tBumi - tPeta)));
      const sx = lerp(a0[0], a1[0], sp);
      const sy = lerp(a0[1], a1[1], sp);
      c.save();
      c.strokeStyle = AT.ink;
      c.lineWidth = 2;
      c.setLineDash([3, 9]);
      c.globalAlpha *= 0.55 * P(t, tPeta - 0.6, 0.5);
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(a1[0], a1[1]);
      c.stroke();
      c.restore();
      A.drawOn(c, [a0, [sx, sy]], sp > 0 ? 1 : 0, { lw: 3.2, color: AT.verm, dash: [14, 8] });
      // bearing arc at the port
      const brg = (Math.atan2(a1[0] - a0[0], -(a1[1] - a0[1])) / D + 360) % 360;
      const pa = P(t, tPeta, 0.7);
      if (pa > 0) {
        c.save();
        c.strokeStyle = AT.ink;
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(a0[0], a0[1]);
        c.lineTo(a0[0], a0[1] - 120 * pa);
        c.stroke();
        c.beginPath();
        c.arc(a0[0], a0[1], 74, -Math.PI / 2, -Math.PI / 2 + brg * D * pa, false);
        c.stroke();
        c.restore();
        A.tag(c, `HALUAN TETAP ${Math.round(brg)}°`, a0[0] - 20, a0[1] + 92, { p: P(t, tPeta + 0.3, 0.5), align: 'right', size: 22, ax: a0[0] - 8, ay: a0[1] + 6 });
      }
      A.pin(c, a0[0], a0[1], { p: P(t, tPeta - 0.5, 0.5), color: AT.verm });
      // the carrack
      A.ship(c, sx, sy - 6 + Math.sin(t * 2.4) * 2, 0.62, { rot: Math.sin(t * 1.9) * 0.035, flip: true, a: P(t, tPeta - 0.6, 0.4) });

      // the cartouche: the year set as it is spoken
      const cx = MAPR.x + MAPR.w - 476;
      const cy = MAPR.y + 36;
      const cp = P(t, tTahun - 0.35, 0.5);
      if (cp > 0) {
        A.panel(c, cx, cy, 440, 330, { p: cp });
        c.save();
        c.translate(0, (1 - e3(cp)) * 30);
        A.label(c, 'GERARDUS MERCATOR', cx + 220, cy + 62, { size: 24, align: 'center', track: 5, a: e3(cp * 1.5) });
        const digits = ['1', '5', '6', '9'];
        const cell = 92;
        const x0 = cx + 220 - cell * 2;
        digits.forEach((d, i) => {
          const q = P(t, tD[i] - 0.04, 0.3, EASE.outBack);
          const x = x0 + cell * i + cell / 2;
          if (q <= 0) {
            A.label(c, '·', x, cy + 196, { size: 120, font: A.F.serif, align: 'center', track: 0, color: AT.ink3, a: e3(cp) });
            return;
          }
          c.save();
          c.translate(x, cy + 196);
          c.scale(0.7 + 0.3 * q, 0.7 + 0.3 * q);
          A.label(c, d, 0, 0, { size: 150, font: A.F.serif, align: 'center', track: 0, color: i === 3 ? AT.verm : AT.ink, a: clamp(q * 2) });
          c.restore();
        });
        A.label(c, 'AD USUM NAVIGANTIUM', cx + 220, cy + 256, { size: 22, align: 'center', track: 4, color: AT.vermDeep, p: P(t, tPelaut - 0.1, 0.5) });
        A.label(c, 'untuk para pelaut', cx + 220, cy + 296, { size: 28, font: A.F.italic, align: 'center', track: 1, color: AT.ink2, p: P(t, tPelaut + 0.25, 0.5) });
        c.restore();
      }
      c.restore();
    }

    // ------------------------ globe, gores, stretch ------------------------
    if (t > tBumi - 0.3) {
      c.save();
      c.beginPath();
      c.rect(MAPR.x, MAPR.y, MAPR.w, MAPR.h);
      c.clip();
      c.fillStyle = 'rgba(239,231,212,1)';
      c.globalAlpha = 1 - chartA;
      c.fillRect(MAPR.x, MAPR.y, MAPR.w, MAPR.h);
      c.globalAlpha = 1;
      const gA = P(t, tBumi - 0.2, 0.45) * (1 - sm((t - (tDib + 0.05)) / 0.4));
      const spin = 10 + (t - tBumi) * 22;
      const gr = 420 * (0.85 + 0.15 * e3((t - tBumi + 0.2) / 0.6)) * (1 - 0.25 * sm((t - tDib) / 0.45));
      drawGlobe(c, t, gr, gA, spin);
      if (t > tDib - 0.05) {
        const k = io(clamp((t - (tJadi - 0.05)) / 0.85));
        const m = io(clamp((t - (tMakin + 0.15)) / 2.6));
        const grow = (i) => EASE.outCubic(clamp((t - tDib - Math.abs(i - 5.5) * 0.045) / 0.5));
        const gl = greenland();
        const tintA = P(t, tWil - 0.2, 0.5);
        drawGores(c, k, m, P(t, tDib - 0.05, 0.3), grow, tintA > 0 ? (cc, f) => {
          const p = A.livePath(gl, f);
          cc.fillStyle = `rgba(46,91,123,${0.42 * tintA})`;
          cc.fill(p, 'evenodd');
        } : null);
        // the rectangle closes: a frame and its label
        const rp = P(t, tJadi + 0.6, 0.5);
        if (rp > 0) {
          const hh = lerp(LAT_MAX * D, A.mercY(LAT_MAX), m) * S_PC;
          const ww = Math.PI * S_PC;
          c.save();
          c.strokeStyle = AT.ink;
          c.lineWidth = 2.4;
          c.globalAlpha = rp;
          c.strokeRect(CX - ww, CY - hh, ww * 2, hh * 2);
          c.restore();
          if (m < 0.02) A.tag(c, 'PERSEGI PANJANG', CX, CY - hh - 46, { p: rp * (1 - P(t, tMakin, 0.3)), align: 'center', size: 22 });
        }
        // the stretch: arrows grow toward the poles, equator stays put
        if (m > 0.001) {
          const ys = [15, 30, 45, 60, 75];
          for (const la of ys) {
            const y1 = CY - lerp(la * D, A.mercY(la), m) * S_PC;
            const y0 = CY - la * D * S_PC;
            const a = clamp(m * 3) * 0.9;
            for (const side of [-1, 1]) {
              const x = CX + side * (Math.PI * S_PC + 34);
              c.save();
              c.globalAlpha = a;
              c.strokeStyle = AT.verm;
              c.fillStyle = AT.verm;
              c.lineWidth = 3;
              c.beginPath();
              c.moveTo(x, y0);
              c.lineTo(x, y1);
              c.moveTo(x, CY + (y0 - CY) * -1);
              c.lineTo(x, CY - (y1 - CY));
              c.stroke();
              for (const yy of [y1, CY - (y1 - CY)]) {
                const dir = yy < CY ? -1 : 1;
                c.beginPath();
                c.moveTo(x, yy + dir * 2);
                c.lineTo(x - 7, yy - dir * 12);
                c.lineTo(x + 7, yy - dir * 12);
                c.closePath();
                c.fill();
              }
              c.restore();
            }
          }
          const eqA = clamp(m * 3);
          c.save();
          c.strokeStyle = AT.verm;
          c.lineWidth = 3;
          c.globalAlpha = eqA;
          c.beginPath();
          c.moveTo(CX - Math.PI * S_PC - 50, CY);
          c.lineTo(CX + Math.PI * S_PC + 50, CY);
          c.stroke();
          c.restore();
          A.tag(c, 'KHATULISTIWA', MAPR.x + 24, CY - 34, { p: P(t, cue(scene, 'khatulistiwa') - 0.1, 0.4), size: 20, color: AT.vermDeep });
          // Greenland swells
          if (tintA > 0) {
            const f = goreProj(-15, 1, m);
            const [gx, gy] = f(-41, 74);
            A.tag(c, 'GREENLAND', gx + 120, gy - 40 - m * 60, { p: P(t, tDig - 0.1, 0.45), ax: gx + 20, ay: gy, color: AT.blue, size: 22 });
          }
        }
      }
      c.restore();
    }
    A.neatline(c);
    A.heading(c, t, { kicker: 'LEMBAR 02  ·  PENYEBABNYA', lines: ['Proyeksi *Mercator*'], sub: 'Nova et Aucta Orbis Terrae Descriptio', subAt: 0.3 });
  });
}
