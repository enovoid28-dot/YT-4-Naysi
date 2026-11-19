import { rng } from '../engine/anim.mjs';
import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, earthBall, wordT, roll, mono, glass, ringBurst } from './_bulan.mjs';
import { tag, punch, zoomed, labText } from './_lab.mjs';
import { G, P, eo, io, satellite, speedo, clockFace, digits, clockStringsUs, layer } from './_gps.mjs';

// 04 — KECEPATAN
// Card 0: the satellite crosses the frame over a turning Earth, the stars
// streak, and the speedometer under it sweeps to 13,9 thousand km/h on
// "empat belas ribu" — Jakarta to Surabaya in about three minutes.
// Card 1: two clocks, Earth and satellite. A whole day runs through the bar
// under them and the satellite's clock falls behind: seven microseconds.

const KMH = 13.946;
const STARS = (() => {
  const r = rng(404);
  return Array.from({ length: 170 }, () => ({ x: r() * W, y: r() * 1800, z: 0.25 + r() * 0.75, b: r() }));
})();

function streakSky(ctx, t, v, cam, go) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#03050B');
  g.addColorStop(0.55, '#07101E');
  g.addColorStop(1, '#03050A');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const neb = ctx.createRadialGradient(1100, 520, 40, 1100, 520, 900);
  neb.addColorStop(0, 'rgba(70,110,200,0.16)');
  neb.addColorStop(1, 'rgba(70,110,200,0)');
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, W, H);
  const neb2 = ctx.createRadialGradient(220, 1300, 40, 220, 1300, 800);
  neb2.addColorStop(0, 'rgba(160,90,200,0.08)');
  neb2.addColorStop(1, 'rgba(160,90,200,0)');
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, W, H);
  // stars stream right-to-left: the camera rides with the satellite
  const fly = flown(t, go);
  ctx.save();
  ctx.lineCap = 'round';
  for (const s of STARS) {
    const sp = s.z * (40 + 900 * v);
    const x = ((s.x - (t * 40 + fly * 1400) * s.z - (cam.dx || 0) * s.z) % W + W) % W;
    const y = s.y + (cam.dy || 0) * s.z * 0.5;
    const len = 2 + sp * 0.12;
    const al = (0.25 + 0.6 * s.b) * s.z;
    ctx.strokeStyle = `rgba(220,232,255,${al})`;
    ctx.lineWidth = 1 + s.z * 1.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** distance the camera has flown, in screen widths: eases in from `go` */
function flown(t, go) {
  const e = t - go;
  if (e <= 0) return 0;
  const ramp = 0.9;
  return e < ramp ? (0.55 * e * e) / (2 * ramp) : 0.55 * (e - ramp / 2);
}

function flight(ctx, t, scene, cam) {
  const tMel = wordT(scene, 0, 1);
  const tEmpat = wordT(scene, 0, 3);
  const tRibu = wordT(scene, 0, 5);
  const tKm = wordT(scene, 0, 6);
  const v = io(P(t, tMel - 0.15, 0.9));
  streakSky(ctx, t, v, cam, tMel - 0.15);
  plane(ctx, cam, 0.3, () => {
    earthBall(ctx, 720, 2230, 620, { lon: 92 + t * 2.2 + v * t * 2.5, tilt: -24, sun: { x: -0.4, y: 0.7, z: 0.6 }, lights: 0.5 });
  });
  // the satellite, with speed lines behind it
  const sx = 720 + Math.sin(t * 0.7) * 10;
  const sy = 600 + Math.sin(t * 0.9) * 10;
  const k = punch(t, tMel - 0.05, 0.05, 0.5);
  zoomed(ctx, k, sx, sy, () => {
    plane(ctx, cam, 1.0, () => {
      if (v > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const r = rng(9);
        for (let i = 0; i < 22; i++) {
          const yy = sy - 170 + r() * 340;
          const len = (300 + r() * 600) * v;
          const ph = ((t * (2.4 + r() * 2) + r()) % 1);
          const x1 = sx - 120 - ph * 900;
          const g = ctx.createLinearGradient(x1 - len, 0, x1, 0);
          g.addColorStop(0, 'rgba(160,200,255,0)');
          g.addColorStop(1, `rgba(160,200,255,${0.22 * v * (1 - ph)})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 2 + r() * 2;
          ctx.beginPath();
          ctx.moveTo(x1 - len, yy);
          ctx.lineTo(x1, yy);
          ctx.stroke();
        }
        ctx.restore();
      }
      satellite(ctx, sx, sy, 0.86, { t, rot: -0.04 + 0.03 * Math.sin(t * 0.6) });
      // direction of travel
      const aq = eo(P(t, tMel, 0.5));
      if (aq > 0.001) {
        ctx.save();
        ctx.globalAlpha *= aq;
        ctx.strokeStyle = G.slowHi;
        ctx.fillStyle = G.slowHi;
        ctx.lineWidth = 4;
        const ax = sx + 430;
        ctx.beginPath();
        ctx.moveTo(ax, sy + 210);
        ctx.lineTo(ax + 120 * aq, sy + 210);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax + 120 * aq + 18, sy + 210);
        ctx.lineTo(ax + 120 * aq - 6, sy + 198);
        ctx.lineTo(ax + 120 * aq - 6, sy + 222);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });
  });
  // the gauge
  const gq = P(t, 0.0, 0.5);
  const val = KMH * io(P(t, tEmpat - 0.35, tKm - tEmpat + 0.25));
  const valPrev = KMH * io(P(t - 1 / 90, tEmpat - 0.35, tKm - tEmpat + 0.25));
  plane(ctx, cam, 1.08, () => {
    speedo(ctx, 720, 1180, 270, val, { p: gq, t, rgb: G.slowRgb });
    ctx.save();
    ctx.globalAlpha *= eo(gq);
    roll(ctx, val * 1000, 720, 1328, { size: 84, align: 'center', thousands: true, color: G.bone, prev: valPrev * 1000 });
    mono(ctx, 'KM / JAM', 720, 1372, { size: 22, color: G.slowHi, align: 'center', track: 6 });
    ctx.restore();
    ringBurst(ctx, 720, 1180, P(t, tRibu, 0.8), { r: 330, color: G.slowRgb });
  });
  plane(ctx, cam, 1.12, () => {
    tag(ctx, 720, 1600, P(t, tKm + 0.15, 0.5), {
      big: '≈ 14.000', small: 'KM/JAM', color: G.slowHi, glowRgb: G.slowRgb, size: 108,
      sub: 'JAKARTA → SURABAYA ± 3 MENIT',
    });
  });
}

function clocks(ctx, t, scene, cam) {
  const tRel = wordT(scene, 1, 1);
  const tKhusus = wordT(scene, 1, 2);
  const tJamnya = wordT(scene, 1, 3);
  const tLambat = wordT(scene, 1, 4);
  const tTujuh = wordT(scene, 1, 5);
  const tMikro = wordT(scene, 1, 6);
  streakSky(ctx, t, 0.15, cam, wordT(scene, 0, 1) - 0.15);
  ctx.fillStyle = 'rgba(3,5,10,0.55)';
  ctx.fillRect(0, 0, W, H);
  // the law, as a title
  const hq = eo(P(t, tRel - 0.15, 0.5));
  if (hq > 0.001) {
    labText(ctx, 'RELATIVITAS KHUSUS', 720, 392 - (1 - hq) * 20, { size: 62, font: F.fig8, color: G.bone, align: 'center', alpha: hq });
    mono(ctx, 'MAKIN CEPAT BERGERAK  →  WAKTU MAKIN LAMBAT', 720, 448, { size: 22, color: G.slowHi, align: 'center', track: 3, a: eo(P(t, tKhusus - 0.1, 0.5)) });
  }
  // a day goes by in two seconds
  const dq = io(P(t, tJamnya - 0.1, tMikro - tJamnya + 0.25));
  const day = dq * 86400;
  const base = 9 * 3600 + 41 * 60 + 27;
  const lagUs = 7 * dq;
  const cards = [
    { x: 380, label: 'BUMI', rgb: '214,230,248', accent: G.bone, sub: 'DIAM DI TANAH' },
    { x: 1060, label: 'SATELIT', rgb: G.slowRgb, accent: G.slow, sub: '14.000 KM/JAM' },
  ];
  plane(ctx, cam, 1.0, () => {
    cards.forEach((c, i) => {
      const cq = P(t, tRel - 0.25 + i * 0.12, 0.6);
      const sec = base + (t - tRel) + day - (i ? lagUs * 1e-6 : 0);
      clockFace(ctx, c.x, 790, 230, sec, { p: cq, rgb: c.rgb, accent: c.accent, accentRgb: i ? G.slowRgb : '214,230,248', glowK: i ? 0.6 + 0.4 * P(t, tLambat, 0.4) : 0, ghost: i ? (base + (t - tRel) + day) % 60 : null });
      const lq = eo(cq);
      mono(ctx, c.label, c.x + 26, 520, { size: 30, color: i ? G.slowHi : G.bone, align: 'center', track: 8, a: lq });
      const ix = c.x - (i ? 160 : 92);
      if (i === 0) earthBall(ctx, ix, 510, 24, { a: lq, lon: 110, tilt: -10, sun: { x: -0.5, y: 0.5, z: 0.7 }, lights: 0, halo: 0 });
      else {
        ctx.save();
        ctx.globalAlpha *= lq;
        ctx.strokeStyle = `rgba(${G.slowRgb},0.6)`;
        ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(ix - 40 - k * 8, 500 + k * 10);
          ctx.lineTo(ix - 70 - k * 18, 500 + k * 10);
          ctx.stroke();
        }
        ctx.restore();
        satellite(ctx, ix, 510, 0.13, { t, a: lq, rot: -0.1 });
      }
      mono(ctx, c.sub, c.x, 1080, { size: 20, color: HUD.sub, align: 'center', track: 4, a: lq });
    });
  });
  // the day bar and the readouts
  const bq = eo(P(t, tJamnya - 0.3, 0.4));
  if (bq > 0.001) {
    plane(ctx, cam, 1.05, () => {
      ctx.save();
      ctx.globalAlpha *= bq;
      glass(ctx, 120, 1130, 1200, 360, 1, { tint: '120,170,235' });
      mono(ctx, '1 HARI', 170, 1190, { size: 22, color: HUD.sub, track: 5 });
      const hh = String(Math.min(24, Math.floor(dq * 24))).padStart(2, '0');
      mono(ctx, `${hh}:00 / 24:00`, 1270, 1190, { size: 22, color: G.bone, align: 'right', track: 3 });
      ctx.fillStyle = 'rgba(214,230,248,0.12)';
      ctx.beginPath();
      ctx.roundRect(170, 1214, 1100, 14, 7);
      ctx.fill();
      ctx.fillStyle = G.slow;
      ctx.beginPath();
      ctx.roundRect(170, 1214, 1100 * dq, 14, 7);
      ctx.fill();
      for (let h = 0; h <= 24; h += 6) {
        const x = 170 + (1100 * h) / 24;
        ctx.fillStyle = 'rgba(214,230,248,0.5)';
        ctx.fillRect(x - 1, 1236, 2, 10);
      }
      const nowUs = Math.floor((base + (t - tRel) + day) * 1e6);
      const se = clockStringsUs(nowUs);
      const ss = clockStringsUs(nowUs - Math.round(lagUs));
      mono(ctx, 'BUMI', 170, 1316, { size: 22, color: G.bone, track: 5 });
      mono(ctx, 'SATELIT', 170, 1416, { size: 22, color: G.slowHi, track: 5 });
      digits(ctx, `${se.hms},${se.us}`, 1270, 1328, { size: 60, color: G.bone, align: 'right' });
      digits(ctx, `${ss.hms},${ss.us}`, 1270, 1428, { size: 60, color: G.slowHi, align: 'right', glowC: 'rgba(110,200,255,0.4)' });
      ctx.restore();
    });
  }
  // the loss per day
  plane(ctx, cam, 1.1, () => {
    tag(ctx, 720, 1640, P(t, tTujuh - 0.05, 0.5), {
      big: '−7', small: 'MIKRODETIK / HARI', color: G.slowHi, glowRgb: G.slowRgb, size: 120,
      count: null,
    });
    ringBurst(ctx, 720, 1640, P(t, tMikro - 0.05, 0.8), { r: 300, color: G.slowRgb });
  });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.6 * x;
    ctx.translate(720, 640);
    ctx.scale(k, k);
    ctx.translate(-720, -640);
    flight(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 900);
    c.scale(k, k);
    c.translate(-720, -900);
    clocks(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
