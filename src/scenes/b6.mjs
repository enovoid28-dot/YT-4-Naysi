// b6 — UMAMI: the fifth taste the map never had a slot for.
import {
  BK, desk, motion, withSheet, drawPage, greek, yearRule, penCircle, penArrow, margin,
  typed, P, cue, eo, clamp, F, W, H, TAU,
} from './_buku.mjs';

const SX = 140, SY = 240, SW = 1160, SH = 1560;

/** kombu ribbon */
function kombu(ctx, x, y, s, p, t) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = BK.print;
  ctx.lineWidth = 5;
  ctx.fillStyle = 'rgba(44,74,102,0.16)';
  ctx.beginPath();
  ctx.moveTo(-160, 40);
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    ctx.lineTo(-160 + u * 320, 40 - Math.sin(u * 6 + t * 0.4) * 26 - u * 60);
  }
  for (let i = 8; i >= 0; i--) {
    const u = i / 8;
    ctx.lineTo(-160 + u * 320, 74 - Math.sin(u * 6 + t * 0.4) * 26 - u * 60);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b6', SX, SY, SW, SH, { folio: '133', chapter: 'BAB VII · INDERA PERASA' });
    typed(ctx, 'RASA YANG TERTINGGAL OLEH PETA', SX + 100, SY + 220, { size: 30, font: F.mono6, color: BK.print, track: 4, p: P(t, 0.3, 0.5) });
    greek(ctx, SX + 100, SY + 260, SW - 200, 2, P(t, 0.4, 0.6));

    kombu(ctx, SX + 330, SY + 560, 1.2, P(t, 0.5, 0.7), t);
    typed(ctx, 'KOMBU · KALDU DASHI', SX + 330, SY + 700, { size: 26, font: F.mono6, color: BK.ink2, track: 3, align: 'center', p: P(t, 0.9, 0.4) });

    // timeline 1908 -> 2002
    const y0 = SY + 900;
    yearRule(ctx, SX + 180, SX + 1000, y0, P(t, cue(scene, 'umami'), 0.9));
    typed(ctx, '1908', SX + 180, y0 + 52, { size: 34, font: F.num6, color: BK.print, track: 2, p: P(t, cue(scene, 'delapan'), 0.5) });
    typed(ctx, 'IKEDA · GLUTAMAT', SX + 180, y0 + 96, { size: 26, font: F.mono6, color: BK.ink2, track: 2, p: P(t, cue(scene, 'delapan') + 0.3, 0.5) });
    typed(ctx, '±2002', SX + 1000, y0 + 52, { size: 34, font: F.num6, color: BK.print, track: 2, align: 'right', p: P(t, cue(scene, 'dua'), 0.5) });
    typed(ctx, 'RESEPTOR T1R1+T1R3', SX + 1000, y0 + 96, { size: 26, font: F.mono6, color: BK.ink2, track: 2, align: 'right', p: P(t, cue(scene, 'dua') + 0.3, 0.5) });
    ctx.save();
    ctx.globalAlpha *= P(t, cue(scene, 'dua'), 0.5);
    ctx.fillStyle = BK.pen;
    ctx.beginPath();
    ctx.arc(SX + 1000, y0, 11, 0, TAU);
    ctx.fill();
    ctx.restore();

    // the fifth slot, stamped in
    const um = cue(scene, 'umami');
    typed(ctx, 'UMAMI', SX + 620, SY + 1220, { size: 96, font: F.serif, color: BK.print, track: 6, align: 'center', p: P(t, um, 0.6) });
    penCircle(ctx, SX + 620, SY + 1186, 240, 80, P(t, um + 0.4, 0.6));
    typed(ctx, 'RASA KE-5 · GURIH', SX + 620, SY + 1300, { size: 30, font: F.mono6, color: BK.pen, track: 4, align: 'center', p: P(t, um + 0.7, 0.5) });
    margin(ctx, 'peta tak punya slotnya!', SX + 700, SY + 1400, { p: P(t, um + 1.1, 0.7) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
