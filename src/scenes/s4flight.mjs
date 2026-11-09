import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure, labelChip,
  groundShadow, burst,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { jet } from '../art/vehicles.mjs';
import { clamp, lerp, EASE, spring, rng, TAU, noise1 } from '../engine/anim.mjs';

function sky(ctx, t) {
  const g = linGrad(ctx, 0, 0, 0, H, [
    [0, '#120B22'],
    [0.22, '#3A1730'],
    [0.42, '#7A2C34'],
    [0.58, '#C25633'],
    [0.72, '#E8913F'],
    [0.86, '#F2C077'],
    [1, '#F7DFAE'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // sun disc
  const sunY = 1330;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const sg = radGrad(ctx, W * 0.68, sunY, 0, 420, [
    [0, 'rgba(255,235,190,0.85)'],
    [0.25, 'rgba(255,190,120,0.4)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = sg;
  ctx.fillRect(0, 700, W, 1000);
  ctx.fillStyle = 'rgba(255,244,214,0.9)';
  ctx.beginPath();
  ctx.arc(W * 0.68, sunY, 96, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // sun bands
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const y = sunY - 90 + i * 26;
    ctx.fillStyle = `rgba(30,10,20,${0.06 + i * 0.012})`;
    ctx.fillRect(W * 0.68 - 200, y, 400, 7);
  }
  ctx.restore();
}

function cloudPuff(ctx, x, y, s, color, alpha, rim = 'rgba(255,236,206,0.5)') {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const puffs = [
    [0, 0, 0.86], [-0.5, 0.14, 0.62], [0.52, 0.12, 0.58], [1.0, 0.26, 0.36],
    [-0.94, 0.26, 0.34], [0.26, -0.3, 0.44], [-0.2, 0.3, 0.4],
  ];
  // body
  ctx.fillStyle = color;
  for (const [dx, dy, r] of puffs) {
    ctx.beginPath();
    ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
  // lit rim on the sun side
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = rim;
  for (const [dx, dy, r] of puffs) {
    ctx.beginPath();
    ctx.arc(x + dx * s - r * s * 0.16, y + dy * s - r * s * 0.22, r * s * 0.72, 0, Math.PI * 2);
    ctx.fill();
  }
  // underside shade
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha *= 0.4;
  ctx.fillStyle = 'rgba(90,40,50,0.5)';
  for (const [dx, dy, r] of puffs) {
    if (dy < 0.05) continue;
    ctx.beginPath();
    ctx.arc(x + dx * s + r * s * 0.1, y + dy * s + r * s * 0.25, r * s * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene) {
    const b = scene.captions.map((c) => c.words[0].start);
    const b0 = b[0] ?? 0.5;
    const b1 = b[1] ?? 1.6;
    const b2 = (scene.captions[1]?.words.find((w) => /dua/i.test(w.text))?.start ?? 4) + 0.15;

    sky(ctx, t);

    // cloud layers
    cloudPuff(ctx, 260 + t * 10, 1160, 150, 'rgba(255,206,164,0.34)', 1, 'rgba(255,240,214,0.4)');
    cloudPuff(ctx, 1120 - t * 14, 1360, 180, 'rgba(255,220,186,0.3)', 1, 'rgba(255,244,220,0.36)');
    cloudPuff(ctx, 700 + t * 18, 1540, 210, 'rgba(255,226,196,0.32)', 1, 'rgba(255,246,226,0.4)');
    cloudPuff(ctx, 180 + t * 6, 700, 116, 'rgba(96,48,68,0.3)', 1, 'rgba(255,190,150,0.2)');
    cloudPuff(ctx, 1240 - t * 8, 600, 130, 'rgba(96,48,68,0.26)', 1, 'rgba(255,190,150,0.18)');
    cloudPuff(ctx, 980 + t * 22, 880, 84, 'rgba(255,214,172,0.22)', 1, 'rgba(255,244,220,0.3)');

    // jet flight path
    const flight = clamp((t - b0 + 1.1) / 8.2);
    const jx = lerp(-260, W + 300, EASE.inOutQuad(flight));
    const jy = lerp(700, 860, EASE.inOutQuad(flight)) + Math.sin(flight * Math.PI) * -70;
    const jrot = -0.1 + Math.sin(flight * Math.PI) * -0.06;

    // contrail
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const trailLen = 620;
    const vg = linGrad(ctx, jx - trailLen, 0, jx, 0, [
      [0, 'rgba(255,245,230,0)'],
      [0.5, 'rgba(255,240,220,0.16)'],
      [1, 'rgba(255,250,240,0.42)'],
    ]);
    ctx.fillStyle = vg;
    ctx.beginPath();
    ctx.moveTo(jx - trailLen, jy - 26);
    ctx.quadraticCurveTo(jx - trailLen * 0.4, jy - 60, jx, jy - 6);
    ctx.lineTo(jx, jy + 6);
    ctx.quadraticCurveTo(jx - trailLen * 0.4, jy - 26, jx - trailLen, jy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(jx, jy);
    ctx.rotate(jrot);
    jet(ctx, { len: 640 });
    ctx.restore();

    // boarding pass card
    const cp = spring(clamp((t - b1 - 0.05) / 0.8) * 1.12, 11, 0.64);
    if (cp > 0.002) {
      const cw = 1120;
      const ch = 470;
      const x = (W - cw) / 2;
      const y = 1180 + (1 - cp) * 90;
      ctx.save();
      ctx.globalAlpha *= clamp(cp * 1.8);
      ctx.translate(x + cw / 2, y + ch / 2);
      ctx.rotate(lerp(0.06, -0.018, cp));
      ctx.scale(lerp(0.9, 1, cp), lerp(0.9, 1, cp));
      ctx.translate(-cw / 2, -ch / 2);

      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 26;
      fillRR(ctx, 0, 0, cw, ch, 28, '#FAF5EA');
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      strokeRR(ctx, 1, 1, cw - 2, ch - 2, 28, 'rgba(0,0,0,0.1)', 2);
      const topLight = linGrad(ctx, 0, 0, 0, 180, [
        [0, 'rgba(255,255,255,0.6)'],
        [1, 'rgba(255,255,255,0)'],
      ]);
      ctx.fillStyle = topLight;
      fillRR(ctx, 0, 0, cw, 180, 28, topLight);

      const ink = '#16130F';
      tracking(ctx, 'BOARDING PASS', 54, 74, { size: 26, font: F.num6, track: 7, color: hexA(ink, 0.5) });
      tracking(ctx, 'GA 892', cw - 54, 74, { size: 26, font: F.num6, track: 5, color: hexA(ink, 0.45), align: 'right' });

      txt(ctx, 'JFK', 54, 190, { size: 78, font: F.head, color: ink });
      txt(ctx, 'LAX', 300, 190, { size: 78, font: F.head, color: ink });
      ctx.save();
      ctx.strokeStyle = hexA(ink, 0.3);
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(232, 168);
      ctx.lineTo(282, 168);
      ctx.stroke();
      ctx.restore();
      // plane marker
      ctx.save();
      ctx.translate(257, 168);
      ctx.rotate(-0.5);
      ctx.fillStyle = C.ember;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(9, 9);
      ctx.lineTo(0, 4);
      ctx.lineTo(-9, 9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // dotted perforation
      ctx.save();
      ctx.strokeStyle = hexA(ink, 0.22);
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 12]);
      ctx.beginPath();
      ctx.moveTo(cw - 300, 30);
      ctx.lineTo(cw - 300, ch - 30);
      ctx.stroke();
      ctx.restore();

      // price block
      txt(ctx, 'HARGA TIKET', 54, 268, { size: 24, font: F.num6, color: hexA(ink, 0.45), track: 4 });
      const count = EASE.outCubic(clamp((t - b1 - 0.5) / 1.1));
      txt(ctx, `$${Math.round(lerp(320, 390, count))}`, 54, 388, { size: 104, font: F.num, color: ink });
      txt(ctx, '$320', 330, 340, { size: 38, font: F.num6, color: hexA(ink, 0.38) });
      ctx.save();
      ctx.strokeStyle = hexA(C.red, 0.85);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(330, 327);
      ctx.lineTo(330 + 118 * EASE.outCubic(clamp((t - b1 - 0.6) / 0.5)), 327);
      ctx.stroke();
      ctx.restore();

      // barcode right of perforation
      const r = rng(23);
      ctx.save();
      ctx.globalAlpha = 0.7;
      let bx = cw - 260;
      while (bx < cw - 54) {
        const bw = 2 + Math.floor(r() * 4);
        if (r() > 0.3) {
          ctx.fillStyle = ink;
          ctx.fillRect(bx, 120, bw, 96);
        }
        bx += bw + 4;
      }
      ctx.restore();
      tracking(ctx, 'SEAT 23A', cw - 54, 262, { size: 22, font: F.num6, track: 4, color: hexA(ink, 0.5), align: 'right' });
      tracking(ctx, 'GATE 07', cw - 54, 300, { size: 22, font: F.num6, track: 4, color: hexA(ink, 0.5), align: 'right' });

      // +22% stamp
      const sp = clamp((t - b2 - 0.15) / 0.26);
      if (sp > 0) {
        ctx.save();
        ctx.translate(cw - 160, 392);
        ctx.rotate(-0.13);
        const sc = lerp(1.9, 1, EASE.outBack(sp, 2.4));
        ctx.scale(sc, sc);
        ctx.globalAlpha *= clamp(sp * 3);
        ctx.strokeStyle = C.red;
        ctx.fillStyle = hexA(C.red, 0.1);
        ctx.lineWidth = 6;
        strokeRR(ctx, -120, -50, 240, 100, 10, C.red, 6);
        fillRR(ctx, -120, -50, 240, 100, 10, hexA(C.red, 0.08));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `62px ${F.num}`;
        ctx.letterSpacing = '2px';
        ctx.fillStyle = C.red;
        ctx.fillText('+22%', 0, 4);
        ctx.restore();
      }
      ctx.restore();
    }

    // fuel chip
    const fcp = spring(clamp((t - b1 - 0.55) / 0.7) * 1.2, 12, 0.6);
    if (fcp > 0.002) {
      ctx.save();
      ctx.globalAlpha *= clamp(fcp * 2);
      ctx.translate(W / 2, 760 + (1 - fcp) * 40);
      ctx.scale(fcp, fcp);
      labelChip(ctx, 'AVTUR  $98 → $104', 0, 0, {
        size: 30, font: F.num6, track: 4, padX: 28, padY: 16,
        bg: 'rgba(20,10,12,0.72)', border: hexA('#FFD9A0', 0.3), color: '#FFE6C2',
        dot: true, dotColor: C.red, radius: 14, shadow: 30,
      });
      ctx.restore();
    }

    // foreground haze
    ctx.save();
    const hz = linGrad(ctx, 0, 1400, 0, 1800, [
      [0, 'rgba(255,210,160,0)'],
      [1, 'rgba(255,190,130,0.22)'],
    ]);
    ctx.fillStyle = hz;
    ctx.fillRect(0, 1400, W, 400);
    ctx.restore();
  },
};
