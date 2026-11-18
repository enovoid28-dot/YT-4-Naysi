// Episode 9 voice-over prep: mp3 takes -> assets/audio/vo/*.wav
//
// The previous chain (atempo + a hard compressor + loudnorm at -15) made the
// narration thick and pumpy. This one leaves the timing alone, cuts the mud
// around 200 Hz, lifts the consonants, and compresses gently: the voice should
// read as close and clear, not as a rumble under the music.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ffmpegPath } from '../src/engine/ffmpeg.mjs';
import { SCENES } from '../src/script.mjs';
import { readWav } from '../src/timeline.mjs';

const src = path.join(process.cwd(), 'voice');
const dst = path.join(process.cwd(), 'assets', 'audio', 'vo');
fs.mkdirSync(dst, { recursive: true });

const filter = [
  'highpass=f=85:poles=2',
  'equalizer=f=200:width_type=q:w=0.9:g=-2.8',
  'equalizer=f=800:width_type=q:w=1.2:g=-1.2',
  'equalizer=f=2900:width_type=q:w=1.1:g=2.8',
  'equalizer=f=6800:width_type=q:w=1.4:g=1.4',
  'acompressor=threshold=-18dB:ratio=1.8:attack=8:release=170',
  'loudnorm=I=-16:TP=-2:LRA=8',
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
