import { clamp, lerp } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';
import { txt } from '../engine/draw.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, chip, ringBurst } from './_bulan.mjs';
import { tag } from './_lab.mjs';
import { monoFx, hud, panel, shock } from './_fx.mjs';
import { hit } from '../engine/look.mjs';
import { C, P, eo, io, layer, garden, micro, plant, chili, bird, rat, levelMeter, bilayer, channel, ions, capsa, spikes } from './_cabai.mjs';

// 07 — BURUNG
// Card 0: a bulbul on a chili plant at dusk pecks a rawit and swallows it,
// unbothered; on "tidak merasakan pedas" the level meter stays at zero.
// Card 1: two heat sensors side by side. The mammal's opens for capsaicin and
// fires; the bird's stays shut — the molecule bounces off — and its trace
// stays flat on "tidak bereaksi". Real heat still reaches it.

const PL = { x: 560, y: 1420, s: 300 };

function perch(ctx, t, scene, cam) {
  const tAneh = wordT(scene, 0, 0);
  const tBurung = wordT(scene, 0, 1);
  const tTidak = wordT(scene, 0, 4);
  const tPedas = wordT(scene, 0, 6);
  garden(ctx, t, cam, { sun: [1100, 560] });

  // peck the fruit off at the start, hold it, gulp it on "burung"
  const tPeck = Math.max(0.15, tAneh - 0.25);
  const peck = Math.sin(clamp((t - tPeck) / 0.5) * Math.PI);
  const tGulp = tBurung - 0.05;
  const gulp = Math.sin(clamp((t - tGulp) / 0.45) * Math.PI);
  const off = t > tPeck + 0.25;
  const swallowed = t > tGulp + 0.2;
  // a soft ground
  ctx.save();
  const gg = ctx.createLinearGradient(0, PL.y - 30, 0, PL.y + 200);
  gg.addColorStop(0, 'rgba(30,24,14,0)');
  gg.addColorStop(0.25, 'rgba(30,24,14,0.85)');
  gg.addColorStop(1, 'rgba(14,10,6,0.95)');
  ctx.fillStyle = gg;
  ctx.fillRect(0, PL.y - 30, 1440, 400);
  ctx.restore();
  let fruits = [];
  plane(ctx, cam, 0.95, () => {
    fruits = plant(ctx, PL.x, PL.y, PL.s, { t, fruits: 5, taken: off ? 1 : -1, seed: 7 });
  });
  const f1 = fruits[1] || [805, 887];
  const k = 2.3;
  const bx = f1[0] + 240;
  const by = f1[1] - 70;
  plane(ctx, cam, 0.95, () => {
    // the twig it stands on
    ctx.save();
    ctx.strokeStyle = '#4E7A32';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(f1[0] - 30, f1[1] + 60);
    ctx.quadraticCurveTo(bx - 60, by + 120, bx + 150, by + 84);
    ctx.stroke();
    ctx.restore();
    bird(ctx, bx, by, k * 100, { t, flip: true, peck: peck * 0.9, gulp });
    // the fruit in the beak until it is swallowed
    if (off && !swallowed) {
      const tip = [bx - 84 * k, by - 22 * k + gulp * 8];
      const sh = 1 - 0.7 * clamp((t - tGulp) / 0.2);
      chili(ctx, tip[0] + 12, tip[1], 150 * sh, { rot: Math.PI + 0.35, bend: 0.1, w: 0.2, shadow: 0 });
    }
  });

  plane(ctx, cam, 1.12, () => {
    txt(ctx, '?!', 1250, 620, { size: 130, font: F.fig8, color: C.emberHi, align: 'center', alpha: eo(P(t, tAneh - 0.05, 0.35)) * (1 - eo(P(t, tTidak - 0.3, 0.3))) });
    const q = eo(P(t, tTidak - 0.15, 0.45));
    panel(ctx, 200, 1440, 1040, 190, t, q, { rgb: '120,220,160', fill: 0.5, trace: 0.6 });
    monoFx(ctx, 'LEVEL PEDAS YANG DIRASAKAN BURUNG', 250, 1502, P(t, tTidak - 0.1, 0.8), t, { size: 27, color: C.mint, track: 2, a: q, seed: 21 });
    levelMeter(ctx, 620, 1572, 720, 0, { p: q });
    txt(ctx, '0', 1140, 1604, { size: 96, font: F.fig8, color: C.mint, align: 'center', alpha: eo(P(t, tPedas - 0.1, 0.35)) });
    ringBurst(ctx, 1140, 1570, P(t, tPedas - 0.05, 0.7), { color: C.mintRgb, r: 160 });
    shock(ctx, 1140, 1570, P(t, tPedas - 0.08, 0.7), { r: 300, rgb: C.mintRgb, lines: 12, seed: 61 });
  });
  hit(t, tPedas - 0.08, 0.6);
  // field notes on the bird
  plane(ctx, cam, 1.08, () => {
    hud(ctx, bx + 40, by - 150, 1360, 330, P(t, tBurung + 0.1, 0.8), t, { label: 'CUCAK KUTILANG', sub: 'PYCNONOTUS AURIGASTER', rgb: '255,226,160', seed: 22 });
  });
}

