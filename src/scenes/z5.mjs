import { clamp, lerp, rng, TAU } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, chip, ringBurst } from './_bulan.mjs';
import { tag, punch, zoomed } from './_lab.mjs';
import { tick } from './_darah.mjs';
import { monoFx, shock, haze } from './_fx.mjs';
import { hit } from '../engine/look.mjs';
import { C, P, eo, io, layer, slate, cup, badge, porthole, tissue, capsa, micelle, beaker, leader } from './_cabai.mjs';

// 05 — SUSU
// Card 0: water tips into the scope on the tongue's surface and the
// capsaicin, instead of washing off, spreads over the whole field ("justru
// menyebarkan"). On "larut dalam lemak" a beaker shows why: the molecules
// leave the water and gather in the oil layer.
// Card 1: milk. Casein micelles drift in on "kaseinnya", grab the molecules
// on "mengikat" and carry them off on "membilasnya" — the burn fades.

const N = 18;
const TOK = (() => {
  const r = rng(505);
  return Array.from({ length: N }, (_, i) => {
    const a0 = r() * TAU;
    const d0 = Math.sqrt(r()) * 0.26;
    const a1 = (i / N) * TAU + r() * 0.3;
    const d1 = 0.35 + r() * 0.5;
    return { c: [Math.cos(a0) * d0 - 0.15, Math.sin(a0) * d0 + 0.1], s: [Math.cos(a1) * d1, Math.sin(a1) * d1], rot: r() * TAU, m: i % 6, ph: r() * TAU };
  });
})();
const MIC = [[-0.45, -0.28], [0.3, -0.48], [-0.04, 0.02], [0.5, 0.18], [-0.36, 0.46], [0.18, 0.56]];

