import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, tube, kick, num, rule, typeLabel, stampInk, pin, thread,
} from './_arsip.mjs';

// 07 — TUJUH TAHUN
// Two measuring tubes, filled to what the study measured: most of it still
// there at seven, a third of it left at nine. The liquid is the memory.

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.5, lampY: 380, key: 'r7' });

    const tubeH = 620;
    const tubeW = 168;
    const ty = 470;

    const cols = [
      { x: 330, v: 0.68, hi: 0.72, lo: 0.63, label: 'USIA 5 — 7', head: 'masih ingat', d: 0.55, color: K.teal },
      { x: 838, v: 0.35, hi: 0.35, lo: 0.35, label: 'USIA 8 — 9', head: 'tersisa', d: 1.35, color: K.redHi },
    ];

    const pa = A(t, c(1, 0.05), 0.8, ease.expo);
    cols.forEach((col, i) => {
      const pf = A(t, c(i === 0 ? 2 : 3, col.d), 1.5, ease.out);
      const a = pa;
      if (a <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = a;
      contact(ctx, col.x - 40, ty + tubeH - 30, tubeW + 80, 80, 0.55);

      // glass, empty
      tube(ctx, col.x, ty, tubeW, tubeH, 0, {
        a: 1, color: col.color, ticks: 4, labels: ['75%', '50%', '25%'],
      });
      // liquid rises on cue
      if (pf > 0.01) {
        tube(ctx, col.x, ty, tubeW, tubeH, col.v * pf, {
          a: Math.min(1, pf * 1.6), color: col.color, ticks: 0,
        });
      }
      // tick under the meniscus
      if (pf > 0.85) {
        const my = ty + tubeH - tubeH * col.v;
        ctx.save();
        ctx.globalAlpha = (pf - 0.85) / 0.15;
        ctx.fillStyle = hexA(K.bone, 0.8);
        ctx.fillRect(col.x + tubeW + 4, my - 1, 26, 2);
        txt(ctx, `${Math.round(col.v * 100)}%`, col.x + tubeW + 36, my + 8, {
          size: 24, font: F.mono, color: K.bone, track: 1,
        });
        ctx.restore();
      }

      // head
      kick(ctx, col.label, col.x - 12, ty - 44, { size: 20, color: K.dim, track: 6 });
      const shown = i === 0 ? '63 — 72%' : '35%';
      num(ctx, shown, col.x - 16, ty - 92, {
        size: i === 0 ? 112 : 132, color: i ? K.redHi : K.bone, track: -4, a: clamp(pf * 1.5),
      });
      txt(ctx, col.head, col.x - 12, ty + tubeH + 76, { size: 30, font: F.mono, color: K.dim, track: 2 });

      ctx.restore();
    });

    // ── the divider between the two measurements
    const pv = A(t, c(3, 0.25), 0.7, ease.out);
    if (pv > 0.01) {
      ctx.save();
      ctx.globalAlpha = pv;
      ctx.strokeStyle = 'rgba(244,235,218,0.18)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(720, 420);
      ctx.lineTo(720, 1200);
      ctx.stroke();
      // the fall, drawn as an arrow
      ctx.strokeStyle = hexA(K.redHi, 0.8);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(700, 560);
      ctx.bezierCurveTo(760, 700, 780, 900, 800, 1010);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(800, 1010);
      ctx.lineTo(786, 980);
      ctx.moveTo(800, 1010);
      ctx.lineTo(772, 1004);
      ctx.stroke();
      txt(ctx, '−33', 736, 800, { size: 40, font: F.mono, color: K.redHi, track: 1 });
      kick(ctx, 'POIN', 740, 838, { size: 18, color: K.redHi, track: 4 });
      ctx.restore();
    }

    // ── the study line
    const ps = A(t, c(1, 0.15), 0.6, ease.out);
    if (ps > 0.01) {
      ctx.save();
      ctx.globalAlpha = ps;
      rule(ctx, 120, 1268, 1200);
      kick(ctx, 'BAUER, EMORY — DILACAK DARI USIA 3', 120, 1330, { size: 20, color: K.dim, track: 5 });
      txt(ctx, 'Dua dari tiga kenangan, hilang dalam dua tahun.', 120, 1424, {
        size: 42, font: F.display, color: K.bone,
      });
      ctx.restore();
    }
  },
};
