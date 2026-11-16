import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp } from '../engine/anim.mjs';
import { K, ease, depot, box, contact, cue, vignette } from './_kirim.mjs';
import { ghosts } from '../engine/motion.mjs';

// 01 — KATA GRATIS
// One parcel, one sticker, one honest number. Every beat is cued to the take:
// the sticker lands on "gratis ongkir", it lifts on "tapi ada yang membayarnya",
// and the three fees land on "bukan platform".

export default {
  draw(ctx, t, scene) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);
    depot(ctx, { t, glowX: W * 0.5, glowY: 560, glowA: 0.13, horizon: 1240 });

    const BW = 820;
    const BH = 560;
    const bx = (W - BW) / 2;
    const by = 470;

    box(ctx, bx - 170, by + 210, 300, 210, { a: 0.28, rot: -0.05, tape: false, depth: 0.15, tint: '#7A5934' });
    box(ctx, bx + BW - 60, by + 170, 250, 180, { a: 0.20, rot: 0.04, tape: false, depth: 0.15, tint: '#6C4F2E' });

    const land = ease.expo(clamp((t - 0.05) / 0.6));
    box(ctx, bx, by + (1 - land) * 50, BW, BH, {
      a: 0.45 + 0.55 * land, rot: -0.01, tape: true, mark: '', depth: 0.18,
    });

    // ── the sticker lands on "gratis ongkir"
    const sd = ease.expo(clamp((t - c(0, 0.15)) / 0.5));
    const peel = clamp((t - c(2, 0.05)) / 0.9);
    const px = lerp(bx + BW / 2, bx + BW / 2 - 120, peel);
    const py = lerp(by + BH * 0.55, by - 210, ease.inOut(peel));
    const prot = lerp(-0.03, -0.18, peel);
    const SW = 660;
    const SH = 168;
    const tint = 1 - clamp((peel - 0.55) / 0.45);

    const sticker = (al) => {
      ctx.save();
      ctx.globalAlpha = al;
      ctx.translate(px, py);
      ctx.rotate(prot);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 26 + 34 * peel;
      ctx.shadowOffsetY = 12 + 20 * peel;
      fillRR(ctx, -SW / 2, -SH / 2, SW, SH, 10, K.amber);
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.26)';
      ctx.fillRect(-SW / 2 + 10, -SH / 2 + 9, SW - 20, 8);
      txt(ctx, 'GRATIS ONGKIR', 0, 6, { size: 70, font: F.head, color: '#231505', align: 'center', track: 3 });
      txt(ctx, 'ONGKIR Rp 0', 0, 56, { size: 24, font: F.mono6, color: 'rgba(35,21,5,0.6)', align: 'center', track: 3 });
      ctx.restore();
    };

    if (sd > 0.01 && tint > 0.01) {
      if (peel > 0.03 && peel < 0.97) {
        ghosts(ctx, { dx: 18, dy: 24, n: 2, spread: 1.4, alpha: 0.13 }, () => sticker(sd * tint * 0.45));
      }
      sticker(sd * tint);
    }

    // ── the three fees land on "bukan platform"
    const feeRows = [
      ['BIAYA LAYANAN', '4.000'],
      ['BIAYA PENANGANAN', '8.000'],
      ['ONGKIR DIAM-DIAM', '6.000'],
    ];
    const fp = a(c(3, 0.15), 0.5);
    if (fp > 0.01) {
      ctx.save();
      ctx.globalAlpha = fp;
      fillRR(ctx, bx + 50, by + BH * 0.30, BW - 100, 300, 14, 'rgba(4,7,11,0.86)');
      strokeRR(ctx, bx + 50, by + BH * 0.30, BW - 100, 300, 14, hexA(K.bone, 0.16), 2);
      ctx.restore();
      feeRows.forEach((r, i) => {
        const q = a(c(3, 0.35 + i * 0.45), 0.4);
        if (q <= 0.01) return;
        const y = by + BH * 0.30 + 76 + i * 76;
        ctx.save();
        ctx.globalAlpha = fp * q;
        txt(ctx, r[0], bx + 96, y, { size: 26, font: F.mono6, color: hexA(K.bone, 0.55), track: 3 });
        txt(ctx, r[1], bx + BW - 96, y, { size: 42, font: F.num6, color: K.ember, align: 'right' });
        ctx.fillStyle = hexA(K.bone, 0.10);
        ctx.fillRect(bx + 96, y + 26, BW - 192, 1.4);
        ctx.restore();
      });
    }

    // ── the verdict
    const v = a(c(3, 2.0), 0.5);
    if (v > 0.01) {
      ctx.save();
      ctx.globalAlpha = v;
      ctx.translate(W / 2, 1210);
      ctx.rotate(-0.025);
      strokeRR(ctx, -430, -74, 860, 148, 12, hexA(K.ember, 0.9), 6);
      txt(ctx, 'YANG BAYAR: KAMU', 0, 10, { size: 62, font: F.head, color: K.ember, align: 'center', track: 4 });
      ctx.restore();
    }

    vignette(ctx, 0.5);
  },
};
