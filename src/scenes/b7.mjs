// b7 — RASA KEENAM: cats lost sweet; humans chase oleogustus.
import {
  BK, desk, motion, withSheet, drawPage, greek, catGlyph, penX, penCircle, penArrow,
  margin, typed, P, cue, eo, clamp, F, W, H, TAU,
} from './_buku.mjs';
import { ambient, smudge } from './_buku.mjs';

const SX = 140, SY = 240, SW = 1160, SH = 1560;

/** wrapped candy */
function candy(ctx, x, y, s, p, { ink = BK.print } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(44,74,102,0.14)';
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-46, -14);
  ctx.lineTo(-86, -34);
  ctx.lineTo(-80, 22);
  ctx.closePath();
  ctx.moveTo(46, -14);
  ctx.lineTo(86, -34);
  ctx.lineTo(80, 22);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/** fat droplet */
function droplet(ctx, x, y, s, p, { ink = BK.amber } = {}) {
  if (p <= 0.001) return;
  ctx.save();
  ctx.globalAlpha *= eo(clamp(p));
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.fillStyle = 'rgba(184,121,31,0.16)';
  ctx.beginPath();
  ctx.moveTo(0, -90);
  ctx.bezierCurveTo(52, -20, 66, 20, 44, 58);
  ctx.bezierCurveTo(22, 92, -22, 92, -44, 58);
  ctx.bezierCurveTo(-66, 20, -52, -20, 0, -90);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b7', SX, SY, SW, SH, { folio: '134', chapter: 'BAB VII · INDERA PERASA', footnote: "¹ plos genet. 1:e3 · chem. senses 40:507" });
    typed(ctx, 'PENGECAP DI LUAR MANUSIA', SX + 100, SY + 220, { size: 30, font: F.mono6, color: BK.print, track: 4, p: P(t, 0.3, 0.5) });
    greek(ctx, SX + 100, SY + 260, SW - 200, 2, P(t, 0.4, 0.6));

    // cat: no sweet receptor
    const ct = cue(scene, 'manis');
    catGlyph(ctx, SX + 320, SY + 640, 1.15, P(t, 0.4, 0.7));
    candy(ctx, SX + 560, SY + 560, 1.0, P(t, ct - 0.3, 0.5));
    smudge(ctx, SX + 480, SY + 480, 170, 160, P(t, ct - 0.25, 0.5));
    penX(ctx, SX + 560, SY + 560, 66, P(t, ct, 0.45));
    typed(ctx, 'RESEPTOR MANIS: PSEUDOGEN', SX + 170, SY + 1010, { size: 28, font: F.mono6, color: BK.pen, track: 2, p: P(t, ct + 0.4, 0.5) });
    typed(ctx, 'LI ET AL. 2005 · PLoS GENETICS', SX + 170, SY + 1052, { size: 24, font: F.mono6, color: BK.ink2, track: 2, p: P(t, ct + 0.7, 0.5) });
    margin(ctx, 'gen-nya rusak', SX + 400, SY + 1120, { p: P(t, ct + 1.0, 0.6) });

    // oleogustus
    const ol = cue(scene, 'keenam');
    droplet(ctx, SX + 830, SY + 640, 1.1, P(t, ol, 0.6));
    penCircle(ctx, SX + 830, SY + 620, 120, 140, P(t, ol + 0.4, 0.6));
    typed(ctx, 'OLEOGUSTUS', SX + 830, SY + 830, { size: 40, font: F.mono6, color: BK.amber, track: 4, align: 'center', p: P(t, ol + 0.6, 0.5) });
    typed(ctx, 'RASA LEMAK · NEFA', SX + 830, SY + 876, { size: 26, font: F.mono6, color: BK.ink2, track: 3, align: 'center', p: P(t, cue(scene, 'lemak'), 0.5) });
    typed(ctx, 'DIUSULKAN 2015 · PURDUE', SX + 830, SY + 916, { size: 24, font: F.mono6, color: BK.ink2, track: 2, align: 'center', p: P(t, cue(scene, 'lima'), 0.5) });
    penArrow(ctx, SX + 560, SY + 1240, SX + 780, SY + 800, P(t, ol + 0.9, 0.5), { bow: 0.25 });
    margin(ctx, 'rasa keenam?', SX + 560, SY + 1252, { p: P(t, ol + 1.2, 0.7) });
    greek(ctx, SX + 100, SY + 1340, SW - 200, 3, P(t, 1.8, 0.8));
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); ambient(ctx, t, 7); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
  ambient(ctx, t, 7);
}
