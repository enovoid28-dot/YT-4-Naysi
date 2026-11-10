import { F } from './fonts.mjs';
import { C, W, hexA, measure } from './draw.mjs';
import { clamp, spring, lerp, EASE } from './anim.mjs';

const SCALES = [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68, 0.64, 0.6, 0.56, 0.52, 0.48];
const MAX_LINES = 4;

/** Wrap words into lines that fit maxWidth; every line carries a real width. */
function wrapWords(ctx, words, space, maxWidth) {
  const lines = [];
  let line = [];
  let wsum = 0;
  for (const word of words) {
    const ww = ctx.measureText(word.text).width;
    const add = line.length ? ww + space : ww;
    if (line.length && wsum + add > maxWidth) {
      lines.push({ words: line, width: wsum });
      line = [{ ...word, width: ww }];
      wsum = ww;
    } else {
      line.push({ ...word, width: ww });
      wsum += add;
    }
  }
  if (line.length) lines.push({ words: line, width: wsum });
  return lines;
}

/**
 * Wrap caption words into at most MAX_LINES lines, shrinking type until it fits.
 * The returned lines always carry the width that will actually be drawn, so the
 * block can never be centred on a phantom width and slide off the frame.
 */
export function buildCaption(ctx, group, { maxWidth, size = 78, font = F.semi, maxLines = MAX_LINES }) {
  ctx.save();
  let three = null;
  let four = null;
  let smallest = null;
  for (const scale of SCALES) {
    const s = Math.round(size * scale);
    ctx.font = `${s}px ${font}`;
    const space = ctx.measureText(' ').width * 1.45;
    const widest = Math.max(...group.words.map((w) => ctx.measureText(w.text).width));
    if (widest > maxWidth) continue; // this size cannot hold a single word
    const lines = wrapWords(ctx, group.words, space, maxWidth);
    const cand = { size: s, font, lines, space };
    smallest = cand;
    const widow = lines.length > 1 && lines[lines.length - 1].words.length === 1;
    if (maxLines > 2 && !three && lines.length <= 3 && !widow) three = cand;
    if (!four && lines.length <= maxLines && !widow) four = cand;
    if (three) break;
  }
  let best = three || four || smallest;
  if (!best) {
    // pathological: a single word wider than the frame at every size
    const s = Math.round(size * SCALES[SCALES.length - 1]);
    ctx.font = `${s}px ${font}`;
    const space = ctx.measureText(' ').width * 1.45;
    best = { size: s, font, lines: wrapWords(ctx, group.words, space, maxWidth), space };
  }
  ctx.restore();
  return best;
}

/**
 * Kinetic caption: past words solid, the spoken word in accent with a pop,
 * upcoming words dimmed. Times are scene-relative seconds.
 */
export function drawCaption(ctx, layout, t, o = {}) {
  const {
    top = 1842,
    color = C.bone,
    accent = C.amber,
    align = 'center',
    x = W / 2,
    alphaMul = 1,
    shadow = 12,
    lineHeight = 1.12,
  } = o;
  const { size, font, lines, space } = layout;
  const lh = size * lineHeight;
  // The block is anchored by its first line, never by its bottom: a two-line
  // caption and a three-line caption therefore share the same starting point,
  // so the type cannot jump up or down when the sentence changes.
  const baseAlpha = ctx.globalAlpha * alphaMul;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  lines.forEach((line, li) => {
    const y = top + li * lh + size * 0.76;
    // hard guard: if a line is still wider than the safe area, shrink it about
    // the anchor instead of letting it run off the right edge.
    const fit = Math.min(1, (W - 2 * 96) / Math.max(1, line.width));
    const lsize = size * fit;
    let cx = align === 'center' ? x - (line.width * fit) / 2 : x;
    for (const w of line.words) {
      const isActive = t >= w.start && t < w.end + 0.13;
      let a;
      if (t < w.start - 0.26) a = 0.34;
      else if (t < w.start) a = lerp(0.34, 0.66, clamp((t - (w.start - 0.26)) / 0.26));
      else if (isActive) a = 1;
      else a = 0.94;
      // one-way ease-in: no overshoot, so a word never bounces past its
      // final spot and the line never appears to shift sideways.
      const inT = clamp((t - w.start + 0.06) / 0.22);
      const rise = (1 - EASE.outCubic(inT)) * 10;

      ctx.save();
      ctx.globalAlpha = baseAlpha * a;
      ctx.font = `${lsize}px ${font}`;
      ctx.translate(cx + (w.width * fit) / 2, y + rise);
      ctx.shadowColor = isActive ? hexA(accent, 0.6) : 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = isActive ? 16 : shadow;
      ctx.shadowOffsetY = isActive ? 0 : 7;
      ctx.fillStyle = isActive ? accent : color;
      ctx.fillText(w.text, (-w.width * fit) / 2, 0);
      ctx.restore();
      cx += (w.width + space) * fit;
    }
  });
  ctx.restore();
}

