import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, rays, ruler, drawRule, material } from './_ocean.mjs';

// 02 — CAHAYA HABIS. The first two hundred metres are the whole story of the
// ocean: below them the sun stops paying for anything. Colour dies in order.

const RULER_X = 146;
const RULER_Y0 = 322;
const RULER_Y1 = 1462;
const RULER_MAX = 800;
const yFor = (m) => RULER_Y0 + clamp(m / RULER_MAX) * (RULER_Y1 - RULER_Y0);

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    // the camera is already under way: depth climbs with the scene
    const depthM = lerp(4, 214, EA.inOut(clamp((t - 0.4) / Math.max(4, scene.dur - 2.4))));
    const k = clamp(depthM / 900) * 0.5;

    layer(ctx, cam, 0.2, () => {
      column(ctx, k, { t });
    });

    // surface, receding upward as we sink
    const surfaceY = 300 - depthM * 1.05;
    if (surfaceY > -320) {
      ctx.save();
      ctx.globalAlpha = clamp(1 - depthM / 250) * 0.75;
      const g = linGrad(ctx, 0, surfaceY - 190, 0, surfaceY + 60, [[0, hexA(O.pale, 0.30)], [1, hexA(O.pale, 0)]]);
      ctx.fillStyle = g;
      ctx.fillRect(-240, surfaceY - 190, W + 480, 250);
      ctx.strokeStyle = hexA('#CFEDE6', 0.55);
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
      x: W * 0.48, from: -240, len: 1900, n: 8, spread: 1360,
      a: 0.9 * Math.pow(1 - clamp(depthM / 230), 1.4),
    });

    // below the photic line the column goes flat and dark: nothing here is lit
    const y200 = yFor(200);
    const dark = at(t, 1.6, 1.6);
    if (dark > 0.01) {
      const g = linGrad(ctx, 0, y200, 0, 1560, [
        [0, 'rgba(1,7,9,0)'], [0.25, `rgba(1,7,9,${0.38 * dark})`], [1, `rgba(1,7,9,${0.72 * dark})`],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(-240, y200, W + 480, 1620 - y200);
    }

    /* ------------------------- colour death ---------------------------- */
    // A spectrum stick: how deep each wavelength survives, and a cursor that
    // rides the camera down through them. Muted, like a plate in a field guide.
    const sp = at(t, 0.9, 0.9);
    if (sp > 0.01) {
      const px = 592;
      const py = 636;
      const maxM = 240;
      const maxW = 470;
      const unit = maxW / maxM;
      const bars = [
        { c: '#B4553F', name: 'MERAH', m: 30 },
        { c: '#7C9B6A', name: 'HIJAU', m: 110 },
        { c: '#6E8FA6', name: 'BIRU', m: 200 },
      ];
      ctx.save();
      ctx.globalAlpha = sp;
      tracking(ctx, 'CAHAYA YANG TERSISA', px, py - 48, {
        size: 20, font: F.mono6, track: 5, color: hexA(O.pale, 0.5),
      });
      bars.forEach((b, i) => {
        const y = py + i * 96;
        const passed = depthM > b.m;
        const alive = clamp(1 - (depthM - b.m) / 80);
        ctx.save();
        ctx.globalAlpha = sp * (0.20 + 0.8 * alive);
        ctx.fillStyle = hexA(O.bone, 0.07);
        ctx.fillRect(px, y, maxW, 9);
        ctx.fillStyle = b.c;
        ctx.fillRect(px, y, Math.max(6, b.m * unit), 9);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = sp * 0.95;
        tracking(ctx, b.name, px + maxW + 26, y + 9, {
          size: 20, font: F.mono6, track: 4, color: hexA(O.bone, passed ? 0.34 : 0.82),
        });
        txt(ctx, `${b.m} M`, px + maxW + 26 + 92, y + 9, {
          size: 19, font: F.mono6, color: hexA(O.pale, passed ? 0.24 : 0.55), track: 2,
        });
        ctx.restore();
      });
      // axis under the sticks
      ctx.save();
      ctx.globalAlpha = sp * 0.6;
      drawRule(ctx, px, px + maxW, py + 3 * 96 - 12, 1, { color: O.aqua, a: 0.3, lw: 1.2 });
      ['0', '100', '200 M'].forEach((s2, i) => {
        txt(ctx, s2, px + (i * maxW) / 2, py + 3 * 96 + 22, {
          size: 17, font: F.mono6, color: hexA(O.pale, 0.45), track: 2,
          align: i === 0 ? 'left' : i === 2 ? 'right' : 'center',
        });
      });
      ctx.restore();
      // depth cursor
      const cx = px + clamp(depthM, 0, maxM) * unit;
      ctx.globalAlpha = sp * 0.9;
      ctx.strokeStyle = hexA(O.amber, 0.75);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, py - 20);
      ctx.lineTo(cx, py + 3 * 96 - 2);
      ctx.stroke();
      ctx.restore();
    }

    /* ----------------------------- 200 m ------------------------------- */
    const p200 = at(t, 2.0, 1.0, EA.out);
    ctx.save();
    ctx.globalAlpha = p200 * 0.8;
    ctx.setLineDash([10, 12]);
    ctx.strokeStyle = hexA(O.amber, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, y200);
    ctx.lineTo(lerp(300, W - 110, p200), y200);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    if (p200 > 0.05) {
      chip(ctx, 'BATAS FOTOSINTESIS', 300, y200 - 40, {
        a: p200, bg: 'rgba(6,20,24,0.72)', ink: hexA(O.amber, 0.95),
        border: hexA(O.amber, 0.32), size: 21, track: 3,
      });
    }

    ruler(ctx, RULER_X, {
      y0: RULER_Y0, y1: RULER_Y1, max: RULER_MAX, cur: depthM, a: at(t, 0.35, 0.8),
      ticks: 12, label: '',
    });

    drawRule(ctx, 300, 300 + 520 * at(t, 1.2, 0.9), 1180, 1, { color: O.aqua, a: 0.35 });
    if (t > 1.6) {
      tracking(ctx, 'DI BAWAH INI TIDAK ADA LAGI MAKANAN DARI SINAR', 300, 1148, {
        size: 19, font: F.mono6, track: 4, color: hexA(O.pale, 0.42), alpha: at(t, 1.6, 0.7) * 0.9,
      });
    }

    kicker(ctx, 'SAMUDRA · CAHAYA HABIS', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
