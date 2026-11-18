import { W, H, txt, fillRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk, paperCard, tape, arrow } from './_kertas.mjs';
import { A, roll, fadeUp, rule, panel, fridge, hatch } from './_cetak.mjs';

// 06 — LAPAR
// Two hormones set as two opposing arrows on two pressed cards, then a shopping
// list where the only crossed-out line is the one that would have helped.
function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 720, glowY: 440, glowA: 0.32 });
  const c = (i) => cue(scene, i);

  const cards = [
    {
      x: 104, w: 568, kick: 'HORMON LAPAR', sub: 'GHRELIN',
      word: 'NAIK', color: K.red, up: true, at: c(1),
    },
    {
      x: 768, w: 568, kick: 'HORMON KENYANG', sub: 'LEPTIN',
      word: 'TURUN', color: K.blue, up: false, at: c(1) + 0.28,
    },
  ];

  cards.forEach((cd, i) => {
    const pCard = A(t, c(0) + 0.1 + i * 0.12, 0.65, ease.back);
    if (pCard <= 0.004) return;
    ctx.save();
    ctx.globalAlpha *= clamp(pCard);
    ctx.translate(0, (1 - clamp(pCard)) * 46);
    paperCard(ctx, cd.x, 356, cd.w, 468, { rot: i ? -0.008 : 0.008 });
    kick(ctx, cd.kick, cd.x + 40, 418, { size: 20, track: 5, color: K.soft });
    tracking(ctx, cd.sub, cd.x + 40, 456, {
      size: 17, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.28)',
    });

    // the arrow is the argument
    const pa = A(t, cd.at, 0.85, ease.out);
    const ax = cd.x + 104;
    if (cd.up) {
      arrow(ctx, ax, 762, ax, 762 - 250 * clamp(pa), {
        color: K.red, lw: 16, head: 46, p: 1,
      });
    } else {
      arrow(ctx, ax, 510, ax, 510 + 250 * clamp(pa), {
        color: K.blue, lw: 16, head: 46, p: 1,
      });
    }
    roll(ctx, cd.word, cd.x + 188, 700, {
      size: 98, p: A(t, cd.at + 0.15, 0.6, ease.expo),
      color: cd.color, font: F.head, track: -3,
    });
    ctx.restore();
  });

  // ── the list ───────────────────────────────────────────────────────────
  const pList = A(t, c(3) - 0.1, 0.6, ease.out);
  if (pList > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pList);
    panel(ctx, 104, 900, 1232, 320, { tab: 'YANG DICARI' });
    const rows = [
      ['KARBOHIDRAT', true],
      ['LEMAK', true],
    ];
    rows.forEach(([word], i) => {
      const p = A(t, c(3) + 0.1 + i * 0.12, 0.5, ease.out);
      ctx.save();
      ctx.globalAlpha = clamp(pList) * clamp(p);
      // tick
      ctx.strokeStyle = K.red;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(148, 1052 + i * 96);
      ctx.lineTo(172, 1078 + i * 96);
      ctx.lineTo(214, 1024 + i * 96);
      ctx.stroke();
      txt(ctx, word, 240, 1074 + i * 96, {
        size: 62, font: F.head, color: K.ink, track: -1.5,
      });
      ctx.restore();
    });
    // the one that is not on the list
    const pSay = A(t, c(3) + 0.34, 0.5, ease.out);
    if (pSay > 0.004) {
      ctx.save();
      ctx.globalAlpha = clamp(pList) * clamp(pSay) * 0.42;
      txt(ctx, 'SAYUR', 880, 1074, { size: 62, font: F.head, color: K.ink, track: -1.5 });
      ctx.restore();
      const pX = A(t, c(3) + 0.5, 0.45, ease.out);
      if (pX > 0.004) {
        ctx.save();
        ctx.globalAlpha = clamp(pList);
        ctx.strokeStyle = K.red;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(866, 1050);
        ctx.lineTo(lerp(866, 1114, pX), 1050);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ── where the night ends ───────────────────────────────────────────────
  const pF = A(t, c(4), 0.7, ease.back);
  if (pF > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pF);
    fridge(ctx, 1176, 1344, 186, { a: clamp(pF) });
    ctx.restore();
    fadeUp(ctx, A(t, c(4) + 0.25, 0.45), 12, () => {
      kick(ctx, 'DAPUR', 104, 1400, { size: 20, track: 6, color: K.soft });
    });
  }
}

export default { draw: drawScene };
