// Specimens for the cyanotype plates (episode 28). Every figure is a vector
// drawing in unit space (sharks are 1000 units long, facing right; teeth are
// ~1000 tall, crown up), baked once into a sprite with hatching and a union
// outline by specimen() from _cyano.mjs.
import { CY, Path2D, spline, sampleSpline, specimen, hatch, stipple, contourHatch, bake, makeCanvas, fbm } from './_cyano.mjs';
import { clamp, lerp, rng, TAU } from '../engine/anim.mjs';

const DEEP = 'rgba(5,18,46,';
const WHITE = 'rgba(237,242,239,';

/* ------------------------------ helpers ---------------------------------- */

function clipPts(c, pts, closed = true) {
  c.beginPath();
  const p = spline(pts, { closed });
  c.clip(p);
}

function strokePts(c, pts, { lw = 2, a = 0.9, color = CY.paper, closed = false, dash = null, k = 1 } = {}) {
  c.save();
  c.globalAlpha = a;
  c.strokeStyle = color;
  c.lineWidth = lw;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  if (dash) c.setLineDash(dash);
  c.stroke(spline(pts, { closed, k }));
  c.restore();
}

function fillPts(c, pts, color) {
  c.save();
  c.fillStyle = color;
  c.fill(spline(pts, { closed: true }));
  c.restore();
}

/** everything above (or below) a curve, as a closed region for clipping */
function sideOf(curve, up = true, far = 600) {
  const pts = curve.map(([x, y]) => [x, y, 1]);
  const a = curve[0];
  const b = curve[curve.length - 1];
  const y = up ? -far : far;
  return [...pts, [b[0], y, 1], [a[0], y, 1]];
}

function eye(c, x, y, r, { a = 1 } = {}) {
  c.save();
  c.globalAlpha = a;
  c.fillStyle = CY.deep;
  c.beginPath();
  c.ellipse(x, y, r * 1.2, r, 0, 0, TAU);
  c.fill();
  c.strokeStyle = CY.paper;
  c.lineWidth = Math.max(1.2, r * 0.28);
  c.stroke();
  c.fillStyle = CY.white;
  c.beginPath();
  c.arc(x - r * 0.1, y - r * 0.3, r * 0.22, 0, TAU);
  c.fill();
  c.restore();
}

/* ------------------------------- sharks ---------------------------------- */

const SHARK = {
  body: [
    [1000, 6], [992, -10], [972, -27], [940, -42], [895, -55], [840, -66], [770, -78], [700, -87], [620, -92], [540, -90], [460, -84], [380, -73],
    [310, -60], [250, -47], [200, -36], [160, -29], [128, -26, 1], [128, 24, 1], [160, 27], [205, 34], [260, 44], [330, 56], [410, 68], [490, 78],
    [570, 85], [650, 87], [720, 84], [785, 76], [840, 66], [885, 54], [925, 41], [958, 29], [982, 18], [996, 12],
  ],
  d1: [[712, -82, 1], [696, -122], [672, -170], [640, -214], [612, -246], [598, -256, 1], [590, -225], [586, -190], [580, -160], [568, -134], [550, -114, 1], [560, -100], [574, -90, 1]],
  d2: [[318, -58, 1], [306, -84], [294, -108, 1], [289, -94], [283, -76], [270, -62, 1], [284, -55, 1]],
  pec: [[804, 60, 1], [790, 90], [770, 124], [745, 158], [712, 188], [684, 204, 1], [696, 182], [708, 152], [720, 122], [732, 100], [742, 84, 1], [772, 72, 1]],
  pel: [[478, 76, 1], [462, 100], [440, 124], [426, 132, 1], [430, 116], [426, 100], [414, 84, 1]],
  anal: [[302, 52, 1], [290, 74], [274, 94, 1], [272, 80], [266, 64], [256, 50, 1]],
  tail: [[204, -34, 1], [168, -46], [132, -72], [96, -112], [62, -158], [30, -204], [6, -236, 1], [0, -228], [4, -214], [16, -200], [26, -190, 1], [40, -150], [58, -104],
    [74, -60], [84, -24], [88, -10, 1], [78, 22], [62, 60], [44, 98], [26, 128, 1], [56, 114], [92, 90], [128, 62], [160, 40], [200, 30, 1]],
  shade: [[1004, 8], [960, 12], [900, 16], [820, 20], [740, 22], [640, 22], [540, 18], [440, 14], [340, 10], [250, 6], [170, 2], [100, 0], [-20, -6]],
  top: [[1000, 6], [992, -10], [972, -27], [940, -42], [895, -55], [840, -66], [770, -78], [700, -87], [620, -92], [540, -90], [460, -84], [380, -73], [310, -60], [250, -47], [200, -36], [160, -29], [128, -26]],
};

