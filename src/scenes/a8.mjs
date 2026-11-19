import { CY, cue, P, eo, e3, io, paper, plateFrame, heading, label, numCells, idNum, clamp, lerp, TAU, F } from './_cyano.mjs';
import { bar, mapSprite } from './_chart.mjs';

// 08 — INDONESIA
// The top five shark-catching nations (TRAFFIC 2019, mean reported catch
// 2007-2017, tonnes a year) as engraved ranked bars, number one held back as
// a dashed blank until "Indonesia" fills it and the real coastline (Natural
// Earth) prints in underneath. Then the question, and the comment prompt.

const ROWS = [
  ['INDONESIA', 110737],
  ['SPANYOL', 78443],
  ['INDIA', 67391],
  ['MEKSIKO', 39992],
  ['AMERIKA SERIKAT', 37389],
];
const BX = 520;
const BW = 790; // 110 737 t
const MAXT = 110737;
const RY = (i) => 668 + i * 100;
const BH = 54;
const MAP = { x: 100, y: 1236 };

export default {
  draw(ctx, t, scene, env) {
    const tNegara = cue(scene, 'negara');
    const tTerbesar = cue(scene, 'terbesar');
    const tAdalah = cue(scene, 'adalah');
    const tIndo = cue(scene, 'indonesia');
    const tMenurut = cue(scene, 'menurutmu');
    const tDilind = cue(scene, 'dilindungi');
    const tTulis = cue(scene, 'tulis');

    paper(ctx, env.cam, { kind: 'chart' });
    plateFrame(ctx, {});
    const h1 = 1 - P(t, tMenurut - 0.35, 0.3);
    heading(ctx, t, { kicker: 'PL. VIII  ·  TANGKAPAN HIU DUNIA', lines: ['Penangkap hiu', '*terbesar* di dunia'], y: 410, size: 118, t0: -0.4, a: h1 });
    const h2 = P(t, tMenurut - 0.2, 0.2);
    heading(ctx, t, { kicker: 'PL. VIII  ·  PERTANYAAN', lines: ['Menurutmu, hiu', 'perlu *dilindungi*?'], y: 410, size: 118, t0: tMenurut - 0.15, a: h2 });

    const dim = 1 - 0.55 * P(t, tMenurut, 0.6);

    // scale: 0, 50 000, 100 000 t
    ctx.save();
    ctx.globalAlpha = dim;
    ctx.strokeStyle = CY.paper;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 8]);
    for (const v of [0, 50000, 100000]) {
      const x = BX + (v / MAXT) * BW;
      ctx.globalAlpha = dim * (v ? 0.4 : 0.8);
      ctx.beginPath();
      ctx.moveTo(x, RY(0) - 24);
      ctx.lineTo(x, RY(4) + BH + 16);
      ctx.stroke();
    }
    ctx.restore();
    for (const v of [0, 50000, 100000]) {
      label(ctx, v ? `${idNum(v)} t` : '0', BX + (v / MAXT) * BW, RY(4) + BH + 50, { size: 22, align: 'center', track: 1, a: 0.8 * dim * P(t, 0.4, 0.5) });
    }

    // the bars: five to two first, the winner held back
    ROWS.forEach(([name, tons], i) => {
      const y = RY(i);
      const first = i === 0;
      const t0 = first ? tIndo - 0.25 : 0.2 + (4 - i) * 0.32;
      const p = P(t, t0, first ? 0.9 : 0.8, (x) => x);
      const w = (tons / MAXT) * BW;
      ctx.save();
      ctx.globalAlpha = dim;
      // rank numeral
      ctx.font = `52px ${F.serif}`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = first && t > tIndo - 0.2 ? CY.amber : CY.white;
      ctx.globalAlpha = dim * P(t, 0.1 + (4 - i) * 0.08, 0.4);
      ctx.fillText(String(i + 1), 104, y + BH - 6);
      ctx.restore();
      if (first && t < tIndo - 0.1) {
        // the blank: a dashed outline and a question mark
        const q = P(t, tAdalah - 0.6, 0.5);
        ctx.save();
        ctx.globalAlpha = q * dim;
        ctx.strokeStyle = CY.amber;
        ctx.lineWidth = 2.4;
        ctx.setLineDash([10, 8]);
        ctx.strokeRect(BX, y, BW, BH);
        ctx.restore();
        label(ctx, '?', 168, y + BH - 8, { size: 48, font: F.serif, track: 0, color: CY.amber, a: q * dim });
        return;
      }
      const ww = bar(ctx, BX, y, w, BH, p, { color: first ? CY.amber : CY.paper, fillA: first ? 0.55 : 0.16, hatchA: first ? 0.45 : 0.5, a: dim, seed: i + 2 });
      label(ctx, name, 168, y + BH - 16, { size: first ? 32 : 28, track: 3, color: first ? CY.amber : CY.paper, p: P(t, t0 - 0.1, 0.4), a: dim });
      const n = tons * e3(clamp(p * 1.3));
      if (first) numCells(ctx, idNum(n), BX + ww - 16, y + BH - 12, { size: 40, align: 'right', color: CY.deep, a: dim * P(t, t0 + 0.2, 0.3), font: F.serif });
      else label(ctx, idNum(n), BX + ww + 16, y + BH - 16, { size: 26, track: 1, a: dim * P(t, t0 + 0.1, 0.3) });
    });
    label(ctx, 'ton per tahun · rata-rata 2007–2017 · TRAFFIC 2019', BX, RY(4) + BH + 92, { size: 24, font: F.italic, track: 0, color: CY.light, a: dim * P(t, 1.0, 0.6) });

    // Indonesia prints in underneath
    const pm = P(t, tIndo - 0.2, 1.0, io);
    if (pm > 0.001) {
      const m = mapSprite({ w: 1240 });
      ctx.save();
      ctx.beginPath();
      ctx.rect(MAP.x - 20, MAP.y - 20, (m.w + 40) * pm, m.h + 40);
      ctx.clip();
      ctx.drawImage(m.cv, MAP.x, MAP.y, m.w, m.h);
      ctx.restore();
      label(ctx, '200+ JENIS HIU & PARI DI PERAIRAN INDONESIA', MAP.x + m.w, MAP.y + m.h + 40, { size: 22, align: 'right', track: 2, a: 0.9, p: P(t, tIndo + 0.6, 0.6) });
    }

    // the prompt
    const pc = P(t, tTulis - 0.15, 0.4);
    if (pc > 0.001) {
      const s = 'TULIS DI KOMENTAR';
      const n = Math.round(s.length * clamp((t - (tTulis - 0.15)) / 0.55));
      const shown = s.slice(0, n);
      label(ctx, shown, 1336, 1300, { size: 34, align: 'right', track: 5, color: CY.amber });
      if (Math.floor(t * 2.4) % 2 === 0 || n < s.length) {
        ctx.save();
        ctx.fillStyle = CY.amber;
        ctx.fillRect(1346, 1270, 18, 36);
        ctx.restore();
      }
    }
    void tNegara;
    void tTerbesar;
    void tDilind;
    void eo;
    void lerp;
    void TAU;
  },
};
