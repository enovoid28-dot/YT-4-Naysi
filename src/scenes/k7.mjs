import { W, H, txt, hexA, fillRR, strokeRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip, bracket } from './_kota.mjs';
import { G } from './_garam.mjs';

// 07 — 2025. The wall of the year, seen as a bar that did not get built. The
// target is a ghost rectangle; the harvest fills less than half of it. The rest
// of the year's salt comes in on the same ships as before.

const BASE = 1502;
const TARGET = 2.25;
const REAL = 1.035;
const FULL = 940;
const TX = 300;
const BW = 300;
const hOf = (v) => (v / TARGET) * FULL;
const RX = TX + BW + 160;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, G.paper);
    // sun-bleached ground
    ctx.save();
    const g = linGrad(ctx, 0, 200, 0, H, [[0, 'rgba(255,247,232,0.9)'], [1, 'rgba(206,192,167,0.55)']]);
    ctx.fillStyle = g;
    ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.restore();

    kicker(ctx, 'PRODUKSI GARAM NASIONAL', { x: 96, y: 262, a: at(t, 0.15, 0.6), color: G.rust, ink: 'rgba(20,15,12,0.7)' });
    txt(ctx, '2 0 2 5', W - 96, 268, { size: 30, font: F.mono6, color: 'rgba(20,15,12,0.4)', track: 8, align: 'right' });

    // baseline
    const bA = at(t, 0.2, 0.7);
    ctx.save();
    ctx.globalAlpha = bA;
    ctx.fillStyle = 'rgba(20,15,12,0.55)';
    ctx.fillRect(200, BASE, W - 400, 3);
    ctx.restore();

    // the target: an outline that never fills
    const tA = at(t, 0.4, 1.1);
    const th = hOf(TARGET) * tA;
    ctx.save();
    ctx.globalAlpha = tA;
    ctx.fillStyle = 'rgba(20,15,12,0.045)';
    ctx.fillRect(TX, BASE - th, BW, th);
    ctx.strokeStyle = 'rgba(20,15,12,0.5)';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    ctx.strokeRect(TX, BASE - th, BW, th);
    ctx.setLineDash([]);
    txt(ctx, 'TARGET', TX, BASE - th - 74, { size: 22, font: F.mono6, color: 'rgba(20,15,12,0.5)', track: 5 });
    txt(ctx, '2,25 juta', TX, BASE - th - 30, { size: 44, font: F.num6, color: 'rgba(20,15,12,0.55)' });
    ctx.restore();

    // the harvest: what actually arrived
    const rA = at(t, 1.4, 1.5);
    const rh = hOf(REAL) * rA;
    if (rh > 1) {
      ctx.save();
      const g2 = linGrad(ctx, RX, 0, RX + BW, 0, [[0, '#C9583A'], [0.5, G.rust], [1, G.rust2]]);
      ctx.fillStyle = g2;
      ctx.fillRect(RX, BASE - rh, BW, rh);
      // salt texture on top edge
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(RX, BASE - rh, BW, 6);
      ctx.restore();
      txt(ctx, 'REALISASI', RX, BASE - rh - 74, { size: 22, font: F.mono6, color: hexA(G.rust2, 0.9), track: 5 });
      txt(ctx, '1,035 juta', RX, BASE - rh - 30, { size: 44, font: F.num6, color: G.ink });
    }

    // the 2024 watermark, for the fall
    const wA = at(t, 2.6, 0.9);
    if (wA > 0.01) {
      const y = BASE - hOf(2.04);
      ctx.save();
      ctx.globalAlpha = wA * 0.75;
      ctx.strokeStyle = 'rgba(20,15,12,0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(200, y);
      ctx.lineTo(W - 200, y);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, '2024 · 2,04 juta', 200, y + 42, { size: 22, font: F.mono6, color: 'rgba(20,15,12,0.55)', track: 3 });
      ctx.restore();
    }

    // the percentage, over the empty part of the target
    const pA = at(t, 3.0, 1.0);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      const v = Math.round(lerp(0, 46, E.out(at(t, 3.0, 1.2))));
      txt(ctx, `${v}%`, 1058, 610, { size: 150, font: F.num, color: G.rust, track: -5 });
      txt(ctx, 'DARI TARGET', 1064, 662, { size: 24, font: F.mono6, color: G.ink, track: 6 });
      txt(ctx, 'turun 49% dari 2024', 1064, 706, { size: 27, font: F.body, color: 'rgba(20,15,12,0.55)' });
      ctx.restore();
    }

    // the import chip lands with the second sentence
    const cA = at(t, 5.0, 0.9);
    if (cA > 0.01) {
      chip(ctx, 'IMPOR TETAP 2,6 JUTA TON', 96, 1218, { a: cA, bg: 'rgba(20,15,12,0.88)', ink: G.bone, border: hexA(G.rust, 0.7) });
      ctx.save();
      ctx.globalAlpha = cA * 0.8;
      ctx.strokeStyle = hexA(G.rust, 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(96, 1250);
      ctx.lineTo(96, BASE + 26);
      ctx.stroke();
      ctx.restore();
    }

    grain(ctx, 0.03);
  },
};
