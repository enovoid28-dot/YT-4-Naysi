// Episode 21 kit — "MALAM".
//
// One bedroom, one night. The whole episode happens in the same room: a window
// with the city behind it, a bed, and one amber alarm clock that never stops
// counting. Nothing is a diagram; the clock, the light on the wall and the
// shapes on the bed carry the numbers.
import { W, H, txt, hexA, fillRR, measure, ledNumber } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, rng, TAU } from '../engine/anim.mjs';
import { A, cue, cueWord, ease, plate, micro, headline, number, wash, say } from './_langit.mjs';

export const M = {
  void: '#04050C',
  wall: '#0A0B16',
  wall2: '#151929',
  floor: '#05060D',
  sheet: '#243050',
  sheetLo: '#151D31',
  pillow: '#39456B',
  amber: '#FFB25E',
  gold: '#FFD79A',
  ink: '#FFF6E8',
  ice: '#8FD8FF',
  iceDeep: '#2E6B96',
  red: '#FF6B57',
  lime: '#C8F751',
  dim: 'rgba(255,246,232,0.62)',
  faint: 'rgba(255,246,232,0.20)',
};

export { A, cue, cueWord, ease, plate, micro, headline, number, txt, hexA, fillRR, measure, clamp, lerp, rng, TAU, wash, say };

const B = 80;

/* ── the room: wall, window, city, floor ──────────────────────────────────── */

