// Ep19 sync audit, straight from the mp3 takes (no wav anywhere).
//   1. every card boundary must sit in a pause of the take,
//   2. every number that appears on screen must be cued on its spoken word.
import { SCENES } from '../src/script.mjs';
import { buildTimeline } from '../src/timeline.mjs';
import { decodeVo } from '../src/audio.mjs';

const FR = 0.01;
const tl = buildTimeline();
let okEdge = 0, edges = 0, worst = 0;

for (const sc of SCENES) {
  const take = decodeVo(sc.id);
  const step = Math.round(take.sampleRate * FR);
  const env = [];
  for (let i = 0; i < take.frames; i += step) {
    let pk = 0;
    for (let j = i; j < Math.min(take.frames, i + step); j++) pk = Math.max(pk, Math.abs(take.m(j)));
    env.push(pk);
  }
  const sorted = [...env].sort((a, b) => a - b);
  const th = Math.max(0.02, (sorted[Math.floor(sorted.length * 0.35)] || 0) * 2.2);
  const pauses = [];
  let run = null;
  env.forEach((v, i) => {
    if (v <= th) { if (run === null) run = i; }
    else { if (run !== null && (i - run) * FR >= 0.10) pauses.push({ mid: ((run + i) / 2) * FR, len: (i - run) * FR }); run = null; }
  });
  const scene = tl.scenes.find((s) => s.id === sc.id);
  for (let i = 0; i < scene.captions.length - 1; i++) {
    const at = scene.captions[i].to - scene.voOffset + 0.02;
    const near = pauses.reduce((b, p) => (Math.abs(p.mid - at) < Math.abs(b.mid - at) ? p : b), { mid: -9, len: 0 });
    const d = Math.abs(near.mid - at);
    edges++; if (d <= 0.06) okEdge++; worst = Math.max(worst, d);
  }
}
console.log(`batas kartu: ${okEdge}/${edges} dalam 60 ms dari tengah jeda (terjauh ${(worst * 1000).toFixed(0)} ms)`);

const cues = [
  ['s1', 1, 'tiga'], ['s1', 2, 'cuma'], ['s1', 4, 'tombol'], ['s1', 4, 'stop'],
  ['s2', 1, 'sembilan'], ['s5', 2, 'dua'], ['s6', 1, 'dua'], ['s6', 2, 'lima'],
  ['s7', 2, 'sembilan'], ['s7', 3, 'tapi'], ['s7', 3, 'sepertiga'],
];
for (const [id, ci, needle] of cues) {
  const sc = tl.scenes.find((s) => s.id === id);
  const card = sc.captions[ci];
  const w = card.words.find((x) => x.text.toLowerCase().startsWith(needle));
  console.log(`${id}.${ci + 1} "${needle}" → ${w ? '+' + (w.start - card.words[0].start).toFixed(2) + ' s dari awal kartu' : 'TIDAK DITEMUKAN'}`);
}
