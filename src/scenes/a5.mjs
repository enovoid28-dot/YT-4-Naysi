import { CY, cue, P, eo, e3, io, paper, plateFrame, heading, label, leader, place, scaleBar, hatch, stipple, drawOn, numCells, idNum, arrowHead, rng, clamp, lerp, TAU, F } from './_cyano.mjs';
import { sharkSprite, toothSprite, TOOTH_INFO, jawPath } from './_fauna.mjs';

// 05 — FOSIL GIGI
// A fossil plate: a megalodon tooth as the hero specimen over a bed of
// sediment holding five more teeth, each tagged. "Kerangkanya tulang rawan"
// turns the hero into a shark seen as cartilage (dashed skeleton); "hancur"
// crumbles it to grains and only its teeth sink into the bed. "Giginya terus
// berganti": the jaw in section as a conveyor, rows of teeth rising and
// shedding; "tiga puluh ribu" counts the lifetime total.

const BED = 1600; // sediment top
const SH = { x: 720, y: 1010, k: 1.1 }; // shark: unit (500, 0) lands at (x, y)
const JAW = { x: 720, y: 1250, r: 330 };
const BED_TEETH = [
  ['clado', 170, 1700, -0.5],
  ['hybodus', 430, 1740, 0.35],
  ['ptychodus', 700, 1690, -0.2],
  ['mako', 960, 1735, 0.6],
  ['white', 1230, 1700, -0.35],
];

const su = (u, v) => [SH.x + (u - 500) * SH.k, SH.y + v * SH.k];

let GRAINS = null;
function grains() {
  if (GRAINS) return GRAINS;
  const sp = sharkSprite(1.1);
  const ctx = sp.cv.getContext('2d');
  const { width: w, height: h } = sp.cv;
  const data = ctx.getImageData(0, 0, w, h).data;
  const R = rng(55);
  const list = [];
  let guard = 0;
  while (list.length < 1100 && guard++ < 200000) {
    const x = Math.floor(R() * w);
    const y = Math.floor(R() * h);
    if (data[(y * w + x) * 4 + 3] > 60) list.push({ u: (x - sp.ox) / sp.s, v: (y - sp.oy) / sp.s, d: R(), r: 1.2 + R() * 2.4, vx: (R() - 0.5) * 40 });
  }
  GRAINS = list;
  return list;
}

