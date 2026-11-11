import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { at, kicker, grain } from './_kota.mjs';

// 05 — DINGIN. The only honest way to show a heat death is a curve: a week to
// freezing, a year to minus twenty, a decade to almost nothing.

const INK = '#171310';
const X0 = 158;
const X1 = 1298;
const Y0 = 726;
const Y1 = 1424;
const DAYS = 3650;

const dx = (d) => X0 + (Math.log10(clamp(d, 1, DAYS)) / Math.log10(DAYS)) * (X1 - X0);
const ty = (T) => Y0 + ((20 - T) / 100) * (Y1 - Y0);

const PTS = [
  [1, 14], [7, 0], [30, -8], [90, -14], [365, -20], [1095, -40], [3650, -68],
];

function curveAt(i, k) {
  const p0 = PTS[Math.max(0, i - 1)];
  const p1 = PTS[i];
  const p2 = PTS[Math.min(PTS.length - 1, i + 1)];
  const p3 = PTS[Math.min(PTS.length - 1, i + 2)];
  const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * k + (2 * a - 5 * b + 4 * c - d) * k * k + (-a + 3 * b - 3 * c + d) * k * k * k);
  const ld = (p) => Math.log10(p[0]);
  return [Math.pow(10, f(ld(p0), ld(p1), ld(p2), ld(p3))), f(p0[1], p1[1], p2[1], p3[1])];
}

export default {
  draw(ctx, t, scene) {
    ctx.fillStyle = '#F4ECDC';
    ctx.fillRect(-240, -240, W + 480, H + 480);
    const g = radGrad(ctx, 1180, -120, 80, 1500, [[0, 'rgba(255,247,231,0.95)'], [1, 'rgba(224,206,176,0)']]);
    ctx.fillStyle = g;
    ctx.fillRect(-240, -240, W + 480, H + 480);
    grain(ctx, 0.03);

    kicker(ctx, 'TANPA CAHAYA, TIDAK ADA YANG HANGAT', { x: 96, y: 250, color: '#B32E1C', ink: hexA(INK, 0.85) });

    ctx.save();
    ctx.strokeStyle = 'rgba(23,19,16,0.12)';
    ctx.lineWidth = 1;
    for (const T of [20, 0, -20, -40, -60, -80]) {
      const y = ty(T);
      ctx.globalAlpha = T === 0 ? 0.4 : 0.12;
      if (T === 0) ctx.setLineDash([7, 9]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(X0, y);
      ctx.lineTo(X1, y);
      ctx.stroke();
      txt(ctx, `${T > 0 ? '+' : ''}${T}`, X0 - 18, y + 9, {
        size: 24, font: F.mono6, color: hexA(INK, T === 0 ? 0.6 : 0.34), align: 'right',
      });
    }
    ctx.setLineDash([]);
    for (const [d, label] of [[1, '1 HARI'], [7, '7 HARI'], [30, '30 HARI'], [365, '1 TAHUN'], [3650, '10 THN']]) {
      const x = dx(d);
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.moveTo(x, Y1);
      ctx.lineTo(x, Y1 + 10);
      ctx.stroke();
      txt(ctx, label, x, Y1 + 46, { size: 21, font: F.mono6, color: hexA(INK, 0.42), align: 'center', track: 1 });
    }
    ctx.restore();

    const prog = at(t, 0.35, 2.4);
    const pts = [];
    for (let i = 0; i < PTS.length - 1; i++) {
      for (let k = 0; k <= 12; k++) {
        const [d, T] = curveAt(i, k / 12);
        pts.push([dx(d), ty(T)]);
      }
    }
    const n = Math.max(2, Math.round(pts.length * prog));
    const shown = pts.slice(0, n);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(shown[0][0], Y1);
    shown.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(shown[shown.length - 1][0], Y1);
    ctx.closePath();
    const wg = linGrad(ctx, 0, Y0, 0, Y1, [[0, 'rgba(88,140,178,0.02)'], [1, 'rgba(88,140,178,0.16)']]);
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#1E6FA8';
    ctx.lineWidth = 4.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    shown.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
    ctx.stroke();
    ctx.restore();

    const mk = (d, T, label, sub, delay) => {
      const a = at(t, delay, 0.5);
      if (a <= 0.01) return;
      const x = dx(d);
      const y = ty(T);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#F4ECDC';
      ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1E6FA8';
      ctx.beginPath(); ctx.arc(x, y, 5.5, 0, TAU); ctx.fill();
      ctx.restore();
      const bw = Math.max(measure(ctx, label, 36, F.num6, 0), measure(ctx, sub, 21, F.mono6, 2)) + 30;
      ctx.save();
      ctx.globalAlpha = a * 0.94;
      fillRR(ctx, x - 14, y - 58, bw, 116, 10, 'rgba(246,239,224,0.95)');
      ctx.restore();
      txt(ctx, label, x, y - 14, { size: 36, font: F.num6, color: INK, alpha: a });
      txt(ctx, sub, x + 2, y + 34, { size: 21, font: F.mono6, color: hexA(INK, 0.55), track: 2, alpha: a });
    };
    mk(7, 0, '0 °C', 'AIR MEMBEKU', 1.5);
    mk(365, -20, '−20 °C', 'SETAHUN', 2.3);

    const ea = at(t, 3.0, 0.7);
    ctx.save();
    ctx.globalAlpha = ea * 0.94;
    fillRR(ctx, X1 - 150, ty(-68) - 62, 146, 56, 9, 'rgba(246,239,224,0.95)');
    ctx.restore();
    txt(ctx, '−68 °C', X1 - 20, ty(-68) - 22, { size: 34, font: F.num6, color: '#1E6FA8', align: 'right', alpha: ea });

    ctx.save();
    ctx.globalAlpha = at(t, 3.4, 0.8);
    fillRR(ctx, 96, 1552, W - 192, 88, 10, 'rgba(23,19,16,0.05)');
    txt(ctx, 'Suhu rata-rata permukaan Bumi', 128, 1606, { size: 24, font: F.body, color: hexA(INK, 0.55) });
    txt(ctx, 'sebelum: +15 °C', 1300, 1606, { size: 24, font: F.body, color: hexA(INK, 0.55), align: 'right' });
    ctx.restore();
  },
};
