import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, printCard, stampInk, typeLabel, kick, num, rule, pin, thread, stat, footer,
} from './_arsip.mjs';

// 01 — KOSONG
// One print, large, where the baby should be. The glass carries the shape of a
// face that was never photographed.

const ART = (g, iw, ih, ox, oy) => {
  const bg = g.createLinearGradient(ox, oy, ox + iw, oy + ih);
  bg.addColorStop(0, '#221E19');
  bg.addColorStop(0.5, '#15120F');
  bg.addColorStop(1, '#0B0A09');
  g.fillStyle = bg;
  g.fillRect(ox, oy, iw, ih);
  const gl = g.createRadialGradient(ox + iw * 0.32, oy + ih * 0.16, 10, ox + iw * 0.32, oy + ih * 0.16, iw * 0.9);
  gl.addColorStop(0, 'rgba(255,214,160,0.20)');
  gl.addColorStop(1, 'rgba(255,214,160,0)');
  g.fillStyle = gl;
  g.fillRect(ox, oy, iw, ih);
  const cx = ox + iw * 0.5;
  const cy = oy + ih * 0.52;
  const emb = (al, lw) => {
    g.strokeStyle = `rgba(244,232,208,${al})`;
    g.lineWidth = lw;
    g.beginPath();
    g.ellipse(cx, cy, iw * 0.155, ih * 0.165, 0, 0, TAU);
    g.stroke();
    g.beginPath();
    g.moveTo(cx - iw * 0.125, cy + ih * 0.40);
    g.bezierCurveTo(cx - iw * 0.165, cy + ih * 0.19, cx - iw * 0.05, cy + ih * 0.155, cx, cy + ih * 0.16);
    g.bezierCurveTo(cx + iw * 0.05, cy + ih * 0.155, cx + iw * 0.165, cy + ih * 0.19, cx + iw * 0.125, cy + ih * 0.40);
    g.stroke();
  };
  emb(0.11, 5);
  emb(0.05, 12);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(255,240,214,${Math.random() * 0.018})`;
    g.fillRect(ox + Math.random() * iw, oy + Math.random() * ih, 1.6, 1.6);
  }
};

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.4, lampY: 400, key: 'r1' });
    spot(ctx, W * 0.5, 700, 820, 0.15);

    const pw = 940;
    const ph = 1030;
    const px = (W - pw) / 2 - 14;
    const py = 200;

    const p0 = A(t, 0.10, 1.0, ease.expo);
    if (p0 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p0;
      contact(ctx, px + 20, py + ph - 40, pw - 40, 130, 0.62);
      ctx.translate(0, (1 - p0) * 80);
      printCard(ctx, px, py, pw, ph, { rot: -0.014, border: 28, tape: 1, art: ART, caption: 'USIA 0 — 2' });
      ctx.restore();
    }

    const pt = A(t, c(1, 0.05), 0.8, ease.out);
    if (pt > 0.01) pin(ctx, px + pw * 0.5, py - 4, 1.05);

    const st = A(t, c(2, 0.05), 0.30, ease.out);
    if (st > 0.01) {
      const shake = t < c(2, 0.12) ? Math.sin(t * 95) * 5 * (1 - st) : 0;
      ctx.save();
      ctx.translate(shake, 0);
      stampInk(ctx, 'KOSONG', W * 0.5 - 22, py + ph * 0.44, {
        size: 136, rot: -0.085, a: st, color: K.red, padX: 36, padY: 28, track: 10,
      });
      ctx.restore();
    }

    typeLabel(ctx, 'FOTO TIDAK PERNAH DIAMBIL', px + 24, py + ph + 62, { size: 21, a: A(t, c(2, 0.3), 0.5) });

    const pv = A(t, c(4, 0.10), 0.7, ease.out);
    if (pv > 0.01) {
      ctx.save();
      ctx.globalAlpha = pv;
      stat(ctx, 104, 1508, { label: 'TERCATAT DARI USIA 0 — 2', value: '0', sub: 'dari 730 hari.', color: K.redHi, size: 150, w: 520 });
      txt(ctx, '730', W - 104, 1436, { size: 84, font: F.display, color: hexA(K.bone, 0.24), align: 'right', track: -3 });
      kick(ctx, 'HARI YANG ADA', W - 104, 1484, { size: 20, color: 'rgba(246,237,219,0.28)', align: 'right', track: 7 });
      ctx.restore();
    }

    footer(ctx, { chapter: 'KOSONG' });
  },
};