function sensors(ctx, t, scene, cam) {
  const tSensor = wordT(scene, 1, 0);
  const tTidak = wordT(scene, 1, 3);
  const tReaksi = wordT(scene, 1, 4);
  const tKaps = wordT(scene, 1, 6);
  micro(ctx, t, cam, { rgb: '60,130,120', warm: 1 });
  const y = 1010;
  const s = 220;
  const L = 380;
  const R = 1060;
  const appear = eo(P(t, tSensor - 0.3, 0.5));
  // mammal: docks and opens
  const dk = io(P(t, tSensor + 0.1, 0.6));
  const openL = eo(P(t, tSensor + 0.6, 0.4));
  // bird: approaches, bounces off
  const ap = clamp((t - (tSensor + 0.1)) / 0.6);
  const bounce = t > tSensor + 0.7 ? eo(P(t, tSensor + 0.7, 0.8)) : 0;

  plane(ctx, cam, 1.0, () => {
    ctx.save();
    ctx.globalAlpha *= appear;
    bilayer(ctx, 40, 710, y, t, { gap: [L - s * 0.75, L + s * 0.75], s: 0.95 });
    bilayer(ctx, 730, 1400, y, t, { gap: [R - s * 0.75, R + s * 0.75], s: 0.95 });
    channel(ctx, L, y, s, openL, t, { glow: openL, label: '' });
    ions(ctx, L, y, s, t, openL);
    channel(ctx, R, y, s, 0, t, { glow: 0, label: '', deaf: 1 });
    ctx.restore();
    const pxL = L - (s * 0.1) / 2 - s * 0.21 - s * 0.075;
    capsa(ctx, lerp(L - 160, pxL, dk), lerp(y - 470, y - s * 0.15, dk), 30, { a: appear, glow: 1 + openL });
    const pxR = R - (s * 0.1) / 2 - s * 0.21 - s * 0.075;
    const bxR = lerp(R - 160, pxR, io(ap)) - bounce * 170;
    const byR = lerp(y - 470, y - s * 0.15, io(ap)) - Math.sin(bounce * Math.PI) * 130 - bounce * 130;
    capsa(ctx, bxR, byR, 30, { a: appear * (1 - 0.4 * bounce), rot: bounce * 4 });
    // the bounce mark
    const bq = P(t, tSensor + 0.7, 0.5);
    if (bq > 0 && bq < 1) ringBurst(ctx, pxR, y - s * 0.15, bq, { color: '200,210,220', r: 90 });
  });

  plane(ctx, cam, 1.08, () => {
    rat(ctx, L, 560, 190, { t, chew: 0.3, a: appear });
    bird(ctx, R + 20, 540, 190, { t, a: appear });
    mono(ctx, 'MAMALIA', L, 700, { size: 30, color: 'rgba(232,226,214,0.8)', align: 'center', track: 6, a: appear });
    mono(ctx, 'BURUNG', R, 700, { size: 30, color: 'rgba(232,226,214,0.8)', align: 'center', track: 6, a: appear });
    // traces
    const tq = eo(P(t, tSensor, 0.5));
    panel(ctx, 70, 1250, 620, 210, t, tq, { rgb: '255,210,74', fill: 0.5, trace: 0.8 });
    panel(ctx, 750, 1250, 620, 210, t, tq, { rgb: '180,196,210', fill: 0.5, trace: 0.15 });
    spikes(ctx, 100, 1380, 560, 56, t, { rate: 10, seed: 5, on: openL });
    spikes(ctx, 780, 1380, 560, 56, t, { rate: 10, seed: 5, on: 0, rgb: '180,190,200' });
    monoFx(ctx, 'BEREAKSI', 110, 1308, tq, t, { size: 28, color: C.nerve, track: 5, seed: 23 });
    monoFx(ctx, 'TIDAK BEREAKSI', 790, 1308, P(t, tTidak - 0.15, 0.6), t, { size: 28, color: 'rgba(210,220,230,0.92)', track: 5, seed: 24 });
    ringBurst(ctx, R, y, P(t, tReaksi - 0.05, 0.7), { color: '200,210,220', r: 240 });
    shock(ctx, R, y, P(t, tReaksi - 0.08, 0.7), { r: 360, rgb: '200,214,230', lines: 14, seed: 62 });
    hit(t, tReaksi - 0.08, 0.55);
  });

  plane(ctx, cam, 1.05, () => {
    tag(ctx, 720, 1660, P(t, tKaps - 0.2, 0.5), { big: 'KEBAL', small: 'KAPSAISIN', color: C.mint, glowRgb: C.mintRgb, size: 100 });
  });
  chip(ctx, 'PANAS API TETAP TERASA', 720, 1545, eo(P(t, tKaps + 0.3, 0.45)), { color: C.mint, size: 28 });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.5 * x;
    ctx.translate(900, 900);
    ctx.scale(k, k);
    ctx.translate(-900, -900);
    perch(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 1000);
    c.scale(k, k);
    c.translate(-720, -1000);
    sensors(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
