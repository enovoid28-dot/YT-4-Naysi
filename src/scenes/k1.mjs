import { W, H, C, M, txt, hexA, fillRR, linGrad, radGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { nightRoom, glowSpot, applyGrain, P } from './_ep5.mjs';

/* contact shadow so every object sits on its shelf instead of floating */
function seat(ctx, cx, y, w, a = 0.5) {
  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(1, 0.26);
  const g = radGrad(ctx, 0, 0, 2, w * 0.62, [
    [0, `rgba(0,0,0,${a})`], [1, 'rgba(0,0,0,0)'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.62, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function rim(ctx, x, y, w, h, r = 4, a = 0.5) {
  ctx.save();
  ctx.strokeStyle = `rgba(230,248,255,${a})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r);
  else ctx.rect(x + 1, y + 1, w - 2, h - 2);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------- props ---------------------------------- */

function tetra(ctx, x, y, w, h, o = {}) {
  const { body = '#EFE9DC', cap = '#3E7FA0', band = '#C8452F', a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  seat(ctx, x + w / 2, y + h + 6, w * 0.9, 0.45);
  // gable top
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h * 0.24);
  ctx.lineTo(x + w * 0.5, y);
  ctx.lineTo(x + w, y + h * 0.24);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fillStyle = body;
  ctx.fill();
  // side shade
  ctx.save();
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, x, 0, x + w, 0, [
    [0, 'rgba(0,0,0,0.22)'], [0.28, 'rgba(255,255,255,0.12)'], [1, 'rgba(0,0,0,0.30)'],
  ]);
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = band;
  ctx.fillRect(x, y + h * 0.52, w, h * 0.14);
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, 'rgba(0,0,0,0.28)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.18)']]);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  fillRR(ctx, x + w * 0.62, y + h * 0.06, w * 0.2, h * 0.1, 3, cap);
  ctx.restore();
}

function bottle(ctx, x, y, w, h, o = {}) {
  const { glass = '#CFE3EE', liquid = '#7FB4D8', cap = '#8A5E22', a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  seat(ctx, x + w / 2, y + h + 4, w, 0.42);
  fillRR(ctx, x, y + h * 0.16, w, h * 0.84, w * 0.22, glass);
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y + h * 0.16, w, h * 0.84, w * 0.22);
  else ctx.rect(x, y + h * 0.16, w, h * 0.84);
  ctx.clip();
  ctx.fillStyle = liquid;
  ctx.fillRect(x, y + h * 0.38, w, h * 0.62);
  ctx.fillStyle = 'rgba(255,255,255,0.40)';
  ctx.fillRect(x + w * 0.13, y + h * 0.22, w * 0.09, h * 0.7);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.fillRect(x + w * 0.78, y + h * 0.2, w * 0.2, h * 0.74);
  ctx.restore();
  fillRR(ctx, x + w * 0.34, y + h * 0.06, w * 0.32, h * 0.14, 2, glass);
  fillRR(ctx, x + w * 0.28, y, w * 0.44, h * 0.085, 3, cap);
  ctx.restore();
}

function tub(ctx, x, y, w, h, o = {}) {
  const { body = '#D9CDB6', lid = '#3D4A52', a = 1, label = true } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  seat(ctx, x + w / 2, y + h + 5, w, 0.5);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.06, y + h * 0.18);
  ctx.lineTo(x + w * 0.94, y + h * 0.18);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = body;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, x, 0, x + w, 0, [
    [0, 'rgba(0,0,0,0.25)'], [0.3, 'rgba(255,255,255,0.16)'], [1, 'rgba(0,0,0,0.28)'],
  ]);
  ctx.fillRect(x, y, w, h);
  if (label) {
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.fillRect(x + w * 0.14, y + h * 0.42, w * 0.72, h * 0.24);
    ctx.fillStyle = 'rgba(40,34,26,0.55)';
    ctx.fillRect(x + w * 0.2, y + h * 0.47, w * 0.44, h * 0.035);
    ctx.fillRect(x + w * 0.2, y + h * 0.53, w * 0.32, h * 0.03);
  }
  ctx.restore();
  fillRR(ctx, x - w * 0.03, y, w * 1.06, h * 0.22, 5, lid);
  rim(ctx, x - w * 0.03, y, w * 1.06, h * 0.22, 5, 0.25);
  ctx.restore();
}

function jar(ctx, x, y, w, h, o = {}) {
  const { content = '#7A1F22', glass = '#C9D9E0', a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  seat(ctx, x + w / 2, y + h + 4, w, 0.45);
  fillRR(ctx, x, y + h * 0.14, w, h * 0.86, w * 0.14, glass);
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y + h * 0.14, w, h * 0.86, w * 0.14);
  else ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = content;
  ctx.fillRect(x, y + h * 0.3, w, h * 0.7);
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.fillRect(x + w * 0.12, y + h * 0.2, w * 0.1, h * 0.74);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + w * 0.82, y + h * 0.2, w * 0.18, h * 0.74);
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(x, y + h * 0.14, w, h * 0.1);
  ctx.restore();
  fillRR(ctx, x - w * 0.04, y, w * 1.08, h * 0.17, 4, '#9AA7AC');
  rim(ctx, x - w * 0.04, y, w * 1.08, h * 0.17, 4, 0.3);
  ctx.restore();
}

function can(ctx, x, y, w, h, o = {}) {
  const { body = '#C24A32', a = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= a;
  seat(ctx, x + w / 2, y + h + 4, w, 0.4);
  fillRR(ctx, x, y, w, h, w * 0.14, '#B9C6CC');
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, w * 0.14);
  else ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = body;
  ctx.fillRect(x, y + h * 0.12, w, h * 0.76);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(x + w * 0.14, y + h * 0.1, w * 0.1, h * 0.8);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(x + w * 0.78, y, w * 0.22, h);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(x, y + h * 0.46, w, h * 0.05);
  ctx.restore();
  ctx.restore();
}

function chocolate(ctx, x, y, w, h, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  seat(ctx, x + w / 2, y + h + 5, w, 0.55);
  ctx.fillStyle = linGrad(ctx, x, y, x + w, y + h, [[0, '#4C3020'], [1, '#241410']]);
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      fillRR(ctx, x + 10 + i * ((w - 20) / 3), y + 10 + j * ((h - 20) / 2), (w - 20) / 3 - 8, (h - 20) / 2 - 8, 4, '#57381F');
      fillRR(ctx, x + 11 + i * ((w - 20) / 3), y + 11 + j * ((h - 20) / 2), ((w - 20) / 3 - 8) * 0.6, 5, 2, 'rgba(255,220,170,0.25)');
    }
  }
  ctx.restore();
}

function lemon(ctx, cx, cy, r, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  seat(ctx, cx, cy + r + 4, r * 2.2, 0.5);
  const g = radGrad(ctx, cx - r * 0.3, cy - r * 0.35, r * 0.1, r * 1.5, [
    [0, '#F2DE83'], [0.6, '#D8BC4C'], [1, '#9E842A'],
  ]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.9, 0.12, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.34, cy - r * 0.38, r * 0.22, r * 0.14, 0.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function bag(ctx, x, y, w, h, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  seat(ctx, x + w / 2, y + h + 4, w, 0.45);
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.2);
  ctx.quadraticCurveTo(x - w * 0.06, y + h, x + w * 0.2, y + h);
  ctx.lineTo(x + w * 0.8, y + h);
  ctx.quadraticCurveTo(x + w * 1.06, y + h, x + w, y + h * 0.2);
  ctx.lineTo(x + w * 0.86, y);
  ctx.lineTo(x + w * 0.14, y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(226,238,244,0.30)';
  ctx.fill();
  ctx.fillStyle = 'rgba(90,124,72,0.55)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 0.62, w * 0.34, h * 0.3, 0, 0, TAU);
  ctx.fill();
  rim(ctx, x, y + h * 0.2, w, h * 0.8, 10, 0.16);
  ctx.restore();
}

// 01 — KULKAS. The door is open, the light is cold, nobody is hungry.
export default {
  draw(ctx, t) {
    nightRoom(ctx, { tableY: 1500, warm: 0.03, cold: 0.14, coldX: 0.5 });

    const open = EASE.outCubic(clamp((t - 0.15) / 1.0));
    const flicker = 1 + Math.sin(t * 7.3) * 0.010 + Math.sin(t * 2.1) * 0.016;

    const fx = 78;
    const fy = 196;
    const fw = W - 2 * fx;
    const fh = 1300;

    ctx.save();
    ctx.globalAlpha = open;
    ctx.translate(0, lerp(30, 0, open));

    // cavity shell
    fillRR(ctx, fx - 22, fy - 22, fw + 44, fh + 44, 16, '#0A0F13');
    fillRR(ctx, fx, fy, fw, fh, 10, '#0E151A');

    // interior, lit from the top tube
    const bg = linGrad(ctx, 0, fy, 0, fy + fh, [
      [0, '#C4DCE4'], [0.12, '#9CB8C2'], [0.46, '#5F7C88'], [0.8, '#2E4450'], [1, '#1A2429'],
    ]);
    fillRR(ctx, fx + 16, fy + 16, fw - 32, fh - 32, 6, bg);

    // cavity sides: the box has depth, not one flat plane
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(fx + 16, fy + 16, fw - 32, fh - 32, 6);
    else ctx.rect(fx + 16, fy + 16, fw - 32, fh - 32);
    ctx.clip();
    ctx.fillStyle = linGrad(ctx, fx, 0, fx + 132, 0, [
      [0, 'rgba(4,9,12,0.62)'], [1, 'rgba(4,9,12,0)'],
    ]);
    ctx.fillRect(fx + 16, fy + 16, 132, fh);
    ctx.fillStyle = linGrad(ctx, W - fx - 132, 0, W - fx, 0, [
      [0, 'rgba(4,9,12,0)'], [1, 'rgba(4,9,12,0.62)'],
    ]);
    ctx.fillRect(W - fx - 148, fy + 16, 132, fh);
    // ceiling shade
    ctx.fillStyle = linGrad(ctx, 0, fy + 16, 0, fy + 150, [
      [0, 'rgba(4,9,12,0.35)'], [1, 'rgba(4,9,12,0)'],
    ]);
    ctx.fillRect(fx + 16, fy + 16, fw - 32, 150);
    // frost bloom
    let fs2 = 3;
    const rnd = () => {
      fs2 = (fs2 * 1103515245 + 12345) >>> 0;
      return fs2 / 4294967296;
    };
    for (let i = 0; i < 260; i++) {
      const px = fx + 30 + rnd() * (fw - 60);
      const py = fy + 40 + rnd() * (fh - 120);
      const r = 1 + rnd() * 3.4;
      ctx.fillStyle = `rgba(240,252,255,${0.03 + rnd() * 0.07})`;
      ctx.beginPath();
      ctx.ellipse(px, py, r, r * 0.7, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // light tube at the top
    ctx.save();
    ctx.globalAlpha = open * (0.7 * flicker);
    glowSpot(ctx, W / 2, fy + 40, 560, '#DCEEFF', 0.34);
    ctx.fillStyle = 'rgba(235,248,255,0.85)';
    ctx.fillRect(fx + 90, fy + 34, fw - 180, 7);
    ctx.restore();

    // back-panel ribs
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(fx + 40, fy + 120 + i * 240, fw - 80, 2);
    }

    const shelfY = [fy + 470, fy + 830];
    shelfY.forEach((sy) => {
      // glass shelf with a lit front edge
      ctx.fillStyle = linGrad(ctx, 0, sy, 0, sy + 34, [
        [0, 'rgba(226,244,255,0.62)'], [0.4, 'rgba(180,212,232,0.34)'], [1, 'rgba(30,48,58,0.30)'],
      ]);
      ctx.fillRect(fx + 26, sy, fw - 52, 30);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(fx + 26, sy, fw - 52, 3);
      // shadow cast under the shelf
      ctx.fillStyle = linGrad(ctx, 0, sy + 30, 0, sy + 90, [
        [0, 'rgba(0,0,0,0.34)'], [1, 'rgba(0,0,0,0)'],
      ]);
      ctx.fillRect(fx + 26, sy + 30, fw - 52, 60);
    });

    /* shelf 1 — fewer, bigger objects, none of them on the same baseline - */
    const A = open;
    ctx.save();
    ctx.translate(fx + 96, fy + 470);
    ctx.rotate(-0.12);
    tetra(ctx, -46, -286, 168, 274, { a: A, body: '#E8E2D2', band: '#C8452F', cap: '#2F6E8E' });
    ctx.restore();
    tub(ctx, fx + 196, fy + 262, 300, 208, { a: A, body: '#D3C6A9', lid: '#2C3A42' });
    jar(ctx, fx + 528, fy + 344, 148, 126, { a: A, content: '#6E1B1E' });
    bottle(ctx, fx + 706, fy + 150, 124, 320, { a: A, liquid: '#D9822B', cap: '#C0412C' });
    ctx.save();
    ctx.translate(fx + 962, fy + 190);
    ctx.rotate(0.09);
    chocolate(ctx, -90, 0, 206, 178, A);
    ctx.restore();

    /* shelf 2 ------------------------------------------------------------ */
    tub(ctx, fx + 92, fy + 640, 306, 190, { a: A, body: '#CEC1A4', lid: '#7A3B2A' });
    jar(ctx, fx + 424, fy + 706, 150, 124, { a: A, content: '#5C7A3A' });
    can(ctx, fx + 606, fy + 672, 116, 162, { a: A, body: '#2F6E7A' });
    bottle(ctx, fx + 768, fy + 626, 120, 206, { a: A, liquid: '#E4D6A8', cap: '#2F6E7A' });
    tetra(ctx, fx + 918, fy + 700, 148, 146, { a: A, body: '#E6DFCE', band: '#3E6E4E', cap: '#3E6E4E' });

    /* bottom ------------------------------------------------------------- */
    lemon(ctx, fx + 210, fy + 1186, 72, A);
    lemon(ctx, fx + 316, fy + 1206, 58, A);
    tub(ctx, fx + 400, fy + 1078, 270, 118, { a: A, body: '#D9CCB4', lid: '#2C3A42', label: false });
    bottle(ctx, fx + 724, fy + 1056, 108, 176, { a: A, liquid: '#A8D0E6', cap: '#8A5E22' });
    jar(ctx, fx + 866, fy + 1070, 148, 140, { a: A, content: '#7A4A1E' });

    // inner frame edge
    ctx.strokeStyle = 'rgba(206,232,248,0.28)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(fx + 16, fy + 16, fw - 32, fh - 32, 6);
    else ctx.rect(fx + 16, fy + 16, fw - 32, fh - 32);
    ctx.stroke();
    ctx.restore();

    /* ---------------------------------------------------------- counter -- */
    const deskY = 1462;
    ctx.fillStyle = linGrad(ctx, 0, deskY, 0, H, [[0, '#3E2A22'], [0.26, '#241713'], [1, '#0A0706']]);
    ctx.fillRect(0, deskY, W, H - deskY);
    // cold spill on the counter
    ctx.fillStyle = linGrad(ctx, 0, deskY, 0, deskY + 330, [
      [0, 'rgba(185,225,255,0.16)'], [1, 'rgba(185,225,255,0)'],
    ]);
    ctx.fillRect(0, deskY, W, 330);
    ctx.fillStyle = 'rgba(190,225,250,0.30)';
    ctx.fillRect(0, deskY, W, 3);

    // the open door, held in the foreground on the right
    ctx.save();
    ctx.fillStyle = linGrad(ctx, W - 250, 0, W, 0, [
      [0, 'rgba(10,7,5,0)'], [0.35, 'rgba(12,9,7,0.92)'], [1, 'rgba(6,4,3,1)'],
    ]);
    ctx.beginPath();
    ctx.moveTo(W - 250, 1320);
    ctx.lineTo(W - 150, 212);
    ctx.lineTo(W, 168);
    ctx.lineTo(W, 1420);
    ctx.closePath();
    ctx.fill();
    // cold rim on its inner edge
    ctx.strokeStyle = 'rgba(190,225,250,0.34)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W - 250, 1320);
    ctx.lineTo(W - 150, 212);
    ctx.stroke();
    ctx.restore();

    // empty plate
    ctx.save();
    const pg = radGrad(ctx, 268, deskY + 150, 10, 170, [
      [0, '#E8E0D0'], [1, '#B4A997'],
    ]);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(268, deskY + 168, 158, 40, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(268, deskY + 150, 156, 44, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#C9BFAD';
    ctx.beginPath();
    ctx.ellipse(268, deskY + 146, 112, 28, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,246,255,0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(268, deskY + 146, 112, 28, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    // fork, left of the plate
    ctx.strokeStyle = 'rgba(206,216,222,0.85)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(392, deskY + 96);
    ctx.lineTo(470, deskY + 176);
    ctx.stroke();
    ctx.lineWidth = 4;
    [0, 1, 2].forEach((i) => {
      ctx.beginPath();
      ctx.moveTo(384 + i * 9, deskY + 76 + i * 4);
      ctx.lineTo(400 + i * 9, deskY + 92 + i * 4);
      ctx.stroke();
    });
    ctx.restore();

    // grade: cold shadows, a soft lens vignette
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = radGrad(ctx, W * 0.5, H * 0.52, H * 0.32, H * 0.95, [
      [0, 'rgba(255,255,255,1)'], [0.62, 'rgba(214,226,240,1)'], [1, 'rgba(120,140,168,1)'],
    ]);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    applyGrain(ctx, 0.07);
  },
};
