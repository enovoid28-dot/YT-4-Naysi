import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip } from './_kota.mjs';
import { P } from './_padi.mjs';

// 03 — SELISIHNYA. Two lines almost on top of each other: what we grow and what
// we eat. The whole episode lives in the sliver between them.

const X0 = 200;
const X1 = W - 200;
const PROD = 30.34;
const CONS = 30.92;
const MAX = 32;
const PX = (v) => X0 + ((v - 28) / (MAX - 28)) * (X1 - X0);

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, P.paper);
    ctx.save();
    const g = radGrad(ctx, 720, 300, 60, 1100, [[0, 'rgba(255,251,240,0.95)'], [1, 'rgba(206,192,164,0)']]);
    ctx.fillStyle = g;
    ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.restore();

    kicker(ctx, 'PANEN vs KONSUMSI · 2024', { x: 96, y: 268, a: at(t, 0.2, 0.6), color: P.rust, ink: 'rgba(20,24,18,0.7)' });
    txt(ctx, 'juta ton', W - 96, 274, { size: 22, font: F.mono6, color: 'rgba(20,24,18,0.4)', track: 5, align: 'right', alpha: at(t, 0.4, 0.6) });

    // axis
    const axA = at(t, 0.2, 0.8);
    ctx.save();
    ctx.globalAlpha = axA;
    ctx.strokeStyle = 'rgba(20,24,18,0.14)';
    ctx.lineWidth = 1.5;
    for (let v = 28; v <= 32; v++) {
      const x = PX(v);
      ctx.beginPath();
      ctx.moveTo(x, 520);
      ctx.lineTo(x, 1560);
      ctx.stroke();
      txt(ctx, String(v), x, 1610, { size: 22, font: F.mono, color: 'rgba(20,24,18,0.4)', align: 'center' });
    }
    ctx.restore();

    // production line
    const pA = at(t, 0.5, 1.2);
    const pEnd = PX(lerp(28, PROD, E.out(pA)));
    ctx.save();
    ctx.globalAlpha = clamp(pA * 2);
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(X0, 780);
    ctx.lineTo(pEnd, 780);
    ctx.stroke();
    ctx.fillStyle = P.ink;
    ctx.beginPath();
    ctx.arc(pEnd, 780, 13, 0, TAU);
    ctx.fill();
    ctx.restore();
    txt(ctx, 'PRODUKSI', 96, 700, { size: 24, font: F.mono6, color: 'rgba(20,24,18,0.6)', track: 5, alpha: at(t, 0.5, 0.6) });
    txt(ctx, '30,3', 96, 646, { size: 76, font: F.num, color: P.ink, track: -2, alpha: at(t, 0.7, 0.8) });

    // consumption line
    const cA = at(t, 2.0, 1.4);
    const cEnd = PX(lerp(28, CONS, E.out(cA)));
    ctx.save();
    ctx.globalAlpha = clamp(cA * 2);
    ctx.strokeStyle = P.rust;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(X0, 1080);
    ctx.lineTo(cEnd, 1080);
    ctx.stroke();
    ctx.fillStyle = P.rust;
    ctx.beginPath();
    ctx.arc(cEnd, 1080, 13, 0, TAU);
    ctx.fill();
    ctx.restore();
    txt(ctx, 'KONSUMSI', 96, 1000, { size: 24, font: F.mono6, color: hexA(P.rust, 0.9), track: 5, alpha: at(t, 2.0, 0.6) });
    txt(ctx, '30,9', 96, 946, { size: 76, font: F.num, color: P.rust, track: -2, alpha: at(t, 2.2, 0.8) });

    // the sliver between them
    const gA = at(t, 3.2, 1.0);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      const xa = PX(PROD);
      const xb = PX(CONS);
      ctx.fillStyle = 'rgba(180,71,44,0.18)';
      ctx.fillRect(xa, 740, xb - xa, 380);
      ctx.strokeStyle = hexA(P.rust, 0.8);
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(xa, 740);
      ctx.lineTo(xa, 1140);
      ctx.moveTo(xb, 740);
      ctx.lineTo(xb, 1140);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, 'DEFISIT', xb + 26, 940, { size: 24, font: F.mono6, color: P.rust, track: 5 });
      txt(ctx, '0,58', xb + 26, 1002, { size: 64, font: F.num, color: P.rust });
      txt(ctx, 'juta ton', xb + 30, 1044, { size: 22, font: F.mono6, color: 'rgba(20,24,18,0.5)', track: 4 });
      ctx.restore();
    }

    // the note: a five percent harvest shortfall is a national problem
    const nA = at(t, 5.2, 1.0);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      fillRR(ctx, 96, 1290, W - 192, 132, 6, 'rgba(20,24,18,0.06)');
      txt(ctx, 'Selisihnya cuma 2 persen dari panen — cukup untuk memaksa impor sejuta ton lebih.', 128, 1372, {
        size: 30, font: F.body, color: 'rgba(20,24,18,0.72)',
      });
      ctx.restore();
    }

    grain(ctx, 0.03);
  },
};
