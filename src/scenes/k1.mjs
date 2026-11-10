import { W, H, C, M, txt, hexA, fillRR, linGrad } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { dawn, windowLight, lightShaft, phone, kicker, chip, hairline, glowSpot } from './_ep4.mjs';

// 01 — BUNYI. The phone wakes up three times and the morning is spent in the
// gap between awake and asleep.
export default {
  draw(ctx, t, scene, meta) {
    dawn(ctx, { top: '#05070D', mid: '#080E18', bot: '#0B1420', warmX: 0.12, warmA: 0.08 });

    /* ------------------------------------------------------------- room -- */
    windowLight(ctx, 954, 372, 372, 486, EASE.outCubic(clamp((t - 0.15) / 1.1)));
    lightShaft(ctx, { x: 954, y: 440, w: 372, h: 1200, skew: 180, a: 0.10 * clamp((t - 0.4) / 1.4) });
    glowSpot(ctx, 120, 1480, 760, C.amber, 0.10);

    // nightstand
    const deskY = 1600;
    ctx.fillStyle = linGrad(ctx, 0, deskY, 0, H, [[0, '#1A1612'], [0.35, '#100D0B'], [1, '#07060A']]);
    ctx.fillRect(0, deskY, W, H - deskY);
    hairline(ctx, 0, deskY, W, deskY, { color: C.bone, alpha: 0.13, lw: 3 });
    ctx.fillStyle = linGrad(ctx, 0, deskY, W, deskY + 240, [
      [0, 'rgba(150,190,255,0.00)'], [0.3, 'rgba(150,190,255,0.05)'], [1, 'rgba(255,255,255,0)'],
    ]);
    ctx.fillRect(0, deskY, W, 300);

    /* ------------------------------------------------------------ phone -- */
    const presses = [5.6, 9.8, 14.0];
    const snooze = presses.filter((p) => t >= p).length;
    const time = ['06:00', '06:09', '06:18', '06:27'][snooze];
    const press = Math.max(
      0,
      ...presses.map((p) => (t >= p && t < p + 0.9 ? 1 - (t - p) / 0.9 : 0)),
    );
    const pA = EASE.outCubic(clamp((t - 0.1) / 0.9));
    const pw = 466;
    phone(ctx, 320, lerp(690, 646, pA), pw, {
      h: pw * 1.94,
      alpha: pA,
      glow: 0.7,
      time,
      snooze,
      press,
      sub: 'SENIN · 9 NOV',
    });

    /* ------------------------------------------------------------- log --- */
    kicker(ctx, 'ALARM PERTAMA · 06.00');
    const rows = [
      { at: 5.6, label: 'SNOOZE 1', val: '06.09' },
      { at: 9.8, label: 'SNOOZE 2', val: '06.18' },
      { at: 14.0, label: 'SNOOZE 3', val: '06.27' },
    ];
    rows.forEach((r, i) => {
      const a = EASE.outCubic(clamp((t - r.at - 0.05) / 0.5));
      if (a <= 0.01) return;
      const y = 1010 + i * 168;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(lerp(28, 0, a), 0);
      hairline(ctx, 906, y + 58, 906, y - 34, { color: C.amber, alpha: 0.35, lw: 2 });
      ctx.fillStyle = C.amber;
      ctx.beginPath();
      ctx.arc(906, y + 58, 5, 0, TAU);
      ctx.fill();
      txt(ctx, r.label, 942, y - 8, { size: 26, font: F.num6, color: hexA(C.amber, 0.85), track: 4.5 });
      txt(ctx, r.val, 942, y + 62, { size: 62, font: F.num, color: C.bone, track: -1 });
      txt(ctx, '+9 MENIT', 942, y + 112, { size: 25, font: F.num6, color: hexA(C.bone, 0.40), track: 3.5 });
      ctx.restore();
    });

    // bottom note
    const nA = clamp((t - 2.2) / 0.8);
    if (nA > 0.01) {
      ctx.save();
      ctx.globalAlpha = nA * 0.9;
      txt(ctx, 'WAKTU DI KASUR · BUKAN WAKTU TIDUR', 320, 1692, {
        size: 24, font: F.num6, color: hexA(C.bone, 0.42), track: 4,
      });
      ctx.restore();
    }
  },
};
