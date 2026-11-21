// Episode 36 scenes — ten rooms made of light.
//
//  o1  hook: the phone in your hand is a pinhole camera; the viewfinder opens
//      onto the dark room that started it
//  o2  Basra 965: a city on the date rail, then the road to Cairo
//  o3  the Nile: a blueprint of a river too large to be ruled, and the dam
//      that was never built
//  o4  ten years: an iron door, a keyhole of daylight, ten tallies
//  o5  al-bait al-muzlim: the dark room with the inverted city on the wall
//  o6  three candles: three beams through one hole, each flame landing alone
//  o7  the eclipse: the sun's disc arrives on the wall as a crescent
//  o8  the eye: light entering, not leaving — the error of a thousand years
//  o9  the method: test, measure, repeat — five centuries before the name
//  o10 the book: seven volumes on cream paper, and the closing plate

import { W, H, M, txt, measure, fillRR, strokeRR, linGrad, radGrad, hexA, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { hit, reportBg } from '../engine/look.mjs';
import {
  OP, P, eo, io, sm, rgba, bg, beam, dust, kicker, heading, chip, bigNum, rule,
  corners, room, city, candle, eyeCut, page, spine, phone, stamp, riverPlan,
} from './optik.mjs';

/* ------------------------------- shared bits ------------------------------ */

const G = { x: M, w: W - M * 2 };

function topKicker(ctx, s, t, at = 0.25, color = OP.ray) {
  kicker(ctx, s, G.x, 292, { p: P(t, at, 0.7), color });
}

function mono(ctx, s, x, y, o = {}) {
  txt(ctx, s, x, y, { size: 24, font: F.mono6, color: rgba(OP.ice, 0.55), track: 3, ...o });
}

/** a hairline box with a label tab, used as a viewfinder over the diagrams */
function tab(ctx, s, x, y, p = 1, { color = rgba(OP.ice, 0.5), size = 21, up = true } = {}) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(p * 2);
  const w = measure(ctx, s, size, F.mono6, 4) + 26;
  const h = size + 16;
  fillRR(ctx, x, y - h / 2, w, h, 4, 'rgba(6,9,14,0.7)');
  strokeRR(ctx, x, y - h / 2, w, h, 4, color, 1.2);
  txt(ctx, s, x + 13, y + 1, { size, font: F.mono6, color: rgba(OP.ice, 0.8), track: 4, base: 'middle' });
  if (up) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y - h / 2);
    ctx.lineTo(x + w / 2, y - h / 2 - 18);
    ctx.stroke();
  }
  ctx.restore();
}

/** the end-of-scene closing plate: brand rule + name */
function closing(ctx, t, at, { light = false } = {}) {
  const p = P(t, at, 0.8);
  if (p <= 0) return;
  const ink = light ? OP.paperInk : OP.bone;
  ctx.save();
  ctx.globalAlpha *= p;
  rule(ctx, G.x, G.x + G.w, 1560, p, { color: light ? 'rgba(33,27,20,0.4)' : rgba(OP.ray, 0.5), a: 1 });
  txt(ctx, 'IBN AL-HAYTHAM · 965 — 1040', G.x, 1614, { size: 26, font: F.mono6, color: rgba(ink, 0.6), track: 5, alpha: p });
  txt(ctx, 'KAIRO', G.x + G.w, 1614, { size: 26, font: F.mono6, color: rgba(ink, 0.6), track: 5, align: 'right', alpha: p });
  ctx.restore();
}

/* ---------------------------------- o1 ----------------------------------- */

