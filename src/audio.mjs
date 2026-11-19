// Voice-over decoding, without a wav file anywhere.
//
// The takes are flac (episode 27 on: full-band 24 kHz straight from the voice
// model, tightened by scripts/vo-prep.mjs) or mp3 (older episodes). This module
// pipes them through ffmpeg — high-pass, de-mud, presence, air, compression,
// loudnorm — and hands back 48 kHz stereo float samples that live in memory
// only. Nothing on disk is ever a .wav: the voice is flac/mp3, the mix is flac.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ffmpegPath } from './engine/ffmpeg.mjs';

const SR = 48000;

/** The one voice chain. Kept in a single place so every consumer hears the same take. */
export const VO_FILTER = [
  'aresample=48000',
  'highpass=f=80:poles=2',
  'equalizer=f=170:width_type=q:w=0.9:g=-2.5',
  'equalizer=f=420:width_type=q:w=1.4:g=-1.6',
  'equalizer=f=3100:width_type=q:w=0.9:g=3.0',
  'highshelf=f=7800:g=2',
  'acompressor=threshold=-22dB:ratio=3:attack=4:release=90:knee=4',
  'loudnorm=I=-15:TP=-1.5:LRA=5',
  'aresample=48000',
].join(',');

// the take folder: episode 28 by default, override with VO_EP (e.g. VO_EP=ep22)
export const VO_EP = process.env.VO_EP || 'ep31';
export const voFile = (id) => {
  const flac = path.join(process.cwd(), 'voice', VO_EP, `${id}.flac`);
  return fs.existsSync(flac) ? flac : path.join(process.cwd(), 'voice', VO_EP, `${id}.mp3`);
};

const cache = new Map();

/**
 * Decode one scene's take.
 * Returns { id, sampleRate, channels, frames, duration, l(i), r(i), samples }.
 * `samples` is interleaved float32 (L R L R ...), which is what the mixer wants.
 */
export function decodeVo(id, { force = false } = {}) {
  if (!force && cache.has(id)) return cache.get(id);
  const file = voFile(id);
  if (!fs.existsSync(file)) throw new Error(`missing VO take: ${path.relative(process.cwd(), file)}`);
  const raw = execFileSync(
    ffmpegPath(),
    ['-hide_banner', '-loglevel', 'error', '-i', file, '-af', VO_FILTER, '-ac', '2', '-ar', String(SR), '-f', 'f32le', '-'],
    { maxBuffer: 1024 * 1024 * 512 },
  );
  const samples = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4));
  const frames = Math.floor(samples.length / 2);
  const out = {
    id,
    sampleRate: SR,
    channels: 2,
    frames,
    duration: frames / SR,
    samples,
    l: (i) => samples[i * 2] || 0,
    r: (i) => samples[i * 2 + 1] || 0,
    /** mono, for envelope work */
    m: (i) => (samples[i * 2] + samples[i * 2 + 1]) / 2,
  };
  cache.set(id, out);
  return out;
}

/** Encode interleaved float samples to a lossless flac (no wav intermediate). */
export function writeFlac(interleaved, frames, file, { sampleRate = SR, channels = 2 } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const rawFile = file.replace(/\.flac$/, '.f32');
  const buf = Buffer.from(interleaved.buffer, interleaved.byteOffset, frames * channels * 4);
  fs.writeFileSync(rawFile, buf);
  execFileSync(ffmpegPath(), [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'f32le', '-ar', String(sampleRate), '-ac', String(channels), '-i', rawFile,
    '-c:a', 'flac', '-compression_level', '8', file,
  ]);
  fs.unlinkSync(rawFile);
  return file;
}
