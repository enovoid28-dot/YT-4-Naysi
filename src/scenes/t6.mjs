import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, micro, number, A, cue, cueWord, ease, hexA, fillRR, ribbon, TAU, clamp, lerp, rng,
} from './_malam.mjs';
import { person } from './_langit.mjs';

// 06 — LAPAR
// The kitchen at two in the morning, lit by an open door. Two hormones cross on
// the wall — the hungry one climbing, the full one falling — and the person
// standing in the cold light is the result, not the illustration.

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't6', window: false, warm: 0.32 });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wKulkas = cueWord(scene, 4, 'kulkas');
    const open = A(t, c[0] + 0.2, 1.6, ease.inOut);
    const cross = A(t, c[1] + 0.1, 1.8, ease.inOut);
    const end = A(t, wKulkas - 0.3, 1.0, ease.out);

    const fx = 596;
    const fy = 930;
    const fw = 700;
    const fh = 1070;

    // ── the light that gets out
    if (open > 0.01) {
      ctx.save();
      ctx.globalAlpha *= open;
      const spill = ctx.createRadialGradient(fx + fw * 0.5, fy + 260, 60, fx + fw * 0.5, fy + 260, 1250);
      spill.addColorStop(0, 'rgba(196,226,255,0.26)');
      spill.addColorStop(0.35, 'rgba(150,196,250,0.12)');
      spill.addColorStop(1, 'rgba(90,140,210,0)');
      ctx.fillStyle = spill;
      ctx.fillRect(-200, 200, W + 400, 2100);
      // pool on the floor
      const pool = ctx.createEllipse
        ? ctx.createRadialGradient(fx + fw * 0.4, 2050, 20, fx + fw * 0.4, 2050, 620)
        : null;
      if (pool) {
        pool.addColorStop(0, 'rgba(170,210,255,0.16)');
        pool.addColorStop(1, 'rgba(120,170,230,0)');
        ctx.save();
        ctx.translate(0, 0);
        ctx.fillStyle = pool;
        ctx.fillRect(0, 1750, W, 700);
        ctx.restore();
      }
      ctx.restore();
    }

    // ── the open door, swung out to the left
    ctx.save();
    const dw = 330 * open;
    const doorG = ctx.createLinearGradient(fx - dw, fy, fx, fy + fh);
    doorG.addColorStop(0, '#0C1018');
    doorG.addColorStop(0.7, '#151B27');
    doorG.addColorStop(1, '#0A0D14');
    ctx.fillStyle = doorG;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - dw, fy + 90);
    ctx.quadraticCurveTo(fx - dw - 26, fy + fh * 0.5, fx - dw * 0.94, fy + fh - 70);
    ctx.lineTo(fx, fy + fh);
    ctx.closePath();
    ctx.fill();
    // cold rim on the door edge
    ctx.strokeStyle = `rgba(180,215,255,${0.35 * open})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // ── the cabinet
    const body = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh);
    body.addColorStop(0, '#161C2A');
    body.addColorStop(1, '#090C13');
    fillRR(ctx, fx, fy, fw, fh, 24, body);
    ctx.strokeStyle = 'rgba(150,180,230,0.14)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── the inside
    if (open > 0.01) {
      const ix = fx + 30;
      const iy = fy + 34;
      const iw = fw - 60;
      const ih = fh - 68;
      const inner = ctx.createLinearGradient(0, iy, 0, iy + ih);
      inner.addColorStop(0, 'rgba(226,242,255,0.96)');
      inner.addColorStop(0.12, 'rgba(198,224,255,0.86)');
      inner.addColorStop(0.55, 'rgba(150,190,240,0.72)');
      inner.addColorStop(1, 'rgba(28,46,84,0.92)');
      ctx.save();
      ctx.globalAlpha *= open;
      fillRR(ctx, ix, iy, iw, ih, 14, inner);

      // the lamp strip along the top
      const lamp = ctx.createLinearGradient(0, iy, 0, iy + 160);
      lamp.addColorStop(0, 'rgba(255,255,255,0.55)');
      lamp.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lamp;
      ctx.fillRect(ix, iy, iw, 160);

      // shelves and what is left on them
      const r = rng(63);
      for (let s2 = 0; s2 < 3; s2++) {
        const y = iy + 210 + s2 * 250;
        ctx.fillStyle = 'rgba(40,64,100,0.45)';
        ctx.fillRect(ix, y, iw, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(ix, y, iw, 3);
      }
      // a carton, a jar, a bottle, a tub — food that is easy at 2 a.m.
      const milk = ctx.createLinearGradient(ix + 60, iy + 380, ix + 170, iy + 380);
      milk.addColorStop(0, 'rgba(255,250,240,0.92)');
      milk.addColorStop(1, 'rgba(214,222,236,0.9)');
      fillRR(ctx, ix + 56, iy + 210 - 170, 120, 170, 10, milk);
      ctx.fillStyle = 'rgba(255,170,120,0.75)';
      fillRR(ctx, ix + 56, iy + 150, 120, 34, 6, 'rgba(255,170,120,0.75)');
      ctx.fillStyle = 'rgba(255,210,150,0.85)';
      ctx.beginPath();
      ctx.arc(ix + 330, iy + 300, 62, 0, TAU);
      ctx.fill();
      fillRR(ctx, ix + 470, iy + 220, 74, 210, 20, 'rgba(190,230,255,0.8)');
      fillRR(ctx, ix + 96, iy + 560, 150, 120, 14, 'rgba(255,235,200,0.75)');
      ctx.fillStyle = 'rgba(120,180,140,0.7)';
      ctx.beginPath();
      ctx.ellipse(ix + 360, iy + 630, 78, 54, 0.2, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // ── the person standing in the light
    person(ctx, 1196, 2036, 620, { a: A(t, c[0] + 0.45, 1.2, ease.out) * 0.97, rim: 0.55 });

    // ── the two hormones, crossing on the wall
    if (cross > 0.01) {
      ctx.save();
      ctx.globalAlpha *= cross * 0.95;
      const up = [];
      const down = [];
      for (let i = 0; i < 12; i++) {
        const p = i / 11;
        up.push([lerp(60, 520, p), lerp(1500, 700, Math.pow(p, 1.15))]);
        down.push([lerp(60, 520, p), lerp(760, 1360, Math.pow(p, 1.1))]);
      }
      ribbon(ctx, up, { color: M.amber, lw: 10, glow: 26 });
      ribbon(ctx, down, { color: M.ice, lw: 10, glow: 22 });
      const crossP = A(t, c[1] + 1.0, 0.8, ease.out);
      micro(ctx, 'LAPAR', 528, 690, { size: 24, color: M.amber, track: 9, a: crossP });
      micro(ctx, 'KENYANG', 528, 1378, { size: 24, color: M.ice, track: 9, a: crossP });
      ctx.restore();
    }

    // ── caption 4: what is actually being looked for
    const craving = A(t, c[3] + 0.25, 0.8, ease.out) * (1 - A(t, wKulkas - 0.5, 0.7, ease.out));
    if (craving > 0.01) {
      ctx.save();
      ctx.globalAlpha *= craving;
      micro(ctx, 'YANG DICARI', 96, 520, { size: 24, color: M.faint, track: 10 });
      number(ctx, 'KARBO', 92, 626, { size: 78, color: M.gold, glow: 0.2 });
      number(ctx, 'LEMAK', 92, 744, { size: 78, color: M.ice, glow: 0.2 });
      micro(ctx, 'BUKAN SAYUR', 96, 806, { size: 24, color: M.faint, track: 9 });
      ctx.restore();
    }

    // ── caption 5: the hour the night ends
    if (end > 0.01) {
      ctx.save();
      ctx.globalAlpha *= end;
      micro(ctx, '02.14', 96, 1180, { size: 26, color: M.faint, track: 10 });
      ctx.restore();
    }
  },
};
