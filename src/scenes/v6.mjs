import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, limb } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';
import { plane, sheen, land } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';

// 06 — REM BUMI (v2 pro)
// Earth limb with clouds, receding Moon with trail, day timeline with markers.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
  const cam = shotCam(t, 1.0);

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  plane(ctx, cam, 0.2, () => starfield(ctx, { t, n: 240, seed: 67, band: 0.55, bandY: 700, bandH: 600 }));
  sheen(ctx, t, { period: 6.4, a: 0.05 });

  const cx = W / 2, cy = 820;
  plane(ctx, cam, 0.7, () => {
    limb(ctx, cx, cy, 240, { a: a(0.05), t, glow: 1, clouds: 1, dawn: 0.3 });
    // spin streaks slowing
    const slow = ease.inOut(clamp((t - c(1)) / 5));
    ctx.save();
    ctx.globalAlpha = a(0.1) * (1 - slow * 0.7);
    ctx.strokeStyle = 'rgba(150,190,240,0.5)'; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const ang = t * (1.6 - slow * 1.2) + i * (TAU / 4);
      ctx.beginPath();
      ctx.arc(cx, cy, 290, ang, ang + 0.6);
      ctx.stroke();
    }
    ctx.restore();
    tracking(ctx, 'BUMI', cx, cy + 320, { size: 22, font: F.mono6, track: 6, color: hexA(S.bone, 0.6), align: 'center', alpha: a(0.3) });
  });

  // receding Moon with trail
  const mx = cx + 420, my = cy - 120;
  plane(ctx, cam, 1.0, () => {
    ctx.save();
    ctx.globalAlpha = a(c(0));
    // trail
    ctx.strokeStyle = 'rgba(255,176,58,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([4, 10]);
    ctx.beginPath(); ctx.moveTo(cx + 240, cy - 40); ctx.lineTo(mx - 80, my + 20); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#D8D4C8';
    ctx.shadowColor = 'rgba(216,212,200,0.6)'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(mx, my, 70, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = S.amber;
    ctx.beginPath(); ctx.arc(mx - 80, my + 20, 8, 0, TAU); ctx.fill();
    ctx.restore();
  });
  tracking(ctx, 'MENJAUH 3,8 CM/TAHUN', mx, my - 110, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'center', alpha: a(c(0)) });

  // day timeline
  const p0 = land(t, 0.05, 0.8);
  const p1 = land(t, c(1, 0.1), 0.8);
  const panel = (x, y, w, h, al, big, sub, glow) => {
    ctx.save();
    ctx.globalAlpha = clamp(al);
    ctx.shadowColor = glow ? S.amber : 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = glow ? 26 : 16;
    ctx.fillStyle = 'rgba(20,30,48,0.62)';
    ctx.strokeStyle = glow ? 'rgba(255,176,58,0.5)' : 'rgba(150,190,240,0.24)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    txt(ctx, big, x + w / 2, y + 200, { size: 150, font: F.display, color: S.bone, align: 'center', track: -6 });
    tracking(ctx, sub, x + w / 2, y + 260, { size: 20, font: F.mono6, track: 5, color: S.amber, align: 'center' });
    ctx.restore();
  };
  plane(ctx, cam, 0.6, () => {
    panel(104, 1240, 560, 340, p0, '4 JAM', 'DULU', false);
    panel(W - 104 - 560, 1240, 560, 340, p1, '24 JAM', 'SEKARANG', true);
  });
  const pe = land(t, c(1, 0.3), 0.6);
  ctx.save();
  ctx.globalAlpha = clamp(pe);
  ctx.shadowColor = S.amber; ctx.shadowBlur = 16;
  txt(ctx, '→', W / 2, 1420, { size: 90, font: F.display, color: S.amber, align: 'center' });
  ctx.restore();
  tracking(ctx, 'TERUS MEMANJANG', W / 2, 1660, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.65), align: 'center', alpha: a(c(1)) });
}

export default { draw: drawScene };
