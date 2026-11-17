import { W, H, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, dust, micro, number, A, cue, cueWord, ease, TAU, clamp, lerp, rng, pill,
} from './_malam.mjs';

// 02 — UTANG
// Monday to Friday, one bar a night, on an axis you can read: eight hours is the
// rail, six is what got slept, and the two red hours left over never disappear.
// By Friday the leftovers have stacked into ten hours — one whole night nobody
// ever took — and the stack is drawn where the eye lands first.

const X0 = 236;
const X1 = 944;
const HOURS = 8;
const U = (X1 - X0) / HOURS;
const TH = 88;
const Y0 = 806;
const STEP = 152;
const STACK_X = 1004;

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];

function rail(ctx, y, o = {}) {
  const { a = 1 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(255,246,232,0.13)';
  ctx.lineWidth = 2;
  fillRR(ctx, X0, y, X1 - X0, TH, TH / 2, 'rgba(255,246,232,0.025)');
  strokeRR(ctx, X0, y, X1 - X0, TH, TH / 2, 'rgba(255,246,232,0.13)', 2);
  ctx.restore();
}

function bar(ctx, y, hours, o = {}) {
  const { a = 1, color = M.amber, from = 1, glow = 26 } = o;
  if (a <= 0.01) return;
  const w = hours * U * from;
  if (w < 3) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(X0, y, X0 + Math.max(w, 4), y);
  g.addColorStop(0, hexA(color, 0.34));
  g.addColorStop(0.5, hexA(color, 0.82));
  g.addColorStop(1, hexA(color, 1));
  ctx.shadowColor = hexA(color, 0.22);
  ctx.shadowBlur = glow * 0.35;
  fillRR(ctx, X0, y, w, TH, TH / 2, g);
  ctx.shadowBlur = 0;
  // a specular line along the top of the bar, so it reads as a lit object
  ctx.save();
  ctx.beginPath();
  ctx.rect(X0, y, w, TH);
  ctx.clip();
  const hl = ctx.createLinearGradient(0, y, 0, y + TH * 0.55);
  hl.addColorStop(0, 'rgba(255,255,255,0.30)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(X0, y, w, TH * 0.55);
  ctx.restore();
  ctx.restore();
}

function pocket(ctx, y, o = {}) {
  const { a = 1, x = X0 + 6 * U, w = 2 * U, color = M.red } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.beginPath();
  ctx.rect(x, y, w, TH);
  ctx.clip();
  ctx.strokeStyle = hexA(color, 0.30);
  ctx.lineWidth = 2;
  for (let i = -TH; i < w + TH; i += 18) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + TH);
    ctx.lineTo(x + i + TH, y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.setLineDash([12, 10]);
  strokeRR(ctx, x, y, w, TH, TH / 2, hexA(color, 0.72), 3);
  ctx.restore();
}

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't2b', window: false, warm: 0.8 });
    dust(ctx, t, { a: 0.14, seed: 9, y0: 500, y1: 1600 });

    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    const wSep = cueWord(scene, 2, 'sepuluh');
    const out12 = 1 - A(t, c[2], 0.5, ease.out);
    const barsFade = 1 - 0.66 * A(t, c[3] + 0.25, 1.3, ease.inOut);
    const firstA = A(t, c[0], 0.7, ease.out);

    /* ── the axis: hours across the top, so a bar has a length you can name ── */
    ctx.save();
    ctx.globalAlpha *= firstA * (0.45 + 0.55 * out12) * barsFade;
    ctx.strokeStyle = 'rgba(255,246,232,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X0, Y0 - 34);
    ctx.lineTo(X1, Y0 - 34);
    ctx.stroke();
    for (let h = 0; h <= HOURS; h += 2) {
      const x = X0 + h * U;
      ctx.beginPath();
      ctx.moveTo(x, Y0 - 34);
      ctx.lineTo(x, Y0 - 16);
      ctx.stroke();
      micro(ctx, `${h} JAM`, x, Y0 - 52, {
        size: 25, color: h === 6 ? hexA(M.amber, 0.9) : M.faint, track: 4, align: 'center', a: 1,
      });
    }
    ctx.restore();

    /* ── one full night ───────────────────────────────────────────────────── */
    if (firstA > 0.01) {
      const grow = A(t, c[0] + 0.1, 1.6, ease.inOut);
      ctx.save();
      ctx.globalAlpha *= out12;
      rail(ctx, Y0, { a: firstA * 0.9 });
      bar(ctx, Y0, 8, { a: firstA, from: 0.04 + 0.96 * grow, glow: 30 });
      micro(ctx, 'SENIN', X0 - 28, Y0 + TH / 2 + 9, { size: 25, color: M.dim, track: 4, align: 'right', a: firstA });
      micro(ctx, '8 JAM', X0 + 8 * U + 18, Y0 + TH / 2 + 9, {
        size: 27, color: M.gold, track: 4, a: A(t, c[0] + 1.5, 0.5),
      });
      ctx.restore();
    }

    /* ── six hours, and the two that went missing ─────────────────────────── */
    const cut = A(t, c[1] + 0.05, 1.2, ease.inOut);
    if (cut > 0.01) {
      ctx.save();
      ctx.globalAlpha *= out12;
      rail(ctx, Y0, { a: 1 });
      bar(ctx, Y0, lerp(8, 6, cut), { a: 1 });
      pocket(ctx, Y0, { a: A(t, c[1] + 0.5, 0.6, ease.out) });
      micro(ctx, '−2 JAM', X0 + 7 * U, Y0 + TH + 52, {
        size: 31, color: M.red, track: 3, align: 'center', a: A(t, c[1] + 0.65, 0.6, ease.out),
      });
      // the four nights that were not even a weekday yet
      for (let i = 1; i < 5; i++) {
        const p = A(t, c[2] - 0.3 + i * 0.1, 0.5, ease.out);
        if (p <= 0.01) continue;
        ctx.save();
        ctx.globalAlpha *= p * 0.5;
        rail(ctx, Y0 + i * STEP, { a: 1 });
        ctx.restore();
      }
      ctx.restore();
    }

    /* ── Monday to Friday, five times the same short night ────────────────── */
    const weekA = A(t, c[2] - 0.15, 0.6, ease.out);
    if (weekA > 0.01) {
      for (let i = 0; i < 5; i++) {
        const p = out12 < 1 && i === 0 ? 1 : A(t, c[2] - 0.15 + i * 0.12, 0.55, ease.out);
        if (p <= 0.01) continue;
        const y = Y0 + i * STEP;
        ctx.save();
        ctx.globalAlpha *= barsFade;
        rail(ctx, y, { a: p * 0.9 });
        bar(ctx, y, 6, { a: p, glow: 18 });
        pocket(ctx, y, { a: p * 0.92 });
        micro(ctx, DAYS[i], X0 - 28, y + TH / 2 + 9, { size: 25, color: M.dim, track: 4, align: 'right', a: p });
        ctx.restore();
      }
      micro(ctx, 'LIMA HARI KERJA · LIMA MALAM 6 JAM', X0 - 4, Y0 - 126, {
        size: 26, color: M.faint, track: 6, a: A(t, c[2] + 0.2, 0.6) * barsFade,
      });

      /* ── the leftovers lift out and stack into a number ─────────────────── */
      for (let i = 0; i < 5; i++) {
        const p = A(t, c[2] + 0.55 + i * 0.14, 1.1, ease.inOut);
        if (p <= 0.01) continue;
        const x = lerp(X0 + 6 * U, STACK_X, p);
        const y = lerp(Y0 + i * STEP, Y0 + 372 + i * 96, p);
        ctx.save();
        ctx.globalAlpha *= Math.min(1, p * 1.4) * barsFade;
        const g = ctx.createLinearGradient(x, y, x + 260, y);
        g.addColorStop(0, hexA(M.gold, 0.38));
        g.addColorStop(1, hexA(M.amber, 0.96));
        ctx.shadowColor = hexA(M.amber, 0.45);
        ctx.shadowBlur = 24;
        fillRR(ctx, x, y, 260, TH, TH / 2, g);
        ctx.restore();
      }
    }

    /* ── the number the scene exists for ─────────────────────────────────── */
    const tot = A(t, wSep - 0.4, 0.7, ease.out);
    if (tot > 0.01) {
      number(ctx, '10', STACK_X + 24, 500, { size: 252, color: M.ink, a: tot, glow: 0.3 });
      micro(ctx, 'JAM HILANG', STACK_X + 34, 562, { size: 32, color: M.amber, track: 9, a: tot });
      micro(ctx, 'SATU MALAM PENUH', STACK_X + 34, 612, { size: 25, color: M.faint, track: 6, a: tot });
    }

    /* ── the night that was never taken, outlined where a night goes ──────── */
    const ghostA = A(t, c[3] + 0.35, 1.1, ease.inOut);
    if (ghostA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= ghostA;
      const breathe = 0.7 + 0.3 * Math.sin(t * 1.2);
      ctx.setLineDash([24, 18]);
      ctx.strokeStyle = hexA(M.ice, 0.40 + 0.32 * breathe);
      ctx.lineWidth = 5;
      ctx.shadowColor = hexA(M.ice, 0.45);
      ctx.shadowBlur = 22;
      strokeRR(ctx, X0, Y0, 8 * U, TH, TH / 2, hexA(M.ice, 0.40 + 0.32 * breathe), 5);
      ctx.restore();
      micro(ctx, 'TIDAK PERNAH DIAMBIL', X0 + 8 * U * 0.5, Y0 + TH / 2 + 9, {
        size: 26, color: hexA(M.ice, 0.95), track: 9, align: 'center', a: ghostA * 0.95,
      });
    }
  },
};
