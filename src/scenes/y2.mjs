import { clamp, lerp } from '../engine/anim.mjs';
import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, deepSky, earthBall, wordT, callout, glass, mono, chip, ringBurst } from './_bulan.mjs';
import { gview, gproj, gPin } from './_krakatau.mjs';
import { punch, zoomed } from './_lab.mjs';
import { G, P, eo, io, satellite, pulses, packet, digits, clockStrings, layer } from './_gps.mjs';

// 02 — JAM ATOM
// Card 0: close on a GPS satellite above the night limb of the Earth. "jam
// atom" opens a callout and a readout of the clock it carries; from
// "memancarkan" its time leaves the helix array as wavefronts, each stamped.
// Card 1: pull out to the planet with Java at the centre. Four satellites
// hang in front of it; their signals run down to your phone, each one tagged
// with how long the trip took, and the distance rings close on the pin.

const PURWOKERTO = [-7.42, 109.23];
const SATS = [
  { x: 410, y: 610, s: 0.3, rot: 0.35, ms: 67 },
  { x: 1070, y: 560, s: 0.28, rot: -0.3, ms: 72 },
  { x: 250, y: 1270, s: 0.25, rot: 0.75, ms: 76 },
  { x: 1180, y: 1330, s: 0.26, rot: -0.7, ms: 81 },
];

function closeUp(ctx, t, scene, cam, a) {
  const tJam = wordT(scene, 0, 3);
  const tPancar = wordT(scene, 0, 7);
  const tWaktu = wordT(scene, 0, 8);
  deepSky(ctx, t, cam, { seed: 26, band: 0.6, bandY: 700 });
  plane(ctx, cam, 0.35, () => {
    earthBall(ctx, 720, 2420, 900, { lon: 104 + t * 0.35, tilt: -12, sun: { x: -0.75, y: 0.45, z: 0.3 }, lights: 0.9 });
  });
  const sx = 720 + Math.sin(t * 0.35) * 18;
  const sy = 760 + Math.sin(t * 0.5) * 12;
  const k = punch(t, tJam - 0.05, 0.05, 0.5);
  zoomed(ctx, k, sx, sy, () => {
    plane(ctx, cam, 1.0, () => {
      satellite(ctx, sx, sy, 1.12, { t, rot: 0.05 * Math.sin(t * 0.3) });
      // the time leaves the array as wavefronts
      pulses(ctx, sx, sy + 150, sx, 1430, t, { born: tPancar - 0.25, period: 1.1, n: 3, spread: 0.42, lw: 7, rgb: '120,180,255', r0: 30 });
      pulses(ctx, sx, sy + 150, sx, 1430, t, { born: tPancar - 0.25, period: 1.1, n: 3, spread: 0.42, lw: 2.5, rgb: '230,244,255', r0: 30 });
      callout(ctx, sx + 30, sy - 20, sx + 250, sy - 330, 260, P(t, tJam - 0.1, 0.7), {
        label: 'DI DALAM SATELIT', value: 'JAM ATOM', side: 'right', vsize: 46, accent: HUD.amber,
      });
    });
  });
  // what the clock says, stamped on every signal
  const q = eo(P(t, tJam + 0.1, 0.5));
  if (q > 0.001) {
    const base = 9 * 3600 + 41 * 60 + 27;
    const s = clockStrings(base + Math.max(0, t - tJam) + 0.000017);
    plane(ctx, cam, 1.1, () => {
      ctx.save();
      ctx.globalAlpha *= q;
      glass(ctx, 200, 1440, 1040, 230, 1, { tint: '120,170,235', glowC: 'rgba(62,139,255,0.3)' });
      mono(ctx, 'WAKTU YANG DIPANCARKAN', 248, 1496, { size: 22, color: G.blueHi, track: 5 });
      const w1 = digits(ctx, s.hms, 244, 1622, { size: 104, color: G.bone });
      digits(ctx, `,${s.us}`, 244 + w1 + 8, 1622, { size: 60, color: G.blueHi, glowC: 'rgba(62,139,255,0.6)' });
      ctx.restore();
    });
  }
  // stamps riding down with the wavefronts
  for (let i = 0; i < 3; i++) {
    const age = t - (tWaktu - 0.15) - i * 0.55;
    if (age < 0 || age > 1.5) continue;
    const yy = lerp(sy + 230, 1380, age / 1.5);
    chip(ctx, `09:41:${String(27 + i).padStart(2, '0')},000 000`, sx, yy, clamp(age * 4) * (1 - clamp((age - 1.2) / 0.3)), {
      color: G.blueHi, size: 22,
    });
  }
}

