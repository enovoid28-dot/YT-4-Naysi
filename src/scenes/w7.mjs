import { W, H, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, deepSky, roll, hero, mono, chip, glass, ringBurst, hudFrame, wordT, horizon } from './_bulan.mjs';
import {
  KRAK, chartView, cxy, kmPx, drawChart, oldOutline, plumeTop, VOLCANOES, indoMap,
} from './_krakatau.mjs';

// 07 — ANAK KRAKATAU
// Card 0: the caldera today — the outline of what vanished, and a new cone
// rising out of the water in the middle, still smoking. Card 1: dusk over a
// Javanese horizon, the arc of Indonesia's volcanoes lights up, a comment
// types itself: which volcano is closest to your house?
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const sm = (p) => EASE.smooth(clamp(p));

function commentCard(ctx, t, tKom, a) {
  const bx = 104;
  const by = 290;
  const bw = 900;
  const bh = 190;
  glass(ctx, bx, by, bw, bh, a, { r: 28, glowC: 'rgba(255,176,58,0.25)' });
  ctx.save();
  ctx.globalAlpha *= a;
  const ag = ctx.createLinearGradient(bx + 36, by + 40, bx + 116, by + 120);
  ag.addColorStop(0, '#FFB03A');
  ag.addColorStop(1, '#FF6B1A');
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.arc(bx + 76, by + 80, 40, 0, TAU);
  ctx.fill();
  ctx.restore();
  txt(ctx, 'K', bx + 76, by + 96, { size: 44, font: F.display, color: '#1A1208', align: 'center', alpha: a });
  mono(ctx, '@kamu · baru saja', bx + 140, by + 66, { size: 20, color: HUD.sub, a, track: 1 });
  const msg = 'Gunung Slamet, kelihatan dari Purwokerto!';
  const n = Math.floor(msg.length * clamp((t - tKom) / 1.7));
  const shown = msg.slice(0, Math.max(0, n));
  txt(ctx, shown, bx + 140, by + 118, { size: 38, font: F.semi, color: HUD.bone, alpha: a });
  if (n < msg.length || Math.floor(t * 2.4) % 2 === 0) {
    ctx.save();
    ctx.font = `38px ${F.semi}`;
    const cw = ctx.measureText(shown).width;
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = HUD.amber;
    ctx.fillRect(bx + 140 + cw + 6, by + 88, 4, 40);
    ctx.restore();
  }
  const rA = eo(P(t, tKom + 1.8, 0.4));
  if (rA > 0.01) {
    ctx.save();
    ctx.globalAlpha *= a * rA;
    ctx.fillStyle = HUD.amber;
    const hx = bx + 150;
    const hy = by + 160;
    ctx.beginPath();
    ctx.moveTo(hx, hy + 8);
    ctx.bezierCurveTo(hx - 16, hy - 4, hx - 8, hy - 18, hx, hy - 8);
    ctx.bezierCurveTo(hx + 8, hy - 18, hx + 16, hy - 4, hx, hy + 8);
    ctx.fill();
    ctx.restore();
    const likes = Math.round(lerp(1, 214, eo(P(t, tKom + 1.8, 2.4))));
    mono(ctx, `${likes}`, bx + 176, by + 168, { size: 19, color: HUD.amber, a: a * rA, track: 1 });
    mono(ctx, 'BALAS', bx + 260, by + 168, { size: 19, color: HUD.sub, a: a * rA, track: 3 });
  }
}

