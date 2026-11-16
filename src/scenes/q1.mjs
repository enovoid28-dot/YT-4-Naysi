import { W, H, txt, hexA, fillRR, strokeRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, sheet, headline, num, kick, paperCard, stampInk, circleMark, halftone, par, folio, arrow,
} from './_kertas.mjs';

// 01 — KATA LAIN
// Two columns on one sheet: the number they print, and the number they don't.

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    sheet(ctx, t, { glowX: W * 0.5, glowY: 420, glowA: 0.4 });
    folio(ctx, '01', 'KATA LAIN');

    // the masthead of the sheet
    par(ctx, cam, 0.25, () => {
      kick(ctx, 'EDISI 17', W - 88, 168, { size: 17, color: 'rgba(20,17,16,0.34)', align: 'right' });
      ctx.fillStyle = K.ink;
      ctx.fillRect(88, 208, W - 176, 3);
      halftone(ctx, W - 300, 260, 212, 150, { step: 15, a: 0.16, color: K.blue });
    });

    // ── the pair of columns
    const p0 = ease.expo(clamp((t - c(0, 0.05)) / 0.75));
    const p1 = ease.expo(clamp((t - c(1, 0.10)) / 0.7));

    const colY = 470;
    const colH = 640;
    const colW = 588;

    // left: bunga
    ctx.save();
    ctx.globalAlpha = p0;
    const lx = 88;
    const ly = colY + (1 - p0) * 34;
    paperCard(ctx, lx, ly, colW, colH, { off: 14, tone: 'rgba(20,17,16,0.16)' });
    kick(ctx, 'BUNGA', lx + 44, ly + 66, { size: 22, color: K.soft, track: 7 });
    num(ctx, '0%', lx + 44, ly + 380, { size: 300, color: K.ink, track: -14 });
    kick(ctx, 'YANG DIIKLANKAN', lx + 46, ly + colH - 56, { size: 18, color: 'rgba(20,17,16,0.38)', track: 4 });
    ctx.restore();

    // right: biaya layanan
    ctx.save();
    ctx.globalAlpha = p1;
    const rx = W - 88 - colW;
    const ry = colY + (1 - p1) * 46;
    paperCard(ctx, rx, ry, colW, colH, { fill: '#1A1613', stroke: '#1A1613', off: 14, tone: 'rgba(20,17,16,0.22)' });
    kick(ctx, 'BIAYA LAYANAN', rx + 44, ry + 66, { size: 22, color: 'rgba(246,241,228,0.55)', track: 7 });
    num(ctx, '9%', rx + 44, ry + 380, { size: 300, color: '#F6F1E4', track: -14 });
    kick(ctx, 'YANG TERTULIS KECIL', rx + 46, ry + colH - 56, { size: 18, color: 'rgba(246,241,228,0.45)', track: 4 });
    ctx.restore();

    // ── the circle around the zero
    const pc = ease.inOut(clamp((t - c(2, 0.15)) / 0.55));
    circleMark(ctx, lx + 240, ly + 280, 190, 150, pc, { color: K.red, lw: 7 });

    // ── the fine print, and the glass that finds it
    const fp = a(c(3, 0.02), 0.5);
    if (fp > 0.01) {
      ctx.save();
      ctx.globalAlpha = fp;
      ctx.fillStyle = 'rgba(20,17,16,0.14)';
      ctx.fillRect(88, 1160, W - 176, 1.6);
      kick(ctx, 'SYARAT & KETENTUAN — HALAMAN 1 DARI 9', 88, 1212, { size: 17, color: 'rgba(20,17,16,0.38)', track: 4 });
      txt(ctx, 'biaya layanan 9% · biaya penanganan 1%', 88, 1290, {
        size: 42, font: F.mono, color: 'rgba(20,17,16,0.60)', track: -0.8,
      });
      txt(ctx, 'denda 5% per bulan · administrasi Rp5.000–15.000', 88, 1354, {
        size: 34, font: F.mono, color: 'rgba(20,17,16,0.40)', track: -0.6,
      });
      ctx.fillStyle = 'rgba(20,17,16,0.10)';
      ctx.fillRect(88, 1396, 420, 1.4);
      ctx.restore();

      // the loupe travels up into the sentence
      const mv = ease.inOut(clamp((t - c(3, 0.5)) / 0.95));
      const lxp = lerp(300, 660, mv);
      const lyp = lerp(1760, 1290, mv);
      const rad = lerp(96, 168, mv);

      // shadow under the glass
      ctx.save();
      ctx.globalAlpha = 0.20 * fp;
      ctx.fillStyle = K.ink;
      ctx.beginPath();
      ctx.ellipse(lxp + 18, lyp + 26, rad * 0.98, rad * 0.98, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(lxp, lyp, rad, 0, TAU);
      ctx.clip();
      ctx.fillStyle = '#FBF5E7';
      ctx.fillRect(lxp - rad, lyp - rad, rad * 2, rad * 2);
      ctx.globalAlpha = fp;
      const sc = rad / 168;
      txt(ctx, 'biaya layanan', lxp, lyp - 6 * sc, {
        size: 40 * sc, font: F.mono6, color: K.ink, align: 'center', track: -1,
      });
      txt(ctx, '9%', lxp, lyp + 62 * sc, {
        size: 62 * sc, font: F.num, color: K.red, align: 'center', track: -2,
      });
      ctx.restore();

      // rim
      ctx.save();
      ctx.globalAlpha = fp;
      ctx.strokeStyle = 'rgba(20,17,16,0.80)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(lxp, lyp, rad, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(lxp - 4, lyp - 4, rad - 6, -2.5, -0.5);
      ctx.stroke();
      ctx.restore();

      // the red pen underline and the verdict
      const up = ease.inOut(clamp((t - c(3, 1.1)) / 0.5));
      if (up > 0.01) {
        ctx.save();
        ctx.globalAlpha = up * fp;
        ctx.strokeStyle = K.red;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(88, 1314);
        ctx.lineTo(88 + 700 * up, 1314);
        ctx.stroke();
        ctx.restore();
        stampInk(ctx, 'INI YANG KAMU BAYAR', 1030, 1470, {
          a: up * 0.95, rot: -0.07, size: 30, color: K.red,
        });
      }
    }
  },
};
