import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { ensureFonts, F } from './engine/fonts.mjs';
import { W, H, FPS, C, M, txt, tracking, linGrad, hexA, fillRR } from './engine/draw.mjs';
import {
  initFilm, drawGrain, drawVignette, drawScrim, drawLeak, drawFlash, drawDust, drawFilm,
} from './engine/film.mjs';
import { buildCaption, drawCaption } from './engine/caption.mjs';
import { buildTimeline, sceneAt } from './timeline.mjs';
import { SCENES, BRAND, SERIES } from './script.mjs';
import { clamp, lerp, EASE } from './engine/anim.mjs';
import sceneMap from './scenes/index.mjs';
import { ffmpegPath } from './engine/ffmpeg.mjs';

const args = process.argv.slice(2);
const arg = (name, def = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const timeline = buildTimeline();
const captionLayouts = new Map();
// fixed anchor for the caption block: the first line never moves, whatever the
// number of lines in the sentence.
const CAPTION_TOP = 1832;

function buildLayouts(ctx) {
  for (const s of timeline.scenes) {
    captionLayouts.set(
      s.id,
      s.captions.map((g) =>
        buildCaption(ctx, g, { maxWidth: W - 2 * 118, size: 90, font: F.semi }),
      ),
    );
  }
}

function drawChapter(ctx, scene, local, idxGlobal) {
  const p = EASE.outCubic(clamp(local / 0.45));
  const y = H - 96;
  ctx.save();
  ctx.globalAlpha = 0.55 * p;
  txt(ctx, `${scene.index}`, M, y, { size: 26, font: F.num6, color: C.amber, track: 2 });
  txt(ctx, `—  ${scene.label}`, M + 44, y, { size: 26, font: F.num6, color: C.bone, track: 4 });
  ctx.restore();

  // series ticks on the right
  const n = SCENES.length;
  const tw = 22;
  const gap = 8;
  const total = n * tw + (n - 1) * gap;
  let x = W - M - total;
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.globalAlpha = i === idxGlobal ? 0.95 : 0.22;
    fillRR(ctx, x, H - 108, tw, 5, 2.5, i === idxGlobal ? C.amber : C.bone);
    ctx.restore();
    x += tw + gap;
  }
}

function drawChrome(ctx, scene, local, tGlobal, idxGlobal) {
  ctx.save();
  const gi = ctx.createLinearGradient(0, 0, 0, 300);
  gi.addColorStop(0, 'rgba(3,4,7,0.55)');
  gi.addColorStop(1, 'rgba(3,4,7,0)');
  ctx.fillStyle = gi;
  ctx.fillRect(0, 0, W, 300);
  ctx.restore();

  // brand mark
  ctx.save();
  fillRR(ctx, M, 96, 16, 16, 4, C.amber);
  txt(ctx, BRAND, M + 30, 115, { size: 34, font: F.head, color: C.bone, track: 7, alpha: 0.92 });
  ctx.restore();

  tracking(ctx, SERIES, W - M, 114, {
    size: 25, font: F.num6, track: 5, align: 'right', color: hexA(C.bone, 0.55),
  });

  drawChapter(ctx, scene, local, idxGlobal);

  // progress
  const prog = clamp(tGlobal / timeline.total);
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = C.bone;
  ctx.fillRect(0, H - 8, W, 8);
  ctx.globalAlpha = 1;
  const g = linGrad(ctx, 0, 0, W, 0, [[0, C.ember], [0.6, C.amber], [1, C.amberHi]]);
  ctx.fillStyle = g;
  ctx.shadowColor = hexA(C.amber, 0.7);
  ctx.shadowBlur = 18;
  ctx.fillRect(0, H - 8, W * prog, 8);
  ctx.restore();
}

const BENCH = process.env.BENCH === '1';
const bench = {};
const mark = (name, fn) => {
  if (!BENCH) return fn();
  const t0 = performance.now();
  const r = fn();
  bench[name] = (bench[name] || 0) + (performance.now() - t0);
  return r;
};

