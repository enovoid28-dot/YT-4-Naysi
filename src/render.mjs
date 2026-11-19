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
import { initLook, beginLook, bloom, cutFx, impactFx, shake, foreground, grade, hit, LOOK } from './engine/look.mjs';
import { buildTimeline, sceneAt } from './timeline.mjs';
import { SCENES, BRAND, SERIES } from './script.mjs';
import * as SCRIPT from './script.mjs';
import { clamp, lerp, EASE, noise1 } from './engine/anim.mjs';
import sceneMap from './scenes/index.mjs';
import { D_DEAL as DOSSIER_DEAL } from './scenes/_dossier.mjs';
import { ffmpegPath } from './engine/ffmpeg.mjs';

const args = process.argv.slice(2);
const arg = (name, def = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const timeline = buildTimeline();
const subLayouts = new Map();
// the finishing style of the episode: 'glow' (default) or 'print' (episode 28:
// cyanotype plates, no halation or chromatic split, paper-sheet cuts)
const STYLE = SCRIPT.STYLE || {};
// 'atlas' (episode 29): printed atlas sheets dealt onto a chart table; it
// shares the print finishing and replaces the plate swap with the deal
const ATLAS = STYLE.look === 'atlas';
// 'dossier' (episode 30): lab dossiers dealt onto a dark cutting mat; like
// atlas it draws two layers per scene and moves one table camera at the end.
// 'textbook' (episode 31) is the same machinery with school-book pages on a
// walnut desk, so it shares the deal, the camera and the light grade.
const DOSSIER = STYLE.look === 'dossier' || STYLE.look === 'textbook';
const PRINT = STYLE.look === 'print' || ATLAS;

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
  ctx.save();
  ctx.font = `26px ${F.num6}`;
  ctx.letterSpacing = '2px';
  const iw = ctx.measureText(`${scene.index}`).width;
  ctx.restore();
  txt(ctx, `—  ${scene.label}`, M + Math.max(44, iw + 14), y, { size: 26, font: F.num6, color: ink, track: 4 });
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

/** one scene under its camera, into ctx (clears the frame first) */
function paintScene(ctx, scene, index, local, t, frame) {
  const mod = sceneMap[scene.key];
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
  const inK = index > 0 && !PRINT ? 0.075 * (1 - EASE.outExpo(clamp(local / 0.5))) : 0;
  const outK = last || PRINT ? 0 : 0.06 * EASE.inQuad(clamp(1 - tail / 0.24));
  const zoom = dir * (0.058 * zp - 0.014) + inK + outK;
  const camDx = Math.sin(local * 0.28 + index * 1.7) * 9 + bx;
  const camDy = Math.cos(local * 0.21 + index) * 7 + by;
  const cam = { p: zp, dx: camDx * 0.55, dy: camDy * 0.55, zoom: zoom * 0.32 };
  ctx.save();
  // (atlas/dossier: the table camera is applied once to the finished picture,
  // see atlasCamPost, so every layer here draws on whole pixels)
  if (!ATLAS && !DOSSIER) {
    ctx.translate(W / 2 + camDx, H / 2 + camDy);
    ctx.scale(1 + zoom, 1 + zoom);
    ctx.translate(-W / 2, -H / 2);
  }
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
  return cam;
}

/* ------------- atlas: one table camera, sheets dealt onto the stack ------------ */

/** the camera over the chart table: continuous across cuts, so the table,
 *  the stack and both sheets of a cut always share one move. It is applied
 *  to the finished picture in one resampling pass (with the knock of a
 *  landing sheet folded in), instead of resampling every layer. */
let camBuf = null;
function atlasCamPost(ctx, t) {
  if (!camBuf) camBuf = createCanvas(W, H);
  let dx = Math.sin(t * 0.13 + 0.4) * 7 + Math.sin(t * 0.37) * 1.4 + Math.sin(t * 1.13 + 1.2) * 0.5;
  let dy = Math.cos(t * 0.11) * 6 + Math.cos(t * 0.29) * 1.6 + Math.sin(t * 0.91) * 0.45;
  let z = 1.012 + 0.008 * Math.sin(t * 0.07 + 1.1);
  const k = clamp(LOOK.impact);
  if (k > 0.05) {
    const amp = 12 * k;
    dx += Math.sin(t * 97.3) * amp;
    dy += Math.cos(t * 83.1) * amp * 0.8;
    z += 0.02 * k;
  }
  // never let the moved picture uncover the frame edge
  z = Math.max(z, 1 + (2 * (Math.abs(dx) + 3)) / W, 1 + (2 * (Math.abs(dy) + 3)) / H);
  const b = camBuf.getContext('2d');
  b.globalCompositeOperation = 'copy';
  b.drawImage(ctx.canvas, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'copy';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';
  ctx.drawImage(camBuf, W / 2 - (W * z) / 2 + dx, H / 2 - (H * z) / 2 + dy, W * z, H * z);
  ctx.restore();
}

const DEAL = 0.5;

function drawMod(scene, ctx, local, o) {
  const mod = sceneMap[scene.key];
  if (!mod) return;
  try {
    mod.draw(ctx, local, scene, o);
  } catch (err) {
    if (!globalThis.__sceneErr) globalThis.__sceneErr = new Set();
    const key = `${scene.key}:${err.message}`;
    if (!globalThis.__sceneErr.has(key)) {
      globalThis.__sceneErr.add(key);
      console.error(`scene ${scene.key} failed: ${err.message}`);
    }
  }
}

/** the cut: the outgoing sheet stays on the table and is nudged into the
 *  stack as the next sheet is dealt over it from the right */
function atlasDeal(ctx, index, local, t, frame) {
  const prev = timeline.scenes[index - 1];
  const cur = timeline.scenes[index];
  const u = clamp(local / DEAL);
  const e = EASE.outQuint(u);
  const nudge = EASE.smooth(clamp((u - 0.42) / 0.5));
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.ink0;
  ctx.fillRect(0, 0, W, H);
  const base = { t, frame, cam: { p: 0, dx: 0, dy: 0, zoom: 0 } };
  drawMod(prev, ctx, prev.dur + local, { ...base, index: index - 1, layer: 'bg' });
  drawMod(prev, ctx, prev.dur + local, { ...base, index: index - 1, layer: 'card', nudge });
  drawMod(cur, ctx, local, { ...base, index, layer: 'card', deal: 1 - e });
  ctx.restore();
}

/* ----------- dossier cuts: the old sheet is pulled away as one lands ------- */

/** the outgoing dossier is dragged off the mat (up-left, tilting) while the
 *  incoming one drops in from above-right; the desk stays under both. */
function dossierDeal(ctx, index, local, t, frame) {
  const prev = timeline.scenes[index - 1];
  const cur = timeline.scenes[index];
  const u = clamp(local / DOSSIER_DEAL);
  const e = EASE.outQuint(u);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.ink0;
  ctx.fillRect(0, 0, W, H);
  const base = { t, frame, cam: { p: 0, dx: 0, dy: 0, zoom: 0 } };
  drawMod(cur, ctx, local, { ...base, index, layer: 'bg' });
  drawMod(prev, ctx, prev.dur + local, { ...base, index: index - 1, layer: 'card', exit: u });
  // contact shadow of the landing sheet on the mat
  if (u < 1) {
    const k = 1 - e;
    ctx.save();
    ctx.globalAlpha = 0.34 * k;
    ctx.fillStyle = '#000';
    ctx.translate(W / 2 + 260 * k, H / 2 - 300 * k * k);
    ctx.rotate(-0.05 * k);
    ctx.fillRect(-620, -780, 1240, 1560);
    ctx.restore();
  }
  drawMod(cur, ctx, local, { ...base, index, layer: 'card', deal: 1 - e });
  ctx.restore();
}

/* ------------------- print cuts: the next plate slides in ------------------ */

const SWAP = 0.46;
const EDGE_W = 150;
let swapBuf = null;
let edgeStrip = null;

/** the incoming sheet's left margin: a deckled edge, bare paper, then the
 *  brushed boundary where the sensitiser starts (bristle streaks) */
function bakeEdge() {
  const cv = createCanvas(EDGE_W, H);
  const c = cv.getContext('2d');
  const img = c.createImageData(EDGE_W, H);
  let seed = 4093;
  for (let y = 0; y < H; y++) {
    const dk = 14 + 6 * noise1(y / 9, 1) + 3 * noise1(y / 2.3, 2);
    const be = EDGE_W - 70 + 24 * noise1(y / 140, 3) + 12 * noise1(y / 31, 4);
    for (let x = 0; x < EDGE_W; x++) {
      let al = 0;
      if (x >= dk) {
        if (x < be) al = 1;
        else {
          const streak = noise1(y / 1.6 + x * 0.015, 5) * 0.7 + noise1(y / 6 + x * 0.03, 6) * 0.3;
          const fade = 1 - (x - be) / (EDGE_W - be);
          al = clamp(fade * 1.7 - (1 - streak) * 1.0);
        }
        if (x - dk < 2) al *= (x - dk + 1) / 3;
      }
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const n = ((seed >>> 24) - 128) / 32;
      const o = (y * EDGE_W + x) * 4;
      img.data[o] = 234 + n;
      img.data[o + 1] = 239 + n;
      img.data[o + 2] = 233 + n;
      img.data[o + 3] = 255 * al;
    }
  }
  c.putImageData(img, 0, 0);
  return cv;
}

function plateSwap(ctx, index, local, t, frame) {
  if (!swapBuf) {
    swapBuf = createCanvas(W, H);
    edgeStrip = bakeEdge();
  }
  const prev = timeline.scenes[index - 1];
  const e = EASE.outQuint(clamp(local / SWAP));
  const b = swapBuf.getContext('2d');
  b.globalCompositeOperation = 'copy';
  b.drawImage(ctx.canvas, 0, 0);
  b.globalCompositeOperation = 'source-over';
  // the outgoing plate keeps moving underneath, drifts left and darkens
  ctx.save();
  ctx.translate(-110 * e, 0);
  paintScene(ctx, prev, index - 1, prev.dur + local, t, frame);
  ctx.restore();
  const xe = W * (1 - e);
  ctx.save();
  ctx.fillStyle = `rgba(2,7,20,${0.42 * e})`;
  ctx.fillRect(0, 0, W, H);
  // contact shadow cast leftward by the incoming sheet's edge
  const sx = xe - (EDGE_W - 64);
  const g = ctx.createLinearGradient(sx - 90, 0, sx + 6, 0);
  g.addColorStop(0, 'rgba(1,4,12,0)');
  g.addColorStop(1, 'rgba(1,4,12,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(sx - 90, 0, 96, H);
  ctx.drawImage(swapBuf, xe, 0);
  ctx.globalAlpha = 1 - EASE.smooth(clamp((e - 0.82) / 0.18));
  ctx.drawImage(edgeStrip, sx, 0);
  ctx.restore();
}

function drawFrame(ctx, frame) {
  const t = frame / FPS;
  const { scene, index, local } = sceneAt(timeline, t);
  beginLook();
  const dealWin = DOSSIER ? DOSSIER_DEAL : DEAL;
  const dealing = (ATLAS || DOSSIER) && index > 0 && local < dealWin;
  const cam = dealing
    ? mark('scene', () => (DOSSIER ? dossierDeal(ctx, index, local, t, frame) : atlasDeal(ctx, index, local, t, frame)))
    : paintScene(ctx, scene, index, local, t, frame);
  const tail = scene.dur - local;
  const last = index === timeline.scenes.length - 1;

  if (DOSSIER) {
    // dossiers: the landing sheet knocks through the mat, one table camera,
    // a light grade — no halation, no RGB split on paper
    if (index > 0) hit(local, DOSSIER_DEAL * 0.62, 0.3, 0.22);
    mark('shake', () => atlasCamPost(ctx, t));
    mark('grade', () => grade(ctx, { warm: 0.05, cool: 0.03 }));
  } else if (PRINT) {
    // printed plates: the cut is a sheet sliding over the last one; accents
    // only kick the camera; a light grade, no halation, no RGB split
    if (!ATLAS && index > 0 && local < SWAP) mark('cut', () => plateSwap(ctx, index, local, t, frame));
    // the sheet lands: a small knock through the table
    if (ATLAS && index > 0) hit(local, DEAL * 0.62, 0.32, 0.22);
    if (ATLAS) mark('shake', () => atlasCamPost(ctx, t));
    else mark('shake', () => shake(ctx, t));
    mark('grade', () => grade(ctx, ATLAS ? { warm: 0.06, cool: 0 } : { warm: 0.07, cool: 0.04 }));
  } else {
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
  }

  // captions: karaoke cards low in the frame over a soft scrim, under the
  // chrome and the film pass like the rest of the picture
  mark('scrim', () => drawScrim(ctx, STYLE.scrimY ?? 1520, STYLE.scrimA ?? 0.8));
  mark('captions', () => drawKaraoke(ctx, subLayouts.get(scene.id), local));

  mark('chrome', () => drawChrome(ctx, scene, local, t, index));

  // cuts: the incoming scene opens under a short veil of its own ink
  if (index > 0 && !PRINT && !DOSSIER) {
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
  // (an atlas sheet is already on the table at frame 0: no fade at all)
  const fadeIn = ATLAS || DOSSIER ? 1 : clamp(t / 0.15);
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
