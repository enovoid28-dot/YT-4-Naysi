import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { ensureFonts, F } from './engine/fonts.mjs';
import { W, H, FPS, C, M, txt, tracking, linGrad, hexA, fillRR } from './engine/draw.mjs';
import {
  initFilm, drawGrain, drawVignette, drawScrim, drawFlash, drawFilm,
} from './engine/film.mjs';
import { buildKaraoke, drawKaraoke } from './engine/karaoke.mjs';
import { initLook, beginLook, bloom, cutFx, impactFx, shake, foreground, grade, LOOK } from './engine/look.mjs';
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
const subLayouts = new Map();

function buildLayouts(ctx) {
  for (const s of timeline.scenes) subLayouts.set(s.id, buildKaraoke(ctx, s));
}

function drawChapter(ctx, scene, local, idxGlobal) {
  const p = EASE.outCubic(clamp(local / 0.45));
  const y = H - 96;
  const light = scene.theme === 'light';
  const ink = light ? 'rgba(23,19,16,0.62)' : C.bone;
  ctx.save();
  ctx.globalAlpha = (light ? 0.85 : 0.55) * p;
  txt(ctx, `${scene.index}`, M, y, { size: 26, font: F.num6, color: light ? '#B32E1C' : C.amber, track: 2 });
  txt(ctx, `—  ${scene.label}`, M + 44, y, { size: 26, font: F.num6, color: ink, track: 4 });
  ctx.restore();

  // series ticks on the right
  const n = SCENES.length;
  const tw = 22;
  const gap = 8;
  const total = n * tw + (n - 1) * gap;
  let x = W - M - total;
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.globalAlpha = i === idxGlobal ? 0.95 : (scene.theme === 'light' ? 0.30 : 0.22);
    fillRR(ctx, x, H - 108, tw, 5, 2.5,
      i === idxGlobal ? (scene.theme === 'light' ? '#B32E1C' : C.amber) : (scene.theme === 'light' ? 'rgba(23,19,16,0.5)' : C.bone));
    ctx.restore();
    x += tw + gap;
  }
}

