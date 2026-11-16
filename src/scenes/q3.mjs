import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, kick, paperCard, stampInk, halftone, par, folio, circleMark, arrow,
} from './_kertas.mjs';

// 03 — KONSUMSI
// One bar, split three ways, and the 93 that swallows the other two.

const PARTS = [
  { k: 'KONSUMSI', pct: 93.01, w: 93.01, color: K.ink, txtCol: '#F6F1E4', at: 0 },
  { k: 'INVESTASI', pct: 5.57, w: 5.57, color: K.blue, txtCol: '#FFFFFF', at: 1 },
  { k: 'MODAL KERJA', pct: 1.43, w: 1.43, color: K.red, txtCol: '#FFFFFF', at: 2 },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.35, glowY: 380, glowA: 0.34 });
    folio(ctx, '03', 'KONSUMSI');

    par(ctx, cam, 0.2, () => {
      kick(ctx, 'EDISI 17', W - 88, 116, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
      kick(ctx, 'KE MANA UANG PAYLATER PERGI', 88, 268, { size: 19, color: 'rgba(20,17,16,0.40)', track: 5 });
    });

    // the headline percentage
    const p93 = ease.expo(clamp((t - c(0, 0.05)) / 0.8));
    ctx.save();
    ctx.globalAlpha = clamp(p93 * 1.4);
    txt(ctx, '93%', 88 - (1 - p93) * 40, 700, {
      size: 380, font: F.num, color: K.ink, track: -20,
    });
    ctx.restore();

    kick(ctx, 'DARI SELURUH PEMBIAYAAN PAYLATER', 96, 776, {
      size: 22, color: K.soft, track: 6, align: 'left',
    });

    // one bar, split three ways
    const barX = 88;
    const barY = 900;
    const barW = W - 176;
    const barH = 132;
    const grow = ease.inOut(clamp((t - c(0, 0.45)) / 1.0));

    ctx.save();
    ctx.strokeStyle = K.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.beginPath();
    ctx.rect(barX, barY, barW, barH);
    ctx.clip();

    let px = barX;
    PARTS.forEach((P, i) => {
      const w = (P.w / 100) * barW * grow;
      ctx.fillStyle = P.color;
      ctx.fillRect(px, barY, w, barH);
      px += w;
    });
    ctx.restore();

    // the 5,57 and 1,43 are too thin to label inside: leaders go outside
    const pLead = a(c(1, 0.25), 0.6);
    if (pLead > 0.01) {
      ctx.save();
      ctx.globalAlpha = pLead;
      // mark the last 7% with a bracket above the bar
      const x1 = barX + barW * (93.01 / 100);
      const x2 = barX + barW;
      ctx.strokeStyle = K.blue;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, barY - 34);
      ctx.lineTo(x1, barY - 12);
      ctx.moveTo(x1, barY - 22);
      ctx.lineTo(x2, barY - 22);
      ctx.moveTo(x2, barY - 34);
      ctx.lineTo(x2, barY - 12);
      ctx.stroke();
      kick(ctx, '7% SISANYA', x2, barY - 52, { size: 18, color: K.blue, track: 3, align: 'right' });
      ctx.restore();
    }

    // the three rows of the legend, weighted like the bar itself
    const rows = [
      { k: 'KONSUMSI', v: '93,01%', col: K.ink, at: 0, y: 1130 },
      { k: 'INVESTASI', v: '5,57%', col: K.blue, at: 1, y: 1250 },
      { k: 'MODAL KERJA', v: '1,43%', col: K.red, at: 2, y: 1370 },
    ];
    rows.forEach((R) => {
      const p = ease.out(clamp((t - c(R.at, 0.1)) / 0.55));
      if (p <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate((1 - p) * 30, 0);
      ctx.fillStyle = R.col;
      ctx.fillRect(88, R.y - 26, 34, 34);
      kick(ctx, R.k, 148, R.y, { size: 24, color: K.ink2, track: 5 });
      ctx.fillStyle = 'rgba(20,17,16,0.14)';
      for (let x = 470; x < 1240; x += 14) ctx.fillRect(x, R.y - 12, 5, 1.6);
      txt(ctx, R.v, W - 88, R.y + 4, {
        size: 54, font: F.num, color: R.col, align: 'right', track: -2,
      });
      ctx.restore();
    });

    // the second line of the argument
    const p2 = a(c(2, 0.05), 0.6);
    if (p2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p2;
      circleMark(ctx, 250, 1130, 210, 70, ease.inOut(clamp((t - c(2, 0.15)) / 0.6)), { color: K.red, lw: 5 });
      ctx.restore();
    }

    const p3 = a(c(3, 0.2), 0.6);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3;
      other(ctx, t);
      ctx.restore();
    }
  },
};

// the bottom sentence, set as a printer's mark rather than a line of prose
function other(ctx, t) {
  const x = 88;
  const y = 1440;
  ctx.fillStyle = 'rgba(20,17,16,0.10)';
  ctx.fillRect(x, y - 40, W - 176, 2);
  kick(ctx, 'YANG DIBELI', x, y + 10, { size: 18, color: 'rgba(20,17,16,0.38)', track: 5 });
  txt(ctx, 'sesuatu yang sudah bisa dibeli', x, y + 74, {
    size: 46, font: F.mono6, color: K.ink, track: -1,
  });
}
