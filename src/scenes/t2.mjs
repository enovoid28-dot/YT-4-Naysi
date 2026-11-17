import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, dust, micro, number, A, cue, cueWord, ease, hexA, fillRR, TAU, clamp, lerp, txt,
} from './_malam.mjs';

// 02 — UTANG
// One night is a bar eight hours long; the night the viewer gets is six, and the
// two hours left over never go away. Five working nights later they have piled
// into ten — a whole night nobody took. The column of pockets is the picture of
// a debt, not a chart of one.

const X0 = 112;
const X1 = 900;
const HOURS = 9;
const U = (X1 - X0) / HOURS;
const TH = 84;
const Y0 = 706;
const STEP = 152;

function bar(ctx, y, hours, o = {}) {
  const { a = 1, th = TH, color = M.amber, from = 1, glow = 34 } = o;
  if (a <= 0.01) return;
  const w = hours * U * from;
  if (w < 2) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(X0, y, X0 + w, y);
  g.addColorStop(0, hexA(color, 0.22));
  g.addColorStop(0.5, hexA(color, 0.70));
  g.addColorStop(1, hexA(color, 0.98));
  ctx.fillStyle = g;
  ctx.shadowColor = hexA(color, 0.40);
  ctx.shadowBlur = glow;
  fillRR(ctx, X0, y, w, th, th / 2, g);
  ctx.restore();
}

function pocket(ctx, y, o = {}) {
  const { a = 1, th = TH, x = X0 + 6 * U, w = 2 * U, color = M.red } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.setLineDash([14, 11]);
  ctx.strokeStyle = hexA(color, 0.62);
  ctx.lineWidth = 3;
  fillRR(ctx, x, y, w, th, th / 2, 'rgba(255,110,90,0.05)');
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't2', window: false, warm: 0.8 });
    dust(ctx, t, { a: 0.16, seed: 9, y0: 500, y1: 1600 });

    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const wSepuluh = cueWord(scene, 2, 'sepuluh');
    const out12 = 1 - A(t, c[2], 0.5, ease.out);          // the single-night labels
    const barsFade = 1 - 0.72 * A(t, c[3] + 0.2, 1.3, ease.inOut);

    // ── caption 1: one full night, eight hours
    const firstA = A(t, c[0], 0.7, ease.out);
    if (firstA > 0.01) {
      const grow = A(t, c[0] + 0.1, 1.5, ease.inOut);
      ctx.save();
      ctx.globalAlpha *= out12;
      bar(ctx, Y0, 8, { a: firstA, from: 0.05 + 0.95 * grow });
      micro(ctx, 'SEMALAM', X0, Y0 - 30, { size: 23, color: M.faint, track: 10, a: firstA * 0.95 });
      micro(ctx, '8 JAM', X0 + 8 * U, Y0 - 30, {
        size: 26, color: M.gold, track: 5, align: 'right', a: A(t, c[0] + 1.35, 0.6),
      });
      ctx.restore();
    }

    // ── caption 2: six hours, and a red pocket for the two that are missing
    const cut = A(t, c[1] + 0.05, 1.2, ease.inOut);
    if (cut > 0.01) {
      ctx.save();
      ctx.globalAlpha *= out12;
      bar(ctx, Y0, lerp(8, 6, cut), { a: 1 });
      pocket(ctx, Y0, { a: A(t, c[1] + 0.55, 0.6, ease.out) });
      micro(ctx, '−2 JAM', X0 + 7 * U, Y0 + TH + 46, {
        size: 30, color: M.red, track: 3, align: 'center', a: A(t, c[1] + 0.7, 0.6, ease.out),
      });
      ctx.restore();
    }

    // ── the five working nights
    const weekA = A(t, c[2] - 0.15, 0.6, ease.out);
    if (weekA > 0.01) {
      for (let i = 1; i < 5; i++) {
        const p = A(t, c[2] - 0.15 + i * 0.12, 0.55, ease.out);
        if (p <= 0.01) continue;
        const y = Y0 + i * STEP;
        ctx.save();
        ctx.globalAlpha *= barsFade;
        bar(ctx, y, 6, { a: p, glow: 20 });
        pocket(ctx, y, { a: p * 0.9 });
        ctx.restore();
      }
      if (out12 < 1) {
        ctx.save();
        ctx.globalAlpha *= barsFade;
        bar(ctx, Y0, 6, { a: 1, glow: 20 });
        pocket(ctx, Y0, { a: 1 });
        ctx.restore();
      }
      micro(ctx, 'LIMA MALAM KERJA', X0, Y0 - 30, {
        size: 23, color: M.faint, track: 9, a: A(t, c[2] + 0.25, 0.6) * barsFade,
      });

      // the pockets lift out of each night and stack up on the right
      const stackX = 976;
      for (let i = 0; i < 5; i++) {
        const p = A(t, c[2] + 0.85 + i * 0.13, 1.0, ease.inOut);
        if (p <= 0.01) continue;
        const x = lerp(X0 + 6 * U, stackX, p);
        const y = lerp(Y0 + i * STEP, Y0 + 210 + i * 92, p);
        ctx.save();
        ctx.globalAlpha *= Math.min(1, p * 1.5);
        const g = ctx.createLinearGradient(x, y, x + 216, y);
        g.addColorStop(0, hexA(M.gold, 0.40));
        g.addColorStop(1, hexA(M.amber, 0.95));
        ctx.fillStyle = g;
        ctx.shadowColor = hexA(M.amber, 0.5);
        ctx.shadowBlur = 26;
        fillRR(ctx, x, y, 216, TH, TH / 2, g);
        ctx.restore();
      }
    }

    // ── the number the scene exists for
    const tot = A(t, wSepuluh - 0.35, 0.7, ease.out);
    if (tot > 0.01) {
      number(ctx, '10', 1010, 470, { size: 250, color: M.ink, a: tot, glow: 0.35 });
      micro(ctx, 'JAM HILANG', 1016, 534, { size: 30, color: M.amber, track: 8, a: tot });
    }

    // ── caption 4: the night that was never taken, outlined where a night goes
    const ghostA = A(t, c[3] + 0.35, 1.1, ease.inOut);
    if (ghostA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= ghostA;
      const breathe = 0.7 + 0.3 * Math.sin(t * 1.2);
      ctx.setLineDash([26, 20]);
      ctx.strokeStyle = hexA(M.ice, 0.42 + 0.3 * breathe);
      ctx.lineWidth = 5;
      ctx.shadowColor = hexA(M.ice, 0.45);
      ctx.shadowBlur = 26;
      ctx.strokeRect(X0, Y0, 8 * U, TH);
      ctx.setLineDash([]);
      ctx.restore();
      micro(ctx, 'TIDAK PERNAH DIAMBIL', X0, Y0 + TH + 76, {
        size: 28, color: M.ice, track: 7, a: ghostA * 0.95,
      });
    }
  },
};
