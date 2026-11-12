import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, snow, drawRule, motes } from './_ocean.mjs';

// 04 — TITANIC. A wreck on the abyssal plain, lit by one lamp. The pressure is
// the point: every ten metres of water is another atmosphere, all the way down.

function seabed(ctx, y, t, { seed = 5 } = {}) {
  const r = rng(seed);
  const g = linGrad(ctx, 0, y - 40, 0, y + 260, [[0, '#0A1A1E'], [1, '#040C10']]);
  ctx.fillStyle = g;
  ctx.fillRect(-260, y, W + 520, H - y + 260);
  // sediment ripples
  ctx.save();
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 22; i++) {
    const yy = y + 12 + i * 9 + r() * 6;
    ctx.strokeStyle = hexA(O.dust, 0.10 + r() * 0.10);
    ctx.lineWidth = 1 + r();
    ctx.beginPath();
    for (let x = -120; x <= W + 120; x += 26) {
      const dy = Math.sin(x * 0.008 + i * 0.6 + t * 0.15) * (3 + i * 0.2);
      if (x === -120) ctx.moveTo(x, yy + dy);
      else ctx.lineTo(x, yy + dy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function wreck(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // hull, bow to the left, settling into the sediment
  ctx.beginPath();
  ctx.moveTo(-330, 0);
  ctx.lineTo(-300, -96);
  ctx.lineTo(250, -110);
  ctx.lineTo(320, -30);
  ctx.lineTo(300, 0);
  ctx.closePath();
  ctx.fillStyle = '#050D10';
  ctx.fill();
  ctx.strokeStyle = hexA(O.pale, 0.16);
  ctx.lineWidth = 2.2;
  ctx.stroke();
  // superstructure + funnels
  for (let i = 0; i < 3; i++) {
    const fx = -150 + i * 118;
    const broken = i === 2;
    ctx.save();
    ctx.translate(fx, -104);
    ctx.shadowColor = hexA(O.pale, 0.18);
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#071417';
    ctx.fillRect(-26, broken ? -46 : -88, 52, broken ? 46 : 88);
    if (!broken) { ctx.beginPath(); ctx.ellipse(0, -88, 26, 9, 0, 0, Math.PI * 2); ctx.fillStyle = '#0A1A1E'; ctx.fill(); }
    ctx.strokeStyle = hexA(O.dust, 0.12);
    ctx.strokeRect(-26, broken ? -46 : -88, 52, broken ? 46 : 88);
    ctx.restore();
  }
  // bridge block
  ctx.fillStyle = '#071317';
  ctx.fillRect(-210, -150, 74, 56);
  ctx.strokeStyle = hexA(O.dust, 0.14);
  ctx.strokeRect(-210, -150, 74, 56);
  // debris field
  ctx.fillStyle = 'rgba(4,12,14,0.9)';
  for (let i = 0; i < 14; i++) {
    const dx = -380 + i * 56 + Math.sin(i * 2.1) * 14;
    ctx.fillRect(dx, -6 + Math.sin(i) * 4, 22 + (i % 4) * 8, 5);
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    column(ctx, 0.92, { t, glowTop: 0.06 });

    const bedY = 1218;
    layer(ctx, cam, 0.1, () => {
      // a soft haze along the bottom separates the hull from open water
      const hz = linGrad(ctx, 0, bedY - 420, 0, bedY + 40, [[0, 'rgba(10,34,36,0)'], [1, 'rgba(14,44,46,0.55)']]);
      ctx.fillStyle = hz;
      ctx.fillRect(-260, bedY - 420, W + 520, 470);
      seabed(ctx, bedY, t);
    });
    layer(ctx, cam, 0.22, () => wreck(ctx, W * 0.5, bedY + 34, 1.85, t));

    snow(ctx, t, { n: 150, seed: 44, a: 0.34, speed: 12, scale: 1.05 });

    // one soft pool of work light, no hard cone
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pool = radGrad(ctx, W * 0.34, bedY - 60, 0, 620, [[0, hexA(O.pale, 0.14)], [1, hexA(O.pale, 0)]]);
    ctx.fillStyle = pool;
    ctx.fillRect(-200, bedY - 700, W + 400, 780);
    ctx.restore();
    motes(ctx, 260, 1180, 420, { t, a: 0.28, n: 30, seed: 8 });

    /* ------------------------------ pressure ---------------------------- */
    const px = 888;
    const py = 470;
    const p = at(t, 2.4, 0.7);
    if (p > 0.01) {
      const filled = Math.round(EASE_out(clamp((t - 2.6) / 2.6)) * 38);
      ctx.save();
      ctx.globalAlpha = p;
      tracking(ctx, 'TEKANAN', px, py - 36, { size: 20, font: F.mono6, track: 5, color: hexA(O.pale, 0.5) });
      // 38 columns, one per 100 m
      for (let i = 0; i < 38; i++) {
        const x = px + i * 10.5;
        const on = i < filled;
        ctx.fillStyle = on ? hexA(O.amber, 0.85) : hexA(O.bone, 0.10);
        fillRR(ctx, x, py - (on ? 56 : 8), 6, on ? 56 : 8, 2, ctx.fillStyle);
      }
      txt(ctx, `${Math.round(filled * 10)}`, px, py + 66, { size: 54, font: F.num, color: O.amber, track: -2 });
      tracking(ctx, '× TEKANAN PERMUKAAN', px + 96, py + 62, {
        size: 18, font: F.mono6, track: 4, color: hexA(O.pale, 0.5),
      });
      ctx.restore();
    }

    // depth + name
    const q = at(t, 1.2, 0.8);
    ctx.save();
    ctx.globalAlpha = q;
    txt(ctx, '3.800', 132, 700, { size: 132, font: F.num, color: O.bone, track: -4 });
    tracking(ctx, 'METER', 138, 748, { size: 22, font: F.mono6, track: 8, color: hexA(O.pale, 0.55) });
    ctx.restore();
    drawRule(ctx, 132, 132 + 300 * q, 660, 1, { color: O.aqua, a: 0.4 });

    chip(ctx, 'BANGKAI TITANIC · DITEMUKAN 1985', 132, 830, {
      a: at(t, 2.0, 0.7) * 0.92, bg: 'rgba(4,12,14,0.72)', ink: hexA(O.bone, 0.85),
      border: hexA(O.aqua, 0.22), size: 20, track: 3,
    });

    kicker(ctx, 'SAMUDRA · TITANIC', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};

function EASE_out(x) {
  return 1 - Math.pow(1 - x, 3);
}
