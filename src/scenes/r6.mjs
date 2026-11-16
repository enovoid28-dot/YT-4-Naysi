import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, figureBack, kick, num, rule, typeLabel, pin, thread, stampInk, hatch,
} from './_arsip.mjs';

// 06 — BAHASA
// Four index cards on the desk, joined by red thread into one sentence, and a
// small figure standing in front of them — the only way an event becomes a story.

const CARDS = [
  { w: 'AKU', rot: -0.06, x: 150, y: 356 },
  { w: 'LIHAT', rot: 0.04, x: 420, y: 300 },
  { w: 'KUCING', rot: -0.03, x: 720, y: 386 },
  { w: 'HITAM', rot: 0.05, x: 1030, y: 314 },
];

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.5, lampY: 430, key: 'r6' });

    // ── the cards drop one by one
    CARDS.forEach((cd, i) => {
      const a = A(t, c(1, 0.10 + i * 0.26), 0.55, ease.back);
      if (a <= 0.01) return;
      const w = 250;
      const h = 178;
      ctx.save();
      ctx.globalAlpha = clamp(a * 1.4);
      ctx.translate(cd.x + w / 2, cd.y + h / 2 + (1 - a) * -90);
      ctx.rotate(cd.rot);
      ctx.translate(-(cd.x + w / 2), -(cd.y + h / 2));
      contact(ctx, cd.x + 12, cd.y + h - 4, w - 24, 34, 0.45);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.62)';
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 14;
      fillRR(ctx, cd.x, cd.y, w, h, 4, '#E2D6BC');
      ctx.restore();
      const pg = ctx.createLinearGradient(cd.x, cd.y, cd.x + w, cd.y + h);
      pg.addColorStop(0, '#EFE6D1');
      pg.addColorStop(1, '#C9BB9E');
      fillRR(ctx, cd.x, cd.y, w, h, 4, pg);
      // ruled line at the top, like a real index card
      ctx.fillStyle = 'rgba(150,50,36,0.5)';
      ctx.fillRect(cd.x, cd.y + 34, w, 2);
      txt(ctx, cd.w, cd.x + w / 2, cd.y + h * 0.68, {
        size: 52, font: F.mono, color: '#221A14', align: 'center', track: 3,
      });
      kick(ctx, `0${i + 1}`, cd.x + 14, cd.y + 24, { size: 16, color: 'rgba(40,30,24,0.45)', track: 2 });
      ctx.restore();
    });

    // ── the thread that makes it a sentence
    const pt = A(t, c(2, 0.05), 1.3, ease.inOut);
    if (pt > 0.01) {
      const pts = CARDS.map((cd) => [cd.x + 125, cd.y + 178 * 0.5]);
      thread(ctx, pts, { p: pt, a: 0.9, lw: 3.4, sag: 22 });
      pts.forEach((p, i) => {
        if (pt < (i + 1) / pts.length - 0.001) return;
        pin(ctx, p[0], p[1], 0.6);
      });
    }

    // ── the figure in front of the sentence
    const pf = A(t, c(2, 0.55), 1.0, ease.out);
    if (pf > 0.01) {
      ctx.save();
      ctx.globalAlpha = pf;
      // a warm backlight, so the figure is a silhouette against light, not a hole
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const gl = ctx.createRadialGradient(W * 0.60, 1250, 20, W * 0.60, 1250, 560);
      gl.addColorStop(0, `rgba(255,196,132,${0.20 * pf})`);
      gl.addColorStop(0.5, `rgba(220,140,80,${0.08 * pf})`);
      gl.addColorStop(1, 'rgba(220,140,80,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(W * 0.30, 800, W * 0.62, 900);
      ctx.restore();
      contact(ctx, W * 0.60 - 200, 1462, 400, 64, 0.6);
      figureBack(ctx, W * 0.60, 1480, 1.18, { a: pf, rim: 1.5 });
      ctx.restore();
    }

    // ── the claim
    const pa = A(t, c(0, 0.10), 0.6, ease.out);
    if (pa > 0) {
      ctx.save();
      ctx.globalAlpha = pa;
      rule(ctx, 96, 660, 420, { a: 0.6 });
      kick(ctx, 'SEBELUM BISA BICARA', 96, 716, { size: 20, color: K.dim, track: 6 });
      txt(ctx, 'tidak ada kalimat,', 96, 806, { size: 46, font: F.display, color: K.bone });
      txt(ctx, 'tidak ada tempat', 96, 864, { size: 46, font: F.display, color: K.bone });
      txt(ctx, 'untuk menyimpan.', 96, 922, { size: 46, font: F.display, color: K.redHi });
      ctx.restore();
    }

    typeLabel(ctx, 'KARTU KATA, USIA 2 — 3 TAHUN', 96, 566, { size: 20, rot: -0.015, a: pt });
  },
};
