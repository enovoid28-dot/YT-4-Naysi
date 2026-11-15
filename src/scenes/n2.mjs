import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, TAU } from '../engine/anim.mjs';
import { U, ease, studio, paper, receiptLine, stamp, penCircle, inkBarcode, bokeh } from './_uang.mjs';

// 02 — BUNGA YANG KECIL
// A receipt printer on a dark table prints the actual arithmetic. The number is
// quoted per month because per month it looks small; the machine prints the
// year underneath it, and a red pen does the multiplication by hand.

const RW = 916;
const RX = (W - RW) / 2;
const SLOT = 372;

const LINES = [
  { y: 96, kind: 'head', left: 'NAYSI STORE', right: '21:04' },
  { y: 136, kind: 'sm', left: 'JL. KEMANG 12 · JAKARTA', right: 'KASIR 03' },
  { y: 176, kind: 'rule' },
  { y: 226, kind: 'row', left: 'SEPATU LARI 4', right: '1.200.000' },
  { y: 274, kind: 'row', left: 'BIAYA PENANGANAN 1%', right: '12.000' },
  { y: 322, kind: 'row', left: 'BUNGA 0% (PROMO)', right: '0' },
  { y: 370, kind: 'rule' },
  { y: 420, kind: 'rowb', left: 'DIBAYAR HARI INI', right: '120.000' },
  { y: 470, kind: 'sm', left: 'SISA 9 KALI · JATUH TEMPO TGL 5', right: '' },
  { y: 510, kind: 'rule' },
  { y: 566, kind: 'sm', left: 'BUNGA NORMAL', right: '2,95% / BLN' },
  { y: 640, kind: 'big', text: '× 12 BULAN' },
  { y: 742, kind: 'huge', text: '35,4% / TAHUN' },
  { y: 800, kind: 'sm', left: 'BUNGA EFEKTIF 41,7% / TAHUN', right: '' },
];

