import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, figureBack, thread, pin, kick, num, rule, typeLabel, leader, footer,
} from './_arsip.mjs';

// 06 — BAHASA
// Four words on cards, a thread running from them to a figure seen from behind.
// Before there were words there was nothing to tie the days together.

const WORDS = ['IBU', 'SAYANG', 'JALAN', 'HANTAR'];

function card(ctx, x, y, w, h, rot, word, a) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;
  fillRR(ctx, -w / 2, -h / 2, w, h, 3, K.paper);
  ctx.restore();
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, '#F6EDD9');
  g.addColorStop(1, '#CBBC9C');
  fillRR(ctx, -w / 2, -h / 2, w, h, 3, g);
  for (let i = 1; i < 4; i++) {
    ctx.fillStyle = 'rgba(96,110,132,0.18)';
    ctx.fillRect(-w / 2 + 24, -h / 2 + (h / 4) * i, w - 48, 1.6);
  }
  ctx.fillStyle = 'rgba(150,44,28,0.30)';
  ctx.fillRect(-w / 2, -h * 0.16, w, 1.6);
  txt(ctx, word, 0, h * 0.11, { size: h * 0.29, font: F.display, color: 'rgba(34,26,18,0.88)', align: 'center', track: 3 });
  ctx.restore();
}

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.7, lampY: 520, key: 'r6' });
    spot(ctx, W * 0.74, 700, 760, 0.16);

    // ── the figure
    const pf = A(t, c(0, 0.25), 1.2, ease.expo);
    if (pf > 0.01) {
      ctx.save();
      ctx.globalAlpha = pf;
      spot(ctx, 1010, 720, 460, 0.32 * pf);
      contact(ctx, 870, 1146, 320, 96, 0.72);
      figureBack(ctx, 1040, 1176, 2.35, { rim: pf });
      ctx.restore();
    }

    // ── the cards
    const layout = [
      { x: 120, y: 250, w: 392, h: 244, rot: -0.055 },
      { x: 96, y: 528, w: 392, h: 244, rot: 0.035 },
      { x: 300, y: 806, w: 392, h: 244, rot: -0.028 },
      { x: 86, y: 1084, w: 392, h: 244, rot: 0.048 },
    ];
    const starts = [c(0, 0.55), c(0, 0.75), c(1, 0.10), c(1, 0.35)];
    layout.forEach((L, i) => {
      const p = A(t, starts[i], 0.7, ease.out);
      if (p <= 0.01) return;
      ctx.save();
      ctx.translate(0, (1 - p) * -44);
      card(ctx, L.x, L.y, L.w, L.h, L.rot, WORDS[i], p);
      pin(ctx, L.x + L.w * 0.5, L.y + 4, 0.62);
      ctx.restore();
    });

    // ── the thread
    const pt = A(t, c(2, 0.55), 1.5, ease.inOut);
    if (pt > 0.01) {
      thread(ctx, [[320, 262], [300, 540], [500, 818], [280, 1096], [620, 1180], [900, 1060], [1038, 900]], {
        p: pt, a: 0.9, lw: 3.6, sag: 22,
      });
    }

    // ── before there were words
    const pv = A(t, c(1, 0.9), 0.7, ease.out);
    if (pv > 0.01) {
      ctx.save();
      ctx.globalAlpha = pv;
      const x = 640;
      const y = 330;
      txt(ctx, 'SEBELUM ADA KATA', x, y, { size: 28, font: F.mono, color: 'rgba(246,237,219,0.70)', track: 5 });
      txt(ctx, 'TIDAK ADA KALIMAT', x + 4, y + 78, { size: 58, font: F.display, color: K.redHi, track: 0.5 });
      ctx.strokeStyle = hexA(K.redHi, 0.85);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 104);
      ctx.lineTo(x + 60 + measure(ctx, 'TIDAK ADA KALIMAT', 58, F.display, 0.5), y + 104);
      ctx.stroke();
      ctx.restore();
    }

    // ── what makes the memory long
    const pz = A(t, c(3, 0.10), 0.8, ease.out);
    if (pz > 0.01) {
      ctx.save();
      ctx.globalAlpha = pz;
      rule(ctx, 640, 1246, 548, { a: 0.7 });
      kick(ctx, 'PANJANG MEMORI', 640, 1302, { size: 21, color: K.dim, track: 6 });
      txt(ctx, 'makin sering ditanya,', 640, 1384, { size: 40, font: F.display, color: K.bone, track: 0.5 });
      txt(ctx, 'makin panjang.', 640, 1436, { size: 40, font: F.display, color: K.gold, track: 0.5 });
      ctx.restore();
    }

    typeLabel(ctx, 'KARTU KATA, USIA 3 TAHUN', 86, 1420, { size: 21, a: A(t, c(2, 1.1), 0.5) });

    footer(ctx, { chapter: 'BAHASA' });
  },
};
