import { W, H } from '../engine/draw.mjs';
import { F } from '../engine/fonts.mjs';
import {
  L, A, cue, cueWord, ease, sky, say, micro, number, txt, hexA, plate, TAU, clamp, lerp, rng, life,
} from './_langit.mjs';

// 08 — TANGGAL LAHIR
// The test the paradox makes: fill every gap in the sky and the universe has no
// edge and no beginning. So the frame fills with suns — packed, no gaps, no
// sky left — and then the wall drops away and leaves a date.

const B = 90;

/**
 * A wall of star surfaces: suns packed so tightly there is no sky left between
 * them. Drawn additively, in three jittered passes, so the overlaps pile into
 * glare instead of reading as a honeycomb.
 */
function sunWall(ctx, w, h) {
  const c = plate('sun-wall-v2', w, h, (g) => {
    g.fillStyle = '#1A0A04';
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    const step = 128;
    const rowH = step * 0.8;
    const passes = [
      { rad: 108, jit: 46, gain: 0.62 },
      { rad: 88, jit: 58, gain: 0.52 },
      { rad: 60, jit: 70, gain: 0.40 },
    ];
    const r = rng(4242);
    passes.forEach((ps, pi) => {
      for (let row = -1; row * rowH < h + step; row++) {
        const y = row * rowH;
        const off = row % 2 === 0 ? 0 : step / 2;
        for (let col = -1; col * step < w + step; col++) {
          const x = col * step + off + (r() - 0.5) * ps.jit;
          const yy = y + (r() - 0.5) * ps.jit;
          const rad = ps.rad * (0.86 + r() * 0.28);
          const gr = g.createRadialGradient(x, yy, rad * 0.05, x, yy, rad);
          gr.addColorStop(0, `rgba(255,255,250,${ps.gain})`);
          gr.addColorStop(0.28, `rgba(255,246,214,${ps.gain * 0.92})`);
          gr.addColorStop(0.62, `rgba(255,206,132,${ps.gain * 0.56})`);
          gr.addColorStop(0.9, `rgba(255,150,72,${ps.gain * 0.18})`);
          gr.addColorStop(1, 'rgba(255,120,50,0)');
          g.fillStyle = gr;
          g.beginPath();
          g.arc(x, yy, rad, 0, TAU);
          g.fill();
          // limb: a thin bright ring, the tell of a star surface seen close
          // diffraction spikes: a star seen close is not a smooth ball
          if (pi === 0 && r() < 0.45) {
            const sp = rad * (1.1 + r() * 0.5);
            const sg = g.createLinearGradient(x - sp, yy, x + sp, yy);
            sg.addColorStop(0, 'rgba(255,240,210,0)');
            sg.addColorStop(0.5, `rgba(255,248,228,${0.16 + r() * 0.16})`);
            sg.addColorStop(1, 'rgba(255,240,210,0)');
            g.fillStyle = sg;
            g.fillRect(x - sp, yy - 1.6, sp * 2, 3.2);
            g.fillRect(x - 1.6, yy - sp, 3.2, sp * 2);
          }
        }
      }
    });
    g.globalCompositeOperation = 'source-over';
    // a wash of glare across the whole wall
    const gl = g.createLinearGradient(0, 0, 0, h);
    gl.addColorStop(0, 'rgba(255,232,180,0.10)');
    gl.addColorStop(0.6, 'rgba(255,214,150,0.16)');
    gl.addColorStop(1, 'rgba(255,186,110,0.10)');
    g.fillStyle = gl;
    g.fillRect(0, 0, w, h);
  });
  ctx.drawImage(c, 0, 0);
}

