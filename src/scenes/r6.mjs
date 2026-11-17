import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, cueWord, A, stage, clockArc, headline, micro, number, hairline, hudFrame,
} from './_sinyal.mjs';

// 06 — DUA PULUH TUJUH
// A clock counts up to 27 minutes and stops. Under it, the fragment it was
// playing: fifteen to thirty seconds, the length of the loop itself.

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 720, beamY: -340, key: 'r6' });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));

    // caption 1 — usually it does not last
    headline(ctx, ['BIASANYA', 'TIDAK LAMA.'], 104, 400, {
      t,
      size: 112, at: c[0], stagger: 0.09, a: 1 - A(t, c[1], 0.4, ease.out),
    });

    // the clock, counting
    const pin = A(t, c[1] - 0.2, 0.9, ease.expo);
    if (pin > 0.01) {
      ctx.save();
      ctx.globalAlpha = pin;
      const cx = 720;
      const cy = 760;
      const r = 300;
      const w27 = cueWord(scene, 1, 'dua');
      const run = A(t, w27, 2.4, ease.out);
      clockArc(ctx, cx, cy, r, { p: run * 0.86, color: K.ice, lw: 9, ticks: 12 });
      // 27:00, ticked up with the arc
      const mins = Math.floor(run * 27);
      const secs = Math.floor((run * 27 * 60) % 60);
      const a1 = A(t, w27, 0.5);
      number(ctx, `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`, cx, cy + 40, {
        size: 132, color: K.ink, align: 'center', track: -0.03, a: a1,
      });
      micro(ctx, 'RATA-RATA', cx, cy - 60, { size: 22, color: K.ice, align: 'center', track: 10, a: a1 });
      micro(ctx, 'LALU HILANG', cx, cy + 110, { size: 20, color: K.dim, align: 'center', track: 8, a: A(t, cueWord(scene, 1, 'hilang') - 0.1, 0.6) });
      ctx.restore();
    }

    // caption 3 — the fragment, as a bracket
    const wFrag = cueWord(scene, 2, 'lima');
    const p3 = A(t, wFrag - 0.2, 0.7, ease.expo);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3;
      const x = 104;
      const y = 1180;
      const w = 1232;
      // the 27-minute span in miniature
      const full = 27 * 60;
      ctx.fillStyle = 'rgba(244,241,232,0.10)';
      ctx.fillRect(x, y, w, 10);
      // and inside it, the 15-30 s that actually loop
      const fx = x + 40;
      const fw = Math.max(26, (22.5 / full) * w * 14);
      ctx.fillStyle = K.lime;
      ctx.shadowColor = hexA(K.lime, 0.8);
      ctx.shadowBlur = 26;
      ctx.fillRect(x, y, w * A(t, wFrag, 1.0, ease.expo), 10);
      ctx.shadowBlur = 0;
      // bracket under the segment
      const bx = x + w * 0.5 - fw / 2;
      ctx.strokeStyle = K.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, y + 46);
      ctx.lineTo(bx, y + 24);
      ctx.lineTo(bx + fw, y + 24);
      ctx.lineTo(bx + fw, y + 46);
      ctx.stroke();
      micro(ctx, '15–30 DETIK', bx + fw / 2, y + 90, {
        size: 24, color: K.ink, align: 'center', track: 6,
      });
      micro(ctx, 'YANG DIPUTAR ULANG', bx + fw / 2, y + 130, {
        size: 19, color: K.lime, align: 'center', track: 4,
      });
      micro(ctx, '27 MENIT', x, y - 26, { size: 19, color: 'rgba(244,241,232,0.45)', track: 4 });
      ctx.restore();
    }

    // caption 4 — it rarely survives the night
    const p4 = A(t, c[3], 0.6, ease.out);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4 * 0.9;
      micro(ctx, 'BESOK', 1112, 1180 - 26, { size: 19, color: 'rgba(244,241,232,0.30)', track: 4 });
      ctx.strokeStyle = hexA(K.ember, 0.55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1108, 1140);
      ctx.lineTo(1192, 1192);
      ctx.stroke();
      ctx.restore();
    }
  },
};
