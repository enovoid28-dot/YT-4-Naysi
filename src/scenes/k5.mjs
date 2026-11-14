import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { P, eyebrow, ease, nightWall, lightCone, engraved, sticker } from './_fare.mjs';

// 05 — JENDELA WAKTU
// A calendar on the wall of a dark room. The last two weeks before departure
// are the expensive ones, Tuesday to Thursday are the cheap ones, and the
// sticky note on top is the trick that does nothing.

const COLX = 130;
const COLY = 614;
const CW = 150;
const CH = 142;
const ROWS = 5;
const COLS = 7;
const DOW = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
const DEPART = 31;
const WINDOW_FROM = 18;

// July 2026 starts on a Wednesday -> offset 2 in a Monday-first grid
const OFFSET = 2;
const DAYS = 31;

const cellPos = (day) => {
  const idx = OFFSET + day - 1;
  return { c: idx % COLS, r: Math.floor(idx / COLS) };
};

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    nightWall(ctx, { spotX: W * 0.5, spotY: 520, spotA: 0.13, panels: 4 });
    lightCone(ctx, W * 0.44, -140, 1500, 170, 700, { color: '#FFDFB4', a: 0.05 });

    eyebrow(ctx, 'JENDELA WAKTU', { a: a(0.05, 0.5), rule: P.mint, color: 'rgba(246,241,230,0.62)' });

    /* --------------------------- the calendar --------------------------- */
    const cA = a(0.02, 0.65);
    if (cA <= 0.01) return;
    const s0 = ease.out(clamp((t - 0.02) / 0.55));

    const px = COLX - 26;
    const py = 396 + (1 - s0) * -30;
    const pw = COLS * CW + 52;
    const ph = COLY - py + ROWS * CH + 52;

    ctx.save();
    ctx.globalAlpha = cA;

    // paper, with a soft shadow on the wall
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.70)';
    ctx.shadowBlur = 54;
    ctx.shadowOffsetY = 26;
    fillRR(ctx, px, py, pw, ph, 6, '#F1E5CC');
    ctx.restore();

    // curl at the bottom-right corner
    const gr = linGrad(ctx, px, py, px, py + ph, [
      [0, 'rgba(255,255,255,0.34)'], [0.55, 'rgba(255,255,255,0.02)'], [1, 'rgba(108,84,50,0.22)'],
    ]);
    ctx.save();
    rr(ctx, px, py, pw, ph, 6);
    ctx.clip();
    ctx.fillStyle = gr;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();

    // spiral binding
    ctx.save();
    for (let i = 0; i < 12; i++) {
      const bx = px + 46 + i * ((pw - 92) / 11);
      ctx.strokeStyle = 'rgba(206,222,238,0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, py - 26);
      ctx.lineTo(bx + 2, py + 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx + 1, py - 24, 9, Math.PI, Math.PI * 2.02);
      ctx.strokeStyle = 'rgba(226,238,250,0.42)';
      ctx.lineWidth = 3.4;
      ctx.stroke();
    }
    ctx.restore();
    // punched holes along the top
    for (let i = 0; i < 12; i++) {
      const bx = px + 46 + i * ((pw - 92) / 11);
      ctx.beginPath();
      ctx.arc(bx, py + 16, 5, 0, TAU);
      ctx.fillStyle = 'rgba(30,26,20,0.35)';
      ctx.fill();
    }

    // header
    ctx.fillStyle = 'rgba(178,58,36,0.90)';
    ctx.fillRect(px + 40, py + 46, 74, 5);
    tracking(ctx, 'JULI 2026', px + 40, py + 96, {
      size: 46, font: F.head, track: 2, color: 'rgba(23,19,16,0.90)',
    });
    tracking(ctx, 'JADWAL KEBERANGKATAN', px + 40, py + 130, {
      size: 17, font: F.mono6, track: 4, color: 'rgba(23,19,16,0.48)',
    });
    tracking(ctx, 'HARI KEBERANGKATAN', px + pw - 40, py + 96, {
      size: 16, font: F.mono6, track: 4, color: 'rgba(23,19,16,0.45)', align: 'right',
    });
    txt(ctx, '31', px + pw - 40, py + 148, {
      size: 52, font: F.num, color: '#B23A24', align: 'right', track: -2,
    });

    /* ------------------------- the weekday strip ------------------------ */
    const tueThu = [1, 2, 3];
    DOW.forEach((d, c) => {
      const x = COLX + c * CW + CW / 2;
      const on = tueThu.includes(c);
      if (on) {
        const g = linGrad(ctx, 0, COLY - 62, 0, COLY - 24, [
          [0, 'rgba(60,150,120,0.00)'], [1, 'rgba(60,150,120,0.22)'],
        ]);
        ctx.fillStyle = g;
        ctx.fillRect(COLX + c * CW + 4, COLY - 62, CW - 8, 40);
      }
      tracking(ctx, d, x, COLY - 34, {
        size: 17, font: F.mono6, track: 3, align: 'center',
        color: on ? 'rgba(20,86,68,0.85)' : 'rgba(23,19,16,0.38)',
      });
    });

    /* ------------------------------ the grid ---------------------------- */
    for (let d = 1; d <= DAYS; d++) {
      const { c, r } = cellPos(d);
      const x = COLX + c * CW;
      const y = COLY + r * CH;
      const inWindow = d >= WINDOW_FROM;
      const heat = inWindow ? (d - WINDOW_FROM) / (DEPART - WINDOW_FROM) : 0;
      const appear = ease.out(clamp((t - 0.42 - (r * 0.05 + c * 0.018)) / 0.5));
      if (appear <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha *= appear;

      // heat underlay
      if (inWindow) {
        ctx.globalAlpha *= 0.16 + 0.62 * heat;
        fillRR(ctx, x + 4, y + 4, CW - 8, CH - 8, 4, heat > 0.75 ? '#C2352A' : '#D9772F');
        ctx.globalAlpha /= 0.16 + 0.62 * heat;
      }

      // hairline cell
      ctx.strokeStyle = 'rgba(23,19,16,0.09)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + CW, y);
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + CH);
      ctx.stroke();

      // the day number
      const inkCol = inWindow
        ? (heat > 0.62 ? 'rgba(255,246,238,0.95)' : 'rgba(23,19,16,0.92)')
        : 'rgba(23,19,16,0.62)';
      txt(ctx, `${d}`, x + 16, y + 42, { size: 28, font: F.num6, color: inkCol, track: -0.5 });

      // price level, as a row of small bars (no numbers: too busy at this size)
      if (inWindow) {
        const bars = 1 + Math.round(heat * 4);
        for (let b = 0; b < 5; b++) {
          const onBar = b < bars;
          ctx.fillStyle = onBar
            ? (heat > 0.6 ? 'rgba(255,246,238,0.85)' : 'rgba(150,44,26,0.80)')
            : (heat > 0.6 ? 'rgba(255,246,238,0.22)' : 'rgba(150,44,26,0.16)');
          ctx.fillRect(x + 16, y + 62 + b * 11, 44 + b * 6, 4);
        }
      }

      // departure day: circled in red
      if (d === DEPART) {
        const cp = ease.out(clamp((t - 2.1) / 0.85));
        if (cp > 0.01) {
          ctx.save();
          ctx.globalAlpha *= cp;
          ctx.strokeStyle = 'rgba(178,58,36,0.95)';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.ellipse(x + CW * 0.55, y + CH * 0.52, CW * 0.40 * cp, CH * 0.36 * cp, 0.12, 0, TAU * Math.min(1, cp * 1.02));
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    }

    /* ------------------------- the 14-day bracket ----------------------- */
    const bA = clamp((t - 2.5) / 0.6);
    if (bA > 0.01) {
      const from = cellPos(WINDOW_FROM);
      const to = cellPos(DEPART);
      const bx = COLX + from.c * CW + 4;
      const by = COLY + from.r * CH + CH - 4;
      const bw = COLS * CW - 8;
      const by2 = COLY + to.r * CH + CH - 4;
      ctx.save();
      ctx.globalAlpha = bA;
      ctx.strokeStyle = hexA(P.ember, 0.75);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by + 14);
      ctx.lineTo(COLX + COLS * CW - 4, by + 14);
      ctx.lineTo(COLX + COLS * CW - 4, by2 + 14);
      ctx.stroke();
      // a second, lower tick for the final row
      ctx.strokeStyle = hexA(P.ember, 0.45);
      ctx.beginPath();
      ctx.moveTo(COLX + COLS * CW - 4, by2);
      ctx.lineTo(COLX + COLS * CW - 4, by2 + 14);
      ctx.stroke();
      ctx.restore();
    }

    /* --------------------------- the sticky note ------------------------ */
    const nA = a(7.42, 0.6);
    if (nA > 0.01) {
      const s = ease.expo(clamp((t - 7.42) / 0.55));
      ctx.save();
      ctx.translate(1016, 1470);
      ctx.rotate(-0.075);
      ctx.scale(0.9 + 0.1 * s, 0.9 + 0.1 * s);
      ctx.globalAlpha = nA;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.62)';
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 16;
      fillRR(ctx, -196, -110, 392, 220, 3, '#F2D06B');
      ctx.restore();
      ctx.fillStyle = linGrad(ctx, 0, -110, 0, 110, [
        [0, 'rgba(255,255,255,0.35)'], [0.5, 'rgba(255,255,255,0.0)'], [1, 'rgba(120,88,20,0.20)'],
      ]);
      fillRR(ctx, -196, -110, 392, 220, 3, ctx.fillStyle);
      tracking(ctx, 'MODE', -168, -56, {
        size: 20, font: F.mono6, track: 5, color: 'rgba(23,19,16,0.55)',
      });
      txt(ctx, 'INCOGNITO', -168, -6, {
        size: 46, font: F.head, color: 'rgba(23,19,16,0.88)', track: 0,
      });
      tracking(ctx, 'TIDAK MENOLONG', -168, 44, {
        size: 18, font: F.mono6, track: 4, color: 'rgba(178,58,36,0.80)',
      });
      // struck through
      const sp = ease.out(clamp((t - 7.95) / 0.5));
      if (sp > 0.01) {
        ctx.save();
        ctx.globalAlpha *= sp;
        ctx.strokeStyle = 'rgba(178,58,36,0.92)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-176, -24);
        ctx.lineTo(-176 + 336 * sp, -30 + 8 * sp);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    /* ------------------------------ the rail ---------------------------- */
    const stA = a(4.80, 0.6);
    if (stA > 0.01) {
      ctx.save();
      ctx.globalAlpha = stA;
      ctx.translate(330, 1478);
      ctx.rotate(0.012);
      // a strip of paper taped over the calendar: the cheap days
      fillRR(ctx, -190, -46, 380, 92, 3, '#EFE3CB');
      ctx.save(); // tape
      ctx.globalAlpha *= 0.55;
      ctx.fillStyle = 'rgba(246,241,230,0.55)';
      ctx.fillRect(-210, -60, 74, 24);
      ctx.fillRect(140, -60, 74, 24);
      ctx.restore();
      tracking(ctx, 'SELASA — KAMIS', -164, -12, {
        size: 17, font: F.mono6, track: 3, color: 'rgba(20,86,68,0.80)',
      });
      txt(ctx, 'PALING MURAH', -164, 32, {
        size: 30, font: F.head, color: 'rgba(23,19,16,0.86)',
      });
      ctx.restore();
    }
  },
};
