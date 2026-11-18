import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, sunDisc } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';

// 05 — 1959
// The far side is not dark. Both sides get the same sun. Luna 3, 1959.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  starfield(ctx, { t, n: 200, seed: 59, band: 0.4, bandY: 700 });

  sunDisc(ctx, W / 2, 420, 90, { a: a(0.05), t, rays: 1 });

  // two Moons side by side
  const my = 900, mr = 200;
  const lx = W / 2 - 340, rx = W / 2 + 340;
  const p0 = ease.expo(clamp((t - 0.05) / 0.7));
  const p1 = ease.expo(clamp((t - c(0, 0.1)) / 0.7));

  const moon = (x, al, label, sub, bright) => {
    ctx.save();
    ctx.globalAlpha = al;
    ctx.beginPath(); ctx.arc(x, my, mr, 0, TAU); ctx.clip();
    const g = ctx.createRadialGradient(x - mr * 0.4, my - mr * 0.4, mr * 0.1, x, my, mr * 1.6);
    g.addColorStop(0, bright ? '#F0ECE0' : '#C8C4B8');
    g.addColorStop(0.6, bright ? '#C0BCAE' : '#98948A');
    g.addColorStop(1, '#4A4844');
    ctx.fillStyle = g;
    ctx.fillRect(x - mr * 1.4, my - mr * 1.4, mr * 2.8, mr * 2.8);
    ctx.fillStyle = 'rgba(60,58,52,0.35)';
    [[-0.3, -0.2, 0.16], [0.25, 0.15, 0.12], [-0.1, 0.35, 0.10]].forEach(([dx, dy, r]) => {
      ctx.beginPath(); ctx.arc(x + dx * mr, my + dy * mr, r * mr, 0, TAU); ctx.fill();
    });
    ctx.restore();
    tracking(ctx, label, x, my + mr + 56, { size: 22, font: F.mono6, track: 5, color: hexA(S.bone, 0.7), align: 'center' });
    tracking(ctx, sub, x, my + mr + 92, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'center' });
  };

  moon(lx, p0, 'DEKAT', 'SELALU KITA LIHAT', false);
  moon(rx, p1, 'JAUH', 'KENA MATAHARI SAMA', true);

  // sun rays to both
  ctx.save();
  ctx.globalAlpha = a(c(0)) * 0.7;
  ctx.strokeStyle = 'rgba(255,210,122,0.55)'; ctx.lineWidth = 3;
  ctx.setLineDash([8, 10]);
  ctx.beginPath(); ctx.moveTo(W / 2, 520); ctx.lineTo(lx, my - mr - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2, 520); ctx.lineTo(rx, my - mr - 20); ctx.stroke();
  ctx.restore();

  // 1959 stamp
  const pS = ease.expo(clamp((t - c(1, 0.1)) / 0.6));
  ctx.save();
  ctx.globalAlpha = pS;
  ctx.translate(rx, my - mr - 120);
  ctx.rotate(-0.06);
  ctx.strokeStyle = S.ember; ctx.lineWidth = 5;
  ctx.strokeRect(-190, -56, 380, 112);
  txt(ctx, '1959', 0, 22, { size: 84, font: F.display, color: S.ember, align: 'center' });
  tracking(ctx, 'LUNA 3', 0, 78, { size: 20, font: F.mono6, track: 6, color: S.ember, align: 'center' });
  ctx.restore();

  tracking(ctx, 'BUKAN SISI GELAP', W / 2, 1420, { size: 22, font: F.mono6, track: 6, color: S.amber, align: 'center', alpha: a(c(0)) });
}

export default { draw: drawScene };
