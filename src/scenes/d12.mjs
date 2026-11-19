// d12 — KALENDER RAHASIA: synthesis — one calendar written into tooth, canvas, cells.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, leaderI, caseTab, tooth,
  cellGlyph, stamp, P, cue, eo, e3, clamp, rng, F, W, H, TAU, curveInk,
} from './_dossier.mjs';
import { hit } from '../engine/look.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

/** a month-grid calendar in ink; days tick on */
function calendar(ctx, x, y, w, h, p, t, { ink = DO.ink } = {}) {
  if (p <= 0.001) return;
  const q = eo(clamp(p));
  ctx.save();
  ctx.globalAlpha *= q;
  ctx.translate(x, y);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, w, h);
  ctx.lineWidth = 2;
  const cols = 7, rows = 5;
  const cw = w / cols, ch = (h - 60) / rows;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.lineTo(w, 60);
  ctx.stroke();
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cw, 60);
    ctx.lineTo(i * cw, h);
    ctx.stroke();
  }
  for (let j = 1; j < rows; j++) {
    ctx.beginPath();
    ctx.moveTo(0, 60 + j * ch);
    ctx.lineTo(w, 60 + j * ch);
    ctx.stroke();
  }
  // days fill in like a count
  const n = Math.round(35 * clamp((p - 0.3) / 0.7));
  const r = rng(913);
  for (let i = 0; i < n; i++) {
    const cxi = i % cols;
    const cyi = Math.floor(i / cols);
    const marked = r() > 0.62;
    ctx.fillStyle = marked ? DO.verm : 'rgba(36,30,21,0.5)';
    ctx.beginPath();
    ctx.arc(cxi * cw + cw / 2, 60 + cyi * ch + ch / 2, marked ? 9 : 4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** tiny framed canvas glyph */
function miniCanvas(ctx, x, y, s, p) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#8A6B3F';
  ctx.fillRect(-70, -86, 140, 172);
  ctx.fillStyle = '#CBB894';
  ctx.fillRect(-56, -72, 112, 144);
  ctx.fillStyle = '#8C7A5B';
  ctx.beginPath();
  ctx.moveTo(-56, -20);
  ctx.lineTo(10, -72);
  ctx.lineTo(56, -6);
  ctx.lineTo(-10, 72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6E6146';
  ctx.beginPath();
  ctx.moveTo(-56, 30);
  ctx.lineTo(0, -10);
  ctx.lineTo(56, 40);
  ctx.lineTo(56, 72);
  ctx.lineTo(-56, 72);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd12', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-L', P(t, 0.08, 0.35));
    typed(ctx, 'KALENDER RAHASIA', SX + 110, SY + 158, { size: 76, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'SINTESIS · BOMB PULSE FORENSIK 1945 – KINI', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // the calendar at the centre
    calendar(ctx, SX + 420, SY + 620, 600, 460, P(t, cue(scene, 'kalender'), 1.6), t);
    typed(ctx, '1945 – KINI', SX + 720, SY + 590, { size: 32, font: F.mono6, color: DO.ink, track: 4, align: 'center', p: P(t, cue(scene, 'kalender') + 0.4, 0.5) });

    // three witnesses feeding it
    const w1 = P(t, cue(scene, 'gigi'), 0.6);
    tooth(ctx, SX + 240, SY + 560, 0.62, { p: w1, ep: w1 });
    leaderI(ctx, SX + 300, SY + 620, SX + 420, SY + 700, w1, { elbow: [SX + 360, SY + 620] });
    typed(ctx, 'GIGI', SX + 240, SY + 760, { size: 28, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: w1 });
    const w2 = P(t, cue(scene, 'kanvas'), 0.6);
    miniCanvas(ctx, SX + 240, SY + 1000, 0.9, w2);
    leaderI(ctx, SX + 310, SY + 1000, SX + 420, SY + 940, w2, { elbow: [SX + 370, SY + 1000] });
    typed(ctx, 'KANVAS', SX + 240, SY + 1120, { size: 28, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: w2 });
    const w3 = P(t, cue(scene, 'sel'), 0.6);
    cellGlyph(ctx, SX + 1180, SY + 700, 84, { p: w3, kind: 'heart', t, acc: DO.verm });
    leaderI(ctx, SX + 1100, SY + 720, SX + 1020, SY + 760, w3, { elbow: [SX + 1060, SY + 720] });
    typed(ctx, 'SEL TUBUH', SX + 1180, SY + 830, { size: 28, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: w3 });

    // the payoff line + stamp
    typed(ctx, 'SAINS MEMBACA JAM ITU,', SX + SW / 2, SY + 1240, { size: 34, font: F.mono6, color: DO.ink, track: 3, align: 'center', p: P(t, cue(scene, 'membaca'), 0.6) });
    typed(ctx, 'MENANGKAP PEMALSU YANG KIRA DIRINYA AMAN', SX + SW / 2, SY + 1290, { size: 34, font: F.mono6, color: DO.verm, track: 3, align: 'center', p: P(t, cue(scene, 'menangkap'), 0.7) });
    stamp(ctx, 'TERSINGKAP', SX + 900, SY + 1420, { p: P(t, cue(scene, 'aman') + 0.2, 0.45), rot: -0.1, size: 64 });
    hit(t, cue(scene, 'menangkap'), 0.5, 0.3);
    hand(ctx, 'ledakan dulu, kalender sekarang', SX + 180, SY + 1392, { size: 42, color: DO.blue, p: P(t, cue(scene, 'ledakan'), 0.7) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 12/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
