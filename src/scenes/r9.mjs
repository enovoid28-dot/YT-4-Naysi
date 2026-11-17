import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, printCard, kick, num, rule, typeLabel, footer,
} from './_arsip.mjs';

// 09 — CERITA HILANG
// Three empty frames, one lit. What survives is not a film: it is a way of
// flinching, of settling, of trusting. Then the prompt.

const LIT = (g, iw, ih, ox, oy) => {
  const g0 = g.createRadialGradient(ox + iw * 0.44, oy + ih * 0.40, 8, ox + iw * 0.5, oy + ih * 0.5, iw * 0.80);
  g0.addColorStop(0, '#FDEBC8');
  g0.addColorStop(0.32, '#D3A567');
  g0.addColorStop(0.70, '#6A4726');
  g0.addColorStop(1, '#1A1109');
  g.fillStyle = g0;
  g.fillRect(ox, oy, iw, ih);
  // a figure, from behind, almost lost in the light
  const cx = ox + iw * 0.52;
  const hy = oy + ih * 0.42;
  const hr = ih * 0.17;
  // shoulders first, then the head over them
  const bodyG = g.createLinearGradient(cx - iw * 0.15, oy + ih * 0.6, cx + iw * 0.15, oy + ih);
  bodyG.addColorStop(0, 'rgba(58,38,22,0.72)');
  bodyG.addColorStop(1, 'rgba(24,15,8,0.86)');
  g.fillStyle = bodyG;
  g.beginPath();
  g.moveTo(cx - iw * 0.17, oy + ih);
  g.bezierCurveTo(cx - iw * 0.17, oy + ih * 0.74, cx - iw * 0.08, oy + ih * 0.62, cx, oy + ih * 0.62);
  g.bezierCurveTo(cx + iw * 0.08, oy + ih * 0.62, cx + iw * 0.17, oy + ih * 0.74, cx + iw * 0.17, oy + ih);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(40,26,15,0.88)';
  g.beginPath();
  g.ellipse(cx, hy, hr, hr * 1.02, 0, 0, TAU);
  g.fill();
  // hair
  g.fillStyle = 'rgba(26,17,9,0.9)';
  g.beginPath();
  g.ellipse(cx, hy - hr * 0.22, hr * 1.02, hr * 0.96, 0, 0, TAU);
  g.fill();
  g.beginPath();
  g.moveTo(cx - iw * 0.15, oy + ih);
  g.bezierCurveTo(cx - iw * 0.15, oy + ih * 0.72, cx - iw * 0.07, oy + ih * 0.60, cx, oy + ih * 0.60);
  g.bezierCurveTo(cx + iw * 0.07, oy + ih * 0.60, cx + iw * 0.15, oy + ih * 0.72, cx + iw * 0.15, oy + ih);
  g.closePath();
  g.fill();
  // rim light on the shoulders
  g.strokeStyle = 'rgba(255,226,172,0.55)';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(cx, hy, hr * 1.02, Math.PI * 0.86, Math.PI * 1.62);
  g.stroke();
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = `rgba(255,236,196,${Math.random() * 0.026})`;
    g.fillRect(ox + Math.random() * iw, oy + Math.random() * ih, 1.6, 1.6);
  }
};

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.5, lampY: 520, key: 'r9' });
    spot(ctx, W * 0.5, 640, 780, 0.12);

    const fw = 388;
    const fh = 462;
    const gap = 36;
    const totalW = fw * 3 + gap * 2;
    const fx0 = (W - totalW) / 2;
    const fy = 190;

    [{ at: 0.12, cap: 'USIA 1' }, { at: 0.26, cap: 'USIA 2' }, { at: 0.40, cap: 'USIA 3' }].forEach((f, i) => {
      const p = A(t, f.at, 0.8, ease.expo);
      if (p <= 0.01) return;
      const x = fx0 + (fw + gap) * i;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(0, (1 - p) * -26);
      contact(ctx, x + 8, fy + fh - 20, fw - 16, 76, 0.55);
      printCard(ctx, x, fy, fw, fh, {
        rot: 0,
        border: 16,
        art: (g, iw, ih, ox, oy) => {
          g.fillStyle = '#13100E';
          g.fillRect(ox, oy, iw, ih);
          g.strokeStyle = 'rgba(240,226,200,0.10)';
          g.lineWidth = 2;
          g.beginPath();
          g.ellipse(ox + iw / 2, oy + ih * 0.44, iw * 0.16, ih * 0.19, 0, 0, TAU);
          g.stroke();
        },
        caption: f.cap,
      });
      ctx.restore();
    });

    // ── the one that is left
    const pl = A(t, c(1, 0.20), 1.0, ease.expo);
    if (pl > 0.01) {
      const lw = 820;
      const lh = 420;
      const lx = (W - lw) / 2;
      const ly = 726;
      ctx.save();
      ctx.globalAlpha = pl;
      ctx.translate(0, (1 - pl) * 34);
      spot(ctx, lx + lw / 2, ly + lh / 2, 580, 0.26 * pl);
      contact(ctx, lx + 20, ly + lh - 14, lw - 40, 104, 0.62);
      printCard(ctx, lx, ly, lw, lh, { rot: -0.008, border: 20, art: LIT });
      ctx.restore();
    }

    // ── what the print holds
    const labels = [
      { s: 'TAKUT', at: c(1, 0.85) },
      { s: 'TENANG', at: c(1, 1.35) },
      { s: 'PERCAYA', at: c(1, 1.85) },
    ];
    const bw = 348;
    const bstart = (W - (bw * 3 + 44 * 2)) / 2;
    labels.forEach((L, i) => {
      const p = A(t, L.at, 0.6, ease.out);
      if (p <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = p;
      const bx = bstart + i * (bw + 44);
      const by = 1204;
      ctx.strokeStyle = hexA(K.gold, 0.7 * p);
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, 78);
      txt(ctx, L.s, bx + bw / 2, by + 52, { size: 40, font: F.display, color: K.bone, align: 'center', track: 4 });
      ctx.restore();
    });

    // ── what is actually lost
    const pz = A(t, c(2, 0.10), 0.7, ease.out);
    if (pz > 0.01) {
      ctx.save();
      ctx.globalAlpha = pz;
      txt(ctx, 'Yang hilang cuma', W / 2, 1352, {
        size: 32, font: F.mono, color: 'rgba(246,237,219,0.62)', align: 'center', track: 2,
      });
      ctx.restore();
    }

    // ── the prompt
    const pp = A(t, c(3, 0.10), 0.8, ease.out);
    if (pp > 0.01) {
      ctx.save();
      ctx.globalAlpha = pp;
      const bw2 = 1232;
      const bh2 = 216;
      const bx2 = 104;
      const by2 = 1402;
      const bg = ctx.createLinearGradient(bx2, by2, bx2, by2 + bh2);
      bg.addColorStop(0, 'rgba(248,238,214,0.97)');
      bg.addColorStop(1, 'rgba(214,198,166,0.97)');
      fillRR(ctx, bx2, by2, bw2, bh2, 5, bg);
      ctx.strokeStyle = hexA(K.red, 0.85);
      ctx.lineWidth = 4;
      ctx.strokeRect(bx2 + 16, by2 + 16, bw2 - 32, bh2 - 32);
      txt(ctx, 'MEMORI PALING AWAL YANG KAMU INGAT,', bx2 + 58, by2 + 90, {
        size: 39, font: F.display, color: '#241A12', track: 1.5,
      });
      txt(ctx, 'DAN UMUR BERAPA?', bx2 + 58, by2 + 146, {
        size: 39, font: F.display, color: '#241A12', track: 1.5,
      });
      txt(ctx, 'TULIS', bx2 + bw2 - 60, by2 + 74, {
        size: 22, font: F.mono, color: hexA(K.red, 0.92), align: 'right', track: 5,
      });
      txt(ctx, 'DI KOMENTAR', bx2 + bw2 - 60, by2 + 106, {
        size: 22, font: F.mono, color: hexA(K.red, 0.92), align: 'right', track: 5,
      });
      txt(ctx, '↓', bx2 + bw2 - 62, by2 + 176, { size: 44, font: F.display, color: K.red, align: 'right' });
      ctx.restore();
    }

    footer(ctx, { chapter: 'CERITA HILANG' });
  },
};