/** the cartilage skeleton in shark unit space, drawn dashed like an X-ray plate */
function skeleton(c, a) {
  if (a <= 0.001) return;
  c.save();
  c.globalAlpha *= a;
  c.strokeStyle = CY.white;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  // vertebral column: centra along the axis and up into the upper tail lobe
  const axis = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    const x = lerp(820, 150, u);
    axis.push([x, -6 - 6 * u]);
  }
  for (let i = 1; i <= 14; i++) {
    const u = i / 14;
    axis.push([lerp(150, 14, u), lerp(-12, -214, u * u * 0.4 + u * 0.6)]);
  }
  for (let i = 0; i < axis.length - 1; i += 1) {
    const [x0, y0] = axis[i];
    const [x1, y1] = axis[i + 1];
    const ang = Math.atan2(y1 - y0, x1 - x0);
    const len = Math.hypot(x1 - x0, y1 - y0);
    const s = clamp(1 - i / (axis.length + 10)) * 0.8 + 0.2;
    c.save();
    c.translate((x0 + x1) / 2, (y0 + y1) / 2);
    c.rotate(ang);
    c.lineWidth = 1.6;
    c.strokeRect(-len * 0.42, -9 * s, len * 0.84, 18 * s);
    // neural arch spine
    c.beginPath();
    c.moveTo(0, -9 * s);
    c.lineTo(-3, -22 * s);
    c.stroke();
    c.restore();
  }
  c.setLineDash([9, 6]);
  c.lineWidth = 2.2;
  // chondrocranium and rostrum
  c.beginPath();
  c.moveTo(996, 2);
  c.quadraticCurveTo(950, -28, 900, -40);
  c.quadraticCurveTo(850, -50, 822, -30);
  c.quadraticCurveTo(812, -6, 830, 8);
  c.quadraticCurveTo(880, 14, 940, 6);
  c.closePath();
  c.stroke();
  c.beginPath();
  c.arc(912, -18, 16, 0, TAU);
  c.stroke();
  // jaws
  c.beginPath();
  c.moveTo(960, 24);
  c.quadraticCurveTo(910, 30, 850, 22);
  c.moveTo(955, 36);
  c.quadraticCurveTo(900, 52, 846, 46);
  c.stroke();
  // gill arches
  for (let i = 0; i < 5; i++) {
    const x = 864 - i * 17;
    c.beginPath();
    c.moveTo(x + 6, -28);
    c.quadraticCurveTo(x - 6, 2, x + 2, 34);
    c.stroke();
  }
  // pectoral girdle and fin radials
  c.beginPath();
  c.moveTo(806, -30);
  c.quadraticCurveTo(792, 20, 790, 70);
  c.stroke();
  c.setLineDash([]);
  c.lineWidth = 1.3;
  for (let i = 0; i < 9; i++) {
    const u = i / 8;
    c.beginPath();
    c.moveTo(lerp(800, 760, u), lerp(64, 78, u));
    c.lineTo(lerp(736, 694, u), lerp(170, 196, u));
    c.stroke();
  }
  // dorsal and caudal radials
  for (let i = 0; i < 8; i++) {
    const x = 690 - i * 14;
    c.beginPath();
    c.moveTo(x, -84);
    c.lineTo(x - 26, -130 - (i < 4 ? i * 12 : (7 - i) * 12));
    c.stroke();
  }
  c.restore();
}

/** a tooth in the jaw section: u in [0, 1] along the belt (0 = newest) */
function beltTooth(c, sp, u, size) {
  const th = -0.2 - u * (Math.PI - 0.4); // right end -> over the top -> left end
  const r = JAW.r + 2;
  const x = JAW.x + Math.cos(th) * r;
  const y = JAW.y + Math.sin(th) * r;
  // newest teeth lie folded back, rise upright at the top, lean out to shed
  const fold = u < 0.5 ? lerp(1.35, 0, e3(u / 0.5)) : lerp(0, -0.42, clamp((u - 0.5) / 0.5));
  const s = size * lerp(0.62, 1, clamp(u / 0.45));
  place(c, sp, x, y, s, { ux: 0, uy: 40, rot: th + Math.PI / 2 + fold, a: lerp(0.65, 1, clamp(u * 3)) });
}

