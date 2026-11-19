import { CY, cue, P, eo, e3, io, keys, frameOn, toFrame, paper, plateFrame, heading, label, leader, inset, numCells, arrowHead, hatch, clamp, lerp, TAU, F } from './_cyano.mjs';
import { dial, dialAngle, HOUR } from './_chart.mjs';
import { human } from './_fauna.mjs';

// 03 — JAM BUMI
// Earth's 4.54 billion years as one day on an engraved 24-hour dial (eon ring
// in ICS colours). The hand sweeps to 21.37 for the first sharks while the
// camera pushes into the late evening; it ticks on to 21.58 for the first
// trees, and "Manusia?" opens a lens on the last twenty seconds: the final
// six are ours.

const D = { x: 720, y: 1250, r: 500 };
const FX = 720;
const FY = 1000;
const H_SHARK = HOUR(450); // 21.62 h -> 21.37
const H_TREE = HOUR(385); // 21.96 h -> 21.58
const SEC_PER_MA = 86400 / 4540; // seconds of the day per million years

const ringPt = (h, rr = D.r) => {
  const a = dialAngle(h);
  return [D.x + Math.cos(a) * rr, D.y + Math.sin(a) * rr];
};
const hhmm = (h) => {
  const m = Math.round(h * 60);
  return `${Math.floor(m / 60) % 24}.${String(m % 60).padStart(2, '0')}`;
};

function marker(ctx, h, p, { color = CY.amber } = {}) {
  if (p <= 0.001) return;
  const q = eo(p);
  const a = dialAngle(h);
  const [x0, y0] = ringPt(h, D.r * 0.64);
  const [x1, y1] = ringPt(h, lerp(D.r * 0.64, D.r + 26, q));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
  const [xh, yh] = ringPt(h, D.r + 30);
  arrowHead(ctx, xh, yh, a + Math.PI, { s: 22 * q, color });
}

/** the lens on the last twenty seconds of the day */
function lastSeconds(c, cx, cy, t, tEnam, tDetik) {
  const x0 = cx - 236;
  const x1 = cx + 236;
  const y = cy + 70;
  const px = (x1 - x0) / 20;
  const bandH = 64;
  c.save();
  // everything before us: pale hatching
  c.save();
  c.beginPath();
  c.rect(x0, y - bandH, px * 14, bandH);
  c.clip();
  hatch(c, x0, y - bandH, x1, y, { angle: -0.9, step: 10, lw: 1.4, a: 0.3 });
  c.restore();
  label(c, 'semua sejarah lain', x0 + px * 7, y - bandH - 18, { size: 26, align: 'center', font: F.italic, track: 0, color: CY.light, a: 0.9 });
  // the last six seconds, painted in as "enam" is spoken
  const pb = P(t, tEnam - 0.15, 0.45, eo);
  if (pb > 0.001) {
    const w = px * 6 * pb;
    c.fillStyle = 'rgba(255,188,66,0.88)';
    c.fillRect(x1 - w, y - bandH, w, bandH);
    c.save();
    c.beginPath();
    c.rect(x1 - w, y - bandH, w, bandH);
    c.clip();
    hatch(c, x1 - px * 6, y - bandH, x1, y, { angle: -0.9, step: 9, lw: 1.6, color: '#3A2400', a: 0.3 });
    c.restore();
  }
  // the ruler: a tick a second, the time under every fifth
  c.strokeStyle = CY.paper;
  c.lineWidth = 2.4;
  c.beginPath();
  c.moveTo(x0, y);
  c.lineTo(x1, y);
  c.stroke();
  for (let i = 0; i <= 20; i++) {
    const x = x0 + i * px;
    const major = i % 5 === 0;
    c.lineWidth = major ? 2.6 : 1.4;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y + (major ? 24 : 12));
    c.stroke();
  }
  label(c, '23.59.40', x0, y + 58, { size: 24, align: 'center', track: 0 });
  label(c, '23.59.50', x0 + px * 10, y + 58, { size: 24, align: 'center', track: 0 });
  label(c, '24.00', x1, y + 58, { size: 24, align: 'center', track: 0, color: CY.amber });
  // us, standing on the band
  const ph = P(t, tDetik - 0.25, 0.4, e3);
  if (ph > 0.001) {
    for (let k = 0; k < 3; k++) human(c, x1 - px * (1.1 + k * 1.9), y - bandH - 2 + (1 - ph) * 24, 104, { a: ph, color: CY.white });
  }
  label(c, '6 DETIK', x1 - px * 3, y - bandH - 132, { size: 32, align: 'center', track: 4, color: CY.amber, p: pb });
  c.restore();
}

