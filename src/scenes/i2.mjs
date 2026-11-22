import { KT, roomBG, wallTags, globeWire, mercatorLattice, mapFrame, drawCoast, drawDots, proj, ID_ISLANDS, ID_DOTS, trueSizeMove, caliper, overlayCompare, areaDuel, equatorBeam, islandMatrix, coastRibbon, zoneDials, sunSweep, voteTally, projectionMorph, compassRose, lonProtractor, panel, heading, chip, counter, coordCursor, gridFlash, routePass, sheetTurn, holoScan, vignette, flareProj, commentCard, tissotRow, cityMark, spanStack, distanceArc, cue, cueEnd, P, eo, e3, io, sm, keys, frameOn, label, textW, drawOn, spline, sampleSpline, polyPath, bake, rng, clamp, lerp, TAU, F, hatch, snow, rgba, W, H, grain, back, odo, idn, pulse, rr } from './atlas.mjs';

export default {
  draw(ctx, t, scene, env) {
    const cam = keys(t, [
      [0, 720, 1150, 1.06], [scene.dur * 0.5, 720, 1090, 1.02], [scene.dur, 720, 1035, 1.0],
    ]);
    ctx.save();
    frameOn(ctx, cam);
    roomBG(ctx, t);
    wallTags(ctx, t, { p: 0.5 });
    mapFrame(ctx, 120, 620, 1200, 900, t, { title: 'NOVA ET AUCTA · 1569', p: P(t, 0.3, 1.0) });
    mercatorLattice(ctx, 150, 650, 1020, 840, t, { p: P(t, 0.6, 1.2), k: eo(P(t, 1.2, 2.2)) });
    heading(ctx, 'PROYEKSI', 'MERCATOR', 110, 430, { kicker: 'PELAUT BERLAYAR LURUS', p: P(t, 0.4, 1.0), size: 120 });
    compassRose(ctx, 1230, 1700, 90, t, { p: P(t, 2.4, 0.9) });
    chip(ctx, 'BUMI → PERSEGI PANJANG', 480, 1700, { p: P(t, 2.0, 0.9), color: KT.coral });
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
