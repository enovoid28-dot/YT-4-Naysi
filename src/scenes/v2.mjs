import { W, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import {
  HUD, deepSky, moonBall, earthBall, graticule, roll, mono, chip, arcArrow, donut, ringBurst,
  hudFrame, wordT, sightline, brackets,
} from './_bulan.mjs';

// 02 — 27,3 HARI (v3)
// Card 0: the Moon spins on its axis (graticule shows the turn) while the
// period rolls to 27,3. Card 1: pull back to the orbit, oblique view, real
// Earth at the centre; the Moon goes once around with its near-side marker
// always on Earth. Twin gauges (PUTAR / ORBIT) fill together → SAMA PERSIS.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const ELEV = 38 * (Math.PI / 180);

/** travelled part of the orbit, split into the half behind / in front of Earth */
function strokeArc(ctx, cx, cy, rx, ry, a0, a1, front) {
  if (Math.abs(a1 - a0) < 0.002) return;
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.02));
  ctx.save();
  ctx.strokeStyle = HUD.amber;
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(255,176,58,0.6)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  let on = false;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const isFront = Math.sin(a) >= 0;
    const x = cx + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry;
    if (isFront === front) {
      if (!on) { ctx.moveTo(x, y); on = true; } else ctx.lineTo(x, y);
    } else on = false;
  }
  ctx.stroke();
  ctx.restore();
}

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 1.0);
  deepSky(ctx, t, cam, { seed: 23, band: 0.7, bandY: 1100 });

  const t1 = wordT(scene, 1, 0, -0.1); // "Mengelilingi"
  const pX = io(P(t, t1, 1.1)); // spin close-up → orbit wide
  const ocx = 720;
  const ocy = 1010;
  const R = 500;
  const rx = R;
  const ry = R * Math.sin(ELEV);

  // orbit progress: one lap across the second sentence
  const lapA = t1 + 0.5;
  const lapB = wordT(scene, 1, 9, 0.2); // "sama"
  const lap = io(P(t, lapA, lapB - lapA));
  const th = -Math.PI / 2 - lap * TAU; // start behind Earth, counter-clockwise like the real orbit
  const mxO = ocx + Math.cos(th) * rx;
  const myO = ocy + Math.sin(th) * ry;
  const mrO = 86 + Math.sin(th) * 10; // nearer = bigger (a hint of depth)

  // near-side lock: longitude facing camera so lon 0 points at Earth
  const rotLock = -Math.atan2(-Math.cos(th), -Math.sin(th)) / TAU;
  // free spin during card 0
  const spin = io(P(t, 0.3, t1 - 0.3)) * 1.0;

  const mx = lerp(720, mxO, pX);
  const my = lerp(1060, myO, pX);
  const mr = lerp(318, mrO, pX);
  const rot = pX < 1 ? lerp(1 - spin, rotLock, pX) : rotLock;
  const tilt = lerp(4, ELEV / (Math.PI / 180), pX);
  const sunV = { x: -0.95, y: 0.12, z: lerp(0.45, 0.05, pX) };

  // Earth (behind or in front of the Moon depending on where it is)
  // Earth only arrives once the receding Moon has cleared the centre, so the
  // two never cross mid-move; it grows in with a soft overshoot
  const pE = Math.max(0, EASE.outBackSoft(clamp((pX - 0.78) / 0.22)));
  const er = 150;
  const drawEarth = () => {
    if (pE <= 0.01) return;
    earthBall(ctx, ocx, ocy, er * (0.55 + 0.45 * pE), {
      a: clamp(pE), lon: 105 - t * 4, tilt: 18, sun: { x: -0.95, y: 0.12, z: 0.1 }, cloudLon: t * 1.2,
    });
  };
  const moonBehind = Math.sin(th) < 0;

  plane(ctx, cam, 0.6, () => {
    // orbit ellipse: back half, then (after the Moon/Earth) front half
    const pO = eo(P(t, t1 + 0.25, 0.9));
    if (pO > 0.01) {
      ctx.save();
      ctx.globalAlpha *= pO;
      ctx.strokeStyle = 'rgba(150,190,240,0.30)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(ocx, ocy, rx, ry, 0, Math.PI, TAU);
      ctx.stroke();
      // travelled arc (only the stretch behind Earth in this pass)
      strokeArc(ctx, ocx, ocy, rx, ry, -Math.PI / 2, th, false);
      ctx.restore();
      // day ticks around the orbit (27 marks)
      ctx.save();
      ctx.globalAlpha *= pO * 0.8;
      for (let i = 0; i < 27; i++) {
        const a = -Math.PI / 2 - (i / 27.3) * TAU;
        const x0 = ocx + Math.cos(a) * rx * 1.03;
        const y0 = ocy + Math.sin(a) * ry * 1.03;
        const x1 = ocx + Math.cos(a) * rx * (i % 7 === 0 ? 1.075 : 1.05);
        const y1 = ocy + Math.sin(a) * ry * (i % 7 === 0 ? 1.075 : 1.05);
        ctx.strokeStyle = i % 7 === 0 ? 'rgba(214,230,248,0.6)' : 'rgba(214,230,248,0.25)';
        ctx.lineWidth = i % 7 === 0 ? 2.4 : 1.4;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        if (i % 7 === 0 && i > 0) {
          txt(ctx, `H${i}`, ocx + Math.cos(a) * rx * 1.14, ocy + Math.sin(a) * ry * 1.16 + 8, {
            size: 19, font: F.mono6, color: 'rgba(214,230,248,0.5)', align: 'center', track: 2,
          });
        }
      }
      ctx.restore();
    }

    if (!moonBehind) drawEarth();
    // tether: Earth ↔ the face that always looks back
    if (pE > 0.05) {
      sightline(ctx, ocx, ocy, mx, my, t, { a: clamp(pE) * 0.8 });
    }
    moonBall(ctx, mx, my, mr, { rot, tilt, sun: sunV, glow: 0.35, shine: 0.05, relief: 1 - 0.3 * pX });
    // spin graticule (card 0)
    graticule(ctx, mx, my, mr, { rot, tilt, a: 0.22 * (1 - pX) * eo(P(t, 0.5, 0.6)) });
    // near-side marker: the point of the Moon facing Earth
    if (pX > 0.5) {
      const ex = -Math.cos(th);
      const ey = Math.sin(th) * Math.sin(ELEV);
      const ez = -Math.sin(th) * Math.cos(ELEV);
      const vis = clamp((ez + 0.1) / 0.3) * clamp((pX - 0.5) / 0.5);
      const px = mx + ex * mr * 0.92;
      const py = my - ey * mr * 0.92;
      ctx.save();
      ctx.globalAlpha *= vis;
      ctx.fillStyle = HUD.amber;
      ctx.shadowColor = 'rgba(255,176,58,0.9)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    if (moonBehind) drawEarth();
    // front half of the ellipse over everything behind
    const pO2 = eo(P(t, t1 + 0.25, 0.9));
    if (pO2 > 0.01) {
      ctx.save();
      ctx.globalAlpha *= pO2;
      ctx.strokeStyle = 'rgba(150,190,240,0.42)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(ocx, ocy, rx, ry, 0, 0, Math.PI);
      ctx.stroke();
      strokeArc(ctx, ocx, ocy, rx, ry, -Math.PI / 2, th, true);
      ctx.restore();
    }
  });

  // card 0 overlays: spin arrow, axis
  const a0 = (1 - pX) * eo(P(t, 0.45, 0.6));
  if (a0 > 0.01) {
    plane(ctx, cam, 0.85, () => {
      const sweep = io(P(t, 0.6, 1.4));
      arcArrow(ctx, mx, my, mr * 1.16, Math.PI * 0.62, Math.PI * 0.62 + sweep * Math.PI * 0.85, {
        a: a0, lw: 6, head: 24, glowC: 'rgba(255,176,58,0.7)',
      });
      ctx.save();
      ctx.globalAlpha *= a0;
      ctx.strokeStyle = 'rgba(214,230,248,0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(mx, my - mr * 1.32);
      ctx.lineTo(mx, my + mr * 1.32);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      mono(ctx, 'POROS', mx + 16, my - mr * 1.24, { size: 20, color: HUD.text, a: a0 });
      chip(ctx, 'BERPUTAR PADA POROSNYA', mx, my + mr + 120, P(t, 0.8, 0.5), { a: a0, color: HUD.amber });
      brackets(ctx, mx - mr * 1.42, my - mr * 1.42, mr * 2.84, mr * 2.84, P(t, 0.2, 0.7), { a: 0.5 * a0 });
    });
  }

  // hero: 27,3 HARI (rolls with the spoken number)
  const r0 = wordT(scene, 0, 2);
  const r1 = wordT(scene, 0, 7);
  const val = (tt) => 27.3 * io(P(tt, r0, r1 - r0));
  const v = val(t);
  const aH = eo(P(t, scene.captions[0].from, 0.4));
  if (aH > 0.01) {
    const w = roll(ctx, v, 104, 440, { size: 210, font: F.display, color: HUD.bone, decimals: 1, a: aH, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'HARI', 104 + w + 18, 440, { size: 64, font: F.display, color: HUD.amber, alpha: aH * eo(P(t, r1 - 0.2, 0.4)) });
    txt(ctx, pX < 0.5 ? 'SATU KALI PUTAR' : 'SATU KALI PUTAR = SATU KALI ORBIT', 110, 492, {
      size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aH,
    });
  }

  // twin gauges top-right: PUTAR and ORBIT fill together (card 1)
  const aG = eo(P(t, t1 + 0.4, 0.6));
  if (aG > 0.01) {
    const gp = lap;
    const eqT = wordT(scene, 1, 9, -0.05);
    const eq = eo(P(t, eqT, 0.5));
    for (const [k, lab] of [[0, 'PUTAR'], [1, 'ORBIT']]) {
      const gx = 1010 + k * 230;
      const gy = 340;
      donut(ctx, gx, gy, 62, 12, [{ v: gp, color: k ? HUD.ice : HUD.amber, glow: true }], 1, { a: aG });
      txt(ctx, (27.3 * gp).toFixed(1).replace('.', ','), gx, gy + 12, { size: 34, font: F.num, color: HUD.bone, align: 'center', alpha: aG });
      mono(ctx, lab, gx, gy + 104, { size: 21, color: HUD.text, align: 'center', a: aG, track: 5 });
      mono(ctx, 'HARI', gx, gy + 132, { size: 17, color: HUD.sub, align: 'center', a: aG, track: 3 });
    }
    txt(ctx, '=', 1125, 356, { size: 64, font: F.display, color: HUD.amber, align: 'center', alpha: aG * (0.35 + 0.65 * eq), glowBlur: 30 * eq, glowColor: 'rgba(255,176,58,0.8)' });
    ringBurst(ctx, 1125, 340, P(t, eqT, 0.8), { r: 170 });
    chip(ctx, 'SAMA PERSIS', 1125, 530, P(t, eqT + 0.05, 0.5), { color: HUD.amber });
  }
  // orbit label
  const aL = eo(P(t, t1 + 0.9, 0.6));
  mono(ctx, 'BUMI', ocx, ocy + er + 52, { size: 22, color: HUD.text, align: 'center', a: aL, track: 6 });
  mono(ctx, 'TITIK = SISI YANG SAMA', ocx, ocy + ry + 150, { size: 20, color: HUD.amber, align: 'center', a: aL * 0.9, track: 4 });

  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
