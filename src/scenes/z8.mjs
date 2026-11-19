import { clamp, lerp, rng, TAU } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';
import { txt } from '../engine/draw.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, ringBurst } from './_bulan.mjs';
import { punch, zoomed, commentBox, sparks } from './_lab.mjs';
import { tick, cross } from './_darah.mjs';
import { title, monoFx, shock, streaks } from './_fx.mjs';
import { hit } from '../engine/look.mjs';
import { C, P, eo, io, layer, garden, slate, bird, rat, seed, sprout, chili, cobek, levelMeter } from './_cabai.mjs';

// 08 — STRATEGI CABAI
// Cards 0–1 share one diagram. Card 0: "mamalia mengunyah bijinya" — the rat
// chews a chili and the seeds come out crushed. Card 1: the bulbul takes a
// fruit, swallows it ("utuh" shows the seed intact inside), flies off and
// drops the seed far away, where it sprouts on "menyebarkannya".
// Card 2: the question back to the viewer — the level meter fills to ten and
// the comment box types an answer.

const SOIL = 1250;
const LX = 380;
const RX = 1060;

let PANEL_T = 0;
function panel(ctx, x0, w, a, { rgb, title, on }) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(6,12,8,0.5)';
  ctx.beginPath();
  ctx.roundRect(x0, 560, w, 1000, 34);
  ctx.fill();
  ctx.strokeStyle = `rgba(${rgb},${0.25 + 0.45 * on})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  // a light running along the rim while the panel is the one being told
  if (on > 0.02) {
    const per = 2 * (w + 1000);
    ctx.save();
    ctx.setLineDash([per * 0.14, per * 0.86]);
    ctx.lineDashOffset = -((PANEL_T * 0.2) % 1) * per;
    ctx.strokeStyle = `rgba(255,240,215,${0.85 * on})`;
    ctx.shadowColor = `rgba(${rgb},0.9)`;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 3.6;
    ctx.stroke();
    ctx.restore();
  }
  // soil strip
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x0, 560, w, 1000, 34);
  ctx.clip();
  const sg = ctx.createLinearGradient(0, SOIL - 10, 0, SOIL + 120);
  sg.addColorStop(0, '#3A2A1A');
  sg.addColorStop(1, '#1A120A');
  ctx.fillStyle = sg;
  ctx.fillRect(x0, SOIL, w, 120);
  ctx.fillStyle = 'rgba(120,90,60,0.35)';
  const r = rng(x0 | 0);
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.arc(x0 + r() * w, SOIL + 8 + r() * 100, 2 + r() * 4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
  mono(ctx, title, x0 + w / 2, 640, { size: 34, color: `rgba(${rgb},${0.6 + 0.4 * on})`, align: 'center', track: 8, a });
}

function diagram(ctx, t, scene, cam) {
  PANEL_T = t;
  const tStrat = wordT(scene, 0, 1);
  const tMam = wordT(scene, 0, 3);
  const tKunyah = wordT(scene, 0, 4);
  const tBiji = wordT(scene, 0, 5);
  const tBurung = wordT(scene, 1, 0);
  const tTelan = wordT(scene, 1, 1);
  const tUtuh = wordT(scene, 1, 2);
  const tLalu = wordT(scene, 1, 3);
  const tSebar = wordT(scene, 1, 4);
  garden(ctx, t, cam, { sun: [720, 760] });

  plane(ctx, cam, 1.15, () => {
    title(ctx, 'STRATEGI', 720, 410, t, -0.22, { size: 176, colors: ['#FFFFFF', '#EAF3DC', '#A8D88A', '#3F8A3A'], side: '#0C2410', glow: '150,230,130', depth: 14, stagger: 0.04 });
    monoFx(ctx, 'CARA CABAI MEMILIH PENYEBAR BIJINYA', 720, 478, P(t, tStrat - 0.1, 0.8), t, { size: 30, color: C.emberHi, align: 'center', track: 3, seed: 25 });
  });

  const onL = eo(P(t, tMam - 0.2, 0.4)) * (1 - 0.6 * eo(P(t, tBurung - 0.3, 0.4)));
  const onR = eo(P(t, tBurung - 0.3, 0.4));
  plane(ctx, cam, 1.0, () => {
    panel(ctx, 70, 620, 1, { rgb: '255,140,120', title: 'MAMALIA', on: onL });
    panel(ctx, 750, 620, 1, { rgb: C.mintRgb, title: 'BURUNG', on: onR });
  });

  // left: the rat chews the fruit, the seeds come out crushed
  plane(ctx, cam, 1.04, () => {
    const chew = t > tKunyah - 0.1 && t < tBiji + 1.2 ? 1 : 0;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(70, 560, 620, 1000, 34);
    ctx.clip();
    rat(ctx, LX - 10, SOIL - 46, 200, { t, chew });
    ctx.restore();
    const bite = clamp((t - tKunyah) / 0.9);
    if (bite < 1) chili(ctx, LX + 150, SOIL - 70, 170 * (1 - 0.6 * bite), { rot: -0.25, bend: 0.12, w: 0.2, shadow: 0 });
    const sq = P(t, tKunyah + 0.1, 0.9);
    if (sq > 0) {
      for (let i = 0; i < 8; i++) {
        const fx = LX + 120 + (i - 3.5) * 34 + Math.sin(i * 2.1) * 10;
        const up = Math.sin(clamp(sq * 1.2 - i * 0.03) * Math.PI) * (90 + i * 8);
        const fy = lerp(SOIL - 80, SOIL + 18 + (i % 3) * 14, eo(sq)) - up * (1 - sq);
        seed(ctx, fx, fy, 30, { broken: 1, rot: i * 1.7 + sq * 3 });
      }
    }
    const xq = P(t, tBiji - 0.05, 0.35);
    cross(ctx, LX, 870, 70, xq, { lw: 14 });
    ringBurst(ctx, LX, 870, xq, { color: C.redRgb, r: 160 });
    shock(ctx, LX, 870, P(t, tBiji - 0.08, 0.7), { r: 300, rgb: C.redRgb, lines: 12, seed: 71 });
    hit(t, tBiji - 0.08, 0.6);
    mono(ctx, 'BIJI HANCUR', LX, 1450, { size: 38, color: '#FF8A7A', align: 'center', track: 5, a: eo(P(t, tBiji, 0.4)) });
  });

  // right: the bird swallows the fruit whole, flies off, the seed sprouts
  plane(ctx, cam, 1.04, () => {
    const k = 2.1;
    const perch = [RX + 90, 990];
    const fly = io(P(t, tLalu - 0.15, 0.7));
    let bx = perch[0];
    let by = perch[1];
    if (fly > 0) {
      bx = lerp(perch[0], perch[0] + 520, fly);
      by = perch[1] - Math.sin(fly * Math.PI * 0.5) * 420;
    }
    const flying = fly > 0 && fly < 1;
    const flap = flying ? 0.5 + 0.5 * Math.sin(t * 40) : 0;
    const gulp = Math.sin(clamp((t - (tTelan - 0.1)) / 0.45) * Math.PI);
    const swallowed = t > tTelan + 0.15;
    // twig
    ctx.save();
    ctx.strokeStyle = '#4E7A32';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(760, 1080);
    ctx.quadraticCurveTo(RX, 1100, 1370, 1060);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(750, 560, 620, 1000, 34);
    ctx.clip();
    bird(ctx, bx, by, k * 100, { t, flip: true, flap, gulp, legs: flying ? 0 : 1 });
    if (!swallowed) {
      const tip = [bx - 84 * k, by - 22 * k + gulp * 8];
      const sh = 1 - 0.7 * clamp((t - (tTelan - 0.1)) / 0.25);
      chili(ctx, tip[0] + 10, tip[1], 150 * sh, { rot: Math.PI + 0.35, bend: 0.1, w: 0.2, shadow: 0 });
    }
    ctx.restore();
    // x-ray: the seed whole inside
    const xq = eo(P(t, tUtuh - 0.15, 0.3)) * (1 - eo(P(t, tLalu - 0.15, 0.25)));
    if (xq > 0.01) {
      const cx = bx - 10;
      const cy = by + 10;
      ctx.save();
      ctx.globalAlpha *= xq;
      ctx.fillStyle = 'rgba(8,30,26,0.75)';
      ctx.beginPath();
      ctx.arc(cx, cy, 64, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(95,227,192,0.95)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
      seed(ctx, cx, cy, 44, { a: xq });
      mono(ctx, 'BIJI UTUH', cx, cy - 92, { size: 30, color: C.mint, align: 'center', track: 5, a: xq });
    }
    // the seed falls from where the bird left, into the soil, and sprouts
    const fall = P(t, tLalu + 0.05, 0.45);
    if (fall > 0) {
      const sx = perch[0] - 40;
      const sy = lerp(perch[1] + 40, SOIL + 16, fall * fall);
      if (fall < 1) seed(ctx, sx, sy, 30, {});
      else seed(ctx, sx, SOIL + 16, 30, { a: 1 - eo(P(t, tSebar + 0.2, 0.3)) });
      sprout(ctx, sx, SOIL + 14, 210, P(t, tSebar - 0.05, 0.7));
      ringBurst(ctx, sx, SOIL, P(t, tSebar, 0.7), { color: C.mintRgb, r: 150 });
    }
    const tq = P(t, tSebar + 0.1, 0.35);
    tick(ctx, RX, 870, 70, tq, { lw: 14, color: C.mint });
    ringBurst(ctx, RX, 870, tq, { color: C.mintRgb, r: 160 });
    shock(ctx, RX, 870, P(t, tSebar - 0.05, 0.7), { r: 300, rgb: C.mintRgb, lines: 12, seed: 72 });
    hit(t, tSebar - 0.05, 0.5);
    mono(ctx, 'BIJI TERSEBAR', RX, 1450, { size: 38, color: C.mint, align: 'center', track: 5, a: eo(P(t, tSebar + 0.1, 0.4)) });
  });
}

function outro(ctx, t, scene, cam) {
  const tLevel = wordT(scene, 2, 0);
  const tBerapa = wordT(scene, 2, 2);
  const tTulis = wordT(scene, 2, 3);
  const tKom = wordT(scene, 2, 5);
  slate(ctx, t, cam, { lamp: [720, 950], lampR: 1250, rgb: '255,160,110', heat: 0.35 });
  plane(ctx, cam, 0.85, () => {
    cobek(ctx, 1150, 1330, 230, { t, a: 0.9 });
    chili(ctx, 120, 1300, 300, { rot: -0.3, bend: 0.12 });
    chili(ctx, 360, 1390, 220, { rot: 0.25, hue: 'green', bend: 0.1 });
  });
  plane(ctx, cam, 1.12, () => {
    title(ctx, 'LEVEL', 720, 460, t, tLevel - 0.3, { size: 222, colors: ['#FFF0C8', '#FF8A3D', '#E0301C', '#8E0E0B'], glow: '255,80,40', depth: 18 });
    mono(ctx, 'PEDASMU BERAPA?', 720, 540, { size: 46, color: C.bone, align: 'center', track: 6, a: eo(P(t, tLevel + 0.1, 0.5)), font: F.fig8 });
  });
  const lv = 10 * io(P(t, tLevel, tBerapa - tLevel + 0.9));
  plane(ctx, cam, 1.0, () => {
    const k = punch(t, tBerapa + 0.6, 0.04, 0.5);
    zoomed(ctx, k, 720, 860, () => {
      levelMeter(ctx, 720, 860, 1180, lv, { p: P(t, tLevel - 0.2, 0.5) });
    });
    txt(ctx, `${Math.round(lv)}`, 720, 1090, { size: 150, font: F.fig8, color: lv > 9.5 ? '#FF5A3C' : C.bone, align: 'center', alpha: eo(P(t, tLevel, 0.4)) });
    mono(ctx, '0 · AMAN', 140, 990, { size: 30, color: 'rgba(232,226,214,0.6)', track: 4, a: eo(P(t, tLevel, 0.4)) });
    mono(ctx, '10 · EKSTREM', 1300, 990, { size: 30, color: '#FF8A7A', align: 'right', track: 4, a: eo(P(t, tLevel, 0.4)) });
    if (lv > 9.5) sparks(ctx, 720, 860, t, { n: 30, rgb: '255,170,90', r: 560, a: 0.8, seed: 12, born: tBerapa + 0.6 });
    shock(ctx, 720, 1040, P(t, tBerapa + 0.55, 0.8), { r: 560, rgb: '255,110,70', lines: 20, seed: 73 });
    streaks(ctx, 720, 1040, P(t, tBerapa + 0.55, 0.6), { n: 22, r: 520, rgb: '255,180,120', seed: 74 });
    hit(t, tBerapa + 0.55, 0.85);
  });
  plane(ctx, cam, 1.06, () => {
    const typed = clamp((t - tTulis) / 1.4);
    commentBox(ctx, 720, 1560, 1120, P(t, tTulis - 0.4, 0.5), {
      typed, s: 'Level 10! Sambal rawit 20 biji', t, send: P(t, tKom + 0.9, 0.3),
    });
    sparks(ctx, 720, 1560, t, { n: 30, rgb: '255,214,120', r: 520, a: 0.5, seed: 8, born: tKom + 0.9 });
    streaks(ctx, 1210, 1560, P(t, tKom + 0.88, 0.5), { n: 14, r: 260, rgb: '255,214,140', seed: 75 });
    hit(t, tKom + 0.88, 0.4);
  });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t2 = wordT(scene, 2, 0);
  const x = io(P(t, t2 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.4 * x;
    ctx.translate(720, 1100);
    ctx.scale(k, k);
    ctx.translate(-720, -1100);
    diagram(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 1000);
    c.scale(k, k);
    c.translate(-720, -1000);
    outro(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
