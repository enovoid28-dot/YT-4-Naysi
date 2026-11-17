import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, stage, pianoRoll, headline, micro, number, hairline, hudFrame,
} from './_sinyal.mjs';

// 04 — FORMULA
// A piano roll that will not stop scrolling. Then the three features, as chips
// that land one at a time: speed, simplicity, a melody you can guess.

const FEAT = [
  ['TEMPO', 'LEBIH CEPAT', K.lime],
  ['RITME', 'SEDERHANA', K.ice],
  ['MELODI', 'MUDAH DITEBAK', K.ember],
];

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 1180, beamY: -180, key: 'r4' });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));

    // caption 1 — not every song can do this
    headline(ctx, ['TIDAK SEMUA', 'LAGU BISA', 'NYANGKUT.'], 104, 400, {
      t,
      size: 100, at: c[0], stagger: 0.09, a: 1 - A(t, c[1], 0.4, ease.out),
    });

    // the roll
    const pr = A(t, c[1] - 0.2, 0.9, ease.expo);
    if (pr > 0.01) {
      ctx.save();
      ctx.globalAlpha = pr * 0.95;
      pianoRoll(ctx, 104, 340, 1232, 500, t, { p: A(t, c[1], 1.4), color: K.ice, scroll: (t * 0.16) % 1 });
      ctx.restore();
    }

    // caption 2 — one hundred against one hundred
    const p2 = A(t, c[1], 0.6, ease.out);
    const out2 = 1 - A(t, c[2], 0.35, ease.out);
    if (p2 > 0.01 && out2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p2, out2);
      number(ctx, '100', 96, 1010, { size: 150, color: K.lime });
      micro(ctx, 'LAGU YANG NYANGKUT', 100, 1060, { size: 20, color: K.dim, track: 5 });
      txt(ctx, 'vs', 470, 1000, { size: 60, font: F.mono, color: 'rgba(244,241,232,0.35)' });
      number(ctx, '100', 620, 1010, { size: 150, color: 'rgba(244,241,232,0.55)' });
      micro(ctx, 'LAGU BIASA', 624, 1060, { size: 20, color: K.dim, track: 5 });
      hairline(ctx, 96, 930, 1180 * A(t, c[1] + 0.2, 0.8, ease.expo), { color: 'rgba(244,241,232,0.18)' });
      ctx.restore();
    }

    // captions 3-5 — the three features, then the verdict
    const verdict = A(t, c[4], 0.7, ease.expo);
    FEAT.forEach(([k, v, col], i) => {
      const start = c[2] + i * 0.42;
      const p = A(t, start, 0.55, ease.expo);
      if (p <= 0.01) return;
      const y = 980 + i * 150;
      const w = 760 * p;
      ctx.save();
      ctx.globalAlpha = p * (1 - verdict);
      ctx.fillStyle = hexA(col, 0.06);
      fillRR(ctx, 104, y - 62, w, 108, 10, hexA(col, 0.06));
      strokeRR(ctx, 104, y - 62, w, 108, 10, hexA(col, 0.38), 1.6);
      txt(ctx, k, 132, y, { size: 58, font: F.head, color: K.ink, track: 2 });
      txt(ctx, v, 132 + 300, y, { size: 34, font: F.mono, color: col, track: 6 });
      micro(ctx, `0${i + 1}`, 830, y, { size: 22, color: 'rgba(244,241,232,0.3)' });
      ctx.restore();
    });

    // the contour itself: a line that goes up and down exactly as expected
    const pc = A(t, c[3], 1.2, ease.inOut);
    if (pc > 0.01) {
      ctx.save();
      ctx.globalAlpha = pc * (1 - verdict);
      const x0 = 120;
      const w = 1200;
      const y0 = 1280;
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const p = i / 60;
        pts.push([x0 + p * w * pc, y0 - Math.sin(p * TAU * 1.25) * 90 - Math.sin(p * TAU * 0.35) * 40]);
      }
      ctx.strokeStyle = K.ember;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.shadowColor = hexA(K.ember, 0.6);
      ctx.shadowBlur = 18;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.restore();
    }

    // caption 5 — the verdict, big
    if (verdict > 0.01) {
      ctx.save();
      ctx.globalAlpha = verdict;
      headline(ctx, ['MUDAH DITEBAK,', 'MUDAH NYANGKUT.'], 104, 1050, {
      t,
        size: 112, at: c[4] + 0.1, stagger: 0.09, accents: [1, 2],
      });
      micro(ctx, 'YANG BISA DITEBAK OTAK LEBIH CEPAT DISIMPAN', 108, 1280, {
        size: 20, color: K.dim, track: 3,
      });
      ctx.restore();
    }
  },
};
