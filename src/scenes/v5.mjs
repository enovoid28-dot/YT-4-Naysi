import { W, H, txt, hexA, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { S, starfield, sunDisc } from './_space.mjs';
import { cue, ease } from './_kertas.mjs';
import { plane, sheen, land } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';

// 05 — 1959 (v2 pro)
// Photographic sun with corona, two Moons with terminators, animated rays,
// stamp with ink texture.
function drawScene(ctx, t, scene) {
  const c = (i, o = 0) => cue(scene, i, o);
  const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
  const cam = shotCam(t, 1.0);

  ctx.fillStyle = S.void;
  ctx.fillRect(-240, -240, W + 480, H + 480);
  plane(ctx, cam, 0.2, () => starfield(ctx, { t, n: 260, seed: 59, band: 0.55, bandY: 700, bandH: 600 }));
  sheen(ctx, t, { period: 6.8, a: 0.05 });

  plane(ctx, cam, 0.4, () => sunDisc(ctx, W / 2, 420, 90, { a: a(0.05), t, rays: 1, tone: 1 }));

  const my = 900, mr = 200;
  const lx = W / 2 - 340, rx = W / 2 + 340;
  const p0 = land(t, 0.05, 0.8);
  const p1 = land(t, c(0, 0.1), 0.8);

  const moon = (x, al, label, sub, bright) => {
    ctx.save();
    ctx.globalAlpha = clamp(al);
    ctx.beginPath(); ctx.arc(x, my, mr, 0, TAU); ctx.clip();
    const g = ctx.createRadialGradient(x - mr * 0.45, my - mr * 0.45, mr * 0.08, x, my, mr * 1.7);
    g.addColorStop(0, bright ? '#F5F1E6' : '#E0DCD0');
    g.addColorStop(0.5, bright ? '#C8C4B8' : '#A8A49A');
    g.addColorStop(0.85, '#6A6660'); g.addColorStop(1, '#2E2C28');
    ctx.fillStyle = g;
    ctx.fillRect(x - mr * 1.5, my - mr * 1.5, mr * 3, mr * 3);
    const craters = [[-0.35, -0.25, 0.18], [0.2, -0.1, 0.14], [-0.15, 0.3, 0.12], [0.35, 0.3, 0.10], [0.05, -0.45, 0.09], [-0.45, 0.15, 0.08]];
    craters.forEach(([dx, dy, r]) => {
      ctx.fillStyle = 'rgba(70,68,62,0.45)';
      ctx.beginPath(); ctx.arc(x + dx * mr, my + dy * mr, r * mr, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(245,241,230,0.30)';
      ctx.beginPath(); ctx.arc(x + dx * mr - r * mr * 0.25, my + dy * mr - r * mr * 0.25, r * mr * 0.55, 0, TAU); ctx.fill();
    });
    const tg = ctx.createLinearGradient(x - mr, my - mr, x + mr * 0.7, my + mr * 0.7);
    tg.addColorStop(0, 'rgba(3,5,10,0)'); tg.addColorStop(0.6, 'rgba(3,5,10,0.25)'); tg.addColorStop(1, 'rgba(3,5,10,0.7)');
    ctx.fillStyle = tg;
    ctx.fillRect(x - mr, my - mr, mr * 2, mr * 2);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = clamp(al);
    ctx.strokeStyle = 'rgba(240,236,224,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, my, mr, 0, TAU); ctx.stroke();
    ctx.restore();
    tracking(ctx, label, x, my + mr + 56, { size: 22, font: F.mono6, track: 5, color: hexA(S.bone, 0.75), align: 'center' });
    tracking(ctx, sub, x, my + mr + 92, { size: 18, font: F.mono6, track: 4, color: S.amber, align: 'center' });
  };

  plane(ctx, cam, 1.0, () => {
    moon(lx, p0, 'DEKAT', 'SELALU KITA LIHAT', false);
    moon(rx, p1, 'JAUH', 'KENA MATAHARI SAMA', true);
  });

  // animated sun rays (dash offset marches)
  ctx.save();
  ctx.globalAlpha = a(c(0)) * 0.8;
  ctx.strokeStyle = 'rgba(255,210,122,0.6)'; ctx.lineWidth = 3;
  ctx.setLineDash([10, 12]);
  ctx.lineDashOffset = -t * 30;
  ctx.beginPath(); ctx.moveTo(W / 2, 520); ctx.lineTo(lx, my - mr - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2, 520); ctx.lineTo(rx, my - mr - 20); ctx.stroke();
  ctx.restore();

  // 1959 stamp with ink edge
  const pS = land(t, c(1, 0.1), 0.7);
  ctx.save();
  ctx.globalAlpha = clamp(pS);
  ctx.translate(rx, my - mr - 120);
  ctx.rotate(-0.06);
  ctx.shadowColor = S.ember; ctx.shadowBlur = 16;
  ctx.strokeStyle = S.ember; ctx.lineWidth = 5;
  ctx.strokeRect(-190, -56, 380, 112);
  ctx.shadowBlur = 0;
  txt(ctx, '1959', 0, 22, { size: 84, font: F.display, color: S.ember, align: 'center' });
  tracking(ctx, 'LUNA 3', 0, 78, { size: 20, font: F.mono6, track: 6, color: S.ember, align: 'center' });
  ctx.restore();

  tracking(ctx, 'BUKAN SISI GELAP', W / 2, 1420, { size: 22, font: F.mono6, track: 6, color: S.amber, align: 'center', alpha: a(c(0)) });
}

export default { draw: drawScene };
