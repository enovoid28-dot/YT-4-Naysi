import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, stage, loopRing, headline, micro, number, crossMark, hairline,
} from './_sinyal.mjs';

// 08 — MELAWAN
// The ring gets tighter while the instruction is "don't". Then the sentence
// turns: the ring closes, the colour changes, and the advice reverses.

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 980, beamY: -240, key: 'r8' });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const turn = A(t, c[2], 0.9, ease.inOut);

    // the ring: shrinking while resisting, then closing
    const cx = 980;
    const cy = 760;
    const r = lerp(330, 250, A(t, c[1], 2.4, ease.inOut)) + turn * 40;
    loopRing(ctx, cx, cy, r, t, {
      p: clamp(0.18 + 0.22 * A(t, c[1], 2.0) + 0.6 * turn),
      color: turn > 0.5 ? K.lime : K.ember,
      a: A(t, c[0] + 0.1, 0.8, ease.out) * (1 - 0.72 * A(t, c[3], 0.6)),
      gap: lerp(0.34, 0.0, turn),
      lw: 9,
      speed: 0.5 + 0.7 * (1 - turn),
    });

    // caption 1 — trying harder makes it stronger
    headline(ctx, ['MELAWAN', 'MENGUATKAN.'], 104, 470, {
      t,
      size: 118, at: c[0], stagger: 0.1, a: 1 - A(t, c[1], 0.4, ease.out),
    });

    // caption 2 — the harder the prohibition, the more it returns
    const p2 = A(t, c[1], 0.5, ease.expo);
    const out2 = 1 - A(t, c[2], 0.4, ease.out);
    if (p2 > 0.01 && out2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p2, out2);
      txt(ctx, 'JANGAN', 104, 720, { size: 232, font: F.head, color: 'rgba(244,241,232,0.92)', track: -6 });
      const n = 3;
      for (let i = 0; i < n; i++) {
        const q = A(t, c[1] + 0.5 + i * 0.55, 0.4, ease.expo);
        if (q <= 0.01) continue;
        ctx.save();
        ctx.globalAlpha = Math.min(p2, out2) * (0.55 - i * 0.12);
        ctx.strokeStyle = K.ember;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(96, 720 - 190 * q + i * 6);
        ctx.lineTo(96 + 760 * q, 720 - 190 * q + i * 6);
        ctx.stroke();
        ctx.restore();
      }
      micro(ctx, 'SEMAKIN DILARANG, SEMAKIN SERING KEMBALI', 106, 800, {
        size: 21, color: K.ember, track: 4,
      });
      // intrusion marks flicker on each beat
      for (let i = 0; i < 5; i++) {
        const ph = ((t * 0.9 + i * 0.2) % 1);
        ctx.globalAlpha = Math.min(p2, out2) * (1 - ph) * 0.7;
        ctx.fillStyle = K.ember;
        ctx.beginPath();
        ctx.arc(140 + i * 150, 900, 5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // caption 3 — the reversal
    const p3 = A(t, c[2], 0.7, ease.expo);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3;
      headline(ctx, ['SELESAIKAN', 'LAGUNYA.'], 104, 700, {
      t,
        size: 132, at: c[2] + 0.1, stagger: 0.09, color: K.lime,
      });
      micro(ctx, 'SAMPAI HABIS, BUKAN SAMPAI TENGAH', 108, 860, {
        size: 21, color: 'rgba(244,241,232,0.55)', track: 4,
      });
      // a completion bar, filled to the end
      const bw = 700 * A(t, c[2] + 0.2, 1.1, ease.out);
      ctx.fillStyle = 'rgba(244,241,232,0.12)';
      ctx.fillRect(108, 920, 700, 8);
      ctx.fillStyle = K.lime;
      ctx.fillRect(108, 920, bw, 8);
      micro(ctx, '100%', 108 + 700, 960, { size: 20, color: K.lime, align: 'right', track: 4 });
      ctx.restore();
    }

    // caption 4 — or give the mouth another job
    const p4 = A(t, c[3], 0.7, ease.out);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4;
      micro(ctx, 'ATAU', 104, 1120, { size: 22, color: K.ice, track: 8 });
      headline(ctx, ['PINDAHKAN', 'MULUTMU.'], 104, 1250, {
      t,
        size: 104, at: c[3] + 0.1, stagger: 0.09, color: K.ink,
      });
      micro(ctx, 'KE PEKERJAAN LAIN YANG MEMAKAI KATA', 108, 1400, {
        size: 21, color: 'rgba(244,241,232,0.55)', track: 3,
      });
      ctx.restore();
    }
  },
};
