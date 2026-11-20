// h11 GRADE MEDIS — modern HUD: glass panel line chart of bacterial load
// falling over days under medical-grade honey dressing.
import { camPar, grain, MD, tomb, dust, vign, glassPanel, heading, chip, label, sparkle,
  cue, P, eo, keys, frameOn, clamp, lerp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1100, 1.05], [scene.dur - 3.5, 720, 1070, 1.0], [scene.dur, 720, 1050, 1.04],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    tomb(ctx, t, { hex: 0.04 });
    ctx.restore();
    ctx.save();
    frameOn(ctx, cam);
    glassPanel(ctx, 110, 600, W - 220, 1000, {});
    label(ctx, 'BEBAK BAKTERI PADA LUKA', 180, 690, { size: 30, color: MD.amber, track: 5 });
    label(ctx, 'PERSEN · HARI PERAWATAN', 180, 732, { size: 24, color: 'rgba(243,239,228,0.45)', track: 4 });
    const x0 = 210, x1 = W - 210, y0 = 820, y1 = 1440;
    // axes
    ctx.strokeStyle = 'rgba(243,239,228,0.4)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.setLineDash([4, 10]);
    ctx.strokeStyle = 'rgba(243,239,228,0.14)';
    for (let i = 1; i <= 3; i++) {
      const gy = y1 - ((y1 - y0) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x0, gy);
      ctx.lineTo(x1, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.font = '500 24px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(243,239,228,0.5)';
    ctx.textAlign = 'center';
    for (let d = 0; d <= 7; d++) {
      const x = x0 + ((x1 - x0 - 40) * d) / 7;
      ctx.fillText(`H${d}`, x, y1 + 44);
    }
    // falling curve
    const pts = [[0, 0.92], [1, 0.8], [2, 0.62], [3, 0.44], [4, 0.3], [5, 0.19], [6, 0.11], [7, 0.06]];
    const pp = eo(P(t, 1.2, 3.4));
    const nShow = 1 + pp * (pts.length - 1);
    ctx.save();
    ctx.strokeStyle = MD.faience;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(79,192,180,0.6)';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const f = clamp(nShow - i, 0, 1);
      if (f <= 0) break;
      const [d, v] = pts[i];
      const [d2, v2] = pts[Math.min(i + 1, pts.length - 1)];
      const x = x0 + ((x1 - x0 - 40) * (d + (d2 - d) * (i < pts.length - 1 ? 0 : 0))) / 7;
      const y = y1 - (y1 - y0) * v;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      void f; void v2;
    }
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.globalAlpha = 0.5 * pp;
    const ag = ctx.createLinearGradient(0, y0, 0, y1);
    ag.addColorStop(0, 'rgba(79,192,180,0.30)');
    ag.addColorStop(1, 'rgba(79,192,180,0)');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.moveTo(x0, y1);
    pts.forEach(([d, v], i) => {
      if (i + 1 > nShow) return;
      ctx.lineTo(x0 + ((x1 - x0 - 40) * d) / 7, y1 - (y1 - y0) * v);
    });
    ctx.lineTo(x0 + ((x1 - x0 - 40) * Math.min(nShow - 1, 7)) / 7, y1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    pts.forEach(([d, v], i) => {
      if (i + 1 > nShow) return;
      const x = x0 + ((x1 - x0 - 40) * d) / 7;
      const y = y1 - (y1 - y0) * v;
      ctx.fillStyle = MD.bone;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, TAU);
      ctx.fill();
      if (i === Math.floor(nShow) - 1) {
        ctx.strokeStyle = `rgba(79,192,180,${0.5 + 0.3 * Math.sin(t * 3.2)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 14 + 3 * Math.sin(t * 3.2), 0, TAU);
        ctx.stroke();
      }
    });
    ctx.restore();
    const endQ = eo(P(t, 4.6, 0.8));
    if (endQ > 0) {
      ctx.save();
      ctx.globalAlpha = endQ;
      ctx.fillStyle = MD.faience;
      ctx.font = '800 52px Poppins, sans-serif';
      ctx.textAlign = 'right';
      ctx.shadowColor = 'rgba(79,192,180,0.7)';
      ctx.shadowBlur = 24;
      ctx.fillText('−94%', x1, y0 + 40);
      ctx.shadowColor = 'transparent';
      ctx.font = '600 26px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(243,239,228,0.7)';
      ctx.fillText('BEBAK BAKTERI', x1, y0 + 84);
      ctx.restore();
    }
    chip(ctx, 'MADU GRADE MEDIS', 420, 560, { p: P(t, 0.8, 0.6), col: 'rgba(79,192,180,0.9)', text: '#DFF7F3' });
    heading(ctx, 'GRADE', '', 120, 400, { amber: 'MEDIS', p: P(t, 0.35, 1.0), size: 110, sub: 'BUKTI DUNIA MODERN' });
    sparkle(ctx, W - 320, 700, 14, 0.4 + 0.3 * Math.sin(t * 2.0));
    ctx.restore();
    ctx.save();
    frameOn(ctx, cam);
    dust(ctx, t, 53, 22);
    ctx.restore();
    vign(ctx, 0.5);
    grain(ctx, t, 0.05);
  },
};
