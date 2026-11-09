import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  ledNumber, groundShadow, seg7,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  duskSky, cityLayers, rain, wetRoad, glyphPump, glyphPlane, glyphBasket,
  darkCard, paperCard, badge, stamp, giantWord, bokeh,
} from '../art/parts.mjs';
import { clamp, lerp, EASE, spring, track, rng, noise1 } from '../engine/anim.mjs';

const num = (v, dec = 2) => v.toFixed(dec).replace('.', ',');
const CARD_W = 1060;
const CARD_H = 340;

function stationSilhouette(ctx, t) {
  const baseY = 1430;
  const cx = 720;
  ctx.save();
  fillRR(ctx, cx - 640, baseY - 268, 1280, 58, 8, '#08070E');
  fillRR(ctx, cx - 618, baseY - 276, 1236, 9, 4, 'rgba(255,178,108,0.28)');
  [cx - 486, cx + 486].forEach((px) => {
    fillRR(ctx, px - 15, baseY - 226, 30, 226, 4, '#07060C');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = hexA('#FFC27A', 0.1);
    ctx.fillRect(px - 5, baseY - 222, 7, 222);
    ctx.restore();
  });
  const g = radGrad(ctx, cx, baseY - 170, 0, 660, [
    [0, 'rgba(255,196,140,0.16)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(cx - 680, baseY - 330, 1360, 360);
  [cx - 262, cx, cx + 262].forEach((px, i) => {
    fillRR(ctx, px - 40, baseY - 120, 80, 120, 6, '#06050A');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = hexA('#FF9A4D', 0.14 + 0.05 * Math.sin(t * 1.3 + i));
    ctx.fillRect(px - 24, baseY - 100, 48, 28);
    ctx.restore();
  });
  ctx.restore();
}

/* ------------------------------- cards ------------------------------- */

function shell(ctx, t, o, paper, fn) {
  const { x, y, w, h, rot, scale, alpha } = o;
  if (paper) paperCard(ctx, x, y, w, h, 32, { rot, scale, alpha, ...(o.tints || {}) });
  else darkCard(ctx, x, y, w, h, 32, { rot, scale, alpha });
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  ctx.globalAlpha *= alpha;
  fn(ctx, w, h);
  ctx.restore();
}

function ledCard(ctx, t, o) {
  const { value, old } = o;
  shell(ctx, t, o, false, (c, w, h) => {
    const flick = 0.9 + 0.1 * noise1(t * 30, 3);
    c.save();
    c.fillStyle = hexA(C.amber, 0.9);
    c.beginPath();
    c.arc(56, 66, 7, 0, Math.PI * 2);
    c.fill();
    c.restore();
    tracking(c, 'REGULAR · BENSIN', 74, 76, { size: 28, font: F.num6, track: 6, color: hexA(C.bone, 0.6) });

    const digits = value.toFixed(2);
    txt(c, '$', 54, 268, { size: 108, font: F.num6, color: hexA(C.amber, 0.55) });
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = 0.1 * flick;
    ledNumber(c, digits, 128, 140, 148, C.amber, { glowBlur: 0 });
    c.restore();
    ledNumber(c, digits, 128, 140, 148, C.amber, { glowBlur: 34, on: flick });

    txt(c, `SEBELUMNYA   $${old.toFixed(2)}`, 58, 316, {
      size: 27, font: F.num6, color: hexA(C.bone, 0.36), track: 3,
    });

    c.save();
    c.globalAlpha = 0.05;
    for (let yy = 130; yy < 330; yy += 5) c.fillRect(44, yy, w - 88, 1.5);
    c.restore();

    badge(c, '+19,6%', w - 56, 74, { align: 'right', bg: C.red, size: 34, padX: 20, padY: 11, glowBlur: 24 });
  });
}

function ticketCard(ctx, t, o) {
  const { value, old, p } = o;
  const ink = '#16130F';
  shell(ctx, t, o, true, (c, w, h) => {
    c.save();
    c.globalAlpha = 0.06;
    glyphPlane(c, w - 350, 128, 300, ink);
    c.restore();

    tracking(c, 'TIKET PESAWAT', 56, 72, { size: 27, font: F.num6, track: 6, color: hexA(ink, 0.5) });
    txt(c, 'JFK', 56, 176, { size: 66, font: F.head, color: ink });
    txt(c, 'LAX', 250, 176, { size: 66, font: F.head, color: ink });
    c.save();
    c.strokeStyle = hexA(ink, 0.28);
    c.lineWidth = 3;
    c.setLineDash([9, 9]);
    c.beginPath();
    c.moveTo(190, 158);
    c.lineTo(236, 158);
    c.stroke();
    c.setLineDash([]);
    c.fillStyle = C.ember;
    c.beginPath();
    c.arc(213, 158, 7, 0, Math.PI * 2);
    c.fill();
    c.restore();

    txt(c, `$${old}`, 56, 246, { size: 40, font: F.num6, color: hexA(ink, 0.42) });
    c.save();
    c.strokeStyle = hexA(C.red, 0.9);
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(56, 231);
    c.lineTo(56 + 190 * EASE.outCubic(clamp(p / 0.35)), 231);
    c.stroke();
    c.restore();
    txt(c, `$${value}`, 56, 330, { size: 92, font: F.num, color: ink });

    // barcode
    const r = rng(9);
    c.save();
    c.globalAlpha = 0.7;
    let bx = w - 300;
    while (bx < w - 56) {
      const bw = 2 + Math.floor(r() * 4);
      c.fillStyle = ink;
      if (r() > 0.32) c.fillRect(bx, 240, bw, 62);
      bx += bw + 4;
    }
    c.restore();
    tracking(c, 'SEAT 23A', w - 56, 226, { size: 22, font: F.num6, track: 4, color: hexA(ink, 0.45), align: 'right' });
    badge(c, '+22%', w - 56, 74, { align: 'right', bg: C.red, size: 34, padX: 20, padY: 11, glowBlur: 20 });
  });
}

function basketCard(ctx, t, o) {
  const { value, old, p } = o;
  const ink = '#16130F';
  shell(ctx, t, o, true, (c, w, h) => {
    c.save();
    c.globalAlpha = 0.07;
    glyphBasket(c, w - 330, 120, 260, ink, C.ember);
    c.restore();

    tracking(c, 'BELANJA BULANAN', 56, 72, { size: 27, font: F.num6, track: 6, color: hexA(ink, 0.5) });
    txt(c, `$${old}`, 56, 190, { size: 42, font: F.num6, color: hexA(ink, 0.42) });
    c.save();
    c.strokeStyle = hexA(C.red, 0.9);
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(56, 174);
    c.lineTo(56 + 210 * EASE.outCubic(clamp(p / 0.35)), 174);
    c.stroke();
    c.restore();

    txt(c, `$${value}`, 56, 330, { size: 104, font: F.num, color: ink });

    c.save();
    c.strokeStyle = hexA(ink, 0.18);
    c.lineWidth = 2;
    c.setLineDash([10, 10]);
    c.beginPath();
    c.moveTo(w - 300, 262);
    c.lineTo(w - 56, 262);
    c.stroke();
    c.restore();
    tracking(c, '12 ITEM', w - 56, 320, { size: 24, font: F.num6, track: 4, color: hexA(ink, 0.45), align: 'right' });
    badge(c, '+3,7%', w - 56, 74, { align: 'right', bg: C.red, size: 34, padX: 20, padY: 11, glowBlur: 20 });
  });
}


/* ------------------------------ cold open ------------------------------ */
const CUT = 0.95;

function macroLed(ctx, t) {
  const p = clamp(t / CUT);
  // dark glass base
  const bg = linGrad(ctx, 0, 0, W * 0.4, H, [
    [0, '#08070C'],
    [0.5, '#0B0A10'],
    [1, '#05050A'],
  ]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // defocused city lights behind the glass
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const r = rng(41);
  for (let i = 0; i < 16; i++) {
    const x = r() * W;
    const y = 200 + r() * 2200;
    const rad = 90 + r() * 240;
    const col = ['#FF9A3C', '#FF5A2A', '#FFC978', '#4A7FBF'][Math.floor(r() * 4)];
    const g = radGrad(ctx, x, y, 0, rad, [
      [0, hexA(col, 0.1 + r() * 0.1)],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // glass panel edges + red LED strip
  const inset = 54;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 3;
  rr(ctx, inset, inset * 2, W - inset * 2, H - inset * 4, 34);
  ctx.stroke();
  ctx.restore();

  // scanlines
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000';
  for (let y = 0; y < H; y += 5) ctx.fillRect(0, y, W, 2);
  ctx.restore();

  // micro label
  tracking(ctx, 'REGULAR · BENSIN', W / 2, 640, {
    size: 34, font: F.num6, track: 12, align: 'center', color: hexA(C.amber, 0.75),
  });
  ctx.save();
  ctx.fillStyle = hexA(C.amber, 0.85);
  ctx.beginPath();
  ctx.arc(W / 2 - measure(ctx, 'REGULAR · BENSIN', 34, F.num6, 12) / 2 - 64, 629, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // digits climbing to 4.09
  const val = lerp(3.42, 4.09, EASE.outQuint(clamp((t - 0.05) / 0.8)));
  const digits = val.toFixed(2);
  const flick = 0.92 + 0.08 * noise1(t * 34, 7);
  ctx.save();
  ctx.translate(W / 2, 1150);
  ctx.scale(1.02 + 0.05 * p, 1.02 + 0.05 * p);
  ctx.translate(-W / 2, -1150);
  const dh = 330;
  const dw = measure(ctx, digits, dh, F.num, 0) * 0.62;
  const totalW = digits.split('').reduce((a, c) => a + (c === '.' ? dh * 0.34 : dh * 0.71), 0);
  const x0 = W / 2 - totalW / 2;
  txt(ctx, '$', x0 - 86, 1300, { size: 132, font: F.num6, color: hexA(C.amber, 0.55) });
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.12 * flick;
  ledNumber(ctx, digits, x0, 990, dh, C.amber, { glowBlur: 0 });
  ctx.restore();
  ledNumber(ctx, digits, x0, 990, dh, C.amber, { glowBlur: 46, on: flick });
  ctx.restore();

  // under-label
  tracking(ctx, 'HARGA PER GALON', W / 2, 1520, {
    size: 28, font: F.num6, track: 10, align: 'center', color: hexA(C.bone, 0.35),
  });

  // condensation droplets
  const rd = rng(88);
  ctx.save();
  for (let i = 0; i < 60; i++) {
    const x = rd() * W;
    const y = 1200 + rd() * 1200;
    const rad = 2 + rd() * 9;
    ctx.fillStyle = `rgba(210,230,255,${0.04 + rd() * 0.07})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${0.08 + rd() * 0.1})`;
    ctx.beginPath();
    ctx.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // rain in front of the panel
  rain(ctx, t * 1.6, { count: 90, alpha: 0.35, speed: 2400, y1: H, thick: 1.6, seed: 3 });

  // light sweep
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const sx = -400 + p * 2200;
  const g = linGrad(ctx, sx - 260, 0, sx + 260, H, [
    [0, 'rgba(255,210,150,0)'],
    [0.5, 'rgba(255,210,150,0.07)'],
    [1, 'rgba(255,210,150,0)'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // cut flash
  const f = clamp((t - (CUT - 0.09)) / 0.09);
  if (f > 0) {
    ctx.save();
    ctx.globalAlpha = f * 0.5;
    ctx.fillStyle = '#FFF4E2';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

export default {
  draw(ctx, t, scene) {
    if (t < CUT) {
      macroLed(ctx, t);
      return;
    }
    const beats = scene.captions.map((c) => c.words[0].start);
    const b = [beats[0] ?? 1, beats[1] ?? 3, beats[2] ?? 5, beats[3] ?? 7];

    const push = 1.02 + 0.03 * EASE.outCubic(clamp(t / scene.dur)) + 0.025 * EASE.outCubic(clamp((t - b[3]) / 1.4));
    const hit = Math.max(0, 1 - Math.abs(t - (b[3] + 0.5)) / 0.3);
    const shake = hit * 16;
    const sx = shake * Math.sin(t * 91);
    const sy = shake * Math.cos(t * 73);

    ctx.save();
    ctx.translate(W / 2 + sx, 980 + sy);
    ctx.scale(push, push);
    ctx.translate(-W / 2, -980);

    duskSky(ctx, t, { bottom: 1810, horizon: 1250 });
    cityLayers(ctx, t, {
      baseY: 1330, seed: 21, count: 14, hMin: 130, hMax: 430, color: '#0B0912',
      windowColor: '#FFD6A0', windowAlpha: 0.5, parallax: -t * 4,
    });
    // haze between parallax layers for depth
    const haze = linGrad(ctx, 0, 1080, 0, 1520, [
      [0, 'rgba(255,150,90,0)'],
      [0.55, 'rgba(255,140,80,0.10)'],
      [1, 'rgba(255,120,60,0.02)'],
    ]);
    ctx.fillStyle = haze;
    ctx.fillRect(0, 1080, W, 440);
    stationSilhouette(ctx, t);
    cityLayers(ctx, t, {
      baseY: 1490, seed: 44, count: 10, hMin: 80, hMax: 230, color: '#050409',
      windowColor: '#FFCB92', windowAlpha: 0.3, parallax: -t * 13,
    });
    wetRoad(ctx, t, { y: 1490, height: 320 });

    // warm bloom behind the deck
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const bg = radGrad(ctx, W / 2, 900, 100, 760, [
      [0, 'rgba(255,150,80,0.12)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 300, W, 1300);
    ctx.restore();

    bokeh(ctx, t, { count: 18, alpha: 0.18, y0: 700, y1: 1780 });
    rain(ctx, t, { count: 240, alpha: 0.3, speed: 2100, y1: 1800, thick: 1.8 });

    // eyebrow
    const ep = EASE.outCubic(clamp(t / 0.8));
    ctx.save();
    ctx.globalAlpha *= ep;
    tracking(ctx, 'SEPTEMBER 2024', W / 2, 292, {
      size: 27, font: F.num6, track: 9, align: 'center', color: hexA(C.amber, 0.85),
    });
    ctx.fillStyle = hexA(C.amber, 0.5);
    ctx.fillRect(W / 2 - 210, 282, 60, 2);
    ctx.fillRect(W / 2 + 150, 282, 60, 2);
    ctx.restore();

    const gp = spring(clamp((t - b[3]) / 0.9) * 1.1, 10, 0.6);
    if (gp > 0.01) {
      ctx.save();
      ctx.globalAlpha *= gp;
      giantWord(ctx, 'MAHAL', W / 2, 1180, 260, { alpha: 0.1, stroke: 2.5, color: C.amber, track: -10 });
      ctx.restore();
    }

    const defs = [
      {
        y: 470, rot0: -2.6, at: b[0] - 0.34, type: 'led',
        value: lerp(4.09, 4.89, EASE.outCubic(clamp((t - b[0] - 0.05) / 1.25))),
        old: 4.09,
      },
      {
        y: 860, rot0: 1.7, at: b[1] - 0.34, type: 'ticket',
        value: Math.round(lerp(320, 390, EASE.outCubic(clamp((t - b[1]) / 1.0)))),
        old: 320,
      },
      {
        y: 1250, rot0: -1.5, at: b[2] - 0.34, type: 'basket',
        value: lerp(100, 103.7, EASE.outCubic(clamp((t - b[2]) / 1.1))),
        old: '100,00',
      },
    ];

    const straight = EASE.inOutQuint(clamp((t - b[3] - 0.05) / 0.7));

    defs.forEach((d, i) => {
      const p = spring(clamp((t - d.at) / 0.85) * 1.15, 11, 0.62);
      if (p <= 0.001) return;
      const rot = ((lerp(d.rot0 + 7 * (1 - p), 0, straight * 0.85)) * Math.PI) / 180;
      const x = lerp(W + 220, (W - CARD_W) / 2, p);
      const scale = lerp(0.86, 1, p) * (1 - straight * 0.035 * (2 - i));
      const alpha = clamp(p * 2.2);
      const y = d.y + (1 - p) * 44 - straight * i * 4;
      const common = { x, y, w: CARD_W, h: CARD_H, rot, scale, alpha };
      if (d.type === 'led') ledCard(ctx, t, { ...common, value: d.value, old: d.old });
      else if (d.type === 'ticket')
        ticketCard(ctx, t, { ...common, value: String(d.value), old: d.old, p: clamp((t - b[1] - 0.1) / 0.5) });
      else basketCard(ctx, t, { ...common, value: num(d.value, 2), old: d.old, p: clamp((t - b[2] - 0.1) / 0.5) });
    });

    const sp = clamp((t - b[3] - 0.42) / 0.3);
    if (sp > 0) {
      stamp(ctx, 'SEMUA NAIK', 1010, 1372, {
        size: 56, color: C.red, rot: -0.16, scale: lerp(1.7, 1, EASE.outBack(sp, 2.6)),
        alpha: clamp(sp * 3), border: true, padX: 26, padY: 14, track: 3,
      });
    }

    ctx.restore();
  },
};
