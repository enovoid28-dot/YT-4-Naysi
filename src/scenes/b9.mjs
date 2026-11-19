// b9 — KOMENTAR: the question, the bubble, the brand.
import {
  BK, desk, motion, withSheet, drawPage, typed, margin, P, cue, eo, clamp, F, W, H, TAU,
} from './_buku.mjs';

const SX = 140, SY = 240, SW = 1160, SH = 1560;

function bubble(ctx, x, y, w, h, p, t, { ink = BK.print } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.translate(x, y);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.fillStyle = 'rgba(255,253,246,0.6)';
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(w - 28, 0);
  ctx.quadraticCurveTo(w, 0, w, 28);
  ctx.lineTo(w, h - 28);
  ctx.quadraticCurveTo(w, h, w - 28, h);
  ctx.lineTo(120, h);
  ctx.lineTo(60, h + 60);
  ctx.lineTo(80, h);
  ctx.lineTo(28, h);
  ctx.quadraticCurveTo(0, h, 0, h - 28);
  ctx.lineTo(0, 28);
  ctx.quadraticCurveTo(0, 0, 28, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const ph = (t * 2.2 + i * 0.55) % 1.6;
    const dy = -Math.sin(clamp(ph / 1.6) * Math.PI) * 14;
    ctx.fillStyle = i === 2 ? BK.pen : BK.print2;
    ctx.beginPath();
    ctx.arc(w / 2 - 60 + i * 60, h / 2 + dy, 12, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b9', SX, SY, SW, SH, { folio: '136', chapter: 'BAB VII · INDERA PERASA' });
    typed(ctx, 'KAMU TIM MANA?', SX + SW / 2, SY + 420, { size: 76, font: F.serif, color: BK.ink, track: 1, align: 'center', p: P(t, cue(scene, 'manis'), 0.6) });
    typed(ctx, 'TIM MANIS · TIM PEDAS · TIM UMAMI', SX + SW / 2, SY + 500, { size: 34, font: F.mono6, color: BK.pen, track: 4, align: 'center', p: P(t, cue(scene, 'umami'), 0.6) });
    bubble(ctx, SX + 300, SY + 620, 560, 300, P(t, cue(scene, 'komentar'), 0.6), t);
    typed(ctx, 'TULIS DI KOMENTAR', SX + SW / 2, SY + 1060, { size: 38, font: F.mono6, color: BK.ink, track: 6, align: 'center', p: P(t, cue(scene, 'komentar'), 0.6) });
    margin(ctx, 'kita baca semuanya…', SX + 300, SY + 1160, { p: P(t, cue(scene, 'komentar') + 0.5, 0.7) });
    const bp = P(t, cue(scene, 'naysi'), 0.6);
    ctx.save();
    ctx.globalAlpha *= bp;
    ctx.fillStyle = BK.pen;
    ctx.fillRect(SX + SW / 2 - 200, SY + 1280, 22, 22);
    ctx.restore();
    typed(ctx, 'IKUTI NAYSI', SX + SW / 2 - 166, SY + 1300, { size: 36, font: F.head, color: BK.ink, track: 6, p: bp });
    typed(ctx, 'FAKTA SEHARI-HARI BERIKUTNYA', SX + SW / 2, SY + 1356, { size: 28, font: F.mono6, color: BK.ink2, track: 4, align: 'center', p: P(t, cue(scene, 'fakta'), 0.6) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
