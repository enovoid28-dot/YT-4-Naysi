// Episode 36 voice prep: the model's mp3 takes -> tightened flac takes.
//
// The TTS runner pads every take with silence (up to 300 ms at the head and
// 450 ms at the tail) and speaks a touch slower than the house pace. This
// trims the silence from both ends, keeps a 30 ms handle so the first plosive
// is never clipped, optionally breathes the take up to the house rate, and
// writes 48 kHz stereo flac into voice/ep36/ — the file decodeVo() reads.
//
//   VO_SPEED=1.03 node scripts/prep-vo-ep36.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { ffmpegPath } from '../src/engine/ffmpeg.mjs';
import { SCENES } from '../src/script.mjs';

const SPEED = Number(process.env.VO_SPEED || 1.0);
const src = path.join(process.cwd(), 'voice', 'ep36');
const dst = path.join(process.cwd(), 'voice', 'ep36');

function readDur(file) {
  const r = spawnSync(ffmpegPath(), ['-hide_banner', '-i', file, '-f', 'null', '-'], { encoding: 'utf8' });
  const m = String(r.stderr || '').match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error(`no duration for ${file}`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

const trim =
  'silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,'
  + 'areverse,silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse';
const filter = [trim, `atempo=${SPEED}`, 'aresample=48000'].join(',');

let total = 0;
for (const sc of SCENES) {
  const input = path.join(src, `${sc.id}.mp3`);
  const out = path.join(dst, `${sc.id}.flac`);
  if (!fs.existsSync(input)) throw new Error(`missing take ${input}`);
  execFileSync(ffmpegPath(), [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', input, '-af', filter, '-ac', '2', '-ar', '48000', '-c:a', 'flac', '-compression_level', '8', out,
  ]);
  const dur = readDur(out);
  total += dur;
  console.log(`${sc.id}: ${dur.toFixed(2)}s`);
}
console.log(`vo total ${total.toFixed(2)}s`);
