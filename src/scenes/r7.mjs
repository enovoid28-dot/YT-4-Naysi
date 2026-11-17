import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, say, micro, number, txt, hexA, TAU, clamp, lerp, rng, noiseWall, wash,
} from './_langit.mjs';

// 07 — SISA CAHAYA
// The first light of the universe is still everywhere. Switch the sky to its
// oldest layer and it reads as a receiver: static, 2.7 kelvin, in every direction.

const B = 90;

export default {
  draw(ctx, t, scene) {
    sky(ctx, { key: 'r7', band: 0.18, hills: false, glowY: 1720 });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const wDua = cueWord(scene, 2, 'dua');

    // caption 1 — the proof
    say(ctx, ['BUKTINYA.'], 104, 320, {
      t, size: 106, at: c[0], stagger: 0.08, a: 1 - A(t, c[1], 0.45, ease.out),
    });

    // caption 2 — the wash of first light, arriving from every side at once
    const p2 = A(t, c[1], 0.7, ease.out);
    const cover = A(t, c[1] + 0.2, 2.2, ease.inOut);
    if (p2 > 0.01) {
      const dim = 1 - 0.45 * A(t, c[3], 0.6);
      // a warm bloom behind the static: this was visible light once
      ctx.save();
      ctx.globalAlpha = p2 * cover * 0.55;
      const g = ctx.createRadialGradient(720, 760, 20, 720, 760, 860);
      g.addColorStop(0, 'rgba(255,214,150,0.26)');
      g.addColorStop(0.5, 'rgba(120,110,255,0.13)');
      g.addColorStop(1, 'rgba(60,60,140,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-B, -B, W + 2 * B, H * 0.92 + B);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(-B, -B, W + 2 * B, H * (0.16 + 0.76 * cover) + B);
      ctx.clip();
      ctx.globalAlpha = p2 * 0.78 * dim;
      noiseWall(ctx, t, W + 2 * B, H * 0.92 + B, -B, -B, { cell: 10, a: 1 });
      ctx.restore();
    }

    // caption 3 — 2.7 kelvin
    const p3 = A(t, wDua - 0.2, 0.6, ease.expo);
    const out3 = 1 - A(t, c[3], 0.5, ease.out);
    if (p3 > 0.01 && out3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p3, out3);
      wash(ctx, 320, 680, 0.90);
      number(ctx, '2,7', 720, 560, { size: 176, color: L.ice, align: 'center', a: A(t, wDua, 0.5, ease.expo) });
      micro(ctx, 'KELVIN', 720, 626, { size: 30, color: L.star, align: 'center', track: 13, a: A(t, wDua + 0.3, 0.5) });
      ctx.restore();
      // a cold scale, with the marker almost at zero
      ctx.save();
      ctx.globalAlpha = Math.min(p3, out3) * 0.9;
      const sw = 1040;
      const sx = 200;
      const sy = 1010;
      const g = ctx.createLinearGradient(sx, 0, sx + sw, 0);
      g.addColorStop(0, 'rgba(80,120,255,0.85)');
      g.addColorStop(0.45, 'rgba(143,216,255,0.8)');
      g.addColorStop(1, 'rgba(255,233,184,0.85)');
      ctx.fillStyle = g;
      ctx.fillRect(sx, sy, sw, 8);
      const q = A(t, c[2] + 0.3, 1.4, ease.inOut);
      const mx = sx + sw * 0.055 * q;
      ctx.fillStyle = L.star;
      ctx.shadowColor = hexA(L.ice, 0.9);
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(mx, sy + 4, 11, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      micro(ctx, '0 K', sx, sy + 56, { size: 21, color: 'rgba(143,216,255,0.8)', track: 4 });
      micro(ctx, '300 K', sx + sw, sy + 56, { size: 21, color: L.warm, align: 'right', track: 4 });
      ctx.restore();
    }

    // caption 4 — the name of it
    const p4 = A(t, c[3], 0.8, ease.expo);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4;
      wash(ctx, 260, 690, 0.94);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = p4;
      micro(ctx, 'NAMA LAIN DARI CAHAYA PERTAMA', 112, 300, { size: 23, color: L.ice, track: 6 });
      say(ctx, ['LATAR', 'GELOMBANG', 'MIKRO', 'KOSMIK'], 112, 396, { t, size: 94, at: c[3] + 0.1, stagger: 0.07, lineH: 1.0 });
      ctx.restore();
    }
  },
};
