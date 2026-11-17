import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, say, micro, number, txt, hexA, TAU, clamp, lerp, rng, wash,
} from './_langit.mjs';

// 05 — BATAS
// The observable universe is a bubble in a sky with no stars outside it: what we
// see is everything whose light has had time to arrive. Outside, the dark is not
// empty — it is a queue.

const B = 90;

export default {
  draw(ctx, t, scene) {
    // no plate stars: this scene places every star it wants, inside the edge
    sky(ctx, { key: 'r5', band: 0.45, stars: false, hills: false });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wSembilan = cueWord(scene, 1, 'sembilan');
    const cx = 720;
    const cy = 860;
    const R = 560;

    const grow = A(t, c[1] + 0.05, 2.0, ease.out);
    const rr = Math.max(2, R * grow);

    // the dark outside is a queue, not a void: veil it so the eye reads an edge
    if (grow > 0.05) {
      ctx.save();
      const veil = ctx.createRadialGradient(cx, cy, Math.max(2, rr), cx, cy, rr + 520);
      veil.addColorStop(0, 'rgba(3,5,13,0.00)');
      veil.addColorStop(0.14, 'rgba(3,5,13,0.62)');
      veil.addColorStop(1, 'rgba(2,3,9,0.90)');
      ctx.fillStyle = veil;
      ctx.fillRect(-B, -B, W + 2 * B, H + 2 * B);
      ctx.restore();
    }

    // inside: the sky we actually have
    if (grow > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, TAU);
      ctx.clip();
      const r = rng(55);
      for (let i = 0; i < 340; i++) {
        const x = cx - R + r() * R * 2;
        const y = cy - R + r() * R * 2;
        ctx.fillStyle = `rgba(255,246,227,${0.20 + r() * 0.66})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.9 + r() * 2.2, 0, TAU);
        ctx.fill();
      }
      const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, R);
      g.addColorStop(0, 'rgba(143,216,255,0.14)');
      g.addColorStop(0.7, 'rgba(120,150,255,0.06)');
      g.addColorStop(1, 'rgba(143,216,255,0.02)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      // the edge itself
      ctx.save();
      ctx.strokeStyle = hexA(L.ice, 0.55 + 0.12 * Math.sin(t * 1.4));
      ctx.lineWidth = 2.4;
      ctx.shadowColor = hexA(L.ice, 0.75);
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // outside the bubble: structure that exists and has not reached us
    if (grow > 0.2) {
      const rg = rng(909);
      ctx.save();
      ctx.globalAlpha = 0.62 * A(t, c[3] + 0.1, 1.2);
      for (let i = 0; i < 46; i++) {
        const ang = rg() * TAU;
        const d = R + 40 + rg() * 700;
        const x = cx + Math.cos(ang) * d;
        const y = cy + Math.sin(ang) * d * 0.86;
        if (y > 1420 || y < 60 || x < -40 || x > W + 40) continue;
        ctx.fillStyle = hexA(L.star, 0.12 + rg() * 0.16);
        ctx.beginPath();
        ctx.ellipse(x, y, 10 + rg() * 20, 4 + rg() * 8, rg() * TAU, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // caption 1 — a second reason
    say(ctx, ['ALASAN', 'KEDUA.'], 104, 320, {
      t, size: 104, at: c[0], stagger: 0.1, a: 1 - A(t, c[1], 0.45, ease.out),
    });

    // caption 2 — ninety-three billion light years across
    const p2 = A(t, wSembilan - 0.2, 0.6, ease.expo);
    const out2 = 1 - A(t, c[2], 0.45, ease.out);
    if (p2 > 0.01 && out2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p2, out2);
      micro(ctx, 'DIAMETER ALAM SEMESTA TERAMATI', 106, 1220, { size: 22, color: L.ice, track: 5 });
      number(ctx, '93', 104, 1380, { size: 168, color: L.star });
      micro(ctx, 'MILIAR TAHUN CAHAYA', 108, 1430, { size: 28, color: L.warm, track: 6 });
      // the diameter, drawn across the bubble
      const q = A(t, c[1] + 1.4, 1.1, ease.inOut);
      ctx.strokeStyle = hexA(L.gold, 0.45);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - rr, cy);
      ctx.lineTo(cx - rr + 2 * rr * q, cy);
      ctx.stroke();
      ctx.restore();
    }

    // caption 3 — outside, the light has not arrived
    const p3 = A(t, c[2], 0.6, ease.out);
    const out3 = 1 - A(t, c[3], 0.45, ease.out);
    if (p3 > 0.01 && out3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p3, out3);
      for (let i = 0; i < 10; i++) {
        const ang = -2.7 + i * 0.60;
        const q = clamp(A(t, c[2] + 0.1 + i * 0.08, 1.2, ease.out));
        const d = lerp(R + 640, R + 26, q);
        const x = cx + Math.cos(ang) * d;
        const y = cy + Math.sin(ang) * d;
        ctx.strokeStyle = hexA(L.crimson, 0.30);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * (d + 110), cy + Math.sin(ang) * (d + 110));
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = hexA(L.crimson, 0.9 * (1 - q * 0.7));
        ctx.beginPath();
        ctx.arc(x, y, 4.2, 0, TAU);
        ctx.fill();
      }
      micro(ctx, 'BELUM TIBA', 720, 1500, { size: 24, color: L.crimson, align: 'center', track: 7 });
      ctx.restore();
    }

    // caption 4 — the dark is not empty
    const p4 = A(t, c[3], 0.7, ease.out);
    const out4 = 1 - A(t, c[4], 0.45, ease.out);
    if (p4 > 0.01 && out4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p4, out4);
      wash(ctx, 280, 560, 0.88);
      say(ctx, ['BUKAN', 'KOSONG.'], 104, 320, { t, size: 96, at: c[3] + 0.05, stagger: 0.08 });
      ctx.restore();
    }

    // caption 5 — only late
    const p5 = A(t, c[4], 0.6, ease.out);
    if (p5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p5;
      wash(ctx, 280, 580, 0.90);
      say(ctx, ['HANYA', 'BELUM SAMPAI.'], 104, 320, { t, size: 92, at: c[4], stagger: 0.08 });
      ctx.restore();
    }
  },
};
