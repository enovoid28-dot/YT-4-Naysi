import { W, txt, hexA } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import {
  HUD, deepSky, moonBall, reticle, brackets, callout, scanBeam, roll, hero, mono, chip,
  dimension, hudFrame, wordT, rrPath,
} from './_bulan.mjs';

// 01 — WAJAH SAMA (v3)
// Cold open on a photographic Moon: scan, lock, measure. The lifetime count
// rolls to ~866 full moons; then the frame splits: the side we know, and a
// redacted far side — 41 % of the Moon no one on Earth ever sees.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 1.1);
  deepSky(ctx, t, cam, { seed: 11, band: 0.75, bandY: 760 });

  const tSplit = wordT(scene, 1, 0, -0.05); // "Tapi"
  const pS = io(P(t, tSplit, 0.9));
  const push = io(P(t, 0, 7.8));
  const mx = lerp(720, 470, pS);
  const my = lerp(1060, 1040, pS);
  const mr = lerp(380 + push * 22, 292, pS);
  const ex = eo(P(t, 0.0, 0.9));

  // the Moon
  plane(ctx, cam, 0.85, () => {
    moonBall(ctx, mx, my, mr, {
      rot: -0.012 + Math.sin(t * 0.35) * 0.004,
      tilt: 2,
      sun: { x: -0.72, y: 0.36, z: 0.6 },
      exposure: 0.25 + 0.75 * ex,
      shine: 0.07,
      glow: 0.45,
    });
    scanBeam(ctx, mx, my, mr, P(t, 0.12, 1.15), { a: 0.9 });
    reticle(ctx, mx, my, mr, t, P(t, 0.35, 1.0) * (1 - 0.65 * pS), { spin: 0.05, label: pS < 0.5 ? 'TARGET · BULAN' : null });
    brackets(ctx, mx - mr * 1.32, my - mr * 1.32, mr * 2.64, mr * 2.64, P(t, 0.25, 0.7), { a: 0.75 * (1 - pS) });
  });

  // measurements on the first sentence
  const c0 = scene.captions[0].from;
  const aMeas = 1 - eo(P(t, tSplit - 0.1, 0.45));
  plane(ctx, cam, 1.0, () => {
    const a1 = -2.35;
    callout(ctx, mx + Math.cos(a1) * mr, my + Math.sin(a1) * mr, 330, 560, 226, P(t, c0 + 0.1, 0.9), {
      label: 'JARAK RATA-RATA', value: '384.400 km', side: 'left', a: aMeas, pulse: t * 0.8,
    });
    const a2 = -0.62;
    callout(ctx, mx + Math.cos(a2) * mr, my + Math.sin(a2) * mr, 1150, 600, 186, P(t, c0 + 0.45, 0.9), {
      label: 'DIAMETER', value: '3.474 km', side: 'right', a: aMeas, pulse: t * 0.8 + 0.4,
    });
    dimension(ctx, mx - mr, my + mr + 70, mx + mr, my + mr + 70, P(t, c0 + 0.8, 0.8), { label: '27 % UKURAN BUMI', a: aMeas });
  });

  // lifetime count → 41 %
  const cnt = (tt) => 866 * io(P(tt, wordT(scene, 0, 1), wordT(scene, 0, 5) + 0.5 - wordT(scene, 0, 1)));
  const aCount = eo(P(t, c0 - 0.1, 0.5)) * (1 - eo(P(t, tSplit, 0.4)));
  if (aCount > 0.01) {
    ctx.save();
    ctx.translate(0, -eo(P(t, tSplit, 0.4)) * 60);
    roll(ctx, cnt(t), 104, 440, { size: 210, font: F.display, color: HUD.bone, a: aCount, track: -6, prev: cnt(t - 1 / 90) });
    txt(ctx, '± PURNAMA DALAM 70 TAHUN', 110, 492, { size: 25, font: F.mono6, color: HUD.amber, track: 6, alpha: aCount });
    ctx.restore();
  }
  hero(ctx, '41%', 'TIDAK PERNAH TERLIHAT DARI BUMI', 104, 440, P(t, wordT(scene, 1, 2, -0.05), 0.8), { size: 210 });

  // the side we never see
  const pF = eo(P(t, tSplit + 0.35, 0.8));
  if (pF > 0.01) {
    const fx = 1072;
    const fy = 1040;
    const fr = 238;
    plane(ctx, cam, 0.7, () => {
      ctx.save();
      ctx.globalAlpha *= pF;
      ctx.translate(fx, fy);
      ctx.scale(0.85 + 0.15 * pF, 0.85 + 0.15 * pF);
      // dark disc with static
      const gr = ctx.createRadialGradient(-fr * 0.3, -fr * 0.3, fr * 0.1, 0, 0, fr);
      gr.addColorStop(0, '#141B2A');
      gr.addColorStop(1, '#070A12');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(0, 0, fr, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, fr, 0, TAU);
      ctx.clip();
      ctx.strokeStyle = 'rgba(160,190,230,0.10)';
      ctx.lineWidth = 3;
      const off = (t * 26) % 22;
      for (let k = -fr * 2; k < fr * 2; k += 22) {
        ctx.beginPath();
        ctx.moveTo(k + off - fr, -fr);
        ctx.lineTo(k + off + fr, fr);
        ctx.stroke();
      }
      // scanline static band
      const sy = ((t * 180) % (fr * 2.4)) - fr * 1.2;
      const sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
      sg.addColorStop(0, 'rgba(160,200,255,0)');
      sg.addColorStop(0.5, 'rgba(160,200,255,0.12)');
      sg.addColorStop(1, 'rgba(160,200,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(-fr, sy - 40, fr * 2, 80);
      ctx.restore();
      ctx.strokeStyle = 'rgba(168,206,248,0.55)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([14, 12]);
      ctx.lineDashOffset = -t * 30;
      ctx.beginPath();
      ctx.arc(0, 0, fr, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      const pulse = 0.75 + 0.25 * Math.sin(t * 3.2);
      txt(ctx, '?', 0, fr * 0.36, { size: fr * 1.05, font: F.display, color: HUD.amber, align: 'center', glowBlur: 40 * pulse, glowColor: 'rgba(255,176,58,0.7)' });
      ctx.restore();
    });
    const la = eo(P(t, tSplit + 0.7, 0.6));
    mono(ctx, 'SISI DEKAT', 470, 1420, { size: 24, color: HUD.text, align: 'center', a: la, track: 5 });
    mono(ctx, 'SELALU MENGHADAP BUMI', 470, 1458, { size: 19, color: HUD.amber, align: 'center', a: la, track: 3 });
    mono(ctx, 'SISI JAUH', 1072, 1420, { size: 24, color: HUD.text, align: 'center', a: la, track: 5 });
    mono(ctx, 'DATA: TIDAK ADA', 1072, 1458, { size: 19, color: 'rgba(255,90,74,0.9)', align: 'center', a: la, track: 3 });
    chip(ctx, 'TERSEMBUNYI', 1072, 760, P(t, wordT(scene, 1, 5, -0.1), 0.5), { color: HUD.red });
  }

  hudFrame(ctx, t, g.t ?? t, { cam });
}

export default { draw: drawScene };
