import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { P, eyebrow, ease, engraved, sticker } from './_fare.mjs';

// 04 — YANG MENGGERAKKAN
// Three pieces of evidence on a dark table under one lamp: where people are
// looking, how little time is left, what the competition is charging. Red
// thread runs from all three to one card — the price you actually see.

const TABLE = 420;

/** A folded route map, torn along one edge, pinned flat. */
function mapSheet(ctx, x, y, w, h, { a = 1, p = 1 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.045);

  // torn left edge
  const torn = () => {
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    for (let i = 0; i <= 12; i++) {
      const yy = -h / 2 + (h * i) / 12;
      ctx.lineTo(-w / 2 + ((i % 2 === 0) ? -8 : 10) + noise1(i, 3) * 6, yy);
    }
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(w / 2, -h / 2);
    ctx.closePath();
  };

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.62)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  torn();
  ctx.fillStyle = '#EADDC2';
  ctx.fill();
  ctx.restore();

  ctx.save();
  torn();
  ctx.clip();
  // paper tone
  ctx.fillStyle = linGrad(ctx, 0, -h / 2, 0, h / 2, [
    [0, 'rgba(255,255,255,0.30)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(120,95,58,0.22)'],
  ]);
  ctx.fillRect(-w / 2, -h / 2, w, h);
  // faint sea grid
  ctx.strokeStyle = 'rgba(40,70,90,0.16)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 + (h * i) / 7);
    ctx.lineTo(w / 2, -h / 2 + (h * i) / 7);
    ctx.stroke();
  }
  for (let i = 1; i < 9; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + (w * i) / 9, -h / 2);
    ctx.lineTo(-w / 2 + (w * i) / 9, h / 2);
    ctx.stroke();
  }
  // coastline scribble
  ctx.strokeStyle = 'rgba(36,72,64,0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 30; i++) {
    const u = i / 30;
    const xx = -w / 2 + u * w;
    const yy = -h * 0.10 + Math.sin(u * 7.2) * 26 + noise1(u * 9, 12) * 18;
    i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
  }
  ctx.stroke();
  // the route
  ctx.save();
  ctx.setLineDash([10, 9]);
  ctx.strokeStyle = 'rgba(178,58,36,0.85)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.24, h * 0.30);
  ctx.quadraticCurveTo(0, -h * 0.16, w * 0.32, -h * 0.20);
  ctx.stroke();
  ctx.restore();
  // pins
  for (const [px, py] of [[-w * 0.24, h * 0.30], [w * 0.32, -h * 0.20]]) {
    ctx.beginPath();
    ctx.arc(px, py, 11, 0, TAU);
    ctx.fillStyle = 'rgba(178,58,36,0.95)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px - 3, py - 3, 3.5, 0, TAU);
    ctx.fillStyle = 'rgba(255,230,220,0.9)';
    ctx.fill();
  }
  // handwritten circle around the destination
  ctx.strokeStyle = 'rgba(30,26,22,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(w * 0.32, -h * 0.20, 34 * p, 30 * p, 0.2, 0, TAU * ((p * 0.98) % 1 || 1));
  ctx.stroke();
  // creases
  ctx.strokeStyle = 'rgba(90,70,40,0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w / 2, h * 0.02);
  ctx.lineTo(w / 2, -h * 0.06);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/** A brass cabin clock, stopped a few minutes before departure. */
