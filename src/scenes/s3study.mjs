import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  labelChip,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { stamp } from '../art/parts.mjs';

const XA = 210;
const XB = 1310;
const YA = 1430;
const YB = 800;
const py = (v) => lerp(YA, YB, (v - 50) / 50);
const px = (u) => lerp(XA, XB, u);

const vPerf = (u) => lerp(100, 60, Math.pow(u, 1.15));
const vFeel = (u) => lerp(100, 82, Math.pow(u, 1.35));

export default {
  draw(ctx, t, scene, meta) {
    // stage wash
    const g = linGrad(ctx, 0, 240, 0, 1500, [
      [0, '#070910'],
      [0.6, '#05070C'],
      [1, '#080A12'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 240, W, 1260);

    tracking(ctx, 'PENELITIAN TIDUR', M, 330, {
      size: 25, font: F.num6, track: 6, color: hexA(C.bone, 0.5),
    });

    // title
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

    // legend
    const lA = clamp((t - 0.9) / 0.4);
    if (lA > 0) {
      ctx.save();
      ctx.globalAlpha = lA;
      labelChip(ctx, 'PERFORMA', M, 600, {
        size: 23, font: F.num6, track: 4, padX: 16, padY: 11, align: 'left',
        dot: C.amber, dotColor: C.amber,
      });
      labelChip(ctx, 'PERASAAN', M + 210, 600, {
        size: 23, font: F.num6, track: 4, padX: 16, padY: 11, align: 'left',
        dot: C.bone, dotColor: hexA(C.bone, 0.75),
      });
      ctx.restore();
    }

    // grid
    const gA = clamp((t - 0.5) / 0.6);
    ctx.save();
    ctx.globalAlpha = gA;
    for (const v of [75, 100]) {
      ctx.setLineDash([6, 12]);
      ctx.strokeStyle = hexA(C.bone, 0.10);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(XA, py(v));
      ctx.lineTo(XB, py(v));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.globalAlpha = 0.5;
      tracking(ctx, String(v), XA - 22, py(v) + 8, {
        size: 22, font: F.num6, track: 3, align: 'right', color: hexA(C.bone, 0.7),
      });
      ctx.restore();
    }
    // baseline
    ctx.strokeStyle = hexA(C.bone, 0.34);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(XA, YA);
    ctx.lineTo(XB, YA);
    ctx.stroke();
    ctx.restore();

    // day ticks
    for (const d of [1, 4, 7, 10]) {
      const u = (d - 1) / 9;
      const a = clamp((t - 0.7 - u * 0.5) / 0.3);
      if (a <= 0) continue;
      ctx.save();
      ctx.globalAlpha = a * 0.4;
      tracking(ctx, `HARI ${d}`, px(u), YA + 40, {
        size: 20, font: F.num6, track: 3, align: d === 1 ? 'left' : d === 10 ? 'right' : 'center',
        color: hexA(C.bone, 0.8),
      });
      ctx.restore();
    }

    // ramps
    const perfR = clamp((t - 0.85) / 5.0);
    const feelR = clamp((t - 1.0) / 3.6);

    const curve = (fn, reveal, color, lw, dash = null) => {
      if (reveal <= 0) return;
      ctx.save();
      if (dash) ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const u = (i / steps) * reveal;
        const x = px(u);
        const yy = py(fn(u));
        i === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
      ctx.restore();
    };

    // gap shading between the two series
    if (feelR > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(feelR * 0.9);
      ctx.beginPath();
      const steps = 90;
      for (let i = 0; i <= steps; i++) {
        const u = (i / steps) * feelR;
        const x = px(u);
        i === 0 ? ctx.moveTo(x, py(vPerf(u))) : ctx.lineTo(x, py(vPerf(u)));
      }
      for (let i = steps; i >= 0; i--) {
        const u = (i / steps) * feelR;
        ctx.lineTo(px(u), py(vFeel(u)));
      }
      ctx.closePath();
      const gg = linGrad(ctx, XA, 0, XB, 0, [
        [0, 'rgba(255,176,58,0.02)'],
        [1, 'rgba(255,176,58,0.10)'],
      ]);
      ctx.fillStyle = gg;
      ctx.fill();
      ctx.restore();
    }

    // feel (perceived) series
    curve(vFeel, feelR, hexA(C.bone, 0.85), 6, [14, 10]);

    // performance series
    ctx.save();
    ctx.shadowColor = hexA(C.amber, 0.55);
    ctx.shadowBlur = 26;
    curve(vPerf, perfR, C.amber, 8);
    ctx.restore();

    // day dots
    for (let d = 0; d < 10; d++) {
      const u = d / 9;
      for (const [fn, reveal, col, r] of [
        [vPerf, perfR, C.amber, 6],
        [vFeel, feelR, hexA(C.bone, 0.85), 5],
      ]) {
        if (reveal < u) continue;
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(px(u), py(fn(u)), r, 0, TAU);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.restore();
      }
    }

    // end labels
    const e1 = clamp((t - 4.4) / 0.4);
    if (e1 > 0) {
      ctx.save();
      ctx.globalAlpha = e1;
      txt(ctx, '82', XB - 10, py(82) - 16, {
        size: 38, font: F.num, color: hexA(C.bone, 0.8), align: 'right',
      });
      ctx.restore();
    }
    const e2 = clamp((t - 4.6) / 0.4);
    if (e2 > 0) {
      ctx.save();
      ctx.globalAlpha = e2;
      txt(ctx, '60', XB - 10, py(60) - 18, {
        size: 46, font: F.num, color: C.amber, align: 'right',
      });
      ctx.restore();
    }

    // "they feel fine" note
    const nA = clamp((t - 6.7) / 0.5);
    if (nA > 0) {
      ctx.save();
      ctx.globalAlpha = nA;
      tracking(ctx, 'MEREKA TIDAK MERASA LEBIH BURUK', M, 1348, {
        size: 24, font: F.num6, track: 4, color: hexA(C.bone, 0.6),
      });
      ctx.restore();
    }

    // stamp
    const sA = clamp((t - 4.25) / 0.35);
    if (sA > 0) {
      stamp(ctx, 'SETARA BEGADANG 24 JAM', 690, 1240, {
        size: 44, color: C.red, rot: -0.09, track: 2, padX: 24, padY: 14,
        scale: lerp(1.6, 1, EASE.outBack(sA, 2.4)), alpha: clamp(sA * 2.5),
      });
    }
  },
};
