import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { S, bhDisc, orbit, orbitPos } from './_space.mjs';
import { at, kicker, grain } from './_kota.mjs';

// 07 — BUKAN PENYEDOT. The myth on the left (a funnel that eats), the physics on
// the right (the same orbit as before). One is a drawing, the other is Kepler.

const INK = '#171310';
const PA = { x: 96, y: 636, w: 600, h: 620 };
const PB = { x: 744, y: 636, w: 600, h: 620 };

export default {
  draw(ctx, t, scene) {
    ctx.fillStyle = '#F4ECDC';
    ctx.fillRect(-240, -240, W + 480, H + 480);
    const g = radGrad(ctx, 1180, -120, 80, 1500, [[0, 'rgba(255,247,231,0.95)'], [1, 'rgba(224,206,176,0)']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);
    grain(ctx, 0.03);

    kicker(ctx, 'DUA GAMBARAN YANG SALING BERTENTANGAN', { x: 96, y: 250, color: '#B32E1C', ink: hexA(INK, 0.85) });

    const panel = (P, title, color, a) => {
      ctx.save();
      ctx.globalAlpha = a;
      fillRR(ctx, P.x, P.y, P.w, P.h, 14, 'rgba(255,255,255,0.42)');
      strokeRR(ctx, P.x, P.y, P.w, P.h, 14, 'rgba(23,19,16,0.16)', 1.5);
      ctx.restore();
      txt(ctx, title, P.x + 4, P.y - 26, { size: 26, font: F.mono6, color, track: 6, alpha: a });
    };
    panel(PA, 'YANG KITA BAYANGKAN', '#B32E1C', at(t, 0.15, 0.7));
    panel(PB, 'YANG SEBENARNYA TERJADI', hexA(INK, 0.75), at(t, 0.55, 0.7));

    /* ------------------------------- myth ---------------------------------- */
    const ma = at(t, 0.4, 0.9);
    const cx = PA.x + PA.w / 2;
    const cy = PA.y + 292;
    ctx.save();
    ctx.globalAlpha = ma;
    ctx.globalAlpha = ma * 0.07;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(cx - 196, cy - 120);
    ctx.lineTo(cx - 22, cy + 186);
    ctx.lineTo(cx + 22, cy + 186);
    ctx.lineTo(cx + 196, cy - 120);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 7; i++) {
      const k = i / 6;
      const rx = lerp(196, 22, k);
      const y = cy - 120 + k * 300;
      ctx.globalAlpha = ma * (0.5 - k * 0.42);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, y, rx, rx * 0.3, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = ma * 0.55;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 210; i++) {
      const q = i / 210;
      const ang = q * TAU * 3.2;
      const rad = lerp(190, 12, q);
      const x = cx + Math.cos(ang) * rad;
      const y = cy - 130 + q * 306 + Math.sin(ang) * rad * 0.26;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const q = 0.35 + 0.3 * Math.sin(t * 0.7);
    const ang = q * TAU * 3.2;
    const rad = lerp(190, 12, q);
    ctx.globalAlpha = ma;
    ctx.fillStyle = '#2E5C9A';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(ang) * rad, cy - 130 + q * 306 + Math.sin(ang) * rad * 0.26, 8, 0, TAU);
    ctx.fill();
    ctx.restore();

    const xa = at(t, 1.5, 0.5);
    ctx.save();
    ctx.globalAlpha = xa * 0.9;
    ctx.strokeStyle = '#B32E1C';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    const X = PA.x + PA.w / 2;
    const Yc = PA.y + PA.h / 2;
    const s = 140;
    ctx.beginPath();
    ctx.moveTo(X - s, Yc - s);
    ctx.lineTo(X - s + 280 * xa, Yc - s + 280 * xa);
    ctx.moveTo(X + s, Yc - s);
    ctx.lineTo(X + s - 280 * xa, Yc - s + 280 * xa);
    ctx.stroke();
    ctx.restore();

    /* -------------------------------- fact --------------------------------- */
    const fa = at(t, 1.0, 0.9);
    const bx = PB.x + PB.w / 2;
    const by = PB.y + 286;
    ctx.save();
    ctx.globalAlpha = fa;
    orbit(ctx, bx, by, 232, 92, { a: 1, color: 'rgba(23,19,16,0.35)', lw: 2, prog: at(t, 1.2, 1.1) });
    bhDisc(ctx, bx, by, 13, { t, glow: 0.5, ring: 1, tone: 0.55 });
    const pa = orbitPos(bx, by, 232, 92, -0.9 + t * 0.5);
    ctx.fillStyle = '#2E5C9A';
    ctx.beginPath();
    ctx.arc(pa.x, pa.y, 8, 0, TAU);
    ctx.fill();
    ctx.restore();

    txt(ctx, 'orbit tetap', bx, by + 190, { size: 30, font: F.body, color: hexA(INK, 0.62), align: 'center', alpha: fa });
    txt(ctx, 'tidak ada yang tersedot', bx, by + 234, { size: 30, font: F.body, color: hexA(INK, 0.62), align: 'center', alpha: at(t, 2.0, 0.7) });

    ctx.save();
    ctx.globalAlpha = at(t, 3.2, 0.8);
    fillRR(ctx, 96, 1404, W - 192, 78, 10, 'rgba(23,19,16,0.05)');
    txt(ctx, 'MENGUAP: 10^67 TAHUN', 128, 1452, { size: 22, font: F.mono6, color: hexA(INK, 0.6), track: 3 });
    txt(ctx, 'lebih lama dari usia semesta', 1300, 1452, { size: 22, font: F.body, color: hexA(INK, 0.45), align: 'right' });
    ctx.restore();
  },
};
