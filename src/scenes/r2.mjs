import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, typeLabel, kick, num, rule, stat, footer, hatch,
} from './_arsip.mjs';

// 02 — TIGA SETENGAH
// A cloth tape, nought to seven years. The first three and a half are struck
// out; the tape keeps going anyway.

const YEARS = 7;

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.46, lampY: 620, key: 'r2' });
    spot(ctx, W * 0.5, 760, 860, 0.14);

    const x0 = 132;
    const barW = 1176;
    const per = barW / YEARS;
    const barY = 700;
    const barH = 250;

    // ── the number
    const pn = A(t, c(0, 0.06), 1.4, ease.out);
    if (pn > 0.02) {
      ctx.save();
      ctx.globalAlpha = clamp(pn * 2.6);
      num(ctx, (3.5 * pn).toFixed(1).replace('.', ','), 104, 452, { size: 300, color: K.bone, track: -12 });
      txt(ctx, 'TAHUN', 116 + measure(ctx, '3,5', 300, F.display, -12) + 42, 442, {
        size: 44, font: F.mono, color: K.dim, track: 9,
      });
      kick(ctx, 'USIA MEMORI PERTAMA, RATA-RATA', 112, 544, { size: 22, color: K.dim, track: 6 });
      ctx.restore();
    }

    // ── the tape
    const pa = A(t, 0.06, 1.0, ease.expo);
    if (pa > 0.01) {
      ctx.save();
      ctx.globalAlpha = pa;
      ctx.translate((1 - pa) * -280, 0);
      contact(ctx, x0 - 46, barY + barH - 10, barW + 92, 130, 0.64);

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.68)';
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 22;
      fillRR(ctx, x0, barY, barW, barH, 6, '#E3D5B6');
      ctx.restore();
      const tg = ctx.createLinearGradient(x0, barY, x0, barY + barH);
      tg.addColorStop(0, '#F6ECd2'.replace('d', 'D'));
      tg.addColorStop(0.35, '#E6D7B7');
      tg.addColorStop(0.72, '#D2C09B');
      tg.addColorStop(1, '#A8946F');
      fillRR(ctx, x0, barY, barW, barH, 6, tg);
      // woven cloth
      for (let i = 0; i < 46; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.18)' : 'rgba(120,98,68,0.10)';
        ctx.fillRect(x0, barY + i * (barH / 46), barW, 1.2);
      }

      // graduations: every half year, majors every year
      for (let k = 0; k <= YEARS * 2; k++) {
        const x = x0 + (k / 2) * per;
        const major = k % 2 === 0;
        ctx.fillStyle = major ? 'rgba(28,20,13,0.85)' : 'rgba(28,20,13,0.38)';
        ctx.fillRect(x - 1.5, barY + barH - (major ? 84 : 46), major ? 3.6 : 2.6, major ? 84 : 46);
        if (major) {
          txt(ctx, String(k / 2), x, barY + barH - 104, {
            size: 50, font: F.mono, color: '#241A12', align: 'center', track: 1,
          });
        }
      }
      txt(ctx, 'TAHUN', x0 + barW - 40, barY + 66, {
        size: 26, font: F.mono, color: 'rgba(36,26,18,0.50)', track: 8, align: 'right',
      });

      // brass ends
      [x0 - 34, x0 + barW - 2].forEach((ex) => {
        const eg = ctx.createLinearGradient(ex, 0, ex + 36, 0);
        eg.addColorStop(0, '#6E5422');
        eg.addColorStop(0.42, '#E7C783');
        eg.addColorStop(1, '#5C461C');
        fillRR(ctx, ex, barY - 10, 36, barH + 20, 8, eg);
      });

      // ── the years with no archive at all
      const dz = A(t, c(1, 0.05), 1.2, ease.inOut);
      if (dz > 0.01) {
        const deadW = per * 3.5 * dz;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, barY - 6, deadW, barH + 12);
        ctx.clip();
        const dg = ctx.createLinearGradient(x0, barY, x0 + deadW, barY + barH);
        dg.addColorStop(0, 'rgba(12,9,7,0.80)');
        dg.addColorStop(1, 'rgba(12,9,7,0.66)');
        ctx.fillStyle = dg;
        ctx.fillRect(x0, barY - 6, deadW, barH + 12);
        // faint cloth texture survives under the dark
        hatch(ctx, { x: x0, y: barY, w: deadW, h: barH }, (g) => g.rect(x0, barY - 6, deadW, barH + 12), {
          angle: -0.94, step: 34, lw: 2, color: '#E4866A', a: 0.16,
        });
        // the zero that covers the whole stretch
        ctx.fillStyle = hexA(K.redHi, 0.92 * clamp((dz - 0.2) / 0.6));
        txt(ctx, '0', x0 + deadW * 0.5, barY + barH * 0.62, {
          size: barH * 0.86, font: F.display, align: 'center', color: hexA(K.redHi, 0.92 * clamp((dz - 0.2) / 0.6)), track: 0,
        });
        ctx.restore();
      }
      ctx.restore();
    }

    // ── the marker
    const pm = A(t, c(0, 1.15), 0.7, ease.back);
    if (pm > 0.01) {
      const mx = x0 + per * 3.5;
      ctx.save();
      ctx.globalAlpha = clamp(pm);
      ctx.fillStyle = K.redHi;
      ctx.fillRect(mx - 3, barY - 226, 6, barH + 240);
      ctx.beginPath();
      ctx.arc(mx, barY - 226, 15 * pm, 0, TAU);
      ctx.fill();
      typeLabel(ctx, 'MEMORI PERTAMA', mx + 28, barY - 234, { size: 23, rot: -0.015 });
      ctx.restore();
    }

    kick(ctx, 'TIDAK ADA ARSIP', x0 + per * 1.75, barY + barH + 66, {
      size: 22, color: hexA(K.redHi, 0.92), align: 'center', track: 7, a: A(t, c(1, 0.5), 0.5),
    });
    kick(ctx, 'YANG MASIH TERCATAT', x0 + per * 5.3, barY + barH + 66, {
      size: 22, color: K.dim, align: 'center', track: 7, a: A(t, c(1, 0.5), 0.5),
    });

    // ── the count in days
    const pb = A(t, c(3, 0.08), 0.7, ease.out);
    if (pb > 0.01) {
      ctx.save();
      ctx.globalAlpha = pb;
      stat(ctx, 104, 1352, { label: '3,5 TAHUN, DIHITUNG DALAM HARI', value: '1.278', size: 148, w: 600 });
      kick(ctx, 'HARI TANPA CATATAN', 112, 1432, { size: 22, color: K.redHi, track: 8 });
      rule(ctx, 760, 1260, 576, { a: 0.6 });
      kick(ctx, 'YANG BISA KAMU CERITAKAN', 760, 1314, { size: 21, color: K.dim, track: 5 });
      num(ctx, '0', 752, 1454, { size: 150, color: K.redHi, track: -6 });
      ctx.restore();
    }

    footer(ctx, { chapter: 'TIGA SETENGAH' });
  },
};
