import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure, labelChip,
  burst,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { tankerTop, wake } from '../art/vehicles.mjs';
import { clamp, lerp, EASE, spring, rng, TAU, noise1 } from '../engine/anim.mjs';

const wordAt = (group, re) => group?.words.find((w) => re.test(w.text))?.start ?? null;

function water(ctx, t) {
  const g = linGrad(ctx, 0, 0, 0, 1800, [
    [0, '#0C2A33'],
    [0.45, '#12414C'],
    [1, '#08222C'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 1800);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 26; i++) {
    const y = 460 + i * 46;
    ctx.strokeStyle = `rgba(140,220,220,${0.05 + 0.04 * noise1(i * 3.3, 4)})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = -40; x <= W + 40; x += 40) {
      const yy = y + Math.sin(x * 0.008 + t * 0.7 + i) * 7;
      x === -40 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // depth vignette
  const vg = radGrad(ctx, W / 2, 950, 200, 1100, [
    [0, 'rgba(20,80,90,0.18)'],
    [1, 'rgba(0,10,16,0.5)'],
  ]);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, 1800);
}

function landMass(ctx, t, o) {
  const { side = 'top', base, slope = 0, color, dark, label, seed = 3, mountains = 8 } = o;
  const r = rng(seed);
  const edgeAt = (x) => base + slope * (x / W - 0.5);
  ctx.save();
  ctx.beginPath();
  const pts = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const x = (W / steps) * i;
    const y = edgeAt(x) + (i === 0 || i === steps ? 0 : (r() - 0.5) * 90);
    pts.push([x, y]);
  }
  if (side === 'top') {
    ctx.moveTo(-10, -20);
    ctx.lineTo(W + 10, -20);
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1]);
  } else {
    ctx.moveTo(-10, H + 20);
    ctx.lineTo(W + 10, H + 20);
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
  const g = linGrad(ctx, 0, side === 'top' ? -100 : base + 200, 0, side === 'top' ? base + 260 : 1980, [
    [0, side === 'top' ? dark : '#D4A96E'],
    [0.55, color],
    [1, side === 'top' ? '#D8AE74' : dark],
  ]);
  ctx.fillStyle = g;
  ctx.fill();

  // contour texture
  ctx.save();
  ctx.clip();
  const rr2 = rng(seed + 21);
  ctx.strokeStyle = 'rgba(90,58,32,0.10)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const off = 40 + i * 46;
    ctx.beginPath();
    for (let x = -40; x <= W + 40; x += 60) {
      const y = edgeAt(x) + (side === 'top' ? off : -off) + Math.sin(x * 0.006 + i) * 10;
      x === -40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // grain dots
  for (let i = 0; i < 260; i++) {
    const x = rr2() * W;
    const y = side === 'top' ? rr2() * (base + 120) : 1900 - rr2() * (1900 - base);
    ctx.fillStyle = `rgba(70,44,24,${0.04 + rr2() * 0.05})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + rr2() * 2.4, 0, TAU);
    ctx.fill();
  }
  // port lights
  for (let i = 0; i < 12; i++) {
    const x = rr2() * W;
    const y = edgeAt(x) + (side === 'top' ? 26 + rr2() * 60 : -(26 + rr2() * 60));
    const a = 0.25 + 0.25 * Math.sin(t * 1.5 + i);
    const lg = radGrad(ctx, x, y, 0, 16, [
      [0, `rgba(255,208,140,${a})`],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // coastline foam
  ctx.strokeStyle = 'rgba(205,244,238,0.32)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(190,240,235,0.08)';
  ctx.lineWidth = 26;
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const yy = y + (side === 'top' ? 16 : -16);
    i === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
  });
  ctx.stroke();

  // mountains
  const rr3 = rng(seed + 9);
  for (let i = 0; i < mountains; i++) {
    const mx = rr3() * W;
    const mh = 80 + rr3() * 190;
    const mw = 110 + rr3() * 170;
    const my = side === 'top' ? edgeAt(mx) - 190 - rr3() * 150 : edgeAt(mx) + 190 + rr3() * 150;
    ctx.beginPath();
    ctx.moveTo(mx - mw / 2, my + mh / 2);
    ctx.lineTo(mx, my - mh / 2);
    ctx.lineTo(mx + mw / 2, my + mh / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(96,64,36,0.22)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(mx, my - mh / 2);
    ctx.lineTo(mx + mw / 2, my + mh / 2);
    ctx.lineTo(mx + mw * 0.05, my + mh / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(64,40,22,0.18)';
    ctx.fill();
  }

  if (label) {
    const lx = label.x;
    const ly = label.y;
    tracking(ctx, label.text, lx, ly, {
      size: 28, font: F.num6, track: 12, align: 'center', color: 'rgba(52,32,18,0.5)',
    });
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene) {
    const g0 = scene.captions[0];
    const gConflict = scene.captions.find((c) => c.words.some((w) => /Konflik/i.test(w.text))) ?? scene.captions[1];
    const gPump = scene.captions.find((c) => c.words.some((w) => /Bensin/i.test(w.text))) ?? scene.captions[scene.captions.length - 1];
    const b0 = g0?.words[0].start ?? 0.4;

    const strikeAt = (wordAt(gConflict, /Konflik/i) ?? 2.6) + 0.5;
    const priceAt = (wordAt(gConflict, /seratus/i) ?? 5) - 0.4;
    const pumpAt = (gPump?.words[0].start ?? 7.8) + 0.8;

    const hit = Math.max(0, 1 - Math.abs(t - strikeAt) / 0.42);
    const shake = Math.pow(hit, 1.6) * 26;
    const sx = shake * Math.sin(t * 121);
    const sy = shake * Math.cos(t * 97);

    ctx.save();
    ctx.translate(W / 2 + sx, 950 + sy);
    ctx.scale(1 + hit * 0.03, 1 + hit * 0.03);
    ctx.translate(-W / 2, -950);

    water(ctx, t);

    // tanker path
    const sail = clamp((t - b0 + 0.5) / (strikeAt + 1.2 - b0));
    const tx = lerp(120, 1120, EASE.inOutQuad(sail));
    const ty = lerp(1420, 700, EASE.inOutQuad(sail));
    const tang = Math.atan2(700 - 1420, 1120 - 120);
    wake(ctx, tx - 30, ty + 40, tang, 520, t, { alpha: 0.34 });
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(tang);
    tankerTop(ctx, { len: 470, wid: 118 });
    ctx.restore();

    // second, distant tanker
    const sail2 = clamp((t - b0 - 1.2) / 6);
    const t2x = lerp(1180, 340, EASE.inOutQuad(sail2));
    const t2y = lerp(780, 1300, EASE.inOutQuad(sail2));
    ctx.save();
    ctx.globalAlpha = 0.55;
    wake(ctx, t2x - 20, t2y + 24, Math.atan2(1300 - 780, 340 - 1180), 300, t * 1.2, { alpha: 0.2 });
    ctx.translate(t2x, t2y);
    ctx.rotate(Math.atan2(1300 - 780, 340 - 1180));
    tankerTop(ctx, { len: 300, wid: 78 });
    ctx.restore();

    // land
    landMass(ctx, t, { side: 'top', base: 400, slope: 300, color: '#9A6C3C', dark: '#4E3319', label: { text: 'IRAN', x: 420, y: 226 }, seed: 4, mountains: 6 });
    landMass(ctx, t, { side: 'bottom', base: 1420, slope: -260, color: '#8E6234', dark: '#452C15', label: { text: 'OMAN', x: 1130, y: 1468 }, seed: 8, mountains: 5 });

    // strait label
    const chipP = spring(clamp((t - b0 - 0.5) / 0.7) * 1.2, 12, 0.6);
    if (chipP > 0.002) {
      ctx.save();
      ctx.globalAlpha *= clamp(chipP * 2);
      const lx = 260;
      const ly = 1130;
      ctx.strokeStyle = hexA('#BFF3EE', 0.6);
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 8]);
      ctx.beginPath();
      ctx.moveTo(lx + 130, ly);
      ctx.lineTo(470, 1010);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(476, 1008, 7, 0, TAU);
      ctx.fillStyle = '#BFF3EE';
      ctx.fill();
      labelChip(ctx, 'SELAT HORMUZ', lx, ly, {
        size: 26, font: F.num6, track: 5, padX: 24, padY: 14,
        bg: 'rgba(6,26,32,0.82)', border: hexA('#BFF3EE', 0.45), color: '#D9FBF7',
        dot: true, dotColor: '#7FE3D8', align: 'center', shadow: 30,
      });
      ctx.restore();
    }

    // strike
    const since = t - strikeAt;
    if (since > -0.15) {
      const flash = Math.max(0, 1 - Math.abs(since) / 0.2);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const rg = radGrad(ctx, 820, 1010, 0, 540, [
        [0, `rgba(255,240,200,${0.55 * Math.max(0, 1 - since / 0.9)})`],
        [0.3, `rgba(255,150,60,${0.32 * Math.max(0, 1 - since / 1.4)})`],
        [1, 'rgba(0,0,0,0)'],
      ]);
      ctx.fillStyle = rg;
      ctx.fillRect(140, 330, 1360, 1360);
      ctx.restore();

      // shockwave rings
      for (let i = 0; i < 3; i++) {
        const p = clamp((since - i * 0.12) / 1.5);
        if (p <= 0 || p >= 1) continue;
        ctx.save();
        ctx.strokeStyle = `rgba(255,225,180,${0.5 * (1 - p)})`;
        ctx.lineWidth = 4 * (1 - p) + 1;
        ctx.beginPath();
        ctx.ellipse(820, 1010, 60 + p * 460, (60 + p * 460) * 0.9, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }

      // burning slick
      const burn = clamp(since / 1.4);
      if (burn > 0) {
        ctx.save();
        const pg = radGrad(ctx, 820, 1010, 0, 300 * burn, [
          [0, 'rgba(255,190,90,0.55)'],
          [0.45, 'rgba(255,110,30,0.3)'],
          [1, 'rgba(0,0,0,0)'],
        ]);
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(820, 1010, 300 * burn, 190 * burn, 0, 0, TAU);
        ctx.fill();

        // flames
        const r2 = rng(77);
        for (let i = 0; i < 7; i++) {
          const bx = 820 + (r2() - 0.5) * 230 * burn;
          const by = 1010 + (r2() - 0.5) * 90 * burn;
          const fh = (60 + r2() * 110) * burn * (0.85 + 0.15 * Math.sin(t * 9 + i));
          const fw = 26 + r2() * 26;
          const fg = linGrad(ctx, 0, by - fh, 0, by + 10, [
            [0, 'rgba(255,246,200,0.9)'],
            [0.5, 'rgba(255,170,60,0.75)'],
            [1, 'rgba(255,90,20,0)'],
          ]);
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.moveTo(bx - fw / 2, by + 6);
          ctx.quadraticCurveTo(bx - fw * 0.4, by - fh * 0.5, bx, by - fh);
          ctx.quadraticCurveTo(bx + fw * 0.4, by - fh * 0.5, bx + fw / 2, by + 6);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // smoke
        ctx.save();
        const r3 = rng(19);
        for (let i = 0; i < 14; i++) {
          const p = (since * 0.14 + r3()) % 1;
          const sx2 = 820 + (r3() - 0.5) * 200 + Math.sin(p * 4 + i) * 40;
          const sy2 = 1010 - p * 620;
          const rad = 40 + p * 130;
          const a = (1 - p) * 0.22;
          const sg2 = radGrad(ctx, sx2, sy2, 0, rad, [
            [0, `rgba(60,54,52,${a})`],
            [1, 'rgba(60,54,52,0)'],
          ]);
          ctx.fillStyle = sg2;
          ctx.beginPath();
          ctx.arc(sx2, sy2, rad, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }

      // sparks
      const r = rng(31);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 26; i++) {
        const a = r() * TAU;
        const sp = 180 + r() * 520;
        const life = 1.1;
        const p = clamp(since / life);
        if (p >= 1) continue;
        const d = sp * EASE.outCubic(p);
        ctx.globalAlpha = (1 - p) * 0.9;
        ctx.fillStyle = r() > 0.4 ? '#FFD79A' : '#FF8A3C';
        ctx.beginPath();
        ctx.arc(820 + Math.cos(a) * d, 1010 + Math.sin(a) * d * 0.85, 2 + (1 - p) * 4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      if (flash > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = flash * 0.5;
        ctx.fillStyle = '#FFF3DC';
        ctx.fillRect(0, 0, W, 1800);
        ctx.restore();
      }
    }

    // price card
    const pp = spring(clamp((t - priceAt) / 0.7) * 1.15, 11, 0.62);
    if (pp > 0.002) {
      const cw = 660;
      const ch = 268;
      const x = 120;
      const y = 700 + (1 - pp) * 60;
      ctx.save();
      ctx.globalAlpha *= clamp(pp * 1.8);
      ctx.translate(x + cw / 2, y + ch / 2);
      ctx.scale(lerp(0.86, 1, pp), lerp(0.86, 1, pp));
      ctx.translate(-cw / 2, -ch / 2);
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 20;
      fillRR(ctx, 0, 0, cw, ch, 24, 'rgba(8,12,16,0.9)');
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      strokeRR(ctx, 1, 1, cw - 2, ch - 2, 24, hexA('#FFD9A0', 0.28), 2);
      tracking(ctx, 'BRENT · PER BAREL', 40, 58, { size: 22, font: F.num6, track: 5, color: hexA('#FFD9A0', 0.75) });
      const val = lerp(96, 100, EASE.outCubic(clamp((t - priceAt - 0.15) / 1.1)));
      txt(ctx, `$${val.toFixed(0)}`, 36, 186, { size: 118, font: F.num, color: C.amber, track: 0 });
      txt(ctx, '$96', 360, 186, { size: 40, font: F.num6, color: hexA(C.bone, 0.35) });
      ctx.strokeStyle = hexA(C.red, 0.8);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(358, 172);
      ctx.lineTo(358 + 76 * clamp((t - priceAt - 0.4) / 0.4), 172);
      ctx.stroke();
      tracking(ctx, '+4,2%', cw - 40, 76, {
        size: 30, font: F.num, track: 1, align: 'right', color: C.red,
      });
      ctx.restore();
    }

    // pump price chip
    const pumpP = spring(clamp((t - pumpAt) / 0.7) * 1.2, 12, 0.6);
    if (pumpP > 0.002) {
      ctx.save();
      ctx.globalAlpha *= clamp(pumpP * 2);
      ctx.translate(W / 2, 1600 + (1 - pumpP) * 50);
      ctx.scale(pumpP, pumpP);
      labelChip(ctx, 'BENSIN DI POMPA  +0,6% / BULAN', 0, 0, {
        size: 28, font: F.num6, track: 4, padX: 30, padY: 16,
        bg: 'rgba(30,10,8,0.9)', border: hexA(C.amber, 0.4), color: C.bone,
        dot: true, dotColor: C.amber, radius: 14, shadow: 30,
      });
      ctx.restore();
    }

    ctx.restore();
  },
};
