import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, printCard, stampInk, typeLabel, kick, num, rule, pin, thread, leader,
} from './_arsip.mjs';

// 01 — KOSONG
// An album page that should hold a baby. Every slot is empty, and the only
// thing in the big one is the embroidered outline of a portrait that was never
// taken.

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.30, lampY: 420, key: 'r1' });

    // ── the album page
    const p0 = ease.expo(clamp((t - 0.02) / 0.85));
    const pageW = 1096;
    const pageH = 880;
    const px = (W - pageW) / 2;
    const py = 300 + (1 - p0) * 70;

    ctx.save();
    ctx.globalAlpha = p0;
    contact(ctx, px - 20, py + 40, pageW + 40, pageH, 0.55);
    ctx.translate(px + pageW / 2, py + pageH / 2);
    ctx.rotate(-0.018 * (1 - p0));
    ctx.translate(-(px + pageW / 2), -(py + pageH / 2));

    // page
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.62)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 22;
    fillRR(ctx, px, py, pageW, pageH, 6, '#D9CCB0');
    ctx.restore();
    const pg = ctx.createLinearGradient(px, py, px + pageW, py + pageH);
    pg.addColorStop(0, '#E7DCC4');
    pg.addColorStop(0.65, '#D6C8AB');
    pg.addColorStop(1, '#BCAC8E');
    fillRR(ctx, px, py, pageW, pageH, 6, pg);

    // header of the page
    kick(ctx, 'LEMBAR 01 — ARSIP PRIBADI', px + 54, py + 74, { size: 20, color: 'rgba(40,30,24,0.45)', track: 5 });
    txt(ctx, 'USIA 0 — 3 TAHUN', px + pageW - 54, py + 74, {
      size: 20, font: F.mono, color: 'rgba(40,30,24,0.45)', align: 'right', track: 5,
    });
    ctx.fillStyle = 'rgba(40,30,24,0.22)';
    ctx.fillRect(px + 54, py + 98, pageW - 108, 1.6);

    // slot 1 — the big empty portrait
    const sx = px + 54;
    const sy = py + 140;
    const sw = 470;
    const sh = 600;
    const s0 = A(t, c(0, 0.05), 0.6, ease.out);
    ctx.save();
    ctx.globalAlpha = p0 * s0;
    // mounts
    fillRR(ctx, sx, sy, sw, sh, 3, 'rgba(24,18,14,0.92)');
    // the embossed outline of a baby that is not there
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();
    const cx = sx + sw / 2;
    const cy = sy + sh * 0.56;
    const emb = (a) => {
      ctx.strokeStyle = `rgba(226,212,186,${a})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 128, 150, 0, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 96, cy + 300);
      ctx.quadraticCurveTo(cx - 118, cy + 150, cx - 52, cy + 128);
      ctx.quadraticCurveTo(cx - 30, cy + 168, cx, cy + 170);
      ctx.quadraticCurveTo(cx + 30, cy + 168, cx + 52, cy + 128);
      ctx.quadraticCurveTo(cx + 118, cy + 150, cx + 96, cy + 300);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 46, cy - 14, 8, 0, TAU);
      ctx.moveTo(cx + 54, cy - 14);
      ctx.arc(cx + 46, cy - 14, 8, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.quadraticCurveTo(cx + 8, cy + 40, cx - 6, cy + 44);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 74, 30, 0.25 * Math.PI, 0.75 * Math.PI);
      ctx.stroke();
    };
    emb(0.12);
    emb(0.06);
    // faint corner marks
    ctx.strokeStyle = 'rgba(226,212,186,0.25)';
    ctx.lineWidth = 2;
    [[sx + 26, sy + 26, 1, 1], [sx + sw - 26, sy + 26, -1, 1], [sx + 26, sy + sh - 26, 1, -1], [sx + sw - 26, sy + sh - 26, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * 40, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * 40);
      ctx.stroke();
    });
    ctx.restore();

    // photo corners
    const corner = (x, y, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = 'rgba(228,216,192,0.9)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(54, 0);
      ctx.lineTo(0, 54);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,46,34,0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    };
    ctx.globalAlpha = p0 * s0 * 0.9;
    corner(sx + 4, sy + 4, 0);
    corner(sx + sw - 4, sy + 4, Math.PI / 2);
    corner(sx + sw - 4, sy + sh - 4, Math.PI);
    corner(sx + 4, sy + sh - 4, -Math.PI / 2);
    ctx.restore();

    // typed label under the slot
    typeLabel(ctx, 'TIDAK ADA FOTO', sx + 12, sy + sh + 46, { size: 22, rot: -0.01, a: p0 * s0 });

    // ── three small empty slots on the right
    const rx = px + 574;
    const slots = [
      { y: py + 140, h: 186, l: 'USIA 1' },
      { y: py + 356, h: 186, l: 'USIA 2' },
      { y: py + 572, h: 168, l: 'USIA 3' },
    ];
    slots.forEach((sl, i) => {
      const a = A(t, c(2, 0.10 + i * 0.22), 0.5, ease.out);
      ctx.save();
      ctx.globalAlpha = p0 * a;
      fillRR(ctx, rx, sl.y, 468, sl.h, 3, 'rgba(26,20,16,0.88)');
      ctx.strokeStyle = 'rgba(226,212,186,0.16)';
      ctx.lineWidth = 2;
      ctx.strokeRect(rx + 14, sl.y + 14, 440, sl.h - 28);
      kick(ctx, sl.l, rx + 30, sl.y + sl.h - 30, { size: 18, color: 'rgba(226,212,186,0.34)', track: 5 });
      kick(ctx, '—', rx + 438, sl.y + sl.h - 30, { size: 18, color: 'rgba(226,212,186,0.22)', align: 'right' });
      ctx.restore();
    });

    ctx.restore();

    // ── the verdict
    const st = A(t, c(1, 0.12), 0.34, ease.out);
    if (st > 0) {
      ctx.save();
      const shake = t < c(1, 0.18) ? Math.sin(t * 90) * 4 * (1 - st) : 0;
      ctx.translate(shake, 0);
      stampInk(ctx, 'KOSONG', px + 250, py + 470, {
        size: 96, rot: -0.10, a: st, color: K.red, padX: 30, padY: 22, track: 8,
      });
      ctx.restore();
    }

    // ── the tally
    const tl = A(t, c(3, 0.15), 0.7, ease.out);
    if (tl > 0) {
      ctx.save();
      ctx.globalAlpha = tl;
      const y = 1310;
      rule(ctx, 120, y - 66, 1200, { a: 0.9 });
      kick(ctx, 'TOTAL ARSIP USIA 0 — 2', 120, y - 6, { size: 20, color: K.dim, track: 6 });
      num(ctx, '0', 112, y + 150, { size: 190, color: K.redHi, track: -8 });
      txt(ctx, 'hari', 300, y + 120, { size: 54, font: F.display, color: K.bone });
      txt(ctx, 'dari 730 hari.', 300, y + 168, { size: 30, font: F.mono, color: K.dim, track: 2 });
      txt(ctx, '00 / 730', W - 120, y + 150, {
        size: 96, font: F.display, color: hexA(K.bone, 0.22), align: 'right', track: -2,
      });
      ctx.restore();
    }
  },
};
