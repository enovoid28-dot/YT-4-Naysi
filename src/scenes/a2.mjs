import { CY, cue, cueEnd, P, eo, e3, io, sm, paper, plateFrame, heading, label, leader, swipe, numCells, idNum, place, inset, scaleBar, drawOn, arrowHead, rng, clamp, lerp, TAU, F } from './_cyano.mjs';
import { denticleSprite, treeSprite } from './_fauna.mjs';
import { stratColumn } from './_chart.mjs';

// 02 — BUKTI FOSIL
// "Bukti hiu tertua: sisik": a microscope field full of placoid scales, the
// age counting up to 450 million years as it is spoken. On "Pohon" the lens
// collapses into a marker on a stratigraphic column (Ordovician, Silurian,
// Devonian in ICS colours); the first tree pins at 385, and "Selisihnya"
// draws the bracket between them: 65 million years.

const MIC = { x: 720, y: 1080, r: 380 };
const COL = { x: 120, w: 140, yTop: 640, yBot: 1700, maTop: 370, maBot: 470 };
const MK = 1236;

let FIELD = null;
function field() {
  if (FIELD) return FIELD;
  const R = rng(31);
  const list = [];
  for (let row = 0; row < 10; row++) {
    const y = 690 + row * 88;
    for (let col = 0; col < 7; col++) {
      const x = 380 + col * 128 + (row % 2) * 64 + (R() - 0.5) * 16;
      list.push({ x, y: y + (R() - 0.5) * 12, r: (R() - 0.5) * 0.16, k: 0.15 + R() * 0.02 });
    }
  }
  // posterior tips overlap the next scale: draw from the right
  list.sort((a, b) => b.x - a.x);
  FIELD = list;
  return list;
}

function micro(c, t, focus) {
  const sp = denticleSprite(0.18);
  const list = field();
  c.save();
  // backlit stage
  const g = c.createRadialGradient(MIC.x, MIC.y, 40, MIC.x, MIC.y, MIC.r);
  g.addColorStop(0, 'rgba(70,120,180,0.55)');
  g.addColorStop(1, 'rgba(10,30,70,0.2)');
  c.fillStyle = g;
  c.fillRect(MIC.x - MIC.r, MIC.y - MIC.r, MIC.r * 2, MIC.r * 2);
  const off = 16 * (1 - focus);
  for (const pass of off > 0.5 ? [-1, 1] : [0]) {
    c.globalAlpha = off > 0.5 ? 0.55 : 1;
    for (const d of list) {
      const drift = Math.sin(t * 0.3 + d.x * 0.01) * 2;
      place(c, sp, d.x + pass * off + drift, d.y + pass * off * 0.4, d.k, { rot: d.r });
    }
  }
  c.globalAlpha = 1;
  // reticle
  c.strokeStyle = CY.paper;
  c.lineWidth = 1.4;
  c.globalAlpha = 0.5;
  c.beginPath();
  c.moveTo(MIC.x - MIC.r, MIC.y);
  c.lineTo(MIC.x + MIC.r, MIC.y);
  c.moveTo(MIC.x, MIC.y - MIC.r);
  c.lineTo(MIC.x, MIC.y + MIC.r);
  c.stroke();
  for (let i = -10; i <= 10; i++) {
    const l = i % 5 === 0 ? 18 : 9;
    c.beginPath();
    c.moveTo(MIC.x + i * 26, MIC.y - l);
    c.lineTo(MIC.x + i * 26, MIC.y + l);
    c.stroke();
  }
  c.globalAlpha = 1;
  // the lens edge darkens
  const v = c.createRadialGradient(MIC.x, MIC.y, MIC.r * 0.62, MIC.x, MIC.y, MIC.r);
  v.addColorStop(0, 'rgba(3,10,28,0)');
  v.addColorStop(1, 'rgba(3,10,28,0.78)');
  c.fillStyle = v;
  c.fillRect(MIC.x - MIC.r, MIC.y - MIC.r, MIC.r * 2, MIC.r * 2);
  c.restore();
}

