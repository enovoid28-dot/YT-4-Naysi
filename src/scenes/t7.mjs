import { W, H, txt, hexA, fillRR, strokeRR } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, micro, number, clock, A, cue, cueWord, ease, ribbon, axisX, axisY, leader, pill,
  TAU, clamp, lerp, rng,
} from './_malam.mjs';

// 07 — KAFEIN
// One cup at four in the afternoon, and a curve that is nothing but arithmetic:
// half of the dose survives five hours, a quarter survives ten. By two in the
// morning it is still a quarter — and the person drinking it is asleep at ten.

const X0 = 520;
const X1 = 1324;
const YT = 736;
const YB = 1408;

const yOf = (pct) => lerp(YB, YT, pct / 105);
const xOf = (hour) => lerp(X0, X1, (hour - 16) / 10);
const dose = (hour) => 100 * Math.pow(0.5, (hour - 16) / 5);

export default {
  draw(ctx, t, scene) {
    room(ctx, { key: 't7b', window: false, warm: 0.9 });
    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wSec = cueWord(scene, 3, 'separuh');
    const wLima = cueWord(scene, 3, 'lima');
    const pour = A(t, c[0] + 0.1, 1.0, ease.out);
    const curve = A(t, wLima - 1.4, 2.6, ease.inOut);
    const night = A(t, c[4], 1.5, ease.inOut);

    /* ── the table ─────────────────────────────────────────────────────── */
    const tableY = 1600;
    const tg = ctx.createLinearGradient(0, tableY - 40, 0, H);
    tg.addColorStop(0, 'rgba(34,27,24,0.92)');
    tg.addColorStop(0.35, 'rgba(16,13,15,0.97)');
    tg.addColorStop(1, 'rgba(6,6,9,1)');
    ctx.fillStyle = tg;
    ctx.fillRect(-80, tableY, W + 160, H - tableY + 80);
    ctx.strokeStyle = 'rgba(255,206,160,0.20)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-80, tableY);
    ctx.lineTo(W + 80, tableY);
    ctx.stroke();

    /* ── the cup, sitting on it ────────────────────────────────────────── */
    const cx = 208;
    const cy = tableY - 4;
    ctx.save();
    ctx.globalAlpha *= pour;
    // shadow + reflection on the wood
    const sh = ctx.createRadialGradient(cx + 10, cy + 26, 10, cx + 10, cy + 26, 190);
    sh.addColorStop(0, 'rgba(0,0,0,0.55)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(cx - 200, cy - 10, 420, 120);
    // body
    const bodyG = ctx.createLinearGradient(cx - 118, cy, cx + 118, cy);
    bodyG.addColorStop(0, '#3A2C24');
    bodyG.addColorStop(0.35, '#1A1310');
    bodyG.addColorStop(0.72, '#0E0A09');
    bodyG.addColorStop(1, '#241812');
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.moveTo(cx - 104, cy - 208);
    ctx.lineTo(cx + 104, cy - 208);
    ctx.quadraticCurveTo(cx + 95, cy - 12, cx + 68, cy + 4);
    ctx.lineTo(cx - 68, cy + 4);
    ctx.quadraticCurveTo(cx - 95, cy - 12, cx - 104, cy - 208);
    ctx.closePath();
    ctx.fill();
    // warm rim on the near edge
    ctx.strokeStyle = 'rgba(255,196,140,0.22)';
    ctx.lineWidth = 3;
    ctx.stroke();
    // handle
    ctx.strokeStyle = '#1E1512';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(cx + 126, cy - 128, 56, -1.15, 1.15);
    ctx.stroke();
    // coffee
    const surf = ctx.createRadialGradient(cx - 22, cy - 204, 8, cx, cy - 200, 118);
    surf.addColorStop(0, 'rgba(150,88,50,0.95)');
    surf.addColorStop(0.65, 'rgba(66,35,22,0.96)');
    surf.addColorStop(1, 'rgba(30,16,10,0.98)');
    ctx.fillStyle = surf;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 208, 104, 29, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,206,150,0.26)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 208, 104, 29, 0, 0.05, Math.PI - 0.05);
    ctx.stroke();
    // steam
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(255,240,225,${0.11 - i * 0.022})`;
      ctx.lineWidth = 9 - i * 2;
      ctx.beginPath();
      for (let k = 0; k <= 24; k++) {
        const p = k / 24;
        const y = cy - 228 - p * (280 + i * 60);
        const x = cx - 44 + i * 42 + Math.sin(p * 5 + t * 1.4 + i) * (16 + i * 6);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    micro(ctx, '16.00', cx, cy + 66, { size: 30, color: M.gold, track: 5, align: 'center', a: pour });
    micro(ctx, 'KOPI PERTAMA', cx, cy + 112, { size: 24, color: M.faint, track: 5, align: 'center', a: pour });

    /* ── the chart ─────────────────────────────────────────────────────── */
    const on = A(t, c[1] - 0.2, 0.9, ease.out);
    ctx.save();
    ctx.globalAlpha *= on;
    axisY(ctx, X0, YT, YB, [[0, '100%'], [(105 - 50) / 105, '50%'], [(105 - 25) / 105, '25%'], [1, '0%']], {
      a: 1, size: 27, lab: 'rgba(255,246,232,0.46)',
    });
    axisX(ctx, X0, X1, YB, [0, 0.2, 0.4, 0.6, 0.8, 1].map((p, i) => [p, ['16.00', '18.00', '20.00', '22.00', '00.00', '02.00'][i]]), {
      a: 1, size: 25,
    });
    micro(ctx, 'KAFEIN DI DARAH', X0 - 4, YT - 46, { size: 29, color: M.dim, track: 8 });
    micro(ctx, 'JAM', X1, YB + 82, { size: 25, color: M.faint, track: 10, align: 'right', a: 1 });
    // hour gridlines
    ctx.strokeStyle = 'rgba(255,246,232,0.06)';
    ctx.lineWidth = 1.5;
    [0.25, 0.5, 0.75].forEach((pct) => {
      ctx.beginPath();
      ctx.moveTo(X0, yOf(pct * 105));
      ctx.lineTo(X1, yOf(pct * 105));
      ctx.stroke();
    });
    ctx.restore();

    // the half-life rules, drawn as a staircase the eye can follow
    const gA = A(t, wLima - 2.0, 1.0, ease.out);
    if (gA > 0.01) {
      ctx.save();
      ctx.globalAlpha *= gA;
      [[21, 50], [26, 25]].forEach(([h, pct]) => {
        const x = xOf(h);
        ctx.setLineDash([9, 11]);
        ctx.strokeStyle = 'rgba(255,220,170,0.22)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, yOf(pct));
        ctx.lineTo(x, YB);
        ctx.moveTo(X0, yOf(pct));
        ctx.lineTo(x, yOf(pct));
        ctx.stroke();
      });
      ctx.restore();
    }

    // the curve
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const h = 16 + (i / 40) * 10;
      pts.push([xOf(h), yOf(dose(h))]);
    }
    ctx.save();
    ctx.globalAlpha *= 0.22 * on;
    ribbon(ctx, pts, { color: '#FFD9A8', lw: 6, glow: 16 });
    ctx.restore();
    const drawn = Math.max(2, Math.floor(pts.length * clamp(0.05 + curve * 1.02, 0.05, 1)));
    if (curve > 0.01) {
      ctx.save();
      ribbon(ctx, pts.slice(0, drawn), { color: M.gold, lw: 11, glow: 34 });
      ctx.restore();
    }

    // the three readings
    [[16, 100, 'PAGI'], [21, 50, '5 JAM'], [26, 25, '10 JAM']].forEach(([h, pct, lab], i) => {
      const a = A(t, wLima - 1.6 + i * 0.5, 0.6, ease.out);
      if (a <= 0.01) return;
      const x = xOf(h);
      const y = yOf(pct);
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = M.gold;
      ctx.shadowColor = hexA(M.gold, 0.85);
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, TAU);
      ctx.fill();
      ctx.restore();
      if (h !== 16) {
        micro(ctx, `${pct}%`, x, y - 34, { size: 34, color: M.ink, track: 2, align: 'center', a });
        micro(ctx, lab, x, y + 44, { size: 24, color: hexA(M.gold, 0.85), track: 4, align: 'center', a });
      }
    });

    // the hour the person is asleep and the dose is still working
    const nightA = A(t, c[4] - 0.2, 0.8, ease.out);
    if (nightA > 0.01) {
      const x = xOf(22);
      ctx.save();
      ctx.globalAlpha *= nightA;
      const band = ctx.createLinearGradient(x - 60, 0, x + 60, 0);
      band.addColorStop(0, 'rgba(140,200,255,0)');
      band.addColorStop(0.5, 'rgba(140,200,255,0.16)');
      band.addColorStop(1, 'rgba(140,200,255,0)');
      ctx.fillStyle = band;
      ctx.fillRect(x - 60, YT, 120, YB - YT);
      ctx.restore();
      leader(ctx, x, yOf(dose(22)), x + 90, YT + 74, 'KAMU TIDUR', {
        a: nightA, color: M.ice, dot: M.ice, size: 28, align: 'left',
      });
    }

    /* ── the clock, which only goes forward ────────────────────────────── */
    const hour = 16 + Math.floor(clamp(night, 0, 1) * 6);
    const shown = `${String(hour % 24).padStart(2, '0')}:00`;
    ctx.save();
    ctx.globalAlpha *= A(t, c[0] + 0.2, 0.8, ease.out) * 0.95;
    clock(ctx, 108, 236, 106, shown, { color: M.amber, halo: 0.7, on: 0.95 });
    micro(ctx, 'JAM DINDING', 112, 452, { size: 24, color: M.faint, track: 8 });
    ctx.restore();
  },
};
