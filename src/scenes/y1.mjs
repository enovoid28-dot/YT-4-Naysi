import { lerp } from '../engine/anim.mjs';
import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, wordT, dimension, chip, glass, ringBurst, mono } from './_bulan.mjs';
import { tag, punch, zoomed, labText, bokeh } from './_lab.mjs';
import { tick } from './_darah.mjs';
import { G, P, eo, io, routeAt, mapView, drawMap, navRot, navScreen, phone, toggle, digits, clockStrings } from './_gps.mjs';

// 01 — NYASAR
// Card 0: a phone navigating at night. On "Einstein" the relativity
// correction beside it flips OFF; from "GPS di HP-mu" the blue fix slides off
// the route, the banner turns red, and on "sepuluh kilometer" the map pulls
// out until the gap reads ten kilometres; "setiap hari" lands the tag.
// Card 1: the phone steps back; "bukan sinyal" ticks the full signal bars,
// "tapi waktu" lifts the clock out of the status bar into a microsecond readout.

const fRoute = (t) => 0.5 + 0.006 * t;
const PW = 620;
const PH = 1240;
const DIR = [0.45, -0.89];

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const tEin = wordT(scene, 0, 2);
  const tGps = wordT(scene, 0, 3);
  const tNyasar = wordT(scene, 0, 7);
  const tSep = wordT(scene, 0, 8);
  const tKm = wordT(scene, 0, 9);
  const tHari = wordT(scene, 0, 11);
  const t1 = wordT(scene, 1, 0);
  const tSinyal = wordT(scene, 1, 2);
  const tTapi = wordT(scene, 1, 3);
  const tWaktu = wordT(scene, 1, 4);

  const drift = io(P(t, tGps + 0.35, tHari + 0.25 - (tGps + 0.35)));
  const zq = io(P(t, tNyasar + 0.1, tKm + 0.5 - (tNyasar + 0.1)));
  const k = lerp(2.3, 0.78, zq);
  const me = [lerp(-20, -120, zq), lerp(300, 330, zq)];
  const recalc = P(t, tNyasar - 0.1, 0.35);
  const pC = io(P(t, t1 - 0.4, 0.8));

  // the same city far below, dark
  const r0 = routeAt(fRoute(t));
  drawMap(ctx, mapView(r0.x, r0.y, 0.42, 720 + cam.dx * 0.4, 1000 + cam.dy * 0.4, navRot() + 0.05), {});
  ctx.fillStyle = 'rgba(3,5,9,0.68)';
  ctx.fillRect(0, 0, W, H);
  const halo = ctx.createRadialGradient(720, 900, 120, 720, 900, 1000);
  const hr = recalc > 0.5 && pC < 0.5 ? G.redRgb : G.blueRgb;
  halo.addColorStop(0, `rgba(${hr},${0.16 + 0.06 * Math.sin(t * 2)})`);
  halo.addColorStop(1, `rgba(${hr},0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);
  bokeh(ctx, t, cam, { rgb: '120,170,255', n: 12, a: 0.45, seed: 26, y0: 200, y1: 1700 });
  bokeh(ctx, t, cam, { rgb: '255,190,120', n: 8, a: 0.3, seed: 62, y0: 200, y1: 1700 });

  // the phone
  const pk = punch(t, tGps - 0.05, 0.03, 0.5) * punch(t, tKm - 0.05, 0.025, 0.5);
  const ps = lerp(1, 0.86, pC);
  const py = lerp(900, 1010, pC);
  const px = lerp(812, 720, pC);
  let pos = null;
  zoomed(ctx, pk, px, 900, () => {
    plane(ctx, cam, 0.9, () => {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(ps, ps);
      ctx.translate(-px, -py);
      phone(ctx, px, py, PW, PH, {
        rot: -0.02 + 0.008 * Math.sin(t * 0.4),
        content: (c, x, y, w, h) => {
          pos = navScreen(c, x, y, w, h, {
            t, f: fRoute(t), k, me, drift, dir: DIR, recalc, pinP: P(t, tNyasar + 0.05, 0.5),
            hiBars: P(t, tSinyal - 0.1, 0.3),
          });
          // ten kilometres between where you are and where the phone thinks you are
          if (drift > 0.02) {
            dimension(c, pos.mx, pos.my, pos.fx, pos.fy, P(t, tSep - 0.15, 0.5), {
              label: `${Math.round(10 * drift)} KM`, color: 'rgba(255,140,120,0.9)', size: 26,
            });
            mono(c, 'POSISI ASLI', pos.mx + 34, pos.my + 44, { size: 20, color: '#FFB3A8', a: P(t, tNyasar + 0.3, 0.4) });
            mono(c, 'KATA GPS', pos.fx + 34, pos.fy - 26, { size: 20, color: G.blueHi, a: P(t, tSep, 0.4) });
          }
          if (pC > 0.01) {
            c.fillStyle = `rgba(2,3,6,${0.5 * pC})`;
            c.fillRect(x, y, w, h);
          }
          const fl = 1 - P(t, tEin - 0.02, 0.18);
          if (fl > 0 && fl < 1) {
            c.fillStyle = `rgba(255,255,255,${0.18 * fl})`;
            c.fillRect(x, y, w, h);
          }
        },
      });
      ctx.restore();
    });
  });

  // the switch nobody can see: relativity correction, flipped off on "Einstein"
  const aSw = 1 - eo(P(t, t1 - 0.4, 0.4));
  plane(ctx, cam, 1.15, () => {
    const on = 1 - P(t, tEin - 0.05, 0.22);
    const sx = 246;
    toggle(ctx, sx, 860, on, { s: 0.78, p: P(t, 0.0, 0.45), a: aSw });
    labText(ctx, 'EINSTEIN', sx, 668, { size: 58, font: F.fig8, color: G.bone, align: 'center', alpha: aSw * eo(P(t, 0.05, 0.45)) });
    mono(ctx, 'RELATIVITAS', sx, 712, { size: 20, color: HUD.amberHi, align: 'center', a: aSw * eo(P(t, 0.15, 0.45)), track: 5 });
    ringBurst(ctx, sx, 875, P(t, tEin - 0.02, 0.7), { color: G.redRgb, r: 190 });
    const lq = eo(P(t, tGps + 0.2, 0.5)) * aSw;
    if (lq > 0.001) {
      // the switch's effect, written on a leader to the phone
      ctx.save();
      ctx.globalAlpha *= lq;
      ctx.strokeStyle = 'rgba(255,120,104,0.75)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -t * 40;
      ctx.beginPath();
      ctx.moveTo(sx, 990);
      ctx.lineTo(sx, 1080);
      ctx.lineTo(486, 1080);
      ctx.stroke();
      ctx.restore();
      mono(ctx, 'GPS MELESET', sx, 1130, { size: 22, color: '#FF8A7A', align: 'center', a: lq, track: 4 });
    }
  });

  // card 0 tag: the error per day
  const aTag = 1 - eo(P(t, t1 - 0.45, 0.35));
  plane(ctx, cam, 1.05, () => {
    tag(ctx, 720, 1668, P(t, tSep - 0.1, 0.5), {
      big: '10', small: 'KM / HARI', color: '#FF8A7A', glowRgb: G.redRgb, a: aTag, size: 128,
      count: { value: 10 * drift, digits: 2, prev: 10 * io(P(t - 1 / 90, tGps + 0.35, tHari + 0.25 - (tGps + 0.35))) },
    });
  });

  // card 1: the signal is fine — the clock is the problem
  if (pC > 0.01) {
    const aC = eo(P(t, tSinyal - 0.15, 0.4));
    chip(ctx, 'SINYAL PENUH', 450, 1690, aC, { color: G.mint, size: 30 });
    signalIcon(ctx, 250, 1708, 44, aC);
    tick(ctx, 450 + 196, 1688, 40, P(t, tSinyal + 0.05, 0.35), { lw: 8 });
    chip(ctx, 'WAKTU', 1010, 1690, eo(P(t, tTapi - 0.1, 0.4)), { color: HUD.amber, size: 30 });
    const bang = eo(P(t, tWaktu - 0.05, 0.3));
    if (bang > 0) labText(ctx, '!', 1118, 1706, { size: 56, font: F.fig8, color: G.red, alpha: bang });

    // the readout: grows out of the status bar clock
    const q = eo(P(t, tWaktu - 0.25, 0.55));
    if (q > 0.001) {
      const sx = lerp(560, 720, q);
      const sy = lerp(330, 640, q);
      const sc = lerp(0.22, 1, q);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(sc, sc);
      ctx.translate(-720, -640);
      glass(ctx, 140, 470, 1160, 340, 1, { glowC: 'rgba(255,176,58,0.35)', tint: '255,190,110', edge: '255,220,170', fill: 0.06 });
      const s = clockStrings(9 * 3600 + 41 * 60 + 27 + Math.max(0, t - tWaktu + 0.25) * 1.0 + 0.381042);
      mono(ctx, 'WAKTU · PRESISI MIKRODETIK', 200, 530, { size: 22, color: HUD.amberHi, track: 5 });
      const w1 = digits(ctx, s.hms, 196, 718, { size: 150, color: G.bone });
      digits(ctx, `,${s.us}`, 196 + w1 + 10, 718, { size: 78, color: G.fast, glowC: 'rgba(255,176,58,0.6)' });
      mono(ctx, 'JAM · MENIT · DETIK', 200, 772, { size: 18, color: HUD.sub, track: 4 });
      mono(ctx, 'MIKRODETIK', 196 + w1 + 24, 772, { size: 18, color: HUD.amber, track: 4 });
      ctx.restore();
      ringBurst(ctx, 720, 640, P(t, tWaktu - 0.05, 0.8), { r: 420, color: G.fastRgb });
    }
  }
}

/** four rising bars, full */
function signalIcon(ctx, x, y, h, a) {
  if (a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = G.mint;
  for (let i = 0; i < 4; i++) {
    const bh = h * (0.34 + 0.22 * i);
    ctx.beginPath();
    ctx.roundRect(x - 2 * 15 + i * 15, y - bh, 10, bh, 2.5);
    ctx.fill();
  }
  ctx.restore();
}

export default { draw: drawScene };
