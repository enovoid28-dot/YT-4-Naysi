import { W, H } from './draw.mjs';
import { clamp, lerp, EASE } from './anim.mjs';

// ─────────────────────────────────────────────────────────────────────────────
// Camera rig.
//
// Every scene on this episode is shot, not laid out: one continuous camera move
// per scene (push, pull, drift), and every element lives on a depth plane, so a
// 20 px camera drift reads as parallax instead of a group sliding. Nothing here
// draws — it only moves what you hand it, which is why it can sit under both the
// paper kit and the scene code without either knowing about the other.
// ─────────────────────────────────────────────────────────────────────────────

export const E = {
  out: (p) => EASE.outCubic(clamp(p)),
  expo: (p) => EASE.outExpo(clamp(p)),
  inOut: (p) => EASE.inOutQuad(clamp(p)),
  smooth: (p) => EASE.smooth(clamp(p)),
  in: (p) => EASE.inQuad(clamp(p)),
  outBack: (p) => {
    const c = 1.7;
    const x = clamp(p) - 1;
    return 1 + x * x * ((c + 1) * x + c);
  },
};

export const P = (t, at, d, e = E.out) => e(clamp((t - at) / Math.max(0.001, d)));

/** overshoot that settles: the landing every heavy object in the film uses */
export const land = (t, at, d = 0.7) => {
  const p = clamp((t - at) / d);
  if (p <= 0) return 0;
  const s = 1 - Math.pow(1 - p, 3);
  const o = Math.sin(p * Math.PI) * Math.exp(-p * 4.2) * 0.16;
  return s + o;
};

/**
 * A camera move. `from`/`to` are { x, y, z, r } in frame units: z is scale
 * (1 = none), x/y are pixels of drift, r is a small rotation in radians.
 */
export function camera(ctx, t, dur, from, to, e = E.inOut) {
  const p = e(clamp(t / Math.max(0.001, dur)));
  const z = lerp(from.z ?? 1, to.z ?? 1, p);
  const dx = lerp(from.x ?? 0, to.x ?? 0, p);
  const dy = lerp(from.y ?? 0, to.y ?? 0, p);
  const r = lerp(from.r ?? 0, to.r ?? 0, p);
  ctx.save();
  ctx.translate(W / 2 + dx, H / 2 + dy);
  if (r) ctx.rotate(r);
  ctx.scale(z, z);
  ctx.translate(-W / 2, -H / 2);
  return () => ctx.restore();
}

/** one depth plane: `k` 0 = far (moves little), 1 = near (moves a lot) */
export function plane(ctx, cam, k, fn) {
  if (!cam || (!cam.dx && !cam.dy && !cam.zoom)) { fn(); return; }
  ctx.save();
  const z = 1 + (cam.zoom || 0) * k;
  ctx.translate(W / 2 + (cam.dx || 0) * k, H / 2 + (cam.dy || 0) * k);
  ctx.scale(z, z);
  ctx.translate(-W / 2, -H / 2);
  fn();
  ctx.restore();
}

/** motion blur: the same drawing repeated along the direction of travel */
export function ghosts(ctx, { dx = 0, dy = 0, n = 4, spread = 1, alpha = 0.14 }, fn) {
  for (let i = n; i >= 1; i--) {
    const f = (i / n) * spread;
    ctx.save();
    ctx.globalAlpha *= alpha * (1 - f * 0.6);
    ctx.translate(dx * f, dy * f);
    fn();
    ctx.restore();
  }
  ctx.save();
  fn();
  ctx.restore();
}

/** clip reveal: `dir` is the side the content comes from */
export function reveal(ctx, x, y, w, h, p, dir, fn, soft = 0) {
  const q = clamp(p);
  if (q <= 0.001) return;
  ctx.save();
  ctx.beginPath();
  if (dir === 'up') ctx.rect(x, y + h * (1 - q), w, h * q + soft);
  else if (dir === 'down') ctx.rect(x, y - soft, w, h * q + soft);
  else if (dir === 'left') ctx.rect(x + w * (1 - q), y, w * q + soft, h);
  else ctx.rect(x - soft, y, w * q + soft, h);
  ctx.clip();
  fn();
  ctx.restore();
}

/** a sheet of light crossing the paper, once every `period` seconds */
export function sheen(ctx, t, { period = 4.2, a = 0.1, slant = 0.55, color = '#FFFFFF' } = {}) {
  const ph = (t % period) / period;
  const x = lerp(-W * 0.9, W * 1.4, E.smooth(clamp(ph / 0.42)));
  if (ph > 0.42) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(x - 260, 0, x + 260, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, color);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalAlpha = a * Math.sin(clamp(ph / 0.42) * Math.PI);
  ctx.fillStyle = g;
  ctx.save();
  ctx.transform(1, 0, -slant, 1, 0, 0);
  ctx.fillRect(x - 300, -200, 600, H + 400);
  ctx.restore();
  ctx.restore();
}

/** the paper's own emboss: soft top light and a pressed edge */
export function emboss(ctx, a = 1) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(255,252,242,${0.16 * a})`);
  g.addColorStop(0.42, 'rgba(255,252,242,0)');
  g.addColorStop(1, `rgba(54,38,20,${0.10 * a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** a count that only ever climbs, printed as mm:ss */
export const mmss = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
