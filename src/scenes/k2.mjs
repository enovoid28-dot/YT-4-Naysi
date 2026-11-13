import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { P, plate, eyebrow, ease, seatMap, group } from './_fare.mjs';
import { tag, panel, ticks, wipeText, ghosts, rings, barcode } from '../engine/motion.mjs';

// 02 — BARANG BASI
// Two numbers moving in opposite directions: the cabin fills, the value of
// what is left drains to nothing the instant the door shuts.

const DOOR = 8.0;
const MX = 872; // meter rail x
const MTOP = 596;
const MBOT = 1216;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    plate(ctx, { t, glow: P.cyan, glowY: 880, glowX: W * 0.32, glowA: 0.07 });

    eyebrow(ctx, 'BARANG YANG CEPAT BASI', { a: a(0.05, 0.5), rule: P.cyan });

    /* ------------------------------ seat map ---------------------------- */
    const mapA = a(0.35, 0.8);
    const fillP = ease.inOut(clamp((t - 1.2) / 6.4));
    const sold = 0.12 + 0.78 * fillP;
    ctx.save();
    ctx.globalAlpha = mapA;
    ctx.translate(0, (1 - mapA) * 30);
    tracking(ctx, 'KABIN EKONOMI · 48 KURSI', 120, 542, {
      size: 20, font: F.mono6, track: 5, color: hexA(P.bone, 0.44),
    });
    seatMap(ctx, 120, 588, {
      cols: 6, rows: 8, cw: 92, ch: 62, gap: 22, a: mapA, sold,
      accent: P.mint, dim: 'rgba(210,226,240,0.13)',
    });
    ctx.restore();

    // sold counter, set under the cabin
    const cnt = Math.round(sold * 48);
    ctx.save();
    ctx.globalAlpha = a(0.9, 0.6);
    txt(ctx, `${cnt}`, 120, 1332, { size: 92, font: F.num, color: P.mint, track: -3 });
    tracking(ctx, 'KURSI TERJUAL', 120 + measure(ctx, `${cnt}`, 92, F.num, -3) + 18, 1332, {
      size: 19, font: F.mono6, track: 4, color: hexA(P.mint, 0.7),
    });
    ctx.restore();

    /* ---------------------------- value meter --------------------------- */
    const q = ease.inOut(clamp((t - 1.2) / (DOOR - 1.2)));
    const value = Math.round(900000 * (1 - q));
    const mA = a(0.7, 0.7);
    const mh = MBOT - MTOP;

    ctx.save();
    ctx.globalAlpha = mA;
    tracking(ctx, 'NILAI KURSI YANG TERSISA', MX, 542, {
      size: 20, font: F.mono6, track: 5, color: hexA(P.bone, 0.44),
    });

    // a segmented rail, not a slab: 18 blocks that switch off as it drains
    const SEGN = 18;
    const segH = mh / SEGN;
    for (let i = 0; i < SEGN; i++) {
      const y = MBOT - (i + 1) * segH + 3;
      const on = (i + 1) / SEGN <= 1 - q + 0.001;
      ctx.fillStyle = on ? hexA(P.amber, 0.30 + 0.45 * (i / SEGN)) : 'rgba(210,226,240,0.055)';
      ctx.fillRect(MX, y, 64, segH - 6);
    }
    strokeRR(ctx, MX - 6, MTOP - 6, 76, mh + 12, 8, 'rgba(210,226,240,0.12)', 1.2);

    // the number
    const vA = a(0.9, 0.6);
    if (vA > 0.01) {
      const isZero = value <= 900;
      const col = isZero ? P.ember : P.bone;
      ctx.globalAlpha = mA * vA;
      tracking(ctx, 'RUPIAH', MX + 118, MTOP + 28, {
        size: 19, font: F.mono6, track: 5, color: hexA(P.bone, 0.34),
      });
      txt(ctx, group(value), MX + 112, MTOP + 136, {
        size: 92, font: F.num, color: col, track: -4,
      });
      if (isZero) {
        ctx.save();
        ctx.globalAlpha *= 0.6 + 0.4 * Math.sin(t * 8);
        tracking(ctx, 'TIDAK BERHARGA', MX + 118, MTOP + 190, {
          size: 21, font: F.mono6, track: 4, color: P.ember,
        });
        ctx.restore();
      } else {
        tracking(ctx, 'PER KURSI', MX + 118, MTOP + 190, {
          size: 21, font: F.mono6, track: 4, color: hexA(P.bone, 0.34),
        });
      }
    }
    ctx.restore();

    /* ------------------------------ stamp ------------------------------- */
    const stA = clamp((t - DOOR - 0.15) / 0.42);
    if (stA > 0.01) {
      const s = ease.expo(stA);
      ctx.save();
      ctx.translate(MX + 150, MTOP + 400);
      ctx.rotate(-0.10);
      ctx.scale(0.86 + 0.14 * s, 0.86 + 0.14 * s);
      ctx.globalAlpha = clamp(stA * 1.6) * 0.92;
      strokeRR(ctx, -150, -44, 300, 88, 8, hexA(P.ember, 0.85), 3);
      strokeRR(ctx, -142, -36, 284, 72, 5, hexA(P.ember, 0.35), 1.2);
      tracking(ctx, 'PINTU TUTUP', 0, -2, {
        size: 30, font: F.mono6, track: 6, color: P.ember, align: 'center',
      });
      tracking(ctx, 'NILAI = 0', 0, 30, {
        size: 18, font: F.mono6, track: 5, color: hexA(P.ember, 0.75), align: 'center',
      });
      ctx.restore();
    }

    /* --------------------------- countdown strip ------------------------ */
    const stripA = a(1.0, 0.7);
    if (stripA > 0.01) {
      const sy = 1420;
      const x0 = 120;
      const x1 = W - 120;
      const prog = clamp(t / DOOR);
      ctx.save();
      ctx.globalAlpha = stripA;
      ctx.strokeStyle = hexA(P.bone, 0.14);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x0, sy);
      ctx.lineTo(x1, sy);
      ctx.stroke();
      ticks(ctx, x0, sy, x1 - x0, { n: 24, color: P.bone, a: 0.22, major: 6 });
      const g = linGrad(ctx, x0, 0, x1, 0, [[0, hexA(P.cyan, 0.7)], [1, hexA(P.ember, 0.95)]]);
      ctx.fillStyle = g;
      ctx.fillRect(x0, sy - 3, (x1 - x0) * prog, 6);
      const cx = lerp(x0, x1, prog);
      ctx.beginPath();
      ctx.arc(cx, sy, 9, 0, TAU);
      ctx.fillStyle = P.bone;
      ctx.fill();
      tracking(ctx, 'T−90 JAM', x0, sy + 42, { size: 19, font: F.mono6, track: 4, color: hexA(P.bone, 0.45) });
      tracking(ctx, 'TEMPAT DUDUK DIJUAL', W / 2, sy + 42, {
        size: 19, font: F.mono6, track: 4, color: hexA(P.bone, 0.28), align: 'center',
      });
      tracking(ctx, 'PINTU TUTUP', x1, sy + 42, {
        size: 19, font: F.mono6, track: 4, color: hexA(P.ember, 0.85), align: 'right',
      });
      ctx.restore();
    }

    /* ------------------------------ LELANG ------------------------------ */
    const lp = clamp((t - 8.9) / 0.85);
    if (lp > 0.01) {
      const y = 1560;
      const w = measure(ctx, 'LELANG', 112, F.head, 2) + 8;
      const s = ease.expo(clamp((t - 8.9) / 0.9));
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.translate(120, (1 - s) * 24);
      wipeText(ctx, 'LELANG', 0, y, lp, {
        size: 112, font: F.head, color: P.bone, track: 2, edgeColor: P.amber,
      });
      ctx.fillStyle = hexA(P.amber, 0.9);
      ctx.fillRect(0, y + 22, w * ease.out(lp), 3);
      ctx.restore();
    }
  },
};
