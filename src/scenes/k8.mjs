import { W, H, C, M, txt, hexA, fillRR, strokeRR, linGrad, radGrad, measure } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';
import { glowSpot, alarmClock, darkKicker, applyGrain, P } from './_ep6.mjs';

// 08 — SENIN. Two alarms, forty-eight hours apart, 2 hours 42 minutes apart in
// clock time. That distance is the thing worth shrinking.
const CY = 782;
const R = 214;

export default {
  draw(ctx, t) {
    // pre-dawn wall
    ctx.fillStyle = linGrad(ctx, 0, 0, W * 0.55, H, [
      [0, '#120D0A'], [0.42, '#1B1411'], [1, '#080605'],
    ]);
    ctx.fillRect(0, 0, W, H);
    glowSpot(ctx, W * 0.3, 620, 900, P.amber, 0.14);

    darkKicker(ctx, 'DUA PAGI, SATU TUBUH', { y: 292 });

    const cA = EASE.outCubic(clamp((t - 0.2) / 0.7));
    const dA = EASE.outCubic(clamp((t - 0.55) / 0.7));

    alarmClock(ctx, 412, CY, R, { hh: 9, mm: 12, a: cA, lit: 0.05 });
    alarmClock(ctx, 1028, CY, R, { hh: 6, mm: 30, a: cA, lit: 0.05 });

    // readings
    if (dA > 0.01) {
      ctx.save();
      ctx.globalAlpha = dA;
      txt(ctx, 'SABTU', 412, CY + R + 74, {
        size: 24, font: F.mono6, color: hexA('#F2E7D3', 0.45), align: 'center', track: 7,
      });
      txt(ctx, '09.12', 412, CY + R + 142, {
        size: 62, font: F.num6, color: '#F2E7D3', align: 'center', track: 1,
      });
      txt(ctx, 'SENIN', 1028, CY + R + 74, {
        size: 24, font: F.mono6, color: hexA('#F2E7D3', 0.45), align: 'center', track: 7,
      });
      txt(ctx, '06.30', 1028, CY + R + 142, {
        size: 62, font: F.num6, color: '#F2E7D3', align: 'center', track: 1,
      });
      ctx.restore();
    }

    // the distance between the two mornings
    const mA = EASE.outCubic(clamp((t - 3.4) / 0.7));
    if (mA > 0.01) {
      ctx.save();
      ctx.globalAlpha = mA;
      const y = CY - R - 96;
      ctx.strokeStyle = hexA('#F2E7D3', 0.26);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(412, y);
      ctx.lineTo(1028, y);
      ctx.stroke();
      [[412, 1], [1028, -1]].forEach(([x, d]) => {
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x + d * 14, y);
        ctx.lineTo(x, y + 10);
        ctx.stroke();
      });
      const tw = measure(ctx, '2 JAM 42 MENIT', 30, F.mono6, 4);
      fillRR(ctx, W / 2 - (tw + 48) / 2, y - 30, tw + 48, 60, 30, '#1B1411');
      strokeRR(ctx, W / 2 - (tw + 48) / 2, y - 30, tw + 48, 60, 30, hexA(P.red, 0.5), 2);
      txt(ctx, '2 JAM 42 MENIT', W / 2, y + 10, {
        size: 30, font: F.mono6, color: hexA(P.red, 0.95), align: 'center', track: 4,
      });
      ctx.restore();
    }

    // the close
    const eA = EASE.outCubic(clamp((t - 6.4) / 0.8));
    if (eA > 0.01) {
      ctx.save();
      ctx.globalAlpha = eA;
      ctx.translate(0, (1 - eA) * 28);
      ctx.fillStyle = hexA(P.amber, 0.6);
      ctx.fillRect(W / 2 - 34, 1204, 68, 4);
      txt(ctx, 'KECILKAN JARAKNYA', W / 2, 1292, {
        size: 64, font: F.display, color: '#F2E7D3', align: 'center', track: -1,
      });
      txt(ctx, 'SABTU BOLEH TIDUR LEBIH LAMA.', W / 2, 1366, {
        size: 26, font: F.mono6, color: hexA('#F2E7D3', 0.42), align: 'center', track: 4,
      });
      txt(ctx, 'TAPI JANGAN LEBIH DARI SATU JAM.', W / 2, 1410, {
        size: 26, font: F.mono6, color: hexA('#F2E7D3', 0.42), align: 'center', track: 4,
      });
      ctx.restore();
    }

    // end mark
    const zA = clamp((t - 8.4) / 0.7);
    if (zA > 0.01) {
      ctx.save();
      ctx.globalAlpha = zA;
      txt(ctx, 'NAYSI', W / 2, 1700, {
        size: 46, font: F.head, color: hexA('#F2E7D3', 0.9), align: 'center', track: 14,
      });
      txt(ctx, 'TIDUR · OTAK', W / 2, 1746, {
        size: 20, font: F.mono6, color: hexA('#F2E7D3', 0.35), align: 'center', track: 8,
      });
      ctx.restore();
    }

    void C; void M; void H; void radGrad; void lerp; void TAU;
    applyGrain(ctx, 0.06);
  },
};
