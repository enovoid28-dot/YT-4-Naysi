import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, earth, orbit, orbitPos } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';

// 07 — TERKUNCI
// Not still. Locked. The same face, forever, by physics.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  starfield(ctx, { t, n: 260, seed: 79, band: 0.7, bandY: 850 });

  const cx = W / 2, cy = 880;
  const rx = 460, ry = 290;
  orbit(ctx, cx, cy, rx, ry, { a: 0.9 * a(0.15), color: 'rgba(150,190,240,0.30)', lw: 2.5 });
  earth(ctx, cx, cy, 140, { a: a(0.05), t });

  const prog = ease.inOut(clamp((t - c(0)) / 6));
  const ang = -Math.PI / 2 + prog * TAU;
  const mp = orbitPos(cx, cy, rx, ry, ang, 0);
  const mr = 88;

  ctx.save();
  ctx.globalAlpha = a(0.1);
  ctx.beginPath(); ctx.arc(mp.x, mp.y, mr, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(mp.x - mr * 0.4, mp.y - mr * 0.4, mr * 0.1, mp.x, mp.y, mr * 1.6);
  g.addColorStop(0, '#E8E4D8'); g.addColorStop(0.6, '#B8B4A8'); g.addColorStop(1, '#5A5852');
  ctx.fillStyle = g;
  ctx.fillRect(mp.x - mr * 1.4, mp.y - mr * 1.4, mr * 2.8, mr * 2.8);
  ctx.fillStyle = 'rgba(60,58,52,0.35)';
  [[-0.3, -0.2, 0.16], [0.25, 0.15, 0.12]].forEach(([dx, dy, r]) => {
    ctx.beginPath(); ctx.arc(mp.x + dx * mr, mp.y + dy * mr, r * mr, 0, TAU); ctx.fill();
  });
  ctx.restore();

  // lock symbol: chain link between Earth and Moon
  const pL = ease.expo(clamp((t - c(0, 0.2)) / 0.6));
  ctx.save();
  ctx.globalAlpha = pL;
  const lx = (cx + mp.x) / 2, ly = (cy + mp.y) / 2;
  ctx.strokeStyle = S.amber; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(lx, ly, 30, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(lx + 34, ly, 30, 0, TAU); ctx.stroke();
  ctx.restore();

  tracking(ctx, 'BUMI', cx, cy + 200, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });
  tracking(ctx, 'BULAN', mp.x, mp.y - mr - 40, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });

  // big word
  const pBig = ease.expo(clamp((t - c(0, 0.1)) / 0.7));
  txt(ctx, 'TERKUNCI', 104, 420, { size: 190, font: F.display, color: S.bone, alpha: pBig, track: -6 });
  tracking(ctx, 'BUKAN DIAM · TAPI TERKUNCI', 104, 470, { size: 22, font: F.mono6, track: 6, color: S.amber, alpha: pBig });

  // CTA
  const pC = ease.expo(clamp((t - c(1, 0.1)) / 0.7));
  ctx.save();
  ctx.globalAlpha = pC;
  ctx.fillStyle = 'rgba(20,30,48,0.55)';
  ctx.strokeStyle = 'rgba(255,176,58,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(104, 1360, W - 208, 220, 18); ctx.fill(); ctx.stroke();
  tracking(ctx, 'TULIS DI KOMENTAR', 144, 1420, { size: 20, font: F.mono6, track: 5, color: S.amber });
  txt(ctx, 'Kamu lihat Bulan purnama dari mana?', 144, 1500, { size: 52, font: F.head, color: S.bone });
  ctx.restore();
}

export default { draw: drawScene };