export const o1 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 1, warm: [W * 0.52, 820], r: 1250 });
    reportBg('garden', 0.6);
    topKicker(ctx, 'SETIAP FOTO · SEBUAH KAMAR GELAP', t, 0.2);
    heading(ctx, [['KAMERA', false], ['DARI', true], ['TAHANAN', false]], G.x, 470, {
      t, at: 0.34, size: 158, lead: 0.94, accent: OP.ray, stagger: 0.12,
    });
    mono(ctx, 'BUKTI PERTAMA · 1011 M', G.x, 1000, { p: P(t, 1.15, 0.6) });

    // the phone frame, holding the room
    const pf = { x: G.x + 40, y: 1080, w: G.w - 80, h: 470 };
    const open = P(t, 0.55, 1.1);
    phone(ctx, pf.x, pf.y, pf.w, pf.h, t, {
      p: open, zoom: '1×',
      content: (c, x, y, w, h) => {
        c.save();
        c.translate(0, 0);
        // inside the phone: a small dark room with one beam
        const g = c.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, '#0A0D13');
        g.addColorStop(1, '#030406');
        c.fillStyle = g;
        c.fillRect(x, y, w, h);
        const sx = x + w * 0.2;
        const sy = y + h * 0.3;
        // the shuttered window at the left edge of the frame
        c.fillStyle = '#1A222E';
        c.fillRect(x + w * 0.11, y + h * 0.06, 34, h * 0.58);
        const wg = c.createLinearGradient(x + w * 0.11, 0, x + w * 0.11 + 34, 0);
        wg.addColorStop(0, 'rgba(255,233,190,0.9)');
        wg.addColorStop(1, 'rgba(255,192,97,0.25)');
        c.fillStyle = wg;
        c.fillRect(x + w * 0.11 + 4, y + h * 0.06 + 6, 26, h * 0.58 - 12);
        c.fillStyle = '#141B25';
        c.fillRect(x + w * 0.11, y + h * 0.12, 34, 5);
        c.fillRect(x + w * 0.11, y + h * 0.24, 34, 5);
        c.fillRect(x + w * 0.11, y + h * 0.36, 34, 5);
        c.fillRect(x + w * 0.11, y + h * 0.48, 34, 5);
        c.fillStyle = '#000';
        c.beginPath();
        c.arc(sx, sy, 6, 0, TAU);
        c.fill();
        beam(c, sx, sy, x + w * 0.8, y + h * 0.62, 7, 170, { a: 0.95, t, core: 1 });
        dust(c, t, { x0: sx, y0: sy, x1: x + w * 0.8, y1: y + h * 0.62, w0: 10, w1: 110, n: 55, a: 0.4 });
        // inverted skyline on the far wall
        city(c, x + w * 0.54, y + h * 0.34, w * 0.36, h * 0.3, { a: 0.9, flip: true, warm: 1.4, seed: 4 });
        // wall edge
        c.strokeStyle = 'rgba(191,214,230,0.16)';
        c.lineWidth = 1;
        c.strokeRect(x + w * 0.12, y + h * 0.06, w * 0.78, h * 0.62);
        c.restore();
      },
    });
    txt(ctx, 'kamera lubang jarum · ponsel 2026', G.x + 40, 1690, { size: 24, font: F.italic, color: rgba(OP.ice, 0.5), alpha: P(t, 1.6, 0.6) });
    hit(t, 0.9, 0.7, 0.35);
  },
};

/* ---------------------------------- o2 ----------------------------------- */

export const o2 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 0.75, warm: [W * 0.2, 700], r: 1000 });
    topKicker(ctx, 'BASRA · IRAK SELATAN', t, 0.2);
    heading(ctx, [['BASRA,', false], ['965', true]], G.x, 470, { t, at: 0.3, size: 160, accent: OP.ray });
    mono(ctx, 'ABU ALI AL-HASAN IBN AL-HASAN', G.x, 860, { p: P(t, 0.9, 0.6) });

    // skyline on a thin horizon
    const p = P(t, 0.5, 1.2);
    city(ctx, G.x, 940, G.w, 520, { a: p, warm: 1.25, sky: true, seed: 9 });
    rule(ctx, G.x, G.x + G.w, 1560, p, { color: rgba(OP.ray, 0.5) });

    // date rail: 965 -> 1011 -> 1040
    const railY = 1660;
    rule(ctx, G.x + 20, G.x + G.w - 20, railY, P(t, 1.2, 1.3), { color: rgba(OP.ice, 0.35), a: 0.9, tick: 0 });
    const nodes = [['965', 'LAHIR'], ['1011', 'KAMAR GELAP'], ['1040', 'WAFAT']];
    nodes.forEach(([yr, lab], i) => {
      const q = P(t, 1.5 + i * 0.5, 0.7);
      if (q <= 0) return;
      const x = lerp(G.x + 30, G.x + G.w - 30, i / 2);
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.fillStyle = i === 1 ? OP.ray : rgba(OP.ice, 0.8);
      ctx.beginPath();
      ctx.arc(x, railY, i === 1 ? 9 : 6, 0, TAU);
      ctx.fill();
      txt(ctx, yr, x, railY - 40, { size: i === 1 ? 44 : 32, font: F.num6, color: i === 1 ? OP.ray : OP.bone, align: 'center', track: 1 });
      txt(ctx, lab, x, railY + 40, { size: 20, font: F.mono6, color: rgba(OP.ice, 0.55), align: 'center', track: 3 });
      ctx.restore();
    });

    txt(ctx, 'sebuah kota dagang di tepi sungai, seribu tahun sebelum kamera.', G.x, 1798, {
      size: 36, font: F.italic, color: rgba(OP.bone, 0.72), alpha: P(t, 3.0, 0.9),
    });
    // Cairo: the road east
    const cp = P(t, 2.4, 1.4);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= cp;
      ctx.strokeStyle = rgba(OP.ray, 0.55);
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.lineDashOffset = -t * 44;
      ctx.beginPath();
      ctx.moveTo(G.x + 60, 1260);
      ctx.bezierCurveTo(W * 0.42, 1000, W * 0.6, 1150, G.x + G.w - 70, 1080);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = OP.ray;
      ctx.beginPath();
      ctx.arc(G.x + G.w - 70, 1080, 6, 0, TAU);
      ctx.fill();
      txt(ctx, 'KAIRO', G.x + G.w - 70, 1048, { size: 24, font: F.mono6, color: rgba(OP.ray, 0.9), align: 'right', track: 4 });
      ctx.restore();
    }
    hit(t, 0.6, 0.5, 0.3);
  },
};

/* ---------------------------------- o3 ----------------------------------- */

