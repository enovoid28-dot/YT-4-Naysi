import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { M, room, micro, number, A, cue, cueWord, ease, hexA, fillRR, TAU, clamp, lerp, rng } from './_malam.mjs';

// 03 — FOKUS
// The night road: a headlight cone, lane dashes that come at the viewer, and the
// one number that matters — seventeen hours awake reads like a blood-alcohol
// level. The road doubles, then smears, then goes quiet.

function road(ctx, o = {}) {
  const { a = 1, dx = 0, dy = 0, ghost = 0, blur = 0 } = o;
  if (a <= 0.01) return;
  const VX = 700 + dx;
  const VY = 900 + dy;
  ctx.save();
  ctx.globalAlpha *= a;
  // asphalt
  const g = ctx.createLinearGradient(0, VY, 0, H);
  g.addColorStop(0, ghost ? 'rgba(20,26,44,0.0)' : 'rgba(12,15,26,0.0)');
  g.addColorStop(0.35, ghost ? 'rgba(24,30,52,0.5)' : 'rgba(13,16,28,0.85)');
  g.addColorStop(1, ghost ? 'rgba(30,38,64,0.6)' : 'rgba(8,10,18,1)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(VX - 40, VY);
  ctx.lineTo(VX + 40, VY);
  ctx.lineTo(W + 320, H);
  ctx.lineTo(-320, H);
  ctx.closePath();
  ctx.fill();

  // edges
  ctx.strokeStyle = ghost ? 'rgba(150,190,255,0.10)' : 'rgba(210,228,255,0.55)';
  ctx.lineWidth = ghost ? 10 : 5 + blur * 0.02;
  ctx.beginPath();
  ctx.moveTo(VX - 34, VY);
  ctx.lineTo(-300, H);
  ctx.moveTo(VX + 34, VY);
  ctx.lineTo(W + 300, H);
  ctx.stroke();

  // centre dashes, foreshortened
  const r = rng(31);
  for (let i = 0; i < 9; i++) {
    const p = Math.pow(i / 9, 1.5);
    const q = Math.pow((i + 0.55) / 9, 1.5);
    const y0 = lerp(VY + 40, H, p);
    const y1 = lerp(VY + 40, H, q);
    const w0 = lerp(3, 26, p);
    const w1 = lerp(3, 30, q);
    const x0 = lerp(VX, VX + 6, p);
    const x1 = lerp(VX, VX + 6, q);
    ctx.fillStyle = ghost
      ? `rgba(255,214,150,${0.10 + 0.06 * r()})`
      : `rgba(255,230,186,${0.45 + 0.4 * r()})`;
    ctx.beginPath();
    ctx.moveTo(x0 - w0, y0);
    ctx.lineTo(x0 + w0, y0);
    ctx.lineTo(x1 + w1, y1);
    ctx.lineTo(x1 - w1, y1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene) {
    // night sky above the road, no room here — the road is the bedroom's opposite
    const sky = ctx.createLinearGradient(0, 0, 0, 2560);
    sky.addColorStop(0, '#04060E');
    sky.addColorStop(0.34, '#0A1120');
    sky.addColorStop(0.455, '#131B2E');
    sky.addColorStop(0.52, '#0A0D16');
    sky.addColorStop(1, '#05070D');
    ctx.fillStyle = sky;
    ctx.fillRect(-80, -80, W + 160, H + 160);

    const c = [0, 1, 2, 3, 4, 5].map((i) => cue(scene, i));
    const wFokus = cueWord(scene, 2, 'fokusmu');
    const wTiga = cueWord(scene, 4, 'tiga');
    const ghost = A(t, wFokus - 0.6, 1.4, ease.inOut);
    const smear = A(t, c[3] + 0.1, 1.6, ease.inOut);
    const dim = 1 - 0.55 * A(t, c[4] + 0.2, 1.6, ease.inOut);

    ctx.save();
    ctx.globalAlpha = dim;
    road(ctx, { a: A(t, -0.2, 1.0), dx: 0, dy: 0 });
    if (ghost > 0.01) road(ctx, { a: ghost * 0.8, dx: 34 + 8 * Math.sin(t * 1.3), dy: 10, ghost: 1 });
    if (smear > 0.01) {
      for (let i = 1; i <= 3; i++) {
        road(ctx, { a: smear * 0.22 / i, dx: 0, dy: i * 26, ghost: 1 });
      }
    }

    // headlight: the only light, low and warm
    const hg = ctx.createRadialGradient(700, 1560, 60, 700, 1560, 760);
    hg.addColorStop(0, `rgba(255,214,160,${0.20 * (1 - 0.4 * smear)})`);
    hg.addColorStop(0.45, `rgba(255,190,120,${0.07 * (1 - 0.4 * smear)})`);
    hg.addColorStop(1, 'rgba(255,180,110,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, 900, W, 1000);
    ctx.restore();

    // ── caption 2: seventeen hours
    const n17 = A(t, c[1] + 0.15, 0.7, ease.out) * (1 - A(t, c[2] - 0.05, 0.35, ease.inOut));
    if (n17 > 0.01) {
      ctx.save();
      ctx.globalAlpha *= n17;
      number(ctx, '17', 118, 660, { size: 300, color: M.ink, glow: 0.4 });
      micro(ctx, 'JAM TERJAGA', 124, 726, { size: 30, color: M.amber, track: 9 });
      micro(ctx, 'TANPA TIDUR', 124, 772, { size: 22, color: M.faint, track: 8 });
      ctx.restore();
    }

    // ── caption 3: the same number as a blood-alcohol reading
    const bac = A(t, c[2] + 0.55, 0.7, ease.out) * (1 - A(t, c[3] + 0.3, 0.6, ease.out));
    if (bac > 0.01) {
      ctx.save();
      ctx.globalAlpha *= bac;
      number(ctx, '0,05', 112, 700, { size: 250, color: M.red, glow: 0.35 });
      micro(ctx, '% ALKOHOL', 118, 766, { size: 30, color: M.ink, track: 9 });
      micro(ctx, 'SETARA', 118, 640, { size: 24, color: M.faint, track: 10 });
      ctx.restore();
    }

    // ── caption 4: three seconds
    const three = A(t, wTiga - 0.1, 0.7, ease.out);
    if (three > 0.01) {
      ctx.save();
      ctx.globalAlpha *= three * dim;
      // a black band that eats the road for three seconds
      const g = ctx.createLinearGradient(0, 1180, 0, 1420);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, `rgba(0,0,0,${0.72 * three})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-80, 1120, W + 160, 380);
      number(ctx, '3', 116, 1200, { size: 210, color: M.ink, glow: 0.4 });
      micro(ctx, 'DETIK', 262, 1264, { size: 30, color: M.amber, track: 9 });
      micro(ctx, 'MATI RASA', 118, 1310, { size: 24, color: M.faint, track: 8 });
      ctx.restore();
    }
  },
};
