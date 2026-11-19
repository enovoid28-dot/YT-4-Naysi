import { clamp, lerp } from '../engine/anim.mjs';
import { W, H, txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, chip, ringBurst } from './_bulan.mjs';
import { punch, zoomed, commentBox, sparks } from './_lab.mjs';
import { tick } from './_darah.mjs';
import { G, P, eo, io, blueprint, freqPanel, flame, phone, navScreen, layer, satellite, packet } from './_gps.mjs';

// 08 — DISETEL
// Card 0: the clock's frequency on the bench: 10,23 MHz rolls down to
// 10,22999999543 on "disetel lebih lambat". On "diluncurkan" the rocket goes
// up, and from orbit the very same clock reads exactly 10,23 MHz.
// Card 1: back to the phone from the first scene — on the route, on time —
// and the comment box types the question back to the viewer.

const NOM = 10.23;
const SET = 10.22999999543;
const fmt = (v) => v.toFixed(11).replace('.', ',');
const firstDiff = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return i;
  return 99;
};

function rocket(ctx, x, y, s, t, { a = 1, burn = 1 } = {}) {
  if (a <= 0.004) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (burn > 0.01) flame(ctx, 0, 330, 520 * burn, 120, t, { a: burn });
  // engine bells
  ctx.fillStyle = '#2B2F36';
  for (const dx of [-34, 0, 34]) {
    ctx.beginPath();
    ctx.moveTo(dx - 14, 300);
    ctx.lineTo(dx + 14, 300);
    ctx.lineTo(dx + 22, 336);
    ctx.lineTo(dx - 22, 336);
    ctx.closePath();
    ctx.fill();
  }
  // body
  const bg = ctx.createLinearGradient(-60, 0, 60, 0);
  bg.addColorStop(0, '#9AA1AC');
  bg.addColorStop(0.35, '#F4F6F8');
  bg.addColorStop(1, '#7D848F');
  ctx.fillStyle = bg;
  ctx.fillRect(-58, -260, 116, 560);
  ctx.fillStyle = 'rgba(20,24,30,0.85)';
  ctx.fillRect(-58, 40, 116, 16);
  ctx.fillRect(-58, -120, 116, 8);
  // fins
  ctx.fillStyle = '#C8CDD5';
  ctx.beginPath();
  ctx.moveTo(-58, 200);
  ctx.lineTo(-108, 300);
  ctx.lineTo(-58, 290);
  ctx.closePath();
  ctx.moveTo(58, 200);
  ctx.lineTo(108, 300);
  ctx.lineTo(58, 290);
  ctx.closePath();
  ctx.fill();
  // payload fairing, wider than the stage
  const fg = ctx.createLinearGradient(-74, 0, 74, 0);
  fg.addColorStop(0, '#A9B0BA');
  fg.addColorStop(0.35, '#FFFFFF');
  fg.addColorStop(1, '#858C97');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(-58, -260);
  ctx.lineTo(-74, -300);
  ctx.lineTo(-74, -420);
  ctx.quadraticCurveTo(-70, -560, 0, -610);
  ctx.quadraticCurveTo(70, -560, 74, -420);
  ctx.lineTo(74, -300);
  ctx.lineTo(58, -260);
  ctx.closePath();
  ctx.fill();
  txt(ctx, 'GPS', 0, -400, { size: 36, font: F.fig8, color: '#1E3A66', align: 'center' });
  ctx.restore();
}

