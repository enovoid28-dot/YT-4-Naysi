import { W, H, C, M, txt, tracking, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { bg, glowSpot, card, hairline, pill } from './_ep3.mjs';

const MY = 1240; // membrane centre
const HALF = 76; // head offset from centre
const RCX = 520; // receptor centre

function membrane(ctx) {
  for (let x = 186; x <= 1254; x += 44) {
    [-1, 1].forEach((side) => {
      const hy = MY + side * HALF;
      for (let k = 0; k < 2; k++) {
        const ox = x + (k ? 7 : -7);
        ctx.strokeStyle = 'rgba(150,178,214,0.22)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ox, hy + side * 11);
        ctx.quadraticCurveTo(ox + (k ? 8 : -8), MY + side * 16, ox, MY + side * 32);
        ctx.stroke();
      }
      const g = radGrad(ctx, x - 5, hy - 6, 2, 20, [
        [0, 'rgba(196,218,244,0.62)'], [1, 'rgba(96,124,160,0.16)'],
      ]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, hy, 14, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(206,226,250,0.16)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
}

function receptor(ctx, blockAmt, a) {
  const bw = 252;
  const bh = 430;
  const bx = RCX - bw / 2;
  const by = MY - 214;

  ctx.save();
  ctx.globalAlpha *= a;

  // cast shadow into the membrane
  ctx.save();
  ctx.globalAlpha *= 0.5;
  const sg = linGrad(ctx, 0, by, 0, by + bh, [
    [0, 'rgba(0,0,0,0.0)'], [1, 'rgba(0,0,0,0.55)'],
  ]);
  ctx.fillStyle = sg;
  fillRR(ctx, bx + 8, by + 10, bw, bh, 46, sg);
  ctx.restore();

  // barrel body
  const g = linGrad(ctx, bx, 0, bx + bw, 0, [
    [0, '#404B5E'], [0.18, '#586580'], [0.52, '#39445A'], [0.82, '#2A3446'], [1, '#1E2634'],
  ]);
  fillRR(ctx, bx, by, bw, bh, 46, g);
  ctx.strokeStyle = 'rgba(200,222,248,0.20)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 46) : ctx.rect(bx, by, bw, bh);
  ctx.stroke();

  // pocket (the binding site) carved into the top
  const pw = 178;
  const ph = 176;
  const pxx = RCX - pw / 2;
  ctx.save();
  const pg = linGrad(ctx, 0, by, 0, by + ph, [
    [0, 'rgba(4,6,11,0.98)'], [1, 'rgba(10,16,26,0.98)'],
  ]);
  ctx.fillStyle = pg;
  fillRR(ctx, pxx, by - 2, pw, ph, [0, 0, 40, 40], pg);
  // inner lip highlight
  ctx.strokeStyle = 'rgba(210,230,255,0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pxx, by);
  ctx.lineTo(pxx, by + ph - 40);
  ctx.quadraticCurveTo(pxx, by + ph, pxx + 40, by + ph);
  ctx.lineTo(pxx + pw - 40, by + ph);
  ctx.quadraticCurveTo(pxx + pw, by + ph, pxx + pw, by + ph - 40);
  ctx.lineTo(pxx + pw, by);
  ctx.stroke();
  ctx.restore();

  // mouth glow — cool when open, warm when blocked
  const gl = radGrad(ctx, RCX, by + 24, 4, 130, [
    [0, hexA(blockAmt > 0.4 ? C.amber : C.sky, 0.34)], [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(RCX, by + 24, 130, 0, TAU);
  ctx.fill();

  ctx.restore();
  return { by, bw, bh, pxx, pw };
}

function hexagon(ctx, cx, cy, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const an = rot + (i / 6) * TAU;
    const px = cx + Math.cos(an) * r;
    const py = cy + Math.sin(an) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function caffeineMolecule(ctx, x, y, s, a) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 9;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = hexA(C.amber, 0.9);
  ctx.shadowBlur = 26;
  hexagon(ctx, 0, 0, 44, 0);
  ctx.stroke();
  hexagon(ctx, 76, 0, 44, 0);
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.strokeStyle = hexA(C.amberHi, 0.95);
  [[-44, 0, -80, 0], [-22, -38, -22, -76], [76, 44, 76, 82], [54, 38, 54, 76]].forEach(([x0, y0, x1, y1]) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  });
  ctx.fillStyle = C.ember;
  [[-80, 0], [-22, -76], [76, 82], [54, 76]].forEach(([ox, oy]) => {
    ctx.beginPath();
    ctx.arc(ox, oy, 8, 0, TAU);
    ctx.fill();
  });
  ctx.restore();
}

function adenosine(ctx, x, y, s, a) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = C.sky;
  ctx.lineWidth = 8;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = hexA(C.sky, 0.65);
  ctx.shadowBlur = 22;
  hexagon(ctx, 0, 0, 38, 0);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const an = (i / 5) * TAU - 0.35;
    const px = Math.cos(an) * 32 + 62;
    const py = Math.sin(an) * 32;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    bg(ctx, { top: '#080A12', mid: '#06070D', bot: '#04050A' });
    glowSpot(ctx, RCX, MY - 100, 640, C.amber, 0.09);
    glowSpot(ctx, 1080, MY - 180, 520, C.sky, 0.06);

    tracking(ctx, 'DI DALAM OTAKMU', M, 330, {
      size: 24, font: F.num6, track: 7, color: hexA(C.bone, 0.45),
    });
    txt(ctx, 'Pintu kantuk, ditutup', M, 470, {
      size: 66, font: F.display, color: C.bone, alpha: EASE.outCubic(clamp((t - 0.1) / 0.8)),
    });
    txt(ctx, 'adenosin menumpuk, kafein menghalangi', M, 536, {
      size: 27, font: F.num6, color: hexA(C.bone, 0.45), alpha: clamp((t - 0.4) / 0.8),
    });

    const mA = clamp((t - 0.4) / 1.0);
    ctx.save();
    ctx.globalAlpha = mA;
    membrane(ctx);
    ctx.restore();

    const rA = clamp((t - 1.0) / 0.9);
    const blockAmt = clamp((t - 5.6) / 0.9);
    const geo = receptor(ctx, blockAmt, rA);

    // labels under the membrane
    const lbA = clamp((t - 1.8) / 0.8);
    if (lbA > 0.01) {
      ctx.save();
      ctx.globalAlpha = lbA;
      // receptor label
      hairline(ctx, RCX, MY + 214, RCX, MY + 242, { alpha: 0.26 });
      hairline(ctx, RCX, MY + 242, RCX + 150, MY + 242, { alpha: 0.26 });
      txt(ctx, 'RESEPTOR ADENOSIN', RCX + 168, MY + 250, {
        size: 22, font: F.num6, color: hexA(C.bone, 0.5), track: 3,
      });
      // membrane label sits above the bilayer
      hairline(ctx, 1160, MY - HALF - 22, 1160, MY - 236, { alpha: 0.22, dash: [3, 9] });
      txt(ctx, 'MEMBRAN SEL', 1160, MY - 258, {
        size: 22, font: F.num6, color: hexA(C.bone, 0.34), align: 'center', track: 4,
      });
      ctx.restore();
    }

    // falling caffeine
    const fall = clamp((t - 3.4) / 2.0);
    if (fall > 0 && fall < 1) {
      const y = lerp(760, geo.by + 74, EASE.inCubic(fall));
      caffeineMolecule(ctx, RCX, y, 0.82, 1);
    }

    // seated caffeine after impact
    if (blockAmt > 0) {
      const y = geo.by + 74;
      ctx.save();
      ctx.globalAlpha *= blockAmt;
      const pulse = 1 + Math.sin(meta.t * 3.0) * 0.025;
      caffeineMolecule(ctx, RCX, y, 0.82 * pulse, 1);
      ctx.restore();
    }

    const imp = clamp((t - 5.2) / 0.9);
    if (imp > 0 && imp < 1) {
      ctx.save();
      ctx.globalAlpha = (1 - imp) * 0.75;
      ctx.strokeStyle = C.amberHi;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(RCX, geo.by + 74, 40 + imp * 150, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // adenosine arrives and is refused
    const adA = clamp((t - 7.0) / 1.4);
    if (adA > 0.01) {
      const push = clamp((t - 8.6) / 1.2);
      const ax = lerp(1210, RCX + 240, EASE.outCubic(adA)) + EASE.outCubic(push) * 40;
      const ay = 980 + Math.sin(meta.t * 1.5) * 14 + push * 26;
      adenosine(ctx, ax, ay, 0.9, adA * (1 - 0.4 * push));
      if (adA > 0.6) {
        txt(ctx, 'adenosin', ax - 10, ay + 118, {
          size: 24, font: F.num6, color: hexA(C.sky, 0.8), align: 'center', track: 3,
          alpha: clamp((t - 7.8) / 0.7),
        });
      }
    }

    const cA = EASE.outCubic(clamp((t - 6.0) / 0.7));
    if (cA > 0.01) {
      pill(ctx, 'KAFEIN MENEMPEL', RCX, 800, {
        size: 26, color: C.amberHi, alpha: cA,
        bgc: 'rgba(255,176,58,0.10)', border: 'rgba(255,176,58,0.40)',
      });
    }

    const nA = EASE.outCubic(clamp((t - 10.4) / 0.9));
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA;
      const y = 1520 + (1 - nA) * 26;
      card(ctx, M, y, W - 2 * M, 200, {
        fill: 'rgba(255,255,255,0.028)', stroke: 'rgba(255,255,255,0.09)', r: 26, shadowBlur: 34,
      });
      txt(ctx, 'Kantuk tidak hilang.', M + 46, y + 84, { size: 42, font: F.head, color: C.bone });
      txt(ctx, 'Ia menunggu di depan pintu.', M + 46, y + 146, {
        size: 42, font: F.head, color: C.amberHi,
      });
      ctx.restore();
    }

    const wA = clamp((t - 13.6) / 0.9);
    if (wA > 0.01) {
      txt(ctx, 'utangnya ditagih saat kafein habis', W / 2, 1790, {
        size: 27, font: F.num6, color: hexA(C.bone, 0.45), align: 'center', track: 2, alpha: wA,
      });
    }
  },
};