function sharkPaint(def, { eyeAt, eyeR = 8, gills, mouth, lateral, spots = 0, seed = 7, copepod = false, keel = false, nostril = null, dorsalHatch = 7 }) {
  return (c) => {
    const R = rng(seed);
    // the back: a deep tone under the countershading line, contour-hatched
    c.save();
    clipPts(c, sideOf(def.shade, true));
    c.fillStyle = DEEP + '0.34)';
    c.fillRect(-100, -400, 1200, 800);
    const top = sampleSpline(def.top, { step: 8 });
    contourHatch(c, top, 18, { dy: dorsalHatch, lw: 1.25, a: 0.5, fade: 0.65 });
    stipple(c, 100, -110, 1000, 30, { n: 1600, r: 1.2, a: 0.32, seed: seed + 1 });
    c.restore();
    // the belly: pale, with level hatching that thickens toward the shade line
    c.save();
    clipPts(c, sideOf(def.shade, false));
    c.fillStyle = WHITE + '0.22)';
    c.fillRect(-100, -50, 1200, 500);
    hatch(c, 0, -40, 1000, 140, { angle: 0, step: 6, lw: 1.1, a: 0.42, seed: seed + 2 });
    c.restore();
    // a soft deep core along the shade line gives the body its roundness
    c.save();
    c.globalAlpha = 0.5;
    c.strokeStyle = DEEP + '0.45)';
    c.lineWidth = 7;
    c.stroke(spline(def.shade, { closed: false }));
    c.restore();
    // fins: their own hatch, darker at the root
    for (const [fin, ang] of [[def.d1, -1.1], [def.d2, -1.1], [def.pel, 1.0], [def.anal, 1.0], [def.tail, -0.5]]) {
      if (!fin) continue;
      c.save();
      clipPts(c, fin);
      c.fillStyle = DEEP + '0.28)';
      c.fillRect(-100, -400, 1200, 800);
      hatch(c, -50, -300, 1050, 300, { angle: ang, step: 6.5, lw: 1.1, a: 0.45, seed: R() * 999 });
      c.restore();
    }
    // the pectoral fin sits over the belly: fill, hatch and edge it
    if (def.pec) {
      c.save();
      clipPts(c, def.pec);
      c.fillStyle = DEEP + '0.42)';
      c.fillRect(-100, -400, 1200, 800);
      hatch(c, 500, 40, 820, 300, { angle: 0.95, step: 6, lw: 1.1, a: 0.5, seed: seed + 9 });
      c.restore();
      strokePts(c, def.pec, { lw: 2.6, a: 0.95, closed: true });
    }
    for (const fin of [def.pel]) if (fin) strokePts(c, fin, { lw: 2, a: 0.7, closed: true });
    // fin roots
    if (def.d1) strokePts(c, [def.d1[0], [640, -96], def.d1[def.d1.length - 1]], { lw: 1.4, a: 0.35 });
    // gill slits
    for (const g of gills) strokePts(c, g, { lw: 2.6, a: 0.9 });
    // lateral line
    if (lateral) strokePts(c, lateral, { lw: 1.4, a: 0.55, dash: [7, 6] });
    if (mouth) strokePts(c, mouth, { lw: 2.4, a: 0.85 });
    if (nostril) strokePts(c, nostril, { lw: 2, a: 0.8 });
    if (keel) strokePts(c, [[236, 2], [190, 2], [140, 0]], { lw: 2.4, a: 0.7 });
    // ampullae on the snout
    stipple(c, 900, -36, 1000, 26, { n: 90, r: 1.6, a: 0.75, seed: seed + 4 });
    if (spots) {
      // the Greenland shark's mottled hide
      const RR = rng(seed + 50);
      for (let i = 0; i < spots; i++) {
        const x = 150 + RR() * 830;
        const y = -110 + RR() * 200;
        const r = 1.2 + RR() * RR() * 4.5;
        c.fillStyle = RR() < 0.55 ? DEEP + `${0.18 + RR() * 0.22})` : WHITE + `${0.12 + RR() * 0.16})`;
        c.beginPath();
        c.ellipse(x, y, r * 1.4, r, RR() * 3, 0, TAU);
        c.fill();
      }
    }
    eye(c, eyeAt[0], eyeAt[1], eyeR);
    if (copepod) {
      // Ommatokoita, the parasite that hangs from its eye
      strokePts(c, [[eyeAt[0] - 4, eyeAt[1] + 4], [eyeAt[0] - 16, eyeAt[1] + 14], [eyeAt[0] - 34, eyeAt[1] + 18], [eyeAt[0] - 52, eyeAt[1] + 14]], { lw: 3.2, a: 0.95, color: CY.white });
      strokePts(c, [[eyeAt[0] - 6, eyeAt[1] + 6], [eyeAt[0] - 20, eyeAt[1] + 22], [eyeAt[0] - 36, eyeAt[1] + 30]], { lw: 2.4, a: 0.85, color: CY.white });
    }
  };
}

const GILLS = [868, 851, 834, 817, 800].map((x, i) => [[x + 1, -30 + i * 1.5], [x + 6, 0], [x - 2, 32 - i * 2]]);

export function sharkSprite(s = 2.2) {
  return specimen(`shark:${s}`, {
    shapes: [SHARK.body, SHARK.d1, SHARK.d2, SHARK.pec, SHARK.pel, SHARK.anal, SHARK.tail],
    box: [-10, -262, 1006, 278],
    s,
    lw: 2.8,
    fill: 'rgba(237,242,239,0.08)',
    paint: sharkPaint(SHARK, {
      eyeAt: [930, -14],
      gills: GILLS,
      mouth: [[968, 26], [940, 37], [908, 45], [882, 49], [866, 53]],
      lateral: [[915, -26], [800, -30], [650, -30], [500, -24], [350, -14], [220, -6], [150, -3]],
      nostril: [[984, 4], [976, 8], [968, 6]],
      keel: true,
    }),
  });
}

/* Cladoselache-type ancient shark: terminal mouth, broad pectorals, a high
   near-symmetrical tail with a keel (a reconstruction, as labelled). */
const ANCIENT = {
  body: [
    [1000, 10], [990, -14], [965, -36], [925, -56], [870, -74], [800, -90], [720, -100], [630, -104], [540, -100], [450, -90], [370, -76], [300, -60],
    [240, -44], [190, -32], [150, -24, 1], [150, 22, 1], [190, 30], [240, 40], [300, 54], [370, 68], [450, 80], [540, 88], [630, 90], [720, 86],
    [800, 76], [870, 62], [925, 46], [965, 32], [990, 22],
  ],
  d1: [[652, -100, 1], [640, -150], [626, -196], [608, -236, 1], [596, -204], [580, -156], [560, -98, 1]],
  d2: [[332, -62, 1], [320, -100], [304, -134, 1], [294, -104], [276, -58, 1]],
  pec: [[772, 70, 1], [752, 108], [724, 148], [690, 184], [654, 212, 1], [664, 178], [676, 140], [686, 108], [696, 84, 1]],
  pel: [[446, 80, 1], [428, 110], [404, 128, 1], [404, 104], [392, 80, 1]],
  tail: [[200, -30, 1], [160, -60], [116, -116], [70, -180], [36, -232, 1], [46, -176], [62, -110], [78, -44], [84, 0, 1], [78, 44], [62, 110], [46, 176], [36, 232, 1], [70, 180], [116, 116], [160, 60], [200, 30, 1]],
  shade: [[1004, 12], [940, 16], [840, 20], [700, 22], [560, 20], [420, 14], [300, 8], [200, 4], [-20, 0]],
  top: [[1000, 10], [990, -14], [965, -36], [925, -56], [870, -74], [800, -90], [720, -100], [630, -104], [540, -100], [450, -90], [370, -76], [300, -60], [240, -44], [190, -32], [150, -24]],
};

