import { clamp, lerp } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';
import { txt } from '../engine/draw.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, chip, ringBurst } from './_bulan.mjs';
import { tag, punch, zoomed } from './_lab.mjs';
import { tick } from './_darah.mjs';
import { title, monoFx, panel, shock, streaks, haze } from './_fx.mjs';
import { hit } from '../engine/look.mjs';
import { grain } from './_lab.mjs';
import { C, P, eo, io, layer, slate, cup, chili, flameIcon } from './_cabai.mjs';

// 06 — SKALA SCOVILLE
// Card 0: how the scale works — the extract is diluted 10×, 100×, 1.000×…
// until a taster no longer feels it; that factor is the SHU. The year rolls
// to 1912 on "seribu sembilan ratus dua belas".
// Card 1: a bar chart. Rawit fills a 120 thousand scale ("lima puluh sampai
// seratus ribu"); on "terpedas" the axis zooms out to three million, rawit
// collapses to a sliver and Pepper X climbs to 2.693.000 on "dua koma tujuh
// juta". Grid levels fade in and out with the zoom.

const dots = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const short = (v) => (v >= 1e6
  ? `${(v / 1e6).toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',')} JT`
  : v >= 1000 ? `${Math.round(v / 1000)} RB` : `${v}`);

function dilution(ctx, t, scene, cam) {
  const tDiukur = wordT(scene, 0, 2);
  const tSkala = wordT(scene, 0, 4);
  const tSejak = wordT(scene, 0, 6);
  const tSeribu = wordT(scene, 0, 8);
  const tBelas = wordT(scene, 0, 12);
  slate(ctx, t, cam, { lamp: [720, 900], lampR: 1250, rgb: '255,196,150', heat: 0.1 });

  plane(ctx, cam, 1.15, () => {
    title(ctx, 'SKALA', 720, 430, t, -0.22, { size: 180, colors: ['#FFFFFF', '#F3E6D2', '#E9B98A', '#B8743E'], side: '#2A1608', glow: '255,170,110', depth: 14 });
    mono(ctx, 'SCOVILLE', 720, 540, { size: 76, color: '#FF6A52', align: 'center', track: 16, a: eo(P(t, -0.1, 0.5)), font: F.fig8 });
    ringBurst(ctx, 720, 515, P(t, tSkala + 0.3, 0.7), { color: C.redRgb, r: 380 });
  });

  // the dilution row
  const tints = [0.92, 0.6, 0.34, 0.16, 0.05];
  const labels = ['1×', '10×', '100×', '1.000×', '10.000×'];
  plane(ctx, cam, 1.0, () => {
    labels.forEach((lb, i) => {
      const x = 230 + i * 245;
      const q = eo(P(t, i === 0 ? -0.2 : tDiukur - 0.2 + i * 0.28, 0.4));
      if (q <= 0.001) return;
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.translate(0, (1 - q) * 40);
      cup(ctx, x, 960, 180, 260, { liquid: `rgba(214,40,26,${tints[i]})`, level: 0.68, t: t + i });
      txt(ctx, lb, x, 1150, { size: 40, font: F.fig8, color: C.bone, align: 'center' });
      ctx.restore();
      const tq = P(t, tDiukur + 0.1 + i * 0.28, 0.35);
      if (i < 4) {
        flameIcon(ctx, x, 780, 86 * eo(tq), { t: t + i, a: eo(tq) * (0.4 + 0.6 * tints[i]) });
      } else {
        tick(ctx, x, 748, 46, tq, { lw: 9, color: C.mint });
        mono(ctx, 'HILANG', x, 690, { size: 26, color: C.mint, align: 'center', track: 4, a: eo(tq) });
      }
    });
    const lq = eo(P(t, tSkala + 0.4, 0.5));
    mono(ctx, 'ANGKA SHU = BERAPA KALI DIENCERKAN', 720, 1250, { size: 30, color: C.emberHi, align: 'center', track: 2, a: lq });
    mono(ctx, 'SAMPAI PEDASNYA TIDAK TERASA', 720, 1296, { size: 30, color: C.emberHi, align: 'center', track: 2, a: lq });
  });

  // the year
  const yv = (tt) => lerp(1900, 1912, io(P(tt, tSeribu - 0.1, tBelas - tSeribu + 0.35)));
  plane(ctx, cam, 1.08, () => {
    const k = punch(t, tBelas - 0.05, 0.04, 0.5);
    zoomed(ctx, k, 720, 1460, () => {
      shock(ctx, 720, 1460, P(t, tBelas - 0.05, 0.8), { r: 460, rgb: C.emberRgb, lines: 16, seed: 51 });
      hit(t, tBelas - 0.05, 0.6);
      tag(ctx, 720, 1460, P(t, tSejak - 0.1, 0.5), {
        big: '1912', small: '', color: '#FFB03A', glowRgb: C.emberRgb, size: 132,
        count: { value: yv(t), digits: 4, prev: yv(t - 1 / 90) },
      });
    });
    mono(ctx, 'SEJAK TAHUN', 720, 1352, { size: 28, color: 'rgba(232,226,214,0.75)', align: 'center', track: 8, a: eo(P(t, tSejak - 0.1, 0.4)) });
    mono(ctx, 'WILBUR SCOVILLE · APOTEKER', 720, 1590, { size: 28, color: 'rgba(232,226,214,0.7)', align: 'center', track: 5, a: eo(P(t, tSeribu, 0.5)) });
  });
}

