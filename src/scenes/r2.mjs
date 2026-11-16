import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, hatch, stampInk, typeLabel, kick, num, rule, pin, leader,
} from './_arsip.mjs';

// 02 — TIGA SETENGAH
// A cloth measuring tape, zero to seven years, laid across the desk. Everything
// before three and a half is struck through; the tape keeps going anyway.

const YEARS = 7;

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.46, lampY: 560, key: 'r2' });

    const x0 = 128;
    const barW = 1184;
    const per = barW / YEARS;
    const barY = 830;
    const barH = 178;

    // ── the headline number, counted up on the beat
    const pn = A(t, c(0, 0.10), 1.5, ease.out);
    const pv = (3.5 * pn).toFixed(1).replace('.', ',');
    if (pn > 0.02) {
      ctx.save();
      ctx.globalAlpha = clamp(pn * 3);
      num(ctx, pv, 112, 470, { size: 290, color: K.bone, track: -10 });
      const wnr = measure(ctx, pv, 290, F.display, -10);
      txt(ctx, 'TAHUN', 118 + wnr + 34, 462, { size: 42, font: F.mono, color: K.dim, track: 8 });
      kick(ctx, 'USIA MEMORI PERTAMA, RATA-RATA', 122, 566, { size: 21, color: K.dim, track: 6 });
      ctx.restore();
    }

    // ── the tape slides onto the desk
    const pa = A(t, 0.05, 0.95, ease.expo);
    ctx.save();
    ctx.globalAlpha = pa;
    ctx.translate((1 - pa) * -220, 0);

    contact(ctx, x0 - 40, barY + barH - 6, barW + 80, 96, 0.55);

    ctx.save();
    ctx.translate(x0 + barW / 2, barY + barH / 2);
    ctx.rotate(-0.008);
    ctx.translate(-(x0 + barW / 2), -(barY + barH / 2));

    // tape body
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    fillRR(ctx, x0, barY, barW, barH, 4, '#D8C9A8');
    ctx.restore();
    const tg = ctx.createLinearGradient(x0, barY, x0, barY + barH);
    tg.addColorStop(0, '#EADFC6');
    tg.addColorStop(0.42, '#DCCDAE');
    tg.addColorStop(1, '#B7A483');
    fillRR(ctx, x0, barY, barW, barH, 4, tg);
    // cloth weave
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.35)' : 'rgba(120,100,72,0.35)';
      ctx.fillRect(x0, barY + i * (barH / 26), barW, 1);
    }
    ctx.restore();

    // ticks
    for (let y = 0; y <= YEARS * 2; y += 1) {
      const x = x0 + (y / 2) * per;
      const major = y % 2 === 0;
      ctx.fillStyle = major ? 'rgba(28,20,14,0.85)' : 'rgba(28,20,14,0.42)';
      ctx.fillRect(x - 1, barY + barH - (major ? 52 : 30), major ? 3 : 2, major ? 52 : 30);
      if (major) {
        txt(ctx, String(y / 2), x, barY + barH - 66, {
          size: 40, font: F.mono, color: '#241A12', align: 'center', track: 1,
        });
      }
    }
    txt(ctx, 'TAHUN', x0 + barW - 26, barY + 52, { size: 26, font: F.mono, color: 'rgba(36,26,18,0.55)', track: 7, align: 'right' });

    // brass end caps
    [x0 - 26, x0 + barW - 2].forEach((ex) => {
      const eg = ctx.createLinearGradient(ex, 0, ex + 28, 0);
      eg.addColorStop(0, '#8A6C2C');
      eg.addColorStop(0.5, '#D8B468');
      eg.addColorStop(1, '#6E5420');
      ctx.fillStyle = eg;
      fillRR(ctx, ex, barY - 6, 28, barH + 12, 6, eg);
    });

    // ── the dead span, struck through as it fills
    const dz = A(t, c(1, 0.05), 1.15, ease.inOut);
    const deadW = per * 3.5 * dz;
    if (deadW > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, barY - 4, deadW, barH + 8);
      ctx.clip();
      ctx.fillStyle = 'rgba(20,13,9,0.58)';
      ctx.fillRect(x0, barY - 4, deadW, barH + 8);
      hatch(ctx, { x: x0, y: barY, w: deadW, h: barH }, (g) => g.rect(x0, barY - 4, deadW, barH + 8), {
        angle: -0.92, step: 17, lw: 2.4, color: '#F08A6B', a: 0.42,
      });
      // the red line through the years that were never recorded
      ctx.strokeStyle = hexA(K.redHi, 0.85);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x0 + 8, barY + barH - 10);
      ctx.lineTo(x0 + deadW - 4, barY + 10);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // ── the marker at 3,5
    const pm = A(t, c(2, 0.02), 0.7, ease.back);
    if (pm > 0.01) {
      const mx = x0 + per * 3.5;
      ctx.save();
      ctx.globalAlpha = clamp(pm);
      ctx.fillStyle = K.redHi;
      ctx.fillRect(mx - 2.5, barY - 190, 5, barH + 210);
      ctx.beginPath();
      ctx.arc(mx, barY - 190, 13 * pm, 0, TAU);
      ctx.fill();
      typeLabel(ctx, 'MEMORI PERTAMA', mx + 26, barY - 198, { size: 22, rot: -0.02 });
      ctx.restore();
    }

    kick(ctx, 'TIDAK ADA ARSIP', x0 + per * 1.72, barY + barH + 54, {
      size: 20, color: hexA(K.redHi, 0.85), align: 'center', track: 6, a: dz,
    });
    kick(ctx, 'YANG MASIH TERCATAT', x0 + per * 5.3, barY + barH + 54, {
      size: 20, color: K.dim, align: 'center', track: 6,
    });
    ctx.restore();

    // ── the bottom line
    const pb = A(t, c(3, 0.10), 0.7, ease.out);
    if (pb > 0) {
      ctx.save();
      ctx.globalAlpha = pb;
      rule(ctx, 120, 1180, 1200);
      kick(ctx, '3,5 TAHUN, DIHITUNG DALAM HARI', 120, 1240, { size: 20, color: K.dim, track: 6 });
      num(ctx, '1.278', 112, 1392, { size: 164, color: K.bone, track: -6 });
      kick(ctx, 'HARI', 122, 1452, { size: 22, color: K.redHi, track: 9 });
      txt(ctx, 'yang bisa kamu ceritakan', W - 120, 1294, {
        size: 32, font: F.mono, color: K.dim, align: 'right', track: 1,
      });
      num(ctx, '0', W - 112, 1432, { size: 150, color: K.redHi, align: 'right', track: -6 });
      ctx.restore();
    }
  },
};
