import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  D, ease, cue, room, cone, motes, bokeh, vignette, par, meter, ring, sheen,
} from './_daya.mjs';

// 09 — SATU METERAN
// Everything from the last two minutes, put back on the one object that carries it.

const CHIPS = [
  { k: 'ADMIN', v: 'Rp2.500–3.500', at: 2, x: 210 },
  { k: 'PPJ', v: '2,4% – 10%', at: 2, x: 540 },
  { k: 'TARIF', v: 'Rp1.444,70', at: 2, x: 870 },
  { k: 'LISTRIK', v: '65,8 kWh', at: 2, x: 1200 },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.5, glowY: 420, glowA: 0.14, horizon: 1300 });
    cone(ctx, W * 0.5, 300, 1180, 480, { a: 0.06, t, color: D.steelHi });
    motes(ctx, t, { n: 38, a: 0.35 });

    // the meter
    const mw = 660;
    const mx = (W - mw) / 2;
    const min = ease.expo(clamp((t - c(0, 0.02)) / 0.7));
    par(ctx, cam, 0.5, () => {
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.75 * min;
      meter(ctx, mx, 380, mw, { reading: '6.598,0', t, label: 'KWH METER' });
      ctx.restore();
    });

    // chips, attached with hairlines
    const cw = 300;
    CHIPS.forEach((C, i) => {
      const p = ease.expo(clamp((t - c(C.at, 0.10 + i * 0.11)) / 0.55));
      if (p <= 0.001) return;
      const cx = C.x;
      const cy = 946;
      ctx.save();
      ctx.globalAlpha = p;
      // hairline from meter edge to chip
      ctx.strokeStyle = hexA(D.bone, 0.18 * p);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, 760);
      ctx.lineTo(cx, cy - 62);
      ctx.stroke();

      const x = cx - cw / 2;
      fillRR(ctx, x + (1 - p) * 14, cy - 62, cw, 124, 12, 'rgba(11,18,26,0.94)');
      strokeRR(ctx, x + (1 - p) * 14, cy - 62, cw, 124, 12, hexA(D.bone, 0.16), 1.4);
      tracking(ctx, C.k, cx, cy - 16, { size: 17, font: F.mono6, track: 4, color: hexA(D.mint, 0.8), align: 'center' });
      txt(ctx, C.v, cx, cy + 34, { size: 34, font: F.num, color: D.bone, align: 'center', track: -1 });
      ctx.restore();
    });

    // the statement
    const ct0 = a(c(3, 0.05), 0.7);
    const st = a(c(1, 0.05), 0.7) * (1 - ct0);
    if (st > 0.01) {
      ctx.save();
      ctx.globalAlpha = st;
      const y = 1210;
      tracking(ctx, 'YANG MAHAL BUKAN LISTRIKNYA', W / 2, y - 84, {
        size: 19, font: F.mono6, track: 5, color: hexA(D.bone, 0.36), align: 'center',
      });
      txt(ctx, 'tidak tahu', W / 2, y, { size: 84, font: F.num, color: D.bone, align: 'center', track: -2 });
      tracking(ctx, 'KE MANA UANGNYA PERGI', W / 2, y + 56, {
        size: 20, font: F.mono6, track: 5, color: hexA(D.ember, 0.8), align: 'center',
      });
      ctx.restore();
    }

    // CTA card
    const ct = ct0;
    if (ct > 0.01) {
      ctx.save();
      ctx.globalAlpha = ct;
      const cw2 = 1000;
      const cx2 = (W - cw2) / 2;
      const cy2 = 1330;
      ctx.save();
      ctx.shadowColor = hexA(D.mint, 0.25);
      ctx.shadowBlur = 50;
      fillRR(ctx, cx2, cy2, cw2, 210, 18, 'rgba(9,24,21,0.92)');
      ctx.restore();
      strokeRR(ctx, cx2, cy2, cw2, 210, 18, hexA(D.mint, 0.45), 2);
      sheen(ctx, cx2, cy2, cw2, 210, 18, t, { a: 0.06, speed: 0.12 });
      tracking(ctx, 'TULIS DI KOMENTAR', cx2 + 46, cy2 + 62, {
        size: 18, font: F.mono6, track: 5, color: hexA(D.mint, 0.8),
      });
      txt(ctx, 'PPJ di daerahmu: ___ %', cx2 + 46, cy2 + 148, {
        size: 52, font: F.num, color: D.bone, track: -1,
      });
      // caret
      const bl = (t * 1.6) % 1 < 0.5 ? 1 : 0.15;
      ctx.globalAlpha = ct * bl;
      ctx.fillStyle = D.mint;
      ctx.fillRect(cx2 + cw2 - 74, cy2 + 100, 5, 58);
      ctx.restore();
    }

    bokeh(ctx, cam, { n: 5, a: 0.09 });
    vignette(ctx, 0.5);
  },
};
