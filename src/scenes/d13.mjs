// d13 — KOMENTAR: outro sheet — the question, the comment bubble, the brand.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, caseTab, stamp,
  P, cue, eo, e3, clamp, F, W, H, TAU,
} from './_dossier.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

/** ink speech bubble with typing dots */
function bubble(ctx, x, y, w, h, p, t, { ink = DO.ink } = {}) {
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
    ctx.fillStyle = i === 2 ? DO.verm : DO.ink2;
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
    drawPaper(ctx, 'd13', SX, SY, SW, SH, { holes: 0 });
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-M', P(t, 0.08, 0.35));
    typed(ctx, 'GILIRANMU', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'NAYSI · FORENSIK BOMB PULSE · EP30', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    typed(ctx, 'FAKTA MANA YANG PALING', SX + SW / 2, SY + 480, { size: 62, font: F.serif, color: DO.ink, track: 1, align: 'center', p: P(t, cue(scene, 'mana'), 0.6) });
    typed(ctx, 'MEMBUATMU TERPERANGAH?', SX + SW / 2, SY + 560, { size: 62, font: F.serif, color: DO.verm, track: 1, align: 'center', p: P(t, cue(scene, 'terperangah'), 0.6) });

    bubble(ctx, SX + 380, SY + 700, 680, 340, P(t, cue(scene, 'tulis'), 0.6), t);
    typed(ctx, 'TULIS DI KOMENTAR', SX + SW / 2, SY + 1160, { size: 40, font: F.mono6, color: DO.ink, track: 6, align: 'center', p: P(t, cue(scene, 'tulis'), 0.6) });
    hand(ctx, 'kita baca semuanya…', SX + 250, SY + 1250, { size: 46, color: DO.blue, p: P(t, cue(scene, 'komentar') + 0.3, 0.7) });

    // brand row
    const bp = P(t, cue(scene, 'naysi'), 0.6);
    ctx.save();
    ctx.globalAlpha *= bp;
    ctx.fillStyle = DO.verm;
    ctx.fillRect(SX + SW / 2 - 190, SY + 1330, 22, 22);
    ctx.restore();
    typed(ctx, 'IKUTI NAYSI', SX + SW / 2 - 156, SY + 1350, { size: 36, font: F.head, color: DO.ink, track: 6, p: bp });
    typed(ctx, 'SAINS SEHARI-HARI BERIKUTNYA', SX + SW / 2, SY + 1404, { size: 28, font: F.mono6, color: DO.ink2, track: 4, align: 'center', p: P(t, cue(scene, 'berikutnya'), 0.6) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 13/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
