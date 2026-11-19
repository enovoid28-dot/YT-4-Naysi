// d8 — TERKUNCI: enamel locks at childhood; bone remodels all life long.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, leaderI, caseTab, tooth,
  P, cue, eo, e3, clamp, lerp, F, W, H, TAU,
} from './_dossier.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

/** circular remodelling arrows around a bone section */
function remodel(ctx, x, y, r, p, t, { ink = DO.blue } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  for (let i = 0; i < 2; i++) {
    const a0 = t * 0.5 + i * Math.PI;
    ctx.beginPath();
    ctx.arc(x, y, r, a0, a0 + Math.PI * 0.72);
    ctx.stroke();
    const ae = a0 + Math.PI * 0.72;
    const hx = x + Math.cos(ae) * r;
    const hy = y + Math.sin(ae) * r;
    const ta = ae + Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx - Math.cos(ta - 0.5) * 20, hy - Math.sin(ta - 0.5) * 20);
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx - Math.cos(ta + 0.5) * 20, hy - Math.sin(ta + 0.5) * 20);
    ctx.stroke();
  }
  // bone cross-section: concentric osteons
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = DO.ink2;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.2 * i, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

/** padlock */
function lock(ctx, x, y, s, p, { ink = DO.verm } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, -34, 30, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = 'rgba(192,57,43,0.12)';
  ctx.beginPath();
  ctx.rect(-44, -34, 88, 74);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, TAU);
  ctx.fill();
  ctx.fillRect(-4, 0, 8, 24);
  ctx.restore();
}

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd8', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-H', P(t, 0.08, 0.35));
    typed(ctx, 'TERKUNCI SELAMANYA', SX + 110, SY + 158, { size: 76, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'ENAMEL vs TULANG · SIAPA YANG MENGINGAT?', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // sectioned molar with three labelled layers
    const ep = P(t, cue(scene, 'terkunci'), 0.9);
    tooth(ctx, SX + 420, SY + 800, 1.7, { p: P(t, 0.3, 0.8), ep });
    leaderI(ctx, SX + 300, SY + 560, SX + 170, SY + 470, P(t, 1.1, 0.5), { elbow: [SX + 220, SY + 560] });
    typed(ctx, 'ENAMEL', SX + 168, SY + 452, { size: 32, font: F.mono6, color: DO.verm, track: 3, align: 'right', p: P(t, 1.2, 0.5) });
    leaderI(ctx, SX + 470, SY + 760, SX + 700, SY + 660, P(t, 1.4, 0.5), { elbow: [SX + 640, SY + 760] });
    typed(ctx, 'DENTIN', SX + 710, SY + 648, { size: 32, font: F.mono6, color: DO.ink2, track: 3, p: P(t, 1.5, 0.5) });
    leaderI(ctx, SX + 430, SY + 830, SX + 700, SY + 880, P(t, 1.7, 0.5), { elbow: [SX + 640, SY + 830] });
    typed(ctx, 'PULPA', SX + 710, SY + 892, { size: 32, font: F.mono6, color: DO.ink2, track: 3, p: P(t, 1.8, 0.5) });
    typed(ctx, 'TERBENTUK SAAT KECIL,', SX + 710, SY + 500, { size: 28, font: F.mono6, color: DO.ink, track: 2, p: P(t, cue(scene, 'kecil'), 0.5) });
    typed(ctx, 'TAK PERNAH DIGANTI LAGI', SX + 710, SY + 540, { size: 28, font: F.mono6, color: DO.verm, track: 2, p: P(t, cue(scene, 'selamanya'), 0.5) });

    // bone remodelling vs the lock
    const rm = P(t, cue(scene, 'tulang'), 0.7);
    remodel(ctx, SX + 330, SY + 1300, 108, rm, t);
    typed(ctx, 'TULANG: DIBONGKAR-PASANG', SX + 330, SY + 1460, { size: 28, font: F.mono6, color: DO.blue, track: 3, align: 'center', p: P(t, cue(scene, 'tulang') + 0.3, 0.5) });
    lock(ctx, SX + 860, SY + 1290, 1.05, P(t, cue(scene, 'terkunci'), 0.5));
    typed(ctx, 'ENAMEL: TERKUNCI', SX + 860, SY + 1460, { size: 28, font: F.mono6, color: DO.verm, track: 3, align: 'center', p: P(t, cue(scene, 'terkunci') + 0.3, 0.5) });
    hand(ctx, 'sepanjang hidup…', SX + 520, SY + 1230, { size: 44, color: DO.blue, p: P(t, cue(scene, 'hidup'), 0.7) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 08/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
