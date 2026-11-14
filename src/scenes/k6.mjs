import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { P, eyebrow, ease, nightWall, lightCone, boardHousing, engraved, sticker } from './_fare.mjs';
import { barcode } from '../engine/motion.mjs';

// 06 — YANG BERJALAN TERUS
// An auction room after hours: the lot board, the gavel still warm, a paddle
// left on the table. The room has been open since the seats went on sale.

const STRIKE = 5.72;
const BLOCK_X = 700;
const BLOCK_Y = 1268;

/** Walnut, lit from above. */
function wood(ctx, x, y, w, h, { light = 1, r = 6 } = {}) {
  const g = linGrad(ctx, 0, y, 0, y + h, [
    [0, `rgba(${Math.round(84 * light + 18)},${Math.round(58 * light + 12)},${Math.round(36 * light + 8)},1)`],
    [0.45, `rgba(${Math.round(54 * light + 12)},${Math.round(36 * light + 8)},${Math.round(22 * light + 5)},1)`],
    [1, 'rgba(18,12,8,1)'],
  ]);
  fillRR(ctx, x, y, w, h, r, g);
  // grain
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  for (let i = 0; i < 9; i++) {
    const yy = y + 8 + ((i * 17) % Math.max(10, h - 16));
    ctx.fillStyle = `rgba(0,0,0,${0.06 + 0.06 * noise1(i, 5)})`;
    ctx.fillRect(x, yy, w, 1 + (i % 2));
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    nightWall(ctx, { spotX: W * 0.56, spotY: 520, spotA: 0.15, panels: 4 });
    lightCone(ctx, 812, -160, 1440, 130, 470, { color: '#FFD9A0', a: 0.075 });

    eyebrow(ctx, 'SEJAK KURSINYA DIJUAL', { a: a(0.05, 0.5), color: 'rgba(246,241,230,0.62)' });

    /* ------------------------------ lot board ---------------------------- */
    const bA = a(0.02, 0.6);
    if (bA > 0.01) {
      const bx = 118;
      const by = 386;
      const bw = 1204;
      const bh = 196;
      ctx.save();
      ctx.globalAlpha = bA;
      ctx.translate(0, (1 - bA) * -24);
      boardHousing(ctx, bx, by, bw, bh, { a: 1, r: 12, fill: '#0F1A20' });
      engraved(ctx, 'LOT 4481 · KABIN EKONOMI · DENPASAR', bx + 44, by + 58, {
        size: 20, color: 'rgba(214,236,250,0.50)', track: 4,
      });
      // live dot
      const pulse = 0.5 + 0.5 * Math.sin(t * 4.4);
      ctx.beginPath();
      ctx.arc(bx + bw - 300, by + 52, 7, 0, TAU);
      ctx.fillStyle = hexA(P.ember, 0.55 + 0.45 * pulse);
      ctx.fill();
      engraved(ctx, 'MASIH BERJALAN', bx + bw - 282, by + 59, {
        size: 19, color: hexA(P.ember, 0.92), track: 4,
      });
      // the standing bid
      txt(ctx, 'Rp 900.000', bx + 42, by + 148, {
        size: 74, font: F.num, color: P.bone, track: -1,
      });
      tracking(ctx, 'PENAWARAN TERAKHIR · 12:14', bx + bw - 44, by + 146, {
        size: 18, font: F.mono6, track: 4, color: 'rgba(214,236,250,0.42)', align: 'right',
      });
      ctx.restore();
    }

    /* ------------------------------- the desk ---------------------------- */
    const dA = a(0.10, 0.6);
    if (dA > 0.01) {
      ctx.save();
      ctx.globalAlpha = dA;
      const top = 1186;
      ctx.beginPath();
      ctx.moveTo(24, 1660);
      ctx.lineTo(88, top);
      ctx.lineTo(W - 88, top);
      ctx.lineTo(W - 24, 1660);
      ctx.closePath();
      ctx.fillStyle = linGrad(ctx, 0, top, 0, 1660, [
        [0, 'rgba(52,35,22,1)'], [0.30, 'rgba(34,23,14,1)'], [1, 'rgba(12,8,5,1)'],
      ]);
      ctx.fill();
      ctx.save();
      ctx.clip();
      // one lamp's pool of light on the wood
      ctx.globalCompositeOperation = 'lighter';
      const pool = radGrad(ctx, 880, 1330, 30, 560, [
        [0, 'rgba(255,196,128,0.20)'], [0.5, 'rgba(255,170,110,0.07)'], [1, 'rgba(255,160,100,0)'],
      ]);
      ctx.fillStyle = pool;
      ctx.fillRect(0, top, W, 520);
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 16; i++) {
        const yy = top + 10 + i * 32;
        ctx.fillStyle = `rgba(0,0,0,${0.06 + 0.10 * noise1(i, 9)})`;
        ctx.fillRect(0, yy, W, 2);
        ctx.fillStyle = `rgba(255,214,170,${0.012 + 0.018 * noise1(i, 3)})`;
        ctx.fillRect(0, yy + 3, W, 1.4);
      }
      ctx.restore();
      // the far edge catches a thin line of light, the near edge is a shelf
      ctx.fillStyle = 'rgba(255,216,168,0.18)';
      ctx.fillRect(88, top, W - 176, 2);
      fillRR(ctx, 24, 1632, W - 48, 30, 8, 'rgba(58,39,24,1)');
      ctx.fillStyle = 'rgba(255,216,168,0.10)';
      ctx.fillRect(30, 1634, W - 60, 2);
      ctx.restore();
    }

    /* ------------------------------- the paddle -------------------------- */
    const pA = a(1.35, 0.75);
    if (pA > 0.01) {
      ctx.save();
      ctx.globalAlpha = pA;
      // contact shadow before the card so it sits on the desk
      ctx.save();
      ctx.translate(286, 1216);
      ctx.rotate(0.0);
      ctx.beginPath();
      ctx.ellipse(0, 0, 150, 22, 0, 0, TAU);
      ctx.fillStyle = 'rgba(0,0,0,0.50)';
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(286, 1042);
      ctx.rotate(0.085);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.68)';
      ctx.shadowBlur = 44;
      ctx.shadowOffsetY = 22;
      fillRR(ctx, -96, -172, 192, 344, 6, '#EDE0C6');
      ctx.restore();
      ctx.fillStyle = linGrad(ctx, 0, -172, 0, 172, [
        [0, 'rgba(255,255,255,0.30)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(104,80,46,0.22)'],
      ]);
      fillRR(ctx, -96, -172, 192, 344, 6, ctx.fillStyle);
      fillRR(ctx, -16, -152, 32, 34, 6, 'rgba(30,24,18,0.32)');
      tracking(ctx, 'BIDDER', 0, -92, {
        size: 15, font: F.mono6, track: 5, color: 'rgba(23,19,16,0.50)', align: 'center',
      });
      txt(ctx, '07', 0, 66, {
        size: 156, font: F.num, color: 'rgba(23,19,16,0.88)', align: 'center', track: -8,
      });
      ctx.strokeStyle = 'rgba(178,58,36,0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-64, 122);
      ctx.lineTo(64, 122);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    /* ------------------------------ the gavel ---------------------------- */
    const gA = a(1.95, 0.8);
    if (gA > 0.01) {
      const BLK = { x: 636, y: 1262, w: 420, h: 118 };
      // the sound block
      ctx.save();
      ctx.globalAlpha = gA * dA;
      ctx.beginPath();
      ctx.ellipse(BLK.x + BLK.w / 2, BLK.y + BLK.h + 6, BLK.w * 0.56, 26, 0, 0, TAU);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fill();
      wood(ctx, BLK.x, BLK.y, BLK.w, BLK.h, { light: 1.25, r: 12 });
      ctx.beginPath();
      ctx.ellipse(BLK.x + BLK.w / 2, BLK.y + 4, BLK.w / 2 - 2, 24, 0, 0, TAU);
      ctx.fillStyle = linGrad(ctx, 0, BLK.y - 20, 0, BLK.y + 26, [
        [0, 'rgba(138,98,62,1)'], [1, 'rgba(64,44,27,1)'],
      ]);
      ctx.fill();
      // brass plate on the front face
      fillRR(ctx, BLK.x + 56, BLK.y + 46, 300, 50, 4, 'rgba(182,142,80,0.85)');
      tracking(ctx, 'LOT 4481', BLK.x + 78, BLK.y + 80, {
        size: 21, font: F.mono6, track: 5, color: 'rgba(30,22,12,0.82)',
      });
      barcode(ctx, BLK.x + 250, BLK.y + 54, 88, 34, { color: '#241a10', a: 0.55, seed: 4 });
      ctx.restore();

      // swing: lift and wind up, then one strike, then rest
      const up = clamp((t - 4.85) / 0.75);
      const down = clamp((t - STRIKE) / 0.30);
      const lift = (ease.out ? ease.out(up) : up) * (1 - (ease.inCubic ? ease.inCubic(down) : down));
      const bounce = Math.sin(clamp((t - STRIKE - 0.30) / 0.55) * Math.PI) * 0.06 * (t > STRIKE ? 1 : 0);

      const hx = BLK.x + BLK.w / 2 - 30;
      const hy = BLK.y - 62 - lift * 130;
      const rot = -0.10 - lift * 0.34 + bounce;

      ctx.save();
      ctx.globalAlpha = gA;
      // shadow of the gavel on the block
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(hx + 40, hy + 118, 190 + lift * 40, 26, 0, 0, TAU);
      ctx.fillStyle = `rgba(0,0,0,${0.48 - lift * 0.26})`;
      ctx.fill();
      ctx.restore();

      ctx.translate(hx, hy);
      ctx.rotate(rot);

      // handle first (behind the head), rising to the right
      ctx.save();
      ctx.rotate(0);
      const hg = linGrad(ctx, 0, -24, 0, 24, [
        [0, 'rgba(128,90,56,1)'], [0.45, 'rgba(86,60,38,1)'], [1, 'rgba(32,22,14,1)'],
      ]);
      ctx.translate(148, -8);
      ctx.rotate(-0.52);
      fillRR(ctx, 0, -21, 292, 42, 21, hg);
      ctx.fillStyle = 'rgba(255,226,190,0.16)';
      ctx.fillRect(12, -14, 268, 5);
      fillRR(ctx, 278, -24, 10, 48, 4, 'rgba(150,114,70,0.85)');
      ctx.restore();

      // the head: a turned cylinder lying on the block
      const hgw = 330;
      const hgh = 128;
      fillRR(ctx, -hgw / 2, -hgh / 2, hgw, hgh, 46, linGrad(ctx, 0, -hgh / 2, 0, hgh / 2, [
        [0, 'rgba(158,112,68,1)'], [0.40, 'rgba(96,68,42,1)'], [1, 'rgba(36,25,16,1)'],
      ]));
      for (const ex of [-hgw / 2 + 26, hgw / 2 - 26]) {
        ctx.beginPath();
        ctx.ellipse(ex, 0, 22, hgh / 2 - 6, 0, 0, TAU);
        ctx.fillStyle = linGrad(ctx, ex - 22, 0, ex + 22, 0, [
          [0, 'rgba(126,88,54,1)'], [0.55, 'rgba(60,42,26,1)'], [1, 'rgba(26,18,11,1)'],
        ]);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(196,158,96,0.70)';
      ctx.fillRect(-hgw / 2 + 58, -hgh / 2 + 8, 9, hgh - 16);
      ctx.fillRect(hgw / 2 - 67, -hgh / 2 + 8, 9, hgh - 16);
      ctx.fillStyle = 'rgba(255,236,210,0.22)';
      ctx.fillRect(-hgw / 2 + 44, -hgh / 2 + 9, hgw - 88, 5);
      ctx.restore();

      // impact: dust and one pressure ring on the block
      const imp = clamp((t - STRIKE) / 0.75);
      if (imp > 0.01 && imp < 1) {
        ctx.save();
        ctx.globalAlpha = (1 - imp) * 0.6;
        ctx.strokeStyle = 'rgba(255,217,160,0.9)';
        ctx.lineWidth = 3;
        const rr2 = 40 + imp * 210;
        ctx.beginPath();
        ctx.ellipse(BLK.x + BLK.w / 2, BLK.y + 2, rr2, rr2 * 0.28, 0, 0, TAU);
        ctx.stroke();
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * TAU;
          const d = 30 + imp * 140;
          ctx.beginPath();
          ctx.arc(BLK.x + BLK.w / 2 + Math.cos(ang) * d, BLK.y + 2 + Math.sin(ang) * d * 0.30, 3.5 * (1 - imp), 0, TAU);
          ctx.fillStyle = `rgba(255,226,190,${0.5 * (1 - imp)})`;
          ctx.fill();
        }
        ctx.restore();
      }
    }


    /* ------------------------- closing stamp ---------------------------- */
    const cs = a(7.05, 0.45);
    if (cs > 0.01) {
      const k = 1 + (1 - ease.out(clamp((t - 7.05) / 0.5))) * 0.30;
      ctx.save();
      ctx.translate(1052, 636);
      ctx.rotate(-0.05);
      ctx.scale(k, k);
      sticker(ctx, 0, 0, 'TIDAK ADA JAM TUTUP', {
        w: 520, h: 108, a: cs, sub: 'LELANGNYA TETAP JALAN', size: 38, bg: '#D9503A',
      });
      ctx.restore();
    }
    /* ------------------------------ dust motes --------------------------- */
    for (let i = 0; i < 18; i++) {
      const u = (i * 0.37 + t * 0.012) % 1;
      const x = 620 + Math.sin(i * 2.3 + t * 0.3) * 220 + (i % 5) * 60;
      const y = 180 + u * 900;
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + (i % 3) * 0.7, 0, TAU);
      ctx.fillStyle = `rgba(255,226,190,${0.08 + 0.10 * noise1(i, 2)})`;
      ctx.fill();
    }
  },
};