export default {
  draw(ctx, t, scene, env) {
    const tDua = cue(scene, 'dua');
    const tHiu = cue(scene, 'hiu');
    const tLewat = cue(scene, 'lewat');
    const tPohon = cue(scene, 'pohon');
    const tKurang = cue(scene, 'kurang');
    const tManusia = cue(scene, 'manusia');
    const tEnam = cue(scene, 'enam');
    const tDetik = cue(scene, 'detik');

    // the hand: midnight (Earth forms) -> 21.37 -> 21.58 -> 24.00
    let h = 0;
    if (t > tHiu - 0.3) h = H_SHARK * io(P(t, tHiu - 0.3, 1.75, (x) => x));
    if (t > tPohon - 0.1) h = lerp(H_SHARK, H_TREE, io(P(t, tPohon - 0.1, 0.9, (x) => x)));
    if (t > tManusia - 0.05) h = lerp(H_TREE, 24, io(P(t, tManusia - 0.05, 0.9, (x) => x)));

    const cam = keys(t, [
      [0, 720, 1000, 1.0],
      [tHiu + 0.9, 720, 1000, 1.0],
      [tLewat + 0.55, 560, 940, 1.85],
      [tManusia - 0.1, 586, 926, 1.9],
      [tManusia + 0.8, 610, 920, 1.94],
      [scene.dur, 618, 918, 1.97],
    ]);
    ctx.save();
    const v = frameOn(ctx, cam, FX, FY);
    paper(ctx, env.cam, { kind: 'chart' });
    plateFrame(ctx, { a: 0.9 });

    const hA = 1 - P(t, tHiu + 0.7, 0.6);
    heading(ctx, t, { kicker: 'PL. III  ·  JAM BUMI', lines: ['Sejarah Bumi', 'dalam *24 jam*'], y: 430, size: 124, t0: -0.4, a: hA });

    const draw = P(t, 0.05, 2.3, (x) => x);
    dial(ctx, D.x, D.y, D.r, { draw, fill: 24 * e3(clamp((draw - 0.2) / 0.8)), hand: h, handA: e3(P(t, 0.6, 0.6)) });

    // elapsed track: amber behind the hand
    if (h > 0.01) {
      ctx.save();
      ctx.strokeStyle = CY.amber;
      ctx.lineWidth = 9;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.arc(D.x, D.y, D.r - 7, dialAngle(0), dialAngle(h));
      ctx.stroke();
      ctx.restore();
    }

    // start of the day and the scale key
    const kA = hA * P(t, tDua - 0.3, 0.6);
    label(ctx, '0.00  ·  BUMI TERBENTUK', D.x, D.y - D.r - 40, { size: 26, align: 'center', track: 4, a: kA });
    label(ctx, '1 JAM', 1376, 1676, { size: 28, align: 'right', track: 4, a: kA, color: CY.amber });
    label(ctx, '≈ 189 JUTA TAHUN', 1376, 1716, { size: 26, align: 'right', track: 3, a: kA });
    label(ctx, '1 DETIK', 64, 1676, { size: 28, align: 'left', track: 4, a: kA, color: CY.amber });
    label(ctx, '≈ 52.500 TAHUN', 64, 1716, { size: 26, align: 'left', track: 3, a: kA });

    // pins on the dial
    const pS = P(t, tLewat - 0.2, 0.5);
    const pT = P(t, tPohon + 0.7, 0.5);
    marker(ctx, H_SHARK, pS);
    marker(ctx, H_TREE, pT, { color: CY.white });
    if (t > tManusia + 0.6) {
      ctx.save();
      ctx.fillStyle = CY.amber;
      const a0 = dialAngle(24 - 6 / 3600);
      ctx.beginPath();
      ctx.arc(D.x, D.y, D.r + 2, a0, dialAngle(24));
      ctx.arc(D.x, D.y, D.r * 0.64, dialAngle(24), a0, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // callouts, set in frame space so the type holds its size through the push
    const [sx, sy] = toFrame(v, ...ringPt(H_SHARK, D.r + 54), FX, FY);
    const [tx, ty] = toFrame(v, ...ringPt(H_TREE, D.r + 54), FX, FY);
    const lS = P(t, tLewat, 0.55);
    if (lS > 0.001) {
      leader(ctx, sx, sy, 300, 650, lS, { a: 0.9 });
      numCells(ctx, hhmm(H_SHARK), 96, 600, { size: 150, color: CY.amber, a: lS });
      label(ctx, 'HIU PERTAMA', 100, 648, { size: 32, track: 5, p: lS });
      label(ctx, '± 450 juta tahun lalu', 100, 690, { size: 30, font: F.italic, track: 0, color: CY.light, p: P(t, tLewat + 0.25, 0.5) });
    }
    const lT = P(t, tKurang - 0.1, 0.55);
    if (lT > 0.001) {
      leader(ctx, tx, ty, 700, 400, lT, { a: 0.9 });
      numCells(ctx, hhmm(H_TREE), 640, 352, { size: 150, color: CY.white, a: lT });
      label(ctx, 'POHON PERTAMA', 644, 400, { size: 32, track: 5, p: lT });
      label(ctx, '± 385 juta tahun lalu', 644, 442, { size: 30, font: F.italic, track: 0, color: CY.light, p: P(t, tKurang + 0.15, 0.5) });
    }

    // "Manusia?": a lens on the last twenty seconds
    const pL = P(t, tManusia + 0.1, 0.6);
    if (pL > 0.001) {
      const [mx, my] = toFrame(v, ...ringPt(24, D.r * 0.84), FX, FY);
      const LX = 1080;
      const LY = 1120;
      inset(ctx, LX, LY, 300, pL, (c) => lastSeconds(c, LX, LY - 30, t, tEnam, tDetik), { from: [mx, my, 30] });
      label(ctx, 'MANUSIA', LX, LY + 360, { size: 36, align: 'center', track: 6, color: CY.amber, p: P(t, tDetik - 0.1, 0.5) });
      label(ctx, '± 300 ribu tahun  =  5,7 detik', LX, LY + 404, { size: 30, align: 'center', font: F.italic, track: 0, color: CY.light, p: P(t, tDetik + 0.2, 0.5) });
    }
    void SEC_PER_MA;
    void TAU;
  },
};
