/**
 * Episode 20 cover — drawn with the episode's own kit, not a frame grab, so the
 * type can be set for a thumbnail instead of for a caption.
 */
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { ensureFonts, F } from '../src/engine/fonts.mjs';
import { W, H, txt, hexA } from '../src/engine/draw.mjs';
import { rng, sky, person, L, TAU } from '../src/scenes/_langit.mjs';

await ensureFonts();
const c = createCanvas(W, H);
const ctx = c.getContext('2d');

sky(ctx, { key: 'cover', band: 1.0, hills: false, glowY: 2080 });

// foreground hill, low in frame so the sky owns the picture
const ridge = [];
const r = rng(77);
for (let x = -60; x <= W + 60; x += 60) {
  ridge.push([x, 2110 + Math.sin(x * 0.0028 + 0.8) * 54 + Math.sin(x * 0.0072) * 20 + r() * 8]);
}
ctx.beginPath();
ctx.moveTo(-60, H);
ridge.forEach(([x, y]) => ctx.lineTo(x, y));
ctx.lineTo(W + 60, H);
ctx.closePath();
ctx.fillStyle = '#03050C';
ctx.fill();
ctx.strokeStyle = 'rgba(255,190,130,0.20)';
ctx.lineWidth = 3;
ctx.beginPath();
ridge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
ctx.stroke();

// stars the eye can actually reach
const sr = rng(21);
for (let i = 0; i < 60; i++) {
  const x = sr() * W;
  const y = 520 + sr() * 1400;
  const tw = 0.4 + 0.6 * Math.sin(i * 2.1 + 0.7);
  ctx.fillStyle = `rgba(255,250,240,${0.3 + tw * 0.6})`;
  ctx.shadowColor = 'rgba(200,225,255,0.9)';
  ctx.shadowBlur = 10 + tw * 12;
  ctx.beginPath();
  ctx.arc(x, y, 1.6 + tw * 2.2, 0, TAU);
  ctx.fill();
}
ctx.shadowBlur = 0;

// the viewer, big enough to read as a person at thumbnail size
const px = 990;
const py = 2105;
person(ctx, px, py, 360, { a: 1, rim: 0.5 });
const ex = px - 6;
const ey = py - 0.93 * 360;

// one sight-line from the eye to the star it is looking at
const sx = 372;
const sy = 1140;
const g = ctx.createLinearGradient(sx, sy, ex, ey);
g.addColorStop(0, hexA(L.gold, 0.62));
g.addColorStop(0.75, hexA(L.gold, 0.12));
g.addColorStop(1, 'rgba(255,201,135,0)');
ctx.strokeStyle = g;
ctx.lineWidth = 2.6;
ctx.beginPath();
ctx.moveTo(sx, sy);
ctx.lineTo(ex, ey);
ctx.stroke();
ctx.fillStyle = L.star;
ctx.shadowColor = 'rgba(255,240,210,0.95)';
ctx.shadowBlur = 40;
ctx.beginPath();
ctx.arc(sx, sy, 10, 0, TAU);
ctx.fill();
ctx.shadowBlur = 0;

// a scrim under the type so the sky stays visible but the words stay readable
const sc = ctx.createLinearGradient(0, 120, 0, 1250);
sc.addColorStop(0, 'rgba(3,5,13,0.90)');
sc.addColorStop(0.55, 'rgba(3,5,13,0.58)');
sc.addColorStop(1, 'rgba(3,5,13,0)');
ctx.fillStyle = sc;
ctx.fillRect(-40, -40, W + 80, 1330);

// brand
ctx.fillStyle = L.warm;
ctx.fillRect(104, 150, 18, 18);
txt(ctx, 'NAYSI', 138, 172, { size: 34, font: F.head, color: L.star, track: 7, alpha: 0.95 });

// the hook, three lines
txt(ctx, 'LANGIT MALAM', 100, 430, { size: 88, font: F.display, color: L.gold, track: 4 });
txt(ctx, 'SEHARUSNYA', 100, 586, { size: 146, font: F.display, color: L.star, track: 0 });
txt(ctx, 'TERANG.', 100, 762, { size: 186, font: F.display, color: L.warm, track: -2 });

// a hairline and the reason the video exists
ctx.fillStyle = hexA(L.ice, 0.55);
ctx.fillRect(104, 842, 420, 3);
txt(ctx, 'PARADOKS OLBERS · 1823', 104, 910, { size: 29, font: F.mono, color: hexA(L.star, 0.82), track: 8 });
txt(ctx, 'Kenapa malam tetap hitam?', 104, 964, { size: 34, font: F.semi, color: hexA(L.star, 0.60), track: 1 });

// footer
txt(ctx, 'EP 20 · LANGIT', 104, 2450, { size: 26, font: F.mono, color: hexA(L.star, 0.42), track: 7 });
txt(ctx, '2,7 K', W - 104, 2450, { size: 26, font: F.num, color: hexA(L.warm, 0.6), align: 'right', track: 4 });

fs.writeFileSync('out/cover20.jpg', await c.encode('jpeg', 92));
console.log('out/cover20.jpg');
