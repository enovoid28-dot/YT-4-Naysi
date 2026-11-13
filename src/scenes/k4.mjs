import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { P, plate, eyebrow, ease, group, plane } from './_fare.mjs';
import { tag, panel, ticks, flowLine, rings, ghosts, spark } from '../engine/motion.mjs';

// 04 — YANG MENGGERAKKAN
// Three inputs, one output, and the point of the shot: none of the three
// inputs is "you". It is everybody, the calendar, and the other airlines.

const CARDS = [
  { y: 600, label: 'PERMINTAAN', value: '×3,2', unit: 'DARI NORMAL', tone: P.mint, kind: 'spark' },
  { y: 840, label: 'SISA WAKTU', value: '14', unit: 'HARI', tone: P.cyan, kind: 'bar' },
  { y: 1080, label: 'PESAING DI RUTE', value: '3', unit: 'MASKAPAI', tone: P.amber, kind: 'dots' },
];

const HH = 200;
const CWD = 596;
const HUBX = 848;
const HUBY = 640;
const HUBW = 492;
const HUBH = 480;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    plate(ctx, { t, glow: P.cyan, glowX: W * 0.72, glowY: 860, glowA: 0.075 });

    eyebrow(ctx, 'TIGA MASUKAN · SATU ANGKA', { a: a(0.05, 0.5), rule: P.cyan });

    /* ------------------------------ cards ------------------------------- */
    CARDS.forEach((c, i) => {
      const start = 0.3 + i * 0.4;
      const p = a(start, 0.7);
      if (p <= 0.01) return;
      const x = 104;
      const s = ease.expo(clamp((t - start) / 0.8));
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate((1 - s) * -26, 0);

      panel(ctx, x, c.y, CWD, HH, { a: p, fill: 'rgba(9,15,24,0.9)' });
      ctx.fillStyle = hexA(c.tone, 0.85);
      ctx.fillRect(x + 1, c.y + 24, 4, HH - 48);

      tag(ctx, c.label, x + 38, c.y + 58, { size: 20, track: 4, color: hexA(P.bone, 0.46), ruleW: 0 });
      txt(ctx, c.value, x + 32, c.y + 148, { size: 84, font: F.num, color: P.bone, track: -3 });
      const vw = measure(ctx, c.value, 84, F.num, -3);
      tracking(ctx, c.unit, x + 32 + vw + 16, c.y + 148, {
        size: 19, font: F.mono6, track: 4, color: hexA(c.tone, 0.9),
      });

      /* micro visual, right half of the card */
      const vx = x + CWD - 208;
      const vy = c.y + 62;
      const va = a(start + 0.6, 0.9);
      if (va > 0.01) {
        ctx.save();
        ctx.globalAlpha *= va;
        if (c.kind === 'spark') {
          const pts = [];
          for (let k = 0; k < 18; k++) {
            const u = k / 17;
            pts.push([u, 0.9 - u * 0.6 + (noise1(u * 6, 4) - 0.5) * 0.08]);
          }
          spark(ctx, pts, {
            p: clamp((t - (start + 0.6)) / 1.1), x: vx, y: vy + 76, w: 176, h: 84,
            color: c.tone, lw: 2.6, fill: true, head: false,
          });
        } else if (c.kind === 'bar') {
          for (let k = 0; k < 14; k++) {
            const on = k < 7;
            ctx.fillStyle = on ? hexA(c.tone, 0.8) : hexA(P.bone, 0.10);
            ctx.fillRect(vx + k * 13, vy + 36, 7, 48);
          }
          tracking(ctx, 'H−14', vx, vy + 108, { size: 17, font: F.mono6, track: 3, color: hexA(c.tone, 0.6) });
        } else {
          for (let k = 0; k < 3; k++) {
            const ly = vy + 44 + k * 26;
            ctx.fillStyle = hexA(P.bone, 0.10);
            ctx.fillRect(vx, ly, 176, 1);
            ctx.beginPath();
            ctx.arc(vx + 24 + k * 52, ly, 4, 0, TAU);
            ctx.fillStyle = hexA(c.tone, 0.8 - k * 0.16);
            ctx.fill();
            ctx.fillStyle = hexA(c.tone, 0.22);
            ctx.fillRect(vx + 24 + k * 52, ly, 176 - 24 - k * 52, 1);
          }
        }
        ctx.restore();
      }
      ctx.restore();
    });

    /* ---------------------------- connectors ---------------------------- */
    const connA = a(1.8, 0.7);
    if (connA > 0.01) {
      CARDS.forEach((c, i) => {
        const p = clamp((t - 1.8 - i * 0.26) / 1.0);
        flowLine(ctx, 104 + CWD + 6, c.y + HH / 2, HUBX - 8, HUBY + HUBH * 0.42, {
          p, t, color: c.tone, a: connA * 0.7, lw: 2.2, curve: 0.55, speed: 30,
        });
      });
    }

    /* ------------------------------- hub -------------------------------- */
    const hA = a(2.5, 0.8);
    if (hA > 0.01) {
      ctx.save();
      ctx.globalAlpha = hA;
      rings(ctx, HUBX + HUBW / 2, HUBY + HUBH / 2, {
        t, n: 3, r0: 60, r1: 340, color: P.amber, a: 0.14, lw: 1.6, speed: 0.3,
      });
      panel(ctx, HUBX, HUBY, HUBW, HUBH, {
        a: hA, r: 22, fill: 'rgba(12,19,29,0.95)', border: hexA(P.amber, 0.34), lw: 1.6,
      });
      tracking(ctx, 'HARGA KURSI', HUBX + 36, HUBY + 60, {
        size: 20, font: F.mono6, track: 5, color: hexA(P.bone, 0.46),
      });

      const rise = ease.inOut(clamp((t - 3.1) / 5.2));
      const value = 700000 + 540000 * rise;
      ctx.save();
      ghosts(ctx, { dx: 5, dy: 0, n: 2, spread: 1, alpha: 0.12 }, () => {
        txt(ctx, 'Rp', HUBX + 30, HUBY + 206, { size: 42, font: F.num, color: hexA(P.bone, 0.6) });
        txt(ctx, group(value), HUBX + 30, HUBY + 268, {
          size: 76, font: F.num, color: P.bone, track: -3,
        });
      });
      ctx.restore();

      // live micro bars
      const bA = a(3.3, 0.7);
      for (let k = 0; k < 22; k++) {
        const hgt = 6 + Math.abs(Math.sin(t * 1.6 + k * 0.55)) * 30 * (0.4 + noise1(k * 1.7, 9));
        ctx.fillStyle = hexA(P.amber, 0.10 + 0.26 * (k / 22) * bA);
        ctx.fillRect(HUBX + 34 + k * 19, HUBY + 366 - hgt, 8, hgt);
      }
      tracking(ctx, 'BERGERAK SETIAP MENIT', HUBX + 34, HUBY + HUBH - 34, {
        size: 18, font: F.mono6, track: 4, color: hexA(P.amber, 0.6),
      });
      // the change badge sits beside the label, never over the digits
      ctx.beginPath();
      const dTx = HUBX + HUBW - 34;
      const dLabel = `+${Math.round((540000 * rise) / 1000)} RB`;
      const dW = measure(ctx, dLabel, 24, F.mono6, 3) + 3;
      ctx.moveTo(dTx - dW - 22, HUBY + 52);
      ctx.lineTo(dTx - dW - 10, HUBY + 60);
      ctx.lineTo(dTx - dW - 22, HUBY + 68);
      ctx.closePath();
      ctx.fillStyle = P.ember;
      ctx.fill();
      tracking(ctx, dLabel, dTx, HUBY + 68, {
        size: 24, font: F.mono6, track: 3, color: hexA(P.ember, 0.9), align: 'right',
      });
      ctx.restore();
    }

    /* ---------------------------- the equation -------------------------- */
    const eqA = a(5.2, 0.8);
    if (eqA > 0.01) {
      const y = 1452;
      ctx.save();
      ctx.globalAlpha = eqA;
      ctx.fillStyle = hexA(P.bone, 0.10);
      ctx.fillRect(104, y - 56, W - 208, 1);
      const parts = ['PERMINTAAN', '×', 'SISA WAKTU', '×', 'PESAING', '=', 'HARGA'];
      ctx.font = `22px ${F.mono6}`;
      const widths = parts.map((s) => measure(ctx, s, 22, F.mono6, 4) + 4 + 18);
      const total = widths.reduce((x, v) => x + v, 0);
      let cx = W / 2 - total / 2;
      parts.forEach((s2, i) => {
        const isOp = s2 === '×' || s2 === '=';
        tracking(ctx, s2, cx, y, {
          size: 22, font: F.mono6, track: 4,
          color: isOp ? hexA(P.amber, 0.95) : hexA(P.bone, i === 6 ? 0.9 : 0.42),
        });
        cx += widths[i];
      });
      tracking(ctx, 'TIDAK ADA SATU PUN MASUKAN BERNAMA "KAMU"', W / 2, y + 58, {
        size: 19, font: F.mono6, track: 4, color: hexA(P.bone, 0.30), align: 'center',
      });
      ctx.restore();
    }
  },
};
