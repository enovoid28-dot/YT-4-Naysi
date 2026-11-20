// s4 LONCENG PLANET — the whole globe rings: standing ripples over the
// limb, a centimetre of motion everywhere, weeks of coda.
import { GP, space, vign, motes, seismo, chip, earthStill, cue, P, keys, frameOn,
  label, clamp, TAU, W, H } from './_gempa.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [[0, 720, 1000, 1.0], [scene.dur, 720, 980, 1.12]]);
    space(ctx, t, 9);
    ctx.save();
    frameOn(ctx, cam);
    const eb = earthStill('g32-full', W / 2, 1010, 560, { rot: 0.35, clouds: 0.9, night: 0.7 });
    ctx.drawImage(eb.img, eb.x, eb.y);
    // standing ripple rings hugging the limb
    const decay = 1 - clamp(t / scene.dur) * 0.75;
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, 1010, 560, 0, TAU);
    ctx.clip();
    for (let k = 0; k < 7; k++) {
      const rr = 90 + k * 78 + Math.sin(t * 3.1 + k) * 10 * decay;
      ctx.strokeStyle = `rgba(255,188,66,${0.30 * decay * (1 - k / 8)})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(W / 2, 1010, rr, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    // halo breath outside the limb
    ctx.strokeStyle = `rgba(111,211,224,${0.35 * decay})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(W / 2, 1010, 578 + Math.sin(t * 3.1) * 8 * decay, 0, TAU);
    ctx.stroke();
    seismo(ctx, 160, 1830, W - 320, 190, P(t, 0.4, scene.dur - 1), { burst: 0.1 });
    ctx.restore();
    const tC = cue(scene, 'sentimeter');
    if (t > tC) chip(ctx, '±1 CM DI SETIAP TITIK BUMI', 120, 420, { a: P(t, tC, 0.6) });
    const tL = cue(scene, 'lonceng');
    if (t > tL) chip(ctx, 'BERDERING BERMINGGU-MINGGU', 120, 520, { a: P(t, tL, 0.6) });
    motes(ctx, t, 51, 20);
    vign(ctx, 0.5);
  },
};
