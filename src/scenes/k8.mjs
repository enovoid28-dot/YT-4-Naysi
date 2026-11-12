import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, snow, drawRule } from './_ocean.mjs';

// 08 — LEBIH SEDIKIT DARI BULAN. Two columns of dots. The one on the left is the
// Moon; the one on the right is the bottom of the sea.

function moon(ctx, cx, cy, r, t) {
  ctx.save();
  const g = radGrad(ctx, cx - r * 0.3, cy - r * 0.35, r * 0.1, r * 1.15, [
    [0, '#D8D2C2'], [0.55, '#A8A396'], [1, '#5E5C55'],
  ]);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  const rr2 = rng(12);
  for (let i = 0; i < 22; i++) {
    const a = rr2() * TAU;
    const d = Math.sqrt(rr2()) * r * 0.88;
    const cr = 3 + rr2() * 16;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, cr, 0, TAU);
    ctx.fillStyle = `rgba(70,68,62,${0.06 + rr2() * 0.14})`;
    ctx.fill();
  }
  ctx.restore();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    const g = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#04060A'], [0.45, '#050D12'], [1, '#02060A']]);
    ctx.fillStyle = g;
    ctx.fillRect(-260, -240, W + 520, H + 480);

    // left panel: the Moon
    layer(ctx, cam, 0.18, () => {
      moon(ctx, 330, 490, 150, t);
      txt(ctx, '12', 150, 760, { size: 140, font: F.num, color: O.bone, track: -4 });
      tracking(ctx, 'ORANG', 336, 756, { size: 24, font: F.mono6, track: 6, color: hexA(O.pale, 0.5) });
      tracking(ctx, 'BERJALAN DI BULAN', 150, 820, {
        size: 19, font: F.mono6, track: 4, color: hexA(O.pale, 0.45),
      });
      for (let i = 0; i < 12; i++) {
        const on = at(t, 0.6 + i * 0.09, 0.4);
        const col = i % 6;
        const row = Math.floor(i / 6);
        const x = 158 + col * 58;
        const y = 900 + row * 58;
        ctx.save();
        ctx.globalAlpha = on;
        ctx.fillStyle = hexA(O.amber, 0.35 + 0.55 * on);
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    });

    // divider
    ctx.save();
    ctx.globalAlpha = 0.18 * at(t, 0.4, 0.8);
    ctx.strokeStyle = O.pale;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(W * 0.5, 400);
    ctx.lineTo(W * 0.5, 1080);
    ctx.stroke();
    ctx.restore();

    // right panel: the trench
    layer(ctx, cam, 0.18, () => {
      txt(ctx, '30', 760, 500, { size: 140, font: F.num, color: O.aqua, track: -4 });
      tracking(ctx, 'ORANG', 962, 496, { size: 24, font: F.mono6, track: 6, color: hexA(O.pale, 0.5) });
      tracking(ctx, 'TURUN KE CHALLENGER DEEP', 760, 560, {
        size: 19, font: F.mono6, track: 4, color: hexA(O.pale, 0.45),
      });
      const total = 30;
      for (let i = 0; i < total; i++) {
        const on = at(t, 1.0 + i * 0.045, 0.4);
        const col = i % 6;
        const row = Math.floor(i / 6);
        const x = 768 + col * 60;
        const y = 650 + row * 60;
        ctx.save();
        ctx.globalAlpha = on;
        if (on > 0.4) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const gg = radGrad(ctx, x, y, 0, 26, [[0, hexA(O.glow, 0.30 * on)], [1, hexA(O.glow, 0)]]);
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.arc(x, y, 26, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, TAU);
        ctx.fillStyle = on > 0.4 ? hexA(O.glow, 0.9) : hexA(O.glow, 0.15);
        ctx.fill();
        ctx.restore();
      }
    });

    /* --------------------------- the timeline -------------------------- */
    const tl = at(t, 2.6, 0.9);
    if (tl > 0.01) {
      const y = 1258;
      ctx.save();
      ctx.globalAlpha = tl;
      ctx.strokeStyle = hexA(O.pale, 0.22);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(132, y);
      ctx.lineTo(lerp(132, 1308, tl), y);
      ctx.stroke();
      const marks = [
        { x: 300, yr: '1960', name: 'PICCARD & WALSH' },
        { x: 760, yr: '2012', name: 'JAMES CAMERON' },
        { x: 1180, yr: '2019', name: 'VICTOR VESCOVO' },
      ];
      marks.forEach((mk, i) => {
        const a = at(t, 3.0 + i * 0.35, 0.6);
        if (a <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = tl * a;
        ctx.fillStyle = O.amber;
        ctx.beginPath();
        ctx.arc(mk.x, y, 8, 0, TAU);
        ctx.fill();
        txt(ctx, mk.yr, mk.x, y - 34, { size: 30, font: F.mono6, color: O.bone, track: 1, align: 'center' });
        tracking(ctx, mk.name, mk.x, y + 52, {
          size: 16, font: F.mono6, track: 2, align: 'center', color: hexA(O.pale, 0.45),
        });
        ctx.restore();
      });
      ctx.restore();
    }

    chip(ctx, 'PERTAMA TURUN 1960 · LALU 52 TAHUN SEPI', 132, 1390, {
      a: at(t, 3.8, 0.7) * 0.9, bg: 'rgba(4,10,14,0.72)', ink: hexA(O.bone, 0.85),
      border: hexA(O.aqua, 0.22), size: 19, track: 3,
    });

    kicker(ctx, 'SAMUDRA · LEBIH SEDIKIT DARI BULAN', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
