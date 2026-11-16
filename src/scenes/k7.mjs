import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, van, box, contact, grainOverlay } from './_kirim.mjs';

// 07 — RETUR
// The same parcel travels twice. Two directions, two bills, and since June 2026
// the seller carries part of the way back.

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 640, glowA: 0.10 });

    tracking(ctx, 'PENGEMBALIAN', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'ONGKIR DUA ARAH', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.ember, 0.65), align: 'right', alpha: a(0.02, 0.5),
    });

    /* --------------------------- shot A: two vans ------------------------- */
    if (t < 6.8) {
      const go = ease.inOut(clamp((t - 0.3) / 3.2));
      const back = ease.inOut(clamp((t - 3.4) / 3.0));
      // outbound lane
      ctx.save();
      ctx.globalAlpha = a(0.15, 0.5) * (1 - back * 0.4);
      van(ctx, lerp(-260, 980, go), 430, 430, { a: 1, motion: go > 0 && go < 1 ? 0.6 : 0.1 });
      ctx.restore();
      // return lane
      if (t > 3.4) {
        ctx.save();
        ctx.globalAlpha = a(3.5, 0.5);
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
        van(ctx, lerp(-260, 900, back), 830, 430, { a: 1, motion: 0.6 });
        ctx.restore();
      }
      // road
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = hexA(K.bone, 0.10);
      ctx.fillRect(0, 700, W, 2);
      ctx.fillRect(0, 1130, W, 2);
      ctx.restore();
      // the parcel in the middle
      box(ctx, W / 2 - 130, 940, 260, 170, { a: a(1.4, 0.6), rot: 0.02, tape: true, depth: 0.2 });
      txt(ctx, 'BERANGKAT', 150, 380, {
        size: 22, font: F.mono6, color: hexA(K.bone, 0.4), track: 4, alpha: a(0.6, 0.5),
      });
      txt(ctx, 'KEMBALI', W - 150, 1180, {
        size: 22, font: F.mono6, color: hexA(K.ember, 0.7), track: 4, align: 'right', alpha: a(3.8, 0.5),
      });
    }

    /* -------------------------- shot B: the two bills --------------------- */
    if (t >= 6.8) {
      const p = ease.expo(clamp((t - 6.9) / 0.8));
      const rows = [
        { l: 'KIRIM KE PEMBELI', v: '8.000', at: 7.1, c: K.bone },
        { l: 'KIRIM BALIK', v: '8.000', at: 7.7, c: K.ember },
      ];
      ctx.save();
      ctx.globalAlpha = p;
      fillRR(ctx, 140, 400, W - 280, 520, 14, 'rgba(10,16,23,0.9)');
      strokeRR(ctx, 140, 400, W - 280, 520, 14, hexA(K.bone, 0.12), 1.6);
      ctx.restore();
      rows.forEach((r, i) => {
        const q = clamp((t - r.at) / 0.45);
        if (q <= 0) return;
        const y = 500 + i * 150;
        ctx.save();
        ctx.globalAlpha = q;
        tracking(ctx, r.l, 190, y - 30, { size: 20, font: F.mono6, track: 4, color: hexA(K.bone, 0.45) });
        txt(ctx, r.v, W - 190, y + 20, { size: 72, font: F.num, color: r.c, align: 'right', track: -2 });
        ctx.fillStyle = hexA(K.bone, 0.08);
        ctx.fillRect(190, y + 46, W - 380, 1.4);
        ctx.restore();
      });
      const q = a(8.6, 0.6);
      if (q > 0.01) {
        ctx.save();
        ctx.globalAlpha = q;
        txt(ctx, '16.000', W / 2, 1080, {
          size: 110, font: F.num, color: K.ember, align: 'center', track: -4,
        });
        tracking(ctx, 'UNTUK SATU PAKET YANG TIDAK JADI', W / 2, 1130, {
          size: 20, font: F.mono6, track: 4, color: hexA(K.bone, 0.42), align: 'center',
        });
        ctx.restore();
      }
      const s = a(10.4, 0.7);
      if (s > 0.01) {
        ctx.save();
        ctx.globalAlpha = s;
        fillRR(ctx, 140, 1240, W - 280, 120, 10, hexA(K.amber, 0.10));
        strokeRR(ctx, 140, 1240, W - 280, 120, 10, hexA(K.amber, 0.45), 1.6);
        tracking(ctx, 'SEJAK JUNI 2026 · PENJUAL MENANGGUNG ≤ RP 5.000 / ARAH', W / 2, 1310, {
          size: 19, font: F.mono6, track: 3, color: K.amber, align: 'center',
        });
        ctx.restore();
      }
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
