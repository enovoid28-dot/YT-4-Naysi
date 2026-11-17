import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, brain, hippocampus, hatch, kick, num, rule,
  stampInk, typeLabel, leader, pin, footer,
} from './_arsip.mjs';

// 04 — TANPA TANGGAL
// The same brain, dimmed, one red curl lit inside it. The tag that ought to
// carry the date is blank, and the stamp says why.

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.34, lampY: 480, key: 'r4' });
    spot(ctx, W * 0.42, 560, 800, 0.12);

    const bw = 1060;
    const bh = 700;
    const bx = 150;
    const by = 168;

    const pb = A(t, 0.08, 1.0, ease.expo);
    if (pb > 0.01) {
      ctx.save();
      ctx.globalAlpha = pb;
      contact(ctx, bx + 30, by + bh - 40, bw - 60, 120, 0.6);
      brain(ctx, bx, by, bw, bh, { key: 'r4' });
      const veil = ctx.createRadialGradient(W * 0.42, 520, 140, W * 0.42, 520, 720);
      veil.addColorStop(0, 'rgba(10,8,7,0.06)');
      veil.addColorStop(1, 'rgba(10,8,7,0.66)');
      ctx.fillStyle = veil;
      ctx.fillRect(bx - 20, by - 20, bw + 40, bh + 50);
      ctx.restore();
    }

    // ── the structure that files the day
    const ph = A(t, c(0, 0.45), 1.0, ease.out);
    if (ph > 0.01) {
      ctx.save();
      ctx.globalAlpha = clamp(ph * 1.6);
      ctx.translate(0, (1 - ph) * 16);
      const hx = bx + bw * 0.62;
      const hy = by + bh * 0.50;
      const hw = 236;
      const hh = 150;
      const pulse = 0.86 + Math.sin(t * 2.6) * 0.06;
      hippocampus(ctx, hx - hw / 2, hy - hh / 2, hw, hh, { glowA: ph * pulse });
      leader(ctx, hx + hw * 0.46, hy + hh * 0.04, 1216, 700, 'HIPOKAMPUS', { size: 24, color: K.bone, align: 'right', a: ph });
      ctx.restore();
    }

    // ── the blank tag
    const pt = A(t, c(1, 0.06), 0.75, ease.out);
    if (pt > 0.01) {
      const tw = 640;
      const th = 258;
      const tx = 140;
      const ty = 924;
      ctx.save();
      ctx.globalAlpha = pt;
      ctx.translate(0, (1 - pt) * 26);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 16;
      const pg = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
      pg.addColorStop(0, '#F5EBD5');
      pg.addColorStop(1, '#CFC0A0');
      fillRR(ctx, tx, ty, tw, th, 6, pg);
      ctx.restore();
      ctx.strokeStyle = 'rgba(74,58,40,0.55)';
      ctx.lineWidth = 2;
      fillRR(ctx, tx + 12, ty + 12, tw - 24, th - 24, 3, 'rgba(0,0,0,0)');
      ctx.stroke();
      txt(ctx, 'KETERANGAN KEJADIAN', tx + 34, ty + 66, { size: 21, font: F.mono, color: 'rgba(56,42,28,0.82)', track: 5 });
      ['KAPAN', 'DI MANA'].forEach((lab, i) => {
        const ly = ty + 132 + i * 76;
        txt(ctx, lab, tx + 34, ly, { size: 27, font: F.mono, color: 'rgba(48,36,24,0.66)', track: 5 });
        ctx.fillStyle = 'rgba(44,32,22,0.42)';
        ctx.fillRect(tx + 190, ly - 4, tw - 244, 2);
        const bl = A(t, c(1, 0.4 + i * 0.18), 0.5);
        if (bl > 0.01) {
          ctx.fillStyle = `rgba(40,30,20,${0.09 * bl})`;
          ctx.fillRect(tx + 202, ly - 12, 130 * bl, 7);
        }
      });
      pin(ctx, tx + tw - 48, ty + 10, 0.72);
      ctx.restore();
    }

    typeLabel(ctx, 'TIDAK ADA YANG MENULISNYA', 140, 1248, { size: 21, a: A(t, c(1, 0.9), 0.5) });

    // ── when the filing starts
    const pm = A(t, c(2, 0.06), 0.8, ease.out);
    if (pm > 0.01) {
      ctx.save();
      ctx.globalAlpha = pm;
      rule(ctx, 104, 1400, 520, { a: 0.7 });
      kick(ctx, 'HIPOKAMPUS MATANG', 104, 1456, { size: 21, color: K.dim, track: 6 });
      num(ctx, '3 – 4', 96, 1568, { size: 104, color: K.bone, track: -5 });
      txt(ctx, 'TAHUN', 104 + measure(ctx, '3 – 4', 104, F.display, -5) + 28, 1560, { size: 38, font: F.mono, color: K.dim, track: 7 });
      ctx.restore();
    }

    // ── the verdict
    const ps = A(t, c(3, 0.10), 0.28, ease.out);
    if (ps > 0.01) {
      const shake = t < c(3, 0.18) ? Math.sin(t * 92) * 4 * (1 - ps) : 0;
      ctx.save();
      ctx.translate(shake, 0);
      stampInk(ctx, 'TANPA TANGGAL', W / 2 + 30, 1316, {
        size: 78, rot: -0.045, a: ps, color: K.red, padX: 26, padY: 16, track: 6, align: 'center',
      });
      ctx.restore();
    }

    footer(ctx, { chapter: 'TANPA TANGGAL' });
  },
};