/** Big editorial headline that assembles word by word. */
export function drawHeadline(ctx, o) {
  const {
    text,
    x = W / 2,
    y = 380,
    size = 132,
    font = F.head,
    color = C.bone,
    accent = C.amber,
    align = 'center',
    t = 0,
    start = 0,
    stagger = 0.09,
    maxWidth = W - 220,
    accentWords = [],
    lineHeight = 1.02,
    glowBlur = 0,
  } = o;
  const words = text.split(' ');
  let s = size;
  ctx.save();
  ctx.font = `${s}px ${font}`;
  while (ctx.measureText(text).width > maxWidth && s > 32) {
    s *= 0.96;
    ctx.font = `${s}px ${font}`;
  }
  const lines = [];
  let cur = [];
  let cw = 0;
  const sp = ctx.measureText(' ').width;
  for (const w of words) {
    const ww = ctx.measureText(w).width;
    if (cur.length && cw + ww > maxWidth) {
      lines.push({ words: cur, width: cw - sp });
      cur = [{ w, ww }];
      cw = ww + sp;
    } else {
      cur.push({ w, ww });
      cw += ww + sp;
    }
  }
  if (cur.length) lines.push({ words: cur, width: cw - sp });
  const lh = s * lineHeight;
  ctx.restore();

  let idx = 0;
  lines.forEach((line, li) => {
    let cx = align === 'center' ? x - line.width / 2 : x;
    const by = y + li * lh;
    for (const word of line.words) {
      const st = start + idx * stagger;
      const i = idx;
      idx++;
      const p = clamp((t - st) / 0.55);
      if (p <= 0) {
        cx += word.ww + sp;
        continue;
      }
      const sp2 = spring(p * 1.15, 12, 0.62);
      const rise = (1 - sp2) * 66;
      const a = clamp(p * 1.7);
      const isAcc = accentWords.includes(i) || accentWords.includes(word.w.toLowerCase());
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.translate(cx + word.ww / 2, by + rise);
      ctx.scale(lerp(0.94, 1, sp2), lerp(0.94, 1, sp2));
      ctx.font = `${Math.round(s)}px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      if (glowBlur) {
        ctx.shadowColor = isAcc ? hexA(accent, 0.6) : 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = glowBlur;
      }
      ctx.fillStyle = isAcc ? accent : color;
      ctx.fillText(word.w, 0, 0);
      ctx.restore();
      cx += word.ww + sp;
    }
  });
  return { size: s, lines: lines.length };
}

/**
 * Card caption: the whole sentence arrives as one typographic block and stays
 * still. Word-by-word karaoke needs a word timeline that is only ever an
 * estimate; a card that appears exactly when its sentence starts cannot drift.
 * Accent words carry the colour, the rest stay neutral.
 */
export function drawCard(ctx, layout, local, o = {}) {
  const {
    top = 1800,
    color = C.bone,
    accent = C.amber,
    alphaMul = 1,
    x = W / 2,
    lineHeight = 1.1,
    shadow = 14,
    stagger = 0.028,
  } = o;
  const { size, font, lines, space } = layout;
  const lh = size * lineHeight;
  const base = ctx.globalAlpha * alphaMul;
  let idx = 0;
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  lines.forEach((line, li) => {
    const y = top + li * lh + size * 0.78;
    const fit = Math.min(1, (W - 2 * 86) / Math.max(1, line.width));
    const lsize = size * fit;
    let cx = x - (line.width * fit) / 2;
    for (const w of line.words) {
      const st = idx * stagger;
      idx++;
      const p = clamp((local - st) / 0.26);
      if (p <= 0) {
        cx += (w.width + space) * fit;
        continue;
      }
      const e = EASE.outCubic(p);
      const rise = (1 - e) * 26;
      ctx.save();
      ctx.globalAlpha = base * e;
      ctx.font = `${lsize}px ${font}`;
      ctx.translate(cx + (w.width * fit) / 2, y + rise);
      ctx.shadowColor = shadow ? 'rgba(0,0,0,0.55)' : 'transparent';
      ctx.shadowBlur = shadow;
      ctx.shadowOffsetY = shadow ? 7 : 0;
      ctx.fillStyle = w.accent ? accent : color;
      ctx.fillText(w.text, (-w.width * fit) / 2, 0);
      ctx.restore();
      cx += (w.width + space) * fit;
    }
  });
  ctx.restore();
}
