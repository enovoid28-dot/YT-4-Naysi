import { W, H, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, micro, number, A, cue, cueWord, ease, ribbon, axisX, axisY, leader, pill, halo,
  TAU, clamp, lerp, rng,
} from './_malam.mjs';

// 05 — GULA
// The one scene that is inside the body, and the one scene that is allowed to be
// a chart — but a chart you can read in two seconds: an axis with real numbers, a
// green band where the blood sugar is supposed to stay, and a curve that climbs
// out of it in six short nights. The word PRADIABETES is not a caption; it is the
// name of the territory the curve has entered.

const X0 = 200;
const X1 = 1312;
const YT = 760;
const YB = 1490;
const V0 = 60;
const V1 = 200;

const yOf = (v) => lerp(YB, YT, (v - V0) / (V1 - V0));
const night = (i) => lerp(X0, X1, (i - 1) / 5);         // night 1..6 → x
const sugar = (p) => 92 + 30 * Math.pow(clamp(p, 0, 1), 3.0); // 92 → 122 mg/dL

export default {
  draw(ctx, t, scene) {
    // ── inside the blood: a dark maroon field, far quieter than it used to be,
    //    so the chart owns the frame
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0E0609');
    g.addColorStop(0.38, '#250A11');
    g.addColorStop(0.78, '#15060B');
    g.addColorStop(1, '#080409');
    ctx.fillStyle = g;
    ctx.fillRect(-80, -80, W + 160, H + 160);

    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wPrad = cueWord(scene, 3, 'pradiabetes');
    const alarm = A(t, wPrad - 0.45, 0.9, ease.out);
    const dim = 1 - 0.45 * A(t, c[4] + 0.25, 1.4, ease.inOut);
    const on = A(t, c[0], 1.0, ease.out);

    // cells drifting past, only a texture now
    const r = rng(51);
    ctx.save();
    ctx.globalAlpha *= 0.55 * dim;
    for (let i = 0; i < 22; i++) {
      const bx = r() * W;
      const by = 240 + r() * 1800;
      const x = bx + Math.sin(t * 0.3 + r() * TAU) * 30;
      const y = by + Math.cos(t * 0.24 + r() * TAU) * 24;
      const rad = 40 + r() * 46;
      const cg = ctx.createRadialGradient(x, y, rad * 0.2, x, y, rad);
      cg.addColorStop(0, 'rgba(255,120,110,0.07)');
      cg.addColorStop(1, 'rgba(160,20,40,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    /* ── the normal range: a band, not a line ─────────────────────────────── */
    const topNormal = yOf(100);
    const botNormal = yOf(70);
    ctx.save();
    ctx.globalAlpha *= on * (1 - 0.35 * alarm) * dim;
    ctx.fillStyle = 'rgba(120,240,190,0.055)';
    ctx.fillRect(X0, topNormal, X1 - X0, botNormal - topNormal);
    ctx.strokeStyle = 'rgba(150,255,205,0.42)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(X0, topNormal);
    ctx.lineTo(X1, topNormal);
    ctx.stroke();
    ctx.restore();
    micro(ctx, 'NORMAL 70 – 100', X0 + 18, botNormal - 18, {
      size: 26, color: 'rgba(165,255,210,0.90)', track: 6, a: on * dim,
    });

    /* ── axes ─────────────────────────────────────────────────────────────── */
    ctx.save();
    ctx.globalAlpha *= dim;
    axisY(ctx, X0, YT, YB, [[0, '200'], [(200 - 126) / 140, '126'], [(200 - 100) / 140, '100'], [(200 - 70) / 140, '70']], {
      a: on, size: 30, lab: 'rgba(255,246,232,0.50)',
    });
    axisX(ctx, X0, X1, YB, [1, 2, 3, 4, 5, 6].map((i) => [(i - 1) / 5, `MALAM ${i}`]), { a: on, size: 24 });
    micro(ctx, 'GULA DARAH  ·  MG/DL', X0 - 4, YT - 44, { size: 30, color: M.dim, track: 8, a: on });
    ctx.restore();

    // the territory the curve is about to enter: 100 to 126
    ctx.save();
    ctx.globalAlpha *= on * (0.35 + 0.55 * alarm) * dim;
    const zt = yOf(126);
    const zb = yOf(100);
    ctx.fillStyle = 'rgba(255,86,66,0.07)';
    ctx.fillRect(X0, zt, X1 - X0, zb - zt);
    ctx.save();
    ctx.beginPath();
    ctx.rect(X0, zt, X1 - X0, zb - zt);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,110,90,0.22)';
    ctx.lineWidth = 2;
    for (let x = X0 - (zb - zt); x < X1 + (zb - zt); x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, zb);
      ctx.lineTo(x + (zb - zt), zt);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,110,90,0.55)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(X0, zt, X1 - X0, zb - zt);
    ctx.restore();
    micro(ctx, 'PRADIABETES  100 – 125', X0 + 18, (yOf(126) + yOf(100)) / 2 + 10, {
      size: 27, color: hexA(M.red, 0.95), track: 5, a: on * dim,
    });

    // faint gridlines every 25 mg/dL, behind everything else
    ctx.save();
    ctx.globalAlpha *= on * 0.55;
    ctx.strokeStyle = 'rgba(255,246,232,0.055)';
    ctx.lineWidth = 1.5;
    [75, 125, 150, 175].forEach((v) => {
      ctx.beginPath();
      ctx.moveTo(X0, yOf(v));
      ctx.lineTo(X1, yOf(v));
      ctx.stroke();
    });
    ctx.restore();

    // 100 / 126 hairlines across the plot
    [[100, 'rgba(150,255,200,0.30)'], [126, 'rgba(255,110,90,0.34)']].forEach(([v, col], i) => {
      ctx.save();
      ctx.globalAlpha *= on * dim;
      ctx.setLineDash(i ? [12, 16] : [22, 18]);
      ctx.strokeStyle = col;
      ctx.lineWidth = i ? 2 : 3;
      ctx.beginPath();
      ctx.moveTo(X0, yOf(v));
      ctx.lineTo(X1, yOf(v));
      ctx.stroke();
      ctx.restore();
    });

    micro(ctx, 'DIABETES ≥ 126', X0 + 18, yOf(126) - 18, {
      size: 24, color: hexA(M.red, 0.66), track: 5, a: on * dim,
    });

    /* ── the curve, drawn only as far as it has happened ──────────────────── */
    const grow = A(t, c[2] - 0.1, 2.6, ease.inOut);
    const pts = [];
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const p = i / N;
      pts.push([lerp(X0, X1, p), yOf(sugar(p))]);
    }
    // faint from the first frame, so the frame is never empty
    ctx.save();
    ctx.globalAlpha *= 0.20 * on * dim;
    ribbon(ctx, pts, { color: '#FFB07A', lw: 6, glow: 18 });
    ctx.restore();
    const drawn = Math.max(2, Math.floor(pts.length * clamp(0.06 + grow * 1.02, 0.06, 1)));
    if (grow > 0.005) {
      ctx.save();
      ctx.globalAlpha *= dim;
      ribbon(ctx, pts.slice(0, drawn), { color: alarm > 0.4 ? M.red : '#FFC08A', lw: 12, glow: 40 });
      ctx.restore();
    }

    // the six nights: six lit ticks on the axis, nothing more
    const six = A(t, c[1] + 0.1, 0.6, ease.out) * (1 - 0.55 * A(t, c[3] + 0.2, 0.8, ease.out));
    if (six > 0.01) {
      ctx.save();
      ctx.globalAlpha *= six * dim;
      for (let i = 1; i <= 6; i++) {
        const p = A(t, c[1] + 0.1 + i * 0.09, 0.45, ease.out);
        const x = night(i);
        ctx.strokeStyle = hexA(M.gold, 0.9 * p);
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, YB);
        ctx.lineTo(x, YB + 26);
        ctx.stroke();
      }
      ctx.restore();
      pill(ctx, '4 JAM × 6 MALAM', 108, 560, {
        a: six * dim, color: M.gold, size: 31, track: 5,
      });
      micro(ctx, 'TANPA MENGUBAH APA YANG KAMU MAKAN', 112, 632, {
        size: 26, color: M.faint, track: 4, a: six * dim,
      });
    }

    /* ── the last point, and the name of where it landed ──────────────────── */
    const endP = A(t, wPrad - 0.35, 0.7, ease.out);
    if (endP > 0.01) {
      const ex = X1;
      const ey = yOf(122);
      ctx.save();
      ctx.globalAlpha *= endP * dim;
      halo(ctx, ex, ey, 210, M.red, 1.1);
      ctx.fillStyle = M.ink;
      ctx.shadowColor = hexA(M.red, 0.9);
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(ex, ey, 15, 0, TAU);
      ctx.fill();
      ctx.restore();

      // 119 mg/dL, read off the last point
      number(ctx, '122', ex - 24, ey - 56, { size: 76, color: M.ink, align: 'right', glow: 0.2, a: endP * dim });
      micro(ctx, 'MG/DL', ex - 24, ey - 26, { size: 24, color: M.faint, track: 4, align: 'right', a: endP * dim });

      // the territory, named
      ctx.save();
      ctx.globalAlpha *= endP * dim;
      number(ctx, 'PRADIABETES', 108, 420, { size: 96, color: M.ink, glow: 0.25 });
      ctx.fillStyle = M.red;
      ctx.fillRect(110, 452, 186, 6);
      ctx.restore();
      micro(ctx, 'WILAYAH YANG SEHARUSNYA BELUM KAMU MASUKI', 112, 508, {
        size: 25, color: hexA(M.red, 0.85), track: 4, a: endP * dim,
      });
    }
    // the study the chart is drawn from, in the quietest type on screen
    ctx.save();
    ctx.globalAlpha *= on * dim * 0.9;
    ctx.strokeStyle = 'rgba(255,246,232,0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X0 - 4, 1574);
    ctx.lineTo(X1, 1574);
    ctx.stroke();
    micro(ctx, 'SUMBER: SPIEGEL DKK. · THE LANCET 1999', X0 - 4, 1622, {
      size: 24, color: 'rgba(255,246,232,0.30)', track: 4, a: 1,
    });
    ctx.restore();
  },
};
