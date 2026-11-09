import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure, labelChip,
  burst,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, spring, rng, TAU, noise1 } from '../engine/anim.mjs';

export default {
  draw(ctx, t, scene) {
    const g = scene.captions;
    const b0 = g[0]?.words[0].start ?? 0.3;
    const b1 = g[1]?.words[0].start ?? 3;
    const b2 = g[2]?.words[0].start ?? 5;
    const b3 = g[3]?.words[0].start ?? 8;

    // background
    const bg = linGrad(ctx, 0, 0, 0, 1800, [
      [0, '#07060C'],
      [0.45, '#0E0A12'],
      [1, '#06050A'],
    ]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, 1800);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const glow = radGrad(ctx, W / 2, 880, 0, 780, [
      [0, 'rgba(255,150,70,0.14)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 1800);
    ctx.restore();

    // concentric rings
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = hexA(C.amber, 0.07);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(W / 2, 880, 260 + i * 130 + Math.sin(t * 0.4 + i) * 6, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    const toEnd = clamp((t - (b3 - 0.3)) / 0.9);

    // ticker tape motif
    const items = ['INFLASI 4,1%', 'BBM +0,6%', 'TIKET +22%', 'UPAH +1,3%', 'BERAS +3,2%', 'SEWA +2,7%', 'CPI 0,6%', 'LISTRIK +1,9%'];
    const rows = [
      { y: 1128, dir: -1, sp: 60, alpha: 0.16 },
      { y: 1232, dir: 1, sp: 42, alpha: 0.1 },
    ];
    rows.forEach((row, ri) => {
      ctx.save();
      ctx.globalAlpha *= row.alpha * (1 - toEnd) * clamp((t - b0) / 0.8);
      ctx.font = `42px ${F.num6}`;
      ctx.letterSpacing = '8px';
      const text = items.join('    ·    ') + '    ·    ';
      const tw = ctx.measureText(text).width;
      let x = ((t * row.sp * row.dir) % tw + tw) % tw - tw;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      while (x < W + tw) {
        ctx.fillStyle = ri === 0 ? hexA(C.bone, 0.5) : hexA(C.amber, 0.4);
        ctx.fillText(text, x, row.y);
        x += tw;
      }
      ctx.restore();
    });


    /* ---------------- beat 1 + 2: statistic strike, then statement ---------------- */
    const statAlpha = (1 - toEnd) * clamp((t - b0) / 0.5);
    if (statAlpha > 0.002) {
      ctx.save();
      ctx.globalAlpha *= statAlpha;
      ctx.translate(W / 2, 800);
      const sIn = spring(clamp((t - b0) / 0.9) * 1.05, 9, 0.62);
      ctx.scale(lerp(0.95, 1, sIn), lerp(0.95, 1, sIn));
      const struck = clamp((t - b1) / 0.5);
      ctx.font = `${180}px ${F.display}`;
      ctx.letterSpacing = '-4px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha *= lerp(1, 0.34, struck);
      ctx.fillStyle = C.bone;
      ctx.fillText('STATISTIK', 0, 0);

      // strike-through
      if (struck > 0) {
        const wStrike = (measure(ctx, 'STATISTIK', 180, F.display, -4) + 90) * EASE.outExpo(struck);
        ctx.globalAlpha = statAlpha * 0.95;
        ctx.strokeStyle = C.red;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-wStrike / 2, 6);
        ctx.lineTo(wStrike / 2, -18);
        ctx.stroke();
      }
      ctx.restore();
    }

    const headAlpha = clamp((t - b2 + 0.25) / 0.5) * (1 - toEnd);
    if (headAlpha > 0.002) {
      ctx.save();
      ctx.globalAlpha *= headAlpha;
      const p = spring(clamp((t - b2 + 0.25) / 0.8) * 1.05, 10, 0.62);
      ctx.translate(W / 2, 820 + (1 - p) * 40);
      ctx.scale(lerp(0.96, 1, p), lerp(0.96, 1, p));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      txt(ctx, 'ITU BUKAN', 0, -150, { size: 46, font: F.num6, color: hexA(C.bone, 0.55), align: 'center', track: 12 });
      txt(ctx, 'STATISTIK.', 0, -62, { size: 92, font: F.head, color: hexA(C.bone, 0.35), align: 'center' });
      txt(ctx, 'ITU HARGA', 0, 78, { size: 130, font: F.head, color: C.bone, align: 'center', track: -2 });
      txt(ctx, 'YANG KAMU BAYAR.', 0, 210, { size: 130, font: F.head, color: C.amber, align: 'center', track: -2, glowBlur: 22 });
      ctx.restore();
    }

    /* ------------------------------- end card ------------------------------- */
    if (toEnd > 0.002) {
      const e = EASE.outCubic(toEnd);
      ctx.save();
      ctx.globalAlpha *= clamp(toEnd * 1.4);
      ctx.translate(W / 2, 900);
      ctx.scale(lerp(0.92, 1, e), lerp(0.92, 1, e));

      // aperture/sun mark
      const rot = t * 0.16;
      const rMark = 232;
      ctx.save();
      ctx.strokeStyle = hexA(C.bone, 0.14);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, rMark + 34, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(rot + (i * TAU) / 3);
        const grad = linGrad(ctx, -rMark, 0, rMark, 0, [
          [0, hexA(C.amber, 0.15)],
          [0.5, C.amber],
          [1, hexA(C.amber, 0.15)],
        ]);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, rMark, -0.5, 0.5);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      txt(ctx, 'CPI', 0, 40, {
        size: 132, font: F.head, color: C.bone, align: 'center', glowBlur: 26, glowColor: hexA(C.amber, 0.45),
      });

      tracking(ctx, 'INDEKS HARGA KONSUMEN', 0, 350, {
        size: 24, font: F.num6, track: 9, align: 'center', color: hexA(C.bone, 0.5),
      });

      const tl = clamp((t - b3 - 0.15) / 0.7);
      ctx.save();
      ctx.globalAlpha *= EASE.outCubic(tl);
      txt(ctx, 'CERMIN DOMPETMU', 0, 440, {
        size: 56, font: F.head, color: C.amber, align: 'center', track: 1,
      });
      ctx.restore();

      // divider
      const dv = EASE.outExpo(clamp((t - b3 - 0.4) / 0.8));
      ctx.save();
      ctx.globalAlpha *= dv * 0.5;
      ctx.strokeStyle = hexA(C.bone, 0.5);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-dv * 220, 530);
      ctx.lineTo(dv * 220, 530);
      ctx.stroke();
      ctx.restore();

      // brand
      const bp = spring(clamp((t - b3 - 0.45) / 0.85) * 1.1, 10, 0.6);
      if (bp > 0.002) {
        ctx.save();
        ctx.globalAlpha *= clamp(bp * 1.6);
        ctx.translate(0, 640);
        ctx.scale(bp, bp);
        const bw = tracking(ctx, 'NAYSI', 0, 0, {
          size: 58, font: F.head, track: 14, align: 'center', color: C.bone,
        });
        fillRR(ctx, -bw / 2 - 30, -18, 15, 15, 4, C.amber);
        tracking(ctx, 'SUMBER: BLS · SEPTEMBER 2024', 0, 66, {
          size: 20, font: F.num6, track: 5, align: 'center', color: hexA(C.bone, 0.42),
        });
        ctx.restore();
      }

      ctx.restore();
    }
  },
};