const BARS = [
  { name: 'JALAPENO', v: 8000, lo: 2500, hue: 'green', t: 'sekitar' },
  { name: 'RAWIT', v: 100000, lo: 50000, hue: 'red', t: 'rawit' },
  { name: 'HABANERO', v: 350000, lo: 100000, hue: 'orange', t: 'zoom1' },
  { name: 'C. REAPER', v: 1641183, lo: 0, hue: 'red', t: 'zoom2' },
  { name: 'PEPPER X', v: 2693000, lo: 0, hue: 'red', t: 'dunia' },
];
const CH = { x0: 210, x1: 1330, base: 1330, top: 540 };
const STEPS = [10000, 20000, 50000, 100000, 250000, 500000, 1000000];

function chart(ctx, t, scene, cam) {
  const tRawit = wordT(scene, 1, 1);
  const tSekitar = wordT(scene, 1, 2);
  const tLima = wordT(scene, 1, 3);
  const tTerpedas = wordT(scene, 1, 9);
  const tDunia = wordT(scene, 1, 11);
  const tDua = wordT(scene, 1, 12);
  const tJuta = wordT(scene, 1, 15);
  slate(ctx, t, cam, { lamp: [760, 1000], lampR: 1250, rgb: '255,170,120', heat: 0.15 + 0.4 * eo(P(t, tDunia, 1.0)) });

  const z = io(P(t, tTerpedas - 0.25, 1.05));
  const ymax = Math.exp(lerp(Math.log(125000), Math.log(2950000), z));
  const Y = (v) => CH.base - (v / ymax) * (CH.base - CH.top);
  const starts = {
    sekitar: tSekitar - 0.1, rawit: tRawit - 0.2,
    zoom1: tTerpedas + 0.15, zoom2: tTerpedas + 0.4, dunia: tDunia - 0.25,
  };
  const pxv = (tt) => 2693000 * io(P(tt, tDunia - 0.25, tJuta - tDunia + 0.5));

  plane(ctx, cam, 1.12, () => {
    panel(ctx, 70, 318, 1300, 1196, t, eo(P(t, tRawit - 0.45, 0.5)), { rgb: '255,170,110', fill: 0.42, trace: 0.35 + 0.65 * eo(P(t, tDunia - 0.3, 0.6)), r: 34 });
    monoFx(ctx, 'TINGKAT PEDAS', CH.x0, 392, P(t, tRawit - 0.35, 0.7), t, { size: 34, color: C.emberHi, track: 6, seed: 19 });
    monoFx(ctx, 'SCOVILLE HEAT UNIT (SHU)', CH.x0, 440, P(t, tRawit - 0.2, 0.7), t, { size: 26, color: 'rgba(232,226,214,0.68)', track: 4, seed: 20 });
  });

  plane(ctx, cam, 1.0, () => {
    const aC = eo(P(t, tRawit - 0.4, 0.5));
    ctx.save();
    ctx.globalAlpha *= aC;
    // grid levels: each fades with how many lines it would draw
    for (const s of STEPS) {
      const n = ymax / s;
      const al = clamp((9 - n) / 4) * clamp((n - 1.6) / 1.4);
      if (al <= 0.01) continue;
      for (let v = s; v < ymax * 0.999; v += s) {
        const y = Y(v);
        ctx.strokeStyle = `rgba(232,226,214,${0.14 * al})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CH.x0, y);
        ctx.lineTo(CH.x1, y);
        ctx.stroke();
        mono(ctx, short(v), CH.x0 - 14, y + 9, { size: 25, color: `rgba(232,226,214,${0.66 * al})`, align: 'right', track: 1 });
      }
    }
    ctx.strokeStyle = 'rgba(232,226,214,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CH.x0, CH.top - 30);
    ctx.lineTo(CH.x0, CH.base);
    ctx.lineTo(CH.x1, CH.base);
    ctx.stroke();
    ctx.restore();

    const bw = 150;
    BARS.forEach((b, i) => {
      const x = CH.x0 + 120 + i * 232;
      const t0 = starts[b.t];
      const g = io(P(t, t0, 0.7));
      if (g <= 0.001 && t < t0) return;
      const v = b.name === 'PEPPER X' ? pxv(t) : b.v * g;
      const y = Math.max(CH.top - 20, Y(v));
      const hot = b.name === 'PEPPER X' || b.name === 'RAWIT';
      ctx.save();
      ctx.globalAlpha *= eo(P(t, t0, 0.3));
      const bg = ctx.createLinearGradient(0, y, 0, CH.base);
      bg.addColorStop(0, hot ? '#FF6A4A' : '#E0A060');
      bg.addColorStop(1, hot ? '#8E140C' : '#6A3A18');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(x - bw / 2, y, bw, CH.base - y, [12, 12, 0, 0]);
      ctx.fill();
      // texture and bevel: grain inside, a lit left edge, a shaded right edge
      ctx.beginPath();
      ctx.roundRect(x - bw / 2, y, bw, CH.base - y, [12, 12, 0, 0]);
      grain(ctx, 0.22, 'overlay');
      const bev = ctx.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0);
      bev.addColorStop(0, 'rgba(255,255,255,0.22)');
      bev.addColorStop(0.18, 'rgba(255,255,255,0.04)');
      bev.addColorStop(0.75, 'rgba(0,0,0,0)');
      bev.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = bev;
      ctx.beginPath();
      ctx.roundRect(x - bw / 2, y, bw, CH.base - y, [12, 12, 0, 0]);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x - bw / 2 + 12, y + 8, 10, Math.max(0, CH.base - y - 16));
      // a hot cap on the top edge
      if (CH.base - y > 24) {
        const cr = bw * 0.62;
        const cg = ctx.createRadialGradient(x, y + 4, 2, x, y + 4, cr);
        cg.addColorStop(0, hot ? 'rgba(255,220,150,0.7)' : 'rgba(255,230,190,0.4)');
        cg.addColorStop(0.5, hot ? 'rgba(255,200,130,0.2)' : 'rgba(255,220,170,0.1)');
        cg.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = cg;
        ctx.fillRect(x - cr, y + 4 - cr, cr * 2, cr * 2);
        ctx.globalCompositeOperation = 'source-over';
      }
      // the range band (rawit: 50–100 thousand)
      if (b.lo && b.name === 'RAWIT') {
        const bq = eo(P(t, tLima - 0.1, 0.5)) * (1 - z);
        if (bq > 0.01) {
          const y0 = Y(b.lo);
          ctx.strokeStyle = `rgba(255,214,120,${bq})`;
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 8]);
          ctx.beginPath();
          ctx.moveTo(x - bw / 2 - 30, y0);
          ctx.lineTo(x + bw / 2 + 30, y0);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = `rgba(255,214,120,${0.22 * bq})`;
          ctx.fillRect(x - bw / 2, y, bw, y0 - y);
        }
      }
      ctx.restore();
      chili(ctx, x - 60, CH.base + 62, 120, { rot: -0.12, hue: b.hue, bend: 0.1, w: 0.22, shadow: 0, a: eo(P(t, t0, 0.3)) });
      mono(ctx, b.name, x, CH.base + 134, { size: 27, color: hot ? '#FFB08A' : 'rgba(232,226,214,0.78)', align: 'center', track: 2, a: eo(P(t, t0, 0.3)) });
      if (b.name === 'PEPPER X' && g > 0) {
        // the record bar burns as it climbs
        const climb = clamp((t - t0) / (tJuta - t0 + 0.4));
        haze(ctx, x - 60, x + 60, y - 30, 380, t, { n: 4, a: 0.3 * eo(P(t, t0, 0.5)), rgb: '255,170,110', seed: 52, lw: 20 });
        flameIcon(ctx, x, y - 70, 80 + 30 * climb, { t, a: eo(P(t, t0 + 0.1, 0.4)) });
        // a tracer from the axis to the top of the bar
        ctx.save();
        ctx.globalAlpha *= eo(P(t, t0, 0.4)) * 0.8;
        ctx.strokeStyle = 'rgba(255,214,120,0.8)';
        ctx.setLineDash([8, 10]);
        ctx.lineDashOffset = -t * 40;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(CH.x0, y);
        ctx.lineTo(x - bw / 2 - 10, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      // value labels
      let lab = short(b.v);
      if (b.name === 'RAWIT') lab = '50–100 RB';
      if (b.name === 'JALAPENO') lab = '2,5–8 RB';
      if (b.name === 'PEPPER X') lab = dots(v);
      const la = b.name === 'RAWIT' ? eo(P(t, tLima - 0.1, 0.4)) : eo(P(t, t0 + 0.2, 0.4));
      const big = b.name === 'PEPPER X';
      txt(ctx, lab, x, y - 24, { size: big ? 50 : 36, font: F.fig8, color: big ? '#FFD27A' : C.bone, align: 'center', alpha: la });
    });
    // rawit after the zoom: a sliver, flagged
    const fq = eo(P(t, tTerpedas + 0.9, 0.5));
    if (fq > 0.01) {
      const x = CH.x0 + 120 + 232;
      ctx.save();
      ctx.globalAlpha *= fq;
      ctx.strokeStyle = 'rgba(255,214,120,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, CH.base - 10, 46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, CH.base - 58);
      ctx.lineTo(x, CH.base - 150);
      ctx.stroke();
      ctx.restore();
      mono(ctx, 'RAWIT', x, CH.base - 170, { size: 28, color: C.emberHi, align: 'center', track: 5, a: fq });
    }
    ringBurst(ctx, CH.x0 + 120 + 4 * 232, Y(pxv(t)), P(t, tJuta - 0.05, 0.8), { color: C.emberRgb, r: 220 });
    shock(ctx, CH.x0 + 120 + 4 * 232, Math.max(CH.top - 20, Y(pxv(t))), P(t, tJuta - 0.08, 0.8), { r: 420, rgb: C.emberRgb, lines: 18, seed: 53 });
    streaks(ctx, CH.x0 + 120 + 4 * 232, Math.max(CH.top - 20, Y(pxv(t))), P(t, tJuta - 0.08, 0.6), { n: 20, r: 380, rgb: '255,214,140', seed: 54 });
  });

  plane(ctx, cam, 1.05, () => {
    tag(ctx, 720, 1670, P(t, tDua - 0.1, 0.5), { big: '2,7 JUTA', small: 'SHU', color: '#FFD27A', glowRgb: C.emberRgb, size: 100 });
  });
  hit(t, tTerpedas + 0.1, 0.4);
  hit(t, tJuta - 0.08, 0.9);
  chip(ctx, 'PEPPER X · REKOR GUINNESS 2023', 720, 1555, eo(P(t, tDunia + 0.2, 0.45)), { color: C.emberHi, size: 28 });
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
    dilution(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 1000);
    c.scale(k, k);
    c.translate(-720, -1000);
    chart(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
