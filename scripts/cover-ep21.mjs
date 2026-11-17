/**
 * Episode 21 cover — drawn with the episode's own room, so the type is set for a
 * thumbnail: one big number, one word that turns it into a debt, and the clock.
 */
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { ensureFonts, F } from '../src/engine/fonts.mjs';
import { W, H, txt, hexA, fillRR } from '../src/engine/draw.mjs';
import { M, room, bed, clock, dust, TAU } from '../src/scenes/_malam.mjs';
import { person } from '../src/scenes/_langit.mjs';

await ensureFonts();
const c = createCanvas(W, H);
const ctx = c.getContext('2d');

room(ctx, { key: 'cover', side: 'right', warm: 0.9 });

// a low red waterline: the debt, without a single word of explanation
const level = 1560;
const tg = ctx.createLinearGradient(0, level - 300, 0, H);
tg.addColorStop(0, 'rgba(255,90,70,0)');
tg.addColorStop(0.55, 'rgba(255,86,66,0.10)');
tg.addColorStop(1, 'rgba(255,70,54,0.26)');
ctx.fillStyle = tg;
ctx.fillRect(-80, level - 300, W + 160, H - level + 340);

// the person, awake, in front of the window
person(ctx, 1046, 2140, 620, { a: 1, rim: 0.55 });
bed(ctx, { y: 1902, pillow: false, a: 1 });

// the clock: the number that makes the night a debt
clock(ctx, 112, 1096, 236, '02:00', { color: M.amber, halo: 1 });

// scrim so the type beats the grain
const sc = ctx.createLinearGradient(0, 100, 0, 1000);
sc.addColorStop(0, 'rgba(4,5,12,0.92)');
sc.addColorStop(0.6, 'rgba(4,5,12,0.55)');
sc.addColorStop(1, 'rgba(4,5,12,0)');
ctx.fillStyle = sc;
ctx.fillRect(-40, -40, W + 80, 1060);

// brand
ctx.fillStyle = M.amber;
ctx.fillRect(104, 150, 18, 18);
txt(ctx, 'NAYSI', 138, 172, { size: 34, font: F.head, color: M.ink, track: 7, alpha: 0.95 });

// hook: three lines, the number first
txt(ctx, 'TIDUR', 100, 400, { size: 120, font: F.display, color: M.gold, track: 2 });
txt(ctx, 'ENAM JAM', 100, 570, { size: 152, font: F.display, color: M.ink, track: -2 });
txt(ctx, 'ITU UTANG.', 100, 760, { size: 168, font: F.display, color: M.warm, track: -3 });

ctx.fillStyle = hexA(M.ice, 0.55);
ctx.fillRect(104, 840, 420, 3);
txt(ctx, 'UTANG TIDUR · 2026', 104, 906, { size: 29, font: F.mono, color: hexA(M.ink, 0.82), track: 8 });
txt(ctx, 'Jam berapa kamu tidur semalam?', 104, 962, {
  size: 33, font: F.semi, color: hexA(M.ink, 0.60), track: 1,
});

// footer
txt(ctx, 'EP 21 · MALAM', 104, 2450, { size: 26, font: F.mono, color: hexA(M.ink, 0.42), track: 7 });
txt(ctx, '6 JAM', W - 104, 2450, { size: 26, font: F.num, color: hexA(M.amber, 0.6), align: 'right', track: 4 });

fs.writeFileSync('out/cover21.jpg', await c.encode('jpeg', 92));
console.log('out/cover21.jpg');
