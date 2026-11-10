import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, grain, kicker, chip } from './_kota.mjs';
import { G } from './_garam.mjs';
import { person } from './_figure.mjs';

// 04 — CUACA. One man, one pan, one afternoon. He rakes the salt while the sun
// is out; the cloud wall walks in from the right; he stops, straightens, and
// pulls a tarp over a day's work that is about to be rained on. Everything here
// is drawn: the crust, the light, the rain, and him.

const GROUND = 1470;
const HZ = 1150;          // horizon

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    const rain = at(t, 3.9, 1.2);           // 0 → 1 as the wall arrives
    const cover = at(t, 4.7, 1.0);          // he crouches and pulls the tarp
    const dim = 1 - 0.34 * rain;            // the light leaves the frame

    // ---- sky: warm, then steel
    ctx.save();
    const sky = linGrad(ctx, 0, -120, 0, HZ + 20, [
      [0, mix('#8FA6A6', '#4A5A60', rain)],
      [0.55, mix('#D9CBB0', '#77848A', rain)],
      [1, mix('#F3D8AE', '#9AA5A6', rain)],
    ]);
    ctx.fillStyle = sky;
    ctx.fillRect(-220, -220, W + 440, HZ + 260);
    ctx.restore();

    // the low sun, still there behind the wall
    ctx.save();
    const sunA = (1 - rain * 0.92) * 0.9;
    const sg = radGrad(ctx, 1010, HZ - 130, 20, 620, [
      [0, hexA('#FFE9BE', 0.85 * sunA)], [0.18, hexA('#FFD08A', 0.35 * sunA)], [1, 'rgba(255,208,138,0)'],
    ]);
    ctx.fillStyle = sg;
    ctx.fillRect(300, -200, 1300, 1100);
    ctx.fillStyle = hexA('#FFF4DA', sunA);
    ctx.beginPath();
    ctx.arc(1010, HZ - 130, 56, 0, TAU);
    ctx.fill();
    ctx.restore();

    // ---- far ponds: a few thin bands of water on the horizon
    ctx.save();
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 5; i++) {
      const y = HZ - 6 + i * 14;
      ctx.fillStyle = hexA(G.pond2, 0.35 + i * 0.05);
      ctx.fillRect(-40, y, W + 80, 6);
    }
    ctx.fillStyle = hexA('#E7DCC2', 0.8);
    ctx.fillRect(-40, HZ - 10, W + 80, 5);
    ctx.restore();

    // ---- the pan: cracked crust, a sheen of brine, and the rake's wake
    layer(ctx, cam, 0.16, () => {
      const g = linGrad(ctx, 0, HZ, 0, H + 60, [
        [0, mix('#EFE6D0', '#C9C6BC', rain)],
        [0.35, mix('#FBF6E8', '#DCDAD2', rain)],
        [1, mix('#D8CBB0', '#B7B6AE', rain)],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(-220, HZ, W + 440, H - HZ + 260);

      // crust polygons
      const r = rng(77);
      ctx.lineWidth = 2;
      for (let i = 0; i < 60; i++) {
        const x = -100 + r() * (W + 200);
        const y = HZ + 40 + r() * (H - HZ);
        const s = 30 + r() * 90;
        
        ctx.strokeStyle = `rgba(150,132,102,${0.06 + r() * 0.08})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + s, y - s * 0.25 + r() * 8);
        ctx.lineTo(x + s * 0.6, y + s * 0.35);
        ctx.lineTo(x - s * 0.2, y + s * 0.2);
        ctx.closePath();
        ctx.stroke();
      }
      // raked ridges: the marks a wooden rake leaves in drying salt
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'rgba(146,128,98,0.30)';
      for (let i = 0; i < 26; i++) {
        const yy = HZ + 26 + Math.pow(i / 26, 1.7) * 520;
        const gapY = 26 + Math.pow(i / 26, 1.7) * 40;
        ctx.lineWidth = 1 + i * 0.09;
        ctx.beginPath();
        ctx.moveTo(-80 + (i % 3) * 40, yy);
        ctx.lineTo(W + 80, yy - gapY * 0.12);
        ctx.stroke();
      }
      ctx.restore();

      // wet sheen, brighter when the sun is out
      const sheen = linGrad(ctx, 0, HZ + 30, 0, HZ + 420, [
        [0, 'rgba(255,248,224,0.0)'], [0.45, `rgba(255,248,224,${0.22 * (1 - rain)})`], [1, 'rgba(255,248,224,0)'],
      ]);
      ctx.fillStyle = sheen;
      ctx.fillRect(-100, HZ + 30, W + 200, 420);
    });

    ctx.save();
    const near = linGrad(ctx, 0, 1290, 0, H, [
      [0, 'rgba(96,80,58,0)'], [0.55, `rgba(96,80,58,${0.10 + rain * 0.08})`], [1, `rgba(60,50,38,${0.28 + rain * 0.12})`],
    ]);
    ctx.fillStyle = near;
    ctx.fillRect(-60, 1290, W + 120, H - 1290);
    ctx.restore();

    // ---- the heap he is working on, and the tarp
    const heapX = 968;
    const heapW = 470;
    const heapH = 232;
    const heapY = GROUND - 34;
    ctx.save();
    ctx.fillStyle = radGrad(ctx, heapX, heapY + 10, 4, heapW * 0.6, [[0, 'rgba(40,30,20,0.34)'], [1, 'rgba(40,30,20,0)']]);
    ctx.fillRect(heapX - heapW, heapY - 30, heapW * 2, 90);
    const hg = linGrad(ctx, heapX - heapW / 2, heapY - heapH, heapX + heapW / 2, heapY, [
      [0, mix('#FFFFFF', '#E8E6DC', rain)], [0.55, mix('#F4ECDA', '#DCDAD0', rain)], [1, mix('#CDBB98', '#B6B4AA', rain)],
    ]);
    ctx.beginPath();
    ctx.moveTo(heapX - heapW / 2, heapY);
    ctx.quadraticCurveTo(heapX - heapW * 0.3, heapY - heapH * 0.62, heapX, heapY - heapH);
    ctx.quadraticCurveTo(heapX + heapW * 0.3, heapY - heapH * 0.62, heapX + heapW / 2, heapY);
    ctx.closePath();
    ctx.fillStyle = hg;
    ctx.fill();
    // tarp pulled over it, animated by `cover`
    if (cover > 0.01) {
      ctx.save();
      ctx.globalAlpha = cover;
      const tw = heapW * (0.5 + 0.55 * cover);
      const th = heapH * (0.35 + 0.6 * cover);
      const tg = linGrad(ctx, heapX - tw / 2, heapY - th, heapX + tw / 2, heapY, [
        [0, '#5C8390'], [0.5, '#3E6070'], [1, '#263F4B'],
      ]);
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.moveTo(heapX - tw / 2, heapY + 6);
      ctx.quadraticCurveTo(heapX - tw * 0.34, heapY - th, heapX, heapY - th * 1.04);
      ctx.quadraticCurveTo(heapX + tw * 0.34, heapY - th, heapX + tw / 2, heapY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // ---- the man
    const manH = 540;
    const manX = 620;
    const raking = clamp(1 - at(t, 4.2, 1.0));
    // a slow raking rhythm: two strokes per second and a half
    const swing = Math.sin(t * 2.4) * 0.5 + 0.5;
    const poseNow = cover > 0.35 ? 'cover' : 'rake';
    ctx.save();
    // his shadow, long, toward the camera
    ctx.fillStyle = 'rgba(40,30,20,0.26)';
    ctx.beginPath();
    ctx.ellipse(manX + 40, GROUND + 6, 210, 34, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    person(ctx, manX, GROUND, manH, {
      pose: poseNow,
      facing: 1,
      rake: raking,
      tarp: cover,
      cloth: mix('#E6DFC9', '#C8C4B4', rain),
      alpha: 1,
    });

    // a second, smaller worker further back for depth
    person(ctx, 268, GROUND - 118, 286, {
      pose: 'watch',
      facing: 1,
      cloth: mix('#CFC7B4', '#B9B5A8', rain),
      alpha: 0.9,
    });

    // ---- the cloud wall and the rain
    if (rain > 0.01) {
      ctx.save();
      const edge = lerp(W + 520, -80, E.inOut(at(t, 3.9, 3.0)));
      for (let i = 0; i < 8; i++) {
        const y = -120 + i * 260;
        const rr = 240 + 70 * Math.sin(i * 2.1);
        const g2 = radGrad(ctx, edge + 120, y, 20, rr, [
          [0, `rgba(58,62,66,${0.5 * rain})`], [1, 'rgba(58,62,66,0)'],
        ]);
        ctx.fillStyle = g2;
        ctx.fillRect(edge - rr + 120, y - rr, rr * 2, rr * 2);
      }
      // the falling sheet
      const sheet = linGrad(ctx, edge - 280, 0, edge + 200, 0, [
        [0, 'rgba(70,80,86,0)'], [0.55, `rgba(70,80,86,${0.34 * rain})`], [1, `rgba(70,80,86,${0.5 * rain})`],
      ]);
      ctx.fillStyle = sheet;
      ctx.fillRect(edge - 280, -80, W + 300 - (edge - 280), H + 160);
      // rain
      const r2 = rng(41);
      ctx.strokeStyle = `rgba(226,236,238,${0.5 * rain})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 260; i++) {
        const x = edge - 120 + r2() * Math.max(1, W + 240 - (edge - 120));
        const y = r2() * H;
        const len = 40 + r2() * 60;
        ctx.globalAlpha = rain * (0.25 + r2() * 0.5);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y + len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ---- the light leaves, then the counter
    if (rain > 0.01) {
      ctx.save();
      ctx.globalAlpha = dim < 1 ? 1 - dim : 0;
      ctx.restore();
    }

    const cA = at(t, 0.5, 0.9);
    if (cA > 0.01) {
      ctx.save();
      ctx.globalAlpha = cA;
      fillRR(ctx, 72, 236, 330, 196, 6, 'rgba(18,13,10,0.82)');
      ctx.fillStyle = hexA(G.sun, 0.95);
      ctx.fillRect(100, 270, 40, 4);
      txt(ctx, 'PANEN', 148, 278, { size: 21, font: F.mono6, color: 'rgba(251,246,236,0.66)', track: 5 });
      const lvl = clamp(1 - at(t, 3.9, 1.6));
      txt(ctx, `${Math.round(lerp(0, 100, lvl))}%`, 100, 386, {
        size: 82, font: F.num, color: lvl > 0.4 ? G.bone : '#EE9C7E', track: -2,
      });
      ctx.fillStyle = 'rgba(251,246,236,0.16)';
      ctx.fillRect(100, 404, 274, 5);
      ctx.fillStyle = lvl > 0.4 ? 'rgba(251,246,236,0.75)' : '#EE9C7E';
      ctx.fillRect(100, 404, 274 * lvl, 5);
      ctx.restore();
    }

    const kA = at(t, 0.4, 0.6) * (1 - at(t, 3.4, 0.6));
    if (kA > 0.01) chip(ctx, 'MUSIM KEMARAU', 96, 500, { a: kA, bg: 'rgba(18,13,10,0.8)', ink: G.bone, border: hexA(G.sun, 0.5) });
    const kB = at(t, 4.3, 0.8);
    if (kB > 0.01) chip(ctx, 'SATU HUJAN = PANEN HILANG', 96, 500, { a: kB, bg: 'rgba(14,18,20,0.86)', ink: G.bone, border: hexA('#8FB6BC', 0.6) });

    grain(ctx, 0.035);
  },
};

function mix(a, b, k) {
  const p = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const f = (x, y) => Math.round(lerp(x, y, clamp(k))).toString(16).padStart(2, '0');
  return `#${f(r1, r2)}${f(g1, g2)}${f(b1, b2)}`;
}
