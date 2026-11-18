import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, earth, orbit, orbitPos } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';

// 04 — GOYANG
// Elliptical orbit + constant spin = wobble. We peek at 59%, not 50%.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  starfield(ctx, { t, n: 200, seed: 47, band: 0.4, bandY: 750 });

  const cx = W / 2, cy = 860;
  const rx = 500, ry = 240;
  orbit(ctx, cx, cy, rx, ry, { a: 0.85 * a(0.15), color: 'rgba(150,190,240,0.30)', lw: 2.5 });
  earth(ctx, cx, cy, 130, { a: a(0.05), t });

  // Moon moves at constant angular rate; orbit is elliptical -> wobble
  const prog = ease.inOut(clamp((t - c(0)) / 7));
  const ang = -Math.PI / 2 + prog * TAU;
  const mp = orbitPos(cx, cy, rx, ry, ang, 0);
  const mr = 84;
  // libration wobble: small rotation of the face
  const wob = Math.sin(prog * TAU * 2) * 0.22;

  ctx.save();
  ctx.globalAlpha = a(0.1);
  ctx.translate(mp.x, mp.y);
  ctx.rotate(wob);
  ctx.beginPath(); ctx.arc(0, 0, mr, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(-mr * 0.4, -mr * 0.4, mr * 0.1, 0, 0, mr * 1.6);
  g.addColorStop(0, '#E8E4D8'); g.addColorStop(0.6, '#B8B4A8'); g.addColorStop(1, '#5A5852');
  ctx.fillStyle = g;
  ctx.fillRect(-mr * 1.4, -mr * 1.4, mr * 2.8, mr * 2.8);
  ctx.fillStyle = 'rgba(60,58,52,0.35)';
  [[-0.3, -0.2, 0.16], [0.25, 0.15, 0.12]].forEach(([dx, dy, r]) => {
    ctx.beginPath(); ctx.arc(dx * mr, dy * mr, r * mr, 0, TAU); ctx.fill();
  });
  ctx.restore();

  // wobble arrows
  ctx.save();
  ctx.globalAlpha = a(c(1));
  ctx.strokeStyle = S.amber; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(mp.x, mp.y, mr + 26, -0.5 + wob, 0.5 + wob); ctx.stroke();
  ctx.beginPath(); ctx.arc(mp.x, mp.y, mr + 26, Math.PI - 0.5 + wob, Math.PI + 0.5 + wob); ctx.stroke();
  ctx.restore();

  tracking(ctx, 'ORBIT ELIPS', cx, cy - 340, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.55), align: 'center', alpha: a(0.3) });
  tracking(ctx, 'BULAN BERGOYANG', mp.x, mp.y - mr - 70, { size: 20, font: F.mono6, track: 5, color: S.amber, align: 'center', alpha: a(c(1)) });

  // 59% pie
  const pPie = ease.expo(clamp((t - c(1, 0.2)) / 0.8));
  const px = W / 2, py = 1380, pr = 170;
  ctx.save();
  ctx.globalAlpha = pPie;
  ctx.strokeStyle = 'rgba(150,190,240,0.30)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.stroke();
  ctx.fillStyle = S.amber;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(px, py, pr, -Math.PI / 2, -Math.PI / 2 + TAU * 0.59 * pPie);
  ctx.closePath(); ctx.fill();
  txt(ctx, '59%', px, py + 18, { size: 110, font: F.display, color: S.void, align: 'center' });
  ctx.restore();
  tracking(ctx, 'YANG BISA KITA INTIP', W / 2, py + pr + 60, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: pPie });
  tracking(ctx, 'BUKAN CUMA SETENGAH', W / 2, py + pr + 96, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'center', alpha: pPie });
}

export default { draw: drawScene };
