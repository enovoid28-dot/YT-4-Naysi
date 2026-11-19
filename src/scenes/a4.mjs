import { CY, cue, P, eo, e3, io, keys, frameOn, toFrame, paper, plateFrame, heading, label, leader, place, hatch, stipple, drawOn, numCells, Path2D, rng, clamp, lerp, TAU, F } from './_cyano.mjs';
import { DIVERSITY, BIG5, diversityAt, periodStrip } from './_chart.mjs';
import { trexSprite, asteroidSprite, sharkIcon } from './_fauna.mjs';
import { hit } from '../engine/look.mjs';

// 04 — LIMA KEPUNAHAN
// Marine diversity through the Phanerozoic (schematic after Sepkoski) plots
// itself left to right over the ICS period strip; each of the big five drops
// is numbered as the pen passes it, while the shark line above runs on
// unbroken from 450 Ma to today. "asteroid" pushes in on the end-Cretaceous:
// the impact, the dinosaur struck out, the shark line still going. "66".

const X0 = 120;
const X1 = 1320;
const BASE = 1600;
const X = (ma) => X0 + ((540 - ma) / 540) * (X1 - X0);
const Y = (g) => BASE - g * 0.24;
const LINE_Y = 690;
const BADGE_Y = 772;
const FX = 720;
const FY = 1000;

let CURVE = null;
function curve() {
  if (CURVE) return CURVE;
  const line = new Path2D();
  const fill = new Path2D();
  fill.moveTo(X(540), BASE);
  for (let ma = 540; ma >= 0; ma -= 1) {
    const x = X(ma);
    const y = Y(diversityAt(ma));
    if (ma === 540) line.moveTo(x, y);
    else line.lineTo(x, y);
    fill.lineTo(x, y);
  }
  fill.lineTo(X(0), BASE);
  fill.closePath();
  CURVE = { line, fill };
  return CURVE;
}

/** the impact as an engraver would cut it: a ragged star of ejecta, flying
 *  debris on ballistic arcs and one thin shock ring */
function burst(ctx, x, y, p) {
  if (p <= 0.001 || p >= 1) return;
  const R = rng(66);
  const grow = 1 - Math.pow(1 - p, 3);
  ctx.save();
  // ragged star
  const n = 22;
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * TAU - Math.PI / 2;
    const up = Math.sin(a) < 0 ? 1.25 : 0.7; // ejecta thrown up, not into the ground
    const r = (i % 2 ? 40 + R() * 30 : 110 + R() * 150) * up * grow;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.9]);
  }
  const star = new Path2D();
  pts.forEach(([px, py], i) => (i ? star.lineTo(px, py) : star.moveTo(px, py)));
  star.closePath();
  ctx.globalAlpha = (1 - p) * 0.9;
  ctx.fillStyle = 'rgba(237,242,239,0.22)';
  ctx.fill(star);
  ctx.save();
  ctx.clip(star);
  hatch(ctx, x - 300, y - 300, x + 300, y + 300, { angle: 0.7, step: 7, lw: 1.4, a: 0.55 });
  ctx.restore();
  ctx.strokeStyle = CY.white;
  ctx.lineWidth = 2.4;
  ctx.stroke(star);
  // debris
  ctx.fillStyle = CY.paper;
  for (let i = 0; i < 46; i++) {
    const a = -Math.PI / 2 + (R() - 0.5) * 2.6;
    const v = 260 + R() * 420;
    const dx = Math.cos(a) * v * p;
    const dy = Math.sin(a) * v * p + 520 * p * p;
    ctx.globalAlpha = (1 - p) * (0.5 + R() * 0.5);
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 2 + R() * 4, 0, TAU);
    ctx.fill();
  }
  // shock ring
  ctx.globalAlpha = (1 - p) * 0.7;
  ctx.strokeStyle = CY.paper;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, 60 + grow * 330, (60 + grow * 330) * 0.42, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

