// Sheet 08 — "Jadi, Indonesia tidak sekecil yang kamu kira. Kamu tinggal di
// pulau mana? Tulis di komentar."
//
// The archipelago close up, lettered like an atlas plate, with the lower 48
// United States laid over it at true size as a dashed outline (the hook,
// reversed). Then pins drop on the islands and a reply slip asks the
// question back.
import * as A from './_atlas.mjs';

const { AT, MAPR, cue, P, e3, io, sm, clamp, lerp, D, EASE } = A;
const IDX = 7;

const C_US = [-95.85, 36.96];
const C0 = [118, -2.5];
const R8 = { x: MAPR.x, y: MAPR.y, w: MAPR.w, h: 800 };
const V8 = () => A.view('merc', 118.2, -2.6, 1235, R8.x + R8.w / 2, R8.y + R8.h / 2);
const US48 = (bb) => bb[0] > -130 && bb[2] < -60 && bb[1] > 20 && bb[3] < 52;

const ISLANDS = [
  ['SUMATRA', 101.4, -0.6, -44],
  ['JAWA', 109.8, -7.3, 0],
  ['KALIMANTAN', 114.2, 0.6, 0],
  ['SULAWESI', 120.4, -2.0, 0],
  ['PAPUA', 138.4, -4.6, 0],
  ['NUSA TENGGARA', 121.5, -10.4, 0],
  ['MALUKU', 128.6, -3.3, 0],
];

function print() {
  return A.printMap('g8', V8(), {
    rect: R8,
    margin: 70,
    gap: 7,
    graticule: { step: 5, a: 0.2 },
    letter: (c, V) => {
      for (const [s, lon, lat, size] of [['SAMUDRA HINDIA', 104, -13.5, 26], ['SAMUDRA PASIFIK', 133, 6.5, 26], ['LAUT JAWA', 111, -5.0, 18], ['LAUT BANDA', 127.5, -5.9, 18]]) {
        const [x, y] = A.px(V, lon, lat);
        A.seaName(c, s, x, y, { size, a: 0.62 });
      }
    },
  });
}

const CACHE = {};

export function draw(ctx, t, scene, o = {}) {
  const tSek = cue(scene, 'sekecil');
  const tKamu = cue(scene, 'kamu', 1);
  const tMana = cue(scene, 'mana');
  const tTulis = cue(scene, 'tulis');
  const V = V8();

  A.frame(ctx, o, IDX, (c) => {
    A.drawPrints(c, V, [print()], R8);
    c.save();
    c.beginPath();
    c.rect(R8.x, R8.y, R8.w, R8.h);
    c.clip();
    CACHE.indo = CACHE.indo || A.countryPath('Indonesia', V);
    A.cutout(c, CACHE.indo, { lift: 0 });
    // island names, engraved on the paper
    for (const [s, lon, lat, rot] of ISLANDS) {
      const [x, y] = A.px(V, lon, lat);
      c.save();
      c.translate(x, y);
      c.rotate((rot * Math.PI) / 180);
      A.label(c, s, 0, 0, { size: 22, font: A.F.serif7, align: 'center', track: 5, color: AT.ink, a: P(t, 0.2, 0.6), halo: 'rgba(246,239,224,0.9)' });
      c.restore();
    }
    // the United States, at true size, laid over the islands
    const ua = P(t, tSek - 0.25, 0.6);
    if (ua > 0) {
      CACHE.us = CACHE.us || A.movedPath(A.shapeRings('United States of America', { keep: US48, minPts: 8 }), A.mover(C_US, C0), V);
      c.save();
      const s = 1.06 - 0.06 * e3(ua);
      const [cx, cy] = A.px(V, ...C0);
      c.translate(cx, cy);
      c.scale(s, s);
      c.translate(-cx, -cy);
      A.ghost(c, CACHE.us, { a: ua, lw: 3, dash: [12, 7], fill: 'rgba(46,91,123,0.16)', color: AT.blue });
      c.restore();
      A.tag(c, 'AMERIKA SERIKAT · UKURAN ASLI', R8.x + 30, R8.y + 52, { p: P(t, tSek, 0.45), size: 20, color: AT.blue });
    }
    // pins on the islands: which one is yours?
    if (t > tKamu - 0.2) {
      ISLANDS.forEach(([, lon, lat], i) => {
        const [x, y] = A.px(V, lon, lat + 1.3);
        A.pin(c, x, y, { p: P(t, tKamu - 0.1 + i * 0.09, 0.35), color: i % 2 ? AT.ochre : AT.verm });
      });
    }
    A.scaleKm(c, V, R8.x + R8.w - 330, R8.y + R8.h - 40, 1000, -2.6, { p: P(t, 0.4, 0.7) });
    c.restore();
    A.neatline(c, R8);

    // the reply slip
    const sy = R8.y + R8.h + 44;
    const sp = P(t, tKamu - 0.35, 0.5);
    if (sp > 0) {
      A.panel(c, R8.x + 20, sy, R8.w - 40, 370, { p: sp });
      c.save();
      c.translate(0, (1 - e3(sp)) * 30);
      A.label(c, 'BALASAN', R8.x + 70, sy + 64, { size: 22, track: 6, color: AT.verm, a: e3(sp) });
      A.typed(c, 'Kamu tinggal di pulau mana?', R8.x + 70, sy + 140, t, tKamu, { size: 42, cps: 26, font: A.F.serif5, caret: false, track: 0 });
      // the answer line with a waiting caret
      c.strokeStyle = AT.ink;
      c.lineWidth = 1.6;
      c.setLineDash([3, 6]);
      c.beginPath();
      c.moveTo(R8.x + 70, sy + 236);
      c.lineTo(R8.x + R8.w - 110, sy + 236);
      c.stroke();
      c.setLineDash([]);
      A.label(c, 'PULAU:', R8.x + 70, sy + 224, { size: 24, track: 4, color: AT.ink2, a: P(t, tMana, 0.3) });
      if (t > tMana && Math.floor(t * 2.4) % 2 === 0) {
        c.fillStyle = AT.verm;
        c.fillRect(R8.x + 196, sy + 194, 14, 34);
      }
      const kp = P(t, tTulis - 0.1, 0.45, EASE.outBack);
      if (kp > 0) {
        // a speech-bubble stamp: write it in the comments
        const bx = R8.x + R8.w - 330;
        const by = sy + 300;
        c.save();
        c.translate(bx, by);
        c.scale(0.7 + 0.3 * kp, 0.7 + 0.3 * kp);
        c.globalAlpha = clamp(kp * 2);
        c.fillStyle = AT.verm;
        c.beginPath();
        c.roundRect(-20, -34, 300, 60, 12);
        c.fill();
        c.beginPath();
        c.moveTo(20, 24);
        c.lineTo(10, 46);
        c.lineTo(44, 24);
        c.closePath();
        c.fill();
        c.restore();
        A.label(c, 'TULIS DI KOMENTAR', bx + 130, by + 6, { size: 22, track: 3, color: '#FFF4E6', align: 'center', a: clamp(kp * 2) });
      }
      c.restore();
    }
    A.heading(c, t, { kicker: 'LEMBAR 08  ·  INDONESIA', lines: ['Tidak *sekecil*', 'yang kamu kira'] });
  });
}
