import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, drawRule, material } from './_ocean.mjs';

// 01 — TIGA PER EMPAT. An ocean seen from above, then the arithmetic of how
// little of it we actually know. The 71% is not a caption, it is the picture.

const WAVE = (x, t, y0, amp, f, sp) => y0 + Math.sin(x * f + t * sp) * amp + Math.sin(x * f * 2.3 + t * sp * 1.7) * amp * 0.4;

const HORIZON = 806;
const SUN = { x: 902, y: 782, r: 42 };

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    /* ------------------------------- sky -------------------------------- */
    const sky = linGrad(ctx, 0, -240, 0, HORIZON, [
      [0, '#050D14'], [0.35, '#0A1E28'], [0.68, '#1B3B41'], [0.9, '#4C6058'], [1, '#8A7C5E'],
    ]);
    ctx.fillStyle = sky;
    ctx.fillRect(-240, -260, W + 480, HORIZON + 260);

    // thin high cloud, warmed near the sun
    ctx.save();
    const cl = rng(9);
    let cy2 = 150;
    for (let i = 0; i < 8; i++) {
      cy2 += 46 + cl() * 62;
      const y = cy2;
      const h = 5 + cl() * 12;
      const g = linGrad(ctx, 0, y - h, 0, y + h, [
        [0, hexA('#7E8E84', 0)],
        [0.45, hexA(i > 4 ? '#C9A87E' : '#71837F', 0.045 + i * 0.008)],
        [1, hexA('#71837F', 0)],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(-200, y - h, W + 400, h * 2);
    }
    ctx.restore();

    // the sun sits just above the waterline: a disc, one tight halo, no bloom
    ctx.save();
    const halo = radGrad(ctx, SUN.x, SUN.y, SUN.r * 0.6, SUN.r * 4.2, [
      [0, 'rgba(255,206,142,0.30)'], [0.45, 'rgba(232,163,74,0.10)'], [1, 'rgba(232,163,74,0)'],
    ]);
    ctx.fillStyle = halo;
    ctx.fillRect(SUN.x - 260, SUN.y - 260, 520, 520);
    ctx.beginPath();
    ctx.arc(SUN.x, SUN.y, SUN.r, 0, TAU);
    const sg = radGrad(ctx, SUN.x, SUN.y - 8, 0, SUN.r, [[0, '#FFF4DA'], [0.7, '#FFE2AE'], [1, '#F3C27E']]);
    ctx.fillStyle = sg;
    ctx.fill();
    ctx.restore();

    // horizon: a hairline, and the warm band where sea meets air
    ctx.save();
    const hb = linGrad(ctx, 0, HORIZON - 26, 0, HORIZON + 10, [
      [0, 'rgba(232,163,74,0)'], [0.7, 'rgba(238,190,132,0.30)'], [1, 'rgba(238,190,132,0)'],
    ]);
    ctx.fillStyle = hb;
    ctx.fillRect(-200, HORIZON - 26, W + 400, 40);
    ctx.strokeStyle = 'rgba(226,232,220,0.22)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-120, HORIZON);
    ctx.lineTo(W + 120, HORIZON);
    ctx.stroke();
    ctx.restore();

    /* ------------------------------- sea -------------------------------- */
    const sea = linGrad(ctx, 0, HORIZON, 0, H + 200, [
      [0, '#5E6150'], [0.035, '#2C4644'], [0.10, '#153A40'], [0.32, '#0A2730'], [0.66, '#04141B'], [1, '#01070A'],
    ]);
    ctx.fillStyle = sea;
    ctx.fillRect(-240, HORIZON, W + 480, H - HORIZON + 260);
    material(ctx, 'haze', { x: -200, y: HORIZON, w: W + 400, h: H - HORIZON, a: 0.14, s: 1.8 });

    // sun path: flat reflections that widen and break up with distance
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gl = rng(17);
    for (let i = 0; i < 110; i++) {
      const u = i / 109;
      const y = HORIZON + 4 + Math.pow(u, 1.35) * 900;
      const wid = 18 + Math.pow(u, 1.1) * 300;
      const cx = SUN.x + Math.sin(t * 1.1 + i * 1.9) * (6 + u * 26) + (gl() - 0.5) * u * 40;
      const a = Math.pow(1 - u, 2.1) * 0.30 * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.6 + i * 1.4)));
      if (a <= 0.002) continue;
      const g = linGrad(ctx, cx - wid, 0, cx + wid, 0, [
        [0, hexA('#F6C88C', 0)], [0.5, hexA('#FBE0BA', a)], [1, hexA('#F6C88C', 0)],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(cx - wid, y, wid * 2, 5 + u * 12);
    }
    ctx.restore();

    // swell: a handful of long bands, each catching a little sky
    for (let L = 0; L < 5; L++) {
      const yy = HORIZON + 26 + L * 148;
      ctx.save();
      ctx.globalAlpha = 0.22 - L * 0.035;
      ctx.strokeStyle = L === 0 ? '#C8D8CE' : '#8FB4AE';
      ctx.lineWidth = 1.9 - L * 0.24;
      ctx.beginPath();
      for (let x = -140; x <= W + 140; x += 12) {
        const y = WAVE(x, t + L * 3, yy, 4 + L * 3.4, 0.0105 + L * 0.0033, 0.85);
        if (x === -140) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // a horizon label, so the frame is measured like a chart
    ctx.save();
    ctx.globalAlpha = at(t, 0.8, 0.9) * 0.42;
    tracking(ctx, 'PERMUKAAN · 0 M', W - 112, HORIZON - 26, {
      size: 19, font: F.mono6, track: 5, align: 'right', color: hexA(O.pale, 0.75),
    });
    drawRule(ctx, W - 112, W - 240, HORIZON - 6, at(t, 0.8, 0.9), { color: O.pale, a: 0.32, lw: 1.2 });
    ctx.restore();

    /* ---------------------------- the number --------------------------- */
    const p = at(t, 0.4, 1.0, EA.out);
    const cPct = at(t, 0.8, 1.7);
    const pct = Math.round(lerp(0, 71, cPct));

    drawRule(ctx, 110, 110 + 420 * at(t, 1.1, 0.9), 1004, 1, { color: O.aqua, a: 0.5 });
    tracking(ctx, 'PERMUKAAN BUMI YANG TERTUTUP AIR', 112, 966, {
      size: 24, font: F.mono6, track: 5, color: hexA(O.pale, 0.62), alpha: p,
    });

    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate(0, (1 - p) * 22);
    txt(ctx, `${pct}`, 108, 1244, { size: 300, font: F.num, color: O.bone, track: -10, alpha: 0.97 });
    const nw = measure(ctx, `${pct}`, 300, F.num, -10);
    txt(ctx, '%', 116 + nw + 6, 1244, { size: 148, font: F.num, color: O.aqua, track: -2, alpha: 0.95 });
    ctx.restore();

    /* --------------------------- coverage bars ------------------------- */
    // The comparison that stings: Mars is mapped to the metre, the seafloor is
    // not. A single measured bar chart, with its own scale.
    const barIn = at(t, 2.1, 0.8);
    const cx0 = 110;
    const barW = 700;
    const rows = [
      { label: 'MARS', sub: 'PETA PERMUKAAN · RESOLUSI 0,25 M', v: 1, col: '#D8AE7C' },
      { label: 'LAUT BUMI', sub: 'PETA RESOLUSI TINGGI', v: 0.26, col: O.aqua },
    ];
    if (barIn > 0.001) {
      ctx.save();
      ctx.globalAlpha = barIn;
      ctx.translate(0, (1 - barIn) * 26);
      tracking(ctx, 'SEBERAPA BAIK KITA MEMETAKANNYA', cx0, 1392, {
        size: 19, font: F.mono6, track: 5, color: hexA(O.pale, 0.42),
      });
      let y = 1432;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        tracking(ctx, r.label, cx0, y, { size: 27, font: F.mono6, track: 5, color: hexA(O.bone, 0.9) });
        tracking(ctx, r.sub, cx0 + 300, y + 1, { size: 15, font: F.mono6, track: 3, color: hexA(O.pale, 0.34) });
        const grow = at(t, 2.4 + i * 0.5, 1.4, EA.quart);
        const w = barW * r.v * grow;
        // track + ticks
        ctx.fillStyle = hexA(O.bone, 0.07);
        ctx.fillRect(cx0, y + 18, barW, 6);
        for (let k = 1; k < 10; k++) {
          ctx.fillStyle = hexA(O.bone, k % 2 ? 0.10 : 0.18);
          ctx.fillRect(cx0 + (barW * k) / 10, y + 16, 1, 10);
        }
        ctx.fillStyle = r.col;
        ctx.fillRect(cx0, y + 18, Math.max(4, w), 6);
        txt(ctx, i === 0 ? '100%' : '±26%', cx0 + barW + 24, y + 30, {
          size: 32, font: F.mono6, color: r.col, track: 1,
        });
        y += 96;
      }
      drawRule(ctx, cx0, cx0 + barW, y + 6, at(t, 2.9, 0.9), { color: O.aqua, a: 0.25, lw: 1.2 });
      ctx.restore();
    }

    kicker(ctx, 'SAMUDRA · TIGA PER EMPAT', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
