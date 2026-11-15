import { W, H, txt, hexA, linGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { U, ease, studio, contact, stamp, bokeh } from './_uang.mjs';
import { ghosts } from '../engine/motion.mjs';

// 06 — UANG BULAN DEPAN
// An open wallet on the table, two pockets: today, and next month. The note
// that pays for the shoes leaves next month's pocket and lands in today's —
// and it keeps the rent tag on it, because it is not free money, it is a loan.

const WW = 980;
const WX = (W - WW) / 2;
const WY = 620;
const WH = 620;

function note(ctx, x, y, w, h, a = 1, { tilt = 0 } = {}) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(tilt);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  fillRR(ctx, x, y, w, h, 6, '#D9C9A4');
  ctx.restore();
  ctx.fillStyle = linGrad(ctx, x, y, x + w, y + h, [[0, 'rgba(255,255,255,0.55)'], [1, 'rgba(150,120,70,0.28)']]);
  fillRR(ctx, x, y, w, h, 6, ctx.fillStyle);
  strokeRR(ctx, x + 8, y + 8, w - 16, h - 16, 4, 'rgba(90,70,40,0.30)', 1.4);
  ctx.fillStyle = 'rgba(90,70,40,0.22)';
  ctx.beginPath();
  ctx.arc(x + 40, y + h / 2, 16, 0, TAU);
  ctx.fill();
  txt(ctx, '100.000', x + w - 16, y + h / 2 + 12, { size: 34, font: F.num6, color: 'rgba(80,60,34,0.72)', align: 'right', track: -1 });
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const a = (s, d = 0.6) => ease.out(clamp((t - s) / d));

    studio(ctx, { t, glow: U.amber, glowX: W * 0.48, glowY: 620, glowA: 0.11, horizon: 1450 });
    bokeh(ctx, t, { a: 0.85 });

    const ha = a(0.02, 0.5);
    tracking(ctx, 'DOMPET · DUA BULAN', 104, 196, { size: 24, font: F.mono6, track: 6, color: hexA(U.bone, 0.45), alpha: ha });
    tracking(ctx, 'HARI INI ← BULAN DEPAN', W - 104, 196, { size: 24, font: F.mono6, track: 5, color: hexA(U.amber, 0.6), align: 'right', alpha: ha });

    const land = ease.expo(clamp((t - 0.10) / 0.85));
    const wy = WY + (1 - land) * 60;
    contact(ctx, W / 2, wy + WH + 10, 470, 62, 0.55 * land);

    ctx.save();
    ctx.globalAlpha = 0.3 + 0.7 * land;
    const halves = [
      { x: WX, label: 'HARI INI', sub: 'NOVEMBER' },
      { x: WX + WW / 2 + 14, label: 'BULAN DEPAN', sub: 'DESEMBER' },
    ];
    for (const hf of halves) {
      const hw = WW / 2 - 14;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.65)';
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 22;
      const g = linGrad(ctx, hf.x, wy, hf.x + hw, wy + WH, [[0, '#6B452C'], [0.4, U.leather], [1, U.leather2]]);
      fillRR(ctx, hf.x, wy, hw, WH, 22, g);
      ctx.restore();
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.05 + i * 0.012})`;
        ctx.fillRect(hf.x + 26, wy + 90 + i * 96, hw - 52, 2);
      }
      ctx.save();
      ctx.strokeStyle = 'rgba(240,220,190,0.28)';
      ctx.lineWidth = 2;
      ctx.setLineDash([9, 9]);
      strokeRR(ctx, hf.x + 16, wy + 16, hw - 32, WH - 32, 16, 'rgba(240,220,190,0.26)', 2);
      ctx.restore();

      fillRR(ctx, hf.x + 44, wy + 300, hw - 88, 250, 10, 'rgba(0,0,0,0.28)');
      tracking(ctx, hf.label, hf.x + 44, wy + 82, { size: 24, font: F.mono6, track: 6, color: hexA(U.paper, 0.72) });
      tracking(ctx, hf.sub, hf.x + hw - 44, wy + 82, { size: 20, font: F.mono6, track: 4, color: hexA(U.paper, 0.35), align: 'right' });
    }

    note(ctx, WX + 56, wy + 330, 340, 150, 0.95 * land, { tilt: -0.02 });
    note(ctx, WX + 62, wy + 348, 340, 150, 0.8 * land, { tilt: -0.01 });

    const rightX = WX + WW / 2 + 70;
    const takenOut = clamp((t - 2.5) / 0.6);
    for (let i = 0; i < 2; i++) {
      const alive = i === 0 ? 1 - takenOut : 1 - takenOut * 0.4;
      note(ctx, rightX + i * 6, wy + 330 + i * 18, 340, 150, 0.95 * alive * land, { tilt: 0.02 });
    }

    const fp = clamp((t - 2.45) / 1.55);
    if (fp > 0 && fp < 1.02) {
      const p = ease.inOut(fp);
      const x0 = rightX + 10;
      const y0 = wy + 336;
      const x1 = WX + 62;
      const y1 = wy + 348;
      const arc = -230;
      const x = lerp(x0, x1, p);
      const y = lerp(y0, y1, p) + Math.sin(p * Math.PI) * arc;
      const rot = Math.sin(p * Math.PI) * -0.22;

      ctx.save();
      ctx.globalAlpha = 0.3 * land;
      ctx.strokeStyle = hexA(U.amber, 0.55);
      ctx.lineWidth = 2.4;
      ctx.setLineDash([3, 12]);
      ctx.beginPath();
      for (let i = 0; i <= 40 * p; i++) {
        const q = i / 40;
        const xx = lerp(x0, x1, q);
        const yy = lerp(y0, y1, q) + Math.sin(q * Math.PI) * arc;
        if (i === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.restore();

      ghosts(ctx, { dx: 26 * Math.sin(p * Math.PI), dy: 16, n: 3, spread: 1.8, alpha: 0.13 }, () => note(ctx, x, y, 340, 150, 0.8, { tilt: rot }));
      note(ctx, x, y, 340, 150, 1, { tilt: rot });

      const tagA = clamp((t - 3.35) / 0.45);
      if (tagA > 0.01) {
        ctx.save();
        ctx.globalAlpha = tagA;
        ctx.translate(x + 300, y + 60);
        ctx.rotate(0.12);
        const tw = 232;
        fillRR(ctx, -tw / 2, -46, tw, 92, 8, U.ember);
        txt(ctx, 'SEWA', 0, -6, { size: 34, font: F.head, color: '#120A06', align: 'center', track: 4 });
        txt(ctx, '2,95% / BLN', 0, 30, { size: 20, font: F.mono6, color: 'rgba(18,10,6,0.7)', align: 'center', track: 2 });
        ctx.strokeStyle = 'rgba(240,220,190,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-tw / 2, -46);
        ctx.lineTo(-tw / 2 - 22, -78);
        ctx.stroke();
        ctx.restore();
      }
    }

    const ea = a(4.6, 0.6);
    if (ea > 0.01) {
      ctx.save();
      ctx.globalAlpha = ea;
      const ex = WX + WW / 2 + 14;
      const ey = wy + WH + 46;
      strokeRR(ctx, ex + 24, ey, 380, 118, 10, hexA(U.bone, 0.18), 1.6);
      tracking(ctx, 'SISA BULAN DEPAN', ex + 48, ey + 40, { size: 19, font: F.mono6, track: 4, color: hexA(U.bone, 0.38) });
      txt(ctx, '− 120.000', ex + 48, ey + 92, { size: 38, font: F.num6, color: hexA(U.ember, 0.9), track: -1 });
      ctx.restore();
    }

    const sp = clamp((t - 7.4) / 0.32);
    if (sp > 0) {
      stamp(ctx, 'DIPINJAM', W / 2, wy - 168, {
        a: clamp(sp * 2.2), rot: -0.045, size: 96, color: U.amberHi,
        scale: 1.35 - 0.35 * ease.out(sp), w: 660, h: 196, sub: 'BAYAR BULAN DEPAN',
      });
    }
  },
};
