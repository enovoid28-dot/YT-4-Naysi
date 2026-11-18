import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, noise1, TAU } from '../engine/anim.mjs';
import {
  D, ease, cue, room, cone, motes, bokeh, meter, tokenPaper, spark, stamp, vignette, par,
} from './_daya.mjs';

// 01 — EMPAT POTONG
// A meter, a receipt, and the moment the receipt comes apart in four.
// The meter is the hero; the four slices are the argument.

const SLICES = [
  { k: 'ADMIN', v: '2.500', tone: D.bone },
  { k: 'PPJ', v: '2.400', tone: D.bone },
  { k: 'TARIF', v: '1.444,70', tone: D.bone },
  { k: 'LISTRIK', v: '65,8 kWh', tone: D.mint },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.5, glowY: 280, glowA: 0.20, horizon: 1250 });
    cone(ctx, W * 0.5, 300, 1280, 520, { a: 0.085, t, color: D.amber });
    motes(ctx, t, { n: 52, a: 0.55, top: 300, bottom: 1520 });

    // lamp
    par(ctx, cam, 0.35, () => {
      ctx.save();
      ctx.strokeStyle = 'rgba(214,228,240,0.16)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W * 0.5, 148);
      ctx.lineTo(W * 0.5, 250);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.shadowColor = hexA(D.amber, 0.9);
      ctx.shadowBlur = 120;
      ctx.fillStyle = D.amber;
      ctx.beginPath();
      ctx.arc(W * 0.5, 268, 26, 0, TAU);
      ctx.fill();
      ctx.restore();
    });

    // ── meter
    const mw = 760;
    const mx = (W - mw) / 2;
    const myIn = ease.expo(clamp((t - c(0, 0.05)) / 0.75));
    const my = 436 + (1 - myIn) * 70;
    const flip = ease.inOut(clamp((t - c(1, 0.05)) / 0.55));
    const flash = clamp(1 - Math.abs(t - c(1, 0.5)) / 0.32);
    par(ctx, cam, 0.75, () => {
      meter(ctx, mx, my, mw, t, {
        read: flip < 0.5 ? '100000' : '65,8',
        unit: flip < 0.5 ? 'Rp' : 'kWh',
        mode: flip < 0.5 ? 'PEMBELIAN' : 'SISA TOKEN',
        glow: 0.78 + 0.22 * flash,
        a: myIn,
      });
      spark(ctx, mx + mw * 0.5, my + mw * 0.66 + 34, clamp((t - c(1, 0.42)) / 0.28), { a: 0.55, size: 1.2 });
    });

    const capLabel = (txtStr, col, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      tracking(ctx, txtStr, mx - 4, my - 26, { size: 19, font: F.mono6, track: 4, color: col });
      ctx.restore();
    };
    if (a(c(0, 0.15), 0.5) * (1 - flip) > 0.01) capLabel('UANG KELUAR', hexA(D.bone, 0.35), a(c(0, 0.15), 0.5) * (1 - flip));
    if (a(c(1, 0.5), 0.4) > 0.01) capLabel('YANG MASUK KE METERAN', hexA(D.mint, 0.5), a(c(1, 0.5), 0.4));

    // ── receipt → four slices
    const pw = 476;
    const ph = 632;
    const px = 118;
    const pyIn = ease.expo(clamp((t - c(0, 0.2)) / 0.8));
    const py = 966 + (1 - pyIn) * 140;
    const split = ease.inOut(clamp((t - c(3, 0.03)) / 0.62));

    if (split < 0.99) {
      ctx.save();
      ctx.globalAlpha = 1 - split;
      ctx.translate(0, -split * 26);
      tokenPaper(ctx, px, py, pw, ph, { a: pyIn, rot: 0, t });
      ctx.restore();
    }

    if (split > 0.01) {
      const gap = 20;
      const sh = 148;
      const total = SLICES.length * sh + (SLICES.length - 1) * gap;
      const top = 966 + (632 - total) / 2;
      SLICES.forEach((S, i) => {
        const p = ease.out(clamp((t - c(3, 0.05 + i * 0.09)) / 0.5));
        const y = top + i * (sh + gap) - (1 - p) * 26;
        const x = px + p * (i * 10);
        const rot = p * (i % 2 === 0 ? -0.008 : 0.007);
        ctx.save();
        ctx.globalAlpha = p;
        ctx.translate(x + pw / 2, y + sh / 2);
        ctx.rotate(rot);
        ctx.translate(-(x + pw / 2), -(y + sh / 2));
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.62)';
        ctx.shadowBlur = 34;
        ctx.shadowOffsetY = 16;
        fillRR(ctx, x, y, pw, sh, 5, D.paper);
        ctx.restore();
        // edge shading of cut paper
        ctx.fillStyle = 'rgba(120,110,94,0.16)';
        ctx.fillRect(x + 2, y + 2, pw - 4, 2);
        ctx.fillRect(x + 2, y + sh - 4, pw - 4, 2);
        ctx.fillStyle = 'rgba(120,110,94,0.10)';
        for (let q = 0; q < 26; q++) {
          ctx.fillRect(x + 14 + q * 16, y + sh - 9, 7 + noise1(q + i) * 6, 2);
        }
        tracking(ctx, S.k, x + 28, y + 52, { size: 19, font: F.mono6, track: 4, color: 'rgba(21,23,27,0.5)' });
        txt(ctx, S.v, x + pw - 28, y + sh - 38, {
          size: i === 3 ? 52 : 56, font: i === 3 ? F.num : F.num6,
          color: i === 3 ? '#0E7A5F' : D.paperInk, align: 'right', track: -1.4,
        });
        ctx.restore();
      });
    }

    // money going in: six slips leave the receipt and vanish into the display
    par(ctx, cam, 0.55, () => {
      for (let i = 0; i < 6; i++) {
        const t0 = c(1, -0.1 + i * 0.12);
        const p = clamp((t - t0) / 0.85);
        if (p <= 0.02 || p >= 0.99) continue;
        const sx = px + 60 + (i % 3) * 120;
        const sy = py + 40;
        const ex = mx + mw * 0.34 + (i % 3) * 40;
        const ey = my + mw * 0.44;
        const x = lerp(sx, ex, p);
        const y = lerp(sy, ey, p) - Math.sin(p * Math.PI) * 120;
        ctx.save();
        ctx.globalAlpha = 0.9 * (1 - Math.pow(p, 3));
        ctx.translate(x, y);
        ctx.rotate(-0.2 + p * 0.5 + i * 0.1);
        fillRR(ctx, -34, -22, 68, 44, 3, '#DFD2B4');
        strokeRR(ctx, -30, -18, 60, 36, 2, 'rgba(90,70,40,0.35)', 1.6);
        txt(ctx, 'Rp', 0, 8, { size: 17, font: F.mono6, color: 'rgba(70,54,30,0.85)', align: 'center', track: 1 });
        ctx.restore();
      }
    });

    // the correction, flat and quiet, above the subtitle block
    const st = a(c(2, 0.05), 0.5);
    if (st > 0.01) stamp(ctx, 'BUKAN SALAH HITUNG', W / 2, 1712, { a: st * 0.85, rot: -0.012, color: D.volt, size: 23 });

    bokeh(ctx, cam, { n: 6, a: 0.12 });
    vignette(ctx, 0.52);
  },
};
