import { W, H, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { person } from './_figure.mjs';
import { HUD, roll, hero, mono, chip, ringBurst, hudFrame, wordT } from './_bulan.mjs';
import {
  KRAK, PL, chartView, cxy, kmPx, drawChart, chartPin, scaleBar, waterRing, waveSide, palm, gcKm,
} from './_krakatau.mjs';

// 05 — TSUNAMI
// Card 0: the chart again, rings of water leave the caldera and the coasts
// they reach go red, town by town. Card 1: the wave in profile against a
// ruler, a palm, a person and a ten-storey outline — then the count.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const sm = (p) => EASE.smooth(clamp(p));

const TOWNS = [
  ['ANYER', PL.anyer, 'right'],
  ['MERAK', PL.merak, 'right'],
  ['CARINGIN', PL.caringin, 'right'],
  ['KALIANDA', PL.kalianda, 'right'],
  ['TELUK BETUNG', PL.telukbetung, 'left'],
];
const SPEED = 230; // px per second on the chart, story time

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const tMati = wordT(scene, 0, 3);
  const tTsu = wordT(scene, 0, 5);
  const t1 = wordT(scene, 1, 0, -0.12);
  const tMeter = wordT(scene, 1, 3);
  const tTewas = wordT(scene, 1, 4);
  const tTiga2 = wordT(scene, 1, 7);
  const tRibu = wordT(scene, 1, 10);
  const pX = EASE.inOutQuint(P(t, t1 - 0.24, 0.5));

  /* ------------------------------ the chart ------------------------------ */
  if (pX < 0.999) {
    const v = chartView(105.64, -5.98, 640 + 120 * eo(P(t, 0, 3.6)), 720, 1010);
    ctx.save();
    ctx.translate(0, -pX * 1500);
    drawChart(ctx, v, { era: 'post', t, grid: 0.8 });
    const [kx, ky] = cxy(v, KRAK[0], KRAK[1]);
    for (let i = 0; i < 6; i++) {
      const ts = 0.25 + i * 0.36;
      const r = (t - ts) * SPEED;
      if (r > 0) waterRing(ctx, kx, ky, r, { a: (1 - i * 0.12) * (1 - P(r, 900, 500)) });
    }
    drawChart(ctx, v, { era: 'post', only: 'land', wet: sm(P(t, 0.6, 1.8)) });
    chartPin(ctx, v, KRAK[0], KRAK[1], 'KRAKATAU', { a: eo(P(t, 0.1, 0.4)), dot: '#FF5A4A', size: 22 });
    TOWNS.forEach(([name, ll, side]) => {
      const d = kmPx(v, gcKm(KRAK, ll));
      const hit = 0.25 + d / SPEED;
      const q = eo(P(t, hit, 0.35));
      chartPin(ctx, v, ll[0], ll[1], name, { a: q, dot: '#FF5A4A', side, size: 21, color: '#FFD0C8' });
      const [x, y] = cxy(v, ll[0], ll[1]);
      ringBurst(ctx, x, y, P(t, hit, 0.8), { r: 80, color: '255,90,74' });
    });
    scaleBar(ctx, v, 1010, 1470, 20, { a: eo(P(t, 0.3, 0.5)) });
    chip(ctx, '165 DESA HANCUR', 1336, 568, P(t, tTsu, 0.5), { align: 'right', color: '#FF8A6A' });
    ctx.restore();
  }

  /* ----------------------------- the profile ----------------------------- */
  if (pX > 0.001) {
    ctx.save();
    ctx.translate(0, (1 - pX) * 1500);
    // the seam of the push: a hairline of light
    if (pX < 0.999) {
      ctx.fillStyle = 'rgba(200,236,248,0.6)';
      ctx.fillRect(0, -3, W, 3);
    }
    const sky = ctx.createLinearGradient(0, 0, 0, 1260);
    sky.addColorStop(0, '#07080B');
    sky.addColorStop(0.6, '#15181C');
    sky.addColorStop(1, '#2A2A2A');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 1260);
    // ash haze bands in the sky
    ctx.fillStyle = 'rgba(120,104,90,0.06)';
    for (let i = 0; i < 5; i++) ctx.fillRect(0, 640 + i * 110 + Math.sin(t * 0.4 + i) * 10, W, 40);
    const SEA = 1250;
    const PXM = 20;
    const Hm = 30 * io(P(t, t1 + 0.05, tMeter + 0.45 - t1));
    const run = P(t, tTewas + 0.1, 1.6);
    const xc = lerp(240, 720, io(P(t, t1, tTewas - t1))) + io(run) * 520;
    const groundY = SEA - 30;
    // things for scale, standing on the beach (the water goes over them)
    const aObj = eo(P(t, t1 + 0.3, 0.6));
    ctx.save();
    ctx.globalAlpha *= aObj;
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = 'rgba(214,230,248,0.45)';
    ctx.lineWidth = 2;
    const bx = 1236;
    const bw = 150;
    const bh = 30 * PXM;
    ctx.strokeRect(bx, groundY - bh, bw, bh);
    for (let f = 1; f < 10; f++) {
      ctx.beginPath();
      ctx.moveTo(bx, groundY - f * 3 * PXM);
      ctx.lineTo(bx + bw, groundY - f * 3 * PXM);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
    mono(ctx, 'GEDUNG', bx + bw / 2, groundY - bh - 44, { size: 19, color: HUD.sub, align: 'center', a: aObj, track: 3 });
    mono(ctx, '10 LANTAI', bx + bw / 2, groundY - bh - 18, { size: 19, color: HUD.sub, align: 'center', a: aObj, track: 3 });
    palm(ctx, 1150, groundY, 20 * PXM, -0.12, t, { a: aObj, color: '#05070A' });
    person(ctx, 1088, groundY, 1.7 * PXM, { alpha: aObj * (1 - P(t, tTewas, 0.4)), pose: 'stand', facing: -1, hat: 0 });
    const res = waveSide(ctx, t, { Hm, xc, sea: SEA, pxm: PXM });
    // the ruler
    const rx = 112;
    ctx.save();
    ctx.globalAlpha *= eo(P(t, t1 + 0.1, 0.5));
    ctx.strokeStyle = 'rgba(214,230,248,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx, SEA);
    ctx.lineTo(rx, SEA - 32 * PXM);
    ctx.stroke();
    for (let m = 0; m <= 30; m += 5) {
      const y = SEA - m * PXM;
      ctx.beginPath();
      ctx.moveTo(rx, y);
      ctx.lineTo(rx + (m % 10 === 0 ? 26 : 14), y);
      ctx.stroke();
      if (m % 10 === 0) txt(ctx, `${m} M`, rx + 36, y + 8, { size: 22, font: F.mono6, color: 'rgba(214,230,248,0.75)', track: 2 });
    }
    const cy = SEA - Hm * PXM;
    ctx.strokeStyle = HUD.amber;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(rx, cy);
    ctx.lineTo(Math.max(rx, xc - 40), cy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = HUD.amber;
    ctx.beginPath();
    ctx.moveTo(rx - 4, cy);
    ctx.lineTo(rx - 22, cy - 10);
    ctx.lineTo(rx - 22, cy + 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // after it lands: the screen goes cold and quiet for the count
    const mem = sm(P(t, tTewas + 0.7, 1.2));
    if (mem > 0.01) {
      ctx.fillStyle = `rgba(4,6,9,${0.62 * mem})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    void res;
  }

  /* --------------------------------- hero -------------------------------- */
  const a0 = 1 - eo(P(t, t1 - 0.2, 0.3));
  if (a0 > 0.01) hero(ctx, 'TSUNAMI', 'PENYEBAB KEMATIAN TERBESAR', 104, 430, P(t, tMati - 0.2, 0.8), { size: 190, a: a0 });
  const aM = eo(P(t, t1, 0.4)) * (1 - eo(P(t, tTiga2 - 0.3, 0.3)));
  if (aM > 0.01) {
    const val = (tt) => 30 * io(P(tt, t1 + 0.05, tMeter + 0.45 - t1));
    const w = roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aM, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'M', 104 + w + 18, 440, { size: 78, font: F.display, color: HUD.amber, alpha: aM });
    txt(ctx, 'TINGGI OMBAK · SETARA GEDUNG 10 LANTAI', 110, 492, { size: 24, font: F.mono6, color: HUD.amber, track: 4, alpha: aM });
  }
  const aD = eo(P(t, tTiga2 - 0.2, 0.4));
  if (aD > 0.01) {
    const val = (tt) => 36417 * io(P(tt, tTiga2 - 0.1, tRibu + 0.45 - tTiga2));
    roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, thousands: true, a: aD, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'JIWA · CATATAN RESMI 1883', 110, 492, { size: 25, font: F.mono6, color: '#FF8A6A', track: 6, alpha: aD });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