export function ancientSprite(s = 1.6) {
  return specimen(`ancient:${s}`, {
    shapes: [ANCIENT.body, ANCIENT.d1, ANCIENT.d2, ANCIENT.pec, ANCIENT.pel, ANCIENT.tail],
    box: [20, -250, 1006, 262],
    s,
    lw: 2.8,
    paint: sharkPaint(ANCIENT, {
      eyeAt: [944, -20],
      eyeR: 12,
      gills: [880, 862, 844, 826, 808].map((x, i) => [[x + 5, -34 + i], [x, 0], [x - 5, 36 - i]]),
      mouth: [[1000, 12], [968, 18], [936, 24], [926, 20]],
      lateral: [[910, -30], [760, -34], [600, -30], [440, -22], [300, -12], [180, -4]],
      keel: true,
      seed: 21,
    }),
  });
}

/* Somniosus microcephalus: a thick, slow body, small fins, no anal fin. */
const GREEN = {
  body: [
    [1000, 18], [996, -6], [982, -30], [958, -52], [922, -72], [870, -90], [800, -104], [720, -112], [630, -114], [540, -110], [450, -100], [370, -86],
    [300, -70], [240, -54], [190, -40], [150, -30, 1], [150, 30, 1], [190, 40], [240, 52], [300, 66], [370, 82], [450, 96], [540, 106], [630, 110],
    [720, 108], [800, 100], [870, 88], [922, 74], [958, 60], [982, 46], [996, 32],
  ],
  d1: [[566, -106, 1], [552, -138], [534, -160, 1], [522, -148], [508, -128], [490, -106, 1]],
  d2: [[334, -80, 1], [322, -110], [306, -128, 1], [296, -116], [286, -96], [272, -74, 1]],
  pec: [[826, 88, 1], [802, 126], [774, 154], [752, 166, 1], [744, 148], [750, 124], [762, 104], [776, 94, 1]],
  pel: [[470, 98, 1], [454, 124], [436, 140, 1], [434, 122], [426, 106], [412, 96, 1]],
  tail: [[198, -38, 1], [160, -56], [118, -90], [80, -128], [48, -160], [24, -178, 1], [14, -166], [20, -148], [30, -138, 1], [44, -100], [58, -60], [70, -24],
    [74, -8, 1], [64, 30], [50, 70], [36, 100], [26, 118, 1], [52, 108], [88, 86], [124, 60], [160, 42], [198, 36, 1]],
  shade: [[1004, 20], [940, 26], [840, 30], [700, 32], [560, 30], [420, 24], [300, 16], [200, 8], [-20, 0]],
  top: [[1000, 18], [996, -6], [982, -30], [958, -52], [922, -72], [870, -90], [800, -104], [720, -112], [630, -114], [540, -110], [450, -100], [370, -86], [300, -70], [240, -54], [190, -40], [150, -30]],
};

export function greenlandSprite(s = 1.6) {
  return specimen(`greenland:${s}`, {
    shapes: [GREEN.body, GREEN.d1, GREEN.d2, GREEN.pec, GREEN.pel, GREEN.tail],
    box: [10, -184, 1004, 172],
    s,
    lw: 2.8,
    paint: sharkPaint(GREEN, {
      eyeAt: [950, -26],
      eyeR: 6.5,
      gills: [880, 868, 856, 844, 832].map((x, i) => [[x + 3, -24 + i], [x, 0], [x - 3, 22 - i]]),
      mouth: [[992, 40], [960, 50], [930, 54], [918, 50]],
      lateral: [[930, -40], [760, -48], [600, -46], [440, -36], [300, -22], [180, -8]],
      spots: 900,
      copepod: true,
      seed: 33,
      dorsalHatch: 7.5,
    }),
  });
}

/** plain silhouettes for icons (waffle cells, markers) */
export function sharkIcon(px = 90, color = CY.paper) {
  return bake(`icon:shark:${px}:${color}`, px, px * 0.56, (c) => {
    const s = px / 1060;
    c.translate(px * 0.02 + 10 * s, px * 0.28);
    c.scale(s, s);
    c.fillStyle = color;
    for (const sh of [SHARK.body, SHARK.d1, SHARK.d2, SHARK.pec, SHARK.pel, SHARK.anal, SHARK.tail]) c.fill(spline(sh));
  });
}

export function rayIcon(px = 90, color = CY.paper) {
  return bake(`icon:ray:${px}:${color}`, px, px * 0.56, (c) => {
    const s = px / 1000;
    c.translate(px / 2, px * 0.24);
    c.scale(s, s);
    c.fillStyle = color;
    // top view: rounded diamond disc, pelvic lobes and a whip tail
    c.fill(spline([[0, -200], [140, -140], [330, -40], [470, 30, 1], [300, 90], [140, 150], [40, 190], [0, 200], [-40, 190], [-140, 150], [-300, 90], [-470, 30, 1], [-330, -40], [-140, -140]]));
    c.fill(spline([[0, 180], [60, 230], [40, 290], [0, 270], [-40, 290], [-60, 230]]));
    c.strokeStyle = color;
    c.lineWidth = 26;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, 260);
    c.quadraticCurveTo(20, 420, -10, 540);
    c.stroke();
  });
}

