import { W, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, stage, headProfile, waveform, micro, number, hudFrame, hairline,
} from './_sinyal.mjs';

// 03 — TANPA SUARA
// A head in profile, lit from the inside at the auditory cortex. Next to it: the
// input line is flat — nothing is arriving — while the inner trace runs.
// Then a loop is drawn around the head and never stops.

export default {
  draw(ctx, t, scene) {
    stage(ctx, { beamX: 300, beamY: -260, key: 'r3' });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));

    const pin = A(t, c[0], 1.2, ease.expo);
    const glow = 0.5 + 0.5 * A(t, c[1] - 0.3, 1.2, ease.out);
    headProfile(ctx, lerp(360, 430, pin), 900, 720, { a: pin, t, glowP: glow });

    // the ear point
    const ex = 430 + 0.46 * 720;
    const ey = 900 + 0.06 * 720;

    // panel: what enters
    const pa = A(t, c[0] + 0.7, 0.7, ease.out);
    if (pa > 0.01) {
      ctx.save();
      ctx.globalAlpha = pa;
      hudFrame(ctx, 830, 470, 510, 250, { label: 'MASUK KE TELINGA' });
      ctx.fillStyle = 'rgba(244,241,232,0.35)';
      ctx.fillRect(850, 596, 470, 2);
      micro(ctx, '0,0', 850, 560, { size: 56, color: 'rgba(244,241,232,0.55)', track: 2 });
      micro(ctx, 'TIDAK ADA BUNYI', 850, 660, { size: 20, color: K.ember });
      ctx.restore();
    }

    // panel: what runs
    const pb = A(t, c[1] + 0.5, 0.8, ease.out);
    if (pb > 0.01) {
      ctx.save();
      ctx.globalAlpha = pb;
      hudFrame(ctx, 830, 780, 510, 310, { label: 'SINYAL DI DALAM' });
      waveform(ctx, 852, 834, 466, 206, t, { amp: 0.85, color: K.lime, bars: 58, glow: 0.7, line: 3 });
      micro(ctx, 'KORTEKS PENDENGARAN MENYALA', 852, 1068, { size: 19, color: K.lime, track: 3 });
      ctx.restore();
    }

    // a leader line from the panel back to the lit patch of cortex
    const pl = A(t, c[1] + 0.9, 0.8, ease.expo);
    if (pl > 0.01) {
      ctx.save();
      ctx.globalAlpha = pl * 0.55;
      ctx.strokeStyle = hexA(K.lime, 0.6);
      ctx.lineWidth = 1.6;
      ctx.setLineDash([7, 9]);
      ctx.beginPath();
      ctx.moveTo(828, 930);
      ctx.bezierCurveTo(760, 900, 700, 850, 600, 830);
      ctx.stroke();
      ctx.restore();
    }

    // caption 1 — it is processed like real sound
    const out1 = 1 - A(t, c[1], 0.35, ease.out);
    if (out1 > 0.01) {
      micro(ctx, 'DI KEPALA', 860, 400, { size: 22, color: K.ember, track: 8, a: out1 * A(t, c[0] + 0.2, 0.6) });
    }

    // caption 3-4 — the loop
    const p3 = A(t, c[2], 0.8, ease.expo);
    if (p3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p3;
      const lx = 470;
      const ly = 900;
      const rx = 250;
      const ry = 280;
      // the ellipse of the loop, drawn from the ear
      ctx.strokeStyle = 'rgba(244,241,232,0.16)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(lx + 90, ly, rx, ry, 0, 0, TAU);
      ctx.stroke();
      const prog = Math.min(1, 0.15 + 0.85 * A(t, c[2] + 0.2, 2.2, ease.inOut));
      ctx.strokeStyle = K.ice;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.shadowColor = hexA(K.ice, 0.7);
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.ellipse(lx + 90, ly, rx, ry, 0, -Math.PI / 2, -Math.PI / 2 + TAU * prog);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // the playhead
      const ang = -Math.PI / 2 + t * 2.1;
      const px = lx + 90 + Math.cos(ang) * rx;
      const py = ly + Math.sin(ang) * ry;
      ctx.fillStyle = K.ink;
      ctx.shadowColor = hexA(K.ice, 0.9);
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      // labels on the loop
      micro(ctx, 'DENGAR', lx + 90, ly - ry - 26, { size: 20, color: K.ice, align: 'center', track: 8 });
      micro(ctx, 'ULANG', lx + 90, ly + ry + 52, { size: 20, color: K.ice, align: 'center', track: 8 });
      ctx.restore();

      const p4 = A(t, c[3], 0.7, ease.out);
      if (p4 > 0.01) {
        ctx.save();
        ctx.globalAlpha = p4;
        micro(ctx, 'PHONOLOGICAL LOOP', 846, 1250, { size: 26, color: K.ink, track: 6 });
        micro(ctx, 'RUANG KERJA MEMORI UNTUK BUNYI', 846, 1296, { size: 19, color: 'rgba(244,241,232,0.45)', track: 4 });
        hairline(ctx, 846, 1330, 420 * A(t, c[3] + 0.1, 0.8, ease.expo), { color: hexA(K.ice, 0.55), weight: 3 });
        micro(ctx, 'SELAMA BISA DIPUTAR, TERUS DIPUTAR', 846, 1390, { size: 20, color: K.ice, track: 3, a: p4 * 0.95 });
        ctx.restore();
      }
    }
  },
};
