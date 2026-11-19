import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, chip, ringBurst, hero } from './_bulan.mjs';
import { tag, punch, zoomed, sparks } from './_lab.mjs';
import { C, P, eo, io, layer, slate, chili, cobek, badge, tongue, nerveTree, nerve, spikes, icon, flameIcon } from './_cabai.mjs';
import { title, monoFx, hud, panel, haze, shock, streaks } from './_fx.mjs';
import { hit } from '../engine/look.mjs';

// 01 — BUKAN RASA
// Card 0: a glossy cabai rawit under the lamp from frame 0. "Pedas" lands the
// title, "bukan" pops a RASA badge and "rasa" strikes it through.
// Card 1: the tongue. "mengirim sinyal" lights its nerve fibres and a scope
// reads the burst; on "sama" an identical trace appears beside a flame — the
// same signal as a real burn — and "terbakar" sets the flame off.

const TONGUE = { x: 380, y: 1010, w: 420, h: 570 };
const PANEL = { x: 690, w: 650, h: 300, yA: 620, yB: 1060 };

function hook(ctx, t, scene, cam) {
  const tPedas = wordT(scene, 0, 0);
  const tBukan = wordT(scene, 0, 3);
  const tRasa = wordT(scene, 0, 4);
  slate(ctx, t, cam, { lamp: [720, 1000], lampR: 1250, heat: 0.25 + 0.35 * eo(P(t, tBukan, 0.8)) });

  // the mortar, low right, a little out of the light
  plane(ctx, cam, 0.7, () => {
    cobek(ctx, 1250, 1560, 290, { t, a: 0.9 });
  });

  // loose rawit around the hero
  plane(ctx, cam, 0.85, () => {
    chili(ctx, 150, 1530, 300, { rot: -0.25, hue: 'green', bend: 0.12 });
    chili(ctx, 90, 1720, 240, { rot: 0.12, hue: 'red', bend: 0.1 });
    chili(ctx, 1010, 690, 230, { rot: 2.6, hue: 'orange', bend: 0.12 });
  });

  // the hero chili: in the light from frame 0, embers once it is named
  const k = punch(t, tPedas - 0.05, 0.035, 0.5) * punch(t, tRasa - 0.04, 0.03, 0.5);
  zoomed(ctx, k, 720, 1000, () => {
    plane(ctx, cam, 1.0, () => {
      const glowA = 0.3 + 0.5 * eo(P(t, tPedas, 0.6));
      const g = ctx.createRadialGradient(760, 980, 40, 760, 980, 640);
      g.addColorStop(0, `rgba(255,70,40,${0.32 * glowA})`);
      g.addColorStop(1, 'rgba(255,70,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(100, 300, 1240, 1400);
      const sway = 0.02 * Math.sin(t * 0.9);
      haze(ctx, 470, 1120, 1010, 760, t, { n: 7, a: 0.16 + 0.12 * eo(P(t, tBukan, 0.8)), seed: 12 });
      chili(ctx, 330, 1290, 1020, { rot: -0.6 + sway, bend: 0.15, w: 0.165, sheen: P(t, tPedas - 0.1, 1.1) });
      sparks(ctx, 760, 1000, t, { n: 48, r: 560, a: eo(P(t, tPedas, 0.8)) * 0.95, seed: 27, rise: 160, rgb: '255,170,90' });
    });
  });

  // specimen callouts on the hero
  const tSeb = wordT(scene, 0, 2);
  plane(ctx, cam, 1.08, () => {
    hud(ctx, 560, 1120, 96, 820, P(t, tSeb - 0.3, 0.7), t, { label: 'CAPSICUM FRUTESCENS', sub: 'CABAI RAWIT', rgb: '255,196,140', seed: 3 });
    hud(ctx, 930, 905, 1350, 1190, P(t, tSeb + 0.05, 0.7), t, { label: '50–100 RB SHU', sub: 'SKALA SCOVILLE', rgb: '255,150,110', seed: 5 });
  });

  // the title, then RASA struck off
  plane(ctx, cam, 1.15, () => {
    title(ctx, 'PEDAS', 720, 480, t, tPedas - 0.16, { size: 262, colors: ['#FFF0C8', '#FF8A3D', '#E0301C', '#8E0E0B'], glow: '255,80,40', depth: 20 });
    monoFx(ctx, 'RASA  ATAU  RASA SAKIT?', 720, 570, P(t, tPedas + 0.25, 0.7), t, { size: 32, color: C.emberHi, align: 'center', track: 6, seed: 2 });
    hit(t, tPedas - 0.02, 0.55);
    badge(ctx, 720, 1640, 'BUKAN RASA', P(t, tBukan - 0.1, 0.45), { size: 72, glow: 0.5, rgb: C.redRgb, color: '#FF8A7A' });
    shock(ctx, 720, 1640, P(t, tRasa - 0.03, 0.8), { r: 520, rgb: C.redRgb, lines: 18, seed: 4 });
    streaks(ctx, 720, 1640, P(t, tRasa - 0.03, 0.6), { n: 22, r: 520, rgb: '255,150,120', seed: 6 });
    hit(t, tRasa - 0.03, 1);
    ringBurst(ctx, 720, 1640, P(t, tRasa, 0.7), { color: C.redRgb, r: 320 });
  });
}

function signalPanel(ctx, y, t, a, { label, ic, seed, on, fire = 0 }) {
  if (a <= 0.004) return;
  const { x, w, h } = PANEL;
  ctx.save();
  ctx.globalAlpha *= a;
  panel(ctx, x, y, w, h, t, 1, { rgb: ic === 'api' ? '255,140,80' : '255,190,110', trace: 0.4 + 0.6 * on, fill: 0.5 });
  if (ic === 'api') {
    flameIcon(ctx, x + 70, y + 112, 92 * (1 + 0.5 * fire), { t });
    if (fire > 0.01) sparks(ctx, x + 70, y + 70, t, { n: 16, r: 120, a: fire, seed: 9, rise: 90 });
  } else {
    icon(ctx, ic, x + 70, y + 72, 86);
  }
  mono(ctx, label, x + 130, y + 66, { size: 30, color: C.emberHi, track: 3 });
  mono(ctx, 'SARAF → OTAK', x + 130, y + 108, { size: 26, color: 'rgba(232,226,214,0.66)', track: 4 });
  spikes(ctx, x + 30, y + 210, w - 60, 66, t, { rate: 9, seed, on, rgb: C.nerveRgb, speed: 360 });
  ctx.restore();
}

function signal(ctx, t, scene, cam) {
  const tKirim = wordT(scene, 1, 2);
  const tSinyal = wordT(scene, 1, 3);
  const tSama = wordT(scene, 1, 5);
  const tSeperti = wordT(scene, 1, 6);
  const tBakar = wordT(scene, 1, 8);
  slate(ctx, t, cam, { lamp: [560, 1000], lampR: 1200, rgb: '255,150,110', heat: 0.3 + 0.4 * eo(P(t, tBakar, 0.6)) });

  const on = eo(P(t, tKirim - 0.1, 0.5));
  plane(ctx, cam, 1.0, () => {
    const { x, y, w, h } = TONGUE;
    tongue(ctx, x, y, w, h, { t, heat: 0.35 + 0.5 * on, heatAt: [0, 0.18] });
    nerveTree(ctx, x, y, w, h, t, { reveal: io(P(t, tKirim - 0.2, 0.8)), on, seed: 11 });
    // the nerve out of the root, up to the scope
    nerve(ctx, [[x, y - h * 0.46], [x + 40, y - h * 0.62], [PANEL.x - 40, PANEL.yA + 150], [PANEL.x, PANEL.yA + 150]], t, {
      reveal: io(P(t, tKirim, 0.6)), on, lw: 5,
    });
    mono(ctx, 'LIDAH', x, y + h * 0.5 + 76, { size: 30, color: 'rgba(232,226,214,0.7)', align: 'center', track: 6, a: eo(P(t, 0.0, 0.6)) });
  });

  plane(ctx, cam, 1.1, () => {
    const aA = eo(P(t, tSinyal - 0.25, 0.45));
    signalPanel(ctx, PANEL.yA, t, aA, { label: 'SAAT MAKAN CABAI', ic: 'pedas', seed: 7, on });
    const aB = eo(P(t, tSeperti - 0.2, 0.45));
    const fire = eo(P(t, tBakar - 0.05, 0.4));
    signalPanel(ctx, PANEL.yB, t, aB, { label: 'SAAT TERBAKAR', ic: 'api', seed: 7, on: aB, fire });
    // "=" between the traces
    const eq = P(t, tSama - 0.05, 0.4);
    if (eq > 0) {
      const q = eo(eq);
      const cx = PANEL.x + PANEL.w / 2;
      const cy = (PANEL.yA + PANEL.h + PANEL.yB) / 2;
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.fillStyle = C.nerve;
      const bw = 90 * (0.6 + 0.4 * q);
      ctx.fillRect(cx - bw / 2, cy - 26, bw, 16);
      ctx.fillRect(cx - bw / 2, cy + 10, bw, 16);
      ctx.restore();
      ringBurst(ctx, cx, cy, P(t, tSama - 0.02, 0.7), { color: C.nerveRgb, r: 160 });
      shock(ctx, cx, cy, P(t, tSama - 0.04, 0.7), { r: 260, rgb: C.nerveRgb, lines: 12, seed: 8 });
    }
    hit(t, tSama - 0.04, 0.6);
    hit(t, tBakar - 0.05, 0.9);
    shock(ctx, PANEL.x + 70, PANEL.yB + 112, P(t, tBakar - 0.05, 0.8), { r: 340, rgb: '255,140,70', lines: 14, seed: 9 });
  });

  plane(ctx, cam, 1.05, () => {
    tag(ctx, 720, 1640, P(t, tBakar - 0.15, 0.5), { big: 'SINYAL SAMA', small: '', color: C.nerve, glowRgb: C.nerveRgb, size: 92 });
  });
  chip(ctx, 'PADAHAL TIDAK ADA API', 720, 1515, eo(P(t, tBakar + 0.35, 0.45)), { color: C.emberHi, size: 30 });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.5 * x;
    ctx.translate(720, 1000);
    ctx.scale(k, k);
    ctx.translate(-720, -1000);
    hook(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 1000);
    c.scale(k, k);
    c.translate(-720, -1000);
    signal(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
