import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, snow, drawRule } from './_ocean.mjs';

// 01 — TIGA PER EMPAT. An ocean seen from above, then the arithmetic of how
// little of it we actually know. The 71% is not a caption, it is the picture.

const WAVE = (x, t, y0, amp, f, sp) => y0 + Math.sin(x * f + t * sp) * amp + Math.sin(x * f * 2.3 + t * sp * 1.7) * amp * 0.4;

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;

    // sky, low sun, sea
    const sky = linGrad(ctx, 0, -200, 0, 760, [[0, '#0A1A24'], [0.55, '#123039'], [0.82, '#4C6E6A'], [1, '#9E8A63']]);
    ctx.fillStyle = sky;
    ctx.fillRect(-240, -240, W + 480, 1080);

    layer(ctx, cam, 0.25, () => {
      // sun just above the horizon
      const sy = 640;
      const g = radGrad(ctx, W * 0.62, sy, 0, 460, [
        [0, 'rgba(255,226,170,0.95)'],
        [0.12, 'rgba(255,196,120,0.55)'],
        [1, 'rgba(255,170,90,0)'],
      ]);
      ctx.fillStyle = g;
      ctx.fillRect(-240, -240, W + 480, 1600);
      ctx.beginPath();
      ctx.arc(W * 0.62, sy, 54, 0, TAU);
      ctx.fillStyle = '#FFE7B8';
      ctx.fill();
    });

    // sea
    const seaY = 700;
    const sea = linGrad(ctx, 0, seaY, 0, H, [[0, '#8A7A56'], [0.10, '#2E4A48'], [0.38, '#0B2B33'], [1, '#020C11']]);
    ctx.fillStyle = sea;
    ctx.fillRect(-240, seaY, W + 480, H - seaY + 240);

    // sun path on the water: stacked shimmering dashes
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 96; i++) {
      const u = i / 95;
      const y = seaY + 8 + u * 620;
      const wid = 26 + u * 300;
      const cx = W * 0.62 + Math.sin(t * 1.5 + i * 1.7) * (10 + u * 30);
      const a = (1 - u) * 0.30 * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 3.2 + i * 1.4)));
      const g = radGrad(ctx, cx, y, 0, wid, [[0, hexA('#FFD9A0', a)], [1, hexA('#FFD9A0', 0)]]);
      ctx.fillStyle = g;
      ctx.fillRect(cx - wid, y - 11, wid * 2, 22);
    }
    ctx.restore();

    // wave bands, parallax
    for (let L = 0; L < 4; L++) {
      const yy = seaY + 30 + L * 150;
      ctx.save();
      ctx.globalAlpha = 0.28 - L * 0.05;
      ctx.strokeStyle = '#CFE8E0';
      ctx.lineWidth = 2 - L * 0.3;
      ctx.beginPath();
      for (let x = -120; x <= W + 120; x += 14) {
        const y = WAVE(x, t + L * 3, yy, 5 + L * 3, 0.012 + L * 0.004, 0.9);
        if (x === -120) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    snow(ctx, t, { n: 40, seed: 21, a: 0.18, speed: 10, y0: seaY, scale: 0.8 });

    /* ---------------------------- the number --------------------------- */
    const p = at(t, 0.5, 1.0, EA.out);
    const cPct = at(t, 0.9, 1.6);
    const pct = Math.round(lerp(0, 71, cPct));

    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate(0, (1 - p) * 24);
    txt(ctx, `${pct}`, 110, 1180, { size: 300, font: F.num, color: O.bone, track: -10, alpha: 0.97 });
    const nw = measure(ctx, `${pct}`, 300, F.num, -10);
    txt(ctx, '%', 118 + nw + 8, 1180, { size: 150, font: F.num, color: O.aqua, track: -2, alpha: 0.95 });
    ctx.restore();

    drawRule(ctx, 110, 110 + 420 * at(t, 1.3, 0.9), 900, 1, { color: O.aqua, a: 0.55 });
    tracking(ctx, 'PERMUKAAN BUMI YANG TERTUTUP AIR', 112, 862, {
      size: 24, font: F.mono6, track: 5, color: hexA(O.pale, 0.62), alpha: p,
    });

    /* --------------------------- coverage bars ------------------------- */
    const barIn = at(t, 2.2, 0.8);
    const cx0 = 110;
    const barW = 620;
    const rows = [
      { label: 'MARS', sub: 'PETA PERMUKAAN', v: 1, col: '#E0A56B' },
      { label: 'LAUT BUMI', sub: 'PETA RESOLUSI TINGGI', v: 0.26, col: O.aqua },
    ];
    if (barIn > 0.001) {
      ctx.save();
      ctx.globalAlpha = barIn;
      ctx.translate(0, (1 - barIn) * 30);
      let y = 1270;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        tracking(ctx, r.label, cx0, y, { size: 28, font: F.mono6, track: 5, color: hexA(O.bone, 0.9) });
        tracking(ctx, r.sub, cx0, y + 58, {
          size: 17, font: F.mono6, track: 4, color: hexA(O.pale, 0.40),
        });
        const grow = at(t, 2.5 + i * 0.55, 1.5, EA.quart);
        const w = barW * r.v * grow;
        ctx.fillStyle = hexA(O.bone, 0.10);
        fillRR(ctx, cx0, y + 26, barW, 10, 5, hexA(O.bone, 0.09));
        // ticks
        for (let k = 1; k < 10; k++) {
          ctx.fillStyle = hexA(O.bone, 0.16);
          ctx.fillRect(cx0 + (barW * k) / 10, y + 26, 1, 10);
        }
        ctx.fillStyle = r.col;
        fillRR(ctx, cx0, y + 26, Math.max(6, w), 10, 5, r.col);
        txt(ctx, i === 0 ? '100%' : '±26%', cx0 + barW + 22, y + 40, {
          size: 34, font: F.mono6, color: r.col, track: 1,
        });
        y += 150;
      }
      ctx.restore();
    }

    // sonar ping in the lower third: it is all we have of the seafloor
    if (t > 3.2) {
      const ring = at(t, 3.2, 2.4);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const u = (ring + i * 0.33) % 1;
        ctx.beginPath();
        ctx.ellipse(W * 0.5, 1560, 60 + u * 700, (60 + u * 700) * 0.28, 0, 0, TAU);
        ctx.strokeStyle = hexA(O.aqua, 0.22 * (1 - u));
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    kicker(ctx, 'SAMUDRA · TIGA PER EMPAT', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.35, 0.6) });
  },
};
