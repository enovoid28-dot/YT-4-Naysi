import { W, H, txt, hexA, linGrad, radGrad, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, earth, orbit, orbitPos } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';

// 01 — WAJAH SAMA
// Earth in the middle, Moon circling it, one dot on the Moon that always
// faces Earth. The dot is the argument: same face, every orbit.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  starfield(ctx, { t, n: 260, seed: 11, band: 0.7, bandY: 900 });

  const cx = W / 2, cy = 860;
  const rx = 470, ry = 300;

  orbit(ctx, cx, cy, rx, ry, { a: 0.9 * a(0.2), color: 'rgba(150,190,240,0.30)', lw: 2.5 });
  // progress arc
  const prog = ease.inOut(clamp((t - c(0)) / 6));
  orbit(ctx, cx, cy, rx, ry, { a: 0.95, color: S.amber, lw: 4, prog, from: -Math.PI / 2 });

  earth(ctx, cx, cy, 150, { a: a(0.05), t });

  // Moon position on orbit
  const ang = -Math.PI / 2 + prog * TAU;
  const mp = orbitPos(cx, cy, rx, ry, ang, 0);
  const mr = 92;

  // Moon disc
  ctx.save();
  ctx.globalAlpha = a(0.1);
  ctx.beginPath();
  ctx.arc(mp.x, mp.y, mr, 0, TAU);
  ctx.clip();
  const g = radGrad(ctx, mp.x - mr * 0.4, mp.y - mr * 0.4, mr * 0.1, mr * 1.6, [[0, '#E8E4D8'], [0.6, '#B8B4A8'], [1, '#5A5852']]);
  ctx.fillStyle = g;
  ctx.fillRect(mp.x - mr, mp.y - mr, mr * 2, mr * 2);
  // craters
  ctx.fillStyle = 'rgba(60,58,52,0.35)';
  [[-0.3, -0.2, 0.16], [0.25, 0.15, 0.12], [-0.1, 0.35, 0.10], [0.4, -0.3, 0.08]].forEach(([dx, dy, r]) => {
    ctx.beginPath(); ctx.arc(mp.x + dx * mr, mp.y + dy * mr, r * mr, 0, TAU); ctx.fill();
  });
  ctx.restore();

  // the locked dot: always on the Earth-facing side
  const dx = cx - mp.x, dy = cy - mp.y;
  const dl = Math.hypot(dx, dy) || 1;
  const dotX = mp.x + (dx / dl) * mr * 0.62;
  const dotY = mp.y + (dy / dl) * mr * 0.62;
  ctx.save();
  ctx.globalAlpha = a(c(1));
  ctx.fillStyle = S.amber;
  ctx.beginPath(); ctx.arc(dotX, dotY, 14, 0, TAU); ctx.fill();
  ctx.strokeStyle = S.amber; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(dotX, dotY, 24, 0, TAU); ctx.stroke();
  // leader to Earth
  ctx.strokeStyle = 'rgba(255,176,58,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.moveTo(dotX, dotY); ctx.lineTo(cx, cy); ctx.stroke();
  ctx.restore();

  // labels
  tracking(ctx, 'BUMI', cx, cy + 210, { size: 22, font: F.mono6, track: 6, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });
  tracking(ctx, 'BULAN', mp.x, mp.y - mr - 36, { size: 22, font: F.mono6, track: 6, color: hexA(S.bone, 0.6), align: 'center', alpha: a(c(1)) });
  tracking(ctx, 'SISI YANG SAMA', dotX, dotY + 52, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'center', alpha: a(c(1)) });

  // big number
  const pBig = ease.expo(clamp((t - c(0, 0.1)) / 0.7));
  txt(ctx, '1', 104, 420, { size: 300, font: F.display, color: S.bone, alpha: pBig, track: -10 });
  tracking(ctx, 'WAJAH · SELAMANYA', 104, 470, { size: 24, font: F.mono6, track: 7, color: S.amber, alpha: pBig });
}

export default { draw: drawScene };
