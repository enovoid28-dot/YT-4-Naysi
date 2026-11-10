import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { glowSpot, wallClock, tag, applyGrain, P } from './_ep6.mjs';

// 06 — JAM TUBUH. Two clocks on the same wall: the one you can read, and the
// one your cells keep. Same morning, 1,7 hours apart.
const LY = 846;
const R = 256;
const LX = 424;
const RX = 1016;
const SHIFT = 1.7;

const SAT = [9 * 60 + 12, 9 * 60 + 12 + SHIFT * 60];
const MON = [6 * 60 + 30, 6 * 60 + 30 - SHIFT * 60];

const hhOf = (m) => Math.floor((((m % 1440) + 1440) % 1440) / 60);
const mmOf = (m) => Math.round((((m % 1440) + 1440) % 1440) % 60);
function hm(min) {
  return `${String(hhOf(min)).padStart(2, '0')}.${String(mmOf(min)).padStart(2, '0')}`;
}

export default {
  draw(ctx, t) {
    // the wall
    ctx.fillStyle = linGrad(ctx, 0, 0, W * 0.4, H, [
      [0, '#15100D'], [0.45, '#1C1512'], [1, '#0A0706'],
    ]);
    ctx.fillRect(0, 0, W, H);
    glowSpot(ctx, W * 0.18, 600, 900, P.amber, 0.13);

    const inA = EASE.outCubic(clamp((t - 0.1) / 0.6));

    // day label
    const toMon = EASE.outCubic(clamp((t - 10.9) / 0.8));
    const dayA = clamp(inA);
    txt(ctx, 'SABTU', W / 2, 316, {
      size: 30, font: F.mono6, color: hexA('#F2E7D3', 0.5 * dayA * (1 - toMon)),
      align: 'center', track: 10,
    });
    txt(ctx, 'SENIN', W / 2, 316, {
      size: 30, font: F.mono6, color: hexA(P.red, 0.85 * toMon),
      align: 'center', track: 10,
    });

    // hands travel from Saturday to Monday
    const p = toMon;
    const wallMin = lerp(SAT[0], MON[0], p);
    const bodyMin = lerp(SAT[1], MON[1], p);
    const wallH = hhOf(wallMin) + mmOf(wallMin) / 60;
    const wallM = mmOf(wallMin);
    const bodyH = hhOf(bodyMin) + mmOf(bodyMin) / 60;
    const bodyM = mmOf(bodyMin);

    const cA = inA * clamp((t - 0.35) / 0.5);
    if (cA > 0.01) {
      wallClock(ctx, LX, LY, R, { hh: wallH, mm: wallM, a: cA, glow: 0.25 });
      wallClock(ctx, RX, LY, R, {
        hh: bodyH, mm: bodyM, a: cA, face: '#E9DFC7', accent: P.teal, rim: ['#3F6A66', '#1E5F5B', '#123634'], glow: 0.55,
      });
    }

    // the two readings
    const tA = clamp((t - 1.1) / 0.5);
    if (tA > 0.01) {
      const lw = hm(wallMin);
      const lb = hm(bodyMin);
      ctx.save();
      ctx.globalAlpha = tA;
      txt(ctx, lw, LX, 1218, {
        size: 58, font: F.num6, color: hexA('#F2E7D3', 0.94), align: 'center', track: 1,
      });
      txt(ctx, 'JAM DINDING', LX, 1262, {
        size: 22, font: F.mono6, color: hexA('#F2E7D3', 0.42), align: 'center', track: 5,
      });
      txt(ctx, lb, RX, 1218, {
        size: 58, font: F.num6, color: hexA(P.tealHi, 0.96), align: 'center', track: 1,
      });
      txt(ctx, 'JAM TUBUH', RX, 1262, {
        size: 22, font: F.mono6, color: hexA(P.tealHi, 0.55), align: 'center', track: 5,
      });
      ctx.restore();
    }

    // the gap between them, measured above the dials
    const gA = clamp((t - 2.0) / 0.5);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      const y = 548;
      ctx.strokeStyle = hexA('#F2E7D3', 0.26);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(LX, y);
      ctx.lineTo(RX, y);
      ctx.stroke();
      [[LX, 1], [RX, -1]].forEach(([x, d]) => {
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x + d * 14, y);
        ctx.lineTo(x, y + 10);
        ctx.stroke();
      });
      txt(ctx, '+1,7 JAM', W / 2, y - 30, {
        size: 32, font: F.mono6, color: P.amber, align: 'center', track: 4,
      });
      ctx.restore();
    }

    // Monday: the alarm went off, the body did not
    const mA = toMon;
    if (mA > 0.01) {
      ctx.save();
      ctx.globalAlpha = mA;
      ctx.translate(0, (1 - mA) * 20);
      txt(ctx, 'ALARM 06.30', W / 2, 1372, {
        size: 24, font: F.mono6, color: hexA('#F2E7D3', 0.45), align: 'center', track: 5,
      });
      const tw = measure(ctx, 'TUBUH BARU 04.48', 36, F.mono6, 4);
      fillRR(ctx, W / 2 - (tw + 64) / 2, 1406, tw + 64, 80, 40, hexA(P.red, 0.14));
      strokeRR(ctx, W / 2 - (tw + 64) / 2, 1406, tw + 64, 80, 40, hexA(P.red, 0.55), 2);
      txt(ctx, 'TUBUH BARU 04.48', W / 2, 1458, {
        size: 36, font: F.mono6, color: hexA(P.red, 0.95), align: 'center', track: 4,
      });
      ctx.restore();
    }

    void tag; void H; void C; void M;
    applyGrain(ctx, 0.06);
  },
};