function water(ctx, t, scene, cam) {
  const tMinum = wordT(scene, 0, 0);
  const tJustru = wordT(scene, 0, 2);
  const tSebar = wordT(scene, 0, 3);
  const tKaps = wordT(scene, 0, 4);
  const tKarena = wordT(scene, 0, 5);
  const tLarut = wordT(scene, 0, 8);
  const tLemak = wordT(scene, 0, 10);
  slate(ctx, t, cam, { lamp: [760, 1000], lampR: 1200, rgb: '170,200,255', heat: 0.1 });

  const pour = eo(P(t, tMinum - 0.1, 0.6)) * (1 - eo(P(t, tKaps + 0.3, 0.5)));
  const wet = io(P(t, tJustru - 0.2, 1.1));
  const spread = io(P(t, tSebar - 0.3, 1.2));
  const mv = io(P(t, tKarena - 0.3, 0.7));
  const pc = [lerp(790, 470, mv), lerp(1010, 980, mv)];
  const pr = lerp(350, 280, mv);

  plane(ctx, cam, 1.05, () => {
    const gx = lerp(330, 250, mv);
    cup(ctx, gx, 540, 200, 280, { liquid: 'water', level: 0.7 - 0.25 * wet, t, tilt: 0.55 * pour, a: 1 - mv });
    badge(ctx, gx, 770, 'AIR', P(t, tMinum - 0.05, 0.4), { icon: 'air', size: 46, rgb: C.waterRgb, cross: P(t, tKaps - 0.05, 0.3), a: 1 - mv });
    shock(ctx, gx, 770, P(t, tKaps - 0.06, 0.6), { r: 220, rgb: '255,120,100', lines: 10, seed: 41, a: 1 - mv });
    hit(t, tKaps - 0.06, 0.55);
    // the stream into the scope
    if (pour > 0.05 && wet < 0.98) {
      ctx.save();
      ctx.globalAlpha *= pour * (1 - wet);
      ctx.strokeStyle = 'rgba(140,210,255,0.7)';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gx + 124, 450);
      ctx.quadraticCurveTo(gx + 260, 470, pc[0] - pr * 0.4, pc[1] - pr * 0.6);
      ctx.stroke();
      ctx.restore();
    }
  });

  plane(ctx, cam, 1.0, () => {
    const k = punch(t, tSebar - 0.05, 0.03, 0.5);
    zoomed(ctx, k, pc[0], pc[1], () => {
      porthole(ctx, pc[0], pc[1], pr, P(t, 0.0, 0.5), (c) => {
        tissue(c, pc[0], pc[1], pr, t, { heat: 0.2 + 0.6 * spread });
        // the water wash sweeping across
        if (wet > 0.01) {
          c.save();
          c.globalAlpha *= 0.4 * Math.min(1, wet * 2);
          const wx = pc[0] - pr * 1.2 + wet * pr * 2.6;
          const g = c.createLinearGradient(wx - pr, 0, wx, 0);
          g.addColorStop(0, 'rgba(120,200,255,0.55)');
          g.addColorStop(1, 'rgba(120,200,255,0)');
          c.fillStyle = g;
          c.fillRect(pc[0] - pr * 1.2, pc[1] - pr * 1.2, wx - (pc[0] - pr * 1.2), pr * 2.4);
          c.restore();
        }
        for (const tk of TOK) {
          const x = pc[0] + lerp(tk.c[0], tk.s[0], spread) * pr + Math.sin(t * 1.6 + tk.ph) * 6;
          const y = pc[1] + lerp(tk.c[1], tk.s[1], spread) * pr + Math.cos(t * 1.3 + tk.ph) * 6;
          capsa(c, x, y, 34, { rot: tk.rot + t * 0.4 });
        }
      }, { label: 'PERMUKAAN LIDAH', mag: '× 200' });
    });
    monoFx(ctx, 'MALAH MENYEBAR', pc[0], pc[1] + pr + 100, P(t, tSebar + 0.1, 0.6), t, { size: 32, color: '#FF9A7A', align: 'center', track: 6, a: 1 - mv, seed: 14 });
    haze(ctx, pc[0] - pr * 0.7, pc[0] + pr * 0.7, pc[1] - pr * 0.6, 420, t, { n: 5, a: 0.16 * spread * (1 - mv), rgb: '255,150,120', seed: 42 });
  });

  // why: oil and water
  plane(ctx, cam, 1.08, () => {
    const q = P(t, tKarena - 0.1, 0.55);
    const bx = 1090;
    const by = 1010;
    const b = beaker(ctx, bx, by, 340, 580, { t, p: q });
    if (b) {
      const go = io(P(t, tLarut - 0.15, 0.9));
      const r = rng(77);
      for (let i = 0; i < 9; i++) {
        const x = bx - 120 + r() * 240;
        const y0 = b.oilB + 40 + r() * (b.bot - b.oilB - 80);
        const y1 = b.liqTop + 18 + r() * (b.oilB - b.liqTop - 36);
        const f = clamp(go * 1.3 - i * 0.04);
        capsa(ctx, x + Math.sin(t * 2 + i) * 5, lerp(y0, y1, io(f)), 28, { rot: r() * TAU + t * 0.3, a: eo(q) });
      }
      monoFx(ctx, 'LEMAK', bx, b.liqTop - 70, q, t, { size: 32, color: '#FFD27A', align: 'center', track: 5, seed: 15 });
      monoFx(ctx, 'AIR', bx, b.bot + 62, q, t, { size: 32, color: C.water, align: 'center', track: 5, seed: 16 });
      shock(ctx, bx, (b.liqTop + b.oilB) / 2, P(t, tLemak - 0.08, 0.6), { r: 260, rgb: C.emberRgb, lines: 10, seed: 43 });
      ringBurst(ctx, bx, (b.liqTop + b.oilB) / 2, P(t, tLemak - 0.05, 0.6), { color: C.emberRgb, r: 200 });
    }
  });
  badge(ctx, 720, 1650, 'LARUT DALAM LEMAK', P(t, tLarut - 0.1, 0.45), { icon: 'lemak', size: 48, rgb: C.emberRgb, color: '#FFD27A', glow: 0.5 });
  hit(t, tLemak - 0.08, 0.4);
}

