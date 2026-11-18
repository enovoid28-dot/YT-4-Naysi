import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, limb, orbit, orbitPos } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';

// 07 — TERKUNCI (v2 pro)
// Photographic Earth, terminator Moon, pulsing lock, CTA card with glow.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
  const cam = shotCam(t, 1.1);

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  plane(ctx, cam, 0.2, () => starfield(ctx, { t, n: 300, seed: 79, band: 0.85, bandY: 850, bandH: 700 }));
  sheen(ctx, t, { period: 6.5, a: 0.05 });

  const cx = W / 2, cy = 880;
  const rx = 460, ry = 290;
  plane(ctx, cam, 0.5, () => {
    orbit(ctx, cx, cy, rx, ry, { a: 0.9 * a(0.15), color: 'rgba(150,190,240,0.30)', lw: 2.5 });
    orbit(ctx, cx, cy, rx, ry, { a: 0.9, color: S.amber, lw: 4, prog: ease.inOut(clamp((t - c(0)) / 6)), from: -Math.PI / 2 });
  });
  plane(ctx, cam, 0.85, () => {
    limb(ctx, cx, cy, 140, { a: a(0.05), t, glow: 1, clouds: 1, dawn: 0.3 });
    tracking(ctx, 'BUMI', cx, cy + 200, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });
  });

  const prog = ease.inOut(clamp((t - c(0)) / 6));
  const ang = -Math.PI / 2 + prog * TAU;
  const mp = orbitPos(cx, cy, rx, ry, ang, 0);
  const mr = 88;

  plane(ctx, cam, 1.0, () => {
    const drawM = () => {
      ctx.save();
      ctx.beginPath(); ctx.arc(mp.x, mp.y, mr, 0, TAU); ctx.clip();
      const g = ctx.createRadialGradient(mp.x - mr * 0.45, mp.y - mr * 0.45, mr * 0.08, mp.x, mp.y, mr * 1.7);
      g.addColorStop(0, '#F0ECE0'); g.addColorStop(0.5, '#C8C4B8'); g.addColorStop(0.85, '#7A7670'); g.addColorStop(1, '#3A3834');
      ctx.fillStyle = g;
      ctx.fillRect(mp.x - mr * 1.5, mp.y - mr * 1.5, mr * 3, mr * 3);
      const craters = [[-0.35, -0.25, 0.18], [0.2, -0.1, 0.14], [-0.15, 0.3, 0.12], [0.35, 0.3, 0.10]];
      craters.forEach(([dx, dy, r]) => {
        ctx.fillStyle = 'rgba(70,68,62,0.45)';
        ctx.beginPath(); ctx.arc(mp.x + dx * mr, mp.y + dy * mr, r * mr, 0, TAU); ctx.fill();
      });
      const tg = ctx.createLinearGradient(mp.x - mr, mp.y - mr, mp.x + mr * 0.7, mp.y + mr * 0.7);
      tg.addColorStop(0, 'rgba(3,5,10,0)'); tg.addColorStop(0.6, 'rgba(3,5,10,0.25)'); tg.addColorStop(1, 'rgba(3,5,10,0.7)');
      ctx.fillStyle = tg;
      ctx.fillRect(mp.x - mr, mp.y - mr, mr * 2, mr * 2);
      ctx.restore();
    };
    ghosts(ctx, { dx: (mp.x - cx) * 0.05, dy: (mp.y - cy) * 0.05, n: 3, spread: 1, alpha: 0.12 }, drawM);
    ctx.save(); ctx.globalAlpha = a(0.15); drawM(); ctx.restore();
    tracking(ctx, 'BULAN', mp.x, mp.y - mr - 40, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });
  });

  // pulsing lock
  const pL = land(t, c(0, 0.2), 0.7);
  ctx.save();
  ctx.globalAlpha = clamp(pL);
  const lx = (cx + mp.x) / 2, ly = (cy + mp.y) / 2;
  const pulse = 1 + Math.sin(t * 3) * 0.10;
  ctx.strokeStyle = S.amber; ctx.lineWidth = 6;
  ctx.shadowColor = S.amber; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(lx, ly, 30 * pulse, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(lx + 34, ly, 30 * pulse, 0, TAU); ctx.stroke();
  ctx.restore();

  // big word lands
  const pBig = land(t, c(0, 0.1), 0.8);
  ctx.save();
  ctx.globalAlpha = clamp(pBig);
  txt(ctx, 'TERKUNCI', 104, 420, { size: 190, font: F.display, color: S.bone, track: -6 });
  ctx.restore();
  tracking(ctx, 'BUKAN DIAM · TAPI TERKUNCI', 104, 470, { size: 22, font: F.mono6, track: 6, color: S.amber, alpha: a(c(0, 0.1)) });

  // CTA card with glow
  const pC = land(t, c(1, 0.1), 0.8);
  ctx.save();
  ctx.globalAlpha = clamp(pC);
  ctx.shadowColor = S.amber; ctx.shadowBlur = 26;
  ctx.fillStyle = 'rgba(20,30,48,0.62)';
  ctx.strokeStyle = 'rgba(255,176,58,0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(104, 1360, W - 208, 220, 18); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  tracking(ctx, 'TULIS DI KOMENTAR', 144, 1420, { size: 20, font: F.mono6, track: 5, color: S.amber });
  txt(ctx, 'Kamu lihat Bulan purnama dari mana?', 144, 1500, { size: 52, font: F.head, color: S.bone });
  ctx.restore();
}

export default { draw: drawScene };
