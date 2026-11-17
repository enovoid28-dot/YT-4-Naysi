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
    const dw = 246 * open;
    const doorG = ctx.createLinearGradient(fx - dw, fy, fx, fy + fh);
    doorG.addColorStop(0, '#232C3E');
    doorG.addColorStop(0.55, '#161C29');
    doorG.addColorStop(1, '#0B0E15');
    ctx.fillStyle = doorG;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - dw, fy + 90);
    ctx.quadraticCurveTo(fx - dw - 26, fy + fh * 0.5, fx - dw * 0.94, fy + fh - 70);
    ctx.lineTo(fx, fy + fh);
    ctx.closePath();
    ctx.fill();
    // cold rim on the door edge
    ctx.strokeStyle = `rgba(190,220,255,${0.55 * open})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    // the gasket line down the inside of the door
    ctx.strokeStyle = `rgba(120,150,190,${0.30 * open})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx - dw + 22, fy + 120);
    ctx.quadraticCurveTo(fx - dw + 14, fy + fh * 0.5, fx - dw + 30, fy + fh - 96);
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
      inner.addColorStop(0, 'rgba(206,228,255,0.95)');
      inner.addColorStop(0.10, 'rgba(150,184,232,0.80)');
      inner.addColorStop(0.42, 'rgba(52,76,120,0.92)');
      inner.addColorStop(1, 'rgba(12,20,36,0.97)');
      ctx.save();
      ctx.globalAlpha *= open;
      fillRR(ctx, ix, iy, iw, ih, 14, inner);

      // the lamp strip along the top
      const lamp = ctx.createLinearGradient(0, iy, 0, iy + 210);
      lamp.addColorStop(0, 'rgba(255,255,255,0.75)');
      lamp.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lamp;
      ctx.fillRect(ix, iy, iw, 210);

      // shelves and what is left on them
      const r = rng(63);
      for (let s2 = 0; s2 < 3; s2++) {
        const y = iy + 210 + s2 * 250;
        // the glass shelf, lit along its front edge, with shadow under it
        ctx.fillStyle = 'rgba(10,18,32,0.55)';
        ctx.fillRect(ix, y + 10, iw, 26);
        ctx.fillStyle = 'rgba(180,214,255,0.55)';
        ctx.fillRect(ix, y, iw, 9);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
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
    // the floor: a shadow under the cabinet and under the person, so neither floats
    ctx.save();
    const fs = ctx.createRadialGradient(fx + fw * 0.5, 2130, 40, fx + fw * 0.5, 2130, 620);
    fs.addColorStop(0, 'rgba(0,0,0,0.55)');
    fs.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fs;
    ctx.fillRect(fx - 260, 1900, fw + 520, 420);
    ctx.beginPath();
    ctx.ellipse(1300, 2118, 172, 50, 0, 0, TAU);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fill();
    ctx.restore();
    person(ctx, 1300, 2126, 880, { a: A(t, c[0] + 0.45, 1.2, ease.out) * 0.97, rim: 1.0 });

    // ── the two hormones, crossing on the wall
    if (cross > 0.01) {
      ctx.save();
      ctx.globalAlpha *= cross * 0.95;
      const up = [];
      const down = [];
      for (let i = 0; i < 12; i++) {
        const p = i / 11;
        up.push([lerp(90, 520, p), lerp(1560, 880, Math.pow(p, 1.15))]);
        down.push([lerp(90, 520, p), lerp(900, 1480, Math.pow(p, 1.1))]);
      }
      ribbon(ctx, up, { color: M.amber, lw: 13, glow: 30 });
      ribbon(ctx, down, { color: M.ice, lw: 13, glow: 26 });
      // arrowheads: up for the hungry hormone, down for the full one
      ctx.fillStyle = M.amber;
      ctx.shadowColor = hexA(M.amber, 0.8);
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.moveTo(524, 866);
      ctx.lineTo(496, 916);
      ctx.lineTo(552, 916);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = M.ice;
      ctx.shadowColor = hexA(M.ice, 0.7);
      ctx.beginPath();
      ctx.moveTo(524, 1494);
      ctx.lineTo(496, 1444);
      ctx.lineTo(552, 1444);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      const crossP = A(t, c[1] + 1.0, 0.8, ease.out);
      micro(ctx, 'HORMON LAPAR', 452, 836, { size: 29, color: M.amber, track: 6, align: 'right', a: crossP });
      micro(ctx, 'NAIK', 452, 882, { size: 26, color: M.faint, track: 8, align: 'right', a: crossP });
      micro(ctx, 'HORMON KENYANG', 452, 1474, { size: 29, color: M.ice, track: 6, align: 'right', a: crossP });
      micro(ctx, 'TURUN', 452, 1520, { size: 26, color: M.faint, track: 8, align: 'right', a: crossP });
      ctx.restore();
    }

    // ── caption 4: what is actually being looked for
    const craving = A(t, c[3] + 0.25, 0.8, ease.out) * (1 - A(t, wKulkas - 0.5, 0.7, ease.out));
    if (craving > 0.01) {
      ctx.save();
      ctx.globalAlpha *= craving;
      micro(ctx, 'YANG DICARI', 96, 430, { size: 26, color: M.faint, track: 10 });
      ctx.fillStyle = hexA(M.gold, 0.9);
      ctx.fillRect(96, 460, 6, 132);
      number(ctx, 'KARBO', 124, 530, { size: 84, color: M.gold, glow: 0.18 });
      number(ctx, 'LEMAK', 124, 636, { size: 84, color: M.ice, glow: 0.18 });
      micro(ctx, 'BUKAN SAYUR', 100, 716, { size: 26, color: M.faint, track: 9 });
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
