import { W, H, txt, hexA, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, TAU, noise1 } from '../engine/anim.mjs';
import { U, ease, studio, contact, paper, receiptLine, stamp, inkBarcode, bokeh } from './_uang.mjs';

// 03 — SATU HARI TERLAMBAT
// A bill lying on the table. One day late and a 5% penalty lands on the whole
// bill — the stamp is physical, the dust moves, the paper flinches. Then two
// months of interest are struck out beside it: the fee ate them whole.

const PW = 940;
const PX = (W - PW) / 2;
const PY = 372;
const PH = 940;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    studio(ctx, { t, glow: U.ember, glowX: W * 0.55, glowY: 700, glowA: 0.10, horizon: 1470 });
    bokeh(ctx, t, { a: 0.75 });

    const ha = a(0.02, 0.5);
    tracking(ctx, 'TAGIHAN · JATUH TEMPO', 104, 190, { size: 24, font: F.mono6, track: 6, color: hexA(U.bone, 0.45), alpha: ha });
    tracking(ctx, 'LEWAT 1 HARI', W - 104, 190, { size: 24, font: F.mono6, track: 6, color: hexA(U.ember, 0.75), align: 'right', alpha: ha });

    const hit = clamp((t - 3.42) / 0.9);
    const shake = hit > 0 && hit < 1 ? Math.sin(hit * 42) * 7 * (1 - hit) : 0;
    const shakeY = hit > 0 && hit < 1 ? Math.cos(hit * 37) * 5 * (1 - hit) : 0;

    const land = ease.expo(clamp((t - 0.12) / 0.8));
    const py = PY + (1 - land) * 70;
    contact(ctx, W / 2, py + PH + 18, 380, 52, 0.5 * land);

    ctx.save();
    ctx.translate(shake, shakeY);
    paper(ctx, PX, py, PW, PH, { a: land, torn: false, radius: 8 });

    const x = PX + 66;
    const w = PW - 132;

    const rows = [
      { at: 0.55, draw: () => {
        tracking(ctx, 'NAYSI STORE · TAGIHAN', x, py + 92, { size: 22, font: F.mono6, track: 5, color: hexA(U.paperInk, 0.55) });
        txt(ctx, '#0041', x + w, py + 92, { size: 22, font: F.mono6, color: hexA(U.paperInk, 0.4), align: 'right' });
      } },
      { at: 0.75, draw: () => {
        ctx.fillStyle = hexA(U.paperInk, 0.18);
        ctx.fillRect(x, py + 118, w, 1.6);
        txt(ctx, 'SEPATU LARI 4', x, py + 176, { size: 34, font: F.mono6, color: U.paperInk, track: 1 });
        txt(ctx, 'Rp 1.200.000', x + w, py + 176, { size: 34, font: F.mono6, color: U.paperInk, align: 'right' });
      } },
      { at: 1.0, draw: () => {
        receiptLine(ctx, x, py + 232, w, 'BIAYA PENANGANAN 1%', '12.000', { size: 24, dim: 0.55 });
        receiptLine(ctx, x, py + 276, w, 'BUNGA 10 KALI', '354.000', { size: 24, dim: 0.55 });
        ctx.fillStyle = hexA(U.paperInk, 0.18);
        ctx.fillRect(x, py + 310, w, 1.6);
      } },
      { at: 1.2, draw: () => {
        txt(ctx, 'TOTAL TAGIHAN', x, py + 372, { size: 28, font: F.mono6, color: hexA(U.paperInk, 0.7), track: 2 });
        txt(ctx, 'Rp 1.566.000', x + w, py + 384, { size: 52, font: F.num, color: U.paperInk, align: 'right', track: -1 });
      } },
      { at: 1.45, draw: () => {
        fillRR(ctx, x, py + 440, w, 132, 10, 'rgba(26,32,41,0.06)');
        tracking(ctx, 'JATUH TEMPO', x + 28, py + 486, { size: 20, font: F.mono6, track: 5, color: hexA(U.paperInk, 0.55) });
        txt(ctx, '05', x + 28, py + 552, { size: 62, font: F.num, color: U.paperInk, track: -1 });
        txt(ctx, 'OKTOBER', x + 132, py + 552, { size: 26, font: F.mono6, color: hexA(U.paperInk, 0.6), track: 3 });
        const lateA = a(2.35, 0.45);
        if (lateA > 0.01) {
          ctx.save();
          ctx.globalAlpha = lateA;
          fillRR(ctx, x + w - 300, py + 470, 268, 74, 8, hexA(U.ember, 0.12));
          strokeRR(ctx, x + w - 300, py + 470, 268, 74, 8, hexA(U.ember, 0.7), 2);
          txt(ctx, 'TELAT', x + w - 166, py + 500, { size: 20, font: F.mono6, color: hexA(U.ember, 0.8), align: 'center', track: 4 });
          txt(ctx, '1 HARI', x + w - 166, py + 534, { size: 34, font: F.head, color: U.ember, align: 'center', track: 2 });
          ctx.restore();
        }
      } },
      { at: 1.7, draw: () => {
        inkBarcode(ctx, x, py + PH - 128, 300, 62, { a: 0.75 });
        txt(ctx, '0041 8830 2214', x, py + PH - 48, { size: 20, font: F.mono, color: hexA(U.paperInk, 0.45), track: 3 });
        txt(ctx, 'SIMPAN STRUK INI', x + w, py + PH - 48, { size: 20, font: F.mono, color: hexA(U.paperInk, 0.35), align: 'right', track: 2 });
      } },
    ];

    for (const r of rows) {
      if (t < r.at) continue;
      ctx.save();
      ctx.globalAlpha = a(r.at, 0.3);
      r.draw();
      ctx.restore();
    }

    const sp = clamp((t - 3.42) / 0.30);
    if (sp > 0) {
      for (let i = 0; i < 22; i++) {
        const ang = (i / 22) * TAU + noise1(i) * 0.5;
        const rad = 210 + sp * 190 + noise1(i + 9) * 90;
        const alpha = Math.max(0, 1 - sp) * 0.5;
        if (alpha <= 0.01) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(240,228,206,0.75)';
        ctx.beginPath();
        ctx.arc(W / 2 + Math.cos(ang) * rad, py + 706 + Math.sin(ang) * rad * 0.45, 3 + noise1(i + 3) * 4, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      const sc = 2.05 - 1.05 * ease.out(sp);
      stamp(ctx, '5%', W / 2 - 10, py + 706, {
        a: clamp(sp * 3) * 0.96, rot: -0.075, size: 150, color: U.ember, scale: sc,
        w: 600, h: 218, sub: 'DARI SELURUH TAGIHAN',
      });
      if (sp >= 1) {
        const q = clamp((t - 3.72) / 0.7);
        ctx.save();
        ctx.globalAlpha = (1 - q) * 0.3;
        ctx.strokeStyle = U.ember;
        ctx.lineWidth = 4;
        ctx.strokeRect(W / 2 - 10 - 300 - q * 60, py + 706 - 109 - q * 26, 600 + q * 120, 218 + q * 52);
        ctx.restore();
      }
    }

    const ta = a(5.55, 0.5);
    if (ta > 0.01) {
      const ty = 1520;
      tracking(ctx, '5% SETARA', 300, ty - 62, { size: 21, font: F.mono6, track: 5, color: hexA(U.bone, 0.42), alpha: ta });
      const pills = [
        { label: 'BUNGA BULAN 1', x: 300, at: 5.7 },
        { label: 'BUNGA BULAN 2', x: 610, at: 5.85 },
      ];
      for (const pl of pills) {
        const p = a(pl.at, 0.4);
        if (p <= 0.01) continue;
        const pw = 276;
        ctx.save();
        ctx.globalAlpha = p * ta;
        fillRR(ctx, pl.x, ty - 34, pw, 62, 10, 'rgba(246,241,230,0.07)');
        strokeRR(ctx, pl.x, ty - 34, pw, 62, 10, hexA(U.bone, 0.22), 1.5);
        txt(ctx, pl.label, pl.x + pw / 2, ty + 6, { size: 20, font: F.mono6, color: hexA(U.bone, 0.7), align: 'center', track: 3 });
        ctx.restore();
        const sk = a(pl.at + 0.45, 0.35);
        if (sk > 0.01) {
          ctx.save();
          ctx.globalAlpha = sk * ta;
          ctx.strokeStyle = U.ember;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(pl.x - 6, ty - 2);
          ctx.lineTo(pl.x - 6 + (pw + 12) * ease.out(sk), ty - 2);
          ctx.stroke();
          ctx.restore();
        }
      }
      const eq = a(6.4, 0.5);
      if (eq > 0.01) {
        ctx.save();
        ctx.globalAlpha = eq * 0.85;
        txt(ctx, '=', 916, ty + 8, { size: 46, font: F.num, color: hexA(U.bone, 0.5), align: 'center' });
        txt(ctx, '5%', 1010, ty + 12, { size: 54, font: F.num, color: U.ember, track: -1 });
        ctx.restore();
      }
    }

    ctx.restore();
  },
};
