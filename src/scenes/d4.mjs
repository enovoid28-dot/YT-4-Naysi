// d4 — UJI ATMOSFER: 1945-1980, 500+ atmospheric blasts double the sky's C-14.
import {
  DO, desk, motion, withSheet, drawPaper, typed, hand, ruleI, caseTab, cloudGlyph, stamp,
  P, cue, eo, e3, clamp, lerp, rng, F, W, H, TAU, bake, curveInk,
} from './_dossier.mjs';

const SX = 120, SY = 250, SW = 1200, SH = 1520;

/** 528 blast ticks along the test timeline, baked once */
function ticks() {
  return bake('d30-ticks', 900, 120, (c) => {
    const r = rng(77);
    for (let i = 0; i < 528; i++) {
      const u = Math.pow(i / 528, 0.82); // tests clustered toward the early 60s
      const x = 20 + u * 860;
      const h = 14 + r() * 46 + (i % 29 === 0 ? 34 : 0);
      c.strokeStyle = i % 29 === 0 ? 'rgba(192,57,43,0.9)' : 'rgba(36,30,21,0.55)';
      c.lineWidth = i % 29 === 0 ? 3 : 1.6;
      c.beginPath();
      c.moveTo(x, 100);
      c.lineTo(x + (r() - 0.5) * 3, 100 - h);
      c.stroke();
    }
    c.strokeStyle = 'rgba(36,30,21,0.8)';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(16, 100);
    c.lineTo(884, 100);
    c.stroke();
  });
}

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPaper(ctx, 'd4', SX, SY, SW, SH);
    caseTab(ctx, SX + 90, SY - 26, 'KASUS 30-D', P(t, 0.08, 0.35));
    typed(ctx, 'UJI ATMOSFER', SX + 110, SY + 158, { size: 82, font: F.serif, color: DO.ink, track: 1, p: P(t, 0.22, 0.6) });
    typed(ctx, '1945 – 1980 · LEDAKAN NUKLIR DI UDARA', SX + 112, SY + 210, { size: 28, font: F.mono6, color: DO.ink2, track: 4, p: P(t, 0.5, 0.5) });
    ruleI(ctx, SX + 110, SX + SW - 110, SY + 244, P(t, 0.6, 0.45), { color: DO.ink3 });

    // blast timeline: ticks reveal left to right with the VO
    const tp = P(t, cue(scene, 'selama'), 4.2, e3);
    const cv = ticks();
    ctx.save();
    ctx.globalAlpha *= clamp(tp * 3);
    ctx.beginPath();
    ctx.rect(SX + 150, SY + 420, 900 * tp, 130);
    ctx.clip();
    ctx.drawImage(cv, SX + 150, SY + 420);
    ctx.restore();
    typed(ctx, '1945', SX + 170, SY + 600, { size: 30, font: F.mono6, color: DO.ink, track: 2, p: P(t, 0.6, 0.4) });
    typed(ctx, '1963', SX + 150 + 900 * 0.52, SY + 600, { size: 30, font: F.mono6, color: DO.verm, track: 2, align: 'center', p: P(t, 2.2, 0.4) });
    typed(ctx, '1980', SX + 1030, SY + 600, { size: 30, font: F.mono6, color: DO.ink, track: 2, align: 'right', p: P(t, 4.4, 0.4) });

    // running counter of blasts
    const cp = P(t, cue(scene, 'selama'), 4.2, e3);
    const n = Math.round(528 * cp);
    typed(ctx, `${n}`, SX + SW - 150, SY + 830, { size: 170, font: F.num6, color: DO.verm, track: 0, align: 'right', p: P(t, cue(scene, 'selama'), 0.5) });
    typed(ctx, 'LEDAKAN ATMOSFER', SX + SW - 150, SY + 890, { size: 32, font: F.mono6, color: DO.ink, track: 5, align: 'right', p: P(t, cue(scene, 'selama') + 0.5, 0.5) });

    // clouds popping on the big beats
    cloudGlyph(ctx, SX + 300, SY + 1020, 0.9, P(t, cue(scene, 'lima'), 0.5));
    cloudGlyph(ctx, SX + 560, SY + 1080, 1.25, P(t, cue(scene, 'ratus'), 0.5));
    cloudGlyph(ctx, SX + 860, SY + 1010, 0.7, P(t, cue(scene, 'ratus') + 0.5, 0.5));
    typed(ctx, 'KARBON RADIOAKTIF ×2 DI UDARA', SX + SW / 2, SY + 1240, { size: 36, font: F.mono6, color: DO.ink, track: 3, align: 'center', p: P(t, cue(scene, 'menggandakan'), 0.6) });
    hand(ctx, 'manusia menambahkannya sendiri', SX + 190, SY + 1360, { size: 46, color: DO.blue, p: P(t, cue(scene, 'manusia'), 0.7) });

    typed(ctx, 'NAYSI · FORENSIK — LEMBAR 04/13', SX + 110, SY + SH - 56, { size: 24, font: F.mono6, color: DO.ink3, track: 3, p: P(t, 0.8, 0.5) });
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
}
