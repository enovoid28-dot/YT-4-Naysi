import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, tube, kick, num, rule, typeLabel, footer,
} from './_arsip.mjs';

// 07 — TUJUH TAHUN
// Two glass tubes, one for each age band, filled to the number the study found.

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.5, lampY: 360, key: 'r7' });
    spot(ctx, W * 0.5, 600, 840, 0.15);

    const baseY = 1042;
    const tubeH = 800;
    const tubeW = 228;

    // ── the year of the clearing, ghosted
    const p7 = A(t, 0.12, 1.0, ease.expo);
    if (p7 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p7 * 0.15;
      num(ctx, '7', W / 2 - 16, 690, { size: 600, color: K.bone, align: 'center', track: -18 });
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = clamp(p7 * 1.4);
      kick(ctx, 'PEMBERSIHAN BESAR DIMULAI', W / 2, 158, { size: 25, color: K.dim, align: 'center', track: 8 });
      ctx.restore();
    }

    const bands = [
      { x: 300, label: 'USIA 5 — 7', v: 68, range: '63—72%', color: K.teal, at: c(2, 0.10) },
      { x: 912, label: 'USIA 8 — 9', v: 35, color: K.redHi, at: c(4, 0.10) },
    ];
    bands.forEach((b) => {
      const pg = A(t, b.at, 1.6, ease.out);
      // the empty glass is on the table from the start of the scene: the study
      // is being described before its result is poured in
      const appear = A(t, 0.28, 0.8, ease.expo);
      if (appear <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = appear;
      contact(ctx, b.x - 50, baseY + 6, tubeW + 100, 96, 0.64);
      spot(ctx, b.x + tubeW / 2, baseY - tubeH * 0.5, 460, 0.10);
      tube(ctx, b.x, baseY - tubeH, tubeW, tubeH, pg * (b.v / 100), { color: b.color, ticks: 4, labels: ['25', '50', '75'] });
      if (b.range) {
        if (pg > 0.5) {
          num(ctx, b.range, b.x - 14, baseY + 216, { size: 118, color: b.color, track: -5 });
        }
      } else {
        const shown = Math.round(b.v * clamp(pg * 1.15));
        if (shown > 0) num(ctx, `${shown}%`, b.x - 10, baseY + 216, { size: 138, color: b.color, track: -4 });
      }
      txt(ctx, b.label, b.x + 2, baseY + 296, { size: 32, font: F.mono, color: K.dim, track: 4 });
      ctx.restore();
    });

    // ── the drop between the two
    const pd = A(t, c(4, 0.85), 0.8, ease.out);
    if (pd > 0.01) {
      ctx.save();
      ctx.globalAlpha = pd;
      const x = 616;
      const y = 560;
      ctx.fillStyle = hexA(K.bone, 0.85);
      ctx.fillRect(x, y, 208, 3);
      txt(ctx, 'TURUN', x + 104, y - 24, { size: 52, font: F.display, color: K.redHi, align: 'center', track: 3 });
      kick(ctx, 'DALAM DUA TAHUN', x + 104, y + 48, { size: 19, color: hexA(K.redHi, 0.80), align: 'center', track: 5 });
      ctx.restore();
    }

    // ── the source
    const ps = A(t, c(1, 0.10), 0.8, ease.out);
    if (ps > 0.01) {
      ctx.save();
      ctx.globalAlpha = ps;
      rule(ctx, 104, 1424, 1232, { a: 0.5 });
      typeLabel(ctx, 'BAUER & EMORY, 2014', 104, 1494, { size: 21 });
      txt(ctx, 'Anak yang sama, diwawancarai dua kali.', 104, 1560, {
        size: 30, font: F.mono, color: 'rgba(246,237,219,0.58)', track: 0.5,
      });
      txt(ctx, 'Persen memori usia 5 — 7 yang masih ada.', 104, 1602, {
        size: 30, font: F.mono, color: 'rgba(246,237,219,0.58)', track: 0.5,
      });
      ctx.restore();
    }

    footer(ctx, { chapter: 'TUJUH TAHUN' });
  },
};
