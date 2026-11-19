import { F } from '../engine/fonts.mjs';
import { clamp, EASE } from '../engine/anim.mjs';
import { plane } from '../engine/rig.mjs';
import { shotCam } from './_layar.mjs';
import { wordT, ringBurst, reticle } from './_bulan.mjs';
import { well, glow, personIcon, tick, cross } from './_darah.mjs';
import { tag, ribbon, desk, studio, paperCard, typingCard, rays, inkStamp } from './_lab.mjs';

// 06 — GWADA
// Card 0: a desk at night. The year rolls to 2025; France's press release
// slides into the lamp light and types itself out — a new blood group system,
// the 48th; on "Gwada negatif" a violet stamp lands on it.
// Card 1: one woman, lit, among the rest. Then her blood against every donor
// on a crossmatch card: the donor wells clump one by one; only her own sample
// stays smooth — "only compatible with herself".
const P = (t, at, d) => clamp((t - at) / d);
const eo = (p) => EASE.outCubic(clamp(p));
const io = (p) => EASE.inOutQuad(clamp(p));
const VIO = '200,168,255';

function drawScene(ctx, t, scene, g = {}) {
  const cam = shotCam(t, 0.7);
  const tTahun = wordT(scene, 0, 0);
  const tLima = wordT(scene, 0, 5);
  const tPr = wordT(scene, 0, 6);
  const tGol = wordT(scene, 0, 8);
  const tBaru = wordT(scene, 0, 10);
  const tGw = wordT(scene, 0, 11);
  const tNeg = wordT(scene, 0, 12);
  const t1 = wordT(scene, 1, 0);
  const tSatu = wordT(scene, 1, 2);
  const tCocok = wordT(scene, 1, 7);
  const tSendiri = wordT(scene, 1, 10);
  const pX = io(P(t, t1 - 0.35, 0.7));

  /* ------------------------------- card 0 -------------------------------- */
  if (pX < 0.999) {
    desk(ctx, t, cam, { tone: 'slate', lamp: [720, 1100], lampR: 1300, rgb: '215,200,255' });
    rays(ctx, 720, 240, { t, rgb: '215,200,255', a: 0.05, n: 6, len: 1900, spread: 0.5, seed: 7 });
    ctx.save();
    ctx.globalAlpha *= 1 - pX;
    ctx.translate(-260 * pX, 0);
    const yr = (tt) => 2000 + 25 * io(P(tt, tTahun, tLima + 0.3 - tTahun));
    tag(ctx, 720, 480, P(t, 0.2, 0.5), {
      count: { value: yr(t), prev: yr(t - 1 / 90), digits: 4 }, color: '#E2D2FF', size: 150, glowRgb: VIO,
    });
    plane(ctx, cam, 0.8, () => {
      paperCard(ctx, 720, 1170, 1040, 700, P(t, 0.3, 0.6), {
        rot: -0.025, paper: '#F1EEE7', ruled: false, age: 0.16, flag: ['#28449C', '#F4F4F4', '#D8322E'],
        lines: [
          { s: 'SIARAN PERS · PRANCIS', y: 78, size: 28, font: F.mono6, color: 'rgba(40,32,40,0.6)', track: 3, p: P(t, tPr - 0.1, 0.5) },
          { s: 'Juni 2025', y: 128, size: 30, font: F.mono, color: 'rgba(40,32,40,0.6)', p: P(t, tLima, 0.35) },
          { s: 'GOLONGAN DARAH BARU', y: 262, size: 70, font: F.fig8, color: '#1E1820', track: 0, p: P(t, tGol - 0.1, 0.6) },
          { s: 'Sistem ke-48: PIGZ', y: 352, size: 44, font: F.sub, color: '#3A3040', track: 0, p: P(t, tBaru - 0.05, 0.45) },
          { s: 'Antigen: GWADA', y: 422, size: 44, font: F.sub, color: '#3A3040', track: 0, p: P(t, tGw - 0.1, 0.4) },
          { s: 'Ditemukan pada satu pasien dari Guadeloupe.', y: 520, size: 32, font: F.sub, color: 'rgba(40,32,40,0.7)', track: 0, p: P(t, tNeg + 0.3, 0.7) },
        ],
      });
      ribbon(ctx, 300, 1485, 'BARU', P(t, tBaru - 0.05, 0.45), { size: 40, rot: -0.08, color: '#B98CFF', dark: '#6F48C0', ink: '#1A0E2E' });
      inkStamp(ctx, 'GWADA −', 1000, 1430, P(t, tNeg - 0.1, 0.45), { color: '#6A35C8', size: 60, rot: -0.12 });
      ringBurst(ctx, 1000, 1430, P(t, tNeg + 0.08, 0.9), { r: 260, color: VIO });
    });
    void tGw;
    ctx.restore();
  }

  /* ------------------------------- card 1 -------------------------------- */
  if (pX > 0.001) {
    ctx.save();
    ctx.globalAlpha *= pX;
    studio(ctx, t, cam, { top: '#130A20', bottom: '#05030A', rgb: '170,130,255', spot: [720, 760], spotR: 1100, spotA: 0.26, seed: 6 });
    ctx.translate(260 * (1 - pX), 0);
    plane(ctx, cam, 0.85, () => {
      const pP = eo(P(t, t1, 0.6));
      const pulse = 1 + 0.05 * Math.sin(t * 4);
      rays(ctx, 720, 420, { t, rgb: VIO, a: 0.09 * pP, n: 7, len: 700, spread: 0.6, seed: 8 });
      glow(ctx, 720, 740, 460 * pulse, VIO, 0.5 * pP);
      for (let i = 0; i < 6; i++) {
        const x = 720 + (i < 3 ? -1 : 1) * (200 + (i % 3) * 140);
        personIcon(ctx, x, 910, 190, { fem: i % 2 === 1, color: 'rgba(214,230,248,0.24)', a: pP * eo(P(t, t1 + 0.1 + i * 0.05, 0.5)) });
      }
      personIcon(ctx, 720, 930, 320, { fem: true, color: '#D2B8FF', a: pP });
      ringBurst(ctx, 720, 770, P(t, tSatu - 0.05, 0.9), { r: 280, color: VIO });
      // her blood against five donors and herself
      const labels = ['DONOR 1', 'DONOR 2', 'DONOR 3', 'DONOR 4', 'DONOR 5', 'DIRINYA'];
      const CW = 1280;
      const CH = CW * 0.46;
      const cy = 1330;
      const wx = (i) => 720 - CW / 2 + (CW / 6) * (i + 0.5);
      const wy = cy - CH / 2 + CH * 0.56;
      typingCard(ctx, 720, cy, CW, {
        p: P(t, t1 + 0.45, 0.6), t, title: 'UJI SILANG · DARAHNYA VS DONOR',
        wells: labels.map((s, i) => ({
          label: s, chip: i === 5 ? '#B98CFF' : '#C9C2B8', lit: i === 5 ? eo(P(t, tSendiri - 0.1, 0.4)) : 0, litRgb: VIO,
        })),
        well: (c, x, y, r, wl, i) => well(c, x, y, r * 0.9, {
          p: P(t, t1 + 0.7 + i * 0.1, 0.45), seed: 80 + i, t, agg: i === 5 ? 0 : eo(P(t, tCocok - 0.1 + i * 0.12, 0.7)),
        }),
      });
      for (let i = 0; i < 5; i++) cross(ctx, wx(i) + 52, wy - 52, 22, P(t, tCocok + 0.3 + i * 0.12, 0.3), { lw: 7 });
      tick(ctx, wx(5) + 54, wy - 54, 30, P(t, tSendiri - 0.05, 0.4), { color: '#5FE3C0', lw: 8 });
      reticle(ctx, wx(5), wy, 92, t, P(t, tSendiri - 0.1, 0.6), { color: VIO, spin: 0.15 });
    });
    ctx.restore();
  }
}

export default { draw: drawScene };
