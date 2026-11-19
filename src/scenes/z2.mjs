import { clamp, lerp, rng, TAU } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, ringBurst } from './_bulan.mjs';
import { punch, zoomed } from './_lab.mjs';
import { title, monoFx, shock, streaks, scanline } from './_fx.mjs';
import { hit } from '../engine/look.mjs';
import { C, P, eo, io, slate, badge, tongue, nerveTree } from './_cabai.mjs';

// 02 — LIMA RASA
// One tongue for the whole scene, inside a taste wheel of five arcs.
// Card 0: "lima rasa" lands the title; each taste lights its arc and pops
// its badge on its own word, while taste buds all over the tongue flash in
// that colour (every bud tastes all five — there is no tongue map).
// Card 1: the wheel folds into a row of five. PEDAS lands in the tag slot and
// is struck off on "tidak termasuk"; on "saraf nyeri" the tongue turns to an
// x-ray, the pain fibres underneath light up and SARAF NYERI takes the slot.

const T = { x: 720, y: 1040, w: 440, h: 600 };
const RING_R = 430;
const BADGE_R = 545;
const TASTES = [
  { k: 'manis', label: 'MANIS', rgb: '255,236,200', ang: -126 },
  { k: 'asam', label: 'ASAM', rgb: '255,226,90', ang: -54 },
  { k: 'asin', label: 'ASIN', rgb: '170,215,255', ang: 18 },
  { k: 'pahit', label: 'PAHIT', rgb: '214,150,100', ang: 90 },
  { k: 'gurih', label: 'GURIH', rgb: '255,170,100', ang: 162 },
];
const ROW_Y = 590;
const rowX = (i) => 196 + i * 262;
const rad = (d) => (d * Math.PI) / 180;

// taste buds, fixed positions inside the tongue
const BUDS = (() => {
  const r = rng(202);
  const out = [];
  while (out.length < 50) {
    const u = (r() - 0.5) * 0.86;
    const v = (r() - 0.5) * 0.86;
    if (Math.abs(u) > 0.43 * (1 - Math.max(0, v) * 0.7)) continue;
    out.push([T.x + u * T.w, T.y + v * T.h, r()]);
  }
  return out;
})();

