import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, measure, tracking, rr } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import { P, eyebrow, ease, nightWall, lightCone, engraved, sticker } from './_fare.mjs';

// 03 — TINGKAT HARGA
// The cabin's fare buckets, as a staircase of paper tags. The cheapest steps
// empty first, and the only way left is up.

const RUNGS = [
  { cls: 'Q', price: '700', at: 2.30 },
  { cls: 'V', price: '790', at: 3.05 },
  { cls: 'W', price: '880', at: 3.75 },
  { cls: 'S', price: '975', at: 4.45 },
  { cls: 'T', price: '1.070', at: null },
  { cls: 'L', price: '1.170', at: null },
  { cls: 'K', price: '1.270', at: null },
  { cls: 'H', price: '1.390', at: null },
];

const SW = 152;      // tread width
const RISE = 132;    // riser height
const DX = 46;       // depth going back
const DY = 46;
const BASE = 1452;   // y of the lowest tread
const X0 = 122;

const treadY = (i) => BASE - i * RISE;

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    nightWall(ctx, { spotX: W * 0.62, spotY: 620, spotA: 0.14, panels: 5 });
    lightCone(ctx, W * 0.66, -160, 1560, 150, 620, { color: '#FFD9A0', a: 0.06 });

    eyebrow(ctx, 'SATU KABIN · BANYAK TINGKAT', { a: a(0.05, 0.5), color: 'rgba(246,241,230,0.62)' });

    engraved(ctx, 'TANGGA HARGA · KABIN EKONOMI', 104, 318, {
      size: 21, color: 'rgba(226,238,250,0.40)', track: 5, a: a(0.14, 0.7),
    });

    /* --------------------------- the staircase -------------------------- */
    const stA = a(0.02, 0.7);
    if (stA <= 0.01) return;

    // a soft pool of light on the floor at the foot of the stairs
    const pg = radGrad(ctx, 320, 1500, 20, 460, [
      [0, 'rgba(255,205,140,0.10)'], [1, 'rgba(255,205,140,0)'],
    ]);
    ctx.fillStyle = pg;
    ctx.fillRect(0, 1180, 900, 420);

    for (let i = RUNGS.length - 1; i >= 0; i--) {
      const r = RUNGS[i];
      const ty = treadY(i);
      const x = X0 + i * SW;
      const ap = ease.out(clamp((t - 0.02 - (RUNGS.length - 1 - i) * 0.06) / 0.5));

      ctx.save();
      ctx.globalAlpha = stA * ap;
      ctx.translate(0, (1 - ap) * 26);

      // riser (front face)
      fillRR(ctx, x, ty, SW, RISE, 3, linGrad(ctx, 0, ty, 0, ty + RISE, [
        [0, 'rgba(38,50,62,1)'], [1, 'rgba(14,21,28,1)'],
      ]));
      // tread (top face, receding)
      ctx.beginPath();
      ctx.moveTo(x, ty);
      ctx.lineTo(x + SW, ty);
      ctx.lineTo(x + SW + DX, ty - DY);
      ctx.lineTo(x + DX, ty - DY);
      ctx.closePath();
      ctx.fillStyle = linGrad(ctx, 0, ty - DY, 0, ty, [
        [0, 'rgba(72,92,110,0.95)'], [1, 'rgba(40,54,68,0.95)'],
      ]);
      ctx.fill();
      // edge highlight
      ctx.strokeStyle = 'rgba(214,236,255,0.30)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, ty);
      ctx.lineTo(x + SW, ty);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.moveTo(x, ty);
      ctx.lineTo(x, ty + RISE);
      ctx.stroke();
      // concrete speckle
      for (let s = 0; s < 9; s++) {
        const sx = x + 10 + ((s * 37 + i * 13) % (SW - 20));
        const sy = ty + 14 + ((s * 53 + i * 7) % (RISE - 30));
        ctx.fillStyle = `rgba(200,222,240,${0.02 + 0.03 * noise1(s + i * 5, 4)})`;
        ctx.fillRect(sx, sy, 2, 2);
      }
      // rung number etched on the riser
      tracking(ctx, `T ${String(i + 1).padStart(2, '0')}`, x + 12, ty + 36, {
        size: 13, font: F.mono6, track: 3, color: 'rgba(210,232,250,0.26)',
      });

      /* ----------------------------- the tag ---------------------------- */
      const gone = r.at == null ? 0 : ease.inOut(clamp((t - r.at) / 0.55));
      if (gone < 0.995) {
        const tx = x + DX * 0.45 + 18;
        const tY = ty - DY - 6;
        ctx.save();
        ctx.globalAlpha *= 1 - gone;
        ctx.translate(tx + 60, tY - 46);
        ctx.rotate(-gone * 0.5 + Math.sin(t * 1.1 + i) * 0.012);
        ctx.translate(0, gone * 120);
        // shadow on the tread
        ctx.save();
        ctx.translate(-6, 44);
        ctx.fillStyle = 'rgba(0,0,0,0.40)';
        ctx.fillRect(-58, 0, 128, 12);
        ctx.restore();
        // paper
        fillRR(ctx, -60, -46, 120, 92, 3, '#F0E4CC');
        ctx.fillStyle = linGrad(ctx, 0, -46, 0, 46, [
          [0, 'rgba(255,255,255,0.35)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(112,86,50,0.22)'],
        ]);
        fillRR(ctx, -60, -46, 120, 92, 3, ctx.fillStyle);
        // the small clip that holds it
        fillRR(ctx, -8, -52, 16, 10, 3, 'rgba(196,210,224,0.55)');
        tracking(ctx, `KELAS ${r.cls}`, 0, -20, {
          size: 13, font: F.mono6, track: 3, color: 'rgba(23,19,16,0.52)', align: 'center',
        });
        txt(ctx, r.price, 0, 26, {
          size: 34, font: F.num, color: 'rgba(23,19,16,0.88)', align: 'center', track: -1,
        });
        tracking(ctx, 'RIBU', 0, 42, {
          size: 11, font: F.mono6, track: 3, color: 'rgba(23,19,16,0.40)', align: 'center',
        });
        ctx.restore();
      }

      // the empty step keeps a red chalk mark
      if (r.at != null) {
        const mk = clamp((t - r.at - 0.30) / 0.35);
        if (mk > 0.01) {
          ctx.save();
          ctx.globalAlpha = mk * 0.9;
          ctx.strokeStyle = hexA(P.ember, 0.85);
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          const mx = x + 52;
          const my = ty + 46;
          const e = ease.out(mk);
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx + 44 * e, my + 44 * e);
          ctx.moveTo(mx + 44 * e, my);
          ctx.lineTo(mx, my + 44 * e);
          ctx.stroke();
          tracking(ctx, 'HABIS', x + 110, ty + 74, {
            size: 20, font: F.mono6, track: 5, color: hexA(P.ember, 0.8 * mk),
          });
          ctx.restore();
        }
      }

      ctx.restore();
    }

    /* ------------------------- the climbing marker ---------------------- */
    const mkA = a(5.3, 0.6);
    if (mkA > 0.01) {
      // which step the price is standing on now
      const stepNow = 4 + Math.round(2 * ease.inOut(clamp((t - 7.5) / 1.1)));
      const ty = treadY(stepNow);
      const x = X0 + stepNow * SW + DX + 60;
      ctx.save();
      ctx.globalAlpha = mkA;
      // dashed rail up the side
      ctx.save();
      ctx.setLineDash([6, 10]);
      ctx.strokeStyle = 'rgba(246,241,230,0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 26, BASE + 40);
      ctx.lineTo(x + 26, ty - 40);
      ctx.stroke();
      ctx.restore();
      // the marker itself
      ctx.translate(x + 26, ty - 58);
      fillRR(ctx, -6, 0, 12, 12, 2, hexA(P.amber, 0.9));
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, -9);
      ctx.closePath();
      ctx.fillStyle = hexA(P.amber, 0.9);
      ctx.fill();
      ctx.restore();
    }

    /* ---------------------------- the sticker --------------------------- */
    const sa = a(8.9, 0.55);
    if (sa > 0.01) {
      const s = ease.expo(clamp((t - 8.9) / 0.6));
      ctx.save();
      ctx.translate(452, 566);
      ctx.rotate(-0.045);
      ctx.scale(0.88 + 0.12 * s, 0.88 + 0.12 * s);
      sticker(ctx, 0, 0, '±12 TINGKAT', {
        w: 340, h: 112, a: sa, sub: 'DI SATU KABIN YANG SAMA', size: 36, bg: '#D9503A',
      });
      ctx.restore();
    }
  },
};
