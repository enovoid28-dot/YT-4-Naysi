import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { W, H, txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, wordT, roll, mono, glass, chip, ringBurst, dimension } from './_bulan.mjs';
import { tag, punch, zoomed, labText } from './_lab.mjs';
import { G, P, eo, io, blueprint, routeAt, mapView, drawMap, m2s, pin, puck, layer, PX_KM } from './_gps.mjs';

// 06 — 38 MIKRODETIK
// Card 0: the two effects as a waterfall: +45 from gravity, −7 from speed,
// and the total column rises to +38 microseconds a day.
// Card 1: times the speed of light. The equation builds on the words, the
// map pulls back and the error circle opens to 11,4 km around you.

const BASE = 1180;
const SC = 13;
const COLS = [330, 720, 1110];
const CW = 210;

function waterfall(ctx, t, scene, cam) {
  const tHas = wordT(scene, 0, 0);
  const tMaju = wordT(scene, 0, 3);
  const tTiga = wordT(scene, 0, 4);
  const tMikro = wordT(scene, 0, 7);
  const tHari = wordT(scene, 0, 9);
  blueprint(ctx, t, cam, { cy: 900 });
  const y = (v) => BASE - v * SC;
  const k = punch(t, tTiga - 0.05, 0.03, 0.5);
  zoomed(ctx, k, 720, 900, () => {
    plane(ctx, cam, 1.0, () => {
      // axis and grid
      ctx.save();
      for (let v = 0; v <= 50; v += 10) {
        ctx.strokeStyle = v === 0 ? 'rgba(214,230,248,0.8)' : 'rgba(214,230,248,0.12)';
        ctx.lineWidth = v === 0 ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(190, y(v));
        ctx.lineTo(1250, y(v));
        ctx.stroke();
        if (v > 0) mono(ctx, `${v}`, 172, y(v) + 7, { size: 18, color: HUD.sub, align: 'right', track: 1 });
      }
      mono(ctx, 'µs / HARI', 172, y(50) - 28, { size: 18, color: HUD.sub, align: 'right', track: 2 });
      ctx.restore();
      // +45: gravity (amber)
      const q1 = eo(P(t, 0.0, 0.5));
      bar(ctx, COLS[0], y(0), y(45 * q1), ['#FFD27A', '#E8901F'], G.fastRgb, q1);
      labText(ctx, '+45', COLS[0], y(45) - 26, { size: 66, font: F.fig8, color: G.fastHi, align: 'center', alpha: q1 });
      // −7: speed (ice), hangs from the top of +45
      const q2 = eo(P(t, tHas - 0.1, 0.55));
      bar(ctx, COLS[1], y(45), y(45 - 7 * q2), ['#C2E6FF', '#5EA8E8'], G.slowRgb, q2);
      labText(ctx, '−7', COLS[1], y(45) - 26, { size: 66, font: F.fig8, color: G.slowHi, align: 'center', alpha: q2 });
      // connectors
      ctx.save();
      ctx.strokeStyle = 'rgba(214,230,248,0.45)';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2;
      ctx.globalAlpha *= q2;
      ctx.beginPath();
      ctx.moveTo(COLS[0] + CW / 2, y(45));
      ctx.lineTo(COLS[1] - CW / 2, y(45));
      ctx.stroke();
      ctx.globalAlpha = eo(P(t, tMaju - 0.4, 0.4));
      ctx.beginPath();
      ctx.moveTo(COLS[1] + CW / 2, y(38));
      ctx.lineTo(COLS[2] - CW / 2, y(38));
      ctx.stroke();
      ctx.restore();
      // the total
      const q3 = io(P(t, tMaju - 0.1, tMikro - tMaju + 0.1));
      const q3p = io(P(t - 1 / 90, tMaju - 0.1, tMikro - tMaju + 0.1));
      if (q3 > 0.001) {
        bar(ctx, COLS[2], y(0), y(38 * q3), ['#FFFFFF', '#FFB03A'], G.fastRgb, 1, 1.4);
        const rw = roll(ctx, 38 * q3, COLS[2] + 18, y(38 * q3) - 26, { size: 76, align: 'center', color: G.bone, prev: 38 * q3p });
        txt(ctx, '+', COLS[2] + 18 - rw / 2 - 6, y(38 * q3) - 30, { size: 62, font: F.fig8, color: G.bone, align: 'right' });
      }
      ringBurst(ctx, COLS[2], y(38), P(t, tMikro - 0.05, 0.8), { r: 220, color: G.fastRgb });
      // captions under the columns
      const capt = [['GRAVITASI', 'REL. UMUM', G.fastHi, q1], ['KECEPATAN', 'REL. KHUSUS', G.slowHi, q2], ['TOTAL', 'JAM SATELIT', G.bone, eo(P(t, tMaju - 0.2, 0.4))]];
      capt.forEach(([a, b, c, q], i) => {
        mono(ctx, a, COLS[i], BASE + 50, { size: 24, color: c, align: 'center', track: 4, a: q });
        mono(ctx, b, COLS[i], BASE + 84, { size: 18, color: HUD.sub, align: 'center', track: 3, a: q });
      });
    });
  });
  chip(ctx, 'SELISIH PER HARI', 720, 330, eo(P(t, 0.0, 0.5)), { color: HUD.text, size: 22 });
  plane(ctx, cam, 1.08, () => {
    tag(ctx, 720, 1600, P(t, tMikro - 0.05, 0.5), {
      big: '+38', small: 'MIKRODETIK / HARI', color: G.bone, glowRgb: G.fastRgb, size: 120,
      sub: 'JAM SATELIT MAJU', subColor: G.fastHi,
    });
    ringBurst(ctx, 720, 1600, P(t, tHari - 0.05, 0.8), { r: 300, color: G.fastRgb });
  });
}