/** a wisp rising off the horizon cone */
function wisp(ctx, x, y, t, a) {
  if (a <= 0.01) return;
  const r = rng(12);
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const ph = (t * 0.12 + i / 14) % 1;
    const px = x + ph * 120 + Math.sin(ph * 6 + i) * 10;
    const py = y - ph * 260;
    const rr = 8 + ph * 46 + r() * 6;
    ctx.globalAlpha = a * 0.22 * (1 - ph) * sm(ph / 0.1);
    ctx.fillStyle = '#9A9AA6';
    ctx.beginPath();
    ctx.arc(px, py, rr, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const tKal = wordT(scene, 0, 2);
  const tTum = wordT(scene, 0, 3);
  const tAnak = wordT(scene, 0, 4);
  const tAktif = wordT(scene, 0, 8);
  const t1 = wordT(scene, 1, 0, -0.1);
  const tKom = wordT(scene, 1, 2);
  const tGun = wordT(scene, 1, 3);
  const tTer = wordT(scene, 1, 5);
  const pT = io(P(t, t1 - 0.2, 1.1));

  /* ------------------------------ the caldera ---------------------------- */
  if (pT < 0.999) {
    const v = chartView(105.428, -6.104, 6000 + 900 * eo(P(t, 0, 4.6)), 720, 930);
    const grow = io(P(t, tTum - 0.15, 1.7));
    ctx.save();
    ctx.globalAlpha *= 1 - pT;
    ctx.translate(0, -pT * 260);
    drawChart(ctx, v, { era: 'post', anak: grow, vent: sm(P(t, tAnak + 0.2, 0.6)), t, grid: 0.7, labels: 0 });
    oldOutline(ctx, v, P(t, 0.35, 1.3), { a: 0.95 - 0.35 * grow });
    const [ox, oy] = cxy(v, -6.072, 105.404);
    mono(ctx, 'PULAU KRAKATAU · SEBELUM 1883', ox - 10, oy - 30, { size: 20, color: HUD.amber, a: eo(P(t, 0.9, 0.5)) * (1 - 0.6 * grow), track: 3, align: 'left' });
    // caldera rim, submerged
    const [kx, ky] = cxy(v, KRAK[0], KRAK[1]);
    ctx.save();
    ctx.globalAlpha *= eo(P(t, tKal - 0.2, 0.6)) * 0.8;
    ctx.setLineDash([4, 10]);
    ctx.strokeStyle = 'rgba(160,220,240,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(kx + kmPx(v, 0.8), ky + kmPx(v, 1.2), kmPx(v, 3.6), 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    mono(ctx, 'KALDERA · DASAR LAUT 250 M', kx + kmPx(v, 0.8), ky + kmPx(v, 1.2) + kmPx(v, 3.6) + 34, { size: 19, color: 'rgba(170,220,240,0.8)', align: 'center', a: eo(P(t, tKal, 0.6)), track: 3 });
    // island names
    const name = (s, la, lo, al = 'center') => {
      const [x, y] = cxy(v, la, lo);
      mono(ctx, s, x, y, { size: 19, color: 'rgba(214,230,248,0.75)', align: al, a: eo(P(t, 0.6, 0.6)), track: 4 });
    };
    name('RAKATA', -6.168, 105.453);
    name('SERTUNG', -6.04, 105.374);
    name('PANJANG', -6.052, 105.466);
    // the new cone: plume and its label
    const aP = sm(P(t, tAnak + 0.1, 0.8));
    plumeTop(ctx, kx, ky, 520, -2.5, t, { a: aP * 0.95, w: 40 + 30 * grow, seed: 21 });
    ringBurst(ctx, kx, ky, P(t, tAnak - 0.05, 0.8), { r: 140 });
    if (grow > 0.2) {
      const r0 = kmPx(v, 1.0 * grow);
      ctx.save();
      ctx.globalAlpha *= eo(P(t, tAnak, 0.5));
      ctx.strokeStyle = 'rgba(255,176,58,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(kx - r0 * 0.7, ky + r0 * 0.7);
      ctx.lineTo(kx - 170, ky + 250);
      ctx.lineTo(kx - 430, ky + 250);
      ctx.stroke();
      ctx.restore();
      txt(ctx, 'ANAK KRAKATAU', kx - 182, ky + 240, { size: 24, font: F.mono6, color: HUD.amber, track: 4, align: 'right', alpha: eo(P(t, tAnak + 0.1, 0.5)) });
      txt(ctx, 'MUNCUL 1927', kx - 182, ky + 276, { size: 20, font: F.mono, color: HUD.sub, track: 2, align: 'right', alpha: eo(P(t, tAnak + 0.3, 0.5)) });
    }
    // timeline
    const steps = [['1883', 'MELEDAK', tKal - 0.2], ['1927', 'MUNCUL', tTum], ['2018', 'LONGSOR, TSUNAMI', tAnak + 0.2], ['SEP 2026', 'ERUPSI 25 JAM', tAktif - 0.3]];
    const ty = 1452;
    ctx.save();
    ctx.globalAlpha *= eo(P(t, 0.4, 0.5));
    ctx.strokeStyle = 'rgba(214,230,248,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(130, ty);
    ctx.lineTo(1310, ty);
    ctx.stroke();
    ctx.restore();
    steps.forEach(([yr, lab, at], i) => {
      const x = 210 + i * 340;
      const q = eo(P(t, at, 0.4));
      if (q <= 0.01) return;
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.fillStyle = i === 3 ? '#FF5A4A' : HUD.amber;
      ctx.beginPath();
      ctx.arc(x, ty, 9, 0, TAU);
      ctx.fill();
      ctx.restore();
      txt(ctx, yr, x, ty - 26, { size: 30, font: F.num, color: HUD.bone, alpha: q, align: 'center' });
      txt(ctx, lab, x, ty + 40, { size: 18, font: F.mono6, color: i === 3 ? '#FF8A6A' : HUD.sub, track: 3, alpha: q, align: 'center' });
    });
    ctx.restore();
  }
  // status badge on "aktif"
  const aS = eo(P(t, tAktif - 0.1, 0.4)) * (1 - pT);
  chip(ctx, 'SEP 2026 · LEVEL III SIAGA', 1336, 568, aS, { align: 'right', color: '#FF6E5E', size: 24 });

  /* ------------------------------ the horizon ---------------------------- */
  if (pT > 0.001) {
    ctx.save();
    ctx.globalAlpha *= pT;
    ctx.translate(0, (1 - pT) * 300);
    deepSky(ctx, t, cam, { seed: 77, band: 0.75, bandY: 640, warm: 0.5 });
    const dusk = ctx.createLinearGradient(0, 800, 0, 1400);
    dusk.addColorStop(0, 'rgba(120,60,60,0)');
    dusk.addColorStop(1, 'rgba(170,90,60,0.35)');
    ctx.fillStyle = dusk;
    ctx.fillRect(0, 800, W, 600);
    const HZ = 1440;
    wisp(ctx, 676, HZ - 336, t, eo(P(t, t1 + 0.4, 1.0)));
    horizon(ctx, HZ, t, { a: 1, glow: 1.2 });
    // the arc of volcanoes over the sky
    const mx = 70;
    const my = 600;
    const mw = 1300;
    const mh = 470;
    const aMap = eo(P(t, tKom + 0.2, 0.7));
    const pr = indoMap(ctx, mx, my, mw, mh, aMap, { a: 0.9 });
    VOLCANOES.forEach(([la, lo, nm], i) => {
      const at = tGun - 0.1 + (lo - 95) / 47 * 1.1;
      const q = eo(P(t, at, 0.35));
      if (q <= 0.01) return;
      const [x, y] = pr(la, lo);
      const slamet = nm === 'SLAMET';
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.fillStyle = slamet ? HUD.amber : '#FF6E5E';
      ctx.shadowColor = slamet ? 'rgba(255,176,58,0.95)' : 'rgba(255,90,74,0.9)';
      ctx.shadowBlur = slamet ? 22 : 14;
      ctx.beginPath();
      ctx.moveTo(x, y - (slamet ? 16 : 11));
      ctx.lineTo(x + (slamet ? 13 : 9), y + (slamet ? 8 : 6));
      ctx.lineTo(x - (slamet ? 13 : 9), y + (slamet ? 8 : 6));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ringBurst(ctx, x, y, P(t, at, 0.7), { r: slamet ? 70 : 40, color: slamet ? '255,176,58' : '255,90,74' });
      if (['SINABUNG', 'KRAKATAU', 'SLAMET', 'MERAPI', 'SEMERU', 'RINJANI', 'GAMALAMA'].includes(nm)) {
        const up = ['SLAMET', 'SEMERU', 'GAMALAMA', 'SINABUNG'].includes(nm);
        txt(ctx, nm, x, y + (up ? -30 : 44), { size: slamet ? 24 : 17, font: F.mono6, color: slamet ? HUD.amber : 'rgba(255,214,200,0.85)', align: 'center', track: 3, alpha: q });
      }
    });
    chip(ctx, '127 GUNUNG API AKTIF DI INDONESIA', 720, 556, P(t, tTer - 0.1, 0.5), { color: HUD.amber, size: 25 });
    ctx.restore();
    commentCard(ctx, t, tKom, eo(P(t, tKom - 0.25, 0.5)));
  }

  /* --------------------------------- hero -------------------------------- */
  const a0 = 1 - eo(P(t, t1 - 0.25, 0.3));
  if (a0 > 0.01) hero(ctx, 'ANAK KRAKATAU', 'TUMBUH DARI KALDERA · MASIH AKTIF', 104, 420, P(t, wordT(scene, 0, 0) - 0.1, 0.8), { size: 132, a: a0 });
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
