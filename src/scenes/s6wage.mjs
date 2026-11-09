import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure, labelChip,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { bokeh } from '../art/parts.mjs';
import { clamp, lerp, EASE, spring, rng, TAU, noise1 } from '../engine/anim.mjs';

const BASE = 1470;
const TOP = 470;
const PX = (pct) => BASE - (pct / 1.6) * (BASE - TOP);

export default {
  draw(ctx, t, scene) {
    const g = scene.captions;
    const b0 = g[0]?.words[0].start ?? 0.3;
    const b1 = (g[0]?.words.find((w) => /empat/i.test(w.text))?.start ?? 3.0) + 0.15;
    const b2 = g[1]?.words[0].start ?? 5.5;

    // background with perspective grid
    const bg = linGrad(ctx, 0, 0, 0, 1800, [
      [0, '#070910'],
      [0.5, '#0C1018'],
      [1, '#05060A'],
    ]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, 1800);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const glow = radGrad(ctx, W * 0.5, BASE, 0, 900, [
      [0, 'rgba(90,130,180,0.12)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 200, W, 1700);
    ctx.restore();

    // header
    const hp = EASE.outCubic(clamp(t / 0.7));
    ctx.save();
    ctx.globalAlpha *= hp;
    tracking(ctx, 'PERTUMBUHAN 12 BULAN', M, 330, {
      size: 24, font: F.num6, track: 7, color: hexA(C.bone, 0.5),
    });
    txt(ctx, 'Upah vs Harga', M, 430, { size: 76, font: F.head, color: C.bone, track: -1 });
    ctx.restore();

    // grid
    ctx.save();
    [0, 0.4, 0.8, 1.2, 1.6].forEach((p) => {
      const y = PX(p);
      ctx.strokeStyle = p === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)';
      ctx.lineWidth = p === 0 ? 2 : 1.5;
      ctx.beginPath();
      ctx.moveTo(M, y);
      ctx.lineTo(W - M, y);
      ctx.stroke();
      tracking(ctx, `${p.toFixed(1).replace('.', ',')}%`, W - M, y - 14, {
        size: 20, font: F.num6, track: 2, align: 'right', color: hexA(C.bone, 0.3),
      });
    });
    ctx.restore();

    const bars = [
      { x: 300, w: 230, pct: 1.3, color: C.mint, glowc: '#4CE0B3', label: 'UPAH', at: b0 + 0.15 },
      { x: 810, w: 230, pct: 1.4, color: C.amber, glowc: '#FFB03A', label: 'HARGA', at: b0 + 0.45 },
    ];

    bars.forEach((bar) => {
      const p = spring(clamp((t - bar.at) / 1.15) * 1.0, 8.5, 0.5);
      if (p <= 0.002) return;
      const h = (PX(0) - PX(bar.pct)) * p;
      const x = bar.x;
      const y = BASE - h;
      ctx.save();
      // glow
      ctx.shadowColor = hexA(bar.glowc, 0.55);
      ctx.shadowBlur = 26;
      const g2 = linGrad(ctx, 0, y, 0, BASE, [
        [0, bar.color],
        [0.55, hexA(bar.color, 0.65)],
        [1, hexA(bar.color, 0.18)],
      ]);
      fillRR(ctx, x, y, bar.w, h + 2, [14, 14, 4, 4], g2);
      ctx.restore();

      // top cap highlight
      ctx.save();
      ctx.globalAlpha = 0.85;
      fillRR(ctx, x, y, bar.w, 6, 3, '#FFFDF6');
      ctx.restore();

      // label
      tracking(ctx, bar.label, x + bar.w / 2, BASE + 48, {
        size: 26, font: F.num6, track: 7, align: 'center', color: hexA(C.bone, 0.7),
      });

      // value
      const val = lerp(0, bar.pct, EASE.outCubic(clamp((t - bar.at - 0.1) / 1.1)));
      txt(ctx, `+${val.toFixed(1).replace('.', ',')}%`, x + bar.w / 2, y - 34, {
        size: 56, font: F.num, color: bar.color, align: 'center', glowBlur: 18,
      });
    });

    // gap callout
    const gp = spring(clamp((t - b1 - 0.5) / 0.8) * 1.15, 11, 0.6);
    if (gp > 0.002) {
      const y1 = PX(1.3);
      const y2 = PX(1.4);
      ctx.save();
      ctx.globalAlpha *= clamp(gp * 1.6);
      ctx.strokeStyle = hexA(C.red, 0.8);
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(300 + 230, y1);
      ctx.lineTo(810, y1);
      ctx.stroke();
      ctx.setLineDash([]);
      // bracket
      ctx.beginPath();
      ctx.moveTo(1130, y2);
      ctx.lineTo(1170, y2);
      ctx.lineTo(1170, y1);
      ctx.lineTo(1130, y1);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha *= clamp(gp * 1.6);
      const cxbadge = 1180;
      ctx.translate(cxbadge, (y1 + y2) / 2);
      ctx.scale(gp, gp);
      fillRR(ctx, 10, -46, 176, 92, 14, 'rgba(255,75,59,0.14)');
      strokeRR(ctx, 10, -46, 176, 92, 14, hexA(C.red, 0.7), 2);
      txt(ctx, '−0,1%', 98, 16, { size: 40, font: F.num, color: C.red, align: 'center' });
      ctx.restore();
    }

    // takeaway
    const tp = spring(clamp((t - b1 - 1.1) / 0.8) * 1.1, 10, 0.62);
    if (tp > 0.002) {
      ctx.save();
      ctx.globalAlpha *= clamp(tp * 1.8);
      ctx.translate(W / 2, 1650);
      ctx.scale(lerp(0.9, 1, tp), lerp(0.9, 1, tp));
      labelChip(ctx, 'DAYA BELI TURUN', 0, 0, {
        size: 32, font: F.num, track: 4, padX: 34, padY: 18,
        bg: 'rgba(255,75,59,0.16)', border: hexA(C.red, 0.6), color: '#FFE3DE',
        dot: true, dotColor: C.red, radius: 14, shadow: 30,
      });
      ctx.restore();
    }

    // source
    ctx.save();
    ctx.globalAlpha *= 0.45 * EASE.outCubic(clamp((t - b2) / 0.8));
    tracking(ctx, 'SUMBER: BLS · ILUSTRASI', M, 2392, {
      size: 20, font: F.num6, track: 4, color: hexA(C.bone, 0.55),
    });
    ctx.restore();

    bokeh(ctx, t, { count: 8, alpha: 0.06, y0: 300, y1: 1700, seed: 21 });
  },
};
