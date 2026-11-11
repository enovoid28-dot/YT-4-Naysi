/**
 * Episode 8 — people, drawn.
 *
 * Everything in this channel is painted in code, so the figures are too: a
 * small forward-kinematics body built from capsules, with one warm key from the
 * upper left and a cool rim on the shadow side. At 300 px they read as a person
 * you can build a story around; at 40 px they read as scale on a dyke.
 */

const CAP = (ctx, x1, y1, x2, y2, w, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const mixHex = (a, b, k) => {
  const p = (s) => [1, 3, 5].map((i) => parseInt(s.substr(i, 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const f = (x, y) => Math.round(x + (y - x) * k).toString(16).padStart(2, '0');
  return `#${f(r1, r2)}${f(g1, g2)}${f(b1, b2)}`;
};

const PAL = {
  skin: '#7E5A3E',
  skinLit: '#A87A55',
  shirt: '#CFC7B4',
  shirtLit: '#EDE6D2',
  shirtDark: '#9E9682',
  pants: '#3A4448',
  pantsLit: '#5A686C',
  hat: '#B99B60',
  hatLit: '#E0C285',
  boot: '#241C16',
  tarp: '#2E4A55',
  tarpLit: '#4E7480',
  sack: '#D9CBB0',
};

/* --------------------------------- poses ---------------------------------- */

// All coordinates are in units of the figure height, origin at the feet, y up.
const POSES = {
  stand: {
    hip: [0, 0.48], chest: [0.01, 0.70], shoulder: [0.015, 0.815], head: [0.03, 0.905],
    elbowA: [-0.05, 0.63], handA: [-0.055, 0.47],
    elbowB: [0.07, 0.63], handB: [0.08, 0.47],
    kneeA: [-0.04, 0.25], footA: [-0.055, 0.01],
    kneeB: [0.06, 0.25], footB: [0.075, 0.01],
    lean: 0,
  },
  watch: {
    hip: [0, 0.48], chest: [0.005, 0.70], shoulder: [0.01, 0.815], head: [0.03, 0.905],
    elbowA: [-0.17, 0.635], handA: [-0.05, 0.495],
    elbowB: [0.16, 0.625], handB: [0.05, 0.505],
    kneeA: [-0.05, 0.25], footA: [-0.07, 0.01],
    kneeB: [0.07, 0.25], footB: [0.085, 0.01],
    lean: 0,
  },
  // bent double, one hand in the water, the other holding a bundle of seedlings
  plant: {
    hip: [-0.03, 0.40], chest: [0.09, 0.545], shoulder: [0.15, 0.62], head: [0.26, 0.695],
    elbowA: [0.23, 0.455], handA: [0.30, 0.245],
    elbowB: [0.04, 0.49], handB: [-0.04, 0.335],
    kneeA: [-0.21, 0.20], footA: [-0.27, 0.01],
    kneeB: [0.19, 0.20], footB: [0.25, 0.01],
    lean: 0.24,
  },
  // walking away, sack on the shoulder
  haul: {
    hip: [0, 0.48], chest: [0.03, 0.70], shoulder: [0.05, 0.815], head: [0.09, 0.905],
    elbowA: [-0.09, 0.645], handA: [-0.05, 0.79],
    elbowB: [0.16, 0.60], handB: [0.21, 0.44],
    kneeA: [-0.15, 0.26], footA: [-0.23, 0.03],
    kneeB: [0.12, 0.25], footB: [0.18, 0.01],
    lean: 0.05,
  },
  rake: {
    hip: [-0.02, 0.47], chest: [0.06, 0.66], shoulder: [0.09, 0.78], head: [0.15, 0.855],
    elbowA: [0.17, 0.62], handA: [0.27, 0.60],
    elbowB: [0.22, 0.55], handB: [0.34, 0.46],
    kneeA: [-0.16, 0.24], footA: [-0.22, 0.01],
    kneeB: [0.14, 0.24], footB: [0.20, 0.01],
    lean: 0.12,
  },
  cover: {
    hip: [-0.02, 0.42], chest: [0.10, 0.58], shoulder: [0.16, 0.66], head: [0.24, 0.71],
    elbowA: [0.24, 0.50], handA: [0.30, 0.34],
    elbowB: [0.30, 0.48], handB: [0.36, 0.30],
    kneeA: [-0.18, 0.22], footA: [-0.24, 0.01],
    kneeB: [0.16, 0.22], footB: [0.22, 0.01],
    lean: 0.2,
  },
  carry: {
    hip: [0, 0.48], chest: [0.01, 0.70], shoulder: [0.02, 0.815], head: [0.05, 0.905],
    elbowA: [-0.10, 0.66], handA: [-0.02, 0.80],
    elbowB: [0.10, 0.63], handB: [0.06, 0.79],
    kneeA: [-0.10, 0.24], footA: [-0.16, 0.01],
    kneeB: [0.10, 0.25], footB: [0.14, 0.01],
    lean: 0.06,
  },
  walk: {
    hip: [0, 0.48], chest: [0.02, 0.70], shoulder: [0.03, 0.815], head: [0.06, 0.905],
    elbowA: [-0.08, 0.64], handA: [-0.12, 0.48],
    elbowB: [0.09, 0.64], handB: [0.14, 0.50],
    kneeA: [-0.13, 0.27], footA: [-0.20, 0.04],
    kneeB: [0.10, 0.26], footB: [0.16, 0.01],
    lean: 0.03,
  },
};

/**
 * Draw one person.
 * @param x      foot anchor x
 * @param y      foot anchor y (ground line)
 * @param h      pixel height
 * @o.pose       key of POSES
 * @o.facing     1 (right) or -1 (left)
 * @o.alpha      opacity
 * @o.hat        0..1 how much hat
 * @o.cloth      shirt colour override
 * @o.rake       0..1 draw a rake in the hands
 * @o.sack       0..1 draw a sack carried
 * @o.tarp       0..1 draw a tarp handled in front
 * @o.rim        rim light strength
 */
export function person(ctx, x, y, h, o = {}) {
  const {
    pose = 'stand', facing = 1, alpha = 1, hat = 1, cloth = PAL.shirt,
    rake = 0, sack = 0, tarp = 0, seedlings = 0, rim = 0.55, key = 1, skin = PAL.skin,
  } = o;
  if (alpha <= 0.01 || h < 6) return;
  const P = POSES[pose] || POSES.stand;
  const px = (p) => x + p[0] * h * facing;
  const py = (p) => y - p[1] * h;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineJoin = 'round';

  // contact shadow
  const sw = h * 0.34;
  const g = ctx.createRadialGradient(x, y, 2, x, y, sw);
  g.addColorStop(0, 'rgba(28,20,14,0.42)');
  g.addColorStop(1, 'rgba(28,20,14,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - sw, y - sw * 0.35, sw * 2, sw * 0.7);

  const lwLeg = h * 0.085;
  const lwArm = h * 0.062;
  const lwTorso = h * 0.136;

  // pelvis: the mass that stops the legs reading as two sticks
  CAP(ctx, px([-0.05, P.hip[1]]), py(P.hip), px([0.05, P.hip[1]]), py(P.hip), lwLeg * 1.12, PAL.pants);

  // legs (back leg slightly darker)
  CAP(ctx, px(P.kneeA), py(P.kneeA), px(P.footA), py(P.footA), lwLeg * 0.94, PAL.pants);
  CAP(ctx, px(P.hip), py(P.hip), px(P.kneeA), py(P.kneeA), lwLeg, PAL.pants);
  CAP(ctx, px(P.hip), py(P.hip), px(P.kneeB), py(P.kneeB), lwLeg, PAL.pants);
  CAP(ctx, px(P.kneeB), py(P.kneeB), px(P.footB), py(P.footB), lwLeg * 0.96, PAL.pantsLit);
  // boots
  ctx.fillStyle = PAL.boot;
  ctx.beginPath();
  ctx.ellipse(px(P.footA), py(P.footA), h * 0.045, h * 0.022, 0, 0, Math.PI * 2);
  ctx.ellipse(px(P.footB), py(P.footB), h * 0.045, h * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();

  // arms: upper arm in the shirt, forearm bare, hand as a small mass
  const arm = (a, b, c, sleeve, skinCol) => {
    CAP(ctx, px(a), py(a), px(b), py(b), lwArm, sleeve);
    CAP(ctx, px(b), py(b), px(c), py(c), lwArm * 0.78, skinCol);
    ctx.fillStyle = skinCol;
    ctx.beginPath();
    ctx.ellipse(px(c), py(c), h * 0.03, h * 0.036, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // back arm: sleeve a shade under the shirt so the upper arm separates
  arm(P.shoulder, P.elbowA, P.handA, mixHex(cloth, PAL.shirtDark, 0.5), mixHex(skin, '#6B4B34', 0.4));

  // torso: a slightly tapered body from hip to shoulder
  const hx = px(P.hip);
  const hy = py(P.hip);
  const sx = px(P.shoulder);
  const sy = py(P.shoulder);
  ctx.beginPath();
  ctx.moveTo(hx - lwTorso * 0.42, hy);
  ctx.quadraticCurveTo(hx - lwTorso * 0.55, (hy + sy) / 2, sx - lwTorso * 0.62, sy);
  ctx.lineTo(sx + lwTorso * 0.62, sy);
  ctx.quadraticCurveTo(hx + lwTorso * 0.6, (hy + sy) / 2, hx + lwTorso * 0.44, hy);
  ctx.closePath();
  const tg = ctx.createLinearGradient(hx - lwTorso, 0, hx + lwTorso, 0);
  tg.addColorStop(0, mixHex(cloth, PAL.shirtLit, 0.6));
  tg.addColorStop(0.45, cloth);
  tg.addColorStop(1, mixHex(cloth, PAL.shirtDark, 0.65));
  ctx.fillStyle = tg;
  ctx.fill();
  // one soft fold, no hard crease
  ctx.strokeStyle = 'rgba(30,24,18,0.10)';
  ctx.lineWidth = Math.max(1, h * 0.007);
  ctx.beginPath();
  ctx.moveTo((hx + sx) / 2 + lwTorso * 0.05, (hy + sy) / 2 - h * 0.05);
  ctx.quadraticCurveTo((hx + sx) / 2 - lwTorso * 0.02, (hy + sy) / 2, (hx + sx) / 2 + lwTorso * 0.06, (hy + sy) / 2 + h * 0.05);
  ctx.stroke();

  if (sack > 0.01) {
    ctx.save();
    ctx.globalAlpha *= sack;
    const bx = px(P.shoulder) + h * 0.11 * facing;
    const by = py(P.shoulder) + h * 0.055;
    const sw2 = h * 0.22;
    const sh = h * 0.17;
    const sg = ctx.createLinearGradient(bx - sw2 / 2, by - sh / 2, bx + sw2 / 2, by + sh);
    sg.addColorStop(0, '#EFE4CB');
    sg.addColorStop(0.6, PAL.sack);
    sg.addColorStop(1, '#9C8E74');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(bx - sw2 * 0.52, by + sh * 0.1);
    ctx.quadraticCurveTo(bx - sw2 * 0.6, by - sh * 0.62, bx, by - sh * 0.6);
    ctx.quadraticCurveTo(bx + sw2 * 0.6, by - sh * 0.62, bx + sw2 * 0.52, by + sh * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(180,71,44,0.8)';
    ctx.fillRect(bx - sw2 * 0.3, by - sh * 0.16, sw2 * 0.6, sh * 0.14);
    ctx.restore();
  }

  // neck + head
  const hcx = px(P.head);
  const hcy = py(P.head);
  const hr = h * 0.058;
  CAP(ctx, (sx + hcx) / 2, sy + h * 0.006, hcx, hcy + hr * 0.75, h * 0.042, PAL.skin);
  ctx.beginPath();
  ctx.ellipse(hcx, hcy, hr * 0.92, hr, 0.06 * facing, 0, Math.PI * 2);
  const hg = ctx.createLinearGradient(hcx - hr, hcy - hr, hcx + hr, hcy + hr);
  hg.addColorStop(0, PAL.skinLit);
  hg.addColorStop(0.6, skin);
  hg.addColorStop(1, '#5A3F2B');
  ctx.fillStyle = hg;
  ctx.fill();

  // hat: a wide conical farmer's hat
  if (hat > 0.01) {
    ctx.save();
    ctx.globalAlpha *= hat;
    ctx.beginPath();
    ctx.ellipse(hcx, hcy - hr * 0.5, hr * 2.05, hr * 0.52, 0.04 * facing, 0, Math.PI * 2);
    const hg2 = ctx.createLinearGradient(hcx - hr * 2, hcy - hr, hcx + hr * 2, hcy);
    hg2.addColorStop(0, PAL.hatLit);
    hg2.addColorStop(0.55, PAL.hat);
    hg2.addColorStop(1, '#8A7040');
    ctx.fillStyle = hg2;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hcx - hr * 0.62, hcy - hr * 0.6);
    ctx.quadraticCurveTo(hcx, hcy - hr * 2.0, hcx + hr * 0.62, hcy - hr * 0.6);
    ctx.closePath();
    ctx.fillStyle = PAL.hat;
    ctx.fill();
    ctx.restore();
  }

  // front arm
  const sleeve = mixHex(cloth, '#7E7866', 0.26);
  arm(P.shoulder, P.elbowB, P.handB, sleeve, mixHex(skin, PAL.skinLit, 0.5));

  // props
  if (rake > 0.01) {
    ctx.save();
    ctx.globalAlpha *= rake;
    const gripX = px(P.handB);
    const gripY = py(P.handB);
    const footX = x + h * 0.52 * facing;
    const footY = y - h * 0.01;
    const dx = footX - gripX;
    const dy = footY - gripY;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    CAP(ctx, gripX - ux * h * 0.06, gripY - uy * h * 0.06, footX, footY, Math.max(2, h * 0.021), '#8A6A42');
    // head: a bar across the tip, with teeth pointing forward
    const ax = -uy;
    const ay = ux;
    ctx.strokeStyle = '#6E5232';
    ctx.lineWidth = Math.max(2, h * 0.016);
    ctx.beginPath();
    ctx.moveTo(footX - ax * h * 0.085, footY - ay * h * 0.085);
    ctx.lineTo(footX + ax * h * 0.085, footY + ay * h * 0.085);
    ctx.stroke();
    for (let i = -2; i <= 2; i++) {
      const bx = footX + ax * i * h * 0.034;
      const by = footY + ay * i * h * 0.034;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + ux * h * 0.045, by + uy * h * 0.045);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (seedlings > 0.01) {
    ctx.save();
    ctx.globalAlpha *= seedlings;
    const bx = px(P.handB);
    const by = py(P.handB);
    const rg = ctx.createLinearGradient(bx - h * 0.06, by, bx + h * 0.06, by - h * 0.18);
    rg.addColorStop(0, '#5C7F3E');
    rg.addColorStop(1, '#9DC46A');
    ctx.strokeStyle = rg;
    ctx.lineWidth = Math.max(2, h * 0.012);
    ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + i * 0.30;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(
        bx + Math.sin(a) * h * 0.05, by - h * 0.10,
        bx + Math.sin(a) * h * 0.09 + h * 0.01, by - h * 0.17 - Math.cos(a) * h * 0.02,
      );
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(60,44,26,0.55)';
    ctx.beginPath();
    ctx.ellipse(bx, by + h * 0.005, h * 0.028, h * 0.016, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (tarp > 0.01) {
    ctx.save();
    ctx.globalAlpha *= tarp;
    const ax = px(P.handA);
    const ay = py(P.handA);
    const bx = px(P.handB);
    const by = py(P.handB);
    const tg2 = ctx.createLinearGradient(ax, ay, bx, by + h * 0.3);
    tg2.addColorStop(0, PAL.tarpLit);
    tg2.addColorStop(1, PAL.tarp);
    ctx.fillStyle = tg2;
    ctx.beginPath();
    ctx.moveTo(ax - h * 0.06, ay - h * 0.02);
    ctx.quadraticCurveTo((ax + bx) / 2 + h * 0.14, (ay + by) / 2 + h * 0.10, bx + h * 0.04, by);
    ctx.quadraticCurveTo((ax + bx) / 2 + h * 0.06, (ay + by) / 2 + h * 0.40, ax - h * 0.04, ay + h * 0.16);
    ctx.closePath();
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // rim light on the lit edge
  if (rim > 0.01) {
    ctx.globalAlpha *= rim;
    ctx.strokeStyle = 'rgba(255,226,170,0.55)';
    ctx.lineWidth = Math.max(1, h * 0.012);
    ctx.beginPath();
    ctx.moveTo(sx - lwTorso * 0.6, sy + h * 0.01);
    ctx.lineTo(hx - lwTorso * 0.44, hy - h * 0.01);
    ctx.moveTo(sx, sy);
    ctx.lineTo(px(P.elbowA), py(P.elbowA));
    ctx.stroke();
    ctx.globalAlpha /= rim;
    ctx.globalAlpha *= key > 1 ? 1 : 1;
  }
  ctx.restore();
}

/** A tiny figure for aerials: a few pixels of warm colour with a shadow. */
export function speck(ctx, x, y, s = 1, { a = 1, color = '#2E2A22' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(40,30,20,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + s * 1.2, s * 2.2, s * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.9, s * 2.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export { PAL, POSES };
