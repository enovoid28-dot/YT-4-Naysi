import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, bed, dust, clock, A, cue, ease, micro, number, txt, hexA, fillRR, TAU, clamp, lerp, rng,
} from './_malam.mjs';
import { person } from './_langit.mjs';

// 01 — JAM DUA
// One room, one night, one clock. A person sits up in bed with the duvet still
// over their legs, and the wall clock runs from two in the morning to six while
// they watch it. When the voice stops talking about hours and starts talking
// about debt, something starts rising out of the floor.

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't1', side: 'right' });
    dust(ctx, t, { a: 0.30, seed: 5, y0: 420, y1: 1600 });

    const c = [0, 1, 2, 3, 4, 5].map((i) => cue(scene, i));

    // ── the person, sitting up, back to the room
    const sit = A(t, -0.3, 1.1, ease.out);
    person(ctx, 1104, 2152, 690, { a: sit, rim: 1.0 });

    // the duvet comes up over the legs; drawn over the body so the person is
    // unmistakably *in* the bed and not standing in front of it
    bed(ctx, { y: 1898, pillow: false, a: A(t, -0.2, 1.0, ease.out) });

    // ── the debt as a tide: a red waterline that comes up out of the floor
    const tide = 0.70 * A(t, c[4] + 0.15, 2.6, ease.inOut) + 0.30 * A(t, c[5] + 0.2, 3.4, ease.inOut);
    if (tide > 0.01) {
      const level = lerp(H + 140, 1652, tide);
      const g = ctx.createLinearGradient(0, level - 260, 0, level + 220);
      g.addColorStop(0, 'rgba(255,90,70,0)');
      g.addColorStop(0.62, `rgba(255,86,66,${0.20 * tide})`);
      g.addColorStop(1, `rgba(255,70,54,${0.46 * tide})`);
      ctx.fillStyle = g;
      ctx.fillRect(-80, level - 260, W + 160, H - level + 300);
      // the line itself, breathing, so it reads as a level and not a band
      ctx.save();
      ctx.strokeStyle = `rgba(255,132,104,${0.55 * tide})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(255,90,70,0.7)';
      ctx.shadowBlur = 34;
      ctx.beginPath();
      for (let x = -80; x <= W + 80; x += 40) {
        const y = level + Math.sin(x * 0.006 + t * 0.9) * 9;
        if (x === -80) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // ── the clock: digits straight on the wall, amber, the only warm thing
    const digitA = A(t, c[0] + 0.05, 0.5, ease.out)
      * (1 - 0.62 * A(t, c[3] + 0.15, 1.0, ease.inOut))
      * (1 - A(t, c[4] + 0.9, 1.2, ease.inOut));
    let hh = 2;
    if (t > c[2] + 0.2) hh = Math.min(6, 2 + Math.floor((t - c[2] - 0.2) / 0.42));
    const alarm = hh >= 6 ? A(t, c[2] + 0.2 + 4 * 0.42, 0.6, ease.out) : 0;
    const flick = 0.93 + 0.07 * Math.sin(t * 37) * Math.sin(t * 11);
    if (digitA > 0.01) {
      const col = alarm > 0.5 ? M.red : M.amber;
      clock(ctx, 108, 1092, 250, `0${hh}:00`, { a: digitA, color: col, on: flick, halo: 1 });
      if (alarm > 0.02) {
        // the morning already waiting behind the night
        const g = ctx.createLinearGradient(0, 1200, 0, 1900);
        g.addColorStop(0, `rgba(255,120,90,${0.07 * alarm})`);
        g.addColorStop(1, 'rgba(255,120,90,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-80, 1200, W + 160, 760);
        micro(ctx, 'PAGI', 112, 1360, { size: 26, color: hexA(M.red, 0.85), track: 12, a: alarm });
      }
    }

    // ── caption 4: the hours, still being counted, one tick at a time
    const rulerA = A(t, c[3] + 0.10, 0.7, ease.out) * (1 - 0.35 * A(t, c[5] + 0.4, 1.6, ease.inOut));
    if (rulerA > 0.01) {
      const n = 22;
      const x0 = 112;
      const x1 = 1206;
      const y = 1412;
      const lit = Math.floor(A(t, c[3] + 0.2, 2.2, ease.inOut) * n);
      for (let i = 0; i < n; i++) {
        const p = A(t, c[3] + 0.12 + i * 0.05, 0.42, ease.out);
        if (p <= 0.01) continue;
        const x = lerp(x0, x1, i / (n - 1));
        const hour = i % 6 === 0;
        const h = (hour ? 26 : 13) * p;
        ctx.save();
        ctx.globalAlpha *= rulerA;
        ctx.strokeStyle = i <= lit ? hexA(M.amber, hour ? 0.95 : 0.48) : 'rgba(255,246,232,0.15)';
        ctx.lineWidth = hour ? 4 : 2;
        if (i <= lit && hour) {
          ctx.shadowColor = hexA(M.amber, 0.7);
          ctx.shadowBlur = 20;
        }
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x, y + h);
        ctx.stroke();
        ctx.restore();
      }
      micro(ctx, 'JAM', x1 + 24, y + 12, { size: 26, color: M.faint, track: 8, a: rulerA * 0.9 });
      // the hours the ruler is counting, named under every sixth tick
      [0, 1, 2, 3].forEach((k) => {
        const i = k * 6;
        if (i >= n) return;
        const x = lerp(x0, x1, i / (n - 1));
        const la = A(t, c[3] + 0.3 + k * 0.25, 0.4, ease.out) * rulerA;
        micro(ctx, `0${2 + k}`, x, y + 66, { size: 28, color: hexA(M.amber, 0.92), track: 3, align: 'center', a: la });
      });
      // the ticks that stop being hours and fall out of the ruler
      for (let i = 0; i < n; i += 2) {
        const d = A(t, c[4] + 0.15 + (i / n) * 1.5, 1.3, ease.in);
        if (d <= 0.01 || d >= 1) continue;
        const x = lerp(x0, x1, i / (n - 1));
        ctx.save();
        ctx.globalAlpha *= (1 - d) * 0.85;
        ctx.strokeStyle = hexA(M.amber, 0.85);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + d * 430);
        ctx.lineTo(x, y + d * 430 + 20 * (1 - d));
        ctx.stroke();
        ctx.restore();
      }
    }
  },
};
