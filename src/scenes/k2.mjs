import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { P, eyebrow, ease, nightWall, lightCone, engraved, hangTag, sticker } from './_fare.mjs';
import { barcode } from '../engine/motion.mjs';

// 02 — BARANG BASI
// A cabin at night: three seats, a rail of price tags over them. As the seats
// sell, tags are taken off the rail; when the door shuts the last ones are
// worth nothing, and the cabin goes back to being an auction lot.

const DOOR = 5.45;

const tags = [
  { cls: 'Y', price: 'Rp 700', sold: 2.1 },
  { cls: 'B', price: 'Rp 742', sold: 2.8 },
  { cls: 'M', price: 'Rp 815', sold: 3.5 },
  { cls: 'K', price: 'Rp 900', sold: 4.2 },
  { cls: 'L', price: 'Rp 1.180', sold: null },
  { cls: 'T', price: 'Rp 1.450', sold: null },
];

const RAIL_Y = 432;

/** One economy seat, seen from the aisle: bolsters, headrest, pan, armrest. */
function seat(ctx, x, y, w, h, { a = 1, lit = 0.6, sold = 0, code = '32A' } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;

  const bh = h * 0.70;            // back height
  const bw = w * 0.92;            // back width
  const bx = x + (w - bw) / 2;
  const panY = y + bh * 0.90;

  const lit0 = 0.35 + lit * 0.75;

  // floor shadow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 4, w * 0.50, 20, 0, 0, TAU);
  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.fill();
  ctx.restore();

  /* ---------------------------- seat back ---------------------------- */
  // body
  fillRR(ctx, bx, y, bw, bh, 34, linGrad(ctx, bx, y, bx, y + bh, [
    [0, `rgba(${Math.round(52 * lit0 + 22)},${Math.round(70 * lit0 + 30)},${Math.round(84 * lit0 + 34)},1)`],
    [0.45, 'rgba(30,44,56,1)'],
    [1, 'rgba(13,20,27,1)'],
  ]));

  // side bolsters catch the light on the left, shade on the right
  const bwid = bw * 0.155;
  fillRR(ctx, bx + 4, y + 8, bwid, bh - 16, 22, linGrad(ctx, bx, y, bx + bwid, y, [
    [0, `rgba(${Math.round(120 * lit0 + 40)},${Math.round(150 * lit0 + 50)},${Math.round(172 * lit0 + 56)},0.85)`],
    [1, 'rgba(28,42,54,0.30)'],
  ]));
  fillRR(ctx, bx + bw - bwid - 4, y + 8, bwid, bh - 16, 22, linGrad(ctx, bx + bw - bwid, y, bx + bw, y, [
    [0, 'rgba(20,30,40,0.45)'], [1, 'rgba(6,10,14,0.75)'],
  ]));

  // centre panel, recessed, with a vertical seam
  const px = bx + bwid + 12;
  const pw = bw - 2 * bwid - 24;
  fillRR(ctx, px, y + bh * 0.24, pw, bh * 0.66, 18, 'rgba(9,15,21,0.55)');
  fillRR(ctx, px, y + bh * 0.24, pw, bh * 0.66, 18, linGrad(ctx, 0, y + bh * 0.24, 0, y + bh, [
    [0, 'rgba(120,150,172,0.16)'], [0.5, 'rgba(120,150,172,0.02)'], [1, 'rgba(0,0,0,0.35)'],
  ]));
  // headrest
  fillRR(ctx, bx + bw * 0.20, y + bh * 0.055, bw * 0.60, bh * 0.16, 14, linGrad(ctx, 0, y + bh * 0.05, 0, y + bh * 0.22, [
    [0, 'rgba(96,124,146,0.55)'], [1, 'rgba(34,48,60,0.55)'],
  ]));
  ctx.fillStyle = 'rgba(6,10,14,0.55)';
  ctx.fillRect(bx + bw * 0.20, y + bh * 0.215, bw * 0.60, 3);

  // top rim light
  ctx.save();
  ctx.beginPath();
  rr(ctx, bx, y, bw, bh, 34);
  ctx.clip();
  ctx.fillStyle = 'rgba(226,242,255,0.13)';
  ctx.fillRect(bx, y, bw, 4);
  ctx.fillStyle = 'rgba(206,232,255,0.20)';
  ctx.fillRect(bx + 2, y + 10, 3, bh * 0.55);
  ctx.restore();

  /* ------------------------------ the pan ---------------------------- */
  const pw2 = w;
  // front face of the cushion
  fillRR(ctx, x - 2, panY, pw2 + 4, h * 0.15, 16, linGrad(ctx, 0, panY, 0, panY + h * 0.15, [
    [0, 'rgba(44,60,74,1)'], [1, 'rgba(14,21,28,1)'],
  ]));
  // top surface, lighter
  fillRR(ctx, x + 4, panY - h * 0.05, pw2 - 8, h * 0.10, 12, linGrad(ctx, 0, panY - h * 0.05, 0, panY + h * 0.05, [
    [0, `rgba(${Math.round(130 * lit0 + 30)},${Math.round(158 * lit0 + 40)},${Math.round(180 * lit0 + 44)},0.85)`],
    [1, 'rgba(52,70,84,0.55)'],
  ]));
  ctx.fillStyle = 'rgba(226,242,255,0.16)';
  ctx.fillRect(x + 12, panY - h * 0.048, pw2 - 24, 2);

  /* ----------------------------- armrests ---------------------------- */
  for (const [ax, side] of [[x - 20, -1], [x + w + 2, 1]]) {
    fillRR(ctx, ax, panY - h * 0.10, 18, h * 0.16, 8, linGrad(ctx, ax, 0, ax + 18, 0, [
      [0, side < 0 ? 'rgba(150,178,198,0.55)' : 'rgba(40,54,66,1)'],
      [1, side < 0 ? 'rgba(40,54,66,1)' : 'rgba(12,18,24,1)'],
    ]));
    ctx.fillStyle = 'rgba(210,236,255,0.14)';
    ctx.fillRect(ax + 3, panY - h * 0.095, 2, h * 0.14);
  }

  // legs
  ctx.fillStyle = 'rgba(150,174,192,0.20)';
  ctx.fillRect(x + w * 0.16, panY + h * 0.14, 8, h * 0.13);
  ctx.fillRect(x + w * 0.80, panY + h * 0.14, 8, h * 0.13);

  // seat number, etched small
  tracking(ctx, code, bx + bw * 0.5, y + bh * 0.74, {
    size: 15, font: F.mono6, track: 3, color: 'rgba(214,236,255,0.22)', align: 'center',
  });

  // the boarding card of whoever took this seat
  if (sold > 0.02) {
    ctx.save();
    ctx.globalAlpha *= sold;
    ctx.translate(bx + bw * 0.52, y + bh * 0.52);
    ctx.rotate(-0.05);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    fillRR(ctx, -bw * 0.34, -48, bw * 0.68, 96, 4, 'rgba(240,228,204,0.95)');
    ctx.restore();
    tracking(ctx, 'TERJUAL', 0, -8, {
      size: 22, font: F.mono6, track: 5, color: 'rgba(23,19,16,0.78)', align: 'center',
    });
    ctx.fillStyle = 'rgba(23,19,16,0.34)';
    for (let i = 0; i < 26; i++) {
      const wd = 1 + ((i * 7) % 3);
      ctx.fillRect(-bw * 0.30 + i * 11, 16, wd, 24);
    }
    ctx.restore();
  }

  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    nightWall(ctx, { spotX: W * 0.42, spotY: 560, spotA: 0.13, panels: 5 });
    lightCone(ctx, W * 0.42, -140, 1500, 150, 720, { color: '#CFE2F2', a: 0.05 });

    eyebrow(ctx, 'BARANG YANG CEPAT BASI', { a: a(0.05, 0.5), rule: P.cyan, color: 'rgba(246,241,230,0.62)' });

    /* ------------------------- cabin mark on the wall ------------------- */
    engraved(ctx, 'KABIN EKONOMI · 48 KURSI', 104, 318, {
      size: 22, color: 'rgba(226,238,250,0.42)', track: 5, a: a(0.02, 0.6),
    });

    /* ----------------------------- door clock --------------------------- */
    const clkA = a(0.5, 0.7) * (1 - ease.out(clamp((t - DOOR - 0.85) / 0.6)));
    if (clkA > 0.01) {
      const left = Math.max(0, DOOR - t);
      const mm = Math.floor(left / 60);
      const ss = Math.floor(left % 60);
      ctx.save();
      ctx.globalAlpha = clkA;
      const bx = W - 104 - 300;
      fillRR(ctx, bx, 262, 300, 74, 8, 'rgba(7,11,17,0.78)');
      strokeRR(ctx, bx, 262, 300, 74, 8, 'rgba(214,232,250,0.12)', 1.2);
      tracking(ctx, 'PINTU TUTUP', bx + 20, 292, {
        size: 15, font: F.mono6, track: 4, color: 'rgba(226,238,250,0.40)',
      });
      const col = left < 3 ? P.ember : P.mint;
      txt(ctx, `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, bx + 280, 316, {
        size: 40, font: F.num, color: col, align: 'right', track: 1,
      });
      ctx.restore();
    }

    /* ------------------------------- rail ------------------------------- */
    const railA = a(0.02, 0.55);
    if (railA > 0.01) {
      ctx.save();
      ctx.globalAlpha = railA;
      // brackets into the wall
      ctx.fillStyle = 'rgba(120,140,158,0.30)';
      ctx.fillRect(96, RAIL_Y - 4, 10, 44);
      ctx.fillRect(W - 106, RAIL_Y - 4, 10, 44);
      const rg = linGrad(ctx, 0, RAIL_Y, 0, RAIL_Y + 12, [
        [0, 'rgba(196,214,230,0.62)'], [0.45, 'rgba(120,140,158,0.55)'], [1, 'rgba(38,50,62,0.55)'],
      ]);
      fillRR(ctx, 96, RAIL_Y, W - 192, 12, 6, rg);
      // highlight along the top edge
      ctx.fillStyle = 'rgba(240,248,255,0.30)';
      ctx.fillRect(104, RAIL_Y + 1.5, W - 208, 1.6);
      ctx.restore();
    }

    /* -------------------------------- tags ------------------------------ */
    const n = tags.length;
    const tw = 156;
    const gap = (W - 208 - n * tw) / (n - 1);
    tags.forEach((tg, i) => {
      const x = 104 + i * (tw + gap);
      const sway = Math.sin(t * 1.15 + i * 0.9) * 0.022;
      const soldP = tg.sold == null ? 0 : clamp((t - tg.sold) / 0.55);
      const gone = ease.out(soldP);
      const zeroP = clamp((t - DOOR - 0.12) / 0.5);
      const price = zeroP > 0.5 ? 'Rp 0' : tg.price;
      const isZero = price === 'Rp 0';
      const appear = ease.out(clamp((t - 0.04 - i * 0.05) / 0.45));
      if (appear <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = appear * (1 - gone);
      ctx.translate(0, -gone * 150);
      hangTag(ctx, x, RAIL_Y + 6, 566, {
        w: tw, h: 138, rot: sway, cls: tg.cls, price,
        tone: isZero ? '#F5B23C' : '#1B2430',
      });
      ctx.restore();
    });

    /* ------------------------------- seats ------------------------------ */
    const seatA = a(0.02, 0.65);
    if (seatA > 0.01) {
      // cabin windows behind the row: cool daylight that never reaches the floor
      ctx.save();
      ctx.globalAlpha = seatA * 0.9;
      for (let i = 0; i < 4; i++) {
        const wx = 150 + i * 272;
        const wy = 708;
        const ww = 168;
        const wh = 214;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(wx + ww / 2, wy + wh / 2, ww / 2, wh / 2, 0, 0, TAU);
        ctx.clip();
        ctx.fillStyle = linGrad(ctx, 0, wy, 0, wy + wh, [
          [0, 'rgba(126,168,198,0.30)'], [0.55, 'rgba(66,102,132,0.18)'], [1, 'rgba(26,44,62,0.10)'],
        ]);
        ctx.fillRect(wx, wy, ww, wh);
        // shade pulled halfway
        ctx.fillStyle = 'rgba(8,13,19,0.55)';
        ctx.fillRect(wx, wy, ww, wh * 0.34);
        ctx.restore();
        strokeRR(ctx, wx - 10, wy - 10, ww + 20, wh + 20, 44, 'rgba(190,214,234,0.10)', 2);
      }
      ctx.restore();

      const seats = [
        { x: 74, sold: clamp((t - 2.1) / 0.6), code: '32A' },
        { x: 452, sold: clamp((t - 2.8) / 0.6), code: '32B' },
        { x: 830, sold: clamp((t - 3.5) / 0.6), code: '32C' },
      ];
      seats.forEach((s, i) => {
        seat(ctx, s.x, 780 + (1 - ease.out(clamp((t - 0.30 - i * 0.08) / 0.7))) * 50, 336, 660, {
          a: seatA, lit: 0.66 - i * 0.12, sold: s.sold, code: s.code,
        });
      });
      // the floor of the aisle
      const fg = linGrad(ctx, 0, 1330, 0, 1470, [
        [0, 'rgba(10,17,24,0.0)'], [1, 'rgba(5,9,14,0.88)'],
      ]);
      ctx.fillStyle = fg;
      ctx.fillRect(60, 1330, W - 120, 160);
    }

    /* ------------------------------- stamp ------------------------------ */
    const st = clamp((t - 5.62) / 0.20);
    if (st > 0.02) {
      const s = 1 + (1 - ease.out(st)) * 0.30;
      ctx.save();
      ctx.globalAlpha = 0.92 * clamp(st * 1.6);
      ctx.translate(W / 2 - 10, 946);
      ctx.rotate(-0.13);
      ctx.scale(s, s);
      strokeRR(ctx, -306, -70, 612, 140, 10, hexA(P.ember, 0.85), 5);
      strokeRR(ctx, -294, -58, 588, 116, 8, hexA(P.ember, 0.45), 1.6);
      txt(ctx, 'NILAINYA NOL', 0, 22, {
        size: 78, font: F.head, color: hexA(P.ember, 0.90), align: 'center', track: 2,
      });
      ctx.restore();
    }

    /* --------------------------- the lot card ---------------------------- */
    const la = a(8.95, 0.7);
    if (la > 0.01) {
      const s = ease.out(clamp((t - 8.95) / 0.8));
      ctx.save();
      ctx.globalAlpha = la;
      ctx.translate((1 - s) * -40, 0);
      const cx = 268;
      const cy = 1420;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 14;
      fillRR(ctx, cx, cy, 780, 160, 6, '#EFE3CB');
      ctx.restore();
      ctx.fillStyle = linGrad(ctx, 0, cy, 0, cy + 160, [
        [0, 'rgba(255,255,255,0.25)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(118,92,54,0.18)'],
      ]);
      fillRR(ctx, cx, cy, 780, 160, 6, ctx.fillStyle);

      tracking(ctx, 'LOT 4481 · DIBUKA LAGI', cx + 34, cy + 48, {
        size: 18, font: F.mono6, track: 4, color: 'rgba(23,19,16,0.55)',
      });
      txt(ctx, 'SEKARANG DILELANG', cx + 34, cy + 102, {
        size: 46, font: F.head, color: 'rgba(23,19,16,0.90)', track: 0.5,
      });
      barcode(ctx, cx + 560, cy + 40, 186, 78, { color: '#171310', a: 0.62, seed: 11 });
      ctx.restore();
    }
  },
};
