import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure, labelChip,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { bokeh } from '../art/parts.mjs';
import { clamp, lerp, EASE, spring, rng, TAU, noise1 } from '../engine/anim.mjs';

const GOODS = ['BERAS', 'BBM', 'TIKET', 'SEWA', 'LISTRIK', 'OBAT', 'PAKAIAN', 'KOPI'];
const NUMBERS = ['0,6%', '3,2%', '+19,6%', '−1,4%', '22%', '4,1%', '8,3%', '+0,7%', '2,9%', '11,2%'];

export default {
  draw(ctx, t, scene) {
    const b = scene.captions.map((c) => c.words[0].start);
    const b0 = b[0] ?? 0.6;
    const b1 = b[1] ?? 3;
    const b2 = b[2] ?? 5;
    const b3 = b[3] ?? 7;

    // background
    ctx.fillStyle = '#05060B';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    const glow = radGrad(ctx, W / 2, 900, 0, 980, [
      [0, 'rgba(255,150,60,0.15)'],
      [0.5, 'rgba(255,110,40,0.05)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 1900);
    ctx.restore();

    // faint grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= W; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1800);
      ctx.stroke();
    }
    for (let y = 0; y <= 1800; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();

    // halo rings + rotating tick dial
    const cx = W / 2;
    const cy = 860;
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = hexA(C.amber, 0.13 - i * 0.03);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 240 + i * 120, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    const dialP = EASE.outCubic(clamp((t - b1 + 0.4) / 1.2));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.06);
    ctx.globalAlpha *= dialP * 0.75;
    for (let i = 0; i < 84; i++) {
      const a = (i / 84) * TAU;
      const major = i % 7 === 0;
      ctx.strokeStyle = hexA(major ? C.amber : C.bone, major ? 0.55 : 0.22);
      ctx.lineWidth = major ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 318, Math.sin(a) * 318);
      ctx.lineTo(Math.cos(a) * (major ? 348 : 334), Math.sin(a) * (major ? 348 : 334));
      ctx.stroke();
    }
    ctx.restore();

    // converging percentage chips before the reveal
    const conv = EASE.inCubic(clamp((t - b0 + 0.2) / Math.max(0.6, b1 - b0)));
    if (t < b1 + 0.5) {
      const r = rng(17);
      for (let i = 0; i < 16; i++) {
        const a = r() * TAU;
        const rr0 = 520 + r() * 460;
        const rad = lerp(rr0, 60, conv);
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad * 0.85;
        const al = (0.16 + r() * 0.4) * clamp((t - b0 + 0.35) / 0.5) * (1 - clamp((conv - 0.7) / 0.3));
        if (al <= 0.001) continue;
        txt(ctx, NUMBERS[i % NUMBERS.length], x, y, {
          size: 30 + r() * 16, font: F.num6, color: hexA(r() > 0.5 ? C.bone : C.amber, al),
          align: 'center', alpha: 1, track: 1,
        });
      }
    }

    // CPI letters
    const word = 'CPI';
    const size = 430;
    ctx.save();
    ctx.font = `${size}px ${F.head}`;
    ctx.letterSpacing = '-14px';
    const widths = [...word].map((c) => ctx.measureText(c).width);
    ctx.restore();
    const gap = 6;
    const totalW = widths.reduce((a, c) => a + c, 0) + gap * 2;
    let lx = cx - totalW / 2;
    const baseline = cy + size * 0.35;
    [...word].forEach((ch, i) => {
      const p = spring(clamp((t - b1 - i * 0.07) / 0.75) * 1.15, 12, 0.6);
      if (p <= 0.002) {
        lx += widths[i] + gap;
        return;
      }
      const h = size * clamp(p);
      ctx.save();
      ctx.beginPath();
      ctx.rect(lx - 30, baseline - h, widths[i] + 60, h);
      ctx.clip();
      ctx.font = `${size}px ${F.head}`;
      ctx.letterSpacing = '-14px';
      const grad = linGrad(ctx, 0, baseline - size, 0, baseline, [
        [0, '#FFF7EA'],
        [0.55, C.bone],
        [1, '#E8A85E'],
      ]);
      ctx.fillStyle = grad;
      ctx.shadowColor = hexA(C.amber, 0.4);
      ctx.shadowBlur = 34;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.fillText(ch, lx + (1 - p) * 30, baseline);
      ctx.restore();
      lx += widths[i] + gap;
    });

    // underline sweep
    const up = EASE.outExpo(clamp((t - b1 - 0.35) / 0.9));
    if (up > 0) {
      ctx.save();
      ctx.strokeStyle = hexA(C.amber, 0.85);
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - (totalW / 2) * up, cy + size * 0.44);
      ctx.lineTo(cx + (totalW / 2) * up, cy + size * 0.44);
      ctx.stroke();
      ctx.restore();
    }

    // subtitle
    const sp = clamp((t - b2) / 0.7);
    if (sp > 0) {
      ctx.save();
      ctx.globalAlpha *= EASE.outCubic(sp);
      tracking(ctx, 'INDEKS HARGA KONSUMEN', cx, cy + size * 0.44 + 78, {
        size: 32, font: F.num6, track: 11, align: 'center', color: hexA(C.bone, 0.75),
      });
      ctx.restore();
    }

    // orbiting goods chips
    const rxE = 604;
    const ryE = 470;
    GOODS.forEach((g, i) => {
      const st = b2 + 0.25 + i * 0.11;
      const p = spring(clamp((t - st) / 0.7) * 1.2, 12, 0.62);
      if (p <= 0.002) return;
      const a = (i / GOODS.length) * TAU + 0.4 + t * 0.045;
      const x = cx + Math.cos(a) * rxE * (0.94 + 0.06 * p);
      const y = cy + Math.sin(a) * ryE * (0.94 + 0.06 * p);
      const depth = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(a));
      ctx.save();
      ctx.globalAlpha *= p * depth;
      labelChip(ctx, g, x, y, {
        size: 26, font: F.num6, track: 5, padX: 24, padY: 14,
        bg: 'rgba(10,12,19,0.78)', border: hexA(C.bone, 0.14),
        color: hexA(C.bone, 0.92), dot: true,
        dotColor: i % 3 === 0 ? C.amber : i % 3 === 1 ? C.mint : C.sky,
        shadow: 30,
      });
      ctx.restore();
    });

    // formula card
    const fp = spring(clamp((t - b3 + 0.1) / 0.8) * 1.1, 10, 0.68);
    if (fp > 0.002) {
      const cw = 1180;
      const chh = 220;
      const fx = (W - cw) / 2;
      const fy = 1450 + (1 - fp) * 120;
      ctx.save();
      ctx.globalAlpha *= clamp(fp * 1.6);
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 18;
      fillRR(ctx, fx, fy, cw, chh, 26, 'rgba(10,12,18,0.86)');
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      strokeRR(ctx, fx + 1, fy + 1, cw - 2, chh - 2, 26, hexA(C.bone, 0.14), 2);

      tracking(ctx, 'CARA ANGKA INI DIHITUNG', fx + 48, fy + 52, {
        size: 22, font: F.num6, track: 7, color: hexA(C.amber, 0.85),
      });

      txt(ctx, 'CPI  =', fx + 48, fy + 152, { size: 62, font: F.head, color: C.bone });
      const fx0 = fx + 300;
      const fx1 = fx + 880;
      txt(ctx, 'harga keranjang sekarang', fx0, fy + 118, { size: 34, font: F.med, color: hexA(C.bone, 0.92) });
      ctx.save();
      ctx.strokeStyle = hexA(C.bone, 0.5);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx0, fy + 140);
      ctx.lineTo(fx1, fy + 140);
      ctx.stroke();
      ctx.restore();
      txt(ctx, 'harga keranjang tahun lalu', fx0, fy + 182, { size: 34, font: F.med, color: hexA(C.bone, 0.7) });
      txt(ctx, '×  100', fx1 + 26, fy + 160, { size: 40, font: F.num6, color: C.amber });
      ctx.restore();
    }

    bokeh(ctx, t, { count: 10, alpha: 0.08, y0: 1500, y1: 1820, seed: 5 });
  },
};
