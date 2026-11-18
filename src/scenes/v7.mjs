import { W, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import {
  HUD, deepSky, moonBall, hero, mono, chip, ringBurst, hudFrame, wordT, padlock, glass, horizon,
  reticle, rrPath,
} from './_bulan.mjs';

// 07 — TERKUNCI (v3)
// Card 0: recap: not still — it turns, exactly once per orbit — and the lock
// snaps shut. Card 1: tilt down to a Javanese night horizon, the full Moon
// rises over the volcano, a comment types itself out and city pins pop in:
// "kamu lihat Bulan purnama dari mana?"
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

const PINS = [
  ['PURWOKERTO', 300, 900],
  ['JAKARTA', 210, 1040],
  ['SURABAYA', 470, 1150],
  ['MEDAN', 250, 1260],
  ['MAKASSAR', 560, 1010],
  ['JAYAPURA', 420, 800],
];

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.9);
  const t1 = wordT(scene, 1, 0, -0.1); // "Tulis"
  const tKom = wordT(scene, 1, 2); // "komentar:"
  const tPurnama = wordT(scene, 1, 6); // "purnama"
  const tDari = wordT(scene, 1, 7); // "dari"
  const tLock = wordT(scene, 0, 5); // "terkunci."
  const tDiam = wordT(scene, 0, 3); // "diam,"

  const pT = io(P(t, t1 - 0.1, 1.3)); // tilt down to the horizon
  deepSky(ctx, t, cam, { seed: 77, band: 0.8, bandY: 900, shiftY: -pT * 220 });

  // the Moon: centred and half-lit → rising full Moon over the horizon
  const mx = lerp(720, 1010, pT);
  const my = lerp(1000, 690, pT);
  const mr = lerp(300, 205, pT);
  const full = io(P(t, t1 + 0.2, tPurnama - t1));
  const sun = { x: lerp(-0.8, 0, full), y: lerp(0.25, 0.05, full), z: lerp(0.55, 1, full) };
  const wob = Math.sin(t * 2.2) * 2.5 * (1 - eo(P(t, tLock - 0.1, 0.4))) * eo(P(t, 0.3, 0.6));

  plane(ctx, cam, 0.7, () => {
    moonBall(ctx, mx, my, mr, {
      rot: wob / 360, tilt: 2, sun, glow: 0.4 + 0.6 * full, shine: 0.06, exposure: 1 + 0.08 * full,
    });
    if (full > 0.3) {
      // atmospheric halo around a rising full Moon
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const gr = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 3.2);
      gr.addColorStop(0, `rgba(255,236,200,${0.22 * (full - 0.3)})`);
      gr.addColorStop(0.4, `rgba(200,210,255,${0.07 * (full - 0.3)})`);
      gr.addColorStop(1, 'rgba(200,210,255,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(mx - mr * 3.3, my - mr * 3.3, mr * 6.6, mr * 6.6);
      ctx.restore();
    }
    reticle(ctx, mx, my, mr, t, P(t, 0.2, 0.8) * (1 - pT), { spin: 0.06, label: 'SINKRON 1 : 1' });
  });

  // lock
  const pLockIn = eo(P(t, tDiam - 0.2, 0.5)) * (1 - eo(P(t, t1 + 0.1, 0.5)));
  if (pLockIn > 0.01) {
    const lx = mx + mr * 0.78;
    const ly = my + mr * 0.78;
    padlock(ctx, lx, ly, 120, P(t, tLock, 0.35), { a: pLockIn, glowC: 'rgba(255,176,58,0.7)' });
  }
  ringBurst(ctx, mx + mr * 0.78, my + mr * 0.78, P(t, tLock + 0.15, 0.8), { r: 180 });

  // horizon
  if (pT > 0.01) {
    const hy = lerp(2100, 1450, pT);
    horizon(ctx, hy, t, { a: 1 });
  }

  // hero
  const aH = 1 - eo(P(t, t1 - 0.1, 0.4));
  if (aH > 0.01) hero(ctx, 'TERKUNCI', 'PENGUNCIAN PASANG SURUT', 104, 420, P(t, tLock - 0.1, 0.7), { size: 140, a: aH });
  if (aH > 0.01 && t < tLock) {
    txt(ctx, '1 PUTAR = 1 ORBIT', 104, 420, { size: 88, font: F.display, color: HUD.bone, alpha: aH * eo(P(t, scene.captions[0].from, 0.5)) * (1 - eo(P(t, tLock - 0.25, 0.2))) });
  }

  // card 1: comment box typing
  const aC = eo(P(t, tKom - 0.2, 0.5));
  if (aC > 0.01) {
    const bx = 104;
    const by = 300;
    const bw = 820;
    const bh = 190;
    glass(ctx, bx, by, bw, bh, aC, { r: 28, glowC: 'rgba(255,176,58,0.25)' });
    // avatar
    ctx.save();
    ctx.globalAlpha *= aC;
    const ag = ctx.createLinearGradient(bx + 36, by + 40, bx + 116, by + 120);
    ag.addColorStop(0, '#FFB03A');
    ag.addColorStop(1, '#FF6B1A');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(bx + 76, by + 80, 40, 0, TAU);
    ctx.fill();
    txt(ctx, 'K', bx + 76, by + 96, { size: 44, font: F.display, color: '#1A1208', align: 'center' });
    ctx.restore();
    mono(ctx, '@kamu · baru saja', bx + 140, by + 66, { size: 20, color: HUD.sub, a: aC, track: 1 });
    const msg = 'Dari Purwokerto, langit lagi cerah!';
    const n = Math.floor(msg.length * clamp((t - tKom) / 1.6));
    const shown = msg.slice(0, Math.max(0, n));
    txt(ctx, shown, bx + 140, by + 118, { size: 40, font: F.semi, color: HUD.bone, alpha: aC });
    if (n < msg.length || Math.floor(t * 2.4) % 2 === 0) {
      ctx.save();
      ctx.font = `40px ${F.semi}`;
      const cw = ctx.measureText(shown).width;
      ctx.restore();
      ctx.save();
      ctx.globalAlpha *= aC;
      ctx.fillStyle = HUD.amber;
      ctx.fillRect(bx + 140 + cw + 6, by + 86, 4, 42);
      ctx.restore();
    }
    // reactions row
    const rA = eo(P(t, tKom + 1.7, 0.4));
    if (rA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= aC * rA;
      ctx.strokeStyle = HUD.amber;
      ctx.fillStyle = HUD.amber;
      ctx.lineWidth = 3;
      // heart
      const hx = bx + 150;
      const hy = by + 160;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 8);
      ctx.bezierCurveTo(hx - 16, hy - 4, hx - 8, hy - 18, hx, hy - 8);
      ctx.bezierCurveTo(hx + 8, hy - 18, hx + 16, hy - 4, hx, hy + 8);
      ctx.fill();
      ctx.restore();
      mono(ctx, String(Math.floor(lerp(1, 128, eo(P(t, tKom + 1.7, 2.2))))), bx + 176, by + 168, { size: 20, color: HUD.amber, a: aC * rA, track: 1 });
      mono(ctx, 'BALAS', bx + 260, by + 168, { size: 20, color: HUD.sub, a: aC * rA, track: 3 });
    }
  }

  // city pins pop in (dari mana?)
  PINS.forEach(([name, x, y], i) => {
    const p = P(t, tDari - 0.6 + i * 0.32, 0.45);
    if (p <= 0) return;
    const e = EASE.outBack(clamp(p));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(e, e);
    ctx.translate(-x, -y);
    chip(ctx, name, x, y, 1, { icon: 'pin', color: i === 0 ? HUD.amber : HUD.ice, size: 25 });
    ctx.restore();
  });

  // full Moon label + burst
  ringBurst(ctx, mx, my, P(t, tPurnama, 0.9), { r: mr * 1.5, color: '255,236,200' });
  chip(ctx, 'PURNAMA', mx, my + mr + 70, P(t, tPurnama + 0.05, 0.5), { color: HUD.amberHi });

  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
