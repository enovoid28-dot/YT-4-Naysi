import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure, labelChip,
  groundShadow,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { basket } from '../art/vehicles.mjs';
import { spotlight, dustMotes, badge } from '../art/parts.mjs';
import { clamp, lerp, EASE, spring, rng, TAU, noise1 } from '../engine/anim.mjs';

function room(ctx, t) {
  const g = linGrad(ctx, 0, 0, 0, 1800, [
    [0, '#100B09'],
    [0.45, '#1C1310'],
    [1, '#0A0708'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 1800);

  // wallpaper panels
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let x = 0; x < W; x += 90) {
    ctx.fillStyle = '#FFD9A0';
    ctx.fillRect(x, 0, 1.5, 1800);
  }
  ctx.restore();

  // floor
  const fy = 1430;
  const fg = linGrad(ctx, 0, fy, 0, 1800, [
    [0, '#241713'],
    [1, '#0B0708'],
  ]);
  ctx.fillStyle = fg;
  ctx.fillRect(0, fy, W, 370);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,200,150,0.05)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, fy + 30 + i * 62);
    ctx.lineTo(W, fy + 30 + i * 62);
    ctx.stroke();
  }
  ctx.restore();
}

function tag(ctx, t, o) {
  const { x, y, w, h, rot, alpha, side, stringTo = -60 } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);

  // strings
  ctx.strokeStyle = 'rgba(230,214,186,0.42)';
  ctx.lineWidth = 3;
  [-w * 0.32, w * 0.32].forEach((dx) => {
    ctx.beginPath();
    ctx.moveTo(dx, 0);
    ctx.lineTo(dx * 1.15, stringTo);
    ctx.stroke();
  });

  // hole
  ctx.save();
  ctx.fillStyle = '#0E0A08';
  ctx.beginPath();
  ctx.arc(0, 42, 14, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 42, 20, 0, TAU);
  ctx.stroke();
  ctx.restore();

  const isBack = side === 'back';
  const g = linGrad(ctx, -w / 2, 0, w / 2, h, [
    [0, isBack ? '#D8CBAC' : '#FAF2E0'],
    [0.6, isBack ? '#C9BB9C' : '#EFE4CC'],
    [1, isBack ? '#B4A387' : '#DCCFB2'],
  ]);
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 22;
  fillRR(ctx, -w / 2, 0, w, h, 18, g);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // clipped corner
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(w / 2 - 54, 0);
  ctx.lineTo(w / 2, 54);
  ctx.lineTo(w / 2, 0);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fill();
  ctx.restore();

  strokeRR(ctx, -w / 2 + 1, 1, w - 2, h - 2, 18, 'rgba(90,70,40,0.28)', 2);

  if (side === 'front') {
    tracking(ctx, 'TAHUN LALU', 0, 132, { size: 28, font: F.num6, track: 8, align: 'center', color: 'rgba(60,42,22,0.55)' });
    txt(ctx, '$100,00', 0, 268, { size: 124, font: F.num, color: '#171208', align: 'center' });
    tracking(ctx, '12 ITEM · 1 KERANJANG', 0, 336, {
      size: 22, font: F.num6, track: 4, align: 'center', color: 'rgba(60,42,22,0.45)',
    });
  } else {
    tracking(ctx, 'TAHUN INI', 0, 132, { size: 28, font: F.num6, track: 8, align: 'center', color: 'rgba(60,42,22,0.55)' });
    txt(ctx, '$103,70', 0, 268, { size: 124, font: F.num, color: '#171208', align: 'center' });
    tracking(ctx, '12 ITEM · HARGA SAMA', 0, 336, {
      size: 22, font: F.num6, track: 4, align: 'center', color: 'rgba(60,42,22,0.45)',
    });
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene) {
    const g = scene.captions;
    const b0 = g[0]?.words[0].start ?? 0.3;
    const b1 = g[1]?.words[0].start ?? 5;
    const b2 = g[2]?.words[0].start ?? 9;
    const b3 = g[3]?.words[0].start ?? 11;

    room(ctx, t);
    spotlight(ctx, W / 2, -120, 560, 1520, { color: '#FFD9A0', alpha: 0.2 });

    // tag flip around its top anchor
    const flipAt = b1 + 0.35;
    const flip = clamp((t - flipAt) / 0.85);
    const ang = EASE.inOutQuint(flip) * Math.PI;
    const rot = -0.07 + Math.sin(t * 0.9) * 0.035 + Math.sin(t * 2.1) * 0.008;
    const tagW = 640;
    const tagH = 380;
    const tagTop = 470;
    const scaleX = Math.cos(ang);
    const side = Math.abs(ang) > Math.PI / 2 ? 'back' : 'front';

    ctx.save();
    ctx.translate(W / 2, tagTop);
    ctx.scale(1, 1);
    const enters = spring(clamp((t - b0 + 0.15) / 1.1) * 1.05, 9, 0.5);
    ctx.translate(0, (1 - enters) * -160);
    ctx.save();
    ctx.scale(Math.max(0.02, Math.abs(scaleX)), 1);
    tag(ctx, t, {
      x: 0, y: 0, w: tagW, h: tagH, rot, alpha: 1, side, stringTo: -tagTop - 40,
    });
    ctx.restore();
    ctx.restore();

    // banner ribbon "HARGA BARU"
    const rb = spring(clamp((t - flipAt - 0.5) / 0.6) * 1.2, 12, 0.55);
    if (rb > 0.002) {
      ctx.save();
      ctx.globalAlpha *= clamp(rb * 2);
      ctx.translate(W / 2 + 250, tagTop + 40);
      ctx.rotate(-0.16);
      ctx.scale(rb, rb);
      fillRR(ctx, -130, -34, 260, 68, 8, C.red);
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      fillRR(ctx, -130, 18, 260, 16, 4, 'rgba(0,0,0,0.18)');
      tracking(ctx, 'HARGA BARU', 0, 12, { size: 26, font: F.num, track: 4, align: 'center', color: '#FFF3E4' });
      ctx.restore();
    }

    // basket on the floor
    const bp = spring(clamp((t - b0 + 0.4) / 1.2) * 1.05, 9, 0.55);
    if (bp > 0.002) {
      ctx.save();
      ctx.globalAlpha *= clamp(bp * 1.5);
      groundShadow(ctx, W / 2, 1585, 360, 60, 0.55);
      ctx.translate(W / 2, 1585 + (1 - bp) * 60);
      ctx.scale(1.06, 1.06);
      basket(ctx, { w: 520, rot: Math.sin(t * 0.8) * 0.008 });
      ctx.restore();
    }

    // same-items annotation
    const ap = clamp((t - b2 - 0.3) / 0.6);
    if (ap > 0) {
      ctx.save();
      ctx.globalAlpha *= EASE.outCubic(ap);
      labelChip(ctx, 'ISI SAMA · 12 ITEM', W / 2, 1660, {
        size: 26, font: F.num6, track: 5, padX: 26, padY: 14,
        bg: 'rgba(10,8,6,0.8)', border: hexA(C.mint, 0.35), color: hexA(C.bone, 0.92),
        dot: true, dotColor: C.mint, radius: 12, shadow: 26,
      });
      ctx.restore();
    }

    // difference badge
    const dp = spring(clamp((t - b3 - 0.15) / 0.7) * 1.15, 11, 0.6);
    if (dp > 0.002) {
      ctx.save();
      ctx.globalAlpha *= clamp(dp * 2);
      ctx.translate(W / 2 + 320, 900);
      ctx.scale(dp, dp);
      ctx.rotate(0.08);
      fillRR(ctx, -140, -56, 280, 112, 16, 'rgba(255,75,59,0.14)');
      strokeRR(ctx, -140, -56, 280, 112, 16, hexA(C.red, 0.65), 3);
      tracking(ctx, 'LEBIH MAHAL', 0, -16, { size: 22, font: F.num6, track: 4, align: 'center', color: hexA(C.red, 0.9) });
      txt(ctx, '+$3,70', 0, 42, { size: 46, font: F.num, color: C.bone, align: 'center' });
      ctx.restore();
    }

    dustMotes(ctx, t, { count: 70, area: [0, 200, W, 1500], alpha: 0.5, seed: 12 });
  },
};
