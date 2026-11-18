import { W, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import {
  HUD, deepSky, moonBall, earthBall, graticule, hero, mono, chip, arcArrow, ringBurst, hudFrame,
  wordT, callout, roll,
} from './_bulan.mjs';

// 03 — REM (v3)
// Card 0: 4,5 miliar tahun lalu — a young Moon spinning hard, speed streaks,
// gauge in the red. Card 1: top-down physics: Earth pulls the near tidal
// bulge, which the fast spin has carried ahead of the Earth–Moon line; that
// offset is a brake. The spin bleeds off, the bulge swings onto the line → PAS.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const D = Math.PI / 180;

function gauge(ctx, cx, cy, r, v, t, a) {
  // v: 0 = PAS (locked), 1 = CEPAT
  if (a <= 0.01) return;
  const a0 = Math.PI * 0.8;
  const a1 = Math.PI * 2.2;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.lineCap = 'butt';
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(160,190,230,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a1);
  ctx.stroke();
  // zones
  ctx.strokeStyle = 'rgba(95,227,192,0.85)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0, a0 + 0.22);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,90,74,0.8)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, a1 - 1.3, a1);
  ctx.stroke();
  for (let i = 0; i <= 40; i++) {
    const ang = a0 + (i / 40) * (a1 - a0);
    const major = i % 10 === 0;
    ctx.strokeStyle = major ? 'rgba(214,230,248,0.75)' : 'rgba(214,230,248,0.3)';
    ctx.lineWidth = major ? 2.4 : 1.3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * (r - 22), cy + Math.sin(ang) * (r - 22));
    ctx.lineTo(cx + Math.cos(ang) * (r - (major ? 40 : 30)), cy + Math.sin(ang) * (r - (major ? 40 : 30)));
    ctx.stroke();
  }
  const jitter = v > 0.6 ? Math.sin(t * 47) * 0.012 + Math.sin(t * 31) * 0.008 : 0;
  const na = a0 + clamp(v + jitter) * (a1 - a0);
  ctx.strokeStyle = HUD.bone;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255,240,220,0.6)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(cx - Math.cos(na) * 16, cy - Math.sin(na) * 16);
  ctx.lineTo(cx + Math.cos(na) * (r - 30), cy + Math.sin(na) * (r - 30));
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = HUD.amber;
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, TAU);
  ctx.fill();
  ctx.restore();
  mono(ctx, 'PAS', cx + Math.cos(a0) * (r + 30), cy + Math.sin(a0) * (r + 30) + 24, { size: 19, color: HUD.mint, align: 'center', a });
  mono(ctx, 'CEPAT', cx + Math.cos(a1) * (r + 26), cy + Math.sin(a1) * (r + 26) + 24, { size: 19, color: HUD.red, align: 'center', a });
  mono(ctx, 'PUTARAN', cx, cy + r * 0.62, { size: 20, color: HUD.text, align: 'center', a, track: 5 });
}

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 1.0);
  deepSky(ctx, t, cam, { seed: 37, band: 0.7, bandY: 1200, warm: 0.4 });

  const t1 = wordT(scene, 1, 0, -0.1); // "Gravitasi"
  const tPull = wordT(scene, 1, 2); // "menarik"
  const tBulge = wordT(scene, 1, 3); // "tonjolan"
  const tSlow = wordT(scene, 1, 5, 0.1); // "lalu"
  const tPas = wordT(scene, 1, 8); // "pas."
  const pX = io(P(t, t1 - 0.05, 1.0));

  // spin: fast, then braking to the locked rate
  const brake = io(P(t, tSlow, tPas + 0.25 - tSlow));
  const omega = 0.55 * (1 - brake); // turns per second (relative to the Earth line)
  const tb0 = tSlow;
  const tb1 = tPas + 0.25;
  // phase = ∫ω dt, closed form for the inOutQuad brake
  let phase;
  if (t < tb0) phase = 0.55 * t;
  else {
    const u = clamp((t - tb0) / (tb1 - tb0));
    const I = u < 0.5 ? u - (2 / 3) * u * u * u : 0.5 - (2 / 3) * Math.pow(1 - u, 3);
    phase = 0.55 * tb0 + 0.55 * (tb1 - tb0) * I;
  }
  const lag = 24 * D * (omega / 0.55) * eo(P(t, t1 + 0.6, 1.2)); // bulge carried ahead

  // positions
  const mx = lerp(720, 1010, pX);
  const my = lerp(1040, 1010, pX);
  const mr = lerp(300, 205, pX);
  const tilt = lerp(8, 55, pX);
  const sun = { x: -0.35, y: 0.55, z: 0.76 };
  const ex = lerp(-520, 130, eo(P(t, t1, 1.2)));
  const ey = 1010;
  const er = 340;

  // Earth
  plane(ctx, cam, 0.55, () => {
    if (pX > 0.01) {
      earthBall(ctx, ex, ey, er, { a: clamp(pX * 1.4), lon: 112 - t * 3, tilt: 50, sun, cloudLon: t * 1.5 });
    }
  });

  plane(ctx, cam, 0.8, () => {
    // gravity lines: Earth's limb → the near bulge
    // near-bulge tip: carried ahead of the Earth line by the (counter-clockwise) spin
    const bx = mx - Math.cos(lag) * mr * 1.28;
    const by = my + Math.sin(lag) * mr * 1.28;
    const pG = eo(P(t, tPull - 0.1, 0.7)) * pX;
    if (pG > 0.01) {
      ctx.save();
      ctx.globalAlpha *= pG;
      for (let k = -2; k <= 2; k++) {
        const sy = ey + k * 120;
        const sx = ex + Math.sqrt(Math.max(0, er * er - (k * 120) * (k * 120))) + 8;
        ctx.strokeStyle = k === 0 ? 'rgba(255,176,58,0.85)' : 'rgba(255,176,58,0.38)';
        ctx.lineWidth = k === 0 ? 3.4 : 2;
        ctx.setLineDash([16, 14]);
        ctx.lineDashOffset = t * 60; // flows toward Earth
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo((bx + sx) / 2, (by + sy) / 2 + k * 30, sx, sy);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
      mono(ctx, 'TARIKAN GRAVITASI', (ex + er + mx - mr) / 2 + 30, ey - 190, { size: 21, color: HUD.amber, align: 'center', a: pG, track: 4 });
    }

    // tidal bulge (exaggerated), behind the Moon
    const pB = eo(P(t, tBulge - 0.15, 0.6)) * pX;
    if (pB > 0.01) {
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(-lag);
      ctx.globalAlpha *= pB;
      const gr = ctx.createRadialGradient(0, 0, mr * 0.9, 0, 0, mr * 1.32);
      gr.addColorStop(0, 'rgba(255,176,58,0.0)');
      gr.addColorStop(0.5, 'rgba(255,176,58,0.18)');
      gr.addColorStop(1, 'rgba(255,176,58,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.ellipse(0, 0, mr * 1.3, mr * 1.02, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,176,58,0.85)';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.ellipse(0, 0, mr * 1.3, mr * 1.02, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      // bulge axis
      ctx.strokeStyle = 'rgba(255,176,58,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-mr * 1.45, 0);
      ctx.lineTo(mr * 1.45, 0);
      ctx.stroke();
      ctx.restore();
      // Earth–Moon line
      ctx.save();
      ctx.globalAlpha *= pB * 0.8;
      ctx.strokeStyle = 'rgba(214,230,248,0.45)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(mx - mr * 1.6, my);
      ctx.lineTo(mx + mr * 1.5, my);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // lag angle readout
      if (lag > 1.5 * D) {
        ctx.save();
        ctx.globalAlpha *= pB;
        ctx.strokeStyle = HUD.amber;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mx, my, mr * 1.5, Math.PI - lag, Math.PI, false);
        ctx.stroke();
        ctx.restore();
      }
    }

    // the Moon itself
    moonBall(ctx, mx, my, mr, { rot: -phase, tilt, sun, glow: 0.4, shine: 0.05 });
    graticule(ctx, mx, my, mr, { rot: -phase, tilt, a: 0.2 + 0.1 * (1 - pX) });

    // speed streaks while spinning fast (card 0)
    const aS = clamp(omega / 0.55) * (1 - pX * 0.6) * eo(P(t, 0.4, 0.6));
    if (aS > 0.02) {
      ctx.save();
      for (let k = 0; k < 5; k++) {
        const rr = mr * (1.12 + k * 0.07);
        const a0 = -phase * TAU * (1 + k * 0.08) + k * 1.3;
        const len = 0.9 + k * 0.12;
        for (let j = 0; j < 12; j++) {
          const f = j / 12;
          ctx.strokeStyle = `rgba(214,230,248,${0.32 * aS * (1 - f)})`;
          ctx.lineWidth = 2.2 * (1 - f * 0.7);
          ctx.beginPath();
          ctx.arc(mx, my, rr, a0 + f * len, a0 + (f + 1 / 12) * len);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // brake torque (against the spin)
    const pT = eo(P(t, tSlow - 0.2, 0.6)) * (1 - eo(P(t, tPas + 0.3, 0.5)));
    if (pT > 0.01) {
      arcArrow(ctx, mx, my, mr * 1.62, Math.PI * 0.12, Math.PI * 0.12 + 1.1 * pT, { a: pT, lw: 6, head: 24, color: HUD.red, glowC: 'rgba(255,90,74,0.7)' });
      mono(ctx, 'REM', mx + mr * 1.25, my + mr * 1.42, { size: 26, color: HUD.red, a: pT, track: 6 });
    }
    // callout on the near bulge
    callout(ctx, bx, by, mx - mr * 0.9, my + mr * 1.55, 250, P(t, tBulge, 0.9), {
      label: 'TONJOLAN TERDEKAT', value: 'ditarik Bumi', side: 'left', vsize: 32, a: pX,
    });
    ringBurst(ctx, mx, my, P(t, tPas, 0.9), { r: mr * 1.6, color: '95,227,192' });
  });

  // gauge (top-right)
  const aGauge = eo(P(t, 0.6, 0.6));
  gauge(ctx, 1150, 410, 118, lerp(0.08, 0.92, clamp(omega / 0.55)), t, aGauge);

  // hero: 4,5 miliar tahun lalu → REM
  const aA = eo(P(t, scene.captions[0].from, 0.5)) * (1 - eo(P(t, t1 - 0.1, 0.4)));
  if (aA > 0.01) {
    const val = (tt) => 4.5 * eo(P(tt, wordT(scene, 0, 0), 0.8));
    roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, decimals: 1, a: aA, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'MILIAR TAHUN LALU', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aA });
  }
  hero(ctx, 'REM', 'GRAVITASI × TONJOLAN', 104, 440, P(t, t1 + 0.1, 0.8), { size: 210 });
  chip(ctx, 'PAS · 1 PUTAR = 1 ORBIT', mx, 1500 - 40, P(t, tPas + 0.05, 0.5), { color: HUD.mint });
  if (pX > 0.5) mono(ctx, 'BUMI', 130, 1010 + er + 56, { size: 22, color: HUD.text, align: 'center', a: (pX - 0.5) * 2, track: 6 });

  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
