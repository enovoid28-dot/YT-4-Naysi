import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, limb } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';
import { plane, sheen, land } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';

// 03 — REM (v2 pro)
// Bulge with terminator, torque vectors with glow, spin streaks fading out,
// speed meter with needle.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
  const cam = shotCam(t, 1.0);

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  plane(ctx, cam, 0.2, () => starfield(ctx, { t, n: 240, seed: 31, band: 0.5, bandY: 700, bandH: 550 }));
  sheen(ctx, t, { period: 6.0, a: 0.05 });

  const cx = W / 2, cy = 900;
  plane(ctx, cam, 0.7, () => {
    limb(ctx, cx, cy + 260, 170, { a: a(0.05), t, glow: 1, clouds: 1, dawn: 0.3 });
    tracking(ctx, 'BUMI', cx, cy + 500, { size: 22, font: F.mono6, track: 6, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });
  });

  const mx = cx, my = cy - 180;
  const mr = 150;
  const slow = ease.inOut(clamp((t - c(1)) / 5));
  const bulge = 0.18 + slow * 0.10;
  const spinBlur = (1 - slow) * 0.55;

  plane(ctx, cam, 1.0, () => {
    ctx.save();
    ctx.globalAlpha = a(0.1);
    ctx.fillStyle = '#C8C4B8';
    ctx.beginPath();
    ctx.ellipse(mx, my, mr * (1 - bulge * 0.4), mr * (1 + bulge), 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, TAU);
    ctx.clip();
    const g = ctx.createRadialGradient(mx - mr * 0.45, my - mr * 0.45, mr * 0.08, mx, my, mr * 1.7);
    g.addColorStop(0, '#F0ECE0'); g.addColorStop(0.5, '#C8C4B8'); g.addColorStop(0.85, '#7A7670'); g.addColorStop(1, '#3A3834');
    ctx.fillStyle = g;
    ctx.fillRect(mx - mr * 1.5, my - mr * 1.5, mr * 3, mr * 3);
    const craters = [[-0.35, -0.25, 0.18], [0.2, -0.1, 0.14], [-0.15, 0.3, 0.12], [0.35, 0.3, 0.10], [0.05, -0.45, 0.09]];
    craters.forEach(([dx, dy, r]) => {
      ctx.fillStyle = 'rgba(70,68,62,0.45)';
      ctx.beginPath(); ctx.arc(mx + dx * mr, my + dy * mr, r * mr, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(240,236,224,0.35)';
      ctx.beginPath(); ctx.arc(mx + dx * mr - r * mr * 0.25, my + dy * mr - r * mr * 0.25, r * mr * 0.55, 0, TAU); ctx.fill();
    });
    if (spinBlur > 0.02) {
      ctx.strokeStyle = `rgba(232,228,216,${spinBlur * 0.5})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const ang = t * (2.2 - slow * 1.8) + i * (TAU / 6);
        ctx.beginPath();
        ctx.arc(mx, my, mr * (0.55 + i * 0.08), ang, ang + 0.7);
        ctx.stroke();
      }
    }
    const tg = ctx.createLinearGradient(mx - mr, my - mr, mx + mr * 0.7, my + mr * 0.7);
    tg.addColorStop(0, 'rgba(3,5,10,0)'); tg.addColorStop(0.6, 'rgba(3,5,10,0.25)'); tg.addColorStop(1, 'rgba(3,5,10,0.7)');
    ctx.fillStyle = tg;
    ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    ctx.restore();

    // torque vectors with glow
    const pT = land(t, c(1, 0.2), 0.6);
    ctx.save();
    ctx.globalAlpha = clamp(pT);
    ctx.shadowColor = S.amber; ctx.shadowBlur = 14;
    ctx.strokeStyle = S.amber; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(mx, my + mr * 1.15); ctx.lineTo(mx, my + mr * 1.55); ctx.stroke();
    ctx.fillStyle = S.amber;
    ctx.beginPath(); ctx.moveTo(mx - 12, my + mr * 1.55); ctx.lineTo(mx + 12, my + mr * 1.55); ctx.lineTo(mx, my + mr * 1.55 + 20); ctx.fill();
    ctx.shadowColor = S.ember;
    ctx.strokeStyle = S.ember;
    ctx.beginPath(); ctx.arc(mx, my, mr * 1.45, -0.4, 1.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx + Math.cos(1.2) * mr * 1.45, my + Math.sin(1.2) * mr * 1.45);
    ctx.lineTo(mx + Math.cos(1.2) * mr * 1.45 - 18, my + Math.sin(1.2) * mr * 1.45 + 4);
    ctx.lineTo(mx + Math.cos(1.2) * mr * 1.45 - 4, my + Math.sin(1.2) * mr * 1.45 + 18);
    ctx.stroke();
    ctx.restore();
  });

  tracking(ctx, 'TONJOLAN = PEGANGAN', mx, my - mr - 90, { size: 20, font: F.mono6, track: 5, color: S.amber, align: 'center', alpha: a(c(1, 0.2)) });
  tracking(ctx, 'GRAVITASI MENARIK · PUTARAN MELAMBAT', W / 2, 1560, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: a(c(1)) });

  // speed meter with needle
  const mw = 900, mx0 = (W - mw) / 2, my0 = 1640;
  ctx.save();
  ctx.globalAlpha = a(c(1));
  ctx.fillStyle = 'rgba(20,30,48,0.55)';
  ctx.strokeStyle = 'rgba(150,190,240,0.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(mx0 - 16, my0 - 16, mw + 32, 46, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = S.amber;
  ctx.shadowColor = S.amber; ctx.shadowBlur = 12;
  ctx.fillRect(mx0, my0, mw * (1 - slow), 14);
  ctx.shadowBlur = 0;
  // needle
  const nx = mx0 + mw * (1 - slow);
  ctx.fillStyle = S.bone;
  ctx.beginPath(); ctx.arc(nx, my0 + 7, 10, 0, TAU); ctx.fill();
  tracking(ctx, 'CEPAT', mx0, my0 + 52, { size: 18, font: F.mono6, track: 4, color: hexA(S.bone, 0.55) });
  tracking(ctx, 'TERKUNCI', mx0 + mw, my0 + 52, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'right' });
  ctx.restore();
}

export default { draw: drawScene };
