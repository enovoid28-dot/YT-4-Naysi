import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, micro, number, clock, A, cue, cueWord, ease, hexA, fillRR, ribbon, TAU, clamp, lerp, rng,
} from './_malam.mjs';

// 07 — KAFEIN
// A cup at four in the afternoon, and a line that only goes one way: half of the
// dose is still in the blood five hours later, a quarter five hours after that.
// The clock on the wall keeps moving forward while the coffee does not leave.

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't7', window: false, warm: 0.9 });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wLima = cueWord(scene, 3, 'lima');
    const pour = A(t, c[0] + 0.1, 1.0, ease.out);
    const curve = A(t, wLima - 0.6, 2.4, ease.inOut);
    const night = A(t, c[4], 1.4, ease.inOut);

    // ── table
    const tableY = 1620;
    const tg = ctx.createLinearGradient(0, tableY - 40, 0, H);
    tg.addColorStop(0, 'rgba(30,24,22,0.9)');
    tg.addColorStop(0.4, 'rgba(14,12,14,0.96)');
    tg.addColorStop(1, 'rgba(6,6,9,1)');
    ctx.fillStyle = tg;
    ctx.fillRect(-80, tableY, W + 160, H - tableY + 80);
    ctx.strokeStyle = 'rgba(255,206,160,0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-80, tableY);
    ctx.lineTo(W + 80, tableY);
    ctx.stroke();

    // ── the cup
    const cx = 420;
    const cy = tableY - 6;
    const cupA = pour;
    ctx.save();
    ctx.globalAlpha *= cupA;
    const bodyG = ctx.createLinearGradient(cx - 130, cy, cx + 130, cy);
    bodyG.addColorStop(0, '#2A211C');
    bodyG.addColorStop(0.45, '#140F0D');
    bodyG.addColorStop(1, '#0C0908');
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.moveTo(cx - 128, cy - 250);
    ctx.lineTo(cx + 128, cy - 250);
    ctx.quadraticCurveTo(cx + 118, cy - 10, cx + 84, cy + 6);
    ctx.lineTo(cx - 84, cy + 6);
    ctx.quadraticCurveTo(cx - 118, cy - 10, cx - 128, cy - 250);
    ctx.closePath();
    ctx.fill();
    // handle
    ctx.strokeStyle = '#191311';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(cx + 150, cy - 150, 66, -1.2, 1.2);
    ctx.stroke();
    // the coffee surface
    const surf = ctx.createRadialGradient(cx - 20, cy - 246, 10, cx, cy - 240, 140);
    surf.addColorStop(0, 'rgba(120,70,40,0.9)');
    surf.addColorStop(0.7, 'rgba(60,32,20,0.95)');
    surf.addColorStop(1, 'rgba(30,16,10,0.98)');
    ctx.fillStyle = surf;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 250, 126, 34, 0, 0, TAU);
    ctx.fill();
    // steam
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(255,240,225,${0.10 - i * 0.02})`;
      ctx.lineWidth = 8 - i * 2;
      ctx.beginPath();
      for (let k = 0; k <= 24; k++) {
        const p = k / 24;
        const y = cy - 268 - p * (300 + i * 60);
        const x = cx - 50 + i * 46 + Math.sin(p * 5 + t * 1.4 + i) * (18 + i * 6);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // ── the decay line: 100 % → 50 % → 25 %, one half-life per two marks
    const pts = [];
    const x0 = 700;
    const x1 = 1300;
    const yTop = 760;
    const half = 240;
    for (let i = 0; i <= 24; i++) {
      const p = i / 24;
      pts.push([lerp(x0, x1, p), yTop + half * (1 - Math.pow(0.5, p * 2.4))]);
    }
    ctx.save();
    ctx.globalAlpha *= 0.45;
    ribbon(ctx, pts, { color: '#FFD9A8', lw: 6, glow: 20 });
    ctx.restore();
    const drawn = Math.max(2, Math.floor(pts.length * clamp(curve, 0.03, 1)));
    if (curve > 0.02) {
      ctx.save();
      ctx.globalAlpha *= 0.95;
      ribbon(ctx, pts.slice(0, drawn), { color: M.gold, lw: 8, glow: 28 });
      ctx.restore();
    }

    // the hour marks and the three doses that remain
    ctx.save();
    ctx.globalAlpha *= 0.95;
    const marks = [
      { p: 0.0, lab: '16.00', dose: '100%' },
      { p: 0.5, lab: '21.00', dose: '50%' },
      { p: 1.0, lab: '02.00', dose: '25%' },
    ];
    marks.forEach((mk, i) => {
      const a = A(t, wLima - 0.3 + i * 0.55, 0.7, ease.out);
      if (a <= 0.01) return;
      const x = lerp(x0, x1, mk.p);
      const y = yTop + half * (1 - Math.pow(0.5, mk.p * 2.4));
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.setLineDash([8, 10]);
      ctx.strokeStyle = 'rgba(255,233,184,0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, 1520);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = M.gold;
      ctx.shadowColor = hexA(M.gold, 0.8);
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, TAU);
      ctx.fill();
      ctx.restore();
      micro(ctx, mk.lab, x, 1560, { size: 24, color: M.faint, track: 6, align: 'center', a });
      micro(ctx, mk.dose, x, y - 40, { size: 26, color: M.gold, track: 4, align: 'center', a });
    });
    ctx.restore();

    // ── the clock, which is the only thing that keeps going
    const clk = 16 + Math.floor(clamp(night, 0, 1) * 6);
    const shown = `0${Math.min(22, clk)}:00`.replace(/^0(\d\d)/, '$1');
    ctx.save();
    ctx.globalAlpha *= A(t, c[0] + 0.2, 0.8, ease.out) * 0.95;
    clock(ctx, 112, 300, 132, shown, { color: M.amber, halo: 0.7, on: 0.95 });
    micro(ctx, 'JAM DINDING', 118, 470, { size: 20, color: M.faint, track: 8 });
    ctx.restore();
  },
};
