/**
 * Episode 21 cover — v3, drawn on the same printed sheet as the film.
 *
 * A cover has one job at 200 px wide: three words you can read without thinking
 * and one red mark that says the words are a bill, not a tip. So: paper, ink,
 * four pressed hours stopped by a red line, and the clock that started it.
 */
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { ensureFonts, F } from '../src/engine/fonts.mjs';
import { W, H, txt, fillRR, rr, tracking } from '../src/engine/draw.mjs';
import { K, sheet, stampInk } from '../src/scenes/_kertas.mjs';
import { clock, hatch } from '../src/scenes/_cetak.mjs';

await ensureFonts();
const c = createCanvas(W, H);
const ctx = c.getContext('2d');

sheet(ctx, 0.4, { glowX: 820, glowY: 460, glowA: 0.44 });

// ── the hook ──────────────────────────────────────────────────────────────
ctx.fillStyle = K.red;
ctx.fillRect(104, 148, 18, 18);
txt(ctx, 'NAYSI', 140, 170, { size: 34, font: F.head, color: K.ink, track: 7 });
tracking(ctx, 'EP 21 · UTANG TIDUR', W - 104, 168, {
  size: 22, font: F.mono6, track: 5, color: 'rgba(20,17,16,0.45)', align: 'right',
});

txt(ctx, 'TIDUR', 96, 500, { size: 168, font: F.display, color: K.ink, track: -4 });
txt(ctx, 'ENAM JAM', 96, 706, { size: 210, font: F.display, color: K.ink, track: -8 });
txt(ctx, 'ITU UTANG.', 96, 918, { size: 176, font: F.display, color: K.red, track: -5 });

// ── four hours, stopped ───────────────────────────────────────────────────
const by = 1010;
const bh = 168;
const gap = 16;
const bw = (W - 192 - gap * 3) / 4;
['02', '03', '04', '05'].forEach((h, i) => {
  const x = 96 + i * (bw + gap);
  ctx.fillStyle = K.card;
  rr(ctx, x, by, bw, bh, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,17,16,0.45)';
  ctx.lineWidth = 2.6;
  rr(ctx, x, by, bw, bh, 3);
  ctx.stroke();
  txt(ctx, h, x + bw / 2, by + bh * 0.68, {
    size: 86, font: F.num, color: K.ink, align: 'center', track: -3,
  });
});
ctx.strokeStyle = K.red;
ctx.lineWidth = 8;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.moveTo(84, by + bh * 0.80);
ctx.lineTo(W - 84, by + bh * 0.80 + 10);
ctx.stroke();

// ── the clock, still at two ───────────────────────────────────────────────
clock(ctx, 1072, 1520, 236, 2, 0, { a: 1, lw: 6 });
txt(ctx, '02.00', 92, 1600, { size: 250, font: F.num, color: K.ink, track: -12 });
tracking(ctx, 'PAGI', 106, 1662, { size: 26, font: F.mono6, track: 8, color: K.red });

hatch(ctx, 96, 1744, 520, 34, { gap: 14, lw: 3, a: 0.9 });
tracking(ctx, 'LIMA HARI KERJA · SEPULUH JAM HILANG', 96, 1834, {
  size: 22, font: F.mono6, track: 4, color: 'rgba(20,17,16,0.55)',
});

// ── the ask, and the stamp ────────────────────────────────────────────────
txt(ctx, 'Jam berapa kamu', 96, 2040, { size: 66, font: F.head, color: K.ink, track: -1 });
txt(ctx, 'tidur semalam?', 96, 2126, { size: 66, font: F.head, color: K.ink, track: -1 });
stampInk(ctx, '6 JAM', 1116, 2096, { size: 66, track: 8, rot: -0.05, color: K.red, pad: 32 });

ctx.fillStyle = 'rgba(20,17,16,0.2)';
ctx.fillRect(96, 2320, W - 192, 2);
tracking(ctx, 'NAYSI · MALAM', 96, 2382, {
  size: 24, font: F.mono6, track: 6, color: 'rgba(20,17,16,0.45)',
});
tracking(ctx, '2:32 · 1440×2560 · 90 FPS', W - 96, 2382, {
  size: 24, font: F.mono6, track: 5, color: 'rgba(20,17,16,0.4)', align: 'right',
});

fs.writeFileSync('out/cover21-v3.jpg', await c.encode('jpeg', 94));
console.log('out/cover21-v3.jpg');
