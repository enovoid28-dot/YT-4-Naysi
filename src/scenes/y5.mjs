import { TAU } from '../engine/anim.mjs';
import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, deepSky, earthBall, wordT, mono, glass, chip, ringBurst, dimension } from './_bulan.mjs';
import { tag, punch, zoomed, labText } from './_lab.mjs';
import { G, P, eo, io, satellite, clockFace, digits, clockStringsUs, layer } from './_gps.mjs';

// 05 — GRAVITASI
// Card 0: the orbit drawn to scale — the Earth is small, the ring of GPS
// satellites sits four Earth radii out. "dua puluh ribu kilometer" measures
// the gap; on "gravitasi lebih lemah" the pull arrows shrink with distance:
// up there it is about six percent of what you feel on the ground.
// Card 1: the same two clocks as before, now the satellite's one runs ahead —
// a day goes by and it gains forty-five microseconds.

const E = [720, 1010];
const RE = 150;
const RO = Math.round(RE * (6371 + 20200) / 6371);

function diagram(ctx, t, scene, cam) {
  const tKet = wordT(scene, 0, 2);
  const tDua = wordT(scene, 0, 3);
  const tKm = wordT(scene, 0, 6);
  const tGrav = wordT(scene, 0, 7);
  const tLemah = wordT(scene, 0, 9);
  deepSky(ctx, t, cam, { seed: 51, band: 0.5, bandY: 1000 });
  const k = punch(t, tGrav - 0.05, 0.03, 0.5);
  zoomed(ctx, k, E[0], E[1], () => {
    plane(ctx, cam, 0.85, () => {
      // the pull: a soft field that fades with distance
      const fq = eo(P(t, tGrav - 0.2, 0.7));
      if (fq > 0.001) {
        const g = ctx.createRadialGradient(E[0], E[1], RE, E[0], E[1], RO * 1.05);
        g.addColorStop(0, `rgba(255,150,90,${0.32 * fq})`);
        g.addColorStop(0.25, `rgba(255,150,90,${0.1 * fq})`);
        g.addColorStop(1, 'rgba(255,150,90,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(E[0], E[1], RO * 1.05, 0, TAU);
        ctx.fill();
        // field rings
        for (const [rr, al] of [[RE * 1.5, 0.35], [RE * 2.2, 0.22], [RE * 3.1, 0.13]]) {
          ctx.strokeStyle = `rgba(255,170,110,${al * fq})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 10]);
          ctx.beginPath();
          ctx.arc(E[0], E[1], rr, 0, TAU);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
      // the orbit, to scale
      const oq = eo(P(t, 0.0, 0.9));
      ctx.save();
      ctx.strokeStyle = `rgba(168,206,248,${0.5 * oq})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 12]);
      ctx.lineDashOffset = -t * 30;
      ctx.beginPath();
      ctx.arc(E[0], E[1], RO, -Math.PI / 2, -Math.PI / 2 + TAU * oq);
      ctx.stroke();
      ctx.restore();
      earthBall(ctx, E[0], E[1], RE, { lon: 108 + t * 4, tilt: -10, sun: { x: -0.6, y: 0.45, z: 0.66 }, lights: 0.6 });
      // pull arrows: long near the ground, short up high (1/r²)
      if (fq > 0.001) {
        for (const r of [RE * 1.35, RE * 2.1, RE * 3.0, RO]) {
          const len = Math.max(14, 92 * Math.pow((RE * 1.35) / r, 2));
          const n = 12;
          for (let i = 0; i < n; i++) {
            const an = (i / n) * TAU + (r === RO ? 0.26 : 0) + t * 0.02;
            const aq = eo(P(t, tGrav - 0.1 + (r / RO) * 0.6, 0.45));
            if (aq <= 0.001) continue;
            const x0 = E[0] + Math.cos(an) * (r + len * 0.5);
            const y0 = E[1] + Math.sin(an) * (r + len * 0.5);
            const x1 = E[0] + Math.cos(an) * (r - len * 0.5 * aq);
            const y1 = E[1] + Math.sin(an) * (r - len * 0.5 * aq);
            const al = 0.95 * aq * (0.45 + 0.55 * (len / 92));
            ctx.strokeStyle = `rgba(255,170,110,${al})`;
            ctx.fillStyle = `rgba(255,170,110,${al})`;
            ctx.lineWidth = 2 + 4 * (len / 92);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
            const hs = 8 + 12 * (len / 92);
            const ca = Math.cos(an);
            const sa = Math.sin(an);
            ctx.beginPath();
            ctx.moveTo(x1 - ca * hs * 0.6, y1 - sa * hs * 0.6);
            ctx.lineTo(x1 + ca * hs * 0.5 - sa * hs * 0.55, y1 + sa * hs * 0.5 + ca * hs * 0.55);
            ctx.lineTo(x1 + ca * hs * 0.5 + sa * hs * 0.55, y1 + sa * hs * 0.5 - ca * hs * 0.55);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      // six satellites on the ring
      for (let i = 0; i < 6; i++) {
        const an = -Math.PI / 2 + (i / 6) * TAU + t * 0.05;
        const x = E[0] + Math.cos(an) * RO;
        const y = E[1] + Math.sin(an) * RO;
        satellite(ctx, x, y, i === 0 ? 0.24 : 0.17, { t: t + i, a: eo(P(t, 0.1 + i * 0.08, 0.5)), rot: an + Math.PI / 2 });
      }
      // the altitude, measured
      const da = -Math.PI / 2 - 0.62;
      const dx = Math.cos(da);
      const dy = Math.sin(da);
      dimension(ctx, E[0] + dx * (RE + 10), E[1] + dy * (RE + 10), E[0] + dx * (RO - 10), E[1] + dy * (RO - 10), P(t, tDua - 0.25, 0.8), {
        label: '20.200 KM', size: 30, color: 'rgba(214,230,248,0.85)',
      });
      ringBurst(ctx, E[0] + dx * RO, E[1] + dy * RO, P(t, tKm - 0.05, 0.8), { color: '168,206,248', r: 110 });
    });
  });
  chip(ctx, 'SKALA SEBENARNYA', 720, 300, eo(P(t, tKet - 0.2, 0.5)), { color: HUD.text, size: 22 });
  // what the arrows say
  const lq = eo(P(t, tLemah - 0.1, 0.5));
  plane(ctx, cam, 1.08, () => {
    mono(ctx, 'KUAT', E[0], E[1] + RE + 74, { size: 24, color: '#FFB98A', align: 'center', track: 6, a: eo(P(t, tGrav, 0.4)) });
    tag(ctx, 720, 1600, lq, {
      big: '± 6%', small: 'GRAVITASI BUMI', color: '#FFB98A', glowRgb: '255,150,90', size: 110,
      sub: 'DI KETINGGIAN ORBIT GPS',
    });
  });
}

function clocks(ctx, t, scene, cam) {
  const tRel = wordT(scene, 1, 1);
  const tUmum = wordT(scene, 1, 2);
  const tWaktu = wordT(scene, 1, 3);
  const tCepat = wordT(scene, 1, 9);
  const tEmpat = wordT(scene, 1, 10);
  const tMikro = wordT(scene, 1, 13);
  deepSky(ctx, t, cam, { seed: 52, band: 0.45, bandY: 900, warm: 0.4 });
  ctx.fillStyle = 'rgba(3,5,10,0.45)';
  ctx.fillRect(0, 0, W, H);
  const hq = eo(P(t, tRel - 0.15, 0.5));
  if (hq > 0.001) {
    labText(ctx, 'RELATIVITAS UMUM', 720, 322 - (1 - hq) * 20, { size: 62, font: F.fig8, color: G.bone, align: 'center', alpha: hq });
    mono(ctx, 'GRAVITASI LEMAH  →  WAKTU LEBIH CEPAT', 720, 378, { size: 22, color: G.fastHi, align: 'center', track: 3, a: eo(P(t, tUmum - 0.1, 0.5)) });
  }
  const dq = io(P(t, tWaktu - 0.1, tMikro - tWaktu + 0.3));
  const day = dq * 86400;
  const base = 9 * 3600 + 41 * 60 + 27;
  const gain = 45 * dq;
  // satellite clock up high, Earth clock down low: the altitude between them
  const cards = [
    { x: 400, y: 1035, r: 172, label: 'BUMI', rgb: '214,230,248', accent: G.bone, accentRgb: '214,230,248' },
    { x: 1030, y: 750, r: 215, label: 'SATELIT', rgb: '255,214,160', accent: G.fast, accentRgb: G.fastRgb },
  ];
  plane(ctx, cam, 1.0, () => {
    const lq = eo(P(t, tRel, 0.6));
    if (lq > 0.001) {
      ctx.save();
      ctx.globalAlpha *= lq;
      ctx.strokeStyle = 'rgba(214,230,248,0.35)';
      ctx.setLineDash([6, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(600, 1035);
      ctx.lineTo(760, 1035);
      ctx.moveTo(640, 750);
      ctx.lineTo(790, 750);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      dimension(ctx, 700, 1035, 700, 750, P(t, tRel, 0.7), { label: '20.200 KM', size: 20, color: 'rgba(214,230,248,0.7)' });
    }
    cards.forEach((c, i) => {
      const cq = P(t, tRel - 0.25 + i * 0.15, 0.6);
      const sec = base + (t - tRel) + day + (i ? gain * 1e-6 : 0);
      clockFace(ctx, c.x, c.y, c.r, sec, {
        p: cq, rgb: c.rgb, accent: c.accent, accentRgb: c.accentRgb,
        glowK: i ? 0.5 + 0.6 * P(t, tCepat - 0.2, 0.4) : 0,
        ghost: i ? (base + (t - tRel) + day) % 60 : null,
      });
      mono(ctx, c.label, c.x, c.y - c.r - 34, { size: 28, color: i ? G.fastHi : G.bone, align: 'center', track: 8, a: eo(cq) });
    });
    satellite(ctx, 1030 + 200, 750 - 240, 0.16, { t, a: eo(P(t, tRel, 0.5)), rot: 0.5 });
    earthBall(ctx, 400 - 150, 1035 + 150, 26, { a: eo(P(t, tRel - 0.1, 0.5)), lon: 110, tilt: -10, sun: { x: -0.5, y: 0.5, z: 0.7 }, lights: 0, halo: 0 });
    ringBurst(ctx, 1030, 750, P(t, tCepat - 0.05, 0.8), { r: 290, color: G.fastRgb });
  });
  const bq = eo(P(t, tWaktu - 0.3, 0.4));
  if (bq > 0.001) {
    plane(ctx, cam, 1.05, () => {
      ctx.save();
      ctx.globalAlpha *= bq;
      glass(ctx, 120, 1262, 1200, 260, 1, { tint: '255,190,110', edge: '255,220,170' });
      mono(ctx, '1 HARI', 170, 1318, { size: 22, color: HUD.sub, track: 5 });
      const hh = String(Math.min(24, Math.floor(dq * 24))).padStart(2, '0');
      mono(ctx, `${hh}:00 / 24:00`, 1270, 1318, { size: 22, color: G.bone, align: 'right', track: 3 });
      ctx.fillStyle = 'rgba(214,230,248,0.12)';
      ctx.beginPath();
      ctx.roundRect(170, 1340, 1100, 12, 6);
      ctx.fill();
      ctx.fillStyle = G.fast;
      ctx.beginPath();
      ctx.roundRect(170, 1340, 1100 * dq, 12, 6);
      ctx.fill();
      const nowUs = Math.floor((base + (t - tRel) + day) * 1e6);
      const se = clockStringsUs(nowUs);
      const ss = clockStringsUs(nowUs + Math.round(gain));
      mono(ctx, 'BUMI', 170, 1412, { size: 20, color: G.bone, track: 5 });
      mono(ctx, 'SATELIT', 170, 1482, { size: 20, color: G.fastHi, track: 5 });
      digits(ctx, `${se.hms},${se.us}`, 1270, 1424, { size: 50, color: G.bone, align: 'right' });
      digits(ctx, `${ss.hms},${ss.us}`, 1270, 1494, { size: 50, color: G.fastHi, align: 'right', glowC: 'rgba(255,176,58,0.45)' });
      ctx.restore();
    });
  }
  plane(ctx, cam, 1.1, () => {
    tag(ctx, 720, 1650, P(t, tEmpat - 0.05, 0.5), {
      big: '+45', small: 'MIKRODETIK / HARI', color: G.fastHi, glowRgb: G.fastRgb, size: 120,
    });
    ringBurst(ctx, 720, 1650, P(t, tMikro - 0.05, 0.8), { r: 300, color: G.fastRgb });
  });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.5 * x;
    ctx.translate(E[0], E[1] - RO);
    ctx.scale(k, k);
    ctx.translate(-E[0], -(E[1] - RO));
    diagram(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 900);
    c.scale(k, k);
    c.translate(-720, -900);
    clocks(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
