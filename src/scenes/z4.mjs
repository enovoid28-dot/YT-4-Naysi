import { clamp, lerp, TAU } from '../engine/anim.mjs';
import { F } from '../engine/fonts.mjs';
import { txt } from '../engine/draw.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, mono, chip, glass, brackets } from './_bulan.mjs';
import { tag, punch, zoomed } from './_lab.mjs';
import { tick } from './_darah.mjs';
import { C, P, eo, io, layer, slate, brain, nerve, fireWall, flameIcon, profile } from './_cabai.mjs';

// 04 — TERTIPU
// Card 0: the signal climbs the nerve into the brain; "mengira" opens the
// alarm panel, "benar-benar terbakar" floods the brain red and the fire rises
// — while the real temperature in the mouth reads a calm 36,8 °C.
// Card 1: a thermal camera on a face. Each reaction lands on its own word:
// the cheeks flush ("memerah"), sweat beads ("keringat"), a tear runs ("mata").

const B = { x: 720, y: 760, s: 760 };

function alarm(ctx, t, scene, cam) {
  const tOtak = wordT(scene, 0, 1);
  const tKira = wordT(scene, 0, 2);
  const tMulut = wordT(scene, 0, 3);
  const tBenar = wordT(scene, 0, 4);
  const tBakar = wordT(scene, 0, 5);
  const al = eo(P(t, tBenar - 0.1, 0.7));
  slate(ctx, t, cam, { lamp: [720, 900], lampR: 1200, rgb: al > 0.3 ? '255,110,90' : '220,180,150', heat: 0.2 + 0.6 * al });

  // the fire the brain imagines, rising from below
  plane(ctx, cam, 0.9, () => {
    const fh = 340 * eo(P(t, tBakar - 0.15, 0.6));
    fireWall(ctx, -40, 1480, 1580, fh, t, { n: 11, a: 0.95 });
  });

  // the nerve from the mouth up to the brainstem
  plane(ctx, cam, 1.0, () => {
    const on = eo(P(t, 0.0, 0.4));
    nerve(ctx, [[720, 1600], [700, 1440], [740, 1250], [B.x - 10, B.y + B.s * 0.36]], t, { on, lw: 6, n: 4, speed: 1.3, reveal: io(P(t, 0.0, 0.6)) });
    const k = punch(t, tOtak - 0.05, 0.03, 0.5) * punch(t, tBakar - 0.05, 0.04, 0.5);
    zoomed(ctx, k, B.x, B.y, () => {
      brain(ctx, B.x, B.y, B.s, { t, alarm: al });
    });
    brackets(ctx, B.x - 440, B.y - 330, 880, 680, eo(P(t, tKira - 0.2, 0.5)), { color: al > 0.3 ? 'rgba(255,110,90,0.9)' : 'rgba(232,226,214,0.6)', len: 50 });
  });

  // the alarm panel: what the brain concludes
  plane(ctx, cam, 1.15, () => {
    const q = eo(P(t, tKira - 0.15, 0.45));
    const flash = al > 0.01 ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
    glass(ctx, 220, 230, 1000, 180, q, { tint: '255,90,70', edge: '255,170,150', glowC: `rgba(255,70,50,${0.3 + 0.4 * flash * al})`, fill: 0.12 });
    flameIcon(ctx, 305, 372, 104, { t, a: q });
    mono(ctx, 'OTAK MENYIMPULKAN', 390, 290, { size: 26, color: 'rgba(255,214,200,0.8)', track: 5, a: q });
    const msg = 'MULUT TERBAKAR!';
    const n = Math.ceil(msg.length * clamp((t - tMulut + 0.1) / 0.9));
    txt(ctx, msg.slice(0, Math.max(0, n)), 388, 372, { size: 68, font: F.fig8, color: '#FF7A66', alpha: q });
  });

  // the reality check beside it
  plane(ctx, cam, 1.1, () => {
    const q = eo(P(t, tBakar + 0.1, 0.45));
    if (q > 0.001) {
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.fillStyle = 'rgba(6,14,14,0.86)';
      ctx.beginPath();
      ctx.roundRect(280, 1190, 880, 170, 28);
      ctx.fill();
      ctx.restore();
    }
    glass(ctx, 280, 1190, 880, 170, q, { tint: '120,200,190', edge: '200,240,230', fill: 0.06 });
    mono(ctx, 'SUHU ASLI DI MULUT', 330, 1250, { size: 26, color: C.mint, track: 5, a: q });
    txt(ctx, '36,8 °C', 330, 1328, { size: 68, font: F.fig8, color: C.bone, alpha: q });
    mono(ctx, 'NORMAL', 1110, 1318, { size: 32, color: C.mint, align: 'right', track: 6, a: q });
  });
  tag(ctx, 720, 1660, P(t, tBakar + 0.2, 0.5), { big: 'ALARM PALSU', color: '#FF8A7A', glowRgb: C.redRgb, size: 92 });
}

