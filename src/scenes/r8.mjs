import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, cassette, printCard, stampInk, kick, num, rule,
  typeLabel, thread, pin, footer,
} from './_arsip.mjs';

// 08 — BUKAN REKAMAN
// A tape, a print of a shopping centre corridor, and a red cross. The memory
// was never a recording; it was a sentence written over and over.

const MALL = (g, iw, ih, ox, oy) => {
  const g0 = g.createLinearGradient(ox, oy, ox, oy + ih);
  g0.addColorStop(0, '#33302D');
  g0.addColorStop(0.5, '#1B1918');
  g0.addColorStop(1, '#0B0A09');
  g.fillStyle = g0;
  g.fillRect(ox, oy, iw, ih);
  const cx = ox + iw * 0.5;
  const cy = oy + ih * 0.48;
  for (let i = 0; i < 8; i++) {
    const f = i / 8;
    const w = iw * (0.05 + f * 0.17);
    const y = cy - ih * (0.08 + f * 0.26);
    g.fillStyle = `rgba(255,246,216,${0.08 + f * 0.34})`;
    g.fillRect(cx - w / 2, y, w, ih * (0.006 + f * 0.010));
  }
  for (let i = 0; i < 10; i++) {
    const f = i / 10;
    const w = iw * (0.10 + f * 0.46);
    g.strokeStyle = `rgba(206,202,192,${0.08 + f * 0.10})`;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(cx - w / 2, oy + ih * (0.94 - f * 0.22));
    g.lineTo(cx + w / 2, oy + ih * (0.94 - f * 0.22));
    g.stroke();
  }
  [-1, 1].forEach((sgn) => {
    for (let i = 0; i < 4; i++) {
      const f = i / 4;
      const x0 = cx + sgn * iw * (0.52 - f * 0.36);
      const x1 = cx + sgn * iw * (0.52 - (f + 0.17) * 0.36);
      const y0 = cy - ih * (0.32 - f * 0.07);
      const y1 = oy + ih * (0.92 - f * 0.13);
      g.fillStyle = `rgba(30,32,34,${0.86 - f * 0.3})`;
      g.fillRect(Math.min(x0, x1), y0, Math.abs(x1 - x0), y1 - y0);
      g.fillStyle = `rgba(255,228,172,${0.05 + f * 0.18})`;
      g.fillRect(Math.min(x0, x1) + 4, y0 + 6, Math.abs(x1 - x0) - 8, (y1 - y0) * 0.3);
    }
  });
  const fx = cx + iw * 0.02;
  const fy = oy + ih * 0.82;
  g.fillStyle = 'rgba(12,10,9,0.92)';
  g.beginPath();
  g.ellipse(fx, fy - ih * 0.105, iw * 0.020, ih * 0.030, 0, 0, TAU);
  g.fill();
  g.fillStyle = 'rgba(158,40,27,0.88)';
  g.beginPath();
  g.moveTo(fx - iw * 0.030, fy);
  g.quadraticCurveTo(fx - iw * 0.034, fy - ih * 0.078, fx, fy - ih * 0.082);
  g.quadraticCurveTo(fx + iw * 0.034, fy - ih * 0.078, fx + iw * 0.030, fy);
  g.closePath();
  g.fill();
  for (let i = 0; i < 2200; i++) {
    g.fillStyle = `rgba(255,230,190,${Math.random() * 0.018})`;
    g.fillRect(ox + Math.random() * iw, oy + Math.random() * ih, 1.6, 1.6);
  }
};

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.34, lampY: 440, key: 'r8' });
    spot(ctx, W * 0.42, 560, 800, 0.13);

    // ── the tape
    const pc = A(t, 0.10, 1.0, ease.expo);
    if (pc > 0.01) {
      ctx.save();
      ctx.globalAlpha = pc;
      ctx.translate((1 - pc) * -90, 0);
      contact(ctx, 110, 640, 800, 160, 0.62);
      cassette(ctx, 108, 246, 800, { label: 'SISI A', sub: 'KENANGAN USIA 4', rot: -0.02 });
      ctx.restore();
    }

    const pr = A(t, c(1, 0.15), 1.2, ease.out);
    if (pr > 0.01) {
      ctx.save();
      ctx.globalAlpha = pr;
      thread(ctx, [[300, 690], [470, 748], [660, 700], [840, 752], [980, 690]], { p: pr, a: 0.85, lw: 3.2, sag: 14 });
      typeLabel(ctx, 'DITULIS ULANG SETIAP KALI DIINGAT', 108, 776, { size: 21 });
      ctx.restore();
    }

    // ── the print
    const pp = A(t, c(2, 0.10), 0.9, ease.out);
    if (pp > 0.01) {
      ctx.save();
      ctx.globalAlpha = pp;
      ctx.translate(0, (1 - pp) * 30);
      contact(ctx, 700, 1150, 400, 110, 0.6);
      printCard(ctx, 660, 690, 640, 490, { rot: 0.026, border: 18, art: MALL, caption: 'MAL, USIA 4' });
      pin(ctx, 980, 684, 0.7);
      ctx.restore();
    }

    // ── the number, and the cross
    const pn = A(t, c(3, 0.10), 0.8, ease.out);
    if (pn > 0.01) {
      ctx.save();
      ctx.globalAlpha = pn;
      rule(ctx, 104, 1180, 480, { a: 0.7 });
      kick(ctx, 'PESERTA YANG "INGAT" KEJADIAN PALSU', 104, 1236, { size: 20, color: K.dim, track: 4.5 });
      const cx2 = 190;
      const cy2 = 1330;
      const r0 = 78;
      ctx.strokeStyle = 'rgba(246,237,219,0.16)';
      ctx.lineWidth = 17;
      ctx.beginPath();
      ctx.arc(cx2, cy2, r0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = K.redHi;
      ctx.lineWidth = 17;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx2, cy2, r0, -Math.PI / 2, -Math.PI / 2 + TAU * 0.25 * pn);
      ctx.stroke();
      ctx.fillStyle = K.gold;
      ctx.beginPath();
      ctx.arc(cx2, cy2, 13, 0, TAU);
      ctx.fill();
      num(ctx, '25%', 320, 1396, { size: 132, color: K.redHi, track: -4 });
      ctx.restore();
    }

    // ── the verdict
    const ps = A(t, c(4, 0.10), 0.3, ease.out);
    if (ps > 0.01) {
      ctx.save();
      ctx.globalAlpha = ps;
      const x = 980;
      const y = 936;
      ctx.strokeStyle = hexA(K.redHi, 0.94);
      ctx.lineWidth = 17;
      ctx.lineCap = 'round';
      const L = 148 * ps;
      ctx.beginPath();
      ctx.moveTo(x - L, y - L);
      ctx.lineTo(x + L, y + L);
      ctx.moveTo(x + L, y - L);
      ctx.lineTo(x - L, y + L);
      ctx.stroke();
      ctx.restore();
      stampInk(ctx, 'TIDAK PERNAH TERJADI', 110, 1524, {
        size: 82, rot: -0.03, a: ps, color: K.red, padX: 28, padY: 18, track: 5, align: 'left',
      });
    }

    footer(ctx, { chapter: 'BUKAN REKAMAN' });
  },
};
