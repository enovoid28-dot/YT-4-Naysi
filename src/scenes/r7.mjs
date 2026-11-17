import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import {
  K, ease, cue, A, stage, gumPack, headline, micro, number, hairline, hudFrame,
} from './_sinyal.mjs';

// 07 — PERMEN KARET
// Three minutes on a stopwatch. Every intrusion is a tick. Nine of them land.
// Then the gum, and the ticks that never arrive: the mouth takes the loop's job.

const NINE = [0.4, 3.1, 8.6, 12.2, 19.4, 26.0, 33.8, 41.2, 48.5];

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 380, beamY: -220, key: 'r7' });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));

    // caption 1 — it is not willpower
    headline(ctx, ['BUKAN', 'KEMAUAN.'], 104, 420, {
      t,
      size: 128, at: c[0], stagger: 0.1, a: 1 - A(t, c[1], 0.4, ease.out),
    });

    // the three minutes, and the nine intrusions
    const p2 = A(t, c[0] + 0.45, 0.7, ease.out);
    if (p2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p2;
      const x = 104;
      const y = 640;
      const w = 1232;
      // the track
      ctx.fillStyle = 'rgba(244,241,232,0.10)';
      ctx.fillRect(x, y, w, 6);
      micro(ctx, '0:00', x, y + 52, { size: 19, color: 'rgba(244,241,232,0.45)' });
      micro(ctx, '3:00', x + w, y + 52, { size: 19, color: 'rgba(244,241,232,0.45)', align: 'right' });
      micro(ctx, 'DILARANG MEMIKIRKAN LAGUNYA', x, y - 34, { size: 20, color: K.ice, track: 5 });
      // the sweep
      const sweep = clamp((t - (c[1] - 0.1)) / 9.0, 0, 1);
      const sx = x + w * sweep;
      const grad = ctx.createLinearGradient(x, 0, sx, 0);
      grad.addColorStop(0, hexA(K.ice, 0.15));
      grad.addColorStop(1, hexA(K.ice, 0.7));
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, Math.max(0, sx - x), 6);
      ctx.fillStyle = K.ink;
      ctx.beginPath();
      ctx.arc(sx, y + 3, 8, 0, TAU);
      ctx.fill();
      // the intrusions
      NINE.forEach((f, i) => {
        const at = c[1] + 0.2 + f * 0.18;
        const q = A(t, at, 0.45, ease.back);
        if (q <= 0.01) return;
        const tx = x + w * (0.03 + f * 0.0195 * 1.0) + i * 2;
        ctx.globalAlpha = p2 * q;
        ctx.fillStyle = K.ember;
        ctx.fillRect(tx - 2, y - 78 * q, 4, 78 * q);
        txt(ctx, String(i + 1), tx, y - 96, {
          size: 22, font: F.mono, color: K.ember, align: 'center',
        });
      });
      ctx.restore();

      const p3 = A(t, c[2], 0.6, ease.expo);
      if (p3 > 0.01) {
        ctx.save();
        ctx.globalAlpha = p3;
        number(ctx, '9', 96, 1010, { size: 240, color: K.ember });
        micro(ctx, 'KALI MUNCUL', 116, 1064, { size: 24, color: K.ink, track: 6 });
        micro(ctx, 'TANPA DIPANGGIL', 116, 1108, { size: 19, color: 'rgba(244,241,232,0.42)', track: 4 });
        hairline(ctx, 100, 900, 420 * A(t, c[2] + 0.1, 0.7, ease.expo), { color: hexA(K.ember, 0.55), weight: 3 });
        ctx.restore();
      }
    }

    // caption 4 — the gum
    const p4 = A(t, c[3], 0.8, ease.expo);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4;
      const gx = 104;
      const gy = 1200;
      gumPack(ctx, gx, gy, 300, 190, { rot: -0.05 });
      micro(ctx, 'MENGUNYAH', gx + 360, gy + 60, { size: 24, color: K.lime, track: 8 });
      number(ctx, '−33%', gx + 360, gy + 200, { size: 140, color: K.lime });
      micro(ctx, 'SEPERTIGA LEBIH SEDIKIT', gx + 360, gy + 250, { size: 21, color: K.ink, track: 4 });
      // the intrusions the gum prevented, as hollow ticks
      for (let i = 0; i < 9; i++) {
        const q = A(t, c[3] + 0.3 + i * 0.06, 0.4);
        if (q <= 0.01) continue;
        const tx = 1040 + (i % 3) * 62;
        const ty = 1180 + Math.floor(i / 3) * 62;
        ctx.globalAlpha = p4 * q * 0.5;
        ctx.strokeStyle = K.lime;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, ty, 16, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // caption 5 — the mouth takes the job
    const p5 = A(t, c[4], 0.7, ease.out);
    if (p5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p5;
      micro(ctx, 'MULUT DIPAKAI', 104, 1420, { size: 26, color: K.ink, track: 6 });
      micro(ctx, 'MESIN LAGU KEHILANGAN TENAGA', 104, 1470, { size: 20, color: K.ice, track: 4 });
      ctx.restore();
    }
  },
};