export function chimaeraIcon(px = 90, color = CY.paper) {
  return bake(`icon:chim:${px}:${color}`, px, px * 0.56, (c) => {
    const s = px / 1000;
    c.translate(px * 0.04, px * 0.3);
    c.scale(s, s);
    c.fillStyle = color;
    c.fill(spline([[960, 0], [930, -60], [860, -90], [760, -96], [640, -80], [480, -50], [300, -24], [100, -6], [0, 0, 1], [100, 8], [300, 26], [480, 46], [640, 62], [760, 64], [860, 54], [930, 34]]));
    c.fill(spline([[720, 50, 1], [640, 170], [560, 220, 1], [600, 140], [620, 70, 1]]));
    c.fill(spline([[700, -90, 1], [680, -190], [640, -230, 1], [630, -160], [620, -84, 1]]));
  });
}

/* -------------------------------- teeth ---------------------------------- */

/** serrated edge from a to b: small teeth pushed outward (normal side s) */
function serrate(a, b, n, depth, side = 1) {
  const out = [];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * side;
  const ny = (dx / len) * side;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const bow = Math.sin(u * Math.PI) * 0.06 * len; // convex edges
    const x = a[0] + dx * u + nx * bow;
    const y = a[1] + dy * u + ny * bow;
    out.push([x, y, 1]);
    if (i < n && depth > 0) {
      const u2 = (i + 0.5) / n;
      const bow2 = Math.sin(u2 * Math.PI) * 0.06 * len;
      out.push([a[0] + dx * u2 + nx * (bow2 + depth), a[1] + dy * u2 + ny * (bow2 + depth), 1]);
    }
  }
  return out;
}

const TOOTH = {
  // Otodus megalodon: broad, finely serrated, chevron bourlette, deep root
  meg: () => {
    const L = serrate([-300, 40], [0, -520], 36, 7, 1).reverse();
    const Rr = serrate([0, -520], [300, 40], 36, 7, 1);
    const root = [[330, 80], [318, 150], [262, 204], [170, 196], [70, 152], [0, 124, 1], [-70, 152], [-170, 196], [-262, 204], [-318, 150], [-330, 80]];
    return [...L.slice(0, -1), ...Rr, ...root];
  },
  white: () => {
    const L = serrate([-240, 40], [0, -470], 16, 12, 1).reverse();
    const Rr = serrate([0, -470], [240, 40], 16, 12, 1);
    const root = [[262, 80], [250, 140], [196, 182], [120, 172], [40, 134], [0, 112, 1], [-40, 134], [-120, 172], [-196, 182], [-250, 140], [-262, 80]];
    return [...L.slice(0, -1), ...Rr, ...root];
  },
  mako: () => [[40, -560, 1], [70, -460], [100, -320], [120, -170], [140, -20], [190, 50], [250, 120], [240, 190, 1], [150, 150], [60, 100], [0, 90, 1], [-60, 100], [-150, 150], [-240, 190, 1], [-250, 120], [-190, 50], [-140, -20], [-110, -170], [-70, -320], [-20, -460]],
  hybodus: () => [[-360, 40, 1], [-330, -20], [-300, -90, 1], [-270, -20], [-200, 0], [-170, -60], [-150, -150, 1], [-120, -60], [-70, -20], [-36, -160], [0, -340, 1], [36, -160], [70, -20], [120, -60], [150, -150, 1], [170, -60], [200, 0], [270, -20], [300, -90, 1], [330, -20], [360, 40, 1], [340, 150], [0, 170], [-340, 150]],
  ptychodus: () => [[-280, -120], [-220, -230], [0, -270], [220, -230], [280, -120], [300, 40], [240, 150], [0, 180], [-240, 150], [-300, 40]],
  clado: () => [[-330, 60, 1], [-300, -10], [-270, -170, 1], [-240, -10], [-160, 0], [-130, -90], [-110, -150, 1], [-90, -60], [-46, -30], [-20, -250], [0, -440, 1], [20, -250], [46, -30], [90, -60], [110, -150, 1], [130, -90], [160, 0], [240, -10], [270, -170, 1], [300, -10], [330, 60, 1], [300, 150], [0, 180], [-300, 150]],
};

export const TOOTH_INFO = {
  meg: ['Otodus megalodon', 'Miosen–Pliosen'],
  white: ['Carcharodon', 'kini'],
  mako: ['Isurus', 'Miosen'],
  hybodus: ['Hybodus', 'Trias–Kapur'],
  ptychodus: ['Ptychodus', 'Kapur'],
  clado: ['Cladodus', 'Devon'],
};

export function toothSprite(kind, s = 0.5) {
  const shape = TOOTH[kind]();
  return specimen(`tooth:${kind}:${s}`, {
    shapes: [shape],
    box: [-380, -580, 380, 220],
    s,
    lw: 3.2,
    fill: 'rgba(237,242,239,0.16)',
    paint: (c) => {
      // enamel: fan hatching toward the tip; root: porous stipple
      const tipY = kind === 'ptychodus' ? -270 : -560;
      c.save();
      c.beginPath();
      c.rect(-400, -600, 800, kind === 'ptychodus' ? 760 : 620);
      c.clip();
      c.strokeStyle = CY.paper;
      c.lineWidth = 2.2;
      if (kind === 'ptychodus') {
        for (let i = 0; i < 9; i++) {
          c.globalAlpha = 0.75;
          c.beginPath();
          c.ellipse(0, -60 + i * 22, 250 - i * 6, 60, 0, Math.PI * 1.05, Math.PI * 1.95);
          c.stroke();
        }
        stipple(c, -300, -270, 300, 180, { n: 900, r: 3, a: 0.5, seed: 4 });
      } else {
        for (let i = -12; i <= 12; i++) {
          c.globalAlpha = 0.34 + 0.2 * (1 - Math.abs(i) / 12);
          c.beginPath();
          c.moveTo(i * 4, tipY + 60);
          c.quadraticCurveTo(i * 16, -200, i * 26, 40);
          c.stroke();
        }
      }
      c.restore();
      // bourlette / root band
      c.save();
      c.fillStyle = DEEP + '0.45)';
      c.beginPath();
      c.moveTo(-340, 40);
      c.quadraticCurveTo(0, -30, 340, 40);
      c.lineTo(340, 300);
      c.lineTo(-340, 300);
      c.closePath();
      c.fill();
      stipple(c, -340, 30, 340, 220, { n: 700, r: 3.2, a: 0.55, seed: 9 });
      c.strokeStyle = CY.paper;
      c.lineWidth = 3;
      c.globalAlpha = 0.8;
      c.beginPath();
      c.moveTo(-320, 46);
      c.quadraticCurveTo(0, -20, 320, 46);
      c.stroke();
      c.restore();
    },
  });
}