export default {
  draw(ctx, t, scene, env) {
    const tFosil = cue(scene, 'fosil');
    const tGigi = cue(scene, 'gigi');
    const tKer = cue(scene, 'kerangkanya');
    const tTulang = cue(scene, 'tulang');
    const tMudah = cue(scene, 'mudah');
    const tHancur = cue(scene, 'hancur');
    const tGiginya = cue(scene, 'giginya');
    const tBan = cue(scene, 'ban');
    const tAda = cue(scene, 'ada');
    const tTiga = cue(scene, 'tiga');
    const tRibu = cue(scene, 'ribu');
    const tSeumur = cue(scene, 'seumur');

    paper(ctx, env.cam, { kind: 'plate' });
    plateFrame(ctx, {});
    const h1 = 1 - P(t, tGiginya - 0.45, 0.3);
    heading(ctx, t, { kicker: 'PL. V  ·  FOSIL GIGI', lines: ['Fosilnya hampir', 'selalu *gigi*'], y: 410, size: 124, t0: -0.4, a: h1 });
    const h2 = P(t, tGiginya - 0.15, 0.2);
    heading(ctx, t, { kicker: 'PL. V  ·  GIGI BERGANTI', lines: ['Gigi baru terus', 'maju ke *depan*'], y: 410, size: 124, t0: tGiginya - 0.1, a: h2 });

    /* ---------------- the sediment bed and its five teeth ---------------- */
    ctx.save();
    ctx.fillStyle = 'rgba(4,14,36,0.28)';
    ctx.fillRect(46, BED, W_IN, 1806 - BED);
    stipple(ctx, 46, BED + 6, 46 + W_IN, 1800, { n: 900, r: 1.6, a: 0.42, seed: 8 });
    ctx.strokeStyle = CY.paper;
    for (let k = 0; k < 5; k++) {
      const y0 = BED + k * 46;
      ctx.globalAlpha = k ? 0.32 : 0.9;
      ctx.lineWidth = k ? 1.4 : 2.6;
      ctx.beginPath();
      for (let x = 46; x <= 46 + W_IN; x += 12) ctx[x === 46 ? 'moveTo' : 'lineTo'](x, y0 + Math.sin(x * 0.012 + k * 1.7) * (k ? 5 : 3));
      ctx.stroke();
    }
    ctx.restore();
    const tagA = 1 - P(t, tGiginya - 0.3, 0.4);
    BED_TEETH.forEach(([kind, x, y, rot], i) => {
      const p = P(t, 0.15 + i * 0.1, 0.5);
      const sp = toothSprite(kind, 0.5);
      place(ctx, sp, x, y, 0.19 * eo(p), { ux: 0, uy: -180, rot, a: p });
      const lit = P(t, tGigi - 0.1 + i * 0.05, 0.3) * (1 - P(t, tKer, 0.5));
      if (lit > 0.01) {
        ctx.save();
        ctx.strokeStyle = CY.amber;
        ctx.globalAlpha = lit;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y - 12, 82, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      const [nm, age] = TOOTH_INFO[kind];
      label(ctx, nm.split(' ').pop(), x, BED - 58, { size: 26, align: 'center', font: F.italic, track: 0, color: CY.white, a: tagA * P(t, 0.4 + i * 0.1, 0.5) });
      label(ctx, age.toUpperCase(), x, BED - 22, { size: 20, align: 'center', track: 2, a: 0.8 * tagA * P(t, 0.5 + i * 0.1, 0.5) });
    });

    /* ------------------------- the hero specimen ------------------------- */
    const heroA = P(t, -0.2, 0.5) * (1 - P(t, tKer - 0.25, 0.35));
    if (heroA > 0.001) {
      const meg = toothSprite('meg', 0.5);
      const k = lerp(0.74, 0.72, P(t, 0, 4));
      place(ctx, meg, 720, 1150, k, { ux: 0, uy: -180, a: heroA });
      ctx.save();
      ctx.globalAlpha = heroA;
      const hp = (u, v2) => [720 + u * k, 1150 + (v2 + 180) * k];
      leader(ctx, ...hp(40, -330), 1080, 800, P(t, 0.6, 0.5));
      label(ctx, 'MAHKOTA · EMAIL', 1090, 792, { size: 26, track: 3, p: P(t, 0.8, 0.5) });
      leader(ctx, ...hp(150, -170), 1110, 1040, P(t, 0.9, 0.5));
      label(ctx, 'GERIGI', 1120, 1032, { size: 26, track: 3, p: P(t, 1.1, 0.5) });
      leader(ctx, ...hp(-220, 120), 340, 1300, P(t, 1.2, 0.5));
      label(ctx, 'AKAR', 330, 1308, { size: 26, track: 3, align: 'right', p: P(t, 1.4, 0.5) });
      label(ctx, 'Otodus megalodon', 380, 760, { size: 40, font: F.italic6, track: 0, align: 'center', p: P(t, 0.3, 0.5) });
      label(ctx, 'MIOSEN – PLIOSEN', 380, 802, { size: 24, track: 3, align: 'center', p: P(t, 0.45, 0.5) });
      scaleBar(ctx, 1010, 1440, 220, '5 cm', { p: P(t, 1.0, 0.6) });
      ctx.restore();
    }

    /* --------------- the shark as cartilage, then crumbling -------------- */
    const sIn = P(t, tKer - 0.3, 0.5);
    const crumble = clamp((t - (tHancur - 0.05)) / 0.9);
    if (sIn > 0.001 && crumble < 1) {
      const sp = sharkSprite(1.1);
      const bodyA = sIn * 0.42 * (1 - e3(crumble * 1.4));
      place(ctx, sp, SH.x, SH.y, SH.k, { ux: 500, uy: 0, a: bodyA });
      ctx.save();
      ctx.translate(SH.x - 500 * SH.k, SH.y);
      ctx.scale(SH.k, SH.k);
      skeleton(ctx, sIn * (1 - e3(crumble * 1.6)));
      ctx.restore();
    }
    if (crumble > 0) {
      const g = grains();
      ctx.save();
      ctx.fillStyle = CY.paper;
      for (const q of g) {
        const lt = clamp(crumble * 1.5 - q.d * 0.5);
        if (lt <= 0 || lt >= 1) continue;
        const [x, y] = su(q.u, q.v);
        ctx.globalAlpha = (1 - lt) * 0.85;
        ctx.beginPath();
        ctx.arc(x + q.vx * lt, y + lt * lt * 260, q.r, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    // its teeth: drawn in the jaw, then sinking into the bed
    if (sIn > 0.001 && t < tGiginya + 0.2) {
      const sp = toothSprite('white', 0.5);
      const R = rng(4);
      for (let i = 0; i < 7; i++) {
        const u = 952 - i * 15;
        const [x0, y0] = su(u, 34 + i * 2);
        const fall = e3(clamp((t - tHancur - 0.1 - R() * 0.25) / 0.8));
        const x1 = 940 + i * 26 + (R() - 0.5) * 20;
        const y1 = BED + 30 + R() * 50;
        const x = lerp(x0, x1, fall);
        const y = lerp(y0, y1, fall * fall);
        const rot = Math.PI + fall * (R() - 0.5) * 3;
        const s = lerp(0.032, 0.05, fall);
        place(ctx, sp, x, y, s, { ux: 0, uy: -150, rot, a: sIn * (1 - P(t, tGiginya - 0.2, 0.4)) });
      }
    }
    const lb = sIn * (1 - P(t, tHancur + 0.2, 0.5));
    if (lb > 0.001) {
      ctx.save();
      ctx.globalAlpha = lb;
      const [vx, vy] = su(420, -14);
      leader(ctx, vx, vy, 470, 760, P(t, tTulang - 0.1, 0.5));
      label(ctx, 'TULANG RAWAN', 470, 744, { size: 34, track: 6, align: 'center', p: P(t, tTulang, 0.5) });
      label(ctx, 'mudah hancur', 470, 704, { size: 32, font: F.italic, track: 0, align: 'center', color: CY.light, p: P(t, tMudah - 0.1, 0.5) });
      ctx.restore();
    }

    /* ---------------------- the jaw as a conveyor ------------------------ */
    const jA = P(t, tGiginya - 0.2, 0.6);
    if (jA > 0.001) {
      ctx.save();
      ctx.globalAlpha = jA;
      // cartilage of the jaw in section: engraved arch
      const jp = jawPath(JAW.x, JAW.y, JAW.r);
      ctx.fillStyle = 'rgba(237,242,239,0.1)';
      ctx.fill(jp);
      ctx.save();
      ctx.clip(jp);
      stipple(ctx, JAW.x - JAW.r, JAW.y - JAW.r, JAW.x + JAW.r, JAW.y, { n: 700, r: 2, a: 0.45, seed: 31 });
      ctx.restore();
      ctx.strokeStyle = CY.paper;
      ctx.lineWidth = 3;
      ctx.stroke(jp);
      // the belt: it creeps, then races for the count
      const tA = tTiga - 0.3;
      const posAt = (tt) => (tt - tGiginya) * 0.16 + (tt > tA ? 0.5 * (tt - tA) * clamp((tt - tA) / 1.2) : 0);
      const pos = posAt(t);
      const sp = toothSprite('white', 0.5);
      const N = 8;
      for (let i = 0; i < N; i++) beltTooth(ctx, sp, (i / N + pos) % 1, 0.155);
      // the soft tissue over the developing rows on the inner side
      ctx.save();
      ctx.strokeStyle = 'rgba(237,242,239,0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(JAW.x, JAW.y, JAW.r + 46, -0.12, -0.12 - 1.2, true);
      ctx.stroke();
      ctx.restore();
      label(ctx, 'RAHANG · TULANG RAWAN', JAW.x, JAW.y + 50, { size: 24, align: 'center', track: 3, a: 0.85 });
      // shed teeth: one each time the belt advances a slot, falling off the outer edge
      const mMin = Math.max(1, Math.ceil(posAt(t - 2.2) * N));
      const mMax = Math.floor(pos * N);
      for (let m = mMin; m <= mMax; m++) {
        let lo = t - 2.2;
        let hi = t;
        for (let it = 0; it < 22; it++) {
          const mid = (lo + hi) / 2;
          if (posAt(mid) < m / N) lo = mid;
          else hi = mid;
        }
        const age = t - hi;
        const R = rng(100 + m);
        const fall = clamp(age / 0.9);
        const th = -Math.PI + 0.2;
        const x0 = JAW.x + Math.cos(th) * (JAW.r + 30);
        const y0 = JAW.y + Math.sin(th) * (JAW.r + 30);
        const x = x0 - fall * (40 + R() * 200);
        const y = lerp(y0, BED + 24 + R() * 60, fall * fall);
        place(ctx, sp, x, y, 0.08, { ux: 0, uy: -150, rot: -1.6 - fall * (2 + R() * 3), a: 1 - clamp((age - 1.6) / 0.6) });
      }
      // direction of travel and the labels
      ctx.save();
      ctx.strokeStyle = CY.amber;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(JAW.x, JAW.y, JAW.r * 0.5, -0.35, -Math.PI + 0.35, true);
      ctx.stroke();
      ctx.restore();
      arrowHead(ctx, JAW.x + Math.cos(-Math.PI + 0.35) * JAW.r * 0.5, JAW.y + Math.sin(-Math.PI + 0.35) * JAW.r * 0.5, Math.PI / 2 + 0.35, { s: 26, color: CY.amber });
      label(ctx, 'BAN BERJALAN', JAW.x, JAW.y - 26, { size: 28, align: 'center', track: 5, color: CY.amber, p: P(t, tBan - 0.1, 0.5) });
      label(ctx, 'GIGI CADANGAN', 1240, 1180, { size: 26, align: 'center', track: 3, p: P(t, tGiginya + 0.3, 0.5) });
      label(ctx, 'tumbuh di sisi dalam', 1240, 1218, { size: 26, align: 'center', font: F.italic, track: 0, color: CY.light, p: P(t, tGiginya + 0.45, 0.5) });
      label(ctx, 'GIGI AKTIF', 720, 820, { size: 26, align: 'center', track: 3, p: P(t, tGiginya + 0.6, 0.5) });
      label(ctx, 'LEPAS', 230, 1150, { size: 26, align: 'center', track: 3, p: P(t, tGiginya + 0.9, 0.5) });
      ctx.restore();
    }

    /* ------------------------------ the count ---------------------------- */
    const pc = P(t, tTiga - 0.15, 0.3);
    if (pc > 0.001) {
      const n = 30000 * e3(P(t, tTiga - 0.05, Math.max(0.4, tRibu + 0.25 - tTiga), (x) => x));
      numCells(ctx, idNum(n), 1376, 1470, { size: 170, align: 'right', color: CY.amber, a: pc });
      label(ctx, 'gigi seumur hidup', 1376, 1530, { size: 40, align: 'right', font: F.italic, track: 0, p: P(t, tSeumur - 0.1, 0.5) });
    }
    void io;
    void hatch;
    void drawOn;
    void tFosil;
  },
};

const W_IN = 1440 - 92;
