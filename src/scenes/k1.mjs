import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, clockFace, mug, shadow, hairline } from './_ep3.mjs';

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#0C0F17', mid: '#080A10', bot: '#04050A' });

    // room light: warm lamp off-frame left, cool window right
    glowSpot(ctx, 120, 980, 980, C.amber, 0.11);
    glowSpot(ctx, 1280, 640, 760, C.sky, 0.055);

    /* ------------------------------------------------------------- desk -- */
    const deskY = 1468;
    const dg = linGrad(ctx, 0, deskY, 0, H, [
      [0, '#171310'], [0.25, '#100D0B'], [1, '#07060A'],
    ]);
    ctx.fillStyle = dg;
    ctx.fillRect(0, deskY, W, H - deskY);
    hairline(ctx, 0, deskY, W, deskY, { color: C.bone, alpha: 0.14, lw: 3 });
    // desk sheen
    const sh = linGrad(ctx, 0, deskY, W, deskY + 260, [
      [0, 'rgba(255,176,58,0.00)'], [0.35, 'rgba(255,176,58,0.05)'], [1, 'rgba(255,255,255,0)'],
    ]);
    ctx.fillStyle = sh;
    ctx.fillRect(0, deskY, W, 340);

    /* ------------------------------------------------------------ clock -- */
    const cA = EASE.outCubic(clamp((t - 0.2) / 0.9));
    const mins = 12 + clamp((t - 2.2) / 12) * 6;
    clockFace(ctx, 700, 618, 288 * lerp(0.93, 1, cA), {
      hours: 23, minutes: mins, alpha: cA,
      arc: { from: -Math.PI / 2 + (23 / 12) * TAU, to: -Math.PI / 2 + (23 / 12) * TAU + (8 / 12) * TAU },
    });

    // date plate under the clock
    const pA = clamp((t - 1.1) / 0.7);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA * 0.85;
      txt(ctx, 'SEKARANG', 700, 968, {
        size: 22, font: F.num6, color: hexA(C.bone, 0.42), align: 'center', track: 6,
      });
      txt(ctx, '23.12', 700, 1040, {
        size: 62, font: F.num, color: C.amberHi, align: 'center', track: 2,
        glowBlur: 28, glowColor: hexA(C.amber, 0.5),
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- mug -- */
    const mA = EASE.outCubic(clamp((t - 0.5) / 0.9));
    ctx.save();
    ctx.globalAlpha = mA;
    mug(ctx, 400, lerp(1584, 1552, mA), 0.9, {
      t: meta.t, steamAmt: 0.85, liquidA: 0.95,
    });
    ctx.restore();

    const tagA = clamp((t - 7.6) / 0.8);
    if (tagA > 0.01) {
      ctx.save();
      ctx.globalAlpha = tagA;
      hairline(ctx, 110, 1352, 110, 1262, { color: C.amber, alpha: 0.5, dash: [3, 9] });
      txt(ctx, 'DIPESAN 15.00', 110, 1236, {
        size: 23, font: F.num6, color: hexA(C.amber, 0.85), align: 'left', track: 5,
      });
      hairline(ctx, 110, 1352, 250, 1352, { color: C.amber, alpha: 0.5, dash: [3, 9] });
      ctx.restore();
    }

    /* ------------------------------------------------------------ phone -- */
    const phA = EASE.outCubic(clamp((t - 2.4) / 0.9));
    if (phA > 0.01) {
      const px = 962;
      const py = 1108 + (1 - phA) * 46;
      const pw = 268;
      const ph = 446;
      ctx.save();
      ctx.globalAlpha = phA;
      shadow(ctx, px + pw / 2, py + ph + 26, 150, 40, 0.55);

      // body
      fillRR(ctx, px, py, pw, ph, 34, '#0D1118');
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 34) : ctx.rect(px, py, pw, ph);
      ctx.stroke();

      // screen
      const sx = px + 14;
      const sy = py + 14;
      const sw = pw - 28;
      const shh = ph - 28;
      const sg = linGrad(ctx, sx, sy, sx, sy + shh, [
        [0, 'rgba(96,170,255,0.55)'], [0.55, 'rgba(44,96,170,0.32)'], [1, 'rgba(12,26,46,0.5)'],
      ]);
      fillRR(ctx, sx, sy, sw, shh, 24, '#101B2C');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(sx, sy, sw, shh, 24) : ctx.rect(sx, sy, sw, shh);
      ctx.fill();

      // screen content: clock + a couple of notification lines
      txt(ctx, '23.12', sx + sw / 2, sy + 150, {
        size: 58, font: F.num, color: C.bone, align: 'center',
        glowBlur: 26, glowColor: hexA(C.sky, 0.8),
      });
      txt(ctx, 'masih bangun', sx + sw / 2, sy + 196, {
        size: 20, font: F.num6, color: 'rgba(240,246,255,0.75)', align: 'center', track: 2,
      });
      for (let i = 0; i < 3; i++) {
        fillRR(ctx, sx + 26, sy + 246 + i * 44, sw - 52, 26, 13, 'rgba(220,235,255,0.16)');
      }
      ctx.restore();
    }
  },
};