/* ------------------------------ denticles -------------------------------- */

const DENT = [[-420, 0], [-380, -150], [-260, -250], [-80, -280], [100, -250], [260, -196], [430, -150, 1], [320, -84], [300, -40], [520, 0, 1], [300, 40], [320, 84], [430, 150, 1], [260, 196], [100, 250], [-80, 280], [-260, 250], [-380, 150]];

export function denticleSprite(s = 0.18) {
  return specimen(`dent:${s}`, {
    shapes: [DENT],
    box: [-440, -300, 540, 300],
    s,
    lw: 2.4,
    fill: 'rgba(237,242,239,0.2)',
    paint: (c) => {
      // three keels, each a lit ridge with a shadowed groove beside it
      for (const [y0, y1] of [[-120, -150], [0, 0], [120, 150]]) {
        c.save();
        c.strokeStyle = DEEP + '0.6)';
        c.lineWidth = 34;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(-300, y0 * 0.8 + 24);
        c.quadraticCurveTo(80, y0 + 30, y1 === 0 ? 470 : 400, y1 + 20);
        c.stroke();
        c.strokeStyle = CY.white;
        c.lineWidth = 18;
        c.globalAlpha = 0.9;
        c.beginPath();
        c.moveTo(-300, y0 * 0.8);
        c.quadraticCurveTo(80, y0, y1 === 0 ? 480 : 410, y1);
        c.stroke();
        c.restore();
      }
      hatch(c, -440, -300, 540, 300, { angle: 0.05, step: 26, lw: 6, a: 0.25 });
    },
  });
}

/* -------------------------------- trees ---------------------------------- */

/** Wattieza: a trunk with a crown of fern-like fronds (Gilboa, ~385 Ma) */
export function treeSprite(s = 0.9, seed = 3) {
  return bake(`tree:${s}:${seed}`, 700 * s + 40, 1080 * s + 40, (c) => {
    const R = rng(seed);
    c.translate(350 * s + 20, 1040 * s + 20);
    c.scale(s, s);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    // trunk with flared base and roots
    const trunk = spline([[-52, 0, 1], [-40, -60], [-30, -200], [-24, -420], [-20, -640], [-16, -730, 1], [16, -730, 1], [20, -640], [24, -420], [30, -200], [40, -60], [52, 0, 1]]);
    c.fillStyle = WHITE + '0.16)';
    c.fill(trunk);
    c.save();
    c.clip(trunk);
    for (let x = -60; x < 60; x += 7) {
      c.strokeStyle = CY.paper;
      c.globalAlpha = 0.4 + R() * 0.3;
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(x, 0);
      c.bezierCurveTo(x * 0.8, -240, x * 0.5, -480, x * 0.3, -740);
      c.stroke();
    }
    for (let y = -20; y > -720; y -= 26 + R() * 10) {
      c.globalAlpha = 0.5;
      c.beginPath();
      c.moveTo(-40, y);
      c.quadraticCurveTo(0, y + 6, 40, y);
      c.stroke();
    }
    c.restore();
    c.globalAlpha = 1;
    c.strokeStyle = CY.paper;
    c.lineWidth = 3.2;
    c.stroke(trunk);
    for (const sd of [-1, 1]) {
      for (let r = 0; r < 3; r++) {
        c.lineWidth = 2.6 - r * 0.5;
        c.beginPath();
        c.moveTo(sd * 30, -6);
        c.quadraticCurveTo(sd * (70 + r * 40), 4 + r * 4, sd * (110 + r * 55), 18 + r * 8);
        c.stroke();
      }
    }
    // the crown: fronds arching out and drooping, each with branchlets
    const n = 13;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1) - 0.5;
      const ang = -Math.PI / 2 + u * 2.6 + (R() - 0.5) * 0.12;
      const len = 260 + R() * 90 - Math.abs(u) * 40;
      const pts = [];
      for (let k = 0; k <= 16; k++) {
        const v = k / 16;
        const droop = v * v * (90 + Math.abs(u) * 160);
        pts.push([Math.cos(ang) * len * v, -730 + Math.sin(ang) * len * v + droop]);
      }
      c.globalAlpha = 0.95;
      c.lineWidth = 3;
      c.beginPath();
      pts.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.stroke();
      for (let k = 3; k < pts.length - 1; k++) {
        const [x, y] = pts[k];
        const [x2, y2] = pts[k + 1];
        const da = Math.atan2(y2 - y, x2 - x);
        const bl = (1 - k / pts.length) * 46 + 12;
        for (const sd of [-1, 1]) {
          const a2 = da + sd * 0.95;
          c.lineWidth = 1.6;
          c.globalAlpha = 0.75;
          c.beginPath();
          c.moveTo(x, y);
          const mx = x + Math.cos(a2) * bl * 0.6;
          const my = y + Math.sin(a2) * bl * 0.6 + 6;
          c.quadraticCurveTo(mx, my, x + Math.cos(a2) * bl, y + Math.sin(a2) * bl + 12);
          c.stroke();
          // forked tips
          c.lineWidth = 1.1;
          c.beginPath();
          c.moveTo(mx, my);
          c.lineTo(mx + Math.cos(a2 + sd * 0.6) * bl * 0.35, my + Math.sin(a2 + sd * 0.6) * bl * 0.35 + 6);
          c.stroke();
        }
      }
    }
  });
}