export const o3 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 0.6, warm: [W * 0.78, 520], r: 900, grid: 0.7 });
    topKicker(ctx, 'TUGAS DARI KHALIFAH · 1011', t, 0.2);
    heading(ctx, [['ATUR', false], ['SUNGAI NIL', true]], G.x, 470, { t, at: 0.3, size: 146, accent: OP.river });

    // blueprint sheet
    const bx = G.x - 10;
    const by = 820;
    const bw = G.w + 20;
    const bh = 700;
    ctx.save();
    fillRR(ctx, bx, by, bw, bh, 6, 'rgba(10,24,38,0.85)');
    strokeRR(ctx, bx, by, bw, bh, 6, 'rgba(58,128,196,0.35)', 1.5);
    ctx.restore();
    const pts = riverPlan(ctx, t, { x: bx + 60, y: by + 60, w: bw - 120, h: bh - 150, p: P(t, 0.6, 1.4) });
    // distance bracket
    const dp = P(t, 1.6, 1.1);
    if (dp > 0) {
      ctx.save();
      ctx.globalAlpha *= dp;
      ctx.strokeStyle = rgba(OP.ice, 0.5);
      ctx.lineWidth = 1.6;
      const yy = by + bh - 62;
      ctx.beginPath();
      ctx.moveTo(bx + 60, yy); ctx.lineTo(bx + 60, yy - 16);
      ctx.moveTo(bx + bw - 60, yy); ctx.lineTo(bx + bw - 60, yy - 16);
      ctx.moveTo(bx + 60, yy); ctx.lineTo(lerp(bx + 60, bx + bw - 60, dp), yy);
      ctx.stroke();
      ctx.restore();
    }
    txt(ctx, '6.650 KM', bx + bw / 2, by + bh - 24, { size: 42, font: F.num6, color: OP.ice, align: 'center', alpha: P(t, 2.1, 0.6) });
    tab(ctx, 'PETA ALIRAN · SKALA 1:2.000.000', bx + 24, by - 6, P(t, 0.7, 0.7));

    // the plan that fails: three dam marks, all crossed
    const fp = P(t, 2.7, 1.2);
    if (fp > 0) {
      stamp(ctx, 'MUSTAHIL', G.x + G.w * 0.62, 1110, { p: fp, rot: -0.17, color: OP.red, size: 58 });
      hit(t, 2.9, 0.9, 0.3);
    }
    mono(ctx, 'AL-HAKIM · KHALIFAH FATIMIYAH', G.x, 1612, { p: P(t, 1.9, 0.6) });
    mono(ctx, 'KAIRO', G.x + G.w, 1612, { p: P(t, 1.9, 0.6), align: 'right' });
  },
};

/* ---------------------------------- o4 ----------------------------------- */

