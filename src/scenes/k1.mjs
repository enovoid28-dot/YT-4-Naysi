import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking, rr, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { K, ease, depot, box, contact, grainOverlay } from './_kirim.mjs';
import { ghosts } from '../engine/motion.mjs';

// 01 — KATA GRATIS
// The sticker is the object. It says free, it sits on a parcel, and when it
// lifts there is nothing underneath it but the price you already paid.

export default {
  draw(ctx, t) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    depot(ctx, { t, glowX: W * 0.5, glowY: 600, glowA: 0.13 });

    tracking(ctx, 'CHECKOUT · 21:40', 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.bone, 0.45), alpha: a(0.02, 0.5),
    });
    tracking(ctx, 'ONGKIR', W - 104, 208, {
      size: 24, font: F.mono6, track: 6, color: hexA(K.amber, 0.62), align: 'right', alpha: a(0.02, 0.5),
    });

    const BW = 780;
    const BH = 520;
    const bx = (W - BW) / 2;
    const by = 470;

    // two parcels behind, out of focus: depth without perspective
    box(ctx, bx - 210, by + 150, 300, 220, { a: 0.30, rot: -0.05, tape: false, depth: 0.16, tint: '#7C5C34' });
    box(ctx, bx + BW - 90, by + 110, 260, 200, { a: 0.22, rot: 0.04, tape: false, depth: 0.16, tint: '#6E5130' });
    // the parcel
    const land = ease.expo(clamp((t - 0.08) / 0.75));
    box(ctx, bx, by + (1 - land) * 40, BW, BH, {
      a: 0.35 + 0.65 * land, rot: -0.012, open: 0, tape: true, mark: 'FRAGILE',
      label: false, depth: 0.20,
    });

    // the sticker: GRATIS ONGKIR, a real paper object with its own shadow
    const peel = clamp((t - 3.05) / 1.15);
    const sp = ease.inOut(peel);
    const sx = lerp(bx + BW * 0.5, bx + BW * 0.5 - 150, sp);
    const sy = lerp(by + BH * 0.66, by + BH * 0.66 - 330, sp);
    const srot = lerp(-0.03, -0.16, sp);
    const sw = 620;
    const sh = 150;
    const drawSticker = (alpha, ox = 0, oy = 0, rot = srot) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(ox, oy);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 26 + 30 * sp;
      ctx.shadowOffsetY = 10 + 18 * sp;
      fillRR(ctx, sx - sw / 2, sy - sh / 2, sw, sh, 8, K.amber);
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(sx - sw / 2 + 8, sy - sh / 2 + 7, sw - 16, 6);
      txt(ctx, 'GRATIS ONGKIR', sx, sy + 14, {
        size: 62, font: F.head, color: '#231505', align: 'center', track: 4,
      });
      txt(ctx, 'MIN. BELANJA 0', sx, sy + 52, {
        size: 18, font: F.mono6, color: 'rgba(35,21,5,0.55)', align: 'center', track: 4,
      });
      ctx.restore();
    };

    const stA = a(0.75, 0.5);
    if (stA > 0.01) {
      if (peel > 0.02 && peel < 0.98) {
        ghosts(ctx, { dx: 16, dy: 26, n: 2, spread: 1.4, alpha: 0.12 }, () => drawSticker(stA * 0.5));
      }
      drawSticker(stA * (1 - clamp((peel - 0.75) / 0.25)));

      // the peeled corner curling
      if (peel > 0.02 && peel < 1) {
        ctx.save();
        ctx.globalAlpha = stA * (1 - peel) * 0.9;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(sx - sw / 2, sy + sh / 2);
        ctx.lineTo(sx - sw / 2 + 90 * peel, sy + sh / 2);
        ctx.lineTo(sx - sw / 2, sy + sh / 2 - 70 * peel);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // what the sticker was hiding: the line item
    const ra = a(4.35, 0.6);
    if (ra > 0.01) {
      ctx.save();
      ctx.globalAlpha = ra;
      fillRR(ctx, bx + 40, by + BH * 0.34, BW - 80, 210, 10, 'rgba(4,6,10,0.72)');
      strokeRR(ctx, bx + 40, by + BH * 0.34, BW - 80, 210, 10, hexA(K.bone, 0.16), 1.5);
      const rows = [
        ['ONGKIR', '0'],
        ['BIAYA LAYANAN', '4.000'],
        ['BIAYA PENANGANAN', '8.000'],
      ];
      rows.forEach((r, i) => {
        const p = clamp((t - 4.45 - i * 0.28) / 0.4);
        if (p <= 0.001) return;
        const y = by + BH * 0.34 + 56 + i * 56;
        ctx.save();
        ctx.globalAlpha = ra * p;
        txt(ctx, r[0], bx + 78, y, { size: 24, font: F.mono6, color: hexA(K.bone, 0.5), track: 3 });
        txt(ctx, r[1], bx + BW - 78, y, {
          size: 34, font: F.num6, color: i === 0 ? K.mint : K.ember, align: 'right',
        });
        ctx.restore();
      });
      ctx.restore();
    }

    // the honest total, stamped
    const fa = a(6.6, 0.55);
    if (fa > 0.01) {
      ctx.save();
      ctx.globalAlpha = fa;
      ctx.translate(W / 2, 1190);
      ctx.rotate(-0.03);
      strokeRR(ctx, -420, -70, 840, 140, 10, hexA(K.ember, 0.85), 5);
      txt(ctx, 'YANG BAYAR: KAMU', 0, 12, {
        size: 56, font: F.head, color: K.ember, align: 'center', track: 4,
      });
      ctx.restore();
    }

    grainOverlay(ctx, t, { a: 0.05 });
  },
};