/** a simple broadleaf tree silhouette (the "pohon" icon) */
export function treeIcon(px = 300) {
  return bake(`treeicon:${px}`, px, px * 1.2, (c) => {
    const s = px / 1000;
    c.translate(px / 2, px * 1.2 - 6);
    c.scale(s, s);
    c.fillStyle = CY.paper;
    c.fill(spline([[-60, 0, 1], [-46, -200], [-40, -420], [40, -420], [46, -200], [60, 0, 1]]));
    const R = rng(12);
    for (let i = 0; i < 26; i++) {
      const a = R() * TAU;
      const r = R() * 300;
      c.beginPath();
      c.arc(Math.cos(a) * r * 1.2, -720 + Math.sin(a) * r * 0.85, 130 + R() * 90, 0, TAU);
      c.fill();
    }
  });
}

/* -------------------------- the Ordovician floor ------------------------- */

/** moss cushion, side view: leafy shoots in a low dome, a few spore stalks
 *  (unit ~ 300 wide, ~150 tall) */
export function mossPatch(c, x, y, s = 1, { seed = 4, a = 1 } = {}) {
  const R = rng(seed);
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.globalAlpha *= a;
  c.strokeStyle = CY.paper;
  c.fillStyle = CY.paper;
  c.lineCap = 'round';
  const shoots = 46;
  for (let i = 0; i < shoots; i++) {
    const u = i / (shoots - 1) - 0.5;
    const px = u * 260 + (R() - 0.5) * 10;
    const dome = Math.cos(u * Math.PI) * 0.85 + 0.15;
    const h = (34 + R() * 18) * dome + 8;
    const lean = (R() - 0.5) * 0.25 + u * 0.5;
    c.globalAlpha = (0.6 + R() * 0.4) * a;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(px, 0);
    const tx = px + Math.sin(lean) * h;
    c.quadraticCurveTo(px + Math.sin(lean) * h * 0.4, -h * 0.6, tx, -h);
    c.stroke();
    // tiny leaves up the stem
    const nl = 4 + Math.floor(R() * 3);
    c.lineWidth = 1.1;
    for (let k = 1; k <= nl; k++) {
      const v = k / (nl + 1);
      const lx = px + Math.sin(lean) * h * v;
      const ly = -h * v;
      const sd = k % 2 ? 1 : -1;
      c.beginPath();
      c.moveTo(lx, ly);
      c.lineTo(lx + sd * (6 + R() * 4), ly - 6 - R() * 3);
      c.stroke();
    }
  }
  // spore stalks with capsules
  for (let i = 0; i < 7; i++) {
    const px = (R() - 0.5) * 200;
    const h = 90 + R() * 60;
    const bend = (R() - 0.5) * 22;
    c.globalAlpha = 0.95 * a;
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(px, -30);
    c.quadraticCurveTo(px + bend * 0.3, -h * 0.6, px + bend, -h);
    c.stroke();
    c.save();
    c.translate(px + bend, -h - 7);
    c.rotate(0.5 + bend * 0.02);
    c.beginPath();
    c.ellipse(0, 0, 4.5, 10, 0, 0, TAU);
    c.fill();
    c.beginPath();
    c.moveTo(0, -10);
    c.lineTo(2, -16);
    c.stroke();
    c.restore();
  }
  c.restore();
}

/** trilobite, top view (unit ~ 160 long) */
export function trilobite(c, x, y, s = 1, { rot = 0, a = 1 } = {}) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  c.globalAlpha *= a;
  c.strokeStyle = CY.paper;
  c.fillStyle = WHITE + '0.18)';
  c.lineWidth = 2;
  const body = spline([[0, -80], [40, -72], [62, -50], [58, -20], [46, 20], [34, 56], [14, 78], [0, 82], [-14, 78], [-34, 56], [-46, 20], [-58, -20], [-62, -50], [-40, -72]]);
  c.fill(body);
  c.stroke(body);
  // genal spines
  c.beginPath();
  c.moveTo(56, -40);
  c.quadraticCurveTo(70, -10, 66, 22);
  c.moveTo(-56, -40);
  c.quadraticCurveTo(-70, -10, -66, 22);
  c.stroke();
  // cephalon edge, glabella, eyes
  c.beginPath();
  c.moveTo(-58, -36);
  c.quadraticCurveTo(0, -24, 58, -36);
  c.stroke();
  c.beginPath();
  c.ellipse(0, -56, 13, 20, 0, 0, TAU);
  c.stroke();
  for (const sd of [-1, 1]) {
    c.beginPath();
    c.arc(sd * 28, -48, 8, sd > 0 ? 2.2 : -0.9, sd > 0 ? 4.2 : 1.1);
    c.stroke();
  }
  // thorax segments and the three lobes
  for (let i = 0; i < 10; i++) {
    const yy = -28 + i * 9;
    const wdt = 52 - i * 2.6;
    c.globalAlpha = 0.8 * a;
    c.beginPath();
    c.moveTo(-wdt, yy);
    c.quadraticCurveTo(0, yy + 4, wdt, yy);
    c.stroke();
  }
  c.beginPath();
  c.moveTo(-14, -30);
  c.lineTo(-10, 66);
  c.moveTo(14, -30);
  c.lineTo(10, 66);
  c.stroke();
  c.restore();
}

/** crinoid (sea lily): segmented stalk, a cup, and feathery arms that open
 *  upward like a duster (never drooping like a palm) */
