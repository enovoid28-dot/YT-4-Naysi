import { W, H, txt, hexA, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, starfield, bhDisc, orbit, orbitPos } from './_space.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';

// 08 — UKURANNYA. The one swap that kills: keep the black hole's SIZE and the
// mass explodes to 236 000 suns. A year becomes eighteen hours.

const CX = 720;
const CY = 848;
const RX = 606;
const RY = 250;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    const g = linGrad(ctx, 0, -200, 0, H, [[0, '#0A0406'], [0.42, '#120608'], [0.72, '#1B0A08'], [1, '#080304']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);
    starfield(ctx, { n: 150, seed: 131, t, a: 0.5, bottom: 1500 });

    const hg = radGrad(ctx, CX, CY, 240, 1000, [
      [0, 'rgba(255,120,50,0.20)'],
      [0.5, 'rgba(190,60,30,0.08)'],
      [1, 'rgba(120,30,20,0)'],
    ]);
    ctx.fillStyle = hg;
    ctx.fillRect(-200, -200, W + 400, H + 400);

    layer(ctx, cam, 0.25, () => {
      ctx.save();
      ctx.globalAlpha = 0.4 * at(t, 0.4, 0.9);
      ctx.strokeStyle = 'rgba(255,150,90,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 48; i++) {
        const ang = (i / 48) * TAU + t * 0.04;
        const r0 = 380;
        const r1 = i % 4 === 0 ? 404 : 392;
        ctx.beginPath();
        ctx.moveTo(CX + Math.cos(ang) * r0, CY + Math.sin(ang) * r0 * 0.62);
        ctx.lineTo(CX + Math.cos(ang) * r1, CY + Math.sin(ang) * r1 * 0.62);
        ctx.stroke();
      }
      ctx.restore();

      bhDisc(ctx, CX, CY, 286, { t, glow: 1, ring: 1, hot: 1 });

      orbit(ctx, CX, CY, RX, RY, { rot: 0, color: 'rgba(255,170,110,0.35)', lw: 2.4, prog: at(t, 0.3, 1.0) });
      orbit(ctx, CX, CY, RX, RY, { rot: 0, color: 'rgba(255,120,60,0.10)', lw: 14 });

      const ang = -0.6 + t * 2.4;
      for (let i = 0; i < 22; i++) {
        const a2 = ang - i * 0.045;
        const p = orbitPos(CX, CY, RX, RY, a2);
        const q = 1 - i / 22;
        ctx.save();
        ctx.globalAlpha = 0.5 * q * at(t, 0.3, 0.8);
        ctx.fillStyle = i === 0 ? '#EAF4FF' : 'rgba(200,225,255,0.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11 * (0.4 + q * 0.6), 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      const p0 = orbitPos(CX, CY, RX, RY, ang);
      const gl = radGrad(ctx, p0.x, p0.y, 2, 54, [[0, 'rgba(200,230,255,0.6)'], [1, 'rgba(140,190,255,0)']]);
      ctx.fillStyle = gl;
      ctx.fillRect(p0.x - 54, p0.y - 54, 108, 108);
    });

    kicker(ctx, 'GESER HANYA UKURANNYA', { x: 104, y: 250, color: '#FF8A5C', ink: hexA(S.bone, 0.9) });

    chip(ctx, 'MASSA 236.000 KALI MATAHARI', 104, 344, {
      a: at(t, 1.0, 0.6), bg: 'rgba(20,8,6,0.78)', ink: '#FFC79B',
      border: 'rgba(255,150,90,0.42)', size: 24, track: 2,
    });
    chip(ctx, '1 PUTARAN = 18 JAM', 104, 414, {
      a: at(t, 1.7, 0.6), bg: 'rgba(20,8,6,0.78)', ink: '#FFC79B',
      border: 'rgba(255,150,90,0.42)', size: 26, track: 2,
    });

    txt(ctx, 'Kecepatan Bumi: 30 km/detik  →  14.500 km/detik', 104, 1492, {
      size: 25, font: F.mono6, color: hexA(S.bone, 0.62), track: 1, alpha: at(t, 2.6, 0.8),
    });
    txt(ctx, 'dan pasang surut naik ratusan ribu kali', 104, 1538, {
      size: 25, font: F.body, color: hexA(S.bone, 0.5), alpha: at(t, 3.2, 0.8),
    });
  },
};
