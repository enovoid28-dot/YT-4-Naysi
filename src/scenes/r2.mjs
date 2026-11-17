import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import {
  K, ease, cue, cueWord, A, stage, dotField, number, headline, micro, hairline, hudFrame,
} from './_sinyal.mjs';

// 02 — SEMUA ORANG
// One hundred dots on the right, one number on the left. The dots fill to 98,
// then the number keeps moving without the picture changing: the point is that
// this is not a rare event.

const NUM = [
  { v: '98%', l: 'PERNAH MENGALAMINYA', s: 'SEMUA ORANG, HAMPIR' },
  { v: '91,7%', l: 'MINIMAL SEKALI SEMINGGU', s: 'SURVEI 12.519 ORANG' },
  { v: '33,2%', l: 'SETIAP HARI', s: 'SEPERTIGA DARI KITA' },
];

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 1150, beamY: -200, key: 'r2' });

    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));

    // the hundred, filling
    const w98 = cueWord(scene, 1, 'sembilan');
    const lit = 0.02 + 0.96 * A(t, w98 - 0.55, 1.3, ease.out);
    dotField(ctx, 700, 470, {
      a: A(t, c[0] + 0.2, 0.7, ease.out),
      cols: 10, rows: 10, gap: 72, size: 8.6, lit, color: K.lime,
    });
    micro(ctx, 'SURVEI · 12.519 ORANG', 700, 1180, {
      size: 20, color: 'rgba(244,241,232,0.42)', a: A(t, c[1] + 0.5, 0.6),
    });
    hudFrame(ctx, 668, 434, 700, 700, { a: A(t, c[0] + 0.15, 0.7) * 0.8 });

    // caption 1 — you are not alone
    headline(ctx, ['KAMU TIDAK', 'SENDIRIAN.'], 104, 900, {
      t,
      size: 108, at: c[0], stagger: 0.1, a: 1 - A(t, c[1], 0.4, ease.out),
    });

    // captions 2-4 — the same picture, three numbers
    NUM.forEach((n, i) => {
      const start = i === 0 ? w98 : c[i + 1];
      const end = i < 2 ? c[i + 2] : c[4];
      const pin = A(t, start, 0.5, ease.expo);
      const pout = 1 - A(t, end, 0.34, ease.out);
      const a = Math.min(pin, pout);
      if (a <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = a;
      const dy = (1 - pin) * 60;
      number(ctx, n.v, 96, 1230 + dy, { size: n.v.length > 4 ? 196 : 260, color: K.lime });
      micro(ctx, n.l, 104, 1310 + dy, { size: 28, color: K.ink, track: 6 });
      micro(ctx, n.s, 104, 1362 + dy, { size: 21, color: 'rgba(244,241,232,0.50)', track: 5 });
      // the number's own rule
      const rw = 470 * A(t, start + 0.1, 0.7, ease.expo);
      hairline(ctx, 104, 1178, rw, { color: hexA(K.lime, 0.5), weight: 3 });
      ctx.restore();
    });

    // caption 5 — the name of the thing
    const p5 = A(t, c[4], 0.6, ease.out);
    if (p5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p5;
      micro(ctx, 'NAMANYA', 104, 700, { size: 24, color: K.ember, track: 8 });
      headline(ctx, ['INVOLUNTARY', 'MUSICAL', 'IMAGERY'], 104, 840, {
      t,
        size: 96, at: c[4] + 0.1, stagger: 0.1, accents: [0],
      });
      // the acronym, held in a chip
      const pw = 320 * A(t, c[4] + 0.7, 0.7, ease.expo);
      fillRR(ctx, 104, 1156, pw, 104, 14, hexA(K.lime, 0.12));
      strokeRR(ctx, 104, 1156, pw, 104, 14, hexA(K.lime, 0.55), 2.4);
      txt(ctx, 'INMI', 104 + pw / 2, 1228, {
        size: 64, font: F.head, color: K.lime, track: 14, align: 'center',
      });
      micro(ctx, 'BUKAN SEKADAR LAGU NYANGKUT', 104, 1316, {
        size: 22, color: K.dim, track: 4, a: A(t, c[4] + 0.9, 0.6),
      });
      ctx.restore();
    }
  },
};
