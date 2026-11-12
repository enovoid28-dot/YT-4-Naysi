import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, rays, snow, ruler, drawRule, motes } from './_ocean.mjs';

// 02 — CAHAYA HABIS. The first two hundred metres are the whole story of the
// ocean: below them the sun stops paying for anything. Colour dies in order.

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    // the camera is already under way: depth climbs with the scene
    const depthM = lerp(6, 212, EA.inOut(clamp((t - 0.4) / Math.max(4, scene.dur - 2.4))));
    const k = clamp(depthM / 900) * 0.55;

    layer(ctx, cam, 0.2, () => {
      column(ctx, k, { t });
    });

    // surface, receding upward as we sink
    const surfaceY = 300 - depthM * 1.15;
    if (surfaceY > -300) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - depthM / 260) * 0.7;
      const g = linGrad(ctx, 0, surfaceY - 160, 0, surfaceY + 60, [[0, hexA(O.pale, 0.35)], [1, hexA(O.pale, 0)]]);
      ctx.fillStyle = g;
      ctx.fillRect(-240, surfaceY - 160, W + 480, 240);
      ctx.strokeStyle = hexA('#CFEDE6', 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = -120; x <= W + 120; x += 12) {
        const y = surfaceY + Math.sin(x * 0.012 + t * 1.6) * 7 + Math.sin(x * 0.031 + t * 2.3) * 3;
        if (x === -120) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    rays(ctx, t, {
      x: W * 0.46, from: -200, len: 1700, n: 8, spread: 1320,
      a: 0.85 * Math.pow(1 - clamp(depthM / 230), 1.4),
    });
    snow(ctx, t, { n: 120, seed: 4, a: 0.42, speed: 22 });

    /* ------------------------- colour death ---------------------------- */
    // A spectrum stick: how deep each wavelength survives, and a cursor that
    // rides the camera down through them.
    const sp = at(t, 0.9, 0.9);
    if (sp > 0.01) {
      const px = 596;
      const py = 640;
      const bars = [
        { c: '#FF5A46', name: 'MERAH', m: 30 },
        { c: '#63D07A', name: 'HIJAU', m: 110 },
        { c: '#5DA8FF', name: 'BIRU', m: 200 },
      ];
      const maxW = 470;
      const unit = maxW / 210;
      ctx.save();
      ctx.globalAlpha = sp;
      tracking(ctx, 'CAHAYA YANG TERSISA', px, py - 44, {
        size: 20, font: F.mono6, track: 5, color: hexA(O.pale, 0.5),
      });
      bars.forEach((b, i) => {
        const y = py + i * 92;
        const passed = depthM > b.m;
        const alive = clamp(1 - (depthM - b.m) / 70);
        ctx.save();
        ctx.globalAlpha = sp * (0.22 + 0.78 * alive);
        ctx.fillStyle = hexA(O.bone, 0.09);
        fillRR(ctx, px, y, maxW, 14, 7, hexA(O.bone, 0.07));
        ctx.fillStyle = b.c;
        fillRR(ctx, px, y, Math.max(10, b.m * unit * sp), 14, 7, b.c);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = sp * 0.9;
        tracking(ctx, b.name, px + maxW + 22, y + 13, {
          size: 20, font: F.mono6, track: 4, color: hexA(O.bone, passed ? 0.35 : 0.8),
        });
        ctx.restore();
      });
      // depth cursor
      const cx = px + clamp(depthM, 0, 210) * unit;
      ctx.globalAlpha = sp * 0.9;
      ctx.strokeStyle = hexA(O.amber, 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, py - 18);
      ctx.lineTo(cx, py + 3 * 92 + 26);
      ctx.stroke();
      ctx.restore();
    }

    /* ----------------------------- 200 m ------------------------------- */
    const p200 = at(t, 2.0, 1.0, EA.out);
    const y200 = 300 + (200 / 1200) * 1180; // matches the ruler scale
    ctx.save();
    ctx.globalAlpha = p200 * 0.85;
    ctx.setLineDash([10, 12]);
    ctx.strokeStyle = hexA(O.amber, 0.55);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, y200);
    ctx.lineTo(W - 120, y200);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    if (p200 > 0.05) {
      chip(ctx, 'BATAS FOTOSINTESIS', 300, y200 - 34, {
        a: p200, bg: 'rgba(6,20,24,0.7)', ink: hexA(O.amber, 0.95),
        border: hexA(O.amber, 0.35), size: 21, track: 3,
      });
    }

    ruler(ctx, 150, {
      y0: 300, y1: 1480, max: 1200, cur: depthM, a: at(t, 0.35, 0.8),
      ticks: 12, label: '',
    });

    // falling food: a slow drift of flecks from the lit layer
    if (t > 3.4) {
      const pp = at(t, 3.4, 2.4);
      ctx.save();
      ctx.globalAlpha = pp * 0.5;
      for (let i = 0; i < 16; i++) {
        const u = i / 15;
        const yy = 420 + u * 900 + Math.sin(t * 0.7 + i) * 12;
        const xx = 420 + ((i * 137) % 700) + Math.sin(t * 0.4 + i * 2) * 30;
        ctx.fillStyle = hexA(O.pale, 0.5 * (1 - u * 0.6));
        ctx.beginPath();
        ctx.ellipse(xx, yy, 5, 3, 0.4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    drawRule(ctx, 300, 300 + 520 * at(t, 1.2, 0.9), 1180, 1, { color: O.aqua, a: 0.4 });
    if (t > 1.6) {
      tracking(ctx, 'DI BAWAH INI TIDAK ADA LAGI MAKANAN DARI SINAR', 300, 1150, {
        size: 19, font: F.mono6, track: 4, color: hexA(O.pale, 0.45), alpha: at(t, 1.6, 0.7) * 0.9,
      });
    }

    kicker(ctx, 'SAMUDRA · CAHAYA HABIS', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
