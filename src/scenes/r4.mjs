import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, brainPlate, hippocampus, hatch, kick, num, rule, stampInk, typeLabel,
  leader, tagCard, pin, thread,
} from './_arsip.mjs';

// 04 — TANPA TANGGAL
// The same plate, cut open at the temporal lobe. The one structure that stamps
// an event with a date is lit in red, and the date tag next to it is blank.

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.38, lampY: 380, key: 'r4' });

    const bw = 1200;
    const bh = 780;
    const bx = 96;
    const by = 230;

    const pb = A(t, 0.05, 0.9, ease.expo);
    ctx.save();
    ctx.globalAlpha = pb;
    contact(ctx, bx - 20, by + bh - 30, bw + 40, 100, 0.5);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 46;
    ctx.shadowOffsetY = 20;
    fillRR(ctx, bx, by, bw, bh, 8, '#0B0908');
    ctx.restore();
    ctx.strokeStyle = 'rgba(244,235,218,0.12)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(bx, by, bw, bh);
    brainPlate(ctx, bx + 20, by + 10, bw - 40, bh - 30, { tone: 0.52, key: 'r4' });

    // the structure, lit
    const ph = A(t, c(0, 0.5), 1.4, ease.out);
    if (ph > 0.01) {
      const hx = bx + bw * 0.44;
      const hy = by + bh * 0.52;
      ctx.save();
      ctx.globalAlpha = clamp(ph * 1.4);
      ctx.globalCompositeOperation = 'screen';
      const gl = ctx.createRadialGradient(hx + 60, hy + 20, 10, hx + 60, hy + 20, 250);
      gl.addColorStop(0, `rgba(220,70,40,${0.34 * ph})`);
      gl.addColorStop(1, 'rgba(220,70,40,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(hx - 260, hy - 220, 620, 480);
      ctx.restore();
      hippocampus(ctx, hx, hy, 210, 132, { a: clamp(ph * 1.2), glowA: 0.8 + Math.sin(t * 2.2) * 0.2 });
      // leader to the name
      const pl = A(t, c(0, 0.9), 0.7, ease.out);
      leader(ctx, hx + 200, hy + 40, hx + 330, hy + 150, 'HIPOKAMPUS', {
        size: 26, color: K.bone, a: pl,
      });
    }
    ctx.restore();

    typeLabel(ctx, 'POTONGAN DALAM, USIA 3 TAHUN', bx + 26, by + bh + 46, { size: 20, a: pb });

    // ── the tag that should carry a date
    const pt = A(t, c(2, 0.05), 0.75, ease.back);
    if (pt > 0.01) {
      ctx.save();
      ctx.globalAlpha = clamp(pt * 1.6);
      ctx.translate(0, (1 - pt) * 60);
      tagCard(ctx, 800, 1040, 500, 356, [
        { k: 'KAPAN', v: '—' },
        { k: 'DI MANA', v: '—' },
        { k: 'SIAPA', v: '—' },
      ], { title: 'KETERANGAN KEJADIAN', rot: 0.010 });

      // the stamp lands under the card, on the desk
      const pq = A(t, c(3, 0.05), 0.38, ease.out);
      stampInk(ctx, 'TANPA TANGGAL', 700, 1452, {
        size: 46, rot: -0.10, a: pq, color: K.red, padX: 24, padY: 16, track: 4,
      });
      ctx.restore();
    }

    // ── the anatomy beat
    const pa = A(t, c(1, 0.05), 0.6, ease.out);
    if (pa > 0) {
      ctx.save();
      ctx.globalAlpha = pa;
      rule(ctx, 96, 1108, 620);
      kick(ctx, 'YANG MENEMPELKAN WAKTU KE KEJADIAN', 96, 1166, { size: 20, color: K.dim, track: 5 });
      txt(ctx, 'belum aktif', 96, 1280, { size: 104, font: F.display, color: K.bone, track: -3 });
      txt(ctx, 'sampai usia 3 — 4 tahun.', 100, 1344, { size: 34, font: F.mono, color: K.dim, track: 1 });
      ctx.restore();
    }
  },
};
