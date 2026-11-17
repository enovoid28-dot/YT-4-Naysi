import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, cotTop, mobile, kick, num, rule, typeLabel, footer, leader,
} from './_arsip.mjs';

// 05 — SEPRAI
// The cot from above, so the proportions stay honest. The mobile turns above
// the head; two ages sit under it. Then the sheet changes and the memory goes.

const SHEETS = [
  ['#C7D2C7', '#8B9A90'],
  ['#D2C6A8', '#8C7C5C'],
];

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.48, lampY: 400, key: 'r5' });
    spot(ctx, W * 0.5, 600, 820, 0.16);

    const cw = 1160;
    const ch = 760;
    const cx = (W - cw) / 2;
    const cy = 176;

    const pc = A(t, 0.10, 1.1, ease.expo);
    if (pc > 0.01) {
      ctx.save();
      ctx.globalAlpha = pc;
      ctx.translate(0, (1 - pc) * 50);
      contact(ctx, cx + 26, cy + ch - 40, cw - 52, 150, 0.68);
      cotTop(ctx, cx, cy, cw, ch, { key: 'a', sheet: SHEETS[0] });
      const swap = A(t, c(3, 0.10), 0.55, ease.inOut);
      if (swap > 0.01) {
        ctx.globalAlpha = pc * swap;
        cotTop(ctx, cx, cy, cw, ch, { key: 'b', sheet: SHEETS[1] });
        ctx.globalAlpha = pc;
      }
      ctx.restore();
    }

    // ── the mobile, hanging over the head end
    const pm = A(t, c(1, 0.10), 0.9, ease.out);
    if (pm > 0.01) {
      ctx.save();
      ctx.globalAlpha = pm;
      mobile(ctx, 600, 66, 470, 268, t, { a: pm, swing: 1 });
      ctx.restore();
    }

    typeLabel(ctx, 'TAMPAK ATAS — KASUR, USIA 6 BULAN', cx + 16, cy + ch + 46, { size: 21, a: pc });

    // ── the two ages
    const ages = [
      { at: c(1, 0.55), age: '3', ing: '1', x: 116 },
      { at: c(2, 0.05), age: '6', ing: '2', x: 760 },
    ];
    ages.forEach((a) => {
      const p = A(t, a.at, 0.7, ease.out);
      if (p <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = p;
      const y = 1236;
      rule(ctx, a.x, y - 78, 564, { a: 0.75 });
      kick(ctx, `USIA ${a.age} BULAN`, a.x, y - 28, { size: 21, color: K.dim, track: 6 });
      txt(ctx, `INGAT ${a.ing}`, a.x - 4, y + 78, { size: 82, font: F.display, color: K.bone, track: -2 });
      txt(ctx, 'MINGGU', a.x + 10 + measure(ctx, `INGAT ${a.ing}`, 82, F.display, -2), y + 76, {
        size: 40, font: F.mono, color: K.redHi, track: 7,
      });
      ctx.restore();
    });

    // ── the condition
    const pw = A(t, c(3, 0.05), 0.7, ease.out);
    if (pw > 0.01) {
      ctx.save();
      ctx.globalAlpha = pw;
      fillRR(ctx, 104, 1410, 1232, 106, 4, hexA(K.red, 0.14));
      ctx.strokeStyle = hexA(K.redHi, 0.8);
      ctx.lineWidth = 2.4;
      ctx.strokeRect(104, 1410, 1232, 106);
      txt(ctx, 'SYARATNYA: JANGAN GANTI SEPRAI', 146, 1478, { size: 42, font: F.display, color: K.redHi, track: 2.5 });
      txt(ctx, '→', W - 168, 1480, { size: 46, font: F.display, color: K.redHi });
      ctx.restore();
    }

    // ── what the memory is tied to
    const pl = A(t, c(4, 0.10), 0.7, ease.out);
    if (pl > 0.01) {
      ctx.save();
      ctx.globalAlpha = pl;
      txt(ctx, 'Menempel pada tempat, bukan pada cerita.', 104, 1588, {
        size: 34, font: F.mono, color: 'rgba(246,237,219,0.6)', track: 0.5,
      });
      ctx.restore();
    }

    footer(ctx, { chapter: 'SEPRAI' });
  },
};