export function crinoid(c, x, y, h, t, { seed = 2, a = 1, sway = 1 } = {}) {
  const R = rng(seed);
  c.save();
  c.globalAlpha *= a;
  c.strokeStyle = CY.paper;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const bend = Math.sin(t * 0.5 + seed) * 0.06 * sway;
  const stalkH = h * 0.62;
  const pts = [];
  for (let i = 0; i <= 22; i++) {
    const v = i / 22;
    pts.push([x + Math.sin(v * 1.4 + seed) * 10 * v + bend * stalkH * v * v, y - stalkH * v]);
  }
  c.lineWidth = 3.4;
  c.beginPath();
  pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
  c.stroke();
  c.lineWidth = 1.3;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i];
    c.beginPath();
    c.moveTo(px - 5, py);
    c.lineTo(px + 5, py);
    c.stroke();
  }
  // holdfast roots
  for (const sd of [-1, 1]) {
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + sd * 14, y + 2, x + sd * 26, y + 6);
    c.stroke();
  }
  const [tx, ty] = pts[pts.length - 1];
  // the cup
  c.fillStyle = WHITE + '0.32)';
  c.beginPath();
  c.moveTo(tx - 6, ty);
  c.quadraticCurveTo(tx - 16, ty - 10, tx - 15, ty - 22);
  c.lineTo(tx + 15, ty - 22);
  c.quadraticCurveTo(tx + 16, ty - 10, tx + 6, ty);
  c.closePath();
  c.fill();
  c.lineWidth = 1.8;
  c.stroke();
  // arms: rise, open, curl in at the tips; pinnules point up the arm
  const n = 10;
  const crown = h * 0.4;
  for (let k = 0; k < n; k++) {
    const u = k / (n - 1) - 0.5;
    const open = u * 1.25 + Math.sin(t * 0.8 + k * 0.9) * 0.03 * sway;
    const bx = tx + u * 26;
    const by = ty - 22;
    const ex = bx + Math.sin(open) * crown * 0.75;
    const ey = by - Math.cos(open) * crown;
    const cx1 = bx + Math.sin(open) * crown * 0.15;
    const cy1 = by - crown * 0.55;
    const curl = -Math.sign(u || 1) * crown * 0.12;
    const tipx = ex + curl;
    const tipy = ey + crown * 0.06;
    c.lineWidth = 1.8;
    c.globalAlpha = 0.95 * a;
    c.beginPath();
    c.moveTo(bx, by);
    c.quadraticCurveTo(cx1, cy1, ex, ey);
    c.quadraticCurveTo(ex + curl * 0.4, ey - crown * 0.04, tipx, tipy);
    c.stroke();
    c.lineWidth = 1;
    c.globalAlpha = 0.7 * a;
    for (let j = 1; j < 10; j++) {
      const v = j / 10;
      const qx = (1 - v) * (1 - v) * bx + 2 * (1 - v) * v * cx1 + v * v * ex;
      const qy = (1 - v) * (1 - v) * by + 2 * (1 - v) * v * cy1 + v * v * ey;
      const dx = 2 * (1 - v) * (cx1 - bx) + 2 * v * (ex - cx1);
      const dy = 2 * (1 - v) * (cy1 - by) + 2 * v * (ey - cy1);
      const ang = Math.atan2(dy, dx);
      const pl = 7 + (1 - v) * 4;
      for (const sd of [-1, 1]) {
        c.beginPath();
        c.moveTo(qx, qy);
        c.lineTo(qx + Math.cos(ang + sd * 0.55) * pl, qy + Math.sin(ang + sd * 0.55) * pl);
        c.stroke();
      }
    }
  }
  void R;
  c.restore();
}

/* --------------------------- the K-Pg actors ----------------------------- */

const TREX = [
  [0, -268, 1], [24, -298], [80, -318], [140, -330], [186, -324], [222, -302], [256, -280], [310, -270], [372, -282], [470, -302], [560, -298], [660, -270], [770, -236], [880, -200], [1000, -168, 1],
  [880, -182], [770, -202], [660, -216], [586, -216], [566, -186], [552, -140], [528, -104], [536, -62], [552, -26], [566, 0, 1], [446, 0, 1], [450, -14], [480, -30], [476, -82], [456, -122], [416, -160],
  [366, -180], [306, -196], [262, -212], [222, -226], [190, -234], [120, -240], [40, -246], [6, -256],
];
const TREX_FAR = [[540, -170, 1], [512, -120], [498, -70], [512, -28], [520, 0, 1], [430, 0, 1], [440, -12], [460, -26], [452, -70], [444, -120], [470, -170, 1]];
const TREX_ARM = [[300, -198, 1], [278, -186], [262, -170, 1], [272, -168], [284, -178], [296, -186, 1]];

export function trexSprite(s = 0.7) {
  return specimen(`trex:${s}`, {
    shapes: [TREX, TREX_ARM],
    box: [-10, -340, 1010, 10],
    s,
    lw: 2.6,
    fill: 'rgba(237,242,239,0.14)',
    paint: (c) => {
      c.save();
      c.fillStyle = DEEP + '0.35)';
      c.fill(spline(TREX_FAR));
      c.restore();
      hatch(c, 0, -340, 1000, 0, { angle: -0.7, step: 10, lw: 2.2, a: 0.45 });
      eye(c, 150, -300, 8);
      strokePts(c, [[6, -258], [60, -262], [130, -258], [180, -262]], { lw: 3, a: 0.9 });
    },
  });
}

