import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, kick, paperCard, stampInk, halftone, par, folio, rowItem, arrow,
} from './_kertas.mjs';

// 02 — TIGA PULUH SATU
// A ledger page, ruled three ways. The numbers arrive from the right margin the
// way a clerk would write them in.

const ROWS = [
  { k: 'BAKI DEBET BNPL · PERBANKAN', v: '31,5', u: 'T', note: 'SEPTEMBER 2026', at: 0 },
  { k: 'JUMLAH REKENING', v: '34,5', u: 'JT', note: 'SEPTEMBER 2026', at: 1 },
  { k: 'RATA-RATA PER REKENING', v: '940', u: 'RB', note: 'JUNI 2026', at: 2 },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.62, glowY: 300, glowA: 0.36 });
    folio(ctx, '02', 'TIGA PULUH SATU');

    par(ctx, cam, 0.2, () => {
      kick(ctx, 'EDISI 17', W - 88, 116, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
    });

    const cw = W - 176;
    const cx = 88;
    const cy = 300;
    const ch = 1080;

    const pin = ease.expo(clamp((t - c(0, 0.02)) / 0.7));
    ctx.save();
    ctx.globalAlpha = pin;
    paperCard(ctx, cx, cy + (1 - pin) * 40, cw, ch, { off: 16, tone: 'rgba(20,17,16,0.18)', tape: 0.5 });
    kick(ctx, 'LEMBAR UTANG RUMAH TANGGA', cx + 52, cy + 78, { size: 20, color: K.soft, track: 6 });
    kick(ctx, 'SUMBER: OJK', cx + cw - 52, cy + 78, { size: 17, color: 'rgba(20,17,16,0.34)', track: 4, align: 'right' });
    halftone(ctx, cx + cw - 300, cy + 100, 240, 120, { step: 14, a: 0.13, color: K.blue });
    ctx.restore();

    // the three lines
    ROWS.forEach((R, i) => {
      const p = ease.expo(clamp((t - c(R.at, 0.06)) / 0.65));
      if (p <= 0.001) return;
      const y = cy + 240 + i * 262;
      ctx.save();
      ctx.globalAlpha = p;
      // label slides in from the left margin, value from the right
      ctx.save();
      ctx.translate((1 - p) * -46, 0);
      kick(ctx, R.k, cx + 52, y, { size: 21, color: K.soft, track: 5 });
      ctx.restore();

      ctx.save();
      ctx.translate((1 - p) * 120, 0);
      txt(ctx, R.v, cx + cw - 52, y + 92, {
        size: 150, font: F.num, color: K.ink, align: 'right', track: -8,
      });
      kick(ctx, { T: 'TRILIUN', JT: 'JUTA', RB: 'RIBU' }[R.u] || R.u, cx + cw - 54, y - 24, {
        size: 19, color: K.soft, track: 5, align: 'right',
      });
      ctx.restore();

      // the ruled line the whole ledger hangs on
      ctx.fillStyle = 'rgba(20,17,16,0.20)';
      ctx.fillRect(cx + 52, y + 126, cw - 104, 1.6);
      kick(ctx, R.note, cx + 52, y + 168, { size: 16, color: 'rgba(20,17,16,0.30)', track: 4 });
      ctx.restore();
    });

    // the verdict, stamped on the bottom of the page
    const pv = a(c(3, 0.12), 0.6);
    if (pv > 0.01) {
      ctx.save();
      ctx.globalAlpha = pv;
      ctx.fillStyle = 'rgba(20,17,16,0.06)';
      ctx.fillRect(cx + 52, cy + ch - 214, cw - 104, 3);
      kick(ctx, 'KETERANGAN', cx + 52, cy + ch - 160, { size: 17, color: 'rgba(20,17,16,0.34)', track: 5 });
      txt(ctx, 'bukan modal usaha', cx + 52, cy + ch - 84, {
        size: 54, font: F.mono6, color: K.ink2, track: -1,
      });
      ctx.restore();
      stampInk(ctx, 'KONSUMSI', cx + cw - 300, cy + ch - 176, {
        a: pv, rot: -0.09, size: 44, color: K.red, pad: 26,
      });
    }

    // margin arrow pointing at the big number
    const pa = ease.inOut(clamp((t - c(0, 0.9)) / 0.6));
    arrow(ctx, cx - 34, cy + 470, cx - 34, cy + 300, { color: K.red, lw: 4, head: 16, p: pa });
  },
};
