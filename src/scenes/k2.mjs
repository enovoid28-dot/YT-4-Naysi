import { W, H, txt, hexA, fillRR, strokeRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { K, E, at, layer, concrete, kicker, chip, grain, bracket } from './_kota.mjs';

// 02 — DUA PULUH LIMA. A two-and-a-half metre tape stands on today's floor.
// The floor of 2015 was at the top of that tape. The slice it loses every year
// is at the bottom, and it is exactly one door too tall for comfort.
const FLOOR = 1580;
const TAPE_X = 404;
const LEN = 1150;      // 250 cm at 460 px/m
const PXM = LEN / 250;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    concrete(ctx, -220, -220, W + 440, H + 440, { tone: '#8F8A7C', seed: 3 });
    // a soft key light from the upper left
    ctx.save();
    const g = ctx.createRadialGradient(280, 320, 40, 280, 320, 1200);
    g.addColorStop(0, 'rgba(255,238,206,0.20)');
    g.addColorStop(1, 'rgba(255,238,206,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // floor
    layer(ctx, cam, 0.2, () => {
      ctx.fillStyle = linGrad(ctx, 0, FLOOR, 0, H, [[0, '#6E6A5E'], [1, '#2E2C28']]);
      ctx.fillRect(-80, FLOOR, W + 160, H - FLOOR + 80);
      // contact shadows
      const sg = ctx.createLinearGradient(0, FLOOR - 90, 0, FLOOR + 30);
      sg.addColorStop(0, 'rgba(0,0,0,0)');
      sg.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = sg;
      ctx.fillRect(-80, FLOOR - 90, W + 160, 120);
      ctx.fillStyle = 'rgba(18,15,13,0.5)';
      ctx.fillRect(-80, FLOOR, W + 160, 5);
    });

    // the doorway, as a human scale reference: 2,1 m
    const dA = at(t, 0.15, 0.8);
    ctx.save();
    ctx.globalAlpha = dA;
    const dx = 892;
    const dw = 384;
    const dTop = 640;
    ctx.fillStyle = 'rgba(18,16,14,0.72)';
    ctx.fillRect(dx, dTop, dw, FLOOR - dTop);
    ctx.fillStyle = linGrad(ctx, 0, dTop, 0, dTop + 160, [[0, 'rgba(0,0,0,0.5)'], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(dx, dTop, dw, 160);
    ctx.fillStyle = linGrad(ctx, dx - 34, 0, dx, 0, [[0, '#DCD5C4'], [1, '#A8A192']]);
    ctx.fillRect(dx - 34, dTop - 34, 34, FLOOR - dTop + 34);
    ctx.fillStyle = linGrad(ctx, dx + dw, 0, dx + dw + 34, 0, [[0, '#A8A192'], [1, '#7E7869']]);
    ctx.fillRect(dx + dw, dTop - 34, 34, FLOOR - dTop + 34);
    ctx.fillStyle = linGrad(ctx, 0, dTop - 40, 0, dTop, [[0, '#E2DBC9'], [1, '#ADA697']]);
    ctx.fillRect(dx - 34, dTop - 40, dw + 68, 40);
    // 2,1 m bracket on the door
    const bA = at(t, 6.2, 0.8);
    if (bA > 0.01) {
      bracket(ctx, dx - 74, dTop, FLOOR, { label: '2,1 M', color: hexA('#F3ECDB', 0.9), a: bA, side: -1 });
      chip(ctx, 'PINTU RUMAH', dx + dw / 2, dTop - 96, {
        a: bA, ink: '#F6EFE0', bg: 'rgba(22,19,16,0.8)', size: 23, align: 'center',
      });
    }
    ctx.restore();

    // the tape: 250 cm, unwinding upward from the floor
    const tpA = at(t, 0.5, 0.9);
    if (tpA > 0.01) {
      const h = LEN * tpA;
      const y0 = FLOOR - h;
      ctx.save();
      ctx.globalAlpha = tpA;
      // blade
      ctx.fillStyle = linGrad(ctx, TAPE_X, 0, TAPE_X + 66, 0, [
        [0, '#F0D07A'], [0.42, '#E8BF54'], [1, '#B99230'],
      ]);
      ctx.fillRect(TAPE_X, y0, 66, h);
      ctx.fillStyle = 'rgba(20,17,16,0.18)';
      ctx.fillRect(TAPE_X + 54, y0, 12, h);
      // ticks every 10 cm, long every 50
      const ticks = clamp((t - 1.1) / 1.4);
      for (let cm = 0; cm <= 250; cm += 10) {
        const yy = FLOOR - cm * PXM;
        if (yy < y0 - 2) break;
        if (cm / 250 > ticks) break;
        const big = cm % 50 === 0;
        ctx.fillStyle = 'rgba(20,17,16,0.75)';
        ctx.fillRect(TAPE_X, yy - 2, big ? 38 : 20, big ? 4 : 3);
        if (big) {
          txt(ctx, String(cm), TAPE_X + 44, yy + 11, {
            size: 26, font: F.num6, color: 'rgba(24,18,12,0.85)',
          });
        }
      }
      // the 25 cm slice at the base
      const sA = at(t, 3.0, 0.7);
      if (sA > 0.01) {
        const sy = FLOOR - 25 * PXM;
        ctx.fillStyle = hexA(K.rust, 0.30);
        ctx.fillRect(TAPE_X + 66, sy, 250 * E.out(sA), FLOOR - sy);
        ctx.fillStyle = hexA(K.rust, 0.95);
        ctx.fillRect(TAPE_X + 66, sy - 4, 250 * E.out(sA), 6);
        // the slice slides out, as a block
        const out = at(t, 3.6, 1.0);
        if (out > 0.01) {
          const wy = FLOOR - 25 * PXM;
          ctx.save();
          ctx.globalAlpha = out;
          ctx.setLineDash([10, 8]);
          ctx.strokeStyle = hexA(K.rust, 0.55);
          ctx.lineWidth = 2;
          ctx.strokeRect(TAPE_X + 96, wy, 250, FLOOR - wy);
          ctx.setLineDash([]);
          ctx.fillStyle = linGrad(ctx, 0, wy, 0, FLOOR, [[0, '#D8704E'], [1, '#9E3E22']]);
          fillRR(ctx, TAPE_X + 96 + 40 * (1 - out), wy + (1 - out) * 30, 250, FLOOR - wy, 4, ctx.fillStyle);
          ctx.fillStyle = 'rgba(0,0,0,0.14)';
          for (let i = 1; i < 4; i++) ctx.fillRect(TAPE_X + 96, wy + ((FLOOR - wy) / 4) * i, 250, 3);
          ctx.restore();
        }
      }
      ctx.restore();
    }

    // the 2015 floor: where the tape top used to be
    const fA = at(t, 4.4, 0.8);
    if (fA > 0.01) {
      ctx.save();
      ctx.globalAlpha = fA;
      ctx.setLineDash([20, 14]);
      ctx.strokeStyle = 'rgba(240,233,215,0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(96, FLOOR - LEN);
      ctx.lineTo(TAPE_X + 340, FLOOR - LEN);
      ctx.stroke();
      ctx.setLineDash([]);
      chip(ctx, 'LANTAI · 2015', 96, FLOOR - LEN - 46, {
        a: fA, ink: '#F6EFE0', bg: 'rgba(22,19,16,0.78)', size: 23,
      });
      // 2,5 m bracket
      bracket(ctx, TAPE_X - 60, FLOOR - LEN, FLOOR, {
        label: '2,5 M', color: hexA('#F6EFE0', 0.85), a: fA, side: -1,
      });
      ctx.restore();
    }

    kicker(ctx, 'JAKARTA UTARA', { y: 250, a: at(t, 0.2, 0.8), ink: '#2A2320' });

    // the number that does the work
    const nA = at(t, 3.2, 0.7);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      txt(ctx, '25', 96, 1010 + (1 - nA) * 24, {
        size: 176, font: F.num, color: K.rust, track: -6,
      });
      txt(ctx, 'CM', 96 + measure(ctx, '25', 176, F.num, -6) + 16, 1010, {
        size: 76, font: F.num6, color: K.rust,
      });
      txt(ctx, 'SETIAP TAHUN', 100, 1070, {
        size: 24, font: F.mono6, color: 'rgba(28,22,18,0.62)', track: 5,
      });
      ctx.restore();
    }

    grain(ctx, 0.04);
  },
};
