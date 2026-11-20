// h6 DINDING ASAM — second defense: the pH ribbon 0–14 with honey's acid
// band bracketed at 3–4,5; microbes bounce off the wall of acid.
import { MD, tomb, dust, vign, microbe, heading, chip, label, leader,
  cue, P, eo, keys, frameOn, clamp, lerp, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1120, 1.05], [scene.dur - 3.5, 720, 1080, 1.0], [scene.dur, 720, 1060, 1.04],
    ]);
    tomb(ctx, t, { hex: 0.035 });
    ctx.save();
    frameOn(ctx, cam);
    const x0 = 150, x1 = W - 150, y = 1250, h = 96;
    const ux = (x1 - x0) / 14;
    // pH ribbon
    const p = eo(P(t, 0.7, 2.0));
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y, (x1 - x0) * p, h);
    ctx.clip();
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#C43A2E');
    g.addColorStop(0.22, '#D97A22');
    g.addColorStop(0.42, '#C9B23A');
    g.addColorStop(0.55, '#5FA84E');
    g.addColorStop(0.72, '#3E8FA8');
    g.addColorStop(1, '#5A4E9E');
    ctx.fillStyle = g;
    ctx.fillRect(x0, y, x1 - x0, h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(243,239,228,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x0, y, x1 - x0, h);
    ctx.font = '500 26px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(243,239,228,0.6)';
    ctx.textAlign = 'center';
    for (let v = 0; v <= 14; v += 2) {
      ctx.beginPath();
      ctx.moveTo(x0 + v * ux, y + h);
      ctx.lineTo(x0 + v * ux, y + h + 16);
      ctx.stroke();
      ctx.fillText(String(v), x0 + v * ux, y + h + 52);
    }
    label(ctx, 'SKALA pH', x1, y - 40, { size: 28, color: 'rgba(243,239,228,0.6)', track: 4, align: 'right' });
    // honey band bracket 3–4.5
    const q = eo(P(t, 2.4, 1.1));
    if (q > 0) {
      const bx0 = x0 + 3 * ux, bx1 = x0 + 4.5 * ux;
      ctx.save();
      ctx.globalAlpha = q;
      ctx.fillStyle = 'rgba(255,182,39,0.22)';
      ctx.fillRect(bx0, y - 14, bx1 - bx0, h + 28);
      ctx.strokeStyle = MD.amber;
      ctx.lineWidth = 4;
      ctx.strokeRect(bx0, y - 14, bx1 - bx0, h + 28);
      ctx.shadowColor = 'rgba(255,182,39,0.8)';
      ctx.shadowBlur = 24;
      ctx.strokeRect(bx0, y - 14, bx1 - bx0, h + 28);
      ctx.shadowColor = 'transparent';
      ctx.restore();
      leader(ctx, (bx0 + bx1) / 2, y - 14, (bx0 + bx1) / 2 + 120, y - 190, { col: 'rgba(255,182,39,0.8)' });
      chip(ctx, 'pH MADU 3–4,5', (bx0 + bx1) / 2 + 300, y - 220, { p: q, col: 'rgba(255,182,39,0.95)' });
      label(ctx, 'ASAM GLUKONAT', (bx0 + bx1) / 2, y + h + 100,
        { size: 26, color: MD.amber, track: 4, align: 'center' });
    }
    // microbes repelled on the left
    for (let i = 0; i < 3; i++) {
      const t0 = 3.4 + i * 0.9;
      const ap = P(t, t0, 1.2);
      const back = eo(P(t, t0 + 1.1, 0.7));
      const x = lerp(180 + i * 90, 320 + i * 90, eo(ap)) - back * 120;
      const y2 = 760 + i * 90;
      microbe(ctx, x, y2, 0.9, { dry: back * 0.7, rot: i });
      if (back > 0.1) {
        ctx.save();
        ctx.strokeStyle = `rgba(196,80,46,${back * (1 - eo(P(t, t0 + 2.4, 1.4)))}`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 26, y2 - 26); ctx.lineTo(x + 26, y2 + 26);
        ctx.moveTo(x + 26, y2 - 26); ctx.lineTo(x - 26, y2 + 26);
        ctx.stroke();
        ctx.restore();
      }
    }
    // comparison markers on the ribbon
    ctx.font = '600 24px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (const [v, txt, col] of [[2.5, 'CUKA 2,5', 'rgba(243,239,228,0.55)'], [7, 'AIR 7', 'rgba(243,239,228,0.55)']]) {
      const mx = x0 + v * ux;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(mx, y - 8);
      ctx.lineTo(mx, y - 34);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.fillText(txt, mx, y - 46);
    }
    // fate row: the same microbe at three pH values
    const fy2 = 1620;
    [[330, 0, 0, 'pH 7 · NETRAL'], [720, 0.55, 0.2, 'pH 4,5 · TERTEKAN'], [1110, 1, 1, 'pH 3 · MATI']].forEach(([mx, dr, dd, tx], i) => {
      const q2 = eo(P(t, 4.6 + i * 0.7, 0.6));
      if (q2 <= 0) return;
      ctx.save();
      ctx.globalAlpha = q2;
      microbe(ctx, mx, fy2, 0.8, { dry: dr, dead: dd, rot: i });
      ctx.font = '600 24px JetBrains Mono, monospace';
      ctx.fillStyle = dd > 0.5 ? 'rgba(196,80,46,0.9)' : 'rgba(243,239,228,0.65)';
      ctx.textAlign = 'center';
      ctx.fillText(tx, mx, fy2 + 92);
      ctx.restore();
    });
    heading(ctx, 'DINDING', '', 120, 400, { amber: 'ASAM', p: P(t, 0.35, 1.0), size: 110, sub: 'TERLALU KERAS BAGI MIKROBA' });
    ctx.restore();
    dust(ctx, t, 31, 24);
    vign(ctx, 0.5);
  },
};
