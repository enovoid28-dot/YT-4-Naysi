import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { U, ease, studio, bokeh } from './_uang.mjs';
import { ghosts } from '../engine/motion.mjs';

// 04 — ANGKA YANG DIPECAH
// The price built as physical acrylic tiles. Every digit is an object with a
// bevel and a shadow, so it can be taken away. What is left standing is the
// digit the decision is actually made on.

const DIGITS = ['1', '.', '2', '0', '0', '.', '0', '0', '0'];
const DW = 138;
const DOTW = 44;
const GAP = 12;
const widths = DIGITS.map((d) => (d === '.' ? DOTW : DW));
const totalW = widths.reduce((a, b) => a + b, 0) + GAP * (DIGITS.length - 1);
const X0 = (W - totalW) / 2;
const CY = 900;

const tiles = (() => {
  let x = X0;
  return DIGITS.map((d, i) => {
    const w = widths[i];
    const t = { d, i, w, x };
    x += w + GAP;
    return t;
  });
})();

function acrTile(ctx, x, y, w, h, a, { glow = 0, accent = U.bone } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  fillRR(ctx, x, y, w, h, 16, 'rgba(16,24,36,0.9)');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, x, y, x + w * 0.4, y + h, [[0, 'rgba(190,215,240,0.16)'], [0.45, 'rgba(120,150,185,0.06)'], [1, 'rgba(60,80,105,0.10)']]);
  fillRR(ctx, x, y, w, h, 16, ctx.fillStyle);
  strokeRR(ctx, x, y, w, h, 16, hexA(accent, 0.16 + glow * 0.5), 1.6);
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + 8, [[0, 'rgba(255,255,255,0.28)'], [1, 'rgba(255,255,255,0)']]);
  ctx.fillRect(x + 10, y + 2, w - 20, 6);
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    const focus = ease.inOut(clamp((t - 3.55) / 0.9));
    studio(ctx, { t, glow: U.amber, glowX: W * 0.5, glowY: 640, glowA: 0.10 + focus * 0.05, horizon: 1300 });
    bokeh(ctx, t, { a: 0.7 });

    const ha = a(0.02, 0.5);
    tracking(ctx, 'PERSEPSI · NILAI', 104, 200, { size: 24, font: F.mono6, track: 6, color: hexA(U.bone, 0.45), alpha: ha });
    tracking(ctx, 'SATU ANGKA · DUA BACAAN', W - 104, 200, { size: 24, font: F.mono6, track: 6, color: hexA(U.amber, 0.55), align: 'right', alpha: ha });

    const TH = 236;
    const ty = CY - TH / 2;

    tiles.forEach((tl, i) => {
      const drop = ease.out(clamp((t - 0.32 - i * 0.05) / 0.7));
      if (drop <= 0.001) return;
      const isFirst = i === 0;
      const fallStart = 3.95 + (DIGITS.length - i) * 0.045;
      const fall = clamp((t - fallStart) / 0.75);
      if (fall >= 1 && !isFirst) return;

      const sep = ease.out(clamp((t - 2.15) / 0.7));
      const extra = (i - 4) * 10 * sep;
      let x = tl.x + extra;
      let y = ty - (1 - drop) * 150 + Math.sin(t * 1.15 + i * 0.6) * 5 * drop;
      let scale = 1;
      let rot = (i - 4) * 0.004 * sep;

      if (isFirst) {
        x = lerp(x, W / 2 - (DW * 1.75) / 2, focus);
        y = lerp(y, CY - (TH * 1.75) / 2 - 40, focus);
        scale = lerp(1, 1.75, focus);
      } else if (fall > 0) {
        y += 900 * fall * fall;
        rot += (i % 2 ? 0.35 : -0.3) * fall;
      }

      const alpha = (isFirst ? 1 : 1 - fall) * clamp(drop * 2.4) * (isFirst ? 1 : 1 - focus * 0.35);
      const glow = isFirst ? focus : 0;

      ctx.save();
      ctx.translate(x + tl.w / 2, y + TH / 2);
      ctx.rotate(rot);
      ctx.translate(-(x + tl.w / 2), -(y + TH / 2));
      if (isFirst && focus > 0.2) {
        ctx.save();
        ctx.shadowColor = hexA(U.amber, 0.35 * focus);
        ctx.shadowBlur = 90 * focus;
        fillRR(ctx, x - 10, y - 10, tl.w + 20, TH + 20, 20, 'rgba(245,178,60,0.05)');
        ctx.restore();
      }
      if (fall > 0.02 && fall < 0.7) {
        ghosts(ctx, { dx: 0, dy: -12, n: 2, spread: 1.5, alpha: 0.10 }, () => acrTile(ctx, x, y, tl.w, TH, alpha * 0.4));
      }
      acrTile(ctx, x, y, tl.w, TH, alpha, { glow, accent: isFirst ? U.amber : U.bone });
      const size = (tl.d === '.' ? 150 : 158) * scale;
      txt(ctx, tl.d, x + tl.w / 2, y + TH / 2 + size * 0.36, {
        size, font: F.num, color: isFirst ? U.amberHi : U.bone, align: 'center',
        alpha: alpha * (isFirst ? 1 : 0.92), track: -3,
      });
      ctx.restore();
    });

    const ga = a(1.1, 0.6) * (1 - clamp((t - 2.2) / 0.6) * 0.8);
    if (ga > 0.01) {
      ctx.save();
      ctx.globalAlpha = ga * 0.5;
      ctx.strokeStyle = hexA(U.bone, 0.25);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(X0, ty + TH + 34);
      ctx.lineTo(X0 + 42, ty + TH + 34);
      ctx.moveTo(X0 + totalW, ty + TH + 34);
      ctx.lineTo(X0 + totalW - 42, ty + TH + 34);
      ctx.stroke();
      ctx.restore();
    }

    const la = a(4.55, 0.5);
    if (la > 0.01) {
      const yy = CY + 250;
      ctx.save();
      ctx.globalAlpha = la;
      tracking(ctx, 'ANGKA PERTAMA', W / 2, yy, { size: 26, font: F.mono6, track: 8, color: U.amber, align: 'center' });
      const uw = 320 * ease.out(clamp((t - 4.7) / 0.5));
      ctx.fillStyle = hexA(U.amber, 0.55);
      ctx.fillRect(W / 2 - uw / 2, yy + 22, uw, 3);
      ctx.restore();
    }

    const ta = a(6.15, 0.55);
    if (ta > 0.01) {
      const yy = CY + 330;
      ctx.save();
      ctx.globalAlpha = ta * 0.9;
      tracking(ctx, 'TOTAL YANG KAMU LEWATI', W / 2, yy - 62, { size: 22, font: F.mono6, track: 6, color: hexA(U.bone, 0.40), align: 'center' });
      txt(ctx, 'Rp 1.200.000', W / 2, yy + 6, { size: 76, font: F.num, color: hexA(U.bone, 0.52), align: 'center', track: -2 });
      ctx.restore();
      const sk = a(6.9, 0.45);
      if (sk > 0.01) {
        ctx.save();
        ctx.globalAlpha = sk * 0.8;
        ctx.strokeStyle = U.ember;
        ctx.lineWidth = 5;
        const ww = 360 * ease.out(sk);
        ctx.beginPath();
        ctx.moveTo(W / 2 - ww / 2, yy - 26);
        ctx.lineTo(W / 2 + ww / 2, yy - 34);
        ctx.stroke();
        if (sk > 0.6) {
          const w2 = 320 * clamp((sk - 0.6) / 0.4);
          ctx.beginPath();
          ctx.moveTo(W / 2 - w2 / 2, yy - 12);
          ctx.lineTo(W / 2 + w2 / 2, yy - 18);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    const pa = a(8.0, 0.55);
    if (pa > 0.01) {
      const yy = 1520;
      const cw = 104;
      const gap = 10;
      const total = 10 * cw + 9 * gap;
      let xx = (W - total) / 2;
      ctx.save();
      ctx.globalAlpha = pa;
      for (let i = 0; i < 10; i++) {
        const p = clamp((t - 8.0 - i * 0.055) / 0.36);
        if (p <= 0.001) continue;
        ctx.save();
        ctx.globalAlpha = pa * p;
        fillRR(ctx, xx, yy - 16 * (1 - p), cw, 54, 8, 'rgba(246,241,230,0.09)');
        strokeRR(ctx, xx, yy - 16 * (1 - p), cw, 54, 8, hexA(U.amber, 0.45), 1.2);
        txt(ctx, '120.000', xx + cw / 2, yy + 26 - 16 * (1 - p), { size: 17, font: F.mono6, color: hexA(U.bone, 0.85), align: 'center' });
        ctx.restore();
        xx += cw + gap;
      }
      txt(ctx, '10 × 120.000', W / 2, yy + 108, { size: 30, font: F.mono6, color: hexA(U.bone, 0.5), align: 'center', track: 2, alpha: pa });
      ctx.restore();
    }
  },
};
