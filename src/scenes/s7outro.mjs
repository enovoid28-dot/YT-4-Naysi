import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import { bokeh } from '../art/parts.mjs';

const ROWS = [
  { s: 'BUKAN KEMEWAHAN', at: 0.2, strike: 1.45 },
  { s: 'BUKAN BONUS', at: 1.65, strike: 2.6 },
  { s: 'BUKAN SISA WAKTU', at: 3.0, strike: 4.1 },
];

export default {
  draw(ctx, t, scene, meta) {
    const g = radGrad(ctx, 720, 1150, 0, 1300, [
      [0, '#0B1018'],
      [0.55, '#070911'],
      [1, '#05060A'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    bokeh(ctx, t, { count: 10, y0: 400, y1: 1900, alpha: 0.09, seed: 31 });

    /* --------------------------------------------------------- stage A/B -- */
    const out = clamp((t - 6.4) / 0.6); // rows + fondasi fade
    const rowsA = 1 - out;
    if (rowsA > 0.01) {
      ROWS.forEach((r, i) => {
        const p = clamp((t - r.at) / 0.45);
        if (p <= 0) return;
        const y = 560 + i * 106;
        const e = EASE.outCubic(p);
        ctx.save();
        ctx.globalAlpha = rowsA * (0.2 + 0.8 * clamp(1 - (t - 4.6) / 0.8));
        const dy = (1 - e) * 26;
        txt(ctx, r.s, 720, y + dy, {
          size: 62, font: F.num, color: hexA(C.bone, 0.9), align: 'center', track: -1,
        });
        const w = measure(ctx, r.s, 62, F.num, -1);
        const kA = clamp((t - r.strike) / 0.28);
        if (kA > 0) {
          ctx.save();
          ctx.globalAlpha *= kA;
          ctx.strokeStyle = C.red;
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.shadowColor = hexA(C.red, 0.5);
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.moveTo(720 - w / 2 - 16, y + dy - 20);
          ctx.lineTo(720 - w / 2 - 16 + (w + 32) * EASE.outCubic(kA), y + dy - 20);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      });
    }

    // FONDASI
    const fA = clamp((t - 4.85) / 0.5);
    if (fA > 0 && out < 1) {
      const p = EASE.outBack(clamp((t - 4.85) / 0.6), 2.2);
      ctx.save();
      ctx.globalAlpha = (1 - out) * clamp(fA * 1.8);
      ctx.translate(720, 1006);
      ctx.scale(lerp(0.86, 1, p), lerp(0.86, 1, p));
      txt(ctx, 'FONDASI', 0, 0, {
        size: 148, font: F.num, color: C.amber, align: 'center', track: -3,
        glowBlur: 34, glowColor: hexA(C.amber, 0.35),
      });
      const w = measure(ctx, 'FONDASI', 148, F.num, -3);
      ctx.fillStyle = hexA(C.amber, 0.7);
      ctx.fillRect(-w / 2, 26, w, 6);
      ctx.restore();
    }

    /* ----------------------------------------------------------- stage C -- */
    const cA = clamp((t - 6.5) / 0.7);
    if (cA > 0) {
      const rm = 132;
      ctx.save();
      ctx.globalAlpha = cA;
      const rise = (1 - EASE.outCubic(cA)) * 40;
      ctx.translate(720, 1022 + rise);

      // halo
      const halo = radGrad(ctx, 0, 0, rm * 0.6, rm * 3.6, [
        [0, 'rgba(150,180,235,0.20)'],
        [1, 'rgba(0,0,0,0)'],
      ]);
      ctx.fillStyle = halo;
      ctx.fillRect(-rm * 3.6, -rm * 3.6, rm * 7.2, rm * 7.2);

      // moon disc
      ctx.beginPath();
      ctx.arc(0, 0, rm, 0, TAU);
      ctx.fillStyle = radGrad(ctx, -rm * 0.34, -rm * 0.4, 0, rm * 1.5, [
        [0, '#FFFFFF'],
        [0.55, '#E7EEFF'],
        [1, '#C4D2EE'],
      ]);
      ctx.fill();
      // craters
      const cr = rng(11);
      for (let i = 0; i < 7; i++) {
        const a = cr() * TAU;
        const d = cr() * rm * 0.66;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 9 + cr() * 22, 0, TAU);
        ctx.fillStyle = `rgba(112,132,178,${0.04 + cr() * 0.05})`;
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = cA;
      const y = 1302 + rise;
      txt(ctx, 'MULAI MALAM INI', 720, y, {
        size: 82, font: F.num, color: C.bone, align: 'center', track: -2,
      });
      tracking(ctx, 'TIDUR BUKAN HADIAH — TAPI BAHAN BAKAR', 720, y + 52, {
        size: 22, font: F.num6, track: 4, align: 'center', color: hexA(C.amber, 0.85),
      });
      ctx.restore();
    }
  },
};
