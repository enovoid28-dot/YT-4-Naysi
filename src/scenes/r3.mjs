import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, life, say, micro, number, txt, hexA, fillRR, TAU, clamp, lerp, rng,
} from './_langit.mjs';

// 03 — SKALA
// The count arrives as a swarm of dots, then the zeros, then two rulers: the
// eight minutes to the Sun and the four years to the next star.

const ZEROS = '200000000000000000000000';

export default {
  draw(ctx, t, scene) {
    sky(ctx, { key: 'r3', band: 0.4 });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const wDua = cueWord(scene, 0, 'dua');

    // caption 1 — the swarm
    const p1 = A(t, c[0], 0.6, ease.out);
    const out1 = 1 - A(t, c[1], 0.22, ease.out);
    if (p1 > 0.01) {
      const swarm = A(t, wDua - 0.5, 1.4, ease.out);
      const r = rng(77);
      ctx.save();
      ctx.globalAlpha = Math.min(1, p1) * (1 - 0.55 * A(t, c[1], 0.6));
      for (let i = 0; i < 420; i++) {
        const x = 90 + r() * 1260;
        const y = 260 + r() * 520 * swarm;
        ctx.fillStyle = `rgba(255,248,236,${0.20 + r() * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + r() * 2.2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      if (out1 > 0.01) {
        ctx.save();
        ctx.globalAlpha = Math.min(p1, out1);
        micro(ctx, 'BINTANG DI ALAM SEMESTA TERAMATI', 104, 250, { size: 26, color: L.ice, track: 7 });
        number(ctx, '200', 96, 900, { size: 170, color: L.star, a: A(t, wDua, 0.5, ease.expo) });
        micro(ctx, 'SEXTILLION', 100, 962, { size: 30, color: L.warm, track: 10, a: A(t, wDua + 0.2, 0.5) });
        ctx.restore();
      }
    }

    // caption 2 — the zeros, written out
    const p2 = A(t, c[1], 0.6, ease.expo);
    const out2 = 1 - A(t, c[2], 0.4, ease.out);
    if (p2 > 0.01 && out2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p2, out2);
      micro(ctx, 'DUA DIKUTI DUA PULUH TIGA NOL', 100, 420, { size: 24, color: L.ice, track: 6 });
      const zeros = ZEROS.slice(1);
      zeros.split('').forEach((z, i) => {
        const q = A(t, c[1] + 0.34 + i * 0.035, 0.35);
        txt(ctx, z, 104 + (i % 12) * 104, 640 + Math.floor(i / 12) * 150, {
          size: 96, font: F.num, color: hexA(L.star, 0.35 + q * 0.6), track: -3,
        });
      });
      const q = A(t, c[1] + 1.1, 0.6, ease.expo);
      if (q > 0.01) {
        ctx.globalAlpha = Math.min(p2, out2) * q;
        number(ctx, '10²³', 700, 1120, { size: 150, color: L.gold, align: 'center' });
      }
      ctx.restore();
    }

    // caption 3 — light from the Sun takes eight minutes
    const p3 = A(t, c[2], 0.6, ease.out);
    const out3 = 1 - A(t, c[3], 0.4, ease.out);
    if (p3 > 0.01 && out3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p3, out3);
      // the sun, low and warm
      const sx = 1280;
      const sy = 420;
      const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 220);
      sg.addColorStop(0, 'rgba(255,246,220,1)');
      sg.addColorStop(0.35, 'rgba(255,206,120,0.85)');
      sg.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(sx - 240, sy - 240, 480, 480);
      ctx.fillStyle = L.star;
      ctx.beginPath();
      ctx.arc(sx, sy, 74, 0, TAU);
      ctx.fill();
      const p = A(t, c[2] + 0.3, 1.8, ease.inOut);
      ctx.strokeStyle = hexA(L.gold, 0.7);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(120, 1120);
      ctx.lineTo(120 + 1100 * p, 1120);
      ctx.stroke();
      ctx.fillStyle = L.gold;
      ctx.shadowColor = hexA(L.gold, 0.9);
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(120 + 1100 * p, 1120, 12, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      micro(ctx, 'MATAHARI → BUMI', 120, 1060, { size: 26, color: L.warm, track: 8 });
      number(ctx, '8 MENIT', 120, 1290, { size: 96, color: L.star, a: A(t, c[2] + 1.6, 0.6) });
      ctx.restore();
    }

    // caption 4 — the nearest star is four years away
    const p4 = A(t, c[3], 0.7, ease.expo);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4;
      micro(ctx, 'BINTANG TERDEKAT', 104, 360, { size: 25, color: L.ice, track: 9 });
      txt(ctx, 'PROXIMA', 104, 470, { size: 76, font: F.display, color: L.star, track: 2 });
      number(ctx, '4 TAHUN', 104, 690, { size: 150, color: L.gold });
      micro(ctx, 'CAHAYA BUTUH WAKTU SELAMA ITU', 108, 758, { size: 22, color: L.dim, track: 4 });

      // the travel itself: a line from us to the next star, with the light
      // still on its way — one photon, four years, no shortcut
      const y0 = 1040;
      const x0 = 130;
      const x1 = 1310;
      const q = A(t, c[3] + 0.4, 1.6, ease.inOut);
      ctx.strokeStyle = hexA(L.ice, 0.22);
      ctx.setLineDash([7, 11]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y0);
      ctx.stroke();
      ctx.setLineDash([]);
      // Earth
      ctx.fillStyle = hexA(L.star, 0.9);
      ctx.beginPath();
      ctx.arc(x0, y0, 5, 0, TAU);
      ctx.fill();
      micro(ctx, 'KITA', x0 - 4, y0 + 52, { size: 20, color: L.dim, track: 5 });
      // Proxima
      ctx.fillStyle = L.crimson;
      ctx.shadowColor = hexA(L.crimson, 0.9);
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(x1, y0, 7, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      micro(ctx, 'PROXIMA', x1 + 4, y0 + 52, { size: 20, color: L.dim, align: 'right', track: 5 });
      // the photon, still travelling
      const pxc = lerp(x0, x1, q * 0.72);
      const tg = ctx.createLinearGradient(pxc - 120, 0, pxc, 0);
      tg.addColorStop(0, hexA(L.gold, 0));
      tg.addColorStop(1, hexA(L.gold, 0.9));
      ctx.strokeStyle = tg;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pxc - 120, y0);
      ctx.lineTo(pxc, y0);
      ctx.stroke();
      ctx.fillStyle = L.gold;
      ctx.shadowColor = hexA(L.gold, 0.95);
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(pxc, y0, 7, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  },
};
