import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);

export function ffmpegPath() {
  if (process.env.FFMPEG && fs.existsSync(process.env.FFMPEG)) return process.env.FFMPEG;
  try {
    return require('@ffmpeg-installer/ffmpeg').path;
  } catch {
    return 'ffmpeg';
  }
}
