import { F } from '../engine/fonts.mjs';
import { clamp, lerp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, dimension } from './_bulan.mjs';
import { vessel, vesselFront, drawCell, markers, glow } from './_darah.mjs';
import {
  tag, ribbon, loupe, membrane, desk, slide, paperCard, rays, grade, labText, inkStamp,
} from './_lab.mjs';

// 02 — PENANDA
// Card 0: one red cell, close. On "penanda" a magnifier slides over its edge:
// inside it the membrane, its double layer of lipids and the antigens standing
// on it — protein stalks with chains of sugar. A banner names them; a
// dimension line gives the cell's size.
// Card 1: cut to a desk under a lamp, 1901. Three glass slides land, A, B, O,
// each on its letter; Landsteiner's card slides in and the year rolls to 1901.
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.8);
  const tPen = wordT(scene, 0, 4);
  const tKecil = wordT(scene, 0, 5);
  const tPerm = wordT(scene, 0, 7);
  const tSel = wordT(scene, 0, 8);
  const t1 = wordT(scene, 1, 0);
  const tAs = [wordT(scene, 1, 1), wordT(scene, 1, 2), wordT(scene, 1, 3)];
  const tDit = wordT(scene, 1, 4);
  const tTahun = wordT(scene, 1, 5);
  const tSeribu = wordT(scene, 1, 6);
  const tSatu = wordT(scene, 1, 9);
  const flow = [-0.14, -0.42];
  const pX = io(P(t, t1 - 0.4, 0.6));

  /* ------------------------------- card 0 -------------------------------- */
  if (pX < 0.999) {
    vessel(ctx, t, cam, { seed: 2, flow, dark: 0.08 });
    grade(ctx, { tint: '#FF6A3D', k: 0.12 });
    const cx = 700 + Math.sin(t * 0.45) * 10;
    const cy = 1060 + Math.cos(t * 0.5) * 8;
    const d = 760 * (1 + 0.1 * pX);
    const tilt = 26;
    const rot = -0.35 + t * 0.045;
    plane(ctx, cam, 1.0, () => {
      glow(ctx, cx, cy, d * 2.2, '255,120,90', 0.22);
      drawCell(ctx, cx, cy, d, { hero: true, tilt, rot });
      markers(ctx, cx, cy, d, {
        kinds: ['X', 'X', 'A', 'D', 'X', 'B'], n: 34, p: P(t, tPen - 0.15, 1.5), t, tilt, rot, seed: 21,
        face: 0.7, len: 0.07,
      });
    });
    vesselFront(ctx, t, cam, { seed: 2, flow, a: 0.5 });
    // the magnifier and what it sees
    const pL = P(t, tPen - 0.12, 0.7);
    const lx = lerp(1700, 960, eo(pL)) + Math.sin(t * 0.8) * 6;
    const ly = lerp(960, 790, eo(pL)) + Math.cos(t * 0.7) * 6;
    loupe(ctx, lx, ly, 250, pL, (c) => {
      c.fillStyle = '#2A0610';
      c.fillRect(lx - 260, ly - 260, 520, 520);
      membrane(c, lx - 300, ly + 430, 520, -1.5, -0.4, t, {
        kinds: ['A', 'X', 'D', 'B', 'X', 'H'], p: P(t, tPen + 0.05, 1.3), n: 8, seed: 3,
      });
    }, { zoom: 1, handle: 0.75 });
    ribbon(ctx, 1110, 1140, 'ANTIGEN', P(t, tKecil - 0.05, 0.5), { size: 38, rot: -0.04 });
    labText(ctx, 'protein + rantai gula', 1110, 1226, {
      size: 32, font: F.sub, color: 'rgba(255,236,214,0.85)', align: 'center', alpha: eo(P(t, tKecil + 0.25, 0.5)),
    });
    dimension(ctx, 330, 1560, 1070, 1560, P(t, tSel - 0.1, 0.8), { label: '± 7,5 µm · SEL DARAH MERAH', size: 30, a: 1 });
    // the magnifier grows a ring of light as it lands
    if (pL > 0 && pL < 1) glow(ctx, lx, ly, 600, '255,220,180', 0.12 * Math.sin(pL * Math.PI));
    void tPerm;
  }

  /* ------------------------------- card 1 -------------------------------- */
  if (pX > 0.001) {
    ctx.save();
    ctx.globalAlpha *= pX;
    desk(ctx, t, cam, { tone: 'wood', lamp: [720, 1020], lampR: 1250 });
    rays(ctx, 720, 300, { t, rgb: '255,214,160', a: 0.06, n: 6, len: 1900, spread: 0.5, seed: 5 });
    plane(ctx, cam, 0.7, () => {
      const SL = [[700, 560, -0.06], [740, 730, 0.03], [690, 900, -0.02]];
      ['A', 'B', 'O'].forEach((s, i) => {
        const [x, y, r] = SL[i];
        slide(ctx, x, y, 820, 150, P(t, tAs[i] - 0.14, 0.45), { label: s, rot: r, t, seed: i + 1, drop: eo(P(t, tAs[i] + 0.1, 0.4)) });
      });
      paperCard(ctx, 720, 1440, 920, 330, P(t, tDit - 0.1, 0.6), {
        rot: -0.03, lines: [
          { s: 'WINA, 1901', size: 52, y: 78, font: F.mono6 },
          { s: 'KARL LANDSTEINER', y: 156, size: 38 },
          { s: 'golongan  A · B · C (kini O)', y: 222, size: 34 },
        ],
      });
      inkStamp(ctx, 'NOBEL 1930', 1000, 1565, P(t, tSatu + 0.45, 0.4), { size: 44, rot: -0.12, color: '#B8281E' });
    });
    const val = (tt) => 1890 + 11 * io(P(tt, tSeribu - 0.1, tSatu + 0.35 - tSeribu + 0.1));
    tag(ctx, 720, 1130, P(t, tTahun - 0.1, 0.5), {
      count: { value: val(t), prev: val(t - 1 / 90), digits: 4 }, color: '#FFD08A', size: 150, glowRgb: '255,190,110',
    });
    ctx.restore();
  }
}

export default { draw: drawScene };
