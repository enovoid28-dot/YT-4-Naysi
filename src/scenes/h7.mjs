// h7 ENZIM LEBAH — third defense: a bee over a honey drop; glucose-oxidase
// diamonds release slow hydrogen-peroxide bubbles through the drop.
import { MD, tomb, shafts, dust, vign, bee, jar, heading, chip, label, sparkle,
  cue, P, eo, keys, frameOn, clamp, TAU, W, H } from './_madu.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1040, 1.07], [3, 720, 1080, 1.0], [scene.dur, 720, 1110, 1.05],
    ]);
    tomb(ctx, t, { hex: 0.045 });
    shafts(ctx, t, { n: 2, a: 0.055, x: 260, gap: 640 });
    ctx.save();
    frameOn(ctx, cam);
    // big honey drop
    const cx = W / 2, cy = 1180;
    const dp = eo(P(t, 0.5, 1.4));
    ctx.save();
    ctx.globalAlpha = dp;
    const g = ctx.createLinearGradient(0, cy - 330, 0, cy + 300);
    g.addColorStop(0, '#FFD37A');
    g.addColorStop(0.5, MD.honey);
    g.addColorStop(1, '#7A3E08');
    ctx.fillStyle = g;
    ctx.shadowColor = 'rgba(255,182,39,0.5)';
    ctx.shadowBlur = 60;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 330);
    ctx.bezierCurveTo(cx + 60, cy - 190, cx + 250, cy - 60, cx + 250, cy + 60);
    ctx.bezierCurveTo(cx + 250, cy + 210, cx + 130, cy + 300, cx, cy + 300);
    ctx.bezierCurveTo(cx - 130, cy + 300, cx - 250, cy + 210, cx - 250, cy + 60);
    ctx.bezierCurveTo(cx - 250, cy - 60, cx - 60, cy - 190, cx, cy - 330);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,226,150,0.55)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,244,214,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - 110, cy - 60, 34, 84, -0.35, 0, TAU);
    ctx.fill();
    ctx.restore();
    // enzyme diamonds + rising H2O2 bubbles inside the drop
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 330);
    ctx.bezierCurveTo(cx + 60, cy - 190, cx + 250, cy - 60, cx + 250, cy + 60);
    ctx.bezierCurveTo(cx + 250, cy + 210, cx + 130, cy + 300, cx, cy + 300);
    ctx.bezierCurveTo(cx - 130, cy + 300, cx - 250, cy + 210, cx - 250, cy + 60);
    ctx.bezierCurveTo(cx - 250, cy - 60, cx - 60, cy - 190, cx, cy - 330);
    ctx.clip();
    for (let i = 0; i < 5; i++) {
      const ex = cx - 150 + i * 76, ey = cy + 150 - (i % 2) * 60;
      const eq = eo(P(t, 1.6 + i * 0.4, 0.7));
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(Math.PI / 4);
      ctx.scale(eq, eq);
      ctx.fillStyle = 'rgba(79,192,180,0.85)';
      ctx.fillRect(-16, -16, 32, 32);
      ctx.strokeStyle = 'rgba(236,255,250,0.8)';
      ctx.lineWidth = 2.4;
      ctx.strokeRect(-16, -16, 32, 32);
      ctx.restore();
      // bubbles
      for (let b = 0; b < 3; b++) {
        const ph = ((t * 0.22 + b * 0.33 + i * 0.13) % 1);
        const by = ey - ph * 420;
        ctx.strokeStyle = `rgba(236,255,250,${0.55 * (1 - ph)})`;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(ex + Math.sin(ph * 9 + b) * 16, by, 9 + b * 3, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.restore();
    label(ctx, 'GLUKOSA OKSIDASE → HIDROGEN PEROKSIDA', cx, cy + 400,
      { size: 28, color: 'rgba(79,192,180,0.9)', track: 4, align: 'center' });
    // bee patrol
    const bx = cx + Math.sin(t * 0.55) * 330, by = 620 + Math.sin(t * 1.1) * 40;
    bee(ctx, bx, by, 1.15, t, {
      tilt: Math.cos(t * 0.55) * 0.2,
      trail: [[cx - 420, 700], [cx - 200, 600], [cx + 60, 680]],
    });
    chip(ctx, 'RAHASIA 03 · ENZIM', 1080, 470, { p: P(t, cue(scene, 'enzim'), 0.5) });
    heading(ctx, 'ENZIM', '', 120, 400, { amber: 'LEBAH', p: P(t, 0.35, 1.0), size: 110, sub: 'PENJAGA STERIL YANG PELAHAN' });
    sparkle(ctx, cx + 210, cy - 140, 16, 0.5 + 0.4 * Math.sin(t * 2.2));
    ctx.restore();
    dust(ctx, t, 37, 26);
    vign(ctx, 0.5);
  },
};
