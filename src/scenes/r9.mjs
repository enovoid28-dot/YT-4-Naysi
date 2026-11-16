import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, kick, num, rule, typeLabel, pin, thread, stampInk,
} from './_arsip.mjs';

// 09 — CERITA HILANG
// Three empty frames, one that is lit from inside, and a line on the desk for
// the viewer to fill in: the first thing you remember, and how old you were.

const FRAMES = [
  { x: 96, y: 300, w: 246, h: 310, rot: -0.02 },
  { x: 372, y: 262, w: 246, h: 310, rot: 0.015 },
  { x: 648, y: 300, w: 246, h: 310, rot: -0.01 },
];

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.62, lampY: 520, key: 'r9' });

    // ── the empty frames
    FRAMES.forEach((f, i) => {
      const a = A(t, c(0, 0.08 + i * 0.16), 0.6, ease.back);
      if (a <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = clamp(a * 1.3);
      ctx.translate(f.x + f.w / 2, f.y + f.h / 2 + (1 - a) * -50);
      ctx.rotate(f.rot);
      ctx.translate(-(f.x + f.w / 2), -(f.y + f.h / 2));
      contact(ctx, f.x + 10, f.y + f.h - 10, f.w - 20, 40, 0.45);
      // mount board
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 14;
      fillRR(ctx, f.x, f.y, f.w, f.h, 3, '#C9BB9E');
      ctx.restore();
      const pg = ctx.createLinearGradient(f.x, f.y, f.x + f.w, f.y + f.h);
      pg.addColorStop(0, '#E6DAC0');
      pg.addColorStop(1, '#BCAC8E');
      fillRR(ctx, f.x, f.y, f.w, f.h, 3, pg);
      // the window
      fillRR(ctx, f.x + 22, f.y + 22, f.w - 44, f.h - 44, 2, 'rgba(20,15,11,0.92)');
      ctx.strokeStyle = 'rgba(226,212,186,0.14)';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(f.x + 34, f.y + 34, f.w - 68, f.h - 68);
      kick(ctx, '—', f.x + f.w / 2, f.y + f.h / 2 + 8, {
        size: 26, color: 'rgba(226,212,186,0.22)', align: 'center',
      });
      ctx.restore();
    });

    // ── the one that is lit from inside
    const pl = A(t, c(1, 0.05), 1.4, ease.out);
    if (pl > 0.01) {
      const fx = 950;
      const fy = 250;
      const fw = 390;
      const fh = 520;
      ctx.save();
      ctx.globalAlpha = clamp(pl * 1.4);
      ctx.translate(fx + fw / 2, fy + fh / 2 + (1 - pl) * 40);
      ctx.rotate(-0.012);
      ctx.translate(-(fx + fw / 2), -(fy + fh / 2));
      contact(ctx, fx, fy + fh - 10, fw, 50, 0.5);
      // board
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = 44;
      ctx.shadowOffsetY = 18;
      fillRR(ctx, fx, fy, fw, fh, 4, '#D3C4A4');
      ctx.restore();
      const pg2 = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh);
      pg2.addColorStop(0, '#EDE1C8');
      pg2.addColorStop(1, '#C2B294');
      fillRR(ctx, fx, fy, fw, fh, 4, pg2);
      fillRR(ctx, fx + 20, fy + 20, fw - 40, fh - 40, 2, '#12100D');
      // warm light inside the frame, as if someone were standing in it
      ctx.save();
      ctx.beginPath();
      ctx.rect(fx + 20, fy + 20, fw - 40, fh - 40);
      ctx.clip();
      const gl = ctx.createRadialGradient(fx + fw * 0.5, fy + fh * 0.62, 10, fx + fw * 0.5, fy + fh * 0.62, fw * 0.62);
      gl.addColorStop(0, `rgba(255,206,150,${0.55 * pl})`);
      gl.addColorStop(0.45, `rgba(220,150,90,${0.28 * pl})`);
      gl.addColorStop(1, 'rgba(120,70,40,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(fx + 20, fy + 20, fw - 40, fh - 40);
      // the silhouette of a swaddled baby, in warm outline
      const bx = fx + fw * 0.5;
      const by = fy + fh * 0.66;
      ctx.strokeStyle = `rgba(255,226,186,${0.5 * pl})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(bx, by, 74, 86, 0, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx - 62, by + 190);
      ctx.bezierCurveTo(bx - 86, by + 96, bx - 30, by + 74, bx, by + 78);
      ctx.bezierCurveTo(bx + 30, by + 74, bx + 86, by + 96, bx + 62, by + 190);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      typeLabel(ctx, 'YANG MASIH ADA', fx + 16, fy + fh + 44, { size: 19, a: pl });
    }

    // ── the line that survives
    const pt = A(t, c(2, 0.05), 0.6, ease.out);
    if (pt > 0.01) {
      ctx.save();
      ctx.globalAlpha = pt;
      rule(ctx, 96, 900, 740, { a: 0.7 });
      kick(ctx, 'YANG TIDAK IKUT HILANG', 96, 958, { size: 20, color: K.dim, track: 6 });
      txt(ctx, 'cara kamu takut.', 96, 1064, { size: 54, font: F.display, color: K.bone });
      txt(ctx, 'cara kamu tenang.', 96, 1132, { size: 54, font: F.display, color: K.bone });
      txt(ctx, 'cara kamu percaya.', 96, 1200, { size: 54, font: F.display, color: K.redHi });
      ctx.restore();
    }

    // ── the comment prompt, typed onto the desk
    const pq = A(t, c(3, 0.12), 0.8, ease.out);
    if (pq > 0.01) {
      ctx.save();
      ctx.globalAlpha = pq;
      const py = 1288;
      const pw = 1248;
      // a strip of paper taped down
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 16;
      fillRR(ctx, 96, py, pw, 214, 4, '#DED2B8');
      ctx.restore();
      const pg = ctx.createLinearGradient(96, py, 96 + pw, py + 214);
      pg.addColorStop(0, '#EFE6D3');
      pg.addColorStop(1, '#C7B99C');
      fillRR(ctx, 96, py, pw, 214, 4, pg);
      kick(ctx, 'TULIS DI KOMENTAR', 128, py + 52, { size: 21, color: 'rgba(40,30,24,0.6)', track: 6 });
      txt(ctx, 'memori paling awal, umur berapa', 128, py + 118, {
        size: 40, font: F.display, color: '#221A14',
      });
      // the blank line and its caret
      ctx.fillStyle = 'rgba(40,30,24,0.35)';
      ctx.fillRect(128, py + 160, pw - 64, 2);
      const blink = (Math.sin(t * 7) > 0) ? 1 : 0.15;
      const tw = measure(ctx, 'memori paling awal, umur berapa', 40, F.display);
      ctx.fillStyle = `rgba(196,58,38,${blink})`;
      ctx.fillRect(132 + tw + 10, py + 88, 3, 36);
      ctx.restore();
    }
  },
};
