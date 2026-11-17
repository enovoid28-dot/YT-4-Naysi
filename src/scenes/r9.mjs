import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, stage, loopRing, headline, micro, number, hairline, hudFrame,
} from './_sinyal.mjs';

// 09 — LINGKARAN
// The ring finally closes, and the closing is not a warning: it is the system
// doing its job. Last beat: the question back to the viewer.

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 720, beamY: -300, key: 'r9' });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const close = A(t, c[1] + 0.2, 2.2, ease.inOut);

    // caption 1 — not a fault
    headline(ctx, ['BUKAN', 'GANGGUAN.'], 104, 420, {
      t,
      size: 128, at: c[0], stagger: 0.1, a: 1 - A(t, c[1], 0.45, ease.out),
    });

    // the ring, closing
    const p1 = A(t, c[1] - 0.2, 0.8, ease.out);
    if (p1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p1;
      loopRing(ctx, 720, 900, 300, t, {
        p: 0.25 + 0.75 * close,
        gap: lerp(0.26, 0.005, close),
        color: close > 0.9 ? K.lime : K.ice,
        lw: 10,
        speed: 0.55 * (1 - close * 0.8),
      });
      // inside the ring: the sentence, then the loop count
      micro(ctx, 'SISTEM MENUTUP', 720, 850, { size: 22, color: K.ice, align: 'center', track: 9, a: p1 * (1 - close) });
      micro(ctx, 'SELESAI', 720, 830, { size: 26, color: K.lime, align: 'center', track: 12, a: close });
      micro(ctx, 'LINGKARAN', 720, 872, { size: 20, color: 'rgba(244,241,232,0.45)', align: 'center', track: 8, a: close });
      ctx.restore();
    }

    // caption 2-3 — what it is doing
    const p2 = A(t, c[1] + 0.5, 0.7, ease.out);
    if (p2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p2 * (1 - A(t, c[3], 0.4));
      micro(ctx, 'OTAK MENCOBA MENUTUP', 104, 1250, { size: 20, color: 'rgba(244,241,232,0.45)', track: 5 });
      headline(ctx, ['YANG BELUM', 'SELESAI.'], 104, 1360, {
      t,
        size: 96, at: c[1] + 0.6, stagger: 0.09,
      });
      ctx.restore();
    }

    // caption 3 — it will keep playing
    const p3 = A(t, c[2], 0.7, ease.out);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3 * (1 - A(t, c[3], 0.45));
      for (let i = 0; i < 3; i++) {
        const ph = ((t * 0.42 + i * 0.33) % 1);
        ctx.strokeStyle = hexA(K.lime, (1 - ph) * 0.35);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(720, 900, 300 + ph * 130, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // caption 4 — the question
    const p4 = A(t, c[3] - 0.1, 0.8, ease.expo);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4;
      ctx.fillStyle = 'rgba(8,7,14,0.78)';
      fillRR(ctx, 88, 384, 1264, 732, 18, 'rgba(8,7,14,0.78)');
      hudFrame(ctx, 104, 400, 1232, 700, { a: 0.7, label: 'PERTANYAAN' });
      micro(ctx, 'TULIS DI KOMENTAR', 148, 520, { size: 24, color: K.lime, track: 9 });
      headline(ctx, ['LAGU APA', 'YANG NYANGKUT', 'DI KEPALAMU'], 148, 700, {
      t,
        size: 112, at: c[3], stagger: 0.1, accents: [8],
      });
      const pw = 380 * A(t, c[3] + 0.9, 0.7, ease.expo);
      ctx.fillStyle = hexA(K.lime, 0.12);
      fillRR(ctx, 148, 990, pw, 88, 10, hexA(K.lime, 0.12));
      strokeRR(ctx, 148, 990, pw, 88, 10, hexA(K.lime, 0.5), 2);
      txt(ctx, 'SEKARANG', 172, 1048, { size: 44, font: F.head, color: K.lime, track: 8 });
      micro(ctx, 'NAYSI · SINYAL', 148, 1180, { size: 20, color: 'rgba(244,241,232,0.4)', track: 8 });
      ctx.restore();
    }
  },
};