export const o4 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 0.5, warm: [W * 0.5, 900], r: 800, grid: 0.5 });
    reportBg('slate', 0.4);
    topKicker(ctx, 'BUKAN DIPENJARA · DITAHAN DI RUMAH', t, 0.2);
    heading(ctx, [['SEPULUH', false], ['TAHUN', true]], G.x, 470, { t, at: 0.3, size: 152, accent: OP.ray });

    // the iron door
    const dx = G.x;
    const dy = 856;
    const dw = 566;
    const dh = 748;
    const dp = P(t, 0.5, 1.1);
    ctx.save();
    ctx.globalAlpha *= dp;
    const dg = ctx.createLinearGradient(dx, dy, dx + dw, dy + dh);
    dg.addColorStop(0, '#1A2028');
    dg.addColorStop(0.35, '#131820');
    dg.addColorStop(0.75, '#0E1218');
    dg.addColorStop(1, '#1B222B');
    ctx.fillStyle = dg;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.strokeStyle = 'rgba(140,155,170,0.28)';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, dy, dw, dh);
    // iron studs
    ctx.fillStyle = 'rgba(160,175,190,0.22)';
    for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) {
      ctx.beginPath();
      ctx.arc(dx + 40 + i * (dw - 80) / 4, dy + 40 + j * (dh - 80) / 6, 5, 0, TAU);
      ctx.fill();
    }
    // banding
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(dx, dy + dh * 0.32, dw, 14);
    ctx.fillRect(dx, dy + dh * 0.66, dw, 14);
    // keyhole: the only light
    const kx = dx + dw - 96;
    const ky = dy + dh * 0.56;
    ctx.fillStyle = '#020304';
    ctx.beginPath();
    ctx.arc(kx, ky, 15, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(kx - 9, ky + 6);
    ctx.lineTo(kx + 9, ky + 6);
    ctx.lineTo(kx + 13, ky + 52);
    ctx.lineTo(kx - 13, ky + 52);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'screen';
    const kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, 150);
    kg.addColorStop(0, rgba(OP.rayHi, 0.75));
    kg.addColorStop(0.3, rgba(OP.ray, 0.22));
    kg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = kg;
    ctx.fillRect(kx - 160, ky - 160, 320, 320);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    // a pool of daylight on the floor under the door
    const dp2 = P(t, 1.3, 1.2);
    if (dp2 > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha *= dp2;
      const pool = ctx.createRadialGradient(dx + dw * 0.7, dy + dh + 60, 10, dx + dw * 0.7, dy + dh + 60, 380);
      pool.addColorStop(0, rgba(OP.ray, 0.22));
      pool.addColorStop(0.5, rgba(OP.ember, 0.08));
      pool.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pool;
      ctx.save();
      ctx.translate(dx + dw * 0.7, dy + dh + 60);
      ctx.scale(1, 0.42);
      ctx.beginPath();
      ctx.arc(0, 0, 380, 0, TAU);
      ctx.fillStyle = pool;
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }

    // ten tallies, grouped five and five
    const tx = dx + dw + 78;
    const tw = G.x + G.w - tx;
    mono(ctx, 'TAHUN TANPA JENDELA', tx, 884, { p: P(t, 1.0, 0.6) });
    // two tally groups of five: four strokes and a strike through them
    for (let g = 0; g < 2; g++) {
      const gy = 960 + g * 178;
      for (let i = 0; i < 4; i++) {
        const q = P(t, 1.1 + (g * 4 + i) * 0.12, 0.32);
        if (q <= 0) continue;
        const gx = tx + i * (tw / 6.2);
        ctx.save();
        ctx.globalAlpha *= q;
        ctx.strokeStyle = rgba(OP.ray, 0.9);
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(gx, gy + (1 - q) * 80);
        ctx.lineTo(gx + 6, gy + 104);
        ctx.stroke();
        ctx.restore();
      }
      const q5 = P(t, 1.62 + g * 0.55, 0.4);
      if (q5 > 0) {
        ctx.save();
        ctx.globalAlpha *= q5;
        ctx.strokeStyle = rgba(OP.rayHi, 0.95);
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tx - 16, gy + 96);
        ctx.lineTo(tx + 3 * (tw / 6.2) + 22, gy + 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    txt(ctx, '10', G.x + G.w, 1420, { size: 200, font: F.num, color: rgba(OP.bone, 0.92), align: 'right', alpha: P(t, 2.6, 0.6), glowBlur: 26, glowColor: rgba(OP.ray, 0.35), track: -6 });
    mono(ctx, '1011 — 1021 · KAIRO', G.x + G.w, 1478, { align: 'right', p: P(t, 2.9, 0.6) });
    txt(ctx, 'tanpa buku, tanpa murid, tanpa jalan keluar.', G.x, 1706, { size: 40, font: F.italic, color: rgba(OP.bone, 0.8), alpha: P(t, 3.2, 0.8) });
    hit(t, 2.7, 0.8, 0.3);
  },
};

/* ---------------------------------- o5 ----------------------------------- */

export const o5 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 0.45, warm: [W * 0.62, 860], r: 1100, grid: 0.4 });
    const rp = P(t, 0.35, 1.4);
    const geo = room(ctx, t, {
      p: rp, inset: { x: 236, y: 806, w: 968, h: 842 }, skyline: true, warm: 1.1,
    });
    topKicker(ctx, 'EKSPERIMEN · KAMAR GELAP', t, 0.2);
    heading(ctx, [['RUMAH', false], ['YANG GELAP', true]], G.x, 452, { t, at: 0.3, size: 126, accent: OP.ray });
    const ap = P(t, 0.9, 0.9);
    txt(ctx, 'al-bait al-muzlim', G.x, 744, { size: 50, font: F.italic, color: rgba(OP.ray, 0.92), alpha: ap });
    txt(ctx, '→ camera obscura', G.x + 404, 742, { size: 28, font: F.mono6, color: rgba(OP.ice, 0.55), alpha: P(t, 1.3, 0.8), track: 2 });
    // labels over the diagram
    tab(ctx, 'CAHAYA MASUK', 272, 838, P(t, 1.6, 0.7));
    mono(ctx, 'GAMBAR TERBALIK', G.x + G.w, 1688, { p: P(t, 2.5, 0.6), align: 'right', color: rgba(OP.ray, 0.85) });
    // the dimension line between the hole and the wall
    const mp0 = P(t, 2.0, 1.0);
    if (mp0 > 0 && geo.hole) {
      const hx = geo.hole[0] + 12;
      const hy = geo.hole[1] - 34;
      ctx.save();
      ctx.globalAlpha *= mp0 * 0.8;
      ctx.strokeStyle = rgba(OP.ice, 0.4);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(geo.bx + geo.bw + 46, hy);
      ctx.lineTo(geo.bx + geo.bw + 46, geo.iy + geo.ih + 18);
      ctx.stroke();
      ctx.restore();
      mono(ctx, '5 M', geo.bx + geo.bw + 60, hy + 68, { p: mp0, align: 'right' });
    }
    // the wall measurement
    const mp = P(t, 2.0, 1.0);
    if (mp > 0) {
      ctx.save();
      ctx.globalAlpha *= mp;
      ctx.strokeStyle = rgba(OP.ice, 0.45);
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(1190, 830);
      ctx.lineTo(1320, 830);
      ctx.lineTo(1320, 1610);
      ctx.stroke();
      ctx.restore();
    }
    mono(ctx, '1 LUBANG · 1 BAYANGAN · TANPA LENSA', G.x, 1788, { p: P(t, 2.8, 0.6) });
    txt(ctx, 'dunia masuk terbalik, dan tetap bisa dikenali.', G.x, 1736, { size: 38, font: F.italic, color: rgba(OP.bone, 0.78), alpha: P(t, 3.2, 0.8) });
    hit(t, 1.5, 0.6, 0.3);
  },
};

