// Episode 6 voice over prep (weekend sleep repayment): mp3 sources -> assets/audio/vo/*.wav
// Same chain as scripts/prep-vo.mjs (highpass, atempo, compressor, loudnorm).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ffmpegPath } from '../src/engine/ffmpeg.mjs';
import { SCENES } from '../src/script.mjs';
import { readWav } from '../src/timeline.mjs';

const SPEED = Number(process.env.VO_SPEED || 1.05);
const src = path.join(process.cwd(), 'public', 'audio', 'vo-mp3');
const dst = path.join(process.cwd(), 'assets', 'audio', 'vo');
fs.mkdirSync(dst, { recursive: true });

const filter = [
  'highpass=f=78',
  `atempo=${SPEED}`,
  'acompressor=threshold=-20dB:ratio=2.2:attack=12:release=200',
  'loudnorm=I=-15:TP=-1.5:LRA=9',
  'aresample=48000',
].join(',');

let total = 0;
for (const sc of SCENES) {
  const input = path.join(src, `${sc.id}.mp3`);
  const out = path.join(dst, `${sc.id}.wav`);
  execFileSync(ffmpegPath(), [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', input, '-af', filter, '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', out,
  ]);
  const w = readWav(out);
  total += w.duration;
  console.log(`${sc.id}: ${w.duration.toFixed(2)}s`);
}
console.log(`vo total ${total.toFixed(2)}s`);
