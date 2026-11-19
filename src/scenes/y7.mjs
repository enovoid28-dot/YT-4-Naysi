import { txt, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, wordT, mono, ringBurst, photoPrint } from './_bulan.mjs';
import { tag, punch, zoomed, labText, desk, paperCard, inkStamp, sparks } from './_lab.mjs';
import { tick } from './_darah.mjs';
import { G, P, eo, io, satellite, driftChart, toggle, layer } from './_gps.mjs';

// 07 — UJI 1977
// Card 0: an archive on the desk. The year lands digit by digit as the voice
// reads it; the NTS-2 file types itself out, a photo of the test satellite
// slides in, and on "ragu" the file gets stamped: doubted.
// Card 1: the logbook. The prediction is drawn dashed, the measured drift is
// traced over it day by day and lies almost on top; 442,5 against 446,5 —
// about 99 % — and the relativity switch from the first scene finally goes ON.

const YEAR = ['1', '9', '7', '7'];

function archive(ctx, t, scene, cam) {
  const tYear = [wordT(scene, 0, 1), wordT(scene, 0, 2), wordT(scene, 0, 4), wordT(scene, 0, 6)];
  const tMasih = wordT(scene, 0, 7);
  const tRagu = wordT(scene, 0, 10);
  desk(ctx, t, cam, { lamp: [720, 1000], lampR: 1250 });
  // the year, one digit per spoken number
  plane(ctx, cam, 1.12, () => {
    const size = 270;
    const ws = YEAR.map((d) => measure(ctx, d, size, F.display, 0));
    const tw = ws.reduce((a, b) => a + b, 0) + 3 * 14;
    let x = 720 - tw / 2;
    YEAR.forEach((d, i) => {
      const q = eo(P(t, tYear[i] - 0.12, 0.35));
      if (q > 0.001) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 14;
        labText(ctx, d, x, 560 - (1 - q) * 70, { size, font: F.display, color: '#F3E7CF', alpha: q });
        ctx.restore();
      }
      x += ws[i] + 14;
    });
    mono(ctx, 'NAVIGATION TECHNOLOGY SATELLITE 2', 720, 626, { size: 22, color: 'rgba(243,231,207,0.7)', align: 'center', track: 5, a: eo(P(t, tYear[3], 0.5)) });
  });
  // the file
  const fq = P(t, 0.0, 0.6);
  plane(ctx, cam, 1.0, () => {
    paperCard(ctx, 590, 1140, 1000, 640, fq, {
      rot: -0.035, t, ruled: true, age: 0.38,
      lines: [
        { s: 'BERKAS UJI · NTS-2', size: 40, font: F.fig8, y: 76, p: P(t, 0.15, 0.5) },
        { s: 'DILUNCURKAN    23 JUNI 1977', y: 150, p: P(t, tYear[1], 0.8) },
        { s: 'MUATAN         JAM ATOM CESIUM', y: 214, p: P(t, tYear[2], 0.8) },
        { s: 'KETINGGIAN     ± 20.000 KM', y: 278, p: P(t, tYear[3], 0.7) },
        { s: 'RELATIVITAS    ???', y: 342, p: P(t, tMasih - 0.1, 0.5), color: 'rgba(170,40,30,0.92)' },
        { s: 'KOREKSI: DIPASANG, TAPI DIMATIKAN', y: 406, size: 28, p: P(t, tMasih + 0.4, 0.7) },
      ],
    });
    // a photo of the satellite, clipped to the file
    photoPrint(ctx, 950, 730, 430, 480, P(t, 0.35, 0.7), (ix, iy, iw, ih) => {
      const g = ctx.createLinearGradient(0, iy, 0, iy + ih);
      g.addColorStop(0, '#2A2723');
      g.addColorStop(1, '#0E0D0C');
      ctx.fillStyle = g;
      ctx.fillRect(ix, iy, iw, ih);
      satellite(ctx, ix + iw / 2, iy + ih / 2 + 10, 0.38, { t: 0, rot: -0.18, sheen: 0.5 });
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = '#808080';
      ctx.fillRect(ix, iy, iw, ih);
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#E8CFA0';
      ctx.fillRect(ix, iy, iw, ih);
      ctx.globalCompositeOperation = 'source-over';
    }, { rot: 0.05, caption: 'NTS-2', sub: 'SATELIT UJI · 1977' });
    inkStamp(ctx, 'DIRAGUKAN', 540, 1330, P(t, tRagu - 0.12, 0.55), { size: 76, rot: -0.16 });
  });
  const qm = eo(P(t, tMasih - 0.15, 0.4));
  if (qm > 0.001) {
    for (const [x, y, s, r] of [[200, 820, 120, -0.2], [1280, 1460, 96, 0.25], [160, 1500, 80, 0.1]]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r);
      labText(ctx, '?', 0, 0, { size: s, font: F.display, color: 'rgba(200,60,50,0.85)', align: 'center', alpha: qm });
      ctx.restore();
    }
  }
}

