/**
 * Caption QA for one episode: the subtitle text must be the voice, word for word.
 *
 *   node scripts/check-captions.mjs            # episode 12 (src/script.mjs)
 *
 * Checks
 *   1. every caption card is a verbatim slice of the scene's VO text,
 *   2. cards are in order, never overlapping, none shorter than 0.5 s,
 *   3. no card is missing the words the voice says between two cards,
 *   4. caption type stays large enough to read on a phone (>= 78 px at 1440 w).
 */
import { createCanvas } from '@napi-rs/canvas';
import { ensureFonts, F } from '../src/engine/fonts.mjs';
import { buildCaption } from '../src/engine/caption.mjs';
import { buildTimeline } from '../src/timeline.mjs';
import { W } from '../src/engine/draw.mjs';
import { SCENES } from '../src/script.mjs';
import { capCards } from '../src/timeline.mjs';

const norm = (s) =>
  s
    .replace(/\*/g, '')
    .replace(/[.,!?;:“”"'()]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

let errors = 0;
const fail = (msg) => {
  errors++;
  console.log('  ✗ ' + msg);
};

for (const sc of SCENES) {
  const vo = norm(sc.vo).join(' ');
  const cards = capCards(sc.cap);
  const cap = cards.map(norm).flat().join(' ');
  const ok = vo === cap;
  console.log(`${sc.id}  ${cards.length} kartu  ${ok ? 'verbatim ✓' : 'TIDAK VERBATIM'}`);
  if (!ok) {
    fail(`teks caption ≠ VO\n      vo : ${vo}\n      cap: ${cap}`);
  }
  cards.forEach((c, i) => {
    if (!norm(c).length) fail(`kartu ${i + 1} kosong`);
  });
}

await ensureFonts();
const ctx = createCanvas(W, 160).getContext('2d');
const tl = buildTimeline();
for (const scene of tl.scenes) {
  let prevEnd = -1;
  scene.captions.forEach((card, i) => {
    const t0 = card.words[0].start;
    const t1 = card.words[card.words.length - 1].end;
    if (t0 < prevEnd - 0.001) fail(`${scene.id}.${i + 1} tumpang tindih (${t0.toFixed(2)} < ${prevEnd.toFixed(2)})`);
    if (t1 - t0 < 0.5) fail(`${scene.id}.${i + 1} terlalu singkat (${(t1 - t0).toFixed(2)} s)`);
    prevEnd = t1;
    const lay = buildCaption(ctx, card, { maxWidth: W - 2 * 88, size: 94, font: F.semi, maxLines: 2 });
    if (lay.size < 78) fail(`${scene.id}.${i + 1} huruf mengecil ke ${lay.size}px`);
  });
}

console.log(errors ? `\n${errors} masalah` : '\nsemua caption sesuai VO');
process.exit(errors ? 1 : 0);
