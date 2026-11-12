import { W, H, txt, hexA, linGrad, radGrad, fillRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, column, bathyscaphe, snailfish, drawRule, seabed } from './_ocean.mjs';

// 05 — ZONA HADAL. A trench is a crack in the planet. One small machine is
// falling down it, and the last fish in the world waits at the bottom.

const TOP = -200;
const BOT = 1820;
const FLOOR = 1392;

const x0Ref = (side) => (side < 0 ? -120 : W + 120);

/** inner edge of a wall: x as a function of y */
function edge(side, y) {
  const u = clamp((y - TOP) / (BOT - TOP));
  const base = side < 0 ? lerp(186, 414, u) : lerp(1254, 1012, u);
  const wob = side < 0
    ? Math.sin(u * 3.4) * 26 + Math.sin(u * 9.1) * 16 + Math.sin(u * 23) * 7
    : Math.sin(u * 3.1 + 1.4) * 28 + Math.sin(u * 8.3 + 2) * 17 + Math.sin(u * 21 + 1) * 7;
  return base + wob;
}

function wall(ctx, side, t) {
  const outer = side < 0 ? -120 : W + 120;
  const r = rng(side < 0 ? 3 : 8);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(outer, TOP - 240);
  const pts = [];
  for (let y = TOP - 240; y <= BOT + 240; y += 24) {
    const px = edge(side, y);
    pts.push([px, y]);
    ctx.lineTo(px, y);
  }
  ctx.lineTo(outer, BOT + 240);
  ctx.closePath();

  // light comes out of the gap, so the wall is brightest at its inner face
  const inner = side < 0 ? 356 : W - 356;
  const g = linGrad(ctx, x0Ref(side), 0, inner, 0, [
    [0, '#02080B'], [0.4, '#061519'], [0.72, '#0A252C'], [1, '#123D47'],
  ]);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // Sedimentary wall: stacked beds, uneven in thickness and tone. Regular
  // banding reads as corrugation, so nothing here repeats on a grid.
  const rr2 = rng(side < 0 ? 21 : 27);
  let yy = TOP - 220;
  let bi = 0;
  while (yy < BOT + 200) {
    const th = 14 + Math.pow(rr2(), 2.2) * 104;
    const tone = rr2();
    const dark = rr2() > 0.55;
    const waveA = 6 + rr2() * 26;
    const waveB = rr2() * 0.02 + 0.004;
    const ph = rr2() * 6;
    const inA = edge(side, yy);
    const inB = edge(side, yy + th);
    const yTop = (x) => yy + Math.sin(x * waveB + ph) * waveA;
    const yBot = (x) => yy + th + Math.sin(x * waveB * 1.3 + ph * 1.7) * waveA * 0.8;
    ctx.beginPath();
    ctx.moveTo(inA, yTop(inA));
    for (let x = inA; side < 0 ? x >= outer : x <= outer; x += side < 0 ? -60 : 60) ctx.lineTo(x, yTop(x));
    for (let x = outer; side < 0 ? x <= inB : x >= inB; x += side < 0 ? 60 : -60) ctx.lineTo(x, yBot(x));
    ctx.closePath();
    const base = dark ? 0.55 : 1.05;
    ctx.fillStyle = `rgba(${Math.round((9 + tone * 22) * base)},${Math.round((25 + tone * 30) * base)},${Math.round((30 + tone * 32) * base)},0.7)`;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(inA, yTop(inA));
    for (let x = inA; side < 0 ? x >= outer : x <= outer; x += side < 0 ? -60 : 60) ctx.lineTo(x, yTop(x));
    ctx.strokeStyle = `rgba(176,204,196,${0.04 + rr2() * 0.07})`;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    yy += th + 2 + rr2() * 6;
    bi++;
  }
  // a few big slabs, so the wall has mass and not just layers
  for (let i = 0; i < 5; i++) {
    const y0 = TOP + 60 + rr2() * (BOT - TOP - 300);
    const ex = edge(side, y0);
    const w = 90 + rr2() * 190;
    const h = 70 + rr2() * 150;
    ctx.beginPath();
    ctx.moveTo(ex, y0);
    ctx.lineTo(ex - side * w * 0.6, y0 - h * 0.12);
    ctx.lineTo(ex - side * w, y0 + h * 0.35);
    ctx.lineTo(ex - side * w * 0.7, y0 + h);
    ctx.lineTo(ex, y0 + h * 0.8);
    ctx.closePath();
    ctx.fillStyle = `rgba(${Math.round(11 + rr2() * 16)},${Math.round(30 + rr2() * 20)},${Math.round(34 + rr2() * 22)},0.86)`;
    ctx.fill();
    ctx.strokeStyle = hexA(O.pale, 0.08 + rr2() * 0.05);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ex, y0);
    ctx.lineTo(ex - side * w * 0.6, y0 - h * 0.12);
    ctx.lineTo(ex - side * w, y0 + h * 0.35);
    ctx.stroke();
  }

  // fissures cutting across the beds
  for (let i = 0; i < 10; i++) {
    const y0 = TOP + 40 + i * 190 + rr2() * 90;
    const inner = edge(side, y0);
    ctx.beginPath();
    ctx.moveTo(inner - side * 4, y0);
    ctx.lineTo(inner - side * (60 + rr2() * 150), y0 + 90 + rr2() * 200);
    ctx.strokeStyle = 'rgba(1,4,6,0.6)';
    ctx.lineWidth = 1.6 + rr2() * 2.6;
    ctx.stroke();
  }
  // talus at the foot
  for (let i = 0; i < 40; i++) {
    const y0 = 980 + Math.pow(rr2(), 0.6) * 640;
    const px = edge(side, y0) - side * (rr2() * 110);
    const rz = 8 + rr2() * 32;
    ctx.beginPath();
    ctx.ellipse(px, y0, rz, rz * 0.5, side * 0.28, 0, TAU);
    ctx.fillStyle = `rgba(2,8,10,${0.45 + rr2() * 0.4})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,190,182,0.10)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(px, y0, rz, rz * 0.5, side * 0.28, Math.PI, TAU);
    ctx.stroke();
  }
  ctx.restore();

  // ledges: rock shelves breaking the silhouette into something geological
  for (let i = 0; i < 6; i++) {
    const y0 = 120 + i * 250 + r() * 80;
    const ex = edge(side, y0);
    const len = 46 + r() * 86;
    const h = 26 + r() * 52;
    ctx.beginPath();
    ctx.moveTo(ex, y0 - 14);
    ctx.lineTo(ex - side * len * 0.55, y0 + h * 0.35);
    ctx.lineTo(ex - side * len, y0 + h);
    ctx.lineTo(ex - side * len * 0.2, y0 + h * 1.35);
    ctx.lineTo(ex, y0 + h * 1.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(2,9,12,0.97)';
    ctx.fill();
    ctx.strokeStyle = hexA(O.pale, 0.18);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ex, y0 - 14);
    ctx.lineTo(ex - side * len * 0.55, y0 + h * 0.35);
    ctx.lineTo(ex - side * len, y0 + h);
    ctx.stroke();
  }

  // rim: the inner face catching the last of the water light
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.strokeStyle = hexA(O.pale, 0.20);
  ctx.lineWidth = 2.8;
  ctx.stroke();
  ctx.restore();
}

/** A lamp cone built from a clipped radial falloff: no hard triangle edges. */
function coneLight(ctx, x, y, len, spread, ang, a = 0.5) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // three nested cones: the overlap of a wide, faint one with a narrow, hot one
  // gives the beam a soft edge instead of a cut-out triangle
  const layers = [
    { sp: 1.0, k: 0.30, l: 1.0 },
    { sp: 0.66, k: 0.42, l: 0.94 },
    { sp: 0.38, k: 0.55, l: 0.8 },
  ];
  for (const L of layers) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - spread * L.sp) * len * L.l, y + Math.sin(ang - spread * L.sp) * len * L.l);
    ctx.lineTo(x + Math.cos(ang + spread * L.sp) * len * L.l, y + Math.sin(ang + spread * L.sp) * len * L.l);
    ctx.closePath();
    ctx.clip();
    const g = radGrad(ctx, x, y, 4, len * L.l, [
      [0, hexA('#EAF2E8', 0.55 * a * L.k)],
      [0.16, hexA('#EAF2E8', 0.26 * a * L.k)],
      [0.45, hexA('#EAF2E8', 0.10 * a * L.k)],
      [1, hexA('#EAF2E8', 0)],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(x - len, y - len, len * 2, len * 2);
    ctx.restore();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    column(ctx, 0.96, { t, glowTop: 0.015 });

    layer(ctx, cam, 0.10, () => {
      seabed(ctx, FLOOR, t, { seed: 14, rocks: 0.9, tint: '#0A1D20' });
      wall(ctx, -1, t);
      wall(ctx, 1, t);
    });

    // the descent: 6 km down to 8,6 km across the scene
    const drop = EA.inOut(clamp((t - 0.6) / Math.max(4, scene.dur - 2.2)));
    const depthM = lerp(6000, 8600, drop);
    const subY = lerp(392, 1088, drop);
    const subX = 664 + Math.sin(t * 0.35) * 12;
    const lampAng = Math.PI / 2 - 0.32 - Math.sin(t * 0.45) * 0.07;

    layer(ctx, cam, 0.30, () => {
      coneLight(ctx, subX, subY + 58, 720, 0.26, lampAng, 1);
      // only once the beam has actually reached the silt does it pool there
      const ex = subX + Math.cos(lampAng) * 640;
      const ey = subY + Math.sin(lampAng) * 640;
      if (ey > FLOOR - 30) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const pg = radGrad(ctx, ex, FLOOR + 16, 0, 320, [[0, 'rgba(224,238,224,0.15)'], [1, 'rgba(224,238,224,0)']]);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(ex, FLOOR + 16, 320, 84, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      bathyscaphe(ctx, subX, subY, 0.82, { t, a: 1, lamp: 1, window: 1 });
    });

    // the last fish, waiting near the bottom
    const fishA = at(t, 3.4, 1.6);
    if (fishA > 0.01) {
      const fy = FLOOR - 42 + Math.sin(t * 0.7) * 5;
      const fxx = 952 + Math.sin(t * 0.3) * 26;
      snailfish(ctx, fxx, fy, 1.02, { t, a: fishA * 0.78, flip: Math.sin(t * 0.3) > 0 ? 1 : 0 });
      ctx.save();
      ctx.globalAlpha = fishA * 0.85;
      tracking(ctx, 'IKAN TERDALAM', 846, fy - 148, {
        size: 18, font: F.mono6, track: 4, color: hexA(O.glow, 0.72),
      });
      tracking(ctx, '8.300 M', 846, fy - 118, {
        size: 18, font: F.mono6, track: 4, color: hexA(O.pale, 0.42),
      });
      drawRule(ctx, 846, 846 + 250 * fishA, fy - 96, 1, { color: O.glow, a: 0.32 });
      ctx.restore();
    }

    // shadow scrim on the left wall so the typography stays readable
    const sc = linGrad(ctx, 0, 0, 540, 0, [[0, 'rgba(2,7,9,0.72)'], [0.55, 'rgba(2,7,9,0.34)'], [1, 'rgba(2,7,9,0)']]);
    ctx.fillStyle = sc;
    ctx.fillRect(-40, 300, 580, 1240);

    // descent gauge: 6.000 m down to 8.600 m, the range this scene crosses
    const gA = at(t, 0.6, 0.9);
    if (gA > 0.01) {
      const gx = 132;
      const gy = 760;
      const gw = 348;
      ctx.save();
      ctx.globalAlpha = gA * 0.95;
      tracking(ctx, 'TURUN', gx, gy - 24, { size: 17, font: F.mono6, track: 5, color: hexA(O.pale, 0.4) });
      drawRule(ctx, gx, gx + gw, gy + 14, 1, { color: O.aqua, a: 0.3, lw: 1.2 });
      for (let i = 0; i <= 4; i++) {
        ctx.strokeStyle = hexA(O.aqua, 0.34);
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(gx + (gw * i) / 4, gy + 8);
        ctx.lineTo(gx + (gw * i) / 4, gy + 14);
        ctx.stroke();
      }
      const u = clamp((depthM - 6000) / 2600);
      ctx.fillStyle = O.amber;
      ctx.beginPath();
      ctx.arc(gx + gw * u, gy + 14, 4.5, 0, TAU);
      ctx.fill();
      txt(ctx, '6.000', gx, gy + 44, { size: 15, font: F.mono6, color: hexA(O.pale, 0.34), track: 1 });
      txt(ctx, '8.600 M', gx + gw, gy + 44, {
        size: 15, font: F.mono6, color: hexA(O.amber, 0.55), track: 1, align: 'right',
      });
      ctx.restore();
    }

    const q = at(t, 1.0, 0.8);
    ctx.save();
    ctx.globalAlpha = q;
    txt(ctx, '6.000', 132, 512, { size: 118, font: F.num, color: O.bone, track: -4 });
    tracking(ctx, 'METER · ZONA HADAL', 138, 556, { size: 20, font: F.mono6, track: 5, color: hexA(O.pale, 0.55) });
    drawRule(ctx, 132, 132 + 300 * q, 470, 1, { color: O.aqua, a: 0.3 });
    ctx.restore();

    chip(ctx, 'TEKANAN 600 BAR', 132, 668, {
      a: at(t, 2.2, 0.7) * 0.9, bg: 'rgba(3,12,16,0.85)', ink: hexA(O.bone, 0.85),
      border: hexA(O.aqua, 0.22), size: 20, track: 3,
    });

    kicker(ctx, 'SAMUDRA · ZONA HADAL', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
