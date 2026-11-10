import { W, H, C, M, txt, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { dawn, kicker, chip, card, hairline, bigStat, stair, glowSpot } from './_ep4.mjs';

const X0 = 352;
const X1 = 1250;
const MMAX = 120;
const LANES = [700, 840, 980, 1120];
const NAMES = ['BANGUN', 'REM', 'RINGAN', 'DALAM'];

const PTS = [
  { m: 0, stage: 0 },
  { m: 3, stage: 2 },
  { m: 13, stage: 3 },
  { m: 30, stage: 3 },
  { m: 35, stage: 2 },
  { m: 50, stage: 2 },
  { m: 55, stage: 3 },
  { m: 68, stage: 3 },
  { m: 73, stage: 2 },
  { m: 82, stage: 1 },
  { m: 90, stage: 1 },
  { m: 95, stage: 2 },
  { m: 104, stage: 3 },
  { m: 112, stage: 3 },
  { m: 117, stage: 2 },
  { m: 120, stage: 0 },
];

// 04 — DALAM. Nine minutes is not a cycle. It barely reaches the top layer.
export default {
  draw(ctx, t) {
    dawn(ctx, { top: '#06080F', mid: '#090F1A', bot: '#0B1421', warmX: 0.75, warmA: 0.06 });

    kicker(ctx, 'SATU SIKLUS TIDUR');

    /* ------------------------------------------------------------- lanes -- */
    const a0 = clamp((t - 0.2) / 0.8);
    ctx.save();
    ctx.globalAlpha = a0;
    NAMES.forEach((n, i) => {
      const y = LANES[i];
      hairline(ctx, X0, y, X1, y, { color: C.bone, alpha: i === 3 ? 0.16 : 0.10, lw: 2, dash: [2, 12] });
      txt(ctx, n, M, y + 11, {
        size: 27, font: F.num6, color: hexA(i === 3 ? C.sky : C.bone, i === 3 ? 0.85 : 0.5), track: 3.5,
      });
    });
    hairline(ctx, X0, LANES[0] - 40, X0, LANES[3] + 40, { color: C.bone, alpha: 0.18, lw: 2 });
    ctx.restore();

    /* -------------------------------------------------------- the curve --- */
    const prog = clamp((t - 0.8) / 6.4);
    const bands = [
      { m: 0, label: 'RINGAN' },
      { m: 13, label: 'DALAM' },
    ];
    void bands;

    if (prog > 0.001) {
      glowSpot(ctx, X0 + 120, LANES[3], 420, C.sky, 0.10);
      stair(ctx, PTS, {
        x0: X0, x1: X1, mMax: MMAX, lanes: LANES, color: C.sky, lw: 8, upto: prog,
      });
      // leading dot
      const li = Math.min(PTS.length - 1, Math.floor(prog * (PTS.length - 1)));
      const lm = PTS[li].m;
      const lx = lerp(X0, X1, lm / MMAX);
      const ly = LANES[PTS[li].stage];
      ctx.save();
      ctx.fillStyle = C.bone;
      ctx.shadowColor = hexA(C.sky, 0.9);
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(lx, ly, 10, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    /* ----------------------------------------------------- nine minutes --- */
    const aA = clamp((t - 7.2) / 0.7);
    if (aA > 0.01) {
      const nx = lerp(X0, X1, 9 / MMAX);
      ctx.save();
      ctx.globalAlpha = aA;
      ctx.fillStyle = hexA(C.amber, 0.16);
      ctx.fillRect(X0, LANES[0] - 44, nx - X0, LANES[3] - LANES[0] + 92);
      ctx.strokeStyle = hexA(C.amber, 0.55);
      ctx.lineWidth = 3;
      ctx.strokeRect(X0, LANES[0] - 44, nx - X0, LANES[3] - LANES[0] + 92);
      txt(ctx, '9 MENIT', X0 - 6, LANES[0] - 66, { size: 26, font: F.num6, color: C.amberHi, track: 3.5 });
      // arrow to "not even a cycle"
      hairline(ctx, nx + 26, LANES[0] - 10, nx + 26, LANES[3] + 10, { color: C.amber, alpha: 0.5, lw: 2, dash: [3, 9] });
      txt(ctx, '0,1 SIKLUS', nx + 46, 916, {
        size: 30, font: F.num6, color: hexA(C.amber, 0.9), track: 3,
      });
      hairline(ctx, nx + 10, 906, nx + 38, 906, { color: C.amber, alpha: 0.45, lw: 2 });
      ctx.restore();
    }

    /* ------------------------------------------------------------- ticks -- */
    const tA = clamp((t - 2.2) / 0.8);
    if (tA > 0.01) {
      ctx.save();
      ctx.globalAlpha = tA;
      [0, 30, 60, 90, 120].forEach((m) => {
        const x = lerp(X0, X1, m / MMAX);
        hairline(ctx, x, LANES[3] + 44, x, LANES[3] + 58, { color: C.bone, alpha: 0.24, lw: 2 });
        txt(ctx, `${m}`, x, LANES[3] + 96, {
          size: 22, font: F.num6, color: hexA(C.bone, 0.34), align: 'center', track: 1,
        });
      });
      txt(ctx, 'MENIT', X1, LANES[3] + 96, {
        size: 22, font: F.num6, color: hexA(C.bone, 0.26), align: 'right', track: 3,
      });
      ctx.restore();
    }

    /* ------------------------------------------------------------ stats --- */
    const sA = EASE.outCubic(clamp((t - 10.6) / 0.8));
    if (sA > 0.01) {
      ctx.save();
      ctx.globalAlpha = sA;
      ctx.translate(0, lerp(26, 0, sA));
      hairline(ctx, M, 1290, W - M, 1290, { color: C.bone, alpha: 0.12, lw: 2 });
      bigStat(ctx, M, 1450, '90', { size: 150, unit: 'menit', color: C.bone, label: 'satu siklus tidur' });
      hairline(ctx, 720, 1312, 720, 1530, { color: C.bone, alpha: 0.10, lw: 2 });
      bigStat(ctx, 776, 1450, '9', { size: 150, unit: 'menit', color: C.amberHi, label: 'satu snooze' });
      txt(ctx, 'CUKUP UNTUK TIDUR RINGAN. TIDAK CUKUP UNTUK APA PUN YANG MEMULIHKAN.', M, 1650, {
        size: 26, font: F.num6, color: hexA(C.bone, 0.48), track: 2.5, maxWidth: W - 2 * M,
      });
      ctx.restore();
    }
  },
};
