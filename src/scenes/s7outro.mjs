import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';

const ROWS = [
  { s: 'BUKAN KEMEWAHAN', at: 0.2, strike: 1.45 },
  { s: 'BUKAN BONUS', at: 1.65, strike: 2.6 },
  { s: 'BUKAN SISA WAKTU', at: 3.0, strike: 4.1 },
];

/** Soft-shaded moon: limb darkening, maria, craters with lit rims. */
function moon(ctx, rm, a) {
  ctx.save();
  ctx.globalAlpha = a;

  // outer halo
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const halo = radGrad(ctx, 0, 0, rm * 0.92, rm * 2.6, [
    [0, 'rgba(150,180,235,0.16)'],
    [0.5, 'rgba(120,155,220,0.05)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = halo;
  ctx.fillRect(-rm * 2.6, -rm * 2.6, rm * 5.2, rm * 5.2);
  ctx.restore();

  // body with limb darkening
  ctx.beginPath();
  ctx.arc(0, 0, rm, 0, TAU);
  const body = radGrad(ctx, -rm * 0.28, -rm * 0.3, rm * 0.1, rm * 1.15, [
    [0, '#FFFFFF'],
    [0.55, '#EDF2FF'],
    [0.86, '#CFDAF2'],
    [1, '#A9B8D8'],
  ]);
  ctx.fillStyle = body;
  ctx.fill();

  // surface detail, clipped to the disc
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, rm, 0, TAU);
  ctx.clip();

  const cr = rng(9);
  // maria
  for (let i = 0; i < 5; i++) {
    const ang = cr() * TAU;
    const d = cr() * rm * 0.58;
    const rr2 = rm * (0.18 + cr() * 0.26);
    const mg = radGrad(ctx, Math.cos(ang) * d, Math.sin(ang) * d, 0, rr2, [
      [0, 'rgba(126,146,186,0.30)'],
      [1, 'rgba(126,146,186,0)'],
    ]);
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * d, Math.sin(ang) * d, rr2, 0, TAU);
    ctx.fill();
  }
  // craters: shadowed floor + lit rim
  for (let i = 0; i < 8; i++) {
    const ang = cr() * TAU;
    const d = Math.sqrt(cr()) * rm * 0.82;
    const rad = rm * (0.05 + cr() * 0.09);
    const x = Math.cos(ang) * d;
    const y = Math.sin(ang) * d;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TAU);
    ctx.fillStyle = `rgba(118,138,180,${0.05 + cr() * 0.06})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - rad * 0.12, y - rad * 0.14, rad * 0.92, 0, TAU);
    ctx.strokeStyle = `rgba(255,255,255,${0.14 + cr() * 0.12})`;
    ctx.lineWidth = Math.max(2, rad * 0.16);
    ctx.stroke();
  }
  // limb shadow
  const limb = radGrad(ctx, 0, 0, rm * 0.55, rm, [
    [0, 'rgba(20,28,48,0)'],
    [1, 'rgba(16,24,44,0.55)'],
  ]);
  ctx.fillStyle = limb;
  ctx.fillRect(-rm, -rm, rm * 2, rm * 2);
  ctx.restore();

  // crisp edge
  ctx.beginPath();
  ctx.arc(0, 0, rm - 1, 0, TAU);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    const g = radGrad(ctx, 720, 1150, 0, 1350, [
      [0, '#0B1019'],
      [0.55, '#070911'],
      [1, '#05060A'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* --------------------------------------------------------- stage A/B -- */
    const out = clamp((t - 6.4) / 0.6);
    const rowsA = 1 - out;
    if (rowsA > 0.01) {
      ROWS.forEach((r, i) => {
        const p = clamp((t - r.at) / 0.45);
        if (p <= 0) return;
        const y = 566 + i * 108;
        const e = EASE.outCubic(p);
        ctx.save();
        ctx.globalAlpha = rowsA * (0.5 + 0.5 * clamp(1 - (t - 4.6) / 0.8));
        const dy = (1 - e) * 24;
        txt(ctx, r.s, 720, y + dy, {
          size: 60, font: F.num, color: hexA(C.bone, 0.92), align: 'center', track: -1,
        });
        const w = measure(ctx, r.s, 60, F.num, -1);
        const kA = clamp((t - r.strike) / 0.28);
        if (kA > 0) {
          ctx.save();
          ctx.globalAlpha *= kA;
          ctx.strokeStyle = C.red;
          ctx.lineWidth = 6;
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

    const fA = clamp((t - 4.85) / 0.5);
    if (fA > 0 && out < 1) {
      const p = EASE.outBack(clamp((t - 4.85) / 0.6), 2.0);
      ctx.save();
      ctx.globalAlpha = (1 - out) * clamp(fA * 1.8);
      ctx.translate(720, 1000);
      ctx.scale(lerp(0.9, 1, p), lerp(0.9, 1, p));
      txt(ctx, 'FONDASI', 0, 0, {
        size: 146, font: F.num, color: C.amber, align: 'center', track: -3,
        glowBlur: 34, glowColor: hexA(C.amber, 0.32),
      });
      const w = measure(ctx, 'FONDASI', 146, F.num, -3);
      const ug = linGrad(ctx, -w / 2, 0, w / 2, 0, [
        [0, 'rgba(255,176,58,0)'],
        [0.5, 'rgba(255,176,58,0.85)'],
        [1, 'rgba(255,176,58,0)'],
      ]);
      ctx.fillStyle = ug;
      ctx.fillRect(-w / 2, 26, w, 5);
      ctx.restore();
    }

    /* ----------------------------------------------------------- stage C -- */
    const cA = clamp((t - 6.5) / 0.7);
    if (cA > 0) {
      const rm = 136;
      const rise = (1 - EASE.outCubic(cA)) * 34;
      ctx.save();
      ctx.translate(720, 1002 + rise);
      moon(ctx, rm, cA);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = clamp((t - 6.9) / 0.6);
      const y = 1256 + rise;
      txt(ctx, 'MULAI MALAM INI', 720, y, {
        size: 82, font: F.num, color: C.bone, align: 'center', track: -2,
      });
      tracking(ctx, 'TIDUR BUKAN HADIAH — TAPI BAHAN BAKAR', 720, y + 54, {
        size: 21, font: F.num6, track: 4, align: 'center', color: hexA(C.amber, 0.85),
      });
      ctx.restore();
    }
  },
};
