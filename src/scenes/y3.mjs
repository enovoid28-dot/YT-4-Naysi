import { clamp, lerp } from '../engine/anim.mjs';
import { txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, deepSky, earthBall, wordT, roll, mono, glass, dimension, chip, ringBurst } from './_bulan.mjs';
import { tag, punch, zoomed } from './_lab.mjs';
import { G, P, eo, io, blueprint, pitch, packet, puck, orbitPt, orbitRing, layer } from './_gps.mjs';

// 03 — 300 METER
// Card 0: light laps the Earth while the counter climbs to 299.792 km per
// second — seven and a half laps in a single second.
// Card 1: one second on a ruler, zoomed a thousand times, then a thousand
// times again: a microsecond. In that time light crosses three football
// pitches; your position lands three hundred metres away.

const EC = [720, 760];
const ER = 300;
const RING = { rx: 500, ry: 128, rot: -0.14 };

function lightLap(ctx, t, a, half) {
  // a comet on the equator ring; only the half asked for (back or front)
  const om = 9.4;
  const th0 = t * om;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const n = 26;
  for (let i = 0; i < n; i++) {
    const f = i / n;
    const th = th0 - f * 1.6;
    const p0 = orbitPt(EC[0], EC[1], RING.rx, RING.ry, RING.rot, th);
    const p1 = orbitPt(EC[0], EC[1], RING.rx, RING.ry, RING.rot, th - 1.6 / n);
    const isBack = Math.sin(th) < 0;
    if ((half === 'back') !== isBack) continue;
    if (isBack && Math.hypot(p0.x - EC[0], p0.y - EC[1]) < ER) continue;
    ctx.strokeStyle = `rgba(200,230,255,${a * (1 - f) * 0.95})`;
    ctx.lineWidth = 16 * (1 - f) + 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  const h = orbitPt(EC[0], EC[1], RING.rx, RING.ry, RING.rot, th0);
  const hb = Math.sin(th0) < 0;
  if ((half === 'back') === hb && !(hb && Math.hypot(h.x - EC[0], h.y - EC[1]) < ER)) {
    const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 110);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.15, `rgba(190,225,255,${0.8 * a})`);
    g.addColorStop(1, 'rgba(120,180,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(h.x - 110, h.y - 110, 220, 220);
  }
  ctx.restore();
}

function lightCard(ctx, t, scene, cam) {
  const tCepat = wordT(scene, 0, 3);
  const tCahaya = wordT(scene, 0, 4);
  deepSky(ctx, t, cam, { seed: 33, band: 0.5, bandY: 760 });
  const k = punch(t, tCahaya - 0.05, 0.04, 0.5);
  zoomed(ctx, k, EC[0], EC[1], () => {
    plane(ctx, cam, 0.8, () => {
      orbitRing(ctx, EC[0], EC[1], RING.rx, RING.ry, RING.rot, { half: 'back', rgb: '170,210,255', a: 0.3, lw: 2.5 });
      lightLap(ctx, t, 1, 'back');
      earthBall(ctx, EC[0], EC[1], ER, { lon: 100 + t * 3, tilt: -14, sun: { x: -0.6, y: 0.4, z: 0.7 }, lights: 0.5 });
      orbitRing(ctx, EC[0], EC[1], RING.rx, RING.ry, RING.rot, { half: 'front', rgb: '170,210,255', a: 0.45, lw: 2.5 });
      lightLap(ctx, t, 1, 'front');
    });
  });
  chip(ctx, '7,5× KELILING BUMI DALAM 1 DETIK', 720, 1150, eo(P(t, 0.4, 0.5)), { color: G.blueHi, size: 26 });
  // the speed, counted up as the voice says "secepat cahaya"
  const q = io(P(t, 0.85, tCepat + 0.55 - 0.85));
  const qa = eo(P(t, 0.2, 0.5));
  plane(ctx, cam, 1.05, () => {
    ctx.save();
    ctx.globalAlpha *= qa;
    glass(ctx, 190, 1270, 1060, 300, 1, { tint: '140,190,255', glowC: 'rgba(120,180,255,0.3)' });
    mono(ctx, 'KECEPATAN CAHAYA', 250, 1330, { size: 22, color: G.blueHi, track: 5 });
    roll(ctx, 299792 * q, 248, 1490, { size: 150, thousands: true, color: G.bone, prev: 299792 * io(P(t - 1 / 90, 0.85, tCepat + 0.55 - 0.85)) });
    txt(ctx, 'KM/DETIK', 1200, 1488, { size: 40, font: F.fig8, color: G.blueHi, align: 'right' });
    ctx.restore();
  });
}

