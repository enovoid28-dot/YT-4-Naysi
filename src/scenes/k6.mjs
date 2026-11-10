import { W, H, C, M, txt, hexA, fillRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { paperRoom, paperKicker, sheet, tag, applyGrain, P } from './_ep5.mjs';
import { priceTag, tapeStrip } from './_props.mjs';

// 06 — BALIK. A 24-hour dial: the sleep block grows by 1,2 jam, and the plate
// underneath shrinks by 270 kcal. Same body, two levers.
const CX = 720;
const CY = 950;
const R = 350;
const angOf = (h) => (h / 24) * TAU - Math.PI / 2;

function arc(ctx, h0, h1, r0, r1, color, a = 1) {
  // h1 may be smaller than h0 (the window wraps over midnight)
  const start = (h0 / 24) * TAU;
  const sweep = (((h1 - h0 + 24) % 24) / 24) * TAU;
  const N = 72;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const an = start + (sweep * i) / N;
    const x = Math.sin(an) * r1;
    const y = -Math.cos(an) * r1;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = N; i >= 0; i--) {
    const an = start + (sweep * i) / N;
    ctx.lineTo(Math.sin(an) * r0, -Math.cos(an) * r0);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

export default {
  draw(ctx, t) {
    paperRoom(ctx);
    paperKicker(ctx, 'INI BISA DIBALIK', { y: 292 });

    const dA = EASE.outCubic(clamp((t - 0.2) / 0.8));

    ctx.save();
    ctx.globalAlpha = dA;
    ctx.translate(CX, CY);

    // dial plate
    ctx.save();
    ctx.shadowColor = 'rgba(80,58,30,0.35)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 26;
    ctx.fillStyle = '#FBF3E2';
    ctx.beginPath();
    ctx.arc(0, 0, R + 26, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(23,19,16,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, R + 26, 0, TAU);
    ctx.stroke();

    // sleep block (23.00 → 07.00), then the extra 1,2 jam
    arc(ctx, 23, 7, R * 0.56, R * 0.99, 'rgba(30,95,91,0.88)');
    const exA = EASE.outCubic(clamp((t - 3.6) / 1.0));
    if (exA > 0.01) {
      // 21.48 → 23.00 on top of the block
      arc(ctx, 21.8, 23, R * 0.56, R * 0.99, 'rgba(226,69,47,0.92)', exA);
    }

    // hour ticks + numbers
    for (let h = 0; h < 24; h++) {
      const an = angOf(h);
      const big = h % 6 === 0;
      ctx.strokeStyle = big ? 'rgba(23,19,16,0.65)' : 'rgba(23,19,16,0.22)';
      ctx.lineWidth = big ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(an) * (R + 8), Math.sin(an) * (R + 8));
      ctx.lineTo(Math.cos(an) * (R + (big ? 26 : 16)), Math.sin(an) * (R + (big ? 26 : 16)));
      ctx.stroke();
      if (h % 3 === 0) {
        txt(ctx, String(h).padStart(2, '0'), Math.cos(an) * (R + 62), Math.sin(an) * (R + 62) + 9, {
          size: 24, font: F.mono, color: 'rgba(23,19,16,0.5)', align: 'center', track: 1,
        });
      }
    }

    // inner face
    ctx.fillStyle = 'rgba(251,243,226,0.94)';
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.52, 0, TAU);
    ctx.fill();

    txt(ctx, 'TIDUR', 0, -96, {
      size: 30, font: F.mono6, color: 'rgba(23,19,16,0.55)', align: 'center', track: 6,
    });
    txt(ctx, '7', 0, 40, { size: 132, font: F.display, color: P.ink, align: 'center', track: -4 });
    txt(ctx, 'JAM', 0, 100, {
      size: 26, font: F.mono6, color: 'rgba(23,19,16,0.5)', align: 'center', track: 5,
    });

    // +1,2 jam callout
    if (exA > 0.01) {
      ctx.save();
      ctx.globalAlpha = dA * exA;
      txt(ctx, '+1,2 JAM', 140, 1060, {
        size: 52, font: F.head, color: P.red, track: -1,
      });
      txt(ctx, 'DARI KONSELING TIDUR', 140, 1104, {
        size: 19, font: F.mono, color: 'rgba(23,19,16,0.5)', track: 1, maxWidth: 260,
      });
      // pointer to the red block
      ctx.strokeStyle = 'rgba(226,69,47,0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 1080);
      ctx.lineTo(CX + Math.cos(angOf(22.4)) * (R - 30), CY + Math.sin(angOf(22.4)) * (R - 30));
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // top tag
    const tgA = clamp((t - 0.8) / 0.6);
    if (tgA > 0.01) {
      const tw = tag(ctx, 96, 380, '80 ORANG DEWASA · 2 MINGGU', {
        size: 26, color: 'rgba(23,19,16,0.75)', bg: 'rgba(23,19,16,0.08)', a: tgA,
      });
      tag(ctx, 96 + tw + 16, 380, 'TANPA DIET', {
        size: 26, color: P.red, bg: 'rgba(226,69,47,0.12)', a: tgA,
      });
    }

    // ---- the plate: the portion that shrinks ------------------------------
    const pA = EASE.outCubic(clamp((t - 8.6) / 0.7));
    if (pA > 0.01) {
      const shrink = 1 - 0.34 * EASE.outCubic(clamp((t - 9.4) / 1.2));
      ctx.save();
      ctx.globalAlpha = pA;
      const px = 720;
      const py = 1560;
      // plate
      ctx.fillStyle = 'rgba(80,58,30,0.22)';
      ctx.beginPath();
      ctx.ellipse(px, py + 14, 250, 66, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#FBF3E2';
      ctx.beginPath();
      ctx.ellipse(px, py, 248, 64, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(23,19,16,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px, py, 248, 64, 0, 0, TAU);
      ctx.stroke();
      // portion
      ctx.fillStyle = '#C98A44';
      ctx.beginPath();
      ctx.ellipse(px, py - 14, 146 * shrink, 46 * shrink, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#B5713A';
      ctx.beginPath();
      ctx.ellipse(px - 24, py - 26, 74 * shrink, 26 * shrink, 0.2, 0, TAU);
      ctx.fill();
      ctx.restore();

      const vA = EASE.outCubic(clamp((t - 9.9) / 0.6));
      if (vA > 0.01) {
        ctx.save();
        ctx.globalAlpha = vA;
        txt(ctx, '−270 KKAL', 720, 1360, {
          size: 74, font: F.head, color: P.red, align: 'center', track: -2,
        });
        txt(ctx, 'PER HARI, TANPA MENGHITUNG', 720, 1404, {
          size: 22, font: F.mono6, color: 'rgba(23,19,16,0.55)', align: 'center', track: 3,
        });
        ctx.restore();
      }
    }

    void sheet; void priceTag; void tapeStrip; void measure; void linGrad; void radGrad; void fillRR; void C; void H;
    applyGrain(ctx, 0.04);
  },
};
