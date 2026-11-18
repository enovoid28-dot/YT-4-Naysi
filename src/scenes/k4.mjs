import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { K, ease, depot, cue, vignette } from './_kirim.mjs';

// 04 — HITUNGAN SATU PESANAN
// A bill that prints itself line by line, each line on the word that names it.

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 560, glowA: 0.10, horizon: 1320 });

    const x = 140;
    const y = 330;
    const w = W - 280;
    const h = 880;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 22;
    fillRR(ctx, x, y, w, h, 14, K.paper);
    ctx.restore();
    tracking(ctx, 'SATU PESANAN · SATU BAJU', x + 44, y + 66, {
      size: 20, font: F.mono6, track: 5, color: 'rgba(26,27,30,0.5)',
    });

    // a blank form, so the sheet is never an empty white rectangle
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 5; i++) {
      const yy = y + 160 + i * 118;
      ctx.fillStyle = 'rgba(26,27,30,0.08)';
      ctx.fillRect(x + 44, yy + 46, w - 88, 1.6);
      ctx.fillStyle = 'rgba(26,27,30,0.05)';
      ctx.fillRect(x + 44, yy - 20, (w - 88) * 0.34, 12);
    }
    ctx.restore();

    const rows = [
      { at: 1, l: 'HARGA BAJU', v: '150.000', tone: '#1A1B1E', size: 62 },
      { at: 2, l: 'BIAYA LAYANAN', v: '− 12.000', tone: '#9C3524', size: 54 },
      { at: 2, o: 0.9, l: 'LOGISTIK', v: '− 5.000', tone: '#9C3524', size: 54 },
      { at: 3, l: 'IKLAN', v: '− 8.000', tone: '#9C3524', size: 54 },
      { at: 3, o: 0.9, l: 'HARGA POKOK', v: '− 80.000', tone: '#9C3524', size: 54 },
    ];

    rows.forEach((r, i) => {
      const q = clamp((t - c(r.at, 0.06 + (r.o || 0))) / 0.4);
      if (q <= 0) return;
      const yy = y + 160 + i * 118;
      ctx.save();
      ctx.globalAlpha = q;
      tracking(ctx, r.l, x + 44, yy - 42, { size: 19, font: F.mono6, track: 4, color: 'rgba(26,27,30,0.45)' });
      txt(ctx, r.v, x + 44, yy + 18, { size: r.size, font: F.num, color: r.tone, track: -2 });
      ctx.fillStyle = 'rgba(26,27,30,0.10)';
      ctx.fillRect(x + 44, yy + 46, w - 88, 1.6);
      ctx.restore();
    });

    // the remainder appears on "sisanya empat puluh lima ribu"
    const rest = a(c(4, 0.08), 0.5);
    if (rest > 0.01) {
      ctx.save();
      ctx.globalAlpha = rest;
      ctx.fillStyle = 'rgba(26,27,30,0.16)';
      ctx.fillRect(x + 44, y + 700, w - 88, 3);
      tracking(ctx, 'SISA', x + 44, y + 772, { size: 24, font: F.mono6, track: 6, color: 'rgba(26,27,30,0.55)' });
      txt(ctx, '45.000', x + w - 44, y + 800, {
        size: 104, font: F.num, color: '#8A5A10', align: 'right', track: -4,
      });
      ctx.restore();
    }

    // the caveat on the final line
    const cav = a(c(5, 0.2), 0.5);
    if (cav > 0.01) {
      ctx.save();
      ctx.globalAlpha = cav;
      tracking(ctx, 'SEBELUM RETUR · SEBELUM DISKON · SEBELUM PAJAK', W / 2, 1290, {
        size: 23, font: F.mono6, track: 4, color: hexA(K.ember, 0.85), align: 'center',
      });
      ctx.restore();
    }

    vignette(ctx, 0.45);
  },
};
