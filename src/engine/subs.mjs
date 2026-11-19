/**
 * Captions in the reference style ("This is how CPI affects you").
 *
 * A phrase of a few words sits high and centred. Words arrive one by one on
 * their spoken onset (phonetic alignment): the word being said is bold white,
 * the words already said drop to a regular, half-white weight, and key words
 * wear a design-tool selection box (navy fill, blue outline, round handles on
 * two corners) that stays until the phrase ends. A new phrase replaces the old
 * one the moment its first word is spoken. Word slots are laid out once for the
 * whole phrase, so nothing reflows while it builds.
 */
import { F } from './fonts.mjs';
import { W } from './draw.mjs';
import { clamp, EASE } from './anim.mjs';

export const SUB = {
  size: 92,
  lineH: 106,
  base: 520, // baseline of the first line (20% of the frame, like the reference)
  maxW: 1120,
  lead: 0.035, // a word lands a hair before its sound, as the eye expects
  inDur: 0.085,
  dim: 0.5,
  box: { stroke: '#3D7BFA', fill: 'rgba(24,48,112,0.52)', handle: '#3D7BFA', padX: 16, up: 0.86, down: 0.26 },
};

const eo = (p) => EASE.outCubic(clamp(p));

function wrap(ws, space, maxW) {
  // a run of boxed words is one unit, so a selection box is never cut in two
  // by a line break unless the run is wider than a whole line
  const units = [];
  ws.forEach((w) => {
    const last = units[units.length - 1];
    if (w.accent && last && last.accent) {
      last.items.push(w);
      last.w += space + w.w;
    } else {
      units.push({ items: [w], w: w.w, accent: !!w.accent });
    }
  });
  const flatUnits = [];
  units.forEach((u) => {
    if (u.w > maxW) u.items.forEach((w) => flatUnits.push({ items: [w], w: w.w }));
    else flatUnits.push(u);
  });
  const lines = [];
  let cur = [];
  let width = 0;
  for (const u of flatUnits) {
    const add = cur.length ? space + u.w : u.w;
    if (cur.length && width + add > maxW) {
      lines.push(cur);
      cur = [...u.items];
      width = u.w;
    } else {
      cur.push(...u.items);
      width += add;
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
}

/** greedy phrases inside one card: split at punctuation first, then by fit (<= 2 lines) */
function autoPhrases(words, fits) {
  const out = [];
  let cur = [];
  const flush = () => { if (cur.length) out.push(cur); cur = []; };
  for (let i = 0; i < words.length; i++) {
    const trial = [...cur, words[i]];
    if (cur.length && !fits(trial)) flush();
    cur.push(words[i]);
    // a clause that ends here closes the phrase when the next clause would not fit with it
    if (/[,.;:!?]$/.test(words[i].text) && i + 1 < words.length) {
      let j = i + 1;
      while (j < words.length && !/[,.;:!?]$/.test(words[j].text)) j++;
      if (!fits([...cur, ...words.slice(i + 1, j + 1)])) flush();
    }
  }
  flush();
  return out;
}

/** true when run `b` starts right after run `a` in reading order (a wrapped selection) */
function flatPrev(a, b) {
  const lastA = a.words[a.words.length - 1];
  const firstB = b.words[0];
  return lastA.lineEnd && firstB.lineStart ? lastA : null;
}

/**
 * Lay out every phrase of a scene. Words carry scene-local start/end, `accent`
 * (box) and `brk` (opens a phrase, from '|' in the script).
 */
export function buildSubs(ctx, scene) {
  const S = SUB;
  ctx.save();
  ctx.font = `${S.size}px ${F.sub}`;
  const space = ctx.measureText(' ').width * 1.08;
  const measure = (text) => ctx.measureText(text).width;
  const fits = (ws) => wrap(ws.map((w) => ({ ...w, w: measure(w.text) })), space, S.maxW).length <= 2;

  const phrases = [];
  scene.captions.forEach((card) => {
    const words = card.words.map((w) => ({ ...w }));
    const hasBreaks = words.some((w, i) => i > 0 && w.brk);
    let groups;
    if (hasBreaks) {
      groups = [];
      words.forEach((w, i) => {
        if (i === 0 || w.brk) groups.push([]);
        groups[groups.length - 1].push(w);
      });
    } else {
      groups = autoPhrases(words, fits);
    }
    groups.forEach((g) => phrases.push(g));
  });

  const laid = phrases.map((ws) => {
    const sized = ws.map((w) => ({ ...w, w: measure(w.text) }));
    const lines = wrap(sized, space, S.maxW);
    const boxes = [];
    lines.forEach((line, li) => {
      const lw = line.reduce((a, w) => a + w.w, 0) + space * (line.length - 1);
      let x = (W - lw) / 2;
      const y = S.base + li * S.lineH;
      line.forEach((w, k) => {
        w.x = x;
        w.y = y;
        w.lineStart = k === 0;
        w.lineEnd = k === line.length - 1;
        x += w.w + space;
      });
      // consecutive boxed words on one line share one selection box
      let run = null;
      line.forEach((w, k) => {
        if (w.accent) {
          if (!run) run = { words: [], line: li };
          run.words.push(w);
        }
        if (run && (!w.accent || k === line.length - 1)) {
          boxes.push(run);
          run = null;
        }
      });
    });
    const flat = lines.flat();
    return {
      words: flat,
      lines: lines.length,
      start: flat[0].start,
      boxes: boxes.map((b, bi) => {
        const a = b.words[0];
        const z = b.words[b.words.length - 1];
        // a run that wraps onto the next line continues the same selection
        const prev = boxes[bi - 1];
        const next = boxes[bi + 1];
        const contPrev = prev && prev.line === b.line - 1 && prev.words[prev.words.length - 1] === flatPrev(prev, b);
        const contNext = next && next.line === b.line + 1 && flatPrev(b, next);
        return {
          x: a.x - S.box.padX,
          y: a.y - S.size * S.box.up,
          w: z.x + z.w - a.x + S.box.padX * 2,
          h: S.size * (S.box.up + S.box.down),
          start: contPrev ? prev.words[0].start : a.start,
          tl: !contPrev,
          br: !contNext,
        };
      }),
    };
  });
  ctx.restore();
  return laid;
}

function drawBox(ctx, b, t) {
  const S = SUB;
  const t0 = b.start - S.lead + 0.1;
  const f = eo((t - t0) / 0.07);
  if (f <= 0.001) return;
  const o = clamp((t - t0 - 0.025) / 0.1);
  const k = 0.94 + 0.06 * EASE.outBack(clamp(o));
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(k, k);
  ctx.translate(-cx, -cy);
  // fill
  ctx.globalAlpha = f;
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, 10);
  ctx.fillStyle = S.box.fill;
  ctx.fill();
  // outline and handles
  if (o > 0.001) {
    ctx.globalAlpha = o;
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = S.box.stroke;
    ctx.stroke();
    const handles = [];
    if (b.tl !== false) handles.push([b.x, b.y]);
    if (b.br !== false) handles.push([b.x + b.w, b.y + b.h]);
    for (const [hx, hy] of handles) {
      ctx.beginPath();
      ctx.arc(hx, hy, 9.5, 0, Math.PI * 2);
      ctx.fillStyle = S.box.handle;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawWord(ctx, w, font, color, alpha, dy, blur) {
  if (alpha <= 0.004) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${SUB.size}px ${font}`;
  if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  // centred in its slot: the regular weight is narrower than the bold one
  const tw = ctx.measureText(w.text).width;
  ctx.fillText(w.text, w.x + (w.w - tw) / 2, w.y + dy);
  ctx.restore();
}

/** Draw the phrase that is live at scene-local time t. */
export function drawSubs(ctx, phrases, t, { alpha = 1 } = {}) {
  const S = SUB;
  let ph = null;
  for (const p of phrases) if (t >= p.start - S.lead) ph = p;
  if (!ph || alpha <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ph.boxes.forEach((b) => drawBox(ctx, b, t));
  const ws = ph.words;
  ws.forEach((w, i) => {
    const t0 = w.start - S.lead;
    if (t < t0) return;
    const e = clamp((t - t0) / S.inDur);
    const ee = eo(e);
    const dy = -12 * (1 - ee);
    const blur = 9 * (1 - ee);
    const next = ws[i + 1];
    // the spoken word holds bold until the next one arrives, then drops back
    const k = w.accent || !next ? 0 : clamp((t - (next.start - S.lead)) / 0.07);
    drawWord(ctx, w, F.sub, '#FFFFFF', ee * (1 - k), dy, blur);
    if (k > 0) drawWord(ctx, w, F.subDim, '#FFFFFF', S.dim * k, 0, 0);
  });
  ctx.restore();
}
