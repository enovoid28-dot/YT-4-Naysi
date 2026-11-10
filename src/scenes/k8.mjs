import { W, H, C, M, txt, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { paperRoom, paperKicker, sheet, applyGrain, P } from './_ep5.mjs';
import { alarmClock, tapeStrip } from './_props.mjs';

// 08 — JAMNYA. The clock on the wall: the only lever is a 7–9 hour block at the
// same time every night, and then the question nobody can answer for you.
const CX = 720;
const CY = 880;
const R = 344;

export default {
  draw(ctx, t) {
    paperRoom(ctx);
    paperKicker(ctx, 'YANG BENAR-BENAR BEKERJA', { y: 280 });

    const cA = EASE.outCubic(clamp((t - 0.15) / 0.8));
    ctx.save();
    ctx.globalAlpha = cA;
    // the sleep window as a ring behind the clock: 23.00 → 07.00
    const sA = EASE.outCubic(clamp((t - 1.0) / 1.1));
    if (sA > 0.01) {
      const a0 = (23 / 24) * TAU - Math.PI / 2;
      const sweep = ((7 - 23 + 24) % 24) / 24 * TAU;
      ctx.save();
      ctx.globalAlpha = cA * sA;
      ctx.strokeStyle = 'rgba(30,95,91,0.75)';
      ctx.lineWidth = 44;
      ctx.beginPath();
      ctx.arc(CX, CY, R + 30, a0, a0 + sweep * sA);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(93,211,198,0.55)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(CX, CY, R + 52, a0, a0 + sweep * sA);
      ctx.stroke();
      ctx.restore();
    }

    alarmClock(ctx, CX, CY, R, { hh: 23, mm: 0, a: 1, lit: 0.15 });

    // 23.00 and 07.00 at the ends of the ring
    const eA = EASE.outCubic(clamp((t - 1.8) / 0.6));
    if (eA > 0.01) {
      const p23 = (23 / 24) * TAU - Math.PI / 2;
      const p07 = (7 / 24) * TAU - Math.PI / 2;
      txt(ctx, '23.00', CX + Math.cos(p23) * (R + 96) + 10, CY + Math.sin(p23) * (R + 96) + 8, {
        size: 26, font: F.mono6, color: P.teal, track: 2, alpha: eA,
      });
      txt(ctx, '07.00', CX + Math.cos(p07) * (R + 118) - 10, CY + Math.sin(p07) * (R + 118) + 8, {
        size: 26, font: F.mono6, color: P.teal, track: 2, alpha: eA, align: 'right',
      });
    }

    // 7–9 jam label, taped to the left of the ring
    const tA = EASE.outCubic(clamp((t - 2.2) / 0.7));
    if (tA > 0.01) {
      ctx.save();
      ctx.globalAlpha = tA;
      txt(ctx, '7–9', 120, 700, { size: 92, font: F.display, color: P.teal, track: -3 });
      txt(ctx, 'JAM', 120, 762, {
        size: 30, font: F.mono6, color: 'rgba(23,19,16,0.6)', track: 6,
      });
      ctx.restore();
    }

    // same time every night
    const sA2 = EASE.outCubic(clamp((t - 4.6) / 0.7));
    if (sA2 > 0.01) {
      ctx.save();
      ctx.globalAlpha = sA2;
      txt(ctx, 'JAM YANG SAMA', 120, 1318, {
        size: 52, font: F.display, color: P.ink, track: -1,
      });
      txt(ctx, 'TIAP MALAM', 120, 1382, {
        size: 52, font: F.display, color: P.ink, track: -1,
      });
      ctx.fillStyle = 'rgba(23,19,16,0.16)';
      ctx.fillRect(120, 1424, W - 240, 2);
      ctx.restore();
    }

    // the honest test
    const hA = EASE.outCubic(clamp((t - 8.2) / 0.7));
    if (hA > 0.01) {
      ctx.save();
      ctx.globalAlpha = hA;
      ctx.translate(CX, 1470);
      ctx.rotate(-0.06);
      const label = 'MASIH LAPAR? ITU LAPAR SUNGGUHAN';
      const tw = measure(ctx, label, 26, F.mono6, 3);
      ctx.fillStyle = 'rgba(226,69,47,0.12)';
      ctx.fillRect(-tw / 2 - 26, -34, tw + 52, 68);
      ctx.strokeStyle = 'rgba(226,69,47,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-tw / 2 - 26, -34, tw + 52, 68);
      txt(ctx, label, 0, 10, {
        size: 26, font: F.mono6, color: P.red2, align: 'center', track: 3,
      });
      ctx.restore();
    }

    // the question, on a note taped to the frame
    const qA = EASE.outCubic(clamp((t - 11.4) / 0.8));
    if (qA > 0.01) {
      ctx.save();
      ctx.globalAlpha = qA;
      ctx.translate(W / 2, 1652 + lerp(28, 0, qA));
      ctx.rotate(0.012);
      sheet(ctx, -470, -104, 940, 208, { a: qA, rot: 0, lift: 1.1, fill: '#FDF6E6' });
      txt(ctx, 'JAM BERAPA KAMU MULAI LAPAR', -470 + 44, -34, {
        size: 27, font: F.mono6, color: 'rgba(23,19,16,0.78)', track: 2, maxWidth: 880,
      });
      txt(ctx, 'TADI MALAM?', -470 + 44, 6, {
        size: 27, font: F.mono6, color: 'rgba(23,19,16,0.78)', track: 2,
      });
      txt(ctx, 'TULIS DI KOMENTAR', -470 + 44, 66, {
        size: 22, font: F.mono6, color: P.red2, track: 4,
      });
      ctx.restore();
    }

    void C; void fillRR; void linGrad; void radGrad; void tapeStrip;
    applyGrain(ctx, 0.04);
  },
};