/* ---------------------------------- o6 ----------------------------------- */

export const o6 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 0.5, warm: [W * 0.3, 980], r: 900, grid: 0.5 });
    topKicker(ctx, 'UJI CAHAYA · TIGA SUMBER', t, 0.2);
    heading(ctx, [['TIGA LILIN,', false], ['SATU LUBANG', true]], G.x, 470, { t, at: 0.3, size: 128, accent: OP.ray });

    // three candles on the left
    const cy = 1560;
    const cxs = [G.x + 60, G.x + 210, G.x + 360];
    cxs.forEach((x, i) => candle(ctx, x, cy, 1.05, t, { a: P(t, 0.5 + i * 0.2, 0.8), seed: i * 3.1 }));
    // pinhole plate
    const px = 760;
    const py = 1180;
    ctx.save();
    const pp = P(t, 0.9, 0.9);
    ctx.globalAlpha *= pp;
    ctx.fillStyle = '#151C26';
    ctx.fillRect(px - 16, 900, 32, 620);
    ctx.strokeStyle = 'rgba(150,166,182,0.4)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(px - 16, 900, 32, 620);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, TAU);
    ctx.fill();
    ctx.restore();
    // three beams, crossing at the hole, each landing apart
    const tgt = [[1120, 1010], [1120, 1180], [1120, 1350]];
    const bp = P(t, 1.2, 1.3);
    cxs.forEach((x, i) => {
      if (bp <= 0) return;
      const fy = cy - 128;
      beam(ctx, x, fy, px, py, 4, 4, { a: 0.55 * bp, t: t + i, core: 0.9 });
      beam(ctx, px, py, tgt[i][0], tgt[i][1], 5, 26, { a: 0.5 * bp, t: t + i, core: 0.8 });
    });
    // wall with three inverted flames
    const wp = P(t, 2.0, 1.0);
    if (wp > 0) {
      ctx.save();
      ctx.globalAlpha *= wp;
      ctx.fillStyle = 'rgba(16,22,30,0.85)';
      ctx.fillRect(1090, 930, 250, 480);
      ctx.strokeStyle = rgba(OP.ice, 0.3);
      ctx.strokeRect(1090, 930, 250, 480);
      tgt.forEach(([x, y], i) => {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const g = ctx.createRadialGradient(x, y, 0, x, y, 46);
        g.addColorStop(0, rgba(OP.rayHi, 0.9));
        g.addColorStop(0.4, rgba(OP.ray, 0.35));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 46, 0, TAU);
        ctx.fill();
        ctx.fillStyle = rgba(OP.bone, 0.9);
        ctx.beginPath();
        ctx.moveTo(x, y - 26);
        ctx.quadraticCurveTo(x + 9, y, x, y + 12);
        ctx.quadraticCurveTo(x - 9, y, x, y - 26);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }
    tab(ctx, 'LUBANG JARUM', px - 10, 830, P(t, 1.0, 0.7));
    tab(ctx, 'TIGA GAMBAR', 1215, 1450, P(t, 2.4, 0.7));
    // the verdict
    const vp = P(t, 3.0, 0.9);
    if (vp > 0) {
      txt(ctx, 'tiap berkas lurus,', G.x, 1730, { size: 46, font: F.italic, color: rgba(OP.bone, 0.9), alpha: vp });
      txt(ctx, 'tidak saling mengganggu.', G.x, 1786, { size: 46, font: F.italic, color: rgba(OP.ray, 0.95), alpha: vp });
      hit(t, 3.0, 0.8, 0.3);
    }
  },
};

/* ---------------------------------- o7 ----------------------------------- */

