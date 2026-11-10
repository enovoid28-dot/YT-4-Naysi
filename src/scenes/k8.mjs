import { W, H, txt, hexA, fillRR, strokeRR, linGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { K, E, at, layer, tap, glass, borehole, soil, kicker, chip, grain, fillAll } from './_kota.mjs';

// 08 — KELUAR. Two fixes side by side: piped water that actually arrives, and a
// borehole that is capped. Then the line the whole film was walking towards.
const PANEL = 726;
const LABEL_Y = 1396;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, linGrad(ctx, 0, 0, 0, H, [
      [0, '#ECE3D0'],
      [0.5, '#F7EEDC'],
      [1, '#E3D7BD'],
    ]));
    ctx.save();
    const g = ctx.createRadialGradient(700, 520, 60, 700, 520, 900);
    g.addColorStop(0, 'rgba(255,251,238,0.8)');
    g.addColorStop(1, 'rgba(255,251,238,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    kicker(ctx, 'YANG BISA DIPERBAIKI', { y: 250, a: at(t, 0.2, 0.8), ink: '#2A2320' });

    // RIGHT PANEL: the ground and the straw that has to stop
    const rA = at(t, 0.9, 0.9);
    if (rA > 0.01) {
      ctx.save();
      ctx.globalAlpha = rA;
      ctx.save();
      ctx.beginPath();
      ctx.rect(PANEL, 560, W - PANEL, H);
      ctx.clip();
      soil(ctx, 720, { h: 560, seed: 44 });
      ctx.fillStyle = 'rgba(26,20,16,0.22)';
      ctx.fillRect(PANEL, 720, W - PANEL, 4);
      ctx.restore();
      const px = 1084;
      borehole(ctx, px, 560, 1200, { a: 1, level: 0, t, w: 56 });
      // cap
      ctx.fillStyle = '#6A6659';
      fillRR(ctx, px - 74, 646, 148, 44, 10, ctx.fillStyle);
      ctx.fillStyle = '#928C7C';
      fillRR(ctx, px - 74, 646, 148, 12, 6, ctx.fillStyle);
      // the X: closed
      const xA = at(t, 2.0, 0.6);
      if (xA > 0.01) {
        ctx.save();
        ctx.globalAlpha *= xA;
        ctx.strokeStyle = hexA(K.rust, 0.95);
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px - 76, 556);
        ctx.lineTo(px + 76, 742);
        ctx.moveTo(px + 76, 556);
        ctx.lineTo(px - 76, 742);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // LEFT PANEL: the tap and the glass filling
    const lA = at(t, 0.2, 0.9);
    ctx.save();
    ctx.globalAlpha = lA;
    tap(ctx, 330, 700, 0.92, { drip: (t * 1.6) % 1 < 0.55 ? (t * 1.6) % 1 : 0 });
    glass(ctx, 300, 792, 196, 300, clamp(at(t, 1.0, 2.6)) * 0.92, { t });
    ctx.restore();

    // labels, on the paper below both panels
    const bA = at(t, 1.2, 0.8);
    if (bA > 0.01) {
      ctx.save();
      ctx.globalAlpha = bA;
      ctx.fillStyle = 'rgba(26,20,16,0.18)';
      ctx.fillRect(96, LABEL_Y - 46, W - 192, 2);
      txt(ctx, 'AIR PIPA', 96, LABEL_Y + 34, { size: 40, font: F.num6, color: '#141110', track: 2 });
      txt(ctx, 'BARU 40% RUMAH', 98, LABEL_Y + 84, {
        size: 22, font: F.mono6, color: 'rgba(20,17,16,0.55)', track: 4,
      });
      txt(ctx, 'SUMUR BOR', PANEL + 60, LABEL_Y + 34, { size: 40, font: F.num6, color: K.rust, track: 2 });
      txt(ctx, 'DITUTUP', PANEL + 62, LABEL_Y + 84, {
        size: 22, font: F.mono6, color: hexA(K.rust, 0.8), track: 4,
      });
      ctx.restore();
    }

    // the line
    const cA = at(t, 7.4, 0.9);
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      fillAll(ctx, '#F4ECDC');
      ctx.fillStyle = K.rust;
      ctx.fillRect(96, 596, 96, 8);
      txt(ctx, 'BERHENTI', 92, 826, { size: 152, font: F.num, color: '#141110', track: -5 });
      txt(ctx, 'MINUM', 92, 968, { size: 152, font: F.num, color: '#141110', track: -5 });
      txt(ctx, 'TANAHNYA', 92, 1110, { size: 152, font: F.num, color: K.rust, track: -5 });
      txt(ctx, 'JAKARTA TIDAK BISA MENGGALI JALAN KELUAR', 96, 1204, {
        size: 21, font: F.mono6, color: 'rgba(20,17,16,0.55)', track: 3,
      });
      // a quiet recap of the four numbers the film turned on
      ctx.fillStyle = 'rgba(26,20,16,0.14)';
      ctx.fillRect(96, 1400, W - 192, 2);
      txt(ctx, '25 CM', 96, 1476, { size: 46, font: F.num6, color: 'rgba(20,17,16,0.72)' });
      txt(ctx, '75×', 396, 1476, { size: 46, font: F.num6, color: 'rgba(20,17,16,0.72)' });
      txt(ctx, '40%', 660, 1476, { size: 46, font: F.num6, color: 'rgba(20,17,16,0.72)' });
      txt(ctx, '2050', 900, 1476, { size: 46, font: F.num6, color: hexA(K.rust, 0.85) });
      txt(ctx, 'TURUN PER TAHUN  ·  LEBIH CEPAT DARI LAUT  ·  DI BAWAH MUKA LAUT  ·  TANPA TINDAKAN',
        96, 1524, { size: 17, font: F.mono6, color: 'rgba(20,17,16,0.42)', track: 2 });
      ctx.restore();
    }

    grain(ctx, 0.035);
  },
};
