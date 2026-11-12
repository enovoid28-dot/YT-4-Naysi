import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const ffprobe = require('ffprobe-static').path;
const file = process.argv[2] ?? path.join(process.cwd(), 'out/Paylater-Naysi-1440x2560-90fps.mp4');
if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
const out = execFileSync(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], {encoding: 'utf8'});
const meta = JSON.parse(out);
const v = meta.streams.find((s) => s.codec_type === 'video');
const a = meta.streams.find((s) => s.codec_type === 'audio');
const checks = {
  width: v?.width === 1440,
  height: v?.height === 2560,
  fps: v?.r_frame_rate === '90/1',
  codec: v?.codec_name === 'h264',
  audio: a?.codec_name === 'aac',
  duration: Math.abs(Number(meta.format.duration) - 6197 / 90) < 0.2,
  sizeUnder100MB: fs.statSync(file).size < 100 * 1024 * 1024,
};
console.log(JSON.stringify({file, bytes: fs.statSync(file).size, duration: meta.format.duration, video: {w: v?.width, h: v?.height, fps: v?.r_frame_rate, frames: v?.nb_frames}, audio: {codec: a?.codec_name, sampleRate: a?.sample_rate}, checks}, null, 2));
if (Object.values(checks).some((x) => !x)) process.exit(1);
