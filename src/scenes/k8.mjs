import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { paperRoom, paperKicker, stamp, applyGrain, P, Q } from './_ep7.mjs';

// 08 — KELUAR. Two fixes, side by side: piped water that actually arrives, and
// boreholes that stop. Then the line the whole video was building to.
const FLOOR = 1230;

function tap(ctx, x, y, s, o = {}) {
  const { a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  const brass = linGrad(ctx, -80, 0, 60, 0, [[0, '#B9AE94'], [0.5, '#E4D9BE'], [1, '#A79A80']]);
  // wall pipe
  ctx.fillStyle = brass;
  fillRR(ctx, -230, -58, 170, 40, 12, brass);
  ctx.fillStyle = '#8E836B';
  fillRR(ctx, -232, -74, 22, 72, 8, ctx.fillStyle);
  // valve body
  ctx.fillStyle = brass;
  fillRR(ctx, -74, -104, 116, 148, 18, brass);
  // bonnet
  fillRR(ctx, -52, -176, 72, 86, 14, brass);
  // handle bar
  ctx.fillStyle = Q.rust;
  fillRR(ctx, -96, -196, 160, 26, 13, ctx.fillStyle);
  fillRR(ctx, -20, -230, 104, 40, 20, ctx.fillStyle);
  // spout arm + leg
  ctx.fillStyle = brass;
  fillRR(ctx, 26, -34, 76, 46, 14, brass);
  fillRR(ctx, 62, 4, 46, 88, 12, brass);
  // nozzle
  ctx.fillStyle = '#9C9280';
  fillRR(ctx, 54, 84, 62, 24, 9, ctx.fillStyle);
  ctx.fillStyle = 'rgba(20,17,16,0.35)';
  fillRR(ctx, 66, 104, 38, 10, 5, ctx.fillStyle);
  ctx.restore();
}

function glass(ctx, x, y, w, h, level, o = {}) {
  const { a = 1, t = 0 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - 10, y + h);
  ctx.lineTo(x + 10, y + h);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fill();
  // water
  const lh = (h - 18) * level;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 4);
  ctx.lineTo(x + w - 2, y + 4);
  ctx.lineTo(x + w - 11, y + h - 12);
  ctx.lineTo(x + 11, y + h - 12);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, y + h - lh, 0, y + h, [[0, 'rgba(80,160,178,0.75)'], [1, 'rgba(32,96,112,0.85)']]);
  ctx.fillRect(x, y + h - 12 - lh, w, lh + 12);
  ctx.strokeStyle = 'rgba(230,248,252,0.8)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + h - 12 - lh);
  ctx.lineTo(x + w - 6, y + h - 12 - lh);
  ctx.stroke();
  ctx.restore();
  // outline
  ctx.strokeStyle = 'rgba(24,20,17,0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - 10, y + h);
  ctx.lineTo(x + 10, y + h);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export default {
  draw(ctx, t) {
    paperRoom(ctx);
    paperKicker(ctx, 'YANG BISA DIPERBAIKI', { y: 236 });

    // divider
    ctx.fillStyle = 'rgba(20,17,16,0.14)';
    ctx.fillRect(716, 470, 2, 760);
    ctx.fillStyle = Q.rust;
    ctx.fillRect(716, 470, 2, 0);

    // LEFT: piped water
    const lA = EASE.outCubic(clamp((t - 0.2) / 0.8));
    ctx.save();
    ctx.globalAlpha = lA;
    tap(ctx, 300, 900, 1.0, { a: 1 });
    glass(ctx, 312, 1000, 190, 290, clamp((t - 0.9) / 2.2) * 0.86, {});
    // drips
    const dp = (t * 1.7) % 1;
    if (dp < 0.62) {
      ctx.fillStyle = 'rgba(80,160,178,0.9)';
      ctx.beginPath();
      ctx.ellipse(388, 1000 + dp * 120, 7, 11, 0, 0, TAU);
      ctx.fill();
    }
    txt(ctx, 'AIR PIPA', 96, 1330, {
      size: 40, font: F.num6, color: '#141110', track: 3,
    });
    txt(ctx, 'BARU 40% RUMAH', 98, 1382, {
      size: 22, font: F.mono6, color: 'rgba(20,17,16,0.55)', track: 4,
    });
    ctx.restore();

    // RIGHT: the borehole that has to stop
    const rA = EASE.outCubic(clamp((t - 1.0) / 0.8));
    ctx.save();
    ctx.globalAlpha = rA;
    const bx = 1050;
    ctx.fillStyle = linGrad(ctx, 0, 470, 0, FLOOR, [[0, '#C4A97F'], [1, '#8A7355']]);
    ctx.fillRect(760, 470, 680, FLOOR - 470);
    ctx.fillStyle = 'rgba(20,17,16,0.10)';
    for (let i = 1; i < 8; i++) ctx.fillRect(760, 470 + i * 92, 680, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(760, 470, 680, 3);
    // pipe
    ctx.fillStyle = '#D6D0C0';
    ctx.fillRect(bx - 26, 560, 52, FLOOR - 560);
    ctx.fillStyle = 'rgba(20,17,16,0.18)';
    ctx.fillRect(bx + 8, 560, 18, FLOOR - 560);
    // valve
    ctx.fillStyle = Q.rust;
    fillRR(ctx, bx - 66, 700, 132, 34, 8, ctx.fillStyle);
    fillRR(ctx, bx - 26, 648, 52, 140, 10, ctx.fillStyle);
    // the X: this one is closed
    ctx.strokeStyle = hexA(Q.rust, 0.95);
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(bx - 74, 640);
    ctx.lineTo(bx + 74, 790);
    ctx.moveTo(bx + 74, 640);
    ctx.lineTo(bx - 74, 790);
    ctx.stroke();
    txt(ctx, 'SUMUR BOR', 96 + 700, 1330, {
      size: 40, font: F.num6, color: Q.rust, track: 3,
    });
    txt(ctx, 'DITUTUP', 798, 1382, {
      size: 22, font: F.mono6, color: hexA(Q.rust, 0.75), track: 4,
    });
    ctx.restore();

    // the line
    const cA = EASE.outCubic(clamp((t - 7.4) / 0.9));
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      ctx.fillStyle = "rgba(246,240,226,1)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = Q.rust;
      ctx.fillRect(96, 620, 88 + (cA - 1) * 0, 8);
      txt(ctx, 'BERHENTI', 92, 840, {
        size: 154, font: F.num, color: '#141110', track: -4,
      });
      txt(ctx, 'MINUM', 92, 986, {
        size: 154, font: F.num, color: '#141110', track: -4,
      });
      txt(ctx, 'TANAHNYA', 92, 1132, {
        size: 154, font: F.num, color: Q.rust, track: -4,
      });
      txt(ctx, 'JAKARTA TIDAK BISA MENGGALI JALAN KELUAR', 96, 1220, {
        size: 21, font: F.mono6, color: 'rgba(20,17,16,0.55)', track: 3,
      });
      ctx.restore();
    }

    void C; void M; void lerp; void measure; void radGrad; void stamp; void P;
    applyGrain(ctx, 0.05);
  },
};
