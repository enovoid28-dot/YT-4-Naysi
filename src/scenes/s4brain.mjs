import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, rng, TAU } from '../engine/anim.mjs';

const CX = 720;
const CY = 740;
const RN = 330;

const r = rng(77);
const OUTER = Array.from({ length: 17 }, (_, i) => {
  const a = (i / 17) * TAU + r() * 0.22;
  const rad = RN * (0.82 + r() * 0.18);
  return { x: CX + Math.cos(a) * rad, y: CY + Math.sin(a) * rad, s: 4 + r() * 5, ph: r() * TAU };
});
const INNER = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * TAU + 0.5 + r() * 0.3;
  const rad = RN * (0.42 + r() * 0.16);
  return { x: CX + Math.cos(a) * rad, y: CY + Math.sin(a) * rad, s: 5 + r() * 4, ph: r() * TAU };
});
const HUB = { x: CX, y: CY, s: 16 };

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const NODES = [...OUTER, ...INNER];
const LINKS = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    if (dist(NODES[i], NODES[j]) < 210) LINKS.push([i, j, r()]);
  }
}
INNER.forEach((n, i) => LINKS.push([17 + i, -1, r()]));

const meters = [
  { name: 'MEMORI', sub: 'MENGUNCI INGATAN', v: 0.74, at: 2.16 },
  { name: 'IMUN', sub: 'DATA TAHAN TUBUH', v: 0.7, at: 3.24 },
  { name: 'KONTROL LAPAR', sub: 'HORMON LEPTIN', v: 0.66, at: 4.67 },
];

