import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, drawRule, material, seabed } from './_ocean.mjs';

// 04 — TITANIC. A wreck on the abyssal plain, lit by one work lamp. The pressure
// is the point: every ten metres of water is another atmosphere, all the way
// down to the bottom of the world.

/* The bow section, side on, bow to the left. Coordinates in metres-ish: the
   hull runs from -340 (stem) to +330 (torn stern), deck at about -104. */
function wreck(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(-0.012 + Math.sin(t * 0.12) * 0.002);

  // ---- hull
  ctx.beginPath();
  ctx.moveTo(-340, 40);
  ctx.bezierCurveTo(-330, -18, -322, -56, -300, -92);
  ctx.bezierCurveTo(-150, -98, 120, -108, 286, -114);
  ctx.bezierCurveTo(320, -100, 332, -62, 326, 6);
  ctx.bezierCurveTo(300, 44, -80, 60, -340, 40);
  ctx.closePath();
  const hull = linGrad(ctx, 0, -130, 0, 50, [[0, '#0C1F24'], [0.35, '#081619'], [1, '#040C0F']]);
  ctx.fillStyle = hull;
  ctx.fill();
  ctx.save();
  ctx.clip();
  material(ctx, 'steel', { x: -350, y: -130, w: 700, h: 200, a: 0.34, s: 1.4 });
  // rust and silt streaks running down the plating
  const r = rng(31);
  for (let i = 0; i < 42; i++) {
    const rx = -334 + r() * 660;
    const w = 3 + r() * 16;
    const len = 30 + r() * 120;
    ctx.fillStyle = `rgba(120,74,52,${0.03 + r() * 0.05})`;
    ctx.fillRect(rx, -96 + r() * 20, w, len);
  }
  // sediment settled on the lower plating
  const sed = linGrad(ctx, 0, -20, 0, 50, [[0, 'rgba(122,138,132,0)'], [1, 'rgba(132,146,138,0.16)']]);
  ctx.fillStyle = sed;
  ctx.fillRect(-350, -30, 700, 100);
  ctx.restore();

  // ---- deck edge + bulwark
  ctx.beginPath();
  ctx.moveTo(-300, -92);
  ctx.bezierCurveTo(-150, -98, 120, -108, 286, -114);
  ctx.strokeStyle = 'rgba(186,206,196,0.30)';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  // forecastle rail: posts + top rail
  ctx.strokeStyle = 'rgba(196,214,204,0.22)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 26; i++) {
    const px = -296 + i * 22;
    if (px > 268) break;
    const py = -96 - Math.min(14, i * 0.6);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - 16);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-296, -112);
  ctx.lineTo(268, -126);
  ctx.strokeStyle = 'rgba(196,214,204,0.16)';
  ctx.stroke();

  // ---- portholes: one long row, all dark
  for (let i = 0; i < 34; i++) {
    const px = -286 + i * 16.5;
    const py = -70 + Math.sin(px * 0.01) * 2;
    ctx.beginPath();
    ctx.arc(px, py, 3.1, 0, TAU);
    ctx.fillStyle = 'rgba(150,176,170,0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(176,200,192,0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ---- superstructure: bridge block, deckhouse, funnels
  const block = (bx, by, bw, bh, tilt = 0) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(tilt);
    ctx.fillStyle = '#0A1A1E';
    ctx.fillRect(0, 0, bw, bh);
    material(ctx, 'steel', { x: 0, y: 0, w: bw, h: bh, a: 0.4, s: 0.8 });
    ctx.strokeStyle = 'rgba(176,202,192,0.20)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(0, 0, bw, bh);
    ctx.restore();
  };
  block(-104, -170, 150, 62);          // bridge / officers' quarters
  block(-40, -196, 56, 30);            // wheelhouse roof deck
  block(76, -160, 96, 46);             // first-class deckhouse

  // bridge windows
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(196,216,206,${0.10 + (i % 3) * 0.03})`;
    ctx.fillRect(-96 + i * 22, -160, 14, 16);
  }

  // funnels: one standing, one sheared off
  const funnel = (fx, fh, tilt) => {
    ctx.save();
    ctx.translate(fx, -168);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(-19, -fh);
    ctx.quadraticCurveTo(0, -fh - 8, 19, -fh);
    ctx.lineTo(24, 0);
    ctx.closePath();
    ctx.fillStyle = '#0B1B20';
    ctx.fill();
    ctx.strokeStyle = 'rgba(186,208,198,0.26)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // stay wires
    ctx.strokeStyle = 'rgba(170,196,188,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-20, -fh + 12);
    ctx.lineTo(-46, -30);
    ctx.moveTo(20, -fh + 12);
    ctx.lineTo(44, -34);
    ctx.stroke();
    ctx.restore();
  };
  funnel(4, 96, 0.012);
  funnel(132, 92, 0.02);
  funnel(250, 34, 0.14);

  // masts
  ctx.strokeStyle = 'rgba(186,206,196,0.22)';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-236, -96);
  ctx.lineTo(-244, -292);
  ctx.moveTo(258, -114);
  ctx.lineTo(252, -250);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-250, -236);
  ctx.lineTo(-230, -236);
  ctx.moveTo(-247, -196);
  ctx.lineTo(-233, -196);
  ctx.moveTo(256, -212);
  ctx.lineTo(268, -212);
  ctx.stroke();

  // ---- damage: the stern is torn away, plates peeled back
  ctx.beginPath();
  ctx.moveTo(298, -110);
  ctx.lineTo(282, -92);
  ctx.lineTo(300, -74);
  ctx.lineTo(280, -52);
  ctx.lineTo(300, -30);
  ctx.lineTo(284, -8);
  ctx.strokeStyle = 'rgba(186,208,198,0.24)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // silt that has settled over the lower hull
  ctx.save();
  const sg = linGrad(ctx, 0, -34, 0, 44, [[0, 'rgba(126,142,136,0)'], [1, 'rgba(132,148,140,0.14)']]);
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-340, 40);
  ctx.bezierCurveTo(-150, 20, 120, 10, 326, 6);
  ctx.lineTo(326, 60);
  ctx.lineTo(-340, 90);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ---- debris field on the silt
  const d = rng(7);
  for (let i = 0; i < 22; i++) {
    const px = -420 + i * 44 + (d() - 0.5) * 26;
    const py = 32 + d() * 46;
    const pw = 12 + d() * 40;
    const ph = 3 + d() * 7;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((d() - 0.5) * 0.5);
    ctx.fillStyle = 'rgba(4,11,13,0.9)';
    ctx.fillRect(0, 0, pw, ph);
    ctx.strokeStyle = 'rgba(160,186,178,0.10)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, pw, ph);
    ctx.restore();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    column(ctx, 0.94, { t, glowTop: 0.05 });

    const bedY = 1380;
    layer(ctx, cam, 0.08, () => {
      seabed(ctx, bedY, t, { seed: 5, rocks: 1.2, tint: '#0A1C20' });
    });

    // the work lamp: a shallow pool from above-left, plus the hull's own top edge
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pool = radGrad(ctx, 430, 900, 0, 780, [
      [0, hexA(O.pale, 0.105)], [0.4, hexA(O.pale, 0.045)], [1, hexA(O.pale, 0)],
    ]);
    ctx.fillStyle = pool;
    ctx.fillRect(-200, 120, W + 400, 1100);
    ctx.restore();

    layer(ctx, cam, 0.2, () => wreck(ctx, W * 0.5 + 8, bedY + 8, 1.85, t));

    // silt resting against the hull, not a band across the frame
    ctx.save();
    const drift = radGrad(ctx, W * 0.5, bedY + 30, 0, 620, [
      [0, 'rgba(128,144,136,0.14)'], [1, 'rgba(128,144,136,0)'],
    ]);
    ctx.fillStyle = drift;
    ctx.fillRect(-240, bedY - 160, W + 480, 340);
    ctx.restore();

    /* ------------------------------ pressure ---------------------------- */
    const px = 828;
    const py = 520;
    const p = at(t, 2.0, 0.7);
    if (p > 0.01) {
      const filled = clamp((t - 2.1) / 1.6);
      const sw = 404;
      ctx.save();
      ctx.globalAlpha = p;
      tracking(ctx, 'TEKANAN DI DASAR', px, py - 150, { size: 19, font: F.mono6, track: 5, color: hexA(O.pale, 0.45) });
      txt(ctx, '380×', px - 4, py, { size: 122, font: F.num, color: O.amber, track: -4 });
      tracking(ctx, 'TEKANAN PERMUKAAN', px, py + 36, {
        size: 19, font: F.mono6, track: 4, color: hexA(O.pale, 0.55),
      });
      // one atmosphere per ten metres, drawn as a scale that fills as we sink
      drawRule(ctx, px, px + sw, py + 78, 1, { color: O.aqua, a: 0.26, lw: 1.2 });
      for (let i = 0; i <= 10; i++) {
        const tw2 = i % 5 === 0 ? 10 : 6;
        ctx.strokeStyle = hexA(O.aqua, 0.34);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px + (sw * i) / 10, py + 78 - tw2);
        ctx.lineTo(px + (sw * i) / 10, py + 78);
        ctx.stroke();
      }
      // the filled part: 1 atm at the surface, 380 at the wreck
      ctx.strokeStyle = hexA(O.amber, 0.85);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(px, py + 78);
      ctx.lineTo(px + sw * filled, py + 78);
      ctx.stroke();
      ctx.fillStyle = O.amber;
      ctx.beginPath();
      ctx.arc(px + sw * filled, py + 78, 4.5, 0, TAU);
      ctx.fill();
      txt(ctx, '1 ATM', px, py + 112, { size: 16, font: F.mono6, color: hexA(O.pale, 0.34), track: 2 });
      txt(ctx, '380 ATM', px + sw, py + 112, {
        size: 16, font: F.mono6, color: hexA(O.amber, 0.6), track: 2, align: 'right',
      });
      ctx.restore();
    }

    // depth + name
    const q = at(t, 1.1, 0.8);
    ctx.save();
    ctx.globalAlpha = q;
    txt(ctx, '3.800', 132, 728, { size: 130, font: F.num, color: O.bone, track: -4 });
    tracking(ctx, 'METER', 138, 774, { size: 22, font: F.mono6, track: 8, color: hexA(O.pale, 0.55) });
    ctx.restore();
    drawRule(ctx, 132, 132 + 300 * q, 690, 1, { color: O.aqua, a: 0.4 });

    chip(ctx, 'BANGKAI TITANIC · DITEMUKAN 1985', 132, 848, {
      a: at(t, 1.9, 0.7) * 0.92, bg: 'rgba(4,12,14,0.92)', ink: hexA(O.bone, 0.85),
      border: hexA(O.aqua, 0.22), size: 20, track: 3,
    });

    // length scale under the hull
    const sc = at(t, 2.6, 1.0);
    if (sc > 0.01) {
      const x0 = 146;
      const x1 = x0 + 269 * 4.57;
      const sy = 1508;
      ctx.save();
      ctx.globalAlpha = sc * 0.85;
      ctx.strokeStyle = hexA(O.pale, 0.55);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x0, sy);
      ctx.lineTo(lerp(x0, x1, sc), sy);
      ctx.moveTo(x0, sy - 7);
      ctx.lineTo(x0, sy + 7);
      ctx.moveTo(x1, sy - 7);
      ctx.lineTo(x1, sy + 7);
      ctx.stroke();
      // half-way ticks, so the bar reads as a measurement
      for (let i = 1; i < 4; i++) {
        const tx2 = x0 + ((x1 - x0) * i) / 4;
        ctx.globalAlpha = sc * 0.4;
        ctx.beginPath();
        ctx.moveTo(tx2, sy);
        ctx.lineTo(tx2, sy - 5);
        ctx.stroke();
      }
      ctx.globalAlpha = sc * 0.85;
      tracking(ctx, 'PANJANG 269 M', x0, sy - 22, {
        size: 17, font: F.mono6, track: 4, color: hexA(O.pale, 0.55),
      });
      ctx.restore();
    }

    kicker(ctx, 'SAMUDRA · TITANIC', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
