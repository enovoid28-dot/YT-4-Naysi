import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, say, micro, number, txt, hexA, TAU, clamp, lerp, rng, stretch,
} from './_langit.mjs';

// 06 — MERAH
// One wave crossing space while space stretches under it: the same photon
// arrives with a longer wavelength, redder and weaker. The frame lets the wave
// change colour rather than labelling it.

const B = 90;

export default {
  draw(ctx, t, scene) {
    sky(ctx, { key: 'r6', band: 0.3, hills: false, glowY: 1700 });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const baseY = 860;
    const x0 = 60;
    const x1 = W - 60;

    // the wave itself, its wavelength growing left to right as space stretches
    const p2 = A(t, c[1], 0.5, ease.out);
    const waveGrow = A(t, c[1] + 0.1, 4.0, ease.inOut);
    const slope = A(t, c[0] + 0.2, 3.0, ease.inOut);

    if (p2 > 0.01) {
      ctx.save();
      const l0 = lerp(150, 430, waveGrow);
      const fade = 1 - 0.42 * A(t, c[3], 0.6);
      ctx.globalAlpha = Math.min(1, p2) * fade;
      const col = waveGrow < 0.35 ? [255, 246, 227] : waveGrow < 0.62 ? [255, 214, 158] : waveGrow < 0.84 ? [255, 168, 110] : [255, 96, 78];
      const cs = `${col[0]},${col[1]},${col[2]}`;
      ctx.strokeStyle = `rgba(${cs},0.94)`;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.shadowColor = `rgba(${cs},0.55)`;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 4) {
        const k = (x - x0) / (x1 - x0);
        const len = lerp(l0, l0 * 1.5, k);
        const amp = lerp(120, 78, k * waveGrow);
        const y = baseY + Math.sin(((x - x0) / len) * TAU - t * 1.6) * amp * (0.35 + 0.65 * slope);
        if (x === x0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      // what the wavelength looks like, measured on the wave
      const bx0 = 390;
      const bx1 = bx0 + lerp(l0, l0 * 1.5, (bx0 - x0) / (x1 - x0));
      const by = baseY + 300;
      ctx.strokeStyle = 'rgba(240,244,255,0.42)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx0, by);
      ctx.lineTo(bx1, by);
      ctx.moveTo(bx0, by - 18);
      ctx.lineTo(bx0, by + 18);
      ctx.moveTo(bx1, by - 18);
      ctx.lineTo(bx1, by + 18);
      ctx.stroke();
      micro(ctx, 'PANJANG GELOMBANG', bx0, by + 56, { size: 21, color: L.dim, track: 5 });
      ctx.restore();
    }

    // caption 1 — expansion dims as well
    const p1 = A(t, c[0], 0.6, ease.out);
    const out1 = 1 - A(t, c[1], 0.4, ease.out);
    if (p1 > 0.01 && out1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p1, out1) * 0.8;
      stretch(ctx, 720, baseY, t, { p: A(t, c[0] + 0.2, 1.4), n: 80, reach: 1100 });
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = Math.min(p1, out1);
      micro(ctx, 'RUANG MENGEMBANG', 720, 470, { size: 25, color: L.ice, align: 'center', track: 9 });
      ctx.restore();
    }

    // caption 3 — the colour has moved to red: nothing else on screen but the wave
    const p3 = A(t, c[2], 0.6, ease.out);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3 * 0.9 * (1 - 0.7 * A(t, c[3], 0.6));
      micro(ctx, 'KE ARAH MERAH', 720, baseY + 430, { size: 26, color: L.crimson, align: 'center', track: 11 });
      ctx.restore();
    }

    // caption 4 — expansion alone is not enough: the wave is struck through
    const p4 = A(t, c[3], 0.7, ease.expo);
    const out4 = 1 - A(t, c[4], 0.5, ease.out);
    if (p4 > 0.01 && out4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p4, out4);
      const k = A(t, c[3] + 0.15, 0.55, ease.inOut);
      ctx.strokeStyle = hexA(L.crimson, 0.85 * k);
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(330, baseY - 250);
      ctx.lineTo(330 + 780 * k, baseY + 230);
      ctx.stroke();
      micro(ctx, 'EKSPANSI SAJA', 720, baseY + 430, { size: 25, color: L.crimson, align: 'center', track: 8 });
      ctx.restore();
    }

    // caption 5 — still age: an hourglass of light cones
    const p5 = A(t, c[4], 0.8, ease.out);
    if (p5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p5;
      const q = A(t, c[4] + 0.25, 1.8, ease.out);
      const ax = 720;
      const ay = 1150;
      ctx.strokeStyle = hexA(L.gold, 0.5 * q);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(ax - 230 * q, ay - 250);
      ctx.lineTo(ax, ay);
      ctx.lineTo(ax + 230 * q, ay - 250);
      ctx.moveTo(ax - 230 * q, ay + 150);
      ctx.lineTo(ax, ay);
      ctx.lineTo(ax + 230 * q, ay + 150);
      ctx.stroke();
      // grains of light falling through the neck
      for (let i = 0; i < 34; i++) {
        const kk = ((t * 0.30 + i * 0.03) % 1);
        const yy = ay + 10 + kk * 120;
        const spread = 10 + kk * 170;
        ctx.fillStyle = hexA(L.gold, 0.55 * q * (1 - kk * 0.5));
        ctx.beginPath();
        ctx.arc(ax + Math.sin(i * 2.1 + t * 0.8) * spread * 0.35, yy, 1.8, 0, TAU);
        ctx.fill();
      }
      micro(ctx, 'BATAS WAKTU', 720, ay + 240, { size: 26, color: L.gold, align: 'center', track: 10 });
      ctx.restore();
    }
  },
};
