import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  labelChip,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { stamp } from '../art/parts.mjs';
import { smoothPath } from '../art/kit.mjs';

const XA = 208;
const XB = 1292;
const YA = 1444;
const YB = 782;
const py = (v) => lerp(YA, YB, (v - 50) / 50);
const px = (u) => lerp(XA, XB, u);

const vPerf = (u) => lerp(100, 60, Math.pow(u, 1.18));
const vFeel = (u) => lerp(100, 82, Math.pow(u, 1.4));

const series = (fn, reveal, n = 40) => {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * reveal;
    out.push({ x: px(u), y: py(fn(u)) });
  }
  return out;
};

export default {
  draw(ctx, t, scene, meta) {
    const g = linGrad(ctx, 0, 240, 0, 1560, [
      [0, '#080A12'],
      [0.55, '#06080E'],
      [1, '#080A12'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 240, W, 1320);

    tracking(ctx, 'PENELITIAN TIDUR', M, 330, {
      size: 25, font: F.num6, track: 6, color: hexA(C.bone, 0.5),
    });

    /* ------------------------------------------------------------- title -- */
    const tA = clamp((t - 0.15) / 0.45);
    if (tA > 0) {
      ctx.save();
      ctx.globalAlpha = tA;
      const dy = (1 - EASE.outCubic(tA)) * 26;
      txt(ctx, '6 JAM', M, 470 + dy, { size: 116, font: F.num, color: C.bone, track: -2 });
      const w1 = measure(ctx, '6 JAM', 116, F.num, -2);
      txt(ctx, '×', M + w1 + 34, 452 + dy, { size: 70, font: F.num6, color: hexA(C.bone, 0.4) });
      const w2 = measure(ctx, '×', 70, F.num6);
      txt(ctx, '10 HARI', M + w1 + 34 + w2 + 34, 470 + dy, {
        size: 116, font: F.num, color: C.amber, track: -2,
      });
      ctx.restore();
    }

    /* ------------------------------------------------------------ legend -- */
    const lA = clamp((t - 0.9) / 0.4);
    if (lA > 0) {
      ctx.save();
      ctx.globalAlpha = lA;
      labelChip(ctx, 'PERFORMA', M, 606, {
        size: 23, font: F.num6, track: 4, padX: 16, padY: 11, align: 'left',
        dot: C.amber, dotColor: C.amber,
      });
      labelChip(ctx, 'PERASAAN', M + 212, 606, {
        size: 23, font: F.num6, track: 4, padX: 16, padY: 11, align: 'left',
        dot: C.bone, dotColor: hexA(C.bone, 0.8),
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- axes -- */
    const gA = clamp((t - 0.45) / 0.6);
    ctx.save();
    ctx.globalAlpha = gA;
    for (const v of [60, 75, 90, 100]) {
      ctx.save();
      ctx.setLineDash([5, 13]);
      ctx.strokeStyle = hexA(C.bone, 0.085);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(XA, py(v));
      ctx.lineTo(XB, py(v));
      ctx.stroke();
      ctx.restore();
      tracking(ctx, String(v), XA - 20, py(v) + 8, {
        size: 21, font: F.num6, track: 2, align: 'right', color: hexA(C.bone, 0.45),
      });
    }
    // baseline
    const blg = linGrad(ctx, XA, 0, XB, 0, [
      [0, hexA(C.bone, 0.18)],
      [0.5, hexA(C.bone, 0.4)],
      [1, hexA(C.bone, 0.18)],
    ]);
    ctx.fillStyle = blg;
    ctx.fillRect(XA, YA, XB - XA, 2.5);
    ctx.restore();

    // day ticks
    for (let d = 1; d <= 10; d++) {
      const u = (d - 1) / 9;
      const a = clamp((t - 0.6 - u * 0.5) / 0.3);
      if (a <= 0) continue;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = hexA(C.bone, 0.3);
      ctx.fillRect(px(u) - 1, YA + 4, 2, 10);
      if ([1, 4, 7, 10].includes(d)) {
        tracking(ctx, `HARI ${d}`, px(u), YA + 46, {
          size: 20, font: F.num6, track: 3,
          align: d === 1 ? 'left' : d === 10 ? 'right' : 'center',
          color: hexA(C.bone, 0.6),
        });
      }
      ctx.restore();
    }

    const perfR = clamp((t - 0.85) / 5.0);
    const feelR = clamp((t - 1.0) / 3.6);

    /* ------------------------------------------------------------ shading -- */
    if (feelR > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(feelR * 0.9);
      ctx.beginPath();
      const n = 56;
      for (let i = 0; i <= n; i++) {
        const u = (i / n) * feelR;
        i === 0 ? ctx.moveTo(px(u), py(vPerf(u))) : ctx.lineTo(px(u), py(vPerf(u)));
      }
      for (let i = n; i >= 0; i--) {
        const u = (i / n) * feelR;
        ctx.lineTo(px(u), py(vFeel(u)));
      }
      ctx.closePath();
      ctx.fillStyle = linGrad(ctx, XA, 0, XB, 0, [
        [0, 'rgba(255,176,58,0.02)'],
        [1, 'rgba(255,176,58,0.12)'],
      ]);
      ctx.fill();
      ctx.restore();
    }

    /* ------------------------------------------------------- feel series -- */
    if (feelR > 0) {
      const pts = series(vFeel, feelR);
      ctx.save();
      ctx.beginPath();
      smoothPath(ctx, pts);
      ctx.strokeStyle = hexA(C.bone, 0.9);
      ctx.lineWidth = 5;
      ctx.setLineDash([16, 12]);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
      // day dots
      for (let d = 0; d < 10; d++) {
        const u = d / 9;
        if (feelR < u) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px(u), py(vFeel(u)), 5, 0, TAU);
        ctx.fillStyle = hexA(C.bone, 0.95);
        ctx.fill();
        ctx.restore();
      }
    }

    /* -------------------------------------------------------- perf series -- */
    if (perfR > 0) {
      const pts = series(vPerf, perfR);

      // area under the finished curve
      const areaA = clamp((t - 5.85) / 0.7);
      if (areaA > 0) {
        const full = series(vPerf, 1);
        ctx.save();
        ctx.globalAlpha = areaA * 0.17;
        ctx.beginPath();
        ctx.moveTo(full[0].x, YA);
        full.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(full[full.length - 1].x, YA);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 0, YB, 0, YA, [
          [0, C.amber],
          [0.55, hexA(C.amber, 0.45)],
          [1, hexA(C.amber, 0.02)],
        ]);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      smoothPath(ctx, pts);
      ctx.strokeStyle = C.amber;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.shadowColor = hexA(C.amber, 0.6);
      ctx.shadowBlur = 28;
      ctx.stroke();
      ctx.restore();

      for (let d = 0; d < 10; d++) {
        const u = d / 9;
        if (perfR < u) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px(u), py(vPerf(u)), 6.5, 0, TAU);
        ctx.fillStyle = C.amber;
        ctx.shadowColor = hexA(C.amber, 0.8);
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
      }

      // travelling head
      if (perfR < 0.995) {
        const u = perfR;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px(u), py(vPerf(u)), 13, 0, TAU);
        ctx.fillStyle = '#FFF2DA';
        ctx.shadowColor = hexA(C.amber, 0.9);
        ctx.shadowBlur = 34;
        ctx.fill();
        ctx.restore();
      }
    }

    /* ------------------------------------------------------------ labels -- */
    const e1 = clamp((t - 4.4) / 0.4);
    if (e1 > 0) {
      ctx.save();
      ctx.globalAlpha = e1;
      // feel end marker
      ctx.beginPath();
      ctx.arc(XB - 6, py(82), 7, 0, TAU);
      ctx.strokeStyle = hexA(C.bone, 0.9);
      ctx.lineWidth = 3;
      ctx.stroke();
      txt(ctx, '82', XB - 26, py(82) - 18, {
        size: 38, font: F.num, color: hexA(C.bone, 0.85), align: 'right',
      });
      ctx.restore();
    }
    const e2 = clamp((t - 4.6) / 0.4);
    if (e2 > 0) {
      ctx.save();
      ctx.globalAlpha = e2;
      txt(ctx, '60', XB - 26, py(60) - 20, {
        size: 46, font: F.num, color: C.amber, align: 'right',
      });
      ctx.restore();
    }

    // gap dimension between the two ends
    const dimA = clamp((t - 6.6) / 0.5);
    if (dimA > 0) {
      ctx.save();
      ctx.globalAlpha = dimA;
      const x = XB - 4;
      ctx.strokeStyle = hexA(C.red, 0.85);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, py(82));
      ctx.lineTo(x, py(60));
      ctx.stroke();
      [py(82), py(60)].forEach((yy) => {
        ctx.beginPath();
        ctx.moveTo(x - 12, yy);
        ctx.lineTo(x + 12, yy);
        ctx.stroke();
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- note -- */
    const nA = clamp((t - 6.75) / 0.5);
    if (nA > 0) {
      ctx.save();
      ctx.globalAlpha = nA;
      tracking(ctx, 'MEREKA TIDAK MERASA LEBIH BURUK', M, 1568, {
        size: 24, font: F.num6, track: 4, color: hexA(C.bone, 0.62),
      });
      ctx.restore();
    }

    /* ------------------------------------------------------------- stamp -- */
    const sA = clamp((t - 4.25) / 0.35);
    if (sA > 0) {
      stamp(ctx, 'SETARA BEGADANG 24 JAM', 560, 1232, {
        size: 44, color: C.red, rot: -0.085, track: 2, padX: 24, padY: 14,
        scale: lerp(1.6, 1, EASE.outBack(sA, 2.4)), alpha: clamp(sA * 2.5),
      });
    }
  },
};