function milk(ctx, t, scene, cam) {
  const tSusu = wordT(scene, 1, 0);
  const tAmpuh = wordT(scene, 1, 2);
  const tProt = wordT(scene, 1, 3);
  const tKasein = wordT(scene, 1, 4);
  const tIkat = wordT(scene, 1, 5);
  const tBilas = wordT(scene, 1, 8);
  slate(ctx, t, cam, { lamp: [760, 1000], lampR: 1250, rgb: '255,226,190', heat: 0.05 });

  const pc = [880, 1030];
  const pr = 370;
  const micIn = io(P(t, tProt - 0.2, 0.9));
  const bind = io(P(t, tIkat - 0.1, 0.9));
  const wash = io(P(t, tBilas - 0.1, 1.0));

  plane(ctx, cam, 1.05, () => {
    cup(ctx, 280, 620, 240, 340, { liquid: 'milk', level: 0.78, t, tilt: 0.04 * Math.sin(t * 0.8) });
    badge(ctx, 280, 890, 'SUSU', P(t, tSusu - 0.1, 0.4), { icon: 'susu', size: 50, rgb: C.milkRgb, glow: 0.5 });
    tick(ctx, 280, 1010, 60, P(t, tAmpuh - 0.05, 0.35), { lw: 11, color: C.mint });
  });

  plane(ctx, cam, 1.0, () => {
    porthole(ctx, pc[0], pc[1], pr, P(t, tSusu - 0.3, 0.5), (c) => {
      tissue(c, pc[0], pc[1], pr, t, { heat: 0.85 * (1 - wash) });
      // milk haze
      c.save();
      c.globalAlpha *= 0.22 * micIn;
      c.fillStyle = '#FFF8EC';
      c.fillRect(pc[0] - pr * 1.2, pc[1] - pr * 1.2, pr * 2.4, pr * 2.4);
      c.restore();
      const mp = MIC.map(([mx, my], i) => [
        pc[0] + (mx * pr) - (1 - micIn) * pr * 1.6 + wash * pr * 1.9 + Math.sin(t * 0.9 + i) * 8,
        pc[1] + my * pr + wash * pr * (0.3 + 0.2 * i) + Math.cos(t * 0.8 + i) * 8,
      ]);
      for (const tk of TOK) {
        const home = [pc[0] + tk.s[0] * pr + Math.sin(t * 1.6 + tk.ph) * 6, pc[1] + tk.s[1] * pr + Math.cos(t * 1.3 + tk.ph) * 6];
        const m = mp[tk.m];
        const an = tk.ph;
        const onM = [m[0] + Math.cos(an + t * 0.5) * 70, m[1] + Math.sin(an + t * 0.5) * 70];
        const x = lerp(home[0], onM[0], bind);
        const y = lerp(home[1], onM[1], bind);
        capsa(c, x, y, 30, { rot: tk.rot + t * 0.4, glow: 1 - 0.6 * bind });
      }
      mp.forEach(([x, y], i) => micelle(c, x, y, 64, { t, seed: i + 3, a: micIn }));
    }, { label: 'PERMUKAAN LIDAH', mag: '× 200' });
    leader(ctx, pc[0] - 165, pc[1] - 104, 640, 540, P(t, tKasein - 0.1, 0.4), { color: 'rgba(244,239,230,0.8)', t, a: 1 - wash });
    monoFx(ctx, 'KASEIN', 640, 512, P(t, tKasein - 0.05, 0.5), t, { size: 38, color: C.milk, align: 'center', track: 6, a: 1 - wash, seed: 17 });
    monoFx(ctx, 'PROTEIN SUSU', 640, 462, P(t, tKasein + 0.05, 0.6), t, { size: 28, color: 'rgba(244,239,230,0.72)', align: 'center', track: 4, a: 1 - wash, seed: 18 });
    mono(ctx, 'MENGIKAT', pc[0], pc[1] + pr + 100, { size: 32, color: C.mint, align: 'center', track: 6, a: eo(P(t, tIkat, 0.4)) * (1 - eo(P(t, tBilas - 0.1, 0.25))) });
    mono(ctx, 'TERBILAS', pc[0], pc[1] + pr + 100, { size: 32, color: C.mint, align: 'center', track: 6, a: eo(P(t, tBilas + 0.2, 0.4)) });
  });

  tag(ctx, 720, 1650, P(t, tAmpuh - 0.15, 0.5), { big: 'SUSU', small: 'LEBIH AMPUH DARI AIR', color: C.milk, glowRgb: C.milkRgb, size: 96 });
  shock(ctx, 720, 1650, P(t, tAmpuh - 0.12, 0.8), { r: 520, rgb: C.milkRgb, lines: 18, seed: 44 });
  hit(t, tAmpuh - 0.12, 0.6);
  hit(t, tIkat - 0.05, 0.35);
  chip(ctx, 'SUSU SKIM PUN SAMA AMPUHNYA', 720, 1545, eo(P(t, tBilas + 0.4, 0.45)), { color: C.mint, size: 28 });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.5 * x;
    ctx.translate(720, 950);
    ctx.scale(k, k);
    ctx.translate(-720, -950);
    water(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 1000);
    c.scale(k, k);
    c.translate(-720, -1000);
    milk(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
