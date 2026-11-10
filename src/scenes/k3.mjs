import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, card, hairline } from './_ep3.mjs';

const STAGES = ['BANGUN', 'REM', 'N1', 'N2', 'N3'];
const STEP = 4; // minutes per sample

/** Builds a plausible night: 5 sleep cycles, deep sleep shrinking each cycle. */
function buildNight({ deepScale = 1, awakenings = [], remScale = 1 }) {
  const out = [];
  const push = (v, mins) => {
    for (let m = 0; m < mins; m += STEP) out.push(v);
  };
  for (let c = 0; c < 5; c++) {
    push(2, 6); // N1
    push(3, 42); // N2
    const deep = Math.max(0, Math.round((56 - c * 14) * deepScale));
    push(4, deep);
    push(3, 16 + c * 2);
    push(1, Math.round((9 + c * 4) * remScale));
    if (c < 4) push(2, 4);
  }
  awakenings.forEach((i) => {
    if (i < out.length) out[i] = 0;
  });
  return out;
}

const PLACEBO = buildNight({});
const CAFFEINE = buildNight({ deepScale: 0.62, remScale: 0.88, awakenings: [46, 47, 94, 95, 96, 97] });

function hypnogram(ctx, x0, top, w, rowH, data, reveal, color) {
  const step = w / data.length;
  const rowY = (v) => top + v * rowH;
  const n = Math.max(1, Math.floor(data.length * reveal));

  // faint area under the curve
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, rowY(4) + rowH * 0.9);
  ctx.lineTo(x0, rowY(data[0]) + rowH * 0.5);
  for (let i = 1; i < Math.min(n, data.length); i++) {
    ctx.lineTo(x0 + i * step, rowY(data[i]) + rowH * 0.5);
  }
  const area = linGrad(ctx, 0, top, 0, rowY(4) + rowH, [
    [0, hexA(color, 0.16)], [1, hexA(color, 0.02)],
  ]);
  ctx.lineTo(x0 + Math.min(n, data.length) * step, rowY(4) + rowH * 0.9);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();
  ctx.restore();

  // deep-sleep blocks
  let i = 0;
  while (i < Math.min(n, data.length)) {
    if (data[i] !== 4) { i++; continue; }
    let j = i;
    while (j < Math.min(n, data.length) && data[j] === 4) j++;
    const a = clamp((reveal * data.length - i) / 6);
    ctx.save();
    ctx.globalAlpha = 0.85 * a;
    const g = linGrad(ctx, 0, rowY(4), 0, rowY(4) + rowH, [
      [0, hexA(color, 0.75)], [1, hexA(color, 0.35)],
    ]);
    ctx.fillStyle = g;
    fillRR(ctx, x0 + i * step + 1, rowY(4) + 5, (j - i) * step - 2, rowH - 10, 8, g);
    ctx.restore();
    i = j;
  }

  // step line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, rowY(data[0]) + rowH * 0.5);
  for (let k = 0; k < Math.min(n, data.length); k++) {
    const x = x0 + k * step;
    ctx.lineTo(x, rowY(data[k]) + rowH * 0.5);
    ctx.lineTo(x + step, rowY(data[k]) + rowH * 0.5);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = hexA(color, 0.5);
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.restore();
}

function panel(ctx, x, y, w, h, o) {
  const { label, value, sub, note, data, reveal, color, a } = o;
  const left = x + 214;
  const plotW = w - 214 - 66;
  const top = y + 168;
  const rowH = 58;

  ctx.save();
  ctx.globalAlpha = a;
  card(ctx, x, y, w, h, {
    fill: 'rgba(255,255,255,0.032)', stroke: hexA(color, 0.22), r: 28, glowColor: color, shadowBlur: 50,
  });

  tracking(ctx, label, x + 44, y + 62, { size: 23, font: F.num6, track: 5, color: hexA(color, 0.95) });
  txt(ctx, value, x + w - 44, y + 78, { size: 58, font: F.num, color: color, align: 'right' });
  txt(ctx, sub, x + w - 44, y + 114, {
    size: 21, font: F.num6, color: hexA(C.bone, 0.42), align: 'right', track: 1,
  });

  STAGES.forEach((s, i) => {
    hairline(ctx, left, top + i * rowH, left + plotW, top + i * rowH, { alpha: i === 4 ? 0 : 0.06 });
    txt(ctx, s, left - 18, top + i * rowH + rowH * 0.5 + 8, {
      size: 17, font: F.num6, color: hexA(C.bone, 0.26), align: 'right', track: 1,
    });
  });
  hairline(ctx, left, top + 4 * rowH + rowH, left + plotW, top + 4 * rowH + rowH, { alpha: 0.14 });

  hypnogram(ctx, left, top, plotW, rowH, data, reveal, color);

  txt(ctx, note, x + 44, y + h - 34, { size: 21, font: F.num6, color: hexA(C.bone, 0.44), track: 2 });
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#0A0B12', mid: '#07080D', bot: '#04050A' });
    glowSpot(ctx, W / 2, 1200, 900, C.mint, 0.05);

    tracking(ctx, '400 MG, ENAM JAM SEBELUM TIDUR', M, 330, {
      size: 24, font: F.num6, track: 6, color: hexA(C.bone, 0.45),
    });
    txt(ctx, 'Satu malam, dua kondisi', M, 470, {
      size: 66, font: F.display, color: C.bone, alpha: EASE.outCubic(clamp((t - 0.1) / 0.8)),
    });

    panel(ctx, M, 536, W - 2 * M, 528, {
      label: 'TANPA KAFEIN', value: '7,7 jam', sub: 'total tidur',
      note: 'TIDUR DALAM 5 BLOK, ± 111 MENIT', data: PLACEBO,
      reveal: clamp((t - 0.9) / 2.6), color: C.mint,
      a: EASE.outCubic(clamp((t - 0.6) / 0.7)),
    });

    panel(ctx, M, 1092, W - 2 * M, 528, {
      label: '400 MG KAFEIN', value: '6,5 jam', sub: 'total tidur',
      note: 'TIDUR DALAM 4 BLOK, ± 74 MENIT', data: CAFFEINE,
      reveal: clamp((t - 5.4) / 2.6), color: C.amber,
      a: EASE.outCubic(clamp((t - 5.1) / 0.7)),
    });

    const dA = EASE.outCubic(clamp((t - 9.4) / 0.8));
    if (dA > 0.01) {
      ctx.save();
      ctx.globalAlpha = dA;
      txt(ctx, '−1,2 jam', W / 2, 1730, {
        size: 88, font: F.num, color: C.ember, align: 'center',
        glowBlur: 40, glowColor: hexA(C.ember, 0.45),
      });
      txt(ctx, 'tanpa terasa oleh pesertanya', W / 2, 1790, {
        size: 27, font: F.num6, color: hexA(C.bone, 0.5), align: 'center', track: 2,
      });
      ctx.restore();
    }
  },
};