function bench(ctx, t, scene, cam) {
  const tSet = wordT(scene, 0, 4);
  const tLam = wordT(scene, 0, 6);
  const tSeb = wordT(scene, 0, 7);
  const tLun = wordT(scene, 0, 8);
  blueprint(ctx, t, cam, { cy: 900 });
  // ground: the clock on the bench
  const rq = io(P(t, tSet - 0.1, tLam - tSet + 0.45));
  const v = lerp(NOM, SET, rq);
  const s = fmt(v);
  const hi = firstDiff(s, fmt(NOM));
  const k = punch(t, tLam - 0.05, 0.035, 0.5);
  zoomed(ctx, k, 790, 640, () => {
    plane(ctx, cam, 1.0, () => {
      chip(ctx, 'DISETEL DI BUMI', 790, 420, eo(P(t, 0.0, 0.5)), { color: G.fastHi, size: 24 });
      freqPanel(ctx, 790, 600, s, { p: P(t, 0.0, 0.5), hiFrom: hi, h: 76 });
      const lq = eo(P(t, tLam, 0.4));
      mono(ctx, 'SEDIKIT LEBIH LAMBAT DARI SEHARUSNYA', 790, 742, { size: 20, color: G.fastHi, align: 'center', track: 3, a: lq });
    });
  });
  // the satellite on the bench, then into the fairing
  const ld = io(P(t, tSeb - 0.95, 0.6));
  if (ld < 1) {
    plane(ctx, cam, 1.0, () => {
      const sx = lerp(790, 190, ld);
      const sy = lerp(1230, 1080, ld);
      satellite(ctx, sx, sy, lerp(0.72, 0.08, ld), { t, a: eo(P(t, 0.0, 0.4)) * (1 - ld * ld), rot: lerp(0, -1.2, ld) });
      const cq = eo(P(t, 0.25, 0.5)) * (1 - eo(P(t, tSeb - 1.1, 0.25)));
      if (cq > 0.001) {
        ctx.save();
        ctx.globalAlpha *= cq;
        ctx.strokeStyle = 'rgba(255,210,122,0.6)';
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(790, 690);
        ctx.lineTo(790, 1110);
        ctx.stroke();
        ctx.restore();
        mono(ctx, 'JAM ATOM DI DALAM SATELIT', 820, 1000, { size: 20, color: G.fastHi, track: 3, a: cq });
      }
    });
  }
  // the launch
  const lt = t - (tSeb - 0.3);
  if (lt > -0.6) {
    const up = lt > 0 ? 0.5 * 900 * lt * lt : 0;
    const shake = lt > 0 ? Math.sin(t * 60) * 2 : 0;
    plane(ctx, cam, 1.04, () => {
      rocket(ctx, 190 + shake, 1460 - up, 0.62, t, { a: eo(P(t, tSeb - 1.2, 0.4)), burn: clamp(lt * 3 + 0.25) });
      if (lt > 0 && lt < 1.4) {
        ctx.save();
        const g = ctx.createRadialGradient(190, 1700, 10, 190, 1700, 420);
        g.addColorStop(0, `rgba(255,200,120,${0.35 * (1 - lt / 1.4)})`);
        g.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 1200, 700, 700);
        ctx.restore();
      }
    });
  }
  // orbit: the very same clock, read from the ground
  const oq = P(t, tLun - 0.15, 0.5);
  plane(ctx, cam, 1.0, () => {
    chip(ctx, 'DI ORBIT, TERBACA', 790, 1010, eo(oq), { color: G.mint, size: 24 });
    freqPanel(ctx, 790, 1190, fmt(NOM), { p: oq, h: 76, hiFrom: 0, hiColor: G.mint });
    tick(ctx, 790, 1352, 60, P(t, tLun + 0.2, 0.4), { lw: 11 });
    ringBurst(ctx, 790, 1190, P(t, tLun + 0.05, 0.8), { color: G.mintRgb, r: 520 });
  });
  // the arrow from bench to orbit
  const aq = eo(P(t, tSeb - 0.3, 0.6));
  if (aq > 0.001) {
    ctx.save();
    ctx.globalAlpha *= aq;
    ctx.strokeStyle = 'rgba(214,230,248,0.5)';
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = -t * 40;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(790, 790);
    ctx.lineTo(790, 790 + 170 * aq);
    ctx.stroke();
    ctx.restore();
    mono(ctx, '+38 µs / HARI', 830, 900, { size: 22, color: G.fastHi, track: 3, a: aq });
  }
}

function outro(ctx, t, scene, cam) {
  const tPer = wordT(scene, 1, 0);
  const tNy = wordT(scene, 1, 1);
  const tGps = wordT(scene, 1, 3);
  const tTulis = wordT(scene, 1, 4);
  const tKom = wordT(scene, 1, 6);
  blueprint(ctx, t, cam, { cy: 900 });
  const halo = ctx.createRadialGradient(720, 820, 100, 720, 820, 900);
  halo.addColorStop(0, `rgba(${G.mintRgb},0.12)`);
  halo.addColorStop(1, `rgba(${G.mintRgb},0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);
  const pq = eo(P(t, tPer - 0.6, 0.6));
  // the constellation keeps the phone on time
  plane(ctx, cam, 0.8, () => {
    [[250, 300, 0.5], [720, 230, 0], [1190, 300, -0.5]].forEach(([x, y, r], i) => {
      satellite(ctx, x, y, 0.15, { t: t + i, rot: r, a: pq });
      const ph = ((t * 0.7 + i * 0.33) % 1);
      packet(ctx, x, y + 40, 720, 660, ph, { rgb: G.mintRgb, size: 7, a: pq });
    });
  });
  plane(ctx, cam, 0.95, () => {
    ctx.save();
    ctx.globalAlpha *= pq;
    ctx.translate(720, 800);
    ctx.scale(0.74, 0.74);
    ctx.translate(-720, -800);
    phone(ctx, 720, 800, 620, 1240, {
      rot: 0.02 * Math.sin(t * 0.5),
      content: (c, x, y, w, h) => {
        navScreen(c, x, y, w, h, { t, f: 0.55 + 0.01 * t, k: 2.2, me: [0, 280], drift: 0 });
      },
    });
    ctx.restore();
    chip(ctx, 'TEPAT DI RUTE', 720, 1340, eo(P(t, tNy, 0.4)), { color: G.mint, size: 26 });
  });
  plane(ctx, cam, 1.06, () => {
    const typed = clamp((t - tTulis) / 1.4);
    commentBox(ctx, 720, 1560, 1120, P(t, tGps - 0.3, 0.5), {
      typed, s: 'Pernah! Disuruh lewat pematang sawah', t, send: P(t, tKom + 0.9, 0.3),
    });
    sparks(ctx, 720, 1560, t, { n: 30, rgb: '255,214,120', r: 520, a: 0.5, seed: 8, born: tKom + 0.9 });
  });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.3, 0.6));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.3 * x;
    ctx.translate(790, 1190);
    ctx.scale(k, k);
    ctx.translate(-790, -1190);
    bench(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 900);
    c.scale(k, k);
    c.translate(-720, -900);
    outro(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
