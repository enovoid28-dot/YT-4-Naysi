import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ffmpegPath } from '../src/engine/ffmpeg.mjs';

const OUT = path.join(process.cwd(), 'out');
const video = process.argv[2] || path.join(OUT, 'video.mp4');
const audio = path.join(process.cwd(), 'assets', 'audio', 'mix.wav');
const final = process.argv[3] || path.join(OUT, 'CPI-NAYSI-1440x2560-90fps.mp4');

const p = spawn(
  ffmpegPath(),
  ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000',
    '-shortest', '-movflags', '+faststart', final],
  { stdio: 'inherit' },
);
p.on('close', (c) => {
  if (c !== 0) process.exit(c);
  console.log(`✓ ${final}  ${(fs.statSync(final).size / 1048576).toFixed(1)} MB`);
});
