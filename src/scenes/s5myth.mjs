import {
  W, H, C, M, txt, tracking, hexA, fillRR, rr, strokeRR, linGrad, radGrad, measure,
  labelChip, glow,
} from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE, TAU } from '../engine/anim.mjs';

const CX = 720;
const CY = 916;
const R = 276;

/** Tapered clock hand: wide at the pin, narrow at the tip. */
function hand(ctx, ang, len, wBase, wTip, color, o = {}) {
  const { glowBlur = 0, shadowAlpha = 0.45 } = o;
  ctx.save();
  ctx.rotate(ang);

  const draw = () => {
    ctx.beginPath();
    ctx.moveTo(-wBase / 2, 18);
    ctx.lineTo(-wTip / 2, -len + wTip);
    ctx.quadraticCurveTo(0, -len - wTip * 0.9, wTip / 2, -len + wTip);
    ctx.lineTo(wBase / 2, 18);
    ctx.quadraticCurveTo(0, 26, -wBase / 2, 18);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  // shadow
  if (shadowAlpha > 0) {
    ctx.save();
    ctx.translate(6, 8);
    ctx.globalAlpha = shadowAlpha;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(-wBase / 2, 18);
    ctx.lineTo(-wTip / 2, -len + wTip);
    ctx.quadraticCurveTo(0, -len - wTip * 0.9, wTip / 2, -len + wTip);
    ctx.lineTo(wBase / 2, 18);
    ctx.quadraticCurveTo(0, 26, -wBase / 2, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.shadowColor = glowBlur ? color : 'transparent';
  ctx.shadowBlur = glowBlur;
  draw();
  // specular along the hand
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.moveTo(-wBase * 0.22, 10);
  ctx.lineTo(-wTip * 0.18, -len + wTip * 1.6);
  ctx.lineTo(-wTip * 0.02, -len + wTip * 1.6);
  ctx.lineTo(-wBase * 0.06, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

export default {
  draw(ctx, t, scene, meta) {
    const g = radGrad(ctx, CX, CY - 100, 0, 1050, [
      [0, '#0C1119'],
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
      tracking(ctx, 'MINGGU', CX, 466, {
        size: 24, font: F.num6, track: 7, align: 'center', color: hexA(C.bone, 0.5),
      });
      txt(ctx, '12 JAM', CX, 574, {
        size: 88, font: F.num, color: hexA(C.bone, 0.92), align: 'center', track: -2,
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
      ctx.moveTo(l, 541);
      ctx.lineTo(lerp(l, rr2, p1), 541);
      ctx.stroke();
      if (kA > 0.55) {
        const p2 = EASE.outCubic(clamp((kA - 0.55) / 0.6));
        ctx.beginPath();
        ctx.moveTo(l, 524);
        ctx.lineTo(lerp(l, rr2, p2), 558);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* -------------------------------------------------------------- dial -- */
    const dA = clamp((t - 0.35) / 0.7);
    ctx.save();
    ctx.globalAlpha = dA;

    // ambient shadow under the dial
    ctx.save();
    ctx.globalAlpha = 0.75;
    const sh = radGrad(ctx, CX, CY + 26, R * 0.92, R * 1.22, [
      [0, 'rgba(0,0,0,0.55)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    ctx.fillStyle = sh;
    ctx.fillRect(CX - R * 1.3, CY - R * 1.3, R * 2.6, R * 2.6);
    ctx.restore();

    // brushed metal bezel
    const bez = ctx.createConicGradient
      ? ctx.createConicGradient(-Math.PI * 0.75, CX, CY)
      : null;
    let bezFill;
    if (bez) {
      bez.addColorStop(0, '#4A525F');
      bez.addColorStop(0.12, '#20262F');
      bez.addColorStop(0.28, '#3A424E');
      bez.addColorStop(0.5, '#151A22');
      bez.addColorStop(0.72, '#3E4753');
      bez.addColorStop(0.88, '#1A1F27');
      bez.addColorStop(1, '#4A525F');
      bezFill = bez;
    } else {
      bezFill = linGrad(ctx, CX - R, CY - R, CX + R, CY + R, [
        [0, '#414855'],
        [0.5, '#171C24'],
        [1, '#333A45'],
      ]);
    }
    ctx.beginPath();
    ctx.arc(CX, CY, R + 16, 0, TAU);
    ctx.fillStyle = bezFill;
    ctx.fill();

    // face
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, TAU);
    ctx.fillStyle = radGrad(ctx, CX - R * 0.3, CY - R * 0.34, 0, R * 1.25, [
      [0, '#1A202B'],
      [0.55, '#11161F'],
      [1, '#080B11'],
    ]);
    ctx.fill();
    // inner bezel shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, TAU);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(CX, CY, R - 6, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, R - 16, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // minute track
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU;
      const major = i % 5 === 0;
      const r0 = R - (major ? 26 : 14);
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0);
      ctx.lineTo(CX + Math.cos(a) * (R - 8), CY + Math.sin(a) * (R - 8));
      ctx.strokeStyle = hexA(C.bone, major ? 0.45 : 0.16);
      ctx.lineWidth = major ? 3.5 : 1.6;
      ctx.stroke();
    }

    // applied hour indices
    for (let h = 0; h < 12; h++) {
      const a = (h / 12) * TAU - Math.PI / 2;
      const big = h % 3 === 0;
      ctx.save();
      ctx.translate(CX + Math.cos(a) * (R - 52), CY + Math.sin(a) * (R - 52));
      ctx.rotate(a + Math.PI / 2);
      const w = big ? 16 : 10;
      const hh = big ? 40 : 26;
      fillRR(ctx, -w / 2, -hh / 2, w, hh, 4, hexA(C.bone, big ? 0.85 : 0.4));
      ctx.fillStyle = hexA(C.bone, big ? 0.2 : 0.12);
      ctx.fillRect(-w / 2, -hh / 2, w, 3);
      ctx.restore();
    }

    // social schedule band (08:00 -> 17:00)
    const toAng = (h) => (h / 12) * TAU - Math.PI / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R - 40, toAng(8), toAng(17));
    ctx.strokeStyle = hexA(C.bone, 0.30);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // internal clock track
    ctx.beginPath();
    ctx.arc(CX, CY, R - 84, 0, TAU);
    ctx.strokeStyle = hexA(C.amber, 0.13);
    ctx.lineWidth = 9;
    ctx.stroke();

    // glass sheen
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R - 2, 0, TAU);
    ctx.clip();
    const gl = linGrad(ctx, CX - R, CY - R, CX + R * 0.4, CY + R * 0.6, [
      [0, 'rgba(180,205,245,0.10)'],
      [0.35, 'rgba(180,205,245,0.02)'],
      [1, 'rgba(255,255,255,0)'],
    ]);
    ctx.fillStyle = gl;
    ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
    // soft specular sweep
    ctx.globalAlpha = 0.06;
    const sw = linGrad(ctx, CX - R, CY + R * 0.4, CX + R * 0.3, CY - R, [
      [0, 'rgba(220,233,255,0)'],
      [0.45, 'rgba(220,233,255,0.9)'],
      [1, 'rgba(220,233,255,0)'],
    ]);
    ctx.fillStyle = sw;
    ctx.beginPath();
    ctx.moveTo(CX - R, CY + R * 0.55);
    ctx.lineTo(CX - R, CY + R);
    ctx.lineTo(CX + R, CY - R * 0.1);
    ctx.lineTo(CX + R, CY - R * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();

    /* -------------------------------------------------------------- hands -- */
    ctx.save();
    ctx.globalAlpha = dA;
    const swing = EASE.outQuint(clamp((t - 0.9) / 1.6));
    const hourAng = (TAU / 4) * swing;
    const off = EASE.inOutQuint(clamp((t - 7.2) / 1.6)) * (TAU / 12) * 2;

    ctx.save();
    ctx.translate(CX, CY);
    hand(ctx, 0, R - 120, 12, 5, hexA(C.bone, 0.95), { shadowAlpha: 0.5 });
    hand(ctx, hourAng, R - 154, 17, 8, hexA(C.bone, 0.95), { shadowAlpha: 0.5 });
    ctx.save();
    ctx.globalAlpha *= clamp((t - 7.15) / 0.35);
    hand(ctx, hourAng + off, R - 70, 19, 9, C.amber, { glowBlur: 26, shadowAlpha: 0.45 });
    ctx.restore();
    ctx.restore();

    // gap between the two readings
    if (off > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R - 84, hourAng, hourAng + off);
      ctx.strokeStyle = hexA(C.red, 0.9);
      ctx.lineWidth = 10;
      ctx.setLineDash([11, 11]);
      ctx.lineCap = 'round';
      ctx.shadowColor = hexA(C.red, 0.5);
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.restore();
    }

    // centre cap
    ctx.beginPath();
    ctx.arc(CX, CY, 20, 0, TAU);
    ctx.fillStyle = linGrad(ctx, CX - 12, CY - 12, CX + 12, CY + 12, [
      [0, '#2A313C'],
      [1, '#0B0E14'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, 8, 0, TAU);
    ctx.fillStyle = C.amber;
    ctx.shadowColor = hexA(C.amber, 0.8);
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();

    /* -------------------------------------------------------------- chips -- */
    const cA = clamp((t - 1.1) / 0.4);
    ctx.save();
    ctx.globalAlpha = cA;
    labelChip(ctx, 'JADWAL SOSIAL', M, CY - 208, {
      size: 22, font: F.num6, track: 5, padX: 18, padY: 12, align: 'left',
      dot: C.bone, dotColor: hexA(C.bone, 0.7),
    });
    ctx.restore();
    const cB = clamp((t - 7.3) / 0.4);
    if (cB > 0) {
      ctx.save();
      ctx.globalAlpha = cB;
      labelChip(ctx, 'JAM INTERNAL', W - M, CY + 208, {
        size: 22, font: F.num6, track: 5, padX: 18, padY: 12, align: 'right',
        dot: C.amber, dotColor: C.amber, color: C.amber,
      });
      ctx.restore();
    }

    /* -------------------------------------------------------------- reset -- */
    const rA = clamp((t - 6.0) / 0.4);
    if (rA > 0) {
      ctx.save();
      ctx.translate(1084, 1318);
      ctx.globalAlpha = rA;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0.6, TAU - 1.1);
      ctx.strokeStyle = hexA(C.bone, 0.4);
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
      txt(ctx, '2 JAM', CX, 1368 + dy, {
        size: 124, font: F.num, color: C.red, align: 'center', track: -2,
        glowBlur: 30, glowColor: hexA(C.red, 0.45),
      });
      tracking(ctx, 'SELISIH JAM INTERNAL', CX, 1420 + dy, {
        size: 22, font: F.num6, track: 5, align: 'center', color: hexA(C.bone, 0.55),
      });
      ctx.restore();
    }
  },
};
