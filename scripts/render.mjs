import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const root = process.cwd();
const args = process.argv.slice(2);
const still = args.includes('--still');
const frameArg = args.indexOf('--frame');
const frame = frameArg >= 0 ? Number(args[frameArg + 1]) : 360;
const outArg = args.indexOf('--out');
const fromArg = args.indexOf('--from');
const toArg = args.indexOf('--to');
const frameRange = fromArg >= 0 && toArg >= 0 ? [Number(args[fromArg + 1]), Number(args[toArg + 1])] : null;
const browser = path.join(root, '.cache/browser/chromium');
if (!fs.existsSync(browser)) throw new Error('Run npm run prepare:browser first');
process.env.LD_LIBRARY_PATH = [path.join(root, '.cache/browser/lib/lib'), process.env.LD_LIBRARY_PATH].filter(Boolean).join(':');

const entry = path.join(root, 'src/remotion/index.ts');
const serveUrl = await bundle({entryPoint: entry, webpackOverride: (c) => c});
const composition = await selectComposition({serveUrl, id: 'Paylater', browserExecutable: browser});
console.log(`composition ${composition.width}x${composition.height} @${composition.fps}fps, ${composition.durationInFrames} frames`);

if (still) {
  fs.mkdirSync(path.join(root, 'out'), {recursive: true});
  const framesArg = args.indexOf('--frames');
  const frames = framesArg >= 0 ? args[framesArg + 1].split(',').map(Number) : [frame];
  for (const f of frames) {
    const out = outArg >= 0 && frames.length === 1 ? args[outArg + 1] : path.join(root, `out/qc-${String(f).padStart(4, '0')}.png`);
    await renderStill({composition, serveUrl, browserExecutable: browser, frame: f, output: out, imageFormat: 'png'});
    console.log(out);
  }
} else {
  fs.mkdirSync(path.join(root, 'out'), {recursive: true});
  const out = outArg >= 0 ? args[outArg + 1] : path.join(root, 'out/Paylater-Naysi-1440x2560-90fps.mp4');
  const started = Date.now();
  await renderMedia({
    composition, serveUrl, browserExecutable: browser,
    codec: 'h264', crf: 18, pixelFormat: 'yuv420p', colorSpace: 'bt709',
    imageFormat: 'jpeg', jpegQuality: 92, concurrency: 2,
    audioCodec: 'aac', audioBitrate: '192k',
    outputLocation: out,
    ...(frameRange ? {frameRange} : {}),
    onProgress: ({progress, renderedFrames, encodedFrames}) => {
      if (renderedFrames % 180 === 0 || progress === 1) {
        const elapsed = (Date.now() - started) / 1000;
        console.log(`${(progress * 100).toFixed(1)}% rendered=${renderedFrames} encoded=${encodedFrames} elapsed=${elapsed.toFixed(0)}s`);
      }
    },
  });
  console.log(`DONE ${out} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  console.log(`SIZE ${fs.statSync(out).size} bytes`);
}
