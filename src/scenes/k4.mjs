import { W, H, txt, hexA, linGrad, radGrad, fillRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, starfield, bhDisc, orbit, orbitPos } from './_space.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';

// 04 — TIGA KILOMETER. Same orbit, same year, a centre you cannot see. Then the
// scale bar underneath: the whole object is one pixel next to the planet.

const CX = 720;
const CY = 872;
const RX = 528;
const RY = 272;
const ROT = -0.1;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    const g = linGrad(ctx, 0, -200, 0, H, [[0, '#050810'], [0.5, '#080D18'], [1, '#03050B']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);
    starfield(ctx, { n: 170, seed: 63, t, a: 0.6, bottom: 1600 });

    layer(ctx, cam, 0.3, () => {
      orbit(ctx, CX, CY, RX, RY, { rot: ROT, prog: at(t, 0.2, 1.4), color: 'rgba(150,190,240,0.42)', lw: 2.2 });
      orbit(ctx, CX, CY, RX, RY, { rot: ROT, color: 'rgba(150,190,240,0.16)', lw: 10 });

      ctx.save();
      ctx.globalAlpha = 0.5 * at(t, 0.6, 1);
      ctx.strokeStyle = 'rgba(150,190,240,0.5)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU;
        const p0 = orbitPos(CX, CY, RX, RY, ang, ROT);
        const p1 = orbitPos(CX, CY, RX * 1.045, RY * 1.09, ang, ROT);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      ctx.restore();

      bhDisc(ctx, CX, CY, 13, { t, glow: 0.9, ring: 1 });

      const ang = -0.4 + t * 0.52;
      const p = orbitPos(CX, CY, RX, RY, ang, ROT);
      ctx.save();
      const gl = radGrad(ctx, p.x, p.y, 2, 46, [[0, 'rgba(140,200,255,0.55)'], [1, 'rgba(90,150,230,0)']]);
      ctx.fillStyle = gl;
      ctx.fillRect(p.x - 46, p.y - 46, 92, 92);
      ctx.fillStyle = '#8FC4F0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#EAF4FF';
      ctx.beginPath();
      ctx.arc(p.x - 2.4, p.y - 2.4, 4, 0, TAU);
      ctx.fill();
      ctx.restore();

      const q = orbitPos(CX, CY, RX * 0.56, RY * 0.56, ang + Math.PI, ROT);
      ctx.save();
      ctx.globalAlpha = 0.5 * at(t, 1.0, 0.9);
      ctx.strokeStyle = 'rgba(240,228,200,0.55)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 9]);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
      ctx.restore();
      txt(ctx, '150 JUTA KM', (CX + q.x) / 2 - 26, (CY + q.y) / 2 - 22, {
        size: 24, font: F.mono6, color: hexA(S.bone, 0.62), track: 3, alpha: at(t, 1.2, 0.8),
      });
    });

    kicker(ctx, 'SATU PUTARAN, TANPA PERUBAHAN', { x: 104, y: 250, color: '#8FB4E8', ink: hexA(S.bone, 0.86) });
    chip(ctx, '1 TAHUN = 365 HARI', 806, 250, {
      a: at(t, 0.8, 0.7), bg: 'rgba(6,9,16,0.7)', ink: hexA(S.bone, 0.9),
      border: 'rgba(160,190,240,0.3)', size: 22, track: 3,
    });

    const sa = at(t, 1.2, 0.9);
    ctx.save();
    ctx.globalAlpha = sa;
    txt(ctx, 'BUMI', 104, 1318, { size: 24, font: F.mono6, color: hexA(S.bone, 0.62), track: 5 });
    ctx.fillStyle = 'rgba(143,196,240,0.85)';
    ctx.fillRect(300, 1296, 820, 22);
    ctx.fillStyle = 'rgba(234,244,255,0.9)';
    ctx.fillRect(300, 1296, 820, 8);
    txt(ctx, '12.742 KM', 1120, 1272, { size: 24, font: F.mono6, color: hexA(S.bone, 0.8), track: 3 });

    txt(ctx, 'LUBANG HITAM', 104, 1418, { size: 24, font: F.mono6, color: hexA(S.bone, 0.62), track: 5 });
    ctx.fillStyle = '#FFB03A';
    ctx.shadowColor = 'rgba(255,176,58,0.9)';
    ctx.shadowBlur = 18;
    ctx.fillRect(332, 1406, 7, 7);
    ctx.shadowBlur = 0;
    txt(ctx, '6 KM', 356, 1418, { size: 24, font: F.mono6, color: '#FFB03A', track: 3 });
    ctx.restore();

    txt(ctx, '0,05% lebar Bumi — satu titik di tengah orbit', 300, 1476, {
      size: 22, font: F.body, color: hexA(S.bone, 0.5), alpha: at(t, 2.0, 0.7),
    });
  },
};
