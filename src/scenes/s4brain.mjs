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
  const rad = RN * (0.84 + r() * 0.16);
  return { x: CX + Math.cos(a) * rad, y: CY + Math.sin(a) * rad, s: 4 + r() * 4, ph: r() * TAU, z: 0.55 + r() * 0.45 };
});
const INNER = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * TAU + 0.5 + r() * 0.3;
  const rad = RN * (0.44 + r() * 0.14);
  return { x: CX + Math.cos(a) * rad, y: CY + Math.sin(a) * rad, s: 5 + r() * 4, ph: r() * TAU, z: 0.8 + r() * 0.2 };
});
const HUB = { x: CX, y: CY, s: 13, z: 1 };

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const NODES = [...OUTER, ...INNER];
const LINKS = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    if (dist(NODES[i], NODES[j]) < 205) LINKS.push({ i, j, seed: r() });
  }
}
INNER.forEach((n, i) => LINKS.push({ i: 17 + i, j: -1, seed: r() }));

const meters = [
  { name: 'MEMORI', sub: 'MENGUNCI INGATAN', v: 0.74, at: 2.16 },
  { name: 'IMUN', sub: 'DATA TAHAN TUBUH', v: 0.7, at: 3.24 },
  { name: 'KONTROL LAPAR', sub: 'HORMON LEPTIN', v: 0.66, at: 4.67 },
];

