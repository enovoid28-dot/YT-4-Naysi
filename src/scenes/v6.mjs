import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, earth } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';

// 06 — REM BUMI
// The Moon brakes Earth too. A day was 4 hours. Now 24. Still lengthening.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  starfield(ctx, { t, n: 200, seed: 67, band: 0.4, bandY: 700 });

  const cx = W / 2, cy = 820;
  earth(ctx, cx, cy, 240, { a: a(0.05), t });
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

  // Moon receding
  const mx = cx + 420, my = cy - 120;
  ctx.save();
  ctx.globalAlpha = a(c(0));
  ctx.fillStyle = '#D8D4C8';
  ctx.beginPath(); ctx.arc(mx, my, 70, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,176,58,0.6)'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.moveTo(cx + 240, cy - 40); ctx.lineTo(mx - 80, my + 20); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = S.amber;
  ctx.beginPath(); ctx.arc(mx - 80, my + 20, 8, 0, TAU); ctx.fill();
  ctx.restore();
  tracking(ctx, 'MENJAUH 3,8 CM/TAHUN', mx, my - 110, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'center', alpha: a(c(0)) });

  // day timeline 4 -> 24
  const p0 = ease.expo(clamp((t - 0.05) / 0.7));
  const p1 = ease.expo(clamp((t - c(1, 0.1)) / 0.7));
  const panel = (x, y, w, h, al, big, sub) => {
    ctx.save();
    ctx.globalAlpha = al;
    ctx.fillStyle = 'rgba(20,30,48,0.55)';
    ctx.strokeStyle = 'rgba(150,190,240,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.stroke();
    txt(ctx, big, x + w / 2, y + 200, { size: 150, font: F.display, color: S.bone, align: 'center', track: -6 });
    tracking(ctx, sub, x + w / 2, y + 260, { size: 20, font: F.mono6, track: 5, color: S.amber, align: 'center' });
    ctx.restore();
  };
  panel(104, 1240, 560, 340, p0, '4 JAM', 'DULU');
  panel(W - 104 - 560, 1240, 560, 340, p1, '24 JAM', 'SEKARANG');
  const pe = ease.expo(clamp((t - c(1, 0.3)) / 0.5));
  txt(ctx, '→', W / 2, 1420, { size: 90, font: F.display, color: S.amber, align: 'center', alpha: pe });
  tracking(ctx, 'TERUS MEMANJANG', W / 2, 1660, { size: 20, font: F.mono6, track: 5, color: hexA(S.bone, 0.6), align: 'center', alpha: a(c(1)) });
}

export default { draw: drawScene };
