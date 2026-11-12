import { W, H, txt, hexA, linGrad, radGrad, fillRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, snow, bathyscaphe, snailfish, ruler, motes, drawRule } from './_ocean.mjs';

// 05 — ZONA HADAL. A trench is a crack in the planet. One small machine is
// falling down it, and the last fish in the world lives at the bottom.

function wall(ctx, side, t) {
  const x0 = side < 0 ? -60 : W + 60;
  const pts = [
    [x0, -80],
    [x0 - side * (side < 0 ? 300 : 250), -80],
    [x0 - side * (side < 0 ? 210 : 250), 620],
    [x0 - side * (side < 0 ? 150 : 300), 1180],
    [x0 - side * (side < 0 ? 240 : 200), 1760],
    [x0 - side * (side < 0 ? 120 : 260), 2600],
    [x0, 2600],
  ];
  // jitter the inner edge so it reads as rock, not a rectangle
  const r = rng(side < 0 ? 3 : 8);
  const edge = [];
  for (let i = 1; i <= 26; i++) {
    const u = i / 27;
    const y = -80 + u * 2680;
    const base = side < 0
      ? 300 - u * 120 + Math.sin(u * 5.5) * 60 + Math.sin(u * 13) * 22
      : 250 + u * 30 + Math.sin(u * 6) * 55 + Math.sin(u * 12) * 20;
    edge.push([x0 - side * (base + (r() - 0.5) * 26), y]);
  }
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, -80);
  for (const [px, py] of edge) ctx.lineTo(px, py);
  ctx.lineTo(x0, 2600);
  ctx.closePath();
  const g = linGrad(ctx, side < 0 ? 0 : W, 0, side < 0 ? 520 : W - 520, 0, [
    [0, '#0C2429'],
    [0.55, '#081920'],
    [1, '#040F14'],
  ]);
  ctx.fillStyle = g;
  ctx.fill();
  // the inner edge catches a rim of light
  ctx.strokeStyle = hexA(O.pale, 0.16);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  edge.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
  // a few strata lines following the wall
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 9; i++) {
    const u = (i + 1) / 10;
    ctx.beginPath();
    for (let k = 0; k <= 10; k++) {
      const v = k / 10;
      const px = x0 - side * (40 + v * (side < 0 ? 250 : 230));
      const py = -80 + (u + v * 0.04) * 2680;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = hexA(O.aqua, 0.10);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}

function walls(ctx, t) {
  wall(ctx, -1, t);
  wall(ctx, 1, t);
}

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    column(ctx, 0.98, { t, glowTop: 0.02 });
    layer(ctx, cam, 0.12, () => walls(ctx, t));
    snow(ctx, t, { n: 140, seed: 61, a: 0.28, speed: 9, scale: 1.1 });

    // the descent: 6 km down to 8,6 km across the scene
    const drop = EA.inOut(clamp((t - 0.6) / Math.max(4, scene.dur - 2.2)));
    const depthM = lerp(6000, 8600, drop);
    const subY = lerp(330, 1180, drop);
    const subX = W * 0.5 + Math.sin(t * 0.4) * 26;

    // trail of disturbed water above the machine
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 16; i++) {
      const u = i / 15;
      const yy = subY - 60 - u * 320;
      ctx.globalAlpha = (1 - u) * 0.18;
      ctx.fillStyle = hexA(O.glow, 0.5);
      ctx.beginPath();
      ctx.arc(subX + Math.sin(t * 0.9 + i) * (6 + u * 22), yy, 2 + u * 5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    layer(ctx, cam, 0.4, () => {
      bathyscaphe(ctx, subX, subY, 0.8, { t, a: 1, lamp: 1, window: 1 });
    });
    motes(ctx, subX, subY + 80, 260, { t, a: 0.30, n: 24, seed: 14 });

    // the last fish, waiting near the bottom
    const fishA = at(t, 3.6, 1.6);
    if (fishA > 0.01) {
      const fy = 1230 + Math.sin(t * 0.7) * 10;
      snailfish(ctx, 900 + Math.sin(t * 0.33) * 60, fy, 1.0, {
        t, a: fishA * 0.8, flip: Math.sin(t * 0.33) > 0 ? 1 : 0,
      });
      ctx.save();
      ctx.globalAlpha = fishA * 0.7;
      drawRule(ctx, 620, 620 + 220 * fishA, fy - 90, 1, { color: O.glow, a: 0.5 });
      tracking(ctx, 'IKAN TERDALAM · 8.300 M', 620, fy - 108, {
        size: 18, font: F.mono6, track: 4, color: hexA(O.glow, 0.75),
      });
      ctx.restore();
    }

    ruler(ctx, W - 250, {
      y0: 330, y1: 1420, max: 11000, cur: depthM, a: at(t, 0.4, 0.8), ticks: 11, label: '',
    });

    const q = at(t, 1.0, 0.8);
    ctx.save();
    ctx.globalAlpha = q;
    txt(ctx, '6.000', 132, 470, { size: 118, font: F.num, color: O.bone, track: -4 });
    tracking(ctx, 'METER · ZONA HADAL', 138, 514, { size: 20, font: F.mono6, track: 5, color: hexA(O.pale, 0.5) });
    ctx.restore();

    chip(ctx, 'TEKANAN 600 BAR', 132, 620, {
      a: at(t, 2.2, 0.7) * 0.9, bg: 'rgba(3,12,16,0.7)', ink: hexA(O.bone, 0.85),
      border: hexA(O.aqua, 0.22), size: 20, track: 3,
    });

    kicker(ctx, 'SAMUDRA · ZONA HADAL', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
