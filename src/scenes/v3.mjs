import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, earth } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';

// 03 — REM
// The bulge is the handle. Earth's gravity grips it and brakes the spin.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  starfield(ctx, { t, n: 200, seed: 31, band: 0.4, bandY: 700 });

  const cx = W / 2, cy = 900;
  earth(ctx, cx, cy + 260, 170, { a: a(0.05), t });
  tracking(ctx, 'BUMI', cx, cy + 500, { size: 22, font: F.mono6, track: 6, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });

  // Moon with bulge toward Earth (down)
  const mx = cx, my = cy - 180;
  const mr = 150;
  const slow = ease.inOut(clamp((t - c(1)) / 5));
  const bulge = 0.18 + slow * 0.10;
  const spinBlur = (1 - slow) * 0.5;

  ctx.save();
  ctx.globalAlpha = a(0.1);
  // bulge ellipse
  ctx.fillStyle = '#C8C4B8';
  ctx.beginPath();
  ctx.ellipse(mx, my, mr * (1 - bulge * 0.4), mr * (1 + bulge), 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, TAU);
  ctx.clip();
  const g = ctx.createRadialGradient(mx - mr * 0.4, my - mr * 0.4, mr * 0.1, mx, my, mr * 1.6);
  g.addColorStop(0, '#E8E4D8'); g.addColorStop(0.6, '#B8B4A8'); g.addColorStop(1, '#5A5852');
  ctx.fillStyle = g;
  ctx.fillRect(mx - mr * 1.4, my - mr * 1.4, mr * 2.8, mr * 2.8);
  // spin streaks (fast early, gone when locked)
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
  ctx.fillStyle = 'rgba(60,58,52,0.35)';
  [[-0.3, -0.2, 0.16], [0.25, 0.15, 0.12]].forEach(([dx, dy, r]) => {
    ctx.beginPath(); ctx.arc(mx + dx * mr, my + dy * mr, r * mr, 0, TAU); ctx.fill();
  });
  ctx.restore();

  // torque arrows
  const pT = ease.expo(clamp((t - c(1, 0.2)) / 0.6));
  ctx.save();
  ctx.globalAlpha = pT;
  ctx.strokeStyle = S.amber; ctx.lineWidth = 5;
  // arrow down (gravity on bulge)
  ctx.beginPath(); ctx.moveTo(mx, my + mr * 1.15); ctx.lineTo(mx, my + mr * 1.55); ctx.stroke();
  ctx.fillStyle = S.amber;
  ctx.beginPath(); ctx.moveTo(mx - 12, my + mr * 1.55); ctx.lineTo(mx + 12, my + mr * 1.55); ctx.lineTo(mx, my + mr * 1.55 + 20); ctx.fill();
  // curved brake arrow
  ctx.strokeStyle = S.ember;
  ctx.beginPath(); ctx.arc(mx, my, mr * 1.45, -0.4, 1.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx + Math.cos(1.2) * mr * 1.45, my + Math.sin(1.2) * mr * 1.45);
  ctx.lineTo(mx + Math.cos(1.2) * mr * 1.45 - 18, my + Math.sin(1.2) * mr * 1.45 + 4);
  ctx.lineTo(mx + Math.cos(1.2) * mr * 1.45 - 4, my + Math.sin(1.2) * mr * 1.45 + 18);
  ctx.stroke();
  ctx.restore();

  tracking(ctx, 'TONJOLAN = PEGANGAN', mx, my - mr - 90, { size: 20, font: F.mono6, track: 5, color: S.amber, align: 'center', alpha: pT });
  tracking(ctx, 'GRAVITASI MENARIK · PUTARAN MELAMBAT', W / 2, 1560, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.55), align: 'center', alpha: a(c(1)) });

  // speed meter: fast -> locked
  const mw = 900, mx0 = (W - mw) / 2, my0 = 1640;
  ctx.save();
  ctx.globalAlpha = a(c(1));
  ctx.strokeStyle = 'rgba(150,190,240,0.25)'; ctx.lineWidth = 2;
  ctx.strokeRect(mx0, my0, mw, 14);
  ctx.fillStyle = S.amber;
  ctx.fillRect(mx0, my0, mw * (1 - slow), 14);
  tracking(ctx, 'CEPAT', mx0, my0 + 44, { size: 18, font: F.mono6, track: 4, color: hexA(S.bone, 0.5) });
  tracking(ctx, 'TERKUNCI', mx0 + mw, my0 + 44, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'right' });
  ctx.restore();
}

export default { draw: drawScene };