const printAt = (i) => 0.55 + i * 0.42;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    studio(ctx, { t, glow: U.amber, glowX: W * 0.5, glowY: 300, glowA: 0.12, horizon: 1560 });
    bokeh(ctx, t, { a: 0.8 });

    const ha = a(0.02, 0.5);
    tracking(ctx, 'BUKTI PEMBAYARAN', 104, 190, { size: 24, font: F.mono6, track: 6, color: hexA(U.bone, 0.45), alpha: ha });
    tracking(ctx, 'BUNGA · PER BULAN', W - 104, 190, { size: 24, font: F.mono6, track: 6, color: hexA(U.amber, 0.60), align: 'right', alpha: ha });

    const drop = ease.expo(clamp((t - 0.05) / 0.75));
    const hy = 196 - (1 - drop) * 70;
    const hx = RX - 58;
    const hw = RW + 116;
    const hh = 196;
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * drop;
    const g = linGrad(ctx, 0, hy, 0, hy + hh, [[0, '#2B3442'], [0.5, '#141C27'], [1, '#0B1119']]);
    fillRR(ctx, hx, hy, hw, hh, 26, g);
    strokeRR(ctx, hx, hy, hw, hh, 26, 'rgba(200,220,240,0.18)', 2);
    fillRR(ctx, hx + 26, hy + 22, hw - 52, 54, 12, 'rgba(255,255,255,0.05)');
    tracking(ctx, 'NAYSI · PRINTER', hx + 52, hy + 58, { size: 20, font: F.mono6, track: 5, color: hexA(U.bone, 0.45) });
    const pulse = 0.45 + 0.55 * Math.abs(Math.sin(t * 3.1));
    ctx.save();
    ctx.shadowColor = hexA(U.mint, 0.9);
    ctx.shadowBlur = 22 * pulse;
    ctx.fillStyle = hexA(U.mint, 0.55 + 0.4 * pulse);
    ctx.beginPath();
    ctx.arc(hx + hw - 74, hy + 49, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
    fillRR(ctx, hx + 40, hy + hh - 46, hw - 80, 16, 8, '#03060A');
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(hx + 40, hy + hh - 50, hw - 80, 8);
    ctx.restore();

    const feed = 470 + clamp((t - 0.30) / 7.2) * 1030;
    const paperH = Math.min(1190, feed);
    if (paperH > 4) {
      const sway = Math.sin(t * 0.9) * 3.5;
      ctx.save();
      ctx.translate(sway, 0);
      paper(ctx, RX, SLOT - 10, RW, paperH + 30, { a: 1, torn: paperH < 1180 });
      ctx.fillStyle = linGrad(ctx, 0, SLOT - 10, 0, SLOT + 90, [[0, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]);
      ctx.fillRect(RX, SLOT - 10, RW, 100);

      ctx.save();
      ctx.beginPath();
      ctx.rect(RX, SLOT, RW, Math.max(0, paperH));
      ctx.clip();

      LINES.forEach((ln, i) => {
        const p = clamp((t - printAt(i)) / 0.16);
        if (p <= 0) return;
        const y = SLOT + 30 + ln.y;
        const a2 = p;
        if (ln.kind === 'rule') {
          ctx.save();
          ctx.globalAlpha = a2 * 0.5;
          ctx.fillStyle = U.paperInk;
          ctx.fillRect(RX + 55, y, (RW - 110) * ease.out(p), 1.6);
          ctx.restore();
          return;
        }
        if (ln.kind === 'head') {
          txt(ctx, ln.left, RX + 55, y, { size: 30, font: F.mono6, color: U.paperInk, alpha: a2, track: 3 });
          txt(ctx, ln.right, RX + RW - 55, y, { size: 22, font: F.mono6, color: hexA(U.paperInk, 0.55), align: 'right', alpha: a2 });
          return;
        }
        if (ln.kind === 'sm') {
          txt(ctx, ln.left, RX + 55, y, { size: 22, font: F.mono, color: hexA(U.paperInk, 0.62), alpha: a2, track: 1.5 });
          if (ln.right) txt(ctx, ln.right, RX + RW - 55, y, { size: 22, font: F.mono6, color: hexA(U.paperInk, 0.7), align: 'right', alpha: a2 });
          return;
        }
        if (ln.kind === 'row' || ln.kind === 'rowb') {
          receiptLine(ctx, RX + 55, y, RW - 110, ln.left, ln.right, {
            a: a2, size: ln.kind === 'rowb' ? 34 : 28, color: U.paperInk,
            dim: ln.kind === 'rowb' ? 0.95 : 0.6, bold: ln.kind === 'rowb',
          });
          return;
        }
        if (ln.kind === 'big') {
          txt(ctx, ln.text, RX + 55, y, { size: 46, font: F.mono6, color: hexA(U.paperInk, 0.75), alpha: a2, track: 2 });
          return;
        }
        if (ln.kind === 'huge') {
          const pop = 0.94 + 0.06 * ease.out(p);
          ctx.save();
          ctx.translate(RX + 55, y - 20);
          ctx.scale(pop, pop);
          ctx.translate(-(RX + 55), -(y - 20));
          txt(ctx, ln.text, RX + 55, y, { size: 74, font: F.num, color: U.ember, alpha: a2, track: -1.5 });
          ctx.restore();
        }
      });

      penCircle(ctx, RX + RW - 55 - 78, SLOT + 30 + 566 - 8, 92, 26, clamp((t - 5.6) / 0.5), { color: U.ember, lw: 5, a: 0.9 });
      ctx.restore();
      ctx.restore();
    }

    const sp = clamp((t - 7.55) / 0.34);
    if (sp > 0) {
      const sc = 1.55 - 0.55 * ease.out(sp);
      stamp(ctx, 'SEWA', RX + RW / 2 + 40, SLOT + 900, {
        a: sp * 0.95, rot: -0.09, size: 66, color: U.ember, scale: sc, w: 520, h: 168,
        sub: 'BUNGA · BIAYA · DENDA',
      });
      if (sp >= 1) {
        const q = clamp((t - 7.9) / 0.5);
        ctx.save();
        ctx.globalAlpha = (1 - q) * 0.3;
        ctx.strokeStyle = U.ember;
        ctx.lineWidth = 3;
        ctx.strokeRect(RX + RW / 2 - 300 - q * 40, SLOT + 900 - 124 - q * 16, 600 + q * 80, 248 + q * 32);
        ctx.restore();
      }
    }
  },
};