/** an engraved asteroid: lumpy rock, craters, shading from the upper left */
export function asteroidSprite(s = 1) {
  return bake(`asteroid:${s}`, 260 * s, 260 * s, (c) => {
    const R = rng(77);
    c.translate(130 * s, 130 * s);
    c.scale(s, s);
    const pts = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * TAU;
      const r = 100 * (0.84 + 0.22 * fbm(Math.cos(a) * 2 + 5, Math.sin(a) * 2 + 5, 3, 3));
      pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.9]);
    }
    const body = spline(pts);
    c.fillStyle = WHITE + '0.2)';
    c.fill(body);
    c.save();
    c.clip(body);
    hatch(c, -120, -120, 120, 120, { angle: 0.8, step: 7, lw: 1.6, a: 0.55, shade: (x, y) => clamp(0.2 + (x + y) / 160) });
    for (let i = 0; i < 9; i++) {
      const x = (R() - 0.5) * 140;
      const y = (R() - 0.5) * 130;
      const r = 6 + R() * 18;
      c.strokeStyle = CY.paper;
      c.lineWidth = 2;
      c.globalAlpha = 0.8;
      c.beginPath();
      c.arc(x, y, r, 0.6, 3.9);
      c.stroke();
      c.strokeStyle = DEEP + '0.6)';
      c.beginPath();
      c.arc(x, y, r, 3.9, 6.9);
      c.stroke();
    }
    c.restore();
    c.strokeStyle = CY.paper;
    c.lineWidth = 3;
    c.globalAlpha = 1;
    c.stroke(body);
  });
}

/* ------------------------------ the VOC ship ----------------------------- */

/** a Dutch East Indiaman under sail, side view (unit ~ 1000 long) */
export function shipSprite(s = 0.4) {
  return bake(`ship:${s}`, 1150 * s, 980 * s, (c) => {
    c.translate(560 * s, 800 * s);
    c.scale(s, s);
    c.strokeStyle = CY.paper;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const hull = spline([[-430, -160, 1], [-330, -160, 1], [-320, -112], [-120, -96], [120, -92], [330, -110], [420, -150, 1], [400, -80], [340, -10], [180, 40], [0, 54], [-240, 46], [-380, 20], [-430, -40]]);
    c.fillStyle = WHITE + '0.16)';
    c.fill(hull);
    c.save();
    c.clip(hull);
    for (let y = -150; y < 60; y += 13) {
      c.globalAlpha = 0.55;
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(-440, y);
      c.quadraticCurveTo(0, y + 26, 440, y - 24);
      c.stroke();
    }
    c.fillStyle = DEEP + '0.5)';
    for (let i = 0; i < 9; i++) c.fillRect(-300 + i * 70, -64 + i * 0.6, 22, 16);
    c.restore();
    c.globalAlpha = 1;
    c.lineWidth = 3.4;
    c.stroke(hull);
    // masts
    const masts = [[-230, -760], [10, -900], [230, -800]];
    c.lineWidth = 6;
    for (const [mx, my] of masts) {
      c.beginPath();
      c.moveTo(mx, -100);
      c.lineTo(mx, my);
      c.stroke();
    }
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(400, -140);
    c.lineTo(600, -300);
    c.stroke();
    // square sails, bellied, with seams
    const sail = (cx, y0, w, h) => {
      const p = spline([[cx - w / 2, y0, 1], [cx + w / 2, y0, 1], [cx + w / 2 + 14, y0 + h * 0.5], [cx + w / 2, y0 + h, 1], [cx - w / 2, y0 + h, 1], [cx - w / 2 + 16, y0 + h * 0.5]]);
      c.fillStyle = WHITE + '0.3)';
      c.fill(p);
      c.save();
      c.clip(p);
      c.lineWidth = 1.4;
      for (let x = cx - w / 2; x < cx + w / 2; x += 16) {
        c.globalAlpha = 0.5;
        c.beginPath();
        c.moveTo(x, y0);
        c.quadraticCurveTo(x + 10, y0 + h / 2, x, y0 + h);
        c.stroke();
      }
      c.restore();
      c.globalAlpha = 1;
      c.lineWidth = 2.6;
      c.stroke(p);
      c.beginPath();
      c.moveTo(cx - w / 2 - 20, y0);
      c.lineTo(cx + w / 2 + 20, y0);
      c.stroke();
    };
    sail(10, -560, 330, 290);
    sail(10, -820, 250, 220);
    sail(230, -500, 290, 250);
    sail(230, -740, 220, 190);
    sail(-230, -480, 240, 220);
    sail(-230, -700, 180, 160);
    // spritsail and lateen hints, rigging
    c.lineWidth = 1.3;
    c.globalAlpha = 0.6;
    for (const [mx, my] of masts) {
      c.beginPath();
      c.moveTo(mx, my);
      c.lineTo(mx - 180, -150);
      c.moveTo(mx, my);
      c.lineTo(mx + 180, -140);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(230, -800);
    c.lineTo(600, -300);
    c.stroke();
    // pennants
    c.globalAlpha = 1;
    c.fillStyle = CY.paper;
    for (const [mx, my] of masts) {
      c.beginPath();
      c.moveTo(mx, my);
      c.lineTo(mx + 90, my + 14);
      c.lineTo(mx, my + 28);
      c.closePath();
      c.fill();
    }
  });
}

/** a standing person, very simple (the clock's last seconds) */
export function human(c, x, y, h, { a = 1, color = CY.amber } = {}) {
  const s = h / 100;
  c.save();
  c.globalAlpha *= a;
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = color;
  c.beginPath();
  c.arc(0, -88, 10, 0, TAU);
  c.fill();
  c.fill(spline([[-14, -74], [14, -74], [18, -40], [12, -36], [10, -6, 1], [3, 0, 1], [0, -30], [-3, 0, 1], [-10, -6, 1], [-12, -36], [-18, -40]]));
  c.restore();
}

/** shark jaw cross-section: the cartilage, for the conveyor diagram */
export function jawPath(cx, cy, r) {
  const p = new Path2D();
  p.arc(cx, cy, r, Math.PI * 0.95, Math.PI * 2.05);
  p.arc(cx, cy, r * 0.7, Math.PI * 2.05, Math.PI * 0.95, true);
  p.closePath();
  return p;
}

export { makeCanvas };
