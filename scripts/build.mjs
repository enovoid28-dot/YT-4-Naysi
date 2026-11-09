import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { buildTimeline } from '../src/timeline.mjs';
import { ffmpegPath } from '../src/engine/ffmpeg.mjs';

const OUT = path.join(process.cwd(), process.env.OUT_DIR || 'out');
const FINAL = path.join(OUT, process.env.OUT_NAME || 'CPI-NAYSI-1440x2560-90fps.mp4');
const WORKERS = Number(process.env.WORKERS || 2);
const CRF = String(process.env.CRF || 18);
const PRESET = process.env.PRESET || 'superfast';
const tl = buildTimeline();
const FRAMES = Math.round(tl.total * tl.fps);

const run = (cmd, args, log = false) =>
  new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: log ? 'inherit' : ['ignore', 'ignore', 'inherit'] });
    p.on('close', (c) => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
  });

const node = async (args, log) => run(process.execPath, args, log);

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const t0 = Date.now();

  if (!fs.existsSync(path.join(process.cwd(), 'assets', 'audio', 'vo', 's1.wav'))) {
    console.log('· preparing voice over');
    await node(['scripts/prep-vo.mjs'], true);
  }
  console.log('· building soundtrack');
  await node(['scripts/audio.mjs'], true);

  console.log(`· rendering ${FRAMES} frames @ ${tl.fps}fps (${WORKERS} workers)`);
  const chunks = [];
  const per = Math.ceil(FRAMES / WORKERS);
  for (let i = 0; i < WORKERS; i++) {
    const from = i * per;
    const to = Math.min(FRAMES, (i + 1) * per);
    chunks.push({ from, to, file: path.join(OUT, `part_${i}.mp4`) });
  }
  await Promise.all(
    chunks.map((c) =>
      node(
        ['src/render.mjs', '--from', String(c.from), '--to', String(c.to), '--preset', PRESET, '--crf', CRF, '--out', c.file],
        true,
      ),
    ),
  );

  const list = path.join(OUT, 'parts.txt');
  fs.writeFileSync(list, chunks.map((c) => `file '${c.file}'`).join('\n'));
  const silent = path.join(OUT, 'silent.mp4');
  await run(ffmpegPath(), ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(OUT, 'silent.mp4')]);

  console.log('· muxing audio');
  await run(
    ffmpegPath(),
    ['-y', '-hide_banner', '-loglevel', 'error', '-i', silent, '-i', path.join(process.cwd(), 'assets', 'audio', 'mix.wav'),
      '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000',
      '-shortest', '-movflags', '+faststart', FINAL],
    true,
  );

  for (const c of chunks) fs.rmSync(c.file, { force: true });
  fs.rmSync(list, { force: true });
  fs.rmSync(silent, { force: true });

  const mb = (fs.statSync(FINAL).size / 1048576).toFixed(1);
  console.log(`\n✓ ${path.relative(process.cwd(), FINAL)}  ${mb} MB  ${tl.total.toFixed(1)}s  in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
