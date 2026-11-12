import { W, H, txt, hexA, linGrad, radGrad, fillRR, strokeRR, tracking } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, TAU, rng } from '../engine/anim.mjs';
import { at, layer, kicker, chip } from './_kota.mjs';
import { O, EA, material, drawRule } from './_ocean.mjs';

// 08 — LEBIH SEDIKIT DARI BULAN. Two columns of people. The one on the left went
// to the Moon; the one on the right went to the bottom of the sea.

/** Moon: maria first, then craters, then a limb that is not a sticker. */
function moon(ctx, cx, cy, r, t) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.clip();

  const g = radGrad(ctx, cx - r * 0.34, cy - r * 0.36, r * 0.08, r * 1.25, [
    [0, '#CFC9BA'], [0.42, '#A8A296'], [0.78, '#77736A'], [1, '#403E39'],
  ]);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // maria: broad, soft, slightly darker plains
  const m = rng(4);
  for (let i = 0; i < 7; i++) {
    const a = m() * TAU;
    const d = Math.pow(m(), 0.7) * r * 0.62;
    const rr2 = r * (0.14 + m() * 0.22);
    const gg = radGrad(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0, rr2, [
      [0, 'rgba(58,56,52,0.34)'], [0.7, 'rgba(58,56,52,0.16)'], [1, 'rgba(58,56,52,0)'],
    ]);
    ctx.fillStyle = gg;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // craters: a darker floor and a lit rim on the sunward side
  const c = rng(12);
  for (let i = 0; i < 40; i++) {
    const a = c() * TAU;
    const d = Math.sqrt(c()) * r * 0.9;
    const cr = r * (0.012 + Math.pow(c(), 2) * 0.075);
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d;
    ctx.beginPath();
    ctx.arc(px, py, cr, 0, TAU);
    ctx.fillStyle = `rgba(46,44,40,${0.10 + c() * 0.18})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(214,208,194,${0.08 + c() * 0.14})`;
    ctx.lineWidth = Math.max(1, cr * 0.16);
    ctx.beginPath();
    ctx.arc(px - cr * 0.12, py - cr * 0.12, cr * 0.94, Math.PI * 0.85, Math.PI * 1.95);
    ctx.stroke();
  }
  // grain
  material(ctx, 'rock', { x: cx - r, y: cy - r, w: r * 2, h: r * 2, a: 0.22, s: 0.9 });
  ctx.restore();

  // limb: a thin bright edge on the light side, nothing on the dark side
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.82, Math.PI * 1.9);
  ctx.strokeStyle = 'rgba(240,236,222,0.30)';
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.strokeStyle = 'rgba(24,24,22,0.55)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