export default {
  draw(ctx, t, scene, env) {
    const tLima = cue(scene, 'lima');
    const tKep = cue(scene, 'kepunahan');
    const tTermasuk = cue(scene, 'termasuk');
    const tAst = cue(scene, 'asteroid');
    const tDino = cue(scene, 'dinosaurus');
    const tEnam = cue(scene, 'enam');
    const tJuta = cue(scene, 'juta');

    // the pen: 540 Ma -> today over the first sentence
    const T0 = 0.2;
    const TD = Math.max(2.6, tKep + 0.5 - T0);
    const maHead = lerp(540, 0, clamp((t - T0) / TD));
    const tPass = (ma) => T0 + ((540 - ma) / 540) * TD;
    const tHit = tAst + 0.42;
    hit(t, tHit, 0.85, 0.42);

    const cam = keys(t, [
      [0, 720, 1000, 1.0],
      [tTermasuk - 0.1, 720, 1000, 1.0],
      [tAst + 0.35, 990, 1120, 1.55],
      [tEnam - 0.2, 1000, 1110, 1.6],
      [scene.dur, 1006, 1104, 1.63],
    ]);
    ctx.save();
    const v = frameOn(ctx, cam, FX, FY);
    paper(ctx, env.cam, { kind: 'chart' });
    plateFrame(ctx, { a: 0.9 });
    const hA = 1 - P(t, tTermasuk, 0.5);
    heading(ctx, t, { kicker: 'PL. IV  ·  KEPUNAHAN MASSAL', lines: ['Lolos dari', '*lima* kepunahan'], y: 410, size: 124, t0: -0.4, a: hA });

    // axes: faint genus grid, the period strip and the age scale
    ctx.save();
    ctx.strokeStyle = CY.paper;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 9]);
    for (const g of [1000, 2000, 3000]) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(X0, Y(g));
      ctx.lineTo(X1, Y(g));
      ctx.stroke();
    }
    ctx.restore();
    periodStrip(ctx, X0, X1, BASE + 14, 44, 540, 0, { p: P(t, -0.2, 1.0) });
    for (const ma of [500, 400, 300, 200, 100, 0]) {
      const x = X(ma);
      ctx.save();
      ctx.strokeStyle = CY.paper;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x, BASE + 62);
      ctx.lineTo(x, BASE + 80);
      ctx.stroke();
      ctx.restore();
      label(ctx, `${ma}`, x, BASE + 112, { size: 26, align: 'center', track: 1, a: 0.9 });
    }
    label(ctx, 'JUTA TAHUN LALU', X1, BASE + 156, { size: 24, align: 'right', track: 4, a: 0.8 });
    label(ctx, 'keragaman genus laut  ·  skematik, setelah Sepkoski', X0, BASE + 156, { size: 26, font: F.italic, track: 0, color: CY.light, a: 0.85 });

    // the curve, plotted up to the pen
    const { line, fill } = curve();
    const xHead = X(maHead);
    ctx.save();
    ctx.beginPath();
    ctx.rect(X0 - 10, 600, xHead - X0 + 10, BASE - 600 + 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(237,242,239,0.07)';
    ctx.fill(fill);
    ctx.save();
    ctx.clip(fill);
    hatch(ctx, X0, 700, X1, BASE, { angle: -0.85, step: 10, lw: 1.4, a: 0.32 });
    ctx.restore();
    ctx.strokeStyle = CY.white;
    ctx.lineWidth = 3.6;
    ctx.lineJoin = 'round';
    ctx.stroke(line);
    ctx.restore();
    if (maHead > 0.5) {
      const yh = Y(diversityAt(maHead));
      ctx.save();
      ctx.strokeStyle = CY.paper;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(xHead, yh);
      ctx.lineTo(xHead, BASE + 14);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = CY.white;
      ctx.beginPath();
      ctx.arc(xHead, yh, 7, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // the big five, numbered as the pen passes
    const oldA = 1 - P(t, tAst - 0.1, 0.5);
    BIG5.forEach(([ma], i) => {
      const p = P(t, tPass(ma) - 0.05, 0.45);
      if (p <= 0.001) return;
      ctx.save();
      if (i < 4) ctx.globalAlpha *= lerp(0.18, 1, oldA);
      const x = X(ma);
      const lowMa = ma === 372 ? 359 : ma - 1;
      const yLow = Y(diversityAt(lowMa));
      drawOn(ctx, [[x, BADGE_Y + 30], [x, yLow - 10]], p, { lw: 2, dash: [6, 7], color: CY.amber, a: 0.9 });
      const q = eo(p);
      ctx.save();
      ctx.fillStyle = CY.amber;
      ctx.beginPath();
      ctx.arc(x, BADGE_Y, 26 * q, 0, TAU);
      ctx.fill();
      ctx.restore();
      if (q > 0.5) {
        ctx.save();
        ctx.font = `38px ${F.serif}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = CY.deep;
        ctx.globalAlpha = (q - 0.5) * 2;
        ctx.fillText(String(i + 1), x, BADGE_Y + 2);
        ctx.restore();
      }
      ctx.restore();
    });

    // the shark line: from the oldest scales to today, never broken
    const pLine = clamp((t - tPass(450)) / Math.max(0.1, tPass(0) - tPass(450)));
    if (pLine > 0) {
      const xe = lerp(X(450), X(0), pLine);
      ctx.save();
      ctx.strokeStyle = CY.white;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(X(450), LINE_Y);
      ctx.lineTo(xe, LINE_Y);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(X(450), LINE_Y - 22);
      ctx.lineTo(X(450), LINE_Y + 22);
      ctx.stroke();
      ctx.restore();
      const ic = sharkIcon(110, CY.white);
      ctx.drawImage(ic, xe - 8, LINE_Y - ic.height / 2 - 2);
      label(ctx, 'HIU', X(450), LINE_Y - 40, { size: 32, track: 6, p: P(t, tPass(450), 0.4) });
      label(ctx, '450 jt th lalu → kini', X(450) + 92, LINE_Y - 40, { size: 28, font: F.italic, track: 0, color: CY.light, p: P(t, tPass(450) + 0.2, 0.4) });
    }
    const pS = P(t, tLima - 0.1, 0.5) * hA;
    label(ctx, 'LIMA KEPUNAHAN MASSAL', X0, BADGE_Y + 80, { size: 26, track: 4, color: CY.amber, a: pS * 0.95 });

    // the end-Cretaceous: dinosaur, impact
    const xK = X(66);
    const yK = Y(1780);
    const pRex = P(t, tTermasuk - 0.2, 0.6);
    if (pRex > 0.001) {
      const rex = trexSprite(0.7);
      const gone = P(t, tHit, 0.5);
      place(ctx, rex, 1012, 1132, 0.27, { ux: 500, uy: 0, a: pRex * (1 - 0.55 * gone) });
      if (gone > 0.001) {
        drawOn(ctx, [[900, 1010], [1124, 1150]], P(t, tDino - 0.15, 0.3, eo), { lw: 7, color: CY.amber });
        drawOn(ctx, [[1124, 1010], [900, 1150]], P(t, tDino, 0.3, eo), { lw: 7, color: CY.amber });
      }
    }
    if (t > tAst - 0.4 && t < tHit + 0.05) {
      const k = clamp((t - (tAst - 0.4)) / (tHit - (tAst - 0.4)));
      const e = k * k;
      const ax = lerp(1640, xK, e);
      const ay = lerp(520, yK - 18, e);
      ctx.save();
      ctx.strokeStyle = CY.paper;
      ctx.lineCap = 'round';
      const R = rng(12);
      for (let i = 0; i < 9; i++) {
        const off = (R() - 0.5) * 44;
        const len = 140 + R() * 220;
        const dx = 1640 - xK;
        const dy = 520 - yK;
        const L = Math.hypot(dx, dy);
        const ux = dx / L;
        const uy = dy / L;
        ctx.globalAlpha = 0.25 + R() * 0.5;
        ctx.lineWidth = 1.5 + R() * 2.5;
        ctx.beginPath();
        ctx.moveTo(ax - uy * off + ux * 30, ay + ux * off + uy * 30);
        ctx.lineTo(ax - uy * off + ux * (30 + len), ay + ux * off + uy * (30 + len));
        ctx.stroke();
      }
      ctx.restore();
      const as = asteroidSprite(1);
      const sc = 0.5;
      ctx.drawImage(as, ax - (as.width * sc) / 2, ay - (as.height * sc) / 2, as.width * sc, as.height * sc);
    }
    burst(ctx, xK, yK, clamp((t - tHit) / 0.9));
    if (t > tHit) {
      stipple(ctx, xK - 140, yK - 160, xK + 140, yK + 40, { n: Math.round(160 * (1 - clamp((t - tHit) / 2))), r: 2, a: 0.5, seed: Math.floor(t * 12) });
    }
    ctx.restore();

    // callouts in frame space
    const pD = P(t, tDino - 0.1, 0.5);
    if (pD > 0.001) {
      const [rx, ry] = toFrame(v, 1012, 1150, FX, FY);
      label(ctx, 'DINOSAURUS', rx, ry + 70, { size: 34, align: 'center', track: 6, color: CY.amber, p: pD });
      label(ctx, 'punah', rx, ry + 112, { size: 32, align: 'center', font: F.italic, track: 0, color: CY.light, p: P(t, tDino + 0.15, 0.5) });
    }
    const pH = P(t, tDino + 0.35, 0.5);
    if (pH > 0.001) {
      const [lx, ly] = toFrame(v, X(0), LINE_Y, FX, FY);
      label(ctx, 'HIU', lx - 40, ly + 92, { size: 34, align: 'right', track: 6, p: pH });
      label(ctx, 'selamat', lx - 40, ly + 134, { size: 32, align: 'right', font: F.italic, track: 0, color: CY.light, p: P(t, tDino + 0.5, 0.5) });
    }
    const p66 = P(t, tEnam - 0.1, 0.5, eo);
    if (p66 > 0.001) {
      numCells(ctx, '66', 96, 900, { size: 260, color: CY.amber, a: p66 });
      label(ctx, 'juta tahun lalu', 104, 972, { size: 50, font: F.italic, track: 0, p: P(t, tJuta - 0.1, 0.5) });
      label(ctx, 'ASTEROID CHICXULUB', 104, 1030, { size: 28, track: 5, p: P(t, tJuta + 0.3, 0.5) });
    }
    void e3;
    void io;
    void leader;
    void DIVERSITY;
  },
};