export default {
  draw(ctx, t, scene, env) {
    const tSisik = cue(scene, 'sisik');
    const tEmpat = cue(scene, 'empat');
    const tJuta = cue(scene, 'juta');
    const tPohon = cue(scene, 'pohon');
    const tTiga = cue(scene, 'tiga');
    const tJuta2 = cue(scene, 'juta', 1);
    const tSel = cue(scene, 'selisihnya');
    const tEnam = cue(scene, 'enam');
    const tJuta3 = cue(scene, 'juta', 2);
    const tRatus = cue(scene, 'ratus');
    const tLima = cue(scene, 'lima');
    const tPuluh = cue(scene, 'puluh');
    const tPuluh3 = cue(scene, 'puluh', 2);
    const tLima3 = cue(scene, 'lima', 2);

    paper(ctx, env.cam, { kind: 'chart' });
    plateFrame(ctx, {});
    heading(ctx, t, { kicker: 'PL. II  ·  BUKTI FOSIL', lines: ['Bukti tertua:', '*sisik* sekecil pasir'], y: 420, size: 118, t0: -0.4 });

    // the lens collapses into the 450 marker on the column
    const k = io(P(t, tPohon - 0.55, 0.8));
    const y450 = COL.yBot - ((COL.maBot - 450) / (COL.maBot - COL.maTop)) * (COL.yBot - COL.yTop);
    const y385 = COL.yBot - ((COL.maBot - 385) / (COL.maBot - COL.maTop)) * (COL.yBot - COL.yTop);
    const cx = lerp(MIC.x, MK, k);
    const cy = lerp(MIC.y, y450, k);
    const r = lerp(MIC.r, 52, k);

    // column grows in behind
    const pc = P(t, tPohon - 0.3, 1.1, e3);
    stratColumn(ctx, { ...COL, p: pc, a: 1 });

    // dashed age lines from the column to the markers
    const dash450 = P(t, tPohon + 0.2, 0.6);
    drawOn(ctx, [[440, y450], [MK - 60, y450]], dash450, { lw: 2, dash: [8, 8], a: 0.7 });

    // the microscope (full size first, a marker later)
    const focus = e3(P(t, 0.0, 0.7));
    inset(ctx, cx, cy, r, P(t, -0.4, 0.5), (c) => {
      c.save();
      c.translate(cx, cy);
      c.scale(r / MIC.r, r / MIC.r);
      c.translate(-MIC.x, -MIC.y);
      micro(c, t, focus);
      c.restore();
    });
    if (k < 0.99) {
      const a = 1 - k;
      ctx.save();
      ctx.globalAlpha = a;
      scaleBar(ctx, MIC.x + 120, MIC.y + MIC.r - 70, 180, '0,5 mm', { p: P(t, 0.3, 0.6) });
      label(ctx, 'SISIK HIU · DI BAWAH MIKROSKOP', MIC.x, MIC.y + MIC.r + 58, { size: 28, align: 'center', track: 4, p: P(t, tSisik - 0.2, 0.6) });
      // 0 -> 450 as it is spoken
      // the count follows the words: "empat ratus" -> 400, "lima puluh" -> 450
      const n = 400 * P(t, tEmpat - 0.05, Math.max(0.25, tRatus + 0.25 - tEmpat), (x) => x) + 50 * P(t, tLima - 0.05, Math.max(0.25, tPuluh + 0.25 - tLima), (x) => x);
      if (t > tEmpat - 0.1) {
        numCells(ctx, `${Math.round(n)}`, MIC.x - 40, MIC.y + MIC.r + 270, { size: 200, align: 'right', color: CY.amber });
        label(ctx, 'juta', MIC.x - 10, MIC.y + MIC.r + 190, { size: 64, font: F.italic, track: 0, p: P(t, tJuta - 0.1, 0.4) });
        label(ctx, 'tahun', MIC.x - 10, MIC.y + MIC.r + 262, { size: 64, font: F.italic, track: 0, p: P(t, tJuta + 0.1, 0.4) });
      }
      ctx.restore();
    }

    // marker labels
    const pl = P(t, tPohon + 0.3, 0.6);
    label(ctx, 'SISIK HIU TERTUA', 470, y450 - 22, { size: 32, track: 4, p: pl });
    label(ctx, '± 450 juta tahun · Colorado, AS', 470, y450 + 50, { size: 32, font: F.italic, track: 0, color: CY.light, p: P(t, tPohon + 0.45, 0.6) });

    // the first tree at 385
    const pt = P(t, tTiga - 0.35, 0.6);
    drawOn(ctx, [[440, y385], [MK - 90, y385]], pt, { lw: 2, dash: [8, 8], a: 0.7 });
    if (pt > 0.01) {
      const tree = treeSprite(0.9, 3);
      const kk = 0.31 * eo(pt);
      ctx.save();
      ctx.globalAlpha = eo(pt);
      ctx.drawImage(tree, MK - (tree.width * kk) / 2, y385 + 26 - tree.height * kk, tree.width * kk, tree.height * kk);
      ctx.restore();
    }
    label(ctx, 'POHON PERTAMA', 470, y385 - 22, { size: 32, track: 4, p: P(t, tTiga - 0.2, 0.6) });
    label(ctx, '± 385 juta tahun · Wattieza', 470, y385 + 50, { size: 32, font: F.italic, track: 0, color: CY.light, p: P(t, tTiga, 0.6) });

    // the gap: bracket + 65
    const pb = P(t, tSel - 0.2, 0.7, eo);
    if (pb > 0.01) {
      const bx = 430;
      const ya = lerp((y385 + y450) / 2, y385 + 18, pb);
      const yb = lerp((y385 + y450) / 2, y450 - 18, pb);
      ctx.save();
      ctx.strokeStyle = CY.amber;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx, ya);
      ctx.lineTo(bx, yb);
      ctx.stroke();
      ctx.restore();
      arrowHead(ctx, bx, ya - 4, -Math.PI / 2, { s: 22, color: CY.amber });
      arrowHead(ctx, bx, yb + 4, Math.PI / 2, { s: 22, color: CY.amber });
      const n = 60 * P(t, tEnam - 0.05, Math.max(0.25, tPuluh3 + 0.25 - tEnam), (x) => x) + 5 * P(t, tLima3 - 0.05, 0.3, (x) => x);
      const ym = (y385 + y450) / 2;
      if (t > tEnam - 0.1) numCells(ctx, `${Math.round(n)}`, 720, ym + 80, { size: 300, align: 'center', color: CY.amber });
      label(ctx, 'juta tahun', 720, ym + 170, { size: 70, align: 'center', font: F.italic, track: 0, p: P(t, tJuta3 - 0.1, 0.5) });
      label(ctx, '≈ jarak kita dari dinosaurus', 720, ym + 240, { size: 36, align: 'center', font: F.italic, track: 0, color: CY.light, p: P(t, tJuta3 + 0.5, 0.6) });
    }
    void tJuta2;
    void sm;
    void leader;
    void swipe;
    void idNum;
    void TAU;
    void clamp;
  },
};