export default {
  draw(ctx, t, scene) {
    const c = [0, 1, 2, 3].map((i) => cue(scene, i));
    sky(ctx, { key: 'r8', band: 0.55 });
    life(ctx, t, { a: 0.7, meteor: 0.7 });

    // caption 1 — not a failure
    say(ctx, ['BUKAN', 'KEGAGALAN.'], 104, 320, {
      t, size: 104, at: c[0], stagger: 0.09, a: 1 - A(t, c[1], 0.45, ease.out),
    });

    // caption 2 — the proof of a beginning: the sky fills from the horizon up
    const fill = A(t, c[1] + 0.2, 2.6, ease.inOut);
    const away = A(t, c[3] + 0.1, 0.7, ease.inOut);
    const wallY = lerp(H + B, -B, Math.min(1, fill));
    const skyGround = 1480;
    if (fill > 0.01 && away < 0.99) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, fill * 1.4) * (1 - away);
      ctx.beginPath();
      ctx.rect(-B, wallY, W + 2 * B, skyGround - wallY);
      ctx.clip();
      sunWall(ctx, W + 2 * B, H + 2 * B);
      ctx.restore();
      // the rising edge is glare, not a line: a wide bloom sits on the seam
      if (fill < 0.999) {
        ctx.save();
        ctx.globalAlpha = (1 - away);
        const bloom = ctx.createRadialGradient(W / 2, wallY, 10, W / 2, wallY, 780);
        bloom.addColorStop(0, 'rgba(255,246,222,0.55)');
        bloom.addColorStop(0.35, 'rgba(255,214,160,0.26)');
        bloom.addColorStop(1, 'rgba(255,190,130,0)');
        ctx.fillStyle = bloom;
        ctx.fillRect(-B, wallY - 800, W + 2 * B, 1000);
        ctx.restore();
      }
      // the ground, and a wash that lets the caption stay readable on all that light
      ctx.save();
      ctx.globalAlpha = Math.min(1, fill) * (1 - away);
      ctx.fillStyle = '#04060D';
      ctx.fillRect(-B, skyGround, W + 2 * B, H - skyGround + B);
      const cg = ctx.createLinearGradient(0, 1440, 0, 1790);
      cg.addColorStop(0, 'rgba(3,5,13,0)');
      cg.addColorStop(1, 'rgba(3,5,13,0.90)');
      ctx.fillStyle = cg;
      ctx.fillRect(-B, 1440, W + 2 * B, 360);
      ctx.restore();
    }

    // caption 3 — the alternative: no edge, no beginning
    const p3 = A(t, c[2], 0.7, ease.out);
    const out3 = 1 - A(t, c[3], 0.5, ease.out);
    if (p3 > 0.01 && out3 > 0.01 && fill > 0.8) {
      ctx.save();
      ctx.globalAlpha = Math.min(p3, out3) * 0.92;
      micro(ctx, 'TAK TERBATAS · TANPA AWAL', 720, 1420, { size: 26, color: 'rgba(64,26,8,0.72)', align: 'center', track: 8 });
      // an infinite lattice, receding past the frame in every direction
      ctx.strokeStyle = 'rgba(120,58,20,0.10)';
      ctx.lineWidth = 1.4;
      const drift = (t * 14) % 90;
      for (let i = -1; i < 18; i++) {
        const x = -B + i * 90 - drift;
        ctx.beginPath();
        ctx.moveTo(x, -B);
        ctx.lineTo(x, H + B);
        ctx.stroke();
      }
      for (let i = -1; i < 30; i++) {
        const y = -B + i * 90 + drift;
        ctx.beginPath();
        ctx.moveTo(-B, y);
        ctx.lineTo(W + B, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // caption 4 — the wall drops away and the date is stamped on the dark
    const p4 = A(t, c[3], 0.8, ease.expo);
    if (p4 > 0.01) {
      ctx.save();
      ctx.globalAlpha = p4;
      ctx.fillStyle = 'rgba(3,5,13,0.965)';
      ctx.fillRect(-B, -B, W + 2 * B, H + 2 * B);
      const r = rng(808);
      for (let i = 0; i < 150; i++) {
        ctx.fillStyle = `rgba(255,246,227,${0.10 + r() * 0.45})`;
        ctx.beginPath();
        ctx.arc(r() * W, r() * H * 0.78, 0.8 + r() * 2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      const q = A(t, c[3] + 0.45, 0.9, ease.expo);
      if (q > 0.01) {
        ctx.save();
        ctx.translate(720, 860);
        ctx.rotate(-0.05);
        const sc = 0.9 + 0.1 * q;
        ctx.scale(sc, sc);
        ctx.globalAlpha = q;
        ctx.strokeStyle = hexA(L.gold, 0.85);
        ctx.lineWidth = 5;
        ctx.strokeRect(-470, -150, 940, 300);
        ctx.strokeStyle = hexA(L.gold, 0.32);
        ctx.lineWidth = 2;
        ctx.strokeRect(-452, -132, 904, 264);
        micro(ctx, 'TANGGAL LAHIR ALAM SEMESTA', 0, -92, { size: 24, color: L.warm, align: 'center', track: 9, a: q });
        number(ctx, '13,8', -196, 52, { size: 128, color: L.star, align: 'right' });
        micro(ctx, 'MILIAR', -158, 20, { size: 26, color: L.gold, track: 5 });
        micro(ctx, 'TAHUN LALU', -158, 58, { size: 26, color: L.gold, track: 5 });
        ctx.restore();
      }
      const q2 = A(t, c[3] + 1.2, 0.7, ease.out);
      if (q2 > 0.01) {
        ctx.save();
        ctx.globalAlpha = q2;
        micro(ctx, 'KEGELAPAN MALAM', 720, 1240, { size: 26, color: L.dim, align: 'center', track: 9 });
        ctx.restore();
      }
    }
  },
};
