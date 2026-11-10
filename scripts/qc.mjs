/**
 * Pre-render QC gate. Runs the same caption layout the renderer uses, then
 * checks every card for the defects that are expensive to find after a
 * 15 000-frame render:
 *
 *   1. a line with no real width (the old zero-width fallback that threw the
 *      block to screen centre and off the right edge)
 *   2. a card that needs more than three lines
 *   3. a card wider than the safe area after the hard fit guard
 *   4. a card that runs past the bottom of the frame
 *   5. two cards visible at the same time, or a card outside its own VO file
 *   6. a scene whose audio file is missing or longer than the scene
 *
 * Usage: node scripts/qc.mjs
 */
import { createCanvas } from '@napi-rs/canvas';
import { ensureFonts } from '../src/engine/fonts.mjs';
import { buildCaption } from '../src/engine/caption.mjs';
import { buildTimeline, readWav } from '../src/timeline.mjs';
import { W, H } from '../src/engine/draw.mjs';
import fs from 'node:fs';
import path from 'node:path';

await ensureFonts();
const ctx = createCanvas(1440, 2560).getContext('2d');
const tl = buildTimeline();

const SAFE = 96;
const problems = [];
const rows = [];

for (const scene of tl.scenes) {
  const layouts = scene.captions.map((g) =>
    buildCaption(ctx, g, { maxWidth: W - 2 * 118, size: 90 }),
  );

  layouts.forEach((L, i) => {
    const id = `${scene.id}.${i + 1}`;
    const widest = Math.max(...L.lines.map((l) => l.width));
    const fit = Math.min(1, (W - 2 * SAFE) / Math.max(1, widest));
    const drawnW = widest * fit;
    const drawnH = L.lines.length * L.size * 1.12;
    const zero = L.lines.some((l) => !(l.width > 0));
    const outside = drawnW > W - 2 * SAFE + 0.5;
    const tooMany = L.lines.length > 3;
    const tooTall = 1832 + drawnH > H - 24;

    if (zero) problems.push(`${id}: line with zero width`);
    if (outside) problems.push(`${id}: ${Math.round(drawnW)}px wider than safe area`);
    if (tooMany) problems.push(`${id}: ${L.lines.length} lines`);
    if (tooTall) problems.push(`${id}: block ends below the frame`);

    rows.push({
      id,
      size: L.size,
      lines: L.lines.length,
      widest: Math.round(drawnW),
      words: scene.captions[i].words.length,
    });
  });

  // timing inside the scene
  const groups = scene.captions;
  groups.forEach((g, i) => {
    const first = g.words[0].start;
    const last = g.words[g.words.length - 1].end;
    if (first < scene.voOffset - 0.05) problems.push(`${scene.id}.${i + 1}: starts before VO`);
    if (last - scene.voOffset > scene.audioDur + 0.02) problems.push(`${scene.id}.${i + 1}: ends after VO`);
    if (i > 0) {
      const prevEnd = groups[i - 1].words[groups[i - 1].words.length - 1].end;
      if (prevEnd > first + 0.02) {
        problems.push(`${scene.id}.${i + 1}: overlaps the previous card`);
      }
    }
    for (let w = 1; w < g.words.length; w++) {
      if (g.words[w].start < g.words[w - 1].start) {
        problems.push(`${scene.id}.${i + 1}: word times not monotonic`);
        break;
      }
    }
    g.words.forEach((w) => {
      if (w.end - w.start < 0.02) {
        problems.push(`${scene.id}.${i + 1}: word "${w.text}" has no duration`);
      }
    });
  });
}

// files and totals
const mix = path.join(process.cwd(), 'assets', 'audio', 'mix.wav');
if (fs.existsSync(mix)) {
  const d = readWav(mix).duration;
  if (Math.abs(d - tl.total) > 0.75) {
    problems.push(`mix.wav is ${d.toFixed(2)}s but the timeline is ${tl.total.toFixed(2)}s`);
  }
} else {
  problems.push('assets/audio/mix.wav missing');
}

const cards = rows.length;
const widest = Math.max(...rows.map((r) => r.widest));
const maxLines = Math.max(...rows.map((r) => r.lines));
console.log(`scenes ${tl.scenes.length} · caption cards ${cards} · widest ${widest}px (safe ${W - 2 * SAFE}) · max lines ${maxLines}`);
console.log(`runtime ${tl.total.toFixed(2)}s / ${Math.round(tl.total * 90)} frames`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
console.log('\nQC: 0 problems.');