export default {
  draw(ctx, t, scene, meta) {
    // deep wash
    const g = radGrad(ctx, CX, CY, 0, 900, [
      [0, '#0B111C'],
      [0.55, '#070A11'],
      [1, '#05060A'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const inA = clamp((t - 0.1) / 0.7);

    tracking(ctx, 'OTAK SAAT TIDUR', CX, 300, {
      size: 25, font: F.num6, track: 7, align: 'center', color: hexA(C.bone, 0.55),
    });

    // halo
    ctx.save();
    ctx.globalAlpha = inA;
    ctx.beginPath();
    ctx.arc(CX, CY, RN * 1.02, 0, TAU);
    ctx.strokeStyle = hexA(C.bone, 0.08);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, RN * 0.72, 0, TAU);
    ctx.strokeStyle = hexA(C.bone, 0.05);
    ctx.stroke();
    ctx.restore();

    // links
    const lA = clamp((t - 0.25) / 0.9);
    ctx.save();
    ctx.globalAlpha = lA * 0.55;
    for (const [i, j, seed] of LINKS) {
      const a = j < 0 ? INNER[i - 17] : NODES[i];
      const b = j < 0 ? HUB : NODES[j];
      const grd = linGrad(ctx, a.x, a.y, b.x, b.y, [
        [0, hexA(C.sky, 0.02 + 0.2 * seed)],
        [1, hexA(C.sky, 0.3 * seed + 0.04)],
      ]);
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1.4 + seed;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();

    // travelling pulses
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    LINKS.forEach(([i, j, seed], k) => {
      const a = j < 0 ? INNER[i - 17] : NODES[i];
      const b = j < 0 ? HUB : NODES[j];
      const speed = 0.28 + seed * 0.5;
      const p = ((t * speed + seed) % 1);
      const x = lerp(a.x, b.x, p);
      const y = lerp(a.y, b.y, p);
      const al = Math.sin(Math.PI * p) * 0.9 * lA;
      const rg = radGrad(ctx, x, y, 0, 16, [
        [0, hexA(C.amberHi, al * 0.9)],
        [1, 'rgba(0,0,0,0)'],
      ]);
      ctx.fillStyle = rg;
      ctx.fillRect(x - 16, y - 16, 32, 32);
    });
    ctx.restore();

    // nodes
    NODES.forEach((n, i) => {
      const a = lA * 0.9;
      const pulse = 0.75 + 0.25 * Math.sin(t * 1.6 + n.ph);
      ctx.save();
      ctx.globalAlpha = a;
      const rg = radGrad(ctx, n.x, n.y, 0, n.s * 5, [
        [0, hexA(C.sky, 0.22 * pulse)],
        [1, 'rgba(0,0,0,0)'],
      ]);
      ctx.fillStyle = rg;
      ctx.fillRect(n.x - n.s * 5, n.y - n.s * 5, n.s * 10, n.s * 10);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.s * 0.5, 0, TAU);
      ctx.fillStyle = hexA(C.bone, 0.85);
      ctx.fill();
      ctx.restore();
    });

    // hub
    ctx.save();
    const hubP = 0.9 + 0.1 * Math.sin(t * 2.2);
    const hg = radGrad(ctx, HUB.x, HUB.y, 0, 84 * hubP, [
      [0, 'rgba(255,214,140,0.9)'],
      [0.25, 'rgba(255,176,58,0.55)'],
      [1, 'rgba(255,120,20,0)'],
    ]);
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(HUB.x, HUB.y, 84 * hubP, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(HUB.x, HUB.y, 13, 0, TAU);
    ctx.fillStyle = '#FFF0D2';
    ctx.fill();
    ctx.restore();

    // meters
    const rowY = [1236, 1342, 1448];
    meters.forEach((m, i) => {
      const y = rowY[i];
      const a = clamp((t - m.at + 0.35) / 0.45);
      if (a <= 0) return;
      const fill = EASE.outCubic(clamp((t - m.at + 0.3) / 1.1)) * m.v;
      ctx.save();
      ctx.globalAlpha = a;

      txt(ctx, m.name, M, y, { size: 34, font: F.semi, color: C.bone });
      tracking(ctx, m.sub, M, y + 30, {
        size: 18, font: F.num6, track: 3, color: hexA(C.bone, 0.42),
      });

      const bx = 420;
      const bw = 700;
      fillRR(ctx, bx, y - 16, bw, 22, 11, 'rgba(255,255,255,0.07)');
      const g2 = linGrad(ctx, bx, 0, bx + bw, 0, [
        [0, hexA(C.sky, 0.85)],
        [1, hexA(C.mint, 0.95)],
      ]);
      ctx.save();
      ctx.shadowColor = hexA(C.sky, 0.5);
      ctx.shadowBlur = 18;
      if (fill > 0.01) fillRR(ctx, bx, y - 16, bw * fill, 22, 11, g2);
      ctx.restore();

      txt(ctx, `${Math.round(fill * 100)}%`, W - M, y + 2, {
        size: 36, font: F.num, color: C.amber, align: 'right',
      });
      ctx.restore();
    });

    // after-effect note
    const nA = clamp((t - 5.8) / 0.45);
    if (nA > 0) {
      ctx.save();
      ctx.globalAlpha = nA;
      tracking(ctx, 'EFEK 1 MALAM KURANG TIDUR', M, 1560, {
        size: 24, font: F.num6, track: 5, color: hexA(C.red, 0.9),
      });
      const w = measure(ctx, 'EFEK 1 MALAM KURANG TIDUR', 24, F.num6, 5);
      ctx.beginPath();
      ctx.moveTo(M + w + 62, 1551);
      ctx.lineTo(M + w + 62 + 140, 1551);
      ctx.strokeStyle = hexA(C.red, 0.4);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // appetite up / focus down
    const pairs = [
      { at: 8.1, label: 'RASA LAPAR', value: 'NAIK', color: C.amber, x: M },
      { at: 9.75, label: 'FOKUS', value: 'TURUN', color: C.red, x: 760 },
    ];
    pairs.forEach((p2) => {
      const a = clamp((t - p2.at) / 0.45);
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      const dy = (1 - EASE.outCubic(a)) * 18;
      tracking(ctx, p2.label, p2.x, 1642 + dy, {
        size: 22, font: F.num6, track: 5, color: hexA(C.bone, 0.55),
      });
      txt(ctx, p2.value, p2.x, 1694 + dy, {
        size: 46, font: F.num, color: p2.color, track: -1,
      });
      ctx.restore();
    });
  },
};
