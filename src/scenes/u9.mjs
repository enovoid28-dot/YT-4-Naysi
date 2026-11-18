import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk, circleMark } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot } from './_cetak.mjs';
import { phone, drawer, chip, mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';

// 09 — SATU HAL
// One instruction, drawn as a physical act: the phone goes into a drawer, the
// drawer closes, and the room is quiet. Then the question that ends the film.
function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 4.6, 8.2, 12.0]);
  const cam = shotCam(t, 0.9);

  sheet(ctx, t, { glowX: 700, glowY: 500, glowA: 0.36 });
  sheen(ctx, t, { period: 6.8, a: 0.06 });

  // ── the cabinet, and the drawer the phone ends up in ───────────────────
  const pD = land(t, c(0), 0.9);
  const open = 1 - A(t, c(1) + 0.7, 1.3, (x) => clamp(x) ** 0.7);
  if (pD > 0.004) {
    plane(ctx, cam, 0.5, () => {
      const cx0 = 748;
      const cy0 = 566;
      const cw = 548;
      const ch = 744;
      ctx.save();
      ctx.globalAlpha *= clamp(pD);
      // body
      ctx.fillStyle = 'rgba(20,17,16,0.16)';
      rr(ctx, cx0 + 14, cy0 + 20, cw, ch, 8);
      ctx.fill();
      ctx.fillStyle = K.card;
      rr(ctx, cx0, cy0, cw, ch, 8);
      ctx.fill();
      ctx.strokeStyle = K.ink;
      ctx.lineWidth = 4;
      rr(ctx, cx0, cy0, cw, ch, 8);
      ctx.stroke();
      // two closed drawers above
      [0.14, 0.40].forEach((f) => {
        ctx.strokeStyle = 'rgba(20,17,16,0.45)';
        ctx.lineWidth = 2.6;
        rr(ctx, cx0 + 34, cy0 + ch * f, cw - 68, ch * 0.2, 4);
        ctx.stroke();
        ctx.fillStyle = 'rgba(20,17,16,0.35)';
        rr(ctx, cx0 + cw / 2 - 46, cy0 + ch * f + ch * 0.1 - 4, 92, 9, 4);
        ctx.fill();
      });
      // the open one, pulled toward the viewer
      const pull = clamp(open) * 84;
      ctx.save();
      ctx.translate(0, pull);
      // the dark mouth of the drawer
      ctx.fillStyle = 'rgba(20,17,16,0.10)';
      rr(ctx, cx0 + 34, cy0 + ch * 0.655, cw - 68, ch * 0.3, 4);
      ctx.fill();
      ctx.strokeStyle = K.ink;
      ctx.lineWidth = 3;
      rr(ctx, cx0 + 34, cy0 + ch * 0.655, cw - 68, ch * 0.3, 4);
      ctx.stroke();
      ctx.fillStyle = K.card;
      rr(ctx, cx0 + 34, cy0 + ch * 0.655 + ch * 0.3 - 6, cw - 68, 44, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,17,16,0.5)';
      ctx.lineWidth = 3;
      rr(ctx, cx0 + 34, cy0 + ch * 0.655 + ch * 0.3 - 6, cw - 68, 44, 4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(20,17,16,0.4)';
      rr(ctx, cx0 + cw / 2 - 50, cy0 + ch * 0.655 + ch * 0.3 + 12, 100, 10, 5);
      ctx.fill();
      // the light inside, only while the drawer is open
      ctx.globalAlpha = clamp(pD) * clamp(open) * 0.5;
      const g = ctx.createLinearGradient(cx0, cy0 + ch * 0.66, cx0, cy0 + ch * 0.95);
      g.addColorStop(0, 'rgba(27,63,214,0.55)');
      g.addColorStop(1, 'rgba(27,63,214,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx0 + 36, cy0 + ch * 0.66, cw - 72, ch * 0.26);
      ctx.restore();
      ctx.restore();
    });
  }

  // ── the phone goes in, and stays there ─────────────────────────────────
  const pGo = A(t, c(1), 1.7, (x) => clamp(x) ** 1.3);
  const pShow = A(t, c(0) + 0.25, 0.6);
  if (pShow > 0.004) {
    plane(ctx, cam, 1.05, () => {
      const y = lerp(392, 1006, pGo);
      const lit = lerp(1, 0.35, clamp((pGo - 0.5) / 0.5));
      ghosts(ctx, { dy: -(y - 392) * 0.14, n: 4, spread: 0.8, alpha: 0.12 }, () => {
        phone(ctx, 1018, y, 168, 336, {
          a: clamp(pShow), lit, glare: 0.22, rot: lerp(-0.05, 0.02, pGo),
        });
      });
    });
  }

  // ── the one instruction, as a printed card ─────────────────────────────
  const pCard = land(t, c(0) + 0.15, 0.85);
  if (pCard > 0.004) {
    plane(ctx, cam, 1.15, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pCard);
      ctx.translate(0, (1 - clamp(pCard)) * 30);
      const x = 104;
      const y = 400;
      ctx.fillStyle = 'rgba(20,17,16,0.16)';
      rr(ctx, x + 12, y + 16, 540, 470, 6);
      ctx.fill();
      ctx.fillStyle = K.card;
      rr(ctx, x, y, 540, 470, 6);
      ctx.fill();
      ctx.strokeStyle = K.ink;
      ctx.lineWidth = 3;
      rr(ctx, x, y, 540, 470, 6);
      ctx.stroke();

      kick(ctx, 'SATU HAL', x + 40, y + 62, { size: 19, track: 6, color: 'rgba(20,17,16,0.5)' });
      txt(ctx, 'Jauhkan', x + 38, y + 176, { size: 74, font: F.head, color: K.ink, track: -2 });
      txt(ctx, 'HP dari', x + 38, y + 254, { size: 74, font: F.head, color: K.ink, track: -2 });
      txt(ctx, 'jangkauan.', x + 38, y + 332, { size: 74, font: F.head, color: RED, track: -2 });
      kick(ctx, 'BUKAN SENYAP · BUKAN TERBALIK', x + 40, y + 408, {
        size: 18, track: 4, color: 'rgba(20,17,16,0.45)',
      });
      ctx.restore();
    });
  }

  // ── the hand-drawn ring around the phone, once it is in ────────────────
  const pRing = A(t, c(2), 0.8, (x) => 1 - Math.pow(1 - clamp(x), 2));
  if (pRing > 0.004) {
    circleMark(ctx, 1018, 906, 172, 128, pRing, { color: RED, lw: 5, rot: -0.12 });
    fadeUp(ctx, A(t, c(2) + 0.3, 0.45), 10, () => {
      tracking(ctx, 'DI RUANGAN LAIN', 1018, 1360, {
        size: 22, font: F.mono6, track: 6, color: RED, align: 'center',
      });
    });
  }

  // ── the question ───────────────────────────────────────────────────────
  const pQ = A(t, c(3), 0.7, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pQ > 0.004) {
    plane(ctx, cam, 0.8, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pQ);
      ctx.fillStyle = 'rgba(20,17,16,0.16)';
      ctx.fillRect(104, 1290, (W - 208) * clamp(pQ), 2);
      ctx.restore();
      roll(ctx, '?', 96, 1470, {
        size: 150, p: pQ, color: RED, font: F.display, track: -2,
      });
      fadeUp(ctx, A(t, c(3) + 0.25, 0.45), 10, () => {
        tracking(ctx, 'BERAPA KALI KAMU BUKA HP HARI INI?', 250, 1400, {
          size: 22, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.55)',
        });
      });
    });
  }
}

export default { draw: drawScene };