export const o7 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 0.55, warm: [W * 0.5, 760], r: 1000, grid: 0.45 });
    topKicker(ctx, 'GERHANA MATAHARI · TANPA BUTA', t, 0.2);
    heading(ctx, [['SABIT', false], ['DI DINDING', true]], G.x, 470, { t, at: 0.3, size: 140, accent: OP.ray });

    // sun and moon above
    const cx = W * 0.5;
    const cy = 800;
    const p = P(t, 0.5, 1.2);
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.globalCompositeOperation = 'screen';
    const sg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 190);
    sg.addColorStop(0, rgba(OP.rayHi, 0.95));
    sg.addColorStop(0.45, rgba(OP.ray, 0.55));
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, 190, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.fillStyle = '#FFE7B4';
    ctx.beginPath();
    ctx.arc(cx, cy, 66, 0, TAU);
    ctx.fill();
    // the moon slides across
    const mx = lerp(cx + 150, cx + 16, EASE.smooth(clamp((t - 1.0) / 4.4)));
    ctx.fillStyle = '#070A10';
    ctx.beginPath();
    ctx.arc(mx, cy - 14, 62, 0, TAU);
    ctx.fill();
    ctx.restore();
    mono(ctx, 'BULAN MENUTUP MATAHARI', cx, cy + 250, { align: 'center', p: P(t, 1.0, 0.7) });

    // the pinhole plate and the wall
    const px = 360;
    const py = 1300;
    ctx.save();
    ctx.globalAlpha *= p;
    ctx.fillStyle = '#161D28';
    ctx.fillRect(px - 14, 1120, 28, 420);
    ctx.strokeStyle = 'rgba(150,166,182,0.4)';
    ctx.strokeRect(px - 14, 1120, 28, 420);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
    const wall = { x: 980, y: 1150, w: 300, h: 340 };
    ctx.save();
    ctx.globalAlpha *= P(t, 1.2, 0.9);
    ctx.fillStyle = 'rgba(16,22,30,0.9)';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = rgba(OP.ice, 0.28);
    ctx.lineWidth = 1.4;
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    ctx.restore();
    // beam + crescent image
    const bp = P(t, 1.4, 1.2);
    if (bp > 0) {
      beam(ctx, px, py, wall.x + wall.w * 0.5, wall.y + wall.h * 0.5, 8, 90, { a: 0.55 * bp, t, core: 0.8 });
      dust(ctx, t, { x0: px, y0: py, x1: wall.x + wall.w * 0.5, y1: wall.y + wall.h * 0.5, w0: 8, w1: 60, n: 45, a: 0.3 });
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha *= bp;
      const ix = wall.x + wall.w * 0.5;
      const iy = wall.y + wall.h * 0.5;
      const ig = ctx.createRadialGradient(ix, iy, 4, ix, iy, 120);
      ig.addColorStop(0, rgba(OP.rayHi, 0.5));
      ig.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ig;
      ctx.beginPath();
      ctx.arc(ix, iy, 120, 0, TAU);
      ctx.fill();
      // crescent: bright disc minus a dark disc
      ctx.fillStyle = rgba(OP.rayHi, 0.92);
      ctx.beginPath();
      ctx.arc(ix, iy, 52, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(16,22,30,1)';
      ctx.beginPath();
      ctx.arc(ix - 26, iy + 8, 50, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    tab(ctx, 'LUBANG', px - 4, 1080, P(t, 0.9, 0.6));
    tab(ctx, 'SABIT MATAHARI', wall.x + 40, 1590, P(t, 2.2, 0.7));
    txt(ctx, 'bentuknya sama dengan di langit', G.x, 1730, { size: 42, font: F.italic, color: rgba(OP.bone, 0.85), alpha: P(t, 3.0, 0.8) });
  },
};

/* ---------------------------------- o8 ----------------------------------- */

export const o8 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 0.5, warm: [W * 0.5, 900], r: 1050, grid: 0.35 });
    topKicker(ctx, 'TEORI LAMA · SERIBU TAHUN', t, 0.2);
    heading(ctx, [['MATA', false], ['BUKAN LAMPU', true]], G.x, 470, { t, at: 0.3, size: 132, accent: OP.ray });

    const cx = W * 0.42;
    const cy = 1180;
    const r = 300;
    const p = P(t, 0.5, 1.3);
    eyeCut(ctx, cx, cy, r, t, { p, mode: 'in', target: [W - 180, 880], targetP: P(t, 2.2, 1.0) });
    // the old theory: rays leaving the eye, crossed out
    const op = P(t, 1.4, 1.0);
    if (op > 0) {
      ctx.save();
      ctx.globalAlpha *= op * 0.9;
      ctx.strokeStyle = rgba(OP.red, 0.7);
      ctx.lineWidth = 2.4;
      ctx.setLineDash([9, 9]);
      ctx.lineDashOffset = t * 40;
      for (let i = 0; i < 4; i++) {
        const ang = Math.PI - 0.22 + i * 0.22;
        const x1 = cx + Math.cos(ang) * r * 1.42;
        const y1 = cy + Math.sin(ang) * r * 1.42;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.86, cy);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      ctx.restore();
      // red cross over the emission arrow
      const xr = cx - r * 1.62;
      const yr = cy + 128;
      ctx.save();
      ctx.globalAlpha *= op;
      ctx.strokeStyle = rgba(OP.red, 0.95);
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(xr - 34, yr - 34); ctx.lineTo(xr + 34, yr + 34);
      ctx.moveTo(xr + 34, yr - 34); ctx.lineTo(xr - 34, yr + 34);
      ctx.stroke();
      ctx.restore();
      txt(ctx, 'KELUAR', xr, yr - 60, { size: 26, font: F.mono6, color: rgba(OP.red, 0.9), align: 'center', track: 4, alpha: op });
    }
    // the correction
    const np = P(t, 2.6, 1.0);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha *= np;
      ctx.strokeStyle = rgba(OP.ray, 0.85);
      ctx.lineWidth = 3;
      ctx.beginPath();
      const ax = W - 150;
      const ay = 760;
      ctx.moveTo(ax, ay + 90);
      ctx.lineTo(ax, ay);
      ctx.lineTo(ax - 26, ay + 34);
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + 26, ay + 34);
      ctx.stroke();
      ctx.restore();
      txt(ctx, 'MASUK', W - 150, ay - 26, { size: 26, font: F.mono6, color: rgba(OP.ray, 0.9), align: 'center', track: 4, alpha: np });
      hit(t, 2.7, 0.7, 0.3);
    }
    txVerdict(ctx, t);
  },
};

