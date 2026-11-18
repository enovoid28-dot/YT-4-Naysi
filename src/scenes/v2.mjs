import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, limb, orbit, orbitPos } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';
import { plane, ghosts, sheen, land } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';

// 02 — 27,3 HARI (v2 pro)
// Two glass panels, equals with glow, orbit diagram with rotation arrow.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
  const cam = shotCam(t, 1.0);

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  plane(ctx, cam, 0.2, () => starfield(ctx, { t, n: 260, seed: 23, band: 0.6, bandY: 800, bandH: 600 }));
  sheen(ctx, t, { period: 5.8, a: 0.05 });

  const p0 = land(t, 0.05, 0.8);
  const p1 = land(t, c(1, 0.1), 0.8);

  const panel = (x, y, w, h, al, label, sub, glow) => {
    ctx.save();
    ctx.globalAlpha = clamp(al);
    ctx.shadowColor = glow ? S.amber : 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = glow ? 30 : 18;
    ctx.fillStyle = 'rgba(20,30,48,0.62)';
    ctx.strokeStyle = glow ? 'rgba(255,176,58,0.5)' : 'rgba(150,190,240,0.24)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    tracking(ctx, label, x + w / 2, y + 64, { size: 20, font: F.mono6, track: 6, color: hexA(S.bone, 0.6), align: 'center' });
    txt(ctx, '27,3', x + w / 2, y + 300, { size: 190, font: F.display, color: S.bone, align: 'center', track: -8 });
    tracking(ctx, sub, x + w / 2, y + 360, { size: 20, font: F.mono6, track: 5, color: S.amber, align: 'center' });
    ctx.restore();
  };

  plane(ctx, cam, 0.6, () => {
    panel(104, 520, 560, 460, p0, 'PUTAR', 'HARI', false);
    panel(W - 104 - 560, 520, 560, 460, p1, 'ORBIT', 'HARI', true);
  });

  const pe = land(t, c(1, 0.3), 0.6);
  ctx.save();
  ctx.globalAlpha = clamp(pe);
  ctx.shadowColor = S.amber; ctx.shadowBlur = 28;
  txt(ctx, '=', W / 2, 760, { size: 160, font: F.display, color: S.amber, align: 'center' });
  ctx.restore();
  tracking(ctx, 'SAMA PERSIS', W / 2, 830, { size: 22, font: F.mono6, track: 7, color: S.amber, align: 'center', alpha: a(c(1, 0.3)) });

  // orbit diagram
  const cx = W / 2, cy = 1320;
  const rx = 420, ry = 190;
  plane(ctx, cam, 0.9, () => {
    orbit(ctx, cx, cy, rx, ry, { a: 0.85 * a(0.2), color: 'rgba(150,190,240,0.30)', lw: 2.5 });
    limb(ctx, cx, cy, 110, { a: a(0.1), t, glow: 0.8, clouds: 1, dawn: 0.2 });
    const prog = ease.inOut(clamp((t - c(0)) / 7));
    const ang = -Math.PI / 2 + prog * TAU;
    const mp = orbitPos(cx, cy, rx, ry, ang, 0);
    const drawM = () => {
      ctx.save();
      ctx.beginPath(); ctx.arc(mp.x, mp.y, 56, 0, TAU); ctx.clip();
      const g = ctx.createRadialGradient(mp.x - 22, mp.y - 22, 6, mp.x, mp.y, 90);
      g.addColorStop(0, '#F0ECE0'); g.addColorStop(0.6, '#B8B4A8'); g.addColorStop(1, '#4A4844');
      ctx.fillStyle = g;
      ctx.fillRect(mp.x - 60, mp.y - 60, 120, 120);
      ctx.restore();
    };
    ghosts(ctx, { dx: (mp.x - cx) * 0.05, dy: (mp.y - cy) * 0.05, n: 3, spread: 1, alpha: 0.12 }, drawM);
    ctx.save(); ctx.globalAlpha = a(0.15); drawM(); ctx.restore();
    // rotation arrow (one turn per orbit)
    ctx.save();
    ctx.strokeStyle = S.amber; ctx.lineWidth = 4;
    ctx.shadowColor = S.amber; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(mp.x, mp.y, 78, ang, ang + TAU * 0.75); ctx.stroke();
    const ax = mp.x + Math.cos(ang + TAU * 0.75) * 78;
    const ay = mp.y + Math.sin(ang + TAU * 0.75) * 78;
    ctx.fillStyle = S.amber;
    ctx.beginPath(); ctx.arc(ax, ay, 9, 0, TAU); ctx.fill();
    ctx.restore();
  });
  tracking(ctx, 'SATU PUTARAN = SATU ORBIT', W / 2, 1620, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: a(c(1)) });
}

export default { draw: drawScene };
