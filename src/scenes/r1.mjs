import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, stage, vinyl, headline, micro, number, crossMark, hairline,
} from './_sinyal.mjs';

// 01 — EMPAT BARIS
// A record turns in the top corner. The claim arrives word by word, then the
// "four bars" are counted out, and the last beat is a STOP button with a cross
// through it: there is no control here.

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 1010, beamY: -240, key: 'r1' });

    const c0 = cue(scene, 0);
    const c1 = cue(scene, 1);
    const c2 = cue(scene, 2);
    const c3 = cue(scene, 3);
    const c4 = cue(scene, 4);

    // the disc: in from the top, then turning for the rest of the shot
    const pIn = A(t, c0 - 0.1, 1.5, ease.expo);
    vinyl(ctx, lerp(1150, 1040, pIn), lerp(-360, 470, pIn), 400, t, {
      a: pIn,
      glow: 0.5 + 0.5 * A(t, c1, 0.8),
      label: 'NAYSI',
      sub: 'EP · 19',
      speed: 0.42,
    });

    // caption 1 — the claim
    const out1 = 1 - A(t, c2, 0.42, ease.out);
    headline(ctx, ['LAGU ITU', 'TIDAK KELUAR'], 104, 1010, {
      t,
      size: 120, at: c0, stagger: 0.085, a: out1,
    });
    const out1b = 1 - A(t, c2, 0.34, ease.out);
    headline(ctx, ['DARI KEPALAMU.'], 104, 1160, {
      t,
      size: 86, at: c1, stagger: 0.0, a: out1b, color: K.dim,
    });

    // caption 2 — sama, bukan baru
    const p2 = A(t, c1 + 0.3, 0.7, ease.out);
    micro(ctx, 'HARI', 118, 1250, { size: 22, a: p2 * out1b * 0.8 });
    number(ctx, '03', 118, 1360, { size: 100, a: p2 * out1b, color: K.ember });
    hairline(ctx, 300, 1310, 200, { a: p2 * out1b * 0.5 });
    micro(ctx, 'BAGIAN YANG SAMA', 300, 1355, { size: 21, a: p2 * out1b * 0.75, color: K.dim });

    // caption 3 — four bars, counted
    const p3 = A(t, c2, 0.5, ease.out);
    const out3 = 1 - A(t, c3, 0.35, ease.out);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3 * out3;
      micro(ctx, 'BUKAN SELURUH LAGUNYA', 104, 1040, { size: 24, color: K.lime });
      number(ctx, '04', 100, 1300, { size: 250, color: K.ink });
      micro(ctx, 'BARIS', 380, 1290, { size: 42, color: K.lime, track: 12 });
      for (let i = 0; i < 4; i++) {
        const q = A(t, c2 + 0.15 + i * 0.16, 0.5, ease.expo);
        const x = 480 + i * 92;
        ctx.fillStyle = hexA(K.lime, 0.12);
        ctx.fillRect(x, 1372, 76, 8);
        ctx.fillStyle = K.lime;
        ctx.fillRect(x, 1372, 76 * q, 8);
        txt(ctx, String(i + 1).padStart(2, '0'), x, 1412, {
          size: 19, font: F.mono, color: 'rgba(244,241,232,0.35)', track: 2,
        });
      }
      ctx.restore();
    }

    // caption 4 — the brain is not broken: the loop is
    const p4 = A(t, c3, 0.6, ease.out);
    const out4 = 1 - A(t, c4, 0.4, ease.out);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4 * out4;
      const cx = 760;
      const cy = 1180;
      const r = 250;
      ctx.strokeStyle = 'rgba(244,241,232,0.14)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.stroke();
      const head = -Math.PI / 2 + t * 1.15;
      for (let i = 0; i < 26; i++) {
        const ang = head - i * 0.055;
        ctx.strokeStyle = hexA(K.ember, (1 - i / 26) * 0.85);
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, r, ang - 0.05, ang + 0.02);
        ctx.stroke();
      }
      txt(ctx, 'TIDAK RUSAK', cx, cy + 14, {
        size: 78, font: F.head, color: K.ink, align: 'center', track: -2,
      });
      txt(ctx, 'LINGKARANNYA BELUM SELESAI', cx, cy + 78, {
        size: 21, font: F.mono, color: K.dim, align: 'center', track: 5,
      });
      ctx.restore();
    }

    // caption 5 — no stop button
    const p5 = A(t, c4, 0.55, ease.back);
    if (p5 > 0.01) {
      const bw = 460;
      const bh = 168;
      const bx = (W - bw) / 2;
      const by = 1090;
      const sq = 1 + (1 - p5) * 0.06;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p5);
      ctx.translate(bx + bw / 2, by + bh / 2);
      ctx.scale(sq, sq);
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 18;
      fillRR(ctx, -bw / 2, -bh / 2, bw, bh, 26, 'rgba(244,241,232,0.055)');
      ctx.shadowBlur = 0;
      strokeRR(ctx, -bw / 2, -bh / 2, bw, bh, 26, 'rgba(244,241,232,0.28)', 2.4);
      txt(ctx, 'STOP', 0, 24, { size: 78, font: F.head, color: 'rgba(244,241,232,0.86)', align: 'center', track: 10 });
      ctx.restore();

      const pc = A(t, c4 + 0.35, 0.5, ease.expo);
      if (pc > 0.01) {
        crossMark(ctx, W / 2, by + bh / 2, 120 * pc, K.ember, pc, 14);
        micro(ctx, 'TIDAK ADA TOMBOLNYA', W / 2, 1355, {
          size: 30, color: K.ember, align: 'center', track: 8, a: pc,
        });
        micro(ctx, 'NO STOP', W / 2, 1420, {
          size: 19, color: 'rgba(244,241,232,0.30)', align: 'center', track: 10, a: pc,
        });
      }
    }
  },
};

