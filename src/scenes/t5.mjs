import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  M, room, micro, number, A, cue, cueWord, ease, hexA, fillRR, ribbon, TAU, clamp, lerp, rng,
} from './_malam.mjs';

// 05 — GULA
// What the week does to blood. A dark red field with cells drifting in it, one
// curve climbing out of the healthy band, and a threshold it was never supposed
// to reach — reached after six short nights, without anyone changing what they ate.

const BAND = 1080; // the top of the normal range
const SURF = 1520;

export default {
  draw(ctx, t, scene) {
    // a field of its own: this is inside the body, not the bedroom
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#12060A');
    g.addColorStop(0.45, '#2A0A10');
    g.addColorStop(1, '#0A0409');
    ctx.fillStyle = g;
    ctx.fillRect(-80, -80, W + 160, H + 160);

    const c = [0, 1, 2, 3, 4].map((i) => cue(scene, i));
    const wPradiabetes = cueWord(scene, 3, 'pradiabetes');
    const glow = A(t, c[0], 1.2, ease.out);
    const grow = A(t, c[2], 2.0, ease.inOut);
    const alarm = A(t, wPradiabetes - 0.4, 0.9, ease.out);
    const dim = 1 - 0.45 * A(t, c[4] + 0.2, 1.4, ease.inOut);

    // ── cells, drifting
    const r = rng(51);
    ctx.save();
    ctx.globalAlpha *= glow * dim;
    for (let i = 0; i < 34; i++) {
      const bx = r() * W;
      const by = 200 + r() * 1900;
      const x = bx + Math.sin(t * 0.30 + r() * TAU) * 26;
      const y = by + Math.cos(t * 0.24 + r() * TAU) * 20;
      const rad = 26 + r() * 30;
      const cg = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.35, rad * 0.1, x, y, rad);
      cg.addColorStop(0, 'rgba(255,120,110,0.16)');
      cg.addColorStop(0.6, 'rgba(180,30,40,0.14)');
      cg.addColorStop(1, 'rgba(120,10,25,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // ── the band that is still fine to be in
    ctx.save();
    ctx.globalAlpha *= 0.85;
    const bg = ctx.createLinearGradient(0, BAND, 0, SURF);
    bg.addColorStop(0, 'rgba(120,255,180,0.05)');
    bg.addColorStop(1, 'rgba(120,255,180,0.00)');
    ctx.fillStyle = bg;
    ctx.fillRect(-80, BAND, W + 160, SURF - BAND);
    ctx.setLineDash([18, 14]);
    ctx.strokeStyle = alarm > 0.4
      ? `rgba(255,110,90,${0.25 + 0.5 * alarm})`
      : 'rgba(150,255,200,0.30)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-80, BAND);
    ctx.lineTo(W + 80, BAND);
    ctx.stroke();
    ctx.setLineDash([]);
    micro(ctx, 'BATAS NORMAL', 112, BAND - 26, {
      size: 22, color: alarm > 0.4 ? hexA(M.red, 0.9) : 'rgba(150,255,200,0.6)', track: 8,
    });
    ctx.restore();

    // ── the curve
    const pts = [];
    const N = 26;
    for (let i = 0; i < N; i++) {
      const p = i / (N - 1);
      const x = lerp(96, 1300, p);
      const base = 1330;
      const swell = Math.pow(p, 2.3);
      const y = base - swell * (base - 880) * grow - Math.sin(p * 7 + t * 0.5) * 7;
      pts.push([x, y]);
    }
    // the line is on screen from the first frame: faint while it is only a
    // possibility, lit as the six nights do their work
    ctx.save();
    ctx.globalAlpha *= 0.55;
    ribbon(ctx, pts, { color: '#FFC79A', lw: 7, glow: 26 });
    ctx.restore();
    const drawn = Math.max(2, Math.floor(pts.length * clamp(grow * 1.15, 0.05, 1)));
    if (grow > 0.01) {
      ctx.save();
      ctx.globalAlpha *= 0.95;
      ribbon(ctx, pts.slice(0, drawn), {
        color: alarm > 0.4 ? M.red : M.gold, lw: 10, glow: 34, fill: null,
      });
      ctx.restore();
    }

    // ── caption 2: the six short nights, as six notches
    const six = A(t, c[1] + 0.1, 0.7, ease.out) * (1 - A(t, c[2] + 0.6, 0.6, ease.out));
    if (six > 0.01) {
      ctx.save();
      ctx.globalAlpha *= six;
      for (let i = 0; i < 6; i++) {
        const x = 112 + i * 88;
        const p = A(t, c[1] + 0.2 + i * 0.12, 0.5, ease.out);
        ctx.fillStyle = hexA(M.gold, 0.85 * p);
        fillRR(ctx, x, 330 - 60 * p, 52, 60 * p, 8, hexA(M.gold, 0.85 * p));
      }
      micro(ctx, '4 JAM × 6 MALAM', 112, 380, { size: 26, color: M.gold, track: 8 });
      micro(ctx, 'TANPA MENGUBAH MAKAN', 112, 424, { size: 20, color: M.faint, track: 7 });
      ctx.restore();
    }

    // ── caption 4: the crest crosses the line
    const prad = A(t, wPradiabetes - 0.2, 0.8, ease.out) * dim;
    if (prad > 0.01) {
      ctx.save();
      ctx.globalAlpha *= prad;
      micro(ctx, 'KADAR GULA', 112, 700, { size: 22, color: hexA(M.red, 0.85), track: 9 });
      number(ctx, 'PRADIABETES', 112, 806, { size: 96, color: M.ink, glow: 0.25 });
      ctx.restore();
      // the crest
      ctx.save();
      ctx.globalAlpha *= prad;
      ctx.fillStyle = M.red;
      ctx.shadowColor = hexA(M.red, 0.9);
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(pts[N - 1][0] - 40, pts[N - 1][1] + 10, 13, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  },
};