/** one second on a ruler, magnified by `z` (1 … 1e6) */
function zoomRuler(ctx, x0, y, w, z, t, a) {
  const L = Math.log10(z);
  const frac = L - Math.floor(L);
  const sp = 110 * Math.pow(10, frac);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(214,230,248,0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x0 + w, y);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y - 90, w, 120);
  ctx.clip();
  for (let i = 0; x0 + i * sp / 10 <= x0 + w + 1; i++) {
    const xx = x0 + (i * sp) / 10;
    const major = i % 10 === 0;
    const mid = i % 5 === 0;
    const fade = major ? 1 : clamp((sp / 10 - 6) / 20);
    ctx.strokeStyle = `rgba(214,230,248,${(major ? 0.95 : mid ? 0.6 : 0.35) * fade})`;
    ctx.lineWidth = major ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(xx, y);
    ctx.lineTo(xx, y - (major ? 64 : mid ? 40 : 24));
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

function microCard(ctx, t, scene, cam) {
  const tSel = wordT(scene, 1, 1);
  const tSatu = wordT(scene, 1, 2);
  const tMikro = wordT(scene, 1, 3);
  const tPos = wordT(scene, 1, 5);
  const tMel = wordT(scene, 1, 6);
  const tTiga = wordT(scene, 1, 7);
  const tMeter = wordT(scene, 1, 9);
  blueprint(ctx, t, cam, { cy: 1000 });
  // the ruler: a second, a millisecond, a microsecond
  const zq = io(P(t, tSel, tMikro + 0.35 - tSel));
  const z = Math.pow(10, 6 * zq);
  const lab = zq < 0.33 ? '1 DETIK' : zq < 0.83 ? '1 MILIDETIK' : '1 MIKRODETIK';
  plane(ctx, cam, 0.9, () => {
    glass(ctx, 120, 360, 1200, 420, 1, { tint: '120,170,235' });
    mono(ctx, 'SELISIH WAKTU', 170, 424, { size: 22, color: HUD.sub, track: 5 });
    txt(ctx, lab, 170, 540, { size: 92, font: F.fig8, color: zq > 0.83 ? G.fast : G.bone });
    const sub = zq > 0.83 ? '= 0,000001 DETIK' : zq > 0.33 ? '= 0,001 DETIK' : '';
    if (sub) mono(ctx, sub, 1270, 534, { size: 30, color: zq > 0.83 ? G.fastHi : HUD.sub, align: 'right', track: 2 });
    zoomRuler(ctx, 170, 720, 1100, z, t, 1);
    const zz = P(t, tSel, 0.3) * (1 - P(t, tMikro + 0.3, 0.3));
    if (zz > 0.01) chip(ctx, `ZOOM × ${Math.round(z).toLocaleString('de-DE')}`, 1110, 424, zz, { color: G.blueHi, size: 20 });
  });
  // three pitches end to end: three hundred metres
  const PX0 = 180;
  const PWd = 360;
  const PHt = 233;
  const PY = 1010;
  plane(ctx, cam, 1.0, () => {
    for (let i = 0; i < 3; i++) pitch(ctx, PX0 + i * PWd, PY, PWd, PHt, { p: P(t, tSatu - 0.3 + i * 0.12, 0.4) });
    // light crosses all three in one microsecond
    const lq = P(t, tMikro - 0.05, 0.9);
    if (lq > 0 && lq < 1) packet(ctx, PX0, PY + PHt / 2, PX0 + 3 * PWd, PY + PHt / 2, lq, { rgb: '200,230,255', size: 14, trail: 0.35 });
    const tq = clamp(lq);
    if (lq > 0) mono(ctx, `${(tq).toFixed(2).replace('.', ',')} µs`, PX0 + 3 * PWd * tq, PY - 26, { size: 24, color: G.blueHi, align: 'center', a: 1 - P(t, tMikro + 1.2, 0.4) });
    puck(ctx, PX0, PY + PHt / 2, { t, r: 20, a: eo(P(t, tSatu - 0.2, 0.4)) });
    const mq = eo(P(t, tMel - 0.1, 0.5));
    if (mq > 0.001) {
      const gx = lerp(PX0, PX0 + 3 * PWd, mq);
      ctx.save();
      ctx.strokeStyle = `rgba(${G.redRgb},0.85)`;
      ctx.setLineDash([12, 10]);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(PX0 + 22, PY + PHt / 2);
      ctx.lineTo(gx, PY + PHt / 2);
      ctx.stroke();
      ctx.restore();
      puck(ctx, gx, PY + PHt / 2, { t: t + 0.4, r: 20, color: G.red, rgb: G.redRgb });
      mono(ctx, 'POSISIMU', PX0, PY + PHt + 50, { size: 24, color: G.blueHi, align: 'center', a: eo(P(t, tPos - 0.1, 0.4)), track: 4 });
      mono(ctx, 'KATA GPS', gx, PY + PHt + 50, { size: 24, color: '#FFB3A8', align: 'center', a: mq, track: 4 });
    }
    dimension(ctx, PX0, PY - 70, PX0 + 3 * PWd, PY - 70, P(t, tTiga - 0.2, 0.6), { label: '300 M', size: 28, color: 'rgba(214,230,248,0.85)' });
  });
  plane(ctx, cam, 1.08, () => {
    tag(ctx, 720, 1560, P(t, tTiga - 0.05, 0.5), {
      big: '300', small: 'METER', color: G.fastHi, glowRgb: G.fastRgb, size: 128, sub: '± 3 LAPANGAN BOLA',
    });
    ringBurst(ctx, 720, 1560, P(t, tMeter - 0.05, 0.8), { r: 300 });
  });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.4, 0.6));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.25 * x;
    ctx.translate(720, 900);
    ctx.scale(k, k);
    ctx.translate(-720, -900);
    lightCard(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 1.2 - 0.2 * x;
    c.translate(720, 900);
    c.scale(k, k);
    c.translate(-720, -900);
    microCard(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
