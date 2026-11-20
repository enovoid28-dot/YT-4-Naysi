// s13 KOMENTAR — quiet outro: a small Earth, the typing bubble, the ask.
import { GP, space, vign, motes, earthStill, cue, P, keys, frameOn, label, clamp,
  TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [[0, 720, 1000, 1.03], [scene.dur, 720, 980, 1.08]]);
    space(ctx, t, 17);
    ctx.save();
    frameOn(ctx, cam);
    const eb = earthStill('g32-small', W / 2, 620, 300, { rot: 0.6, clouds: 0.9, night: 0.6 });
    ctx.drawImage(eb.img, eb.x, eb.y);
    // comment bubble
    const bx = W / 2 - 380, by = 1020, bw = 760, bh = 400;
    ctx.fillStyle = 'rgba(243,239,228,0.96)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 36);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + 120, by + bh - 4);
    ctx.lineTo(bx + 84, by + bh + 84);
    ctx.lineTo(bx + 236, by + bh - 4);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 4 - i * 0.9));
      ctx.fillStyle = i === 2 ? `rgba(228,87,46,${a})` : `rgba(13,58,82,${a})`;
      ctx.beginPath();
      ctx.arc(W / 2 - 70 + i * 70, by + bh / 2, 17, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    label(ctx, 'TULIS DI KOMENTAR', W / 2, 1680, { size: 46, color: GP.bone, track: 8, align: 'center' });
    label(ctx, 'IKUTI NAYSI · FAKTA SEHARI-HARI', W / 2, 1760, { size: 30, color: GP.amber, track: 6, align: 'center' });
    motes(ctx, t, 141, 26);
    vign(ctx, 0.5);
  },
};
