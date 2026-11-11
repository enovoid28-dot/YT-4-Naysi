import { W, H, txt, hexA, linGrad, radGrad, fillRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, starfield, bhDisc, limb } from './_space.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';

// 02 — DELAPAN MENIT. The light is already dead; the world simply has not been
// told yet. The only object in motion is the last eight minutes of it.

const BHx = 1128;
const BHy = 430;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    const g = linGrad(ctx, 0, -200, 0, H, [[0, '#04060C'], [0.5, '#060A12'], [1, '#02040A']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);

    starfield(ctx, { n: 210, seed: 41, t, a: 0.85, bottom: 1700 });

    // Earth's limb, very close: the last thing the light will ever touch
    layer(ctx, cam, 0.18, () => {
      limb(ctx, 250, 2560, 1120, { t, glow: 1, dawn: 0.6, dawnX: 700 });
    });

    // the black hole, distant and small
    layer(ctx, cam, 0.32, () => {
      bhDisc(ctx, BHx, BHy, 17, { t, glow: 0.7, ring: 1 });
    });

    // the beam: dotted, from the dark point to the lit limb
    const ex = 372;
    const ey = 1478;
    const p = clamp(t / 8.35);
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = 'rgba(255,226,170,0.7)';
    ctx.lineWidth = 2.6;
    ctx.setLineDash([4, 12]);
    ctx.beginPath();
    ctx.moveTo(BHx - 16, BHy + 20);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();

    // three photons on the wire
    for (let i = 0; i < 3; i++) {
      const q = (p * 1.6 + i / 3) % 1;
      const x = lerp(BHx - 16, ex, q);
      const y = lerp(BHy + 20, ey, q);
      ctx.save();
      ctx.globalAlpha = 0.9 * Math.sin(q * Math.PI) ** 0.5;
      const gg = radGrad(ctx, x, y, 0, 17, [
        [0, 'rgba(255,252,238,1)'],
        [0.18, 'rgba(255,238,196,0.75)'],
        [1, 'rgba(255,200,120,0)'],
      ]);
      ctx.fillStyle = gg;
      ctx.fillRect(x - 17, y - 17, 34, 34);
      ctx.restore();
    }

    // the clock
    const a0 = at(t, 0.15, 0.6);
    ctx.save();
    ctx.globalAlpha = a0;
    txt(ctx, '08:20', 104, 1064, { size: 268, font: F.num, color: S.bone, track: -12 });
    txt(ctx, 'CAHAYA TERAKHIR DALAM PERJALANAN', 110, 1130, { size: 25, font: F.mono6, color: hexA(S.bone, 0.55), track: 6 });
    ctx.restore();

    // ruler: 0 → 8 menit 20 detik
    const rx0 = 110;
    const rx1 = 1290;
    const ry = 1206;
    ctx.save();
    ctx.globalAlpha = at(t, 0.5, 0.8) * 0.55;
    ctx.strokeStyle = hexA(S.bone, 0.55);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx0, ry);
    ctx.lineTo(rx1, ry);
    for (let i = 0; i <= 20; i++) {
      const x = rx0 + ((rx1 - rx0) * i) / 20;
      const h = i % 5 === 0 ? 14 : 7;
      ctx.moveTo(x, ry - h);
      ctx.lineTo(x, ry + h);
    }
    ctx.stroke();
    ctx.restore();

    // elapsed marker
    const mx = lerp(rx0, rx1, p);
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#FFB03A';
    ctx.shadowColor = 'rgba(255,176,58,0.9)';
    ctx.shadowBlur = 22;
    ctx.fillRect(mx - 3, ry - 26, 6, 52);
    ctx.restore();
    txt(ctx, `${Math.floor(p * 8)}:${String(Math.floor((p * 500) % 60)).padStart(2, '0')}`, mx + 16, ry - 40, {
      size: 28, font: F.num6, color: S.amber, track: 1,
    });

    kicker(ctx, 'JARAK 150 JUTA KM', { x: 104, y: 250, color: '#8FB4E8', ink: hexA(S.bone, 0.86) });
    chip(ctx, 'TIDAK ADA YANG TAHU, SELAMA 8 MENIT', 104, 1462, {
      a: at(t, 5.4, 0.6) * 0.9, bg: 'rgba(6,9,16,0.7)', ink: hexA(S.bone, 0.82),
      border: 'rgba(160,190,240,0.24)', size: 22, track: 2,
    });
  },
};
