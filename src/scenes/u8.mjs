import { W, H, txt, rr, fillRR, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, sheet, kick, stampInk } from './_kertas.mjs';
import { A, roll, fadeUp, rule, dot } from './_cetak.mjs';
import { mkCue, shotCam, BLUE, RED } from './_layar.mjs';
import { plane, ghosts, sheen, land, reveal } from '../engine/rig.mjs';

// 08 — MITOS
// Two figures on one sheet. The one everybody quotes gets struck out twice, the
// one that was actually measured gets stamped. The strike is drawn, not faded,
// because a myth does not fade — it has to be crossed off.
function drawScene(ctx, t, scene) {
  const c = mkCue(scene, [0.3, 4.2, 9.0]);
  const cam = shotCam(t, 1);

  sheet(ctx, t, { glowX: 720, glowY: 460, glowA: 0.3 });
  sheen(ctx, t, { period: 5.2, a: 0.07 });

  // ── the myth ───────────────────────────────────────────────────────────
  plane(ctx, cam, 0.35, () => {
    fadeUp(ctx, A(t, c(0), 0.45), 12, () => {
      kick(ctx, 'YANG DIKUTIP SEMUA ORANG', 104, 330, {
        size: 20, track: 5, color: 'rgba(20,17,16,0.45)',
      });
    });
    const pM = A(t, c(0) + 0.1, 0.7, (x) => 1 - Math.pow(1 - clamp(x), 3));
    if (pM > 0.004) {
      ctx.save();
      ctx.globalAlpha *= clamp(pM);
      txt(ctx, '8 DETIK', 96, 560, {
        size: 190, font: F.display, color: 'rgba(20,17,16,0.42)', track: -6,
      });
      ctx.restore();
    }
  });

  // two strikes, drawn on, slightly apart — the way a person crosses something out
  const pStrike = A(t, c(0) + 0.55, 0.7, (x) => 1 - Math.pow(1 - clamp(x), 2));
  if (pStrike > 0.004) {
    plane(ctx, cam, 0.6, () => {
      ctx.save();
      ctx.globalAlpha *= 0.95;
      ctx.strokeStyle = RED;
      ctx.lineCap = 'round';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(88, 500);
      ctx.lineTo(lerp(88, 640, clamp(pStrike)), 500 + 40 * clamp(pStrike));
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.globalAlpha *= 0.6;
      ctx.beginPath();
      ctx.moveTo(96, 524);
      ctx.lineTo(lerp(96, 620, clamp(pStrike)), 528);
      ctx.stroke();
      ctx.restore();
    });
  }

  // the stamp that closes the myth out
  const pStamp = A(t, c(0) + 1.0, 0.45, (x) => 1 - Math.pow(1 - clamp(x), 4));
  stampInk(ctx, 'MITOS', 560, 660, {
    a: clamp(pStamp), size: 58, track: 10, rot: -0.07, color: RED, pad: 30,
  });

  // ── the measured one ───────────────────────────────────────────────────
  const pReal = A(t, c(1), 0.75, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pReal > 0.004) {
    plane(ctx, cam, 0.95, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pReal);
      ctx.fillStyle = K.ink;
      ctx.fillRect(104, 830, (W - 208) * clamp(pReal), 3);
      ctx.restore();
      fadeUp(ctx, A(t, c(1) + 0.15, 0.45), 10, () => {
        kick(ctx, 'YANG BENAR-BENAR DIUKUR', 104, 900, {
          size: 20, track: 5, color: 'rgba(20,17,16,0.5)',
        });
      });
    });
  }

  const pBig = A(t, c(1) + 0.2, 0.8, (x) => 1 - Math.pow(1 - clamp(x), 3));
  if (pBig > 0.004) {
    plane(ctx, cam, 1.2, () => {
      // it lands on top of the myth, physically
      reveal(ctx, 90, 960, 900, 260, A(t, c(1) + 0.2, 0.8), 'left', () => {
        txt(ctx, '47 DETIK', 96, 1150, {
          size: 196, font: F.display, color: K.ink, track: -6,
        });
      });
      fadeUp(ctx, A(t, c(1) + 0.6, 0.45), 10, () => {
        kick(ctx, 'DI SATU LAYAR, SEBELUM PINDAH', 110, 1212, {
          size: 21, track: 5, color: RED,
        });
      });
    });
  }

  // ── not a detox ────────────────────────────────────────────────────────
  const pDetox = A(t, c(2), 0.6);
  if (pDetox > 0.004) {
    plane(ctx, cam, 0.7, () => {
      ctx.save();
      ctx.globalAlpha *= clamp(pDetox) * 0.7;
      ctx.strokeStyle = 'rgba(20,17,16,0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([9, 9]);
      ctx.beginPath();
      ctx.moveTo(104, 1310);
      ctx.lineTo(104 + (W - 208) * clamp(pDetox), 1310);
      ctx.stroke();
      ctx.restore();
      fadeUp(ctx, A(t, c(2) + 0.2, 0.45), 10, () => {
        tracking(ctx, 'BUKAN DETOKS', 104, 1374, {
          size: 26, font: F.mono6, track: 7, color: 'rgba(20,17,16,0.5)',
        });
      });
    });
  }

  // a small annotation arrow from the struck myth to the measured figure
  const pAnn = A(t, c(1) + 0.9, 0.6);
  if (pAnn > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pAnn) * 0.55;
    ctx.strokeStyle = 'rgba(20,17,16,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(760, 700);
    ctx.lineTo(880, 700);
    ctx.lineTo(880, 830);
    ctx.stroke();
    ctx.restore();
  }
}

export default { draw: drawScene };
