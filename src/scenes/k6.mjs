import { W, H, txt, hexA, fillRR, strokeRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { K, E, at, layer, sky, stars, water, skyline, kicker, chip, grain, bracket } from './_kota.mjs';

// 06 — TEMBOK. A section through the sea wall. On the left the sea; on the
// right the city ground — which sits *below* the waterline and keeps dropping.
const SEA = 900;
const GROUND = 1230;
const WALL_L = 604;
const WALL_R = 856;
const TOP = 748;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    sky(ctx, { top: '#05080B', mid: '#0A1216', low: '#131F25', horizon: SEA, t });
    stars(ctx, { n: 40, seed: 23, t, bottom: 700, a: 0.28 });

    // the city behind the wall + its ground, which is sinking
    const sink = 46 * E.inOut(at(t, 6.2, 2.0));
    layer(ctx, cam, 0.3, () => {
      skyline(ctx, {
        x0: 700, x1: W + 40, base: GROUND + 8 + sink, hMin: 260, hMax: 560,
        seed: 44, lit: 0.36, body: '#16242B', win: '#FFC97C', gap: 26, glow: 1,
      });
      ctx.fillStyle = linGrad(ctx, 0, GROUND + sink, 0, H, [[0, '#6E6047'], [1, '#2E2820']]);
      ctx.fillRect(650, GROUND + sink, W - 650, H - GROUND - sink);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(650, GROUND + sink, W - 650, 5);
    });

    // the sea, only on the sea side of the wall
    layer(ctx, cam, 0.55, () => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, WALL_L + 40, H);
      ctx.clip();
      water(ctx, SEA, { t, h: H - SEA, calm: 1 });
      ctx.globalAlpha = 0.45;
      water(ctx, SEA + 18, { t: t * 1.4, h: H - SEA, calm: 0.6, alpha: 0.4 });
      ctx.restore();
    });

    // the wall
    const wA = at(t, 0.2, 1.0);
    ctx.save();
    ctx.globalAlpha = wA;
    ctx.beginPath();
    ctx.moveTo(WALL_L, TOP);
    ctx.lineTo(WALL_R, TOP);
    ctx.lineTo(WALL_R + 96, H + 40);
    ctx.lineTo(WALL_L - 70, H + 40);
    ctx.closePath();
    ctx.fillStyle = linGrad(ctx, WALL_L, 0, WALL_R, 0, [
      [0, '#C6C0AE'],
      [0.28, '#9C9686'],
      [0.6, '#7E7869'],
      [1, '#514D43'],
    ]);
    ctx.fill();
    // coping + walkway
    ctx.fillStyle = '#E0DAC8';
    fillRR(ctx, WALL_L - 22, TOP - 26, WALL_R - WALL_L + 44, 28, 6, ctx.fillStyle);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(WALL_L - 22, TOP + 2, WALL_R - WALL_L + 44, 6);
    // horizontal joints
    ctx.strokeStyle = 'rgba(18,15,13,0.2)';
    ctx.lineWidth = 3;
    for (let i = 1; i < 9; i++) {
      const y = TOP + i * 150;
      const k = (y - TOP) / (H + 40 - TOP);
      ctx.beginPath();
      ctx.moveTo(WALL_L - k * 70, y);
      ctx.lineTo(WALL_R + k * 96, y);
      ctx.stroke();
    }
    // wet band on the sea side
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(WALL_L, TOP);
    ctx.lineTo(WALL_L + 96, TOP);
    ctx.lineTo(WALL_L + 40, H);
    ctx.lineTo(WALL_L - 70, H);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = 'rgba(24,62,70,0.38)';
    ctx.fillRect(WALL_L - 90, SEA - 30, 240, H);
    ctx.fillStyle = 'rgba(120,190,200,0.16)';
    ctx.fillRect(WALL_L - 90, SEA - 30, 240, 8);
    ctx.restore();
    ctx.restore();

    // the waterline, drawn across the city: it is above their ground
    const lA = at(t, 1.4, 0.7);
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lA;
      ctx.setLineDash([20, 14]);
      ctx.strokeStyle = hexA(K.waterHi, 0.85);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(WALL_R + 60, SEA);
      ctx.lineTo(W, SEA);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, 'MUKA LAUT', 96, SEA - 24, {
        size: 21, font: F.mono6, color: hexA(K.waterHi, 0.9), track: 4,
      });
      ctx.restore();
    }

    kicker(ctx, 'TANGGUL LAUT', { y: 292, a: at(t, 0.2, 0.8) });

    // the wall is raised, every year
    const gA = at(t, 3.4, 0.9);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      bracket(ctx, WALL_R + 84, TOP, 430, { a: gA, color: hexA(K.amber, 0.75) });
      [[TOP, '2020'], [630, '2025'], [430, '2050']].forEach(([y, yr]) => {
        txt(ctx, yr, WALL_R + 112, y + 9, {
          size: 21, font: F.mono6, color: hexA(K.amber, 0.95),
        });
      });
      ctx.restore();
    }

    // 32 km
    const kA = at(t, 5.4, 0.8);
    if (kA > 0.01) {
      ctx.save();
      ctx.globalAlpha = kA;
      txt(ctx, '32', 96, 590 + (1 - kA) * 18, { size: 120, font: F.num, color: K.bone, track: -4 });
      txt(ctx, 'KM', 96 + measure(ctx, '32', 120, F.num, -4) + 14, 590, {
        size: 56, font: F.num6, color: K.bone,
      });
      txt(ctx, 'PANJANGNYA', 100, 634, {
        size: 21, font: F.mono6, color: 'rgba(246,239,224,0.5)', track: 5,
      });
      ctx.restore();
    }

    // the ground keeps going down behind it
    const dA = at(t, 6.2, 1.0);
    if (dA > 0.01) {
      ctx.save();
      ctx.globalAlpha = dA;
      const x = 1130;
      const y0 = GROUND + 30 + sink;
      ctx.strokeStyle = hexA(K.rust, 0.92);
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y0 + 240);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 30, y0 + 202);
      ctx.lineTo(x + 30, y0 + 202);
      ctx.lineTo(x, y0 + 266);
      ctx.closePath();
      ctx.fillStyle = hexA(K.rust, 0.92);
      ctx.fill();
      chip(ctx, '25 CM TIAP TAHUN', x - 30, y0 + 122, {
        a: dA, ink: '#F0B49E', bg: 'rgba(6,10,12,0.78)', border: hexA(K.rust, 0.45), size: 22, align: 'right',
      });
      ctx.restore();
    }

    grain(ctx, 0.05);
  },
};