function wide(ctx, t, scene, cam, a) {
  const t1 = wordT(scene, 1, 0);
  const tHit = wordT(scene, 1, 1);
  const tJarak = wordT(scene, 1, 2);
  const tLama = wordT(scene, 1, 4);
  const tSinyal = wordT(scene, 1, 6);
  deepSky(ctx, t, cam, { seed: 27, band: 0.55, bandY: 820 });
  const gv = gview(720, 980, 360, 109.6 + Math.sin(t * 0.2) * 1.2, -9);
  let pin = null;
  plane(ctx, cam, 0.5, () => {
    earthBall(ctx, gv.cx, gv.cy, gv.r, { lon: gv.lon, tilt: gv.tilt, sun: { x: -0.5, y: 0.4, z: 0.77 }, lights: 0.4 });
    pin = gproj(gv, PURWOKERTO[0], PURWOKERTO[1]);
  });
  const px = pin.x;
  const py = pin.y;
  // signals: one packet per satellite, then the trip time on the line
  plane(ctx, cam, 0.9, () => {
    SATS.forEach((S, i) => {
      const go = tHit - 0.2 + i * 0.22;
      const lp = P(t, go, 0.75);
      ctx.save();
      ctx.strokeStyle = `rgba(${G.blueRgb},${0.45 * eo(lp)})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 12]);
      ctx.lineDashOffset = -t * 60;
      ctx.beginPath();
      ctx.moveTo(S.x, S.y);
      ctx.lineTo(lerp(S.x, px, eo(lp)), lerp(S.y, py, eo(lp)));
      ctx.stroke();
      ctx.restore();
      const rep = ((t - go) % 1.4) / 1.4;
      if (t > go) packet(ctx, S.x, S.y, px, py, rep, { rgb: G.blueRgb, size: 9 });
      // distance rings closing on the pin
      const rq = P(t, tJarak - 0.1 + i * 0.12, 0.8);
      if (rq > 0) {
        const R = Math.hypot(px - S.x, py - S.y);
        const ang = Math.atan2(py - S.y, px - S.x);
        ctx.save();
        ctx.strokeStyle = `rgba(${G.fastRgb},${0.75 * eo(rq)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(S.x, S.y, R, ang - 0.22 * eo(rq), ang + 0.22 * eo(rq));
        ctx.stroke();
        ctx.restore();
      }
    });
    gPin(ctx, gv, PURWOKERTO[0], PURWOKERTO[1], { color: '#FF5A4A', r: 11, pulse: t * 1.2, a: eo(P(t, t1 - 0.2, 0.4)) });
    ringBurst(ctx, px, py, P(t, tSinyal + 0.2, 0.9), { color: G.redRgb, r: 120 });
  });
  plane(ctx, cam, 1.0, () => {
    SATS.forEach((S, i) => {
      // nadir array turned toward the phone
      satellite(ctx, S.x, S.y, S.s, { t: t + i, rot: Math.atan2(-(px - S.x), py - S.y), sheen: 0.8 });
      const lq = eo(P(t, tLama - 0.1 + i * 0.16, 0.4));
      if (lq > 0.001) {
        const mx = lerp(S.x, px, 0.5);
        const my = lerp(S.y, py, 0.5);
        chip(ctx, `0,0${S.ms} DTK`, mx, my, lq, { color: G.blueHi, size: 22 });
      }
    });
    mono(ctx, 'HP-MU', px, py + 64, { size: 24, color: '#FFB3A8', align: 'center', a: eo(P(t, t1, 0.4)), track: 5 });
  });
  // the rule of the whole system
  const fq = eo(P(t, tJarak - 0.2, 0.5));
  if (fq > 0.001) {
    plane(ctx, cam, 1.1, () => {
      ctx.save();
      ctx.globalAlpha *= fq;
      ctx.translate(0, (1 - fq) * 30);
      glass(ctx, 170, 1520, 1100, 200, 1, { tint: '255,190,110', edge: '255,220,170', glowC: 'rgba(255,176,58,0.25)', fill: 0.06 });
      const parts = [['JARAK', G.bone], [' = ', HUD.sub], ['WAKTU', G.fast], [' × ', HUD.sub], ['c', G.blueHi]];
      ctx.font = `86px ${F.fig8}`;
      let tw = 0;
      for (const [s] of parts) tw += ctx.measureText(s).width;
      let x = 720 - tw / 2;
      for (const [s, col] of parts) {
        txt(ctx, s, x, 1636, { size: 86, font: F.fig8, color: col });
        ctx.font = `86px ${F.fig8}`;
        x += ctx.measureText(s).width;
      }
      mono(ctx, 'c = KECEPATAN CAHAYA', 720, 1690, { size: 22, color: HUD.sub, align: 'center', track: 5 });
      ctx.restore();
    });
  }
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  // cross-zoom from the close-up to the planet
  const x = io(P(t, t1 - 0.5, 0.7));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.35 * x;
    ctx.translate(720, 760);
    ctx.scale(k, k);
    ctx.translate(-720, -760);
    closeUp(ctx, t, scene, cam, 1 - x);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 1.3 - 0.3 * x;
    c.translate(720, 980);
    c.scale(k, k);
    c.translate(-720, -980);
    wide(c, t, scene, cam, x);
    c.restore();
  });
}

export default { draw: drawScene };
