import { CY, cue, P, eo, e3, io, sm, paper, plateFrame, heading, label, leader, swim, snow, shafts, hatch, drawOn, numCells, arrowHead, clamp, lerp, TAU, F } from './_cyano.mjs';
import { greenlandSprite, shipSprite, human } from './_fauna.mjs';

// 06 — HIU GREENLAND
// Deep Arctic water: Somniosus microcephalus cruising slowly across the
// plate, the copepod on its eye tagged. "Yang tertua" brings in a time axis
// (1500-2030): the 2016 eye-lens measurement, the life bar running back to
// its birth around the 1620s with the honest +-120 year whisker, a human
// lifetime for scale, and "zaman VOC" lays the VOC years (1602-1799) under
// it with an East Indiaman.

const AX = { x0: 120, x1: 1320, y: 1560, y0: 1500, y1: 2030 };
const YX = (yr) => AX.x0 + ((yr - AX.y0) / (AX.y1 - AX.y0)) * (AX.x1 - AX.x0);
const MEASURED = 2016;
const AGE = 392;
const BORN = MEASURED - AGE; // ~1624

export default {
  draw(ctx, t, scene, env) {
    const tBerabad = cue(scene, 'berabad-abad');
    const tYang = cue(scene, 'yang');
    const tDiperk = cue(scene, 'diperkirakan');
    const tBerumur = cue(scene, 'berumur');
    const tEmpat = cue(scene, 'empat');
    const tLahir = cue(scene, 'lahir');
    const tZaman = cue(scene, 'zaman');
    const tVoc = cue(scene, 'voc');

    paper(ctx, env.cam, { kind: 'deep' });
    shafts(ctx, t, { x: 860, y: 180, len: 1300, n: 6, spread: 900, a: 0.05 });
    snow(ctx, t, { x0: 46, x1: 1394, y0: 200, y1: 1800, n: 120, a: 0.5, drift: 0.6 });
    plateFrame(ctx, {});
    const hA = 1 - P(t, tEmpat - 0.5, 0.3);
    heading(ctx, t, { kicker: 'PL. VI  ·  HIU GREENLAND', lines: ['Hidup', '*berabad-abad*'], y: 410, size: 124, t0: -0.4, a: hA });
    label(ctx, 'Somniosus microcephalus', 1336, 300, { size: 36, align: 'right', font: F.italic6, track: 0, color: CY.white, p: P(t, 0.4, 0.6) });
    label(ctx, 'ATLANTIK UTARA & ARKTIK', 1336, 340, { size: 22, align: 'right', track: 3, p: P(t, 0.6, 0.6) });

    // the shark: slow, heavy, the parasite trailing from its eye
    const sp = greenlandSprite(1.6);
    const sx = lerp(600, 760, sm(clamp(t / scene.dur)));
    const sy = 960 + Math.sin(t * 0.5) * 10;
    const k = 1.12;
    swim(ctx, sp, sx, sy, k, t, { ux: 500, uy: 0, amp: 0.016, hz: 0.42 });
    const eyeX = sx + (950 - 500) * k;
    const eyeY = sy - 26 * k;
    const pe = P(t, 1.0, 0.5) * (1 - P(t, tYang - 0.2, 0.4));
    if (pe > 0.001) {
      leader(ctx, eyeX - 40, eyeY + 20, 1180, 1220, pe);
      label(ctx, 'KOPEPODA PARASIT', 1180, 1254, { size: 24, align: 'center', track: 3, p: pe });
      label(ctx, 'menempel di matanya', 1180, 1290, { size: 26, align: 'center', font: F.italic, track: 0, color: CY.light, p: pe });
      leader(ctx, sx - 200, sy + 40, 330, 1240, pe);
      label(ctx, 'PANJANG BISA > 5 M', 330, 1274, { size: 24, align: 'center', track: 3, p: pe });
      label(ctx, 'berenang ± 1 km/jam', 330, 1310, { size: 26, align: 'center', font: F.italic, track: 0, color: CY.light, p: pe });
    }

    /* ---------------------------- time axis ----------------------------- */
    const pa = P(t, tYang - 0.25, 0.7);
    if (pa > 0.001) {
      drawOn(ctx, [[AX.x0, AX.y], [AX.x1, AX.y]], pa, { lw: 2.6 });
      for (let yr = 1500; yr <= 2000; yr += 50) {
        const x = YX(yr);
        const major = yr % 100 === 0;
        const q = P(t, tYang - 0.2 + (yr - 1500) / 1500, 0.4);
        ctx.save();
        ctx.strokeStyle = CY.paper;
        ctx.globalAlpha = q * (major ? 1 : 0.6);
        ctx.lineWidth = major ? 2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(x, AX.y);
        ctx.lineTo(x, AX.y + (major ? 22 : 12));
        ctx.stroke();
        ctx.restore();
        if (major) label(ctx, `${yr}`, x, AX.y + 58, { size: 26, align: 'center', track: 1, p: q });
      }
    }

    // the VOC years, a band the ship sails on
    const BAND = 160;
    const pv = P(t, tLahir - 0.1, 0.6, eo);
    if (pv > 0.001) {
      const xa = YX(1602);
      const xb = lerp(xa, YX(1799), pv);
      ctx.save();
      ctx.fillStyle = 'rgba(255,188,66,0.13)';
      ctx.fillRect(xa, AX.y - BAND, xb - xa, BAND);
      ctx.beginPath();
      ctx.rect(xa, AX.y - BAND, xb - xa, BAND);
      ctx.clip();
      hatch(ctx, xa, AX.y - BAND, YX(1799), AX.y, { angle: -0.8, step: 12, lw: 1.3, color: CY.amber, a: 0.32 });
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = CY.amber;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(xa, AX.y - BAND);
      ctx.lineTo(xb, AX.y - BAND);
      ctx.moveTo(xa, AX.y - BAND);
      ctx.lineTo(xa, AX.y);
      ctx.moveTo(xb, AX.y - BAND);
      ctx.lineTo(xb, AX.y);
      ctx.stroke();
      ctx.restore();
      const cxv = (xa + YX(1799)) / 2;
      label(ctx, 'ZAMAN VOC', cxv, AX.y - BAND + 44, { size: 30, align: 'center', track: 6, color: CY.amber, p: P(t, tZaman - 0.1, 0.5) });
      label(ctx, '1602 – 1799', cxv, AX.y - BAND + 78, { size: 24, align: 'center', track: 2, color: CY.amber, p: P(t, tZaman + 0.05, 0.5) });
      // an East Indiaman sails in on "VOC"
      const ps = P(t, tVoc - 0.35, 0.7, e3);
      if (ps > 0.001) {
        const ship = shipSprite(0.4);
        const sc = 0.6;
        const shx = lerp(YX(1650), YX(1712), ps);
        const bob = Math.sin(t * 2.2) * 3;
        ctx.save();
        ctx.globalAlpha = ps;
        ctx.translate(shx, AX.y - BAND + bob);
        ctx.rotate(Math.sin(t * 1.7) * 0.02);
        ctx.drawImage(ship, -ship.width * sc * 0.49, -ship.height * sc * 0.83, ship.width * sc, ship.height * sc);
        ctx.restore();
      }
    }

    // the life bar, measured back from 2016, with the estimate's 95% range
    const yB = AX.y - 30;
    const pl = P(t, tBerumur - 0.1, 1.3, io);
    if (pl > 0.001) {
      const xe = YX(MEASURED);
      const xs = lerp(xe, YX(BORN), pl);
      ctx.save();
      ctx.fillStyle = CY.white;
      ctx.fillRect(xs, yB - 13, xe - xs, 26);
      ctx.strokeStyle = CY.white;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xe, yB - 36);
      ctx.lineTo(xe, AX.y);
      ctx.stroke();
      ctx.restore();
      label(ctx, '2016 · DIUKUR', xe, yB - 48, { size: 22, align: 'center', track: 2, p: P(t, tBerumur, 0.4) });
    }
    const pw = P(t, tDiperk + 0.9, 0.6);
    if (pw > 0.001 && pl > 0.95) {
      const xm = YX(BORN);
      const xa = lerp(xm, YX(MEASURED - 512), pw);
      const xb = lerp(xm, YX(MEASURED - 272), pw);
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = CY.white;
      ctx.beginPath();
      ctx.moveTo(xa, yB);
      ctx.lineTo(xm, yB);
      ctx.moveTo(xa, yB - 12);
      ctx.lineTo(xa, yB + 12);
      ctx.stroke();
      ctx.strokeStyle = CY.deep;
      ctx.beginPath();
      ctx.moveTo(xm, yB);
      ctx.lineTo(xb, yB);
      ctx.moveTo(xb, yB - 9);
      ctx.lineTo(xb, yB + 9);
      ctx.stroke();
      ctx.restore();
    }
    if (pl > 0.98) {
      const pb = P(t, tLahir - 0.15, 0.4);
      ctx.save();
      ctx.strokeStyle = CY.white;
      ctx.globalAlpha = pb;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(YX(BORN), yB + 14);
      ctx.lineTo(YX(BORN), AX.y + 70);
      ctx.stroke();
      ctx.restore();
      label(ctx, `LAHIR ± ${BORN}`, YX(BORN) + 12, AX.y + 104, { size: 24, align: 'left', track: 2, color: CY.white, p: pb });
    }

    // a human lifetime for scale, under the axis
    const ph = P(t, tEmpat + 0.3, 0.6, eo);
    if (ph > 0.001) {
      const yH = AX.y + 120;
      const hx0 = YX(MEASURED - 72 * ph);
      ctx.save();
      ctx.fillStyle = CY.amber;
      ctx.fillRect(hx0, yH - 9, YX(MEASURED) - hx0, 18);
      ctx.restore();
      human(ctx, hx0 - 26, yH + 20, 56, { a: ph, color: CY.amber });
      label(ctx, 'UMUR MANUSIA ± 72 TH', hx0 - 56, yH + 9, { size: 22, align: 'right', track: 2, color: CY.amber, p: ph });
    }

    // the number replaces the title: about four hundred years
    const pn = P(t, tEmpat - 0.2, 0.5, eo);
    if (pn > 0.001) {
      const wN = numCells(ctx, '±400', 100, 560, { size: 250, color: CY.amber, a: pn });
      label(ctx, 'tahun', 100 + wN + 24, 560, { size: 70, font: F.italic, track: 0, p: P(t, tEmpat + 0.35, 0.5) });
      label(ctx, 'umur hiu tertua · lensa mata, karbon-14 · 392 ± 120 th', 104, 616, { size: 22, track: 1, a: 0.85, p: P(t, tEmpat + 0.6, 0.5) });
    }
    void tBerabad;
    void arrowHead;
    void TAU;
  },
};
