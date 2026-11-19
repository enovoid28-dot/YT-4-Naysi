// d6 — KANVAS PALSU: a "1913" cubist canvas whose cotton was harvested in 1959.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, leaderI, stamp, caseTab,
  cubistCanvas, redact, P, cue, eo, e3, clamp, rng, F, W, H, TAU,
} from './_dossier.mjs';
import { hit } from '../engine/look.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

/** magnifier with canvas fibres inside */
function lens(ctx, x, y, r, p, t) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = 'rgba(255,253,246,0.9)';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(120,100,64,0.8)';
  ctx.lineWidth = 3;
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x - r, y + i * 16 + Math.sin(t + i) * 2);
    ctx.bezierCurveTo(x - r / 2, y + i * 16 - 6, x + r / 2, y + i * 16 + 6, x + r, y + i * 16);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(192,57,43,0.85)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y + r * 0.35);
  ctx.bezierCurveTo(x - r * 0.2, y + r * 0.1, x + r * 0.2, y + r * 0.55, x + r * 0.6, y + r * 0.3);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = DO.ink;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.72, y + r * 0.72);
  ctx.lineTo(x + r * 1.25, y + r * 1.25);
  ctx.stroke();
  ctx.restore();
}

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd6', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-F', P(t, 0.08, 0.35));
    typed(ctx, 'KANVAS PALSU', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, 'AMS · SERAT KANVAS · KOLEKSI VENISIA', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // the painting
    cubistCanvas(ctx, SX + 150, SY + 380, 520, 640, { p: P(t, 0.35, 0.8), seed: 7 });
    typed(ctx, '“KONTRAS BENTUK”', SX + 150, SY + 1080, { size: 30, font: F.mono6, color: DO.ink2, track: 2, p: P(t, 0.9, 0.5) });
    typed(ctx, 'KUBISME · ATRIBUSI F. LÉGER', SX + 150, SY + 1120, { size: 26, font: F.mono6, color: DO.ink3, track: 2, p: P(t, 1.0, 0.5) });

    // the claim, then the strike-through
    const kl = cue(scene, 'katanya');
    typed(ctx, 'KLAIM DIBUAT TAHUN', SX + 760, SY + 470, { size: 30, font: F.mono6, color: DO.ink2, track: 3, p: P(t, kl - 0.2, 0.5) });
    typed(ctx, '1913', SX + 760, SY + 580, { size: 120, font: F.num6, color: DO.ink, track: 2, p: P(t, kl, 0.5) });
    redact(ctx, SX + 752, SY + 492, 300, 104, P(t, cue(scene, 'kanvasnya'), 0.5));
    stamp(ctx, 'PALSU', SX + 950, SY + 560, { p: P(t, cue(scene, 'kanvasnya') + 0.35, 0.4), rot: -0.16, size: 78 });
    hit(t, cue(scene, 'kanvasnya') + 0.35, 0.5, 0.3);

    // the fibre evidence
    const fb = cue(scene, 'kapasnya');
    leaderI(ctx, SX + 640, SY + 940, SX + 780, SY + 1010, P(t, fb - 0.3, 0.5), { elbow: [SX + 700, SY + 940] });
    lens(ctx, SX + 880, SY + 1080, 92, P(t, fb - 0.2, 0.6), t);
    typed(ctx, 'SERAT KAPAS:', SX + 760, SY + 1250, { size: 30, font: F.mono6, color: DO.ink2, track: 3, p: P(t, fb, 0.5) });
    typed(ctx, 'PANEN 1959', SX + 760, SY + 1310, { size: 56, font: F.num6, color: DO.verm, track: 2, p: P(t, fb + 0.3, 0.5) });
    hand(ctx, 'katanya 1913…', SX + 190, SY + 1220, { size: 46, color: DO.blue, p: P(t, kl + 0.4, 0.6), rot: -0.04 });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 06/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