export default {
  draw(ctx, t, scene, meta) {
    const g = radGrad(ctx, CX, CY - 40, 0, 1000, [
      [0, '#0B111D'],
      [0.45, '#070A11'],
      [1, '#05060A'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const inA = clamp((t - 0.1) / 0.7);

    tracking(ctx, 'OTAK SAAT TIDUR', CX, 300, {
      size: 25, font: F.num6, track: 7, align: 'center', color: hexA(C.bone, 0.55),
    });

    /* ------------------------------------------------------------- orbits -- */
    ctx.save();
    ctx.globalAlpha = inA;
    [
      [RN * 1.02, 0.075, 2],
      [RN * 0.74, 0.05, 1.6],
      [RN * 0.36, 0.04, 1.4],
    ].forEach(([rad, al, lw]) => {
      ctx.beginPath();
      ctx.arc(CX, CY, rad, 0, TAU);
      ctx.strokeStyle = hexA(C.bone, al);
      ctx.lineWidth = lw;
      ctx.stroke();
    });
    ctx.restore();

    const dim = 1 - 0.45 * clamp((t - 6.1) / 0.9);

    /* -------------------------------------------------------------- links -- */
    const lA = clamp((t - 0.25) / 0.9) * dim;
    ctx.save();
    for (const L of LINKS) {
      const a = NODES[L.i];
      const b = L.j < 0 ? HUB : NODES[L.j];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const nx = -(b.y - a.y);
      const ny = b.x - a.x;
      const len = Math.hypot(nx, ny) || 1;
      const bow = (L.seed - 0.5) * 34;
      const cx2 = mx + (nx / len) * bow;
      const cy2 = my + (ny / len) * bow;
      const z = Math.min(a.z, b.z, L.j < 0 ? 1 : 1);
      const alpha = lA * (0.16 + 0.34 * z) * (0.5 + 0.5 * L.seed);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cx2, cy2, b.x, b.y);
      ctx.strokeStyle = hexA(C.sky, alpha * 0.55);
      ctx.lineWidth = 0.8 + z * 1.2;
      ctx.stroke();
    }
    ctx.restore();

    /* ------------------------------------------------------------- pulses -- */
    const pA = clamp((t - 1.1) / 0.8) * dim;
    if (pA > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      LINKS.forEach((L, k) => {
        const a = NODES[L.i];
        const b = L.j < 0 ? HUB : NODES[L.j];
        const speed = 0.22 + L.seed * 0.42;
        const p = (t * speed + L.seed * 3.1) % 1;
        const x = lerp(a.x, b.x, p);
        const y = lerp(a.y, b.y, p);
        const al = Math.sin(Math.PI * p) * 0.85 * pA * (0.4 + 0.6 * L.seed);
        const rg = radGrad(ctx, x, y, 0, 15, [
          [0, hexA(C.amberHi, al)],
          [0.4, hexA(C.amber, al * 0.5)],
          [1, 'rgba(0,0,0,0)'],
        ]);
        ctx.fillStyle = rg;
        ctx.fillRect(x - 15, y - 15, 30, 30);
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- nodes -- */
    ctx.save();
    ctx.globalAlpha = lA;
    NODES.forEach((n) => {
      const breathe = 0.85 + 0.15 * Math.sin(t * 1.5 + n.ph);
      const rad = n.s * (1 + n.z * 0.5);
      // halo
      const hg = radGrad(ctx, n.x, n.y, 0, rad * 5.5, [
        [0, hexA(C.sky, 0.16 * n.z * breathe)],
        [1, 'rgba(0,0,0,0)'],
      ]);
      ctx.fillStyle = hg;
      ctx.fillRect(n.x - rad * 5.5, n.y - rad * 5.5, rad * 11, rad * 11);
      // body
      ctx.beginPath();
      ctx.arc(n.x, n.y, rad, 0, TAU);
      ctx.fillStyle = radGrad(ctx, n.x - rad * 0.4, n.y - rad * 0.4, 0, rad * 1.4, [
        [0, hexA('#FFFFFF', 0.95 * n.z)],
        [0.6, hexA('#C9DDFF', 0.75 * n.z)],
        [1, hexA(C.sky, 0.35 * n.z)],
      ]);
      ctx.fill();
    });
    ctx.restore();

    /* ---------------------------------------------------------------- hub -- */
    ctx.save();
    const pulse = 0.94 + 0.06 * Math.sin(t * 2.1);
    const hg = radGrad(ctx, HUB.x, HUB.y, 0, 96 * pulse, [
      [0, 'rgba(255,226,168,0.95)'],
      [0.18, 'rgba(255,186,80,0.6)'],
      [0.55, 'rgba(255,140,40,0.16)'],
      [1, 'rgba(255,120,20,0)'],
    ]);
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(HUB.x, HUB.y, 96 * pulse, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(HUB.x, HUB.y, 34, 0, TAU);
    ctx.strokeStyle = hexA(C.amber, 0.45);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(HUB.x, HUB.y, 12, 0, TAU);
    ctx.fillStyle = '#FFF4DC';
    ctx.fill();
    ctx.restore();

    /* ------------------------------------------------------------- meters -- */
    const rowY = [1240, 1346, 1452];
    const TX = 424;
    const TW = 640;
    meters.forEach((m, i) => {
      const yy = rowY[i];
      const a = clamp((t - m.at + 0.35) / 0.45);
      if (a <= 0) return;
      const prog = EASE.outCubic(clamp((t - m.at + 0.3) / 1.1));
      const fill = prog * m.v;
      ctx.save();
      ctx.globalAlpha = a;

      txt(ctx, m.name, M, yy, { size: 33, font: F.semi, color: C.bone });
      tracking(ctx, m.sub, M, yy + 28, {
        size: 17, font: F.num6, track: 3, color: hexA(C.bone, 0.4),
      });

      // track with inner shadow
      fillRR(ctx, TX, yy - 14, TW, 20, 10, '#0C1017');
      ctx.save();
      ctx.beginPath();
      rr(ctx, TX, yy - 14, TW, 20, 10);
      ctx.clip();
      ctx.fillStyle = linGrad(ctx, 0, yy - 14, 0, yy + 6, [
        [0, 'rgba(0,0,0,0.65)'],
        [1, 'rgba(0,0,0,0)'],
      ]);
      ctx.fillRect(TX, yy - 14, TW, 20);
      ctx.restore();
      strokeRR(ctx, TX + 1, yy - 13, TW - 2, 18, 9, 'rgba(255,255,255,0.09)', 1.5);

      // fill
      if (fill > 0.01) {
        const fg = linGrad(ctx, TX, 0, TX + TW, 0, [
          [0, hexA(C.sky, 0.95)],
          [1, hexA(C.mint, 0.95)],
        ]);
        ctx.save();
        ctx.shadowColor = hexA(C.sky, 0.5);
        ctx.shadowBlur = 20;
        fillRR(ctx, TX, yy - 14, TW * fill, 20, 10, fg);
        ctx.restore();
        // leading edge
        ctx.beginPath();
        ctx.arc(TX + TW * fill, yy - 4, 7, 0, TAU);
        ctx.fillStyle = '#EAF6FF';
        ctx.shadowColor = hexA(C.mint, 0.9);
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      txt(ctx, `${Math.round(fill * 100)}%`, W - M, yy + 2, {
        size: 36, font: F.num, color: C.amber, align: 'right',
      });
      ctx.restore();
    });

    /* -------------------------------------------------------------- notes -- */
    const nA = clamp((t - 5.8) / 0.45);
    if (nA > 0) {
      ctx.save();
      ctx.globalAlpha = nA;
      tracking(ctx, 'EFEK 1 MALAM KURANG TIDUR', M, 1556, {
        size: 24, font: F.num6, track: 5, color: hexA(C.red, 0.92),
      });
      const w = measure(ctx, 'EFEK 1 MALAM KURANG TIDUR', 24, F.num6, 5);
      const lg = linGrad(ctx, M + w + 40, 0, M + w + 250, 0, [
        [0, hexA(C.red, 0.5)],
        [1, 'rgba(255,75,59,0)'],
      ]);
      ctx.fillStyle = lg;
      ctx.fillRect(M + w + 40, 1549, 210, 2);
      ctx.restore();
    }

    const pairs = [
      { at: 8.1, label: 'RASA LAPAR', value: 'NAIK', color: C.amber, x: M },
      { at: 9.75, label: 'FOKUS', value: 'TURUN', color: C.red, x: 772 },
    ];
    pairs.forEach((p2) => {
      const a = clamp((t - p2.at) / 0.45);
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      const dy = (1 - EASE.outCubic(a)) * 18;
      tracking(ctx, p2.label, p2.x, 1662 + dy, {
        size: 21, font: F.num6, track: 5, color: hexA(C.bone, 0.5),
      });
      txt(ctx, p2.value, p2.x, 1714 + dy, {
        size: 46, font: F.num, color: p2.color, track: -1,
      });
      ctx.restore();
    });
  },
};
