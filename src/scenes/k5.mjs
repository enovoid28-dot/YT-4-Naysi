import { W, H, C, M, txt, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { dawn, kicker, chip, card, hairline, glowSpot } from './_ep4.mjs';

const X0 = 262;
const X1 = 1244;
const Y0 = 690; // 100%
const Y1 = 1408; // 0%
const MMAX = 60;

const yOf = (v) => lerp(Y1, Y0, clamp(v));
const xOf = (m) => lerp(X0, X1, m / MMAX);

const RESETS = [9, 18, 27];
const BASE = 0.16;
/** alertness after the last reset at `m` minutes */
function alert(m) {
  let last = 0;
  for (const r of RESETS) if (m >= r) last = r;
  const local = m - last;
  return BASE + (0.94 - BASE) * (1 - Math.exp(-local / 7.5));
}

// 05 — OTAK. Waking up costs thirty minutes of blood flow. Every snooze pays
// that bill again from zero.
export default {
  draw(ctx, t) {
    dawn(ctx, { top: '#06080F', mid: '#0A0E1A', bot: '#0C111E', warmX: 0.5, warmA: 0.05 });

    kicker(ctx, 'KEWASPADAAN SETELAH BANGUN');

    /* -------------------------------------------------------------- grid -- */
    const gA = clamp((t - 0.2) / 0.8);
    ctx.save();
    ctx.globalAlpha = gA;
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
      const y = yOf(v);
      hairline(ctx, X0, y, X1, y, { color: C.bone, alpha: v === 0 ? 0.2 : 0.08, lw: 2, dash: v === 0 ? null : [2, 12] });
      txt(ctx, `${Math.round(v * 100)}`, X0 - 22, y + 9, {
        size: 23, font: F.num6, color: hexA(C.bone, 0.34), align: 'right', track: 1,
      });
    });
    hairline(ctx, X0, Y0 - 30, X0, Y1 + 26, { color: C.bone, alpha: 0.18, lw: 2 });
    [0, 15, 30, 45, 60].forEach((m) => {
      const x = xOf(m);
      hairline(ctx, x, Y1, x, Y1 + 12, { color: C.bone, alpha: 0.2, lw: 2 });
      txt(ctx, `${m}`, x, Y1 + 52, {
        size: 23, font: F.num6, color: hexA(C.bone, 0.34), align: 'center', track: 1,
      });
    });
    txt(ctx, 'MENIT SETELAH ALARM PERTAMA', X0, Y1 + 100, {
      size: 22, font: F.num6, color: hexA(C.bone, 0.32), align: 'left', track: 4,
    });
    ctx.restore();

    /* ------------------------------------------------------------- curve -- */
    const prog = clamp((t - 0.9) / 5.6);
    if (prog > 0.001) {
      const limit = MMAX * prog;
      glowSpot(ctx, xOf(4), yOf(0.8), 420, C.amber, 0.10 * prog);
      ctx.save();
      ctx.beginPath();
      let started = false;
      for (let m = 0; m <= limit; m += 0.4) {
        const x = xOf(m);
        const y = yOf(alert(m));
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = C.amberHi;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = hexA(C.amber, 0.55);
      ctx.shadowBlur = 26;
      ctx.stroke();
      ctx.restore();

      // resets inside the drawn range
      RESETS.forEach((r) => {
        if (r > limit) return;
        const x = xOf(r);
        const yTop = yOf(alert(r - 0.01));
        const yBot = yOf(BASE);
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = hexA(C.red, 0.75);
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 8]);
        ctx.beginPath();
        ctx.moveTo(x, yTop);
        ctx.lineTo(x, yBot);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = C.red;
        ctx.beginPath();
        ctx.arc(x, yBot, 8, 0, TAU);
        ctx.fill();
        ctx.restore();
      });
    }

    /* ------------------------------------------------------------ legend -- */
    const lA = EASE.outCubic(clamp((t - 7.4) / 0.7));
    if (lA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lA;
      ctx.translate(0, lerp(24, 0, lA));
      card(ctx, M, 1570, W - 2 * M, 150, { r: 28, fill: 'rgba(255,255,255,0.03)' });
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.arc(M + 46, 1628, 9, 0, TAU);
      ctx.fill();
      txt(ctx, 'TIGA SNOOZE · TIGA KALI MULAI DARI NOL', M + 74, 1636, {
        size: 27, font: F.num6, color: hexA(C.bone, 0.72), track: 3,
      });
      txt(ctx, 'ALIRAN DARAH KE OTAK BUTUH ±30 MENIT UNTUK KEMBALI NORMAL', M + 46, 1688, {
        size: 24, font: F.num6, color: hexA(C.bone, 0.42), track: 1.5, maxWidth: W - 2 * M - 92,
      });
      ctx.restore();
    }
  },
};
