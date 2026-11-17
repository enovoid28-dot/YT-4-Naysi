import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, say, micro, number, txt, hexA, fillRR, TAU, clamp, lerp, rng, wash,
} from './_langit.mjs';

// 04 — USIA
// A sphere of arrived light opening out of one point. Everything inside it is
// the universe we can see; outside it, the light has not had the time. The veil
// outside the edge does the arguing: the same sky, minus the part that is late.

const B = 90;

export default {
  draw(ctx, t, scene) {
    sky(ctx, { key: 'r4', band: 0.55 });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wUsia = cueWord(scene, 1, 'usianya');
    const px = 720;
    const py = 1180;
    const R = 660;

    // caption 1 — the first reason
    say(ctx, ['ALASAN', 'PERTAMA.'], 104, 320, {
      t, size: 104, at: c[0], stagger: 0.1, a: 1 - A(t, c[1], 0.45, ease.out),
    });

    const grow = A(t, c[1] + 0.35, 5.0, ease.out);
    const rr = Math.max(2, R * grow);

    // everything outside the sphere is late: veil it down
    if (grow > 0.01) {
      ctx.save();
      const veil = ctx.createRadialGradient(px, py, rr, px, py, rr + 520);
      veil.addColorStop(0, 'rgba(3,5,13,0.00)');
      veil.addColorStop(0.10, 'rgba(3,5,13,0.90)');
      veil.addColorStop(1, 'rgba(2,3,9,0.97)');
      ctx.fillStyle = veil;
      ctx.fillRect(-B, -B, W + 2 * B, H + 2 * B);
      ctx.restore();
    }

    // inside the sphere: the stars that have already reached us
    if (grow > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, TAU);
      ctx.clip();
      const r = rng(31);
      for (let i = 0; i < 300; i++) {
        const x = -B + r() * (W + 2 * B);
        const y = -B + r() * (H + 2 * B);
        ctx.fillStyle = `rgba(255,248,236,${0.22 + r() * 0.68})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + r() * 2.4, 0, TAU);
        ctx.fill();
      }
      // the light itself, pooling toward the point it left from
      const g = ctx.createRadialGradient(px, py, 2, px, py, rr);
      g.addColorStop(0, 'rgba(255,233,184,0.20)');
      g.addColorStop(0.55, 'rgba(255,201,135,0.07)');
      g.addColorStop(1, 'rgba(255,201,135,0.00)');
      ctx.fillStyle = g;
      ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2);
      ctx.restore();

      // the edge
      ctx.save();
      ctx.strokeStyle = hexA(L.gold, 0.72);
      ctx.lineWidth = 3;
      ctx.shadowColor = hexA(L.gold, 0.85);
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, TAU);
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (grow > 0.9) {
        ctx.fillStyle = hexA(L.gold, 0.5 * A(t, c[1] + 4.4, 0.8));
        for (let i = 0; i < 26; i++) {
          const ang = (i / 26) * TAU + t * 0.05;
          ctx.beginPath();
          ctx.arc(px + Math.cos(ang) * rr, py + Math.sin(ang) * rr, 1.6, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // caption 2 — the age
    const p2 = A(t, wUsia - 0.15, 0.6, ease.expo);
    const out2 = 1 - A(t, c[3], 0.5, ease.out);
    if (p2 > 0.01 && out2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p2, out2);
      number(ctx, '13,8', 720, 300, { size: 148, color: L.star, align: 'center' });
      micro(ctx, 'MILIAR TAHUN', 720, 372, { size: 26, color: L.warm, align: 'center', track: 11 });
      ctx.restore();
    }

    // caption 3 — light needs time: the front keeps opening
    const p3 = A(t, c[2], 0.6, ease.out);
    const out3 = 1 - A(t, c[3], 0.5, ease.out);
    if (p3 > 0.01 && out3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p3, out3);
      micro(ctx, 'CAHAYA BUTUH WAKTU', 104, 700, { size: 26, color: L.ice, track: 9 });
      const q = (t * 0.55) % 1;
      ctx.strokeStyle = hexA(L.gold, 0.55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, rr * (0.25 + q * 0.72), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // caption 4 — a star beyond the edge, whose light stops there
    const p4 = A(t, c[3], 0.7, ease.out);
    const out4 = 1 - A(t, c[4], 0.5, ease.out);
    if (p4 > 0.01 && out4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(p4, out4);
      const sx = 1080;
      const sy = 300;
      const edgeX = px + Math.sqrt(Math.max(0, rr * rr - (sy - py) * (sy - py)));
      const q = A(t, c[3] + 0.2, 1.2, ease.inOut);
      // light leaving the distant star and stopping at the edge
      ctx.strokeStyle = hexA(L.star, 0.30);
      ctx.setLineDash([6, 12]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(lerp(sx, edgeX, q), lerp(sy, sy, q));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = hexA(L.star, 0.92);
      ctx.shadowColor = 'rgba(255,246,227,0.8)';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (q > 0.85) {
        ctx.strokeStyle = hexA(L.crimson, 0.85);
        ctx.lineWidth = 3;
        const s = 11;
        ctx.beginPath();
        ctx.moveTo(edgeX - s, sy - s);
        ctx.lineTo(edgeX + s, sy + s);
        ctx.moveTo(edgeX + s, sy - s);
        ctx.lineTo(edgeX - s, sy + s);
        ctx.stroke();
      }
      micro(ctx, 'BELUM SAMPAI', 1052, 258, { size: 21, color: L.crimson, align: 'right', track: 5 });
      ctx.restore();
    }

    // caption 5 — the past that has not finished
    const p5 = A(t, c[4], 0.8, ease.out);
    if (p5 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p5 * 0.95;
      wash(ctx, 280, 700, 0.90);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = p5;
      micro(ctx, 'KITA MELIHAT', 108, 296, { size: 24, color: L.ice, track: 8 });
      say(ctx, ['MASA LALU', 'YANG BELUM', 'SELESAI.'], 104, 396, { t, size: 92, at: c[4] + 0.05, stagger: 0.08, lineH: 1.0 });
      ctx.restore();
    }
  },
};
