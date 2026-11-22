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
    globeWire(ctx, 720, 1150, 430, t, { p: P(t, 0.3, 1.2) });
    flareProj(ctx, 720, 700, t, { p: P(t, 1.2, 0.8) });
    heading(ctx, 'LEBIH', 'LEBAR', 110, 430, { kicker: 'PETA DUNIA BOHONG', sub: 'INDONESIA vs AMERIKA SERIKAT', p: P(t, 0.4, 1.0), size: 150 });
    chip(ctx, '5.100 KM vs 4.500 KM', 720, 1660, { p: P(t, 2.0, 0.9), color: KT.amber });
    label(ctx, 'SABANG → MERAUKE · SATU BENTANG', 720, 1730, { size: 24, color: KT.iceDim, align: 'center', track: 4, p: P(t, 2.6, 0.9) });
    ctx.restore();
    holoScan(ctx, t);
    vignette(ctx);
    gridFlash(ctx, t, 0, 0.22);
  },
};
