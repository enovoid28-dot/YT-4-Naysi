import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { U, ease, studio, contact, phone, sneaker, stub, bokeh, grp } from './_uang.mjs';
import { ghosts } from '../engine/motion.mjs';

// 01 — HARGA YANG DIPINJAM
// A checkout screen is the only place a loan is ever offered as a button. The
// phone sits on the table like an object; the tap is physical; the price then
// physically comes apart into ten small pieces.

const PW = 664;
const PH = 1246;
const PX = (W - PW) / 2;
const PY = 236;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    studio(ctx, { t, glow: U.cyan, glowX: W * 0.5, glowY: 620, glowA: 0.10, horizon: 1520 });
    bokeh(ctx, t, { a: 0.9 });

    const ha = a(0.04, 0.5);
    tracking(ctx, 'CHECKOUT · 21:04', 104, 210, { size: 24, font: F.mono6, track: 6, color: hexA(U.bone, 0.5), alpha: ha });
    tracking(ctx, '10 KALI · TANPA KARTU', W - 104, 210, { size: 24, font: F.mono6, track: 6, color: hexA(U.amber, 0.62), align: 'right', alpha: ha });

    const rise = ease.expo(clamp((t - 0.12) / 0.9));
    const py = PY + (1 - rise) * 90;
    const tilt = Math.sin(t * 0.5) * 0.004;
    contact(ctx, W / 2, py + PH + 26, 300, 44, 0.5 * rise);

    const sc = phone(ctx, PX, py, PW, PH, { a: 0.35 + 0.65 * rise, rot: tilt });
    ctx.save();
    ctx.beginPath();
    rr(ctx, sc.sx, sc.sy, sc.sw, sc.sh, sc.r);
    ctx.clip();
    ctx.fillStyle = linGrad(ctx, 0, sc.sy, 0, sc.sy + sc.sh, [[0, '#0E1926'], [1, '#080E16']]);
    ctx.fillRect(sc.sx, sc.sy, sc.sw, sc.sh);
    ctx.fillStyle = radGrad(ctx, sc.sx + sc.sw * 0.5, sc.sy + 180, 0, 520, [[0, 'rgba(140,190,245,0.14)'], [1, 'rgba(140,190,245,0)']]);
    ctx.fillRect(sc.sx, sc.sy, sc.sw, sc.sh);

    const sx = sc.sx + 44;
    const sw = sc.sw - 88;

    const sb = a(0.2, 0.4);
    txt(ctx, '21:04', sx, sc.sy + 96, { size: 26, font: F.mono6, color: hexA(U.bone, 0.75), alpha: sb });
    for (let i = 0; i < 3; i++) fillRR(ctx, sc.sx + sc.sw - 96 + i * 20, sc.sy + 84 - i * 5, 12, 12 + i * 5, 3, hexA(U.bone, 0.6 * sb));
    txt(ctx, 'PESANAN', sx, sc.sy + 176, { size: 30, font: F.mono6, color: hexA(U.bone, 0.62), track: 6, alpha: sb });
    ctx.fillStyle = hexA(U.bone, 0.10 * sb);
    ctx.fillRect(sx, sc.sy + 204, sw, 1.5);

    const pc = a(0.5, 0.7);
    if (pc > 0.01) {
      ctx.save();
      ctx.globalAlpha = pc;
      fillRR(ctx, sx, sc.sy + 240, sw, 470, 22, 'rgba(150,190,235,0.07)');
      strokeRR(ctx, sx, sc.sy + 240, sw, 470, 22, hexA(U.bone, 0.10), 1.5);
      ctx.fillStyle = radGrad(ctx, sx + sw / 2, sc.sy + 430, 0, 300, [[0, 'rgba(255,240,215,0.16)'], [1, 'rgba(255,240,215,0)']]);
      ctx.fillRect(sx + 10, sc.sy + 250, sw - 20, 450);
      sneaker(ctx, sx + sw / 2, sc.sy + 470, 1.58 * (0.94 + 0.06 * pc), { a: pc });
      fillRR(ctx, sx + 18, sc.sy + 262, 168, 44, 8, hexA(U.ember, 0.9));
      txt(ctx, 'PILIHAN', sx + 102, sc.sy + 292, { size: 20, font: F.mono6, color: '#0B0F16', align: 'center', track: 3 });
      ctx.restore();
    }

    const tp = a(0.85, 0.6);
    txt(ctx, 'SEPATU LARI · UK 42', sx, sc.sy + 790, { size: 28, font: F.mono6, color: hexA(U.bone, 0.55), track: 3, alpha: tp });
    txt(ctx, 'Lari Enom 4', sx, sc.sy + 846, { size: 42, font: F.head, color: U.bone, alpha: tp, track: -0.5 });

    const pcnt = ease.out(clamp((t - 1.05) / 1.15));
    const price = 700000 + (1200000 - 700000) * pcnt;
    txt(ctx, `Rp ${grp(price)}`, sx, sc.sy + 960, { size: 74, font: F.num, color: U.bone, alpha: tp, track: -2 });

    const ca = a(1.55, 0.55);
    if (ca > 0.01) {
      const tapP = clamp((t - 3.02) / 0.45);
      const press = tapP > 0 && tapP < 1 ? Math.sin(tapP * Math.PI) * 0.035 : 0;
      const by = sc.sy + 1010;
      ctx.save();
      ctx.translate(sx + sw * 0.72, by + 40);
      ctx.scale(1 - press, 1 - press);
      ctx.translate(-(sx + sw * 0.72), -(by + 40));
      ctx.globalAlpha *= ca;
      ctx.save();
      ctx.shadowColor = hexA(U.amber, 0.55);
      ctx.shadowBlur = 34 + (t > 3.02 ? 40 * (1 - clamp((t - 3.02) / 0.6)) : 0);
      fillRR(ctx, sx + sw * 0.44, by, sw * 0.56, 80, 14, U.amber);
      ctx.restore();
      txt(ctx, 'BAYAR NANTI', sx + sw * 0.72, by + 50, { size: 27, font: F.head, color: '#0B0F16', align: 'center', track: 2 });
      ctx.restore();

      ctx.save();
      ctx.globalAlpha *= ca;
      strokeRR(ctx, sx, by, sw * 0.40, 80, 14, hexA(U.bone, 0.22), 1.5);
      txt(ctx, 'BAYAR', sx + sw * 0.20, by + 50, { size: 24, font: F.mono6, color: hexA(U.bone, 0.62), align: 'center', track: 2 });
      ctx.restore();

      txt(ctx, 'DENGAN MENEKAN, KAMU SETUJU BUNGA 2,95%/BLN & DENDA 5%.', sx + sw * 0.5, by + 152, { size: 15, font: F.mono, color: hexA(U.bone, 0.30), align: 'center', alpha: ca });

      if (t > 3.02) {
        const cx = sx + sw * 0.72;
        const cy = by + 40;
        for (let k = 0; k < 3; k++) {
          const p = clamp((t - 3.02 - k * 0.14) / 0.7);
          if (p <= 0 || p >= 1) continue;
          ctx.save();
          ctx.globalAlpha = (1 - p) * 0.5;
          ctx.strokeStyle = U.amber;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 40 + p * 190, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    ctx.restore();

    const sp = (i) => ease.out(clamp((t - 3.55 - i * 0.028) / 0.55));
    const gx0 = (W - (10 * 117 + 9 * 6)) / 2;
    const gy0 = 1518;
    const cw = 117;
    const chh = 96;
    const gapx = 6;
    const originX = PX + PW * 0.72 + 40;
    const originY = py + 1010 + 40;

    for (let i = 0; i < 10; i++) {
      const p = sp(i);
      if (p <= 0.001) continue;
      const tx = gx0 + i * (cw + gapx);
      const ty = gy0;
      const arc = Math.sin(p * Math.PI) * (90 + (i % 5) * 12);
      const x = lerp(originX - cw / 2, tx, p);
      const y = lerp(originY, ty, p) - arc;
      const rot = (1 - p) * (i % 2 ? 0.4 : -0.34);
      const alpha = clamp(p * 2.2) * 0.97;
      ctx.save();
      ctx.translate(x + cw / 2, y + chh / 2);
      ctx.rotate(rot);
      ctx.translate(-(x + cw / 2), -(y + chh / 2));
      if (p < 0.92) {
        ghosts(ctx, { dx: -7 * (1 - p), dy: -4 * (1 - p), n: 2, spread: 1.4, alpha: 0.10 }, () => {
          stub(ctx, x, y, cw, chh, { a: alpha * 0.5, label: `KE-${i + 1}`, value: '120.000' });
        });
      }
      stub(ctx, x, y, cw, chh, { a: alpha, label: `KE-${String(i + 1).padStart(2, '0')}`, value: '120.000' });
      ctx.restore();
    }

    const la = a(5.5, 0.5);
    if (la > 0.01) {
      ctx.save();
      ctx.globalAlpha = la;
      const ly = gy0 + chh + 26;
      ctx.fillStyle = hexA(U.bone, 0.14);
      ctx.fillRect(gx0, ly, 10 * cw + 9 * gapx, 1.5);
      txt(ctx, '10 × 120.000', gx0, ly + 50, { size: 28, font: F.mono6, color: hexA(U.bone, 0.62), track: 2 });
      const tot = 1200000 * ease.out(clamp((t - 5.75) / 0.6));
      txt(ctx, `Rp ${grp(tot)}`, gx0 + 10 * cw + 9 * gapx, ly + 56, { size: 44, font: F.num, color: U.amber, align: 'right', track: -1 });
      ctx.restore();
    }
  },
};