function txVerdict(ctx, t) {
  const vp = P(t, 3.6, 0.9);
  if (vp <= 0) return;
  ctx.save();
  ctx.globalAlpha *= vp;
  txt(ctx, 'bukan senter.', G.x, 1650, { size: 44, font: F.italic, color: rgba(OP.bone, 0.75) });
  txt(ctx, 'jendela.', G.x + G.w, 1650, { size: 56, font: F.italic6, color: rgba(OP.ray, 0.95), align: 'right' });
  rule(ctx, G.x, G.x + G.w, 1684, vp, { color: rgba(OP.ray, 0.5), a: 0.9 });
  ctx.restore();
}

/* ---------------------------------- o9 ----------------------------------- */

export const o9 = {
  draw(ctx, t, scene) {
    bg(ctx, t, { k: 0.45, warm: [W * 0.22, 640], r: 800, grid: 0.4 });
    topKicker(ctx, 'CARA KERJA · BUKAN KEBETULAN', t, 0.2);
    heading(ctx, [['UJI, UKUR,', false], ['ULANG', true]], G.x, 470, { t, at: 0.3, size: 138, accent: OP.ray });

    const steps = [
      ['01', 'UJI', 'satu variabel, satu percobaan'],
      ['02', 'UKUR', 'sudut, jarak, ukuran gambar'],
      ['03', 'ULANG', 'hasil yang sama, berkali-kali'],
    ];
    steps.forEach(([n, s, d], i) => {
      const p = P(t, 0.8 + i * 0.5, 0.9);
      if (p <= 0) return;
      const y = 830 + i * 230;
      ctx.save();
      ctx.globalAlpha *= p;
      const x = G.x + (1 - eo(p)) * -40;
      rule(ctx, x, x + G.w, y + 96, p, { color: 'rgba(191,214,230,0.22)', a: 1, tick: 0 });
      txt(ctx, n, x, y + 30, { size: 40, font: F.mono6, color: rgba(OP.ray, 0.85), track: 2 });
      txt(ctx, s, x + 110, y + 40, { size: 72, font: F.head, color: OP.bone, track: 1 });
      txt(ctx, d, x + 110, y + 92, { size: 30, font: F.mono6, color: rgba(OP.ice, 0.5), track: 1 });
      ctx.restore();
    });
    // the apparatus: a lens with measured rays
    const ap = P(t, 2.2, 1.2);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= ap;
      const lx = G.x + G.w * 0.5;
      const ly = 1600;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 190, 64, 0, 0, TAU);
      ctx.fillStyle = 'rgba(127,216,200,0.12)';
      ctx.fill();
      ctx.strokeStyle = rgba(OP.glass, 0.8);
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(lx, ly, 120, 40, 0, 0, TAU);
      ctx.strokeStyle = rgba(OP.glass, 0.35);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // rays bending through
      for (let i = -2; i <= 2; i++) {
        ctx.strokeStyle = rgba(OP.ray, 0.55);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(lx - 300, ly + i * 40);
        ctx.lineTo(lx - 20, ly + i * 12);
        ctx.lineTo(lx + 260, ly - i * 46);
        ctx.stroke();
      }
      ctx.restore();
    }
    // the claim
    const cp = P(t, 3.4, 0.9);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha *= cp;
      txt(ctx, '5 ABAD', G.x, 1470, { size: 58, font: F.num, color: rgba(OP.ray, 0.95), track: 0 });
      txt(ctx, 'sebelum cara itu punya nama', G.x + 218, 1470, { size: 40, font: F.italic, color: rgba(OP.bone, 0.85) });
      ctx.restore();
      hit(t, 3.5, 0.6, 0.3);
    }
    mono(ctx, 'METODE ILMIAH · 1600-AN', G.x + G.w, 1478, { align: 'right', p: P(t, 3.8, 0.6) });
    mono(ctx, 'LENSA · BERKAS · BAYANGAN', G.x, 1770, { p: P(t, 2.6, 0.6) });
  },
};

/* --------------------------------- o10 ----------------------------------- */

