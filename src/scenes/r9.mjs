import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, say, micro, number, txt, hexA, fillRR, TAU, clamp, lerp, rng, life, person,
  sightRays,
} from './_langit.mjs';

// 09 — LIHAT ATAS
// Out of the argument and back to the viewer: the light on the retina left its
// star before there were people, and some of those stars are already gone. The
// last ask is a place, not a like.

const B = 90;

export default {
  draw(ctx, t, scene) {
    sky(ctx, { key: 'r9', band: 0.8 });
    life(ctx, t, { a: 1, meteor: 1.4 });
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const wRibuan = cueWord(scene, 1, 'ribuan');

    const px = W * 0.62;
    const py = 1500;
    person(ctx, px, py, 215, { a: A(t, 0, 0.7, ease.out) });

    // caption 1 — look up
    const p1 = A(t, c[0], 0.6, ease.out);
    const out1 = 1 - A(t, c[1], 0.45, ease.out);
    if (p1 > 0.01 && out1 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p1, out1);
      micro(ctx, 'MALAM INI', 104, 300, { size: 27, color: L.ice, track: 10 });
      say(ctx, ['LIHAT', 'KE ATAS.'], 104, 370, { t, size: 96, at: c[0] + 0.1, stagger: 0.09 });
      ctx.restore();
    }

    // caption 2 — the light has been travelling for thousands of years
    const p2 = A(t, c[1], 0.6, ease.out);
    const out2 = 1 - A(t, c[2], 0.45, ease.out);
    if (p2 > 0.01 && out2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p2, out2);
      const sx = 420;
      const sy = 400;
      const q = A(t, c[1] + 0.1, 1.6, ease.inOut);
      // the path of one photon, all the way down to the eye
      const ex = px - 2;
      const ey = py - 0.93 * 215;
      const mg = ctx.createLinearGradient(sx, sy, ex, ey);
      mg.addColorStop(0, hexA(L.gold, 0.55));
      mg.addColorStop(1, hexA(L.gold, 0.06));
      ctx.strokeStyle = mg;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(lerp(sx, ex, q), lerp(sy, ey, q));
      ctx.stroke();
      ctx.fillStyle = L.star;
      ctx.shadowColor = 'rgba(255,240,210,0.95)';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(sx, sy, 6.5 + 1.8 * Math.sin(t * 2.2), 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      micro(ctx, 'CAHAYA BERANGKAT', sx + 26, sy - 28, { size: 21, color: L.ice, track: 5 });
      micro(ctx, 'SAMPAI KE MATA', ex + 20, ey + 6, { size: 21, color: L.dim, track: 5 });
      number(ctx, 'RIBUAN', 104, 700, { size: 92, color: L.star, a: A(t, wRibuan, 0.5) });
      micro(ctx, 'TAHUN LALU', 108, 758, { size: 27, color: L.warm, track: 9, a: A(t, wRibuan + 0.3, 0.5) });
      ctx.restore();
    }

    // caption 3 — some of them are already gone
    const p3 = A(t, c[2], 0.6, ease.out);
    const out3 = 1 - A(t, c[3], 0.45, ease.out);
    if (p3 > 0.01 && out3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p3, out3);
      const q1 = A(t, c[2] + 0.1, 0.7);
      const q2 = A(t, c[2] + 1.1, 0.7);
      [[1030, 360], [1210, 640]].forEach(([x, y], i) => {
        const q = i === 0 ? q1 : q2;
        ctx.fillStyle = hexA(L.star, 0.95 * q);
        ctx.beginPath();
        ctx.arc(x, y, 7 * (1 - 0.5 * q), 0, TAU);
        ctx.fill();
        if (q > 0.35) {
          const k = Math.min(1, (q - 0.35) / 0.65);
          ctx.strokeStyle = hexA(L.crimson, 0.8 * k);
          ctx.lineWidth = 2.4;
          const s = 14;
          ctx.beginPath();
          ctx.moveTo(x - s, y - s);
          ctx.lineTo(x + s, y + s);
          ctx.moveTo(x + s, y - s);
          ctx.lineTo(x - s, y + s);
          ctx.stroke();
        }
      });
      micro(ctx, 'SUDAH TIDAK ADA', 1210, 712, { size: 21, color: L.crimson, align: 'right', track: 5 });
      ctx.restore();
    }

    // caption 4 — the ask
    const p4 = A(t, c[3], 0.8, ease.expo);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4;
      fillRR(ctx, 88, 250, 1264, 380, 18, 'rgba(3,5,13,0.88)');
      ctx.strokeStyle = hexA(L.gold, 0.34);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(88, 250, 1264, 380, 18);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = p4;
      micro(ctx, 'TULIS DI KOMENTAR', 118, 306, { size: 24, color: L.warm, track: 9 });
      say(ctx, ['LANGIT DARI', 'KOTA MANA?'], 114, 402, { t, size: 92, at: c[3] + 0.1, stagger: 0.08 });
      ctx.restore();

      const q = A(t, c[3] + 1.5, 0.8, ease.out);
      if (q > 0.01) {
        ctx.save();
        ctx.globalAlpha = q * 0.95;
        micro(ctx, 'NAYSI · LANGIT', 720, 1700, { size: 26, color: hexA(L.gold, 0.9), align: 'center', track: 13 });
        ctx.restore();
      }
    }
  },
};
