import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ffmpegPath } from '../src/engine/ffmpeg.mjs';
import { SCENES } from '../src/script.mjs';
import { readWav } from '../src/timeline.mjs';

const SPEED = Number(process.env.VO_SPEED || 1.12);
const src = path.join(process.cwd(), 'public', 'audio', 'vo');
const dst = path.join(process.cwd(), 'assets', 'audio', 'vo');
fs.mkdirSync(dst, { recursive: true });

const filter = [
  'highpass=f=82',
  `atempo=${SPEED}`,
  'acompressor=threshold=-21dB:ratio=2.6:attack=8:release=170',
  'loudnorm=I=-15:TP=-1.5:LRA=9',
  'aresample=48000',
].join(',');

for (const sc of SCENES) {
  const input = path.join(src, `${sc.id}.wav`);
  const out = path.join(dst, `${sc.id}.wav`);
  execFileSync(ffmpegPath(), [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', input, '-af', filter, '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', out,
  ]);
  const w = readWav(out);
  console.log(`${sc.id}: ${w.duration.toFixed(2)}s`);
}