export const o10 = {
  draw(ctx, t, scene) {
    // a cream page on a dark desk: the only lit chapter of the film
    ctx.save();
    const desk = ctx.createLinearGradient(0, 0, 0, H);
    desk.addColorStop(0, '#0B0E12');
    desk.addColorStop(0.75, '#06080C');
    desk.addColorStop(1, '#04060A');
    ctx.fillStyle = desk;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    const p = P(t, 0.2, 1.2);
    const px = 118;
    const py = 200;
    const pw = W - 236;
    const ph = 1420;
    page(ctx, px, py + (1 - eo(p)) * 40, pw, ph, { p, shadow: 1.2 });

    ctx.save();
    ctx.globalAlpha *= clamp(p * 1.4);
    ctx.translate(px, py);

    // header
    txt(ctx, 'KITAB AL-MANAZIR', 78, 140, { size: 58, font: F.serif, color: OP.paperInk, track: 1 });
    txt(ctx, 'buku penglihatan · tujuh jilid', 78, 196, { size: 30, font: F.italic, color: 'rgba(33,27,20,0.62)' });
    ctx.strokeStyle = 'rgba(33,27,20,0.3)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(78, 226);
    ctx.lineTo(pw - 78, 226);
    ctx.stroke();

    // margin ornament: a geometric rosette in the top-right corner
    const rx = pw - 150;
    const ry = 318;
    const rp = P(t, 0.8, 1.2);
    if (rp > 0) {
      ctx.save();
      ctx.globalAlpha *= rp * 0.9;
      ctx.translate(rx, ry);
      ctx.strokeStyle = 'rgba(168,52,31,0.55)';
      ctx.lineWidth = 1.4;
      for (let ring = 0; ring < 3; ring++) {
        const R = 34 + ring * 22;
        ctx.beginPath();
        for (let i = 0; i <= 24; i++) {
          const a2 = (i / 24) * TAU;
          const rr2 = R * (1 + 0.06 * Math.sin(a2 * 8 + ring));
          const x = Math.cos(a2) * rr2;
          const y = Math.sin(a2) * rr2;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const a2 = (i / 8) * TAU;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a2) * 30, Math.sin(a2) * 30);
        ctx.lineTo(Math.cos(a2) * 118, Math.sin(a2) * 118);
        ctx.stroke();
      }
      ctx.restore();
    }

    // seven volumes
    txt(ctx, 'TUJUH JILID · SATU BUKU', 78, 386, { size: 25, font: F.mono6, color: 'rgba(33,27,20,0.5)', track: 5, alpha: P(t, 1.0, 0.7) });
    const n = 7;
    const sw = 104;
    const gap = 14;
    const total = n * sw + (n - 1) * gap;
    const sx = (pw - total) / 2;
    const sy = 414;
    const sh = 720;
    for (let i = 0; i < n; i++) {
      const q = P(t, 1.1 + i * 0.13, 0.7);
      const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i];
      spine(ctx, sx + i * (sw + gap), sy + (1 - eo(q)) * 60, sw, sh, {
        p: q, roman: q > 0 ? roman : '', lean: (i - 3) * 0.004, color: i % 2 ? '#4A3524' : '#39281B',
      });
    }

    // dates + credits
    txt(ctx, '1011 — 1021', 78, 1224, { size: 60, font: F.num6, color: 'rgba(33,27,20,0.9)', alpha: P(t, 2.4, 0.8) });
    txt(ctx, 'ditulis di Kairo, saat ia tidak boleh keluar rumah', 78, 1268, { size: 29, font: F.italic, color: 'rgba(33,27,20,0.6)', alpha: P(t, 2.7, 0.8) });
    ctx.strokeStyle = 'rgba(33,27,20,0.28)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(78, 1302);
    ctx.lineTo(pw - 78, 1302);
    ctx.stroke();
    txt(ctx, 'IBN AL-HAYTHAM', 78, 1360, { size: 38, font: F.mono6, color: 'rgba(33,27,20,0.8)', track: 5, alpha: P(t, 3.0, 0.8) });
    txt(ctx, '965 — 1040', pw - 78, 1360, { size: 38, font: F.mono6, color: 'rgba(168,52,31,0.9)', align: 'right', track: 5, alpha: P(t, 3.0, 0.8) });
    ctx.restore();
    hit(t, 0.4, 0.5, 0.4);

    // the closing plate on the desk under the page
    const cp = P(t, Math.max(3.4, scene.dur - 4.2), 1.1);
    if (cp > 0) {
      const by = 1700;
      ctx.save();
      ctx.globalAlpha *= cp;
      ctx.translate(0, (1 - eo(cp)) * 24);
      fillRR(ctx, G.x, by, G.w, 158, 10, 'rgba(14,16,20,0.94)');
      strokeRR(ctx, G.x, by, G.w, 158, 10, 'rgba(255,192,97,0.28)', 1.4);
      txt(ctx, 'IA TIDAK MENEMUKAN KAMERA.', G.x + 34, by + 56, { size: 40, font: F.serif7, color: 'rgba(242,232,210,0.95)', track: 1 });
      txt(ctx, 'IA MENEMUKAN CARA MELIHAT.', G.x + 34, by + 106, { size: 40, font: F.serif7, color: rgba(OP.ray, 0.98), track: 1 });
      txt(ctx, 'pertanyaan berikutnya ada di komentar', G.x + G.w - 34, by + 140, {
        size: 25, font: F.italic, color: 'rgba(242,232,210,0.55)', align: 'right',
      });
      ctx.restore();
    }
  },
};
