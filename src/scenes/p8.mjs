import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, noise1 } from '../engine/anim.mjs';
import {
  D, ease, cue, room, motes, bokeh, vignette, socket, ring,
} from './_daya.mjs';

// 08 — YANG TIDUR
// The room at 1 a.m. Four small lights that never go out, and the fifth of the
// token they eat while nobody is in the room.

const ICONS = [
  { k: 'TELEVISI', sub: 'STANDBY · 2 W' },
  { k: 'ROUTER', sub: '24 JAM · 8 W' },
  { k: 'CHARGER', sub: 'NYANTOL · 0,5 W' },
  { k: 'LAMPU TERAS', sub: 'SEMALAM · 9 W' },
];

export default {
  draw(ctx, t, scene, cam) {
    const a = (s, d = 0.55) => ease.out(clamp((t - s) / d));
    const c = (i, o = 0) => cue(scene, i, o);

    room(ctx, { t, glowX: W * 0.5, glowY: 300, glowA: 0.10, horizon: 1300 });
    motes(ctx, t, { n: 34, a: 0.3, color: '#CFE6FF' });

    // a window of night in the upper third, so the darkness has a source
    const win = ease.inOut(clamp((t - c(0, 0.1)) / 0.9));
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.45 * win;
    fillRR(ctx, 400, 300, 640, 300, 8, linGrad(ctx, 0, 300, 0, 600, [[0, '#0B1622'], [1, '#050A10']]));
    strokeRR(ctx, 400, 300, 640, 300, 8, 'rgba(150,180,210,0.34)', 4);
    ctx.fillStyle = 'rgba(120,150,180,0.22)';
    ctx.fillRect(717, 300, 6, 300);
    ctx.fillRect(400, 447, 640, 5);
    ctx.fillRect(386, 596, 668, 12);
    // moon behind the glass
    const mg = ctx.createRadialGradient(880, 400, 10, 880, 400, 150);
    mg.addColorStop(0, 'rgba(226,238,250,0.55)');
    mg.addColorStop(0.35, 'rgba(190,214,238,0.18)');
    mg.addColorStop(1, 'rgba(190,214,238,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(720, 240, 320, 320);
    ctx.fillStyle = 'rgba(232,242,252,0.92)';
    ctx.beginPath();
    ctx.arc(880, 400, 34, 0, TAU);
    ctx.fill();
    for (let i = 0; i < 18; i++) {
      const sx = 420 + noise1(i * 3.7) * 600;
      const sy = 320 + noise1(i * 5.1 + 2) * 260;
      ctx.globalAlpha = (0.25 + 0.55 * noise1(i * 2.3)) * (0.7 + 0.3 * Math.sin(t * 1.6 + i));
      ctx.fillStyle = '#BFD6EA';
      ctx.fillRect(sx, sy, 2.4, 2.4);
    }
    ctx.restore();
    // moon glow spilling from the window
    ctx.save();
    ctx.globalAlpha = 0.5 * win;
    ctx.fillStyle = linGrad(ctx, 0, 600, 0, 1200, [[0, 'rgba(140,180,220,0.10)'], [1, 'rgba(140,180,220,0)']]);
    ctx.fillRect(380, 600, 680, 600);
    ctx.restore();

    // four small panels: the devices that never sleep
    const pw = 276;
    const gap = 22;
    const x0 = (W - (pw * 4 + gap * 3)) / 2;
    ICONS.forEach((I, i) => {
      const p = ease.expo(clamp((t - c(3, -0.55 + i * 0.10)) / 0.55));
      if (p <= 0.001) return;
      const x = x0 + i * (pw + gap);
      const y = 760 + (1 - p) * 26;
      ctx.save();
      ctx.globalAlpha = p;
      fillRR(ctx, x, y, pw, 250, 14, 'rgba(10,16,23,0.86)');
      strokeRR(ctx, x, y, pw, 250, 14, hexA(D.bone, 0.12), 1.4);

      // icon: a single lit dot per device, which is the whole point
      const cx = x + pw / 2;
      const cy = y + 96;
      if (i === 0) {
        fillRR(ctx, cx - 92, cy - 52, 184, 104, 6, '#0B1117');
        strokeRR(ctx, cx - 92, cy - 52, 184, 104, 6, 'rgba(200,220,240,0.16)', 1.6);
        const bl = 0.45 + 0.55 * Math.max(0, Math.sin(t * 1.4));
        ctx.save();
        ctx.globalAlpha *= bl;
        ctx.fillStyle = D.ember;
        ctx.shadowColor = D.ember;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(cx + 66, cy + 38, 5, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (i === 1) {
        fillRR(ctx, cx - 74, cy - 34, 148, 68, 10, '#101820');
        strokeRR(ctx, cx - 74, cy - 34, 148, 68, 10, 'rgba(200,220,240,0.14)', 1.4);
        for (let k = 0; k < 4; k++) {
          const on = 0.3 + 0.7 * Math.max(0, Math.sin(t * (3 + k) + k));
          ctx.fillStyle = k === 0 ? hexA(D.mint, on) : hexA(D.amber, on * 0.7);
          ctx.beginPath();
          ctx.arc(cx - 46 + k * 30, cy + 22, 4.5, 0, TAU);
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(200,220,240,0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 44, cy - 42);
        ctx.lineTo(cx - 30, cy - 62);
        ctx.moveTo(cx + 4, cy - 42);
        ctx.lineTo(cx + 18, cy - 62);
        ctx.stroke();
      } else if (i === 2) {
        socket(ctx, cx - 56, cy - 56, 112, { plug: 1 });
        ctx.strokeStyle = 'rgba(20,24,30,0.5)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 56);
        ctx.quadraticCurveTo(cx + 40, cy + 100, cx + 20, cy + 120);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(214,228,240,0.22)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 70);
        ctx.lineTo(cx, cy - 30);
        ctx.stroke();
        const fl = 0.75 + 0.25 * Math.sin(t * 2.2);
        ctx.save();
        ctx.globalAlpha *= fl;
        ctx.shadowColor = hexA(D.amber, 0.9);
        ctx.shadowBlur = 40;
        ctx.fillStyle = radGradLocal(ctx, cx, cy + 6, 0, 46, D.amber);
        ctx.beginPath();
        ctx.arc(cx, cy + 6, 22, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      tracking(ctx, I.k, cx, y + 190, { size: 17, font: F.mono6, track: 3, color: hexA(D.bone, 0.62), align: 'center' });
      tracking(ctx, I.sub, cx, y + 220, { size: 14, font: F.mono6, track: 2.4, color: hexA(D.bone, 0.32), align: 'center' });
      ctx.restore();
    });

    // the total, and the fraction of a token it eats
    const tot = a(c(2, 0.05), 0.6);
    if (tot > 0.01) {
      ctx.save();
      ctx.globalAlpha = tot;
      tracking(ctx, '20 W  ×  720 JAM', W / 2, 1180, {
        size: 40, font: F.num, track: 2, color: hexA(D.bone, 0.55), align: 'center',
      });
      txt(ctx, '14,4 kWh', W / 2, 1330, {
        size: 118, font: F.num, color: D.mint, align: 'center', track: -3,
      });
      tracking(ctx, 'SETIAP BULAN', W / 2, 1396, {
        size: 20, font: F.mono6, track: 5, color: hexA(D.mint, 0.6), align: 'center',
      });
      ctx.restore();
    }

    const frac = a(c(4, 0.05), 0.6);
    if (frac > 0.01) {
      ctx.save();
      ctx.globalAlpha = frac;
      const cx = W / 2;
      const cy = 1520;
      ring(ctx, cx, cy, 86, 0.22 * frac, { lw: 14, color: D.ember });
      txt(ctx, '1/5', cx, cy + 18, { size: 44, font: F.num, color: D.bone, align: 'center', track: -1 });
      tracking(ctx, 'TOKENMU', cx + 130, cy - 6, {
        size: 20, font: F.mono6, track: 4, color: hexA(D.ember, 0.85),
      });
      tracking(ctx, 'PERGI TANPA DIPAKAI', cx + 130, cy + 28, {
        size: 16, font: F.mono6, track: 3, color: hexA(D.bone, 0.4),
      });
      ctx.restore();
    }

    bokeh(ctx, cam, { n: 5, a: 0.08 });
    vignette(ctx, 0.56);
  },
};

function radGradLocal(ctx, x, y, r0, r1, color) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  g.addColorStop(0, hexA('#FFF4D6', 0.98));
  g.addColorStop(0.5, hexA(color, 0.8));
  g.addColorStop(1, hexA(color, 0));
  return g;
}
