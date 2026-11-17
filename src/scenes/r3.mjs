import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, spot, contact, brain, kick, num, rule, typeLabel, stat, footer,
} from './_arsip.mjs';

// 03 — DIBANGUN
// The brain, big, with a mesh arriving over it faster than the eye can follow.
// Then the shear: a third of those junctions are cut away.

const NODES = (() => {
  const r = rng(1207);
  const list = [];
  for (let i = 0; i < 60; i++) {
    const ang = r() * TAU;
    const rad = Math.sqrt(r()) * 0.94;
    list.push({ x: 0.5 + Math.cos(ang) * rad * 0.42, y: 0.50 + Math.sin(ang) * rad * 0.37, d: r(), s: 2.6 + r() * 5.2 });
  }
  return list;
})();

const LINKS = (() => {
  const r = rng(77);
  const out = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      if (r() > 0.2) continue;
      if (Math.hypot(NODES[i].x - NODES[j].x, NODES[i].y - NODES[j].y) > 0.27) continue;
      out.push({ i, j, t: r() });
    }
  }
  return out.slice(0, 150);
})();

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.48, lampY: 420, key: 'r3' });
    spot(ctx, W * 0.5, 600, 880, 0.16);

    const bw = 1240;
    const bh = 840;
    const bx = (W - bw) / 2;
    const by = 176;

    const pb = A(t, 0.08, 1.0, ease.expo);
    if (pb > 0.01) {
      ctx.save();
      ctx.globalAlpha = pb;
      contact(ctx, bx + 40, by + bh - 60, bw - 80, 140, 0.62);
      ctx.translate(0, (1 - pb) * 44);
      brain(ctx, bx, by, bw, bh, { key: 'r3' });

      const pm = A(t, c(1, 0.05), 1.4, ease.out);
      const prune = A(t, c(3, 0.05), 1.0, ease.inOut);
      if (pm > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (const l of LINKS) {
          const a = clamp((pm - l.t * 0.5) / 0.24) * (1 - prune * 0.96);
          if (a <= 0.01) continue;
          const n1 = NODES[l.i];
          const n2 = NODES[l.j];
          ctx.strokeStyle = `rgba(255,210,146,${0.5 * a})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(bx + n1.x * bw, by + n1.y * bh);
          ctx.lineTo(bx + n2.x * bw, by + n2.y * bh);
          ctx.stroke();
        }
        for (const n of NODES) {
          const a = clamp((pm - n.d * 0.42) / 0.24) * (1 - prune * 0.94);
          if (a <= 0.01) continue;
          ctx.fillStyle = `rgba(255,240,204,${0.9 * a})`;
          ctx.beginPath();
          ctx.arc(bx + n.x * bw, by + n.y * bh, n.s, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    typeLabel(ctx, 'POTONGAN SAMPING, USIA 2 TAHUN', bx + 10, by + bh + 44, { size: 21, a: pb });

    const pc = A(t, c(2, 0.05), 1.6, ease.out);
    if (pc > 0.02) {
      ctx.save();
      ctx.globalAlpha = clamp(pc * 2.2);
      rule(ctx, 104, 1180, 660, { a: 0.75 });
      kick(ctx, 'SAMBUNGAN BARU, USIA 0 — 2', 104, 1238, { size: 21, color: K.dim, track: 6 });
      num(ctx, Math.round(1000000 * pc).toLocaleString('id-ID'), 96, 1396, { size: 126, color: K.bone, track: -5 });
      kick(ctx, 'SAMBUNGAN PER DETIK', 104, 1452, { size: 22, color: K.redHi, track: 8 });
      ctx.restore();
    }

    const ps = A(t, c(3, 0.05), 0.55, ease.out);
    if (ps > 0.01) {
      ctx.save();
      ctx.globalAlpha = ps;
      const x = 830;
      rule(ctx, x, 1180, 502, { a: 0.75 });
      kick(ctx, 'LALU DIPANGKAS', x, 1238, { size: 21, color: K.dim, track: 6 });
      num(ctx, '40%', x - 8, 1400, { size: 182, color: K.redHi, track: -8 });
      txt(ctx, 'dibuang.', x, 1474, { size: 40, font: F.display, color: K.bone });
      const r2 = rng(9);
      for (let i = 0; i < 44; i++) {
        const sx = x + 20 + r2() * 460;
        const sy = 1270 + r2() * 170;
        const drop = (t * 34 + r2() * 84) % 76;
        ctx.fillStyle = `rgba(255,186,140,${0.5 * ps * (1 - drop / 76)})`;
        ctx.fillRect(sx, sy + drop, 2.6, 10);
      }
      ctx.restore();
    }

    footer(ctx, { chapter: 'DIBANGUN' });
  },
};
