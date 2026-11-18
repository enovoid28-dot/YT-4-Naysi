import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  D, ease, cue, room, cone, motes, bokeh, vignette, par, plate, ring, sheen, cable,
} from './_daya.mjs';

// 03 — PAJAK DAERAH
// Same tariff plate on both walls. Two different tax rings under it.
// The point is made by the identical plate, not by the numbers.

const SIDES = [
  { key: 'JAKARTA', sub: 'DAYA ≤ 2.200 VA', pct: 2.4, rp: '2.400', at: 1, tone: D.volt },
  { key: 'BANGKA BELITUNG', sub: 'PPJ TERTINGGI', pct: 10, rp: '10.000', at: 2, tone: D.ember },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.5, glowY: 300, glowA: 0.12, horizon: 1330 });
    cone(ctx, W * 0.5, 240, 1300, 560, { a: 0.055, t, color: D.steelHi });
    motes(ctx, t, { n: 42, a: 0.4, color: '#DCE9F6' });

    // the plate both regions share
    const plw = 900;
    const plx = (W - plw) / 2;
    const plIn = ease.expo(clamp((t - c(0, 0.05)) / 0.7));
    par(ctx, cam, 0.6, () => {
      ctx.save();
      ctx.globalAlpha = plIn;
      plate(ctx, plx, 352 + (1 - plIn) * -24, plw, 214, {
        label: 'TARIF DASAR · R-1 / TR 1.300 VA', value: '1.444,70', sub: 'RUPIAH PER KILOWATT JAM · SAMA DI SELURUH INDONESIA',
        t,
      });
      ctx.restore();
      // bracket: "same plate"
      const bs = a(c(3, 0.05), 0.5);
      if (bs > 0.01) {
        ctx.save();
        ctx.globalAlpha = bs;
        ctx.strokeStyle = hexA(D.bone, 0.30);
        ctx.lineWidth = 2;
        const y = 600;
        ctx.beginPath();
        ctx.moveTo(plx + 40, y);
        ctx.lineTo(plx + 40, y + 18);
        ctx.lineTo(plx + plw - 40, y + 18);
        ctx.lineTo(plx + plw - 40, y);
        ctx.stroke();
        tracking(ctx, 'ANGKA YANG SAMA', W / 2, y + 54, {
          size: 19, font: F.mono6, track: 5, color: hexA(D.bone, 0.38), align: 'center',
        });
        ctx.restore();
      }
    });

    // two regional panels
    const cw = 596;
    const gap = 24;
    const x0 = (W - (cw * 2 + gap)) / 2;
    SIDES.forEach((S, i) => {
      const p = ease.expo(clamp((t - c(0, 0.18 + i * 0.10)) / 0.7));
      if (p <= 0.001) return;
      const x = x0 + i * (cw + gap);
      const y = 706;
      const h = 800;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(0, (1 - p) * 40);

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 22;
      fillRR(ctx, x, y, cw, h, 20, 'rgba(11,18,26,0.94)');
      ctx.restore();
      strokeRR(ctx, x, y, cw, h, 20, hexA(S.tone, 0.26), 1.6);
      sheen(ctx, x, y, cw, h, 20, t + i, { a: 0.05, speed: 0.1 });

      tracking(ctx, S.key, x + 34, y + 62, { size: 24, font: F.mono6, track: 4.5, color: hexA(D.bone, 0.78) });
      tracking(ctx, 'PAJAK PENERANGAN JALAN', x + 34, y + 96, {
        size: 16, font: F.mono6, track: 3.4, color: hexA(D.bone, 0.32),
      });

      // ring
      const cx = x + cw / 2;
      const cy = y + 300;
      const r = 148;
      const fill = ease.inOut(clamp((t - c(S.at, 0.05)) / 0.9));
      ring(ctx, cx, cy, r, fill * (S.pct / 10), { lw: 16, color: S.tone });
      ring(ctx, cx, cy, r - 30, 0.32, { a: 0.5, lw: 2, color: 'rgba(214,228,240,0.20)', track: 'rgba(0,0,0,0)' });
      const shown = (S.pct * fill).toFixed(1).replace('.', ',');
      txt(ctx, shown, cx, cy + 34, { size: 96, font: F.num, color: D.bone, align: 'center', track: -3 });
      tracking(ctx, 'PERSEN', cx, cy + 84, { size: 18, font: F.mono6, track: 4, color: hexA(D.bone, 0.4), align: 'center' });

      // rupiah it takes from a 100.000 token
      const ra = a(c(S.at, 0.35), 0.5);
      if (ra > 0.01) {
        ctx.save();
        ctx.globalAlpha = ra;
        const yy = y + 560;
        ctx.fillStyle = hexA(D.bone, 0.10);
        ctx.fillRect(x + 34, yy, cw - 68, 1.4);
        tracking(ctx, 'DARI TOKEN 100.000', x + 34, yy + 42, {
          size: 17, font: F.mono6, track: 3.5, color: hexA(D.bone, 0.38),
        });
        txt(ctx, S.rp, x + cw - 34, yy + 116, {
          size: 84, font: F.num, color: S.tone, align: 'right', track: -2.4,
        });
        // the bar that shows how much of the token it eats
        const bw = cw - 68;
        fillRR(ctx, x + 34, yy + 148, bw, 16, 8, 'rgba(214,228,240,0.10)');
        fillRR(ctx, x + 34, yy + 148, Math.max(6, bw * (S.pct / 10) * fill), 16, 8, hexA(S.tone, 0.9));
        ctx.restore();
      }
      // the "×4" bracket arrives with the last card
      if (i === 1) {
        const m = a(c(3, 0.35), 0.5);
        if (m > 0.01) {
          ctx.save();
          ctx.globalAlpha = m;
          fillRR(ctx, x + cw - 168, y + 128, 134, 54, 8, hexA(D.ember, 0.16));
          strokeRR(ctx, x + cw - 168, y + 128, 134, 54, 8, hexA(D.ember, 0.6), 1.6);
          txt(ctx, '×4', x + cw - 101, y + 168, {
            size: 40, font: F.num, color: D.ember, align: 'center', track: -1,
          });
          ctx.restore();
        }
      }
      ctx.restore();
    });

    // the wire that leaves both panels and ends in the same meter
    par(ctx, cam, 1.1, () => {
      const wy = 1560;
      cable(ctx, x0 + cw / 2, 1510, W / 2 - 60, wy, { a: 0.5, sag: 40, lw: 7 });
      cable(ctx, x0 + cw + gap + cw / 2, 1510, W / 2 + 60, wy, { a: 0.5, sag: 40, lw: 7 });
    });

    bokeh(ctx, cam, { n: 5, a: 0.09 });
    vignette(ctx, 0.5);
  },
};