function bar(ctx, cx, y0, y1, [c0, c1], rgb, a, glowK = 1) {
  if (a <= 0.001 || Math.abs(y1 - y0) < 0.5) return;
  const top = Math.min(y0, y1);
  const h = Math.abs(y1 - y0);
  ctx.save();
  ctx.globalAlpha *= clamp(a * 2);
  ctx.shadowColor = `rgba(${rgb},${0.45 * glowK})`;
  ctx.shadowBlur = 40;
  const g = ctx.createLinearGradient(0, top, 0, top + h);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(cx - CW / 2, top, CW, h, 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  // a sheen down the left edge and fine hatching
  const sh = ctx.createLinearGradient(cx - CW / 2, 0, cx + CW / 2, 0);
  sh.addColorStop(0, 'rgba(255,255,255,0.35)');
  sh.addColorStop(0.18, 'rgba(255,255,255,0.05)');
  sh.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.roundRect(cx - CW / 2, top, CW, h, 10);
  ctx.fill();
  ctx.restore();
}

function errorMap(ctx, t, scene, cam) {
  const tKali = wordT(scene, 1, 0);
  const tKec = wordT(scene, 1, 1);
  const tCah = wordT(scene, 1, 2);
  const tItu = wordT(scene, 1, 3);
  const tSep = wordT(scene, 1, 6);
  const tKm = wordT(scene, 1, 7);
  const r0 = routeAt(0.62);
  const zq = io(P(t, tItu - 0.3, tKm - tItu + 0.6));
  const k = lerp(1.7, 0.6, zq);
  const v = mapView(r0.x, r0.y, k, 720 + (cam.dx || 0) * 0.5, 1090 + (cam.dy || 0) * 0.5, 0.0);
  drawMap(ctx, v, { route: [0.3, 0.62] });
  ctx.fillStyle = 'rgba(4,6,10,0.42)';
  ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(720, 1090, 300, 720, 1090, 1300);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // the circle of error opens with the zoom
  const [cx, cy] = m2s(v, r0.x, r0.y);
  const eq = io(P(t, tItu - 0.1, tKm - tItu + 0.4));
  const R = 11.4 * PX_KM * k * eq;
  if (R > 2) {
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, `rgba(${G.redRgb},0.04)`);
    g.addColorStop(0.85, `rgba(${G.redRgb},0.14)`);
    g.addColorStop(1, `rgba(${G.redRgb},0.32)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(${G.redRgb},0.95)`;
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 10]);
    ctx.lineDashOffset = -t * 30;
    ctx.stroke();
    ctx.restore();
    // where the uncorrected fix lands
    const an = -0.75;
    puck(ctx, cx + Math.cos(an) * R, cy + Math.sin(an) * R, { t, color: G.red, rgb: G.redRgb, r: 18, acc: 40 });
    dimension(ctx, cx, cy, cx + Math.cos(an) * R, cy + Math.sin(an) * R, P(t, tSep - 0.2, 0.6), { label: '11,4 KM', size: 30, color: 'rgba(255,190,180,0.95)' });
  }
  pin(ctx, cx, cy, { p: eo(P(t, tKali - 0.3, 0.5)), s: 1.15 });
  mono(ctx, 'POSISIMU', cx, cy + 56, { size: 22, color: G.bone, align: 'center', track: 5, a: eo(P(t, tKali, 0.4)) });
  // the equation, built on the words
  plane(ctx, cam, 1.1, () => {
    const gq = eo(P(t, tKali - 0.35, 0.45));
    if (gq <= 0.001) return;
    ctx.save();
    ctx.globalAlpha *= gq;
    glass(ctx, 110, 250, 1220, 330, 1, { tint: '120,170,235', glowC: 'rgba(62,139,255,0.25)' });
    mono(ctx, 'SELISIH × KECEPATAN CAHAYA', 160, 314, { size: 22, color: G.blueHi, track: 5 });
    const parts = [
      ['38 µs', G.fastHi, tKali - 0.15],
      ['×', HUD.sub, tKali + 0.15],
      ['299.792 km/s', G.blueHi, tKec - 0.1],
    ];
    let x = 160;
    for (const [s, c, at] of parts) {
      const q = eo(P(t, at, 0.35));
      const w = labText(ctx, s, x, 420 + (1 - q) * 16, { size: 72, font: F.fig8, color: c, alpha: q });
      x += w + 26;
    }
    const q = eo(P(t, tItu - 0.1, 0.4));
    labText(ctx, '=', 160, 530 + (1 - q) * 16, { size: 72, font: F.fig8, color: HUD.sub, alpha: q });
    const kmq = io(P(t, tItu - 0.1, tKm - tItu + 0.3));
    const kmp = io(P(t - 1 / 90, tItu - 0.1, tKm - tItu + 0.3));
    if (q > 0.001) {
      const rw = roll(ctx, 11.4 * kmq, 240, 530, { size: 84, decimals: 1, color: G.bone, prev: 11.4 * kmp });
      labText(ctx, 'km', 240 + rw + 18, 530, { size: 64, font: F.fig8, color: '#FF8A7A', alpha: q });
    }
    ctx.restore();
  });
  plane(ctx, cam, 1.12, () => {
    tag(ctx, 720, 1640, P(t, tSep - 0.1, 0.5), {
      big: '> 10', small: 'KM MELESET', color: '#FF8A7A', glowRgb: G.redRgb, size: 116,
      sub: 'SETIAP HARI, KALAU TIDAK DIKOREKSI',
    });
  });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.5 * x;
    ctx.translate(COLS[2], 700);
    ctx.scale(k, k);
    ctx.translate(-COLS[2], -700);
    waterfall(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 1000);
    c.scale(k, k);
    c.translate(-720, -1000);
    errorMap(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
