import { W, H, txt, hexA, linGrad, radGrad, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, limb, orbit, orbitPos } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';

// 01 — WAJAH SAMA (v2 pro)
// Earth with atmosphere, Moon with terminator + crater field, camera push,
// parallax planes, motion-blurred orbit, locked dot with leader.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
  const cam = shotCam(t, 1.1);

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);

  plane(ctx, cam, 0.2, () => starfield(ctx, { t, n: 300, seed: 11, band: 0.85, bandY: 900, bandH: 700 }));
  sheen(ctx, t, { period: 6.5, a: 0.05 });

  const cx = W / 2, cy = 880;
  const rx = 470, ry = 300;
  const prog = ease.inOut(clamp((t - c(0)) / 6));
  const ang = -Math.PI / 2 + prog * TAU;
  const mp = orbitPos(cx, cy, rx, ry, ang, 0);
  const mr = 92;

  plane(ctx, cam, 0.5, () => {
    orbit(ctx, cx, cy, rx, ry, { a: 0.9 * a(0.2), color: 'rgba(150,190,240,0.28)', lw: 2.5 });
    orbit(ctx, cx, cy, rx, ry, { a: 0.95, color: S.amber, lw: 4, prog, from: -Math.PI / 2 });
    // orbit ticks
    ctx.save();
    ctx.globalAlpha = 0.5 * a(0.4);
    ctx.strokeStyle = 'rgba(150,190,240,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const aa = (i / 12) * TAU;
      const p0 = orbitPos(cx, cy, rx, ry, aa, 0);
      const p1 = orbitPos(cx, cy, rx * 1.035, ry * 1.035, aa, 0);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
    ctx.restore();
  });

  plane(ctx, cam, 0.85, () => {
    const pE = land(t, 0.05, 0.9);
    ctx.save();
    ctx.globalAlpha = clamp(pE);
    limb(ctx, cx, cy, 150, { a: clamp(pE), t, glow: 1, clouds: 1, dawn: 0.3 });
    ctx.restore();
    tracking(ctx, 'BUMI', cx, cy + 220, { size: 22, font: F.mono6, track: 6, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });
  });

  // Moon with motion blur along orbit
  plane(ctx, cam, 1.0, () => {
    const drawMoon = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, mr, 0, TAU);
      ctx.clip();
      const g = radGrad(ctx, mp.x - mr * 0.45, mp.y - mr * 0.45, mr * 0.05, mr * 1.7, [[0, '#F0ECE0'], [0.45, '#C8C4B8'], [0.8, '#8A867E'], [1, '#3A3834']]);
      ctx.fillStyle = g;
      ctx.fillRect(mp.x - mr * 1.5, mp.y - mr * 1.5, mr * 3, mr * 3);
      // crater field (deterministic)
      const craters = [[-0.35, -0.25, 0.18], [0.2, -0.1, 0.14], [-0.15, 0.3, 0.12], [0.35, 0.3, 0.10], [0.05, -0.45, 0.09], [-0.45, 0.15, 0.08], [0.45, -0.35, 0.07], [-0.05, 0.05, 0.06]];
      craters.forEach(([dx, dy, r], i) => {
        ctx.fillStyle = 'rgba(70,68,62,0.45)';
        ctx.beginPath(); ctx.arc(mp.x + dx * mr, mp.y + dy * mr, r * mr, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(240,236,224,0.35)';
        ctx.beginPath(); ctx.arc(mp.x + dx * mr - r * mr * 0.25, mp.y + dy * mr - r * mr * 0.25, r * mr * 0.55, 0, TAU); ctx.fill();
      });
      // terminator: night side away from sun (upper-left)
      const tg = linGrad(ctx, mp.x - mr, mp.y - mr, mp.x + mr * 0.7, mp.y + mr * 0.7, [[0, 'rgba(3,5,10,0)'], [0.55, 'rgba(3,5,10,0.25)'], [1, 'rgba(3,5,10,0.72)']]);
      ctx.fillStyle = tg;
      ctx.fillRect(mp.x - mr, mp.y - mr, mr * 2, mr * 2);
      ctx.restore();
      // limb glow
      ctx.save();
      ctx.strokeStyle = 'rgba(240,236,224,0.25)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mp.x, mp.y, mr, 0, TAU); ctx.stroke();
      ctx.restore();
    };
    ghosts(ctx, { dx: (mp.x - cx) * 0.06, dy: (mp.y - cy) * 0.06, n: 4, spread: 1, alpha: 0.12 }, drawMoon);
    ctx.save();
    ctx.globalAlpha = a(0.1);
    drawMoon();
    ctx.restore();
  });

  // locked dot with pulsing ring + leader
  const dx = cx - mp.x, dy = cy - mp.y;
  const dl = Math.hypot(dx, dy) || 1;
  const dotX = mp.x + (dx / dl) * mr * 0.62;
  const dotY = mp.y + (dy / dl) * mr * 0.62;
  const pDot = ease.expo(clamp((t - c(1)) / 0.6));
  ctx.save();
  ctx.globalAlpha = pDot;
  const pulse = 1 + Math.sin(t * 3) * 0.12;
  ctx.fillStyle = S.amber;
  ctx.shadowColor = S.amber; ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.arc(dotX, dotY, 14, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = S.amber; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(dotX, dotY, 24 * pulse, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,176,58,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.moveTo(dotX, dotY); ctx.lineTo(cx, cy); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  tracking(ctx, 'BULAN', mp.x, mp.y - mr - 40, { size: 22, font: F.mono6, track: 6, color: hexA(S.bone, 0.65), align: 'center', alpha: a(c(1)) });
  tracking(ctx, 'SISI YANG SAMA', dotX, dotY + 56, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'center', alpha: a(c(1)) });

  // big number lands with overshoot
  const pBig = land(t, c(0, 0.1), 0.8);
  ctx.save();
  ctx.globalAlpha = clamp(pBig);
  txt(ctx, '1', 104, 420, { size: 300, font: F.display, color: S.bone, track: -10 });
  ctx.restore();
  tracking(ctx, 'WAJAH · SELAMANYA', 104, 470, { size: 24, font: F.mono6, track: 7, color: S.amber, alpha: a(c(0, 0.1)) });
}

export default { draw: drawScene };
