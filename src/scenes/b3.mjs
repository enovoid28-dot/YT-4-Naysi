// b3 — 1942: Boring's redraw turns the dips into hard zones; textbooks copy it.
import {
  BK, desk, motion, withSheet, drawPage, greek, barsEqual, barsZones, penArrow, penCircle,
  margin, typed, P, cue, eo, clamp, F, W, H,
} from './_buku.mjs';
import { ambient, smudge } from './_buku.mjs';
import { hit } from '../engine/look.mjs';

const SX = 140, SY = 240, SW = 1160, SH = 1560;

export function draw(ctx, local, scene, o = {}) {
  if (o.layer === 'bg') { desk(ctx); return; }
  const t = local;
  const card = () => {
    drawPage(ctx, 'b3', SX, SY, SW, SH, { folio: '130', chapter: 'BAB VII · INDERA PERASA', footnote: "¹ salinan ke-4, bab VII" });
    typed(ctx, '1942', SX + SW - 130, SY + 330, { size: 150, font: F.num6, color: BK.print, track: 0, align: 'right', p: P(t, 0.3, 0.6) });
    greek(ctx, SX + 100, SY + 220, SW - 200, 2, P(t, 0.4, 0.6));

    // left: the data. right: the redraw.
    barsEqual(ctx, SX + 140, SY + 520, 380, 300, P(t, 0.5, 0.8));
    typed(ctx, 'DATA 1901', SX + 140, SY + 870, { size: 26, font: F.mono6, color: BK.print, track: 3, p: P(t, 0.9, 0.4) });
    const ar = cue(scene, 'digambar');
    penArrow(ctx, SX + 560, SY + 660, SX + 680, SY + 660, P(t, ar, 0.5), { bow: 0.05 });
    barsZones(ctx, SX + 700, SY + 520, 380, 300, P(t, ar + 0.3, 0.8));
    typed(ctx, 'GAMBAR ULANG 1942', SX + 700, SY + 870, { size: 26, font: F.mono6, color: BK.pen, track: 3, p: P(t, ar + 0.6, 0.4) });
    smudge(ctx, SX + 700, SY + 520, 360, 320, P(t, ar + 0.55, 0.5));
    penCircle(ctx, SX + 890, SY + 670, 230, 190, P(t, ar + 0.8, 0.6));
    hit(t, ar + 0.9, 0.4, 0.26);
    margin(ctx, 'salah baca!', SX + 700, SY + 960, { p: P(t, ar + 1.0, 0.6) });

    // the copying chain: book spines
    const cp = cue(scene, 'menyalinnya');
    for (let i = 0; i < 4; i++) {
      const q = P(t, cp + i * 0.22, 0.4);
      const hgt = 236 + (i % 2) * 24;
      ctx.save();
      ctx.globalAlpha *= eo(q);
      ctx.fillStyle = i % 2 ? 'rgba(44,74,102,0.5)' : 'rgba(38,34,27,0.42)';
      ctx.fillRect(SX + 160 + i * 62, SY + 1380 - hgt, 44, hgt);
      ctx.restore();
    }
    typed(ctx, 'BUKU PELAJARAN MENYALINNYA', SX + 460, SY + 1200, { size: 28, font: F.mono6, color: BK.ink, track: 2, p: P(t, cp + 0.4, 0.6) });
    typed(ctx, 'BERDEKADE-DEKADE', SX + 460, SY + 1244, { size: 28, font: F.mono6, color: BK.ink, track: 2, p: P(t, cp + 0.7, 0.6) });
    typed(ctx, 'MITOSNYA MASUK KELAS SAMPAI SEKARANG', SX + 460, SY + 1308, { size: 26, font: F.mono6, color: BK.pen, track: 2, p: P(t, cue(scene, 'mitosnya'), 0.6) });
    greek(ctx, SX + 100, SY + 1400, SW - 200, 2, P(t, 1.8, 0.8));
  };
  if (o.layer === 'card') { withSheet(ctx, motion(t, scene, o), card); ambient(ctx, t, 3); return; }
  desk(ctx);
  withSheet(ctx, motion(t, scene, o), card);
  ambient(ctx, t, 3);
}
