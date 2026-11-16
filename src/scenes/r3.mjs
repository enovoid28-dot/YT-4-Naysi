import { W, H, txt, hexA, fillRR, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';
import {
  K, ease, cue, A, desk, contact, brainPlate, hatch, kick, num, rule, stampInk, typeLabel, leader,
} from './_arsip.mjs';

// 03 — DIBANGUN
// A brain plate, and a mesh laid over it. The mesh arrives faster than the eye
// can follow: one million junctions a second, then the shear.

const NODES = (() => {
  const r = rng(1207);
  const list = [];
  for (let i = 0; i < 44; i++) {
    const ang = r() * TAU;
    const rad = Math.sqrt(r()) * 0.92;
    list.push({
      x: 0.5 + Math.cos(ang) * rad * 0.44,
      y: 0.52 + Math.sin(ang) * rad * 0.40,
      d: r(),
      s: 2.2 + r() * 4.4,
    });
  }
  return list;
})();

const LINKS = (() => {
  const r = rng(77);
  const out = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      if (r() > 0.20) continue;
      const d = Math.hypot(NODES[i].x - NODES[j].x, NODES[i].y - NODES[j].y);
      if (d < 0.30) out.push({ i, j, t: r() });
    }
  }
  return out.slice(0, 120);
})();

export default {
  draw(ctx, t, scene, cam) {
    const c = (i, o = 0) => cue(scene, i, o);
    desk(ctx, { lampX: W * 0.52, lampY: 380, key: 'r3' });

    const bw = 1110;
    const bh = 760;
    const bx = (W - bw) / 2;
    const by = 300;

    // ── the plate
    const pb = A(t, 0.05, 0.9, ease.expo);
    ctx.save();
    ctx.globalAlpha = pb;
    ctx.translate(0, (1 - pb) * 26);
    contact(ctx, bx - 30, by + bh - 40, bw + 60, 120, 0.5);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 24;
    ctx.fillStyle = '#0C0A08';
    fillRR(ctx, bx, by, bw, bh, 8, '#0C0A08');
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(244,235,218,0.12)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(bx, by, bw, bh);

    brainPlate(ctx, bx + 40, by + 20, bw - 80, bh - 40, { tone: 0.86, key: 'r3' });

    // ── the mesh: junctions arriving, then the shear
    const pm = A(t, c(2, 0.05), 1.5, ease.out);
    const prune = A(t, c(3, 0.05), 1.2, ease.inOut);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const l of LINKS) {
      const a = clamp((pm - l.t * 0.55) / 0.25 * (1 - prune * 0.92));
      if (a <= 0.01) continue;
      const A1 = NODES[l.i];
      const A2 = NODES[l.j];
      const x1 = bx + A1.x * bw;
      const y1 = by + A1.y * bh;
      const x2 = bx + A2.x * bw;
      const y2 = by + A2.y * bh;
      ctx.strokeStyle = `rgba(255,206,140,${0.30 * a})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (const n of NODES) {
      const a = clamp((pm - n.d * 0.45) / 0.25 * (1 - prune * 0.9));
      if (a <= 0.01) continue;
      const x = bx + n.x * bw;
      const y = by + n.y * bh;
      ctx.fillStyle = `rgba(255,232,186,${0.75 * a})`;
      ctx.beginPath();
      ctx.arc(x, y, n.s, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();

    // ── the counter
    const pc = A(t, c(2, 0.05), 1.6, ease.out);
    if (pc > 0.02) {
      ctx.save();
      ctx.globalAlpha = clamp(pc * 2.4);
      rule(ctx, 120, 1148, 600);
      kick(ctx, 'SAMBUNGAN BARU, USIA 0 — 2', 120, 1204, { size: 20, color: K.dim, track: 6 });
      const v = Math.round(1000000 * pc);
      num(ctx, v.toLocaleString('id-ID'), 112, 1352, { size: 124, color: K.bone, track: -5 });
      kick(ctx, 'PER DETIK', 122, 1404, { size: 22, color: K.redHi, track: 9 });
      ctx.restore();
    }

    // ── the shear
    const ps = A(t, c(3, 0.05), 0.6, ease.out);
    if (ps > 0.01) {
      ctx.save();
      ctx.globalAlpha = ps;
      const x = 806;
      rule(ctx, x, 1148, 514, { a: 0.9 });
      kick(ctx, 'LALU DIPANGKAS', x, 1204, { size: 20, color: K.dim, track: 6 });
      num(ctx, '40%', x - 8, 1362, { size: 168, color: K.redHi, track: -8 });
      txt(ctx, 'dibuang.', x, 1430, { size: 38, font: F.display, color: K.bone });
      // falling specks: the connections that do not survive
      const r = rng(9);
      for (let i = 0; i < 34; i++) {
        const sx = x + 30 + r() * 460;
        const sy = 1240 + r() * 200;
        const drop = ((t * 26 + r() * 90) % 60);
        ctx.fillStyle = `rgba(255,190,150,${0.5 * ps * (1 - drop / 60)})`;
        ctx.fillRect(sx, sy + drop, 2.6, 8);
      }
      ctx.restore();
    }

    typeLabel(ctx, 'POTONGAN SAMPING, USIA 2 TAHUN', bx + 22, by + bh + 44, { size: 20, rot: -0.012, a: pb });
  },
};
