import { W, H, txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { HUD, roll, mono, chip, callout, hudFrame, wordT, dimension } from './_bulan.mjs';
import { dbGauge, earSection, steamer, volcanoIcon, shockRing } from './_krakatau.mjs';

// 03 — 170 dB
// Card 0: a sound-level gauge, the needle climbs past every reference point
// and pegs; the glass cracks. Card 1: the ear in section — pressure rings
// come down the canal, the eardrum shakes, then tears — 64 km from the blast.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const sm = (p) => EASE.smooth(clamp(p));

function backdrop(ctx, t, cam) {
  const g = ctx.createRadialGradient(W / 2, 1000, 80, W / 2, 1000, 1700);
  g.addColorStop(0, '#121A26');
  g.addColorStop(0.55, '#090D15');
  g.addColorStop(1, '#040609');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // engineering grid
  ctx.save();
  ctx.translate((cam.dx || 0) * 0.3, (cam.dy || 0) * 0.3);
  ctx.strokeStyle = 'rgba(150,190,240,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const t0 = scene.captions[0].from;
  const tSeratus = wordT(scene, 0, 3);
  const tDb = wordT(scene, 0, 6);
  const t1 = wordT(scene, 1, 0, -0.1);
  const tKm = wordT(scene, 1, 3);
  const tGend = wordT(scene, 1, 5);
  const tPecah = wordT(scene, 1, 8, -0.05);
  const torn = t > tPecah;
  const shk = torn ? 18 * Math.pow(1 - P(t, tPecah, 0.9), 2) : 0;

  backdrop(ctx, t, cam);
  ctx.save();
  if (shk > 0.1) ctx.translate(Math.sin(t * 80) * shk, Math.cos(t * 67) * shk);

  // the gauge: big in card 0, an inset in card 1
  const pI = io(P(t, t1 - 0.2, 0.8));
  const gx = lerp(720, 1150, pI);
  const gy = lerp(1060, 420, pI);
  const gR = lerp(400, 132, pI);
  // the needle and the big number are one value: they can never disagree
  const val0 = (tt) => 170 * io(P(tt, tSeratus - 0.35, tDb + 0.2 - (tSeratus - 0.35)));
  const needle = (tt) => {
    if (tt <= tDb + 0.2) return Math.max(4, val0(tt) + 2 * io(P(tt, tDb - 0.2, 0.4)));
    return 172 + 9 * Math.exp(-(tt - tDb - 0.2) * 2.6) * Math.cos((tt - tDb - 0.2) * 17);
  };
  plane(ctx, cam, 0.8, () => {
    dbGauge(ctx, gx, gy, gR, needle(t), t, {
      p: P(t, 0.05, 0.8), crack: P(t, tDb + 0.12, 0.35), refs: P(t, 0.5, 1.8) * (1 - pI),
    });
  });

  // card 1: the ear
  const aE = eo(P(t, t1, 0.6));
  if (aE > 0.01) {
    const ex = 780 + (1 - aE) * 140;
    const ey = 1000;
    const vib = P(t, t1 + 0.5, 1.3);
    const anc = earSection(ctx, ex, ey, 1.0, t, {
      a: aE, vib: torn ? 0 : vib, wave: P(t, t1 + 0.3, 0.5) * (1 - 0.6 * P(t, tPecah + 0.4, 0.8)), rupture: P(t, tPecah, 0.75),
    });
    callout(ctx, anc.drum[0], anc.drum[1] + 62, anc.drum[0] - 60, 1330, 330, P(t, tKm - 0.2, 0.7), {
      label: 'GENDANG TELINGA', value: torn ? 'PECAH' : 'bergetar', side: 'left', vsize: 36, accent: torn ? '#FF5A4A' : HUD.amber,
    });
    callout(ctx, anc.bones[0], anc.bones[1] - 30, anc.bones[0] + 40, 760, 300, P(t, tKm + 0.2, 0.7), {
      label: 'TULANG PENDENGARAN', value: 'martil · landasan · sanggurdi', side: 'right', vsize: 26,
    });
    callout(ctx, anc.cochlea[0] + 40, anc.cochlea[1] + 60, anc.cochlea[0] + 60, 1250, 200, P(t, tKm + 0.6, 0.7), {
      label: 'KOKLEA', value: 'telinga dalam', side: 'right', vsize: 26,
    });
  }

  // the 64 km strip: volcano → ship, a front running between them
  const aS = eo(P(t, t1 + 0.2, 0.6));
  if (aS > 0.01) {
    const y = 1468;
    volcanoIcon(ctx, 196, y, 0.75, t, { a: aS });
    steamer(ctx, 1170, y - 4, 0.62, t, { a: aS, color: torn ? '#FFB0A6' : '#C9D6E2' });
    dimension(ctx, 290, y - 60, 1060, y - 60, P(t, tKm - 0.3, 0.8), { label: '64 KM', a: aS });
    const fq = P(t, tKm, tPecah - tKm);
    if (fq > 0 && fq < 1) {
      const fx = lerp(270, 1110, fq);
      ctx.save();
      ctx.beginPath();
      ctx.rect(240, y - 150, 900, 170);
      ctx.clip();
      shockRing(ctx, fx - 420, y - 40, 420, { a: aS * 0.9, w: 16 });
      ctx.restore();
    }
    mono(ctx, 'KAPAL NORHAM CASTLE · 1883', 1170, y + 44, { size: 18, color: HUD.sub, align: 'center', a: aS, track: 3 });
  }
  ctx.restore();

  // red pulse when it tears
  if (torn) {
    const q = 1 - P(t, tPecah, 1.1);
    if (q > 0.01) {
      ctx.save();
      const vg = ctx.createRadialGradient(W / 2, 1050, 300, W / 2, 1050, 1400);
      vg.addColorStop(0, 'rgba(255,40,30,0)');
      vg.addColorStop(1, `rgba(255,40,30,${0.42 * q})`);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  // hero numbers
  const a0 = eo(P(t, t0 - 0.1, 0.4)) * (1 - eo(P(t, t1 - 0.2, 0.3)));
  if (a0 > 0.01) {
    const w = roll(ctx, val0(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: a0, track: -6, prev: val0(t - 1 / 90) });
    const pp = eo(P(t, tDb, 0.3));
    txt(ctx, '+', 104 + w + 6, 430, { size: 120, font: F.display, color: '#FF6E5E', alpha: a0 * pp });
    txt(ctx, 'dB', 104 + w + 18 + 72 * pp, 440, { size: 78, font: F.display, color: HUD.amber, alpha: a0 });
    txt(ctx, 'DIUKUR 160 KM DARI KRAKATAU', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: a0 });
  }
  const a1 = eo(P(t, t1, 0.4));
  if (a1 > 0.01) {
    const val = (tt) => 64 * io(P(tt, t1 + 0.05, tKm + 0.3 - t1));
    const w = roll(ctx, val(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: a1, track: -6, prev: val(t - 1 / 90) });
    txt(ctx, 'KM', 104 + w + 18, 440, { size: 78, font: F.display, color: HUD.amber, alpha: a1 });
    txt(ctx, 'JAUHNYA · TETAP MEMECAHKAN GENDANG TELINGA', 110, 492, { size: 23, font: F.mono6, color: HUD.amber, track: 4, alpha: a1 });
    chip(ctx, 'LEBIH DARI SEPARUH AWAK KAPAL', 104, 568, P(t, tPecah + 0.3, 0.5), { align: 'left', color: '#FF8A6A' });
  }
  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