function logbook(ctx, t, scene, cam) {
  const tLalu = wordT(scene, 1, 0);
  const tUji = wordT(scene, 1, 2);
  const tUkur = wordT(scene, 1, 3);
  const tHasil = wordT(scene, 1, 4);
  const tNyaris = wordT(scene, 1, 5);
  const tPersis = wordT(scene, 1, 6);
  const tEin = wordT(scene, 1, 8);
  desk(ctx, t, cam, { lamp: [720, 900], lampR: 1300 });
  const CX = 110;
  const CY = 330;
  const CW = 1220;
  const CH = 940;
  const days = 23 * io(P(t, tUkur - 0.1, tNyaris - tUkur + 0.5));
  const pred = io(P(t, tUji - 0.2, 1.0));
  let ch = null;
  const k = punch(t, tPersis - 0.05, 0.035, 0.5);
  zoomed(ctx, k, 900, 700, () => {
    plane(ctx, cam, 1.0, () => {
      ch = driftChart(ctx, CX, CY, CW, CH, P(t, tLalu - 0.5, 0.6), { days, pred, onDay: 20, t });
      // legend, on the paper
      const lq = eo(P(t, tUji, 0.4));
      if (lq > 0.001) {
        ctx.save();
        ctx.globalAlpha *= lq;
        ctx.translate(CX + CW / 2, CY + CH / 2);
        ctx.rotate(-0.012);
        ctx.translate(-CW / 2, -CH / 2);
        ctx.setLineDash([14, 10]);
        ctx.strokeStyle = 'rgba(190,40,30,0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(170, 150);
        ctx.lineTo(250, 150);
        ctx.stroke();
        ctx.setLineDash([]);
        txt(ctx, 'PREDIKSI EINSTEIN', 270, 158, { size: 24, font: F.mono6, color: 'rgba(160,40,30,0.95)', track: 2 });
        const mq = eo(P(t, tUkur, 0.4));
        ctx.globalAlpha *= mq;
        ctx.strokeStyle = 'rgba(20,30,70,0.92)';
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(170, 198);
        ctx.lineTo(250, 198);
        ctx.stroke();
        txt(ctx, 'TERUKUR', 270, 206, { size: 24, font: F.mono6, color: 'rgba(20,30,70,0.95)', track: 2 });
        ctx.restore();
      }
      // the relativity switch from the first scene: ON at last
      const on = P(t, tEin - 0.05, 0.25);
      toggle(ctx, 440, 640, on, { s: 0.62, p: P(t, tHasil - 0.2, 0.5) });
      ringBurst(ctx, 440, 650, P(t, tEin - 0.02, 0.8), { color: G.mintRgb, r: 170 });
    });
  });
  // the two numbers
  const nq = eo(P(t, tNyaris - 0.15, 0.45));
  if (nq > 0.001) {
    plane(ctx, cam, 1.06, () => {
      ctx.save();
      ctx.globalAlpha *= nq;
      ctx.translate(0, (1 - nq) * 20);
      ctx.fillStyle = 'rgba(14,10,8,0.82)';
      ctx.beginPath();
      ctx.roundRect(150, 1338, 1140, 128, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,220,170,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();
      mono(ctx, 'TERUKUR', 200, 1386, { size: 20, color: HUD.sub, track: 4 });
      labText(ctx, '442,5', 200, 1446, { size: 54, font: F.fig8, color: '#9CC8FF' });
      mono(ctx, 'PREDIKSI', 640, 1386, { size: 20, color: HUD.sub, track: 4 });
      labText(ctx, '446,5', 640, 1446, { size: 54, font: F.fig8, color: '#FF9A8A' });
      mono(ctx, '× 10⁻¹²', 1240, 1446, { size: 22, color: HUD.sub, align: 'right', track: 2 });
      ctx.restore();
    });
  }
  plane(ctx, cam, 1.1, () => {
    const tq = P(t, tPersis - 0.1, 0.5);
    tag(ctx, 720, 1620, tq, {
      big: '± 99%', small: 'SESUAI EINSTEIN', color: G.mint, glowRgb: G.mintRgb, size: 112,
    });
    tick(ctx, 1112, 1615, 54, P(t, tPersis + 0.25, 0.4), { lw: 10 });
    sparks(ctx, 720, 1620, t, { n: 26, rgb: G.mintRgb, r: 380, a: 0.6, seed: 77, born: tEin - 0.1 });
  });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.2 * x;
    ctx.translate(720, 1100);
    ctx.scale(k, k);
    ctx.translate(-720, -1100);
    archive(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.92 + 0.08 * x;
    c.translate(720, 900);
    c.scale(k, k);
    c.translate(-720, -900);
    logbook(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
