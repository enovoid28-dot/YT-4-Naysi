import { W, H, txt, hexA, fillRR, measure, arcGauge } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, cassette, printCard, kick, num, rule, stampInk, typeLabel, pin, thread,
  hatch,
} from './_arsip.mjs';

// 08 — BUKAN REKAMAN
// Memory is not a tape you replay. It is a tape you re-record every time you
// play it — and a quarter of adults will swear to an afternoon that never was.

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.42, lampY: 460, key: 'r8' });

    // ── the tape
    const pt = A(t, 0.05, 1.0, ease.back);
    if (pt > 0.01) {
      const cw = 860;
      const ch = cw * 0.63;
      ctx.save();
      ctx.globalAlpha = clamp(pt * 1.3);
      contact(ctx, 120, 300 + ch - 40, cw, 100, 0.55);
      ctx.translate(0, (1 - pt) * -70);
      cassette(ctx, 120, 300, cw, { rot: -0.02, label: 'SISI A', sub: 'KENANGAN' });

      // the tape comes out and is spliced back
      const ps = A(t, c(1, 0.10), 1.2, ease.inOut);
      if (ps > 0.01) {
        const x1 = 120 + cw - 20;
        const y1 = 300 + ch * 0.55;
        ctx.strokeStyle = 'rgba(26,19,13,0.95)';
        ctx.lineWidth = 13;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x1 + 90 * ps, y1 + 80 * ps, x1 + 20 * ps, y1 + 200 * ps, x1 - 30, y1 + 210 * ps);
        ctx.stroke();
        // splice
        if (ps > 0.8) {
          const psp = (ps - 0.8) / 0.2;
          ctx.save();
          ctx.globalAlpha *= psp;
          ctx.strokeStyle = 'rgba(226,212,178,0.75)';
          ctx.lineWidth = 17;
          ctx.beginPath();
          ctx.moveTo(x1 - 40, y1 + 208);
          ctx.lineTo(x1 + 10, y1 + 196);
          ctx.stroke();
          typeLabel(ctx, 'DISAMBUNG', x1 - 10, y1 + 250, { size: 18, rot: 0.06 });
          ctx.restore();
        }
      }
      ctx.restore();
    }

    // ── the ring: a quarter of adults will "remember" the mall
    const pr = A(t, c(3, 0.05), 1.5, ease.out);
    if (pr > 0.01) {
      const cx = 300;
      const cy = 1200;
      const R = 132;
      ctx.save();
      ctx.globalAlpha = clamp(pr * 1.6);
      contact(ctx, cx - R, cy - R + 20, R * 2, R * 2, 0.45);
      // track
      ctx.strokeStyle = 'rgba(244,235,218,0.14)';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.stroke();
      // fill
      ctx.strokeStyle = K.redHi;
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * 0.25 * pr);
      ctx.stroke();
      num(ctx, '25%', cx, cy + 26, { size: 84, color: K.bone, align: 'center', track: -3 });
      ctx.restore();
      kick(ctx, 'MENGINGAT KEJADIAN YANG TIDAK ADA', 120, cy + R + 84, { size: 18, color: K.dim, track: 4 });
    }

    // ── the print that proves nothing
    const pp = A(t, c(3, 0.55), 0.8, ease.back);
    if (pp > 0.01) {
      ctx.save();
      ctx.globalAlpha = clamp(pp * 1.3);
      printCard(ctx, 604, 1000, 476, 366, {
        rot: 0.035,
        tape: 1,
        art: (g, iw, ih, ox, oy) => {
          // an ordinary mall corridor: ceiling lights, shopfronts, polished floor
          const bg = g.createLinearGradient(ox, oy, ox, oy + ih);
          bg.addColorStop(0, '#4A3E31');
          bg.addColorStop(0.5, '#2C241C');
          bg.addColorStop(1, '#141110');
          g.fillStyle = bg;
          g.fillRect(ox, oy, iw, ih);
          // ceiling
          g.fillStyle = 'rgba(255,236,200,0.10)';
          g.fillRect(ox, oy, iw, ih * 0.16);
          for (let i = 0; i < 3; i++) {
            const lx = ox + iw * (0.18 + i * 0.32);
            const lg2 = g.createRadialGradient(lx, oy + ih * 0.10, 2, lx, oy + ih * 0.10, iw * 0.16);
            lg2.addColorStop(0, 'rgba(255,236,196,0.55)');
            lg2.addColorStop(1, 'rgba(255,236,196,0)');
            g.fillStyle = lg2;
            g.fillRect(lx - iw * 0.16, oy, iw * 0.32, ih * 0.24);
            g.fillStyle = 'rgba(255,246,224,0.85)';
            g.fillRect(lx - iw * 0.045, oy + ih * 0.085, iw * 0.09, ih * 0.012);
          }
          // shopfronts left and right
          [0.02, 0.66].forEach((u, i) => {
            g.fillStyle = i ? 'rgba(250,220,170,0.22)' : 'rgba(235,205,160,0.16)';
            g.fillRect(ox + iw * u, oy + ih * 0.20, iw * 0.32, ih * 0.44);
            g.strokeStyle = 'rgba(255,240,210,0.20)';
            g.lineWidth = 2;
            g.strokeRect(ox + iw * u, oy + ih * 0.20, iw * 0.32, ih * 0.44);
            for (let k = 1; k < 3; k++) {
              g.strokeStyle = 'rgba(255,240,210,0.10)';
              g.beginPath();
              g.moveTo(ox + iw * u, oy + ih * (0.20 + k * 0.14));
              g.lineTo(ox + iw * (u + 0.32), oy + ih * (0.20 + k * 0.14));
              g.stroke();
            }
          });
          // floor
          const fg = g.createLinearGradient(ox, oy + ih * 0.62, ox, oy + ih);
          fg.addColorStop(0, '#3A3128');
          fg.addColorStop(1, '#171412');
          g.fillStyle = fg;
          g.fillRect(ox, oy + ih * 0.62, iw, ih * 0.38);
          // reflection of the lights on the polished floor
          for (let i = 0; i < 3; i++) {
            const lx = ox + iw * (0.18 + i * 0.32);
            const rg2 = g.createLinearGradient(lx, oy + ih * 0.62, lx, oy + ih);
            rg2.addColorStop(0, 'rgba(255,230,190,0.16)');
            rg2.addColorStop(1, 'rgba(255,230,190,0)');
            g.fillStyle = rg2;
            g.fillRect(lx - iw * 0.05, oy + ih * 0.62, iw * 0.10, ih * 0.38);
          }
          // perspective seams
          g.strokeStyle = 'rgba(255,235,200,0.07)';
          g.lineWidth = 2;
          for (let i = -2; i <= 2; i++) {
            g.beginPath();
            g.moveTo(ox + iw * 0.5 + i * iw * 0.34, oy + ih);
            g.lineTo(ox + iw * 0.5 + i * iw * 0.05, oy + ih * 0.62);
            g.stroke();
          }
          // a bench and a plant
          g.fillStyle = 'rgba(18,14,11,0.95)';
          g.fillRect(ox + iw * 0.20, oy + ih * 0.66, iw * 0.22, ih * 0.035);
          g.fillRect(ox + iw * 0.21, oy + ih * 0.69, iw * 0.012, ih * 0.06);
          g.fillRect(ox + iw * 0.40, oy + ih * 0.69, iw * 0.012, ih * 0.06);
          g.fillStyle = 'rgba(30,44,32,0.85)';
          for (let i = 0; i < 7; i++) {
            g.beginPath();
            g.ellipse(ox + iw * 0.60 + (i - 3) * iw * 0.016, oy + ih * (0.60 - (i % 3) * 0.03), iw * 0.026, ih * 0.05, (i - 3) * 0.25, 0, TAU);
            g.fill();
          }
          // a woman with a small child, far down the corridor
          const px = ox + iw * 0.47;
          const py = oy + ih * 0.55;
          g.fillStyle = 'rgba(12,10,9,0.92)';
          g.beginPath();
          g.arc(px, py, iw * 0.020, 0, TAU);
          g.fill();
          g.beginPath();
          g.moveTo(px - iw * 0.026, py + ih * 0.14);
          g.lineTo(px - iw * 0.018, py + ih * 0.02);
          g.lineTo(px + iw * 0.018, py + ih * 0.02);
          g.lineTo(px + iw * 0.026, py + ih * 0.14);
          g.closePath();
          g.fill();
          g.beginPath();
          g.arc(px + iw * 0.062, py + ih * 0.075, iw * 0.013, 0, TAU);
          g.fill();
          g.fillRect(px + iw * 0.052, py + ih * 0.088, iw * 0.021, ih * 0.055);
          // grain
          hatch(g, { x: ox, y: oy, w: iw, h: ih }, (gg) => gg.rect(ox, oy, iw, ih), {
            angle: -0.7, step: 8, lw: 1, color: '#000', a: 0.16,
          });
        },
      });
      typeLabel(ctx, 'MAL, USIA 5 — TIDAK PERNAH TERJADI', 620, 1392, { size: 18, rot: 0.01 });

      // the cross
      const px = A(t, c(4, 0.05), 0.5, ease.out);
      if (px > 0.01) {
        ctx.save();
        ctx.globalAlpha = px;
        ctx.strokeStyle = hexA(K.redHi, 0.92);
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(656, 1050);
        ctx.lineTo(656 + 372 * px, 1050 + 268 * px);
        ctx.moveTo(656 + 372 * px, 1050);
        ctx.lineTo(656, 1050 + 268 * px);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // ── the claim
    const pc = A(t, c(0, 0.15), 0.6, ease.out);
    if (pc > 0.01) {
      ctx.save();
      ctx.globalAlpha = pc;
      rule(ctx, 1120, 1040, 216, { a: 0.7 });
      kick(ctx, 'DIREKAM ULANG', 1120, 1100, { size: 19, color: K.dim, track: 6 });
      txt(ctx, 'setiap', 1120, 1180, { size: 44, font: F.display, color: K.bone });
      txt(ctx, 'kali kamu', 1120, 1232, { size: 44, font: F.display, color: K.bone });
      txt(ctx, 'mengingat.', 1120, 1284, { size: 44, font: F.display, color: K.redHi });
      ctx.restore();
    }
  },
};
