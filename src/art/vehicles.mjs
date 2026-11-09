import { C, hexA, rr, fillRR, strokeRR, linGrad, radGrad, txt } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { rng, clamp, lerp } from '../engine/anim.mjs';

/** Stylised oil tanker, side view. Origin at the centre of the hull. */
export function tanker(ctx, o = {}) {
  const { len = 880, alpha = 1, hull = '#241A1C', stripe = '#8E2F2A', deck = '#3A2B2A', light = '#FFD9A0' } = o;
  const s = len / 880;
  ctx.save();
  ctx.scale(s, s);
  ctx.globalAlpha *= alpha;

  const hullGrad = linGrad(ctx, 0, -40, 0, 90, [
    [0, '#4A3231'],
    [0.35, hull],
    [1, '#120C0E'],
  ]);

  // hull silhouette
  ctx.beginPath();
  ctx.moveTo(-440, -10);
  ctx.lineTo(-430, 56);
  ctx.quadraticCurveTo(-380, 78, -260, 80);
  ctx.lineTo(300, 80);
  ctx.quadraticCurveTo(400, 78, 430, 40);
  ctx.quadraticCurveTo(444, 10, 436, -14);
  ctx.closePath();
  ctx.fillStyle = hullGrad;
  ctx.fill();

  // rust stripe along the waterline
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-436, 34);
  ctx.lineTo(-360, 58);
  ctx.lineTo(420, 44);
  ctx.lineTo(432, 20);
  ctx.closePath();
  ctx.fillStyle = stripe;
  ctx.globalAlpha *= 0.85;
  ctx.fill();
  ctx.restore();

  // bulbous bow shadow
  ctx.save();
  ctx.globalAlpha *= 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(410, 46, 26, 14, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // deck
  ctx.beginPath();
  ctx.moveTo(-432, -10);
  ctx.lineTo(432, -14);
  ctx.lineTo(430, -30);
  ctx.lineTo(-428, -26);
  ctx.closePath();
  ctx.fillStyle = deck;
  ctx.fill();

  // deck fittings: manifolds and pipes
  const r = rng(5);
  for (let i = 0; i < 6; i++) {
    const x = -300 + i * 96;
    fillRR(ctx, x, -46, 26, 18, 3, '#2B1F20');
    fillRR(ctx, x + 4, -54, 18, 9, 2, '#1A1214');
    if (r() > 0.4) {
      ctx.strokeStyle = '#3A2A28';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 13, -54);
      ctx.lineTo(x + 13, -74);
      ctx.stroke();
    }
  }

  // superstructure (stern)
  fillRR(ctx, -350, -104, 150, 78, 4, '#3F3432');
  fillRR(ctx, -344, -132, 132, 32, 4, '#4A3D3A');
  // bridge windows
  ctx.save();
  ctx.fillStyle = hexA(light, 0.9);
  for (let i = 0; i < 7; i++) ctx.fillRect(-336 + i * 18, -126, 11, 10);
  for (let i = 0; i < 6; i++) ctx.fillRect(-340 + i * 22, -96, 12, 9);
  ctx.restore();
  // funnel
  fillRR(ctx, -196, -140, 40, 44, 4, '#352827');
  fillRR(ctx, -196, -132, 40, 10, 2, stripe);
  // mast
  ctx.strokeStyle = '#4A3D3A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-366, -132);
  ctx.lineTo(-366, -196);
  ctx.stroke();
  // warm deck lights
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 8; i++) {
    const x = -300 + i * 88;
    const g = radGrad(ctx, x, -40, 0, 34, [
      [0, hexA(light, 0.85)],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, -40, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // hull portholes
  ctx.save();
  ctx.fillStyle = hexA('#FFCF8E', 0.5);
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(-260 + i * 110, 16, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // rim light along the deck edge
  ctx.strokeStyle = hexA('#FFC08A', 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-428, -28);
  ctx.lineTo(430, -32);
  ctx.stroke();
  ctx.restore();
}

/** Wake behind a vessel: soft tapered foam plus ripple lines. */
export function wake(ctx, x, y, angle, len, t, o = {}) {
  const { alpha = 0.5, color = '#BFE6E2' } = o;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalCompositeOperation = 'screen';
  const g = linGrad(ctx, 0, 0, len, 0, [
    [0, hexA(color, alpha)],
    [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.quadraticCurveTo(len * 0.45, -70, len, -4);
  ctx.quadraticCurveTo(len * 0.45, 60, 0, 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = hexA(color, alpha * 0.5);
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const p = ((t * 0.25 + i / 7) % 1) * len;
    ctx.globalAlpha = (1 - p / len) * alpha * 0.7;
    ctx.beginPath();
    ctx.moveTo(p, -10);
    ctx.quadraticCurveTo(p + 60, 0, p, 10);
    ctx.stroke();
  }
  ctx.restore();
}

/** Side-view jet. Origin at centre of fuselage. */
export function jet(ctx, o = {}) {
  const { len = 760, alpha = 1, body = '#F2EDE4', trim = C.ember, dark = '#1A1A22', gear = false } = o;
  const s = len / 760;
  ctx.save();
  ctx.scale(s, s);
  ctx.globalAlpha *= alpha;

  // tail fin
  ctx.beginPath();
  ctx.moveTo(-300, -34);
  ctx.lineTo(-360, -150);
  ctx.lineTo(-292, -150);
  ctx.lineTo(-236, -34);
  ctx.closePath();
  ctx.fillStyle = trim;
  ctx.fill();
  ctx.save();
  ctx.globalAlpha *= 0.9;
  fillRR(ctx, -330, -96, 22, 62, 3, '#F2EDE4');
  ctx.restore();

  // rear stabiliser
  ctx.beginPath();
  ctx.moveTo(-296, -14);
  ctx.lineTo(-372, -46);
  ctx.lineTo(-372, -22);
  ctx.lineTo(-286, 4);
  ctx.closePath();
  ctx.fillStyle = body;
  ctx.fill();

  // fuselage
  const g = linGrad(ctx, 0, -52, 0, 52, [
    [0, '#FFFDF8'],
    [0.55, body],
    [1, '#B8AFA2'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-320, -40);
  ctx.quadraticCurveTo(-330, 0, -300, 26);
  ctx.quadraticCurveTo(140, 44, 300, 20);
  ctx.quadraticCurveTo(392, 4, 372, -20);
  ctx.quadraticCurveTo(320, -46, 140, -46);
  ctx.lineTo(-300, -46);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  // cockpit
  ctx.beginPath();
  ctx.moveTo(322, -32);
  ctx.quadraticCurveTo(366, -26, 372, -12);
  ctx.lineTo(330, -14);
  ctx.closePath();
  ctx.fillStyle = dark;
  ctx.fill();

  // windows
  ctx.fillStyle = hexA(dark, 0.75);
  for (let i = 0; i < 16; i++) ctx.fillRect(-150 + i * 26, -26, 12, 7);

  // wing (swept back)
  ctx.beginPath();
  ctx.moveTo(60, 10);
  ctx.lineTo(-140, 76);
  ctx.lineTo(-40, 82);
  ctx.lineTo(120, 26);
  ctx.closePath();
  ctx.fillStyle = '#DCD3C4';
  ctx.fill();
  // engine pod
  fillRR(ctx, -30, 34, 150, 34, 17, '#C9C0B1');
  fillRR(ctx, 96, 38, 26, 26, 13, '#8E867A');

  // livery stripe
  ctx.save();
  ctx.globalAlpha *= 0.95;
  ctx.beginPath();
  ctx.moveTo(-300, -12);
  ctx.lineTo(300, -12);
  ctx.lineTo(300, 2);
  ctx.lineTo(-300, 6);
  ctx.closePath();
  ctx.fillStyle = trim;
  ctx.fill();
  ctx.restore();

  // rim highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-290, -44);
  ctx.lineTo(150, -44);
  ctx.stroke();

  if (gear) {
    ctx.strokeStyle = '#4A4640';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(240, 26);
    ctx.lineTo(240, 60);
    ctx.moveTo(-40, 40);
    ctx.lineTo(-40, 66);
    ctx.stroke();
    ctx.fillStyle = '#141418';
    ctx.beginPath();
    ctx.arc(240, 62, 9, 0, Math.PI * 2);
    ctx.arc(-40, 68, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Simple wicker basket with groceries. Origin at bottom-centre. */
export function basket(ctx, o = {}) {
  const { w = 520, alpha = 1, rot = 0 } = o;
  const s = w / 520;
  ctx.save();
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalAlpha *= alpha;

  // groceries first (behind the rim)
  // bread
  ctx.save();
  ctx.rotate(-0.22);
  const bg = linGrad(ctx, -120, -300, -60, -180, [
    [0, '#F0C98A'],
    [1, '#B9853F'],
  ]);
  ctx.beginPath();
  ctx.ellipse(-86, -230, 74, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = '#8D5F28';
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-140 + i * 40, -262);
    ctx.lineTo(-118 + i * 40, -204);
    ctx.stroke();
  }
  ctx.restore();

  // milk carton
  ctx.save();
  ctx.translate(30, -250);
  fillRR(ctx, -46, -60, 92, 120, 6, '#F4F1EA');
  ctx.beginPath();
  ctx.moveTo(-46, -60);
  ctx.lineTo(-46, -84);
  ctx.lineTo(0, -108);
  ctx.lineTo(46, -84);
  ctx.lineTo(46, -60);
  ctx.closePath();
  ctx.fillStyle = '#E6E1D6';
  ctx.fill();
  fillRR(ctx, -46, -30, 92, 34, 0, hexA(C.sky, 0.9));
  ctx.restore();

  // egg carton
  ctx.save();
  ctx.translate(150, -196);
  fillRR(ctx, -70, -34, 140, 68, 8, '#D8CDB6');
  ctx.fillStyle = '#C4B79C';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(-44 + i * 44, 0, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // orange
  ctx.beginPath();
  ctx.arc(-190, -186, 30, 0, Math.PI * 2);
  ctx.fillStyle = '#F0913C';
  ctx.fill();

  // basket body
  const bodyG = linGrad(ctx, -260, -180, 260, 40, [
    [0, '#8A5E36'],
    [0.5, '#6E4826'],
    [1, '#4A2F18'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-240, -176);
  ctx.lineTo(240, -176);
  ctx.lineTo(196, 22);
  ctx.quadraticCurveTo(0, 40, -196, 22);
  ctx.closePath();
  ctx.fillStyle = bodyG;
  ctx.fill();

  // weave
  ctx.strokeStyle = 'rgba(255,214,160,0.16)';
  ctx.lineWidth = 4;
  for (let i = 1; i < 7; i++) {
    const y = -176 + i * 30;
    ctx.beginPath();
    ctx.moveTo(-232 + i * 6, y);
    ctx.lineTo(232 - i * 6, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 52, -176);
    ctx.lineTo(i * 44, 30);
    ctx.stroke();
  }

  // handle
  ctx.strokeStyle = '#6E4826';
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -180, 150, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,214,160,0.22)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, -184, 156, Math.PI * 1.16, Math.PI * 1.84);
  ctx.stroke();

  // rim
  fillRR(ctx, -250, -196, 500, 34, 16, '#7B5430');
  fillRR(ctx, -250, -196, 500, 12, 6, 'rgba(255,214,160,0.25)');
  ctx.restore();
}

/** Hanging paper price tag with a hole and string. */
export function priceTag(ctx, o = {}) {
  const { w = 620, h = 400, alpha = 1, rot = 0, front, stringTop = -520 } = o;
  ctx.save();
  ctx.rotate(rot);
  ctx.globalAlpha *= alpha;
  ctx.restore();
  return { w, h };
}

/** Top-down tanker seen on a map. Bow points to +x. */
export function tankerTop(ctx, o = {}) {
  const { len = 460, wid = 120, alpha = 1 } = o;
  const L = len;
  const D = wid;
  ctx.save();
  ctx.globalAlpha *= alpha;

  // hull
  const g = linGrad(ctx, 0, -D / 2, 0, D / 2, [
    [0, '#4A3A33'],
    [0.4, '#2A2020'],
    [1, '#14100F'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-L / 2 + 14, -D / 2);
  ctx.lineTo(L / 2 - D * 0.85, -D / 2);
  ctx.quadraticCurveTo(L / 2, -D * 0.36, L / 2, 0);
  ctx.quadraticCurveTo(L / 2, D * 0.36, L / 2 - D * 0.85, D / 2);
  ctx.lineTo(-L / 2 + 14, D / 2);
  ctx.quadraticCurveTo(-L / 2, D / 2, -L / 2, D / 2 - 14);
  ctx.lineTo(-L / 2, -D / 2 + 14);
  ctx.quadraticCurveTo(-L / 2, -D / 2, -L / 2 + 14, -D / 2);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  // deck
  const dg = linGrad(ctx, 0, -D * 0.34, 0, D * 0.34, [
    [0, '#7E3A2E'],
    [0.5, '#5E2B24'],
    [1, '#3A1A17'],
  ]);
  rr(ctx, -L / 2 + 26, -D * 0.33, L - 70 - D * 0.4, D * 0.66, 10);
  ctx.fillStyle = dg;
  ctx.fill();

  // tank hatches
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const x = -L / 2 + 70 + i * ((L - 150) / 5);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, 0, 15, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,190,140,0.12)';
    ctx.beginPath();
    ctx.ellipse(x - 3, -3, 11, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // superstructure (stern)
  fillRR(ctx, -L / 2 + 6, -D * 0.4, L * 0.16, D * 0.8, 6, '#D8D2C4');
  fillRR(ctx, -L / 2 + 16, -D * 0.3, L * 0.1, D * 0.6, 4, '#B8B2A4');
  ctx.save();
  ctx.fillStyle = 'rgba(40,30,26,0.75)';
  ctx.fillRect(-L / 2 + 22, -D * 0.22, L * 0.06, 6);
  ctx.fillRect(-L / 2 + 22, D * 0.08, L * 0.06, 6);
  ctx.restore();

  // deck rail highlight
  ctx.strokeStyle = 'rgba(255,210,160,0.35)';
  ctx.lineWidth = 2;
  rr(ctx, -L / 2 + 26, -D * 0.33, L - 70 - D * 0.4, D * 0.66, 10);
  ctx.stroke();

  // nav lights
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  [[L / 2 - 20, 0, '#7DFFB0'], [L / 2 - 60, -D * 0.3, '#FF8F7A']].forEach(([lx, ly, col]) => {
    const rg = radGrad(ctx, lx, ly, 0, 30, [
      [0, col],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(lx, ly, 30, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
  ctx.restore();
}