function drawChrome(ctx, scene, local, tGlobal, idxGlobal) {
  const light = scene.theme === 'light';
  ctx.save();
  const gi = ctx.createLinearGradient(0, 0, 0, 300);
  gi.addColorStop(0, light ? 'rgba(210,190,158,0.55)' : 'rgba(3,4,7,0.55)');
  gi.addColorStop(1, light ? 'rgba(210,190,158,0)' : 'rgba(3,4,7,0)');
  ctx.fillStyle = gi;
  ctx.fillRect(0, 0, W, 300);
  ctx.restore();

  // brand mark
  ctx.save();
  fillRR(ctx, M, 96, 16, 16, 4, light ? '#B32E1C' : C.amber);
  txt(ctx, BRAND, M + 30, 115, {
    size: 34, font: F.head, color: light ? 'rgba(23,19,16,0.9)' : C.bone, track: 7, alpha: 0.92,
  });
  ctx.restore();

  tracking(ctx, SERIES, W - M, 114, {
    size: 25, font: F.num6, track: 5, align: 'right',
    color: light ? 'rgba(23,19,16,0.55)' : hexA(C.bone, 0.55),
  });

  drawChapter(ctx, scene, local, idxGlobal);

  // progress
  const prog = clamp(tGlobal / timeline.total);
  ctx.save();
  ctx.globalAlpha = light ? 0.16 : 0.2;
  ctx.fillStyle = light ? '#171310' : C.bone;
  ctx.fillRect(0, H - 8, W, 8);
  ctx.globalAlpha = 1;
  const g = light
    ? linGrad(ctx, 0, 0, W, 0, [[0, '#8E2216'], [1, '#E2452F']])
    : linGrad(ctx, 0, 0, W, 0, [[0, C.ember], [0.6, C.amber], [1, C.amberHi]]);
  ctx.fillStyle = g;
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

// the light of each cut: the incoming scene's key colour
const LEAK = ['255,170,110', '255,186,120', '110,214,200', '255,120,92', '170,206,255', '255,196,128', '196,236,140', '255,150,96'];

function drawFrame(ctx, frame) {
  const t = frame / FPS;
  const { scene, index, local } = sceneAt(timeline, t);
  const mod = sceneMap[scene.key];
  beginLook();
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.ink0;
  ctx.fillRect(0, 0, W, H);
  // camera: every scene gets a slow move (push in or pull out, alternating),
  // so even a still composition breathes like a shot instead of a slide.
  const bx = Math.sin(t * 0.37) * 1.4 + Math.sin(t * 1.13 + 1.2) * 0.5;
  const by = Math.cos(t * 0.29) * 1.6 + Math.sin(t * 0.91) * 0.45;
  const dir = index % 2 === 0 ? 1 : -1;
  const zp = EASE.smooth(clamp(local / Math.max(0.2, scene.dur)));
  // zoom-through cuts: the outgoing shot pushes in over its last frames and
  // the incoming one lands from a little closer, settling on an expo curve
  const tail = scene.dur - local;
  const last = index === timeline.scenes.length - 1;
  const inK = index > 0 ? 0.075 * (1 - EASE.outExpo(clamp(local / 0.5))) : 0;
  const outK = last ? 0 : 0.06 * EASE.inQuad(clamp(1 - tail / 0.24));
  const zoom = dir * (0.058 * zp - 0.014) + inK + outK;
  const camDx = Math.sin(local * 0.28 + index * 1.7) * 9 + bx;
  const camDy = Math.cos(local * 0.21 + index) * 7 + by;
  const cam = { p: zp, dx: camDx * 0.55, dy: camDy * 0.55, zoom: zoom * 0.32 };
  ctx.save();
  ctx.translate(W / 2 + camDx, H / 2 + camDy);
  ctx.scale(1 + zoom, 1 + zoom);
  ctx.translate(-W / 2, -H / 2);
  if (mod) {
    try {
      mark('scene', () => mod.draw(ctx, local, scene, { t, frame, index, cam }));
    } catch (err) {
      // one bad frame must never cost a 15 000-frame render
      if (!globalThis.__sceneErr) globalThis.__sceneErr = new Set();
      const key = `${scene.key}:${err.message}`;
      if (!globalThis.__sceneErr.has(key)) {
        globalThis.__sceneErr.add(key);
        console.error(`scene ${scene.key} failed at frame ${frame}: ${err.message}`);
      }
    }
  } else {
    ctx.fillStyle = C.ink1;
    ctx.fillRect(0, 0, W, H);
    txt(ctx, scene.key.toUpperCase(), W / 2, 800, { size: 90, font: F.head, color: C.bone, align: 'center' });
  }
  ctx.restore();
  ctx.restore();

  // the finishing pass on the picture only (captions and chrome stay crisp):
  // foreground depth, split-tone grade, halation, accent hits, the cut kit
  mark('shake', () => shake(ctx, t));
  mark('fore', () => foreground(ctx, t, cam));
  mark('grade', () => grade(ctx));
  mark('bloom', () => bloom(ctx, { th: 0.6, k: 0.5 * LOOK.bloom }));
  mark('impact', () => impactFx(ctx));
  mark('cut', () => {
    if (index > 0 && local < 0.26) cutFx(ctx, local, { rgb: LEAK[index % LEAK.length], side: index % 2 ? 1 : -1 });
    else if (!last && tail < 0.12) cutFx(ctx, -tail, { rgb: LEAK[(index + 1) % LEAK.length], side: (index + 1) % 2 ? 1 : -1 });
  });

  // captions: karaoke cards low in the frame over a soft scrim, under the
  // chrome and the film pass like the rest of the picture
  mark('scrim', () => drawScrim(ctx, 1520, 0.8));
  mark('captions', () => drawKaraoke(ctx, subLayouts.get(scene.id), local));

  mark('chrome', () => drawChrome(ctx, scene, local, t, index));

  // cuts: the incoming scene opens under a short veil of its own ink
  if (index > 0) {
    const f = Math.max(0, 1 - local / 0.16);
    if (f > 0) {
      ctx.save();
      ctx.globalAlpha = f * f * 0.6;
      ctx.fillStyle = scene.theme === 'light' ? '#F4ECDC' : '#06090C';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }
  mark('film', () => drawFilm(ctx, frame));

  // global fades
  // open on picture almost at once: the first second decides the swipe
  const fadeIn = clamp(t / 0.15);
  const fadeOut = clamp((timeline.total - t) / 0.5);
  const a = Math.min(fadeIn, fadeOut);
  if (a < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - a;
    ctx.fillStyle = scene.theme === 'light' ? '#F4ECDC' : '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

async function main() {
  await ensureFonts();
  initFilm({ createCanvas });
  initLook({ createCanvas });
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

  if (has('sweep')) {
    // draw every n-th frame without encoding: timings and scene errors only
    const step = Number(arg('sweep', 9));
    const times = [];
    for (let frame = from; frame < to; frame += step) {
      const t0 = performance.now();
      drawFrame(ctx, frame);
      ctx.getImageData(0, 0, 1, 1);
      times.push([performance.now() - t0, frame]);
      if (times.length % 20 === 0 && globalThis.gc) globalThis.gc();
    }
    times.sort((a, b) => b[0] - a[0]);
    const avg = times.reduce((a, b) => a + b[0], 0) / times.length;
    console.log(`sweep ${from}-${to}/${step}: ${times.length} frames, avg ${avg.toFixed(0)} ms, worst ${times.slice(0, 5).map(([ms, f]) => `${f}:${ms.toFixed(0)}`).join(' ')}`);
    console.log(`errors: ${globalThis.__sceneErr ? [...globalThis.__sceneErr].join(' | ') : 'none'}`);
    return;
  }
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
