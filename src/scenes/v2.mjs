import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, earth, orbit, orbitPos } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';

// 02 — 27,3 HARI
// Two clocks, one number. Rotation and orbit are the same duration.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  starfield(ctx, { t, n: 220, seed: 23, band: 0.5, bandY: 800 });

  // two panels
  const p0 = ease.expo(clamp((t - 0.05) / 0.7));
  const p1 = ease.expo(clamp((t - c(1, 0.1)) / 0.7));

  const panel = (x, y, w, h, al, label, sub) => {
    ctx.save();
    ctx.globalAlpha = al;
    ctx.fillStyle = 'rgba(20,30,48,0.55)';
    ctx.strokeStyle = 'rgba(150,190,240,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 18);
    ctx.fill(); ctx.stroke();
    tracking(ctx, label, x + w / 2, y + 64, { size: 20, font: F.mono6, track: 6, color: hexA(S.bone, 0.55), align: 'center' });
    txt(ctx, '27,3', x + w / 2, y + 300, { size: 190, font: F.display, color: S.bone, align: 'center', track: -8 });
    tracking(ctx, sub, x + w / 2, y + 360, { size: 20, font: F.mono6, track: 5, color: S.amber, align: 'center' });
    ctx.restore();
  };

  panel(104, 520, 560, 460, p0, 'PUTAR', 'HARI');
  panel(W - 104 - 560, 520, 560, 460, p1, 'ORBIT', 'HARI');

  // equals
  const pe = ease.expo(clamp((t - c(1, 0.3)) / 0.5));
  txt(ctx, '=', W / 2, 760, { size: 160, font: F.display, color: S.amber, align: 'center', alpha: pe });
  tracking(ctx, 'SAMA PERSIS', W / 2, 830, { size: 22, font: F.mono6, track: 7, color: S.amber, align: 'center', alpha: pe });

  // orbit diagram below
  const cx = W / 2, cy = 1320;
  const rx = 420, ry = 190;
  orbit(ctx, cx, cy, rx, ry, { a: 0.8 * a(0.2), color: 'rgba(150,190,240,0.30)', lw: 2.5 });
  earth(ctx, cx, cy, 110, { a: a(0.1), t });
  const prog = ease.inOut(clamp((t - c(0)) / 7));
  const ang = -Math.PI / 2 + prog * TAU;
  const mp = orbitPos(cx, cy, rx, ry, ang, 0);
  ctx.save();
  ctx.globalAlpha = a(0.15);
  ctx.fillStyle = '#D8D4C8';
  ctx.beginPath(); ctx.arc(mp.x, mp.y, 56, 0, TAU); ctx.fill();
  ctx.restore();
  // rotation arrow on Moon (one turn per orbit)
  ctx.save();
  ctx.strokeStyle = S.amber; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(mp.x, mp.y, 78, ang, ang + TAU * 0.75);
  ctx.stroke();
  const ax = mp.x + Math.cos(ang + TAU * 0.75) * 78;
  const ay = mp.y + Math.sin(ang + TAU * 0.75) * 78;
  ctx.fillStyle = S.amber;
  ctx.beginPath(); ctx.arc(ax, ay, 9, 0, TAU); ctx.fill();
  ctx.restore();
  tracking(ctx, 'SATU PUTARAN = SATU ORBIT', W / 2, 1620, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.55), align: 'center', alpha: a(c(1)) });
}

export default { draw: drawScene };
