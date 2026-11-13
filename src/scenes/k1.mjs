import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { P, plate, routeLine, eyebrow, ease, plane, money } from './_fare.mjs';
import { splitFlap, flapWidth, spark, tag, panel, ticks, rings, ghosts } from '../engine/motion.mjs';

// 01 — HARGA YANG BERGERAK
// One object, held still: a live fare board. The flip is the loudest thing in
// the first four seconds, and everything after it is evidence.

const CW = 168;
const CH = 222;
const GAP = 12;

const tape = [
  { s: 4.9, time: '12:04', price: '700.000', d: '', tone: P.dim },
  { s: 5.3, time: '12:07', price: '742.000', d: '+6%', tone: P.amber },
  { s: 5.7, time: '12:11', price: '815.000', d: '+10%', tone: P.amber },
  { s: 6.1, time: '12:14', price: '900.000', d: '+10%', tone: P.ember },
];

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    plate(ctx, { t, glow: P.amber, glowY: 820, glowA: 0.10 });

    /* ------------------------------ header ------------------------------ */
    eyebrow(ctx, 'HARGA · SATU KURSI', { a: a(0.04, 0.5) });
    routeLine(ctx, 104, 466, 1232, { a: a(0.18, 0.8), t });

    /* ------------------------------- board ------------------------------ */
    const n = 7;
    const bw = flapWidth(n, CW, GAP);
    const bx = (W - bw) / 2;
    const by = 566;
    const drop = a(0.42, 0.62);
    const flip = clamp((t - 2.05) / 1.0);

    tag(ctx, 'HARGA PER KURSI · CGK–DPS · 1 PENUMPANG', W / 2, by - 44, {
      size: 24, track: 5, color: hexA(P.bone, 0.46), align: 'center', ruleW: 0, a: a(0.5, 0.5),
    });

    // the board sits on a plate of its own
    panel(ctx, bx - 38, by - 34, bw + 76, CH + 68, {
      r: 20, fill: 'rgba(8,13,21,0.92)', border: 'rgba(214,228,242,0.12)', lw: 1.4, a: drop,
    });

    ctx.save();
    ctx.translate(0, (1 - drop) * -36);
    splitFlap(ctx, {
      value: '900.000',
      prev: '684.000',
      p: flip,
      x: bx,
      y: by,
      cellW: CW,
      cellH: CH,
      gap: GAP,
      a: drop,
      bg: '#0B1420',
      bgTop: '#13212F',
      ink: P.bone,
      staggerS: 0.06,
    });
    ctx.restore();

    // live dot + label, top-right inside the plate
    const live = a(1.2, 0.6);
    if (live > 0.01) {
      const lx = bx + bw - 8;
      const ly = by + 12;
      const pulse = 0.55 + 0.45 * Math.sin(t * 4.6);
      ctx.save();
      ctx.globalAlpha = live;
      ctx.beginPath();
      ctx.arc(lx - 118, ly - 6, 7, 0, TAU);
      ctx.fillStyle = hexA(P.ember, 0.6 + 0.4 * pulse);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx - 118, ly - 6, 7 + 10 * pulse, 0, TAU);
      ctx.fillStyle = hexA(P.ember, 0.12 * (1 - pulse));
      ctx.fill();
      tracking(ctx, 'LIVE', lx - 102, ly, { size: 20, font: F.mono6, track: 5, color: hexA(P.ember, 0.9) });
      ctx.restore();
    }

    /* ------------------------------- delta ------------------------------ */
    const dl = a(2.30, 0.55);
    if (dl > 0.01) {
      const s = ease.expo(clamp((t - 2.30) / 0.7));
      const dy = 902;
      const label = 'NAIK 29% DALAM 10 MENIT';
      const tw = measure(ctx, label, 25, F.mono6, 4) + 4;
      const w = tw + 112;
      const x0 = W / 2 - w / 2;
      ctx.save();
      ctx.globalAlpha = dl;
      ctx.translate(0, (1 - s) * 18);
      fillRR(ctx, x0, dy - 29, w, 64, 32, hexA(P.ember, 0.13));
      strokeRR(ctx, x0, dy - 29, w, 64, 32, hexA(P.ember, 0.42), 1.4);
      ctx.beginPath();
      ctx.moveTo(x0 + 30, dy + 9);
      ctx.lineTo(x0 + 45, dy - 9);
      ctx.lineTo(x0 + 60, dy + 9);
      ctx.closePath();
      ctx.fillStyle = P.ember;
      ctx.fill();
      tracking(ctx, label, x0 + 78, dy + 9, {
        size: 25, font: F.mono6, track: 4, color: hexA(P.ember, 0.95),
      });
      ctx.restore();
    }

    /* ------------------------------- spark ------------------------------ */
    const sp = clamp((t - 2.7) / 1.5);
    if (sp > 0.01) {
      const pts = [];
      const N = 34;
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const trend = 0.94 - 0.88 * Math.pow(u, 2.3);
        const jit = (noise1(u * 11, 3) - 0.5) * 0.075;
        const jump = i > 25 ? -0.2 * ((i - 25) / 8) : 0;
        pts.push([u, clamp(trend + jit + jump, 0.02, 1)]);
      }
      const sx = 168;
      const sy = 1032;
      const sw = W - 336;
      const sh = 206;
      ctx.save();
      ctx.globalAlpha = ease.out(clamp((t - 2.7) / 0.7));
      // baseline + value rails
      ctx.strokeStyle = hexA(P.bone, 0.10);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + sw, sy);
      ctx.stroke();
      for (let i = 0; i <= 4; i++) {
        const yy = sy - (sh * i) / 4;
        ctx.globalAlpha = ease.out(clamp((t - 2.7) / 0.7)) * 0.18;
        ctx.fillStyle = P.bone;
        ctx.fillRect(sx, yy, sw, 1);
      }
      ctx.globalAlpha = ease.out(clamp((t - 2.7) / 0.7));
      ticks(ctx, sx, sy, sw, { n: 24, color: P.bone, a: 0.18, major: 6 });
      spark(ctx, pts, {
        p: sp, x: sx, y: sy, w: sw, h: sh, color: P.amber, lw: 3.4,
        fill: true, head: true, headColor: P.amberHi,
      });
      tracking(ctx, '700 RB', sx - 14, sy - 4, {
        size: 18, font: F.mono6, track: 3, color: hexA(P.bone, 0.3), align: 'right',
      });
      tracking(ctx, '900 RB', sx - 14, sy - sh + 10, {
        size: 18, font: F.mono6, track: 3, color: hexA(P.amber, 0.5), align: 'right',
      });
      tracking(ctx, 'HARGA · 10 MENIT TERAKHIR', sx, sy + 48, {
        size: 19, font: F.mono6, track: 5, color: hexA(P.bone, 0.30),
      });
      ctx.restore();
    }

    /* -------------------------------- tape ------------------------------ */
    const tapeA = a(4.85, 0.6);
    if (tapeA > 0.01) {
      const y = 1420;
      const x0 = 168;
      const x1 = W - 168;
      ctx.save();
      ctx.globalAlpha = tapeA;
      ctx.fillStyle = hexA(P.bone, 0.10);
      ctx.fillRect(x0, y - 62, x1 - x0, 1);
      tracking(ctx, 'LOG PERUBAHAN HARGA · HARI INI', x0, y - 78, {
        size: 18, font: F.mono6, track: 5, color: hexA(P.bone, 0.32),
      });
      tape.forEach((row, i) => {
        const ra = a(row.s, 0.42);
        if (ra <= 0.01) return;
        const col = x0 + (i * (x1 - x0)) / 4;
        ctx.save();
        ctx.globalAlpha = tapeA * ra;
        ctx.translate(0, (1 - ease.out(ra)) * 14);
        tracking(ctx, row.time, col, y, { size: 19, font: F.mono6, track: 3, color: hexA(P.bone, 0.40) });
        tracking(ctx, `Rp ${row.price}`, col, y + 46, {
          size: 26, font: F.mono6, track: 2, color: hexA(P.bone, 0.86),
        });
        if (row.d) {
          tracking(ctx, row.d, col, y + 80, {
            size: 20, font: F.mono6, track: 2, color: row.tone,
          });
        }
        ctx.restore();
      });
      ctx.restore();
    }

    /* ------------------------------ footer ------------------------------ */
    const fa = a(5.4, 0.6);
    if (fa > 0.01) {
      ctx.save();
      ctx.globalAlpha = fa * 0.9;
      tracking(ctx, 'SIMULASI SISTEM REVENUE · BUKAN TARIF NYATA', 104, 1546, {
        size: 17, font: F.mono6, track: 4, color: hexA(P.bone, 0.26),
      });
      ctx.restore();
    }
  },
};
