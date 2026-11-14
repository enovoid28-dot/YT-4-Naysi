import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import {
  P, eyebrow, ease, nightWall, lightCone, boardHousing, engraved, sticker, paperTape,
} from './_fare.mjs';
import { splitFlap, flapWidth, spark, ghosts, ticks } from '../engine/motion.mjs';

// 01 — HARGA YANG BERGERAK
// A fare board on a night wall, lit from above. The board is a machine, so it
// gets a housing, screws, glass glare and a paper record of what it just did.

const CW = 160;
const CH = 224;
const GAP = 10;

const tape = [
  { time: '12:04', price: 'Rp 700.000' },
  { time: '12:07', price: 'Rp 742.000', delta: '+6%', up: true },
  { time: '12:11', price: 'Rp 815.000', delta: '+10%', up: true },
  { time: '12:14', price: 'Rp 900.000', delta: '+10%', up: true },
];

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    nightWall(ctx, { spotX: W * 0.5, spotY: 500, spotA: 0.15, panels: 4 });
    lightCone(ctx, W * 0.5, -120, 1120, 120, 660, { color: '#FFD9A0', a: 0.055 });

    /* ------------------------------ header ------------------------------ */
    const ea = a(0.04, 0.5);
    eyebrow(ctx, 'HARGA · SATU KURSI', { a: ea, color: 'rgba(246,241,230,0.62)' });

    // route plate engraved on the wall
    const rp = a(0.16, 0.7);
    if (rp > 0.01) {
      ctx.save();
      ctx.globalAlpha = rp;
      const rx = 104;
      const ry = 318;
      engraved(ctx, 'CGK', rx, ry, { size: 34, color: 'rgba(246,241,230,0.78)', track: 6 });
      engraved(ctx, 'DPS', W - 104, ry, { size: 34, color: 'rgba(246,241,230,0.78)', track: 6, align: 'right' });
      // the route itself: a hairline with tick marks, as if etched into the wall
      const x0 = rx + 96;
      const x1 = W - 104 - 96;
      ctx.fillStyle = 'rgba(246,241,230,0.16)';
      ctx.fillRect(x0, ry - 10, (x1 - x0) * ease.out(clamp((t - 0.3) / 0.9)), 1.5);
      for (let i = 0; i <= 8; i++) {
        const xx = lerp(x0, x1, i / 8);
        if (xx > lerp(x0, x1, ease.out(clamp((t - 0.3) / 0.9)))) break;
        ctx.fillStyle = i % 4 === 0 ? 'rgba(246,241,230,0.30)' : 'rgba(246,241,230,0.13)';
        ctx.fillRect(xx, ry - 18, 1.5, 16);
      }
      ctx.restore();
    }

    /* ------------------------------- board ------------------------------ */
    const n = 7;
    const bw = flapWidth(n, CW, GAP);
    const bx = (W - bw) / 2;
    const by = 596;
    const drop = a(0.42, 0.62);
    const flip = clamp((t - 2.98) / 0.78);

    // housing
    const hx = bx - 46;
    const hw = bw + 92;
    const hy = 520;
    const hh = CH + 132;
    ctx.save();
    ctx.translate(0, (1 - drop) * -30);
    boardHousing(ctx, hx, hy, hw, hh, { a: drop });
    engraved(ctx, 'HARGA PER KURSI · 1 PENUMPANG', hx + 44, hy + 54, {
      size: 21, color: 'rgba(226,238,250,0.42)', a: drop,
    });
    // the LED that says the feed is live
    const pulse = 0.55 + 0.45 * Math.sin(t * 4.6);
    ctx.save();
    ctx.globalAlpha = drop;
    ctx.beginPath();
    ctx.arc(hx + hw - 96, hy + 48, 7, 0, TAU);
    ctx.fillStyle = hexA(P.ember, 0.6 + 0.4 * pulse);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx + hw - 96, hy + 48, 7 + 11 * pulse, 0, TAU);
    ctx.fillStyle = hexA(P.ember, 0.12 * (1 - pulse));
    ctx.fill();
    engraved(ctx, 'LIVE', hx + hw - 78, hy + 55, {
      size: 19, color: hexA(P.ember, 0.9), track: 5, a: 1,
    });
    ctx.restore();

    splitFlap(ctx, {
      value: '900.000',
      prev: '700.000',
      p: flip,
      x: bx,
      y: by + 16,
      cellW: CW,
      cellH: CH,
      gap: GAP,
      a: drop,
      bg: '#0B1420',
      bgTop: '#16242F',
      ink: P.bone,
      staggerS: 0.06,
    });
    // a thin shadow inside the recess, so the cells sit behind glass
    ctx.save();
    ctx.globalAlpha = drop * 0.55;
    ctx.fillStyle = linGrad(ctx, 0, by + 16, 0, by + 64, [
      [0, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillRect(bx, by + 16, bw, 48);
    ctx.restore();
    ctx.restore();

    /* --------------------------- the LED graph -------------------------- */
    const sp = clamp((t - 3.15) / 1.55);
    if (sp > 0.01) {
      const sx = 150;
      const sy = 1080;
      const sw = W - 300;
      const sh = 128;
      const sa = ease.out(clamp((t - 3.15) / 0.6));
      ctx.save();
      ctx.globalAlpha = sa;
      // recessed glass panel
      fillRR(ctx, sx - 40, sy - sh - 58, sw + 80, sh + 118, 12, 'rgba(8,13,20,0.86)');
      strokeRR(ctx, sx - 40, sy - sh - 58, sw + 80, sh + 118, 12, 'rgba(214,232,250,0.10)', 1.4);
      engraved(ctx, 'HARGA · 10 MENIT TERAKHIR', sx - 18, sy - sh - 26, {
        size: 18, color: 'rgba(226,238,250,0.38)', track: 4, a: 1,
      });
      const pts = [];
      const N = 34;
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const trend = 0.94 - 0.88 * Math.pow(u, 2.3);
        const jit = (noise1(u * 11, 3) - 0.5) * 0.075;
        const jump = i > 25 ? -0.2 * ((i - 25) / 8) : 0;
        pts.push([u, clamp(trend + jit + jump, 0.02, 1)]);
      }
      ticks(ctx, sx, sy, sw, { n: 24, color: P.bone, a: 0.14, major: 6 });
      spark(ctx, pts, {
        p: sp, x: sx, y: sy, w: sw, h: sh, color: '#FFB861', lw: 3,
        fill: true, head: true, headColor: '#FFE0B0',
      });
      ctx.restore();
    }

    /* ------------------------- the sticker (delta) ---------------------- */
    const dl = a(3.72, 0.5);
    if (dl > 0.01) {
      const s = ease.expo(clamp((t - 3.72) / 0.55));
      ctx.save();
      ctx.translate(hx + hw - 206, 948);
      ctx.rotate(-0.055);
      ctx.scale(0.86 + 0.14 * s, 0.86 + 0.14 * s);
      sticker(ctx, 0, 0, 'NAIK 29%', {
        w: 330, h: 112, a: dl, sub: 'DALAM 10 MENIT', size: 40, bg: '#D9503A',
      });
      ctx.restore();
    }

    /* --------------------------- paper record --------------------------- */
    const tp = a(2.52, 0.7);
    if (tp > 0.01) {
      const s = ease.out(clamp((t - 2.52) / 0.9));
      ctx.save();
      ctx.translate((1 - s) * 40, (1 - s) * 26);
      paperTape(ctx, 742, 1268, 556, tape, {
        a: tp, rot: -0.035, head: 'LOG HARGA · HARI INI', rowH: 58, pad: 26,
      });
      ctx.restore();

      // the caption on the wall beside the tape
      const ca = a(5.2, 0.6);
      if (ca > 0.01) {
        ctx.save();
        ctx.globalAlpha = ca;
        const cx = 168;
        const cy = 1310;
        ctx.fillStyle = hexA(P.amber, 0.8);
        ctx.fillRect(cx, cy - 34, 54, 4);
        tracking(ctx, 'EMPAT KALI', cx, cy, { size: 26, font: F.mono6, track: 5, color: hexA(P.bone, 0.72) });
        tracking(ctx, 'DALAM 10 MENIT', cx, cy + 40, { size: 26, font: F.mono6, track: 5, color: hexA(P.bone, 0.72) });
        tracking(ctx, 'TANPA KAMU SENTUH', cx, cy + 92, {
          size: 18, font: F.mono6, track: 4, color: hexA(P.bone, 0.34),
        });
        ctx.restore();
      }
    }
  },
};