function thermal(ctx, t, scene, cam) {
  const tWajah = wordT(scene, 1, 1);
  const tMerah = wordT(scene, 1, 2);
  const tKeringat = wordT(scene, 1, 3);
  const tMata = wordT(scene, 1, 6);
  const tAir = wordT(scene, 1, 7);
  // a thermal camera's dark field
  ctx.fillStyle = '#07040D';
  ctx.fillRect(0, 0, 1440, 2560);
  const bg = ctx.createRadialGradient(600, 1000, 100, 600, 1000, 1300);
  bg.addColorStop(0, 'rgba(60,24,110,0.6)');
  bg.addColorStop(1, 'rgba(10,4,20,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1440, 2560);
  // scan lines
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = (t * 40) % 8; y < 1800; y += 8) ctx.fillRect(0, y, 1440, 2);

  const heat = eo(P(t, tWajah - 0.1, 1.0));
  const sweat = eo(P(t, tKeringat - 0.15, 0.9));
  const tears = eo(P(t, tMata - 0.1, 0.8));
  const HX = 540;
  const HY = 1000;
  const HS = 900;
  const k = HS / 1000;
  const X0 = HX - 560 * k;
  const Y0 = HY - 650 * k;
  const at = (hx, hy) => [X0 + hx * k, Y0 + hy * k];
  plane(ctx, cam, 1.0, () => {
    profile(ctx, HX, HY, HS, { heat, sweat, tears, t });
  });

  // viewfinder chrome
  plane(ctx, cam, 1.1, () => {
    brackets(ctx, 90, 330, 1260, 1290, 1, { color: 'rgba(255,255,255,0.45)', len: 60 });
    mono(ctx, 'KAMERA TERMAL', 130, 392, { size: 24, color: 'rgba(255,255,255,0.7)', track: 6 });
    const rec = Math.sin(t * 5) > 0 ? 1 : 0.3;
    ctx.save();
    ctx.globalAlpha *= rec;
    ctx.fillStyle = '#FF4A3A';
    ctx.beginPath();
    ctx.arc(1250, 382, 10, 0, TAU);
    ctx.fill();
    ctx.restore();
    mono(ctx, 'REC', 1228, 392, { size: 24, color: 'rgba(255,255,255,0.7)', align: 'right', track: 4 });
    // the temperature scale
    const sx = 130;
    const sy = 1480;
    const g = ctx.createLinearGradient(sx, 0, sx + 420, 0);
    g.addColorStop(0, '#20184A');
    g.addColorStop(0.35, '#7A2A8A');
    g.addColorStop(0.65, '#FF5A3A');
    g.addColorStop(1, '#FFF0A0');
    ctx.fillStyle = g;
    ctx.fillRect(sx, sy, 420, 14);
    mono(ctx, '30°', sx, sy + 48, { size: 22, color: 'rgba(255,255,255,0.6)', track: 2 });
    mono(ctx, '38°', sx + 420, sy + 48, { size: 22, color: 'rgba(255,255,255,0.6)', align: 'right', track: 2 });
    const maxT = 34.5 + 2.6 * heat;
    mono(ctx, `MAKS ${maxT.toFixed(1).replace('.', ',')} °C`, sx + 470, sy + 18, { size: 28, color: '#FFD27A', track: 3 });
  });

  // the three reactions, each on its word
  const rows = [
    { at: at(690, 780), y: 1120, label: 'WAJAH MEMERAH', sub: 'PEMBULUH DARAH MELEBAR', t0: tMerah },
    { at: at(610, 330), y: 640, label: 'KERINGAT', sub: 'MENDINGINKAN KULIT', t0: tKeringat },
    { at: at(712, 540), y: 880, label: 'MATA BERAIR', sub: 'MEMBILAS IRITASI', t0: tAir },
  ];
  plane(ctx, cam, 1.12, () => {
    for (const r of rows) {
      const q = eo(P(t, r.t0 - 0.25, 0.45));
      if (q <= 0.001) continue;
      const lx = 1010;
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.strokeStyle = 'rgba(255,230,200,0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(r.at[0], r.at[1]);
      ctx.lineTo(lerp(r.at[0], lx - 20, q), lerp(r.at[1], r.y, q));
      ctx.stroke();
      ctx.fillStyle = '#FFE6C8';
      ctx.beginPath();
      ctx.arc(r.at[0], r.at[1], 7, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha *= q;
      ctx.fillStyle = 'rgba(14,8,22,0.82)';
      ctx.beginPath();
      ctx.roundRect(lx - 14, r.y - 60, 420, 116, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,214,150,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      tick(ctx, lx + 34, r.y - 6, 34, P(t, r.t0, 0.35), { lw: 7, color: C.mint, a: q });
      txt(ctx, r.label, lx + 68, r.y + 4, { size: 38, font: F.fig8, color: C.bone, alpha: q, maxWidth: 330 });
      mono(ctx, r.sub, lx + 70, r.y + 40, { size: 19, color: 'rgba(255,214,170,0.8)', track: 1, a: q });
    }
  });
  chip(ctx, 'TUBUH MENGIRA SEDANG KEPANASAN', 720, 1650, eo(P(t, tAir + 0.1, 0.45)), { color: '#FFD27A', size: 30 });
}

function drawScene(ctx, t, scene) {
  const cam = shotCam(t, 0.8);
  const t1 = wordT(scene, 1, 0);
  const x = io(P(t, t1 - 0.45, 0.65));
  if (x < 1) {
    ctx.save();
    const k = 1 + 0.5 * x;
    ctx.translate(720, 820);
    ctx.scale(k, k);
    ctx.translate(-720, -820);
    alarm(ctx, t, scene, cam);
    ctx.restore();
  }
  layer(ctx, x, (c) => {
    c.save();
    const k = 0.9 + 0.1 * x;
    c.translate(720, 1000);
    c.scale(k, k);
    c.translate(-720, -1000);
    thermal(c, t, scene, cam);
    c.restore();
  });
}

export default { draw: drawScene };
