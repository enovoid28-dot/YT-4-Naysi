import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  D, ease, cue, room, cone, motes, bokeh, vignette, par, breaker, sheen, stamp,
} from './_daya.mjs';

// 05 — GOLONGAN
// Three breakers on a wall. Two of them carry the same 900 VA; the price plate
// under them is what splits the country in half.

const COLS = [
  { va: '450 VA', tag: 'SUBSIDI', price: '415', at: 1, tone: D.volt, x: 96, w: 360 },
  { va: '900 VA', tag: 'SUBSIDI', price: '605', at: 3, tone: D.mint, x: 540, w: 360 },
  { va: '900 VA', tag: 'RTM · MAMPU', price: '1.352', at: 4, tone: D.ember, x: 984, w: 360 },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.5, glowY: 340, glowA: 0.13, horizon: 1250 });
    cone(ctx, W * 0.5, 240, 1240, 480, { a: 0.06, t, color: D.steelHi });
    motes(ctx, t, { n: 40, a: 0.36, color: '#DCE9F6' });

    // the board they are mounted on
    const bw = W - 160;
    const bx = 80;
    const by = 380;
    const bh = 900;
    par(ctx, cam, 0.55, () => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 54;
      ctx.shadowOffsetY = 22;
      fillRR(ctx, bx, by, bw, bh, 18, 'rgba(16,22,29,0.92)');
      ctx.restore();
      strokeRR(ctx, bx, by, bw, bh, 18, hexA(D.bone, 0.12), 1.6);
      sheen(ctx, bx, by, bw, bh, 18, t, { a: 0.05, speed: 0.08 });
      // rail line the breakers clip onto
      ctx.fillStyle = hexA(D.bone, 0.10);
      ctx.fillRect(bx + 40, by + 250, bw - 80, 4);
      tracking(ctx, 'TARIF RUMAH TANGGA · PER KILOWATT JAM', bx + 44, by + 62, {
        size: 18, font: F.mono6, track: 4.5, color: hexA(D.bone, 0.40),
      });
    });

    COLS.forEach((C, i) => {
      const p = ease.expo(clamp((t - c(C.at, 0.02)) / 0.6));
      if (p <= 0.001) return;
      ctx.save();
      ctx.globalAlpha = p;
      const x = C.x + (1 - p) * 20;
      // breaker
      breaker(ctx, x + (C.w - 150) / 2, 512, 150, 300, { on: 1, rating: C.va.split(' ')[0], t });
      tracking(ctx, C.va, x + C.w / 2, 866, { size: 26, font: F.mono6, track: 4, color: hexA(D.bone, 0.8), align: 'center' });
      tracking(ctx, C.tag, x + C.w / 2, 902, { size: 16, font: F.mono6, track: 3, color: hexA(C.tone, 0.75), align: 'center' });

      // price plate on the board
      ctx.fillStyle = hexA(D.bone, 0.10);
      ctx.fillRect(x + 24, 944, C.w - 48, 1.4);
      txt(ctx, C.price, x + C.w / 2, 1064, { size: 96, font: F.num, color: D.bone, align: 'center', track: -3 });
      tracking(ctx, 'RUPIAH / kWh', x + C.w / 2, 1104, {
        size: 16, font: F.mono6, track: 3, color: hexA(D.bone, 0.35), align: 'center',
      });
      ctx.restore();
    });

    // the two 900s get bracketed on the last line
    const br = ease.inOut(clamp((t - c(5, 0.05)) / 0.7));
    if (br > 0.01) {
      const x1 = COLS[1].x + 40;
      const x2 = COLS[2].x + COLS[2].w - 40;
      ctx.save();
      ctx.globalAlpha = br;
      ctx.strokeStyle = hexA(D.ember, 0.75);
      ctx.lineWidth = 3;
      const y = 1180;
      ctx.beginPath();
      ctx.moveTo(x1, y - 16);
      ctx.lineTo(x1, y);
      ctx.lineTo(lerp(x1, x2, br), y);
      ctx.lineTo(lerp(x1, x2, br), y - 16);
      ctx.stroke();
      ctx.restore();

      const st = a(c(5, 0.45), 0.5);
      if (st > 0.01) {
        ctx.save();
        ctx.globalAlpha = st;
        tracking(ctx, 'DAYA SAMA · 900 VA', W / 2, 1250, {
          size: 22, font: F.mono6, track: 5, color: hexA(D.bone, 0.55), align: 'center',
        });
        // the multiplication, set big
        txt(ctx, '2,2×', W / 2 - 150, 1400, { size: 132, font: F.num, color: D.ember, align: 'right', track: -6 });
        txt(ctx, '605', W / 2 - 100, 1372, { size: 54, font: F.num6, color: hexA(D.bone, 0.55), align: 'left' });
        txt(ctx, '1.352', W / 2 - 100, 1442, { size: 54, font: F.num6, color: D.bone, align: 'left' });
        ctx.restore();
        stamp(ctx, 'HARGA DUA KALI LIPAT', W / 2, 1544, { a: st * 0.9, rot: -0.02, color: D.ember, size: 24 });
      }
    }

    bokeh(ctx, cam, { n: 5, a: 0.09 });
    vignette(ctx, 0.5);
  },
};
