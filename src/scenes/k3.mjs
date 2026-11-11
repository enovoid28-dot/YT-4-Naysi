import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, sunDisc, bhDisc, rule, leader } from './_space.mjs';
import { at, layer, kicker, grain } from './_kota.mjs';

// 03 — MASSA YANG SAMA. A textbook figure, on paper: the two objects are drawn
// at their real relative SIZE, which is the whole point of the next scene.

const INK = '#171310';
const PAPER = '#F4ECDC';

export default {
  draw(ctx, t, scene, o = {}) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(-240, -240, W + 480, H + 480);

    const g = radGrad(ctx, 1180, -140, 60, 1500, [[0, 'rgba(255,244,222,0.9)'], [1, 'rgba(224,206,176,0)']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'rgba(23,19,16,0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
    grain(ctx, 0.035);

    kicker(ctx, 'DIBANDINGKAN PADA MASSA YANG SAMA', { x: 96, y: 250, color: '#B32E1C', ink: hexA(INK, 0.85) });

    const a1 = at(t, 0.15, 0.9);
    ctx.save();
    ctx.globalAlpha = a1;
    sunDisc(ctx, 392, 968, 232, { t, rays: 0.55, tone: 0.85 });
    ctx.restore();

    const a2 = at(t, 0.9, 0.9);
    ctx.save();
    ctx.globalAlpha = a2;
    bhDisc(ctx, 1052, 968, 34, { t, glow: 0.55, ring: 1, tone: 0.7 });
    ctx.strokeStyle = 'rgba(23,19,16,0.75)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(1052, 968, 38, 0, TAU);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = at(t, 1.5, 0.7) * 0.35;
    txt(ctx, '=', 722, 1036, { size: 150, font: F.num, color: INK, align: 'center' });
    ctx.restore();

    const lab = (x, a, title, sub1, sub2) => (
      ctx.save(),
      ctx.globalAlpha = a,
      txt(ctx, title, x, 1290, { size: 34, font: F.mono6, color: INK, track: 6, align: 'center' }),
      txt(ctx, sub1, x, 1338, { size: 30, font: F.body, color: hexA(INK, 0.72), align: 'center' }),
      txt(ctx, sub2, x, 1380, { size: 30, font: F.body, color: hexA(INK, 0.52), align: 'center' }),
      ctx.restore()
    );
    lab(392, a1, 'MATAHARI', '1 massa matahari', 'selebar 1,39 juta km');
    lab(1052, a2, 'LUBANG HITAM', '1 massa matahari', 'selebar 3 km');

    const sv = at(t, 2.4, 0.8);
    ctx.save();
    ctx.globalAlpha = sv;
    fillRR(ctx, 96, 1432, W - 192, 96, 10, 'rgba(23,19,16,0.055)');
    strokeRR(ctx, 96, 1432, W - 192, 96, 10, 'rgba(23,19,16,0.16)', 1.5);
    txt(ctx, 'ORBIT BUMI', 128, 1492, { size: 26, font: F.mono6, color: hexA(INK, 0.55), track: 5 });
    txt(ctx, '365 HARI  ·  TETAP', 1298, 1492, { size: 34, font: F.mono6, color: '#B32E1C', track: 4, align: 'right' });
    ctx.restore();

    txt(ctx, 'Ukuran digambar sesuai skala sebenarnya.', 96, 1576, {
      size: 22, font: F.body, color: hexA(INK, 0.42), alpha: at(t, 2.8, 0.6),
    });
  },
};
