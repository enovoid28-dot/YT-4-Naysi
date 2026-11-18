import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, limb, orbit, orbitPos } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';

// 04 — GOYANG (v2 pro)
// Elliptical orbit, wobbling Moon with terminator, animated 59% gauge.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
  const cam = shotCam(t, 1.0);

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  plane(ctx, cam, 0.2, () => starfield(ctx, { t, n: 260, seed: 47, band: 0.55, bandY: 750, bandH: 600 }));
  sheen(ctx, t, { period: 6.2, a: 0.05 });

  const cx = W / 2, cy = 860;
  const rx = 500, ry = 240;
  plane(ctx, cam, 0.5, () => {
    orbit(ctx, cx, cy, rx, ry, { a: 0.85 * a(0.15), color: 'rgba(150,190,240,0.30)', lw: 2.5 });
    // peri/apo markers
    const pP = orbitPos(cx, cy, rx, ry, 0, 0);
    const pA = orbitPos(cx, cy, rx, ry, Math.PI, 0);
    ctx.save();
    ctx.globalAlpha = a(0.4);
    ctx.fillStyle = S.amber;
    ctx.beginPath(); ctx.arc(pP.x, pP.y, 7, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(pA.x, pA.y, 7, 0, TAU); ctx.fill();
    ctx.restore();
  });
  plane(ctx, cam, 0.85, () => limb(ctx, cx, cy, 130, { a: a(0.05), t, glow: 0.9, clouds: 1, dawn: 0.2 }));

  const prog = ease.inOut(clamp((t - c(0)) / 7));
  const ang = -Math.PI / 2 + prog * TAU;
  const mp = orbitPos(cx, cy, rx, ry, ang, 0);
  const mr = 84;
  const wob = Math.sin(prog * TAU * 2) * 0.22;

  plane(ctx, cam, 1.0, () => {
    const drawM = () => {
      ctx.save();
      ctx.translate(mp.x, mp.y);
      ctx.rotate(wob);
      ctx.beginPath(); ctx.arc(0, 0, mr, 0, TAU); ctx.clip();
      const g = ctx.createRadialGradient(-mr * 0.45, -mr * 0.45, mr * 0.08, 0, 0, mr * 1.7);
      g.addColorStop(0, '#F0ECE0'); g.addColorStop(0.5, '#C8C4B8'); g.addColorStop(0.85, '#7A7670'); g.addColorStop(1, '#3A3834');
      ctx.fillStyle = g;
      ctx.fillRect(-mr * 1.5, -mr * 1.5, mr * 3, mr * 3);
      const craters = [[-0.35, -0.25, 0.18], [0.2, -0.1, 0.14], [-0.15, 0.3, 0.12], [0.35, 0.3, 0.10]];
      craters.forEach(([dx, dy, r]) => {
        ctx.fillStyle = 'rgba(70,68,62,0.45)';
        ctx.beginPath(); ctx.arc(dx * mr, dy * mr, r * mr, 0, TAU); ctx.fill();
      });
      const tg = ctx.createLinearGradient(-mr, -mr, mr * 0.7, mr * 0.7);
      tg.addColorStop(0, 'rgba(3,5,10,0)'); tg.addColorStop(0.6, 'rgba(3,5,10,0.25)'); tg.addColorStop(1, 'rgba(3,5,10,0.7)');
      ctx.fillStyle = tg;
      ctx.fillRect(-mr, -mr, mr * 2, mr * 2);
      ctx.restore();
    };
    ghosts(ctx, { dx: (mp.x - cx) * 0.05, dy: (mp.y - cy) * 0.05, n: 3, spread: 1, alpha: 0.12 }, drawM);
    ctx.save(); ctx.globalAlpha = a(0.15); drawM(); ctx.restore();
    // wobble arrows
    ctx.save();
    ctx.globalAlpha = a(c(1));
    ctx.strokeStyle = S.amber; ctx.lineWidth = 4;
    ctx.shadowColor = S.amber; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(mp.x, mp.y, mr + 26, -0.5 + wob, 0.5 + wob); ctx.stroke();
    ctx.beginPath(); ctx.arc(mp.x, mp.y, mr + 26, Math.PI - 0.5 + wob, Math.PI + 0.5 + wob); ctx.stroke();
    ctx.restore();
  });

  tracking(ctx, 'ORBIT ELIPS', cx, cy - 340, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });
  tracking(ctx, 'BULAN BERGOYANG', mp.x, mp.y - mr - 70, { size: 20, font: F.mono6, track: 5, color: S.amber, align: 'center', alpha: a(c(1)) });

  // 59% gauge with needle sweep
  const pPie = land(t, c(1, 0.2), 0.9);
  const px = W / 2, py = 1380, pr = 170;
  ctx.save();
  ctx.globalAlpha = clamp(pPie);
  ctx.strokeStyle = 'rgba(150,190,240,0.30)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.stroke();
  ctx.shadowColor = S.amber; ctx.shadowBlur = 20;
  ctx.fillStyle = S.amber;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(px, py, pr, -Math.PI / 2, -Math.PI / 2 + TAU * 0.59 * clamp(pPie));
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  // needle at 59% edge
  const na = -Math.PI / 2 + TAU * 0.59 * clamp(pPie);
  ctx.strokeStyle = S.bone; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(na) * pr, py + Math.sin(na) * pr); ctx.stroke();
  txt(ctx, '59%', px, py + 18, { size: 110, font: F.display, color: S.void, align: 'center' });
  ctx.restore();
  tracking(ctx, 'YANG BISA KITA INTIP', W / 2, py + pr + 60, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.65), align: 'center', alpha: a(c(1, 0.2)) });
  tracking(ctx, 'BUKAN CUMA SETENGAH', W / 2, py + pr + 96, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'center', alpha: a(c(1, 0.2)) });
}

export default { draw: drawScene };
