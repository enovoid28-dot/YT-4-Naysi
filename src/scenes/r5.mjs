import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, cueWord, A, stage, waveform, headline, micro, number, clockArc, hudFrame, hairline, crossMark,
} from './_sinyal.mjs';

// 05 — SETENGAH
// The song is cut at the halfway mark. The gap is what stays open: the second
// half is never played, and the 24-hour clock starts from there.

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 700, beamY: -300, key: 'r5' });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));

    // caption 1 — the cruellest trigger
    const out1 = 1 - A(t, c[1], 0.4, ease.out);
    headline(ctx, ['PEMICU', 'PALING KEJAM.'], 104, 420, {
      t,
      size: 132, at: c[0], stagger: 0.1, accents: [1, 2], a: out1,
    });

    // the waveform, and its cut
    const p2 = A(t, c[1] - 0.1, 0.8, ease.out);
    if (p2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p2;
      const x = 104;
      const w = 1232;
      const h = 380;
      const y = 660;
      const cut = 0.5;
      const px = x + w * cut;
      // the played half
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y - 40, w * cut, h + 80);
      ctx.clip();
      waveform(ctx, x, y, w, h, t, { amp: 1, color: K.lime, bars: 110, glow: 0.6, line: 3.4 });
      ctx.restore();
      // the unheard half: a ghost of the same trace
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, y - 40, w * (1 - cut), h + 80);
      ctx.clip();
      waveform(ctx, x, y, w, h, t * 0.0, { amp: 1, color: 'rgba(244,241,232,0.16)', bars: 110, glow: 0, line: 2, fill: false });
      ctx.restore();
      // the cut
      const pc = A(t, c[1] + 0.55, 0.5, ease.expo);
      ctx.strokeStyle = K.ember;
      ctx.lineWidth = 6;
      ctx.shadowColor = hexA(K.ember, 0.8);
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.moveTo(px, y - 40);
      ctx.lineTo(px, y - 40 + (h + 80) * pc);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // the gap widens away from the cut
      const gap = 26 * pc;
      ctx.fillStyle = 'rgba(10,8,17,0.9)';
      ctx.fillRect(px - gap / 2, y - 40, gap, h + 80);
      // playhead frozen at the cut
      ctx.fillStyle = K.ink;
      ctx.beginPath();
      ctx.arc(px, y - 6, 10, 0, TAU);
      ctx.fill();
      micro(ctx, '00:00', x, y + h + 78, { size: 20, color: 'rgba(244,241,232,0.45)' });
      micro(ctx, 'DIPUTAR', x + 4, y - 56, { size: 20, color: K.lime, track: 6 });
      micro(ctx, 'TIDAK PERNAH SAMPAI SINI', px + 20, y - 56, { size: 20, color: 'rgba(244,241,232,0.40)', track: 4 });
      micro(ctx, 'BERHENTI', px - 6, y + h + 78, { size: 20, color: K.ember, align: 'right', track: 6 });
      ctx.restore();
    }

    // caption 3 — 24 hours
    const w24 = cueWord(scene, 2, 'dua');
    const p3 = A(t, w24 - 0.15, 0.7, ease.expo);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3;
      clockArc(ctx, 1110, 1240, 210, { p: A(t, w24, 1.4, ease.out), color: K.ember, lw: 8 });
      number(ctx, '24', 1110, 1268, { size: 132, color: K.ink, align: 'center' });
      micro(ctx, 'JAM', 1110, 1320, { size: 24, color: K.ember, align: 'center', track: 10 });
      micro(ctx, 'PALING SERING KEMBALI', 104, 1180, { size: 24, color: K.ink, track: 5 });
      hairline(ctx, 104, 1210, 520 * A(t, w24, 0.8, ease.expo), { color: hexA(K.ember, 0.6), weight: 3 });
      ctx.restore();
    }

    // caption 4 — Zeigarnik
    const p4 = A(t, c[3], 0.7, ease.out);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4 * 0.96;
      micro(ctx, 'EFEK', 104, 1310, { size: 22, color: K.ember, track: 8 });
      txt(ctx, 'ZEIGARNIK', 104, 1412, { size: 96, font: F.head, color: K.ink, track: 2 });
      micro(ctx, 'PIKIRAN YANG BELUM SELESAI TIDAK MAU DITUTUP', 108, 1470, {
        size: 20, color: K.dim, track: 3,
      });
      ctx.restore();
    }
  },
};
