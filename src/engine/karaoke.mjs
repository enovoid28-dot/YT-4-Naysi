import { F } from './fonts.mjs';
import { C, W } from './draw.mjs';
import { clamp, EASE } from './anim.mjs';

/**
 * Karaoke captions, the house style of "Utang Tidur v2": the whole sentence is
 * on screen from its first word, low and centred. Upcoming words wait dim and a
 * little low; each one brightens just before it is spoken, steps up onto the
 * line and burns amber while the voice says it, then settles to warm white.
 * Cards fade in and out on the sentence, never on top of each other.
 */
export const KARAOKE = {
  size: 90, // type size; long sentences step down until they fit in three lines
  step: 0.945, // each step is this much smaller (90, 85, 80, 76, 72, 68, ...)
  maxWidth: 1210,
  maxLines: 3,
  space: 1.45, // word gap, in spaces
  lineHeight: 1.1,
  baseline: 2118, // the last line always sits here, whatever the line count
  dim: 0.34, // upcoming words
  pre: 0.66, // ...brightening to this over `preRoll` before they are spoken
  past: 0.94, // spoken words
  preRoll: 0.26,
  hold: 0.13, // a word stays amber this long after it ends
  rise: 0.2, // upcoming words sit this much (x size) below the line...
  riseAt: 0.09, // ...and step up this long before they are spoken
  riseDur: 0.055,
  lead: 0.14, // a card opens this long before its first word
  fadeIn: 0.15,
  fadeOut: 0.13,
};

const clean = (s) => String(s).replace(/[*|]/g, '');

function wrap(ctx, words, space, maxW) {
  const lines = [];
  let line = [];
  let wsum = 0;
  for (const w of words) {
    const ww = ctx.measureText(w.text).width;
    const add = line.length ? ww + space : ww;
    if (line.length && wsum + add > maxW) {
      lines.push({ words: line, width: wsum });
      line = [{ ...w, width: ww }];
      wsum = ww;
    } else {
      line.push({ ...w, width: ww });
      wsum += add;
    }
  }
  if (line.length) lines.push({ words: line, width: wsum });
  return lines;
}

/** Lay out every card of a scene once: size, lines, and its on-screen window. */
export function buildKaraoke(ctx, scene) {
  const K = KARAOKE;
  ctx.save();
  const cards = scene.captions.map((card) => {
    const words = card.words.map((w) => ({ text: clean(w.text), start: w.start, end: w.end }));
    let pick = null;
    for (let k = 0; k < 12; k++) {
      const s = Math.round(K.size * K.step ** k);
      ctx.font = `${s}px ${F.semi}`;
      const space = ctx.measureText(' ').width * K.space;
      const lines = wrap(ctx, words, space, K.maxWidth);
      pick = { size: s, space, lines };
      if (lines.length <= K.maxLines) break;
    }
    return { ...pick, from: card.words[0].start - K.lead, to: card.to };
  });
  // a card closes as the next one opens; the last keeps the timeline's close
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    if (next) c.to = next.from;
    if (i === 0) c.from = Math.min(c.from, scene.captions[0].from ?? c.from);
  });
  ctx.restore();
  return cards;
}

function drawCardK(ctx, card, t, alpha) {
  const K = KARAOKE;
  const { size, space, lines } = card;
  const lh = size * K.lineHeight;
  ctx.save();
  ctx.font = `${size}px ${F.semi}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  lines.forEach((line, li) => {
    const y = K.baseline - (lines.length - 1 - li) * lh;
    let x = W / 2 - line.width / 2;
    for (const w of line.words) {
      const active = t >= w.start && t < w.end + K.hold;
      let a;
      if (t < w.start - K.preRoll) a = K.dim;
      else if (t < w.start) a = K.dim + (K.pre - K.dim) * ((t - (w.start - K.preRoll)) / K.preRoll);
      else a = active ? 1 : K.past;
      const up = EASE.inOutQuad(clamp((t - (w.start - K.riseAt)) / K.riseDur));
      const dy = (1 - up) * K.rise * size;
      ctx.globalAlpha = alpha * a;
      if (active) {
        ctx.shadowColor = 'rgba(255,188,66,0.6)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = '#FFBC42';
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.65)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 7;
        ctx.fillStyle = C.bone;
      }
      ctx.fillText(w.text, x, y + dy);
      x += w.width + space;
    }
  });
  ctx.restore();
}

/** Draw whichever card is live at scene-local time t. */
export function drawKaraoke(ctx, cards, t, { alpha = 1 } = {}) {
  const K = KARAOKE;
  if (!cards || alpha <= 0.004) return;
  for (const c of cards) {
    if (t < c.from || t > c.to) continue;
    const a = clamp((t - c.from) / K.fadeIn) * clamp((c.to - t) / K.fadeOut) * alpha;
    if (a > 0.003) drawCardK(ctx, c, t, a);
  }
}
