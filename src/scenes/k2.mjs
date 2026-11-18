import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { K, ease, depot, cue, vignette } from './_kirim.mjs';

// 02 — KENAPA DULU MURAH
// One chart, read left to right, exactly while the voice reads it. The bar that
// says 2026 collapses on "subsidi itu harus berhenti".

const YEARS = [
  { y: '20', h: 0.96 }, { y: '21', h: 0.90 }, { y: '22', h: 0.79 },
  { y: '23', h: 0.64 }, { y: '24', h: 0.46 }, { y: '25', h: 0.28 }, { y: '26', h: 0.12 },
];

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 540, glowA: 0.10, horizon: 1300 });

    const baseY = 1030;
    const maxH = 570;
    const bw = 128;
    const gap = 34;
    const total = YEARS.length * bw + (YEARS.length - 1) * gap;
    const x0 = (W - total) / 2;

    ctx.fillStyle = hexA(K.bone, 0.18);
    ctx.fillRect(x0 - 24, baseY, total + 48, 2.4);

    YEARS.forEach((yr, i) => {
      // 2020..2025 rise on "dulu murah", 2026 collapses on the last line
      const inP = ease.expo(clamp((t - c(0, 0.2 + i * 0.14)) / 0.55));
      const collapse = i === YEARS.length - 1 ? ease.inOut(clamp((t - c(3, -0.15)) / 0.9)) : 0;
      const hh = maxH * yr.h * inP * (1 - collapse * 0.86);
      const x = x0 + i * (bw + gap);
      const isLast = i === YEARS.length - 1;
      ctx.save();
      ctx.globalAlpha = 0.30 + 0.70 * inP;
      fillRR(ctx, x, baseY - hh, bw, Math.max(4, hh), 8, linGrad(ctx, x, baseY - hh, x, baseY, [
        [0, isLast ? '#F2705A' : K.amber],
        [1, isLast ? 'rgba(228,87,63,0.30)' : 'rgba(243,180,74,0.26)'],
      ]));
      ctx.restore();
      txt(ctx, yr.y, x + bw / 2, baseY + 52, {
        size: 28, font: F.mono6, color: hexA(K.bone, isLast ? 0.78 : 0.42), align: 'center', track: 2,
      });
    });

    tracking(ctx, 'BAGIAN ONGKIR YANG DITANGGUNG PLATFORM', W / 2, 1168, {
      size: 24, font: F.mono6, track: 5, color: hexA(K.bone, 0.45), align: 'center', alpha: a(c(0, 0.5), 0.6),
    });

    // "membeli pengguna": a user counter filling while the bars are tall
    const up = a(c(1, 0.3), 0.7);
    if (up > 0.01) {
      ctx.save();
      ctx.globalAlpha = up;
      tracking(ctx, 'PENGGUNA', x0, 330, { size: 22, font: F.mono6, track: 5, color: hexA(K.cyan, 0.75) });
      for (let i = 0; i < 12; i++) {
        const q = clamp((t - c(1, 0.5 + i * 0.18)) / 0.3);
        if (q <= 0.01) continue;
        ctx.save();
        ctx.globalAlpha = up * q;
        ctx.fillStyle = hexA(K.cyan, 0.55);
        ctx.beginPath();
        ctx.arc(x0 + 6 + (i % 12) * 34, 384, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // the red note on the last two lines
    const rn = a(c(3, 0.45), 0.6);
    if (rn > 0.01) {
      ctx.save();
      ctx.globalAlpha = rn;
      const lx = x0 + (YEARS.length - 1) * (bw + gap) + bw / 2;
      ctx.strokeStyle = hexA(K.ember, 0.8);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lx, baseY - 120);
      ctx.lineTo(lx, baseY - 60);
      ctx.stroke();
      txt(ctx, 'BERHENTI', lx, baseY - 140, {
        size: 24, font: F.mono6, color: K.ember, align: 'center', track: 4,
      });
      ctx.restore();
    }

    vignette(ctx, 0.5);
  },
};
