/**
 * Caption QA for one episode: the subtitle text must be the voice, word for word.
 *
 *   node scripts/check-captions.mjs            # episode 12 (src/script.mjs)
 *
 * Checks
 *   1. every caption card is a verbatim slice of the scene's VO text,
 *   2. cards are in order, never overlapping, none shorter than 0.5 s,
 *   3. no card is missing the words the voice says between two cards,
 *   4. every card fits in three lines without dropping below 64 px type.
 */
import { createCanvas } from '@napi-rs/canvas';
import { ensureFonts, F } from '../src/engine/fonts.mjs';
import { buildKaraoke } from '../src/engine/karaoke.mjs';
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

// words the voice spells phonetically for the TTS while the caption shows the
// real spelling (one token for one token, so timings stay honest)
const SPOKEN_AS = { leje: 'léger', henig: 'hänig' };

for (const sc of SCENES) {
  const vo = norm(sc.vo).map((w) => SPOKEN_AS[w] || w).join(' ');
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
  });
  // every card must fit the karaoke block: three lines, type not below 64 px
  buildKaraoke(ctx, scene).forEach((c, k) => {
    const text = c.lines.map((l) => l.words.map((w) => w.text).join(' ')).join(' / ');
    console.log(`  ${scene.id}.${k + 1}  ${c.size}px  ${text}`);
    if (c.lines.length > 3) fail(`${scene.id}.${k + 1} butuh ${c.lines.length} baris`);
    if (c.size < 64) fail(`${scene.id}.${k + 1} huruf terlalu kecil (${c.size}px)`);
  });
}

console.log(errors ? `\n${errors} masalah` : '\nsemua caption sesuai VO');
process.exit(errors ? 1 : 0);
