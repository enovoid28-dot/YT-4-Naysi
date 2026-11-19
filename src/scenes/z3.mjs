import { clamp, lerp, rng, TAU } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';
import { txt } from '../engine/draw.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, chip, ringBurst } from './_bulan.mjs';
import { tag } from './_lab.mjs';
import { monoFx, hud, panel, shock, streaks } from './_fx.mjs';
import { hit } from '../engine/look.mjs';
import { C, P, eo, io, layer, micro, molecule, capsa, bilayer, channel, ions, thermo, spikes, leader } from './_cabai.mjs';

// 03 — SENSOR PANAS
// Card 0: a chili cut lengthwise — the white ribs glow: that is where the
// capsaicin is made (not in the seeds). On "kapsaisin" the formula draws in,
// from "cabai" the molecules drift down to a nerve membrane, "menempel" docks
// one into TRPV1 and "sensor panas" opens it.
// Card 1: the same sensor beside a thermometer. The temperature climbs with
// the sentence and crosses 43 °C exactly on "tiga"; only then the channel
// opens and the nerve fires. Readout, mercury and channel share one value.

const M = { y: 1170, cx: 720, s: 240 };

/** a chili cut in half lengthwise, seen from above: skin, flesh, white placenta, seeds */
function halfChili(ctx, cx, cy, len, t, { a = 1, glow = 0 } = {}) {
  if (a <= 0.004) return;
  const wmax = len * 0.2;
  const N = 30;
  const top = [];
  const bot = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const wu = wmax * (u < 0.12 ? lerp(0.8, 1, u / 0.12) : Math.pow(Math.max(0, 1 - (u - 0.12) / 0.88), 0.75)) * 0.5;
    const x = cx - len / 2 + u * len;
    const yy = cy - Math.sin(u * Math.PI) * len * 0.03;
    top.push([x, yy - wu]);
    bot.push([x, yy + wu]);
  }
  const path = (k) => {
    ctx.beginPath();
    top.forEach(([x, y], i) => {
      const yy = cy + (y - cy) * k;
      if (i === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    });
    for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], cy + (bot[i][1] - cy) * k);
    ctx.closePath();
  };
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  path(1);
  const sk = ctx.createLinearGradient(0, cy - wmax / 2, 0, cy + wmax / 2);
  sk.addColorStop(0, '#FF5A44');
  sk.addColorStop(0.5, '#C81E14');
  sk.addColorStop(1, '#6E0805');
  ctx.fillStyle = sk;
  ctx.fill();
  ctx.restore();
  // flesh
  path(0.8);
  const fl = ctx.createLinearGradient(0, cy - wmax / 2, 0, cy + wmax / 2);
  fl.addColorStop(0, '#FF8E6E');
  fl.addColorStop(1, '#E2483A');
  ctx.fillStyle = fl;
  ctx.fill();
  // cavity
  path(0.62);
  ctx.fillStyle = '#B8241A';
  ctx.fill();
  // placenta: the white rib along the centre and the cap end
  ctx.save();
  path(0.62);
  ctx.clip();
  const pl = ctx.createLinearGradient(cx - len / 2, 0, cx + len / 2, 0);
  pl.addColorStop(0, 'rgba(255,246,228,0.98)');
  pl.addColorStop(0.45, 'rgba(255,238,214,0.9)');
  pl.addColorStop(1, 'rgba(255,230,200,0.25)');
  ctx.fillStyle = pl;
  ctx.beginPath();
  ctx.moveTo(cx - len / 2, cy - wmax * 0.2);
  ctx.quadraticCurveTo(cx - len * 0.1, cy - wmax * 0.06, cx + len * 0.4, cy);
  ctx.quadraticCurveTo(cx - len * 0.1, cy + wmax * 0.06, cx - len / 2, cy + wmax * 0.2);
  ctx.closePath();
  ctx.fill();
  if (glow > 0.01) {
    ctx.globalCompositeOperation = 'screen';
    const pul = 0.8 + 0.2 * Math.sin(t * 6);
    const g = ctx.createLinearGradient(cx - len / 2, 0, cx + len * 0.4, 0);
    g.addColorStop(0, `rgba(255,150,60,${0.95 * glow * pul})`);
    g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - len / 2, cy - wmax * 0.3, len * 0.9, wmax * 0.6);
  }
  // seeds along the rib
  const r = rng(303);
  for (let i = 0; i < 22; i++) {
    const u = 0.06 + r() * 0.62;
    const x = cx - len / 2 + u * len;
    const side = r() < 0.5 ? -1 : 1;
    const y = cy + side * wmax * (0.08 + r() * 0.12);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r() * TAU);
    ctx.fillStyle = '#F6E2A6';
    ctx.beginPath();
    ctx.ellipse(0, 0, wmax * 0.07, wmax * 0.05, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(150,110,40,0.5)';
    ctx.beginPath();
    ctx.arc(wmax * 0.05, 0, wmax * 0.015, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // the cut face highlight
  ctx.strokeStyle = 'rgba(255,220,200,0.5)';
  ctx.lineWidth = 3;
  path(0.8);
  ctx.stroke();
  // stem cap on the left
  ctx.fillStyle = '#3F8A34';
  ctx.beginPath();
  ctx.ellipse(cx - len / 2 - 6, cy, wmax * 0.16, wmax * 0.42, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#3F8A34';
  ctx.lineWidth = wmax * 0.16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - len / 2 - 10, cy);
  ctx.quadraticCurveTo(cx - len / 2 - 90, cy - 10, cx - len / 2 - 130, cy - 60);
  ctx.stroke();
  ctx.restore();
}

// molecules drift from the rib (above) to the membrane (below)
const DRIFT = (() => {
  const r = rng(33);
  return Array.from({ length: 14 }, () => ({ x0: 420 + r() * 520, x1: 260 + r() * 920, d: r() * 0.9, rot: r() * TAU, sp: 0.8 + r() * 0.5 }));
})();

function dock(ctx, t, scene, cam) {
  const tKap = wordT(scene, 0, 1);
  const tCabai = wordT(scene, 0, 3);
  const tTempel = wordT(scene, 0, 4);
  const tSensor = wordT(scene, 0, 6);
  const tPanas = wordT(scene, 0, 7);
  const tLidah = wordT(scene, 0, 9);
  micro(ctx, t, cam, { rgb: '60,130,140', warm: 1 });

  const open = eo(P(t, tSensor - 0.05, 0.45));
  // the cut chili and its glowing rib
  plane(ctx, cam, 0.9, () => {
    halfChili(ctx, 790, 600, 1120, t, { glow: eo(P(t, tKap - 0.1, 0.6)) });
    leader(ctx, 520, 600, 380, 780, P(t, tKap + 0.2, 0.4), { color: 'rgba(255,214,150,0.8)', t });
    monoFx(ctx, 'URAT PUTIH = PABRIK KAPSAISIN', 110, 830, P(t, tKap + 0.3, 0.8), t, { size: 30, color: C.emberHi, track: 2, seed: 6 });
    monoFx(ctx, 'BUKAN DI BIJINYA', 110, 874, P(t, tKap + 0.55, 0.6), t, { size: 26, color: 'rgba(232,226,214,0.7)', track: 3, seed: 7 });
  });

  // the formula, top right, draws in on "kapsaisin"
  plane(ctx, cam, 1.1, () => {
    const q = eo(P(t, tKap - 0.1, 0.5));
    molecule(ctx, 840, 330, 36, { a: q, glowK: 0.5 });
    monoFx(ctx, 'KAPSAISIN · C18H27NO3', 1330, 448, P(t, tKap, 0.8), t, { size: 28, color: '#FFB08A', align: 'right', track: 3, seed: 8 });
  });

  // drifting molecules, then one docks
  plane(ctx, cam, 1.0, () => {
    const dq = P(t, tCabai - 0.1, 2.2);
    for (const m of DRIFT) {
      const f = clamp((dq - m.d * 0.3) * m.sp);
      if (f <= 0 || f >= 1) continue;
      const x = lerp(m.x0, m.x1, f);
      const y = lerp(720, M.y - 190, f) + Math.sin(t * 2 + m.rot) * 12;
      capsa(ctx, x, y, 30, { a: Math.sin(f * Math.PI), rot: m.rot + t * 0.6 });
    }
    // membrane and the sensor
    bilayer(ctx, -20, W0, M.y, t, { gap: [M.cx - M.s * 0.75, M.cx + M.s * 0.75] });
    channel(ctx, M.cx, M.y, M.s, open, t, { glow: open, label: 'TRPV1' });
    ions(ctx, M.cx, M.y, M.s, t, open);
    // the docking molecule: from above into the left pocket
    const dk = io(P(t, tTempel - 0.5, 0.75));
    const px = M.cx - (M.s * (0.1 + 0.22 * open)) / 2 - M.s * 0.42 * 0.5 - M.s * 0.42 * 0.18;
    const py = M.y - M.s * 1.25 * 0.12;
    const hx = lerp(M.cx - 160, px, dk);
    const hy = lerp(M.y - 520, py, dk);
    capsa(ctx, hx, hy, lerp(38, 28, dk), { a: eo(P(t, tCabai, 0.4)), rot: lerp(0.8, 0, dk), glow: 1 + open });
    ringBurst(ctx, px, py, P(t, tTempel + 0.15, 0.6), { color: C.orangeRgb, r: 110 });
    shock(ctx, px, py, P(t, tTempel + 0.12, 0.6), { r: 230, rgb: C.orangeRgb, lines: 12, seed: 21 });
    streaks(ctx, px, py, P(t, tTempel + 0.12, 0.45), { n: 14, r: 220, rgb: '255,190,120', seed: 22 });
    hit(t, tTempel + 0.12, 0.6);
    hud(ctx, 260, M.y + 6, 110, M.y + 210, P(t, tSensor + 0.1, 0.7), t, { label: 'MEMBRAN SARAF', sub: 'UJUNG SARAF NYERI', rgb: '150,235,220', seed: 9 });
    mono(ctx, 'MENEMPEL', px - 60, py - 80, { size: 28, color: '#FFB08A', align: 'right', track: 4, a: eo(P(t, tTempel + 0.1, 0.35)) * (1 - eo(P(t, tSensor, 0.3))) });
  });

  plane(ctx, cam, 1.05, () => {
    tag(ctx, 720, 1640, P(t, tSensor - 0.12, 0.5), { big: 'SENSOR PANAS', color: C.mint, glowRgb: C.mintRgb, size: 84 });
    ringBurst(ctx, M.cx, M.y, P(t, tPanas - 0.05, 0.7), { color: C.emberRgb, r: 260 });
    shock(ctx, M.cx, M.y, P(t, tPanas - 0.08, 0.8), { r: 440, rgb: C.emberRgb, lines: 16, seed: 23 });
    hit(t, tPanas - 0.08, 0.55);
  });
  chip(ctx, 'ADA DI SARAF LIDAHMU', 720, 1520, eo(P(t, tLidah - 0.1, 0.4)), { color: C.mint, size: 28 });
}
const W0 = 1460;

function threshold(ctx, t, scene, cam) {
  const t1 = wordT(scene, 1, 0);
  const tNyala = wordT(scene, 1, 4);
  const tTiga = wordT(scene, 1, 11);
  const tDerajat = wordT(scene, 1, 12);
  // one value for the readout, the mercury and the channel
  const temp = t < tTiga
    ? lerp(31, 43, io(P(t, t1 + 0.1, tTiga - t1 - 0.1)))
    : 43 + 2.4 * eo(P(t, tTiga, 1.1));
  const open = clamp((temp - 42.85) / 0.5);
  micro(ctx, t, cam, { rgb: open > 0.5 ? '150,90,60' : '60,130,140', warm: 1 });
  if (open > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(900, 1000, 60, 900, 1000, 1100);
    g.addColorStop(0, `rgba(255,110,50,${0.22 * open})`);
    g.addColorStop(1, 'rgba(255,110,50,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1440, 2000);
    ctx.restore();
  }

  // the readout
  plane(ctx, cam, 1.15, () => {
    const q = eo(P(t, t1 - 0.2, 0.5));
    panel(ctx, 420, 300, 600, 250, t, q, { rgb: open > 0.5 ? '255,120,90' : '120,210,210', fill: 0.5, trace: 0.5 + 0.5 * open });
    mono(ctx, 'SUHU', 470, 362, { size: 28, color: 'rgba(232,226,214,0.75)', track: 6, a: q });
    const s = temp.toFixed(1).replace('.', ',');
    txt(ctx, `${s} °C`, 470, 500, { size: 120, font: F.fig8, color: open > 0.5 ? '#FF6A52' : C.bone, alpha: q });
  });

  // the thermometer
  plane(ctx, cam, 1.0, () => {
    thermo(ctx, 270, 1010, 860, temp, { min: 25, max: 50, mark: 43, p: P(t, t1 - 0.2, 0.6), w: 58 });
  });

  // the sensor in its membrane, closed until 43
  plane(ctx, cam, 1.05, () => {
    const cx = 930;
    const y = 960;
    const s = 180;
    bilayer(ctx, 560, 1320, y, t, { gap: [cx - s * 0.75, cx + s * 0.75], s: 0.9, a: eo(P(t, t1 - 0.2, 0.5)) });
    channel(ctx, cx, y, s, open, t, { glow: open, label: open > 0.5 ? 'TRPV1 · MENYALA' : 'TRPV1 · TERTUTUP', deaf: 0 });
    ions(ctx, cx, y, s, t, open);
    // nerve trace beneath
    panel(ctx, 560, 1300, 760, 200, t, eo(P(t, tNyala - 0.3, 0.5)), { rgb: '255,210,74', fill: 0.45, trace: open, ticks: false });
    mono(ctx, 'SINYAL NYERI', 600, 1352, { size: 26, color: C.nerve, track: 5, a: eo(P(t, tNyala - 0.2, 0.5)) });
    spikes(ctx, 590, 1440, 700, 50, t, { rate: 10, seed: 3, on: open, speed: 340 });
  });

  plane(ctx, cam, 1.05, () => {
    tag(ctx, 720, 1640, P(t, tTiga - 0.05, 0.5), { big: '> 43 °C', small: 'BARU MENYALA', color: '#FF7A6A', glowRgb: C.redRgb, size: 100 });
    ringBurst(ctx, 930, 960, P(t, tTiga, 0.8), { color: C.redRgb, r: 300 });
    shock(ctx, 930, 960, P(t, tTiga - 0.04, 0.9), { r: 560, rgb: C.redRgb, lines: 20, seed: 24 });
    streaks(ctx, 930, 960, P(t, tTiga - 0.04, 0.6), { n: 20, r: 460, rgb: '255,150,110', seed: 25 });
    hit(t, tTiga - 0.04, 1);
  });
  chip(ctx, 'AMBANG PANAS YANG MENYAKITKAN', 720, 1530, eo(P(t, tDerajat + 0.1, 0.4)), { color: '#FF9A8A', size: 28 });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.5 * x;
    ctx.translate(720, 1180);
    ctx.scale(k, k);
    ctx.translate(-720, -1180);
    dock(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 1000);
    c.scale(k, k);
    c.translate(-720, -1000);
    threshold(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
