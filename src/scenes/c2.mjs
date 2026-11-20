// Episode 32 scene 2 — placeholder rig; full art lands on the _pintu kit.
import { W, H } from './_cyano.mjs';

export default {
  draw(ctx, t, scene, env) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0e141b');
    g.addColorStop(1, '#1a222c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  },
};
