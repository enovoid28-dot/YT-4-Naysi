// d2 — SINAR KOSMIK: cosmic rays make C-14 in the atmosphere, into the food chain.
import {
  DO, desk, motion, withSheet, drawPaper, typed, ruleI, leaderI, caseTab, tooth,
  P, cue, cueEnd, eo, e3, clamp, lerp, rng, F, W, H, TAU, curveInk,
} from './_dossier.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

/** leaf glyph with veins */
function leaf(ctx, x, y, s, p, { ink = DO.green } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * eo(clamp(p)), s * eo(clamp(p)));
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(63,122,90,0.10)';
  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.bezierCurveTo(-90, 30, -70, -70, 0, -100);
  ctx.bezierCurveTo(70, -70, 90, 30, 0, 90);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 84);
  ctx.lineTo(0, -92);
  ctx.stroke();
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 60 - i * 34);
    ctx.lineTo(-38 + i * 4, 30 - i * 34);
    ctx.moveTo(0, 60 - i * 34);
    ctx.lineTo(38 - i * 4, 30 - i * 34);
    ctx.stroke();
  }
  ctx.restore();
}

function arrow(ctx, x0, y0, x1, y1, p, { color = DO.ink2, lw = 4 } = {}) {
  if (p <= 0.001) return;
  const q = eo(clamp(p));
  const x = lerp(x0, x1, q);
  const y = lerp(y0, y1, q);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x, y);
  ctx.stroke();
  if (q > 0.96) {
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(a - 0.42) * 22, y - Math.sin(a - 0.42) * 22);
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(a + 0.42) * 22, y - Math.sin(a + 0.42) * 22);
    ctx.stroke();
  }
  ctx.restore();
}

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd2', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-B', P(t, 0.08, 0.35));
    typed(ctx, 'SINAR KOSMIK', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'PRODUKSI KARBON-14 · ATMOSFER ATAS', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // atmosphere arc (clipped to the sheet)
    const ap = P(t, 0.5, 0.8);
    ctx.save();
    ctx.beginPath();
    ctx.rect(SX + 4, SY + 4, SW - 8, SH - 8);
    ctx.clip();
    ctx.strokeStyle = DO.blue;
    ctx.lineWidth = 5;
    ctx.setLineDash([16, 10]);
    ctx.beginPath();
    ctx.arc(SX + SW / 2, SY + 1750, 1330, Math.PI * 1.22, Math.PI * 1.22 + Math.PI * 0.56 * eo(ap));
    ctx.stroke();
    ctx.restore();
    typed(ctx, 'ATMOSFER', SX + SW - 130, SY + 430, { size: 26, font: F.mono6, color: DO.blue, track: 4, align: 'right', p: ap });

    // cosmic ray streaks
    const r = rng(31);
    for (let i = 0; i < 6; i++) {
      const x0 = SX + 140 + i * 60 + r() * 40;
      const y0 = SY + 300 + r() * 60;
      const x1 = x0 + 260 + r() * 120;
      const y1 = y0 + 300 + r() * 90;
      curveInk(ctx, [[x0, y0], [(x0 + x1) / 2 + 10, (y0 + y1) / 2], [x1, y1]], P(t, 0.7 + i * 0.14, 0.5), { color: DO.verm, lw: 4, dot: 5 });
    }
    typed(ctx, 'SINAR KOSMIK', SX + 170, SY + 350, { size: 30, font: F.mono6, color: DO.verm, track: 3, p: P(t, cue(scene, 'kosmik'), 0.5) });

    // the reaction, typed like a lab note
    typed(ctx, 'N-14  +  NEUTRON  →  C-14', SX + SW / 2, SY + 760, { size: 44, font: F.mono6, color: DO.ink, track: 3, align: 'center', p: P(t, cue(scene, 'karbon'), 0.6) });

    // chain: leaf -> food -> you
    const cl = cue(scene, 'tumbuhan');
    leaf(ctx, SX + 300, SY + 1030, 1.05, P(t, cl, 0.6));
    typed(ctx, 'TUMBUHAN', SX + 300, SY + 1180, { size: 28, font: F.mono6, color: DO.ink2, track: 3, align: 'center', p: P(t, cl + 0.3, 0.5) });
    arrow(ctx, SX + 430, SY + 1030, SX + 560, SY + 1030, P(t, cl + 0.5, 0.5));
    const cr = cue(scene, 'rantai');
    typed(ctx, 'RANTAI MAKANAN', SX + 640, SY + 990, { size: 28, font: F.mono6, color: DO.ink2, track: 3, p: P(t, cr, 0.5) });
    tooth(ctx, SX + 760, SY + 1120, 0.72, { p: P(t, cr + 0.2, 0.6), ep: P(t, cue(scene, 'tubuhmu'), 0.8) });
    typed(ctx, 'TUBUHMU', SX + 760, SY + 1330, { size: 28, font: F.mono6, color: DO.verm, track: 3, align: 'center', p: P(t, cue(scene, 'tubuhmu'), 0.5) });
    arrow(ctx, SX + 300, SY + 900, SX + 300, SY + 940, P(t, cl - 0.1, 0.4), { color: DO.blue });
    leaderI(ctx, SX + SW / 2, SY + 800, SX + 330, SY + 930, P(t, cl - 0.2, 0.5), { color: DO.blue, elbow: [SX + SW / 2 - 160, SY + 860] });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 02/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