function drawFrame(ctx, frame) {
  const t = frame / FPS;
  const { scene, index, local } = sceneAt(timeline, t);
  const mod = sceneMap[scene.key];
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.ink0;
  ctx.fillRect(0, 0, W, H);
  // handheld breathing so static frames still feel alive
  const bx = Math.sin(t * 0.37) * 1.7 + Math.sin(t * 1.13 + 1.2) * 0.6;
  const by = Math.cos(t * 0.29) * 1.9 + Math.sin(t * 0.91) * 0.5;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(1.004, 1.004);
  ctx.translate(-W / 2 + bx, -H / 2 + by);
  if (mod) mark('scene', () => mod.draw(ctx, local, scene, { t, frame, index }));
  else {
    ctx.fillStyle = C.ink1;
    ctx.fillRect(0, 0, W, H);
    txt(ctx, scene.key.toUpperCase(), W / 2, 800, { size: 90, font: F.head, color: C.bone, align: 'center' });
  }
  ctx.restore(); // camera breathing
  ctx.restore();

  // captions
  mark('scrim', () => drawScrim(ctx, 1600, 0.7));
  const layouts = captionLayouts.get(scene.id);
  mark('captions', () => scene.captions.forEach((group, gi) => {
    const first = group.words[0].start;
    const last = group.words[group.words.length - 1].end;
    const nextGroup = scene.captions[gi + 1];
    const nextStart = nextGroup?.words[0].start ?? Infinity;
    const nextFrom = nextGroup ? nextStart - 0.16 : Infinity;
    const showFrom = first - 0.16;
    // never overlap two sentences: the outgoing caption is finished before the
    // incoming one starts fading in, so no line can appear to double or shift.
    const showTo = Math.min(last + 0.16, nextStart - 0.03, nextFrom + 0.02);
    const a = clamp((local - showFrom) / 0.12) * clamp((showTo - local) / 0.12);
    if (a <= 0.002) return;
    drawCaption(ctx, layouts[gi], local, { top: CAPTION_TOP, alphaMul: a });
  }));

  mark('chrome', () => drawChrome(ctx, scene, local, t, index));

  // transitions
  if (index > 0) {
    const f = Math.max(0, 1 - local / 0.16);
    drawFlash(ctx, 0.32 * f * f, scene.key === 'oil' ? '#FFE2B8' : '#FFFFFF');
  }
  drawLeak(ctx, t, index > 0 ? Math.max(0, 0.55 - local * 0.9) : 0, C.amber);

  mark('dust', () => drawDust(ctx, t, clamp(local / 1.2) * 0.7));
  mark('film', () => drawFilm(ctx, frame));

  // global fades
  const fadeIn = clamp(t / 0.5);
  const fadeOut = clamp((timeline.total - t) / 0.9);
  const a = Math.min(fadeIn, fadeOut);
  if (a < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - a;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

async function main() {
  await ensureFonts();
  initFilm({ createCanvas });
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  buildLayouts(ctx);

  if (has('stills')) {
    const list = (arg('stills') || '').split(',').map(Number).filter((n) => !Number.isNaN(n));
    const dir = arg('dir', path.join('out', 'stills'));
    fs.mkdirSync(dir, { recursive: true });
    for (const sec of list) {
      const frame = Math.round(sec * FPS);
      const t0 = Date.now();
      drawFrame(ctx, frame);
      const png = await canvas.encode('png');
      const file = path.join(dir, `f${String(frame).padStart(6, '0')}_${sec.toFixed(2)}s.png`);
      fs.writeFileSync(file, png);
      console.log(`still ${file} (${Date.now() - t0}ms)`);
    }
    return;
  }

  const from = Number(arg('from', 0));
  const to = Number(arg('to', Math.round(timeline.total * FPS)));
  const out = arg('out', path.join('out', 'video.mp4'));
  fs.mkdirSync(path.dirname(out), { recursive: true });

  const ff = spawn(ffmpegPath(), [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-an',
    '-c:v', 'libx264', '-preset', arg('preset', 'medium'), '-crf', arg('crf', '18'),
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level:v', '5.2',
    '-g', String(FPS * 2), '-bf', '2',
    '-x264-params', arg('x264', 'aq-mode=3:aq-strength=1.05:deblock=1,1'),
    ...(arg('maxrate') ? ['-maxrate', arg('maxrate'), '-bufsize', arg('bufsize', String(Number(arg('maxrate').replace(/M$/, '')) * 2) + 'M')] : []),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-movflags', '+faststart',
    out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const done = new Promise((res, rej) => {
    ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`))));
  });

  const start = Date.now();
  for (let frame = from; frame < to; frame++) {
    drawFrame(ctx, frame);
    const buf = mark('data', () => canvas.data());
    if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');
    if (frame % 60 === 0) {
      const el = (Date.now() - start) / 1000;
      const fps = (frame - from + 1) / Math.max(el, 0.001);
      const eta = (to - frame) / Math.max(fps, 0.01);
      console.log(`frame ${frame}/${to}  ${fps.toFixed(2)} fps  eta ${Math.round(eta)}s`);
    }
  }
  ff.stdin.end();
  await done;
  if (BENCH) {
    const n = to - from;
    console.log('bench ms/frame:', Object.fromEntries(Object.entries(bench).map(([k, v]) => [k, (v / n).toFixed(1)])));
  }
  console.log(`wrote ${out} in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