function clockFace(ctx, cx, cy, r, { a = 1, hands = [10, 2] } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy + 12, r * 1.02, 0, TAU);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.filter = 'blur(2px)';
  ctx.fill();
  ctx.restore();

  // brass bezel
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fillStyle = radGrad(ctx, cx - r * 0.4, cy - r * 0.5, r * 0.1, r * 1.15, [
    [0, '#F0D3A0'], [0.35, '#B08A4E'], [0.7, '#6B5230'], [1, '#3A2C18'],
  ]);
  ctx.fill();
  // face
  ctx.beginPath();
  ctx.arc(cx, cy, r - 22, 0, TAU);
  ctx.fillStyle = radGrad(ctx, cx, cy - r * 0.3, r * 0.1, r, [
    [0, '#141E28'], [0.8, '#0A1118'], [1, '#060A0F'],
  ]);
  ctx.fill();
  // minute ticks
  for (let i = 0; i < 60; i++) {
    const ang = (i / 60) * TAU - Math.PI / 2;
    const major = i % 5 === 0;
    const r0 = r - (major ? 44 : 30);
    ctx.strokeStyle = major ? 'rgba(246,241,230,0.72)' : 'rgba(246,241,230,0.26)';
    ctx.lineWidth = major ? 3 : 1.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    ctx.lineTo(cx + Math.cos(ang) * (r - 26), cy + Math.sin(ang) * (r - 26));
    ctx.stroke();
  }
  // hands
  const handAt = (hAng, len, wd, col) => {
    const ang = (hAng / 12) * TAU - Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    fillRR(ctx, -wd / 2, -len, wd, len + 14, wd / 2, col);
    ctx.restore();
  };
  handAt(hands[0] + hands[1] / 60, r * 0.52, 13, '#F6F1E6');
  handAt(hands[1], r * 0.78, 8, '#F6F1E6');
  // the thin second hand, in danger colour
  handAt((hands[1] * 5) % 60, r * 0.84, 3, hexA(P.ember, 0.9));
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, TAU);
  ctx.fillStyle = '#D9C08A';
  ctx.fill();
  // glass
  ctx.beginPath();
  ctx.arc(cx, cy, r - 24, Math.PI * 1.05, Math.PI * 1.62);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    /* ------------------------------- the table -------------------------- */
    const tg = linGrad(ctx, 0, 0, 0, H, [
      [0, '#0A1018'], [0.34, '#0D1319'], [0.72, '#0A0E13'], [1, '#05070B'],
    ]);
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, W, H);

    // one lamp, high and to the left
    const lamp = radGrad(ctx, 720, 620, 40, 760, [
      [0, 'rgba(255,206,150,0.16)'], [0.45, 'rgba(255,190,130,0.07)'], [1, 'rgba(255,180,120,0)'],
    ]);
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, W, 1660);

    // wood grain
    for (let i = 0; i < 26; i++) {
      const yy = TABLE + 40 + i * 44;
      ctx.fillStyle = `rgba(190,150,105,${0.012 + 0.022 * noise1(i, 6)})`;
      ctx.fillRect(0, yy, W, 1 + ((i * 7) % 3));
    }
    // table edge, front
    ctx.fillStyle = linGrad(ctx, 0, 1500, 0, 1620, [
      [0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)'],
    ]);
    ctx.fillRect(0, 1500, W, 120);

    eyebrow(ctx, 'TIGA HAL YANG MENGGERAKKAN', { a: a(0.05, 0.5), color: 'rgba(246,241,230,0.62)' });

    /* ------------------------------ the objects ------------------------- */
    const m1 = a(0.02, 0.65);
    if (m1 > 0.01) {
      ctx.save();
      ctx.translate(0, (1 - m1) * 26);
      mapSheet(ctx, 66, 486, 508, 378, { a: m1, p: clamp((t - 2.4) / 1.0) });
      ctx.restore();
      engraved(ctx, 'PENCARI RUTE', 80, 902, {
        size: 19, color: 'rgba(226,240,252,0.44)', track: 4, a: a(0.9, 0.5),
      });
      ctx.fillStyle = hexA(P.amber, 0.7 * a(0.9, 0.5));
      ctx.fillRect(68, 882, 40, 3);
    }

    const m2 = a(4.35, 0.7);
    if (m2 > 0.01) {
      ctx.save();
      ctx.translate(0, (1 - m2) * 30);
      clockFace(ctx, 1032, 706, 168, { a: m2, hands: [8, 42] });
      ctx.restore();
      engraved(ctx, 'SISA WAKTU', 972, 930, {
        size: 19, color: 'rgba(226,240,252,0.44)', track: 4, a: a(4.9, 0.5),
      });
      ctx.fillStyle = hexA(P.amber, 0.7 * a(4.9, 0.5));
      ctx.fillRect(868, 910, 40, 3);
    }

    const m3 = a(6.60, 0.7);
    if (m3 > 0.01) {
      ctx.save();
      ctx.globalAlpha = m3;
      ctx.translate(330, 1182);
      ctx.rotate(0.055);
      ctx.translate(0, (1 - m3) * 30);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 12;
      fillRR(ctx, -160, -66, 320, 132, 4, '#EFE3CB');
      ctx.restore();
      ctx.fillStyle = linGrad(ctx, 0, -66, 0, 66, [
        [0, 'rgba(255,255,255,0.28)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(118,92,54,0.20)'],
      ]);
      fillRR(ctx, -160, -66, 320, 132, 4, ctx.fillStyle);
      // hole + string
      ctx.beginPath();
      ctx.arc(-130, -30, 7, 0, TAU);
      ctx.fillStyle = 'rgba(23,19,16,0.45)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(236,226,206,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-130, -37);
      ctx.quadraticCurveTo(-170, -70, -140, -96);
      ctx.stroke();
      tracking(ctx, 'HARGA PESAING', -128, -18, {
        size: 14, font: F.mono6, track: 3, color: 'rgba(23,19,16,0.48)',
      });
      txt(ctx, 'Rp 815.000', -128, 40, {
        size: 44, font: F.num, color: 'rgba(23,19,16,0.88)', track: -1,
      });
      ctx.restore();
      engraved(ctx, 'HARGA PESAING', 232, 1302, {
        size: 19, color: 'rgba(226,240,252,0.44)', track: 4, a: a(7.2, 0.5),
      });
      ctx.fillStyle = hexA(P.amber, 0.7 * a(7.2, 0.5));
      ctx.fillRect(210, 1282, 40, 3);
    }

    /* ------------------------------- the card --------------------------- */
    const cA = a(1.85, 0.7);
    if (cA <= 0.01) return;
    const cx = 668;
    const cy = 1044;
    const cw = 566;
    const ch = 358;
    const s = ease.out(clamp((t - 1.85) / 0.75));

    ctx.save();
    ctx.globalAlpha = cA;
    ctx.translate(0, (1 - s) * 34);
    ctx.rotate(-0.012);

    // shadow + card
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;
    fillRR(ctx, cx, cy, cw, ch, 5, '#F4EAD6');
    ctx.restore();
    ctx.fillStyle = linGrad(ctx, 0, cy, 0, cy + ch, [
      [0, 'rgba(255,255,255,0.34)'], [0.6, 'rgba(255,255,255,0)'], [1, 'rgba(110,86,52,0.16)'],
    ]);
    fillRR(ctx, cx, cy, cw, ch, 5, ctx.fillStyle);
    // ruled paper
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(40,80,120,0.10)';
      ctx.fillRect(cx + 30, cy + 92 + i * 38, cw - 60, 1.4);
    }
    // red header rule
    ctx.fillStyle = 'rgba(178,58,36,0.55)';
    ctx.fillRect(cx + 30, cy + 74, cw - 60, 2);

    tracking(ctx, 'HARGA YANG KAMU LIHAT', cx + 32, cy + 52, {
      size: 17, font: F.mono6, track: 4, color: 'rgba(23,19,16,0.55)',
    });
    txt(ctx, 'Rp 900.000', cx + 30, cy + 238, {
      size: 76, font: F.num, color: 'rgba(23,19,16,0.90)', track: -2,
    });
    tracking(ctx, 'BUKAN KEPUTUSAN SATU ORANG', cx + 32, cy + 300, {
      size: 16, font: F.mono6, track: 4, color: 'rgba(23,19,16,0.45)',
    });
    // brass pin
    ctx.beginPath();
    ctx.arc(cx + cw / 2, cy + 16, 12, 0, TAU);
    ctx.fillStyle = '#C9A25E';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + cw / 2 - 3, cy + 13, 4, 0, TAU);
    ctx.fillStyle = 'rgba(255,245,225,0.85)';
    ctx.fill();
    ctx.restore();


    /* ------------------------------- the pen ---------------------------- */
    const penA = a(2.6, 0.7);
    if (penA > 0.01) {
      ctx.save();
      ctx.globalAlpha = penA;
      ctx.translate(210, 1470);
      ctx.rotate(-0.42);
      // shadow
      ctx.save();
      ctx.translate(10, 26);
      fillRR(ctx, -14, -190, 28, 380, 14, 'rgba(0,0,0,0.45)');
      ctx.restore();
      // barrel
      fillRR(ctx, -15, -196, 30, 392, 15, linGrad(ctx, -15, 0, 15, 0, [
        [0, 'rgba(52,70,86,1)'], [0.35, 'rgba(34,48,60,1)'], [1, 'rgba(12,18,24,1)'],
      ]));
      // highlight
      ctx.fillStyle = 'rgba(210,235,255,0.22)';
      ctx.fillRect(-9, -180, 4, 340);
      // cap band
      fillRR(ctx, -16, -196, 32, 96, 15, linGrad(ctx, -16, 0, 16, 0, [
        [0, 'rgba(96,120,140,1)'], [1, 'rgba(24,34,44,1)'],
      ]));
      ctx.fillStyle = 'rgba(245,178,60,0.85)';
      ctx.fillRect(-16, -104, 32, 7);
      // nib
      ctx.beginPath();
      ctx.moveTo(-12, 196);
      ctx.lineTo(12, 196);
      ctx.lineTo(0, 236);
      ctx.closePath();
      ctx.fillStyle = '#C9A25E';
      ctx.fill();
      ctx.restore();
    }
    /* ------------------------------ red thread -------------------------- */
    // each thread is tied the moment the voice names that reason
    const TH_START = [2.30, 4.75, 7.10];
    if (t > TH_START[0]) {
      const ends = [
        [356, 838, cx + 14, cy + 110],
        [984, 812, cx + cw - 26, cy + 46],
        [470, 1186, cx + 2, cy + 264],
      ];
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = hexA('#C2352A', 0.85);
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ends.forEach(([x0, y0, x1, y1], i) => {
        const p = ease.out(clamp((t - TH_START[i]) / 0.55));
        if (p <= 0.01) return;
        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2 + 46; // sag
        ctx.beginPath();
        const steps = 22;
        for (let k = 0; k <= steps * p; k++) {
          const u = k / steps;
          const bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * midX + u * u * x1;
          const by = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * midY + u * u * y1;
          k ? ctx.lineTo(bx, by) : ctx.moveTo(bx, by);
        }
        ctx.stroke();
      });
      ctx.restore();
    }
  },
};
