import { createCanvas } from '@napi-rs/canvas';
import { ensureFonts, F } from '../src/engine/fonts.mjs';
import { buildCaption } from '../src/engine/caption.mjs';
import { buildTimeline } from '../src/timeline.mjs';
import { W } from '../src/engine/draw.mjs';

await ensureFonts();
const ctx = createCanvas(1440, 2560).getContext('2d');
const tl = buildTimeline();
let worst = 999;
for (const sc of tl.scenes) {
  sc.captions.forEach((card, i) => {
    const lay = buildCaption(ctx, card, { maxWidth: W - 2 * 88, size: 94, font: F.semi, maxLines: 2 });
    worst = Math.min(worst, lay.size);
    const txt = card.words.map((w) => w.text).join(' ');
    const t0 = card.words[0].start.toFixed(2), t1 = card.words[card.words.length - 1].end.toFixed(2);
    const flag = lay.size < 80 ? '  <-- SMALL' : '';
    console.log(`${sc.id}.${i + 1}  ${t0}-${t1}  size ${lay.size}  lines ${lay.lines.length}  "${txt}"${flag}`);
  });
}
console.log('smallest size', worst);
