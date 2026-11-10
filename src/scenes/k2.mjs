import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, sky, stars, grain, kicker, chip, bracket, bigNumber } from './_kota.mjs';
import { G } from './_garam.mjs';

// 02 — DUA KOMA TUJUH. One stack, two sources. The bottom of the bar is what
// our own ponds give us; the top is what has to arrive by ship. Built upwards
// from a single baseline so the proportion is read, not explained.

const BASE = 1444;
const FULL = 1188;           // px for 4,8 juta ton
const NEED = 4.8;
const LOCAL = 2.04;
const IMPORT = 2.74;
const BAR_X = 812;
const BAR_W = 268;

const yOf = (v) => BASE - (v / NEED) * FULL;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    sky(ctx, { top: '#06080A', mid: '#0A1014', low: '#121C1E', horizon: BASE + 6, t });
    stars(ctx, { n: 60, seed: 9, t, bottom: BASE - 120, a: 0.35 });

    // baseline + grid ticks, 1 juta ton apart
    const bA = at(t, 0.1, 0.7);
    ctx.save();
    ctx.globalAlpha = bA;
    ctx.strokeStyle = 'rgba(251,246,236,0.10)';
    ctx.lineWidth = 1.5;
    for (let v = 1; v <= 4; v++) {
      const y = yOf(v);
      ctx.beginPath();
      ctx.moveTo(120, y);
      ctx.lineTo(W - 120, y);
      ctx.stroke();
      txt(ctx, String(v).replace('.', ','), 108, y + 8, {
        size: 20, font: F.mono, color: 'rgba(251,246,236,0.28)', align: 'right',
      });
    }
    ctx.fillStyle = 'rgba(251,246,236,0.5)';
    ctx.fillRect(120, BASE, W - 240, 2);
    ctx.restore();

    // ---- the bar: local production first, then the import stacked on top
    const a1 = at(t, 0.5, 1.2);
    const a2 = at(t, 2.5, 1.3);
    const hLocal = (LOCAL / NEED) * FULL * a1;
    const hImport = (IMPORT / NEED) * FULL * a2;

    if (hLocal > 1) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = G.salt;
      ctx.fillRect(BAR_X, BASE - hLocal, BAR_W, hLocal);
      ctx.restore();
      // contact tone
      const gg = linGrad(ctx, BAR_X, 0, BAR_X + BAR_W, 0, [[0, 'rgba(255,255,255,0.95)'], [0.6, 'rgba(240,232,216,0.95)'], [1, 'rgba(198,186,164,0.95)']]);
      ctx.fillStyle = gg;
      ctx.fillRect(BAR_X, BASE - hLocal, BAR_W, hLocal);
      // salt grain
      const r = rng(31);
      ctx.fillStyle = 'rgba(120,108,86,0.13)';
      for (let i = 0; i < 130; i++) ctx.fillRect(BAR_X + r() * BAR_W, BASE - r() * hLocal, 3, 3);
    }

    if (hImport > 1) {
      const top = BASE - hLocal - hImport;
      ctx.save();
      ctx.shadowColor = 'rgba(180,71,44,0.4)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = G.rust;
      ctx.fillRect(BAR_X, top, BAR_W, hImport);
      ctx.restore();
      const gg = linGrad(ctx, BAR_X, 0, BAR_X + BAR_W, 0, [[0, '#C9583A'], [0.55, G.rust], [1, G.rust2]]);
      ctx.fillStyle = gg;
      ctx.fillRect(BAR_X, top, BAR_W, hImport);
      // hatch marks, arrival by ship
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      for (let y = top + 12; y < BASE - hLocal; y += 26) {
        ctx.beginPath();
        ctx.moveTo(BAR_X, y);
        ctx.lineTo(BAR_X + BAR_W, y);
        ctx.stroke();
      }
      ctx.restore();
      // bracket + label
      const lA = at(t, 3.4, 0.8);
      if (lA > 0.01) {
        bracket(ctx, BAR_X + BAR_W + 40, top, BASE - hLocal, { label: '', color: hexA(G.rust, 0.9), a: lA });
        ctx.save();
        ctx.globalAlpha = lA;
        txt(ctx, 'IMPOR', BAR_X + BAR_W + 70, top + (BASE - hLocal - top) / 2 - 10, {
          size: 42, font: F.num6, color: '#EE9C7E',
        });
        txt(ctx, '57% DARI KEBUTUHAN', BAR_X + BAR_W + 70, top + (BASE - hLocal - top) / 2 + 36, {
          size: 21, font: F.mono6, color: 'rgba(238,156,126,0.8)', track: 3,
        });
        ctx.restore();
      }
    }

    if (hLocal > 1) {
      const lA = at(t, 1.6, 0.8);
      ctx.save();
      ctx.globalAlpha = lA;
      bracket(ctx, BAR_X + BAR_W + 54, BASE - hLocal, BASE, { label: '', color: 'rgba(251,246,236,0.6)', a: 1 });
      txt(ctx, 'PRODUKSI', BAR_X + BAR_W + 84, BASE - hLocal * 0.55, {
        size: 40, font: F.num6, color: G.bone,
      });
      txt(ctx, 'SENDIRI', BAR_X + BAR_W + 84, BASE - hLocal * 0.55 + 44, {
        size: 22, font: F.mono6, color: 'rgba(251,246,236,0.55)', track: 4,
      });
      ctx.restore();
    }

    // ---- left column: the three numbers, in order of appearance
    kicker(ctx, 'KEBUTUHAN GARAM NASIONAL', { x: 120, y: 268, a: at(t, 0.2, 0.6), color: G.sun });
    const n1 = at(t, 0.3, 1.0);
    bigNumber(ctx, '4,8', 120, 470, { size: 156, color: G.bone, a: n1 });
    txt(ctx, 'JUTA TON', 128, 522, { size: 24, font: F.mono6, color: 'rgba(251,246,236,0.5)', track: 6, alpha: at(t, 0.5, 0.6) });
    txt(ctx, 'kebutuhan 2024', 128, 566, { size: 30, font: F.body, color: 'rgba(251,246,236,0.55)', alpha: at(t, 0.8, 0.6) });

    const n2 = at(t, 2.6, 1.1);
    if (n2 > 0.01) {
      bigNumber(ctx, '2,74', 120, 800, { size: 132, color: '#EE9C7E', a: n2 });
      txt(ctx, 'IMPOR · 2024', 128, 852, { size: 24, font: F.mono6, color: hexA(G.rust, 0.95), track: 6, alpha: n2 });
      txt(ctx, '2,747 juta ton · US$125,9 juta', 128, 896, {
        size: 26, font: F.body, color: 'rgba(251,246,236,0.5)', alpha: n2,
      });
    }

    const n3 = at(t, 1.5, 1.0);
    if (n3 > 0.01) {
      // the seam between what we make and what we buy, called out on the bar
      const yb = BASE - hLocal;
      ctx.save();
      ctx.globalAlpha = n3;
      ctx.strokeStyle = 'rgba(251,246,236,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(560, yb);
      ctx.lineTo(BAR_X - 18, yb);
      ctx.stroke();
      txt(ctx, '2,04 juta ton', 560, yb - 22, {
        size: 30, font: F.num6, color: G.bone, track: -1,
      });
      ctx.restore();
    }

    grain(ctx, 0.045);
  },
};
