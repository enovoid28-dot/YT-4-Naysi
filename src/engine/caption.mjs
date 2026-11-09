import { F } from './fonts.mjs';
import { C, W, hexA, measure } from './draw.mjs';
import { clamp, spring, lerp } from './anim.mjs';

const SIZE_STEPS = [0.94, 0.88, 0.82, 0.76];

/** Wrap caption words into <=3 lines, shrinking type until it fits. */
export function buildCaption(ctx, group, { maxWidth, size = 78, font = F.semi, maxLines = 3 }) {
  for (const scale of [1, ...SIZE_STEPS]) {
    const s = Math.round(size * scale);
    ctx.save();
    ctx.font = `${s}px ${font}`;
    const space = ctx.measureText(' ').width * 1.45;
    const lines = [];
    let line = [];
    let wsum = 0;
    let overflow = false;
    for (const word of group.words) {
      const ww = ctx.measureText(word.text).width;
      const add = line.length ? ww + space : ww;
      if (line.length && wsum + add > maxWidth) {
        lines.push({ words: line, width: wsum });
        if (lines.length >= maxLines) {
          overflow = true;
          break;
        }
        line = [{ ...word, width: ww }];
        wsum = ww;
      } else {
        line.push({ ...word, width: ww });
        wsum += add;
      }
    }
    ctx.restore();
    if (overflow) continue;
    if (line.length) lines.push({ words: line, width: wsum });
    const widow = lines.length > 1 && lines[lines.length - 1].words.length === 1;
    if (widow && s > size * 0.72 && scale < SIZE_STEPS[1]) continue;
    return { size: s, font, lines, space };
  }
  ctx.save();
  ctx.font = `${Math.round(size * 0.72)}px ${font}`;
  const space = ctx.measureText(' ').width * 1.45;
  const all = group.words.map((w) => ({ ...w, width: ctx.measureText(w.text).width }));
  ctx.restore();
  return { size: Math.round(size * 0.72), font, space, lines: [{ words: all, width: 0 }] };
}

/**
 * Kinetic caption: past words solid, the spoken word in accent with a pop,
 * upcoming words dimmed. Times are scene-relative seconds.
 */
export function drawCaption(ctx, layout, t, o = {}) {
  const {
    bottom = 2150,
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
  const blockH = lines.length * lh;
  const top = bottom - blockH + lh * 0.3;
  const baseAlpha = ctx.globalAlpha * alphaMul;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  lines.forEach((line, li) => {
    const y = top + li * lh + size * 0.76;
    let cx = align === 'center' ? x - line.width / 2 : x;
    for (const w of line.words) {
      const isActive = t >= w.start && t < w.end + 0.13;
      let a;
      if (t < w.start - 0.26) a = 0.34;
      else if (t < w.start) a = lerp(0.34, 0.66, clamp((t - (w.start - 0.26)) / 0.26));
      else if (isActive) a = 1;
      else a = 0.94;
      const inT = clamp((t - w.start + 0.08) / 0.28);
      const rise = (1 - spring(inT * 1.3, 15, 0.62)) * 14;
      const scale = isActive ? 1 + 0.05 * Math.sin(clamp((t - w.start) / 0.26) * Math.PI) : 1;

      ctx.save();
      ctx.globalAlpha = baseAlpha * a;
      ctx.font = `${size}px ${font}`;
      ctx.translate(cx + w.width / 2, y + rise);
      ctx.scale(scale, scale);
      ctx.shadowColor = isActive ? hexA(accent, 0.6) : 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = isActive ? 16 : shadow;
      ctx.shadowOffsetY = isActive ? 0 : 7;
      ctx.fillStyle = isActive ? accent : color;
      ctx.fillText(w.text, -w.width / 2, 0);
      ctx.restore();
      cx += w.width + space;
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
