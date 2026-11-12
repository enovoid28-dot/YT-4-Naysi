import {execFileSync, spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {FPS, SCENES} from '../src/story';

const require = createRequire(import.meta.url);
const ffprobe: string = require('ffprobe-static').path;
const ffmpeg = path.join(process.cwd(), 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg');

function probe(file: string) {
  const out = execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', file], {encoding: 'utf8'});
  return Number(JSON.parse(out).format.duration);
}

function measureActive(file: string, duration: number): [number, number][] {
  const p = spawnSync(ffmpeg, ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-35dB:d=0.1', '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
  const log = p.stderr ?? '';
  const gaps: [number, number][] = [];
  let open: number | null = null;
  for (const line of log.split('\n')) {
    const s = line.match(/silence_start:\s*([-\d.]+)/);
    const e = line.match(/silence_end:\s*([-\d.]+)/);
    if (s) open = Math.max(0, Number(s[1]));
    if (e && open !== null) { gaps.push([open, Math.min(duration, Number(e[1]))]); open = null; }
  }
  if (open !== null) gaps.push([open, duration]);
  const active: [number, number][] = [];
  let cur = 0;
  for (const [a, b] of gaps) { if (a > cur) active.push([cur, a]); cur = Math.max(cur, b); }
  if (cur < duration) active.push([cur, duration]);
  return active.length ? active : [[0, duration]];
}

const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const weight = (s: string) => Math.max(1, s.replace(/\s+/g, '').length);

function mapTime(u: number, totalWeight: number, active: [number, number][]) {
  const speech = active.reduce((a, [s, e]) => a + (e - s), 0);
  let target = (u / totalWeight) * speech;
  for (const [s, e] of active) {
    const len = e - s;
    if (target <= len) return s + target;
    target -= len;
  }
  return active[active.length - 1][1];
}

let startFrame = 0;
const scenes = SCENES.map((sc) => {
  const file = path.join(process.cwd(), 'public/voice', `${sc.id}.mp3`);
  const audioDuration = probe(file);
  const frames = Math.round((sc.head + audioDuration + sc.tail) * FPS);
  const audioStartFrame = startFrame + Math.round(sc.head * FPS);
  const active = measureActive(file, audioDuration);
  const totalWeight = sc.captions.reduce((a, c) => a + weight(c), 0);
  let cursor = 0;
  const captions = sc.captions.map((text) => {
    const from = mapTime(cursor, totalWeight, active);
    cursor += weight(text);
    const to = mapTime(cursor, totalWeight, active);
    const wordsRaw = text.split(/\s+/);
    let wc = cursor - weight(text);
    const words = wordsRaw.map((w) => {
      const s = mapTime(wc, totalWeight, active);
      wc += weight(w);
      const e = mapTime(wc, totalWeight, active);
      const c = clean(w);
      const accent = sc.accents.some((a) => {
        const parts = a.toLowerCase().split(/\s+/).map(clean);
        return parts.includes(c);
      });
      return {text: w, start: +(audioStartFrame / FPS + s).toFixed(4), end: +(audioStartFrame / FPS + e).toFixed(4), accent};
    });
    return {from: +(audioStartFrame / FPS + from).toFixed(4), to: +(audioStartFrame / FPS + to + 0.12).toFixed(4), words};
  });
  for (let i = 0; i < captions.length; i++) {
    const nextFrom = i + 1 < captions.length ? captions[i + 1].from : audioStartFrame / FPS + audioDuration;
    captions[i].to = +Math.min(captions[i].to, nextFrom - 0.02).toFixed(4);
    for (const w of captions[i].words) w.end = +Math.min(w.end, captions[i].to).toFixed(4);
  }
  const out = {
    id: sc.id, startFrame, durationFrames: frames, audioStartFrame, audioDuration,
    start: startFrame / FPS, duration: frames / FPS, audioStart: audioStartFrame / FPS,
    active, captions,
  };
  startFrame += frames;
  return out;
});

const totalFrames = startFrame;
const data = {fps: FPS, width: 1440, height: 2560, totalFrames, duration: totalFrames / FPS, title: 'Paylater: Cicilan Kecil, Tagihan Besar', scenes};
fs.writeFileSync(path.join(process.cwd(), 'public/timing.json'), JSON.stringify(data, null, 2) + '\n');
console.log(`timing: ${totalFrames} frames / ${(totalFrames / FPS).toFixed(2)}s`);
for (const s of scenes) console.log(`${s.id}: ${s.start.toFixed(2)}–${(s.start + s.duration).toFixed(2)}s, vo ${s.audioDuration.toFixed(2)}s, active ${s.active.length}`);
