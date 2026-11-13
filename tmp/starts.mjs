import { buildTimeline } from '../src/timeline.mjs';
const tl = buildTimeline();
for (const s of tl.scenes) {
  const mm = Math.floor(s.start / 60);
  const ss = Math.floor(s.start % 60);
  console.log(s.id, `${mm}:${String(ss).padStart(2,'0')}`, s.label, s.dur.toFixed(2));
}
console.log('total', tl.total.toFixed(2));
