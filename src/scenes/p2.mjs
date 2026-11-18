import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking, measure, ledNumber } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  D, ease, cue, room, cone, motes, bokeh, vignette, par, spark, stamp, sheen,
} from './_daya.mjs';

// 02 — TIGA BARIS
// A ledger, not a lecture: three lines eat the 100.000 one at a time, the running
// balance counts down, and what is left is divided by the tariff.

const ROWS = [
  { at: 0, key: 'TOKEN DIBELI', val: '100.000', note: 'UANG MASUK', minus: false },
  { at: 2, key: 'BIAYA ADMIN', val: '2.500', note: '2.500 – 3.500', minus: true },
  { at: 3, key: 'PPJ', val: '2.400', note: '2,4% – 10%', minus: true },
  { at: 4, key: 'TARIF / kWh', val: '1.444,70', note: 'R-1 1.300 VA', minus: false },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.18, glowY: 420, glowA: 0.14, horizon: 1320 });
    cone(ctx, W * 0.16, 260, 1300, 420, { a: 0.06, t, color: D.volt });
    motes(ctx, t, { n: 40, a: 0.4, color: '#CFE6FF' });

    const px = 116;
    const pw = W - 232;
    const py = 372;
    const ph = 840;

    // panel
    par(ctx, cam, 0.5, () => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.66)';
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 26;
      fillRR(ctx, px, py, pw, ph, 22, 'rgba(13,20,28,0.94)');
      ctx.restore();
      strokeRR(ctx, px, py, pw, ph, 22, hexA(D.bone, 0.13), 1.6);
      sheen(ctx, px, py, pw, ph, 22, t, { a: 0.05, speed: 0.09 });
      // header
      tracking(ctx, 'ALUR UANGMU', px + 44, py + 62, { size: 20, font: F.mono6, track: 6, color: hexA(D.bone, 0.45) });
      tracking(ctx, 'PRABAYAR · 1.300 VA', px + pw - 44, py + 62, {
        size: 17, font: F.mono6, track: 3, color: hexA(D.bone, 0.28), align: 'right',
      });
      ctx.fillStyle = hexA(D.bone, 0.10);
      ctx.fillRect(px + 44, py + 88, pw - 88, 1.4);
    });

    // rows
    const rowY = (i) => py + 158 + i * 172;
    ROWS.forEach((R, i) => {
      const start = i === 0 ? c(0, 0.05) : c(R.at, 0.04);
      const p = ease.expo(clamp((t - start) / 0.6));
      if (p <= 0.001) return;
      const y = rowY(i);
      const x = px + 44 + (1 - p) * 46;
      ctx.save();
      ctx.globalAlpha = p;

      // wipe: a thin line that reveals the row from the left
      ctx.strokeStyle = hexA(R.minus ? D.ember : D.mint, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 44, y + 12);
      ctx.lineTo(px + 44 + (pw - 88) * p, y + 12);
      ctx.stroke();

      tracking(ctx, R.key, x, y - 30, { size: 22, font: F.mono6, track: 4, color: hexA(D.bone, 0.62) });
      tracking(ctx, R.note, x + 330, y - 30, { size: 17, font: F.mono6, track: 3, color: hexA(D.bone, 0.32) });
      txt(ctx, `${R.minus ? '− ' : ''}${R.val}`, x + pw - 132, y + 62, {
        size: 74, font: F.num, color: R.minus ? hexA(D.ember, 0.95) : D.bone, align: 'right', track: -2.4,
      });
      ctx.restore();
    });

    // on "tiga baris": the three cuts show up as empty slots before they land
    const ghost = a(c(1, 0.05), 0.5) * (1 - a(c(2, 0.2), 0.5));
    if (ghost > 0.01) {
      ctx.save();
      ctx.globalAlpha = ghost * 0.75;
      for (let i = 1; i <= 3; i++) {
        const y = rowY(i);
        ctx.strokeStyle = hexA(D.ember, 0.30 + 0.24 * Math.sin(t * 2.4 + i));
        ctx.lineWidth = 2;
        ctx.setLineDash([9, 8]);
        strokeRR(ctx, px + 44, y - 52, pw - 88, 112, 10, hexA(D.ember, 0.22 + 0.14 * Math.sin(t * 2.4 + i)), 2);
        ctx.setLineDash([]);
        txt(ctx, '−', px + 62, y + 34, { size: 46, font: F.num, color: hexA(D.ember, 0.5) });
      }
      ctx.restore();
    }

    // the balance that walks down: 100.000 → 97.500 → 95.100
    const b1 = ease.inOut(clamp((t - c(2, 0.05)) / 0.7));
    const b2 = ease.inOut(clamp((t - c(3, 0.05)) / 0.7));
    const balance = 100000 - 2500 * b1 - 2400 * b2;
    const balA = a(c(0, 0.3), 0.5);
    if (balA > 0.01 && t < c(4, -0.2)) {
      ctx.save();
      ctx.globalAlpha = balA;
      const bx = px + 44;
      const by = py + ph + 110;
      tracking(ctx, 'SISA SETELAH POTONGAN', bx, by - 26, { size: 17, font: F.mono6, track: 4, color: hexA(D.bone, 0.35) });
      txt(ctx, Math.round(balance).toLocaleString('id-ID'), bx, by + 58, {
        size: 86, font: F.num, color: D.bone, track: -3,
      });
      ctx.restore();
    }

    // the division: the remainder becomes kilowatt hours
    const div = ease.expo(clamp((t - c(4, 0.05)) / 0.7));
    if (div > 0.01) {
      ctx.save();
      ctx.globalAlpha = div;
      const yy = py + ph + 140;
      // the sum, set as an equation
      tracking(ctx, '95.100  ÷  1.444,70  =', px + 44, yy - 64, {
        size: 26, font: F.mono6, track: 3, color: hexA(D.bone, 0.5),
      });
      const kwh = (95100 / 1444.7).toFixed(1).replace('.', ',');
      ledNumber(ctx, kwh, px + 44, yy - 22, 96, D.mint, { glowBlur: 30 });
      tracking(ctx, 'kWh', px + 44 + 348, yy + 30, { size: 26, font: F.mono6, track: 4, color: hexA(D.mint, 0.7) });
      tracking(ctx, 'SISA YANG BENAR-BENAR JADI LISTRIK', px + 44, yy + 108, {
        size: 18, font: F.mono6, track: 4, color: hexA(D.bone, 0.38),
      });
      ctx.restore();
    }

    // the pipe on the right edge: three valves, one per cut
    par(ctx, cam, 1.15, () => {
      const x = W - 74;
      ctx.save();
      ctx.strokeStyle = hexA(D.copper, 0.55);
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x, 300);
      ctx.lineTo(x, 1280);
      ctx.stroke();
      ctx.restore();
      for (let i = 1; i <= 3; i++) {
        const y = rowY(i) + 12;
        const closed = a(c(i + 1, 0.02), 0.4);
        ctx.save();
        ctx.globalAlpha = 0.55 + 0.45 * closed;
        fillRR(ctx, x - 26, y - 20, 52, 40, 6, closed > 0.5 ? hexA(D.ember, 0.9) : '#2A3540');
        strokeRR(ctx, x - 26, y - 20, 52, 40, 6, 'rgba(255,255,255,0.22)', 1.4);
        ctx.restore();
      }
    });

    bokeh(ctx, cam, { n: 5, a: 0.10 });
    vignette(ctx, 0.5);
  },
};