export function room(ctx, o = {}) {
  const { key = 'a', side = 'right', morning = 0, warm = 1, window: wantWindow = true } = o;
  const c = plate(`room-${key}-${side}-${morning}-${warm}-${wantWindow ? 1 : 0}`, W, H, (g) => {
    const wall = g.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#05060E');
    wall.addColorStop(0.30, '#0A0C18');
    wall.addColorStop(0.72, '#121527');
    wall.addColorStop(1, '#080A14');
    g.fillStyle = wall;
    g.fillRect(0, 0, W, H);

    // the corner of the room: a slightly lighter plane, so the wall has depth
    const corner = g.createLinearGradient(W * 0.62, 0, W, 0);
    corner.addColorStop(0, 'rgba(255,255,255,0)');
    corner.addColorStop(1, `rgba(150,180,255,${0.05 + 0.05 * morning})`);
    g.fillStyle = corner;
    g.fillRect(0, 0, W, H);

    // window
    const wx = side === 'right' ? 830 : -150;
    const wy = 250;
    const ww = 760;
    const wh = 900;
    if (wantWindow) {
      // the night behind the glass
      const sky = g.createLinearGradient(0, wy, 0, wy + wh);
      sky.addColorStop(0, morning > 0.5 ? '#243B63' : '#040713');
      sky.addColorStop(0.55, morning > 0.5 ? '#7C5E7A' : '#0A1430');
      sky.addColorStop(1, morning > 0.5 ? '#C98A62' : '#16233F');
      g.fillStyle = sky;
      g.fillRect(wx, wy, ww, wh);

      // moon / first light
      const mx = wx + ww * 0.68;
      const my = wy + wh * 0.22;
      const mg = g.createRadialGradient(mx, my, 4, mx, my, 190);
      mg.addColorStop(0, `rgba(226,240,255,${0.95 - morning * 0.5})`);
      mg.addColorStop(0.12, `rgba(190,214,255,${0.5 - morning * 0.3})`);
      mg.addColorStop(1, 'rgba(140,170,255,0)');
      g.fillStyle = mg;
      g.fillRect(mx - 200, my - 200, 400, 400);
      g.beginPath();
      g.arc(mx, my, 26, 0, TAU);
      g.fillStyle = `rgba(240,246,255,${0.9 - morning * 0.5})`;
      g.fill();

      // city: far bokeh, then near windows
      const b = rng(81);
      for (let i = 0; i < 260; i++) {
        const x = wx + b() * ww;
        const y = wy + wh * 0.48 + b() * wh * 0.5;
        const r = 1.5 + b() * 4.5;
        const warmDot = b() < 0.62;
        g.fillStyle = warmDot
          ? `rgba(255,190,120,${0.10 + b() * 0.35})`
          : `rgba(150,200,255,${0.08 + b() * 0.28})`;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
      }
      // horizon of the city
      g.fillStyle = 'rgba(4,6,12,0.86)';
      g.beginPath();
      g.moveTo(wx, wy + wh);
      for (let x = 0; x <= ww; x += 40) {
        const y = wy + wh * 0.86 - Math.sin(x * 0.010) * 26 - (x % 120 < 40 ? 44 : 0);
        g.lineTo(wx + x, y);
      }
      g.lineTo(wx + ww, wy + wh);
      g.closePath();
      g.fill();

      // a curtain on the near side of the glass: folds of almost-black cloth
      // catching a little of the city, so the wall has a shape to hold
      const cx0 = side === 'right' ? wx - 96 : wx + ww - 40;
      for (let i = 0; i < 5; i++) {
        const fw = 44 + i * 6;
        const g2 = g.createLinearGradient(cx0 + i * 44, wy - 60, cx0 + i * 44 + fw, wy + wh + 220);
        g2.addColorStop(0, 'rgba(12,15,26,0.92)');
        g2.addColorStop(0.45, `rgba(26,34,56,${0.55 + 0.05 * i})`);
        g2.addColorStop(1, 'rgba(8,10,18,0.96)');
        g.fillStyle = g2;
        g.beginPath();
        g.moveTo(cx0 + i * 44, wy - 120);
        g.bezierCurveTo(cx0 + i * 44 + fw * 0.4, wy + wh * 0.4, cx0 + i * 44 + fw * 0.2, wy + wh * 0.8, cx0 + i * 44 + fw * 0.5, wy + wh + 300);
        g.lineTo(cx0 + i * 44 + fw, wy + wh + 300);
        g.bezierCurveTo(cx0 + i * 44 + fw * 0.9, wy + wh * 0.6, cx0 + i * 44 + fw, wy + wh * 0.2, cx0 + i * 44 + fw, wy - 120);
        g.closePath();
        g.fill();
      }

      // glass: reflection sheen + a cool rim
      const sheen = g.createLinearGradient(wx, wy, wx + ww, wy + wh);
      sheen.addColorStop(0, 'rgba(200,225,255,0.09)');
      sheen.addColorStop(0.45, 'rgba(200,225,255,0.015)');
      sheen.addColorStop(1, 'rgba(200,225,255,0.07)');
      g.fillStyle = sheen;
      g.fillRect(wx, wy, ww, wh);

      // frame
      g.strokeStyle = 'rgba(10,12,20,0.95)';
      g.lineWidth = 26;
      g.strokeRect(wx, wy, ww, wh);
      g.strokeStyle = 'rgba(150,180,230,0.16)';
      g.lineWidth = 3;
      g.strokeRect(wx + 13, wy + 13, ww - 26, wh - 26);
      // mullion
      g.strokeStyle = 'rgba(10,12,20,0.95)';
      g.lineWidth = 18;
      g.beginPath();
      g.moveTo(wx + ww / 2, wy);
      g.lineTo(wx + ww / 2, wy + wh);
      g.moveTo(wx, wy + wh * 0.42);
      g.lineTo(wx + ww, wy + wh * 0.42);
      g.stroke();

      // the light the window throws into the room: soft fields only, never a
      // hard-edged shaft, so no polygon seam can show up on the wall
      const pool = g.createRadialGradient(wx + ww * 0.5, wy + wh * 0.72, 60, wx + ww * 0.5, wy + wh * 0.72, 1350);
      pool.addColorStop(0, `rgba(120,165,255,${0.15 + 0.10 * morning})`);
      pool.addColorStop(0.42, `rgba(85,125,215,${0.06 + 0.04 * morning})`);
      pool.addColorStop(1, 'rgba(50,80,170,0)');
      g.fillStyle = pool;
      g.fillRect(0, 200, W, 1600);
      const washG = g.createLinearGradient(wx + ww * 0.5, wy, W * 0.1, 2200);
      washG.addColorStop(0, `rgba(140,180,255,${0.10 + 0.06 * morning})`);
      washG.addColorStop(0.55, 'rgba(90,130,220,0.035)');
      washG.addColorStop(1, 'rgba(60,90,180,0)');
      g.fillStyle = washG;
      g.fillRect(0, 200, W, 2000);
    }

    // warm pool from the alarm clock / lamp, low and to the left
    const warmG = g.createRadialGradient(W * 0.28, 1690, 40, W * 0.28, 1690, 820);
    warmG.addColorStop(0, `rgba(255,178,94,${0.20 * warm})`);
    warmG.addColorStop(0.45, `rgba(255,150,80,${0.07 * warm})`);
    warmG.addColorStop(1, 'rgba(255,140,70,0)');
    g.fillStyle = warmG;
    g.fillRect(0, 900, W, 1100);

    // floor
    const fl = g.createLinearGradient(0, 1880, 0, H);
    fl.addColorStop(0, 'rgba(6,7,14,0)');
    fl.addColorStop(0.35, 'rgba(5,6,12,0.55)');
    fl.addColorStop(1, 'rgba(3,4,9,0.92)');
    g.fillStyle = fl;
    g.fillRect(0, 1780, W, H - 1780);

    // grain + vignette
    const rg = rng(77);
    for (let i = 0; i < 4600; i++) {
      g.fillStyle = `rgba(255,255,255,${rg() * 0.018})`;
      g.fillRect(rg() * W, rg() * H, 2, 2);
    }
    const vg = g.createRadialGradient(W / 2, H * 0.42, W * 0.34, W / 2, H * 0.42, W * 1.05);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(0.68, 'rgba(0,0,0,0.34)');
    vg.addColorStop(1, 'rgba(0,0,0,0.86)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
  });
  ctx.drawImage(c, -B, -B, W + 2 * B, H + 2 * B);
}

/* ── the bed ──────────────────────────────────────────────────────────────── */

/** Duvet + pillow across the bottom of the frame. `lift` raises the top edge. */
export function bed(ctx, o = {}) {
  const { y = 2060, a = 1, pillow = true, pillowX = W * 0.30, pillowY = 1930 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  // mattress / duvet body
  const g = ctx.createLinearGradient(0, y - 200, 0, H);
  g.addColorStop(0, M.sheet);
  g.addColorStop(0.35, M.sheetLo);
  g.addColorStop(1, '#0B1020');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-B, H);
  ctx.lineTo(-B, y + 40);
  ctx.bezierCurveTo(W * 0.2, y - 70, W * 0.52, y + 30, W * 0.78, y - 30);
  ctx.bezierCurveTo(W * 0.9, y - 60, W + B, y - 10, W + B, y + 10);
  ctx.lineTo(W + B, H);
  ctx.closePath();
  ctx.fill();

  // rim light along the duvet edge
  ctx.strokeStyle = 'rgba(178,208,255,0.38)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-B, y + 40);
  ctx.bezierCurveTo(W * 0.2, y - 70, W * 0.52, y + 30, W * 0.78, y - 30);
  ctx.bezierCurveTo(W * 0.9, y - 60, W + B, y - 10, W + B, y + 10);
  ctx.stroke();

  // folds
  const r = rng(133);
  ctx.strokeStyle = 'rgba(120,150,210,0.10)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    const fx = W * (0.08 + r() * 0.86);
    ctx.beginPath();
    ctx.moveTo(fx, y + 40 + r() * 60);
    ctx.quadraticCurveTo(fx + 60 + r() * 80, y + 190 + r() * 90, fx + 20 + r() * 90, H);
    ctx.stroke();
  }

  if (pillow) {
    const pg = ctx.createLinearGradient(pillowX - 320, pillowY - 160, pillowX + 240, pillowY + 190);
    pg.addColorStop(0, 'rgba(120,140,190,0.85)');
    pg.addColorStop(0.55, M.pillow);
    pg.addColorStop(1, 'rgba(28,36,58,0.95)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(pillowX, pillowY, 330, 120, -0.06, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,215,255,0.26)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(pillowX, pillowY, 330, 120, -0.06, Math.PI * 1.06, Math.PI * 1.94);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * A head lying on its side, face up. Stylised silhouette: skull, nose, chin,
 * neck, and a hair mass — no facial detail except one eyelid, which is the only
 * thing that has to act.
 */
export function sleeper(ctx, cx, cy, s, o = {}) {
  const { a = 1, open = 0, hair = '#05060C', skin = 'rgba(9,10,18,0.98)', rim = 0.5 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // neck / shoulder into the pillow
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(-0.10, 0.34);
  ctx.bezierCurveTo(0.05, 0.30, 0.30, 0.34, 0.44, 0.52);
  ctx.lineTo(0.52, 0.86);
  ctx.lineTo(-0.30, 0.86);
  ctx.bezierCurveTo(-0.34, 0.60, -0.28, 0.44, -0.10, 0.34);
  ctx.closePath();
  ctx.fill();

  // head: face up, so the profile runs along the top edge
  ctx.beginPath();
  ctx.moveTo(-0.42, 0.18);
  ctx.bezierCurveTo(-0.46, -0.10, -0.30, -0.34, 0.02, -0.36); // forehead
  ctx.bezierCurveTo(0.24, -0.37, 0.40, -0.26, 0.44, -0.12); // brow→nose bridge
  ctx.lineTo(0.50, -0.02); // nose tip
  ctx.lineTo(0.44, 0.04);
  ctx.lineTo(0.48, 0.10); // lips
  ctx.bezierCurveTo(0.44, 0.20, 0.34, 0.26, 0.20, 0.28); // chin→jaw
  ctx.bezierCurveTo(0.02, 0.30, -0.20, 0.30, -0.30, 0.24);
  ctx.closePath();
  ctx.fillStyle = skin;
  ctx.fill();

  // hair
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-0.44, 0.20);
  ctx.bezierCurveTo(-0.52, -0.12, -0.34, -0.46, -0.02, -0.46);
  ctx.bezierCurveTo(0.16, -0.46, 0.14, -0.34, 0.06, -0.30);
  ctx.bezierCurveTo(-0.12, -0.30, -0.26, -0.20, -0.30, 0.06);
  ctx.bezierCurveTo(-0.32, 0.16, -0.36, 0.22, -0.44, 0.20);
  ctx.closePath();
  ctx.fill();

  // rim light from the window along the top of the skull and the nose
  ctx.strokeStyle = `rgba(170,205,255,${0.42 * rim})`;
  ctx.lineWidth = 0.016;
  ctx.beginPath();
  ctx.moveTo(-0.40, 0.06);
  ctx.bezierCurveTo(-0.44, -0.14, -0.28, -0.34, 0.02, -0.35);
  ctx.bezierCurveTo(0.22, -0.36, 0.36, -0.26, 0.42, -0.13);
  ctx.stroke();

  // the eyelid: a closed lash line that can open into one bright slit
  const ex = 0.16;
  const ey = 0.02;
  if (open < 0.02) {
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 0.022;
    ctx.beginPath();
    ctx.moveTo(ex - 0.075, ey);
    ctx.quadraticCurveTo(ex, ey + 0.03, ex + 0.085, ey - 0.004);
    ctx.stroke();
  } else {
    const h = 0.012 + 0.05 * open;
    ctx.fillStyle = `rgba(255,236,214,${0.9 * open})`;
    ctx.beginPath();
    ctx.ellipse(ex, ey + 0.004, 0.082, h, -0.05, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(20,16,14,${0.95 * open})`;
    ctx.beginPath();
    ctx.arc(ex + 0.012, ey + 0.006, 0.030 + 0.008 * open, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${0.8 * open})`;
    ctx.beginPath();
    ctx.arc(ex + 0.0, ey - 0.004, 0.010, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/* ── the clock, which is the only thing in the film that counts ───────────── */

export function clock(ctx, x, y, h, text, o = {}) {
  const { a = 1, color = M.amber, glow = 1, on = 1, halo = 1 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  if (halo > 0) {
    const g = ctx.createRadialGradient(x, y + h * 0.42, h * 0.2, x, y + h * 0.42, h * 2.6);
    g.addColorStop(0, `rgba(255,170,90,${0.22 * halo})`);
    g.addColorStop(0.4, `rgba(255,150,70,${0.07 * halo})`);
    g.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - h * 3, y - h * 2, h * 6, h * 5);
  }
  const w = ledNumber(ctx, text, x, y, h, color, { glowBlur: h * 0.30 * glow, on });
  ctx.restore();
  return w;
}

/** A ruler of ten-minute ticks; `lit` of them glow. Used as elapsed night. */
export function hourRuler(ctx, x, y0, y1, o = {}) {
  const { n = 36, lit = 0, a = 1, color = M.amber, side = 1 } = o;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    const y = lerp(y0, y1, p);
    const hour = i % 6 === 0;
    const long = hour ? 46 : 22;
    const isLit = i <= lit;
    ctx.strokeStyle = isLit ? hexA(color, hour ? 0.95 : 0.55) : 'rgba(255,246,232,0.14)';
    ctx.lineWidth = hour ? 4 : 2.4;
    if (isLit && hour) {
      ctx.shadowColor = hexA(color, 0.8);
      ctx.shadowBlur = 18;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + long * side, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Slow dust motes, visible only where a light hits them. */
export function dust(ctx, t, o = {}) {
  const { a = 1, seed = 12, n = 26, x0 = 60, x1 = W - 60, y0 = 200, y1 = 1900 } = o;
  if (a <= 0.01) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const bx = lerp(x0, x1, r());
    const by = lerp(y0, y1, r());
    const sp = 8 + r() * 22;
    const x = bx + Math.sin(t * 0.25 + r() * TAU) * 30;
    const y = ((by - t * sp) % (y1 - y0) + (y1 - y0)) % (y1 - y0) + y0;
    const rad = 1.6 + r() * 3.2;
    ctx.fillStyle = `rgba(230,240,255,${0.10 + r() * 0.22})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** Smooth glowing curve through points [[x,y],...]. */
export function ribbon(ctx, pts, o = {}) {
  const { color = M.amber, lw = 8, glow = 26, a = 1, dash = null, fill = null } = o;
  if (a <= 0.01 || pts.length < 2) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0], last[1]);
  };
  if (fill) {
    path();
    ctx.lineTo(pts[pts.length - 1][0], fill);
    ctx.lineTo(pts[0][0], fill);
    ctx.closePath();
    const fg = ctx.createLinearGradient(0, Math.min(...pts.map((p) => p[1])), 0, fill);
    fg.addColorStop(0, hexA(color, 0.26));
    fg.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = fg;
    ctx.fill();
  }
  path();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.shadowColor = hexA(color, 0.75);
  ctx.shadowBlur = glow;
  ctx.stroke();
  ctx.restore();
}