function wheel(ctx, t, lit, fold) {
  const a = 1 - fold;
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const s = 1 + 0.25 * fold;
  ctx.translate(T.x, T.y);
  ctx.scale(s, s);
  ctx.rotate(0.04 * Math.sin(t * 0.3));
  // fine tick ring
  ctx.strokeStyle = 'rgba(232,226,214,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 120; i++) {
    const an = (i / 120) * TAU;
    const l = i % 6 === 0 ? 18 : 8;
    ctx.beginPath();
    ctx.moveTo(Math.cos(an) * (RING_R + 30), Math.sin(an) * (RING_R + 30));
    ctx.lineTo(Math.cos(an) * (RING_R + 30 + l), Math.sin(an) * (RING_R + 30 + l));
    ctx.stroke();
  }
  // a counter-rotating dashed ring and a sweeping scanner arc inside it
  ctx.save();
  ctx.rotate(-t * 0.25);
  ctx.setLineDash([3, 14]);
  ctx.strokeStyle = 'rgba(255,214,170,0.28)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, RING_R - 44, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  ctx.save();
  ctx.rotate(t * 0.9);
  ctx.strokeStyle = 'rgba(255,226,180,0.5)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, RING_R + 58, 0, 0.5);
  ctx.stroke();
  ctx.restore();
  // five arcs
  TASTES.forEach((ts, i) => {
    const a0 = rad(ts.ang - 33);
    const a1 = rad(ts.ang + 33);
    const q = lit[i];
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(232,226,214,0.12)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(0, 0, RING_R, a0, a1);
    ctx.stroke();
    if (q > 0.01) {
      ctx.strokeStyle = `rgba(${ts.rgb},${0.25 * q})`;
      ctx.lineWidth = 46;
      ctx.beginPath();
      ctx.arc(0, 0, RING_R, a0, lerp(a0, a1, eo(q)));
      ctx.stroke();
      ctx.strokeStyle = `rgba(${ts.rgb},${0.95 * q})`;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(0, 0, RING_R, a0, lerp(a0, a1, eo(q)));
      ctx.stroke();
    }
  });
  ctx.restore();
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const tLima = wordT(scene, 0, 3);
  const tWords = [5, 6, 7, 8, 10].map((i) => wordT(scene, 0, i));
  const t1 = wordT(scene, 1, 0);
  const tTermasuk = wordT(scene, 1, 2);
  const tBekerja = wordT(scene, 1, 5);
  const tSaraf = wordT(scene, 1, 7);
  const tNyeri = wordT(scene, 1, 8);

  const fold = io(P(t, t1 - 0.6, 0.7));
  const xray = eo(P(t, tBekerja - 0.3, 0.7));
  slate(ctx, t, cam, { lamp: [720, 1040], lampR: 1150, rgb: xray > 0.5 ? '210,170,110' : '255,170,110', heat: 0.12 });

  const lit = tWords.map((tw) => P(t, tw - 0.1, 0.5));
  let flash = -1;
  let flashQ = 0;
  tWords.forEach((tw, i) => {
    const q = P(t, tw - 0.05, 0.9);
    if (q > 0 && q < 1) { flash = i; flashQ = Math.sin(q * Math.PI); }
  });

  plane(ctx, cam, 0.95, () => wheel(ctx, t, lit, fold));

  // the tongue
  const k = punch(t, tSaraf - 0.05, 0.03, 0.5);
  zoomed(ctx, k, T.x, T.y, () => {
    plane(ctx, cam, 1.0, () => {
      tongue(ctx, T.x, T.y, T.w, T.h, { t, dim: xray });
      ctx.save();
      for (const [bx, by, ph] of BUDS) {
        const fl = flash >= 0 ? flashQ * clamp(1 - Math.abs(ph - 0.5) * 0.6) : 0;
        if (fl > 0.02) {
          const rgb = TASTES[flash].rgb;
          const g = ctx.createRadialGradient(bx, by, 0, bx, by, 28);
          g.addColorStop(0, `rgba(${rgb},${0.95 * fl})`);
          g.addColorStop(1, `rgba(${rgb},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(bx - 28, by - 28, 56, 56);
        }
        ctx.fillStyle = `rgba(255,214,220,${0.35 * (1 - xray)})`;
        ctx.beginPath();
        ctx.arc(bx, by, 4.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      if (xray > 0.01) {
        nerveTree(ctx, T.x, T.y, T.w, T.h, t, { reveal: io(P(t, tBekerja - 0.2, 1.2)), on: eo(P(t, tSaraf - 0.2, 0.5)), seed: 21 });
      }
      scanline(ctx, T.x - T.w / 2 - 60, T.y - T.h / 2 - 20, T.w + 120, T.h + 40, P(t, tBekerja - 0.35, 1.0), { rgb: '255,214,140' });
    });
  });

  // the title
  plane(ctx, cam, 1.15, () => {
    const aT = 1 - eo(P(t, t1 - 0.6, 0.4));
    title(ctx, '5 RASA', 720, 410, t, tLima - 0.2, { size: 196, colors: ['#FFFFFF', '#F6E7CF', '#FFB35A', '#D9601E'], side: '#2A1406', glow: '255,170,90', a: aT, depth: 16 });
    monoFx(ctx, 'YANG DIKENAL LIDAH', 720, 478, P(t, tLima + 0.15, 0.7), t, { size: 30, color: C.emberHi, align: 'center', track: 6, a: aT, seed: 4 });
  });

  // the five badges: on the wheel, then folded into a row
  plane(ctx, cam, 1.1, () => {
    TASTES.forEach((ts, i) => {
      const p = P(t, tWords[i] - 0.12, 0.45);
      const bx = T.x + Math.cos(rad(ts.ang)) * BADGE_R;
      const by = T.y + Math.sin(rad(ts.ang)) * BADGE_R;
      const x = lerp(bx, rowX(i), fold);
      const y = lerp(by, ROW_Y, fold);
      badge(ctx, x, y, ts.label, p, { icon: ts.k, size: lerp(46, 30, fold), rgb: ts.rgb, glow: 0.5 * (1 - fold) });
      ringBurst(ctx, bx, by, P(t, tWords[i] - 0.05, 0.6), { color: ts.rgb, r: 170, a: 1 - fold });
      streaks(ctx, bx, by, P(t, tWords[i] - 0.06, 0.5), { n: 12, r: 200, rgb: ts.rgb, seed: 30 + i, a: 1 - fold });
      hit(t, tWords[i] - 0.06, 0.3);
    });
    mono(ctx, 'RASA DASAR', 720, ROW_Y - 74, { size: 26, color: 'rgba(232,226,214,0.65)', align: 'center', track: 8, a: eo(P(t, t1 - 0.2, 0.5)) });
  });

  // the tag slot: PEDAS struck off, then SARAF NYERI
  plane(ctx, cam, 1.05, () => {
    const out = eo(P(t, tSaraf - 0.45, 0.35));
    const shake = t > tTermasuk ? Math.sin(t * 50) * 12 * Math.max(0, 1 - (t - tTermasuk) / 0.35) : 0;
    badge(ctx, 720 + shake, 1640, 'PEDAS', P(t, t1 - 0.1, 0.45), {
      icon: 'pedas', size: 64, rgb: C.redRgb, glow: 0.6, cross: P(t, tTermasuk - 0.05, 0.3), a: 1 - out,
    });
    mono(ctx, 'TIDAK TERMASUK', 720, 1530, { size: 30, color: '#FF8A7A', align: 'center', track: 6, a: eo(P(t, tTermasuk, 0.35)) * (1 - out) });
    shock(ctx, 720 + shake, 1640, P(t, tTermasuk - 0.05, 0.7), { r: 420, rgb: C.redRgb, lines: 16, seed: 12, a: 1 - out });
    hit(t, tTermasuk - 0.05, 0.85);
    badge(ctx, 720, 1640, 'SARAF NYERI', P(t, tSaraf - 0.12, 0.45), { icon: 'nyeri', size: 64, rgb: C.nerveRgb, color: C.nerve, glow: 0.7 });
    shock(ctx, 720, 1640, P(t, tNyeri - 0.06, 0.8), { r: 480, rgb: C.nerveRgb, lines: 18, seed: 13 });
    hit(t, tNyeri - 0.06, 0.7);
    ringBurst(ctx, 720, 1640, P(t, tNyeri - 0.05, 0.7), { color: C.nerveRgb, r: 320 });
    mono(ctx, 'BUKAN PENGECAP RASA', 720, 1530, { size: 30, color: C.nerve, align: 'center', track: 6, a: eo(P(t, tNyeri + 0.15, 0.4)) });
  });
}

export default { draw: drawScene };
