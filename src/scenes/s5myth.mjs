import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  labelChip,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';

const CX = 720;
const CY = 910;
const R = 272;

const handStub = null;
const _unusedHand = (ctx, ang, len, w, color, glow = 0) => {
  ctx.save();
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len);
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
  }
  ctx.stroke();
  ctx.restore();
};

export default {
  draw(ctx, t, scene, meta) {
    const g = radGrad(ctx, CX, CY - 60, 0, 1000, [
      [0, '#0C1018'],
      [0.5, '#070910'],
      [1, '#05060A'],
    ]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    /* ---------------------------------------------------------- headline -- */
    const hA = clamp((t - 0.15) / 0.45);
    if (hA > 0) {
      ctx.save();
      ctx.globalAlpha = hA;
      tracking(ctx, 'MINGGU', CX, 470, {
        size: 24, font: F.num6, track: 7, align: 'center', color: hexA(C.bone, 0.5),
      });
      txt(ctx, '12 JAM', CX, 578, {
        size: 88, font: F.num, color: hexA(C.bone, 0.9), align: 'center', track: -2,
      });
      ctx.restore();
    }

    // strike-through on the lie
    const kA = clamp((t - 4.85) / 0.32);
    if (kA > 0) {
      const w = measure(ctx, '12 JAM', 88, F.num, -2);
      const l = CX - w / 2 - 30;
      const rr2 = CX + w / 2 + 30;
      ctx.save();
      ctx.globalAlpha = kA;
      ctx.strokeStyle = C.red;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.shadowColor = hexA(C.red, 0.6);
      ctx.shadowBlur = 18;
      const p1 = EASE.outCubic(clamp(kA * 1.6));
      ctx.beginPath();
      ctx.moveTo(l, 545);
      ctx.lineTo(lerp(l, rr2, p1), 545);
      ctx.stroke();
      if (kA > 0.55) {
        const p2 = EASE.outCubic(clamp((kA - 0.55) / 0.6));
        ctx.beginPath();
        ctx.moveTo(l, 528);
        ctx.lineTo(lerp(l, rr2, p2), 562);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* -------------------------------------------------------------- dial -- */
    const dA = clamp((t - 0.35) / 0.7);
    ctx.save();
    ctx.globalAlpha = dA;

    // face
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, TAU);
    const faceG = radGrad(ctx, CX, CY - 60, 0, R, [
      [0, 'rgba(20,26,38,0.85)'],
      [1, 'rgba(8,10,16,0.9)'],
    ]);
    ctx.fillStyle = faceG;
    ctx.fill();
    ctx.strokeStyle = hexA(C.bone, 0.13);
    ctx.lineWidth = 2;
    ctx.stroke();

    // minute ticks
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU;
      const major = i % 5 === 0;
      const r0 = R - (major ? 22 : 11);
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0);
      ctx.lineTo(CX + Math.cos(a) * (R - 3), CY + Math.sin(a) * (R - 3));
      ctx.strokeStyle = hexA(C.bone, major ? 0.5 : 0.2);
      ctx.lineWidth = major ? 4 : 2;
      ctx.stroke();
    }

    // social schedule band: 08:00 -> 17:00
    const toAng = (h) => (h / 12) * TAU - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(CX, CY, R - 44, toAng(8), toAng(17));
    ctx.strokeStyle = hexA(C.bone, 0.26);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // internal-clock track
    ctx.beginPath();
    ctx.arc(CX, CY, R - 86, 0, TAU);
    ctx.strokeStyle = hexA(C.amber, 0.16);
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();

    // hands
    ctx.save();
    ctx.globalAlpha = dA;
    const swing = EASE.outQuint(clamp((t - 0.9) / 1.6));
    const hourAng = (TAU / 4) * swing; // 03:00
    const off = EASE.inOutQuint(clamp((t - 7.2) / 1.6)) * (TAU / 12) * 2;

    const strokeHand = (ang, len, w, color, glow = 0) => {
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -len);
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
      }
      ctx.stroke();
      ctx.restore();
    };

    // minute hand (12)
    strokeHand(0, R - 118, 9, hexA(C.bone, 0.9));
    // hour hand (3)
    strokeHand(hourAng, R - 150, 13, hexA(C.bone, 0.9));
    // body clock, two hours ahead
    strokeHand(hourAng + off, R - 64, 15, C.amber, 24);

    // gap between the two, on the inner track
    if (off > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R - 86, hourAng, hourAng + off);
      ctx.strokeStyle = hexA(C.red, 0.85);
      ctx.lineWidth = 9;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.restore();
    }

    // centre cap
    ctx.beginPath();
    ctx.arc(CX, CY, 14, 0, TAU);
    ctx.fillStyle = C.bone;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CX, CY, 26, 0, TAU);
    ctx.strokeStyle = hexA(C.bone, 0.2);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    /* ------------------------------------------------------------- chips -- */
    ctx.save();
    ctx.globalAlpha = clamp((t - 1.1) / 0.4);
    labelChip(ctx, 'JADWAL SOSIAL', M, CY - 196, {
      size: 22, font: F.num6, track: 5, padX: 18, padY: 12, align: 'left',
      dot: C.bone, dotColor: hexA(C.bone, 0.7),
    });
    ctx.restore();
    const cB = clamp((t - 7.3) / 0.4);
    if (cB > 0) {
      ctx.save();
      ctx.globalAlpha = cB;
      labelChip(ctx, 'JAM INTERNAL', W - M, CY + 196, {
        size: 22, font: F.num6, track: 5, padX: 18, padY: 12, align: 'right',
        dot: C.amber, dotColor: C.amber, color: C.amber,
      });
      ctx.restore();
    }

    /* ------------------------------------------------------------- reset -- */
    const rA = clamp((t - 6.0) / 0.4);
    if (rA > 0) {
      ctx.save();
      ctx.translate(1080, 1310);
      ctx.globalAlpha = rA;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0.6, TAU - 1.1);
      ctx.strokeStyle = hexA(C.bone, 0.45);
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-24, 24);
      ctx.lineTo(24, -24);
      ctx.strokeStyle = C.red;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();
      tracking(ctx, 'RESET', 4, 66, {
        size: 19, font: F.num6, track: 4, align: 'center', color: hexA(C.bone, 0.5),
      });
      ctx.beginPath();
      ctx.moveTo(-32, 60);
      ctx.lineTo(44, 60);
      ctx.strokeStyle = hexA(C.red, 0.8);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    /* ------------------------------------------------------------ numbers -- */
    const nA = clamp((t - 7.3) / 0.45);
    if (nA > 0) {
      ctx.save();
      ctx.globalAlpha = nA;
      const dy = (1 - EASE.outCubic(nA)) * 24;
      txt(ctx, '2 JAM', CX, 1360 + dy, {
        size: 124, font: F.num, color: C.red, align: 'center', track: -2,
        glowBlur: 30, glowColor: hexA(C.red, 0.45),
      });
      tracking(ctx, 'SELISIH JAM INTERNAL', CX, 1412 + dy, {
        size: 22, font: F.num6, track: 5, align: 'center', color: hexA(C.bone, 0.55),
      });
      ctx.restore();
    }
  },
};
