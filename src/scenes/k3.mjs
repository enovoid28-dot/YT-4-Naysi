import { W, H, txt, hexA, fillRR, strokeRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip } from './_kota.mjs';
import { G, gauge } from './_garam.mjs';

// 03 — KADARNYA. Two lumps of the same mineral, side by side, at the same size.
// The left one is what the ponds give; the right one is what a factory needs.
// Everything is in the percentage, not in the sea.

const CY = 660;      // crystal centre
const SIZE = 520;

function crystal(ctx, x, y, s, { rough = false, a = 1, t = 0, seed = 3 } = {}) {
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  // shadow
  ctx.fillStyle = radGrad(ctx, x, y + s * 0.62, 6, s * 0.6, [[0, 'rgba(30,22,16,0.30)'], [1, 'rgba(30,22,16,0)']]);
  ctx.fillRect(x - s * 0.8, y + s * 0.3, s * 1.6, s * 0.6);

  const body = rough ? '#D9C7A6' : '#FDFCF8';
  const g = linGrad(ctx, x - s / 2, y - s / 2, x + s / 2, y + s / 2, [
    [0, rough ? '#E8DCC2' : '#FFFFFF'],
    [0.5, body],
    [1, rough ? '#A98F69' : '#CFD6CF'],
  ]);
  // faceted outline: a crystal, not a box
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y - s * 0.22);
  ctx.lineTo(x - s * 0.2, y - s * 0.52);
  ctx.lineTo(x + s * 0.34, y - s * 0.46);
  ctx.lineTo(x + s * 0.5, y - s * 0.05);
  ctx.lineTo(x + s * 0.38, y + s * 0.44);
  ctx.lineTo(x - s * 0.12, y + s * 0.52);
  ctx.lineTo(x - s * 0.48, y + s * 0.18);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = rough ? 'rgba(120,96,64,0.35)' : 'rgba(90,110,105,0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // internal facets
  ctx.save();
  ctx.globalAlpha *= 0.5;
  ctx.strokeStyle = rough ? 'rgba(120,96,64,0.5)' : 'rgba(120,150,145,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < (rough ? 7 : 4); i++) {
    const a1 = r() * TAU;
    const a2 = a1 + 1.2 + r();
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a1) * s * 0.35, y + Math.sin(a1) * s * 0.35);
    ctx.lineTo(x + Math.cos(a2) * s * 0.3, y + Math.sin(a2) * s * 0.3);
    ctx.stroke();
  }
  ctx.restore();

  // impurities / purity: dots of clay on the left, nothing on the right
  if (rough) {
    ctx.fillStyle = 'rgba(110,80,48,0.55)';
    for (let i = 0; i < 90; i++) {
      const u = r() * TAU;
      const v = Math.sqrt(r()) * s * 0.42;
      ctx.fillRect(x + Math.cos(u) * v, y + Math.sin(u) * v * 0.9, 3 + r() * 5, 3 + r() * 5);
    }
  } else {
    // a moving specular highlight
    const hx = x + Math.sin(t * 0.7) * s * 0.1;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.06, y - s * 0.4);
    ctx.lineTo(hx + s * 0.1, y - s * 0.34);
    ctx.lineTo(hx + s * 0.02, y - s * 0.02);
    ctx.lineTo(hx - s * 0.12, y - s * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    fillAll(ctx, G.paper);
    // a warm key from the upper left, a cool fill from the right
    ctx.save();
    const g1 = radGrad(ctx, 320, 260, 40, 1100, [[0, 'rgba(243,167,95,0.30)'], [1, 'rgba(243,167,95,0)']]);
    ctx.fillStyle = g1;
    ctx.fillRect(-200, -200, W + 400, H + 400);
    const g2 = radGrad(ctx, 1180, 900, 40, 900, [[0, 'rgba(120,180,175,0.22)'], [1, 'rgba(120,180,175,0)']]);
    ctx.fillStyle = g2;
    ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.restore();

    kicker(ctx, 'KADAR NATRIUM KLORIDA', { x: 96, y: 262, a: at(t, 0.2, 0.6), color: G.rust, ink: 'rgba(20,15,12,0.75)' });

    // left crystal: what the ponds give
    const lA = at(t, 0.35, 0.9);
    layer(ctx, cam, 0.16, () => crystal(ctx, 420, CY, SIZE, { rough: true, a: lA, t, seed: 7 }));
    const lc = at(t, 0.9, 1.2);
    if (lc > 0.01) {
      ctx.save();
      ctx.globalAlpha = lc;
      txt(ctx, 'GARAM RAKYAT', 420, CY + 396, { size: 26, font: F.mono6, color: 'rgba(20,15,12,0.6)', align: 'center', track: 5 });
      const v = Math.round(lerp(88, 90, lc));
      txt(ctx, `${v}%`, 420, CY + 340, { size: 96, font: F.num, color: G.ink, align: 'center', track: -3 });
      txt(ctx, 'kebanyakan di bawah 90', 420, CY + 446, { size: 27, font: F.body, color: 'rgba(20,15,12,0.55)', align: 'center' });
      ctx.restore();
    }

    // right crystal: what the factory needs
    const rA = at(t, 1.5, 0.9);
    layer(ctx, cam, 0.16, () => crystal(ctx, 1024, CY, SIZE * 1.02, { rough: false, a: rA, t, seed: 4 }));
    const rc = at(t, 2.1, 1.2);
    if (rc > 0.01) {
      ctx.save();
      ctx.globalAlpha = rc;
      txt(ctx, 'GARAM INDUSTRI', 1024, CY + 396, { size: 26, font: F.mono6, color: hexA(G.rust2, 0.85), align: 'center', track: 5 });
      const v = Math.round(lerp(90, 97, rc));
      txt(ctx, `${v}%`, 1024, CY + 340, { size: 96, font: F.num, color: G.ink, align: 'center', track: -3 });
      txt(ctx, 'minimal 97 untuk bahan baku', 1024, CY + 446, { size: 27, font: F.body, color: 'rgba(20,15,12,0.55)', align: 'center' });
      ctx.restore();
    }

    // the distance between them: a ruler, and the threshold that matters
    const gA = at(t, 3.2, 1.0);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha = gA;
      const gx = 168;
      const gw = W - 336;
      const gy = 1330;
      txt(ctx, 'PERSEN NaCl', gx, gy - 44, { size: 22, font: F.mono6, color: 'rgba(20,15,12,0.5)', track: 5 });
      gauge(ctx, gx, gy, gw, { a: 1, t });
      // threshold at 97
      const px = gx + ((97 - 80) / 20) * gw;
      ctx.strokeStyle = G.rust;
      ctx.lineWidth = 3;
      ctx.setLineDash([9, 8]);
      ctx.beginPath();
      ctx.moveTo(px, gy - 62);
      ctx.lineTo(px, gy + 66);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, 'AMBANG INDUSTRI', px, gy - 78, { size: 22, font: F.mono6, color: G.rust, track: 4, align: 'center' });
      // the two measured marks
      const m1 = gx + ((90 - 80) / 20) * gw;
      const m2 = px;
      ctx.fillStyle = 'rgba(20,15,12,0.85)';
      ctx.beginPath();
      ctx.arc(m1, gy + 2, 9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = G.rust;
      ctx.beginPath();
      ctx.arc(m2, gy + 2, 9, 0, TAU);
      ctx.fill();
      // the gap, bracketed
      ctx.strokeStyle = 'rgba(20,15,12,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m1, gy + 96);
      ctx.lineTo(m2, gy + 96);
      ctx.moveTo(m1, gy + 86);
      ctx.lineTo(m1, gy + 106);
      ctx.moveTo(m2, gy + 86);
      ctx.lineTo(m2, gy + 106);
      ctx.stroke();
      txt(ctx, 'SELISIHNYA YANG MENENTUKAN', (m1 + m2) / 2, gy + 146, {
        size: 24, font: F.mono6, color: 'rgba(20,15,12,0.55)', track: 4, align: 'center',
      });
      ctx.restore();
    }

    grain(ctx, 0.035);
  },
};
