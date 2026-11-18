import { W, H, txt, fillRR, rr, measure, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, cue, sheet, kick, stampInk, paperCard, tape } from './_kertas.mjs';
import { A, roll, fadeUp, rule, hatch, panel, bracket } from './_cetak.mjs';

// 02 — UTANG
// A work-week ledger. Every row is one night, the rail is the same nine-hour
// scale for all five, and the red hatching is the part of the night that was
// never taken. The total is the only number that matters.
function drawScene(ctx, t, scene) {
  sheet(ctx, t, { glowX: 620, glowY: 360, glowA: 0.34 });
  const c = (i) => cue(scene, i);

  // ── the requirement ────────────────────────────────────────────────────
  fadeUp(ctx, A(t, c(0), 0.45), 14, () => {
    kick(ctx, 'ORANG DEWASA BUTUH', 104, 340, { size: 21, track: 7, color: K.soft });
  });
  roll(ctx, '7–9', 104, 566, { size: 214, p: A(t, c(0) + 0.06, 0.8, ease.expo), track: -12 });
  fadeUp(ctx, A(t, c(0) + 0.3, 0.45), 12, () => {
    kick(ctx, 'JAM', 110, 626, { size: 26, track: 8, color: K.red });
  });

  // what you actually got, set beside the requirement
  const pYou = A(t, c(1), 0.55, ease.back);
  if (pYou > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pYou);
    const x = 790;
    const y = 330 + (1 - clamp(pYou)) * 18;
    kick(ctx, 'TIDURMU', x + 4, y + 12, { size: 21, track: 6, color: K.soft });
    roll(ctx, '6', x - 6, y + 240, { size: 226, p: pYou, color: K.ink, track: -10 });
    kick(ctx, 'JAM', x + 132, y + 240, { size: 28, track: 6, color: K.red });
    kick(ctx, 'KURANG 2 JAM', x + 4, y + 296, { size: 21, track: 5, color: K.red });
    ctx.restore();
  }

  // ── five nights ────────────────────────────────────────────────────────
  const rows = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM'];
  const x0 = 236;
  const x1 = 1146;
  const hrs = 9;
  const px = (h) => x0 + (h / hrs) * (x1 - x0);

  // the scale, printed once above column one
  const pScale = A(t, c(1) + 0.02, 0.5);
  if (pScale > 0.004) {
    ctx.save();
    ctx.globalAlpha *= pScale;
    for (let h = 0; h <= hrs; h++) {
      const x = px(h);
      ctx.fillStyle = 'rgba(20,17,16,0.30)';
      ctx.fillRect(x - 1, 646, 2, h === 0 || h === hrs ? 16 : 9);
      if (h % 3 === 0) {
        tracking(ctx, String(h), x, 690, {
          size: 17, font: F.mono6, track: 1, color: 'rgba(20,17,16,0.45)', align: 'center',
        });
      }
    }
    ctx.restore();
  }

  const rowY = (i) => 700 + i * 108;
  for (let i = 0; i < rows.length; i++) {
    const p = A(t, c(1) + 0.06 + i * 0.11, 0.55, ease.out);
    if (p <= 0.004) continue;
    const y = rowY(i);
    ctx.save();
    ctx.globalAlpha *= clamp(p * 1.4);
    // day
    tracking(ctx, rows[i], 104, y, {
      size: 26, font: F.mono6, track: 4, color: K.ink2,
    });
    // the seven-to-nine band, as a light plate under the rail
    ctx.fillStyle = 'rgba(20,17,16,0.06)';
    ctx.fillRect(px(7), y - 40, px(9) - px(7), 66);
    // six hours slept
    ctx.fillStyle = K.ink;
    ctx.fillRect(px(0), y - 12, (px(6) - px(0)) * clamp((p - 0.1) / 0.9), 30);
    // the two that were not
    hatch(ctx, px(6), y - 12, px(8) - px(6), 30, { gap: 11, lw: 2.4, a: 0.95, p: clamp((p - 0.5) / 0.5) });
    ctx.strokeStyle = K.red;
    ctx.lineWidth = 2;
    ctx.strokeRect(px(6) - 0.5, y - 12.5, px(8) - px(6), 31);
    // the deficit
    txt(ctx, '−2', 1336, y + 12, {
      size: 42, font: F.num, color: K.red, align: 'right', track: -1,
    });
    // row rule
    ctx.fillStyle = K.hair;
    ctx.fillRect(104, y + 40, W - 208, 1.6);
    ctx.restore();
  }

  // ── the total ──────────────────────────────────────────────────────────
  const pT = A(t, c(2), 0.55);
  if (pT > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pT);
    tracking(ctx, '5  HARI  ×  2  JAM  =', 108, 1300, {
      size: 24, font: F.mono6, track: 3, color: K.soft,
    });
    roll(ctx, '10', 96, 1482, { size: 196, p: A(t, c(2) + 0.06, 0.7, ease.expo), color: K.red, track: -11 });
    kick(ctx, 'JAM HILANG', 430, 1392, { size: 30, track: 6, color: K.red });
    kick(ctx, 'DARI LIMA MALAM KERJA', 432, 1444, { size: 20, track: 5, color: K.soft });
    ctx.restore();
  }

  // ── the night never taken: a note pressed over the panel ───────────────
  const pCard = A(t, c(3), 0.6, ease.back);
  if (pCard > 0.004) {
    ctx.save();
    ctx.globalAlpha *= clamp(pCard);
    ctx.translate(0, (1 - clamp(pCard)) * 40);
    const x = 940;
    const y = 1196;
    paperCard(ctx, x, y, 396, 236, { rot: 0.022 });
    tape(ctx, x + 150, y - 2, 220, -0.05);
    kick(ctx, 'TIDAK PERNAH', x + 32, y + 54, { size: 18, track: 4, color: K.soft });
    kick(ctx, 'DIAMBIL', x + 32, y + 82, { size: 18, track: 4, color: K.soft });
    txt(ctx, '8', x + 30, y + 200, { size: 128, font: F.num, color: K.ink, track: -5 });
    kick(ctx, 'JAM UTUH', x + 116, y + 200, { size: 23, track: 5, color: K.ink2 });
    ctx.restore();
  }
}

export default { draw: drawScene };