export default {
  draw(ctx, t, scene, o = {}) {
    const cam = o.cam;
    const g = linGrad(ctx, 0, -200, 0, H + 200, [[0, '#04060A'], [0.45, '#050D12'], [1, '#02060A']]);
    ctx.fillStyle = g;
    ctx.fillRect(-260, -240, W + 520, H + 480);
    material(ctx, 'haze', { x: -200, y: -200, w: W + 400, h: H + 400, a: 0.08, s: 2.4 });

    /* ----------------------------- left: Moon --------------------------- */
    layer(ctx, cam, 0.18, () => {
      moon(ctx, 402, 596, 150, t);

      const p = at(t, 0.5, 0.9);
      ctx.save();
      ctx.globalAlpha = p;
      txt(ctx, '12', 132, 850, { size: 132, font: F.num, color: O.bone, track: -4 });
      tracking(ctx, 'ORANG', 320, 846, { size: 22, font: F.mono6, track: 6, color: hexA(O.pale, 0.5) });
      tracking(ctx, 'SUDAH BERJALAN DI BULAN', 136, 896, {
        size: 18, font: F.mono6, track: 4, color: hexA(O.pale, 0.42),
      });
      ctx.restore();

      for (let i = 0; i < 12; i++) {
        const on = at(t, 0.7 + i * 0.075, 0.4);
        const x = 148 + (i % 6) * 56;
        const y = 966 + Math.floor(i / 6) * 56;
        ctx.save();
        ctx.globalAlpha = on;
        ctx.fillStyle = hexA(O.amber, 0.32 + 0.55 * on);
        ctx.beginPath();
        ctx.arc(x, y, 8.5, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    });

    // divider
    ctx.save();
    ctx.globalAlpha = 0.16 * at(t, 0.4, 0.8);
    ctx.strokeStyle = O.pale;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(W * 0.5 + 10, 470);
    ctx.lineTo(W * 0.5 + 10, 1150);
    ctx.stroke();
    ctx.restore();

    /* --------------------------- right: trench -------------------------- */
    layer(ctx, cam, 0.18, () => {
      const p = at(t, 0.9, 0.9);
      ctx.save();
      ctx.globalAlpha = p;
      txt(ctx, '±30', 762, 850, { size: 132, font: F.num, color: O.aqua, track: -4 });
      tracking(ctx, 'ORANG', 1010, 846, { size: 22, font: F.mono6, track: 6, color: hexA(O.pale, 0.5) });
      tracking(ctx, 'TURUN KE CHALLENGER DEEP', 766, 896, {
        size: 18, font: F.mono6, track: 4, color: hexA(O.pale, 0.42),
      });
      ctx.restore();

      for (let i = 0; i < 30; i++) {
        const on = at(t, 1.1 + i * 0.038, 0.4);
        const x = 778 + (i % 6) * 62;
        const y = 966 + Math.floor(i / 6) * 62;
        ctx.save();
        ctx.globalAlpha = on;
        ctx.beginPath();
        ctx.arc(x, y, 8.5, 0, TAU);
        ctx.fillStyle = on > 0.4 ? hexA(O.bone, 0.72) : hexA(O.bone, 0.12);
        ctx.fill();
        ctx.restore();
      }
    });

    /* --------------------------- the timeline -------------------------- */
    const tl = at(t, 2.6, 0.9);
    if (tl > 0.01) {
      const y = 1300;
      ctx.save();
      ctx.globalAlpha = tl;
      ctx.strokeStyle = hexA(O.pale, 0.22);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(132, y);
      ctx.lineTo(lerp(132, 1308, tl), y);
      ctx.stroke();
      const marks = [
        { x: 330, yr: '1960', name: 'PICCARD & WALSH' },
        { x: 770, yr: '2012', name: 'JAMES CAMERON' },
        { x: 1190, yr: '2019', name: 'VICTOR VESCOVO' },
      ];
      marks.forEach((mk, i) => {
        const a = at(t, 2.9 + i * 0.35, 0.6);
        if (a <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = tl * a;
        ctx.fillStyle = O.amber;
        ctx.beginPath();
        ctx.arc(mk.x, y, 7, 0, TAU);
        ctx.fill();
        txt(ctx, mk.yr, mk.x, y - 34, { size: 28, font: F.mono6, color: O.bone, track: 1, align: 'center' });
        tracking(ctx, mk.name, mk.x, y + 48, {
          size: 15, font: F.mono6, track: 2, align: 'center', color: hexA(O.pale, 0.44),
        });
        ctx.restore();
      });
      ctx.restore();
    }

    chip(ctx, 'PERTAMA TURUN 1960 · LALU 52 TAHUN SEPI', 132, 1430, {
      a: at(t, 3.8, 0.7) * 0.88, bg: 'rgba(4,10,14,0.72)', ink: hexA(O.bone, 0.85),
      border: hexA(O.aqua, 0.22), size: 19, track: 3,
    });

    kicker(ctx, 'SAMUDRA · LEBIH SEDIKIT DARI BULAN', { x: 104, y: 250, color: O.aqua, ink: hexA(O.bone, 0.9), a: at(t, 0.3, 0.6) });
  },
};
