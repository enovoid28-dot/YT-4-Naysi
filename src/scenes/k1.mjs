import { W, H, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { K, E, at, layer, fillAll, stars, grain, chip } from './_kota.mjs';
import { P, sawah, clump, blades, PA } from './_padi.mjs';
import { person, speck } from './_figure.mjs';

// 01 — EMPAT KOMA LIMA. Dawn over a paddy. Water, green, a road of mud between
// the plots, and one man walking it. The number arrives quietly, because it is
// the only thing in the frame that is not growing.

const HZ = 905;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    // sky: night giving up
    ctx.save();
    const g = linGrad(ctx, 0, -140, 0, HZ + 30, [
      [0, '#1B2F33'], [0.42, '#3B5054'], [0.72, '#8E8A6E'], [1, '#D9AE72'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, HZ + 300);
    ctx.restore();
    stars(ctx, { n: 40, seed: 13, t, bottom: 420, a: 0.22 * (1 - at(t, 0.2, 3)) });

    // the sun, still under the hill
    const sunA = at(t, 0.4, 2.4);
    ctx.save();
    ctx.globalAlpha = sunA;
    const sg = radGrad(ctx, 980, HZ + 10, 10, 620, [[0, 'rgba(255,214,150,0.55)'], [0.3, 'rgba(255,196,120,0.18)'], [1, 'rgba(255,196,120,0)']]);
    ctx.fillStyle = sg;
    ctx.fillRect(240, -200, 1400, 1200);
    ctx.restore();

    // far hills, two layers
    layer(ctx, cam, 0.1, () => {
      ctx.fillStyle = 'rgba(40,54,50,0.55)';
      ctx.beginPath();
      ctx.moveTo(-200, HZ + 6);
      for (let x = -200; x <= W + 200; x += 60) {
        const y = HZ - 40 - Math.sin(x * 0.0032) * 46 - Math.sin(x * 0.0011 + 2) * 26;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W + 200, HZ + 40);
      ctx.lineTo(-200, HZ + 40);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(26,38,34,0.8)';
      ctx.beginPath();
      ctx.moveTo(-200, HZ + 10);
      for (let x = -200; x <= W + 200; x += 40) {
        const y = HZ - 12 - Math.sin(x * 0.006 + 1) * 18 - Math.sin(x * 0.0023) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W + 200, HZ + 60);
      ctx.lineTo(-200, HZ + 60);
      ctx.closePath();
      ctx.fill();
    });

    // a low treeline where the field meets the hill
    layer(ctx, cam, 0.13, () => {
      ctx.save();
      ctx.fillStyle = 'rgba(34,48,38,0.82)';
      ctx.beginPath();
      ctx.moveTo(-60, HZ + 30);
      for (let x = -60; x <= W + 60; x += 18) {
        const y = HZ - 12 - (Math.sin(x * 0.021) * 0.5 + 0.5) * 34 - (Math.sin(x * 0.0057 + 1.7) * 0.5 + 0.5) * 44;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W + 60, HZ + 30);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(22,34,26,0.85)';
      ctx.beginPath();
      ctx.moveTo(-60, HZ + 30);
      for (let x = -60; x <= W + 60; x += 11) {
        const y = HZ - 4 - (Math.sin(x * 0.047 + 0.8) * 0.5 + 0.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W + 60, HZ + 30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // the plots
    layer(ctx, cam, 0.16, () => {
      sawah(ctx, { y0: HZ + 6, y1: 1760, rows: 12, cols: 13, seed: 9, t, mature: 0.3 + 0.1 * Math.sin(t * 0.2), water: 0.7, bund: 0.05, haze: '#C2B491' });
    });

    // a mud track through the plots, and the man walking it
    layer(ctx, cam, 0.24, () => {
      // the track: a quadratic curve from the near corner to the horizon
      const A = { x: 250, y: 1740 };
      const C = { x: 620, y: 1330 };
      const B = { x: 1010, y: 930 };
      const at2 = (u) => ({
        x: (1 - u) * (1 - u) * A.x + 2 * (1 - u) * u * C.x + u * u * B.x,
        y: (1 - u) * (1 - u) * A.y + 2 * (1 - u) * u * C.y + u * u * B.y,
      });
      const wAt = (u) => lerp(104, 13, Math.pow(u, 0.8));
      const N = 26;
      const left = [];
      const right = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const p = at2(u);
        const q = at2(Math.min(1, u + 0.01));
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const w = wAt(u) / 2;
        left.push([p.x + nx * w, p.y + ny * w]);
        right.push([p.x - nx * w, p.y - ny * w]);
      }
      const band = (off, fill) => {
        ctx.beginPath();
        left.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + off) : ctx.moveTo(x, y + off)));
        for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1] + off);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      };
      const rA = at(t, 0.6, 1.2);
      ctx.save();
      ctx.globalAlpha = rA;
      band(8, 'rgba(24,18,10,0.30)');
      band(0, '#9E8760');
      // wet centre of the track
      ctx.globalAlpha = rA * 0.55;
      band(0, 'rgba(0,0,0,0)');
      ctx.beginPath();
      left.forEach(([x, y], i) => (i ? ctx.lineTo(x * 1 + 0, y + 2) : ctx.moveTo(x, y + 2)));
      ctx.strokeStyle = 'rgba(58,46,30,0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // the walker
      ctx.save();
      ctx.globalAlpha = rA;
      const walk = E.inOut(at(t, 0.4, scene.dur * 0.95));
      const u = lerp(0.10, 0.74, walk);
      const p = at2(u);
      const h = lerp(340, 160, u);
      ctx.fillStyle = 'rgba(16,12,6,0.35)';
      ctx.beginPath();
      ctx.ellipse(p.x + 6, p.y + h * 0.02, h * 0.2, h * 0.045, 0, 0, TAU);
      ctx.fill();
      person(ctx, p.x, p.y, h, {
        pose: 'walk', facing: -1, cloth: '#D2C9B0', rim: 0.75, hat: 1,
      });
      ctx.restore();

      // two more, further off, on the next bund
      speck(ctx, 470, 1002, 5, { a: rA * 0.75 });
      speck(ctx, 548, 1018, 5.4, { a: rA * 0.75 });
    });

    // foreground rice, out of focus
    layer(ctx, cam, 0.5, () => {
      const a = at(t, 0.2, 1.2);
      for (let i = 0; i < 8; i++) {
        blades(ctx, -40 + i * 52, H + 30, 700 + (i % 3) * 120, {
          n: 5, a: a * 0.5, seed: 20 + i, t, tone: '#1E3322', spread: 1.2, lean: -0.12,
        });
        blades(ctx, W + 40 - i * 54, H + 40, 740 + (i % 4) * 110, {
          n: 5, a: a * 0.48, seed: 40 + i, t, tone: '#1B2E20', spread: 1.2, lean: 0.1,
        });
      }
    });

    // ---- the number
    const pA = at(t, 1.2, 1.0);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      const px = 72;
      const py = 1130;
      const pw = 720;
      const ph = 340;
      ctx.save();
      ctx.shadowColor = 'rgba(8,6,4,0.45)';
      ctx.shadowBlur = 44;
      ctx.shadowOffsetY = 16;
      fillRR(ctx, px, py, pw, ph, 6, 'rgba(14,18,14,0.90)');
      ctx.restore();
      ctx.fillStyle = hexA(P.gold, 0.95);
      ctx.fillRect(px + 34, py + 40, 46, 4);
      txt(ctx, 'IMPOR BERAS · 2024', px + 94, py + 48, {
        size: 22, font: F.mono6, color: 'rgba(251,246,234,0.7)', track: 5,
      });
      const c = E.out(at(t, 1.3, 1.6));
      const v = (lerp(0, 4.52, c)).toFixed(2).replace('.', ',');
      txt(ctx, v, px + 34, py + 208, { size: 140, font: F.num, color: P.bone, track: -5 });
      txt(ctx, 'JUTA TON', px + 38, py + 262, { size: 26, font: F.mono6, color: hexA(P.gold, 0.95), track: 6 });
      txt(ctx, 'tertinggi dalam tujuh tahun', px + 38, py + 306, {
        size: 28, font: F.body, color: 'rgba(251,246,234,0.6)',
      });
      ctx.restore();
    }

    const cA = at(t, 7.4, 0.9);
    if (cA > 0.01) chip(ctx, 'DARI THAILAND · VIETNAM · PAKISTAN', 74, 1516, { a: cA, bg: 'rgba(14,18,14,0.82)', ink: P.bone, border: hexA(P.gold, 0.5) });

    grain(ctx, 0.045);
  },
};
