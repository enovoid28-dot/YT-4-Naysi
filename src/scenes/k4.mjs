import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, card, hairline } from './_ep3.mjs';

const BAR_X = 300;
const BAR_W = 1000;
const BAR_H = 132;

const NORMAL = [
  { k: 'N1', min: 32, c: '#2E3A4C' },
  { k: 'N2', min: 208, c: '#3D4C63' },
  { k: 'N3', min: 111, c: '#4CE0B3' },
  { k: 'REM', min: 111, c: '#2B5F63' },
];
const CAFFEINATED = [
  { k: 'N1', min: 43, c: '#3A3A46' },
  { k: 'N2', min: 191, c: '#4C4C5A' },
  { k: 'N3', min: 74, c: '#FFB03A' },
  { k: 'REM', min: 82, c: '#6A4A28' },
];

const TOTAL = (s) => s.reduce((a, b) => a + b.min, 0);

function bar(ctx, y, segs, o = {}) {
  const { a = 1, grow = 1, highlight = null, label = '', sub = '' } = o;
  const total = TOTAL(segs);
  ctx.save();
  ctx.globalAlpha = a;
  let x = BAR_X;
  const full = BAR_W * 0.94;
  segs.forEach((s, i) => {
    const w = (s.min / total) * full * grow;
    const isHi = highlight === s.k;
    ctx.save();
    if (isHi) {
      ctx.shadowColor = hexA(s.c, 0.5);
      ctx.shadowBlur = 36;
    }
    const g = linGrad(ctx, 0, y, 0, y + BAR_H, [
      [0, hexA(s.c, 0.98)], [1, hexA(s.c, 0.62)],
    ]);
    ctx.beginPath();
    if (ctx.roundRect) {
      const r = i === 0 ? [20, 0, 0, 20] : i === segs.length - 1 ? [0, 20, 20, 0] : [0, 0, 0, 0];
      ctx.roundRect(x, y, Math.max(2, w), BAR_H, r);
    } else {
      ctx.rect(x, y, Math.max(2, w), BAR_H);
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();

    if (w > 90) {
      txt(ctx, s.k, x + w / 2, y + 58, {
        size: 30, font: F.num6, align: 'center',
        color: isHi ? '#0A0B10' : 'rgba(240,244,250,0.6)', track: 2,
      });
      txt(ctx, `${s.min} mnt`, x + w / 2, y + 100, {
        size: 24, font: F.num6, align: 'center',
        color: isHi ? 'rgba(10,11,16,0.72)' : 'rgba(240,244,250,0.4)',
      });
    }
    x += w;
  });

  txt(ctx, label, BAR_X - 30, y + 54, {
    size: 25, font: F.num6, color: hexA(C.bone, 0.55), align: 'right', track: 3,
  });
  txt(ctx, sub, BAR_X - 30, y + 94, {
    size: 20, font: F.num6, color: hexA(C.bone, 0.32), align: 'right',
  });
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#08090F', mid: '#06070C', bot: '#04050A' });
    glowSpot(ctx, 900, 1000, 820, C.mint, 0.05);

    tracking(ctx, 'ARSITEKTUR SATU MALAM', M, 330, {
      size: 24, font: F.num6, track: 7, color: hexA(C.bone, 0.45),
    });
    txt(ctx, 'Yang hilang bukan cuma jam', M, 468, {
      size: 64, font: F.display, color: C.bone, alpha: EASE.outCubic(clamp((t - 0.1) / 0.8)),
    });
    txt(ctx, 'Tahapan tidur ikut bergeser, dan itu yang tidak terasa', M, 530, {
      size: 27, font: F.num6, color: hexA(C.bone, 0.45), alpha: clamp((t - 0.4) / 0.8),
    });

    const a1 = EASE.outCubic(clamp((t - 0.9) / 0.8));
    bar(ctx, 700, NORMAL, {
      a: a1, grow: clamp((t - 0.9) / 1.6), highlight: 'N3', label: 'TANPA', sub: 'kafein · 462 mnt',
    });

    const legendA = clamp((t - 2.8) / 0.8);
    if (legendA > 0.01) {
      ctx.save();
      ctx.globalAlpha = legendA * 0.92;
      txt(ctx, 'N3 = tidur dalam, tahap yang paling memulihkan', BAR_X, 900, {
        size: 24, font: F.num6, color: hexA(C.mint, 0.7), track: 1,
      });
      ctx.restore();
    }

    const a2 = EASE.outCubic(clamp((t - 4.0) / 0.8));
    bar(ctx, 1000, CAFFEINATED, {
      a: a2, grow: clamp((t - 4.0) / 1.6), highlight: 'N3', label: 'DENGAN', sub: 'kafein · 390 mnt',
    });

    // deep-sleep comparison strip
    const c1 = EASE.outCubic(clamp((t - 5.4) / 0.8));
    if (c1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = c1;
      tracking(ctx, 'TIDUR DALAM PER MALAM', BAR_X, 1218, {
        size: 22, font: F.num6, track: 5, color: hexA(C.bone, 0.4),
      });
      const rows = [
        { label: 'TANPA', v: 111, c: C.mint },
        { label: 'DENGAN', v: 74, c: C.amber },
      ];
      const maxW = 620;
      rows.forEach((r, i) => {
        const y = 1268 + i * 92;
        const g2 = clamp((t - (5.6 + i * 0.5)) / 1.2);
        const w = (r.v / 120) * maxW * g2;
        fillRR(ctx, BAR_X, y, maxW, 56, 14, 'rgba(255,255,255,0.04)');
        fillRR(ctx, BAR_X, y, Math.max(6, w), 56, 14, r.c);
        txt(ctx, r.label, BAR_X - 22, y + 40, {
          size: 20, font: F.num6, color: hexA(C.bone, 0.42), align: 'right', track: 2,
        });
        txt(ctx, `${r.v} mnt`, BAR_X + maxW + 24, y + 40, {
          size: 26, font: F.num6, color: r.c, align: 'left', track: 1,
        });
      });
      txt(ctx, '−37 menit tidur dalam', BAR_X, 1462, {
        size: 30, font: F.head, color: C.amberHi,
      });
      ctx.restore();
    }

    const c2 = EASE.outCubic(clamp((t - 9.0) / 0.8));
    if (c2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = c2;
      const cy = 1504 + (1 - c2) * 28;
      card(ctx, M, cy, W - 2 * M, 236, {
        fill: 'rgba(255,107,26,0.06)', stroke: 'rgba(255,107,26,0.30)', r: 26, glowColor: C.ember, shadowBlur: 44,
      });
      txt(ctx, 'Efisiensi tidur turun 7%', M + 46, cy + 92, {
        size: 46, font: F.head, color: C.bone,
      });
      txt(ctx, 'Meta-analisis 24 studi. Kamu tetap tidur, cuma kurang memulihkan.', M + 46, cy + 158, {
        size: 26, font: F.num6, color: hexA(C.bone, 0.5), track: 1,
      });
      txt(ctx, 'Tanpa alat ukur, tidak ada yang menyadarinya.', M + 46, cy + 208, {
        size: 26, font: F.num6, color: hexA(C.amber, 0.85), track: 1,
      });
      ctx.restore();
    }
  },
};
