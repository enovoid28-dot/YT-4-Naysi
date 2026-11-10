import { W, H, C, M, txt, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { nightRoom, darkKicker, glowSpot, applyGrain, P } from './_ep5.mjs';
import { digitalClock, plate, softSeat, priceTag } from './_props.mjs';

// 02 — SALAH TUDUH. A bedside table at 23.47: the two things blamed for the
// hunger get stamped out, the clock is what is left on the table.
function crossedTag(ctx, x, y, label, at, t) {
  const a = EASE.outCubic(clamp((t - 0.15) / 0.5));
  const st = EASE.outCubic(clamp((t - at) / 0.4));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y);
  ctx.rotate(-0.03);
  // tag
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  fillRR(ctx, 0, 0, 320, 84, 4, '#EFE3C6');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 84, [
    [0, 'rgba(255,255,255,0.35)'], [1, 'rgba(120,92,56,0.20)'],
  ]);
  fillRR(ctx, 0, 0, 320, 84, 4, ctx.fillStyle);
  txt(ctx, label, 22, 55, {
    size: 30, font: F.mono6, color: 'rgba(23,19,16,0.72)', track: 4,
  });
  // red cross
  if (st > 0.01) {
    ctx.save();
    ctx.strokeStyle = P.red;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.globalAlpha = a * st;
    const L = 300 * st;
    ctx.beginPath();
    ctx.moveTo(12, 20);
    ctx.lineTo(12 + L, 20 + 44 * st);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 66);
    ctx.lineTo(12 + L, 66 - 44 * st);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export default {
  draw(ctx, t) {
    nightRoom(ctx, { tableY: 1400, warm: 0.18 });
    // lamp pool on the wall
    glowSpot(ctx, W * 0.78, 780, 620, P.amber, 0.30);

    darkKicker(ctx, 'MEJA SAMPING TEMPAT TIDUR', { y: 292 });

    // the wall keeps a little texture, and the tape that names the culprit
    ctx.fillStyle = 'rgba(255,214,160,0.05)';
    ctx.fillRect(0, 1140, W, 3);

    // ---- clock -----------------------------------------------------------
    const cA = EASE.outCubic(clamp((t - 0.1) / 0.6));
    const late = t > 4.6;
    const time = late ? '04.30' : '23.47';
    ctx.save();
    ctx.globalAlpha = cA;
    softSeat(ctx, W / 2 + 10, 1342, 360, 0.6);
    digitalClock(ctx, 300, 952, 840, 390, time, {
      small: late ? 'EMPAT JAM TIDUR' : 'MASIH TERJAGA',
      on: late ? 1 : 0.92,
    });
    ctx.restore();

    // ---- water glass -----------------------------------------------------
    ctx.save();
    ctx.globalAlpha = cA * 0.9;
    softSeat(ctx, 1206, 1378, 90, 0.5);
    const gx = 1156;
    const gy = 1190;
    fillRR(ctx, gx, gy, 104, 186, 8, 'rgba(206,228,240,0.30)');
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(gx, gy, 104, 186, 8);
    else ctx.rect(gx, gy, 104, 186);
    ctx.clip();
    ctx.fillStyle = 'rgba(150,196,224,0.55)';
    ctx.fillRect(gx, gy + 62, 104, 124);
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.fillRect(gx + 14, gy + 10, 10, 160);
    ctx.restore();
    ctx.strokeStyle = 'rgba(226,244,252,0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(gx, gy, 104, 186, 8);
    else ctx.rect(gx, gy, 104, 186);
    ctx.stroke();
    ctx.restore();

    // ---- the two blamed tags, then the empty plate -----------------------
    crossedTag(ctx, 96, 1492, 'NIAT', 1.5, t);
    crossedTag(ctx, 96, 1612, 'GULA DARAH', 2.9, t);

    const pA = EASE.outCubic(clamp((t - 6.6) / 0.6));
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      plate(ctx, 1080, 1640, 196, { a: pA });
      // crumbs
      ctx.fillStyle = 'rgba(126,96,58,0.85)';
      [[1040, 1632], [1070, 1646], [1106, 1636], [1130, 1650]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, 5, 3.4, 0.4, 0, TAU);
        ctx.fill();
      });
      ctx.restore();
    }

    // ---- the answer that is left on the table ---------------------------
    const aA = EASE.outCubic(clamp((t - 5.1) / 0.6));
    if (aA > 0.01) {
      ctx.save();
      ctx.globalAlpha = aA * 0.95;
      ctx.translate(W / 2, 470);
      ctx.rotate(-0.012);
      const label = 'YANG KURANG BUKAN NIAT';
      const tw = measure(ctx, label, 30, F.mono6, 6);
      ctx.fillStyle = 'rgba(233,220,190,0.90)';
      ctx.fillRect(-tw / 2 - 34, -46, tw + 68, 92);
      ctx.fillStyle = 'rgba(255,255,255,0.20)';
      ctx.fillRect(-tw / 2 - 34, -46, tw + 68, 3);
      txt(ctx, label, 0, 12, {
        size: 30, font: F.mono6, color: 'rgba(30,24,18,0.86)', align: 'center', track: 6,
      });
      ctx.strokeStyle = P.red;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-tw / 2, 34);
      ctx.lineTo(-tw / 2 + tw * aA, 32);
      ctx.stroke();
      ctx.restore();
    }

    void priceTag;
    applyGrain(ctx, 0.055);
  },
};
